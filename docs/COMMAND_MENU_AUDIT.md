# Third-edition command menu audit

October 9, 2026. Shared simulation rules **33**; mission content versions unchanged. Scope: published pp.22–25, encompassing §§4.2.1–4.2.4k, for authored Normandy Missions 1–5. Applicable actions use shared command validation rather than mission-number gates. Later missions must supply their equipment, support agencies and communication policies; this audit does not certify unauthored M6/M7 content.

## Sources

`reference/Fields_of_Fire_Rules_3rd_Edition.pdf`: pp.22–25 extracted, rendered and visually inspected; communications pp.27–29 and reconstitution pp.49–50 also rendered and visually inspected. §4.1.3 on p.20 was checked for General Initiative exceptions. The supplied BGG “Supplement Squad - location” screenshot explains communication with every recipient, including teams in different cover areas using working phones/radios. It supplements the printed rules; it is not a new mission exception. Screenshot thread: https://boardgamegeek.com/thread/3778438/supplement-squad-location.

## Command & control — §4.2.1, p.22

| Action | Shared implementation / applicability |
| --- | --- |
| a Activate subordinate HQ | `ACTIVATE`; active higher/company HQ, live command-side subordinate, communication and activation checks. |
| b Exhort | Optional checkbox on attempted orders. Reserve one extra command; spend it and draw exactly one additional card only after failure. One issuing HQ may exhort once per impulse. Default off. Available during command impulses, including General Initiative with a communicating HQ/staff; does not silently spend commands during automatic enemy/combat resolution. |
| c Pyrotechnic | `PYRO_*`; assigned device/order, visibility restrictions and eligible signal location. Good Order or unpinned Assault/Fire Teams carrying the device. |
| d Reconstitute platoon HQ | `RECONSTITUTE_HQ`; Company HQ/staff, eligible donor, eliminated HQ and communication. Actual donor step retained, HQ restored Green; the donor exception in §6.5.2 is not rejected by ordinary command-chain restrictions. Cargo is dropped when its original carrier is removed. |
| e Reconstitute company HQ | `RECONSTITUTE_HQ` through company staff, or `BN_RECONSTITUTE_CO` during the off-map BN impulse with an eligible successor carrying BN TAC. XO → platoon HQ → artillery observer → staff precedence; surviving higher-ranked named Fire Teams must recover first. BN availability/visitors/blocked state and six-command daylight/four-command limited-visibility allowance checked. |
| f Create runner | `CREATE_RUNNER`; Company HQ, explicit existing donor step, communication, two-runner limit. Available in CO's impulse and General Initiative with CO as originator. |
| g Dispatch runner | `DISPATCH_RUNNER`; available runner, eligible unactivated command-side HQ/staff; next-turn delivery. Company HQ remains originator in General Initiative. |
| h Dismiss runner | `DISMISS_RUNNER`; Company HQ, runner box and recipient capacity/location checks. |
| i Anti-tank designation | Vehicle command deferred: no playable vehicles or applicable target designation in M1–M5. Panzerfaust equipment remains inactive against infantry. |
| j Switch radio/phone network | `SWITCH_NETWORK`; carried device and available removed/destroyed same-hardware counter on another network. SCR536 cannot substitute for SCR300; phones cannot substitute for radios. Counter and resupply allocations exchanged without creating devices. Recoverable ground equipment remains available through pickup. |
| k Repair cut phone line | `REPAIR_PHONE_LINE`; phones enabled, cut line, Good Order repairer and originating HQ/staff on that card. |
| l Designate tactical control | `DESIGNATE_CCP`; company HQ/staff, or selected platoon HQ in a single-platoon patrol, designates its own terrain card. Current CCP changes without altering the next patrol's authored preparation plan. Helicopter/LZ/vehicle MEDEVAC controls remain deferred. |

## Movement — §4.2.2, p.23

| Action | Shared implementation / applicability |
| --- | --- |
| a Move adjacent | `MOVE`; adjacency, mission boundaries, pin/cohesion, loads and patrol restrictions. |
| b Move platoon | `PLATOON_MOVE`; two commands, own platoon HQ, eligible communicating members, shared movement restrictions. |
| c Infiltrate adjacent | `INFILTRATE`; individual attempt under applicable fire/exposure restrictions. |
| d Infiltrate platoon | `PLATOON_INFILTRATE`; two commands, individual draws for eligible members. |
| e Seek cover | `SEEK_COVER`; terrain draws, experience, capacity and discovery restrictions. Upper-story variant where authored. |
| f Move within card | `ENTER_COVER`; exposed/protected movement and cover capacity; repeated within-card movement permitted. |
| g Infiltrate within card | `INFILTRATE_WITHIN`; separate attempt, same-card area and exposure restrictions. |
| h Pick up | `PICKUP_RADIO` recovers ground equipment/ammunition; `PICKUP_CASUALTY` handles ground casualties and transfer from another carrier; `TRANSFER_EQUIPMENT` takes a selected quantity from another friendly unit in the same area. Stock, asset/ammo limits and casualty carrying limits validated; involved formations exposed. Free drops remain available. Vehicle embark/disembark is deferred. |

## Rally — §4.2.3, p.24

| Action | Shared implementation / applicability |
| --- | --- |
| a Remove pin | `RALLY`; originator experience and communication exception for unpinning. |
| b Paralyzed → Litter | `RECOVER`; current cohesion and fire-dependent recovery. |
| c Litter → Fire | `RECOVER`; separate action/draw where required. |
| d Fire → Assault | `RECOVER`; generic Fire Team; named Fire Team recovers its original counter instead. |
| e Assault → Fire | `ASSAULT_TO_FIRE`; unpinned Assault Team, automatic, one command. |
| f Named Fire Team → Good Order | `RECOVER`; restores command/observer/weapon side and its original experience. |
| g Detach team | `DETACH` / `DETACH_FIRE_TEAM`; Good Order 3–4-step squad or two-step weapons team. One existing step, no draw. Both share one per-impulse Detach allowance. Optional radios, equipment and ammunition assigned during detachment without another command, with stock/carrying-limit validation. Normandy General Initiative does not require an HQ originator (§4.1.3); legacy Company Assault/KUTF command policy retained. |
| h Supplement squad | `SUPPLEMENT`; Good Order 2–3-step squad with original counter capacity and unpinned one-step Assault/Fire Team on the same card. One command, no draw; preserves squad experience and actual step/person identities. In HQ impulses the HQ must communicate with both recipients, including their respective cover areas. Normandy General Initiative follows §4.1.3's no-HQ/no-communication exception. Donor removed, physical loads and resupply allocation transferred once. |
| i Reconstitute squad | `RECONSTITUTE`; 2–4 distinct eligible one-step teams, eliminated friendly squad counter, original capacity/firepower. Requires communicating HQ/staff even during General Initiative; checks every contributor. Normandy permits different cover areas with working phones/radios. §12.6 experience and existing loads preserved, including patrol missions. |
| j Flip to Fire Team side | `DEPLOY_FIRE_TEAM`; eligible named counters with an implemented Fire Team side. No invented Fire Team side for a multistep mortar section. |

## Combat — §4.2.4a–k, p.25

| Action | Shared implementation / applicability |
| --- | --- |
| a Spot | `SPOT`; Good Order, LOS and spotting modifiers; public targets are location-based to protect unspotted enemy identities. |
| b Concentrate fire | `CONCENTRATE`; eligible basic VOF already projected onto a spotted position, experience draws, target area, ammunition and jam checks. Random out-of-cover target. |
| c Platoon concentrate | `PLATOON_CONCENTRATE`; two commands, own platoon HQ, communicating eligible members on its card. Each makes its own concentrate attempt against the selected cover stack/out-of-cover area; random out-of-cover target per member. |
| d Grenade attack | `GRENADE`; legal spotted target/area, range/cohesion, attempt and return procedures. |
| e Throw demolition charge | Inapplicable: no authored demo-capable profile with demolition-charge inventory in M1–M5. Mine-clearing engineers do not automatically acquire demolition capability. |
| f Place demolition charge | Same equipment/profile boundary as e; not exposed as a fictitious usable order. |
| g Flamethrower | Inapplicable: no authored flamethrower inventory/profile in M1–M5. |
| h Platoon grenade attack | `PLATOON_GRENADE`; two commands, own platoon HQ, communicating eligible members on its card, individual attempts against one selected target/cover stack. |
| i Off-map support | Mission-authored `CALL_*` agencies, observers, networks, caller draws, finite HE/WP/illumination/TOT availability and battalion choices. Vehicle/aircraft agencies not authored remain deferred. Conditional Exhort also covers a failed support call without a second inventory expenditure; a pinned command-side issuer can use a working network rather than voice. |
| j On-map indirect mortar | `INDIRECT`; Good Order mortar of at least two steps, communication, firing restrictions, originator LOS, range, spotted target and ammunition. |
| k Cease fire | `CEASE_FIRE`; communication regardless of nominal chain, card-wide forwarding, automatic reopening on eligible enemies retained. |

This audit ends at p.25. The continued combat menu on p.26 and vehicle sections are not certified by this checklist.

## Player flow

Select the eligible squad, choose **Supplement squad**, then select the contributing team. Unavailable actions retain reasons. Optional Exhort is a checkbox on attempt orders, not a separate post-resolution dialog: enabling it authorizes one immediate extra draw only on failure, subject to the issuing HQ's remaining command allowance. For a platoon attempt it applies to the first eligible failed member attempt. No automatic-phase interruption or hidden enemy recipient selection is introduced.

Detach orders retain both team options and add a compact optional equipment allocation. Direct equipment pickup uses readable donor/item labels and a quantity input. The right-panel arrangement, counters, map controls and explicit phase stepping are preserved.

## Validation evidence

- `test/commandMenuAudit.test.js`: focused all-five-mission Supplement visibility, stock/person preservation, phone/voice distinctions, rejection/atomicity, team conversions, same-hardware exchange, CCP, equipment/casualty transfer, optional detachment loads, HQ precedence/off-map BN restoration, both platoon attacks, conditional Exhort limits, General Initiative exceptions and exact legal detachment → supplementation replay.
- Existing detach, communication, phones, runners and reconstitution suites exercised alongside the new fixtures.
- Rules-33 complete runs in `output/st-germain-playtests-v2-r33/`: three authentic three-patrol variants, including successful and failed outcomes and a defender variant with local reconstitution. Exact replay, save/reload and duplicate-debrief rejection pass.
- Rules-33 complete runs in `output/hill192-playtests-v2-r33/`: first-attempt success, preserved M3 battlefield defeat → reattempt → success, and forward-defense defeat → reattempt → success. Exact replay, immutable attempt records, save/reload and duplicate-debrief rejection pass.
- Six Company Assault scripted runs and KUTF `kut-1 support` pass exact replay; new exports stored separately in rules-33 output folders.
- Actual browser DOM check on isolated `127.0.0.1:5177`: resumed a legal detached-team checkpoint; selected Supplement, selected its donor, issued the order, reloaded/resumed and verified three restored squad steps. Conditional Exhort checkbox/help verified. Readable equipment donor/item labels and the quantity input were checked, then a one-smoke transfer was issued and the receiving inventory verified without browser console errors. Screenshot capture timed out; this is functional browser evidence, not completed visual/narrow-layout verification.
- Production build passes; existing large-bundle warning remains.

**Final validation:** 88 test files / 1,339 tests passed using `node node_modules/vitest/vitest.mjs run --pool=threads --maxWorkers=2 --testTimeout=60000`, including 42 command-audit fixtures and all refreshed complete-run fixtures. Production build and `git diff --check` passed. Thread workers avoid a Windows fork-worker termination error; the extended timeout covers existing complete-patrol tests. M5 subsequently received the user's explicit-phase acceptance on October 9 and is available in normal selection; no accepted M1–M4 roster slot is changed. Rules-32 and older tactical recoveries remain incompatible with current execution and retain their original export access; no records are relabelled or rewritten.

October15 patrol correction: RECONSTITUTE_HQ targets now require an eliminated counter, never intact reserves/embarked HQs. In M3/M5 only the currently patrolling platoon's HQ may be restored; its normal §6.5.2A donor/order restrictions still apply. Menu and executor use the same gate; Company HQ succession remains unchanged.
