import {it,expect} from 'vitest';
import {cardCasualtyList} from '../src/ui/casualtyPresentation.js';
it('groups casualty stacks in a closed list with side counts and preserves pickup details',()=>{
 const location={id:'card',covers:[{id:'fox',type:'Foxholes',known:true}]};
 const view={locations:[location],casualties:[{location:'card',label:'Squad casualty',cover:'fox'},{location:'card',label:'Carried casualty',carrier_name:'Team 1'},{location:'card',label:'Evacuated',evacuated:true}],enemy_casualties:[{location:'card',label:'Enemy casualty'}]};
 const html=cardCasualtyList(view,location);
 expect(html).toContain('Casualties (3)');expect(html).toContain('2 friendly · 1 enemy');
 expect(html).not.toMatch(/<details[^>]*\bopen\b/);expect(html).toContain('C1 - Foxholes');expect(html).toContain('Carried by Team 1');
 expect(html).not.toContain('Evacuated');expect(html).toContain('Enemy casualty');
});
it('omits empty cards',()=>expect(cardCasualtyList({locations:[]},{id:'empty'})).toBe(''));
