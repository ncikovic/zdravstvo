import { useState } from 'react'
import type { ReactElement } from 'react'

import { useAuthStore } from '@/stores/auth/auth.store'

function ProfilePage(): ReactElement {
  const user = useAuthStore((s) => s.user)

  const [fontScale, setFontScale] = useState<number>(() => {
    const stored = localStorage.getItem('a11y-font-scale')
    return stored ? parseFloat(stored) : 1
  })
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('a11y-high-contrast') === 'true'
  })
  const [simpleMode, setSimpleMode] = useState<boolean>(() => {
    return localStorage.getItem('a11y-simple-mode') === 'true'
  })

  const applyFontScale = (value: number): void => {
    setFontScale(value)
    localStorage.setItem('a11y-font-scale', String(value))
    document.documentElement.style.fontSize = `${value * 100}%`
  }

  const applyHighContrast = (value: boolean): void => {
    setHighContrast(value)
    localStorage.setItem('a11y-high-contrast', String(value))
    document.documentElement.classList.toggle('high-contrast', value)
  }

  const applySimpleMode = (value: boolean): void => {
    setSimpleMode(value)
    localStorage.setItem('a11y-simple-mode', String(value))
    document.documentElement.classList.toggle('simple-mode', value)
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '640px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Moj profil</h1>
        <p style={{ margin: '0.25rem 0 0', color: '#666' }}>Vaši podaci i postavke pristupačnosti.</p>
      </div>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#374151' }}>
          Osobni podaci
        </h2>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem' }}>
          {user ? (
            <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.5rem 1.5rem' }}>
              <dt style={{ fontWeight: 600, color: '#374151' }}>Ime i prezime</dt>
              <dd style={{ margin: 0, color: '#555' }}>{user.firstName} {user.lastName}</dd>
              <dt style={{ fontWeight: 600, color: '#374151' }}>E-pošta</dt>
              <dd style={{ margin: 0, color: '#555' }}>{user.email}</dd>
            </dl>
          ) : (
            <p style={{ margin: 0, color: '#9ca3af' }}>Podaci o korisniku nisu dostupni.</p>
          )}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#374151' }}>
          Postavke pristupačnosti
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem' }}>
            <label htmlFor="font-scale" style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>
              Veličina teksta
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input
                id="font-scale"
                type="range"
                min="0.8"
                max="1.5"
                step="0.1"
                value={fontScale}
                onChange={(e) => applyFontScale(parseFloat(e.target.value))}
                style={{ flex: 1 }}
                aria-valuetext={`${Math.round(fontScale * 100)}%`}
              />
              <span style={{ fontWeight: 600, color: '#374151', minWidth: '3rem' }}>
                {Math.round(fontScale * 100)}%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              <span>Manje</span>
              <span>Standardno</span>
              <span>Veće</span>
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 500 }}>Visoki kontrast</div>
              <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.15rem' }}>
                Povećava kontrast boja za bolju čitljivost
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={highContrast}
              onClick={() => applyHighContrast(!highContrast)}
              style={{
                width: '3rem',
                height: '1.5rem',
                borderRadius: '12px',
                border: 'none',
                background: highContrast ? '#2563eb' : '#d1d5db',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.2s',
                flexShrink: 0,
              }}
              aria-label="Visoki kontrast"
            >
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  left: highContrast ? 'calc(100% - 1.25rem)' : '2px',
                  width: '1.125rem',
                  height: '1.125rem',
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.2s',
                }}
              />
            </button>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 500 }}>Jednostavni prikaz</div>
              <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.15rem' }}>
                Smanjuje vizualnu složenost sučelja
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={simpleMode}
              onClick={() => applySimpleMode(!simpleMode)}
              style={{
                width: '3rem',
                height: '1.5rem',
                borderRadius: '12px',
                border: 'none',
                background: simpleMode ? '#2563eb' : '#d1d5db',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.2s',
                flexShrink: 0,
              }}
              aria-label="Jednostavni prikaz"
            >
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  left: simpleMode ? 'calc(100% - 1.25rem)' : '2px',
                  width: '1.125rem',
                  height: '1.125rem',
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.2s',
                }}
              />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              applyFontScale(1)
              applyHighContrast(false)
              applySimpleMode(false)
            }}
            style={{
              alignSelf: 'flex-start',
              padding: '0.5rem 1rem',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              background: '#fff',
              cursor: 'pointer',
              color: '#666',
              fontSize: '0.875rem',
            }}
          >
            Vrati na zadane postavke
          </button>
        </div>
      </section>
    </div>
  )
}

export { ProfilePage }
