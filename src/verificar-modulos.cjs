const fs=require('fs'),path=require('path'),ts=require('typescript');
const root=__dirname,names=['App.tsx','Operaciones.tsx','Clausulas.tsx','Exportaciones.ts','Servicios.ts'];let errors=0;
for(const n of names){const file=path.join(root,n),s=fs.readFileSync(file,'utf8');const parsed=ts.createSourceFile(file,s,ts.ScriptTarget.Latest,true,n.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);if(parsed.parseDiagnostics.length){errors+=parsed.parseDiagnostics.length;console.log('ERROR sintaxis',n,parsed.parseDiagnostics.map(x=>x.messageText));}else console.log('OK sintaxis',n);for(const m of s.matchAll(/from\s+['"](\.[^'"]+)['"]/g)){const base=path.resolve(root,path.dirname(n),m[1]);if(!['.ts','.tsx','.js','.jsx'].some(ext=>fs.existsSync(base+ext))&&!fs.existsSync(base)){console.log('ERROR importacion',n,m[1]);errors++;}}}
const app=fs.readFileSync(path.join(root,'App.tsx'),'utf8'),exp=fs.readFileSync(path.join(root,'Exportaciones.ts'),'utf8');
for(const x of ['generarPDFModulo','generarDOCXModulo']){if(!exp.includes('export async function '+x)){console.log('ERROR generador',x);errors++;}else console.log('OK generador',x)}
if(!app.includes('var DOCWORKS_VERSION = "5.90"')){console.log('ERROR version');errors++}else console.log('OK version 5.90');
console.log(errors?'FALLOS '+errors:'COMPROBACIONES ESTATICAS APROBADAS');process.exitCode=errors?1:0;
