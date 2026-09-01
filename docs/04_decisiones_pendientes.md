# JG IMPULSA — Decisiones pendientes

> Según sección 24: marcar decisiones pendientes y no inventar legislación, integraciones o requisitos.

## Bloqueantes de negocio/legal
- [ ] **Pasarela de pago** según país de operación (afecta Módulo 6 final).
- [ ] **Revisión legal** de normativa aplicable: menores, documentos de identidad, fotos, datos físicos/nutricionales, retención/eliminación (sección 19).

## Decisiones de producto
- [ ] Escalas exactas de check-in (1-5 vs 1-10) y de evaluación.
- [ ] Tablas dedicadas vs. `plans` genérico para nutrition/mental/tactical/physical.
- [ ] Formato y almacenamiento de la **firma** del tutor (imagen vs. PDF firmado).
- [ ] Atributos exactos de la Player Card y cuándo se desbloquean.

## Decisiones técnicas
- [ ] Monolito Next.js (MVP) vs. backend separado desde el inicio.
- [ ] Cédula como identificador interno de verificación (diseño de Supabase Auth).
- [ ] Estrategia exacta de notificaciones (in-app primero; push/email después).
- [ ] Versionado de planes: tabla separada vs. JSONB.

## No inventado (a confirmar con el cliente/JG)
- No asumo legislación específica de ningún país; requiere revisión legal real.
- No asumo credenciales/permisos de integraciones de redes (Instagram/YouTube) — usar API oficial con autorización, nunca contraseñas.
- No defino pasarela de pago concreta ni terceros sin autorización de gasto.
