// Third-edition §9.1. Values are positive penalties/reductions, never VOFs.
// These pure helpers are a foundation for the patrol engine; daylight callers
// retain their current behavior until that engine explicitly supplies visibility.
export function visibilityAt(visibility = {}, reductions = []) {
 const light=visibility.light??0,weather=visibility.weather??0;
 if(!Number.isInteger(light)||light<0||!Number.isInteger(weather)||weather<0||reductions.some(n=>!Number.isInteger(n)||n<0))throw new Error('Invalid visibility or illumination value.');
 const reduction=Math.max(0,...reductions),effectiveLight=Math.max(0,light-reduction);
 return {light,weather,reduction,effective_light:effectiveLight,modifier:effectiveLight+weather,
  limited:light+weather>=2,illuminated:reduction>0&&weather<2};
}
export function visibilityLosLimit(visibility, targetReductions = [], normalLimit = 3) {
 const target=visibilityAt(visibility,targetReductions);
 return target.limited&&!target.illuminated?Math.min(1,normalLimit):normalLimit;
}
export function visibilityCommandLimits(visibility = {},experience='Line') {
 const limited=visibilityAt(visibility).limited;
 const saved=(limited?{Green:2,Line:4,Veteran:6}:{Green:3,Line:6,Veteran:9})[experience];
 if(saved===undefined)throw new Error('Unknown command experience.');
 return {spend:limited?4:6,saved};
}
export function visibilityFireModifier(visibility, reductions, kind) {
 // §9.1 excludes grenades, off-map fire, mines, booby traps and air strikes.
 const affected=['basic','sniper','on_map_indirect'].includes(kind);
 if(!affected&&!['grenade','off_map','mine','claymore','booby_trap','air_strike'].includes(kind))throw new Error('Unknown fire effect for visibility.');
 return affected?visibilityAt(visibility,reductions).modifier:0;
}
export function illuminationReductionsAt(markers,target,locations) {
 const destination=locations[target];
 if(!destination)throw new Error('Unknown illumination target.');
 const reductions=[];
 for(const marker of markers){
  const origin=locations[marker.location];
  if(!origin||!Number.isInteger(marker.center)||marker.center<0||marker.adjacent!==undefined&&(!Number.isInteger(marker.adjacent)||marker.adjacent<0))throw new Error('Invalid illumination marker.');
  const distance=Math.max(Math.abs(origin.row-destination.row),Math.abs(origin.col-destination.col));
  if(distance===0)reductions.push(marker.center);
  else if(distance===1&&marker.adjacent)reductions.push(marker.adjacent);
 }
 return reductions;
}
export function strongestVisibilityFire(effects,visibility,reductions=[]) {
 if(effects.some(effect=>!Number.isFinite(effect.value)))throw new Error('Invalid fire effect value.');
 return effects.map(effect=>({...effect,visibility_modifier:visibilityFireModifier(visibility,reductions,effect.kind)}))
  .reduce((best,effect)=>!best||effect.value+effect.visibility_modifier<best.value+best.visibility_modifier?effect:best,null);
}
export const patrolInitiative=commands=>{
 if(!Number.isInteger(commands)||commands<0)throw new Error('Invalid General Initiative allowance.');
 return Math.floor(commands/2);
};

// Printed marker faces, visually checked in the official GMT-linked VASSAL
// module 5.0.2: artillery -3/-1, mortar -2/-1, handheld -1.
export const ILLUMINATION_PROFILES=Object.freeze({artillery:{center:3,adjacent:1},mortar:{center:2,adjacent:1},handheld:{center:1,adjacent:0}});
export function placeIllumination(state,location,delivery,source=null){
 const profile=ILLUMINATION_PROFILES[delivery];
 if(!profile||!state.visibility||!state.locations[location])throw new Error('Unsupported illumination delivery.');
 const marker={type:'ILLUMINATION',location,delivery,source,...profile};state.markers.push(marker);return marker;
}
