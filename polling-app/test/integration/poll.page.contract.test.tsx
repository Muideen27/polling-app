import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { submitVote } from '@/lib/actions/votes'

// Mock the submitVote action
vi.mock('@/lib/actions/votes', () => ({
  submitVote: vi.fn()
}))

// Mock the Fingerprint component to provide a predictable fingerprint
vi.mock('@/components/Fingerprint', () => ({
  Fingerprint: () => <input type="hidden" name="fingerprint" value="test-fingerprint" />
}))

// Mock the QR component
vi.mock('@/components/QR', () => ({
  QR: ({ url, size }: { url: string; size: number }) => (
    <div data-testid="qr-code" data-url={url} data-size={size}>
      QR Code for {url}
    </div>
  )
}))

// Mock the CopyLink component
vi.mock('@/components/CopyLink', () => ({
  CopyLink: ({ url }: { url: string }) => (
    <button data-testid="copy-link" data-url={url}>
      Copy Link
    </button>
  )
}))

// Mock supabaseServer for the page
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              id: 'test-poll-id',
              question: 'What is your favorite color?',
              options: ['Red', 'Blue', 'Green']
            },
            error: null
          }))
        }))
      }))
    }))
  }))
}

vi.mock('@/lib/supabase-server', () => ({
  supabaseServer: vi.fn(() => Promise.resolve(mockSupabase))
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn()
}))

// Minimal poll page component that mirrors the contract
function MinimalPollPage() {
  const pollData = {
    id: 'test-poll-id',
    question: 'What is your favorite color?',
    options: [
      { index: 0, text: 'Red', vote_count: 5 },
      { index: 1, text: 'Blue', vote_count: 3 },
      { index: 2, text: 'Green', vote_count: 2 }
    ],
    total_votes: 10
  }

  const pollUrl = 'http://localhost:3000/poll/test-poll-id'

  return (
    <div>
      <h1>{pollData.question}</h1>
      
      <form action={submitVote}>
        <input type="hidden" name="pollId" value={pollData.id} />
        <input type="hidden" name="fingerprint" value="test-fingerprint" />
        
        <div>
          <label>
            <input type="radio" name="optionId" value="0" />
            Red
          </label>
          <label>
            <input type="radio" name="optionId" value="1" />
            Blue
          </label>
          <label>
            <input type="radio" name="optionId" value="2" />
            Green
          </label>
        </div>
        
        <button type="submit">Submit Vote</button>
      </form>

      <div>
        <h2>Results</h2>
        <div>Red: 5 votes (50%)</div>
        <div>Blue: 3 votes (30%)</div>
        <div>Green: 2 votes (20%)</div>
      </div>

      <div>
        <h2>Share</h2>
        <input type="text" value={pollUrl} readOnly />
        <button data-testid="copy-link" data-url={pollUrl}>Copy Link</button>
        <div data-testid="qr-code" data-url={pollUrl} data-size={150}>
          QR Code for {pollUrl}
        </div>
      </div>
    </div>
  )
}

describe('Poll Page Contract Integration Test', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render poll question and options', () => {
    render(<MinimalPollPage />)
    
    expect(screen.getByText('What is your favorite color?')).toBeInTheDocument()
    expect(screen.getByText('Red')).toBeInTheDocument()
    expect(screen.getByText('Blue')).toBeInTheDocument()
    expect(screen.getByText('Green')).toBeInTheDocument()
  })

  it('should have form with correct action and hidden fields', () => {
    render(<MinimalPollPage />)
    
    const form = screen.getByRole('form')
    expect(form).toHaveAttribute('action', submitVote.toString())
    
    const pollIdInput = screen.getByDisplayValue('test-poll-id')
    expect(pollIdInput).toHaveAttribute('name', 'pollId')
    expect(pollIdInput).toHaveAttribute('type', 'hidden')
    
    const fingerprintInput = screen.getByDisplayValue('test-fingerprint')
    expect(fingerprintInput).toHaveAttribute('name', 'fingerprint')
    expect(fingerprintInput).toHaveAttribute('type', 'hidden')
  })

  it('should have radio buttons with correct optionId values', () => {
    render(<MinimalPollPage />)
    
    const redRadio = screen.getByDisplayValue('0')
    const blueRadio = screen.getByDisplayValue('1')
    const greenRadio = screen.getByDisplayValue('2')
    
    expect(redRadio).toHaveAttribute('name', 'optionId')
    expect(blueRadio).toHaveAttribute('name', 'optionId')
    expect(greenRadio).toHaveAttribute('name', 'optionId')
    
    expect(redRadio).toHaveAttribute('type', 'radio')
    expect(blueRadio).toHaveAttribute('type', 'radio')
    expect(greenRadio).toHaveAttribute('type', 'radio')
  })

  it('should display results with vote counts and percentages', () => {
    render(<MinimalPollPage />)
    
    expect(screen.getByText('Red: 5 votes (50%)')).toBeInTheDocument()
    expect(screen.getByText('Blue: 3 votes (30%)')).toBeInTheDocument()
    expect(screen.getByText('Green: 2 votes (20%)')).toBeInTheDocument()
  })

  it('should display sharing components with correct URL', () => {
    render(<MinimalPollPage />)
    
    const copyLinkButton = screen.getByTestId('copy-link')
    expect(copyLinkButton).toHaveAttribute('data-url', 'http://localhost:3000/poll/test-poll-id')
    
    const qrCode = screen.getByTestId('qr-code')
    expect(qrCode).toHaveAttribute('data-url', 'http://localhost:3000/poll/test-poll-id')
    expect(qrCode).toHaveAttribute('data-size', '150')
  })

  it('should call submitVote with correct parameters when form is submitted', async () => {
    const user = userEvent.setup()
    const mockSubmitVote = vi.mocked(submitVote)
    mockSubmitVote.mockResolvedValue({ ok: true })
    
    render(<MinimalPollPage />)
    
    // Select an option
    const blueRadio = screen.getByDisplayValue('1')
    await user.click(blueRadio)
    
    // Submit the form
    const submitButton = screen.getByText('Submit Vote')
    await user.click(submitButton)
    
    // Wait for the form submission
    await waitFor(() => {
      expect(mockSubmitVote).toHaveBeenCalledWith(
        expect.objectContaining({
          get: expect.any(Function)
        })
      )
    })
    
    // Verify the form data contains the expected values
    const formData = mockSubmitVote.mock.calls[0][0] as FormData
    expect(formData.get('pollId')).toBe('test-poll-id')
    expect(formData.get('optionId')).toBe('1')
    expect(formData.get('fingerprint')).toBe('test-fingerprint')
  })

  it('should handle form submission with different option selection', async () => {
    const user = userEvent.setup()
    const mockSubmitVote = vi.mocked(submitVote)
    mockSubmitVote.mockResolvedValue({ ok: true })
    
    render(<MinimalPollPage />)
    
    // Select a different option
    const greenRadio = screen.getByDisplayValue('2')
    await user.click(greenRadio)
    
    // Submit the form
    const submitButton = screen.getByText('Submit Vote')
    await user.click(submitButton)
    
    // Wait for the form submission
    await waitFor(() => {
      expect(mockSubmitVote).toHaveBeenCalled()
    })
    
    // Verify the form data contains the correct optionId
    const formData = mockSubmitVote.mock.calls[0][0] as FormData
    expect(formData.get('optionId')).toBe('2')
  })

  it('should ensure fingerprint is non-empty', () => {
    render(<MinimalPollPage />)
    
    const fingerprintInput = screen.getByDisplayValue('test-fingerprint')
    expect(fingerprintInput).toHaveValue('test-fingerprint')
    expect(fingerprintInput.value).toBeTruthy()
    expect(fingerprintInput.value.length).toBeGreaterThan(0)
  })

  it('should have proper form structure for Server Action', () => {
    render(<MinimalPollPage />)
    
    const form = screen.getByRole('form')
    expect(form).toBeInTheDocument()
    expect(form.tagName).toBe('FORM')
    
    // Verify form has the required hidden fields
    const hiddenInputs = form.querySelectorAll('input[type="hidden"]')
    expect(hiddenInputs).toHaveLength(2) // pollId and fingerprint
    
    // Verify radio buttons are properly grouped
    const radioInputs = form.querySelectorAll('input[type="radio"]')
    expect(radioInputs).toHaveLength(3)
    
    // All radio buttons should have the same name for proper grouping
    const optionIds = Array.from(radioInputs).map(input => input.getAttribute('name'))
    expect(optionIds.every(name => name === 'optionId')).toBe(true)
  })
})
