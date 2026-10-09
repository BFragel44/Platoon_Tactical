import {cerisy} from './cerisy.js';
import {stGeorgesContent as content} from './stGeorgesContent.js';
const units=structuredClone(cerisy.units).map(u=>({...u,location:`r1c${u.platoon??(['HQ','STAFF','FO'].includes(u.kind)?2:4)}`}));
for(const attachment of content.attachments.filter(u=>u.kind==='HMG'))units.push({...structuredClone(attachment),faction:'friendly',platoon:null,location:'r1c5',vof:'A+',range:3,radios:[],tripod:true,fire_team_vof:'A'});
export const stGeorges={
 ...structuredClone(cerisy),id:content.id,name:content.name,version:1,units,
 readiness:{playable:true,stage:'standalone_validated',development_validated:true,accepted:'2026-10-07',missing:[]},
 assets:{...structuredClone(cerisy.assets),s12:{illum:2},...Object.fromEntries(Object.entries(cerisy.assets).map(([id,a])=>[id,{...a,...(['s11','s12','s21','s31'].includes(id)?{illum:2}:{})}]))},
 map:{...structuredClone(cerisy.map),...content.map},
 patrol_plan:{platoon:1,primary:'r4c3',route:['r2c1','r3c2','r4c3','r2c2'],cop:'r2c3',ccp:'r1c2',concentration:'r4c3'},
 objectives:{type:'patrol',primary:'r4c3',secondary:'r4c3',attack:'r2c3',ccp:'r1c2',clear_rows:[]},
 contact_rows:structuredClone(content.contact_rows),packages:structuredClone(content.packages),package_tables:structuredClone(content.package_tables),
 enemy_counters:cerisy.enemy_counters.filter(u=>!['SNIPER','SPOTTER'].includes(u.kind)).map(u=>{const counter=structuredClone(u);if(counter.assets)delete counter.assets.panzerfaust;return counter;}),
 rules:{...structuredClone(cerisy.rules),patrols:3,reattempts:0,handheldIllumination:8,tactics:content.enemy_tactics,enemyExperience:content.enemy_experience,required_enemy_kinds:['SQUAD','LMG','HMG','LEADER','MORTAR'],package_count:12,
  baselineCompanyId:'normandy_st_georges_standalone_company',rosterKey:'platoon-normandy-st-georges-standalone',friendly_event_tables:structuredClone(content.friendly_event_tables),enemy_event_tables:structuredClone(content.enemy_event_tables)},
 support_agencies:Object.fromEntries(Object.entries(content.support).map(([id,agency])=>[id,{...structuredClone(cerisy.support_agencies[id]),...structuredClone(agency)}])),
 briefing:'Patrol from Row 1 through four route points in order and the Row 4 objective, then return across the MLR. Each platoon carries out one ten-turn night patrol on the same map.',
 special_rules:['Combat patrols retain the offensive phase sequence. Non-patrolling units hold fixed positions, except for automatic retreat.','Visit all four route points in order, pass through the primary objective and finally cross from Row 2 to Row 1. Clearing and holding cards is not required for patrol success.','Artillery has four HE, one WP and six illumination missions; battalion mortars have three HE, one WP and four illumination missions; cannon has three HE and one WP. Illumination is immediate and expires at cleanup. The selected artillery concentration adds one caller draw until moved by successful fire.','Combat patrols use radios; field phones are not permitted. Colored smoke cannot signal at night. Eight handheld illumination devices are available.','Each platoon patrols once. Moon visibility is randomly selected from +2 through +5 for each patrol. General Initiative commands are halved, rounding down.'],
 mission_content:{source:content.source,standalone:true,patrols:3},
};
