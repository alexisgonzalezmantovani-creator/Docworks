import { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from "react";

const marcador = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

function crearChip(token: string, label: string) {
  const chip = document.createElement("span");
  chip.setAttribute("contenteditable", "false");
  chip.dataset.dwToken = token;
  chip.dataset.testid = "dw-ajuste-chip";
  chip.title = "Campo automático";
  chip.className = "dw-redaccion-chip";
  chip.textContent = label;
  return chip;
}

function leerRedaccion(root: HTMLElement): string {
  let texto = "";
  for (const node of root.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      texto += node.textContent;
      continue;
    }
    if (!(node instanceof HTMLElement)) continue;
    if (node.dataset.dwToken) {
      texto += "{{" + node.dataset.dwToken + "}}";
    } else if (node.tagName === "BR") {
      if (root.childNodes.length > 1) texto += "\n";
    } else {
      // Enter puede crear bloques en Chromium y WebKit. Un bloque vacío
      // representa una nueva línea, incluido el último párrafo vacío.
      if (/^(DIV|P)$/.test(node.tagName) && node.previousSibling) texto += "\n";
      texto += leerRedaccion(node);
    }
  }
  return texto.replace(/\u00a0/g, " ");
}

function renderizarRedaccion(root: HTMLElement, value: string, labelToken: (token: string) => string) {
  const fragmento = document.createDocumentFragment();
  let inicio = 0;
  for (const match of value.matchAll(marcador)) {
    fragmento.append(value.slice(inicio, match.index), crearChip(match[1], labelToken(match[1])));
    inicio = match.index! + match[0].length;
  }
  fragmento.append(value.slice(inicio));
  root.replaceChildren(fragmento);
}

function marcadoresDelTexto(texto: string) {
  return Array.from(texto.matchAll(marcador), match => match[1]);
}

type Props = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  labelToken: (token: string) => string;
  disabled?: boolean;
  protegerChips?: boolean;
};
type EditorHandle = { insertarToken: (token: string) => void };

export const RedaccionClausula = forwardRef<EditorHandle, Props>(function RedaccionClausula(
  { value, onChange, label, labelToken, disabled, protegerChips }, ref
) {
  const editor = useRef<HTMLDivElement>(null);
  const ultimaRedaccion = useRef<string>();
  const cursor = useRef<Range>();

  useLayoutEffect(() => {
    const root = editor.current!;
    if (value === ultimaRedaccion.current) return;
    renderizarRedaccion(root, value, labelToken);
    cursor.current = undefined;
    ultimaRedaccion.current = value;
  }, [value, labelToken]);

  useLayoutEffect(() => {
    if (!protegerChips) return;
    const root = editor.current!;
    // El rango nativo también cubre borrados desde el teclado táctil y reemplazos.
    function proteger(event: InputEvent) {
      for (const objetivo of event.getTargetRanges?.() ?? []) {
        const rango = document.createRange();
        rango.setStart(objetivo.startContainer, objetivo.startOffset);
        rango.setEnd(objetivo.endContainer, objetivo.endOffset);
        if (!rango.collapsed && Array.from(root.querySelectorAll("[data-dw-token]")).some(chip => rango.intersectsNode(chip))) {
          event.preventDefault();
          return;
        }
      }
    }
    root.addEventListener("beforeinput", proteger);
    return () => root.removeEventListener("beforeinput", proteger);
  }, [protegerChips]);

  function guardarCursor() {
    const seleccion = window.getSelection();
    if (seleccion?.rangeCount && editor.current?.contains(seleccion.anchorNode) &&
        editor.current.contains(seleccion.focusNode)) {
      cursor.current = seleccion.getRangeAt(0).cloneRange();
    }
  }

  function actualizar(insercionAutorizada = false) {
    const root = editor.current!;
    const texto = leerRedaccion(root);
    const anterior = ultimaRedaccion.current ?? value;
    // Algunos cambios del sistema o del teclado no emiten beforeinput cancelable.
    if (protegerChips && !insercionAutorizada &&
        JSON.stringify(marcadoresDelTexto(texto)) !== JSON.stringify(marcadoresDelTexto(anterior))) {
      renderizarRedaccion(root, anterior, labelToken);
      const rango = document.createRange();
      rango.selectNodeContents(root);
      rango.collapse(false);
      const seleccion = window.getSelection();
      seleccion?.removeAllRanges();
      seleccion?.addRange(rango);
      guardarCursor();
      return;
    }
    ultimaRedaccion.current = texto;
    onChange(texto);
    guardarCursor();
  }

  useImperativeHandle(ref, () => ({
    insertarToken(token) {
      if (disabled) return;
      const root = editor.current!;
      const seleccion = window.getSelection();
      if (!seleccion) return;
      guardarCursor();
      const rango = cursor.current ?? document.createRange();
      if (!cursor.current) {
        rango.selectNodeContents(root);
        rango.collapse(false);
      }
      root.focus();
      if (protegerChips && !rango.collapsed &&
          Array.from(root.querySelectorAll("[data-dw-token]")).some(chip => rango.intersectsNode(chip))) {
        rango.collapse(false);
      }
      rango.deleteContents();
      const chip = crearChip(token, labelToken(token));
      rango.insertNode(chip);
      rango.setStartAfter(chip);
      rango.collapse(true);
      seleccion.removeAllRanges();
      seleccion.addRange(rango);
      actualizar(true);
    }
  }));

  return <div ref={editor} className="inp dw-redaccion-clausula" role="textbox"
    aria-label={label} aria-multiline="true" aria-disabled={disabled || undefined}
    contentEditable={!disabled} suppressContentEditableWarning
    onInput={() => actualizar()} onBlur={guardarCursor} onDrop={event => event.preventDefault()}
    onPaste={event => {
      event.preventDefault();
      // Inserción de texto nativa para conservar el historial de deshacer.
      document.execCommand("insertText", false, event.clipboardData.getData("text/plain"));
    }}
  />;
});
