import type { ReactElement } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { OrganizationUserRole } from '@zdravstvo/contracts'
import { useAuthStore } from '@/stores'

import { APP_ROUTES } from './routes'

const getRoleHome = (
  isSystemAdmin: boolean | null,
  role: OrganizationUserRole | null,
): string => {
  if (isSystemAdmin) return APP_ROUTES.adminOrganizations
  if (role === OrganizationUserRole.MANAGER) return APP_ROUTES.schedule
  if (role === OrganizationUserRole.RECEPTION) return APP_ROUTES.schedule
  if (role === OrganizationUserRole.DOCTOR) return APP_ROUTES.doctorOwnSchedule
  if (role === OrganizationUserRole.PATIENT) return APP_ROUTES.myAppointments
  return APP_ROUTES.dashboard
}

export function ProtectedRoute(): ReactElement {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={APP_ROUTES.login} replace state={{ from: location }} />
  }

  return <Outlet />
}

export function PublicOnlyRoute(): ReactElement {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isSystemAdmin = useAuthStore((state) => state.isSystemAdmin)
  const role = useAuthStore((state) => state.role)

  if (isAuthenticated) {
    return <Navigate to={getRoleHome(isSystemAdmin, role)} replace />
  }

  return <Outlet />
}

export function SystemAdminRoute(): ReactElement {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isSystemAdmin = useAuthStore((state) => state.isSystemAdmin)

  if (!isAuthenticated) {
    return <Navigate to={APP_ROUTES.login} replace />
  }

  if (!isSystemAdmin) {
    return <Navigate to={APP_ROUTES.forbidden} replace />
  }

  return <Outlet />
}

export function DoctorRoute(): ReactElement {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const role = useAuthStore((state) => state.role)

  if (!isAuthenticated) {
    return <Navigate to={APP_ROUTES.login} replace />
  }

  if (role !== OrganizationUserRole.DOCTOR) {
    return <Navigate to={APP_ROUTES.forbidden} replace />
  }

  return <Outlet />
}

export function PatientRoute(): ReactElement {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const role = useAuthStore((state) => state.role)

  if (!isAuthenticated) {
    return <Navigate to={APP_ROUTES.login} replace />
  }

  if (role !== OrganizationUserRole.PATIENT) {
    return <Navigate to={APP_ROUTES.forbidden} replace />
  }

  return <Outlet />
}

export function StaffRoute(): ReactElement {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const role = useAuthStore((state) => state.role)

  if (!isAuthenticated) {
    return <Navigate to={APP_ROUTES.login} replace />
  }

  const staffRoles: readonly OrganizationUserRole[] = [
    OrganizationUserRole.MANAGER,
    OrganizationUserRole.RECEPTION,
    OrganizationUserRole.DOCTOR,
  ]

  if (!role || !staffRoles.includes(role)) {
    return <Navigate to={APP_ROUTES.forbidden} replace />
  }

  return <Outlet />
}
