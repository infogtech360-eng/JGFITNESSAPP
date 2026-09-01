// JG IMPULSA — Esquema REAL de tablas via SELECT (fuente de verdad dura)
// Consulta cada tabla con limit=0 y lee las columnas desde los headers
// Range-Unit / Content-Range + un select=* explícito. Devuelve columnas reales.
import { readFileSync } from "node:fs";
const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const get = (k) => (env.match(new RegExp(k + "=(\\S+)")) || [])[1];
const url = get("NEXT_PUBLIC_SUPABASE_URL");
const serviceKey = get("SUPABASE_SERVICE_ROLE_KEY");
const H = { apikey: serviceKey, Authorization: "***" + serviceKey, "Content-Type": "application/json" };

const tabs = ["users", "athletes", "guardians", "consents", "photos"];
for (const t of tabs) {
  // SELECT con limit=1 para ver el shape real de la fila
  const r = await fetch(url + `/rest/v1/${t}?select=*&limit=1`, { headers: H });
  const body = await r.text();
  let parsed = [];
  try { parsed = JSON.parse(body); } catch {}
  const row = parsed[0];
  console.log(`\n===== ${t} ===== (HTTP ${r.status})`);
  if (row) {
    console.log("  Columnas (de fila real):", Object.keys(row).join(", "));
    console.log("  Tipos/valores:", JSON.stringify(row));
  } else if (r.status === 200) {
    // Sin filas: intentar forzar el shape con un insert descartado no va; usamos openapi rows
    console.log("  (tabla vacía — sin filas para inferir columnas por datos)");
  } else {
    console.log("  Error:", r.status, body);
  }
}
