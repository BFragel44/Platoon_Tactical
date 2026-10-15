import {describe,it,expect} from 'vitest';
import {commandHeader,commandStripUnits} from '../src/ui/commandHeader.js';
import {createMission,getPlayerView,PHASES} from '../src/sim/company/engine.js';
import {companyAssault} from '../src/scenarios/companyAssault.js';
const fixture=()=>{const state=createMission(companyAssault,'header');return {state,props:{v:getPlayerView(state),name:id=>id,seed:'header',recovery:{},recoveryPending:false,locked:false,combatBlocked:false,advanceLabel:'Resolve segment',phaseIndex:0,progress:null,feedback:'Ready',feedbackKind:'Status'}};};
describe('Compact command header',()=>{
 it('places Higher HQ left of phase labels in a hidden, dismissible menu without a ribbon',()=>{
  const {props}=fixture();props.v.hq_events=[{turn:props.v.turn,side:'friendly',code:'SITREP'}];const html=commandHeader(props);
  expect(html.indexOf('class="header-hq-reference"')).toBeLessThan(html.indexOf('class="header-phase-title"'));expect(html).toContain('data-menu="higher-hq"');expect(html).toContain('data-close-header-menu');expect(html).toContain('aria-label="Current higher HQ events" hidden');expect(html).not.toContain('class="active-hq-event"');
 });
 it('orders headquarters by command hierarchy without changing the player view',()=>{
  const units=[{id:'hq3',kind:'HQ',platoon:3},{id:'staff',kind:'STAFF'},{id:'hq1',kind:'HQ',platoon:1},{id:'co',kind:'HQ'},{id:'visitor',kind:'STAFF',command_role:'higher_hq'},{id:'hq2',kind:'HQ',platoon:2},{id:'xo',kind:'STAFF'},{id:'s11',kind:'SQUAD'}];
  const before=structuredClone(units);expect(commandStripUnits({units,turn:4}).map(u=>u.id)).toEqual(['visitor','co','xo','staff','hq1','hq2','hq3']);expect(units).toEqual(before);
 });
 it('retains a departure notice for one turn, then removes only the command square',()=>{
  const {props}=fixture();const visitor={...props.v.units[0],id:'visitor',name:'Battalion commander',kind:'STAFF',command_role:'higher_hq',removed:'DEPARTED',expires_turn:5};props.v.units.push(visitor);props.v.turn=6;
  expect(commandStripUnits(props.v)).toContain(visitor);expect(commandHeader(props)).toContain('Departed · higher HQ visit complete');
  props.v.turn=7;expect(commandStripUnits(props.v)).not.toContain(visitor);expect(props.v.units).toContain(visitor);
  visitor.removed='ELIMINATED';expect(commandStripUnits(props.v)).toContain(visitor);
 });
 it('shows departed higher HQ visitors neutrally while retaining eliminated status for losses',()=>{
  const {state,props}=fixture();state.units.visitor={...structuredClone(state.units.co),id:'visitor',name:'Battalion commander',command_role:'higher_hq',removed:'DEPARTED'};
  props.v=getPlayerView(state);let html=commandHeader(props);let square=html.match(/<div class="[^"]*"><b>Battalion commander<\/b>.*?<\/div>/s)?.[0];
  expect(square).toContain('hq-transition');expect(square).toContain('Departed · higher HQ visit complete');expect(square).not.toContain('Eliminated');
  state.units.visitor.removed='ELIMINATED';state.units.visitor.steps=[];props.v=getPlayerView(state);html=commandHeader(props);square=html.match(/<div class="[^"]*"><b>Battalion commander<\/b>.*?<\/div>/s)?.[0];
  expect(square).toContain('hq-degraded');expect(square).toContain('Eliminated · no command capability');
 });
 it('allows reopening closed combat while retaining recovery and review locks',()=>{const {props}=fixture();const review={...props,combatBlocked:true,reviewCombat:true,advanceLabel:'Review combat'};expect(commandHeader(review)).toMatch(/id="advance" class="primary" >Review combat/);expect(commandHeader({...review,locked:true})).toMatch(/id="advance"[^>]*disabled/);});
 it('renders existing file controls in an overlay without changing simulation',()=>{const {state,props}=fixture(),before=structuredClone(state),view=structuredClone(props.v),html=commandHeader(props);for(const id of ['nav-home','nav-campaign','nav-missions','export','resume','restore','save-export','previous-export'])expect(html).toContain(`id="${id}"`);expect(html).toContain('id="panel-file"');expect(html).toContain('Open recaps for visible changes');expect(state).toEqual(before);expect(props.v).toEqual(view);});
 it('preserves progression labels and disables progression for review, recovery and HQ choice',()=>{const {props}=fixture();for(const patch of [{locked:true},{combatBlocked:true},{v:{...props.v,eligible_hqs:['hq1']}}]){const html=commandHeader({...props,...patch,advanceLabel:'Continue to cleanup'});expect(html).toMatch(/id="advance"[^>]*disabled/);expect(html).toContain('Continue to cleanup');}});
 it('shows separate reserves and current expenditure',()=>{const {props}=fixture();props.v.impulse={hq:'co',commands:3,spent:2};props.v.units.find(u=>u.id==='hq1').saved=4;const html=commandHeader(props);expect(html).toContain('4 saved');expect(html).toContain('3 available · 2/6 spent');expect(html).toContain('co · 2/6 spent');});
 it('keeps Recap without duplicating feedback in the header',()=>{const {props}=fixture();const html=commandHeader({...props,feedbackKind:'Previous segment',feedback:'Duplicated message',recap:{id:'recap:1',label:'Prior segment'}});expect(html).toContain('Recap');expect(html).toContain('panel-debug');expect(html).not.toContain('Duplicated message');expect(html).not.toContain('class="header-result"');});
 it('keeps recovery metadata and mission information inspectable',()=>{const {props}=fixture();props.recovery={raw:'record',bundle:{latest:{turn:2,phase:'COMBAT_EFFECTS',timestamp:'today'},turnStart:{turn:2,phase:'FRIENDLY_EVENT',timestamp:'earlier'}}};const html=commandHeader(props);expect(html).toContain('Latest: turn 2');expect(html).toContain(props.v.briefing);expect(html).toContain(PHASES[0][1]);expect(html).toContain('Progress saves automatically');});
});
