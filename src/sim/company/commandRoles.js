export const companyCommander=s=>Object.values(s.units).find(u=>u.command_role==='company_commander')??s.units.co;
export const isCompanyCommander=u=>u?.command_role?u.command_role==='company_commander':u?.id==='co';
export const canActivateSubordinates=u=>u?.capabilities?.activate_subordinates??isCompanyCommander(u);
export const canCommandCompany=u=>u?.capabilities?.company_orders??(isCompanyCommander(u)||u?.kind==='STAFF');
export const commandHub=s=>Object.values(s.units).find(u=>u.command_role==='company_commander')??s.units.co;
// Legacy course/KUTF identifiers remain inside this compatibility adapter.
export const successionPriority=u=>u?.capabilities?.succession_priority??(u?.id==='xo'?-1:u?.kind==='HQ'?0:u?.id==='artyfo'?1:u?.kind==='STAFF'?2:99);
