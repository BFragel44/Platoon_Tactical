// Player Aid 2 and update-kit countersheet 1, both sides (mirrored pairs).
export const SKILLS={
 GENERAL_INITIATIVE:{label:'General Initiative',cost:2,actions:['SKILL_GENERAL'],free:true},
 PARALYZED_ASSAULT:{label:'Paralyzed to Assault',cost:2,actions:['SKILL_PARALYZED_A']},
 PARALYZED_FIRE:{label:'Paralyzed to Fire',cost:1,actions:['SKILL_PARALYZED_F']},
 SPAWN_TEAM:{label:'Spawn Team',cost:1,actions:['SKILL_SPAWN_A','SKILL_SPAWN_F'],free:true},
 EXTRA_DRAW:{label:'Extra Draw',cost:1,actions:['SPOT','SEEK_COVER','SEEK_COVER_UPPER','CONCENTRATE','INFILTRATE','INFILTRATE_WITHIN','GRENADE','RIFLE_GRENADE','WP_ATTACK','RALLY','RECOVER','RECONSTITUTE','CALL_ARTILLERY','CALL_ARTILLERY_WP'],extra:true},
 AUTO_SPOT:{label:'Auto Spot',cost:1,actions:['SPOT'],icon:'spot'},
 AUTO_COVER:{label:'Auto Cover',cost:1,actions:['SEEK_COVER','SEEK_COVER_UPPER'],icon:'cover'},
 AUTO_CONCENTRATE:{label:'Auto Concentrate Fire',cost:1,actions:['CONCENTRATE'],icon:'spot'},
 AUTO_INFILTRATE:{label:'Auto Infiltrate',cost:1,actions:['INFILTRATE','INFILTRATE_WITHIN'],icon:'infiltrate'},
 AUTO_GRENADE:{label:'Auto Grenade',cost:1,actions:['GRENADE'],icon:'grenade'},
};
const counters=[['SPAWN_TEAM','AUTO_COVER'],['SPAWN_TEAM','AUTO_CONCENTRATE'],['SPAWN_TEAM','AUTO_GRENADE'],['GENERAL_INITIATIVE','EXTRA_DRAW'],['SPAWN_TEAM','AUTO_COVER'],['GENERAL_INITIATIVE','EXTRA_DRAW'],['GENERAL_INITIATIVE','EXTRA_DRAW'],['AUTO_INFILTRATE'],['AUTO_INFILTRATE','AUTO_GRENADE'],['PARALYZED_FIRE','AUTO_CONCENTRATE'],['PARALYZED_ASSAULT','AUTO_SPOT'],['PARALYZED_ASSAULT','AUTO_SPOT']];
export function buySkills(s,purchases,points){
 if(!Array.isArray(purchases))throw new Error('Skill purchases must be a list.');
 if(purchases.length>counters.length)throw new Error('Skill purchases exceed the printed counter mix.');
 const counts={};
 for(const p of purchases){
  const u=s.units[p.holder],skill=SKILLS[p.type];
  if(!skill||!u||u.faction!=='friendly'||u.removed||!u.steps.length||!['HQ','STAFF'].includes(u.kind)||u.command_role==='higher_hq')throw new Error('Assign a published skill to a surviving company HQ or staff.');
  if((counts[u.id]=(counts[u.id]??0)+1)>3)throw new Error('An HQ or staff can hold at most three skills.');
  points-=skill.cost;if(points<0)throw new Error('Not enough attempt experience for skills.');
 }
 // Match all purchases to physical counters, allowing either printed side.
 const assigned=[],used=new Set();
 function match(n){if(n===purchases.length)return true;
  for(let i=0;i<counters.length;i++)if(!used.has(i)&&counters[i].includes(purchases[n].type)){
   used.add(i);assigned[n]=i;if(match(n+1))return true;used.delete(i);
  }return false;
 }
 if(!match(0))throw new Error('Skill purchases exceed the printed counter mix.');
 s.skills=purchases.map((p,i)=>({...p,id:`skill_${s.attempt_number+1}_${assigned[i]+1}`,counter:assigned[i]+1,used:false}));
 return points;
}
export function skillOptions(s,u,type){
 return (s.skills??[]).filter(p=>!p.used&&SKILLS[p.type].actions.includes(type)).filter(p=>{
  const holder=s.units[p.holder];
  return holder&&!holder.removed&&holder.steps.length&&(holder.id===u.id||holder.kind==='HQ'&&holder.platoon!==null&&holder.platoon===u.platoon);
 }).map(p=>({...p,label:SKILLS[p.type].label}));
}
