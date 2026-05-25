import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import type { PatientDto } from "@zdravstvo/contracts";

import { AppIcon } from "@/components";
import { APP_ROUTES } from "@/app/routes";
import { patientsService } from "@/services";
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

const tones: PatientTone[] = [
  "teal",
  "purple",
  "violet",
  "green",
  "orange",
  "blue",
  "red",
];

const upcomingAppointments = [
  ["Nije dostupno", "Termin", "Ustanova", "Status"],
] as const;

const getTone = (index: number): PatientTone => tones[index % tones.length];

const getInitials = (patient: PatientDto): string =>
  `${patient.firstName[0] ?? "P"}${patient.lastName[0] ?? "P"}`.toUpperCase();

const getFullName = (patient: PatientDto): string =>
  `${patient.firstName} ${patient.lastName}`;

const getPatientStatus = (patient: PatientDto): "Aktivan" | "Neaktivan" =>
  patient.status === "ACTIVE" ? "Aktivan" : "Neaktivan";

function PatientsPage(): ReactElement {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<PatientDto[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [search, setSearch] = useState("");
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

  const filteredPatients = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return patients;
    }

    return patients.filter((patient) =>
      [
        getFullName(patient),
        patient.oib,
        patient.phone,
        patient.email,
        patient.address,
        patient.notes,
      ]
        .filter(Boolean)
        .some((field) => field?.toLowerCase().includes(value)),
    );
  }, [patients, search]);

  const selectedPatientCandidate = selectedPatientId
    ? filteredPatients.find((patient) => patient.id === selectedPatientId) ?? null
    : null;
  const selectedPatient = isDetailPanelOpen ? selectedPatientCandidate : null;

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
                <div>
                  Svi statusi
                  <AppIcon name="chevronDown" />
                </div>
              </label>
              <label>
                <span>Lijecnik</span>
                <div>
                  Svi lijecnici
                  <AppIcon name="chevronDown" />
                </div>
              </label>
              <label>
                <span>Vrsta termina</span>
                <div>
                  Sve vrste
                  <AppIcon name="chevronDown" />
                </div>
              </label>
              <label>
                <span>Zadnji termin</span>
                <div>
                  Bilo kada
                  <AppIcon name="chevronDown" />
                </div>
              </label>
              <button
                className="patients-clear-button"
                type="button"
                onClick={() => setSearch("")}
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
                        Nije dostupno
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

            {selectedPatient ? (
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
                    {upcomingAppointments.map(
                      ([date, title, location, status]) => (
                        <div className="patients-appointment-item" key={date}>
                          <AppIcon name="calendar" />
                          <span>
                            <strong>{date}</strong>
                            {title}
                            <small>{location}</small>
                          </span>
                          <em>{status}</em>
                        </div>
                      ),
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
            ) : null}
          </aside>
        ) : null}
      </div>
    </div>
  );
}

export { PatientsPage };
