export type UserMode = "explorer" | "researcher" | "upload"
export type Mission = "kepler" | "k2" | "tess" | "other"
export type DetrendMethod = "none" | "median" | "spline"
export type TransitSearchMethod = "none" | "bls" | "tls"

export interface GlobalControls {
  mode: UserMode
  mission: Mission
  threshold: number
  explainability: {
    featureImportances: boolean
    nearestExamples: boolean
  }
  returnRawFeatures: boolean
}

export interface PredictionResult {
  targetId: string
  modelProbabilityCandidate: number
  modelLabel: "candidate" | "false-positive" | "abstain"
  modelVersion: string
  topFeatures?: Array<{
    name: string
    contribution: number
  }>
  nearestExamples?: Array<{
    id: string
    distance: number
    disposition: string
  }>
  archiveSnapshot?: Record<string, unknown>
  diagnostics?: Record<string, unknown>
  lightCurve?: LightCurveData
  detrendMethod?: DetrendMethod
  transitEvents?: Array<{ time: number; label: string }>
}

export interface LightCurveData {
  time: number[]
  flux: number[]
  fluxErr?: number[]
}

export interface ResearcherOptions {
  selectedColumns: string[]
  detrendMethod: DetrendMethod
  transitSearchMethod?: TransitSearchMethod
  transitSearchParams?: {
    periodMin?: number
    periodMax?: number
    durationMin?: number
    durationMax?: number
  }
}
