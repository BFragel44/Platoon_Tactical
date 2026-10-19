import {it,expect} from 'vitest';
import {previewMissionSetup} from '../src/sim/company/engine.js';
import {SIGNAL_KEYS} from '../src/sim/company/missionSetup.js';
import {cerisy} from '../src/scenarios/cerisy.js';
import {stGeorges} from '../src/scenarios/stGeorges.js';
import {setupMarkup,setupMapObjectives} from '../src/ui/missionSetup.js';
import {deploymentMapMarkup} from '../src/ui/commandDesk.js';

it('shows the patrol primary objective and return requirement without secondary or attack aliases',()=>{
 const preview=previewMissionSetup(stGeorges,'patrol-objectives'),before=structuredClone(preview),html=setupMarkup(preview);
 expect(html).toContain('Primary Objective:');expect(html).toContain('Cross the MLR');
 expect(html).not.toContain('Secondary Objective:');expect(html).not.toContain('>Secondary<');expect(html).not.toContain('>Attack<');
 expect(setupMapObjectives(preview)).not.toHaveProperty('secondary');expect(setupMapObjectives(preview)).not.toHaveProperty('attack');
 expect(preview).toEqual(before);
});

it('places visible signal orders within tactical controls and preserves preview data',()=>{
 const preview=previewMissionSetup(cerisy,'report-layout'),before=structuredClone(preview),html=setupMarkup({...preview,briefing:cerisy.briefing},true);
 expect(html).not.toContain('Unrevealed terrain');
 expect(html).not.toContain('Mission record');expect(html).not.toContain('Deployment notes');
 expect(html).toContain('Primary Objective:');expect(html).toContain('Secondary Objective:');expect(html).toContain(cerisy.briefing);
 expect(html.indexOf('Pyrotechnic signal orders')).toBeLessThan(html.indexOf('setup-public-map'));
 for(const key of SIGNAL_KEYS)expect(html).toContain(`name="signal-order-${key}"`);
 expect(preview).toEqual(before);
});

it('shares tactical boundary placement and combines coincident lines without revealing terrain',()=>{
 const locations=[{id:'r2c1',row:2,col:1,name:'Secret woods',known:false},{id:'r1c1',row:1,col:1,name:'Farm',known:true}];
 const html=deploymentMapMarkup({locations,phaseLines:{1:2},mlr:[1,2],objectives:{primary:{location:'r2c1'}}});
 expect(html).toContain('Phase Line 1 | MLR');expect(html).toContain('Primary');expect(html).not.toContain('Secret woods');
 expect(html.match(/class="desk-map-line"/g)).toHaveLength(1);
});
