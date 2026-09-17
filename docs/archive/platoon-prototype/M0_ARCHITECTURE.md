# M0 architecture — Three-team encounter

## Boundaries
Scenario data authors the Location graph, separate reciprocal firing lanes, terrain protection, shared additional-cover positions, soldiers, three teams, attached leader, contact profiles and an objective.

The DOM-independent simulation owns state, seeded randomness, legality, observation, fire, effects and event history. Public operations return a new serializable state without mutating their input. Rule functions may mutate the private working copy. Presentation receives only player projections and visible events.

## Public interface
- createMission(scenario, seed): validate and clone the scenario; create three teams and leader, seed the mission, and draw initial commands.
- submitCommand(state, input): validate, spend commands and immediately resolve an order; return state, events, accepted and reason. Invalid commands consume no state, events or randomness.
- endTurn(state): resolve all remaining internal phases and return state/events at the next command opportunity or terminal outcome.
- advancePhase(state): diagnostic stepping through the exact same coordinator.
- abortMission(state): record ABORTED and stop the encounter.
- getPlayerView(state, factionId): player-only allowlisted state and authoritative action options.
- getVisibleEvents(state, factionId, afterSequence): cloned visible history with hidden causal links removed.
- getAfterActionReport(state, factionId): terminal outcome and event-derived orders, casualties, objective events and chronology.

Command input retains type, faction_id, team_id and optional target. MOVE, ASSAULT and DIRECT_FIRE use target.location_id; TRANSFER_LEADER uses target.team_id. OBSERVE, SEEK_COVER and RALLY have no target. Queued execution is superseded.

## State and rules
Mission retains normalized entity maps, ordered events and a serializable RNG. New state includes leader attachment/condition, allowance and reserve, objective holding progress, per-team actions/exposure/fire intent, Location firing lanes, and discovered cover.

Fire relationships have a source team and target Location. Occupants receive pressure individually, with their exposure and cover applied. Source capability derives from effective soldiers, weapons and suppression. Relationships continue without commands and update after actions. Friendly occupation masks support fire into that Location.

Contact entry records remain pending until contact evaluation. Generation can place enemies in an overlooking Location. Stationary passive observation occurs once per observer/target each turn; an Observe command provides an additional deliberate attempt. Enemy acquisition is simplified: an active defender can engage visible friendly Locations without a separate spotting draw.

## Turn sequence
Command orders resolve immediately, followed by observation and automatic-fire updates. End Turn executes:
1. Enemy activity and fire updates.
2. Pending contacts, observation and fire updates.
3. Recovery, calculated from a common pressure snapshot.
4. Mutual combat effects, calculated before any effects commit.
5. Cleanup, fire validity, objective/end checks and turn summary.
6. If active, increment turn, retain at most two commands and draw the new allowance.

Combat uses stable entity ordering. Rendering and projections consume no random draws. Common-snapshot effects prevent earlier casualties or suppression from cancelling another source's already-calculated fire.

## Knowledge and events
Truth and player knowledge remain separate. Unidentified incoming fire emits a Location-only report with no hidden team ID. Known enemy information contains coarse composition and tactical state, not its private personnel. Discovered enemy cover remains private until friendly discovery. Live history never retroactively reveals generation events. Causal links to invisible events are removed from visible projections.

The AAR retains the player's historical perspective. Events record facts; they do not classify heroism. Ordered in-memory events are sufficient; no event-sourcing infrastructure is required.

## Implementation and compatibility
Keep Vite, plain JavaScript and Vitest. Shared numerical rules live in sim/rules.js; behavior remains in focused command, contact, spotting, fire, effects and turn modules.

Scenario version 2 changes command timing and fire relationship meaning. There is no saved-game migration because M0 has no persistent saves. Legacy record constructors remain available for structured-record consumers; runtime commands are immediately resolved rather than queued.

Tests must cover deterministic state, legality, fog of war, pressure and recovery, casualty capability, objectives, and endTurn/diagnostic equivalence. The manual guide is the authority for gameplay values and acceptance exercises.
