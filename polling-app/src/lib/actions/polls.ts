'use server'

import { supabaseServer } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPoll(formData: FormData): Promise<void> {
  try {
    const question = formData.get('question') as string
    const options: string[] = []
    for (let i = 0; i < 10; i++) {
      const option = formData.get(`option_${i}`) as string
      if (option && option.trim()) {
        options.push(option.trim())
      }
    }
    if (!question || question.trim().length < 5) {
      throw new Error('Question must be at least 5 characters long')
    }
    if (options.length < 2) {
      throw new Error('At least 2 options are required')
    }

    const supabase = supabaseServer()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('You must be logged in to create a poll')
    }

    const { data: pollData, error: pollError } = await supabase
      .from('polls')
      .insert({
        user_id: user.id,
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
    revalidatePath('/dashboard')
    redirect('/dashboard')
  } catch (error) {
    console.error('Error creating poll:', error)
    revalidatePath('/dashboard') // Revalidate even on error to clear form state
    throw error
  }
}

export async function getUserPolls(): Promise<{ polls: any[]; error?: string }> {
  try {
    const supabase = supabaseServer()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('You must be logged in to view your polls')
    }

    const { data: polls, error: pollsError } = await supabase
      .from('polls')
      .select('id, question, options, created_at, is_active')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (pollsError) {
      console.error('Error fetching polls:', pollsError)
      throw new Error(`Failed to fetch polls: ${pollsError.message}`)
    }

    return { polls: polls || [] }
  } catch (error) {
    console.error('Error fetching user polls:', error)
    return { 
      polls: [], 
      error: error instanceof Error ? error.message : 'Failed to fetch polls' 
    }
  }
}

export async function deletePoll(pollId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = supabaseServer()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('You must be logged in to delete polls')
    }

    // Delete the poll (votes will be cascaded due to CASCADE constraint)
    const { error: deleteError } = await supabase
      .from('polls')
      .delete()
      .eq('id', pollId)
      .eq('user_id', user.id) // Ensure user can only delete their own polls

    if (deleteError) {
      console.error('Error deleting poll:', deleteError)
      throw new Error(`Failed to delete poll: ${deleteError.message}`)
    }

    revalidatePath('/dashboard/polls')
    return { success: true }
  } catch (error) {
    console.error('Error deleting poll:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete poll' 
    }
  }
}
