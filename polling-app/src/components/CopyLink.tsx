'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface CopyLinkProps {
  url: string
}

export function CopyLink({ url }: CopyLinkProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  return (
    <Button 
      onClick={handleCopy}
      variant="outline"
      size="sm"
      className="inline-flex items-center gap-2"
    >
      {copied ? '✓ Copied!' : 'Copy Link'}
    </Button>
  )
}
