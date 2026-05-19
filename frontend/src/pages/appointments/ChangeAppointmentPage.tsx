import type {
  AppointmentAvailableSlotDto,
  AppointmentResponseDto,
  AppointmentTypeDto,
  DoctorResponseDto,
} from "@zdravstvo/contracts";
import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { AppIcon } from "@/components";
import {
  appointmentTypesService,
  appointmentsService,
  doctorsService,
} from "@/services";
import type { AppIconName } from "@/types";
import { getApiErrorMessage, toast } from "@/utils";

import "./changeAppointment.css";

interface ChangeStep {
  number: number;
  title: string;
  description: string;
}

interface CalendarDay {
  key: string;
  label: string;
  date: Date;
  isMuted: boolean;
}

interface SummaryItem {
  label: string;
  title: string;
  detail: string;
  icon: AppIconName;
  tone: "patient" | "doctor" | "type" | "old" | "new" | "duration";
}

const changeSteps: readonly ChangeStep[] = [
  {
    number: 1,
    title: "Odabir termina",
    description: "Pregled trenutnog termina",
  },
  {
    number: 2,
    title: "Novi termin",
    description: "Odaberite novi datum i vrijeme",
  },
  {
    number: 3,
    title: "Pregled promjene",
    description: "Provjerite i spremite promjenu",
  },
];

const formatDateKey = (date: Date): string =>
  new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

const formatMonthTitle = (date: Date): string =>
  new Intl.DateTimeFormat("hr-HR", {
    month: "long",
    year: "numeric",
  }).format(date);

const formatLongDate = (date: Date): string =>
  new Intl.DateTimeFormat("hr-HR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

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

const startOfLocalDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addMonths = (date: Date, months: number): Date =>
  new Date(date.getFullYear(), date.getMonth() + months, 1);

const buildCalendarDays = (visibleMonth: Date): CalendarDay[] => {
  const firstDay = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth(),
    1,
  );
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const firstVisibleDay = new Date(firstDay);
  firstVisibleDay.setDate(firstDay.getDate() - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstVisibleDay);
    date.setDate(firstVisibleDay.getDate() + index);

    return {
      key: formatDateKey(date),
      label: String(date.getDate()),
      date,
      isMuted: date.getMonth() !== visibleMonth.getMonth(),
    };
  });
};

const getPatientName = (appointment: AppointmentResponseDto): string =>
  `${appointment.patient.firstName} ${appointment.patient.lastName}`;

const getDoctorName = (doctor: DoctorResponseDto): string =>
  `Dr. ${doctor.firstName} ${doctor.lastName}`;

const getAppointmentDoctorName = (
  appointment: AppointmentResponseDto,
): string =>
  `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`;

function DoctorPortrait(): ReactElement {
  return (
    <span className="appointment-change-doctor-photo" aria-hidden="true">
      <span />
    </span>
  );
}

function ChangeAppointmentPage(): ReactElement {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<AppointmentResponseDto | null>(
    null,
  );
  const [doctors, setDoctors] = useState<DoctorResponseDto[]>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<
    AppointmentTypeDto[]
  >([]);
  const [availableSlots, setAvailableSlots] = useState<
    AppointmentAvailableSlotDto[]
  >([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedAppointmentTypeId, setSelectedAppointmentTypeId] =
    useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(
    startOfLocalDay(new Date()),
  );
  const [visibleMonth, setVisibleMonth] = useState<Date>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [selectedSlotStartAt, setSelectedSlotStartAt] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slotError, setSlotError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadFormData = async (): Promise<void> => {
      if (!appointmentId) {
        setError("Nedostaje identifikator termina.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const [appointmentData, doctorData, appointmentTypeData] =
          await Promise.all([
            appointmentsService.getById(appointmentId),
            doctorsService.list(),
            appointmentTypesService.list(),
          ]);

        if (!isMounted) {
          return;
        }

        const startAt = new Date(appointmentData.startAt);
        const appointmentDay = startOfLocalDay(startAt);

        setAppointment(appointmentData);
        setDoctors(doctorData.doctors.filter((doctor) => doctor.isActive));
        setAppointmentTypes(
          appointmentTypeData.appointmentTypes.filter(
            (appointmentType) => appointmentType.isActive,
          ),
        );
        setSelectedDoctorId(appointmentData.doctor.id);
        setSelectedAppointmentTypeId(appointmentData.appointmentType.id);
        setSelectedDate(appointmentDay);
        setVisibleMonth(
          new Date(appointmentDay.getFullYear(), appointmentDay.getMonth(), 1),
        );
        setSelectedSlotStartAt(appointmentData.startAt);
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

    void loadFormData();

    return () => {
      isMounted = false;
    };
  }, [appointmentId]);

  useEffect(() => {
    let isMounted = true;

    const loadSlots = async (): Promise<void> => {
      if (!appointment || !selectedAppointmentTypeId || !selectedDoctorId) {
        setAvailableSlots([]);
        return;
      }

      try {
        setIsLoadingSlots(true);
        setSlotError(null);

        const data = await appointmentsService.findAvailableSlots({
          appointmentTypeId: selectedAppointmentTypeId,
          doctorId: selectedDoctorId,
          date: formatDateKey(selectedDate),
          limit: 200,
        });

        if (!isMounted) {
          return;
        }

        const currentSlot: AppointmentAvailableSlotDto = {
          doctorId: appointment.doctor.id,
          doctorName: getAppointmentDoctorName(appointment),
          doctorTitle: appointment.doctor.title,
          startAt: appointment.startAt,
          endAt: appointment.endAt,
          durationMinutes: Math.max(
            0,
            Math.round(
              (new Date(appointment.endAt).getTime() -
                new Date(appointment.startAt).getTime()) /
                60000,
            ),
          ),
        };
        const isCurrentSlotOnSelectedSchedule =
          selectedDoctorId === appointment.doctor.id &&
          selectedAppointmentTypeId === appointment.appointmentType.id &&
          formatDateKey(selectedDate) ===
            formatDateKey(new Date(appointment.startAt));
        const nextSlots = isCurrentSlotOnSelectedSchedule
          ? [
              currentSlot,
              ...data.slots.filter(
                (slot) => slot.startAt !== appointment.startAt,
              ),
            ].sort(
              (first, second) =>
                new Date(first.startAt).getTime() -
                new Date(second.startAt).getTime(),
            )
          : data.slots;

        setAvailableSlots(nextSlots);
        setSelectedSlotStartAt((currentSlotStartAt) =>
          nextSlots.some((slot) => slot.startAt === currentSlotStartAt)
            ? currentSlotStartAt
            : (nextSlots[0]?.startAt ?? ""),
        );
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setAvailableSlots([]);
        setSelectedSlotStartAt("");
        setSlotError(getApiErrorMessage(loadError));
      } finally {
        if (isMounted) {
          setIsLoadingSlots(false);
        }
      }
    };

    void loadSlots();

    return () => {
      isMounted = false;
    };
  }, [appointment, selectedAppointmentTypeId, selectedDate, selectedDoctorId]);

  const selectedDoctor = doctors.find(
    (doctor) => doctor.id === selectedDoctorId,
  );
  const selectedAppointmentType = appointmentTypes.find(
    (appointmentType) => appointmentType.id === selectedAppointmentTypeId,
  );
  const selectedSlot = availableSlots.find(
    (slot) => slot.startAt === selectedSlotStartAt,
  );
  const calendarDays = useMemo(
    () => buildCalendarDays(visibleMonth),
    [visibleMonth],
  );

  const oldDate = appointment ? new Date(appointment.startAt) : selectedDate;
  const newDate = selectedSlot ? new Date(selectedSlot.startAt) : selectedDate;
  const summaryItems: SummaryItem[] = appointment
    ? [
        {
          label: "Pacijent",
          title: getPatientName(appointment),
          detail: formatShortDate(appointment.patient.dateOfBirth),
          icon: "user",
          tone: "patient",
        },
        {
          label: "Lijecnik",
          title: selectedDoctor
            ? getDoctorName(selectedDoctor)
            : getAppointmentDoctorName(appointment),
          detail:
            selectedDoctor?.title ?? appointment.doctor.title ?? "Lijecnik",
          icon: "doctor",
          tone: "doctor",
        },
        {
          label: "Vrsta termina",
          title:
            selectedAppointmentType?.name ?? appointment.appointmentType.name,
          detail: `${
            selectedAppointmentType?.defaultDurationMinutes ??
            appointment.appointmentType.defaultDurationMinutes
          } minuta`,
          icon: "calendar",
          tone: "type",
        },
        {
          label: "Stari termin",
          title: formatLongDate(oldDate),
          detail: formatTime(appointment.startAt),
          icon: "clock",
          tone: "old",
        },
        {
          label: "Novi termin",
          title: formatLongDate(newDate),
          detail: selectedSlot
            ? formatTime(selectedSlot.startAt)
            : "Odaberite vrijeme",
          icon: "clock",
          tone: "new",
        },
        {
          label: "Trajanje",
          title: `${
            selectedAppointmentType?.defaultDurationMinutes ??
            appointment.appointmentType.defaultDurationMinutes
          } minuta`,
          detail: "",
          icon: "clock",
          tone: "duration",
        },
      ]
    : [];

  const handleSubmit = async (): Promise<void> => {
    if (
      !appointmentId ||
      !appointment ||
      !selectedSlot ||
      !selectedAppointmentType
    ) {
      setError("Odaberite lijecnika, vrstu termina i slobodno vrijeme.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await appointmentsService.reschedule(appointmentId, {
        doctorId: selectedDoctorId,
        appointmentTypeId: selectedAppointmentType.id,
        startAt: selectedSlot.startAt,
        endAt: selectedSlot.endAt,
        notes: appointment.notes,
      });

      toast.success("Termin je uspješno premješten.");
      navigate(
        `/appointments?date=${formatDateKey(new Date(selectedSlot.startAt))}`,
      );
    } catch (submitError) {
      toast.error(submitError);
      setError("Promjena termina trenutno se ne može spremiti. Pokušajte ponovo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="appointment-change-page">
        <section className="appointment-change-hero">
          <div>
            <h1>Promjena termina</h1>
            <p>Ucitavanje termina...</p>
          </div>
        </section>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="appointment-change-page">
        <section className="appointment-change-hero">
          <div>
            <h1>Promjena termina</h1>
            <p>{error ?? "Termin nije pronadjen."}</p>
          </div>
          <Link className="appointment-change-back" to="/appointments">
            <AppIcon name="chevronLeft" />
            Povratak na termine
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="appointment-change-page">
      <nav className="appointment-change-breadcrumb" aria-label="Navigacija">
        <Link to="/appointments">
          <AppIcon name="home" />
          Termini
        </Link>
        <AppIcon name="chevronRight" />
        <Link to={`/appointments/${appointment.id}`}>Detalji termina</Link>
        <AppIcon name="chevronRight" />
        <strong>Promjena termina</strong>
      </nav>

      <section className="appointment-change-hero">
        <div>
          <h1>Promjena termina</h1>
          <p>Azurirajte datum, vrijeme ili lijecnika za postojeci termin.</p>
        </div>
        <Link
          className="appointment-change-back"
          to={`/appointments/${appointment.id}`}
        >
          <AppIcon name="chevronLeft" />
          Povratak na detalje termina
        </Link>
      </section>

      <nav
        className="appointment-change-stepper"
        aria-label="Koraci promjene termina"
      >
        {changeSteps.map((step, index) => (
          <div className="appointment-change-step" key={step.number}>
            <span className={step.number === 1 ? "is-active" : ""}>
              {step.number}
            </span>
            <div>
              <strong>{step.title}</strong>
              <small>{step.description}</small>
            </div>
            {index < changeSteps.length - 1 ? (
              <AppIcon name="chevronRight" />
            ) : null}
          </div>
        ))}
      </nav>

      {error ? (
        <section className="appointment-change-alert" role="alert">
          {error}
        </section>
      ) : null}

      <div className="appointment-change-grid">
        <main className="appointment-change-card" aria-label="Promjena termina">
          <section className="appointment-change-section">
            <h2>1. Pacijent</h2>
            <div className="appointment-change-patient-row">
              <div className="appointment-change-select">
                <AppIcon name="user" />
                <span>
                  {getPatientName(appointment)} (
                  {formatShortDate(appointment.patient.dateOfBirth)})
                </span>
                <AppIcon name="chevronDown" />
              </div>
              <Link
                className="appointment-change-new-patient"
                to="/patients/new"
              >
                <AppIcon name="plus" />
                Novi pacijent
              </Link>
            </div>
          </section>

          <section className="appointment-change-section">
            <h2>2. Lijecnik</h2>
            <label className="appointment-change-doctor-select">
              <DoctorPortrait />
              <span>
                <strong>
                  {selectedDoctor
                    ? getDoctorName(selectedDoctor)
                    : getAppointmentDoctorName(appointment)}
                </strong>
                <small>
                  {selectedDoctor?.title ?? appointment.doctor.title}
                </small>
              </span>
              <select
                aria-label="Lijecnik"
                value={selectedDoctorId}
                onChange={(event) => {
                  setSelectedDoctorId(event.target.value);
                  setSelectedSlotStartAt("");
                }}
              >
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {getDoctorName(doctor)} - {doctor.title ?? "Lijecnik"}
                  </option>
                ))}
              </select>
              <AppIcon name="chevronDown" />
            </label>
          </section>

          <section className="appointment-change-section">
            <h2>3. Vrsta termina</h2>
            <label className="appointment-change-type-select">
              <span>
                <AppIcon name="clock" />
              </span>
              <div>
                <strong>
                  {selectedAppointmentType?.name ??
                    appointment.appointmentType.name}
                </strong>
                <small>
                  {selectedAppointmentType?.defaultDurationMinutes ??
                    appointment.appointmentType.defaultDurationMinutes}{" "}
                  min
                </small>
              </div>
              <select
                aria-label="Vrsta termina"
                value={selectedAppointmentTypeId}
                onChange={(event) => {
                  setSelectedAppointmentTypeId(event.target.value);
                  setSelectedSlotStartAt("");
                }}
              >
                {appointmentTypes.map((appointmentType) => (
                  <option key={appointmentType.id} value={appointmentType.id}>
                    {appointmentType.name} -{" "}
                    {appointmentType.defaultDurationMinutes} min
                  </option>
                ))}
              </select>
              <AppIcon name="chevronDown" />
            </label>
          </section>

          <section className="appointment-change-section appointment-change-schedule-section">
            <div className="appointment-change-scheduler">
              <section
                className="appointment-change-month"
                aria-label={`Kalendar za ${formatMonthTitle(visibleMonth)}`}
              >
                <h2>4. Odaberite novi datum</h2>
                <div className="appointment-change-month-panel">
                  <div className="appointment-change-month__header">
                    <button
                      type="button"
                      aria-label="Prethodni mjesec"
                      onClick={() =>
                        setVisibleMonth((date) => addMonths(date, -1))
                      }
                    >
                      <AppIcon name="chevronLeft" />
                    </button>
                    <strong>{formatMonthTitle(visibleMonth)}</strong>
                    <button
                      type="button"
                      aria-label="Sljedeci mjesec"
                      onClick={() =>
                        setVisibleMonth((date) => addMonths(date, 1))
                      }
                    >
                      <AppIcon name="chevronRight" />
                    </button>
                  </div>
                  <div
                    className="appointment-change-weekdays"
                    aria-hidden="true"
                  >
                    {["Pon", "Uto", "Sri", "Cet", "Pet", "Sub", "Ned"].map(
                      (day) => (
                        <span key={day}>{day}</span>
                      ),
                    )}
                  </div>
                  <div className="appointment-change-calendar">
                    {calendarDays.map((day) => {
                      const isSelected =
                        day.key === formatDateKey(selectedDate);
                      const isPast =
                        startOfLocalDay(day.date) < startOfLocalDay(new Date());

                      return (
                        <button
                          className={[
                            day.isMuted ? "is-muted" : "",
                            isSelected ? "is-selected" : "",
                            isPast ? "is-disabled" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          disabled={isPast}
                          key={day.key}
                          type="button"
                          onClick={() => {
                            setSelectedDate(startOfLocalDay(day.date));
                            setSelectedSlotStartAt("");
                          }}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              <section
                className="appointment-change-times"
                aria-label="Dostupna vremena"
              >
                <h2>5. Odaberite novo vrijeme</h2>
                <p>{formatLongDate(selectedDate)}</p>
                <div>
                  {isLoadingSlots ? (
                    <span className="appointment-change-empty-times">
                      Ucitavanje...
                    </span>
                  ) : null}
                  {!isLoadingSlots && availableSlots.length === 0 ? (
                    <span className="appointment-change-empty-times">
                      {slotError ?? "Nema slobodnih termina za odabrani dan."}
                    </span>
                  ) : null}
                  {!isLoadingSlots
                    ? availableSlots.map((slot) => {
                        const isCurrent = slot.startAt === appointment.startAt;

                        return (
                          <button
                            className={[
                              slot.startAt === selectedSlotStartAt
                                ? "is-selected"
                                : "",
                              isCurrent ? "is-current" : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                            key={slot.startAt}
                            type="button"
                            onClick={() => setSelectedSlotStartAt(slot.startAt)}
                          >
                            {formatTime(slot.startAt)}
                            {isCurrent ? <AppIcon name="shield" /> : null}
                          </button>
                        );
                      })
                    : null}
                </div>
              </section>
            </div>

            <p className="appointment-change-comparison">
              <AppIcon name="info" />
              <span>Stari termin:</span>
              <strong>{formatTime(appointment.startAt)}</strong>
              <AppIcon name="chevronRight" />
              <span>Novi termin:</span>
              <em>
                {selectedSlot ? formatTime(selectedSlot.startAt) : "--:--"}
              </em>
            </p>
          </section>
        </main>

        <aside
          className="appointment-change-summary"
          aria-label="Sazetak promjene"
        >
          <h2>Sazetak promjene</h2>

          <div className="appointment-change-summary-list">
            {summaryItems.map((item) => (
              <article
                className="appointment-change-summary-item"
                key={item.label}
              >
                <span
                  className={`appointment-change-summary-icon appointment-change-summary-icon--${item.tone}`}
                >
                  <AppIcon name={item.icon} />
                </span>
                <div>
                  <small>{item.label}</small>
                  <strong>{item.title}</strong>
                  {item.detail ? <span>{item.detail}</span> : null}
                </div>
              </article>
            ))}
          </div>

          <p className="appointment-change-reminder">
            <AppIcon name="info" />
            Novi datum, vrijeme, lijecnik i vrsta termina bit ce spremljeni u
            bazu i prikazani na rasporedu.
          </p>

          <button
            className="appointment-change-confirm"
            type="button"
            disabled={isSubmitting || !selectedSlot}
            onClick={() => void handleSubmit()}
          >
            <AppIcon name="calendarCheck" />
            {isSubmitting ? "Spremanje..." : "Spremi promjenu"}
          </button>

          <Link
            className="appointment-change-cancel"
            to={`/appointments/${appointment.id}`}
          >
            Odustani
          </Link>

          <Link className="appointment-change-return" to="/appointments">
            <AppIcon name="chevronLeft" />
            Povratak na termine
          </Link>
        </aside>
      </div>
    </div>
  );
}

export { ChangeAppointmentPage };
