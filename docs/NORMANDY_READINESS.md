# Normandy — next delivery gates

KUTF standalone playability is accepted. Normandy 1: Trévières remains a development candidate until its remaining source audits and explicit-phase user acceptance pass. Connected campaign progression and vehicles remain deferred.

## Current development candidate

Trévières is an unavailable, inspectable scenario in the normal mission catalog. Its 4×3 setup, 10-turn limit, objective rows, starting company, C/A/B contacts, printed package weights, 12 packages, and finite artillery inventory are authored in `src/scenarios/trevieres.js`. Setup provides mortar section/teams, company radios/field phones, company or platoon weapons assignments, eight signals, and selectable phase lines. Open the game with `?normandyDev=1` for the labelled development playtest with normal phase stepping. This does **not** pass the release gate.

The separate campaign record (`campaignRoster.js`) stores stable people, steps, formations, experience, unresolved dispositions, revision, and applied mission IDs. Deployments freeze the roster in replay; terminal debriefs require the matching revision and apply once. A synthetic transfer/debrief/save/reload/redeployment fixture preserves donated step identities and formation capacity. The tactical save remains separate. Each attempt has an immutable starting record and distinct ID linked to the unique mission run; strict replay verifies both records. Attempt preparation offers reconstitution, local promotions and single-use skill purchases with physical counter limits.

| Source | Implemented candidate | Remaining verification / work |
|---|---|---|
| Normandy pp. 12–13, TO&E and assets | Company force/experience, section/team setup, radios/phones, eight signals, runners, company weapons assignment; .50 cal fires unexposed on its weapon side | Signal/runner and detailed phone-line source audit |
| Normandy pp. 16–17, Mission 1 setup | 4×3 map, C/A/B contacts, objective/attack rows, ten turns, four HE / one WP artillery, selectable phase lines | Explicit-phase user playthrough and UI acceptance |
| Normandy pp. 18–19, events/packages | All 12 packages and nine additional branches; all 30 HQ event slots; counterattack timer, resupply choices, visiting HQ impulse | Placement, finite counter reuse, and visitor lifetime/loss edge audit |
| Normandy pp. 47–48 breakdown diagrams (visually checked) | US mortar first hit retains the section ammunition on its named mortar side; German A Grenadiers retain A at two steps; 88mm is a two-step H weapon with six GUN ammunition | Reconstitution eligibility and restoration edge audit across every required profile |
| Third-edition §§3.9, 7.18, 12.3, 12.6 | Replayed reattempt; retained terrain/contacts/mines/spotting/location awards; phone/cover choices; ammo replenishment; donor/promotion eligibility and combined experience | Full numbered §3.9 audit, equipment inheritance/resupply boundary audit |
| Third-edition §12.7, Player Aid 2 and countersheet 1 front/back (visually checked) | Ten skill types, three per HQ/staff, shared physical front/back inventory, attempt-local costs, explicit command selection, one-use expenditure; critical/jam draws retained | Auto Grenade/Extra Draw selection for automatic grenade returns and other automatic attempts; command-cost timing needs source resolution |
| Enemy Activity player aid; third-edition §8.6 | LAT before Good before leaders; same-area leader draw modifiers; printed pinned/LAT rows, reconstitution, straight advance and closest-unit infiltration; timed Offensive Assault | Exhaustive hierarchy/priority and reconstitution firepower audit |
| Third-edition §4.1.3 (p.20 visually checked) | HQ/staff six-command cap retained; Normandy ordinary General Initiative can spend its skill-granted command after six orders | HQ-originated exceptions under General Initiative still need per-originator accounting review |

The mission remains gated until the remaining column is resolved, deterministic full runs pass, and a user playthrough accepts it. These authored tables and focused tests do not certify a complete Fields of Fire implementation.

The candidate uses rules version **17**, Trévières content version **3**, and campaign schema **1**. Older recovery/replay records are rejected explicitly; their original export bytes remain available from the recovery screen.

Current automated evidence: **58 test files / 435 tests passed** using `npm test -- --maxWorkers=2`; Vite production build passed at rules version 17. All 12 package numbers, nine additional branches and all 30 friendly/enemy HQ event slots have focused fixtures. Six scripted Company Assault policies and KUTF seed `kut-1` direct policy terminated with exact replay at rules version 17. Normandy tactical policy `trev-accept-4` failed the first attempt and won the second with both objectives held and original rows 1–2 cleared, with exact replay across both attempts. Seeds 5 and 6 terminated in second-attempt defeat with exact replay. Earlier seed 1's win predates corrected weapon profiles and is **not** current winning evidence. Automated runs do not establish human tactical comprehension or exhaustive source fidelity.

### Latest continuation evidence

- Normandy p. 19: the placement mission consumes one of a spotter's two missions; an exhausted spotter cannot request another. Reattempt replenishes its allowance and resets its call count (§3.9).
- Third-edition §3.9: surviving dispatched runners return to the box before placement validation; first-attempt HQ events, temporary visitors and movement restrictions do not leak into the new attempt. Starting records preserve both attempts' setup independently, and altered starting records fail strict replay.
- Normandy pp. 16, 19 and third-edition §8.4.5: victory checks the original four-column rows, while enemy placement may expand the map. Fixtures require both secured objectives and every original row 1–2 card cleared.
- Normandy p. 18: enemy Rally uses rally/recovery attempts and the existing P→L→F→A progression. A failed rally under fire leaves the pin in place; a Fire LAT recovers to Assault, not a full weapons unit.
- Signals: an infiltration order makes one attempt, follows the ordinary failed-infiltration exposed move, and validates eligibility before execution.

Additional continuation fixes include same-area enemy leader modifiers, lone mortar recovery, tracked weapon jamming, extra concentration ammunition, ammunition inheritance and named mortar breakdown, 16-step reattempt placement limits, runner/visitor exclusion from preparation, original-contact clearing values, and stable-step roster transfers. Renaming the company HQ and executive preserves their command/support capabilities in a focused fixture.

Still required for gates 1–2:

- Resolve automatic skill selection and its command-cost timing; implement and replay the resulting reaction choice without consuming cards during inspection.
- Audit every numbered §3.9 step, reconstitution firepower/experience eligibility, and ammo/equipment restoration boundaries against visual sources.
- Complete communication, phone/signal/runner, package placement/counter reuse, visiting HQ and enemy priority edge audits listed above; add fixtures for any uncovered behavior.
- Finish the mission adapter/command hierarchy review, including HQ-originated General Initiative accounting.
- Have the user complete and accept the development candidate using explicit phase stepping. No acceptance has been recorded; normal selection stays disabled.

Reproduce the winning tactical run with `node scripts/trevieresAcceptanceRun.js trev-accept-4`. It verifies deep terminal replay equality and saves summary, replay and visible events under `output/company-playtests/trev-accept-4-normandy.json`. The policy selects orders from the public player view; preparation chooses legal secured cards, local promotions and skills. It offers no Mission 2 progression. Gate 3 remains deferred.

## 1. Mission and roster foundation

- [ ] Separate mission-defined forces, terrain, contacts, tactics, events, support, objectives and exceptions from rules execution. Replace hardcoded HQ assumptions behind explicit capabilities; preserve existing APIs with KUTF/course adapters.
- [x] Add a separately versioned campaign save with stable company/person/step/formation identities, experience and disposition. Do not carry pins, PDFs, exposure, commands or contacts between missions.
- [x] Deploy from an immutable roster snapshot; record that exact snapshot, setup, seed and content/rules versions in replay. Later campaign changes cannot rewrite earlier missions.
- [x] Apply a terminal mission's roster delta exactly once by mission ID. Reject active-mission debriefs, duplicate application and mismatched roster revisions. Reloading cannot duplicate losses or rewards.
- [x] Keep campaign saves separate from mission autosaves, with backup/export and explicit version errors. Do not silently promote a historical KUTF company into Normandy.

Acceptance: KUTF/course deterministic regressions remain intact; a synthetic mission deploys, terminates, debriefs, saves, reloads and redeploys the same identities without duplicated losses/rewards. Wound/death disposition, promotions and replacements require separate source-checked rules; current casualty labels do not supply those outcomes.

## 2. Trévières as a standalone mission

- [ ] Published TO&E, setup, map, objectives and complete packages; unsupported packages fail validation rather than substitute rifle squads.
- [ ] Tracked friendly/enemy ammunition, carrying/resupply and finite HE/WP support.
- [ ] Normandy communications/signals, temporary higher HQs, enemy leaders and required mortar/gun profiles.
- [ ] Counterattacks, replacement PCs, timed Offensive Assault tactics and reattempt state.
- [ ] Data/profiles verified against the supplied Normandy PDF; complete deterministic runs, focused fixtures and user playthrough before ungating.

## 3. Connected campaign

- [ ] Source-checked casualties, experience, promotions, replacements and between-mission reconstitution.
- [ ] Progression, reattempts, retained terrain/scouting and immutable debrief history.
- [ ] Later mission dependencies individually: Hasty Defense/bunkers; night/weather/patrol routes; artillery concentrations; then vehicles/AT/engineers and Delay Defense.

KUTF achievements are not campaign experience. Unlimited KUTF ammunition/marker assumptions and simplified communications stay mission-specific. Vehicles are not prerequisites for Trévières and remain later work.
