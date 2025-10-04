"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"

interface NearestExamplesCardProps {
  examples: Array<{
    id: string
    distance: number
    disposition: string
  }>
}

export function NearestExamplesCard({ examples }: NearestExamplesCardProps) {
  const getDispositionColor = (disposition: string) => {
    const upper = disposition.toUpperCase()
    if (upper.includes("CONFIRMED")) return "bg-green-500/10 text-green-500 border-green-500/20"
    if (upper.includes("CANDIDATE")) return "bg-blue-500/10 text-blue-500 border-blue-500/20"
    if (upper.includes("FALSE")) return "bg-red-500/10 text-red-500 border-red-500/20"
    return "bg-muted text-muted-foreground"
  }

  const getSimilarityPercentage = (distance: number) => {
    return ((1 - distance) * 100).toFixed(1)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Nearest Examples</CardTitle>
        <p className="text-xs text-muted-foreground">Similar targets from the training dataset</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {examples.map((example, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-medium">{example.id}</span>
                  <a
                    href={`https://exoplanetarchive.ipac.caltech.edu/cgi-bin/DisplayOverview/nph-DisplayOverview?objname=${example.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={getDispositionColor(example.disposition)}>
                    {example.disposition}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Similarity:</span>
                    <span className="text-xs font-mono font-medium">{getSimilarityPercentage(example.distance)}%</span>
                  </div>
                </div>
              </div>

              {/* Similarity bar */}
              <div className="ml-4 w-24">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${getSimilarityPercentage(example.distance)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-lg bg-muted/30">
          <p className="text-xs text-muted-foreground">
            These examples represent the most similar targets in feature space, helping to understand the model's
            decision by comparison with known cases.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
