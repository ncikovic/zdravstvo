import type { ReactElement } from 'react'

import { AppIcon } from '@/components'
import type { AppIconName } from '@/types'

import './appointmentDetails.css'

interface DetailItem {
  label: string
  title: string
  detail?: string
  icon: AppIconName
  tone: 'blue' | 'teal' | 'purple' | 'orange'
  badge?: string
}

interface PatientContact {
  label: string
  value: string
  icon: AppIconName
}

interface ActivityItem {
  title: string
  date: string
  author?: string
  description?: string
  icon: AppIconName
  tone: 'teal' | 'blue' | 'purple'
}

interface ReminderItem {
  title: string
  date: string
  icon: AppIconName
}

const appointmentDetails: readonly DetailItem[] = [
  {
    label: 'Datum',
    title: 'Petak, 23. svibnja 2025.',
    icon: 'calendar',
    tone: 'blue',
  },
  {
    label: 'Vrsta termina',
    title: 'Prvi pregled',
    icon: 'tag',
    tone: 'teal',
  },
  {
    label: 'Vrijeme',
    title: '10:00 - 10:45',
    detail: '(45 min)',
    icon: 'clock',
    tone: 'blue',
  },
  {
    label: 'Status',
    title: 'Termin je potvrđen',
    icon: 'shieldCheck',
    tone: 'teal',
    badge: 'Potvrđeno',
  },
  {
    label: 'Liječnik',
    title: 'Dr. Ivan Horvat, dr. med.',
    detail: 'Specijalist interne medicine',
    icon: 'user',
    tone: 'purple',
  },
  {
    label: 'Razlog dolaska',
    title: 'Kontrola i savjetovanje',
    icon: 'note',
    tone: 'orange',
  },
  {
    label: 'Pacijent',
    title: 'Ana Marić',
    detail: '01.01.1990.',
    icon: 'users',
    tone: 'blue',
  },
  {
    label: 'Lokacija',
    title: 'Poliklinika Medica Zagreb',
    detail: 'Ulica grada Vukovara 12, 10000 Zagreb',
    icon: 'building',
    tone: 'blue',
  },
]

const patientContacts: readonly PatientContact[] = [
  { label: 'Telefon', value: '+385 91 234 5678', icon: 'phone' },
  { label: 'E-mail', value: 'ana.maric@email.hr', icon: 'mail' },
  { label: 'Datum rođenja', value: '01.01.1990.', icon: 'calendar' },
  { label: 'Hitni kontakt', value: 'Ivan Marić (suprug) +385 98 765 4321', icon: 'user' },
]

const activityItems: readonly ActivityItem[] = [
  {
    title: 'Kreirao recepcija',
    date: '18.05.2025. u 09:15',
    author: 'Ana Marić (Administrator)',
    icon: 'plus',
    tone: 'teal',
  },
  {
    title: 'Zadnje ažuriranje',
    date: '18.05.2025. u 09:20',
    author: 'Ana Marić (Administrator)',
    description: 'Ažuriran razlog dolaska',
    icon: 'edit',
    tone: 'blue',
  },
  {
    title: 'Podsjetnik poslan',
    date: '21.05.2025. u 10:00',
    description: 'E-mail podsjetnik poslan pacijentu',
    icon: 'bell',
    tone: 'purple',
  },
]

const reminders: readonly ReminderItem[] = [
  { title: 'E-mail podsjetnik zakazan', date: '21.05.2025. u 10:00', icon: 'mail' },
  { title: 'SMS podsjetnik zakazan', date: '22.05.2025. u 10:00', icon: 'send' },
]

function AppointmentDetailsPage(): ReactElement {
  return (
    <div className="appointment-details-page">
      <div className="appointment-details-hero">
        <div>
          <h1>Detalji termina</h1>
          <p>Pregled informacija o odabranom terminu i povezanom pacijentu.</p>
        </div>

        <button className="appointment-details-options" type="button">
          <AppIcon name="dots" />
          Opcije
          <AppIcon name="chevronDown" />
        </button>
      </div>

      <div className="appointment-details-grid">
        <main className="appointment-details-main">
          <section className="appointment-details-card appointment-details-card--appointment">
            <h2>Informacije o terminu</h2>
            <div className="appointment-details-info-grid">
              {appointmentDetails.map((item) => (
                <article className="appointment-details-info-item" key={`${item.label}-${item.title}`}>
                  <span className={`appointment-details-icon appointment-details-icon--${item.tone}`}>
                    <AppIcon name={item.icon} />
                  </span>
                  <div>
                    <small>{item.label}</small>
                    <strong>
                      {item.title}
                      {item.detail && item.label === 'Vrijeme' ? <em> {item.detail}</em> : null}
                    </strong>
                    {item.badge ? <span>{item.badge}</span> : null}
                    {item.detail && item.label !== 'Vrijeme' ? <p>{item.detail}</p> : null}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="appointment-details-card appointment-details-card--patient">
            <h2>Informacije o pacijentu</h2>
            <div className="appointment-details-patient-head">
              <span>AM</span>
              <div>
                <strong>Ana Marić</strong>
                <em>Aktivan</em>
                <p>01.01.1990. (34 god.) <i /> OIB: 12345678901</p>
              </div>
            </div>

            <div className="appointment-details-contact-grid">
              {patientContacts.map((contact) => (
                <article key={contact.label}>
                  <AppIcon name={contact.icon} />
                  <span>
                    <small>{contact.label}</small>
                    <strong>{contact.value}</strong>
                  </span>
                </article>
              ))}
            </div>
          </section>

          <section className="appointment-details-card appointment-details-note-card">
            <h2>Bilješke uz termin</h2>
            <div className="appointment-details-note">
              <AppIcon name="note" />
              <span>
                <strong>Pacijent dolazi na kontrolu nakon terapije. Provjeriti nalaze laboratorija.</strong>
                <small>Dodano od vas <i /> 18.05.2025. u 09:15</small>
              </span>
              <button type="button" aria-label="Opcije bilješke">
                <AppIcon name="dots" />
              </button>
            </div>
          </section>

          <section className="appointment-details-card appointment-details-reminders-card">
            <h2>Podsjetnici</h2>
            <div className="appointment-details-reminders">
              {reminders.map((reminder) => (
                <article key={reminder.title}>
                  <span>
                    <AppIcon name={reminder.icon} />
                  </span>
                  <div>
                    <strong>{reminder.title}</strong>
                    <small>{reminder.date}</small>
                  </div>
                  <em>Aktivno</em>
                </article>
              ))}
            </div>
          </section>
        </main>

        <aside className="appointment-details-sidebar">
          <section className="appointment-details-card appointment-details-actions">
            <h2>Akcije</h2>
            <button className="appointment-details-action appointment-details-action--primary" type="button">
              <AppIcon name="calendar" />
              Promijeni termin
            </button>
            <button className="appointment-details-action appointment-details-action--danger" type="button">
              <AppIcon name="xCircle" />
              Otkaži termin
            </button>
            <button className="appointment-details-action appointment-details-action--secondary" type="button">
              <AppIcon name="chevronLeft" />
              Povratak na termine
            </button>
          </section>

          <section className="appointment-details-card appointment-details-history">
            <h2>Povijest aktivnosti</h2>
            <div className="appointment-details-timeline">
              {activityItems.map((activity) => (
                <article className={`appointment-details-activity appointment-details-activity--${activity.tone}`} key={activity.title}>
                  <span>
                    <AppIcon name={activity.icon} />
                  </span>
                  <div>
                    <strong>{activity.title}</strong>
                    <time>{activity.date}</time>
                    {activity.author ? <small>{activity.author}</small> : null}
                    {activity.description ? <p>{activity.description}</p> : null}
                  </div>
                </article>
              ))}
            </div>

            <button className="appointment-details-history-link" type="button">
              Pogledaj cijelu povijest
              <AppIcon name="chevronRight" />
            </button>
          </section>
        </aside>
      </div>
    </div>
  )
}

export { AppointmentDetailsPage }
