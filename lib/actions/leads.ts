"use server";

import { createClient } from "@/lib/supabase/server";

export type EstadoLead = "nuevo" | "en_proceso" | "convertido";

export async function actualizarEstadoLead(input: {
  id: string;
  estado: EstadoLead;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // 1. Actualizar directamente el estado del lead por su ID sin requerir lectura previa que dispare RLS
    const { data: updatedLead, error: updateError } = await supabase
      .from("leads")
      .update({ estado: input.estado })
      .eq("id", input.id)
      .select()
      .maybeSingle();

    if (updateError) {
      return { ok: false, error: updateError.message };
    }

    if (!updatedLead) {
      return { ok: false, error: "No se encontró el prospecto con el ID proporcionado." };
    }

    // 2. Si el estado cambia a "convertido", registrar automáticamente en la tabla "athletes"
    if (input.estado === "convertido") {
      const { data: existingAthlete } = await supabase
        .from("athletes")
        .select("id")
        .eq("correo", updatedLead.email || "")
        .maybeSingle();

      if (!existingAthlete) {
        const nameParts = (updatedLead.nombre || "Atleta Nuevo").trim().split(" ");
        const nombre = nameParts[0] || "Atleta";
        const apellido = nameParts.slice(1).join(" ") || "Nuevo";

        const { error: athleteError } = await supabase.from("athletes").insert({
          nombre,
          apellido,
          correo: updatedLead.email || null,
          telefono: updatedLead.telefono || null,
          deporte: updatedLead.interes || "Fútbol",
          estado: "activo",
          created_by: updatedLead.user_id || null,
        });

        if (athleteError) {
          console.error("Error al registrar atleta convertido:", athleteError);
        }
      }
    }

    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || "Error interno del servidor" };
  }
}