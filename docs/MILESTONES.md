# Milestones

## Current: Company Assault validation candidate

One ten-turn company mission, not a tutorial. Two platoons and support assets must clear eight Potential Contacts and the resulting defenders. Company/platoon command, movement, known-position combat and uncertain contacts are parts of one encounter.

Implemented: local seeded action deck; HQ activation/initiative/reserves; communications; explicit sequence; squads and cohesion; persistent fire; spotting, cover, recovery, grenades, indirect fire, enemy activity, capture/retreat; outcomes, player reports and replay/AAR export.

Validation completed: automated company rules tests, production build, browser opening/activation/movement checks, and six full scripted policy runs with exact replay verification. See [playtest record](COMPANY_PLAYTEST_RESULTS.md).

**Acceptance remains open.** Scripted strategies all lost. Full human tactical runs and remaining rule-fidelity checks listed in the rules guide must precede an accepted first playable milestone. Passing component tests is not acceptance.

## Subsequent work

1. Validate the reference edge cases and improve player comprehension through human playtests.
2. Tune scenario/force choices only after separating rule defects from weak tactics; record any departure from the course.
3. Revisit campaign and persistence only after a satisfying, understandable complete encounter.
