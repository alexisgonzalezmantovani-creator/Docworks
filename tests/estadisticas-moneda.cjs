// Estadísticas: un contrato de alquiler por carpeta y sin convertir monedas.
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),os=require('node:os'),esbuild=require('esbuild');
const dir=path.resolve(__dirname,'..'),out=fs.mkdtempSync(path.join(os.tmpdir(),'dw-canones-'));
esbuild.buildSync({entryPoints:[path.join(dir,'src/Operaciones.tsx')],bundle:true,platform:'node',format:'cjs',outfile:path.join(out,'ops.cjs')});
const {calcularCanonesPorMoneda:calcular}=require(path.join(out,'ops.cjs'));
const parse=s=>Number(String(s).replace(/\./g,'').replace(',','.'));
let n=0;function check(label,fn){fn();n++;console.log('OK',label);}
const ars={id:'a',tipo:'alquiler',alquiler_monto_inicial:'250.000,50',alquiler_moneda:'ARS',created_at:'2026-11-01'};
const reserva={id:'b',tipo:'reserva_alquiler'};
const usd={id:'c',parent_id:'b',tipo:'alquiler',alquiler_monto_inicial:'1.900,75',alquiler_moneda:'USD',created_at:'2026-11-02'};
check('alquileres USD/ARS permanecen separados',()=>assert.deepEqual(calcular([ars,reserva],[ars,reserva,usd],parse),{ARS:250000.50,USD:1900.75}));
check('un contrato hijo suma una sola vez aunque el padre sea reserva',()=>assert.deepEqual(calcular([reserva],[reserva,usd],parse),{ARS:0,USD:1900.75}));
check('contrato renovado reemplaza al anterior de su carpeta',()=>{const viejo={...usd,id:'anterior',created_at:'2026-01-01',alquiler_monto_inicial:'500'};assert.deepEqual(calcular([reserva],[reserva,viejo,usd],parse),{ARS:0,USD:1900.75});});
check('contrato sin monto o no válido no inventa dinero',()=>assert.deepEqual(calcular([reserva],[reserva,{...usd,alquiler_monto_inicial:'mal'}],parse),{ARS:0,USD:0}));
check('raíces sin contrato no suman reservas estimadas',()=>assert.deepEqual(calcular([reserva],[reserva],parse),{ARS:0,USD:0}));
check('no duplica un contrato por pertenecer al arreglo de operaciones y la raíz',()=>assert.deepEqual(calcular([ars],[ars],parse),{ARS:250000.50,USD:0}));
check('sin operaciones entrega totales cero',()=>assert.deepEqual(calcular([],[],parse),{ARS:0,USD:0}));
console.log('APROBADAS '+n+' pruebas de canon mensual por moneda y carpeta.');
