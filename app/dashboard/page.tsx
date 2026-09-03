'use client'

import { useState } from 'react'

export default function AtletaDashboard() {
  const [pilarSeleccionado, setPilarSeleccionado] = useState<string | null>(null)

  const pilaresData: Record<string, { titulo: string; nota: number; tips: string[] }> = {
    Mental: {
      titulo: '🧠 Pilar Mental',
      nota: 8.5,
      tips: [
        'Practicar 5 min de visualización antes del partido.',
        'Mantener enfoque en jugadas de error para rápida recuperación.',
      ],
    },
    Emocional: {
      titulo: '❤️ Pilar Emocional',
      nota: 9.0,
      tips: [
        'Excelente manejo de presión en momentos clave.',
        'Reforzar la comunicación positiva con los compañeros.',
      ],
    },
    Táctico: {
      titulo: '⚔️ Pilar Táctico',
      nota: 7.8,
      tips: [
        'Mejorar la lectura de juego en perfil izquierdo.',
        'Ajustar posicionamiento en transición defensiva.',
      ],
    },
    Fisico: {
      titulo: '⚡ Pilar Físico',
      nota: 8.2,
      tips: [
        'Trabajo de potencia en tren inferior 2x por semana.',
        'Mantener la rutina de estiramientos post-entreno.',
      ],
    },
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Encabezado y Ficha Biométrica */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bienvenido, Mateo Gómez 👋</h1>
          <p className="text-sm text-gray-500">Categoría Sub-18 · Atletismo / Velocidad</p>
        </div>
        <div className="grid grid-cols-3 gap-4 w-full md:w-auto">
          <div className="bg-blue-50 p-3 rounded-xl text-center">
            <span className="text-xs text-blue-600 font-semibold uppercase">Estatura</span>
            <p className="text-lg font-bold text-blue-900">1.78 m</p>
          </div>
          <div className="bg-green-50 p-3 rounded-xl text-center">
            <span className="text-xs text-green-600 font-semibold uppercase">Peso</span>
            <p className="text-lg font-bold text-green-900">68 kg</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-xl text-center">
            <span className="text-xs text-purple-600 font-semibold uppercase">IMC</span>
            <p className="text-lg font-bold text-purple-900">21.5</p>
          </div>
        </div>
      </div>

      {/* Plan Alimenticio & Redes Sociales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Plan Alimenticio */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">🥗 Plan Nutricional</h2>
            <span className="text-xs bg-green-100 text-green-800 px-2.5 py-1 rounded-full font-medium">Activo</span>
          </div>
          <p className="text-sm text-gray-600">
            Plan enfocado en hipertrofia magra y rendimiento en competencias de velocidad.
          </p>
          <div className="bg-gray-50 p-4 rounded-xl text-xs space-y-2 text-gray-700">
            <p>• <strong>Pre-entreno:</strong> Carbohidratos de rápida absorción + hidratación electrolítica.</p>
            <p>• <strong>Post-entreno:</strong> 30g Proteína + Carbohidratos complejos.</p>
          </div>
          <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition">
            Descargar Plan PDF
          </button>
        </div>

        {/* Crecimiento Marca Personal / Redes */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">🚀 Perfil & Redes Sociales</h2>
          <p className="text-sm text-gray-600">Evolución de proyección deportiva y marca personal.</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-gray-100 p-3 rounded-xl">
              <span className="text-xs text-gray-500">Instagram Reach</span>
              <p className="text-xl font-bold text-gray-900">+24% este mes</p>
            </div>
            <div className="border border-gray-100 p-3 rounded-xl">
              <span className="text-xs text-gray-500">Highlights Subidos</span>
              <p className="text-xl font-bold text-gray-900">12 videos</p>
            </div>
          </div>
          <div className="bg-purple-50 p-3 rounded-xl text-xs text-purple-900">
            💡 <strong>Tip del Coach:</strong> Publica tu rutina de calentamiento antes del torneo de este fin de semana.
          </div>
        </div>
      </div>

      {/* Tarjetas de Pilares Interactivos */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Evaluación de Pilares Deportivo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(pilaresData).map(([key, data]) => (
            <div
              key={key}
              onClick={() => setPilarSeleccionado(key)}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-400 hover:shadow-md transition cursor-pointer space-y-3"
            >
              <h3 className="font-semibold text-gray-800">{data.titulo}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-blue-600">{data.nota}</span>
                <span className="text-xs text-gray-400">/ 10 pts</span>
              </div>
              <p className="text-xs text-blue-600 font-medium hover:underline">Ver recomendaciones →</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Detalle de Pilar */}
      {pilarSeleccionado && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl space-y-4 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900">
              {pilaresData[pilarSeleccionado].titulo}
            </h3>
            <p className="text-sm font-semibold text-gray-700">
              Puntuación actual: {pilaresData[pilarSeleccionado].nota} / 10
            </p>
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase text-gray-400">Pautas y Recomendaciones:</p>
              <ul className="space-y-2">
                {pilaresData[pilarSeleccionado].tips.map((tip, idx) => (
                  <li key={idx} className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    • {tip}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => setPilarSeleccionado(null)}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-medium text-sm transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}