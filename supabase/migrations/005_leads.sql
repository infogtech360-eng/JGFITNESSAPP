-- 005_leads.sql — Tabla de contactos/leads de la landing ("Hablemos de tu atleta")
-- Pega y ejecuta este archivo en el SQL Editor de Supabase.
-- El form de contacto de la landing persiste aquí vía app/api/contacto/route.ts (service-role).

create table if not exists public.leads (
  id          bigint generated always as identity primary key,
  nombre      text,
  email       text not null,
  telefono    text,
  interes     text,
  mensaje     text,
  created_at  timestamptz not null default now()
);

-- RLS: el insert lo hace el service-role (bypass). Lectura solo para staff via service-role.
alter table public.leads enable row level security;

-- Los leads son datos entrantes públicos del formulario: se insertan por service-role.
-- Bloqueamos select/update/delete por anon/authenticated (solo lectura administrativa con service-role).
create policy "leads_insert_pub" on public.leads
  for insert to anon, authenticated
  with check (true);

-- Grants PostgREST
grant select, insert, update, delete on public.leads to authenticated, service_role;
grant all on public.leads to service_role;
grant usage on sequence public.leads_id_seq to authenticated, service_role;
