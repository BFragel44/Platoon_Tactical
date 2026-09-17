# Development milestones

## M0 — Three-team contact (CURRENT)
**Question:** Can three fireteams, limited leadership and uncertain contacts produce understandable support-and-maneuver decisions across a small Location graph?

### Playable target
Alpha, Bravo and Charlie each contain four named soldiers. Lt. Walker attaches to Alpha initially. Secure Stone House and hold it through the following complete turn, or abort. Casualties, loss of capability and the mission time limit can produce defeat.

### Implementation stages within M0
1. Command and movement: three teams, leader transfer, variable allowance and reserve, immediate orders, one End Turn control.
2. Known defender: Location fire pressure, terrain, exposure, cover, rally, supporting fire, assault, casualties and terminal outcomes.
3. Uncertain contacts: generated positions overlooking triggers, suspected fire origins, stationary observation, player-safe history.
4. Readable encounter: tactical map, legal-order explanations, turn summaries and event-derived AAR.

All four stages are implemented in the corrected prototype. This is not a claim that its balance or fun is proven. Human playtest feedback remains the acceptance gate.

### Completion criteria
- Support fire changes the risk of maneuvering another team.
- Commands create choices among spotting, support, movement, cover and recovery.
- Leader location and casualties have understandable consequences.
- Pinned teams have recovery paths, rather than permanent mutual suppression lock.
- Known and uncertain configurations support a full encounter and explicit success, defeat and abort.
- The live view never reveals hidden composition or diagnostic random information.
- The same scenario, seed and orders reproduce the history.
- The tester can explain incoming fire, movement danger and the effect of the last order without opening diagnostics.
- Compare direct advance, support-and-flank and recovery-first approaches on the same seed set; record failures as well as successes.

See M0_RULES_AND_PLAYTEST.md for rules, repeatable procedures and verification observations.

### Deferred
Campaign persistence, progression, loadouts, ammunition logistics, close-up animation, vehicles, artillery, air support, civilians, VIPs, extraction, procedural missions, multiplayer, databases and generated narrative remain outside M0.
