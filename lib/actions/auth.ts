"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { absUrl } from "@/lib/site-url";

export type AuthResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

// --- Login con Magic Link / OTP (correo) ---
export async function signInWithOtp(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const rol = String(formData.get("rol") || "atleta");

  if (!email) return { ok: false, error: "Ingresa tu correo electrónico." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { ok: false, error: "El correo no tiene un formato válido." };

  const supabase = await createClient();

  // Se guarda el rol en metadata para el trigger handle_new_user
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      data: { rol },
      // Origin dinámico según entorno (Netlify inyecta URL/DEPLOY_URL en runtime).
      // Evita que el magic link lleve redirect_to=http://localhost:3000 en producción.
      emailRedirectTo: absUrl("/onboarding"),
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return {
    ok: true,
    message: `Te enviamos un enlace de acceso a ${email}. Revisa tu bandeja de entrada.`,
  };
}

// --- Verificación de OTP de 6 dígitos (flujo alternativo) ---
export async function verifyOtp(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const token = String(formData.get("token") || "").trim();

  if (!email || !token) return { ok: false, error: "Correo y código son obligatorios." };

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// --- Cierre de sesión ---
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// --- Obtener el usuario actual (server-side) ---
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// --- Verificar si el usuario ya completó su onboarding ---
export async function hasCompletedOnboarding(userId: string) {
  const service = createServiceClient();
  const { data: athlete, error } = await service
    .from("athletes")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return false;
  return !!athlete;
}
