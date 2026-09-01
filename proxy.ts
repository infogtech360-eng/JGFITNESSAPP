import { NextResponse, type NextRequest } from "next/server";

// Next.js 16 "proxy" (antes middleware).
// IMPORTANTE para Netlify: este archivo se empaqueta como edge function.
// Para evitar el fallo de bundling del runtime de Turbopack en el borde,
// NO importamos la SDK de Supabase aquí. La verificación real de sesión
// se hace en el servidor (dashboard, server actions) con getUser().

// Rutas que requieren sesión (la redirección se refuerza server-side)
const PROTECTED_PREFIXES = ["/dashboard", "/onboarding", "/perfil", "/consentimientos"];
// Rutas de auth a las que no se debe entrar con sesión activa
const AUTH_PREFIXES = ["/login", "/registro", "/recuperar"];

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));
  const isAuthPath = AUTH_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));

  // En este MVP el proxy no decide autenticación en el borde (para compatibilidad
  // con el bundling de Netlify). La protección real la aplica cada página/servidor.
  // Solo normalizamos redirecciones de conveniencia sin tocar cookies/sesión.
  void isProtected;
  void isAuthPath;

  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
