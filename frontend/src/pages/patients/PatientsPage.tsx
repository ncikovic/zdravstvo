import type { ReactElement } from 'react'

import { AppIcon } from '@/components'

import './patients.css'

type PatientTone = 'teal' | 'purple' | 'violet' | 'green' | 'orange' | 'blue' | 'red'

interface PatientRow {
  initials: string
  name: string
  oib: string
  phone: string
  lastAppointment: string
  status: 'Aktivan' | 'Neaktivan'
  tone: PatientTone
}

const patients: readonly PatientRow[] = [
  {
    initials: 'AM',
    name: 'Ana Marić',
    oib: '12345678901',
    phone: '+385 91 234 5678',
    lastAppointment: '20.05.2024.\n08:30',
    status: 'Aktivan',
    tone: 'teal',
  },
  {
    initials: 'IV',
    name: 'Ivan Vuković',
    oib: '98765432109',
    phone: '+385 98 765 4321',
    lastAppointment: '18.05.2024.\n10:00',
    status: 'Aktivan',
    tone: 'purple',
  },
  {
    initials: 'MJ',
    name: 'Marija Jelić',
    oib: '45678912345',
    phone: '+385 91 987 6543',
    lastAppointment: '05.04.2024.\n11:00',
    status: 'Aktivan',
    tone: 'violet',
  },
  {
    initials: 'LP',
    name: 'Luka Petrović',
    oib: '32109876543',
    phone: '+385 95 123 4567',
    lastAppointment: '18.03.2024.\n09:30',
    status: 'Neaktivan',
    tone: 'green',
  },
  {
    initials: 'KS',
    name: 'Katarina Šimić',
    oib: '14725836987',
    phone: '+385 91 555 1212',
    lastAppointment: '10.05.2024.\n13:30',
    status: 'Aktivan',
    tone: 'orange',
  },
  {
    initials: 'TD',
    name: 'Tomislav Dukić',
    oib: '36925814700',
    phone: '+385 97 333 8088',
    lastAppointment: '22.04.2024.\n15:00',
    status: 'Neaktivan',
    tone: 'blue',
  },
  {
    initials: 'IB',
    name: 'Ivana Barišić',
    oib: '25814736901',
    phone: '+385 91 444 0004',
    lastAppointment: '30.01.2024.\n10:00',
    status: 'Aktivan',
    tone: 'red',
  },
  {
    initials: 'NM',
    name: 'Nikola Mandić',
    oib: '75315948620',
    phone: '+385 99 222 1111',
    lastAppointment: '11.02.2024.\nPregled',
    status: 'Neaktivan',
    tone: 'purple',
  },
]

const upcomingAppointments = [
  ['20.05.2024. (ponedjeljak) · 08:30', 'Kontrola', 'Poliklinika Medica Zagreb', 'Predstoji'],
  ['18.06.2024. (utorak) · 11:00', 'UZ abdomena', 'Dom zdravlja Split Centar', 'Predstoji'],
  ['10.09.2024. (utorak) · 09:00', 'Sistematski pregled', 'Poliklinika Medica Zagreb', 'Zakazan'],
] as const

function PatientsPage(): ReactElement {
  return (
    <div className="patients-page">
      <div className="patients-page__hero">
        <div>
          <h1>Pacijenti</h1>
          <p>Pregled, pretraga i upravljanje podacima o pacijentima.</p>
        </div>
      </div>

      <div className="patients-content-grid">
        <div className="patients-main-stack">
          <section className="patients-filter-panel" aria-label="Filteri pacijenata">
            <div className="patients-search-row">
              <label className="patients-search-field">
                <span className="sr-only">Pretraga pacijenata</span>
                <AppIcon name="search" />
                <input type="search" placeholder="Pretražite pacijente po imenu, OIB-u ili telefonu..." />
              </label>
              <button className="patients-primary-button" type="button">
                <AppIcon name="plus" />
                Novi pacijent
              </button>
            </div>

            <div className="patients-filter-row">
              <label>
                <span>Status</span>
                <div>
                  Svi statusi
                  <AppIcon name="chevronDown" />
                </div>
              </label>
              <label>
                <span>Liječnik</span>
                <div>
                  Svi liječnici
                  <AppIcon name="chevronDown" />
                </div>
              </label>
              <label>
                <span>Vrsta termina</span>
                <div>
                  Sve vrste
                  <AppIcon name="chevronDown" />
                </div>
              </label>
              <label>
                <span>Zadnji termin</span>
                <div>
                  Bilo kada
                  <AppIcon name="chevronDown" />
                </div>
              </label>
              <button className="patients-clear-button" type="button">
                <AppIcon name="tag" />
                Obriši filtre
              </button>
            </div>
          </section>

          <section className="patients-table-panel" aria-label="Popis pacijenata">
            <div className="patients-table patients-table--head" role="row">
              <span>Ime i prezime ↓</span>
              <span>OIB</span>
              <span>Telefon</span>
              <span>Zadnji termin</span>
              <span>Status</span>
              <span aria-hidden="true" />
            </div>

            {patients.map((patient, index) => (
              <div
                className={
                  index === 0
                    ? 'patients-table patients-table--row patients-table--row-selected'
                    : 'patients-table patients-table--row'
                }
                role="row"
                key={patient.oib}
              >
                <span className={`patients-avatar patients-avatar--${patient.tone}`}>
                  {patient.initials}
                </span>
                <strong>{patient.name}</strong>
                <span>{patient.oib}</span>
                <span>{patient.phone}</span>
                <span className="patients-last-appointment">{patient.lastAppointment}</span>
                <em
                  className={
                    patient.status === 'Aktivan'
                      ? 'patients-status patients-status--active'
                      : 'patients-status patients-status--inactive'
                  }
                >
                  {patient.status}
                </em>
                <button type="button" aria-label={`Opcije za ${patient.name}`}>
                  <AppIcon name="dots" />
                </button>
              </div>
            ))}

            <div className="patients-pagination">
              <span>Prikazano 1 do 8 od 128 pacijenata</span>
              <div>
                <button type="button" aria-label="Prethodna stranica">
                  <AppIcon name="chevronLeft" />
                </button>
                <button className="patients-pagination__active" type="button">
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
              <button className="patients-page-size" type="button">
                10 po stranici
                <AppIcon name="chevronDown" />
              </button>
            </div>
          </section>
        </div>

        <aside className="patients-detail-panel" aria-label="Detalji pacijenta">
          <button className="patients-detail-close" type="button" aria-label="Zatvori detalje">
            ×
          </button>

          <div className="patients-detail-header">
            <span className="patients-detail-avatar">AM</span>
            <div>
              <h2>Ana Marić</h2>
              <span>01.01.1990. (34 god.)</span>
              <small>OIB: 12345678901</small>
            </div>
            <em>Aktivan</em>
          </div>

          <section className="patients-info-card">
            <h3>Kontakt podaci</h3>
            <div className="patients-info-list">
              <span>
                <AppIcon name="clock" />
                Telefon
              </span>
              <strong>+385 91 234 5678</strong>
              <span>
                <AppIcon name="mail" />
                E-mail
              </span>
              <strong>ana.maric@email.hr</strong>
              <span>
                <AppIcon name="home" />
                Adresa
              </span>
              <strong>Ulica grada Vukovara 12, 10000 Zagreb</strong>
            </div>
          </section>

          <section className="patients-info-card">
            <h3>Hitni kontakt</h3>
            <div className="patients-emergency-contact">
              <AppIcon name="user" />
              <span>
                Ivan Marić (suprug)
                <strong>+385 98 765 4321</strong>
              </span>
            </div>
          </section>

          <section className="patients-info-card patients-appointments-card">
            <div className="patients-card-heading">
              <h3>Nadolazeći termini</h3>
              <button type="button">Prikaži sve</button>
            </div>
            <div className="patients-appointment-list">
              {upcomingAppointments.map(([date, title, location, status]) => (
                <div className="patients-appointment-item" key={date}>
                  <AppIcon name="calendar" />
                  <span>
                    <strong>{date}</strong>
                    {title}
                    <small>{location}</small>
                  </span>
                  <em>{status}</em>
                </div>
              ))}
            </div>
          </section>

          <div className="patients-detail-actions">
            <button type="button">
              <AppIcon name="note" />
              Uredi podatke
            </button>
            <button className="patients-detail-actions__primary" type="button">
              <AppIcon name="calendar" />
              Rezerviraj termin
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}

export { PatientsPage }
