import {borders} from './terrain.js';
import {values,live,friendly,emit} from './core.js';
import {explainLos,unitLos} from './battlefield.js';

// Terrain discovery is distinct from spotting. A setup-only geometric view lets
// staging reveal terrain without allowing a staging unit to shoot or spot.
export function revealTerrain(s,{setup=false}={}) {
 if(!s.mission_rules?.hiddenTerrain)return;
 const origins=setup?values(s.locations).filter(l=>l.staging).map(l=>l.id):values(s.units).filter(u=>friendly(u)&&live(u)&&!s.locations[u.location].staging);
 const locations=setup?Object.fromEntries(values(s.locations).map(l=>[l.id,{...l,staging:false}])):s.locations;
 const geometry={...s,locations};
 for(const l of values(s.locations))if(!l.known&&(setup&&l.row===1||origins.some(origin=>setup?explainLos(geometry,origin,l.id).visible:unitLos(s,origin,l.id)))){
  while(l.terrain==='hill'){
   const card=s.terrain_deck.pop();if(!card)throw new Error('Terrain deck exhausted while resolving a hill.');
   const {id,row,col,name,hills=[],elevation}=l;
   Object.assign(l,card,{id,row,col,terrain_card:card.id,hills:[...hills,l.terrain_card],elevation:elevation+1,borders:borders(),name:`${row}.${col} ${card.name} / Hill`,covers:[],smoke:false});
  }
  if(setup)geometry.locations[l.id]={...l,staging:false};
  l.known=true;emit(s,'TERRAIN_REVEALED',`${l.name} revealed.`,{location:l.id,terrain_card:l.terrain_card});
 }
}
export function terrainProjection(l){
 if(l.known!==false)return {...structuredClone(l),covers:l.covers.filter(c=>c.known).map(c=>structuredClone(c))};
 return {id:l.id,row:l.row,col:l.col,name:`${l.row}.${l.col} Unrevealed terrain`,known:false,staging:false,covers:[],borders:null};
}
