// Friendly reference information only; never expose enemy inventory or blockers.
export function friendlyTransport(s,u){
 const vehicle=s.vire_runtime?.vehicles[u.embarked_on];
 if(vehicle?.faction!=='friendly'||vehicle.status!=='ACTIVE')return null;
 const steps=(vehicle.passengers??[]).filter(p=>p.origin_formation===u.id).length;
 return steps?{id:vehicle.id,name:vehicle.name,location:vehicle.location,steps}:null;
}
export function playerReferences(s,events){
 const boundary=events.findLast(e=>['PATROL_PREPARED','MISSION_REATTEMPTED'].includes(e.type))?.sequence??0;
 const check=events.findLast(e=>e.type==='OBJECTIVE_CHECK'&&e.sequence>boundary&&typeof e.rows_clear==='boolean');
 const signal_stock=[],keys=Object.keys(s.signal_plan??{});
 const add=(assets,carrier)=>{for(const device of keys)if(Number(assets?.[device])>0)signal_stock.push({device,quantity:assets[device],...carrier});};
 for(const u of Object.values(s.units).filter(u=>u.faction==='friendly')){
  const transport=friendlyTransport(s,u),embarked=!!transport;
  if(!(u.steps.length&&(!u.removed||u.removed==='RESERVE')||embarked))continue;
  add(u.assets,{carrier_id:u.id,carrier_name:u.name,location:embarked?transport.location:u.location,status:embarked?'EMBARKED':u.removed??(u.pinned?'PINNED':'CARRIED')});
 }
 for(const a of s.assets.filter(a=>a.faction==='friendly'&&!a.destroyed&&!a.carrier&&a.type==='EQUIPMENT'&&keys.includes(a.key)))add({[a.key]:a.quantity??1},{location:a.location,status:'GROUND'});
 for(const v of Object.values(s.vire_runtime?.vehicles??{}).filter(v=>v.faction==='friendly'&&v.status==='ACTIVE'))for(const a of v.cargo??[])if(a.type==='EQUIPMENT'&&keys.includes(a.key))add({[a.key]:a.quantity??1},{carrier_id:v.id,carrier_name:v.name,location:v.location,status:'CARGO'});
 return {signal_plan:structuredClone(s.signal_plan??null),phase_lines:structuredClone(s.phase_lines??{}),signal_stock,
  signal_deployments:events.filter(e=>e.sequence>boundary&&e.type==='SIGNAL_DEPLOYED').map(e=>({device:e.device,turn:e.turn})),
  objective_requirements:s.objectives&&!s.patrol?{clear_rows:structuredClone(s.objectives.clear_rows??[]),success_timing:'final_turn'}:null,
  objective_assessment:check?{turn:check.turn,objectives_held:check.objectives_held,rows_clear:check.rows_clear}:null};
}
