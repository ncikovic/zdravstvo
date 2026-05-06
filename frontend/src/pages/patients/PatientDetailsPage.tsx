import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { PatientDto } from "@zdravstvo/contracts";

import { AppIcon } from "@/components";
import { APP_ROUTES } from "@/app/routes";
import { patientsService } from "@/services";

import "./patients.css";

const getInitials = (patient: PatientDto): string =>
  `${patient.firstName[0] ?? "P"}${patient.lastName[0] ?? "P"}`.toUpperCase();

const getFullName = (patient: PatientDto): string =>
  `${patient.firstName} ${patient.lastName}`;

const getPatientStatus = (patient: PatientDto): "Aktivan" | "Neaktivan" =>
  patient.status === "ACTIVE" ? "Aktivan" : "Neaktivan";

const formatDate = (value: string | null): string => value || "Nije dostupno";

const getAge = (dateOfBirth: string | null): number | null => {
  if (!dateOfBirth) {
    return null;
  }

  const birthDate = new Date(`${dateOfBirth}T00:00:00`);

  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDelta = today.getMonth() - birthDate.getMonth();

  if (
    monthDelta < 0 ||
    (monthDelta === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age;
};

const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error
    ? error.message
    : typeof error === "object" && error !== null && "message" in error
      ? String(error.message)
      : fallback;

function PatientDetailsPage(): ReactElement {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();
  const [patient, setPatient] = useState<PatientDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) {
      setError("ID pacijenta nije dostupan.");
      setIsLoading(false);
      return;
    }

    const fetchPatient = async () => {
      try {
        setIsLoading(true);
        const data = await patientsService.getById(patientId);
        setPatient(data);
        setError(null);
      } catch (err) {
        setError(getErrorMessage(err, "Greska pri ucitavanju pacijenta."));
        setPatient(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  const age = useMemo(
    () => getAge(patient?.dateOfBirth ?? null),
    [patient?.dateOfBirth],
  );

  if (isLoading) {
    return (
      <div
        className="patient-details-page"
        style={{ padding: "2rem", textAlign: "center" }}
      >
        Ucitavanje...
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div
        className="patient-details-page"
        style={{ padding: "2rem", textAlign: "center", color: "#d32f2f" }}
      >
        {error || "Pacijent nije pronadjen."}
      </div>
    );
  }

  return (
    <div className="patient-details-page">
      <div className="patient-details-breadcrumb">
        <button
          type="button"
          onClick={() => navigate(APP_ROUTES.patients)}
          className="patient-details-breadcrumb-link"
        >
          Pacijenti
        </button>
        <AppIcon name="chevronRight" />
        <span>Detalji pacijenta</span>
      </div>

      <div className="patient-details-header">
        <div>
          <h1>Detalji pacijenta</h1>
          <p>Pregled svih dostupnih podataka o pacijentu.</p>
        </div>
        <button
          type="button"
          className="patient-details-back-button"
          onClick={() => navigate(APP_ROUTES.patients)}
        >
          <AppIcon name="chevronLeft" />
          Povratak na pacijente
        </button>
      </div>

      <div className="patient-details-content-grid">
        <section className="patient-details-main">
          <div className="patient-details-header-card">
            <div className="patient-details-header-info">
              <div className="patient-details-avatar">
                {getInitials(patient)}
              </div>
              <div className="patient-details-header-text">
                <div>
                  <h2>{getFullName(patient)}</h2>
                  <span className="patient-details-status-badge">
                    {getPatientStatus(patient)}
                  </span>
                </div>
                <div className="patient-details-meta">
                  <span>
                    <AppIcon name="calendar" />
                    {formatDate(patient.dateOfBirth)}
                    {age !== null ? ` (${age} god.)` : ""}
                  </span>
                  <span>
                    <AppIcon name="info" />
                    OIB: {patient.oib || "Nije dostupno"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="patient-details-section">
            <h3 className="patient-details-section-title">
              Osnovne informacije
            </h3>
            <div className="patient-details-grid">
              <div className="patient-details-item">
                <span className="patient-details-icon">
                  <AppIcon name="phone" />
                </span>
                <div>
                  <strong>Telefon</strong>
                  <p>{patient.phone || "Nije dostupno"}</p>
                </div>
              </div>
              <div className="patient-details-item">
                <span className="patient-details-icon">
                  <AppIcon name="mail" />
                </span>
                <div>
                  <strong>E-mail</strong>
                  <p>{patient.email || "Nije dostupno"}</p>
                </div>
              </div>
              <div className="patient-details-item">
                <span className="patient-details-icon">
                  <AppIcon name="info" />
                </span>
                <div>
                  <strong>OIB</strong>
                  <p>{patient.oib || "Nije dostupno"}</p>
                </div>
              </div>
              <div className="patient-details-item">
                <span className="patient-details-icon">
                  <AppIcon name="calendar" />
                </span>
                <div>
                  <strong>Datum rodjenja</strong>
                  <p>{formatDate(patient.dateOfBirth)}</p>
                </div>
              </div>
              <div className="patient-details-item">
                <span className="patient-details-icon">
                  <AppIcon name="home" />
                </span>
                <div>
                  <strong>Adresa</strong>
                  <p>{patient.address || "Nije dostupno"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="patient-details-section">
            <h3 className="patient-details-section-title">Hitni kontakt</h3>
            <div className="patient-details-emergency-contact">
              <div className="patient-details-emergency-item">
                <span>Kontakt osoba</span>
                <strong>
                  {patient.emergencyContactName || "Nije dostupno"}
                </strong>
              </div>
              <div className="patient-details-emergency-item">
                <span>Telefon</span>
                <strong>
                  {patient.emergencyContactPhone || "Nije dostupno"}
                </strong>
              </div>
            </div>
          </div>

          <div className="patient-details-section patient-details-notes-section">
            <div className="patient-details-notes-header">
              <AppIcon name="note" />
              <span>Napomene</span>
            </div>
            <p className="patient-details-notes-text">
              Napomene nisu dostupne kroz trenutni API.
            </p>
          </div>
        </section>

        <aside className="patient-details-sidebar">
          <div className="patient-details-card">
            <h3 className="patient-details-card-title">Brze akcije</h3>
            <div className="patient-details-actions">
              <button
                type="button"
                className="patient-details-action-link"
                onClick={() =>
                  navigate(
                    APP_ROUTES.patientEdit.replace(":patientId", patient.id),
                  )
                }
              >
                <AppIcon name="note" />
                Uredi podatke
                <AppIcon name="chevronRight" />
              </button>
              <button type="button" className="patient-details-action-link">
                <AppIcon name="calendar" />
                Rezerviraj termin
                <AppIcon name="chevronRight" />
              </button>
            </div>
          </div>

          <div className="patient-details-card">
            <h3 className="patient-details-card-title">Sazetak pacijenta</h3>
            <div className="patient-details-summary-list">
              <div className="patient-details-summary-item">
                <div>
                  <AppIcon name="checkCircle" />
                  <span>Status</span>
                </div>
                <strong className="patient-details-status-active">
                  {getPatientStatus(patient)}
                </strong>
              </div>
              <div className="patient-details-summary-item">
                <div>
                  <AppIcon name="calendar" />
                  <span>Registriran od</span>
                </div>
                <strong>{formatDate(patient.createdAt.slice(0, 10))}</strong>
              </div>
              <div className="patient-details-summary-item">
                <div>
                  <AppIcon name="phone" />
                  <span>Kontakt</span>
                </div>
                <strong>
                  {patient.phone || patient.email || "Nije dostupno"}
                </strong>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export { PatientDetailsPage };
