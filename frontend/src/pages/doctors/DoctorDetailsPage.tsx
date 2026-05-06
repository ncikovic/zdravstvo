import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppIcon } from '@/components'
import { APP_ROUTES } from '@/app/routes'

import './doctors.css'

interface DoctorDetailsData {
  id: string
  firstName: string
  lastName: string
  title: string | null
  licenseNumber: string | null
  bio: string | null
  phone: string | null
  email: string | null
  status: 'Aktivan' | 'Neaktivan'
}

const mockDoctorDetails: DoctorDetailsData = {
  id: 'doctor-1',
  firstName: 'Petra',
  lastName: 'Barić',
  title: 'dr. med.',
  licenseNumber: '12345/2015',
  bio: 'Specijalistinja za ginekologiju i opstetriciju sa 15 godina iskustva. Specijalizirana za rizične trudnoće i minimalno invazivne procedure.',
  phone: '+385 91 234 5678',
  email: 'petra.baric@pmz.hr',
  status: 'Aktivan',
}

function DoctorDetailsPage(): ReactElement {
  const navigate = useNavigate()

  const doctor = mockDoctorDetails

  return (
    <div className="doctor-details-page">
      <div className="doctor-details-breadcrumb">
        <button type="button" onClick={() => navigate(APP_ROUTES.doctors)} className="doctor-details-breadcrumb-link">
          Liječnici
        </button>
        <AppIcon name="chevronRight" />
        <span>Detalji liječnika</span>
      </div>

      <div className="doctor-details-header">
        <div>
          <h1>Detalji liječnika</h1>
          <p>Pregled svih podataka o liječniku.</p>
        </div>
        <button type="button" className="doctor-details-back-button" onClick={() => navigate(APP_ROUTES.doctors)}>
          <AppIcon name="chevronLeft" />
          Povratak na liječnike
        </button>
      </div>

      <div className="doctor-details-content-grid">
        <section className="doctor-details-main">
          {/* Doctor Header Card */}
          <div className="doctor-details-header-card">
            <div className="doctor-details-header-info">
              <div className="doctor-details-avatar">
                {(doctor.firstName[0] || 'D').toUpperCase()}{(doctor.lastName[0] || 'D').toUpperCase()}
              </div>
              <div className="doctor-details-header-text">
                <div>
                  <h2>Dr. {doctor.firstName} {doctor.lastName}</h2>
                  <span className="doctor-details-status-badge">{doctor.status}</span>
                </div>
                {doctor.title && (
                  <div className="doctor-details-meta">
                    <span>
                      <AppIcon name="info" />
                      {doctor.title}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Basic Info Section */}
          <div className="doctor-details-section">
            <h3 className="doctor-details-section-title">Osnovne informacije</h3>
            <div className="doctor-details-grid">
              <div className="doctor-details-item">
                <span className="doctor-details-icon">
                  <AppIcon name="phone" />
                </span>
                <div>
                  <strong>Telefon</strong>
                  <p>{doctor.phone || 'Nije dostupno'}</p>
                </div>
              </div>
              <div className="doctor-details-item">
                <span className="doctor-details-icon">
                  <AppIcon name="mail" />
                </span>
                <div>
                  <strong>E-mail</strong>
                  <p>{doctor.email || 'Nije dostupno'}</p>
                </div>
              </div>
              {doctor.licenseNumber && (
                <div className="doctor-details-item">
                  <span className="doctor-details-icon">
                    <AppIcon name="info" />
                  </span>
                  <div>
                    <strong>Licenca</strong>
                    <p>{doctor.licenseNumber}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bio Section */}
          {doctor.bio && (
            <div className="doctor-details-section doctor-details-notes-section">
              <div className="doctor-details-notes-header">
                <AppIcon name="note" />
                <span>Biografija</span>
              </div>
              <p className="doctor-details-notes-text">
                {doctor.bio}
              </p>
            </div>
          )}
        </section>

        {/* Sidebar */}
        <aside className="doctor-details-sidebar">
          {/* Quick Actions */}
          <div className="doctor-details-card">
            <h3 className="doctor-details-card-title">Brze akcije</h3>
            <div className="doctor-details-actions">
              <button type="button" className="doctor-details-action-link">
                <AppIcon name="note" />
                Uredi podatke
                <AppIcon name="chevronRight" />
              </button>
              <button type="button" className="doctor-details-action-link">
                <AppIcon name="clock" />
                Radno vrijeme
                <AppIcon name="chevronRight" />
              </button>
            </div>
          </div>

          {/* Doctor Summary */}
          <div className="doctor-details-card">
            <h3 className="doctor-details-card-title">Sažetak</h3>
            <div className="doctor-details-summary-list">
              <div className="doctor-details-summary-item">
                <div>
                  <AppIcon name="checkCircle" />
                  <span>Status</span>
                </div>
                <strong className="doctor-details-status-active">{doctor.status}</strong>
              </div>
              {doctor.title && (
                <div className="doctor-details-summary-item">
                  <div>
                    <AppIcon name="user" />
                    <span>Zvanje</span>
                  </div>
                  <strong>{doctor.title}</strong>
                </div>
              )}
              {doctor.licenseNumber && (
                <div className="doctor-details-summary-item">
                  <div>
                    <AppIcon name="info" />
                    <span>Licenca</span>
                  </div>
                  <strong>{doctor.licenseNumber}</strong>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export { DoctorDetailsPage }
