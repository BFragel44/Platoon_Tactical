# Keep Up the Fire — current status

## Decision

**Standalone playability accepted; proceed to the modular campaign foundation.** The user completed repeated human playthroughs, reported mostly smooth rules, then described the latest playthrough as fun. Notes KUTF 4's confirmed presentation defects are corrected. No confirmed KUTF implementation blocker remains in the scoped audit.

This closes the requirement for another general KUTF acceptance playthrough before campaign development. It does not certify every rare rules interaction or make Normandy playable. Investigate concrete new regressions; cosmetic polish and exhaustive certification are not prerequisites for beginning the next milestone.

Rules **14**, KUTF content **12**, course content **4**. The [terrain/cover audit](TERRAIN_COVER_AUDIT.md) records the later confirmed corrections and visual indicators. Older executable records remain exportable but require their original revision. Mission selection now calls KUTF a standalone mission. Historical briefing text stays in simulation records for replay compatibility; the obsolete acceptance prefix is omitted from the normal Mission display.

## Completed readiness checklist

- [x] Three platoons, staff, attachments, asset assignment and setup confirmation.
- [x] Seeded terrain/revelation, hill stacking, objectives, CCP and movement boundaries.
- [x] Contacts, placement/rejection, counter limits, buildings, fortifications, upper stories and map expansion.
- [x] Mission communications, support, events, special enemies and deliberate-defense activity.
- [x] Combat, recovery, capture/retreat, transport, casualty evacuation and achievements.
- [x] Versioned save/resume, strict replay, AAR and mission termination.
- [x] Critical fixtures, full seeded runs, browser interaction checks and user playthroughs.
- [x] Notes 4 mine/Incoming visibility, cover names and platoon movement previews.

Evidence: [audit](KUTF_READINESS_AUDIT.md) and [validation](COMPANY_PLAYTEST_RESULTS.md). Latest validation: 330 tests and production build pass; two archived full-state/RNG/history hashes are unchanged by Notes 4. Six revision-13 scripted policies completed and strictly replayed.

## Retained boundaries

- Weighted deck-derived combat and hit-effect rolls remain the approved adaptation.
- Fortification markers remain unlimited by user-approved assumption; capacities and enemy counter limits remain enforced.
- The complete action menu is not implemented: Exhort, runners, radio-net switching and group grenade/concentrated-fire orders remain omitted. Unloading is whole-load rather than individual-item selection. These are explicit fidelity limitations, not newly discovered mission blockers.
- Named casualties are recorded by step; wound/death disposition and post-mission administration belong to campaign work.
- Some screenshots timed out. Rare-case visual refinement remains follow-up work, not an indefinite release gate after successful user playthroughs.

## Next

Follow [Normandy readiness](NORMANDY_READINESS.md): mission contracts and roster/debrief safety, then Trévières systems/content. KUTF remains the regression mission and must not inherit campaign ammunition, communications or replacement rules accidentally.

Earlier checklists are preserved verbatim in [development history](KEEP_UP_THE_FIRE_HISTORY.md). Their old missing/gated/acceptance-outstanding statements are historical, not current tasks.
