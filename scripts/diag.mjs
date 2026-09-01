// JG IMPULSA — Ver columnas reales de /athletes y probar SELECT/INSERT con body mínimo
import { readFileSync } from "node:fs";
const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const get = (k) => (env.match(new RegExp(k + "=(\\S+)")) || [])[1];
const url = get("NEXT_PUBLIC_SUPABASE_URL");
const serviceKey = get("SUPABASE_SERVICE_ROLE_KEY");
const H = { apikey: serviceKey, Authorization: "Bearer " + serviceKey, "Content-Type": "application/json" };

// 1) OpenAPI específico de la ruta athletes para ver el body schema
const spec = await (await fetch(url + "/rest/v1/", { headers: H })).json();
const athParams = spec.paths?.["/athletes"]?.post?.parameters ?? [];
console.log("=== Paths de /athletes ===");
console.log("GET:", !!spec.paths?.["/athletes"]?.get, "| POST:", !!spec.paths?.["/athletes"]?.post);
console.log("=== body schema ref (post) ===");
const bodyParam = athParams.find((p) => p.name === "body.athletes") ?? athParams.find((p) => p.in === "body");
console.log(JSON.stringify(bodyParam?.schema ?? bodyParam ?? "sin body schema", null, 2).slice(0, 1200));

// 2) SELECT select=* con anon para ver qué devuelve de verdad
const r2 = await fetch(url + "/rest/v1/athletes?select=*&limit=3", { headers: H });
console.log("\n=== SELECT athletes (service) ===", r2.status, await r2.text());

// 3) INSERT con { } solo para ver qué exige el schema (sin inventar columnas)
try {
  const r3 = await fetch(url + "/rest/v1/athletes", {
    method: "POST", headers: H,
    body: JSON.stringify({}),
  });
  console.log("\n=== INSERT athletes {} (service) ===", r3.status);
  console.log((await r3.text()).slice(0, 800));
} catch (e) { console.log("ERR", e.message); }
