'use server'

import { supabaseServer } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPoll(formData: FormData): Promise<void> {
  try {
    const question = formData.get('question') as string
    const options: string[] = []
    
    // Extract options from form data (option_0, option_1, etc.)
    for (let i = 0; i < 10; i++) {
      const option = formData.get(`option_${i}`) as string
      if (option && option.trim()) {
        options.push(option.trim())
      }
    }
    
    // Validation
    if (!question || question.trim().length < 5) {
      throw new Error('Question must be at least 5 characters long')
    }
    
    if (options.length < 2) {
      throw new Error('At least 2 options are required')
    }

    const supabase = supabaseServer()
    
    // Insert into polls table
    const { data: pollData, error: pollError } = await supabase
      .from('polls')
      .insert({
        question: question.trim(),
        created_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (pollError) {
      console.error('Error creating poll:', pollError)
      throw new Error('Failed to create poll. Please try again.')
    }

    // Insert into poll_options table
    const pollOptions = options.map((option, idx) => ({
      poll_id: pollData.id,
      label: option,
      idx: idx
    }))

    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(pollOptions)

    if (optionsError) {
      console.error('Error creating poll options:', optionsError)
      // Clean up the poll if options creation fails
      await supabase.from('polls').delete().eq('id', pollData.id)
      throw new Error('Failed to create poll options. Please try again.')
    }

    revalidatePath('/dashboard')
    redirect('/dashboard')
  } catch (error) {
    console.error('Error creating poll:', error)
    // For now, just revalidate and stay on the page
    // In a real app, you might want to handle errors differently
    revalidatePath('/dashboard')
    throw error
  }
}
