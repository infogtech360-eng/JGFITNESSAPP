/* Diagnóstico temporal (NO commitear): ¿se pierde el $40 en el insert a leads? */
import { createClient as createSupabase } from "@supabase/supabase-js";
import fs from "node:fs";

const env = {};
for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const svc = createSupabase(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const probe = "dolar.check." + Date.now() + "@jgimpulsa.test";
// String literal de Nodo puro, SIN pasar por PowerShell: $40 debe conservarse íntegro.
const planEnviado = "Mensual $40/mes";
console.log("plan que pretendo guardar (octetos):", JSON.stringify(planEnviado));

const { error, data } = await svc
  .from("leads")
  .insert({ nombre: "DolarCheck", email: probe, telefono: "1", interes: "X", plan: planEnviado })
  .select("plan");
if (error) console.log("INSERT ERR:", error.message);
else console.log("plan leído de vuelta desde DB:", JSON.stringify(data?.[0]?.plan));

await svc.from("leads").delete().eq("email", probe);
console.log("cleanup done");
