# Battlefield UI overhaul

Implemented from `reference/UI_Redesign_Mock_Up.png`, retaining the existing visual style and formation panels. Presentation-only: rules 13, KUTF content 11 and Company Assault content 4 remain unchanged.

## Delivered

- Independent battlefield scrolling and an independently scrollable desktop orders panel. Expanded maps retain geographic grid positions.
- Bottom-left battlefield controls: Reset LOS, 50–150% zoom in 10% increments, Reset zoom and Find unit. Only map content scales, including terrain borders and PDF paths. Find unit centers the selected formation; Reset LOS clears inspection/PDF emphasis without revealing terrain or enemies.
- Camera and orders-panel scroll position are stored in existing recovery presentation data. Old presentation records default to 100% zoom. Choosing another formation starts its orders panel at the top.
- Current/previous/next segment hierarchy, recorded-event Recap, activity/daylight indication, turn progress, and an active command badge in the HQ strip. Individual reserves, expenditure limits, status and communications remain visible. Command calculations remain expandable.
- Selected formation counters and inline inventory quantities, radios and carried casualties. Existing validated unloading commands are reused; no new inventory mechanics or ammunition accounting.
- Nine decorative crops from `UNITS_AMMO_ASSETS_COUNTERS.png`, with source hash and exact bounds in `src/ui/counterManifest.json`. Printed weapon statistics are excluded; live steps, status and quantities come from the player projection. Unsupported/degraded sides use labelled counter badges.
- Narrow-screen HQ scrolling and Orders/Battlefield navigation. Map legend and fire/history details are expandable. File, Mission, Roster and Settings overlays retain keyboard dismissal and recovery controls.
- Full-width combat presentation retained. When it is closed, the header offers **Review combat**; reopening reads the stored result and does not resolve or advance the simulation.

## Verification

- Full regression suite and production build pass (337 tests / 42 files).
- The default test run passed all assertions but reported Windows `EPERM` during fork-worker cleanup. A complete repeat using `node node_modules/vitest/vitest.mjs run --pool=threads` exited cleanly with all 337 tests passing; no test or game configuration was changed for this workaround.
- Focused regressions cover camera bounds/centering, scaled PDF coordinates, strict presentation recovery, visible historical recaps, inventory legality/live quantities and shipped counter assets.
- Archived `kut-1` and `kut-2` direct-policy replays reconstruct to their unchanged full-state SHA-256 hashes (state includes RNG and history):
  - `kut-1`: `451c55ed622f34d4d1e9ef8569dab03f2c1dab1fcc6049cb1dd7eeef210a31ce`
  - `kut-2`: `14a3d5aa76054ec6d9b204c1be5630ae87455212c8f3ede705fd6fd7c1b5e2e1`
- Edge walkthrough used an isolated test origin, preserving the user's normal localhost save. Checked desktop and narrow layouts (1440×900 and 390×844 viewport overrides; existing browser zoom retained), menu Escape, Recap, setup, HQ activation, platoon movement, inventory and map controls.
- KUTF `company-1` browser run: free unloading left five Company HQ commands unchanged; Reset LOS retained all 12 unrevealed cards; 80% camera position survived an order and reload. Contact C at 1.1 resolved once into mines, with its recorded draws and mine checks visible on the card. Continued through pinned recovery into full-width combat. A HIT/CC result survived reload and close/reopen, with no second Resolve button.
- No browser console errors in the final walkthrough. Screenshot: `output/ui-overhaul-desktop.png`.

## Remaining user evaluation

The implementation and technical checks are complete. A normal play session should confirm preferred zoom, text density, HQ-strip readability and touch/narrow-screen comfort. This is visual/usability feedback, not a new KUTF rules gate. A complete human mission was not replayed for this presentation-only change. Normandy systems, terrain-image backgrounds, new settings, animation and sound remain outside this milestone.

## September 30 — trim sidebar and map references

Map backpacks and their inventory dialogs were removed from the live UI. Non-interactive identification badges now show squad numbers, HQs, weapon teams and staff (for example 3/1, 1MTR and XO). Inventory remains in the selected formation sidebar. Historical saves containing an inventory-dialog selection no longer reopen that retired dialog.

Mission contains casualty evacuation, turn summary and Abort. Roster contains selected-formation named personnel. The new Debug overlay contains order eligibility, the map key, fire details, tactical record, segment result history, and diagnostics/card draws. These references no longer occupy the map footer or orders sidebar. The duplicate header feedback row is removed; Previous/Recap remains. Sidebar feedback is collapsed by default, and the sidebar uses normal page scrolling instead of a nested scrollbar.

Validation: 338 tests and production build pass. Edge checks confirm zero map inventory controls, zero relocated footer panels, correct menu destinations and visible sidebar overflow. Debug fits the narrow viewport without horizontal page overflow and dismisses with Escape. Rules, probabilities and replay versions are unchanged.

### Additional sidebar reduction

Removed the communication and attempted-action paragraphs from the orders pane, omitted the idle no-incoming-fire message, and moved Recovery/other non-order feedback into Debug. Actual incoming-fire warnings remain compact; order rejection reasons and inventory remain visible. Reduced field, counter, preview and inventory spacing. Browser-checked Company HQ with a BN radio and targeted order: pane height 564 CSS pixels versus 811 for the map at the tested desktop size, so the pane no longer extends the workspace below the map. Screenshot: output/ui-compact-orders.png. Gameplay unchanged.



## Compact combat overlay — 2026-09-30

User confirmed the terrain/cover visual playtest. Combat now uses a fixed, compact overlay below the measured command header, with desktop space reserved for the inventory/orders column. It no longer takes a row in page flow. Completed combat history is retained in Debug; the header still reopens the current resolution.

The production renderer is extracted to `combatScreen.js`. Source context, receiving formation, all frozen NCM terms (including zeros and unclamped totals when relevant), exact MISS/PIN/HIT stakes, expandable conditional hit effects and stored consequences are retained. Reciprocal fire remains a separate receiving formation, not a second probability roll inferred from the attacker. Hidden-source information remains restricted. The controls and save/reveal behavior are unchanged.

Validation: 344 tests / 44 files pass; production build passes. Browser fixture `test/combatOverlay.browser.html` uses the real engine and production renderer. Map and inventory top stayed at 150 CSS pixels before/after closing; Resolve showed HIT and its resulting formations. At a 390-pixel viewport override (433 CSS pixels at browser zoom), overlay client/scroll widths both measured 398 pixels and the sticky action footer remained within the viewport. Desktop screenshot: `output/compact-combat-overlay.png`.

Presentation only: rules 14 / KUTF 12 / Company Assault 4 unchanged. No simulation, probability or replay-format changes. User assessment of the new combat layout remains open.


## Symmetric combat review — 2026-09-30

Matching German/US formation panels now show incoming-fire stakes on the outer edges, actual fire-direction arrows between them, all frozen NCM modifiers, and stored consequences beneath each receiving formation. A reciprocal panel requires actual mutual fire relationships; LOS alone does not authorize a second resolution. Unspotted sources show unknown stakes and no hidden consequences. Support effects remain explicitly labelled.

Adjacent visible reciprocal items can use Resolve both formations. This invokes the existing resolve/advance/resolve operations in their original seeded order and saves each accepted operation. An intervening visible formation prevents batching; its queue position is preserved. No rules, probabilities, replay format or content versions change (rules 14 / KUTF 12 / Company Assault 4).

Validation: 347 tests / 45 files and production build pass. Focused checks verify exact equivalence with the original ordered operations, no skipping of unrelated formations, deterministic repeated execution and hidden-source safety. Production-renderer browser fixtures verify two results beneath matching panels, close/reopen retention, one-sided unknown stakes, and narrow layout without internal horizontal overflow (client/scroll widths 382/382 CSS pixels). The fixed overlay leaves battlefield and inventory in place. Screenshot: output/symmetric-combat-overlay.png. Human layout preference remains for the next playtest.


## Compact terrain cards — 2026-10-01

Terrain faces now show Seek cover, Discovered and Cover type beneath the title; compact multi-story/tower/smoke badges; occupied cover and formations; and a bottom footer with Burst plus SLOW/NO vehicle references. One separate Hill +1 strip per hill overlay shows cumulative levels below the card, outside its LOS border. Selection/LOS dimming remains associated with the whole terrain stack.

Removed redundant unrevealed-terrain and empty-cover messages. Full elevation, protection, directional C&C, LOS/border explanation and vehicle restrictions remain in a keyboard-accessible Terrain details inspector. Selected-unit LOS explanations move into that inspector. Terrain data, combat rules, versions, saves and probabilities remain unchanged.

Validation: 349 tests / 45 files and production build pass. Production-renderer browser fixture verifies hidden terrain reveals no facts, two hill strips show levels 2/3, footer labels match trafficability, cover associations remain visible, and Enter opens/closes the full inspector. Desktop cards have equal client/scroll widths (509/509); narrow cards measure 218/218 CSS pixels with page width 416 inside a 433-pixel viewport. Screenshot capture timed out in the browser; visual screenshot validation is not claimed. Human layout feedback remains open.


### LOS border resizing correction — 2026-10-01

Replaced the proportionally stretched SVG frame with eight independently coloured CSS edge/corner segments using the same authored border data. The frame has a fixed 4-pixel inset, 6-pixel thickness and 12-pixel corners; only the straight edge lengths change as cards grow. Header/footer text stays inside the reserved card padding. Accessibility descriptions, fog of war and PDF/highlight layers are preserved.

349 tests and production build pass. Production browser fixture with 15 additional formations per card verifies 1358–1568 CSS-pixel card heights, unchanged 12-pixel corners and approximately 6-pixel header/footer clearance. Screenshot: output/fixed-los-borders.png. Presentation only; no rule/data/version changes.


## KUTF live achievement tally — 2026-10-01

A KUTF-only Achievements button sits left of the current phase at desktop widths and wraps beside/above the phase on narrow screens. The existing header overlay system shows all 12 published tasks, award rates, points gained and a running total. Escape returns focus to the button; outside click dismisses; only one header menu opens at a time.

The tally previews existing mission scoring on isolated bookkeeping, preserving state/history/RNG and existing AAR scoring. Position-based points (objectives, other cleared contact cards, bunkers/pillboxes) are explicitly provisional while ACTIVE and finalized at mission end. Live event achievements update from historical scoring evidence without duplicate step credit. Company Assault has no KUTF button. Rules/content versions unchanged.

Validation: 351 tests / 46 files pass; production build passes. Focused tests prove projection purity, repeated-step deduplication, 12 task rows, final-score agreement and course gating. Browser fixture test/achievements.browser.html uses production projections/header/styles without touching local saves. Desktop popup and Escape/focus verified. At 390-pixel width the popup spans x=8..382 and page width remains 390 (no horizontal overflow). Screenshot output/kutf-achievements.png.


## Readable contact and objective counters — 2026-10-01

Potential contacts now use 88-pixel counters with 14-pixel labels and 30-pixel A/B/C/? letters. Primary and Secondary objectives use diamond-backed labelled counters; Attack and CCP have distinct rectangular styling. Objective Cleared/Secured status remains visible and independent of whether a contact is still present. Marker groups occupy their own wrapping row, keeping terrain and formations unobstructed. Vector/CSS construction reproduces the supplied draft using established palette/typography without new bitmap dependencies. All existing mission information and unknown-terrain safeguards remain intact; rules and versions unchanged.

351 tests and production build pass. Production fixture test/terrainMarkers.browser.html covers unrevealed/revealed terrain, A/B/C/? contacts, Primary/Secondary/Attack/CCP and Secured status without touching saves. Narrow browser check: all counters remain 88 pixels wide, cards have matching client/scroll widths (349/349), and the page fits the 390-pixel viewport. Desktop screenshot: output/readable-mission-counters.png.
