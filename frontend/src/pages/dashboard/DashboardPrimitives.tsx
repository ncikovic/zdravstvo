import { useState, type ReactElement, type ReactNode } from 'react'

import { AppIcon } from '@/components'
import type { AppIconName } from '@/types'

import type { DashboardStat, DashboardTone } from './dashboard.types'

interface DashboardStatCardProps {
  stat: DashboardStat
}

interface DashboardSectionProps {
  title: string
  icon: AppIconName
  children: ReactNode
  actionLabel?: string
  className?: string
  footerLabel?: string
}

interface StatusBadgeProps {
  children: ReactNode
  tone: DashboardTone
}

interface AvatarBadgeProps {
  initials: string
  tone?: DashboardTone
}

interface IconTileProps {
  icon: AppIconName
  tone: DashboardTone
}

interface DashboardDateDropdownProps {
  label: string
  value: string
  onChange: (value: string) => void
}

const formatDateInput = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const shiftDateInput = (value: string, days: number): string => {
  const [yearValue = '0', monthValue = '1', dayValue = '1'] = value.split('-')
  const year = Number(yearValue)
  const month = Number(monthValue)
  const day = Number(dayValue)
  const date = new Date(Date.UTC(year, month - 1, day + days))

  return date.toISOString().slice(0, 10)
}

export function IconTile({ icon, tone }: IconTileProps): ReactElement {
  return (
    <span className={`dashboard-icon-tile dashboard-icon-tile--${tone}`}>
      <AppIcon name={icon} />
    </span>
  )
}

export function DashboardStatCard({ stat }: DashboardStatCardProps): ReactElement {
  return (
    <article className="dashboard-stat-card">
      <IconTile icon={stat.icon} tone={stat.tone} />
      <div className="dashboard-stat-card__copy">
        <span>{stat.label}</span>
        <strong>{stat.value}</strong>
        <small className={`dashboard-trend dashboard-trend--${stat.trend ?? 'neutral'}`}>
          {stat.meta}
        </small>
      </div>
      {stat.actionLabel ? (
        <span className="dashboard-card-link">
          {stat.actionLabel}
          <AppIcon name="chevronRight" />
        </span>
      ) : null}
    </article>
  )
}

export function DashboardSection({
  title,
  icon,
  children,
  actionLabel,
  className,
  footerLabel,
}: DashboardSectionProps): ReactElement {
  return (
    <section className={className ? `dashboard-section ${className}` : 'dashboard-section'}>
      <div className="dashboard-section__header">
        <h2>
          <AppIcon name={icon} />
          {title}
        </h2>
        {actionLabel ? (
          <button className="dashboard-section__action" type="button">
            {actionLabel}
            <AppIcon name="chevronRight" />
          </button>
        ) : null}
      </div>
      {children}
      {footerLabel ? (
        <button className="dashboard-section__footer" type="button">
          {footerLabel}
          <AppIcon name="chevronRight" />
        </button>
      ) : null}
    </section>
  )
}

export function StatusBadge({ children, tone }: StatusBadgeProps): ReactElement {
  return <span className={`dashboard-status dashboard-status--${tone}`}>{children}</span>
}

export function AvatarBadge({ initials, tone = 'blue' }: AvatarBadgeProps): ReactElement {
  return <span className={`dashboard-avatar dashboard-avatar--${tone}`}>{initials}</span>
}

export function DashboardDateDropdown({
  label,
  value,
  onChange,
}: DashboardDateDropdownProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false)

  const selectDate = (date: string): void => {
    onChange(date)
    setIsOpen(false)
  }

  return (
    <div className="dashboard-date-dropdown">
      <button
        className="dashboard-date-button"
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((currentValue) => !currentValue)}
      >
        <AppIcon name="calendar" />
        {label}
        <AppIcon name="chevronDown" />
      </button>

      {isOpen ? (
        <div className="dashboard-date-menu">
          <label>
            <span>Datum</span>
            <input
              type="date"
              value={value}
              onChange={(event) => selectDate(event.target.value)}
            />
          </label>
          <div className="dashboard-date-menu__actions">
            <button type="button" onClick={() => selectDate(shiftDateInput(value, -1))}>
              Prethodni dan
            </button>
            <button type="button" onClick={() => selectDate(formatDateInput(new Date()))}>
              Danas
            </button>
            <button type="button" onClick={() => selectDate(shiftDateInput(value, 1))}>
              Sljedeći dan
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
