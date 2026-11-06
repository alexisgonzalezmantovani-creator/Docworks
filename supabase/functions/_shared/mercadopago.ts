// Lógica compartida sin credenciales embebidas. Las entradas Deno inyectan env/fetch.
// Referencias: docs de Webhooks y GET /authorized_payments de Mercado Pago.
type Env = (name: string) => string | undefined;
type Dependencies = { env: Env; fetch?: typeof fetch; now?: () => number };
const MP = 'https://api.mercadopago.com';
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
class ErrorHTTP extends Error { constructor(public status: number, message: string) { super(message); } }
function json(body: unknown, status = 200, cors = false) { return new Response(JSON.stringify(body), { status, headers: { ...(cors ? CORS : {}), 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }); }
function requerido(env: Env, key: string) { const v = env(key); if (!v) throw new ErrorHTTP(503, 'El servicio de pagos todavía no está configurado.'); return v; }
function resourceId(value: unknown) { const s = String(value ?? ''); if (!/^[A-Za-z0-9_-]{1,180}$/.test(s)) throw new ErrorHTTP(400, 'Identificador de pago inválido.'); return s; }
function urlCheckout(value: unknown) {
  try { const u = new URL(String(value || '')); if (u.protocol === 'https:' && /(^|\.)mercadopago\.(com|com\.ar|com\.br|com\.mx|cl|com\.co|com\.uy|com\.pe)$/.test(u.hostname)) return u.href; } catch (_) {}
  throw new ErrorHTTP(502, 'Mercado Pago no devolvió un enlace de pago válido.');
}
export function retornoSeguro(value: unknown, appURL: string) {
  const fallback = new URL(appURL); if (fallback.protocol !== 'https:') throw new ErrorHTTP(503, 'La dirección de retorno de pagos no está configurada.');
  try { const u = new URL(String(value || appURL)); if (u.protocol === 'https:' && u.origin === fallback.origin && !u.username && !u.password) return u.href; } catch (_) {}
  return fallback.href;
}
function clients(deps: Dependencies) {
  const request = deps.fetch || fetch, base = requerido(deps.env, 'SUPABASE_URL').replace(/\/$/, '');
  async function read(response: Response, message: string) { if (!response.ok) throw new ErrorHTTP(502, message); try { return await response.json(); } catch (_) { throw new ErrorHTTP(502, message); } }
  async function mp(path: string, options: RequestInit = {}) {
    const token = requerido(deps.env, 'MERCADOPAGO_ACCESS_TOKEN');
    return read(await request(MP + path, { ...options, headers: { ...Object.fromEntries(new Headers(options.headers)), Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(12000) }), 'No se pudo confirmar la operación con Mercado Pago.');
  }
  async function q(path: string, method = 'GET', body?: unknown, prefer?: string) {
    const key = requerido(deps.env, 'SUPABASE_SERVICE_ROLE_KEY');
    const r = await request(base + '/rest/v1/' + path, { method, headers: { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json', ...(prefer ? { Prefer: prefer } : {}) }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(12000) });
    if (!r.ok) throw new ErrorHTTP(502, 'No se pudo guardar la confirmación del pago.');
    const text = await r.text(); return text ? JSON.parse(text) : null;
  }
  return { request, base, mp, q, read };
}
function errorResponse(error: unknown, cors = false) {
  return json({ error: error instanceof ErrorHTTP ? error.message : 'No se pudo completar la operación de pagos. Intentá nuevamente.' }, error instanceof ErrorHTTP ? error.status : 502, cors);
}
export function crearManejadorSuscripciones(deps: Dependencies) {
  return async (req: Request) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
    if (req.method !== 'POST') return json({ error: 'Método no permitido.' }, 405, true);
    try {
      const match = /^Bearer\s+(\S+)$/i.exec(req.headers.get('Authorization') || '');
      if (!match) throw new ErrorHTTP(401, 'Iniciá sesión para gestionar la facturación.');
      const token = match[1], c = clients(deps), anon = requerido(deps.env, 'SUPABASE_ANON_KEY');
      // El ID del usuario se obtiene del servidor Auth; nunca del cuerpo ni de un JWT sin verificar.
      const auth = await c.request(c.base + '/auth/v1/user', { headers: { apikey: anon, Authorization: 'Bearer ' + token }, signal: AbortSignal.timeout(12000) });
      if (!auth.ok) throw new ErrorHTTP(401, 'La sesión venció. Volvé a ingresar.');
      const user = await auth.json(); if (!user.id) throw new ErrorHTTP(401, 'No se pudo verificar la sesión.');
      async function rpc(name: string, args: unknown) {
        const r = await c.request(c.base + '/rest/v1/rpc/' + name, { method: 'POST', headers: { apikey: anon, Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify(args), signal: AbortSignal.timeout(12000) });
        if (!r.ok) throw new ErrorHTTP(403, 'No se pudo validar el acceso a facturación.'); return r.json();
      }
      const inmobId = await rpc('fn_mi_inmobiliaria', {});
      if (!inmobId || !(await rpc('fn_es_admin', { p_usuario_id: user.id }))) throw new ErrorHTTP(403, 'Solo Dueño/Administrador puede gestionar la facturación.');
      let body: any; try { body = await req.json(); } catch (_) { throw new ErrorHTTP(400, 'Solicitud de pago inválida.'); }
      if (!body || !['sync', 'create_checkout'].includes(body.action)) throw new ErrorHTTP(400, 'Acción no soportada.');
      const ms = await c.q('membresias?select=*&inmobiliaria_id=eq.' + encodeURIComponent(inmobId));
      if (!ms.length) throw new ErrorHTTP(404, 'No se encontró la membresía de la inmobiliaria.');
      const membership = ms[0];
      if (body.action === 'sync') {
        if (!membership.mercadopago_preapproval_id) return json({ ok: true, connected: false }, 200, true);
        const s = await c.mp('/preapproval/' + resourceId(membership.mercadopago_preapproval_id));
        if (String(s.id) !== String(membership.mercadopago_preapproval_id)) throw new ErrorHTTP(502, 'La suscripción recibida no coincide con la membresía.');
        await c.q('membresias?id=eq.' + membership.id, 'PATCH', subscriptionPatch(s, deps));
        return json({ ok: true, connected: true, subscription: { id: s.id, status: s.status, next_payment_date: s.next_payment_date || null, payment_method_id: s.payment_method_id || null } }, 200, true);
      }
      if (!/^[a-zA-Z0-9_-]{1,80}$/.test(String(body.plan_codigo || ''))) throw new ErrorHTTP(400, 'Seleccioná un plan válido.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.payer_email || ''))) throw new ErrorHTTP(400, 'Completá un correo válido para la facturación.');
      const plans = await c.q('planes?select=id,codigo,nombre,precio_mensual,moneda,mercadopago_plan_id&codigo=eq.' + encodeURIComponent(body.plan_codigo) + '&activo=eq.true');
      if (!plans.length) throw new ErrorHTTP(404, 'Plan no encontrado.');
      const p = plans[0]; if (!(Number(p.precio_mensual) > 0) || !Number.isFinite(Number(p.precio_mensual))) throw new ErrorHTTP(400, 'El plan todavía no tiene un precio de cobro válido.');
      if (membership.mercadopago_preapproval_id) {
        const previous = await c.mp('/preapproval/' + resourceId(membership.mercadopago_preapproval_id));
        if (['authorized', 'active'].includes(previous.status)) throw new ErrorHTTP(409, 'Ya existe una suscripción activa. No se creó otra.');
        if (previous.status === 'pending') {
          if (membership.plan_id !== p.id) throw new ErrorHTTP(409, 'Hay un pago pendiente para otro plan. Resolvelo antes de iniciar uno nuevo.');
          return json({ ok: true, reused: true, init_point: urlCheckout(previous.init_point || membership.mercadopago_init_point), subscription_id: previous.id }, 200, true);
        }
        if (previous.status !== 'cancelled') throw new ErrorHTTP(409, 'Revisá la suscripción existente antes de iniciar otra.');
      }
      // Cambiar de plan requiere un flujo de migración: abrir un checkout no habilita beneficios.
      if (membership.plan_id !== p.id) throw new ErrorHTTP(409, 'El plan solicitado no coincide con la membresía. Solicitá el cambio de plan antes de iniciar el pago.');
      const back = retornoSeguro(body.back_url, deps.env('DOCWORKS_APP_URL') || 'https://docworks-eight.vercel.app/');
      requerido(deps.env, 'MERCADOPAGO_WEBHOOK_SECRET');
      // Checkout alojado sin tarjeta previa: suscripción pending SIN plan de MP asociado.
      // El plan comercial de DocWorks sigue siendo el de la membresía y fija el importe.
      requerido(deps.env, 'MERCADOPAGO_ACCESS_TOKEN');
      const intento = await c.q('rpc/fn_mp_reservar_checkout', 'POST', { p_membresia_id: membership.id, p_plan_id: p.id, p_monto: Number(p.precio_mensual), p_moneda: p.moneda || 'ARS', p_correo: String(body.payer_email).trim(), p_previo_id: membership.mercadopago_preapproval_id || null });
      if (!intento?.clave || !intento?.referencia) throw new ErrorHTTP(502, 'No se pudo reservar el checkout.');
      let sub: any;
      if (intento.nuevo) {
        // Una sola instancia recibe nuevo=true. Un fallo ambiguo conserva la reserva.
        sub = await c.mp('/preapproval', { method: 'POST', body: JSON.stringify({ auto_recurring: { frequency: 1, frequency_type: "months", transaction_amount: Number(p.precio_mensual), currency_id: p.moneda || "ARS" }, reason: 'DocWorks - ' + p.nombre, external_reference: intento.referencia, payer_email: intento.correo, back_url: back, status: 'pending' }) });
      } else {
        // Nunca repetir POST después de un timeout: recuperar sólo por referencia exacta.
        const found: any[] = [];
        for (let offset = 0; offset < 1000; offset += 100) {
          const search = await c.mp('/preapproval/search?payer_email=' + encodeURIComponent(intento.correo) + '&limit=100&offset=' + offset);
          if (!Array.isArray(search.results)) throw new ErrorHTTP(502, 'No se pudo verificar el checkout anterior.');
          found.push(...search.results.filter((x: any) => String(x.external_reference) === intento.referencia));
          if (search.results.length < 100 || offset + 100 >= Number(search.paging?.total || 0)) break;
        }
        if (found.length !== 1) throw new ErrorHTTP(409, 'El checkout anterior sigue en verificación. No se inició otro. Sincronizá o contactá a soporte.');
        sub = await c.mp('/preapproval/' + resourceId(found[0].id));
        if (String(sub.external_reference) !== intento.referencia || Number(sub.auto_recurring?.transaction_amount) !== Number(intento.monto) || sub.auto_recurring?.currency_id !== intento.moneda) throw new ErrorHTTP(409, 'El checkout recuperado no coincide con la reserva. Contactá a soporte.');
      }
      const link = urlCheckout(sub.init_point); resourceId(sub.id);
      await c.q('rpc/fn_mp_finalizar_checkout', 'POST', { p_membresia_id: membership.id, p_clave: intento.clave, p_id: String(sub.id), p_enlace: link, p_estado: sub.status || 'pending' });
      return json({ ok: true, init_point: link, subscription_id: sub.id }, 200, true);
    } catch (error) { return errorResponse(error, true); }
  };
}
function subscriptionPatch(s: any, deps: Dependencies) {
  const patch: any = { mercadopago_status: s.status || null, mercadopago_payment_method_id: s.payment_method_id || null, proximo_pago_en: s.next_payment_date || null, mercadopago_last_sync_at: new Date((deps.now || Date.now)()).toISOString() };
  // Pending/paused no eliminan una prueba o período ya abonado. La confirmación autoritativa activa/cancela.
  if (['authorized', 'active'].includes(s.status)) { patch.estado = 'activa'; patch.es_prueba = false; }
  if (s.status === 'cancelled') patch.estado = 'cancelada';
  return patch;
}
export async function firmaWebhookValida(req: Request, secret: string) {
  if (!secret) return false;
  const raw = req.headers.get('x-signature') || '', rid = req.headers.get('x-request-id') || '', id = new URL(req.url).searchParams.get('data.id') || '';
  const pieces = raw.split(',').map(x => x.trim().split('='));
  if (!rid || !id || pieces.length !== 2 || pieces.some(x => x.length !== 2) || new Set(pieces.map(x => x[0])).size !== 2) return false;
  const values = Object.fromEntries(pieces); if (!/^\d{1,16}$/.test(values.ts || '') || !/^[0-9a-f]{64}$/i.test(values.v1 || '')) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const expected = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('id:' + id.toLowerCase() + ';request-id:' + rid + ';ts:' + values.ts + ';')));
  const actual = Uint8Array.from(values.v1.match(/../g), x => parseInt(String(x), 16)); let diff = 0; for (let i = 0; i < expected.length; i++) diff |= expected[i] ^ actual[i]; return diff === 0;
}
export function crearManejadorWebhook(deps: Dependencies) {
  return async (req: Request) => {
    if (req.method !== 'POST') return json({ error: 'Método no permitido.' }, 405);
    try {
      const secret = requerido(deps.env, 'MERCADOPAGO_WEBHOOK_SECRET');
      if (!(await firmaWebhookValida(req, secret))) throw new ErrorHTTP(401, 'Notificación de pago no autenticada.');
      let body: any; try { body = await req.json(); } catch (_) { throw new ErrorHTTP(400, 'Notificación inválida.'); }
      const id = resourceId(new URL(req.url).searchParams.get('data.id'));
      if (body?.data?.id !== undefined && String(body.data.id).toLowerCase() !== id.toLowerCase()) throw new ErrorHTTP(400, 'El recurso notificado no coincide con la firma.');
      const type = body?.type || body?.topic;
      if (!['subscription_preapproval', 'subscription_authorized_payment'].includes(type)) return json({ ok: true, ignored: true });
      const c = clients(deps);
      if (type === 'subscription_preapproval') {
        const s = await c.mp('/preapproval/' + id);
        if (String(s.id).toLowerCase() !== id.toLowerCase()) throw new ErrorHTTP(502, 'La suscripción recibida no coincide con la notificación.');
        const ms = await c.q('membresias?select=id&mercadopago_preapproval_id=eq.' + encodeURIComponent(id));
        if (ms.length) await c.q('membresias?id=eq.' + ms[0].id, 'PATCH', subscriptionPatch(s, deps));
        return json({ ok: true, matched: !!ms.length });
      }
      const a = await c.mp('/authorized_payments/' + id);
      if (String(a.id).toLowerCase() !== id.toLowerCase()) throw new ErrorHTTP(502, 'La factura recibida no coincide con la notificación.');
      const preapproval = resourceId(a.preapproval_id);
      const ms = await c.q('membresias?select=id,inmobiliaria_id&mercadopago_preapproval_id=eq.' + encodeURIComponent(preapproval));
      if (!ms.length) return json({ ok: true, matched: false });
      const ext = String(a.external_reference || ''), tenant = /^DOCWORKS-([0-9a-f-]{36})-/i.exec(ext)?.[1];
      if (!tenant || tenant !== ms[0].inmobiliaria_id) throw new ErrorHTTP(409, 'La referencia del pago no coincide con la membresía.');
      const approved = a.payment?.status === 'approved';
      const estado = approved ? 'pagado' : ['rejected', 'cancelled', 'refunded', 'charged_back'].includes(a.payment?.status) ? a.payment.status : 'pendiente';
      const amount = Number(a.transaction_amount); if (!Number.isFinite(amount) || amount <= 0) throw new ErrorHTTP(502, 'La factura recibida no tiene un importe válido.');
      await c.q('pagos?on_conflict=mercadopago_authorized_payment_id', 'POST', { membresia_id: ms[0].id, monto: amount, moneda: a.currency_id || 'ARS', estado, proveedor: 'Mercado Pago', mercadopago_authorized_payment_id: id, metodo_pago: a.payment_method_id || null, fecha_pago: approved ? a.date_created || new Date((deps.now || Date.now)()).toISOString() : null, referencia_externa: ext, metadata: { status: a.status, payment_status: a.payment?.status || null, payment_id: a.payment?.id || null, preapproval_id: preapproval } }, 'resolution=merge-duplicates,return=minimal');
      return json({ ok: true, matched: true });
    } catch (error) { return errorResponse(error); }
  };
}
