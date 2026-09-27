import {
  test,
  expect,
  uniqueSuffix,
  newUnauthenticatedContext,
  newInvalidAuthContext,
} from '../fixtures/api-client';

/**
 * Covers manual test cases API-CAT-001 through API-CAT-006,
 * relational integrity (API-REL-*), and auth/edge cases (API-EDGE-*).
 */

test.describe('Part API — Categories, Relational Integrity, Edge Cases', () => {
  test('API-CAT-001: create a top-level category', async ({ apiContext }) => {
    const res = await apiContext.post('/api/part/category/', {
      data: { name: `Top Level ${uniqueSuffix()}` },
    });
    expect(res.status(), await res.text()).toBe(201);
    const body = await res.json();
    expect(body.parent).toBeNull();
  });

  test('API-CAT-002: create a nested (child) category', async ({ apiContext }) => {
    const parentRes = await apiContext.post('/api/part/category/', {
      data: { name: `Parent ${uniqueSuffix()}` },
    });
    expect(parentRes.status()).toBe(201);
    const parent = await parentRes.json();

    const childRes = await apiContext.post('/api/part/category/', {
      data: { name: `Child ${uniqueSuffix()}`, parent: parent.pk },
    });
    expect(childRes.status(), await childRes.text()).toBe(201);
    const child = await childRes.json();
    expect(child.parent).toBe(parent.pk);
  });

  test('API-CAT-004: update category name', async ({ apiContext }) => {
    const createRes = await apiContext.post('/api/part/category/', {
      data: { name: `Original ${uniqueSuffix()}` },
    });
    const category = await createRes.json();

    const patchRes = await apiContext.patch(`/api/part/category/${category.pk}/`, {
      data: { name: 'Renamed Category' },
    });
    expect(patchRes.status()).toBe(200);
    const updated = await patchRes.json();
    expect(updated.name).toBe('Renamed Category');
  });

  test('API-CAT-005: deleting a category containing parts does not silently orphan them', async ({
    apiContext,
  }) => {
    const catRes = await apiContext.post('/api/part/category/', {
      data: { name: `Has Parts ${uniqueSuffix()}` },
    });
    const category = await catRes.json();

    const partRes = await apiContext.post('/api/part/', {
      data: { name: `Orphan Risk Part ${uniqueSuffix()}`, category: category.pk },
    });
    expect(partRes.status()).toBe(201);
    const part = await partRes.json();

    const deleteRes = await apiContext.delete(`/api/part/category/${category.pk}/`);

    if (deleteRes.status() === 204) {
      // Deletion succeeded — verify the part was reassigned (e.g. to parent/null)
      // rather than left pointing at a now-nonexistent category.
      const partAfter = await apiContext.get(`/api/part/${part.pk}/`);
      expect(partAfter.status()).toBe(200);
      const partBody = await partAfter.json();
      expect(partBody.category).not.toBe(category.pk);
    } else {
      // Deletion was blocked — this is the safer documented contract.
      expect(deleteRes.status()).toBeGreaterThanOrEqual(400);
      expect(deleteRes.status()).toBeLessThan(500);
    }
  });

  test('API-REL-001: category assignment rejects non-existent category id', async ({ apiContext }) => {
    const res = await apiContext.post('/api/part/', {
      data: { name: `Bad Category Part ${uniqueSuffix()}`, category: 999999999 },
    });
    expect(res.status()).toBe(400);
  });

  test('API-REL-005: variant_of correctly links variant to template', async ({ apiContext }) => {
    const catRes = await apiContext.post('/api/part/category/', {
      data: { name: `Variant Test Category ${uniqueSuffix()}` },
    });
    const category = await catRes.json();

    const templateRes = await apiContext.post('/api/part/', {
      data: { name: `Template ${uniqueSuffix()}`, category: category.pk, is_template: true },
    });
    expect(templateRes.status()).toBe(201);
    const template = await templateRes.json();

    const variantRes = await apiContext.post('/api/part/', {
      data: { name: `Variant ${uniqueSuffix()}`, category: category.pk, variant_of: template.pk },
    });
    expect(variantRes.status(), await variantRes.text()).toBe(201);
    const variant = await variantRes.json();
    expect(variant.variant_of).toBe(template.pk);
  });

  test('API-EDGE-001: invalid JSON payload returns 400, not 500', async ({ apiContext }) => {
    const res = await apiContext.post('/api/part/', {
      headers: { 'Content-Type': 'application/json' },
      data: '{"name": "unterminated string, missing brace"' as any,
    });
    expect(res.status()).toBeLessThan(500);
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test('API-EDGE-002: unauthorized access without credentials returns 401', async () => {
    const ctx = await newUnauthenticatedContext();
    const res = await ctx.get('/api/part/');
    expect(res.status()).toBe(401);
    await ctx.dispose();
  });

  test('API-EDGE-003: invalid token returns 401', async () => {
    const ctx = await newInvalidAuthContext();
    const res = await ctx.get('/api/part/');
    expect(res.status()).toBe(401);
    await ctx.dispose();
  });

  test('API-EDGE-005: duplicate unique revision code returns 400, not 500', async ({ apiContext }) => {
    const catRes = await apiContext.post('/api/part/category/', {
      data: { name: `Revision Conflict Category ${uniqueSuffix()}` },
    });
    const category = await catRes.json();

    const originalRes = await apiContext.post('/api/part/', {
      data: { name: `Original ${uniqueSuffix()}`, category: category.pk },
    });
    const original = await originalRes.json();

    const revisionARes = await apiContext.post('/api/part/', {
      data: {
        name: `Revision A ${uniqueSuffix()}`,
        category: category.pk,
        revision_of: original.pk,
        revision: 'A',
      },
    });
    expect(revisionARes.status(), await revisionARes.text()).toBe(201);

    const duplicateRevisionRes = await apiContext.post('/api/part/', {
      data: {
        name: `Revision A Duplicate ${uniqueSuffix()}`,
        category: category.pk,
        revision_of: original.pk,
        revision: 'A',
      },
    });
    expect(duplicateRevisionRes.status()).toBeGreaterThanOrEqual(400);
    expect(duplicateRevisionRes.status()).toBeLessThan(500);
  });

  test('API-EDGE-008: empty result set for a non-matching search returns 200 with count 0', async ({
    apiContext,
  }) => {
    const res = await apiContext.get('/api/part/?search=zzznonexistentsearchterm12345zzz');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.count).toBe(0);
    expect(body.results).toEqual([]);
  });
});
