import { drawRandom } from '../rng.js';
import { cards } from './core.js';

const COMBAT_RESULTS=['MISS','PIN','HIT'];
const EXPERIENCES=['Green','Line','Veteran'];
const deck=Object.values(cards).filter(card=>card.id!==51).sort((a,b)=>a.id-b.id);
const freezeDistribution=(order,values)=>{
  const counts=Object.fromEntries(order.map(value=>[value,values.filter(item=>item===value).length]));
  const total=values.length;
  return Object.freeze({total,order:Object.freeze([...order]),counts:Object.freeze(counts),
    probabilities:Object.freeze(Object.fromEntries(order.map(value=>[value,counts[value]/total])))});
};

export const combatResolutionTable=Object.freeze(Object.fromEntries(
  Array.from({length:11},(_,index)=>[index-4,freezeDistribution(COMBAT_RESULTS,deck.map(card=>card.combat[index]))])
));
export const hitEffectTable=Object.freeze(Object.fromEntries(EXPERIENCES.map(experience=>{
  const values=deck.map(card=>card.hit[experience]);
  return [experience,freezeDistribution([...new Set(values)].sort(),values)];
})));

export function sampleDistribution(distribution,roll) {
  if(!(roll>=0&&roll<1))throw new RangeError('Probability roll must be in [0, 1).');
  const position=roll*distribution.total;let cumulative=0;
  for(const value of distribution.order){cumulative+=distribution.counts[value];if(position<cumulative)return value;}
  return distribution.order.at(-1);
}
function resolveDistribution(distribution,rng) {
  const draw=drawRandom(rng),value=sampleDistribution(distribution,draw.value);
  return {rng:draw.rng,roll:draw.value,result:value,distribution};
}
export function resolveCombatOutcome(ncm,rng) {
  const distribution=combatResolutionTable[ncm];
  if(!distribution)throw new RangeError(`Unsupported NCM ${ncm}.`);
  return resolveDistribution(distribution,rng);
}
export function resolveHitEffect(experience,rng) {
  const distribution=hitEffectTable[experience];
  if(!distribution)throw new RangeError(`Unsupported experience ${experience}.`);
  const resolved=resolveDistribution(distribution,rng);
  return {...resolved,effect:resolved.result};
}
