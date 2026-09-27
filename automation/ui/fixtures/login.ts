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
  const loginUrl = `${baseURL}/web/login`;
  await page.goto(loginUrl);
  const csrfCookie = (await page.context().cookies(baseURL)).find(cookie => cookie.name === 'csrftoken');
  const response = await page.request.post(`${baseURL}/api/auth/v1/auth/login`, {
    data: { username: USERNAME, password: PASSWORD },
    headers: {
      Referer: loginUrl,
      ...(csrfCookie ? { 'X-CSRFToken': csrfCookie.value } : {}),
    },
  });
  if (!response.ok()) {
    throw new Error(`UI login failed (${response.status()}): ${await response.text()}`);
  }
  await page.goto(baseURL + '/web/part');
  await page.getByRole('tab').getByRole('link', { name: 'Parts', exact: true }).click();
}

export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page, baseURL }, use) => {
    await login(page, baseURL ?? 'http://localhost:8000');
    await use(page);
  },
});

export { expect };
