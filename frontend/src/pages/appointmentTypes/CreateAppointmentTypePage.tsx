import { useMemo, useState } from "react";
import type { ReactElement } from "react";
import { useNavigate } from "react-router-dom";

import { APP_ROUTES } from "@/app/routes";
import { AppIcon } from "@/components";
import { appointmentTypesService } from "@/services";
import { toast } from "@/utils";

import "./createAppointmentType.css";

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
    <label className="appointment-type-create-toggle">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />
      <span aria-hidden="true" />
      <div>
        <strong>{label}</strong>
        <small>{description}</small>
      </div>
    </label>
  );
}

function CreateAppointmentTypePage(): ReactElement {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const duration = useMemo(
    () => Number.parseInt(formData.defaultDurationMinutes, 10),
    [formData.defaultDurationMinutes],
  );

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

  const handleSubmit = async () => {
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
      const appointmentType = await appointmentTypesService.create({
        name: formData.name.trim(),
        defaultDurationMinutes: duration,
        isActive: formData.isActive,
      });

      toast.success("Vrsta termina je uspješno kreirana.");
      navigate(
        APP_ROUTES.editAppointmentType.replace(
          ":appointmentTypeId",
          appointmentType.id,
        ),
      );
    } catch (err) {
      toast.error(err)
      setError("Greška pri kreiranju vrste termina. Pokušajte ponovo.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="appointment-type-create-page">
      <button
        className="appointment-type-create-back-link"
        type="button"
        onClick={() => navigate(APP_ROUTES.appointmentTypes)}
      >
        <AppIcon name="chevronLeft" />
        Natrag na vrste termina
      </button>

      <div className="appointment-type-create-hero">
        <span>Vrste termina / Nova vrsta termina</span>
        <h1>Nova vrsta termina</h1>
        <p>Unesite osnovne podatke i pravila rezervacije.</p>
      </div>

      <div className="appointment-type-create-grid">
        <main className="appointment-type-create-main">
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

          <section className="appointment-type-create-card">
            <header>
              <span>1</span>
              <h2>Osnovni podaci</h2>
            </header>

            <div className="appointment-type-create-form-grid">
              <label className="appointment-type-create-field">
                <span>
                  Naziv vrste termina <b>*</b>
                </span>
                <input
                  placeholder="npr. Kontrolni pregled"
                  value={formData.name}
                  onChange={(event) => updateField("name", event.target.value)}
                />
              </label>

              <label className="appointment-type-create-field appointment-type-create-field--textarea">
                <span>Kratki opis</span>
                <textarea
                  placeholder="Opis nije podrzan kroz trenutni API."
                  maxLength={120}
                  disabled
                />
                <em>0/120</em>
              </label>

              <label className="appointment-type-create-field">
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

              <label className="appointment-type-create-field appointment-type-create-color-field">
                <span>Boja oznake</span>
                <button type="button" disabled>
                  <i />
                  Nije podrzano kroz API
                  <AppIcon name="chevronDown" />
                </button>
              </label>
            </div>
          </section>

          <section className="appointment-type-create-card">
            <header>
              <span>2</span>
              <h2>Pravila rezervacije</h2>
            </header>

            <div className="appointment-type-create-rules-grid">
              <Toggle
                label="Aktivna vrsta termina"
                description="Aktivne vrste termina dostupne su pri rezervaciji."
                checked={formData.isActive}
                onChange={(checked) => updateField("isActive", checked)}
              />

              <label className="appointment-type-create-field">
                <span>
                  Trajanje termina <b>*</b>
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

              <label className="appointment-type-create-field">
                <span>Minimalno vrijeme otkazivanja</span>
                <button type="button" disabled>
                  <AppIcon name="clock" />
                  Nije podrzano kroz API
                  <AppIcon name="chevronDown" />
                </button>
              </label>
            </div>
          </section>

          <section className="appointment-type-create-card">
            <header>
              <span>3</span>
              <h2>Dostupnost i povezivanje</h2>
            </header>

            <div className="appointment-type-create-availability-grid">
              <label className="appointment-type-create-field">
                <span>Status</span>
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

          <section className="appointment-type-create-actions">
            <button
              className="appointment-type-create-cancel"
              type="button"
              onClick={() => navigate(APP_ROUTES.appointmentTypes)}
            >
              Odustani
            </button>
            <button
              className="appointment-type-create-save"
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
            >
              <AppIcon name="calendarCheck" />
              {isSaving ? "Sprema se..." : "Spremi vrstu termina"}
            </button>
          </section>
        </main>

        <aside className="appointment-type-create-side">
          <section className="appointment-type-create-summary">
            <h2>Sazetak vrste termina</h2>
            <div className="appointment-type-create-summary-name">
              <span />
              <strong>{formData.name || "Nova vrsta termina"}</strong>
            </div>

            <div className="appointment-type-create-summary-fields">
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

export { CreateAppointmentTypePage };
