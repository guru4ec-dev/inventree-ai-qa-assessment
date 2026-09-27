# Agent Prompts — InvenTree Parts Module QA Assessment

This file documents the actual sequence of prompts used to drive Claude through this assessment, in the order they were used. Each phase was conversational: documentation was fetched by the agent, summarized, and used to ground the generated artefacts (rather than generating test cases purely from prior training knowledge).

## Phase 0 — Context & Scoping

```
My customer sent a Quality Architect hiring assessment. Attached are the assessment
guidelines (AI Agent Development submission) and a separate problem statement.
Go through both carefully. The technical assessment requires using an AI agent to:
- ingest InvenTree Parts module documentation (docs.inventree.org/en/stable/part/)
- generate UI manual test cases
- ingest the Part API schema and generate API manual test cases
- generate API automation scripts (framework of choice)
- generate UI automation scripts (framework of choice)
- package everything as a git repo with a specific folder structure, including
  agent prompts/config as evidence of the agentic workflow

Clarify scope with me (language/framework choice, whether to bundle the separate
case study, whether I already have InvenTree running) before building.
```

## Phase 1 — Requirements Ingestion & UI Test Case Generation

```
Fetch the InvenTree Parts documentation, including sub-pages for:
- Creating a Part
- Part Views (all detail-page tabs)
- Part Parameters
- Part Templates/Variants
- Part Revisions (pay close attention to the documented restrictions —
  circular references, unique revision codes, template parts cannot have revisions)
- Tracking / trackable parts

From this, generate a comprehensive set of UI/manual test cases covering:
- Part creation (manual entry and import flows)
- Part detail view — all tabs (Stock, BOM, Allocated, Build Orders, Parameters,
  Variants, Revisions, Attachments, Related Parts, Test Templates)
- Part categories — hierarchy, filtering, parametric tables
- Part attributes — Virtual, Template, Assembly, Component, Trackable,
  Purchaseable, Salable, Active/Inactive
- Units of measure configuration
- Part revisions — creation and all three documented constraints
- Negative and boundary scenarios (duplicate IPN, inactive part restrictions,
  revision-of-revision prevention)

Output as a markdown table: ID, Title, Preconditions, Steps, Expected Result,
Priority, Risk Tier.
```

## Phase 2 — API Schema Analysis & API Test Case / Automation Generation

```
Now do the same for the Part API. Generate manual API test cases covering:
- CRUD operations on Parts and Part Categories
- Filtering, pagination, and search on the Parts list endpoint
- Field-level validation (required fields, max lengths, nullable constraints,
  read-only fields)
- Relational integrity (category assignment, default locations, supplier linkage)
- Edge cases (invalid payloads, unauthorized access, conflict scenarios)

Then generate a runnable Playwright (TypeScript) API automation project that:
- Is executable against a running InvenTree instance (Docker-based)
- Covers positive, negative, and boundary scenarios
- Asserts on status codes, response schema, and business logic
- Uses data-driven/parameterised tests where appropriate
- Handles auth via token or session, configurable via .env
```

## Phase 3 — UI Automation Generation

```
Using the Phase 1 test cases, generate Playwright (TypeScript) UI automation
scripts that:
- Cover the core Part CRUD workflows
- Validate key UI elements, navigation, and form behaviour
- Include at least one cross-functional flow: create a part → add a parameter
  → create stock → verify it appears in the category view
- Handle waits, selectors, and assertions robustly (avoid brittle fixed sleeps;
  prefer Playwright's auto-waiting and explicit expect() assertions)
- Flag any selector that can't be verified without a live instance with a
  `// VERIFY:` comment rather than guessing silently
```

## Phase 4 — Packaging

```
Package everything into the exact submission/ folder structure required by the
assessment guidelines (README, agents/, test-cases/, automation/ui, automation/api,
video/). Include setup instructions assuming a fresh InvenTree Docker install,
since I don't have an instance running yet. Also fold in the earlier insurance
claims risk-based test strategy as a supplementary case-study/ folder.
```

## Notes on Iteration

Where generated code referenced UI selectors or API fields that could not be verified against a live InvenTree instance in this session, the agent was instructed to flag rather than fabricate confidence — see `// VERIFY:` comments in the UI spec files and the "What Was Generated vs. Manually Adjusted" section of the root README.
