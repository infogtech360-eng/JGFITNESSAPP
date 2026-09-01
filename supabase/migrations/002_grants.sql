-- ============================================================
-- JG IMPULSA — Módulo 2 (fix permisos)
-- Concede SELECT/INSERT/UPDATE a los roles de la API (anon, authenticated,
-- service_role) sobre las tablas del esquema public.
-- RLS ya está activo; esto habilita el acceso de red desde PostgREST.
-- Ejecutar en el SQL Editor del panel de Supabase.
-- ============================================================

-- Habilitar uso del esquema public
grant usage on schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;

-- ============ USERS ============
grant select, insert, update on table public.users to anon, authenticated;
grant all on table public.users to service_role;

-- ============ ATHLETES ============
grant select, insert, update on table public.athletes to anon, authenticated;
grant all on table public.athletes to service_role;

-- ============ GUARDIANS ============
grant select, insert, update on table public.guardians to anon, authenticated;
grant all on table public.guardians to service_role;

-- ============ CONSENTS ============
grant select, insert, update on table public.consents to anon, authenticated;
grant all on table public.consents to service_role;

-- ============ PHOTOS ============
grant select, insert, update on table public.photos to anon, authenticated;
grant all on table public.photos to service_role;

-- ============ STORAGE BUCKETS (lectura pública de fotos-atletas) ============
-- Los buckets están configurados como privados (public=false) en la migración.
-- Si quieres que las fotos se lean sin sesión, cambia public=true en el bucket
-- o crea políticas de storage. Por defecto dejamos privado (seguro).
