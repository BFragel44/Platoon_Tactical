# Trévières card-pull comparison

Development candidate only, October 12, 2026. Normal missions retain independent weighted combat rolls.

Open `http://localhost:5173/?cardPullDev=1`, choose Missions, then **Trévières — card-pull comparison**. Use ordinary setup and explicit phase stepping. The existing combined-combat button remains available; revealing cards adds no mandatory click. Campaign progression is not part of this experiment.

## Mechanics and identity

- Third-edition p.47 §§6.4.1–6.4.3: one Action Card per receiving formation at its bounded NCM; HIT immediately draws a second card using the formation's experience. Existing breakdown rules apply the resulting letters.
- Both draws use the same finite Action Deck as commands, contacts and attempts, including discard/depletion and the existing reshuffle-marker procedure. There is no separate combat deck or cosmetic substitute for a weighted roll.
- Combat stakes/NCM remain frozen and existing queue order remains. Deck-dependent outcomes can change with draw order. Unspotted enemy card IDs and outcomes remain hidden; remaining-deck odds are not projected.
- The panel highlights the recorded card ID/NCM/result and, on HIT, the second card ID/experience/effect. Displayed odds are explicitly fresh-deck references.
- Experimental scenario `normandy_1_card_pull`, content version 1, resolver `action-deck-v1`, under base rules 36. Replay metadata and immutable attempt starts pin this identity; mismatched resolvers reject. Normal rules-36 records are unchanged and still replay through the weighted resolver.
- Company key `platoon-trevieres-card-pull-company`; tactical key `card-pull-platoon-company-recovery`, with its own backup. Normal infantry, campaign and vehicle records remain separate. Comparison recovery is listed only with the development opt-in.

## Evidence and limits

- Focused fixtures: actual next-card MISS/PIN/HIT, second draw only on HIT, reshuffle marker, unchanged normal weighted draws, hidden enemy protection, strict replay identity and independent recovery. Combat-screen/combined-resolution regressions also pass.
- Three legal scripted runs, seeds `card-pull-1`, `card-pull-2`, `card-pull-3`, completed both attempts with exact full-state replay. All ended DEFEAT under the existing public-view policy (107, 187 and 141 orders respectively). This validates execution/reattempt/replay, not balance or human acceptance.
- Browser origin 5178: Home → Missions → candidate setup → Start → Home/reload; comparison recovery listed by its actual name, no normal save created. Synthetic visual fixture uses the real resolver and shows Card 16 at NCM −3 → HIT, then Card 2/Line → CP; hidden enemy identity remains concealed. This visual fixture is not a manual mission playthrough.
- Normal root/catalog remains unchanged. Production build and focused checks pass with the existing bundle-size warning. Human comparison playthrough and pacing feedback remain open; no decision to replace the normal resolver has been made.

Artifacts: `output/card-pull-playtests/`; driver: `node scripts/trevieresAcceptanceRun.js --card-pull <seed>`.

Final checks: six focused files / 53 tests pass, production build passes, and diff checks pass. Browser comparison resume also succeeded. Screenshot: output/card-pull-playtests/card-reveal.png. Full normal regression was not repeated for this isolated candidate; prior rules36 sweep remains separately recorded.
# Rules 37 follow-up

The current candidate uses shared rules 37: non-firing contact positions receive unspotted-position markers, and own-card Spot attempts are available without a firing report. Original rules-36 comparison records remain historical and exportable; they are not migrated or retagged. These changes do not alter the card-pull combat resolver.

# Normal-play promotion — rules 38

The user accepted the card-pull mechanics and authorized promotion into normal play, dropping historical replay compatibility as a release requirement. All Company Assault, KUTF and Normandy mission starts now use the shared Action Deck for infantry NCM/HIT resolution without URL flags. Campaign and standalone routing retain their existing slots; the former M1 comparison URL remains separate. Vehicle AT/gunnery rules are unchanged; infantry and passenger NCM combat use the same card pulls.

New runs require rules38. There is no conversion of weighted-resolution saves and no new historical reader for this release. Existing originals are not deleted. Combat-screen compaction is subsequent usability work.

Release evidence: all nine normal catalog missions initialize the resolver and reproduce their current replay identity, including both vehicle factories. Focused combat/vehicle phase/passenger suites: 43 passed. Source, preparation, normal full-run, presentation and runner suites: 310 passed, one archived weighted-run check skipped. The broader first sweep passed 1,845 checks; its remaining failures were obsolete weighted fixtures/assertions or checks fixed during the sweep. Ten historical weighted-order checks are explicitly archived, rather than migrated; current normal M1/M4 reattempt and M5 three-patrol lifecycle checks replace the full-run coverage. Those three scripted policies ended in defeat, with exact replay and save/reload; these outcomes are not a balance claim. Browser production-renderer fixture, without development flags, displayed actual combat Card 24 and HIT Card 13, retaining hidden enemy identity. Screenshot: `output/card-pull-playtests/normal-play-r38.png`. Build passed with the existing bundle-size warning.

