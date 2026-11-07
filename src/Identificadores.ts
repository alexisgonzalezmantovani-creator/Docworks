// IDs compatibles con los UUID históricos, sin recurrir a Math.random.
export function crearIdentificadorSeguro(fuente:Pick<Crypto,'randomUUID'|'getRandomValues'>=globalThis.crypto):string{
  try{if(fuente?.randomUUID)return fuente.randomUUID();}catch{/* Usar la fuente criptográfica compatible. */}
  if(!fuente?.getRandomValues)throw Error('No se pudo generar un identificador seguro. Abrí DocWorks mediante HTTPS.');
  const bytes=new Uint8Array(16);fuente.getRandomValues(bytes);
  bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
  const h=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
  return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20);
}
