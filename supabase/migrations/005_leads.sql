-- 005_leads.sql — REPARACIÓN de permisos para la tabla public.leads (landing "Hablemos de tu atleta")
-- Pega y ejecuta este archivo en el SQL Editor de Supabase y ejecútalo (Run).
-- ------------------------------------------------------------------------------------------------
-- CONTEXTO / CAUSA RAÍZ VERIFICADA (2026-09-02, INSERT directo contra producción):
--   /api/contacto devolvía "No se pudo guardar tu mensaje" por:
--   HTTP 403 · code 42501 · "permission denied for table leads"
--   hint: "Grant the required privileges to the current role with:
--          GRANT SELECT, INSERT ON public.leads TO service_role;"
--   La tabla leads YA EXISTE en producción (con id uuid y columna extra "estado"), pero NO tiene
--   los GRANTs de PostgREST para service_role/anon. El código de la ruta ya usa service-role y los
--   campos mapean exacto (nombre, email, telefono, interes, mensaje); cambiar código NO arregla el 403.
--   Este script aplica los permisos que faltan (idempotente).
-- ------------------------------------------------------------------------------------------------

-- 1) Asegurar que la tabla exista (si por alguna razón no existe, la crea con estructura compatible;
--    si ya existe con otra estructura, este bloque NO la altera).
create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  nombre      text,
  email       text not null,
  telefono    text,
  interes     text,
  mensaje     text,
  estado      text not null default 'nuevo',
  created_at  timestamptz not null default now()
);

-- 2) Habilitar RLS (idempotente).
alter table public.leads enable row level security;

-- 3) Aplicar los GRANTs que faltan (CAUSA RAÍZ del 42501) — PostgREST necesita estos para operar.
--    El INSERT del formulario lo ejecuta el service-role (app/api/contacto → createServiceClient).
grant select, insert, update, delete on table public.leads to service_role;
grant all on table public.leads to service_role;
grant select, insert, update, delete on table public.leads to authenticated;
grant insert on table public.leads to anon;

-- 4) Políticas RLS: permitir insert público (queda registrado el autor del lead) y blindar el resto.
--    (Si ya existen políticas con estos nombres, DO $$ $$ las elimina antes para evitar duplicados.)
drop policy if exists "leads_insert_pub" on public.leads;
create policy "leads_insert_pub" on public.leads
  for insert to anon, authenticated
  with check (true);

-- 5) Grants sobre uso (si aplica con secuencia; no aplica a uuid, se deja por compatibilidad).
grant usage on schema public to anon, authenticated, service_role;
