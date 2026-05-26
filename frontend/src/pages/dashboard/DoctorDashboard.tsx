import { useEffect, useMemo, useState, type FormEvent, type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'

import { APP_ROUTES } from '@/app/routes'
import { AppIcon } from '@/components'
import type { DoctorDashboard as DoctorDashboardData } from '@/types'

import { doctorLocalNotes } from './dashboard.data'
import { mapDoctorDashboard } from './dashboard.mappers'
import type { CompactItem } from './dashboard.types'
import {
  AvatarBadge,
  DashboardSection,
  DashboardStatCard,
  IconTile,
  StatusBadge,
} from './DashboardPrimitives'

interface DoctorDashboardProps {
  dashboard: DoctorDashboardData
}

interface StoredQuickNote {
  id: string
  title: string
  createdAt: string
}

const QUICK_NOTES_STORAGE_KEY = 'zdravstvo:doctor-dashboard:quick-notes'
const MAX_VISIBLE_NOTES = 3

const formatQuickNoteMeta = (createdAt: string): string => {
  const date = new Date(createdAt)

  if (Number.isNaN(date.getTime())) {
    return 'Lokalna bilješka'
  }

  return new Intl.DateTimeFormat('hr-HR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const readStoredQuickNotes = (): StoredQuickNote[] => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const rawValue = window.localStorage.getItem(QUICK_NOTES_STORAGE_KEY)

    if (!rawValue) {
      return []
    }

    const parsedValue = JSON.parse(rawValue) as unknown

    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue.filter((note): note is StoredQuickNote => {
      return (
        typeof note === 'object' &&
        note !== null &&
        'id' in note &&
        'title' in note &&
        'createdAt' in note &&
        typeof note.id === 'string' &&
        typeof note.title === 'string' &&
        typeof note.createdAt === 'string'
      )
    })
  } catch {
    return []
  }
}

const persistQuickNotes = (notes: readonly StoredQuickNote[]): void => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(QUICK_NOTES_STORAGE_KEY, JSON.stringify(notes))
}

const mapStoredQuickNote = (note: StoredQuickNote): CompactItem => ({
  icon: 'note',
  title: note.title,
  meta: formatQuickNoteMeta(note.createdAt),
  tone: 'teal',
})

export function DoctorDashboard({ dashboard }: DoctorDashboardProps): ReactElement {
  const navigate = useNavigate()
  const view = mapDoctorDashboard(dashboard)
  const [quickNoteValue, setQuickNoteValue] = useState('')
  const [storedQuickNotes, setStoredQuickNotes] = useState<StoredQuickNote[]>([])
  const [showAllQuickNotes, setShowAllQuickNotes] = useState(false)

  useEffect(() => {
    setStoredQuickNotes(readStoredQuickNotes())
  }, [])

  const quickNotes = useMemo<CompactItem[]>(() => {
    const userNotes = storedQuickNotes.map(mapStoredQuickNote)

    return userNotes.length > 0 ? userNotes : [...doctorLocalNotes]
  }, [storedQuickNotes])

  const visibleQuickNotes = showAllQuickNotes
    ? quickNotes
    : quickNotes.slice(0, MAX_VISIBLE_NOTES)

  const canToggleQuickNotes = quickNotes.length > MAX_VISIBLE_NOTES

  const addQuickNote = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()

    const title = quickNoteValue.trim()

    if (!title) {
      return
    }

    const nextNotes = [
      {
        id: `${Date.now()}`,
        title,
        createdAt: new Date().toISOString(),
      },
      ...storedQuickNotes,
    ].slice(0, 20)

    setStoredQuickNotes(nextNotes)
    persistQuickNotes(nextNotes)
    setQuickNoteValue('')
    setShowAllQuickNotes(false)
  }

  return (
    <div className="dashboard-page dashboard-page--doctor">
      <div className="dashboard-stat-grid dashboard-stat-grid--four">
        {view.stats.map((stat) => (
          <DashboardStatCard key={stat.label} stat={stat} />
        ))}
      </div>

      <div className="dashboard-grid dashboard-grid--doctor">
        <div className="dashboard-main-stack">
          <DashboardSection
            title="Današnji raspored"
            icon="calendar"
            actionLabel="Pogledaj cijeli raspored"
            onAction={() => navigate(APP_ROUTES.doctorOwnSchedule)}
            footerLabel="Prikaži još termina"
            onFooter={() => navigate(APP_ROUTES.doctorOwnSchedule)}
          >
            <div className="dashboard-table dashboard-table--doctor" role="table">
              {view.scheduleRows.length > 0 ? view.scheduleRows.map((row) => (
                <div className="dashboard-table__row" role="row" key={`${row.time}-${row.name}`}>
                  <strong className="dashboard-table__time">{row.time}</strong>
                  <span
                    className={
                      row.current
                        ? 'dashboard-live-dot dashboard-live-dot--active'
                        : 'dashboard-live-dot'
                    }
                    aria-hidden="true"
                  />
                  <AvatarBadge initials={row.initials} tone={row.tone} />
                  <span className="dashboard-table__person">
                    <strong>{row.name}</strong>
                    <small>{row.meta}</small>
                  </span>
                  <StatusBadge tone={row.tone}>{row.type}</StatusBadge>
                  <button className="dashboard-row-action" type="button" aria-label="Opcije termina">
                    <AppIcon name="dots" />
                  </button>
                </div>
              )) : (
                <div className="dashboard-table__row" role="row">
                  <strong className="dashboard-table__time">--:--</strong>
                  <span className="dashboard-live-dot" aria-hidden="true" />
                  <AvatarBadge initials="--" tone="blue" />
                  <span className="dashboard-table__person">
                    <strong>Nema termina za danas</strong>
                    <small>Raspored je prazan</small>
                  </span>
                  <StatusBadge tone="blue">Nema unosa</StatusBadge>
                  <span aria-hidden="true" />
                </div>
              )}
            </div>
          </DashboardSection>

          <DashboardSection
            title="Nedavne aktivnosti"
            icon="activity"
          >
            <div className="dashboard-activity-list">
              {view.activities.map((activity) => (
                <div className="dashboard-activity-row" key={activity.title}>
                  <IconTile icon={activity.icon} tone={activity.tone} />
                  <span>
                    <strong>{activity.title}</strong>
                    <small>{activity.meta}</small>
                  </span>
                  <time>{activity.actionLabel ?? ''}</time>
                </div>
              ))}
            </div>
          </DashboardSection>
        </div>

        <div className="dashboard-side-stack">
          <DashboardSection title="Sljedeći pacijent" icon="clipboard">
            {view.nextPatient ? (
              <>
                <div className="next-patient">
                  <AvatarBadge initials={view.nextPatient.initials} tone="teal" />
                  <div>
                    <strong>{view.nextPatient.name}</strong>
                    <span>{view.nextPatient.meta}</span>
                  </div>
                </div>
                <div className="next-patient__details">
                  <span>
                    <AppIcon name="clock" />
                    <strong>{view.nextPatient.time}</strong>
                    {view.nextPatient.relativeTime}
                  </span>
                  <span>
                    <AppIcon name="calendar" />
                    <strong>{view.nextPatient.appointmentType}</strong>
                    {view.nextPatient.note}
                  </span>
                </div>
                <button
                  className="dashboard-gradient-action"
                  type="button"
                  onClick={() => navigate(`/appointments/${view.nextPatient?.id ?? ''}`)}
                >
                  Otvori detalje
                  <AppIcon name="chevronRight" />
                </button>
              </>
            ) : (
              <>
                <div className="next-patient">
                  <AvatarBadge initials="--" tone="teal" />
                  <div>
                    <strong>Nema nadolazećeg pacijenta</strong>
                    <span>Raspored je trenutno miran</span>
                  </div>
                </div>
                <div className="next-patient__details">
                  <span>
                    <AppIcon name="clock" />
                    <strong>--:--</strong>
                    Nema termina
                  </span>
                  <span>
                    <AppIcon name="calendar" />
                    <strong>Sljedeći termin</strong>
                    Nije pronađen u rasporedu
                  </span>
                </div>
              </>
            )}
          </DashboardSection>

          <DashboardSection
            title="Brze bilješke"
            icon="note"
            footerLabel={
              canToggleQuickNotes
                ? showAllQuickNotes
                  ? 'Sakrij dodatne bilješke'
                  : 'Pogledaj sve bilješke'
                : undefined
            }
            onFooter={
              canToggleQuickNotes
                ? () => setShowAllQuickNotes((currentValue) => !currentValue)
                : undefined
            }
          >
            <form className="quick-note-input" onSubmit={addQuickNote}>
              <label className="sr-only" htmlFor="doctor-dashboard-quick-note">
                Zabilježi brzu bilješku
              </label>
              <input
                id="doctor-dashboard-quick-note"
                type="text"
                value={quickNoteValue}
                onChange={(event) => setQuickNoteValue(event.target.value)}
                placeholder="Zabilježi brzu bilješku..."
                maxLength={160}
              />
              <button type="submit" aria-label="Dodaj bilješku">
                <AppIcon name="plus" />
              </button>
            </form>
            <div className="dashboard-compact-list">
              {visibleQuickNotes.map((note) => (
                <div className="dashboard-compact-row" key={`${note.title}-${note.meta}`}>
                  <IconTile icon={note.icon} tone={note.tone} />
                  <span>
                    <strong>{note.title}</strong>
                    <small>{note.meta}</small>
                  </span>
                </div>
              ))}
            </div>
          </DashboardSection>
        </div>
      </div>
    </div>
  )
}
