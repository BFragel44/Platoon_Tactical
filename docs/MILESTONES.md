# Milestones

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
