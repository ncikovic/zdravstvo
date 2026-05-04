import type { ReactElement } from 'react'

import { AppIcon } from '@/components'
import type { AppIconName } from '@/types'

import './audit.css'

type AuditActionTone = 'green' | 'blue' | 'red' | 'purple' | 'orange'

interface AuditLogRow {
  time: string
  user: string
  initials: string
  avatarTone: 'female' | 'male'
  module: string
  moduleIcon: AppIconName
  action: string
  actionTone: AuditActionTone
  entity: string
  ip: string
}

const auditLogs: readonly AuditLogRow[] = [
  {
    time: '23. 05. 2025. 09:41:22',
    user: 'Ana Marić',
    initials: 'AM',
    avatarTone: 'female',
    module: 'Termini',
    moduleIcon: 'calendar',
    action: 'Kreirano',
    actionTone: 'green',
    entity: 'Termin #T-47891',
    ip: '192.168.1.24',
  },
  {
    time: '23. 05. 2025. 09:32:11',
    user: 'Ivan Babić',
    initials: 'IB',
    avatarTone: 'male',
    module: 'Pacijenti',
    moduleIcon: 'user',
    action: 'Ažurirano',
    actionTone: 'blue',
    entity: 'Pacijent #P-10324',
    ip: '192.168.1.37',
  },
  {
    time: '23. 05. 2025. 09:18:45',
    user: 'Petra Kovač',
    initials: 'PK',
    avatarTone: 'female',
    module: 'Liječnici',
    moduleIcon: 'user',
    action: 'Ažurirano',
    actionTone: 'blue',
    entity: 'Liječnik #L-2041',
    ip: '192.168.1.24',
  },
  {
    time: '23. 05. 2025. 08:55:07',
    user: 'Marko Horvat',
    initials: 'MH',
    avatarTone: 'male',
    module: 'Termini',
    moduleIcon: 'calendar',
    action: 'Otkazano',
    actionTone: 'red',
    entity: 'Termin #T-47832',
    ip: '192.168.1.52',
  },
  {
    time: '23. 05. 2025. 08:41:29',
    user: 'Lea Novak',
    initials: 'LN',
    avatarTone: 'female',
    module: 'Vrste termina',
    moduleIcon: 'clipboard',
    action: 'Kreirano',
    actionTone: 'green',
    entity: 'Vrsta termina #VT-12',
    ip: '192.168.1.68',
  },
  {
    time: '23. 05. 2025. 08:17:53',
    user: 'Dino Šarić',
    initials: 'DS',
    avatarTone: 'male',
    module: 'Pacijenti',
    moduleIcon: 'patients',
    action: 'Promjena statusa',
    actionTone: 'purple',
    entity: 'Pacijent #P-10287',
    ip: '192.168.1.19',
  },
  {
    time: '23. 05. 2025. 07:59:31',
    user: 'Ana Marić',
    initials: 'AM',
    avatarTone: 'female',
    module: 'Postavke',
    moduleIcon: 'settings',
    action: 'Ažurirano',
    actionTone: 'blue',
    entity: 'Postavka podsjetnika',
    ip: '192.168.1.24',
  },
  {
    time: '22. 05. 2025. 17:24:18',
    user: 'Ivan Babić',
    initials: 'IB',
    avatarTone: 'male',
    module: 'Termini',
    moduleIcon: 'calendar',
    action: 'Kreirano',
    actionTone: 'green',
    entity: 'Termin #T-47725',
    ip: '192.168.1.37',
  },
  {
    time: '22. 05. 2025. 16:48:03',
    user: 'Petra Kovač',
    initials: 'PK',
    avatarTone: 'female',
    module: 'Liječnici',
    moduleIcon: 'user',
    action: 'Ažurirano',
    actionTone: 'blue',
    entity: 'Liječnik #L-2035',
    ip: '192.168.1.24',
  },
  {
    time: '22. 05. 2025. 16:01:44',
    user: 'Marko Horvat',
    initials: 'MH',
    avatarTone: 'male',
    module: 'Postavke',
    moduleIcon: 'settings',
    action: 'Izvoz',
    actionTone: 'orange',
    entity: 'Izvoz rasporeda',
    ip: '192.168.1.52',
  },
]

const detailRows = [
  ['Vrijeme', '23. 05. 2025. 09:41:22'],
  ['Korisnik', 'Ana Marić'],
  ['Uloga', 'Administrator'],
  ['Modul', 'Termini'],
  ['Radnja', 'Kreirano'],
  ['Entitet', 'Termin #T-47891'],
  ['Rezultat', 'Uspješno'],
  ['IP adresa', '192.168.1.24'],
] as const

const changedFields = [
  ['Datum i vrijeme', '-', '23. 05. 2025. 10:30'],
  ['Liječnik', '-', 'Dr. Petra Kovač'],
  ['Vrsta termina', '-', 'Kontrolni pregled'],
  ['Trajanje', '-', '30 min'],
  ['Pacijent', '-', 'Ivan Horvat (P-10324)'],
  ['Status', '-', 'Aktivan'],
] as const

const detailIcons: readonly AppIconName[] = [
  'clock',
  'user',
  'users',
  'calendar',
  'tag',
  'clipboard',
  'checkCircle',
  'home',
]

function AuditPage(): ReactElement {
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
          <input type="search" placeholder="Pretražite korisnike, radnje ili entitete..." />
        </label>
        <label>
          <span>Datum od</span>
          <div>
            16. 05. 2025.
            <AppIcon name="calendar" />
          </div>
        </label>
        <label>
          <span>Datum do</span>
          <div>
            23. 05. 2025.
            <AppIcon name="calendar" />
          </div>
        </label>
        <label>
          <span>Korisnik</span>
          <div>
            Svi korisnici
            <AppIcon name="chevronDown" />
          </div>
        </label>
        <label>
          <span>Modul</span>
          <div>
            Svi moduli
            <AppIcon name="chevronDown" />
          </div>
        </label>
        <label>
          <span>Radnja</span>
          <div>
            Sve radnje
            <AppIcon name="chevronDown" />
          </div>
        </label>
        <button className="audit-export-button" type="button">
          <AppIcon name="send" />
          Izvezi zapisnik
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
            <span aria-hidden="true" />
          </div>

          {auditLogs.map((log, index) => (
            <div
              className={
                index === 0
                  ? 'audit-table audit-table--row audit-table--row-selected'
                  : 'audit-table audit-table--row'
              }
              role="row"
              key={`${log.time}-${log.entity}`}
            >
              <strong>{log.time}</strong>
              <span className="audit-user-cell">
                <i className={`audit-avatar audit-avatar--${log.avatarTone}`}>{log.initials}</i>
                {log.user}
              </span>
              <span className="audit-module-cell">
                <AppIcon name={log.moduleIcon} />
                {log.module}
              </span>
              <span className={`audit-action audit-action--${log.actionTone}`}>{log.action}</span>
              <span>{log.entity}</span>
              <span>{log.ip}</span>
              <em className="audit-status">Uspješno</em>
              <button type="button">Detalji</button>
            </div>
          ))}

          <div className="audit-pagination">
            <span>Prikazano 1 do 10 od 356 zapisa</span>
            <div>
              <button type="button" aria-label="Prethodna stranica">
                <AppIcon name="chevronLeft" />
              </button>
              <button className="audit-pagination__active" type="button">
                1
              </button>
              <button type="button">2</button>
              <button type="button">3</button>
              <span>...</span>
              <button type="button">36</button>
              <button type="button" aria-label="Sljedeća stranica">
                <AppIcon name="chevronRight" />
              </button>
            </div>
            <button className="audit-page-size" type="button">
              10 po stranici
              <AppIcon name="chevronDown" />
            </button>
          </div>
        </section>

        <aside className="audit-detail-panel" aria-label="Detalji audit zapisa">
          <button className="audit-detail-close" type="button" aria-label="Zatvori detalje">
            ×
          </button>
          <h2>Detalji zapisa</h2>

          <div className="audit-detail-list">
            {detailRows.map(([label, value], index) => (
              <div key={label}>
                <AppIcon name={detailIcons[index] ?? 'info'} />
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

          <section className="audit-changes-card">
            <h3>Promijenjena polja</h3>
            <div className="audit-changes-table audit-changes-table--head">
              <span>Polje</span>
              <span>Prije</span>
              <span>Poslije</span>
            </div>
            {changedFields.map(([field, before, after]) => (
              <div className="audit-changes-table" key={field}>
                <span>{field}</span>
                <span>{before}</span>
                <strong>
                  {field === 'Status' ? <em>Aktivan</em> : after}
                </strong>
              </div>
            ))}
          </section>

          <button className="audit-copy-button" type="button">
            <AppIcon name="clipboard" />
            Kopiraj detalje
          </button>
        </aside>
      </div>
    </div>
  )
}

export { AuditPage }
