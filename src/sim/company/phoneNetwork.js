import {values,live,good,emit,randomNumber} from './core.js';

export function phoneConnected(s,from,to){
 if(from===to)return true;
 const nodes=new Set(values(s.locations).filter(l=>l.staging).map(l=>l.id));
 for(const line of s.phone_lines??[])if(!line.cut)nodes.add(line.location);
 for(const unit of values(s.units).filter(u=>live(u)&&u.radios?.includes('CO_PHONE')))nodes.add(unit.location);
 if(!nodes.has(from)||!nodes.has(to))return false;
 const queue=[from],seen=new Set(queue);
 while(queue.length){const id=queue.shift(),a=s.locations[id];
  for(const next of nodes){if(seen.has(next))continue;const b=s.locations[next];
   if(a.staging&&b.staging||Math.max(Math.abs(a.row-b.row),Math.abs(a.col-b.col))===1){if(next===to)return true;seen.add(next);queue.push(next);}
  }
 }
 return false;
}
export function layPhoneLine(s,u){
 if(s.mission_rules?.communications!=='phones'||!u.assets?.phone_line||s.locations[u.location].staging||s.phone_lines.some(line=>line.location===u.location&&!line.cut))return;
 u.assets.phone_line--;
 s.phone_lines.push({id:`phone_line_${s.next_id++}`,location:u.location,owner:u.id,cut:false});
 emit(s,'PHONE_LINE_LAID',`${u.name} laid a phone line at ${s.locations[u.location].name}.`,{actor:u.id,location:u.location});
}
export function damagePhoneLines(s){
 if(s.mission_rules?.communications!=='phones')return;
 for(const line of s.phone_lines.filter(line=>!line.cut)){
  const support=s.support.some(f=>f.status==='ACTIVE'&&f.location===line.location);
  const enemies=values(s.units).some(u=>u.faction==='enemy'&&good(u)&&u.location===line.location);
  const friendlies=values(s.units).some(u=>u.faction==='friendly'&&good(u)&&u.location===line.location);
  if(!support&&!(enemies&&!friendlies))continue;
  const denominator=support?2:3,threshold=support?1:2;
  if(randomNumber(s,denominator,'Phone line damage check',!friendlies)<=threshold){line.cut=true;emit(s,'PHONE_LINE_CUT',`Phone line cut at ${s.locations[line.location].name}.`,{location:line.location,cause:support?'incoming fire':'enemy action'},!friendlies);}
 }
}
