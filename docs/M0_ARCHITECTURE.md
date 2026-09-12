# M0 — CONTACT Architecture

## Purpose

M0 exists to test whether a small firefight across abstract Location nodes can
produce interesting and understandable tactical decisions. This architecture
supports only the authored M0 scenario and its loop of movement, uncertain
contact, autonomous fire, suppression, cover, rallying, and event history.

The implementation should be a browser-based JavaScript prototype built with
Vite and tested with Vitest. The simulation itself must not depend on the DOM,
rendering code, or a UI framework.

Fields of Fire is useful here only for the broad idea that command activity,
contact evaluation, combat effects, recovery, and cleanup occur in distinct
phases. M0 will use its own terminology, rules, data, and probabilities.

## Architectural Boundaries

M0 has three boundaries.

### Scenario Data

Scenario data describes the fixed prototype setup:

- the Location graph and its tactical properties
- the friendly team and its soldiers
- unresolved Potential Contacts
- possible enemy definitions used when a Contact resolves
- M0 tuning values consumed by rule functions
- mission start and end conditions

Scenario data contains no executable UI behavior and does not change during a
mission. `createMission` copies the parts that become runtime state.

### Simulation Core

The simulation core is authoritative. It:

- creates and advances Mission state
- validates and resolves Commands
- advances the turn phases in a fixed order
- owns and consumes seeded randomness
- resolves contacts, spotting, fire, suppression, cover, rallying, and the
  simplified M0 casualty model
- updates each faction's Knowledge State
- records every meaningful committed change as an Event
- produces player-safe projections for presentation

Simulation functions may use local mutation while resolving one operation, but
their public boundary returns a new state result. Callers must treat prior state
and returned Events as immutable. All authoritative state must remain plain,
JSON-serializable data.

### Presentation

Presentation renders a Command View, accepts player intent, and displays visible
Events and the eventual AAR. It does not calculate outcomes, inspect hidden
state, call the random generator, or decide which actions are legal.

The UI receives only:

- a player-view projection produced for the friendly faction
- Commands currently available according to that projection
- Events explicitly visible to that faction

Although M0 runs entirely in one browser, this boundary must be respected as if
the simulation were an external service. Passing the complete Mission to a UI
component and hiding secret fields during rendering is not sufficient.

## Minimal Public Interface

The simulation should initially expose five operations:

```js
createMission(scenario, seed) -> missionState

submitCommand(state, commandInput) -> {
  state,
  events,
  accepted,
  reason
}

advancePhase(state) -> {
  state,
  events
}

getPlayerView(state, factionId) -> playerView

getVisibleEvents(state, factionId, afterSequence = 0) -> events
```

`submitCommand` validates and records intent during the Command phase. It does
not allow presentation code to invoke lower-level movement, spotting, or combat
functions directly. An invalid submission leaves gameplay state unchanged and
returns a stable machine-readable reason. Whether invalid attempts belong in
the authoritative Event history is an M0 design decision; accepted Commands
must always emit `COMMAND_ISSUED`.

`advancePhase` performs all mandatory work for the current phase, emits Events,
and moves to the next phase. The engine, not the UI, determines the next phase.

The exact module layout can remain small. A practical initial separation is:

- scenario definitions
- simulation state and phase coordinator
- M0 rule functions and seeded random generator
- Event creation and visibility filtering
- player-view projection
- presentation/controller code

This is a responsibility boundary, not a requirement to create one file for
every bullet.

## Authoritative State

### Mission

Mission is the authoritative aggregate and the only root object advanced by the
simulation.

Minimum state:

```text
Mission
├── id
├── scenario_id
├── status
├── turn
├── phase
├── active_faction_id
├── command_capacity_by_faction
├── rng
│   ├── seed
│   ├── state
│   └── draw_count
├── locations_by_id
├── soldiers_by_id
├── teams_by_id
├── contacts_by_id
├── commands_by_id
├── fire_relationships_by_id
├── knowledge_by_faction
├── events
├── next_event_sequence
└── next_runtime_id
```

Responsibilities:

- own the current turn, phase, and mission status
- provide stable entity lookup by ID
- own limited command capacity and the deterministic random stream
- preserve authoritative truth separately from faction knowledge
- own the ordered Event history
- provide monotonic runtime IDs without using randomness

M0 does not need a general entity-component system, database, save format,
network protocol, or event-sourced state reconstruction.

### Location

A Location is a tactically meaningful node, not a precise physical area.

Minimum state:

```text
Location
├── id
├── name
├── connected_location_ids
├── tactical_tags
├── occupant_team_ids
└── cover_features
```

Each cover feature has a stable ID, a coarse type/protection description, and
authoritative discovery state by faction. A Location may therefore contain
useful cover that the friendly player does not yet know exists. Discovered
cover persists for the remainder of the Mission.

Connections define legal movement. M0 does not model coordinates, individual
soldier positions, pathfinding, elevation geometry, or exact line of sight.
Any firing constraint between Locations must come from explicit graph or
tactical data interpreted by M0 rules.

### Soldier

A Soldier is a named individual whose condition contributes to team capability.
The player does not command Soldiers directly.

Minimum state:

```text
Soldier
├── id
├── name
├── faction_id
├── team_id
├── role_tags
├── capability_tags
├── weapon_category
└── condition
```

`condition` is coarse, such as effective, wounded, incapacitated, or killed,
using only the states ultimately required by M0. Role and capability tags allow
the loss of a leader or automatic weapon operator to change team capability
without introducing detailed equipment, inventory, progression, or campaign
persistence.

### Team

A Team is the primary commanded and acting unit.

Minimum state:

```text
Team
├── id
├── name
├── faction_id
├── member_ids
├── location_id
├── current_command_id
├── suppression
├── tactical_state
├── occupied_cover_id
└── action_state
```

`suppression` is the internal accumulation needed by the eventual M0 rules.
`tactical_state` communicates meaningful conditions such as effective,
suppressed, or pinned. `action_state` records only transient phase facts needed
to prevent or modify actions during the current turn.

Team capabilities are derived from effective member Soldiers and current state;
they are not separately maintained as a second source of truth.

### Contact

A Contact represents possible enemy presence before and during resolution. It
must not double as the player's knowledge of that presence.

Minimum state:

```text
Contact
├── id
├── location_id
├── trigger
├── resolution_status
├── generation_profile_id
├── generated_team_ids
└── resolved_turn
```

An unresolved Contact may contain information needed to resolve it, but that
information is authoritative and hidden. When triggered, the simulation may
generate zero or more enemy Teams according to the still-undecided M0 contact
rules. Generation and detection are separate changes: an enemy may exist in
Mission state while remaining absent from the friendly Knowledge State.

M0 does not need procedurally generated missions, a generalized encounter
system, reinforcement scheduling, or advanced enemy planning.

### Command

A Command is an accepted team-level statement of intent.

Minimum state:

```text
Command
├── id
├── type
├── faction_id
├── team_id
├── target
├── cost
├── issued_turn
├── issued_phase
├── status
└── failure_reason
```

M0 command types are:

- `MOVE`, targeting a connected Location
- `SEEK_COVER`, targeting the Team's current Location
- `RALLY`, targeting a suppressed or pinned friendly Team

Commands spend limited capacity when accepted. Their exact costs, allowances,
completion timing, and chances of success remain gameplay decisions. Command
status needs only the states required to distinguish queued, resolved, and
failed intent. Commands are retained long enough to support Events and the AAR;
there is no general-purpose workflow engine.

### Fire Relationship

A Fire Relationship represents meaningful continuing fire rather than bullets
or individual attacks.

Minimum state:

```text
FireRelationship
├── id
├── source_team_id
├── source_location_id
├── target_team_id
├── target_location_id
├── status
├── effect_category
├── started_turn
└── caused_by_event_id
```

The target may be an identified Team or only a Location when the firing side
does not possess better information. The source and target IDs stored in
authoritative state do not imply that either faction knows all of them.

Automatic Fire evaluates eligible detected targets and may establish, continue,
shift, or cease these relationships. They are used by the Effects phase to
determine pressure and consequences. They are not projectiles, weapon cooldowns,
ballistic simulations, or independently scheduled actors.

### Event

An Event is an immutable structured fact recorded after a meaningful state
change commits.

Minimum shape:

```text
Event
├── id
├── type
├── sequence
├── turn
├── phase
├── location_id
├── actor
├── target
├── cause
├── result
├── metadata
├── caused_by_event_id
└── visibility
```

IDs and `sequence` are monotonic and deterministic. `actor` and `target` use
typed stable references. `result` describes the meaningful before/after change
instead of requiring consumers to reconstruct it. `metadata` contains only
event-specific structured details and must not become a dump of internal state.

`visibility` is captured when the Event is emitted. It identifies which
factions may receive that exact Event during live play and whether it is
simulation-only. It is not calculated later from current knowledge, because a
later discovery must not retroactively reveal a hidden Event in the live log.

Events record facts; they do not assign narrative meaning. No Event should say
that a Team acted heroically. An AAR may make the underlying sequence
understandable by presenting the ordinary movement, fire, suppression, cover,
rally, casualty, and mission Events.

### Knowledge State

Knowledge State is required even though it is not a battlefield entity. There
is one state per faction.

Minimum state:

```text
FactionKnowledge
├── known_location_ids
├── contact_knowledge_by_id
├── known_enemy_teams_by_id
├── discovered_cover_ids
└── known_fire_origins
```

Contact knowledge progresses only through states the spotting design actually
needs, likely suspected, detected, and identified. These labels describe what a
faction knows, not the authoritative Contact's resolution status.

Knowledge updates and their Events occur together. A player projection may
include a suspected marker, a detected source category, or an identified enemy
Team according to Knowledge State. It must never construct a redacted copy of
an authoritative enemy object and risk retaining a hidden field.

## Turn and Phase Resolution

M0 uses compact turns with six ordered phases.

### 1. Command

- Begin or refresh the turn's command capacity according to the eventual M0
  command rule.
- Accept valid `MOVE`, `SEEK_COVER`, and `RALLY` Commands.
- Spend command capacity and emit `COMMAND_ISSUED` for accepted intent.
- End when the player explicitly finishes issuing Commands or has no legal
  command capacity remaining.

### 2. Action

- Resolve queued friendly Commands in a documented deterministic order.
- Move Teams only across graph connections.
- Resolve cover searches and rally attempts when legal.
- Emit Events immediately after committed movement, cover, rally, and Command
  status changes.

The exact ordering rule for multiple accepted Commands must be chosen before
gameplay implementation. It must not depend on object iteration order.

### 3. Contact and Observation

- Trigger eligible Potential Contacts after relevant movement or interaction.
- Generate authoritative enemy truth using the Mission RNG.
- Evaluate friendly and enemy spotting using only information available to each
  observer.
- Update the appropriate Knowledge States.
- Emit hidden generation Events separately from player-visible detection or
  identification Events.

Triggering, generation, detection, and identification are separate facts even
if some occur consecutively in the same phase.

### 4. Automatic Fire

- Determine which Teams are capable of firing and have eligible targets.
- Establish, continue, shift, or cease Fire Relationships.
- Emit fire Events at the level of meaningful firing actions, not individual
  rounds.
- Do not require a player Command to authorize immediate eligible fire.

Simple M0 enemy behavior may select among eligible actions using explicit rule
functions and the Mission RNG. No planning AI or behavior tree is required.

### 5. Effects

- Resolve each active Fire Relationship in a stable deterministic order.
- Apply cover and Team capability through the eventual M0 rule functions.
- Commit suppression changes, pinned transitions, and simplified casualties.
- Emit a separate Event for every meaningful resulting state transition, linked
  to the Event that caused it when useful.

Internal rolls and modifiers may be available to diagnostic tools, but they are
not automatically player-visible Event metadata.

### 6. Recovery and Cleanup

- Apply any automatic recovery allowed by the eventual M0 rules.
- Expire turn-only action state.
- Re-evaluate Fire Relationships that no longer have valid sources or targets.
- Determine whether an engagement or the Mission has ended.
- Emit resolution and mission Events, then advance to the next turn's Command
  phase if play continues.

## Example Interaction Sequence

The requested flow normally crosses more than one Command opportunity.

1. During Command, the player spends capacity to order Alpha to `MOVE` to an
   adjacent Location. `COMMAND_ISSUED` records the intent.
2. During Action, Alpha changes Location. `UNIT_MOVED` records both origin and
   destination.
3. During Contact and Observation, the move satisfies a Contact trigger.
   `CONTACT_TRIGGERED` is visible, while `ENEMY_GENERATED` may be
   simulation-only.
4. Spotting changes friendly or enemy Knowledge State. The visible Event says
   only what that faction learned; detection need not reveal exact composition.
5. During Automatic Fire, a detecting enemy automatically establishes a Fire
   Relationship. A player-visible `FIRE_OPENED` may reveal only a direction or
   Location until the source is identified.
6. During Effects, that relationship changes Alpha's suppression. The engine
   emits `SUPPRESSION_CHANGED` and, if the threshold is crossed,
   `UNIT_SUPPRESSED` or `UNIT_PINNED`.
7. On a later Command opportunity, the player may spend capacity on
   `SEEK_COVER`. Its Action resolution emits `COVER_SEARCHED`, then
   `COVER_FOUND` and `UNIT_ENTERED_COVER`, or `COVER_SEARCH_FAILED`.
8. On the same or a later Command opportunity, subject to the still-undecided
   command rules, the player may issue `RALLY`. Resolution records success or
   failure; success changes suppression or tactical state and emits
   `UNIT_RALLIED`.

This separation preserves limited command and autonomous reaction: the player
chooses team intent, while the simulation controls spotting, firing, and the
consequences of incoming fire.

## Seeded and Reproducible Randomness

All simulation randomness flows through one Mission-owned pseudo-random number
generator. Its full runtime state must be serializable:

```text
rng.seed
rng.state
rng.draw_count
```

Rules receive the generator explicitly or through a simulation context. They
must not call `Math.random`, use wall-clock time, generate random IDs, or rely
on UI state. Player-view projection and Event formatting consume no random
draws.

Iteration that can cause draws or state changes must use explicit stable order,
such as sorted entity IDs or a recorded Command order. JavaScript collection
ordering must not accidentally become a game rule.

Given the same scenario version, seed, and accepted Command sequence, the engine
must produce the same meaningful final state and ordered Events. One random
stream is sufficient for M0; named substreams and elaborate random audit
infrastructure are unnecessary.

## Events, Visibility, and the AAR

The authoritative Event collection is an ordered history, not the mechanism by
which current state is reconstructed. M0 changes state directly and then emits
the corresponding Event.

For fog of war, use two complementary safeguards:

1. Events capture a visibility decision at emission time.
2. Presentation obtains Events only through `getVisibleEvents` and current
   state only through `getPlayerView`.

For example, enemy generation may create an internal Event naming an enemy
automatic-weapons Team. The friendly live log instead receives a later Event
stating only that activity or fire was detected from a Location. The internal
Event must never be passed to the UI with selected fields hidden.

The AAR consumes the same authoritative Event history. M0 must choose and state
an end-of-mission disclosure policy before implementing the AAR: either retain
the player's historical perspective or reveal selected hidden facts after the
Mission. The AAR must apply that policy explicitly and must not invent events.

The initial Event vocabulary should be limited to events required by the M0
flow, drawing from the candidates already listed in `EVENT_MODEL.md`. New Event
types should be added only when the simulation needs to communicate another
meaningful fact.

## Deferred Gameplay Decisions

Architecture must expose, but must not answer, these M0 design questions:

- command capacity per turn and Command costs
- whether multiple Commands resolve in issue order or another explicit order
- Potential Contact trigger and enemy-generation distributions
- spotting inputs, outcomes, and information levels
- target selection and fire effectiveness
- suppression accumulation and suppressed/pinned thresholds
- the mechanical benefit and possible types of discovered cover
- rally eligibility, effect, and chance of success
- simplified casualty outcomes and their effect on Team capability
- automatic recovery conditions
- engagement and Mission resolution conditions
- end-of-mission AAR disclosure of previously hidden facts

Implement these as small M0-specific rule functions and authored tuning data.
Do not build a generic rules engine or copy probability tables from reference
games.

## Verification and Acceptance Scenarios

Simulation tests must run under Vitest without a DOM.

### Determinism

- The same scenario, seed, and Command sequence produces equivalent meaningful
  Mission state and byte-equivalent ordered Events.
- Different seeds may change contact, spotting, cover, and combat outcomes but
  never change legal phase order.
- Rendering, requesting a player view, or reading Events does not change RNG
  state or Event sequence.

### Fog of War

- An unresolved Contact exposes no enemy composition.
- `ENEMY_GENERATED` can name generated enemies internally without entering the
  friendly visible feed.
- Detection exposes only the knowledge granted by the spotting result.
- Undiscovered cover, hidden enemy IDs, and diagnostic random data are absent
  from player projections rather than present with concealment flags.
- Later identification does not retroactively expose earlier hidden Events in
  the live log.

### Core Sequence

- A legal move can produce the causal sequence: Command issued, Team moved,
  Contact triggered, hidden enemy generated, Contact detected, fire opened,
  suppression changed, Team pinned.
- Seek Cover records search success or failure. Found cover persists, can be
  occupied, and affects later resolution through the cover rule boundary.
- Rally consumes command capacity and records success, failure, or a stable
  invalid reason without requiring final odds to be chosen in advance.
- Fire Relationships start, persist, shift, and cease correctly after movement,
  lost detection, incapacity, or engagement resolution.

### Events and Presentation

- Every meaningful committed change emits one or more correctly ordered Events
  with stable IDs and adequate causal context.
- The chronological history can produce a simple text AAR explaining what
  happened, in what order, where, to whom, and why important changes occurred.
- Presentation tests consume only player projections and visible Events; no UI
  test receives an authoritative Mission object.

## Scope Guard

M0 should use Vite, Vitest, browser ES modules, and plain JavaScript. It should
not select a UI framework unless the prototype later demonstrates a concrete
need.

Do not add architecture for:

- campaign persistence or a persistent roster
- progression, detailed equipment, or inventory
- procedural mission generation
- advanced enemy AI
- vehicles, artillery, air support, civilians, VIPs, or extraction
- a close-up animated Location View
- replay infrastructure or state reconstruction from Events
- real-time scheduling, networking, multiplayer, or databases
- generalized plugins, dependency injection containers, or enterprise event
  infrastructure

Future systems may replace or extend M0 code after its design question has been
answered. Keeping the simulation independent from presentation, its state
serializable, its randomness reproducible, and its information boundaries
explicit is sufficient extensibility for this milestone.
