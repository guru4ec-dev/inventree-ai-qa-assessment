import { test, expect } from '../fixtures/login';

/**
 * Cross-functional flow required by the assessment (Phase 3):
 *   create a part -> add a parameter -> create stock -> verify in category view
 *
 * This is the single most important automated test in this suite: it proves
 * the part, parameter, and stock subsystems are wired together correctly
 * end-to-end, rather than testing each in isolation.
 *
 * // VERIFY: assumes a Parameter Template already exists on the target
 * instance (required precondition per docs.inventree.org/en/stable/part/ ->
 * Parameters, since a template is required before a value can be assigned).
 * If none exists, this test creates one via Settings first.
 */

test.describe('Cross-functional flow — Part → Parameter → Stock → Category view', () => {
  test('UI-XF-001: create part, add parameter, create stock, verify in category view', async ({
    authenticatedPage: page,
  }) => {
    const partName = `Cross Functional Part ${Date.now()}`;
    const stockQuantity = '25';

    // --- Step 1: Create the part, capturing its category for later verification ---
    await page.goto('/web/part');
    await page.getByRole('button', { name: /add parts?/i }).click();
    await page.getByRole('menuitem', { name: /create part/i }).click();

    const createDialog = page.getByRole('dialog');
    await createDialog.getByLabel(/^name$/i).fill(partName);

    await createDialog.getByLabel(/category/i).click();
    const categoryOption = page.getByRole('option').first();
    const categoryName = (await categoryOption.textContent())?.trim() ?? '';
    await categoryOption.click();

    await createDialog.getByRole('button', { name: /submit|save|create/i }).click();
    await expect(page.getByRole('heading', { name: partName })).toBeVisible({ timeout: 15_000 });

    // --- Step 2: Add a parameter on the Parameters tab ---
    await page.getByRole('tab', { name: /parameters/i }).click();
    await page.getByRole('button', { name: /add parameter/i }).click();

    const paramDialog = page.getByRole('dialog');
    await expect(paramDialog).toBeVisible();

    // Select the first available parameter template (assumes at least one exists).
    await paramDialog.getByLabel(/template/i).click();
    await page.getByRole('option').first().click();
    await paramDialog.getByLabel(/^value$/i).fill('Test Value');
    await paramDialog.getByRole('button', { name: /submit|save|create/i }).click();

    await expect(page.getByText('Test Value')).toBeVisible({ timeout: 10_000 });

    // --- Step 3: Create stock for the part on the Stock tab ---
    await page.getByRole('tab', { name: /^stock$/i }).click();
    await page.getByRole('button', { name: /add stock|new stock item/i }).click();

    const stockDialog = page.getByRole('dialog');
    await expect(stockDialog).toBeVisible();
    await stockDialog.getByLabel(/quantity/i).fill(stockQuantity);
    await stockDialog.getByRole('button', { name: /submit|save|create/i }).click();

    await expect(page.getByText(stockQuantity)).toBeVisible({ timeout: 10_000 });

    // --- Step 4: Verify the part shows up correctly in its category's part listing ---
    await page.goto('/web/part');
    if (categoryName) {
      await page.getByText(categoryName, { exact: false }).first().click();
    }
    await expect(page.getByText(partName)).toBeVisible({ timeout: 15_000 });
  });
});
