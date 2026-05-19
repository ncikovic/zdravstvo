import { useEffect, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import type { AuditActionDto, AuditEntityTypeDto, AuditLogDto } from '@zdravstvo/contracts'

import { AppIcon } from '@/components'
import type { AppIconName } from '@/types'
import { auditService } from '@/services'

import './audit.css'

type AuditActionTone = 'green' | 'blue' | 'red' | 'purple' | 'orange'

const MODULE_LABELS: Record<AuditEntityTypeDto, string> = {
  APPOINTMENT: 'Termini',
  TYPE: 'Vrste termina',
  DOCTOR: 'Liječnici',
  ORG_SETTINGS: 'Postavke',
  PATIENT: 'Pacijenti',
}

const MODULE_ICONS: Record<AuditEntityTypeDto, AppIconName> = {
  APPOINTMENT: 'calendar',
  TYPE: 'clipboard',
  DOCTOR: 'user',
  ORG_SETTINGS: 'settings',
  PATIENT: 'patients',
}

const ACTION_LABELS: Record<AuditActionDto, string> = {
  CREATE: 'Kreirano',
  UPDATE: 'Ažurirano',
  CANCEL: 'Otkazano',
  STATUS_CHANGE: 'Promjena statusa',
}

const ACTION_TONES: Record<AuditActionDto, AuditActionTone> = {
  CREATE: 'green',
  UPDATE: 'blue',
  CANCEL: 'red',
  STATUS_CHANGE: 'purple',
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrator',
  RECEPTION: 'Recepcija',
  DOCTOR: 'Liječnik',
  PATIENT: 'Pacijent',
}

const ENTITY_PREFIXES: Record<AuditEntityTypeDto, string> = {
  APPOINTMENT: 'Termin #T-',
  PATIENT: 'Pacijent #P-',
  DOCTOR: 'Liječnik #L-',
  TYPE: 'Vrsta #VT-',
  ORG_SETTINGS: 'Postavke',
}

const DETAIL_ICONS: readonly AppIconName[] = [
  'clock',
  'user',
  'users',
  'calendar',
  'tag',
  'clipboard',
  'checkCircle',
  'home',
]

const formatEntityDisplay = (entityType: AuditEntityTypeDto, entityId: string): string => {
  if (entityType === 'ORG_SETTINGS') return 'Postavke';
  const prefix = ENTITY_PREFIXES[entityType];
  return `${prefix}${entityId.slice(-5).toUpperCase()}`;
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return (parts[0]?.[0] ?? '?').toUpperCase();
  return `${(parts[0]?.[0] ?? '?')}${(parts[parts.length - 1]?.[0] ?? '?')}`.toUpperCase();
}

const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${dd}. ${mm}. ${yyyy}. ${hh}:${min}:${ss}`;
}

const getErrorMessage = (error: unknown): string =>
  error instanceof Error
    ? error.message
    : typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message: unknown }).message)
      : 'Greška pri učitavanju audit zapisa.'

const buildPaginationPages = (current: number, total: number): (number | '...')[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [];
  pages.push(1);
  if (current > 3) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

interface DetailPanelProps {
  log: AuditLogDto;
  onClose: () => void;
}

function DetailPanel({ log, onClose }: DetailPanelProps): ReactElement {
  const detailRows = [
    ['Vrijeme', formatDateTime(log.createdAt)],
    ['Korisnik', log.actorName],
    ['Uloga', ROLE_LABELS[log.actorRole] ?? log.actorRole],
    ['Modul', MODULE_LABELS[log.entityType]],
    ['Radnja', ACTION_LABELS[log.action]],
    ['Entitet', formatEntityDisplay(log.entityType, log.entityId)],
    ['Rezultat', 'Uspješno'],
  ] as const;

  const metadataEntries = log.metadata
    ? Object.entries(log.metadata).filter(([, v]) => v !== null && v !== undefined)
    : [];

  const handleCopy = (): void => {
    const text = detailRows
      .map(([label, value]) => `${label}: ${value}`)
      .join('\n');
    void navigator.clipboard.writeText(text);
  };

  return (
    <aside className="audit-detail-panel" aria-label="Detalji audit zapisa">
      <button
        className="audit-detail-close"
        type="button"
        aria-label="Zatvori detalje"
        onClick={onClose}
      >
        ×
      </button>
      <h2>Detalji zapisa</h2>

      <div className="audit-detail-list">
        {detailRows.map(([label, value], index) => (
          <div key={label}>
            <AppIcon name={DETAIL_ICONS[index] ?? 'info'} />
            <span>{label}</span>
            <strong
              className={
                label === 'Radnja' || label === 'Rezultat' ? 'audit-detail-success' : undefined
              }
            >
              {label === 'Rezultat' ? <i /> : null}
              {value}
            </strong>
          </div>
        ))}
      </div>

      {metadataEntries.length > 0 ? (
        <section className="audit-changes-card">
          <h3>Promijenjena polja</h3>
          <div className="audit-changes-table audit-changes-table--head">
            <span>Polje</span>
            <span>Vrijednost</span>
            <span></span>
          </div>
          {metadataEntries.map(([key, value]) => (
            <div className="audit-changes-table" key={key}>
              <span>{key}</span>
              <strong>{String(value)}</strong>
              <strong></strong>
            </div>
          ))}
        </section>
      ) : null}

      <button className="audit-copy-button" type="button" onClick={handleCopy}>
        <AppIcon name="clipboard" />
        Kopiraj detalje
      </button>
    </aside>
  );
}

function AuditPage(): ReactElement {
  const [logs, setLogs] = useState<AuditLogDto[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLogDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState<AuditEntityTypeDto | ''>('');
  const [actionFilter, setActionFilter] = useState<AuditActionDto | ''>('');

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [search]);

  useEffect(() => {
    const fetchLogs = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const data = await auditService.list({
          page,
          search: debouncedSearch || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          entityType: entityTypeFilter || undefined,
          action: actionFilter || undefined,
        });
        setLogs(data.logs);
        setTotalPages(data.totalPages);
        setTotalItems(data.totalItems);
        setSelectedLog((current) => {
          if (!current) return data.logs[0] ?? null;
          const still = data.logs.find((l) => l.id === current.id);
          return still ?? data.logs[0] ?? null;
        });
        setError(null);
      } catch (err) {
        setError(getErrorMessage(err));
        setLogs([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchLogs();
  }, [page, debouncedSearch, dateFrom, dateTo, entityTypeFilter, actionFilter]);

  const handleFilterChange = (): void => {
    setPage(1);
  };

  const fromEntry = (page - 1) * 10 + 1;
  const toEntry = Math.min(page * 10, totalItems);

  const paginationPages = buildPaginationPages(page, totalPages);

  return (
    <div className="audit-page">
      <div className="audit-page__hero">
        <div>
          <h1>Audit</h1>
          <p>Pregled aktivnosti i promjena u sustavu.</p>
        </div>
      </div>

      <section className="audit-filter-panel" aria-label="Filteri audit zapisa">
        <label className="audit-search-field">
          <span className="sr-only">Pretraga audit zapisa</span>
          <AppIcon name="search" />
          <input
            type="search"
            placeholder="Pretražite korisnike, radnje ili entitete..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <label>
          <span>Datum od</span>
          <input
            className="audit-date-input"
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              handleFilterChange();
            }}
          />
        </label>
        <label>
          <span>Datum do</span>
          <input
            className="audit-date-input"
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              handleFilterChange();
            }}
          />
        </label>
        <label>
          <span>Modul</span>
          <select
            className="audit-select"
            value={entityTypeFilter}
            onChange={(e) => {
              setEntityTypeFilter(e.target.value as AuditEntityTypeDto | '');
              handleFilterChange();
            }}
          >
            <option value="">Svi moduli</option>
            <option value="APPOINTMENT">Termini</option>
            <option value="PATIENT">Pacijenti</option>
            <option value="DOCTOR">Liječnici</option>
            <option value="TYPE">Vrste termina</option>
            <option value="ORG_SETTINGS">Postavke</option>
          </select>
        </label>
        <label>
          <span>Radnja</span>
          <select
            className="audit-select"
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value as AuditActionDto | '');
              handleFilterChange();
            }}
          >
            <option value="">Sve radnje</option>
            <option value="CREATE">Kreirano</option>
            <option value="UPDATE">Ažurirano</option>
            <option value="CANCEL">Otkazano</option>
            <option value="STATUS_CHANGE">Promjena statusa</option>
          </select>
        </label>
        <button
          className="audit-export-button"
          type="button"
          onClick={() => {
            setSearch('');
            setDateFrom('');
            setDateTo('');
            setEntityTypeFilter('');
            setActionFilter('');
            setPage(1);
          }}
        >
          <AppIcon name="tag" />
          Obriši filtre
        </button>
      </section>

      <div className="audit-content-grid">
        <section className="audit-table-panel" aria-label="Audit zapisi">
          <div className="audit-table audit-table--head" role="row">
            <span>Vrijeme ↓</span>
            <span>Korisnik</span>
            <span>Modul</span>
            <span>Radnja</span>
            <span>Entitet</span>
            <span>IP adresa</span>
            <span>Status</span>
          </div>

          {isLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Učitavanje...</div>
          ) : error ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#d32f2f' }}>{error}</div>
          ) : logs.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Nema zapisa za zadane filtre.</div>
          ) : (
            logs.map((log) => (
              <div
                className={
                  log.id === selectedLog?.id
                    ? 'audit-table audit-table--row audit-table--row-selected'
                    : 'audit-table audit-table--row'
                }
                role="row"
                key={log.id}
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedLog(log)}
              >
                <strong>{formatDateTime(log.createdAt)}</strong>
                <span className="audit-user-cell">
                  <i className="audit-avatar audit-avatar--male">{getInitials(log.actorName)}</i>
                  {log.actorName}
                </span>
                <span className="audit-module-cell">
                  <AppIcon name={MODULE_ICONS[log.entityType]} />
                  {MODULE_LABELS[log.entityType]}
                </span>
                <span className={`audit-action audit-action--${ACTION_TONES[log.action]}`}>
                  {ACTION_LABELS[log.action]}
                </span>
                <span>{formatEntityDisplay(log.entityType, log.entityId)}</span>
                <span>—</span>
                <em className="audit-status">Uspješno</em>
              </div>
            ))
          )}

          {!isLoading && !error && totalItems > 0 ? (
            <div className="audit-pagination">
              <span>
                Prikazano {fromEntry} do {toEntry} od {totalItems} zapisa
              </span>
              <div>
                <button
                  type="button"
                  aria-label="Prethodna stranica"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <AppIcon name="chevronLeft" />
                </button>
                {paginationPages.map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`}>...</span>
                  ) : (
                    <button
                      key={p}
                      className={p === page ? 'audit-pagination__active' : undefined}
                      type="button"
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  aria-label="Sljedeća stranica"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <AppIcon name="chevronRight" />
                </button>
              </div>
              <span className="audit-page-size">10 po stranici</span>
            </div>
          ) : null}
        </section>

        {selectedLog ? (
          <DetailPanel log={selectedLog} onClose={() => setSelectedLog(null)} />
        ) : (
          <aside className="audit-detail-panel audit-detail-panel--empty" aria-label="Detalji audit zapisa">
            <p style={{ padding: '2rem', color: '#667590', textAlign: 'center', margin: 0 }}>
              Odaberite zapis za pregled detalja.
            </p>
          </aside>
        )}
      </div>
    </div>
  )
}

export { AuditPage }
