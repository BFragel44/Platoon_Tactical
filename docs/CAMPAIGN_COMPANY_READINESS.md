# Normandy company preparation

October 11, 2026: development candidate. All seven standalone missions remain independently selectable. Connected advancement remains gated pending battlefield carryover and campaign dependencies.

## Source checklist

- [x] Visually inspected Normandy pp.12-13: experience, up to six Green replacements, assets and communications.
- [x] Visually inspected third-edition pp.80-81: ordered sequence, promotion costs/restrictions, casualties across attempts and Veteran return thresholds.
- [x] Visually inspected p.82: allocations, attachment replacements, combined experience and skills.
- [ ] Campaign-wide patrol/guard/attachment and vehicle personnel handoff audit before connected progression.

## Candidate

File > Campaign company creates a fresh published M1 company in a separate versioned record. Set up campaign M1 opens the accepted setup dialog. Resume saved campaign M1 reads its separate checkpoint. Terminal debrief offers ordered reconstitution/promotions, replacements and skills. Finishing produces a company summary without launching Mission 2.

Transfers preserve identities; replacements receive new identities. Casualty dispositions remain unresolved. Veteran allowances do not assign recovery to a specific named casualty. Immutable input copies, unique mission IDs and revision checks protect atomic single-record commits. Original replay and preparation operations remain in history. Prepared deployment exposes strength, experience, skills and a destination-content supply-reset policy; subsequent launches remain gated.

Storage: `platoon-normandy-connected-company` schema 4; tactical checkpoints prefixed `connected-`. Existing standalone records are not imported or replaced. Incompatible preparation bytes remain exportable.

## Validation

- [x] Thirty-five preparation fixtures: active/duplicate rejection, immutable snapshots, promotions/rebuilt HQs, returning guards, attachment restrictions, patrol eligibility, casualty thresholds, replacement identities, skills, reload/stale revisions and storage failure.
- [x] Strict original M1 rules-25 rejection and unchanged recovery/export bytes (`test/normandyHistoricalCompatibility.test.js`).
- [x] Normal M6/M7 selection without flags, switching, deployment, reload, abort/restart; fresh campaign M1 through prepared summary, interrupted preparation reload and narrow layout (`scripts/campaignReleaseBrowserQA.js`).
- [x] Existing inline vehicle browser checks: activation, phases, map movement, exports, recovery and narrow layout.
- [ ] Human preparation acceptance.
- [ ] Expanded campaign-wide personnel handoff fixtures before enabling progression.

Updated full regression: 116 files / 1718 tests passed. The latest prepared-deployment fixture also passes in the 16-test preparation suite. Six Company Assault and six KUTF scripted policies completed with exact replay. Production build passes with existing bundle-size warning. No tactical replay version changed. Historical M1 audit script cannot execute rules-25 operations against today's engine (operation 95); original records remain unchanged and strict historical rejection remains in force.


### Personnel handoff follow-up

Focused validation: 29 tests passed across campaign preparation, campaign roster and historical compatibility. Production build passes (existing bundle-size warning). Surviving support crew memberships and undeployed reserves are retained rather than cleared wholesale. Unresolved losses remain outside active strength. Support crews cannot donate company steps. Final patrol experience excludes spent awards and does not subtract previous patrol expenditure twice. Promotion eligibility follows the participating step identity through transfers. Both replacement categories require successful mission completion.

Preparation schema 2 rejects earlier candidate preparation records explicitly, preserving their raw bytes for export; tactical replay versions are unchanged. Remaining work: audit attachment provenance after breakdown, supporting personnel withdrawals and destination-specific attachment replenishment; expand real M3/M5/M6/M7 handoff fixtures and repeat browser recovery checks before connected progression. Human preparation acceptance is still pending.


### Ownership and exhaustion audit

Rechecked the printed third-edition p.81 sequence and restrictions visually. Preparation now records supporting formation ownership independently of tactical flags, including the published M3/M5 HMG attachment lists. Detached supporting steps cannot enter the company LAT pool or receive company promotions. Company Veteran return thresholds exclude parent-organization personnel losses while immutable mission history retains all casualty IDs. Mortar section/team aliases no longer duplicate active personnel memberships. Previously purchased mission skills expire even when preparation buys no new skills.

Evidence: 34 focused tests pass (26 preparation fixtures plus roster and historical compatibility); normal-selection/recovery/preparation browser checks pass; production build passes with the existing bundle-size warning. Preparation schema 3 requires explicit support ownership; older candidate records are rejected and original bytes remain exportable. No tactical replay version changed.

Still pending: destination attachment replenishment, full real-mission withdrawal handoff fixtures, battlefield carryover and human preparation acceptance. Supporting vehicle withdrawals remain unresolved rather than being silently restored or declared casualties.


### Replacement vacancies and presentation

Fixed live observer memberships being cleared before support exclusion. Replacement allocation now consumes only recorded company casualty/prisoner vacancies from the completed mission across its attempts; withdrawn personnel do not create replacement entitlements. Redistribution may change which understrength formation receives the replacement without increasing the vacancy allowance. Skill holders must belong to the persistent company.

The preparation interface now limits replacement targets to understrength company formations and skill targets to surviving HQ/staff, omits irrelevant step selection outside reconstitution, and disables exhausted replacement allocations. Evidence: 37 focused tests pass; normal mission/recovery and interrupted preparation browser script passes; production build passes with its existing size warning. Preparation schema 4 explicitly adds replacement-vacancy accounting; incompatible candidate bytes remain exportable. Tactical replay versions remain unchanged. Real vehicle-withdrawal handoffs and destination attachment replenishment remain pending; connected launch stays gated.


### Destination roster and vehicle handoff fixtures

`preparedCompanyDeployment(record, missionId, destination)` now builds an immutable destination roster for infantry missions. It preserves persistent company step/person identities, supplies destination-authored attachments under fresh mission-specific supporting identities, archives prior support formation membership, and retains unresolved historical support casualties. Active departing attachments are recorded as returned to their parent organization, not dead or wounded. It rejects reuse of completed mission IDs and incompatible company formation capacities. Hill 192 HMG attachments are now recognized as support.

A real Vire factory fixture verifies surviving crew membership and withdrawn crew dispositions, exclusion from company donors and replacement vacancies, and complete debrief export. Vehicle destination handoff explicitly rejects until vehicle crew/asset replenishment is implemented; it does not emit an incomplete vehicle deployment.

Evidence: 43 focused tests pass (35 preparation tests, roster and historical compatibility); production build passes with existing size warning. Tactical replay and preparation schema versions are unchanged in this follow-up. Remaining: apply/replay prepared skills in live deployment, conditional Hill 192 engineers with preserved M3 battlefield, supporting vehicle replenishment, M5/M7 full handoff fixtures, and human preparation acceptance. Connected mission launch remains unavailable.
