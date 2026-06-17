import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

import { LoginPage } from "@/pages/LoginPage";

vi.mock("@/hooks", () => ({
  useLoginMutation: vi.fn(),
  usePublicOrganizationsQuery: vi.fn(),
  useSelectOrganizationMutation: vi.fn(),
  useForgotPasswordMutation: vi.fn(),
}));

vi.mock("@/stores", () => ({
  useAuthStore: vi.fn().mockReturnValue(false),
}));

vi.mock("@/components", () => ({
  AuthBrandLogo: () => null,
  PatientRegistrationForm: () => <div data-testid="patient-registration-form" />,
}));

import {
  useLoginMutation,
  usePublicOrganizationsQuery,
  useSelectOrganizationMutation,
} from "@/hooks";
import { useAuthStore } from "@/stores";

const idleMutation = () => ({
  mutateAsync: vi.fn().mockResolvedValue({ authenticated: true }),
  isPending: false,
  error: null,
});

const idleOrgMutation = () => ({
  mutateAsync: vi.fn(),
  isPending: false,
  error: null,
});

const emptyOrgsQuery = () => ({
  data: { organizations: [], pagination: null },
  isLoading: false,
  isFetching: false,
  error: null,
});

const setupMocks = (overrides: { loginError?: Error | null; loginPending?: boolean } = {}) => {
  vi.mocked(useAuthStore).mockReturnValue(false as unknown as boolean);
  vi.mocked(useLoginMutation).mockReturnValue({
    ...idleMutation(),
    isPending: overrides.loginPending ?? false,
    error: overrides.loginError ?? null,
  } as unknown as ReturnType<typeof useLoginMutation>);
  vi.mocked(usePublicOrganizationsQuery).mockReturnValue(
    emptyOrgsQuery() as unknown as ReturnType<typeof usePublicOrganizationsQuery>,
  );
  vi.mocked(useSelectOrganizationMutation).mockReturnValue(
    idleOrgMutation() as unknown as ReturnType<typeof useSelectOrganizationMutation>,
  );
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it("renders the login form heading", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: "Prijava" })).toBeInTheDocument();
  });

  it("renders email/phone and password input fields", () => {
    renderPage();
    expect(screen.getByLabelText("E-mail ili telefon")).toBeInTheDocument();
    expect(screen.getByLabelText("Lozinka")).toBeInTheDocument();
  });

  it("renders the login submit button", () => {
    renderPage();
    expect(screen.getByRole("button", { name: "Prijavi se" })).toBeInTheDocument();
  });

  it("shows password visibility toggle button", () => {
    renderPage();
    expect(screen.getByLabelText("Prikaži lozinku")).toBeInTheDocument();
  });

  it("renders a link to forgot password page", () => {
    renderPage();
    expect(screen.getByText("Zaboravili ste lozinku?")).toBeInTheDocument();
  });

  it("renders the registration trigger button", () => {
    renderPage();
    expect(
      screen.getByRole("button", { name: "Registrirajte se" }),
    ).toBeInTheDocument();
  });

  it("shows error message when login mutation returns an error", () => {
    setupMocks({ loginError: new Error("Pogrešni podaci za prijavu.") });
    renderPage();
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Pogrešni podaci za prijavu.")).toBeInTheDocument();
  });

  it("shows pending label on submit button while logging in", () => {
    setupMocks({ loginPending: true });
    renderPage();
    expect(
      screen.getByRole("button", { name: "Prijava u tijeku..." }),
    ).toBeInTheDocument();
  });

  it("disables submit button while login is pending", () => {
    setupMocks({ loginPending: true });
    renderPage();
    expect(screen.getByRole("button", { name: "Prijava u tijeku..." })).toBeDisabled();
  });

  it("navigates to organization selection step when registration button is clicked", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Registrirajte se" }));
    expect(screen.getByRole("heading", { name: "Odaberite ustanovu" })).toBeInTheDocument();
  });

  it("shows loading state in organization list during registration flow", () => {
    vi.mocked(usePublicOrganizationsQuery).mockReturnValue({
      ...emptyOrgsQuery(),
      isLoading: true,
      data: undefined,
    } as unknown as ReturnType<typeof usePublicOrganizationsQuery>);
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Registrirajte se" }));
    expect(screen.getByText("Učitavanje ustanova...")).toBeInTheDocument();
  });

  it("shows empty message when no organizations match during registration", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Registrirajte se" }));
    expect(
      screen.getByText("Nema ustanova koje odgovaraju pretrazi."),
    ).toBeInTheDocument();
  });

  it("returns to login view when back button is clicked in org selection", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Registrirajte se" }));
    fireEvent.click(screen.getByRole("button", { name: "Prijavite se" }));
    expect(screen.getByRole("heading", { name: "Prijava" })).toBeInTheDocument();
  });
});
