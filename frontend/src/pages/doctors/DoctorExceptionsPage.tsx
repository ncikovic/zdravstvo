import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { AppIcon } from '@/components'
import { APP_ROUTES } from '@/app/routes'
import { doctorsService } from '@/services/doctors.service'
import type { DoctorResponseDto, DoctorTimeOffResponseDto } from '@zdravstvo/contracts'

import './doctors.css'

function DoctorExceptionsPage(): ReactElement {
  const navigate = useNavigate()
  const { doctorId } = useParams<{ doctorId: string }>()
  const [doctor, setDoctor] = useState<DoctorResponseDto | null>(null)
  const [timeOffList, setTimeOffList] = useState<DoctorTimeOffResponseDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  useEffect(() => {
    if (!doctorId) {
      setError('Doctor ID not found')
      setIsLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [doctorData, timeOffData] = await Promise.all([
          doctorsService.getById(doctorId),
          doctorsService.listTimeOff(doctorId),
        ])
        setDoctor(doctorData)
        setTimeOffList(timeOffData.timeOff)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
        setDoctor(null)
        setTimeOffList([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [doctorId])

  const handleDelete = async (timeOffId: string) => {
    if (!doctorId) return

    try {
      setIsDeleting(timeOffId)
      await doctorsService.deleteTimeOff(doctorId, timeOffId)
      setTimeOffList((prev) => prev.filter((item) => item.id !== timeOffId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete time-off')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleBack = () => {
    navigate(APP_ROUTES.doctorSchedule.replace(':doctorId', doctorId || ''))
  }


  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Učitavanje...</div>
  }

  if (error || !doctor) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#d32f2f' }}>{error || 'Liječnik nije pronađen'}</div>
  }

  const initials = `${doctor.firstName[0]}${doctor.lastName[0]}`.toUpperCase()

  return (
    <div className="doctor-exceptions-page">
      <div className="doctor-exceptions-breadcrumb">
        <button className="doctor-exceptions-breadcrumb-link" type="button" onClick={() => navigate(APP_ROUTES.doctors)}>
          Liječnici
        </button>
        <span>/</span>
        <button className="doctor-exceptions-breadcrumb-link" type="button" onClick={handleBack}>
          Radno vrijeme
        </button>
        <span>/</span>
        <span>Neradni dani i iznimke</span>
      </div>

      <div className="doctor-exceptions-header">
        <div className="doctor-exceptions-doctor-info">
          <div className="doctor-exceptions-avatar">
            <span>{initials}</span>
          </div>
          <div className="doctor-exceptions-info">
            <h1>Dr. {doctor.firstName} {doctor.lastName}</h1>
            {doctor.title && <p>{doctor.title}</p>}
            <span className={`doctor-exceptions-status status-badge status-badge--${doctor.isActive ? 'approved' : 'pending'}`}>
              {doctor.isActive ? 'Aktivan' : 'Neaktivan'}
            </span>
          </div>
        </div>
        <button className="doctor-exceptions-back-btn" type="button" onClick={handleBack}>
          <AppIcon name="chevronLeft" />
          Povratak na radno vrijeme
        </button>
      </div>

      <div className="doctor-exceptions-content-grid">
        <section className="doctor-exceptions-main">
          <div className="doctor-exceptions-section">
            <h2 className="doctor-exceptions-section-title">Planirane iznimke</h2>

            <div className="doctor-exceptions-filters">
              <div className="doctor-exceptions-filter-group">
                <span>Datum od</span>
                <input type="date" className="doctor-exceptions-date-input" placeholder="Odaberite datum" />
              </div>
              <div className="doctor-exceptions-filter-group">
                <span>Datum do</span>
                <input type="date" className="doctor-exceptions-date-input" placeholder="Odaberite datum" />
              </div>
              <div className="doctor-exceptions-filter-group">
                <span>Vrsta iznimke</span>
                <select className="doctor-exceptions-select">
                  <option>Sve vrste</option>
                  <option>Godišnji odmor</option>
                  <option>Edukacija</option>
                  <option>Bolovanje</option>
                  <option>Kongres</option>
                </select>
              </div>
              <div className="doctor-exceptions-filter-group">
                <span>Status</span>
                <select className="doctor-exceptions-select">
                  <option>Svi statusi</option>
                  <option>Odobreno</option>
                  <option>Na čekanju</option>
                </select>
              </div>
              <button className="doctor-exceptions-filter-btn" type="button">
                <AppIcon name="search" />
                Obriši filtre
              </button>
            </div>

            <table className="doctor-exceptions-table">
              <thead className="doctor-exceptions-table-head">
                <tr>
                  <th>Datum od</th>
                  <th>Datum do</th>
                  <th>Vrsta iznimke</th>
                  <th>Razlog</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {timeOffList.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
                      Nema planiranih iznimki
                    </td>
                  </tr>
                ) : (
                  timeOffList.map((item) => {
                    const startDate = new Date(item.startAt)
                    const endDate = new Date(item.endAt)
                    const startFormatted = startDate.toLocaleDateString('hr-HR')
                    const endFormatted = endDate.toLocaleDateString('hr-HR')

                    return (
                      <tr key={item.id} className="doctor-exceptions-table-row">
                        <td className="doctor-exceptions-table-cell doctor-exceptions-table-cell--date">
                          <div>{startFormatted}</div>
                          <span className="doctor-exceptions-date-type">({startDate.toLocaleDateString('hr-HR', { weekday: 'long' })})</span>
                        </td>
                        <td className="doctor-exceptions-table-cell doctor-exceptions-table-cell--date">
                          <div>{endFormatted}</div>
                          <span className="doctor-exceptions-date-type">({endDate.toLocaleDateString('hr-HR', { weekday: 'long' })})</span>
                        </td>
                        <td className="doctor-exceptions-table-cell">
                          <span className="doctor-exceptions-type-badge">Iznimka</span>
                        </td>
                        <td className="doctor-exceptions-table-cell">{item.reason || 'Bez razloga'}</td>
                        <td className="doctor-exceptions-table-cell">
                          <span className="status-badge status-badge--approved">Odobreno</span>
                        </td>
                        <td className="doctor-exceptions-table-cell doctor-exceptions-table-cell--actions">
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            disabled={isDeleting === item.id}
                            className="doctor-exceptions-delete-btn"
                          >
                            <AppIcon name="trash" />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>

            <div className="doctor-exceptions-pagination">
              <button type="button">
                <AppIcon name="chevronLeft" />
              </button>
              <button type="button" className="doctor-exceptions-page-active">
                1
              </button>
              <button type="button">2</button>
              <button type="button">
                <AppIcon name="chevronRight" />
              </button>
              <span>10 po stranici</span>
            </div>
          </div>
        </section>

        <aside className="doctor-exceptions-sidebar">
          <div className="doctor-exceptions-form-card">
            <h3 className="doctor-exceptions-form-title">Nova iznimka</h3>

            <div className="doctor-exceptions-form-group">
              <label className="doctor-exceptions-label">Vrsta iznimke</label>
              <select
                className="doctor-exceptions-select"
                value={newException.type}
                onChange={(e) => setNewException({ ...newException, type: e.target.value })}
              >
                <option value="Godišnji odmor">Godišnji odmor</option>
                <option value="Edukacija">Edukacija</option>
                <option value="Bolovanje">Bolovanje</option>
                <option value="Kongres">Kongres</option>
              </select>
            </div>

            <div className="doctor-exceptions-form-group">
              <label className="doctor-exceptions-label">Datum od</label>
              <input
                type="date"
                className="doctor-exceptions-date-input"
                value={newException.dateFrom}
                onChange={(e) => setNewException({ ...newException, dateFrom: e.target.value })}
              />
            </div>

            <div className="doctor-exceptions-form-group">
              <label className="doctor-exceptions-label">Datum do</label>
              <input
                type="date"
                className="doctor-exceptions-date-input"
                value={newException.dateTo}
                onChange={(e) => setNewException({ ...newException, dateTo: e.target.value })}
              />
            </div>

            <div className="doctor-exceptions-form-group">
              <label className="doctor-exceptions-label">Razlog</label>
              <select
                className="doctor-exceptions-select"
                value={newException.reason}
                onChange={(e) => setNewException({ ...newException, reason: e.target.value })}
              >
                <option value="">Odaberite vrstu iznimke</option>
                <option value="Godišnji odmor">Godišnji odmor</option>
                <option value="Napredni EKG tečaj">Napredni EKG tečaj</option>
                <option value="Hrvatski kardiološki kongres">Hrvatski kardiološki kongres</option>
              </select>
            </div>

            <div className="doctor-exceptions-form-group">
              <label className="doctor-exceptions-label">Napomena (opcionalno)</label>
              <textarea
                className="doctor-exceptions-textarea"
                placeholder="Unesite dodatne informacije..."
                rows={4}
                maxLength={500}
              />
              <span className="doctor-exceptions-char-count">0 / 500</span>
            </div>

            <p className="doctor-exceptions-info-text">
              <AppIcon name="info" />
              Termini u ovom razdoblju mogli bi biti pogrešeni. Možda će biti potrebno mjhovjenjpanje.
            </p>

            <div className="doctor-exceptions-form-actions">
              <button className="doctor-exceptions-btn doctor-exceptions-btn--secondary" type="button">
                Odustani
              </button>
              <button className="doctor-exceptions-btn doctor-exceptions-btn--primary" type="button" onClick={handleSave}>
                <AppIcon name="note" />
                Spremi iznimku
              </button>
            </div>
          </div>

          <button className="doctor-exceptions-change-doctor-btn" type="button">
            <AppIcon name="user" />
            Promijeni liječnika
          </button>
        </aside>
      </div>
    </div>
  )
}

export { DoctorExceptionsPage }
