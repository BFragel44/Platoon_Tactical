// Camera state is presentation only: never passed to the simulation.
export function normalizeCamera(value={}) {
  const number=(n,fallback)=>Number.isFinite(n)?n:fallback;
  return {zoom:Math.max(.5,Math.min(1.5,number(value?.zoom,1))),left:Math.max(0,number(value?.left,0)),top:Math.max(0,number(value?.top,0))};
}
export function zoomCamera(camera,zoom,width,height) {
  const old=normalizeCamera(camera),next=normalizeCamera({...old,zoom}),ratio=next.zoom/old.zoom;
  return {...next,left:Math.max(0,(old.left+width/2)*ratio-width/2),top:Math.max(0,(old.top+height/2)*ratio-height/2)};
}
export function mapPoint(rect,frame,zoom) {
  return [(rect.left-frame.left+rect.width/2)/zoom,(rect.top-frame.top+rect.height/2)/zoom];
}
export function mapControls() {
  return `<div class="map-controls" role="group" aria-label="Battlefield view controls"><button id="clear-selection" title="Clear inspection and LOS dimming; undiscovered terrain stays hidden">Reset LOS</button><div class="zoom-controls"><button id="zoom-out" aria-label="Zoom out">−</button><output id="zoom-level" aria-live="polite">100%</output><button id="zoom-in" aria-label="Zoom in">+</button><button id="zoom-reset">Reset zoom</button></div><button id="focus-unit" title="Center the selected formation's terrain card">Find unit</button><label class="command-layer-toggle"><input type="checkbox" id="command-links"> Command links</label><button id="show-orders" class="mobile-map-link">Orders ↓</button></div>`;
}
export function bindMapViewport(root,{camera,columns=4,selectedLocation,selectedUnit,onChange,onLayout}) {
  const viewport=root.querySelector('.map-viewport'),canvas=root.querySelector('.map-canvas'),world=root.querySelector('.map-layer');
  let current=normalizeCamera(camera),timer=null;
  const save=()=>{clearTimeout(timer);timer=setTimeout(()=>onChange({...current},true),250);};
  const layout=()=>{
    onChange({...current},false);
    const cardWidth=Math.max(220,(viewport.clientWidth-32-30)/4);
    world.style.width=`${columns*cardWidth+(columns-1)*10}px`;
    world.style.transform=`scale(${current.zoom})`;
    canvas.style.width=`${Math.ceil(world.offsetWidth*current.zoom)}px`;
    canvas.style.height=`${Math.ceil(world.offsetHeight*current.zoom)}px`;
    root.querySelector('#zoom-level').textContent=`${Math.round(current.zoom*100)}%`;
    root.querySelector('#zoom-out').disabled=current.zoom<=.5;
    root.querySelector('#zoom-in').disabled=current.zoom>=1.5;
    viewport.scrollLeft=current.left;viewport.scrollTop=current.top;
    onLayout();
  };
  const scroll=()=>{current={...current,left:viewport.scrollLeft,top:viewport.scrollTop};onChange({...current},false);save();};
  const zoom=value=>{current=zoomCamera(current,value,viewport.clientWidth,viewport.clientHeight);layout();scroll();};
  root.querySelector('#zoom-in').onclick=()=>zoom(Math.round((current.zoom+.1)*10)/10);
  root.querySelector('#zoom-out').onclick=()=>zoom(Math.round((current.zoom-.1)*10)/10);
  root.querySelector('#zoom-reset').onclick=()=>zoom(1);
  const focus=root.querySelector('#focus-unit');focus.disabled=!selectedLocation;
  focus.onclick=()=>{const card=[...world.querySelectorAll('[data-unit]')].find(c=>c.dataset.unit===selectedUnit)??[...world.querySelectorAll('[data-location]')].find(c=>c.dataset.location===selectedLocation);if(!card)return;const a=card.getBoundingClientRect(),b=world.getBoundingClientRect();current.left=Math.max(0,a.left-b.left+a.width/2-viewport.clientWidth/2);current.top=Math.max(0,a.top-b.top+a.height/2-viewport.clientHeight/2);layout();scroll();};
  root.querySelector('#show-orders').onclick=()=>{root.querySelector('.company-orders').scrollIntoView({block:'start'});root.querySelector('#unit').focus({preventScroll:true});};
  layout();viewport.addEventListener('scroll',scroll,{passive:true});
  const observer=new ResizeObserver(layout);observer.observe(viewport);observer.observe(root.querySelector('.company-map'));
  return ()=>{clearTimeout(timer);observer.disconnect();viewport.removeEventListener('scroll',scroll);};
}
