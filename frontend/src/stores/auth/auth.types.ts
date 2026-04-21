import type {
  LoginResponseDto,
  OrganizationUserRole,
} from '@zdravstvo/contracts'

export type AuthUser = LoginResponseDto['user']

export interface AuthStateSnapshot {
  accessToken: string | null
  user: AuthUser | null
  role: OrganizationUserRole | null
  organizationId: string | null
}

export interface AuthStore extends AuthStateSnapshot {
  isAuthenticated: boolean
  setAuth: (auth: LoginResponseDto) => void
  setAccessToken: (accessToken: string | null) => void
  clearAuth: () => void
}
