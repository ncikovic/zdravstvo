import { useEffect, useState, type ReactElement } from 'react'
import type { NotificationDto } from '@zdravstvo/contracts'

import { AppIcon } from '@/components'
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from '@/hooks'

import './notifications.css'

const formatDateTime = (iso: string): string => {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${dd}. ${mm}. ${yyyy}. ${hh}:${min}`
}

const buildPaginationPages = (current: number, total: number): (number | '...')[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '...')[] = []
  pages.push(1)
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
}

interface SummaryCardsProps {
  total: number
  unread: number
  read: number
}

function SummaryCards({ total, unread, read }: SummaryCardsProps): ReactElement {
  return (
    <div className="notif-summary">
      <div className="notif-summary-card">
        <span className="notif-summary-card__label">Ukupno</span>
        <span className="notif-summary-card__value">{total}</span>
      </div>
      <div className="notif-summary-card notif-summary-card--pending">
        <span className="notif-summary-card__label">Nepročitano</span>
        <span className="notif-summary-card__value">{unread}</span>
      </div>
      <div className="notif-summary-card notif-summary-card--sent">
        <span className="notif-summary-card__label">Pročitano</span>
        <span className="notif-summary-card__value">{read}</span>
      </div>
    </div>
  )
}

interface DetailPanelProps {
  notification: NotificationDto
  onClose: () => void
}

function DetailPanel({ notification, onClose }: DetailPanelProps): ReactElement {
  const rows = [
    ['Vrsta', notification.title],
    ['Vrijeme', formatDateTime(notification.createdAt)],
    ['Status', notification.readAt ? 'Pročitano' : 'Nepročitano'],
  ] as const

  return (
    <aside className="notif-detail-panel" aria-label="Detalji obavijesti">
      <button
        className="notif-detail-close"
        type="button"
        aria-label="Zatvori detalje"
        onClick={onClose}
      >
        ×
      </button>
      <h2>{notification.title}</h2>
      <p>{notification.message}</p>

      <div className="notif-detail-list">
        {rows.map(([label, value]) => (
          <div key={label}>
            <AppIcon name="bell" />
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </aside>
  )
}

function NotificationsPage(): ReactElement {
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<NotificationDto | null>(null)
  const query = useNotificationsQuery({ page })
  const markReadMutation = useMarkNotificationReadMutation()
  const markAllReadMutation = useMarkAllNotificationsReadMutation()
  const notifications = query.data?.notifications ?? []
  const summary = query.data?.summary ?? { total: 0, unread: 0, read: 0 }
  const totalPages = query.data?.totalPages ?? 1
  const totalItems = query.data?.totalItems ?? 0
  const fromEntry = totalItems === 0 ? 0 : (page - 1) * 10 + 1
  const toEntry = Math.min(page * 10, totalItems)
  const paginationPages = buildPaginationPages(page, totalPages)

  useEffect(() => {
    if (summary.unread > 0) {
      markAllReadMutation.mutate()
    }
  }, [summary.unread])

  useEffect(() => {
    setSelected((current) => {
      if (!current) return notifications[0] ?? null
      return notifications.find((notification) => notification.id === current.id) ?? notifications[0] ?? null
    })
  }, [notifications])

  const selectNotification = (notification: NotificationDto): void => {
    setSelected(notification)

    if (!notification.readAt) {
      markReadMutation.mutate(notification.id)
    }
  }

  return (
    <div className="notif-page">
      <div className="notif-page__hero">
        <div>
          <h1>Obavijesti</h1>
          <p>Pregled obavijesti vezanih uz termine.</p>
        </div>
      </div>

      <SummaryCards total={summary.total} unread={summary.unread} read={summary.read} />

      <div className="notif-content-grid">
        <section className="notif-table-panel" aria-label="Obavijesti">
          <div className="notif-table notif-table--head" role="row">
            <span>Vrijeme ↓</span>
            <span>Naslov</span>
            <span>Poruka</span>
            <span>Status</span>
          </div>

          {query.isLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Učitavanje...</div>
          ) : query.error ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#d32f2f' }}>
              Greška pri učitavanju obavijesti.
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Nema obavijesti.</div>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification.id}
                className={
                  notification.id === selected?.id
                    ? 'notif-table notif-table--row notif-table--row-selected'
                    : 'notif-table notif-table--row'
                }
                type="button"
                role="row"
                onClick={() => selectNotification(notification)}
              >
                <strong>{formatDateTime(notification.createdAt)}</strong>
                <span>{notification.title}</span>
                <span>{notification.message}</span>
                <em
                  className={
                    notification.readAt
                      ? 'notif-badge notif-badge--sent'
                      : 'notif-badge notif-badge--pending'
                  }
                >
                  {notification.readAt ? 'Pročitano' : 'Nepročitano'}
                </em>
              </button>
            ))
          )}

          {!query.isLoading && !query.error && totalItems > 0 ? (
            <div className="notif-pagination">
              <span>Prikazano {fromEntry} do {toEntry} od {totalItems}</span>
              <div>
                <button
                  type="button"
                  aria-label="Prethodna stranica"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <AppIcon name="chevronLeft" />
                </button>
                {paginationPages.map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`}>...</span>
                  ) : (
                    <button
                      key={p}
                      className={p === page ? 'notif-pagination__active' : undefined}
                      type="button"
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  aria-label="Sljedeća stranica"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <AppIcon name="chevronRight" />
                </button>
              </div>
              <span className="notif-page-size">10 po stranici</span>
            </div>
          ) : null}
        </section>

        {selected ? (
          <DetailPanel notification={selected} onClose={() => setSelected(null)} />
        ) : (
          <aside className="notif-detail-panel" aria-label="Detalji obavijesti">
            <p style={{ padding: '2rem', color: '#667590', textAlign: 'center', margin: 0 }}>
              Odaberite obavijest za pregled detalja.
            </p>
          </aside>
        )}
      </div>
    </div>
  )
}

export { NotificationsPage }
