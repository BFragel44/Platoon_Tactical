// Display names are derived only from discovered cover in the player view.
export function coverLabel(view,id) {
  for(const l of view.locations){
    const cover=l.covers.find(c=>c.id===id);if(!cover)continue;
    const title=c=>{const peers=l.covers.filter(v=>v.type===c.type);return `${c.type}${peers.length>1?' '+(peers.findIndex(v=>v.id===c.id)+1):''}`;};
    const parent=l.covers.find(c=>c.id===cover.parent);
    return `C${l.covers.findIndex(c=>c.id===cover.id)+1} · ${title(cover)}${parent?' above '+title(parent):''} · +${cover.value} protection${cover.capacity?' · '+cover.capacity+'-step capacity':''}`;
  }
}
export function movingFormationIds(option,target,enabled=true) {
  if(!enabled||!['PLATOON_MOVE','PLATOON_INFILTRATE'].includes(option?.type))return [];
  const selected=option.targets.find(t=>t.id===target);
  return selected&&!selected.reason?selected.moving_unit_ids??[]:[];
}
export const tacticalText=(view,text)=>String(text??'').replace(/\bcover_\w+\b/g,id=>coverLabel(view,id)??'cover position');
