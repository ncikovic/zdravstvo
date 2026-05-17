import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, ReactElement } from 'react'

import { AppIcon } from '@/components'
import { useAuthStore } from '@/stores'
import { doctorsService, organizationsService, patientsService } from '@/services'
import { OrganizationUserRole } from '@zdravstvo/contracts'
import type { AppIconName } from '@/types'

import './settings.css'

// ─── Org settings (ADMIN / RECEPTION) ────────────────────────────────────────

interface ActiveModule {
  readonly label: string
  readonly icon: AppIconName
}

interface OrgForm {
  name: string
  email: string
  phone: string
  address: string
  city: string
  timezone: string
}

const EMPTY_ORG_FORM: OrgForm = { name: '', email: '', phone: '', address: '', city: '', timezone: '' }

const ALL_TIMEZONES: readonly string[] = (() => {
  try {
    return Intl.supportedValuesOf('timeZone')
  } catch {
    return ['Europe/Zagreb', 'Europe/London', 'America/New_York', 'America/Los_Angeles', 'Asia/Tokyo']
  }
})()

const ACTIVE_MODULES: readonly ActiveModule[] = [
  { label: 'Termini', icon: 'calendar' },
  { label: 'Liječnici', icon: 'users' },
  { label: 'Pacijenti', icon: 'patients' },
  { label: 'Podsjetnici', icon: 'bell' },
  { label: 'Online rezervacije', icon: 'checkCircle' },
]

function OrgSettingsView(): ReactElement {
  const [form, setForm] = useState<OrgForm>(EMPTY_ORG_FORM)
  const [saved, setSaved] = useState<OrgForm>(EMPTY_ORG_FORM)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [tzSearch, setTzSearch] = useState('')
  const [tzOpen, setTzOpen] = useState(false)
  const tzRef = useRef<HTMLDivElement>(null)

  const organizationId = useAuthStore((state) => state.organizationId)

  useEffect(() => {
    if (!organizationId) return
    setIsLoading(true)
    organizationsService
      .getById(organizationId)
      .then((org) => {
        const loaded: OrgForm = {
          name: org.name,
          email: org.email ?? '',
          phone: org.phone ?? '',
          address: org.address ?? '',
          city: org.city ?? '',
          timezone: org.timezone,
        }
        setForm(loaded)
        setSaved(loaded)
        setTzSearch(org.timezone)
      })
      .catch(() => { setError('Greška pri učitavanju podataka.') })
      .finally(() => { setIsLoading(false) })
  }, [organizationId])

  useEffect(() => {
    const handler = (e: MouseEvent): void => {
      if (tzRef.current && !tzRef.current.contains(e.target as Node)) {
        setTzOpen(false)
        setTzSearch(form.timezone)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => { document.removeEventListener('mousedown', handler) }
  }, [form.timezone])

  const filteredTimezones = tzSearch
    ? ALL_TIMEZONES.filter((tz) => tz.toLowerCase().includes(tzSearch.toLowerCase()))
    : ALL_TIMEZONES

  const handleChange = (field: keyof OrgForm) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleTzSelect = (tz: string): void => {
    setForm((prev) => ({ ...prev, timezone: tz }))
    setTzSearch(tz)
    setTzOpen(false)
  }

  const handleCancel = (): void => {
    setForm(saved)
    setTzSearch(saved.timezone)
  }

  const handleSave = async (): Promise<void> => {
    if (!organizationId) return
    setIsSaving(true)
    setError(null)
    try {
      const updated = await organizationsService.update(organizationId, {
        name: form.name || undefined,
        email: form.email || null,
        phone: form.phone || null,
        address: form.address || null,
        city: form.city || null,
        timezone: form.timezone || undefined,
      })
      const newSaved: OrgForm = {
        name: updated.name,
        email: updated.email ?? '',
        phone: updated.phone ?? '',
        address: updated.address ?? '',
        city: updated.city ?? '',
        timezone: updated.timezone,
      }
      setForm(newSaved)
      setSaved(newSaved)
      setTzSearch(newSaved.timezone)
    } catch {
      setError('Greška pri spremanju podataka.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="settings-page">
      <div className="settings-page__hero">
        <h1>Postavke ustanove</h1>
        <p>Upravljajte osnovnim informacijama, kontaktima i postavkama rada ustanove.</p>
      </div>

      {error && <p style={{ color: '#d32f2f', margin: 0 }}>{error}</p>}

      <section className="settings-card" aria-label="Postavke ustanove">
        <div className="settings-card__body">
          <div className="settings-fields-col">
            <h2 className="settings-card__section-title">Osnovne informacije</h2>

            <div className="settings-fields-stack">
              <div className="settings-fields-row settings-fields-row--2">
                <div className="settings-field">
                  <label className="settings-field__label" htmlFor="set-name">
                    Naziv ustanove <span className="settings-required">*</span>
                  </label>
                  <input
                    id="set-name"
                    className="settings-field__input"
                    type="text"
                    value={form.name}
                    onChange={handleChange('name')}
                    disabled={isLoading}
                  />
                </div>

                <div className="settings-field">
                  <span className="settings-field__label">
                    Vremenska zona <span className="settings-required">*</span>
                  </span>
                  <div className="settings-tz-wrapper" ref={tzRef}>
                    <div className="settings-tz-input-row">
                      <input
                        className="settings-field__input settings-tz-input"
                        type="text"
                        value={tzSearch}
                        placeholder="Pretraži vremensku zonu..."
                        disabled={isLoading}
                        onChange={(e) => {
                          setTzSearch(e.target.value)
                          setTzOpen(true)
                        }}
                        onFocus={() => {
                          setTzSearch('')
                          setTzOpen(true)
                        }}
                      />
                      <AppIcon name="chevronDown" />
                    </div>
                    {tzOpen && filteredTimezones.length > 0 && (
                      <ul className="settings-tz-dropdown" role="listbox">
                        {filteredTimezones.map((tz) => (
                          <li
                            key={tz}
                            className={`settings-tz-option${tz === form.timezone ? ' settings-tz-option--active' : ''}`}
                            role="option"
                            aria-selected={tz === form.timezone}
                            onMouseDown={() => { handleTzSelect(tz) }}
                          >
                            {tz}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              <div className="settings-fields-row settings-fields-row--2">
                <div className="settings-field">
                  <label className="settings-field__label" htmlFor="set-email">
                    E-mail <span className="settings-required">*</span>
                  </label>
                  <input
                    id="set-email"
                    className="settings-field__input"
                    type="email"
                    value={form.email}
                    onChange={handleChange('email')}
                    disabled={isLoading}
                  />
                </div>
                <div className="settings-field">
                  <label className="settings-field__label" htmlFor="set-phone">
                    Telefon <span className="settings-required">*</span>
                  </label>
                  <input
                    id="set-phone"
                    className="settings-field__input"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange('phone')}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="settings-fields-row settings-fields-row--2">
                <div className="settings-field">
                  <label className="settings-field__label" htmlFor="set-address">
                    Adresa <span className="settings-required">*</span>
                  </label>
                  <input
                    id="set-address"
                    className="settings-field__input"
                    type="text"
                    value={form.address}
                    onChange={handleChange('address')}
                    disabled={isLoading}
                  />
                </div>
                <div className="settings-field">
                  <label className="settings-field__label" htmlFor="set-city">
                    Grad <span className="settings-required">*</span>
                  </label>
                  <input
                    id="set-city"
                    className="settings-field__input"
                    type="text"
                    value={form.city}
                    onChange={handleChange('city')}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="settings-summary-col">
            <h2 className="settings-card__section-title">Sažetak ustanove</h2>

            <div className="settings-summary-header">
              <div className="settings-summary-logo">
                <AppIcon name="building" />
              </div>
              <div className="settings-summary-header__info">
                <strong>{saved.name || '—'}</strong>
                <em className="settings-status-badge">Aktivna</em>
              </div>
            </div>

            <div className="settings-summary-section">
              <span className="settings-summary-section__title">Kontakt</span>
              <ul className="settings-summary-contact">
                <li>
                  <AppIcon name="mail" />
                  <span>{saved.email || '—'}</span>
                </li>
                <li>
                  <AppIcon name="phone" />
                  <span>{saved.phone || '—'}</span>
                </li>
                <li>
                  <AppIcon name="home" />
                  <span>
                    {saved.address && saved.city
                      ? `${saved.address}, ${saved.city}`
                      : saved.address || saved.city || '—'}
                  </span>
                </li>
              </ul>
            </div>

            <div className="settings-summary-section">
              <span className="settings-summary-section__title">Aktivni moduli</span>
              <div className="settings-module-chips">
                {ACTIVE_MODULES.map((mod) => (
                  <span key={mod.label} className="settings-module-chip">
                    <AppIcon name={mod.icon} />
                    {mod.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="settings-card__actions">
          <button
            className="settings-cancel-btn"
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Odustani
          </button>
          <button
            className="settings-save-btn"
            type="button"
            onClick={() => { void handleSave() }}
            disabled={isLoading || isSaving}
          >
            <AppIcon name="note" />
            {isSaving ? 'Spremanje...' : 'Spremi promjene'}
          </button>
        </div>
      </section>
    </div>
  )
}

// ─── Patient settings ─────────────────────────────────────────────────────────

const toDateInputValue = (raw: string | null | undefined): string => {
  if (!raw) return ''
  return raw.slice(0, 10)
}

const formatDateDisplay = (raw: string): string => {
  const iso = raw.slice(0, 10)
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return raw
  return `${d}-${m}-${y}`
}

interface PatientForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  oib: string
  address: string
  emergencyContactName: string
  emergencyContactPhone: string
}

function PatientSettingsView(): ReactElement {
  const user = useAuthStore((state) => state.user)
  const organizationId = useAuthStore((state) => state.organizationId)

  const toForm = (): PatientForm => ({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    dateOfBirth: toDateInputValue(user?.dateOfBirth),
    oib: user?.oib ?? '',
    address: user?.address ?? '',
    emergencyContactName: user?.emergencyContactName ?? '',
    emergencyContactPhone: user?.emergencyContactPhone ?? '',
  })

  const [form, setForm] = useState<PatientForm>(toForm)
  const [saved, setSaved] = useState<PatientForm>(toForm)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleChange = (field: keyof PatientForm) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleCancel = (): void => {
    setForm(saved)
    setError(null)
    setSuccessMsg(null)
  }

  const handleSave = async (): Promise<void> => {
    if (!user?.userId || !organizationId) return
    setIsSaving(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const updated = await patientsService.update(user.userId, {
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
        email: form.email || null,
        phone: form.phone || null,
        dateOfBirth: form.dateOfBirth || null,
        oib: form.oib || null,
        address: form.address || null,
        emergencyContactName: form.emergencyContactName || null,
        emergencyContactPhone: form.emergencyContactPhone || null,
      })
      const newSaved: PatientForm = {
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email ?? '',
        phone: updated.phone ?? '',
        dateOfBirth: toDateInputValue(updated.dateOfBirth),
        oib: updated.oib ?? '',
        address: updated.address ?? '',
        emergencyContactName: updated.emergencyContactName ?? '',
        emergencyContactPhone: updated.emergencyContactPhone ?? '',
      }
      setForm(newSaved)
      setSaved(newSaved)
      setSuccessMsg('Podaci su uspješno spremljeni.')
    } catch {
      setError('Greška pri spremanju podataka.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="settings-page">
      <div className="settings-page__hero">
        <h1>Moj profil</h1>
        <p>Upravljajte osobnim podacima i kontaktnim informacijama.</p>
      </div>

      {error && <p style={{ color: '#d32f2f', margin: 0 }}>{error}</p>}
      {successMsg && <p style={{ color: '#1a7f37', margin: 0 }}>{successMsg}</p>}

      <section className="settings-card" aria-label="Osobni podaci">
        <div className="settings-card__body">
          <div className="settings-fields-col">
            <h2 className="settings-card__section-title">Osobni podaci</h2>
            <div className="settings-fields-stack">
              <div className="settings-fields-row settings-fields-row--2">
                <div className="settings-field">
                  <label className="settings-field__label" htmlFor="pat-firstName">
                    Ime <span className="settings-required">*</span>
                  </label>
                  <input
                    id="pat-firstName"
                    className="settings-field__input"
                    type="text"
                    value={form.firstName}
                    onChange={handleChange('firstName')}
                  />
                </div>
                <div className="settings-field">
                  <label className="settings-field__label" htmlFor="pat-lastName">
                    Prezime <span className="settings-required">*</span>
                  </label>
                  <input
                    id="pat-lastName"
                    className="settings-field__input"
                    type="text"
                    value={form.lastName}
                    onChange={handleChange('lastName')}
                  />
                </div>
              </div>

              <div className="settings-fields-row settings-fields-row--2">
                <div className="settings-field">
                  <label className="settings-field__label" htmlFor="pat-dob">
                    Datum rođenja
                  </label>
                  <input
                    id="pat-dob"
                    className="settings-field__input"
                    type="date"
                    value={form.dateOfBirth}
                    onChange={handleChange('dateOfBirth')}
                  />
                </div>
                <div className="settings-field">
                  <label className="settings-field__label" htmlFor="pat-oib">
                    OIB
                  </label>
                  <input
                    id="pat-oib"
                    className="settings-field__input"
                    type="text"
                    value={form.oib}
                    onChange={handleChange('oib')}
                  />
                </div>
              </div>

              <h2 className="settings-card__section-title">Kontakt</h2>

              <div className="settings-fields-row settings-fields-row--2">
                <div className="settings-field">
                  <label className="settings-field__label" htmlFor="pat-email">
                    E-mail
                  </label>
                  <input
                    id="pat-email"
                    className="settings-field__input"
                    type="email"
                    value={form.email}
                    onChange={handleChange('email')}
                  />
                </div>
                <div className="settings-field">
                  <label className="settings-field__label" htmlFor="pat-phone">
                    Telefon
                  </label>
                  <input
                    id="pat-phone"
                    className="settings-field__input"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange('phone')}
                  />
                </div>
              </div>

              <div className="settings-field">
                <label className="settings-field__label" htmlFor="pat-address">
                  Adresa
                </label>
                <input
                  id="pat-address"
                  className="settings-field__input"
                  type="text"
                  value={form.address}
                  onChange={handleChange('address')}
                />
              </div>

              <h2 className="settings-card__section-title">Hitni kontakt</h2>

              <div className="settings-fields-row settings-fields-row--2">
                <div className="settings-field">
                  <label className="settings-field__label" htmlFor="pat-ecName">
                    Ime i prezime
                  </label>
                  <input
                    id="pat-ecName"
                    className="settings-field__input"
                    type="text"
                    value={form.emergencyContactName}
                    onChange={handleChange('emergencyContactName')}
                  />
                </div>
                <div className="settings-field">
                  <label className="settings-field__label" htmlFor="pat-ecPhone">
                    Telefon
                  </label>
                  <input
                    id="pat-ecPhone"
                    className="settings-field__input"
                    type="tel"
                    value={form.emergencyContactPhone}
                    onChange={handleChange('emergencyContactPhone')}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="settings-summary-col">
            <h2 className="settings-card__section-title">Sažetak profila</h2>

            <div className="settings-summary-header">
              <div className="settings-summary-logo">
                <AppIcon name="user" />
              </div>
              <div className="settings-summary-header__info">
                <strong>
                  {saved.firstName && saved.lastName
                    ? `${saved.firstName} ${saved.lastName}`
                    : saved.firstName || saved.lastName || '—'}
                </strong>
                <em className="settings-status-badge">Pacijent</em>
              </div>
            </div>

            <div className="settings-summary-section">
              <span className="settings-summary-section__title">Kontakt</span>
              <ul className="settings-summary-contact">
                <li>
                  <AppIcon name="mail" />
                  <span>{saved.email || '—'}</span>
                </li>
                <li>
                  <AppIcon name="phone" />
                  <span>{saved.phone || '—'}</span>
                </li>
                <li>
                  <AppIcon name="home" />
                  <span>{saved.address || '—'}</span>
                </li>
              </ul>
            </div>

            <div className="settings-summary-section">
              <span className="settings-summary-section__title">Osobni podaci</span>
              <ul className="settings-summary-contact">
                <li>
                  <AppIcon name="calendar" />
                  <span>{saved.dateOfBirth ? formatDateDisplay(saved.dateOfBirth) : '—'}</span>
                </li>
                <li>
                  <AppIcon name="clipboard" />
                  <span>OIB: {saved.oib || '—'}</span>
                </li>
              </ul>
            </div>

            {(saved.emergencyContactName || saved.emergencyContactPhone) && (
              <div className="settings-summary-section">
                <span className="settings-summary-section__title">Hitni kontakt</span>
                <ul className="settings-summary-contact">
                  <li>
                    <AppIcon name="user" />
                    <span>{saved.emergencyContactName || '—'}</span>
                  </li>
                  <li>
                    <AppIcon name="phone" />
                    <span>{saved.emergencyContactPhone || '—'}</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="settings-card__actions">
          <button
            className="settings-cancel-btn"
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Odustani
          </button>
          <button
            className="settings-save-btn"
            type="button"
            onClick={() => { void handleSave() }}
            disabled={isSaving}
          >
            <AppIcon name="note" />
            {isSaving ? 'Spremanje...' : 'Spremi promjene'}
          </button>
        </div>
      </section>
    </div>
  )
}

// ─── Doctor settings ──────────────────────────────────────────────────────────

interface DoctorForm {
  firstName: string
  lastName: string
  title: string
  bio: string
}

function DoctorSettingsView(): ReactElement {
  const [form, setForm] = useState<DoctorForm>({ firstName: '', lastName: '', title: '', bio: '' })
  const [saved, setSaved] = useState<DoctorForm>({ firstName: '', lastName: '', title: '', bio: '' })
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    doctorsService
      .getSelf()
      .then((doc) => {
        const loaded: DoctorForm = {
          firstName: doc.firstName,
          lastName: doc.lastName,
          title: doc.title ?? '',
          bio: doc.bio ?? '',
        }
        setForm(loaded)
        setSaved(loaded)
        setEmail(doc.email ?? '')
        setPhone(doc.phone ?? '')
        setLicenseNumber(doc.licenseNumber ?? '')
      })
      .catch(() => { setError('Greška pri učitavanju podataka.') })
      .finally(() => { setIsLoading(false) })
  }, [])

  const handleChange = (field: keyof DoctorForm) => (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleCancel = (): void => {
    setForm(saved)
    setError(null)
    setSuccessMsg(null)
  }

  const handleSave = async (): Promise<void> => {
    setIsSaving(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const updated = await doctorsService.updateSelf({
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
        title: form.title || null,
        bio: form.bio || null,
      })
      const newSaved: DoctorForm = {
        firstName: updated.firstName,
        lastName: updated.lastName,
        title: updated.title ?? '',
        bio: updated.bio ?? '',
      }
      setForm(newSaved)
      setSaved(newSaved)
      setSuccessMsg('Podaci su uspješno spremljeni.')
    } catch {
      setError('Greška pri spremanju podataka.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="settings-page">
      <div className="settings-page__hero">
        <h1>Moj profil</h1>
        <p>Upravljajte profilnim podacima i životopisom.</p>
      </div>

      {error && <p style={{ color: '#d32f2f', margin: 0 }}>{error}</p>}
      {successMsg && <p style={{ color: '#1a7f37', margin: 0 }}>{successMsg}</p>}

      <section className="settings-card" aria-label="Profilni podaci">
        <div className="settings-card__body">
          <div className="settings-fields-col">
            <h2 className="settings-card__section-title">Profilni podaci</h2>
            <div className="settings-fields-stack">
              <div className="settings-fields-row settings-fields-row--2">
                <div className="settings-field">
                  <label className="settings-field__label" htmlFor="doc-firstName">
                    Ime <span className="settings-required">*</span>
                  </label>
                  <input
                    id="doc-firstName"
                    className="settings-field__input"
                    type="text"
                    value={form.firstName}
                    onChange={handleChange('firstName')}
                    disabled={isLoading}
                  />
                </div>
                <div className="settings-field">
                  <label className="settings-field__label" htmlFor="doc-lastName">
                    Prezime <span className="settings-required">*</span>
                  </label>
                  <input
                    id="doc-lastName"
                    className="settings-field__input"
                    type="text"
                    value={form.lastName}
                    onChange={handleChange('lastName')}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="settings-field">
                <label className="settings-field__label" htmlFor="doc-title">
                  Titula / specijalnost
                </label>
                <input
                  id="doc-title"
                  className="settings-field__input"
                  type="text"
                  placeholder="npr. dr. med., spec. kardiologije"
                  value={form.title}
                  onChange={handleChange('title')}
                  disabled={isLoading}
                />
              </div>

              <div className="settings-field">
                <label className="settings-field__label" htmlFor="doc-bio">
                  Kratki životopis
                </label>
                <textarea
                  id="doc-bio"
                  className="settings-field__textarea"
                  placeholder="Kratki opis vašeg iskustva i specijalnosti..."
                  value={form.bio}
                  onChange={handleChange('bio')}
                  disabled={isLoading}
                  rows={4}
                />
              </div>

              <h2 className="settings-card__section-title">Kontakt</h2>
              <p className="settings-field__hint">
                Za promjenu kontaktnih podataka, obratite se administratoru.
              </p>

              <div className="settings-fields-row settings-fields-row--2">
                <div className="settings-field">
                  <label className="settings-field__label" htmlFor="doc-email">
                    E-mail
                  </label>
                  <input
                    id="doc-email"
                    className="settings-field__input"
                    type="email"
                    value={email}
                    disabled
                    readOnly
                  />
                </div>
                <div className="settings-field">
                  <label className="settings-field__label" htmlFor="doc-phone">
                    Telefon
                  </label>
                  <input
                    id="doc-phone"
                    className="settings-field__input"
                    type="tel"
                    value={phone}
                    disabled
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="settings-summary-col">
            <h2 className="settings-card__section-title">Sažetak profila</h2>

            <div className="settings-summary-header">
              <div className="settings-summary-logo">
                <AppIcon name="stethoscope" />
              </div>
              <div className="settings-summary-header__info">
                <strong>
                  {saved.firstName && saved.lastName
                    ? `${saved.firstName} ${saved.lastName}`
                    : saved.firstName || saved.lastName || '—'}
                </strong>
                <em className="settings-status-badge">Liječnik</em>
              </div>
            </div>

            {saved.title && (
              <div className="settings-summary-section">
                <span className="settings-summary-section__title">Specijalnost</span>
                <ul className="settings-summary-contact">
                  <li>
                    <AppIcon name="heartPulse" />
                    <span>{saved.title}</span>
                  </li>
                </ul>
              </div>
            )}

            <div className="settings-summary-section">
              <span className="settings-summary-section__title">Kontakt</span>
              <ul className="settings-summary-contact">
                <li>
                  <AppIcon name="mail" />
                  <span>{email || '—'}</span>
                </li>
                <li>
                  <AppIcon name="phone" />
                  <span>{phone || '—'}</span>
                </li>
              </ul>
            </div>

            {licenseNumber && (
              <div className="settings-summary-section">
                <span className="settings-summary-section__title">Licenca</span>
                <ul className="settings-summary-contact">
                  <li>
                    <AppIcon name="shieldCheck" />
                    <span>{licenseNumber}</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="settings-card__actions">
          <button
            className="settings-cancel-btn"
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Odustani
          </button>
          <button
            className="settings-save-btn"
            type="button"
            onClick={() => { void handleSave() }}
            disabled={isLoading || isSaving}
          >
            <AppIcon name="note" />
            {isSaving ? 'Spremanje...' : 'Spremi promjene'}
          </button>
        </div>
      </section>
    </div>
  )
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

function SettingsPage(): ReactElement {
  const role = useAuthStore((state) => state.role)

  if (role === OrganizationUserRole.PATIENT) return <PatientSettingsView />
  if (role === OrganizationUserRole.DOCTOR) return <DoctorSettingsView />
  return <OrgSettingsView />
}

export { SettingsPage }
