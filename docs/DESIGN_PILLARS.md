# Design pillars: Company Assault validation build

The active demo is one company assault: Company HQ and staff, two platoon HQs, six multistep rifle squads, attached weapons and observers. The previous three-fireteam brief is superseded and archived under `archive/platoon-prototype/`.

The player commands formations through constrained HQ impulses and communications. Basic fire continues autonomously. Supporting fire, observation, maneuver, recovery and maintaining the command net are the decisions being tested.

The battlefield is a graph of terrain cards, arranged like the Company Assault Course. Coordinates identify abstract Locations, not soldier squares. Known firing positions are distinct from spotted units. Player reports never expose an unspotted attacker's identity or hidden causal events.

Named personnel provide history beneath squad steps. A casualty step removes its associated personnel and capability; cohesion breakdown creates recoverable teams. No additional soldier-level hit rolls are made.

This validation branch deliberately follows the selected Fields of Fire third-edition infantry course rules closely, with explicit implementation limitations recorded in the rules guide. It is not a claim to reproduce the entire game. Campaigns, persistent rosters, vehicles, air assault and replacements remain deferred.

The authoritative implemented behavior and acceptance status are in [M0 rules and playtest guide](M0_RULES_AND_PLAYTEST.md).
