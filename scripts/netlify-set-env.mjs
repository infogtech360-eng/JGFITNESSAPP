// JG IMPULSA — Diagnóstico + configuración de variables de entorno en Netlify (a nivel SITIO).
// Endpoint documentado de Netlify para env de sitio: PUT /sites/{site_id}/env/{env_key}
// Body esperado: { key, values: [{ context, value }] }  (también acepta "scopes")
import { readFileSync } from "node:fs";

const TOKEN = "nfp_Nqoi65M4T9NFAXxM3sXfLkoFnKsJ9Sqod874";
const SITE_ID = "c29d4e1f-853b-4bbd-85a9-cfb44901e12a"; // jgimpulsa
const BASE = "https://api.netlify.com/api/v1";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const getVal = (k) => {
  const line = env.split("\n").find((l) => l.startsWith(`${k}=`));
  return line ? line.slice(k.length + 1).trim() : "";
};

async function api(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json", ...(opts.headers || {}) },
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = text; }
  return { status: res.status, json, text };
}

// Paso 1: confirmar identidad y permisos del token
console.log("=== whoami ===");
const user = await api("/user");
console.log("email:", user.json?.email, "| full_name:", user.json?.full_name);

// Paso 2: probar GET /sites/{id}/env que YA funcionó (200) — ver shape
console.log("\n=== GET /sites/:id/env (shape) ===");
const getSiteEnv = await api(`/sites/${SITE_ID}/env`, { method: "GET" });
console.log("status:", getSiteEnv.status, "| tipo:", Array.isArray(getSiteEnv.json) ? "array" : typeof getSiteEnv.json);

// Paso 3: crear cada variable vía PUT /sites/:id/env/:key (endpoint documentado)
const vars = [
  { key: "NEXT_PUBLIC_SUPABASE_URL", value: getVal("NEXT_PUBLIC_SUPABASE_URL") },
  { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", value: getVal("NEXT_PUBLIC_SUPABASE_ANON_KEY") },
  { key: "SUPABASE_SERVICE_ROLE_KEY", value: getVal("SUPABASE_SERVICE_ROLE_KEY") },
];
console.log("\n=== PUT /sites/:id/env/:key ===");
for (const v of vars) {
  if (!v.value) { console.log(`  SKIP ${v.key}: vacía`); continue; }
  const body = { key: v.key, values: [{ context: "all", value: v.value }] };
  const r = await api(`/sites/${SITE_ID}/env/${encodeURIComponent(v.key)}`, { method: "PUT", body: JSON.stringify(body) });
  console.log(`  PUT ${v.key} → HTTP ${r.status}${r.status === 200 || r.status === 201 ? " ✅" : " ❌  " + r.text.slice(0, 250)}`);
}

// Paso 4: verificación final
console.log("\n=== Verificación final GET /sites/:id/env ===");
const final = await api(`/sites/${SITE_ID}/env`, { method: "GET" });
if (Array.isArray(final.json)) {
  for (const v of final.json) {
    console.log(`  ${v.key}: ${(v.values || []).map((x) => x.context).join(",")}`);
  }
  console.log(`  total: ${final.json.length}`);
} else {
  console.log("  status:", final.status, "| raw:", final.text.slice(0, 300));
}
