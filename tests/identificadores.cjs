const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const out=fs.mkdtempSync(path.join(os.tmpdir(),'dw-ids-'));
require('esbuild').buildSync({entryPoints:[path.resolve(__dirname,'../src/Identificadores.ts')],bundle:true,platform:'node',format:'cjs',outfile:out+'/ids.cjs'});
const {crearIdentificadorSeguro}=require(out+'/ids.cjs');
assert.equal(crearIdentificadorSeguro({randomUUID:()=> 'uuid-nativo'}),'uuid-nativo');
const fallback={getRandomValues:a=>crypto.webcrypto.getRandomValues(a)},ids=new Set();
for(let i=0;i<10000;i++){const id=crearIdentificadorSeguro(fallback);assert.match(id,/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);ids.add(id);}
assert.equal(ids.size,10000);assert.throws(()=>crearIdentificadorSeguro({}),/identificador seguro/);
assert.match(crearIdentificadorSeguro({...fallback,randomUUID(){throw Error('No compatible')}}),/^[0-9a-f-]{36}$/);
console.log('APROBADOS UUID nativo, fallback criptográfico, versión/variante, 10.000 IDs distintos y ausencia de fuente insegura.');
