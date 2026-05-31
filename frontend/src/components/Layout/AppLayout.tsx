import { useEffect, useState, type ReactElement } from 'react'
import { matchPath, NavLink, Outlet, useLocation, useSearchParams } from 'react-router-dom'

import { getRoleShellConfig } from '@/app/config'
import { APP_ROUTES } from '@/app/routes'
import { useAccessibility } from '@/contexts/AccessibilityContext'
import {
  useMarkAllNotificationsReadMutation,
  useNotificationsQuery,
  useRoleNavigation,
  useUnreadNotificationCountQuery,
} from '@/hooks'
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

const formatNotificationTime = (value: string): string =>
  new Intl.DateTimeFormat('hr-HR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))

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

const PAGE_TITLES: Record<string, string> = {
  '/': 'Nadzorna ploča',
  '/appointments': 'Termini',
  '/appointments/create': 'Novi termin',
  '/doctors': 'Liječnici',
  '/patients': 'Pacijenti',
  '/appointment-types': 'Vrste termina',
  '/audit': 'Revizijski zapisnik',
  '/settings': 'Postavke',
  '/my-appointments': 'Moji termini',
  '/accessibility': 'Postavke pristupačnosti',
  '/schedule': 'Moj raspored',
}

const PAGE_TITLE_PATTERNS: readonly { pattern: string; title: string }[] = [
  { pattern: APP_ROUTES.dashboard, title: 'Nadzorna ploča' },
  { pattern: APP_ROUTES.schedule, title: 'Raspored' },
  { pattern: APP_ROUTES.appointments, title: 'Termini' },
  { pattern: APP_ROUTES.createAppointment, title: 'Novi termin' },
  { pattern: APP_ROUTES.appointmentDetails, title: 'Detalji termina' },
  { pattern: APP_ROUTES.changeAppointment, title: 'Promjena termina' },
  { pattern: APP_ROUTES.cancelAppointment, title: 'Otkazivanje termina' },
  { pattern: APP_ROUTES.doctors, title: 'Liječnici' },
  { pattern: APP_ROUTES.doctorsCreate, title: 'Novi liječnik' },
  { pattern: APP_ROUTES.doctorDetails, title: 'Detalji liječnika' },
  { pattern: APP_ROUTES.doctorSchedule, title: 'Raspored liječnika' },
  { pattern: APP_ROUTES.doctorExceptions, title: 'Iznimke liječnika' },
  { pattern: APP_ROUTES.doctorOwnSchedule, title: 'Moj raspored' },
  { pattern: APP_ROUTES.patients, title: 'Pacijenti' },
  { pattern: APP_ROUTES.patientsNew, title: 'Novi pacijent' },
  { pattern: APP_ROUTES.patientDetails, title: 'Detalji pacijenta' },
  { pattern: APP_ROUTES.patientEdit, title: 'Uredi pacijenta' },
  { pattern: APP_ROUTES.appointmentTypes, title: 'Vrste termina' },
  { pattern: APP_ROUTES.createAppointmentType, title: 'Nova vrsta termina' },
  { pattern: APP_ROUTES.editAppointmentType, title: 'Uredi vrstu termina' },
  { pattern: APP_ROUTES.audit, title: 'Audit' },
  { pattern: APP_ROUTES.notifications, title: 'Obavijesti' },
  { pattern: APP_ROUTES.settings, title: 'Postavke' },
  { pattern: APP_ROUTES.myAppointments, title: 'Moji termini' },
  { pattern: APP_ROUTES.book, title: 'Zakaži termin' },
  { pattern: APP_ROUTES.profile, title: 'Profil' },
  { pattern: APP_ROUTES.users, title: 'Korisnici' },
  { pattern: APP_ROUTES.adminOrganizations, title: 'Organizacije' },
  { pattern: APP_ROUTES.adminUsers, title: 'Korisnici' },
  { pattern: APP_ROUTES.adminAudit, title: 'Audit sustava' },
  { pattern: APP_ROUTES.accessibility, title: 'Postavke pristupačnosti' },
]

const resolvePageTitle = (pathname: string): string => {
  const route = PAGE_TITLE_PATTERNS.find(({ pattern }) =>
    matchPath({ path: pattern, end: true }, pathname),
  )

  return route?.title ?? PAGE_TITLES[pathname] ?? 'Stranica'
}

export function AppLayout(): ReactElement {
  const role = useAuthStore((state) => state.role)
  const isSystemAdmin = useAuthStore((state) => state.isSystemAdmin)
  const user = useAuthStore((state) => state.user)
  const organizationName = useAuthStore((state) => state.organizationName)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const [openMenu, setOpenMenu] = useState<TopbarMenu | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const navigationItems = useRoleNavigation(role, isSystemAdmin)
  const shellConfig = getRoleShellConfig(role, isSystemAdmin)
  const notificationsQuery = useNotificationsQuery({ page: 1 })
  const unreadCountQuery = useUnreadNotificationCountQuery()
  const markAllReadMutation = useMarkAllNotificationsReadMutation()
  const location = useLocation()
  const { announce } = useAccessibility()
  const pageTitle = resolvePageTitle(location.pathname)

  useEffect(() => {
    announce(pageTitle)
    setMobileMenuOpen(false)
  }, [pageTitle, announce])
  const userName = formatUserName(user)
  const initials = getUserInitials(userName)
  const selectedDate = resolveSelectedDate(searchParams.get('date'))
  const unreadNotificationCount = unreadCountQuery.data?.unreadCount ?? 0
  const recentNotifications = notificationsQuery.data?.notifications ?? []

  const toggleMenu = (menu: TopbarMenu): void => {
    setOpenMenu((currentMenu) => (currentMenu === menu ? null : menu))
  }

  const toggleNotifications = (): void => {
    setOpenMenu((currentMenu) => {
      const nextMenu = currentMenu === 'notifications' ? null : 'notifications'

      if (nextMenu === 'notifications' && unreadNotificationCount > 0) {
        markAllReadMutation.mutate()
      }

      return nextMenu
    })
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
    <div className={`authenticated-shell authenticated-shell--${shellConfig.headerVariant}${sidebarCollapsed ? ' authenticated-shell--sidebar-collapsed' : ''}`}>
      <Sidebar
        items={navigationItems}
        support={shellConfig.sidebar}
        onCollapse={() => setSidebarCollapsed((v) => !v)}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="authenticated-shell__workspace">
        <header className="app-topbar">
          <div className="app-topbar__lead">
            <button
              className="app-topbar__menu-toggle"
              type="button"
              aria-label="Otvori izbornik"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(true)}
            >
              <AppIcon name="menu" />
            </button>
            {shellConfig.headerVariant === 'workspace' ? (
              <div className="clinic-switcher" aria-label="Ustanova korisnika">
                <span className="clinic-switcher__icon" aria-hidden="true">
                  <AppIcon name="building" />
                </span>
                <span>{organizationName ?? shellConfig.workspaceName}</span>
              </div>
            ) : null}

            {shellConfig.headerVariant === 'clinical' ? (
              <div className="app-topbar__title-group">
                <h1>{pageTitle}</h1>
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
                onClick={toggleNotifications}
              >
                <AppIcon name="bell" />
                {unreadNotificationCount > 0 ? (
                  <span>{unreadNotificationCount}</span>
                ) : null}
              </button>
              {openMenu === 'notifications' ? (
                <div className="topbar-dropdown__menu topbar-dropdown__menu--right">
                  <strong>Obavijesti</strong>
                  <span>{unreadNotificationCount} nepročitano</span>
                  {recentNotifications.slice(0, 5).map((notification) => (
                    <NavLink
                      key={notification.id}
                      to={APP_ROUTES.notifications}
                      onClick={() => setOpenMenu(null)}
                    >
                      <strong>{notification.title}</strong>
                      <span>{notification.message}</span>
                      <small>{formatNotificationTime(notification.createdAt)}</small>
                    </NavLink>
                  ))}
                  {recentNotifications.length === 0 ? <span>Nema obavijesti.</span> : null}
                  <NavLink to={APP_ROUTES.notifications} onClick={() => setOpenMenu(null)}>
                    Pogledaj sve obavijesti
                  </NavLink>
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
