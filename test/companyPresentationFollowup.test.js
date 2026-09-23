import {describe,it,expect} from 'vitest';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {createMission,getPlayerView,advancePhase} from '../src/sim/company/engine.js';
import {fireExplanation,pdfPaths} from '../src/ui/fireMarkers.js';
import {commandHeader} from '../src/ui/commandHeader.js';

describe('company presentation follow-up',()=>{
  it('projects named friendly dropped equipment without revealing enemy equipment',()=>{
    const s=createMission(companyAssault,'equipment');
    s.assets.push({id:'friendly_radio',type:'RADIO',net:'CO',location:'r1c1',faction:'friendly'});
    s.assets.push({id:'enemy_radio',type:'RADIO',net:'ENEMY',location:'r1c2',faction:'enemy'});
    const view=getPlayerView(s);
    expect(view.assets).toEqual([expect.objectContaining({id:'friendly_radio',label:'CO radio',location:'r1c1'})]);
    expect(JSON.stringify(view)).not.toContain('enemy_radio');
  });
  it('keeps the combat review starting sequence in the public projection',()=>{
    const s=createMission(companyAssault,'review');
    s.phase='COMBAT_EFFECTS';s.segment_progress={phase:'COMBAT_EFFECTS',status:'reviewing',index:0,total:0,events_after:17};
    const view=getPlayerView(s);
    expect(view.segment_progress.events_after).toBe(17);
    expect(view.segment_progress.visible_total).toBe(0);
  });
  it('explains held same-card fire without suggesting own-side damage',()=>{
    const s=createMission(companyAssault,'same-card');
    const v=getPlayerView(s),fire={source:'s11',origin:'r1c1',target:'r1c1',friendly:true,reason:'CONTINUING_AT_CLEARED_POSITION'};
    const explanation=fireExplanation(v,fire);
    expect(explanation).toContain('No known opposing recipient');
    expect(explanation).toContain('does not attack itself');
  });
  it('retains the visible source and intermediate cards of a long PDF',()=>{
    const s=createMission(companyAssault,'path');s.fire=[{source:'s11',origin:'r1c1',target:'r3c1',value:0,direction:{dr:1,dc:0}}];
    expect(pdfPaths(getPlayerView(s))[0].cards).toEqual(['r1c1','r2c1','r3c1']);
  });
  it('shows HQ side and radio loss in the compact command row',()=>{
    const s=createMission(companyAssault,'hq');s.units.hq1.cohesion='F';s.units.hq1.radios=[];
    const v=getPlayerView(s),html=commandHeader({v,name:id=>id,seed:'hq',recovery:{bundle:null,raw:null},recoveryPending:false,locked:false,combatBlocked:false,advanceLabel:'Continue',phaseIndex:0,progress:null,feedback:'',feedbackKind:'Status'});
    expect(html).toContain('Fire Team side · command side unavailable');
    expect(html).toContain('No carried radio');
  });
});
