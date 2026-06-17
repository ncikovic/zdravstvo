import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { LoginPage } from '@/pages/LoginPage';

vi.mock('@/hooks', () => ({
  useLoginMutation: vi.fn(),
  usePublicOrganizationsQuery: vi.fn(),
  useSelectOrganizationMutation: vi.fn(),
  useForgotPasswordMutation: vi.fn(),
}));

vi.mock('@/stores', () => {
  const getState = vi.fn().mockReturnValue({ isSystemAdmin: false, role: null });
  const useAuthStore = vi.fn().mockReturnValue(false);
  Object.assign(useAuthStore, { getState, setState: vi.fn() });
  return { useAuthStore };
});

vi.mock('@/components', () => ({
  AuthBrandLogo: () => null,
  PatientRegistrationForm: () => <div data-testid="patient-registration-form" />,
}));

import {
  useLoginMutation,
  usePublicOrganizationsQuery,
  useSelectOrganizationMutation,
} from '@/hooks';

const mockLoginMutate = vi.fn();

const setupMocks = (options: { loginPending?: boolean; loginError?: Error | null } = {}) => {
  vi.mocked(useLoginMutation).mockReturnValue({
    mutateAsync: mockLoginMutate.mockResolvedValue({ authenticated: true }),
    isPending: options.loginPending ?? false,
    error: options.loginError ?? null,
  } as unknown as ReturnType<typeof useLoginMutation>);

  vi.mocked(usePublicOrganizationsQuery).mockReturnValue({
    data: { organizations: [], pagination: null },
    isLoading: false,
    isFetching: false,
    error: null,
  } as unknown as ReturnType<typeof usePublicOrganizationsQuery>);

  vi.mocked(useSelectOrganizationMutation).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  } as unknown as ReturnType<typeof useSelectOrganizationMutation>);
};

const renderLogin = () =>
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );

describe('Acceptance: User login flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoginMutate.mockReset();
    setupMocks();
  });

  it('AC-01: login page is accessible — heading, identifier and password inputs are present', () => {
    renderLogin();

    expect(screen.getByRole('heading', { name: 'Prijava' })).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail ili telefon')).toBeInTheDocument();
    expect(screen.getByLabelText('Lozinka')).toBeInTheDocument();
  });

  it('AC-02: user can enter an identifier into the email/phone field', () => {
    renderLogin();

    const identifierInput = screen.getByLabelText('E-mail ili telefon');
    fireEvent.change(identifierInput, { target: { value: 'doktor@poliklinika.hr' } });

    expect(identifierInput).toHaveValue('doktor@poliklinika.hr');
  });

  it('AC-03: user can enter a password into the password field', () => {
    renderLogin();

    const passwordInput = screen.getByLabelText('Lozinka');
    fireEvent.change(passwordInput, { target: { value: 'Demo1234!' } });

    expect(passwordInput).toHaveValue('Demo1234!');
  });

  it('AC-04: submit button is enabled before submission', () => {
    renderLogin();

    expect(screen.getByRole('button', { name: 'Prijavi se' })).not.toBeDisabled();
  });

  it('AC-05: submitting the form calls the login mutation with identifier and password', async () => {
    renderLogin();

    fireEvent.change(screen.getByLabelText('E-mail ili telefon'), {
      target: { value: 'doktor@poliklinika.hr' },
    });
    fireEvent.change(screen.getByLabelText('Lozinka'), {
      target: { value: 'Demo1234!' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Prijavi se' }));

    await waitFor(() => {
      expect(mockLoginMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          identifier: 'doktor@poliklinika.hr',
          password: 'Demo1234!',
        }),
      );
    });
  });

  it('AC-06: authentication failure displays an error message to the user', () => {
    setupMocks({ loginError: new Error('Neispravni podaci za prijavu.') });
    renderLogin();

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Neispravni podaci za prijavu.')).toBeInTheDocument();
  });

  it('AC-07: login button is disabled and shows progress text while authenticating', () => {
    setupMocks({ loginPending: true });
    renderLogin();

    const pendingButton = screen.getByRole('button', { name: 'Prijava u tijeku...' });
    expect(pendingButton).toBeDisabled();
  });

  it('AC-08: new user can navigate to registration flow by clicking register button', () => {
    renderLogin();

    fireEvent.click(screen.getByRole('button', { name: 'Registrirajte se' }));

    expect(screen.getByRole('heading', { name: 'Odaberite ustanovu' })).toBeInTheDocument();
  });
});
