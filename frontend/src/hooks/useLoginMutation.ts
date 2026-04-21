import { useMutation, type UseMutationResult } from '@tanstack/react-query'
import type { LoginRequestDto, LoginResponseDto } from '@zdravstvo/contracts'

import { authService } from '@/services'
import { useAuthStore } from '@/stores'
import type { AppApiError } from '@/types'

export const useLoginMutation = (): UseMutationResult<
  LoginResponseDto,
  AppApiError,
  LoginRequestDto
> => {
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: (payload: LoginRequestDto) => authService.login(payload),
    throwOnError: false,
    onSuccess: (auth: LoginResponseDto) => {
      setAuth(auth)
    },
  })
}
