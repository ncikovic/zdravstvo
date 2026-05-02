import type { AppIconName } from '@/types'

export type DashboardTone =
  | 'blue'
  | 'green'
  | 'orange'
  | 'purple'
  | 'red'
  | 'teal'

export type DashboardTrend = 'down' | 'neutral' | 'up'

export interface DashboardStat {
  icon: AppIconName
  label: string
  value: string
  meta: string
  tone: DashboardTone
  actionLabel?: string
  trend?: DashboardTrend
}
