// Command records are projections; vehicle crews remain outside the infantry roster.
export function vehicleHQRecord(s,id){
 const v=s.vire_runtime?.vehicles[id];
 return v?.status==='ACTIVE'&&v.command_role==='vehicle_platoon_hq'?{...v,name:v.name??v.id,kind:'HQ',steps:v.crew,cohesion:'GOOD',cover:null,saved:v.saved??0,capabilities:{},assets:{},used:[]}:null;
}
export const vehicleHQs=s=>Object.values(s.vire_runtime?.vehicles??{}).map(v=>vehicleHQRecord(s,v.id)).filter(Boolean);
export function vehicleCommandAuthority(s,issuer,v){
 if(!issuer||issuer.pinned)return false;
 if(v.profile==='JEEP')return (['company_commander','platoon_commander'].includes(issuer.command_role)||issuer.kind==='STAFF')&&(issuer.embarked_on===v.id||issuer.location===v.location&&!(issuer.cover||v.area))&&(!v.command_hq||issuer.command_role==='company_commander'||issuer.kind==='STAFF'||issuer.id===v.command_hq);
 if(issuer.command_role==='vehicle_platoon_hq')return issuer.id===v.command_hq;
 const hub=s.vire_runtime?.vehicles[v.command_hq];
 return issuer.command_role==='company_commander'&&issuer.radios.includes('BN')&&(v.radios.includes('BN')||hub?.status==='ACTIVE'&&hub.radios.includes('BN'));
}
