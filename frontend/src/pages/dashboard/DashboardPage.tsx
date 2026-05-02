import { OrganizationUserRole } from '@zdravstvo/contracts'
import type { ReactElement } from 'react'

import { AppIcon } from '@/components'
import { useDashboardQuery } from '@/hooks'
import { useAuthStore } from '@/stores'

import { AdminReceptionDashboard } from './AdminReceptionDashboard'
import { DoctorDashboard } from './DoctorDashboard'
import { PatientDashboard } from './PatientDashboard'

interface DashboardStatusProps {
  title: string
  message: string
  icon?: 'activity' | 'shieldCheck' | 'warning'
}

function DashboardStatus({
  title,
  message,
  icon = 'shieldCheck',
}: DashboardStatusProps): ReactElement {
  return (
    <div className="dashboard-page">
      <section className="dashboard-section dashboard-section--empty">
        <AppIcon name={icon} />
        <h1>{title}</h1>
        <p>{message}</p>
      </section>
    </div>
  )
}

export function DashboardPage(): ReactElement {
  const role = useAuthStore((state) => state.role)
  const dashboardQuery = useDashboardQuery(role)

  if (!role) {
    return (
      <DashboardStatus
        title="Nadzorna ploča nije dostupna"
        message="Uloga korisnika nije pronađena u trenutnom autentificiranom kontekstu."
      />
    )
  }

  if (dashboardQuery.isPending) {
    return (
      <DashboardStatus
        title="Učitavanje nadzorne ploče"
        message="Podaci se dohvaćaju iz ustanove."
        icon="activity"
      />
    )
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <DashboardStatus
        title="Nadzorna ploča nije dostupna"
        message="Podatke trenutno nije moguće učitati."
        icon="warning"
      />
    )
  }

  const dashboard = dashboardQuery.data

  if (
    (role === OrganizationUserRole.ADMIN ||
      role === OrganizationUserRole.RECEPTION) &&
    (dashboard.role === OrganizationUserRole.ADMIN ||
      dashboard.role === OrganizationUserRole.RECEPTION)
  ) {
    return <AdminReceptionDashboard dashboard={dashboard} />
  }

  if (
    role === OrganizationUserRole.DOCTOR &&
    dashboard.role === OrganizationUserRole.DOCTOR
  ) {
    return <DoctorDashboard dashboard={dashboard} />
  }

  if (
    role === OrganizationUserRole.PATIENT &&
    dashboard.role === OrganizationUserRole.PATIENT
  ) {
    return <PatientDashboard dashboard={dashboard} />
  }

  return (
    <DashboardStatus
      title="Nadzorna ploča nije dostupna"
      message="Učitani podaci ne odgovaraju trenutnoj ulozi korisnika."
    />
  )
}
