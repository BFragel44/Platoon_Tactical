import {cerisy} from './cerisy.js';
import {stGermainContent as content} from './stGermainContent.js';
import {validateNormandyContent} from '../sim/company/normandyContent.js';
// Foundation validation is local to M5; accepted simulation/version behavior is unchanged.
export function validateStGermainContent(definition){
 validateNormandyContent(definition);
 for(const [number,entry] of Object.entries(definition.packages))for(const variant of entry.alternatives??[entry]){
  for(const spec of [...(variant.units??[]),...(variant.optional?.units??[])]){
   if(spec.steps!==undefined&&(!Number.isInteger(spec.steps)||spec.steps<1||!definition.enemy_counters.some(c=>c.kind===spec.kind&&c.steps>=spec.steps&&(c.steps===spec.steps||c.vof_by_steps?.[spec.steps]))))throw new Error(`Unsupported M5 package ${number} step profile.`);
  }
  if(variant.placement_draw){
   const {sides,...groups}=variant.placement_draw,numbers=Object.values(groups).flat();
   if(!Number.isInteger(sides)||sides<1||numbers.length!==sides||new Set(numbers).size!==sides||numbers.some(n=>!Number.isInteger(n)||n<1||n>sides))throw new Error(`Invalid M5 package ${number} placement draw.`);
  }
 }
 return definition;
}
const units=structuredClone(cerisy.units).map(u=>({...u,location:`r1c${u.platoon??(['HQ','STAFF','FO'].includes(u.kind)?2:4)}`}));
for(const attachment of content.attachments.filter(u=>u.kind==='HMG'))units.push({...structuredClone(attachment),faction:'friendly',platoon:null,location:'r1c5',vof:'A+',range:3,radios:[],tripod:true,fire_team_vof:'A'});
export const stGermain={
 ...structuredClone(cerisy),id:content.id,name:content.name,version:content.version,units,
 readiness:{playable:false,stage:'development playtest',development_validated:true,missing:['explicit-phase user acceptance']},
 assets:{...structuredClone(cerisy.assets),s12:{illum:2},...Object.fromEntries(Object.entries(cerisy.assets).map(([id,a])=>[id,{...a,...(['s11','s12','s21','s31'].includes(id)?{illum:2}:{})}]))},
 map:{...structuredClone(cerisy.map),...content.map},
 patrol_plan:{platoon:1,primary:'r4c3',route:['r2c1','r3c2','r4c3','r2c2'],cop:'r2c3',ccp:'r1c2',concentration:'r4c3'},
 objectives:{type:'patrol',primary:'r4c3',secondary:'r4c3',attack:'r2c3',ccp:'r1c2',clear_rows:[]},
 contact_rows:structuredClone(content.contact_rows),packages:structuredClone(content.packages),package_tables:structuredClone(content.package_tables),
 enemy_counters:cerisy.enemy_counters.filter(u=>!['SNIPER','SPOTTER'].includes(u.kind)).map(u=>{const counter=structuredClone(u);if(counter.assets)delete counter.assets.panzerfaust;if(counter.breakdown==='fallschirmjager_as')counter.last_step_vof='A/S';if(counter.breakdown==='german_mortar_section')counter.fire_team_vof='A/S';return counter;}),
 rules:{...structuredClone(cerisy.rules),patrols:3,reattempts:0,handheldIllumination:8,tactics:content.enemy_tactics,enemyExperience:content.enemy_experience,cover_values:{Bunker:5,'Deep Bunker':5},required_enemy_kinds:['SQUAD','LMG','HMG','LEADER','MORTAR'],package_count:12,
  baselineCompanyId:'normandy_st_germain_standalone_company',rosterKey:'platoon-normandy-st-germain-standalone',friendly_event_tables:structuredClone(content.friendly_event_tables),enemy_event_tables:structuredClone(content.enemy_event_tables)},
 support_agencies:Object.fromEntries(Object.entries(content.support).map(([id,agency])=>[id,{...structuredClone(cerisy.support_agencies[id]),...structuredClone(agency)}])),
 briefing:'Patrol from Row 1 through four route points in order and the Row 4 objective, then return across the MLR. Each platoon carries out one ten-turn night patrol on the same map.',
 special_rules:['Mission 5 uses a fresh six-column battlefield, retained between its three patrols. Hill 192 terrain is not imported.','Command Post contacts place a two-step Fallschirmjäger squad and required leader together in a Deep Bunker: no initial fire, spotted, R#5 1–3 point blank and 4–5 Close.','Combat patrols retain the offensive phase sequence. Non-patrolling units hold fixed positions, except for automatic retreat.','Visit all four route points in order, pass through the primary objective and finally cross from Row 2 to Row 1. Clearing and holding cards is not required for patrol success.','Artillery has four HE, one WP and six illumination missions; battalion mortars have three HE, one WP and four illumination missions; cannon has three HE and one WP. Illumination is immediate and expires at cleanup. The selected artillery concentration adds one caller draw until moved by successful fire.','Combat patrols use radios; field phones are not permitted. Colored smoke cannot signal at night. Eight handheld illumination devices are available.','Each platoon patrols once. Moon visibility is randomly selected from +2 through +5 for each patrol. General Initiative commands are halved, rounding down.'],
 mission_content:{source:content.source,standalone:true,patrols:3,battlefield_carryover:false},
};
validateStGermainContent(stGermain);
