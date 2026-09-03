'use client'

import { useState } from 'react'
import ModalEvaluacion from './ModalEvaluacion'
import { createClient } from '@/lib/supabase/client'

export interface AtletaRow {
  id: string
  nombre?: string | null
  apellido?: string | null
  deporte?: string | null
  categoria?: string | null
  posicion?: string | null
  equipo?: string | null
  tutor_nombre?: string | null
  estado?: string | null
  [key: string]: any
}

interface AtletasAdminClientProps {
  atletas: AtletaRow[]
  categorias?: string[]
  de deportes?: string[]
  filtrosIniciales?: {
    categoria?: string
    deporte?: string
    q?: string
    vista?: string
  }
  total?: number
}

export function AtletasAdminClient({
  atletas,
  filtrosIniciales,
}: AtletasAdminClientProps) {
  const [busqueda, setBusqueda] = useState(filtrosIniciales?.q || '')
  const [atletaAEvaluar, setAtletaAEvaluar] = useState<{ id: string; nombre: string } | null>(null)
  const [listaAtletas, setListaAtletas] = useState<AtletaRow[]>(atletas || [])
  const supabase = createClient()

  const atletasFiltrados = listaAtletas.filter((atleta) => {
    const nombreCompleto = `${atleta.nombre || ''} ${atleta.apellido || ''}`.toLowerCase()
    return nombreCompleto.includes(busqueda.toLowerCase())
  })

  // Función para manejar el cambio de estado en Supabase
  const handleCambiarEstado = async (id: string, nuevoEstado: string) => {
    // Actualización optimista local para que responda de inmediato
    setListaAtletas((prev) =>
      prev.map((a) => (a.id === id ? { ...a, estado: nuevoEstado } : a))
    )

    const { error } = await supabase
      .from('leads')
      .update({ estado: nuevoEstado })
      .eq('id', id)

    if (error) {
      console.error('Error al actualizar estado:', error.message)
      alert('Hubo un error al actualizar el estado en la base de datos.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <input
          type="text"
          placeholder="Buscar atleta o tutor..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-1 p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Atleta</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deporte</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posición</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acción</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-sm">
            {atletasFiltrados.map((atleta) => (
              <tr key={atleta.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-900">
                  {atleta.nombre || ''} {atleta.apellido || ''}
                </td>
                <td className="px-6 py-4 text-gray-600">{atleta.deporte || 'N/A'}</td>
                <td className="px-6 py-4 text-gray-600">{atleta.categoria || 'N/A'}</td>
                <td className="px-6 py-4 text-gray-600">{atleta.posicion || 'N/A'}</td>
                <td className="px-6 py-4">
                  <select
                    value={atleta.estado || 'Nuevo'}
                    onChange={(e) => handleCambiarEstado(atleta.id, e.target.value)}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-full border border-gray-300 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="Nuevo">Nuevo</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="Convertido">Convertido</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-3 font-medium">
                  <button
                    onClick={() =>
                      setAtletaAEvaluar({
                        id: atleta.id,
                        nombre: `${atleta.nombre || ''} ${atleta.apellido || ''}`.trim(),
                      })
                    }
                    className="text-purple-600 hover:text-purple-900 font-semibold"
                  >
                    Evaluar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {atletaAEvaluar && (
        <ModalEvaluacion
          atletaId={atletaAEvaluar.id}
          atletaNombre={atletaAEvaluar.nombre}
          onClose={() => setAtletaAEvaluar(null)}
        />
      )}
    </div>
  )
}

export default AtletasAdminClient