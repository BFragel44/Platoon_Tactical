# Company Assault: implemented rules and manual playtest

This is the gameplay authority for `company-v1`, rules revision 6, scenario version 3. It describes a validation candidate, not a certified complete digital reproduction of Fields of Fire.

## Revision 6: fire paths and continuing fire

Rules §§6.1.1–6.1.2, page 40 examples, §§6.3.3–6.3.4 and 8.6.4 govern this correction. New basic fire cannot open through intervening friendly occupants. Once established, the direction persists: later intervening occupants can receive friendly fire; a target moving farther along that direction moves the VOF without rotating the PDF. The last spotted opponent leaving point-blank combat can be followed to an eligible adjacent card. Smoke or Incoming on the firing card retains eligible point-blank fire and removes its outward PDF. Enemy stale-fire checks apply collectively before activity and during cleanup.

Friendly fire does not automatically cease when opposing units leave or are eliminated. Cease/Shift Fire, movement and changes in eligibility control it. Cease Fire can immediately reopen on an eligible target. Order feedback explains this; movement previews warn when the selected destination already has friendly VOF. Final mission fire markers represent historical positions only.

Marker art is resolved through the public manifest; unavailable artwork (including Pending -5 and Incoming -5) uses labelled vector badges. Rules revision 6 rejects older strict saves/replays; scenario stays at version 3. Weighted combat probabilities and scenario composition are unchanged. Full grazing/overhead-fire tables remain outside the certified subset.

## Revision 5: trustworthy orders and visible consequences

The September 21 notes and AAR are the latest human baseline: 49 combat resolutions, 18 HIT effects, turn-10 defeat and one unresolved contact. The recorded turn-8 sequence was Deploy named Fire Team, Move, then Recover; it was not HQ reconstitution. A selected order now remains selected when unavailable, with a disabled submit button and reason. Commands show issuer, recipient, action, target and cost before submission.

- Rules §§4.2.3f/j and 6.5.1: named HQ Fire Teams lose command-side capability and can restore it by recovery; recovery without VOF is automatic. The UI distinguishes deploying a Fire Team, restoring the command side and reconstituting an eliminated HQ.
- Rules §§4.2.1d/e and 6.5.2: only HQs, not staff, may be reconstituted. Platoon HQ donors are good-order steps of that platoon or company staff. Company HQ requires company staff to issue the order in this scenario, with surviving platoon HQs before Artillery Observer before staff; a higher-ranked named Fire Team must recover first. This scenario has no XO. A squad donor left with one step becomes a generic Fire Team (the implemented default).
- Rule §5.1.6: pickup requires the casualty and carrier to share a card area, including cover. Recoverable casualty markers show origin, carrier and evacuation separately from historical losses. Carrying follows the carrier's location and cover.
- Rule §7.3.2: eligible H-rated mortar sections automatically use direct lay. PDF inspection lists actual sources and their mode; it does not imply all occupants contribute. Indirect lay remains distinct and adds no PDF.
- Contact presentation previews one triggering card, resolves it once, highlights reported source/affected cards, then requires Continue before previewing another. These extra preview/review steps are presentation-only and saved locally.
- HIT and the stored hit effect now appear together after Resolve. Unknown German artwork is unflipped. Support effects use a labelled neutral panel until user-supplied art is available.
- Persistent silhouettes mark only observed final casualty-step losses. They say Historical loss — no tactical effect. Splits, reconstitution, capture and withdrawal create no silhouettes. Hidden losses stay hidden; casualty markers are independently transported or evacuated.

Rules revision 5 is required by corrected command legality; scenario version remains 3. Earlier saves remain exportable but cannot be strictly resumed. This deliberately does not migrate historical missions. AAR exports identify themselves as reports and include seed and rules/scenario versions; they are not executable replays.

## Revision 4 combat resolution foundation

During 3.7.4 every affected formation is frozen in stable ID order with its incoming fire, strongest VOF, terrain/cover, exposure and ordered NCM modifiers. Preparation consumes no randomness. The player resolves one visible receiving formation at a time; MISS/PIN/HIT uses one seeded weighted roll and HIT alone uses a second weighted roll for the formation's experience-based hit effect. Earlier results cannot change later frozen stakes, and fire relationships persist until cleanup.

The immutable weights are derived at startup from all 50 vendored Action Cards, rather than copied into another table. Each NCM from -4 through +6 and each Green/Line/Veteran hit-effect row therefore totals 50. Representative checks are NCM -4 = 1 MISS / 9 PIN / 40 HIT and NCM +6 = 39 MISS / 10 PIN / 1 HIT. These are independent weighted rolls: combat no longer draws or discards physical Action Cards. The deck remains in use for commands, contacts and other attempts.

The combat screen labels these odds **Incoming Fire Result**, shows the conditional hit-effect stakes before resolution, and reveals the stored HIT effect and consequences together with HIT. Presentation never consumes RNG. Unspotted sources disclose only their firing location and VOF. Placeholder combat art is versioned under `public/assets/images`; audio, animation and final art remain deferred.

## Reference map

| System | Source | Current implementation |
|---|---|---|
| Map and company force | Basic Training pp. 34-38 | 4x3 terrain cards, four staging cards, two three-squad platoons, HQs, two LMGs, two bazookas, mortar section and two FOs |
| PCs and enemy packages | Basic Training p. 48 | Four A and four B markers; seven packages; three MG and three squad counters; fortification limits |
| Communications | Basic Training p. 50; rules 4.3 | Same-area voice; CO SCR536 requires uncovered LOS links through Company HQ; BN activation and FO fire-direction nets are separate |
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

Squads need same-area voice orders; they have no radios. HQ/section CO radios permit orders only when both ends have an uncovered LOS connection to Company HQ. FO radios reach their off-map firing agency, not command HQs; FOs need local voice orders or general initiative. Company HQ requests course fire support through its BN radio. Named Fire Team-side HQs only order themselves. Pinned command-side HQs can still activate over working radios; pinning blocks ordinary voice communication. Each HQ keeps its own reserve and expenditure limit. An unpin order has the voice-communication exception for pinned recipients. Group movement costs two commands; other implemented actions cost one. Repeating the same attempt in one impulse is prohibited, except moving within a card and distinct recovery stages. Company HQ can activate each eligible subordinate once.

Move immediately to an adjacent card, including diagonals, and become exposed (-2 protection) until cleanup. Exposed units cannot move to another card. Successful infiltration avoids exposure; a failed attempt becomes ordinary exposed movement. Infiltration eligibility uses the current counter side, pin/exposure, tripod or H VOF, VOF location and LAT limits. The same checks govern platoon and within-card attempts. Pinned units may withdraw only to staging or a friendly-occupied card without VOF and must first drop carried assets and casualties. Movement between qualifying trenches, bunkers or pillboxes avoids exposure. Cover is an additional persistent feature; terrain protection always applies. Cover searches use the authored card draw/potential values. Successful Seek Cover also marks exposure; the cover bonus and exposure penalty both apply. Terrain stacking is limited to 16 steps per side; staging is exempt.

Staging is an off-map holding area. Units may move between its cards without exposure, but only once per command impulse. It permits no firing, spotting or terrain-cover actions. Communication LOS connects all main staging cards and adjacent row-1 cards as specified by rule 2.5; combat and spotting LOS remain unavailable there.

Command-side HQ/staff and observer-side FOs have no basic VOF. Deploy named Fire Team flips an eligible one-step named unit to its reverse side; ordered recovery restores the original capability. Fire Team sides use small arms at Close range; generic Assault Teams use Point Blank range. Basic fire persists without repeated orders. Ratings: small arms 0, automatic -1, heavy -3, all pinned +2. Use strongest fire, not a sum; crossfire is -1. Pin adds +1 protection. NCM clamps to -4..+6 for the action-card result. MISS removes pin; PIN pins; HIT draws an experience-based C/P/L/F/A result. Casualties cannot rally. Generic cohesion recovers P -> L -> F -> A; named weapon/HQ fire-team sides can recover their original capability. No incoming fire permits automatic unpinning and automatic ordered cohesion recovery.

Grenades/close assault create deferred combat markers, with response attempts and critical hits; they do not instantly remove a defending position. On-map indirect mortar fire requires an eligible issuing HQ with target LOS, communication and mortar range; mortar LOS is unnecessary. It has no PDF, adds no crossfire, and expires at cleanup. Mortars cannot fire exposed, from woods/prohibited cover or at Point Blank range. Off-map missions become pending, activate in Fire Mission Update, and expire at the following update. Incoming fire blocks outgoing/through LOS. Capture and retreat precede mutual combat. Casualty steps can be carried back to staging for evacuation.

## Rules and tactical clarity revision

- Spotting requires a current unspotted position in LOS from the map. Invalid attempts consume no command or cards. One successful attempt reveals the whole enemy card (rules 8.5). Select the easiest occupant to spot; historical firing reports remain history, not active spotting targets.
- Entering formations join an established PDF when capable. Intervening visible occupants or smoke bring its effects back toward the source; unspotted enemies do not obstruct ordinary fire. Mortars can fire over their own troops. Removed sources stop; friendly fire can persist at an empty or captured position (6.1–6.3).
- A formation does not automatically open fire into a card containing both friendly and enemy units. Existing fire remains an order and may persist into a position after its target is removed until shifted or ceased (6.1.1).
- Crossfire requires different directions, not merely different source cards. Indirect lay contributes no PDF (6.2.4, 7.3.2).
- Each enemy receives at most one activity check per segment, even after changing cards. Radio destruction checks occur for casualty loss, not merely cohesion breakdown.
- Good-order G-rated teams can respond to Point Blank grenade attacks. Named Fire Team sides lose their original ranged weapon capability; ranged grenade orders follow their card's existing PDF. Concentrated fire picks a random out-of-cover target and expires when its source loses the relevant fire relationship.
- Known omissions below remain omissions, not claimed implementations of the full action menu.

### Interface and replay contract

The compact sticky command ribbon identifies the current and next segment. The Mission drawer contains briefing, sequence, recovery and exports. The command display shows each HQ reserve and communication state. Formation panels explain communication and attempts this impulse. Unavailable orders are disabled with reasons; every formation remains inspectable. Selection can be cleared to show all terrain.

Supplied countersheet crops mark VOF, crossfire, grenade, concentrated-fire and support effects on affected cards. Small labelled edge badges show friendly, spotted-enemy or unidentified PDFs; same-card fire has no outward PDF. Labelled vector PIN and EXPOSED badges are formation status, and the All Pinned +2 counter is used only as a VOF. Marker inspection explains sources, direction, affected visible occupants and modifiers without identifying hidden attackers. Cover does not remove exposure.

Potential contacts resolve one occupied card per progression operation. Each result is reviewed while still in 3.7.2, and activity is refreshed before evaluating the next card. Mutual combat freezes all exposures on entry to 3.7.4, then resolves each receiving formation explicitly while remaining in that segment; Continue to cleanup explicitly enters 3.8. Spotted enemy pins, steps and resulting formations update immediately, while fire relationships remain frozen until cleanup. Playback reads the visible prepared/resolved event records. Reveal, Next Combat, Close and Reopen never mutate simulation state or draw cards. Mission outcomes have a prominent banner and replay/AAR exports.

Every accepted command, HQ choice and segment operation is autosaved as a strict replay, with presentation progress and a separate start-of-turn checkpoint. Reload offers Resume latest, Restore turn start and Start new mission. Writes replace the local bundle atomically; failed writes leave the prior save intact. Corrupt or incompatible saves remain exportable and are never silently migrated.

Exports include `rules_version: 3` and scenario `version: 3`. Strict replay rejects older versions and any rejected operation. Preserve historical exports unchanged. `node scripts/compareCompanyReplay.js` generates an explicitly diagnostic comparison under `output/company-playtests/historical-comparison.json`; subsequent operations can diverge after an earlier rule change. It is not a replacement human playthrough.

### Source-to-fix checklist

| Source | Implemented correction / verification |
|---|---|
| Rules 1.2.3; 4.2.3f/j | Command/observer and named Fire Team sides; loss/recovery tests |
| Basic Training p.50; rules 4.1–4.3 | Course radios, hub, separate reserves, pinned activation, communication tests |
| Rules 4.2.2e; 5.1.5 | Cover plus exposure; per-side stacking |
| Rules 2.5; 4.2.2; 4.2.5; 5.1 | Staging communication, no staging cover, restricted withdrawal/drop, infiltration and fortification exposure |
| Rules 6.1–6.3; 8.5 | Persistent PDF, intervening units/smoke, card-wide spotting and stale-target rejection |
| Rules 7.3; 7.10–7.11 | Indirect timing/restrictions, grenade response, concentrated-fire targets |
| Sequence 3.4.2; 3.7.4 | One enemy activity per segment; simultaneous combat and read-only playback |

## Known fidelity limitations / follow-up acceptance work

- Enemy tie-breaking, counter reuse, full weapon-specific breakdown charts, jamming/short fire and the complete range of action-menu options are not exhaustively reproduced. Exhort, runners, radio-net switching and platoon grenade/concentrated-fire orders are not present.
- The enemy LAT hierarchy is a compact implementation; some litter-team casualty-seeking and reconstitution branches remain simplified. The course's ignore-removal/no-action exception is applied.
- Named-person casualty history is step-based; it does not distinguish wounds from deaths. Full transport/equipment handling is deferred.
- The current geometry handles this map's straight eight-direction LOS and single hills, not arbitrary multi-level terrain. Regression fixtures cover this revision’s PDF cases; arbitrary terrain, full grazing/overhead-fire weapon charts and every reference edge case are not certified.
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

## Acceptance status

Rules and interface corrections are implemented and regression-tested. See [validation record](COMPANY_PLAYTEST_RESULTS.md) for exact results. The original user run is preserved as a historical rules-revision-1 baseline, not evidence that revision 5 is accepted. Six corrected scripted policies and a browser walkthrough do not replace the requested human comparisons. Human comprehension, full direct/support/recovery runs and final tactical acceptance remain open. Do not tune difficulty or expand campaign scope to hide that distinction.
