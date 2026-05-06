import { useState } from 'react'
import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppIcon } from '@/components'
import { APP_ROUTES } from '@/app/routes'

import './doctors.css'

interface Exception {
  readonly id: string
  readonly dateFrom: string
  readonly dateTo: string
  readonly type: string
  readonly reason: string
  readonly status: 'Odobreno' | 'Na čekanju'
}

const INITIAL_EXCEPTIONS: readonly Exception[] = [
  {
    id: '1',
    dateFrom: '20.05.2025.',
    dateTo: '24.05.2025.',
    type: 'Godišnji odmor',
    reason: 'Godišnji odmor',
    status: 'Odobreno',
  },
  {
    id: '2',
    dateFrom: '10.06.2025.',
    dateTo: '10.06.2025.',
    type: 'Edukacija',
    reason: 'Napredni EKG tečaj',
    status: 'Na čekanju',
  },
  {
    id: '3',
    dateFrom: '01.07.2025.',
    dateTo: '05.07.2025.',
    type: 'Kongres',
    reason: 'Hrvatski kardiološki kongres',
    status: 'Odobreno',
  },
  {
    id: '4',
    dateFrom: '22.08.2025.',
    dateTo: '22.08.2025.',
    type: 'Edukacija',
    reason: 'Radionica: UZ srca',
    status: 'Odobreno',
  },
  {
    id: '5',
    dateFrom: '15.09.2025.',
    dateTo: '19.09.2025.',
    type: 'Bolovanje',
    reason: 'Bolovanje',
    status: 'Odobreno',
  },
  {
    id: '6',
    dateFrom: '03.11.2025.',
    dateTo: '03.11.2025.',
    type: 'Edukacija',
    reason: 'Osobni razlozi',
    status: 'Na čekanju',
  },
  {
    id: '7',
    dateFrom: '12.12.2025.',
    dateTo: '12.12.2025.',
    type: 'Edukacija',
    reason: 'Sastanak stručnog tima',
    status: 'Na čekanju',
  },
]

const DOCTOR_NAME = 'Dr. Ivan Babić, dr. med.'
const DOCTOR_SPECIALTY = 'Kardiolog'
const DOCTOR_STATUS = 'Aktivan'

function DoctorExceptionsPage(): ReactElement {
  const navigate = useNavigate()
  const [exceptions] = useState(INITIAL_EXCEPTIONS)
  const [newException, setNewException] = useState({
    type: 'Godišnji odmor',
    dateFrom: '',
    dateTo: '',
    reason: '',
  })

  const handleSave = () => {
    navigate(APP_ROUTES.doctorSchedule)
  }

  const handleBack = () => {
    navigate(APP_ROUTES.doctorSchedule)
  }

  const getStatusColor = (status: string) => {
    return status === 'Odobreno' ? 'status-badge--approved' : 'status-badge--pending'
  }

  return (
    <div className="doctor-exceptions-page">
      <div className="doctor-exceptions-breadcrumb">
        <button className="doctor-exceptions-breadcrumb-link" type="button" onClick={() => navigate(APP_ROUTES.doctors)}>
          Liječnici
        </button>
        <span>/</span>
        <button className="doctor-exceptions-breadcrumb-link" type="button" onClick={() => navigate(APP_ROUTES.doctorSchedule)}>
          Radno vrijeme
        </button>
        <span>/</span>
        <span>Neradni dani i iznimke</span>
      </div>

      <div className="doctor-exceptions-header">
        <div className="doctor-exceptions-doctor-info">
          <div className="doctor-exceptions-avatar">
            <span>IB</span>
          </div>
          <div className="doctor-exceptions-info">
            <h1>{DOCTOR_NAME}</h1>
            <p>{DOCTOR_SPECIALTY}</p>
            <span className={`doctor-exceptions-status status-badge status-badge--approved`}>
              {DOCTOR_STATUS}
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
                {exceptions.map((exc) => (
                  <tr key={exc.id} className="doctor-exceptions-table-row">
                    <td className="doctor-exceptions-table-cell doctor-exceptions-table-cell--date">
                      <div>{exc.dateFrom}</div>
                      <span className="doctor-exceptions-date-type">(utorak)</span>
                    </td>
                    <td className="doctor-exceptions-table-cell doctor-exceptions-table-cell--date">
                      <div>{exc.dateTo}</div>
                      <span className="doctor-exceptions-date-type">(četvrtak)</span>
                    </td>
                    <td className="doctor-exceptions-table-cell">
                      <span className="doctor-exceptions-type-badge">{exc.type}</span>
                    </td>
                    <td className="doctor-exceptions-table-cell">{exc.reason}</td>
                    <td className="doctor-exceptions-table-cell">
                      <span className={`status-badge ${getStatusColor(exc.status)}`}>
                        {exc.status}
                      </span>
                    </td>
                    <td className="doctor-exceptions-table-cell doctor-exceptions-table-cell--actions">
                      <button className="doctor-exceptions-more-btn" type="button">
                        <AppIcon name="dots" />
                      </button>
                    </td>
                  </tr>
                ))}
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
