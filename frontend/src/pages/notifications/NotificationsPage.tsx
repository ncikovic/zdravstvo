import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import type {
  NotificationChannelDto,
  NotificationDto,
  NotificationStatusDto,
  NotificationSummaryDto,
} from '@zdravstvo/contracts'

import { AppIcon } from '@/components'
import { notificationsService } from '@/services'

import './notifications.css'

const STATUS_LABELS: Record<NotificationStatusDto, string> = {
  PENDING: 'Na čekanju',
  SENT: 'Poslano',
  FAILED: 'Neuspjelo',
}

const CHANNEL_LABELS: Record<NotificationChannelDto, string> = {
  EMAIL: 'E-mail',
  SMS: 'SMS',
}

const formatDateTime = (iso: string): string => {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${dd}. ${mm}. ${yyyy}. ${hh}:${min}`
}

const getErrorMessage = (error: unknown): string =>
  error instanceof Error
    ? error.message
    : typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message: unknown }).message)
      : 'Greška pri učitavanju obavijesti.'

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
  summary: NotificationSummaryDto
}

function SummaryCards({ summary }: SummaryCardsProps): ReactElement {
  return (
    <div className="notif-summary">
      <div className="notif-summary-card">
        <span className="notif-summary-card__label">Ukupno</span>
        <span className="notif-summary-card__value">{summary.total}</span>
      </div>
      <div className="notif-summary-card notif-summary-card--pending">
        <span className="notif-summary-card__label">Na čekanju</span>
        <span className="notif-summary-card__value">{summary.pending}</span>
      </div>
      <div className="notif-summary-card notif-summary-card--sent">
        <span className="notif-summary-card__label">Poslano</span>
        <span className="notif-summary-card__value">{summary.sent}</span>
      </div>
      <div className="notif-summary-card notif-summary-card--failed">
        <span className="notif-summary-card__label">Neuspjelo</span>
        <span className="notif-summary-card__value">{summary.failed}</span>
      </div>
    </div>
  )
}

interface DetailPanelProps {
  notification: NotificationDto
  onClose: () => void
}

function DetailPanel({ notification, onClose }: DetailPanelProps): ReactElement {
  const appt = notification.appointment
  const rows = [
    ['Planirano', formatDateTime(notification.scheduledFor)],
    ['Kanal', CHANNEL_LABELS[notification.channel]],
    ['Status', STATUS_LABELS[notification.status]],
    ['Poslano', notification.sentAt ? formatDateTime(notification.sentAt) : '—'],
    ['Pokušaji', String(notification.attemptCount)],
    ['Pacijent', `${appt.patientFirstName} ${appt.patientLastName}`],
    ['Liječnik', appt.doctorTitle ? `${appt.doctorTitle} ${appt.doctorFirstName} ${appt.doctorLastName}` : `${appt.doctorFirstName} ${appt.doctorLastName}`],
    ['Vrsta', appt.appointmentTypeName],
    ['Termin', formatDateTime(appt.startAt)],
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
      <h2>Detalji obavijesti</h2>

      <div className="notif-detail-list">
        {rows.map(([label, value]) => (
          <div key={label}>
            <AppIcon name="bell" />
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      {notification.status === 'FAILED' && notification.lastError ? (
        <section className="notif-error-card">
          <h3>Greška pri slanju</h3>
          <p>{notification.lastError}</p>
        </section>
      ) : null}
    </aside>
  )
}

function NotificationsPage(): ReactElement {
  const [notifications, setNotifications] = useState<NotificationDto[]>([])
  const [summary, setSummary] = useState<NotificationSummaryDto>({ total: 0, pending: 0, sent: 0, failed: 0 })
  const [selected, setSelected] = useState<NotificationDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const [statusFilter, setStatusFilter] = useState<NotificationStatusDto | ''>('')
  const [channelFilter, setChannelFilter] = useState<NotificationChannelDto | ''>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    const fetch = async (): Promise<void> => {
      try {
        setIsLoading(true)
        const data = await notificationsService.list({
          page,
          status: statusFilter || undefined,
          channel: channelFilter || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        })
        setNotifications(data.notifications)
        setSummary(data.summary)
        setTotalPages(data.totalPages)
        setTotalItems(data.totalItems)
        setSelected((current) => {
          if (!current) return data.notifications[0] ?? null
          const still = data.notifications.find((n) => n.id === current.id)
          return still ?? data.notifications[0] ?? null
        })
        setError(null)
      } catch (err) {
        setError(getErrorMessage(err))
        setNotifications([])
      } finally {
        setIsLoading(false)
      }
    }

    void fetch()
  }, [page, statusFilter, channelFilter, dateFrom, dateTo])

  const resetFilters = (): void => {
    setStatusFilter('')
    setChannelFilter('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  const handleFilterChange = (): void => setPage(1)

  const fromEntry = (page - 1) * 10 + 1
  const toEntry = Math.min(page * 10, totalItems)
  const paginationPages = buildPaginationPages(page, totalPages)

  return (
    <div className="notif-page">
      <div className="notif-page__hero">
        <div>
          <h1>Obavijesti</h1>
          <p>Pregled podsjetnika za termine i status slanja.</p>
        </div>
      </div>

      <SummaryCards summary={summary} />

      <section className="notif-filter-panel" aria-label="Filteri obavijesti">
        <label>
          <span>Datum od</span>
          <input
            className="notif-date-input"
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); handleFilterChange() }}
          />
        </label>
        <label>
          <span>Datum do</span>
          <input
            className="notif-date-input"
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); handleFilterChange() }}
          />
        </label>
        <label>
          <span>Status</span>
          <select
            className="notif-select"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as NotificationStatusDto | ''); handleFilterChange() }}
          >
            <option value="">Svi statusi</option>
            <option value="PENDING">Na čekanju</option>
            <option value="SENT">Poslano</option>
            <option value="FAILED">Neuspjelo</option>
          </select>
        </label>
        <label>
          <span>Kanal</span>
          <select
            className="notif-select"
            value={channelFilter}
            onChange={(e) => { setChannelFilter(e.target.value as NotificationChannelDto | ''); handleFilterChange() }}
          >
            <option value="">Svi kanali</option>
            <option value="EMAIL">E-mail</option>
            <option value="SMS">SMS</option>
          </select>
        </label>
        <button className="notif-clear-button" type="button" onClick={resetFilters}>
          <AppIcon name="tag" />
          Obriši filtre
        </button>
      </section>

      <div className="notif-content-grid">
        <section className="notif-table-panel" aria-label="Obavijesti">
          <div className="notif-table notif-table--head" role="row">
            <span>Planirano ↓</span>
            <span>Pacijent</span>
            <span>Liječnik</span>
            <span>Vrsta termina</span>
            <span>Kanal</span>
            <span>Status</span>
          </div>

          {isLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Učitavanje...</div>
          ) : error ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#d32f2f' }}>{error}</div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Nema obavijesti za zadane filtre.</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={
                  n.id === selected?.id
                    ? 'notif-table notif-table--row notif-table--row-selected'
                    : 'notif-table notif-table--row'
                }
                role="row"
                onClick={() => setSelected(n)}
              >
                <strong>{formatDateTime(n.scheduledFor)}</strong>
                <span>{n.appointment.patientFirstName} {n.appointment.patientLastName}</span>
                <span>
                  {n.appointment.doctorTitle
                    ? `${n.appointment.doctorTitle} ${n.appointment.doctorLastName}`
                    : `${n.appointment.doctorFirstName} ${n.appointment.doctorLastName}`}
                </span>
                <span>{n.appointment.appointmentTypeName}</span>
                <em className={`notif-channel`}>{CHANNEL_LABELS[n.channel]}</em>
                <em className={`notif-badge notif-badge--${n.status.toLowerCase()}`}>
                  {STATUS_LABELS[n.status]}
                </em>
              </div>
            ))
          )}

          {!isLoading && !error && totalItems > 0 ? (
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
