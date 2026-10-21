import {deviceLabel} from './deviceLabels.js';
import {transferReconstitutionLoads} from '../sim/company/reconstitution.js';
import counterManifest from './counterManifest.json';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const supplyLabel=(type,key)=>type==='RADIO'?deviceLabel(key):`${type==='AMMO'?'Ammo':'Equipment'} · ${key.replaceAll('_',' ')}`;
function supplyIcon(type,key){const art=type==='RADIO'?'radio':({smoke:'smoke',wp:'wp',rifle_grenade:'rifle-grenade'})[key],file=counterManifest.counters[art]?.file;return file?`<img src="${file}" alt="">`:`<span aria-hidden="true">${type==='AMMO'?'AM':'EQ'}</span>`;}
// Mirror preparation resupply without changing mission state or drawing cards.
export function attemptSupplyStock(state,projection,reconstitute={}){
 const units=structuredClone(projection.units),s={units,casualties:[]};
 for(const [id,donors] of Object.entries(reconstitute))transferReconstitutionLoads(s,units[id],[...(state.units[id].steps.length?[units[id]]:[]),...donors.map(d=>units[d])]);
 return Object.fromEntries(Object.values(units).filter(u=>u.steps.length&&!projection.consumed.has(u.id)&&u.kind!=='RUNNER'&&u.command_role!=='higher_hq').map(u=>{
  const stock=u.initial_resources??u,items={};
  for(const key of stock.radios??[])items[`RADIO:${key}`]=(items[`RADIO:${key}`]??0)+1;
  for(const [field,type] of [['assets','EQUIPMENT'],['ammo','AMMO']])for(const [key,n] of Object.entries(stock[field]??{}))if(Number.isSafeInteger(n)&&n>0)items[`${type}:${key}`]=n;
  if(items['EQUIPMENT:phone_line'])items['EQUIPMENT:phone_line']=Math.max(0,items['EQUIPMENT:phone_line']-(state.phone_lines??[]).filter(l=>l.owner===u.id).length);
  return [u.id,{name:u.name,items}];
 }));
}
// Transfers resolve in numbered order, exactly as in the simulation reducer.
export function projectSupplyTransfers(stock,transfers){
 const inventory=structuredClone(stock),rows=[];
 for(const t of transfers){
  const from=inventory[t.from],to=inventory[t.to],max=from&&to&&t.from!==t.to?(from.items[t.item]??0):0;
  const requested=Number(t.quantity),quantity=Number.isFinite(requested)?Math.max(0,Math.min(max,Math.floor(requested))):0;
  rows.push({...t,max,quantity});
  if(quantity){from.items[t.item]-=quantity;to.items[t.item]=(to.items[t.item]??0)+quantity;}
 }
 return {inventory,rows};
}
export function supplyInventoryMarkup(inventory){
 return `<h3>Formation inventories</h3><p>Replenished stock after planned transfers. Transfers resolve in numbered order.</p><div class="attempt-inventory-list">${Object.entries(inventory).map(([id,u])=>`<section class="attempt-inventory-card" data-supply-unit="${esc(id)}"><h4>${esc(u.name)}</h4><div>${Object.entries(u.items).filter(([,n])=>n>0).map(([item,n])=>{const [type,key]=item.split(':');return `<span class="attempt-supply-chip">${supplyIcon(type,key)}<b>×${n}</b> ${esc(supplyLabel(type,key))}</span>`;}).join('')||'<span class="muted">No carried supplies</span>'}</div></section>`).join('')}</div>`;
}
