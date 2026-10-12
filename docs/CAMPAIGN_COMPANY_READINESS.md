# Normandy company preparation

October 11, 2026: development candidate. Seven accepted standalone missions remain independent. Fresh campaign M1 and terminal preparation are available; connected advancement remains gated.

## Source audit

- [x] Normandy pp.12–13: published starting company, experience, six Green replacements, equipment and communications.
- [x] Third-edition pp.80–82, §§12.1–12.7: preparation sequence, promotion restrictions, replacements, combined experience and expendable skills.
- [x] Third-edition p.74, §10.7: vehicle retreat removes passengers for the remainder of the mission; surviving company passengers return between missions without replacement spending. Brewed-up casualties and prisoners remain unresolved.
- [x] M4 special rules: use the same company's preserved M3 terrain, cover and discovered mines; engineers require discovered Row-2/3 mines.
- [x] Campaign-wide preparation source audit and adversarial personnel cases: mission exceptions, patrol skill carryover, rebuilt-HQ transfers, runner-box personnel and deliberately unassigned survivors. This closes the preparation audit, not connected advancement validation.

### Campaign-wide preparation audit — October 11

| Mission | Published preparation exception / handoff | Evidence |
| --- | --- | --- |
| M1 Trévières | Published starting company; one reattempt; ordinary skill expiration and destination supply reset. | Normandy pp.12–19; preparation/roster fixtures. |
| M2 Cerisy | One reattempt; observers replaced through parent organizations; prepared company identities/experience persist. | Normandy pp.20–23; Cerisy deployment/skill fixtures. |
| M3 St. Georges | Three patrols; participant promotions; unused purchased skills carry into the next mission; preserve battlefield for M4. Patrol failure does not end the campaign. | Normandy pp.24–27; real three-patrol replay/handoff fixture. |
| M4 Hill 192 | Same-company M3 cover/mines; remove COP, retain foxholes; Row-2/3 discovered mines enable engineers; omitted units unavailable until next mission. | Normandy pp.28–31; linked battlefield/engineer fixtures. |
| M5 St. Germain | Three patrols; participant promotions and unused purchased skill carryover; no published M5→M6 battlefield reuse requirement. | Normandy pp.32–35; complete patrol replay/preparation fixture. |
| M6 Vire | One reattempt; five initial Shermans/five event Stuarts and engineers are support; replace Jeep automatically; surviving company passengers return. | Normandy pp.36–41 and p.12; actual vehicle factory/passenger fixtures. |
| M7 Tinchebray | Two reattempts; casualties across attempts count once; four initial M10s/five event Stuarts replenish as support. | Normandy pp.42–46; factory/replay and casualty fixtures. |

Cross-cutting source: third-edition §§12.1–12.7 (pp.80–82), §4.3.2 (p.27), §10.7 (p.74), Normandy pp.12–15. No additional Normandy between-mission losses or experience reductions were found under §12.5; do not invent them. Visually checked starting company/assets tables (pp.12–13), patrol MSRs/support tables (pp.26,34), Hill MSRs (p.30), vehicle attachment/support tables (pp.38,44), and preparation sequence (rules p.81). Tactical content remains covered by each mission's readiness guide.

Audit corrections: unused patrol skills retain counters/holder limits without another experience charge; rebuilt-HQ promotion restrictions follow transferred step identities; surviving boxed/dispatched runners return to selectable reconstitution; deliberately unassigned survivors remain available after later deployment/debrief. Used skills, casualties and prisoners are never revived. Offensive skills still expire. Preparation schema 6 rejects earlier candidate records with original-export access; tactical rules remain 34.

## Candidate and storage

File > Campaign company creates a fresh published M1 company. Set up campaign M1 and Resume saved campaign M1 use its separate checkpoint. Terminal debrief guides reconstitution/promotions, replacements and skills. Finishing shows the prepared company; Mission 2 launch is unavailable.

Preparation storage: `platoon-normandy-connected-company`, schema 6. Tactical checkpoints use the `connected-` prefix. Standalone companies are not imported or changed. Earlier preparation schemas are explicitly rejected; original bytes remain exportable. Tactical rules remain 34, vehicle adapter base 34, with strict historical replay/recovery rejection and export access.

## Implemented handoffs

- [x] Immutable mission snapshots/history, unique mission IDs, revision checks and atomic single-record storage; stale/duplicate/invalid actions reject without changing the saved company.
- [x] Persistent people and steps survive transfers. Replacement identities are new; no named casualty is assigned a fabricated wound/death or Veteran return outcome.
- [x] Green/Veteran replacement allowances require successful completion. Actual company casualty/prisoner vacancies limit allocation; parent-organization and temporary withdrawal losses cannot inflate the company allowance.
- [x] Published support ownership survives breakdown and guards. Attachments cannot donate company steps or receive company promotions. Destination observers, HMGs, engineers and vehicle crews replenish separately with new support identities.
- [x] Prior patrol experience awards expire; unused purchased patrol skills carry forward under MSR 1. Promotion eligibility follows participating step identities, including guards; one promotion per eligible step, with Green→Line costing 1 and Line→Veteran costing 3. Rebuilt HQ/staff and new replacements cannot receive spare-point promotions.
- [x] Surviving company passengers return from active/retreated vehicles with their formation identities and recorded experience. Generic LATs become Green; named HQ/weapon Fire Teams rally at their original experience. Casualties and prisoners do not return through this mechanism.
- [x] Company mortar section/team choices preserve surviving identities and strength. Unassigned LATs are not silently reconstituted. Deployment aliases do not create extra personnel.
- [x] Prepared skills enter immutable roster snapshots, setup and attempt records; live use and replay preserve one-use exhaustion. Physical counter/holder restrictions remain enforced.
- [x] M6/M7 initial and event support crews, ammunition, activation and support availability reset through destination content/factories. Old support casualties remain unresolved.
- [x] A completed three-patrol M3 battlefield is stored in the same company's terminal history. Campaign M4 automatically uses it and rejects foreign, missing or modified sources. Standalone M4 loading remains unchanged.
- [x] `commitPreparedCompanyDeployment` prepares and commits the destination roster before deployment. Reloaded next-mission debrief uses that roster; mismatched mission IDs and stale commits reject. This transaction API does not enable connected launch.

## Validation

- [x] Preparation/roster/historical compatibility/Hill foundation fixtures: identities, guards, support ownership, promotion/replacement boundaries, skills, storage failure, duplicate/stale rejection and immutable exports.
- [x] Legal three-patrol M3 → debrief/preparation → same-company M4 setup, exact M3 replay, save/reload and foreign/modified battlefield rejection.
- [x] Complete M5 patrol replay → preparation with final-patrol experience, HMG ownership and unique active memberships.
- [x] Actual M6/M7 factory handoffs: crew losses/withdrawals, surviving passengers, parent replenishment, prepared skills and exact vehicle replay.
- [x] Normal M6/M7 routing and campaign M1 preparation browser checks: switching, abort/restart, interrupted preparation, recovery and narrow layout.
- [x] M5 browser cases and M6/M7 inline vehicle controls, phase filtering, exports and recovery.
- [x] Previous full regression: 117 files / 1,753 tests; six Company Assault and six KUTF policies with exact replay. Separate regenerated rules-34 M4/M5 runs preserve previous outcomes; original rules-33 files remain unchanged.
- [ ] Human preparation acceptance.
- [ ] Connected campaign sequence/launch/recovery UI and complete seven-mission advancement validation (subsequent scope).

Latest campaign-wide audit follow-up: 96 tests pass across preparation, roster, Hill foundation and historical compatibility. The normal-selection/interrupted-preparation browser script passes under schema 6. Latest preparation work changes no tactical resolution/version. Production build passes with the existing bundle-size warning. Readiness evidence should distinguish these focused follow-up checks from the previous full regression run.

## Remaining boundaries

Connected progression stays unavailable until human preparation acceptance and end-to-end campaign advancement/carryover validation. No automatic conversion of standalone/historical companies. Vehicle presentation redesign and 3D/audio remain separate later work. Preparation never assigns unsupported individual casualty outcomes.

First-player blocker verification (October 11): Jeep Hold operation, compact tactical storage, original exports, historical rejection, failed-write backup rollback and M7 browser reload validated. Command previews and preparation guidance were refined without ungating connected progression. Rules 35 validation and remaining full manual runs are tracked in `CAMPAIGN_FIRST_PLAYER_LOG.md`.

### First-player preparation and recap refinements

Company preparation now supports prevalidated multi-step transfer batches with one revision-checked commit, promotion/skill previews and step-derived combined-experience summaries. Invalid/stale/failed batches leave assignments unchanged and preserve the older backup. Optional recap popups persist as presentation; required choices, manual history and explicit phase stepping remain. Mission command/glossary guidance and terminal-preparation eligibility messages were added. Eight focused preparation-choice cases, existing campaign/recovery/command fixtures and browser checks pass; rules remain 35. See `CAMPAIGN_FIRST_PLAYER_LOG.md` for actual manual coverage.
