import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function supabaseServer() {
  const cookieStore = await cookies()
  
  // Get all cookies and find Supabase session
  const allCookies = cookieStore.getAll()
  let accessToken = ''
  let refreshToken = ''
  
  // Look for Supabase session cookies
  for (const cookie of allCookies) {
    if (cookie.name.includes('access_token')) {
      accessToken = cookie.value
    }
    if (cookie.name.includes('refresh_token')) {
      refreshToken = cookie.value
    }
  }
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  )

  // If we have an access token, set it
  if (accessToken) {
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || ''
    })
  }

  return supabase
}
