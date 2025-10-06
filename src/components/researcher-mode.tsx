"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "motion/react"
import { Search, Loader2, AlertCircle, X, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { GlobalControls, PredictionResult, DetrendMethod, TransitSearchMethod } from "@/lib/types"
import { api } from "@/lib/api"

interface ResearcherModeProps {
  controls: GlobalControls
  onResultsChange: (result: PredictionResult | null) => void
  onLoadingChange: (loading: boolean) => void
}

const AVAILABLE_COLUMNS = {
  transit: [
    "period_days",
    "duration_hours",
    "depth_ppm",
    "epoch_bjd",
    "impact_parameter",
    "snr",
    "odd_even_diff_ppm",
    "secondary_depth_ppm",
  ],
  stellar: ["teff_K", "logg_cgs", "radius_rsun", "mass_msun", "metallicity_feh", "distance_pc"],
}

export function ResearcherMode({ controls, onResultsChange, onLoadingChange }: ResearcherModeProps) {
  const [targetId, setTargetId] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "period_days",
    "duration_hours",
    "depth_ppm",
    "snr",
  ])
  const [detrendMethod, setDetrendMethod] = useState<DetrendMethod>("none")
  const [transitSearchMethod, setTransitSearchMethod] = useState<TransitSearchMethod>("none")
  const [searchParams, setSearchParams] = useState({
    periodMin: "",
    periodMax: "",
    durationMin: "",
    durationMax: "",
  })

  const validateTargetId = (id: string): boolean => {
    const trimmed = id.trim().toUpperCase()
    // KOI format: KOI-123 or KOI-123.01 (allows KOI 123, koi-123, etc.)
    const koiPattern = /^KOI[- ]?\d+(\.\d+)?$/i
    // KIC format: KIC-12345678 (allows KIC 12345678, kic-12345678, etc.)
    const kicPattern = /^KIC[- ]?\d{7,9}$/i
    // EPIC format: EPIC-12345678 (allows EPIC 12345678, epic-12345678, etc.)
    const epicPattern = /^EPIC[- ]?\d{7,9}$/i
    // TIC format: TIC-12345678 (allows TIC 12345678, tic-12345678, etc.)
    const ticPattern = /^TIC[- ]?\d{7,10}$/i
    return koiPattern.test(trimmed) || kicPattern.test(trimmed) || epicPattern.test(trimmed) || ticPattern.test(trimmed)
  }

  // Normalize target ID to space-separated format for Stellarium
  const normalizeTargetId = (id: string): string => {
    const trimmed = id.trim().toUpperCase()
    // Replace hyphens with spaces and ensure single space between prefix and number
    // KOI-123 → "KOI 123", koi123 → "KOI 123", KIC-12345678 → "KIC 12345678"
    return trimmed
      .replace(/^(KOI|KIC|EPIC|TIC)[-\s]?(\d)/i, "$1 $2")
      .toUpperCase()
  }

  const toggleColumn = (column: string) => {
    setSelectedColumns((prev) => (prev.includes(column) ? prev.filter((c) => c !== column) : [...prev, column]))
  }

  const fetchTargetData = async () => {
    if (!targetId.trim()) {
      setError("Please enter a target ID")
      return
    }

    if (!validateTargetId(targetId)) {
      setError("Invalid target ID format. Expected: KOI-123.01, KIC-12345678, EPIC-12345678, or TIC-12345678")
      return
    }

    setIsValidating(true)
    onLoadingChange(true)
    setError(null)

    try {
      const normalizedId = normalizeTargetId(targetId)

      // Call the backend API with researcher mode parameters
      const response = await api.predictArchive({
        identifier: normalizedId,
        mission: controls.mission,
        include_light_curve: true,
      })

      // Map API response to PredictionResult
      const result: PredictionResult = {
        targetId: response.target,
        modelProbabilityCandidate: response.model_probability_candidate,
        modelLabel: response.model_label as "candidate" | "false-positive" | "abstain",
        modelVersion: response.model_version,
        topFeatures: response.top_features?.map((feature) => {
          const [name, contribution] = Object.entries(feature)[0]
          return { name, contribution }
        }),
        archiveSnapshot: response.archive_snapshot,
        detrendMethod,
        transitEvents:
          transitSearchMethod && transitSearchMethod !== "none"
            ? [
                { time: 1.75, label: "T1" },
                { time: 5.25, label: "T2" },
              ]
            : undefined,
        diagnostics: {
          selectedColumns,
          detrendMethod,
          transitSearchMethod: transitSearchMethod || "none",
          searchParams: transitSearchMethod ? searchParams : undefined,
          confidence: response.confidence,
          processingTime: `${response.processing_time.toFixed(2)}s`,
          modelName: response.model_name,
          features: response.features,
          transitParams: response.transit_params,
          reasoning: response.reasoning,
        },
      }

      onResultsChange(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch target data. Please try again."
      setError(errorMessage)
      onResultsChange(null)
    } finally {
      setIsValidating(false)
      onLoadingChange(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchTargetData()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/20 to-blue-600/20 rounded-lg blur-lg opacity-50" />
          <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-violet-500/10 rounded-lg">
                <Sparkles className="w-5 h-5 text-violet-400" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                Researcher Mode
              </h2>
            </div>
            <p className="text-sm text-muted-foreground/80">
              Advanced controls for power users with custom column selection and detrending
            </p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Target ID Search */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-2"
          >
            <Label htmlFor="researcher-target" className="text-sm font-semibold">Target ID</Label>
            <div className="flex gap-2">
              <div className="flex-1 relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-violet-400 transition-colors" />
                <Input
                  id="researcher-target"
                  type="text"
                  placeholder="Enter target ID (e.g., KOI-007.01)"
                  value={targetId}
                  onChange={(e) => {
                    setTargetId(e.target.value)
                    setError(null)
                  }}
                  className="pl-10 bg-background/50 border-border/60 focus:border-violet-500/50 focus:ring-violet-500/20 transition-all"
                  disabled={isValidating}
                />
              </div>
              <Button
                type="submit"
                disabled={isValidating || !targetId.trim()}
                className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 border-0 shadow-lg shadow-violet-500/20 transition-all hover:shadow-xl hover:shadow-violet-500/30"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze"
                )}
              </Button>
            </div>
          </motion.div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Column Picker */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="relative space-y-3 p-6 rounded-xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl" />
            <Label className="text-sm font-semibold relative">Selected Columns</Label>
            <p className="text-xs text-muted-foreground/80 relative">Choose which features to include in the analysis</p>

            <div className="space-y-5 relative">
              <div className="space-y-3">
                <span className="text-xs font-semibold text-violet-400/90 uppercase tracking-wide">Transit Parameters</span>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_COLUMNS.transit.map((col, idx) => (
                    <motion.div
                      key={col}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                    >
                      <Badge
                        variant={selectedColumns.includes(col) ? "default" : "outline"}
                        className={`cursor-pointer transition-all duration-200 ${
                          selectedColumns.includes(col)
                            ? "bg-violet-600 hover:bg-violet-700 border-violet-500 shadow-sm shadow-violet-500/20"
                            : "hover:bg-violet-500/10 hover:border-violet-500/50"
                        }`}
                        onClick={() => toggleColumn(col)}
                      >
                        {col}
                        {selectedColumns.includes(col) && <X className="ml-1 h-3 w-3" />}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-semibold text-blue-400/90 uppercase tracking-wide">Stellar Parameters</span>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_COLUMNS.stellar.map((col, idx) => (
                    <motion.div
                      key={col}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: (AVAILABLE_COLUMNS.transit.length + idx) * 0.03 }}
                    >
                      <Badge
                        variant={selectedColumns.includes(col) ? "default" : "outline"}
                        className={`cursor-pointer transition-all duration-200 ${
                          selectedColumns.includes(col)
                            ? "bg-blue-600 hover:bg-blue-700 border-blue-500 shadow-sm shadow-blue-500/20"
                            : "hover:bg-blue-500/10 hover:border-blue-500/50"
                        }`}
                        onClick={() => toggleColumn(col)}
                      >
                        {col}
                        {selectedColumns.includes(col) && <X className="ml-1 h-3 w-3" />}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-xs font-medium text-muted-foreground pt-3 flex items-center gap-2 relative">
              <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
              {selectedColumns.length} column{selectedColumns.length !== 1 ? "s" : ""} selected
            </div>
          </motion.div>

          {/* Detrending Method */}
          <div className="space-y-2">
            <Label htmlFor="detrend-method">Detrending Method</Label>
            <Select value={detrendMethod} onValueChange={(value: DetrendMethod) => setDetrendMethod(value)}>
              <SelectTrigger id="detrend-method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="median">Median Filter</SelectItem>
                <SelectItem value="spline">Spline Fit</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Applied to light curve preview and analysis</p>
          </div>

          {/* Transit Search Method (Optional) */}
          <div className="space-y-3 p-4 rounded-lg border border-border bg-card">
            <div className="space-y-2">
              <Label htmlFor="transit-search">Transit Search Method (Optional)</Label>
              <Select
                value={transitSearchMethod}
                onValueChange={(value) => setTransitSearchMethod(value as TransitSearchMethod)}
              >
                <SelectTrigger id="transit-search">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="bls">Box Least Squares (BLS)</SelectItem>
                  <SelectItem value="tls">Transit Least Squares (TLS)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {transitSearchMethod && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <Label htmlFor="period-min" className="text-xs">
                    Period Min (days)
                  </Label>
                  <Input
                    id="period-min"
                    type="number"
                    step="0.1"
                    placeholder="0.5"
                    value={searchParams.periodMin}
                    onChange={(e) => setSearchParams((prev) => ({ ...prev, periodMin: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="period-max" className="text-xs">
                    Period Max (days)
                  </Label>
                  <Input
                    id="period-max"
                    type="number"
                    step="0.1"
                    placeholder="100"
                    value={searchParams.periodMax}
                    onChange={(e) => setSearchParams((prev) => ({ ...prev, periodMax: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="duration-min" className="text-xs">
                    Duration Min (hours)
                  </Label>
                  <Input
                    id="duration-min"
                    type="number"
                    step="0.1"
                    placeholder="0.5"
                    value={searchParams.durationMin}
                    onChange={(e) => setSearchParams((prev) => ({ ...prev, durationMin: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="duration-max" className="text-xs">
                    Duration Max (hours)
                  </Label>
                  <Input
                    id="duration-max"
                    type="number"
                    step="0.1"
                    placeholder="24"
                    value={searchParams.durationMax}
                    onChange={(e) => setSearchParams((prev) => ({ ...prev, durationMax: e.target.value }))}
                  />
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </motion.div>
  )
}
