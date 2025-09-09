'use server'

import { supabaseServer } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

// Validation helpers
type ValidationResult = { isValid: true } | { isValid: false; error: string }

function validateQuestion(question: string | null): ValidationResult {
  const trimmed = question?.trim()
  if (!trimmed) {
    return { isValid: false, error: 'Question is required' }
  }
  if (trimmed.length < 5) {
    return { isValid: false, error: 'Question must be at least 5 characters long' }
  }
  if (trimmed.length > 500) {
    return { isValid: false, error: 'Question must be less than 500 characters' }
  }
  return { isValid: true }
}

function validateOptions(options: string[]): ValidationResult {
  if (options.length < 2) {
    return { isValid: false, error: 'At least 2 options are required' }
  }
  if (options.length > 10) {
    return { isValid: false, error: 'Maximum 10 options allowed' }
  }
  
  // Check for empty options
  const emptyOptions = options.some(opt => !opt.trim())
  if (emptyOptions) {
    return { isValid: false, error: 'All options must have text' }
  }
  
  // Check for duplicates (case-insensitive)
  const uniqueOptions = [...new Set(options.map(opt => opt.toLowerCase().trim()))]
  if (uniqueOptions.length !== options.length) {
    return { isValid: false, error: 'Duplicate options are not allowed' }
  }
  
  return { isValid: true }
}

function extractOptionsFromFormData(formData: FormData): string[] {
  const options: string[] = []
  for (let i = 0; i < 10; i++) {
    const option = formData.get(`option_${i}`) as string
    if (option?.trim()) {
      options.push(option.trim())
    }
  }
  return options
}

async function getCurrentUser() {
  const supabase = await supabaseServer()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('You must be logged in to perform this action')
  }
  
  return { supabase, user }
}

function mapDatabaseError(error: { code?: string; message: string }): string {
  if (error.code === '42P01') {
    return 'Database table does not exist. Please run the database schema setup.'
  }
  if (error.code === '23505') {
    return 'A poll with this data already exists.'
  }
  if (error.code === '23503') {
    return 'Referenced data does not exist.'
  }
  return `Database error: ${error.message}`
}

export async function createPoll(formData: FormData): Promise<void> {
  try {
    const question = formData.get('question') as string
    const options = extractOptionsFromFormData(formData)
    
    // Validate input
    const questionValidation = validateQuestion(question)
    if (!questionValidation.isValid) {
      throw new Error(questionValidation.error)
    }
    
    const optionsValidation = validateOptions(options)
    if (!optionsValidation.isValid) {
      throw new Error(optionsValidation.error)
    }

    const { supabase, user } = await getCurrentUser()

    const { error: pollError } = await supabase
      .from('polls')
      .insert({
        user_id: user.id,
        question: question!.trim(),
        options: options,
        created_at: new Date().toISOString(),
        is_active: true
      })

    if (pollError) {
      console.error('Error creating poll:', pollError)
      throw new Error(mapDatabaseError(pollError))
    }
    
    revalidatePath('/dashboard')
  } catch (error) {
    console.error('Error creating poll:', error)
    revalidatePath('/dashboard')
    throw error
  }
}

export async function getUserPolls(): Promise<{ polls: Array<{ id: string; question: string; options: string[]; created_at: string; is_active: boolean }>; error?: string }> {
  try {
    const { supabase, user } = await getCurrentUser()

    const { data: polls, error: pollsError } = await supabase
      .from('polls')
      .select('id, question, options, created_at, is_active')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (pollsError) {
      console.error('Error fetching polls:', pollsError)
      throw new Error(mapDatabaseError(pollsError))
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


export async function updatePoll(
  pollId: string,
  formData: FormData
): Promise<{ ok: true; data?: { id: string } } | { ok: false; error: string }> {
  try {
    const { supabase, user } = await getCurrentUser()

    const question = formData.get('question') as string
    const options = extractOptionsFromFormData(formData)
    
    // Validate input
    const questionValidation = validateQuestion(question)
    if (!questionValidation.isValid) {
      return { ok: false, error: questionValidation.error }
    }
    
    const optionsValidation = validateOptions(options)
    if (!optionsValidation.isValid) {
      return { ok: false, error: optionsValidation.error }
    }

    // Verify poll ownership
    const { data: existingPoll, error: fetchError } = await supabase
      .from('polls')
      .select('id, user_id')
      .eq('id', pollId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingPoll) {
      return { ok: false, error: 'Poll not found or you do not have permission to edit it' }
    }

    // Update the poll with new options array
    const { error: pollError } = await supabase
      .from('polls')
      .update({
        question: question!.trim(),
        options: options,
        updated_at: new Date().toISOString()
      })
      .eq('id', pollId)
      .eq('user_id', user.id)

    if (pollError) {
      console.error('Error updating poll:', pollError)
      return { ok: false, error: mapDatabaseError(pollError) }
    }

    revalidatePath('/dashboard/polls')
    return { ok: true, data: { id: pollId } }
  } catch (error) {
    console.error('Error updating poll:', error)
    return { 
      ok: false, 
      error: error instanceof Error ? error.message : 'Failed to update poll' 
    }
  }
}

export async function deletePoll(formData: FormData): Promise<void> {
  try {
    const { supabase, user } = await getCurrentUser()

    const pollId = formData.get('pollId') as string
    if (!pollId?.trim()) {
      throw new Error('Poll ID is required')
    }

    // Delete the poll (votes will be cascaded due to CASCADE constraint)
    const { error: deleteError } = await supabase
      .from('polls')
      .delete()
      .eq('id', pollId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting poll:', deleteError)
      throw new Error(mapDatabaseError(deleteError))
    }

    revalidatePath('/dashboard/polls')
  } catch (error) {
    console.error('Error deleting poll:', error)
    throw error
  }
}

// New function to check if a poll is expired
function isPollExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}

// New function to validate poll voting eligibility
export async function validatePollForVoting(pollId: string): Promise<{ canVote: true } | { canVote: false; error: string }> {
  try {
    const supabase = await supabaseServer()
    
    const { data: poll, error } = await supabase
      .from('polls')
      .select('id, is_active, expires_at')
      .eq('id', pollId)
      .single()
    
    if (error || !poll) {
      return { canVote: false, error: 'Poll not found' }
    }
    
    if (!poll.is_active) {
      return { canVote: false, error: 'This poll is no longer active' }
    }
    
    if (isPollExpired(poll.expires_at)) {
      return { canVote: false, error: 'This poll has expired' }
    }
    
    return { canVote: true }
  } catch (error) {
    console.error('Error validating poll for voting:', error)
    return { canVote: false, error: 'Unable to validate poll status' }
  }
}
// CR: tighten invalid state handling
