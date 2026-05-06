import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import type { AppointmentTypeDto } from "@zdravstvo/contracts";

import { APP_ROUTES } from "@/app/routes";
import { AppIcon } from "@/components";
import { appointmentTypesService } from "@/services";
import type { AppIconName } from "@/types";

import "./appointmentTypes.css";

type AppointmentTypeTone =
  | "blue"
  | "teal"
  | "orange"
  | "purple"
  | "green"
  | "red"
  | "amber";

const tones: AppointmentTypeTone[] = [
  "blue",
  "teal",
  "orange",
  "purple",
  "green",
  "red",
  "amber",
];

const icons: AppIconName[] = [
  "stethoscope",
  "activity",
  "megaphone",
  "flask",
  "user",
  "plus",
  "clipboard",
];

const getTone = (index: number): AppointmentTypeTone =>
  tones[index % tones.length];

const getIcon = (index: number): AppIconName => icons[index % icons.length];

const getStatusLabel = (type: AppointmentTypeDto): "Aktivan" | "Neaktivan" =>
  type.isActive ? "Aktivan" : "Neaktivan";

const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error
    ? error.message
    : typeof error === "object" && error !== null && "message" in error
      ? String(error.message)
      : fallback;

function AppointmentTypesPage(): ReactElement {
  const navigate = useNavigate();
  const [appointmentTypes, setAppointmentTypes] = useState<
    AppointmentTypeDto[]
  >([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointmentTypes = async () => {
      try {
        setIsLoading(true);
        const data = await appointmentTypesService.list();
        setAppointmentTypes(data);
        setError(null);
      } catch (err) {
        setError(getErrorMessage(err, "Greska pri ucitavanju vrsta termina."));
        setAppointmentTypes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointmentTypes();
  }, []);

  const filteredAppointmentTypes = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return appointmentTypes;
    }

    return appointmentTypes.filter((type) =>
      type.name.toLowerCase().includes(value),
    );
  }, [appointmentTypes, search]);

  const selectedType =
    filteredAppointmentTypes[0] ?? appointmentTypes[0] ?? null;
  const selectedTypeIndex = selectedType
    ? appointmentTypes.findIndex((type) => type.id === selectedType.id)
    : 0;

  return (
    <div className="appointment-types-page">
      <div className="appointment-types-page__hero">
        <div>
          <h1>Vrste termina</h1>
          <p>Pregled, upravljanje i povezivanje vrsta termina.</p>
        </div>
        <button
          className="appointment-types-primary-button"
          type="button"
          onClick={() => navigate(APP_ROUTES.createAppointmentType)}
        >
          <AppIcon name="plus" />
          Nova vrsta termina
        </button>
      </div>

      <div className="appointment-types-content-grid">
        <div className="appointment-types-main-stack">
          <section
            className="appointment-types-filter-panel"
            aria-label="Filteri vrsta termina"
          >
            <label className="appointment-types-search-field">
              <span className="sr-only">Pretraga vrsta termina</span>
              <AppIcon name="search" />
              <input
                type="search"
                placeholder="Pretrazite vrste termina po nazivu..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <label>
              <span>Status</span>
              <div>
                Svi statusi
                <AppIcon name="chevronDown" />
              </div>
            </label>
            <label>
              <span>Trajanje</span>
              <div>
                Sva trajanja
                <AppIcon name="chevronDown" />
              </div>
            </label>
            <label>
              <span>Online rezervacija</span>
              <div>
                Nije u API-ju
                <AppIcon name="chevronDown" />
              </div>
            </label>
            <button
              className="appointment-types-clear-button"
              type="button"
              onClick={() => setSearch("")}
            >
              <AppIcon name="tag" />
              Obrisi filtre
            </button>
          </section>

          <section
            className="appointment-types-table-panel"
            aria-label="Popis vrsta termina"
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
                <div
                  className="appointment-types-table appointment-types-table--head"
                  role="row"
                >
                  <span>Naziv</span>
                  <span>Trajanje</span>
                  <span>Opis</span>
                  <span>Dostupno lijecnicima</span>
                  <span>Online</span>
                  <span>Status</span>
                  <span aria-hidden="true" />
                </div>

                {filteredAppointmentTypes.map((type, index) => {
                  const status = getStatusLabel(type);

                  return (
                    <div
                      className={
                        index === 0
                          ? "appointment-types-table appointment-types-table--row appointment-types-table--row-selected"
                          : "appointment-types-table appointment-types-table--row"
                      }
                      role="row"
                      key={type.id}
                      onClick={() =>
                        navigate(
                          APP_ROUTES.editAppointmentType.replace(
                            ":appointmentTypeId",
                            type.id,
                          ),
                        )
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <span
                        className={`appointment-types-icon appointment-types-icon--${getTone(index)}`}
                      >
                        <AppIcon name={getIcon(index)} />
                      </span>
                      <strong>{type.name}</strong>
                      <span>{type.defaultDurationMinutes} min</span>
                      <span className="appointment-types-description">
                        Nije dostupno kroz trenutni API.
                      </span>
                      <span>Nije dostupno</span>
                      <span className="appointment-types-online">-</span>
                      <em
                        className={
                          type.isActive
                            ? "appointment-types-status appointment-types-status--active"
                            : "appointment-types-status appointment-types-status--limited"
                        }
                      >
                        {status}
                      </em>
                      <button
                        type="button"
                        aria-label={`Opcije za ${type.name}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(
                            APP_ROUTES.editAppointmentType.replace(
                              ":appointmentTypeId",
                              type.id,
                            ),
                          );
                        }}
                      >
                        <AppIcon name="dots" />
                      </button>
                    </div>
                  );
                })}

                {filteredAppointmentTypes.length === 0 ? (
                  <div style={{ padding: "2rem", textAlign: "center" }}>
                    Nema vrsta termina za zadanu pretragu.
                  </div>
                ) : null}
              </>
            )}

            <div className="appointment-types-pagination">
              <span>
                Prikazano {filteredAppointmentTypes.length} od{" "}
                {appointmentTypes.length} vrsta termina
              </span>
              <div>
                <button type="button" aria-label="Prethodna stranica">
                  <AppIcon name="chevronLeft" />
                </button>
                <button
                  className="appointment-types-pagination__active"
                  type="button"
                >
                  1
                </button>
                <button type="button" aria-label="Sljedeca stranica">
                  <AppIcon name="chevronRight" />
                </button>
              </div>
              <button className="appointment-types-page-size" type="button">
                10 po stranici
                <AppIcon name="chevronDown" />
              </button>
            </div>
          </section>
        </div>

        <aside
          className="appointment-types-detail-panel"
          aria-label="Detalji vrste termina"
        >
          {selectedType ? (
            <>
              <div className="appointment-types-detail-header">
                <span className="appointment-types-detail-icon">
                  <AppIcon name={getIcon(selectedTypeIndex)} />
                </span>
                <div>
                  <h2>{selectedType.name}</h2>
                  <span>
                    Trajanje: {selectedType.defaultDurationMinutes} min
                  </span>
                </div>
                <em>{getStatusLabel(selectedType)}</em>
              </div>

              <section className="appointment-types-info-card">
                <h3>Opis</h3>
                <p>Nije dostupno kroz trenutni API.</p>
              </section>

              <section className="appointment-types-info-card appointment-types-detail-row">
                <h3>Dostupno lijecnicima</h3>
                <div>
                  <AppIcon name="users" />
                  <span>Nije dostupno</span>
                </div>
              </section>

              <section className="appointment-types-info-card appointment-types-detail-row">
                <h3>Online rezervacija</h3>
                <div>
                  <AppIcon name="building" />
                  <span>Nije dostupno kroz trenutni API.</span>
                </div>
              </section>

              <section className="appointment-types-info-card appointment-types-detail-row">
                <h3>Kreirano</h3>
                <div>
                  <AppIcon name="calendar" />
                  <span>{selectedType.createdAt.slice(0, 10)}</span>
                </div>
              </section>

              <div className="appointment-types-detail-actions">
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      APP_ROUTES.editAppointmentType.replace(
                        ":appointmentTypeId",
                        selectedType.id,
                      ),
                    )
                  }
                >
                  <AppIcon name="note" />
                  Uredi podatke
                </button>
                <button
                  className="appointment-types-detail-actions__primary"
                  type="button"
                >
                  <AppIcon name="users" />
                  Dodijeli lijecnike
                </button>
              </div>
            </>
          ) : (
            <section className="appointment-types-info-card">
              <h3>Nema vrsta termina</h3>
              <p>Dodajte novu vrstu termina za prikaz detalja.</p>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

export { AppointmentTypesPage };
