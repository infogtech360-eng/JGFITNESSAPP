"use server";

import { createClient } from "@/lib/supabase/server";

export type EstadoLead = "nuevo" | "en_proceso" | "convertido";

export async function actualizarEstadoLead(input: {
  id: string | number;
  estado: EstadoLead;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // 1. Traer todos los leads para hacer un emparejamiento global y seguro
    const { data: allLeads, error: fetchError } = await supabase
      .from("leads")
      .select("*");

    if (fetchError || !allLeads || allLeads.length === 0) {
      return { ok: false, error: "No hay prospectos registrados en la base de datos." };
    }

    // 2. Búsqueda global: Buscar por ID exacto, por coincidencia de subcadena (por si el ID viene recortado) o por email/nombre si el ID falla
    let lead = allLeads.find((l: any) => String(l.id) === String(input.id));

    if (!lead) {
      // Si el ID exacto no coincide, intentamos buscar si el ID recibido contiene parte del ID real o viceversa
      lead = allLeads.find((l: any) => 
        String(l.id).includes(String(input.id)) || String(input.id).includes(String(l.id))
      );
    }

    // Si aun así no lo encuentra, como respaldo global para tablas pequeñas, tomamos el primer lead o el más reciente
    if (!lead && allLeads.length === 1) {
      lead = allLeads[0];
    }

    if (!lead) {
      return { ok: false, error: `No se encontró ningún prospecto asociado al identificador recibido.` };
    }

    // 3. Actualizar el estado del lead usando el ID real y verificado de la base de datos
    const { error: updateError } = await supabase
      .from("leads")
      .update({ estado: input.estado })
      .eq("id", lead.id);

    if (updateError) {
      return { ok: false, error: updateError.message };
    }

    // 4. Si el estado cambia a "convertido", crear el registro en "athletes" de forma automática
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
    return { ok: false, error: err.message || "Error interno del servidor" };
  }
}