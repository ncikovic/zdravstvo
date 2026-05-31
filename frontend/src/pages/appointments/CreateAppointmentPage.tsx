import type {
  AppointmentAvailableSlotDto,
  AppointmentTypeDto,
  DoctorResponseDto,
  PatientDto,
} from "@zdravstvo/contracts";
import { UserStatus } from "@zdravstvo/contracts";
import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { AppIcon } from "@/components";
import {
  appointmentTypesService,
  appointmentsService,
  doctorsService,
  patientsService,
} from "@/services";
import type { AppIconName } from "@/types";
import { getApiErrorMessage, toast } from "@/utils";

import "./createAppointment.css";

interface WizardStep {
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
  tone: "patient" | "doctor" | "type" | "date" | "time";
}

const wizardSteps: readonly WizardStep[] = [
  { number: 1, title: "Pacijent", description: "Odaberite pacijenta" },
  { number: 2, title: "Lijecnik", description: "Odaberite lijecnika" },
  { number: 3, title: "Vrsta termina", description: "Odaberite vrstu termina" },
  { number: 4, title: "Termin potvrde", description: "Provjerite i potvrdite" },
];

const appointmentTypeIcons: readonly AppIconName[] = [
  "calendar",
  "clock",
  "users",
  "shieldCheck",
];
const appointmentTypeTones: readonly ("blue" | "teal" | "purple")[] = [
  "blue",
  "teal",
  "blue",
  "purple",
];
const ACTIVE_USER_STATUS = UserStatus.ACTIVE;

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

const getPatientName = (patient: PatientDto): string =>
  `${patient.firstName} ${patient.lastName}`;

const getDoctorName = (doctor: DoctorResponseDto): string =>
  `Dr. ${doctor.firstName} ${doctor.lastName}`;

function DoctorPortrait(): ReactElement {
  return (
    <span className="appointment-create-doctor-photo" aria-hidden="true">
      <span />
    </span>
  );
}

function CreateAppointmentPage(): ReactElement {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get("patientId") ?? "";
  const [patients, setPatients] = useState<PatientDto[]>([]);
  const [doctors, setDoctors] = useState<DoctorResponseDto[]>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<
    AppointmentTypeDto[]
  >([]);
  const [availableSlots, setAvailableSlots] = useState<
    AppointmentAvailableSlotDto[]
  >([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
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
  const [isLoadingFormData, setIsLoadingFormData] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slotError, setSlotError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadFormData = async (): Promise<void> => {
      try {
        setIsLoadingFormData(true);
        setError(null);

        const [patientData, doctorData, appointmentTypeData] =
          await Promise.all([
            patientsService.list(),
            doctorsService.list(),
            appointmentTypesService.list(),
          ]);

        if (!isMounted) {
          return;
        }

        const activeAppointmentTypes = appointmentTypeData.appointmentTypes.filter(
          (appointmentType) => appointmentType.isActive,
        );
        const activeDoctors = doctorData.doctors.filter((doctor) => doctor.isActive);
        let activePatients = patientData.patients.filter(
          (patient) => patient.status === ACTIVE_USER_STATUS,
        );

        if (
          preselectedPatientId &&
          !activePatients.some((patient) => patient.id === preselectedPatientId)
        ) {
          try {
            const preselectedPatient = await patientsService.getById(
              preselectedPatientId,
            );

            if (preselectedPatient.status === ACTIVE_USER_STATUS) {
              activePatients = [preselectedPatient, ...activePatients];
            }
          } catch {
            activePatients = [...activePatients];
          }
        }

        if (!isMounted) {
          return;
        }

        const selectedPatientCandidate = activePatients.some(
          (patient) => patient.id === preselectedPatientId,
        )
          ? preselectedPatientId
          : (activePatients[0]?.id ?? "");

        setPatients(activePatients);
        setDoctors(activeDoctors);
        setAppointmentTypes(activeAppointmentTypes);
        setSelectedPatientId(selectedPatientCandidate);
        setSelectedDoctorId(activeDoctors[0]?.id ?? "");
        setSelectedAppointmentTypeId(activeAppointmentTypes[0]?.id ?? "");
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(getApiErrorMessage(loadError));
      } finally {
        if (isMounted) {
          setIsLoadingFormData(false);
        }
      }
    };

    void loadFormData();

    return () => {
      isMounted = false;
    };
  }, [preselectedPatientId]);

  useEffect(() => {
    let isMounted = true;

    const loadSlots = async (): Promise<void> => {
      if (!selectedAppointmentTypeId || !selectedDoctorId) {
        setAvailableSlots([]);
        setSelectedSlotStartAt("");
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

        setAvailableSlots(data.slots);
        setSelectedSlotStartAt((currentSlot) =>
          data.slots.some((slot) => slot.startAt === currentSlot)
            ? currentSlot
            : (data.slots[0]?.startAt ?? ""),
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
  }, [selectedAppointmentTypeId, selectedDate, selectedDoctorId]);

  const selectedPatient = patients.find(
    (patient) => patient.id === selectedPatientId,
  );
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

  const summaryItems: SummaryItem[] = [
    {
      label: "Pacijent",
      title: selectedPatient
        ? getPatientName(selectedPatient)
        : "Odaberite pacijenta",
      detail: selectedPatient
        ? formatShortDate(selectedPatient.dateOfBirth)
        : "",
      icon: "user",
      tone: "patient",
    },
    {
      label: "Lijecnik",
      title: selectedDoctor
        ? getDoctorName(selectedDoctor)
        : "Odaberite lijecnika",
      detail: selectedDoctor?.title ?? "Lijecnik",
      icon: "doctor",
      tone: "doctor",
    },
    {
      label: "Vrsta termina",
      title: selectedAppointmentType?.name ?? "Odaberite vrstu termina",
      detail: selectedAppointmentType
        ? `${selectedAppointmentType.defaultDurationMinutes} minuta`
        : "",
      icon: "calendar",
      tone: "type",
    },
    {
      label: "Datum i vrijeme",
      title: formatLongDate(selectedDate),
      detail: selectedSlot
        ? formatTime(selectedSlot.startAt)
        : "Odaberite vrijeme",
      icon: "calendarCheck",
      tone: "date",
    },
    {
      label: "Trajanje",
      title: selectedAppointmentType
        ? `${selectedAppointmentType.defaultDurationMinutes} minuta`
        : "Nije odabrano",
      detail: "",
      icon: "clock",
      tone: "time",
    },
  ];

  const handleSubmit = async (): Promise<void> => {
    if (
      !selectedPatient ||
      !selectedDoctor ||
      !selectedAppointmentType ||
      !selectedSlot
    ) {
      setError(
        "Odaberite pacijenta, lijecnika, vrstu termina i slobodno vrijeme.",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await appointmentsService.create({
        patientId: selectedPatient.id,
        doctorId: selectedDoctor.id,
        appointmentTypeId: selectedAppointmentType.id,
        startAt: selectedSlot.startAt,
        endAt: selectedSlot.endAt,
        notes: `Rezervirano kroz obrazac: ${selectedAppointmentType.name}`,
      });

      toast.success("Termin je uspješno rezerviran.");
      navigate(
        `/appointments?date=${formatDateKey(new Date(selectedSlot.startAt))}`,
      );
    } catch (submitError) {
      toast.error(submitError);
      setError("Termin se trenutno ne može spremiti. Pokušajte ponovo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="appointment-create-page">
      <section className="appointment-create-hero">
        <h1>Rezervacija termina</h1>
        <p>Jednostavno rezervirajte termin u nekoliko koraka.</p>
      </section>

      <nav
        className="appointment-create-stepper"
        aria-label="Koraci rezervacije"
      >
        {wizardSteps.map((step, index) => (
          <div className="appointment-create-step" key={step.number}>
            <span className={step.number === 1 ? "is-active" : ""}>
              {step.number}
            </span>
            <div>
              <strong>{step.title}</strong>
              <small>{step.description}</small>
            </div>
            {index < wizardSteps.length - 1 ? (
              <AppIcon name="chevronRight" />
            ) : null}
          </div>
        ))}
      </nav>

      {error ? (
        <section className="appointment-create-alert" role="alert">
          {error}
        </section>
      ) : null}

      <div className="appointment-create-grid">
        <main
          className="appointment-create-card"
          aria-label="Podaci rezervacije"
        >
          <section className="appointment-create-section">
            <h2>1. Odaberite pacijenta</h2>
            <div className="appointment-create-patient-row">
              <label className="appointment-create-select">
                <AppIcon name="user" />
                <span>
                  {selectedPatient
                    ? `${getPatientName(selectedPatient)} (${formatShortDate(
                        selectedPatient.dateOfBirth,
                      )})`
                    : "Odaberite pacijenta"}
                </span>
                <select
                  aria-label="Pacijent"
                  disabled={isLoadingFormData || patients.length === 0}
                  value={selectedPatientId}
                  onChange={(event) => setSelectedPatientId(event.target.value)}
                >
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {getPatientName(patient)} (
                      {formatShortDate(patient.dateOfBirth)})
                    </option>
                  ))}
                </select>
                <AppIcon name="chevronDown" />
              </label>
              <Link
                className="appointment-create-new-patient"
                to="/patients/new"
              >
                <AppIcon name="plus" />
                Novi pacijent
              </Link>
            </div>
          </section>

          <section className="appointment-create-section">
            <h2>2. Odaberite lijecnika</h2>
            <label className="appointment-create-doctor-select">
              <DoctorPortrait />
              <span>
                <strong>
                  {selectedDoctor
                    ? getDoctorName(selectedDoctor)
                    : "Odaberite lijecnika"}
                </strong>
                <small>{selectedDoctor?.title ?? "Lijecnik"}</small>
              </span>
              <select
                aria-label="Lijecnik"
                disabled={isLoadingFormData || doctors.length === 0}
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

          <section className="appointment-create-section">
            <h2>3. Odaberite vrstu termina</h2>
            <div className="appointment-create-types">
              {appointmentTypes.map((appointmentType, index) => {
                const isSelected =
                  appointmentType.id === selectedAppointmentTypeId;
                const tone =
                  appointmentTypeTones[index % appointmentTypeTones.length];

                return (
                  <button
                    className={[
                      "appointment-create-type",
                      `appointment-create-type--${tone}`,
                      isSelected ? "appointment-create-type--selected" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    key={appointmentType.id}
                    type="button"
                    onClick={() => {
                      setSelectedAppointmentTypeId(appointmentType.id);
                      setSelectedSlotStartAt("");
                    }}
                  >
                    <span>
                      <AppIcon
                        name={
                          appointmentTypeIcons[
                            index % appointmentTypeIcons.length
                          ] ?? "calendar"
                        }
                      />
                    </span>
                    <div>
                      <strong>{appointmentType.name}</strong>
                      <small>
                        {appointmentType.defaultDurationMinutes} min
                      </small>
                    </div>
                    {isSelected ? <AppIcon name="checkCircle" /> : null}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="appointment-create-section">
            <h2>4. Odaberite datum i vrijeme</h2>
            <div className="appointment-create-scheduler">
              <section
                className="appointment-create-month"
                aria-label={`Kalendar za ${formatMonthTitle(visibleMonth)}`}
              >
                <div className="appointment-create-month__header">
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

                <div className="appointment-create-weekdays" aria-hidden="true">
                  {["Pon", "Uto", "Sri", "Cet", "Pet", "Sub", "Ned"].map(
                    (day) => (
                      <span key={day}>{day}</span>
                    ),
                  )}
                </div>

                <div className="appointment-create-calendar">
                  {calendarDays.map((day) => {
                    const isSelected = day.key === formatDateKey(selectedDate);
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
              </section>

              <section
                className="appointment-create-times"
                aria-label="Dostupna vremena"
              >
                <h3>{formatLongDate(selectedDate)}</h3>
                <div>
                  {isLoadingSlots ? (
                    <span className="appointment-create-empty-times">
                      Ucitavanje...
                    </span>
                  ) : null}
                  {!isLoadingSlots &&
                  selectedAppointmentTypeId &&
                  selectedDoctorId &&
                  availableSlots.length === 0 ? (
                    <span className="appointment-create-empty-times">
                      {slotError ?? "Nema slobodnih termina za odabrani dan."}
                    </span>
                  ) : null}
                  {!isLoadingSlots
                    ? availableSlots.map((slot) => (
                        <button
                          className={
                            slot.startAt === selectedSlotStartAt
                              ? "is-selected"
                              : ""
                          }
                          key={slot.startAt}
                          type="button"
                          onClick={() => setSelectedSlotStartAt(slot.startAt)}
                        >
                          {formatTime(slot.startAt)}
                        </button>
                      ))
                    : null}
                </div>
              </section>
            </div>

            <p className="appointment-create-info">
              <AppIcon name="info" />
              Prikazana su slobodna vremena za odabranog lijecnika i vrstu
              termina.
            </p>
          </section>
        </main>

        <aside
          className="appointment-create-summary"
          aria-label="Sazetak rezervacije"
        >
          <h2>Sazetak rezervacije</h2>

          <div className="appointment-create-summary-list">
            {summaryItems.map((item) => (
              <article
                className="appointment-create-summary-item"
                key={item.label}
              >
                <span
                  className={`appointment-create-summary-icon appointment-create-summary-icon--${item.tone}`}
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

          <p className="appointment-create-reminder">
            <AppIcon name="info" />
            Odabrani pacijent, lijecnik, vrsta termina, datum i vrijeme bit ce
            spremljeni kao novi termin.
          </p>

          <button
            className="appointment-create-confirm"
            type="button"
            disabled={isSubmitting || isLoadingFormData || !selectedSlot}
            onClick={() => void handleSubmit()}
          >
            <AppIcon name="calendar" />
            {isSubmitting ? "Spremanje..." : "Potvrdi rezervaciju"}
          </button>

          <Link className="appointment-create-cancel" to="/appointments">
            Ponisti
          </Link>
        </aside>
      </div>
    </div>
  );
}

export { CreateAppointmentPage };
