import type { AppointmentResponseDto } from "@zdravstvo/contracts";
import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { AppIcon } from "@/components";
import { appointmentsService } from "@/services";

import "./appointments.css";

type AppointmentTone = "blue" | "teal" | "orange" | "red" | "gray";

interface DoctorColumn {
  id: string;
  name: string;
  specialty: string;
  initials: string;
  tone: AppointmentTone;
}

interface CalendarAppointment {
  id: string;
  doctorId: string;
  patient: string;
  type: string;
  start: string;
  end: string;
  top: number;
  tone: AppointmentTone;
  selected?: boolean;
}

const DISPLAYED_DOCTOR_LIMIT = 4;
const CALENDAR_START_HOUR = 8;
const CALENDAR_END_HOUR = 18;
const HOUR_ROW_HEIGHT = 57;
const APPOINTMENT_LIMIT = 200;

const hours = Array.from(
  { length: CALENDAR_END_HOUR - CALENDAR_START_HOUR },
  (_, index) => `${String(CALENDAR_START_HOUR + index).padStart(2, "0")}:00`,
);

const formatTime = (date: Date): string =>
  new Intl.DateTimeFormat("hr-HR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

const formatDateKey = (date: Date): string =>
  new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

const formatLongDate = (date: Date): string =>
  new Intl.DateTimeFormat("hr-HR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

const formatShortDate = (date: Date): string =>
  new Intl.DateTimeFormat("hr-HR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

const startOfLocalDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const parseDateQuery = (value: string | null): Date | null => {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(year, month - 1, day);

  return Number.isNaN(date.getTime()) ? null : startOfLocalDay(date);
};

const addDays = (date: Date, days: number): Date => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
};

const getDayRange = (date: Date): { startAt: string; endAt: string } => ({
  startAt: startOfLocalDay(date).toISOString(),
  endAt: addDays(startOfLocalDay(date), 1).toISOString(),
});

const getInitials = (firstName: string, lastName: string): string =>
  `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();

const getDoctorName = (appointment: AppointmentResponseDto): string =>
  `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`;

const getPatientName = (appointment: AppointmentResponseDto): string =>
  `${appointment.patient.firstName} ${appointment.patient.lastName}`;

const getAppointmentTone = (
  appointment: AppointmentResponseDto,
  index: number,
): AppointmentTone => {
  if (appointment.status === "CANCELLED" || appointment.status === "NO_SHOW") {
    return "red";
  }

  if (appointment.status === "COMPLETED") {
    return "gray";
  }

  const tones: AppointmentTone[] = ["teal", "blue", "orange"];
  return tones[index % tones.length] ?? "blue";
};

const getAppointmentTop = (startAt: Date): number => {
  const minutesFromStart =
    (startAt.getHours() - CALENDAR_START_HOUR) * 60 + startAt.getMinutes();
  const constrainedMinutes = Math.max(
    0,
    Math.min(minutesFromStart, (CALENDAR_END_HOUR - CALENDAR_START_HOUR) * 60),
  );

  return 8 + (constrainedMinutes / 60) * HOUR_ROW_HEIGHT;
};

const getAppointmentDurationLabel = (
  appointment: AppointmentResponseDto,
): string => {
  const startAt = new Date(appointment.startAt);
  const endAt = new Date(appointment.endAt);
  const durationMinutes = Math.max(
    0,
    Math.round((endAt.getTime() - startAt.getTime()) / 60000),
  );

  return `${durationMinutes} min`;
};

const buildDoctorColumns = (
  appointments: AppointmentResponseDto[],
): DoctorColumn[] => {
  const doctorsById = new Map<string, DoctorColumn>();

  appointments.forEach((appointment, index) => {
    if (doctorsById.has(appointment.doctor.id)) {
      return;
    }

    doctorsById.set(appointment.doctor.id, {
      id: appointment.doctor.id,
      name: getDoctorName(appointment),
      specialty: appointment.doctor.title ?? "Lijecnik",
      initials: getInitials(
        appointment.doctor.firstName,
        appointment.doctor.lastName,
      ),
      tone: index % 2 === 0 ? "orange" : "blue",
    });
  });

  return Array.from(doctorsById.values()).slice(0, DISPLAYED_DOCTOR_LIMIT);
};

const buildCalendarAppointments = (
  appointments: AppointmentResponseDto[],
  selectedAppointmentId: string | null,
): CalendarAppointment[] =>
  appointments.map((appointment, index) => {
    const startAt = new Date(appointment.startAt);
    const endAt = new Date(appointment.endAt);

    return {
      id: appointment.id,
      doctorId: appointment.doctor.id,
      patient: getPatientName(appointment),
      type: appointment.appointmentType.name,
      start: formatTime(startAt),
      end: formatTime(endAt),
      top: getAppointmentTop(startAt),
      tone: getAppointmentTone(appointment, index),
      selected: appointment.id === selectedAppointmentId,
    };
  });

const buildFreeSlotSummaries = (
  appointments: AppointmentResponseDto[],
  doctors: DoctorColumn[],
): readonly (readonly [string, string, string])[] => {
  const byDoctor = new Map<string, AppointmentResponseDto[]>();

  appointments.forEach((appointment) => {
    const doctorAppointments = byDoctor.get(appointment.doctor.id) ?? [];
    doctorAppointments.push(appointment);
    byDoctor.set(appointment.doctor.id, doctorAppointments);
  });

  return doctors.slice(0, 4).map((doctor) => {
    const doctorAppointments = [...(byDoctor.get(doctor.id) ?? [])].sort(
      (first, second) =>
        new Date(first.startAt).getTime() - new Date(second.startAt).getTime(),
    );
    const lastAppointment = doctorAppointments.at(-1);

    if (!lastAppointment) {
      return [doctor.name, "08:00 - 18:00", "slobodno"] as const;
    }

    const lastEnd = formatTime(new Date(lastAppointment.endAt));
    return [doctor.name, `${lastEnd} - 18:00`, "slobodno"] as const;
  });
};

function AppointmentsPage(): ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const dateFromQuery = useMemo(
    () => parseDateQuery(new URLSearchParams(location.search).get("date")),
    [location.search],
  );
  const [appointments, setAppointments] = useState<AppointmentResponseDto[]>(
    [],
  );
  const [selectedDate, setSelectedDate] = useState<Date>(
    dateFromQuery ?? startOfLocalDay(new Date()),
  );
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedDate(dateFromQuery ?? startOfLocalDay(new Date()));
    setSelectedAppointmentId(null);
  }, [dateFromQuery]);

  useEffect(() => {
    let isMounted = true;

    const loadAppointments = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);
        const dayRange = getDayRange(selectedDate);

        const data = await appointmentsService.list({
          startAt: dayRange.startAt,
          endAt: dayRange.endAt,
          limit: APPOINTMENT_LIMIT,
        });

        if (!isMounted) {
          return;
        }

        const sortedAppointments = [...data].sort(
          (first, second) =>
            new Date(first.startAt).getTime() -
            new Date(second.startAt).getTime(),
        );

        setAppointments(sortedAppointments);
        setSelectedAppointmentId((currentAppointmentId) =>
          sortedAppointments.some(
            (appointment) => appointment.id === currentAppointmentId,
          )
            ? currentAppointmentId
            : (sortedAppointments[0]?.id ?? null),
        );
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Termini se trenutno ne mogu ucitati.",
        );
        setAppointments([]);
        setSelectedAppointmentId(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadAppointments();

    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  const selectedDayAppointments = appointments;
  const doctors = useMemo(
    () => buildDoctorColumns(selectedDayAppointments),
    [selectedDayAppointments],
  );
  const calendarAppointments = useMemo(
    () =>
      buildCalendarAppointments(
        selectedDayAppointments.filter((appointment) =>
          doctors.some((doctor) => doctor.id === appointment.doctor.id),
        ),
        selectedAppointmentId,
      ),
    [doctors, selectedAppointmentId, selectedDayAppointments],
  );
  const selectedAppointment =
    selectedDayAppointments.find(
      (appointment) => appointment.id === selectedAppointmentId,
    ) ??
    selectedDayAppointments[0] ??
    null;
  const freeSlots = useMemo(
    () => buildFreeSlotSummaries(selectedDayAppointments, doctors),
    [doctors, selectedDayAppointments],
  );
  const upcomingAppointments = useMemo(
    () =>
      appointments
        .filter((appointment) => new Date(appointment.startAt) >= new Date())
        .slice(0, 3),
    [appointments],
  );

  const changeDate = (days: number): void => {
    const nextDate = startOfLocalDay(addDays(selectedDate, days));
    navigate(`/appointments?date=${formatDateKey(nextDate)}`);
    setSelectedAppointmentId(null);
  };

  const useToday = (): void => {
    navigate(`/appointments?date=${formatDateKey(new Date())}`);
    setSelectedAppointmentId(null);
  };

  return (
    <div className="appointments-page">
      <div className="appointments-page__hero">
        <div>
          <h1>Termini</h1>
          <p>Pregled dnevnog rasporeda i upravljanje terminima.</p>
        </div>
        <Link className="appointments-primary-button" to="/appointments/create">
          <AppIcon name="plus" />
          Novi termin
        </Link>
      </div>

      {error ? (
        <section className="appointments-side-panel" role="alert">
          <h2>Termini nisu dostupni</h2>
          <p>{error}</p>
        </section>
      ) : null}

      <section className="appointments-filters" aria-label="Filteri termina">
        <label>
          <span>Datum</span>
          <div>
            <AppIcon name="calendar" />
            <strong>
              {selectedDate ? formatShortDate(selectedDate) : "Ucitavanje..."}
            </strong>
            <AppIcon name="chevronDown" />
          </div>
        </label>
        <label>
          <span>Lijecnik</span>
          <div>
            <AppIcon name="user" />
            <strong>Svi lijecnici</strong>
            <AppIcon name="chevronDown" />
          </div>
        </label>
        <label>
          <span>Vrsta termina</span>
          <div>
            <AppIcon name="tag" />
            <strong>Sve vrste</strong>
            <AppIcon name="chevronDown" />
          </div>
        </label>
        <label className="appointments-search-field">
          <span>Pretraga</span>
          <div>
            <AppIcon name="search" />
            <input
              type="search"
              placeholder="Pretrazite pacijente, termine..."
            />
          </div>
        </label>
      </section>

      <div className="appointments-content-grid">
        <section
          className="appointments-calendar-panel"
          aria-label="Dnevni raspored"
        >
          <div className="appointments-calendar-toolbar">
            <div className="appointments-date-controls">
              <button
                type="button"
                aria-label="Prethodni dan"
                onClick={() => changeDate(-1)}
              >
                <AppIcon name="chevronLeft" />
              </button>
              <button type="button" onClick={useToday}>
                Danas
              </button>
              <button
                type="button"
                aria-label="Sljedeci dan"
                onClick={() => changeDate(1)}
              >
                <AppIcon name="chevronRight" />
              </button>
            </div>

            <div className="appointments-current-day">
              {selectedDate ? formatLongDate(selectedDate) : "Ucitavanje..."}
              <AppIcon name="calendar" />
            </div>

            <div className="appointments-view-switcher" aria-label="Prikaz">
              <button
                className="appointments-view-switcher__active"
                type="button"
              >
                Dan
              </button>
              <button type="button">Tjedan</button>
              <button type="button">Mjesec</button>
            </div>
          </div>

          <div
            className="appointments-calendar"
            style={{
              gridTemplateColumns: `76px repeat(${Math.max(doctors.length, 1)}, minmax(182px, 1fr))`,
            }}
          >
            <div className="appointments-calendar__header-spacer" />
            {doctors.map((doctor) => (
              <div className="appointments-doctor-heading" key={doctor.id}>
                <span
                  className={`appointments-avatar appointments-avatar--${doctor.tone}`}
                >
                  {doctor.initials}
                </span>
                <div>
                  <strong>{doctor.name}</strong>
                  <small>{doctor.specialty}</small>
                </div>
              </div>
            ))}

            <div className="appointments-calendar__times">
              {hours.map((hour) => (
                <span key={hour}>{hour}</span>
              ))}
            </div>

            {doctors.map((doctor) => (
              <div className="appointments-doctor-column" key={doctor.id}>
                <div className="appointments-hour-lines">
                  {hours.map((hour) => (
                    <span key={hour} />
                  ))}
                </div>
                {calendarAppointments
                  .filter((appointment) => appointment.doctorId === doctor.id)
                  .map((appointment) => (
                    <Link
                      className={[
                        "appointment-card",
                        `appointment-card--${appointment.tone}`,
                        appointment.selected
                          ? "appointment-card--selected"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      key={appointment.id}
                      style={{ top: `${appointment.top}px` }}
                      to={`/appointments/${appointment.id}`}
                      onMouseEnter={() =>
                        setSelectedAppointmentId(appointment.id)
                      }
                    >
                      <span>
                        {appointment.start} - {appointment.end}
                      </span>
                      <strong>{appointment.patient}</strong>
                      <small>{appointment.type}</small>
                      {appointment.selected ? (
                        <AppIcon name="chevronRight" />
                      ) : null}
                    </Link>
                  ))}
              </div>
            ))}
          </div>

          {isLoading ? (
            <div className="appointments-legend">
              <span>Ucitavanje termina iz baze...</span>
            </div>
          ) : null}

          {!isLoading && selectedDayAppointments.length === 0 ? (
            <div className="appointments-legend">
              <span>Nema termina za odabrani dan.</span>
            </div>
          ) : null}

          <div className="appointments-legend">
            <span>
              <i className="appointments-dot appointments-dot--blue" />
              Zakazano
            </span>
            <span>
              <i className="appointments-dot appointments-dot--teal" />
              Aktivno
            </span>
            <span>
              <i className="appointments-dot appointments-dot--orange" />U
              rasporedu
            </span>
            <span>
              <i className="appointments-dot appointments-dot--red" />
              Otkazano / nedolazak
            </span>
            <span>
              <i className="appointments-dot appointments-dot--gray" />
              Zavrseno
            </span>
          </div>
        </section>

        <aside className="appointments-side-stack" aria-label="Sazetak termina">
          <section className="appointments-side-panel">
            <h2>Slobodni termini</h2>
            <p>
              {selectedDate ? formatShortDate(selectedDate) : "Ucitavanje..."}
            </p>
            <div className="appointments-free-list">
              {freeSlots.length > 0 ? (
                freeSlots.map(([name, time, badge]) => (
                  <div key={name}>
                    <span>
                      <strong>{name}</strong>
                      <small>{time}</small>
                    </span>
                    <em>{badge}</em>
                  </div>
                ))
              ) : (
                <div>
                  <span>
                    <strong>Nema podataka</strong>
                    <small>Za odabrani dan nema prikazanih lijecnika.</small>
                  </span>
                </div>
              )}
            </div>
            <button className="appointments-link-button" type="button">
              Pogledaj sve slobodne termine
              <AppIcon name="chevronRight" />
            </button>
          </section>

          <section className="appointments-side-panel">
            <h2>Podsjetnici</h2>
            <p>{upcomingAppointments.length} nadolazeca termina</p>
            <div className="appointments-reminders">
              {upcomingAppointments.map((appointment, index) => (
                <div
                  className={`appointments-reminder appointments-reminder--${
                    index % 2 === 0 ? "orange" : "teal"
                  }`}
                  key={appointment.id}
                >
                  <AppIcon name="bell" />
                  <span>
                    <strong>{getPatientName(appointment)}</strong>
                    <small>{appointment.appointmentType.name}</small>
                  </span>
                  <time>{formatShortDate(new Date(appointment.startAt))}</time>
                </div>
              ))}
            </div>
            <button className="appointments-link-button" type="button">
              Pogledaj sve podsjetnike
              <AppIcon name="chevronRight" />
            </button>
          </section>

          <section className="appointments-selected-panel">
            <h2>Detalji odabranog termina</h2>
            {selectedAppointment ? (
              <>
                <div className="appointments-selected-card">
                  <span className="appointments-selected-icon">
                    <AppIcon name="calendar" />
                  </span>
                  <div>
                    <strong>{getPatientName(selectedAppointment)}</strong>
                    <small>{selectedAppointment.appointmentType.name}</small>
                    <small>{getDurationLabel(selectedAppointment)}</small>
                  </div>
                  <div>
                    <time>
                      {formatTime(new Date(selectedAppointment.startAt))} -{" "}
                      {formatTime(new Date(selectedAppointment.endAt))}
                    </time>
                    <small>{getDoctorName(selectedAppointment)}</small>
                  </div>
                </div>
                <Link to={`/appointments/${selectedAppointment.id}`}>
                  Pogledaj detalje termina
                  <AppIcon name="chevronRight" />
                </Link>
              </>
            ) : (
              <div className="appointments-selected-card">
                <span className="appointments-selected-icon">
                  <AppIcon name="calendar" />
                </span>
                <div>
                  <strong>Nema odabranog termina</strong>
                  <small>Odaberite termin iz rasporeda.</small>
                </div>
              </div>
            )}
          </section>

          <section className="appointments-side-panel appointments-quick-actions-panel">
            <h2>Brze akcije</h2>
            <div className="appointments-quick-actions">
              <Link to="/appointments/create">
                <AppIcon name="calendar" />
                Novi termin
              </Link>
              <button type="button">
                <AppIcon name="shield" />
                Blokiraj vrijeme
              </button>
              <button type="button">
                <AppIcon name="note" />
                Ispisi raspored
              </button>
              <button type="button">
                <AppIcon name="send" />
                Izvezi raspored
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

const getDurationLabel = getAppointmentDurationLabel;

export { AppointmentsPage };
