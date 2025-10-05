"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { TopBar } from "@/components/top-bar"
import { MorphingText } from "@/components/ui/morphing-text"
import { ResultsCard } from "@/components/results-card"
import { ExplorerMode } from "@/components/explorer-mode"
import { ResearcherMode } from "@/components/researcher-mode"
import { UploadMode } from "@/components/upload-mode"
import { LightCurveChart } from "@/components/light-curve-chart"
import { CandidateVisuals } from "@/components/candidate-visuals"
import type { GlobalControls, PredictionResult } from "@/lib/types"

export default function DashboardPage() {
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
    <div className="min-h-screen bg-background dark relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-background to-blue-600/10 animate-gradient-xy pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-background to-background pointer-events-none" />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative flex flex-col justify-center items-center py-16 space-y-6 w-full"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="flex justify-center items-center w-full"
        >
          <MorphingText
            texts={["ExoDetect", "Exoplanet Detect"]}
            className="text-white drop-shadow-2xl whitespace-nowrap"
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-white/90 italic text-[10pt] leading-none md:text-[15pt] lg:text-[1.5rem] font-light text-center px-4"
        >
          &quot;Empowering every explorer to find new worlds.&quot;
        </motion.p>

        {/* Decorative elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </motion.div>

      <TopBar controls={controls} onControlsChange={handleThresholdChange} isInferenceRunning={isInferenceRunning} />

      <main className="relative container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Left column: Mode interface */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {controls.mode === "explorer" && (
              <ExplorerMode controls={controls} onResultsChange={setResult} onLoadingChange={setIsInferenceRunning} />
            )}
            {controls.mode === "researcher" && (
              <ResearcherMode controls={controls} onResultsChange={setResult} onLoadingChange={setIsInferenceRunning} />
            )}
            {controls.mode === "upload" && (
              <UploadMode controls={controls} onResultsChange={setResult} onLoadingChange={setIsInferenceRunning} />
            )}
          </motion.div>

          {/* Right column: Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="space-y-6"
          >
            {result?.lightCurve && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <LightCurveChart
                  data={result.lightCurve}
                  detrendMethod={result.detrendMethod}
                  transitEvents={result.transitEvents}
                  title={`Light Curve: ${result.targetId}`}
                />
              </motion.div>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <CandidateVisuals targetId={result.targetId} />
              </motion.div>
            )}

            {result ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <ResultsCard
                  result={result}
                  showFeatures={controls.explainability.featureImportances}
                  showNearestExamples={controls.explainability.nearestExamples}
                  showDiagnostics={controls.mode === "researcher" || controls.mode === "upload"}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-center h-full min-h-[400px] border border-dashed border-border/50 rounded-xl bg-card/30 backdrop-blur-sm"
              >
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-violet-500/10 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-violet-500/20 animate-pulse" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">No results yet</p>
                  <p className="text-xs text-muted-foreground/70">
                    {controls.mode === "explorer" && "Search for a target to see results"}
                    {controls.mode === "researcher" && "Configure and search to see results"}
                    {controls.mode === "upload" && "Upload data to see results"}
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}


