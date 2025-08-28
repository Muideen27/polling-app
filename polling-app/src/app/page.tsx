import Link from 'next/link'
import { BarChart3, Users, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <nav className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left side - Brand */}
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Polling App</span>
            </div>
            
            {/* Right side - Get Started Button */}
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Vector Image */}
          <div className="order-2 lg:order-1 flex justify-center lg:justify-start">
            <div className="relative w-full max-w-md lg:max-w-lg">
              {/* Main illustration container */}
              <div className="relative">
                {/* Background circle */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-3xl"></div>
                
                {/* Main illustration */}
                <div className="relative bg-gradient-to-br from-primary/10 to-background border border-primary/20 rounded-3xl p-8 shadow-2xl">
                  {/* Poll chart visualization */}
                  <div className="space-y-4">
                    {/* Chart bars */}
                    <div className="flex items-end justify-center space-x-2 h-32">
                      <div className="w-8 bg-primary/60 rounded-t-sm h-16"></div>
                      <div className="w-8 bg-primary/80 rounded-t-sm h-24"></div>
                      <div className="w-8 bg-primary rounded-t-sm h-32"></div>
                      <div className="w-8 bg-primary/70 rounded-t-sm h-20"></div>
                      <div className="w-8 bg-primary/90 rounded-t-sm h-28"></div>
                    </div>
                    
                    {/* Poll options */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border/50">
                        <span className="text-sm font-medium text-foreground">Option A</span>
                        <span className="text-sm text-primary font-semibold">45%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border/50">
                        <span className="text-sm font-medium text-foreground">Option B</span>
                        <span className="text-sm text-primary font-semibold">32%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border/50">
                        <span className="text-sm font-medium text-foreground">Option C</span>
                        <span className="text-sm text-primary font-semibold">23%</span>
                      </div>
                    </div>
                    
                    {/* Floating elements */}
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-accent rounded-full flex items-center justify-center shadow-lg">
                      <Users className="w-8 h-8 text-accent-foreground" />
                    </div>
                    <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Content */}
          <div className="order-1 lg:order-2 text-center lg:text-left space-y-8">
            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Create and Share
                <span className="block text-primary">Polls Instantly</span>
              </h1>
              <p className="mx-auto lg:mx-0 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                Build engaging polls, collect real-time responses, and get instant insights. 
                Perfect for teams, events, and decision-making.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center lg:items-start">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                <Zap className="mr-2 h-5 w-5" />
                Start Creating
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-base font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Highlights - Moved below hero section */}
        <div className="mt-20 text-center">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Easy Creation</h3>
              <p className="text-sm text-muted-foreground">
                Create polls in seconds with our intuitive interface
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Real-time Results</h3>
              <p className="text-sm text-muted-foreground">
                Watch responses come in live with instant updates
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Quick Sharing</h3>
              <p className="text-sm text-muted-foreground">
                Share polls instantly via links or QR codes
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

