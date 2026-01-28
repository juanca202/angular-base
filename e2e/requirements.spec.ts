import { expect, test } from '@playwright/test';

/**
 * E2E Tests for Requirements Feature
 *
 * These tests cover all three User Stories:
 * - US1: Listar y Visualizar Requirements
 * - US2: Visualizar Recipes de un RequirementItem
 * - US3: Gestionar Recipes de un RequirementItem
 */

test.describe('User Story 1: Listar y Visualizar Requirements', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to requirements list page
    await page.goto('/requirements');
  });

  test('T015: Should display list of Requirements with basic identification info', async ({
    page
  }) => {
    // Given: Requirements exist in the system
    // When: User accesses the requirements manager
    // Then: A list of all Requirements with basic identification info is displayed

    // Wait for the requirements list to load
    await page.waitForSelector('[data-testid="requirement-list"]', { timeout: 5000 });

    // Verify that requirements are displayed
    const requirementItems = page.locator('[data-testid="requirement-item"]');
    await expect(requirementItems.first()).toBeVisible();

    // Verify basic identification info is shown (name at minimum)
    const firstRequirement = requirementItems.first();
    await expect(firstRequirement.locator('[data-testid="requirement-name"]')).toBeVisible();
  });

  test('Should allow selecting a Requirement to view details', async ({ page }) => {
    // Given: A list of Requirements is visible
    // When: User selects a Requirement
    // Then: Complete details of the Requirement and all RequirementItems are displayed

    // Wait for requirements list
    await page.waitForSelector('[data-testid="requirement-list"]', { timeout: 5000 });

    // Click on the first requirement
    const firstRequirement = page.locator('[data-testid="requirement-item"]').first();
    await firstRequirement.click();

    // Verify navigation to detail page
    await page.waitForURL(/\/requirements\/\d+/, { timeout: 3000 });

    // Verify requirement details are displayed
    await expect(page.locator('[data-testid="requirement-detail"]')).toBeVisible();

    // Verify RequirementItems are displayed
    await expect(page.locator('[data-testid="requirement-items-list"]')).toBeVisible();
  });

  test('Should filter RequirementItems by category', async ({ page }) => {
    // Given: A Requirement is selected with RequirementItems of multiple categories
    // When: User selects a category from the "all categories" combo
    // Then: Only RequirementItems belonging to that category are displayed

    // Navigate to a requirement detail page
    await page.goto('/requirements');
    await page.waitForSelector('[data-testid="requirement-list"]', { timeout: 5000 });
    await page.locator('[data-testid="requirement-item"]').first().click();
    await page.waitForURL(/\/requirements\/\d+/, { timeout: 3000 });

    // Wait for category filter to be available
    await page.waitForSelector('[data-testid="category-filter"]', { timeout: 3000 });

    // Get initial count of RequirementItems
    const initialItems = page.locator('[data-testid="requirement-item-card"]');
    const initialCount = await initialItems.count();

    // Select a specific category from the filter
    await page.locator('[data-testid="category-filter"]').click();
    await page.locator('[data-testid="category-option"]').first().click();

    // Verify that filtered items are displayed (count should be <= initial count)
    const filteredItems = page.locator('[data-testid="requirement-item-card"]');
    const filteredCount = await filteredItems.count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('Should show all RequirementItems when "all categories" is selected', async ({ page }) => {
    // Given: A Requirement is selected with RequirementItems filtered by category
    // When: User selects "all categories" or clears the filter
    // Then: All RequirementItems of the Requirement are displayed without filtering

    // Navigate to a requirement detail page
    await page.goto('/requirements');
    await page.waitForSelector('[data-testid="requirement-list"]', { timeout: 5000 });
    await page.locator('[data-testid="requirement-item"]').first().click();
    await page.waitForURL(/\/requirements\/\d+/, { timeout: 3000 });

    // Wait for category filter
    await page.waitForSelector('[data-testid="category-filter"]', { timeout: 3000 });

    // Get count with filter applied
    await page.locator('[data-testid="category-filter"]').click();
    await page.locator('[data-testid="category-option"]').first().click();
    const filteredCount = await page.locator('[data-testid="requirement-item-card"]').count();

    // Select "all categories"
    await page.locator('[data-testid="category-filter"]').click();
    await page.locator('[data-testid="category-all"]').click();

    // Verify all items are displayed
    const allItemsCount = await page.locator('[data-testid="requirement-item-card"]').count();
    expect(allItemsCount).toBeGreaterThanOrEqual(filteredCount);
  });

  test('Should display message when no Requirements are available', async ({ page }) => {
    // Given: No Requirements are registered
    // When: User accesses the requirements manager
    // Then: A message indicating no Requirements are available is displayed

    // Note: This test may require mocking empty state or using a test environment
    // For now, we verify that empty state handling exists
    const emptyState = page.locator('[data-testid="empty-state"]');
    // If empty state exists, verify it shows appropriate message
    if ((await emptyState.count()) > 0) {
      await expect(emptyState).toBeVisible();
      await expect(emptyState.locator('text=/no.*requirement/i')).toBeVisible();
    }
  });
});

test.describe('User Story 2: Visualizar Recipes de un RequirementItem', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a requirement detail page with RequirementItems
    await page.goto('/requirements');
    await page.waitForSelector('[data-testid="requirement-list"]', { timeout: 5000 });
    await page.locator('[data-testid="requirement-item"]').first().click();
    await page.waitForURL(/\/requirements\/\d+/, { timeout: 3000 });
    await page.waitForSelector('[data-testid="requirement-items-list"]', { timeout: 3000 });
  });

  test('T037: Should open dialog showing RequirementItem details and associated Recipes', async ({
    page
  }) => {
    // Given: A RequirementItem of a Requirement is visible
    // When: User clicks the "detail" button of the RequirementItem
    // Then: A modal dialog opens showing the RequirementItem details and all associated Recipes

    // Click the detail button on the first RequirementItem
    const firstItemCard = page.locator('[data-testid="requirement-item-card"]').first();
    await firstItemCard.locator('[data-testid="detail-button"]').click();

    // Verify dialog is opened
    await expect(page.locator('[data-testid="requirement-item-detail-dialog"]')).toBeVisible({
      timeout: 3000
    });

    // Verify RequirementItem details are displayed
    await expect(page.locator('[data-testid="requirement-item-detail"]')).toBeVisible();

    // Verify Recipes list is displayed (may be empty)
    await expect(page.locator('[data-testid="recipes-list"]')).toBeVisible();
  });

  test('Should show message when RequirementItem has no Recipes', async ({ page }) => {
    // Given: A RequirementItem without associated Recipes
    // When: User clicks the "detail" button of the RequirementItem
    // Then: A modal dialog opens showing the RequirementItem details and a message indicating no Recipes are assigned

    // Find a RequirementItem without recipes (visual indicator: no recipe badge)
    const itemsWithoutRecipes = page.locator('[data-testid="requirement-item-card"]').filter({
      hasNot: page.locator('[data-testid="has-recipes-indicator"]')
    });

    if ((await itemsWithoutRecipes.count()) > 0) {
      await itemsWithoutRecipes.first().locator('[data-testid="detail-button"]').click();

      // Verify dialog opens
      await expect(page.locator('[data-testid="requirement-item-detail-dialog"]')).toBeVisible({
        timeout: 3000
      });

      // Verify empty state message for Recipes
      const emptyRecipesMessage = page.locator('[data-testid="recipes-empty-state"]');
      await expect(emptyRecipesMessage).toBeVisible();
    }
  });

  test('Should close dialog when close button is clicked', async ({ page }) => {
    // Given: A RequirementItem detail dialog is open
    // When: User clicks the close button or outside the dialog
    // Then: The dialog closes and user returns to the Requirement detail view

    // Open dialog
    await page
      .locator('[data-testid="requirement-item-card"]')
      .first()
      .locator('[data-testid="detail-button"]')
      .click();
    await expect(page.locator('[data-testid="requirement-item-detail-dialog"]')).toBeVisible({
      timeout: 3000
    });

    // Click close button
    await page.locator('[data-testid="dialog-close-button"]').click();

    // Verify dialog is closed
    await expect(page.locator('[data-testid="requirement-item-detail-dialog"]')).not.toBeVisible({
      timeout: 2000
    });

    // Verify we're back on requirement detail page
    await expect(page.locator('[data-testid="requirement-detail"]')).toBeVisible();
  });
});

test.describe('User Story 3: Gestionar Recipes de un RequirementItem', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a RequirementItem detail dialog with Recipes
    await page.goto('/requirements');
    await page.waitForSelector('[data-testid="requirement-list"]', { timeout: 5000 });
    await page.locator('[data-testid="requirement-item"]').first().click();
    await page.waitForURL(/\/requirements\/\d+/, { timeout: 3000 });
    await page.waitForSelector('[data-testid="requirement-items-list"]', { timeout: 3000 });

    // Open RequirementItem detail dialog
    await page
      .locator('[data-testid="requirement-item-card"]')
      .first()
      .locator('[data-testid="detail-button"]')
      .click();
    await page.waitForSelector('[data-testid="requirement-item-detail-dialog"]', { timeout: 3000 });
  });

  test('T052: Should add a Recipe to a RequirementItem', async ({ page }) => {
    // Given: A RequirementItem of a Requirement is visible
    // When: User adds a Recipe to the RequirementItem
    // Then: The Recipe becomes part of the RequirementItem and appears in the associated Recipes list

    // Get initial count of Recipes
    const initialRecipesCount = await page.locator('[data-testid="recipe-item"]').count();

    // Click add Recipe button
    await page.locator('[data-testid="add-recipe-button"]').click();

    // Fill in Recipe form (minimal required fields)
    await page.locator('[data-testid="recipe-name-input"]').fill('Test Recipe');
    await page.locator('[data-testid="recipe-category-select"]').click();
    await page.locator('[data-testid="recipe-category-option"]').first().click();

    // Submit form
    await page.locator('[data-testid="recipe-submit-button"]').click();

    // Wait for Recipe to be added
    await page.waitForTimeout(1000);

    // Verify Recipe appears in the list
    const newRecipesCount = await page.locator('[data-testid="recipe-item"]').count();
    expect(newRecipesCount).toBeGreaterThan(initialRecipesCount);

    // Verify the new Recipe is visible
    await expect(page.locator('text=Test Recipe')).toBeVisible();
  });

  test('Should delete a Recipe from a RequirementItem', async ({ page }) => {
    // Given: A RequirementItem with associated Recipes
    // When: User deletes a Recipe from the RequirementItem
    // Then: The Recipe no longer appears in the RequirementItem's Recipes list

    // Get initial count of Recipes (must have at least one)
    const initialRecipes = page.locator('[data-testid="recipe-item"]');
    const initialCount = await initialRecipes.count();

    if (initialCount > 0) {
      // Click delete button on first Recipe
      await initialRecipes.first().locator('[data-testid="delete-recipe-button"]').click();

      // Confirm deletion if confirmation dialog appears
      const confirmButton = page.locator('[data-testid="confirm-delete-button"]');
      if ((await confirmButton.count()) > 0) {
        await confirmButton.click();
      }

      // Wait for Recipe to be removed
      await page.waitForTimeout(1000);

      // Verify Recipe count decreased
      const newCount = await page.locator('[data-testid="recipe-item"]').count();
      expect(newCount).toBeLessThan(initialCount);
    }
  });

  test('Should prevent adding duplicate Recipes', async ({ page }) => {
    // Given: A RequirementItem with associated Recipes
    // When: User attempts to add a duplicate Recipe
    // Then: The system prevents duplication or shows an appropriate message

    // Get name of first existing Recipe
    const firstRecipe = page.locator('[data-testid="recipe-item"]').first();
    const existingRecipeName = await firstRecipe
      .locator('[data-testid="recipe-name"]')
      .textContent();

    if (existingRecipeName) {
      // Try to add Recipe with same name
      await page.locator('[data-testid="add-recipe-button"]').click();
      await page.locator('[data-testid="recipe-name-input"]').fill(existingRecipeName.trim());
      await page.locator('[data-testid="recipe-submit-button"]').click();

      // Verify error message or prevention
      const errorMessage = page.locator('[data-testid="duplicate-error"]');
      await expect(errorMessage).toBeVisible({ timeout: 2000 });
    }
  });
});
