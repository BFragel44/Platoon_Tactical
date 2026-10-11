import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,channel:'chrome'}),page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(process.env.QA_URL||'http://localhost:5174');
 for(const id of ['normandy_6','normandy_7']){
  await page.locator('#menu-file').click();await page.locator('#mission-select').selectOption(id);await page.locator('#restart').click();await page.locator('[name="start-mission"]').click();
  if(await page.locator('[data-vehicle]').count()!==(id==='normandy_6'?5:4))throw Error('Vehicle deployment missing');
  await page.reload();if(await page.locator('[data-vehicle]').count()!==(id==='normandy_6'?5:4))throw Error('Vehicle recovery lost');
  await page.locator('#menu-mission').click();await page.locator('#abort').click();
 }
 await page.locator('#menu-file').click();await page.locator('#company-preparation').click();await page.locator('dialog #new').click();await page.locator('dialog #resume').click();await page.locator('[name="start-mission"]').click();
 await page.locator('#menu-mission').click();await page.locator('#abort').click();await page.locator('#result-debrief').click();await page.locator('dialog #debrief').click();
 await page.locator('dialog #close').click();await page.reload();await page.locator('#menu-file').click();await page.locator('#company-preparation').click();
 if(!await page.locator('dialog').innerText().then(t=>t.includes('RECONSTITUTE')))throw Error('Pending preparation did not survive reload');
 for(let i=0;i<3;i++)await page.locator('dialog #next').click();
 if(!await page.locator('dialog').innerText().then(t=>t.includes('Company prepared')))throw Error('Preparation incomplete');
 await page.setViewportSize({width:850,height:900});
 if(!await page.locator('dialog').evaluate(d=>d.scrollWidth<=d.clientWidth+1))throw Error('Preparation overflows narrow viewport');
 await page.screenshot({path:'tmp/vehicle-inline-browser/campaign-prepared.png',fullPage:true});
 if(errors.length)throw Error(errors.join('; '));console.log('Normal M6/M7 selection, switching, recovery and campaign M1 preparation passed.');
}finally{await browser.close();}
