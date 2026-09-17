# Event model

## Principle
The simulation determines what happened. Events record it. Presentation interprets it.
The event collection is ordered history, not the mechanism for rebuilding current state.

Each event retains id, sequence, type, turn, phase, location_id, actor, target, cause, result, metadata, caused_by_event_id and visibility. IDs are stable, sequence is monotonic, and all random outcomes are driven by the mission RNG.

## Implemented vocabulary
- Mission: MISSION_STARTED, MISSION_ENDED, TURN_ENDED, COMMAND_CAPACITY_REFRESHED.
- Commands: COMMAND_ISSUED, COMMAND_COMPLETED, COMMAND_FAILED.
- Movement and leadership: UNIT_MOVED, MOVEMENT_HALTED, UNIT_EXPOSED, EXPOSURE_ENDED, LEADER_TRANSFERRED.
- Contact: CONTACT_TRIGGERED, CONTACT_RESOLVED, ENEMY_GENERATED, SPOTTING_ATTEMPTED, UNIT_SPOTTED, FIRE_ORIGIN_DETECTED.
- Fire: FIRE_OPENED, FIRE_CEASED, FIRE_DIRECTED.
- Recovery: SUPPRESSION_CHANGED, UNIT_SUPPRESSED, UNIT_PINNED, UNIT_RECOVERED, UNIT_RALLIED, RALLY_FAILED.
- Cover: COVER_SEARCHED, COVER_FOUND, COVER_SEARCH_FAILED, UNIT_ENTERED_COVER.
- Combat: ASSAULT_RESOLVED, UNIT_WITHDREW, SOLDIER_WOUNDED, SOLDIER_KILLED, ENEMY_ACTIVITY.
- Objective: OBJECTIVE_OCCUPIED, OBJECTIVE_CONTESTED, OBJECTIVE_SECURED.

COMMAND_ISSUED records actual command cost and command ID; completion or failure points back to it. UNIT_MOVED includes origin and destination. Fire records source and target Locations. Suppression records previous/new values and links to the incoming fire event where available. Casualties identify named soldiers and their lost role. Leadership casualties refer to the separate attached leader.

## Fog of war
ENEMY_GENERATED and diagnostic spotting attempts are simulation-only. Hidden cover discovery and hidden enemy effects remain private. Visible incoming-fire reports identify a source Location without inventing enemy identity.

getPlayerView constructs allowlisted data. getVisibleEvents clones only events visible at emission time and removes causal references to invisible events. A later spotting success must not reveal an earlier generation event. Never pass authoritative state or hidden diagnostic events to UI components.

Knowledge of a firing origin permits directing pressure at a suspected hostile position. It does not reveal force composition. A completed contact check is reported without claiming a Location is clear.

## Presentation and AAR
metadata.text is a concise player-safe description captured at emission. Structured result fields, not prose, support AAR categorization. Empty descriptive text is permitted for bookkeeping completion events, which remain available in visible diagnostics.

The normal feed displays meaningful changes; diagnostics show only the visible event projection. At mission end, the AAR collects orders, casualties and objective history from the same visible events. It does not reveal hidden truth afterward.

No event needs to say BRAVO_HEROICALLY_SACRIFICED_ITSELF. Narrative meaning comes from ordinary facts and player decisions.

## Deferred
Extraction, stabilization, experience awards and campaign persistence will add events only when implemented. No database, replay engine, generalized event bus or AI narrative system is needed for M0.
