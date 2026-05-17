import type { ReactElement } from 'react'

function AdminUsersPage(): ReactElement {
  return (
    <div style={{ padding: '2rem', maxWidth: '900px' }}>
      <h1>Korisnici</h1>
      <p style={{ color: '#666' }}>Upravljanje korisnicima i dodjela uloga u organizacijama.</p>

      <div style={{
        marginTop: '2rem',
        padding: '3rem',
        textAlign: 'center',
        background: '#f8fafc',
        border: '1px dashed #cbd5e1',
        borderRadius: '8px',
        color: '#94a3b8',
      }}>
        <p>Popis korisnika i dodjela uloga bit će dostupni ovdje.</p>
      </div>
    </div>
  )
}

export { AdminUsersPage }
