"use client"

import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { MorphingText } from "@/components/ui/morphing-text"
import { Button } from "@/components/ui/button"
import { ResultsCard } from "@/components/results-card"
import { ExplorerMode } from "@/components/explorer-mode"
import { ResearcherMode } from "@/components/researcher-mode"
import { UploadMode } from "@/components/upload-mode"
import { LightCurveChart } from "@/components/light-curve-chart"
import { CandidateVisuals } from "@/components/candidate-visuals"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import type { GlobalControls, PredictionResult } from "@/lib/types"

type TileId = "lightCurve" | "stellarium" | "results"

interface SortableTileProps {
  id: TileId
  children: React.ReactNode
}

function SortableTile({ id, children }: SortableTileProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-card/80 backdrop-blur-sm rounded p-1 border border-border/50"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      {children}
    </div>
  )
}

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
  const [tileOrder, setTileOrder] = useState<TileId[]>(["lightCurve", "stellarium", "results"])
  const [isMounted, setIsMounted] = useState(false)

  // Load tile order from localStorage on mount (client-side only)
  useEffect(() => {
    setIsMounted(true)
    const savedOrder = localStorage.getItem("tileOrder")
    if (savedOrder) {
      try {
        setTileOrder(JSON.parse(savedOrder))
      } catch (e) {
        console.error("Failed to parse saved tile order", e)
      }
    }
  }, [])

  // Save tile order to localStorage when it changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("tileOrder", JSON.stringify(tileOrder))
    }
  }, [tileOrder, isMounted])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setTileOrder((items) => {
        const oldIndex = items.indexOf(active.id as TileId)
        const newIndex = items.indexOf(over.id as TileId)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleThresholdChange = (newControls: GlobalControls) => {
    // Reset results when mode changes
    if (newControls.mode !== controls.mode) {
      setResult(null)
    }

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
    <div className="min-h-screen bg-background dark relative overflow-hidden" suppressHydrationWarning>
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-background to-blue-600/10 animate-gradient-xy pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-background to-background pointer-events-none" />

      {/* Navigation Bar */}
      <div className="relative z-10 border-b border-border/40 bg-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Landing Page
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost" size="sm">
                About Us
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section - Compact */}
      <div className="border-b border-border/40 bg-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Left: Title */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center lg:items-start"
            >
              <MorphingText
                texts={["ExoDetect", "Exoplanet Detect"]}
                className="text-white drop-shadow-lg whitespace-nowrap text-4xl lg:text-5xl"
              />
              <p className="text-white/80 italic text-sm md:text-base font-light mt-2">
                &quot;Empowering every explorer to find new worlds.&quot;
              </p>
            </motion.div>

            {/* Right: Controls */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex-1 max-w-2xl w-full"
            >
              <div className="flex flex-col gap-6">
                {/* Top row: Mode and Mission */}
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-3">
                    <Label htmlFor="mode" className="text-sm font-semibold text-foreground">
                      Mode
                    </Label>
                    <Select
                      value={controls.mode}
                      onValueChange={(value) => handleThresholdChange({ ...controls, mode: value as GlobalControls["mode"] })}
                      disabled={isInferenceRunning}
                    >
                      <SelectTrigger id="mode" className="w-[160px] bg-background/50 border-border/60 hover:bg-background/80 transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="explorer">Explorer</SelectItem>
                        <SelectItem value="researcher">Researcher</SelectItem>
                        <SelectItem value="upload">
                          <span className="flex items-center gap-2">
                            Upload
                            <Badge variant="secondary" className="text-xs bg-violet-500/20 text-violet-300 border-violet-500/30">
                              Power
                            </Badge>
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-3">
                    <Label htmlFor="mission" className="text-sm font-semibold text-foreground">
                      Mission
                    </Label>
                    <Select
                      value={controls.mission}
                      onValueChange={(value) => handleThresholdChange({ ...controls, mission: value as GlobalControls["mission"] })}
                      disabled={isInferenceRunning}
                    >
                      <SelectTrigger id="mission" className="w-[140px] bg-background/50 border-border/60 hover:bg-background/80 transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kepler">Kepler</SelectItem>
                        <SelectItem value="k2">K2</SelectItem>
                        <SelectItem value="tess">TESS</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Second row: Threshold slider */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="threshold" className="text-sm font-semibold text-foreground">
                      Decision Threshold
                    </Label>
                    <span className="text-sm font-mono text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20">
                      {controls.threshold.toFixed(2)}
                    </span>
                  </div>
                  <Slider
                    id="threshold"
                    min={0}
                    max={1}
                    step={0.01}
                    value={[controls.threshold]}
                    onValueChange={(values) => handleThresholdChange({ ...controls, threshold: values[0] })}
                    disabled={isInferenceRunning}
                    className="w-full"
                  />
                </div>

                {/* Third row: Explainability options */}
                <div className="flex flex-wrap items-center gap-8">
                  <div className="flex items-center gap-3 group">
                    <Checkbox
                      id="feature-importances"
                      checked={controls.explainability.featureImportances}
                      onCheckedChange={(checked: boolean) => handleThresholdChange({
                        ...controls,
                        explainability: { ...controls.explainability, featureImportances: checked === true }
                      })}
                      disabled={isInferenceRunning}
                      className="border-border/60 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500"
                    />
                    <Label htmlFor="feature-importances" className="text-sm font-normal cursor-pointer text-muted-foreground group-hover:text-foreground transition-colors">
                      Feature importances
                    </Label>
                  </div>

                  <div className="flex items-center gap-3 group">
                    <Checkbox
                      id="nearest-examples"
                      checked={controls.explainability.nearestExamples}
                      onCheckedChange={(checked: boolean) => handleThresholdChange({
                        ...controls,
                        explainability: { ...controls.explainability, nearestExamples: checked === true }
                      })}
                      disabled={isInferenceRunning}
                      className="border-border/60 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500"
                    />
                    <Label htmlFor="nearest-examples" className="text-sm font-normal cursor-pointer text-muted-foreground group-hover:text-foreground transition-colors">
                      Nearest known examples
                    </Label>
                  </div>

                  {controls.mode === "researcher" && (
                    <div className="flex items-center gap-3 group">
                      <Checkbox
                        id="raw-features"
                        checked={controls.returnRawFeatures}
                        onCheckedChange={(checked: boolean) => handleThresholdChange({ ...controls, returnRawFeatures: checked === true })}
                        disabled={isInferenceRunning}
                        className="border-border/60 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500"
                      />
                      <Label htmlFor="raw-features" className="text-sm font-normal cursor-pointer text-muted-foreground group-hover:text-foreground transition-colors">
                        Return raw features
                      </Label>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-20 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute top-0 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none" />
      </div>

      <main className="relative container mx-auto px-4 py-6" suppressHydrationWarning>
        <div className={`flex gap-8 ${result ? 'flex-row' : 'flex-col lg:flex-row'}`}>
          {/* Left column: Mode interface - Sticky when results present */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className={`${result ? 'w-full lg:w-80 flex-shrink-0' : 'w-full lg:w-1/2'} ${result ? 'lg:sticky lg:top-24 lg:self-start' : ''}`}
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

          {/* Right column: Results - Takes remaining space */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className={`space-y-6 ${result ? 'flex-1 min-w-0' : 'w-full lg:w-1/2'}`}
          >
            {result ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={tileOrder} strategy={verticalListSortingStrategy}>
                  <div className="space-y-6">
                    {tileOrder.map((tileId) => {
                      if (tileId === "lightCurve" && result.lightCurve) {
                        return (
                          <SortableTile key="lightCurve" id="lightCurve">
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
                          </SortableTile>
                        )
                      }

                      if (tileId === "stellarium") {
                        return (
                          <SortableTile key="stellarium" id="stellarium">
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.5, delay: 0.1 }}
                            >
                              <CandidateVisuals targetId={result.targetId} />
                            </motion.div>
                          </SortableTile>
                        )
                      }

                      if (tileId === "results") {
                        return (
                          <SortableTile key="results" id="results">
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
                          </SortableTile>
                        )
                      }

                      return null
                    })}
                  </div>
                </SortableContext>
              </DndContext>
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
        </div>
      </main>
    </div>
  )
}


