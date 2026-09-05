'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

export default function AtletaDashboard() {
  const [pilarSeleccionado, setPilarSeleccionado] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [atleta, setAtleta] = useState<any>(null)
  
  const router = useRouter()

  // Conexión a Supabase usando @supabase/ssr
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

 useEffect(() => {
    const verificarUsuario = async () => {
      // 1. Obtener el usuario autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        router.push('/login')
        return
      }

      // 2. Buscar su perfil en la base de datos (TABLA CORRECTA: 'athletes')
      const { data: perfilAtleta, error: dbError } = await supabase
        .from('athletes') 
        .select('*')
        .eq('user_id', user.id)
        .single()

      // 3. Redirigir si es nuevo (no existe en athletes), o cargar sus datos si ya existe
      if (dbError || !perfilAtleta) {
        // Redirige al formulario para que llene sus datos por primera vez
        router.push('/onboarding') 
      } else {
        setAtleta(perfilAtleta)
        setIsLoading(false)
      }
    }

    verificarUsuario()
  }, [router, supabase])

  // Datos fijos del gráfico de radar por ahora
  const dataRadar = [
    { pilar: 'Mental', valor: 8.5, fullMark: 10 },
    { pilar: 'Emocional', valor: 9.0, fullMark: 10 },
    { pilar: 'Táctico', valor: 7.8, fullMark: 10 },
    { pilar: 'Físico', valor: 8.2, fullMark: 10 },
  ]

  const pilaresData: Record<string, { titulo: string; nota: number; tips: string[] }> = {
    Mental: { titulo: '🧠 Pilar Mental', nota: 8.5, tips: ['Practicar 5 min de visualización antes del partido.'] },
    Emocional: { titulo: '❤️ Pilar Emocional', nota: 9.0, tips: ['Excelente manejo de presión en momentos clave.'] },
    Táctico: { titulo: '⚔️ Pilar Táctico', nota: 7.8, tips: ['Mejorar la lectura de juego en perfil izquierdo.'] },
    Fisico: { titulo: '⚡ Pilar Físico', nota: 8.2, tips: ['Trabajo de potencia en tren inferior 2x por semana.'] },
  }

  // Pantalla de carga mientras valida
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Encabezado Dinámico con datos de Supabase */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenido, {atleta.nombre || 'Atleta'} 👋
          </h1>
          <p className="text-sm text-gray-500">
            {atleta.categoria || 'Categoría'} · {atleta.deporte || 'Fútbol'} / {atleta.posicion || 'Posición'}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 w-full md:w-auto">
          <div className="bg-blue-50 p-3 rounded-xl text-center">
            <span className="text-xs text-blue-600 font-semibold uppercase">Estatura</span>
            <p className="text-lg font-bold text-blue-900">{atleta.estatura || '0.00'} m</p>
          </div>
          <div className="bg-green-50 p-3 rounded-xl text-center">
            <span className="text-xs text-green-600 font-semibold uppercase">Peso</span>
            <p className="text-lg font-bold text-green-900">{atleta.peso || '0'} kg</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-xl text-center">
            <span className="text-xs text-purple-600 font-semibold uppercase">IMC</span>
            <p className="text-lg font-bold text-purple-900">
              {atleta.peso && atleta.estatura 
                ? (atleta.peso / (atleta.estatura * atleta.estatura)).toFixed(1) 
                : '0.0'}
            </p>
          </div>
        </div>
      </div>

      {/* Gráfico de Radar y Plan Alimenticio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Malla de Rendimiento 360°</h2>
              <p className="text-xs text-gray-500">Evaluación multidimensional de los 4 pilares</p>
            </div>
            <span className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-semibold">
              Estado Óptimo
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dataRadar}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="pilar" tick={{ fill: '#374151', fontSize: 12, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 10]} />
                <Radar name={atleta.nombre || 'Atleta'} dataKey="valor" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">🥗 Plan Nutricional</h2>
              <span className="text-xs bg-green-100 text-green-800 px-2.5 py-1 rounded-full font-medium">Activo</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Enfocado en alta resistencia y recuperación muscular rápida.
            </p>
            <div className="bg-gray-50 p-4 rounded-xl text-xs space-y-2 text-gray-700">
              <p>• <strong>Pre-partido:</strong> Carbohidratos complejos + hidratación.</p>
              <p>• <strong>Post-partido:</strong> Proteína magra + electrolitos.</p>
            </div>
          </div>
          <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition shadow-sm">
            Descargar Plan PDF
          </button>
        </div>
      </div>

      {/* Tarjetas de Pilares */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Detalle por Pilares</h2>
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

      {/* Modal de Detalle */}
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