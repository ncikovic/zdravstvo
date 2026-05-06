import type { ReactElement } from 'react'

import { AppIcon } from '@/components'
import type { AppIconName } from '@/types'

import './createAppointment.css'

interface WizardStep {
  number: number
  title: string
  description: string
}

interface AppointmentTypeOption {
  id: string
  title: string
  duration: string
  icon: AppIconName
  tone: 'blue' | 'teal' | 'purple'
  selected?: boolean
}

interface SummaryItem {
  label: string
  title: string
  detail: string
  icon: AppIconName
  tone: 'patient' | 'doctor' | 'type' | 'date' | 'time'
}

const wizardSteps: readonly WizardStep[] = [
  { number: 1, title: 'Pacijent', description: 'Odaberite pacijenta' },
  { number: 2, title: 'Liječnik', description: 'Odaberite liječnika' },
  { number: 3, title: 'Vrsta termina', description: 'Odaberite vrstu termina' },
  { number: 4, title: 'Termin potvrde', description: 'Provjerite i potvrdite' },
]

const appointmentTypes: readonly AppointmentTypeOption[] = [
  {
    id: 'first',
    title: 'Prvi pregled',
    duration: '45 min',
    icon: 'calendar',
    tone: 'blue',
    selected: true,
  },
  {
    id: 'regular',
    title: 'Redovni pregled',
    duration: '30 min',
    icon: 'clock',
    tone: 'teal',
  },
  {
    id: 'control',
    title: 'Kontrolni pregled',
    duration: '20 min',
    icon: 'users',
    tone: 'blue',
  },
  {
    id: 'counseling',
    title: 'Savjetovanje',
    duration: '30 min',
    icon: 'shieldCheck',
    tone: 'purple',
  },
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
    title: 'Prvi pregled',
    detail: '45 minuta',
    icon: 'calendar',
    tone: 'type',
  },
  {
    label: 'Datum i vrijeme',
    title: 'Petak, 23. svibnja 2025.',
    detail: '10:00',
    icon: 'calendarCheck',
    tone: 'date',
  },
  {
    label: 'Trajanje',
    title: '45 minuta',
    detail: '',
    icon: 'clock',
    tone: 'time',
  },
]

function DoctorPortrait(): ReactElement {
  return (
    <span className="appointment-create-doctor-photo" aria-hidden="true">
      <span />
    </span>
  )
}

function CreateAppointmentPage(): ReactElement {
  return (
    <div className="appointment-create-page">
      <section className="appointment-create-hero">
        <h1>Rezervacija termina</h1>
        <p>Jednostavno rezervirajte termin u nekoliko koraka.</p>
      </section>

      <nav className="appointment-create-stepper" aria-label="Koraci rezervacije">
        {wizardSteps.map((step, index) => (
          <div className="appointment-create-step" key={step.number}>
            <span className={step.number === 1 ? 'is-active' : ''}>{step.number}</span>
            <div>
              <strong>{step.title}</strong>
              <small>{step.description}</small>
            </div>
            {index < wizardSteps.length - 1 ? <AppIcon name="chevronRight" /> : null}
          </div>
        ))}
      </nav>

      <div className="appointment-create-grid">
        <main className="appointment-create-card" aria-label="Podaci rezervacije">
          <section className="appointment-create-section">
            <h2>1. Odaberite pacijenta</h2>
            <div className="appointment-create-patient-row">
              <button className="appointment-create-select" type="button">
                <AppIcon name="user" />
                <span>Ana Marić (01.01.1990.)</span>
                <AppIcon name="chevronDown" />
              </button>
              <button className="appointment-create-new-patient" type="button">
                <AppIcon name="plus" />
                Novi pacijent
              </button>
            </div>
          </section>

          <section className="appointment-create-section">
            <h2>2. Odaberite liječnika</h2>
            <button className="appointment-create-doctor-select" type="button">
              <DoctorPortrait />
              <span>
                <strong>Dr. Ivan Horvat, dr. med.</strong>
                <small>Specijalist interne medicine</small>
              </span>
              <AppIcon name="chevronDown" />
            </button>
          </section>

          <section className="appointment-create-section">
            <h2>3. Odaberite vrstu termina</h2>
            <div className="appointment-create-types">
              {appointmentTypes.map((type) => (
                <button
                  className={[
                    'appointment-create-type',
                    `appointment-create-type--${type.tone}`,
                    type.selected ? 'appointment-create-type--selected' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  key={type.id}
                  type="button"
                >
                  <span>
                    <AppIcon name={type.icon} />
                  </span>
                  <div>
                    <strong>{type.title}</strong>
                    <small>{type.duration}</small>
                  </div>
                  {type.selected ? <AppIcon name="checkCircle" /> : null}
                </button>
              ))}
            </div>
          </section>

          <section className="appointment-create-section">
            <h2>4. Odaberite datum i vrijeme</h2>
            <div className="appointment-create-scheduler">
              <section className="appointment-create-month" aria-label="Kalendar za svibanj 2025.">
                <div className="appointment-create-month__header">
                  <button type="button" aria-label="Prethodni mjesec">
                    <AppIcon name="chevronLeft" />
                  </button>
                  <strong>Svibanj 2025.</strong>
                  <button type="button" aria-label="Sljedeći mjesec">
                    <AppIcon name="chevronRight" />
                  </button>
                </div>

                <div className="appointment-create-weekdays" aria-hidden="true">
                  {['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'].map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                </div>

                <div className="appointment-create-calendar">
                  {calendarWeeks.flatMap((week, weekIndex) =>
                    week.map((day, dayIndex) => {
                      const isMuted =
                        (weekIndex === 0 && dayIndex < 3) ||
                        (weekIndex === calendarWeeks.length - 1 && day === '1')
                      const isSelected = day === '23' && weekIndex === 3

                      return (
                        <button
                          className={[
                            isMuted ? 'is-muted' : '',
                            isSelected ? 'is-selected' : '',
                          ]
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
              </section>

              <section className="appointment-create-times" aria-label="Dostupna vremena">
                <h3>Petak, 23. svibnja 2025.</h3>
                <div>
                  {timeSlots.map((slot) => (
                    <button className={slot === '10:00' ? 'is-selected' : ''} key={slot} type="button">
                      {slot}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <p className="appointment-create-info">
              <AppIcon name="info" />
              Prikazana su slobodna vremena za odabranog liječnika i vrstu termina.
            </p>
          </section>
        </main>

        <aside className="appointment-create-summary" aria-label="Sažetak rezervacije">
          <h2>Sažetak rezervacije</h2>

          <div className="appointment-create-summary-list">
            {summaryItems.map((item) => (
              <article className="appointment-create-summary-item" key={item.label}>
                <span className={`appointment-create-summary-icon appointment-create-summary-icon--${item.tone}`}>
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

          <p className="appointment-create-reminder">
            <AppIcon name="info" />
            Pacijent će primiti podsjetnik na termin putem e-maila i SMS-a.
          </p>

          <button className="appointment-create-confirm" type="button">
            <AppIcon name="calendar" />
            Potvrdi rezervaciju
          </button>

          <button className="appointment-create-cancel" type="button">
            Poništi
          </button>
        </aside>
      </div>
    </div>
  )
}

export { CreateAppointmentPage }
