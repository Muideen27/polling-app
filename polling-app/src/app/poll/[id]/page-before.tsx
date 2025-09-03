// BEFORE SNAPSHOT – do not modify
// This is a snapshot of the poll page implementation before day 8 refactoring
// Created: Day 8 - Before refactoring

import { supabaseServer } from '@/lib/supabase-server'
import { submitVote } from '@/lib/actions/votes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Fingerprint } from '@/components/Fingerprint'
import { QR } from '@/components/QR'
import { CopyLink } from '@/components/CopyLink'
import { notFound } from 'next/navigation'

interface PollData {
  id: string
  question: string
  options: Array<{
    index: number
    text: string
    vote_count: number
  }>
  total_votes: number
}

async function getPollData(pollId: string): Promise<PollData | null> {
  const supabase = await supabaseServer()
  
  // Get poll details
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .select('id, question, options')
    .eq('id', pollId)
    .eq('is_active', true)
    .single()

  if (pollError || !poll) {
    return null
  }

  // Get vote counts for each option
  const { data: votes, error: votesError } = await supabase
    .from('votes')
    .select('option_index')
    .eq('poll_id', pollId)

  if (votesError) {
    console.error('Error fetching votes:', votesError)
    return null
  }

  // Count votes per option
  const voteCounts: { [key: number]: number } = {}
  votes?.forEach(vote => {
    voteCounts[vote.option_index] = (voteCounts[vote.option_index] || 0) + 1
  })

  const totalVotes = votes?.length || 0

  // Build options with vote counts
  const optionsWithVotes = poll.options.map((optionText: string, index: number) => ({
    index,
    text: optionText,
    vote_count: voteCounts[index] || 0
  }))

  return {
    id: poll.id,
    question: poll.question,
    options: optionsWithVotes,
    total_votes: totalVotes
  }
}

export default async function PollPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const pollData = await getPollData(id)

  if (!pollData) {
    notFound()
  }

  const pollUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/poll/${id}`

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center">
            <h1 className="text-xl font-bold text-foreground">Polling App</h1>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Poll Question */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl leading-tight">
                {pollData.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Voting Form */}
              <form action={submitVote} className="space-y-6">
                <input type="hidden" name="pollId" value={pollData.id} />
                <Fingerprint />
                
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">Select your answer:</p>
                  {pollData.options.map((option) => (
                    <div key={option.index} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id={`option-${option.index}`}
                        name="optionId"
                        value={option.index}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                        required
                      />
                      <label
                        htmlFor={`option-${option.index}`}
                        className="text-sm font-medium text-foreground cursor-pointer flex-1"
                      >
                        {option.text}
                      </label>
                    </div>
                  ))}
                </div>

                <Button type="submit" className="w-full">
                  Submit Vote
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Results</CardTitle>
              <p className="text-sm text-muted-foreground">
                {pollData.total_votes} {pollData.total_votes === 1 ? 'vote' : 'votes'} total
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {pollData.options.map((option) => {
                const percentage = pollData.total_votes > 0 
                  ? Math.round((option.vote_count / pollData.total_votes) * 100) 
                  : 0

                return (
                  <div key={option.index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-foreground">
                        {option.text}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {option.vote_count} votes ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Sharing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Share This Poll</CardTitle>
              <p className="text-sm text-muted-foreground">
                Share this poll with others to collect more votes
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground mb-2">Poll Link:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={pollUrl}
                      readOnly
                      className="flex-1 px-3 py-2 text-sm border border-input rounded-md bg-muted"
                    />
                    <CopyLink url={pollUrl} />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center space-y-4">
                <p className="text-sm font-medium text-foreground">QR Code:</p>
                <div className="p-4 bg-white rounded-lg border border-border">
                  <QR url={pollUrl} size={150} />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Scan to open poll on mobile devices
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
