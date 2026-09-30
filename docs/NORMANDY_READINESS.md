# Normandy — next delivery gates

KUTF standalone playability is accepted. Normandy 1: Trévières stays unavailable because its own dependencies are missing. The next implementation milestone is the modular mission/roster foundation, not another expanded training mission.

## 1. Mission and roster foundation

- [ ] Separate mission-defined forces, terrain, contacts, tactics, events, support, objectives and exceptions from rules execution. Replace hardcoded HQ assumptions behind explicit capabilities; preserve existing APIs with KUTF/course adapters.
- [ ] Add a separately versioned campaign save with stable company/person/step/formation identities, experience and disposition. Do not carry pins, PDFs, exposure, commands or contacts between missions.
- [ ] Deploy from an immutable roster snapshot; record that exact snapshot, setup, seed and content/rules versions in replay. Later campaign changes cannot rewrite earlier missions.
- [ ] Apply a terminal mission's roster delta exactly once by mission ID. Reject active-mission debriefs, duplicate application and mismatched roster revisions. Reloading cannot duplicate losses or rewards.
- [ ] Keep campaign saves separate from mission autosaves, with backup/export and explicit version errors. Do not silently promote a historical KUTF company into Normandy.

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
