# Milestones

## Current milestone — KUTF accepted; campaign foundation next

The user reports repeated smooth, fun KUTF playthroughs. The general standalone playability gate is closed; no confirmed KUTF blocker remains in the scoped audit. Notes 4 fixes are complete. Begin the mission/roster foundation in [Normandy readiness](NORMANDY_READINESS.md), keeping Normandy unavailable until its own dependencies are implemented. Older milestone entries below describe historical acceptance gaps and do not reopen this gate.

## Notes KUTF 3 — implemented, human acceptance open

Spotting/command clarity and PDF selection are implemented at rules revision 13: Pending activity, spotter penalty, multi-PDF joining, safe spotting confirmation, command limits, contact labels and compact combat consequences. Automated and short browser verification is recorded in COMPANY_PLAYTEST_RESULTS.md. Human acceptance should confirm spotting stakes, actual PDF contributors and readable consequences before calling this milestone accepted. Normandy remains unavailable.

## September 28 — KUTF audit closure (revision 12)

Confirmed activity/capture/readiness defects corrected and critical fixtures added. Remaining gate is focused human and visual acceptance; see [audit](KUTF_READINESS_AUDIT.md). Behavior-preserving mission/roster modularization may proceed. Normandy Mission 1 still requires its documented systems; no persistent campaign is enabled.


## September 28: rules explanations and readiness audit

Implemented the revision-11 tracker-audit corrections, command arithmetic and roster overview. KUTF remains a playable validation build; enemy activity and casualty-capture fidelity prevent declaring it complete. Next: close those confirmed gaps, then modular mission/roster contracts. Normandy and campaign continuity remain gated. Details: [KUTF readiness audit](KUTF_READINESS_AUDIT.md).


## September 26 increment: KUTF clarity — implemented, UI acceptance open

Rules revision 10 corrects card-level engagement priorities and orders frozen combat by map position. Inventory, tactical readiness, HQ transitions, segment-result dialogs and on-card contacts are implemented. Full regressions, build and two deterministic mission runs pass. Browser runtime failed to initialize, so visual/keyboard/reload acceptance is explicitly unfinished. Keep Up the Fire remains available for the user's human test; Normandy remains gated.


## Current: Complete Keep Up the Fire — in progress

Keep Up the Fire content 11 is enabled as a **human-acceptance build** with validated setup confirmation, upper-story contact placement and unlimited fortification markers by explicit user agreement. Printed capacities and finite enemy unit counters remain enforced. See [KEEP_UP_THE_FIRE_STATUS.md](KEEP_UP_THE_FIRE_STATUS.md) for checks and unresolved audits. Human acceptance is still open; Normandy remains gated. Rules revision 9 and Company Assault content 4 remain unchanged.

## Historical: Correct fire paths and explain continuing fire (revision 6)

One ten-turn company mission, not a tutorial. Two platoons and support assets must clear eight Potential Contacts and the resulting defenders. Company/platoon command, movement, known-position combat and uncertain contacts are parts of one encounter.

Implemented: local seeded action deck; HQ activation/initiative/reserves; communications; explicit sequence; squads and cohesion; persistent fire; spotting, cover, recovery, grenades, indirect fire, enemy activity, capture/retreat; outcomes, player reports and replay/AAR export.

Validation completed: 140 automated tests, production build, desktop/narrow-layout, contact, HIT and reload browser checks, and six full scripted policy runs with exact replay verification. Combat probabilities are derived from the vendored 50-card deck; 3.7.4 now freezes and presents one receiving formation at a time with an explicit seeded Resolve operation and staged HIT effect. See [playtest record](COMPANY_PLAYTEST_RESULTS.md).

**Implementation complete; human acceptance remains open.** Exact table derivation, roll boundaries, RNG consumption, frozen ordering, nonrepeatable resolution, fire persistence, replay, fog-of-war projections and recovery presentation state have regression coverage. The submitted human run succeeded under historical rules revision 1 and remains unchanged. Revision-5 scripted strategies all lost with the same summaries as revision 4; this does not justify balance changes. Another human playtest must confirm the pre-result screen makes the stakes understandable.

## Subsequent work

1. Validate the reference edge cases and improve player comprehension through human playtests.
2. Tune scenario/force choices only after separating rule defects from weak tactics; record any departure from the course.
3. Revisit campaign and persistence only after a satisfying, understandable complete encounter.

Revision 5 adds stable order intent and command previews, HQ action labels, corrected casualty-area and HQ donor legality, actual PDF source attribution, focused contacts, single-click complete HIT results, manifest-driven artwork and visible casualty/history markers. Browser interaction and responsive DOM checks pass; screenshot capture timed out, so visual screenshot sign-off and human comprehension acceptance remain open.

Revision 6 implements initial-engagement obstruction checks, persistent direction versus affected location, point-blank departure following, source-smoke fire retention, collective enemy cease-fire checks, manifest-safe support badges, movement warnings and final-state labels. Targeted production-component browser validation passed. Human tactical acceptance remains open; the September 22 submitted revision-5 AAR is a preserved SUCCESS baseline, not proof of revision-6 acceptance.

## Visible terrain borders and LOS verification

Implemented in rules revision 7 / scenario 4: shared eight-direction borders, printed terrain provenance, independent SVG map borders, safe LOS explanations, stepped-elevation correction and directional spotting concealment. Existing formation panels and probability resolution are preserved. Automated and scripted validation is recorded in COMPANY_PLAYTEST_RESULTS.md; human manual acceptance remains open.

## Explicit reconstitution and readable fire paths

Rules revision 8 / scenario 4 requires explicit contributor teams and an eliminated squad target, enforcing the restored counter's step capacity. Cease Fire retains its rule-correct card-wide effect with clearer source/result feedback. Selectable projected PDF traces and All Pinned marker explanations address the September 23 notes. Automated regressions, the six scripted policies and a production build pass. Human acceptance remains open for reconstitution and long-range fire-path comprehension.
