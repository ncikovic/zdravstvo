import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { AppIcon } from '@/components'
import { APP_ROUTES } from '@/app/routes'
import { doctorsService } from '@/services/doctors.service'
import type { DoctorResponseDto } from '@zdravstvo/contracts'
import { getApiErrorMessage } from '@/utils'

import './doctors.css'

const workingHours = [
  ['Ponedjeljak', '08:00 - 16:30', true],
  ['Utorak', '08:00 - 16:30', true],
  ['Srijeda', '08:00 - 16:30', true],
  ['Četvrtak', '10:00 - 18:00', true],
  ['Petak', '08:00 - 15:00', true],
  ['Subota', '-', false],
  ['Nedjelja', '-', false],
] as const

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

function DoctorDetailsPage(): ReactElement {
  const navigate = useNavigate()
  const { doctorId } = useParams<{ doctorId: string }>()
  const [doctor, setDoctor] = useState<DoctorResponseDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!doctorId) {
      setError('Doctor ID not found')
      setIsLoading(false)
      return
    }

    const fetchDoctor = async () => {
      try {
        setIsLoading(true)
        const data = await doctorsService.getById(doctorId)
        setDoctor(data)
        setError(null)
      } catch (err) {
        setError(getApiErrorMessage(err))
        setDoctor(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDoctor()
  }, [doctorId])

  if (isLoading) {
    return (
      <div className="doctor-details-page" style={{ padding: '2rem', textAlign: 'center' }}>
        Učitavanje...
      </div>
    )
  }

  if (error || !doctor) {
    return (
      <div className="doctor-details-page" style={{ padding: '2rem', textAlign: 'center', color: '#d32f2f' }}>
        {error || 'Liječnik nije pronađen'}
      </div>
    )
  }

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
                {doctor.firstName[0]?.toUpperCase()}{doctor.lastName[0]?.toUpperCase()}
              </div>
              <div className="doctor-details-header-text">
                <div>
                  <h2>Dr. {doctor.firstName} {doctor.lastName}</h2>
                  <span className="doctor-details-status-badge">{doctor.isActive ? 'Aktivan' : 'Neaktivan'}</span>
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
              <button type="button" className="doctor-details-show-all" onClick={() => navigate(APP_ROUTES.appointments)}>Prikaži sve</button>
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
                    <button type="button" onClick={() => navigate(APP_ROUTES.appointments)}>
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
              <button type="button" className="doctor-details-show-all" onClick={() => navigate(APP_ROUTES.appointments)}>Prikaži sve</button>
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
              <button type="button" className="doctor-details-action-link" onClick={() => navigate(APP_ROUTES.doctorEdit.replace(':doctorId', doctor.id))}>
                <AppIcon name="edit" />
                Uredi podatke
                <AppIcon name="chevronRight" />
              </button>
              <button type="button" className="doctor-details-action-link" onClick={() => navigate(APP_ROUTES.doctorSchedule.replace(':doctorId', doctor.id))}>
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
                <strong className="doctor-details-status-active">{doctor.isActive ? 'Aktivan' : 'Neaktivan'}</strong>
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
