-- ============================================================
-- JG IMPULSA — Módulo 2: Auth + Onboarding (ESQUEMA EXPANDIDO FINAL)
-- Refleja el estado real de producción tras aplicar 003_expand_schema.sql
-- (alineación 1:1 + expansión al diseño rico que requiere el frontend).
-- Única fuente de verdad entre repo y base (2026-09-01).
--
-- Estructura final real:
--   users:     id, email, role, created_at, updated_at,
--              nombre, apellido, telefono, rol
--   athletes:  id, user_id, guardian_id, full_name, birth_date, sport, category,
--              created_at, nombre, apellido, fecha_nacimiento, deporte, posicion,
--              categoria, equipo, altura, peso, pais, ciudad, correo, telefono,
--              pierna_mano_dominante, horario_escolar, horario_entrenamiento,
--              objetivo, que_quiere_mejorar, habito_a_cambiar, sueno_deportivo,
--              estado, created_by, updated_at
--   guardians: id, user_id, full_name, phone, relationship, created_at,
--              athlete_id, nombre, relacion, telefono, documento, created_by
--   consents:  id, user_id, terms_accepted, media_release, accepted_at
--   photos:    id, user_id, url, created_at
-- ============================================================

-- ============ EXTENSIONES ============
create extension if not exists "pgcrypto";

-- ============ 1. USERS ============
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role text not null default 'athlete'::text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  nombre text,
  apellido text,
  telefono text,
  rol text not null default 'atleta'
);

alter table public.users enable row level security;

-- Política real: "Usuarios leen su perfil" (SELECT)
create policy "Usuarios leen su perfil" on public.users
  for select using (auth.uid() = id);

-- Política real: "Usuarios actualizan su perfil" (UPDATE)
create policy "Usuarios actualizan su perfil" on public.users
  for update using (auth.uid() = id);

-- Trigger para mantener updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at before update on public.users
  for each row execute function public.handle_updated_at();

-- ============ 2. ATHLETES (esquema rico) ============
create table if not exists public.athletes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  guardian_id uuid,
  full_name text not null,
  birth_date date not null,
  sport text not null,
  category text not null,
  created_at timestamptz not null default now(),
  nombre text,
  apellido text,
  fecha_nacimiento date,
  deporte text,
  posicion text,
  categoria text,
  equipo text,
  altura numeric,
  peso numeric,
  pais text,
  ciudad text,
  correo text,
  telefono text,
  pierna_mano_dominante text,
  horario_escolar text,
  horario_entrenamiento text,
  objetivo text,
  que_quiere_mejorar text,
  habito_a_cambiar text,
  sueno_deportivo text,
  estado text not null default 'activo',
  created_by uuid,
  updated_at timestamptz not null default now()
);

create index if not exists idx_athletes_user_id on public.athletes(user_id);
create index if not exists idx_athletes_nombre on public.athletes(nombre, apellido);

alter table public.athletes enable row level security;

-- Política real: "Atletas leen su data" (SELECT)
create policy "Atletas leen su data" on public.athletes
  for select using (auth.uid() = user_id);

-- Política real: "Atletas insertan su data" (INSERT)
create policy "Atletas insertan su data" on public.athletes
  for insert with check (auth.uid() = user_id);

drop trigger if exists trg_athletes_updated_at on public.athletes;
create trigger trg_athletes_updated_at before update on public.athletes
  for each row execute function public.handle_updated_at();

-- ============ 3. GUARDIANS (tutores) ============
create table if not exists public.guardians (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  full_name text not null,
  phone text not null,
  relationship text not null,
  created_at timestamptz not null default now(),
  athlete_id uuid,
  nombre text,
  relacion text,
  telefono text,
  documento text,
  created_by uuid
);

create index if not exists idx_guardians_athlete on public.guardians(athlete_id);
create index if not exists idx_guardians_user on public.guardians(user_id);

alter table public.guardians enable row level security;

-- Política real: "Tutores leen su data" (SELECT)
create policy "Tutores leen su data" on public.guardians
  for select using (auth.uid() = user_id);

-- Política real: "Tutores insertan su data" (INSERT)
create policy "Tutores insertan su data" on public.guardians
  for insert with check (auth.uid() = user_id);

-- ============ 4. CONSENTS ============
create table if not exists public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  terms_accepted boolean not null default false,
  media_release boolean not null default false,
  accepted_at timestamptz not null default now()
);

alter table public.consents enable row level security;

-- Política real: "Consentimientos propios" (ALL)
create policy "Consentimientos propios" on public.consents
  for all using (auth.uid() = user_id);

-- ============ 5. PHOTOS ============
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  url text not null,
  created_at timestamptz not null default now()
);

alter table public.photos enable row level security;

-- Política real: "Fotos propias" (ALL)
create policy "Fotos propias" on public.photos
  for all using (auth.uid() = user_id);

-- ============ HANDLER: crear perfil en users al registrarse ============
-- Crea automáticamente el row en public.users cuando un usuario se registra en Supabase Auth.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'role', 'athlete'))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ STORAGE BUCKETS ============
insert into storage.buckets (id, name, public)
values ('fotos-atletas', 'fotos-atletas', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('documentos', 'documentos', false)
on conflict (id) do nothing;
