"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { absUrl } from "@/lib/site-url";
import { resolveRole } from "@/lib/rbac";

export type AuthResult =
  | { ok: true; message?: string; redirectTo?: string }
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
      // Origin dinámico según entorno (Vercel/Netlify inyectan URL en runtime).
      // Destino = /auth/callback: allí se intercambia el PKCE code con exchangeCodeForSession
      // y se redirige por rol canónico (admin/gestor -> /dashboard/admin), en lugar de caer
      // siempre en el onboarding de atleta.
      emailRedirectTo: absUrl("/auth/callback"),
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

// --- Login con Email + Contraseña (Plan B) ---
export async function signInWithPassword(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email) return { ok: false, error: "Ingresa tu correo electrónico." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { ok: false, error: "El correo no tiene un formato válido." };
  if (!password) return { ok: false, error: "Ingresa tu contraseña." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  // Un error concreto y único basta: credenciales inválidas o cuenta sin contraseña.
  if (error) {
    return {
      ok: false,
      error:
        "Correo o contraseña incorrectos, o esta cuenta no tiene contraseña habilitada.",
    };
  }

  // Sesión establecida por el intercambio de credenciales: resolvemos el rol canónico
  // (public.users.role como fuente de verdad, con fallback al JWT) para enrutar directo.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: true, redirectTo: "/dashboard" };

  let dbRole: string | null = null;
  try {
    const { data: perfil } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    dbRole = perfil?.role ?? null;
  } catch {
    dbRole = null;
  }
  const rol = resolveRole({ dbRole, appMetadata: user.app_metadata });

  // Gestores (admin/coach/entrenador/club) van DIRECTO al panel de gestión.
  let redirectTo = "/dashboard";
  if (rol && ["admin", "coach", "entrenador", "club"].includes(rol)) {
    redirectTo = "/dashboard/admin";
  }

  return { ok: true, redirectTo };
}

// --- Verificación de OTP de 6 dígitos (flujo alternativo) ---
export async function verifyOtp(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const token = String(formData.get("token") || "").trim();

  if (!email || !token) return { ok: false, error: "Correo y código son obligatorios." };

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });

  if (error) return { ok: false, error: error.message };

  // Una vez verificada la sesión, determinamos el destino por rol canónico
  // (public.users.role como fuente de verdad, con fallback al JWT). Así un
  // admin/gestor NO cae en el onboarding de atleta: va directo a /dashboard/admin.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: true, redirectTo: "/onboarding" };

  let dbRole: string | null = null;
  try {
    const { data: perfil } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    dbRole = perfil?.role ?? null;
  } catch {
    dbRole = null;
  }
  const rol = resolveRole({ dbRole, appMetadata: user.app_metadata });

  let redirectTo = "/onboarding";
  if (rol && ["admin", "coach", "entrenador", "club"].includes(rol)) {
    redirectTo = "/dashboard/admin";
  } else if (rol && rol !== "atleta" && rol !== "tutor") {
    // Roles gestionados sin onboarding de atleta/tutor pendiente.
    redirectTo = "/dashboard";
  }

  return { ok: true, redirectTo };
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
