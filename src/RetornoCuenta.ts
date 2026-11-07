const CLAVES_AUTH=['access_token','refresh_token','provider_token','provider_refresh_token','token','token_hash','expires_in','expires_at','token_type','code','error','error_code','error_description'];
export function accionEnlaceCuenta(href:string){
  try{const u=new URL(href),hash=new URLSearchParams(u.hash.slice(1));if(errorEnlaceCuenta(href))return null;const tipo=hash.get('type')||u.searchParams.get('type');return tipo==='invite'||tipo==='recovery'?tipo:null;}catch{return null;}
}
export function errorEnlaceCuenta(href:string){
  try{const u=new URL(href),hash=new URLSearchParams(u.hash.slice(1));if(['error','error_code','error_description'].some(k=>hash.has(k)||u.searchParams.has(k)))return 'No se pudo validar el enlace del correo. Puede haber vencido o haber sido usado. Solicitá un enlace nuevo para continuar.';}catch{}
  return null;
}
export function urlSinCredenciales(href:string){
  const u=new URL(href),hash=new URLSearchParams(u.hash.slice(1));
  const limpiar=params=>{for(const key of CLAVES_AUTH)params.delete(key);if(['invite','recovery','signup','email_change','magiclink'].includes(params.get('type')))params.delete('type');};
  limpiar(u.searchParams);
  if(CLAVES_AUTH.some(k=>hash.has(k))||['invite','recovery','signup','email_change','magiclink'].includes(hash.get('type'))){limpiar(hash);u.hash=hash.toString();}
  return u.pathname+u.search+u.hash;
}
