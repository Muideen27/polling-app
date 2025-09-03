
'use server'

import { supabaseServer } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function submitVote(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  try {
    const pollId = formData.get('pollId') as string
    const optionId = formData.get('optionId') as string
    const fingerprint = formData.get('fingerprint') as string

    // Validation: all required
    if (!pollId || !optionId || !fingerprint) {
      return { ok: false, error: 'Missing required fields' }
    }

    const supabase = await supabaseServer()

    // Insert vote into votes table
    const { error: voteError } = await supabase
      .from('votes')
      .insert({
        poll_id: pollId,
        option_index: parseInt(optionId),
        voter_fingerprint: fingerprint
      })

    if (voteError) {
      console.error('Error submitting vote:', voteError)
      
      // Handle duplicate vote constraint
      if (voteError.code === '23505') {
        return { ok: false, error: "You've already voted." }
      }
      
      return { ok: false, error: 'Failed to submit vote' }
    }

    // Revalidate the poll page to show updated results
    revalidatePath(`/poll/${pollId}`)
    
    return { ok: true }
  } catch (error) {
    console.error('Unexpected error submitting vote:', error)
    return { ok: false, error: 'An unexpected error occurred' }
  }
}
