'use client'

import { useEffect, useState } from 'react'

export function Fingerprint() {
  const [fingerprint, setFingerprint] = useState<string>('')

  useEffect(() => {
    // Generate a simple, stable browser fingerprint
    const generateFingerprint = () => {
      const userAgent = navigator.userAgent
      const language = navigator.language
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const platform = navigator.platform
      
      // Create a simple hash-like string from browser characteristics
      const fingerprintString = `${userAgent}-${language}-${timezone}-${platform}`
      
      // Simple hash function (not cryptographically secure, but deterministic)
      let hash = 0
      for (let i = 0; i < fingerprintString.length; i++) {
        const char = fingerprintString.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32-bit integer
      }
      
      return Math.abs(hash).toString(36)
    }

    setFingerprint(generateFingerprint())
  }, [])

  return (
    <input 
      type="hidden" 
      name="fingerprint" 
      value={fingerprint} 
    />
  )
}
