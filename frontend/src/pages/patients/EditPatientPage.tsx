import { useState } from 'react'
import type { ReactElement } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { AppIcon } from '@/components'
import { APP_ROUTES } from '@/app/routes'

import './patients.css'

interface PatientData {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  oib: string
  gender: string
  email: string
  phone: string
  phoneCode: string
  secondPhone: string
  secondPhoneCode: string
  address: string
  postalCode: string
  city: string
  country: string
  county: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelation: string
  notes: string
  status: 'Aktivan' | 'Neaktivan'
  institution: string
}

const mockPatientData: PatientData = {
  id: '1',
  firstName: 'Ana',
  lastName: 'Marić',
  dateOfBirth: '01.01.1990.',
  oib: '12345678901',
  gender: 'Ženski',
  email: 'ana.maric@email.hr',
  phone: '91 234 5678',
  phoneCode: '+385',
  secondPhone: '98 765 4321',
  secondPhoneCode: '+385',
  address: 'Ulica grada Vukovara 269d',
  postalCode: '10000',
  city: 'Zagreb',
  country: 'Hrvatska',
  county: 'Grad Zagreb',
  emergencyContactName: 'Marko Marić',
  emergencyContactPhone: '+385 91 555 1212',
  emergencyContactRelation: 'Suprug',
  notes: '',
  status: 'Aktivan',
  institution: 'Poliklinika Medica Zagreb',
}

const upcomingAppointments = [
  {
    date: '20',
    month: 'svi',
    title: 'Kontrola pregled',
    doctor: 'dr. Ivan Babić',
    time: '10:00',
  },
  {
    date: '10',
    month: 'svi',
    title: 'Redovni pregled',
    doctor: 'dr. Petra Kovač',
    time: '11:30',
  },
  {
    date: '05',
    month: 'KOL',
    title: 'Prvi pregled',
    doctor: 'dr. Luka Jurić',
    time: '09:00',
  },
]

function EditPatientPage(): ReactElement {
  const navigate = useNavigate()
  const { patientId } = useParams<{ patientId: string }>()

  const [formData, setFormData] = useState<PatientData>(mockPatientData)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCancel = () => {
    navigate(APP_ROUTES.patients)
  }

  const handleSubmit = () => {
    navigate(APP_ROUTES.patients)
  }

  return (
    <div className="edit-patient-page">
      <div className="edit-patient-breadcrumb">
        <button type="button" onClick={() => navigate(APP_ROUTES.patients)} className="edit-patient-breadcrumb-link">
          Pacijenti
        </button>
        <AppIcon name="chevronRight" />
        <button type="button" className="edit-patient-breadcrumb-link">
          Detalji pacijenta
        </button>
        <AppIcon name="chevronRight" />
        <span>Uredi pacijenta</span>
      </div>

      <div className="edit-patient-header">
        <div>
          <h1>Uredi pacijenta</h1>
          <p>Ažurirajte podatke o pacijentu. Promjene će biti spremljene nakon potvrde.</p>
        </div>
        <button type="button" className="edit-patient-back-button" onClick={handleCancel}>
          <AppIcon name="chevronLeft" />
          Povratak na detalje pacijenta
        </button>
      </div>

      <div className="edit-patient-content-grid">
        <section className="edit-patient-card">
          {/* Basic Info Section */}
          <div className="edit-patient-card__section">
            <h2 className="edit-patient-card__section-title">Osnovni podaci</h2>

            <div className="edit-patient-profile-header">
              <div className="edit-patient-avatar">
                {(formData.firstName[0] || 'P').toUpperCase()}{(formData.lastName[0] || 'P').toUpperCase()}
              </div>
              <div className="edit-patient-profile-action">
                <button type="button" className="edit-patient-photo-button">
                  <AppIcon name="user" />
                  <span>
                    Promijeni fotografiju
                    <small>PNG, JPG ili WEBP do 2MB</small>
                  </span>
                </button>
              </div>
            </div>

            <div className="edit-patient-fields-row edit-patient-fields-row--2">
              <div className="edit-patient-field">
                <label className="edit-patient-field__label" htmlFor="firstName">
                  Ime <span className="edit-patient-required">*</span>
                </label>
                <input
                  id="firstName"
                  className="edit-patient-field__input"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                />
              </div>
              <div className="edit-patient-field">
                <label className="edit-patient-field__label" htmlFor="lastName">
                  Prezime <span className="edit-patient-required">*</span>
                </label>
                <input
                  id="lastName"
                  className="edit-patient-field__input"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                />
              </div>
            </div>

            <div className="edit-patient-fields-row edit-patient-fields-row--2">
              <div className="edit-patient-field">
                <label className="edit-patient-field__label" htmlFor="dateOfBirth">
                  Datum rođenja
                </label>
                <input
                  id="dateOfBirth"
                  className="edit-patient-field__input"
                  type="text"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                />
              </div>
              <div className="edit-patient-field">
                <label className="edit-patient-field__label" htmlFor="oib">
                  OIB
                </label>
                <input
                  id="oib"
                  className="edit-patient-field__input"
                  type="text"
                  value={formData.oib}
                  onChange={(e) => handleInputChange('oib', e.target.value)}
                />
              </div>
            </div>

            <div className="edit-patient-fields-row edit-patient-fields-row--2">
              <div className="edit-patient-field">
                <label className="edit-patient-field__label" htmlFor="gender">
                  Spol
                </label>
                <select
                  id="gender"
                  className="edit-patient-field__select"
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                >
                  <option value="">Odaberite spol</option>
                  <option value="Muški">Muški</option>
                  <option value="Ženski">Ženski</option>
                  <option value="Ostalo">Ostalo</option>
                </select>
              </div>
              <div className="edit-patient-field">
                <label className="edit-patient-field__label" htmlFor="country">
                  Državljanstvo
                </label>
                <select
                  id="country"
                  className="edit-patient-field__select"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                >
                  <option value="Hrvatska">Hrvatska</option>
                  <option value="Ostalo">Ostalo</option>
                </select>
              </div>
            </div>

            <div className="edit-patient-field">
              <label className="edit-patient-field__label" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                className="edit-patient-field__input"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>

            <div className="edit-patient-field">
              <label className="edit-patient-field__label" htmlFor="phone">
                Telefon <span className="edit-patient-required">*</span>
              </label>
              <div className="edit-patient-phone-input">
                <select className="edit-patient-phone-code">
                  <option value="+385">🇭🇷 +385</option>
                </select>
                <input
                  id="phone"
                  className="edit-patient-field__input"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
            </div>

            <div className="edit-patient-field">
              <label className="edit-patient-field__label" htmlFor="secondPhone">
                Drugi telefon
              </label>
              <div className="edit-patient-phone-input">
                <select className="edit-patient-phone-code">
                  <option value="+385">🇭🇷 +385</option>
                </select>
                <input
                  id="secondPhone"
                  className="edit-patient-field__input"
                  type="tel"
                  value={formData.secondPhone}
                  onChange={(e) => handleInputChange('secondPhone', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="edit-patient-card__section">
            <h2 className="edit-patient-card__section-title">Adresa prebivaišta</h2>

            <div className="edit-patient-field">
              <label className="edit-patient-field__label" htmlFor="address">
                Adresa <span className="edit-patient-required">*</span>
              </label>
              <input
                id="address"
                className="edit-patient-field__input"
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>

            <div className="edit-patient-fields-row edit-patient-fields-row--2">
              <div className="edit-patient-field">
                <label className="edit-patient-field__label" htmlFor="postalCode">
                  Poštanski broj <span className="edit-patient-required">*</span>
                </label>
                <input
                  id="postalCode"
                  className="edit-patient-field__input"
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                />
              </div>
              <div className="edit-patient-field">
                <label className="edit-patient-field__label" htmlFor="city">
                  Grad <span className="edit-patient-required">*</span>
                </label>
                <input
                  id="city"
                  className="edit-patient-field__input"
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>
            </div>

            <div className="edit-patient-fields-row edit-patient-fields-row--2">
              <div className="edit-patient-field">
                <label className="edit-patient-field__label" htmlFor="county">
                  Županija
                </label>
                <select
                  id="county"
                  className="edit-patient-field__select"
                  value={formData.county}
                  onChange={(e) => handleInputChange('county', e.target.value)}
                >
                  <option value="Grad Zagreb">Grad Zagreb</option>
                  <option value="Ostalo">Ostalo</option>
                </select>
              </div>
              <div className="edit-patient-field">
                <label className="edit-patient-field__label" htmlFor="country">
                  Zemlja
                </label>
                <select
                  id="country"
                  className="edit-patient-field__select"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                >
                  <option value="Hrvatska">Hrvatska</option>
                  <option value="Ostalo">Ostalo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="edit-patient-card__section">
            <h2 className="edit-patient-card__section-title">Dodatne informacije</h2>

            <div className="edit-patient-field">
              <label className="edit-patient-field__label" htmlFor="emergencyContactName">
                Kontakt osoba za hitne slučajeve
              </label>
              <input
                id="emergencyContactName"
                className="edit-patient-field__input"
                type="text"
                value={formData.emergencyContactName}
                onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
              />
            </div>

            <div className="edit-patient-fields-row edit-patient-fields-row--2">
              <div className="edit-patient-field">
                <label className="edit-patient-field__label" htmlFor="emergencyContactPhone">
                  Telefon hitni kontakt osobe
                </label>
                <input
                  id="emergencyContactPhone"
                  className="edit-patient-field__input"
                  type="tel"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                />
              </div>
              <div className="edit-patient-field">
                <label className="edit-patient-field__label" htmlFor="emergencyContactRelation">
                  Odnos
                </label>
                <select
                  id="emergencyContactRelation"
                  className="edit-patient-field__select"
                  value={formData.emergencyContactRelation}
                  onChange={(e) => handleInputChange('emergencyContactRelation', e.target.value)}
                >
                  <option value="Suprug">Suprug</option>
                  <option value="Supruga">Supruga</option>
                  <option value="Roditelj">Roditelj</option>
                  <option value="Dijete">Dijete</option>
                  <option value="Brat/Sestra">Brat/Sestra</option>
                  <option value="Prijatelj">Prijatelj</option>
                </select>
              </div>
            </div>

            <div className="edit-patient-field">
              <label className="edit-patient-field__label" htmlFor="notes">
                Napomene (opcionalno)
              </label>
              <textarea
                id="notes"
                className="edit-patient-field__textarea"
                placeholder="Upišite dodatne napomene o pacijentu..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                maxLength={500}
              />
              <span className="edit-patient-field__count">{formData.notes.length} / 500</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="edit-patient-card__actions">
            <button
              className="edit-patient-btn edit-patient-btn--secondary"
              type="button"
              onClick={handleCancel}
            >
              Odustani
            </button>
            <button
              className="edit-patient-btn edit-patient-btn--primary"
              type="button"
              onClick={handleSubmit}
            >
              <AppIcon name="note" />
              Spremi promjene
            </button>
          </div>
        </section>

        {/* Sidebar */}
        <aside className="edit-patient-sidebar">
          <div className="edit-patient-summary-card">
            <h3 className="edit-patient-summary-card__title">Sažetak pacijenta</h3>

            <div className="edit-patient-summary-preview">
              <div className="edit-patient-summary-avatar">
                {(formData.firstName[0] || 'P').toUpperCase()}{(formData.lastName[0] || 'P').toUpperCase()}
              </div>
              <div className="edit-patient-summary-info">
                <strong>{formData.firstName} {formData.lastName}</strong>
                <span className="edit-patient-status-badge">
                  {formData.status === 'Aktivan' ? 'Aktivan' : 'Neaktivan'}
                </span>
              </div>
            </div>

            <div className="edit-patient-summary-list">
              <div className="edit-patient-summary-item">
                <span>OIB</span>
                <strong>{formData.oib}</strong>
              </div>
              <div className="edit-patient-summary-item">
                <span>E-mail</span>
                <strong>{formData.email}</strong>
              </div>
              <div className="edit-patient-summary-item">
                <span>Telefon</span>
                <strong>{formData.phoneCode} {formData.phone}</strong>
              </div>
              <div className="edit-patient-summary-item">
                <span>Adresa</span>
                <strong>{formData.address}, {formData.postalCode} {formData.city}</strong>
              </div>
            </div>
          </div>

          <div className="edit-patient-appointments-card">
            <div className="edit-patient-appointments-header">
              <h3 className="edit-patient-appointments-card__title">Nadolazeci termini</h3>
              <button type="button" className="edit-patient-see-all-link">
                Prikaži sve
              </button>
            </div>

            <div className="edit-patient-appointments-list">
              {upcomingAppointments.map((apt, idx) => (
                <div className="edit-patient-appointment-item" key={idx}>
                  <div className="edit-patient-appointment-date">
                    <strong>{apt.date}</strong>
                    <small>{apt.month}</small>
                  </div>
                  <div className="edit-patient-appointment-info">
                    <strong>{apt.title}</strong>
                    <span>{apt.doctor}</span>
                    <small>{apt.time}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="edit-patient-actions-card">
            <h3 className="edit-patient-actions-card__title">Brze akcije</h3>
            <div className="edit-patient-actions-list">
              <button type="button" className="edit-patient-action-button">
                <AppIcon name="calendar" />
                Rezerviraj termin
              </button>
              <button type="button" className="edit-patient-action-button">
                <AppIcon name="clock" />
                Postavi termin
              </button>
              <button type="button" className="edit-patient-action-button">
                <AppIcon name="note" />
                Zabiljezka
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export { EditPatientPage }
