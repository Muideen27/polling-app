'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '@/lib/auth-provider'
import { createPoll } from '@/lib/actions/polls'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, X, AlertCircle, Loader2 } from 'lucide-react'

const schema = z.object({
  question: z.string().min(10, 'Question must be at least 10 characters').max(200, 'Question must be less than 200 characters'),
  options: z.array(z.string().min(2, 'Option must be at least 2 characters').max(100, 'Option must be less than 100 characters')).min(2, 'At least 2 options are required').max(10, 'Maximum 10 options allowed'),
}).superRefine((data, ctx) => {
  // Ensure all options are unique
  const uniqueOptions = new Set(data.options.filter(opt => opt.trim().length > 0))
  if (uniqueOptions.size !== data.options.filter(opt => opt.trim().length > 0).length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'All options must be unique',
      path: ['options'],
    })
  }
  
  // Ensure at least 2 non-empty options
  const validOptions = data.options.filter(opt => opt.trim().length > 0)
  if (validOptions.length < 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'At least 2 options are required',
      path: ['options'],
    })
  }
})

type FormData = z.infer<typeof schema>

export function PollForm() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [optionCount, setOptionCount] = useState(2)

  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    watch,
    setValue,
    trigger,
    reset
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      question: '',
      options: ['', '']
    }
  })

  const watchedOptions = watch('options', ['', ''])

  const addOption = () => {
    if (optionCount < 10) {
      setOptionCount(prev => prev + 1)
      const newOptions = [...watchedOptions, '']
      setValue('options', newOptions)
    }
  }

  const removeOption = (index: number) => {
    if (optionCount > 2) {
      const newOptions = watchedOptions.filter((_, i) => i !== index)
      setOptionCount(prev => prev - 1)
      setValue('options', newOptions)
      trigger('options')
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...watchedOptions]
    newOptions[index] = value
    setValue('options', newOptions)
    trigger('options')
  }

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast.error('You must be logged in to create a poll')
      return
    }

    setLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('question', data.question)
      formData.append('user_id', user.id)
      
      // Add only non-empty options
      data.options.forEach(option => {
        if (option.trim()) {
          formData.append('options', option.trim())
        }
      })

      const result = await createPoll(formData)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Poll created successfully!')
        reset()
        setOptionCount(2)
      }
    } catch (error) {
      toast.error('Failed to create poll. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Please log in to create polls
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Poll</CardTitle>
        <CardDescription>
          Create a poll with a question and multiple options for others to vote on
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Question Field */}
          <div className="space-y-2">
            <Label htmlFor="question" className="text-sm font-medium">
              Poll Question *
            </Label>
            <Textarea
              id="question"
              placeholder="What would you like to ask?"
              className={`min-h-[100px] ${errors.question ? 'border-red-500 focus:ring-red-500' : ''}`}
              disabled={loading}
              {...register('question')}
            />
            {errors.question && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.question.message}
              </div>
            )}
          </div>

          {/* Options Fields */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Poll Options * (at least 2)
            </Label>
            <div className="space-y-3">
              {Array.from({ length: optionCount }).map((_, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={watchedOptions[index] || ''}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className={`flex-1 ${errors.options?.[index] ? 'border-red-500 focus:ring-red-500' : ''}`}
                    disabled={loading}
                  />
                  {optionCount > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeOption(index)}
                      disabled={loading}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            {/* Add Option Button */}
            {optionCount < 10 && (
              <Button
                type="button"
                variant="outline"
                onClick={addOption}
                disabled={loading}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            )}

            {/* Options Error */}
            {errors.options && typeof errors.options === 'object' && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.options.message}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Poll...
              </>
            ) : (
              'Create Poll'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
