import type { ReactElement } from 'react'

import { AppIcon } from '@/components'
import type { AppIconName } from '@/types'

import './appointmentTypes.css'

type AppointmentTypeTone = 'blue' | 'teal' | 'orange' | 'purple' | 'green' | 'red' | 'amber'

interface AppointmentTypeRow {
  icon: AppIconName
  name: string
  duration: string
  description: string
  doctors: string
  online: boolean
  status: 'Aktivan' | 'Ograničen'
  tone: AppointmentTypeTone
}

const appointmentTypes: readonly AppointmentTypeRow[] = [
  {
    icon: 'stethoscope',
    name: 'Prvi pregled',
    duration: '60 min',
    description: 'Detaljan pregled i procjena zdravstvenog stanja pacijenta.',
    doctors: '24 liječnika',
    online: true,
    status: 'Aktivan',
    tone: 'blue',
  },
  {
    icon: 'activity',
    name: 'Kontrolni pregled',
    duration: '30 min',
    description: 'Praćenje stanja i kontrola nakon prethodnog pregleda ili terapije.',
    doctors: '28 liječnika',
    online: true,
    status: 'Aktivan',
    tone: 'teal',
  },
  {
    icon: 'megaphone',
    name: 'Konzultacija',
    duration: '45 min',
    description: 'Stručno mišljenje i savjetovanje o zdravstvenim tegobama.',
    doctors: '18 liječnika',
    online: true,
    status: 'Aktivan',
    tone: 'orange',
  },
  {
    icon: 'flask',
    name: 'Laboratorijske pretrage',
    duration: '20 min',
    description: 'Prikupljanje uzoraka i upućivanje na laboratorijske analize.',
    doctors: '12 liječnika',
    online: false,
    status: 'Aktivan',
    tone: 'purple',
  },
  {
    icon: 'user',
    name: 'Savjetovanje',
    duration: '60 min',
    description: 'Individualno savjetovanje i plan liječenja.',
    doctors: '15 liječnika',
    online: true,
    status: 'Aktivan',
    tone: 'green',
  },
  {
    icon: 'plus',
    name: 'Hitni pregled',
    duration: '30 min',
    description: 'Brz pregled u hitnim slučajevima.',
    doctors: '10 liječnika',
    online: false,
    status: 'Ograničen',
    tone: 'red',
  },
  {
    icon: 'clipboard',
    name: 'Sistematski pregled',
    duration: '90 min',
    description: 'Sveobuhvatan pregled za procjenu općeg zdravlja.',
    doctors: '8 liječnika',
    online: true,
    status: 'Aktivan',
    tone: 'amber',
  },
]

function AppointmentTypesPage(): ReactElement {
  return (
    <div className="appointment-types-page">
      <div className="appointment-types-page__hero">
        <div>
          <h1>Vrste termina</h1>
          <p>Pregled, upravljanje i povezivanje vrsta termina.</p>
        </div>
        <button className="appointment-types-primary-button" type="button">
          <AppIcon name="plus" />
          Nova vrsta termina
        </button>
      </div>

      <div className="appointment-types-content-grid">
        <div className="appointment-types-main-stack">
          <section className="appointment-types-filter-panel" aria-label="Filteri vrsta termina">
            <label className="appointment-types-search-field">
              <span className="sr-only">Pretraga vrsta termina</span>
              <AppIcon name="search" />
              <input type="search" placeholder="Pretražite vrste termina po nazivu..." />
            </label>
            <label>
              <span>Status</span>
              <div>
                Svi statusi
                <AppIcon name="chevronDown" />
              </div>
            </label>
            <label>
              <span>Trajanje</span>
              <div>
                Sva trajanja
                <AppIcon name="chevronDown" />
              </div>
            </label>
            <label>
              <span>Online rezervacija</span>
              <div>
                Sve opcije
                <AppIcon name="chevronDown" />
              </div>
            </label>
            <button className="appointment-types-clear-button" type="button">
              <AppIcon name="tag" />
              Obriši filtre
            </button>
          </section>

          <section className="appointment-types-table-panel" aria-label="Popis vrsta termina">
            <div className="appointment-types-table appointment-types-table--head" role="row">
              <span>Naziv</span>
              <span>Trajanje</span>
              <span>Opis</span>
              <span>Dostupno liječnicima</span>
              <span>Online</span>
              <span>Status</span>
              <span aria-hidden="true" />
            </div>

            {appointmentTypes.map((type, index) => (
              <div
                className={
                  index === 1
                    ? 'appointment-types-table appointment-types-table--row appointment-types-table--row-selected'
                    : 'appointment-types-table appointment-types-table--row'
                }
                role="row"
                key={type.name}
              >
                <span className={`appointment-types-icon appointment-types-icon--${type.tone}`}>
                  <AppIcon name={type.icon} />
                </span>
                <strong>{type.name}</strong>
                <span>{type.duration}</span>
                <span className="appointment-types-description">{type.description}</span>
                <span>{type.doctors}</span>
                <span className="appointment-types-online">
                  {type.online ? <AppIcon name="checkCircle" /> : '–'}
                </span>
                <em
                  className={
                    type.status === 'Aktivan'
                      ? 'appointment-types-status appointment-types-status--active'
                      : 'appointment-types-status appointment-types-status--limited'
                  }
                >
                  {type.status}
                </em>
                <button type="button" aria-label={`Opcije za ${type.name}`}>
                  <AppIcon name="dots" />
                </button>
              </div>
            ))}

            <div className="appointment-types-pagination">
              <span>Prikazano 1 do 7 od 7 vrsta termina</span>
              <div>
                <button type="button" aria-label="Prethodna stranica">
                  <AppIcon name="chevronLeft" />
                </button>
                <button className="appointment-types-pagination__active" type="button">
                  1
                </button>
                <button type="button" aria-label="Sljedeća stranica">
                  <AppIcon name="chevronRight" />
                </button>
              </div>
              <button className="appointment-types-page-size" type="button">
                10 po stranici
                <AppIcon name="chevronDown" />
              </button>
            </div>
          </section>
        </div>

        <aside className="appointment-types-detail-panel" aria-label="Detalji vrste termina">
          <div className="appointment-types-detail-header">
            <span className="appointment-types-detail-icon">
              <AppIcon name="activity" />
            </span>
            <div>
              <h2>Kontrolni pregled</h2>
              <span>Trajanje: 30 min</span>
            </div>
            <em>Aktivan</em>
          </div>

          <section className="appointment-types-info-card">
            <h3>Opis</h3>
            <p>
              Praćenje stanja i kontrola nakon prethodnog pregleda ili terapije. Po potrebi
              prilagodba terapijskog plana.
            </p>
          </section>

          <section className="appointment-types-info-card appointment-types-detail-row">
            <h3>Dostupno liječnicima</h3>
            <div>
              <AppIcon name="users" />
              <span>28 liječnika</span>
              <button type="button">
                Pogledaj popis
                <AppIcon name="chevronRight" />
              </button>
            </div>
          </section>

          <section className="appointment-types-info-card appointment-types-detail-row">
            <h3>Specijalizacije</h3>
            <div>
              <AppIcon name="stethoscope" />
              <span>Interna medicina, Kardiologija, Endokrinologija, Neurologija</span>
              <button type="button">
                Pogledaj sve
                <AppIcon name="chevronRight" />
              </button>
            </div>
          </section>

          <section className="appointment-types-info-card appointment-types-detail-row">
            <h3>Online rezervacija</h3>
            <div>
              <AppIcon name="building" />
              <span>
                Omogućena
                <AppIcon name="checkCircle" />
              </span>
            </div>
          </section>

          <section className="appointment-types-info-card appointment-types-detail-row">
            <h3>Podsjetnici za pacijente</h3>
            <div>
              <AppIcon name="bell" />
              <span>E-mail (24h prije) · SMS (2h prije)</span>
            </div>
          </section>

          <div className="appointment-types-detail-actions">
            <button type="button">
              <AppIcon name="note" />
              Uredi podatke
            </button>
            <button className="appointment-types-detail-actions__primary" type="button">
              <AppIcon name="users" />
              Dodijeli liječnike
            </button>
          </div>

          <button className="appointment-types-footer-link" type="button">
            Prikaži sve termine ove vrste
            <AppIcon name="chevronRight" />
          </button>
        </aside>
      </div>
    </div>
  )
}

export { AppointmentTypesPage }
