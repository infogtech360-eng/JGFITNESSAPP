import { createBrowserClient } from "@supabase/ssr";

// Cliente Supabase del lado del navegador (público).
// Las variables NEXT_PUBLIC_ son seguras para exponer en el cliente;
// la seguridad real está en RLS (Row Level Security) del lado de Supabase.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
