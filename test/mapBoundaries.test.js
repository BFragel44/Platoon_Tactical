import {it,expect} from 'vitest';
import {mapBoundaryLayout} from '../src/ui/mapBoundaries.js';
const locations=[3,2,1,0].flatMap(row=>[1,2].map(col=>({row,col})));
it('places phase lines below their destination rows and above the crossed-from rows',()=>{
 const layout=mapBoundaryLayout({locations,phase_lines:{1:1,2:2}});
 expect(layout.boundaries.map(b=>[b.row,b.gridRow])).toEqual([[2,3],[1,5]]);
 expect(layout.cardStyle({row:2,col:1})).toBe('grid-column:1;grid-row:2');
 expect(layout.cardStyle({row:1,col:1})).toBe('grid-column:1;grid-row:4');
 expect(layout.cardStyle({row:0,col:1})).toBe('grid-column:1;grid-row:6');
});
it('combines coincident phase and patrol lines without overlapping grid rows',()=>{
 const layout=mapBoundaryLayout({locations,phase_lines:{1:2,2:2},patrol:{}});
 expect(layout.boundaries).toHaveLength(1);expect(layout.boundaries[0].label).toContain('Phase Line 1');expect(layout.boundaries[0].label).toContain('Phase Line 2');expect(layout.boundaries[0].label).toContain('MLR');
});
it('retains explicit placement for expanded terrain and has no lines without assignments',()=>{
 const layout=mapBoundaryLayout({locations:[{row:5,col:-1},{row:1,col:1}]});
 expect(layout.boundaries).toEqual([]);expect(layout.cardStyle({row:1,col:1})).toBe('grid-column:3;grid-row:5');
});
