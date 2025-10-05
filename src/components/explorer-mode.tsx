"use client"

import type React from "react"

import { useState } from "react"
import { Search, Loader2, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import type { GlobalControls, PredictionResult } from "@/lib/types"

interface ExplorerModeProps {
  controls: GlobalControls
  onResultsChange: (result: PredictionResult | null) => void
  onLoadingChange: (loading: boolean) => void
}

interface ArchiveData {
  koi_disposition?: string
  koi_pdisposition?: string
  koi_score?: number
  vetting_flags?: {
    ntl?: boolean
    ss?: boolean
    co?: boolean
    em?: boolean
  }
}

export function ExplorerMode({ controls, onResultsChange, onLoadingChange }: ExplorerModeProps) {
  const [targetId, setTargetId] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [archiveData, setArchiveData] = useState<ArchiveData | null>(null)
  const [showOptions, setShowOptions] = useState({
    disposition: false,
    pdisposition: false,
    score: false,
    vettingFlags: false,
    lightCurve: true,
  })

  // Validate target ID format
  const validateTargetId = (id: string): boolean => {
    const trimmed = id.trim().toUpperCase()

    // KOI format: KOI-123 or KOI-123.01
    const koiPattern = /^KOI-\d+(\.\d+)?$/
    // KIC format: KIC-12345678
    const kicPattern = /^KIC-?\d{8,9}$/
    // EPIC format: EPIC-12345678
    const epicPattern = /^EPIC-?\d{8,9}$/
    // TIC format: TIC-12345678
    const ticPattern = /^TIC-?\d{8,10}$/

    return koiPattern.test(trimmed) || kicPattern.test(trimmed) || epicPattern.test(trimmed) || ticPattern.test(trimmed)
  }

  const handleInputChange = (value: string) => {
    setTargetId(value)
    setError(null)
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock archive data
      const mockArchive: ArchiveData = {
        koi_disposition: "CANDIDATE",
        koi_pdisposition: "CANDIDATE",
        koi_score: 0.85,
        vetting_flags: {
          ntl: false,
          ss: false,
          co: true,
          em: false,
        },
      }
      setArchiveData(mockArchive)

      // Mock prediction result
      const mockResult: PredictionResult = {
        targetId: targetId.trim().toUpperCase(),
        modelProbabilityCandidate: 0.87,
        modelLabel: controls.threshold <= 0.87 ? "candidate" : "false-positive",
        modelVersion: "v2.1.0",
        topFeatures: controls.explainability.featureImportances
          ? [
              { name: "transit_depth_ppm", contribution: 0.234 },
              { name: "transit_duration_hours", contribution: 0.189 },
              { name: "period_days", contribution: 0.156 },
              { name: "snr", contribution: 0.142 },
            ]
          : undefined,
        nearestExamples: controls.explainability.nearestExamples
          ? [
              { id: "KOI-456.01", distance: 0.023, disposition: "CONFIRMED" },
              { id: "KOI-789.01", distance: 0.045, disposition: "CANDIDATE" },
            ]
          : undefined,
        archiveSnapshot: mockArchive as Record<string, unknown>,
        lightCurve: showOptions.lightCurve ? generateMockLightCurve() : undefined,
        transitEvents: showOptions.lightCurve
          ? [
              { time: 1.75, label: "T1" },
              { time: 5.25, label: "T2" },
            ]
          : undefined,
      }

      onResultsChange(mockResult)
    } catch (_err) {
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
          <h2 className="text-2xl font-bold mb-2">Explorer Mode</h2>
          <p className="text-sm text-muted-foreground">
            Search for known targets from the exoplanet archive by their ID
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter target ID (e.g., KOI-123.01, KIC-12345678)"
                value={targetId}
                onChange={(e) => handleInputChange(e.target.value)}
                className="pl-10"
                disabled={isValidating}
              />
            </div>
            <Button type="submit" disabled={isValidating || !targetId.trim()}>
              {isValidating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </form>

        {/* Archive data display options */}
        {archiveData && (
          <div className="space-y-4 p-4 rounded-lg border border-border bg-card">
            <h3 className="text-sm font-semibold">Archive Data Options</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="show-lightcurve"
                  checked={showOptions.lightCurve}
                  onCheckedChange={(checked) => setShowOptions((prev) => ({ ...prev, lightCurve: checked === true }))}
                />
                <Label htmlFor="show-lightcurve" className="text-sm font-normal cursor-pointer">
                  Fetch Light Curve
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="show-disposition"
                  checked={showOptions.disposition}
                  onCheckedChange={(checked) => setShowOptions((prev) => ({ ...prev, disposition: checked === true }))}
                />
                <Label htmlFor="show-disposition" className="text-sm font-normal cursor-pointer">
                  Show KOI Disposition
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="show-pdisposition"
                  checked={showOptions.pdisposition}
                  onCheckedChange={(checked) => setShowOptions((prev) => ({ ...prev, pdisposition: checked === true }))}
                />
                <Label htmlFor="show-pdisposition" className="text-sm font-normal cursor-pointer">
                  Show KOI P-Disposition
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="show-score"
                  checked={showOptions.score}
                  onCheckedChange={(checked) => setShowOptions((prev) => ({ ...prev, score: checked === true }))}
                />
                <Label htmlFor="show-score" className="text-sm font-normal cursor-pointer">
                  Show KOI Score
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="show-vetting"
                  checked={showOptions.vettingFlags}
                  onCheckedChange={(checked) => setShowOptions((prev) => ({ ...prev, vettingFlags: checked === true }))}
                />
                <Label htmlFor="show-vetting" className="text-sm font-normal cursor-pointer">
                  Show Vetting Flags
                </Label>
              </div>
            </div>

            {/* Display selected archive data */}
            {(showOptions.disposition || showOptions.pdisposition || showOptions.score || showOptions.vettingFlags) && (
              <div className="space-y-3 pt-4 border-t border-border">
                {showOptions.disposition && archiveData.koi_disposition && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">KOI Disposition:</span>
                    <Badge variant="outline">{archiveData.koi_disposition}</Badge>
                  </div>
                )}

                {showOptions.pdisposition && archiveData.koi_pdisposition && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">KOI P-Disposition:</span>
                    <Badge variant="outline">{archiveData.koi_pdisposition}</Badge>
                  </div>
                )}

                {showOptions.score && archiveData.koi_score !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">KOI Score:</span>
                    <span className="text-sm font-mono">{archiveData.koi_score.toFixed(2)}</span>
                  </div>
                )}

                {showOptions.vettingFlags && archiveData.vetting_flags && (
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Vetting Flags:</span>
                    <div className="flex flex-wrap gap-2">
                      {archiveData.vetting_flags.ntl && (
                        <Badge variant="secondary" className="text-xs">
                          NTL
                        </Badge>
                      )}
                      {archiveData.vetting_flags.ss && (
                        <Badge variant="secondary" className="text-xs">
                          SS
                        </Badge>
                      )}
                      {archiveData.vetting_flags.co && (
                        <Badge variant="secondary" className="text-xs">
                          CO
                        </Badge>
                      )}
                      {archiveData.vetting_flags.em && (
                        <Badge variant="secondary" className="text-xs">
                          EM
                        </Badge>
                      )}
                      {!Object.values(archiveData.vetting_flags).some(Boolean) && (
                        <span className="text-sm text-muted-foreground">None</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
