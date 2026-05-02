import { OrganizationUserRole } from '@zdravstvo/contracts'
import type { ReactElement } from 'react'

import { AppIcon } from '@/components'
import { useAuthStore } from '@/stores'

import { AdminReceptionDashboard } from './AdminReceptionDashboard'
import { DoctorDashboard } from './DoctorDashboard'
import { PatientDashboard } from './PatientDashboard'

function DashboardUnavailable(): ReactElement {
  return (
    <div className="dashboard-page">
      <section className="dashboard-section dashboard-section--empty">
        <AppIcon name="shieldCheck" />
        <h1>Nadzorna ploča nije dostupna</h1>
        <p>Uloga korisnika nije pronađena u trenutnom autentificiranom kontekstu.</p>
      </section>
    </div>
  )
}

export function DashboardPage(): ReactElement {
  const role = useAuthStore((state) => state.role)

  if (
    role === OrganizationUserRole.ADMIN ||
    role === OrganizationUserRole.RECEPTION
  ) {
    return <AdminReceptionDashboard />
  }

  if (role === OrganizationUserRole.DOCTOR) {
    return <DoctorDashboard />
  }

  if (role === OrganizationUserRole.PATIENT) {
    return <PatientDashboard />
  }

  return <DashboardUnavailable />
}
