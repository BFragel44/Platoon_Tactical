import {getPlayerView,resolveCombat,advancePhase} from '../sim/company/engine.js';
import {reciprocalCombat,resolvesPair} from './combatScreen.js';
// Use existing operations and queue order; never jump over unrelated visible combat.
export function resolveDisplayedExchange(state,onAccepted=()=>{}){
 const view=getPlayerView(state),current=view.combat_resolution;
 if(!current)return {state,accepted:false,reason:'No visible combat awaits resolution.'};
 const peer=reciprocalCombat(current,view),pair=resolvesPair(current,peer);
 let r=resolveCombat(state,current.id);if(!r.accepted)return r;
 onAccepted(state,r.state);state=r.state;
 if(pair){
  r=advancePhase(state);if(r.state===state)return {state,accepted:true};
  onAccepted(state,r.state);state=r.state;
  if(getPlayerView(state).combat_resolution?.id===peer.id){
   r=resolveCombat(state,peer.id);if(r.accepted){onAccepted(state,r.state);state=r.state;}
  }
 }
 return {state,accepted:true};
}
