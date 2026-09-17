# Company Assault architecture

## Boundary

`src/sim/company/` is DOM-independent. `src/scenarios/companyAssault.js` authors the course. `src/ui/companyMain.js` renders only player projections and visible event text. The old platoon modules remain regression fixtures; the public simulation index dispatches by `ruleset`.

Public operations retain immutable input semantics:

- `createMission(scenario, seed)` constructs `company-v1` state.
- `submitCommand(state, {type, issuer_id, unit_id, target_id})` validates and immediately resolves an order. Rejection preserves state and RNG.
- `selectHQ(state, id)` starts a chosen eligible subordinate impulse; `SELECT_HQ` is also accepted by submitCommand.
- `advancePhase(state)` resolves the displayed segment, or completes the active impulse. Remaining eligible subordinate HQs must be selected before leaving their segment.
- `endTurn(state)` is diagnostic fast-forward only; unused commands are saved/discarded according to impulse rules.
- `abortMission`, `getPlayerView`, `getVisibleEvents`, `getAfterActionReport` support mission ending and historical player views.
- `exportReplay` records scenario/rules version, seed and accepted operations. `replayMission` reconstructs state/history and rejects mismatched versions.

## State and resolution

Core state contains formations with step/personnel provenance, HQ reserves and impulses, locations/cover, PCs and enemy counter pool, knowledge, fire relationships, support missions, combat markers, casualties, radio assets, action deck order/discard, RNG and events.

`core.js` handles the normalized GMT deck, seeded shuffle and event creation. Full attempt batches are drawn before reshuffling. `battlefield.js` handles communications, LOS, automatic fire and combat modifiers. `actions.js` handles eligibility and immediate orders. `combat.js` handles contacts, enemy priorities, mutual effects and recovery-related transitions. `engine.js` coordinates phases and projections.

Ordinary map changes refresh fire immediately. Combat effects freeze all target modifiers before applying any results and delay fire updates until cleanup. Stable unit ordering ensures dictionary insertion order cannot alter results.

## Visibility and diagnostics

Simulation events may contain hidden information. Never render raw operation `events` without filtering their `hidden` flag. The normal history and AAR use `getVisibleEvents`, which also strips hidden causal references. Unspotted fire sources are anonymous; their location and friendly consequences may be reported. Deck order, counter pools and unknown enemy records are absent from the player view.

Replay exports are reproducibility artifacts, not secure multiplayer saves: a seed plus rules can reconstruct hidden information. No save migration is required; old in-memory missions are not loaded into this ruleset.
