import type { ReactElement } from 'react'

import { useAuthStore } from '@/stores'

export function HomePage(): ReactElement {
  const user = useAuthStore((state) => state.user)
  const role = useAuthStore((state) => state.role)
  const organizationId = useAuthStore((state) => state.organizationId)
  const clearAuth = useAuthStore((state) => state.clearAuth)

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">zdravstvo</p>
        <h1>
          {user
            ? `Pozdrav, ${user.firstName}.`
            : 'Frontend skeleton is ready.'}
        </h1>
        <p>
          {user
            ? 'Uspjesno ste prijavljeni i organizacijski kontekst je aktivan.'
            : 'Prijavite se kako biste nastavili prema zasticenim funkcionalnostima.'}
        </p>

        {user && role && organizationId ? (
          <div className="session-summary">
            <p>
              Uloga: <strong>{role}</strong>
            </p>
            <p>
              Organizacija: <strong>{organizationId}</strong>
            </p>
            <button className="retry-button" type="button" onClick={clearAuth}>
              Odjavi se
            </button>
          </div>
        ) : null}
      </section>
    </main>
  )
}
