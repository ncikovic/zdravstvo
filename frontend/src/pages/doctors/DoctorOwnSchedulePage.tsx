import { useEffect, useState, useCallback } from 'react'
import type { ReactElement } from 'react'
import type { AppointmentResponseDto } from '@zdravstvo/contracts'

import { appointmentsService } from '@/services/appointments.service'
import { useAuthStore } from '@/stores/auth/auth.store'

type ViewMode = 'day' | 'week'

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Zakazano',
  COMPLETED: 'Završeno',
  CANCELLED: 'Otkazano',
  NO_SHOW: 'Nije se pojavio',
}

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: '#2563eb',
  COMPLETED: '#16a34a',
  CANCELLED: '#9ca3af',
  NO_SHOW: '#b91c1c',
}

function getWeekRange(date: Date): { start: Date; end: Date } {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const start = new Date(d)
  start.setDate(d.getDate() + diff)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

function getDayRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('hr-HR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString('hr-HR', { weekday: 'short', day: 'numeric', month: 'numeric' })
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function DoctorOwnSchedulePage(): ReactElement {
  const user = useAuthStore((s) => s.user)
  const orgUserId = useAuthStore((s) => s.orgUserId)

  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [appointments, setAppointments] = useState<AppointmentResponseDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchAppointments = useCallback(async (): Promise<void> => {
    if (!orgUserId) return

    const range = viewMode === 'week' ? getWeekRange(currentDate) : getDayRange(currentDate)

    try {
      setIsLoading(true)
      setError(null)
      const result = await appointmentsService.list({
        doctorId: orgUserId,
        startAt: range.start.toISOString(),
        endAt: range.end.toISOString(),
        limit: 200,
      })
      setAppointments(result.appointments ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri učitavanju termina.')
    } finally {
      setIsLoading(false)
    }
  }, [orgUserId, viewMode, currentDate])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  const handleUpdateStatus = async (appointmentId: string, status: 'COMPLETED' | 'NO_SHOW'): Promise<void> => {
    try {
      setUpdatingId(appointmentId)
      await appointmentsService.updateStatus(appointmentId, { status })
      setAppointments((prev) =>
        prev.map((a) => (a.id === appointmentId ? { ...a, status } : a))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri ažuriranju statusa.')
    } finally {
      setUpdatingId(null)
    }
  }

  const navigate = (direction: 'prev' | 'next'): void => {
    const delta = direction === 'next' ? 1 : -1
    setCurrentDate((d) => addDays(d, viewMode === 'week' ? delta * 7 : delta))
  }

  const weekRange = getWeekRange(currentDate)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekRange.start, i))

  const appointmentsForDay = (day: Date): AppointmentResponseDto[] => {
    const start = new Date(day); start.setHours(0, 0, 0, 0)
    const end = new Date(day); end.setHours(23, 59, 59, 999)
    return appointments.filter((a) => {
      const t = new Date(a.startAt).getTime()
      return t >= start.getTime() && t <= end.getTime()
    }).sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
  }

  const rangeLabel = viewMode === 'week'
    ? `${weekRange.start.toLocaleDateString('hr-HR', { day: 'numeric', month: 'short' })} – ${weekRange.end.toLocaleDateString('hr-HR', { day: 'numeric', month: 'short', year: 'numeric' })}`
    : formatDate(currentDate)

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Moj raspored</h1>
        {user && (
          <p style={{ margin: '0.25rem 0 0', color: '#666' }}>
            Dr. {user.firstName} {user.lastName}
          </p>
        )}
      </div>

      {error ? (
        <div role="alert" style={{ padding: '0.75rem 1rem', background: '#fef2f2', color: '#b91c1c', borderRadius: '6px', marginBottom: '1rem' }}>
          {error}
        </div>
      ) : null}

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button
            type="button"
            onClick={() => setViewMode('day')}
            style={{
              padding: '0.375rem 0.875rem',
              border: '1px solid #e2e8f0',
              borderRadius: '4px 0 0 4px',
              background: viewMode === 'day' ? '#2563eb' : '#fff',
              color: viewMode === 'day' ? '#fff' : '#374151',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Dan
          </button>
          <button
            type="button"
            onClick={() => setViewMode('week')}
            style={{
              padding: '0.375rem 0.875rem',
              border: '1px solid #e2e8f0',
              borderLeft: 'none',
              borderRadius: '0 4px 4px 0',
              background: viewMode === 'week' ? '#2563eb' : '#fff',
              color: viewMode === 'week' ? '#fff' : '#374151',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Tjedan
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => navigate('prev')}
            aria-label="Prethodna"
            style={{ padding: '0.375rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '4px', background: '#fff', cursor: 'pointer' }}
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => setCurrentDate(new Date())}
            style={{ padding: '0.375rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '4px', background: '#fff', cursor: 'pointer', fontSize: '0.875rem' }}
          >
            Danas
          </button>
          <button
            type="button"
            onClick={() => navigate('next')}
            aria-label="Sljedeća"
            style={{ padding: '0.375rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '4px', background: '#fff', cursor: 'pointer' }}
          >
            →
          </button>
        </div>

        <span style={{ color: '#374151', fontWeight: 500 }}>{rangeLabel}</span>
      </div>

      {isLoading ? (
        <p style={{ color: '#666' }}>Učitavanje...</p>
      ) : viewMode === 'week' ? (
        <WeekView
          days={weekDays}
          appointmentsForDay={appointmentsForDay}
          updatingId={updatingId}
          onUpdateStatus={handleUpdateStatus}
        />
      ) : (
        <DayView
          day={currentDate}
          appointments={appointmentsForDay(currentDate)}
          updatingId={updatingId}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  )
}

interface AppointmentCardProps {
  appointment: AppointmentResponseDto
  updatingId: string | null
  onUpdateStatus: (id: string, status: 'COMPLETED' | 'NO_SHOW') => void
}

function AppointmentCard({ appointment: a, updatingId, onUpdateStatus }: AppointmentCardProps): ReactElement {
  const isUpdating = updatingId === a.id
  const isScheduled = a.status === 'SCHEDULED'
  const statusColor = STATUS_COLORS[a.status] ?? '#374151'

  return (
    <div
      style={{
        border: '1px solid #e2e8f0',
        borderLeft: `4px solid ${statusColor}`,
        borderRadius: '6px',
        padding: '0.75rem',
        background: '#fff',
        marginBottom: '0.5rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
            {formatTime(a.startAt)} – {formatTime(a.endAt)}
          </div>
          <div style={{ fontWeight: 500, marginTop: '0.25rem' }}>
            {a.patient.firstName} {a.patient.lastName}
          </div>
          {a.patient.dateOfBirth ? (
            <div style={{ fontSize: '0.8rem', color: '#666' }}>
              Datum rođenja: {new Date(a.patient.dateOfBirth).toLocaleDateString('hr-HR')}
            </div>
          ) : null}
          <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.15rem' }}>
            {a.appointmentType.name} ({a.appointmentType.defaultDurationMinutes} min)
          </div>
          <div style={{ marginTop: '0.35rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.125rem 0.5rem',
                borderRadius: '12px',
                background: `${statusColor}18`,
                color: statusColor,
                fontWeight: 500,
              }}
            >
              {STATUS_LABELS[a.status] ?? a.status}
            </span>
          </div>
        </div>

        {isScheduled ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', flexShrink: 0 }}>
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onUpdateStatus(a.id, 'COMPLETED')}
              style={{
                padding: '0.25rem 0.625rem',
                background: '#16a34a',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                opacity: isUpdating ? 0.6 : 1,
              }}
            >
              Završi
            </button>
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onUpdateStatus(a.id, 'NO_SHOW')}
              style={{
                padding: '0.25rem 0.625rem',
                background: '#fff',
                color: '#b91c1c',
                border: '1px solid #fca5a5',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                opacity: isUpdating ? 0.6 : 1,
              }}
            >
              Nije se pojavio
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

interface WeekViewProps {
  days: Date[]
  appointmentsForDay: (day: Date) => AppointmentResponseDto[]
  updatingId: string | null
  onUpdateStatus: (id: string, status: 'COMPLETED' | 'NO_SHOW') => void
}

function WeekView({ days, appointmentsForDay, updatingId, onUpdateStatus }: WeekViewProps): ReactElement {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.75rem' }}>
      {days.map((day) => {
        const appts = appointmentsForDay(day)
        const isToday = day.getTime() === today.getTime()

        return (
          <div key={day.toISOString()}>
            <div
              style={{
                textAlign: 'center',
                padding: '0.5rem 0.25rem',
                marginBottom: '0.5rem',
                borderRadius: '6px',
                background: isToday ? '#2563eb' : 'transparent',
                color: isToday ? '#fff' : '#374151',
                fontWeight: isToday ? 600 : 400,
                fontSize: '0.8rem',
              }}
            >
              {formatDateShort(day)}
            </div>
            {appts.length === 0 ? (
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center', padding: '0.5rem 0' }}>
                —
              </div>
            ) : (
              appts.map((a) => (
                <AppointmentCard
                  key={a.id}
                  appointment={a}
                  updatingId={updatingId}
                  onUpdateStatus={onUpdateStatus}
                />
              ))
            )}
          </div>
        )
      })}
    </div>
  )
}

interface DayViewProps {
  day: Date
  appointments: AppointmentResponseDto[]
  updatingId: string | null
  onUpdateStatus: (id: string, status: 'COMPLETED' | 'NO_SHOW') => void
}

function DayView({ day, appointments, updatingId, onUpdateStatus }: DayViewProps): ReactElement {
  return (
    <div style={{ maxWidth: '640px' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#374151' }}>
        {formatDate(day)}
      </h2>
      {appointments.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
          Nema zakazanih termina za ovaj dan.
        </div>
      ) : (
        appointments.map((a) => (
          <AppointmentCard
            key={a.id}
            appointment={a}
            updatingId={updatingId}
            onUpdateStatus={onUpdateStatus}
          />
        ))
      )}
    </div>
  )
}

export { DoctorOwnSchedulePage }
