import { toast as sonner } from 'sonner'

import { getApiErrorMessage } from './errors'

export const toast = {
  success: (message: string) => sonner.success(message),
  error: (error: unknown) => sonner.error(getApiErrorMessage(error)),
  info: (message: string) => sonner.info(message),
}
