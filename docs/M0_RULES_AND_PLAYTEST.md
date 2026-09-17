# Company Assault: implemented rules and manual playtest

This is the gameplay authority for `company-v1`, scenario version 1. It describes a validation candidate, not a certified complete digital reproduction of Fields of Fire.

## Reference map

| System | Source | Current implementation |
|---|---|---|
| Map and company force | Basic Training pp. 34-38 | 4x3 terrain cards, four staging cards, two three-squad platoons, HQs, two LMGs, two bazookas, mortar section and two FOs |
| PCs and enemy packages | Basic Training p. 48 | Four A and four B markers; seven packages; three MG and three squad counters; fortification limits |
| Communications | Basic Training p. 50; rules 4.3 | Same-area voice; CO SCR536 requires LOS and cannot work under cover; BN/FO radio nets |
| Sequence | Sequence of Play; rules 3 | All 20 segments shown; irrelevant segments explicitly skipped |
| Commands and actions | Action Menus; rules 4 | HQ activation/initiative, savings, immediate orders, per-impulse attempts |
| Terrain/fire | Rules 5-7; Charts & Tables 1/2 | LOS/elevation, strongest VOF, crossfire, cover, exposure, simultaneous effects |
| Coordinated employment | Advanced Operations pp. 3-16 | Supporting fire, movement, observers, smoke/signals and casualty handling in one mission |
| Enemy activity | Enemy Activity Check Hierarchy | Deliberate defence plus no-leader degraded-unit priorities; no-action retains fire |

The action deck is vendored from https://www.gmtgames.com/fof/FoF_Action_Deck.html. The dataset records source hash, retrieval date and schema. It has 50 action cards plus reshuffle. Tests validate every combat/random field and several printed worked examples; the website has no edition label, so this is not an independent verification of every printed card.

## Scenario and defaults

Daylight; all initial formations Line; ten turns. Success is checked at turn-10 cleanup: every PC must be resolved and no active defender remains. Loss of the assault force ends in defeat; Abort ends immediately. Withdrawal/capture removes units from the active battlefield. Unrestricted training ammunition and fire missions follow the course. HQ random events are omitted by the course itself (Basic Training pp. 38, 40).

Rows from staging toward the enemy:

1. Open Fields, Marsh, Woods, Open Fields.
2. Gully east/west, Orchard, Open Fields on Hill, Gully north/south.
3. Woods on Hill, Orchard, Woods, Woods on Hill.

Initial placement is an authored alternative: first platoon/FO in staging 1, Company HQ/mortar/staff in staging 2, second platoon/FO in staging 3. Each rifle squad has three steps. Four named people per rifle step and two per command/weapon step are a history abstraction, not extra combat mechanics.

Validation additions: First Sergeant; Company HQ has two screening-smoke assets and one each of advance/cease signals; each platoon HQ has one smoke. Advance signal moves eligible units straight from row 1 to row 2. Screening smoke gives +2 against basic fire and blocks outgoing/through LOS. These asset allocations are authored defaults rather than CAC printed setup.

## Commands, movement and combat

Activated HQs use the card's large number (minimum 1); initiative uses the small number (minimum 0). Apply experience, pin, cover, incoming-fire and No Contact modifiers. Staff initiative gives one unmodified command. General initiative uses the unmodified small number and cannot be saved. Six commands maximum per HQ impulse; daylight savings caps are Green 3, Line 6, Veteran 9.

Squads need same-area voice orders; they have no radios. HQ/section CO radios permit LOS orders outside cover. Degraded HQs only order themselves. An unpin order has the voice-communication exception for pinned recipients. Group movement costs two commands; other implemented actions cost one. Repeating the same attempt in one impulse is prohibited, except moving within a card and distinct recovery stages. Company HQ can activate each eligible subordinate once.

Move immediately to an adjacent card, including diagonals, and become exposed (-2 protection) until cleanup. Exposed units cannot move to another card. Successful infiltration avoids exposure. Pinned/fire/litter/paralyzed teams have restricted withdrawal destinations. Cover is an additional persistent feature; terrain protection always applies. Cover searches use the authored card draw/potential values.

Basic fire persists without repeated orders. Ratings: small arms 0, automatic -1, heavy -3, all pinned +2. Use strongest fire, not a sum; crossfire is -1. Pin adds +1 protection. NCM clamps to -4..+6 for the action-card result. MISS removes pin; PIN pins; HIT draws an experience-based C/P/L/F/A result. Casualties cannot rally. Generic cohesion recovers P -> L -> F -> A; named weapon/HQ fire-team sides can recover their original capability. No incoming fire permits automatic unpinning and automatic ordered cohesion recovery.

Grenades/close assault create deferred combat markers, with response attempts and critical hits; they do not instantly remove a defending position. Off-map missions become pending, activate in Fire Mission Update, and expire at the following update. Incoming fire blocks outgoing/through LOS. Capture and retreat precede mutual combat. Casualty steps can be carried back to staging for evacuation.

## Known fidelity limitations / follow-up acceptance work

- Enemy tie-breaking, counter reuse, full weapon-specific breakdown charts, jamming/short fire and the complete range of action-menu options are not exhaustively reproduced. Exhort, runners, radio-net switching and platoon grenade/concentrated-fire orders are not present.
- The enemy LAT hierarchy is a compact implementation; some litter-team casualty-seeking and reconstitution branches remain simplified. The course's ignore-removal/no-action exception is applied.
- Named-person casualty history is step-based; it does not distinguish wounds from deaths. Full transport/equipment handling is deferred.
- The current geometry handles this map's straight eight-direction LOS and single hills, not arbitrary multi-level terrain. More LOS/PDF edge fixtures are needed before claiming full reference fidelity.
- Vehicles, air assault, campaign persistence/replacement, night/weather and detailed ammunition remain out of scope.

These limitations must remain visible. Do not label this milestone accepted solely because the build and component tests pass.

## Reproduce and manually assess

Run `npm run dev`, `npm test`, `npm run build`, and `npm run playtest`. The last command runs three public-view policies for seeds `company-1` and `company-2`, verifies exact replay and writes reports to `output/company-playtests/`. These are automated comparisons, not substitutes for human tactical play.

For each seed, manually restart the same mission three times:

1. Direct advance: activate both platoons, advance quickly and spend remaining commands on spotting/close assault.
2. Support and maneuver: detach a scout, establish an LMG position, spot the source, move a separate squad while support continues; use observers once targets are spotted.
3. Recovery first: unpin/recover threatened formations, use cover or smoke and restore communications before advancing.

Resolve every segment and inspect its report. Record issuer, recipient, action, target, card IDs, casualties, contact progress and outcome. Export the replay and AAR. Compare the consequences, not just the final win/loss.

Checks to explain without diagnostics: who fires at whom; why exposed movement is risky; why an order cannot reach a unit; what the last command accomplished. At the end inspect hidden-source reports, named losses, saved commands, objective outcome and the order history. See [current validation results](COMPANY_PLAYTEST_RESULTS.md).
