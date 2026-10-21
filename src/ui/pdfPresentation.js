// Each direction keeps to its right-hand lane. Reversing direction therefore
// draws on the other side of the same route, including partly shared routes.
// Coordinates are map-space; lane separation stays readable at any zoom.
export function offsetPdfPoints(points,zoom=1){
 if(points.length<2)return points;
 const [x,y]=points[0],[endX,endY]=points.at(-1),dx=endX-x,dy=endY-y,length=Math.hypot(dx,dy);
 if(!length)return points;
 const distance=9/Math.max(.1,zoom),offsetX=-dy/length*distance,offsetY=dx/length*distance;
 return points.map(([px,py])=>[px+offsetX,py+offsetY]);
}
