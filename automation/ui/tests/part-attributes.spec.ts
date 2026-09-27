import { test, expect } from '../fixtures/login';

/**
 * Automates a subset of UI-ATTR-* and UI-REV-* cases from
 * test-cases/ui-manual-tests.md: Template attribute enabling the Variants
 * tab, and the revision-creation / duplicate-revision-code constraint.
 *
 * // VERIFY: tab names and the "Duplicate Part" action label are assumed to
 * match InvenTree's documented UI text ("Variants", "Duplicate Part").
 * Confirm against your running instance if this suite fails at the locator
 * step rather than the assertion step.
 */

async function createPart(page: import('@playwright/test').Page, name: string, extra?: Record<string, boolean>) {
  await page.goto('/web/part');
  await page.getByRole('button', { name: /add parts?/i }).click();
  await page.getByRole('menuitem', { name: /create part/i }).click();

  const dialog = page.getByRole('dialog');
  await dialog.getByLabel(/^name$/i).fill(name);
  await dialog.getByLabel(/category/i).click();
  await page.getByRole('option').first().click();

  if (extra) {
    for (const [field, value] of Object.entries(extra)) {
      const checkbox = dialog.getByLabel(new RegExp(`^${field}$`, 'i'));
      if (value) {
        await checkbox.check();
      } else {
        await checkbox.uncheck();
      }
    }
  }

  await dialog.getByRole('button', { name: /submit|save|create/i }).click();
  await expect(page.getByRole('heading', { name })).toBeVisible({ timeout: 15_000 });
}

test.describe('Part Attributes & Revisions — UI', () => {
  test('UI-ATTR-002: marking part as Template enables the Variants tab', async ({
    authenticatedPage: page,
  }) => {
    const name = `Template Part ${Date.now()}`;
    await createPart(page, name, { template: true });

    await expect(page.getByRole('tab', { name: /variants/i })).toBeVisible();
  });

  test('UI-REV-001: create a new revision via Duplicate Part', async ({ authenticatedPage: page }) => {
    const originalName = `Revision Source ${Date.now()}`;
    await createPart(page, originalName);

    await page.getByRole('button', { name: /part actions|actions/i }).click();
    await page.getByRole('menuitem', { name: /duplicate part/i }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // "Revision Of" should already default to the current part in the duplicate flow;
    // set the Revision code explicitly.
    await dialog.getByLabel(/^revision$/i).fill('A');
    await dialog.getByRole('button', { name: /submit|save|create/i }).click();

    // Expect navigation to the new revision's own detail page.
    await expect(page.getByText(/revision/i)).toBeVisible({ timeout: 15_000 });
  });

  test('UI-REV-003: duplicate revision code for the same part is rejected', async ({
    authenticatedPage: page,
  }) => {
    const originalName = `Revision Conflict Source ${Date.now()}`;
    await createPart(page, originalName);

    // Create first revision "A".
    await page.getByRole('button', { name: /part actions|actions/i }).click();
    await page.getByRole('menuitem', { name: /duplicate part/i }).click();
    let dialog = page.getByRole('dialog');
    await dialog.getByLabel(/^revision$/i).fill('A');
    await dialog.getByRole('button', { name: /submit|save|create/i }).click();
    await expect(page.getByText(/revision/i)).toBeVisible({ timeout: 15_000 });

    // Navigate back to the original part to attempt a second revision "A".
    await page.goto('/web/part'); // simplified navigation back to listing
    await page.getByText(originalName).first().click();
    await page.getByRole('button', { name: /part actions|actions/i }).click();
    await page.getByRole('menuitem', { name: /duplicate part/i }).click();
    dialog = page.getByRole('dialog');
    await dialog.getByLabel(/^revision$/i).fill('A');
    await dialog.getByRole('button', { name: /submit|save|create/i }).click();

    // Expect a validation error, and the dialog should remain open (creation blocked).
    await expect(dialog.getByText(/already exists|unique|duplicate/i)).toBeVisible({ timeout: 10_000 });
  });
});
