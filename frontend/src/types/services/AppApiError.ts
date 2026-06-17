export interface AppApiError {
  status: number
  code: string
  message: string
  details?: unknown
}
