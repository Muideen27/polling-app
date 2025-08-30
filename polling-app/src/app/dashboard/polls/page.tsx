'use client'

import { useAuth } from '@/lib/auth-provider'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, BarChart3 as BarChartIcon, PlusCircle, ArrowLeft } from 'lucide-react'

export default function MyPollsPage() {
  const { user } = useAuth()

  const fullName = (user?.user_metadata?.full_name as string) || (user?.user_metadata?.name as string) || ''

  if (!user) {
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
        <div className="max-w-4xl mx-auto">
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

          {/* Polls List */}
          <div className="space-y-4">
            {/* Placeholder for when no polls exist */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">No polls yet</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  You haven't created any polls yet. Start by creating your first poll!
                </p>
                <Button asChild>
                  <Link href="/dashboard/create">Create Your First Poll</Link>
                </Button>
              </CardContent>
            </Card>

            {/* TODO: Add actual polls list here when polls are created */}
            {/* Example structure for future implementation:
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What's your favorite programming language?</CardTitle>
                <p className="text-sm text-muted-foreground">Created 2 days ago • 15 votes</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>JavaScript</span>
                    <span className="text-primary font-medium">8 votes (53%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Python</span>
                    <span className="text-primary font-medium">4 votes (27%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>TypeScript</span>
                    <span className="text-primary font-medium">3 votes (20%)</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm">View Results</Button>
                  <Button variant="outline" size="sm">Share Poll</Button>
                </div>
              </CardContent>
            </Card>
            */}
          </div>
        </div>
      </main>
    </div>
  )
}
