import { test as base, APIRequestContext, request } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.INVENTREE_BASE_URL ?? 'http://localhost:8000';
const USERNAME = process.env.INVENTREE_USERNAME ?? 'admin';
const PASSWORD = process.env.INVENTREE_PASSWORD ?? '';
const API_TOKEN = process.env.INVENTREE_API_TOKEN;

/**
 * A static token can be supplied for CI. Otherwise send Basic Auth explicitly;
 * this works with InvenTree deployments that do not expose a token endpoint.
 */
export const test = base.extend<{ apiContext: APIRequestContext }>({
  apiContext: async ({}, use) => {
    const authorization = API_TOKEN
      ? `Token ${API_TOKEN}`
      : `Basic ${Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64')}`;
    const context = await request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: authorization,
      },
    });
    await use(context);
    await context.dispose();
  },
});

export { expect } from '@playwright/test';

/** Convenience: build an unauthenticated context for 401/403 test cases. */
export async function newUnauthenticatedContext(): Promise<APIRequestContext> {
  return request.newContext({
    baseURL: BASE_URL,
    extraHTTPHeaders: { Accept: 'application/json', 'Content-Type': 'application/json' },
  });
}

/** Convenience: build a context with a deliberately invalid token/credentials. */
export async function newInvalidAuthContext(): Promise<APIRequestContext> {
  return request.newContext({
    baseURL: BASE_URL,
    extraHTTPHeaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Token this-is-not-a-real-token',
    },
  });
}

/** Generates a unique-ish suffix so parallel/repeat test runs don't collide on unique fields like IPN/name. */
export function uniqueSuffix(): string {
  return `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}
