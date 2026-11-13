// Regresión del contrato propio: copiar desde Word no permite duplicar datos.
const assert=require('node:assert/strict');
const esbuild=require('esbuild'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const dir=path.resolve(__dirname,'..'),out=fs.mkdtempSync(path.join(os.tmpdir(),'dw-contrato-propio-'));
esbuild.buildSync({entryPoints:[path.join(dir,'src/DocumentoPropio.tsx')],bundle:true,platform:'node',format:'cjs',outfile:path.join(out,'editor.cjs')});
const {analizarChipsDocumentoPropio:analizar}=require(path.join(out,'editor.cjs'));
const permitidos=new Set(['comprador_nombre','vendedor_nombre','inmueble_direccion','comprador_dni']);
let n=0;function check(nombre,funcion){funcion();n++;console.log('OK',nombre);}
const base='Contrato de reserva. Parte compradora {{comprador_nombre}}, parte vendedora {{vendedor_nombre}}, inmueble {{inmueble_direccion}}. Firmas.';
check('los datos correctos no generan avisos',()=>{
 const r=analizar(base,permitidos);assert.deepEqual(r.repetidos,[]);assert.deepEqual(r.invalidos,[]);assert.equal(r.llavesMal,false);assert.equal(r.capturados.length,3);
});
check('detecta el chip repetido al pegar desde Word',()=>{
 const r=analizar(base+' Comprador nuevamente: {{comprador_nombre}}.',permitidos);
 assert.deepEqual(r.repetidos,['comprador_nombre']);assert.equal(r.capturados.length,3);
});
check('distingue varios datos repetidos de sus apariciones',()=>{
 const r=analizar('{{comprador_dni}} - {{comprador_dni}} - {{vendedor_nombre}} - {{vendedor_nombre}} - {{vendedor_nombre}}',permitidos);
 assert.deepEqual(r.repetidos,['comprador_dni','vendedor_nombre']);
});
check('los chips desconocidos y llaves mal cerradas no pasan la revisión',()=>{
 const r=analizar(base+' {{dato_inventado}} y {{mal_cerrado}',permitidos);
 assert.deepEqual(r.invalidos,['dato_inventado']);assert.equal(r.llavesMal,true);
});
check('borrar un chip devuelve su disponibilidad y elimina el aviso',()=>{
 const primero=analizar(base+' {{comprador_nombre}}',permitidos);
 const despues=analizar(base,permitidos);
 assert.equal(primero.repetidos.length,1);assert.equal(despues.repetidos.length,0);
 assert.equal(despues.capturados.filter(t=>t==='comprador_nombre').length,1);
});
check('ignora texto con llaves simples que no representa un chip',()=>{
 const r=analizar('Contrato {no-chip} {{inmueble_direccion}}',permitidos);
 assert.equal(r.llavesMal,false);assert.deepEqual(r.capturados,['inmueble_direccion']);
});
const editor=fs.readFileSync(path.join(dir,'src/DocumentoPropio.tsx'),'utf8');
check('el guardado exige que no haya duplicados',()=>assert.match(editor,/!repetidos\.length/));
check('la recuperación histórica requiere confirmación y deja borrador',()=>{assert.match(editor,/versionesDisponibles\.map/);assert.match(editor,/confirmar\("¿Recuperar la versión /);assert.match(editor,/La recuperación no guarda ni publica nada automáticamente/);});
check('se bloquea el atajo del navegador al guardar',()=>assert.match(editor,/ev\.preventDefault\(\);guardar\(\);/));
check('los chips recomendados se recalculan usando solo los disponibles',()=>{assert.match(editor,/const chipsSugeridos=disponibles\.filter/);assert.match(editor,/nombres\.includes\(key\)/);});
check('tocar un chip inserta el dato y lo hace desaparecer de las sugerencias',()=>{assert.match(editor,/chipsSugeridos\.map\(\(\[key,label\]\)=>/);assert.match(editor,/onClick=\{\(\)=>insertar\(key\)\}/);assert.match(editor,/capturados\.includes\(key\)/);});
console.log('APROBADAS '+n+' pruebas de contrato propio.');
