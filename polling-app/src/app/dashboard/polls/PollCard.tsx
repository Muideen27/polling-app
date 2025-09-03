'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Edit, Trash2, Eye, Loader2, AlertTriangle, Copy, QrCode } from 'lucide-react'
import { deletePoll } from '@/lib/actions/polls'
import { CopyLink } from '@/components/CopyLink'
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  
  const pollUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/poll/${poll.id}`

  const handleViewPoll = () => {
    setIsViewing(true)
    // The navigation will happen automatically via Link
    // Reset loading state after a short delay
    setTimeout(() => setIsViewing(false), 1000)
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
    setConfirmText('')
  }

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false)
    setConfirmText('')
  }

  const handleDeleteConfirm = async () => {
    if (confirmText.trim() !== poll.question.trim()) {
      toast.error('Please retype the poll question exactly to confirm deletion.')
      return
    }

    try {
      setIsDeleting(true)
      const formData = new FormData()
      formData.append('pollId', poll.id)
      await deletePoll(formData)
      toast.success('Poll deleted successfully!')
      setShowDeleteConfirm(false)
      setConfirmText('')
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
        {!showDeleteConfirm ? (
          <div className="space-y-3">
            {/* Main action buttons */}
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
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={handleDeleteClick}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
            
            {/* Sharing buttons */}
            <div className="flex gap-2">
              <CopyLink url={pollUrl} />
              <Button
                variant="outline"
                size="sm"
                asChild
                className="flex-1"
              >
                <Link href={`/poll/${poll.id}`}>
                  <QrCode className="h-4 w-4 mr-2" />
                  Show QR
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Confirm Deletion</span>
            </div>
            <p className="text-sm text-red-700">
              This action cannot be undone. To confirm deletion, please retype the poll question exactly:
            </p>
            <div className="space-y-2">
              <Label htmlFor="confirm-text" className="text-sm font-medium text-red-800">
                Poll Question:
              </Label>
              <Input
                id="confirm-text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Retype the poll question to confirm deletion"
                className="border-red-300 focus:border-red-500 focus:ring-red-500"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteCancel}
                className="flex-1"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteConfirm}
                className="flex-1"
                disabled={isDeleting || confirmText.trim() !== poll.question.trim()}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Poll
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
