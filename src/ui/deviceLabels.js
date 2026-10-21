// Presentation only: network IDs remain unchanged in controls and saved data.
export function deviceLabel(network){
 return ({CO_PHONE:'EE8 field phone (CO TAC)',CO:'CO TAC radio',BN:'BN TAC radio',ARTY:'Artillery radio',MTR:'Mortar radio'})[network]??`${String(network).replaceAll('_',' ')} radio/phone`;
}
export function deviceText(text){
 return String(text??'').replace(/\bCO_PHONE(?: radio(?:\/phone)?s?)?\b/g,deviceLabel('CO_PHONE'));
}
