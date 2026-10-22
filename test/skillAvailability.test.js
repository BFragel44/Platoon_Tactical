import {it,expect} from 'vitest';
import {availableSkillTypes,skillDraftAvailability,buySkills,SKILLS} from '../src/sim/company/skills.js';
it('filters every patrol draft slot against retained counters and the other selected slots',()=>{
 const retained=[{counter:4,type:'GENERAL_INITIATIVE',used:true},{counter:6,type:'GENERAL_INITIATIVE'}];
 const rows=skillDraftAvailability(retained,['GENERAL_INITIATIVE','','GENERAL_INITIATIVE']);
 expect(rows.map(r=>r.type)).toEqual(['GENERAL_INITIATIVE','','']);
 expect(rows[0].available).toContain('GENERAL_INITIATIVE');
 expect(rows[1].available).not.toContain('GENERAL_INITIATIVE');
 expect(rows[1].available).not.toContain('EXTRA_DRAW');
 const freed=skillDraftAvailability(retained,['','']);
 expect(freed[1].available).toContain('GENERAL_INITIATIVE');
});
it('removes exhausted types including shared reverse sides while allowing flexible assignments',()=>{
 expect(availableSkillTypes([],Array.from({length:2},()=>({type:'AUTO_GRENADE'})))).not.toContain('AUTO_GRENADE');
 expect(availableSkillTypes([{counter:3,type:'SPAWN_TEAM'},{counter:9,type:'AUTO_INFILTRATE'}])).not.toContain('AUTO_GRENADE');
 expect(availableSkillTypes([],[{type:'AUTO_GRENADE'},{type:'AUTO_INFILTRATE'}])).toContain('AUTO_INFILTRATE');
});
it('uses the same counter availability as actual purchasing',()=>{
 const purchases=[{type:'AUTO_GRENADE',holder:'hq'},{type:'AUTO_GRENADE',holder:'hq'}],available=availableSkillTypes([],purchases);
 for(const type of Object.keys(SKILLS)){
  const s={units:{hq:{id:'hq',kind:'HQ',faction:'friendly',steps:[{}]}},attempt_number:1};
  if(available.includes(type))expect(()=>buySkills(s,[...purchases,{type,holder:'hq'}],100)).not.toThrow();
  else expect(()=>buySkills(s,[...purchases,{type,holder:'hq'}],100)).toThrow('counter mix');
 }
});
