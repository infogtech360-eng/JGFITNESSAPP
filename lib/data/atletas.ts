import { createServiceClient } from "@/lib/supabase/service";

// La capa de datos del panel de gestión (vista Admin/Coach) lista atletas de TODOS
// los usuarios. Eso requiere los privilegios de staff que en la DB se otorgarían con
// la policy RLS "athletes_staff_all" (public.users.role in admin/coach).
// La ruta que consume esta función (/dashboard/admin) ya valida por RBAC server-side
// (esRolGestion) ANTES de llamarla, así que usamos el client service-role aquí de forma
// AISLADA para estas lecturas de gestión. El resto de capas (onboarding, panel del
// atleta, tutores) siguen usando el client autenticado y respetan RLS.

// Enriquecimiento de cada atleta con datos del tutor (guardian) y fotos (photos).
export type AtletaRow = {
  id: string;
  user_id: string | null;
  nombre: string | null;
  apellido: string | null;
  full_name: string | null;
  deporte: string | null;
  posicion: string | null;
  categoria: string | null;
  equipo: string | null;
  altura: number | null;
  peso: number | null;
  pais: string | null;
  ciudad: string | null;
  correo: string | null;
  telefono: string | null;
  pierna_mano_dominante: string | null;
  objetivo: string | null;
  que_quiere_mejorar: string | null;
  habito_a_cambiar: string | null;
  sueno_deportivo: string | null;
  estado: string | null;
  created_at: string | null;
  updated_at: string | null;
  // Tutor (vía guardian_id -> guardians)
  tutor_nombre: string | null;
  tutor_relacion: string | null;
  tutor_telefono: string | null;
  // Fotos (vía user_id -> photos)
  fotos: string[];
};

export type FiltrosAtletas = {
  categoria?: string;
  deporte?: string;
  q?: string; // búsqueda por nombre atleta o tutor
};

// Lista atletas con filtros server-side (categoría, deporte, búsqueda texto).
export async function getAtletas(filtros: FiltrosAtletas = {}): Promise<{
  atletas: AtletaRow[];
  categorias: string[];
  deportes: string[];
}> {
  // Client de servicio para lecturas de gestión multiusuario (equivalente a staff_all).
  const supabase = createServiceClient();

  // 1) Opciones de filtro (distintos de categoría y deporte).
  const [resCat, resDep] = await Promise.all([
    supabase.from("athletes").select("categoria").not("categoria", "is", null),
    supabase.from("athletes").select("deporte").not("deporte", "is", null),
  ]);
  const categorias = [
    ...new Set((resCat.data ?? []).map((r) => r.categoria as string).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b, "es"));
  const deportes = [
    ...new Set((resDep.data ?? []).map((r) => r.deporte as string).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b, "es"));

  // 2) Búsqueda por texto (nombre atleta o tutor):
  //    PostgREST NO permite filtrar relaciones embebidas dentro de .or(), así que
  //    resolvemos el tutor en dos pasos: (a) buscar guardianes que matcheen y tomar
  //    sus user_id; (b) filtrar athletes por nombre propio O por esos user_id.
  let tutorUserIds: string[] = [];
  const q = filtros.q?.trim() ?? "";
  if (q !== "") {
    const { data: tutores } = await supabase
      .from("guardians")
      .select("user_id")
      .or(`nombre.ilike.%${q}%,full_name.ilike.%${q}%`);
    tutorUserIds = [
      ...new Set((tutores ?? []).map((t) => t.user_id as string).filter(Boolean)),
    ];
  }

  // 3) Consulta principal de atletas con filtros + join al tutor (FK guardian_id).
  let query = supabase
    .from("athletes")
    .select(
      `id, user_id, nombre, apellido, full_name, deporte, posicion, categoria, equipo,
       altura, peso, pais, ciudad, correo, telefono, pierna_mano_dominante, objetivo,
       que_quiere_mejorar, habito_a_cambiar, sueno_deportivo, estado, created_at, updated_at,
       guardians:guardian_id(id, nombre, relacion, telefono)`
    )
    .order("created_at", { ascending: false });

  if (filtros.categoria && filtros.categoria !== "todas") {
    query = query.eq("categoria", filtros.categoria);
  }
  if (filtros.deporte && filtros.deporte !== "todos") {
    query = query.eq("deporte", filtros.deporte);
  }
  if (q !== "") {
    // Filtro compuesto: coincide con el nombre del atleta O con un tutor hallado.
    if (tutorUserIds.length > 0) {
      query = query.or(
        `nombre.ilike.%${q}%,apellido.ilike.%${q}%,full_name.ilike.%${q}%,user_id.in.(${tutorUserIds.join(",")})`
      );
    } else {
      query = query.or(`nombre.ilike.%${q}%,apellido.ilike.%${q}%,full_name.ilike.%${q}%`);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error("getAtletas error:", error);
    return { atletas: [], categorias, deportes };
  }

  // 4) Fotos: photos no tiene FK a athletes (solo comparten el valor user_id),
  //    así que PostgREST no puede embederlas. Las traemos en una consulta separada
  //    agrupadas por user_id y las adjuntamos en memoria.
  const userIds = [
    ...new Set((data ?? []).map((r) => r.user_id as string).filter(Boolean)),
  ];
  const fotosPorUser: Record<string, string[]> = {};
  if (userIds.length > 0) {
    const { data: fotos, error: fotosErr } = await supabase
      .from("photos")
      .select("user_id, url")
      .in("user_id", userIds);
    if (!fotosErr && fotos) {
      for (const f of fotos) {
        const uid = f.user_id as string;
        (fotosPorUser[uid] ??= []).push(f.url as string);
      }
    }
  }

  const atletas: AtletaRow[] = (data ?? []).map((r) => {
    // El join embebido guardians:guardian_id devuelve OBJETO singular (no array).
    // Manejamos ambos casos por robustez (array si alguna FK devuelve plural).
    const g = (Array.isArray(r.guardians) ? r.guardians?.[0] : r.guardians) as
      | { nombre?: string | null; relacion?: string | null; telefono?: string | null }
      | null
      | undefined;
    return {
      id: r.id,
      user_id: r.user_id,
      nombre: r.nombre,
      apellido: r.apellido,
      full_name: r.full_name,
    deporte: r.deporte,
    posicion: r.posicion,
    categoria: r.categoria,
    equipo: r.equipo,
    altura: r.altura,
    peso: r.peso,
    pais: r.pais,
    ciudad: r.ciudad,
    correo: r.correo,
    telefono: r.telefono,
    pierna_mano_dominante: r.pierna_mano_dominante,
    objetivo: r.objetivo,
    que_quiere_mejorar: r.que_quiere_mejorar,
    habito_a_cambiar: r.habito_a_cambiar,
    sueno_deportivo: r.sueno_deportivo,
    estado: r.estado,
    created_at: r.created_at,
    updated_at: r.updated_at,
    tutor_nombre: g?.nombre ?? null,
    tutor_relacion: g?.relacion ?? null,
    tutor_telefono: g?.telefono ?? null,
    fotos: r.user_id ? fotosPorUser[r.user_id as string] ?? [] : [],
  };
  });

  return { atletas, categorias, deportes };
}
