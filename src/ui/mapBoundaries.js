// Phase-line row is the destination row of the existing XPL order.
export function mapBoundaryLayout(view){
 const locations=view.locations??[],maxRow=Math.max(0,...locations.map(l=>l.row)),minCol=locations.length?Math.min(...locations.map(l=>l.col)):1;
 const groups=new Map();
 const add=(row,label)=>{if(!groups.has(row))groups.set(row,[]);groups.get(row).push(label);};
 for(const [id,row] of Object.entries(view.phase_lines??{}))if(Number.isInteger(row)&&row>=1&&row<=maxRow)add(row,`Phase Line ${id}`);
 if(view.patrol)add(2,'MLR · Main Line of Resistance · cross from Row 2 to Row 1 to return');
 const rows=[...groups.keys()].sort((a,b)=>b-a);
 const before=row=>rows.filter(r=>r>row).length;
 return {
  boundaries:rows.map(row=>({row,gridRow:maxRow-row+2+before(row),label:groups.get(row).join(' | ')})),
  cardStyle:location=>`grid-column:${location.col-minCol+1};grid-row:${maxRow-location.row+1+before(location.row)}`,
 };
}
