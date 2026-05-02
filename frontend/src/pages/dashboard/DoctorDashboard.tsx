import type { ReactElement } from 'react'

import { AppIcon } from '@/components'

import {
  doctorActivities,
  doctorNotes,
  doctorScheduleRows,
  doctorStats,
} from './dashboard.data'
import {
  AvatarBadge,
  DashboardSection,
  DashboardStatCard,
  IconTile,
  StatusBadge,
} from './DashboardPrimitives'

export function DoctorDashboard(): ReactElement {
  return (
    <div className="dashboard-page dashboard-page--doctor">
      <div className="dashboard-stat-grid dashboard-stat-grid--four">
        {doctorStats.map((stat) => (
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
              {doctorScheduleRows.map((row) => (
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
              ))}
            </div>
          </DashboardSection>

          <DashboardSection
            title="Nedavne aktivnosti"
            icon="activity"
            footerLabel="Pogledaj sve aktivnosti"
          >
            <div className="dashboard-activity-list">
              {doctorActivities.map((activity) => (
                <div className="dashboard-activity-row" key={activity.title}>
                  <IconTile icon={activity.icon} tone={activity.tone} />
                  <span>
                    <strong>{activity.title}</strong>
                    <small>{activity.meta}</small>
                  </span>
                  <time>10:15</time>
                </div>
              ))}
            </div>
          </DashboardSection>
        </div>

        <div className="dashboard-side-stack">
          <DashboardSection title="Sljedeći pacijent" icon="clipboard">
            <div className="next-patient">
              <AvatarBadge initials="IK" tone="teal" />
              <div>
                <strong>Ivana Kovač</strong>
                <span>1992. • 98765432109</span>
              </div>
            </div>
            <div className="next-patient__details">
              <span>
                <AppIcon name="clock" />
                <strong>08:30</strong>
                za 15 min
              </span>
              <span>
                <AppIcon name="calendar" />
                <strong>Prvi pregled</strong>
                Anamneza i osnovni pregled
              </span>
            </div>
            <button className="dashboard-gradient-action" type="button">
              Otvori detalje
              <AppIcon name="chevronRight" />
            </button>
          </DashboardSection>

          <DashboardSection title="Brze bilješke" icon="note" footerLabel="Pogledaj sve bilješke">
            <div className="quick-note-input">
              <span>Zabilježi brzu bilješku...</span>
              <button type="button" aria-label="Dodaj bilješku">
                <AppIcon name="plus" />
              </button>
            </div>
            <div className="dashboard-compact-list">
              {doctorNotes.map((note) => (
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
