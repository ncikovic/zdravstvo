import { useState } from 'react'
import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppIcon } from '@/components'
import { APP_ROUTES } from '@/app/routes'

import './doctors.css'

interface ScheduleDay {
  readonly day: string
  readonly active: boolean
  readonly startTime: string
  readonly endTime: string
  readonly pauseTime: string
}

const INITIAL_SCHEDULE: readonly ScheduleDay[] = [
  { day: 'Ponedjeljak', active: true, startTime: '08:00', endTime: '16:00', pauseTime: '12:00 - 12:30 pausa' },
  { day: 'Utorak', active: true, startTime: '08:00', endTime: '16:00', pauseTime: '12:00 - 12:30 pausa' },
  { day: 'Srijeda', active: true, startTime: '08:00', endTime: '16:00', pauseTime: 'Bez pause' },
  { day: 'Četvrtak', active: true, startTime: '08:00', endTime: '18:00', pauseTime: '13:00 - 13:30 pausa' },
  { day: 'Petak', active: true, startTime: '08:00', endTime: '14:00', pauseTime: 'Bez pause' },
  { day: 'Subota', active: false, startTime: '—', endTime: '—', pauseTime: 'Neradan dan' },
  { day: 'Nedjelja', active: false, startTime: '—', endTime: '—', pauseTime: 'Neradan dan' },
]

const DOCTOR_NAME = 'Dr. Ivan Horvat, dr. med.'
const DOCTOR_SPECIALTY = 'Specialist interne medicine'

function DoctorSchedulePage(): ReactElement {
  const navigate = useNavigate()
  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE)

  const activeDays = schedule.filter((d) => d.active).length

  const handleToggleDay = (index: number) => {
    setSchedule((prev) =>
      prev.map((day, i) =>
        i === index ? { ...day, active: !day.active } : day
      )
    )
  }

  const handleTimeChange = (index: number, field: 'startTime' | 'endTime', value: string) => {
    setSchedule((prev) =>
      prev.map((day, i) =>
        i === index ? { ...day, [field]: value } : day
      )
    )
  }

  const handleSave = () => {
    navigate(APP_ROUTES.doctors)
  }

  return (
    <div className="doctor-schedule-page">
      <div className="doctor-schedule-header">
        <div className="doctor-schedule-doctor-info">
          <div className="doctor-schedule-avatar">
            <span>IH</span>
          </div>
          <div className="doctor-schedule-info">
            <h1>{DOCTOR_NAME}</h1>
            <p>{DOCTOR_SPECIALTY}</p>
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
                {schedule.map((daySchedule, index) => (
                  <tr key={daySchedule.day} className="doctor-schedule-table-row">
                    <td className="doctor-schedule-table-cell doctor-schedule-table-cell--day">
                      {daySchedule.day}
                    </td>
                    <td className="doctor-schedule-table-cell doctor-schedule-table-cell--toggle">
                      <button
                        className={`doctor-schedule-toggle${daySchedule.active ? ' doctor-schedule-toggle--on' : ''}`}
                        type="button"
                        role="switch"
                        aria-checked={daySchedule.active}
                        onClick={() => handleToggleDay(index)}
                      />
                    </td>
                    <td className="doctor-schedule-table-cell doctor-schedule-table-cell--time">
                      {daySchedule.active ? (
                        <div className="doctor-schedule-time-input">
                          <input
                            type="time"
                            value={daySchedule.startTime}
                            onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                          />
                          <AppIcon name="clock" />
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="doctor-schedule-table-cell doctor-schedule-table-cell--time">
                      {daySchedule.active ? (
                        <div className="doctor-schedule-time-input">
                          <input
                            type="time"
                            value={daySchedule.endTime}
                            onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                          />
                          <AppIcon name="clock" />
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="doctor-schedule-table-cell doctor-schedule-table-cell--note">
                      {daySchedule.pauseTime}
                    </td>
                    <td className="doctor-schedule-table-cell doctor-schedule-table-cell--actions">
                      <button className="doctor-schedule-more-btn" type="button">
                        <AppIcon name="dots" />
                      </button>
                    </td>
                  </tr>
                ))}
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
                  {activeDays} / {schedule.length}
                </span>
                <span className="doctor-schedule-summary-stat__meta">Ponedjeljak – Petak</span>
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
            <ul className="doctor-schedule-actions-list">
              <li className="doctor-schedule-action-item">
                <AppIcon name="calendar" />
                <div>
                  <strong>Primijeni na sve radne dane</strong>
                  <span>Kopiraj radno vrijeme na PDN - PET</span>
                </div>
                <AppIcon name="chevronRight" />
              </li>
              <li className="doctor-schedule-action-item">
                <AppIcon name="clock" />
                <div>
                  <strong>Dodaj pauzu</strong>
                  <span>Dodaj pauzu za odabranog dan</span>
                </div>
                <AppIcon name="chevronRight" />
              </li>
              <li className="doctor-schedule-action-item">
                <AppIcon name="calendar" />
                <div>
                  <strong>Neradni dani i iznimke</strong>
                  <span>Upravljajte neradnim danima i iznimkama</span>
                </div>
                <AppIcon name="chevronRight" />
              </li>
            </ul>
          </div>

          <button className="doctor-schedule-save-btn" type="button" onClick={handleSave}>
            <AppIcon name="note" />
            Spremi raspored
          </button>
        </aside>
      </div>
    </div>
  )
}

export { DoctorSchedulePage }
