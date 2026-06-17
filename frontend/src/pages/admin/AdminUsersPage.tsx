import { useEffect, useState } from 'react'
import type { ChangeEvent, ReactElement } from 'react'
import { Link } from 'react-router-dom'

import { OrganizationUserRole } from '@zdravstvo/contracts'
import { APP_ROUTES } from '@/app/routes'
import { adminUsersService } from '@/services'
import type { AdminUserResponseDto } from '@/services'
import { getApiErrorMessage } from '@/utils'

const ROLE_LABELS: Record<OrganizationUserRole, string> = {
  [OrganizationUserRole.MANAGER]: 'Upravitelj',
  [OrganizationUserRole.RECEPTION]: 'Recepcija',
  [OrganizationUserRole.DOCTOR]: 'Liječnik',
  [OrganizationUserRole.PATIENT]: 'Pacijent',
}

const badge = (text: string, color: string): ReactElement => (
  <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: color + '22', color }}>{text}</span>
)

function AdminUsersPage(): ReactElement {
  const [users, setUsers] = useState<AdminUserResponseDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<OrganizationUserRole | ''>('')

  const fetchUsers = async (currentPage: number, currentSearch: string, currentRole: OrganizationUserRole | ''): Promise<void> => {
    try {
      setIsLoading(true)
      const result = await adminUsersService.list({
        page: currentPage,
        search: currentSearch || undefined,
        role: currentRole || undefined,
      })
      setUsers(result.users)
      setTotalPages(result.pagination.totalPages)
      setTotalItems(result.pagination.totalItems)
      setError(null)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchUsers(page, search, roleFilter)
  }, [page, search, roleFilter])

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handleRoleChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    setRoleFilter(e.target.value as OrganizationUserRole | '')
    setPage(1)
  }

  const getManageUserPath = (orgUserId: string): string =>
    APP_ROUTES.adminUserManage.replace(':orgUserId', encodeURIComponent(orgUserId))


  return (
    <div style={{ padding: '2rem', maxWidth: '1100px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Korisnici</h1>
        <p style={{ margin: '0.25rem 0 0', color: '#666' }}>
          Upravljanje korisnicima i njihovim ulogama u organizacijama.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <input
          type="search"
          placeholder="Pretraži po imenu, emailu, telefonu..."
          value={search}
          onChange={handleSearchChange}
          style={{ flex: '1 1 240px', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem' }}
        />
        <select
          value={roleFilter}
          onChange={handleRoleChange}
          style={{ padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem' }}
        >
          <option value="">Sve uloge</option>
          {Object.values(OrganizationUserRole).map((role) => (
            <option key={role} value={role}>{ROLE_LABELS[role]}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p style={{ color: '#6b7280' }}>Učitavanje...</p>
      ) : error ? (
        <div role="alert" style={{ padding: '3rem', textAlign: 'center', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c' }}>
          {error}
        </div>
      ) : users.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#94a3b8' }}>
          Nema korisnika koji odgovaraju odabranim filterima.
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  {(['Korisnik', 'Kontakt', 'Organizacija', 'Uloga', 'Status', ''] as const).map((h) => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.orgUserId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {user.displayName ?? <span style={{ color: '#9ca3af' }}>—</span>}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#6b7280' }}>
                      {user.email ?? user.phone ?? '—'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>{user.organizationName}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {badge(ROLE_LABELS[user.role], '#2563eb')}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {user.isActive
                        ? badge('Aktivan', '#16a34a')
                        : badge('Neaktivan', '#dc2626')}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <Link
                        to={getManageUserPath(user.orgUserId)}
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.35rem 0.75rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, textDecoration: 'none' }}
                      >
                        Upravljaj
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
            <span>Ukupno: {totalItems} korisnika</span>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => { setPage((p) => p - 1) }}
                style={{ padding: '0.35rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '5px', cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.5 : 1 }}
              >
                ‹ Prethodna
              </button>
              <span>Stranica {page} od {totalPages}</span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => { setPage((p) => p + 1) }}
                style={{ padding: '0.35rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '5px', cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.5 : 1 }}
              >
                Sljedeća ›
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export { AdminUsersPage }
