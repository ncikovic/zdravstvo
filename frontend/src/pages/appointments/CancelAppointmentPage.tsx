import type { AppointmentResponseDto } from "@zdravstvo/contracts";
import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { AppIcon } from "@/components";
import { appointmentsService } from "@/services";
import type { AppIconName } from "@/types";
import { getApiErrorMessage, toast } from "@/utils";

import "./cancelAppointment.css";

interface AppointmentDetail {
  label: string;
  title: string;
  detail?: string;
  icon?: AppIconName;
  tone?: "patient" | "doctor" | "type" | "date" | "time" | "location";
  avatar?: boolean;
  status?: boolean;
}

interface CancelReason {
  id: string;
  title: string;
  icon: AppIconName;
}

interface SummaryLine {
  label: string;
  value: string;
  icon: AppIconName;
}

const cancelReasons: readonly CancelReason[] = [
  { id: "patient", title: "Zahtjev pacijenta", icon: "user" },
  { id: "doctor", title: "Lijecnik nije dostupan", icon: "calendar" },
  { id: "schedule", title: "Promjena rasporeda", icon: "calendar" },
  { id: "duplicate", title: "Duplikat termina", icon: "note" },
];

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

const getPatientName = (appointment: AppointmentResponseDto): string =>
  `${appointment.patient.firstName} ${appointment.patient.lastName}`;

const getDoctorName = (appointment: AppointmentResponseDto): string =>
  `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`;

const getStatusLabel = (appointment: AppointmentResponseDto): string => {
  const labels: Record<AppointmentResponseDto["status"], string> = {
    SCHEDULED: "Potvrdjeno",
    CANCELLED: "Otkazano",
    COMPLETED: "Zavrseno",
    NO_SHOW: "Nedolazak",
  };

  return labels[appointment.status];
};

const buildTopDetails = (
  appointment: AppointmentResponseDto,
): AppointmentDetail[] => [
  {
    label: "Pacijent",
    title: getPatientName(appointment),
    detail: formatShortDate(appointment.patient.dateOfBirth),
    icon: "user",
    tone: "patient",
  },
  {
    label: "Lijecnik",
    title: getDoctorName(appointment),
    detail: appointment.doctor.title ?? "Lijecnik",
    avatar: true,
  },
  {
    label: "Vrsta termina",
    title: appointment.appointmentType.name,
    detail: `${getDurationMinutes(appointment)} minuta`,
    icon: "users",
    tone: "type",
  },
  {
    label: "Status",
    title: getStatusLabel(appointment),
    status: true,
  },
];

const buildBottomDetails = (
  appointment: AppointmentResponseDto,
): AppointmentDetail[] => [
  {
    label: "Datum",
    title: formatDate(appointment.startAt),
    detail: formatTime(appointment.startAt),
    icon: "calendar",
    tone: "date",
  },
  {
    label: "Vrijeme",
    title: `${formatTime(appointment.startAt)} - ${formatTime(appointment.endAt)}`,
    detail: `${getDurationMinutes(appointment)} minuta`,
    icon: "clock",
    tone: "time",
  },
  {
    label: "Biljeska",
    title: appointment.notes ?? "Nema biljeske",
    detail: appointment.cancellationReason ?? undefined,
    icon: "mapPin",
    tone: "location",
  },
];

function DoctorPortrait(): ReactElement {
  return (
    <span className="appointment-cancel-doctor-photo" aria-hidden="true">
      <span />
    </span>
  );
}

function AppointmentDetailItem({
  item,
}: {
  item: AppointmentDetail;
}): ReactElement {
  return (
    <article className="appointment-cancel-detail-item">
      {item.avatar ? <DoctorPortrait /> : null}
      {item.icon && item.tone ? (
        <span
          className={`appointment-cancel-detail-icon appointment-cancel-detail-icon--${item.tone}`}
        >
          <AppIcon name={item.icon} />
        </span>
      ) : null}
      {item.status ? (
        <span className="appointment-cancel-status">
          {item.title} <i />
        </span>
      ) : null}
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
  );
}

function CancelAppointmentPage(): ReactElement {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<AppointmentResponseDto | null>(
    null,
  );
  const [selectedReasonId, setSelectedReasonId] = useState(cancelReasons[0].id);
  const [note, setNote] = useState("");
  const [notifyPatient, setNotifyPatient] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

        setError(getApiErrorMessage(loadError));
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

  const selectedReason =
    cancelReasons.find((reason) => reason.id === selectedReasonId) ??
    cancelReasons[0];
  const topDetails = useMemo(
    () => (appointment ? buildTopDetails(appointment) : []),
    [appointment],
  );
  const bottomDetails = useMemo(
    () => (appointment ? buildBottomDetails(appointment) : []),
    [appointment],
  );
  const summaryLines: SummaryLine[] = appointment
    ? [
        { label: "Pacijent", value: getPatientName(appointment), icon: "user" },
        {
          label: "Lijecnik",
          value: getDoctorName(appointment),
          icon: "doctor",
        },
        {
          label: "Vrsta termina",
          value: appointment.appointmentType.name,
          icon: "mail",
        },
        {
          label: "Datum",
          value: formatDate(appointment.startAt),
          icon: "calendar",
        },
        {
          label: "Vrijeme",
          value: `${formatTime(appointment.startAt)} - ${formatTime(appointment.endAt)}`,
          icon: "clock",
        },
        { label: "Status", value: getStatusLabel(appointment), icon: "mapPin" },
        {
          label: "Razlog otkazivanja",
          value: selectedReason.title,
          icon: "user",
        },
        {
          label: "Dodatna napomena",
          value: note.trim() || "Nema napomene",
          icon: "calendar",
        },
      ]
    : [];

  const handleCancel = async (): Promise<void> => {
    if (!appointmentId || !appointment) {
      return;
    }

    const cancellationReason = [selectedReason.title, note.trim()]
      .filter(Boolean)
      .join(" - ");

    try {
      setIsSubmitting(true);
      setError(null);
      await appointmentsService.cancel(appointmentId, {
        cancellationReason,
        notifyPatient,
      });
      toast.success("Termin je uspješno otkazan.");
      navigate(
        `/appointments?date=${formatDateKey(new Date(appointment.startAt))}`,
      );
    } catch (submitError) {
      toast.error(submitError);
      setError("Termin se trenutno ne može otkazati. Pokušajte ponovo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="appointment-cancel-page">
        <section className="appointment-cancel-hero">
          <div>
            <h1>Otkazivanje termina</h1>
            <p>Ucitavanje termina...</p>
          </div>
        </section>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="appointment-cancel-page">
        <section className="appointment-cancel-hero">
          <div>
            <h1>Otkazivanje termina</h1>
            <p>{error ?? "Termin nije pronadjen."}</p>
          </div>
          <div className="appointment-cancel-hero-actions">
            <Link to="/appointments">
              <AppIcon name="clipboard" />
              Povratak na termine
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="appointment-cancel-page">
      <nav className="appointment-cancel-breadcrumb" aria-label="Navigacija">
        <Link to="/appointments">Termini</Link>
        <i>/</i>
        <Link to={`/appointments/${appointment.id}`}>Detalji termina</Link>
        <i>/</i>
        <strong>Otkazivanje termina</strong>
      </nav>

      <section className="appointment-cancel-hero">
        <div>
          <h1>Otkazivanje termina</h1>
          <p>
            Pregledajte termin i potvrdite otkazivanje uz evidentiranje razloga.
          </p>
        </div>

        <div className="appointment-cancel-hero-actions">
          <Link to={`/appointments/${appointment.id}`}>
            <AppIcon name="chevronLeft" />
            Povratak na detalje termina
          </Link>
          <Link to="/appointments">
            <AppIcon name="clipboard" />
            Povratak na termine
          </Link>
        </div>
      </section>

      {error ? (
        <section className="appointment-cancel-alert" role="alert">
          {error}
        </section>
      ) : null}

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
                  className={
                    reason.id === selectedReasonId
                      ? "appointment-cancel-reason is-selected"
                      : "appointment-cancel-reason"
                  }
                  key={reason.id}
                  type="button"
                  onClick={() => setSelectedReasonId(reason.id)}
                >
                  <span className="appointment-cancel-radio" />
                  <AppIcon name={reason.icon} />
                  <strong>{reason.title}</strong>
                </button>
              ))}
            </div>

            <label className="appointment-cancel-note">
              <span>Dodatna napomena (opcionalno)</span>
              <textarea
                maxLength={500}
                placeholder="Upisite dodatnu napomenu..."
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
              <em>{note.length} / 500</em>
            </label>

            <label className="appointment-cancel-notify">
              <input
                checked={notifyPatient}
                type="checkbox"
                onChange={(event) => setNotifyPatient(event.target.checked)}
              />
              <span />
              Obavijesti pacijenta putem e-maila i SMS-a
            </label>
          </section>
        </main>

        <aside
          className="appointment-cancel-card appointment-cancel-confirmation"
          aria-label="Potvrda otkazivanja"
        >
          <div className="appointment-cancel-confirmation-head">
            <span>
              <AppIcon name="warning" />
            </span>
            <div>
              <h2>Potvrda otkazivanja</h2>
              <p>
                Provjerite sazetak termina i razlog otkazivanja. Nakon potvrde,
                termin ce biti otkazan.
              </p>
            </div>
          </div>

          <p className="appointment-cancel-warning">
            <AppIcon name="warning" />
            <span>
              Ova radnja ce promijeniti status termina u{" "}
              <strong>Otkazano.</strong>
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

          <button
            className="appointment-cancel-confirm"
            disabled={isSubmitting || appointment.status !== "SCHEDULED"}
            type="button"
            onClick={() => void handleCancel()}
          >
            <AppIcon name="trash" />
            {isSubmitting ? "Otkazivanje..." : "Potvrdi otkazivanje"}
          </button>

          <Link
            className="appointment-cancel-cancel"
            to={`/appointments/${appointment.id}`}
          >
            Odustani
          </Link>
        </aside>
      </div>
    </div>
  );
}

const formatDateKey = (date: Date): string =>
  new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

export { CancelAppointmentPage };
