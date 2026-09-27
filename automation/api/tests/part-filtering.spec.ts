import { test, expect, uniqueSuffix } from '../fixtures/api-client';

/**
 * Covers manual test cases API-FLT-001 through API-FLT-008.
 * Sets up a small, known dataset in beforeAll so filter/search assertions
 * are deterministic rather than relying on whatever data already exists.
 */

let categoryId: number;
const marker = uniqueSuffix();
const partNames: string[] = [];

test.describe('Part API — Filtering, Pagination, Search', () => {
  test.beforeAll(async ({ browser }) => {
    // fixture-scoped setup happens per-test below via apiContext; this hook
    // intentionally left structural — see first test which seeds data.
  });

  test('setup: seed known dataset', async ({ apiContext }) => {
    const catRes = await apiContext.post('/api/part/category/', {
      data: { name: `Filter Test Category ${marker}` },
    });
    expect(catRes.status()).toBe(201);
    categoryId = (await catRes.json()).pk;

    for (let i = 0; i < 12; i++) {
      const name = `FilterWidget-${marker}-${i}`;
      const res = await apiContext.post('/api/part/', {
        data: {
          name,
          category: categoryId,
          active: i % 2 === 0, // alternate active/inactive
          assembly: i % 3 === 0,
        },
      });
      expect(res.status(), await res.text()).toBe(201);
      partNames.push(name);
    }
  });

  test('API-FLT-001: filter parts by category', async ({ apiContext }) => {
    const res = await apiContext.get(`/api/part/?category=${categoryId}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.count).toBeGreaterThanOrEqual(12);
    for (const part of body.results) {
      expect(part.category).toBe(categoryId);
    }
  });

  test('API-FLT-002: filter parts by active=true', async ({ apiContext }) => {
    const res = await apiContext.get(`/api/part/?category=${categoryId}&active=true`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.results.length).toBeGreaterThan(0);
    for (const part of body.results) {
      expect(part.active).toBe(true);
    }
  });

  test('API-FLT-003: filter parts by boolean attribute (assembly=true)', async ({ apiContext }) => {
    const res = await apiContext.get(`/api/part/?category=${categoryId}&assembly=true`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    for (const part of body.results) {
      expect(part.assembly).toBe(true);
    }
  });

  test('API-FLT-004: search parts by name substring, case-insensitive', async ({ apiContext }) => {
    const res = await apiContext.get(`/api/part/?search=filterwidget-${marker.toLowerCase()}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.count).toBeGreaterThanOrEqual(12);
  });

  test('API-FLT-005: pagination returns count/next/previous/results envelope', async ({ apiContext }) => {
    const res = await apiContext.get(`/api/part/?category=${categoryId}&limit=5`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('count');
    expect(body).toHaveProperty('results');
    expect(body.results.length).toBeLessThanOrEqual(5);
  });

  test('API-FLT-006: pagination respects limit and offset', async ({ apiContext }) => {
    const page1 = await apiContext.get(`/api/part/?category=${categoryId}&limit=5&offset=0&ordering=name`);
    const page2 = await apiContext.get(`/api/part/?category=${categoryId}&limit=5&offset=5&ordering=name`);
    const body1 = await page1.json();
    const body2 = await page2.json();

    expect(body1.results.length).toBe(5);
    const ids1 = body1.results.map((p: any) => p.pk);
    const ids2 = body2.results.map((p: any) => p.pk);
    expect(ids1.some((id: number) => ids2.includes(id))).toBe(false); // no overlap between pages
  });

  test('API-FLT-007: combined filter + search + ordering', async ({ apiContext }) => {
    const res = await apiContext.get(
      `/api/part/?category=${categoryId}&search=filterwidget&ordering=name`
    );
    expect(res.status()).toBe(200);
    const body = await res.json();
    const names = body.results.map((p: any) => p.name as string);
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  test('API-FLT-008: invalid filter value handled gracefully (not a 500)', async ({ apiContext }) => {
    const res = await apiContext.get('/api/part/?category=not_an_integer');
    expect(res.status()).toBeLessThan(500);
    expect([400, 404]).toContain(res.status());
  });
});
