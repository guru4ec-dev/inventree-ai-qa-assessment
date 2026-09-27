import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  fullyParallel: false, // API tests share/create data; run serially to avoid cross-test interference
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.INVENTREE_BASE_URL ?? 'http://localhost:8000',
    extraHTTPHeaders: {
      Accept: 'application/json',
    },
  },
});
