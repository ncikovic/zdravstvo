import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import type { AppointmentTypeDto } from "@zdravstvo/contracts";

import { AppointmentTypesPage } from "@/pages/appointmentTypes/AppointmentTypesPage";

vi.mock("@/services", () => ({
  appointmentTypesService: {
    list: vi.fn(),
  },
}));

vi.mock("@/components", () => ({
  AppIcon: () => null,
}));

import { appointmentTypesService } from "@/services";

const makeType = (id: string, name: string, active = true): AppointmentTypeDto => ({
  id,
  organizationId: "org1",
  name,
  defaultDurationMinutes: 30,
  isActive: active,
  createdAt: "2024-01-01T00:00:00.000Z",
});

const listResult = (types: AppointmentTypeDto[]) => ({
  appointmentTypes: types,
  totalPages: 1,
  totalItems: types.length,
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <AppointmentTypesPage />
    </MemoryRouter>,
  );

describe("AppointmentTypesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the page heading", async () => {
    vi.mocked(appointmentTypesService.list).mockResolvedValue(
      listResult([]) as unknown as Awaited<ReturnType<typeof appointmentTypesService.list>>,
    );
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Vrste termina" })).toBeInTheDocument();
    });
  });

  it("renders appointment type names after successful fetch", async () => {
    vi.mocked(appointmentTypesService.list).mockResolvedValue(
      listResult([
        makeType("t1", "Preventivni pregled"),
        makeType("t2", "Laboratorijska analiza"),
      ]) as unknown as Awaited<ReturnType<typeof appointmentTypesService.list>>,
    );
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText("Preventivni pregled").length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText("Laboratorijska analiza").length).toBeGreaterThan(0);
  });

  it("shows empty state text when no appointment types exist", async () => {
    vi.mocked(appointmentTypesService.list).mockResolvedValue(
      listResult([]) as unknown as Awaited<ReturnType<typeof appointmentTypesService.list>>,
    );
    renderPage();
    await waitFor(() => {
      expect(screen.queryByText("Preventivni pregled")).not.toBeInTheDocument();
    });
  });

  it("shows error message when fetch fails", async () => {
    vi.mocked(appointmentTypesService.list).mockRejectedValue(
      new Error("Nije moguće dohvatiti vrste termina"),
    );
    renderPage();
    await waitFor(() => {
      expect(
        screen.getByText("Nije moguće dohvatiti vrste termina"),
      ).toBeInTheDocument();
    });
  });

  it("shows active and inactive status labels", async () => {
    vi.mocked(appointmentTypesService.list).mockResolvedValue(
      listResult([
        makeType("t1", "Pregled", true),
        makeType("t2", "Analiza", false),
      ]) as unknown as Awaited<ReturnType<typeof appointmentTypesService.list>>,
    );
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText("Aktivan").length).toBeGreaterThan(0);
    });
    expect(screen.getByText("Neaktivan")).toBeInTheDocument();
  });
});
