"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"

interface CandidateVisualsProps {
  targetId: string
}

export function CandidateVisuals({ targetId }: CandidateVisualsProps) {
  const [stellariumUrl, setStellariumUrl] = useState<string>("")

  useEffect(() => {
    // Parse target ID to Stellarium format (remove hyphens, keep spaces)
    const getStarIdentifier = (id: string): string => {
      const trimmed = id.trim().toUpperCase()
      // Simply replace hyphens with spaces for Stellarium format
      // KOI-123.01 → "KOI 123.01"
      // KIC-12345678 → "KIC 12345678"
      return trimmed.replace(/-/g, " ")
    }

    const starId = getStarIdentifier(targetId)

    // Stellarium Web URL with object search and parameters
    // Format: https://stellarium-web.org/skysource/{object_name}
    const encodedStar = encodeURIComponent(starId)

    // Add URL parameters:
    // - fov=0.25 for 400% zoom (smaller field of view = more zoomed in)
    // - atmosphere=false to disable atmosphere
    // - landscape=false to disable ground/horizon
    // - hide_panel=true to close left navigation panel
    const url = `https://stellarium-web.org/skysource/${encodedStar}?fov=0.25&atmosphere=false&landscape=false&hide_panel=true`

    setStellariumUrl(url)
  }, [targetId])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Candidate Visuals: {targetId}</CardTitle>
          <Badge variant="secondary" className="text-xs">
            Stellarium Sky View
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-[400px] rounded-lg overflow-hidden border border-border">
          {stellariumUrl ? (
            <iframe
              src={stellariumUrl}
              className="w-full h-full"
              title={`Stellarium view of ${targetId}`}
              allow="fullscreen"
              style={{ border: 0 }}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-card">
              <p className="text-sm text-muted-foreground">Loading sky view...</p>
            </div>
          )}
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          <p>Interactive 3D sky view powered by Stellarium. Use mouse to navigate.</p>
        </div>
      </CardContent>
    </Card>
  )
}
