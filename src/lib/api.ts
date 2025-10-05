const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://exodetectbackend-production.up.railway.app'

export interface PredictLightCurveRequest {
  time: number[]
  flux: number[]
  flux_err?: number[]
  target_id?: string
  mission?: string
  include_shap?: boolean
  include_neighbors?: boolean
  threshold?: number
}

export interface PredictFeaturesRequest {
  features: Record<string, number>
  target_id?: string
  include_shap?: boolean
  include_neighbors?: boolean
  threshold?: number
}

export interface PredictArchiveRequest {
  identifier: string
  mission?: string
  include_light_curve?: boolean
}

export interface UploadLightCurveRequest {
  file: File
  target_id?: string
  mission?: string
  include_shap?: boolean
  include_neighbors?: boolean
  threshold?: number
}

export interface BatchPredictRequest {
  target_ids: string[]
  mission?: string
  include_light_curve?: boolean
  include_shap?: boolean
  include_neighbors?: boolean
  threshold?: number
}

export interface APIResponse {
  target: string
  model_probability_candidate: number
  model_label: string
  confidence: string
  transit_params?: Record<string, unknown>
  features?: Record<string, unknown>
  top_features?: Array<{
    [key: string]: number
  }>
  reasoning?: string[]
  archive_snapshot?: Record<string, unknown>
  model_name: string
  model_version: string
  processing_time: number
}

export interface ModelInfo {
  model_name: string
  version: string
  input_features: string[]
  training_date: string
  metrics: {
    accuracy?: number
    precision?: number
    recall?: number
    f1_score?: number
  }
}

class ExoDetectAPI {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.detail || errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('An unknown error occurred')
    }
  }

  private async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, unknown>
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const formData = new FormData()
    formData.append('file', file)

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value))
        }
      })
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.detail || errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('An unknown error occurred')
    }
  }

  async predictLightCurve(data: PredictLightCurveRequest): Promise<APIResponse> {
    return this.request<APIResponse>('/api/predict/light-curve', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async predictFeatures(data: PredictFeaturesRequest): Promise<APIResponse> {
    return this.request<APIResponse>('/api/predict/features', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async predictArchive(data: PredictArchiveRequest): Promise<APIResponse> {
    return this.request<APIResponse>('/api/predict/archive', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async uploadLightCurve(data: UploadLightCurveRequest): Promise<APIResponse> {
    return this.uploadFile<APIResponse>('/api/predict/upload', data.file, {
      target_id: data.target_id,
      mission: data.mission,
      include_shap: data.include_shap,
      include_neighbors: data.include_neighbors,
      threshold: data.threshold,
    })
  }

  async batchPredict(data: BatchPredictRequest): Promise<APIResponse[]> {
    return this.request<APIResponse[]>('/api/predict/batch', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getModels(): Promise<ModelInfo[]> {
    return this.request<ModelInfo[]>('/api/models', {
      method: 'GET',
    })
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/health', {
      method: 'GET',
    })
  }
}

export const api = new ExoDetectAPI()
