# API Manual Test Cases — InvenTree Part API

**Source:** InvenTree REST API, Part app (`/api/part/`, `/api/part/category/`, `/api/part/parameter/`, etc.), a Django REST Framework–based API.
**Auth:** Token-based (`Authorization: Token <token>`) or session auth. All test cases assume a valid token unless testing auth itself.

## 1. CRUD — Parts

| ID | Title | Method & Endpoint | Preconditions | Steps | Expected Result | Priority | Risk Tier |
|---|---|---|---|---|---|---|---|
| API-PC-001 | Create part with valid minimal payload | `POST /api/part/` | Valid category ID exists | Send `{name, category}` | `201 Created`; response body includes generated `pk`, and echoes submitted fields | High | T1 |
| API-PC-002 | Create part with full payload | `POST /api/part/` | Valid category ID | Send all writable fields (name, description, IPN, category, units, active, assembly, component, purchaseable, salable, trackable, virtual, is_template) | `201 Created`; all fields persisted and returned correctly | High | T1 |
| API-PC-003 | Retrieve a single part | `GET /api/part/{id}/` | Part exists | Request by valid ID | `200 OK`; response schema matches part detail (includes computed fields like `in_stock`, `total_in_stock`) | High | T1 |
| API-PC-004 | Update part via PATCH (partial) | `PATCH /api/part/{id}/` | Part exists | Send `{description: "updated"}` | `200 OK`; only `description` changes, other fields unchanged | High | T1 |
| API-PC-005 | Full update via PUT | `PUT /api/part/{id}/` | Part exists | Send complete payload with one field changed | `200 OK`; part updated to match payload exactly | Medium | T2 |
| API-PC-006 | Delete a part with no dependent records | `DELETE /api/part/{id}/` | Part exists, no stock/BOM/order references | Send delete request | `204 No Content`; subsequent GET returns `404` | High | T1 |
| API-PC-007 | Delete a part that has dependent stock items | `DELETE /api/part/{id}/` | Part has existing stock items | Send delete request | API rejects with `4xx` (e.g. `400`/`409`) rather than silently cascading data loss, OR explicitly documents cascade behaviour — verify against actual response and assert accordingly | High | T1 |
| API-PC-008 | Retrieve non-existent part | `GET /api/part/999999999/` | ID does not exist | Request | `404 Not Found` with standard error body | Medium | T2 |

## 2. CRUD — Part Categories

| ID | Title | Method & Endpoint | Preconditions | Steps | Expected Result | Priority | Risk Tier |
|---|---|---|---|---|---|---|---|
| API-CAT-001 | Create a top-level category | `POST /api/part/category/` | none | Send `{name, description}` (no parent) | `201 Created`; `parent` is `null` | High | T1 |
| API-CAT-002 | Create a nested (child) category | `POST /api/part/category/` | Parent category exists | Send `{name, parent: <parent_id>}` | `201 Created`; `parent` correctly set; appears under parent in tree | High | T1 |
| API-CAT-003 | Retrieve category with `path`/breadcrumb info | `GET /api/part/category/{id}/` | Nested category exists | Request | `200 OK`; response includes correct hierarchy info (e.g. `pathstring`/`parent`) | Medium | T2 |
| API-CAT-004 | Update category | `PATCH /api/part/category/{id}/` | Category exists | Send `{name: "renamed"}` | `200 OK`; name updated | Medium | T2 |
| API-CAT-005 | Delete category containing parts | `DELETE /api/part/category/{id}/` | Category has parts assigned | Send delete request | API rejects, or reassigns/cascades per documented behaviour — parts must not be silently orphaned without an explicit, verified contract | High | T1 |
| API-CAT-006 | Move category under a different parent | `PATCH /api/part/category/{id}/` | Two potential parent categories exist | Send `{parent: <new_parent_id>}` | `200 OK`; category hierarchy updates; a category cannot become its own ancestor (verify with API-NEG test below) | Medium | T2 |

## 3. Filtering, Pagination, Search

| ID | Title | Method & Endpoint | Preconditions | Steps | Expected Result | Priority | Risk Tier |
|---|---|---|---|---|---|---|---|
| API-FLT-001 | Filter parts by category | `GET /api/part/?category={id}` | Parts exist across multiple categories | Request with category filter | Only parts in that category are returned | High | T1 |
| API-FLT-002 | Filter parts by `active=true` | `GET /api/part/?active=true` | Mix of active/inactive parts exist | Request | Only active parts returned | High | T1 |
| API-FLT-003 | Filter parts by boolean attribute (e.g. `assembly=true`) | `GET /api/part/?assembly=true` | Mix of assembly/non-assembly parts | Request | Only parts flagged as assembly returned | Medium | T2 |
| API-FLT-004 | Search parts by name substring | `GET /api/part/?search=widget` | Parts with "widget" in name/description/IPN exist | Request | Only matching parts returned; search is case-insensitive | High | T1 |
| API-FLT-005 | Pagination — default page size | `GET /api/part/` | More parts exist than default page size | Request without pagination params | Response includes `count`, `next`, `previous`, and `results` capped at default page size | High | T1 |
| API-FLT-006 | Pagination — custom `limit`/`offset` | `GET /api/part/?limit=5&offset=5` | 10+ parts exist | Request with limit/offset | Exactly 5 results returned, correctly offset from the full set | Medium | T2 |
| API-FLT-007 | Combined filter + search + ordering | `GET /api/part/?category={id}&search=abc&ordering=name` | Data matching multiple criteria exists | Request with all three params | Results satisfy category and search filters, correctly ordered by name | Medium | T2 |
| API-FLT-008 | Invalid filter value handled gracefully | `GET /api/part/?category=not_an_integer` | none | Request with malformed filter param | `400 Bad Request` with a clear error, not a `500` server error | High | T1 |

## 4. Field-Level Validation

| ID | Title | Method & Endpoint | Preconditions | Steps | Expected Result | Priority | Risk Tier |
|---|---|---|---|---|---|---|---|
| API-VAL-001 | Missing required field `name` | `POST /api/part/` | none | Send payload without `name` | `400 Bad Request`; error body identifies `name` as required | High | T1 |
| API-VAL-002 | Missing required field `category` (if category required by config) | `POST /api/part/` | Category required by global setting | Send payload without `category` | `400 Bad Request`; error identifies `category` field | High | T1 |
| API-VAL-003 | `name` exceeds max length | `POST /api/part/` | none | Send `name` longer than the field's max length (per model definition) | `400 Bad Request`; error identifies max-length violation | Medium | T2 |
| API-VAL-004 | Nullable field accepts `null` | `POST /api/part/` | `description` is nullable | Send `{name, category, description: null}` | `201 Created`; `description` stored as null/empty | Low | T3 |
| API-VAL-005 | Attempt to write a read-only field (e.g. `pk`, `in_stock`, `creation_date`) | `POST /api/part/` or `PATCH` | none | Include `pk` or a computed field in the payload with an arbitrary value | Field is ignored by the API (not overwritten); server assigns/derives the correct value | Medium | T2 |
| API-VAL-006 | Invalid data type for boolean field | `POST /api/part/` | none | Send `active: "yes"` (string instead of boolean) | `400 Bad Request` with type validation error | Medium | T2 |
| API-VAL-007 | `IPN` uniqueness validation (when enabled) | `POST /api/part/` | Global "unique IPN" setting enabled; a part with IPN `X` exists | Send new part with `IPN: "X"` | `400 Bad Request`; error identifies duplicate IPN | High | T1 |
| API-VAL-008 | `revision_of` self-reference rejected | `PATCH /api/part/{id}/` | Part exists | Send `{revision_of: <own id>}` | `400 Bad Request`; circular reference rejected | High | T1 |
| API-VAL-009 | `is_template=true` part rejected as `revision_of` target for a new revision that violates template-no-revision rule | `POST /api/part/` | Template part exists | Attempt to create a revision (`revision_of: <template_id>`) of the template part itself | `400 Bad Request`; template parts cannot have revisions | High | T1 |

## 5. Relational Integrity

| ID | Title | Method & Endpoint | Preconditions | Steps | Expected Result | Priority | Risk Tier |
|---|---|---|---|---|---|---|---|
| API-REL-001 | Category assignment references a valid category | `POST /api/part/` | none | Send `category: 99999999` (non-existent) | `400 Bad Request`; invalid foreign key rejected | High | T1 |
| API-REL-002 | Default location must be a valid stock location | `PATCH /api/part/{id}/` | none | Send `default_location: 99999999` | `400 Bad Request`; invalid foreign key rejected | Medium | T2 |
| API-REL-003 | Supplier part linkage reflects correctly on part detail | `GET /api/part/{id}/` | Part has an associated supplier part | Request part detail | Response reflects correct supplier/manufacturer linkage (directly or via related `/api/company/part/` endpoint, depending on API version) | Medium | T2 |
| API-REL-004 | Deleting a category referenced by a part's `default_location`'s structure doesn't corrupt part data | Combination of category/location deletion | Part references a location under a category being deleted | Attempt the deletion chain | System enforces referential integrity — rejects deletion or cascades explicitly and consistently, never leaves a dangling/broken reference | High | T1 |
| API-REL-005 | `variant_of` correctly links a variant part to its template | `GET /api/part/{id}/` | Variant part exists | Request part detail | `variant_of` field correctly points to the template part ID | High | T1 |

## 6. Edge Cases

| ID | Title | Method & Endpoint | Preconditions | Steps | Expected Result | Priority | Risk Tier |
|---|---|---|---|---|---|---|---|
| API-EDGE-001 | Invalid JSON payload | `POST /api/part/` | none | Send malformed JSON body | `400 Bad Request`, not a `500` server error | High | T1 |
| API-EDGE-002 | Unauthorized access — no token | `GET /api/part/` | No `Authorization` header sent | Request without auth | `401 Unauthorized` | High | T1 |
| API-EDGE-003 | Unauthorized access — invalid/expired token | `GET /api/part/` | Malformed/expired token used | Request with bad token | `401 Unauthorized` | High | T1 |
| API-EDGE-004 | Forbidden — authenticated but insufficient permission | `POST /api/part/` | User authenticated but lacks Part create permission | Request create | `403 Forbidden` | High | T1 |
| API-EDGE-005 | Conflict — duplicate unique revision code | `POST /api/part/` | Revision "A" of part X already exists | Attempt to create another revision "A" of part X | `400 Bad Request` (validation) rather than `500`, error clearly identifies the conflict | High | T1 |
| API-EDGE-006 | Race condition — concurrent creation of parts with same IPN | `POST /api/part/` (fired near-simultaneously, twice) | Unique IPN setting enabled | Two concurrent requests with identical IPN | Exactly one request succeeds (`201`); the other is rejected (`400`) — no duplicate committed to DB even under race conditions | Medium | T2 |
| API-EDGE-007 | Extremely large `limit` value in pagination | `GET /api/part/?limit=1000000` | none | Request with very large limit | API caps at a maximum page size rather than attempting to return unbounded results | Low | T3 |
| API-EDGE-008 | Empty result set for a filter with no matches | `GET /api/part/?search=zzznonexistentzzz` | none | Request with a search term matching nothing | `200 OK`; `results: []`, `count: 0` — not an error | Low | T3 |
