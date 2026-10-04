import {live,good,emit,dropLoad} from './core.js';

export const availableRunner=s=>(s.runners??[]).find(r=>r.status==='BOX');
export function createRunner(s,donor){
 const step=donor.steps.pop();
 if(!donor.steps.length){dropLoad(s,donor,'runner creation');donor.removed='RUNNER_CREATED';}
 const id=`runner_${s.next_id++}`;
 s.runners.push({id,step,status:'BOX',origin:donor.id});
 emit(s,'RUNNER_CREATED',`${donor.name} provided a step for a Line-rated runner.`,{actor:donor.id,runner:id,step_id:step.id});
}
export function dispatchRunner(s,target){
 const runner=availableRunner(s),id=runner.id;
 runner.status='DISPATCHED';runner.target=target.id;runner.turn=s.turn;
 s.units[id]={id,name:`Runner to ${target.name}`,kind:'RUNNER',faction:'friendly',location:target.location,platoon:null,cohesion:'GOOD',experience:'Line',original_experience:'Line',steps:[runner.step],max_steps:1,radios:[],assets:{},ammo:{},saved:0,used:[],removed:null,pinned:false,exposed:true,cover:null,vof:null,range:0,fire:null,indirect:null,mission_weapon:true};
 emit(s,'RUNNER_DISPATCHED',`Runner dispatched to ${target.name}; delivery is checked next turn.`,{runner:id,target:target.id,location:target.location});
}
export function dismissRunner(s,recipient){
 const runner=availableRunner(s);runner.status='DISMISSED';recipient.steps.push(runner.step);
 emit(s,'RUNNER_DISMISSED',`Runner returned to ${recipient.name} as one step.`,{runner:runner.id,actor:recipient.id,step_id:runner.step.id});
}
export function deliverRunners(s){
 for(const runner of s.runners??[]){
  if(runner.status!=='DISPATCHED'||runner.turn>=s.turn)continue;
  const unit=s.units[runner.id],target=s.units[runner.target];
  if(!live(unit)){runner.status='LOST';delete s.units[runner.id];continue;}
  if(!good(unit))continue;
  if(live(target)&&good(target)&&target.location===unit.location&&['HQ','STAFF'].includes(target.kind)&&!s.activated.includes(target.id)){
   s.activated.push(target.id);
   emit(s,'HQ_ACTIVATED',`${target.name} activated by runner.`,{hq:target.id,runner:runner.id});
  }else emit(s,'RUNNER_UNDELIVERED',`Runner returned without delivering orders to ${target?.name??'its target'}.`,{runner:runner.id,target:runner.target});
  runner.status='BOX';runner.target=null;delete s.units[runner.id];
 }
}
