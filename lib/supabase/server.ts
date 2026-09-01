import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cliente Supabase del lado del servidor (middleware / server components / route handlers).
// En Next.js 16, cookies() es async: se debe await.
//
// Parche defensivo Netlify: el runtime de las funciones serverless de Next.js puede llegar
// sin las NEXT_PUBLIC_* inyectadas. Validamos su presencia antes de invocar la SDK para
// lanzar un error descriptivo (visible en function logs) en lugar de un 500 genérico, y
// endurecemos el acceso a cookies() para no romper el render en contextos serverless.
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      `[supabase/server] Faltan variables de entorno en el runtime. ` +
        `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl ? "ok" : "MISSING"}, ` +
        `NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey ? "ok" : "MISSING"}. ` +
        `Verifica que estén en Netlify (Site configuration → Environment variables, contexto ALL).`
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        try {
          return cookieStore.getAll();
        } catch {
          // Contexto serverless sin acceso a cookies: devolvemos vacío en vez de romper.
          return [];
        }
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Se llama desde un Server Component; el middleware refresca la sesión
          // fuera del render, así que es seguro ignorar el error aquí.
        }
      },
    },
  });
}
