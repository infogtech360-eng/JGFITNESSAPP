// Cliente Supabase con rol de servicio (SOLO server-side). Nunca exponer en el cliente.
// Se usa en route handlers y procesos que requieren operar con privilegios
// (por ejemplo, registros administrativos), siempre cuidando RBAC + mínimo privilegio.
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
