"use client"

import { useState } from "react"
import { TopBar } from "@/components/top-bar"
import { MorphingText } from "@/components/ui/morphing-text"
import { ResultsCard } from "@/components/results-card"
import { ExplorerMode } from "@/components/explorer-mode"
import { ResearcherMode } from "@/components/researcher-mode"
import { UploadMode } from "@/components/upload-mode"
import { LightCurveChart } from "@/components/light-curve-chart"
import type { GlobalControls, PredictionResult } from "@/lib/types"

export default function Home() {
  const [controls, setControls] = useState<GlobalControls>({
    mode: "explorer",
    mission: "kepler",
    threshold: 0.5,
    explainability: {
      featureImportances: false,
      nearestExamples: false,
    },
    returnRawFeatures: false,
  })

  const [isInferenceRunning, setIsInferenceRunning] = useState(false)
  const [result, setResult] = useState<PredictionResult | null>(null)

  const handleThresholdChange = (newControls: GlobalControls) => {
    setControls(newControls)

    if (result && newControls.threshold !== controls.threshold) {
      const updatedResult = {
        ...result,
        modelLabel: (newControls.threshold <= result.modelProbabilityCandidate
          ? "candidate"
          : "false-positive") as PredictionResult["modelLabel"],
      }
      setResult(updatedResult)
    }
  }

  return (
    <div className="min-h-screen bg-background dark">

      <div className="flex flex-col justify-center items-center py-12 bg-gradient-to-b from-background to-card/20 space-y-4">
        <MorphingText 
          texts={["ExoDetect", "Exoplanet Detect"]}
          className="text-white whitespace-nowrap"
        />
        <p className="text-white italic text-[10pt] leading-none md:text-[15pt] lg:text-[1.5rem]">
          "Empowering every explorer to find new worlds"
        </p>
      </div>

      <TopBar controls={controls} onControlsChange={handleThresholdChange} isInferenceRunning={isInferenceRunning} />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column: Mode interface */}
          <div>
            {controls.mode === "explorer" && (
              <ExplorerMode controls={controls} onResultsChange={setResult} onLoadingChange={setIsInferenceRunning} />
            )}
            {controls.mode === "researcher" && (
              <ResearcherMode controls={controls} onResultsChange={setResult} onLoadingChange={setIsInferenceRunning} />
            )}
            {controls.mode === "upload" && (
              <UploadMode controls={controls} onResultsChange={setResult} onLoadingChange={setIsInferenceRunning} />
            )}
          </div>

          {/* Right column: Results */}
          <div className="space-y-6">
            {result?.lightCurve && (
              <LightCurveChart
                data={result.lightCurve}
                detrendMethod={result.detrendMethod}
                transitEvents={result.transitEvents}
                title={`Light Curve: ${result.targetId}`}
              />
            )}

            {result ? (
              <ResultsCard
                result={result}
                showFeatures={controls.explainability.featureImportances}
                showNearestExamples={controls.explainability.nearestExamples}
                showDiagnostics={controls.mode === "researcher" || controls.mode === "upload"}
              />
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px] border border-dashed border-border rounded-lg">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">No results yet</p>
                  <p className="text-xs text-muted-foreground">
                    {controls.mode === "explorer" && "Search for a target to see results"}
                    {controls.mode === "researcher" && "Configure and search to see results"}
                    {controls.mode === "upload" && "Upload data to see results"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
