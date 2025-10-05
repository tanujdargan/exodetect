"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FeatureImportanceChart } from "@/components/feature-importance-chart"
import { NearestExamplesCard } from "@/components/nearest-examples-card"
import { ConfidenceIndicator } from "@/components/confidence-indicator"
import type { PredictionResult } from "@/lib/types"

interface ResultsCardProps {
  result: PredictionResult
  showFeatures: boolean
  showNearestExamples: boolean
  showDiagnostics: boolean
}

export function ResultsCard({ result, showFeatures, showNearestExamples, showDiagnostics }: ResultsCardProps) {
  const getLabelColor = (label: PredictionResult["modelLabel"]) => {
    switch (label) {
      case "candidate":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "false-positive":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "abstain":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
    }
  }

  return (
    <div className="space-y-6">
      {/* Main Results Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{result.targetId}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Classification Results</p>
            </div>
            <Badge variant="outline" className={getLabelColor(result.modelLabel)}>
              {result.modelLabel.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Probability */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Candidate Probability</span>
              <span className="text-2xl font-bold font-mono">
                {(result.modelProbabilityCandidate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${result.modelProbabilityCandidate * 100}%` }}
              />
            </div>
          </div>

          <Separator />

          {/* Model Version */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Model Version</span>
            <span className="font-mono">{result.modelVersion}</span>
          </div>

          {/* Archive Snapshot (if available) */}
          {result.archiveSnapshot && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Archive Data</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {typeof result.archiveSnapshot.koi_disposition === "string" && (
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">KOI Disposition</span>
                      <span className="font-mono">{result.archiveSnapshot.koi_disposition}</span>
                    </div>
                  )}
                  {typeof result.archiveSnapshot.koi_score === "number" && (
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">KOI Score</span>
                      <span className="font-mono">{result.archiveSnapshot.koi_score.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Diagnostics (if available) */}
          {showDiagnostics && result.diagnostics && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Diagnostics</h4>
                <div className="rounded-lg bg-muted/30 p-3">
                  <pre className="text-xs font-mono overflow-auto">{JSON.stringify(result.diagnostics, null, 2)}</pre>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ConfidenceIndicator
        probability={result.modelProbabilityCandidate}
        threshold={0.5}
        modelVersion={result.modelVersion}
      />

      {showFeatures && result.topFeatures && <FeatureImportanceChart features={result.topFeatures} />}

      {showNearestExamples && result.nearestExamples && <NearestExamplesCard examples={result.nearestExamples} />}
    </div>
  )
}
