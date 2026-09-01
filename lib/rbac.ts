// Helpers de roles/permisos (RBAC).
// En el MVP los roles se toman del app_metadata del JWT (Supabase Auth).
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
