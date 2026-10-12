const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const signalDeviceLabel=key=>({rsp:'Red star parachute',rsc:'Red star cluster',gsp:'Green star parachute',gsc:'Green star cluster',red_signal:'Red smoke',green_signal:'Green smoke',yellow_signal:'Yellow smoke',purple_signal:'Purple smoke'})[key]??key.replaceAll('_',' ');
export const signalOrderLabel=order=>({CF:'Cease fire',XPL1:'Cross phase line 1',XPL2:'Cross phase line 2',M2PO:'Move to primary objective',INFAP2PO:'Infiltrate from attack position to primary objective',M2SO:'Move to secondary objective',INFAP2SO:'Infiltrate from attack position to secondary objective',M2S:'Move to signal card'})[order]??'No assigned order';
export function signalEffectLabel(order,view,name){
 const label=signalOrderLabel(order);
 if(order?.startsWith('XPL'))return `${label} — Row ${view.phase_lines?.[order.at(-1)]??order.at(-1)}`;
 if(['M2PO','INFAP2PO','M2SO','INFAP2SO'].includes(order)){
  const destination=name(view.objectives?.[order.endsWith('PO')?'primary':'secondary']?.location),attack=view.objectives?.attack?.location;
  return `${label} — ${order.startsWith('INF')&&attack?`${name(attack)} → `:''}${destination}`;
 }
 return label;
}
export function signalReferenceMarkup(view,name){
 if(!view.signal_plan)return '';
 return `<details open class="signal-reference"><summary>Signal plan</summary><p>Assigned before deployment. Use the normal signal order to deploy a one-use device; recipient and movement restrictions still apply.</p>${view.visibility?'<p>Colored smoke signals are unavailable at night; their remaining stock is still listed.</p>':''}<div class="reference-table-wrap"><table><thead><tr><th scope="col">Device</th><th scope="col">Assigned order</th><th scope="col">Current stock</th><th scope="col">Remaining</th></tr></thead><tbody>${Object.entries(view.signal_plan).map(([device,order])=>{
  const stock=(view.signal_stock??[]).filter(a=>a.device===device),quantity=stock.reduce((n,a)=>n+a.quantity,0);
  const holders=stock.map(a=>`${a.status==='GROUND'?'On ground':a.carrier_name??'Friendly carrier'} · ${a.location&&a.location!=='RESERVE'?name(a.location):'Off map / in transit'} · ×${a.quantity}${a.status==='GROUND'?' — recover to use':a.status==='EMBARKED'||a.status==='CARGO'?' — aboard transport':a.status==='RESERVE'?' — not deployed':a.status==='PINNED'?' — pinned':''}`);
  const empty=(view.signal_deployments??[]).some(e=>e.device===device)?'Expended this attempt':'Unavailable stock — no confirmed expenditure';
  return `<tr><th scope="row">${esc(signalDeviceLabel(device))}</th><td>${esc(signalEffectLabel(order,view,name))}</td><td>${holders.length?holders.map(esc).join('<br>'):empty}</td><td>${quantity}</td></tr>`;
 }).join('')}</tbody></table></div><p>Star signals and smoke use their existing visibility rules. Remaining stock is not permission to issue an order now; check the carrier's orders and command availability.</p></details>`;
}
