'use client'
import { useAuth } from '@/lib/auth-provider'
import Link from 'next/link'


export default function DashboardPage() {
const { user, signOut } = useAuth()
return (
<main className="max-w-2xl mx-auto p-6 space-y-4">
<h1 className="text-2xl font-semibold">Dashboard</h1>
{user ? (
<>
<p className="text-sm">Signed in as <span className="font-mono">{user.email}</span></p>
<button onClick={() => signOut()} className="underline">Sign out</button>
</>
) : (
<p className="text-sm">You are not signed in. <Link className="underline" href="/auth/login">Login</Link></p>
)}
</main>
)
}
