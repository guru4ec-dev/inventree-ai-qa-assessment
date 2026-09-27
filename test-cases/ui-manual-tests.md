# UI Manual Test Cases — InvenTree Parts Module

**Source docs:** `docs.inventree.org/en/stable/part/` (create, views, template/variants, revision, trackable, and related sub-pages)
**Risk Tier legend:** T1 = Critical (core CRUD / data integrity), T2 = Important (workflow correctness), T3 = Standard (secondary/edge UI behaviour)

## 1. Part Creation

| ID | Title | Preconditions | Steps | Expected Result | Priority | Risk Tier |
|---|---|---|---|---|---|---|
| UI-PC-001 | Create part via manual entry with required fields only | Logged in with Part create permission; at least one category exists | 1. Navigate to Parts → Add Parts → Create Part 2. Fill Name, Category, Units 3. Submit | Part is created; redirected to new part detail page; part appears in category listing | High | T1 |
| UI-PC-002 | Create part with all optional fields populated | Same as above | 1. Open Create Part form 2. Fill Name, Description, IPN, Category, Keywords, Units, Notes, all attribute checkboxes 3. Submit | Part created with all field values persisted and visible on detail page | Medium | T2 |
| UI-PC-003 | Create part without required Name field | Create Part form open | 1. Leave Name blank 2. Fill other fields 3. Submit | Form validation error on Name field; part is not created | High | T1 |
| UI-PC-004 | Create Initial Stock during part creation (if setting enabled) | "Create Initial Stock" global setting enabled | 1. Open Create Part form 2. Check "Create Initial Stock" 3. Enter quantity + location 4. Submit | Part created with an initial stock item of the specified quantity at the specified location | Medium | T2 |
| UI-PC-005 | Add Supplier Data during part creation for a Purchaseable part | Part marked Purchaseable in form | 1. Check Purchaseable 2. Check "Add Supplier Data" 3. Fill supplier + manufacturer part info 4. Submit | Part created with linked supplier part and manufacturer part visible under Suppliers/Purchasing tab | Medium | T2 |
| UI-PC-006 | Create Part without create permission | Logged in as user without Part create permission | 1. Navigate to Parts view | "Add Parts" menu/button is not visible or is disabled | High | T1 |
| UI-PC-007 | Import parts from file | Import feature accessible; valid CSV/XLSX prepared matching import template | 1. Select "Import from File" 2. Upload file 3. Map columns in wizard 4. Confirm import | All valid rows are created as parts; import summary shows success count; invalid rows are reported, not silently created | High | T1 |
| UI-PC-008 | Import from file with malformed row (missing required field) | Import file with one row missing Name | 1. Run import wizard on file | Wizard flags the malformed row as an error and does not create a part for it; valid rows still import | High | T1 |

## 2. Part Detail View — Tabs

| ID | Title | Preconditions | Steps | Expected Result | Priority | Risk Tier |
|---|---|---|---|---|---|---|
| UI-PV-001 | Stock tab shows correct stock items | Part with existing stock items | 1. Open part detail 2. Open Stock tab | All stock items for the part are listed with correct quantity, location, status | High | T1 |
| UI-PV-002 | BOM tab shows bill of materials for an assembly part | Part marked Assembly with BOM lines defined | 1. Open part detail 2. Open BOM tab | BOM lines listed with component part, quantity, and reference correctly displayed | High | T1 |
| UI-PV-003 | Allocated tab shows stock allocations | Part with stock allocated to a build/sales order | 1. Open part detail 2. Open Allocated tab | Allocations listed with correct order reference and allocated quantity | Medium | T2 |
| UI-PV-004 | Build Orders tab shows related build orders | Part is used in at least one build order | 1. Open part detail 2. Open Build Orders tab | Build orders referencing this part (as output or component) are listed | Medium | T2 |
| UI-PV-005 | Parameters tab shows part parameters | Part has parameters assigned via a parameter template | 1. Open part detail 2. Open Parameters tab | All parameters listed with name, value, and units matching template definition | High | T1 |
| UI-PV-006 | Variants tab shows variant parts for a template part | Part marked as Template with variants created | 1. Open template part detail 2. Open Variants tab | All variant parts listed, each linked to correct variant detail page | High | T1 |
| UI-PV-007 | Revisions tab / selector shows all revisions | Part has 2+ revisions | 1. Open part detail for any revision 2. Open Revision selector/tab | All revisions listed; selecting one navigates to that revision's detail page | High | T1 |
| UI-PV-008 | Attachments tab allows file upload and shows existing attachments | Part detail page open | 1. Open Attachments tab 2. Upload a file 3. Refresh | File appears in attachment list with correct filename, uploader, and timestamp | Medium | T2 |
| UI-PV-009 | Related Parts tab shows linked related parts | Part has a "related part" relationship defined | 1. Open Related Parts tab | Related part(s) listed with link to their detail pages | Low | T3 |
| UI-PV-010 | Test Templates tab shows defined test templates for a trackable part | Part marked Trackable with test templates defined | 1. Open Test Templates tab | Test templates listed with name, description, required/optional flag | Medium | T2 |
| UI-PV-011 | Revision selector not visible when only one revision exists | Part with no additional revisions | 1. Open part detail | Revision selector/dropdown is not rendered | Low | T3 |

## 3. Part Categories

| ID | Title | Preconditions | Steps | Expected Result | Priority | Risk Tier |
|---|---|---|---|---|---|---|
| UI-CAT-001 | Category hierarchy displays nested subcategories correctly | Nested category tree exists (parent → child → grandchild) | 1. Navigate to Parts → Categories | Tree view/breadcrumbs correctly reflect parent-child nesting at all levels | High | T1 |
| UI-CAT-002 | Filtering parts list by category shows only parts in that category (and optionally subcategories) | Multiple categories with parts assigned | 1. Select a category 2. View parts list | Only parts belonging to the selected category (and subcategories, if "include subcategories" is enabled) are shown | High | T1 |
| UI-CAT-003 | Parametric table view shows parameters as columns for parts in a category | Category with parts sharing a parameter template | 1. Open category 2. Switch to parametric/table view | Parameter values render as sortable/filterable columns for each part | Medium | T2 |
| UI-CAT-004 | Move part to a different category via edit | Two categories exist | 1. Edit part 2. Change Category field 3. Save | Part now appears under new category and no longer under old category listing | High | T1 |
| UI-CAT-005 | Delete a category that still contains parts | Category has parts assigned | 1. Attempt to delete category | System blocks deletion or requires reassignment of contained parts; parts are not orphaned or silently deleted | High | T1 |

## 4. Part Attributes

| ID | Title | Preconditions | Steps | Expected Result | Priority | Risk Tier |
|---|---|---|---|---|---|---|
| UI-ATTR-001 | Mark part as Virtual | Part edit form open | 1. Check "Virtual" 2. Save | Part flagged Virtual; UI indicates virtual status (e.g. badge/icon) on detail page | Medium | T2 |
| UI-ATTR-002 | Mark part as Template — enables Variants tab | Part edit form open | 1. Check "Template" 2. Save | Variants tab becomes available/populated on the part detail page | High | T1 |
| UI-ATTR-003 | Mark part as Assembly — enables BOM tab editing | Part edit form open | 1. Check "Assembly" 2. Save | BOM tab allows adding component lines | High | T1 |
| UI-ATTR-004 | Mark part as Component | Part edit form open | 1. Check "Component" 2. Save | Part is selectable as a BOM line item in other assemblies | Medium | T2 |
| UI-ATTR-005 | Mark part as Trackable — enables serial number / test result tracking | Part edit form open | 1. Check "Trackable" 2. Save | Stock items for this part require/support serial numbers; Test Templates tab becomes relevant | High | T1 |
| UI-ATTR-006 | Mark part as Purchaseable — enables Suppliers section | Part edit form open | 1. Check "Purchaseable" 2. Save | Supplier/manufacturer part linking becomes available on the part | Medium | T2 |
| UI-ATTR-007 | Mark part as Salable — enables use in Sales Orders | Part edit form open | 1. Check "Salable" 2. Save | Part becomes selectable as a line item when creating a sales order | Medium | T2 |
| UI-ATTR-008 | Toggle part Active/Inactive | Part edit form open | 1. Uncheck "Active" 2. Save | Part flagged inactive; excluded from default active-parts filters; existing stock/orders unaffected | High | T1 |
| UI-ATTR-009 | Inactive part cannot be selected for new BOM lines | Part set Inactive | 1. Attempt to add inactive part as a BOM component on another part | System blocks or warns against adding an inactive part to a new BOM line | High | T1 |
| UI-ATTR-010 | Inactive part cannot be added to a new sales/purchase order line | Part set Inactive and Salable/Purchaseable | 1. Attempt to add inactive part to a new order | System blocks or warns; part is not addable to new order lines | High | T1 |

## 5. Units of Measure

| ID | Title | Preconditions | Steps | Expected Result | Priority | Risk Tier |
|---|---|---|---|---|---|---|
| UI-UOM-001 | Assign a physical unit (e.g. "m", "kg") to a part | Part edit form open | 1. Set Units field to a valid physical unit 2. Save | Unit is persisted and displayed consistently across stock, BOM, and order views for this part | Medium | T2 |
| UI-UOM-002 | Unit conversion is respected when part is used as BOM component in a different unit context | Two parts with compatible units (e.g. m vs cm) | 1. Add part as BOM component with a quantity 2. View computed required quantity in build order | Quantity is correctly converted/scaled per unit definitions | Medium | T2 |
| UI-UOM-003 | Invalid/unrecognized unit string is rejected | Part edit form open | 1. Enter a non-existent unit string 2. Save | Form validation error; part unit not saved as invalid value | Low | T3 |

## 6. Part Revisions

| ID | Title | Preconditions | Steps | Expected Result | Priority | Risk Tier |
|---|---|---|---|---|---|---|
| UI-REV-001 | Create a new revision via Duplicate Part | Existing part, not a template part | 1. Open part actions menu → Duplicate Part 2. Set "Revision Of" to original part 3. Set unique Revision value 4. Submit | New part created, linked to original via Revision Of; appears in revision selector on both parts | High | T1 |
| UI-REV-002 | Circular reference prevention — part cannot be a revision of itself | Existing part | 1. Attempt to set a part's "Revision Of" field to itself | System rejects the change with a validation error | High | T1 |
| UI-REV-003 | Unique revision constraint — cannot create two revisions of the same part with identical revision code | Part already has a revision "A" | 1. Attempt to create another revision of the same original part with Revision = "A" | System rejects with a validation error indicating duplicate revision code | High | T1 |
| UI-REV-004 | Template part cannot have revisions | Part marked as Template | 1. Attempt to duplicate/create a revision of the template part | System blocks the action, since template parts cannot have revisions | High | T1 |
| UI-REV-005 | Variant part is allowed to have revisions | Part is a variant of a template (not itself a template) | 1. Create a revision of the variant part | Revision is created successfully | Medium | T2 |
| UI-REV-006 | Revision of a variant part must reference the same template | Variant part with an existing revision | 1. Inspect the "Revision Of" / template linkage on the new revision | New revision points to the same template as the original variant part | Medium | T2 |
| UI-REV-007 | Navigating between revisions via selector loads correct part data | Part with 2+ revisions | 1. Open revision selector 2. Select a different revision | Page navigates to the selected revision's own detail page (own part number, stock, BOM, parameters) | High | T1 |

## 7. Negative & Boundary Scenarios

| ID | Title | Preconditions | Steps | Expected Result | Priority | Risk Tier |
|---|---|---|---|---|---|---|
| UI-NEG-001 | Duplicate IPN is rejected (if "unique IPN" setting enabled) | Global setting requiring unique IPN is enabled; a part with IPN "X" exists | 1. Create a new part with IPN "X" | Form validation error; duplicate part not created | High | T1 |
| UI-NEG-002 | Duplicate IPN allowed when uniqueness setting is disabled | Global setting requiring unique IPN is disabled | 1. Create a new part with an existing IPN | Part is created successfully (no false-positive rejection) | Medium | T2 |
| UI-NEG-003 | Inactive part restricted from new stock allocation | Part is Inactive | 1. Attempt to allocate new stock for the inactive part in a build/sales order | System blocks or warns against the allocation | High | T1 |
| UI-NEG-004 | Revision-of-revision prevention | Part B is already a revision of Part A | 1. Attempt to create a revision of Part B, referencing Part B (not the root Part A) as "Revision Of", in a way that would create a revision chain beyond what the system allows | System either correctly links it as a further revision per business rules, or blocks it if the schema disallows chained revisions — behaviour should be verified against current InvenTree version and confirmed against documented restrictions before treating as pass/fail | High | T1 |
| UI-NEG-005 | Extremely long Name / Description input | Part create form open | 1. Enter a string exceeding the field's max length for Name | Form truncates or rejects with a clear validation message; no server error/crash | Low | T3 |
| UI-NEG-006 | Special characters / unicode in Name and IPN fields | Part create form open | 1. Enter names with unicode characters, emoji, or special symbols | Part is created and renders correctly across all views without encoding errors | Low | T3 |
| UI-NEG-007 | Concurrent edit conflict — two users editing the same part | Part detail open in two sessions | 1. User A edits and saves a field 2. User B (with stale data) edits and saves a different field | System either merges non-conflicting changes correctly or surfaces a conflict/stale-data warning to User B, rather than silently discarding User A's change | Medium | T2 |

---

**Note on UI-NEG-004:** InvenTree's documented revision restrictions (circular reference, unique revision code, template-cannot-have-revisions, and revision-of-a-variant-must-share-template) do not explicitly document a "no chained revisions" rule in the current docs. This test case is flagged for verification against the live application's actual behaviour rather than assumed — see `// VERIFY` convention referenced in `agents/system-instructions.md`.
