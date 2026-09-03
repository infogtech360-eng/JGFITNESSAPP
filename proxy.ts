import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Middleware de refresh de sesión (patrón oficial de @supabase/ssr para Next.js App Router).
//
// Por qué existe: los formularios de onboarding (saveAthleteProfile / saveGuardian) son
// Server Actions que leen la sesión con `createClient()` (server) vía cookies(). Sin este
// middleware, en producción la cookie de sesión NO se refresca en cada request → la sesión
// del magic-link/OTP puede quedar obsoleta y la Server Action devuelve "Sesión no iniciada".
// Aquí actualizamos (refresh) la sesión y propagamos las cookies nuevas en la respuesta,
// para que el server client siempre vea la sesión vigente.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Si faltan envs (runtime sin inyectar), no bloqueamos la navegación; pasamos.
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Importante: NO crear un usuario con la sesión. getUser() refresca la sesión si es necesario.
  await supabase.auth.getUser();

  return response;
}

// Aplicar a todas las rutas excepto assets estáticos, de modo que cualquier página/proxy
// bajo la sesión (dashboard, onboarding) reciba cookies de sesión refrescadas.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
