'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Save, Plus, X } from 'lucide-react'
import { updatePoll } from '@/lib/actions/polls'

interface Poll {
  id: string
  question: string
  options: string[]
  created_at: string
  expires_at: string | null
  is_active: boolean
}

interface EditPollFormProps {
  poll: Poll
}

export function EditPollForm({ poll }: EditPollFormProps) {
  const [options, setOptions] = useState(poll.options.length >= 4 ? poll.options : [...poll.options, ...Array(4 - poll.options.length).fill('')])
  const [error, setError] = useState('')

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

  const handleSubmit = async (formData: FormData) => {
    // Add the current options to the form data
    options.forEach((option, index) => {
      if (option.trim()) {
        formData.append(`option_${index}`, option.trim())
      }
    })
    
    // Call the Server Action
    const result = await updatePoll(poll.id, formData)
    
    if (!result.ok) {
      setError(result.error)
    }
  }

  return (
    <form action={handleSubmit}>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Poll</CardTitle>
          <CardDescription>
            Make changes to your poll below. Click save when you&apos;re done.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error Display with aria-live region */}
          <div aria-live="polite" aria-atomic="true">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md" role="alert">
                {error}
              </div>
            )}
          </div>

          {/* Question Field */}
          <div className="space-y-2">
            <Label htmlFor="question">Poll Question</Label>
            <Textarea
              id="question"
              name="question"
              placeholder="What would you like to ask?"
              defaultValue={poll.question}
              className="min-h-[100px]"
              required
              aria-describedby="question-help"
              minLength={5}
            />
            <p id="question-help" className="text-xs text-muted-foreground">
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
                aria-label="Add new option"
              >
                <Plus className="h-4 w-4" />
                Add Option
              </Button>
            </div>
            
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    id={`option-${index}`}
                    name={`option_${index}`}
                    placeholder={`Option ${index + 1}`}
                    defaultValue={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    required
                    aria-describedby="options-help"
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="px-2"
                      aria-label={`Remove option ${index + 1}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            <p id="options-help" className="text-xs text-muted-foreground">
              Minimum 2 options, maximum 10. Empty options will be removed. Duplicate options are not allowed.
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
                name="expires_at"
                type="datetime-local"
                defaultValue={poll.expires_at ? new Date(poll.expires_at).toISOString().slice(0, 16) : ''}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for no expiration
              </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-2">
              <input
                id="is_active"
                name="is_active"
                type="checkbox"
                defaultChecked={poll.is_active}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                aria-describedby="active-help"
              />
              <Label htmlFor="is_active">Poll is active</Label>
            </div>
            <p id="active-help" className="text-xs text-muted-foreground">
              Inactive polls won&apos;t accept new votes
            </p>
          </div>

        </CardContent>
        <CardFooter className="flex gap-3">
          <Button
            type="submit"
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
          
          <Button
            type="button"
            variant="outline"
            asChild
          >
            <a href="/dashboard/polls">Cancel</a>
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
