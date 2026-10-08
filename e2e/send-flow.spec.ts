import { expect, test, type Page } from '@playwright/test';

/** Archivo determinista de `size` bytes. */
function fileOf(name: string, size: number) {
  return { name, mimeType: 'application/octet-stream', buffer: Buffer.alloc(size, 7) };
}

const qr = (page: Page) => page.getByRole('img', { name: 'Código QR del archivo' });
const alert = (page: Page) => page.getByRole('alert');

/** Abre «Enviar» y entrega al selector los archivos indicados. */
async function choose(page: Page, files: ReturnType<typeof fileOf>[]) {
  await page.goto('/enviar');
  await expect(page.getByRole('heading', { name: 'Enviar archivo' })).toBeVisible();
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Elegir archivo' }).click();
  await (await chooser).setFiles(files);
}

/** Hash de la imagen actual del canvas, para detectar que la secuencia avanza. */
const frame = (page: Page) =>
  page.locator('canvas').evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());

test.describe('envío: flujo completo', () => {
  test('«Elegir archivo» abre el selector del dispositivo, de un solo archivo', async ({
    page,
  }) => {
    await page.goto('/enviar');
    const chooser = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Elegir archivo' }).click();

    expect((await chooser).isMultiple()).toBe(false);
  });

  test('cerrar el selector sin elegir no inicia ninguna transferencia', async ({ page }) => {
    await choose(page, []);

    await expect(qr(page)).toBeHidden();
    await expect(page.getByRole('button', { name: 'Elegir archivo' })).toBeVisible();
  });

  test('muestra el QR y la información del archivo, sin progreso de transmisión', async ({
    page,
  }) => {
    await choose(page, [fileOf('prueba-100KB.bin', 102_400)]);

    await expect(qr(page)).toBeVisible();
    await expect(page.getByText('prueba-100KB.bin')).toBeVisible();
    await expect(page.getByText('application/octet-stream')).toBeVisible();
    await expect(page.getByText('100.0 KB')).toBeVisible();
    await expect(page.getByText('257', { exact: true })).toBeVisible();
    await expect(page.getByRole('progressbar')).toHaveCount(0);
  });

  test('el tiempo por vuelta se muestra como «calculando…» hasta tener datos', async ({ page }) => {
    await choose(page, [fileOf('prueba-1MB.bin', 1_048_576)]);

    await expect(page.getByText('calculando…')).toBeVisible();
    await expect(page.getByText('calculando…')).toBeHidden();
  });

  test('la secuencia avanza sola y se repite en bucle sin intervención', async ({ page }) => {
    // 1 KB = 4 QR: una vuelta dura 0,5 s, así que en 2,5 s se completan varias vueltas.
    await choose(page, [fileOf('pequeno.bin', 1_000)]);
    await expect(qr(page)).toBeVisible();

    const seen = new Set<string>();
    for (let i = 0; i < 20; i++) {
      seen.add(await frame(page));
      await page.waitForTimeout(125);
    }

    expect(seen.size).toBeGreaterThan(1);
    await page.waitForTimeout(2_500);
    await expect(qr(page)).toBeVisible();
  });

  test('guarda una copia en el almacenamiento privado al iniciar el envío', async ({ page }) => {
    await choose(page, [fileOf('copia.bin', 5_000)]);
    await expect(qr(page)).toBeVisible();

    const names = await page.evaluate(async () => {
      const root = await navigator.storage.getDirectory();
      const dir = await root.getDirectoryHandle('transfers');
      const names: string[] = [];
      for await (const handle of dir.values()) {
        names.push(handle.name);
      }
      return names;
    });

    expect(names).toHaveLength(2);
    expect(names.some((name) => name.endsWith('.json'))).toBe(true);
  });

  test('cancelar detiene el envío sin confirmación y conserva la copia', async ({ page }) => {
    let dialogs = 0;
    page.on('dialog', async (dialog) => {
      dialogs++;
      await dialog.dismiss();
    });
    await choose(page, [fileOf('cancelar.bin', 5_000)]);
    await expect(qr(page)).toBeVisible();

    await page.getByRole('button', { name: 'Cancelar' }).click();

    await expect(qr(page)).toBeHidden();
    expect(dialogs).toBe(0);
    const files = await page.evaluate(async () => {
      const root = await navigator.storage.getDirectory();
      const dir = await root.getDirectoryHandle('transfers');
      let count = 0;
      for await (const handle of dir.values()) {
        count += handle.kind === 'file' ? 1 : 0;
      }
      return count;
    });
    expect(files).toBe(2);
  });
});

test.describe('envío: errores', () => {
  test('un archivo vacío muestra un mensaje claro y no inicia nada', async ({ page }) => {
    await choose(page, [fileOf('vacio.bin', 0)]);

    await expect(alert(page)).toContainText('vacío');
    await expect(qr(page)).toBeHidden();
  });

  test('un archivo que excede el máximo de fragmentos se rechaza con un mensaje', async ({
    page,
  }) => {
    await choose(page, [fileOf('enorme.bin', 27_000_000)]);

    await expect(alert(page)).toContainText('demasiado grande');
    await expect(qr(page)).toBeHidden();
  });

  test('sin espacio para la copia no se inicia la transferencia', async ({ page }) => {
    await page.addInitScript(() => {
      navigator.storage.estimate = async () => ({ quota: 1_000, usage: 900 });
    });
    await choose(page, [fileOf('grande.bin', 5_000)]);

    await expect(alert(page)).toContainText('espacio de almacenamiento');
    await expect(qr(page)).toBeHidden();
  });

  test('un navegador sin almacenamiento privado muestra que no es compatible', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(StorageManager.prototype, 'getDirectory', { value: undefined });
    });
    await choose(page, [fileOf('a.bin', 1_000)]);

    await expect(alert(page)).toContainText('no es compatible');
    await expect(qr(page)).toBeHidden();
  });
});

test.describe('envío: pantalla responsiva', () => {
  for (const width of [360, 768, 1280, 1600]) {
    test(`sin desplazamiento horizontal a ${width} px, con QR y con error`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await choose(page, [
        fileOf('nombre-de-archivo-muy-largo-para-probar-el-desborde.bin', 5_000),
      ]);
      await expect(qr(page)).toBeVisible();

      const overflow = () =>
        page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(await overflow()).toBe(false);

      await page.getByRole('button', { name: 'Cancelar' }).click();
      const chooser = page.waitForEvent('filechooser');
      await page.getByRole('button', { name: 'Elegir archivo' }).click();
      await (await chooser).setFiles([fileOf('vacio.bin', 0)]);
      await expect(alert(page)).toBeVisible();
      expect(await overflow()).toBe(false);
    });
  }
});
