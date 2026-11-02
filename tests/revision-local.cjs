const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),os=require('node:os'),cp=require('node:child_process');
const {JSDOM}=require('jsdom'),esbuild=require('esbuild');
const root=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'docworks-revision-'));
const dom=new JSDOM('<!doctype html><html><head></head><body><div id="test"></div></body></html>',{url:'http://localhost'});
for(const k of ['window','document','HTMLElement','HTMLInputElement','HTMLTextAreaElement','CustomEvent','Event','Node','localStorage'])global[k]=dom.window[k];
global.MessageChannel=class {constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setTimeout(()=>this.port1.onmessage&&this.port1.onmessage({data:undefined}),0)};}};
global.IS_REACT_ACT_ENVIRONMENT=true;HTMLElement.prototype.scrollIntoView=function(){};
let invocations=0;global.__revisionMockClient={functions:{invoke:async()=>{invocations++;return {data:{error:'Fallo simulado sin datos reales.'}};}}};
const source=fs.readFileSync(path.join(root,'src/App.tsx'),'utf8');
const exportSource='\nimport {act,createElement} from "react";import {createRoot} from "react-dom/client";export {act,createElement,createRoot,BotIAActivo,EncabezadoEditor,PLANTILLA_TIPOS,SAMPLE_OP_PREVIEW,EMPTY_OP,getDefaultBodyBlocks,buildDocSections,opParaDocumento,docToPlainText};';
function bundle(text,name,mock){if(mock)text=text.replace('dwObtenerSesionRobusta, loadSupabaseJs }','dwObtenerSesionRobusta }')+'\nconst loadSupabaseJs=async()=>globalThis.__revisionMockClient;';const file=path.join(tmp,name+'.cjs');esbuild.buildSync({stdin:{contents:text+exportSource,resolveDir:path.join(root,'src'),loader:'tsx'},bundle:true,jsx:'automatic',platform:'node',format:'cjs',outfile:file});return require(file);}
const app=bundle(source,'candidate',true),base=bundle(cp.execFileSync('git',['show','2f34bbf686ebb60fede542290ff1fc18501dca79:src/App.tsx'],{cwd:root,encoding:'utf8'}),'baseline',true);
for(const tipo of app.PLANTILLA_TIPOS){function text(a){const op=a.opParaDocumento({...a.EMPTY_OP,...a.SAMPLE_OP_PREVIEW,tipo,created_at:'2026-11-02T12:00:00Z'});return a.docToPlainText(a.buildDocSections(op,[],tipo,a.getDefaultBodyBlocks(tipo)));}assert.equal(text(app),text(base),tipo+' conserva texto original');}
const react={createElement:app.createElement},mount=app.createRoot(document.getElementById('test'));
const button=label=>Array.from(document.querySelectorAll('button')).find(b=>b.textContent===label);
async function click(b){assert.ok(b);await app.act(async()=>b.click());}
async function fill(value){await app.act(async()=>{const t=document.querySelector('textarea');Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(t,value);t.dispatchEvent(new Event('input',{bubbles:true}));});}
(async()=>{
await app.act(async()=>mount.render(react.createElement(app.BotIAActivo,{onClose(){}})));
await fill('Consulta general sobre una reserva.');await click(button('Enviar'));
assert.equal(invocations,1);assert.equal(document.querySelector('textarea').value,'Consulta general sobre una reserva.');assert.match(document.querySelector('[role=alert]').textContent,/Fallo simulado/);
await click(button('Nueva consulta'));assert.equal(document.querySelector('textarea').value,'');assert.equal(document.querySelector('[role=alert]'),null);assert.ok(!document.body.textContent.includes('Consulta general sobre una reserva.'));
await app.act(async()=>mount.render(react.createElement(app.EncabezadoEditor,{tipo:'reserva',value:'Texto manual de ejemplo.',onCancel(){},onSave(){},onRestablecer(){}})));
assert.equal(button('Mejorar con IA').disabled,true);assert.match(button('Mejorar con IA').title,/no está disponible/);assert.equal(button('Guardar introducción').disabled,false);
await app.act(async()=>mount.unmount());dom.window.close();console.log('APROBADAS revisión local: ocho textos sin cambios; recuperación de consulta tras error; reinicio del chat; mejora de encabezados bloqueada y edición manual disponible (DOM simulado).');
})().catch(e=>{console.error(e);process.exitCode=1;dom.window.close()});
