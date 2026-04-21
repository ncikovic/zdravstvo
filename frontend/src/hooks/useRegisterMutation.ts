import { useMutation, type UseMutationResult } from '@tanstack/react-query'
import type { RegisterRequestDto, RegisterResponseDto } from '@zdravstvo/contracts'

import { authService } from '@/services'
import type { AppApiError } from '@/types'

export const useRegisterMutation = (): UseMutationResult<
  RegisterResponseDto,
  AppApiError,
  RegisterRequestDto
> => {
  return useMutation({
    mutationFn: (payload: RegisterRequestDto) => authService.register(payload),
    throwOnError: false,
  })
}
