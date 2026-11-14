// Una cláusula propia se escribe directamente en el estado que se persiste,
// sin efectos tardíos que puedan sobrescribir un borrador restaurado.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
const dom=new JSDOM('<html><body><div id="root"></div></body></html>',{url:'http://localhost'});
for(const k of ['window','document','HTMLElement','HTMLInputElement','HTMLTextAreaElement','CustomEvent','Event','Node','localStorage'])global[k]=dom.window[k];
global.IS_REACT_ACT_ENVIRONMENT=true;
global.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setTimeout(()=>this.port1.onmessage?.({}),0)}}};
HTMLElement.prototype.scrollIntoView=function(){};window.scrollTo=function(){};
const dir=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'dw-clausula-draft-'));
const source=fs.readFileSync(path.join(dir,'src/App.tsx'),'utf8');
require('esbuild').buildSync({stdin:{contents:source+'\nimport {act,createElement} from "react";import {createRoot} from "react-dom/client";export {StepClausulas,useState,act,createElement,createRoot,EMPTY_OP};',resolveDir:path.join(dir,'src'),loader:'tsx'},bundle:true,jsx:'automatic',platform:'node',format:'cjs',outfile:path.join(tmp,'app.cjs')});
const a=require(path.join(tmp,'app.cjs')),root=a.createRoot(document.getElementById('root'));
let current,setCurrent,confirmed,checks=0;
window.addEventListener('dw:confirm',event=>{confirmed=event.detail?.onConfirm});
function Caso(){
 const [data,setData]=a.useState({...a.EMPTY_OP,tipo:'reserva',clausulas_custom_titulo:'Título guardado',clausulas_custom:'Texto guardado'});
 current=data;setCurrent=setData;
 return a.createElement(a.StepClausulas,{data,onChange:(key,value)=>setData(d=>({...d,[key]:value})),clausulas:[],perfil:{rol:'dueno',plantillas:{}},faltantes:[]});
}
function title(){return document.querySelector('input[placeholder="Ej.: Prohibición de mascotas"]')}
function body(){return document.querySelector('textarea[placeholder="Escribí la cláusula…"]')}
async function fill(el,value){
 assert.ok(el,'No se encontró el control de cláusula propia');
 await a.act(async()=>{
  const proto=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto,'value').set.call(el,value);
  el.dispatchEvent(new Event('input',{bubbles:true}));
 });
}
(async()=>{
 try{
  await a.act(async()=>root.render(a.createElement(Caso)));
  assert.equal(title().value,'Título guardado');assert.equal(body().value,'Texto guardado');checks+=2;
  await fill(title(),'Entrega recién pintada');
  assert.equal(current.clausulas_custom_titulo,'Entrega recién pintada');checks++;
  await fill(body(),'El inmueble se entrega recién pintado, incluyendo interiores.');
  assert.equal(current.clausulas_custom,'El inmueble se entrega recién pintado, incluyendo interiores.');checks++;
  assert.equal(JSON.parse(JSON.stringify(current)).clausulas_custom,current.clausulas_custom);checks++;
  await a.act(async()=>setCurrent(d=>({...d,clausulas_custom_titulo:'Título desde servidor',clausulas_custom:'Texto del borrador recuperado'})));
  assert.equal(title().value,'Título desde servidor');assert.equal(body().value,'Texto del borrador recuperado');checks+=2;
  await a.act(async()=>[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Ocultar editor')).click());
  assert.equal(current.clausulas_custom,'Texto del borrador recuperado');checks++;
  const reabrir=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Editar mi cláusula'));
  assert.ok(reabrir,'Debe poder reabrirse sin borrar el contenido');checks++;
  await a.act(async()=>reabrir.click());
  assert.equal(body().value,'Texto del borrador recuperado');checks++;
  const eliminar=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Eliminar mi cláusula');
  await a.act(async()=>eliminar.click());
  assert.equal(typeof confirmed,'function','Borrar pide confirmación');checks++;
  await a.act(async()=>confirmed());
  assert.equal(current.clausulas_custom_titulo,'');assert.equal(current.clausulas_custom,'');checks+=2;
  console.log('APROBADAS '+checks+' comprobaciones: borrador inmediato, restauración, ocultación y borrado confirmado.');
 }finally{await a.act(async()=>root.unmount());dom.window.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
