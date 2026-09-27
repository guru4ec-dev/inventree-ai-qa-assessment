import { test, expect } from '../fixtures/login';

/**
 * Automates UI-PC-001 through UI-PC-003 from test-cases/ui-manual-tests.md.
 *
 * // VERIFY: selectors below assume InvenTree's standard React/Mantine UI
 * conventions — form fields addressed by accessible label (getByLabel),
 * buttons by accessible role+name (getByRole). Where InvenTree exposes
 * `data-testid` attributes on key elements, prefer swapping to
 * page.getByTestId(...) for stability, since label text can be affected by
 * localization settings on some instances.
 */

test.describe('Part CRUD — UI', () => {
  test('UI-PC-001: create part via manual entry with required fields only', async ({
    authenticatedPage: page,
  }) => {
    const uniqueName = `Automated Part ${Date.now()}`;

    await page.goto('/web/part');
    await page.getByRole('button', { name: /add parts?/i }).click();
    await page.getByRole('menuitem', { name: /create part/i }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await dialog.getByLabel(/^name$/i).fill(uniqueName);

    // Category is typically a searchable combobox — open it and pick the first result.
    await dialog.getByLabel(/category/i).click();
    await page.getByRole('option').first().click();

    await dialog.getByRole('button', { name: /submit|save|create/i }).click();

    // On success, expect navigation to the new part's detail page showing the name.
    await expect(page.getByRole('heading', { name: uniqueName })).toBeVisible({ timeout: 15_000 });
  });

  test('UI-PC-003: creating a part without a name shows a validation error', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/web/part');
    await page.getByRole('button', { name: /add parts?/i }).click();
    await page.getByRole('menuitem', { name: /create part/i }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Deliberately leave Name blank; attempt submit.
    await dialog.getByRole('button', { name: /submit|save|create/i }).click();

    // Expect an inline validation message rather than a silent no-op or a crash.
    await expect(dialog.getByText(/this field is required|required/i)).toBeVisible();
    // Dialog should remain open — part must not have been created.
    await expect(dialog).toBeVisible();
  });

  test('UI-ATTR-008: toggle part Active/Inactive via edit form', async ({ authenticatedPage: page }) => {
    // Precondition: create a throwaway part to toggle.
    const uniqueName = `Toggle Active ${Date.now()}`;
    await page.goto('/web/part');
    await page.getByRole('button', { name: /add parts?/i }).click();
    await page.getByRole('menuitem', { name: /create part/i }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel(/^name$/i).fill(uniqueName);
    await dialog.getByLabel(/category/i).click();
    await page.getByRole('option').first().click();
    await dialog.getByRole('button', { name: /submit|save|create/i }).click();
    await expect(page.getByRole('heading', { name: uniqueName })).toBeVisible({ timeout: 15_000 });

    // Open edit form for the part.
    await page.getByRole('button', { name: /edit part|actions/i }).click();
    await page.getByRole('menuitem', { name: /edit/i }).click();

    const editDialog = page.getByRole('dialog');
    const activeCheckbox = editDialog.getByLabel(/^active$/i);
    await expect(activeCheckbox).toBeChecked(); // active by default
    await activeCheckbox.uncheck();
    await editDialog.getByRole('button', { name: /submit|save/i }).click();

    // Expect some visible inactive indicator on the detail page (badge/label).
    await expect(page.getByText(/inactive/i)).toBeVisible({ timeout: 10_000 });
  });
});
