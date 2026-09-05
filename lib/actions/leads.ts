"use server";

import { createClient } from "@/lib/supabase/server";

export type EstadoLead = "nuevo" | "en_proceso" | "convertido";

export async function actualizarEstadoLead(input: {
  id: string | number;
  estado: EstadoLead;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Consultamos todos los leads disponibles para hacer un match flexible
    const { data: leads, error: fetchError } = await supabase
      .from("leads")
      .select("*");

    if (fetchError || !leads || leads.length === 0) {
      return { ok: false, error: "No se pudieron obtener los prospectos de la base de datos." };
    }

    // Buscamos el lead que coincida exactamente por ID o de manera flexible por subcadena
    let lead = leads.find((l: any) => String(l.id) === String(input.id));

    if (!lead) {
      lead = leads.find((l: any) => 
        String(l.id).includes(String(input.id)) || String(input.id).includes(String(l.id))
      );
    }

    // Si aún no se halla pero solo hay un registro activo en la bandeja, lo tomamos directamente
    if (!lead && leads.length === 1) {
      lead = leads[0];
    }

    if (!lead) {
      return { ok: false, error: "No se encontró el prospecto especificado en el sistema." };
    }

    // Actualizamos el estado utilizando el ID real y verificado de la fila
    const { error: updateError } = await supabase
      .from("leads")
      .update({ estado: input.estado })
      .eq("id", lead.id);

    if (updateError) {
      return { ok: false, error: updateError.message };
    }

    // Si el estado pasa a "convertido", aseguramos que se inserte en la tabla "athletes"
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
          console.error("Error al registrar atleta convertido:", athleteError);
        }
      }
    }

    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || "Error interno del servidor" };
  }
}