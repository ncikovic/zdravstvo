import type {
  AppointmentListQueryDto,
  AppointmentResponseDto,
  AppointmentTypeDto,
  DoctorResponseDto,
} from "@zdravstvo/contracts";
import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { AppIcon } from "@/components";
import {
  useAppointmentsQuery,
  useAppointmentTypesQuery,
  useDoctorsQuery,
} from "@/hooks";

import "./appointments.css";

type AppointmentTone = "blue" | "teal" | "orange" | "red" | "gray";
type FilterKey = "date" | "doctorId" | "appointmentTypeId" | "q";

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

const getDoctorOptionName = (doctor: DoctorResponseDto): string =>
  `Dr. ${doctor.firstName} ${doctor.lastName}`;

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

const mapDoctorOptionToColumn = (
  doctor: DoctorResponseDto,
  index: number,
): DoctorColumn => ({
  id: doctor.id,
  name: getDoctorOptionName(doctor),
  specialty: doctor.title ?? "Lijecnik",
  initials: getInitials(doctor.firstName, doctor.lastName),
  tone: index % 2 === 0 ? "orange" : "blue",
});

const buildDoctorColumns = (
  appointments: AppointmentResponseDto[],
  doctorOptions: DoctorResponseDto[],
  selectedDoctorId: string,
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

  if (selectedDoctorId) {
    const selectedDoctor = doctorOptions.find(
      (doctor) => doctor.id === selectedDoctorId,
    );

    if (selectedDoctor && !doctorsById.has(selectedDoctor.id)) {
      doctorsById.set(
        selectedDoctor.id,
        mapDoctorOptionToColumn(selectedDoctor, 0),
      );
    }

    return Array.from(doctorsById.values()).filter(
      (doctor) => doctor.id === selectedDoctorId,
    );
  }

  if (doctorsById.size > 0) {
    return Array.from(doctorsById.values()).slice(0, DISPLAYED_DOCTOR_LIMIT);
  }

  return doctorOptions
    .slice(0, DISPLAYED_DOCTOR_LIMIT)
    .map((doctor, index) => mapDoctorOptionToColumn(doctor, index));
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

const getErrorMessage = (error: unknown): string | null => {
  if (!error) {
    return null;
  }

  if (
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Termini se trenutno ne mogu ucitati.";
};

function AppointmentsPage(): ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);

  const selectedDate = useMemo(
    () =>
      parseDateQuery(searchParams.get("date")) ?? startOfLocalDay(new Date()),
    [searchParams],
  );
  const selectedDoctorId = searchParams.get("doctorId") ?? "";
  const selectedAppointmentTypeId = searchParams.get("appointmentTypeId") ?? "";
  const searchTerm = searchParams.get("q") ?? "";
  const hasActiveFilters = Boolean(
    selectedDoctorId || selectedAppointmentTypeId || searchTerm.trim(),
  );

  const dayRange = useMemo(() => getDayRange(selectedDate), [selectedDate]);
  const appointmentsQuery = useMemo<AppointmentListQueryDto>(() => {
    const query: AppointmentListQueryDto = {
      ...dayRange,
      limit: APPOINTMENT_LIMIT,
    };
    const normalizedSearchTerm = searchTerm.trim();

    if (selectedDoctorId) {
      query.doctorId = selectedDoctorId;
    }

    if (selectedAppointmentTypeId) {
      query.appointmentTypeId = selectedAppointmentTypeId;
    }

    if (normalizedSearchTerm) {
      query.search = normalizedSearchTerm;
    }

    return query;
  }, [dayRange, searchTerm, selectedAppointmentTypeId, selectedDoctorId]);

  const {
    data: appointmentsData = [],
    error: appointmentsError,
    isLoading: areAppointmentsLoading,
  } = useAppointmentsQuery(appointmentsQuery);
  const {
    data: doctorsData,
    error: doctorsError,
    isLoading: areDoctorsLoading,
  } = useDoctorsQuery();
  const {
    data: appointmentTypesData,
    error: appointmentTypesError,
    isLoading: areAppointmentTypesLoading,
  } = useAppointmentTypesQuery();

  const doctorOptions: DoctorResponseDto[] = doctorsData ?? [];
  const appointmentTypeOptions: AppointmentTypeDto[] =
    appointmentTypesData ?? [];

  const appointments = useMemo(
    () =>
      [...appointmentsData].sort(
        (first, second) =>
          new Date(first.startAt).getTime() -
          new Date(second.startAt).getTime(),
      ),
    [appointmentsData],
  );
  const selectedDayAppointments = appointments;
  const doctors = useMemo(
    () =>
      buildDoctorColumns(
        selectedDayAppointments,
        doctorOptions,
        selectedDoctorId,
      ),
    [doctorOptions, selectedDayAppointments, selectedDoctorId],
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
  const error = getErrorMessage(
    appointmentsError ?? doctorsError ?? appointmentTypesError,
  );

  useEffect(() => {
    setSelectedAppointmentId((currentAppointmentId) =>
      selectedDayAppointments.some(
        (appointment) => appointment.id === currentAppointmentId,
      )
        ? currentAppointmentId
        : (selectedDayAppointments[0]?.id ?? null),
    );
  }, [selectedDayAppointments]);

  const updateFilters = (updates: Partial<Record<FilterKey, string>>): void => {
    const nextParams = new URLSearchParams(searchParams);

    (Object.entries(updates) as [FilterKey, string][]).forEach(
      ([key, value]) => {
        const normalizedValue = key === "q" ? value : value.trim();

        if (normalizedValue.trim()) {
          nextParams.set(key, normalizedValue);
          return;
        }

        nextParams.delete(key);
      },
    );

    setSearchParams(nextParams);
    setSelectedAppointmentId(null);
  };

  const changeDate = (days: number): void => {
    const nextDate = startOfLocalDay(addDays(selectedDate, days));
    updateFilters({ date: formatDateKey(nextDate) });
  };

  const useToday = (): void => {
    updateFilters({ date: formatDateKey(new Date()) });
  };

  const clearFilters = (): void => {
    updateFilters({ doctorId: "", appointmentTypeId: "", q: "" });
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
            <input
              aria-label="Datum termina"
              type="date"
              value={formatDateKey(selectedDate)}
              onChange={(event) => updateFilters({ date: event.target.value })}
            />
            <AppIcon name="chevronDown" />
          </div>
        </label>
        <label>
          <span>Lijecnik</span>
          <div>
            <AppIcon name="user" />
            <select
              aria-label="Lijecnik"
              disabled={areDoctorsLoading}
              value={selectedDoctorId}
              onChange={(event) =>
                updateFilters({ doctorId: event.target.value })
              }
            >
              <option value="">Svi lijecnici</option>
              {doctorOptions.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {getDoctorOptionName(doctor)}
                </option>
              ))}
            </select>
            <AppIcon name="chevronDown" />
          </div>
        </label>
        <label>
          <span>Vrsta termina</span>
          <div>
            <AppIcon name="tag" />
            <select
              aria-label="Vrsta termina"
              disabled={areAppointmentTypesLoading}
              value={selectedAppointmentTypeId}
              onChange={(event) =>
                updateFilters({ appointmentTypeId: event.target.value })
              }
            >
              <option value="">Sve vrste</option>
              {appointmentTypeOptions.map((appointmentType) => (
                <option key={appointmentType.id} value={appointmentType.id}>
                  {appointmentType.name}
                </option>
              ))}
            </select>
            <AppIcon name="chevronDown" />
          </div>
        </label>
        <label className="appointments-search-field">
          <span>Pretraga</span>
          <div>
            <AppIcon name="search" />
            <input
              type="search"
              placeholder="Pretrazite pacijente, lijecnike, termine..."
              value={searchTerm}
              onChange={(event) => updateFilters({ q: event.target.value })}
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
              {formatLongDate(selectedDate)}
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

          {areAppointmentsLoading ? (
            <div className="appointments-legend">
              <span>Ucitavanje termina iz baze...</span>
            </div>
          ) : null}

          {!areAppointmentsLoading && selectedDayAppointments.length === 0 ? (
            <div className="appointments-legend">
              <span>
                {hasActiveFilters
                  ? "Nema termina za odabrane filtere."
                  : "Nema termina za odabrani dan."}
              </span>
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
            {hasActiveFilters ? (
              <button
                className="appointments-clear-filter-button"
                type="button"
                onClick={clearFilters}
              >
                Ocisti filtere
              </button>
            ) : null}
          </div>
        </section>

        <aside className="appointments-side-stack" aria-label="Sazetak termina">
          <section className="appointments-side-panel">
            <h2>Slobodni termini</h2>
            <p>{formatShortDate(selectedDate)}</p>
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
