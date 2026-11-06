// Auditoría de cierre contra el catálogo real capturado. No escribe en la base.
// Actualizar el JSON mediante una nueva consulta pg_proc antes de cada lanzamiento.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),snapshot=JSON.parse(fs.readFileSync(path.join(__dirname,'catalogo-rpc-verificado.json'),'utf8'));
const known=new Set(snapshot.funciones),missing=new Map();
for(const file of fs.readdirSync(root+'/src').filter(x=>/\.(ts|tsx)$/.test(x))){
 const source=fs.readFileSync(root+'/src/'+file,'utf8');
 for(const m of source.matchAll(/\brpc\(\s*["'](fn_[a-z0-9_]+)["']/g)){
  if(known.has(m[1]))continue;
  const refs=missing.get(m[1])||[];refs.push(file+':'+(source.slice(0,m.index).split('\n').length));missing.set(m[1],refs);
 }
}
console.log('Catálogo verificado:',snapshot.verificado_en,'— sólo nombres de RPC literales; no certifica argumentos ni permisos.');
for(const [name,refs] of missing)console.error('FALTA',name,'→',refs.join(', '));
console.log(missing.size?'BLOQUEO: '+missing.size+' funciones referenciadas ausentes del catálogo.':'Sin referencias ausentes en este catálogo.');
process.exitCode=missing.size?1:0;
