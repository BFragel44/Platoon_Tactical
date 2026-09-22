# Combat Resolution Redesign

## Purpose

Replace the current provisional suppression-based combat resolution with a digital combat system derived from the mathematical behavior of the Fields of Fire Action Deck.

The guiding principle is:

> Extract the mathematical model encoded in the deck and make that model part of the simulation engine.

This is NOT intended to simulate visible Action Card draws.

The player should not draw virtual cards.

Instead, the game should reproduce the probability distributions created by the Action Deck using deterministic seeded RNG, then present the result through a purpose-built digital Combat Resolution screen.

The goal is to preserve the underlying tactical behavior of Fields of Fire while removing physical-card administration and taking advantage of a PC interface.

---

# 1. Core Design Rule

Do not digitize the physical procedure when the procedure exists primarily to make a tabletop game function.

Preserve the MODEL represented by that procedure.

Examples:

- Action Card combat results -> probability distributions
- Hit Effect card draws -> probability distributions by Experience
- VOF/PDF markers -> persistent FireRelationship state
- Card adjacency -> location graph relationships
- Status counters -> unit state
- Physical bookkeeping -> UI visualization

The game remains turn-based and location-based.

Do NOT introduce:

- real-time combat simulation
- individual soldier simulation
- free movement
- RTS-style targeting
- real-time hit detection
- projectile physics
- player reaction/timing mechanics

Visuals and audio PRESENT simulation results.

They never determine them.

---

# 2. Fields of Fire Combat Model Being Adapted

During the Combat Effects Segment, Fields of Fire effectively performs the following sequence for each affected infantry unit:

1. Determine the unit's Net Combat Modifier (NCM).
2. Draw one Action Card.
3. Read the combat result corresponding to that NCM.
4. Result is MISS, PIN, or HIT.
5. If HIT, draw another Action Card.
6. Determine the Hit Effect using the target's Experience Level.
7. Apply the resulting state/unit change.

The digital game should preserve this logical sequence while removing the physical Action Card draw.

---

# 3. Replace Action Card Draws With Probability Tables

The Action Deck should be analyzed as DATA.

For every valid NCM column, count the number of Action Cards producing:

- MISS
- PIN
- HIT

Example ONLY:

These numbers are placeholders and MUST NOT be treated as actual Fields of Fire probabilities.

```js
combatResolutionTable = {
  "-4": {
    miss: 0.05,
    pin: 0.20,
    hit: 0.75
  },

  "-3": {
    miss: 0.10,
    pin: 0.25,
    hit: 0.65
  },

  // ...

  "+2": {
    miss: 0.60,
    pin: 0.32,
    hit: 0.08
  }
};
The real values must eventually be derived from the actual Action Deck composition.
Do NOT guess or manually balance these probabilities yet.
Until actual deck data has been entered, clearly mark any temporary distributions as placeholders.
4. Probability Extraction
If the Action Deck contains N cards, and for NCM +1:
- X cards produce MISS
- Y cards produce PIN
- Z cards produce HIT
then:
P(MISS) = X / N
P(PIN)  = Y / N
P(HIT)  = Z / N
The three probabilities must sum to 1.
Example:
{
  miss: 0.50,
  pin: 0.35,
  hit: 0.15
}
This becomes the probability distribution for that NCM.
5. RNG Resolution
Continue using the project's seeded deterministic RNG.
Combat resolution must remain:
- deterministic
- replayable
- testable
- independent from UI timing
- independent from animation
Example:
function resolveCombatResult({ ncm, rng }) {
  const distribution = combatResolutionTable[ncm];

  const roll = rng.next();

  if (roll < distribution.miss) {
    return "MISS";
  }

  if (roll < distribution.miss + distribution.pin) {
    return "PIN";
  }

  return "HIT";
}
The exact implementation may differ to match the existing architecture.
The important requirement is:
same seed
+ same game state
+ same commands
= same combat results
6. NCM Calculation
NCM calculation should be its own pure simulation function.
Example API:
calculateNCM({
  targetUnit,
  targetLocation,
  incomingFire,
  missionState
});
Return BOTH:
1. final NCM
2. modifier breakdown
Example:
{
  ncm: 2,

  modifiers: [
    {
      source: "BASE",
      value: 0
    },
    {
      source: "TERRAIN",
      label: "Woods",
      value: 1
    },
    {
      source: "COVER",
      label: "Foxholes",
      value: 2
    },
    {
      source: "CONCENTRATED_FIRE",
      value: -1
    }
  ]
}
Do not calculate the NCM separately in the UI.
There should be ONE authoritative calculation in the simulation core.
The UI only displays the result.
7. Combat Resolution Object
Before presentation, the simulation should be capable of creating a resolution object describing what is about to be resolved.
Example:
{
  resolutionId: "combat-0042",

  targetUnitId: "us-1-1",
  targetLocationId: "woods-3-1",

  incomingFire: [
    "fire-rel-17"
  ],

  ncm: 2,

  modifiers: [
    {
      source: "TERRAIN",
      label: "Woods",
      value: 1
    },
    {
      source: "COVER",
      label: "Foxholes",
      value: 2
    },
    {
      source: "CONCENTRATED_FIRE",
      value: -1
    }
  ],

  probabilities: {
    miss: 0.60,
    pin: 0.32,
    hit: 0.08
  },

  result: null
}
Before Resolve is pressed, result should remain unresolved from the player's perspective.
IMPORTANT:
Do not allow UI animation timing to control when RNG is consumed.
The simulation should own resolution.
8. Player-Facing Combat Resolution Screen
Combat resolution should use an Advance Wars-inspired split presentation.
Example layout:
---------------------------------------------------------

        U.S. 1/1 SQUAD        GERMAN RIFLE TEAM

           [IMAGE]                 [IMAGE]

          EFFECTIVE               SUPPRESSED

         Receiving Fire          Receiving Fire

         Woods      +1           Building     +2
         Foxholes   +2           Concentrated -1
         Other      -1

            NCM +2                  NCM +1

        MISS    60%             MISS    50%
        PIN     32%             PIN     35%
        HIT      8%             HIT     15%


                     [ RESOLVE ]

---------------------------------------------------------
The percentages shown must come directly from the simulation probability tables.
Do not maintain separate UI probability logic.
9. What Each Side Represents
Be careful with the UI language.
The MISS/PIN/HIT probabilities shown underneath a unit represent:
THE RESULT OF INCOMING FIRE AGAINST THAT UNIT.

They are NOT that unit's offensive "chance to hit."
This distinction must be clear.
Example label:
COMBAT EXPOSURE
NCM +2

MISS 60%
PIN  32%
HIT   8%
or:
INCOMING FIRE RESULT

MISS 60%
PIN  32%
HIT   8%
10. Simultaneous Fire Presentation
Where opposing units have valid FireRelationships against each other, present both sides on the same Combat Resolution screen.
Example:
US 1/1 Squad
    |
    | BASIC_FIRE
    v
German Rifle Team

German Rifle Team
    |
    | BASIC_FIRE
    v
US 1/1 Squad
Both affected units can appear in one split-screen presentation.
Pressing RESOLVE may reveal both results together.
Example:
        US 1/1                 GERMAN RIFLE TEAM

          MISS                       HIT!
This is presentation only.
Internally, each target still receives its own deterministic combat resolution.
Do not create special "duel" mechanics.
11. Resolve Button
The Resolve button should initiate the PRESENTATION of combat resolution.
The simulation result must remain deterministic and controlled by the simulation core.
Suggested flow:
Combat Effects begins
        |
        v
Create CombatResolution
        |
        v
Calculate NCM
        |
        v
Load probability distribution
        |
        v
Show Combat Resolution UI
        |
        v
Player presses RESOLVE
        |
        v
Simulation resolves seeded RNG
        |
        v
Emit result event
        |
        v
Presentation reveals result
        |
        v
Apply resulting state
        |
        v
Continue to next resolution
The player cannot influence the RNG through:
- timing
- repeated clicks
- animation skipping
- UI refresh
- closing/reopening the panel
12. Combat Result Events
Combat resolution should emit explicit events.
Examples:
{
  type: "COMBAT_RESOLVED",
  targetUnitId: "german-rifle-1",
  ncm: 1,
  roll: 0.73,
  result: "PIN"
}
For HIT:
{
  type: "COMBAT_RESOLVED",
  targetUnitId: "german-rifle-1",
  ncm: -1,
  roll: 0.91,
  result: "HIT"
}
These should integrate with the existing event/AAR architecture.
The combat log should be reconstructable entirely from simulation events.
13. HIT Resolution
A HIT triggers a SECOND probability resolution.
This replaces the second Action Card draw used for Hit Effect.
Hit Effect probabilities should also be extracted from the Action Deck.
They should be organized by Experience Level.
Conceptually:
hitEffectTable = {
  GREEN: {
    // extracted distribution
  },

  LINE: {
    // extracted distribution
  },

  VETERAN: {
    // extracted distribution
  }
};
Use the project's actual Experience Level names.
Do NOT use example categories above if they conflict with existing constants.
Again:
DO NOT INVENT THE FINAL PROBABILITIES.
They must eventually be extracted from the Action Deck.
14. Hit Effect Resolver
Suggested API:
resolveHitEffect({
  targetUnit,
  experience,
  rng
});
Example result:
{
  targetUnitId: "german-rifle-1",
  experience: "LINE",
  effect: "PARALYZED_TEAM"
}
The exact effects should follow the game's eventual combat model.
15. HIT Presentation
A HIT should not immediately disappear into the combat log.
The Combat Resolution screen should show:
                  HIT!
Then transition into Hit Effect resolution.
Example:
HIT EFFECT

German Rifle Team
Experience: LINE

[ RESOLVE HIT EFFECT ]
Alternatively, Hit Effect can automatically resolve after a short presentation delay.
This is a UX decision.
It must NOT alter the underlying simulation.
16. Combat Visuals
Each side of the Combat Resolution screen should show an illustrated representation based on game state.
Visual selection should be driven by:
Faction
+
Unit Type
+
Terrain
+
Tactical State
+
Combat Result
Example:
US
Rifle Squad
Woods
Effective
Pre-resolution
After PIN:
US
Rifle Squad
Woods
Pinned
Post-resolution
The soldiers shown are REPRESENTATIONS OF THE UNIT.
They are not individually simulated soldiers.
If a three-step squad visually shows three or four soldiers, those figures are illustrative.
Do not derive individual soldier casualties from image positions.
17. Audio Presentation
After RESOLVE:
MISS might play:
- outgoing weapon report
- bullet impacts
- ricochets
- terrain impacts
PIN might play:
- incoming burst
- nearby impacts
- shouted reaction
- soldiers dropping lower into cover
HIT might play:
- weapon fire
- impact reaction
- appropriate unit reaction
Audio must be:
- short
- skippable
- presentation-only
- independent of simulation timing
The simulation result must already exist independently of whether audio successfully plays.
18. Persistent Fire After Combat Resolution
IMPORTANT:
Combat Resolution does NOT mean the firefight ends.
Existing FireRelationships/VOF remain active until normal game rules invalidate, shift, or remove them.
Therefore:
Combat Resolution
        |
        v
MISS / PIN / HIT
        |
        v
Unit state changes
        |
        v
Return to tactical map
        |
        v
FireRelationship remains active
Do NOT automatically remove FireRelationships after combat resolution.
19. Main Map Fire Presentation
An active FireRelationship should have a persistent audiovisual representation on the tactical map.
Example:
FireRelationship {
  sourceUnitId: "us-1-1",
  targetLocationId: "village-3-4",
  type: "BASIC_FIRE",
  active: true
}
While active, the UI may periodically show:
- muzzle flashes
- short bursts of gunfire
- occasional tracers
- impact puffs
- incoming-fire effects
These effects communicate:
THIS FIREFIGHT IS STILL ACTIVE.

They do NOT perform combat resolution.
No RNG should be consumed.
No suppression should be added.
No damage should occur.
No game state should change.
They are visual/audio indicators of existing state.
20. Critical Architecture Rule
Use this rule throughout implementation:
Animation may represent game state. Animation must never create game state.

Examples:
Muzzle flash:
FireRelationship exists -> show muzzle flash
NOT:
muzzle flash occurs -> perform attack
Tracer:
FireRelationship exists -> occasionally render tracer
NOT:
tracer reaches target -> roll damage
Soldier falls:
HIT EFFECT changes unit -> play casualty animation
NOT:
animation selects soldier -> unit loses step
21. Persistent State Has Persistent Presentation
General UI rule:
Persistent tactical states should have persistent audiovisual representations.

Examples:
Active VOF
-> intermittent gunfire / muzzle flash

Incoming VOF
-> occasional impacts

PINNED
-> unit artwork/pose indicates pinned state

SUPPRESSED
-> suppressed visual treatment

Smoke
-> persistent smoke visual

Potential Contact
-> persistent uncertainty marker

Active FireRelationship
-> optional fire-direction overlay
This allows the map to feel alive while remaining completely turn-based.
22. Fire Relationship Overlay
Do not rely exclusively on audiovisual effects.
The player must always be able to inspect the exact tactical state.
Provide an optional overlay such as:
SHOW FIRE RELATIONSHIPS
When enabled or when a unit is selected:
US 1/1
   |
   | BASIC FIRE
   |
   +------------------> German LMG
The overlay should expose:
- source
- target
- VOF type
- range
- relevant modifiers
- whether relationship is currently active
The visual battlefield must never make tactical information harder to understand.
23. Existing Suppression System
The current M0 suppression implementation should NOT simply be deleted immediately.
Current behavior includes:
BASIC_FIRE
-> suppression increase
-> EFFECTIVE / SUPPRESSED / PINNED
Treat this as the existing prototype combat model.
Refactor combat in stages.
Recommended sequence:
Stage 1
Add probability tables and resolver infrastructure.
Do not change UI.
Stage 2
Add NCM calculation.
Test independently.
Stage 3
Add MISS/PIN/HIT resolution.
Keep current suppression system available until tests confirm replacement behavior.
Stage 4
Add Hit Effect resolution.
Stage 5
Integrate with Combat Effects phase.
Stage 6
Add Combat Resolution presentation screen.
Stage 7
Add persistent map audiovisual effects.
Do not attempt all seven stages in one implementation pass.
24. Suggested Modules
Names are suggestions only.
Match existing project organization where appropriate.
src/
  sim/
    combat/
      ncm.js
      combatProbability.js
      combatResolver.js
      hitEffectResolver.js
      combatTables.js
Possible responsibilities:
ncm.js
calculateNCM()
getNCMModifiers()
combatTables.js
Stores extracted Action Deck distributions.
combatProbability.js
Handles weighted deterministic sampling.
combatResolver.js
Coordinates:
NCM
-> distribution
-> RNG
-> MISS/PIN/HIT
hitEffectResolver.js
Coordinates:
Experience
-> Hit Effect distribution
-> RNG
-> effect
Keep UI code OUT of these modules.
25. Suggested Public Simulation API
Eventually the simulation may expose something similar to:
getPendingCombatResolutions()
Returns combat resolutions requiring presentation.
Example:
[
  {
    resolutionId: "combat-42",
    targetUnitId: "us-1-1",
    sourceRelationships: ["fire-17"],
    ncm: 2,
    probabilities: {
      miss: 0.60,
      pin: 0.32,
      hit: 0.08
    }
  }
]
Then:
resolveCombat(resolutionId)
returns/emits the deterministic result.
The exact API should conform to the existing:
createMission
submitCommand
advancePhase
getPlayerView
getVisibleEvents
architecture rather than creating a parallel architecture.
26. Player View
getPlayerView() should expose enough information for the Combat Resolution UI without exposing hidden enemy information.
Possible structure:
combat: {
  pendingResolution: {
    id: "combat-42",

    left: {
      unitId: "us-1-1",
      displayName: "1/1 Rifle Squad",
      terrain: "WOODS",
      state: "EFFECTIVE",
      ncm: 2,
      modifiers: [...],
      probabilities: {
        miss: 0.60,
        pin: 0.32,
        hit: 0.08
      }
    },

    right: {
      // only information legally known to player
    }
  }
}
Respect the existing spotting/information-state system.
Do not reveal hidden enemy information merely because the Combat Resolution UI exists.
27. Required Tests
At minimum add tests for:
Probability integrity
Every NCM distribution sums to 1.
miss + pin + hit === 1
within appropriate floating-point tolerance.
Determinism
Same:
seed
state
NCM
produces the same result.
NCM lookup
Each valid NCM selects the correct probability table.
Boundary handling
Test RNG values at:
0
MISS/PIN boundary
PIN/HIT boundary
near 1
HIT chaining
HIT triggers exactly one Hit Effect resolution.
MISS does not.
PIN does not.
FireRelationship persistence
Combat resolution must NOT automatically remove a valid FireRelationship.
State changes
MISS:
no combat-state degradation
PIN:
applies appropriate pinned state
HIT:
applies Hit Effect
UI independence
Skipping animation must produce exactly the same final simulation state.
28. Event Logging
Events should contain enough information for:
- debugging
- replay
- AAR
- Combat Log UI
Possible events:
COMBAT_RESOLUTION_STARTED
COMBAT_RESOLVED
UNIT_PINNED
UNIT_HIT
HIT_EFFECT_RESOLVED
UNIT_STEP_LOST
UNIT_STATE_CHANGED
Do not make presentation events authoritative simulation events.
For example:
MUZZLE_FLASH_PLAYED
should NOT exist in the deterministic simulation event log unless there is a separate non-authoritative presentation-event system.
29. Debug Mode
The existing prototype UI is useful and should remain available during development.
Debug information should expose:
Target
Incoming FireRelationship(s)
NCM
NCM modifiers
Probability distribution
Raw seeded RNG value
Combat result
Hit Effect RNG
Hit Effect result
Example:
COMBAT DEBUG

Target: German Rifle Team 4
NCM: +1

MISS: 0.50
PIN:  0.35
HIT:  0.15

RNG: 0.7234
Result: PIN

FireRelationship remains active: YES
This will be extremely useful for deterministic test failures.
30. Scope Guard
DO NOT implement the following as part of this combat refactor:
- 3D battlefield
- real-time projectiles
- individual soldier AI
- individual soldier health
- ballistic simulation
- animation-driven damage
- RTS controls
- free movement
- procedural combat cinematics
- full audio system
- final artwork pipeline
First implement the mathematical combat model.
Then expose it cleanly to the UI.
Then build the presentation layer.
31. Immediate Implementation Goal
The first implementation slice should be:
Given an NCM and deterministic RNG, resolve MISS/PIN/HIT using a configurable probability distribution.

Done condition:
1. Probability tables exist.
2. Tables are clearly marked PLACEHOLDER until actual Action Deck data is entered.
3. Resolver uses seeded RNG.
4. Resolver is pure/deterministic.
5. MISS/PIN/HIT are returned.
6. Events are emitted through existing architecture where appropriate.
7. Tests cover determinism and probability boundaries.
8. Existing tests continue to pass.
DO NOT build the Combat Resolution UI yet.
DO NOT add audio yet.
DO NOT add animations yet.
This slice is only the mathematical foundation.
32. Long-Term Target
The final player experience should be:
TACTICAL MAP
    |
    | ongoing VOF visible/audible
    |
    v

COMBAT EFFECTS PHASE
    |
    v

SPLIT COMBAT RESOLUTION SCREEN
    |
    | shows terrain
    | unit type
    | tactical state
    | NCM breakdown
    | MISS/PIN/HIT probabilities
    |
    v

PLAYER PRESSES RESOLVE
    |
    v

SEE/HEAR RESULT
    |
    | MISS
    | PIN
    | HIT -> Hit Effect
    |
    v

UNIT STATE UPDATED
    |
    v

RETURN TO TACTICAL MAP
    |
    | FireRelationship remains active
    | intermittent gunfire continues
    | muzzle flashes / tracers reinforce ongoing VOF
    |
    v

CONTINUE TURN
The end result should feel like a digital tactical wargame, not an RTS.
The simulation remains abstract, deterministic, location-based, and turn-based.
The audiovisual layer makes the abstract state legible and satisfying.
The central rule remains:
Extract the mathematical model encoded in the tabletop system, preserve that model in the simulation, and use the computer to improve its presentation rather than changing what the player is actually deciding.


One thing I deliberately changed from our earlier discussion: I made **the actual Action Deck probabilities a prerequisite rather than baking any guessed MISS/PIN/HIT numbers into Codex's implementation**. The rulebook confirms the NCM → Action Card → HIT/PIN/MISS → second Hit Effect draw structure, but the snippets available here do not give us the complete card-by-card distribution needed to calculate those percentages accurately. :chatgpt-content-reference{index="1"}

That makes the first Codex slice safely build the *resolver architecture* with clearly labeled placeholder data. Then we can separately extract the actual Action Deck distributions and replace those tables without rewriting combat.