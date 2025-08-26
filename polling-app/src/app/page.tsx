import Link from 'next/link'


export default function HomePage() {
return (
<main className="max-w-md mx-auto p-6 space-y-4">
<h1 className="text-2xl font-semibold">Polling App</h1>
<p className="text-sm text-muted-foreground">Sign in or create an account to start creating polls.</p>
<div className="flex gap-3">
<Link className="underline" href="/auth/login">Login</Link>
<Link className="underline" href="/auth/register">Register</Link>
</div>
</main>
)
}
