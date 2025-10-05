"use client"

export function Logo() {
  return (
    <div className="flex flex-col items-center space-y-2">
      {/* EXODETECT Logo */}
      <div className="relative">
        <h1 className="text-4xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-red-600">
          EXODETECT
        </h1>
        {/* Glow effect */}
        <div className="absolute inset-0 text-4xl font-bold tracking-wider text-red-500/20 blur-sm">
          EXODETECT
        </div>
        {/* Horizontal lines extending from X and T */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent transform -translate-y-1/2">
          <div className="absolute left-[15%] w-2 h-px bg-red-500"></div>
          <div className="absolute right-[15%] w-2 h-px bg-red-500"></div>
        </div>
      </div>
      
      {/* Tagline */}
      <p className="text-sm text-muted-foreground font-medium tracking-wide">
        Empowering every explorer to find new worlds.
      </p>
    </div>
  )
}
