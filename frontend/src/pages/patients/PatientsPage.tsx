import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserStatus,
  type AppointmentResponseDto,
  type AppointmentTypeDto,
  type PatientDto,
} from "@zdravstvo/contracts";

import { AppIcon } from "@/components";
import { APP_ROUTES } from "@/app/routes";
import {
  appointmentTypesService,
  appointmentsService,
  patientsService,
} from "@/services";
import { getApiErrorMessage } from "@/utils";

import "./patients.css";

type PatientTone =
  | "teal"
  | "purple"
  | "violet"
  | "green"
  | "orange"
  | "blue"
  | "red";

type PatientStatusFilter = "all" | UserStatus.ACTIVE | UserStatus.DISABLED;
type AppointmentTimingFilter = "all" | "upcoming" | "last30" | "none";

const tones: PatientTone[] = [
  "teal",
  "purple",
  "violet",
  "green",
  "orange",
  "blue",
  "red",
];

const dateFormatter = new Intl.DateTimeFormat("hr-HR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("hr-HR", {
  hour: "2-digit",
  minute: "2-digit",
});

const getTone = (index: number): PatientTone => tones[index % tones.length];

const getInitials = (patient: PatientDto): string =>
  `${patient.firstName[0] ?? "P"}${patient.lastName[0] ?? "P"}`.toUpperCase();

const getFullName = (patient: PatientDto): string =>
  `${patient.firstName} ${patient.lastName}`;

const getPatientStatus = (patient: PatientDto): "Aktivan" | "Neaktivan" =>
  patient.status === UserStatus.ACTIVE ? "Aktivan" : "Neaktivan";

const getAppointmentStatusLabel = (
  status: AppointmentResponseDto["status"],
): string => {
  const labels: Record<AppointmentResponseDto["status"], string> = {
    SCHEDULED: "Zakazano",
    CANCELLED: "Otkazano",
    COMPLETED: "Završeno",
    NO_SHOW: "Nedolazak",
  };

  return labels[status];
};

const getAppointmentTimestamp = (appointment: AppointmentResponseDto): number =>
  new Date(appointment.startAt).getTime();

const sortAppointmentsAscending = (
  firstAppointment: AppointmentResponseDto,
  secondAppointment: AppointmentResponseDto,
): number => getAppointmentTimestamp(firstAppointment) - getAppointmentTimestamp(secondAppointment);

const sortAppointmentsDescending = (
  firstAppointment: AppointmentResponseDto,
  secondAppointment: AppointmentResponseDto,
): number => getAppointmentTimestamp(secondAppointment) - getAppointmentTimestamp(firstAppointment);

const formatAppointmentDate = (appointment: AppointmentResponseDto): string => {
  const date = new Date(appointment.startAt);

  if (Number.isNaN(date.getTime())) {
    return "Nije dostupno";
  }

  return `${dateFormatter.format(date)} u ${timeFormatter.format(date)}`;
};

const formatLastAppointment = (
  appointments: readonly AppointmentResponseDto[],
): string => {
  if (appointments.length === 0) {
    return "Nije dostupno";
  }

  const now = Date.now();
  const pastAppointment = [...appointments]
    .filter((appointment) => getAppointmentTimestamp(appointment) <= now)
    .sort(sortAppointmentsDescending)[0];

  if (pastAppointment) {
    return formatAppointmentDate(pastAppointment);
  }

  const nextAppointment = [...appointments].sort(sortAppointmentsAscending)[0];

  return nextAppointment ? `Uskoro: ${formatAppointmentDate(nextAppointment)}` : "Nije dostupno";
};

function PatientsPage(): ReactElement {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<PatientDto[]>([]);
  const [appointments, setAppointments] = useState<AppointmentResponseDto[]>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentTypeDto[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PatientStatusFilter>("all");
  const [appointmentTypeFilter, setAppointmentTypeFilter] = useState("all");
  const [appointmentTimingFilter, setAppointmentTimingFilter] =
    useState<AppointmentTimingFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setIsLoading(true);
        const data = await patientsService.list(page);
        setPatients(data.patients);
        setTotalPages(data.totalPages);
        setTotalItems(data.totalItems);
        setSelectedPatientId((current) =>
          data.patients.some((patient) => patient.id === current) ? current : null,
        );
        setError(null);
      } catch (err) {
        setError(getApiErrorMessage(err));
        setPatients([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, [page]);

  useEffect(() => {
    const fetchFilterData = async (): Promise<void> => {
      try {
        const [appointmentTypeData, appointmentData] = await Promise.all([
          appointmentTypesService.list({ page: 1, isActive: true }),
          appointmentsService.list({ limit: 200 }),
        ]);

        setAppointmentTypes(appointmentTypeData.appointmentTypes);
        setAppointments(appointmentData.appointments);
      } catch {
        setAppointmentTypes([]);
        setAppointments([]);
      }
    };

    void fetchFilterData();
  }, []);

  const appointmentsByPatient = useMemo(() => {
    const groupedAppointments = new Map<string, AppointmentResponseDto[]>();

    for (const appointment of appointments) {
      const patientAppointments = groupedAppointments.get(appointment.patient.id) ?? [];

      patientAppointments.push(appointment);
      groupedAppointments.set(appointment.patient.id, patientAppointments);
    }

    return groupedAppointments;
  }, [appointments]);

  const filteredPatients = useMemo(() => {
    const value = search.trim().toLowerCase();
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    return patients.filter((patient) => {
      const patientAppointments = appointmentsByPatient.get(patient.id) ?? [];

      if (statusFilter !== "all" && patient.status !== statusFilter) {
        return false;
      }

      if (
        appointmentTypeFilter !== "all" &&
        !patientAppointments.some(
          (appointment) => appointment.appointmentType.id === appointmentTypeFilter,
        )
      ) {
        return false;
      }

      if (appointmentTimingFilter === "upcoming") {
        const hasUpcomingAppointment = patientAppointments.some(
          (appointment) =>
            appointment.status === "SCHEDULED" && getAppointmentTimestamp(appointment) >= now,
        );

        if (!hasUpcomingAppointment) {
          return false;
        }
      }

      if (appointmentTimingFilter === "last30") {
        const hasRecentAppointment = patientAppointments.some((appointment) => {
          const appointmentTime = getAppointmentTimestamp(appointment);

          return appointmentTime < now && appointmentTime >= thirtyDaysAgo;
        });

        if (!hasRecentAppointment) {
          return false;
        }
      }

      if (appointmentTimingFilter === "none" && patientAppointments.length > 0) {
        return false;
      }

      if (!value) {
        return true;
      }

      return [
        getFullName(patient),
        patient.oib,
        patient.phone,
        patient.email,
        patient.address,
        patient.notes,
      ]
        .filter(Boolean)
        .some((field) => field?.toLowerCase().includes(value));
    });
  }, [
    appointmentTimingFilter,
    appointmentTypeFilter,
    appointmentsByPatient,
    patients,
    search,
    statusFilter,
  ]);

  const selectedPatientCandidate = selectedPatientId
    ? filteredPatients.find((patient) => patient.id === selectedPatientId) ?? null
    : null;
  const selectedPatient = isDetailPanelOpen ? selectedPatientCandidate : null;
  const selectedPatientAppointments = selectedPatient
    ? appointmentsByPatient.get(selectedPatient.id) ?? []
    : [];
  const selectedUpcomingAppointments = [...selectedPatientAppointments]
    .filter(
      (appointment) =>
        appointment.status === "SCHEDULED" && getAppointmentTimestamp(appointment) >= Date.now(),
    )
    .sort(sortAppointmentsAscending)
    .slice(0, 3);

  const clearFilters = (): void => {
    setSearch("");
    setStatusFilter("all");
    setAppointmentTypeFilter("all");
    setAppointmentTimingFilter("all");
  };

  return (
    <div className="patients-page">
      <div className="patients-page__hero">
        <div>
          <h1>Pacijenti</h1>
          <p>Pregled, pretraga i upravljanje podacima o pacijentima.</p>
        </div>
      </div>

      <div
        className={
          isDetailPanelOpen && selectedPatient
            ? "patients-content-grid"
            : "patients-content-grid patients-content-grid--full"
        }
      >
        <div className="patients-main-stack">
          <section
            className="patients-filter-panel"
            aria-label="Filteri pacijenata"
          >
            <div className="patients-search-row">
              <label className="patients-search-field">
                <span className="sr-only">Pretraga pacijenata</span>
                <AppIcon name="search" />
                <input
                  type="search"
                  placeholder="Pretrazite pacijente po imenu, OIB-u ili telefonu..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <button
                className="patients-primary-button"
                type="button"
                onClick={() => navigate(APP_ROUTES.patientsNew)}
              >
                <AppIcon name="plus" />
                Novi pacijent
              </button>
            </div>

            <div className="patients-filter-row">
              <label>
                <span>Status</span>
                <select
                  className="patients-filter-select"
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as PatientStatusFilter)
                  }
                >
                  <option value="all">Svi statusi</option>
                  <option value={UserStatus.ACTIVE}>Aktivni</option>
                  <option value={UserStatus.DISABLED}>Neaktivni</option>
                </select>
              </label>
              <label>
                <span>Vrsta termina</span>
                <select
                  className="patients-filter-select"
                  value={appointmentTypeFilter}
                  onChange={(event) => setAppointmentTypeFilter(event.target.value)}
                >
                  <option value="all">Sve vrste</option>
                  {appointmentTypes.map((appointmentType) => (
                    <option key={appointmentType.id} value={appointmentType.id}>
                      {appointmentType.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Zadnji termin</span>
                <select
                  className="patients-filter-select"
                  value={appointmentTimingFilter}
                  onChange={(event) =>
                    setAppointmentTimingFilter(event.target.value as AppointmentTimingFilter)
                  }
                >
                  <option value="all">Bilo kada</option>
                  <option value="upcoming">Ima nadolazeći termin</option>
                  <option value="last30">U zadnjih 30 dana</option>
                  <option value="none">Bez termina</option>
                </select>
              </label>
              <button
                className="patients-clear-button"
                type="button"
                onClick={clearFilters}
              >
                <AppIcon name="tag" />
                Obrisi filtre
              </button>
            </div>
          </section>

          <section
            className="patients-table-panel"
            aria-label="Popis pacijenata"
          >
            {isLoading ? (
              <div style={{ padding: "2rem", textAlign: "center" }}>
                Ucitavanje...
              </div>
            ) : error ? (
              <div
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  color: "#d32f2f",
                }}
              >
                {error}
              </div>
            ) : (
              <>
                <div className="patients-table patients-table--head" role="row">
                  <span>Ime i prezime</span>
                  <span>OIB</span>
                  <span>Telefon</span>
                  <span>Zadnji termin</span>
                  <span>Status</span>
                  <span aria-hidden="true" />
                </div>

                {filteredPatients.map((patient, index) => {
                  const fullName = getFullName(patient);
                  const status = getPatientStatus(patient);
                  const patientAppointments = appointmentsByPatient.get(patient.id) ?? [];

                  return (
                    <div
                      className={
                        patient.id === selectedPatient?.id
                          ? "patients-table patients-table--row patients-table--row-selected"
                          : "patients-table patients-table--row"
                      }
                      role="row"
                      key={patient.id}
                      onClick={() => {
                        setSelectedPatientId(patient.id);
                        setIsDetailPanelOpen(true);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <span
                        className={`patients-avatar patients-avatar--${getTone(index)}`}
                      >
                        {getInitials(patient)}
                      </span>
                      <strong>{fullName}</strong>
                      <span>{patient.oib || "Nije dostupno"}</span>
                      <span>{patient.phone || "Nije dostupno"}</span>
                      <span className="patients-last-appointment">
                        {formatLastAppointment(patientAppointments)}
                      </span>
                      <em
                        className={
                          status === "Aktivan"
                            ? "patients-status patients-status--active"
                            : "patients-status patients-status--inactive"
                        }
                      >
                        {status}
                      </em>
                      <button
                        type="button"
                        aria-label={`Opcije za ${fullName}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(
                            APP_ROUTES.patientEdit.replace(
                              ":patientId",
                              patient.id,
                            ),
                          );
                        }}
                      >
                        <AppIcon name="dots" />
                      </button>
                    </div>
                  );
                })}

                {filteredPatients.length === 0 ? (
                  <div style={{ padding: "2rem", textAlign: "center" }}>
                    Nema pacijenata za zadanu pretragu.
                  </div>
                ) : null}
              </>
            )}

            <div className="patients-pagination">
              <span>
                Prikazano {Math.min((page - 1) * 10 + 1, totalItems)}–{Math.min(page * 10, totalItems)} od {totalItems} pacijenata
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
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === "..." ? (
                      <span key={`ellipsis-${idx}`}>...</span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        className={item === page ? "patients-pagination__active" : undefined}
                        onClick={() => setPage(item as number)}
                      >
                        {item}
                      </button>
                    ),
                  )}
                <button
                  type="button"
                  aria-label="Sljedeca stranica"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <AppIcon name="chevronRight" />
                </button>
              </div>
            </div>
          </section>
        </div>

        {isDetailPanelOpen && selectedPatient ? (
          <aside className="patients-detail-panel" aria-label="Detalji pacijenta">
            <button
              className="patients-detail-close"
              type="button"
              aria-label="Zatvori detalje"
              onClick={() => setIsDetailPanelOpen(false)}
            >
              <AppIcon name="xCircle" />
            </button>

            <>
              <div className="patients-detail-header">
                <span className="patients-detail-avatar">
                  {getInitials(selectedPatient)}
                </span>
                <div>
                  <h2>{getFullName(selectedPatient)}</h2>
                  <span>
                    {selectedPatient.dateOfBirth ||
                      "Datum rodjenja nije dostupan"}
                  </span>
                  <small>OIB: {selectedPatient.oib || "Nije dostupno"}</small>
                </div>
                <em>{getPatientStatus(selectedPatient)}</em>
              </div>

              <section className="patients-info-card">
                <h3>Kontakt podaci</h3>
                <div className="patients-info-list">
                  <span>
                    <AppIcon name="clock" />
                    Telefon
                  </span>
                  <strong>{selectedPatient.phone || "Nije dostupno"}</strong>
                  <span>
                    <AppIcon name="mail" />
                    E-mail
                  </span>
                  <strong>{selectedPatient.email || "Nije dostupno"}</strong>
                  <span>
                    <AppIcon name="home" />
                    Adresa
                  </span>
                  <strong>{selectedPatient.address || "Nije dostupno"}</strong>
                </div>
              </section>

              <section className="patients-info-card">
                <h3>Hitni kontakt</h3>
                <div className="patients-emergency-contact">
                  <AppIcon name="user" />
                  <span>
                    {selectedPatient.emergencyContactName || "Nije dostupno"}
                    <strong>
                      {selectedPatient.emergencyContactPhone || "Nije dostupno"}
                    </strong>
                  </span>
                </div>
              </section>

              <section className="patients-info-card">
                <h3>Napomene</h3>
                <p className="patients-notes-text">
                  {selectedPatient.notes?.trim() ||
                    "Nema evidentiranih napomena."}
                </p>
              </section>

              <section className="patients-info-card patients-appointments-card">
                <div className="patients-card-heading">
                  <h3>Nadolazeci termini</h3>
                  <button
                    type="button"
                    onClick={() => navigate(APP_ROUTES.appointments)}
                  >
                    Prikazi sve
                  </button>
                </div>
                <div className="patients-appointment-list">
                  {selectedUpcomingAppointments.length > 0 ? (
                    selectedUpcomingAppointments.map((appointment) => (
                      <div className="patients-appointment-item" key={appointment.id}>
                        <AppIcon name="calendar" />
                        <span>
                          <strong>{formatAppointmentDate(appointment)}</strong>
                          {appointment.appointmentType.name}
                          <small>{`Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`}</small>
                        </span>
                        <em>{getAppointmentStatusLabel(appointment.status)}</em>
                      </div>
                    ))
                  ) : (
                    <div className="patients-appointment-item">
                      <AppIcon name="calendar" />
                      <span>
                        <strong>Nema nadolazećih termina</strong>
                        Termin
                        <small>Ustanova</small>
                      </span>
                      <em>Nije dostupno</em>
                    </div>
                  )}
                </div>
              </section>

              <div className="patients-detail-actions">
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      APP_ROUTES.patientDetails.replace(
                        ":patientId",
                        selectedPatient.id,
                      ),
                    )
                  }
                >
                  <AppIcon name="user" />
                  Pogledaj detalje
                </button>
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      APP_ROUTES.patientEdit.replace(
                        ":patientId",
                        selectedPatient.id,
                      ),
                    )
                  }
                >
                  <AppIcon name="note" />
                  Uredi podatke
                </button>
                <button
                  className="patients-detail-actions__primary"
                  type="button"
                  onClick={() =>
                    navigate(
                      `${APP_ROUTES.createAppointment}?patientId=${selectedPatient.id}`,
                    )
                  }
                >
                  <AppIcon name="calendar" />
                  Rezerviraj termin
                </button>
              </div>
            </>
          </aside>
        ) : null}
      </div>
    </div>
  );
}

export { PatientsPage };
