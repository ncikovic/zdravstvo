import { useState } from 'react'
import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppIcon } from '@/components'
import { APP_ROUTES } from '@/app/routes'
import { doctorsService } from '@/services/doctors.service'

import './doctors.css'

function CreateDoctorPage(): ReactElement {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    title: '',
    licenseNumber: '',
    email: '',
    phone: '',
    bio: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    if (error) setError(null)
  }

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.licenseNumber) {
      setError('Obavezna polja: Ime, Prezime i Broj licence')
      return
    }

    try {
      setIsLoading(true)
      await doctorsService.create({
        firstName: formData.firstName,
        lastName: formData.lastName,
        title: formData.title || null,
        licenseNumber: formData.licenseNumber,
        email: formData.email || null,
        phone: formData.phone || null,
        bio: formData.bio || null,
      })
      navigate(APP_ROUTES.doctors)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri kreiranju liječnika')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    navigate(APP_ROUTES.doctors)
  }

  return (
    <div className="create-doctor-page">
      <div className="create-doctor-page__hero">
        <h1>Novi liječnik</h1>
        <p>Unesite osnovne podatke i postavke liječnika.</p>
      </div>

      <div className="create-doctor-content-grid">
        {error && (
          <div style={{ padding: '1rem', backgroundColor: '#ffebee', color: '#d32f2f', borderRadius: '4px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        <section className="create-doctor-card">
          {/* Profile Picture Section */}
          <div className="create-doctor-card__section">
            <div className="create-doctor-profile-photo">
              <div className="create-doctor-profile-photo__placeholder">
                <AppIcon name="doctor" />
              </div>
              <span className="create-doctor-profile-photo__label">Profilna fotografija</span>
              <p className="create-doctor-profile-photo__hint">
                Kliknite za dodati ili povucite sliku ovdje<br />
                PNG, JPG ili WEBP do 2MB
              </p>
            </div>
          </div>

          {/* Basic Info Section */}
          <div className="create-doctor-card__section">
            <h2 className="create-doctor-card__section-title">Osnovni podaci</h2>

            <div className="create-doctor-fields-row create-doctor-fields-row--2">
              <div className="create-doctor-field">
                <label className="create-doctor-field__label" htmlFor="firstName">
                  Ime <span className="create-doctor-required">*</span>
                </label>
                <input
                  id="firstName"
                  className="create-doctor-field__input"
                  type="text"
                  placeholder="Upisite ime"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                />
              </div>
              <div className="create-doctor-field">
                <label className="create-doctor-field__label" htmlFor="lastName">
                  Prezime <span className="create-doctor-required">*</span>
                </label>
                <input
                  id="lastName"
                  className="create-doctor-field__input"
                  type="text"
                  placeholder="Upisite prezime"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                />
              </div>
            </div>

            <div className="create-doctor-field">
              <label className="create-doctor-field__label" htmlFor="title">
                Titula
              </label>
              <input
                id="title"
                className="create-doctor-field__input"
                type="text"
                placeholder="npr. dr. med."
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>

            <div className="create-doctor-fields-row create-doctor-fields-row--2">
              <div className="create-doctor-field">
                <label className="create-doctor-field__label" htmlFor="specialization">
                  Specijalizacija <span className="create-doctor-required">*</span>
                </label>
                <select
                  id="specialization"
                  className="create-doctor-field__select"
                  value={formData.title}
                  onChange={(e) => handleInputChange('specialization', e.target.value)}
                >
                  <option value="">Odaberite specijalizaciju</option>
                  <option value="Ginekologija">Ginekologija</option>
                  <option value="Interna medicina">Interna medicina</option>
                  <option value="Kardiologija">Kardiologija</option>
                  <option value="Ortopedija">Ortopedija</option>
                  <option value="Pedijatrija">Pedijatrija</option>
                  <option value="Dermatologija">Dermatologija</option>
                  <option value="Neurologija">Neurologija</option>
                </select>
              </div>
              <div className="create-doctor-field">
                <label className="create-doctor-field__label" htmlFor="numberLicenses">
                  Broj licence <span className="create-doctor-required">*</span>
                </label>
                <input
                  id="numberLicenses"
                  className="create-doctor-field__input"
                  type="text"
                  placeholder="Upisite broj licence"
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange('numberLicenses', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="create-doctor-card__section">
            <h2 className="create-doctor-card__section-title">Kontakt</h2>

            <div className="create-doctor-fields-row create-doctor-fields-row--2">
              <div className="create-doctor-field">
                <label className="create-doctor-field__label" htmlFor="email">
                  E-mail <span className="create-doctor-required">*</span>
                </label>
                <input
                  id="email"
                  className="create-doctor-field__input"
                  type="email"
                  placeholder="Upisite e-mail adresu"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              <div className="create-doctor-field">
                <label className="create-doctor-field__label" htmlFor="phone">
                  Telefon <span className="create-doctor-required">*</span>
                </label>
                <div className="create-doctor-phone-input">
                  <select className="create-doctor-phone-code">
                    <option value="+385">🇭🇷 +385</option>
                  </select>
                  <input
                    id="phone"
                    className="create-doctor-field__input"
                    type="tel"
                    placeholder="91 234 5678"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="create-doctor-field">
              <label className="create-doctor-field__label" htmlFor="shortBio">
                Kratka biografija
              </label>
              <textarea
                id="shortBio"
                className="create-doctor-field__textarea"
                placeholder="Napišite kratki opis liječnika..."
                value={formData.bio}
                onChange={(e) => handleInputChange('shortBio', e.target.value)}
                rows={3}
                maxLength={200}
              />
              <span className="create-doctor-field__count">{formData.bio.length} / 200</span>
            </div>
          </div>

          {/* Structural Data Section */}

          {/* Action Buttons */}
          <div className="create-doctor-card__actions">
            <button
              className="create-doctor-btn create-doctor-btn--secondary"
              type="button"
              onClick={handleCancel}
            >
              Odustani
            </button>
            <button
              className="create-doctor-btn create-doctor-btn--primary"
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              <AppIcon name="note" />
              {isLoading ? 'Sprema se...' : 'Spremi liječnika'}
            </button>
          </div>
        </section>

        {/* Sidebar */}
        <aside className="create-doctor-sidebar">
          <div className="create-doctor-info-card">
            <h3 className="create-doctor-info-card__title">Sažetak profila</h3>

            <div className="create-doctor-info-preview">
              <div className="create-doctor-preview-avatar">
                <span>{(formData.firstName[0] || 'N').toUpperCase()}{(formData.lastName[0] || 'L').toUpperCase()}</span>
              </div>
              <div className="create-doctor-preview-info">
                <strong>{formData.firstName && formData.lastName ? `${formData.firstName} ${formData.lastName}` : 'Novi liječnik'}</strong>
                {formData.title && <span>{formData.title}</span>}
                {!formData.title && <em>Nema navedene titule</em>}
              </div>
            </div>

            <div className="create-doctor-info-section">
              <span className="create-doctor-info-section__title">Specijalizacija</span>
              <p>{formData.title || '—'}</p>
            </div>

            <div className="create-doctor-info-section">
              <span className="create-doctor-info-section__title">Status</span>
              <p>
                <em className={formData.status === 'Aktivan' ? 'status-badge status-badge--active' : 'status-badge'}>
                  {formData.status}
                </em>
              </p>
            </div>

            <div className="create-doctor-info-section">
              <span className="create-doctor-info-section__title">Ustanova</span>
              <p>{formData.institution}</p>
            </div>
          </div>

          <div className="create-doctor-quick-links">
            <h3 className="create-doctor-quick-links__title">Slijedeći koraci</h3>
            <div className="create-doctor-quick-links__list">
              <button className="create-doctor-quick-link" type="button">
                <AppIcon name="user" />
                <div>
                  <strong>Detalji liječnika</strong>
                  <span>Upravljajte dodatnim podacima.</span>
                </div>
                <AppIcon name="chevronRight" />
              </button>
              <button
                className="create-doctor-quick-link"
                type="button"
                onClick={() => navigate(APP_ROUTES.doctorSchedule)}
              >
                <AppIcon name="calendar" />
                <div>
                  <strong>Radno vrijeme</strong>
                  <span>Postavite radno vrijeme liječnika.</span>
                </div>
                <AppIcon name="chevronRight" />
              </button>
              <button
                className="create-doctor-quick-link"
                type="button"
                onClick={() => navigate(APP_ROUTES.doctorExceptions)}
              >
                <AppIcon name="calendar" />
                <div>
                  <strong>Neradni dani i iznimke</strong>
                  <span>Dodjele neradne dane i iznimke.</span>
                </div>
                <AppIcon name="chevronRight" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export { CreateDoctorPage }
