'use client'

import { QRCodeSVG } from 'qrcode.react'

interface QRProps {
  url: string
  size?: number
}

export function QR({ url, size = 200 }: QRProps) {
  return (
    <QRCodeSVG 
      value={url}
      size={size}
      level="M"
      includeMargin={true}
    />
  )
}
