'use client'

import { useAuth } from '@/lib/auth-provider'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { User, BarChart3 as BarChartIcon, ArrowLeft, Save, Plus, X, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { supabase } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

interface Poll {
  id: string
  question: string
  options: string[]
  created_at: string
  expires_at: string | null
  is_active: boolean
}

export default function EditPollPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth()
  const router = useRouter()
  const [pollId, setPollId] = useState<string>('')
  const [poll, setPoll] = useState<Poll | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  // Form state
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState<string[]>([])
  const [expiresAt, setExpiresAt] = useState('')
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    params.then(({ id }) => {
      setPollId(id)
      if (user) {
        fetchPoll(id)
      }
    })
  }, [params, user])

  const fetchPoll = async (id: string) => {
    try {
      setLoading(true)
      setError('')
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setError('No active session found')
        return
      }

      const response = await fetch(`/api/polls/${id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch poll')
        return
      }

      const result = await response.json()
      const pollData = result.poll
      
      setPoll(pollData)
      setQuestion(pollData.question)
      setOptions(pollData.options)
      setExpiresAt(pollData.expires_at ? new Date(pollData.expires_at).toISOString().slice(0, 16) : '')
      setIsActive(pollData.is_active)
    } catch (error) {
      console.error('Error fetching poll:', error)
      setError('Failed to fetch poll')
    } finally {
      setLoading(false)
    }
  }

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ''])
    }
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index)
      setOptions(newOptions)
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!poll) return

    setSaving(true)
    setError('')

    try {
      // Validate form
      if (!question.trim() || question.trim().length < 5) {
        setError('Question must be at least 5 characters long')
        return
      }

      const validOptions = options.filter(option => option.trim().length > 0)
      if (validOptions.length < 2) {
        setError('At least 2 options are required')
        return
      }

      // Get session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setError('No active session found')
        return
      }

      // Update the poll
      const response = await fetch(`/api/polls/${pollId}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          question: question.trim(),
          options: validOptions,
          expires_at: expiresAt || null,
          is_active: isActive
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update poll')
        return
      }

      const result = await response.json()
      
      if (result.success) {
        toast.success('Poll updated successfully!')
        // Redirect back to polls page after a short delay
        setTimeout(() => {
          router.push('/dashboard/polls')
        }, 1500)
      } else {
        setError(result.error || 'Failed to update poll')
      }
    } catch (error) {
      console.error('Error updating poll:', error)
      setError('Failed to update poll. Please try again.')
    } finally {
      setSaving(false)
    }
  }

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
                  You must be logged in to edit polls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-red-600 font-medium">You must be logged in to edit polls</p>
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

  if (loading) {
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
                  <Link href="/dashboard/polls">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">My Polls</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading poll...</span>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !poll) {
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
                  <Link href="/dashboard/polls">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">My Polls</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-4xl mx-auto">
            <Card className="w-full max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-xl text-red-600">Error</CardTitle>
                <CardDescription>
                  {error || 'Failed to load poll'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-red-600 font-medium">{error || 'Failed to load poll'}</p>
                <div className="flex gap-3">
                  <Button asChild>
                    <Link href="/dashboard/polls">Back to My Polls</Link>
                  </Button>
                  <Button asChild variant="outline" onClick={() => fetchPoll(pollId)}>
                    Try Again
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
                <Link href="/dashboard/polls">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">My Polls</span>
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
            <h1 className="text-3xl font-bold tracking-tight">Edit Poll</h1>
            <p className="text-muted-foreground mt-2">
              Update your poll question, options, and settings
            </p>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSubmit}>
            <Card className="w-full max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Edit Poll</CardTitle>
                <CardDescription>
                  Make changes to your poll below. Click save when you&apos;re done.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Error Display */}
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                  </div>
                )}

                {/* Question Field */}
                <div className="space-y-2">
                  <Label htmlFor="question">Poll Question</Label>
                  <Textarea
                    id="question"
                    placeholder="What would you like to ask?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="min-h-[100px]"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum 5 characters required
                  </p>
                </div>

                {/* Options Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Poll Options</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addOption}
                      disabled={options.length >= 10}
                      className="inline-flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Option
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          required
                        />
                        {options.length > 2 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeOption(index)}
                            className="px-2"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    Minimum 2 options, maximum 10. Empty options will be removed.
                  </p>
                </div>

                {/* Poll Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Poll Settings</h3>
                  
                  {/* Expiration Date */}
                  <div className="space-y-2">
                    <Label htmlFor="expires_at">Expiration Date (Optional)</Label>
                    <Input
                      id="expires_at"
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty for no expiration
                    </p>
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center space-x-2">
                    <input
                      id="is_active"
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="is_active">Poll is active</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Inactive polls won&apos;t accept new votes
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                  >
                    <Link href="/dashboard/polls">Cancel</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </main>
    </div>
  )
}
