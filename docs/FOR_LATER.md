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

## Experiments and ideas awaiting a release decision

### Card-pull NCM combat resolution

October 12: the user approved a separate Trévières comparison candidate. It uses real shared-deck combat/HIT draws behind cardPullDev=1; normal missions retain the weighted resolver. See docs/CARD_PULL_COMPARISON.md for evidence and remaining human comparison work.

If revisited, distinguish a visual card reveal of an existing calculated outcome from actual resolution using the card's printed result. Actual finite-deck resolution can change outcome dependencies and requires a deliberate rules/replay compatibility decision. The comparison prototype is now approved and implemented; replacing the normal resolver remains undecided.

## Maintaining this file

Add future ideas here with their status: agreed but deferred, proposal, or explicitly on hold. When work starts, link its implementation/readiness document and record the decision. Do not treat suggestions as accepted requirements or silently pull deferred work into current mission tasks.

## Vehicle usability follow-up — agreed October 11, 2026

M6 passed the user's playtest. Vehicles still need a broader usability pass in the next project phase, alongside the planned 3D/audio/SFX presentation. Refine activation and command visibility, map-led movement, reactions/Quick Shots and crew-HIT prompts, target selection, transport/cargo context and action-result feedback as one coherent flow. Keep the battlefield visible and avoid redundant controls, internal location IDs and empty procedures. Preserve legal command costs, communications, meaningful player decisions, hidden information, deterministic replays and explicit phase stepping. This backlog item is not authorization to begin that redesign now or acceptance of M7.


## Connected campaign validation — completed October 13, 2026

The user accepted company preparation and authorized clearing remaining campaign gates. Connected Standard sequence/launch/recovery is now available in normal navigation after seven-mission transaction checks and live later-handoff setup/reload/resume checks. The existing ?campaignDev=1 URL remains valid. See CAMPAIGN_COMPANY_READINESS.md for evidence and the distinction between controlled transaction fixtures and actual tactical playthroughs. Broader vehicle redesign and 3D/audio remain deferred.
October 12 update: card-pull combat accepted and promoted to normal play in rules38; historical replay compatibility is no longer a release requirement at the user's direction. The remaining combat-screen task is to reduce its footprint while retaining readable cards, NCM, results and expandable details.
October 13: the approved public-card reveal pass is implemented: automatic compact map overlay, relevant fields/results, Exhort grouping, readable Briefing history and recovery suppression. See CAMPAIGN_FIRST_PLAYER_LOG.md for evidence. This completes public draw visibility; reducing the full combat-resolution screen remains the separate next usability refinement.
October 13 player feedback: campaign M1 completion and preparation function correctly, but the XP-spending/preparation screen is text-heavy. Simplify it into clear current-step summaries, remaining points and chosen changes, with expandable rule explanations. Connected progression is released; this presentation refinement remains a later usability task.
# Command-desk pass status — October 14, 2026

The approved text-heavy company-preparation refinement is implemented: full-screen battalion desk, guided stages, persistent roster, explicit debrief recording, reactive reattempt personnel/XP, public deployment map and consolidated setup equipment. Earlier entries describing this as future work are superseded by this status. See CAMPAIGN_FIRST_PLAYER_LOG.md for live evidence and limitations.

Next-pass items remain deferred: tactical typography, active HQ-event display, casualty-carrying emphasis, card-pull interaction, combat-button clarification and detailed AAR formatting. Narrative AAR generation, broader vehicle redesign and 3D/audio remain later milestones. Reported missing imagery was not reproduced; the obsolete AAR fragment was corrected independently. Do not treat either as evidence that the deferred blank-page investigation is resolved.

## Tactical clarity milestone — implemented October 14, 2026

The previously deferred tactical typography, casualty-carrier emphasis, active HQ reference, card-pull hold/queue controls, combat-button clarification and factual AAR organization are now implemented under the user's explicit request. See CAMPAIGN_FIRST_PLAYER_LOG.md for validation and its controlled-fixture limits. User review remains useful before further design changes. Narrative AAR generation, broader vehicle redesign, combat-screen footprint reduction and the intended 3D/audio presentation remain later work. The deprioritized blank-page investigation is still open.
