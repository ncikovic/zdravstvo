import type { ReactElement } from 'react'

import { AppIcon } from '@/components'

import './doctors.css'

type DoctorTone = 'teal' | 'purple' | 'red' | 'blue' | 'violet' | 'orange' | 'green' | 'amber'

interface DoctorRow {
  initials: string
  name: string
  specialty: string
  phone: string
  email: string
  availability: string
  available: boolean
  status: 'Aktivan' | 'Neaktivan'
  tone: DoctorTone
}

const doctors: readonly DoctorRow[] = [
  {
    initials: 'PB',
    name: 'Dr. Petra Barić',
    specialty: 'Ginekologija',
    phone: '+385 91 234 5678',
    email: 'petra.baric@pmz.hr',
    availability: '08:00 - 16:30',
    available: true,
    status: 'Aktivan',
    tone: 'teal',
  },
  {
    initials: 'IH',
    name: 'Dr. Ivan Horvat, dr. med.',
    specialty: 'Interna medicina',
    phone: '+385 91 876 4321',
    email: 'ivan.horvat@pmz.hr',
    availability: '08:00 - 16:30',
    available: true,
    status: 'Aktivan',
    tone: 'purple',
  },
  {
    initials: 'IB',
    name: 'Dr. Ivan Babić',
    specialty: 'Kardiologija',
    phone: '+385 91 444 0004',
    email: 'ivan.babic@pmz.hr',
    availability: '09:00 - 17:00',
    available: true,
    status: 'Aktivan',
    tone: 'red',
  },
  {
    initials: 'LJ',
    name: 'Dr. Luka Jurić',
    specialty: 'Ortopedija',
    phone: '+385 91 333 8088',
    email: 'luka.juric@pmz.hr',
    availability: '08:00 - 16:00',
    available: true,
    status: 'Aktivan',
    tone: 'blue',
  },
  {
    initials: 'NM',
    name: 'Dr. Nives Mešić',
    specialty: 'Pedijatrija',
    phone: '+385 91 555 1212',
    email: 'nives.mesic@pmz.hr',
    availability: '08:30 - 16:00',
    available: true,
    status: 'Aktivan',
    tone: 'violet',
  },
  {
    initials: 'MA',
    name: 'Dr. Marija Anić',
    specialty: 'Dermatologija',
    phone: '+385 91 222 1111',
    email: 'marija.anic@pmz.hr',
    availability: 'Nije dostupan',
    available: false,
    status: 'Neaktivan',
    tone: 'orange',
  },
  {
    initials: 'DV',
    name: 'Dr. Dino Vuković',
    specialty: 'Neurologija',
    phone: '+385 91 987 6543',
    email: 'dino.vukovic@pmz.hr',
    availability: '10:00 - 18:00',
    available: true,
    status: 'Aktivan',
    tone: 'green',
  },
  {
    initials: 'KS',
    name: 'Dr. Katarina Simić',
    specialty: 'Anesteziologija',
    phone: '+385 91 765 4321',
    email: 'katarina.simic@pmz.hr',
    availability: '08:00 - 15:30',
    available: true,
    status: 'Aktivan',
    tone: 'amber',
  },
]

const workingHours = [
  ['Ponedjeljak', '08:00 - 16:30', true],
  ['Utorak', '08:00 - 16:30', true],
  ['Srijeda', '08:00 - 16:30', true],
  ['Četvrtak', '10:00 - 18:00', true],
  ['Petak', '08:00 - 15:00', true],
  ['Subota', '-', false],
  ['Nedjelja', '-', false],
] as const

function DoctorsPage(): ReactElement {
  return (
    <div className="doctors-page">
      <div className="doctors-page__hero">
        <div>
          <h1>Liječnici</h1>
          <p>Pregled, pretraga i upravljanje podacima o liječnicima.</p>
        </div>
      </div>

      <div className="doctors-content-grid">
        <div className="doctors-main-stack">
          <section className="doctors-filter-panel" aria-label="Filteri liječnika">
            <div className="doctors-search-row">
              <label className="doctors-search-field">
                <span className="sr-only">Pretraga liječnika</span>
                <AppIcon name="search" />
                <input
                  type="search"
                  placeholder="Pretražite liječnike po imenu, specijalizaciji ili e-mailu..."
                />
              </label>
              <button className="doctors-primary-button" type="button">
                <AppIcon name="plus" />
                Novi liječnik
              </button>
            </div>

            <div className="doctors-filter-row">
              <label>
                <span>Status</span>
                <div>
                  Svi statusi
                  <AppIcon name="chevronDown" />
                </div>
              </label>
              <label>
                <span>Specijalizacija</span>
                <div>
                  Sve specijalizacije
                  <AppIcon name="chevronDown" />
                </div>
              </label>
              <label>
                <span>Dostupnost</span>
                <div>
                  Svi liječnici
                  <AppIcon name="chevronDown" />
                </div>
              </label>
              <label>
                <span>Lokacija</span>
                <div>
                  Sve lokacije
                  <AppIcon name="chevronDown" />
                </div>
              </label>
              <button className="doctors-clear-button" type="button">
                <AppIcon name="tag" />
                Obriši filtre
              </button>
            </div>
          </section>

          <section className="doctors-table-panel" aria-label="Popis liječnika">
            <div className="doctors-table doctors-table--head" role="row">
              <span>Ime i prezime ↓</span>
              <span>Specijalizacija</span>
              <span>Telefon</span>
              <span>E-mail</span>
              <span>Danas dostupan</span>
              <span>Status</span>
              <span aria-hidden="true" />
            </div>

            {doctors.map((doctor) => (
              <div className="doctors-table doctors-table--row" role="row" key={doctor.email}>
                <span className={`doctors-avatar doctors-avatar--${doctor.tone}`}>
                  {doctor.initials}
                </span>
                <strong>{doctor.name}</strong>
                <span>{doctor.specialty}</span>
                <span>{doctor.phone}</span>
                <span>{doctor.email}</span>
                <span className="doctors-availability">
                  <i
                    className={
                      doctor.available
                        ? 'doctors-availability__dot'
                        : 'doctors-availability__dot doctors-availability__dot--away'
                    }
                  />
                  {doctor.availability}
                </span>
                <em
                  className={
                    doctor.status === 'Aktivan'
                      ? 'doctors-status doctors-status--active'
                      : 'doctors-status doctors-status--inactive'
                  }
                >
                  {doctor.status}
                </em>
                <button type="button" aria-label={`Opcije za ${doctor.name}`}>
                  <AppIcon name="dots" />
                </button>
              </div>
            ))}

            <div className="doctors-pagination">
              <span>Prikazano 1 do 8 od 128 liječnika</span>
              <div>
                <button type="button" aria-label="Prethodna stranica">
                  <AppIcon name="chevronLeft" />
                </button>
                <button className="doctors-pagination__active" type="button">
                  1
                </button>
                <button type="button">2</button>
                <button type="button">3</button>
                <span>...</span>
                <button type="button">16</button>
                <button type="button" aria-label="Sljedeća stranica">
                  <AppIcon name="chevronRight" />
                </button>
              </div>
              <button className="doctors-page-size" type="button">
                10 po stranici
                <AppIcon name="chevronDown" />
              </button>
            </div>
          </section>
        </div>

        <aside className="doctors-detail-panel" aria-label="Detalji liječnika">
          <button className="doctors-detail-close" type="button" aria-label="Zatvori detalje">
            ×
          </button>

          <div className="doctors-detail-header">
            <span className="doctors-detail-avatar">PB</span>
            <div>
              <h2>Dr. Petra Barić</h2>
              <span>Ginekologija</span>
              <small>Licencija: 12345/2015</small>
            </div>
            <em>Aktivan</em>
          </div>

          <section className="doctors-info-card">
            <h3>Kontakt podaci</h3>
            <div className="doctors-info-list">
              <span>
                <AppIcon name="clock" />
                Telefon
              </span>
              <strong>+385 91 234 5678</strong>
              <span>
                <AppIcon name="mail" />
                E-mail
              </span>
              <strong>petra.baric@pmz.hr</strong>
              <span>
                <AppIcon name="home" />
                Adresa
              </span>
              <strong>Ulica grada Vukovara 12, 10000 Zagreb</strong>
            </div>
          </section>

          <section className="doctors-info-card">
            <h3>Radno vrijeme</h3>
            <div className="doctors-hours-list">
              {workingHours.map(([day, time, active]) => (
                <div key={day}>
                  <span>
                    <i className={active ? 'doctors-hours-dot' : 'doctors-hours-dot doctors-hours-dot--muted'} />
                    {day}
                  </span>
                  <strong>{time}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="doctors-info-card">
            <h3>Sljedeći slobodni termin</h3>
            <div className="doctors-next-slot">
              <AppIcon name="calendar" />
              <span>
                Petak, 23. svibnja 2025. · <strong>10:00</strong>
                <small>Poliklinika Medica Zagreb</small>
              </span>
            </div>
            <button className="doctors-wide-button" type="button">
              Pogledaj sve termine
            </button>
          </section>

          <section className="doctors-info-card doctors-actions-card">
            <h3>Brze akcije</h3>
            <div className="doctors-actions-grid">
              <button type="button">
                <AppIcon name="note" />
                Uredi podatke
              </button>
              <button className="doctors-actions-grid__primary" type="button">
                <AppIcon name="clock" />
                Radno vrijeme
              </button>
              <button type="button">
                <AppIcon name="calendar" />
                Neradni dani i iznimke
                <AppIcon name="chevronRight" />
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

export { DoctorsPage }
