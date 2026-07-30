import { expect, test } from '@playwright/test';

/**
 * Smoke E2E de arranque — sustituir/ampliar con los flujos críticos de producto
 * (ADR-005 / testing/CR-009).
 */
test('la aplicación responde en la ruta raíz', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/./);
});
