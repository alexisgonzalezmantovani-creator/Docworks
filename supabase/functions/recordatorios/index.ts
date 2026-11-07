import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import {crearManejadorRecordatorios} from '../_shared/recordatorios.ts';
Deno.serve(crearManejadorRecordatorios({env:name=>Deno.env.get(name)}));
