import type { } from '@zdravstvo/contracts'
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
})
