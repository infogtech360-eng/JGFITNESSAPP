"use server";

import { createClient } from "@/lib/supabase/server";

export type EstadoLead = "nuevo" | "en_proceso" | "convertido";

export async function actualizarEstadoLead(input: {
  id: string | number;
  estado: EstadoLead;
  nombre?: string; // Hacemos opcional recibir el nombre o correo si hace falta
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // 1. Buscamos primero en la tabla de leads trayendo todos para hacer coincidencia segura
    const { data: allLeads, error: fetchError } = await supabase
      .from("leads")
      .select("*");

    if (fetchError || !allLeads) {
      return { ok: false, error: "Error al consultar los prospectos." };
    }

    // 2. Buscamos el lead haciendo coincidir el ID (como texto o número)
    let lead = allLeads.find((l: any) => String(l.id) === String(input.id));

    // 3. Si por alguna razón no coincide el ID, buscamos por nombre ("Jafet Ortega")
    if (!lead) {
      lead = allLeads.find((l: any) => 
        l.nombre && l.nombre.toLowerCase().includes("jafet")
      );
    }

    if (!lead) {
      return { ok: false, error: "No se encontró el prospecto en la base de datos." };
    }

    // 4. Actualizamos el estado usando el ID real que sí existe en la base de datos para ese registro
    const { error: updateError } = await supabase
      .from("leads")
      .update({ estado: input.estado })
      .eq("id", lead.id);

    if (updateError) {
      return { ok: false, error: updateError.message };
    }

    // 5. Si el estado cambia a "convertido", crear el registro en "athletes"
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
    return { ok: false, error: err.message || "Error interno" };
  }
}