"use server";

import { createServiceClient } from "@/lib/supabase/service";

export type EstadoLead = "nuevo" | "en_proceso" | "convertido";

// Actualiza el estado de un lead (public.leads.estado) usando service-role.
// La ruta /dashboard/admin ya valida RBAC server-side (esRolGestion) antes de
// llegar a esta acción; el service-role aquí replica lo que permite la policy
// staff de la bandeja. Estados: nuevo | en_proceso | convertido.
export async function actualizarEstadoLead(input: {
  id: string;
  estado: EstadoLead;
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("leads")
    .update({ estado: input.estado })
    .eq("id", input.id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
