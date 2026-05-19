import { useCallback, useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import type { AppointmentResponseDto } from '@zdravstvo/contracts'

import { appointmentsService } from '@/services/appointments.service'
import { useAuthStore } from '@/stores/auth/auth.store'
import { getApiErrorMessage, toast } from '@/utils'

import './doctorOwnSchedule.css'

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
  return new Date(iso).toLocaleTimeString('hr-HR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('hr-HR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString('hr-HR', {
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
  })
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function DoctorOwnSchedulePage(): ReactElement {
  const user = useAuthStore((s) => s.user)

  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [appointments, setAppointments] = useState<AppointmentResponseDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchAppointments = useCallback(async (): Promise<void> => {
    if (!user) return

    const range = viewMode === 'week' ? getWeekRange(currentDate) : getDayRange(currentDate)

    try {
      setIsLoading(true)
      setError(null)
      const result = await appointmentsService.list({
        startAt: range.start.toISOString(),
        endAt: range.end.toISOString(),
        limit: 200,
      })
      setAppointments(result.appointments ?? [])
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [user, viewMode, currentDate])

  useEffect(() => {
    void fetchAppointments()
  }, [fetchAppointments])

  const handleUpdateStatus = async (
    appointmentId: string,
    status: 'COMPLETED' | 'NO_SHOW',
  ): Promise<void> => {
    try {
      setUpdatingId(appointmentId)
      await appointmentsService.updateStatus(appointmentId, { status })
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === appointmentId ? { ...appointment, status } : appointment,
        ),
      )
    } catch (err) {
      toast.error(err)
    } finally {
      setUpdatingId(null)
    }
  }

  const navigate = (direction: 'prev' | 'next'): void => {
    const delta = direction === 'next' ? 1 : -1
    setCurrentDate((date) => addDays(date, viewMode === 'week' ? delta * 7 : delta))
  }

  const weekRange = getWeekRange(currentDate)
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekRange.start, index))

  const appointmentsForDay = (day: Date): AppointmentResponseDto[] => {
    const start = new Date(day)
    start.setHours(0, 0, 0, 0)
    const end = new Date(day)
    end.setHours(23, 59, 59, 999)

    return appointments
      .filter((appointment) => {
        const appointmentTime = new Date(appointment.startAt).getTime()
        return appointmentTime >= start.getTime() && appointmentTime <= end.getTime()
      })
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
  }

  const rangeLabel =
    viewMode === 'week'
      ? `${weekRange.start.toLocaleDateString('hr-HR', {
          day: 'numeric',
          month: 'short',
        })} - ${weekRange.end.toLocaleDateString('hr-HR', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}`
      : formatDate(currentDate)

  return (
    <div className="doctor-own-schedule">
      <div className="doctor-own-schedule__header">
        <h1>Moj raspored</h1>
        {user ? (
          <p>
            Dr. {user.firstName} {user.lastName}
          </p>
        ) : null}
      </div>

      {error ? (
        <div className="doctor-own-schedule__error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="doctor-own-schedule__controls">
        <div className="doctor-own-schedule__segment" aria-label="Prikaz rasporeda">
          <button
            className={viewMode === 'day' ? 'is-active' : undefined}
            type="button"
            onClick={() => setViewMode('day')}
          >
            Dan
          </button>
          <button
            className={viewMode === 'week' ? 'is-active' : undefined}
            type="button"
            onClick={() => setViewMode('week')}
          >
            Tjedan
          </button>
        </div>

        <div className="doctor-own-schedule__nav">
          <button type="button" aria-label="Prethodna" onClick={() => navigate('prev')}>
            &larr;
          </button>
          <button type="button" onClick={() => setCurrentDate(new Date())}>
            Danas
          </button>
          <button type="button" aria-label="Sljedeća" onClick={() => navigate('next')}>
            &rarr;
          </button>
        </div>

        <span className="doctor-own-schedule__range">{rangeLabel}</span>
      </div>

      {isLoading ? (
        <p className="doctor-own-schedule__loading">Učitavanje...</p>
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

function AppointmentCard({
  appointment,
  updatingId,
  onUpdateStatus,
}: AppointmentCardProps): ReactElement {
  const isUpdating = updatingId === appointment.id
  const isScheduled = appointment.status === 'SCHEDULED'
  const statusColor = STATUS_COLORS[appointment.status] ?? '#374151'

  return (
    <article className="doctor-appointment-card" style={{ borderLeftColor: statusColor }}>
      <div className="doctor-appointment-card__body">
        <div className="doctor-appointment-card__content">
          <div className="doctor-appointment-card__time">
            {formatTime(appointment.startAt)} - {formatTime(appointment.endAt)}
          </div>
          <div className="doctor-appointment-card__patient">
            {appointment.patient.firstName} {appointment.patient.lastName}
          </div>
          {appointment.patient.dateOfBirth ? (
            <div className="doctor-appointment-card__meta">
              Datum rođenja:{' '}
              {new Date(appointment.patient.dateOfBirth).toLocaleDateString('hr-HR')}
            </div>
          ) : null}
          <div className="doctor-appointment-card__meta">
            {appointment.appointmentType.name} (
            {appointment.appointmentType.defaultDurationMinutes} min)
          </div>
          <div className="doctor-appointment-card__status">
            <span
              className="doctor-appointment-card__badge"
              style={{
                background: `${statusColor}18`,
                color: statusColor,
              }}
            >
              {STATUS_LABELS[appointment.status] ?? appointment.status}
            </span>
          </div>
        </div>

        {isScheduled ? (
          <div className="doctor-appointment-card__actions">
            <button
              className="doctor-appointment-card__action doctor-appointment-card__action--complete"
              type="button"
              disabled={isUpdating}
              onClick={() => onUpdateStatus(appointment.id, 'COMPLETED')}
            >
              Završi
            </button>
            <button
              className="doctor-appointment-card__action doctor-appointment-card__action--no-show"
              type="button"
              disabled={isUpdating}
              onClick={() => onUpdateStatus(appointment.id, 'NO_SHOW')}
            >
              Nije se pojavio
            </button>
          </div>
        ) : null}
      </div>
    </article>
  )
}

interface WeekViewProps {
  days: Date[]
  appointmentsForDay: (day: Date) => AppointmentResponseDto[]
  updatingId: string | null
  onUpdateStatus: (id: string, status: 'COMPLETED' | 'NO_SHOW') => void
}

function WeekView({
  days,
  appointmentsForDay,
  updatingId,
  onUpdateStatus,
}: WeekViewProps): ReactElement {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="doctor-week-shell">
      <div className="doctor-week-grid">
        {days.map((day) => {
          const dayAppointments = appointmentsForDay(day)
          const isToday = day.getTime() === today.getTime()

          return (
            <section className="doctor-week-day" key={day.toISOString()}>
              <div
                className={
                  isToday ? 'doctor-week-day__label is-today' : 'doctor-week-day__label'
                }
              >
                {formatDateShort(day)}
              </div>
              {dayAppointments.length === 0 ? (
                <div className="doctor-week-day__empty">-</div>
              ) : (
                dayAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    updatingId={updatingId}
                    onUpdateStatus={onUpdateStatus}
                  />
                ))
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}

interface DayViewProps {
  day: Date
  appointments: AppointmentResponseDto[]
  updatingId: string | null
  onUpdateStatus: (id: string, status: 'COMPLETED' | 'NO_SHOW') => void
}

function DayView({
  day,
  appointments,
  updatingId,
  onUpdateStatus,
}: DayViewProps): ReactElement {
  return (
    <div className="doctor-day-view">
      <h2>{formatDate(day)}</h2>
      {appointments.length === 0 ? (
        <div className="doctor-day-view__empty">
          Nema zakazanih termina za ovaj dan.
        </div>
      ) : (
        appointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            updatingId={updatingId}
            onUpdateStatus={onUpdateStatus}
          />
        ))
      )}
    </div>
  )
}

export { DoctorOwnSchedulePage }
