# Agent Configuration Notes

**Tool used:** Claude (claude.ai chat interface, web search + web fetch tools enabled, code execution/file creation enabled)

No custom `.cursorrules` / `.github/copilot-instructions.md` / `claude_project` config file was used — the agent was directed entirely through the conversational prompts in `prompts.md`, using Claude's built-in web-fetch and code-execution tools to:

1. Retrieve live documentation pages from `docs.inventree.org` rather than relying solely on training-data knowledge of InvenTree (which can be stale relative to the current stable/latest docs).
2. Write and organize the actual project files (test case markdown, Playwright TypeScript projects) directly in a sandboxed environment.

## Role Framing Given to the Agent

The agent was framed as acting in a **Quality Architect / senior SDET capacity**: producing risk-aware, maintainable test artefacts (not just maximal test-case volume), flagging assumptions and unverifiable details explicitly rather than presenting fabricated certainty (e.g. UI selectors that depend on a specific InvenTree UI build), and preferring auto-waiting/robust Playwright patterns over brittle fixed-delay patterns.

## Equivalent reusable config (if adopting Cursor/Copilot instead)

For teams wanting to reproduce this workflow with `.cursorrules` or `.github/copilot-instructions.md`, the equivalent instruction block would be:

```
You are assisting with QA test design and automation for the InvenTree Parts module.
- Always ground test cases and API assertions in the actual InvenTree documentation
  and API schema, not assumptions — fetch/read source docs before generating tests.
- Prefer Playwright's built-in auto-waiting and `expect()` polling assertions;
  never use fixed `sleep()`/`waitForTimeout()` as a primary wait strategy.
- Cover positive, negative, and boundary cases for every CRUD endpoint.
- Flag any UI selector or field name that cannot be verified against a live
  instance with a `// VERIFY:` comment instead of guessing silently.
- Structure manual test cases as: ID, Title, Preconditions, Steps, Expected
  Result, Priority, Risk Tier.
```
