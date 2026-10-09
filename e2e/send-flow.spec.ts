import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

/**
 * Archivo de `size` bytes: repetido (determinista y muy comprimible) o aleatorio (no se comprime, así
 * que el número de QR depende solo del tamaño).
 */
function fileOf(name: string, size: number, random = false) {
  return {
    name,
    mimeType: 'application/octet-stream',
    buffer: random ? randomBytes(size) : Buffer.alloc(size, 7),
  };
}

const qr = (page: Page) => page.getByRole('img', { name: 'Código QR del archivo', exact: true });
const alert = (page: Page) => page.getByRole('alert');

/** Abre «Enviar» y entrega al selector los archivos indicados. */
async function choose(page: Page, files: (ReturnType<typeof fileOf> | string)[]) {
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
    await choose(page, [fileOf('prueba-100KB.bin', 102_400, true)]);

    await expect(qr(page)).toBeVisible();
    await expect(page.getByText('prueba-100KB.bin')).toBeVisible();
    await expect(page.getByText('application/octet-stream')).toBeVisible();
    await expect(page.getByText('100.0 KB')).toBeVisible();
    await expect(page.getByText('129', { exact: true })).toBeVisible();
    await expect(page.getByRole('progressbar')).toHaveCount(0);
  });

  test('transmite comprimido un archivo que se comprime y lo indica', async ({ page }) => {
    await choose(page, [fileOf('ceros.bin', 102_400)]);

    await expect(qr(page)).toBeVisible();
    await expect(page.getByText('100.0 KB')).toBeVisible();
    await expect(page.getByText('Se transmite')).toBeVisible();
    await expect(page.getByText(/\(comprimido\)/)).toBeVisible();
    await expect(page.getByText('129', { exact: true })).toBeHidden();
  });

  test('el QR queda fijo hasta el primer toque y el tiempo por vuelta se muestra desde el inicio', async ({
    page,
  }) => {
    await choose(page, [fileOf('prueba-1MB.bin', 1_048_576)]);
    await expect(qr(page)).toBeVisible();

    await expect(page.getByText('Tiempo por vuelta')).toBeVisible();
    await expect(page.getByText(/tócalo para iniciar/)).toBeVisible();
    const first = await frame(page);
    await page.waitForTimeout(1_000);
    expect(await frame(page)).toBe(first);
  });

  test('el primer toque inicia la secuencia, reteniendo el primer QR, y se repite en bucle', async ({
    page,
  }) => {
    // 1 KB = 3 QR: una vuelta dura 0,375 s, así que en 2,5 s se completan varias vueltas.
    await choose(page, [fileOf('pequeno.bin', 1_000, true)]);
    await expect(qr(page)).toBeVisible();
    const first = await frame(page);

    await page.getByRole('button', { name: /Iniciar o reiniciar la vuelta/ }).click();

    await expect(page.getByText(/Toca el QR para reiniciar la vuelta/)).toBeVisible();
    await page.waitForTimeout(1_500);
    expect(await frame(page)).toBe(first);
    // Se muestrea con un periodo corto (no múltiplo de la vuelta de 0,5 s) para no coincidir siempre
    // con el mismo QR.
    const deadline = Date.now() + 8_000;
    let changed = false;
    while (!changed && Date.now() < deadline) {
      changed = (await frame(page)) !== first;
      await page.waitForTimeout(37);
    }
    expect(changed).toBe(true);

    const seen = new Set<string>();
    for (let i = 0; i < 20; i++) {
      seen.add(await frame(page));
      await page.waitForTimeout(61);
    }

    expect(seen.size).toBeGreaterThan(1);
    await page.waitForTimeout(2_500);
    await expect(qr(page)).toBeVisible();
  });

  test('la barra de posición permite continuar la secuencia desde otro QR', async ({ page }) => {
    await choose(page, [fileOf('barra.bin', 20_000, true)]);
    await expect(qr(page)).toBeVisible();
    const slider = page.getByRole('slider', { name: 'Posición en la secuencia de QR' });
    const total = Number(await slider.getAttribute('aria-valuemax'));
    expect(total).toBeGreaterThan(8);
    await expect(page.getByText(`QR 1 de ${total}`, { exact: true })).toBeVisible();
    const first = await frame(page);

    // Un toque al 75 % de la barra lleva al fragmento que corresponde a esa posición.
    const target = Math.floor(total * 0.75) + 1;
    const box = (await slider.boundingBox())!;
    await page.mouse.click(box.x + box.width * 0.75, box.y + box.height / 2);

    const label = page.getByText(`QR ${target} de ${total}`, { exact: true });
    await expect(label).toBeVisible();
    await expect(slider).toHaveAttribute('aria-valuenow', String(target));
    expect(await frame(page)).not.toBe(first);
    // Se retiene unos segundos en ese QR antes de seguir.
    await page.waitForTimeout(1_500);
    await expect(label).toBeVisible();
    await expect(label).toBeHidden({ timeout: 5_000 });
  });

  test('el selector de velocidad cambia el ritmo de la secuencia', async ({ page }) => {
    // 3 QR al azar: a 4 QR/s una vuelta dura 0,75 s; a 12 QR/s, 0,25 s.
    await choose(page, [fileOf('veloz.bin', 1_000, true)]);
    await expect(qr(page)).toBeVisible();
    const selector = page.getByRole('combobox', { name: 'Velocidad' });
    await expect(selector).toHaveValue('8');
    await page.getByRole('button', { name: /Iniciar o reiniciar la vuelta/ }).click();

    await selector.selectOption('12');

    await expect(selector).toHaveValue('12');
    await expect(page.getByText(/^1 s$|^0 s$/).first()).toBeVisible();
    // Tras la retención de 3 s el QR avanza con el nuevo ritmo.
    const first = await frame(page);
    // Muestreo con periodo corto y no múltiplo de la vuelta (0,25 s) para no caer siempre en el mismo QR.
    const deadline = Date.now() + 8_000;
    let changed = false;
    while (!changed && Date.now() < deadline) {
      changed = (await frame(page)) !== first;
      await page.waitForTimeout(37);
    }
    expect(changed).toBe(true);
  });

  test('el selector de densidad vuelve a fragmentar el archivo con otro tamaño de QR', async ({
    page,
  }) => {
    await choose(page, [fileOf('densidad.bin', 20_000, true)]);
    await expect(qr(page)).toBeVisible();
    const slider = page.getByRole('slider', { name: 'Posición en la secuencia de QR' });
    const density = page.getByRole('combobox', { name: 'Densidad' });
    await expect(density).toHaveValue('800');
    const before = Number(await slider.getAttribute('aria-valuemax'));
    await page.getByRole('button', { name: /Iniciar o reiniciar la vuelta/ }).click();

    await density.selectOption('400');

    // Con la mitad de bytes por QR hacen falta casi el doble de QR, y se espera de nuevo el toque.
    await expect(density).toHaveValue('400');
    await expect
      .poll(async () => Number(await slider.getAttribute('aria-valuemax')))
      .toBeGreaterThan(before * 1.7);
    await expect(page.getByText(/tócalo para iniciar/)).toBeVisible();
  });

  test('recuerda la densidad y la velocidad elegidas al recargar la página', async ({ page }) => {
    await choose(page, [fileOf('recuerdo.bin', 20_000, true)]);
    await expect(qr(page)).toBeVisible();
    await page.getByRole('combobox', { name: 'Densidad' }).selectOption('400');
    await page.getByRole('combobox', { name: 'Velocidad' }).selectOption('12');
    await expect(page.getByRole('combobox', { name: 'Densidad' })).toHaveValue('400');

    await page.reload();
    await choose(page, [fileOf('recuerdo.bin', 20_000, true)]);

    await expect(qr(page)).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Densidad' })).toHaveValue('400');
    await expect(page.getByRole('combobox', { name: 'Velocidad' })).toHaveValue('12');
    // Se fragmenta con la densidad recordada: casi el doble de QR que con 800 B.
    const slider = page.getByRole('slider', { name: 'Posición en la secuencia de QR' });
    expect(Number(await slider.getAttribute('aria-valuemax'))).toBeGreaterThan(40);
  });

  test('con dos QR a la vez el segundo recorre la secuencia desde el final', async ({ page }) => {
    await choose(page, [fileOf('doble.bin', 20_000, true)]);
    await expect(qr(page)).toBeVisible();
    const slider = page.getByRole('slider', { name: 'Posición en la secuencia de QR' });
    const total = Number(await slider.getAttribute('aria-valuemax'));
    const lapSingle = await page
      .getByText(/^\d+ s$|^\d+ min \d+ s$/)
      .first()
      .innerText();
    await expect(page.getByRole('img', { name: 'Segundo código QR del archivo' })).toHaveCount(0);

    await page.getByRole('combobox', { name: 'QR a la vez' }).selectOption('2');

    await expect(page.getByRole('img', { name: 'Segundo código QR del archivo' })).toBeVisible();
    await expect(qr(page)).toBeVisible();
    // Primer QR: 1; segundo: el último (marcas en los extremos de la barra).
    await expect(page.getByText(`QR 1 y ${total} de ${total}`, { exact: true })).toBeVisible();
    // El tiempo por vuelta pasa a la mitad.
    expect(
      await page
        .getByText(/^\d+ s$|^\d+ min \d+ s$/)
        .first()
        .innerText(),
    ).not.toBe(lapSingle);
    await page.getByRole('button', { name: /Iniciar o reiniciar la vuelta/ }).click();
    // Tras pulsar, el texto cambia con la secuencia: se comprueba su forma, tolerando espacios.
    await expect(page.getByText(new RegExp(`^\\s*QR \\d+ y \\d+ de ${total}\\s*$`))).toBeVisible();
  });

  test('recuerda si se muestran dos QR al recargar la página', async ({ page }) => {
    await choose(page, [fileOf('doble.bin', 20_000, true)]);
    await page.getByRole('combobox', { name: 'QR a la vez' }).selectOption('2');
    await expect(page.getByRole('img', { name: 'Segundo código QR del archivo' })).toBeVisible();

    await page.reload();
    await choose(page, [fileOf('doble.bin', 20_000, true)]);

    await expect(page.getByRole('combobox', { name: 'QR a la vez' })).toHaveValue('2');
    await expect(page.getByRole('img', { name: 'Segundo código QR del archivo' })).toBeVisible();
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
    // Playwright no admite buffers de más de 50 MB: el archivo se entrega por ruta.
    const huge = test.info().outputPath('enorme.bin');
    writeFileSync(huge, Buffer.alloc(53_000_000, 7));
    await choose(page, [huge]);

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
