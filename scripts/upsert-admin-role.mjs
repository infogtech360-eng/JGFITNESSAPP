// Localizar admin en auth.users por email (una llamada, filtro server-side) y
// hacer upsert en public.users con role='admin'. Service role.
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.log("MISSING ENV"); process.exit(2); }

const EMAIL = "infogtech360@gmail.com";
const TIMEOUT = 60000; // ms

async function timedFetch(path, opts = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const r = await fetch(`${url}${path}`, {
      ...opts,
      signal: ctrl.signal,
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...(opts.headers||{}) },
    });
    return { status: r.status, body: await r.json().catch(() => null) };
  } finally { clearTimeout(t); }
}

async function main() {
  // Buscar por filtro de email en una sola llamada
  const found = await timedFetch(
    `/auth/v1/admin/users?per_page=1000&filter=email:eq:${encodeURIComponent(EMAIL.toLowerCase())}`
  );
  console.log("search HTTP", found.status);
  let id = null;
  if (Array.isArray(found.body)) {
    const hit = found.body.find(x => (x.email||"").toLowerCase() === EMAIL.toLowerCase());
    if (hit) { id = hit.id; console.log("auth.users HIT:", hit.id, hit.email, "| confirmed:", hit.confirmed_at); }
    else console.log("no hit in", found.body.length, "results");
  } else if (found.body && Array.isArray(found.body.users)) {
    const hit = found.body.users.find(x => (x.email||"").toLowerCase() === EMAIL.toLowerCase());
    if (hit) { id = hit.id; console.log("auth.users HIT(users[]):", hit.id, hit.email, "| confirmed:", hit.confirmed_at); }
    else console.log("no hit in .users", found.body.users.length);
  } else {
    console.log("unexpected search resp:", JSON.stringify(found.body||found.body===null?"parse-fail":"").slice(0,200));
  }

  if (!id) {
    // Fallback al id conocido del admin (documentado en memoria, confirmed_at 2026-09-02 21:05)
    id = "72f44842-51fe-4506-9821-366b4fa3547c";
    console.log("FALLBACK id:", id);
  }

  // Upsert en public.users
  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from("users")
    .upsert(
      [{ id, email: EMAIL.toLowerCase(), role: "admin", rol: "admin", updated_at: new Date().toISOString() }],
      { onConflict: "id", ignoreDuplicates: false }
    )
    .select("id, email, role, rol");

  if (error) { console.log("UPSERT ERROR:", error.message); return; }
  console.log("UPSERT OK:", JSON.stringify(data));

  const { data: v } = await supabase
    .from("users").select("id, email, role, rol, created_at, updated_at").eq("id", id).maybeSingle();
  console.log("VERIFY:", JSON.stringify(v));
}
main().catch(e => console.log("ERR", e.message));
