import type { ReactElement } from 'react'

import { AppIcon } from '@/components'
import type { AppIconName } from '@/types'

import './editAppointmentType.css'

interface SummaryRow {
  label: string
  value: string
  badge?: boolean
}

interface LinkItem {
  label: string
  icon: AppIconName
}

const summaryRows: readonly SummaryRow[] = [
  { label: 'Trajanje', value: '30 min' },
  { label: 'Online rezervacija', value: 'Omogućena' },
  { label: 'Minimalno otkazivanje', value: '24 sata' },
  { label: 'Podsjetnik e-mail', value: '24 h prije' },
  { label: 'Podsjetnik SMS', value: '2 h prije' },
  { label: 'Status', value: 'Aktivan', badge: true },
]

const quickLinks: readonly LinkItem[] = [
  { label: 'Povezani liječnici', icon: 'users' },
  { label: 'Pregled rezervacija', icon: 'calendar' },
  { label: 'Povijest promjena', icon: 'clock' },
]

function Toggle({ label, description }: { label: string; description: string }): ReactElement {
  return (
    <div className="appointment-type-edit-toggle">
      <span aria-hidden="true" />
      <div>
        <strong>{label}</strong>
        <small>{description}</small>
      </div>
    </div>
  )
}

function SelectButton({
  label,
  value,
  icon,
  required,
  dot,
}: {
  label: string
  value: string
  icon: AppIconName
  required?: boolean
  dot?: boolean
}): ReactElement {
  return (
    <label className="appointment-type-edit-field">
      <span>
        {label}
        {required ? <b> *</b> : null}
      </span>
      <button type="button">
        {dot ? <i /> : <AppIcon name={icon} />}
        {value}
        <AppIcon name="chevronDown" />
      </button>
    </label>
  )
}

function EditAppointmentTypePage(): ReactElement {
  return (
    <div className="appointment-type-edit-page">
      <nav className="appointment-type-edit-breadcrumb" aria-label="Navigacija">
        <span>Vrste termina</span>
        <AppIcon name="chevronRight" />
        <span>Detalji vrste termina</span>
        <AppIcon name="chevronRight" />
        <strong>Uredi vrstu termina</strong>
      </nav>

      <section className="appointment-type-edit-hero">
        <div>
          <h1>Uredi vrstu termina</h1>
          <p>Ažurirajte podatke i pravila rezervacije za postojeću vrstu termina.</p>
        </div>
        <button type="button">
          <AppIcon name="chevronLeft" />
          Povratak na vrste termina
        </button>
      </section>

      <div className="appointment-type-edit-grid">
        <main className="appointment-type-edit-main">
          <section className="appointment-type-edit-card">
            <header>
              <span>1</span>
              <h2>Osnovni podaci</h2>
            </header>

            <div className="appointment-type-edit-form-grid">
              <label className="appointment-type-edit-field">
                <span>
                  Naziv vrste termina <b>*</b>
                </span>
                <input defaultValue="Kontrolni pregled" />
              </label>

              <label className="appointment-type-edit-field appointment-type-edit-field--textarea">
                <span>Kratki opis</span>
                <textarea
                  defaultValue="Praćenje stanja i kontrola nakon prethodnog pregleda ili terapije."
                  maxLength={120}
                />
                <em>61/120</em>
              </label>

              <SelectButton label="Trajanje" value="30 minuta" icon="clock" required />
              <SelectButton label="Boja oznake" value="Mentol zelena" icon="plus" required dot />
            </div>
          </section>

          <section className="appointment-type-edit-card">
            <header>
              <span>2</span>
              <h2>Pravila rezervacije</h2>
            </header>

            <div className="appointment-type-edit-rules-grid">
              <Toggle label="Online rezervacija" description="Omogući online rezervaciju za ovu vrstu termina" />
              <SelectButton label="Podsjetnik e-mail" value="24 h prije" icon="clock" />
              <SelectButton label="Minimalno vrijeme otkazivanja" value="24 sata" icon="clock" required />
              <SelectButton label="Podsjetnik SMS" value="2 h prije" icon="clock" />

              <div className="appointment-type-edit-reminder-row">
                <Toggle label="Automatski podsjetnik e-mail" description="Pošalji e-mail podsjetnik pacijentu" />
                <Toggle label="Automatski podsjetnik SMS" description="Pošalji SMS podsjetnik pacijentu" />
              </div>
            </div>
          </section>

          <section className="appointment-type-edit-card">
            <header>
              <span>3</span>
              <h2>Dostupnost i povezivanje</h2>
            </header>

            <div className="appointment-type-edit-availability-grid">
              <label className="appointment-type-edit-field appointment-type-edit-tags">
                <span>Specijalizacije</span>
                <button type="button">
                  <em>Interna medicina <i>×</i></em>
                  <em>Kardiologija <i>×</i></em>
                  <em>Endokrinologija <i>×</i></em>
                  <AppIcon name="chevronDown" />
                </button>
              </label>

              <label className="appointment-type-edit-field appointment-type-edit-tags">
                <span>Liječnici</span>
                <button type="button">
                  <em>dr. Ivan Babić <i>×</i></em>
                  <em>dr. Petra Kovač <i>×</i></em>
                  <em>+ 6</em>
                  <AppIcon name="chevronDown" />
                </button>
              </label>

              <SelectButton label="Lokacija" value="Poliklinika Medica Zagreb" icon="building" />
              <SelectButton label="Status" value="Aktivan" icon="plus" required dot />
            </div>

            <p className="appointment-type-edit-info">
              <AppIcon name="info" />
              Promjene će se primijeniti na buduće rezervacije ove vrste termina.
            </p>
          </section>

          <section className="appointment-type-edit-actions">
            <button className="appointment-type-edit-deactivate" type="button">
              <AppIcon name="trash" />
              Deaktiviraj vrstu termina
            </button>
            <div>
              <button className="appointment-type-edit-cancel" type="button">
                Odustani
              </button>
              <button className="appointment-type-edit-save" type="button">
                <AppIcon name="calendarCheck" />
                Spremi promjene
              </button>
            </div>
          </section>
        </main>

        <aside className="appointment-type-edit-side">
          <section className="appointment-type-edit-summary">
            <h2>Sažetak vrste termina</h2>
            <div className="appointment-type-edit-summary-title">
              <span />
              <strong>Kontrolni pregled</strong>
            </div>

            <div className="appointment-type-edit-summary-list">
              {summaryRows.map((row) => (
                <article key={row.label}>
                  <span>{row.label}</span>
                  {row.badge ? <em>{row.value}</em> : <strong>{row.value}</strong>}
                </article>
              ))}
            </div>

            <div className="appointment-type-edit-linked">
              <span>Povezano sa</span>
              <p>
                <AppIcon name="stethoscope" />
                3 specijalizacije
              </p>
              <p>
                <AppIcon name="users" />
                8 liječnika
              </p>
              <span>Lokacija</span>
              <p>
                <AppIcon name="mapPin" />
                Poliklinika Medica Zagreb
              </p>
            </div>
          </section>

          <section className="appointment-type-edit-quick">
            <h2>Brze poveznice</h2>
            <div>
              {quickLinks.map((link) => (
                <button key={link.label} type="button">
                  <AppIcon name={link.icon} />
                  {link.label}
                  <AppIcon name="chevronRight" />
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

export { EditAppointmentTypePage }
