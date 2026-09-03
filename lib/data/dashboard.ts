import { createServiceClient } from "@/lib/supabase/service";

// Métricas para la cabecera de KPIs del panel admin.
// Usa service-role aislado para lecturas de gestión (mismo patrón que getAtletas/getLeads);
// la ruta /dashboard/admin ya valida RBAC (esRolGestion) antes de llegar aquí.

export type Kpis = {
  totalLeads: number;
  leadsHoy: number;
  planPreferido: string; // etiqueta legible o "Sin definir"
  atletasActivos: number;
  conversiones: number; // leads marcados "convertido"
};

export async function getKpis(): Promise<Kpis> {
  const supabase = createServiceClient();

  const res = await Promise.allSettled([
    // Total de leads
    supabase.from("leads").select("id", { count: "exact", head: true }),
    // Leads creados hoy (corte local de la app)
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
    // Estado por lead (para plan preferido + conversiones)
    supabase.from("leads").select("id, plan, estado"),
    // Atletas activos
    supabase.from("athletes").select("id", { count: "exact", head: true }).eq("estado", "activo"),
  ]);

  const get = (i: number) => (res[i].status === "fulfilled" ? res[i].value : null);

  const totalLeads = get(0)?.count ?? 0;
  const leadsHoy = get(1)?.count ?? 0;
  const atletasActivos = get(3)?.count ?? 0;

  // Plan preferido = el plan más repetido entre leads que SÍ eligieron uno.
  const leadsRows = get(2)?.data ?? [];
  const porPlan: Record<string, number> = {};
  let conversiones = 0;
  for (const l of leadsRows as Array<{ plan?: string | null; estado?: string | null }>) {
    if (l.plan) porPlan[l.plan] = (porPlan[l.plan] || 0) + 1;
    if (l.estado === "convertido") conversiones++;
  }
  const planPreferido =
    Object.entries(porPlan).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Sin definir";

  return { totalLeads, leadsHoy, planPreferido, atletasActivos, conversiones };
}
