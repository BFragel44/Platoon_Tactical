// Third-edition Enemy Activity player aid: first matching LAT/Pinned row.
export function latActivityTable({pinned,same,covered,leader,cohesion,named,kind,teams,localCasualty,seenCasualties}){
 if(pinned){
  if(same&&!covered)return leader?['COVER','COVER','RALLY','FALL_BACK']:['NONE','COVER','RALLY','FALL_BACK','FALL_BACK'];
  if(same&&covered)return leader?['NONE','RALLY','RALLY']:['NONE','NONE','RALLY','FALL_BACK','FALL_BACK'];
  if(!covered)return leader?['NONE','COVER','RALLY']:['NONE','NONE','COVER','RALLY','FALL_BACK'];
  return leader?['RALLY']:['NONE','NONE','RALLY','FALL_BACK'];
 }
 if(leader&&!same&&teams>=2&&['A','F'].includes(cohesion))return ['RECONSTITUTE'];
 if(cohesion==='A')return same?(leader?['ATTACK']:['NONE','ATTACK']):(leader?['NONE','INFILTRATE','INFILTRATE']:['NONE','INFILTRATE']);
 if(cohesion==='F'&&same)return covered?(leader?['NONE','ATTACK','FALL_BACK']:['NONE','NONE','ATTACK','FALL_BACK','FALL_BACK']):(leader?['NONE','COVER','COVER','FALL_BACK']:['NONE','COVER','FALL_BACK','FALL_BACK','FALL_BACK']);
 if(cohesion==='F'&&kind==='LEADER')return leader?['RECOVER']:['NONE','RECOVER','RECOVER'];
 if(cohesion==='F'&&named)return leader?['RECOVER']:['NONE','RECOVER'];
 if(cohesion==='L'){
  if(localCasualty)return leader?['EVACUATE']:['NONE','EVACUATE','EVACUATE'];
  if(seenCasualties)return leader?['NONE','SEEK_CASUALTY']:['NONE','SEEK_CASUALTY','SEEK_CASUALTY'];
  return leader?['NONE','RECOVER']:['NONE','NONE','RECOVER'];
 }
 if(cohesion==='P'&&!same)return leader?['NONE','RECOVER']:['NONE'];
 return ['NONE'];
}

// Printed Hasty Defense column, first matching Good Order row.
export function hastyActivityTable({same,covered,outOfAmmo,noLOS,under,validPDF,differentDirection,heavy,stronger,trading}){
 if(same)return covered?['NONE','FALL_BACK','ATTACK']:['NONE','COVER','FALL_BACK','ATTACK'];
 if(outOfAmmo)return ['NONE','FALL_BACK','FALL_BACK'];
 if(!under&&noLOS)return ['HIDE'];
 if(!under&&validPDF)return ['NONE','ATTACK'];
 if(under&&!covered)return ['NONE','COVER','COVER','FALL_BACK','ATTACK'];
 if(differentDirection)return ['NONE','ATTACK','SHIFT','SHIFT','FALL_BACK'];
 if(heavy&&validPDF)return ['NONE','ATTACK','ATTACK'];
 if(trading)return stronger?['NONE','ATTACK']:['NONE','NONE','ATTACK','ATTACK','FALL_BACK'];
 return ['NONE'];
}
