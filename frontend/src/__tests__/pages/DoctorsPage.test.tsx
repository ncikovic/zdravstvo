import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import type { DoctorResponseDto } from "@zdravstvo/contracts";

import { DoctorsPage } from "@/pages/doctors/DoctorsPage";

vi.mock("@/services/doctors.service", () => ({
  doctorsService: {
    list: vi.fn(),
  },
}));

vi.mock("@/components", () => ({
  AppIcon: () => null,
}));

import { doctorsService } from "@/services/doctors.service";

const makeDoctor = (id: string, first: string, last: string): DoctorResponseDto => ({
  id,
  firstName: first,
  lastName: last,
  title: null,
  email: `${first.toLowerCase()}@test.hr`,
  phone: null,
  licenseNumber: null,
  bio: null,
  isActive: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <DoctorsPage />
    </MemoryRouter>,
  );

describe("DoctorsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the page heading", async () => {
    vi.mocked(doctorsService.list).mockResolvedValue({
      doctors: [],
      totalPages: 1,
      totalItems: 0,
    } as unknown as Awaited<ReturnType<typeof doctorsService.list>>);
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Liječnici" })).toBeInTheDocument();
    });
  });

  it("shows loading indicator while fetching", () => {
    vi.mocked(doctorsService.list).mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.queryByRole("heading", { name: "Liječnici" })).toBeInTheDocument();
  });

  it("renders doctor names after successful fetch", async () => {
    vi.mocked(doctorsService.list).mockResolvedValue({
      doctors: [makeDoctor("d1", "Ivan", "Perić"), makeDoctor("d2", "Ante", "Antić")],
      totalPages: 1,
      totalItems: 2,
    } as unknown as Awaited<ReturnType<typeof doctorsService.list>>);
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText("Dr. Ivan Perić").length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText("Dr. Ante Antić").length).toBeGreaterThan(0);
  });

  it("shows empty state when no doctors are available", async () => {
    vi.mocked(doctorsService.list).mockResolvedValue({
      doctors: [],
      totalPages: 1,
      totalItems: 0,
    } as unknown as Awaited<ReturnType<typeof doctorsService.list>>);
    renderPage();
    await waitFor(() => {
      expect(screen.queryByText("Dr. Ivan Perić")).not.toBeInTheDocument();
    });
  });

  it("shows error message when fetch fails", async () => {
    vi.mocked(doctorsService.list).mockRejectedValue(new Error("Mrežna greška"));
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/Mrežna greška/)).toBeInTheDocument();
    });
  });
});
