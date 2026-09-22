import * as company from './company/engine.js';
import { createMission as legacyCreate } from './createMission.js';
import { submitCommand as legacyCommand } from './commands.js';
import * as legacyPhases from './advancePhase.js';
import * as legacyView from './playerView.js';
// Preserve existing callers and the earlier uncommitted prototype as regression fixtures.
const isCompany = value => value.ruleset === 'company-v1';
export const createMission = (scenario, seed) => isCompany(scenario) ? company.createMission(scenario,seed) : legacyCreate(scenario,seed);
export const submitCommand = (state, command) => isCompany(state) ? company.submitCommand(state,command) : legacyCommand(state,command);
export const advancePhase = state => (isCompany(state)?company:legacyPhases).advancePhase(state);
export const endTurn = state => (isCompany(state)?company:legacyPhases).endTurn(state);
export const abortMission = state => (isCompany(state)?company:legacyPhases).abortMission(state);
export const resolveCombat = (state,resolutionId) => isCompany(state)?company.resolveCombat(state,resolutionId):{state,events:[],accepted:false,reason:'Legacy missions do not expose combat resolutions.'};
export const getPlayerView = (state,...args) => (isCompany(state)?company:legacyView).getPlayerView(state,...args);
export const getVisibleEvents = (state,...args) => (isCompany(state)?company:legacyView).getVisibleEvents(state,...args);
export const getAfterActionReport = (state,...args) => (isCompany(state)?company:legacyView).getAfterActionReport(state,...args);
export { selectHQ, exportReplay, replayMission, compareReplay } from './company/engine.js';
export { createCommandRecord, createFactionKnowledge, createFireRelationshipRecord } from './records.js';
export { createRng, drawRandom } from './rng.js';
