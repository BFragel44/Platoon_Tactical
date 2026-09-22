// CAC final run: Basic Training pp. 34, 48, 50. Coordinates are terrain cards.
const terrain = {
  open: { name: 'Open Fields', protection: 0, cover_draw: 2, cover_limit: 1, borders: 'all', burst: 0 },
  marsh: { name: 'Marsh', protection: 1, cover_draw: 2, cover_limit: 1, borders: 'none', burst: 1 },
  woods: { name: 'Woods', protection: 2, cover_draw: 4, cover_limit: 3, borders: 'none', burst: -1 },
  orchard: { name: 'Orchard', protection: 1, cover_draw: 3, cover_limit: 2, borders: 'none', burst: -1 },
  gullyEW: { name: 'Gully · east/west', protection: 2, open_protection: 1, cover_draw: 3, cover_limit: 1, borders: 'EW', burst: 0 },
  gullyNS: { name: 'Gully · north/south', protection: 2, open_protection: 1, cover_draw: 3, cover_limit: 1, borders: 'NS', burst: 0 },
};
const rows = [['open','marsh','woods','open'], ['gullyEW','orchard','open','gullyNS'], ['woods','orchard','woods','woods']];
const locations = [];
for (let row = 0; row <= 3; row++) for (let col = 1; col <= 4; col++) {
  const type = row ? rows[row-1][col-1] : 'open';
  const hill = (row === 2 && col === 3) || (row === 3 && [1,4].includes(col));
  locations.push({ ...terrain[type], id: `r${row}c${col}`, row, col, terrain: type,
    name: row ? `${row}.${col} ${terrain[type].name}${hill ? ' / Hill' : ''}` : `Staging ${col}`,
    elevation: hill ? 2 : 1, borders: hill ? 'none' : terrain[type].borders, staging: row === 0, ...(row===0?{cover_limit:0,cover_draw:0}: {}) });
}
const units = [];
function add(id, name, kind, platoon, location, steps, vof, range, radios = []) {
  units.push({ id, name, kind, platoon, location, steps, vof, range, radios, experience: 'Line', faction: 'friendly' });
}
add('co','Company HQ','HQ',null,'r0c2',1,null,0,['BN','CO']);
add('staff','First Sergeant','STAFF',null,'r0c2',1,null,0);
for (let p = 1; p <= 2; p++) {
  const loc = `r0c${p === 1 ? 1 : 3}`;
  add(`hq${p}`,`${p} Platoon HQ`,'HQ',p,loc,1,null,0,['CO']);
  for (let q = 1; q <= 3; q++) add(`s${p}${q}`,`${q}/${p} Rifle Squad`,'SQUAD',p,loc,3,'S',2);
  add(`mg${p}`,`${p}/LMG`,'MG',p,loc,2,'A',2);
  add(`at${p}`,`${p}/Bazooka`,'AT',p,loc,1,'G',1);
}
add('mortar','Mortar Section','MORTAR',null,'r0c2',2,'H',3,['CO']);
add('mtrfo','Mortar Observer','FO',1,'r0c1',1,null,0,['MTR']);
add('artyfo','Artillery Observer','FO',2,'r0c3',1,null,0,['ARTY']);
export const companyAssault = {
  id: 'company_assault', ruleset: 'company-v1', version: 3, turn_limit: 10, locations, units,
  briefing: 'Clear all eight potential contacts and eliminate or capture the defenders by the end of turn 10. Activate your platoon HQs, maintain communications, establish supporting fire and close with spotted positions. Ammunition and fire missions are unrestricted for this validation exercise.',
  contacts: locations.filter(l => [1,2].includes(l.row)).map(l => ({ id: `pc_${l.id}`, location: l.id, type: l.row === 1 ? 'A' : 'B', resolved: false })),
  // Explicit validation additions to CAC: staff, screening smoke and two agreed signals.
  assets: { co: { smoke: 2, advance: 1, cease: 1 }, hq1: { smoke: 1 }, hq2: { smoke: 1 } },
  signal_phase_line: 2,
};
