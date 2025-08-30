'use client'

import { createPoll } from '@/lib/actions/polls'
import Link from 'next/link'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'

export default function CreatePollPage() {
  const [options, setOptions] = useState(['', '']) // Start with 2 required options

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
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/dashboard" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
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
  )
}
