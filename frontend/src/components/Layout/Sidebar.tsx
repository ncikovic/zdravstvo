import type { ReactElement } from 'react'
import { NavLink } from 'react-router-dom'

import type { SidebarSupportConfig } from '@/app/config'
import type { AppNavigationItem } from '@/types'

import { AppIcon } from './icons'

interface SidebarProps {
  items: readonly AppNavigationItem[]
  support: SidebarSupportConfig
  onCollapse?: () => void
  isOpen?: boolean
  onClose?: () => void
}

const getNavLinkClassName = ({ isActive }: { isActive: boolean }): string =>
  isActive ? 'app-sidebar__link app-sidebar__link--active' : 'app-sidebar__link'

export function Sidebar({ items, support, onCollapse, isOpen, onClose }: SidebarProps): ReactElement {
  return (
    <>
      {isOpen ? (
        <div className="app-sidebar__backdrop" onClick={onClose} aria-hidden="true" />
      ) : null}
      <aside className={`app-sidebar${isOpen ? ' app-sidebar--open' : ''}`}>
        <button
          className="app-sidebar__close"
          type="button"
          aria-label="Zatvori izbornik"
          onClick={onClose}
        >
          <AppIcon name="xCircle" />
        </button>

        <div className="app-sidebar__brand" aria-label="Zdravstvo">
          {support.brandIcon ? (
            <span className="app-sidebar__brand-mark app-sidebar__brand-mark--shield">
              <AppIcon name={support.brandIcon} />
            </span>
          ) : null}
          <img
            className="app-sidebar__brand-logo"
            src="/assets/branding/logo.png"
            alt="Zdravstvo"
            decoding="async"
          />
        </div>

        <nav className="app-sidebar__nav" aria-label="Glavna navigacija">
          {items.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/'}
              className={getNavLinkClassName}
              onClick={onClose}
            >
              <AppIcon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="app-sidebar__support">
          <AppIcon name="headphones" />
          <div>
            <strong>{support.title}</strong>
            <span>{support.text}</span>
          </div>
          {support.collapseLabel ? (
            <button className="app-sidebar__support-action" type="button" onClick={onCollapse}>
              <AppIcon name="chevronLeft" />
              {support.collapseLabel}
            </button>
          ) : (
            <a className="app-sidebar__support-action" href="mailto:podrska@zdravstvo.hr">
              {support.actionLabel}
            </a>
          )}
        </div>
      </aside>
    </>
  )
}
