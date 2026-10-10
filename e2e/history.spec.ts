import { expect, test, type Page } from '@playwright/test';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

interface Seed {
  name: string;
  direction: 'sent' | 'received';
  size: number;
  /** Antigüedad de la transferencia en milisegundos. */
  age: number;
}

/** Historial de referencia de los casos de prueba (TC-001, TC-003, TC-004). */
const HISTORY: Seed[] = [
  { name: 'foto.png', direction: 'received', size: 20 * 1024, age: 3 * DAY },
  { name: 'informe.pdf', direction: 'sent', size: 150 * 1024, age: 2 * DAY },
  { name: 'notas.txt', direction: 'received', size: 2 * 1024, age: DAY },
  { name: 'datos.bin', direction: 'sent', size: 100 * 1024, age: HOUR },
];

/** Siembra el almacenamiento privado (OPFS) con las entradas indicadas y recarga la aplicación. */
async function seed(page: Page, entries: Seed[]) {
  await page.goto('/');
  await page.evaluate(
    async ({ items, now }) => {
      const root = await navigator.storage.getDirectory();
      await root.removeEntry('transfers', { recursive: true }).catch(() => undefined);
      const dir = await root.getDirectoryHandle('transfers', { create: true });
      const write = async (name: string, data: BlobPart) => {
        const writable = await (await dir.getFileHandle(name, { create: true })).createWritable();
        await writable.write(data);
        await writable.close();
      };
      for (const [index, item] of items.entries()) {
        const id = `seed-${index}`;
        const record = {
          id,
          direction: item.direction,
          name: item.name,
          type: 'application/octet-stream',
          size: item.size,
          date: now - item.age,
        };
        await write(id, new Uint8Array(item.size).fill(7));
        await write(`${id}.json`, JSON.stringify(record));
      }
    },
    { items: entries, now: Date.now() },
  );
  await page.reload();
}

/** Abre el menú ⋮ de la fila de `name` y elige una de sus acciones. */
async function rowAction(page: Page, name: string, action: 'Exportar' | 'Compartir' | 'Eliminar') {
  await page.getByRole('button', { name: `Acciones de ${name}` }).click();
  await page.getByRole('menuitem', { name: action }).click();
}

/** Nombres de las filas visibles, en orden. */
const names = (page: Page) => page.getByRole('listitem').getByRole('heading', { level: 3 });

/** Nombres de los archivos que quedan en el almacenamiento privado. */
const stored = (page: Page) =>
  page.evaluate(async () => {
    const dir = await (
      await navigator.storage.getDirectory()
    ).getDirectoryHandle('transfers', {
      create: true,
    });
    const found: string[] = [];
    for await (const name of (dir as unknown as { keys(): AsyncIterable<string> }).keys()) {
      found.push(name);
    }
    return found.sort();
  });

test.describe('historial: lista y filtros', () => {
  test.beforeEach(async ({ page }) => seed(page, HISTORY));

  test('muestra las transferencias de la más reciente a la más antigua', async ({ page }) => {
    await expect(names(page)).toHaveText(['datos.bin', 'notas.txt', 'informe.pdf', 'foto.png']);
    await expect(page.getByRole('listitem').first()).toContainText('Enviado');
    await expect(page.getByRole('listitem').first()).toContainText('100.0 KB');
  });

  test('Todos es el filtro por defecto', async ({ page }) => {
    await expect(page.getByRole('radio', { name: 'Todos' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  test('filtra por Recibidos y por Enviados sin alterar el orden', async ({ page }) => {
    await page.getByRole('radio', { name: 'Recibidos' }).click();
    await expect(names(page)).toHaveText(['notas.txt', 'foto.png']);

    await page.getByRole('radio', { name: 'Enviados' }).click();
    await expect(names(page)).toHaveText(['datos.bin', 'informe.pdf']);
  });

  test('al volver a la pantalla el filtro es Todos', async ({ page }) => {
    await page.getByRole('radio', { name: 'Enviados' }).click();
    // Un oyente que no responde mantiene abierto el selector que abre la hoja de envío.
    page.on('filechooser', () => undefined);
    await page.getByRole('link', { name: 'Enviar' }).click();
    await expect(page).toHaveURL(/\/enviar$/);

    await page.goBack();

    await expect(page.getByRole('radio', { name: 'Todos' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(names(page)).toHaveCount(4);
  });
});

test.describe('historial: exportar', () => {
  test('descarga el archivo con su nombre original', async ({ page }) => {
    await seed(page, HISTORY);

    const download = page.waitForEvent('download');
    await rowAction(page, 'informe.pdf', 'Exportar');

    expect((await download).suggestedFilename()).toBe('informe.pdf');
  });

  test('conserva espacios, acentos y varios puntos en el nombre', async ({ page }) => {
    const name = 'Informe final – año 2026.v2.pdf';
    await seed(page, [{ name, direction: 'sent', size: 1024, age: HOUR }]);

    const download = page.waitForEvent('download');
    await rowAction(page, name, 'Exportar');

    expect((await download).suggestedFilename()).toBe(name);
  });

  test('no hay ninguna salida de archivos hasta que el usuario pulsa Exportar', async ({
    page,
  }) => {
    const downloads: string[] = [];
    page.on('download', (download) => downloads.push(download.suggestedFilename()));
    const external: string[] = [];
    page.on('request', (request) => {
      if (!request.url().startsWith('http://localhost')) {
        external.push(request.url());
      }
    });
    await seed(page, HISTORY);

    await page.getByRole('radio', { name: 'Recibidos' }).click();
    await page.getByRole('radio', { name: 'Todos' }).click();
    await rowAction(page, 'foto.png', 'Eliminar');
    await page.getByRole('button', { name: 'Cancelar' }).click();
    await expect(names(page)).toHaveCount(4);

    expect(downloads).toEqual([]);
    expect(external).toEqual([]);
  });
});

test.describe('historial: eliminar', () => {
  test.beforeEach(async ({ page }) => seed(page, HISTORY));

  test('al confirmar elimina la entrada y libera su espacio', async ({ page }) => {
    await rowAction(page, 'informe.pdf', 'Eliminar');
    await page.getByRole('button', { name: 'Eliminar', exact: true }).click();

    await expect(names(page)).toHaveText(['datos.bin', 'notas.txt', 'foto.png']);
    expect(await stored(page)).toHaveLength(6);
  });

  test('al cancelar no se borra nada', async ({ page }) => {
    await rowAction(page, 'informe.pdf', 'Eliminar');
    await page.getByRole('button', { name: 'Cancelar' }).click();

    await expect(names(page)).toHaveCount(4);
    expect(await stored(page)).toHaveLength(8);
  });

  test('al eliminar la última entrada muestra el historial vacío', async ({ page }) => {
    await seed(page, [HISTORY[0]]);

    await rowAction(page, 'foto.png', 'Eliminar');
    await page.getByRole('button', { name: 'Eliminar', exact: true }).click();

    await expect(page.getByText('Aún no hay transferencias')).toBeVisible();
    await expect(page.getByRole('list')).toHaveCount(0);
  });
});

test.describe('historial: vacío', () => {
  test('muestra «Aún no hay transferencias» en lugar de la lista', async ({ page }) => {
    await seed(page, []);

    await expect(page.getByText('Aún no hay transferencias')).toBeVisible();
    await expect(page.getByRole('list')).toHaveCount(0);
  });
});

test.describe('historial: pantalla responsiva', () => {
  for (const width of [360, 1280]) {
    test(`sin desplazamiento horizontal a ${width} px, con nombres largos`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await seed(page, [
        ...HISTORY,
        {
          name: `${'nombre-muy-largo-'.repeat(8)}.pdf`,
          direction: 'sent',
          size: 5 * 1024 * 1024,
          age: 2 * HOUR,
        },
      ]);

      await expect(names(page)).toHaveCount(5);
      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflows).toBe(false);
      await expect(page.getByRole('link', { name: 'Enviar' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Recibir' })).toBeVisible();
    });
  }
});
