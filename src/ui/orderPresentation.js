import art from '../../public/assets/images/combat-art-manifest.json';

// Selection is player intent, never a suggestion to substitute a legal action.
export function selectedOrder(options,action,target) {
  const option=options.find(o=>o.type===action);
  const choice=option?.targets.find(t=>t.id===target);
  const reason=!option?'This order is unavailable for the selected formation.':!option.available?option.reason:option.targeted?choice?.reason??(!choice?'Choose a target.':null):null;
  return {option,reason};
}
export const completeCombatStage=stage=>stage==='effect'?'result':stage;
export const combatArt=(filename,role)=>({filename,flip:!!art.assets[filename]?.[`${role}_flip`]});
export const supportContext=source=>source&&source.kind!=='BASIC_FIRE';
