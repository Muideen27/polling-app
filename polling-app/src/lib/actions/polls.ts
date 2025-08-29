'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function createPoll(formData: FormData) {
  try {
    const question = formData.get('question') as string
    const options = formData.getAll('options') as string[]
    
    if (!question || !options.length || options.some(opt => !opt.trim())) {
      return { error: 'Question and all options are required' }
    }

    // Filter out empty options
    const validOptions = options.filter(opt => opt.trim().length > 0)
    
    if (validOptions.length < 2) {
      return { error: 'At least 2 options are required' }
    }

    const { data, error } = await supabase
      .from('polls')
      .insert({
        question: question.trim(),
        options: validOptions.map(opt => ({ text: opt.trim(), votes: 0 })),
        created_at: new Date().toISOString(),
        user_id: formData.get('user_id') as string
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating poll:', error)
      return { error: 'Failed to create poll. Please try again.' }
    }

    revalidatePath('/dashboard')
    return { success: true, poll: data }
  } catch (error) {
    console.error('Unexpected error creating poll:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}
