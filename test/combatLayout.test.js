import {it,expect} from 'vitest';
import {combatRecipients,combatScreen} from '../src/ui/combatScreen.js';
const source={kind:'BASIC_FIRE',source_id:'enemy',origin:'r4c1',vof:-3,label:'Automatic weapons'};
const exposure={id:'e',target_name:'Paralyzed team 55',target_location:'r2c4',target_faction:'friendly',target_steps:1,target_experience:'Green',target_pinned:true,status:'PENDING',ncm:1,total:1,modifiers:[{label:'Selected VOF',value:-3,source:'FIRE'},{label:'Terrain',value:2},{label:'Cover',value:1},{label:'Pinned',value:1}],sources:[source,{...source,source_id:'other',vof:0,label:'Additional fire'}],strongest:source};
it('keeps all pending choices together and groups completed recipients behind a closed disclosure',()=>{
 const rows=Array.from({length:24},(_,i)=>({...exposure,id:`e${i}`,status:i<12?'RESOLVED':'PENDING',result:'PIN'})),before=structuredClone(rows);
 const html=combatRecipients({combat_resolutions:rows},rows[12],id=>id);
 expect(html.match(/data-combat-select=/g)).toHaveLength(24);expect(html).toContain('12 awaiting resolution');expect(html).toContain('Resolved (12)');
 expect(html.indexOf('data-combat-select="e12"')).toBeLessThan(html.indexOf('class="combat-resolved-group"'));expect(html).not.toContain('combat-resolved-group" open');expect(rows).toEqual(before);
});
it('keeps primary VOF visible and secondary sources collapsed without removing inspection buttons',()=>{
 const view={combat_order:'player-choice-v1',combat_resolutions:[exposure]},before=structuredClone(view),html=combatScreen(exposure,view,id=>id);
 expect(html).toContain('Primary fire');expect(html).toContain('<details class="combat-secondary-sources">');expect(html).toContain('Other fire sources (1)');expect(html).toContain('Additional fire');expect(html).toContain('data-combat-source="r4c1"');expect(html).toContain('combat-desk-actions');expect(view).toEqual(before);
});
