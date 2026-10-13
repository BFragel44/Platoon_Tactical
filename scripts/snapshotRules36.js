// One-time read-only audit snapshot; never regenerate from a later revision.
import {build} from 'esbuild';
await build({stdin:{contents:"export * from './src/sim/company/engine.js'; export {trevieresCardPull} from './src/scenarios/trevieresCardPull.js';",resolveDir:process.cwd()},outfile:'src/sim/company/compat/rules36.js',bundle:true,format:'esm',platform:'node'});
