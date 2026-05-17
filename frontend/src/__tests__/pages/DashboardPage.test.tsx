import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { OrganizationUserRole } from "@zdravstvo/contracts";
import type { UseQueryResult } from "@tanstack/react-query";

import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import type { DashboardData } from "@/types";
import type { AppApiError } from "@/types";

vi.mock("@/hooks", () => ({
  useDashboardQuery: vi.fn(),
}));

vi.mock("@/stores", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/components", () => ({
  AppIcon: () => null,
}));

import { useDashboardQuery } from "@/hooks";
import { useAuthStore } from "@/stores";
import type { AuthStore } from "@/stores/auth/auth.types";

type DashboardQueryResult = UseQueryResult<DashboardData, AppApiError>;

const baseOrg = {
  id: "org1",
  name: "Zdravstvena ustanova",
  address: null,
  city: null,
};

const baseTimestamps = {
  generatedAt: new Date(),
  todayStart: new Date(),
  todayEnd: new Date(),
  organization: baseOrg,
};

const adminDashboard: DashboardData = {
  ...baseTimestamps,
  role: OrganizationUserRole.ADMIN,
  stats: {
    todayAppointmentCount: 5,
    activeDoctorCount: 3,
    recentPatientCount: 10,
    reminderCount: 2,
    completedAppointmentCount: 3,
    scheduledAppointmentCount: 2,
    cancelledAppointmentCount: 0,
    sentReminderCount: 2,
  },
  reminderSummary: { total: 2, pending: 1, sent: 1, failed: 0 },
  todaySchedule: [],
  availableSlots: [],
  recentActivity: [],
};

const doctorDashboard: DashboardData = {
  ...baseTimestamps,
  role: OrganizationUserRole.DOCTOR,
  stats: {
    todayAppointmentCount: 3,
    patientsTodayCount: 3,
    freeBlockCount: 1,
    completedAppointmentCount: 2,
  },
  todaySchedule: [],
  nextAppointment: null,
  availableSlots: [],
  recentActivity: [],
};

const mockRole = (role: OrganizationUserRole | null) => {
  vi.mocked(useAuthStore).mockImplementation(
    (selector: (state: AuthStore) => unknown) => selector({ role } as unknown as AuthStore),
  );
};

const mockQueryResult = (
  isPending: boolean,
  isError: boolean,
  data?: DashboardData,
) => {
  vi.mocked(useDashboardQuery).mockReturnValue({
    isPending,
    isError,
    data,
  } as unknown as DashboardQueryResult);
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state while data is pending", () => {
    mockRole(OrganizationUserRole.ADMIN);
    mockQueryResult(true, false);
    renderPage();
    expect(screen.getByText("Učitavanje nadzorne ploče")).toBeInTheDocument();
  });

  it("shows error state when data fails to load", () => {
    mockRole(OrganizationUserRole.ADMIN);
    mockQueryResult(false, true);
    renderPage();
    expect(screen.getByText("Nadzorna ploča nije dostupna")).toBeInTheDocument();
  });

  it("shows unavailable state when role is missing", () => {
    mockRole(null);
    mockQueryResult(false, false, undefined);
    renderPage();
    expect(screen.getByText("Nadzorna ploča nije dostupna")).toBeInTheDocument();
  });

  it("renders admin dashboard for admin role with matching data", () => {
    mockRole(OrganizationUserRole.ADMIN);
    mockQueryResult(false, false, adminDashboard);
    renderPage();
    expect(document.querySelector(".dashboard-page")).toBeInTheDocument();
  });

  it("renders doctor dashboard for doctor role with matching data", () => {
    mockRole(OrganizationUserRole.DOCTOR);
    mockQueryResult(false, false, doctorDashboard);
    renderPage();
    expect(document.querySelector(".dashboard-page")).toBeInTheDocument();
  });

  it("shows mismatch error when role and dashboard data role do not match", () => {
    mockRole(OrganizationUserRole.ADMIN);
    mockQueryResult(false, false, doctorDashboard);
    renderPage();
    expect(screen.getByText("Nadzorna ploča nije dostupna")).toBeInTheDocument();
  });
});
