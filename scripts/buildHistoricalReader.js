import {execFileSync} from 'node:child_process';
import {build} from 'esbuild';
import {mkdirSync} from 'node:fs';
mkdirSync('src/sim/company/compat',{recursive:true});
mkdirSync('tmp/rules27-source',{recursive:true});
execFileSync('git',['archive','--format=tar','--output=tmp/rules27-source.tar','7d8984a8b2be46f71b17a786648fd9652f7a9b56','src']);
execFileSync('tar',['-xf','tmp/rules27-source.tar','-C','tmp/rules27-source']);
await build({stdin:{contents:"export {replayMission} from './src/sim/company/engine.js'; export {stGeorges} from './src/scenarios/stGeorges.js';",resolveDir:'tmp/rules27-source',sourcefile:'rules27-reader-entry.js'},bundle:true,format:'esm',platform:'browser',outfile:'src/sim/company/compat/stGeorgesRules27.js',banner:{js:'// Frozen M3 rules-27 reader. Source Git commit 7d8984a; regenerate with scripts/buildHistoricalReader.js.'}});
