import {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from 'axios'
import axios from 'axios'

import { clearAuthState, getAuthToken } from '@/state'
import type { AppApiError } from '@/types'

const NETWORK_ERROR_CODE = 'NETWORK_ERROR'
const NETWORK_ERROR_MESSAGE = 'Network error. Please try again.'
const UNAUTHORIZED_GUARD_MS = 250

let isHandlingUnauthorized = false

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const normalizeApiError = (error: AxiosError): AppApiError => {
  if (!error.response) {
    return {
      status: 0,
      code: error.code ?? NETWORK_ERROR_CODE,
      message: error.message || NETWORK_ERROR_MESSAGE,
    }
  }

  const { data, status } = error.response
  const payload = isRecord(data) ? data : null
  const nestedError =
    payload && isRecord(payload.error) ? payload.error : null
  const payloadCode =
    nestedError && typeof nestedError.code === 'string'
      ? nestedError.code
      : payload && typeof payload.code === 'string'
        ? payload.code
        : undefined
  const payloadMessage =
    nestedError && typeof nestedError.message === 'string'
      ? nestedError.message
      : payload && typeof payload.message === 'string'
        ? payload.message
        : undefined
  const payloadDetails =
    nestedError && 'details' in nestedError
      ? nestedError.details
      : payload && 'details' in payload
        ? payload.details
        : data

  return {
    status,
    code: payloadCode ?? error.code ?? `HTTP_${status}`,
    message: payloadMessage ?? (error.message || 'Request failed.'),
    details: payloadDetails,
  }
}

const attachAuthorizationHeader = (
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig => {
  const token = getAuthToken()

  if (!token) {
    return config
  }

  const headers = AxiosHeaders.from(config.headers)
  headers.set('Authorization', `Bearer ${token}`)
  config.headers = headers

  return config
}

const handleUnauthorized = (): void => {
  if (isHandlingUnauthorized) {
    return
  }

  isHandlingUnauthorized = true
  clearAuthState()

  if (
    typeof window !== 'undefined' &&
    window.location.pathname !== '/login'
  ) {
    window.location.assign('/login')
  }

  if (typeof window !== 'undefined') {
    window.setTimeout(() => {
      isHandlingUnauthorized = false
    }, UNAUTHORIZED_GUARD_MS)
  } else {
    isHandlingUnauthorized = false
  }
}

export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

apiClient.interceptors.request.use(attachAuthorizationHeader)

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401) {
      handleUnauthorized()
    }

    return Promise.reject(normalizeApiError(error))
  },
)
