import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { APP_ROUTES } from "@/app/routes";
import { AppIcon } from "@/components";
import { appointmentTypesService } from "@/services";

import "./editAppointmentType.css";

interface FormData {
  name: string;
  defaultDurationMinutes: string;
  isActive: boolean;
}

const initialFormData: FormData = {
  name: "",
  defaultDurationMinutes: "30",
  isActive: true,
};

const durationOptions = [15, 20, 30, 45, 60, 90, 120];

const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error
    ? error.message
    : typeof error === "object" && error !== null && "message" in error
      ? String(error.message)
      : fallback;

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}): ReactElement {
  return (
    <label className="appointment-type-edit-toggle">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span aria-hidden="true" />
      <div>
        <strong>{label}</strong>
        <small>{description}</small>
      </div>
    </label>
  );
}

function EditAppointmentTypePage(): ReactElement {
  const navigate = useNavigate();
  const { appointmentTypeId } = useParams<{ appointmentTypeId: string }>();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const duration = useMemo(
    () => Number.parseInt(formData.defaultDurationMinutes, 10),
    [formData.defaultDurationMinutes],
  );

  useEffect(() => {
    if (!appointmentTypeId) {
      setError("ID vrste termina nije dostupan.");
      setIsLoading(false);
      return;
    }

    const fetchAppointmentType = async () => {
      try {
        setIsLoading(true);
        const appointmentType =
          await appointmentTypesService.getById(appointmentTypeId);
        setFormData({
          name: appointmentType.name,
          defaultDurationMinutes: String(
            appointmentType.defaultDurationMinutes,
          ),
          isActive: appointmentType.isActive,
        });
        setError(null);
      } catch (err) {
        setError(getErrorMessage(err, "Greska pri ucitavanju vrste termina."));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointmentType();
  }, [appointmentTypeId]);

  const updateField = <TField extends keyof FormData>(
    field: TField,
    value: FormData[TField],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  const handleSave = async () => {
    if (!appointmentTypeId) {
      setError("ID vrste termina nije dostupan.");
      return;
    }

    if (!formData.name.trim()) {
      setError("Naziv vrste termina je obavezan.");
      return;
    }

    if (!Number.isInteger(duration) || duration <= 0) {
      setError("Trajanje mora biti pozitivan broj minuta.");
      return;
    }

    try {
      setIsSaving(true);
      await appointmentTypesService.update(appointmentTypeId, {
        name: formData.name.trim(),
        defaultDurationMinutes: duration,
        isActive: formData.isActive,
      });
      navigate(APP_ROUTES.appointmentTypes);
    } catch (err) {
      setError(getErrorMessage(err, "Greska pri spremanju vrste termina."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!appointmentTypeId) {
      return;
    }

    try {
      setIsSaving(true);
      await appointmentTypesService.update(appointmentTypeId, {
        isActive: false,
      });
      setFormData((prev) => ({ ...prev, isActive: false }));
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, "Greska pri deaktivaciji vrste termina."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!appointmentTypeId) {
      return;
    }

    try {
      setIsSaving(true);
      await appointmentTypesService.delete(appointmentTypeId);
      navigate(APP_ROUTES.appointmentTypes);
    } catch (err) {
      setError(getErrorMessage(err, "Greska pri brisanju vrste termina."));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className="appointment-type-edit-page"
        style={{ padding: "2rem", textAlign: "center" }}
      >
        Ucitavanje...
      </div>
    );
  }

  return (
    <div className="appointment-type-edit-page">
      <nav className="appointment-type-edit-breadcrumb" aria-label="Navigacija">
        <button
          type="button"
          onClick={() => navigate(APP_ROUTES.appointmentTypes)}
        >
          Vrste termina
        </button>
        <AppIcon name="chevronRight" />
        <strong>Uredi vrstu termina</strong>
      </nav>

      <section className="appointment-type-edit-hero">
        <div>
          <h1>Uredi vrstu termina</h1>
          <p>
            Azurirajte podatke i pravila rezervacije za postojecu vrstu termina.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(APP_ROUTES.appointmentTypes)}
        >
          <AppIcon name="chevronLeft" />
          Povratak na vrste termina
        </button>
      </section>

      <div className="appointment-type-edit-grid">
        <main className="appointment-type-edit-main">
          {error ? (
            <div
              style={{
                padding: "1rem",
                backgroundColor: "#ffebee",
                color: "#d32f2f",
                borderRadius: "4px",
              }}
            >
              {error}
            </div>
          ) : null}

          <section className="appointment-type-edit-card">
            <header>
              <span>1</span>
              <h2>Osnovni podaci</h2>
            </header>

            <div className="appointment-type-edit-form-grid">
              <label className="appointment-type-edit-field">
                <span>
                  Naziv vrste termina <b>*</b>
                </span>
                <input
                  value={formData.name}
                  onChange={(event) => updateField("name", event.target.value)}
                />
              </label>

              <label className="appointment-type-edit-field appointment-type-edit-field--textarea">
                <span>Kratki opis</span>
                <textarea
                  value="Opis nije podrzan kroz trenutni API."
                  maxLength={120}
                  disabled
                  readOnly
                />
                <em>0/120</em>
              </label>

              <label className="appointment-type-edit-field">
                <span>
                  Trajanje <b>*</b>
                </span>
                <select
                  value={formData.defaultDurationMinutes}
                  onChange={(event) =>
                    updateField("defaultDurationMinutes", event.target.value)
                  }
                >
                  {durationOptions.map((option) => (
                    <option value={option} key={option}>
                      {option} minuta
                    </option>
                  ))}
                </select>
              </label>

              <label className="appointment-type-edit-field">
                <span>
                  Status <b>*</b>
                </span>
                <select
                  value={formData.isActive ? "active" : "inactive"}
                  onChange={(event) =>
                    updateField("isActive", event.target.value === "active")
                  }
                >
                  <option value="active">Aktivan</option>
                  <option value="inactive">Neaktivan</option>
                </select>
              </label>
            </div>
          </section>

          <section className="appointment-type-edit-card">
            <header>
              <span>2</span>
              <h2>Pravila rezervacije</h2>
            </header>

            <div className="appointment-type-edit-rules-grid">
              <Toggle
                label="Aktivna vrsta termina"
                description="Aktivne vrste termina dostupne su pri rezervaciji."
                checked={formData.isActive}
                onChange={(checked) => updateField("isActive", checked)}
              />

              <label className="appointment-type-edit-field">
                <span>Minimalno vrijeme otkazivanja</span>
                <button type="button" disabled>
                  <AppIcon name="clock" />
                  Nije podrzano kroz API
                  <AppIcon name="chevronDown" />
                </button>
              </label>

              <label className="appointment-type-edit-field">
                <span>Podsjetnik e-mail</span>
                <button type="button" disabled>
                  <AppIcon name="clock" />
                  Nije podrzano kroz API
                  <AppIcon name="chevronDown" />
                </button>
              </label>
            </div>
          </section>

          <section className="appointment-type-edit-card">
            <header>
              <span>3</span>
              <h2>Dostupnost i povezivanje</h2>
            </header>

            <div className="appointment-type-edit-availability-grid">
              <label className="appointment-type-edit-field">
                <span>Specijalizacije</span>
                <button type="button" disabled>
                  Nije dostupno kroz API
                  <AppIcon name="chevronDown" />
                </button>
              </label>

              <label className="appointment-type-edit-field">
                <span>Lijecnici</span>
                <button type="button" disabled>
                  Nije dostupno kroz API
                  <AppIcon name="chevronDown" />
                </button>
              </label>
            </div>

            <p className="appointment-type-edit-info">
              <AppIcon name="info" />
              Promjene ce se primijeniti na buduce rezervacije ove vrste
              termina.
            </p>
          </section>

          <section className="appointment-type-edit-actions">
            <div className="appointment-type-edit-danger-actions">
              <button
                className="appointment-type-edit-deactivate"
                type="button"
                onClick={handleDeactivate}
                disabled={isSaving || !formData.isActive}
              >
                <AppIcon name="shield" />
                Deaktiviraj vrstu termina
              </button>
              <button
                className="appointment-type-edit-delete"
                type="button"
                onClick={handleDelete}
                disabled={isSaving}
              >
                <AppIcon name="trash" />
                Izbriši termin
              </button>
            </div>
            <div>
              <button
                className="appointment-type-edit-cancel"
                type="button"
                onClick={() => navigate(APP_ROUTES.appointmentTypes)}
              >
                Odustani
              </button>
              <button
                className="appointment-type-edit-save"
                type="button"
                onClick={handleSave}
                disabled={isSaving}
              >
                <AppIcon name="calendarCheck" />
                {isSaving ? "Sprema se..." : "Spremi promjene"}
              </button>
            </div>
          </section>
        </main>

        <aside className="appointment-type-edit-side">
          <section className="appointment-type-edit-summary">
            <h2>Sazetak vrste termina</h2>
            <div className="appointment-type-edit-summary-title">
              <span />
              <strong>{formData.name || "Vrsta termina"}</strong>
            </div>

            <div className="appointment-type-edit-summary-list">
              <article>
                <span>Trajanje</span>
                <strong>{duration || "-"} min</strong>
              </article>
              <article>
                <span>Online rezervacija</span>
                <strong>Nije dostupno</strong>
              </article>
              <article>
                <span>Status</span>
                <em>{formData.isActive ? "Aktivan" : "Neaktivan"}</em>
              </article>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export { EditAppointmentTypePage };
