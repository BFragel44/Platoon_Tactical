import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
import {createTinchebrayDevelopmentMission} from '../src/sim/company/tinchebrayMission.js';
import {tinchebrayCheckpoint,TINCHEBRAY_SAVE_KEY} from '../src/ui/tinchebrayRecovery.js';
import {advancePhase,prepareReattempt} from '../src/sim/company/engine.js';
import {cards} from '../src/sim/company/core.js';
import {supportRequest} from '../src/sim/company/missionFeatures.js';
import {importVireAdapterReplay} from '../src/sim/company/vireIntegration.js';
import {placePackage} from '../src/sim/company/missionContacts.js';
import {tinchebray} from '../src/scenarios/tinchebray.js';
import {synchronizeVireATUnits} from '../src/sim/company/vireUnits.js';
const fresh=()=>createTinchebrayDevelopmentMission('m7-browser-expanded',{}, {},{mission_instance_id:'browser-expanded'});
const seal=s=>{delete s.vire_runtime.initial_state;s.vire_runtime.initial_state=structuredClone(s);return s;};
const bundle=s=>{const cp=tinchebrayCheckpoint(s);return {schema:1,latest:cp,turnStart:cp};};
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,channel:'chrome'}),context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));const check=(v,m)=>{if(!v)throw Error(m);};
mkdirSync('tmp/tinchebray-browser',{recursive:true});
try{
 await page.goto((process.env.QA_URL||'http://localhost:5173')+'/?tinchebrayDev=1');await page.locator('#vire-controls-open').waitFor();
 check(await page.locator('[data-vehicle]').count()===4,'Expected four M10 counters');
 await page.locator('#vire-controls-open').click();check((await page.locator('#vire-controls').innerText()).includes('M10_TD76'),'M10 profile missing');
 await page.locator('#vire-setup').click();check(await page.locator('[name^="vehicle-position-"]').count()===4,'Four deployment controls required');
 check((await page.locator('[name="objective-primary"] option').allTextContents()).every(t=>t.startsWith('6.')),'Primary must be Row 6');
 check((await page.locator('[name="objective-secondary"] option').allTextContents()).every(t=>t.startsWith('5.')),'Secondary must be Row 5');
 check((await page.locator('[name="objective-attack"] option').allTextContents()).every(t=>t.startsWith('4.')),'Attack must be Row 4');
 await page.screenshot({path:'tmp/tinchebray-browser/setup.png'});
 await page.locator('[name="jeep-use"]').check();await page.locator('[name="jeep-arty"]').check();await page.locator('[name="jeep-passengers"]').selectOption('artyfo');
 await page.locator('[name="start-mission"]').click();await page.locator('#mission-setup-form').waitFor({state:'hidden'});await page.reload();await page.locator('#vire-controls-open').waitFor();
 console.log(await page.evaluate(()=>({url:location.href,keys:Object.keys(localStorage),warnings:[...document.querySelectorAll('.storage-warning')].map(e=>e.textContent)}))); check(await page.evaluate(()=>JSON.parse(localStorage.getItem('platoon-tinchebray-integration'))?.latest.replay.scenario==='normandy_7'),'M7 recovery missing');
 check(await page.evaluate(()=>localStorage.getItem('platoon-vire-integration')===null),'M6 recovery must remain untouched');
 check(await page.locator('[data-vehicle="company_jeep"]').count()===1,'Mounted Jeep missing after setup and reload');
 let pending=fresh();pending.turn=2;pending.phase='FRIENDLY_EVENTS';const hq=Object.values(cards).find(c=>c.hq&&c.random[8]===4&&c.id!==51);pending.deck.order=Array(100).fill(hq.id);seal(pending);pending=advancePhase(pending).state;
 await page.evaluate(({key,value})=>localStorage.setItem(key,JSON.stringify(value)),{key:TINCHEBRAY_SAVE_KEY,value:bundle(pending)});await page.reload();await page.locator('#vire-controls-open').click();
 check(await page.locator('[data-vire-entry]').count()===5,'Five M5 entry choices required');await page.locator('[data-vire-support]').click();await page.reload();await page.locator('#vire-controls-open').click();
 check((await page.locator('#vire-controls li').allTextContents()).filter(t=>t.includes('M5_LIGHT37')).length===5,'M5 support lost after reload');await page.locator('#vire-controls-close').click();
 let defeat=fresh();defeat.status='DEFEAT';defeat.turn=10;seal(defeat);
 for(const attempt of [1,2]){
  await page.evaluate(({key,value})=>localStorage.setItem(key,JSON.stringify(value)),{key:TINCHEBRAY_SAVE_KEY,value:bundle(defeat)});await page.reload();await page.locator('#result-reattempt').click();
  check(await page.locator('[name^="vehicle-position-"]').count()===4,'Four surviving M10 placements required');check((await page.locator('#reattempt-title').innerText()).includes(`attempt ${attempt+1}`),'Wrong attempt title');
  await page.locator('#reattempt-form button[type="submit"]').click();await page.locator('#reattempt-form').waitFor({state:'hidden'});await page.reload();await page.locator('#vire-controls-open').waitFor();
  check(await page.evaluate(()=>JSON.parse(localStorage.getItem('platoon-tinchebray-integration')).latest.attempt)===attempt+1,'Reattempt not persisted');
  if(attempt===1){const positions=Object.fromEntries(Object.values(defeat.units).filter(u=>u.faction==='friendly'&&!u.removed&&u.steps.length).map(u=>[u.id,u.location]));const vehicle_positions=Object.fromEntries(Object.values(defeat.vire_runtime.vehicles).filter(v=>v.profile==='M10_TD76').map(v=>[v.id,v.location]));defeat=prepareReattempt(defeat,{positions,vehicle_positions}).state;defeat.status='DEFEAT';defeat.turn=10;defeat.vire_runtime.operations=[];defeat.vire_runtime.applied=[];seal(defeat);}
 }
 const combat=fresh();for(const l of Object.values(combat.locations))Object.assign(l,{borders:Object.fromEntries(['N','S','E','W','NE','NW','SE','SW'].map(k=>[k,'white'])),elevation:0,protection:0,burst:0,smoke:false,known:true,trafficability:'Unmarked'});
 combat.units.s11.location='r1c1';check(placePackage(combat,combat.contacts.pc_r1c1,tinchebray.packages[8].alternatives[1]),'QA gun placement failed');combat.units.s11.location='r0c1';combat.units.hq1.location='r1c2';const gun=Object.values(combat.units).find(u=>u.kind==='PAK40');gun.location='r2c1';gun.cover=null;combat.vire_runtime.vehicles.m10_hq.location='r1c1';combat.vire_runtime.vehicles.m10_hq.activated=true;synchronizeVireATUnits(combat);combat.phase='AT_COMBAT';combat.impulse=null;combat.deck.order=Array(200).fill(Object.values(cards).find(c=>Number(c.at)===9&&c.id!==51).id);seal(combat);
 await page.evaluate(({key,value})=>localStorage.setItem(key,JSON.stringify(value)),{key:TINCHEBRAY_SAVE_KEY,value:bundle(combat)});await page.reload();await page.locator('[data-vehicle="m10_hq"]').click();await page.locator('#vire-path').fill('r1c2');await page.locator('[data-vire-op="PREPARE_VEHICLE_MOVE"]').click();for(let i=0;i<3;i++)await page.locator('[data-vire-op="STEP_VEHICLE_MOVE"]').click();
 await page.reload();await page.locator('#vire-controls-open').click();check((await page.locator('#vire-controls').innerText()).includes('Movement stage: REACTION'),'Pending M10 move recovery missing');await page.locator('[data-vire-op="AUTO_ENEMY_REACTION"]').click();check(!(await page.locator('#vire-feedback').innerText()),'M7 enemy reaction failed');
 for(let i=0;i<8;i++){const rt=importVireAdapterReplay(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).latest.replay,TINCHEBRAY_SAVE_KEY)).vire_runtime;if(!rt.quick&&!rt.reaction?.eligible.length)break;await page.locator('[data-vire-op="AUTO_ENEMY_REACTION"]').click();check(!(await page.locator('#vire-feedback').innerText()),'M7 follow-up failed');}
 if(await page.locator('[data-vire-op="STEP_VEHICLE_MOVE"]').count())await page.locator('[data-vire-op="STEP_VEHICLE_MOVE"]').click();check(!(await page.locator('#vire-feedback').innerText()),'M10 move completion failed');check(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).latest.replay.operations.some(op=>op.type==='AUTO_ENEMY_REACTION'),TINCHEBRAY_SAVE_KEY),'Reaction not persisted');await page.screenshot({path:'tmp/tinchebray-browser/live-combat.png'});
 const fire=fresh();fire.units.artyfo.location='r1c2';fire.phase='GENERAL_INITIATIVE';fire.impulse={id:'qa-general',hq:'general',commands:2,spent:0};fire.deck.order=Array(50).fill(Object.values(cards).find(c=>c.multi&&!c.short&&c.id!==51).id);supportRequest(fire,fire.units.artyfo,'artillery','HE','r1c2');seal(fire);
 await page.evaluate(({key,value})=>localStorage.setItem(key,JSON.stringify(value)),{key:TINCHEBRAY_SAVE_KEY,value:bundle(fire)});await page.reload();await page.locator('#battalion-support').waitFor();await page.locator('#battalion-support').click();await page.locator('#battalion-support').waitFor({state:'hidden'});await page.reload();
 const support=importVireAdapterReplay(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).latest.replay,TINCHEBRAY_SAVE_KEY));check(support.support.length===3&&!support.pending_support,'Battalion choice recovery failed');check(support.deck.draws===fire.deck.draws&&support.impulse.commands===fire.impulse.commands,'Battalion choice charged again');
 for(const observer of ['artyfo','mtrfo']){await page.locator('#unit').selectOption(observer);const choices=await page.locator('#action option').allTextContents();check(choices.some(t=>t.includes('cannon HE'))&&choices.some(t=>t.includes('mortar WP'))&&choices.some(t=>t.includes('time-on-target')),observer+' support orders missing');}
 await page.setViewportSize({width:850,height:900});await page.keyboard.press('Tab');await page.screenshot({path:'tmp/tinchebray-browser/narrow.png'});
 check(errors.length===0,errors.join('; '));writeFileSync('tmp/tinchebray-browser/results.json',JSON.stringify({passed:true,checks:['four M10s','objective rows','setup start','mounted observer Jeep and reload','separate storage','five M5 entry and reload','both reattempt dialogs and reload','live M10 movement, pending reaction and reload','enemy AT reaction','pending battalion support and reload','both observers and all support agencies','narrow viewport','keyboard tab'],errors},null,2));
 console.log('Tinchebray initial browser checks passed.');
}finally{await browser.close();}
