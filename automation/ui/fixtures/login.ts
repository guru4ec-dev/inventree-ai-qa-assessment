import { test as base, expect, Page } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

const USERNAME = process.env.INVENTREE_USERNAME ?? 'admin';
const PASSWORD = process.env.INVENTREE_PASSWORD ?? '';

/**
 * Logs into InvenTree's React web UI and returns an authenticated page.
 *
 * // VERIFY: InvenTree's login form field labels/placeholders are used here
 * (role=textbox with accessible name "Username" / "Password", and a
 * role=button named "Log in"). These match the standard Mantine-based
 * InvenTree login form as of the current stable UI, but should be
 * spot-checked against your running instance — if the exact accessible
 * names differ, update the locators below (this is the single place
 * login logic lives, so a fix here propagates to every test).
 */
export async function login(page: Page, baseURL: string): Promise<void> {
  await page.goto(baseURL + '/web/login');

  const usernameField = page.getByLabel(/username/i);
  const passwordField = page.getByLabel(/password/i);

  await usernameField.fill(USERNAME);
  await passwordField.fill(PASSWORD);

  await page.getByRole('button', { name: /log ?in|sign ?in/i }).click();

  // Wait for redirect away from the login page as confirmation of success.
  await expect(page).not.toHaveURL(/\/web\/login/, { timeout: 15_000 });
}

export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page, baseURL }, use) => {
    await login(page, baseURL ?? 'http://localhost:8000');
    await use(page);
  },
});

export { expect };
