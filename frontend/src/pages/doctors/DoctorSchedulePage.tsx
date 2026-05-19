import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { AppIcon } from '@/components'
import { APP_ROUTES } from '@/app/routes'
import { doctorsService } from '@/services/doctors.service'
import type { DoctorResponseDto, DoctorWorkingHourResponseDto } from '@zdravstvo/contracts'

import './doctors.css'

const DAYS_OF_WEEK = [
  { index: 0, name: 'Ponedjeljak' },
  { index: 1, name: 'Utorak' },
  { index: 2, name: 'Srijeda' },
  { index: 3, name: 'Četvrtak' },
  { index: 4, name: 'Petak' },
  { index: 5, name: 'Subota' },
  { index: 6, name: 'Nedjelja' },
]

function DoctorSchedulePage(): ReactElement {
  const navigate = useNavigate()
  const { doctorId } = useParams<{ doctorId: string }>()
  const [doctor, setDoctor] = useState<DoctorResponseDto | null>(null)
  const [workingHours, setWorkingHours] = useState<DoctorWorkingHourResponseDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!doctorId) {
      setError('Doctor ID not found')
      setIsLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [doctorData, hoursData] = await Promise.all([
          doctorsService.getById(doctorId),
          doctorsService.listWorkingHours(doctorId),
        ])
        setDoctor(doctorData)
        setWorkingHours(hoursData.workingHours)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch schedule')
        setDoctor(null)
        setWorkingHours([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [doctorId])

  const handleTimeChange = (dayOfWeek: number, field: 'startTime' | 'endTime', value: string) => {
    setWorkingHours((prev) =>
      prev.map((hour) =>
        hour.dayOfWeek === dayOfWeek ? { ...hour, [field]: value } : hour
      )
    )
  }

  const handleToggleDay = (dayOfWeek: number) => {
    setWorkingHours((prev) =>
      prev.map((hour) =>
        hour.dayOfWeek === dayOfWeek ? { ...hour, isOff: !hour.isOff } : hour
      )
    )
  }

  const handleSave = async () => {
    if (!doctorId) return

    try {
      setIsSaving(true)
      await doctorsService.replaceWorkingHours(doctorId, { workingHours })
      navigate(APP_ROUTES.doctors)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save schedule')
    } finally {
      setIsSaving(false)
    }
  }

  const activeDays = workingHours.filter((h) => !h.isOff).length

  const handleApplyToWeekdays = (): void => {
    const firstActive = workingHours.find((h) => !h.isOff && h.dayOfWeek >= 0 && h.dayOfWeek <= 4)
    if (!firstActive) return
    setWorkingHours((prev) =>
      prev.map((h) =>
        h.dayOfWeek >= 0 && h.dayOfWeek <= 4
          ? { ...h, startTime: firstActive.startTime, endTime: firstActive.endTime, isOff: false }
          : h,
      ),
    )
  }

  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Učitavanje...</div>
  }

  if (error || !doctor) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#d32f2f' }}>{error || 'Liječnik nije pronađen'}</div>
  }

  const initials = `${doctor.firstName[0]}${doctor.lastName[0]}`.toUpperCase()

  return (
    <div className="doctor-schedule-page">
      <div className="doctor-schedule-header">
        <div className="doctor-schedule-doctor-info">
          <div className="doctor-schedule-avatar">
            <span>{initials}</span>
          </div>
          <div className="doctor-schedule-info">
            <h1>Dr. {doctor.firstName} {doctor.lastName}</h1>
            {doctor.title && <p>{doctor.title}</p>}
          </div>
        </div>
        <button className="doctor-schedule-menu-btn" type="button">
          <AppIcon name="dots" />
        </button>
      </div>

      <div className="doctor-schedule-content-grid">
        <section className="doctor-schedule-main">
          <div className="doctor-schedule-section">
            <h2 className="doctor-schedule-section-title">Jedinedi raspored</h2>

            <table className="doctor-schedule-table">
              <thead className="doctor-schedule-table-head">
                <tr>
                  <th className="doctor-schedule-table-header">Dan</th>
                  <th className="doctor-schedule-table-header">Aktivan</th>
                  <th className="doctor-schedule-table-header">Početak</th>
                  <th className="doctor-schedule-table-header">Završetak</th>
                  <th className="doctor-schedule-table-header">Pauza / Napomena</th>
                  <th className="doctor-schedule-table-header"></th>
                </tr>
              </thead>
              <tbody>
                {DAYS_OF_WEEK.map((day) => {
                  const dayHours = workingHours.find((h) => h.dayOfWeek === day.index)
                  const isOff = dayHours?.isOff ?? true
                  const startTime = dayHours?.startTime ?? '08:00'
                  const endTime = dayHours?.endTime ?? '16:00'

                  return (
                    <tr key={day.name} className="doctor-schedule-table-row">
                      <td className="doctor-schedule-table-cell doctor-schedule-table-cell--day">
                        {day.name}
                      </td>
                      <td className="doctor-schedule-table-cell doctor-schedule-table-cell--toggle">
                        <button
                          className={`doctor-schedule-toggle${!isOff ? ' doctor-schedule-toggle--on' : ''}`}
                          type="button"
                          role="switch"
                          aria-checked={!isOff}
                          onClick={() => handleToggleDay(day.index)}
                        />
                      </td>
                      <td className="doctor-schedule-table-cell doctor-schedule-table-cell--time">
                        {!isOff ? (
                          <div className="doctor-schedule-time-input">
                            <input
                              type="time"
                              value={startTime}
                              onChange={(e) => handleTimeChange(day.index, 'startTime', e.target.value)}
                            />
                            <AppIcon name="clock" />
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="doctor-schedule-table-cell doctor-schedule-table-cell--time">
                        {!isOff ? (
                          <div className="doctor-schedule-time-input">
                            <input
                              type="time"
                              value={endTime}
                              onChange={(e) => handleTimeChange(day.index, 'endTime', e.target.value)}
                            />
                            <AppIcon name="clock" />
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="doctor-schedule-table-cell doctor-schedule-table-cell--note">
                        {isOff ? 'Neradan dan' : 'Radni dan'}
                      </td>
                      <td className="doctor-schedule-table-cell doctor-schedule-table-cell--actions">
                        <button className="doctor-schedule-more-btn" type="button">
                          <AppIcon name="dots" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <p className="doctor-schedule-info-text">
              <AppIcon name="info" />
              Radno vrijeme primjenjuje se na sve njegove termine za ovog liječnika, osim ako nije drugačije navedeno.
            </p>
          </div>
        </section>

        <aside className="doctor-schedule-sidebar">
          <div className="doctor-schedule-summary-card">
            <h3 className="doctor-schedule-summary-card__title">Sažetak rasporeda</h3>

            <div className="doctor-schedule-summary-stat">
              <div className="doctor-schedule-summary-stat__icon">
                <AppIcon name="calendar" />
              </div>
              <div className="doctor-schedule-summary-stat__content">
                <span className="doctor-schedule-summary-stat__label">Ukupno aktivnih dana</span>
                <span className="doctor-schedule-summary-stat__value">
                  {activeDays} / 7
                </span>
                <span className="doctor-schedule-summary-stat__meta">Svi dani</span>
              </div>
            </div>

            <div className="doctor-schedule-summary-stat">
              <div className="doctor-schedule-summary-stat__icon">
                <AppIcon name="clock" />
              </div>
              <div className="doctor-schedule-summary-stat__content">
                <span className="doctor-schedule-summary-stat__label">Prosječno radno vrijeme</span>
                <span className="doctor-schedule-summary-stat__value">7 h 30 min</span>
                <span className="doctor-schedule-summary-stat__meta">Dnevno (bez pausa)</span>
              </div>
            </div>

            <div className="doctor-schedule-summary-stat">
              <div className="doctor-schedule-summary-stat__icon">
                <AppIcon name="calendar" />
              </div>
              <div className="doctor-schedule-summary-stat__content">
                <span className="doctor-schedule-summary-stat__label">Sljedeći slobodan termin</span>
                <span className="doctor-schedule-summary-stat__value">Danas u 16:30</span>
                <span className="doctor-schedule-summary-stat__meta">Kontrolni pregled</span>
              </div>
            </div>

            <p className="doctor-schedule-info-hint">
              <AppIcon name="info" />
              Pacijenti mogu rezervirati termine samo unutar vašeg radnog vremena.
            </p>
          </div>

          <div className="doctor-schedule-actions-card">
            <h3 className="doctor-schedule-actions-card__title">Brze akcije</h3>
            <div className="doctor-schedule-actions-list">
              <button className="doctor-schedule-action-item" type="button" onClick={handleApplyToWeekdays}>
                <AppIcon name="calendar" />
                <div>
                  <strong>Primijeni na sve radne dane</strong>
                  <span>Kopiraj radno vrijeme na PDN - PET</span>
                </div>
                <AppIcon name="chevronRight" />
              </button>
              <button className="doctor-schedule-action-item" type="button" onClick={() => navigate(APP_ROUTES.doctorExceptions.replace(':doctorId', doctorId ?? ''))}>
                <AppIcon name="clock" />
                <div>
                  <strong>Dodaj pauzu</strong>
                  <span>Dodaj pauzu za odabranog dan</span>
                </div>
                <AppIcon name="chevronRight" />
              </button>
              <button
                className="doctor-schedule-action-item"
                type="button"
                onClick={() => navigate(APP_ROUTES.doctorExceptions.replace(':doctorId', doctorId || ''))}
              >
                <AppIcon name="calendar" />
                <div>
                  <strong>Neradni dani i iznimke</strong>
                  <span>Upravljajte neradnim danima i iznimkama</span>
                </div>
                <AppIcon name="chevronRight" />
              </button>
            </div>
          </div>

          <button className="doctor-schedule-save-btn" type="button" onClick={handleSave} disabled={isSaving}>
            <AppIcon name="note" />
            {isSaving ? 'Sprema se...' : 'Spremi raspored'}
          </button>
        </aside>
      </div>
    </div>
  )
}

export { DoctorSchedulePage }
