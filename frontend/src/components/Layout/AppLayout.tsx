import type { ReactElement } from 'react'
import { Outlet } from 'react-router-dom'

import { getRoleShellConfig } from '@/app/config'
import { useRoleNavigation } from '@/hooks'
import { useAuthStore, type AuthUser } from '@/stores'

import { AppIcon } from './icons'
import { Sidebar } from './Sidebar'

const formatUserName = (user: AuthUser | null): string => {
  const firstName = user?.firstName?.trim()
  const lastName = user?.lastName?.trim()
  const fullName = [firstName, lastName].filter(Boolean).join(' ')

  return fullName || user?.email || 'Korisnik'
}

const getUserInitials = (userName: string): string => {
  const parts = userName.split(' ').filter(Boolean)

  if (parts.length === 0) {
    return 'K'
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function AppLayout(): ReactElement {
  const role = useAuthStore((state) => state.role)
  const user = useAuthStore((state) => state.user)
  const navigationItems = useRoleNavigation(role)
  const shellConfig = getRoleShellConfig(role)
  const userName = formatUserName(user)
  const initials = getUserInitials(userName)

  return (
    <div className={`authenticated-shell authenticated-shell--${shellConfig.headerVariant}`}>
      <Sidebar items={navigationItems} support={shellConfig.sidebar} />

      <div className="authenticated-shell__workspace">
        <header className="app-topbar">
          <div className="app-topbar__lead">
            {shellConfig.headerVariant === 'workspace' ? (
              <button className="clinic-switcher" type="button">
                <span className="clinic-switcher__icon">
                  <AppIcon name="building" />
                </span>
                <span>{shellConfig.workspaceName}</span>
                <AppIcon name="chevronDown" />
              </button>
            ) : null}

            {shellConfig.headerVariant === 'clinical' ? (
              <div className="app-topbar__title-group">
                <h1>Nadzorna ploča</h1>
                <span className="app-topbar__divider" aria-hidden="true" />
                <span className="app-topbar__date">
                  <AppIcon name="calendar" />
                  {shellConfig.dateLabel}
                </span>
              </div>
            ) : null}
          </div>

          <label className="app-search">
            <span className="sr-only">Pretraga</span>
            <AppIcon name="search" />
            <input type="search" placeholder={shellConfig.searchPlaceholder} />
            {shellConfig.headerVariant !== 'workspace' ? <kbd>Ctrl + K</kbd> : null}
          </label>

          <div className="app-topbar__actions">
            <button className="notification-button" type="button" aria-label="Obavijesti">
              <AppIcon name="bell" />
              {shellConfig.notificationCount > 0 ? (
                <span>{shellConfig.notificationCount}</span>
              ) : null}
            </button>

            <button className="profile-menu" type="button">
              <span className="profile-menu__avatar">{initials}</span>
              <span className="profile-menu__copy">
                <strong>{userName}</strong>
                <span>{shellConfig.roleLabel}</span>
              </span>
              <AppIcon name="chevronDown" />
            </button>
          </div>
        </header>

        <main className="authenticated-shell__main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
