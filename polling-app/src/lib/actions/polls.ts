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
    
    console.log('Creating poll with:', { question, options })
    
    // Validation
    if (!question || question.trim().length < 5) {
      throw new Error('Question must be at least 5 characters long')
    }
    
    if (options.length < 2) {
      throw new Error('At least 2 options are required')
    }

    const supabase = supabaseServer()
    
    // Insert into polls table with options array
    const { data: pollData, error: pollError } = await supabase
      .from('polls')
      .insert({
        question: question.trim(),
        options: options, // Store options as TEXT[] array
        created_at: new Date().toISOString(),
        is_active: true
      })
      .select('id')
      .single()

    if (pollError) {
      console.error('Error creating poll:', pollError)
      if (pollError.code === '42P01') {
        throw new Error('Database table "polls" does not exist. Please run the database schema setup.')
      }
      throw new Error(`Failed to create poll: ${pollError.message}`)
    }

    console.log('Poll created successfully:', pollData)
    revalidatePath('/dashboard')
    redirect('/dashboard')
  } catch (error) {
    console.error('Error creating poll:', error)
    // Re-throw the error to be handled by the form
    throw error
  }
}
