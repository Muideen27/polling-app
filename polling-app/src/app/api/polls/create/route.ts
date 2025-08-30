import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Create Supabase client with the token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    )

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    // Parse the form data
    const formData = await request.formData()
    const question = formData.get('question') as string
    const options: string[] = []
    
    for (let i = 0; i < 10; i++) {
      const option = formData.get(`option_${i}`) as string
      if (option && option.trim()) {
        options.push(option.trim())
      }
    }

    // Validation
    if (!question || question.trim().length < 5) {
      return NextResponse.json({ error: 'Question must be at least 5 characters long' }, { status: 400 })
    }
    if (options.length < 2) {
      return NextResponse.json({ error: 'At least 2 options are required' }, { status: 400 })
    }

    // Create the poll
    const { data: pollData, error: pollError } = await supabase
      .from('polls')
      .insert({
        user_id: user.id,
        question: question.trim(),
        options: options,
        created_at: new Date().toISOString(),
        is_active: true
      })
      .select('id')
      .single()

    if (pollError) {
      console.error('Error creating poll:', pollError)
      if (pollError.code === '42P01') {
        return NextResponse.json({ error: 'Database table "polls" does not exist. Please run the database schema setup.' }, { status: 500 })
      }
      return NextResponse.json({ error: `Failed to create poll: ${pollError.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, poll: pollData })
  } catch (error) {
    console.error('Error in create poll API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
