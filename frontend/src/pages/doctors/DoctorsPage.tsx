import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { useNavigate } from "react-router-dom";

import { AppIcon } from "@/components";
import { APP_ROUTES } from "@/app/routes";
import { doctorsService } from "@/services/doctors.service";
import type { DoctorResponseDto } from "@zdravstvo/contracts";

import "./doctors.css";

type DoctorTone =
  | "teal"
  | "purple"
  | "red"
  | "blue"
  | "violet"
  | "orange"
  | "green"
  | "amber";

const tones: DoctorTone[] = [
  "teal",
  "purple",
  "red",
  "blue",
  "violet",
  "orange",
  "green",
  "amber",
];

const getTone = (index: number): DoctorTone => tones[index % tones.length];

const getInitials = (firstName: string, lastName: string): string => {
  return (firstName[0] + lastName[0]).toUpperCase();
};

function DoctorsPage(): ReactElement {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<DoctorResponseDto[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        const data = await doctorsService.list(page);
        setDoctors(data.doctors);
        setTotalPages(data.totalPages);
        setTotalItems(data.totalItems);
        setSelectedDoctorId((current) => current ?? data.doctors[0]?.id ?? null);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch doctors",
        );
        setDoctors([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, [page]);

  const filteredDoctors = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return doctors;
    return doctors.filter((doctor) =>
      [
        `${doctor.firstName} ${doctor.lastName}`,
        doctor.title,
        doctor.email,
        doctor.phone,
        doctor.licenseNumber,
      ]
        .filter(Boolean)
        .some((field) => field?.toLowerCase().includes(value)),
    );
  }, [doctors, search]);

  const selectedDoctor =
    filteredDoctors.find((doctor) => doctor.id === selectedDoctorId) ??
    filteredDoctors[0] ??
    doctors.find((doctor) => doctor.id === selectedDoctorId) ??
    doctors[0] ??
    null;

  return (
    <div className="doctors-page">
      <div className="doctors-page__hero">
        <div>
          <h1>Liječnici</h1>
          <p>Pregled, pretraga i upravljanje podacima o liječnicima.</p>
        </div>
      </div>

      <div className="doctors-content-grid">
        <div className="doctors-main-stack">
          <section
            className="doctors-filter-panel"
            aria-label="Filteri liječnika"
          >
            <div className="doctors-search-row">
              <label className="doctors-search-field">
                <span className="sr-only">Pretraga liječnika</span>
                <AppIcon name="search" />
                <input
                  type="search"
                  placeholder="Pretražite liječnike po imenu, specijalizaciji ili e-mailu..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
              <button
                className="doctors-primary-button"
                type="button"
                onClick={() => navigate(APP_ROUTES.doctorsCreate)}
              >
                <AppIcon name="plus" />
                Novi liječnik
              </button>
            </div>

            <div className="doctors-filter-row">
              <label>
                <span>Status</span>
                <div>
                  Svi statusi
                  <AppIcon name="chevronDown" />
                </div>
              </label>
              <label>
                <span>Specijalizacija</span>
                <div>
                  Sve specijalizacije
                  <AppIcon name="chevronDown" />
                </div>
              </label>
              <label>
                <span>Dostupnost</span>
                <div>
                  Svi liječnici
                  <AppIcon name="chevronDown" />
                </div>
              </label>
              <label>
                <span>Lokacija</span>
                <div>
                  Sve lokacije
                  <AppIcon name="chevronDown" />
                </div>
              </label>
              <button className="doctors-clear-button" type="button" onClick={() => setSearch("")}>
                <AppIcon name="tag" />
                Obriši filtre
              </button>
            </div>
          </section>

          <section className="doctors-table-panel" aria-label="Popis liječnika">
            {isLoading ? (
              <div style={{ padding: "2rem", textAlign: "center" }}>
                Učitavanje...
              </div>
            ) : error ? (
              <div
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  color: "#d32f2f",
                }}
              >
                Greška pri učitavanju liječnika: {error}
              </div>
            ) : (
              <>
                <div className="doctors-table doctors-table--head" role="row">
                  <span>Ime i prezime ↓</span>
                  <span>Telefon</span>
                  <span>E-mail</span>
                  <span>Status</span>
                  <span aria-hidden="true" />
                </div>

                {filteredDoctors.map((doctor, index) => {
                  const fullName = `${doctor.firstName} ${doctor.lastName}`;
                  const initials = getInitials(
                    doctor.firstName,
                    doctor.lastName,
                  );
                  const tone = getTone(index);

                  return (
                    <div
                      className={
                        doctor.id === selectedDoctor?.id
                          ? "doctors-table doctors-table--row doctors-table--row-selected"
                          : "doctors-table doctors-table--row"
                      }
                      role="row"
                      key={doctor.id}
                      onClick={() => setSelectedDoctorId(doctor.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <span
                        className={`doctors-avatar doctors-avatar--${tone}`}
                      >
                        {initials}
                      </span>
                      <strong>
                        {doctor.title
                          ? `Dr. ${fullName}, ${doctor.title}`
                          : `Dr. ${fullName}`}
                      </strong>
                      <span>{doctor.phone || "Nije dostupno"}</span>
                      <span>{doctor.email || "Nije dostupno"}</span>
                      <em
                        className={
                          doctor.isActive
                            ? "doctors-status doctors-status--active"
                            : "doctors-status doctors-status--inactive"
                        }
                      >
                        {doctor.isActive ? "Aktivan" : "Neaktivan"}
                      </em>
                      <button
                        type="button"
                        aria-label={`Opcije za ${fullName}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <AppIcon name="dots" />
                      </button>
                    </div>
                  );
                })}
              </>
            )}

            <div className="doctors-pagination">
              <span>
                Prikazano {Math.min((page - 1) * 10 + 1, totalItems)}–{Math.min(page * 10, totalItems)} od {totalItems} liječnika
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
                        className={item === page ? "doctors-pagination__active" : undefined}
                        onClick={() => setPage(item as number)}
                      >
                        {item}
                      </button>
                    ),
                  )}
                <button
                  type="button"
                  aria-label="Sljedeća stranica"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <AppIcon name="chevronRight" />
                </button>
              </div>
            </div>
          </section>
        </div>

        <aside className="doctors-detail-panel" aria-label="Detalji liječnika">
          <button
            className="doctors-detail-close"
            type="button"
            aria-label="Zatvori detalje"
            onClick={() => setSelectedDoctorId(null)}
          >
            ×
          </button>
          {selectedDoctor && !isLoading && !error && (
            <>
              {(() => {
                const initials = getInitials(
                  selectedDoctor.firstName,
                  selectedDoctor.lastName,
                );
                return (
                  <>
                    <div className="doctors-detail-header">
                      <span className="doctors-detail-avatar">{initials}</span>
                      <div>
                        <h2>
                          Dr. {selectedDoctor.firstName}{" "}
                          {selectedDoctor.lastName}
                        </h2>
                        {selectedDoctor.title && (
                          <span>{selectedDoctor.title}</span>
                        )}
                        {selectedDoctor.licenseNumber && (
                          <small>
                            Licencija: {selectedDoctor.licenseNumber}
                          </small>
                        )}
                      </div>
                      <em>
                        {selectedDoctor.isActive ? "Aktivan" : "Neaktivan"}
                      </em>
                    </div>

                    <section className="doctors-info-card">
                      <h3>Kontakt podaci</h3>
                      <div className="doctors-info-list">
                        {selectedDoctor.phone && (
                          <>
                            <span>
                              <AppIcon name="clock" />
                              Telefon
                            </span>
                            <strong>{selectedDoctor.phone}</strong>
                          </>
                        )}
                        {selectedDoctor.email && (
                          <>
                            <span>
                              <AppIcon name="mail" />
                              E-mail
                            </span>
                            <strong>{selectedDoctor.email}</strong>
                          </>
                        )}
                      </div>
                    </section>

                    <section className="doctors-info-card doctors-actions-card">
                      <h3>Brze akcije</h3>
                      <div className="doctors-actions-grid">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              APP_ROUTES.doctorDetails.replace(
                                ":doctorId",
                                selectedDoctor.id,
                              ),
                            )
                          }
                        >
                          <AppIcon name="note" />
                          Pogledaj detalje
                        </button>
                      </div>
                    </section>
                  </>
                );
              })()}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

export { DoctorsPage };
