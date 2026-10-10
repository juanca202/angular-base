import { expect, test, type Page } from '@playwright/test';
import {
  corrupt,
  feed,
  installFakeCamera,
  sampleBytes,
  storedBytes,
  storedFiles,
  transfer,
  withPayload,
  type CameraMode,
} from './support/receive-helpers';

const resultTitle = (page: Page) =>
  page.getByRole('heading', { name: 'Resultado de la recepción' });
const notice = (page: Page, text: string | RegExp) =>
  page.getByRole('alert').filter({ hasText: text });
const finish = (page: Page) => page.getByRole('button', { name: 'Cerrar' });
/** Cierra la hoja tocando el fondo atenuado y deja ver el historial del inicio. */
const dismiss = (page: Page) => page.mouse.click(2, 2);

/** Opens the reception screen with the simulated camera and waits until it is reading. */
async function open(
  page: Page,
  mode: CameraMode = 'working',
  size?: { width: number; height: number },
) {
  if (size) {
    await page.setViewportSize(size);
  }
  await installFakeCamera(page, mode);
  await page.goto('/recibir');
  if (mode === 'working') {
    await expect(finish(page)).toBeEnabled();
  }
}

/** Reads a whole transfer and waits for the result. */
async function receive(page: Page, fragments: Uint8Array[]) {
  await feed(page, fragments);
  await expect(resultTitle(page)).toBeVisible();
}

const cameraStats = (page: Page) =>
  page.evaluate(
    () => (window as unknown as { __camera: { opened: number; stopped: number } }).__camera,
  );

test.describe('recepción: transferencia completa', () => {
  test('lee la secuencia sin fotos, verifica, guarda idéntico y libera la cámara', async ({
    page,
  }) => {
    const bytes = sampleBytes(1000);
    const fragments = await transfer('foto.png', 'image/png', bytes);
    await open(page);

    await feed(page, fragments);

    await expect(resultTitle(page)).toBeVisible();
    await expect(page.getByRole('img', { name: 'foto.png' })).toBeVisible();
    await dismiss(page);
    await expect(page.getByRole('heading', { name: 'Actividad reciente' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'foto.png', level: 3 })).toBeVisible();
    expect(await storedFiles(page)).toEqual([
      expect.objectContaining({
        name: 'foto.png',
        type: 'image/png',
        size: 1000,
        direction: 'received',
      }),
    ]);
    expect(await storedBytes(page, 'foto.png')).toEqual(Array.from(bytes));
    const camera = await cameraStats(page);
    expect(camera.opened).toBe(1);
    expect(camera.stopped).toBeGreaterThanOrEqual(1);
  });

  test('acepta fragmentos en desorden, repetidos y corruptos', async ({ page }) => {
    const bytes = sampleBytes(2000);
    const fragments = await transfer('mezcla.bin', 'application/octet-stream', bytes);
    await open(page);

    await feed(page, [
      corrupt(fragments[3]),
      fragments[2],
      fragments[2],
      fragments[4],
      fragments[0],
      fragments[0],
      fragments[3],
      fragments[1],
      fragments[5],
    ]);

    await expect(resultTitle(page)).toBeVisible();
    expect(await storedBytes(page, 'mezcla.bin')).toEqual(Array.from(bytes));
  });

  test('la barra de fragmentos muestra cuáles se recibieron y cuáles faltan', async ({ page }) => {
    const fragments = await transfer('barra.bin', '', sampleBytes(1500));
    await open(page);

    await feed(page, [fragments[0], fragments[2]]);

    const bar = page.getByRole('img', { name: 'Fragmentos recibidos' });
    await expect(bar).toBeVisible();
    await expect(page.getByText(/^\s*QR 2 de [45]\s*$/)).toBeVisible();
    // Verde en los tramos recibidos (0 y 2) y gris donde faltan.
    const paint = await bar.locator('canvas').evaluate((canvas: HTMLCanvasElement) => {
      const context = canvas.getContext('2d')!;
      const slice = canvas.width / 5;
      const at = (index: number) =>
        context.getImageData(Math.floor(slice * (index + 0.5)), 0, 1, 1).data[3];
      return [0, 1, 2, 3].map(at);
    });
    expect(paint[0]).toBeGreaterThan(0);
    expect(paint[1]).toBe(0);
    expect(paint[2]).toBeGreaterThan(0);
  });

  test('recibe un archivo transmitido comprimido y lo guarda idéntico al original', async ({
    page,
  }) => {
    const bytes = new Uint8Array(20_000).fill(9);
    const fragments = await transfer('ceros.bin', 'application/octet-stream', bytes, true);
    // Comprimido, el archivo viaja en muy pocos fragmentos frente a los 51 que ocuparía sin comprimir.
    expect(fragments.length).toBeLessThan(10);
    await open(page);

    await feed(page, fragments);

    await expect(resultTitle(page)).toBeVisible();
    await expect(page.getByText(/recibido exitosamente\./)).toBeVisible();
    expect(await storedBytes(page, 'ceros.bin')).toEqual(Array.from(bytes));
    expect((await storedFiles(page)).map((file) => file.size)).toEqual([20_000]);
  });

  test('misma entrada con el mismo nombre no sobrescribe el archivo existente', async ({
    page,
  }) => {
    await open(page);
    await receive(page, await transfer('igual.bin', '', sampleBytes(500)));

    await page.goto('/recibir');
    await expect(finish(page)).toBeEnabled();
    await receive(page, await transfer('igual.bin', '', sampleBytes(500)));

    const files = await storedFiles(page);
    expect(files.filter((file) => file.name === 'igual.bin')).toHaveLength(2);
    await dismiss(page);
    await expect(page.getByRole('heading', { name: 'igual.bin', level: 3 })).toHaveCount(2);
  });

  test('pide almacenamiento persistente al guardar', async ({ page }) => {
    await page.addInitScript(() => {
      let calls = 0;
      (window as unknown as { __persist: () => number }).__persist = () => calls;
      Object.defineProperty(navigator.storage, 'persisted', { value: async () => false });
      Object.defineProperty(navigator.storage, 'persist', {
        value: async () => {
          calls++;
          return true;
        },
      });
    });
    await open(page);

    await receive(page, await transfer('p.bin', '', sampleBytes(300)));

    await expect
      .poll(() =>
        page.evaluate(() => (window as unknown as { __persist: () => number }).__persist()),
      )
      .toBe(1);
  });
});

test.describe('recepción: elección de la transferencia', () => {
  test('completa sola, sin pedir confirmación, y muestra el avance', async ({ page }) => {
    await open(page);
    await feed(page, await transfer('espera.bin', '', sampleBytes(1000)));

    await expect(resultTitle(page)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Confirmar' })).toHaveCount(0);
    expect((await storedFiles(page)).map((file) => file.name)).toEqual(['espera.bin']);
  });

  test('con una secuencia ajena en cuadro, sigue la primera leída y no completa la otra', async ({
    page,
  }) => {
    const foreign = await transfer('ajeno.bin', '', sampleBytes(1000));
    const mine = await transfer('mio.bin', '', sampleBytes(800));
    await open(page);

    await feed(page, [mine[0], foreign[0], ...foreign.slice(1), ...mine.slice(1)]);

    await expect(resultTitle(page)).toBeVisible();
    expect((await storedFiles(page)).map((file) => file.name)).toEqual(['mio.bin']);
  });
});

test.describe('recepción: resultados que no guardan', () => {
  test('incompleta: no guarda ni registra y permite seguir escaneando', async ({ page }) => {
    const bytes = sampleBytes(1500);
    const fragments = await transfer('parcial.bin', '', bytes);
    await open(page);
    await feed(page, fragments.slice(0, 2));
    await expect(page.getByText(/^\s*QR 2 de [45]\s*$/)).toBeVisible();

    await finish(page).click();

    await expect(notice(page, 'Recepción incompleta')).toBeVisible();
    await expect(page.getByText('No se guardó ni registró ningún archivo.')).toBeVisible();
    expect(await storedFiles(page)).toEqual([]);

    await page.getByRole('button', { name: 'Seguir escaneando' }).click();
    await feed(page, fragments.slice(2));
    await expect(notice(page, 'Recepción incompleta')).toBeHidden();
    await dismiss(page);
    await expect(page.getByRole('heading', { name: 'parcial.bin', level: 3 })).toBeVisible();
    expect(await storedBytes(page, 'parcial.bin')).toEqual(Array.from(bytes));
  });

  test('datos inválidos: no guarda y «Reintentar» empieza desde cero', async ({ page }) => {
    const fragments = await transfer('malo.bin', '', sampleBytes(1000));
    const altered = Uint8Array.from(fragments[1].subarray(12, fragments[1].length - 4));
    altered[0] ^= 1;
    await open(page);
    await feed(page, [fragments[0]]);
    await feed(page, [withPayload(fragments[1], altered), ...fragments.slice(2)]);

    await expect(notice(page, 'Datos inválidos')).toBeVisible();
    expect(await storedFiles(page)).toEqual([]);

    await page.getByRole('button', { name: 'Reintentar' }).click();
    await expect(page.getByText('Esperando el primer QR…')).toBeVisible();
    await expect(page.getByText('0 %')).toBeVisible();
    expect((await cameraStats(page)).opened).toBe(2);
  });

  test('no reconstruible: no guarda y permite reintentar', async ({ page }) => {
    const fragments = await transfer('raro.bin', '', sampleBytes(1000));
    const metadata = Uint8Array.from(fragments[0].subarray(12, fragments[0].length - 4));
    new DataView(metadata.buffer).setUint32(32, 9999);
    await open(page);
    await feed(page, [withPayload(fragments[0], metadata), ...fragments.slice(1)]);

    await expect(notice(page, 'Archivo no reconstruible')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reintentar' })).toBeVisible();
    expect(await storedFiles(page)).toEqual([]);
  });

  test('cuota agotada: avisa, no registra nada y ofrece descargar el archivo recibido', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      navigator.storage.estimate = async () => ({ quota: 100, usage: 100 });
    });
    await open(page);
    await receive(page, await transfer('grande.bin', '', sampleBytes(1000)));

    await expect(notice(page, 'Almacenamiento lleno')).toBeVisible();
    expect(await storedFiles(page)).toEqual([]);

    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Descargar archivo' }).click();
    expect((await download).suggestedFilename()).toBe('grande.bin');
  });
});

test.describe('recepción: cancelar', () => {
  test('cancela sin confirmación, descarta lo recibido y libera la cámara', async ({ page }) => {
    await open(page);
    await feed(page, (await transfer('cancelada.bin', '', sampleBytes(1500))).slice(0, 3));
    await expect(page.getByText(/^\s*QR 3 de \d+\s*$/)).toBeVisible();

    await page.getByRole('button', { name: 'Opciones de recepción' }).click();
    await page.getByRole('menuitem', { name: 'Cancelar' }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect((await cameraStats(page)).stopped).toBeGreaterThanOrEqual(1);
    expect(await storedFiles(page)).toEqual([]);
  });
});

test.describe('recepción: cámara no disponible', () => {
  for (const [mode, message] of [
    ['denied', /permiso para usar la cámara/],
    ['no-camera', /No se encontró una cámara/],
    ['unsupported', /no es compatible/],
  ] as const) {
    test(`${mode}: muestra un mensaje claro y no inicia la recepción`, async ({ page }) => {
      await open(page, mode);

      await expect(notice(page, message)).toBeVisible();
      await expect(finish(page)).toBeHidden();
      await expect(page.getByRole('button', { name: 'Reintentar' })).toBeVisible();
      expect((await cameraStats(page))?.opened ?? 0).toBe(0);
    });
  }
});

test.describe('recepción: seguridad de la previsualización', () => {
  for (const [name, type, content] of [
    [
      'dibujo.svg',
      'image/svg+xml',
      '<svg xmlns="http://www.w3.org/2000/svg"><script>window.__pwned = true</script><rect width="10" height="10"/></svg>',
    ],
    [
      'pagina.html',
      'text/html',
      '<html><body><script>window.__pwned = true</script></body></html>',
    ],
  ] as const) {
    test(`${name} no ejecuta su script al previsualizar ni al abrir; se descarga`, async ({
      page,
      context,
    }) => {
      await open(page);
      await receive(
        page,
        await transfer(name, type, new TextEncoder().encode(content) as Uint8Array<ArrayBuffer>),
      );

      const popups: string[] = [];
      context.on('page', (opened) => popups.push(opened.url()));
      const download = page.waitForEvent('download');
      await page
        .getByRole('button', { name: new RegExp(name.replace('.', '\\.')) })
        .first()
        .click();

      expect((await download).suggestedFilename()).toBe(name);
      expect(popups).toEqual([]);
      expect(
        await page.evaluate(() => (window as unknown as { __pwned?: boolean }).__pwned),
      ).toBeUndefined();
    });
  }
});

test.describe('recepción: lectura con ZXing en el worker', () => {
  test('lee los QR de la cámara en el worker y recibe el archivo idéntico', async ({ page }) => {
    const bytes = sampleBytes(700);
    const fragments = await transfer('real.bin', 'application/octet-stream', bytes);
    await open(page);

    await receive(page, fragments);

    expect(await storedBytes(page, 'real.bin')).toEqual(Array.from(bytes));
    // The frames were read by the Web Worker, not by the page.
    expect(page.workers().length).toBeGreaterThan(0);
  });
});

test.describe('recepción: sin desplazamiento horizontal', () => {
  for (const width of [360, 768, 1280, 1600]) {
    test(`pantalla de lectura, aviso y resultados a ${width}px`, async ({ page }) => {
      const overflow = () =>
        page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
      await open(page, 'working', { width, height: 900 });
      expect(await overflow()).toBeLessThanOrEqual(0);

      await feed(
        page,
        (await transfer('muy-largo-nombre-de-archivo-de-prueba.bin', '', sampleBytes(1000))).slice(
          0,
          2,
        ),
      );
      expect(await overflow()).toBeLessThanOrEqual(0);

      await finish(page).click();
      await expect(notice(page, 'Recepción incompleta')).toBeVisible();
      expect(await overflow()).toBeLessThanOrEqual(0);

      await page.goto('/recibir');
      await expect(finish(page)).toBeEnabled();
      await receive(
        page,
        await transfer('muy-largo-nombre-de-archivo-de-prueba.bin', '', sampleBytes(1000)),
      );
      expect(await overflow()).toBeLessThanOrEqual(0);
    });
  }
});
