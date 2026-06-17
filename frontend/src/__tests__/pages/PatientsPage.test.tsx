import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import type { PatientDto } from "@zdravstvo/contracts";
import { UserStatus } from "@zdravstvo/contracts";

import { PatientsPage } from "@/pages/patients/PatientsPage";

vi.mock("@/services", () => ({
  patientsService: {
    list: vi.fn(),
  },
}));

vi.mock("@/components", () => ({
  AppIcon: () => null,
}));

import { patientsService } from "@/services";

const makePatient = (id: string, first: string, last: string): PatientDto => ({
  id,
  firstName: first,
  lastName: last,
  email: `${first.toLowerCase()}@test.hr`,
  phone: null,
  status: UserStatus.ACTIVE,
  dateOfBirth: "1990-01-01",
  oib: null,
  address: null,
  emergencyContactName: null,
  emergencyContactPhone: null,
  notes: null,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <PatientsPage />
    </MemoryRouter>,
  );

describe("PatientsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the page heading", async () => {
    vi.mocked(patientsService.list).mockResolvedValue({
      patients: [],
      totalPages: 1,
      totalItems: 0,
    } as unknown as Awaited<ReturnType<typeof patientsService.list>>);
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Pacijenti" })).toBeInTheDocument();
    });
  });

  it("renders patient names after successful fetch", async () => {
    vi.mocked(patientsService.list).mockResolvedValue({
      patients: [
        makePatient("p1", "Marko", "Marković"),
        makePatient("p2", "Ana", "Anić"),
      ],
      totalPages: 1,
      totalItems: 2,
    } as unknown as Awaited<ReturnType<typeof patientsService.list>>);
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText("Marko Marković").length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText("Ana Anić").length).toBeGreaterThan(0);
  });

  it("shows error message when fetch fails", async () => {
    vi.mocked(patientsService.list).mockRejectedValue(
      new Error("Greška pri dohvatu pacijenata"),
    );
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("Greška pri dohvatu pacijenata")).toBeInTheDocument();
    });
  });

  it("shows empty state when no patients match", async () => {
    vi.mocked(patientsService.list).mockResolvedValue({
      patients: [],
      totalPages: 1,
      totalItems: 0,
    } as unknown as Awaited<ReturnType<typeof patientsService.list>>);
    renderPage();
    await waitFor(() => {
      expect(screen.queryByText("Marko Marković")).not.toBeInTheDocument();
    });
  });

  it("renders a search input for filtering patients", async () => {
    vi.mocked(patientsService.list).mockResolvedValue({
      patients: [],
      totalPages: 1,
      totalItems: 0,
    } as unknown as Awaited<ReturnType<typeof patientsService.list>>);
    renderPage();
    await waitFor(() => {
      const searchInput = document.querySelector("input[type='search']");
      expect(searchInput).toBeInTheDocument();
    });
  });
});
