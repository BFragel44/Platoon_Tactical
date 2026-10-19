# Company Assault: implemented rules and manual playtest

Normandy 1 standalone is accepted and normally selectable. Normandy 2 standalone Cerisy is accepted October 6, 2026 and normally selectable at rules 26/content 1; see [Cerisy readiness](CERISY_READINESS.md) for its authored rules, source checklist, validation and human-acceptance gate. Company Assault, KUTF and the restored right-panel layout remain preserved. Connected campaigns and vehicles remain deferred.

## Current authority — standalone accepted, rules 14 / KUTF 12

Normandy 3 has a source-checked content and patrol/visibility foundation; see [St. Georges readiness](ST_GEORGES_READINESS.md). Its initial setup, patrol progress and night engine are integrated at rules 27 (October 7); HQ events, three-patrol preparation and printed illumination delivery are integrated and fixture-tested; setup/preparation UI is connected. Three successful patrols, mixed success/failure runs, exact replay, recovery and terminal debrief pass; the final suite has 810 passing tests. An explicit `?stGeorgesDev=1` development candidate is available. User acceptance received October 7; St. Georges is enabled in normal standalone selection. Earlier interrupted agent browser illumination-order/reload checks remain recorded as incomplete rather than retrospectively passed. The accepted selected-unit panel layout is preserved. Historical rules-26 Cerisy records retain strict rejection and original export access.

The user has accepted the standalone play experience through repeated playthroughs and reports that it is fun. See [current KUTF status](KEEP_UP_THE_FIRE_STATUS.md) for the completed checklist and retained adaptations, and [Normandy readiness](NORMANDY_READINESS.md) for the actual next gates. Further general KUTF human acceptance is not a prerequisite for starting campaign engineering. Concrete new bugs remain actionable.

The development-version sections below are historical records. Statements that KUTF is incomplete/gated, or that later-implemented terrain/transport/activity features remain absent, are superseded by the current status. This does not imply full action-menu fidelity or Normandy availability.

## Revision 14 — terrain and occupied cover

See [terrain/cover audit](TERRAIN_COVER_AUDIT.md) for the §§5.2–5.4 review, two printed terrain corrections, targeted-fire border protection and enclosed-cover mortar restrictions. Matching C1/C2 markers link units, cover positions and order targets. KUTF content is now 12; Company Assault remains 4. Historical executable records require their original revision.

## Battlefield view controls

The map now has independent scrolling, anchored Reset LOS / zoom / Find unit controls, saved camera position and inline formation inventory. Reset LOS changes inspection only. Recap and Review combat read recorded results without drawing or resolving again. See [UI overhaul validation](UI_OVERHAUL_VALIDATION.md) for scope and checks. Rules and mission content versions are unchanged.

## KUTF Notes 4 — marker and order presentation

Minefields remain in play (§§7.9.1, 8.7.1); cleanup resets the triggered marker to **MINES · Draw 3**, not removal. Entering/moving within checks mines; leaving does not. Triggered units still receive their normal −4 effects and movement restriction. Labelled vector markers replace incorrect Concentrated Fire artwork.

Observed Incoming fire stays displayed on the original target after occupants leave and expires at the next Fire Mission Update (§3.7.1, §7.16.3). The disappearance reported in Notes 4 was projection-only; support timing is unchanged.

Discovered cover has descriptive target names, protection, capacity where authored, and building/upper-story relationships. With a legal platoon movement/infiltration destination selected, green upward indicators show the formations eligible for that order (§4.2.2b/d). No arrow is shown for blocked orders or excluded formations. Previewing consumes no commands/cards. Rules revision remains 13 and mission versions remain 11/4.

## Revision 13 — spotting, command clarity and PDF selection

Rules sources: third-edition rulebook §§4.1.2–4.1.4 (pp.19–20), §6.3.5 (p.44), §8.1 (p.61), §8.2.4 (p.62), §8.5 (p.65). Notes source: `reference/playtest_replays/Platoon Tactical - Testing Notes KUTF 3.pdf`.

- Pending fire missions prevent No Contact, without exerting active VOF, preventing recovery or generating combat rolls merely by being pending.
- KUTF mortar spotters receive the Sniper/FO −1 spotting modifier.
- Joining units consider every eligible established PDF and use normal card priorities; they do not create another PDF while an existing one is usable. Existing established fire remains persistent.
- Daylight command pool and spendable commands are distinct: expenditure is capped at six per impulse; saved reserves cap at Green 3 / Line 6 / Veteran 9. These limits are unchanged, now shown explicitly.
- Spotting opens a Cancel/Confirm preview using only projected information. Known spotter/terrain modifiers are shown; possible concealed target adjustments are explained without revealing their values or final draw count. Confirm invokes the existing validated command once; Cancel/Escape has no simulation effect. Reload closes an unconfirmed preview; no command was accepted. Confirmed outcomes remain in Last order/history and autosave normally.
- Contact labels distinguish current, eligible queued and unoccupied cards. Ordering is the general rule, not a KUTF exception.
- Combat source strength, experience and distance are frozen at preparation for known sources only. HIT and formation consequences use one compact result band. Visible PDF contributor/destination labels accompany card-edge arrows; unknown contributors remain anonymous.

Rules revision 13; KUTF content 11 and Company Assault content 4 unchanged. Older executable saves/replays are rejected without migration and remain exportable. No probability or balance changes. Human acceptance remains open.

## Revision 12 — KUTF readiness corrections

Ordinary KUTF defenders leaving contact replace themselves with their original PC letter (§8.6.2); the course exception remains course-only. Litter Teams seek/evacuate casualties before recovery. Deliberate-defense ammunition and fire-comparison rows are corrected, with legal weighted outcomes and fallback movement/LOS/protection priorities. Enemy LAT movement waives friendly occupation, not movement/fire restrictions.

Enemy casualties on empty cards can be captured when no enemy or unresolved PC remains (§8.15.1); earlier contrary descriptions are superseded. Guard steps retain origin/experience records. In the capture header, choose the Fire/Assault side for qualifying friendly squad remainders; this segment-wide preference is recorded for replay. Bunker/pillbox occupants do not make free point-blank grenade responses from inside cover; activity attacks require leaving it exposed (§5.3.2). Removed/captured formations release carried loads as appropriate.

Rules revision 12; mission content versions unchanged. The [readiness audit](KUTF_READINESS_AUDIT.md) distinguishes completed corrections from remaining human/visual acceptance and deferred campaign systems.


## Revision 11 — tracker audit corrections

Activity retains Contact while any VOF/PDF or unactivated mine remains. Automatic pinned recovery requires no VOF on the card, including unactivated mines; enemy activity “under fire” separately excludes inactive mines. Each attack is compared after applicable smoke, burst and crowding, before selecting the strongest; crowding applies only to grenade/Incoming effects in supported systems. Sniper fire receives smoke protection. The NCM explanation separates printed VOF, smoke and burst. Grenade pressure applies the -3 HQ command modifier. Overloaded setup assignments are allowed but prevent movement until unloaded (§5.1.6A).

Rules revision 11, KUTF content 11, Company Assault content 4. Historical executable saves/replays reject strictly. Command arithmetic and Roster are read-only inspection. See [readiness audit](KUTF_READINESS_AUDIT.md) for unresolved KUTF rules gaps; in particular, earlier claims that empty cleared cards cannot yield captured enemy casualties are superseded by §8.15.1. Weighted combat probabilities remain unchanged.


## Current update: KUTF clarity (rules revision 10)

Automatic engagement now ranks eligible terrain cards under §6.1.1: friendly units use distance, strongest existing projected opposing VOF, then a seeded random card tie; ordinary enemies use opposing step count, then a seeded random tie. Existing projected fire is frozen before acquisitions so earlier formation acquisitions cannot alter later priority scores. Sniper priorities and fire eligibility remain in force. Continuing friendly fire is not cancelled when enemies leave (§§6.1.1–6.1.2, 6.3.4); enemy cease-fire boundaries remain separate (§8.6.4).

Combat (§3.7.4) freezes all stakes and resolves descending row, ascending column, then formation ID within the card. Both factions share this order. PDF/VOF remains frozen until cleanup. Queue counts expose only visible formations. Weighted probabilities are unchanged.

Green readiness excludes free unloading. Backpack inspection lists carried equipment/radios/casualties and formation status; unloading uses the existing validated operations. Segment-result dialogs cover higher-HQ events, capture, retreat and pinned recovery. Continue/Escape acknowledges presentation only; history can reopen it. A saved open review restores without rerolling. Contacts resolve on the triggering terrain card, in existing evaluation order, with one result acknowledged before the next.

Rules revision 10 rejects revision-9 executable saves and replays; exports remain intact. KUTF content remains 11, Company Assault 4. Unlimited fortification markers remain the explicit agreed assumption. Browser and human acceptance for this increment remain open.


## Prior standalone validation update — September 25, 2026

Keep Up the Fire content 11 is available for human acceptance. Fortification marker supply is unlimited by user agreement; printed capacities, arcs and enemy unit limits remain enforced. Sniper/spotter placement considers possible upper-story LOS, then validates the actual cover draw before committing the package. See KEEP_UP_THE_FIRE_STATUS.md for launch instructions and open audits.


This is the gameplay authority for `company-v1`, rules revision 9, Company Assault scenario version 4. It describes a validation candidate, not a certified complete digital reproduction of Fields of Fire.

## Revision 9: mission foundation (Keep Up the Fire remains unavailable)

File now offers mission selection and a separate Keep Up the Fire setup preview. The complete mission is **not implemented yet** and cannot be started through the UI or public factory. See [mission status and remaining work](KEEP_UP_THE_FIRE_STATUS.md) for the authoritative implementation checklist. Preview supports the seeded map, three-platoon roster, objectives, attachments and asset allocation without changing the active mission or save. Mission-specific simulation hooks remain developmental behind the availability gate.

Replay exports now include setup choices. Rules revision 9 rejects earlier executable saves/replays; historical exports are preserved. Weighted combat and Company Assault scenario content are unchanged. Normandy remains unavailable. The remainder of this document describes the playable course unless explicitly stated otherwise.

Keep Up the Fire development content version 2 corrects contact direction redraws, enemy-position/PDF exclusions, exhausted contacts, original-counter reuse and maneuvering-package fire timing (mission p.9; rules §§8.3–8.4.3). Its position achievements are evaluated at mission end (§12.1), with separate one-time prisoner and casualty awards (mission p.4). All higher-HQ table entries are checked against mission p.8; selected obligation, outage and surrender branches have behavioral fixtures. These corrections do not certify the full mission: tripod placement exceptions, fortifications, buildings, weapon systems and integrated acceptance remain in the linked checklist.

Keep Up the Fire development content v3 adds occupied upper-story elevation to unit LOS, spotting and support orders without changing printed terrain elevation. Church towers and capacity-limited fortifications reject excess steps. Bunker/pillbox occupants observe normally but fire only along their fixed arc, never point blank; mission enemy Shift Fire activity is redrawn. Tripod fire places the same weapon's VOF on multiple cards along an eligible level/uphill/downhill direction, omits cards fired over, stops at smoke/slope reversal and loses grazing capability with ammunition loss. It does not add weapon strengths together or create crossfire from one source. Sources: rulebook §§5.2.2B, 5.3, 7.2.1–7.2.3; contact exception §8.4.3. Building-cover placement and the other release gaps remain listed in the mission status document.

Keep Up the Fire development content v4 corrects support networks: Company HQ uses BN, Artillery FO uses ARTY, and Mortar FO uses MTR even when requesting the other agency. Support uses published caller draws plus experience and registration; Short takes precedence over a Burst, completes the draw batch, and registers the actual impact card. Enemy mortar spotters share one registration for their package type. Active WP support provides +1 screening against basic fire, expires with the fire mission and retains its separate incoming combat effect. The same-card **Attack with WP grenade** order expends one asset, attempts a normal grenade attack and deploys smoke on success or failure. The printed WP combat value is −4; screening is +1 and never replaces stronger existing HC smoke. Offensive WP shares the ordinary grenade attempt allowance. Source: mission pp.4,7; rules §§4.4.3, 7.16 and 8.10. Full release acceptance remains open.

## Revision 8: explicit squad reconstitution and readable PDF paths


The third-edition Action Menus §4.2.3i permits an attempt using 2–4 unpinned Assault/Fire Teams to restore a previously removed squad counter with the same number of steps. The selected recipient must now be one of those teams. The command records every contributor and the removed squad to restore. All contributors must be one-step teams in the same card area; the chosen counter must have room for their steps. Current Company Assault rifle squad counters have a three-step capacity. A successful attempt consumes only the named teams; a failed attempt consumes the command and draw but changes no formation. The earlier behavior implicitly gathered up to four teams and restored the first eliminated squad, regardless of the player's chosen formation.

Action Menus §4.2.2k makes Cease Fire card-wide once one firing occupant is reached by communication. This was already the simulation behavior; the order is now labelled by card and its result names sources that stopped or automatically reopened fire. It does not require individual cease orders. The All Pinned +2 VOF counter remains on the affected card, with its pinned source explained. Same-card basic fire excludes the firing unit's own side. Selectable PDF traces connect source and affected card through intermediate terrain; they change presentation only and disclose only projected sources.

Revision-7 saves and executable replays remain exportable but fail strict revision-8 loading. The September 23 human replay/AAR remain unchanged as historical evidence. No scenario composition, combat probabilities or balance values changed.

## Revision 7: visible LOS borders (scenario 4)

Terrain panels and simulation now share explicit N/NE/E/SE/S/SW/W/NW borders. N points toward increasing map row. White permits passage through an intervening card only when both entry and exit are white; corners govern diagonals. Dark borders do not prevent adjacent LOS. Hill overlays supersede white terrain borders. Staging has no terrain borders and retains separate communication LOS.

Sources: rules 5.2.1-5.2.3 and 5.4, plus Charts & Tables 1, Spotting Attempt Draw Modifiers. Higher elevation overlooks lower terrain except the stated stepped-slope obstruction (3 -> dark 2 -> 1); same-level intervening dark terrain also blocks. Smoke/active Incoming permits LOS into, but not out of or through, a card. Same-card LOS remains available. The pure explanation trace feeds safe player-facing reasons; it does not disclose hidden support identities.

The receiving border also selects dual-value terrain protection and spotting concealment. Spotting previously always used the higher protection value; it now uses the lower value across white borders. On current gullies (+2/+1), this does not change the spotting chart modifier, but matters for other dual-value terrain. Combat probabilities are unchanged.

The supplied Normandy terrain sheets were visually checked. Source references use one-based sheet row/column: Open Fields 1/1/1; Hill 1/1/2; Woods 1/1/3; east-west Gully 1/1/5; Orchard 1/2/2; Marsh 1/3/6; north-south Gully 1/3/7. Sheets 2 and 3 confirm the repeated border conventions. Only existing mission terrain is implemented. Full terrain artwork, multi-story buildings and urban LOS remain deferred.

Revision-6 / scenario-3 saves remain exportable but cannot strictly resume under revision 7 / scenario 4. No historical replay is migrated or edited.

## Revision 6: fire paths and continuing fire

Rules §§6.1.1–6.1.2, page 40 examples, §§6.3.3–6.3.4 and 8.6.4 govern this correction. New basic fire cannot open through intervening friendly occupants. Once established, the direction persists: later intervening occupants can receive friendly fire; a target moving farther along that direction moves the VOF without rotating the PDF. The last spotted opponent leaving point-blank combat can be followed to an eligible adjacent card. Smoke or Incoming on the firing card retains eligible point-blank fire and removes its outward PDF. Enemy stale-fire checks apply collectively before activity and during cleanup.

Friendly fire does not automatically cease when opposing units leave or are eliminated. Cease/Shift Fire, movement and changes in eligibility control it. Cease Fire can immediately reopen on an eligible target. Order feedback explains this; movement previews warn when the selected destination already has friendly VOF. Final mission fire markers represent historical positions only.

Marker art is resolved through the source manifest; unavailable artwork (including Pending -5 and Incoming -5) uses labelled vector badges. Rules revision 6 rejects older strict saves/replays; scenario stays at version 3. Weighted combat probabilities and scenario composition are unchanged. Full grazing/overhead-fire tables remain outside the certified subset.

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

During 3.7.4 every affected formation is frozen in stable ID order with its incoming fire, strongest VOF, terrain/cover, exposure and ordered NCM modifiers. Preparation consumes no randomness. The player resolves one visible receiving formation at a time: MISS/PIN/HIT uses the next shared Action Card at the bounded NCM, and HIT alone draws another card for the formation's experience-based hit effect. Earlier results cannot change later frozen NCM values; they consume cards in the existing resolution order. Fire relationships persist until cleanup.

New missions now use player-selected visible recipient order (`combat_order: player-choice-v1` in replay records). Map or recipient-strip selection is presentation only; Resolve draws for exactly the selected pending formation. All exposures remain frozen. Unobserved targets resolve automatically, in deterministic order, only after visible resolution is finished; hidden targets/counts never enter the selector. Finish combat and Continue to cleanup are separate actions. Historical records without this discriminator retain their fixed ordering and exact old outcomes. The battlefield-focused combat desk replaces the former duel presentation for new missions.

Reference probabilities are derived from all 50 vendored Action Cards. Representative fresh-deck counts are NCM -4 = 1 MISS / 9 PIN / 40 HIT and NCM +6 = 39 MISS / 10 PIN / 1 HIT. These are reference odds, not remaining-deck odds. Combat, command, contact and other attempts share the finite deck and its existing reshuffle procedure. Hidden enemy draws remain concealed.

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

The historical exports discussed in this section include `rules_version: 3` and scenario `version: 3`. Current candidate rules use version 24. Strict replay rejects older versions and any rejected operation. Preserve historical exports unchanged. `node scripts/compareCompanyReplay.js` generates an explicitly diagnostic comparison under `output/company-playtests/historical-comparison.json`; subsequent operations can diverge after an earlier rule change. It is not a replacement human playthrough.

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

### Testing Notes 6: rule interpretation and current display

Third-edition §§6.1.1–6.1.2 govern the new explanations. An established PDF/VOF does not cease when an opponent is captured or leaves; Cease/Shift Fire changes it and eligible automatic fire can reopen. Same-card basic fire applies to opposing occupants, never its own side. A cleared point-blank card can display held established fire with **no current opposing recipient**. Movement can change the affected card along a PDF; a Fire Mission Update can remove an Incoming marker and reopen an existing path. The German Litter Team in the submitted run did not project basic VOF.

The normal player view now shows only friendly dropped recoverable equipment and names it in pickup targets; hidden enemy equipment is not projected. Combat review uses the segment's recorded event boundary, and combat remains full-width above the map. Source/path/recipient explanations, HQ counter side and radio status, and pinned-recovery highlights are presentation changes. Rules revision 8 and scenario version 4 remain unchanged. Human validation of these explanations is still required.

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

Keep Up the Fire development content v5 implements one-step mortar temporary PDFs (§§7.3.1–7.3.2). An ordered direct-lay grenade attempt establishes direction even on failure, contributes to crossfire, and adds no basic VOF. It expires in cleanup. Mortar fire may pass over friendly troops; ordinary ranged grenade attacks remain blocked by intervening known units. Mortars cannot fire exposed, from woods/building cover, or point blank, and cannot infiltrate on their weapon side. These additions do not enable the incomplete mission.

Keep Up the Fire development content v6 corrects combat transport (§5.1.6E): equipment, radios and carried casualties pass to the final surviving team when the original counter breaks down. If no step survives, equipment remains on the card for recovery and carried casualties are dropped; the existing radio-damage check still applies on total casualty loss. These changes are limited to the development mission. Full transport-capacity and voluntary-drop support remain unimplemented release requirements. Breakdown regressions cover the mission's Grenadier final-step ratings and named U.S. counter-side changes (§6.4.3; mission p.24).

Keep Up the Fire development content v7 enforces infantry transport capacity (§5.1.6): six assets including radios plus one casualty per step. Overloads prevent movement; recover equipment only from the same card area. The free **Drop all carried items** operation unloads equipment/radios/casualties without command expenditure or exposure; casualty-only unloading is also free. Both work outside command impulses and preserve frozen combat stakes. The UI offers whole-load unloading rather than per-item dropping. These mission-only changes leave Company Assault behavior unchanged. Machine-gun ammunition event depletion/resupply is covered by behavioral fixtures (mission p.8, rulebook §7.18.2).

Content v7 also corrects unengaged sniper target-card priority: HQ/staff/leader cards first (nearest, then seeded random); otherwise strongest projected VOF, most steps, then seeded random (§6.1.1). The individual sniper effect still selects randomly among exposed units first (§7.15), and no special sniper effect is placed while pinned. These priorities do not cancel persistent established fire.

Keep Up the Fire content v8 adds an explicit upper-story seek-cover choice (§5.2.2B), sharing the normal attempt/cost. Successful building discovery enters the upper story immediately; an ordinary-cover result occupies that cover instead. A church tower accepts only one step. Grenade effects now accumulate against each receiving formation before strongest-fire comparison (§7.10.2); mines/snipers remain independent categories. This preserves weighted combat probabilities but changes the NCM when multiple grenade attacks land. Historical development content versions fail strict loading.

Keep Up the Fire content v9 corrects contact placement (§§8.4.3–8.4.4): bunker/pillbox positions may share U.S.-occupied cards if they can fire toward the triggering card; building substitution is followed by firing-legality revalidation. Opening enemy fire removes intervening PCs at its elevation without a contact evaluation. Ordinary off-map placement expansion (§8.4.5) remains missing and blocks standalone release; the published mission does not waive this rule.

Content v10 implements ordinary contact map expansion (§8.4.5), superseding the v9 missing-feature note above. Maximum-distance placement can draw beyond the original 4×4 map, using the remaining seeded terrain deck and resolving hill stacks. Newly drawn cards persist after rejected package attempts and receive no PCs. Friendly units remain inside the original boundaries; enemy fallback retains the original edge. Feasibility checks do not mutate terrain or history. Final placement/visual acceptance is still open.


### Symmetric combat presentation

Actual reciprocal fire may be reviewed in matching German/US panels, with incoming probabilities outside and stored results beneath each receiving formation. Adjacent reciprocal queue items can resolve together through the original ordered operations; unrelated items retain their frozen order. LOS alone never generates a reciprocal roll. Unspotted enemy stakes and outcomes remain hidden. The compact fixed overlay does not move the map or inventory. See UI_OVERHAUL_VALIDATION.md for verification; rules/content versions are unchanged.


### KUTF achievement display

Open Achievements beside the phase heading for the 12 mission-specific tasks, published rates, live points and total (KUTF mission booklet p. 4). Asterisks mark provisional position-based points; these are assessed at mission end and may change before then. The display previews existing scoring without issuing orders, drawing cards, changing RNG or adding events. Final totals match the AAR; rules and content versions are unchanged.

### Normandy development candidate — rules 24 / content 5

Rules 24 fixes the October 4 human-playtest runner order: Company HQ must explicitly choose a donor; it no longer silently donates itself when no target was supplied. The interface shows donor step counts and warns when the final step removes the unit/drops equipment. Created runners wait in the off-map CO HQ box and require separate dispatch (§§4.2.1f, 4.3.2). The supplied turn-five replay prefix is a regression fixture, including rejection without mutation and strict replay after an explicit donor choice. The PDF’s other UI observations are implemented: fixed counter footprints, removal of awaiting-occupation clutter, map-ordered pending contact presentation (printed evaluation remains randomized within each letter), explained signal orders, and a dismissible new-turn objective/US casualty-step briefing preserved through recovery. Browser inspection verified counter dimensions and the turn-two dialog; 61 files / 515 tests and production build pass. User acceptance is still pending.

The standalone Trévières candidate is available with `?normandyDev=1`; normal selection remains disabled. Its separate roster store freezes stable people/steps/formations into deployment snapshots and applies terminal debriefs once at the expected revision, preserving unresolved casualty dispositions. Historical KUTF companies are not converted. Connected progression and vehicles remain deferred.

Normandy uses tracked ammunition and finite artillery, explicit command roles, its own building-cover and enemy activity tables, timed Offensive Assault counterattacks, radios/optional phones, runners and eight assigned signals. Reattempt preparation retains discovered terrain, contacts, mines, spotting and one-time location awards while exposing local reconstitution, promotion, skills, cover, phone-line and phase-line choices. Each attempt has its own immutable starting record; strict replay includes the complete transition. Skills validate printed costs and shared front/back counter inventory, consume once, and still draw for critical hits/jams.

Visually checked Normandy breakdown diagrams correct German A Grenadiers at two steps, the two-step 88mm H profile, and US mortar ammunition/weapon inheritance. Weapon jamming, successful concentration expenditure, depletion/resupply, leader-area modifiers, lone mortar recovery, stable-step transfers and reattempt stacking have focused fixtures. Ordinary Normandy General Initiative can spend a skill-granted command beyond six; HQ/staff impulses retain their cap. Course/KUTF exceptions and ammunition policy remain mission-specific.

Rules 18 adds per-issuer spending limits for HQ-required General Initiative orders, staff rank restrictions, senior/pinned visitor selection, runner recovery and pinned receiving HQ activation, and printed phone-line damage chances including simultaneous threats. A dropped intact phone can extend the network. Reconstitution now requires actual machine-gun capability for an A-rated squad, uses the printed combined-experience chart, and transfers carried items, ammunition and casualty carriers. Reattempt rejects attachment restoration and randomizes scarce enemy cover allocation.

Extra Draw may be assigned for free to a unit’s next automatic attempt through its order menu. Assignment draws no cards and leaves the marker unused until the attempt; holder loss prevents use, and inspection remains read-only. The assignment and consumption replay normally. Auto Grenade can also be assigned for free to the next eligible grenade return. The supplied forum screenshot confirms owner-only attack/return applicability; payment follows our interpretation that §7.10.5’s free response overrides the ordinary one-command attack cost. Assignment does not consume the marker, unrelated attempts leave it reserved, and the actual return retains card draws and consumes it once. Rules 20 preserves duplicate physical radios, transfers donor cargo resupply records during combat and attempt preparation, and retains a zero-MG ammunition slot through Grenadier breakdown. Reattempt restores named enemy weapon/spotter/leader sides; counter fixtures distinguish broken squads from surviving named LMG Fire Teams. Rules 21 transfers recovered radios/equipment resupply allocations to their new carrier once, preserves self-recovery, and loses ammunition with a final casualty (§5.1.6E). Additional signal fixtures cover pinned carriers, consumed devices and pinned recipients moving into fire. Rules 22 transfers partial recovered-ammunition resupply allocations and provides optional stock-conserving supply transfers in the reattempt preparation dialog. Invalid carriers/quantities, insufficient stock and duplicate spending are rejected; the immutable second-attempt record and strict replay retain the choices. Supplies above carrying capacity may be assigned but block movement until dropped. Rules 23/content 5 completes these source audits: smoke/flare LOS, printed 4/8–2/8–2/8 placement draws, random selection of either strongpoint squad card for its optional HMG, all leaders checked last, and cover selection for protection or usable firing arcs. KUTF keeps its previous placement policy.

Current evidence is 63 files / 533 passing tests (`node node_modules/vitest/vitest.mjs run --pool=threads --maxWorkers=2`) and a passing production build. The rules 22/content 4 `trev-accept-4` victory is historical. At rules 23/content 5, `trev-accept-6` fails attempt one and wins attempt two with both objectives held and required rows cleared, 135 orders and exact deep terminal replay. Seeds 4 and 5 terminate both attempts in defeat and also replay exactly. The scoped source audits and automated checks are complete; explicit-phase user acceptance is the remaining normal-selection gate. At rules 23, six Company Assault policies and KUTF `kut-1` direct policy preserved their previous outcome/order/casualty counts with exact replay. Reproduce Normandy with `node scripts/trevieresAcceptanceRun.js trev-accept-6`. See [the source checklist and release gates](NORMANDY_READINESS.md). User explicit-phase acceptance is still required before ungating.


### October 5 command visibility and event clarity — rules 25

The right panel has been restored to its previous layout at the user’s request, removing the `Notes_2` status card and clickable hierarchy. Existing orders and inventory controls remain. A default-off Command links checkbox displays the full friendly company with labelled, color-coded voice, radio, both, field-phone and unavailable links. Same-card links are aggregated; selection emphasizes its branch. The preference persists through tactical recovery. Channel enumeration preserves the existing single-channel execution priority and KUTF mission communication policy.

Trévières special rules and all higher-HQ event procedures are explained in the Mission menu and recaps without revealing hidden affected enemy units. Counterattack PCs have concealed question sides; all letters flip on entering contact evaluation. The p.19/§8.2 audit corrects remaining marker stock (16 A/B/C each, less unresolved markers) and overlap removal: reveal colliding markers and retain the highest letter, preferring the newly placed counterattack marker on a tie. Staging remains outside combat (§2.5). Exhaustion creates no extra markers and still changes tactics for the printed duration. A seeded turn-three event through legal operations strictly replays concealment, resolution and terminal abort.

Rules 25 rejects earlier tactical recovery/replay versions explicitly and retains their export access; campaign schema 1 and content version 5 are unchanged. Browser checks before the panel rollback covered hierarchy selection; retained overlay checks cover aggregation and zoom, saved preferences, rules text and narrow layout. The full suite has 63 files / 533 passing tests and production build passes. Six Company Assault runs and KUTF `kut-1` direct retain prior results and exact replay. Normandy `trev-accept-6` and `company-1` both fail their first attempt and win their second (135 and 113 orders respectively), with exact deep terminal replay. User acceptance remains pending; the normal Normandy catalog gate is unchanged.

### October 5 Normandy Mission 1 acceptance

The user completed the explicit-phase playthrough and accepted the mechanics. The supplied `_10_5` replay, AAR and roster pass `node scripts/auditNormandyPlaytest.js`: 486 accepted operations, first-attempt SUCCESS on turn 10, 121 orders and 29 points. Replay/AAR JSON exports and the debrief roster match exactly; repeated terminal replay states match deeply. Both objectives are secured and original Rows 1–2 cleared. Per-operation ammunition/support, contact-stock, deployed-identity and reward invariants pass. Reviewed support expenditure, enemy depletion, HQ reconstitution/radio recovery, resupply, casualty evacuation and scoring revealed no demonstrated lapse. Duplicate debrief is rejected, people retain their identities, and casualties remain unresolved rather than becoming invented wounds/deaths.

Trévières is now `standalone_validated` and available in normal mission selection. Rules 25/content 5/schema 1 remain unchanged; strict historical rejection/export access remains. Earlier pending-acceptance entries are historical. Mission 2, connected progression and vehicles remain deferred.


October 7 Hill 192 development: shared rules 28 adds capability-scoped scouted-battlefield loading, no-staging deployment, PC-A counterattack qualification, TOT and engineer mine-path procedures. See [Hill 192 readiness](HILL_192_READINESS.md) for evidence and remaining gates. Accepted standalone content and storage slots remain intact; historical rules-27/earlier replay is strictly rejected and retains original export access. No playable M4 catalog entry is enabled.

October 7 Hill 192 increment: authored gated content-1 scenario, finite Panzerschreck/PAK40/75mm infantry-gun profiles with distinct infantry fire/ammunition and immobility, conditional engineers in immutable imported-map roster deployment, and no-staging reserve guards during reattempt. 73 files / 871 tests and production build pass; source/UI/full-run/browser release gates remain in [Hill 192 readiness](HILL_192_READINESS.md). No normal mission selection or accepted panel changes.

October 7 Hill 192 setup increment: gated no-staging/forward-defense/reserve controls, read-only battlefield JSON/saved-source selection, independent M4 roster wiring and source recovery backups. Expanded scouted cards now remain outside the printed 5×4 boundary instead of being rejected/cropped. Setup-only browser checks pass; browser file upload is permission-blocked. 74 files / 879 tests pass; no M4 catalog release. See [Hill 192 readiness](HILL_192_READINESS.md).


### Hill 192 historical reader and complete runs (October 7)

Original M3 rules-27/content-1 replays have a read-only battlefield extraction path using the frozen accepted engine; current tactical recovery remains strict. See `docs/HILL_192_READINESS.md` and `scripts/exportHistoricalM3Battlefield.js`. Authored Hill 192 has deterministic fresh success and fresh/imported failure-to-reattempt-to-success evidence, exact replay, checkpoint recovery and isolated roster debrief/redeployment tests. Generic survivors and prisoner guards keep unresolved step dispositions during debrief instead of automatically refilling an original formation. No casualties are resolved or people replaced. Mission selection stays gated pending source/fixture/browser release checks and explicit user acceptance.

October 8 Hill 192 source/browser increment: shared rules 29 / Hill content 2 correct engineer range, starred HQ-event XP and PC-entry eligibility, and retain concentration targets on Hill reattempt. Source audit adds 106 fixtures; full suite 77 files / 994 tests and production build pass. Actual browser combat, reattempt, support-choice, terminal recovery and duplicate-debrief checks pass; stale reattempt cover selection is fixed. Screenshot capture and native file upload remain tooling-blocked, so Hill release/acceptance stays gated. See [Hill 192 readiness](HILL_192_READINESS.md).

October 8: user accepted Hill 192 with no issues found. Hill 192 is now available in normal mission selection as an accepted standalone mission; content 2 / rules 29 are unchanged. Connected progression and Mission 5 remain deferred.

October 8 Mission 5 foundation: gated St. Germain content 1 authors six columns, three night patrols, exact package/HQ/support tables and required two-step Deep Bunker squad/leader. It remains absent from mission selection; storage/start and complete patrol validation are pending. Shared rules stay 29. 78 files / 1,036 tests and production build pass. See [St. Germain readiness](ST_GERMAIN_READINESS.md).

October 9 Mission 5 execution validation: shared rules 30 corrects accompanying enemy formations to reuse their squad's actual placed cover when a building replaces Foxholes. St. Germain remains content 1 and gated pending remaining counter/procedure audits, optional full-run variants and explicit-phase acceptance. Added 128 execution fixtures and three authentic saved-run fixtures; all-success and mixed-result three-patrol runs replay/recover exactly. M5 roster/debrief persistence has its own slot and export name, atomic write-failure/duplicate/stale rejection and stable redeployment identities. Actual isolated browser checks cover six-column setup, COP/MLR/routes, observers/support, battalion pending choice/reload, combat, next-patrol preparation, narrow/desktop visuals and terminal duplicate rejection. The right panel and accepted storage are retained. Full suite: 84 files / 1,167 tests; production build and twelve Company Assault/KUTF scripted runs pass. Current Hill 192 rules-30 replay fixtures are separate from preserved historical outputs; strict historical tactical rejection/export and frozen M3 reader remain. See [St. Germain readiness](ST_GERMAIN_READINESS.md) for source-to-fixture links, evidence and remaining gates.

October 9 Mission 5 development release: content 2 / rules 31 completes the visual counter/procedure audit, correcting M5 A/S Fire Team sides for FJ squads 5–6 and German mortar teams, and +5 Bunker/Deep Bunker protection. Accepted scenarios retain their existing authored values. Added 112 source fixtures and real fixed-defender/reconstitution/skill variants; five three-patrol runs replay and reload exactly. Full suite passes 85 files / 1,280 tests, with three further opt-in gate fixtures passing; build and twelve Company Assault/KUTF scripts pass. Current M4 runs were regenerated in a separate rules-31 folder; historical tactical rejection/export and frozen M3 reader remain. The production `?stGermainDev=1` entry point works in actual browser checks. Normal M5 selection requires explicit-phase user acceptance. See [St. Germain readiness](ST_GERMAIN_READINESS.md) for detailed source mapping and evidence.

October 9 core Detach Team: §4.2.3g (third edition p.24) now offers both **Detach assault team** (`DETACH`, retained API) and **Detach fire team** (`DETACH_FIRE_TEAM`) in every mission. Both require an unpinned Good Order 3–4-step squad or two-step weapons team, cost one command, draw no cards and preserve the detached step's identity and position. Two-step squads cannot detach. General Initiative requires an eligible communicating HQ/staff and applies its originator spending limit. Both options share one per-impulse detachment allowance. Existing named Fire Team deployment remains a separate action. Shared rules advance to **32**, retaining strict older-record rejection and original export access; the frozen M3 rules-27 reader is untouched. Fourteen focused tests cover all seven missions, weapons-team eligibility, rejection/expenditure and exact replay. New M4/M5 validation outputs are separate in `output/hill192-playtests-v2-r32/` and `output/st-germain-playtests-v2-r32/`.

## October 9, 2026 — shared command menu audit (rules 33)

See [COMMAND_MENU_AUDIT.md](COMMAND_MENU_AUDIT.md) for the source-to-action checklist covering third-edition pp.22–25 and the applicable Normandy commands. Adds Supplement Squad, optional conditional Exhort, platoon combat orders, conversions, network/CCP/equipment choices and off-map BN restoration. Existing Company Assault and KUTF policies and historical records retain their compatibility boundaries. No vehicles, demolition/flame equipment or connected campaign progression is implied.


### October 9: targeted-fire presentation and M5 acceptance

Grenade and concentrated-fire marker captions identify visible attacker → target (or known cover stack); hidden identities remain concealed. Grenade misses are labelled as card-wide penalties. Full enemy names remain inspectable while Fallschirmjäger counter faces use numbered FJ abbreviations. The contact-phase ribbon no longer changes battlefield height. These are presentation changes under rules 33; immutable historical records and strict compatibility checks are preserved. M5 is accepted and available in normal mission selection. Its non-patrol movement prohibition and Route 1→4 sequence remain as published (Normandy pp.34–35).

### October 10 experimental Vire phase bridge

Vehicle adapter 11 can opt into normal explicit phase stepping, vehicle-HQ activation/initiative and one shared infantry/rider Combat Effects snapshot. Core and vehicle transitions share its strict replay/export log; its storage remains isolated. Accepted rules-33 missions have no vehicle runtime and preserve their existing phase/replay behavior. This is not a playable M6 release; remaining scope and evidence are maintained in `VIRE_READINESS.md`.


### October 10 gated Vire setup preview

Vire has a materializable fresh twenty-card map plus staging, its own objectives, Delay Defense baseline, published infantry attachments and enemy equipment overrides. A read-only preview validates initial Sherman placements and authors the M5 event force separately; crew-step identities and command assignments are explicit. Optional artillery Jeep radio mounting, live AT/package linkage, vehicle roster persistence and reattempts remain pending. No M6 catalog entry or right-panel change is enabled; live creation still rejects the gated definition. See `VIRE_READINESS.md` for source review and validation evidence.

### October 10 live Vire development integration

The explicit `?vireDev=1` opt-in now starts/restores a fresh standalone Vire mission under adapter 12, content 1 and base rules 33. Live AT packages share actual carrier ammunition, tank-only finishing-card contacts can resolve, Tank Support has five replayable Row-1 choices and finite M5 stock, and separate vehicle recovery/roster slots preserve named crew identities. One vehicle-aware reattempt retains the battlefield and vehicle losses, replenishes surviving resources and restores Delay Defense. Exact mixed replay covers both immutable attempt records; terminal debrief rejects repeated/stale application. Accepted missions and the right panel retain their existing behavior. Normal M6 selection remains gated. See `VIRE_READINESS.md` for controlled-run/browser evidence and the remaining combat, source-audit and presentation gates.


### October 10 Vire adapter 13

The gated Vire development setup now supports infantry choices, objectives and Sherman staging, with visible known-tank counters and a styled vehicle controls dialog. Command-phase rally/Cease Fire/Shift Fire, pinned tank activation, automatic pin recovery and discovered-cover dismounts are replayable. Delay Defense recognizes tank-only LOS. Base rules remain 33, content 1; older experimental adapter exports remain available but cannot resume under adapter 13. The complete evidence and outstanding Jeep, source, transport and acceptance gates are recorded in `VIRE_READINESS.md`. Normal M6 selection remains disabled.

### October 10 Vire adapter 14 playtest candidate

Optional company Jeep deployment, ordinary passengers and fixed ARTY-radio mounting now execute and replay, with real mounted-radio support eligibility and automatic observer-aboard activation. Vehicle mines, sniper targeting into the next vehicle phase, smoke, wreck cover and Jeep passenger outcomes have source-focused fixtures. Reaction fire that removes a moving tank closes its action; enemy displacement/evacuation recognizes actual US vehicle occupation. Named crew, isolated saves, finite M5 entry and both immutable attempts remain protected. Shared rules 33 and Vire content 1 are unchanged; older adapter records remain exportable and are strictly rejected for execution. The right-panel layout and accepted missions are preserved. Normal M6 selection remains gated for explicit-phase user acceptance. Final source/fixture/browser evidence and the disclosed package-1 HMG ammo inference are in `VIRE_READINESS.md`. M7 source planning is in `TINCHEBRAY_READINESS.md`.

### October 10 Tinchebray playtest candidate

Standalone M7 is available through `?tinchebrayDev=1`: a fresh company, four M10 tank destroyers, finite event M5 support, six-row map, separate objective rows, Green enemies, eleven published packages and two reattempts. Tinchebray replay envelope 3/content 1 uses shared rules 33 and common vehicle runtime 14; M6's adapter-14 format is preserved. Earlier incomplete M7 envelopes are rejected with original export access. M7 AT synchronization, vehicle-only contact/terrain discovery and nested squad-plus-leader placement now execute correctly. Independent tactical/roster storage, cumulative local XP spending, three immutable attempt records and terminal debrief protection are verified.

The full regression suite passed 114 files / 1,694 tests. Deterministic combat-bearing successful and three-attempt runs replay exactly; isolated Chrome checks cover setup, mounted Jeep, M5 entry, both reattempts, M10 movement/reactions, pending support, observers, reload and narrow layout. Six Company Assault and six KUTF scripted runs replay exactly; production build passes with the existing bundle-size advisory. Complete-run fixtures use authored deterministic battle setups, not exhaustive random-fight coverage. `docs/TINCHEBRAY_READINESS.md` records source and test evidence. Normal M6/M7 selection remains gated for the user's explicit-phase acceptance; connected campaign progression remains deferred.

### Final Normandy standalone playtest acceptance — October 11, 2026

The user accepted M6 Vire and subsequently M7 Tinchebray, reporting no issues in the M7 playtest. Standalone player acceptance is now recorded for all seven Normandy missions. M6/M7 retain their development entry URLs while normal vehicle mission catalog/recovery integration remains separate. Current vehicle runtime is 15 and M7 envelope 4; base rules remain 33. Connected campaign progression is deferred. Broader vehicle usability/presentation work is recorded in `docs/FOR_LATER.md` for the next phase; acceptance does not preclude demonstrated gameplay bug fixes.

## October 11 normal vehicle release and company preparation

All seven standalone missions are normally selectable. M6/M7 setup and recovery now dispatch by selected mission, with separate saves and compatible development URLs. File > Campaign company provides a fresh M1 company with separate preparation/tactical storage and no automatic imports. [Company readiness](CAMPAIGN_COMPANY_READINESS.md) records evidence and remaining audits. Connected advancement remains gated.


Campaign company preparation follow-up (2026-10-11): separate preparation schema 3 records parent-organization ownership. Published patrol HMG attachments and supporting crew LATs cannot donate company personnel or receive promotions; support casualties do not generate company Veteran returns. Mortar aliases preserve one active membership per step, and completed-mission skills expire. Focused preparation/roster/historical checks: 34 passing tests; normal M6/M7 and campaign preparation browser checks pass. Connected progression remains gated; destination replenishment and withdrawal handoff audits remain pending.


## October 11, 2026 — prepared campaign deployment (rules 34)

Prepared company skills now deploy through immutable/replayed setup using existing skill validation, physical counter limits and one-use mechanics. Conditional Hill 192 engineers follow validated M3 discovered mines in Rows 2–3. Destination vehicle support uses fresh published initial/event crews, preserves unresolved prior support casualties and resets resources through existing mission factories. Mortar section/team adaptation preserves surviving identities. Patrol guards retain recorded experience and eligibility.

Rules 34 and the vehicle adapter base reject incompatible historical tactical records; raw exports remain available. Original r33 M4/M5 validation records are preserved, with new r34 runs generated by executing their recorded legal orders. Connected progression remains gated pending battlefield/company linkage, remaining personnel handoff audit and human preparation acceptance. Preparation storage stays schema 4.


Validation: 117 regression files / 1,753 tests passed, with 56 passing final focused preparation/roster/historical checks after the final snapshot and guard fixtures. Six Company Assault and six KUTF policies pass exact replay; M4/M5 regenerated rules-34 legal-order runs preserve outcomes and replay exactly. Normal M6/M7 routing and campaign preparation recovery, M6/M7 inline vehicle UI, M5 browser cases and build all pass. Original rules-33 validation files remain unchanged and exportable.


Campaign preparation follow-up (schema 5; tactical rules remain 34): §10.7 surviving company passengers return after mission-end withdrawal or disembarkation, preserving identity/experience without replacement spending. Casualties/prisoners remain unresolved; supporting personnel remain separate. Terminal M3 battlefield storage is bound to the same company for M4, with foreign/modified source rejection and standalone loading unchanged. Destination roster commit precedes launch/debrief and survives reload. Connected UI advancement remains gated.


Campaign-wide preparation audit (October 11, schema 6; tactical rules 34): Normandy M3/M5 MSR 1 retains unused purchased patrol skills into the next mission with counter/holder limits and no repeat cost. Ordinary offensive skills expire. Rebuilt-HQ promotion restrictions follow step identities across further transfers; boxed/dispatched runners and deliberately unassigned survivors remain selectable for reconstitution. Source matrix and focused evidence are in CAMPAIGN_COMPANY_READINESS.md. Connected UI progression and human preparation acceptance remain gated.

## First-player refinement pass — rules 35 (October 11, 2026)

Confirmed Jeep and storage blockers from `CAMPAIGN_FIRST_PLAYER_LOG.md` were addressed. Empty activated Jeeps can hold through the vehicle action sequence with normal VOF and exact replay; lack of a driver is explained. Tactical recovery uses a lossless storage encoding for repeated data, preserving independent slots, historical rules checks and expanded original exports. Replacement write failures preserve latest and previous records.

Setup/command presentation now includes early briefings, starting-force focus, group recipients, visible support-target occupancy, donor consequences, neutral command selection and expanded order results. Empty recaps and zero-command HQ impulses require fewer clicks while explicit phase stepping remains. Campaign preparation clarifies the M1 gate, final experience and skills. See the running log for verification and remaining manual coverage; connected progression remains gated.

First-player presentation follow-up: multi-step company transfers are validated as immutable drafts and saved once; promotion, skill and capacity previews explain availability. Preparation shows step-derived formation experience. Settings can suppress automatic recap dialogs while retaining manual recaps and explicit phases. Mission menu provides command flow and terminology help. These are interface/persistence changes using the existing reducers, with no new combat rules or replay migration.

Support-call presentation now exposes friendly caller profiles, experience/registration draw counts, network requirements and remaining missions. Failed/short requests remain visible for their turn. Battalion choices mark friendly occupancy and reject duplicate cards. General Initiative cannot silently retain an eliminated issuer while displaying another selection. These player-projection/presentation changes do not change simulation or replay rules; 156 support/Cerisy/command/recovery checks and production build passed.

Phase/movement presentation follow-up: pending HQ selection and support choices now have explicit header guidance. Movement/known-cover target restrictions are inspectable; valid movement shows public friendly occupancy and projected stacking using actual group recipients. Existing legality predicates and simulation remain unchanged (rules 35). Focused tests and an isolated Cerisy recovery/activation/group-move browser check passed; see CAMPAIGN_FIRST_PLAYER_LOG.md for coverage limits.

Remaining-gap presentation pass (October 12): transfers preview both participants' exposure; Normandy CO-radio cover entry warns about connectivity; advance-event prose respects final-row boundaries. Formation selection groups active and off-map/historical counters without losing inspection access. Combat uses player-facing probability wording and reattempt decline is explicit. No simulation/replay version changes (rules 35). The running first-player log records validation and unresolved manual/source questions.

October 12 patrol-source follow-up: campaign pp.26-27 and 34-35 confirm routes 1-4 and fixed non-patrol defenders, including below MLR. Third-edition p.23 limits group movement to Good Order recipients; detached LATs require individual movement. Group movement preview now lists excluded friendly formations without changing command predicates. See CAMPAIGN_FIRST_PLAYER_LOG.md for source/fixture evidence.

October 12 contact/recovery presentation: consecutive contact evaluations use one explicit advance per card, removing the extra UI-only acknowledgement while preserving draw/phase order and result history. Friendly command-counter hints explain rally/recovery/reconstitution. Thirty-eight focused checks and build pass; browser/manual follow-up remains in the running log. The user deferred the transient white-page investigation.

October 12 explicit-resolution refinement: empty public capture contexts omit the guard selector. Combat result offers a combined Next/Resolve action only with another visible pending formation; normal operation order, per-operation persistence, inspection option and final-phase acknowledgement remain. Thirty-four focused checks and build pass. Short Cerisy browser coverage and outstanding full manual reviews are detailed in the running log.

October 12 manual follow-up: complete M3 three-patrol UI cycle (all SUCCESS, turns 7/9/8), actual M3 battlefield import into an isolated fresh M4 company, and complete M4 first-attempt DEFEAT → preparation → reattempt SUCCESS at turn 10. Live consecutive contacts and combined combat resolution passed, as did pending battalion-fire recovery, terminal recovery and duplicate debrief rejection. Attempt boundaries now prevent earlier-patrol/attempt recaps, turn summaries and support warnings from reappearing at matching turn numbers. Historical events/exports remain intact; rules remain 35. Eight focused files / 51 tests and build pass. The running log and exported-run audit retain evidence and explicitly distinguish this completed coverage from remaining broader manual M1/M5–M7 reviews and campaign acceptance gates.

October 12 navigation/reference pass: normal startup now opens Home rather than implicitly creating Company Assault. Campaign and standalone Missions have separate launch/recovery access; Briefing holds current mission rules, assigned signals and objective assessments. File retains recovery/restoration/exports/backups. Home/return preserves tactical state and pending choices, including live contact/combat review and battalion selections across reload. Friendly reference fields explain actual signal stock, public attempt-scoped row assessments and final-turn offensive success timing. Optional history filtering preserves live/embarked and direct Roster inspection; reserve/transport labels remain neutral. Rules stay 35 and storage/replay schemas are unchanged. Full regression sweep: 126 files / 1,824 tests pass; final presentation checks: eight files / 40 tests pass. Earlier M3/M4 replay/AAR audits and production build pass. Detailed browser evidence and remaining review boundaries are in `CAMPAIGN_FIRST_PLAYER_LOG.md`; broader deferred milestones remain in `FOR_LATER.md`.


October 12 connected campaign follow-up: preparation review accepted. An explicit campaignDev=1 development opt-in now provides ordered Standard campaign launches through existing prepared-company handoffs, locked same-company M3→M4 terrain, independent campaign tactical recovery and immutable committed-start recovery. Offensive failure/abort ends Standard campaigns; patrol defeat may continue. No Survivor/Hardcore modes or standalone-company imports are offered. Normal launches beyond M1 stay gated pending complete seven-mission connected validation and later-mission browser checks. Rules remain 35. Full regression: 127 files / 1,832 tests pass; focused follow-up: 3 files / 20 tests pass. Historical M3/M4 exact replay/AAR/debrief audits and build pass. See CAMPAIGN_COMPANY_READINESS.md for evidence and remaining gates.


October 12 live-contact friendly-fire correction (rules 36): a live M1 replay demonstrated that colocated LMG/bazooka units joined an HMG PDF without validating their own intervening path. Their new fire intercepted friendly-only 2.4 when an enemy appeared on 3.5. Joining a PDF now requires each source to reach that affected card through its own fireDestination check; HMG overhead fire remains legal. Existing engaged-fire interception and grazing behavior remain. Third-edition p.39 §§6.1.1–6.1.2 visually verified. Original rules-35 replay is preserved in output/friendly-fire-audit; a frozen read-only rules35 engine reproduces the error. Current replay recovery strictly rejects prior rules, and original exports remain available. Current-rules diagnostic replay rejects no orders and produces no new mg2/at2/at3 fire into 2.4. The diagnostic is not a migrated save. Vehicle adapter base rules incremented to 36; compatible battlefield envelopes include rules-36 M3.


October 12 card-pull comparison: explicit cardPullDev=1 Trévières scenario uses the shared finite Action Deck for NCM and the subsequent HIT-effect draw (§6.4.1–6.4.3, p.47). Separate scenario content version 1 and resolver metadata pin replay identity; normal rules36 behavior and exports remain unchanged. Separate company/recovery keys isolate the experiment. Card reveals highlight the actual draw and applied value; hidden enemy cards/results remain hidden. Three legal two-attempt policy runs reproduce exactly (all DEFEAT); six focused files / 53 tests and build pass. Browser setup/start/reload/resume and labelled synthetic two-card reveal checked. Human comparison remains pending; see CARD_PULL_COMPARISON.md.
# Rules 37 contact presentation and spotting correction

Resolved contact placement records the unspotted position even for non-firing packages, without identifying counters. A friendly formation can search its own terrain card with the existing Spot command; availability does not depend on concealed occupancy, and unsuccessful/empty searches still consume commands and draws. Historical rules-36 records retain a frozen audit reader and strict live-recovery rejection. CCP casualty presentation distinguishes required transport/drop-off from pending Cleanup evacuation; §5.1.7 evacuation mechanics are unchanged.
### Public Action Card presentation — October 13, 2026

Rules38 gameplay is unchanged. Draw events additionally record the acting public formation, field read, actual allowance, relevant values and public calculation details. Public outcomes are associated with their action group without adding events, RNG consumption or phase steps. Spotting, support and other public attempts reveal automatically in a compact map overlay; Briefing retains current-turn/current-attempt history. Combat and other actions share their card-face renderer. Hidden procedures and private unidentified-formation modifiers stay concealed. Exhort batches, skill overrides, short rounds and support expenditure use the actual recorded procedure; fixed allowances create no fake cards. Recovery reconstructs the presentation history and suppresses old notifications.
### Rules39: Spot requires an unspotted enemy in LOS

Third-edition §8.5 (p.65): no blind search of an empty card or PC marker. The rules37 unconditional own-card target is retired. Eligible friendly recipients can Spot only current unspotted enemy positions in LOS, including genuine same-card positions, and cannot Spot from staging. Invalid commands reject without commands/cards being spent; PC evaluation remains in the contact phase. Existing unspotted-position markers, card-pull combat and public draw presentation remain. Previous tactical revisions are not converted for current recovery.

October 13 connected campaign release: normal Home/Campaign now offers the seven-mission Standard sequence without URL flags. Live M3–M7 setup/start/reload/resume and the controlled seven-mission transaction fixture passed, including same-company M3 terrain into M4 and fresh M6/M7 support crew ownership. Offensive defeat/abort still stops progression; completed patrol defeat may continue; M7 completion has no eighth destination. Locked Hill source/import controls are hidden and disabled. No tactical rules or storage version change (rules 39). These checks validate handoffs and recovery, not a winning full campaign playthrough; detailed evidence is in CAMPAIGN_COMPANY_READINESS.md and CAMPAIGN_FIRST_PLAYER_LOG.md.
