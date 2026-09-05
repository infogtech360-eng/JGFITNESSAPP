"use server";

import { createServiceClient } from "@/lib/supabase/service";

export type EstadoLead = "nuevo" | "en_proceso" | "convertido";

export async function actualizarEstadoLead(input: {
  id: string;
  estado: EstadoLead;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = createServiceClient();
    console.log("Servidor ejecutando cambio de estado para lead:", input.id, "a:", input.estado);

    // 1. Obtener los datos del lead antes de actualizarlo
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", input.id)
      .single();

    if (leadError || !lead) {
      console.error("Error buscando lead:", leadError);
      return { ok: false, error: "No se encontró el prospecto." };
    }

    // 2. Actualizar el estado del lead
    const { error: updateError } = await supabase
      .from("leads")
      .update({ estado: input.estado })
      .eq("id", input.id);

    if (updateError) {
      console.error("Error actualizando lead:", updateError);
      return { ok: false, error: updateError.message };
    }

    // 3. Si el estado cambia a "convertido", crear el registro en "athletes"
    if (input.estado === "convertido") {
      const { data: existingAthlete } = await supabase
        .from("athletes")
        .select("id")
        .eq("correo", lead.email || "")
        .maybeSingle();

      if (!existingAthlete) {
        const nameParts = (lead.nombre || "Atleta Nuevo").trim().split(" ");
        const nombre = nameParts[0] || "Atleta";
        const apellido = nameParts.slice(1).join(" ") || "Nuevo";

        const { error: athleteError } = await supabase.from("athletes").insert({
          nombre,
          apellido,
          correo: lead.email || null,
          telefono: lead.telefono || null,
          deporte: lead.interes || "Fútbol",
          estado: "activo",
          created_by: lead.user_id || null,
        });

        if (athleteError) {
          console.error("Error creando atleta:", athleteError);
        }
      }
    }

    return { ok: true };
  } catch (err: any) {
    console.error("Excepción en actualizarEstadoLead:", err);
    return { ok: false, error: err.message || "Error interno" };
  }
}