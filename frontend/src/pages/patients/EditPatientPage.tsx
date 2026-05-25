import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserStatus, type PatientDto } from "@zdravstvo/contracts";

import { AppIcon } from "@/components";
import { APP_ROUTES } from "@/app/routes";
import { patientsService } from "@/services";
import { getApiErrorMessage, toast } from "@/utils";

import "./patients.css";

interface PatientFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  oib: string;
  email: string;
  phone: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  notes: string;
  status: "Aktivan" | "Neaktivan";
}

const emptyFormData: PatientFormData = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  oib: "",
  email: "",
  phone: "",
  address: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  notes: "",
  status: "Aktivan",
};

const getInitials = (formData: PatientFormData): string =>
  `${formData.firstName[0] ?? "P"}${formData.lastName[0] ?? "P"}`.toUpperCase();

const mapPatientToFormData = (patient: PatientDto): PatientFormData => ({
  firstName: patient.firstName,
  lastName: patient.lastName,
  dateOfBirth: patient.dateOfBirth ?? "",
  oib: patient.oib ?? "",
  email: patient.email ?? "",
  phone: patient.phone ?? "",
  address: patient.address ?? "",
  emergencyContactName: patient.emergencyContactName ?? "",
  emergencyContactPhone: patient.emergencyContactPhone ?? "",
  notes: patient.notes ?? "",
  status: patient.status === UserStatus.ACTIVE ? "Aktivan" : "Neaktivan",
});

function EditPatientPage(): ReactElement {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();
  const [formData, setFormData] = useState<PatientFormData>(emptyFormData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
        const patient = await patientsService.getById(patientId);
        setFormData(mapPatientToFormData(patient));
        setError(null);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  const handleInputChange = (field: keyof PatientFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  const handleCancel = () => {
    navigate(
      patientId
        ? APP_ROUTES.patientDetails.replace(":patientId", patientId)
        : APP_ROUTES.patients,
    );
  };

  const handleSubmit = async () => {
    if (!patientId) {
      setError("ID pacijenta nije dostupan.");
      return;
    }

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("Obavezna polja: ime i prezime.");
      return;
    }

    try {
      setIsSaving(true);
      await patientsService.update(patientId, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: formData.dateOfBirth || null,
        oib: formData.oib.trim() || null,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        status:
          formData.status === "Aktivan"
            ? UserStatus.ACTIVE
            : UserStatus.DISABLED,
        address: formData.address.trim() || null,
        emergencyContactName: formData.emergencyContactName.trim() || null,
        emergencyContactPhone: formData.emergencyContactPhone.trim() || null,
        notes: formData.notes.trim() || null,
      });
      toast.success("Podaci pacijenta su uspješno ažurirani.");
      navigate(APP_ROUTES.patientDetails.replace(":patientId", patientId));
    } catch (err) {
      toast.error(err);
      setError("Greška pri spremanju pacijenta. Pokušajte ponovo.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className="edit-patient-page"
        style={{ padding: "2rem", textAlign: "center" }}
      >
        Ucitavanje...
      </div>
    );
  }

  return (
    <div className="edit-patient-page">
      <div className="edit-patient-breadcrumb">
        <button
          type="button"
          onClick={() => navigate(APP_ROUTES.patients)}
          className="edit-patient-breadcrumb-link"
        >
          Pacijenti
        </button>
        <AppIcon name="chevronRight" />
        <button
          type="button"
          className="edit-patient-breadcrumb-link"
          onClick={handleCancel}
        >
          Detalji pacijenta
        </button>
        <AppIcon name="chevronRight" />
        <span>Uredi pacijenta</span>
      </div>

      <div className="edit-patient-header">
        <div>
          <h1>Uredi pacijenta</h1>
          <p>
            Azurirajte podatke o pacijentu. Promjene ce biti spremljene nakon
            potvrde.
          </p>
        </div>
        <button
          type="button"
          className="edit-patient-back-button"
          onClick={handleCancel}
        >
          <AppIcon name="chevronLeft" />
          Povratak na detalje pacijenta
        </button>
      </div>

      <div className="edit-patient-content-grid">
        <section className="edit-patient-card">
          {error ? (
            <div
              style={{
                padding: "1rem",
                backgroundColor: "#ffebee",
                color: "#d32f2f",
                borderRadius: "4px",
                marginBottom: "1rem",
              }}
            >
              {error}
            </div>
          ) : null}

          <div className="edit-patient-card__section">
            <h2 className="edit-patient-card__section-title">Osnovni podaci</h2>

            <div className="edit-patient-profile-header">
              <div className="edit-patient-avatar">{getInitials(formData)}</div>
            </div>

            <div className="edit-patient-fields-row edit-patient-fields-row--2">
              <label className="edit-patient-field" htmlFor="firstName">
                <span className="edit-patient-field__label">
                  Ime <span className="edit-patient-required">*</span>
                </span>
                <input
                  id="firstName"
                  className="edit-patient-field__input"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                />
              </label>
              <label className="edit-patient-field" htmlFor="lastName">
                <span className="edit-patient-field__label">
                  Prezime <span className="edit-patient-required">*</span>
                </span>
                <input
                  id="lastName"
                  className="edit-patient-field__input"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                />
              </label>
            </div>

            <div className="edit-patient-fields-row edit-patient-fields-row--2">
              <label className="edit-patient-field" htmlFor="dateOfBirth">
                <span className="edit-patient-field__label">
                  Datum rodjenja
                </span>
                <input
                  id="dateOfBirth"
                  className="edit-patient-field__input"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    handleInputChange("dateOfBirth", e.target.value)
                  }
                />
              </label>
              <label className="edit-patient-field" htmlFor="oib">
                <span className="edit-patient-field__label">OIB</span>
                <input
                  id="oib"
                  className="edit-patient-field__input"
                  value={formData.oib}
                  onChange={(e) => handleInputChange("oib", e.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="edit-patient-card__section">
            <h2 className="edit-patient-card__section-title">Kontakt</h2>

            <label className="edit-patient-field" htmlFor="email">
              <span className="edit-patient-field__label">E-mail</span>
              <input
                id="email"
                className="edit-patient-field__input"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </label>

            <label className="edit-patient-field" htmlFor="phone">
              <span className="edit-patient-field__label">Telefon</span>
              <input
                id="phone"
                className="edit-patient-field__input"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </label>

            <label className="edit-patient-field" htmlFor="address">
              <span className="edit-patient-field__label">Adresa</span>
              <input
                id="address"
                className="edit-patient-field__input"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
            </label>
          </div>

          <div className="edit-patient-card__section">
            <h2 className="edit-patient-card__section-title">
              Dodatne informacije
            </h2>

            <label className="edit-patient-field" htmlFor="status">
              <span className="edit-patient-field__label">Status</span>
              <select
                id="status"
                className="edit-patient-field__select"
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
              >
                <option value="Aktivan">Aktivan</option>
                <option value="Neaktivan">Neaktivan</option>
              </select>
            </label>
            <label className="edit-patient-field" htmlFor="notes">
              <span className="edit-patient-field__label">Napomene</span>
              <textarea
                id="notes"
                className="edit-patient-field__textarea"
                maxLength={5000}
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
              />
              <span className="edit-patient-field__count">
                {formData.notes.length} / 5000
              </span>
            </label>


            <label
              className="edit-patient-field"
              htmlFor="emergencyContactName"
            >
              <span className="edit-patient-field__label">
                Kontakt osoba za hitne slucajeve
              </span>
              <input
                id="emergencyContactName"
                className="edit-patient-field__input"
                value={formData.emergencyContactName}
                onChange={(e) =>
                  handleInputChange("emergencyContactName", e.target.value)
                }
              />
            </label>

            <label
              className="edit-patient-field"
              htmlFor="emergencyContactPhone"
            >
              <span className="edit-patient-field__label">
                Telefon hitnog kontakta
              </span>
              <input
                id="emergencyContactPhone"
                className="edit-patient-field__input"
                type="tel"
                value={formData.emergencyContactPhone}
                onChange={(e) =>
                  handleInputChange("emergencyContactPhone", e.target.value)
                }
              />
            </label>
          </div>

          <div className="edit-patient-card__actions">
            <button
              className="edit-patient-btn edit-patient-btn--secondary"
              type="button"
              onClick={handleCancel}
            >
              Odustani
            </button>
            <button
              className="edit-patient-btn edit-patient-btn--primary"
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
            >
              <AppIcon name="note" />
              {isSaving ? "Sprema se..." : "Spremi promjene"}
            </button>
          </div>
        </section>

        <aside className="edit-patient-sidebar">
          <div className="edit-patient-summary-card">
            <h3 className="edit-patient-summary-card__title">
              Sazetak pacijenta
            </h3>

            <div className="edit-patient-summary-preview">
              <div className="edit-patient-summary-avatar">
                {getInitials(formData)}
              </div>
              <div className="edit-patient-summary-info">
                <strong>
                  {formData.firstName || formData.lastName
                    ? `${formData.firstName} ${formData.lastName}`
                    : "Pacijent"}
                </strong>
                <span className="edit-patient-status-badge">
                  {formData.status}
                </span>
              </div>
            </div>

            <div className="edit-patient-summary-list">
              <div className="edit-patient-summary-item">
                <span>OIB</span>
                <strong>{formData.oib || "Nije dostupno"}</strong>
              </div>
              <div className="edit-patient-summary-item">
                <span>E-mail</span>
                <strong>{formData.email || "Nije dostupno"}</strong>
              </div>
              <div className="edit-patient-summary-item">
                <span>Telefon</span>
                <strong>{formData.phone || "Nije dostupno"}</strong>
              </div>
              <div className="edit-patient-summary-item">
                <span>Adresa</span>
                <strong>{formData.address || "Nije dostupno"}</strong>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export { EditPatientPage };
