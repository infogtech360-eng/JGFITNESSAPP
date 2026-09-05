'use client'

import { useState } from 'react'
import { registrarEvaluacion } from '@/lib/actions/atletas'

export default function ModalEvaluacion({ atletaId, atletaNombre, onClose }: { atletaId: string, atletaNombre: string, onClose: () => void }) {
  const [mental, setMental] = useState(7)
  const [emocional, setEmocional] = useState(7)
  const [tactico, setTactico] = useState(7)
  
  // Estados para las notas y el plan nutricional
  const [notas, setNotas] = useState('')
  const [calorias, setCalorias] = useState('')
  const [objetivoNutri, setObjetivoNutri] = useState('')
  const [loading, setLoading] = useState(false)

  // Función para generar sugerencias automáticas basadas en las puntuaciones (5 a 10)
  const generarSugerenciaAutomatica = () => {
    let observaciones = []

    // Pilar Mental
    if (mental <= 6) {
      observaciones.push("🧠 Pilar Mental: Requiere trabajar la concentración bajo presión y la resiliencia ante errores.")
    } else if (mental >= 8) {
      observaciones.push("🧠 Pilar Mental: Excelente enfoque y solidez mental durante los entrenamientos.")
    } else {
      observaciones.push("🧠 Pilar Mental: Desempeño estable, continuar reforzando la confianza.")
    }

    // Pilar Emocional
    if (emocional <= 6) {
      observaciones.push("❤️ Pilar Emocional: Necesario gestionar mejor la frustración y la motivación en momentos de alta exigencia.")
    } else if (emocional >= 8) {
      observaciones.push("❤️ Pilar Emocional: Gran inteligencia emocional y actitud positiva constante.")
    } else {
      observaciones.push("❤️ Pilar Emocional: Buen manejo emocional, mantener el equilibrio.")
    }

    // Pilar Táctico
    if (tactico <= 6) {
      observaciones.push("⚔️ Pilar Táctico: Enfocarse en la lectura de juego, posicionamiento y toma de decisiones rápidas.")
    } else if (tactico >= 8) {
      observaciones.push("⚔️ Pilar Táctico: Sobresaliente comprensión táctica y ejecución en el campo.")
    } else {
      observaciones.push("⚔️ Pilar Táctico: Progreso constante, seguir puliendo detalles posicionales.")
    }

    setNotas(observaciones.join("\n"))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    // Si manejas el guardado nutricional en la misma acción o mediante fetch adicional:
    try {
      await registrarEvaluacion(formData)
      
      // Si hay datos nutricionales escritos, enviarlos a la API de nutrición
      if (calorias || objetivoNutri) {
        await fetch("/api/nutricion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ atleta_id: atletaId, calorias, objetivo: objetivoNutri }),
        })
      }
    } catch (error) {
      console.error("Error al guardar evaluación o nutrición", error)
    } finally {
      setLoading(false)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl my-8">
        <h3 className="text-xl font-bold mb-1 text-gray-900">Evaluación de Pilares & Nutrición</h3>
        <p className="text-sm text-gray-500 mb-6">Atleta: <span className="font-semibold text-blue-600">{atletaNombre}</span></p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input type="hidden" name="atletaId" value={atletaId} />

          {/* Sliders de Pilares */}
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

          {/* Botón para autogenerar retroalimentación */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Notas de Sesión / Retroalimentación</label>
              <button
                type="button"
                onClick={generarSugerenciaAutomatica}
                className="text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold px-2.5 py-1 rounded-md transition"
              >
                ✨ Generar sugerencia automática
              </button>
            </div>
            <textarea 
              name="notas" 
              rows={4} 
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Progreso táctico, enfoque mental..." 
              className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
              required 
            />
          </div>

          {/* Sección de Plan Nutricional integrada en el Modal */}
          <div className="border-t pt-4 mt-4">
            <h4 className="text-sm font-bold text-gray-900 mb-3">🥗 Asignar Plan Nutricional Rápido</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Calorías Diarias (kcal)</label>
                <input
                  type="number"
                  value={calorias}
                  onChange={(e) => setCalorias(e.target.value)}
                  placeholder="Ej. 2500"
                  className="w-full p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Enfoque Nutricional</label>
                <input
                  type="text"
                  value={objetivoNutri}
                  onChange={(e) => setObjetivoNutri(e.target.value)}
                  placeholder="Ej. Definición / Masa"
                  className="w-full p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-3 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50">
              {loading ? 'Guardando...' : 'Guardar Evaluación y Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}