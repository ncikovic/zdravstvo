import { OrganizationUserRole } from '@zdravstvo/contracts'
import type { ReactElement } from 'react'
import { useSearchParams } from 'react-router-dom'

import { AppIcon } from '@/components'
import { useDashboardQuery } from '@/hooks'
import { useAuthStore } from '@/stores'

import { AdminReceptionDashboard } from './AdminReceptionDashboard'
import { DoctorDashboard } from './DoctorDashboard'
import { PatientDashboard } from './PatientDashboard'

const DATE_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const formatDateInput = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const resolveSelectedDate = (value: string | null): string =>
  value && DATE_INPUT_PATTERN.test(value) ? value : formatDateInput(new Date())

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
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedDate = resolveSelectedDate(searchParams.get('date'))
  const dashboardQuery = useDashboardQuery(role, selectedDate)

  const updateSelectedDate = (date: string): void => {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams)

      nextParams.set('date', date)

      return nextParams
    })
  }

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
    return (
      <AdminReceptionDashboard
        dashboard={dashboard}
        selectedDate={selectedDate}
        onSelectedDateChange={updateSelectedDate}
      />
    )
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
