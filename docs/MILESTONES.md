# Development Milestones

Development is organized around small playable milestones.

Each milestone exists to answer a specific design question before additional
systems are added.

Only the milestone marked **CURRENT** should be implemented.

---

# M0 — CONTACT

**Status:** CURRENT

## Design Question

Can a small firefight across abstract Location nodes produce interesting,
understandable tactical decisions using uncertain enemy contacts, autonomous
combat, suppression, cover, and limited player commands?

## Core Loop

Location Graph → Movement → Commands → Potential Contact → Spotting → Fire →
Suppression → Cover → Rally → Event Log → AAR

## Prototype Scenario

The player controls a single friendly fireteam.

The battlefield consists of approximately 6–9 connected Location nodes.

The friendly team begins in a known starting Location.

At least one unexplored Location contains an unresolved Potential Contact.

The player must move through the battlefield, encounter an uncertain enemy
force, respond to contact, and resolve the engagement.

The scenario does not need a larger narrative or campaign context.

## Required Systems

### Location Graph

- Locations exist as connected nodes.
- Units occupy a Location rather than a precise grid coordinate.
- Connections determine legal movement between Locations.
- Locations contain basic tactical properties.

### Movement

- A friendly team can move between connected Locations.
- Movement may expose the team to unknown contacts or enemy observation/fire.
- Individual soldiers are not manually positioned.

### Commands

- The player has limited command capacity.
- Commands represent tactical intent at the team level.
- The player cannot directly control every individual soldier action.

### Potential Contact

- Some Locations may contain unresolved enemy presence.
- The player does not know exactly what force exists before contact is resolved.
- Entering or interacting with a Location may trigger contact resolution.
- Enemy composition is determined by the simulation.

### Spotting

- Friendly and enemy forces do not automatically possess perfect information.
- Units must detect opposing forces before engaging them when appropriate.
- Spotting results become part of mission state.

### Fire

- Eligible soldiers/units may engage detected enemies automatically.
- The simulation determines firing outcomes.
- Combat should not rely on conventional hit-point attrition.

### Suppression

- Incoming fire can degrade a team's ability to act effectively.
- Suppression should create tactical problems that can be solved through
  player decisions.
- A sufficiently suppressed team may become Pinned.

### Cover

- Locations may contain useful cover.
- Useful cover is not necessarily known when a Location is entered.
- A team may Seek Cover.
- Seeking Cover involves uncertainty.
- Successfully discovered cover remains part of the Location for the
  remainder of the mission.
- Cover affects combat outcomes.

### Rally

- The player can attempt to improve the condition of a suppressed or
  pinned friendly team.
- Rallying competes with other uses of limited command capacity.

### Event Log

Every meaningful simulation action must generate a structured event.

At minimum, M0 should record events such as:

- command issued
- unit moved
- potential contact triggered
- enemy generated
- unit spotted
- fire opened
- cover searched
- cover discovered
- suppression changed
- unit pinned
- unit rallied
- casualty
- engagement resolved
- mission ended

### After-Action Report

At mission completion, the game must be able to reconstruct a chronological
account of the engagement from the structured event history.

The M0 AAR may be simple text.

It does not require AI-generated narrative.

## Completion Criteria

M0 is complete when the player can:

1. View a small graph of connected Locations.
2. Move a friendly team between Locations.
3. Spend limited command resources to issue orders.
4. Trigger an unresolved Potential Contact.
5. Encounter an enemy force whose exact composition was previously unknown.
6. Detect and engage that enemy through the simulation.
7. Experience meaningful suppression and pinned states.
8. Seek and benefit from discovered cover.
9. Rally a degraded team.
10. Resolve the engagement.
11. Review a complete chronological event history afterward.

Most importantly:

**Different player decisions should be capable of producing meaningfully
different outcomes from the same basic scenario.**

## Explicitly Out of Scope

Do NOT implement the following during M0:

- campaign systems
- persistent roster
- character progression
- detailed equipment/loadout system
- close-up animated Location view
- vehicles
- artillery
- close air support
- civilians
- VIPs
- extraction mechanics
- procedural mission generation
- complex inventory
- base building
- multiplayer
- polished artwork
- advanced enemy AI
- AI-generated AAR narrative

These systems may be considered in later milestones but should not influence
M0 implementation beyond keeping the architecture reasonably extensible.

## Scope Rule

M0 exists to prove the core tactical interaction.

If a proposed feature is not necessary to answer the M0 Design Question,
it should not be implemented yet.