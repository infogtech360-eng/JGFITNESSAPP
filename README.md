# JG IMPULSA — App

**EL ATLETA ES EL CENTRO.**

Plataforma de acompañamiento integral donde el atleta es el centro y los datos permiten medir, comprender y mejorar su evolución.

## Pilares
MENTAL · EMOCIONAL · TÁCTICO (capas complementarias: físico, hábitos, estudios, nutrición, comunicación, imagen y desarrollo profesional).

## Stack
- **Next.js 16 + TypeScript + Tailwind CSS** (App Router)
- **Supabase** — Auth, PostgreSQL (RLS), Storage
- **Netlify** — build, hosting PWA, funciones serverless

## Estructura
```
app/                  # rutas y páginas (App Router)
lib/
  supabase/
    client.ts         # cliente navegador
    server.ts         # cliente servidor (cookies)
    service.ts        # cliente rol de servicio (solo server)
  rbac.ts             # helpers de roles/permisos
docs/                 # arquitectura, esquema BD, plan MVP, decisiones
supabase/             # migraciones SQL + seed (pendiente de añadir)
public/               # estáticos
netlify.toml          # config de despliegue Netlify
```

## Setup local
1. `npm install`
2. `cp .env.example .env.local` y rellena las variables de Supabase.
3. `npm run dev`

## Despliegue
- Build: `npm run build`
- Netlify: el repo se conecta a Netlify; `netlify.toml` define build y environment. Las variables de entorno de Supabase (URL, anon, y la clave de rol de servicio para el servidor) se definen en el panel de Netlify, nunca en el repo.

## Docs
Ver `docs/` para arquitectura, esquema de BD, plan del MVP (Fase 1) y decisiones pendientes.
