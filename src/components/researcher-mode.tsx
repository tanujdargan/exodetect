"use client"

import type React from "react"

import { useState } from "react"
import { Search, Loader2, AlertCircle, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { GlobalControls, PredictionResult, DetrendMethod, TransitSearchMethod } from "@/lib/types"

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
  const [transitSearchMethod, setTransitSearchMethod] = useState<TransitSearchMethod | "">("none")
  const [searchParams, setSearchParams] = useState({
    periodMin: "",
    periodMax: "",
    durationMin: "",
    durationMax: "",
  })

  const validateTargetId = (id: string): boolean => {
    const trimmed = id.trim().toUpperCase()
    const koiPattern = /^KOI-\d+(\.\d+)?$/
    const kicPattern = /^KIC-?\d{8,9}$/
    const epicPattern = /^EPIC-?\d{8,9}$/
    const ticPattern = /^TIC-?\d{8,10}$/
    return koiPattern.test(trimmed) || kicPattern.test(trimmed) || epicPattern.test(trimmed) || ticPattern.test(trimmed)
  }

  const toggleColumn = (column: string) => {
    setSelectedColumns((prev) => (prev.includes(column) ? prev.filter((c) => c !== column) : [...prev, column]))
  }

  const generateMockLightCurve = () => {
    const points = 1000
    const time: number[] = []
    const flux: number[] = []
    const fluxErr: number[] = []

    for (let i = 0; i < points; i++) {
      const t = i * 0.02
      time.push(t)
      let f = 1.0 + Math.random() * 0.001
      if ((t % 3.5 > 1.7 && t % 3.5 < 1.85) || (t % 3.5 > 5.2 && t % 3.5 < 5.35)) {
        f -= 0.015
      }
      flux.push(f)
      fluxErr.push(0.0005 + Math.random() * 0.0003)
    }

    return { time, flux, fluxErr }
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
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const mockResult: PredictionResult = {
        targetId: targetId.trim().toUpperCase(),
        modelProbabilityCandidate: 0.73,
        modelLabel: controls.threshold <= 0.73 ? "candidate" : "false-positive",
        modelVersion: "v2.1.0-researcher",
        topFeatures: controls.explainability.featureImportances
          ? selectedColumns.slice(0, 5).map((col, idx) => ({
              name: col,
              contribution: 0.25 - idx * 0.04,
            }))
          : undefined,
        nearestExamples: controls.explainability.nearestExamples
          ? [
              { id: "KOI-456.01", distance: 0.023, disposition: "CONFIRMED" },
              { id: "KOI-789.01", distance: 0.045, disposition: "CANDIDATE" },
            ]
          : undefined,
        lightCurve: generateMockLightCurve(),
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
        },
      }

      onResultsChange(mockResult)
    } catch (err) {
      setError("Failed to fetch target data. Please try again.")
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
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Researcher Mode</h2>
          <p className="text-sm text-muted-foreground">
            Advanced controls for power users with custom column selection and detrending
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Target ID Search */}
          <div className="space-y-2">
            <Label htmlFor="researcher-target">Target ID</Label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="researcher-target"
                  type="text"
                  placeholder="Enter target ID (e.g., KOI-123.01)"
                  value={targetId}
                  onChange={(e) => {
                    setTargetId(e.target.value)
                    setError(null)
                  }}
                  className="pl-10"
                  disabled={isValidating}
                />
              </div>
              <Button type="submit" disabled={isValidating || !targetId.trim()}>
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
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Column Picker */}
          <div className="space-y-3 p-4 rounded-lg border border-border bg-card">
            <Label className="text-sm font-semibold">Selected Columns</Label>
            <p className="text-xs text-muted-foreground">Choose which features to include in the analysis</p>

            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground">Transit Parameters</span>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_COLUMNS.transit.map((col) => (
                    <Badge
                      key={col}
                      variant={selectedColumns.includes(col) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => toggleColumn(col)}
                    >
                      {col}
                      {selectedColumns.includes(col) && <X className="ml-1 h-3 w-3" />}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground">Stellar Parameters</span>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_COLUMNS.stellar.map((col) => (
                    <Badge
                      key={col}
                      variant={selectedColumns.includes(col) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => toggleColumn(col)}
                    >
                      {col}
                      {selectedColumns.includes(col) && <X className="ml-1 h-3 w-3" />}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground pt-2">
              {selectedColumns.length} column{selectedColumns.length !== 1 ? "s" : ""} selected
            </div>
          </div>

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
                onValueChange={(value) => setTransitSearchMethod(value as TransitSearchMethod | "")}
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
    </div>
  )
}
