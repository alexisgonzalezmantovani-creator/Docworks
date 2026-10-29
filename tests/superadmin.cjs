const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');const dir=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'dw-sa-'));
const dom=new JSDOM('<html><head></head><body><div id="test"></div></body></html>',{url:'http://localhost'});
for(const k of ['window','document','HTMLElement','HTMLInputElement','HTMLTextAreaElement','CustomEvent','Event','Node','localStorage'])global[k]=dom.window[k];
window.scrollTo=()=>{};global.IS_REACT_ACT_ENVIRONMENT=true;global.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:()=>setTimeout(()=>this.port1.onmessage?.({}),0)}}};
require('esbuild').buildSync({stdin:{contents:fs.readFileSync(dir+'/src/App.tsx','utf8')+require('./superadmin-fixtures.cjs').source+'\nimport {act,createElement} from "react";import {createRoot} from "react-dom/client";export {act,createElement,createRoot,PanelSuperadminPrueba,saDemoData,saDemoCalls};',resolveDir:dir+'/src',loader:'tsx'},bundle:true,jsx:'automatic',platform:'node',format:'cjs',outfile:tmp+'/test.cjs'});
const a=require(tmp+'/test.cjs');let checks=0,logout=0;const root=a.createRoot(document.getElementById('test'));
function check(label,fn){fn();checks++;console.log('OK',label)}
const btn=t=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===t);assert.ok(b,t);return b};
async function click(b){await a.act(async()=>b.click())}
async function select(label,value){await a.act(async()=>{const e=document.querySelector('[aria-label="'+label+'"]');e.value=value;e.dispatchEvent(new Event('change',{bubbles:true}));});}
(async()=>{
 await a.act(async()=>root.render(a.createElement(a.PanelSuperadminPrueba,{contexto:{usuario:{nombre:'Administración de prueba'}},onLogout:()=>logout++})));
 check('panel tiene seis destinos y cuatro indicadores principales',()=>{assert.equal(document.querySelectorAll('nav[aria-label="Superadministración"] button').length,6);assert.equal(document.querySelectorAll('.sa-overview button').length,4);assert.equal(document.querySelector('h1').textContent,'Resumen');assert.ok(document.querySelector('[aria-current=page]'));});
 check('prioriza cuentas y renovaciones con datos reales',()=>{assert.equal(document.querySelectorAll('.sa-priority-row').length,3);assert.equal(document.querySelector('.sa-nav-count').textContent,'1');assert.ok(document.body.textContent.includes('USD 30,00'));assert.ok(document.body.textContent.includes('ARS 15.000,00'));assert.ok(!document.body.textContent.includes('movimientos registrados'));});
 await click(btn('Vencen en 7 días 1'));
 check('atajo de renovaciones filtra solo activas próximas a vencer',()=>{assert.equal(document.querySelector('h1').textContent,'Inmobiliarias');assert.equal(document.querySelectorAll('[data-testid=sa-org-card]').length,1);assert.ok(document.querySelector('[data-testid=sa-org-card]').textContent.includes('Horizonte'));});
 await select('Estado de inmobiliaria','atencion');
 check('filtro de atención coincide con el resumen',()=>assert.equal(document.querySelectorAll('[data-testid=sa-org-card]').length,2));
 await select('Estado de inmobiliaria','todas');await select('Filtrar inmobiliarias por plan','pro');
 check('filtro por plan conserva las cuentas correspondientes',()=>assert.equal(document.querySelectorAll('[data-testid=sa-org-card]').length,2));
 await select('Filtrar inmobiliarias por plan','todos');await a.act(async()=>{const el=document.querySelector('[aria-label="Buscar inmobiliarias por nombre o email"]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,'norte@example.test');el.dispatchEvent(new Event('input',{bubbles:true}));});
 check('búsqueda por email encuentra la inmobiliaria',()=>{assert.equal(document.querySelectorAll('[data-testid=sa-org-card]').length,1);assert.ok(document.querySelector('[data-testid=sa-org-card]').textContent.includes('Norte Inmuebles'));});
 await click(btn('Ver detalle →'));
 check('detalle conserva gestión de plan, acceso y pagos',()=>{assert.ok(document.querySelector('.modal-box'));assert.ok(document.body.textContent.includes('Extender 30 días'));assert.ok(document.body.textContent.includes('Bloques del modelo:'));assert.ok(a.saDemoCalls.some(c=>c.nombre==='fn_super_detalle_inmobiliaria'&&c.params.p_inmobiliaria_id==='dos'));});
 await click(document.querySelector('.modal-close'));
 await click([...document.querySelectorAll('nav button')].find(b=>b.textContent.trim().startsWith('Solicitudes')));
 check('solicitudes mantiene aprobación y rechazo sin ejecutar escrituras',()=>{assert.ok(btn('Aprobar'));assert.ok(btn('Rechazar'));assert.ok(!a.saDemoCalls.some(c=>c.nombre.includes('resolver')));});
 await click(btn('Pagos'));
 check('pagos se consultan al entrar y se muestran en su sección',()=>{assert.ok(a.saDemoCalls.some(c=>c.nombre==='fn_super_pagos'));assert.ok(document.body.textContent.includes('Norte Inmuebles'));assert.ok(document.body.textContent.includes('Transferencia bancaria'));});
 await click(btn('Auditoría'));check('auditoría sigue accesible',()=>assert.ok(a.saDemoCalls.some(c=>c.nombre==='fn_super_auditoria')));
 await click(btn('Resumen'));await click(btn('+ Nueva inmobiliaria'));
 check('alta conserva formulario original',()=>{assert.ok(document.querySelector('.modal-box'));assert.ok(document.body.textContent.includes('Correo del dueño/administrador'));});
 await click([...document.querySelectorAll('.modal-box button')].find(b=>b.textContent.trim()==='Cancelar'));
 const antes=a.saDemoCalls.length;await click(btn('Actualizar'));
 check('actualizar vuelve a consultar sin modificar datos',()=>{assert.ok(a.saDemoCalls.length>antes);assert.ok(!a.saDemoCalls.some(c=>/crear|editar|asignar|set_|extender|registrar/.test(c.nombre)));});
 a.saDemoData.error=true;await click(btn('Actualizar'));
 check('error de carga queda visible y permite reintentar',()=>assert.ok(document.querySelector('[role=alert]').textContent.includes('Fallo de prueba')));
 a.saDemoData.error=false;await click(btn('Actualizar'));
 check('reintentar recupera el panel y limpia el error',()=>assert.equal(document.querySelector('[role=alert]'),null));
 await click(btn('Inmobiliarias'));await select('Estado de inmobiliaria','vencida');await click(btn('Restablecer filtros'));
 check('restablecer filtros recupera todas las cuentas',()=>assert.equal(document.querySelectorAll('[data-testid=sa-org-card]').length,4));
 await click(btn('Cerrar sesión'));check('cerrar sesión conserva su acción',()=>assert.equal(logout,1));
 await a.act(async()=>root.unmount());dom.window.close();console.log('APROBADAS',checks,'verificaciones del panel superadmin.');
})().catch(e=>{console.error(e);process.exitCode=1;dom.window.close()});
