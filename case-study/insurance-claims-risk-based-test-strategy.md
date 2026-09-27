# Risk-Based Test Strategy & Coverage Plan — Insurance Claims Platform

*Supplementary case study, prepared as part of the broader Quality Architect assessment.*

## 1. Diagnosis First

The core issues aren't really "not enough testing" — they're **untargeted testing effort** and **no visibility**:
- Equal testing effort across all features means high-risk claims-calculation logic gets the same scrutiny as a cosmetic UI tweak
- 50% of incidents cluster in claims calculation + integrations, yet these are exactly the areas *without* automation
- "Coverage is unknown" means the organization is flying blind on regression risk every release

So the strategy needs three legs: **(1) risk-based prioritization, (2) targeted automation investment, (3) metrics that make risk visible going forward.**

---

## 2. Risk Classification Framework

Build a simple risk score per feature/module so testing effort maps to actual business risk, not team habit.

**Risk Score = Impact × Likelihood × Change Frequency**

| Factor | Low (1) | Medium (2) | High (3) |
|---|---|---|---|
| **Impact** | Cosmetic/internal tool | Customer-facing, non-financial | Affects claim payout, compliance, or legal exposure |
| **Likelihood of defect** | Stable, rarely touched | Moderate complexity, some coupling | Complex logic, multiple integrations, legacy code |
| **Change frequency** | Rarely modified | Modified most releases | Modified almost every release |

**Applying this to the platform:**

| Module Type | Typical Risk Score | Priority Tier |
|---|---|---|
| Claims calculation engines (auto/health/property) | 9 (High) | **Tier 1 – Critical** |
| Third-party integrations (assessors, payment, external data) | 9 (High) | **Tier 1 – Critical** |
| Platform services (auth, notifications, document mgmt) | 4–6 (Medium) | **Tier 2 – Important** |
| Agent/customer UI, reporting, admin tools | 1–3 (Low) | **Tier 3 – Standard** |

This immediately explains the incident data: **Tier 1 modules have zero automation today**, which is the gap to close first.

---

## 3. Test Strategy by Tier

**Tier 1 – Claims Calculation & Third-Party Integrations**
- Automated regression suite is mandatory, not optional — target 80%+ coverage of calculation rules within 2 quarters
- Contract testing (e.g., Pact) for every third-party integration to catch breaking changes before they hit production
- Golden-record / reference-data testing: maintain a library of known claim scenarios with pre-verified expected payouts (by product line) and run them every build
- Chaos/failure testing for integrations: timeouts, malformed responses, partial failures — since integration failures are half the incidents
- Manual exploratory testing reserved for edge cases automation can't easily cover (ambiguous policy wording, multi-party claims)

**Tier 2 – Platform Services**
- Already has automation — extend it to cover cross-service workflows (e.g., a claim moving through auth → document upload → notification), not just isolated service tests
- Add integration-level tests between Tier 2 services and Tier 1 modules, since that's where platform and product risk overlap

**Tier 3 – UI/Admin/Reporting**
- Lightweight automation (smoke tests) only
- Manual testing on a sampling basis, not full regression every release

---

## 4. Coverage Plan

Since coverage is currently untracked, start by **measuring before optimizing**:

1. **Baseline audit (Weeks 1–4):** For each of the 8 teams, inventory existing manual test cases and map each to a module + risk tier.
2. **Set tier-based coverage targets**, not a blanket number:
   - Tier 1: 80% automated coverage of calculation logic and integration contracts within 2 quarters
   - Tier 2: 60% automated coverage, expand existing suites
   - Tier 3: smoke-test coverage only, manual exploratory for the rest
3. **Track coverage per release**, not just once — coverage decays as code changes if not maintained.

---

## 5. Automation Roadmap

| Phase | Timeframe | Focus |
|---|---|---|
| **Phase 1** | Quarter 1 | Shared automation framework/toolchain + contract testing for top 3 highest-incident integrations |
| **Phase 2** | Quarter 2 | Automate claims calculation regression suites for the 3 product teams, using golden-record scenarios |
| **Phase 3** | Quarter 3 | Extend automation to remaining integrations + cross-service workflows |
| **Phase 4** | Quarter 4 | Automation maintenance cadence + expand Tier 2 coverage; retire redundant manual regression cases |

**Structural recommendation:** with only 1 QA engineer per team, a small **central QA/SDET enablement pod** (2–3 people) should build shared frameworks and contract-testing infrastructure, and coach team QAs, rather than expecting each team to build automation capability from scratch in parallel.

---

## 6. Metrics & Governance

**Quality metrics**
- Claims calculation defect rate (defects per release, by product line)
- Integration failure rate (by third-party partner/service)
- Escaped defects to production, tagged by risk tier
- % automated coverage by tier (tracked per release, not annually)

**Process metrics**
- Mean time to detect / resolve claims calculation defects
- Regression test cycle time (manual vs automated)
- % of production incidents traceable to a Tier 1 module (should trend down as automation increases)

**Governance**
- A lightweight **Test Strategy Council** (one QA lead per team + the enablement pod), meeting biweekly, aligned to release cadence, to review metrics and re-tier modules whose risk profile has changed
- Quarterly review of risk classification itself, not just test results

---

## 7. Sequencing Recommendation

If only one thing can be done first: **stop testing everything equally**. Redirecting existing manual regression effort toward Tier 1 modules (claims calculation, integrations) using the risk framework above will likely reduce incidents faster than any tooling investment, because it fixes the root cause — effort misallocation — immediately.
