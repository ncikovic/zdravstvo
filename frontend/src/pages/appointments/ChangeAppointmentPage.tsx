import type { ReactElement } from 'react'

import { AppIcon } from '@/components'
import type { AppIconName } from '@/types'

import './changeAppointment.css'

interface ChangeStep {
  number: number
  title: string
  description: string
}

interface SummaryItem {
  label: string
  title: string
  detail: string
  icon: AppIconName
  tone: 'patient' | 'doctor' | 'type' | 'old' | 'new' | 'duration'
}

const changeSteps: readonly ChangeStep[] = [
  { number: 1, title: 'Odabir termina', description: 'Pregled trenutnog termina' },
  { number: 2, title: 'Novi termin', description: 'Odaberite novi datum i vrijeme' },
  { number: 3, title: 'Pregled promjene', description: 'Provjerite i spremite promjenu' },
]

const calendarWeeks = [
  ['28', '29', '30', '1', '2', '3', '4'],
  ['5', '6', '7', '8', '9', '10', '11'],
  ['12', '13', '14', '15', '16', '17', '18'],
  ['19', '20', '21', '22', '23', '24', '25'],
  ['26', '27', '28', '29', '30', '31', '1'],
] as const

const timeSlots = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
] as const

const summaryItems: readonly SummaryItem[] = [
  {
    label: 'Pacijent',
    title: 'Ana Marić',
    detail: '01.01.1990.',
    icon: 'user',
    tone: 'patient',
  },
  {
    label: 'Liječnik',
    title: 'Dr. Ivan Horvat, dr. med.',
    detail: 'Specijalist interne medicine',
    icon: 'doctor',
    tone: 'doctor',
  },
  {
    label: 'Vrsta termina',
    title: 'Kontrolni pregled',
    detail: '30 minuta',
    icon: 'calendar',
    tone: 'type',
  },
  {
    label: 'Stari termin',
    title: 'Petak, 23. svibnja 2025.',
    detail: '10:00',
    icon: 'clock',
    tone: 'old',
  },
  {
    label: 'Novi termin',
    title: 'Petak, 23. svibnja 2025.',
    detail: '11:30',
    icon: 'clock',
    tone: 'new',
  },
  {
    label: 'Trajanje',
    title: '30 minuta',
    detail: '',
    icon: 'clock',
    tone: 'duration',
  },
]

function DoctorPortrait(): ReactElement {
  return (
    <span className="appointment-change-doctor-photo" aria-hidden="true">
      <span />
    </span>
  )
}

function ChangeAppointmentPage(): ReactElement {
  return (
    <div className="appointment-change-page">
      <nav className="appointment-change-breadcrumb" aria-label="Navigacija">
        <span>
          <AppIcon name="home" />
          Termini
        </span>
        <AppIcon name="chevronRight" />
        <span>Detalji termina</span>
        <AppIcon name="chevronRight" />
        <strong>Promjena termina</strong>
      </nav>

      <section className="appointment-change-hero">
        <div>
          <h1>Promjena termina</h1>
          <p>Ažurirajte datum, vrijeme ili liječnika za postojeći termin.</p>
        </div>
        <button className="appointment-change-back" type="button">
          <AppIcon name="chevronLeft" />
          Povratak na detalje termina
        </button>
      </section>

      <nav className="appointment-change-stepper" aria-label="Koraci promjene termina">
        {changeSteps.map((step, index) => (
          <div className="appointment-change-step" key={step.number}>
            <span className={step.number === 1 ? 'is-active' : ''}>{step.number}</span>
            <div>
              <strong>{step.title}</strong>
              <small>{step.description}</small>
            </div>
            {index < changeSteps.length - 1 ? <AppIcon name="chevronRight" /> : null}
          </div>
        ))}
      </nav>

      <div className="appointment-change-grid">
        <main className="appointment-change-card" aria-label="Promjena termina">
          <section className="appointment-change-section">
            <h2>1. Pacijent</h2>
            <div className="appointment-change-patient-row">
              <button className="appointment-change-select" type="button">
                <AppIcon name="user" />
                <span>Ana Marić (01.01.1990.)</span>
                <AppIcon name="chevronDown" />
              </button>
              <button className="appointment-change-new-patient" type="button">
                <AppIcon name="plus" />
                Novi pacijent
              </button>
            </div>
          </section>

          <section className="appointment-change-section">
            <h2>2. Liječnik</h2>
            <button className="appointment-change-doctor-select" type="button">
              <DoctorPortrait />
              <span>
                <strong>Dr. Ivan Horvat, dr. med.</strong>
                <small>Specijalist interne medicine</small>
              </span>
              <AppIcon name="chevronDown" />
            </button>
          </section>

          <section className="appointment-change-section">
            <h2>3. Vrsta termina</h2>
            <button className="appointment-change-type-select" type="button">
              <span>
                <AppIcon name="clock" />
              </span>
              <div>
                <strong>Kontrolni pregled</strong>
                <small>30 min</small>
              </div>
              <AppIcon name="chevronDown" />
            </button>
          </section>

          <section className="appointment-change-section appointment-change-schedule-section">
            <div className="appointment-change-scheduler">
              <section className="appointment-change-month" aria-label="Kalendar za svibanj 2025.">
                <h2>4. Odaberite novi datum</h2>
                <div className="appointment-change-month-panel">
                  <div className="appointment-change-month__header">
                    <button type="button" aria-label="Prethodni mjesec">
                      <AppIcon name="chevronLeft" />
                    </button>
                    <strong>Svibanj 2025.</strong>
                    <button type="button" aria-label="Sljedeći mjesec">
                      <AppIcon name="chevronRight" />
                    </button>
                  </div>
                  <div className="appointment-change-weekdays" aria-hidden="true">
                    {['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'].map((day) => (
                      <span key={day}>{day}</span>
                    ))}
                  </div>
                  <div className="appointment-change-calendar">
                    {calendarWeeks.flatMap((week, weekIndex) =>
                      week.map((day, dayIndex) => {
                        const isMuted =
                          (weekIndex === 0 && dayIndex < 3) ||
                          (weekIndex === calendarWeeks.length - 1 && day === '1')
                        const isSelected = day === '23' && weekIndex === 3

                        return (
                          <button
                            className={[isMuted ? 'is-muted' : '', isSelected ? 'is-selected' : '']
                              .filter(Boolean)
                              .join(' ')}
                            key={`${weekIndex}-${dayIndex}-${day}`}
                            type="button"
                          >
                            {day}
                          </button>
                        )
                      }),
                    )}
                  </div>
                </div>
              </section>

              <section className="appointment-change-times" aria-label="Dostupna vremena">
                <h2>5. Odaberite novo vrijeme</h2>
                <p>Petak, 23. svibnja 2025.</p>
                <div>
                  {timeSlots.map((slot) => (
                    <button
                      className={[
                        slot === '11:30' ? 'is-selected' : '',
                        slot === '10:00' ? 'is-disabled' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      key={slot}
                      type="button"
                    >
                      {slot}
                      {slot === '10:00' ? <AppIcon name="shield" /> : null}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <p className="appointment-change-comparison">
              <AppIcon name="info" />
              <span>Stari termin:</span>
              <strong>10:00</strong>
              <AppIcon name="chevronRight" />
              <span>Novi termin:</span>
              <em>11:30</em>
            </p>
          </section>
        </main>

        <aside className="appointment-change-summary" aria-label="Sažetak promjene">
          <h2>Sažetak promjene</h2>

          <div className="appointment-change-summary-list">
            {summaryItems.map((item) => (
              <article className="appointment-change-summary-item" key={item.label}>
                <span className={`appointment-change-summary-icon appointment-change-summary-icon--${item.tone}`}>
                  <AppIcon name={item.icon} />
                </span>
                <div>
                  <small>{item.label}</small>
                  <strong>{item.title}</strong>
                  {item.detail ? <span>{item.detail}</span> : null}
                </div>
              </article>
            ))}
          </div>

          <p className="appointment-change-reminder">
            <AppIcon name="info" />
            Podsjetnici za ovaj termin bit će automatski ažurirani i poslani pacijentu.
          </p>

          <button className="appointment-change-confirm" type="button">
            <AppIcon name="calendarCheck" />
            Spremi promjenu
          </button>

          <button className="appointment-change-cancel" type="button">
            Odustani
          </button>

          <button className="appointment-change-return" type="button">
            <AppIcon name="chevronLeft" />
            Povratak na termine
          </button>
        </aside>
      </div>
    </div>
  )
}

export { ChangeAppointmentPage }
