import {draw,emit,good} from './core.js';
export const eligibleEngineer=u=>u?.capabilities?.engineer&&u.kind==='SQUAD'&&good(u)&&[2,3].includes(u.steps.length);
export function engineerMineCheck(s,u,cards){
 const hit=draw(s,cards,`${u.name}: engineer mine check`).some(c=>c.burst||c.short);
 if(hit){u.mine_hit=true;s.markers.push({type:'MINES',location:u.location,target:u.id,value:-4});}
 emit(s,'MINE_CHECK',`${u.name} ${hit?'triggered mines':'avoided the mines'}.`,{actor:u.id,location:u.location,hit});return hit;
}
export function markEngineerPath(s,u,infiltrationSuccess){
 if(!s.mission_rules.hill192||!eligibleEngineer(u)||!s.locations[u.location].mines)throw new Error('A good-order two- or three-step engineer squad on a known minefield is required.');
 // CSR 10: a failed infiltration does not expose the squad, but checks three cards.
 const hit=engineerMineCheck(s,u,infiltrationSuccess?1:3);
 if(infiltrationSuccess&&!hit){s.locations[u.location].mines=false;s.locations[u.location].mine_path_marked=true;}
 emit(s,'ENGINEER_PATH_ATTEMPT',`${u.name}: ${infiltrationSuccess&&!hit?'clear path marked':'path marking failed'}.`,{actor:u.id,location:u.location,infiltration_success:!!infiltrationSuccess,hit,cleared:!!infiltrationSuccess&&!hit});
 return infiltrationSuccess&&!hit;
}
