import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { crearManejadorSuscripciones } from "../_shared/mercadopago.ts";
Deno.serve(crearManejadorSuscripciones({ env: (name) => Deno.env.get(name) }));
