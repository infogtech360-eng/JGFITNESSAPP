import { createClient } from "@/lib/supabase/server";
import { getAtletas } from "@/lib/data/atletas";
import { getLeads } from "@/lib/data/leads";
import { getKpis } from "@/lib/data/dashboard";
import AtletasAdminClient from "@/components/admin/AtletasAdminClient";
import { BandejaLeadsClient } from "@/components/admin/BandejaLeadsClient";
import { NavAdmin } from "@/components/admin/NavAdmin";
import { KpiCards } from "@/components/admin/KpiCards";
import { resolveRole, esRolGestion } from "@/lib/rbac";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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
  if (!esRolGestion(rol)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
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
          {dbRole === null && rol && <p className="mt-3 text-xs text-gray-400">Rol: {rol}</p>}
        </div>
      </main>
    );
  }

  const raw = await searchParams;
  const one = (k: string) =>
    typeof raw[k] === "string" ? (raw[k] as string) : Array.isArray(raw[k]) ? (raw[k]![0] as string) : undefined;

  const vSeccion = one("vista");
  const seccion: "overview" | "leads" | "atletas" =
    vSeccion === "leads" || vSeccion === "atletas" ? vSeccion : "overview";

  // Cargar KPI siempre (overview y pestañas lo muestran arriba del detalle).
  const kpis = await getKpis();

  let leads: Awaited<ReturnType<typeof getLeads>> = [];
  let atletasRes: Awaited<ReturnType<typeof getAtletas>> | null = null;

  if (seccion === "leads") {
    leads = await getLeads();
  } else if (seccion === "atletas") {
    atletasRes = await getAtletas({
      categoria: one("categoria"),
      deporte: one("deporte"),
      q: one("q"),
    });
  }

  const { atletas = [], categorias = [], deportes = [] } = atletasRes ?? {};
  const linkSeccion = (dest: string) => {
    const params = new URLSearchParams();
    if (seccion === "atletas") {
      const c = one("categoria");
      const d = one("deporte");
      const q = one("q");
      if (c) params.set("categoria", c);
      if (d) params.set("deporte", d);
      if (q) params.set("q", q);
    }
    params.set("vista", dest);
    return `/dashboard/admin?${params.toString()}`;
  };

  const propTitle =
    seccion === "leads"
      ? { t: "Prospectos", s: "Solicitudes recibidas desde la landing. Filtrá por estado, gestioná el avance y contactá por WhatsApp.", n: leads.length }
      : seccion === "atletas"
        ? { t: "Atletas", s: "Directorio de perfiles deportivos con sus pilares Mental · Emocional · Táctico.", n: atletas.length }
        : { t: "Visión general", s: "Resumen ejecutivo de JG IMPULSA: prospectos, planes y atletas activos.", n: null };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavAdmin rol={rol ?? "admin"} activa={seccion} />

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* KPIs siempre visibles */}
        <KpiCards kpis={kpis} />

        {/* Encabezado + enlace directo desde overview */}
        <div className="mb-6 mt-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-gray-900">{propTitle.t}</h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">{propTitle.s}</p>
          </div>
          {propTitle.n !== null && (
            <p className="text-sm font-medium text-gray-400">
              {propTitle.n} {propTitle.n === 1 ? "elemento" : "elementos"}
            </p>
          )}
        </div>

        {/* Contenido por sección */}
        {seccion === "overview" && (
          <OverviewGrid linkSeccion={linkSeccion} totalLeads={kpis.totalLeads} totalAtletas={kpis.atletasActivos} />
        )}
        {seccion === "leads" && <BandejaLeadsClient leads={leads} total={leads.length} />}
        {seccion === "atletas" && (
          <AtletasAdminClient
            atletas={atletas}
            categorias={categorias}
            deportes={deportes}
            filtrosIniciales={{
              categoria: one("categoria") ?? "",
              deporte: one("deporte") ?? "",
              q: one("q") ?? "",
              vista: one("vista") === "atletas" ? "tabla" : "tabla",
            }}
            total={atletas.length}
          />
        )}
      </main>
    </div>
  );
}

// Cuadrícula de acceso rápido en la vista de visión general.
function OverviewGrid({
  linkSeccion,
  totalLeads,
  totalAtletas,
}: {
  linkSeccion: (dest: string) => string;
  totalLeads: number;
  totalAtletas: number;
}) {
  const items = [
    {
      icon: "🎯",
      title: "Prospectos",
      desc: `Gestioná ${totalLeads} solicitudes: plan, estado y contacto por WhatsApp.`,
      cta: "Abrir bandeja",
      link: linkSeccion("leads"),
    },
    {
      icon: "🏅",
      title: "Atletas",
      desc: `${totalAtletas} atletas activos con su acompañamiento en pilares.`,
      cta: "Ver directorio",
      link: linkSeccion("atletas"),
    },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((i) => (
        <Link
          key={i.title}
          href={i.link}
          className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">{i.icon}</span>
            <div>
              <h2 className="text-lg font-black text-gray-900">{i.title}</h2>
              <p className="text-sm text-gray-500">{i.desc}</p>
            </div>
          </div>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:underline">
            {i.cta} →
          </span>
        </Link>
      ))}
    </div>
  );
}
