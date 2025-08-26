import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-provider'
import { Toaster } from 'react-hot-toast'


export const metadata: Metadata = {
title: 'Polling App',
description: 'AI-assisted Polling App with QR sharing',
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
return (
<html lang="en">
<body className="min-h-screen bg-background antialiased">
<AuthProvider>
{children}
<Toaster />
</AuthProvider>
</body>
</html>
)
}
