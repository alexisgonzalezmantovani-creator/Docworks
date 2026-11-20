'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist'),landing=path.join(root,'landing');
const appHtml=path.join(dist,'index.html');
if(!fs.existsSync(appHtml)||!fs.existsSync(path.join(landing,'index.html')))throw new Error('Falta la compilación o landing/index.html');
const html=fs.readFileSync(appHtml,'utf8');
if(!html.includes('/assets/'))throw new Error('Dist no contiene la app compilada');
for(const route of ['login','app']){const dir=path.join(dist,route);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'index.html'),html);}
function copy(from,to){fs.mkdirSync(to,{recursive:true});for(const e of fs.readdirSync(from,{withFileTypes:true})){if(e.name==='vercel.json')continue;const src=path.join(from,e.name),dst=path.join(to,e.name);if(e.isDirectory()){copy(src,dst);continue;}if(!e.isFile())continue;if(e.name==='captcha-config.js'&&fs.existsSync(dst)&&fs.readFileSync(src,'utf8')!==fs.readFileSync(dst,'utf8'))throw new Error('Difieren las configuraciones de CAPTCHA');fs.copyFileSync(src,dst);}}
copy(landing,dist);
if(fs.readFileSync(path.join(dist,'index.html'),'utf8')===html)throw new Error('No se publicó la landing.');
for(const r of ['login','app'])if(!fs.existsSync(path.join(dist,r,'index.html')))throw new Error('Falta /'+r+'/');
console.log('DocWorks: landing /, login /login/, PWA /app/.');
