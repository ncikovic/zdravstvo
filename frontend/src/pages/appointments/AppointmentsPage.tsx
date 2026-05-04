import type { ReactElement } from 'react'

import { AppIcon } from '@/components'

import './appointments.css'

type AppointmentTone = 'blue' | 'teal' | 'orange' | 'red' | 'gray'

interface DoctorColumn {
  id: string
  name: string
  specialty: string
  initials: string
  tone: AppointmentTone
}

interface CalendarAppointment {
  id: string
  doctorId: string
  patient: string
  type: string
  start: string
  end: string
  top: number
  tone: AppointmentTone
  selected?: boolean
}

const doctors: readonly DoctorColumn[] = [
  {
    id: 'ivana',
    name: 'Dr. Ivana Horvat',
    specialty: 'Opća medicina',
    initials: 'IH',
    tone: 'orange',
  },
  {
    id: 'marko',
    name: 'Dr. Marko Horvat',
    specialty: 'Interna medicina',
    initials: 'MH',
    tone: 'blue',
  },
  {
    id: 'petra',
    name: 'Dr. Petra Barić',
    specialty: 'Ginekologija',
    initials: 'PB',
    tone: 'orange',
  },
  {
    id: 'luka',
    name: 'Dr. Luka Jurić',
    specialty: 'Ortopedija',
    initials: 'LJ',
    tone: 'blue',
  },
]

const appointments: readonly CalendarAppointment[] = [
  {
    id: 'ana-maric',
    doctorId: 'ivana',
    patient: 'Ana Marić',
    type: 'Kontrolni pregled',
    start: '08:00',
    end: '08:30',
    top: 8,
    tone: 'teal',
  },
  {
    id: 'marija-horvat',
    doctorId: 'ivana',
    patient: 'Marija Horvat',
    type: 'Prvi pregled',
    start: '09:00',
    end: '09:30',
    top: 65,
    tone: 'teal',
  },
  {
    id: 'ivan-babic',
    doctorId: 'ivana',
    patient: 'Ivan Babić',
    type: 'Kontrolni pregled',
    start: '10:00',
    end: '10:30',
    top: 122,
    tone: 'blue',
  },
  {
    id: 'petra-kovac',
    doctorId: 'ivana',
    patient: 'Petra Kovač',
    type: 'Konzultacija',
    start: '11:00',
    end: '11:30',
    top: 179,
    tone: 'orange',
  },
  {
    id: 'ana-juric',
    doctorId: 'ivana',
    patient: 'Ana Juričić',
    type: 'Kontrolni pregled',
    start: '13:00',
    end: '13:30',
    top: 350,
    tone: 'teal',
  },
  {
    id: 'nina-vukovic',
    doctorId: 'ivana',
    patient: 'Nina Vuković',
    type: 'Konzultacija',
    start: '14:00',
    end: '14:30',
    top: 407,
    tone: 'orange',
  },
  {
    id: 'tomislav-radic',
    doctorId: 'ivana',
    patient: 'Tomislav Radić',
    type: 'Prvi pregled',
    start: '15:00',
    end: '15:30',
    top: 464,
    tone: 'blue',
  },
  {
    id: 'luka-loncar',
    doctorId: 'ivana',
    patient: 'Luka Lončar',
    type: 'Kontrolni pregled',
    start: '16:00',
    end: '16:30',
    top: 521,
    tone: 'teal',
  },
  {
    id: 'josip-malovic',
    doctorId: 'marko',
    patient: 'Josip Malović',
    type: 'Kontrolni pregled',
    start: '08:00',
    end: '08:30',
    top: 8,
    tone: 'teal',
  },
  {
    id: 'ivana-galic',
    doctorId: 'marko',
    patient: 'Ivana Galić',
    type: 'Prvi pregled',
    start: '09:00',
    end: '09:30',
    top: 65,
    tone: 'blue',
  },
  {
    id: 'marko-simic',
    doctorId: 'marko',
    patient: 'Marko Šimić',
    type: 'Kontrolni pregled',
    start: '10:00',
    end: '10:30',
    top: 122,
    tone: 'blue',
  },
  {
    id: 'marta-simic',
    doctorId: 'marko',
    patient: 'Marta Šimić',
    type: 'Konzultacija',
    start: '11:00',
    end: '11:30',
    top: 179,
    tone: 'red',
  },
  {
    id: 'davor-mihalic',
    doctorId: 'marko',
    patient: 'Davor Mihalić',
    type: 'Kontrolni pregled',
    start: '12:00',
    end: '12:30',
    top: 236,
    tone: 'gray',
  },
  {
    id: 'bruno-kralj',
    doctorId: 'marko',
    patient: 'Bruno Kralj',
    type: 'Prvi pregled',
    start: '14:00',
    end: '14:30',
    top: 407,
    tone: 'teal',
  },
  {
    id: 'leon-novak',
    doctorId: 'marko',
    patient: 'Leon Novak',
    type: 'Kontrolni pregled',
    start: '15:00',
    end: '15:30',
    top: 464,
    tone: 'blue',
  },
  {
    id: 'lea-novak',
    doctorId: 'petra',
    patient: 'Lea Novak',
    type: 'Prvi pregled',
    start: '08:00',
    end: '08:30',
    top: 8,
    tone: 'blue',
    selected: true,
  },
  {
    id: 'ivana-peric',
    doctorId: 'petra',
    patient: 'Ivana Perić',
    type: 'Kontrolni pregled',
    start: '09:00',
    end: '09:30',
    top: 65,
    tone: 'teal',
  },
  {
    id: 'sara-peric',
    doctorId: 'petra',
    patient: 'Sara Perić',
    type: 'Konzultacija',
    start: '11:00',
    end: '11:30',
    top: 179,
    tone: 'orange',
  },
  {
    id: 'nives-rezic',
    doctorId: 'petra',
    patient: 'Nives Režić',
    type: 'Kontrolni pregled',
    start: '12:00',
    end: '12:30',
    top: 236,
    tone: 'teal',
  },
  {
    id: 'ana-prskalo',
    doctorId: 'petra',
    patient: 'Ana Prskalo',
    type: 'Prvi pregled',
    start: '13:00',
    end: '13:30',
    top: 293,
    tone: 'blue',
  },
  {
    id: 'petra-raic',
    doctorId: 'petra',
    patient: 'Petra Raić',
    type: 'Konzultacija',
    start: '15:00',
    end: '15:30',
    top: 464,
    tone: 'red',
  },
  {
    id: 'petar-vidovic',
    doctorId: 'luka',
    patient: 'Petar Vidović',
    type: 'Prvi pregled',
    start: '08:00',
    end: '08:30',
    top: 8,
    tone: 'teal',
  },
  {
    id: 'marko-tadic',
    doctorId: 'luka',
    patient: 'Marko Tadić',
    type: 'Kontrolni pregled',
    start: '09:00',
    end: '09:30',
    top: 65,
    tone: 'blue',
  },
  {
    id: 'ivan-bilic',
    doctorId: 'luka',
    patient: 'Ivan Bilić',
    type: 'Prvi pregled',
    start: '10:00',
    end: '10:30',
    top: 122,
    tone: 'blue',
  },
  {
    id: 'filip-bilic',
    doctorId: 'luka',
    patient: 'Filip Bilić',
    type: 'Konzultacija',
    start: '11:00',
    end: '11:30',
    top: 179,
    tone: 'orange',
  },
  {
    id: 'dino-saric',
    doctorId: 'luka',
    patient: 'Dino Šarić',
    type: 'Kontrolni pregled',
    start: '12:00',
    end: '12:30',
    top: 236,
    tone: 'teal',
  },
  {
    id: 'karla-jelic',
    doctorId: 'luka',
    patient: 'Karla Jelić',
    type: 'Prvi pregled',
    start: '13:00',
    end: '13:30',
    top: 293,
    tone: 'blue',
  },
  {
    id: 'karlo-kovac',
    doctorId: 'luka',
    patient: 'Karlo Kovač',
    type: 'Kontrolni pregled',
    start: '15:00',
    end: '15:30',
    top: 464,
    tone: 'gray',
  },
  {
    id: 'ante-vucic',
    doctorId: 'luka',
    patient: 'Ante Vučić',
    type: 'Prvi pregled',
    start: '16:00',
    end: '16:30',
    top: 521,
    tone: 'teal',
  },
]

const freeSlots = [
  ['Dr. Ivana Horvat', '16:30 - 17:00', '2 slobodna'],
  ['Dr. Marko Horvat', '16:00 - 17:30', '3 slobodna'],
  ['Dr. Petra Barić', '14:30 - 17:30', '4 slobodna'],
  ['Dr. Luka Jurić', '17:00 - 18:00', '2 slobodna'],
] as const

const reminders = [
  ['Ana Marić', 'Prvi pregled', 'Sutra u 09:00', 'orange'],
  ['Ivan Babić', 'Kontrolni pregled', 'Sutra u 10:30', 'teal'],
  ['Petra Kovač', 'Konzultacija', 'Sutra u 11:00', 'orange'],
] as const

const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']

function AppointmentsPage(): ReactElement {
  return (
    <div className="appointments-page">
      <div className="appointments-page__hero">
        <div>
          <h1>Termini</h1>
          <p>Pregled dnevnog rasporeda i upravljanje terminima.</p>
        </div>
        <button className="appointments-primary-button" type="button">
          <AppIcon name="plus" />
          Novi termin
        </button>
      </div>

      <section className="appointments-filters" aria-label="Filteri termina">
        <label>
          <span>Datum</span>
          <div>
            <AppIcon name="calendar" />
            <strong>23. svibnja 2025.</strong>
            <AppIcon name="chevronDown" />
          </div>
        </label>
        <label>
          <span>Liječnik</span>
          <div>
            <AppIcon name="user" />
            <strong>Svi liječnici</strong>
            <AppIcon name="chevronDown" />
          </div>
        </label>
        <label>
          <span>Vrsta termina</span>
          <div>
            <AppIcon name="tag" />
            <strong>Sve vrste</strong>
            <AppIcon name="chevronDown" />
          </div>
        </label>
        <label className="appointments-search-field">
          <span>Pretraga</span>
          <div>
            <AppIcon name="search" />
            <input type="search" placeholder="Pretražite pacijente, termine..." />
          </div>
        </label>
      </section>

      <div className="appointments-content-grid">
        <section className="appointments-calendar-panel" aria-label="Dnevni raspored">
          <div className="appointments-calendar-toolbar">
            <div className="appointments-date-controls">
              <button type="button" aria-label="Prethodni dan">
                <AppIcon name="chevronLeft" />
              </button>
              <button type="button">Danas</button>
              <button type="button" aria-label="Sljedeći dan">
                <AppIcon name="chevronRight" />
              </button>
            </div>

            <div className="appointments-current-day">
              Petak, 23. svibnja 2025.
              <AppIcon name="calendar" />
            </div>

            <div className="appointments-view-switcher" aria-label="Prikaz">
              <button className="appointments-view-switcher__active" type="button">
                Dan
              </button>
              <button type="button">Tjedan</button>
              <button type="button">Mjesec</button>
            </div>
          </div>

          <div className="appointments-calendar">
            <div className="appointments-calendar__header-spacer" />
            {doctors.map((doctor) => (
              <div className="appointments-doctor-heading" key={doctor.id}>
                <span className={`appointments-avatar appointments-avatar--${doctor.tone}`}>
                  {doctor.initials}
                </span>
                <div>
                  <strong>{doctor.name}</strong>
                  <small>{doctor.specialty}</small>
                </div>
              </div>
            ))}

            <div className="appointments-calendar__times">
              {hours.map((hour) => (
                <span key={hour}>{hour}</span>
              ))}
            </div>

            {doctors.map((doctor) => (
              <div className="appointments-doctor-column" key={doctor.id}>
                <div className="appointments-hour-lines">
                  {hours.map((hour) => (
                    <span key={hour} />
                  ))}
                </div>
                {appointments
                  .filter((appointment) => appointment.doctorId === doctor.id)
                  .map((appointment) => (
                    <article
                      className={[
                        'appointment-card',
                        `appointment-card--${appointment.tone}`,
                        appointment.selected ? 'appointment-card--selected' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      key={appointment.id}
                      style={{ top: `${appointment.top}px` }}
                    >
                      <span>
                        {appointment.start} - {appointment.end}
                      </span>
                      <strong>{appointment.patient}</strong>
                      <small>{appointment.type}</small>
                      {appointment.selected ? <AppIcon name="chevronRight" /> : null}
                    </article>
                  ))}
                {doctor.id === 'petra' || doctor.id === 'luka' ? (
                  <span className="appointments-empty-mark appointments-empty-mark--mid">-</span>
                ) : null}
                {doctor.id !== 'ivana' ? (
                  <span className="appointments-empty-mark appointments-empty-mark--low">-</span>
                ) : null}
              </div>
            ))}
          </div>

          <div className="appointments-legend">
            <span>
              <i className="appointments-dot appointments-dot--blue" />
              Prvi pregled
            </span>
            <span>
              <i className="appointments-dot appointments-dot--teal" />
              Kontrolni pregled
            </span>
            <span>
              <i className="appointments-dot appointments-dot--orange" />
              Konzultacija
            </span>
            <span>
              <i className="appointments-dot appointments-dot--red" />
              Hitni slučaj
            </span>
            <span>
              <i className="appointments-dot appointments-dot--gray" />
              Blokirano
            </span>
          </div>
        </section>

        <aside className="appointments-side-stack" aria-label="Sažetak termina">
          <section className="appointments-side-panel">
            <h2>Slobodni termini</h2>
            <p>Danas, 23. svibnja 2025.</p>
            <div className="appointments-free-list">
              {freeSlots.map(([name, time, badge]) => (
                <div key={name}>
                  <span>
                    <strong>{name}</strong>
                    <small>{time}</small>
                  </span>
                  <em>{badge}</em>
                </div>
              ))}
            </div>
            <button className="appointments-link-button" type="button">
              Pogledaj sve slobodne termine
              <AppIcon name="chevronRight" />
            </button>
          </section>

          <section className="appointments-side-panel">
            <h2>Podsjetnici</h2>
            <p>3 nadolazeća podsjetnika</p>
            <div className="appointments-reminders">
              {reminders.map(([name, type, due, tone]) => (
                <div className={`appointments-reminder appointments-reminder--${tone}`} key={name}>
                  <AppIcon name="bell" />
                  <span>
                    <strong>{name}</strong>
                    <small>{type}</small>
                  </span>
                  <time>{due}</time>
                </div>
              ))}
            </div>
            <button className="appointments-link-button" type="button">
              Pogledaj sve podsjetnike
              <AppIcon name="chevronRight" />
            </button>
          </section>

          <section className="appointments-selected-panel">
            <h2>Detalji odabranog termina</h2>
            <div className="appointments-selected-card">
              <span className="appointments-selected-icon">
                <AppIcon name="calendar" />
              </span>
              <div>
                <strong>Lea Novak</strong>
                <small>Prvi pregled</small>
                <small>Dr. Petrutmić</small>
              </div>
              <div>
                <time>08:00 - 08:30</time>
                <small>Dr. Petra Barić</small>
              </div>
            </div>
            <button type="button">
              Pogledaj detalje termina
              <AppIcon name="chevronRight" />
            </button>
          </section>

          <section className="appointments-side-panel appointments-quick-actions-panel">
            <h2>Brze akcije</h2>
            <div className="appointments-quick-actions">
              <button type="button">
                <AppIcon name="calendar" />
                Novi termin
              </button>
              <button type="button">
                <AppIcon name="shield" />
                Blokiraj vrijeme
              </button>
              <button type="button">
                <AppIcon name="note" />
                Ispiši raspored
              </button>
              <button type="button">
                <AppIcon name="send" />
                Izvezi raspored
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

export { AppointmentsPage }
