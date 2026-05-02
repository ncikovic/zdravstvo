import type { ReactElement } from 'react'

import type { AppIconName } from '@/types'

interface AppIconProps {
  name: AppIconName
  className?: string
  title?: string
}

const renderIconContent = (name: AppIconName): ReactElement => {
  switch (name) {
    case 'accessibility':
      return (
        <>
          <circle cx="12" cy="4.5" r="1.8" />
          <path d="M4.5 9h15" />
          <path d="M12 9v4.5" />
          <path d="M8 20l4-6.5L16 20" />
        </>
      )
    case 'activity':
      return <path d="M3 12h4l2-6 4 12 2-6h6" />
    case 'bell':
      return (
        <>
          <path d="M6 9a6 6 0 0 1 12 0c0 6 2 6 2 8H4c0-2 2-2 2-8" />
          <path d="M10 20a2.5 2.5 0 0 0 4 0" />
        </>
      )
    case 'building':
      return (
        <>
          <path d="M4 20V6.5L12 3l8 3.5V20" />
          <path d="M8 20v-7h8v7" />
          <path d="M9 8h.01M12 8h.01M15 8h.01" />
        </>
      )
    case 'calendar':
      return (
        <>
          <rect x="4" y="5" width="16" height="15" rx="2" />
          <path d="M8 3v4M16 3v4M4 10h16" />
        </>
      )
    case 'calendarCheck':
      return (
        <>
          <rect x="4" y="5" width="16" height="15" rx="2" />
          <path d="M8 3v4M16 3v4M4 10h16M9 15l2 2 4-4" />
        </>
      )
    case 'checkCircle':
      return (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M8.5 12.5l2.2 2.2 4.8-5" />
        </>
      )
    case 'chevronDown':
      return <path d="M7 10l5 5 5-5" />
    case 'chevronLeft':
      return <path d="M15 6l-6 6 6 6" />
    case 'chevronRight':
      return <path d="M9 6l6 6-6 6" />
    case 'clipboard':
      return (
        <>
          <path d="M9 5h6l1 2h3v13H5V7h3l1-2Z" />
          <path d="M9 12h6M9 16h4" />
        </>
      )
    case 'clock':
      return (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v5l3 2" />
        </>
      )
    case 'dashboard':
      return (
        <>
          <rect x="4" y="4" width="6" height="6" rx="1.5" />
          <rect x="14" y="4" width="6" height="6" rx="1.5" />
          <rect x="4" y="14" width="6" height="6" rx="1.5" />
          <rect x="14" y="14" width="6" height="6" rx="1.5" />
        </>
      )
    case 'doctor':
      return (
        <>
          <path d="M8 6a4 4 0 0 1 8 0v2a4 4 0 0 1-8 0V6Z" />
          <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
          <path d="M12 13v4M10 15h4" />
        </>
      )
    case 'dots':
      return (
        <>
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="19" r="1" />
        </>
      )
    case 'flask':
      return (
        <>
          <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3" />
          <path d="M8 15h8" />
        </>
      )
    case 'headphones':
      return (
        <>
          <path d="M4 13a8 8 0 0 1 16 0" />
          <path d="M5 13h3v6H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2ZM19 13h-3v6h3a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2Z" />
        </>
      )
    case 'heartPulse':
      return (
        <>
          <path d="M20 8.5c0 5-8 10-8 10s-8-5-8-10A4.5 4.5 0 0 1 12 5a4.5 4.5 0 0 1 8 3.5Z" />
          <path d="M7 12h2l1-2 2 5 2-3h3" />
        </>
      )
    case 'home':
      return (
        <>
          <path d="M4 11.5 12 4l8 7.5" />
          <path d="M6.5 10.5V20h11v-9.5" />
          <path d="M10 20v-5h4v5" />
        </>
      )
    case 'info':
      return (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 11v5M12 8h.01" />
        </>
      )
    case 'mail':
      return (
        <>
          <rect x="4" y="6" width="16" height="12" rx="2" />
          <path d="m5 8 7 5 7-5" />
        </>
      )
    case 'megaphone':
      return (
        <>
          <path d="M4 13h3l10 4V7L7 11H4v2Z" />
          <path d="M7 13l1 5h3" />
        </>
      )
    case 'note':
      return (
        <>
          <path d="M5 20V4h10l4 4v12H5Z" />
          <path d="M14 4v5h5M8 13h8M8 16h5" />
        </>
      )
    case 'patients':
      return (
        <>
          <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.5 20a5.5 5.5 0 0 1 11 0" />
          <path d="M16 11a2.5 2.5 0 1 0-.7-4.9M14.5 14.5A5 5 0 0 1 20.5 20" />
        </>
      )
    case 'plus':
      return <path d="M12 5v14M5 12h14" />
    case 'search':
      return (
        <>
          <circle cx="11" cy="11" r="6" />
          <path d="m16 16 4 4" />
        </>
      )
    case 'send':
      return (
        <>
          <path d="M21 4 10 15" />
          <path d="m21 4-7 17-4-6-7-4 18-7Z" />
        </>
      )
    case 'settings':
      return (
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.5-2.4 1a7 7 0 0 0-2-1.1L14.2 3h-4.4l-.4 2.7a7 7 0 0 0-2 1.1l-2.4-1-2 3.5 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.5 2.4-1a7 7 0 0 0 2 1.1l.4 2.7h4.4l.4-2.7a7 7 0 0 0 2-1.1l2.4 1 2-3.5-2-1.5c.1-.4.1-.8.1-1.2Z" />
        </>
      )
    case 'shield':
      return (
        <>
          <path d="M12 3 5 6v5c0 4.5 3 7.8 7 10 4-2.2 7-5.5 7-10V6l-7-3Z" />
          <path d="M12 8v8M8 12h8" />
        </>
      )
    case 'shieldCheck':
      return (
        <>
          <path d="M12 3 5 6v5c0 4.5 3 7.8 7 10 4-2.2 7-5.5 7-10V6l-7-3Z" />
          <path d="m9 12.5 2 2 4-5" />
        </>
      )
    case 'stethoscope':
      return (
        <>
          <path d="M6 4v5a4 4 0 0 0 8 0V4" />
          <path d="M10 13v2a4 4 0 0 0 8 0v-1" />
          <circle cx="19" cy="12" r="2" />
        </>
      )
    case 'tag':
      return (
        <>
          <path d="M4 11V5h6l10 10-6 6L4 11Z" />
          <circle cx="8" cy="8" r="1" />
        </>
      )
    case 'user':
      return (
        <>
          <circle cx="12" cy="8" r="4" />
          <path d="M5 21a7 7 0 0 1 14 0" />
        </>
      )
    case 'users':
      return (
        <>
          <path d="M8.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM3 20a5.5 5.5 0 0 1 11 0" />
          <path d="M17 11a3 3 0 1 0-.8-5.9M15.5 14.5A5.5 5.5 0 0 1 21 20" />
        </>
      )
    case 'warning':
      return (
        <>
          <path d="M12 4 3 20h18L12 4Z" />
          <path d="M12 9v5M12 17h.01" />
        </>
      )
  }
}

export function AppIcon({ name, className, title }: AppIconProps): ReactElement {
  return (
    <svg
      className={className ? `app-icon ${className}` : 'app-icon'}
      viewBox="0 0 24 24"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {renderIconContent(name)}
    </svg>
  )
}
