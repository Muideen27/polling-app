import { describe, it, expect } from 'vitest'
import { normalizeResults, formatPercent } from '@/lib/poll-utils'

describe('Poll Page Behavior Verification', () => {
  describe('poll-utils functions', () => {
    it('should format percentages correctly', () => {
      expect(formatPercent(0)).toBe('0%')
      expect(formatPercent(50)).toBe('50%')
      expect(formatPercent(33.7)).toBe('34%') // Rounds up
      expect(formatPercent(33.3)).toBe('33%') // Rounds down
      expect(formatPercent(100)).toBe('100%')
    })

    it('should normalize results with no votes', () => {
      const options = [
        { id: 0, label: 'Red', count: 0 },
        { id: 1, label: 'Blue', count: 0 },
        { id: 2, label: 'Green', count: 0 }
      ]

      const result = normalizeResults(options)
      
      expect(result.total).toBe(0)
      expect(result.rows).toHaveLength(3)
      expect(result.rows[0]).toEqual({
        id: 0,
        label: 'Red',
        count: 0,
        percent: '0%'
      })
      expect(result.rows[1]).toEqual({
        id: 1,
        label: 'Blue',
        count: 0,
        percent: '0%'
      })
      expect(result.rows[2]).toEqual({
        id: 2,
        label: 'Green',
        count: 0,
        percent: '0%'
      })
    })

    it('should normalize results with votes correctly', () => {
      const options = [
        { id: 0, label: 'JavaScript', count: 3 },
        { id: 1, label: 'Python', count: 2 },
        { id: 2, label: 'TypeScript', count: 1 }
      ]

      const result = normalizeResults(options)
      
      expect(result.total).toBe(6)
      expect(result.rows).toHaveLength(3)
      expect(result.rows[0]).toEqual({
        id: 0,
        label: 'JavaScript',
        count: 3,
        percent: '50%' // 3/6 = 50%
      })
      expect(result.rows[1]).toEqual({
        id: 1,
        label: 'Python',
        count: 2,
        percent: '33%' // 2/6 = 33.33% -> 33%
      })
      expect(result.rows[2]).toEqual({
        id: 2,
        label: 'TypeScript',
        count: 1,
        percent: '17%' // 1/6 = 16.67% -> 17%
      })
    })

    it('should handle single vote correctly', () => {
      const options = [
        { id: 0, label: 'Yes', count: 1 },
        { id: 1, label: 'No', count: 0 }
      ]

      const result = normalizeResults(options)
      
      expect(result.total).toBe(1)
      expect(result.rows[0]).toEqual({
        id: 0,
        label: 'Yes',
        count: 1,
        percent: '100%'
      })
      expect(result.rows[1]).toEqual({
        id: 1,
        label: 'No',
        count: 0,
        percent: '0%'
      })
    })

    it('should handle even distribution correctly', () => {
      const options = [
        { id: 0, label: 'Option A', count: 5 },
        { id: 1, label: 'Option B', count: 5 }
      ]

      const result = normalizeResults(options)
      
      expect(result.total).toBe(10)
      expect(result.rows[0].percent).toBe('50%')
      expect(result.rows[1].percent).toBe('50%')
    })
  })
})
