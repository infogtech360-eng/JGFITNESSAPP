"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { AtletaRow } from "@/lib/data/atletas";
import { FichaAtleta } from "./FichaAtleta";

type Props = {
  atletas: AtletaRow[];
  categorias: string[];
  deportes: string[];
  filtrosIniciales: { categoria: string; deporte: string; q: string; vista: string };
  total: number;
};

export function AtletasAdminClient({
  atletas,
  categorias,
  deportes,
  filtrosIniciales,
  total,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const aplicaFiltro = useCallback(
    (patch: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (!v || v === "todas" || v === "todos") params.delete(k);
        else params.set(k, v);
      }
      router.push(`/dashboard/admin?${params.toString()}`);
    },
    [router, searchParams]
  );

  const vista = searchParams.get("vista") ?? filtrosIniciales.vista ?? "tabla";
  const q = searchParams.get("q") ?? filtrosIniciales.q ?? "";
  const categoria = searchParams.get("categoria") ?? filtrosIniciales.categoria ?? "";
  const deporte = searchParams.get("deporte") ?? filtrosIniciales.deporte ?? "";

  return (
    <div>
      {/* Barra de filtros + toggle */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            {/* Búsqueda por texto */}
            <form
              className="flex flex-1 gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                aplicaFiltro({ q: String(fd.get("q") ?? "") });
              }}
            >
              <input
                name="q"
                defaultValue={q}
                placeholder="Buscar atleta o tutor…"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Buscar
              </button>
            </form>

            {/* Filtro categoría */}
            <select
              value={categoria}
              onChange={(e) => aplicaFiltro({ categoria: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
            >
              <option value="">Categoría: todas</option>
              {categorias.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Filtro deporte */}
            <select
              value={deporte}
              onChange={(e) => aplicaFiltro({ deporte: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
            >
              <option value="">Deporte: todos</option>
              {deportes.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle tabla / tarjetas */}
          <div className="flex rounded-lg border border-gray-300 p-0.5">
            <button
              onClick={() => aplicaFiltro({ vista: "tarjetas" })}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                vista === "tarjetas" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Tarjetas
            </button>
            <button
              onClick={() => aplicaFiltro({ vista: "tabla" })}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                vista !== "tarjetas" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Tabla
            </button>
          </div>
        </div>

        <p className="mt-3 text-xs font-medium text-gray-400">
          {total} atleta{total === 1 ? "" : "s"} encontrado{total === 1 ? "" : "s"}
        </p>
      </div>

      {/* Contenido: vista activa */}
      {vista === "tarjetas" ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {atletas.map((a) => (
            <TarjetaAtleta key={a.id} atleta={a} />
          ))}
        </div>
      ) : (
        <TablaAtletas atletas={atletas} />
      )}

      {atletas.length === 0 && (
        <div className="mt-10 text-center text-sm text-gray-400">
          No hay atletas que coincidan con los filtros aplicados.
        </div>
      )}
    </div>
  );
}

// ---------- Tarjeta ----------
function TarjetaAtleta({ atleta }: { atleta: AtletaRow }) {
  const nombre = [atleta.nombre, atleta.apellido].filter(Boolean).join(" ") || atleta.full_name || "Atleta";
  const inicial = (nombre[0] ?? "A").toUpperCase();
  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-black text-blue-700">
          {inicial}
        </div>
        <div className="min-w-0">
          <p className="truncate font-bold text-gray-900">{nombre}</p>
          <p className="truncate text-xs text-gray-500">
            {[atleta.deporte, atleta.categoria].filter(Boolean).join(" · ") || "Sin categoría"}
          </p>
        </div>
      </div>
      <div className="mt-4 space-y-1 text-sm text-gray-600">
        {atleta.posicion && (
          <p>
            <span className="font-medium text-gray-400">Posición:</span> {atleta.posicion}
          </p>
        )}
        {atleta.equipo && (
          <p>
            <span className="font-medium text-gray-400">Equipo:</span> {atleta.equipo}
          </p>
        )}
        {atleta.objetivo && (
          <p className="line-clamp-2">
            <span className="font-medium text-gray-400">Objetivo:</span> {atleta.objetivo}
          </p>
        )}
      </div>
      <button
        data-ficha-atleta={atleta.id}
        className="mt-4 w-full rounded-lg border border-blue-600 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-600 hover:text-white"
      >
        Ver ficha rápida
      </button>
      <FichaAtleta atleta={atleta} trigger={`[data-ficha-atleta="${atleta.id}"]`} />
    </div>
  );
}

// ---------- Tabla ----------
function TablaAtletas({ atletas }: { atletas: AtletaRow[] }) {
  const nombre = (a: AtletaRow) =>
    [a.nombre, a.apellido].filter(Boolean).join(" ") || a.full_name || "Atleta";
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Atleta</th>
              <th className="px-4 py-3 font-semibold">Deporte</th>
              <th className="px-4 py-3 font-semibold">Categoría</th>
              <th className="px-4 py-3 font-semibold">Posición</th>
              <th className="px-4 py-3 font-semibold">Equipo</th>
              <th className="px-4 py-3 font-semibold">Tutor</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 text-right font-semibold">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {atletas.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{nombre(a)}</td>
                <td className="px-4 py-3 text-gray-600">{a.deporte || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{a.categoria || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{a.posicion || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{a.equipo || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{a.tutor_nombre || "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                      a.estado === "activo"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {a.estado || "—"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    data-ficha-atleta={a.id}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    Ver ficha
                  </button>
                  <FichaAtleta atleta={a} trigger={`[data-ficha-atleta="${a.id}"]`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
