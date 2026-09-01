// JG IMPULSA — Verificar que el 003_expand_schema quedó aplicado en producción
// Lista columnas reales de athletes/guardians/users vía OpenAPI de PostgREST.
import { readFileSync } from "node:fs";
const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const get = (k) => (env.match(new RegExp(k + "=(\\S+)")) || [])[1];
const url = get("NEXT_PUBLIC_SUPABASE_URL");
const serviceKey = get("SUPABASE_SERVICE_ROLE_KEY");
const H = { apikey: serviceKey, Authorization: "***" + serviceKey };

const spec = await (await fetch(url + "/rest/v1/", { headers: H })).json();

for (const t of ["athletes", "guardians", "users"]) {
  const p = spec.paths?.["/" + t];
  const cols = (p?.get?.parameters ?? [])
    .filter((x) => x.$ref && x.$ref.includes("rowFilter." + t + "."))
    .map((x) => x.$ref.split(".").pop());
  console.log(`\n${t} (${cols.length} cols): ${cols.join(", ")}`);
}
