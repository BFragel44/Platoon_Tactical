// Player Aid 2 and update-kit countersheet 1, both sides (mirrored pairs).
export const SKILLS={
 GENERAL_INITIATIVE:{label:'General Initiative',cost:2,actions:['SKILL_GENERAL'],free:true},
 PARALYZED_ASSAULT:{label:'Paralyzed to Assault',cost:2,actions:['SKILL_PARALYZED_A']},
 PARALYZED_FIRE:{label:'Paralyzed to Fire',cost:1,actions:['SKILL_PARALYZED_F']},
 SPAWN_TEAM:{label:'Spawn Team',cost:1,actions:['SKILL_SPAWN_A','SKILL_SPAWN_F'],free:true},
 EXTRA_DRAW:{label:'Extra Draw',cost:1,actions:['SKILL_EXTRA_AUTOMATIC','SPOT','SEEK_COVER','SEEK_COVER_UPPER','CONCENTRATE','INFILTRATE','INFILTRATE_WITHIN','GRENADE','RIFLE_GRENADE','WP_ATTACK','RALLY','RECOVER','RECONSTITUTE','CALL_ARTILLERY','CALL_ARTILLERY_WP'],extra:true},
 AUTO_SPOT:{label:'Auto Spot',cost:1,actions:['SPOT'],icon:'spot'},
 AUTO_COVER:{label:'Auto Cover',cost:1,actions:['SEEK_COVER','SEEK_COVER_UPPER'],icon:'cover'},
 AUTO_CONCENTRATE:{label:'Auto Concentrate Fire',cost:1,actions:['CONCENTRATE'],icon:'spot'},
 AUTO_INFILTRATE:{label:'Auto Infiltrate',cost:1,actions:['INFILTRATE','INFILTRATE_WITHIN'],icon:'infiltrate'},
 AUTO_GRENADE:{label:'Auto Grenade',cost:1,actions:['GRENADE','SKILL_GRENADE_RETURN'],icon:'grenade'},
};
const counters=[['SPAWN_TEAM','AUTO_COVER'],['SPAWN_TEAM','AUTO_CONCENTRATE'],['SPAWN_TEAM','AUTO_GRENADE'],['GENERAL_INITIATIVE','EXTRA_DRAW'],['SPAWN_TEAM','AUTO_COVER'],['GENERAL_INITIATIVE','EXTRA_DRAW'],['GENERAL_INITIATIVE','EXTRA_DRAW'],['AUTO_INFILTRATE'],['AUTO_INFILTRATE','AUTO_GRENADE'],['PARALYZED_FIRE','AUTO_CONCENTRATE'],['PARALYZED_ASSAULT','AUTO_SPOT'],['PARALYZED_ASSAULT','AUTO_SPOT']];
function matchCounters(existing,purchases){
 const assigned=[],used=new Set(existing.map(p=>p.counter-1));
 function match(n){if(n===purchases.length)return true;
  for(let i=0;i<counters.length;i++)if(!used.has(i)&&counters[i].includes(purchases[n].type)){
   used.add(i);assigned[n]=i;if(match(n+1))return true;used.delete(i);
  }return false;
 }
 return match(0)?assigned:null;
}
export function availableSkillTypes(existing=[],purchases=[]){
 return Object.keys(SKILLS).filter(type=>matchCounters(existing,[...purchases,{type}])!==null);
}
export function skillDraftAvailability(existing,types){
 const accepted=[];
 const selected=types.map(type=>{
  if(!type||!availableSkillTypes(existing,accepted).includes(type))return '';
  accepted.push({type});return type;
 });
 return selected.map((type,index)=>({type,available:availableSkillTypes(existing,selected.flatMap((other,i)=>other&&i!==index?[{type:other}]:[]))}));
}
export function buySkills(s,purchases,points,{retain=false,allowReserve=false}={}){
 const existing=retain?structuredClone(s.skills??[]):[];
 if(!Array.isArray(purchases))throw new Error('Skill purchases must be a list.');
 if(purchases.length+existing.length>counters.length)throw new Error('Skill purchases exceed the printed counter mix.');
 const counts={};for(const p of existing)counts[p.holder]=(counts[p.holder]??0)+1;
 for(const p of purchases){
  const u=s.units[p.holder],skill=SKILLS[p.type];
  if(!skill||!u||u.faction!=='friendly'||(u.removed&&!(allowReserve&&u.removed==='RESERVE'))||!u.steps.length||!['HQ','STAFF'].includes(u.kind)||u.command_role==='higher_hq')throw new Error('Assign a published skill to a surviving company HQ or staff.');
  if((counts[u.id]=(counts[u.id]??0)+1)>3)throw new Error('An HQ or staff can hold at most three skills.');
  points-=skill.cost;if(points<0)throw new Error('Not enough attempt experience for skills.');
 }
 // Match all purchases to physical counters, allowing either printed side.
 const assigned=matchCounters(existing,purchases);
 if(!assigned)throw new Error('Skill purchases exceed the printed counter mix.');
 s.skills=[...existing,...purchases.map((p,i)=>({...p,id:`skill_${s.attempt_number+1}_${assigned[i]+1}`,counter:assigned[i]+1,used:false}))];s.automatic_skills={};
 return points;
}
export function skillOptions(s,u,type){
 return (s.skills??[]).filter(p=>!p.used&&SKILLS[p.type].actions.includes(type)&&!Object.entries(s.automatic_skills??{}).some(([id,skill])=>skill===p.id&&id!==u.id)).filter(p=>{
  const holder=s.units[p.holder];
  return holder&&!holder.removed&&holder.steps.length&&(holder.id===u.id||holder.kind==='HQ'&&holder.platoon!==null&&holder.platoon===u.platoon);
 }).map(p=>({...p,label:SKILLS[p.type].label}));
}
