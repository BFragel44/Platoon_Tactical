import {sameCombatSource} from './combatScreen.js';

// Rectangles use unscaled map coordinates. Keep counters readable rather than
// shrinking a long-distance exchange to fit every source on screen.
export function combatCamera(viewport,target,sources=[]){
 const boxes=[target,...sources],left=Math.min(...boxes.map(b=>b.left)),top=Math.min(...boxes.map(b=>b.top));
 const right=Math.max(...boxes.map(b=>b.left+b.width)),bottom=Math.max(...boxes.map(b=>b.top+b.height));
 const fit=Math.min(1,(viewport.width-80)/Math.max(1,right-left),(viewport.height-100)/Math.max(1,bottom-top));
 const zoom=fit>=.7?fit:1,center=fit>=.7?{x:(left+right)/2,y:(top+bottom)/2}:{x:target.left+target.width/2,y:target.top+target.height/2};
 return {zoom,left:Math.max(0,center.x*zoom-viewport.width/2),top:Math.max(0,center.y*zoom-viewport.height/2)};
}
export function combatFocusElements(root,current){
 const world=root.querySelector('.map-layer');if(!world||!current)return null;
 const counter=id=>[...world.querySelectorAll('[data-counter],[data-vehicle]')].find(e=>(e.dataset.counter??e.dataset.vehicle)===id);
 const card=id=>[...world.querySelectorAll('[data-location]')].find(e=>e.dataset.location===id);
 const receiver=counter(current.target_id)??current.after?.map(v=>counter(v.id)).find(Boolean)??card(current.target_location)?.querySelector('.terrain-header');
 const sources=current.sources.filter(s=>s.origin!==current.target_location&&s.kind!=='OFF_MAP_SUPPORT').map(s=>(s.known?counter(s.source_id):null)??card(s.origin)?.querySelector('.terrain-header')).filter(Boolean);
 return receiver?{receiver,sources}:null;
}
export function frameCombat(root,current){
 const focus=combatFocusElements(root,current),world=root.querySelector('.map-layer'),viewport=root.querySelector('.map-viewport');
 if(!focus||!viewport)return null;
 const scale=world.getBoundingClientRect().width/world.offsetWidth||1,frame=world.getBoundingClientRect();
 const rect=e=>{const r=e.getBoundingClientRect();return {left:(r.left-frame.left)/scale,top:(r.top-frame.top)/scale,width:r.width/scale,height:r.height/scale};};
 const counter=rect(focus.receiver),header=[...world.querySelectorAll('[data-location]')].find(e=>e.dataset.location===current.target_location)?.querySelector('.terrain-header');
 const heading=header?rect(header):counter;
 const combined={left:Math.min(counter.left,heading.left),top:Math.min(counter.top,heading.top),width:Math.max(counter.left+counter.width,heading.left+heading.width)-Math.min(counter.left,heading.left),height:counter.top+counter.height-Math.min(counter.top,heading.top)};
 return combatCamera({width:viewport.clientWidth,height:viewport.clientHeight-160},combined.height<viewport.clientHeight-200?combined:counter,focus.sources.map(rect));
}
export function drawCombatPaths(root,current,zoom){
 const svg=root.querySelector('#combat-fire-overlay'),world=root.querySelector('.map-layer'),focus=combatFocusElements(root,current);
 if(!svg||!world)return;
 svg.replaceChildren();if(!focus)return;
 const frame=world.getBoundingClientRect(),point=e=>{const r=e.getBoundingClientRect();return [(r.left-frame.left+r.width/2)/zoom,(r.top-frame.top+r.height/2)/zoom];},target=point(focus.receiver);
 svg.setAttribute('viewBox',`0 0 ${world.offsetWidth} ${world.offsetHeight}`);svg.setAttribute('width',world.offsetWidth);svg.setAttribute('height',world.offsetHeight);
 const ns='http://www.w3.org/2000/svg';
 for(const source of current.sources.filter(s=>s.origin!==current.target_location&&s.kind!=='OFF_MAP_SUPPORT')){
  const origin=[...world.querySelectorAll('[data-counter]')].find(e=>source.known&&e.dataset.counter===source.source_id)??[...world.querySelectorAll('[data-location]')].find(e=>e.dataset.location===source.origin)?.querySelector('.terrain-header');
  if(!origin)continue;const p=point(origin),line=document.createElementNS(ns,'path');
  const dx=target[0]-p[0],dy=target[1]-p[1],length=Math.hypot(dx,dy)||1,end=[target[0]-dx/length*16,target[1]-dy/length*16],a=Math.atan2(dy,dx);
  line.setAttribute('d',`M${p[0]},${p[1]} L${end[0]},${end[1]} M${end[0]-12*Math.cos(a-.5)},${end[1]-12*Math.sin(a-.5)} L${end[0]},${end[1]} L${end[0]-12*Math.cos(a+.5)},${end[1]-12*Math.sin(a+.5)}`);
  line.setAttribute('class',sameCombatSource(source,current.strongest)?'combat-primary-path':'combat-additional-path');svg.append(line);
 }
}
