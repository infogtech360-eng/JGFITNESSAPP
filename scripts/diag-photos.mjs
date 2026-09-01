// JG IMPULSA — Diagnosticar relaciones/FKs reales para resolver el join a photos
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const get = (k) => (env.match(new RegExp(k + "=(\\S+)")) || [])[1];
const url = get("NEXT_PUBLIC_SUPABASE_URL");
const serviceKey = get("SUPABASE_SERVICE_ROLE_KEY");
const sb = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

// 1) ¿Qué relaciones reconoce PostgREST para athletes? (via OpenAPI)
const spec = await (await fetch(url + "/rest/v1/", {
  headers: { apikey: serviceKey, Authorization: "Bearer " + serviceKey },
})).json();
console.log("=== Relaciones detectadas para athletes (properties con formato objeto/array) ===");
const props = spec.components?.schemas?.athletes?.properties ?? {};
for (const [name, def] of Object.entries(props)) {
  if (def && typeof def === "object" && (def.$ref || def.items || def.type === "array" || (def.anyOf))) {
    console.log(" ", name, "->", JSON.stringify(def).slice(0, 90));
  }
}

// 2) Columnas url/foto reales en photos (consulta directa sin join anidado)
const p = await sb.from("photos").select("id, user_id, url").limit(2);
console.log("\n=== photos (directo) ===", p.error ? "ERR " + p.error.code + " " + p.error.message : "OK cols=" + Object.keys(p.data?.[0] ?? {}).join(","));

// 3) ¿athletes.user_id apunta a users? Test simple: join con alias a users
const a = await sb.from("athletes").select("id, users:user_id(id, email)").limit(2);
console.log("\n=== athletes->users embebido ===", a.error ? "ERR " + a.error.code : "OK (confirma athletes.user_id->users)");

// 4) Test: photos vía embebido directo desde athletes usando FK athlete->? no hay. Ver qué FK linkea photos
const p2 = await sb.from("photos").select("id, athletes:a_athletes_(*)").limit(1);
console.log("\n=== photos->athletes? ===", p2.error ? "ERR " + p2.error.code + ": " + p2.error.message : "OK");
console.log("\n(athletes NO tiene id en photos; las fotos se ligan por user_id==athletes.user_id, no por FK directa)");
