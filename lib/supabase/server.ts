import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cliente Supabase del lado del servidor (middleware / server components / route handlers).
// En Next.js 16, cookies() es async: se debe await.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
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
    }
  );
}
