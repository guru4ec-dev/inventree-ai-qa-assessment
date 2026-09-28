import { Page } from '@playwright/test';
import { test, expect } from '../fixtures/login';

const PARTS_HOME = '/web/part';

async function openPartsList(page: Page): Promise<void> {
  await page.goto(PARTS_HOME);
  // The top navigation and the Part Category panel both expose a Parts link.
  await page.getByRole('tab').getByRole('link', { name: 'Parts', exact: true }).first().click();
  await page.getByRole('tablist', { name: 'panel-tabs-partcategory' })
    .getByRole('link', { name: 'Parts', exact: true })
    .click();
}

async function openCreatePart(page: Page): Promise<void> {
  await openPartsList(page);
  // VERIFY: action-menu names are exposed by the current InvenTree UI build.
  await page.getByRole('button', { name: 'action-menu-add-parts' }).click();
  await page.getByRole('menuitem', { name: 'action-menu-add-parts-create-' }).click();
}

test.describe('Parts UI workflows', () => {
  test('UI-PART-001: create a part with recorded accessible controls', async ({ authenticatedPage: page }) => {
    const suffix = Date.now();
    const name = `E2E Part ${suffix}`;

    await openCreatePart(page);
    await page.getByRole('textbox', { name: 'tree-field-category' }).click();
    // VERIFY: the category tree option must be scoped to the open picker in each target UI build.
    await page.getByText('Consumables', { exact: true }).last().click();
    await page.getByRole('textbox', { name: 'text-field-name' }).fill(name);
    await page.getByRole('textbox', { name: 'text-field-IPN' }).fill(`E2E-IPN-${suffix}`);
    await page.getByRole('textbox', { name: 'text-field-description' }).fill('Created by parts-e2e.spec.ts');
    await page.getByRole('textbox', { name: 'text-field-revision' }).fill(`E2E-REV-${suffix}`);
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByText(name, { exact: true })).toBeVisible();
  });

  test('UI-PART-002: required name validation prevents an empty part', async ({ authenticatedPage: page }) => {
    await openCreatePart(page);
    await page.getByRole('textbox', { name: 'tree-field-category' }).click();
    // VERIFY: use the category option visible in the current tree picker.
    await page.getByText('Consumables', { exact: true }).last().click();
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByRole('dialog')).toContainText(/name|required/i);
  });

  test('UI-PART-003: template exposes the Variants workflow', async ({ authenticatedPage: page }) => {
    await openCreatePart(page);
    await page.getByRole('textbox', { name: 'tree-field-category' }).click();
    await page.getByText('Consumables', { exact: true }).last().click();
    await page.getByRole('textbox', { name: 'text-field-name' }).fill(`Template ${Date.now()}`);
    // VERIFY: boolean-field-is_template is the current accessible name for the Template toggle.
    await page.getByRole('checkbox', { name: 'boolean-field-is_template' }).check();
    await page.getByRole('button', { name: 'Submit' }).click();

    // VERIFY: the Variants tab label may be localized or feature-gated.
    await expect(page.getByRole('link', { name: /variants/i })).toBeVisible();
  });

  test('UI-PART-004: edit a part attribute and verify the detail state', async ({ authenticatedPage: page }) => {
    const suffix = Date.now();
    await openCreatePart(page);
    await page.getByRole('textbox', { name: 'tree-field-category' }).click();
    await page.getByText('Consumables', { exact: true }).last().click();
    await page.getByRole('textbox', { name: 'text-field-name' }).fill(`Attribute Part ${suffix}`);
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText(`Attribute Part ${suffix}`, { exact: true })).toBeVisible();

    // VERIFY: action-menu/edit labels can vary with enabled permissions.
    await page.getByRole('button', { name: /action-menu|edit part/i }).click();
    await page.getByRole('menuitem', { name: /edit/i }).click();
    await page.getByRole('checkbox', { name: 'boolean-field-active' }).uncheck();
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText(/inactive/i)).toBeVisible();
  });

  test('UI-PART-005: create part, add a parameter, create stock, and verify category view', async ({ authenticatedPage: page }) => {
    const suffix = Date.now();
    await openCreatePart(page);
    await page.getByRole('textbox', { name: 'tree-field-category' }).click();
    await page.getByText('Consumables', { exact: true }).last().click();
    await page.getByRole('textbox', { name: 'text-field-name' }).fill(`Cross Functional Part ${suffix}`);
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText(`Cross Functional Part ${suffix}`, { exact: true })).toBeVisible();

    // VERIFY: parameter and stock action labels depend on the enabled Parts features.
    await page.getByRole('link', { name: /parameters/i }).click();
    await page.getByRole('button', { name: /add parameter|new parameter/i }).click();
    await page.getByRole('button', { name: /submit|save/i }).click();
    await page.getByRole('link', { name: /stock/i }).click();
    await page.getByRole('button', { name: /new stock item|add stock/i }).click();
    await page.getByRole('button', { name: /submit|save|create/i }).click();
    await openPartsList(page);
    await expect(page.getByText(`Cross Functional Part ${suffix}`, { exact: true })).toBeVisible();
  });
});
