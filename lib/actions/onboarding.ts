"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export type OnboardingResult = { ok: true } | { ok: false; error: string };

export async function saveAthleteProfile(formData: FormData): Promise<OnboardingResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión no iniciada." };

  const nombre = String(formData.get("nombre") || "").trim();
  const apellido = String(formData.get("apellido") || "").trim();

  if (!nombre || !apellido) {
    return { ok: false, error: "Nombre y apellido son obligatorios." };
  }

  const alturaVal = formData.get("altura");
  const pesoVal = formData.get("peso");

  const payload: Record<string, unknown> = {
    nombre: nombre,
    apellido: apellido,
    fecha_nacimiento: formData.get("fecha_nacimiento") || null,
    deporte: formData.get("deporte") || null,
    posicion: formData.get("posicion") || null,
    categoria: formData.get("categoria") || null,
    equipo: formData.get("equipo") || null,
    altura: alturaVal && String(alturaVal).trim() !== "" ? Number(alturaVal) : null,
    peso: pesoVal && String(pesoVal).trim() !== "" ? Number(pesoVal) : null,
    pais: formData.get("pais") || null,
    ciudad: formData.get("ciudad") || null,
    correo: formData.get("correo") || user.email || null,
    telefono: formData.get("telefono") || null,
    pierna_mano_dominante: formData.get("pierna_mano_dominante") || null,
    horario_escolar: formData.get("horario_escolar") || null,
    horario_entrenamiento: formData.get("horario_entrenamiento") || null,
    objetivo: formData.get("objetivo") || null,
    que_quiere_mejorar: formData.get("que_quiere_mejorar") || null,
    habito_a_cambiar: formData.get("habito_a_cambiar") || null,
    sueno_deportivo: formData.get("sueno_deportivo") || null,
    estado: "activo",
  };

  const service = createServiceClient();
  
  // Actualizar también la tabla users para asegurar que la columna role y full_name estén sincronizadas
  await service
    .from("users")
    .update({ 
      role: "athlete",
      full_name: `${nombre} ${apellido}`.trim() 
    })
    .eq("id", user.id);

  const { data: existing } = await service
    .from("athletes")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  let err: { message?: string } | null = null;
  if (existing?.id) {
    const { error } = await service
      .from("athletes")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    err = error;
  } else {
    const { error } = await service
      .from("athletes")
      .insert({ ...payload, user_id: user.id, created_by: user.id });
    err = error;
  }

  if (err) {
    return { ok: false, error: err.message || "No se pudo guardar el perfil." };
  }

  return { ok: true };
}

// --- Guardar perfil de tutor + vincular a atleta (onboarding) ---
export async function saveGuardian(formData: FormData): Promise<OnboardingResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión no iniciada." };

  const nombre = String(formData.get("nombre") || "").trim();
  const apellido = String(formData.get("apellido") || "").trim();
  const relacion = String(formData.get("relacion") || "").trim();
  const telefono = String(formData.get("telefono") || "").trim();
  const documento = String(formData.get("documento") || "").trim();
  
  const aNombre = String(formData.get("atleta_nombre") || "").trim();
  const aApellido = String(formData.get("atleta_apellido") || "").trim();
  const aDeporte = String(formData.get("atleta_deporte") || "").trim();

  if (!nombre || !apellido) {
    return { ok: false, error: "El nombre del tutor es obligatorio." };
  }
  if (!aNombre || !aApellido) {
    return { ok: false, error: "Ingresa el nombre del atleta a tu cargo." };
  }

  const service = createServiceClient();

  const { error: uerr } = await service
    .from("users")
    .update({ 
      role: "tutor",
      full_name: `${nombre} ${apellido}`.trim(),
      telefono: telefono || null 
    })
    .eq("id", user.id);
  if (uerr) return { ok: false, error: uerr.message };

  let athleteId: string | null = null;
  
  const { data: existingAthlete } = await service
    .from("athletes")
    .select("id")
    .eq("nombre", aNombre)
    .eq("apellido", aApellido)
    .maybeSingle();

  if (existingAthlete?.id) {
    athleteId = existingAthlete.id;
  } else {
    const { data: inserted, error: aerr } = await service
      .from("athletes")
      .insert({
        nombre: aNombre,
        apellido: aApellido,
        deporte: aDeporte || null,
        created_by: user.id,
      })
      .select("id")
      .single();
    if (aerr) return { ok: false, error: aerr.message };
    athleteId = inserted.id;
  }

  const { error: gerr } = await service.from("guardians").insert({
    user_id: user.id,
    athlete_id: athleteId,
    nombre: `${nombre} ${apellido}`.trim(),
    relacion: relacion || null,
    telefono: telefono || null,
    documento: documento || null,
    created_by: user.id,
  });
  if (gerr) return { ok: false, error: gerr.message };

  return { ok: true };
}