const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require('playwright');
const engine=process.argv.includes('--webkit')?'webkit':'chromium';
const html=fs.readFileSync(path.resolve(__dirname,'../landing/index.html'));
const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await (engine==='webkit'?webkit:chromium).launch({headless:true,...(engine==='chromium'?{args:['--no-sandbox']}: {})});
  const page=await browser.newPage();
  await page.route('**/*',route=>route.request().url().startsWith('http://127.0.0.1:')?route.continue():route.abort());
  for(const width of [320,360,375,390,430,540,640,768,820,860,1024,1440]){
   await page.setViewportSize({width,height:844});await page.goto('http://127.0.0.1:'+server.address().port);
   const measure=()=>page.evaluate(()=>({viewport:document.documentElement.clientWidth,page:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('body *')].filter(e=>!e.closest('.track')&&e.getBoundingClientRect().width>0&&(e.getBoundingClientRect().right>innerWidth+1||e.getBoundingClientRect().left< -1)).map(e=>e.className||e.tagName)}));
   let m=await measure();assert.ok(m.page<=m.viewport+1,`${engine} ${width}px: página desborda ${JSON.stringify(m)}`);assert.deepEqual(m.overflow,[],`${engine} ${width}px: elemento fuera de pantalla`);
   if(width<=860)assert.equal(await page.locator('.hero .wrap').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length),1);
   await page.locator('#signup-name').fill('Inmobiliaria con un nombre extenso para verificar los controles');await page.locator('#signup-email').fill('correo.muy.largo.para.prueba@example.invalid');
   m=await measure();assert.ok(m.page<=m.viewport+1,`${engine} ${width}px: formulario desborda`);
   assert.match(await page.locator('#registro').innerText(),/durante un mes/);assert.ok(!(await page.locator('body').innerText()).includes('14 días'));
   console.log(`OK ${engine} landing ${width}px: sin desborde, formulario y prueba de un mes`);
  }
  for(const viewport of [{width:844,height:390},{width:1180,height:820}]){
   await page.setViewportSize(viewport);await page.goto('http://127.0.0.1:'+server.address().port);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),`${engine} horizontal ${viewport.width}x${viewport.height}`);
   console.log(`OK ${engine} landing horizontal ${viewport.width}x${viewport.height}`);
  }
  // Gallery keeps its own horizontal scroll without widening the document.
  assert.ok(await page.locator('#track').evaluate(e=>e.scrollWidth>e.clientWidth));
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
