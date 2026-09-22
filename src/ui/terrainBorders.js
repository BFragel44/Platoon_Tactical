import {DIRECTIONS} from '../sim/company/terrain.js';
const paths={N:'M12 2H88',NE:'M88 2H98V12',E:'M98 12V88',SE:'M98 88V98H88',S:'M88 98H12',SW:'M12 98H2V88',W:'M2 88V12',NW:'M2 12V2H12'};
export function terrainBorders(location) {
 if(location.staging)return '';
 const description=DIRECTIONS.map(d=>`${d}: ${location.borders[d]}`).join('; ');
 return `<svg class="terrain-los-border" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="LOS borders: ${description}"><title>LOS borders: ${description}</title>${DIRECTIONS.map(d=>`<path data-direction="${d}" class="los-edge ${location.borders[d]}" d="${paths[d]}" vector-effect="non-scaling-stroke"/>`).join('')}</svg>`;
}
