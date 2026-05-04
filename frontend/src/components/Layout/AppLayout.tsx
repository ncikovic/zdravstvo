import { useState, type ReactElement } from 'react'
import { Outlet, useSearchParams } from 'react-router-dom'

import { getRoleShellConfig } from '@/app/config'
import { useRoleNavigation } from '@/hooks'
import { useAuthStore, type AuthUser } from '@/stores'

import { AppIcon } from './icons'
import { Sidebar } from './Sidebar'

type TopbarMenu = 'date' | 'notifications' | 'profile'

const DATE_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const dateLabelFormatter = new Intl.DateTimeFormat('hr-HR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const capitalize = (value: string): string =>
  value ? `${value[0]?.toUpperCase() ?? ''}${value.slice(1)}` : value

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

const resolveSelectedDate = (value: string | null): string =>
  value && DATE_INPUT_PATTERN.test(value) ? value : formatDateInput(new Date())

const formatSelectedDateLabel = (value: string): string => {
  const [yearValue = '0', monthValue = '1', dayValue = '1'] = value.split('-')
  const year = Number(yearValue)
  const month = Number(monthValue)
  const day = Number(dayValue)
  const date = new Date(year, month - 1, day)

  return capitalize(dateLabelFormatter.format(date))
}

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
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const [openMenu, setOpenMenu] = useState<TopbarMenu | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const navigationItems = useRoleNavigation(role)
  const shellConfig = getRoleShellConfig(role)
  const userName = formatUserName(user)
  const initials = getUserInitials(userName)
  const selectedDate = resolveSelectedDate(searchParams.get('date'))

  const toggleMenu = (menu: TopbarMenu): void => {
    setOpenMenu((currentMenu) => (currentMenu === menu ? null : menu))
  }

  const updateSelectedDate = (date: string): void => {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams)

      nextParams.set('date', date)

      return nextParams
    })
    setOpenMenu(null)
  }

  return (
    <div className={`authenticated-shell authenticated-shell--${shellConfig.headerVariant}`}>
      <Sidebar items={navigationItems} support={shellConfig.sidebar} />

      <div className="authenticated-shell__workspace">
        <header className="app-topbar">
          <div className="app-topbar__lead">
            {shellConfig.headerVariant === 'workspace' ? (
              <div className="clinic-switcher" aria-label="Ustanova korisnika">
                <span className="clinic-switcher__icon" aria-hidden="true">
                  <AppIcon name="building" />
                </span>
                <span>{shellConfig.workspaceName}</span>
              </div>
            ) : null}

            {shellConfig.headerVariant === 'clinical' ? (
              <div className="app-topbar__title-group">
                <h1>Nadzorna ploča</h1>
                <span className="app-topbar__divider" aria-hidden="true" />
                <div className="topbar-dropdown topbar-dropdown--date">
                  <button
                    className="app-topbar__date app-topbar__date-button"
                    type="button"
                    aria-expanded={openMenu === 'date'}
                    onClick={() => toggleMenu('date')}
                  >
                    <AppIcon name="calendar" />
                    {formatSelectedDateLabel(selectedDate)}
                    <AppIcon name="chevronDown" />
                  </button>
                  {openMenu === 'date' ? (
                    <div className="topbar-dropdown__menu topbar-dropdown__menu--date">
                      <label>
                        <span>Datum</span>
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(event) => updateSelectedDate(event.target.value)}
                        />
                      </label>
                      <div className="topbar-dropdown__actions">
                        <button
                          type="button"
                          onClick={() => updateSelectedDate(shiftDateInput(selectedDate, -1))}
                        >
                          Prethodni dan
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSelectedDate(formatDateInput(new Date()))}
                        >
                          Danas
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSelectedDate(shiftDateInput(selectedDate, 1))}
                        >
                          Sljedeći dan
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
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
            <div className="topbar-dropdown">
              <button
                className="notification-button"
                type="button"
                aria-label="Obavijesti"
                aria-expanded={openMenu === 'notifications'}
                onClick={() => toggleMenu('notifications')}
              >
                <AppIcon name="bell" />
                {shellConfig.notificationCount > 0 ? (
                  <span>{shellConfig.notificationCount}</span>
                ) : null}
              </button>
              {openMenu === 'notifications' ? (
                <div className="topbar-dropdown__menu topbar-dropdown__menu--right">
                  <strong>Obavijesti</strong>
                  <span>{shellConfig.notificationCount} aktivno</span>
                </div>
              ) : null}
            </div>

            <div className="topbar-dropdown">
              <button
                className="profile-menu"
                type="button"
                aria-expanded={openMenu === 'profile'}
                onClick={() => toggleMenu('profile')}
              >
                <span className="profile-menu__avatar">{initials}</span>
                <span className="profile-menu__copy">
                  <strong>{userName}</strong>
                  <span>{shellConfig.roleLabel}</span>
                </span>
                <AppIcon name="chevronDown" />
              </button>
              {openMenu === 'profile' ? (
                <div className="topbar-dropdown__menu topbar-dropdown__menu--right">
                  <strong>{userName}</strong>
                  <span>{user?.email ?? shellConfig.roleLabel}</span>
                  <button type="button" onClick={clearAuth}>
                    Odjava
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="authenticated-shell__main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
