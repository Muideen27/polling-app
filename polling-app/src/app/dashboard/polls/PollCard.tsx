'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Eye, Loader2 } from 'lucide-react'
import { deletePoll } from '@/lib/actions/polls'
import toast from 'react-hot-toast'

interface Poll {
  id: string
  question: string
  options: string[]
  created_at: string
  is_active: boolean
}

interface PollCardProps {
  poll: Poll
}

export function PollCard({ poll }: PollCardProps) {
  const [isViewing, setIsViewing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleViewPoll = () => {
    setIsViewing(true)
    // The navigation will happen automatically via Link
    // Reset loading state after a short delay
    setTimeout(() => setIsViewing(false), 1000)
  }

  const handleDelete = async (formData: FormData) => {
    try {
      setIsDeleting(true)
      await deletePoll(formData)
      toast.success('Poll deleted successfully!')
    } catch (error) {
      console.error('Error deleting poll:', error)
      toast.error('Failed to delete poll. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg leading-tight line-clamp-2">
          {poll.question}
        </CardTitle>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{poll.options.length} options</span>
          <span>{formatDate(poll.created_at)}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            asChild
            disabled={isViewing}
          >
            <Link href={`/poll/${poll.id}`} onClick={handleViewPoll}>
              {isViewing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </>
              )}
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            asChild
          >
            <Link href={`/dashboard/polls/${poll.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <form action={handleDelete} className="flex-1">
            <input type="hidden" name="pollId" value={poll.id} />
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              className="w-full"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
