import {it,expect} from 'vitest';
import {atProfile,groundVehicleResult,calculateATShot,startVehiclePhase,vehiclePhaseOptions,beginVehicleAction,advanceVehicleAction,finishVehicleAction,recordVehicleReaction} from '../src/sim/company/vehicleCombat.js';
it('reproduces the printed Sherman/88mm worked example',()=>{
 const shot=calculateATShot({firer:'FLAK88',target:'M4_SHERMAN75',range:2,movingTarget:true,card:1});
 expect(shot).toMatchObject({modifier:-2,sum:-1,result:'BREWED_UP',ambushed:false,quick_shot:false});
});
it.each([[-10,'BREWED_UP'],[-1,'BREWED_UP'],[0,'KNOCKED_OUT'],[1,'KNOCKED_OUT'],[2,'RETREAT'],[3,'RETREAT'],[4,'PINNED'],[5,'PINNED'],[6,'MISSED'],[20,'MISSED']])('resolves ground AT boundary %s',(sum,result)=>expect(groundVehicleResult(sum)).toBe(result));
it('applies ambush, pin and grenade draws only in eligible circumstances',()=>{
 const args={firer:'PANZERSCHRECK',target:'M4_SHERMAN75',range:1,card:3,ambushSusceptible:true};
 expect(calculateATShot(args)).toMatchObject({modifier:-5,grenade_draws:3,ambushed:true});
 expect(calculateATShot({...args,targetPinned:true})).toMatchObject({modifier:-7,grenade_draws:4});
 expect(calculateATShot({...args,supportedByInfantry:true,targetPinned:true})).toMatchObject({modifier:-3,grenade_draws:2,ambushed:false});
 expect(calculateATShot({...args,firer:'RIFLE_GRENADE'}).ambushed).toBe(false);
 expect(calculateATShot({...args,firer:'M5_LIGHT37'}).ambushed).toBe(false);
});
it('rejects unsupported profiles, range, target type and movement rather than using infantry NCM',()=>{
 expect(()=>atProfile('M4_76')).toThrow(/Unsupported/);
 const args={firer:'PANZERFAUST',target:'M4_SHERMAN75',range:0,card:4};
 expect(()=>calculateATShot({...args,range:1})).toThrow(/range/);
 expect(()=>calculateATShot({...args,target:'PAK40'})).toThrow(/ground vehicle/);
 expect(()=>calculateATShot({...args,moved:true})).toThrow(/move/);
 expect(calculateATShot({...args,firer:'M4_SHERMAN75',moved:true,terrain:2,card:3})).toMatchObject({modifier:1,sum:4,quick_shot:true});
});
const units=[{id:'tank',profile:'M4_SHERMAN75',faction:'friendly',activated:true},{id:'enemyTank',profile:'M5_LIGHT37',faction:'enemy',activated:true},{id:'jeep',profile:'JEEP',faction:'friendly',activated:true},{id:'gun',profile:'PAK40',faction:'enemy',activated:true},{id:'rocket',profile:'PANZERSCHRECK',faction:'enemy',activated:false}];
function complete(s,id){s=beginVehicleAction(s,id);while(s.pending.stage!=='COMPLETE')s=advanceVehicleAction(s,s.pending.stage);return finishVehicleAction(s);}
it('finishes both sides of a group before proceeding and restarts offensive priority per group',()=>{
 let s=startVehiclePhase(units);expect(vehiclePhaseOptions(s)).toEqual(['tank']);
 expect(()=>beginVehicleAction(s,'jeep')).toThrow();
 s=complete(s,'tank');expect(vehiclePhaseOptions(s)).toEqual(['enemyTank']);
 s=complete(s,'enemyTank');expect(vehiclePhaseOptions(s)).toEqual(['jeep']);
 s=complete(s,'jeep');expect(vehiclePhaseOptions(s)).toEqual(['gun']);
 s=complete(s,'gun');expect(vehiclePhaseOptions(s)).toEqual([]);
 expect(()=>beginVehicleAction(s,'gun')).toThrow();
});
it('persists a pending reaction window and allows unactivated opposing AT reactions',()=>{
 const original=startVehiclePhase(units);let s=beginVehicleAction(original,'tank');
 s=advanceVehicleAction(s,'VOF_BEFORE');s=advanceVehicleAction(s,'ACTION');
 expect(vehiclePhaseOptions(s)).toEqual([]);expect(()=>finishVehicleAction(s)).toThrow();
 const loaded=JSON.parse(JSON.stringify(s));expect(loaded).toEqual(s);
 const fired=recordVehicleReaction(loaded,'rocket');expect(fired.entries.find(u=>u.id==='rocket').moved_fired).toBe(true);
 expect(()=>recordVehicleReaction(fired,'rocket')).toThrow();
 expect(()=>recordVehicleReaction(loaded,'rocket',{quickShot:true})).toThrow(/Quick Shot/);
 const quick=recordVehicleReaction(loaded,'gun',{quickShot:true});expect(quick.entries.find(u=>u.id==='gun').moved_fired).toBe(false);
 expect(original.entries.every(u=>!u.moved_fired)).toBe(true);
 expect(()=>recordVehicleReaction(loaded,'jeep')).toThrow();
});
it('does not permit reactions to AT infantry actions',()=>{
 let s=startVehiclePhase(units.filter(u=>u.profile==='PAK40'||u.profile==='PANZERSCHRECK'));
 s=beginVehicleAction(s,'gun');expect(s.pending.stage).toBe('ACTION');s=advanceVehicleAction(s,'ACTION');expect(s.pending.stage).toBe('COMPLETE');
 expect(()=>recordVehicleReaction(s,'rocket')).toThrow();
});
