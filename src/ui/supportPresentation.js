export function supportCallPreview(view,unit,action,target){
 if(!action.startsWith('CALL_'))return null;
 const id=action.includes('MORTAR')?'mortar':action.includes('CANNON')?'cannon':'artillery',agency=view.support_callers?.[id];
 if(!agency)return null;
 const ammo=action.endsWith('_TOT')?'TOT':action.endsWith('_ILLUM')?'ILLUM':action.endsWith('_WP')?'WP':'HE',role=unit.agency_role??unit.id;
 const base=(agency.ammo_draws?.[ammo]??agency.draws)?.[role];if(!Number.isFinite(base))return null;
 const registered=!!target&&agency.registered===target,experience={Green:-1,Line:0,Veteran:1}[unit.experience]??0;
 return {name:agency.name,ammo,network:agency.networks?.[role],base,experience,registered,draws:Math.max(1,base+experience+Number(registered)),remaining:view.support_inventory?.[id]?.[ammo]};
}
export function friendlyTargetLabel(view,id){
 const location=view.locations.find(l=>l.id===id),friendly=view.units.filter(u=>u.steps&&!u.removed&&u.location===id);
 return `${location?.name??id}${friendly.length?` · ${friendly.length} friendly formation(s) present`:''}`;
}
export function supportWarning(view,events){
 const event=events.findLast(e=>e.type==='SUPPORT_REQUEST'&&e.turn===view.turn);
 if(!event||event.hidden||event.success&&!event.text.includes('short round'))return null;
 const friendly=view.units.filter(u=>u.steps&&!u.removed&&u.location===event.location);
 const agency=view.support_callers?.[event.agency]?.name??'Fire support',location=view.locations.find(l=>l.id===event.location)?.name??'the reported card';
 return `${agency} ${event.ammo??''}: ${event.success?`short round at ${location}.`:'request failed.'}${event.success&&friendly.length?` ${friendly.length} friendly formation(s) are on the reported card.`:''}`;
}
export function battalionChoiceReason(view,first,second){
 if(first===second)return 'Choose two different adjacent cards.';
 if(!view.pending_support?.adjacent.includes(first)||!view.pending_support.adjacent.includes(second))return 'Choose cards from the available adjacent positions.';
 return null;
}
