import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppIcon } from '@/components'
import { APP_ROUTES } from '@/app/routes'
import { doctorsService } from '@/services/doctors.service'
import type { DoctorResponseDto } from '@zdravstvo/contracts'

import './doctors.css'

type DoctorTone = 'teal' | 'purple' | 'red' | 'blue' | 'violet' | 'orange' | 'green' | 'amber'

const tones: DoctorTone[] = ['teal', 'purple', 'red', 'blue', 'violet', 'orange', 'green', 'amber']

const getTone = (index: number): DoctorTone => tones[index % tones.length]

const getInitials = (firstName: string, lastName: string): string => {
  return (firstName[0] + lastName[0]).toUpperCase()
}

function DoctorsPage(): ReactElement {
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState<DoctorResponseDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true)
        const data = await doctorsService.list()
        setDoctors(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch doctors')
        setDoctors([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchDoctors()
  }, [])

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
              <button
                className="doctors-primary-button"
                type="button"
                onClick={() => navigate(APP_ROUTES.doctorsCreate)}
              >
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
            {isLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>Učitavanje...</div>
            ) : error ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#d32f2f' }}>
                Greška pri učitavanju liječnika: {error}
              </div>
            ) : (
              <>
                <div className="doctors-table doctors-table--head" role="row">
                  <span>Ime i prezime ↓</span>
                  <span>Telefon</span>
                  <span>E-mail</span>
                  <span>Status</span>
                  <span aria-hidden="true" />
                </div>

                {doctors.map((doctor, index) => {
                  const fullName = `${doctor.firstName} ${doctor.lastName}`
                  const initials = getInitials(doctor.firstName, doctor.lastName)
                  const tone = getTone(index)

                  return (
                    <div className="doctors-table doctors-table--row" role="row" key={doctor.id} onClick={() => navigate(APP_ROUTES.doctorDetails.replace(':doctorId', doctor.id))}>
                      <span className={`doctors-avatar doctors-avatar--${tone}`}>
                        {initials}
                      </span>
                      <strong>{doctor.title ? `Dr. ${fullName}, ${doctor.title}` : `Dr. ${fullName}`}</strong>
                      <span>{doctor.phone || 'Nije dostupno'}</span>
                      <span>{doctor.email || 'Nije dostupno'}</span>
                      <em
                        className={
                          doctor.isActive
                            ? 'doctors-status doctors-status--active'
                            : 'doctors-status doctors-status--inactive'
                        }
                      >
                        {doctor.isActive ? 'Aktivan' : 'Neaktivan'}
                      </em>
                      <button type="button" aria-label={`Opcije za ${fullName}`} onClick={(e) => e.stopPropagation()}>
                        <AppIcon name="dots" />
                      </button>
                    </div>
                  )
                })}
              </>
            )}

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
          {doctors.length > 0 && !isLoading && !error && (
            <>
              {(() => {
                const firstDoctor = doctors[0]
                const initials = getInitials(firstDoctor.firstName, firstDoctor.lastName)
                return (
                  <>
                    <div className="doctors-detail-header">
                      <span className="doctors-detail-avatar">{initials}</span>
                      <div>
                        <h2>Dr. {firstDoctor.firstName} {firstDoctor.lastName}</h2>
                        {firstDoctor.title && <span>{firstDoctor.title}</span>}
                        {firstDoctor.licenseNumber && <small>Licencija: {firstDoctor.licenseNumber}</small>}
                      </div>
                      <em>{firstDoctor.isActive ? 'Aktivan' : 'Neaktivan'}</em>
                    </div>

                    <section className="doctors-info-card">
                      <h3>Kontakt podaci</h3>
                      <div className="doctors-info-list">
                        {firstDoctor.phone && (
                          <>
                            <span>
                              <AppIcon name="clock" />
                              Telefon
                            </span>
                            <strong>{firstDoctor.phone}</strong>
                          </>
                        )}
                        {firstDoctor.email && (
                          <>
                            <span>
                              <AppIcon name="mail" />
                              E-mail
                            </span>
                            <strong>{firstDoctor.email}</strong>
                          </>
                        )}
                      </div>
                    </section>

                    <section className="doctors-info-card doctors-actions-card">
                      <h3>Brze akcije</h3>
                      <div className="doctors-actions-grid">
                        <button type="button" onClick={() => navigate(APP_ROUTES.doctorDetails.replace(':doctorId', firstDoctor.id))}>
                          <AppIcon name="note" />
                          Uredi podatke
                        </button>
                      </div>
                    </section>
                  </>
                )
              })()}
            </>
          )}
        </aside>
      </div>
    </div>
  )
}

export { DoctorsPage }
