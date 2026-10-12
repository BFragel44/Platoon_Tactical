# Improvements and additions for later

Recorded October 9, 2026. This is the durable backlog for agreed future work and ideas awaiting a decision. It is not authorization to start them during mission implementation.

## Agreed sequence

1. Finish and validate all seven Normandy missions using the current visuals and mechanics.
2. Address the usability pain points below as we build the intended 3D presentation.

Continue correcting gameplay bugs during mission development. Defer broader interface redesign and combat-system experiments until the mission work is shored up. Mission readiness guides remain authoritative for current implementation and acceptance gates; this file does not declare connected campaign progression complete or authorized.

## Broader usability priorities — later milestones

| Priority | Intended improvement | What to preserve |
| --- | --- | --- |
| Explain consequences | After an order or combat result, make what changed and why easy to read: pinning, command disconnection, depleted ammunition, casualties or a newly accessible route. | Accurate simulation-derived explanations and hidden enemy information. |
| Reduce empty clicks | Streamline phases and impulses that offer no meaningful player choice. Decide the exact interaction through playtesting. | Explicit phase stepping, awareness of consequential events, and control over meaningful decisions. |
| Clarify the next decision | Keep current mission requirements, remaining support and event obligations easy to find. | Existing orders, inventory and accepted behavior; avoid unrequested changes to the restored right panel during mission work. |

The goal is to reduce the effort required to understand the situation while retaining the tactical decisions that make the game interesting.

## Approved focused usability pass — implemented October 12, 2026

The user explicitly approved the navigation, signals and mission-clarity pass after the first-player follow-up. This is completed implementation work, separate from the broader redesign below. Evidence and coverage limits are recorded in [CAMPAIGN_FIRST_PLAYER_LOG.md](CAMPAIGN_FIRST_PLAYER_LOG.md).

- Normal startup now opens Home, with separate Campaign and standalone Missions choices and named recovery entries. Tactical creation/restoration requires Start or Resume. Existing development URLs remain compatible.
- In-play Home/Campaign/Missions access preserves the current run. The current-mission menu is now Briefing; File retains recovery, turn-start restoration, exports and replacement backups.
- Briefing contains the assigned signal plan, current carriers, dropped/transported stock, confirmed expenditure and phase-line/objective destinations. It also explains objective progress, the latest attempt-scoped public row assessment and final-turn offensive success timing.
- Settings has an optional off-map/history filter. Live pinned, degraded and embarked formations remain inspectable; Roster retains access to reserve and historical counters. Neutral reserve/transport explanations are distinct from eliminated-counter recovery advice.

This pass does not authorize connected launches beyond M1, a broader vehicle redesign, 3D/audio work or a combat-resolution experiment. The previously deprioritized transient blank-page investigation remains deferred. The broader manual-review coverage boundaries in the running log remain explicit; these focused browser checks are not seven new full playthroughs.

## Intended 3D presentation — deferred until all seven missions are validated

This is the intended next evolution of the game, **not merely an optional cosmetic mode**. The user wants terrain, units, audio/SFX and light animation to add life and crunch that cards and counters cannot provide.

- Model terrain and units; make locations and cover visually tangible.
- Add audio/SFX and light animation to communicate movement, firing, suppression, incoming fire and casualties.
- Preserve the existing mechanics underneath: abstract locations, command limits, communications, ammunition, uncertain contacts and combat outcomes.
- Drive presentation from simulation state and recorded events. Preserve deterministic replay, recovery and hidden-information boundaries.
- Keep the player commanding formations rather than individual soldiers' precise positions. Visual motion and effects should illustrate the simulation's consequences.

Three.js is the discussed technical direction, with feasibility acknowledged but no implementation started or final architecture selected. A single 3D location with a squad, cover, animation and sound was suggested as a first experiment; that prototype scope remains a proposal.

## Ideas on hold — no decision to implement

### Card-pull NCM combat resolution

The user raised returning combat NCM resolution to card pulls, then explicitly chose to hold off. Keep the current resolver unchanged.

If revisited, distinguish a visual card reveal of an existing calculated outcome from actual resolution using the card's printed result. Actual finite-deck resolution can change outcome dependencies and requires a deliberate rules/replay compatibility decision. A comparative Trévières prototype was suggested, not approved.

## Maintaining this file

Add future ideas here with their status: agreed but deferred, proposal, or explicitly on hold. When work starts, link its implementation/readiness document and record the decision. Do not treat suggestions as accepted requirements or silently pull deferred work into current mission tasks.

## Vehicle usability follow-up — agreed October 11, 2026

M6 passed the user's playtest. Vehicles still need a broader usability pass in the next project phase, alongside the planned 3D/audio/SFX presentation. Refine activation and command visibility, map-led movement, reactions/Quick Shots and crew-HIT prompts, target selection, transport/cargo context and action-result feedback as one coherent flow. Keep the battlefield visible and avoid redundant controls, internal location IDs and empty procedures. Preserve legal command costs, communications, meaningful player decisions, hidden information, deterministic replays and explicit phase stepping. This backlog item is not authorization to begin that redesign now or acceptance of M7.
