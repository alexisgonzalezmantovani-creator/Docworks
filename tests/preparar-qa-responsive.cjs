// Construye una página local de QA, con datos y cliente simulados. Nunca despliega.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const root=path.resolve(__dirname,'..');
const out=path.resolve(process.argv[2]||path.join(os.tmpdir(),'docworks-qa-responsive'));
fs.mkdirSync(path.join(out,'dist'),{recursive:true});fs.mkdirSync(path.join(out,'.openai'),{recursive:true});
let app=fs.readFileSync(path.join(root,'src/App.tsx'),'utf8').replace('dwObtenerSesionRobusta, loadSupabaseJs }','dwObtenerSesionRobusta }');
const harness=`
import {createRoot} from 'react-dom/client';
function loadSupabaseJs(){return Promise.resolve({from(){return {select(){return this},eq(){return this},order(){return Promise.resolve({data:[]})}}}})}
function ResponsiveQA(){
 const [rol,setRol]=useState('dueno'),[pantalla,setPantalla]=useState('operaciones'),[tipo,setTipo]=useState('reserva'),[preview,setPreview]=useState(false);
 const [perfil,setPerfil]=useState({rol:'dueno',nombre:'Inmobiliaria de prueba',matricula:'MATRÍCULA FICTICIA',plantillas:{}}),[confirmacion,setConfirmacion]=useState(null);
 const usuario={id:'usuario-ficticio',rol_base:rol};
 const ejemplos=PLANTILLA_TIPOS.map((t,i)=>Object.assign({},EMPTY_OP,SAMPLE_OP_PREVIEW,{id:'ficticia-'+t,tipo:t,estado:'activo',broker_id:'usuario-ficticio',broker_nombre:'Asesor ficticio',created_at:'2026-11-02T12:00:00Z',inmueble_direccion:'Inmueble ficticio de prueba',comprador_nombre:'Parte compradora ficticia',vendedor_nombre:'Parte vendedora ficticia'}));
 const [ops,setOps]=useState(ejemplos),[trash,setTrash]=useState([Object.assign({},ejemplos[0],{id:'papelera-ficticia',deleted_at:'2026-11-02T12:00:00Z'})]);
 const [mensaje,setMensaje]=useState('');
 useEffect(()=>{const onConfirm=e=>setConfirmacion(e.detail);window.addEventListener('dw:confirm',onConfirm);return()=>window.removeEventListener('dw:confirm',onConfirm);},[]);
 const lectura=o=>{setTipo(o.tipo);setPantalla('documentos');};
 return <><GStyles/><style>{MOBILE_STABILITY_CSS}</style><main style={{padding:12,maxWidth:1200,margin:'auto'}}>
 <aside style={{padding:10,background:'#fff5cf',color:'#1d2734',borderRadius:8,fontSize:12,marginBottom:12}}>QA local · datos ficticios · sin conexión a producción</aside>
 <nav aria-label="Controles de prueba" style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center',marginBottom:16}}>
 <label>Rol de prueba <select aria-label="Rol de prueba" value={rol} onChange={e=>{setRol(e.target.value);setPerfil(p=>({...p,rol:e.target.value}));}}>{['dueno','admin','broker','vendedor','viewer'].map(r=><option key={r} value={r}>{ROLES_DEF[r].label}</option>)}</select></label>
 <button onClick={()=>setPantalla('operaciones')}>Operaciones de prueba</button><button onClick={()=>setPantalla('documentos')}>Modelos de prueba</button><button onClick={()=>setPantalla('papelera')}>Papelera de prueba</button>
 </nav>{mensaje&&<div role="status">{mensaje}</div>}
 {pantalla==='operaciones'&&<DashboardView key={rol} usuarioActual={usuario} perfil={perfil} operaciones={ops} clausulas={[]} papelera={trash} bloquesReserva={[]} onNew={()=>setMensaje('Formulario de nueva operación autorizado.')} onEdit={lectura} onViewDoc={lectura} onEditField={lectura} onDelete={id=>setOps(xs=>xs.filter(x=>x.id!==id))} onDuplicar={()=>setMensaje('Duplicado de prueba.')} onChangeEstado={()=>setMensaje('Estado de prueba.')} onRestoreVersion={()=>{}} onConvertir={lectura} onConvertirComodato={lectura} onConvertirBoleto={lectura} onConvertirRefuerzo={lectura} onConvertirDevolucion={lectura} onRestore={()=>setMensaje('Restauración de prueba.')} onDeletePermanente={()=>setMensaje('Borrado ficticio.')} onVaciarPapelera={()=>setMensaje('Vaciado ficticio.')} setConfirmVaciarPapelera={()=>{}}/>}
 {pantalla==='documentos'&&<><label>Documento de prueba <select aria-label="Documento de prueba" value={tipo} onChange={e=>setTipo(e.target.value)}>{PLANTILLA_TIPOS.map(t=><option key={t} value={t}>{TIPOS[t]}</option>)}</select></label><button onClick={()=>setPreview(true)}>Vista previa de prueba</button><CuerpoPlantillaPanel key={rol+'-'+tipo} perfil={perfil} tipo={tipo} puedeEditar={rol==='dueno'||rol==='admin'} clausulas={[]} onChange={async p=>{setPerfil(p);return {};}} previewOpen={preview} onPreviewChange={setPreview}/></>}
 {pantalla==='papelera'&&<PapeleraView papelera={trash} puedeGestionar={permisosOperacion(usuario).papelera} onRestore={()=>setMensaje('Restauración de prueba.')} onDeletePermanente={()=>setMensaje('Borrado ficticio.')} onVaciar={()=>setMensaje('Vaciado ficticio.')} setConfirmVaciar={()=>{}}/>}
 <ConfirmModal open={!!confirmacion} message={confirmacion?.message} onConfirm={()=>{const c=confirmacion;setConfirmacion(null);c.onConfirm();}} onCancel={()=>setConfirmacion(null)}/>
 </main></>;
}
function FrameQA(){
 const [size,setSize]=useState('390x844');const wh=size.split('x').map(Number);
 return <main style={{fontFamily:'system-ui',background:'#e8edf4',padding:12,minHeight:'100vh'}}><label>Tamaño de prueba <select aria-label="Tamaño de prueba" value={size} onChange={e=>setSize(e.target.value)}>{['390x844','430x932','820x1180','1180x820','1440x1000'].map(s=><option key={s} value={s}>{s}</option>)}</select></label><p>Vista emulada en Chromium · datos ficticios · no representa Safari/iOS real.</p><iframe title="DocWorks de prueba" src="?frame=1" width={wh[0]} height={wh[1]} style={{display:'block',border:'1px solid #607089',background:'#0b1019'}}/></main>;
}
createRoot(document.getElementById('root')).render(new URLSearchParams(location.search).get('frame')==='1'?<ResponsiveQA/>:<FrameQA/>);
`;
require('esbuild').buildSync({stdin:{contents:app+harness,resolveDir:path.join(root,'src'),loader:'tsx'},bundle:true,jsx:'automatic',format:'iife',outfile:path.join(out,'dist/qa.js')});
fs.copyFileSync(path.join(root,'public/docworks-header-logo.png'),path.join(out,'dist/docworks-header-logo.png'));
fs.writeFileSync(path.join(out,'dist/index.html'),'<!doctype html><html lang="es-AR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src \'self\' data: blob:; script-src \'self\'; style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com; font-src \'self\' data: https://fonts.gstatic.com; connect-src \'self\'; form-action \'none\'"><title>DocWorks · QA local con datos ficticios</title></head><body><div id="root"></div><script src="qa.js"></script></body></html>');
fs.writeFileSync(path.join(out,'package.json'),JSON.stringify({name:'docworks-qa-local',private:true}));
fs.writeFileSync(path.join(out,'.openai/hosting.json'),JSON.stringify({static:{directory:'dist'}}));
console.log(JSON.stringify({root:out,datos:'ficticios',produccion:false,hosting:false}));
