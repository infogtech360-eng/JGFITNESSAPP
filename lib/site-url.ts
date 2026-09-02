// Resolución del origen (URL base) de la aplicación según el entorno de despliegue.
//
// Server Actions / Server Components NO tienen window, así que derivamos el origin
// de las variables de entorno que el proveedor de hosting inyecta en runtime.
// Esto evita que el magic link lleve un redirect_to=localhost en producción
// (causa de ERR_INVALID_REDIRECT en Supabase Auth).
//
// Precedencia (primero que exista):
//   1. NEXT_PUBLIC_SITE_URL        -> override explícito (si se define en el panel).
//   2. VERCEL_PROJECT_PRODUCTION_URL / VERCEL_URL + NEXT_PUBLIC_VERCEL_URL
//                                    -> Vercel inyecta éstas en build+runtime: https://<proyecto>.vercel.app
//   3. URL  /  DEPLOY_URL           -> Netlify las inyecta en build+funciones: https://<site>.netlify.app
//   4. fallback local               -> solo para `next dev` (http://localhost:3000).

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit && explicit.length > 0) {
    return stripTrailingSlash(explicit);
  }

  // Vercel: el dominio de producción canónico suele venir en VERCEL_PROJECT_PRODUCTION_URL
  // (sin protocolo); VERCEL_URL / NEXT_PUBLIC_VERCEL_URL traen el host del deploy.
  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    process.env.VERCEL_URL;
  if (vercelHost && vercelHost.length > 0) {
    const clean = vercelHost.replace(/^https?:\/\//, "").split("/")[0];
    if (clean.length > 0) {
      return `https://${stripTrailingSlash(clean)}`;
    }
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
