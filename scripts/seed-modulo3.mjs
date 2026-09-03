// Seed mock data — Módulo 3 (JG IMPULSA)
// Puebla atletas + tutores(guardians) + photos + consents con data realista
// para validar la vista admin/coach (/dashboard/admin) en producción.
// Uso: node scripts/seed-modulo3.mjs
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = (k) => {
  const m = fs.readFileSync(".env.local", "utf8").match(new RegExp("^" + k + "=(.*)$", "m"));
  return m ? m[1].trim().replace(/^"(.*)"$/, "$1") : "";
};
const A = createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"));
const ADMIN_ID = "72f44842-51fe-4506-9821-366b4fa3547c"; // infogtech360@gmail.com (admin)

// Catálogo de atletas mock (variedad de deportes/categorías/equipos para probar filtros)
const ATLETAS = [
  { email: "carlos.mendez@jg.test", nombre: "Carlos", apellido: "Méndez", fn: "2009-04-12", deporte: "Fútbol", posicion: "Delantero", categoria: "Sub-15", equipo: "JG Talentos", altura: 1.68, peso: 55, pais: "Panamá", ciudad: "Panamá", telefono: "+507 6000-1001", pierna: "Derecha", hescolar: "7:30–13:00", hentrena: "16:00–18:00", objetivo: "Llegar a la selección nacional", mejorar: "Definición frente al arco", habito: "Dormir 8 horas", sueno: "Ser futbolista profesional en Europa", tutor: { nombre: "Luis Méndez", relacion: "Padre", telefono: "+507 6000-6001", documento: "8-123-456" } },
  { email: "sofia.ramos@jg.test", nombre: "Sofía", apellido: "Ramos", fn: "2010-09-03", deporte: "Baloncesto", posicion: "Base", categoria: "Sub-14", equipo: "Panteras", altura: 1.62, peso: 50, pais: "Panamá", ciudad: "Colón", telefono: "+507 6000-1002", pierna: "Derecha", hescolar: "7:00–12:30", hentrena: "17:00–19:00", objetivo: "Mejorar manejo de balón", mejorar: "Tiro de tres puntos", habito: "Entrenar fuerza 2x/semana", sueno: "Jugar en NCAA", tutor: { nombre: "María Ramos", relacion: "Madre", telefono: "+507 6000-6002", documento: "6-789-012" } },
  { email: "diego.reyes@jg.test", nombre: "Diego", apellido: "Reyes", fn: "2008-01-25", deporte: "Béisbol", posicion: "Lanzador", categoria: "Sub-17", equipo: "Águilas", altura: 1.75, peso: 68, pais: "Panamá", ciudad: "Chiriquí", telefono: "+507 6000-1003", pierna: "Derecha", hescolar: "7:30–13:30", hentrena: "15:00–17:00", objetivo: "Aumentar velocidad de recta", mejorar: "Control de lanzamientos", habito: "Calentamiento previo", sueno: "Pitcher en MLB", tutor: { nombre: "Pedro Reyes", relacion: "Padre", telefono: "+507 6000-6003", documento: "4-567-890" } },
  { email: "valeria.castro@jg.test", nombre: "Valeria", apellido: "Castro", fn: "2011-06-17", deporte: "Natación", posicion: "Estilo libre", categoria: "Infantil", equipo: "Delfines RC", altura: 1.5, peso: 42, pais: "Panamá", ciudad: "Panamá", telefono: "+507 6000-1004", pierna: "Izquierda", hescolar: "7:00–12:00", hentrena: "05:30–07:00", objetivo: "Clasificar a Juegos Infantiles", mejorar: "Salida y viraje", habito: "Hidratarse bien", sueno: "Competir en Juegos Olímpicos", tutor: { nombre: "Ana Castro", relacion: "Madre", telefono: "+507 6000-6004", documento: "8-234-567" } },
  { email: "mateo.gomez@jg.test", nombre: "Mateo", apellido: "Gómez", fn: "2007-11-30", deporte: "Atletismo", posicion: "Velocidad 100m", categoria: "Sub-18", equipo: "Pumas Club", altura: 1.7, peso: 62, pais: "Panamá", ciudad: "La Chorrera", telefono: "+507 6000-1005", pierna: "Derecha", hescolar: "7:30–13:00", hentrena: "16:30–18:30", objetivo: "Bajar su marca a 11.2s", mejorar: "Salida de tacos", habito: "Estiramiento post-run", sueno: "Representar a Panamá en CAC", tutor: { nombre: "Jorge Gómez", relacion: "Padre", telefono: "+507 6000-6005", documento: "2-345-678" } },
  { email: "lucia.herrera@jg.test", nombre: "Lucía", apellido: "Herrera", fn: "2009-12-08", deporte: "Voleibol", posicion: "Opuesta", categoria: "Sub-15", equipo: "Estrellas", altura: 1.72, peso: 58, pais: "Panamá", ciudad: "Panamá", telefono: "+507 6000-1006", pierna: "Derecha", hescolar: "7:00–13:00", hentrena: "18:00–20:00", objetivo: "Dominar remate", mejorar: "Salto vertical", habito: "Trabajar core", sueno: "Ser armadora principal del equipo nacional", tutor: { nombre: "Rosa Herrera", relacion: "Madre", telefono: "+507 6000-6006", documento: "5-678-901" } },
];

const estado = { ok: 0, fail: 0, detalle: [] };

async function crearAtleta(a) {
  // 1) Usuario auth (dispara trigger handle_new_user -> fila en public.users)
  const { data: ua, error: uaErr } = await A.auth.admin.createUser({
    email: a.email, email_confirm: true,
    user_metadata: { rol: "atleta", full_name: `${a.nombre} ${a.apellido}` },
  });
  if (uaErr) { estado.fail++; estado.detalle.push(`AUTH ${a.email}: ${uaErr.message}`); return; }
  const uid = ua.user.id;

  // 2) Insert atleta (columnas ricas + planas rellenas para coherencia)
  const payload = {
    user_id: uid, created_by: ADMIN_ID,
    nombre: a.nombre, apellido: a.apellido,
    full_name: `${a.nombre} ${a.apellido}`,
    fecha_nacimiento: a.fn, birth_date: a.fn,
    deporte: a.deporte, sport: a.deporte,
    posicion: a.posicion, categoria: a.categoria, category: a.categoria,
    equipo: a.equipo, altura: a.altura, peso: a.peso,
    pais: a.pais, ciudad: a.ciudad, correo: a.email, telefono: a.telefono,
    pierna_mano_dominante: a.pierna,
    horario_escolar: a.hescolar, horario_entrenamiento: a.hentrena,
    objetivo: a.objetivo, que_quiere_mejorar: a.mejorar,
    habito_a_cambiar: a.habito, sueno_deportivo: a.sueno,
    estado: "activo",
  };
  const { data: ath, error: aErr } = await A.from("athletes").insert(payload).select("id").single();
  if (aErr) { estado.fail++; estado.detalle.push(`ATHLETE ${a.email}: ${aErr.code} ${aErr.message}`); return; }
  const aid = ath.id;

  // 3) Guardian (tutor) vinculado al atleta vía athlete_id + user del tutor
  const tutEmail = a.tutor.nombre.toLowerCase().replace(/[^a-z]/g, "") + a.apellido.toLowerCase() + "@jgtest.test";
  const tutRes = await A.auth.admin.createUser({
    email: tutEmail, email_confirm: true, user_metadata: { rol: "tutor", full_name: a.tutor.nombre },
  });
  const tutUser = tutRes?.data?.user;
  if (tutUser) {
    const { error: gErr } = await A.from("guardians").insert({
      user_id: tutUser.id, athlete_id: aid, created_by: ADMIN_ID,
      nombre: a.tutor.nombre, relacion: a.tutor.relacion, telefono: a.tutor.telefono, documento: a.tutor.documento,
      full_name: a.tutor.nombre, relationship: a.tutor.relacion, phone: a.tutor.telefono,
    });
    if (gErr) estado.detalle.push(`GUARDIAN ${a.email}: ${gErr.code} ${gErr.message}`);
  } else {
    estado.detalle.push(`TUTOR ${a.email}: createUser fallo (${tutRes?.error?.message || "null"})`);
  }

  // 4) Consent + foto mock
  await A.from("consents").insert({ user_id: uid, terms_accepted: true, media_release: true });
  await A.from("photos").insert({ user_id: uid, url: `https://picsum.photos/seed/jg${aid.slice(0,6)}/300/300` });

  estado.ok++;
  estado.detalle.push(`OK ${a.nombre} ${a.apellido} (${a.deporte}/${a.categoria}) uid=${uid.slice(0,8)}`);
}

(async () => {
  for (const a of ATLETAS) await crearAtleta(a);
  console.log(`\n=== SEED MÓDULO 3 ===  ok=${estado.ok} fail=${estado.fail}`);
  estado.detalle.forEach((d) => console.log(" -", d));
  const { count } = await A.from("athletes").select("id", { count: "exact", head: true });
  const { count: g } = await A.from("guardians").select("id", { count: "exact", head: true });
  const { count: p } = await A.from("photos").select("id", { count: "exact", head: true });
  console.log(`Totales DB -> athletes=${count} guardians=${g} photos=${p}`);
})();
