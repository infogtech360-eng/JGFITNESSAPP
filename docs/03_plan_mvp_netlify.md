# JG IMPULSA — Plan para construir la Fase 1 (MVP) en Netlify

> Entregable según sección 24. Plan de construcción por módulos, código mantenible y documentado.

## Objetivo del MVP (Fase 1)
Landing pública, registro/onboarding atleta + tutor, consentimientos versionados, perfil + fotos (máx. 3), planes, pagos, dashboard básico y página de contacto. (Sección 23 del Documento Maestro.)

## Stack objetivo
- **Next.js 14 (App Router) + TypeScript + Tailwind CSS**
- **Supabase** (Auth + PostgreSQL + Storage) — RLS activado
- **Netlify** para build, hosting PWA y funciones serverless
- **next-pwa** para instalabilidad básica de la PWA

## Estructura del repo propuesta
```
jg-impulsa/
├─ app/                    # Next.js App Router (rutas y páginas)
│  ├─ (public)/            # landing, contacto, login, registro
│  ├─ (app)/               # dashboard, atletas, planes, pagos, ajustes
│  └─ api/                 # Route Handlers (auth, atletas, pagos, webhooks)
├─ components/             # componentes reutilizables
├─ lib/                    # supabase client, utils, validaciones
│  ├─ client.ts
│  ├─ server.ts
│  └─ rbac.ts              # helpers de roles/permisos
├─ supabase/
│  ├─ migrations/          # SQL de esquema + RLS
│  └─ seed.sql             # datos semilla (deportes, posiciones, score weights)
├─ public/                 # estáticos, manifest, service worker
├─ docs/                   # este documento + arquitectura + esquema
├─ .env.local              # variables locales (NO commitear)
├─ .gitignore
├─ netlify.toml            # config de build/despliegue
├─ package.json
└─ README.md
```

## Despliegue en Netlify
1. Conectar repo GitHub a Netlify (Build & Deploy).
2. Configurar `netlify.toml`:
   ```
   [build]
     command = "npm run build"
     publish = ".next"
   [build.environment]
     NODE_VERSION = "20"
   ```
   > Nota: para Next.js en Netlify se usa el **Netlify Next.js runtime** (rutas y API como funciones serverless). Ajustar `publish`/`functions` según versión. Se configura en el asistente de Netlify al conectar el repo.
3. Variables de entorno en Netlify (secretos, no en repo):
   - `SUPABASE_URL`
   - Clave de rol de servicio de Supabase (solo server-side; configurar en el panel de Netlify, nunca en el repo)
   - `SUPABASE_ANON_KEY` (público, solo con RLS protegiendo)
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Claves de pasarela de pago (cuando se decida)
4. Despliegues automáticos por push a `main`; previews por PR.

## Plan de construcción por módulos (orden sugerido)

### Módulo 0 — Infraestructura base
- [ ] Inicializar Next.js + TypeScript + Tailwind.
- [ ] Configurar Supabase project, Auth (email+password), Storage buckets.
- [ ] Aplicar migraciones SQL (esquema + RLS) y seed.
- [ ] Configurar Netlify (conexión repo, `netlify.toml`, env vars).
- [ ] Estructura de carpetas, layout base, tema/estilo JG IMPULSA.

### Módulo 1 — Landing pública
- [ ] Secciones: hero (logo + "EL ATLETA ES EL CENTRO"), misión/visión/valores, pilares MENTAL·EMOCIONAL·TÁCTICO, fundamento en Dios, cómo funciona, planes/precios, servicios clubes, testimonios/contenido.
- [ ] CTAs: "Quiero impulsar a mi atleta", "Soy club/equipo", contacto.
- [ ] `/contacto` formulario + guardado/notificación.

### Módulo 2 — Auth + Onboarding
- [ ] Registro atleta (datos completos sección 4).
- [ ] Registro tutor (nombre, relación, correo, teléfono, documento, firma, consentimientos).
- [ ] Login con password temporal + recuperación (sin cédula como contraseña).
- [ ] Fotos (máx. 3: cuerpo completo, carnet, uniforme/acción) — validación formato/tamaño/privacidad.
- [ ] Vinculación menor ↔ tutor.

### Módulo 3 — Consentimientos versionados
- [ ] Tabla consents con versión/estado; flujo de firma del tutor.
- [ ] Guardado de documento firmado en Storage + referencia.

### Módulo 4 — Perfil + Player Card
- [ ] Detalle atleta, datos, fotos, Player Card con atributos (mantener pendientes/bloqueados hasta tener mediciones reales — sección 6).

### Módulo 5 — Planes (CRUD básico)
- [ ] Crear/listar/detalle de planes personalizados (tipos: mental, emocional, táctico, técnico, físico, hábitos, estudios, imagen, nutrición).
- [ ] Para nutrición: campo `validado_por` (profesional cualificado) — obligatorio.

### Módulo 6 — Pagos y suscripciones
- [ ] Modelo de precios (individual: $40 mensual, $105 trimestral, $360 anual; clubes desde $150/$500).
- [ ] CRUD de suscripciones/pagos + estados + cupones.
- [ ] Integración pasarela según país (**pendiente decisión**).

### Módulo 7 — Dashboard básico JG
- [ ] KPIs iniciales: atletas activos, nuevos, retención básica, avance de planes.
- [ ] Vista simple (prepara el terreno para analytics completo en Fase 3).

### Módulo 8 — Seguridad, auditoría y pruebas
- [ ] RLS por rol en todas las tablas.
- [ ] `audit_logs` en acciones sensibles.
- [ ] Validaciones server-side + client-side.
- [ ] Pruebas básicas (unitarias de lógica, integración de auth/flujo onboarding).

## Criterios de éxito del MVP (mapeo a sección 25)
- Padre completa onboarding; menor vinculado a tutor. ✅ Módulo 2/3
- Consentimientos versionados. ✅ Módulo 3
- JG registra evaluaciones históricas (Fase 2, pero dejar esquema). ✅ Esquema (assessment_results)
- Atleta ve evolución (Fase 2); JG ve KPIs. ✅ Dashboard básico M7
- Pagos y notificaciones funcionan. ✅ M6 + notificaciones básicas
- Arquitectura escala. ✅ Diseño multi-rol + RLS + eventos

## Definición de "hecho" por módulo
- Código en repo, documentado (comentarios + README de módulo).
- Migración SQL aplicada y RLS verificada.
- Flujo principal probado de punta a punta.
- Sin errores de build (`npm run build`).
- Previews de Netlify desplegados y revisados.

## Riesgos / dependencias
- **Pasarela de pago según país** (bloquea M6 final): decisión pendiente.
- **Revisión legal** de menores/documentos/fotos/datos nutricionales antes de operar en producción.
- **Supabase Auth**: confirmar política de password temporal y flujo de cédula como identificador interno.
- **Netlify + Next.js runtime**: validar configuración de rutas API en el despliegue real.
