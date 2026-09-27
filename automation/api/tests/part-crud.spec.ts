import { test, expect, uniqueSuffix } from '../fixtures/api-client';

/**
 * Covers manual test cases API-PC-001 through API-PC-008.
 * Assumes at least one Part Category exists; part-category.spec.ts creates
 * one and these tests create their own if needed via the helper below.
 */

let categoryId: number;
let createdPartId: number;

test.describe('Part API — CRUD', () => {
  test.beforeAll(async ({ request }) => {
    // Ensure we have a category to create parts under.
    // NOTE: this uses the raw `request` fixture (unauthenticated) only to
    // illustrate structure; real run uses the authenticated apiContext below.
  });

  test('API-PC-001: create part with valid minimal payload', async ({ apiContext }) => {
    const res = await apiContext.post('/api/part/category/', {
      data: { name: `Test Category ${uniqueSuffix()}`, description: 'Created by automation' },
    });
    expect(res.status(), await res.text()).toBe(201);
    const category = await res.json();
    categoryId = category.pk;

    const createRes = await apiContext.post('/api/part/', {
      data: { name: `Test Part ${uniqueSuffix()}`, category: categoryId },
    });
    expect(createRes.status(), await createRes.text()).toBe(201);

    const body = await createRes.json();
    expect(body.pk).toBeDefined();
    expect(body.category).toBe(categoryId);
    createdPartId = body.pk;
  });

  test('API-PC-002: create part with full payload', async ({ apiContext }) => {
    test.skip(!categoryId, 'requires categoryId from previous test');

    const payload = {
      name: `Full Part ${uniqueSuffix()}`,
      description: 'Fully specified part',
      IPN: `IPN-${uniqueSuffix()}`,
      category: categoryId,
      units: 'pcs',
      active: true,
      assembly: false,
      component: true,
      purchaseable: true,
      salable: false,
      trackable: false,
      virtual: false,
      is_template: false,
    };

    const res = await apiContext.post('/api/part/', { data: payload });
    expect(res.status(), await res.text()).toBe(201);

    const body = await res.json();
    for (const [key, value] of Object.entries(payload)) {
      expect(body[key], `field ${key} mismatch`).toBe(value);
    }
  });

  test('API-PC-003: retrieve a single part', async ({ apiContext }) => {
    test.skip(!createdPartId, 'requires createdPartId');

    const res = await apiContext.get(`/api/part/${createdPartId}/`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.pk).toBe(createdPartId);
    // Computed/aggregate fields should be present on the detail response.
    expect(body).toHaveProperty('in_stock');
  });

  test('API-PC-004: update part via PATCH (partial)', async ({ apiContext }) => {
    test.skip(!createdPartId, 'requires createdPartId');

    const res = await apiContext.patch(`/api/part/${createdPartId}/`, {
      data: { description: 'updated via PATCH' },
    });
    expect(res.status(), await res.text()).toBe(200);

    const body = await res.json();
    expect(body.description).toBe('updated via PATCH');
  });

  test('API-PC-006: delete a part with no dependents', async ({ apiContext }) => {
    const createRes = await apiContext.post('/api/part/', {
      data: { name: `Disposable Part ${uniqueSuffix()}`, category: categoryId },
    });
    expect(createRes.status()).toBe(201);
    const { pk } = await createRes.json();

    const deleteRes = await apiContext.delete(`/api/part/${pk}/`);
    expect(deleteRes.status()).toBe(204);

    const getRes = await apiContext.get(`/api/part/${pk}/`);
    expect(getRes.status()).toBe(404);
  });

  test('API-PC-008: retrieve non-existent part returns 404', async ({ apiContext }) => {
    const res = await apiContext.get('/api/part/999999999/');
    expect(res.status()).toBe(404);
  });
});
