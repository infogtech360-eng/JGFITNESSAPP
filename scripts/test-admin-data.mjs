// JG IMPULSA — Validar la capa de datos CORREGIDA del Módulo 3
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const get = (k) => (env.match(new RegExp(k + "=(\\S+)")) || [])[1];
const url = get("NEXT_PUBLIC_SUPABASE_URL");
const serviceKey = get("SUPABASE_SERVICE_ROLE_KEY");
const sb = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

// 1) Consulta principal SIN photos embebidas (solo join a guardians por FK)
let r = await sb
  .from("athletes")
  .select(
    `id, user_id, nombre, apellido, deporte, categoria, estado,
     guardians:guardian_id(nombre, relacion, telefono)`
  )
  .order("created_at", { ascending: false })
  .limit(5);
console.log("PASO 1 (athletes+guardian):", r.error ? `ERR ${r.error.code}: ${r.error.message}` : `OK rows=${r.data?.length ?? 0}`);

// 2) Búsqueda tutor en guardians (2 pasos), luego filtrar athletes por user_id.in OR nombre
const q = "juan";
let tut = await sb.from("guardians").select("user_id").or(`nombre.ilike.%${q}%,full_name.ilike.%${q}%`);
console.log("PASO 2a (buscar guardianes):", tut.error ? `ERR ${tut.error.code}` : `OK tutores=${tut.data?.length ?? 0}`);
const tids = [...new Set((tut.data ?? []).map((t) => t.user_id).filter(Boolean))];
console.log("   tutorUserIds:", tids.length ? tids.join(",") : "(ninguno)");

// 3) Filtro compuesto en athletes: nombre O user_id.in(tutores)
if (tids.length) {
  r = await sb
    .from("athletes")
    .select("id, nombre")
    .or(`nombre.ilike.%${q}%,apellido.ilike.%${q}%,full_name.ilike.%${q}%,user_id.in.(${tids.join(",")})`)
    .limit(5);
} else {
  r = await sb.from("athletes").select("id, nombre").or(`nombre.ilike.%${q}%,apellido.ilike.%${q}%,full_name.ilike.%${q}%`).limit(5);
}
console.log("PASO 3 (filtro atleta O tutor):", r.error ? `ERR ${r.error.code}: ${r.error.message}` : "OK (sin error de filtro)");

// 4) Fotos separadas agrupadas por user_id (photos no tiene FK a athletes)
const userIds = r.data?.map((x) => x.id).filter(Boolean) ?? ["00000000-0000-0000-0000-000000000000"];
// user_id real de atletas si hay datos
r = await sb.from("athletes").select("user_id").limit(5);
const uids = [...new Set((r.data ?? []).map((x) => x.user_id).filter(Boolean))];
console.log("PASO 4a uids disponibles:", uids.length ? uids.join(",") : "(sin atletas aún — tabla vacía)");
if (uids.length) {
  let fotos = await sb.from("photos").select("user_id, url").in("user_id", uids);
  console.log("PASO 4b (fotos por user_id):", fotos.error ? `ERR ${fotos.error.code}` : `OK fotos=${fotos.data?.length ?? 0}`);
} else {
  console.log("PASO 4b: (fotos no probado — tabla athletes vacía)");
}
