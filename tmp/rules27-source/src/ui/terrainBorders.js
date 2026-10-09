import {DIRECTIONS} from '../sim/company/terrain.js';
export function terrainBorders(location) {
 if(location.staging||location.known===false||!location.borders)return '';
 const description=DIRECTIONS.map(d=>`${d}: ${location.borders[d]}`).join('; ');
 return `<div class="terrain-los-border" role="img" aria-label="LOS borders: ${description}" title="LOS borders: ${description}">${DIRECTIONS.map(d=>`<span data-direction="${d}" class="los-edge ${location.borders[d]}" aria-hidden="true"></span>`).join('')}</div>`;
}
