# Normandy company preparation

October 13, 2026: connected Standard campaign released in normal navigation after live M3–M7 setup/recovery checks. Preparation was reviewed and accepted October 12. Seven standalone missions remain independent. Earlier dated candidate/gate notes below describe historical validation stages.

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

Home > Campaign creates a fresh published M1 company. Mission setup and recovery use its separate checkpoint. Terminal debrief guides reconstitution/promotions, replacements and skills. Finishing offers the next authored mission in the Standard sequence when the campaign continuation rules permit it.

Preparation storage: `platoon-normandy-connected-company`, schema 6. Tactical checkpoints use the `connected-` prefix. Standalone companies are not imported or changed. Earlier preparation schemas are explicitly rejected; original bytes remain exportable. Current tactical rules and vehicle adapter base are 39; incompatible records retain original export access. No historical replay migration is included.

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
- [x] `commitPreparedCompanyDeployment` prepares and commits the destination roster before deployment. Reloaded next-mission debrief uses that roster; mismatched mission IDs and stale commits reject. Normal connected launch now uses this transaction API.

## Validation

- [x] Preparation/roster/historical compatibility/Hill foundation fixtures: identities, guards, support ownership, promotion/replacement boundaries, skills, storage failure, duplicate/stale rejection and immutable exports.
- [x] Legal three-patrol M3 → debrief/preparation → same-company M4 setup, exact M3 replay, save/reload and foreign/modified battlefield rejection.
- [x] Complete M5 patrol replay → preparation with final-patrol experience, HMG ownership and unique active memberships.
- [x] Actual M6/M7 factory handoffs: crew losses/withdrawals, surviving passengers, parent replenishment, prepared skills and exact vehicle replay.
- [x] Normal M6/M7 routing and campaign M1 preparation browser checks: switching, abort/restart, interrupted preparation, recovery and narrow layout.
- [x] M5 browser cases and M6/M7 inline vehicle controls, phase filtering, exports and recovery.
- [x] Previous full regression: 117 files / 1,753 tests; six Company Assault and six KUTF policies with exact replay. Separate regenerated rules-34 M4/M5 runs preserve previous outcomes; original rules-33 files remain unchanged.
- [x] Human preparation acceptance: user reviewed and accepted October 12, 2026.
- [x] Connected Standard campaign sequence/launch/recovery candidate behind ?campaignDev=1; ordered same-company starts, committed-start recovery and independent tactical storage.
- [x] Seven-mission transaction validation and live M3–M7 setup/launch/reload/resume checks completed; connected Standard progression enabled in normal navigation. Controlled offensive completion fixtures are not claimed as tactical victories.

Latest campaign-wide audit follow-up: 96 tests pass across preparation, roster, Hill foundation and historical compatibility. The normal-selection/interrupted-preparation browser script passes under schema 6. Latest preparation work changes no tactical resolution/version. Production build passes with the existing bundle-size warning. Readiness evidence should distinguish these focused follow-up checks from the previous full regression run.

## Remaining boundaries

Normal connected Standard progression is available. Preparation acceptance and launch/carryover/recovery validation are complete. No automatic conversion of standalone/historical companies. Vehicle presentation redesign and 3D/audio remain separate later work. Preparation never assigns unsupported individual casualty outcomes.

First-player blocker verification (October 11): Jeep Hold operation, compact tactical storage, original exports, historical rejection, failed-write backup rollback and M7 browser reload validated. Command previews and preparation guidance were refined without ungating connected progression. Rules 35 validation and remaining full manual runs are tracked in `CAMPAIGN_FIRST_PLAYER_LOG.md`.

### First-player preparation and recap refinements

Company preparation now supports prevalidated multi-step transfer batches with one revision-checked commit, promotion/skill previews and step-derived combined-experience summaries. Invalid/stale/failed batches leave assignments unchanged and preserve the older backup. Optional recap popups persist as presentation; required choices, manual history and explicit phase stepping remain. Mission command/glossary guidance and terminal-preparation eligibility messages were added. Eight focused preparation-choice cases, existing campaign/recovery/command fixtures and browser checks pass; rules remain 35. See `CAMPAIGN_FIRST_PLAYER_LOG.md` for actual manual coverage.


### Connected launch follow-up — October 12, 2026

User preparation acceptance is recorded above. Connected orchestration now uses the existing preparation APIs for all seven missions, including locked M3→M4 battlefield ownership and destination support replenishment. The normal application remains limited to M1; ?campaignDev=1 explicitly opts into the unfinished connected candidate.

Source follow-up: third-edition p.80 §12.0 and p.83 §12.8 visually checked. Standard campaigns stop after offensive defeat or abort; combat patrol defeat may continue. Survivor/Hardcore choices are not offered. Completing M7 yields a campaign summary without an eighth destination.

Seven focused orchestration fixtures pass: fresh commit/reload, immutable company snapshot, duplicate/stale rejection, failed tactical mirror recovery, compact backup rollback, Standard stop/continuation boundaries, vehicle checkpoint compatibility, and a synthetic successful-M1 preparation→M2 transaction. The synthetic terminal fixture is not a claimed tactical victory or full campaign playthrough. Existing preparation fixtures cover actual patrol carryover and vehicle factory handoffs.

Isolated browser origin 127.0.0.1:5177: Home→Campaign→fresh company→M1 setup→Start→Home→reload→named campaign Resume exercised. Standalone saves remained absent. Committed-start recovery is offered without allowing another overlapping deployment. Browser testing caught and corrected a missing preview import. Screenshot: output/campaign-gates/connected-m1-recovery.png.

Company records now use the shared lossless recovery codec with atomic backup rollback; plain schema-6 records remain readable, and unsupported domain versions still reject. Tactical rules remain 35. Complete connected runs and later-mission browser recovery checks remain open; no standalone company is imported.

Final validation: full regression **127 files / 1,832 tests pass**; final focused orchestration/navigation/preparation checks **3 files / 20 tests pass**. The full run emitted a Windows fork-worker shutdown warning for `missionMortar`; all assertions passed, and its isolated thread-pool rerun passed all five tests. Actual recorded M3 three-patrol and M4 failed-first-attempt→successful-reattempt audits reproduce exact replay/public AAR/save/reload/debrief and duplicate/stale rejection. Production build and diff whitespace checks pass, with the existing bundle-size warning.


October 12 simulation correction: current rules are now 36. Live M1 exposed invalid colocated PDF joining across friendly troops; each joining weapon now validates its own path. Historical rules35 records still reject for live recovery and remain exportable/read-only auditable. Full tactical validation details and regenerated M4/M5 records are in CAMPAIGN_FIRST_PLAYER_LOG.md. This correction does not clear the connected seven-mission launch gate.
October 12 follow-up: shared rules 37 fixes missing non-firing contact positions, keeps their unspotted markers current after movement, and permits command-paid own-card searches. Original rules36 exports remain preserved and strictly rejected for current live recovery. The connected campaign acceptance boundary is unchanged.
# Connected validation evidence — 2026-10-13 (rules 39)

Normal connected progression remains gated. The preparation UI is accepted; this entry distinguishes actual tactical execution from controlled transaction coverage.

- `node scripts/connectedCampaignValidation.js` creates a fresh published M1 company in isolated storage, executes the recorded legal `spot-correction-39` choices against that company, and checks every operation. M1 succeeds on attempt 2 after 126 orders. No standalone roster, outcome, deck or enemy state is imported or changed.
- Preparation restores two vacant HQ/staff counters by transferring surviving steps, allocates one eligible Veteran return and six Green replacements, and purchases two Auto Spot skills. Every preparation choice is persisted and reread. M1's immutable deployment snapshot survives; M2 starts with the same company, surviving identities, prepared strength and printed skill counters. Tactical skill IDs are regenerated for the new attempt as designed.
- Natural public-view Cerisy policy: 122 orders, defeat on both attempts. Exact current replay and terminal recovery match. Standard campaign advancement correctly stops; this is **not** evidence of a successful seven-mission tactical campaign. Preparation left six surviving steps unassigned, so it is also not an optimal company reconstruction policy.
- `test/campaignSequenceHandoffs.test.js` covers all seven ordered deployment/debrief/preparation transactions, committed-start reload, immutable previous history, M3 terrain into M4, fresh mission-owned M6/M7 crews, no eighth mission and standalone save isolation. Offensive terminal states are explicitly synthetic. M3/M5 use legal phase stepping and three actual patrol preparations, with stationary patrol defeats. This fixture is **not** a winning campaign playthrough or later-mission browser acceptance.
- Campaign preparation, roster, management and progression fixtures: 84 passing checks; complete-sequence fixture: one passing check. Production build passes with the existing bundle-size warning.
- Final broad regression: **1,868 passed, 13 skipped**, 135 passing files and three skipped files (`output/connected-campaign/regression-39.txt`). No failures.
- Browser on isolated `127.0.0.1:5179`: explicit fixture control loads the actual M1 replay plus its legal preparation choices. In `?campaignDev=1`, Review prepared company → Set up Cerisy → Start mission works. Home → reload → Resume Cerisy restores turn 1 / phase 3.1. Evidence: `output/connected-campaign/m2-browser-resume.png`. User-origin saves remain untouched.
- Remaining release gate: later connected missions need live setup/recovery checks, and broader tactical connected execution is still pending. Do not replace the Standard defeat with an invented victory to advance this record.

# Normal connected campaign release — October 13, 2026

The remaining live handoff checks are complete. Normal Home/Campaign now offers all seven Standard campaign missions in order, with no `campaignDev` flag required. The old URL still works. Offensive defeat/abort stops progression; completed combat patrol defeat may continue. Standalone saves and companies are unchanged. No tactical rules-version or storage-schema change.

On isolated origin `127.0.0.1:5181`, prepared records from the controlled seven-mission transaction fixture were loaded through an explicit test control, then exercised through the actual application: Review prepared company → next mission setup → Start → Home → reload → named campaign Resume for **M3, M4, M5, M6 and M7**. Repeated the whole set at the normal `/` URL after release; all recovered turn 1 / phase 3.1. This is live launch/recovery coverage, not five complete tactical playthroughs or a winning campaign claim. M1/M2 actual tactical execution is recorded in the preceding evidence entry.

M4 preview and recovered terrain use the same-company M3 source `sequence-m3`. Browser checks exposed setup label CSS overriding `hidden`; the source/import controls are now both disabled and hidden. Standalone source/import controls remain available. M6 recovered a custom Sherman HQ at Staging 2 plus optional Jeep; M7 recovered a custom M10 HQ at Staging 3. Live exports verified persistent company step/person identities, ten fresh Sherman crew steps, eight fresh M10 crew steps, old Sherman people outside active strength, and exact checkpoint recovery. Mortar section/team aliases are checked through canonical section ownership.

Evidence: `output/connected-campaign/normal-handoff-browser-results.json`, `m3-normal-resume.png` through `m7-normal-resume.png`, `live-vehicle-checks.json`, and the copied live M6/M7 exports. Focused release checks: 89 pass; production build passes with the existing bundle-size warning. Company preparation remains text-heavy; its later refinement does not gate progression. A winning seven-mission tactical run remains useful playtest evidence, not a launch requirement.

Additional normal-browser recovery: M7 phase 3.2.1 survives Home/reload/Resume; Recover committed mission start returns to 3.1. The controlled terminal campaign record shows the completion summary with zero next-mission buttons (`normal-campaign-complete.png`).

Release regression: **1,868 passed, 13 skipped**, 135 passing files / three skipped, exit 0 (`release-regression-39.txt`). Windows reported `EPERM` shutting down the St. Germain release worker after its tests passed; an immediate isolated rerun of that file passed all three tests and exited cleanly. Normal completed-company → fresh company → M1 setup/start/reload also passes. Production build and diff whitespace check pass.
# Command-desk usability acceptance candidate — October 14, 2026

The approved company workflow redesign is implemented without changing transaction/storage APIs or tactical rules39. Debrief is previewed before its explicit single revision-checked commit; preparation uses a persistent roster and guided reorganization, replacements, skills and Ready screens. Transfers show signed additions/removals, promotions name formation/step/cost, and secondary controls hold exports/rule detail. Closing retains committed operations.

Reattempts and patrols retain their separate reducers. A pure personnel projection updates strength, capacity, deployment and promotion/skill costs; final submission is validated by the simulation before replacing live state. Embarked vehicle riders are exposed through an isolated preparation projection. Public map previews conceal unknown terrain and show no enemy information. Start resets camera/selection; returning without starting does not replace the tactical mission.

Validated actual M1 success → debrief/preparation → M2 and failed M2 → reactive donor/promotion edits → attempt two in the browser. Current replay, recovery and AAR match exactly. Controlled patrol and Vire rider reattempt checks pass, as do narrow company/reattempt layouts and keyboard trapping. Evidence is in `output/command-desk/` and CAMPAIGN_FIRST_PLAYER_LOG.md. Missing images were not reproduced; asset loading was checked separately from the corrected obsolete AAR fragment. Deferred tactical/AAR refinements remain in FOR_LATER.md.
