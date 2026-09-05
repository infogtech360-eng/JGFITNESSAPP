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

  // 3) Consulta principal de atletas (sin joins complejos que fallen si guardian_id es null).
  let query = supabase
    .from("athletes")
    .select("*")
    .order("created_at", { ascending: false });

  if (filtros.categoria && filtros.categoria !== "todas") {
    query = query.eq("categoria", filtros.categoria);
  }
  if (filtros.deporte && filtros.deporte !== "todos") {
    query = query.eq("deporte", filtros.deporte);
  }
  if (q !== "") {
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

  const atletasRaw = data ?? [];

  // 4) Obtener tutores en consulta separada usando los guardian_id existentes
  const guardianIds = [
    ...new Set(atletasRaw.map((r) => r.guardian_id as string).filter(Boolean)),
  ];
  const tutoresPorId: Record<string, { nombre?: string | null; relacion?: string | null; telefono?: string | null }> = {};
  if (guardianIds.length > 0) {
    const { data: guardiansData, error: guardiansErr } = await supabase
      .from("guardians")
      .select("id, nombre, relacion, telefono")
      .in("id", guardianIds);
    if (!guardiansErr && guardiansData) {
      for (const g of guardiansData) {
        tutoresPorId[g.id] = g;
      }
    }
  }

  // 5) Fotos agrupadas por user_id
  const userIds = [
    ...new Set(atletasRaw.map((r) => r.user_id as string).filter(Boolean)),
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

  // 6) Mapeo final de filas enriquecidas
  const atletas: AtletaRow[] = atletasRaw.map((r) => {
    const g = r.guardian_id ? tutoresPorId[r.guardian_id] : null;
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