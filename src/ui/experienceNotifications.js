// Public awards only. XP belongs to the company/patrol pool, not an invented individual balance.
export function experienceAwards(view,events=[]){
 return (view.achievements??[]).filter(a=>a.points>0).map(a=>{
  const pool=a.platoon?`${a.platoon} Platoon`:'Company';
  const event=a.key.startsWith('grenade_')?events.find(e=>e.id===a.key.slice(8)):null;
  const actor=view.units?.find(u=>u.id===event?.actor);
  return {id:a.key,recipient:actor?.name??pool,pool,task:a.text,points:a.points,turn:a.turn};
 });
}
export function freshExperienceAwards(awards,seen){return awards.filter(a=>!seen.includes(a.id));}

export function createExperienceNotifications(){
 const queue=[];let current=null,timer=null;
 const host=document.createElement('div');host.className='experience-notifications';document.body.append(host);
 const clear=()=>{clearTimeout(timer);host.replaceChildren();current=null;};
 const show=()=>{
  if(current||!queue.length)return;
  current=queue.shift();const award=current;
  const card=document.createElement('section');card.className='experience-notification';card.setAttribute('role','status');card.setAttribute('aria-live','polite');
  const title=document.createElement('strong');title.textContent=`+${award.points} XP · ${award.recipient}`;
  const task=document.createElement('p');task.textContent=award.task;
  const detail=document.createElement('small');detail.textContent=`Turn ${award.turn} · ${award.pool} experience pool`;
  const dismiss=document.createElement('button');dismiss.type='button';dismiss.textContent='Dismiss';dismiss.setAttribute('aria-label','Dismiss experience notification');
  const next=()=>{clear();show();};dismiss.onclick=next;
  card.append(title,task,detail,dismiss);host.append(card);timer=setTimeout(next,8000);
 };
 return {push:awards=>{queue.push(...awards);show();},reset:()=>{queue.length=0;clear();}};
}
