/* Diagnóstico temporal (NO commitear): allowed redirect URLs de Supabase Auth v2 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = {};
for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

// Vía GoTrue admin client (fire en un contenedor SPA): expone getConfig? No.
// Mejor: la config de autofill la guarda GoTrue en /auth/v1/settings (público con anon).
try {
  const res = await fetch(`${url}/auth/v1/settings`, {
    headers: {
      apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    },
  });
  const text = await res.text();
  console.log("HTTP", res.status);
  console.log("raw:", text);
} catch (e) {
  console.error("ERR", e.message);
}
