// Printed sides AND corners, clockwise. N points toward increasing map row.
export const DIRECTIONS = ['N','NE','E','SE','S','SW','W','NW'];
export const borders = (open = []) => Object.fromEntries(DIRECTIONS.map(d => [d, open.includes(d) ? 'white' : 'dark']));
export const direction = (dr, dc) => dr > 0 ? (dc > 0 ? 'NE' : dc < 0 ? 'NW' : 'N') : dr < 0 ? (dc > 0 ? 'SE' : dc < 0 ? 'SW' : 'S') : dc > 0 ? 'E' : 'W';
export const whiteBorder = (l, dr, dc) => l.borders?.[direction(dr,dc)] === 'white';
export const terrainProtection = (target, origin) => target.open_protection !== undefined &&
  (target.id === origin.id || whiteBorder(target, origin.row-target.row, origin.col-target.col)) ? target.open_protection : target.protection;
// Sheet coordinates are one-based row/column in the supplied Normandy scans.
export const TERRAIN_SOURCES = {
 open: {sheet:1,row:1,column:1}, marsh:{sheet:1,row:3,column:6},
 woods:{sheet:1,row:1,column:3}, orchard:{sheet:1,row:2,column:2},
 gullyEW:{sheet:1,row:1,column:5}, gullyNS:{sheet:1,row:3,column:7},
 hill:{sheet:1,row:1,column:2},
};
