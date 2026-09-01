// JG IMPULSA — Leer esquema REAL de athlete y hacer INSERT mínimo correcto
// La migración 001 declara 'apellido' pero PostgREST dice que no existe:
// leemos el OpenAPI real para saber qué columnas hay, y probamos con la mínima.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const get = (k) => (env.match(new RegExp(k + "=(\\S+)")) || [])[1];

const url = get("NEXT_PUBLIC_SUPABASE_URL");
const serviceKey = get("SUPABASE_SERVICE_ROLE_KEY");
const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// 1) Columnas reales vía OpenAPI de PostgREST
const res = await fetch(url + "/rest/v1/", {
  headers: {
    apikey: serviceKey,
    Authorization: "Bearer " + serviceKey,
    Accept: "application/vnd.pgrst.object+json",
  },
});
const spec = await res.json();
const athletesProps = spec?.components?.schemas?.athletes?.properties ?? {};
const required = spec?.components?.schemas?.athletes?.required ?? [];
console.log("=== Columnas REALES de public.athletes ===");
for (const [col, def] of Object.entries(athletesProps)) {
  const t = def?.format ?? def?.type ?? "?";
  console.log(`  ${col} : ${t}${required.includes(col) ? " (NOT NULL)" : ""}`);
}

// 2) INSERT solo con columnas que existen. Nombre es NOT NULL según migración;
//    usamos únicamente 'nombre' y dejamos que el resto use defaults si existen.
const nombre = "PruebaJAG_" + Date.now();
console.log("\n🔌 INSERT mínimo en athletes (solo nombre):", nombre);
const { data, error } = await admin
  .from("athletes")
  .insert([{ nombre }])
  .select("*");

if (error) {
  console.error("\n❌ Resultado:", error.code, "-", error.message);
  console.error("   Detalle:", JSON.stringify(error.details ?? error.hint ?? ""));
  if (String(error.code) === "42501") {
    console.error("\n🔴 42501: el GRANT INSERT NO está activo.");
    process.exit(1);
  }
  console.log("\n🟢 Capa de permisos OK (sin 42501). El error es de esquema/datos del test.");
  process.exit(0);
}

console.log("✅ INSERT EXITOSO con service key — 42501 resuelto:");
console.table(Object.fromEntries(Object.entries(data[0]).filter(([, v]) => v !== null)));

const { error: delErr } = await admin.from("athletes").delete().eq("id", data[0].id);
if (delErr) console.warn("⚠️ Limpieza:", delErr.message);
else console.log("🧹 Fila de prueba eliminada.");
