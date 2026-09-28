# InvenTree Parts Module — UI Manual Test Cases

**Scope:** Parts, Part Categories, Part Views, Parameters, Templates and Variants, Revisions, Tracking, Units, Images, and Data Import.

**Documentation basis:** [Parts](https://docs.inventree.org/en/stable/part/), [Part Views](https://docs.inventree.org/en/stable/part/views/), [Templates](https://docs.inventree.org/en/stable/part/template/), [Revisions](https://docs.inventree.org/en/stable/part/revision/), [Tracking](https://docs.inventree.org/en/stable/part/trackable/), [Data Import](https://docs.inventree.org/en/stable/concepts/data_import/), [Virtual Parts](https://docs.inventree.org/en/stable/part/virtual/), and [Consumable Parts](https://docs.inventree.org/en/stable/part/consumable/).

**Risk tiers:** T1 = critical data integrity or core workflow; T2 = important workflow correctness; T3 = standard usability or boundary coverage.

## 1. Creation and Import

| ID | Title | Preconditions | Steps | Expected Result | Priority | Risk Tier |
|---|---|---|---|---|---|---|
| UI-PC-001 | Create a part with required data | Logged in with part-create permission; category exists | Open Parts → Add Parts → Create Part; enter Name and Category; submit | Part is created and its detail view opens | High | T1 |
| UI-PC-002 | Create a part with optional details | Create form open | Enter IPN, description, revision, keywords, external link, units, min/max stock and image; submit | All supplied values persist and display correctly | High | T1 |
| UI-PC-003 | Reject a part without a name | Create form open | Leave Name empty; complete other required fields; submit | Inline validation identifies Name; no part is created | High | T1 |
| UI-PC-004 | Reject a part without a category | Create form open | Leave Category empty; enter Name; submit | Inline validation identifies Category; no part is created | High | T1 |
| UI-PC-005 | Create initial stock during part creation | Initial-stock option enabled; location exists | Enable initial stock; enter quantity and location; submit | Part and initial stock item are created with correct quantity and location | High | T1 |
| UI-PC-006 | Add supplier information during creation | Supplier and manufacturer exist; Purchaseable available | Mark part Purchaseable; enter supplier/manufacturer data; submit | Supplier and manufacturer links persist on the part | Medium | T2 |
| UI-PC-007 | Create a part with minimum and maximum stock limits | Create form open | Set minimum and maximum stock values; submit | Limits persist; low-stock/overstock indicators use those limits | Medium | T2 |
| UI-PC-008 | Create a part with an image | Valid image available | Upload an image during creation or from the part view; save | Image displays in the part view and thumbnail locations | Medium | T2 |
| UI-PC-009 | User without create permission cannot create a part | User lacks part-create permission | Open Parts view | Add/create actions are hidden or disabled; direct access is denied | High | T1 |
| UI-PC-010 | Import valid part data | Staff user with model change permission; categories pre-exist; valid file available | Start an import session; upload file; map fields; confirm; process valid rows; complete session | Rows become parts with correct category relationships and an import summary | High | T1 |
| UI-PC-011 | Import file with invalid rows | Import file contains missing Name, invalid category ID, and one valid row | Create session; map fields; process rows | Invalid rows show Error and are not imported; valid row can be imported independently | High | T1 |
| UI-PC-012 | Import requires correct related-record mapping | File references existing categories | Map Category by supported ID or natural key; process | Parts link to the intended categories; unmapped relationships fail clearly | High | T1 |
| UI-PC-013 | Import session can be resumed | Import session started and processing is pending | Leave import page; return through Admin Center; resume processing | Session and row statuses persist; no duplicate session is created | Medium | T2 |
| UI-PC-014 | Import cannot mix create and update modes | Existing part available; update file prepared | Start an update-existing session; attempt to include new records | UI prevents mixing modes or clearly rejects the invalid rows | Medium | T2 |
| UI-PC-015 | Import access is restricted | Non-staff or user without change permission | Attempt to open/import data | Import action is unavailable or denied | High | T1 |

## 2. Part Detail and Tabs

| ID | Title | Preconditions | Steps | Expected Result | Priority | Risk Tier |
|---|---|---|---|---|---|---|
| UI-PV-001 | Part details display core fields | Part exists | Open part detail; show details | Name, IPN, description, revision, keywords, external link, creation metadata, and units are correct | High | T1 |
| UI-PV-002 | Category breadcrumb navigates correctly | Part is in a nested category | Click each category breadcrumb | Each breadcrumb opens the corresponding category; hierarchy is correct | Medium | T2 |
| UI-PV-003 | Stock tab lists stock items | Part has stock in multiple locations | Open Stock tab | Quantities, locations, status, and total stock are correct | High | T1 |
| UI-PV-004 | Stock tab creates a stock item | User can create stock; location exists | Open Stock → New Stock Item; enter quantity/location; save | New stock appears and total quantity updates | High | T1 |
| UI-PV-005 | Stock tab exports stock data | Part has stock | Use Stock export | Download contains the selected part's stock records and correct values | Medium | T2 |
| UI-PV-006 | BOM tab is available for an Assembly | Part marked Assembly with components available | Open BOM; add/edit/remove a BOM line | BOM quantities and component links persist; only valid components can be selected | High | T1 |
| UI-PV-007 | Allocated tab shows allocations | Part is Component or Salable and is allocated | Open Allocated tab | Pending build/sales allocations show correct order and quantity | Medium | T2 |
| UI-PV-008 | Build Orders tab shows build history | Part has build orders | Open Build Orders | Related builds show quantity, status, and dates | Medium | T2 |
| UI-PV-009 | Used In tab shows parent assemblies | Part is a Component used by assemblies | Open Used In | Parent assemblies and quantities are listed | Medium | T2 |
| UI-PV-010 | Pricing tab aggregates pricing | Supplier, purchase, BOM, or sales price data exists | Open Part Pricing | Available pricing sources and calculated values are displayed consistently | Medium | T2 |
| UI-PV-011 | Parameters tab displays assigned values | Parameter template and values exist | Open Parameters | Parameter names, values, units, and template association are correct | High | T1 |
| UI-PV-012 | Parameters can be edited when part is unlocked | Unlocked part with editable parameters | Change a parameter value; save; refresh | New value persists and invalid values are rejected | High | T1 |
| UI-PV-013 | Variants tab is visible only for a Template | Template part with variants | Open template detail; open Variants | Variants are listed and link to their detail pages | High | T1 |
| UI-PV-014 | Revisions selector is visible only when applicable | Part has multiple revisions | Open part detail | Selector is absent for a single revision and present for multiple revisions | High | T1 |
| UI-PV-015 | Attachments tab uploads and removes a file | Valid attachment available | Upload file; refresh; remove it | Filename and metadata display; removal removes the association | Medium | T2 |
| UI-PV-016 | Notes tab preserves Markdown content | Part detail open | Add formatted Markdown note; save; reopen | Note renders safely with expected formatting and persists | Low | T3 |
| UI-PV-017 | Test Templates and Test Results appear for Testable parts | Part marked Testable; template and stock test result exist | Open both tabs | Test Templates shows configured tests; Test Results aggregates stock-item results | Medium | T2 |
| UI-PV-018 | Suppliers and Purchase Orders appear for Purchaseable parts | Part marked Purchaseable; supplier/purchase order data exists | Open Suppliers and Purchase Orders | Supplier/manufacturer links and purchase orders are correct | Medium | T2 |
| UI-PV-019 | Sales Orders and Return Orders appear for Salable parts | Part marked Salable; sales/return records exist; return feature enabled | Open Sales Orders and Return Orders | Related records display correct customer, status, dates, and quantities | Medium | T2 |
| UI-PV-020 | Transfer Orders and Stock History display correctly | Transfer history exists; feature enabled | Open Transfer Orders and Stock History | Transfer records and historical stock values are accurate; tabs obey feature flags | Medium | T2 |

## 3. Categories and Parameters

| ID | Title | Preconditions | Steps | Expected Result | Priority | Risk Tier |
|---|---|---|---|---|---|---|
| UI-CAT-001 | Create a top-level category | Category-create permission | Create category with name and description | Category appears at root | High | T1 |
| UI-CAT-002 | Create nested categories | Parent category exists | Create child and grandchild categories | Tree and breadcrumbs show correct parent-child relationships | High | T1 |
| UI-CAT-003 | Category view includes descendant parts | Parent and child categories contain parts | Open parent category | Parts from the category and descendants are listed as documented | High | T1 |
| UI-CAT-004 | Filter a category part list | Category contains varied parts | Apply multiple table filters; clear filters | Results match filter criteria; clearing restores the full list | Medium | T2 |
| UI-CAT-005 | Parametric category view displays parameter columns | Category parts share parameter definitions | Open parametric/table view | Parameter values display as columns and remain associated with each part | Medium | T2 |
| UI-CAT-006 | Move a part between categories | Two categories exist | Edit part Category; save; inspect both categories | Part appears only under the new category | High | T1 |
| UI-CAT-007 | Prevent unsafe category deletion | Category contains parts or subcategories | Attempt deletion | System blocks deletion or requires reassignment; no part is orphaned | High | T1 |
| UI-CAT-008 | Create and apply a parameter template | Parameter-template permission | Define parameters and units; apply template to a category/part | Definitions and values are available on matching parts | High | T1 |
| UI-CAT-009 | Reject invalid parameter values | Parameter has type/range/unit validation | Enter invalid type, out-of-range, or incompatible-unit value | Clear validation appears; invalid value is not saved | High | T1 |

## 4. Part Attributes and Restrictions

| ID | Title | Preconditions | Steps | Expected Result | Priority | Risk Tier |
|---|---|---|---|---|---|---|
| UI-ATTR-001 | Mark a part Virtual | Part edit permission | Enable Virtual; save; inspect detail | Virtual indicator appears; stock controls are hidden/disabled | High | T1 |
| UI-ATTR-002 | Virtual part in BOM and build | Virtual part and Assembly exist | Add Virtual part to BOM; create/build assembly | Virtual part remains in BOM/costing but is not allocated as physical stock | High | T1 |
| UI-ATTR-003 | Mark a part Template | Part edit permission | Enable Template; save | Variants capability becomes available | High | T1 |
| UI-ATTR-004 | Mark a part Assembly | Component parts exist | Enable Assembly; save; open BOM | BOM controls become available | High | T1 |
| UI-ATTR-005 | Mark a part Component | Part edit permission | Enable Component; save | Part can be selected as a BOM component and Used In becomes applicable | High | T1 |
| UI-ATTR-006 | Mark a part Testable | Test-template permission | Enable Testable; save | Test Templates and Test Results become available | Medium | T2 |
| UI-ATTR-007 | Mark a part Trackable | Part edit permission | Enable Trackable; create stock | Stock workflows support batch/serial tracking and enforce required tracking where applicable | High | T1 |
| UI-ATTR-008 | Mark a part Purchaseable | Supplier exists | Enable Purchaseable; save | Supplier and Purchase Order tabs/actions become available | Medium | T2 |
| UI-ATTR-009 | Mark a part Salable | Customer/order permission | Enable Salable; save | Sales Order and applicable Return Order actions become available | Medium | T2 |
| UI-ATTR-010 | Mark a part Consumable | Assembly and stock exist | Enable Consumable; use it in a BOM and complete a build | Consumable stock is not allocated/consumed automatically by build completion; manual stock adjustment remains possible | High | T1 |
| UI-ATTR-011 | Lock a part | Part locking enabled | Lock a part; try edit, delete, and edit related BOM/parameters | Locked restrictions are enforced; permitted read-only views remain available | High | T1 |
| UI-ATTR-012 | Toggle Active state | Part exists | Mark inactive; inspect filters and attempt new workflow use | Part remains stored but is excluded from applicable active selections; existing records remain intact | High | T1 |

## 5. Units and Images

| ID | Title | Preconditions | Steps | Expected Result | Priority | Risk Tier |
|---|---|---|---|---|---|---|
| UI-UOM-001 | Default units are pieces | New part created without physical units | Open details and stock | Unit displays as default pieces/dimensionless quantity | Medium | T2 |
| UI-UOM-002 | Assign a physical unit | Part edit permission | Set metres/litres or another valid physical unit; save | Unit persists and displays consistently in stock/BOM/order views | High | T1 |
| UI-UOM-003 | Compatible supplier unit is accepted | Base part has physical unit; supplier part exists | Set supplier unit to a compatible unit such as cm for metres | Supplier unit saves and conversions are correct | Medium | T2 |
| UI-UOM-004 | Incompatible supplier unit is rejected | Base part has physical unit | Set supplier unit to an incompatible dimension | Validation error appears; incompatible unit is not saved | High | T1 |
| UI-UOM-005 | Invalid unit input is rejected | Part edit form open | Enter an unknown unit | Clear validation appears; no invalid unit persists | Medium | T2 |
| UI-IMG-001 | Upload/select/delete part image | Image files exist; part permission available | Upload new image; select existing image; delete image | Correct image/thumbnail appears in part views; deletion removes association | Medium | T2 |

## 6. Templates, Variants, Revisions, and Tracking

| ID | Title | Preconditions | Steps | Expected Result | Priority | Risk Tier |
|---|---|---|---|---|---|---|
| UI-TV-001 | Create a variant from a Template | Template part exists | Open Variants → New Variant; complete Duplicate Part form; submit | Variant links to the template and appears in the Variants tab | High | T1 |
| UI-TV-002 | Template stock reporting includes variants | Template with variant stock | Compare template and variant stock views | Template stock reporting includes variant stock as documented | Medium | T2 |
| UI-TV-003 | Template/variant serial numbers remain unique | Template and multiple variants are trackable | Attempt to reuse a serial number across variants | Duplicate serial is rejected | High | T1 |
| UI-REV-001 | Create a revision using Duplicate Part | Non-template part exists | Duplicate Part; set Revision Of to original; enter unique Revision; submit | New revision is a Part linked to the original and has independent detail data | High | T1 |
| UI-REV-002 | Reject self-revision circular reference | Part exists | Set Revision Of to the same part; submit | Validation rejects circular reference | High | T1 |
| UI-REV-003 | Reject duplicate revision code | Original already has revision A | Create another revision of same original with A | Duplicate revision code is rejected | High | T1 |
| UI-REV-004 | Reject revisions of Template parts | Template part exists | Attempt Duplicate Part/revision | Revision action is blocked or validation rejects it | High | T1 |
| UI-REV-005 | Allow revision of a variant with template consistency | Variant belongs to a template | Create variant revision; inspect linkage | Revision is allowed and points to the same template relationship | High | T1 |
| UI-REV-006 | Revision selector navigates to the selected revision | Multiple revisions exist | Select another revision from the selector | Correct part number, stock, BOM, and parameters load | High | T1 |
| UI-REV-007 | Assembly-only revision setting is enforced | Assembly Revision Only enabled | Attempt revision of non-assembly and assembly parts | Non-assembly revision is blocked; assembly revision remains available | Medium | T2 |
| UI-TRK-001 | Create tracked stock with a batch number | Trackable part exists | Create stock with batch number | Batch is stored and shown in stock details | High | T1 |
| UI-TRK-002 | Create tracked stock with serial numbers | Trackable part exists | Enter serial syntax such as `1,3-5`; submit | Expected serials are expanded and assigned to distinct stock items | High | T1 |
| UI-TRK-003 | Reject duplicate serial numbers | Existing serial exists | Attempt to assign it again | Duplicate serial is rejected | High | T1 |
| UI-TRK-004 | Trackable build output without serials | Trackable assembly and build permission | Create build output without serials | System permits documented bulk output behavior; output can later be serialized/split | Medium | T2 |
| UI-TRK-005 | Tracked BOM components require serials for build output | Assembly BOM contains tracked component | Create output without component serials | Build output is blocked until required tracked component serials are supplied | High | T1 |

## 7. Negative and Boundary Scenarios

| ID | Title | Preconditions | Steps | Expected Result | Priority | Risk Tier |
|---|---|---|---|---|---|---|
| UI-NEG-001 | Duplicate IPN with uniqueness enabled | Unique-IPN setting enabled; existing IPN | Create another part with same IPN | Clear duplicate-IPN validation; no duplicate is created | High | T1 |
| UI-NEG-002 | Duplicate IPN with uniqueness disabled | Unique-IPN setting disabled | Create another part with same IPN | Duplicate is permitted according to configuration | Medium | T2 |
| UI-NEG-003 | Inactive part is unavailable for new workflow use | Part inactive | Attempt new BOM, sales, purchase, allocation, or stock workflow as applicable | Part is blocked or warned according to the documented workflow rule | High | T1 |
| UI-NEG-004 | Locked part cannot be edited or deleted | Part locking enabled; part locked | Attempt edit, delete, parameter change, and BOM change | Locked restrictions are enforced without data loss | High | T1 |
| UI-NEG-005 | Long Name and Description boundaries | Create form open | Enter values at and beyond configured maximum lengths | Boundary value saves; over-limit value is rejected or clearly constrained | Medium | T2 |
| UI-NEG-006 | Special characters and Unicode | Create form open | Enter Unicode, punctuation, whitespace, and HTML-like text in Name/Description/IPN | Valid text persists safely; no encoding or script execution occurs | Medium | T2 |
| UI-NEG-007 | Zero and negative stock limits | Part edit form open | Enter zero, negative, and maximum numeric values for stock limits | Valid boundaries are accepted; invalid negative combinations are rejected clearly | Medium | T2 |
| UI-NEG-008 | Missing related category/supplier/location | Related record unavailable or deleted | Open create/edit form and submit without a valid relationship | Field is unavailable or validation prevents an orphaned relationship | High | T1 |
| UI-NEG-009 | Concurrent edit behavior | Same part open in two sessions | Save conflicting changes from both sessions | System preserves a documented last-write/conflict behavior and does not silently corrupt unrelated fields | Medium | T2 |
| UI-NEG-010 | Cancel creation does not persist data | Create form contains unsaved values | Cancel/close form; search for entered Name/IPN | No part is created and unsaved values are discarded | Medium | T2 |

## Execution Notes

- Record the InvenTree version, enabled global settings, permissions, and feature flags for each run.
- Use disposable categories, parts, suppliers, stock, and files; clean them up after execution where the environment permits.
- For import tests, use a backup or disposable instance because import processing is a bulk, potentially non-reversible operation.
- Verify selectors and exact labels against the target UI version before automating. The scenarios are behavior-focused; labels and routes can vary between releases.
