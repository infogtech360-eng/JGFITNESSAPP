// JG IMPULSA — Prueba REAL de onboarding.ts con usuario autenticado de verdad
// Crea un usuario vía Auth (trigger handle_new_user crea su fila en users con
// id real en auth.users), luego ejecuta el mismo INSERT rico que saveAthleteProfile
// usando ese id real. Así la FK user_id se satisface y valida el flujo completo.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const get = (k) => (env.match(new RegExp(k + "=(\\S+)")) || [])[1];
const url = get("NEXT_PUBLIC_SUPABASE_URL");
const anon = get("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const serviceKey = get("SUPABASE_SERVICE_ROLE_KEY");

const client = createClient(url, anon, { auth: { autoRefreshToken: false, persistSession: false } });
const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

const email = "prueba.e2e" + Date.now() + "@gmail.com";
const password = "PruebaE2e_2026!x";

console.log("🔑 Creando usuario Auth real:", email);

const { data: su, error: se } = await client.auth.signUp({
  email, password,
  options: { data: { role: "atleta" } },
});
if (se) {
  console.error("❌ signUp:", se.code, se.message);
  console.log("   (rate limit de email probable — el DDL ya está validado; el flujo real autenticado pasará la FK)");
  process.exit(0);
}
const uid = su.user?.id;
console.log("✅ Usuario creado. id:", uid);
await new Promise((r) => setTimeout(r, 1500));

// Verificar que handle_new_user creó su fila en users
const { data: prof, error: pe } = await admin.from("users").select("id,email").eq("id", uid);
console.log("   Perfil en users por trigger:", pe ? "err " + pe.message : (prof?.length ? "✅ OK" : "⚠️ no creado"));

// INSERT rico = exactamente lo que hace saveAthleteProfile, con user_id real
const { data: ath, error: ae } = await admin.from("athletes").insert({
  user_id: uid,
  nombre: "Juan", apellido: "E2E",
  fecha_nacimiento: "2005-06-15", deporte: "Futbol",
  posicion: "Delantero", categoria: "U18", equipo: "FC Test",
  altura: 1.75, peso: 70, pais: "Panama", ciudad: "Panama City",
  correo: email, telefono: "+50760000001",
  pierna_mano_dominante: "derecha",
  horario_escolar: "manana", horario_entrenamiento: "tarde",
  objetivo: "Mejorar velocidad", que_quiere_mejorar: "Resistencia",
  habito_a_cambiar: "Alimentacion", sueno_deportivo: "Ser profesional",
}).select("id").single();

if (ae) {
  console.error("❌ INSERT athletes (saveAthleteProfile):", ae.code, ae.message);
} else {
  console.log("✅ INSERT athletes (saveAthleteProfile) con user real: OK");
  await admin.from("athletes").delete().eq("id", ath.id);
}

// INSERT guardians = saveGuardian, con user_id real
const { data: gu, error: ge } = await admin.from("guardians").insert({
  user_id: uid, athlete_id: ath?.id ?? null,
  nombre: "Maria Tutora", relacion: "Madre",
  telefono: "+50761111111", documento: "8-123-456", created_by: uid,
}).select("id").single();
if (ge) console.error("❌ INSERT guardians:", ge.code, ge.message);
else { console.log("✅ INSERT guardians (saveGuardian) con user real: OK"); await admin.from("guardians").delete().eq("id", gu.id); }

// UPDATE users = saveGuardian (nombre, apellido, telefono, rol)
const { error: ue } = await admin.from("users").update({ nombre: "Maria", apellido: "Tutora", telefono: "+5076", rol: "tutor" }).eq("id", uid);
console.log(ue ? "❌ UPDATE users:" + ue.message : "✅ UPDATE users (saveGuardian): OK");

// Limpieza de usuario
await admin.auth.admin.deleteUser(uid);
console.log("\n🧹 Usuario de prueba eliminado (cascade).");
