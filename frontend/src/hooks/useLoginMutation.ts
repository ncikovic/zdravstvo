import { useMutation, type UseMutationResult } from '@tanstack/react-query'
import type {
  LoginRequestDto,
  LoginResponseDto,
  ForgotPasswordRequestDto,
  ForgotPasswordResponseDto,
  SelectOrganizationRequestDto,
  SelectOrganizationResponseDto,
} from '@zdravstvo/contracts'

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
      if (auth.authenticated) {
        setAuth(auth)
      }
    },
  })
}

export const useSelectOrganizationMutation = (): UseMutationResult<
  SelectOrganizationResponseDto,
  AppApiError,
  SelectOrganizationRequestDto
> => {
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: (payload: SelectOrganizationRequestDto) =>
      authService.selectOrganization(payload),
    throwOnError: false,
    onSuccess: (auth: SelectOrganizationResponseDto) => {
      setAuth(auth)
    },
  })
}

export const useForgotPasswordMutation = (): UseMutationResult<
  ForgotPasswordResponseDto,
  AppApiError,
  ForgotPasswordRequestDto
> => {
  return useMutation({
    mutationFn: (payload: ForgotPasswordRequestDto) =>
      authService.requestPasswordReset(payload),
    throwOnError: false,
  })
}
