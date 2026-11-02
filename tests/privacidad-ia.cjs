const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Ejecuta el manejador real y falla si lee un cuerpo o intenta transmitir datos.
const source = fs.readFileSync(path.join(__dirname, '../supabase/functions/ia-docworks/index.ts'), 'utf8');
let handler, requests = 0;
const code = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText;
vm.runInNewContext(code, {
  Deno: { serve(fn) { handler = fn; }, env: { get() { return undefined; } } },
  Response,
  console,
  fetch() { requests++; throw new Error('La función pausada no debe transmitir datos'); },
});

(async () => {
  for (const mode of ['chat', 'clause', 'archivo', 'desconocido']) {
    const req = {
      method: 'POST',
      headers: new Headers({ Authorization: 'Bearer prueba-sin-datos-reales' }),
      text() { throw new Error('La función pausada no debe leer el cuerpo: ' + mode); },
    };
    const response = await handler(req);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.ok, false);
    assert.equal(body.code, 'IA_PRIVACIDAD_PAUSADA');
    assert.equal(requests, 0);
  }
  const options = await handler({ method: 'OPTIONS' });
  assert.equal(await options.text(), 'ok');
  assert.ok(options.headers.get('Access-Control-Allow-Origin'));
  const get = await handler({ method: 'GET' });
  assert.equal((await get.json()).ok, false);
  assert.equal(requests, 0);
  console.log('OK IA pausada: no lee documentos ni transmite datos; CORS y respuesta del endpoint conservados.');
})().catch(error => { console.error(error); process.exitCode = 1; });
