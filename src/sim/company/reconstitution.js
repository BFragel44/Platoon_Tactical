// Third-edition §§6.5.2 and 12.6. Generic Assault Teams are Line in combat;
// every LAT is Green during the separate §3.9 preparation sequence.
export function combinedExperience(steps){
 const rank={Green:0,Line:1,Veteran:2};
 const sorted=steps.map(step=>rank[step.experience??'Green']).sort((a,b)=>b-a);
 if(sorted.length===1)return ['Green','Line','Veteran'][sorted[0]];
 if(sorted.length===2)return sorted[0]===2&&sorted[1]===2?'Veteran':sorted[0]===2||sorted[1]===1?'Line':'Green';
 if(sorted.length===3){
  if(sorted[0]===2&&sorted[1]===2&&sorted[2]>=1)return 'Veteran';
  return sorted[0]===2||sorted[1]>=1?'Line':'Green';
 }
 return sorted.filter(n=>n===2).length>=3?'Veteran':sorted.filter(n=>n===2).length>=2||sorted.filter(n=>n>=1).length>=3?'Line':'Green';
}
export function reconstitutionFirepower(profile,donors){
 const rating=profile.vof_by_steps?.[donors.length]??profile.vof;
 if(rating==='S')return true;
 // Point-blank A-rated generic Assault Teams do not possess machine guns.
 return ['A','A/S'].includes(rating)&&donors.some(u=>u.cohesion==='F'&&(u.fire_team_vof??u.vof)==='A'&&u.range>0);
}
export function reconstitutionDonors(profile,teams){
 const rating=profile.vof_by_steps?.[Math.min(teams.length,profile.steps)]??profile.vof;
 const weapon=['A','A/S'].includes(rating)?teams.find(u=>u.cohesion==='F'&&(u.fire_team_vof??u.vof)==='A'&&u.range>0):null;
 return (weapon?[weapon,...teams.filter(u=>u!==weapon)]:teams).slice(0,profile.steps);
}
export function transferReconstitutionLoads(s,unit,donors){
 const loads=donors.map(u=>structuredClone(u)),weaponStock=structuredClone(unit.initial_resources?.ammo??{});
 for(const donor of donors){
  donor.radios=[];donor.assets={};donor.ammo={};
  donor.initial_resources={radios:[],assets:{},ammo:{}};
 }
 const restored={radios:[],assets:{},ammo:{}};
 unit.radios=loads.flatMap(u=>u.radios??[]);unit.assets={};unit.ammo={};
 for(const donor of loads){
  const stock=donor.initial_resources??{radios:donor.radios??[],assets:donor.assets??{},ammo:donor.ammo??{}};
  restored.radios.push(...stock.radios);
  for(const key of ['assets','ammo'])for(const [item,n]of Object.entries(stock[key]??{}))restored[key][item]=(restored[key][item]??0)+n;
  for(const [key,n]of Object.entries(donor.assets??{}))unit.assets[key]=(unit.assets[key]??0)+n;
  for(const [key,n]of Object.entries(donor.ammo??{}))unit.ammo[key]=(unit.ammo[key]??0)+n;
  for(const casualty of s.casualties.filter(c=>c.carrier===donor.id))casualty.carrier=unit.id;
 }
 // A weapon counter retains its printed ammunition allocation; inherited cargo
 // replaces the obsolete formation's equipment load and follows its new carrier.
 for(const [key,n]of Object.entries(weaponStock))restored.ammo[key]=Math.max(restored.ammo[key]??0,n);
 unit.initial_resources=restored;
 unit.out_of_ammo=unit.ammo.MG===0&&['A','A/S'].includes(unit.vof);
}
export function reconstitutionLoads(s,unit,donors){
 transferReconstitutionLoads(s,unit,donors);
 unit.experience=combinedExperience(donors.map(u=>({experience:u.cohesion==='A'?'Line':'Green'})));
 unit.original_experience=unit.experience;
 for(const step of unit.steps)step.experience=unit.experience;
}
