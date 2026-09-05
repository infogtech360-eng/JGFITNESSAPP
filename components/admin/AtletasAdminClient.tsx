"use client";
import { useState } from "react";

export function AtletasAdminClient({
  atletas,
  categorias,
  deportes,
  filtrosIniciales,
  total,
}: {
  atletas: any[];
  categorias: string[];
  deportes: string[];
  filtrosIniciales: { categoria: string; deporte: string; q: string; vista: string };
  total: number;
}) {
  const [busqueda, setBusqueda] = useState(filtrosIniciales.q);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar atleta..."
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
          />
          <span className="text-sm font-medium text-gray-500">Total: {total} atletas</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-bold text-gray-600 uppercase">
              <th className="p-4">Atleta</th>
              <th className="p-4">Deporte</th>
              <th className="p-4">Categoría</th>
              <th className="p-4">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
            {atletas.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-400">
                  No se encontraron atletas registrados.
                </td>
              </tr>
            ) : (
              atletas.map((atleta) => (
                <tr key={atleta.id} className="hover:bg-gray-50">
                  <td className="p-4 font-semibold text-gray-900">{atleta.nombre}</td>
                  <td className="p-4">{atleta.deporte}</td>
                  <td className="p-4">{atleta.categoria}</td>
                  <td className="p-4">
                    <a
                      href={`/dashboard/admin/atleta/${atleta.id}`}
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      Ver perfil
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}