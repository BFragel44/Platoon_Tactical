import {live,good,friendly} from './core.js';
// A concealed cut must not turn into a precise map marker through presentation.
export function publicPhoneLines(s,events){
 const boundary=events.findLast(e=>['MISSION_REATTEMPTED','PATROL_PREPARED'].includes(e.type))?.sequence??0;
 return (s.phone_lines??[]).map(line=>{
  const known=events.findLast(e=>e.sequence>=boundary&&e.location===line.location&&['PHONE_LINE_LAID','PHONE_LINE_CUT','PHONE_LINE_REPAIRED'].includes(e.type)&&(!e.line_id||e.line_id===line.id));
  const inspected=Object.values(s.units).some(u=>friendly(u)&&live(u)&&good(u)&&u.location===line.location);
  return {...line,cut:inspected?line.cut:known?.type==='PHONE_LINE_CUT',condition:inspected?'observed':'last reported'};
 });
}
