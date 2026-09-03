'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function registrarEvaluacion(formData: FormData) {
  const atletaId = formData.get('atletaId') as string
  const mental = Number(formData.get('mental'))
  const emocional = Number(formData.get('emocional'))
  const tactico = Number(formData.get('tactico'))

  const supabase = await createClient()

  const { error } = await supabase
    .from('evaluaciones')
    .insert([
      {
        atleta_id: atletaId,
        pilar_mental: mental,
        pilar_emocional: emocional,
        pilar_tactico: tactico,
        created_at: new Date().toISOString(),
      },
    ])

  if (error) {
    console.error('Error al registrar la evaluación:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/admin')
  return { success: true }
}