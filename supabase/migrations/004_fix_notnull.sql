-- ============================================================
-- JG IMPULSA — Módulo 2: Fix NOT NULL para flujo de onboarding real
-- El frontend (lib/actions/onboarding.ts) inserta usando columnas ricas
-- (nombre, apellido, fecha_nacimiento, deporte, ...) y NO llena las
-- columnas de la estructura plana heredada (full_name, birth_date,
-- sport, category). Para que el INSERT del onboarding funcione, esas
-- columnas planas deben admitir NULL.
-- Ejecutar en el SQL Editor de Supabase.
-- ============================================================

-- ============ ATHLETES: relajar NOT NULL planos ============
alter table public.athletes
  alter column full_name drop not null,
  alter column birth_date drop not null,
  alter column sport drop not null,
  alter column category drop not null;

-- ============ GUARDIANS: relajar NOT NULL planos ============
alter table public.guardians
  alter column full_name drop not null,
  alter column phone drop not null,
  alter column relationship drop not null;
