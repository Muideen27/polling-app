import { PollForm } from '@/components/PollForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
        <PollForm />
      </div>
    </main>
  )
}
