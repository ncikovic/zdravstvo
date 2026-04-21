import { useMutation, type UseMutationResult } from '@tanstack/react-query'
import type { LoginRequestDto, LoginResponseDto } from '@zdravstvo/contracts'

import { authService } from '@/services'
import { useAuthStore } from '@/state'
import type { AppApiError } from '@/types'

export const useLoginMutation = (): UseMutationResult<
  LoginResponseDto,
  AppApiError,
  LoginRequestDto
> => {
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: (payload: LoginRequestDto) => authService.login(payload),
    throwOnError: false,
    onSuccess: (session: LoginResponseDto) => {
      setSession(session)
    },
  })
}
