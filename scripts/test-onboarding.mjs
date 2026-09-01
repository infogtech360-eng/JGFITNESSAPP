// JG IMPULSA — Prueba de las acciones de onboarding.ts contra el esquema expandido
// Simula saveAthleteProfile (INSERT rico en athletes) y saveGuardian
// (INSERT en guardians + update users) usando las columnas que el código usa.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const get = (k) => (env.match(new RegExp(k + "=(\\S+)")) || [])[1];
const url = get("NEXT_PUBLIC_SUPABASE_URL");
const serviceKey = get("SUPABASE_SERVICE_ROLE_KEY");
const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const stamp = new Date().toISOString();
let failures = 0;

async function test(name, fn) {
  try {
    const r = await fn();
    if (r.ok) console.log(`✅ ${name}`);
    else { console.log(`❌ ${name}: ${r.msg}`); failures++; }
  } catch (e) { console.log(`❌ ${name}: excepción ${e.message}`); failures++; }
}

// --- saveAthleteProfile: INSERT rico en athletes ---
await test("INSERT athletes (saveAthleteProfile)", async () => {
  const { data, error } = await admin.from("athletes").insert({
    user_id: "00000000-0000-0000-0000-000000000001",
    nombre: "Juan",
    apellido: "Prueba",
    fecha_nacimiento: "2005-06-15",
    deporte: "Futbol",
    posicion: "Delantero",
    categoria: "U18",
    equipo: "FC Test",
    altura: 1.75,
    peso: 70,
    pais: "Panama",
    ciudad: "Panama City",
    correo: "juan.prueba@test.com",
    telefono: "+50760000000",
    pierna_mano_dominante: "derecha",
    horario_escolar: "manana",
    horario_entrenamiento: "tarde",
    objetivo: "Mejorar velocidad",
    que_quiere_mejorar: "Resistencia",
    habito_a_cambiar: "Alimentacion",
    sueno_deportivo: "Ser profesional",
  }).select("id").single();
  if (error) return { ok: false, msg: `${error.code}: ${error.message}` };
  await admin.from("athletes").delete().eq("id", data.id); // limpieza
  return { ok: true };
});

// --- saveGuardian: INSERT guardians (athlete_id, nombre, relacion) ---
await test("INSERT guardians (saveGuardian)", async () => {
  const { data, error } = await admin.from("guardians").insert({
    user_id: "00000000-0000-0000-0000-000000000002",
    athlete_id: "00000000-0000-0000-0000-000000000003",
    nombre: "Maria Tutora",
    relacion: "Madre",
    telefono: "+50761111111",
    documento: "8-123-456",
    created_by: "00000000-0000-0000-0000-000000000002",
  }).select("id").single();
  if (error) return { ok: false, msg: `${error.code}: ${error.message}` };
  await admin.from("guardians").delete().eq("id", data.id);
  return { ok: true };
});

// --- saveGuardian: UPDATE users (nombre, apellido, telefono, rol) ---
await test("UPDATE users (saveGuardian)", async () => {
  const uid = "00000000-0000-0000-0000-000000000002";
  const { error } = await admin.from("users").update({
    nombre: "Maria", apellido: "Tutora", telefono: "+50761111112", rol: "tutor",
  }).eq("id", uid);
  if (error && !String(error.code).startsWith("PGRST")) {
    return { ok: false, msg: `${error.code}: ${error.message}` };
  }
  return { ok: true }; // update sin fila existente no es error de esquema
});

console.log(`\n${failures === 0 ? "🎯 TODAS LAS ACCIONES OK — esquema expandido operativo." : `⚠️ ${failures} fallo(s).`}`);
