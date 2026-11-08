// Regresión: los faltantes se validan al revisar, no colorean los pasos de carga.
// Ejecutar: node tests/validacion-diferida.cjs
const fs=require('node:fs');
const assert=require('node:assert/strict');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../src/Operaciones.tsx'),'utf8');
const start=source.indexOf('export function crearOperacionForm(deps)');
const end=source.indexOf('export function crearPapeleraView(deps)',start);
assert.ok(start>=0&&end>start,'Debe existir el formulario de operaciones');
const form=source.slice(start,end);
assert.match(form,/const camposFaltantes = \[\];/,'No pasar faltantes a campos durante la carga');
assert.match(form,/const faltantesDetalle = getCamposFaltantesDetalle\(data,perfil\)/,'Mantener validación documental');
assert.match(form,/step>total&&faltantesDetalle\.length>0/,'Mostrar pendientes solo en resumen');
assert.match(form,/document\.querySelectorAll\("\[data-falta\]"\)/,'Limpiar marcas heredadas');
assert.doesNotMatch(form,/setAttribute\("data-falta"/,'No reintroducir bordes rojos vía DOM');
assert.match(form,/step<total\?<Btn onClick=\{avanzarConAviso\}>Siguiente/,'Permitir avance libre');
assert.match(form,/Revisar →/,'Conservar revisión final');
assert.match(form,/draftTieneContenido\(data\) \? \{ data:data/,'No persistir un formulario vacío como borrador');
assert.match(form,/dw-operation-save-slot/,'Indicador de guardado junto a siguiente');
assert.match(form,/if\(!initial && !draftTieneContenido\(dataRef\.current\)\) return;/,'Impedir guardar operaciones nuevas vacías');
const app=fs.readFileSync(path.join(__dirname,'../src/App.tsx'),'utf8');
const clauses=app.slice(app.indexOf('function StepClausulas('),app.indexOf('function StepBar('));
assert.match(clauses,/if\(activando\)\s*\{\s*if\(cfg\)onChange\(cfg\.campo\+"_id",id\);\s*setClausulaExpandida\(id\);/,'Activar cualquier cláusula abre su detalle');
assert.match(clauses,/className="dw-op-clause-expand"/,'El botón + tiene control propio');
assert.match(form,/lsRemove\("draftOperacion"\)/,'Eliminar borrador si se vacían los datos');
assert.match(app,/crearOperacionForm\(\{[^;]*lsRemove, lsSet/,'Inyectar limpieza de borrador desde App');
assert.match(app,/if\(k==="draftOperacion" && \(!v \|\| !v\.data \|\| !draftTieneContenido\(v\.data\)\)\)/,'Autoguardado limpia borradores vacíos');
console.log('OK: 15 comprobaciones estáticas de validación diferida, borrador y cláusulas');
