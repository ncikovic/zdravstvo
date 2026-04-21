import type { ReactElement } from 'react'

import { useAuthStore } from '@/state'

export function HomePage(): ReactElement {
  const session = useAuthStore((state) => state.session)
  const clearAuth = useAuthStore((state) => state.clearAuth)

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">zdravstvo</p>
        <h1>
          {session
            ? `Pozdrav, ${session.user.firstName}.`
            : 'Frontend skeleton is ready.'}
        </h1>
        <p>
          {session
            ? 'Uspjesno ste prijavljeni i organizacijski kontekst je aktivan.'
            : 'Prijavite se kako biste nastavili prema zasticenim funkcionalnostima.'}
        </p>

        {session ? (
          <div className="session-summary">
            <p>
              Uloga: <strong>{session.role}</strong>
            </p>
            <p>
              Organizacija: <strong>{session.organizationId}</strong>
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
