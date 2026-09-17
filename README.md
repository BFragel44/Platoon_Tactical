# Platoon Tactical - Company Assault

A local, deterministic company assault validation mission inspired by the Fields of Fire infantry assault courses. Command two platoons and support assets through explicit phases, communications limits, autonomous fire and recoverable cohesion losses.

## Run

```text
npm install
npm run dev
npm test
npm run build
npm run playtest
```

Use Node 22 or newer. If PowerShell strips CLI flags, launch Vite directly: `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173`.

The normal button resolves the current segment or completes an HQ impulse. Select subordinate HQs when prompted. Orders resolve immediately. Fast-forward is diagnostic only. The UI exports reproducible operations and a player-perspective AAR.

[Rules and manual playtest guide](docs/M0_RULES_AND_PLAYTEST.md) is authoritative. [Validation status](docs/COMPANY_PLAYTEST_RESULTS.md) distinguishes completed checks from outstanding gameplay acceptance. The previous three-fireteam prototype and tests remain as historical regression fixtures; `npm run playtest:legacy` runs its old comparison.
