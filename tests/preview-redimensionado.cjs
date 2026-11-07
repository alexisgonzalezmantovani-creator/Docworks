const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
const dom=new JSDOM('<html><body><div id="root"></div></body></html>',{url:'https://example.invalid'});
for(const k of ['window','document','HTMLElement','Node','Event'])global[k]=dom.window[k];global.IS_REACT_ACT_ENVIRONMENT=true;
let resize,width=480,renders=0,cancelados=0,desconectado=false,nextId=0;const frames=new Map();
global.requestAnimationFrame=fn=>{const id=++nextId;frames.set(id,fn);return id};global.cancelAnimationFrame=id=>frames.delete(id);
global.ResizeObserver=class{constructor(fn){resize=fn}observe(){}disconnect(){desconectado=true}};
Object.defineProperty(HTMLElement.prototype,'clientWidth',{get:()=>width});HTMLElement.prototype.getBoundingClientRect=()=>({top:100});dom.window.HTMLCanvasElement.prototype.getContext=()=>({});
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'dw-resize-'));
require('esbuild').buildSync({stdin:{contents:fs.readFileSync(path.resolve(__dirname,'../src/VistaPreviaAspecto.tsx'),'utf8')+'\nimport {act,createElement} from "react";import {createRoot} from "react-dom/client";export {act,createElement,createRoot,HojaPDF};',resolveDir:path.resolve(__dirname,'../src'),loader:'tsx'},bundle:true,jsx:'automatic',platform:'node',format:'cjs',outfile:tmp+'/ui.cjs'});
const a=require(tmp+'/ui.cjs'),root=a.createRoot(document.getElementById('root'));let n=0;const check=(s,f)=>{f();n++;console.log('OK',s)};
const pdf={getPage:async()=>({getViewport:({scale})=>({width:595*scale,height:842*scale}),render:()=>{renders++;return {promise:Promise.resolve(),cancel(){cancelados++}}}})};
async function frame(){await a.act(async()=>{const items=[...frames.values()];frames.clear();for(const fn of items)fn();await Promise.resolve();await Promise.resolve();});}
(async()=>{
 await a.act(async()=>root.render(a.createElement(a.HojaPDF,{documento:pdf,pagina:1})));
 check('medición inicial se difiere al siguiente frame',()=>assert.equal(renders,0));await frame();check('primera medida dibuja la hoja',()=>assert.equal(renders,1));
 await a.act(async()=>{resize();resize();resize();});check('agrupa notificaciones en un frame',()=>assert.equal(frames.size,1));await frame();check('altura del canvas no provoca otro dibujo',()=>assert.equal(renders,1));
 width=520;await a.act(async()=>resize());await frame();check('nuevo ancho vuelve a dibujar',()=>assert.equal(renders,2));
 await a.act(async()=>{resize();root.unmount()});check('desmontar cancela callbacks pendientes y observer',()=>{assert.equal(frames.size,0);assert.equal(desconectado,true);assert.ok(cancelados>0)});
 dom.window.close();console.log('APROBADAS '+n+' comprobaciones de redimensionado sin ciclos.');process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});
