// Recovered physical equipment keeps its resupply allocation on the new carrier.
export function transferEquipmentResupply(s,recipient,asset){
 if(!s.mission_rules?.reattempts||!['RADIO','EQUIPMENT'].includes(asset.type))return;
 const source=s.units[asset.source_unit];
 if(!source?.initial_resources||source.id===recipient.id)return;
 recipient.initial_resources??={radios:[],assets:{},ammo:{}};
 const from=source.initial_resources,to=recipient.initial_resources;
 if(asset.type==='RADIO'){
  const index=from.radios.indexOf(asset.net);
  if(index<0)return;
  from.radios.splice(index,1);to.radios.push(asset.net);
 }else{
  const quantity=Math.min(from.assets[asset.key]??0,asset.quantity);
  from.assets[asset.key]=(from.assets[asset.key]??0)-quantity;
  if(!from.assets[asset.key])delete from.assets[asset.key];
  if(quantity)to.assets[asset.key]=(to.assets[asset.key]??0)+quantity;
 }
}
