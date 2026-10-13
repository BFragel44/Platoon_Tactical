import {it,expect} from 'vitest';
import {experienceAwards,freshExperienceAwards} from '../src/ui/experienceNotifications.js';
it('shows recorded amounts and tasks with the correct company or patrol pool',()=>{
 const view={achievements:[{key:'primary',points:5,text:'primary objective secured',turn:10},{key:'route_2_1',points:1,text:'Patrol route point visited',platoon:2,turn:3}]};
 expect(experienceAwards(view)).toEqual([{id:'primary',points:5,task:'primary objective secured',recipient:'Company',pool:'Company',turn:10},{id:'route_2_1',points:1,task:'Patrol route point visited',recipient:'2 Platoon',pool:'2 Platoon',turn:3}]);
});
it('names the public grenade actor while retaining the pooled XP distinction',()=>{
 const view={units:[{id:'s11',name:'1/1 Rifle Squad'}],achievements:[{key:'grenade_event_4',points:1,text:'Successful point-blank grenade attack',turn:2}]};
 const awards=experienceAwards(view,[{id:'event_4',actor:'s11'}]);expect(awards[0].recipient).toBe('1/1 Rifle Squad');expect(awards[0].pool).toBe('Company');
 expect(freshExperienceAwards(awards,['grenade_event_4'])).toEqual([]);expect(freshExperienceAwards(awards,[])).toEqual(awards);
});
it('does not invent awards from objectives, hidden actors, or zero-point records',()=>{
 const view={objectives:{primary:{secured:true}},achievements:[{key:'zero',points:0}]};expect(experienceAwards(view)).toEqual([]);
});
