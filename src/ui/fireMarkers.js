import manifest from '../markers/manifest.json';
// Pure presentation of the already filtered player projection. Never reads simulation secrets.
export function fireMarkers(view,location) {
  const fire=view.fire.filter(f=>f.target===location.id),markers=[];
  const name=id=>view.units.find(u=>u.id===id)?.name??view.enemies.find(u=>u.id===id)?.name??'Unidentified attacker';
  const loc=id=>view.locations.find(l=>l.id===id)?.name??id;
  if(fire.length) {
    const value=Math.min(...fire.map(f=>f.value));
    const art=({'0':'small-arms','-1':'automatic','-3':'heavy','2':'all-pinned'})[value];
    markers.push({art,label:`${value===2?'All Pinned fire':'VOF'} ${value>=0?'+':''}${value}`,detail:fire.map(f=>`${f.source?name(f.source):'Unidentified attacker'}: ${loc(f.origin)} → ${loc(f.target)} (${f.value}${f.value===2?'; pinned firing source':''}).`).join(' ')+
      ' This marker belongs on the card receiving fire, not the firing card. Same-card basic fire affects opposing occupants, never its own source. Established fire may continue after a position is cleared.'});
    const directions=new Set(fire.filter(f=>!f.indirect&&f.origin!==location.id).map(f=>{const a=view.locations.find(l=>l.id===f.origin);return `${Math.sign(a.row-location.row)},${Math.sign(a.col-location.col)}`;}));
    if(directions.size>1)markers.push({art:'crossfire',label:'Crossfire −1',detail:'Fire arrives from at least two directions. Crossfire adds −1 separately from the strongest applicable VOF.'});
  }
  for(const m of view.markers.filter(m=>m.location===location.id))markers.push({
    art:m.type==='GRENADE'?(m.critical?'critical-grenade':'grenade'):m.type==='GRENADE_MISS'?'grenade-miss':'concentrated',
    label:m.type.replaceAll('_',' ')+(m.critical?' · critical':''),detail:'Targeted effects resolve during mutual combat. Inspect formation combat results for applicable modifiers; this marker does not reveal a hidden source.'});
  for(const f of view.support.filter(f=>f.location===location.id))markers.push({art:`${f.status==='PENDING'?'pending':'incoming'}${f.value}`,
    label:`${f.status==='PENDING'?'Pending':'Incoming'} ${f.value}`,detail:f.status==='PENDING'?'Activates at the next fire mission update.':'Active indirect fire; terrain burst and occupied cover modify its effects.'});
  if(location.smoke)markers.push({label:'SMOKE +2',detail:'Screening smoke blocks sight through or out of this card and modifies basic fire.'});
  const affected=[...view.units,...view.enemies].filter(u=>u.location===location.id&&u.steps&&!u.removed).map(u=>u.name).join(', ');
  return markers.map(m=>({...m,art:manifest.markers[m.art]?.file?m.art:null,detail:`${m.detail} Visible occupants: ${affected||'none'}.`}));
}
export function pdfDirections(view,location) {
  const groups=new Map();
  for(const f of view.fire.filter(f=>f.origin===location.id&&f.target!==location.id&&!f.indirect)) {
    const target=view.locations.find(l=>l.id===f.target),dr=Math.sign(target.row-location.row),dc=Math.sign(target.col-location.col);
    const side=f.friendly?'friendly':f.source?'enemy':'unknown',key=`${dr},${dc},${side}`;
    if(!groups.has(key))groups.set(key,{dr,dc,side,targets:[],sources:[],paths:[]});
    groups.get(key).targets.push(target.name);
    groups.get(key).paths.push({origin:location.id,target:f.target,side});
    const unit=[...view.units,...view.enemies].find(u=>u.id===f.source);
    groups.get(key).sources.push(`${unit?.name??'Unidentified source'} — ${unit?.kind==='MORTAR'?'mortar direct lay':'basic fire'} → ${target.name}`);
  }
  return [...groups.values()].map(d=>({...d,angle:Math.atan2(d.dc,d.dr)*180/Math.PI,
    label:`${d.side==='unknown'?'Unidentified':d.side==='friendly'?'Friendly':'Enemy'} PDF: ${[...new Set(d.sources)].join('; ')}. Only these sources contribute; other card occupants may not fire.`}));
}
export function pdfPaths(view) {
  const locations=new Map(view.locations.map(l=>[l.id,l]));
  return view.fire.filter(f=>f.origin!==f.target&&!f.indirect&&locations.has(f.origin)&&locations.has(f.target)).map(f=>{
    const origin=locations.get(f.origin),target=locations.get(f.target);
    const dr=Math.sign(target.row-origin.row),dc=Math.sign(target.col-origin.col);
    const steps=Math.max(Math.abs(target.row-origin.row),Math.abs(target.col-origin.col));
    const cards=Array.from({length:steps+1},(_,i)=>view.locations.find(l=>l.row===origin.row+dr*i&&l.col===origin.col+dc*i)?.id).filter(Boolean);
    const side=f.friendly?'friendly':f.source?'enemy':'unknown';
    return {id:`${f.origin}|${f.target}|${side}`,origin:f.origin,target:f.target,side,cards,
      label:`${side==='unknown'?'Unidentified':f.source?view.units.find(u=>u.id===f.source)?.name??view.enemies.find(u=>u.id===f.source)?.name??'Enemy':'Friendly fire'}: ${origin.name} → ${target.name}; ${cards.length-2} intervening card${cards.length===3?'':'s'}.`};
  });
}
export function fireExplanation(view,fire) {
  const source=[...view.units,...view.enemies].find(u=>u.id===fire.source);
  const occupants=[...view.units,...view.enemies].filter(u=>u.location===fire.target&&u.steps&&!u.removed);
  const opponents=occupants.filter(u=>(u.faction==='friendly')!==fire.friendly);
  const sameCard=fire.origin===fire.target;
  const recipient=opponents.length?`Visible opposing recipients: ${opponents.map(u=>u.name).join(', ')}.`:'No known opposing recipient.';
  const reason=fire.reason==='CONTINUING_AT_CLEARED_POSITION'?'Established fire held at a cleared position.':fire.reason==='INTERCEPTED_OR_FOLLOWING'?'Movement changed the affected card along the established direction.':fire.reason?.startsWith('BLOCKED')?'Smoke or Incoming fire interrupts the outward path.':'Established engagement.';
  return `${source?.name??(fire.friendly?'Friendly formation':'Unidentified source')} ${source?.kind==='MORTAR'?'(mortar direct lay)':'(basic fire)'}: ${view.locations.find(l=>l.id===fire.origin)?.name??fire.origin} → ${view.locations.find(l=>l.id===fire.target)?.name??fire.target}. ${reason} ${recipient}${sameCard?' Same-card basic fire affects only the opposing side; the firing side does not attack itself.':''}`;
}
