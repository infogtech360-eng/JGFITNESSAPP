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
  mensaje: string | null;
  estado: string | null;
};

// Lista los leads recibidos, más recientes primero.
export async function getLeads(): Promise<LeadRow[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("leads")
    .select("id, created_at, nombre, email, telefono, interes, mensaje, estado")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("getLeads error:", error);
    return [];
  }
  return (data ?? []) as LeadRow[];
}
