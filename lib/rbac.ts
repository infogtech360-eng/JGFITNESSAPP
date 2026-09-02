// Helpers de roles/permisos (RBAC).
// En el MVP los roles se toman del app_metadata del JWT (Supabase Auth) y se
// complementan CON la fuente canónica public.users.role (que el operador puede
// escalar vía SQL sin re-emitir el JWT).
// Se refuerzan SIEMPRE con RLS en la base de datos; esto es solo una capa de conveniencia en la app.

export const ROLES = {
  admin: "admin",
  atleta: "atleta",
  tutor: "tutor",
  club: "club",
  profesional: "profesional",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export function getRole(user: { app_metadata?: { role?: string } } | null): Role | null {
  const role = user?.app_metadata?.role;
  return role && role in ROLES ? (role as Role) : null;
}

export function isAdmin(user: { app_metadata?: { role?: string } } | null): boolean {
  return getRole(user) === ROLES.admin;
}

export function hasRole(
  user: { app_metadata?: { role?: string } } | null,
  ...allowed: Role[]
): boolean {
  const role = getRole(user);
  return role !== null && allowed.includes(role);
}

// Normaliza el rol de un usuario teniendo en cuenta las fuentes disponibles,
// con prioridad a la DB (public.users.role) sobre el app_metadata del JWT:
//   1. rol de public.users (canónico, escalable por SQL en caliente)
//   2. app_metadata.rol
//   3. app_metadata.role
// Devuelve null si no hay una fuente concreta.
export function resolveRole(input: {
  dbRole?: string | null;
  appMetadata?: Record<string, unknown> | null;
}): string | null {
  const db = input?.dbRole;
  if (db && db.trim().length > 0) return db.trim();

  const appRol = input?.appMetadata?.["rol"];
  if (typeof appRol === "string" && appRol.trim().length > 0) return appRol.trim();

  const appRole = input?.appMetadata?.["role"];
  if (typeof appRole === "string" && appRole.trim().length > 0) return appRole.trim();

  return null;
}

// Comprueba si un rol pertenece al conjunto de roles con acceso a la gestión
// de atletas (admin / coach / entrenador / club).
export function esRolGestion(rol: string | null): boolean {
  return (
    rol === "admin" ||
    rol === "coach" ||
    rol === "entrenador" ||
    rol === "club"
  );
}
