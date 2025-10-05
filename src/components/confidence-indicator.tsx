"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react"

interface ConfidenceIndicatorProps {
  probability: number
  threshold: number
  modelVersion: string
}

export function ConfidenceIndicator({ probability, threshold, modelVersion }: ConfidenceIndicatorProps) {
  const getConfidenceLevel = () => {
    const distance = Math.abs(probability - threshold)
    if (distance > 0.3) return { level: "High", color: "text-green-500", icon: CheckCircle2 }
    if (distance > 0.15) return { level: "Medium", color: "text-yellow-500", icon: HelpCircle }
    return { level: "Low", color: "text-orange-500", icon: AlertTriangle }
  }

  const confidence = getConfidenceLevel()
  const Icon = confidence.icon

  const getUncertaintyRange = () => {
    const uncertainty = 0.05
    return {
      lower: Math.max(0, probability - uncertainty),
      upper: Math.min(1, probability + uncertainty),
    }
  }

  const range = getUncertaintyRange()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Prediction Confidence</CardTitle>
        <p className="text-xs text-muted-foreground">Model certainty and uncertainty estimates</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Confidence Level */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${confidence.color}`} />
            <span className="text-sm font-medium">Confidence Level</span>
          </div>
          <Badge variant="outline" className={confidence.color}>
            {confidence.level}
          </Badge>
        </div>

        {/* Probability Distribution */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Probability Range</span>
            <span className="font-mono">
              {(range.lower * 100).toFixed(1)}% - {(range.upper * 100).toFixed(1)}%
            </span>
          </div>

          <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
            {/* Threshold line */}
            <div className="absolute top-0 bottom-0 w-0.5 bg-foreground z-10" style={{ left: `${threshold * 100}%` }} />

            {/* Uncertainty range */}
            <div
              className="absolute top-0 bottom-0 bg-primary/30"
              style={{
                left: `${range.lower * 100}%`,
                width: `${(range.upper - range.lower) * 100}%`,
              }}
            />

            {/* Point estimate */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-full z-20"
              style={{ left: `${probability * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>False Positive</span>
            <span>Candidate</span>
          </div>
        </div>

        {/* Model Info */}
        <div className="pt-3 border-t border-border space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Model Version</span>
            <span className="font-mono">{modelVersion}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Distance from Threshold</span>
            <span className="font-mono">{(Math.abs(probability - threshold) * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* Interpretation */}
        <div className="p-3 rounded-lg bg-muted/30">
          <p className="text-xs text-muted-foreground">
            {confidence.level === "High" &&
              "The model is highly confident in this prediction with clear separation from the decision threshold."}
            {confidence.level === "Medium" &&
              "The model has moderate confidence. Consider additional validation or human review."}
            {confidence.level === "Low" &&
              "The prediction is near the decision boundary. Manual review is strongly recommended."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
