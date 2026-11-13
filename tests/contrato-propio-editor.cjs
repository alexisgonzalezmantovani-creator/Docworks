// Regresión del contrato propio: copiar desde Word no permite duplicar datos.
const assert=require('node:assert/strict');
const esbuild=require('esbuild'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const dir=path.resolve(__dirname,'..'),out=fs.mkdtempSync(path.join(os.tmpdir(),'dw-contrato-propio-'));
esbuild.buildSync({entryPoints:[path.join(dir,'src/DocumentoPropio.tsx')],bundle:true,platform:'node',format:'cjs',outfile:path.join(out,'editor.cjs')});
const {analizarChipsDocumentoPropio:analizar,insertarDatoAutomatico:insertar,quitarDatoAutomatico:quitar}=require(path.join(out,'editor.cjs'));
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
check('insertar dato respeta el cursor en el medio de un párrafo',()=>{
 const r=insertar('Antes. Después.','comprador_dni',7,7);
 assert.equal(r.texto,'Antes. {{comprador_dni}} Después.');
 assert.equal(r.cursor,24);
});
check('insertar dato reemplaza solo la selección',()=>{
 const r=insertar('El nombre anterior firma.','comprador_nombre',3,18);
 assert.equal(r.texto,'El {{comprador_nombre}} firma.');
});
check('insertar dato tolera posiciones fuera del texto',()=>{
 assert.equal(insertar('abc','precio_letras',999,999).texto,'abc {{precio_letras}}');
 assert.equal(insertar('abc','precio_letras',-2,-1).texto,'{{precio_letras}} abc');
});
check('cursor dentro de otro dato no rompe las llaves del chip existente',()=>{
 const r=insertar('A {{comprador_nombre}} B','comprador_dni',8,8);
 assert.equal(r.texto,'A {{comprador_nombre}}{{comprador_dni}} B');
 assert.deepEqual(analizar(r.texto,new Set(['comprador_nombre','comprador_dni'])).invalidos,[]);
});
check('selección parcial de otro chip lo reemplaza entero sin dañarlo',()=>{
 const r=insertar('A {{comprador_nombre}} B','comprador_dni',9,13);
 assert.equal(r.texto,'A {{comprador_dni}} B');
 assert.equal(analizar(r.texto,new Set(['comprador_dni'])).llavesMal,false);
});
check('inserción separa las palabras sin alterar signos de puntuación',()=>{
 assert.equal(insertar('Monto total.','precio_letras',6,6).texto,'Monto {{precio_letras}} total.');
 assert.equal(insertar('El precio es ().','precio_letras',14,14).texto,'El precio es ({{precio_letras}}).');
});
check('quitar un chip solo elimina esa variable',()=>{
 const texto='Comprador {{comprador_nombre}} y DNI {{comprador_dni}}.';
 const r=quitar(texto,'comprador_dni');
 assert.equal(r.texto,'Comprador {{comprador_nombre}} y DNI .');
 assert.deepEqual(analizar(r.texto,permitidos).capturados,['comprador_nombre']);
});
check('quitar un chip conserva párrafos y normaliza el doble espacio',()=>{
 const texto='Antes {{precio_letras}} después.\nOtro párrafo.';
 const r=quitar(texto,'precio_letras');
 assert.equal(r.texto,'Antes después.\nOtro párrafo.');
 assert.equal(quitar(texto,'no_existente').texto,texto);
});
check('el botón de quitar está en cada etiqueta insertada',()=>{
 const editor=fs.readFileSync(path.join(dir,'src/DocumentoPropio.tsx'),'utf8');
 assert.ok(editor.includes('onClick={()=>quitar(key)}'));
 assert.ok(editor.includes('aria-label={"Quitar "+etiqueta+" del contrato"}'));
});
check('deshacer aparece sólo después de modificar chips',()=>{
 const src=fs.readFileSync(path.join(dir,'src/DocumentoPropio.tsx'),'utf8');
 assert.ok(src.includes('texto===ultimaAccionChip.textoPosterior'));
 assert.ok(src.includes('onClick={deshacerUltimoChip}'));
 assert.ok(src.includes('setUltimaAccionChip(null);cambiarTexto(ev.target.value)'));
});
const editor=fs.readFileSync(path.join(dir,'src/DocumentoPropio.tsx'),'utf8');
check('el guardado exige que no haya duplicados',()=>assert.match(editor,/!repetidos\.length/));
check('el contrato propio incluye los chips optativos de tratamiento y artículo',()=>{assert.match(editor,/comprador_tratamiento/);assert.match(editor,/vendedor_articulo/);assert.match(editor,/comodante_tratamiento/);assert.match(editor,/autorizante_articulo/);});
check('la recuperación histórica requiere confirmación y deja borrador',()=>{assert.match(editor,/versionesDisponibles\.map/);assert.match(editor,/confirmar\("¿Recuperar la versión /);assert.match(editor,/La recuperación no guarda ni publica nada automáticamente/);});
check('se bloquea el atajo del navegador al guardar',()=>assert.match(editor,/ev\.preventDefault\(\);guardar\(\);/));
check('los chips recomendados se recalculan usando solo los disponibles',()=>{assert.match(editor,/const chipsSugeridos=disponibles\.filter/);assert.match(editor,/nombres\.includes\(key\)/);});
check('tocar un chip inserta el dato y lo hace desaparecer de las sugerencias',()=>{assert.match(editor,/chipsSugeridos\.map\(\(\[key,label\]\)=>/);assert.match(editor,/onClick=\{\(\)=>insertar\(key\)\}/);assert.match(editor,/capturados\.includes\(key\)/);});
check('los chips insertados son visibles también al escribir y se pueden localizar',()=>{
 assert.match(editor,/aria-label="Datos automáticos ya insertados"/);
 assert.match(editor,/capturados\.map\(key=>/);
 assert.match(editor,/onClick=\{\(\)=>irAlDato\(key\)\}/);
 assert.match(editor,/setSelectionRange\(pos,pos\+key\.length\+4\)/);
});
check('selector separa las condiciones económicas y conserva todos los tipos',()=>{
 assert.match(editor,/titulo:"Condiciones de pago"/);
 assert.match(editor,/titulo:"Inmobiliaria y otros"/);
 assert.match(editor,/titulo:"Importes y fechas"/);
});
check('revisión permite insertar los datos obligatorios faltantes con un toque',()=>{
 assert.ok(editor.includes('aria-label="Datos obligatorios pendientes"'));
 assert.ok(editor.includes('faltantes.map(key=><button'));
 assert.ok(editor.includes('onClick={()=>insertar(key)}'));
});
check('revisión conserva los datos pendientes al insertar uno',()=>{
 assert.ok(editor.includes('function insertar(key:string,mantenerRevision=false)'));
 assert.ok(editor.includes('cambiarTexto(nuevo.texto,mantenerRevision)'));
 assert.ok(editor.includes('onClick={()=>insertar(key,true)}'));
 assert.ok(editor.includes('if(!mantenerRevision)setRevisar(false)'));
});
console.log('APROBADAS '+n+' pruebas de contrato propio.');
