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


### Connected campaign gates — October 12 follow-up

Preparation review accepted by the user. Implemented an explicit ?campaignDev=1 Standard campaign candidate, connected mission setup/recovery dispatch and an immutable committed-start fallback for failed tactical writes. Fresh M1 launch, Home/reload and campaign resume checked on isolated origin 5177; missing preview import found in the browser and corrected. Seven orchestration fixtures pass, including synthetic M1→M2 identity preservation and vehicle replay version rejection. Source §12.8 prevents offensive defeat/abort from advancing while allowing patrol defeat.

This closes preparation acceptance and implements the launch UI candidate; it does not close the complete seven-mission connected-play validation gate. Existing standalone acceptance remains intact, normal connected launch beyond M1 stays gated, and broader manual playthrough gaps remain as previously recorded. See CAMPAIGN_COMPANY_READINESS.md for boundaries and evidence.


Final checks: 127 files / 1,832 tests pass; final focused checks: 3 files / 20 tests pass. Windows emitted a fork shutdown warning; the affected mortar fixture separately passed all five cases in a thread pool. Recorded M3/M4 manual runs again reproduce exact replay/AAR/roster/debrief results. Production build and diff checks pass; bundle-size warning unchanged.


### XP award notifications — October 12

Campaign and standalone tactical saves now show queued, dismissible XP cards with the recorded amount, task and recipient pool. Public grenade events identify the acting formation; other company awards remain labelled Company rather than fabricating individual step experience. Patrol awards identify the patrolling platoon. Cards float above the battlefield, expire after eight seconds, and do not advance phases or resize the map. Restored checkpoints initialize the notification cursor from existing awards, preventing historical awards from replaying on reload; unique award keys suppress repeats across reattempts. Offensive location awards remain at their existing final assessment timing. No tactical scoring or rules version changes. Three focused presentation fixtures and production build pass; no new full campaign-play claim.


### Reported live M1 friendly-fire bug — October 12

Edge playtest, turn 3/Pinned recovery: enemy HMG appeared at 3.5; the .50-cal HMG at 1.3 acquired legal overhead fire, but colocated LMG/bazookas incorrectly inherited its PDF and fired into friendly 2.4. Reproduced from exported replay before modifying the engine. Corrected per-source path validation when joining existing fire; rules become 36. Original rules35 replay and frozen read-only engine preserve audit evidence. Diagnostic rules36 reproduction accepts every historical order and prevents the erroneous new friendly-fire paths; no live save is silently retagged. Source p.39 visually checked. Build and focused path/overhead/vehicle tests pass; original strict recovery rejection/export access remain intentional.


Validation: full sweep passed 1,832 checks; eight M4/M5 checks initially could not find rules36 recording files. Regenerated six new executions using the existing legal-order validation script, leaving previous recordings unchanged. The eight complete-run/recovery/debrief checks then passed. Aggregate: all 1,840 checks across 130 files accounted for, including current vehicle/reattempt and historical strict rejection. Original M1 rules35 export reproduces byte-equivalent JSON through the frozen audit engine. Original rules35 M5 preparation fixture now explicitly uses that reader and asserts current-engine rejection. Build and diff checks pass. Rules36 diagnostics are labelled comparisons, never live save conversions.


### Visible phase lines — October 12

Configured phase lines now render as labelled full-width separators between card rows using the patrol MLR styling. Labels follow the existing signal destination semantics: PL assigned Row N is crossed from Row N-1 into Row N (Row 0 is staging where present). Coincident phase lines and MLR share one separator rather than overlapping. Explicit grid placement preserves sparse/generated terrain columns and adjusts lower rows for inserted separators. Three focused layout cases and production build pass. Presentation only; no rules or replay version change.


### Card-pull comparison candidate — October 12

Approved separate Trévières experiment uses real shared Action Deck draws for NCM and HIT, with compact highlighted reveal cards. Separate scenario/resolver identity and company/tactical slots preserve normal mission behavior. Three full scripted two-attempt runs reproduce exactly, all DEFEAT under the existing policy; this is execution evidence, not balance acceptance. Browser selection/setup/start/reload and a labelled synthetic reveal fixture passed. Human comparative pacing/playthrough remains open. See CARD_PULL_COMPARISON.md for launch URL and boundaries.


### Live card-pull LOS check — October 12

Reported unspotted fire from 5.-1 Orchard through 4.0 Hedgerow and 3.1 Village into 2.2 Hedgerow/Hill. Edge inspection could not attach; the user exported a fresh replay, which was reproduced offline without changing it. Source and both intervening cards are level 1; target 2.2 is level 2. Both dark-border intermediates are therefore overlooked under reciprocal elevation LOS (third-edition p.35, visually verified), and the source can legally fire at distance three. No tactical defect found; hidden source identity was not disclosed. Added a focused reciprocal diagonal fixture with flat-target and insufficient-range controls; all 12 LOS tests pass. Original export and source-page evidence preserved in output/los-audit. No rules or replay change.
# Live CCP / objective investigation (2026-10-12)

The turn-nine card-pull M1 export is preserved in `output/ccp-objective-audit/original-rules36-replay.json`. The objective assessment was correct, but a non-firing contact lacked its unspotted-position marker. Rules 37 records the public position for every unresolved identification after contact placement, including non-firing packages; the marker follows movement and the map retains it alongside identified enemies. Enemy identity and strength remain concealed. Friendly units may also spend a Spot command to search their own terrain card without a prior firing report; empty searches spend their command and draws and do not declare clearance.

CCP relocation does not itself evacuate casualties already there: third-edition §5.1.7 requires transport and drop-off, followed by Cleanup. Casualty labels now distinguish transport still required from delivery awaiting Cleanup. No evacuation rule changed. The frozen rules-36 reader preserves exact historical export; current recovery continues to reject historical rules rather than migrate a live attempt silently.

Validation: 134-file regression sweep covered 1,855 checks. Five failures came from modules/fixtures loaded while the correction and current-rules recordings were still being completed; the affected suites subsequently passed against stable code and regenerated recordings. Focused six-suite check: 182 passed. Complete Hill 192 and St. Germain replay/recovery/preparation suites plus the live-export audit: nine passed. The audit also verifies exact current-rules replay and original rules36 export. Production build passed with the existing bundle-size warning; diff whitespace check passed. No fresh browser playthrough was performed for this follow-up, and the user's existing Edge attempt was not advanced or migrated.
## Normal card-pull release (2026-10-12)

User accepted the card-pull mechanics and directed promotion to normal play, dropping historical compatibility as a release requirement. Rules38 makes Action Deck NCM/HIT resolution the sole active company combat path across the normal mission catalog and campaign deployments. Normal infantry saves no longer risk being routed into the comparison slot. Recaps report actual cards rather than attempting to format a nonexistent numeric roll. Vehicles retain their AT/gunnery procedures; passenger and infantry NCM use cards. See CARD_PULL_COMPARISON.md for current validation, archived weighted-order checks and complete current runs. Combat-screen footprint remains a separate refinement.
## Public card-pull presentation — October 13, 2026

Implemented the approved automatic floating reveal. Public spotting, support, cover/infiltration/rally, grenades, command allowances, contact/HQ checks, random-number columns and vehicle procedures now carry structured field metadata. Initial and Exhort batches remain in order and retain every drawn card. The panel shows only the field used, the effective draw count, public calculations and actual outcomes; support details include expenditure/remaining missions. Combat shares the compact card-face renderer and retains its existing workflow without a duplicate automatic popup.

The panel is capped at 360px, floats above map controls, scrolls internally and adapts to the available battlefield height. Dismiss advances the queue; Replay reveal restarts presentation only. Briefing contains readable current-turn history scoped to the current attempt/patrol. Home and recovery suppress old automatic notifications. Fixed command allowances are explained without invented cards. Hidden draws and outcomes are excluded even from unfiltered input; unidentified public attackers do not expose private formation modifiers. No rules-version change, command/phase delay, deck change or storage migration was introduced.

Validation: the full regression run passed 1,864 checks across 133 files, with the 10 previously archived weighted-run checks skipped. After final metadata/layout refinements, six focused suites passed 157 checks and the final reveal/combat suites passed 40 checks, including an additional unidentified-attacker privacy fixture. Production build passed with the existing bundle-size warning. Logs: `output/card-draw-regression.txt` and `output/card-draw-focused.txt`.

Browser evidence used an isolated origin, leaving the user's live saves untouched. Normal Company Assault activation revealed Card 4 / printed activation 5 / actual six commands. Real save recovery returned to the same activation phase with no popup; Briefing retained its history and keyboard Replay reveal worked. At desktop width, the panel was 360px wide, entirely inside the 503px battlefield and separated from map controls by 12px. At 400px width, it was 359px wide, inside the battlefield and separated by 18px. Synthetic production-controller checks covered spotting, short-round artillery, rapid FIFO/dismissal, presentation recovery and XP placement at desktop/narrow widths. Reduced-motion behavior is provided by the media rule and timer preference check; no OS accessibility preference was changed. Screenshots: `output/public-card-pulls/normal-activation.png` and `narrow-activation.png`.
## Spot eligibility correction — October 13, 2026

User reported all four Row-1 assault teams offering Spot on potential-contact-only cards. The unconditional own-card search introduced in rules37 was incorrect. Third-edition §8.5, p.65 requires a unit on the map and LOS to an actual unspotted enemy. Rules39 removes the unconditional target and rejects empty/PC-only cards before consuming commands or draws. Spot also excludes Staging Area recipients, spotted/removed enemies and positions outside LOS. The non-firing unspotted-position marker correction remains: genuine same-card targets are eligible, with the normal +1 modifier. A Spot attempt does not evaluate a PC marker. The spotting dialog and objective reference no longer advertise blind own-card searches.

Focused validation covers four Vire assault teams on four unresolved Row-1 contacts, command/deck preservation on rejection, valid same-card spotting, PC-marker preservation, spotted/removed/remote targets and staging. The initial six-suite check passed 55 tests; the final eligibility fixtures passed four. A fresh normal M1 run (`spot-correction-39`) ended in successful attempt two after a failed first attempt, using 126 legal orders. Exact replay/export and save/recovery pass. Artifact: `output/company-playtests/spot-correction-39-normandy.json`; logs: `output/spot-correction-run.txt` and `spot-correction-replay-check.txt`. Rules38 complete-run recordings containing the retired command are archived, not converted. Build passed with the existing bundle-size warning. No live user mission was advanced, refunded or altered.

Broad regression: 1,865 checks passed and 13 archived checks were skipped. One existing vehicle fixture exposed an overly restrictive guard in the shared spotting executor; it has an actual enemy in LOS but no authored marker because it constructs the enemy directly. The executor now requires the actual target, while player command eligibility separately requires a current public position. The corrected vehicle/eligibility suites passed all 14 checks; the current M1 replay/recovery check also passed. No historical compatibility reader was added.
## Campaign M1 player feedback — October 13, 2026

User completed M1 through the campaign flow and reports that post-mission preparation functions correctly. Normal onward launch is still intentionally gated: connected orchestration exists as a development candidate, but complete connected advancement/carryover and later-mission recovery validation remain open. This feedback reconfirms preparation acceptance; it does not constitute a completed seven-mission connected run. The XP-spending screen is reported as text-heavy. Next usability refinement should emphasize the current preparation step, remaining points, chosen changes and next action, with rules explanations/details expandable, while preserving legality and transaction behavior. No live save was inspected or changed for this feedback.
# Connected campaign validation — 2026-10-13

User requested validation after accepting M1 preparation. Ran fresh-company M1 → persisted preparation → connected M2, plus a separate controlled seven-mission transaction fixture.

Actual M1 succeeds on attempt 2 (126 orders). Transfers retain surviving step/person identities; a Veteran return, six Green replacements and two Auto Spot skills reach M2. Every preparation operation survives save/reload, prior snapshots remain immutable, and standalone saves are unchanged. The public-view M2 policy loses both attempts (122 orders); exact replay and recovery agree, and Standard progression stops correctly. This automated preparation leaves six survivors unassigned and should not be represented as optimal play.

The controlled transaction fixture passes all seven handoffs, terrain ownership into Hill 192, vehicle crew replenishment and completion without an eighth mission. Offensive outcomes are synthetic, while three stationary patrols are phase-stepped for each patrol mission; it validates orchestration rather than campaign victory. Existing focused campaign fixtures pass 84 checks, plus the new sequence check.

Browser candidate on isolated origin: actual prepared M1 company opens Cerisy setup, starts M2, then Home/reload/Resume returns to turn 1 / phase 3.1. Screenshot in `output/connected-campaign/m2-browser-resume.png`. Normal connected launch remains gated pending later live checks and broader connected tactical execution. No change to preparation layout in this validation pass.

Final broad regression: **1,868 passed, 13 skipped**, no failures; production build passes. Detailed output: `output/connected-campaign/regression-39.txt`.

# Later live handoffs and normal campaign release — October 13, 2026

Completed M3–M7 prepared-company setup, Start, Home, reload and named campaign Resume in the real browser application on isolated port 5181. Repeated all five after removing the development gate at the normal `/` URL. All restore turn 1 / phase 3.1. Inputs are explicitly controlled transaction fixtures with synthetic offensive completions; these are not claimed as winning tactical runs. Actual M1/M2 tactical results remain unchanged.

Caught and fixed: Hill 192 setup label CSS could override the `hidden` source/import controls. Both are now hidden and disabled in locked campaign setup. The M3 source and recovered terrain stay bound to company history; standalone import remains available. Also removed a stale terrain tooltip saying vehicles were deferred.

Vire browser run enabled the optional Jeep and changed Sherman HQ to Staging 2; Tinchebray changed M10 HQ to Staging 3. Both resumed correctly and exposed their normal vehicle panels. Export checks confirm persistent company people, ten fresh Sherman crew steps, eight fresh M10 crew steps, retired Sherman ownership and exact checkpoint recovery. Screenshots and reports are under `output/connected-campaign/`.

Connected Standard campaign progression is now available normally. Offensive defeat/abort still ends it; patrol defeat may continue; no eighth mission is offered. Existing standalone companies are untouched, no individual casualty outcomes were invented, and no tactical/schema version changed. Focused release checks: 89 pass; production build passes. Text-heavy preparation remains on the later usability backlog.

Additional live checks: M7 phase 3.2.1 survives reload, committed-start recovery returns to 3.1, and the controlled completed record shows a terminal summary with no next-mission button.

Final release regression: **1,868 passed / 13 skipped**, no test failures, exit 0. Windows worker shutdown emitted `EPERM` for St. Germain release; its isolated rerun passed three tests and exited cleanly. Normal terminal summary → fresh published company → M1 setup/start/reload also passed. Browser tabs/server used for validation were closed; the user's original browser origin and saves were untouched.
# Campaign command desk and reattempt pass — October 14, 2026

Implemented the approved battalion-desk workspace: full-screen paper presentation, persistent personnel roster, explicit debrief recording, Reorganize & promote → Replacements → Skills → Ready, signed transfer previews and readable formation/step promotion labels. Committed company changes remain resumable through the existing revision-checked transactions. Setup and reattempt preparation share the public deployment map and consolidated equipment roster; no concealed enemy data is added.

Reattempt donor choices immediately update recipient strength, capacity, deployment, promotion ownership/prices, skills and remaining XP. The projection preserves a donated Green step's price before combined formation experience is recalculated. Restored HQ steps cannot receive spare-point promotions. Vehicle riders are projected as dismounted for preparation without changing the live mission; the existing reducer remains the final authority. Beginning an attempt resets the camera and selects a surviving HQ. Terrain, contacts and enemies remain intact. Clearance assessments remain end-of-attempt awards, distinct from immediate awards.

Live browser validation on isolated port 5183 used actual current M1/M2 recordings: successful M1 → debrief → two-step transfer → promotion → Veteran/Green replacements → Auto Spot → Ready → connected M2. A failed M2 first attempt then received three donor assignments (including rebuilt Company HQ), a transferred-step promotion and attempt-two launch. Exact current replay, checkpoint recovery and AAR comparisons pass (`output/command-desk/live-reattempt-check.json`). These are workflow checks using recorded tactical outcomes, not a new complete winning campaign.

Separate controlled fixtures exercised next-patrol preparation/start and a Vire reattempt with an embarked rifle squad; both leave their source state untouched until Begin. Company and reattempt layouts fit a 400px viewport without horizontal page overflow. Tab wrapping, Escape, public-map selection and desktop layout were checked. Screenshot: `output/command-desk/company-reorganization.png`.

Obsolete `#aar` is cleared independently on tactical start/recovery/reattempt while query flags remain. The reported missing imagery did not reproduce: inspected counter and cover sprites loaded with nonzero dimensions. No speculative asset fix or claim of a resolved image root cause is made. The broader blank-page investigation remains deferred. Focused tests cover projection legality, raw step pricing, duplicate/capacity restrictions, surviving-HQ selection, URL handling, public-map concealment and embarked riders. Production build passes with the existing bundle-size warning. No tactical rules version, campaign schema or preparation API changed in this pass.

Validation closeout: 1,874 passed / 13 skipped across 139 files (136 passing, three skipped); output/command-desk/final-regression.txt. Windows worker shutdown warnings affected mortar, transport and contact files after their passing results; their isolated rerun passed all 14 checks and exited cleanly. Final command-desk fixtures passed six checks, production build passed, and whitespace validation passed. The existing bundle-size warning remains.

## Tactical clarity and factual AAR pass — October 14, 2026

Implemented the next approved milestone: readable orders/terrain text, a visible casualty-carrier badge on friendly counters, and casualty counts in the selected formation inventory. Current higher-HQ obligations/effects have a compact reference above the battlefield. Its expanded body overlays rather than displacing the map; public visitor/counterattack effects persist for their published duration, and completed tasks are labelled. No hidden enemy procedures are displayed.

Public draw notifications now offer Keep open / Resume timer and a queued-pull count. Advancing the display preserves keyboard focus and does not resolve another action. Automatic reveals remain the default. Combat buttons explicitly distinguish reviewing the next formation from resolving it immediately; the final result uses Finish combat review, and cleanup remains a separate phase step. Existing reciprocal resolution operations and draw order are unchanged.

The factual on-screen AAR now separates latest/earlier objective assessments, observed losses, formation changes, experience awards and orders. Recorded attempt/patrol boundaries label repeated turn numbers. Export data remains unchanged; no narrative or individual wound/death outcomes are invented.

Browser evidence on isolated port 5184: normal Home → standalone Company Assault start; actual production draw metadata fixture with held artillery results, another queued action and Next pull; actual card-pull reciprocal combat fixture through both results; public HQ/casualty/AAR fixture on desktop and at 400px. The narrow report and expanded HQ drawer remain within the viewport. These controlled presentation checks are not new full tactical playthroughs. Screenshot: output/tactical-clarity/desktop.png. The user's existing origin/saves were not used. Focused presentation/queue/exchange tests and the current card-pull run tests pass. No simulation reducer, storage schema or rules version was changed.

Validation closeout: full regression **1,882 passed / 13 archived checks skipped**, 137 passing files / three skipped, exit 0 (output/tactical-clarity-regression.txt). Windows worker shutdown warnings appeared after passing results in four files; isolated reruns cover those files. Final focused rendering/draw/exchange checks passed 19 tests; the final AAR assessment refinement passed all five clarity tests. The broad run includes current rules39 exact M1 replay/recovery. Production build and whitespace checks pass; the existing bundle-size warning remains. Home/return also suppresses held old draw notifications.

### Higher HQ header correction — October 14, 2026

User feedback supersedes the separate ribbon: Higher HQ now occupies the existing header space immediately left of previous/current/next phase labels. Its event panel uses the shared menu controller with explicit Close, Escape/focus return, outside-click dismissal and mutual exclusion with other menus. The old battlefield ribbon is removed. Browser checks confirm identical command-strip position when opened/closed and a 400px layout with HQ left of phases and the panel inside the viewport (right edge392px). Screenshot: output/tactical-clarity/header-hq.png. No tactical state/storage changes.

### Mission result ribbon correction — October 14, 2026

Review AAR is now a normal button. It scrolls/focuses the report beneath the fixed header without adding a URL fragment. The result ribbon lives inside the battlefield column, so the right-hand orders menu starts alongside it and is not covered or pushed down. Verified against the actual successful M1 record on isolated port5183: ribbon right919px, menu left927px (the normal8px column gap); report focus/position and unchanged empty fragment confirmed. Screenshot: output/tactical-clarity/result-ribbon.png. Existing focused presentation checks pass20 tests; production build passes.

### Prepared skills on patrol reserves — October 14, 2026

User's M2→M3 Ready screen rejected a First Sergeant carrying Auto Infiltrate and two Auto Cover skills. Three skills are legal; the failure occurred when patrol deployment marked the holder RESERVE and initial skill installation reused the live-purchase validator. Immutable prepared deployment now explicitly permits surviving reserve holders. Normal purchases still reject off-map holders; skillOptions still prevents reserve skill use; missing/zero-strength/eliminated/foreign holders and the three-skill/physical-counter limits remain checked. No saved choices are discarded or rewritten. Reloading and retrying Setup uses the committed preparation record.

Regression recreates the displayed eight-skill allocation across Company HQ, First Sergeant and platoon HQs, initializes M3 with staff/HQ2 in reserve, confirms dormant skills, exact replay and unchanged company preparation. Campaign preparation/skill suites pass86 tests. Production build passes. No tactical rules/schema version change: this corrects an otherwise impossible prepared mission start.

### Setup paper styling correction — October 14, 2026

The sticky desk header now extends through the scroll container's padded top/edges with an opaque paper background, eliminating the strip of scrolling controls above it. Equipment limits/remaining overrides the legacy green tactical summary: paper background, dark text/headings/totals and matching table rules; red over-limit feedback remains distinct. Browser-checked normal M3 setup after scrolling and at400px: header top0 with full available width, dark rgb(48,45,36) text on rgb(255,248,231). Screenshot: output/tactical-clarity/setup-paper.png. CSS-only change; production build passed.

## Patrol HQ reconstitution correction — October 15, 2026

User found M3 company staff offering to reconstitute intact, non-patrolling HQ2/HQ3. The target builder used !live, which incorrectly includes reserves. Rules third edition p49 §6.5.2A permits restoring a removed platoon HQ from eligible good-order platoon steps or company staff; an unselected reserve is not removed from play. Target construction and command validation now share the requirement for zero surviving counter steps, exclude reserve/embarked/guard status, and restrict platoon HQ targets to the current patrol platoon. Company HQ succession remains separate and unchanged. No paid command, donor step or draw is consumed by rejected targets.

Tests cover M3 and M5 with each patrol platoon1/2/3: intact reserves, eliminated non-patrol HQs, actual eliminated patrol HQs, menu availability, direct submission rejection with unchanged source state, donor identity/conservation, Green restoration, surviving Fire Team sides, and zero-step reserve/embarked/guard counters. Production build passes. No live save was edited and no historical replay migration was attempted.
Validation closeout: nine focused reconstitution/patrol/current-replay files passed 162 tests; three archived rules38 checks skipped. Current rules39 M1 exact replay/recovery and production build pass.

## Old card-pull queue on patrol AAR — October 15, 2026

User reported59 queued old pulls after an M3 patrol. Notification identity incorrectly included completed patrol count, which changes on PATROL_ENDED before a new patrol is prepared. Identity now changes only for mission/attempt, not terminal history length. Receipt tracking also compares only public sequence numbers: recovery priming with a hidden trailing event previously looked like a rewind when the next render supplied public events. Unknown identities/actual rewinds seed existing history instead of queueing it. Review AAR explicitly clears pending reveals and primes public receipts; recorded draws remain available through Briefing/manual Replay reveal.

Regression covers60 historical pulls, completion and AAR-style priming, hidden recovery tails, new batches, identity changes and actual rewinds. Three suites passed13 checks / three archived rules38 checks skipped, including current exact M1 replay/recovery. Production build and whitespace checks pass. Presentation only; no tactical cards, randomness, commands or replay records change.

## Compact patrol preparation — October 15, 2026

Replaced the spacious preparation layout with a bounded desk: narrow dense roster, XP/assigned-team metrics and section tabs in the header, compact multi-column promotions beside visible retained skills and purchases. Existing held skills reduce the displayed purchase slots; rule prose moves into secondary details, and pale inherited summary colours are overridden. No donor/skill/promotion input identities or preparation reducers change. Deployment edits one roster-selected formation alongside the public map and patrol controls; supply transfers use a compact grid. Section changes preserve the single draft; selecting a formation during promotions no longer jumps into Deployment.

At1920×900 the complete26-formation controlled roster fits (648px content/648px viewport), all promotion/skill choices fit, and Deployment fits (605px content). No page/panel scroll is required for the primary controls at that size. At1280×720 promotions/skills remain together with no action-panel/page scroll; the complete company roster has its own constrained scroll region. Narrow400px uses stacked panels without horizontal overflow. Expanded optional rules and smaller viewports may scroll rather than hide controls. Screenshot: output/tactical-clarity/patrol-compact.png.

Browser checks: eight retained skills, promotion updating remaining XP, section-switch draft retention, next-patrol start with original mission unchanged; shared Vire reattempt with three dismounted rifle steps also starts with original unchanged. Escape closes on narrow layout. Four preparation/projection suites pass36 tests; production build passes. Controlled fixture evidence is not another full tactical patrol run.

## Standalone preparation screen — October 15, 2026

Patrol/reattempt preparation now replaces the tactical application view instead of being appended above the map. Entering captures the tactical form draft, camera and orders scroll, persists the existing mission recovery, disconnects tactical observers/listeners and removes battlefield DOM. Preparation is a normal-flow page region with document scrolling suppressed; only actual preparation content scrolls. Return to battlefield/Escape reconstructs the unchanged tactical view and restores page position/focus. Begin validates through the same preparation reducer before switching back to the new patrol/attempt. Terrain/contact/enemy carryover is unchanged; no map is regenerated by navigation.

Normal-application browser check on isolated5183: restored a legally phase-stepped completed M3 patrol, selectedHQ1 at80% zoom / mapTop300; preparation had zero battlefield nodes, relative page positioning, body overflow hidden and720px document/viewport heights. Return restoredHQ1,80%,mapTop300 and removed the scroll lock. Reopened preparation → Review → Begin reached patrol2 turn1 withHQ2 on the retained battlefield. Screenshot: output/tactical-clarity/patrol-page.png. The test origin's fixture save was used; user-origin saves were untouched. Production build passes; rules/storage APIs unchanged.
Validation closeout: six focused preparation/projection/navigation/draft suites passed all44 tests; production build and whitespace check pass.

### Projected deployment Location column — October 15, 2026

Deployment adds Location as the fourth projected-roster column, using current draft choices and public terrain labels (Reserve / Not deployed / OUTPOST included). Widened that roster at desktop sizes and reduced deployment/patrol controls to240px maximum, phase lines to200px. Dropdown titles retain the full selected option text. Other preparation sections retain their compact three-column roster.

Controlled browser checks: HQ2 dropdown → Row1.1 and map → Row1.3 update the Location cell immediately; XO Reserve → COP shows its public card label and OUTPOST; section switching preserves choices; Begin patrol2 passes with original mission unchanged. At400px there is no horizontal page overflow (385px content/385px container). Screenshot: output/tactical-clarity/deployment-locations.png. Production build passes; no simulation changes.
## Patrol skill recipients and reserve holders — October 15, 2026

Corrected the reported next-patrol rejection after buying Auto Spot for the resting 1 Platoon HQ. The transition applied reserve deployment before skill validation and rejected that otherwise surviving holder. Both draft projection and committed patrol preparation now accept surviving reserve HQ/staff. The skill menu lists every surviving Company HQ, company staff and Platoon HQ with remaining skill capacity, rather than only the completed patrol HQ. Reserve skills remain dormant until their holder returns to play; retained skills still count toward the three-marker limit and physical counter supply.

Source check: third-edition p81 §12.3.1 limits patrol promotions to participants; p82 §12.7 permits allocation to PLT HQ, CO Staff and CO HQ without that participant restriction. Normandy p26 M3 MSR1 and p34 M5 MSR1 require inter-patrol preparation and retain purchased skills. Promotion restrictions and the completed patrol's XP pool remain unchanged. This corrects next-patrol preparation separately from the earlier initial-deployment reserve-skill fix.

Validation: the initial five-file focused run passed63 tests; the final patrol allocation suite passed18 tests, including all six holder roles in M3/M5, reserve dormancy, lost holders, three-skill limits, nonparticipant promotion rejection, immutable source state, future HQ3 skill use on patrol3, and exact replay/checkpoint recovery. Production build and whitespace checks pass. Browser fixture with eight retained skills offered XO/HQ1/HQ2/HQ3 purchase controls (CO/First Sergeant already full); buying Auto Spot for resting HQ1 then Begin successfully started patrol2 with the original mission unchanged. All four purchase cards fit at1440×900. Screenshot: output/tactical-clarity/patrol-skill-holders.png. User-origin saves were untouched; no tactical storage/rules version changed.
## Assault/Fire Team pyrotechnics — October 15, 2026

User found an unpinned Assault Team carrying HC smoke unable to deploy it during General Initiative. Source check: third-edition p22 §4.2.1c explicitly allows Good Order units and unpinned Assault/Fire Teams; p20 General Initiative removes the ordinary HQ/communication requirement for this action. P30–31 §4.4 covers screening, signals and illumination under the same deployment action. Screening HC/WP and handheld illumination incorrectly required Good Order while signal deployment already accepted these LATs. Shared eligibility now accepts unpinned A/F teams for all these deployment paths; offensive WP grenade attacks retain their separate attack rules. Pinned, Litter and Paralyzed teams remain ineligible.

Four focused suites pass46 tests covering A/F deployments through the menu and reducer, one-command/asset expenditure without a card draw, screening/light effects, invalid-recipient rejection and immutable source state, plus existing M3/M5 illumination and WP checks. Production build passes. No user save was changed.

## Clear Higher HQ event notifications — October 15, 2026

Shared segment notifications now distinguish Friendly/Enemy Higher HQ Events, put the readable event name prominently below the window header, show a short description followed by a separate Result section, and keep longer explanations in expandable Event details. Patrol/attempt and turn are secondary header context. Public result text is shown once without repeated location/path suffixes. Enemy events without public unit results explicitly retain concealment rather than inventing a visible outcome. The shared rendering applies across mission catalogs; tactical event generation, hidden filtering and phase stepping are unchanged.

Five existing event/presentation suites passed141 tests; three new presentation checks cover hierarchy, public result separation, escaping and headings for all current event codes. Production build passes. Isolated browser checks verified friendly Lost in the Dark and enemy Rally, desktop and400px layouts, expanded details and keyboard Continue. Screenshot: output/tactical-clarity/hq-event-clean.png. User-origin saves were untouched.

## Assault Team ranged fire from inherited ammunition state — October 15, 2026

User-provided campaign-original-save.json reproduced A91 at3.4 firing at4.3: cohesion A, printed range0, out_of_ammo true inherited from its parent. rangeOf checked ammunition fallback before Assault Team range, incorrectly granting Close range. Assault range now takes precedence; depleted Good Order weapons and Fire Teams retain their Close-range fallback. Regression checks stale ranged fire removal and legal same-card automatic fire, with and without depleted ammunition. Four suites pass40 tests /3 archived checks skipped; production build passes.

The supplied latest replay contains512 operations. Corrected fire changes subsequent combat eligibility and rejects the old combat resolution at operation505. A separate recovery copy preserves operations1–504, before the affected resolution, and the valid original turn-start checkpoint. Its replay and checkpoint recovery match exactly under the fix; A91 has range0 and no off-card fire. Eight trailing operations must be resolved again. Original download remains byte-for-byte unchanged. Recovery copy: output/tactical-clarity/campaign-assault-range-recovery.json. No attempt was made to preserve the erroneous combat outcome or migrate historical replays.

### Active campaign Resume repair — October 15, 2026

Follow-up: the separate corrected export did not update the active browser recovery slot, so normal Resume still rejected original operation505. Campaign latest-checkpoint Resume now recognizes the specific combat-exposure mismatch, validates the deterministic prefix and presence of an affected surviving Assault Team carrying inherited depleted-ammunition state, validates the turn-start checkpoint, then atomically saves that prefix with the original record backed up. Other replay failures remain errors. Presentation clears obsolete combat/review IDs and explains the rewind. No hidden combat result is guessed and no old resolution is silently remapped to another formation.

Validated against the supplied512-operation M4 export using the real campaign recovery/storage adapters: original failure reproduced, prefix504 resumes, eight trailing operations rewound, previous-record backup created, second Resume exactly matches corrected state, and original disk file unchanged. Assault range/campaign progression suites pass10 tests; production build passes. This validation used isolated in-memory storage, not the user's active browser slot; refreshing and Resume applies the repair to that slot.

## Eliminated formation cover blocks reattempt — October 15, 2026

User reported Hill192 eliminated3/2 Rifle Squad (0/3, Not deployed) blocking Begin with a discovered-cover error. Hidden deployment controls still entered FormData with their retained cover value. Preparation now disables and omits deployment/cover fields for projected zero-step or consumed donor counters and excludes them from public map placements; returning donor steps re-enables actual deployment choices. Reducer also tolerates stale cover entries for known friendly zero-step/consumed/reserve counters after reconstitution. Unknown counters and invalid cover on deploying survivors still reject atomically; no eliminated formation is resurrected.

Five focused reattempt/desk/M3/M5 preparation suites passed39 tests; expanded regression suite then passed4 tests including the exact Hill192 eliminated3/2 case, zero-step stale cover, restored recipient cover validation and consumed donors. Production build and whitespace checks pass. Shared fix covers mission reattempt and patrol preparation; no user save was edited.

## Rifle grenade falsely blocked by same-card weapon state — October 15, 2026

User reported3/1 Rifle Squad carrying a rifle grenade unable to fire at the adjacent spotted enemy. Live Edge menu showed existing-PDF rejection. Exported current replay through File without issuing orders or advancing play. Exact M4 export reproduced s13 at3.1 firing normally at3.0; friendly Bazooka at2 retained fire targeting its own3.1 card. The ranged-grenade guard treated every occupied unit's stored fire target as a PDF and required all to equal the grenade target. Same-card fire has no PDF (§6.3); ranged grenades follow an existing PDF (§7.10.1). Validation now ignores same-card/stale nonfiring targets, accepts any established card direction, and compares direction rather than exact target distance. Real opposing PDF directions, range/LOS, point-blank combat and enclosed-cover restrictions remain enforced.

Four focused suites pass33 tests, including same-card weapon regression, multiple PDFs, wrong direction and differing distance along one direction. On an isolated copy of the exact live export, the rifle-grenade menu is available, firing at enemy93 succeeds and spends its asset, and the resulting replay reproduces exactly. Production build and whitespace check pass. No live tactical command was issued and no save was replaced.

## General Initiative Shift Fire used unrelated HQ LOS — October 15, 2026

User found Fire Team157 at3.1 unable to shift toward4.0 after enemy fallback, with Company HQ retained in the HQ-only issuer selector at3.2. Shift validation incorrectly used that selected HQ's LOS even in General Initiative. Third-edition p20 General Initiative and p21 action originator guidance make the acting formation its own originator for ordinary actions; p26 Shift Fire retains originator LOS. General Initiative now checks the firer's view; commanded impulses still check the issuing HQ. Split unavailable reasons distinguish missing fire, originator LOS, weapon range/arc and suspected positions. Generated column-zero cards are not filtered from fire targets.

Four focused suites pass59 tests, including3.1→4.0 General Initiative without HQ LOS, ordinary column2, real commanded-HQ LOS restriction with working radio communication, range limits, concealed targets and unchanged source state. Production build and whitespace check pass. Live Edge connection was unavailable for this follow-up, so this is a reproduced coordinate/command fixture, not a fresh inspection of the user's current state. No live commands or saves changed.

## Choose arrival cover with movement — October 16, 2026

Approved control added after Move/Infiltrate (including platoon variants) and a destination with eligible known cover are selected. Arrive at destination defaults to Outside additional cover; eligible cover labels include existing step counts and a brief crowding explanation. Choice is part of the original command. Platoon choice applies to its moving group and checks total capacity before any move. The public target metadata supplies available known cover; full/hostile/unknown cover is not offered. Engine validates explicit choices atomically, honors selected open/cover on successful or failed infiltration, and derives exposure from actual old/new fortifications. Old records without arrival_cover retain their deterministic prior automatic choice; new player movement commands explicitly record the choice. Automatic enemy/signal movement behavior is unchanged.

Three focused suites pass58 tests, including open/selected arrival, hidden/full/unknown rejection, group capacity, infiltration success/failure, command cost, source immutability and a real phase-stepped exact replay. Shared UI component browser fixture confirmed destination-dependent selector, chosen cover and open arrival both using one command. Screenshot: output/tactical-clarity/arrival-cover.png. Production build and whitespace check pass. User-origin saves were untouched; no full live campaign playthrough is claimed.

## Selective free item dropping — October 16, 2026

Approved inventory control: Choose items to drop expands quantity inputs for carried equipment, grouped radios/phones, tracked ammunition and individual carried casualties. Quantities default to zero; Drop selected items is enabled only for a valid positive selection. Existing Drop all remains. DROP_LOAD accepts an optional structured drop_items list, validates all types/quantities/ownership/duplicates before cloning or mutation, and leaves unselected stock intact. Ground assets retain original carrier provenance, card, cover and faction for ordinary recovery and resupply transfer. No command, exposure, draw or action allowance is spent; pinned/Litter/Paralyzed carriers can drop freely. Combat Effects fire remains frozen when dropping during that segment. Historical all-load removal and replay behavior remain unchanged.

Four focused suites pass42 tests; the final selective suite passes9 checks after adding recovered-line resupply conservation. Coverage includes CO partial phone-line drop with retained radios/signals, duplicate radio quantities, ammo, selected casualties, invalid-selection rollback, capacity relief, pickup by another holder, exact replay/checkpoint recovery and existing asset-loss behavior. Browser shared-inventory fixture dropped two lines, retained two communication devices and signals, and showed zero command/exposure cost. Final screenshot: output/tactical-clarity/selective-drop.png. Production build and whitespace checks pass. User-origin saves were untouched.

## EE8 connectivity code audit — October 16, 2026

User reported staying connected throughout M1 without manually placing phone lines. Traced setup conversion, carried assets, communicationChannels, phoneConnected, movement line laying, activation/order validation, damage and public display. Rules p28 §4.3.4 explicitly makes a field-phone counter a line junction, permits a continuous string of phones/line markers and lays carried line markers automatically when a unit leaves a card. Code connects adjacent phone/line nodes (including diagonals), treats staging as integrated wire and requires both endpoints to connect to the Company HQ phone. Same-card matching-cover voice is a separate channel. Thus no manual Drop items action is required, and nearby phone-bearing formations can move together without any line marker. A dropped EQUIPMENT phone_line asset is a recoverable spool, not a laid line node.

New audit fixtures plus existing phone/selective-drop suites pass25 tests. They prove an unwired empty-card gap breaks contact and activation; adjacent phone chains work without line counters; removing a bridging phone breaks the chain; two platoon phones cannot bypass a disconnected Company HQ hub; intact wire restores a gap and cut wire removes it; dropped spools do not bridge; local voice remains separate; pinned/covered phone users work; and movement places a line on the departure card, consumes an asset, and does not consume one leaving staging. No tactical implementation change was needed for these cases. This audits code/controlled cases, not the exact user's M1 run: no current M1 replay was supplied. Presentation gap: map cards do not display wire markers; existing UI shows aggregate intact/cut counts and abstract command links, making automatic wiring easy to miss.

## Visible phone wire and lost-contact notifications — October 16, 2026

Approved phone usability addition: laid line cards display a small wire graphic with Intact/Cut and Last known condition labels. Cut wire has a crossed-wire graphic and text, not color alone. Aggregate counts now use the same public condition projection. Previously raw phone_lines.cut exposed concealed cuts; presentation now derives out-of-sight condition from public line events scoped to the attempt, or direct friendly Good Order observation. Hidden cut location/cause remains concealed; dropped spools remain inventory assets rather than laid-wire markers.

Accepted state transitions compare before/after public field-phone command links. Losing an established phone link produces one grouped, dismissible12-second battlefield notification listing affected surviving formations, noting retained local voice. Public new cut events may supply a card name; otherwise the alert reports loss without inventing a break location/cause. An alternate phone path prevents a false loss alert. Notifications occupy the upper-right battlefield area, leaving bottom card pulls, XP toasts and orders layout independent. Resume/replacement/Home/preparation/AAR reset pending alerts; renders and initial disconnected states do not generate new ones. Added presentation identity/attempt fields do not change tactical state or replay schema.

Five focused suites pass35 tests, including real phone damage resolution into public cut/lost-HQ feedback, hidden-cut projection equality, alternate routing, hub/gap legality, repair/attempt scoping, initial/repeated notification suppression and selective drops/recovery. Browser component fixture verified intact/cut wire, grouped notification and reset suppression; screenshot output/tactical-clarity/phone-wire-alert.png. Production build and whitespace checks pass. User-origin saves and live mission were untouched; this is component/engine validation, not another full phone campaign run.

### 2026-10-16 - Preparation typewriter typography

- Bundled the user-supplied Veteran Typewriter TTF locally, retaining its original license and adding source attribution. The included license permits personal and commercial use.
- Scoped the font to all beige command-desk screens: company preparation/debrief, mission setup, patrol preparation and mission reattempt. Headings, body copy, tables, location cells and form controls share the font; tactical-map typography remains unchanged.
- Browser checked the next-patrol roster and Promotions & skills panel at 1280 x 720. Checked a 400 x 800 viewport: the desk remains within the viewport and uses the existing stacked layout. Saved desktop evidence: output/tactical-clarity/command-desk-typewriter.png. Used an isolated test origin, without modifying the live campaign.
- Production build passed (existing large-bundle advisory only). No simulation or storage changes; no new simulation tests needed for this font-only change.

### 2026-10-16 - Mission setup preview clarity

- Rebuilt the preview header around mission background/conditions and explicit primary/secondary objectives. Removed Mission record and Deployment notes disclosures. Reduced header padding, bounded control widths and compacted the equipment roster with a sticky table header.
- Moved pyrotechnic assignments into an always-visible section directly below tactical controls, with a compact three-column table and readable dark text. Signal descriptions now reflect current objective and phase-line choices immediately. Opening the preview focuses its heading without jumping to the bottom.
- Unknown terrain labels now show card coordinates only. Public deployment maps have prominent objective badges and reuse tactical-map boundary placement; setup shows phase lines, patrol MLR, route points, outpost and concentration. Concealed terrain remains concealed.
- Browser checked Cerisy at desktop 1280 x 720 and 1920 x 1080; all eight signal rows are visible at the larger size. Changed objective/phase-line choices and successfully validated their retained selections and updated signal descriptions. Checked patrol MLR and route markers; checked 400 x 800 stacked layout with no horizontal overflow (385px content/client width). Keyboard Tab from the heading reaches mortar controls. Used isolated port 5184; live campaign storage untouched.
- 37 focused tests passed across five suites; production build passed with the existing large-bundle advisory. Screenshot: output/tactical-clarity/setup-preview-compact.png.

### 2026-10-16 - Company preparation section navigation

- Replaced the four passive progress rectangles with real section buttons whenever company preparation is editable. Mouse and keyboard can revisit Reorganize & promote, Replacements, Skills and Ready; the selected section retains its current-step indicator.
- Reopening Ready restores pre-finalization step experience, unspent points and replacement allowances while retaining committed transfers, promotions and skill purchases. Completion snapshots preserve these values for future records; existing Ready records reconstruct the snapshot from the exact recorded mission debrief and accepted preparation operations. Navigation saves through the existing revision-checked transaction, without adding another debrief or touching the tactical map.
- Retained one-promotion limits and replacement quotas across navigation. Added a replacement-step promotion guard and prevented transferring away the last step of a formation holding assigned skills.
- Browser checked an existing Ready record without a completion snapshot on isolated port 5185: Ready -> Skills restored 8 XP, assigning General Initiative left 6, all four sections remained accessible, Enter activated Ready, Skills restored the same 6 XP, and closing/reloading retained that state. Buttons wrap cleanly at 400px. User-origin campaign data untouched. Screenshot: output/tactical-clarity/company-preparation-navigation.png.
- 94 tests passed across navigation, preparation choices, campaign preparation/progression and command-desk suites. Production build passed with the existing bundle-size advisory; diff whitespace check passed.

### 2026-10-16 - Clear hidden promotion selections

- Collapsing or switching an expanded company formation clears that formation's selected steps. Checkbox updates derive selections from the visible roster controls, so hidden steps cannot silently keep a promotion disabled. Unassigned-survivor choices remain visible and available for transfers.
- A successful promotion clears its selected checkbox; rejected operations retain their selection for correction.
- Browser verified on isolated port 5185: selected Company HQ, collapsed it, selected XO and confirmed XO alone enabled promotion; promoted XO for 1 XP and observed zero checked steps; then selected XO and switched directly to 1 Platoon HQ, whose single selection again enabled promotion. Live campaign untouched. Evidence: output/tactical-clarity/promotion-selection.png.
- 13 focused preparation/navigation tests and production build passed (existing bundle-size advisory only).

### 2026-10-16 - Patrol preview objective labels

- Confirmed Normandy M3 patrols use one primary objective, four route points and the return across the MLR. The generic secondary/attack fields are internal aliases, not independent patrol setup choices.
- Removed the misleading Secondary Objective header and secondary/attack badges from patrol setup previews. The header now explains the return requirement; the COP remains labeled Outpost. Ordinary mission secondary-objective controls are unchanged.
- Browser checked changing patrol primary from 4.3 to 4.4: header and map both moved the primary marker, with no stale secondary marker. Preserved route/concentration/outpost markers and concealed terrain. Evidence: output/tactical-clarity/patrol-primary-objective.png.
- 11 focused tests and production build passed (existing bundle-size advisory only).

### 2026-10-17 - 60mm mortar section audit

- Compared the implementation against third-edition rules sections 4.2.4j and 7.3.2 (printed pp. 25, 53). H-rated multistep sections use automatic direct lay with their own LOS, or ordered indirect lay using an eligible communicating HQ observer's LOS. Indirect lay supersedes direct lay, places Heavy Weapons VOF without a PDF, applies target burst/appropriate terrain, and expires at cleanup. One-step G-rated teams instead use ordered grenade attempts for direct lay.
- Core distinction exists: INDIRECT sets u.indirect and clears u.fire; refresh projects -3 indirect VOF without a PDF; cleanup clears the order. SHIFT_FIRE changes the firing destination of friendly card occupants and clears their indirect orders. Three section steps do not create three separate Heavy Weapons attacks.
- Confirmed two unresolved validation defects with isolated in-memory reproduction: INDIRECT accepts a mortar with zero MTR ammunition/out_of_ammo and still projects -3; General Initiative accepts an eliminated, zero-step CO as observer. That phase bypasses the ordinary issuer chain/communication guard and INDIRECT only checks issuer existence/LOS. Also uses an unclear label, Direct mortar section, for indirect lay. No gameplay fix applied during this read-only audit.
- Existing companyClarity/companyConsequences/normandyAmmo suites: 40 tests passed. These existing tests do not cover the two reproduced defects.

### 2026-10-17 - Mortar indirect-fire fixes and explanation

- Resolved the two defects from the preceding audit. INDIRECT now rejects zero MTR stock/depletion and requires a live friendly, good-order HQ/staff observer with command eligibility and communication in every impulse, including General Initiative. It also participates in the existing General Initiative per-origin HQ command limit.
- Fire projection no longer creates heavy indirect VOF from an exhausted mortar. The final ammunition point still produces its prepared combat exposure before depletion blocks further indirect fire; existing ammunition timing is retained.
- Renamed the order to Call on-map mortar indirect fire. Its displayed explanation covers observer LOS, mortar range without own LOS, replacing direct fire, ammunition, cleanup expiry, and absence of card draws/PDF arrows. The operation key stays INDIRECT.
- Added 16 focused cases covering empty/depleted stock, unavailable/empty/pinned/degraded/non-HQ/enemy observers, missing LOS/communication, attachment eligibility, one-step rejection, valid company staff/PLT observers, no random draws on success, unchanged rejected state, last-round combat and cleanup. Together with existing clarity, consequences and ammunition suites: 56 passed.
- Browser checked the renamed order/help and enabled/disabled states in isolated test/mortarIndirectOrders.browser.html. This is a command-menu component fixture, not a live campaign walkthrough; no campaign data is saved. Evidence: output/tactical-clarity/mortar-indirect-order.png.
- Production build passed (existing large-bundle advisory only). Historical replay compatibility is outside this change; no compatibility modules or user saves were modified.

### 2026-10-17 - Later patrol preparation map controls

- Confirmed the later-patrol screen did not pass phase lines/MLR into its public deployment map, and only replaced primary/CCP/COP fields while leaving old secondary/attack aliases. Concentration and route choices were missing entirely from that map.
- Added one shared public-control projection for initial setup, patrols 2/3 and ordinary reattempt deployment. It reads current draft phase lines and patrol plan, projects primary/COP/CCP/concentration/four route points, removes generic patrol secondary/attack aliases, and passes the MLR to the shared tactical boundary renderer. Non-patrol reattempts retain their normal objectives without inventing an MLR. Objective badges wrap within narrow cards.
- Browser exercised the actual next-patrol preparation component: changing PL1/PL2 to rows 2/3 immediately repositioned both lines; MLR stayed between rows 1/2; changing primary to 4.4, concentration to 4.2 and route points immediately moved the matching markers. Checked default 1280px and 1900px desktop breakpoint. Screenshot: output/tactical-clarity/later-patrol-map-controls.png. Live campaign saves untouched.
- 34 focused map/setup/command-desk/M3/M5 preparation tests passed, followed by 14 map/setup/Hill192 tests after routing the remaining helper through the shared projection. Production build passed with the existing large-bundle advisory. No tactical state, randomness, storage schema or retained battlefield changes.

### 2026-10-18 - Special formations rules audit, first pass

- Began the requested rules-focused pass with no interface redesign or gameplay changes. Cross-checked series weapon/ammunition rules and Normandy general special rules. Recorded five isolated discrepancies: named weapon resupply fails to restore Good Order; empty named mortar Fire Teams cannot make hand-grenade attacks; Building-cover bazooka crews are incorrectly blocked from hand grenades; concentrated fire lacks ammunition reserve eligibility; the expressly permitted colocated-HQ mortar communications relay is absent.
- Findings, rule citations, priorities, scope limits and the proposed repair batch: docs/SPECIAL_FORMATIONS_RULES_AUDIT.md. Reproduction command: node scripts/auditSpecialFormations.js. Observations: output/special-formations-audit.json. All probes use in-memory fixtures and leave campaign/tactical saves untouched.
- 51 existing focused tests passed across mortar indirect orders, Normandy ammunition, Assault Team range, clarity and reconstitution. The uncovered cases remain unfixed and are documented separately from passing regressions. Full special-formation and mission-by-mission certification remains pending.

### 2026-10-18 - Special formation repairs SF-01 through SF-05

- Implemented the approved first repair batch. Appropriate ammunition pickup/direct transfer automatically restores named weapon sides and their original experience without restoring HQ/FO command sides or generic LATs. Incorrect ammunition does not restore a depleted weapon.
- Separated point-blank hand grenades from ranged-weapon restrictions: empty named mortar Fire Teams can use hand grenades, Building-cover bazooka crews can close assault, and named bazooka Fire Teams lose their ranged launcher capability. Existing bunker/pillbox and Good Order mortar restrictions remain.
- Added a shared concentration ammunition reserve check to command availability and the actual attack procedure, covering friendly, platoon and enemy calls. Tracked MG/GUN and multistep mortar firing reserves a baseline point; only successful concentrations expend their additional point. Depleted personal small-arms fire stays available.
- Added dedicated direct-or-relayed mortar communications for both General Initiative and ordinary HQ impulses. A same-area good-order HQ/staff with working CO radio/phone communication may relay even without command eligibility over the mortar; the originating observer still needs eligibility. Relay loss, different area, pinning and broken phone connections reject the order. Other orders do not gain relay communication.
- Added specialFormationRules and specialFormationReplay suites, including rejection atomicity, ammunition success/failure boundaries, named/generic capability boundaries, and exact replay/checkpoint recovery from legal commands. All five audit probes now pass; preserved original observations and saved repaired observations to output/special-formations-audit-fixed.json. Updated docs/SPECIAL_FORMATIONS_RULES_AUDIT.md.
- Final focused regression: 298 tests passed across 14 suites, including command-menu, Normandy ammo/phones/equipment/skills, Hill192 and St Germain weapons, vehicle basic fire/passengers, mortar orders and team detachment. Production build passed with the existing bundle-size advisory. No player saves were loaded or modified; no panel redesign or probability changes.

### 2026-10-18 - Special formation follow-up audit

- Recorded SF-06–SF-08 in docs/SPECIAL_FORMATIONS_RULES_AUDIT.md: an FO can gain forbidden CO TAC communication through a recovered radio; the enemy ranged-weapon helper requires an exact PDF target instead of its bearing; engineer infiltration path clearing is restricted to Hill 192 in adjacent/within-card movement despite later mission engineer support.
- Added scripts/auditSpecialFormationsFollowup.js and output/special-formations-audit-followup.json. Eight isolated observations include two passing Hill 192 controls and six disagreements across the three defects. The script intentionally exits 1 while those defects remain. No live save is read or modified.
- Reviewed observer agency/network checks, pinned/LAT guards and existing tripod coverage. Engineer repeated-attempt wording remains an interpretation question, not a confirmed bug. FPL and complete command/mission matrices remain pending.
- 98 focused tests passed across eight suites. This pass changes audit documentation and reproduction tooling only; gameplay fixes await the next implementation batch.

### 2026-10-18 - Engineer repair SF-08

- Shared Normandy engineer-rule eligibility across order validation, mine discovery and adjacent/within-card infiltration. Vire and Tinchebray now use the same path-clearing procedure as Hill 192. Safe successful infiltration clears mines; failed infiltration checks three cards without exposing eligible engineers. Ordinary movement, mine hits and ineligible squads retain their restrictions.
- Added 31 engineer movement cases, including exact replay/checkpoint recovery from two authored command sequences. All six engineer audit observations pass; output/special-formations-audit-engineer-fixed.json preserves results. SF-06 FO radio access and SF-07 enemy ranged-fire parity remain open.
- 227 tests passed across ten suites; production build passed with the existing bundle-size advisory. No deployment additions, UI redesign or player save modifications.

### 2026-10-18 - FO communications and enemy ranged-fire repairs

- Closed SF-06: recovered CO radio/phone equipment no longer grants FOs forbidden CO TAC communication. Voice orders, self/General Initiative and own FD agency calls remain available; rejection text explains the restriction.
- Closed SF-07: friendly/enemy ranged attacks share a valid-PDF bearing check. Different target distances on the same bearing are legal; conflicting directions still reject, and stale/same-card fire does not create a PDF. Existing range/ammo, point-blank, intervening-unit and enclosed-rocket restrictions remain.
- Added 13 focused cases plus an authored FO pickup/voice-support/movement/rejection sequence with exact replay and recovery. Strengthened the SF-07 audit fixture with a valid colocated long-range PDF and corrected an old Hill 192 test's invalid PDF setup.
- 304 tests passed across 14 suites; all original/follow-up audit probes pass; production build passed with the existing bundle-size advisory. Saved output/special-formations-audit-followup-fixed.json. No player saves were loaded or modified. All confirmed SF-01–SF-08 defects are closed; remaining broader audit scope is documented separately.

### 2026-10-18 - Pinned and reverse-side infantry audit

- Confirmed SF-09: unpinned Litter/Paralyzed Teams incorrectly return successful point-blank grenades because internal inherited VOF is mistaken for an armed side. SF-10: pinned Paralyzed Teams cannot Seek Cover or Move within a Card despite pinned precedence. SF-11: the pinned/LAT action allowlists incorrectly block the Command & Control network-switch action for otherwise eligible carriers.
- Added scripts/auditPinnedAndReverseSides.js and output/pinned-reverse-sides-audit.json: 32 isolated observations, 22 passing controls, ten discrepancies across three open findings. Production split-team, grenade and command paths are used; no player saves are loaded or modified. Details and rule references are in docs/SPECIAL_FORMATIONS_RULES_AUDIT.md.
- 179 existing tests passed across 11 suites. This pass adds audit documentation and probes only. SF-01–SF-08 remain closed; SF-09–SF-11 require a subsequent repair batch.

### 2026-10-18 - Pinned/reverse-side repairs SF-09 through SF-11

- Free grenade responses now require a live armed Good Order/Assault/Fire Team side, excluding Litter and Paralyzed Teams. Pinned Paralyzed Teams may Seek Cover and Move within a Card under the pinned precedence rule, remaining pinned/Paralyzed. Pinned and degraded carriers may switch networks when the existing hardware/replacement/communication/command conditions permit.
- Added 67 eligibility/response cases and one exact replay/recovery case. The latter uses normal combat to create a pinned Paralyzed survivor and a destroyed compatible radio, then issues legal cover/network orders without injected state or draws.
- 287 tests passed across 15 suites. All 32 pinned/reverse-side audit observations and earlier special-formation audit scripts pass. Production build passed with the existing bundle-size advisory. Original observations are preserved; repaired results saved in output/pinned-reverse-sides-fixed.json. No player saves were modified; no UI redesign. All confirmed SF-01–SF-11 findings are closed.

### 2026-10-18 - Higher HQ/staff audit

- Confirmed SF-12: regimental/battalion staff visitors recover CO radio/phone devices and gain forbidden remote CO TAC access. Confirmed SF-14: higher visitors can be consumed as Company HQ succession donors through generic STAFF fallback. SF-13 is a conditional missing on-map BN-radio channel, demonstrated with explicitly supplied BN devices at both endpoints, not a proven reachable current-loadout failure.
- Added scripts/auditHigherHQRules.js and output/higher-hq-rules-audit.json: 21 isolated observations, twelve passing controls, nine discrepancies across the two confirmed defects and conditional gap. Visitors use the actual Checking Up event creation path; fixture changes affect memory only.
- 232 existing tests passed across twelve suites. Expanded docs/SPECIAL_FORMATIONS_RULES_AUDIT.md with rule citations, repair boundaries and equipment/limited-visibility scope caveats. No gameplay code or player saves changed. SF-01–SF-11 remain closed.

### 2026-10-18 - Higher HQ/staff repairs SF-12 through SF-14

- Preserved explicit visitor profile and legacy priority interpretation. Applied regimental/battalion CO TAC permissions without preventing carriage of recovered radios/phones. Visitors cannot be consumed for company or platoon HQ reconstitution and no longer receive company-staff succession rank.
- Added a role/device-gated BN SCR300 channel between eligible on-map battalion endpoints and Company HQ. Verified series pp.28–29 and Normandy CSR 1: BN radio does not inherit SCR536 cover/LOS limits, and remains radio when CO TAC uses phones. Visitor event inventory is unchanged; the two-device path remains conditional on actual equipment.
- Added 24 focused cases and three authored exact replay/recovery sequences covering real Checking Up events, combat loss and staff succession, and explicitly equipped BN activation. Corrected audit R#3 profile selection to random[1] and added an assertion of the selected profile.
- 302 tests passed across 19 suites; all 21 corrected higher-HQ observations and earlier audit scripts pass. Production build passed with existing bundle-size advisory. Repaired results: output/higher-hq-rules-fixed.json. No player saves were loaded or modified. SF-01–SF-14 closed within documented scope; machine-gun/FPL audit is next.

### 2026-10-18 - Machine-gun grazing/overhead/FPL audit

- Confirmed SF-15: overhead eligibility uses card ground levels for intervening/target positions, ignoring upper-story occupants; this both permits an illegal friendly overflight and blocks a legal elevated-target engagement. Confirmed SF-16: attached HMG A+ classification blocks Concentrate Fire and also misses jam handling in the internal concentration procedure.
- Added scripts/auditMachineGunRules.js and output/machine-gun-rules-audit.json: twelve isolated observations, eight passing controls and four discrepancies across two open findings. The jam case is explicitly a procedure probe paired with the currently blocked A+ order, not a claim of legal player access today.
- FPL is restricted to Defensive Missions by series rules. Current Normandy missions are offensive/combat patrols with no FPL entitlement; no FPL UI or gameplay addition is warranted by this audit. Remaining slope interpretation is recorded as a question, not a confirmed defect.
- 242 existing tests passed across ten suites. Documentation/probes only; no gameplay source or player saves changed. SF-01–SF-14 remain closed; SF-15/SF-16 await repair.

### 2026-10-18 - Machine-gun repairs SF-15/SF-16

- Added A+ to concentration eligibility and weapon jam classification, retaining tripod draws and ammo rules. Overhead paths now consider upper-story occupants, mixed intervening heights and visible elevated targets; grazing uses the target's actual aiming height. Card-wide Basic VOF, nearest-enemy/shift rules, smoke/LOS and weapon-specific capability remain.
- Added 36 rules cases and two authored exact replay/checkpoint sequences for legal concentration and an upper-story movement intercepting an existing overhead lane. All twelve MG audit observations pass in output/machine-gun-rules-fixed.json, and earlier audit scripts remain passing.
- 307 tests passed across 14 suites; production build passed with the existing bundle-size advisory. No player saves modified and no FPL/UI additions. All confirmed SF-01–SF-16 findings closed within documented scope.

### 2026-10-18 - Remaining specialist/equipment/breakdown audit

- Visually checked Normandy breakdown charts pp.47–48; rendered references saved under output/specialist-audit/. Confirmed SF-17 German mortar operational survivor incorrectly becomes Fire Team; SF-18 two-step 88mm incorrectly retains a Good Order one-step gun; SF-19 several mission profiles lose the A/S FJ Fire Team (M5 control is correct); SF-20 A/S-plus-S donors incorrectly fail A/S squad firepower eligibility.
- Added scripts/auditSpecialistBreakdowns.js and output/specialist-breakdowns-audit.json: fifteen observations, three passing controls and twelve disagreements across four findings. M6/M7 profile checks use the shared infantry procedure, not complete vehicle playthroughs.
- Verified no Normandy mission allocation authorizes demolition charges or flamethrowers; their absence is not a bug. Engineer LATs correctly fail the two-/three-step Good Order squad requirement. Close-range German Fire Team counters were checked visually rather than inferring a bug from an unused stored range value.
- 294 existing tests passed across eleven suites. Audit documentation/probes only; no gameplay source or player saves modified. SF-01–SF-16 remain closed; SF-17–SF-20 await repair, with historical content/replay boundaries called out explicitly.


## 2026-10-18 — Isolated Grenade Miss visibility correction

New missions apply normal light, weather, illumination and smoke modifiers to a lone Grenade Miss (series 7.10.4, p.55). Successful grenade VOF exemptions remain unchanged and the miss penalty is counted once. Replays record the correction explicitly; existing records retain historical outcomes. Player-selected combat order and the combat screen redesign remain deferred together. Focused coverage is in `test/grenadeMissVisibility.test.js` and `scripts/auditCombatResolution.js`.

Validation: 122 focused tests passed across nine suites (three archival cases skipped), all 14 combat audit observations passed, and production build passed. Historical two-attempt M1 replay and recovery remain exact.
