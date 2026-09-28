# KUTF readiness audit — September 28, 2026

## Decision

KUTF is a playable standalone validation mission, **not yet certified rules-complete**. The user has completed several human playthroughs; those are real acceptance evidence, not replaced by scripted policies. Revision 11 needs a focused follow-up after the corrections below. Normandy remains unavailable.

A behavior-preserving modularization can begin, but do not describe Normandy or persistent campaign play as ready. Finish the concrete KUTF blockers before implementing/ungating Normandy Mission 1. The new roster overview is inspection only; it does not persist a company between missions.

## Revision 11 completed

- Activity cannot become No Contact while VOF/PDF remains, including fire at empty cards and unactivated mines. Occupied mine cards count for activity. Automatic recovery checks card VOF, not whether this formation has a combat roll.
- Enemy hierarchy “under fire” excludes unactivated mines, as its aid specifies; this is distinct from activity/recovery restrictions.
- Combat compares attack-specific smoke, burst and crowded-cover adjustments before choosing the strongest applicable attack. Crowding applies to grenade/Incoming effects, not sniper, mines or mortar-section basic fire. Snipers receive applicable smoke protection. NCM records list these adjustments separately.
- Grenade VOF affecting an HQ/its cover applies the -3 command draw modifier.
- Setup permits overloaded allocations; existing movement restrictions and free unloading remain. Supply totals and one rifle grenade per platoon are unchanged.
- Header exposes command arithmetic. Roster menu lists friendly formation steps/counter capacity, experience, side/status, location and equipment; inspection does not issue orders.
- Rules version 11; KUTF content 11 and course content 4 unchanged. Strict version rejection retains historical files. Weighted probabilities are unchanged.

Authority: Charts & Tables 1, Activity / Command Draw / Infantry Combat tables; rules §§3.7.3, 4.1.2, 5.1.6A, 6.4. The HTML tracker is explanatory reference, not rules authority.

Validation: 309 tests passed; production build passed; six final-code KUTF runs (two seeds × three policies) terminated on turn 10 and reconstructed exactly. Detailed results are in [validation record](COMPANY_PLAYTEST_RESULTS.md).

## Remaining concrete blockers

1. **Enemy activity hierarchy.** `combat.js:enemyActivity` still uses No Action when an ordinary enemy is out of fire and has no LOS to opponents. The supplied hierarchy requires removal/replacement PC under §8.6.2; the training-course exception must not carry into KUTF. Litter Teams always take the no-casualty branch instead of seeking/transporting casualties. Trading-fire probabilities and Out of Ammo branches also need reconciliation against the Deliberate column. Reconstitution with an enemy leader is a Normandy dependency, not a KUTF requirement: this mission has no enemy leaders.
2. **Enemy casualty capture.** A read-only fixture left an enemy casualty uncaptured on an empty cleared card. §8.15.1 allows capture on an unoccupied card with no enemy units or PC markers, as well as qualifying friendly occupation. Earlier documentation saying empty cards never capture casualties was incorrect. Correct the condition and scoring without awarding duplicate credit or leaking unobserved units. Review guard-step formation transitions under §8.15 in the same increment.
3. **Remaining certification rather than demonstrated absence.** Close the detailed fortification grenade-response, enemy named-counter breakdown, event removal/load disposition and sniper hidden-causality checks using targeted branches. Core code and many fixtures exist, so do not reimplement these wholesale. Verify integrated CCP scoring and final achievements with a human result.
4. **Visual acceptance.** Browser automation failed to initialize this turn. Desktop/narrow roster layout, keyboard inspection, command popover and corrected NCM labels need manual review. Existing human playthroughs remain valid evidence for earlier builds.

## Systems reviewed and present

| Mission requirement | Current evidence / limitation |
| --- | --- |
| Three platoons, staff, attachments, equipment | Mission definition matches pp.6–7; setup choices recorded. Overload behavior corrected. |
| Seeded 4×4 map, hill/terrain revelation, objectives, CCP | Implemented in setup/knowledge modules; hidden CCP rejected after setup revelation. Worked-example/revelation-order acceptance remains targeted verification. |
| Simplified communication, unlimited ammunition/missions, no signals/vehicles | Mission flags match p.4; event-driven MG ammunition retained. These are published exceptions, not missing KUTF features. |
| Contacts, finite enemy pool, buildings/fortifications | Package and placement modules plus critical placement tests; unlimited fortification markers remain the approved assumption, not a physical inventory claim. |
| Mines, snipers, spotters, HE/WP | Implemented and covered by focused tests; revision 11 corrects mine/recovery and sniper NCM edge cases. |
| HQ events, capture/retreat, achievements | Present, but capture and activity blockers above prevent full fidelity certification. |
| Replay, saves, AAR, terminal outcomes | Versioned deterministic mission records exist. They are not a persistent campaign roster. |

Sources: supplied KUTF mission pp.4–9 and 24; third-edition rulebook §§3.7.3, 5.1.6, 6.4, 8.6, 8.15; supplied Enemy Activity Check Hierarchy. This is a scoped source/code/fixture audit, not proof of every possible rules interaction.

## Modular campaign foundation after the KUTF closure increment

1. Define a versioned **campaign roster** independent of mission state: stable person/step/formation IDs, experience, casualties, returning guard steps, replacements and equipment. Do not persist temporary pins, PDFs, exposure, contacts or command impulses into the company roster.
2. Separate **mission content** (terrain, TO&E, contacts, tactics, events, support, scoring and exceptions) from reusable rules services. Replace hardcoded HQ IDs, mission flags and hierarchy assumptions behind typed/validated capabilities; preserve current public APIs with adapters.
3. Record **deployment/setup** from a roster snapshot. Mission replay must embed/reference the exact immutable roster snapshot and content/rules versions rather than the latest mutable campaign save.
4. Apply **mission results once** through an explicit debrief transaction. Preserve guard returns, prisoner disposition, step losses, experience, reconstitution, replacements and mission reattempts. Retry/reload must not duplicate losses or rewards. Keep campaign saves separate from mission autosaves, with backup/export and explicit incompatible-version handling.
5. Add **Normandy Mission 1 dependencies**: tracked ammunition/carrying/resupply, limited support, campaign communications/signals, enemy leaders and additional weapons, counterattacks/replacement PCs and Offensive Assault tactics, temporary HQs and reattempts. Only then add its content and ungate it.

Recommended next implementation: close enemy activity and casualty capture first, then extract mission/roster contracts under deterministic regression protection. Campaign continuity is a new system, not a save-format rename.
