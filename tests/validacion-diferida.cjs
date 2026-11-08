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
console.log('OK: 9 comprobaciones estáticas de validación diferida, borrador y navegación');
