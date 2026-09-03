"use client";

import { useState, useTransition } from "react";
import type { LeadRow } from "@/lib/data/leads";
import { actualizarEstadoLead, type EstadoLead } from "@/lib/actions/leads";

// Gestor de prospectos (public.leads) para el panel admin — vista tabla.
// Incluye: badges de color por plan, selector de estado (Nuevo / En Proceso /
// Convertido) que persiste vía la server action con service-role, y botón
// "Contactar WhatsApp" que abre chat directo (wa.me) con el número del prospecto.
type Props = {
  leads: LeadRow[];
  total: number;
};

const ESTADOS: { key: EstadoLead; label: string }[] = [
  { key: "nuevo", label: "Nuevo" },
  { key: "en_proceso", label: "En Proceso" },
  { key: "convertido", label: "Convertido" },
];

const badgeEstado: Record<string, string> = {
  nuevo: "bg-blue-100 text-blue-700 ring-blue-200",
  en_proceso: "bg-amber-100 text-amber-700 ring-amber-200",
  convertido: "bg-green-100 text-green-700 ring-green-200",
};

const badgePlan: Record<string, string> = {
  mensual: "bg-cyan-100 text-cyan-700",
  trimestral: "bg-indigo-100 text-indigo-700",
  anual: "bg-violet-100 text-violet-700",
  club: "bg-rose-100 text-rose-700",
};

function colorPlan(plan: string | null) {
  if (!plan) return "bg-gray-100 text-gray-500";
  const p = plan.toLowerCase();
  for (const k of Object.keys(badgePlan)) if (p.includes(k)) return badgePlan[k];
  return "bg-blue-50 text-blue-700";
}

export function BandejaLeadsClient({ leads, total }: Props) {
  const [filtro, setFiltro] = useState("todos");
  const [, startTransition] = useTransition();

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

  const waLink = (l: LeadRow) => {
    const n = (l.telefono || "").replace(/[^\d+]/g, "");
    if (!n) return null;
    const txt = encodeURIComponent(
      `Hola ${l.nombre || ""}, te saludamos de JG IMPULSA${l.plan ? ` por tu interés en el plan ${l.plan}` : ""}.`
    );
    return `https://wa.me/${n}?text=${txt}`;
  };

  const cambiaEstado = async (id: string, estado: EstadoLead) => {
    // Feedback visual inmediato sin recarga completa.
    startTransition(async () => {
      await actualizarEstadoLead({ id, estado });
      // Recarga filtros/orden del panel para reflejar el nuevo estado.
      window.location.reload();
    });
  };

  return (
    <div>
      {/* Barra de filtro por estado */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Estado:</label>
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-600"
          >
            <option value="todos">Todos</option>
            {ESTADOS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs font-medium text-gray-400">
          {visibles.length} de {total} prospecto{total === 1 ? "" : "s"}
        </p>
      </div>

      {visibles.length === 0 ? (
        <div className="mt-10 text-center text-sm text-gray-400">
          No hay prospectos con este estado.
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Prospecto</th>
                  <th className="px-4 py-3 font-semibold">Plan</th>
                  <th className="px-4 py-3 font-semibold">Contacto</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Recibido</th>
                  <th className="px-4 py-3 text-right font-semibold">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visibles.map((l) => {
                  const estado = (l.estado || "nuevo") as EstadoLead;
                  const wa = waLink(l);
                  return (
                    <tr key={l.id} className="align-middle hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{l.nombre || "Sin nombre"}</p>
                        {l.interes && (
                          <p className="text-xs font-medium uppercase tracking-wide text-blue-500">
                            {l.interes}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {l.plan ? (
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${colorPlan(l.plan)}`}
                          >
                            {l.plan}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {l.email && <p className="text-gray-700">{l.email}</p>}
                        {l.telefono && <p className="text-xs text-gray-500">{l.telefono}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={estado}
                          onChange={(e) => cambiaEstado(l.id, e.target.value as EstadoLead)}
                          className={`rounded-full border-0 px-2 py-1 text-xs font-semibold outline-none ring-1 ${
                            badgeEstado[estado] || "bg-gray-100 text-gray-600 ring-gray-200"
                          }`}
                        >
                          {ESTADOS.map((s) => (
                            <option key={s.key} value={s.key} className="text-gray-700">
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{fecha(l.created_at)}</td>
                      <td className="px-4 py-3 text-right">
                        {wa ? (
                          <a
                            href={wa}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-green-600"
                          >
                            <WhatsAppIcon />
                            Contactar WhatsApp
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">Sin teléfono</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
