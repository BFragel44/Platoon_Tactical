import {values,live,good} from './core.js';
import {occupants,distance,unitLos,coverOf,enclosedWeaponCover} from './battlefield.js';
// Explicit SG! capability: keep basic Small Arms range distinct from the printed attack range.
export function rangedWeaponTarget(s,u,t){
 if(!live(t)||u.faction===t.faction||!good(u)||!u.grenade_ammo||!(u.ammo?.[u.grenade_ammo]>0)||u.location===t.location)return false;
 if(coverOf(s,u)?.type==='Deep Bunker'||u.rocket&&enclosedWeaponCover(coverOf(s,u)))return false;
 if(!unitLos(s,u,t,u.grenade_range))return false;
 const local=occupants(s,u.location);
 if(local.some(v=>v.faction!==u.faction)||local.some(v=>v.faction===u.faction&&(v.fire??v.temporary_pdf?.target)&&(v.fire??v.temporary_pdf.target)!==t.location))return false;
 const a=s.locations[u.location],b=s.locations[t.location],d=distance(a,b);
 return !values(s.units).some(v=>{if(!live(v)||v.location===u.location||v.location===t.location)return false;const l=s.locations[v.location],n=distance(a,l);return n<d&&l.row===a.row+Math.sign(b.row-a.row)*n&&l.col===a.col+Math.sign(b.col-a.col)*n;});
}
export const rangedWeaponTargets=(s,u)=>values(s.units).filter(t=>rangedWeaponTarget(s,u,t));
