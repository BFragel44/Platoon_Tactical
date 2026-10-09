// Presentation only: consumes historical, player-visible events; never accesses RNG/state.
const cohesion={GOOD:'original side',P:'paralyzed',L:'litter team',F:'Fire Team side',A:'assault team'};
export function combatPlayback(events,turn) {
  const hitByResolution=new Map(events.filter(e=>!e.hidden&&e.type==='HIT_EFFECT_RESOLVED'&&e.turn===turn).map(e=>[e.resolution_id,e]));
  return events.filter(e=>!e.hidden&&e.type==='COMBAT_RESOLVED'&&e.turn===turn).flatMap(e=>{
    const hit=hitByResolution.get(e.resolution_id),pages=[
      {actor:e.actor,location:e.location,title:`Incoming fire — NCM ${e.ncm>=0?'+':''}${e.ncm}`,
        text:e.modifiers.map(m=>`${m.label} ${m.value>=0?'+':''}${m.value}`).join(' · '),event:e.id},
      {actor:e.actor,location:e.location,title:`Combat result — ${e.result}`,
        text:`Seeded roll ${e.roll.toFixed(6)} produced ${e.result}.`,event:e.id},
    ];
    if(hit)pages.push({actor:e.actor,location:e.location,title:`Hit effect — ${hit.effect}`,
      text:`${hit.experience} hit-effect roll ${hit.roll.toFixed(6)} produced ${hit.effect}.`,event:hit.id});
    return pages;
  });
}

export function resultingFormationText(resolution) {
  if(!resolution?.after?.length)return 'Original formation removed.';
  return resolution.after.map(u=>`${u.name}: ${u.steps} step(s), ${cohesion[u.cohesion]??u.cohesion}, ${u.pinned?'pinned':'unpinned'}`).join('; ');
}
