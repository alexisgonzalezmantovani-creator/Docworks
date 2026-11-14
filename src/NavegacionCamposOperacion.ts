// Navegación de teclado de una operación: no modifica los valores ni envía formularios.
// En iOS Enter/Retorno avanza al próximo campo. En textarea conserva el salto de línea.
type ElementoCampo = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
type EventoEnter = {
 key: string; target: EventTarget | null; defaultPrevented: boolean;
 shiftKey: boolean; ctrlKey: boolean; altKey: boolean; metaKey: boolean;
 isComposing?: boolean; nativeEvent?: {isComposing?: boolean; keyCode?: number};
 preventDefault: () => void;
};
const TIPOS_EXCLUIDOS = new Set(["hidden","checkbox","radio","file","button","submit","reset","image","color","range"]);
const TIPOS_ENTER_NATIVO = new Set(["date","time","datetime-local","month","week"]);
function esCampoDeCarga(nodo: Element): nodo is ElementoCampo {
 if(nodo.tagName==="TEXTAREA"||nodo.tagName==="SELECT")return true;
 return nodo.tagName==="INPUT"&&!TIPOS_EXCLUIDOS.has((nodo as HTMLInputElement).type);
}
function campoDisponible(nodo: ElementoCampo): boolean {
 if(nodo.disabled||("readOnly" in nodo&&nodo.readOnly)||nodo.closest("[hidden],[inert],[aria-hidden='true']"))return false;
 if(!nodo.getClientRects().length)return false;
 const estilos=window.getComputedStyle(nodo);
 return estilos.display!=="none"&&estilos.visibility!=="hidden";
}
function esFuenteEnter(nodo: Element): nodo is HTMLInputElement {
 if(nodo.tagName!=="INPUT")return false;
 const input=nodo as HTMLInputElement;
 return !TIPOS_EXCLUIDOS.has(input.type)&&!TIPOS_ENTER_NATIVO.has(input.type)&&
  input.getAttribute("role")!=="combobox"&&!input.hasAttribute("aria-autocomplete");
}
function camposDelPaso(contenedor: HTMLElement): ElementoCampo[] {
 return Array.from(contenedor.querySelectorAll("input, textarea, select")).filter(
  (nodo): nodo is ElementoCampo => esCampoDeCarga(nodo)&&campoDisponible(nodo as ElementoCampo)
 );
}
export function prepararTecladoOperacion(contenedor: HTMLElement): void {
 const campos=camposDelPaso(contenedor);
 campos.forEach((campo,i)=>{
  if(!esFuenteEnter(campo))return;
  const indicacion=i<campos.length-1?"next":"done";
  if(campo.getAttribute("enterkeyhint")!==indicacion)campo.setAttribute("enterkeyhint",indicacion);
 });
}
export function avanzarConEnterOperacion(evento: EventoEnter, contenedor: HTMLElement): boolean {
 if(evento.key!=="Enter"||evento.defaultPrevented||evento.isComposing||evento.nativeEvent?.isComposing||
    evento.nativeEvent?.keyCode===229||evento.shiftKey||evento.ctrlKey||evento.altKey||evento.metaKey)return false;
 const origen=evento.target;
 if(!(origen instanceof Element)||!contenedor.contains(origen)||!esFuenteEnter(origen))return false;
 const campos=camposDelPaso(contenedor),indice=campos.indexOf(origen);
 if(indice<0)return false;
 // Evita enviar accidentalmente el formulario al tocar Enter en un input.
 evento.preventDefault();
 const siguiente=campos[indice+1];
 if(siguiente)siguiente.focus();else origen.blur(); // «Listo» cierra teclado, sin avanzar de paso automáticamente.
 return true;
}
