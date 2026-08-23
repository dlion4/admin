Building Page 22 to the same standard. First, let me review the P21 conventions and UI kit to stay consistent:

Let me check the full page registry for valid cross-nav targets, then write the data layer:

Now writing the data layer:

Data layer done. Now the modals/drawers file — part 1 (helpers + core drawers):

Part 2 — remaining drawers:

Part 3 — service, plan, and mandate modals:

Fixing a broken template literal I spotted in RetryNowModal, then the final modals part:

Reproduced in isolation — let me bisect the construct:

Found a genuine TS parser quirk with that token combination. Restructuring the chip to a computed label (cleaner anyway):

Modals clean. Now the full page component:

Clean build. Updating the landing page and running the runtime verification suite:

The test rendered page 21 — let me check App.tsx state:

Page renders and service flows all pass. Debugging the mandate footer:

Found a real bug: mandates paused by a service pause stay Paused after the service resumes. Fixing:

All service/mandate flows pass. Now part 2 — failed queue, plans, dunning, config CR governance loop, approvals:

All flows green. One final pass on the remaining deep actions — typed-confirm cancels, retire, bulk retry, and console drawers:

PAY-15012 is on page 2 of the paginated table — using a page-1 row instead:

All flows verified end-to-end. Final checks and commit:

**Page 22 — Recurring Services is shipped and pushed** (`1951c54`). tsc clean, build passes, dev server untouched, zero runtime errors across three full happy-dom verification suites.

## What was built

**9 tabs** covering every spec section plus design-layer depth:
| Tab | Spec | What's in it |
|---|---|---|
| Services | §22.1 | 10 services · pause/resume, signup freeze, full console drawer |
| Plans | §22.2 | 9 plans · wizard, price **CR-gated**, clone, pause, retire-with-migration |
| Mandates | §22.3+ | 18 mandates · console + bulk ops, skip cycle, amount, billing day, cancel-with-win-back |
| Failed queue | §22.3 | 16 failures · retry now, mark recovered, extend grace, bulk retry |
| Dunning | §22.6 | 6 campaigns · wizard, copy edit (approval-gated), **A/B test bench** |
| Churn | §22.4+22.5 | 9 analytics metrics, reason→action assignment, 4 win-back offers |
| Lifecycle | §22.7 | 10 stages Trial→Reactivated with counts |
| Configuration | §22.8 | 15 settings · every change files a CR; locked invariants |
| Approvals | — | Risk→Product→Finance→Super Admin queue with 2FA final gate |

**45 interactive surfaces** (12 well-designed drawers with tabs/footers + 33 modals), all wired to real mutable state.

## Verified end-to-end (highlights)

- **Governance loop**: config edit → `→ 4` pending badge → CR in approvals → Super Admin approve + 2FA → value collapses to `4`, badge clears
- Plan retire migrated **10,140 subscribers** into Family Cover automatically
- Mandate cancel: typed `PAY-15006` + win-back offer → offer eligibility incremented
- A/B test left a live `A/B live — B 50% · 7d` badge on DUN-01
- Bulk retry (2 picked) from the queue console drawer
- Cross-nav header dropdown → landed on Product Configuration (P21)
- One toast per mutation, reason ≥8 chars + 2FA (`482913`) everywhere, audit trail grew live with each action

Also fixed a real logic bug found by the tests: mandates paused *by a service pause* now correctly resume when the service resumes.

**Next: Page 23 — Card Programs** (V2.md line 2480). Say the word and I'll read the spec block and build it to this standard.