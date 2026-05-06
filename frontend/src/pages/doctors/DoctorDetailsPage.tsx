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

const upcomingAppointments = [
  {
    date: '20',
    month: 'svi',
    title: 'Kontrolni pregled',
    patient: 'Ana Marić',
    time: '10:00',
    status: 'Predstoji',
  },
  {
    date: '10',
    month: 'LIP',
    title: 'Redovni pregled',
    patient: 'Marko Horvat',
    time: '11:30',
    status: 'Predstoji',
  },
  {
    date: '05',
    month: 'KOL',
    title: 'Konzultacija',
    patient: 'Ivana Kovač',
    time: '09:00',
    status: 'Predstoji',
  },
]

const appointmentHistory = [
  {
    date: '18.06.2024.',
    type: 'Redovni pregled',
    patient: 'Ana Marić',
    status: 'Obavljen',
  },
  {
    date: '10.04.2024.',
    type: 'Kontrolni pregled',
    patient: 'Marko Horvat',
    status: 'Obavljen',
  },
  {
    date: '22.02.2024.',
    type: 'Konzultacija',
    patient: 'Ivana Kovač',
    status: 'Obavljen',
  },
  {
    date: '15.01.2024.',
    type: 'Kontrolni pregled',
    patient: 'Ana Marić',
    status: 'Otkazan',
  },
  {
    date: '05.12.2023.',
    type: 'Redovni pregled',
    patient: 'Marko Horvat',
    status: 'Obavljen',
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

          {/* Working Hours Section */}
          <div className="doctor-details-section">
            <h3 className="doctor-details-section-title">Radno vrijeme</h3>
            <div className="doctor-details-working-hours">
              {workingHours.map(([day, time, active]) => (
                <div key={day} className="doctor-details-working-hour-item">
                  <span className="doctor-details-working-hour-day">
                    <i className={active ? 'doctor-details-hours-dot' : 'doctor-details-hours-dot doctor-details-hours-dot--muted'} />
                    {day}
                  </span>
                  <strong>{time}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="doctor-details-section">
            <div className="doctor-details-section-header">
              <h3 className="doctor-details-section-title">Nadolazeci termini</h3>
              <button type="button" className="doctor-details-show-all">Prikaži sve</button>
            </div>
            <div className="doctor-details-appointments">
              {upcomingAppointments.map((apt, idx) => (
                <div className="doctor-details-appointment-item" key={idx}>
                  <div className="doctor-details-appointment-date">
                    <strong>{apt.date}</strong>
                    <small>{apt.month}</small>
                  </div>
                  <div className="doctor-details-appointment-info">
                    <strong>{apt.title}</strong>
                    <span>{apt.patient}</span>
                  </div>
                  <div className="doctor-details-appointment-time">
                    <span>{apt.time}</span>
                    <button type="button">
                      <AppIcon name="chevronRight" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Appointment History */}
          <div className="doctor-details-section">
            <div className="doctor-details-section-header">
              <h3 className="doctor-details-section-title">povijest termina</h3>
              <button type="button" className="doctor-details-show-all">Prikaži sve</button>
            </div>
            <div className="doctor-details-history-table">
              <div className="doctor-details-history-header">
                <span>Datum</span>
                <span>Tip termina</span>
                <span>Pacijent</span>
                <span>Status</span>
              </div>
              {appointmentHistory.map((apt, idx) => (
                <div className="doctor-details-history-row" key={idx}>
                  <span>{apt.date}</span>
                  <span>{apt.type}</span>
                  <span>{apt.patient}</span>
                  <span className={`doctor-details-status ${apt.status === 'Obavljen' ? 'obavljen' : apt.status === 'Otkazan' ? 'otkazan' : 'predstoji'}`}>
                    {apt.status}
                  </span>
                </div>
              ))}
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
