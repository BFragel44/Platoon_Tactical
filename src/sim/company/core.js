import data from './actionDeckData.json' with { type: 'json' };
import { drawRandom } from '../rng.js';

export const values = map => Object.values(map).sort((a,b) => a.id.localeCompare(b.id));
export const live = u => u && u.steps.length > 0 && !u.removed;
export const friendly = u => u.faction === 'friendly';
export const good = u => live(u) && !u.pinned && u.cohesion === 'GOOD';
export const expMod = u => ({ Green: -1, Line: 0, Veteran: 1 }[u.experience] ?? 0);
export const visible = (s,u) => friendly(u) || s.knowledge.spotted[u.id];
export function emit(s, type, text, details = {}, hidden = false) {
  const event = { id: `event_${s.events.length+1}`, sequence: s.events.length+1, turn: s.turn,
    phase: s.phase, impulse: s.impulse?.id ?? null, type, text, ...details, hidden };
  s.events.push(event); return event;
}
export function shuffle(s, items) {
  const result = [...items];
  for (let i = result.length-1; i > 0; i--) {
    const draw = drawRandom(s.rng); s.rng = draw.rng;
    const j = Math.floor(draw.value * (i+1)); [result[i],result[j]] = [result[j],result[i]];
  }
  return result;
}
export const cards = Object.fromEntries(data.cards.map(({id, fields:f}) => [id, {
  id, activated:f[0], initiative:f[1], word:f[2], spot:f[3].includes('10683'),
  grenade:f[3].includes('1F4A3'), infiltrate:f[3].includes('1FA96'),
  burst:f[3].includes('1F4A5'), multi:f[3].split('1F4A5').length > 2,
  jam:f[3] === 'Jam!', short:f[3] === 'Short!', hq:!!f[4], at:f[5],
  hit:{ Veteran:f[6], Line:f[7], Green:f[8] }, combat:f.slice(9,20), random:f.slice(20,31),
}]));
export function newDeck(s) { return { order:shuffle(s, data.cards.map(c => c.id)), discard:[], reshuffles:0, draws:0 }; }
// Finish the entire attempt, even after success. Reshuffle marker is not a draw.
export function draw(s, count, purpose, hidden = false) {
  const batch = []; let reshuffle = false;
  for (let i = 0; i < count;) {
    if (!s.deck.order.length) {
      s.deck.order = shuffle(s, s.deck.discard); s.deck.discard = []; s.deck.reshuffles++;
      reshuffle = false;
    }
    const id = s.deck.order.shift(); s.deck.discard.push(id); s.deck.draws++;
    if (id === 51) { reshuffle = true; continue; }
    batch.push(cards[id]); i++;
  }
  emit(s,'CARDS_DRAWN',`${purpose}: ${batch.map(c => c.id).join(', ')}.`,
    { purpose, card_ids: batch.map(c=>c.id) }, hidden);
  if (reshuffle) {
    s.deck.order = shuffle(s, [...s.deck.order,...s.deck.discard]); s.deck.discard = []; s.deck.reshuffles++;
    emit(s,'DECK_SHUFFLED','Action deck reshuffled after completing the draw batch.',{},hidden);
  }
  return batch;
}
export function randomNumber(s, n, purpose, hidden = false) {
  if (n <= 1) return 1;
  if (n > 12) throw new Error('Action card random range exceeds 12');
  return draw(s,1,purpose,hidden)[0].random[n-2];
}
export function pick(s, items, purpose, hidden=false) { return items[randomNumber(s,items.length,purpose,hidden)-1]; }
export function attempt(s,u, count, icon, purpose, hidden = !visible(s,u)) {
  return draw(s,Math.max(1,count+expMod(u)),purpose,hidden).filter(c => c[icon] || c.word.toLowerCase() === icon).length;
}
export function result(before,next,extra={}) { return { state:next, events:next.events.slice(before.events.length), ...extra }; }
