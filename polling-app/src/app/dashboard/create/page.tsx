'use client'

import { useAuth } from '@/lib/auth-provider'
import Link from 'next/link'
import { ArrowLeft, Plus, X, User, BarChart3 as BarChartIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'
import { createPoll } from '@/lib/actions/polls'

export default function CreatePollPage() {
  const { user } = useAuth()
  const [options, setOptions] = useState(['', '', '', '']) // Start with 4 required options

  const fullName = (user?.user_metadata?.full_name as string) || (user?.user_metadata?.name as string) || ''

  // Check if user is logged in
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
                  You must be logged in to create a poll
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-red-600 font-medium">You must be logged in to create a poll</p>
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

  const addOption = () => {
    if (options.length < 10) { // Maximum 10 options
      setOptions([...options, ''])
    }
  }

  const removeOption = (index: number) => {
    if (options.length > 2) { // Keep minimum 2 options
      const newOptions = options.filter((_, i) => i !== index)
      setOptions(newOptions)
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = async (formData: FormData) => {
    // Add the current options to the form data
    options.forEach((option, index) => {
      if (option.trim()) {
        formData.append(`option_${index}`, option.trim())
      }
    })
    
    // Call the Server Action
    await createPoll(formData)
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
            <h1 className="text-3xl font-bold tracking-tight">Create New Poll</h1>
            <p className="text-muted-foreground mt-2">
              Create engaging polls and share them with others to gather opinions and insights.
            </p>
          </div>



          {/* Poll Form */}
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Create New Poll</CardTitle>
              <CardDescription>
                Create a poll with a question and multiple options for others to vote on
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={handleSubmit} className="space-y-6">
                {/* Question Field */}
                <div className="space-y-2">
                  <Label htmlFor="question" className="text-sm font-medium">
                    Poll Question *
                  </Label>
                  <Textarea
                    id="question"
                    name="question"
                    placeholder="What would you like to ask?"
                    className="min-h-[100px]"
                    required

                  />
                </div>

                {/* Options Fields */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Poll Options * (at least 2, maximum 10)
                  </Label>
                  <div className="space-y-3">
                    {options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          name={`option_${index}`}
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          className="flex-1"
                          required={index < 2}
                        />
                        {options.length > 2 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeOption(index)}
                            className="shrink-0"
                            title="Remove option"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Add Option Button */}
                  {options.length < 10 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addOption}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Option
                    </Button>
                  )}
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full">
                  Create Poll
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
