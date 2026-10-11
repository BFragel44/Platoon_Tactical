import {expendAmmunition} from './ammunition.js';
import {live} from './core.js';
import {atProfile} from './vehicleCombat.js';
// AT entries are projections of infantry carriers, never independent counters/ammo.
export function synchronizeVireATUnits(s){
 if(!(s.mission_rules?.vire||s.mission_rules?.tinchebray)||!s.vire_runtime)return;
 const rt=s.vire_runtime;
 for(const u of Object.values(s.units)){
  const specs=[];
  if(u.kind==='AT')specs.push(['BAZOOKA','ammo','RKT']);
  if(['PAK40','FLAK88','PANZERSCHRECK','INFANTRY_GUN75'].includes(u.kind))specs.push([u.kind,'ammo',u.ammo_key??(u.kind==='PANZERSCHRECK'?'RKT':'GUN')]);
  for(const [key,profile]of [['panzerfaust','PANZERFAUST'],['rifle_grenade','RIFLE_GRENADE']])if(u.assets?.[key]||u.initial_resources?.assets?.[key])specs.push([profile,'assets',key]);
  for(const [profile,field,key]of specs){
   const id=`at_${u.id}_${profile.toLowerCase()}`,old=rt.vehicles[id];
   rt.vehicles[id]={...(old??{id,profile,crew:[],passengers:[],cargo:[],transported_casualties:[],applied_results:[],activated:false,moved_fired:false,saved:0}),source_unit:u.id,source_field:field,source_key:key,
    name:`${u.name} · ${profile}`,faction:u.faction,location:u.location,area:u.cover,cover:u.cover,experience:u.experience,pinned:u.pinned,
    ammo:u[field]?.[key]??0,status:live(u)&&u.cohesion==='GOOD'?'ACTIVE':'UNAVAILABLE'};
  }
 }
 for(const v of Object.values(rt.vehicles).filter(v=>v.source_unit)){
  if(!s.units[v.source_unit]||!live(s.units[v.source_unit])||s.units[v.source_unit].cohesion!=='GOOD'){v.status='UNAVAILABLE';v.activated=false;}
 }
}
export function commitVireATAmmunition(s,v){
 if(!v.source_unit)return;
 const u=s.units[v.source_unit];if(!u||!u[v.source_field])throw new Error('AT ammunition carrier unavailable.');
 const spent=(u[v.source_field][v.source_key]??0)-v.ammo;
 if(v.source_field==='ammo'){if(spent>0&&!expendAmmunition(s,u,v.source_key,spent,'AT fire'))throw new Error('AT ammunition changed before expenditure.');}
 else u[v.source_field][v.source_key]=v.ammo;
}
export function friendlyVireVehiclesAt(s,location){return Object.values(s.vire_runtime?.vehicles??{}).filter(v=>v.faction==='friendly'&&v.status==='ACTIVE'&&atProfile(v.profile).target_type==='V'&&v.location===location);}
