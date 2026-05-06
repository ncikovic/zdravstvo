import { useState } from 'react'
import type { ReactElement } from 'react'

import { AppIcon } from '@/components'
import type { AppIconName } from '@/types'

import './settings.css'

type SettingsTab = 'general' | 'contact'

interface ActiveModule {
  readonly label: string
  readonly icon: AppIconName
}

interface QuickLink {
  readonly icon: AppIconName
  readonly title: string
  readonly description: string
}

const MOCK_FORM = {
  name: 'Poliklinika Medica Zagreb',
  oib: '12345678901',
  email: 'info@medicazagreb.hr',
  phone: '01 1234 567',
  address: 'Ulica grada Vukovara 269d',
  city: 'Zagreb',
  postalCode: '10000',
  description:
    'Poliklinika Medica Zagreb pruža specijalizacijske zdravstvene usluge uz primjenu suvremene medicinske opreme i visokih standarda kvalitete.',
  website: 'www.medicazagreb.hr',
  country: 'Hrvatska',
} as const

const ACTIVE_MODULES: readonly ActiveModule[] = [
  { label: 'Termini', icon: 'calendar' },
  { label: 'Liječnici', icon: 'users' },
  { label: 'Pacijenti', icon: 'patients' },
  { label: 'Podsjetnici', icon: 'bell' },
  { label: 'Online rezervacije', icon: 'checkCircle' },
]

const QUICK_LINKS: readonly QuickLink[] = [
  {
    icon: 'bell',
    title: 'Uredi obavijesti',
    description: 'Upravljajte porukama i podsjetnicima pacijentima',
  },
  {
    icon: 'settings',
    title: 'Postavi integracije',
    description: 'Povežite sustav s vanjskim servisima',
  },
  {
    icon: 'shield',
    title: 'Provjeri sigurnost',
    description: 'Pregledajte postavke pristupa i aktivnosti',
  },
]

function SettingsPage(): ReactElement {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const [onlineBooking, setOnlineBooking] = useState(true)

  return (
    <div className="settings-page">
      <div className="settings-page__hero">
        <h1>Postavke ustanove</h1>
        <p>Upravljajte osnovnim informacijama, kontaktima i postavkama rada ustanove.</p>
      </div>

      <div className="settings-content-grid">
        <section className="settings-card" aria-label="Postavke ustanove">
          <nav className="settings-tabs" aria-label="Sekcije postavki">
            <button
              className={`settings-tab${activeTab === 'general' ? ' settings-tab--active' : ''}`}
              type="button"
              onClick={() => { setActiveTab('general') }}
            >
              <AppIcon name="building" />
              Opći podaci
            </button>
            <button
              className={`settings-tab${activeTab === 'contact' ? ' settings-tab--active' : ''}`}
              type="button"
              onClick={() => { setActiveTab('contact') }}
            >
              <AppIcon name="home" />
              Kontakt i lokacija
            </button>
          </nav>

          {activeTab === 'general' && (
            <>
              <div className="settings-card__section">
                <h2 className="settings-card__section-title">Osnovne informacije</h2>

                <div className="settings-info-layout">
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
                          defaultValue={MOCK_FORM.name}
                          readOnly
                        />
                      </div>
                      <div className="settings-field">
                        <label className="settings-field__label" htmlFor="set-oib">
                          OIB <span className="settings-required">*</span>
                        </label>
                        <input
                          id="set-oib"
                          className="settings-field__input"
                          type="text"
                          defaultValue={MOCK_FORM.oib}
                          readOnly
                        />
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
                          defaultValue={MOCK_FORM.email}
                          readOnly
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
                          defaultValue={MOCK_FORM.phone}
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="settings-field">
                      <label className="settings-field__label" htmlFor="set-address">
                        Adresa <span className="settings-required">*</span>
                      </label>
                      <input
                        id="set-address"
                        className="settings-field__input"
                        type="text"
                        defaultValue={MOCK_FORM.address}
                        readOnly
                      />
                    </div>

                    <div className="settings-fields-row settings-fields-row--2">
                      <div className="settings-field">
                        <label className="settings-field__label" htmlFor="set-city">
                          Grad <span className="settings-required">*</span>
                        </label>
                        <input
                          id="set-city"
                          className="settings-field__input"
                          type="text"
                          defaultValue={MOCK_FORM.city}
                          readOnly
                        />
                      </div>
                      <div className="settings-field">
                        <label className="settings-field__label" htmlFor="set-postal">
                          Poštanski broj <span className="settings-required">*</span>
                        </label>
                        <input
                          id="set-postal"
                          className="settings-field__input"
                          type="text"
                          defaultValue={MOCK_FORM.postalCode}
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="settings-field">
                      <label className="settings-field__label" htmlFor="set-description">
                        Opis ustanove
                      </label>
                      <textarea
                        id="set-description"
                        className="settings-field__textarea"
                        defaultValue={MOCK_FORM.description}
                        rows={4}
                        maxLength={500}
                        readOnly
                      />
                      <span className="settings-field__count">121 / 500</span>
                    </div>
                  </div>

                  <div className="settings-logo-area">
                    <span className="settings-logo-area__label">Logo ustanove</span>
                    <div className="settings-logo-preview">
                      <div className="settings-logo-icon-box">
                        <AppIcon name="building" />
                        <span>POLIKLINIKA</span>
                        <span>MEDICA ZAGREB</span>
                      </div>
                      <button className="settings-logo-upload-btn" type="button">
                        <AppIcon name="plus" />
                        Promijeni logo
                      </button>
                      <p className="settings-logo-hint">PNG, JPG ili SVG, maksimalno 2 MB</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-card__divider" />

              <div className="settings-card__section">
                <h2 className="settings-card__section-title">Zadane postavke rada</h2>

                <div className="settings-work-grid">
                  <div className="settings-field">
                    <span className="settings-field__label">
                      Radno vrijeme prijema <span className="settings-required">*</span>
                    </span>
                    <div className="settings-select-like" role="button" tabIndex={0}>
                      08:00 – 16:00
                      <AppIcon name="chevronDown" />
                    </div>
                  </div>

                  <div className="settings-field settings-field--toggle">
                    <div className="settings-field__toggle-header">
                      <span className="settings-field__label">Omogući online rezervacije</span>
                      <button
                        className={`settings-toggle${onlineBooking ? ' settings-toggle--on' : ''}`}
                        type="button"
                        role="switch"
                        aria-checked={onlineBooking}
                        aria-label="Omogući online rezervacije"
                        onClick={() => { setOnlineBooking((v) => !v) }}
                      />
                    </div>
                    <p className="settings-field__hint">
                      <AppIcon name="info" />
                      Omogućite pacijentima online rezervaciju termina.
                    </p>
                  </div>

                  <div className="settings-field">
                    <span className="settings-field__label">Zadani podsjetnici</span>
                    <div className="settings-chips-select">
                      <div className="settings-chips-select__chips">
                        <span className="settings-chip">24 h prije</span>
                        <span className="settings-chip">2 h prije</span>
                      </div>
                      <AppIcon name="chevronDown" />
                    </div>
                  </div>

                  <div className="settings-field">
                    <span className="settings-field__label">
                      Vremenska zona <span className="settings-required">*</span>
                    </span>
                    <div className="settings-select-like" role="button" tabIndex={0}>
                      Europe/Zagreb (GMT+02:00)
                      <AppIcon name="chevronDown" />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'contact' && (
            <>
              <div className="settings-card__section">
                <h2 className="settings-card__section-title">Kontakt informacije</h2>

                <div className="settings-fields-stack">
                  <div className="settings-fields-row settings-fields-row--2">
                    <div className="settings-field">
                      <label className="settings-field__label" htmlFor="cnt-phone">
                        Telefon <span className="settings-required">*</span>
                      </label>
                      <input
                        id="cnt-phone"
                        className="settings-field__input"
                        type="tel"
                        defaultValue={MOCK_FORM.phone}
                        readOnly
                      />
                    </div>
                    <div className="settings-field">
                      <label className="settings-field__label" htmlFor="cnt-email">
                        E-mail <span className="settings-required">*</span>
                      </label>
                      <input
                        id="cnt-email"
                        className="settings-field__input"
                        type="email"
                        defaultValue={MOCK_FORM.email}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="settings-field">
                    <label className="settings-field__label" htmlFor="cnt-website">
                      Web stranica
                    </label>
                    <input
                      id="cnt-website"
                      className="settings-field__input"
                      type="url"
                      defaultValue={MOCK_FORM.website}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="settings-card__divider" />

              <div className="settings-card__section">
                <h2 className="settings-card__section-title">Lokacija</h2>

                <div className="settings-fields-stack">
                  <div className="settings-field">
                    <label className="settings-field__label" htmlFor="cnt-address">
                      Adresa <span className="settings-required">*</span>
                    </label>
                    <input
                      id="cnt-address"
                      className="settings-field__input"
                      type="text"
                      defaultValue={MOCK_FORM.address}
                      readOnly
                    />
                  </div>

                  <div className="settings-fields-row settings-fields-row--3">
                    <div className="settings-field">
                      <label className="settings-field__label" htmlFor="cnt-city">
                        Grad <span className="settings-required">*</span>
                      </label>
                      <input
                        id="cnt-city"
                        className="settings-field__input"
                        type="text"
                        defaultValue={MOCK_FORM.city}
                        readOnly
                      />
                    </div>
                    <div className="settings-field">
                      <label className="settings-field__label" htmlFor="cnt-postal">
                        Poštanski broj <span className="settings-required">*</span>
                      </label>
                      <input
                        id="cnt-postal"
                        className="settings-field__input"
                        type="text"
                        defaultValue={MOCK_FORM.postalCode}
                        readOnly
                      />
                    </div>
                    <div className="settings-field">
                      <label className="settings-field__label" htmlFor="cnt-country">
                        Država
                      </label>
                      <input
                        id="cnt-country"
                        className="settings-field__input"
                        type="text"
                        defaultValue={MOCK_FORM.country}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="settings-card__actions">
            <button className="settings-cancel-btn" type="button">
              Odustani
            </button>
            <button className="settings-save-btn" type="button">
              <AppIcon name="note" />
              Spremi promjene
            </button>
          </div>
        </section>

        <aside className="settings-sidebar" aria-label="Sažetak i brze poveznice">
          <div className="settings-summary-card">
            <h3 className="settings-summary-card__title">Sažetak ustanove</h3>

            <div className="settings-summary-header">
              <div className="settings-summary-logo">
                <AppIcon name="building" />
              </div>
              <div className="settings-summary-header__info">
                <strong>Poliklinika Medica Zagreb</strong>
                <em className="settings-status-badge">Aktivna</em>
              </div>
            </div>

            <div className="settings-summary-section">
              <span className="settings-summary-section__title">Kontakt</span>
              <ul className="settings-summary-contact">
                <li>
                  <AppIcon name="mail" />
                  <span>info@medicazagreb.hr</span>
                </li>
                <li>
                  <AppIcon name="phone" />
                  <span>01 1234 567</span>
                </li>
                <li>
                  <AppIcon name="home" />
                  <span>Ulica grada Vukovara 269d, 10000 Zagreb</span>
                </li>
              </ul>
            </div>

            <div className="settings-summary-section">
              <span className="settings-summary-section__title">Aktivni moduli</span>
              <div className="settings-module-chips">
                {ACTIVE_MODULES.map((mod) => (
                  <span
                    key={mod.label}
                    className="settings-module-chip"
                  >
                    <AppIcon name={mod.icon} />
                    {mod.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="settings-summary-stats">
              <div>
                <AppIcon name="users" />
                <div>
                  <strong>42</strong>
                  <span>Članova tima</span>
                </div>
              </div>
              <div>
                <AppIcon name="patients" />
                <div>
                  <strong>3.842</strong>
                  <span>Registrirani pacijenti</span>
                </div>
              </div>
            </div>
          </div>

          <div className="settings-quick-links-card">
            <h3 className="settings-quick-links-card__title">Brze poveznice</h3>
            <ul className="settings-quick-links">
              {QUICK_LINKS.map((link) => (
                <li key={link.title} className="settings-quick-link">
                  <div className="settings-quick-link__icon-box">
                    <AppIcon name={link.icon} />
                  </div>
                  <div className="settings-quick-link__text">
                    <strong>{link.title}</strong>
                    <span>{link.description}</span>
                  </div>
                  <AppIcon name="chevronRight" />
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}

export { SettingsPage }
