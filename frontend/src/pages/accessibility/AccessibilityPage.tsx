import type { ReactElement } from 'react'

import { useEffect, useState } from 'react'

import { AppIcon } from '@/components'
import { useAccessibility } from '@/contexts/AccessibilityContext'
import { hasCroatianVoice, isSpeechSupported, speakText } from '@/utils/accessibility'

import './accessibility-page.css'

interface ToggleProps {
  id: string
  checked: boolean
  onChange: (value: boolean) => void
  ariaLabel: string
}

function Toggle({ id, checked, onChange, ariaLabel }: ToggleProps): ReactElement {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      className={`a11y-toggle${checked ? ' a11y-toggle--on' : ''}`}
      onClick={() => { onChange(!checked) }}
    >
      <span className="a11y-toggle__track">
        <span className="a11y-toggle__thumb" />
      </span>
      <span className="a11y-toggle__label">{checked ? 'Uključeno' : 'Isključeno'}</span>
    </button>
  )
}

function AccessibilityPage(): ReactElement {
  const { prefs, updatePref, resetPrefs } = useAccessibility()
  const speechSupported = isSpeechSupported()
  const [croatianVoiceAvailable, setCroatianVoiceAvailable] = useState(false)

  useEffect(() => {
    if (!speechSupported) return
    // Voices may load asynchronously (Chrome); check after voiceschanged too.
    const check = (): void => { setCroatianVoiceAvailable(hasCroatianVoice()) }
    check()
    window.speechSynthesis.addEventListener('voiceschanged', check)
    return () => { window.speechSynthesis.removeEventListener('voiceschanged', check) }
  }, [speechSupported])

  const handleReadPage = (): void => {
    const main = document.querySelector('main')
    const text =
      main?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 400) ??
      'Nema sadržaja za čitanje.'
    speakText(text)
  }

  return (
    <div className="a11y-page">
      <div className="a11y-page__hero">
        <h1>Postavke pristupačnosti</h1>
        <p>
          Prilagodite prikaz i ponašanje aplikacije prema vašim potrebama. Sve promjene se
          automatski primjenjuju i čuvaju.
        </p>
      </div>

      <div className="a11y-page__body">
        <div className="a11y-settings-col">

          {/* Font Size */}
          <section className="a11y-card" aria-labelledby="font-size-heading">
            <div className="a11y-card__header">
              <div className="a11y-card__icon">
                <AppIcon name="info" />
              </div>
              <div>
                <h2 id="font-size-heading" className="a11y-card__title">Veličina teksta</h2>
                <p className="a11y-card__desc">
                  Povećajte veličinu teksta u cijeloj aplikaciji za lakše čitanje.
                </p>
              </div>
            </div>

            <fieldset className="a11y-radio-group" aria-labelledby="font-size-heading">
              <legend className="sr-only">Odaberite veličinu teksta</legend>

              {(
                [
                  { value: 'normal', label: 'Normalna', desc: '16px — zadana veličina' },
                  { value: 'large', label: 'Velika', desc: '20px — povećani tekst' },
                  { value: 'xl', label: 'Vrlo velika', desc: '24px — maksimalno povećanje' },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.value}
                  className={`a11y-radio-option${prefs.fontSize === opt.value ? ' a11y-radio-option--active' : ''}`}
                >
                  <input
                    type="radio"
                    name="fontSize"
                    value={opt.value}
                    checked={prefs.fontSize === opt.value}
                    onChange={() => { updatePref('fontSize', opt.value) }}
                    className="sr-only"
                    aria-describedby={`font-size-desc-${opt.value}`}
                  />
                  <span className="a11y-radio-option__check" aria-hidden="true" />
                  <span className="a11y-radio-option__body">
                    <strong className="a11y-radio-option__label">{opt.label}</strong>
                    <span id={`font-size-desc-${opt.value}`} className="a11y-radio-option__desc">
                      {opt.desc}
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>
          </section>

          {/* High Contrast */}
          <section className="a11y-card" aria-labelledby="contrast-heading">
            <div className="a11y-card__header">
              <div className="a11y-card__icon">
                <AppIcon name="shield" />
              </div>
              <div className="a11y-card__header-text">
                <h2 id="contrast-heading" className="a11y-card__title">Visoki kontrast</h2>
                <p className="a11y-card__desc">
                  Crna pozadina s bijelim tekstom i žutim naglascima za bolju vidljivost.
                </p>
              </div>
              <Toggle
                id="toggle-contrast"
                checked={prefs.highContrast}
                onChange={(v) => { updatePref('highContrast', v) }}
                ariaLabel="Uključi visoki kontrast"
              />
            </div>
          </section>

          {/* Simplified View */}
          <section className="a11y-card" aria-labelledby="simplified-heading">
            <div className="a11y-card__header">
              <div className="a11y-card__icon">
                <AppIcon name="dashboard" />
              </div>
              <div className="a11y-card__header-text">
                <h2 id="simplified-heading" className="a11y-card__title">Pojednostavljen prikaz</h2>
                <p className="a11y-card__desc">
                  Veće tipke, više razmaka i manji broj ukrasnih elemenata za preglednost.
                </p>
              </div>
              <Toggle
                id="toggle-simplified"
                checked={prefs.simplifiedView}
                onChange={(v) => { updatePref('simplifiedView', v) }}
                ariaLabel="Uključi pojednostavljen prikaz"
              />
            </div>
          </section>

          {/* Voice Readout */}
          <section className="a11y-card" aria-labelledby="voice-heading">
            <div className="a11y-card__header">
              <div className="a11y-card__icon">
                <AppIcon name="headphones" />
              </div>
              <div className="a11y-card__header-text">
                <h2 id="voice-heading" className="a11y-card__title">Glasovno čitanje</h2>
                <p className="a11y-card__desc">
                  Aplikacija čita naslove stranica, poruke o potvrdi termina i obavijesti o
                  pogreškama naglas.
                </p>
              </div>
              {speechSupported ? (
                <Toggle
                  id="toggle-voice"
                  checked={prefs.voiceReadout}
                  onChange={(v) => { updatePref('voiceReadout', v) }}
                  ariaLabel="Uključi glasovno čitanje"
                />
              ) : (
                <span className="a11y-unsupported-badge">Nije podržano u ovom pregledniku</span>
              )}
            </div>

            {speechSupported && (
              <div className="a11y-voice-actions">
                <button
                  type="button"
                  className="a11y-read-btn"
                  aria-label="Pročitaj sadržaj trenutne stranice naglas"
                  onClick={handleReadPage}
                  disabled={!prefs.voiceReadout}
                >
                  <AppIcon name="megaphone" />
                  Pročitaj trenutnu stranicu
                </button>
                {!prefs.voiceReadout && (
                  <p className="a11y-voice-hint">
                    Uključite glasovno čitanje kako biste koristili ovu funkciju.
                  </p>
                )}
                {prefs.voiceReadout && !croatianVoiceAvailable && (
                  <p className="a11y-voice-hint a11y-voice-hint--warn">
                    Na ovom uređaju nije pronađen hrvatski glas — čitanje će koristiti zadani
                    glas operacijskog sustava. Za hrvatski, instalirajte hrvatski TTS glas u
                    postavkama vašeg sustava.
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Reset */}
          <div className="a11y-reset-row">
            <button type="button" className="a11y-reset-btn" onClick={resetPrefs}>
              Vrati na zadane postavke
            </button>
          </div>
        </div>

        {/* Live Preview */}
        <aside className="a11y-preview-col" aria-label="Pregled postavki">
          <div className="a11y-preview-card">
            <h2 className="a11y-preview-card__title">Pregled</h2>
            <p className="a11y-preview-card__subtitle">
              Ovako izgleda tekst s trenutnim postavkama.
            </p>

            <div className="a11y-preview-content">
              <div className="a11y-preview-text-block">
                <p className="a11y-preview-sample--normal">Aa — normalni tekst</p>
                <p className="a11y-preview-sample--secondary">
                  Dr. Ivan Horvat • Kardiologija • pon, 10. lipnja u 10:00
                </p>
                <a href="#preview" className="a11y-preview-link" onClick={(e) => { e.preventDefault() }}>
                  Pogledaj termin →
                </a>
              </div>

              <div className="a11y-preview-btn-row">
                <button type="button" className="a11y-preview-btn a11y-preview-btn--primary">
                  Rezerviraj termin
                </button>
                <button type="button" className="a11y-preview-btn a11y-preview-btn--secondary">
                  Otkaži
                </button>
              </div>
            </div>

            <div className="a11y-preview-badges">
              {prefs.fontSize !== 'normal' && (
                <span className="a11y-badge">
                  Tekst: {prefs.fontSize === 'large' ? 'Velika' : 'Vrlo velika'}
                </span>
              )}
              {prefs.highContrast && (
                <span className="a11y-badge a11y-badge--contrast">Visoki kontrast</span>
              )}
              {prefs.simplifiedView && (
                <span className="a11y-badge a11y-badge--simplified">Pojednostavljen</span>
              )}
              {prefs.voiceReadout && (
                <span className="a11y-badge a11y-badge--voice">Glasovno čitanje</span>
              )}
              {prefs.fontSize === 'normal' &&
                !prefs.highContrast &&
                !prefs.simplifiedView &&
                !prefs.voiceReadout && (
                  <span className="a11y-badge a11y-badge--default">Zadane postavke</span>
                )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export { AccessibilityPage }
