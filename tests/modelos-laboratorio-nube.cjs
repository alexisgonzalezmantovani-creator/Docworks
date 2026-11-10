const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {transformSync}=require("esbuild");
const file=fs.readFileSync(path.join(__dirname,"../src/ModelosLaboratorioNube.ts"),"utf8");
const mod={exports:{}};
new Function("module","exports",transformSync(file,{loader:"ts",format:"cjs",target:"es2020"}).code)(mod,mod.exports);
const api=mod.exports;
const calls=[];
const client={
 from(table){
  calls.push(["from",table]);
  return {select(fields){calls.push(["select",fields]);return {
   eq(col,val){calls.push(["eq",col,val]);return {maybeSingle:async()=>({data:table.endsWith("publicados")?
    {version:2,snapshot:{titulo:"Oferta"}}:{revision:4,estado:{schema:1,versiones:[]}}})};}
  };}};
 },
 rpc:async(name,args)=>{calls.push(["rpc",name,args]);return {data:5};}
};
(async()=>{
 assert.equal(api.tipoModeloLabValido("reserva"),true);
 assert.equal(api.tipoModeloLabValido("loteria"),false);
 const loaded=await api.cargarModeloLabNube(client,"reserva");
 assert.equal(loaded.revision,4);
 assert.equal(calls[0][1],"dw_modelos_laboratorio");
 const pub=await api.cargarModeloPublicadoNube(client,"reserva");
 assert.equal(pub.version,2);
 assert.equal(calls.find(x=>x[0]==="from"&&x[1].endsWith("publicados"))[1],"dw_modelos_laboratorio_publicados");
 const saved=await api.guardarModeloLabNube(client,"reserva",{schema:1,versiones:[]},4,true);
 assert.equal(saved.revision,5);
 assert.equal(calls.find(x=>x[0]==="rpc")[2].p_expected_revision,4);
 assert.equal(calls.find(x=>x[0]==="rpc")[2].p_publicar,true);
 const rejected=await api.guardarModeloLabNube(client,"loteria",{schema:1,versiones:[]},0,false);
 assert.ok(rejected.error);
 assert.ok((await api.guardarModeloLabNube(client,"reserva",{schema:1,versiones:[]},-1,false)).error);
 console.log("Modelos nube: validaciones de contrato OK (sin acceso a base real).");
})().catch(e=>{console.error(e);process.exitCode=1;});
