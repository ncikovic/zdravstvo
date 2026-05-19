import type { AppointmentResponseDto } from "@zdravstvo/contracts";
import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { AppIcon } from "@/components";
import { appointmentsService } from "@/services";
import type { AppIconName } from "@/types";

import "./appointmentDetails.css";

interface DetailItem {
  label: string;
  title: string;
  detail?: string;
  icon: AppIconName;
  tone: "blue" | "teal" | "purple" | "orange";
  badge?: string;
}

interface PatientContact {
  label: string;
  value: string;
  icon: AppIconName;
}

interface ActivityItem {
  title: string;
  date: string;
  author?: string;
  description?: string;
  icon: AppIconName;
  tone: "teal" | "blue" | "purple";
}

interface ReminderItem {
  title: string;
  date: string;
  icon: AppIconName;
}

const formatDateTime = (value: string): string =>
  new Intl.DateTimeFormat("hr-HR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat("hr-HR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));

const formatShortDate = (value: string | null): string =>
  value
    ? new Intl.DateTimeFormat("hr-HR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(value))
    : "Nije evidentirano";

const formatTime = (value: string): string =>
  new Intl.DateTimeFormat("hr-HR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const getDurationMinutes = (appointment: AppointmentResponseDto): number =>
  Math.max(
    0,
    Math.round(
      (new Date(appointment.endAt).getTime() -
        new Date(appointment.startAt).getTime()) /
        60000,
    ),
  );

const getDoctorName = (appointment: AppointmentResponseDto): string =>
  `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`;

const getPatientName = (appointment: AppointmentResponseDto): string =>
  `${appointment.patient.firstName} ${appointment.patient.lastName}`;

const getStatusLabel = (status: AppointmentResponseDto["status"]): string => {
  const labels: Record<AppointmentResponseDto["status"], string> = {
    SCHEDULED: "Zakazano",
    CANCELLED: "Otkazano",
    COMPLETED: "Zavrseno",
    NO_SHOW: "Nedolazak",
  };

  return labels[status];
};

const buildDetails = (appointment: AppointmentResponseDto): DetailItem[] => [
  {
    label: "Datum",
    title: formatDate(appointment.startAt),
    icon: "calendar",
    tone: "blue",
  },
  {
    label: "Vrsta termina",
    title: appointment.appointmentType.name,
    icon: "tag",
    tone: "teal",
  },
  {
    label: "Vrijeme",
    title: `${formatTime(appointment.startAt)} - ${formatTime(appointment.endAt)}`,
    detail: `(${getDurationMinutes(appointment)} min)`,
    icon: "clock",
    tone: "blue",
  },
  {
    label: "Status",
    title: getStatusLabel(appointment.status),
    icon: appointment.status === "SCHEDULED" ? "shieldCheck" : "shield",
    tone: appointment.status === "CANCELLED" ? "orange" : "teal",
    badge: getStatusLabel(appointment.status),
  },
  {
    label: "Lijecnik",
    title: getDoctorName(appointment),
    detail: appointment.doctor.title ?? "Lijecnik",
    icon: "user",
    tone: "purple",
  },
  {
    label: "Razlog dolaska",
    title: appointment.notes ?? "Nije evidentirano",
    icon: "note",
    tone: "orange",
  },
  {
    label: "Pacijent",
    title: getPatientName(appointment),
    detail: formatShortDate(appointment.patient.dateOfBirth),
    icon: "users",
    tone: "blue",
  },
  {
    label: "Identifikator",
    title: appointment.patient.oib ?? "Nije evidentirano",
    detail: `Termin #${appointment.id.slice(0, 8)}`,
    icon: "building",
    tone: "blue",
  },
];

const buildPatientContacts = (
  appointment: AppointmentResponseDto,
): PatientContact[] => [
  {
    label: "OIB",
    value: appointment.patient.oib ?? "Nije evidentirano",
    icon: "user",
  },
  {
    label: "Datum rodjenja",
    value: formatShortDate(appointment.patient.dateOfBirth),
    icon: "calendar",
  },
  {
    label: "Pacijent ID",
    value: appointment.patient.id,
    icon: "clipboard",
  },
  {
    label: "Organizacija ID",
    value: appointment.organizationId,
    icon: "building",
  },
];

const buildActivityItems = (
  appointment: AppointmentResponseDto,
): ActivityItem[] => [
  {
    title: "Termin kreiran",
    date: formatDateTime(appointment.createdAt),
    icon: "plus",
    tone: "teal",
  },
  {
    title: "Zadnje azuriranje",
    date: formatDateTime(appointment.updatedAt),
    description: appointment.notes ?? undefined,
    icon: "edit",
    tone: "blue",
  },
  ...(appointment.cancellationReason
    ? [
        {
          title: "Razlog otkazivanja",
          date: formatDateTime(appointment.updatedAt),
          description: appointment.cancellationReason,
          icon: "bell" as AppIconName,
          tone: "purple" as const,
        },
      ]
    : []),
];

const buildReminders = (
  appointment: AppointmentResponseDto,
): ReminderItem[] => [
  {
    title: "Podsjetnik za termin",
    date: formatDateTime(appointment.startAt),
    icon: "mail",
  },
];

function AppointmentDetailsPage(): ReactElement {
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState<AppointmentResponseDto | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadAppointment = async (): Promise<void> => {
      if (!appointmentId) {
        setError("Nedostaje identifikator termina.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await appointmentsService.getById(appointmentId);

        if (isMounted) {
          setAppointment(data);
        }
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Termin se trenutno ne moze ucitati.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadAppointment();

    return () => {
      isMounted = false;
    };
  }, [appointmentId]);

  const appointmentDetails = useMemo(
    () => (appointment ? buildDetails(appointment) : []),
    [appointment],
  );
  const patientContacts = useMemo(
    () => (appointment ? buildPatientContacts(appointment) : []),
    [appointment],
  );
  const activityItems = useMemo(
    () => (appointment ? buildActivityItems(appointment) : []),
    [appointment],
  );
  const reminders = useMemo(
    () => (appointment ? buildReminders(appointment) : []),
    [appointment],
  );

  if (isLoading) {
    return (
      <div className="appointment-details-page">
        <div className="appointment-details-hero">
          <div>
            <h1>Detalji termina</h1>
            <p>Ucitavanje termina iz baze...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="appointment-details-page">
        <div className="appointment-details-hero">
          <div>
            <h1>Detalji termina</h1>
            <p>{error ?? "Termin nije pronadjen."}</p>
          </div>
          <Link className="appointment-details-options" to="/appointments">
            <AppIcon name="chevronLeft" />
            Povratak na termine
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="appointment-details-page">
      <div className="appointment-details-hero">
        <div>
          <h1>Detalji termina</h1>
          <p>Pregled informacija o odabranom terminu i povezanom pacijentu.</p>
        </div>

        <button className="appointment-details-options" type="button" onClick={() => navigate(`/appointments/${appointment.id}/change`)}>
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
                <article
                  className="appointment-details-info-item"
                  key={`${item.label}-${item.title}`}
                >
                  <span
                    className={`appointment-details-icon appointment-details-icon--${item.tone}`}
                  >
                    <AppIcon name={item.icon} />
                  </span>
                  <div>
                    <small>{item.label}</small>
                    <strong>
                      {item.title}
                      {item.detail && item.label === "Vrijeme" ? (
                        <em> {item.detail}</em>
                      ) : null}
                    </strong>
                    {item.badge ? <span>{item.badge}</span> : null}
                    {item.detail && item.label !== "Vrijeme" ? (
                      <p>{item.detail}</p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="appointment-details-card appointment-details-card--patient">
            <h2>Informacije o pacijentu</h2>
            <div className="appointment-details-patient-head">
              <span>
                {(appointment.patient.firstName[0] ?? "").toUpperCase()}
                {(appointment.patient.lastName[0] ?? "").toUpperCase()}
              </span>
              <div>
                <strong>{getPatientName(appointment)}</strong>
                <em>Aktivan</em>
                <p>
                  {formatShortDate(appointment.patient.dateOfBirth)} <i /> OIB:{" "}
                  {appointment.patient.oib ?? "Nije evidentirano"}
                </p>
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
            <h2>Biljeske uz termin</h2>
            <div className="appointment-details-note">
              <AppIcon name="note" />
              <span>
                <strong>
                  {appointment.notes ?? "Nema evidentiranih biljeski."}
                </strong>
                <small>Azurirano {formatDateTime(appointment.updatedAt)}</small>
              </span>
              <button type="button" aria-label="Opcije biljeske" onClick={() => navigate(`/appointments/${appointment.id}/change`)}>
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
                  <em>
                    {appointment.status === "SCHEDULED"
                      ? "Aktivno"
                      : "Neaktivno"}
                  </em>
                </article>
              ))}
            </div>
          </section>
        </main>

        <aside className="appointment-details-sidebar">
          <section className="appointment-details-card appointment-details-actions">
            <h2>Akcije</h2>
            <Link
              className="appointment-details-action appointment-details-action--primary"
              to={`/appointments/${appointment.id}/change`}
            >
              <AppIcon name="calendar" />
              Promijeni termin
            </Link>
            <Link
              className="appointment-details-action appointment-details-action--danger"
              to={`/appointments/${appointment.id}/cancel`}
            >
              <AppIcon name="xCircle" />
              Otkazi termin
            </Link>
            <Link
              className="appointment-details-action appointment-details-action--secondary"
              to="/appointments"
            >
              <AppIcon name="chevronLeft" />
              Povratak na termine
            </Link>
          </section>

          <section className="appointment-details-card appointment-details-history">
            <h2>Povijest aktivnosti</h2>
            <div className="appointment-details-timeline">
              {activityItems.map((activity) => (
                <article
                  className={`appointment-details-activity appointment-details-activity--${activity.tone}`}
                  key={activity.title}
                >
                  <span>
                    <AppIcon name={activity.icon} />
                  </span>
                  <div>
                    <strong>{activity.title}</strong>
                    <time>{activity.date}</time>
                    {activity.author ? <small>{activity.author}</small> : null}
                    {activity.description ? (
                      <p>{activity.description}</p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>

            <button className="appointment-details-history-link" type="button" onClick={() => navigate('/appointments')}>
              Pogledaj cijelu povijest
              <AppIcon name="chevronRight" />
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}

export { AppointmentDetailsPage };
