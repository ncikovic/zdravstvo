import { useState } from "react";
import type { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { UserStatus } from "@zdravstvo/contracts";

import { AppIcon } from "@/components";
import { APP_ROUTES } from "@/app/routes";
import { patientsService } from "@/services";

import "./patients.css";

function NewPatientPage(): ReactElement {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    oib: "",
    gender: "",
    email: "",
    phone: "",
    phoneCode: "+385",
    address: "",
    city: "",
    postalCode: "",
    status: "Aktivan",
    notes: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactPhoneCode: "+385",
    institution: "Poliklinika Medica Zagreb",
    enableOnlineNotifications: true,
    emailNotifications: true,
    smsNotifications: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  const handleCancel = () => {
    navigate(APP_ROUTES.patients);
  };

  const handleSubmit = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("Obavezna polja: ime i prezime.");
      return;
    }

    try {
      setIsLoading(true);
      const patient = await patientsService.create({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: formData.dateOfBirth || null,
        oib: formData.oib.trim() || null,
        email: formData.email.trim() || null,
        phone: formData.phone.trim()
          ? `${formData.phoneCode} ${formData.phone.trim()}`
          : null,
        status:
          formData.status === "Aktivan"
            ? UserStatus.ACTIVE
            : UserStatus.DISABLED,
        address:
          [
            formData.address.trim(),
            formData.postalCode.trim(),
            formData.city.trim(),
          ]
            .filter(Boolean)
            .join(", ") || null,
        emergencyContactName: formData.emergencyContactName.trim() || null,
        emergencyContactPhone: formData.emergencyContactPhone.trim()
          ? `${formData.emergencyContactPhoneCode} ${formData.emergencyContactPhone.trim()}`
          : null,
      });
      navigate(APP_ROUTES.patientDetails.replace(":patientId", patient.id));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
            ? String(err.message)
            : "Greska pri spremanju pacijenta.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="new-patient-page">
      <div className="new-patient-page__hero">
        <h1>Novi pacijent</h1>
        <p>Unesite osnovne podatke i kontakt informacije pacijenta.</p>
      </div>

      <div className="new-patient-content-grid">
        <section className="new-patient-card">
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
          {/* Basic Info Section */}
          <div className="new-patient-card__section">
            <h2 className="new-patient-card__section-title">
              1. Osnovni podaci
            </h2>

            <div className="new-patient-fields-row new-patient-fields-row--2">
              <div className="new-patient-field">
                <label className="new-patient-field__label" htmlFor="firstName">
                  Ime <span className="new-patient-required">*</span>
                </label>
                <input
                  id="firstName"
                  className="new-patient-field__input"
                  type="text"
                  placeholder="Upisite ime"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                />
              </div>
              <div className="new-patient-field">
                <label className="new-patient-field__label" htmlFor="lastName">
                  Prezime <span className="new-patient-required">*</span>
                </label>
                <input
                  id="lastName"
                  className="new-patient-field__input"
                  type="text"
                  placeholder="Upisite prezime"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="new-patient-fields-row new-patient-fields-row--2">
              <div className="new-patient-field">
                <label
                  className="new-patient-field__label"
                  htmlFor="dateOfBirth"
                >
                  Datum rođenja <span className="new-patient-required">*</span>
                </label>
                <input
                  id="dateOfBirth"
                  className="new-patient-field__input"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    handleInputChange("dateOfBirth", e.target.value)
                  }
                />
              </div>
              <div className="new-patient-field">
                <label className="new-patient-field__label" htmlFor="oib">
                  OIB <span className="new-patient-required">*</span>
                </label>
                <input
                  id="oib"
                  className="new-patient-field__input"
                  type="text"
                  placeholder="Upisite OIB"
                  value={formData.oib}
                  onChange={(e) => handleInputChange("oib", e.target.value)}
                />
              </div>
            </div>

            <div className="new-patient-field">
              <label className="new-patient-field__label" htmlFor="gender">
                Spol
              </label>
              <select
                id="gender"
                className="new-patient-field__select"
                value={formData.gender}
                onChange={(e) => handleInputChange("gender", e.target.value)}
              >
                <option value="">Odaberite spol</option>
                <option value="Muški">Muški</option>
                <option value="Ženski">Ženski</option>
                <option value="Ostalo">Ostalo</option>
              </select>
            </div>
          </div>

          {/* Contact Section */}
          <div className="new-patient-card__section">
            <h2 className="new-patient-card__section-title">2. Kontakt</h2>

            <div className="new-patient-field">
              <label className="new-patient-field__label" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                className="new-patient-field__input"
                type="email"
                placeholder="npr. ivan.horvat@email.hr"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>

            <div className="new-patient-field">
              <label className="new-patient-field__label" htmlFor="phone">
                Telefon <span className="new-patient-required">*</span>
              </label>
              <div className="new-patient-phone-input">
                <select className="new-patient-phone-code">
                  <option value="+385">🇭🇷 +385</option>
                </select>
                <input
                  id="phone"
                  className="new-patient-field__input"
                  type="tel"
                  placeholder="91 234 5678"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>
            </div>

            <div className="new-patient-field">
              <label className="new-patient-field__label" htmlFor="address">
                Adresa
              </label>
              <input
                id="address"
                className="new-patient-field__input"
                type="text"
                placeholder="Upisite adresu"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
            </div>

            <div className="new-patient-fields-row new-patient-fields-row--2">
              <div className="new-patient-field">
                <label className="new-patient-field__label" htmlFor="city">
                  Grad
                </label>
                <input
                  id="city"
                  className="new-patient-field__input"
                  type="text"
                  placeholder="Upisite grad"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                />
              </div>
              <div className="new-patient-field">
                <label
                  className="new-patient-field__label"
                  htmlFor="postalCode"
                >
                  Poštanski broj
                </label>
                <input
                  id="postalCode"
                  className="new-patient-field__input"
                  type="text"
                  placeholder="Upisite poštanski broj"
                  value={formData.postalCode}
                  onChange={(e) =>
                    handleInputChange("postalCode", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="new-patient-card__section">
            <h2 className="new-patient-card__section-title">
              3. Dodatne informacije
            </h2>

            <div className="new-patient-field">
              <label className="new-patient-field__label" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                className="new-patient-field__select"
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
              >
                <option value="Aktivan">Aktivan</option>
                <option value="Neaktivan">Neaktivan</option>
              </select>
            </div>

            <div className="new-patient-field">
              <label className="new-patient-field__label" htmlFor="notes">
                Napomena
              </label>
              <textarea
                id="notes"
                className="new-patient-field__textarea"
                placeholder="Napišite dodatne informacije..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                maxLength={500}
              />
              <span className="new-patient-field__count">
                {formData.notes.length} / 500
              </span>
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div className="new-patient-card__section">
            <h2 className="new-patient-card__section-title">
              4. Hitni kontakt
            </h2>

            <div className="new-patient-field">
              <label
                className="new-patient-field__label"
                htmlFor="emergencyContactName"
              >
                Ime i prezime
              </label>
              <input
                id="emergencyContactName"
                className="new-patient-field__input"
                type="text"
                placeholder="npr. suprug, roditeljica..."
                value={formData.emergencyContactName}
                onChange={(e) =>
                  handleInputChange("emergencyContactName", e.target.value)
                }
              />
            </div>

            <div className="new-patient-field">
              <label
                className="new-patient-field__label"
                htmlFor="emergencyContactPhone"
              >
                Telefon
              </label>
              <div className="new-patient-phone-input">
                <select className="new-patient-phone-code">
                  <option value="+385">🇭🇷 +385</option>
                </select>
                <input
                  id="emergencyContactPhone"
                  className="new-patient-field__input"
                  type="tel"
                  placeholder="91 234 5678"
                  value={formData.emergencyContactPhone}
                  onChange={(e) =>
                    handleInputChange("emergencyContactPhone", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* Institution Connection Section */}
          <div className="new-patient-card__section">
            <h2 className="new-patient-card__section-title">
              5. Povezivanje s ustanovom
            </h2>

            <div className="new-patient-field">
              <label className="new-patient-field__label" htmlFor="institution">
                Ustanovа <span className="new-patient-required">*</span>
              </label>
              <select
                id="institution"
                className="new-patient-field__select"
                value={formData.institution}
                onChange={(e) =>
                  handleInputChange("institution", e.target.value)
                }
              >
                <option value="Poliklinika Medica Zagreb">
                  Poliklinika Medica Zagreb
                </option>
                <option value="Dom zdravlja Zagreb">Dom zdravlja Zagreb</option>
                <option value="KBC Zagreb">KBC Zagreb</option>
              </select>
            </div>

            <div className="new-patient-notifications-toggle">
              <label className="new-patient-toggle-label">
                <input
                  type="checkbox"
                  className="new-patient-toggle-input"
                  checked={formData.enableOnlineNotifications}
                  onChange={(e) =>
                    handleInputChange(
                      "enableOnlineNotifications",
                      e.target.checked,
                    )
                  }
                />
                <span className="new-patient-toggle-switch"></span>
                <span className="new-patient-toggle-text">
                  Omogući online podajetnjke
                </span>
              </label>
            </div>

            <div className="new-patient-checkboxes">
              <label className="new-patient-checkbox-label">
                <input
                  type="checkbox"
                  className="new-patient-checkbox-input"
                  checked={formData.emailNotifications}
                  onChange={(e) =>
                    handleInputChange("emailNotifications", e.target.checked)
                  }
                />
                <span className="new-patient-checkbox-mark"></span>
                <span>E-mail</span>
              </label>
              <label className="new-patient-checkbox-label">
                <input
                  type="checkbox"
                  className="new-patient-checkbox-input"
                  checked={formData.smsNotifications}
                  onChange={(e) =>
                    handleInputChange("smsNotifications", e.target.checked)
                  }
                />
                <span className="new-patient-checkbox-mark"></span>
                <span>SMS</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="new-patient-card__actions">
            <button
              className="new-patient-btn new-patient-btn--secondary"
              type="button"
              onClick={handleCancel}
            >
              Odustani
            </button>
            <button
              className="new-patient-btn new-patient-btn--primary"
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              <AppIcon name="note" />
              {isLoading ? "Sprema se..." : "Spremi pacijenta"}
            </button>
          </div>
        </section>

        {/* Sidebar */}
        <aside className="new-patient-sidebar">
          <div className="new-patient-info-card">
            <h3 className="new-patient-info-card__title">Sažetak profila</h3>

            <div className="new-patient-info-preview">
              <div className="new-patient-preview-avatar">
                <span>
                  {(formData.firstName[0] || "N").toUpperCase()}
                  {(formData.lastName[0] || "P").toUpperCase()}
                </span>
              </div>
              <div className="new-patient-preview-info">
                <strong>
                  {formData.firstName && formData.lastName
                    ? `${formData.firstName} ${formData.lastName}`
                    : "Novi pacijent"}
                </strong>
                <em>Još nije spremljeno</em>
              </div>
            </div>

            <div className="new-patient-info-section">
              <span className="new-patient-info-section__title">Status</span>
              <p>
                <em
                  className={
                    formData.status === "Aktivan"
                      ? "status-badge status-badge--active"
                      : "status-badge"
                  }
                >
                  {formData.status}
                </em>
              </p>
            </div>

            <div className="new-patient-info-section">
              <span className="new-patient-info-section__title">Ustanova</span>
              <p>{formData.institution}</p>
            </div>
          </div>

          <div className="new-patient-tips-card">
            <h3 className="new-patient-tips-card__title">Korisni savjeti</h3>
            <div className="new-patient-tips-list">
              <div className="new-patient-tip-item">
                <AppIcon name="info" />
                <div>
                  <strong>Provjerte OIB</strong>
                  <span>OIB je jedinstveni identifikator pacijenta.</span>
                </div>
              </div>
              <div className="new-patient-tip-item">
                <AppIcon name="info" />
                <div>
                  <strong>Dodjate hitni kontakt</strong>
                  <span>
                    Hitni kontakt može biti klučan u nužnim situacijama.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="new-patient-next-steps">
            <h3 className="new-patient-next-steps__title">Sljedeći koraci</h3>
            <div className="new-patient-next-steps__list">
              <button className="new-patient-next-step-link" type="button" onClick={() => navigate(APP_ROUTES.patients)}>
                <AppIcon name="user" />
                <div>
                  <strong>Detalji pacijenta</strong>
                  <span>Upravljajte dodatnim podacima.</span>
                </div>
                <AppIcon name="chevronRight" />
              </button>
              <button className="new-patient-next-step-link" type="button" onClick={() => navigate(APP_ROUTES.createAppointment)}>
                <AppIcon name="calendar" />
                <div>
                  <strong>Rezervacija termina</strong>
                  <span>Zakažite prvi termin pacijenta.</span>
                </div>
                <AppIcon name="chevronRight" />
              </button>
              <button className="new-patient-next-step-link" type="button" onClick={() => navigate(APP_ROUTES.patients)}>
                <AppIcon name="clipboard" />
                <div>
                  <strong>Podaci osiguranja</strong>
                  <span>Dodajte podatke o zdravstvenom osiguranju.</span>
                </div>
                <AppIcon name="chevronRight" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export { NewPatientPage };
