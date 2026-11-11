const ts=require('typescript'),path=require('path'),fs=require('fs');
const root=__dirname, files=['App.tsx','Operaciones.tsx','Clausulas.tsx','Exportaciones.ts','Servicios.ts','PrimerosPasos.tsx','AvisoModelos.tsx','PrivacidadIA.ts','AccionesOperaciones.ts','SelectorDocumento.tsx','VistaPreviaAspecto.tsx','FacturacionMercadoPago.tsx','AccesoCuenta.ts','UsoInmobiliarias.tsx','Recordatorios.tsx','Identificadores.ts','Captcha.ts','Analitica.tsx','RetornoCuenta.ts','DocumentoPropio.tsx'];
const sf=new Map(files.map(n=>[n,ts.createSourceFile(n,fs.readFileSync(path.join(root,n),'utf8'),ts.ScriptTarget.Latest,true,n.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS)]));
let errors=[];
for(const [name,source] of sf){for(const st of source.statements){if(!ts.isImportDeclaration(st)||!st.moduleSpecifier.text.startsWith('.'))continue;const target=st.moduleSpecifier.text.replace('./','');const f=[target+'.ts',target+'.tsx'].find(x=>sf.has(x));if(!f){errors.push(name+': missing module '+target);continue;}const exports=new Set();for(const decl of sf.get(f).statements){if(decl.modifiers?.some(x=>x.kind===ts.SyntaxKind.ExportKeyword)){if(decl.name)exports.add(decl.name.text);if(ts.isVariableStatement(decl))for(const d of decl.declarationList.declarations)exports.add(d.name.text);}}for(const el of st.importClause?.namedBindings?.elements||[])if(!exports.has(el.propertyName?.text||el.name.text))errors.push(name+': '+el.name.text+' not exported by '+f);}}
// Usar la misma configuración que tsc evita diagnósticos artificiales por imports de React.
const configPath=path.resolve(root,'../tsconfig.json');
const config=ts.readConfigFile(configPath,ts.sys.readFile);
if(config.error){console.error(ts.flattenDiagnosticMessageText(config.error.messageText,' '));process.exit(1);}
const resolved=ts.parseJsonConfigFileContent(config.config,ts.sys,path.dirname(configPath));
const program=ts.createProgram(resolved.fileNames,resolved.options);
const diags=[...resolved.errors,...ts.getPreEmitDiagnostics(program)];
const meaningful=diags.filter(d=>d.category===ts.DiagnosticCategory.Error);
for(const d of meaningful.slice(0,70)){const f=d.file?.fileName||'';const pos=d.file?.getLineAndCharacterOfPosition(d.start)||{};errors.push(path.basename(f)+':'+((pos.line||0)+1)+' TS'+d.code+' '+ts.flattenDiagnosticMessageText(d.messageText,' '));}
console.log('TypeScript unresolved/TDZ/import diagnostics:',meaningful.length,'; all TypeScript diagnostics:',diags.length);
for(const e of errors.slice(0,80))console.log('ERROR',e);process.exitCode=errors.length?1:0;
