# Design pillars

## The M0 promise
One platoon is represented by Alpha, Bravo and Charlie: three four-soldier fireteams, with a named platoon leader attached to one team. The leader is an additional person, not a fourth maneuver element.

The minimum playable test must support fixing an enemy with fire, maneuvering a second team and choosing whether the third supports, recovers or remains in reserve. A single-team movement demonstration cannot answer this design question.

## Persistent people
Named soldiers and their roles determine team capability. Losing an automatic rifleman or team leader changes the fight. M0 records their mission history; saving a roster across missions remains deferred.

## Uncertain battlefield
Locations are abstract tactical areas, not squares. Movement connections and firing connections are separate. Potential Contacts describe encounter risk; they can generate a defender overlooking the area entered. A suspected firing position is not an identified enemy.

## Limited command
Immediate orders spend a small variable command allowance. A limited reserve rewards preparation. The attached leader's position affects communication cost. The commander chooses where to intervene; teams continue established fire without repeated orders.

## Autonomous combat
Automatic fire creates pressure on Locations. Terrain, exposure, additional cover, crossfire, personnel and suppression change its consequences. Suppression weakens outgoing fire and can be recovered from. Commands let the player spot, direct fire, move, rally, seek cover and assault; they do not authorize every shot.

## Recorded history
Simulation events are the authoritative mission history. The live feed and AAR describe facts rather than scripted heroism. Hidden information must remain hidden, including in event metadata and causal references.

## Abstraction and boundaries
Abstraction removes bookkeeping, not consequence. The command view must explain incoming fire, movement danger and the effect of orders without requiring diagnostics. The future Location View visualizes the same state; it must never become an individual-soldier movement game.

M0 implements a complete small encounter, not campaign management, equipment logistics, vehicles, external support or extraction. Its rules and probabilities are original, informed by Fields of Fire's command-and-combat principles rather than a digital transcription.
