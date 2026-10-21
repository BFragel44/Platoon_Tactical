import {it,expect} from 'vitest';
import {offsetPdfPoints} from '../src/ui/pdfPresentation.js';
for(const end of [[0,200],[200,0],[200,200],[-200,200]])for(const zoom of [.5,1,1.5])it(`separates reciprocal ${end} fire into parallel lanes at ${zoom} zoom`,()=>{
 const points=[[0,0],end],forward=offsetPdfPoints(points,zoom),reverse=offsetPdfPoints([...points].reverse(),zoom).reverse();
 const gap=Math.hypot(forward[0][0]-reverse[0][0],forward[0][1]-reverse[0][1])*zoom;
 expect(gap).toBeCloseTo(18);
 expect(forward[1][0]-forward[0][0]).toBeCloseTo(end[0]);expect(forward[1][1]-forward[0][1]).toBeCloseTo(end[1]);
 expect(forward[0][0]-reverse[0][0]).toBeCloseTo(forward[1][0]-reverse[1][0]);
 expect(forward[0][1]-reverse[0][1]).toBeCloseTo(forward[1][1]-reverse[1][1]);
 expect(points).toEqual([[0,0],end]);
});
it('keeps partial reciprocal routes in the same directional lanes',()=>{
 const forward=offsetPdfPoints([[0,0],[0,100],[0,200]]),reverse=offsetPdfPoints([[0,200],[0,100]]);
 expect(forward[1][0]).toBe(-9);expect(reverse[1][0]).toBe(9);
});
