import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, ReactElement } from 'react'

import { AppIcon } from '@/components'
import { useAuthStore } from '@/stores'
import { organizationsService } from '@/services'
import type { AppIconName } from '@/types'

import './settings.css'

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

const EMPTY_FORM: OrgForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  timezone: '',
}

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

function SettingsPage(): ReactElement {
  const [form, setForm] = useState<OrgForm>(EMPTY_FORM)
  const [saved, setSaved] = useState<OrgForm>(EMPTY_FORM)
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

export { SettingsPage }
