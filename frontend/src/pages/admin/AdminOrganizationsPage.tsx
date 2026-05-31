import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'

import { APP_ROUTES } from '@/app/routes'
import { AppIcon } from '@/components'
import { organizationsService } from '@/services'
import type { Organization } from '@/types'
import { getApiErrorMessage, toast } from '@/utils'

function AdminOrganizationsPage(): ReactElement {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newOrgName, setNewOrgName] = useState('')
  const [newOrgTimezone, setNewOrgTimezone] = useState('Europe/Zagreb')
  const [isSaving, setIsSaving] = useState(false)

  const fetchOrganizations = async (): Promise<void> => {
    try {
      setIsLoading(true)
      const orgs = await organizationsService.listAll()
      setOrganizations(orgs)
      setError(null)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const handleCreate = async (): Promise<void> => {
    const name = newOrgName.trim()
    if (!name) return

    try {
      setIsSaving(true)
      await organizationsService.create({ name, timezone: newOrgTimezone })
      setNewOrgName('')
      setIsCreating(false)
      await fetchOrganizations()
      toast.success(`Organizacija "${name}" je uspješno kreirana.`)
    } catch (err) {
      toast.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeactivate = async (id: string, name: string): Promise<void> => {
    if (!confirm(`Jeste li sigurni da želite deaktivirati organizaciju "${name}"?`)) return

    try {
      await organizationsService.deactivate(id)
      await fetchOrganizations()
      toast.success(`Organizacija "${name}" je uspješno deaktivirana.`)
    } catch (err) {
      toast.error(err)
    }
  }

  const getOrganizationSettingsPath = (organizationId: string): string =>
    `${APP_ROUTES.settings}?organizationId=${encodeURIComponent(organizationId)}`

  return (
    <div style={{ padding: '2rem', maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Organizacije</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#666' }}>Upravljanje zdravstvenim ustanovama u sustavu.</p>
        </div>
        <button
          type="button"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          onClick={() => setIsCreating(true)}
        >
          <AppIcon name="plus" />
          Nova organizacija
        </button>
      </div>

      {isCreating ? (
        <div style={{ padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>Nova organizacija</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label>
              <span style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Naziv *</span>
              <input
                type="text"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="Npr. Poliklinika Zagreb"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }}
              />
            </label>
            <label>
              <span style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Vremenska zona</span>
              <input
                type="text"
                value={newOrgTimezone}
                onChange={(e) => setNewOrgTimezone(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }}
              />
            </label>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button
              type="button"
              disabled={isSaving || !newOrgName.trim()}
              onClick={handleCreate}
              style={{ padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              {isSaving ? 'Sprema...' : 'Spremi'}
            </button>
            <button
              type="button"
              onClick={() => { setIsCreating(false); setNewOrgName('') }}
              style={{ padding: '0.5rem 1rem', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
            >
              Odustani
            </button>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <p style={{ color: '#666' }}>Učitavanje...</p>
      ) : error ? (
        <div role="alert" style={{ padding: '2rem', textAlign: 'center', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c' }}>
          {error}
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 600 }}>Naziv</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 600 }}>Grad</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 600 }}>Telefon</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 600 }}>Kreirano</th>
              <th style={{ padding: '0.75rem' }} />
            </tr>
          </thead>
          <tbody>
            {organizations.map((org) => (
              <tr key={org.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.75rem', fontWeight: 500 }}>{org.name}</td>
                <td style={{ padding: '0.75rem', color: '#666' }}>{org.city ?? '—'}</td>
                <td style={{ padding: '0.75rem', color: '#666' }}>{org.phone ?? '—'}</td>
                <td style={{ padding: '0.75rem', color: '#666', fontSize: '0.875rem' }}>
                  {org.createdAt.toLocaleDateString('hr-HR')}
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', whiteSpace: 'nowrap' }}>
                    <Link
                      to={getOrganizationSettingsPath(org.id)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.75rem', background: '#fff', border: '1px solid #93c5fd', color: '#1d4ed8', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem', textDecoration: 'none' }}
                    >
                      <AppIcon name="settings" />
                      Postavke
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeactivate(org.id, org.name)}
                      style={{ padding: '0.25rem 0.75rem', background: '#fff', border: '1px solid #fca5a5', color: '#b91c1c', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem' }}
                    >
                      Deaktiviraj
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {organizations.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                  Nema organizacija.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      )}
    </div>
  )
}

export { AdminOrganizationsPage }
