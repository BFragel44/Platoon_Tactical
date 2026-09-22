# Company validation record - 2026-09-16

## Verified

- 70 tests pass (50 historical platoon tests plus 20 company-specific tests).
- Production build passes.
- Browser: mission renders, phase stepping reaches Company HQ, both subordinate HQ activations work, and first-platoon group movement resolves immediately with exposure messages. No browser console errors observed at that checkpoint.
- Browser review found and fixed targeted-order buttons incorrectly disabled by null/default handling.
- Six full scripted public-view policy runs terminated at turn 10; each exported operation log replayed to identical state and event history.

## Scripted comparisons

| Seed | Approach | Outcome | Orders | Friendly casualty steps | PCs remaining |
|---|---|---|---:|---:|---:|
| company-1 | direct | DEFEAT | 72 | 16 | 1 |
| company-1 | support | DEFEAT | 34 | 17 | 5 |
| company-1 | recovery | DEFEAT | 36 | 18 | 3 |
| company-2 | direct | DEFEAT | 44 | 9 | 6 |
| company-2 | support | DEFEAT | 51 | 11 | 4 |
| company-2 | recovery | DEFEAT | 46 | 13 | 6 |

These policies are deliberately simple and do not demonstrate optimal tactics. All six lost; no claim is made that support or recovery policies are balanced, or that a complete human victory has been demonstrated. Detailed phase/card/order traces and replay files are generated under `output/company-playtests/` by `npm run playtest`.

## Acceptance still to perform

Complete full human direct/support/recovery comparisons with these seeds, check reference edge cases listed in the rules guide, and establish that a tester can explain command effects and tactical danger without diagnostics. The browser check above is an opening-flow check, not a complete manual mission. The build is a validation candidate, not an accepted final rules reproduction.
