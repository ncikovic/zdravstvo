import type { ReactElement } from 'react'

import { AppIcon } from '@/components'
import type { DoctorDashboard as DoctorDashboardData } from '@/types'

import { doctorLocalNotes } from './dashboard.data'
import { mapDoctorDashboard } from './dashboard.mappers'
import {
  AvatarBadge,
  DashboardSection,
  DashboardStatCard,
  IconTile,
  StatusBadge,
} from './DashboardPrimitives'

interface DoctorDashboardProps {
  dashboard: DoctorDashboardData
}

export function DoctorDashboard({ dashboard }: DoctorDashboardProps): ReactElement {
  const view = mapDoctorDashboard(dashboard)

  return (
    <div className="dashboard-page dashboard-page--doctor">
      <div className="dashboard-stat-grid dashboard-stat-grid--four">
        {view.stats.map((stat) => (
          <DashboardStatCard key={stat.label} stat={stat} />
        ))}
      </div>

      <div className="dashboard-grid dashboard-grid--doctor">
        <div className="dashboard-main-stack">
          <DashboardSection
            title="Današnji raspored"
            icon="calendar"
            actionLabel="Pogledaj cijeli raspored"
            footerLabel="Prikaži još termina"
          >
            <div className="dashboard-table dashboard-table--doctor" role="table">
              {view.scheduleRows.length > 0 ? view.scheduleRows.map((row) => (
                <div className="dashboard-table__row" role="row" key={`${row.time}-${row.name}`}>
                  <strong className="dashboard-table__time">{row.time}</strong>
                  <span
                    className={
                      row.current
                        ? 'dashboard-live-dot dashboard-live-dot--active'
                        : 'dashboard-live-dot'
                    }
                    aria-hidden="true"
                  />
                  <AvatarBadge initials={row.initials} tone={row.tone} />
                  <span className="dashboard-table__person">
                    <strong>{row.name}</strong>
                    <small>{row.meta}</small>
                  </span>
                  <StatusBadge tone={row.tone}>{row.type}</StatusBadge>
                  <button className="dashboard-row-action" type="button" aria-label="Opcije termina">
                    <AppIcon name="dots" />
                  </button>
                </div>
              )) : (
                <div className="dashboard-table__row" role="row">
                  <strong className="dashboard-table__time">--:--</strong>
                  <span className="dashboard-live-dot" aria-hidden="true" />
                  <AvatarBadge initials="--" tone="blue" />
                  <span className="dashboard-table__person">
                    <strong>Nema termina za danas</strong>
                    <small>Raspored je prazan</small>
                  </span>
                  <StatusBadge tone="blue">Nema unosa</StatusBadge>
                  <span aria-hidden="true" />
                </div>
              )}
            </div>
          </DashboardSection>

          <DashboardSection
            title="Nedavne aktivnosti"
            icon="activity"
            footerLabel="Pogledaj sve aktivnosti"
          >
            <div className="dashboard-activity-list">
              {view.activities.map((activity) => (
                <div className="dashboard-activity-row" key={activity.title}>
                  <IconTile icon={activity.icon} tone={activity.tone} />
                  <span>
                    <strong>{activity.title}</strong>
                    <small>{activity.meta}</small>
                  </span>
                  <time>{activity.actionLabel ?? ''}</time>
                </div>
              ))}
            </div>
          </DashboardSection>
        </div>

        <div className="dashboard-side-stack">
          <DashboardSection title="Sljedeći pacijent" icon="clipboard">
            {view.nextPatient ? (
              <>
                <div className="next-patient">
                  <AvatarBadge initials={view.nextPatient.initials} tone="teal" />
                  <div>
                    <strong>{view.nextPatient.name}</strong>
                    <span>{view.nextPatient.meta}</span>
                  </div>
                </div>
                <div className="next-patient__details">
                  <span>
                    <AppIcon name="clock" />
                    <strong>{view.nextPatient.time}</strong>
                    {view.nextPatient.relativeTime}
                  </span>
                  <span>
                    <AppIcon name="calendar" />
                    <strong>{view.nextPatient.appointmentType}</strong>
                    {view.nextPatient.note}
                  </span>
                </div>
                <button className="dashboard-gradient-action" type="button">
                  Otvori detalje
                  <AppIcon name="chevronRight" />
                </button>
              </>
            ) : (
              <>
                <div className="next-patient">
                  <AvatarBadge initials="--" tone="teal" />
                  <div>
                    <strong>Nema nadolazećeg pacijenta</strong>
                    <span>Raspored je trenutno miran</span>
                  </div>
                </div>
                <div className="next-patient__details">
                  <span>
                    <AppIcon name="clock" />
                    <strong>--:--</strong>
                    Nema termina
                  </span>
                  <span>
                    <AppIcon name="calendar" />
                    <strong>Sljedeći termin</strong>
                    Nije pronađen u rasporedu
                  </span>
                </div>
              </>
            )}
          </DashboardSection>

          <DashboardSection title="Brze bilješke" icon="note" footerLabel="Pogledaj sve bilješke">
            <div className="quick-note-input">
              <span>Zabilježi brzu bilješku...</span>
              <button type="button" aria-label="Dodaj bilješku">
                <AppIcon name="plus" />
              </button>
            </div>
            <div className="dashboard-compact-list">
              {doctorLocalNotes.map((note) => (
                <div className="dashboard-compact-row" key={note.title}>
                  <IconTile icon={note.icon} tone={note.tone} />
                  <span>
                    <strong>{note.title}</strong>
                    <small>{note.meta}</small>
                  </span>
                </div>
              ))}
            </div>
          </DashboardSection>
        </div>
      </div>
    </div>
  )
}
