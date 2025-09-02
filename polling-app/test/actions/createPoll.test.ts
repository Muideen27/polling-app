import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock supabase-server
vi.mock('@/lib/supabase-server', () => ({
  supabaseServer: vi.fn()
}))

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn()
}))

import { createPoll } from '@/lib/actions/polls'
import { supabaseServer } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

// Get mocked functions
const mockSupabaseServer = vi.mocked(supabaseServer)
const mockRevalidatePath = vi.mocked(revalidatePath)

describe('createPoll', () => {
  const mockSupabaseClient = {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn(() => ({
      insert: vi.fn()
    }))
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mock
    mockSupabaseServer.mockResolvedValue(mockSupabaseClient as any)
    
    // Default mock user
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null
    })
  })

  describe('happy path', () => {
    it('should create poll successfully with valid question and 3 options', async () => {
      // Arrange
      const formData = new FormData()
      formData.append('question', 'What is your favorite color?')
      formData.append('option_0', 'Red')
      formData.append('option_1', 'Blue')
      formData.append('option_2', 'Green')

      const mockPollInsert = {
        insert: vi.fn().mockResolvedValue({
          data: { id: 'poll-123' },
          error: null
        })
      }

      mockSupabaseClient.from.mockReturnValue(mockPollInsert)

      // Act
      await createPoll(formData)

      // Assert
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('polls')
      expect(mockPollInsert.insert).toHaveBeenCalledWith({
        user_id: 'user-123',
        question: 'What is your favorite color?',
        options: ['Red', 'Blue', 'Green'],
        created_at: expect.any(String),
        is_active: true
      })
      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
    })

    it('should handle multiple options correctly', async () => {
      // Arrange
      const formData = new FormData()
      formData.append('question', 'Which programming language do you prefer?')
      formData.append('option_0', 'TypeScript')
      formData.append('option_1', 'JavaScript')
      formData.append('option_2', 'Python')
      formData.append('option_3', 'Rust')
      formData.append('option_4', 'Go')

      const mockPollInsert = {
        insert: vi.fn().mockResolvedValue({
          data: { id: 'poll-456' },
          error: null
        })
      }

      mockSupabaseClient.from.mockReturnValue(mockPollInsert)

      // Act
      await createPoll(formData)

      // Assert
      expect(mockPollInsert.insert).toHaveBeenCalledWith({
        user_id: 'user-123',
        question: 'Which programming language do you prefer?',
        options: ['TypeScript', 'JavaScript', 'Python', 'Rust', 'Go'],
        created_at: expect.any(String),
        is_active: true
      })
      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
    })

    it('should trim whitespace from question and options', async () => {
      // Arrange
      const formData = new FormData()
      formData.append('question', '  What is your favorite food?  ')
      formData.append('option_0', '  Pizza  ')
      formData.append('option_1', '  Burger  ')
      formData.append('option_2', '  Pasta  ')

      const mockPollInsert = {
        insert: vi.fn().mockResolvedValue({
          data: { id: 'poll-789' },
          error: null
        })
      }

      mockSupabaseClient.from.mockReturnValue(mockPollInsert)

      // Act
      await createPoll(formData)

      // Assert
      expect(mockPollInsert.insert).toHaveBeenCalledWith({
        user_id: 'user-123',
        question: 'What is your favorite food?',
        options: ['Pizza', 'Burger', 'Pasta'],
        created_at: expect.any(String),
        is_active: true
      })
    })
  })

  describe('validation errors', () => {
    it('should throw error for question too short', async () => {
      // Arrange
      const formData = new FormData()
      formData.append('question', 'Hi')
      formData.append('option_0', 'Option 1')
      formData.append('option_1', 'Option 2')

      // Act & Assert
      await expect(createPoll(formData)).rejects.toThrow('Question must be at least 5 characters long')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
      expect(mockSupabaseClient.from).not.toHaveBeenCalled()
    })

    it('should throw error for empty question', async () => {
      // Arrange
      const formData = new FormData()
      formData.append('question', '')
      formData.append('option_0', 'Option 1')
      formData.append('option_1', 'Option 2')

      // Act & Assert
      await expect(createPoll(formData)).rejects.toThrow('Question must be at least 5 characters long')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
      expect(mockSupabaseClient.from).not.toHaveBeenCalled()
    })

    it('should throw error for less than 2 options', async () => {
      // Arrange
      const formData = new FormData()
      formData.append('question', 'What is your favorite color?')
      formData.append('option_0', 'Red')

      // Act & Assert
      await expect(createPoll(formData)).rejects.toThrow('At least 2 options are required')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
      expect(mockSupabaseClient.from).not.toHaveBeenCalled()
    })

    it('should throw error for no options', async () => {
      // Arrange
      const formData = new FormData()
      formData.append('question', 'What is your favorite color?')

      // Act & Assert
      await expect(createPoll(formData)).rejects.toThrow('At least 2 options are required')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
      expect(mockSupabaseClient.from).not.toHaveBeenCalled()
    })

    it('should ignore empty options', async () => {
      // Arrange
      const formData = new FormData()
      formData.append('question', 'What is your favorite color?')
      formData.append('option_0', 'Red')
      formData.append('option_1', 'Blue')
      formData.append('option_2', '')
      formData.append('option_3', '   ')
      formData.append('option_4', 'Green')

      const mockPollInsert = {
        insert: vi.fn().mockResolvedValue({
          data: { id: 'poll-123' },
          error: null
        })
      }

      mockSupabaseClient.from.mockReturnValue(mockPollInsert)

      // Act
      await createPoll(formData)

      // Assert
      expect(mockPollInsert.insert).toHaveBeenCalledWith({
        user_id: 'user-123',
        question: 'What is your favorite color?',
        options: ['Red', 'Blue', 'Green'],
        created_at: expect.any(String),
        is_active: true
      })
    })
  })

  describe('authentication errors', () => {
    it('should throw error when user is not logged in', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      const formData = new FormData()
      formData.append('question', 'What is your favorite color?')
      formData.append('option_0', 'Red')
      formData.append('option_1', 'Blue')

      // Act & Assert
      await expect(createPoll(formData)).rejects.toThrow('You must be logged in to create a poll')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
      expect(mockSupabaseClient.from).not.toHaveBeenCalled()
    })

    it('should throw error when auth getUser fails', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Auth error' }
      })

      const formData = new FormData()
      formData.append('question', 'What is your favorite color?')
      formData.append('option_0', 'Red')
      formData.append('option_1', 'Blue')

      // Act & Assert
      await expect(createPoll(formData)).rejects.toThrow('You must be logged in to create a poll')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
      expect(mockSupabaseClient.from).not.toHaveBeenCalled()
    })
  })

  describe('database errors', () => {
    it('should throw error when poll insert fails', async () => {
      // Arrange
      const formData = new FormData()
      formData.append('question', 'What is your favorite color?')
      formData.append('option_0', 'Red')
      formData.append('option_1', 'Blue')

      const mockPollInsert = {
        insert: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error', code: '23505' }
        })
      }

      mockSupabaseClient.from.mockReturnValue(mockPollInsert)

      // Act & Assert
      await expect(createPoll(formData)).rejects.toThrow('Failed to create poll: Database error')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
    })

    it('should throw specific error for missing table', async () => {
      // Arrange
      const formData = new FormData()
      formData.append('question', 'What is your favorite color?')
      formData.append('option_0', 'Red')
      formData.append('option_1', 'Blue')

      const mockPollInsert = {
        insert: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Table does not exist', code: '42P01' }
        })
      }

      mockSupabaseClient.from.mockReturnValue(mockPollInsert)

      // Act & Assert
      await expect(createPoll(formData)).rejects.toThrow('Database table "polls" does not exist. Please run the database schema setup.')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
    })
  })
})
