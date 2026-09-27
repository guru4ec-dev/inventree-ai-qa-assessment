import { test as base, APIRequestContext, request } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.INVENTREE_BASE_URL ?? 'http://localhost:8000';
const USERNAME = process.env.INVENTREE_USERNAME ?? 'admin';
const PASSWORD = process.env.INVENTREE_PASSWORD ?? '';

/**
 * InvenTree's DRF API accepts HTTP Basic Auth out of the box, which keeps this
 * fixture simple and version-independent (no need to hit a token-issuing
 * endpoint whose exact path can differ between InvenTree releases).
 *
 * // VERIFY: if your instance has Basic Auth disabled in favour of token-only
 * auth, replace this with a call to your instance's token endpoint
 * (historically `GET /api/user/token/` with Basic Auth to mint a token, then
 * send `Authorization: Token <token>` on subsequent requests) and swap the
 * `httpCredentials` block below for an `extraHTTPHeaders` Authorization header.
 */
export const test = base.extend<{ apiContext: APIRequestContext }>({
  apiContext: async ({}, use) => {
    const context = await request.newContext({
      baseURL: BASE_URL,
      httpCredentials: {
        username: USERNAME,
        password: PASSWORD,
      },
      extraHTTPHeaders: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
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
