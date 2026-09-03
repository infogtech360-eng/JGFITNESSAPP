"use client";

import { useState } from "react";
import type { LeadRow } from "@/lib/data/leads";

// Bandeja de prospectos (public.leads) para el panel admin.
// Muestra nombre, contacto, interés y mensaje; permite filtrar por estado y
// expandir cada mensaje. El estado actual se muestra de forma informativa
// (cambios de estado a futuro requieren UPDATE; aquí el service-role solo lee).
type Props = {
  leads: LeadRow[];
  total: number;
};

const badge: Record<string, string> = {
  nuevo: "bg-blue-100 text-blue-700",
  contactado: "bg-amber-100 text-amber-700",
  cerrado: "bg-green-100 text-green-700",
};

export function BandejaLeadsClient({ leads, total }: Props) {
  const [filtro, setFiltro] = useState("todos");
  const [expandido, setExpandido] = useState<string | null>(null);

  const visibles =
    filtro === "todos" ? leads : leads.filter((l) => (l.estado || "nuevo") === filtro);

  const fecha = (iso: string | null) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString("es", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <div>
      {/* Filtro por estado */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600">Estado:</label>
            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-600"
            >
              <option value="todos">Todos</option>
              <option value="nuevo">Nuevos</option>
              <option value="contactado">Contactados</option>
              <option value="cerrado">Cerrados</option>
            </select>
          </div>
          <p className="text-xs font-medium text-gray-400">
            {visibles.length} de {total} prospecto{total === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {/* Lista de leads */}
      {visibles.length === 0 ? (
        <div className="mt-10 text-center text-sm text-gray-400">
          No hay prospectos con este estado.
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {visibles.map((l) => {
            const estado = l.estado || "nuevo";
            const abierto = expandido === l.id;
            return (
              <div
                key={l.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-gray-900">{l.nombre || "Sin nombre"}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                          badge[estado] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {estado}
                      </span>
                    </div>
                    <p className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-gray-500">
                      {l.email && <span>✉️ {l.email}</span>}
                      {l.telefono && <span>📞 {l.telefono}</span>}
                    </p>
                    {/* Plan elegido — destacado para gestión/respuesta */}
                    {l.plan && (
                      <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1">
                        <span className="text-xs uppercase tracking-wide text-blue-400">Plan</span>
                        <span className="text-sm font-bold text-blue-700">{l.plan}</span>
                      </div>
                    )}
                    {l.interes && (
                      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-blue-500">
                        {l.interes}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-gray-400">{fecha(l.created_at)}</span>
                </div>

                {l.mensaje && (
                  <div className="mt-3">
                    {abierto ? (
                      <p className="whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                        {l.mensaje}
                      </p>
                    ) : (
                      <p className="line-clamp-2 text-sm text-gray-500">{l.mensaje}</p>
                    )}
                  </div>
                )}

                <div className="mt-3 flex gap-3">
                  {l.mensaje && (
                    <button
                      type="button"
                      onClick={() => setExpandido(abierto ? null : l.id)}
                      className="text-sm font-semibold text-blue-600 hover:underline"
                    >
                      {abierto ? "Ocultar mensaje" : "Ver mensaje completo"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
