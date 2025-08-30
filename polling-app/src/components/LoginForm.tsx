'use client'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '@/lib/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Mail, Lock, LogIn, AlertCircle } from 'lucide-react'
import Link from 'next/link'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

export function LoginForm() {
  const router = useRouter()
  const { signIn, resendConfirmation } = useAuth()
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    watch,
    setValue,
    trigger
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      rememberMe: false
    }
  })

  const rememberMe = watch('rememberMe', false)
  const emailValue = watch('email', '')

  const handleRememberMeChange = (checked: boolean) => {
    setValue('rememberMe', checked)
    trigger('rememberMe')
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const { error, user } = await signIn(data.email, data.password)
      if (error) {
        toast.error(error)
      } else if (user) {
        toast.success('Welcome back! Redirecting to dashboard...')
        if (data.rememberMe) {
          localStorage.setItem('rememberMe', 'true')
        }
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } else {
        toast.error('Sign in failed. Please try again.')
      }
    } catch {
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const onResend = async () => {
    if (!emailValue) {
      toast.error('Enter your email first')
      return
    }
    setResending(true)
    try {
      const { error, status } = await resendConfirmation(emailValue)
      if (error) {
        toast.error(error)
      } else if (status === 'sent') {
        toast.success('Confirmation email sent')
      }
    } catch {
      toast.error('Could not resend email. Try again later.')
    } finally {
      setResending(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <LogIn className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription className="text-muted-foreground">
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="pl-10"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {errors.email.message}
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="pl-10 pr-10"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {errors.password.message}
              </div>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => handleRememberMeChange(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary focus:ring-2 focus:ring-offset-0"
              />
              <Label htmlFor="rememberMe" className="text-sm leading-none">
                Remember me
              </Label>
            </div>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button disabled={loading} className="w-full" type="submit">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {/* Resend confirmation */}
        <div className="text-center">
          <button
            type="button"
            onClick={onResend}
            disabled={resending}
            className="text-sm text-primary hover:underline disabled:opacity-50"
          >
            {resending ? 'Sending confirmation…' : "Didn&apos;t get the email? Resend confirmation"}
          </button>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        {/* Social Login Options */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="w-full" type="button">
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </Button>
          <Button variant="outline" className="w-full" type="button">
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806.26-1.629.199-2.43.126.686 2.134 2.676 3.688 5.033 3.731-1.886 1.961-4.262 3.12-6.841 3.12-.444 0-.882-.026-1.308-.08 2.179 1.394 4.768 2.208 7.548 2.208 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
            </svg>
            Twitter
          </Button>
        </div>

        {/* Register Link */}
        <div className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
