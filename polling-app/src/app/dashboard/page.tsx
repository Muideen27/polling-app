'use client'
import { useAuth } from '@/lib/auth-provider'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Settings, LogOut, PlusCircle, BarChart3, BarChart3 as BarChartIcon } from 'lucide-react'

export default function DashboardPage() {
const { user, signOut } = useAuth()

const fullName = (user?.user_metadata?.full_name as string) || (user?.user_metadata?.name as string) || ''

if (!user) {
return (
<main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
  <Card className="max-w-xl mx-auto">
    <CardHeader>
      <CardTitle className="text-xl">You are not signed in</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <p className="text-sm text-muted-foreground">Please sign in to access your dashboard.</p>
      <div className="flex gap-3">
        <Link href="/auth/login" className="underline">Login</Link>
        <Link href="/auth/register" className="underline">Create account</Link>
      </div>
    </CardContent>
  </Card>
</main>
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
              {fullName || user.email?.split('@')[0] || 'User'}
            </span>
          </div>
          <Button onClick={() => signOut()} variant="outline" size="sm" className="inline-flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>
    </div>
  </nav>

  <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
    {/* Welcome */}
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Welcome{fullName ? `, ${fullName}` : ''}
        </h1>
        <p className="text-sm text-muted-foreground">Manage your polls, view results, and update your account.</p>
      </div>
    </div>

    {/* Quick actions */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Create a poll</CardTitle>
          <PlusCircle className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">Start a new poll and share it instantly.</p>
          <Button asChild className="w-full">
            <Link href="/dashboard/create">New Poll</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">My polls</CardTitle>
          <BarChart3 className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">View all your created polls and their results.</p>
          <div className="mt-2">
            <Link href="/dashboard/polls" className="text-sm underline">View my polls</Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Account</CardTitle>
          <User className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Update your profile and preferences.</p>
          <div className="mt-2">
            <a href="#account-settings" className="text-sm underline">Edit settings</a>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Account settings */}
    <Card id="account-settings" className="">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Account settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Full name</p>
            <p className="text-sm font-medium">{fullName || '—'}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Email</p>
            <p className="text-sm font-medium">{user.email}</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs uppercase text-muted-foreground">User ID</p>
            <p className="text-sm font-mono break-all">{user.id}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Status</p>
            <p className="text-sm font-medium">{user.email_confirmed_at ? 'Email confirmed' : 'Pending confirmation'}</p>
          </div>
        </div>
        <div className="pt-2">
          <Button variant="outline" className="inline-flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Manage profile
          </Button>
        </div>
      </CardContent>
    </Card>
  </main>
</div>
)
}
