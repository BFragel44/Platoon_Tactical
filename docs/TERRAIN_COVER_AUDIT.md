# Terrain and occupied cover — 2026-09-30

Rules **14**, KUTF content **12**, Company Assault content **4**. This corrects specific findings; it does not reopen the general standalone acceptance gate. Historical exports are preserved. Older executable saves/replays fail strict loading and remain exportable.

## Visible battlefield

Every revealed terrain card displays C&C (both values where printed), elevation/hills, base Seek Cover draws, used discovery slots/potential, burst modifier, cover type, multi-story/tower features, directional LOS description and smoke status. Normandy's printed vehicle trafficability is shown as reference-only; vehicle rules remain deferred. Unknown cards reveal none of these fields. Staging does not display terrain protection or discovery potential.

Known cover positions receive local C1/C2 identifiers. Those identifiers appear on the occupying friendly/spotted-enemy formations and in within-card order targets. Ground floors and upper stories are separate positions. The badges show additional protection and actual elevation; terrain-only formations are explicitly labelled. Exposure remains visible even under cover. Capacity and fortification firing direction are displayed on the cover position.

Artwork uses the supplied `Counters_Side_1.png` and `Counters_Side_2_and_3.png`, copied unchanged to `public/counters`. `src/ui/coverManifest.json` records source, dimensions and sprite rectangles. Only matching printed values are used; unsupported counters use a labelled fallback. The upper-story protection is the discovered building's value, not a fixed value inferred from an illustration.

## Rules checked

Authority: [third-edition rulebook](../reference/Fields_of_Fire_Rules_3rd_Edition.pdf), pp.34–38 (§§5.2–5.4), with mortar clarification pp.52–53 (§§7.3.1–7.3.2). Printed values checked against all three Normandy terrain sheets in `reference/terrain_cards`.

| Topic | Finding |
| --- | --- |
| §5.2.1 LOS | Existing eight straight directions, adjacent visibility, white entry **and** exit for intervening terrain, dark corners, three-card limit and separate weapon range retained. Smoke exceptions still apply. |
| §5.2.2 elevation | Existing reciprocal elevation LOS, lower-terrain overlook, blocked dark stepped slope 3→2→1 and same-level obstruction retained. Hill borders override white terrain borders. |
| §5.2.2B buildings | Existing separate ground/upper cover areas, +1 upper elevation, matching building protection, direct upper-story discovery/entry, within-card movement and one-step church tower capacity retained. Basic VOF can cover the card when only an occupied upper story is visible; target-specific attacks still need actual unit LOS. |
| §5.2.3 C&C | **Fixed:** targeted direct attacks now contribute their crossed border to dual-value terrain protection, even without basic fire. Grenade markers retain their firing origin after the source moves. Same-card, Incoming and indirect mortar use the lower value unless other applicable fire crosses a dark border. |
| Printed terrain | **Fixed:** sheet 1, row 1, column 7 Hedgerow has printed +2/+1 despite all-dark borders; its lower value applies to same-card/indirect fire. Sheet 2, row 2, column 4 Orchard has cover potential **2**, not 1. |
| §5.3 cover | Existing cover adds to C&C; discovery limits exclude upper stories/fortifications; opposed live units cannot share cover; capacities, blast overcrowding, persistence and exposure are unchanged. **Display fixed:** discovered buildings count toward potential; upper stories and enemy fortifications do not. |
| §5.4 screens | Existing LOS into, but not through/out of Smoke or active Incoming, retains same-card visibility. Best single smoke benefit applies; exceptions for grenades, mines and Incoming are preserved. |
| §7.3 mortar restrictions | **Fixed:** direct/indirect mortar fire recognises Light/Strong Building, Upper Story and Church Tower as building cover. Validated grenade/rifle-grenade restrictions use the same enclosed-cover classification. Indirect mortar correctly retains its burst adjustment (§7.3.2); this is not limited to off-map Incoming. |

No combat probability changes. This is standard Normandy terrain, not the separate urban-map systems of §13. Night/weather, vehicles, caves and additional campaign terrain remain outside this audit.

## Validation

- Full regression suite: 343 tests / 43 files passed using `--pool=threads`; production build passed.
- Focused fixtures cover targeted border effects with retained origin, building mortar restrictions, smoke exceptions/indirect burst, cover identifiers/elevations/discovery counts, hidden terrain, pure rendering, artwork references and strict historical-version rejection. Existing LOS, tower capacity, building movement, smoke, frozen combat and visibility tests remain passing.
- Six complete scripted KUTF runs (both `kut-1` and `kut-2`; direct, support, recovery) terminated at turn 10 and reconstructed with identical full state via strict replay. Output: `output/keep-up-the-fire-integration-r14-v12`. Summary outcomes, orders, casualties and remaining contacts match the revision-13 summary; this is not a claim of cross-version state identity.
- `kut-1`: direct defeat, support success, recovery defeat. `kut-2`: all three defeat. Scripted policies are integration checks, not human playthroughs or difficulty measurements.
- Browser: production KUTF setup/resume and Reset LOS checked; all twelve unrevealed cards retained no terrain facts, four revealed row-1 cards displayed facts, staging stayed separate. Synthetic occupied-cover fixture (`test/terrain.browser.html`) checked matching ground/upper/tower/pillbox/basic artwork and labels. At minimum map-card width (220 px), all four fixture cards had matching client/scroll widths (218 px), with no clipped content. Desktop screenshot: `output/terrain-cover-desktop.png`. Narrow screenshot capture timed out in the browser tool; narrow overflow verification used rendered DOM geometry.
- Human visual preference remains to be confirmed during ordinary play: identify a unit's exact cover position, separate terrain C&C from additional cover, and explain its elevation and exposure without opening diagnostics.
