import { createPoll } from '@/lib/actions/polls'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function CreatePollPage() {
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
            <form action={createPoll} className="space-y-6">
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
                  Poll Options * (at least 2)
                </Label>
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        name={`option_${index}`}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1"
                        required={index < 2}
                      />
                    </div>
                  ))}
                </div>
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
