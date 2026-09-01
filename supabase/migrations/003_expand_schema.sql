-- ============================================================
-- JG IMPULSA — Módulo 2: Expansión de esquema (Opción B: diseño rico)
-- Alinea la base de producción con el modelo de datos que el frontend
-- (lib/actions/onboarding.ts + OnboardingAthleteForm.tsx) requiere.
-- AÑADE columnas faltantes SIN destruir las existentes.
-- Ejecutar en el SQL Editor de Supabase.
-- ============================================================

-- ============ ATHLETES: ampliar al modelo rico ============
-- Columnas que ya existen: id, user_id, guardian_id, full_name, birth_date,
-- sport, category, created_at
-- Añadir las que el code espera (nombre/apellido separados + datos físicos/deporte):

alter table public.athletes
  add column if not exists nombre text,
  add column if not exists apellido text,
  add column if not exists deporte text,
  add column if not exists posicion text,
  add column if not exists categoria text,
  add column if not exists equipo text,
  add column if not exists altura numeric,
  add column if not exists peso numeric,
  add column if not exists pais text,
  add column if not exists ciudad text,
  add column if not exists correo text,
  add column if not exists telefono text,
  add column if not exists fecha_nacimiento date,
  add column if not exists pierna_mano_dominante text,
  add column if not exists horario_escolar text,
  add column if not exists horario_entrenamiento text,
  add column if not exists objetivo text,
  add column if not exists que_quiere_mejorar text,
  add column if not exists habito_a_cambiar text,
  add column if not exists sueno_deportivo text,
  add column if not exists estado text not null default 'activo',
  add column if not exists created_by uuid,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_athletes_user_id on public.athletes(user_id);

-- ============ GUARDIANS: añadir vínculo a atleta + datos ============
-- Existen: id, user_id, full_name, phone, relationship, created_at
alter table public.guardians
  add column if not exists athlete_id uuid,
  add column if not exists nombre text,
  add column if not exists relacion text,
  add column if not exists telefono text,
  add column if not exists documento text,
  add column if not exists created_by uuid;

create index if not exists idx_guardians_athlete on public.guardians(athlete_id);

-- ============ USERS: nombre/apellido/telefono/rol ============
-- Existen: id, email, role, created_at, updated_at
alter table public.users
  add column if not exists nombre text,
  add column if not exists apellido text,
  add column if not exists telefono text,
  add column if not exists rol text not null default 'atleta';

-- ============ (Opcional) actualizar updated_at en athletes ============
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_athletes_updated_at on public.athletes;
create trigger trg_athletes_updated_at before update on public.athletes
  for each row execute function public.handle_updated_at();
