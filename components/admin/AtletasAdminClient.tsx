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
  email?: string | null
  telefono?: string | null
  [key: string]: any
}

interface AtletasAdminClientProps {
  atletas: AtletaRow[]
  categorias?: string[]
  deportes?: string[]
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
  const [cargandoId, setCargandoId] = useState<string | null>(null)
  const supabase = createClient()

  const atletasFiltrados = listaAtletas.filter((atleta) => {
    const nombreCompleto = `${atleta.nombre || ''} ${atleta.apellido || ''}`.toLowerCase()
    return nombreCompleto.includes(busqueda.toLowerCase())
  })

  const handleCambiarEstado = async (atleta: AtletaRow, nuevoEstado: string) => {
    setListaAtletas((prev) =>
      prev.map((a) => (a.id === atleta.id ? { ...a, estado: nuevoEstado } : a))
    )

    // 1. Actualizar el estado en la tabla leads
    const { error: errorLead } = await supabase
      .from('leads')
      .update({ estado: nuevoEstado })
      .eq('id', atleta.id)

    if (errorLead) {
      console.error('Error al actualizar estado:', errorLead.message)
      alert('Hubo un error al actualizar el estado.')
      return
    }

    // 2. Si el estado cambia a "Convertido", automatizamos la creación de su perfil de atleta
    if (nuevoEstado === 'Convertido' && atleta.email) {
      setCargandoId(atleta.id)
      try {
        // Llamada a una API o función que registra al usuario en Supabase Auth y crea su perfil
        const response = await fetch('/api/admin/convertir-atleta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadId: atleta.id,
            email: atleta.email,
            nombre: atleta.nombre || 'Atleta',
            apellido: atleta.apellido || '',
            deporte: atleta.deporte || 'Fútbol',
            categoria: atleta.categoria || 'General',
            posicion: atleta.posicion || '',
          }),
        })

        const data = await response.json()
        if (response.ok) {
          alert(`¡Atleta convertido con éxito! Se ha generado su cuenta de acceso para ${atleta.email}.`)
        } else {
          console.error('Error en conversión automática:', data.error)
          alert(`El estado cambió, pero hubo un detalle al crear las credenciales: ${data.error}`)
        }
      } catch (err) {
        console.error('Error de red al convertir:', err)
      } finally {
        setCargandoId(null)
      }
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
                  <div className="flex items-center gap-2">
                    <select
                      value={atleta.estado || 'Nuevo'}
                      onChange={(e) => handleCambiarEstado(atleta, e.target.value)}
                      disabled={cargandoId === atleta.id}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-full border border-gray-300 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                    >
                      <option value="Nuevo">Nuevo</option>
                      <option value="En Proceso">En Proceso</option>
                      <option value="Convertido">Convertido</option>
                    </select>
                    {cargandoId === atleta.id && (
                      <span className="text-xs text-blue-600 animate-pulse">Generando...</span>
                    )}
                  </div>
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