import { supabaseServer } from '@/lib/supabase-server'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, BarChart3 as BarChartIcon, PlusCircle, ArrowLeft } from 'lucide-react'
import { PollCard } from './PollCard'

interface Poll {
  id: string
  question: string
  options: string[]
  created_at: string
  is_active: boolean
}

export default async function MyPollsPage() {
  const supabase = await supabaseServer()
  
  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return (
      <div className="min-h-screen bg-background">
        {/* Top Navigation Bar */}
        <nav className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Left side - Brand */}
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <BarChartIcon className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">Polling App</span>
              </div>
              
              {/* Right side - Login/Register */}
              <div className="flex items-center space-x-4">
                <Button asChild variant="outline" size="sm">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/auth/register">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-4xl mx-auto">
            <Card className="w-full max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-xl text-red-600">Access Denied</CardTitle>
                <CardDescription>
                  You must be logged in to view your polls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-red-600 font-medium">You must be logged in to view your polls</p>
                <div className="flex gap-3">
                  <Button asChild>
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/auth/register">Create Account</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  // Fetch polls for the current user
  const { data: polls, error: pollsError } = await supabase
    .from('polls')
    .select('id, question, options, created_at, is_active')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const fullName = (user?.user_metadata?.full_name as string) || (user?.user_metadata?.name as string) || ''

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <nav className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left side - Brand */}
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <BarChartIcon className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Polling App</span>
            </div>
            
            {/* Right side - User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground hidden sm:block">
                  {fullName || user?.email?.split('@')[0] || 'User'}
                </span>
              </div>
              <Button asChild variant="outline" size="sm" className="inline-flex items-center gap-2">
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">My Polls</h1>
            <p className="text-muted-foreground mt-2">
              View and manage all your created polls
            </p>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <Button asChild>
              <Link href="/dashboard/create" className="inline-flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Create New Poll
              </Link>
            </Button>
          </div>

          {/* Error Message */}
          {pollsError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">Failed to load polls: {pollsError.message}</p>
            </div>
          )}

          {/* Polls Grid */}
          <div className="space-y-6">
            {!polls || polls.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">No polls yet</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    You haven&apos;t created any polls yet. Start by creating your first poll!
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/create">Create Your First Poll</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {polls.map((poll) => (
                  <PollCard key={poll.id} poll={poll} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
