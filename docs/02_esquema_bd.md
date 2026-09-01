# JG IMPULSA — Esquema de Base de Datos (Supabase / PostgreSQL)

> Entregable según sección 24. Orientado a datos transaccionales; RLS activada por defecto.
> Convenciones: `created_at`, `updated_at` timestamptz; `created_by` uuid; `estado` texto con enum; IDs uuid.

## Convenciones generales
- Todas las tablas tienen `id uuid primary key default gen_random_uuid()`.
- Timestamps: `created_at timestamptz default now()`, `updated_at timestamptz default now()`.
- `created_by uuid references auth.users(id)` para trazabilidad.
- No se borran históricos: se versionan o se marca `estado` (ej. `activo`/`inactivo`/`archivado`).
- RLS habilitado en todas las tablas; políticas según rol (JG, atleta, tutor, club, profesional).

## auth.users (provisto por Supabase Auth)
Manejado por Supabase. Se referencia desde `profiles`/`users` propios vía `id`.

## 1. users (perfil ampliado del usuario)
- `id uuid pk references auth.users(id)`
- `rol text` — 'admin' | 'atleta' | 'tutor' | 'club' | 'profesional'
- `nombre`, `apellido`, `email`, `telefono`
- `activo boolean default true`
- `created_at`, `updated_at`, `created_by`

## 2. athletes (atletas)
- `id uuid pk`
- `user_id uuid references users(id)` (cuando el atleta tiene login)
- `nombre`, `apellido`, `fecha_nacimiento date` (edad = cálculo automático en app)
- `deporte`, `posicion`, `categoria`, `equipo`
- `altura numeric`, `peso numeric`
- `pais`, `ciudad`
- `correo`, `telefono`
- `pierna_mano_dominante text`
- `horario_escolar text`, `horario_entrenamiento text`
- `objetivo text`, `que_quiere_mejorar text`, `habito_a_cambiar text`, `sueno_deportivo text`
- `carnet_identidad text null` — SOLO identificador interno/verificación, nunca contraseña
- `estado text default 'activo'`
- timestamps + `created_by`

## 3. guardians (tutores — menores)
- `id uuid pk`
- `user_id uuid references users(id)` (login opcional del tutor)
- `athlete_id uuid references athletes(id)`
- `nombre`, `relacion text`, `correo`, `telefono`
- `documento text null`
- `firma text` (referencia a documento/imagen de firma)
- `consentimiento_activo boolean default false`
- timestamps + `created_by`

## 4. consents (consentimientos — versionados)
- `id uuid pk`
- `athlete_id uuid references athletes(id)`
- `guardian_id uuid references guardians(id) null`
- `tipo text` — ej. 'menor', 'fotos', 'datos', 'comunicacion'
- `version int not null`
- `contenido text` (texto/plantilla firmada)
- `estado text` — 'pendiente' | 'aceptado' | 'revocado'
- `firmado_por text`, `fecha_firma timestamptz`
- `documento_id uuid references documents(id) null` (PDF firmado)
- timestamps + `created_by`
- **Único(athlete_id, tipo, version)** para versionado sin borrar histórico.

## 5. clubs
- `id uuid pk`, `nombre`, `pais`, `ciudad`, `contacto`, `email`, `telefono`
- `estado text default 'activo'`
- timestamps + `created_by`

## 6. teams (equipos)
- `id uuid pk`, `club_id uuid references clubs(id) null`, `nombre`, `categoria`
- timestamps + `created_by`

## 7. sports / positions (catálogos)
- `id uuid pk`, `nombre`, `descripcion`, `activo boolean default true`
- timestamps

## 8. plans (planes personalizados — genérico)
- `id uuid pk`
- `athlete_id uuid references athletes(id)`
- `tipo text` — 'mental' | 'emocional' | 'tactico' | 'tecnico' | 'fisico' | 'habitos' | 'estudios' | 'imagen' | 'nutricion'
- `titulo`, `objetivo text`
- `frecuencia text`, `fecha_inicio date`, `fecha_fin date null`
- `estado text` — 'activo' | 'completado' | 'cancelado'
- `versiones` (histórico vía `plan_versions` o JSONB, decisión en Fase 1: tabla separada)
- `nutricion_validada_por uuid references users(id) null` — solo para tipo nutrición, profesional cualificado
- timestamps + `created_by`

## 9. plan_tasks (tareas dentro de un plan)
- `id uuid pk`, `plan_id uuid references plans(id)`
- `titulo`, `descripcion`, `fecha date`, `estado` — 'pendiente' | 'completada' | 'omitida'
- `evidencia text null` (referencia a documento/photo)
- `resultado text null`
- timestamps + `created_by`

## 10. subscriptions (suscripciones)
- `id uuid pk`
- `athlete_id uuid references athletes(id)` o `club_id uuid references clubs(id)`
- `plan_comercial text` — 'mensual' | 'trimestral' | 'anual'
- `monto numeric`, `moneda text default 'USD'`
- `fecha_inicio timestamptz`, `fecha_renovacion timestamptz null`
- `estado` — 'activa' | 'cancelada' | 'expirada' | 'pendiente'
- `cupon text null`
- timestamps + `created_by`

## 11. payments (pagos)
- `id uuid pk`
- `subscription_id uuid references subscriptions(id) null`
- `athlete_id uuid references athletes(id) null`
- `monto numeric`, `moneda text`
- `metodo text`, `referencia_pasarela text null`
- `estado` — 'pendiente' | 'completado' | 'rechazado' | 'reembolsado'
- `fecha_pago timestamptz`
- timestamps + `created_by`

## 12. documents (documentos / fotos)
- `id uuid pk`
- `owner_type text`, `owner_id uuid` (polimórfico: athlete/guardian/consent)
- `tipo text` — 'foto_cuerpo' | 'foto_carnet' | 'foto_uniforme' | 'firma' | 'consentimiento_pdf' | 'documento_identidad'
- `storage_path text` (ruta en Supabase Storage)
- `mime_type text`, `tamano_bytes bigint`, `nombre_original text`
- `privado boolean default true`
- timestamps + `created_by`
- Nota: separar documentos de identidad cuando sea posible (sección 19).

## 13. photos (fotos de atleta — máx. 3)
- `id uuid pk`, `athlete_id uuid references athletes(id)`
- `tipo text` — 'cuerpo_completo' | 'carnet' | 'uniforme_accion'
- `storage_path text`, `mime_type`, `tamano_bytes`
- `orden int`, `activo boolean default true`
- timestamps + `created_by`
- **Restricción:** máx. 3 fotos activas por atleta (validación en app + trigger opcional).

## 14. sessions (sesiones de acompañamiento)
- `id uuid pk`
- `athlete_id uuid references athletes(id)`
- `fecha timestamptz`, `tipo text`, `duracion_min int null`
- `notas text null`
- `estado` — 'programada' | 'completada' | 'cancelada'
- timestamps + `created_by`

## 15. assessments (plantillas de evaluación) + assessment_results
### assessments
- `id uuid pk`, `nombre`, `categoria` — 'fisico' | 'tecnico' | 'tactico' | 'mental_emocional'
- `tipo` — 'rubrica' | 'autopercepcion' | 'prueba'
- `protocolo_version int default 1`, `contenido jsonb` (preguntas/rúbrica)
- `activo boolean default true`
- timestamps + `created_by`

### assessment_results
- `id uuid pk`
- `athlete_id uuid references athletes(id)`
- `assessment_id uuid references assessments(id)`
- `evaluador_id uuid references users(id)`
- `fecha timestamptz`
- `prueba text`, `unidad text null`, `resultado numeric null`, `resultado_json jsonb null`
- `condiciones text`, `observaciones text`
- `protocolo_version int` (copiar versión usada)
- timestamps + `created_by`
- **Histórico:** nunca se sobrescribe; se compara por fecha (semana/mes/trimestre/año).
- **Nota:** nunca etiquetar como diagnóstico clínico (sección 7).

## 16. goals (objetivos)
- `id uuid pk`, `athlete_id uuid references athletes(id)`
- `titulo`, `descripcion`, `tipo` — 'mental' | 'emocional' | 'tactico' | 'tecnico' | 'fisico' | 'habitos'
- `fecha_inicio date`, `fecha_objetivo date`, `estado`
- timestamps + `created_by`

## 17. habits (hábitos)
- `id uuid pk`, `athlete_id uuid references athletes(id)`
- `nombre`, `meta text`, `frecuencia`, `estado`
- timestamps + `created_by`

## 18. check_ins
- `id uuid pk`, `athlete_id uuid references athletes(id)`
- `fecha date`
- `estado_animo int`, `confianza int`, `energia int`, `sueno int`, `estres_percibido int`
- `cumplimiento int null`, `comentario text null`
- timestamps + `created_by`
- Escalas simples y consistentes (validación 1-5 p.ej.). Datos sensibles: RLS estricta.

## 19. messages (mensajería interna)
- `id uuid pk`
- `conversation_id uuid references conversations(id)` (tabla de conversaciones)
- `sender_id uuid references users(id)`
- `tipo text` — 'texto' | 'archivo'
- `contenido text`, `archivo_id uuid references documents(id) null`
- `leido boolean default false`, `created_at`
- Reglas de comunicación para menores (visibilidad tutor) en app.

## 20. notifications
- `id uuid pk`, `user_id uuid references users(id)`
- `tipo text` (sesion, tarea, checkin, mensaje, pago, felicitacion, alerta)
- `titulo`, `contenido`, `leido boolean default false`
- `canal text` — 'inapp' | 'email' | 'push' (MVP: inapp)
- `programada_para timestamptz null`, `created_at`

## 21. content / social_links
- `content`: `id`, `titulo`, `tipo` (video/articulo/reel), `url`, `plataforma`, `views`, `engagement jsonb null`
- `social_links`: `id`, `atleta/usuario`, `plataforma`, `url`, `autorizado boolean`

## 22. nutrition_plans / mental_plans / tactical_plans / physical_plans
- En MVP pueden ser un caso particular de `plans` con `tipo` (+ campos específicos en JSONB).
- **NutritionPlans:** `validado_por uuid references users(id)` (profesional cualificado) — obligatorio, sección 12.
- Decisión: tabla `plans` genérica + JSONB tipado para Fase 1; tablas dedicadas si Fase 2 lo exige.

## 23. events (eventos de acompañamiento / actividades)
- `id uuid pk`, `athlete_id uuid references athletes(id)`
- `titulo`, `fecha`, `tipo`, `estado`, `descripcion`
- timestamps + `created_by`

## 24. score_evolution (weights del score — versionado)
- `id uuid pk`
- `version int not null` — única activa por defecto
- `pesos jsonb` — ej. `{"mental":0.20,"emocional":0.15,"tactico":0.20,"tecnico":0.20,"fisico":0.15,"habitos":0.10}`
- `activo boolean default false`, `created_at`, `created_by`
- El score es **configurable y no absoluto** (sección 10); siempre mostrar componentes individuales.

## 25. audit_logs
- `id uuid pk`
- `user_id uuid references users(id) null`
- `accion text`, `entidad text`, `entidad_id uuid null`
- `detalle jsonb null`, `ip text null`
- `created_at`
- RLS: solo admin/JG puede leer.

## 26. event_log (pipeline de datos — sección 21)
- `id bigserial`
- `event_name text` — ej. athlete_registered, consent_signed, payment_completed, ...
- `athlete_id uuid null`, `user_id uuid null`
- `payload jsonb`, `occurred_at timestamptz default now()`
- Se alimenta desde la API en cada acción relevante (Fase 1: eventos básicos: registro, consentimiento, pago, plan creado).

## Orden sugerido de creación (dependencias)
1. auth.users (Supabase) → 2. users → 3. sports/positions → 4. clubs/teams → 5. athletes → 6. guardians + consents + documents + photos → 7. plans + plan_tasks → 8. subscriptions + payments → 9. sessions → 10. assessments + assessment_results → 11. goals/habits/check_ins → 12. messages/notifications → 13. content/social → 14. score_evolution → 15. audit_logs + event_log.

## Notas de implementación Supabase
- Generar script SQL (`supabase/migrations`) para crear todo.
- Activar RLS y políticas por rol en cada tabla (no confiar solo en la app).
- Storage buckets: `fotos-atletas` (privado), `documentos` (privado), `publico` (landing/contenido).
- Índices en claves foráneas y en `athlete_id`/`fecha` para queries de evolución.

## Decisiones pendientes
- Tablas dedicadas vs. plans genérico (nutrition/mental/tactical/physical) — pendiente confirmar.
- Formato de documentos de identidad (separados, cifrados) — pendiente revisión legal.
- Escalas exactas de check-in (1-5 vs 1-10) — pendiente decisión de producto.
