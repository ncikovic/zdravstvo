import type { ReactElement } from 'react'

import { AppIcon } from '@/components'
import type { AppIconName } from '@/types'

import './createAppointmentType.css'

interface SummaryField {
  label: string
  value: string
  badge?: boolean
}

interface SelectField {
  label: string
  placeholder: string
  icon: AppIconName
  required?: boolean
  dot?: boolean
}

const summaryFields: readonly SummaryField[] = [
  { label: 'Trajanje', value: '-' },
  { label: 'Online rezervacija', value: '-' },
  { label: 'Minimalno otkazivanje', value: '-' },
  { label: 'Podsjetnik e-mail', value: '-' },
  { label: 'Podsjetnik SMS', value: '-' },
  { label: 'Status', value: 'Aktivan', badge: true },
]

const availabilityFields: readonly SelectField[] = [
  { label: 'Specijalizacije', placeholder: 'Odaberite specijalizacije', icon: 'stethoscope' },
  { label: 'Liječnici', placeholder: 'Odaberite liječnike', icon: 'user' },
  { label: 'Lokacija', placeholder: 'Odaberite lokacije', icon: 'building' },
  { label: 'Status', placeholder: 'Aktivan', icon: 'plus', required: true, dot: true },
]

function Toggle({ label, description }: { label: string; description: string }): ReactElement {
  return (
    <div className="appointment-type-create-toggle">
      <span aria-hidden="true" />
      <div>
        <strong>{label}</strong>
        <small>{description}</small>
      </div>
    </div>
  )
}

function SelectControl({ field }: { field: SelectField }): ReactElement {
  return (
    <label className="appointment-type-create-field">
      <span>
        {field.label}
        {field.required ? <b> *</b> : null}
      </span>
      <button type="button">
        {field.dot ? <i /> : <AppIcon name={field.icon} />}
        {field.placeholder}
        <AppIcon name="chevronDown" />
      </button>
    </label>
  )
}

function CreateAppointmentTypePage(): ReactElement {
  return (
    <div className="appointment-type-create-page">
      <button className="appointment-type-create-back-link" type="button">
        <AppIcon name="chevronLeft" />
        Natrag na vrste termina
      </button>

      <div className="appointment-type-create-hero">
        <span>Vrste termina / Nova vrsta termina</span>
        <h1>Nova vrsta termina</h1>
        <p>Unesite osnovne podatke i pravila rezervacije.</p>
      </div>

      <div className="appointment-type-create-grid">
        <main className="appointment-type-create-main">
          <section className="appointment-type-create-card">
            <header>
              <span>1</span>
              <h2>Osnovni podaci</h2>
            </header>

            <div className="appointment-type-create-form-grid">
              <label className="appointment-type-create-field">
                <span>
                  Naziv vrste termina <b>*</b>
                </span>
                <input placeholder="npr. Kontrolni pregled" />
              </label>

              <label className="appointment-type-create-field appointment-type-create-field--textarea">
                <span>Kratki opis</span>
                <textarea placeholder="Napišite kratki opis vrste termina..." maxLength={120} />
                <em>0/120</em>
              </label>

              <label className="appointment-type-create-field">
                <span>
                  Trajanje <b>*</b>
                </span>
                <button type="button">
                  <AppIcon name="clock" />
                  Odaberite trajanje
                  <AppIcon name="chevronDown" />
                </button>
              </label>

              <label className="appointment-type-create-field appointment-type-create-color-field">
                <span>
                  Boja oznake <b>*</b>
                </span>
                <button type="button">
                  <i />
                  Odaberite boju
                  <AppIcon name="chevronDown" />
                </button>
              </label>
            </div>
          </section>

          <section className="appointment-type-create-card">
            <header>
              <span>2</span>
              <h2>Pravila rezervacije</h2>
            </header>

            <div className="appointment-type-create-rules-grid">
              <Toggle label="Online rezervacija" description="Omogući online rezervaciju za ovu vrstu termina" />

              <label className="appointment-type-create-field">
                <span>
                  Trajanje termina <b>*</b>
                </span>
                <button type="button">
                  <AppIcon name="clock" />
                  Odaberite trajanje
                  <AppIcon name="chevronDown" />
                </button>
              </label>

              <label className="appointment-type-create-field">
                <span>
                  Minimalno vrijeme otkazivanja <b>*</b>
                </span>
                <button type="button">
                  <AppIcon name="clock" />
                  Odaberite vrijeme
                  <AppIcon name="chevronDown" />
                </button>
              </label>

              <div className="appointment-type-create-reminder-row">
                <Toggle label="Automatski podsjetnik e-mail" description="Pošalji e-mail podsjetnik pacijentu" />
                <Toggle label="Automatski podsjetnik SMS" description="Pošalji SMS podsjetnik pacijentu" />
              </div>
            </div>
          </section>

          <section className="appointment-type-create-card">
            <header>
              <span>3</span>
              <h2>Dostupnost i povezivanje</h2>
            </header>

            <div className="appointment-type-create-availability-grid">
              {availabilityFields.map((field) => (
                <SelectControl field={field} key={field.label} />
              ))}
            </div>
          </section>

          <section className="appointment-type-create-actions">
            <button className="appointment-type-create-cancel" type="button">
              Odustani
            </button>
            <button className="appointment-type-create-save" type="button">
              <AppIcon name="calendarCheck" />
              Spremi vrstu termina
            </button>
          </section>
        </main>

        <aside className="appointment-type-create-side">
          <section className="appointment-type-create-summary">
            <h2>Sažetak vrste termina</h2>
            <div className="appointment-type-create-summary-name">
              <span />
              <strong>Kontrolni pregled</strong>
            </div>

            <div className="appointment-type-create-summary-fields">
              {summaryFields.map((field) => (
                <article key={field.label}>
                  <span>{field.label}</span>
                  {field.badge ? <em>{field.value}</em> : <strong>{field.value}</strong>}
                </article>
              ))}
            </div>

            <div className="appointment-type-create-linked">
              <span>Povezano sa</span>
              <p>Specijalizacije: <strong>-</strong></p>
              <p>Liječnici: <strong>-</strong></p>
              <p>Lokacija: <strong>-</strong></p>
            </div>
          </section>

          <section className="appointment-type-create-next">
            <div>
              <AppIcon name="info" />
              <span>
                <strong>Što slijedi?</strong>
                <p>
                  Nakon spremanja, ovu vrstu termina možete povezati s liječnicima i koristiti
                  prilikom kreiranja i rezerviranja termina.
                </p>
              </span>
            </div>
            <button type="button">
              <AppIcon name="users" />
              Poveži liječnike
            </button>
          </section>
        </aside>
      </div>
    </div>
  )
}

export { CreateAppointmentTypePage }
