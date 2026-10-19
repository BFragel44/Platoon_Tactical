# Special formations: first rules audit

Date: October 18, 2026

Purpose: find missing rules and functional defects before more interface redesign.
The initial audit changed no gameplay code, tactical saves or campaign data.

## Repair status — October 18, 2026

SF-01 through SF-05 are implemented. The table below preserves the original
observations. `output/special-formations-audit-fixed.json` records all five probes
passing after the repairs; the original JSON remains available for comparison.

- Named weapons regain their Good Order side when receiving appropriate ammo by
  pickup or direct transfer, as §7.18.3 specifies. This does not restore HQ/FO
  command sides or turn generic LATs into named weapons. Other ammunition does
  not restore an exhausted weapon.
- Hand-grenade eligibility is separate from launcher restrictions. Empty named
  mortar Fire Teams can close assault, and bazooka crews can use hand grenades
  from Building cover. Ranged launcher use, Bunker/Pillbox close-assault limits
  and Good Order mortar prohibitions remain enforced. Named bazooka Fire Teams
  do not retain their launcher range.
- Concentration reserves a normal-volley ammo point. Successful attempts spend
  their extra point, failed attempts do not, and further attempts are blocked
  when only the base point remains. This also applies to enemy procedures and
  multistep mortar concentration. Personal small-arms fire after depletion stays
  available without spending heavy-weapon ammo.
- A dedicated mortar communication check allows a good-order colocated HQ/staff
  with a working command radio/phone link to relay indirect orders. The relay
  need not command that mortar; the actual observer still must. Ordinary command
  communication is unchanged. Phone cuts and missing/unavailable relays break it.

New regression suites: `test/specialFormationRules.test.js` and
`test/specialFormationReplay.test.js`. The latter replays and recovers complete
legal command sequences from authored initial conditions, including spotting
followed by relayed indirect fire, and named weapon resupply. No live player
campaign was loaded or altered. Historical replay compatibility remains outside
this repair batch. Panel layout and tactical probabilities are unchanged.

Final validation: 298 tests passed across 14 focused suites, all five audit
probes passed, and the production build passed with the existing bundle-size
advisory.

Sources: `reference/Fields_of_Fire_Rules_3rd_Edition.pdf` and Normandy campaign
general special rules, particularly printed pp. 12–15. Mission instructions take
precedence over the series rules. This is a first pass, not certification of all
special formations or all seven missions.

## Confirmed defects

Each case is reproduced by `node scripts/auditSpecialFormations.js` using isolated
in-memory tactical fixtures. Machine-readable observations are saved in
`output/special-formations-audit.json`. No live save is loaded or changed.

| ID | Priority | Rule and expected behavior | Observed behavior | Repair boundary |
|---|---|---|---|---|
| SF-01 | High | §7.18.3, p.61: ammunition pickup restores a depleted named weapons team's Good Order side automatically. | A depleted .50 cal HMG accepts ammunition, becomes Exposed and clears its depletion flag, but remains on its Fire Team side. | Restore only named weapon sides when appropriate ammo arrives; check pickup and direct equipment transfer. Preserve personnel and restore original weapon experience. |
| SF-02 | High | §§7.10.1/7.18.2, pp.55/61: a named mortar Fire Team with a weapon VOF can make a point-blank hand-grenade attempt; it uses no mortar ammunition. | An empty one-step mortar on its Fire Team side is rejected because MTR ammunition is zero. | Apply mortar-ammunition and firing restrictions to the mortar weapon, retaining legal hand-grenade actions on its Fire Team side. |
| SF-03 | High | §§7.4/7.5/7.10.1, pp.54–55: launcher restrictions do not prevent the crew's ordinary same-card hand-grenade attack from Building cover. | A Good Order bazooka crew in Building cover is rejected by the enclosed-weapon restriction. | Separate hand grenades from ranged launcher use. Keep Bunker/Pillbox close-assault restrictions and all ranged backblast restrictions. |
| SF-04 | High | §7.18.4, p.61: a tracked weapon must have enough ammunition for a successful concentrated-fire attempt and its normal firing expenditure that turn. | A firing HMG with just one MG ammunition point is offered Concentrate Fire. | Reserve the base firing expenditure; cover repeated attempts, failure, enemy procedures and the final available ammunition point. |
| SF-05 | Medium | §7.3.2, p.53: a mortar can receive an observer's order through a radio/phone-equipped HQ in its own card area; the relay need not be eligible to order that mortar itself. | The CO has a valid radio link to a colocated relay HQ, but a radioless mortar is rejected because communication only checks the mortar directly. | Add the expressly permitted mortar relay without granting general command-net access to unrelated formations or observers. Check voice, radios and field phones. |

These are observed implementation discrepancies against the cited rules, not
inferences from screenshots. The probes deliberately avoid random-success
requirements except where acceptance alone proves the problem. They report
expected versus observed behavior rather than adding tests that normalize defects.

## Existing behavior reviewed

- Mortar direct/indirect distinction and the recent exhausted-ammunition/invalid-
  observer fixes remain covered by focused tests. Two or more steps are needed
  for indirect lay, observer LOS is distinct from weapon LOS, and cleanup ends it.
- Tripod guns have exposed-fire/infiltration restrictions, an extra concentrated-
  fire draw and dedicated grazing/overhead-fire calculations. Full elevation,
  friendly-interposition and FPL acceptance remains outside this first pass.
- Assault Team range and named/generic team reconstitution have focused coverage.
  Passing those tests is not a complete audit of all LAT action-menu exceptions.
- HQ/FO command sides have no ordinary weapon VOF; support-caller roles and
  networks are authored separately. Review the complete caller/agency matrix next.
- Normandy engineers have distinct mine-detection/path-clearing logic. Validate
  it against mission-specific eligibility and repeated attempts in the next pass.
- Normandy mortar deployment has section/team options, abstract section ammo
  bearers and separate-team carrying limits; combat breakdown ammo inheritance is
  covered by existing tests. No new defect is claimed in those mechanisms here.

## Validation and next batch

51 existing tests passed across mortar indirect orders, Normandy ammunition,
Assault Team range, company clarity and reconstitution paths. Those tests do not
cover the five discrepancies above; the audit probes reproduce them separately.

The original recommended implementation batch, SF-01 through SF-05, is complete
with rule-based regressions, exact replay/recovery checks for new legal command
sequences and a production build. UI changes are limited to accurate availability,
reasons and the mortar relay explanation.

After that batch, continue with observer/agency eligibility, pinned/LAT and
reverse-side capabilities, tripod/FPL edge cases, enemy weapon parity, engineers,
and mission-specific restrictions. Demolition/flamethrower/vehicle additions
require a separate check against the units actually present in each mission;
generic rulebook capability alone does not justify adding them to Normandy.

## Follow-up audit — October 18, 2026

Three further defects are reproduced below. These are findings for a subsequent
repair batch; this audit does not modify gameplay code. SF-01–SF-05 remain fixed.

Run `node scripts/auditSpecialFormationsFollowup.js`; observations are preserved
in `output/special-formations-audit-followup.json`. Exit status 1 is intentional
while the expected rule outcomes disagree with current behavior. Fixtures and
draw ordering are isolated in memory, and no player save is read or written.

| ID | Priority | Rule and expected behavior | Reproduced behavior | Repair boundary |
|---|---|---|---|---|
| SF-06 | Medium | §§4.3.3 and 7.16.1, pp.28/58: FOs cannot communicate on CO TAC. An FO receiving an HQ's fire-support order normally needs visual/verbal communication; its FD net reaches the agency, not the ordering HQ. | An Artillery FO legally picks up a dropped CO radio, gains remote company-net communication and passes availability for a company-issued WP mission from another card. | Preserve equipment carriage but enforce network user eligibility when deriving communication. Retain legal same-area voice orders, General Initiative and the FO's own FD agency access. Audit battalion/regimental staff restrictions separately. |
| SF-07 | Medium | §7.10.1, p.55 and Normandy CSR 7, pp.14–15: ranged grenade attacks follow the existing PDF direction, rather than requiring its precise target card. | The enemy ranged-weapon helper accepts an unobstructed nearer target when no PDF exists, then rejects that same target when its existing PDF points to an empty farther card on exactly the same bearing. | Share bearing/valid-PDF rules with friendly attacks; preserve point-blank priority, intervening-unit restrictions, weapon range, ammunition and enclosed-cover limits. Check enemy activity and contact placement, both consumers of this helper. |
| SF-08 | High | Normandy CSR 10, p.15: eligible engineers infiltrating to or within known mines attempt to mark a path. A successful infiltration checks one mine card and clears the path if safe; failed infiltration checks three cards and does not expose them. | Shared movement code applies the engineer procedure only when `hill192` is set. With `vire` or `tinchebray`, safe successful infiltration leaves mines uncleared and uses the ordinary mine procedure; failed infiltration also incorrectly exposes the engineers. The separate Mark Path order already enables these later missions. | Apply the same campaign engineer eligibility consistently to adjacent and within-card infiltration. Keep ordinary movement, one-step/degraded units, mine hits and discovery checks distinct. |

SF-06 uses a legal pickup followed by the normal order-availability check.
SF-07 directly exercises the enemy helper used by contact placement and enemy
combat activity, with a no-PDF control. SF-08 directly exercises shared movement
using an isolated three-step engineer and each mission capability flag: Hill 192
passes both success/failure controls; Vire and Tinchebray fail both. Inspection
also confirms the same Hill-only condition in within-card movement. This is not
an end-to-end vehicle mission or campaign replay test. Authored Vire includes
engineers, and Tinchebray inherits that roster; neither removes CSR 10.

### Reviewed without a new confirmed defect

- The observer/agency validator separately checks published caller allowances,
  the caller's assigned network, mission inventory and agency unavailability.
  Cross-agency FO calls use the caller's own FD net. WP can screen an empty card;
  illumination has its separate face-up-card/no-LOS validation.
- Pinned/LAT movement restrictions and action allowlists exist, including safe
  withdrawal destinations, inability to infiltrate while pinned, and no spotting
  for pinned, Paralyzed or Litter Teams. This is a source review, not a complete
  acceptance matrix for every command or reverse side.
- Tripod regressions cover grazing beyond the first enemy, friendly obstruction,
  permitted overhead fire, smoke/elevation changes and loss of tripod fire when
  exposed. No new defect is established by those checks. FPL acceptance remains
  pending; a generic rulebook option alone is insufficient to add a new mission
  setup feature.
- Engineer repeat attempts need a separate interpretation check: CSR 10 allows
  repeated attempts, while the general action rules limit repeating one action
  in an impulse. The current once-per-impulse guard is **not** logged as a
  confirmed defect merely from the phrase “any number of times.”

Validation: **98 tests passed across eight suites**: special formation rules and
replay, mission tripod/support, Hill 192 engine/weapons, detachment and Normandy
phones. The new probes expose uncovered discrepancies; passing existing tests
does not resolve them. No build was needed because this pass changes only audit
documentation and a standalone read-only probe script.

Recommended next repair order: SF-08 engineer consistency, SF-06 communication
eligibility, then SF-07 enemy ranged-fire parity. Require command-level rejection
and acceptance regressions plus legal replay/recovery checks for changed paths.

## Engineer repair SF-08 — completed October 18, 2026

The engineer-only repair batch is complete. A shared `engineerRulesEnabled`
predicate now governs the Mark Path order, movement into and within mined cards,
command availability and reduced discovery checks across Hill 192, Vire and
Tinchebray. The previous Hill-only movement conditions are removed.

Eligible Good Order two-/three-step engineers use one mine card after successful
infiltration and three after failure. A safe successful attempt marks a path;
failed infiltration does not expose them. Mine hits still prevent further
movement, and ordinary movement does not gain infiltration/path-clearing benefits.
No new units, deployment conditions or UI layout changes are introduced.

`test/engineerMovementRules.test.js` adds 31 cases: all three mission flags,
adjacent/within-card movement, infiltration success/failure, safe/hit mine checks,
ordinary movement and ineligible units. Two authored command sequences verify
exact replay and checkpoint recovery without post-creation tactical/RNG mutation.
Those replay fixtures exercise shared infantry rules, not complete vehicle
mission replay. Existing vehicle-related regression suites also pass.

Validation: **227 tests passed across ten focused suites** and production build
passed (existing bundle-size advisory). All six SF-08 probe observations now
pass; saved to `output/special-formations-audit-engineer-fixed.json`. Its overall
result remains false because SF-06 and SF-07 are deliberately still unfixed.
The original follow-up observations are preserved. Historical saves were not
loaded or migrated; full historical replay compatibility is not certified here.

## FO and enemy ranged-fire repairs SF-06/SF-07 — completed October 18, 2026

Both remaining confirmed follow-up defects are repaired.

- FOs may still pick up and transport recovered CO radios/phones, but neither
  endpoint of an FO command conversation can use CO TAC. Same-area unpinned
  voice contact, self orders and General Initiative remain available. Agency
  validation continues to require the observer's own fire-direction device.
  The rejection explanation now states the FO restriction explicitly. This
  change does not expand the audit to battalion/regimental staff eligibility.
- Friendly and enemy ranged attacks share `followsExistingPdf`: valid existing
  PDFs constrain bearing rather than exact distance. Colocated units and
  temporary PDFs contribute directions; stale invalid basic fire and same-card
  fire do not create an outward PDF. Point-blank priority, intervening units,
  ammunition, range, Good Order and rocket enclosed-cover restrictions remain.

Added 13 focused tests in `test/observerAndEnemyRangedRules.test.js`, including
radio/phone pickup, both communication directions, unchanged state on rejection,
voice/General Initiative support, ordinary HQ networking, near/far bearings,
colocated/temporary/stale PDFs, friendly parity and restricted attacks.
An additional authored sequence in `test/specialFormationReplay.test.js` drops
and recovers a spare CO radio, makes a legal voice-directed WP call, moves the
CO away, then rejects a remote order without changing state. Exact replay and
checkpoint recovery pass for that sequence. A pre-existing Hill 192 test now
uses a valid adjacent off-bearing PDF instead of an impossible long oblique
basic-fire target; it still verifies rejection of a conflicting direction.

The SF-07 audit probe was strengthened with a colocated long-range weapon
supplying a valid PDF, separately from the gun's stale farther-card state.
Original observations remain preserved. All eight follow-up observations now
pass in `output/special-formations-audit-followup-fixed.json`; SF-01–SF-05 probes
also still pass.

Validation: **304 tests passed across 14 suites** and production build passed
with the existing bundle-size advisory. No live saves were loaded or modified.
Enemy helper/contact/weapon regressions pass; this batch does not claim a new
end-to-end historical campaign replay for the changed enemy targeting case.
All confirmed defects SF-01–SF-08 are now closed. The broader audit items and
historical replay certification remain outside these repairs.

## Pinned and reverse-side audit — October 18, 2026

The next audit pass confirms three additional infantry defects. These are open
findings, not implemented repairs. SF-01–SF-08 remain closed. Rules checked:
§4.2.1 (p.22), §4.2.5 (pp.26–27), §7.10.5 (p.55) and named weapon/ammunition
behavior in §7.18 (p.61).

Reproduce with `node scripts/auditPinnedAndReverseSides.js`. Results are saved
in `output/pinned-reverse-sides-audit.json`. It intentionally exits 1 while any
expected result disagrees with implementation. Thirty-two in-memory observations
include 22 passing controls and ten discrepancies belonging to these three bugs.
The script uses production `splitTeam` to construct LATs and the production
grenade procedure or normal command validation/submission to observe behavior.
No player save is read or written.

| ID | Priority | Rule and expected behavior | Reproduced behavior | Repair boundary |
|---|---|---|---|---|
| SF-09 | High | §7.10.5 p.55: unpinned LATs **with a VOF** return a successful same-card grenade attack. Litter and Paralyzed Teams have no combat capability (§4.2.5). | Both unpinned Litter and Paralyzed Teams return successful point-blank grenades. Their internal inherited `vof:'S'` survives LAT construction and the free-response check treats it as a usable printed weapon. Ordinary basic fire correctly rejects them. | Check actual combat-capable side for free grenade responses; preserve Good Order responses to misses, Assault/Fire Team responses only to success, spotted-attacker requirements, cover-stack responses and pinned/fortification restrictions. Check both factions and named reverse sides without treating all named units as armed. |
| SF-10 | Medium | §4.2.5 p.27 explicitly says pinned restrictions take precedence over LAT restrictions. Pinned units may Seek Cover and Move within a Card. | A pinned Paralyzed Team is rejected for both actions by the later unconditional Paralyzed-Team guard. Its unpinned counterpart is correctly blocked. | Apply precedence to these two allowed movement actions. Do not permit infiltration, unsafe adjacent withdrawal, combat, pickup or unsupported recovery while pinned. Preserve communication and load requirements. |
| SF-11 | Medium | §4.2.5 p.26 permits Command & Control actions unless the action requires a Good Order recipient. Switch Radio/Phone Network (§4.2.1j p.22) permits any unit with the appropriate carried device. | The blanket pinned/Paralyzed and Litter action allowlists reject legal network switching: pinned Assault/Fire Teams and pinned or unpinned Litter/Paralyzed Teams. Unpinned Assault/Fire controls succeed. | Permit this specific Command & Control action for eligible device carriers; retain same hardware, destroyed replacement device, communication/General Initiative, command cost and per-impulse limits. This does not grant permission to communicate on a forbidden network or use a support agency. |

### Passing controls and scope limits

- Assault/Fire Teams return successful same-card grenade attacks and do not
  respond to failed attacks; pinned teams do not return attacks. These are
  positive controls for SF-09, not a complete grenade-response acceptance matrix.
- Basic fire is available to Assault/Fire Teams and unavailable to Litter and
  Paralyzed Teams, so SF-09 is an automatic-response eligibility leak rather
  than ordinary automatic fire from those teams.
- Unpinned Paralyzed Teams remain unable to seek cover or move within a card;
  the SF-10 issue concerns the explicitly stated pinned precedence.
- Existing suites cover named weapon depletion/resupply, named mortar/bazooka
  Fire Team hand grenades, launcher loss on a reverse side, detachment, company
  reconstitution paths, patrol HQ restrictions and command menu validation.
  Those passed. This pass does not certify every reverse-side counter's printed
  firepower/range, all vehicle/urban actions or historical replay compatibility.

Validation: **179 existing tests passed across 11 suites**. The new uncovered
cases are recorded in probes rather than tests that assert buggy behavior.
No gameplay source was changed during this audit and no production build was
needed. Recommended repair order: SF-09 first because it creates illegal combat
effects, then the two action-eligibility errors. Verify new legal sequences with
replay/recovery and keep fixes separate from UI redesign.

## Pinned/reverse-side repairs SF-09–SF-11 — completed October 18, 2026

All three confirmed findings are repaired in the shared infantry order/combat
paths:

- Free grenade responses require a live, unpinned armed Good Order, Assault or
  Fire Team side. Internal inherited VOF on Litter/Paralyzed Teams no longer
  permits a response. Success-only LAT responses, Good Order responses to misses,
  spotted-attacker requirements, cover-stack and fortification checks remain.
- The Paralyzed-Team within-card movement prohibition now applies when unpinned.
  Pinned Paralyzed Teams may Seek Cover and Move within a Card while remaining
  pinned and Paralyzed; no infiltration, attack, pickup or recovery permission is
  added. Normal communication, capacity and movement checks still apply.
- Both pinned/Paralyzed and Litter allowlists admit the specific Switch Network
  Command & Control action. Carried hardware, destroyed replacement, communication
  or General Initiative, command cost and once-per-impulse rules are unchanged.

`test/pinnedReverseSideRules.test.js` adds 67 cases covering both factions,
success/miss, pins, Good Order and all four LAT sides, named HQ/FO weapon sides,
unspotted attackers, cover stacks, permitted movement, rejected actions and
network switching constraints/atomic rejection. `test/pinnedReverseSideReplay.test.js`
adds a legal combat-to-orders sequence: ordinary combat creates a pinned
Paralyzed survivor with a radio and destroys a compatible device, then the
survivor seeks cover and switches networks on General Initiative. Exact replay
and checkpoint recovery pass without injected phase, tactical state or draws.
The grenade-response matrix uses isolated production procedures; no new full
campaign replay of every response combination is claimed.

Validation: **287 tests passed across 15 suites**, all 32 pinned/reverse-side
audit observations pass, and both earlier audit scripts still pass. Repaired
observations are preserved in `output/pinned-reverse-sides-fixed.json`; original
findings remain available. Production build passed with the existing bundle-size
advisory. No player saves were loaded or modified and no UI redesign was made.
All confirmed SF-01–SF-11 findings are now closed. Special HQ/staff command and
network eligibility remains the next broader audit area, not a confirmed defect.

## Higher HQ/staff audit — October 18, 2026

Two reachable visitor defects and one conditional BN-network implementation gap
are reproduced. No gameplay repair is included in this audit pass. SF-01–SF-11
remain closed.

`node scripts/auditHigherHQRules.js` produces 21 observations: twelve passing
controls and nine discrepancies across the findings below. Results are saved in
`output/higher-hq-rules-audit.json`. Exit 1 indicates disagreement with expected
rules. Visitors are created by the production Normandy Checking Up event path,
using isolated card ordering/profile selection. Positions, losses and equipment
are test fixtures, not changes to a player campaign.

| ID | Priority/status | Rule and expected behavior | Reproduced behavior | Repair boundary |
|---|---|---|---|---|
| SF-12 | Medium / confirmed | §4.3.3 p.28: regimental staff cannot use CO TAC; battalion staff may use it only while located with Company HQ. | Event-created regimental and battalion staff legally recover CO radio/phone devices and gain remote CO-net communication from a different card. All visitor profiles currently share `higher_hq` role plus numeric seniority, with no explicit network eligibility. | Retain officer echelon/profile as structured data and enforce each endpoint's net permissions. Preserve equipment carriage, same-area voice, permitted colocated battalion-staff use, FO restrictions and ordinary company networking. |
| SF-13 | Conditional network gap | §§4.1.1/4.3.3 pp.18/28: an on-map Battalion HQ or its staff with a working BN TAC device can communicate with Company HQ's BN TAC device and issue the permitted activation. | With both endpoints explicitly equipped with BN radios in the fixture, no communication channel exists and CO activation is rejected. The command communication function implements CO radio/phone channels but no on-map BN radio channel. | Add BN endpoints with role eligibility and actual device requirements, separately from CO TAC. Never grant generic BN access to platoon HQs, company staff or observers, or conflate FD nets with command nets. Verify hardware behavior and agency calls separately. |
| SF-14 | High / confirmed | §6.5.2B p.49: Company HQ succession uses XO, platoon HQs, Arty FO, then **company** staff. Visiting higher officers are outside this list. | After those higher-ranked company candidates are removed, the remaining company staff can consume any of the three visitor profiles as a CO-reconstitution donor. Generic `kind:'STAFF'` fallback gives visitors the company-staff succession rank. | Explicitly exclude higher-HQ visitors from company succession candidates and donors. Keep legal company-staff donors, precedence, Fire Team recovery, issuer authority and patrol/reserve restrictions. Check visitor participation in platoon-HQ reconstitution as a related boundary before implementation. |

### Conditional fixture limitation

SF-13 supplies the pair of working BN devices directly; it does not demonstrate
that an ordinary current Normandy loadout can produce that pair. Checking Up
visitors presently arrive without RT devices. The probe proves missing behavior
when the rule's equipment prerequisite is met, rather than a normal playthrough
failure with the current visitor inventory. Do not automatically issue new radios
to visitors without checking counter assets and mission instructions. In contrast,
SF-12 uses accepted equipment-pickup commands and SF-14 uses accepted HQ
reconstitution commands following the fixture losses.

The Normandy Checking Up instructions (mission book pp.18/22 and later mission
event tables) place a random higher-HQ visitor with the CO for two turns and make
BN HQ on-map. They do not waive the series network or succession restrictions.

### Reviewed controls and remaining scope

- Command reference authority matches the sampled CO/XO/1st Sgt/platoon cases:
  1st Sgt cannot command XO, XO cannot command CO, and platoon HQs command their
  attached squads plus LATs from other platoons. These are focused authority
  checks, not a complete action-by-action hierarchy certification.
- Named HQ Fire Team sides cannot issue movement orders to subordinates, and CO
  cannot activate a platoon HQ on its Fire Team side. Same-area visitor voice and
  legal XO succession pass positive controls.
- Existing event tests cover senior command-side visitor selection (including
  pinning), suppression of off-map activation while a visitor is on its Fire Team
  side, and visitor lifetime. Staff initiative's fixed allowance and saved-command
  handling were source-reviewed; full overlapping-visitor/command-loss acceptance
  remains pending.
- A source-only lead remains: on-map higher-HQ allowance is hard-coded to six
  even though §4.1.1 specifies four in limited visibility. The spend limit remains
  four, and current patrol event tables do not provide Checking Up. No reachable
  Normandy overspending bug is claimed from that code observation.

Validation: **232 tests passed across twelve suites**, covering event lifecycle,
company/patrol HQ reconstitution, command authority/menu, pins/reverse sides, FO
communications and phones. No player save was loaded or altered. No build was
needed because this pass changes only audit documentation and standalone probes.
Recommended next implementation: SF-14 succession boundary, then SF-12 explicit
visitor network roles; resolve SF-13's device-provisioning scope before adding
new inventory or claiming normal-play coverage.

## Higher HQ/staff repairs SF-12–SF-14 — completed October 18, 2026

- Checking Up visitors now retain an explicit `higher_hq_profile`. Older in-memory
  records can resolve the same profile from the existing numeric seniority field;
  display names are not used for eligibility. Unknown higher visitors do not
  inherit ordinary company-staff net or succession permissions.
- Regimental visitors cannot use CO TAC. Battalion visitors can use CO TAC only
  while on Company HQ's card, subject to the existing device/phone-line/SCR536
  cover/LOS checks. Voice, self orders, FO restrictions and ordinary company
  networking remain. Device carriage is still legal regardless of net permission.
- Eligible Battalion Commander/Staff and Company HQ endpoints with actual BN
  radios now have a separate BN SCR300 communication channel. It operates without
  CO TAC LOS/cover constraints, as §§4.3.3/4.3.5 specify (pp.28–29). It also works
  when the company CO TAC system uses phones: Normandy CSR 1 keeps other nets
  on radios. No BN phone network or new device inventory was added. Current
  Checking Up visitors still arrive without radios, so this closes conditional
  equipment-supported behavior rather than creating a new visitor loadout.
- Higher visitors are ranked ineligible for company succession, and are explicitly
  rejected as donors for both company and platoon HQ reconstitution. Eligible
  company staff can still restore CO when earlier successors are gone; precedence
  and recovery requirements remain.

Added 24 cases in `test/higherHQRules.test.js`, covering profile/inventory, CO
radio/phone permissions, both channel directions, voice and pinned users, BN
device and role checks, activation under cover without LOS, company/platoon donor
rejection with unchanged state, legacy metadata and valid staff succession.
Three authored sequences in `test/higherHQReplay.test.js` verify exact replay and
checkpoint recovery: an actual Checking Up event plus recovered radio and CO
movement; combat loss of CO followed by legal staff succession with an intact
visitor; and BN activation using explicitly authored BN devices at both endpoints.
No tactical state, card order or phase is injected into those replay sequences.

The standalone audit's profile selector was corrected to use the R#3 array slot
(`random[1]`, not `random[3]`), exclude the reshuffle card, and assert the resulting
visitor profile. Thus the repaired probes explicitly verify the intended event
profile. Original observations remain preserved; all 21 corrected observations
pass in `output/higher-hq-rules-fixed.json`.

Validation: **302 tests passed across 19 suites**, all earlier audit scripts
continue to pass, and production build passed with the existing bundle-size
advisory. No player saves were loaded or modified. Full historical replay
compatibility remains uncertified. SF-01–SF-14 are now closed within the recorded
scope; the next planned audit is remaining machine-gun grazing/overhead and
mission-authorized FPL behavior. The source-only limited-visibility higher-HQ
allowance lead remains outside this batch.

## Machine-gun grazing/overhead/FPL audit — October 18, 2026

Two additional defects are confirmed. This pass changes audit documentation and
standalone probes only; SF-01–SF-14 remain closed.

Run `node scripts/auditMachineGunRules.js`; preserved observations are in
`output/machine-gun-rules-audit.json`. Twelve isolated cases produce eight passing
controls and four discrepancies belonging to the two findings. Exit 1 indicates
remaining rule disagreements. No player save is loaded or changed.

| ID | Priority | Rule and expected behavior | Reproduced behavior | Repair boundary |
|---|---|---|---|---|
| SF-15 | High | §§5.2.2/7.2.3 pp.35–36/51: an Upper Story raises its occupant one level; overhead eligibility compares firing, intervening and target **unit** elevations. | A level-2 gun fires past a friendly upper-story unit also at level 2 because its card is level 1. Conversely a level-1 gun cannot fire over a friendly level-1 unit at an enemy in a level-2 upper story, although this is expressly permitted geometry. Ground-floor controls behave correctly. | Use actual occupied elevations in obstruction and target selection, including mixed ground/upper-story occupants, both factions and weapon-specific capabilities. Preserve nearest-enemy priority, legal Shift Fire over lower enemies, LOS/smoke constraints, card-wide Basic VOF and no VOF on legitimately overflown cards. Do not confer an HMG's overhead ability on colocated ordinary weapons. |
| SF-16 | High | §§7.2.1/7.11.1/7.12 pp.51/56: the tripod-mounted Automatic Weapons HMG can Concentrate Fire with its extra draw and is subject to weapon jams. | The actual attached HMG's internal `A+` VOF is recognized as Automatic Weapons in Basic VOF calculation but excluded by the Concentrate Fire allowlist. Changing only that code to `A` accepts the order. The jam classifier also omits `A+`; a direct procedure probe draws Jam but leaves the gun intact, whereas the otherwise identical `A` control breaks it into Fire Teams. | Normalize or consistently classify the existing Automatic Weapons representation across concentration, extra draw and jam handling. Keep ammunition reserve/expenditure, pinned/exposed restrictions, named Fire Team behavior and ordinary squad/launcher exceptions. Fix jam handling together with order acceptance to avoid enabling jam-immune HMG concentration. |

SF-15 uses `refresh` on an isolated real Normandy .50 cal HMG, with explicit
ground/upper-story cover and level geometry. SF-16 uses an authored M3 `hmg1`
and normal `submitCommand` for acceptance; its `A` control changes only the VOF
representation. The jam check directly calls the concentration procedure because
the public `A+` command is currently rejected. It demonstrates a latent paired
classifier error, not a separately reachable successful player command today.
M4 imports these M3 HMG definitions; M5 authors the same representation, and
Vire/Tinchebray inherit the attachments too. Later mission impacts follow the
shared definitions/path, not a separate full playthrough of every mission.

### FPL scope decision

§7.2.4 p.52 permits FPL setup in **Defensive Missions**. The current Normandy
missions are offensive or combat patrols; the defensive wording in M3's title
does not turn its combat patrols into a Defensive Mission. The reviewed Normandy
mission instructions provide no FPL setup entitlement, and no campaign FPL
control is authored. Missing generic FPL support is therefore **not** recorded as
a current Normandy bug or justification to add UI. If a future defensive mission
is implemented, it will need its own FPL setup, CO-triggered firing, diagonal
line, movement/automatic-fire lockout, two-ammo expenditure and visibility rules.

### Passing controls and remaining questions

- Ground-level overhead examples pass both valid and invalid geometry controls.
- Three grazing-fire contributions cost one normal MG ammunition point, rather
  than one per receiving card. Exposed tripod fire is suppressed, pinned grazing
  keeps its footprint, and out-of-ammo fire reduces to Close-range small arms.
- Existing tripod tests cover friendly obstruction, grazing beyond the first
  target, overhead paths, smoke, changes in slope, enemy placement and public
  fire explanations without revealing hidden identities. They pass.
- The boundary between a level grazing lane and terrain rising beyond its first
  target needs a diagram-level interpretation check before being called a bug.
  No additional slope defect is asserted from source inspection alone.

Validation: **242 tests passed across ten suites**, including tripod behavior,
Hill 192 weapons, St Germain source checks, vehicle fire/passengers, special
formation rules/replay, ranged weapons, company clarity and command menus. No
build was needed for this read-only gameplay audit. Recommended next repair:
SF-16 concentration/jam classification first, then SF-15 elevation-aware overhead
paths with mixed-occupant and replay/recovery acceptance checks.

## Machine-gun repairs SF-15/SF-16 — completed October 18, 2026

- Concentration eligibility and jam classification now include the existing `A+`
  Automatic Weapons representation. The attached HMG retains its tripod bonus
  draw, normal concentration ammunition rules and jam breakdown. No counter
  ratings, ammo allowances or tactical probabilities were changed.
- Overhead fire now checks the highest occupied intervening level rather than
  only its ground card. A friendly upper-story occupant at the gun/target level
  prevents a new overhead engagement. A spotted, visible upper-story opponent
  can establish the elevated target path over lower friendly units. Mixed
  occupied levels must all be clear. Target elevation also informs the grazing
  trajectory so fire does not bend back down after aiming at an upper story.
- Card-wide Basic VOF still affects the receiving card's ground-floor units;
  legitimately overflown cards receive no VOF. Existing lanes intercepted by a
  unit moving up into them remain subject to the normal friendly-fire rules.
  Nearest-enemy priority, explicit shifting over lower enemies, smoke/LOS and
  per-weapon overhead capability remain. Unknown upper-story targets cannot
  supply an elevated aiming point for friendly weapons.

Added 36 cases in `test/machineGunAuditFixes.test.js`: both factions, tripod and
non-tripod Heavy Weapons versus ordinary rifles, ground/upper/mixed occupants,
hidden targets, target-card VOF, smoke, nearest/shift priorities, colocated
rifles, individual/platoon HMG concentration, success/failure ammo, jam overriding
successful cards, and pinned/exposed/ammo rejections with unchanged state.
Two authored public-command sequences in `test/machineGunAuditReplay.test.js`
verify exact replay/checkpoint recovery for A+ concentration and a friendly unit
moving into an upper story and intercepting an established overhead lane. No
phase, card order or tactical state is injected after creation in those sequences.

Validation: **307 tests passed across 14 suites**, all twelve MG audit cases
pass, and all four earlier audit scripts still pass. Preserved repaired output:
`output/machine-gun-rules-fixed.json`. Production build passed with the existing
bundle-size advisory. No player saves were loaded or modified. FPL was not added;
the mission-eligibility decision above remains. All confirmed SF-01–SF-16 findings
are closed within documented scope; full historical campaign replay compatibility
and the unresolved slope interpretation are not certified by this batch.

## Remaining infantry specialists/equipment/breakdown audit — October 18, 2026

Four new discrepancies are confirmed against the printed breakdown charts and
series rules. SF-01–SF-16 remain closed; this is an audit-only pass.

The Normandy breakdown charts are predominantly counter artwork, so text
extraction alone is insufficient. Printed pp.47–48 were rendered and visually
checked; reference images are preserved under `output/specialist-audit/`.
`node scripts/auditSpecialistBreakdowns.js` uses production `applyHit`, authored
profiles and the production reconstitution eligibility function in isolated
in-memory fixtures. It produces fifteen observations: three passing controls
and twelve disagreements across the following four findings. Results are in
`output/specialist-breakdowns-audit.json`; exit 1 is intentional until repaired.

| ID | Priority | Rule and expected behavior | Reproduced behavior | Repair boundary |
|---|---|---|---|---|
| SF-17 | High | Normandy breakdown p.48, CSR 4 p.14 and series §7.18.1B p.60: the final German 81mm pair consists of the affected mortar on its Fire Team side and the unaffected mortar on its operational G! side; surviving teams each retain the section's ammo count. | A two-step section receiving F produces two mortar Fire Teams and no operational mortar. C or L also leaves the unaffected mortar on its Fire Team side. The US control preserves its operational survivor correctly. | Correct the unaffected German survivor's side without converting generic first-step LATs into named mortars. Preserve F/A versus P/L/C results, pinned state, ammo replication, named-team recovery, woods/cover restrictions and non-reconstitution of sections. |
| SF-18 | High | Normandy breakdown p.48 and §6.4.3 p.47: the two-step 88mm has no Good Order one-step gun side; its last surviving step becomes the chart's Fire Team. | F, C or L on the two-step 88mm leaves the original unit with one step, Good Order and H VOF. It can retain gun capability after unpinning instead of completing its breakdown. | Author/enforce whether a multistep weapon has a legal Good Order one-step side. Do not apply squad-specific breakdown blindly to mortars or two-step weapons that do have one-step sides. Check 75mm gun counter sides separately; only the 88mm chart is asserted here. Preserve people, cargo/ammo disposition and simultaneous combat resolution. |
| SF-19 | High | Normandy breakdown p.48: an A/S Fallschirmjäger squad ends with an S Fire Team and an A/S Fire Team. | M2/M3/M4 profiles and the inherited M6/M7 profiles specify `last_step_vof:'S'`, producing only S teams. M5 already specifies A/S and passes. | Align the affected authored profiles with the chart while preserving their first-step S team, Close-range Fire Team limit, experience and lack of belt-fed MG ammunition. Handle scenario/content compatibility deliberately; the prior M5 source audit expressly preserved Cerisy's original content and tests currently assert that historical boundary. |
| SF-20 | Medium | §6.5.2 p.49: reconstructed squads cannot gain firepower beyond their donors. An A/S Fire Team plus S Fire Team provides the weapons for its original two-step A/S squad. | Actual M5 breakdown teams with A/S and S ratings are rejected by `reconstitutionFirepower`, which requires an A-rated MG team for both A and A/S squads. | Distinguish automatic-rifle A/S firepower from belt-fed A MG firepower in eligibility and donor selection. Preserve rejection of two plain S teams, generic point-blank Assault Team limitations, original squad capacity, experience and carried equipment. Check enemy activity selection as well as friendly reconstitution paths. |

SF-17/SF-18 exercise normal hit effects on authored enemy weapon profiles.
SF-19 applies the same breakdown procedure to each mission's actual profile;
M6/M7 definitions are inspected through an infantry fixture, not a vehicle
mission playthrough. SF-20 selects two real M5 breakdown children and removes
their pin state to model eligible recovered donors before checking firepower.
It is a shared eligibility-procedure probe, not a player command ordering an
enemy formation.

### Specialist and equipment scope decisions

- The mission book provides engineers for CSR 10 mine detection/path clearing
  (M4 conditional attachment, M6/M7 listed attachments). The reviewed Normandy
  mission allocations contain no demolition charges or flamethrower units.
  Generic §§7.13/7.14 capabilities alone do not authorize those equipment/actions;
  their absence is not logged as missing Normandy implementation.
- Engineers losing steps use the ordinary S squad/Fire Team breakdown chart.
  Generic engineer-derived LATs cannot clear paths because eligibility requires
  a Good Order two-/three-step **SQUAD**. Existing mine discovery, movement and
  path-clearing regressions remain relevant; no new engineer action is proposed.
- The German A-rated MG Fire Teams on the chart are Close range. A source lead
  involving stored `range:2` is not a confirmed range bug: effective Fire Team
  range is already clamped to Close. Do not change that behavior without checking
  the printed counter side.
- Existing tests cover finite ammunition/depletion/resupply, Grenadier/FJ MG ammo
  transfer, US mortar ammo inheritance, launcher/hand-grenade separation,
  weapon jams, reconstitution and named/generic team distinctions. Passing those
  tests did not establish the four missing chart/eligibility cases above.

Validation: **294 existing tests passed across eleven suites**. No gameplay
source, player saves or tactical probabilities changed. No build was needed for
this audit-only pass. Recommended next repair batch: SF-17/SF-18 weapon survivor
sides, followed by SF-19/SF-20 A/S breakdown and reconstitution together. Add
rule-based regressions and legal replay/recovery tests; preserve historical
content/replay handling rather than silently changing archived mission profiles.
This closes the planned infantry specialist review pass, not certification of
every vehicle, mission outcome or historical campaign save.
