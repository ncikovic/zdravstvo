import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import type { UseQueryResult } from "@tanstack/react-query";

import { AppointmentsPage } from "@/pages/appointments/AppointmentsPage";
import type {
  AppointmentListResponseDto,
  AppointmentResponseDto,
  AppointmentTypeDto,
  DoctorResponseDto,
} from "@zdravstvo/contracts";
import type { AppApiError } from "@/types";

vi.mock("@/hooks", () => ({
  useAppointmentsQuery: vi.fn(),
  useDoctorsQuery: vi.fn(),
  useAppointmentTypesQuery: vi.fn(),
}));

import {
  useAppointmentsQuery,
  useDoctorsQuery,
  useAppointmentTypesQuery,
} from "@/hooks";

const t = (hour: number): string =>
  `2024-01-15T${String(hour).padStart(2, "0")}:00:00.000Z`;

const makeDoctor = (id: string, first: string, last: string): DoctorResponseDto => ({
  id,
  firstName: first,
  lastName: last,
  title: "Liječnik",
  email: null,
  phone: null,
  licenseNumber: null,
  bio: null,
  isActive: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
});

const makeAppointment = (
  id: string,
  doctorId: string,
  doctorFirst: string,
  doctorLast: string,
  patientFirst: string,
  patientLast: string,
  startHour: number,
  endHour: number,
): AppointmentResponseDto => ({
  id,
  organizationId: "org1",
  startAt: t(startHour),
  endAt: t(endHour),
  status: "SCHEDULED",
  notes: null,
  cancellationReason: null,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  doctor: { id: doctorId, firstName: doctorFirst, lastName: doctorLast, title: "Liječnik" },
  patient: { id: "pat1", firstName: patientFirst, lastName: patientLast, dateOfBirth: null, oib: null },
  appointmentType: { id: "type1", name: "Pregled", defaultDurationMinutes: 60 },
});

type ApptResult = UseQueryResult<AppointmentListResponseDto, AppApiError>;
type DoctorResult = UseQueryResult<DoctorResponseDto[], AppApiError>;
type TypeResult = UseQueryResult<AppointmentTypeDto[], AppApiError>;

const mockHooks = ({
  appointments = [] as AppointmentResponseDto[],
  doctors = [] as DoctorResponseDto[],
  types = [] as AppointmentTypeDto[],
  appointmentsLoading = false,
  appointmentsError = null as Error | null,
} = {}) => {
  vi.mocked(useAppointmentsQuery).mockReturnValue({
    isLoading: appointmentsLoading,
    data: appointmentsLoading ? undefined : { appointments },
    error: appointmentsError,
  } as unknown as ApptResult);

  vi.mocked(useDoctorsQuery).mockReturnValue({
    isLoading: false,
    data: doctors,
    error: null,
  } as unknown as DoctorResult);

  vi.mocked(useAppointmentTypesQuery).mockReturnValue({
    isLoading: false,
    data: types,
    error: null,
  } as unknown as TypeResult);
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <AppointmentsPage />
    </MemoryRouter>,
  );

describe("AppointmentsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the page heading", () => {
    mockHooks();
    renderPage();
    expect(screen.getByRole("heading", { name: "Termini" })).toBeInTheDocument();
  });

  it("shows loading state while fetching appointments", () => {
    mockHooks({ appointmentsLoading: true });
    renderPage();
    expect(screen.getByText("Ucitavanje termina iz baze...")).toBeInTheDocument();
  });

  it("shows empty state when no appointments exist for the day", () => {
    mockHooks();
    renderPage();
    expect(screen.getByText("Nema termina za odabrani dan.")).toBeInTheDocument();
  });

  it("shows error alert when appointments fail to load", () => {
    mockHooks({ appointmentsError: new Error("Server error") });
    renderPage();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders appointment card when a single appointment is loaded", () => {
    const appt = makeAppointment("a1", "d1", "Ivan", "Perić", "Marko", "Marković", 9, 10);
    mockHooks({
      appointments: [appt],
      doctors: [makeDoctor("d1", "Ivan", "Perić")],
    });
    renderPage();
    expect(screen.getAllByText("Marko Marković").length).toBeGreaterThan(0);
  });

  it("renders separate doctor heading columns for multiple doctors", () => {
    const appts = [
      makeAppointment("a1", "d1", "Ivan", "Perić", "Marko", "Marković", 9, 10),
      makeAppointment("a2", "d2", "Ante", "Antić", "Ana", "Anić", 10, 11),
    ];
    mockHooks({
      appointments: appts,
      doctors: [makeDoctor("d1", "Ivan", "Perić"), makeDoctor("d2", "Ante", "Antić")],
    });
    renderPage();
    expect(screen.getAllByText("Dr. Ivan Perić").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Dr. Ante Antić").length).toBeGreaterThan(0);
  });

  it("renders all doctors (more than 4) when many have appointments", () => {
    const appts = Array.from({ length: 6 }, (_, i) =>
      makeAppointment(`a${i}`, `d${i}`, `Doktor${i}`, `Prezime${i}`, "Pacijent", `P${i}`, 9 + i, 10 + i),
    );
    const doctors = Array.from({ length: 6 }, (_, i) =>
      makeDoctor(`d${i}`, `Doktor${i}`, `Prezime${i}`),
    );
    mockHooks({ appointments: appts, doctors });
    renderPage();
    const columns = document.querySelectorAll(".appointments-doctor-heading");
    expect(columns.length).toBeGreaterThan(4);
  });

  it("wraps calendar grid in a scrollable container", () => {
    mockHooks();
    renderPage();
    expect(document.querySelector(".appointments-calendar-scroll")).toBeInTheDocument();
  });

  it("places non-overlapping appointments for the same doctor in the same full-width lane", () => {
    const appts = [
      makeAppointment("a1", "d1", "Ivan", "Perić", "Marko", "Marković", 9, 10),
      makeAppointment("a2", "d1", "Ivan", "Perić", "Ana", "Anić", 11, 12),
    ];
    mockHooks({ appointments: appts, doctors: [makeDoctor("d1", "Ivan", "Perić")] });
    renderPage();
    const cards = document.querySelectorAll(".appointment-card");
    expect(cards.length).toBe(2);
    expect((cards[0] as HTMLElement).style.left).toBe("9px");
    expect((cards[1] as HTMLElement).style.left).toBe("9px");
  });

  it("places overlapping appointments for the same doctor in separate visual lanes", () => {
    const appts = [
      makeAppointment("a1", "d1", "Ivan", "Perić", "Marko", "Marković", 9, 10),
      makeAppointment("a2", "d1", "Ivan", "Perić", "Ana", "Anić", 9, 10),
    ];
    mockHooks({ appointments: appts, doctors: [makeDoctor("d1", "Ivan", "Perić")] });
    renderPage();
    const cards = document.querySelectorAll(".appointment-card");
    expect(cards.length).toBe(2);
    const left0 = (cards[0] as HTMLElement).style.left;
    const left1 = (cards[1] as HTMLElement).style.left;
    expect(left0).not.toBe(left1);
  });

  it("appointments for different doctors do not share lane computation", () => {
    const appts = [
      makeAppointment("a1", "d1", "Ivan", "Perić", "Marko", "Marković", 9, 10),
      makeAppointment("a2", "d2", "Ante", "Antić", "Ana", "Anić", 9, 10),
    ];
    mockHooks({
      appointments: appts,
      doctors: [makeDoctor("d1", "Ivan", "Perić"), makeDoctor("d2", "Ante", "Antić")],
    });
    renderPage();
    const cards = document.querySelectorAll(".appointment-card");
    expect(cards.length).toBe(2);
    // Each doctor has only one appointment so both are in lane 0 (full width)
    expect((cards[0] as HTMLElement).style.left).toBe("9px");
    expect((cards[1] as HTMLElement).style.left).toBe("9px");
  });

  it("shows date navigation controls", () => {
    mockHooks();
    renderPage();
    expect(screen.getByLabelText("Prethodni dan")).toBeInTheDocument();
    expect(screen.getByLabelText("Sljedeci dan")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Danas" })).toBeInTheDocument();
  });

  it("shows legend with appointment status labels", () => {
    mockHooks();
    renderPage();
    expect(screen.getByText("Zakazano")).toBeInTheDocument();
    expect(screen.getByText("Otkazano / nedolazak")).toBeInTheDocument();
    expect(screen.getByText("Zavrseno")).toBeInTheDocument();
  });

  it("renders a link to create a new appointment", () => {
    mockHooks();
    renderPage();
    const createLinks = screen.getAllByText("Novi termin");
    expect(createLinks.length).toBeGreaterThan(0);
  });

  it("shows mobile-responsive toolbar with day view toggle buttons", () => {
    mockHooks();
    renderPage();
    expect(screen.getByRole("button", { name: "Dan" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tjedan" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mjesec" })).toBeInTheDocument();
  });
});
