'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string; user?: User }>
  signUp: (email: string, password: string, name?: string) => Promise<{ error?: string; user?: User; immediateSignIn?: boolean; message?: string }>
  resendConfirmation: (email: string) => Promise<{ error?: string; status?: 'sent' }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial user session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        setLoading(false)
      } catch {
        console.error('Error getting initial session')
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function signIn(email: string, password: string) {
    try {
      console.log('Attempting sign in for:', email)
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      })
      
      console.log('Sign in response:', { data, error })
      
      if (error) {
        console.error('Sign in error:', error)
        return { error: error.message }
      }
      
      if (data.user) {
        setUser(data.user)
        return { user: data.user }
      }
      
      return { error: 'Sign in failed' }
    } catch {
      console.error('Unexpected sign in error')
      return { error: 'An unexpected error occurred' }
    }
  }

  async function signUp(email: string, password: string, name?: string) {
    try {
      console.log('Starting signup process for:', email)
      
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            name: name || '',
            full_name: name || ''
          }
        }
      })
      
      console.log('Signup response:', { data, error })
      
      if (error) {
        console.error('Sign up error:', error)
        return { error: error.message }
      }
      
      if (data.user) {
        // Check if email confirmation is required
        if (data.session) {
          // User is immediately signed in (email confirmation disabled)
          console.log('User immediately signed in, session created')
          setUser(data.user)
          return { user: data.user, immediateSignIn: true }
        } else {
          // Email confirmation required
          console.log('Email confirmation required, user created but not signed in')
          console.log('User ID:', data.user.id)
          console.log('User email:', data.user.email)
          console.log('User status:', data.user.email_confirmed_at ? 'Confirmed' : 'Pending confirmation')
          
          return { 
            user: data.user, 
            immediateSignIn: false,
            message: 'Please check your email and click the confirmation link to activate your account.'
          }
        }
      }
      
      return { error: 'Sign up failed' }
    } catch {
      console.error('Unexpected sign up error')
      return { error: 'An unexpected error occurred' }
    }
  }

  async function resendConfirmation(email: string) {
    try {
      const { data, error } = await supabase.auth.resend({ type: 'signup', email })
      if (error) {
        console.error('Resend confirmation error:', error)
        return { error: error.message }
      }
      console.log('Resent confirmation:', data)
      return { status: 'sent' as const }
    } catch {
      console.error('Unexpected resend error')
      return { error: 'An unexpected error occurred' }
    }
  }

  async function signOut() {
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch {
      console.error('Sign out error')
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, resendConfirmation, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
