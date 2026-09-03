-- 006_lead_plan.sql
-- Añade la columna 'plan' a public.leads para registrar el plan de interés elegido
-- explícitamente por el prospecto en el formulario de la landing (ej. "Mensual $40/mes",
-- "Trimestral $105", "Anual $360/año", "Club/Equipo", "Aún no lo sé").
--
-- Ejecutar en el SQL Editor de Supabase (solo el agente no tiene vía DDL; DML por
-- PostgREST no puede crear columnas).

alter table public.leads
  add column if not exists plan text;

-- (Opcional pero recomendado) índice para filtrar/ordenar por plan en la bandeja.
create index if not exists leads_plan_idx on public.leads (plan);
