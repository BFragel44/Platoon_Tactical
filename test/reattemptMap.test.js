import {it,expect} from 'vitest';
import {preparationMapLocations,deploymentMapMarkup} from '../src/ui/commandDesk.js';
it('places public living enemies on their card and omits removed and eliminated units',()=>{
 const locations=[{id:'card',row:1,col:1,name:'1.1 Farm',known:true}];
 const enemies=[{id:'mg',location:'card',name:'German HMG',steps:1,pinned:true},{id:'dead',location:'card',name:'Eliminated',steps:0},{id:'gone',location:'card',name:'Withdrawn',steps:1,removed:'WITHDRAWN'}];
 const html=deploymentMapMarkup({locations,enemies});
 expect(html).toContain('German HMG');expect(html).toContain('1 step · PINNED');
 expect(html).not.toContain('Eliminated');expect(html).not.toContain('Withdrawn');
 expect(deploymentMapMarkup({locations})).not.toContain('desk-enemy-counter');
});
it('keeps only original battlefield bounds and staging in preparation maps',()=>{
 const locations=[{id:'main',row:4,col:5},{id:'left',row:4,col:0},{id:'right',row:3,col:6},{id:'above',row:5,col:2},{id:'stage',row:0,col:1,staging:true}];
 expect(preparationMapLocations(locations,{rows:4,columns:5}).map(l=>l.id)).toEqual(['main','stage']);
 expect(locations).toHaveLength(5);
});
it('marks confirmed mines even on disabled cards without exposing unknown hazards',()=>{
 const locations=[{id:'known',row:1,col:1,name:'1.1 Farm',known:true,mines:true},{id:'secret',row:1,col:2,name:'Hidden',known:false,mines:true},{id:'path',row:1,col:3,name:'1.3 Woods',known:true,mine_path_marked:true}];
 const html=deploymentMapMarkup({locations});
 expect(html.match(/class="desk-mine-warning"/g)).toHaveLength(1);
 expect(html).toContain('confirmed minefield');expect(html).toContain('Mine path marked');
 expect(html).not.toContain('Hidden');expect(html).toContain('disabled');
});
