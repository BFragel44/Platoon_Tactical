# Expanded Cleanup lifecycle audit

October 19, 2026. Audit only; no gameplay, probabilities, UI or compatibility rules changed. This extends the earlier recovery/retreat/Cleanup pass with before-and-after fire state and a native M3 replay.

## Sources and method

Local Fields of Fire third-edition series rules: §§3.7.1–3.8 p.17 (support timing, simultaneous combat and Cleanup), §6.4.1 p.47 (frozen combat), §7.16.3 p.59 (pending support versus immediate illumination), §7.16.5 p.59 (registered targets), and §§9.2–9.2.1 p.70 (illumination expiry and LOS).

`scripts/auditCleanupLifecycle.js` calls production combat, support, fire-refresh and phase operations from isolated in-memory starting states. Controlled actual Action Cards produce a source casualty and a successful illumination request. Synthetic phase/deck fixtures are explicitly diagnostic, not full campaign playthroughs. No player save is opened or modified.

Run `node scripts/auditCleanupLifecycle.js`. All **31 observations pass**; output is retained in `output/cleanup-lifecycle-audit.json`.

## Verified lifecycle

- Grenade, grenade miss, concentrated fire, illumination, infantry Sniper, active mine attack and WP smoke markers remain through combat review and entry into Cleanup. They disappear when the Cleanup step resolves. A synthetic Booby Trap marker also passes removal; this does not assert a Normandy equipment allocation or implementation of unrelated demolition actions.
- A firing enemy killed during individual combat resolution retains its frozen fire contribution and concentrated-fire marker for the other prepared recipient. Both remain unchanged through review and entry into Cleanup. Cleanup removes the dead source's fire, removes concentration and clears the prepared combat queue.
- Illumination expiry removes its long-range LOS benefit at night. Weather +2 prevents that illumination benefit before expiry as well. Adjacent combat remains possible after expiry but receives the original light penalty again; weather is never erased by illumination.
- Both smoke strengths stop blocking outgoing fire during Cleanup. Normal fire can re-establish immediately after smoke clears.
- A surviving exposed tripod weapon can reopen fire when Cleanup removes exposure, without spending another ammunition point during this fire-state refresh.
- ACTIVE Incoming survives Cleanup and every tested next-turn command/capture/retreat boundary. PENDING support remains pending during that interval. The next Fire Mission Update removes the old mission and activates the pending one before recovery and combat. Removing Incoming in Cleanup would contradict §3.7.1.
- Off-map illumination appears immediately, creates no PENDING support entry, spends one mission, and expires in Cleanup without a refund.
- Dropped equipment, cut phone lines, registered artillery targets, permanent minefields and discovered cover survive Cleanup.

No new mismatch was confirmed. These are focused passing controls, not certification of every mission-specific marker or vehicle effect.

## Native replay acceptance

`test/cleanupLifecycleReplay.test.js` starts the actual `stGeorges` scenario with a fresh seed and only public commands/phases afterward. The Artillery FO successfully calls illumination, then Company First Sergeant deploys screening smoke under a Company HQ order. Normal HQ selection and phase stepping reach Cleanup. Both effects remain at Cleanup entry, then disappear after resolution; the spent illumination mission remains spent.

Executable replay and checkpoint recovery reproduce the complete state exactly both before and after Cleanup. This sequence does not inject phases, deck order, marker state or combat outcomes after mission creation. It is a one-turn lifecycle acceptance test, not a complete patrol/campaign playthrough.

## Validation and limits

**148 tests pass across eight focused suites**: the new lifecycle probes/replay, prior recovery/Cleanup controls, M3/M5 illumination, player-choice/card-pull combat and machine-gun rules. `git diff --check` passes. No production build was needed because gameplay/UI source files were unchanged.

Vehicle wreck/Sniper retention, defensive unresolved-PC removal, unused generic weapons and complete mission-specific event expiry are outside this pass. The previous recovery/retreat audit covers basic automatic unpinning, temporary mortar PDFs, used-action reset and enemy retargeting. The separate carried-casualty cover lead CR-10 remains open; Cleanup passing these controls does not close it.


### CR-10 status update — October 19, 2026

CR-10 is now confirmed through the production Lost in the Dark event and repaired for new missions. All 39 casualty/equipment observations pass. See [INTEGRATED_COMBAT_ACCEPTANCE.md](INTEGRATED_COMBAT_ACCEPTANCE.md) for the exact event-fixture scope, replay compatibility and integrated acceptance results. Earlier open-status notes describe the pre-repair audit.
