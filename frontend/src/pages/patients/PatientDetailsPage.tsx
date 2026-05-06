import type { ReactElement } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { AppIcon } from '@/components'
import { APP_ROUTES } from '@/app/routes'

import './patients.css'

interface PatientDetailsData {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  age: number
  oib: string
  gender: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  status: 'Aktivan' | 'Neaktivan'
  emergencyContactName: string
  emergencyContactRelation: string
  emergencyContactPhone: string
  lastAppointmentDate: string
  registeredFrom: string
  preferredContact: string
  notes: string
}

const mockPatientDetails: PatientDetailsData = {
  id: '1',
  firstName: 'Ana',
  lastName: 'Marić',
  dateOfBirth: '01.01.1990.',
  age: 34,
  oib: '12345678901',
  gender: 'Ženski',
  email: 'ana.maric@email.hr',
  phone: '+385 91 234 5678',
  address: 'Ulica grada Vukovara 269d.',
  city: '10000 Zagreb',
  postalCode: '10000',
  status: 'Aktivan',
  emergencyContactName: 'Marko Marić',
  emergencyContactRelation: 'Suprug',
  emergencyContactPhone: '+385 91 555 1212',
  lastAppointmentDate: '18.06.2024.',
  registeredFrom: '05.12.2023.',
  preferredContact: 'Telefon',
  notes: 'Pacijent preferira jutarnje termine. Kontaktirajte telefonom za promjene i zahtjeve termina.',
}

const upcomingAppointments = [
  {
    date: '20',
    month: 'svi',
    title: 'Kontrolni pregled',
    doctor: 'dr. Ivan Babić',
    time: '10:00',
    status: 'Predstoji',
  },
  {
    date: '10',
    month: 'LIP',
    title: 'Redovni pregled',
    doctor: 'dr. Petra Kovač',
    time: '11:30',
    status: 'Predstoji',
  },
  {
    date: '05',
    month: 'KOL',
    title: 'Prvi pregled',
    doctor: 'dr. Luka Jurić',
    time: '09:00',
    status: 'Predstoji',
  },
]

const appointmentHistory = [
  {
    date: '18.06.2024.',
    type: 'Redovni pregled',
    doctor: 'dr. Petra Kovač',
    status: 'Obavljen',
  },
  {
    date: '10.04.2024.',
    type: 'Kontrolni pregled',
    doctor: 'dr. Ivan Babić',
    status: 'Obavljen',
  },
  {
    date: '22.02.2024.',
    type: 'Prvi pregled',
    doctor: 'dr. Luka Jurić',
    status: 'Obavljen',
  },
  {
    date: '15.01.2024.',
    type: 'Kontrolni pregled',
    doctor: 'dr. Ivan Babić',
    status: 'Otkazan',
  },
  {
    date: '05.12.2023.',
    type: 'Redovni pregled',
    doctor: 'dr. Petra Kovač',
    status: 'Obavljen',
  },
]

const nextAppointment = {
  date: '20',
  month: 'svi',
  title: 'Kontrolni pregled',
  doctor: 'dr. Ivan Babić',
  dateTime: '20.05.2024.',
  time: '10:00',
}

function PatientDetailsPage(): ReactElement {
  const navigate = useNavigate()
  const { patientId } = useParams<{ patientId: string }>()

  const patient = mockPatientDetails

  return (
    <div className="patient-details-page">
      <div className="patient-details-breadcrumb">
        <button type="button" onClick={() => navigate(APP_ROUTES.patients)} className="patient-details-breadcrumb-link">
          Pacijenti
        </button>
        <AppIcon name="chevronRight" />
        <span>Detalji pacijenta</span>
      </div>

      <div className="patient-details-header">
        <div>
          <h1>Detalji pacijenta</h1>
          <p>Pregled svih podataka o pacijentu i povezanih termina.</p>
        </div>
        <button type="button" className="patient-details-back-button" onClick={() => navigate(APP_ROUTES.patients)}>
          <AppIcon name="chevronLeft" />
          Povratak na pacijente
        </button>
      </div>

      <div className="patient-details-content-grid">
        <section className="patient-details-main">
          {/* Patient Header Card */}
          <div className="patient-details-header-card">
            <div className="patient-details-header-info">
              <div className="patient-details-avatar">
                {(patient.firstName[0] || 'P').toUpperCase()}{(patient.lastName[0] || 'P').toUpperCase()}
              </div>
              <div className="patient-details-header-text">
                <div>
                  <h2>{patient.firstName} {patient.lastName}</h2>
                  <span className="patient-details-status-badge">{patient.status}</span>
                </div>
                <div className="patient-details-meta">
                  <span>
                    <AppIcon name="calendar" />
                    {patient.dateOfBirth} ({patient.age} god.)
                  </span>
                  <span>
                    <AppIcon name="info" />
                    OIB: {patient.oib}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Info Section */}
          <div className="patient-details-section">
            <h3 className="patient-details-section-title">Osnovne informacije</h3>
            <div className="patient-details-grid">
              <div className="patient-details-item">
                <span className="patient-details-icon">
                  <AppIcon name="phone" />
                </span>
                <div>
                  <strong>Telefon</strong>
                  <p>{patient.phone}</p>
                </div>
              </div>
              <div className="patient-details-item">
                <span className="patient-details-icon">
                  <AppIcon name="mail" />
                </span>
                <div>
                  <strong>E-mail</strong>
                  <p>{patient.email}</p>
                </div>
              </div>
              <div className="patient-details-item">
                <span className="patient-details-icon">
                  <AppIcon name="info" />
                </span>
                <div>
                  <strong>OIB</strong>
                  <p>{patient.oib}</p>
                </div>
              </div>
              <div className="patient-details-item">
                <span className="patient-details-icon">
                  <AppIcon name="user" />
                </span>
                <div>
                  <strong>Spol</strong>
                  <p>{patient.gender}</p>
                </div>
              </div>
              <div className="patient-details-item">
                <span className="patient-details-icon">
                  <AppIcon name="calendar" />
                </span>
                <div>
                  <strong>Datum rođenja</strong>
                  <p>{patient.dateOfBirth}</p>
                </div>
              </div>
              <div className="patient-details-item">
                <span className="patient-details-icon">
                  <AppIcon name="home" />
                </span>
                <div>
                  <strong>Adresa</strong>
                  <p>{patient.address}, {patient.city}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div className="patient-details-section">
            <h3 className="patient-details-section-title">Hitni kontakt</h3>
            <div className="patient-details-emergency-contact">
              <div className="patient-details-emergency-item">
                <span>Kontakt osoba</span>
                <strong>{patient.emergencyContactName}</strong>
              </div>
              <div className="patient-details-emergency-item">
                <span>Odnos</span>
                <strong>{patient.emergencyContactRelation}</strong>
              </div>
              <div className="patient-details-emergency-item">
                <span>Telefon</span>
                <strong>{patient.emergencyContactPhone}</strong>
              </div>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="patient-details-section">
            <div className="patient-details-section-header">
              <h3 className="patient-details-section-title">Nadolazeci termini</h3>
              <button type="button" className="patient-details-show-all">Prikaži sve</button>
            </div>
            <div className="patient-details-appointments">
              {upcomingAppointments.map((apt, idx) => (
                <div className="patient-details-appointment-item" key={idx}>
                  <div className="patient-details-appointment-date">
                    <strong>{apt.date}</strong>
                    <small>{apt.month}</small>
                  </div>
                  <div className="patient-details-appointment-info">
                    <strong>{apt.title}</strong>
                    <span>{apt.doctor}</span>
                  </div>
                  <div className="patient-details-appointment-time">
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
          <div className="patient-details-section">
            <div className="patient-details-section-header">
              <h3 className="patient-details-section-title">Povijest termina</h3>
              <button type="button" className="patient-details-show-all">Prikaži sve</button>
            </div>
            <div className="patient-details-history-table">
              <div className="patient-details-history-header">
                <span>Datum</span>
                <span>Tip termina</span>
                <span>Liječnik</span>
                <span>Status</span>
              </div>
              {appointmentHistory.map((apt, idx) => (
                <div className="patient-details-history-row" key={idx}>
                  <span>{apt.date}</span>
                  <span>{apt.type}</span>
                  <span>{apt.doctor}</span>
                  <span className={`patient-details-status ${apt.status === 'Obavljen' ? 'obavljen' : apt.status === 'Otkazan' ? 'otkazan' : 'predstoji'}`}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Notes Section */}
          <div className="patient-details-section patient-details-notes-section">
            <div className="patient-details-notes-header">
              <AppIcon name="note" />
              <span>Napomene</span>
            </div>
            <p className="patient-details-notes-text">
              {patient.notes}
            </p>
          </div>
        </section>

        {/* Sidebar */}
        <aside className="patient-details-sidebar">
          {/* Quick Actions */}
          <div className="patient-details-card">
            <h3 className="patient-details-card-title">Brze akcije</h3>
            <div className="patient-details-actions">
              <button type="button" className="patient-details-action-link">
                <AppIcon name="note" />
                Uredi podatke
                <AppIcon name="chevronRight" />
              </button>
              <button type="button" className="patient-details-action-link">
                <AppIcon name="calendar" />
                Rezerviraj termin
                <AppIcon name="chevronRight" />
              </button>
              <button type="button" className="patient-details-action-link">
                <AppIcon name="clock" />
                Postavi termin
                <AppIcon name="chevronRight" />
              </button>
            </div>
          </div>

          {/* Patient Summary */}
          <div className="patient-details-card">
            <h3 className="patient-details-card-title">Sažetak pacijenta</h3>
            <div className="patient-details-summary-list">
              <div className="patient-details-summary-item">
                <div>
                  <AppIcon name="checkCircle" />
                  <span>Status</span>
                </div>
                <strong className="patient-details-status-active">{patient.status}</strong>
              </div>
              <div className="patient-details-summary-item">
                <div>
                  <AppIcon name="calendar" />
                  <span>Zadnji termin</span>
                </div>
                <strong>{patient.lastAppointmentDate}</strong>
              </div>
              <div className="patient-details-summary-item">
                <div>
                  <AppIcon name="calendar" />
                  <span>Registriran od</span>
                </div>
                <strong>{patient.registeredFrom}</strong>
              </div>
              <div className="patient-details-summary-item">
                <div>
                  <AppIcon name="phone" />
                  <span>Preferirani kontakt</span>
                </div>
                <strong>{patient.preferredContact}</strong>
              </div>
              <div className="patient-details-summary-item">
                <div>
                  <AppIcon name="note" />
                  <span>Bilješka</span>
                </div>
                <strong>Preferira jutarnje termine</strong>
              </div>
            </div>
          </div>

          {/* Next Appointment */}
          <div className="patient-details-card">
            <h3 className="patient-details-card-title">Sljedeći termin</h3>
            <div className="patient-details-next-appointment">
              <div className="patient-details-appointment-preview">
                <div className="patient-details-appointment-date-box">
                  <strong>{nextAppointment.date}</strong>
                  <small>{nextAppointment.month}</small>
                </div>
                <div className="patient-details-appointment-preview-info">
                  <strong>{nextAppointment.title}</strong>
                  <span>{nextAppointment.doctor}</span>
                  <small>
                    <AppIcon name="calendar" />
                    {nextAppointment.dateTime}, <AppIcon name="clock" /> {nextAppointment.time}
                  </small>
                </div>
              </div>
              <button type="button" className="patient-details-appointment-details-button">
                Pomedi detalje termina
                <AppIcon name="chevronRight" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export { PatientDetailsPage }
