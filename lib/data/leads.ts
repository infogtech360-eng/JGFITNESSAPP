import { createServiceClient } from "@/lib/supabase/service";

// Bandeja de leads de la landing ("Hablemos de tu atleta" → public.leads).
// La ruta que la consume (/dashboard/admin) ya valida RBAC server-side (esRolGestion)
// ANTES de llamarla, así que usamos el client service-role de forma AISLADA para estas
// lecturas de gestión multiusuario (mismo patrón que lib/data/atletas.ts).

export type LeadRow = {
  id: string;
  created_at: string | null;
  nombre: string | null;
  email: string | null;
  telefono: string | null;
  interes: string | null;
  plan: string | null;
  mensaje: string | null;
  estado: string | null;
};

// Lista los leads recibidos, más recientes primero.
// Tolerante a la migración 006_lead_plan.sql: si la columna 'plan' aún no existe en la DB
// (porque el SQL no se ha ejecutado), reintenta sin ella y deja el campo a null. Así la
// bandeja jamás rompe por un esquema en transición.
export async function getLeads(): Promise<LeadRow[]> {
  const supabase = createServiceClient();
  const COLS = "id, created_at, nombre, email, telefono, interes, plan, mensaje, estado";
  const { data, error } = await supabase
    .from("leads")
    .select(COLS)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    // La columna 'plan' puede no existir todavía si falta la migración 006. Reintenta sin ella.
    const sinPlan = COLS.replace(", plan", "");
    const retry = await supabase
      .from("leads")
      .select(sinPlan)
      .order("created_at", { ascending: false })
      .limit(200);
    if (!retry.error) {
      return (retry.data ?? []).map((r) => ({ ...(r as object), plan: null }) as LeadRow);
    }
    console.error("getLeads error:", error);
    return [];
  }
  return (data ?? []) as LeadRow[];
}
