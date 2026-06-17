import type { ReactElement } from 'react'

import { AppIcon } from '@/components'
import type { AppIconName } from '@/types'

interface InternalPlaceholderPageProps {
  title: string
  description: string
  icon: AppIconName
}

export function InternalPlaceholderPage({
  title,
  description,
  icon,
}: InternalPlaceholderPageProps): ReactElement {
  return (
    <div className="dashboard-page">
      <section className="dashboard-section internal-placeholder">
        <span className="internal-placeholder__icon">
          <AppIcon name={icon} />
        </span>
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </section>
    </div>
  )
}
