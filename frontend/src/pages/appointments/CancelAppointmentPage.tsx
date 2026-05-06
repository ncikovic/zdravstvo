import type { ReactElement } from 'react'

import { AppIcon } from '@/components'
import type { AppIconName } from '@/types'

import './cancelAppointment.css'

interface AppointmentDetail {
  label: string
  title: string
  detail?: string
  icon?: AppIconName
  tone?: 'patient' | 'doctor' | 'type' | 'date' | 'time' | 'location'
  avatar?: boolean
  status?: boolean
}

interface CancelReason {
  id: string
  title: string
  icon: AppIconName
  selected?: boolean
}

interface SummaryLine {
  label: string
  value: string
  icon: AppIconName
}

const topDetails: readonly AppointmentDetail[] = [
  {
    label: 'Pacijent',
    title: 'Ana Marić',
    detail: '01.01.1990.',
    icon: 'user',
    tone: 'patient',
  },
  {
    label: 'Liječnik',
    title: 'Dr. Ivan Horvat, dr. med.',
    detail: 'Specijalist interne medicine',
    avatar: true,
  },
  {
    label: 'Vrsta termina',
    title: 'Kontrolni pregled',
    detail: '20 minuta',
    icon: 'users',
    tone: 'type',
  },
  {
    label: 'Status',
    title: 'Potvrđeno',
    status: true,
  },
]

const bottomDetails: readonly AppointmentDetail[] = [
  {
    label: 'Datum',
    title: 'Petak, 23. svibnja 2025.',
    detail: '10:00',
    icon: 'calendar',
    tone: 'date',
  },
  {
    label: 'Vrijeme',
    title: '10:00 - 10:20',
    detail: '20 minuta',
    icon: 'clock',
    tone: 'time',
  },
  {
    label: 'Lokacija',
    title: 'Poliklinika Medica Zagreb',
    detail: 'Ulica grada Vukovara 12, 10000 Zagreb',
    icon: 'mapPin',
    tone: 'location',
  },
]

const cancelReasons: readonly CancelReason[] = [
  { id: 'patient', title: 'Zahtjev pacijenta', icon: 'user', selected: true },
  { id: 'doctor', title: 'Liječnik nije dostupan', icon: 'calendar' },
  { id: 'schedule', title: 'Promjena rasporeda', icon: 'calendar' },
  { id: 'duplicate', title: 'Duplikat termina', icon: 'note' },
]

const summaryLines: readonly SummaryLine[] = [
  { label: 'Pacijent', value: 'Ana Marić', icon: 'user' },
  { label: 'Liječnik', value: 'Dr. Ivan Horvat, dr. med.', icon: 'doctor' },
  { label: 'Vrsta termina', value: 'Kontrolni pregled', icon: 'mail' },
  { label: 'Datum', value: 'Petak, 23. svibnja 2025.', icon: 'calendar' },
  { label: 'Vrijeme', value: '10:00 - 10:20', icon: 'clock' },
  { label: 'Lokacija', value: 'Poliklinika Medica Zagreb', icon: 'mapPin' },
  { label: 'Razlog otkazivanja', value: 'Zahtjev pacijenta', icon: 'user' },
  { label: 'Dodatna napomena', value: 'Nema napomene', icon: 'calendar' },
]

function DoctorPortrait(): ReactElement {
  return (
    <span className="appointment-cancel-doctor-photo" aria-hidden="true">
      <span />
    </span>
  )
}

function AppointmentDetailItem({ item }: { item: AppointmentDetail }): ReactElement {
  return (
    <article className="appointment-cancel-detail-item">
      {item.avatar ? <DoctorPortrait /> : null}
      {item.icon && item.tone ? (
        <span className={`appointment-cancel-detail-icon appointment-cancel-detail-icon--${item.tone}`}>
          <AppIcon name={item.icon} />
        </span>
      ) : null}
      {item.status ? <span className="appointment-cancel-status">Potvrđeno <i /></span> : null}
      {!item.status ? (
        <div>
          <small>{item.label}</small>
          <strong>{item.title}</strong>
          {item.detail ? <span>{item.detail}</span> : null}
        </div>
      ) : (
        <div>
          <small>{item.label}</small>
        </div>
      )}
    </article>
  )
}

function CancelAppointmentPage(): ReactElement {
  return (
    <div className="appointment-cancel-page">
      <nav className="appointment-cancel-breadcrumb" aria-label="Navigacija">
        <span>Termini</span>
        <i>/</i>
        <span>Detalji termina</span>
        <i>/</i>
        <strong>Otkazivanje termina</strong>
      </nav>

      <section className="appointment-cancel-hero">
        <div>
          <h1>Otkazivanje termina</h1>
          <p>Pregledajte termin i potvrdite otkazivanje uz evidentiranje razloga.</p>
        </div>

        <div className="appointment-cancel-hero-actions">
          <button type="button">
            <AppIcon name="chevronLeft" />
            Povratak na detalje termina
          </button>
          <button type="button">
            <AppIcon name="clipboard" />
            Povratak na termine
          </button>
        </div>
      </section>

      <div className="appointment-cancel-grid">
        <main className="appointment-cancel-main">
          <section className="appointment-cancel-card appointment-cancel-details-card">
            <h2>Detalji termina</h2>
            <div className="appointment-cancel-detail-row appointment-cancel-detail-row--top">
              {topDetails.map((item) => (
                <AppointmentDetailItem item={item} key={item.label} />
              ))}
            </div>
            <div className="appointment-cancel-detail-row appointment-cancel-detail-row--bottom">
              {bottomDetails.map((item) => (
                <AppointmentDetailItem item={item} key={item.label} />
              ))}
            </div>
          </section>

          <section className="appointment-cancel-card appointment-cancel-reason-card">
            <h2>Razlog otkazivanja</h2>

            <div className="appointment-cancel-reasons">
              {cancelReasons.map((reason) => (
                <button
                  className={reason.selected ? 'appointment-cancel-reason is-selected' : 'appointment-cancel-reason'}
                  key={reason.id}
                  type="button"
                >
                  <span className="appointment-cancel-radio" />
                  <AppIcon name={reason.icon} />
                  <strong>{reason.title}</strong>
                </button>
              ))}
            </div>

            <label className="appointment-cancel-note">
              <span>Dodatna napomena (opcionalno)</span>
              <textarea placeholder="Upišite dodatnu napomenu..." maxLength={500} />
              <em>0 / 500</em>
            </label>

            <label className="appointment-cancel-notify">
              <input type="checkbox" defaultChecked />
              <span />
              Obavijesti pacijenta putem e-maila i SMS-a
            </label>
          </section>
        </main>

        <aside className="appointment-cancel-card appointment-cancel-confirmation" aria-label="Potvrda otkazivanja">
          <div className="appointment-cancel-confirmation-head">
            <span>
              <AppIcon name="warning" />
            </span>
            <div>
              <h2>Potvrda otkazivanja</h2>
              <p>Provjerite sažetak termina i razlog otkazivanja. Nakon potvrde, termin će biti otkazan.</p>
            </div>
          </div>

          <p className="appointment-cancel-warning">
            <AppIcon name="warning" />
            <span>
              Ova radnja će promijeniti status termina u <strong>Otkazano.</strong>
            </span>
          </p>

          <div className="appointment-cancel-summary">
            {summaryLines.map((line) => (
              <article key={line.label}>
                <AppIcon name={line.icon} />
                <span>{line.label}</span>
                <strong>{line.value}</strong>
              </article>
            ))}
          </div>

          <button className="appointment-cancel-confirm" type="button">
            <AppIcon name="trash" />
            Potvrdi otkazivanje
          </button>

          <button className="appointment-cancel-cancel" type="button">
            Odustani
          </button>
        </aside>
      </div>
    </div>
  )
}

export { CancelAppointmentPage }
