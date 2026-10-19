# HIT breakdown audit and repairs

October 19, 2026. Scope: infantry HIT effects and the known Normandy specialist findings; vehicles and printed-deck transcription are not certified by this pass.

## Source verification

Fields of Fire third-edition series rules, pp.26–27 (LAT experience), pp.47–48 (§6.4.3 ordered letters, one-step limit, remaining-step breakdown, pinning and repeated LAT results), p.49 (§6.5.2 reconstitution firepower), and p.60 (§7.18.1B mortar ammunition). Normandy campaign pp.47–48 were visually reviewed using the retained renders in `output/specialist-audit/`.

**Correction to the earlier audit:** SF-18 was a chart-reading error. The 88mm row explicitly shows a generic Fire Team plus a one-step operational H gun after the first step breaks down. Its existing Good Order survivor is legal. That behavior is retained and protected by tests; no automatic last-step gun conversion was added.

## Repairs

- **SF-17:** An unaffected final German 81mm mortar now retains its operational G side. Named affected teams use the Fire Team side. Surviving named teams replicate the section's remaining mortar ammunition, as required by §7.18.1B.
- **SF-19:** New-mission runtime Fallschirmjäger A/S profiles use an A/S final Fire Team across inherited Normandy content. Original authored profile records remain unchanged so historical replay content is not silently altered.
- **SF-20:** An A/S Fire Team plus an S team can supply an A/S squad. Donor selection includes the weapon-bearing team in the selected subset. Two ordinary S teams, point-blank generic Assault Teams, and an A/S team trying to supply a belt-fed A squad remain insufficient. Both command validation and enemy activity use the versioned eligibility procedure.
- **CR-05 — ordered HIT breakdown:** Fire Team effects on a squad's final affected step now use its chart weapon. Previously a two-step Grenadier receiving FF or CF could lose its A-rated final team. Fallschirmjäger MG randomization now occurs when the actual affected step is the penultimate step, including when a two-letter result reduces a three-step squad to that point. Odd ammunition allocations preserve the remainder.
- **CR-06 — LAT state and inventory:** Named Fire Teams use Green experience while retaining original experience for recovery. A repeated matching LAT result only pins the same team, without replacing its identity or moving its equipment. Converting to a different LAT preserves carried ammunition, radios, equipment and casualty carrier references rather than silently discarding ammunition. Native mortar stock is not double-added after the section replication procedure.
- **CR-07 — depletion and frozen experience:** Automatic depletion to a named Fire Team now sets Green experience for subsequent procedures. The current Combat Effects exposure and HIT experience were already frozen before ammunition expenditure and remain unchanged. The last volley keeps its original H strength, and the current HIT uses the frozen original experience.

## Compatibility

New missions retain `mission_rules.hitBreakdowns: "v1"` and executable replays export `hit_breakdowns: "v1"`. Records lacking this discriminator retain original breakdown, runtime profile, ammunition-depletion and reconstitution behavior. The choice is initialized before attempt snapshots. Unknown variants reject. Existing saved missions and frozen exposures are not migrated automatically. Vehicle adapter replay embeds the initial state, which retains the same rules selection.

## Validation

`test/hitBreakdowns.test.js` exercises every single letter and all 25 ordered pairs from C/P/L/F/A. The matrix covers two-/three-step rifle and engineer squads, Grenadiers, A and A/S Fallschirmjäger, US/German mortar sections, one-/two-step 88mm guns, named HQ/bazooka counters, and existing P/L/F/A LATs. Checks include step identity conservation, first-letter-only one-step resolution, casualty count, resulting sides/weapons, pinning, cover/exposure, experience and mortar ammunition.

Additional controls check both Fallschirmjäger random branches with odd ammunition, weapon-donor selection, carried ammunition/equipment/casualties, frozen final-volley exposure, original versus Green HIT columns, new/historical replay initialization and unknown version rejection.

`test/hitBreakdownReplay.test.js` uses an authored encounter and public phase/combat operations, without injecting tactical state, deck order or HIT results after creation. Its seeded first combat produces a German mortar FC result and a two-step A/S squad P result. The unaffected mortar remains operational and the squad remainder retains A/S. Replay and checkpoint recovery reproduce the complete state exactly. The same sequence under historical breakdown rules also reproduces exactly, retaining the historical mortar outcome.

The specialist audit script is importable and continues to output all fifteen original observations, with SF-18 corrected. Isolated matrix fixtures and authored encounter tests validate shared procedures; they are not full campaign playthroughs or a vehicle breakdown audit.

Final validation: **939 tests passed across 14 focused suites**, including historical Normandy fixtures, specialist replay, ammunition, phone connectivity, player-choice combat and the NCM corrections. The fifteen-observation specialist audit passes. Production build passes with the existing bundle-size advisory; `git diff --check` passes. No player save was loaded or modified.


## Follow-up qualification — October 19, 2026

The casualty/equipment audit found that CR-06 transferred ammunition too broadly during multistep breakdowns. Section 5.1.6E allows inheritance only by chart-specified ammo-tracking Fire Teams; unrelated stock must be lost. See [CASUALTY_EQUIPMENT_RULES_AUDIT.md](CASUALTY_EQUIPMENT_RULES_AUDIT.md), CR-08. Inventory conservation tests did not establish this restriction. This follow-up is audit-only; the previously implemented behavior has not yet been corrected.


CR-08 is now corrected for new missions with `casualty_equipment: "v1"`: multistep breakdown inheritance follows chart ammunition restrictions. See the casualty/equipment audit repair section. Earlier historical replay behavior is retained.
