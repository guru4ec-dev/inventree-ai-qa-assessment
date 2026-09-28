import { APIRequestContext } from '@playwright/test';
import { test, expect, newUnauthenticatedContext, newInvalidAuthContext, uniqueSuffix } from '../fixtures/api-client';

interface CategoryResponse {
  pk: number;
  name: string;
  parent: number | null;
}

interface PartResponse {
  pk: number;
  name: string;
  category: number;
  IPN?: string | null;
  description?: string | null;
  active?: boolean;
}

async function createCategory(apiContext: APIRequestContext): Promise<CategoryResponse> {
  const name = `API Parts ${uniqueSuffix()}`;
  const response = await apiContext.post('/api/part/category/', {
    data: { name, description: 'Created by parts-api.spec.ts' },
  });
  expect(response.status(), await response.text()).toBe(201);
  const body = (await response.json()) as CategoryResponse;
  expect(body).toMatchObject({ name, parent: null });
  expect(body.pk).toEqual(expect.any(Number));
  return body;
}

test.describe('Parts API — CRUD, validation, relationships, and filtering', () => {
  test('API-PART-001: creates a part with a valid minimal payload', async ({ apiContext }) => {
    const category = await createCategory(apiContext);
    const payload = { name: `API Part ${uniqueSuffix()}`, category: category.pk };

    const response = await apiContext.post('/api/part/', { data: payload });
    expect(response.status(), await response.text()).toBe(201);
    const body = (await response.json()) as PartResponse;

    expect(body).toMatchObject(payload);
    expect(body.pk).toEqual(expect.any(Number));
  });

  test('API-PART-002: creates and returns optional part fields', async ({ apiContext }) => {
    const category = await createCategory(apiContext);
    const payload = {
      name: `Full API Part ${uniqueSuffix()}`,
      category: category.pk,
      description: 'Full payload',
      IPN: `IPN-${uniqueSuffix()}`,
      units: 'pcs',
      active: true,
      assembly: false,
      component: true,
      purchaseable: true,
      salable: true,
      trackable: false,
      virtual: false,
      is_template: false,
    };

    const response = await apiContext.post('/api/part/', { data: payload });
    expect(response.status(), await response.text()).toBe(201);
    const body = await response.json();

    for (const [field, value] of Object.entries(payload)) {
      expect(body[field], `response field ${field}`).toBe(value);
    }
  });

  test('API-PART-003: retrieves and patches a part without losing existing data', async ({ apiContext }) => {
    const category = await createCategory(apiContext);
    const createResponse = await apiContext.post('/api/part/', {
      data: { name: `Patchable ${uniqueSuffix()}`, category: category.pk, description: 'before' },
    });
    expect(createResponse.status(), await createResponse.text()).toBe(201);
    const created = (await createResponse.json()) as PartResponse;

    const getResponse = await apiContext.get(`/api/part/${created.pk}/`);
    expect(getResponse.status()).toBe(200);
    expect((await getResponse.json()).pk).toBe(created.pk);

    const patchResponse = await apiContext.patch(`/api/part/${created.pk}/`, {
      data: { description: 'after' },
    });
    expect(patchResponse.status(), await patchResponse.text()).toBe(200);
    expect((await patchResponse.json())).toMatchObject({
      pk: created.pk,
      name: created.name,
      description: 'after',
    });
  });

  test('API-PART-004: deletes an independent part and returns 404 afterwards', async ({ apiContext }) => {
    const category = await createCategory(apiContext);
    const createResponse = await apiContext.post('/api/part/', {
      data: { name: `Disposable ${uniqueSuffix()}`, category: category.pk },
    });
    expect(createResponse.status(), await createResponse.text()).toBe(201);
    const part = (await createResponse.json()) as PartResponse;

    const deleteResponse = await apiContext.delete(`/api/part/${part.pk}/`);
    expect(deleteResponse.status(), await deleteResponse.text()).toBe(204);
    expect((await apiContext.get(`/api/part/${part.pk}/`)).status()).toBe(404);
  });

  test('API-PART-005: missing required name returns a client error', async ({ apiContext }) => {
    const category = await createCategory(apiContext);
    const response = await apiContext.post('/api/part/', { data: { category: category.pk } });
    expect(response.status()).toBe(400);
    expect(await response.json()).toHaveProperty('name');
  });

  test('API-PART-006: invalid category relationship returns a client error', async ({ apiContext }) => {
    const response = await apiContext.post('/api/part/', {
      data: { name: `Invalid Category ${uniqueSuffix()}`, category: 999999999 },
    });
    expect(response.status()).toBe(400);
  });

  test('API-PART-007: read-only primary key cannot be supplied by the client', async ({ apiContext }) => {
    const category = await createCategory(apiContext);
    const response = await apiContext.post('/api/part/', {
      data: { pk: 123456789, name: `Read Only ${uniqueSuffix()}`, category: category.pk },
    });
    expect(response.status()).toBe(400);
  });

  test('API-PART-008: invalid boolean type is rejected or normalized consistently', async ({ apiContext }) => {
    const category = await createCategory(apiContext);
    const response = await apiContext.post('/api/part/', {
      data: { name: `Boolean Boundary ${uniqueSuffix()}`, category: category.pk, active: 'not-a-boolean' },
    });
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });

  test('API-PART-009: variant_of links a variant to a template', async ({ apiContext }) => {
    const category = await createCategory(apiContext);
    const templateResponse = await apiContext.post('/api/part/', {
      data: { name: `Template ${uniqueSuffix()}`, category: category.pk, is_template: true },
    });
    expect(templateResponse.status(), await templateResponse.text()).toBe(201);
    const template = (await templateResponse.json()) as PartResponse;

    const variantResponse = await apiContext.post('/api/part/', {
      data: { name: `Variant ${uniqueSuffix()}`, category: category.pk, variant_of: template.pk },
    });
    expect(variantResponse.status(), await variantResponse.text()).toBe(201);
    expect((await variantResponse.json()).variant_of).toBe(template.pk);
  });

  test('API-PART-010: revision_of accepts a valid revision and rejects self-reference', async ({ apiContext }) => {
    const category = await createCategory(apiContext);
    const originalResponse = await apiContext.post('/api/part/', {
      data: { name: `Original ${uniqueSuffix()}`, category: category.pk },
    });
    expect(originalResponse.status(), await originalResponse.text()).toBe(201);
    const original = (await originalResponse.json()) as PartResponse;

    const revisionResponse = await apiContext.post('/api/part/', {
      data: {
        name: `Revision ${uniqueSuffix()}`,
        category: category.pk,
        revision_of: original.pk,
        revision: `R-${uniqueSuffix()}`,
      },
    });
    expect(revisionResponse.status(), await revisionResponse.text()).toBe(201);

    const selfResponse = await apiContext.patch(`/api/part/${original.pk}/`, {
      data: { revision_of: original.pk },
    });
    expect(selfResponse.status()).toBe(400);
  });

  test('API-PART-011: lists parts with search and category filtering', async ({ apiContext }) => {
    const category = await createCategory(apiContext);
    const marker = `Searchable-${uniqueSuffix()}`;
    const createResponse = await apiContext.post('/api/part/', {
      data: { name: marker, category: category.pk },
    });
    expect(createResponse.status(), await createResponse.text()).toBe(201);

    const response = await apiContext.get(`/api/part/?category=${category.pk}&search=${encodeURIComponent(marker)}`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('results');
    expect(body.results.some((part: PartResponse) => part.name === marker)).toBe(true);
  });

  test('API-PART-012: invalid filters do not produce a server error', async ({ apiContext }) => {
    const response = await apiContext.get('/api/part/?active=not-a-boolean');
    expect(response.status()).toBeLessThan(500);
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('API-PART-013: unauthenticated and invalid-token requests are rejected', async () => {
    const unauthenticated = await newUnauthenticatedContext();
    const invalid = await newInvalidAuthContext();
    try {
      expect((await unauthenticated.get('/api/part/')).status()).toBe(401);
      expect((await invalid.get('/api/part/')).status()).toBe(401);
    } finally {
      await unauthenticated.dispose();
      await invalid.dispose();
    }
  });

  test('API-PART-014: malformed JSON returns a client error, not 500', async ({ apiContext }) => {
    const response = await apiContext.post('/api/part/', {
      headers: { 'Content-Type': 'application/json' },
      data: '{"name":"unterminated' as any,
    });
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });
});
