# JG IMPULSA — Arquitectura (MVP Fase 1)

> Entregable según sección 24 del Documento Maestro. Documento vivo: se actualiza a medida que se toman decisiones.

## 1. Visión global de la arquitectura

Plataforma web **PWA responsive-first** (sección 20). Modelo cliente-servidor con API modular, base transaccional PostgreSQL (Supabase), almacenamiento de objetos (Supabase Storage, S3-compatible) y despliegue en Netlify.

Pila propuesta (alineada a la sección 20):
- **Frontend:** React 18 + Next.js 14 (App Router) + TypeScript
- **Backend:** Next.js API Routes / Route Handlers (evita levantar un backend separado en el MVP)
- **BD:** PostgreSQL (Supabase) + **Supabase Auth** (proveedor de autenticación seguro) + **RLS** (Row Level Security) para RBAC
- **Storage:** Supabase Storage (S3-compatible)
- **Pagos:** pasarela según país (decisión pendiente — ver sección 8)
- **Despliegue:** Netlify (build desde repo, host de la PWA y funciones serverless)

> **Nota de decisión:** para el MVP se usa un solo monolito Next.js (frontend + API). Un backend separado (NestJS/FastAPI) se introduce en Fase 2 si la lógica de datos/IA lo justifica. Marcar en la sección 8.

## 2. Principios rectores (derivados del documento)

1. **El atleta es el centro**: todas las entidades y flujos giran alrededor del atleta y su evolución.
2. **Datos estructurados desde el día 1**: cada interacción relevante genera eventos (sección 21).
3. **Trazabilidad total**: auditoría, versionado de históricos, consentimientos y pesos del score. Nunca sobrescribir históricos.
4. **Privacidad y mínimo privilegio**: RBAC + RLS + cifrado en tránsito/en reposo + protección especial de menores.
5. **IA asistente, nunca sustituto**: solo datos autorizados, revisión humana cuando corresponde, auditoría (secciones 10 y 11).
6. **Escalabilidad**: diseñado para pasar de pocos atletas a cientos/miles.

## 3. Contexto de actores/roless

| Rol | Alcance |
|-----|---------|
| JG / Admin | Control total: atletas, evaluaciones, planes, pagos, métricas, IA, configuración |
| Atleta | Perfil, tareas, progreso, sesiones, mensajes, contenido permitido |
| Tutor | Autorización, datos y visualización permitida (menores) |
| Club | Contratación, acceso limitado a datos autorizados (Fase 4 portal) |
| Profesionales | Nutrición / prep. física / otras áreas con permisos limitados (fases posteriores) |

> RBAC en Supabase se implementa con **Roles personalizados** (JWT claims via app_metadata) + **RLS por tabla**.

## 4. Mapa de pantallas (MVP Fase 1)

**Público**
- `/` Landing pública (logo, "EL ATLETA ES EL CENTRO", misión/visión/valores, pilares MET, cómo funciona, planes, servicios clubes, testimonios, CTAs)
- `/contacto` Formulario de contacto

**Auth**
- `/login` Inicio de sesión (password temporal + recuperación)
- `/registro/atleta` Onboarding atleta (datos + fotos hasta 3)
- `/registro/tutor` Onboarding tutor + firma + consentimientos
- `/recuperar` Recuperación de contraseña

**App (privado)**
- `/dashboard` Dashboard básico JG (KPIs iniciales)
- `/atletas` Listado de atletas
- `/atletas/[id]` Detalle atleta + Player Card
- `/planes` Planes personalizados (CRUD básico)
- `/planes/[id]` Detalle del plan
- `/pagos` Gestión de pagos/suscripciones
- `/ajustes` Configuración / preferencias

## 5. Modelo de despliegue

- **Netlify Build & Deploy** desde el repo (GitHub). CI lanza build de Next.js y sube el estático + funciones serverless.
- Variables de entorno en Netlify para `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (solo server-side), etc.
- **Branching:** `main` = producción; previews por PR.
- **PWA:** manifest + service worker (Next.js `next-pwa`) en Fase 1 para instalabilidad básica.

## 6. Seguridad (resumen MVP)

- Cifrado en tránsito (HTTPS, por defecto en Netlify) y en reposo (Supabase).
- **Contraseñas:** nunca cédula en texto plano. Password temporal con hash seguro (bcrypt, manejado por Supabase Auth). Cédula = identificador/verificación interna opcional (sección 5).
- RLS activada por defecto en todas las tablas; políticas por rol.
- Consentimientos **versionados** (tabla con versión + estado).
- Fotos: validación de formato/tamaño, privacidad, máx. 3.
- Auditoría: tabla `audit_logs` registra acciones sensibles.
- **Revisión legal pendiente** (menores, documentos, fotos, datos físicos/nutricionales) antes de operar — decisión pendiente, sección 8.

## 7. Stack y decisiones técnicas pendientes

- Pasarela de pago según país (Pendiente — sección 8).
- Revisión legal de normativa aplicable (Pendiente — sección 8).
- Estructura de datos: ver `SCHEMA.md` (esquema Supabase).
- Eventos/diccionario de datos: ver `DATA_DICTIONARY.md` y `EVENTS.md` (Fase 1 prepara la base).
