import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pollId } = await params
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 })
    }
    const token = authHeader.substring(7)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        global: { headers: { Authorization: `Bearer ${token}` } }
      }
    )

    // Verify the user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    // First, verify the poll belongs to the user
    const { data: existingPoll, error: pollError } = await supabase
      .from('polls')
      .select('user_id')
      .eq('id', pollId)
      .single()

    if (pollError || !existingPoll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
    }

    if (existingPoll.user_id !== user.id) {
      return NextResponse.json({ error: 'You can only edit your own polls' }, { status: 403 })
    }

    // Parse the request body
    const body = await request.json()
    const { question, options, expires_at, is_active } = body

    // Validate inputs
    if (!question || question.trim().length < 5) {
      return NextResponse.json({ error: 'Question must be at least 5 characters long' }, { status: 400 })
    }

    if (!options || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json({ error: 'At least 2 options are required' }, { status: 400 })
    }

    // Filter out empty options
    const validOptions = options.filter(option => option && option.trim().length > 0)
    if (validOptions.length < 2) {
      return NextResponse.json({ error: 'At least 2 valid options are required' }, { status: 400 })
    }

    // Update the poll (without updated_at for now)
    const { data: updatedPoll, error: updateError } = await supabase
      .from('polls')
      .update({
        question: question.trim(),
        options: validOptions,
        expires_at: expires_at || null,
        is_active: is_active !== undefined ? is_active : true
      })
      .eq('id', pollId)
      .select('id, question, options')
      .single()

    if (updateError) {
      console.error('Error updating poll:', updateError)
      return NextResponse.json({ error: 'Failed to update poll' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      poll: updatedPoll,
      message: 'Poll updated successfully' 
    })
  } catch (error) {
    console.error('Error in update poll API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
