# Notification and sound-effects audit

Audited October 16, 2026 against the current Company Assault and Normandy M1–M7 implementation, including connected campaigns, patrols, reattempts, infantry and vehicles.

**Status: planning inventory, not implemented audio.** This document records proposed cues, their actual triggers, priorities and missing hooks. Background music is excluded. No gameplay, randomness, saves or rules change is authorized by this checklist.

## Playback principles

- Sound explains a public change or requests attention. It must never reveal hidden enemies, concealed actions, hidden card draws, unknown weapon types, casualty totals or positions.
- Use the friendly player projection and public event stream. A public sound of incoming fire may accompany an already-public attack; do not spatialize its hidden origin or identify a weapon not disclosed by the UI.
- Do not equate every recorded event with a separate sound. One action can emit command, draw, weapon, hit, casualty, XP and phase events. Schedule a short coherent sequence, merging duplicate notifications.
- Retained basic fire is a state, not a new shot on every render. A PDF redraw, camera move, selection, refresh or state recalculation must not restart gunfire.
- Never gate commands or phase stepping on audio completion. No new tactical draws, random choices or timers in the simulation. Variation must use a separate presentation mechanism.
- Prime event receipts on load, Resume, Home/return, turn-start recovery and preparation return. Do not replay old battles, XP awards or HQ sounds when opening the AAR. Manual card reveal/AAR audio replay must be explicit and separately controllable.
- Deduplicate by mission instance, attempt/patrol and public event/action identity. Turn number alone is insufficient. Only new public events play automatically.
- Audio supplements readable text, counters and badges. No necessary information is sound-only. Avoid graphic injury sounds, intelligible invented orders and speech claiming hidden outcomes.

## Priority and cue vocabulary

| Tier | Purpose | Initial mix behavior |
| --- | --- | --- |
| A — attention | Player decision required, important loss, exhausted capability, mission outcome or save failure | Brief distinctive cue; interrupt or duck lower-priority effects. Merge simultaneous related alerts. |
| B — action/result | Accepted orders, public draws, fire, movement, support and state changes | Short cue attached to the resolved action; queue related effects in order. |
| C — subtle/optional | Selection, menus, routine phase transitions and successful saving | Quiet and rate-limited. Routine saving should default to silent. |
| Silent | Hidden procedures, bookkeeping, repeated unchanged state, history hydration | No automatic cue. |

The tier is a proposed attention priority, not a requirement for one unique asset per row. Reuse a small consistent vocabulary: paper/card, confirmation, caution, urgent decision, recovery, award, success and defeat.

## Navigation, orders and decisions

| Event or interaction | Proposed sound | Tier | Trigger / qualification |
| --- | --- | --- | --- |
| Open Home, Campaign, Missions, Briefing, File, Roster or Settings | Soft paper/menu open; soft close | C | UI hook, once per deliberate open/close. No battle sounds on return. |
| Select formation, HQ, vehicle, target or terrain | Light selection tick | C | Actual changed selection; avoid repeats while dragging/panning. |
| Preview route / deployment card / phase line / patrol route | Quiet placement tick | C | Valid changed choice; no engine/marching sound for a preview. |
| Zoom, pan, scroll, hover, find-unit camera movement | None by default | Silent | Continuous input must not produce a stream of ticks. |
| Accepted command | Muted acknowledgement | B | `COMMAND_ISSUED` / accepted vehicle operation; merge with the action sound. Never one sound for both issued and resolved. |
| Invalid command, insufficient commands, unavailable target or invalid preparation | Brief restrained rejection | B | Explicit attempted submission only. Do not sound merely because unavailable commands are listed. |
| HQ activation / selected HQ receives commands | Short command-ready cue | B | `HQ_ACTIVATED`, `IMPULSE_STARTED`; merge the activation, command draw and ready notification. |
| New general commands / extra command skill | Short ready cue | B | General initiative begins or `SKILL_USED` actually grants a command. |
| End impulse / advance segment / next turn | Soft page turn; slightly distinct turn cue | C | `IMPULSE_ENDED`, `SEGMENT_COMPLETED`, `TURN_ENDED`; coalesce a single advance click. |
| Pending combat, battalion-fire expansion, event choice, reaction or crew-HIT decision | Attention cue | A | First appearance of a new actionable choice, not every reopening of its dialog. |
| No HQ activation / no event / no visible changes / skipped phase | None | Silent | `ACTIVATION_UNAVAILABLE`, `HQ_EVENT_NONE`, `PHASE_SKIPPED`; feedback stays readable. |
| Review recap, rules details, inventory, AAR or history | Soft panel cue only | C | Do not replay the historical event's original sound automatically. |

## Public card draws and attempts

| Event | Proposed sound | Tier | Trigger / qualification |
| --- | --- | --- | --- |
| Public action-card pull | Card slide/flip | B | `CARDS_DRAWN` through `publicDrawGroups`; one bounded sequence per batch. Preserve every visible card without stacking loud clicks. |
| Public reshuffle | Brief shuffle | B | `DECK_SHUFFLED` only if publicly displayed; merge into associated batch. |
| Public random selection | Card/tick in its parent action | B | `RANDOM_SELECTION`; no additional reveal of concealed candidates. |
| Exhort additional draw | Small encouraging accent, then card | B | `EXHORT_ISSUED`; one action group with the original attempt. |
| Skill overrides a draw / automatic effect | Subtle skill-use accent | B | `SKILL_USED`; no invented draw/flip when no card was drawn. |
| Attempt succeeds / fails | Quiet positive / neutral unsuccessful cue | B | `OBSERVATION`, `COVER_ATTEMPT`, `CONCENTRATE_ATTEMPT`, `RALLY_ATTEMPT`, `GRENADE_ATTEMPT`, `ENGINEER_PATH_ATTEMPT`; use associated structured result. A failed attempt is not an invalid order. |
| Spotting identifies enemy | Distinct contact-found cue | A | `ENEMY_SPOTTED`, grouped with observation; play once for the action even if several enemies become spotted. |
| Spotting finds no additional enemy | Quiet neutral result | B | Public `OBSERVATION`; never distinguish hidden absence from a failed observation. |
| Manual Replay reveal | Optional replay of card sounds only | C | Separate explicit UI hook; must not re-award XP or replay casualties/fire. |

## Infantry movement and equipment

| Event | Proposed sound | Tier | Trigger / qualification |
| --- | --- | --- | --- |
| Formation moves to another card | Short boots/gear movement | B | `UNIT_MOVED` for infantry; one cue per formation/order group, not each step/person. |
| Infiltration succeeds | Subdued movement | B | Resolved movement outcome; do not use an incoming-fire sound merely because infiltration is attempted. |
| Infiltration fails and unit moves Exposed | Normal movement plus caution accent | B | Public failure/exposure result; not a separate imaginary shot. |
| Move within card / enter cover / seek cover succeeds | Brief gear movement / settle | B | `WITHIN_CARD_MOVED`, successful `COVER_ATTEMPT`; no building-specific sound for unknown terrain. |
| Detach Assault/Fire Team, supplement or reconstitute formation/HQ | Organize/ready cue | B | `FORMATION_CHANGED`, `SQUAD_SUPPLEMENTED`, `FORMATION_RECONSTITUTED`, `HQ_RECONSTITUTED`; no extra footsteps if no movement occurred. |
| Pick up, transfer or drop equipment/ammo | Gear handling | B | `EQUIPMENT_TRANSFERRED`, `ASSETS_TRANSFERRED`, `ASSETS_DROPPED`, `AMMO_DROPPED`, `AMMO_RESUPPLIED`, `DETACHED_LOAD_ASSIGNED`; merge one operation's inventory events. |
| Casualty picked up / handed over / dropped | Subdued handling cue | B | `CASUALTY_PICKED_UP`, `CASUALTIES_DROPPED`, transfer records. Preserve respect and clarity; no casualty scream. |
| Casualty evacuated at CCP | Distinct restrained completion cue | B | `CASUALTY_EVACUATED`; merge with associated XP notification. |
| Change CCP / other tactical control | Map-marker placement | B | `TACTICAL_CONTROL_DESIGNATED`. |
| Runner created, dispatched, delivered/activates HQ, dismissed | Dispatch / arrival / roster cue | B | `RUNNER_CREATED`, `RUNNER_DISPATCHED`, `HQ_ACTIVATED`, `RUNNER_DISMISSED`; undelivered status gets caution only when publicly relevant. |
| Phone line laid / repaired / network switched | Cable handling / connection click | B | `PHONE_LINE_LAID`, `PHONE_LINE_REPAIRED`, `NETWORK_SWITCHED`. |
| Phone line cut / working command connection lost | Connection-break caution | A | `PHONE_LINE_CUT`; other connection changes need a public state-difference hook. Do not alert every out-of-communication formation on every render. |

## Fire, combat and morale

| Event | Proposed sound | Tier | Trigger / qualification |
| --- | --- | --- | --- |
| New basic fire engagement | Short appropriate firing burst | B | `FIRE_ESTABLISHED`; use only publicly known S/A/H or disclosed weapon identity. Coalesce card-wide opening fire. |
| Continuing fire during combat resolution | Bounded burst, if enabled | B | One presentation cue per public combat group; not per refresh or every affected formation. No constant gunfire loop in the initial implementation. |
| Shift fire / cease fire | Brief command confirmation | B | `FIRE_ORDER_RESULT`, `VEHICLE_FIRE_ORDER`; a shifted line is not an additional shot event. |
| Concentrated fire | More sustained short burst | B | Successful `CONCENTRATE_ATTEMPT`, `PLATOON_ATTACK`, `VEHICLE_CONCENTRATED_FIRE`; don't imply success before cards resolve. |
| Hand grenade / rifle grenade / WP grenade | Appropriate launch/throw then impact | B | `GRENADE_ATTEMPT`; account for success, miss, return attack and skill outcome. One effect per actual attack, not per victim. |
| Mortar, artillery or cannon request | Short radio/request cue | B | `SUPPORT_REQUEST`; failed request has neutral failure, no gun/impact sound and no invented ammunition loss. |
| Support pending / battalion expansion chosen | Confirmation / attention if choice required | B/A | `BATTALION_FIRE_SELECTED`, pending-support UI; pending fire must not sound like impact yet. |
| Support becomes active | Incoming warning then impact appropriate to public delivery | A/B | `SUPPORT_ACTIVE`, public `INCOMING_FIRE`; group repeated impacts and avoid hidden source placement. |
| Short rounds | Distinct warning followed by actual public impact | A | Structured short-round result in support/card events; do not announce concealed destination details. |
| Sniper attack / public sniper target | Restrained shot plus focused warning | A/B | Public `SNIPER_TARGET` / fire records only; never a directional hidden-sniper reveal. |
| Mine discovered / safe path marked | Caution / clear-path confirmation | A/B | `MINEFIELD_FOUND`, `ENGINEER_PATH_ATTEMPT`; discovery alone is not an explosion. |
| Mine detonates | Short explosion | A/B | Successful public triggering result from `MINE_CHECK` / `VEHICLE_MINE_CHECK`; failed/no-effect checks remain neutral. |
| Combat MISS / PIN / HIT | Neutral miss / suppression accent / hit warning | B/A | `COMBAT_RESOLVED`; don't add a second weapon shot for every target. Distinguish miss from recovery. |
| Hit effect, casualty steps or formation lost | Restrained loss cue | A | `HIT_EFFECT_RESOLVED`, `FORMATION_LOST`; combine multi-step results into one summary. No invented death/wound distinction. |
| Cohesion degrades to Assault, Fire, Litter or Paralyzed | Descending caution family | A/B | `COHESION_CHANGED`, `FORMATION_CHANGED`; use public transition, not counter name or color parsing. |
| Pin removed / rally / cohesion restored | Short recovery cue | B | `AUTOMATIC_RECOVERY`, successful `RALLY_ATTEMPT`, `COHESION_CHANGED`; merge if one event chain describes the same recovery. |
| Ammunition expended | Normally merge with weapon shot | Silent/B | `AMMO_EXPENDED`; do not add a separate tick per ammo point. |
| Out of ammo / weapon jam / radio lost | Distinct capability-loss caution | A | `OUT_OF_AMMO`, `VEHICLE_AMMO_EXHAUSTED`, `WEAPON_JAMMED`, `RADIO_LOST`; first transition only. |
| Prisoners / enemy casualties captured | Subdued completion cue | B | `UNIT_CAPTURED`, `ENEMY_CASUALTY_CAPTURED`; group with guard allocation and XP. |
| Public withdrawal / enemy movement | Movement or departure cue | B | `UNIT_WITHDREW` and visible movement; hidden withdrawal must remain silent. |
| VOF/PDF merely recalculated, target history retained, firing line redrawn | None | Silent | No new event or no new action. Historical firing reports are not live shots. |

## Signals, Higher HQ and battlefield discovery

| Event | Proposed sound | Tier | Trigger / qualification |
| --- | --- | --- | --- |
| Deploy HC/WP screening smoke | Canister/brief hiss | B | `SMOKE_DEPLOYED`, `WP_DEPLOYED`; no explosion for screening-only use. |
| Deploy colored smoke signal | Canister/brief hiss | B | `SIGNAL_DEPLOYED` with non-aerial device; separate from its triggered orders. |
| Launch flare / star cluster / handheld illumination | Short launch/pop | B | `SIGNAL_DEPLOYED`, `ILLUMINATION_DEPLOYED`; select by public delivery type, not darkness alone. |
| Support-delivered illumination | Public delivery cue | B | Illumination result in `SUPPORT_REQUEST`; avoid also playing handheld launch. |
| Friendly Higher HQ event | Brief dispatch/notification | A | `HQ_EVENT`; one cue for the pop-up, readable title/description/result remain primary. |
| Enemy Higher HQ event | Distinct restrained alert | A | Public `HQ_EVENT`; not one sound per hidden affected unit. |
| HQ event needs resupply/tank-entry choice | Decision-required cue | A | `HQ_EVENT_CHOICE_REQUIRED`; don't also queue the full event alert repeatedly. |
| HQ visitor arrives / departs | Brief arrival / departure accent | B | Public visitor state/`BN_HQ_ON_MAP`; departure may need a public transition hook. Disappearance next turn is silent UI cleanup. |
| Communications trouble, SITREP, hold/advance obligation or support unavailable | Caution within HQ dispatch | A | `HQ_EVENT` code and `HQ_OBLIGATION`; completion cue when obligation is actually satisfied. |
| Rain / other event weather changes | Brief restrained environmental accent, optional | B | Public HQ/weather change; no continuous ambience required for this pass. |
| Enemy counterattack begins / ends | Alert / resolved cue | A/B | Public HQ event and `COUNTER_ATTACK_ENDED`; no hidden unit-count information. |
| Terrain revealed / map expands | Card placement | B | `TERRAIN_REVEALED`, `MAP_EXPANDED`; merge simultaneous generation/reveal. Generating terrain must not imply an enemy contact. |
| Potential contact evaluated: empty | Quiet resolved cue | B | Public `CONTACT_EVALUATED`, `CONTACT_EMPTY`; no hostile firing sound. |
| Potential contact produces enemy / incoming fire | Contact alert then disclosed effect | A | `CONTACT_EVALUATED`, `CONTACT_FIRE`, `INCOMING_FIRE`, `ENEMY_SPOTTED`; group into one reveal sequence. No weapon sound if the package does not fire. |
| Contact renewed / removed / stock exhausted | Quiet map cue only when public and consequential | B/C | `CONTACT_RENEWED`, `CONTACT_REMOVED`, `CONTACT_EXHAUSTED`; never expose concealed package/placement rejection. |

## Vehicles and transport (M6/M7 and supporting armor)

| Event | Proposed sound | Tier | Trigger / qualification |
| --- | --- | --- | --- |
| Vehicle activated / held | Ready / quiet confirmation | B/C | `VEHICLE_ACTIVATED`, `VEHICLE_HELD`; no engine movement for activation alone. |
| Actual tank/TD/jeep movement | Short engine/tracks or wheels | B | Vehicle `UNIT_MOVED`; distinguish by disclosed profile. Start/stop once per actual route, not movement continuation stage. |
| Embark / disembark / load / unload | Gear handling, optional door/clamber | B | `INFANTRY_EMBARKED`, `INFANTRY_DISEMBARKED`, `VEHICLE_LOAD_TRANSFERRED`; verify the accepted operation for cargo type. |
| AT/main-gun shot | Disclosed cannon/AT launch | B | `AT_SHOT_RESOLVED` and runtime shot record; failed grenade prerequisite may spend ammo without a gun result—match actual resolution. |
| Reaction fire / Quick Shot opportunity | Decision-required cue, then shot if taken | A/B | Vehicle pending reaction/quick-shot state; do not fire an audio shot for merely offering the choice. |
| AT miss, pin, retreat, knockout, bail out | Miss / caution / movement / impact / crew-exit | B/A | Actual vehicle result record and `applyVehicleResult` output; not merely `AT_FIRE` input operation. |
| Burning wreck | Short ignition/impact accent | A/B | Confirmed burning-wreck state; no persistent fire loop initially. |
| Crew/passenger/rider HIT pending | Attention cue | A | Runtime pending HITs; merge with destruction cue and don't announce casualties until resolved. |
| Vehicle action/movement interrupted | Distinct interruption cue | A | `VEHICLE_ACTION_INTERRUPTED`, `VEHICLE_MOVE_INTERRUPTED`; avoid duplicate alert with knockout/crew decision. |
| Vehicle basic-fire effects / pin/rally | Same combat/recovery family | B | `VEHICLE_VOF_RESOLVED`, `VEHICLE_RALLY`; use actual result. |
| Ammunition exhausted / transport over capacity / route invalid | Capability caution / rejected-choice cue | A/B | `VEHICLE_AMMO_EXHAUSTED` or UI validation; failed preview must not play engine/fire effects. |

## Objectives, campaign, preparation and storage

| Event or interaction | Proposed sound | Tier | Trigger / qualification |
| --- | --- | --- | --- |
| Objective becomes secured / loses secured status | Progress / caution cue | A/B | Public objective transition; `OBJECTIVE_CHECK` may repeat unchanged, so compare scoped prior public assessment. No hidden-blocker inference. |
| Patrol route point / primary visited / MLR return | Short progress cue | B | Public patrol progress transition, not each render or terrain hover. |
| XP earned | Achievement-style short chime | B | `ACHIEVEMENT` / `experienceAwards`; one cue per grouped public award. Recipient and task remain visible; no invented individual XP pool. |
| Mission success / defeat / abort / patrol end | Distinct restrained outcome cue | A | `MISSION_ENDED`, `PATROL_ENDED`; final patrol + mission should produce one coherent terminal cue. No triumph cue for failure or abort. |
| Enter debrief / preparation / setup | Paper/desk transition | C | Deliberate UI navigation only. |
| Record debrief, apply transfer, promotion, replacement, skill purchase | Brief roster confirmation | B | Successful committed transaction; draft edits get only selection feedback. Batch promotions/steps do not need separate fanfares. |
| Ready / supplies valid / deployment committed / next attempt starts | Ready then page transition | B | `MISSION_SETUP_CONFIRMED`, `MISSION_STARTED`, `MISSION_REATTEMPTED`, `PATROL_PREPARED`; merge overlapping start notifications. |
| Duplicate/stale transaction, invalid donor/capacity/skill or storage failure | Clear caution / failure | A | Actual operation failure. Distinguish failure to save from ordinary invalid draft input. |
| Start/delete campaign confirmation | Neutral dialog cue; confirmation on success | C/B | Existing explicit confirmation flow; cancellation is silent. Sound does not replace confirmation. |
| Save succeeds / Resume succeeds | Silent save; optional resume confirmation | Silent/C | No autosave tick after every command. Never replay prior mission SFX. |
| Save corrupt/incompatible / restore failure / repaired replay rewind | Attention cue | A | Existing recovery status; give readable explanation and preserve backups. |
| Export replay/AAR/roster/save / backup created | Quiet completion | C | Actual export/write completion, not just opening File. |
| Campaign complete | Restrained distinct completion | A | Verified terminal campaign stage; do not infer from opening the history page. |

## Deliberately silent event families

Hidden events are silent regardless of type. Also silent: rejected hidden package locations/directions, hidden activity redraws, raw state snapshots, replay input operations, unchanged objective assessments, phase bookkeeping, repeated receipt hydration, historical losses and exports being read for inspection. `COMMAND_RESOLVED`, `COMBAT_RESOLUTION_PREPARED`, `COMBAT_REVIEW`, `CONTACTS_COMPLETE`, `PHASE_ENTERED` and `SEGMENT_COMPLETED` are orchestration signals; they are not additional combat effects.

## Hook gaps and implementation decisions

- [ ] Build a presentation-only cue router with public event receipts, action grouping, queue priority, ducking, concurrency caps and cancellation on navigation.
- [ ] Use structured results and public actor/delivery/weapon information. Extend presentation metadata where absent; do not parse English event text or expose raw hidden runtime state.
- [ ] Add public transition hooks for objective changes, patrol route progress, communication loss/restoration and HQ visitor departure. Avoid comparing hidden simulation fields.
- [ ] Vehicle movement continuations, reaction/Quick Shot decisions, result application, crew outcomes and cargo changes need normalized public presentation hooks. Not all domain results currently emit a dedicated event.
- [ ] Campaign transactions, UI validation, save/export completion and storage failures need UI hooks; they are not tactical events.
- [ ] Define one owner for each sound: card overlay, combat screen, HQ modal and XP toast must not independently play duplicate cues for the same action.
- [ ] No automatic history sounds on opening AAR/recap or loading a mission. Explicit manual replay should have an opt-in audio control.
- [ ] Settings: master mute/volume, notification volume, battlefield volume, optional UI sounds and optional repeated-combat cues; persist preferences. Support keyboard operation and browser autoplay restrictions after a user gesture.
- [ ] Suspend/limit playback while tab is hidden; don't unleash a backlog on focus. Limit voices and clip peaks during simultaneous contacts/combat.
- [ ] Catalog every chosen asset's license, attribution, duration, gain, format and variants before shipping. No audio assets have been selected by this audit.

## Suggested production order

1. Notifications: actionable choices, HQ events, XP, mission outcomes, invalid submissions and storage failures.
2. Public card pulls, order acknowledgements, movement, spotting, cover and recovery.
3. Infantry fire, grenades, support, capability losses and casualties, with deduplication/mixing.
4. Vehicles, transport, reaction windows, main guns and crew outcomes.
5. Optional UI texture and environmental accents after the useful cues are validated.

## Acceptance checklist

- [ ] Exercise Company Assault and all seven standalone missions, plus connected starts, M3/M5 patrol transitions, reattempts and vehicle support arrivals.
- [ ] Verify public draws/reshuffles, Exhort, skill overrides, automatic no-draw results and failed support requests.
- [ ] Verify contact chains, simultaneous opening fire, short rounds, grenade returns, suppression, casualty breakdowns and multiple XP awards do not become overlapping noise.
- [ ] Compare silent and sound-enabled deterministic replay/state/deck/commands/inventory/phase results: identical.
- [ ] Confirm every hidden event and hidden candidate remains silent, including source direction/weapon identity where concealed.
- [ ] Confirm Home/return, reload, Resume, recovery, AAR and failed commits do not replay old sounds.
- [ ] Test mute, independent volume controls, keyboard use, narrow layout, autoplay unlock, background tab and missing/failed audio assets. Audio failure must never block play.
- [ ] Human-check notification recognition at low volume without reading hidden information or losing the text alternative.

## Code reference map

| Area | Current reference |
| --- | --- |
| Event creation / draws / randomness | `src/sim/company/core.js` |
| Public event/player projection | `src/sim/company/engine.js` (`getVisibleEvents`, `getPlayerView`) |
| Orders, equipment, signals, attempts | `src/sim/company/actions.js` |
| Fire refresh and public engagement records | `src/sim/company/battlefield.js`, `src/ui/firePresentation.js` |
| Combat, contacts, special weapons | `combat.js`, `missionContacts.js`, `specialEnemies.js`, `vehicleCombat.js` under `src/sim/company/` |
| HQ events and support | `normandyEvents.js`, `patrolEvents.js`, `missionFeatures.js`; `src/ui/hqEventPresentation.js`, `segmentResults.js` |
| Existing draw/XP notification receipts | `src/ui/cardDraws.js`, `experienceNotifications.js` |
| Vehicles / public integration | `src/sim/company/vireIntegration.js`, `vehicleMovement.js`, `vehicleState.js`, `vehicleOrders.js`, `vehicleTransport.js`, `vehicleCargo.js` |
| Campaign and preparation | `src/sim/company/campaignPreparation.js`, `campaignProgression.js`, `reattempt.js`; corresponding UI workspaces |
| Recovery/navigation/errors | `src/ui/companyMain.js`, `applicationNavigation.js`, `localRecovery.js`, `campaignRecovery.js` |

The source inventory below lists literal current event emitters, not an instruction to play every event. Dynamic event types and domain/UI hooks are noted separately. Archived compatibility engines and legacy prototype emitters are outside this release audit; don't build duplicate audio pipelines around them.

## Current emitted-event inventory

| Source under `src/sim/company/` | Literal event types |
| --- | --- |
| `actions.js` | `ASSETS_DROPPED`, `CASUALTIES_DROPPED`, `CASUALTY_PICKED_UP`, `COHESION_CHANGED`, `COMMAND_ISSUED`, `COMMAND_RESOLVED`, `CONCENTRATE_ATTEMPT`, `COVER_ATTEMPT`, `DETACHED_LOAD_ASSIGNED`, `EQUIPMENT_TRANSFERRED`, `FIRE_ORDER_RESULT`, `FORMATION_RECONSTITUTED`, `GRENADE_ATTEMPT`, `HQ_ACTIVATED`, `HQ_RECONSTITUTED`, `ILLUMINATION_DEPLOYED`, `MORTAR_PDF_PLACED`, `NETWORK_SWITCHED`, `OBSERVATION`, `PHONE_LINE_REPAIRED`, `PLATOON_ATTACK`, `RALLY_ATTEMPT`, `SIGNAL_DEPLOYED`, `SKILL_ASSIGNED`, `SKILL_USED`, `SMOKE_DEPLOYED`, `SQUAD_SUPPLEMENTED`, `SUPPORT_REQUEST`, `TACTICAL_CONTROL_DESIGNATED`, `UNIT_MOVED`, `WEAPON_JAMMED`, `WITHIN_CARD_MOVED`, `WP_DEPLOYED` |
| `ammunition.js` | `AMMO_DROPPED`, `AMMO_EXPENDED`, `AMMO_RESUPPLIED`, `OUT_OF_AMMO` |
| `battlefield.js` | `COHESION_CHANGED`, `CONTACT_REMOVED`, `ENEMY_SPOTTED`, `FIRE_ESTABLISHED` |
| `combat.js` | `AMMO_LOST`, `ASSETS_DROPPED`, `ASSETS_TRANSFERRED`, `CASUALTY`, `COHESION_CHANGED`, `COMBAT_RESOLUTION_PREPARED`, `COMBAT_RESOLVED`, `CONTACT_EMPTY`, `CONTACT_EVALUATED`, `CONTACT_FIRE`, `CONTACT_RENEWED`, `ENEMY_ACTIVITY`, `ENEMY_ACTIVITY_REDRAW`, `ENEMY_CASUALTY_CAPTURED`, `FORMATION_CHANGED`, `FORMATION_LOST`, `FORMATION_RECONSTITUTED`, `HIT_EFFECT_RESOLVED`, `INCOMING_FIRE`, `RADIO_LOST`, `UNIT_CAPTURED`, `UNIT_WITHDREW` |
| `core.js` | `ASSETS_DROPPED`, `CARDS_DRAWN`, `DECK_SHUFFLED`, `EXHORT_ISSUED`, `RANDOM_SELECTION`, `SKILL_USED` |
| `engine.js` | `ACTIVATION_UNAVAILABLE`, `AUTOMATIC_RECOVERY`, `BN_HQ_ON_MAP`, `CASUALTY_EVACUATED`, `COMBAT_REVIEW`, `CONTACTS_COMPLETE`, `COUNTER_ATTACK_ENDED`, `HQ_ACTIVATED`, `HQ_OBLIGATION`, `IMPULSE_ENDED`, `IMPULSE_STARTED`, `MISSION_ENDED`, `MISSION_SETUP_CONFIRMED`, `MISSION_STARTED`, `OBJECTIVE_CHECK`, `PATROL_ENDED`, `PHASE_ENTERED`, `PHASE_SKIPPED`, `REATTEMPT_DECLINED`, `SEGMENT_COMPLETED`, `SUPPORT_ACTIVE`, `TURN_ENDED` |
| `engineers.js` | `ENGINEER_PATH_ATTEMPT`, `MINE_CHECK` |
| `missionContacts.js` | `CONTACT_DIRECTION_REJECTED`, `CONTACT_EVALUATED`, `CONTACT_EXHAUSTED`, `CONTACT_FIRE`, `CONTACT_POSITION_REJECTED`, `ILLUMINATION_DEPLOYED`, `INCOMING_FIRE`, `MINEFIELD_FOUND`, `PACKAGE_REJECTED` |
| `missionExpansion.js` | `MAP_EXPANDED` |
| `missionFeatures.js` | `ACHIEVEMENT`, `BATTALION_FIRE_SELECTED`, `HQ_EVENT`, `HQ_EVENT_FORMATION`, `HQ_EVENT_NONE`, `MINE_CHECK`, `SUPPORT_REQUEST`, `UNIT_CAPTURED` |
| `missionKnowledge.js` | `TERRAIN_REVEALED` |
| `normandyEvents.js` | `HQ_EVENT`, `HQ_EVENT_CHOICE_REQUIRED`, `HQ_EVENT_FORMATION`, `HQ_EVENT_NONE` |
| `patrolEvents.js` | `ACHIEVEMENT`, `MAP_EXPANDED`, `PATROL_EVENT_UNAVAILABLE`, `UNIT_MOVED` |
| `phoneNetwork.js` | `PHONE_LINE_CUT`, `PHONE_LINE_LAID` |
| `reattempt.js` | `MISSION_REATTEMPTED`, `PATROL_PREPARED`, `REATTEMPT_EQUIPMENT_ASSIGNED` |
| `runners.js` | `HQ_ACTIVATED`, `RUNNER_CREATED`, `RUNNER_DISMISSED`, `RUNNER_DISPATCHED`, `RUNNER_UNDELIVERED` |
| `specialEnemies.js` | `ENEMY_LOST_SIGHT`, `SNIPER_TARGET`, `SUPPORT_REQUEST`, `UNIT_WITHDREW` |
| `vehicleCombat.js` | `AT_SHOT_RESOLVED` |
| `vehicleFire.js` | `VEHICLE_AMMO_EXHAUSTED` |
| `vehicleHazards.js` | `VEHICLE_MINE_CHECK` |
| `vehicleInfantryActions.js` | `VEHICLE_CONCENTRATED_FIRE` |
| `vehicleOrders.js` | `VEHICLE_FIRE_ORDER`, `VEHICLE_RALLY` |
| `vireIntegration.js` | `HQ_ACTIVATED`, `INFANTRY_DISEMBARKED`, `UNIT_MOVED`, `VEHICLE_ACTION_INTERRUPTED`, `VEHICLE_ACTIVATED`, `VEHICLE_HELD`, `VEHICLE_MOVE_INTERRUPTED`, `VEHICLE_VOF_RESOLVED` |

Inventory: 123 distinct literal event types across 23 current source modules. Dynamic emitted types also include `INFANTRY_EMBARKED` and `VEHICLE_LOAD_TRANSFERRED`. Vehicle input operations such as `AT_FIRE`, `RESOLVE_CREW_HIT` and `ENGINE_OPERATION` are not themselves sound triggers; consume accepted public results instead. Marker types such as `GRENADE`, `ILLUMINATION`, `MINES` and `BURNING_WRECK` are state, not necessarily event names.
