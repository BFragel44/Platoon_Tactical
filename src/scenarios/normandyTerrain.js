import {borders,DIRECTIONS} from '../sim/company/terrain.js';
// One entry per printed card, in sheet/row/column order. Source: supplied
// FoF_Normandy_Terrain_Cards_1..3.png. Hills consume a card, then draw terrain.
const types={
 O:['Open Fields',0,1,2,DIRECTIONS,0], W:['Woods',2,3,4,[],-1],
 R:['Orchard',1,2,3,[],-1], R1:['Orchard',1,1,3,[],-1], M:['Marsh',1,1,2,[],1],
 F:['Farm',2,1,3,[],0], V:['Village',3,3,4,[],0],
 C:['Cemetery',1,1,3,DIRECTIONS,0], T:['Church',3,1,3,[],0],
 GE:['Gully / Draw',2,1,3,['E','W'],0], GN:['Gully / Draw',2,1,3,['N','S'],0],
 HN:['Hedgerow / Bocage',2,2,4,['N','S'],0], HE:['Hedgerow / Bocage',2,2,4,['E','W'],0],
 HS:['Hedgerow / Bocage',2,2,4,['S'],0], HW:['Hedgerow / Bocage',2,2,4,['W'],0], HR:['Hedgerow / Bocage',2,2,4,['E'],0], HES:['Hedgerow / Bocage',2,2,4,['E','S'],0],
 HD:['Hedgerow / Bocage',2,2,4,[],0], H:['Hill',0,0,0,[],0],
};
const sheets=[
 [['O','H','W','HN','GE','O','HD','F'],['H','R','W','R','F*','O','R','F'],['R','V*','W','V','HD','M','GN','M']],
 [['C','F','W','W','GN','HS','W','H'],['HN','V*','R','R1','O','R','HS','T'],['R','W','F','GE','HES','H','HD','H']],
 [['W','HW','HR','HW','HR','H','V']],
];
export const normandyTerrain=sheets.flatMap((rows,sheet)=>rows.flatMap((row,r)=>row.map((code,c)=>{
 const key=code.replace('*',''),[name,protection,cover_limit,cover_draw,open,burst]=types[key];
 return {id:`normandy_${sheet+1}_${r+1}_${c+1}`,terrain:key==='H'?'hill':({O:'open',W:'woods',R:'orchard',R1:'orchard',M:'marsh',F:'farm',V:'village',C:'cemetery',T:'church'})[key]??(key.startsWith('G')?'gully':'hedgerow'),name,protection,cover_limit,cover_draw,borders:borders(open),burst,
 ...(key.startsWith('G')||key.startsWith('H')&&!['H','HD'].includes(key)?{open_protection:1}:{}),multi_story:code.includes('*'),tower:key==='T',building:['F','V','C','T'].includes(key),terrain_source:{sheet:sheet+1,row:r+1,column:c+1}};
})));
