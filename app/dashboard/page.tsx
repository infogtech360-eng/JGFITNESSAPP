import { createClient } from "@/lib/supabase/server";
import { resolveRole, esRolGestion } from "@/lib/rbac";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/actions/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
        <div className="text-center">
          <p className="text-white">No has iniciado sesión.</p>
          <Link href="/login" className="mt-4 inline-block text-blue-400 hover:underline">
            Iniciar sesión
          </Link>
        </div>
      </main>
    );
  }

  // Rol canónico: public.users como fuente de verdad, con fallback al app_metadata del JWT.
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
  const rol = resolveRole({ dbRole, appMetadata: user.app_metadata }) ?? "atleta";

  // Verificación server-side: los roles de gestión (admin/coach/entrenador/club) NO ven
  // la vista de atleta. Van directos a su panel de gestión /dashboard/admin.
  if (esRolGestion(rol)) {
    redirect("/dashboard/admin");
  }

  const email = user.email ?? "";

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-black tracking-tight">
            JG <span className="text-blue-600">IMPULSA</span>
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <p className="text-sm text-gray-500">Bienvenido/a,</p>
          <h1 className="text-3xl font-black text-gray-900">
            {email.split("@")[0]} <span className="text-blue-600">👋</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Rol: <span className="font-semibold capitalize">{rol}</span>
          </p>
          <div className="mt-6 rounded-xl bg-blue-50 p-5">
            <h2 className="font-bold text-gray-900">Tu perfil está listo ✅</h2>
            <p className="mt-1 text-sm text-gray-600">
              Tu acompañamiento en JG IMPULSA comienza aquí. Próximamente:
              seguimiento de tus pilares MENTAL · EMOCIONAL · TÁCTICO y tu plan
              personalizado.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { t: "🧠 Mental", d: "Concentración y confianza competitiva" },
            { t: "❤️ Emocional", d: "Equilibrio y gestión del estrés" },
            { t: "⚔️ Táctico", d: "Lectura de juego y decisiones" },
          ].map((p) => (
            <div key={p.t} className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="font-bold text-gray-900">{p.t}</h3>
              <p className="mt-1 text-sm text-gray-500">{p.d}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
