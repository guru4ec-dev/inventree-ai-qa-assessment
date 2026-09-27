# Video Recording — Checklist

This folder is a placeholder. I can't record your screen for you, so record this yourself and drop the file in here as `recording.mp4` (or replace this README with a link to a cloud-hosted video, per the submission instructions).

The assessment requires the recording to demonstrate:

- [ ] The agent (Claude) generating test cases from the InvenTree Parts requirements (Phase 1) — show the actual conversation/prompting, not just the final files
- [ ] The agent generating automation scripts from the API spec (Phase 2)
- [ ] Test execution — at least a subset of the automated tests actually running successfully against your local InvenTree instance (`npm test` in both `automation/api/` and `automation/ui/`)
- [ ] Any iterative refinement or correction you performed on the agent's output — e.g. fixing a selector that didn't match your instance, or adjusting a field name after checking the live API

## Suggested Recording Flow

1. Show this conversation (or a fresh equivalent) generating the UI test cases from the fetched documentation.
2. Show the API test case generation and the resulting `automation/api/` project being scaffolded.
3. Run `cd automation/api && npm install && npm test` on camera, showing results (and fixing anything that fails against your specific InvenTree version — this is expected and fine to show, per the assessment's transparency requirement).
4. Run `cd automation/ui && npm install && npx playwright install && npm test` on camera (headed mode recommended for visibility: `npm run test:headed`).
5. Briefly narrate any selector or field-name fix you made, referencing the `// VERIFY:` comments left in the code.

## Suggested Tools for Recording

- OBS Studio (free, cross-platform)
- macOS: built-in QuickTime screen recording
- Windows: built-in Xbox Game Bar (Win+G)
- Loom (easy cloud-hosted link, satisfies the "or link to cloud-hosted video" submission option)
