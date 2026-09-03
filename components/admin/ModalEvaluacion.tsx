'use client'

import { useState } from 'react'
import { registrarEvaluacion } from '@/lib/actions/atletas'

export default function ModalEvaluacion({ atletaId, atletaNombre, onClose }: { atletaId: string, atletaNombre: string, onClose: () => void }) {
  const [mental, setMental] = useState(7)
  const [emocional, setEmocional] = useState(7)
  const [tactico, setTactico] = useState(7)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    await registrarEvaluacion(formData)
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
        <h3 className="text-xl font-bold mb-1 text-gray-900">Evaluación de Pilares</h3>
        <p className="text-sm text-gray-500 mb-6">Atleta: <span className="font-semibold text-blue-600">{atletaNombre}</span></p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input type="hidden" name="atletaId" value={atletaId} />

          <div>
            <div className="flex justify-between text-sm font-medium mb-1">
              <span className="text-purple-700">🧠 Pilar Mental</span>
              <span className="font-bold">{mental}/10</span>
            </div>
            <input type="range" name="mental" min="1" max="10" value={mental} onChange={(e) => setMental(+e.target.value)} className="w-full accent-purple-600" />
          </div>

          <div>
            <div className="flex justify-between text-sm font-medium mb-1">
              <span className="text-red-600">❤️ Pilar Emocional</span>
              <span className="font-bold">{emocional}/10</span>
            </div>
            <input type="range" name="emocional" min="1" max="10" value={emocional} onChange={(e) => setEmocional(+e.target.value)} className="w-full accent-red-600" />
          </div>

          <div>
            <div className="flex justify-between text-sm font-medium mb-1">
              <span className="text-blue-600">⚔️ Pilar Táctico</span>
              <span className="font-bold">{tactico}/10</span>
            </div>
            <input type="range" name="tactico" min="1" max="10" value={tactico} onChange={(e) => setTactico(+e.target.value)} className="w-full accent-blue-600" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas de Sesión / Retroalimentación</label>
            <textarea name="notas" rows={3} placeholder="Progreso táctico, enfoque mental..." className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50">
              {loading ? 'Guardando...' : 'Guardar Evaluación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}