"use client";

import { useEffect, useState } from "react";
import type { AtletaRow } from "@/lib/data/atletas";

type Props = {
  atleta: AtletaRow;
  trigger?: string; // selector CSS del botón que abre la ficha
};

export function FichaAtleta({ atleta, trigger }: Props) {
  const [abierta, setAbierta] = useState(false);

  // Abrir al clickear el trigger (botón "Ver ficha") dentro del mismo componente contenedor.
  useEffect(() => {
    if (!trigger) return;
    const el = document.querySelector<HTMLElement>(trigger);
    if (!el) return;
    const onClick = () => setAbierta(true);
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, [trigger]);

  // Cerrar con Escape y bloquear scroll del fondo cuando está abierta.
  useEffect(() => {
    if (!abierta) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAbierta(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [abierta]);

  if (!abierta) return null;

  const nombre =
    [atleta.nombre, atleta.apellido].filter(Boolean).join(" ") || atleta.full_name || "Atleta";
  const inicial = (nombre[0] ?? "A").toUpperCase();

  const dato = (label: string, value: string | number | null | undefined) =>
    value !== null && value !== undefined && value !== "" ? (
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
        <dd className="mt-0.5 text-sm font-medium text-gray-800">{value}</dd>
      </div>
    ) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40"
      onClick={() => setAbierta(false)}
      role="dialog"
      aria-modal="true"
      aria-label={`Ficha de ${nombre}`}
    >
      <aside
        className="h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
          <h2 className="text-lg font-black text-gray-900">Ficha rápida</h2>
          <button
            onClick={() => setAbierta(false)}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-5">
          {/* Identidad */}
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-xl font-black text-blue-700">
              {inicial}
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{nombre}</p>
              <p className="text-sm text-gray-500">
                {[atleta.deporte, atleta.categoria].filter(Boolean).join(" · ") || "Sin datos"}
              </p>
              <span
                className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                  atleta.estado === "activo"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {atleta.estado || "—"}
              </span>
            </div>
          </div>

          {/* Deporte / posicion / equipo */}
          <section className="mt-6">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
              Datos deportivos
            </h3>
            <dl className="grid grid-cols-2 gap-4">
              {dato("Posición", atleta.posicion)}
              {dato("Equipo", atleta.equipo)}
              {dato("Altura (m)", atleta.altura)}
              {dato("Peso (kg)", atleta.peso)}
              {dato("Pierna/brazo dominante", atleta.pierna_mano_dominante)}
              {dato("País", atleta.pais)}
              {dato("Ciudad", atleta.ciudad)}
            </dl>
          </section>

          {/* Rendimiento / metas */}
          {[atleta.objetivo, atleta.que_quiere_mejorar, atleta.habito_a_cambiar, atleta.sueno_deportivo]
            .some(Boolean) && (
            <section className="mt-6">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                Rendimiento & metas
              </h3>
              <div className="space-y-3 rounded-xl bg-gray-50 p-4">
                {atleta.objetivo && (
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-gray-900">🎯 Objetivo:</span>{" "}
                    {atleta.objetivo}
                  </p>
                )}
                {atleta.que_quiere_mejorar && (
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-gray-900">📈 Quiere mejorar:</span>{" "}
                    {atleta.que_quiere_mejorar}
                  </p>
                )}
                {atleta.habito_a_cambiar && (
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-gray-900">🔄 Hábito a cambiar:</span>{" "}
                    {atleta.habito_a_cambiar}
                  </p>
                )}
                {atleta.sueno_deportivo && (
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-gray-900">🌟 Sueño deportivo:</span>{" "}
                    {atleta.sueno_deportivo}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Tutor */}
          {atleta.tutor_nombre && (
            <section className="mt-6">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                Tutor / responsable
              </h3>
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-sm font-semibold text-gray-900">{atleta.tutor_nombre}</p>
                {atleta.tutor_relacion && (
                  <p className="text-xs text-gray-500">Relación: {atleta.tutor_relacion}</p>
                )}
                {atleta.tutor_telefono && (
                  <p className="mt-1 text-sm text-gray-600">📞 {atleta.tutor_telefono}</p>
                )}
              </div>
            </section>
          )}

          {/* Fotos */}
          <section className="mt-6">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
              Fotos ({atleta.fotos.length})
            </h3>
            {atleta.fotos.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {atleta.fotos.map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={url}
                    alt={`Foto ${i + 1} de ${nombre}`}
                    className="h-24 w-full rounded-lg object-cover"
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Sin fotos asociadas.</p>
            )}
          </section>

          {/* Contacto */}
          {(atleta.correo || atleta.telefono) && (
            <section className="mt-6">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                Contacto
              </h3>
              <dl>
                {dato("Email", atleta.correo)}
                {dato("Teléfono", atleta.telefono)}
              </dl>
            </section>
          )}
        </div>
      </aside>
    </div>
  );
}
