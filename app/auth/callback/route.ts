import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveRole } from "@/lib/rbac";
import { absUrl } from "@/lib/site-url";

// GET /auth/callback?code=...&next=...
//
// Ruta de destino del magick link / OTP de Supabase (emailRedirectTo).
// Aquí es donde Supabase aterriza con el PKCE `code` tras que el usuario pulse el
// enlace del correo. El middleware NO hace el intercambio (rompe la sesión); debe
// hacerse aquí, antes de leer cualquier rol:
//
//   1. Intercambiar `code` por sesión (exchangeCodeForSession) -> establece el cookie.
//   2. Ya con sesión, leer public.users.role (fuente de verdad canónica).
//   3. Redirigir según rol: admin/gestor -> /dashboard/admin; el resto hacia su destino.
//
// Esto evita que un admin caiga siempre en el onboarding de atleta por el simple
// hecho de entrar por el enlace del correo.
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Sesión lista. Resolvemos el rol canónico para enrutar correctamente.
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        let dbRole: string | null = null;
        try {
          const { data: perfil } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();
          dbRole = perfil?.role ?? null;
        } catch {
          dbRole = null;
        }
        const rol = resolveRole({ dbRole, appMetadata: user.app_metadata });

        // Gestores (admin/coach/entrenador/club) van directos al panel de gestión.
        if (rol && ["admin", "coach", "entrenador", "club"].includes(rol)) {
          return NextResponse.redirect(absUrl("/dashboard/admin"));
        }
        // Atleta/tutor todavía en proceso de onboarding.
        if (rol === "atleta" || rol === "tutor") {
          return NextResponse.redirect(absUrl("/onboarding"));
        }
      }

      // Sin rol claro: al destino solicitado o al panel genérico.
      return NextResponse.redirect(absUrl(next));
    }
  }

  // Sin code o error en el intercambio: volvemos al login para reintentar.
  return NextResponse.redirect(absUrl("/login"));
}
