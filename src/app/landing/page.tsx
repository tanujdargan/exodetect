"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@auth0/nextjs-auth0"

import { Button } from "@/components/ui/button"
import { Globe } from "@/components/ui/globe"
import { ShineBorder } from "@/components/ui/shine-border"
import { Github, Globe as GlobeIcon } from "lucide-react"

export default function LandingPage() {
  const router = useRouter()
  const { user, isLoading } = useUser()

  useEffect(() => {
    if (user && !isLoading) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  const SocialIconButton = ({ ariaLabel, children, onClick }: { ariaLabel: string; children: React.ReactNode; onClick?: () => void }) => (
    <Button
      type="button"
      variant="outline"
      size="icon-lg"
      aria-label={ariaLabel}
      title={ariaLabel}
      onClick={onClick}
    >
      {children}
    </Button>
  )

  const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 48 48" width="24" height="24" aria-hidden="true" {...props}>
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.706 32.329 29.245 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.153 7.961 3.039l5.657-5.657C33.64 6.053 28.999 4 24 4 12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20c0-1.341-.138-2.651-.389-3.917z"/>
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.817C14.384 16.108 18.77 12 24 12c3.059 0 5.842 1.153 7.961 3.039l5.657-5.657C33.64 6.053 28.999 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
      <path fill="#4CAF50" d="M24 44c5.166 0 9.755-1.977 13.242-5.191l-6.108-5.162C29.087 35.091 26.691 36 24 36c-5.217 0-9.666-3.65-11.192-8.587l-6.5 5.017C9.623 39.798 16.223 44 24 44z"/>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.078 3.246-3.323 5.9-6.162 7.648l.005-.003 6.108 5.162C33.012 42.043 38 38 40.682 32.682c1.006-2.006 1.594-4.287 1.594-6.682 0-1.341-.138-2.651-.389-3.917z"/>
    </svg>
  )

  const AppleBrandIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M16.365 12.792c-.013-2.007 1.642-2.973 1.716-3.02-0.936-1.37-2.394-1.559-2.91-1.579-1.241-.127-2.417.73-3.045.73-.627 0-1.598-.712-2.624-.693-1.349.02-2.592.783-3.282 1.988-1.396 2.42-.356 5.983 1.002 7.94.662.955 1.45 2.03 2.49 1.992.998-.04 1.373-.642 2.579-.642 1.206 0 1.541.642 2.6.622 1.074-.02 1.754-.975 2.414-1.935.76-1.112 1.07-2.187 1.082-2.242-.024-.01-2.078-.797-2.022-3.162zM14.23 6.63c.551-.668.921-1.596.819-2.53-.793.032-1.757.527-2.327 1.195-.51.589-.957 1.531-.838 2.44.886.069 1.795-.436 2.346-1.105z"
      />
    </svg>
  )

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="container mx-auto px-4 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-14 items-center">
          {/* Left: Login block */}
          <div className="w-full">
            <div className="max-w-md">
              <div className="space-y-2 mb-6">
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Welcome to ExoDetect</h1>
                <p className="text-muted-foreground">Sign in to access your dashboard.</p>
              </div>
              <div className="relative rounded-xl">
                <ShineBorder borderWidth={2} duration={16} shineColor={["#22d3ee", "#a78bfa", "#f97316"]} className="opacity-70" />
                <div className="relative rounded-[inherit] border border-border bg-card/30 backdrop-blur p-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => window.location.href = '/api/auth/login'}
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? "Loading..." : "Sign In"}
                      </Button>
                      <Button
                        onClick={() => window.location.href = '/api/auth/signup'}
                        variant="outline"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? "Loading..." : "Sign Up"}
                      </Button>
                    </div>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card/30 backdrop-blur px-2 text-muted-foreground">Or continue with</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <SocialIconButton
                        ariaLabel="Sign in with Google"
                        onClick={() => window.location.href = '/api/auth/login?connection=google-oauth2'}
                      >
                        <GoogleIcon />
                      </SocialIconButton>
                      <SocialIconButton
                        ariaLabel="Sign in with Apple"
                        onClick={() => window.location.href = '/api/auth/login?connection=apple'}
                      >
                        <AppleBrandIcon className="size-8" />
                      </SocialIconButton>
                      <SocialIconButton
                        ariaLabel="Sign in with GitHub"
                        onClick={() => window.location.href = '/api/auth/login?connection=github'}
                      >
                        <Github className="size-6" />
                      </SocialIconButton>
                      <SocialIconButton ariaLabel="Enterprise SSO" onClick={() => {}}>
                        <GlobeIcon className="size-6" />
                      </SocialIconButton>
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm text-muted-foreground">
                Empowering every explorer to find new worlds. Analyze light curves, surface potential candidates, and dive into explainability tools.
              </p>
            </div>
          </div>

          {/* Right: Globe */}
          <div className="relative h-[420px] sm:h-[520px] md:h-[560px] lg:h-[620px]">
            <Globe className="right-0 max-w-[911px]" />
          </div>
        </div>
      </div>
    </div>
  )
}


