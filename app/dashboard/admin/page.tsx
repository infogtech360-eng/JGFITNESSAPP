import { createClient } from "@/lib/supabase/server";
import { getAtletas } from "@/lib/data/atletas";
import { AtletasAdminClient } from "@/components/admin/AtletasAdminClient";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; deporte?: string; q?: string; vista?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Solo admin/coach (rol del app_metadata). Otros roles ven un acceso denegado.
  const rol = (user.app_metadata?.rol as string) ?? (user.app_metadata?.role as string) ?? null;
  const esAdminOCoach = rol === "admin" || rol === "coach" || rol === "entrenador" || rol === "club";
  if (!esAdminOCoach) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-4xl">🔒</p>
          <h1 className="mt-3 text-xl font-black text-gray-900">Acceso restringido</h1>
          <p className="mt-2 text-sm text-gray-500">
            Esta vista es solo para administradores y entrenadores.
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline"
          >
            Volver a mi panel
          </Link>
        </div>
      </main>
    );
  }

  const sp = await searchParams;
  const { atletas, categorias, deportes } = await getAtletas({
    categoria: sp.categoria,
    deporte: sp.deporte,
    q: sp.q,
  });

  // Filtros activos para mostrar en el cliente
  const vParams = {
    categoria: sp.categoria ?? "",
    deporte: sp.deporte ?? "",
    q: sp.q ?? "",
    vista: sp.vista ?? "tabla",
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-black tracking-tight">
            JG <span className="text-blue-600">IMPULSA</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-gray-600 hover:text-gray-900"
            >
              Mi panel
            </Link>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
              {rol}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900">Atletas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona y filtra los perfiles deportivos creados en JG IMPULSA.
          </p>
        </div>

        <AtletasAdminClient
          atletas={atletas}
          categorias={categorias}
          deportes={deportes}
          filtrosIniciales={vParams}
          total={atletas.length}
        />
      </div>
    </main>
  );
}
