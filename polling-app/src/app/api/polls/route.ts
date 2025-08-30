import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
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

    // Fetch user's polls
    const { data: polls, error: pollsError } = await supabase
      .from('polls')
      .select('id, question, options, created_at, is_active')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (pollsError) {
      console.error('Error fetching polls:', pollsError)
      return NextResponse.json({ error: 'Failed to fetch polls' }, { status: 500 })
    }

    return NextResponse.json({ polls: polls || [] })
  } catch (error) {
    console.error('Error in polls API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
