"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export type OnboardingResult = { ok: true } | { ok: false; error: string };

// --- Guardar perfil de atleta (onboarding) ---
// Crea o actualiza el registro en public.athletes del usuario autenticado.
export async function saveAthleteProfile(formData: FormData): Promise<OnboardingResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión no iniciada." };

  // Solo campos permitidos; nunca confiar en el cliente.
  const allowed = [
    "nombre", "apellido", "fecha_nacimiento", "deporte", "posicion", "categoria",
    "equipo", "altura", "peso", "pais", "ciudad", "correo", "telefono",
    "pierna_mano_dominante", "horario_escolar", "horario_entrenamiento",
    "objetivo", "que_quiere_mejorar", "habito_a_cambiar", "sueno_deportivo",
  ];

  const payload: Record<string, unknown> = {};
  for (const key of allowed) {
    const v = formData.get(key);
    // Convertir numéricos
    if (key === "altura" || key === "peso") {
      payload[key] = v && String(v).trim() !== "" ? Number(v) : null;
    } else if (v !== null && String(v).trim() !== "") {
      payload[key] = String(v).trim();
    }
  }

  if (!payload.nombre || !payload.apellido) {
    return { ok: false, error: "Nombre y apellido son obligatorios." };
  }

  const service = createServiceClient();

  // Ver si ya existe perfil
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

  redirect("/dashboard");
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
  // Datos del atleta a cargo
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

  // 1) Actualizar nombre del tutor en public.users
  const { error: uerr } = await service
    .from("users")
    .update({ nombre, apellido, telefono: telefono || null, rol: "tutor" })
    .eq("id", user.id);
  if (uerr) return { ok: false, error: uerr.message };

  // 2) Crear (o reutilizar) el atleta
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
      })
      .select("id")
      .single();
    if (aerr) return { ok: false, error: aerr.message };
    athleteId = inserted.id;
  }

  // 3) Crear el guardián vinculado
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

  redirect("/dashboard");
}
