import type { ReactElement } from 'react'

import { AppIcon } from '@/components'
import type { AdminReceptionDashboard as AdminReceptionDashboardData } from '@/types'

import { mapAdminReceptionDashboard } from './dashboard.mappers'
import {
  AvatarBadge,
  DashboardDateDropdown,
  DashboardSection,
  DashboardStatCard,
  IconTile,
  StatusBadge,
} from './DashboardPrimitives'

interface AdminReceptionDashboardProps {
  dashboard: AdminReceptionDashboardData
  selectedDate: string
  onSelectedDateChange: (date: string) => void
}

export function AdminReceptionDashboard({
  dashboard,
  selectedDate,
  onSelectedDateChange,
}: AdminReceptionDashboardProps): ReactElement {
  const view = mapAdminReceptionDashboard(dashboard)

  return (
    <div className="dashboard-page dashboard-page--admin">
      <div className="dashboard-page__hero">
        <div>
          <h1>Nadzorna ploča</h1>
          <p>Pregled ključnih informacija i aktivnosti vaše ustanove.</p>
        </div>
        <DashboardDateDropdown
          label={view.dateLabel}
          value={selectedDate}
          onChange={onSelectedDateChange}
        />
      </div>

      <div className="dashboard-stat-grid dashboard-stat-grid--four">
        {view.stats.map((stat) => (
          <DashboardStatCard key={stat.label} stat={stat} />
        ))}
      </div>

      <div className="dashboard-grid dashboard-grid--admin">
        <DashboardSection
          title="Današnji raspored"
          icon="calendar"
          actionLabel="Pogledaj sve termine"
          footerLabel="Pogledaj cijeli raspored"
          className="dashboard-section--schedule"
        >
          <div className="dashboard-table dashboard-table--admin" role="table">
            <div className="dashboard-table__head" role="row">
              <span>Vrijeme</span>
              <span>Pacijent</span>
              <span>Liječnik</span>
              <span>Vrsta termina</span>
              <span>Status</span>
              <span aria-hidden="true" />
            </div>
            {view.scheduleRows.length > 0 ? view.scheduleRows.map((row) => (
              <div className="dashboard-table__row" role="row" key={`${row.time}-${row.patientName}`}>
                <strong className="dashboard-table__time">{row.time}</strong>
                <span className="dashboard-table__person">
                  <strong>{row.patientName}</strong>
                  <small>{row.patientMeta}</small>
                </span>
                <span className="dashboard-table__doctor">
                  <AvatarBadge initials={row.doctorInitials} tone="blue" />
                  <span>
                    <strong>{row.doctorName}</strong>
                    <small>{row.doctorSpecialty}</small>
                  </span>
                </span>
                <StatusBadge tone={row.typeTone}>{row.type}</StatusBadge>
                <StatusBadge tone={row.statusTone}>{row.status}</StatusBadge>
                <button className="dashboard-row-action" type="button" aria-label="Otvori termin">
                  <AppIcon name="chevronRight" />
                </button>
              </div>
            )) : (
              <div className="dashboard-table__row" role="row">
                <strong className="dashboard-table__time">--:--</strong>
                <span className="dashboard-table__person">
                  <strong>Nema termina za danas</strong>
                  <small>Raspored je prazan</small>
                </span>
                <span className="dashboard-table__doctor">
                  <AvatarBadge initials="--" tone="blue" />
                  <span>
                    <strong>Nema liječnika</strong>
                    <small>Današnji raspored</small>
                  </span>
                </span>
                <StatusBadge tone="blue">Nema unosa</StatusBadge>
                <StatusBadge tone="teal">Mirno</StatusBadge>
                <span aria-hidden="true" />
              </div>
            )}
          </div>
        </DashboardSection>

        <div className="dashboard-side-stack">
          <DashboardSection
            title="Najbliži slobodni termini"
            icon="calendar"
            footerLabel="Pogledaj sve dostupne termine"
          >
            <div className="dashboard-compact-list">
              {view.availableSlots.map((slot) => (
                <div className="dashboard-compact-row" key={`${slot.title}-${slot.meta}`}>
                  <IconTile icon={slot.icon} tone={slot.tone} />
                  <span>
                    <strong>{slot.title}</strong>
                    <small>{slot.meta}</small>
                  </span>
                  {slot.actionLabel ? (
                    <button className="dashboard-primary-small" type="button">
                      {slot.actionLabel}
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </DashboardSection>

          <DashboardSection
            title="Obavijesti i podsjetnici"
            icon="bell"
            footerLabel="Pogledaj sve obavijesti"
          >
            <div className="dashboard-compact-list">
              {view.notifications.map((notification) => (
                <div className="dashboard-compact-row" key={`${notification.title}-${notification.meta}`}>
                  <IconTile icon={notification.icon} tone={notification.tone} />
                  <span>
                    <strong>{notification.title}</strong>
                    <small>{notification.meta}</small>
                  </span>
                  <button className="dashboard-row-action" type="button" aria-label="Otvori obavijest">
                    <AppIcon name="chevronRight" />
                  </button>
                </div>
              ))}
            </div>
          </DashboardSection>
        </div>
      </div>

      <DashboardSection
        title="Brzi pregled aktivnosti"
        icon="activity"
        actionLabel="Pogledaj izvješća"
        className="dashboard-section--activity"
      >
        <div className="dashboard-metric-strip">
          {view.activityMetrics.map((metric) => (
            <div className="dashboard-metric" key={metric.label}>
              <IconTile icon={metric.icon} tone={metric.tone} />
              <span>
                <small>{metric.label}</small>
                <strong>{metric.value}</strong>
                <em>{metric.meta}</em>
              </span>
            </div>
          ))}
        </div>
      </DashboardSection>
    </div>
  )
}
