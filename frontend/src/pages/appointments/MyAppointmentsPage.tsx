import type { AppointmentListQueryDto, AppointmentResponseDto } from "@zdravstvo/contracts";
import { useMemo, useState } from "react";
import type { ReactElement } from "react";
import { Link } from "react-router-dom";

import { AppIcon } from "@/components";
import { useAppointmentsQuery } from "@/hooks";

import "./myAppointments.css";

type TabKey = "upcoming" | "past" | "cancelled" | "all";

interface Tab {
  key: TabKey;
  label: string;
}

const TABS: readonly Tab[] = [
  { key: "upcoming", label: "Nadolazeći" },
  { key: "past", label: "Prošli" },
  { key: "cancelled", label: "Otkazani" },
  { key: "all", label: "Svi" },
];

const dayFormatter = new Intl.DateTimeFormat("hr-HR", { day: "2-digit" });
const monthFormatter = new Intl.DateTimeFormat("hr-HR", { month: "short" });
const timeFormatter = new Intl.DateTimeFormat("hr-HR", {
  hour: "2-digit",
  minute: "2-digit",
});
const fullDateFormatter = new Intl.DateTimeFormat("hr-HR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const formatDay = (date: Date): string => dayFormatter.format(date);
const formatMonth = (date: Date): string => monthFormatter.format(date);
const formatTime = (date: Date): string => timeFormatter.format(date);
const formatFullDate = (date: Date): string => fullDateFormatter.format(date);

const getDurationMinutes = (appointment: AppointmentResponseDto): number =>
  Math.max(
    0,
    Math.round(
      (new Date(appointment.endAt).getTime() -
        new Date(appointment.startAt).getTime()) /
        60000,
    ),
  );

const getStatusLabel = (status: AppointmentResponseDto["status"]): string => {
  const labels: Record<AppointmentResponseDto["status"], string> = {
    SCHEDULED: "Zakazano",
    COMPLETED: "Završeno",
    CANCELLED: "Otkazano",
    NO_SHOW: "Nedolazak",
  };
  return labels[status];
};

type StatusTone = "teal" | "gray" | "red" | "orange";

const getStatusTone = (status: AppointmentResponseDto["status"]): StatusTone => {
  if (status === "SCHEDULED") return "teal";
  if (status === "COMPLETED") return "gray";
  if (status === "CANCELLED") return "red";
  return "orange";
};

const getDateBadgeTone = (
  status: AppointmentResponseDto["status"],
): "teal" | "gray" | "red" => {
  if (status === "SCHEDULED") return "teal";
  if (status === "CANCELLED") return "red";
  return "gray";
};

const buildQuery = (tab: TabKey, page: number): AppointmentListQueryDto => {
  const now = new Date().toISOString();
  const base: AppointmentListQueryDto = { page };

  if (tab === "upcoming") return { ...base, startAt: now };
  if (tab === "past") return { ...base, endAt: now };
  if (tab === "cancelled") return { ...base, status: "CANCELLED" };
  return base;
};

const getErrorMessage = (error: unknown): string => {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return "Termini se trenutno ne mogu učitati.";
};

const buildPageNumbers = (
  page: number,
  totalPages: number,
): (number | "...")[] =>
  Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | "...")[]>((acc, p, idx, arr) => {
      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);

function AppointmentCard({
  appointment,
}: {
  appointment: AppointmentResponseDto;
}): ReactElement {
  const startAt = new Date(appointment.startAt);
  const tone = getStatusTone(appointment.status);
  const dateTone = getDateBadgeTone(appointment.status);
  const isScheduled = appointment.status === "SCHEDULED";
  const isFuture = startAt > new Date();

  return (
    <div className="my-appointments-card">
      <div
        className={`my-appointments-date-badge my-appointments-date-badge--${dateTone}`}
      >
        <strong>{formatDay(startAt)}</strong>
        <span>{formatMonth(startAt)}</span>
      </div>

      <div className="my-appointments-info">
        <strong>
          dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
        </strong>
        <div className="my-appointments-info-meta">
          <span>
            <AppIcon name="clock" />
            {formatTime(startAt)} ({getDurationMinutes(appointment)} min)
          </span>
          <span>
            <AppIcon name="tag" />
            {appointment.appointmentType.name}
          </span>
          <span>
            <AppIcon name="calendar" />
            {formatFullDate(startAt)}
          </span>
        </div>
      </div>

      <div className="my-appointments-actions">
        <span
          className={`my-appointments-status my-appointments-status--${tone}`}
        >
          {getStatusLabel(appointment.status)}
        </span>
        <div className="my-appointments-action-links">
          <Link
            className="my-appointments-action-link my-appointments-action-link--secondary"
            to={`/appointments/${appointment.id}`}
          >
            Detalji
          </Link>
          {isScheduled && isFuture ? (
            <>
              <Link
                className="my-appointments-action-link my-appointments-action-link--secondary"
                to={`/appointments/${appointment.id}/change`}
              >
                Promijeni
              </Link>
              <Link
                className="my-appointments-action-link my-appointments-action-link--danger"
                to={`/appointments/${appointment.id}/cancel`}
              >
                Otkaži
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function MyAppointmentsPage(): ReactElement {
  const [activeTab, setActiveTab] = useState<TabKey>("upcoming");
  const [page, setPage] = useState(1);

  const query = useMemo(() => buildQuery(activeTab, page), [activeTab, page]);

  const { data, isLoading, error } = useAppointmentsQuery(query);

  const appointments = data?.appointments ?? [];
  const totalItems = data?.totalItems ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const handleTabChange = (tab: TabKey): void => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <div className="my-appointments-page">
      <div className="my-appointments-hero">
        <div>
          <h1>Moji termini</h1>
          <p>Pregled svih vaših termina i upravljanje zakazanim pregledima.</p>
        </div>
        <Link
          className="my-appointments-primary-button"
          to="/appointments/create"
        >
          <AppIcon name="plus" />
          Zakaži termin
        </Link>
      </div>

      <div className="my-appointments-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={[
              "my-appointments-tab",
              activeTab === tab.key ? "my-appointments-tab--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="my-appointments-error" role="alert">
          {getErrorMessage(error)}
        </div>
      ) : null}

      {isLoading ? (
        <div className="my-appointments-empty">
          <AppIcon name="calendar" />
          <strong>Učitavanje termina...</strong>
        </div>
      ) : !error && appointments.length === 0 ? (
        <div className="my-appointments-empty">
          <AppIcon name="calendar" />
          <strong>Nema termina</strong>
          <p>
            {activeTab === "upcoming"
              ? "Nemate nadolazećih termina. Zakažite novi pregled."
              : activeTab === "past"
                ? "Nemate evidentiranih prošlih termina."
                : activeTab === "cancelled"
                  ? "Nemate otkazanih termina."
                  : "Nemate evidentiranih termina."}
          </p>
        </div>
      ) : (
        <>
          <div className="my-appointments-list">
            {appointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>

          <div className="my-appointments-pagination">
            <span>
              Prikazano{" "}
              {Math.min((page - 1) * 10 + 1, totalItems)}–{Math.min(page * 10, totalItems)} od{" "}
              {totalItems} termina
            </span>
            <div>
              <button
                type="button"
                aria-label="Prethodna stranica"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <AppIcon name="chevronLeft" />
              </button>
              {buildPageNumbers(page, totalPages).map((item, idx) =>
                item === "..." ? (
                  <span key={`ellipsis-${idx}`}>...</span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    className={
                      item === page
                        ? "my-appointments-pagination__active"
                        : undefined
                    }
                    onClick={() => setPage(item as number)}
                  >
                    {item}
                  </button>
                ),
              )}
              <button
                type="button"
                aria-label="Sljedeća stranica"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <AppIcon name="chevronRight" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export { MyAppointmentsPage };
