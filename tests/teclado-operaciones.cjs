const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'docworks-teclado-'));
require('esbuild').buildSync({entryPoints:[path.resolve(__dirname,'../src/NavegacionCamposOperacion.ts')],bundle:true,platform:'node',format:'cjs',outfile:path.join(tmp,'teclado.cjs')});
const {prepararTecladoOperacion,avanzarConEnterOperacion}=require(path.join(tmp,'teclado.cjs'));
const dom=new JSDOM('<div id="paso"><input id="nombre"><input id="oculto" hidden><input id="dni"><select id="tratamiento"><option>Sr.</option></select><input id="domicilio"><textarea id="inventario"></textarea><input id="telefono"><input id="deshabilitado" disabled><input id="final"></div>',{url:'https://docworks.example'});
global.window=dom.window;global.document=dom.window.document;global.Element=dom.window.Element;
const form=document.getElementById('paso');
form.querySelectorAll('input,select,textarea').forEach(el=>{el.getClientRects=()=>el.hidden?[]:[{width:100,height:32}];});
let checks=0;function ok(msg,fn){fn();checks++;console.log('OK',msg);}
const find=id=>document.getElementById(id);
function enter(id,extras={}){
 let cancelado=false;
 const e={key:'Enter',target:find(id),defaultPrevented:false,shiftKey:false,ctrlKey:false,altKey:false,metaKey:false,preventDefault(){cancelado=true;},...extras};
 return {handled:avanzarConEnterOperacion(e,form),cancelado};
}
prepararTecladoOperacion(form);
ok('el teclado muestra Siguiente y Listo',()=>{assert.equal(find('nombre').getAttribute('enterkeyhint'),'next');assert.equal(find('final').getAttribute('enterkeyhint'),'done');});
ok('Enter salta el campo oculto y pasa al DNI',()=>{find('nombre').focus();let r=enter('nombre');assert.deepEqual(r,{handled:true,cancelado:true});assert.equal(document.activeElement.id,'dni');});
ok('Enter puede enfocar un selector sin activarlo',()=>{find('dni').focus();enter('dni');assert.equal(document.activeElement.id,'tratamiento');});
ok('Enter respeta el selector nativo',()=>{find('tratamiento').focus();assert.equal(enter('tratamiento').handled,false);assert.equal(document.activeElement.id,'tratamiento');});
ok('Enter en inventario conserva su nueva línea',()=>{find('inventario').focus();assert.equal(enter('inventario').handled,false);assert.equal(document.activeElement.id,'inventario');});
ok('Enter no enfoca inputs deshabilitados',()=>{find('telefono').focus();enter('telefono');assert.equal(document.activeElement.id,'final');});
ok('El último input cierra el teclado sin enviar',()=>{find('final').focus();const r=enter('final');assert.ok(r.cancelado);assert.equal(document.activeElement,document.body);});
ok('Composición IME, Shift+Enter y teclas diferentes se respetan',()=>{find('nombre').focus();assert.equal(enter('nombre',{isComposing:true}).handled,false);assert.equal(enter('nombre',{shiftKey:true}).handled,false);assert.equal(enter('nombre',{key:' '}).handled,false);assert.equal(document.activeElement.id,'nombre');});
ok('Campos fecha usan Enter nativo',()=>{const fecha=document.createElement('input');fecha.type='date';fecha.getClientRects=()=>[{width:100,height:32}];form.appendChild(fecha);prepararTecladoOperacion(form);fecha.focus();const e={key:'Enter',target:fecha,defaultPrevented:false,shiftKey:false,ctrlKey:false,altKey:false,metaKey:false,preventDefault(){throw Error('No debe interceptar');}};assert.equal(avanzarConEnterOperacion(e,form),false);});
ok('Combobox mantiene Enter para seleccionar su sugerencia',()=>{find('domicilio').setAttribute('role','combobox');find('domicilio').focus();assert.equal(enter('domicilio').handled,false);});
dom.window.close();fs.rmSync(tmp,{recursive:true,force:true});console.log('APROBADOS '+checks+' casos de navegación Enter de operaciones.');
