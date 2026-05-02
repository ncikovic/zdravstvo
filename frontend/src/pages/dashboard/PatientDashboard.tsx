import type { ReactElement } from 'react'

import { AppIcon } from '@/components'

import { patientReminders, patientStats } from './dashboard.data'
import {
  AvatarBadge,
  DashboardSection,
  DashboardStatCard,
  IconTile,
  StatusBadge,
} from './DashboardPrimitives'

export function PatientDashboard(): ReactElement {
  return (
    <div className="dashboard-page dashboard-page--patient">
      <div className="dashboard-page__hero">
        <div>
          <h1>Nadzorna ploča</h1>
          <p>Pregledajte svoje termine, obavijesti i upravljajte svojim zdravstvenim obavezama.</p>
        </div>
      </div>

      <div className="dashboard-stat-grid dashboard-stat-grid--four">
        {patientStats.map((stat) => (
          <DashboardStatCard key={stat.label} stat={stat} />
        ))}
      </div>

      <div className="dashboard-grid dashboard-grid--patient">
        <DashboardSection title="Sljedeći termin" icon="calendarCheck" className="patient-appointment">
          <div className="patient-appointment__status">
            <StatusBadge tone="teal">Potvrđeno</StatusBadge>
          </div>
          <div className="patient-appointment__doctor">
            <AvatarBadge initials="IK" tone="blue" />
            <span>
              <strong>dr. sc. Ivana Kovačević</strong>
              <small>Specijalist obiteljske medicine</small>
            </span>
            <div className="patient-appointment__illustration" aria-hidden="true">
              <AppIcon name="calendarCheck" />
            </div>
          </div>
          <div className="patient-appointment__meta">
            <span>
              <AppIcon name="calendar" />
              <strong>Datum</strong>
              15. svibnja 2025.
              <small>četvrtak</small>
            </span>
            <span>
              <AppIcon name="clock" />
              <strong>Vrijeme</strong>
              10:30
              <small>(30 min)</small>
            </span>
            <span>
              <AppIcon name="building" />
              <strong>Lokacija</strong>
              Dom zdravlja Zagreb - Centar
              <small>Ivana Lučića 2A, Zagreb</small>
            </span>
            <span>
              <AppIcon name="clipboard" />
              <strong>Vrsta termina</strong>
              Redovni pregled
            </span>
          </div>
          <p className="patient-appointment__note">
            <AppIcon name="info" />
            Molimo dođite 10 minuta ranije i ponesite sa sobom zdravstvenu iskaznicu.
          </p>
          <div className="patient-appointment__actions">
            <button className="dashboard-gradient-action" type="button">
              <AppIcon name="calendarCheck" />
              Detalji termina
            </button>
            <button className="dashboard-secondary-action" type="button">
              <AppIcon name="calendar" />
              Promijeni termin
            </button>
          </div>
        </DashboardSection>

        <div className="dashboard-side-stack">
          <DashboardSection title="Brze akcije" icon="plus">
            <button className="patient-action patient-action--primary" type="button">
              <IconTile icon="calendarCheck" tone="teal" />
              <span>
                <strong>Rezerviraj termin</strong>
                <small>Odaberite liječnika i pronađite slobodan termin</small>
              </span>
              <AppIcon name="chevronRight" />
            </button>
            <button className="patient-action" type="button">
              <IconTile icon="calendar" tone="blue" />
              <span>
                <strong>Pregledaj moje termine</strong>
                <small>Pogledajte sve svoje nadolazeće termine</small>
              </span>
              <AppIcon name="chevronRight" />
            </button>
          </DashboardSection>

          <DashboardSection
            title="Podsjetnici i obavijesti"
            icon="bell"
            footerLabel="Pogledaj sve obavijesti"
          >
            <div className="dashboard-compact-list">
              {patientReminders.map((reminder) => (
                <div className="dashboard-compact-row" key={reminder.title}>
                  <IconTile icon={reminder.icon} tone={reminder.tone} />
                  <span>
                    <strong>{reminder.title}</strong>
                    <small>{reminder.meta}</small>
                  </span>
                  <StatusBadge tone={reminder.tone}>{reminder.status}</StatusBadge>
                  <button className="dashboard-row-action" type="button" aria-label="Otvori podsjetnik">
                    <AppIcon name="chevronRight" />
                  </button>
                </div>
              ))}
            </div>
          </DashboardSection>
        </div>
      </div>

      <section className="patient-health-banner">
        <IconTile icon="shield" tone="blue" />
        <span>
          <strong>Vaše zdravlje na prvom mjestu</strong>
          <small>Redovitim pregledima i preventivnim mjerama čuvajte svoje zdravlje.</small>
        </span>
        <button type="button">
          Saznajte više o preventivi
          <AppIcon name="chevronRight" />
        </button>
      </section>
    </div>
  )
}
