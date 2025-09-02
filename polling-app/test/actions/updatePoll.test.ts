import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock supabase-server
vi.mock('@/lib/supabase-server', () => ({
  supabaseServer: vi.fn()
}))

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}))

import { updatePoll } from '@/lib/actions/polls'
import { supabaseServer } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

// Get mocked functions
const mockSupabaseServer = vi.mocked(supabaseServer)
const mockRevalidatePath = vi.mocked(revalidatePath)

describe('updatePoll', () => {
  const mockSupabaseClient = {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mock
    mockSupabaseServer.mockResolvedValue(mockSupabaseClient as any)
    
    // Default mock user
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'u1' } },
      error: null
    })
  })

  describe('happy path', () => {
    it('should update poll successfully with valid question and options (deduped, trimmed, capped ≤ 10)', async () => {
      // Arrange
      const pollId = 'poll-123'
      const formData = new FormData()
      formData.append('question', '  What is your favorite programming language?  ')
      formData.append('option_0', '  TypeScript  ')
      formData.append('option_1', '  JavaScript  ')
      formData.append('option_2', '  Python  ')
      formData.append('option_3', '  Rust  ')
      formData.append('option_4', '  Go  ')
      formData.append('option_5', '  Java  ')
      formData.append('option_6', '  C++  ')
      formData.append('option_7', '  C#  ')
      formData.append('option_8', '  PHP  ')
      formData.append('option_9', '  Ruby  ')

      // Mock existing poll fetch
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: pollId, user_id: 'u1' },
              error: null
            })
          })
        })
      })

      // Mock poll update
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: { id: pollId },
            error: null
          })
        })
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'polls') {
          return {
            select: mockSelect,
            update: mockUpdate
          }
        }
        return {}
      })

      // Act
      const result = await updatePoll(pollId, formData)

      // Assert
      expect(result).toEqual({ ok: true, data: { id: pollId } })
      
      // Verify poll ownership check
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('polls')
      expect(mockSelect).toHaveBeenCalledWith('id, user_id')
      expect(mockSelect().eq().eq().single).toHaveBeenCalled()
      
      // Verify poll update
      expect(mockUpdate).toHaveBeenCalledWith({
        question: 'What is your favorite programming language?',
        options: ['TypeScript', 'JavaScript', 'Python', 'Rust', 'Go', 'Java', 'C++', 'C#', 'PHP', 'Ruby'],
        updated_at: expect.any(String)
      })
      expect(mockUpdate().eq().eq).toHaveBeenCalledWith('user_id', 'u1')
      
      // Verify revalidatePath is called on success
      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/polls')
    })

    it('should handle fewer than 10 options correctly', async () => {
      // Arrange
      const pollId = 'poll-456'
      const formData = new FormData()
      formData.append('question', 'What is your favorite color?')
      formData.append('option_0', 'Red')
      formData.append('option_1', 'Blue')
      formData.append('option_2', 'Green')

      // Mock existing poll fetch
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: pollId, user_id: 'u1' },
              error: null
            })
          })
        })
      })

      // Mock poll update
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: { id: pollId },
            error: null
          })
        })
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'polls') {
          return {
            select: mockSelect,
            update: mockUpdate
          }
        }
        return {}
      })

      // Act
      const result = await updatePoll(pollId, formData)

      // Assert
      expect(result).toEqual({ ok: true, data: { id: pollId } })
      expect(mockUpdate).toHaveBeenCalledWith({
        question: 'What is your favorite color?',
        options: ['Red', 'Blue', 'Green'],
        updated_at: expect.any(String)
      })
      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/polls')
    })
  })

  describe('edge cases', () => {
    it('should return error when options resolve to fewer than 2 after trimming/dedup and not call revalidatePath', async () => {
      // Arrange
      const pollId = 'poll-789'
      const formData = new FormData()
      formData.append('question', 'What is your favorite food?')
      formData.append('option_0', '  Pizza  ')
      formData.append('option_1', '  ')
      formData.append('option_2', '')
      formData.append('option_3', '   ')

      // Act
      const result = await updatePoll(pollId, formData)

      // Assert
      expect(result).toEqual({ 
        ok: false, 
        error: 'At least 2 options are required' 
      })
      
      // Verify no database calls were made
      expect(mockSupabaseClient.from).not.toHaveBeenCalled()
      
      // Verify revalidatePath was NOT called on error
      expect(mockRevalidatePath).not.toHaveBeenCalled()
    })

    it('should return error for duplicate options (case-insensitive)', async () => {
      // Arrange
      const pollId = 'poll-999'
      const formData = new FormData()
      formData.append('question', 'What is your favorite fruit?')
      formData.append('option_0', 'Apple')
      formData.append('option_1', 'apple')
      formData.append('option_2', 'Banana')

      // Act
      const result = await updatePoll(pollId, formData)

      // Assert
      expect(result).toEqual({ 
        ok: false, 
        error: 'Duplicate options are not allowed' 
      })
      
      // Verify no database calls were made
      expect(mockSupabaseClient.from).not.toHaveBeenCalled()
      
      // Verify revalidatePath was NOT called on error
      expect(mockRevalidatePath).not.toHaveBeenCalled()
    })

    it('should handle exactly 10 options correctly', async () => {
      // Arrange
      const pollId = 'poll-888'
      const formData = new FormData()
      
      // Add exactly 10 options (the maximum allowed)
      for (let i = 0; i < 10; i++) {
        formData.append(`option_${i}`, `Option ${i + 1}`)
      }
      formData.append('question', 'What is your favorite number?')

      // Mock existing poll fetch
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: pollId, user_id: 'u1' },
              error: null
            })
          })
        })
      })

      // Mock poll update
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: { id: pollId },
            error: null
          })
        })
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'polls') {
          return {
            select: mockSelect,
            update: mockUpdate
          }
        }
        return {}
      })

      // Act
      const result = await updatePoll(pollId, formData)

      // Assert
      expect(result).toEqual({ 
        ok: true, 
        data: { id: pollId } 
      })
      
      // Verify poll update with all 10 options
      expect(mockUpdate).toHaveBeenCalledWith({
        question: 'What is your favorite number?',
        options: ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5', 'Option 6', 'Option 7', 'Option 8', 'Option 9', 'Option 10'],
        updated_at: expect.any(String)
      })
      
      // Verify revalidatePath is called on success
      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/polls')
    })

    it('should return error for question too short', async () => {
      // Arrange
      const pollId = 'poll-777'
      const formData = new FormData()
      formData.append('question', 'Hi')
      formData.append('option_0', 'Option 1')
      formData.append('option_1', 'Option 2')

      // Act
      const result = await updatePoll(pollId, formData)

      // Assert
      expect(result).toEqual({ 
        ok: false, 
        error: 'Question must be at least 5 characters long' 
      })
      
      // Verify no database calls were made
      expect(mockSupabaseClient.from).not.toHaveBeenCalled()
      
      // Verify revalidatePath was NOT called on error
      expect(mockRevalidatePath).not.toHaveBeenCalled()
    })

    it('should return error for empty question', async () => {
      // Arrange
      const pollId = 'poll-666'
      const formData = new FormData()
      formData.append('question', '')
      formData.append('option_0', 'Option 1')
      formData.append('option_1', 'Option 2')

      // Act
      const result = await updatePoll(pollId, formData)

      // Assert
      expect(result).toEqual({ 
        ok: false, 
        error: 'Question must be at least 5 characters long' 
      })
      
      // Verify no database calls were made
      expect(mockSupabaseClient.from).not.toHaveBeenCalled()
      
      // Verify revalidatePath was NOT called on error
      expect(mockRevalidatePath).not.toHaveBeenCalled()
    })
  })

  describe('authentication errors', () => {
    it('should return error when user is not logged in', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      const pollId = 'poll-555'
      const formData = new FormData()
      formData.append('question', 'What is your favorite color?')
      formData.append('option_0', 'Red')
      formData.append('option_1', 'Blue')

      // Act
      const result = await updatePoll(pollId, formData)

      // Assert
      expect(result).toEqual({ 
        ok: false, 
        error: 'You must be logged in to update polls' 
      })
      
      // Verify no database calls were made
      expect(mockSupabaseClient.from).not.toHaveBeenCalled()
      
      // Verify revalidatePath was NOT called on error
      expect(mockRevalidatePath).not.toHaveBeenCalled()
    })

    it('should return error when auth getUser fails', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Auth error' }
      })

      const pollId = 'poll-444'
      const formData = new FormData()
      formData.append('question', 'What is your favorite color?')
      formData.append('option_0', 'Red')
      formData.append('option_1', 'Blue')

      // Act
      const result = await updatePoll(pollId, formData)

      // Assert
      expect(result).toEqual({ 
        ok: false, 
        error: 'You must be logged in to update polls' 
      })
      
      // Verify no database calls were made
      expect(mockSupabaseClient.from).not.toHaveBeenCalled()
      
      // Verify revalidatePath was NOT called on error
      expect(mockRevalidatePath).not.toHaveBeenCalled()
    })
  })

  describe('authorization errors', () => {
    it('should return error when poll not found', async () => {
      // Arrange
      const pollId = 'poll-333'
      const formData = new FormData()
      formData.append('question', 'What is your favorite color?')
      formData.append('option_0', 'Red')
      formData.append('option_1', 'Blue')

      // Mock existing poll fetch - poll not found
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'No rows found' }
            })
          })
        })
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'polls') {
          return {
            select: mockSelect
          }
        }
        return {}
      })

      // Act
      const result = await updatePoll(pollId, formData)

      // Assert
      expect(result).toEqual({ 
        ok: false, 
        error: 'Poll not found or you do not have permission to edit it' 
      })
      
      // Verify revalidatePath was NOT called on error
      expect(mockRevalidatePath).not.toHaveBeenCalled()
    })

    it('should return error when user does not own the poll', async () => {
      // Arrange
      const pollId = 'poll-222'
      const formData = new FormData()
      formData.append('question', 'What is your favorite color?')
      formData.append('option_0', 'Red')
      formData.append('option_1', 'Blue')

      // Mock existing poll fetch - poll exists but belongs to different user
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: null
            })
          })
        })
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'polls') {
          return {
            select: mockSelect
          }
        }
        return {}
      })

      // Act
      const result = await updatePoll(pollId, formData)

      // Assert
      expect(result).toEqual({ 
        ok: false, 
        error: 'Poll not found or you do not have permission to edit it' 
      })
      
      // Verify revalidatePath was NOT called on error
      expect(mockRevalidatePath).not.toHaveBeenCalled()
    })
  })

  describe('database errors', () => {
    it('should return error when poll update fails', async () => {
      // Arrange
      const pollId = 'poll-111'
      const formData = new FormData()
      formData.append('question', 'What is your favorite color?')
      formData.append('option_0', 'Red')
      formData.append('option_1', 'Blue')

      // Mock existing poll fetch
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: pollId, user_id: 'u1' },
              error: null
            })
          })
        })
      })

      // Mock poll update failure
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database constraint violation' }
          })
        })
      })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'polls') {
          return {
            select: mockSelect,
            update: mockUpdate
          }
        }
        return {}
      })

      // Act
      const result = await updatePoll(pollId, formData)

      // Assert
      expect(result).toEqual({ 
        ok: false, 
        error: 'Failed to update poll: Database constraint violation' 
      })
      
      // Verify revalidatePath was NOT called on error
      expect(mockRevalidatePath).not.toHaveBeenCalled()
    })
  })

  describe('exception handling', () => {
    it('should return error when unexpected exception occurs', async () => {
      // Arrange
      const pollId = 'poll-000'
      const formData = new FormData()
      formData.append('question', 'What is your favorite color?')
      formData.append('option_0', 'Red')
      formData.append('option_1', 'Blue')

      // Mock supabase to throw an unexpected error
      mockSupabaseServer.mockRejectedValue(new Error('Unexpected error'))

      // Act
      const result = await updatePoll(pollId, formData)

      // Assert
      expect(result).toEqual({ 
        ok: false, 
        error: 'Unexpected error' 
      })
      
      // Verify revalidatePath was NOT called on error
      expect(mockRevalidatePath).not.toHaveBeenCalled()
    })
  })
})
