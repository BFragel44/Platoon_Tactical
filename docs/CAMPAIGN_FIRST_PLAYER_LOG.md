# Campaign first-player usability playtest

Started October 11, 2026. Running log; observations are provisional until the session ends.

Latest completed follow-up (October 12): the full M3 three-patrol cycle, full M4 failed attempt and successful reattempt, and live consecutive-contact/combined-combat checks are complete. Evidence and remaining broader coverage gaps are recorded in the final section below; earlier checkpoints remain as session history.

## Method and boundaries

Play through the visible browser interface with a fresh campaign company. Make tactical choices from briefing, visible map/counters, orders, recaps and other player-facing information. Do not inspect simulation state, hidden enemies, seeds for outcomes, developer tools or scripted successful solutions. Existing knowledge of the rules cannot be erased; this is a simulated first-player usability review, not independent novice research. Use an isolated in-app browser at the development server so the user's Edge game saves remain untouched.

Connected mission advancement is currently gated. Follow the real campaign flow until that boundary; do not relabel standalone missions or synthetic runs as a complete connected campaign.

## Running observations

| ID | Point in flow | Category | Observation | Impact / follow-up |
| --- | --- | --- | --- | --- |
| 01 | Initial page | Unclear | A fresh session opens directly into Company Assault turn 1. There is no campaign landing page or first-play guidance. | A new player must discover campaign start under File. |
| 02 | File menu | Unclear | Company Assault is still labelled “regression course” in the mission selector. | Developer terminology makes the normal entry feel like a test tool. |
| 03 | File menu | Works | All seven named Normandy missions are visible; accepted standalones are easy to find. | Retain explicit mission names. |
| 04 | Campaign company | Unclear | The empty company dialog shows “No campaign company,” fresh M1 and two export buttons. It does not explain the seven-mission campaign or current progression boundary before starting. | Explain what this start includes and what follows M1. |
| 05 | File menu | Works | The menu explicitly says progress saves automatically after accepted operations. | Useful reassurance before starting. |

## Session progress

Initial entry recorded below; current completed/sample coverage and patch verification are documented at the end.

### Setup and turn 1 observations

| ID | Point in flow | Category | Observation | Impact / follow-up |
| --- | --- | --- | --- | --- |
| 06 | Fresh company | Unclear | Resume saved campaign M1 and Debrief current mission are enabled before any campaign mission has been played. | Availability should reflect an actual campaign save/terminal run, or explain why unavailable. |
| 07 | Fresh company | Unclear | The roster lists the three-step mortar section plus all three one-step mortar aliases together. | Looks like six mortar steps unless the section/team choice is explained here. |
| 08 | Setup | Tedious | Equipment is a long per-formation table plus a second allocation summary. Defaults are usable, but there is no short recommended first-play deployment. | Lead with defaults and group advanced configuration. |
| 09 | Setup | Works | The allocation summary explains shared smoke, platoon rifle-grenade limits, carrying slots and overload consequences. | Good explanation; make the essentials easier to find. |
| 10 | Setup | Unclear | The setup heading does not name Trévières; it identifies seed/content version. Mission goals are found after starting via Mission. | Put briefing/mission title before commitment. |
| 11 | Activation | Works | Activate HQ is the default CO order. Targets are named; costs and command totals update immediately. | Sound core command flow. |
| 12 | Activation | Unclear | After completing CO impulse, Resolve segment is disabled until a Select HQ button is chosen. The side pane instead says to advance to an impulse. | Give an explicit “Select an activated HQ above” instruction. |
| 13 | Move platoon | Works | Two-command platoon movement moves the HQ/squads together; individual orders remain available. | Reduces repetitive movement. |
| 14 | After move | Incorrect feedback | With one command visibly remaining, the order pane says insufficient commands because the previous two-command order has become unavailable. Choosing Seek cover enables a legal one-command order. | Distinguish “choose another order” from genuine command exhaustion. |
| 15 | HQ switch | Unclear | Order and target carry over to the next HQ; 3 Platoon initially inherits 2 Platoon's Church target. XO inherits an invalid platoon order and a restriction message. | Persistent targets can cause accidental orders; clear or visibly confirm when recipient changes. |
| 16 | Map framing | Tedious | At the default browser viewport and 100% zoom, after moving the platoon the map remains framed on upper rows, so the moving units are off-screen. | Find unit helps, but moving/selected activity needs better automatic framing. |
| 17 | Mission menu | Works | Briefing gives ten turns, row-clearing objectives, support limits and permitted reattempt; hidden terrain remains concealed. | Keep practical rules text, reduce version/debug wording. |

Turn 1: activated all three platoons and XO; advanced platoons to Farm (1.1), Church (1.2) and Bocage (1.3). HQ1 found cover. XO brought the HMG and observer to Church. No enemy has yet been revealed; these are player choices from visible terrain only.

### First contact and combat

| ID | Point in flow | Category | Observation | Impact / follow-up |
| --- | --- | --- | --- | --- |
| 18 | Contact evaluation | Works | Reports distinguish identified HMG fire from unidentified fire; hidden identities/protection/consequences stay masked in the combat pane. | The uncertainty creates a meaningful reconnaissance problem. |
| 19 | Contact evaluation | Unclear | “Evaluate contact C: 40, 2, 10, 16” lists unexplained card numbers, then a practical result. | Lead with the tactical result; put draw details in optional explanation. |
| 20 | Contact evaluation | Tedious | Each card requires resolve plus continue-to-next, even when the next step is simply another resolve. | Maintain explicit stepping but consider one action per meaningful resolution. |
| 21 | Empty phases | Tedious | Capture, retreat and pinned recovery each opened a blocking “No visible changes” recap. Capture shows a guard-choice dropdown even when no prisoner exists. | Nonblocking no-change summaries and contextual choices would reduce churn. |
| 22 | Combat | Works | Mine explosion and unidentified/sniper fire are explained separately. Probabilities and receiving-fire modifiers show why exposure matters. | Strong cause-and-effect explanation. |
| 23 | Combat | Tedious | First combat requires 16 visible formation resolutions, each Resolve then Next; many panels repeat the same modifiers. | 32 clicks before returning to tactics; keep a detailed optional mode and a concise summary mode. |
| 24 | Combat | Unclear | “Frozen stakes,” “recorded queue position,” EFFECTIVE, NCM, VOF and LAT are not introduced in player language. | Novice explanations should connect each term to its consequence. |
| 25 | Postcombat | Unclear | A degraded HQ is simply “Eliminated — no command capability”; a Paralyzed Team exists but the path to reconstituting that HQ is not offered inline. | Explain which recovery/reconstitution action restores command. |
| 26 | Settings | Does not work yet | Settings opens only “Game settings coming later.” | There is no discoverable way to reduce repeated combat/empty-phase confirmations. |

Turn 1 consequences: Farm platoon hit mines and suffered one visible casualty plus several broken-down teams; HQ1 pinned. HQ2 and artillery observer became Paralyzed Teams. All of 3 Platoon was pinned, with a detached Paralyzed Team. Identified HMG was pinned. This was a genuine fog-of-war opening, not a scripted fixture; the run is difficult immediately.

### Turns 2–3: recovery under fire

| ID | Area | Category | Observation | Consequence / follow-up |
| --- | --- | --- | --- | --- |
| 27 | Reconstitution | Unclear | First Sergeant’s “Reconstitute eliminated HQ” consumed the issuing staff step, restored HQ2 at the staff location as Green, and left its equipment behind. The command preview did not explain donor consumption or equipment loss. | A consequential action needs an explicit before/after preview. Three remaining staff commands became unusable. No rule-error claim is made here. |
| 28 | Equipment transfer | Unclear | Recovering the CO radio from XO exposed both formations; XO could no longer move in that impulse. | Preview exposure and remaining-action consequences. |
| 29 | Stacking / movement | Unclear | Church movement appeared only as a disabled “unavailable” option while nearby cards were usable. | Explain the specific capacity or movement restriction next to the destination. |
| 30 | Initiative | Tedious | Pinned HQs still needed selection and impulse completion when they drew zero commands. | Permit an explicit combined acknowledgement of no-action HQ impulses. |
| 31 | Communications | Works, with onboarding gap | HQ display explains that covered Normandy HQ radios cannot connect. | Good reason text; warn before entering cover that the command network will change. |
| 32 | Recovery | Bug observed, cause unknown | During turn-3 platoon initiative the whole application became a blank white page. Reload restored the same phase and available HQ selectors. | Autosave recovery worked, but the unexplained blank page is a high-priority reliability issue. No console or internal state was inspected. |

Turn 2 used HQ rallies, recovered an eliminated HQ and its radio, added an LMG to the Bocage platoon, and directed the mortar against the identified Village HMG. Turn 3 began with the company pinned again; its only command successfully removed its pin. The restored HQ moved from staging to 1.3 because Church was unavailable. Both other pinned HQs drew zero initiative commands.

### Turns 4–6: attempts to regain momentum

| ID | Area | Category | Observation | Consequence / follow-up |
| --- | --- | --- | --- | --- |
| 33 | Action feedback | Unclear | Spotting and artillery-call outcomes require expanding “Last order”; a failed request leaves no prominent tactical feedback. | Keep the newest result visible until the next action. |
| 34 | Support | Works | Artillery offers the identified Village target; unidentified positions remain unavailable. | Target eligibility respects fog of war. |
| 35 | HQ events | Works | Advance event explains the required contact row, experience reward and no-penalty exception for insufficient commands. | Practical event prose is more useful than rule codes. |
| 36 | HQ events | Suspected wording defect | Turn 6 asks for the “next lead row (Row 4)” although the mission’s original map ends at Row 3, then says ignore if already on Row 3. | Clamp or explain the completed advance obligation; do not invite off-map movement. This is a public wording observation, not an internal-state audit. |
| 37 | Orders / attribution | Unclear | General-initiative preview still says “Command: Company HQ” after that HQ is eliminated, while the HQ-only selector defaults to a different HQ. | Distinguish general initiative from an actual issuing commander. |
| 38 | Cover / command | Unclear | Cover recovery and radio reconnection compete for scarce commands; simply leaving cover can consume an entire HQ impulse. | A brief novice recovery guide would help: establish communications, rally, suppress, maneuver. |
| 39 | Objectives | Works | Legal movement let a rallied squad advance to Marsh, then Woods; generated Row-4 cards appeared unavailable. | Visible restrictions protected mission boundaries. |

Tactical progress: spotting at Orchard failed three times; an artillery request failed. A squad infiltrated into Orchard and took a casualty. XO brought WP smoke forward; the surviving platoon bypassed Orchard via Woods and reached Marsh. The objective squad rallied, moved to 3.2 Woods, and sought cover. Most of the company remained disrupted behind it; Company HQ and the mortar section were lost to further breakdowns. No hidden unit data was consulted.

### M1 outcome and campaign preparation

M1 completed at the ten-turn limit: **DEFEAT**, 57 orders, 12 observed casualty steps and 36 formation changes. After command collapse, the final turns concentrated on withdrawing surviving infantry and teams. Both objectives had been entered, but the mission was not won. The permitted reattempt was explicitly declined; no reattempt playthrough is claimed.

| ID | Area | Category | Observation | Consequence / follow-up |
| --- | --- | --- | --- | --- |
| 40 | Formation selection | Tedious | Dozens of eliminated originals and generated teams remain in the selection dropdown, even after unavailable commands were filtered. | Separate active formations from historical inspection entries. |
| 41 | Outcome | Works | Terminal banner labels final fire markers as historical and exposes replay, AAR and roster exports. | Clear distinction between ended combat and current tactical state. |
| 42 | Debrief | Works, with discoverability gap | Debrief rejects an undecided reattempt and explains why. “End mission here” then enables terminal application. | Rename to explicitly mention declining the reattempt. Campaign debrief remains under File rather than alongside the outcome. |
| 43 | Preparation | Tedious | Rebuilding the company required 20 individual transfers, each with source selection, recipient selection and commit. | Offer batch assignment with a reviewable result while preserving identity and eligibility. |
| 44 | Preparation | Unclear | The company summary retained pre-preparation experience throughout transfers/promotions; only finishing preparation recalculated it. Green rebuilt First Sergeant still displayed Veteran until completion. | Show pending combined experience and mark it as provisional. |
| 45 | Promotion | Works, with wording gap | Rebuilt HQ promotion was rejected without spending points; valid Line→Veteran and Green→Line promotions reduced experience correctly in the displayed tally. | “Step cannot be promoted” should name the applicable restriction. |
| 46 | Replacements | Unclear | Defeat yielded 0 Green and 0 Veteran replacements, with 12 vacancies. | Explain the outcome-dependent allowance rather than only showing zeros. |
| 47 | Skills | Unclear | Skill labels show cost but no effect or use procedure. A third Auto Spot purchase was rejected as exceeding the printed counter mix. | Display remaining skill counters and effects before purchase. |
| 48 | Prepared result | Works | Final summary recalculated experience; bought skills and company strength survived reload. Separate export succeeded. | Persistent preparation delivered a coherent final company. |
| 49 | Campaign boundary | Unclear | Only after preparation does the interface prominently say next mission is gated pending carryover. Its main start button is “Start fresh campaign M1.” | Explain this boundary at campaign creation and avoid suggesting a reset as the primary next action. |

Preparation used 20 surviving Green teams to rebuild five HQ/staff counters, the mortar section, HMG and rifle squads. Two LMG steps became Veteran, and two Green rifle steps became Line. Bought General Initiative, two Auto Spot and two Auto Cover skills; one unspent point expired. A rejected third Auto Spot purchase left points intact. Four rifle squads remained empty. Prepared campaign state survived reload. Connected M2 could not be launched; subsequent reviews are standalone usability runs, as authorized by the user.

Evidence (exports produced through the visible UI; not read to inform tactical decisions):
- `reference/playtest_replays/first_player_2026_10_11/M1_first_player_replay.json`
- `reference/playtest_replays/first_player_2026_10_11/M1_prepared_company.json`

### M2 standalone: Cerisy (running)

Fresh standalone setup; the prepared M1 company was not deployed or altered. This review uses straightforward visible advance/rally/support choices, not a scripted success fixture or optimized expert tactics. Mechanical acknowledgements are batched through the same rendered UI; command eligibility and destinations are read afresh before every action.

| ID | Area | Category | Observation | Consequence / follow-up |
| --- | --- | --- | --- | --- |
| 50 | M2 briefing | Works | Explains fresh standalone company, five-row objective/clearing requirement, Hasty Defense, Deep Bunkers, counterattack duration and the three support agencies. | Mission differences are discoverable in one menu. |
| 51 | Opening summary | Unclear | Modal shows objectives and casualties before the full briefing; the five-row map initially frames the far objective rows, with starting units below view. | First useful framing should show starting forces and their route toward objectives. |
| 52 | Group movement | Unclear | “Move platoon” successfully moved only the HQ when its rifle squads were disrupted. The preview named only the issuing HQ and destination. | Show the actual participants and units left behind before spending two commands. |
| 53 | Battalion fire | Works | Successful three-burst call pauses for ordinary/battalion selection; text explicitly says the mission was expended and no second command/draw is needed. | Good persistent decision boundary. Ordinary fire selected in this run. |
| 54 | Battalion fire | Unclear | Adjacent-card choices list terrain but do not identify friendly occupation; generated edge cards are mixed with original-map cards. | Add visible friendly-presence labels and explain why generated cards can be fire targets. Do not reveal hidden occupants. |
| 55 | Support | Unclear | Briefing refers to published caller tables rather than giving caller draws for each agency. | Surface the applicable draw in the selected call preview. |
| 56 | Command network | Works | Display accurately tells the player when Company HQ left in staging can no longer reach forward HQs; movement forward is available. | Pair this explanation with a suggested action, without changing eligibility. |

Opening: three platoons entered Row 1, support teams deployed and sought cover. Farm and Bocage formations suffered breakdowns; the Church platoon remained the main advancing force. Its later move split the platoon because some squads were under cover or disrupted. Observer and command advances revealed more terrain; a successful artillery call exercised the pending battalion choice. This is not a victory or complete coverage claim; terminal result will be appended.

M2 terminal result: **DEFEAT at Turn 10**, 77 orders, 5 observed casualty steps, 25 formation changes. The advance reached Row 4, but neither Row-5 objective was secured and original rows remained uncleared. Two ordinary-fire decisions and a subsequent short round were exercised; reattempt was not played. `M2_first_player_replay.json` preserves this full attempt. These outcomes reflect this play style, not a claim that the missions are unwinnable or incorrectly balanced.

### M3 standalone: St. Georges opening sample

Coverage: setup, briefing, two complete turns, Route 1 and Route 2, detachment, hidden contacts, first combat and abort/switching. The three-patrol terminal sequence and M3→M4 terrain import are **not** covered by this sample. Export: `M3_opening_sample_replay.json`, made before abort at the start of Turn 3.

| ID | Area | Category | Observation | Consequence / follow-up |
| --- | --- | --- | --- | --- |
| 57 | Patrol plan | Works | Setup explicitly states four distinct route cards, sequence, objective visit and MLR return. Turn summary lists pending/visited cards. | More helpful than a generic objective banner. |
| 58 | Route planning | Tedious | Four separate long dropdowns require remembering relative locations; terrain choices are initially unknown. | Let the player mark a route directly on the preview map while retaining dropdown access. |
| 59 | Default command link | Unclear | Company HQ begins under cover; its default radio link cannot activate the patrol HQ until it moves out of cover. | Add an actionable startup hint or an explicit setup warning. |
| 60 | Patrol reserves | Works | Unselected HQs read “Not assigned to patrol” and are distinct from casualties; setup locations identify the OUTPOST. | The participation distinction is readable. |
| 61 | Route markers | Works | Touching 2.1 shows “✓ Route 1 reached”; 3.2 subsequently becomes visited in the summary. | Clear completion feedback, independent of color. |
| 62 | Detached team / group move | Needs rules follow-up | After detaching Assault team 1 on 2.1, the next Move platoon moved the HQ and original squads to 3.2 but left that team on 2.1. The team was in good order with no displayed exposure. | Check its eligibility and explain the exclusion before commit. This observation alone does not establish a rules violation. |
| 63 | Patrol return | Unclear | Briefing says return across the MLR without explicitly identifying whether one patrol unit or every survivor must return. | State the exact tested success condition in player language. |
| 64 | Abort | Wording bug | M3’s aborted AAR says “Commander aborted the company assault.” | Use the current mission/patrol name. |

The first two route points were reached; the first hostile combat killed the patrol HQ. No hidden identities were consulted. The sample was stopped deliberately to examine the remaining mission-specific interfaces; it is not a completed patrol or campaign success.

## M4 — Hill 192 opening sample

Fresh standalone battlefield, default deployment and seed `company-1`. Reviewed setup and briefing, activated all three platoons, advanced each straight ahead to Row 2, sought cover with 1/1 Rifle Squad, and completed Turn 1. This is an opening sample, not a completed mission or carryover validation.

65. **Works:** setup explicitly distinguishes a fresh standalone map from M3 import, explains that changing sources resets setup choices, and states that fresh-map testing grants no automatic engineers. The briefing explains no staging, unavailable reserves, retained Foxholes/mines, counterattack duration and all support quantities.
66. **Confirmed information leak:** before 1 Platoon moved, the map labelled 2.1 and 2.2 as Unrevealed terrain, while the Move platoon Target dropdown labelled them `2.1 Woods / Hill` and `2.2 Orchard`. Route choice remained straight ahead by column, without exploiting those names. Terrain target labels need the same visibility policy as map headings.
67. **Unclear:** support preview distinguishes HE/WP/TOT resources in the briefing, but a new player still needs a short explanation of TOT and when the concentration bonus applies before committing a request.
68. **Tedious / confusing:** after Move platoon, the order resets to Choose an available order while the pane retains an error about the previously attempted action. This can sound like a prohibition on the newly displayed Seek cover command. A neutral action-completed message would be clearer.
69. **Works:** combat keeps unidentified fire identity and enemy protection hidden while displaying the receiving formation's modifiers. Incoming mortar and mine effects are distinguishable.
70. **First-player difficulty:** the opening advance suffered mortar fire, unidentified fire, squad breakdowns and loss of Company HQ to mines on its starting Church card. This is an outcome, not proof of a rules defect. A recover-command-capability hint after losing HQ would help. Thirteen visible combat resolutions required separate Resolve and Next actions.

## M5 — opening patrol sample

Fresh default six-column map and Platoon 1, Moon +2. Left Company HQ cover, activated the patrol, moved to Route 1 at 2.1, sought cover with 1/1 Rifle Squad and completed Turn 1. Exported the opening sample and aborted; all three patrols and terminal preparation are not covered here.

71. **Works:** reached route marker becomes an explicit checkmark with accessible text `route 1 reached in sequence`. The briefing lists night illumination resources, radio-only policy and retained map across three patrols. Non-patrol leaders are correctly labelled Not assigned to patrol and require no meaningless activation selection.
72. **Confirmed information leak repeats:** 2.1/2.2 were unrevealed on the map before movement, but movement options named Woods/Village. Same issue as finding 66.
73. **Rules follow-up:** current Mission menu explicitly says Route 1 → 2 → 3 → 4 and fixed non-patrol positions even below MLR. These are internally consistent with the current controls, but should be reconciled with the earlier user question about reverse numbering and defender movement against published sources. This usability sample alone does not establish a rules defect.
74. **Unclear:** premission says visit routes in order without printing the numeric sequence alongside the four selectors. State it there too, and include a small route preview to help plan a viable ten-turn patrol.
75. **Works:** night combat shows the light/weather modifier and a named spotted enemy; its breakdown result and casualties are explicit. First-turn patrol had no friendly casualty in this sample.
76. **Repeated friction:** Company HQ starts under cover and cannot activate the selected patrol until spending a command to leave cover. The communication tooltip explains why, but default setup should draw attention to this required opening action.

## M6 — Vire vehicle opening sample

Fresh default company, five Shermans, optional company Jeep deployed at Staging 2 without mounted artillery radio or passengers. Activated Sherman HQ through Company HQ, then Sherman HQ and 4/Sherman individually through the subordinate impulse. Advanced three infantry platoons into Row 1. Activated Jeep through General Initiative. In 3.6 moved Sherman HQ to 1.1 Farm and 4/Sherman to 1.2 Church, completing each reaction step, then advanced to JEEP. Sample stopped at the blocker below; this is not a completed mission.

77. **Stale wording:** normal selection offers Vire, but setup says Experimental Vire setup; normal mission selection remains gated. This contradicts the entry path.
78. **Works:** Company HQ's ordinary Activate HQ target includes Sherman Platoon HQ; its Select HQ button joins the same subordinate-activation flow. The pane explains activation now / movement in 3.6, without a detached vehicle window.
79. **Works:** tank routes use readable `1.1 Farm` and `1.2 Church` labels, without duplicate internal IDs. Each one-card movement required one explicit Continue movement reaction step and then clearly marked action complete. No purposeless Spot button appeared during this opening.
80. **Works:** Jeep transport section listed co-located passenger candidates; empty ground-assets, casualties and carried-cargo fields were absent.
81. **Confirmed UI blocker, underlying cause not diagnosed:** Jeep was activated through General Initiative. In 3.6 JEEP group, the selector labels Company Jeep ready to act, while its selected pane says not eligible in current group. No Next route card or movement action appears. Main Resolve segment is enabled but leaves phase/group unchanged. Reload preserved the same state and contradiction; clicking Jeep counter did not restore controls. Reproduction export: `M6_jeep_group_blocker_replay.json`. Needs a focused eligibility/UI investigation before relying on Jeep play.
82. **Unclear:** header says resolve pending hits and responses even when no pending procedure is visibly listed. A concrete current task (move a ready tank / select Jeep / finish group) would orient a new player better.
83. **Clutter:** Selected vehicle dropdown includes infantry rifle-grenade and bazooka entries even during the tank group; group-specific sorting or filtering would reduce the mental load.

## M7 — setup and activation sample; persistence blocker

Fresh default Tinchebray company and four M10s, no Jeep. Reviewed setup/briefing, activated M10 Platoon HQ and 1 Platoon HQ through Company HQ, selected M10's subordinate impulse and activated its vehicle. Exported current replay. This sample does not cover movement, combat, objectives or either reattempt.

84. **Confirmed save failure:** immediately after starting M7 following the previous mission reviews in the same isolated browser profile, a visible alert reported that saving `platoon-tinchebray-integration` exceeded browser storage quota. The alert remained through activation. Gameplay continued in memory and export worked; durable recovery is not verified and must not be assumed. No storage was cleared and no hidden state inspected. This realistic multi-mission accumulation needs a persistence investigation (record size, retention and atomic failure behavior).
85. **Stale wording:** setup says Development candidate; normal mission selection remains gated even though Tinchebray is selectable normally.
86. **Works:** briefing clearly distinguishes Row 6 primary, Row 5 secondary, clearing original Rows 1–5, two reattempts, event-only M5 support and tank ammunition restrictions. M10 HQ activation uses the same company/subordinate flow as Shermans.
87. **Unclear:** after activating M10 HQ itself, the vehicle pane says No vehicle orders are available in this segment, while the impulse still has other vehicle recipients. Prefer Activate another vehicle or complete impulse when appropriate.
88. **Repeated first-player friction:** initial six-row map opens at the distant objective rows, requiring Find unit / scrolling to locate the actual starting force. The document title still identifies Company Assault while the current Mission menu identifies Tinchebray.

## Coverage and priorities at this checkpoint

| Flow | Actual coverage |
| --- | --- |
| Connected campaign M1 | Full ten-turn failed first attempt; declined reattempt; terminal debrief, all preparation stages, export and reload of prepared company |
| Standalone M1 | M1 tactical review above used the campaign entry; separate fresh standalone full run remains outstanding |
| Standalone M2 | Full ten-turn failed first attempt; replay export; reattempt not played |
| Standalone M3 | Two-turn opening sample, exported and deliberately aborted |
| Standalone M4 | One-turn opening sample, exported and deliberately aborted |
| Standalone M5 | First patrol's opening turn, exported and deliberately aborted; three-patrol cycle remains outstanding |
| Standalone M6 | Activation and two tank moves; Jeep group blocked; replay exported |
| Standalone M7 | Setup, briefing and M10 activation only; storage quota failure; replay exported |

This is a running first-player review, **not a completed seven-mission campaign, seven full standalone runs, or rules certification**. Connected launch beyond M1 preparation remains gated. Existing user browser profiles and standalone companies were not modified by these isolated tests. Game code has not been changed during this review.

Highest-priority follow-ups:

1. Resolve M6 Jeep ready/ineligible contradiction and stalled JEEP group (81).
2. Investigate M7 storage quota failure after normal multi-mission use, while preserving exports and existing records (84).
3. Apply map visibility to infantry movement target terrain labels (66, 72).
4. Improve consequential order previews: actual group recipients, donor effects, capacity restrictions and friendly occupancy around support targets.
5. Make action results persistently noticeable; remove stale previous-order errors and explain the next legal action.
6. Reduce empty recap and zero-command activation clicks while retaining explicit phase control.
7. Improve campaign entry, briefing-before-equipment orientation, preparation batch transfers, pending experience and skill availability.

Continue the outstanding full standalone/reattempt/patrol reviews after the two blockers are investigated. Suspected rules discrepancies remain labelled separately from confirmed interface defects.

## Refinement patch verification — October 11, 2026

- **81 resolved:** empty activated Jeep needs an embarked driver. It now explains this and offers Hold position; holding resolves normal vehicle VOF, records an immutable replay operation, and releases the ordered action. Browser reproduced an empty Jeep through JEEP, Hold and subsequent phase continuation. Movement without a driver remains prohibited.
- **84 resolved:** local recovery losslessly shares repeated JSON subtrees. Both vehicle latest/turn-start records fit a bounded 1,000,000-character test budget and reload exactly. Existing tactical/backup slots are compacted without deleting records or changing replay values. Corrupt originals remain untouched; historical rules rejection remains strict. Export downloads expand the storage representation. Failed replacement writes restore the prior backup. Browser started/reloaded M7 in the previously full isolated profile without a quota alert.
- **66 / 72 corrected:** the earlier confirmed-leak classification was wrong. A fresh browser sequence showed 2.1/2.2 unrevealed before Activate HQ, then revealed on the map immediately after that order, before movement selection. Map and dropdown agreed. A projection immutability/concealment fixture now protects unrevealed labels; no terrain discovery rule was changed.
- **Command clarity:** selection clears old command/target intent without silently substituting another order. Neutral available-order guidance replaces stale previous-action errors. Group movement preview lists actual recipients. Last-order results open by default. Support targets flag visible friendly formations. HQ reconstitution explains the donor step and final-step equipment drop.
- **Click reduction:** empty/no-event segment recaps remain in history but no longer open mandatory dialogs. Selecting an HQ that draws zero commands and has no usable free orders completes that empty impulse through the existing recorded phase operation; it does not draw another HQ or advance past the chosen impulse.
- **First-player guidance:** setup leads with mission name and briefing; new mission camera focuses the starting force. Campaign entry explains separate standalone companies and the M1 progression gate. Preparation explains final experience recalculation, skill effects, holder limits and shared counter mix. Accepted M6/M7 setup wording and Company Assault selector wording no longer claim development-only gating or a regression course. Browser document title follows the current mission.

Simulation is rules **35** for the new Hold operation. Replay schemas/content versions remain unchanged; rules-34 originals are not relabelled/imported as current runs. M4/M5 validation sequences were freshly executed at rules 35 with exact replay, retaining older outputs. The original scripted/manual coverage limitations above still apply. Batch company transfers, broad onboarding, further vehicle redesign, source adjudication of disputed rules and complete manual M3–M7 attempts remain follow-up work.

Validation evidence: full regression sweep ran 118 files (1,777 tests at that point); the version/storage-related failures were corrected and all seven failed files passed focused reruns. The added refinement fixture now has seven passing cases, including storage-marker collision and backup rollback. Production build passed. Six Company Assault policies and KUTF `kut-1 / support` completed with exact replay; fresh rules-35 M4/M5 validation runs also retained exact replay. Browser checked empty Jeep holding, M7 save/reload, briefing, map focus, group-recipient preview, expanded results and neutral selection. The source-disputed patrol rules have not been changed.

## Continuing the five refinement priorities — October 11, 2026

This pass continues items 3–5; blocker and terrain-projection verification from the previous entry remains valid.

- **Preparation batching:** Company step is now a labelled keyboard-accessible multi-select. Selected transfers are reduced into immutable drafts and committed once only if every choice is valid. Existing identity, eligibility, attachment and capacity rules remain authoritative. Invalid later choices, stale revisions and failed writes apply no transfers. Failed final writes also retain the older preparation backup.
- **Eligibility before action:** transfer previews describe receiving capacity; promotion requires one selection and explains experience cost, rebuilt-HQ restrictions and prior promotion. Skill previews validate points, holder eligibility and the shared physical counter mix before enabling purchase. Skill effect appears beside the short selector. Empty formation selectors say No eligible formation.
- **Experience clarity:** preparation summary computes combined experience from currently assigned steps, instead of stale formation experience. Pending summaries say on completion; finished summaries do not. Replacement phase explains the success requirement. Active or unrelated standalone missions cannot use the campaign debrief button.
- **Optional recap dialogs:** Settings offers Open recaps for visible changes, default on. It persists with tactical presentation/recovery; changing it keeps Settings open and keyboard focus on the control. Turning it off leaves manual Recap/history, phase stepping and required decisions intact.
- **First-player help:** Mission menu includes a collapsible command flow and glossary (VOF, NCM, LAT, PIN and EXPOSED), radio-versus-orders guidance, Spot position and Find unit. Aborted mission text uses the current mission name in presentation while preserving historical recorded text.

Evidence: eight preparation-choice fixtures pass, including successful multi-step transfer/reload with stable identities, invalid/duplicate selection rollback, stale/quota rejection, older-backup preservation, attachment restriction, skill-counter exhaustion, projected experience and recap presentation. Existing campaign preparation, command/consequence, recovery and KUTF clarity fixtures pass (95-case sweep and focused follow-ups). Production build passes. Browser checked batch capacity and promotion guidance, replacement and skill phases, resumed preparation, skill disabling, recap preference reload and keyboard-accessible labels.

Browser QA used a fresh **aborted** isolated M1 company to exercise terminal preparation, not a completed tactical playthrough. The earlier isolated prepared company was exported to Downloads before this QA and retained as the campaign backup. The user's Edge saves were not touched. No combat-rule, replay-format, content-version or rules-version change was needed; current rules remain 35. Successful batch commit is covered by fixtures; the live UI check used an invalid full-formation selection. Full M3–M7 manual runs, patrol/reattempt coverage and source-disputed rules remain outstanding.

## Support and issuer clarity follow-up — October 11, 2026

- Support order preview displays the published caller draw count after experience/floor and registered-target bonus, remaining ammunition-specific missions and required network. Optional skills/exhortation are identified as additional to this baseline. Profiles come from friendly agency definitions in the player projection; no enemy support definitions are exposed.
- Battalion choices label publicly visible friendly occupancy, reject duplicated/unlisted adjacent cards before confirmation, and keep the resulting decision in expanded Last order feedback. No extra command, draw or support mission is introduced.
- Failed calls and short rounds remain prominent for the current turn across subsequent orders and HQ/phase changes. Warnings use public projected terrain names and friendly occupancy, never raw hidden terrain or enemy names. A later successful ordinary call clears the old warning; historical results remain recorded.
- A removed General Initiative issuer now clears to an explicit Choose HQ for HQ-only actions placeholder rather than showing a different selected HQ while retaining an eliminated issuer internally. It does not automatically substitute another leader. Ordinary General Initiative orders still show their actual command source.

Validation: 156 focused support/Cerisy/command/recovery checks passed; production build passed. Browser inspected Cerisy Company HQ's WP profile (one caller draw, one mission remaining, BN network), issued a failed WP call, then activated a platoon: the failure warning remained visible. Duplicate choice, registration, all experience levels, ammo-specific draws, hidden-name concealment and eliminated-issuer selection are covered by focused fixtures. The pending battalion choice was not generated in this short browser sample. No simulation, content, replay-format or rules-version changes; rules remain 35. Full manual mission/patrol/reattempt coverage remains outstanding.

## Phase and movement clarity follow-up - October 11, 2026

- The phase header directs players to select an HQ when an activation/initiative impulse is waiting, and identifies pending support decisions. Expanded phase help explains activation, General Initiative, zero-command free actions and mandatory choices using public player state.
- Movement and known-cover orders offer a collapsed explanation of unavailable targets from the existing command predicates. Other target categories are excluded from this panel to avoid revealing hidden enemy information.
- Valid movement previews show current friendly occupancy, the steps in the selected move and projected card stacking. Group previews use the published player-view recipient list; the rules engine remains authoritative. Completed/unavailable moves no longer retain a misleading capacity preview.

Evidence: 51 focused phase/command/consequence/resolution/preparation/KUTF checks pass; production build passes. Isolated Cerisy browser QA resumed recovery, completed Company activation, verified Select HQ below and expanded phase guidance, previewed ten platoon steps joining one friendly step (11/16), executed the move, and inspected unavailable-target reasons after recovery. No new combat rules, replay migration or rules-version change; rules remain 35. This was a short presentation check, not another full mission run. Remaining manual coverage and disputed source questions above remain open.

## Remaining-gap pass - October 12, 2026

- Observation 28: equipment-transfer preview names both friendly participants and warns about exposure and further movement restrictions before spending a command.
- Observation 31: Normandy CO-radio formations receive a cover-entry warning; same-area voice and working field phones are distinguished from radio loss. Other mission communication policies and observer radios are not given this warning.
- Observation 36: ADVANCE/ADVANCE_PC prose recognizes the final mission row instead of requesting a nonexistent next row. Recorded events and scoring remain unchanged.
- Observation 40: the formation selector separates active formations from off-map/historical inspection entries, preserving every identity and selection.
- Observations 24/42: combat explains fixed segment probabilities in player language; declining a reattempt now explicitly says Decline reattempt and end mission.

Browser QA resumed isolated Cerisy and checked the CO-radio cover warning, active selector group and named equipment-transfer exposure preview without issuing the transfer. Historical entries, cross-policy exclusions, unknown donors and advance boundaries are covered by fixtures. These are presentation changes only; rules remain 35.

### Open work after the presentation patches

- Diagnose the earlier transient blank page (32); it has not been reproduced or attributed to a confirmed cause.
- Source-adjudicate patrol route numbering and non-patrol movement (73), and investigate detached-team group-move exclusion (62). No rules correction is claimed yet.
- Improve combat/contact click flow while retaining explicit resolution and hidden information; contextual guard choices and recovery-command hints still need focused review.
- Full fresh standalone M1, complete M3-M7 manual attempts, three-patrol cycles and reattempt playthroughs remain incomplete. Short UI checks and deterministic fixtures do not substitute for these runs.
- Human preparation acceptance and connected campaign launch remain gated; broader vehicle redesign remains subsequent scope.

Validation result for this pass: 31 focused presentation/event/consequence checks pass; production build passes. Full sweep: 122 files, 1,802 tests; initially 1,797 passed and five failed. Two combat wording assertions, a stale Settings assertion and an unsupported-version fixture using now-supported rules 35 were updated without loosening runtime compatibility. The M7 three-attempt test hit the shared 120-second bound, so that fixture alone now allows 240 seconds. Focused reruns: all 77 checks in the six small affected/audit files pass, and all three Tinchebray complete-run checks pass (181 seconds), including exact replay/recovery and duplicate-debrief rejection. The full sweep also reported a Windows fork-termination error for commandMenuAudit; its focused rerun passed. No second full sweep or new full manual playthrough is claimed.

## Patrol-source adjudication - October 12, 2026

Observations 62 and 73 source review: visually checked Normandy campaign pp.34-35 (M5 MSR 1-2), p.27 (M3 route MSR) and third-edition p.23 movement table; extracted companion p.26 (M3 MSR 1). Both patrol missions explicitly require route markers in sequence 1-4. Non-patrol defenders may receive orders and fire, but cannot move except by automatic retreat; the below-MLR exception proposed earlier is not printed. Current simulation matches these requirements and is unchanged.

Move Platoon (4.2.2b) recipients are Good Order units on the same card, unexposed and in communication. Detached Assault/Fire Teams are LATs and do not meet that group recipient category; individual movement remains the appropriate command. The original observed exclusion therefore does not establish a rules defect. New public-state preview lists friendly formations staying behind, explains LAT/pinning/exposure exclusions and directs other exclusions to communication/actions/capacity checks. Setup now explicitly prints Route 1 → 2 → 3 → 4.

Evidence: 83 presentation, M3/M5 engine and core command-audit checks pass, including concealment and projection immutability. No rules-version or replay change. Full manual patrol/reattempt reviews and transient blank-page investigation remain open; no new complete manual run is claimed.

## Contact stepping and recovery guidance - October 12, 2026

The user explicitly deprioritized the transient white page (observation 32). It is deferred, not resolved; it is no longer the next investigation.

Observations 20/25/38/70: removed the presentation-only contact acknowledgement between consecutive contact evaluations. After a resolved card, Evaluate next contact invokes the existing single advancePhase operation for the next card. It does not batch contacts, skip the last result, resolve combat automatically or alter draw order. Previous results remain recorded; the final contact still requires explicit progression into pinned recovery. Older saved acknowledgement fields remain readable but no longer introduce an extra click.

Damaged command counters now explain rallying, restoring a command/observer side and donor-based HQ reconstitution. These hints use the selected friendly formation's visible status and do not assert that an unavailable order is legal.

Validation: 38 focused phase-guidance, command-consequence, resolution and combat-exchange checks pass; production build passes. Existing contact fixtures verify one card per operation, result visibility, fixed resolution ordering and projection immutability. No tactical rule/version or replay operation changes. No new browser or full manual mission run is claimed in this pass.

Next active gaps: browser-verify the streamlined contact flow; assess contextual guard controls and detailed combat click reduction; complete remaining fresh standalone/patrol/reattempt manual coverage. Human preparation acceptance and connected progression remain separate gates. The white-page observation stays deferred at the user's request.

## Guard context and explicit combat shortcut - October 12, 2026

- Capture guard-side selection is shown only in Normandy capture when a live unpinned two-step friendly squad shares a card with a public enemy/suspected position. This is a conservative public-context filter, not a hidden capture-outcome prediction. Empty capture cards no longer allocate header space. The existing Fire Team default applies when no choice is shown; capture rules/order are unchanged.
- Resolved combat offers Resolve next visible formation while another visible pending formation exists. It uses ordinary advancePhase followed by the existing displayed-exchange resolver; every accepted intermediate operation is persisted. The separate Next combat inspection action remains. The shortcut is absent at the end of the visible queue and never automatically starts the next phase.
- Browser verification resumed isolated Cerisy, confirmed an empty capture phase with no guard dropdown, evaluated its single pending contact, reviewed the result, continued to combat, resolved one visible enemy and explicitly advanced afterward. Its queue had only one visible resolution, so the combined shortcut and consecutive-contact flow remain fixture-verified rather than live-browser verified.

Evidence: 34 focused combat/phase/header/resolution checks pass; build passes. Shortcut state and replay-operation equivalence is checked against manual Next then Resolve, including unrelated receiving formations and end-of-queue controls. Tests also protect hidden identities/results, guard public context and inactive phases. No rules/version or replay-schema change. This short Cerisy continuation is not a complete tactical mission. Remaining full fresh standalone/patrol/reattempt manual runs are still open; the white-page investigation remains deferred by the user.

## Live patrol follow-up in progress - October 12, 2026

Isolated IAB, default M3 company-1 through normal selection; no hidden simulation/replay state consulted for tactical decisions. Patrol 1 completed SUCCESS on turn 7: 16 orders, one observed casualty step, two formation changes. Routes 2.1 → 3.2 → 4.3 → 2.2 and final return to 1.2 were completed. HQ1 was lost after reaching 4.3; surviving squads finished using General Initiative. Saved export: reference/playtest_replays/manual_followup_2026_10_12/M3_patrol1_success_replay.json.

Live control gaps closed: consecutive contacts 2.1/2.2 used Resolve contact then Evaluate next contact, without the former acknowledgement. Turn-2 combat used Resolve next visible formation three times and required final explicit continuation. No automatic phase skip or hidden outcome disclosure was observed.

Patrol-2 preparation transferred Assault team 13 into eliminated HQ1, selected one eligible Veteran step promotion, set active Platoon-2 cover choices Open, then began patrol 2. Revealed/expanded terrain remained. Patrol 2 is currently at turn 3 and is NOT complete. Browser-tool timeout reset the automation bindings; UI/autosave retained progress.

New provisional findings: old movement danger warning can remain after action completion; prior-patrol WP failure appears again at the matching turn number in patrol 2, despite no such request in that patrol. Company HQ again needed to leave cover at patrol start; setup/cover interpretation needs verification before calling this a rules bug. Full three-patrol completion and reattempt runs remain open until terminal results are recorded.

M3 follow-up completed: patrol outcomes SUCCESS on turns 7, 9 and 8; terminal SUCCESS, 51 orders, one observed casualty step, five formation changes. Patrol 2 used illumination and repeated rally/recovery; patrol 3 restored its HQ from Fire Team side and completed a revised route in Moon +4. Both intermediate preparations, source terrain/cover/mines retention and final MLR returns were exercised in the browser. Terminal replay, public AAR, scouted battlefield and roster are saved under reference/playtest_replays/manual_followup_2026_10_12/. Terminal reload recovered the result; the isolated roster export has revision 1 and one applied mission; a second application visibly reports This mission was already applied.

Hill 192 now uses that actual M3 battlefield through normal setup, with conditional engineers offered for discovered Row-2/3 mines. Its fresh standalone company is separate from the M3 roster. First attempt is currently turn 5, both objectives/attack secured but row clearing incomplete; three observed casualty steps. XO donated its step to restore HQ3, which recovered the dropped radio. Infantry/staff rallies, conditional exhortation, smoke, an unsuccessful WP call with extra exhortation draw and group infiltration were exercised. This attempt is not yet terminal and reattempt coverage remains open.

## Manual patrol/reattempt follow-up completed — October 12, 2026

This supersedes the preceding in-progress checkpoints for M3/M4. These runs used the isolated in-app browser at localhost:5175, ordinary UI controls and explicit phase stepping. Tactical decisions used public map, briefing, commands and recaps. Exported state was inspected for verification only after the runs ended. The user's existing browser saves were not used or replaced.

- **M3:** all three patrols succeeded, on turns 7, 9 and 8. Both preparations, LAT-to-HQ reconstitution, eligible promotion, route changes, illumination, cover/communications restrictions, retained mines and the final MLR returns were exercised. Terminal totals: 51 orders, one observed casualty step, five formation changes. Terminal reload and duplicate debrief rejection passed.
- **M4:** imported the actual terminal M3 battlefield, including its retained cover/mines and conditional engineer attachment, into a separate fresh standalone company. Attempt 1 ended DEFEAT at turn 10 (67 orders, 25 observed casualty steps). The second attempt ended SUCCESS at turn 10. Combined terminal totals: 106 orders, 30 observed casualty steps, 87 formation changes. This is a complete failed-attempt → preparation → successful-reattempt UI run, not connected campaign advancement.
- **Preparation:** selected 16 surviving LAT transfers, rebuilding Company HQ, HQ1, staff, three rifle formations, two engineer steps and two weapon counters. Spent 24 points on eligible promotions and four on skills; newly rebuilt command steps were not promoted. Selected secured-card deployments and cover, then saved/reloaded the new attempt. No fresh replacement identities or individual wound/death outcomes were invented.
- **Live skills/support:** Auto Spot identified a currently reported enemy position and was consumed. Auto Infiltrate was used for an eligible individual rifle-squad action, rather than assumed to apply to a whole-platoon order. Repeated support failures remained visible only within their own attempt. Successful artillery produced a pending battalion-fire choice; it survived reload, and Ordinary fire continued without another command/draw. Mortar availability returned after the one-turn displacement event. Depleted HMG ammunition and named weapon-side recovery options were visible.
- **Live controls:** M3's consecutive occupied contacts required one explicit evaluation per card with no intermediate acknowledgement. Its multi-formation combat exercised the combined Resolve next visible formation button three times, retained each result and required final explicit continuation. The M4 combat queues also used this flow through both attempts.
- **Persistence:** M4 terminal reload recovered SUCCESS; its debrief produced revision 1 with one applied mission. Duplicate application visibly reported “This mission was already applied.” M3 and M4 company identities remained separate.

### Confirmed presentation corrections

Patrol 2/3 reused turn numbers and exposed an attempt-boundary defect: segment recaps, previous-turn summaries and failed-support alerts could reuse an earlier patrol's events. Presentation now scopes these to the latest PATROL_PREPARED / MISSION_REATTEMPTED boundary, while preserving the complete historical event stream, AAR and replay. Historical segment reviews identify their patrol/attempt. Live M4 attempt-2 recaps showed the correct attempt label; no pre-transition support warning appeared before a new request. Completed/unavailable movement no longer retains a prior movement-danger preview. Rules remain 35; no replay migration.

The earlier Company HQ cover observation is not a demonstrated simulation defect: patrol preparation intentionally places fixed non-patrol defenders in available Foxholes. Offering an Open choice without explaining that setup rule remains a presentation refinement.

### Remaining refinements and coverage boundaries

- Heavy losses make the inspectable historical-formation selector long. Inspection remains useful, but an optional separate history filter would reduce clutter.
- M4's public AAR checks show both victory conditions satisfied from reattempt turn 2; the mission continued to its final turn under the implemented mission-end rule. The live Mission summary did not make that timing, or row-clear progress, sufficiently obvious. This is a presentation/source-review follow-up, not evidence of hidden information leakage or a newly proven victory-rule defect.
- The full M3 cycle and complete M4 reattempt gap are now closed. Full fresh standalone M1 and full manual M5–M7 runs remain broader review gaps; earlier opening/vehicle checks and deterministic fixtures are not relabelled as complete manual playthroughs. Connected progression and human campaign-preparation acceptance remain separate gates. The transient white-page observation stays deferred by the user's instruction.

Evidence is preserved in `reference/playtest_replays/manual_followup_2026_10_12/`: M3 patrol-prefix/terminal replays, terminal AAR/roster/scouted battlefield, M4 first-attempt/terminal replays, terminal AAR/roster and the offline validation summary. Reproduce the exported-run audit with `node scripts/auditManualFollowup.js`. Both terminal exports and all earlier-attempt prefixes replay exactly; public AARs and committed browser rosters match, recovery reconstructs the full state, prior starts remain immutable, person identities remain stable, and duplicate/stale debriefs reject. Transition checks retain terrain/cover/mines, existing contacts, known enemy identity/positions and reward keys while allowing the published pin reset, P/L removal and patrol-point expiration. Actual M3 export import and separate company identities also pass. Focused presentation/resolution regression run: eight files, 51 tests pass. Production build passes with the existing chunk-size warning; `git diff --check` passes. No new full regression sweep is claimed.

## Approved navigation, signals and mission-clarity pass — October 12, 2026

Implemented the user's approved focused pass. This closes the earlier optional historical-selector and live objective-timing presentation refinements; it does not change the victory rules or claim another source audit. Normal startup mounts Home without creating or saving a placeholder Company Assault mission. Campaign opens the existing fresh M1 company/debrief/preparation workflow even when no tactical mission is active. Missions contains the standalone catalog, previews, explicit Start and the independently named infantry/Vire/Tinchebray recovery slots. Briefing replaces the old current-Mission menu. Opening navigation or previews preserves the current tactical run; explicit Start/Resume remains the point at which the active session changes.

Briefing now has an expanded signal table using the public assigned plan and actual friendly inventory: readable device/effect names, current carriers and quantities, recoverable ground stock, transport stock and remaining totals. Confirmed deployment is distinguished from unavailable stock. Setup and command labels share objective/phase-line destination wording. Night patrols explain that colored smoke stock is unavailable for signaling at night. No assignments or execution rules changed.

Offensive Briefing and turn notices show current objective statuses and the last public row-clear assessment with its turn. A new attempt has no assessment until its first check; repeated turn numbers cannot reuse a preceding attempt's result. Final-turn success timing is stated explicitly. Patrols retain route/objective/MLR-return requirements. No hidden blocker or per-card clearance list is projected.

The optional Settings history filter defaults off and is saved with presentation. Pinned, degraded and surviving embarked formations remain in the live selector. Roster can select a reserve/historical formation with the filter off. Historical loss silhouettes follow the filter while an explicitly selected loss remains inspectable. Reserve and embarked records receive neutral status/restriction explanations rather than eliminated-HQ reconstitution advice. Fresh mission switching clears stale vehicle selections/routes; initial force centering now runs after the map controls are bound.

### Focused browser evidence

Used an isolated in-app browser at `http://127.0.0.1:5176/`; the user's existing browser saves and the earlier localhost:5175 manual-run evidence were not replaced. These are integration checks, not full first-player playthroughs.

| Check | Observed result |
| --- | --- |
| Fresh normal startup | Home, Campaign and Missions; no active tactical mission or default save. |
| Campaign stages | Fresh company → custom-signal M1 setup → terminal abort/debrief → preparation → Close/Home/reload → resumed preparation → prepared summary. Later connected launch remains gated. This used an abort to exercise navigation, not a successful new campaign playthrough. |
| Standalone selection/recovery | Normal Company Assault, Cerisy, St. Georges, Vire and Tinchebray selection; infantry, campaign, M6 and M7 saves listed with actual mission names. Both vehicle families resumed after reload; abort/recovery and explicit restart exercised without URL flags. Default vehicles and the optional Jeep setup checked. |
| Home during pending decisions | Company Assault contact result and unresolved combat panel unchanged after Home/return. Cerisy seed `navigation-battalion-30`, using ordinary phase stepping and orders, produced a real battalion choice: selections `r2c1`/`r2c3` survived Home/return and reload, advancement stayed blocked, and explicit confirmation resumed the impulse. |
| Signal stock | Custom M1 RSP objective assignment displayed in Briefing. Live Cerisy RSP deployment displayed confirmed expenditure/zero stock; dropping RSC displayed ground stock/recovery requirement. Vire's RSP assigned to the embarked artillery observer displayed one device aboard transport. |
| History and camera | St. Georges reserve HQs absent from the ordinary selector; Roster opened HQ2 with the filter off. Enabling history revealed reserve records. HQ2 selection and the checkbox survived reload; 80% zoom and camera offsets survived Home/return. Opening and cancelling Vire preview retained M3's selected HQ, phase and camera. |
| Layout/keyboard | Desktop start screen and Briefing table visually checked. At 390×844, Home cards stack, Briefing stays within the viewport, and the table scrolls within its container. Enter opens Missions; Escape dismisses Briefing. Existing independent map/command-panel scrolling retained. |

### Automated evidence and remaining boundaries

- Full regression sweep: **126 files / 1,824 tests pass**. The first sweep timed out only on the long combat-bearing three-attempt M7 fixture; its per-test bound was raised to 240 seconds. All assertions remain. Its isolated replay/recovery run passed, and the subsequent full sweep passed.
- Focused projection/navigation checks cover missing/corrupt/incompatible originals, mismatched recovery checkpoints, disabled invalid resumes, read-only save discovery, campaign/company association, all independent slots, real signal expenditure → reattempt replenishment → exact replay/save/reload, transferred/dropped/unavailable/transported stock, night availability, public assessment boundaries, surviving embarked formations and historical inspection. Form-draft fixtures cover battalion/guard/passenger choices, context boundaries and malformed optional historical presentation. Session routing is explicit: standalone File actions do not depend on a readable campaign record. Backup keys stay tied to the selected slot even without a readable latest record; the live Vire backup download was verified as `normandy_6`.
- `node scripts/auditManualFollowup.js` rerun: the earlier complete M3 patrols and M4 reattempt still have exact replays, public AARs, recovered states, immutable starts and browser debrief rosters; duplicate/stale transactions still reject.
- Production build passes with the existing bundle-size warning. Tactical rules remain **35**; replay and storage schemas are unchanged. New reference information and form drafts are presentation/player-view fields only.
- Final presentation refinements: eight focused files / **40 tests pass**, including neutral reserve/transport inspection, pending-form drafts and the new reference projections. `git diff --check` passes. Start-screen screenshot: [Home](../tmp/usability_2026_10_12/home.jpg). Fresh Vire start visibly centers Company HQ in staging (camera top 1755), after the controls are bound.

Corrupt/incompatible save cases and guard draft restoration have automated fixture coverage; they are not claimed as additional live fault-injection or prisoner-capture playthroughs. The broader fresh standalone M1/manual M5–M7 review gaps recorded above remain separate from this pass. Human campaign-preparation acceptance and required battlefield carryover remain gates for connected progression. Larger vehicle work, 3D/audio, card-pull experiments and the transient blank-page investigation remain deferred in `FOR_LATER.md`.
