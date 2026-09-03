import { createClient } from "@/lib/supabase/server";
import { getAtletas } from "@/lib/data/atletas";
import { getLeads } from "@/lib/data/leads";
import { AtletasAdminClient } from "@/components/admin/AtletasAdminClient";
import { BandejaLeadsClient } from "@/components/admin/BandejaLeadsClient";
import { resolveRole, esRolGestion } from "@/lib/rbac";
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

  // Rol canónico desde public.users (fuente de verdad, escalable por SQL en caliente).
  // Si la fila aún no existe o no trae role, se cae al app_metadata del JWT.
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
  const rol = resolveRole({ dbRole, appMetadata: user.app_metadata }) ?? null;
  const esAdminOCoach = esRolGestion(rol);
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
          {dbRole === null && rol && (
            <p className="mt-3 text-xs text-gray-400">Rol detectado: {rol}</p>
          )}
        </div>
      </main>
    );
  }

  const sp = await searchParams;
  // vista principal: "atletas" (tabla/fichas) o "leads" (bandeja de prospectos)
  const seccion = sp.vista === "leads" ? "leads" : "atletas";

  // Cargar solo la sección activa para no consultar de más.
  const atletasRes =
    seccion === "atletas"
      ? await getAtletas({ categoria: sp.categoria, deporte: sp.deporte, q: sp.q })
      : null;
  const leads = seccion === "leads" ? await getLeads() : [];
  const { atletas = [], categorias = [], deportes = [] } = atletasRes ?? {};

  // Filtros activos para mostrar en el cliente
  const vParams = {
    categoria: sp.categoria ?? "",
    deporte: sp.deporte ?? "",
    q: sp.q ?? "",
    vista: seccion === "leads" ? "leads" : (sp.vista ?? "tabla"),
  };

  const linkSeccion = (dest: string) => {
    const params = new URLSearchParams();
    if (seccion === "atletas") {
      // conservar filtros/ficha al ir a la otra vista
      if (sp.categoria) params.set("categoria", sp.categoria);
      if (sp.deporte) params.set("deporte", sp.deporte);
      if (sp.q) params.set("q", sp.q);
    }
    params.set("vista", dest);
    return `/dashboard/admin?${params.toString()}`;
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
        {/* NavegaciA3n de secciones del panel */}
        <div className="mx-auto max-w-7xl px-4 pb-0">
          <nav className="flex gap-1">
            <Link
              href={linkSeccion("atletas")}
              className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition ${
                seccion === "atletas"
                  ? "border-b-2 border-blue-600 text-blue-700"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Atletas
            </Link>
            <Link
              href={linkSeccion("leads")}
              className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition ${
                seccion === "leads"
                  ? "border-b-2 border-blue-600 text-blue-700"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Prospectos{leads.length > 0 ? ` (${leads.length})` : ""}
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {seccion === "atletas" ? (
          <>
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
          </>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-black text-gray-900">Prospectos</h1>
              <p className="mt-1 text-sm text-gray-500">
                Solicitudes recibidas desde la landing. Revisa y da seguimiento a cada
                interesado.
              </p>
            </div>
            <BandejaLeadsClient leads={leads} total={leads.length} />
          </>
        )}
      </div>
    </main>
  );
}
