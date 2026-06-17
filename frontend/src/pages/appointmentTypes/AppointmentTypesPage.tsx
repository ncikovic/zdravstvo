import type { AppointmentTypeDto } from '@zdravstvo/contracts'
import type { ReactElement } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { APP_ROUTES } from '@/app/routes'
import { AppIcon } from '@/components'
import { appointmentTypesService } from '@/services'
import type { AppIconName } from '@/types'

import './appointmentTypes.css'

type AppointmentTypeTone = 'blue' | 'teal' | 'orange' | 'purple' | 'green' | 'red' | 'amber'
type StatusFilter = 'all' | 'active' | 'inactive'

const DURATION_FILTERS = [15, 30, 45, 60, 90] as const

const tones: AppointmentTypeTone[] = ['blue', 'teal', 'orange', 'purple', 'green', 'red', 'amber']

const icons: AppIconName[] = [
  'stethoscope',
  'activity',
  'megaphone',
  'flask',
  'user',
  'plus',
  'clipboard',
]

const getTone = (index: number): AppointmentTypeTone => tones[index % tones.length]

const getIcon = (index: number): AppIconName => icons[index % icons.length]

const getStatusLabel = (type: AppointmentTypeDto): 'Aktivan' | 'Neaktivan' =>
  type.isActive ? 'Aktivan' : 'Neaktivan'

const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error
    ? error.message
    : typeof error === 'object' && error !== null && 'message' in error
      ? String(error.message)
      : fallback

function AppointmentTypesPage(): ReactElement {
  const navigate = useNavigate()
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentTypeDto[]>([])
  const [selectedAppointmentTypeId, setSelectedAppointmentTypeId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [durationFilter, setDurationFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  useEffect(() => {
    const fetchAppointmentTypes = async () => {
      try {
        setIsLoading(true)
        const data = await appointmentTypesService.list({
          page,
          search: search.trim() || undefined,
          isActive:
            statusFilter === 'all' ? undefined : statusFilter === 'active',
          durationMinutes: durationFilter ? Number(durationFilter) : undefined,
        })
        setAppointmentTypes(data.appointmentTypes)
        setTotalPages(data.totalPages)
        setTotalItems(data.totalItems)
        setSelectedAppointmentTypeId((current) =>
          data.appointmentTypes.some((type) => type.id === current) ? current : null
        )
        setError(null)
      } catch (err) {
        setError(getErrorMessage(err, 'Greska pri ucitavanju vrsta termina.'))
        setAppointmentTypes([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointmentTypes()
  }, [durationFilter, page, search, statusFilter])

  const displayedAppointmentTypes = useMemo(() => appointmentTypes, [appointmentTypes])

  const selectedType = selectedAppointmentTypeId
    ? displayedAppointmentTypes.find((type) => type.id === selectedAppointmentTypeId) ?? null
    : null
  const selectedTypeIndex = selectedType
    ? appointmentTypes.findIndex((type) => type.id === selectedType.id)
    : 0
  const hasActiveFilters =
    search.trim().length > 0 || statusFilter !== 'all' || durationFilter.length > 0

  const updateSearch = (value: string): void => {
    setSearch(value)
    setPage(1)
  }

  const updateStatusFilter = (value: StatusFilter): void => {
    setStatusFilter(value)
    setPage(1)
  }

  const updateDurationFilter = (value: string): void => {
    setDurationFilter(value)
    setPage(1)
  }

  const clearFilters = (): void => {
    setSearch('')
    setStatusFilter('all')
    setDurationFilter('')
    setPage(1)
  }

  return (
    <div className="appointment-types-page">
      <div className="appointment-types-page__hero">
        <div>
          <h1>Vrste termina</h1>
          <p>Pregled, upravljanje i povezivanje vrsta termina.</p>
        </div>
        <button
          className="appointment-types-primary-button"
          type="button"
          onClick={() => navigate(APP_ROUTES.createAppointmentType)}
        >
          <AppIcon name="plus" />
          Nova vrsta termina
        </button>
      </div>

      <div
        className={
          selectedType
            ? "appointment-types-content-grid"
            : "appointment-types-content-grid appointment-types-content-grid--full"
        }
      >
        <div className="appointment-types-main-stack">
          <section className="appointment-types-filter-panel" aria-label="Filteri vrsta termina">
            <label className="appointment-types-search-field">
              <span className="sr-only">Pretraga vrsta termina</span>
              <AppIcon name="search" />
              <input
                type="search"
                placeholder="Pretrazite vrste termina po nazivu..."
                value={search}
                onChange={(event) => updateSearch(event.target.value)}
              />
            </label>
            <label>
              <span>Status</span>
              <select
                value={statusFilter}
                onChange={(event) => updateStatusFilter(event.target.value as StatusFilter)}
              >
                <option value="all">Svi statusi</option>
                <option value="active">Aktivni</option>
                <option value="inactive">Neaktivni</option>
              </select>
            </label>
            <label>
              <span>Trajanje</span>
              <select
                value={durationFilter}
                onChange={(event) => updateDurationFilter(event.target.value)}
              >
                <option value="">Sva trajanja</option>
                {DURATION_FILTERS.map((duration) => (
                  <option key={duration} value={duration}>
                    {duration} min
                  </option>
                ))}
              </select>
            </label>
            <button
              className="appointment-types-clear-button"
              type="button"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
            >
              <AppIcon name="tag" />
              Obrisi filtre
            </button>
          </section>

          <section className="appointment-types-table-panel" aria-label="Popis vrsta termina">
            {isLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>Ucitavanje...</div>
            ) : error ? (
              <div
                style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#d32f2f',
                }}
              >
                {error}
              </div>
            ) : (
              <>
                <div className="appointment-types-table appointment-types-table--head" role="row">
                  <span>Naziv</span>
                  <span>Trajanje</span>
                  <span>Opis</span>
                  <span>Dostupno lijecnicima</span>
                  <span>Status</span>
                  <span aria-hidden="true" />
                </div>

                {displayedAppointmentTypes.map((type, index) => {
                  const status = getStatusLabel(type)

                  return (
                    <div
                      className={
                        type.id === selectedType?.id
                          ? 'appointment-types-table appointment-types-table--row appointment-types-table--row-selected'
                          : 'appointment-types-table appointment-types-table--row'
                      }
                      role="row"
                      key={type.id}
                      onClick={() => setSelectedAppointmentTypeId(type.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span
                        className={`appointment-types-icon appointment-types-icon--${getTone(index)}`}
                      >
                        <AppIcon name={getIcon(index)} />
                      </span>
                      <strong>{type.name}</strong>
                      <span>{type.defaultDurationMinutes} min</span>
                      <span className="appointment-types-description">
                        Nije dostupno kroz trenutni API.
                      </span>
                      <span>Nije dostupno</span>
                      <em
                        className={
                          type.isActive
                            ? 'appointment-types-status appointment-types-status--active'
                            : 'appointment-types-status appointment-types-status--limited'
                        }
                      >
                        {status}
                      </em>
                      <button
                        type="button"
                        aria-label={`Opcije za ${type.name}`}
                        onClick={(event) => {
                          event.stopPropagation()
                          navigate(
                            APP_ROUTES.editAppointmentType.replace(':appointmentTypeId', type.id)
                          )
                        }}
                      >
                        <AppIcon name="dots" />
                      </button>
                    </div>
                  )
                })}

                {displayedAppointmentTypes.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center' }}>
                    Nema vrsta termina za zadane filtre.
                  </div>
                ) : null}
              </>
            )}

            <div className="appointment-types-pagination">
              <span>
                Prikazano {Math.min((page - 1) * 10 + 1, totalItems)}–{Math.min(page * 10, totalItems)} od {totalItems} vrsta termina
              </span>
              <div>
                <button
                  type="button"
                  aria-label="Prethodna stranica"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <AppIcon name="chevronLeft" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((item, idx) =>
                    item === '...' ? (
                      <span key={`ellipsis-${idx}`}>...</span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        className={
                          item === page ? 'appointment-types-pagination__active' : undefined
                        }
                        onClick={() => setPage(item as number)}
                      >
                        {item}
                      </button>
                    ),
                  )}
                <button
                  type="button"
                  aria-label="Sljedeca stranica"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <AppIcon name="chevronRight" />
                </button>
              </div>
            </div>
          </section>
        </div>

        {selectedType ? (
          <aside className="appointment-types-detail-panel" aria-label="Detalji vrste termina">
            <button
              className="appointment-types-detail-close"
              type="button"
              aria-label="Zatvori detalje vrste termina"
              onClick={() => setSelectedAppointmentTypeId(null)}
            >
              <AppIcon name="xCircle" />
            </button>
            <>
              <div className="appointment-types-detail-header">
                <span className="appointment-types-detail-icon">
                  <AppIcon name={getIcon(selectedTypeIndex)} />
                </span>
                <div>
                  <h2>{selectedType.name}</h2>
                  <span>Trajanje: {selectedType.defaultDurationMinutes} min</span>
                </div>
                <em>{getStatusLabel(selectedType)}</em>
              </div>

              <section className="appointment-types-info-card">
                <h3>Opis</h3>
                <p>Nije dostupno kroz trenutni API.</p>
              </section>

              <section className="appointment-types-info-card appointment-types-detail-row">
                <h3>Dostupno lijecnicima</h3>
                <div>
                  <AppIcon name="users" />
                  <span>Nije dostupno</span>
                </div>
              </section>

              <section className="appointment-types-info-card appointment-types-detail-row">
                <h3>Kreirano</h3>
                <div>
                  <AppIcon name="calendar" />
                  <span>{selectedType.createdAt.slice(0, 10)}</span>
                </div>
              </section>

              <div className="appointment-types-detail-actions">
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      APP_ROUTES.editAppointmentType.replace(':appointmentTypeId', selectedType.id)
                    )
                  }
                >
                  <AppIcon name="note" />
                  Uredi
                </button>
                <button className="appointment-types-detail-actions__primary" type="button">
                  <AppIcon name="users" />
                  Dodijeli lijecnike
                </button>
              </div>
            </>
          </aside>
        ) : null}
      </div>
    </div>
  )
}

export { AppointmentTypesPage }
