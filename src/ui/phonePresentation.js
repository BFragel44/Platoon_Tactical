const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function phoneWireMarkup(lines,location){
 const here=lines.filter(l=>l.location===location);if(!here.length)return '';
 const cut=here.every(l=>l.cut),status=cut?'Cut':'Intact';
 return `<div class="phone-wire-marker ${cut?'cut':''}" role="img" aria-label="Phone wire: ${status.toLowerCase()}; last known condition"><svg viewBox="0 0 100 24" aria-hidden="true"><path d="M2 12 H24 C24 0 40 0 40 12 S56 24 56 12 S72 0 72 12 H98"/>${cut?'<path class="wire-break" d="M44 2 L57 22 M57 2 L44 22"/>':''}</svg><span>Phone wire · ${status}</span><small>Last known condition${here.length>1?` · ${here.length} lines`:''}</small></div>`;
}
export function phoneConnectionLosses(before,after){
 if(!before||!after||before.scenario_id!==after.scenario_id||before.mission_instance_id!==after.mission_instance_id||before.attempt_number!==after.attempt_number)return [];
 const phone=l=>l.channels.some(c=>c.includes('field-phone'));
 return (before.command_network??[]).filter(phone).flatMap(old=>{
  const unit=after.units.find(u=>u.id===old.unit_id),next=after.command_network.find(l=>l.unit_id===old.unit_id);
  return unit?.steps&&!unit.removed&&next&&!phone(next)?[{id:unit.id,name:unit.name,voice:next.channels.includes('Visual / verbal')}]:[];
 });
}
export function createPhoneNotifications(){
 const host=document.createElement('section');host.className='phone-network-alert';host.setAttribute('role','alert');let timer;
 const clear=()=>{clearTimeout(timer);host.remove();host.replaceChildren();};
 return {reset:clear,sync:parent=>{if(parent&&host.childNodes.length)parent.append(host);},push:(losses,locations=[])=>{
  if(!losses.length)return;clear();
  const title=document.createElement('strong');title.textContent='Field-phone connection lost';
  const text=document.createElement('p');text.textContent=losses.map(l=>l.name+(l.voice?' (local voice still available)':'')).join('; ');
  const detail=document.createElement('p');detail.textContent=locations.length?`Reported cut: ${[...new Set(locations)].join(', ')}. Check the wire and repair it or reconnect the phones.`:'Check phones and wire. The break location has not been confirmed.';
  const button=document.createElement('button');button.textContent='Dismiss';button.onclick=clear;host.append(title,text,detail,button);timer=setTimeout(clear,12000);
 }};
}
