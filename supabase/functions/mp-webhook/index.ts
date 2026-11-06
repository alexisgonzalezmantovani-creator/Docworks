import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { crearManejadorWebhook } from "../_shared/mercadopago.ts";
Deno.serve(crearManejadorWebhook({ env: (name) => Deno.env.get(name) }));
