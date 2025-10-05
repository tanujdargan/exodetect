"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, FileText, X, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { GlobalControls, PredictionResult } from "@/lib/types"

interface UploadModeProps {
  controls: GlobalControls
  onResultsChange: (result: PredictionResult | null) => void
  onLoadingChange: (loading: boolean) => void
}

interface UploadedFile {
  file: File
  preview?: {
    rows: number
    columns: string[]
    sampleData: Record<string, any>[]
  }
}

export function UploadMode({ controls, onResultsChange, onLoadingChange }: UploadModeProps) {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [targetIdOverride, setTargetIdOverride] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): boolean => {
    const validExtensions = [".csv", ".fits", ".fit"]
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."))

    if (!validExtensions.includes(extension)) {
      setError(`Invalid file type. Please upload a CSV or FITS file.`)
      return false
    }

    if (file.size > 50 * 1024 * 1024) {
      setError("File size exceeds 50MB limit.")
      return false
    }

    return true
  }

  const parseCSV = async (file: File): Promise<UploadedFile["preview"]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const lines = text.split("\n").filter((line) => line.trim())

          if (lines.length < 2) {
            reject(new Error("CSV file must contain at least a header and one data row"))
            return
          }

          const headers = lines[0].split(",").map((h) => h.trim())
          const sampleData = lines.slice(1, Math.min(6, lines.length)).map((line) => {
            const values = line.split(",")
            const row: Record<string, any> = {}
            headers.forEach((header, idx) => {
              row[header] = values[idx]?.trim() || ""
            })
            return row
          })

          resolve({
            rows: lines.length - 1,
            columns: headers,
            sampleData,
          })
        } catch (err) {
          reject(new Error("Failed to parse CSV file"))
        }
      }

      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsText(file)
    })
  }

  const handleFile = async (file: File) => {
    setError(null)

    if (!validateFile(file)) {
      return
    }

    setIsProcessing(true)

    try {
      let preview: UploadedFile["preview"] | undefined

      if (file.name.toLowerCase().endsWith(".csv")) {
        preview = await parseCSV(file)
      } else {
        preview = {
          rows: 0,
          columns: ["time", "flux", "flux_err"],
          sampleData: [],
        }
      }

      setUploadedFile({ file, preview })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process file")
      setUploadedFile(null)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    setError(null)
    setTargetIdOverride("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const runInference = async () => {
    if (!uploadedFile) return

    onLoadingChange(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mockResult: PredictionResult = {
        targetId: targetIdOverride || uploadedFile.file.name.replace(/\.(csv|fits|fit)$/i, ""),
        modelProbabilityCandidate: 0.65,
        modelLabel: controls.threshold <= 0.65 ? "candidate" : "false-positive",
        modelVersion: "v2.1.0-upload",
        topFeatures: controls.explainability.featureImportances
          ? [
              { name: "transit_depth_ppm", contribution: 0.198 },
              { name: "snr", contribution: 0.176 },
              { name: "duration_hours", contribution: 0.154 },
            ]
          : undefined,
        nearestExamples: controls.explainability.nearestExamples
          ? [
              { id: "KOI-123.01", distance: 0.034, disposition: "CANDIDATE" },
              { id: "KOI-456.01", distance: 0.052, disposition: "FALSE POSITIVE" },
            ]
          : undefined,
        diagnostics: {
          uploadedFile: uploadedFile.file.name,
          fileSize: `${(uploadedFile.file.size / 1024).toFixed(2)} KB`,
          rows: uploadedFile.preview?.rows || 0,
        },
      }

      onResultsChange(mockResult)
    } catch (err) {
      setError("Failed to run inference. Please try again.")
      onResultsChange(null)
    } finally {
      onLoadingChange(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Upload Mode</h2>
          <p className="text-sm text-muted-foreground">Upload your own light curve data for classification</p>
        </div>

        {!uploadedFile ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative border-2 border-dashed rounded-lg p-12 transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.fits,.fit"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isProcessing}
            />

            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="p-4 rounded-full bg-muted">
                {isProcessing ? (
                  <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                ) : (
                  <Upload className="h-8 w-8 text-muted-foreground" />
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {isProcessing ? "Processing file..." : "Drop your file here or click to browse"}
                </p>
                <p className="text-xs text-muted-foreground">Supports CSV and FITS files up to 50MB</p>
              </div>

              <Button type="button" variant="secondary" size="sm" disabled={isProcessing}>
                Select File
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Info */}
            <div className="flex items-start justify-between p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 rounded bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{uploadedFile.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(uploadedFile.file.size / 1024).toFixed(2)} KB
                    {uploadedFile.preview && ` • ${uploadedFile.preview.rows} rows`}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={removeFile} className="shrink-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* File Preview */}
            {uploadedFile.preview && uploadedFile.preview.sampleData.length > 0 && (
              <div className="space-y-3 p-4 rounded-lg border border-border bg-card">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <h3 className="text-sm font-semibold">File Preview</h3>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {uploadedFile.preview.columns.map((col) => (
                      <Badge key={col} variant="secondary" className="text-xs">
                        {col}
                      </Badge>
                    ))}
                  </div>

                  <div className="rounded-lg bg-muted/30 p-3 max-h-48 overflow-auto">
                    <pre className="text-xs font-mono">{JSON.stringify(uploadedFile.preview.sampleData, null, 2)}</pre>
                  </div>
                </div>
              </div>
            )}

            {/* Optional Target ID Override */}
            <div className="space-y-2">
              <Label htmlFor="target-override" className="text-sm">
                Target ID (Optional)
              </Label>
              <Input
                id="target-override"
                type="text"
                placeholder="e.g., Custom-Target-001"
                value={targetIdOverride}
                onChange={(e) => setTargetIdOverride(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Override the default target ID for this upload</p>
            </div>

            {/* Run Inference Button */}
            <Button onClick={runInference} className="w-full" size="lg">
              Run Classification
            </Button>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Format Requirements */}
        <div className="space-y-2 p-4 rounded-lg bg-muted/30">
          <h3 className="text-sm font-semibold">File Format Requirements</h3>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>CSV files must contain columns: time, flux (flux_err optional)</li>
            <li>FITS files should follow standard light curve format</li>
            <li>Time values should be in BJD or similar continuous format</li>
            <li>Flux values should be normalized or in relative units</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
