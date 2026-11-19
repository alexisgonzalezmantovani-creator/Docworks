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

type Props = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  labelToken: (token: string) => string;
  disabled?: boolean;
};
type EditorHandle = { insertarToken: (token: string) => void };

export const RedaccionClausula = forwardRef<EditorHandle, Props>(function RedaccionClausula(
  { value, onChange, label, labelToken, disabled }, ref
) {
  const editor = useRef<HTMLDivElement>(null);
  const ultimaRedaccion = useRef<string>();
  const cursor = useRef<Range>();

  useLayoutEffect(() => {
    const root = editor.current!;
    if (value === ultimaRedaccion.current) return;
    const fragmento = document.createDocumentFragment();
    let inicio = 0;
    for (const match of value.matchAll(marcador)) {
      fragmento.append(value.slice(inicio, match.index), crearChip(match[1], labelToken(match[1])));
      inicio = match.index! + match[0].length;
    }
    fragmento.append(value.slice(inicio));
    root.replaceChildren(fragmento);
    cursor.current = undefined;
    ultimaRedaccion.current = value;
  }, [value, labelToken]);

  function guardarCursor() {
    const seleccion = window.getSelection();
    if (seleccion?.rangeCount && editor.current?.contains(seleccion.anchorNode) &&
        editor.current.contains(seleccion.focusNode)) {
      cursor.current = seleccion.getRangeAt(0).cloneRange();
    }
  }

  function actualizar() {
    const texto = leerRedaccion(editor.current!);
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
      rango.deleteContents();
      const chip = crearChip(token, labelToken(token));
      rango.insertNode(chip);
      rango.setStartAfter(chip);
      rango.collapse(true);
      seleccion.removeAllRanges();
      seleccion.addRange(rango);
      actualizar();
    }
  }));

  return <div ref={editor} className="inp dw-redaccion-clausula" role="textbox"
    aria-label={label} aria-multiline="true" aria-disabled={disabled || undefined}
    contentEditable={!disabled} suppressContentEditableWarning
    onInput={actualizar} onBlur={guardarCursor} onDrop={event => event.preventDefault()}
    onPaste={event => {
      event.preventDefault();
      // Inserción de texto nativa para conservar el historial de deshacer.
      document.execCommand("insertText", false, event.clipboardData.getData("text/plain"));
    }}
  />;
});
