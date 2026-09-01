-- ============================================================
-- JG IMPULSA — Módulo 2: Auth + Onboarding
-- Migración inicial: users, athletes, guardians, consents, photos
-- Basado en docs/02_esquema_bd.md (secciones 1,2,3,4,13)
-- RLS habilitado en todas las tablas.
-- ============================================================

-- ============ EXTENSIONES ============
create extension if not exists "pgcrypto";

-- ============ 1. USERS ============
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  rol text not null default 'atleta'
    check (rol in ('admin','atleta','tutor','club','profesional')),
  nombre text,
  apellido text,
  email text,
  telefono text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

alter table public.users enable row level security;

-- Un usuario solo ve su propio perfil
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

-- Un usuario edita su propio perfil
create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- Admin gestiona todos
create policy "users_admin_all" on public.users
  for all using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.rol = 'admin'
    )
  );

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger trg_users_updated_at before update on public.users
  for each row execute function public.handle_updated_at();

-- ============ 2. ATHLETES ============
create table if not exists public.athletes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  nombre text not null,
  apellido text not null,
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
  -- Solo identificador interno de verificación; NUNCA contraseña
  carnet_identidad text,
  estado text not null default 'activo' check (estado in ('activo','inactivo','archivado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create index if not exists idx_athletes_user_id on public.athletes(user_id);
create index if not exists idx_athletes_nombre on public.athletes(nombre, apellido);

alter table public.athletes enable row level security;

-- Atleta ve su propio registro
create policy "athletes_select_own" on public.athletes
  for select using (auth.uid() = user_id);

-- Atleta edita su propio registro
create policy "athletes_update_own" on public.athletes
  for update using (auth.uid() = user_id);

-- Admin y tutor autorizado gestionan
create policy "athletes_staff_all" on public.athletes
  for all using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.rol in ('admin')
    )
  );

-- Insert habilitado para el propio usuario y para admin
create policy "athletes_insert" on public.athletes
  for insert with check (
    auth.uid() = user_id or
    exists (select 1 from public.users u where u.id = auth.uid() and u.rol = 'admin')
  );

create trigger trg_athletes_updated_at before update on public.athletes
  for each row execute function public.handle_updated_at();

-- ============ 3. GUARDIANS (tutores / menores) ============
create table if not exists public.guardians (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  nombre text not null,
  relacion text not null,
  correo text,
  telefono text,
  documento text,
  firma text,
  consentimiento_activo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create index if not exists idx_guardians_athlete on public.guardians(athlete_id);
create index if not exists idx_guardians_user on public.guardians(user_id);

alter table public.guardians enable row level security;

create policy "guardians_select_related" on public.guardians
  for select using (
    auth.uid() = user_id or
    auth.uid() = created_by or
    exists (select 1 from public.athletes a where a.id = athlete_id and a.user_id = auth.uid()) or
    exists (select 1 from public.users u where u.id = auth.uid() and u.rol = 'admin')
  );

create policy "guardians_insert" on public.guardians
  for insert with check (
    auth.uid() = user_id or auth.uid() = created_by or
    exists (select 1 from public.users u where u.id = auth.uid() and u.rol = 'admin')
  );

create policy "guardians_update_related" on public.guardians
  for update using (
    auth.uid() = user_id or
    exists (select 1 from public.users u where u.id = auth.uid() and u.rol = 'admin')
  );

create trigger trg_guardians_updated_at before update on public.guardians
  for each row execute function public.handle_updated_at();

-- ============ 4. CONSENTS (consentimientos versionados) ============
create table if not exists public.consents (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  guardian_id uuid references public.guardians(id) on delete set null,
  tipo text not null check (tipo in ('menor','fotos','datos','comunicacion','otros')),
  version int not null default 1,
  contenido text,
  estado text not null default 'pendiente' check (estado in ('pendiente','aceptado','revocado')),
  firmado_por text,
  fecha_firma timestamptz,
  documento_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  -- versionado sin borrar histórico
  unique (athlete_id, tipo, version)
);

create index if not exists idx_consents_athlete on public.consents(athlete_id);

alter table public.consents enable row level security;

create policy "consents_select_related" on public.consents
  for select using (
    exists (select 1 from public.athletes a where a.id = athlete_id and a.user_id = auth.uid()) or
    exists (select 1 from public.guardians g where g.id = guardian_id and g.user_id = auth.uid()) or
    exists (select 1 from public.users u where u.id = auth.uid() and u.rol = 'admin')
  );

create policy "consents_insert" on public.consents
  for insert with check (
    exists (select 1 from public.users u where u.id = auth.uid() and u.rol = 'admin')
  );

create trigger trg_consents_updated_at before update on public.consents
  for each row execute function public.handle_updated_at();

-- ============ 5. PHOTOS (máx. 3 por atleta) ============
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  tipo text not null check (tipo in ('cuerpo_completo','carnet','uniforme_accion')),
  storage_path text not null,
  mime_type text,
  tamano_bytes bigint,
  orden int default 0,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create index if not exists idx_photos_athlete on public.photos(athlete_id);

alter table public.photos enable row level security;

-- Restricción de máximo 3 fotos activas por atleta
create or replace function public.enforce_max_photos()
returns trigger language plpgsql as $$
declare
  cnt int;
begin
  select count(*) into cnt from public.photos
  where athlete_id = new.athlete_id and activo = true;
  if cnt >= 3 then
    raise exception 'Límite de 3 fotos activas por atleta alcanzado';
  end if;
  return new;
end $$;

create trigger trg_photos_max before insert on public.photos
  for each row execute function public.enforce_max_photos();

create policy "photos_select_related" on public.photos
  for select using (
    exists (select 1 from public.athletes a where a.id = athlete_id and a.user_id = auth.uid()) or
    exists (select 1 from public.guardians g where g.athlete_id = athlete_id and g.user_id = auth.uid()) or
    exists (select 1 from public.users u where u.id = auth.uid() and u.rol = 'admin')
  );

create policy "photos_insert" on public.photos
  for insert with check (
    exists (select 1 from public.athletes a where a.id = athlete_id and a.user_id = auth.uid()) or
    exists (select 1 from public.users u where u.id = auth.uid() and u.rol = 'admin')
  );

-- ============ HANDLER: crear perfil en users al registrarse ============
-- Crea automáticamente el row en public.users cuando un usuario se registra en Supabase Auth
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, nombre, apellido, rol)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nombre', null),
    coalesce(new.raw_user_meta_data->>'apellido', null),
    coalesce(new.raw_user_meta_data->>'rol', 'atleta')
  )
  on conflict (id) do nothing;
  return new;
end $$;

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

-- Nota: las políticas de storage se configuran según el bucket y el rol.
-- Por defecto se protegen (privados). Ajustar según flujo de subida.
