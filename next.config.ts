import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16 en Netlify: el runtime de Netlify detecta y sirve rutas API
  // y server components como funciones. Ajustes específicos de PNG/optimización
  // quedan disponibles si el plan de Netlify lo requiere.
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
