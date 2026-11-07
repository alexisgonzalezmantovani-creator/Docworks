// Generado desde src/Captcha.ts por scripts/preparar-acceso.cjs. No editar.
var DocWorksCaptcha = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/Captcha.ts
  var Captcha_exports = {};
  __export(Captcha_exports, {
    solicitarCaptcha: () => solicitarCaptcha
  });
  var pendiente = false;
  var carga = null;
  function cargarTurnstile() {
    if (window.turnstile) return Promise.resolve(window.turnstile);
    if (carga) return carga;
    carga = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      const timer = setTimeout(() => terminar(new Error("No se pudo cargar la verificaci\xF3n. Revis\xE1 la conexi\xF3n y reintent\xE1.")), 15e3);
      function terminar(error) {
        clearTimeout(timer);
        script.onload = null;
        script.onerror = null;
        if (error) {
          script.remove();
          carga = null;
          reject(error);
        } else resolve(window.turnstile);
      }
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = () => terminar(window.turnstile ? void 0 : new Error("No se pudo cargar la verificaci\xF3n."));
      script.onerror = () => terminar(new Error("No se pudo cargar la verificaci\xF3n. Revis\xE1 la conexi\xF3n y reintent\xE1."));
      document.head.appendChild(script);
    });
    return carga;
  }
  async function solicitarCaptcha() {
    const config = typeof window === "undefined" ? null : window.DOCWORKS_CAPTCHA;
    if (!config?.enabled) return void 0;
    if (!config.sitekey || !/^[A-Za-z0-9_-]{10,100}$/.test(config.sitekey)) throw new Error("No se pudo iniciar la verificaci\xF3n. Contact\xE1 soporte.");
    if (pendiente) throw new Error("La verificaci\xF3n ya est\xE1 en curso.");
    pendiente = true;
    try {
      const api = await cargarTurnstile();
      return await new Promise((resolve, reject) => {
        const previo = document.activeElement;
        const dialog = document.createElement("dialog"), titulo = document.createElement("h2"), aviso = document.createElement("p"), widget = document.createElement("div"), cancel = document.createElement("button");
        let id, terminado = false;
        dialog.setAttribute("aria-label", "Verificaci\xF3n de seguridad");
        dialog.style.cssText = "box-sizing:border-box;width:calc(100% - 24px);max-width:370px;max-height:calc(100dvh - 24px);overflow:auto;border:1px solid #40516d;border-radius:16px;padding:20px;background:#0b1424;color:#f3f6fc;font:16px system-ui;";
        titulo.textContent = "Verific\xE1 tu acceso";
        titulo.style.cssText = "font-size:19px;margin:0 0 10px";
        aviso.textContent = "Complet\xE1 la verificaci\xF3n para continuar.";
        aviso.style.cssText = "font-size:14px;line-height:1.5";
        widget.style.cssText = "display:flex;justify-content:center";
        cancel.type = "button";
        cancel.textContent = "Cancelar";
        cancel.style.cssText = "min-height:44px;padding:10px 18px;margin-top:14px;background:#243753;border:1px solid #60718c;border-radius:9px;color:white;font:inherit;cursor:pointer;";
        function cerrar(error, token) {
          if (terminado) return;
          terminado = true;
          clearTimeout(timer);
          if (id !== void 0) try {
            api.remove(id);
          } catch {
          }
          dialog.remove();
          previo?.focus?.();
          if (error) reject(error);
          else resolve(token);
        }
        const timer = setTimeout(() => cerrar(new Error("La verificaci\xF3n venci\xF3. Volv\xE9 a intentarlo.")), 18e4);
        dialog.addEventListener("cancel", (e) => {
          e.preventDefault();
          cerrar(new Error("No se complet\xF3 la verificaci\xF3n."));
        });
        cancel.onclick = () => cerrar(new Error("No se complet\xF3 la verificaci\xF3n."));
        dialog.append(titulo, aviso, widget, cancel);
        document.body.appendChild(dialog);
        try {
          dialog.showModal();
          cancel.focus();
          id = api.render(widget, { sitekey: config.sitekey, theme: "dark", size: "compact", language: "es", callback: (token) => token ? cerrar(void 0, token) : cerrar(new Error("No se pudo validar la verificaci\xF3n.")), "error-callback": () => {
            cerrar(new Error("No se pudo validar la verificaci\xF3n. Reintent\xE1."));
            return true;
          }, "expired-callback": () => cerrar(new Error("La verificaci\xF3n venci\xF3. Volv\xE9 a intentarlo.")), "timeout-callback": () => cerrar(new Error("La verificaci\xF3n venci\xF3. Volv\xE9 a intentarlo.")) });
        } catch {
          cerrar(new Error("No se pudo iniciar la verificaci\xF3n. Revis\xE1 la conexi\xF3n y reintent\xE1."));
        }
      });
    } finally {
      pendiente = false;
    }
  }
  return __toCommonJS(Captcha_exports);
})();
