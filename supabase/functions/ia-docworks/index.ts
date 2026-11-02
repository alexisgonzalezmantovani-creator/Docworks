import { validarConsultaGenerica } from "../../../src/PrivacidadIA.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BOTIA_SYSTEM = `
Sos el asistente de IA de DocWorks, una aplicación profesional para gestión y documentación inmobiliaria en Argentina.
Tu función es responder consultas generales y ayudar con cláusulas genéricas. No revises contratos ni operaciones concretas, no solicites datos personales o confidenciales y usá marcadores como [NOMBRE], [DNI] y [DOMICILIO] en los ejemplos.
Contexto principal: Argentina, especialmente CABA y Provincia de Buenos Aires.
Respondé siempre en español argentino profesional, claro y directo.
Cuando corresponda, podés mencionar legislación, artículos o conceptos jurídicos, pero no inventes normas ni números de artículos.
Si una cuestión requiere interpretación jurídica profesional, aclaralo. Tu respuesta es asistencia y no reemplaza el asesoramiento de un abogado.
No seas excesivamente verborrágico. Priorizá respuestas útiles, prácticas y concretas.
`;

const CLAUSULA_SYSTEM = `
Sos un asistente especializado en redacción de cláusulas para documentos inmobiliarios argentinos.
Contexto principal: Argentina, especialmente CABA y Provincia de Buenos Aires.
El usuario te dará una idea breve y genérica de una cláusula. No incluyas nombres, identificadores ni domicilios de personas: utilizá marcadores como [NOMBRE], [DNI] y [DOMICILIO].
Tenés que convertir esa idea en una cláusula profesional, clara y jurídicamente coherente para utilizar en un documento inmobiliario.
Respondé EXCLUSIVAMENTE con JSON válido, exactamente con esta estructura:
{"titulo":"Título breve de la cláusula","categoria":"general|posesion|pago|rescision|impuestos|alquiler","contenido":"Texto completo de la cláusula"}
No agregues markdown ni explicaciones fuera del JSON.
`;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" } });
}

function normalizeMessages(messages: any[]) {
  if (!Array.isArray(messages)) return [];
  return messages.filter((m) => m && m.content != null).map((m) => {
    const role = m.role === "assistant" || m.role === "model" ? "model" : "user";
    const content = m.content;
    if (typeof content === "string") return { role, parts: [{ text: content }] };
    if (Array.isArray(content)) {
      const parts = content.flatMap((part: any) => {
        if (!part) return [];
        if (part.type === "text" && typeof part.text === "string") return [{ text: part.text }];
        if (part.type === "image" && part.source?.type === "base64" && part.source?.data) {
          return [{ inlineData: { mimeType: part.source.media_type || "image/jpeg", data: part.source.data } }];
        }
        if (part.type === "document" && part.source?.type === "base64" && part.source?.data) {
          return [{ inlineData: { mimeType: part.source.media_type || "application/pdf", data: part.source.data } }];
        }
        return [];
      });
      return { role, parts };
    }
    return { role, parts: [{ text: String(content) }] };
  }).filter((m) => m.parts.length > 0);
}

async function verifyUser(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) throw new Error("No se encontró una sesión válida.");
  const token = authHeader.replace("Bearer ", "").trim();
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !supabaseAnonKey) throw new Error("Faltan las variables de Supabase.");
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}`, apikey: supabaseAnonKey },
  });
  if (!response.ok) throw new Error("La sesión de usuario no es válida.");
  return await response.json();
}

async function callGemini(apiKey: string, model: string, systemInstruction: string, messages: any[], maxOutputTokens: number) {
  const contents = normalizeMessages(messages);
  if (!contents.length) throw new Error("No se recibió ningún mensaje.");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents,
      generationConfig: { temperature: 0.3, maxOutputTokens },
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    console.error("Gemini API error; status:", response.status);
    // Si el modelo principal está saturado o alcanza un límite temporal,
    // reintentar una vez con un modelo Flash alternativo antes de fallar.
    if ((response.status === 429 || response.status === 503) && model !== "gemini-2.5-flash") {
      console.warn("Gemini model fallback:", model, "-> gemini-2.5-flash", response.status);
      return await callGemini(apiKey, "gemini-2.5-flash", systemInstruction, messages, maxOutputTokens);
    }
    throw new Error(data?.error?.message || "Gemini no pudo procesar la solicitud.");
  }
  const text = data?.candidates?.[0]?.content?.parts?.filter((p: any) => typeof p?.text === "string").map((p: any) => p.text).join("") || "";
  if (!text) throw new Error("Gemini no devolvió texto.");
  return text;
}

function cleanJsonText(text: string) {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) cleaned = cleaned.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
  return cleaned;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ ok: false, error: "Método no permitido.", text: "Método no permitido." }, 200);

  try {
    // Rechazar formatos de clientes anteriores y adjuntos antes de contactar a Gemini.
    const rawBody = await req.text();
    if (rawBody.length > 60000) return jsonResponse({ok:false,code:"IA_SOLO_GENERICA",error:"Usá una consulta breve y genérica, sin contratos ni adjuntos."});
    let payload: any;
    try { payload=JSON.parse(rawBody); } catch { return jsonResponse({ok:false,code:"IA_SOLICITUD_INVALIDA",error:"Solicitud de IA inválida."}); }
    if (!payload || !["generic_chat","generic_clause"].includes(payload.mode) || Object.keys(payload).some(k=>!["mode","messages"].includes(k))) {
      return jsonResponse({ok:false,code:"IA_SOLO_GENERICA",error:"Solo están habilitadas las consultas y cláusulas genéricas. La revisión de operaciones y los adjuntos no están disponibles."});
    }
    if (!Array.isArray(payload.messages) || !payload.messages.length || payload.messages.length>12) {
      return jsonResponse({ok:false,code:"IA_SOLICITUD_INVALIDA",error:"La consulta es demasiado extensa. Iniciá una conversación nueva."});
    }
    let messages: any[];
    try {
      messages=payload.messages.map((m: any)=>{
        if (!m || !["user","assistant"].includes(m.role) || Object.keys(m).some(k=>!["role","content"].includes(k))) throw new Error("Solo se admite texto genérico, sin archivos ni datos de operaciones.");
        return {role:m.role,content:validarConsultaGenerica(m.content)};
      });
      if(messages.reduce((n,m)=>n+m.content.length,0)>16000) throw new Error("La conversación es demasiado extensa. Iniciá una conversación nueva.");
    } catch (error) {
      return jsonResponse({ok:false,code:"IA_DATOS_NO_ADMITIDOS",error:error instanceof Error?error.message:"Usá una consulta genérica sin datos personales."});
    }
    await verifyUser(req);
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) throw new Error("No está configurado el secreto GEMINI_API_KEY en Supabase.");

    const model = "gemini-3.6-flash";

    if (payload.mode === "generic_chat") {
      const text = await callGemini(geminiApiKey, model, BOTIA_SYSTEM, messages, 4096);
      return jsonResponse({ ok: true, mode: "generic_chat", text });
    }

    if (payload.mode === "generic_clause") {
      const text = await callGemini(geminiApiKey, model, CLAUSULA_SYSTEM, messages, 3000);
      const cleaned = cleanJsonText(text);
      let parsed;
      try { parsed = JSON.parse(cleaned); } catch { throw new Error("Gemini generó una cláusula pero la respuesta no tuvo un formato válido."); }
      return jsonResponse({ ok: true, mode: "generic_clause", text: JSON.stringify(parsed) });
    }

    throw new Error("Modo de IA no reconocido");
  } catch (error) {
    console.error("ia-docworks: solicitud no completada");
    return jsonResponse({ ok: false, error: error instanceof Error ? error.message : "Error desconocido en la función de IA.", text: error instanceof Error ? error.message : "Error desconocido en la función de IA." }, 200);
  }
});
