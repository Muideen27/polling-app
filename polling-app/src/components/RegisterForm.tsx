'use client'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '@/lib/auth-provider'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'


const schema = z.object({
email: z.string().email(),
password: z.string().min(6, 'Password must be at least 6 characters'),
})


type FormData = z.infer<typeof schema>


export function RegisterForm() {
const router = useRouter()
const { signUp } = useAuth()
const [loading, setLoading] = useState(false)


const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
resolver: zodResolver(schema),
})


const onSubmit = async (data: FormData) => {
setLoading(true)
const { error } = await signUp(data.email, data.password)
if (error) {
toast.error(error)
} else {
toast.success('Check your email to confirm your account')
router.push('/auth/login')
}
setLoading(false)
}


return (
<Card className="w-full max-w-sm p-6 space-y-4">
<div>
<h2 className="text-xl font-semibold">Create account</h2>
<p className="text-sm text-muted-foreground">Register with your email.</p>
</div>
<form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
<div className="space-y-1">
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
{errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
</div>
<div className="space-y-1">
<Label htmlFor="password">Password</Label>
<Input id="password" type="password" {...register('password')} />
{errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
</div>
<Button disabled={loading} className="w-full" type="submit">
{loading ? 'Creating…' : 'Create account'}
</Button>
</form>
</Card>
)
}
