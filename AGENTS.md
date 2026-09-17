# Active validation scope (supersedes earlier prototype restrictions)

The user-authorized current demo is Company Assault: two platoons of multistep squads, separate company/platoon HQs and support assets, using the selected Fields of Fire third-edition assault-course rules closely. Explicit phase stepping is the normal manual-test flow. The former three-fireteam/original-probabilities restriction does not govern this validation branch. Consult docs/M0_RULES_AND_PLAYTEST.md for implemented rules, deviations and acceptance gaps. Preserve existing historical prototype work. Campaigns and vehicles remain deferred.

# Design Pillars

## Game Concept

A platoon-level tactical combat game about commanding persistent
soldiers through uncertain, abstract battlefields.

The player organizes and equips named soldiers before missions and
commands them primarily as fireteams during combat.

Battlefields consist of interconnected Location nodes rather than
grids or precisely modeled terrain. Enemy forces, useful cover, and
some characteristics of the battlefield are discovered through play.

The player gives orders. Soldiers execute those orders autonomously.

Combat emphasizes suppression, fire superiority, maneuver,
leadership, morale, communication, and uncertainty rather than
hit-point attrition.

Every meaningful action during a mission is recorded, allowing
detailed after-action reports and emergent campaign histories.


## Player Fantasy

The player is a tactical commander, not an omniscient puppeteer.

The player should think:

- Where should I send my teams?
- Where is the enemy?
- Can Alpha cross that street?
- Can Bravo suppress that position?
- Do I spend command capacity rallying Charlie or maneuvering Alpha?
- Is this position worth holding?
- Can I get everyone home?

The player should NOT routinely think:

- Which exact square should this rifleman occupy?
- Which individual enemy has the lowest HP?
- How can I maximize damage-per-turn?


# Core Pillars

## 1. Persistent People

Soldiers are named individuals who persist between missions.

Their weapons, experience, wounds, leadership, morale, and actions
contribute to the capabilities of their team.

The player becomes attached to individuals through their history and
behavior, but commands primarily at the team level.


## 2. Uncertain Battlefield

The tactical map is a graph of abstract Location nodes.

Locations represent tactically meaningful areas rather than fixed
physical dimensions.

Enemy presence is not completely known.

Potential Contacts allow threats to emerge as friendly forces explore
the battlefield.

Useful microterrain such as cover may be discovered within Locations.

The battlefield becomes better understood through interaction with it.


## 3. Limited Command

Player attention and command capability are resources.

The player cannot perfectly control every friendly unit at all times.

Orders should represent tactical intent rather than individual
movement instructions.

Units continue to behave according to their orders, training, current
situation, and leadership without requiring constant player input.


## 4. Autonomous Combat

Soldiers react to threats without waiting for the player to authorize
every shot.

Units may spot, engage, seek immediate protection, suppress threats,
or react to casualties according to their situation and current orders.

The simulation determines how soldiers execute an order.

The player determines what the team is trying to accomplish.


## 5. Recorded History

Every meaningful mission event is recorded as structured data.

The game should be capable of reconstructing:

- who moved where
- who spotted whom
- who fired
- who suppressed whom
- who was wounded or killed
- what orders were issued
- what terrain was discovered
- when objectives were completed
- how units extracted

After-action reports should emerge from simulation history rather than
from predetermined narrative scripts.


# Combat Philosophy

Combat should primarily revolve around:

1. Detecting threats.
2. Establishing fire superiority.
3. Suppressing enemy positions.
4. Maneuvering friendly forces.
5. Maintaining command and cohesion.
6. Accomplishing the mission.
7. Extracting surviving personnel.

Casualties should affect capability rather than simply subtracting
generic hit points.

Losing an automatic rifleman, team leader, grenadier, or other
specialist should change what a team can accomplish.


# Abstraction Philosophy

Abstraction should remove bookkeeping, not consequence.

The player does not need to manually calculate line-of-sight
modifiers, suppression totals, communication ranges, or individual
ballistic outcomes.

The simulation may model these things internally when they create
meaningful tactical consequences.

Important consequences must remain understandable to the player.


# Two Levels of Battlefield Presentation

## Command View

The primary battlefield view presents interconnected Location nodes.

This view communicates:

- friendly units
- known and suspected contacts
- movement connections
- known cover
- fire relationships
- objectives
- important tactical states

This is where the player manages the overall fight.


## Location View

The player may inspect a Location closely to see individual soldiers
and the current fight represented visually.

Soldiers may be shown:

- firing
- moving
- using discovered cover
- becoming suppressed
- pinned behind protection
- treating casualties
- reacting to incoming fire
- executing team orders

The Location View visualizes simulation state.

It does not create a second tactical movement game and does not grant
the player direct control over individual soldiers.


# Emergent Storytelling

The game should create memorable events through interacting systems
rather than scripted dramatic choices.

Example:

A damaged team occupying strong multistory cover may remain behind
during extraction because its surviving machine gun can suppress an
enemy position covering the extraction route.

Another team carrying a VIP may use that suppression to reach the
extraction point.

The supporting team may subsequently be overrun or destroyed.

The game did not script a "heroic sacrifice" event.

The player's decision, terrain, casualties, weapons, enemy activity,
and mission objective created one.


# Design Guardrails

The game is NOT intended to become:

- an individual-soldier grid tactics game
- a conventional RPG
- a hit-point trading combat system
- a base-building game
- a detailed military logistics simulator
- a direct digital implementation of any existing tabletop game

Existing tabletop games may inspire solutions to design problems, but
this project should develop its own rules, terminology, probabilities,
data, and presentation.


# Current Priority

Prove that the core tactical simulation is fun before building the
campaign around it.

The first prototype should answer:

> Can a handful of friendly teams fighting uncertain enemy contacts
> across a small network of abstract Locations produce interesting,
> understandable, and memorable tactical decisions?