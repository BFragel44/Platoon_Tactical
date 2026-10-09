// Normandy CSR 7 pp.14–15; visually checked counter-sheet fronts.
// Basic infantry fire and ammunition-consuming ranged attacks are separate capabilities.
export const hill192Weapons=[
 ...Array.from({length:2},(_,i)=>({id:`panzerschreck${i+1}`,name:`${i+1}/Panzerschreck`,kind:'PANZERSCHRECK',steps:1,vof:'S',range:1,basic_range:1,grenade_range:1,grenade_ammo:'RKT',ammo_key:'RKT',ammo:{RKT:4},basic_ammo:false,weapon_jam:true,keep_good_on_depletion:true,rocket:true,fire_team_vof:'S'})),
 ...Array.from({length:2},(_,i)=>({id:`pak40_${i+1}`,name:`${i+1}/75mm AT PAK40`,kind:'PAK40',mobile:false,steps:2,vof:'S',range:1,ammo_key:'GUN',ammo:{GUN:6},basic_ammo:false,weapon_jam:true,keep_good_on_depletion:true,fire_team_vof:'S'})),
 ...Array.from({length:2},(_,i)=>({id:`ig75_${i+1}`,name:`${i+1}/75mm Infantry Gun`,kind:'INFANTRY_GUN75',mobile:false,steps:2,vof:'S',range:3,basic_range:1,grenade_range:3,grenade_ammo:'GUN',ammo_key:'GUN',ammo:{GUN:6},basic_ammo:false,weapon_jam:true,keep_good_on_depletion:true,fire_team_vof:'S'})),
];
