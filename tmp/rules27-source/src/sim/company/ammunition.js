import {emit,visible} from './core.js';

export const AMMO_CAPACITY={MG:6,MTR:2,RKT:3,GUN:3};
export function ammoLoadReason(s,u,extra={}){
 if(s.mission_rules?.ammo!=='tracked'||!u.ammo)return null;
 if(u.kind==='MORTAR'&&u.steps.length>1)return null; // Section has its own ammo bearers.
 for(const [type,quantity] of Object.entries(u.ammo)){
  const maximum=(AMMO_CAPACITY[type]??3)*u.steps.length;
  if(!Object.values(extra).some(Boolean)&&quantity>maximum)continue; // Excess is left on the departure card.
  if(quantity+(extra[type]??0)>maximum)return `Over ${type} ammunition capacity (${maximum}); drop or transfer ammunition before moving.`;
 }
 return null;
}
export function dropExcessAmmunition(s,u){
 if(s.mission_rules?.ammo!=='tracked'||u.kind==='MORTAR'&&u.steps.length>1)return;
 for(const [key,quantity] of Object.entries(u.ammo??{})){
  const maximum=(AMMO_CAPACITY[key]??3)*u.steps.length,excess=Math.max(0,quantity-maximum);
  if(!excess)continue;
  s.assets.push({id:`asset_${s.next_id++}`,type:'AMMO',key,quantity:excess,source_unit:u.id,location:u.location,cover:u.cover,faction:u.faction});
  u.ammo[key]-=excess;
  emit(s,'AMMO_DROPPED',`${visible(s,u)?u.name:'Enemy formation'} left ${excess} excess ${key} ammunition before moving.`,{actor:visible(s,u)?u.id:null,location:u.location,key,quantity:excess},!visible(s,u));
 }
}
export function dropAmmunition(s,u,reason='dropped'){
 if(s.mission_rules?.ammo!=='tracked')return;
 for(const [key,quantity] of Object.entries(u.ammo??{}))if(quantity){
  s.assets.push({id:`asset_${s.next_id++}`,type:'AMMO',key,quantity,source_unit:u.id,location:u.location,cover:u.cover,faction:u.faction});
  u.ammo[key]=0;
  emit(s,'AMMO_DROPPED',`${visible(s,u)?u.name:'Enemy formation'} left ${quantity} ${key} ammunition (${reason}).`,{actor:visible(s,u)?u.id:null,location:u.location,key,quantity},!visible(s,u));
 }
 u.out_of_ammo=true;
}
export function expendAmmunition(s,u,key,quantity=1,reason='fire'){
 if(s.mission_rules?.ammo!=='tracked'||u.ammo?.[key]===undefined)return true;
 if(u.ammo[key]<quantity)return false;
 u.ammo[key]-=quantity;
 emit(s,'AMMO_EXPENDED',`${visible(s,u)?u.name:'Enemy formation'} expended ${quantity} ${key} ammunition.`,{actor:visible(s,u)?u.id:null,location:u.location,key,quantity,remaining:visible(s,u)?u.ammo[key]:null,reason},!visible(s,u));
 if(u.ammo[key]===0){
  u.out_of_ammo=true;
  if(u.steps.length===1&&['S','A/S'].includes(u.fire_team_vof)){u.cohesion='F';u.fire=null;}
  emit(s,'OUT_OF_AMMO',`${visible(s,u)?u.name:'Enemy formation'} is out of ${key} ammunition.`,{actor:visible(s,u)?u.id:null,location:u.location,key},!visible(s,u));
 }
 return true;
}
export function pickUpAmmunition(s,u,asset){
 const capacity=u.kind==='MORTAR'&&u.steps.length>1?Infinity:(AMMO_CAPACITY[asset.key]??3)*u.steps.length;
 const available=Math.max(0,capacity-(u.ammo?.[asset.key]??0));
 const quantity=Math.min(asset.quantity,available);
 if(!quantity)throw new Error(`No ${asset.key} ammunition carrying capacity remains.`);
 u.ammo??={};u.ammo[asset.key]=(u.ammo[asset.key]??0)+quantity;
 if(s.mission_rules?.reattempts){
  const source=s.units[asset.source_unit];
  u.initial_resources??={radios:[],assets:{},ammo:{}};
  if(source?.initial_resources&&source.id!==u.id){
   const stock=source.initial_resources.ammo,transferred=Math.min(stock[asset.key]??0,quantity);
   stock[asset.key]=(stock[asset.key]??0)-transferred;
   u.initial_resources.ammo[asset.key]=(u.initial_resources.ammo[asset.key]??0)+transferred;
  }else if(!source)u.initial_resources.ammo[asset.key]=Math.max(u.initial_resources.ammo[asset.key]??0,u.ammo[asset.key]);
 }
 u.out_of_ammo=false;
 asset.quantity-=quantity;if(!asset.quantity)s.assets=s.assets.filter(a=>a.id!==asset.id);
 emit(s,'AMMO_RESUPPLIED',`${u.name} picked up ${quantity} ${asset.key} ammunition.`,{actor:u.id,location:u.location,key:asset.key,quantity});
}
