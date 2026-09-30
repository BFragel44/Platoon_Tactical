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

