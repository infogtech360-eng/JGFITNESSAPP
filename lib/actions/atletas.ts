'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function registrarEvaluacion(formData: FormData) {
  const supabase = await createClient()

  const atletaId = formData.get('atletaId') as string
  const mental = parseInt(formData.get('mental') as string, 10)
  const emocional = parseInt(formData.get('emocional') as string, 10)
  const tactico = parseInt(formData.get('tactico') as string, 10)
  const notas = (formData.get('notas') as string) || ''

  const { error } = await supabase
    .from('evaluaciones_pilares')
    .insert({
      atleta_id: atletaId,
      mental,
      emocional,
      tactico,
      notas,
    })

  if (error) {
    console.error('Error al registrar evaluación:', error.message)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/admin')
  return { success: true }
}

export async function eliminarLead(leadId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', leadId)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/admin')
  return { success: true }
}