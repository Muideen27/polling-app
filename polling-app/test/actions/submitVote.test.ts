import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock supabaseServer
vi.mock('@/lib/supabase-server', () => ({
  supabaseServer: vi.fn(() => Promise.resolve({
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        error: null
      }))
    }))
  }))
}))

// Mock revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}))

// Import after mocks
import { submitVote } from '@/lib/actions/votes'
import { supabaseServer } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

describe('submitVote', () => {
  const mockRevalidatePath = vi.mocked(revalidatePath)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should successfully submit a vote', async () => {
    // Arrange
    const mockSupabase = {
      from: vi.fn(() => ({
        insert: vi.fn(() => ({
          error: null
        }))
      }))
    }
    vi.mocked(supabaseServer).mockResolvedValue(mockSupabase as any)
    
    const formData = new FormData()
    formData.append('pollId', 'test-poll-id')
    formData.append('optionId', '1')
    formData.append('fingerprint', 'test-fingerprint')

    // Act
    const result = await submitVote(formData)

    // Assert
    expect(result).toEqual({ ok: true })
    expect(mockSupabase.from).toHaveBeenCalledWith('votes')
    expect(mockSupabase.from().insert).toHaveBeenCalledWith({
      poll_id: 'test-poll-id',
      option_index: 1,
      voter_fingerprint: 'test-fingerprint'
    })
    expect(mockRevalidatePath).toHaveBeenCalledWith('/poll/test-poll-id')
  })

  it('should return error for missing pollId', async () => {
    // Arrange
    const formData = new FormData()
    formData.append('optionId', '1')
    formData.append('fingerprint', 'test-fingerprint')

    // Act
    const result = await submitVote(formData)

    // Assert
    expect(result).toEqual({ ok: false, error: 'Missing required fields' })
    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })

  it('should return error for missing optionId', async () => {
    // Arrange
    const formData = new FormData()
    formData.append('pollId', 'test-poll-id')
    formData.append('fingerprint', 'test-fingerprint')

    // Act
    const result = await submitVote(formData)

    // Assert
    expect(result).toEqual({ ok: false, error: 'Missing required fields' })
    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })

  it('should return error for missing fingerprint', async () => {
    // Arrange
    const formData = new FormData()
    formData.append('pollId', 'test-poll-id')
    formData.append('optionId', '1')

    // Act
    const result = await submitVote(formData)

    // Assert
    expect(result).toEqual({ ok: false, error: 'Missing required fields' })
    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })

  it('should handle duplicate vote conflict', async () => {
    // Arrange
    const formData = new FormData()
    formData.append('pollId', 'test-poll-id')
    formData.append('optionId', '1')
    formData.append('fingerprint', 'test-fingerprint')

    // Mock duplicate vote error (PostgreSQL unique constraint violation)
    const mockInsert = vi.fn(() => ({
      error: { code: '23505', message: 'duplicate key value violates unique constraint' }
    }))
    const mockSupabase = {
      from: vi.fn(() => ({
        insert: mockInsert
      }))
    }
    vi.mocked(supabaseServer).mockResolvedValue(mockSupabase as any)

    // Act
    const result = await submitVote(formData)

    // Assert
    expect(result).toEqual({ ok: false, error: "You've already voted." })
    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })

  it('should handle database errors', async () => {
    // Arrange
    const formData = new FormData()
    formData.append('pollId', 'test-poll-id')
    formData.append('optionId', '1')
    formData.append('fingerprint', 'test-fingerprint')

    // Mock database error
    const mockInsert = vi.fn(() => ({
      error: { code: '42P01', message: 'relation "votes" does not exist' }
    }))
    const mockSupabase = {
      from: vi.fn(() => ({
        insert: mockInsert
      }))
    }
    vi.mocked(supabaseServer).mockResolvedValue(mockSupabase as any)

    // Act
    const result = await submitVote(formData)

    // Assert
    expect(result).toEqual({ ok: false, error: 'Failed to submit vote' })
    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })

  it('should handle unexpected errors', async () => {
    // Arrange
    const formData = new FormData()
    formData.append('pollId', 'test-poll-id')
    formData.append('optionId', '1')
    formData.append('fingerprint', 'test-fingerprint')

    // Mock unexpected error
    const mockSupabase = {
      from: vi.fn(() => {
        throw new Error('Unexpected error')
      })
    }
    vi.mocked(supabaseServer).mockResolvedValue(mockSupabase as any)

    // Act
    const result = await submitVote(formData)

    // Assert
    expect(result).toEqual({ ok: false, error: 'An unexpected error occurred' })
    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })

  it('should parse optionId as integer', async () => {
    // Arrange
    const mockSupabase = {
      from: vi.fn(() => ({
        insert: vi.fn(() => ({
          error: null
        }))
      }))
    }
    vi.mocked(supabaseServer).mockResolvedValue(mockSupabase as any)
    
    const formData = new FormData()
    formData.append('pollId', 'test-poll-id')
    formData.append('optionId', '2')
    formData.append('fingerprint', 'test-fingerprint')

    // Act
    const result = await submitVote(formData)

    // Assert
    expect(result).toEqual({ ok: true })
    expect(mockSupabase.from().insert).toHaveBeenCalledWith({
      poll_id: 'test-poll-id',
      option_index: 2, // Should be parsed as integer
      voter_fingerprint: 'test-fingerprint'
    })
  })
})