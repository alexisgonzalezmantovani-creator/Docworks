const fecha=d=>new Date(Date.now()+d*86400000).toISOString();
const data={
 error:false,
 dashboard:{total_inmobiliarias:4,inmobiliarias_activas:2,inmobiliarias_suspendidas:1,total_usuarios:18,total_brokers:12,planes_activos:2,membresias_activas:2,membresias_vencidas:1},
 inmobiliarias:[
  {inmobiliaria_id:'uno',inmobiliaria_nombre:'Horizonte Propiedades',dueno_email:'dueño@horizonte.example',estado:'activa',plan_codigo:'pro',plan_nombre:'Profesional',usuarios_activos:5,limite_usuarios:10,fecha_vencimiento:fecha(3),created_at:fecha(-10)},
  {inmobiliaria_id:'dos',inmobiliaria_nombre:'Norte Inmuebles',dueno_email:'norte@example.test',estado:'vencida',plan_codigo:'inicio',plan_nombre:'Inicial',usuarios_activos:2,limite_usuarios:3,fecha_vencimiento:fecha(-4),created_at:fecha(-20)},
  {inmobiliaria_id:'tres',inmobiliaria_nombre:'Estudio inmobiliario con nombre extenso para verificar el ancho de la tarjeta',dueno_email:'contacto-de-prueba-con-correo-extenso@example.test',estado:'pendiente',plan_codigo:'pro',plan_nombre:'Profesional',usuarios_activos:1,limite_usuarios:10,created_at:fecha(-1)},
  {inmobiliaria_id:'cuatro',inmobiliaria_nombre:'Centro Gestión',dueno_email:'centro@example.test',estado:'activa',plan_codigo:'inicio',plan_nombre:'Inicial',usuarios_activos:3,limite_usuarios:3,fecha_vencimiento:fecha(40),created_at:fecha(-30)}
 ],
 planes:[{id:'p1',codigo:'inicio',nombre:'Inicial',activo:true,precio_mensual:15000,moneda:'ARS',limite_usuarios:3},{id:'p2',codigo:'pro',nombre:'Profesional',activo:true,precio_mensual:30,moneda:'USD',limite_usuarios:10}],
 solicitudes:[{id:'s1',nombre:'María Prueba',email:'maria@example.test',inmobiliaria:'Nueva Inmobiliaria',estado:'pendiente'},{id:'s2',nombre:'Registro anterior',email:'anterior@example.test',estado:'aprobada'}],
 metricas:{inmobiliarias_inactivas_30_dias:1,operaciones_mes:32,usuarios_activos:11},
 pagos:[{id:'pago1',monto:15000,moneda:'ARS',estado:'pagado',metodo_pago:'Transferencia bancaria',inmobiliaria_nombre:'Norte Inmuebles',creado_en:fecha(-1)}]
};
const source=`
const saDemoData=${JSON.stringify(data)};
const saDemoCalls=[];
const PanelSuperadminPrueba=crearSuperAdminDashboard({AUTH_RED,AUTH_MUTED,descargarCSV,traducirError,Field,dwNotify,requestDwConfirm,fmt$,Modal,DWIcon,loadSupabaseJs:async()=>({rpc:async(nombre,params)=>{
 saDemoCalls.push({nombre,params});
 if(!/^fn_super_(dashboard|listar_|metricas_|get_|detalle_|clausulas_|plantillas_|auditoria|pagos)/.test(nombre))throw new Error('La prueba no permite escrituras: '+nombre);
 if(nombre==='fn_super_dashboard')return saDemoData.error?{error:{message:'Fallo de prueba al cargar'}}:{data:saDemoData.dashboard};
 if(nombre==='fn_super_listar_inmobiliarias')return {data:saDemoData.inmobiliarias};
 if(nombre==='fn_super_listar_planes')return {data:saDemoData.planes};
 if(nombre==='fn_super_listar_solicitudes_registro')return {data:saDemoData.solicitudes};
 if(nombre==='fn_super_metricas_uso')return {data:saDemoData.metricas};
 if(nombre==='fn_super_get_anuncio_global')return {data:null};
 if(nombre==='fn_super_pagos')return {data:saDemoData.pagos};
 if(nombre==='fn_super_detalle_inmobiliaria'){const i=saDemoData.inmobiliarias.find(i=>i.inmobiliaria_id===params.p_inmobiliaria_id);return {data:{inmobiliaria:{nombre:i.inmobiliaria_nombre},membresia:{plan_nombre:i.plan_nombre,estado:i.estado,fecha_vencimiento:i.fecha_vencimiento},usuarios:[],pagos:[],auditoria:[],clausulas_count:2,bloques_count:8}};}
 return {data:[]};
}})});
`;
module.exports={data,source};
