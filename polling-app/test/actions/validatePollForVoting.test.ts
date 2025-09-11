import { describe, it, expect, vi, beforeEach } from 'vitest'
import { validatePollForVoting } from '@/lib/actions/polls'

// Mock the supabaseServer function
vi.mock('@/lib/supabase-server', () => ({
  supabaseServer: vi.fn()
}))

describe('validatePollForVoting', () => {
  let mockSupabase: any

  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Create a fresh mock for each test
    mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn()
          }))
        }))
      }))
    }
    
    const { supabaseServer } = await import('@/lib/supabase-server')
    vi.mocked(supabaseServer).mockResolvedValue(mockSupabase)
  })

  it('should allow voting on active, non-expired polls', async () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1) // Tomorrow
    
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: {
        id: 'test-poll-id',
        is_active: true,
        expires_at: futureDate.toISOString()
      },
      error: null
    })

    const result = await validatePollForVoting('test-poll-id')
    
    expect(result).toEqual({ canVote: true })
  })

  it('should block voting on inactive polls', async () => {
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: {
        id: 'test-poll-id',
        is_active: false,
        expires_at: null
      },
      error: null
    })

    const result = await validatePollForVoting('test-poll-id')
    
    expect(result).toEqual({ 
      canVote: false, 
      error: 'This poll is no longer active' 
    })
  })

  it('should block voting on expired polls', async () => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 1) // Yesterday
    
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: {
        id: 'test-poll-id',
        is_active: true,
        expires_at: pastDate.toISOString()
      },
      error: null
    })

    const result = await validatePollForVoting('test-poll-id')
    
    expect(result).toEqual({ 
      canVote: false, 
      error: 'This poll has expired' 
    })
  })

  it('should allow voting on polls without expiration date', async () => {
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: {
        id: 'test-poll-id',
        is_active: true,
        expires_at: null
      },
      error: null
    })

    const result = await validatePollForVoting('test-poll-id')
    
    expect(result).toEqual({ canVote: true })
  })

  it('should handle poll not found error', async () => {
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: null,
      error: { message: 'Poll not found' }
    })

    const result = await validatePollForVoting('non-existent-poll')
    
    expect(result).toEqual({ 
      canVote: false, 
      error: 'Poll not found' 
    })
  })

  it('should handle database errors gracefully', async () => {
    mockSupabase.from().select().eq().single.mockRejectedValue(
      new Error('Database connection failed')
    )

    const result = await validatePollForVoting('test-poll-id')
    
    expect(result).toEqual({ 
      canVote: false, 
      error: 'Unable to validate poll status' 
    })
  })
})
