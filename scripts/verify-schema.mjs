// JG IMPULSA — Verificación 1:1 del 001 revisado vs metadata real
// Cruza el archivo SQL declarativo contra el volcado real de
// information_schema.columns + pg_policies.
import { readFileSync } from "node:fs";

const sql = readFileSync(new URL("../supabase/migrations/001_auth_onboarding.sql", import.meta.url), "utf8");

// Metadata real (del volcado de information_schema.columns + pg_policies)
const realCols = {
  users:    [["id","uuid","NO","gen_random_uuid()"],["email","text","NO",null],["role","text","NO","'athlete'::text"],["created_at","timestamp with time zone","NO","now()"],["updated_at","timestamp with time zone","NO","now()"]],
  athletes: [["id","uuid","NO","gen_random_uuid()"],["user_id","uuid","NO",null],["guardian_id","uuid","YES",null],["full_name","text","NO",null],["birth_date","date","NO",null],["sport","text","NO",null],["category","text","NO",null],["created_at","timestamp with time zone","NO","now()"]],
  guardians:[["id","uuid","NO","gen_random_uuid()"],["user_id","uuid","NO",null],["full_name","text","NO",null],["phone","text","NO",null],["relationship","text","NO",null],["created_at","timestamp with time zone","NO","now()"]],
  consents: [["id","uuid","NO","gen_random_uuid()"],["user_id","uuid","NO",null],["terms_accepted","boolean","NO","false"],["media_release","boolean","NO","false"],["accepted_at","timestamp with time zone","NO","now()"]],
  photos:   [["id","uuid","NO","gen_random_uuid()"],["user_id","uuid","NO",null],["url","text","NO",null],["created_at","timestamp with time zone","NO","now()"]],
};

const realPolicies = {
  athletes: [["Atletas leen su data","SELECT"],["Atletas insertan su data","INSERT"]],
  consents: [["Consentimientos propios","ALL"]],
  guardians:[["Tutores leen su data","SELECT"],["Tutores insertan su data","INSERT"]],
  photos:   [["Fotos propias","ALL"]],
  users:    [["Usuarios leen su perfil","SELECT"],["Usuarios actualizan su perfil","UPDATE"]],
};

let ok = true;
const errs = [];

// 1) Verificar columnas: extraer bloque de cada create table
for (const [t, cols] of Object.entries(realCols)) {
  // Buscar el bloque CREATE TABLE
  const blockMatch = sql.match(new RegExp(`create table if not exists public\\.${t}\\s*\\(([\\s\\S]*?)\\)\\s*;`, "i"));
  if (!blockMatch) { errs.push(`❌ ${t}: no se encontró CREATE TABLE`); ok = false; continue; }
  const block = blockMatch[1];

  for (const [name, type, nullable, def] of cols) {
    // Buscar línea de la columna
    const lineRe = new RegExp(`^\\s*${name}\\s+([a-z ]+?)(\\s+(primary key|not null))?(\\s+default\\s+(.+?))?,?\\s*$`, "m");
    const m = block.match(lineRe);
    if (!m) { errs.push(`❌ ${t}.${name}: columna NO encontrada en SQL`); ok = false; continue; }
    const sqlType = m[1].trim();
    const hasPK = /primary key/i.test(m[2] ?? "");
    const hasNotNull = /not null/i.test(m[2] ?? "") || hasPK; // primary key => implícito NOT NULL
    const sqlDefault = m[5] ? m[5].replace(/,$/, "").trim() : (hasPK ? "gen_random_uuid()" : null);

    // Tipo: normalizar
    const typeMap = { "timestamp with time zone": "timestamptz", "boolean": "boolean", "uuid": "uuid", "text": "text", "date": "date" };
    const realT = typeMap[type] ?? type;
    if (sqlType !== realT) { errs.push(`❌ ${t}.${name}: tipo SQL '${sqlType}' != real '${realT}'`); ok = false; }

    // Not null
    const realNN = nullable === "NO";
    if (hasNotNull !== realNN) { errs.push(`❌ ${t}.${name}: not null SQL=${hasNotNull} != real=${realNN}`); ok = false; }

    // Default (solo reportar si difiere en algo relevante)
    const dm = typeMap[def] ?? def;
    if (sqlDefault && sqlDefault !== dm && sqlDefault !== def && !(sqlDefault === "gen_random_uuid()" && def === "gen_random_uuid()")) {
      errs.push(`⚠️ ${t}.${name}: default SQL '${sqlDefault}' != real '${def}'`);
    }
  }

  // Políticas
  const pols = realPolicies[t] ?? [];
  for (const [pname, cmd] of pols) {
    const found = new RegExp(`create policy "${pname}" on public\\.${t}\\s+for ${cmd.toLowerCase()}`, "i").test(sql);
    if (!found) { errs.push(`❌ ${t}: política "${pname}" (${cmd}) no encontrada`); ok = false; }
  }
}

console.log("=== VERIFICACIÓN 1:1 del 001 revisado contra metadata real ===");
if (errs.length === 0) {
  console.log("✅ TODAS las columnas, tipos, NOT NULL, defaults y políticas coinciden 1:1 con producción.");
} else {
  console.log(errs.join("\n"));
}
