// Resolución del origen (URL base) de la aplicación según el entorno de despliegue.
//
// Server Actions / Server Components NO tienen window, así que derivamos el origin
// de las variables de entorno que el proveedor de hosting inyecta en runtime.
// Esto evita que el magic link lleve un redirect_to=localhost en producción
// (causa de ERR_INVALID_REDIRECT en Supabase Auth).
//
// Precedencia (primero que exista):
//   1. NEXT_PUBLIC_SITE_URL  -> override explícito (si se define en el panel).
//   2. URL  /  DEPLOY_URL    -> Netlify las inyecta en build+funciones: https://<site>.netlify.app
//   3. fallback local        -> solo para `next dev` (http://localhost:3000).

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit && explicit.length > 0) {
    return stripTrailingSlash(explicit);
  }

  const netlifyUrl = process.env.URL || process.env.DEPLOY_URL;
  if (netlifyUrl && netlifyUrl.length > 0 && /^https?:\/\//.test(netlifyUrl)) {
    return stripTrailingSlash(netlifyUrl);
  }

  // Último recurso: entorno local de desarrollo.
  return "http://localhost:3000";
}

// Devuelve la ruta absoluta (origin + pathname) de la app.
export function absUrl(path = "/"): string {
  const base = getSiteUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}
