'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function registrarEvaluacion(formData: FormData) {
  const supabase = await createClient()

  const atletaId = formData.get('atletaId') as string
  const mental = parseInt(formData.get('mental') as string, 10)
  const emocional = parseInt(formData.get('emocional') as string, 10)
  const tactico = parseInt(formData.get('tactico') as string, 10)
  const fisico = parseInt(formData.get('fisico') as string, 10)
  const notas = (formData.get('notas') as string) || ''

  // Insertar la evaluación de los 4 pilares
  const { error } = await supabase
    .from('evaluaciones_pilares')
    .insert({
      atleta_id: atletaId,
      mental,
      emocional,
      tactico,
      fisico,
      notas,
    })

  if (error) {
    console.error('Error al registrar evaluación:', error.message)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/admin')
  return { success: true }
}

export async function actualizarFichaAtleta(formData: FormData) {
  const supabase = await createClient()

  const atletaId = formData.get('atletaId') as string
  const estatura = parseFloat(formData.get('estatura') as string)
  const peso = parseFloat(formData.get('peso') as string)
  const plan_nutricional = formData.get('plan_nutricional') as string

  // Calcular IMC automáticamente
  const imc = estatura > 0 ? parseFloat((peso / (estatura * estatura)).toFixed(1)) : null

  const { error } = await supabase
    .from('leads')
    .update({ estatura, peso, imc, plan_nutricional })
    .eq('id', atletaId)

  if (error) {
    console.error('Error al actualizar ficha:', error.message)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/admin')
  return { success: true }
}