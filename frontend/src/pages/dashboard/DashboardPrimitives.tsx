import type { ReactElement, ReactNode } from 'react'

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
