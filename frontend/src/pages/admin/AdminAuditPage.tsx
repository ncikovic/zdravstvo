import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import type { AuditLogDto } from '@zdravstvo/contracts'

import { adminAuditService } from '@/services'
import { getApiErrorMessage } from '@/utils'

function AdminAuditPage(): ReactElement {
  const [logs, setLogs] = useState<AuditLogDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchLogs = async (): Promise<void> => {
      try {
        setIsLoading(true)
        const result = await adminAuditService.list({ page })
        setLogs(result.logs ?? [])
        setTotalPages(result.totalPages ?? 1)
        setError(null)
      } catch (err) {
        setError(getApiErrorMessage(err))
      } finally {
        setIsLoading(false)
      }
    }

    fetchLogs()
  }, [page])

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Audit zapisi</h1>
        <p style={{ margin: '0.25rem 0 0', color: '#666' }}>Pregled svih akcija u sustavu.</p>
      </div>

      {error ? (
        <div role="alert" style={{ padding: '0.75rem 1rem', background: '#fef2f2', color: '#b91c1c', borderRadius: '6px', marginBottom: '1rem' }}>
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <p style={{ color: '#666' }}>Učitavanje...</p>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 600 }}>Akcija</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 600 }}>Entitet</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 600 }}>Akter</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 600 }}>Datum</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ fontWeight: 500 }}>{log.action}</span>
                  </td>
                  <td style={{ padding: '0.75rem', color: '#666' }}>{log.entityType}</td>
                  <td style={{ padding: '0.75rem', color: '#666', fontSize: '0.875rem' }}>
                    {log.actorName ?? '—'}
                  </td>
                  <td style={{ padding: '0.75rem', color: '#666', fontSize: '0.875rem' }}>
                    {new Date(log.createdAt).toLocaleString('hr-HR')}
                  </td>
                </tr>
              ))}
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                    Nema audit zapisa.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>

          {totalPages > 1 ? (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', alignItems: 'center' }}>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                style={{ padding: '0.25rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer', background: '#fff' }}
              >
                ←
              </button>
              <span style={{ color: '#666' }}>Stranica {page} / {totalPages}</span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                style={{ padding: '0.25rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer', background: '#fff' }}
              >
                →
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}

export { AdminAuditPage }
