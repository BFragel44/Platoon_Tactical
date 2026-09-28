# KUTF readiness audit — September 28, 2026

## Decision

KUTF is a playable standalone validation mission, **not yet certified rules-complete**. The user has completed several human playthroughs; those are real acceptance evidence, not replaced by scripted policies. Revision 13 closes the additional Notes KUTF 3 findings: Pending activity, spotter spotting penalty and multiple-PDF joining, alongside revision 12 corrections. A focused human follow-up remains required; this is not a claim that every rule interaction has been exhaustively certified. Normandy remains unavailable.

A behavior-preserving modularization can begin, but do not describe Normandy or persistent campaign play as ready. The confirmed KUTF blockers below are corrected. Start mission/roster modularization under regression protection; keep Normandy gated until its own required systems and acceptance exist. The new roster overview is inspection only; it does not persist a company between missions.

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

## Revision 12 closure

- **Enemy activity:** isolated ordinary defenders are removed and replaced by the original PC letter, without duplicating an existing PC. Contact origin is recorded at placement. The training course retains its no-removal exception. Litter Teams prioritize local/visible casualties before rally; out-of-ammo and trading-fire rows follow the Deliberate/No Leader hierarchy. Illegal weighted outcomes are excluded (the §8.6.2 permitted alternative to redrawing). Fire direction compares bearings rather than target-card identity. Fallback observes movement limits, LOS/protection priority, and off-map casualty evacuation. Enemy LAT movement does not require friendly occupation. Snipers/spotters retain special behavior.
- **Capture:** empty cards without enemy occupants or unresolved PCs now allow enemy casualty capture. Friendly occupation also qualifies when no enemy remains. Scoring is once per casualty and does not expose hidden formation/step identity. Guard assignment records the returning step's origin/experience. A one-step friendly squad remainder becomes the selected Fire/Assault Team; enemy choice is seeded. Equipment and carried casualties transfer to the remainder or drop when appropriate.
- **Guard choice:** the capture-segment header provides a Fire/Assault selection, recorded in `advancePhase` options for strict replay. The selected preference applies to all qualifying friendly squad remainders in that segment (default Fire Team); individual per-formation overrides are not exposed.
- **Fortifications and loads:** bunker/pillbox occupants cannot throw a free point-blank response from inside the fortification (§5.3.2). Enemy activity can make them leave cover, exposed, to attack. Withdrawal/surrender/capture no longer silently strands carried equipment/casualties on removed formations.
- **Critical verification:** focused tests cover contact letters/duplicate prevention, casualty-seeking/evacuation, empty-card scoring, guard transfer/choice replay, bunker response, named HMG/sniper/spotter sides, higher-HQ load removal, sniper information safety and ammunition-row precedence. Existing placement, grenade critical/stacking, CCP and final scoring tests remain passing.

Rules **12**, KUTF content **11**, course content **4**. Historical exports remain unchanged and incompatible executable saves/replays reject explicitly. No probability tuning or scenario-force changes.

Validation: **318 tests pass**, production build passes, and six final-code seeded KUTF runs terminate and strictly reconstruct state/RNG/history. `kut-1/support` succeeds on turn 10; five other scripted policies end in defeat. Detailed records are in [validation results](COMPANY_PLAYTEST_RESULTS.md).

## Remaining acceptance and boundaries

- A human follow-up should confirm new contacts after enemy withdrawal, Litter Team behavior, guard choices/load disposition, CCP evacuation, final achievement totals and understandable tactical messages. Earlier human playthroughs remain evidence, but do not certify revision 13.
- Browser checks passed on isolated `127.0.0.1:4182`: KUTF setup/start, 25-row roster, inspection, command arithmetic, Escape, narrow DOM bounds, guard selection, capture review and reload/strict resume. No captured console errors. Screenshot capture timed out, so **visual sign-off and an entire browser mission remain open**. The user's existing localhost save was not touched.
- This closes the enumerated confirmed audit defects, not a universal rules certification. The existing documented action-menu/UI scope remains; enemy leaders, campaign ammunition, campaign continuity and Normandy-specific tactics are outside KUTF.
- Unlimited fortification markers remain the user's approved assumption; capacities and enemy counter supplies remain enforced.

## Systems reviewed and present

| Mission requirement | Current evidence / limitation |
| --- | --- |
| Three platoons, staff, attachments, equipment | Mission definition matches pp.6–7; setup choices recorded. Overload behavior corrected. |
| Seeded 4×4 map, hill/terrain revelation, objectives, CCP | Implemented in setup/knowledge modules; hidden CCP rejected after setup revelation. Worked-example/revelation-order acceptance remains targeted verification. |
| Simplified communication, unlimited ammunition/missions, no signals/vehicles | Mission flags match p.4; event-driven MG ammunition retained. These are published exceptions, not missing KUTF features. |
| Contacts, finite enemy pool, buildings/fortifications | Package and placement modules plus critical placement tests; unlimited fortification markers remain the approved assumption, not a physical inventory claim. |
| Mines, snipers, spotters, HE/WP | Implemented and covered by focused tests; revision 11 corrects mine/recovery and sniper NCM edge cases. |
| HQ events, capture/retreat, achievements | Capture/activity corrections complete; integrated human scoring/behavior acceptance remains open. |
| Replay, saves, AAR, terminal outcomes | Versioned deterministic mission records exist. They are not a persistent campaign roster. |

Sources: supplied KUTF mission pp.4–9 and 24; third-edition rulebook §§3.7.3, 5.1.6, 6.4, 8.6, 8.15; supplied Enemy Activity Check Hierarchy. This is a scoped source/code/fixture audit, not proof of every possible rules interaction.

## Modular campaign foundation after the KUTF closure increment

1. Define a versioned **campaign roster** independent of mission state: stable person/step/formation IDs, experience, casualties, returning guard steps, replacements and equipment. Do not persist temporary pins, PDFs, exposure, contacts or command impulses into the company roster.
2. Separate **mission content** (terrain, TO&E, contacts, tactics, events, support, scoring and exceptions) from reusable rules services. Replace hardcoded HQ IDs, mission flags and hierarchy assumptions behind typed/validated capabilities; preserve current public APIs with adapters.
3. Record **deployment/setup** from a roster snapshot. Mission replay must embed/reference the exact immutable roster snapshot and content/rules versions rather than the latest mutable campaign save.
4. Apply **mission results once** through an explicit debrief transaction. Preserve guard returns, prisoner disposition, step losses, experience, reconstitution, replacements and mission reattempts. Retry/reload must not duplicate losses or rewards. Keep campaign saves separate from mission autosaves, with backup/export and explicit incompatible-version handling.
5. Add **Normandy Mission 1 dependencies**: tracked ammunition/carrying/resupply, limited support, campaign communications/signals, enemy leaders and additional weapons, counterattacks/replacement PCs and Offensive Assault tactics, temporary HQs and reattempts. Only then add its content and ungate it.

Recommended next implementation: extract mission/roster contracts under deterministic regression protection while the user performs revision-12 acceptance. Campaign continuity is a new system, not a save-format rename.

## Notes KUTF 3 follow-up

Rules 13 keeps content versions 11/4 and rejects older executable records. 324 tests and production build pass; six seeded KUTF checks reconstruct exactly with unchanged headline outcomes. Spotting confirmation, command limits, contact labels and compact HIT results received browser checks. Human acceptance remains open for the new presentation and naturally occurring multiple-PDF cases. See COMPANY_PLAYTEST_RESULTS.md for evidence and limitations.
