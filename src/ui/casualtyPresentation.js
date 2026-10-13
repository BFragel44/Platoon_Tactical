export function casualtyEvacuationStatus(view,casualty){
 if(casualty.evacuated)return 'Evacuated';
 if(casualty.carrier_name)return 'Carried by '+casualty.carrier_name;
 if(casualty.location===view.objectives?.ccp)return casualty.transported?'At CCP · awaiting cleanup evacuation':'At CCP · transport and drop-off still required';
 return 'Awaiting pickup';
}
