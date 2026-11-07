import { Analytics } from '@vercel/analytics/react';

// La app sólo mide la visita a /. Jamás manda IDs, emails, hashes o parámetros
// de confirmación/recuperación. Las métricas de uso provienen de la base con RLS.
export function limpiarEventoVisita(event){
  if(event.type!=='pageview')return null;
  try{const url=new URL(event.url);return {...event,url:url.origin+'/'};}catch{return null;}
}
export function AnaliticaVisitas(){
  return <Analytics mode="production" beforeSend={limpiarEventoVisita}/>;
}
