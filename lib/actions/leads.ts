"use server";

import { createClient } from "@/lib/supabase/server";

export type EstadoLead = "nuevo" | "en_proceso" | "convertido";

export async function actualizarEstadoLead(input: {
  id: string | number;
  estado: EstadoLead;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    console.log("--> Intentando actualizar lead con ID recibido:", input.id, "Tipo:", typeof input.id);

    // 1. Intentar buscar el lead directamente por ID
    let { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", input.id)
      .maybeSingle();

    // 2. Si no lo encuentra, intentamos seleccionando todos y buscando manualmente (para debug o desajuste de tipos)
    if (!lead) {
      console.log("--> Búsqueda por ID directo falló, intentando listar todos para comparar...");
      const { data: allLeads } = await supabase.from("leads").select("*");
      console.log("--> Leads disponibles en BD:", allLeads);
      
      if (allLeads && allLeads.length > 0) {
        // Buscamos coincidencia flexible (string o número)
        lead = allLeads.find((l: any) => String(l.id) === String(input.id)) || null;
      }
    }

    if (!lead) {
      return { ok: false, error: `No se encontró el prospecto con ID: ${input.id}` };
    }

    console.log("--> Lead encontrado con éxito:", lead);

    // 3. Actualizar el estado del lead usando el ID real del registro encontrado
    const { error: updateError } = await supabase
      .from("leads")
      .update({ estado: input.estado })
      .eq("id", lead.id);

    if (updateError) {
      console.error("--> Error al actualizar en BD:", updateError);
      return { ok: false, error: updateError.message };
    }

    // 4. Si el estado cambia a "convertido", crear el registro en "athletes"
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
    console.error("--> Error interno capturado:", err);
    return { ok: false, error: err.message || "Error interno" };
  }
}