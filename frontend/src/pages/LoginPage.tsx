import { zodResolver } from '@hookform/resolvers/zod';
import type {
  LoginOrganizationSelectionRequiredResponseDto,
  LoginRequestDto,
} from '@zdravstvo/contracts';
import { loginRequestSchema } from '@zdravstvo/contracts';
import type { ReactElement } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { z } from 'zod';

import { AuthBrandLogo, PatientRegistrationForm } from '@/components';
import {
  useLoginMutation,
  usePublicOrganizationsQuery,
  useSelectOrganizationMutation,
} from '@/hooks';
import { useAuthStore } from '@/stores';
import type { Organization } from '@/types';

interface LocationState {
  registrationSuccess?: boolean;
  registeredEmail?: string;
  from?: {
    pathname?: string;
  };
}

type AuthStep = 'login' | 'organizationSelection' | 'register';
type LoginFormValues = z.input<typeof loginRequestSchema>;

interface LoginPageProps {
  initialStep?: AuthStep;
}

const resolveRedirectPath = (state: LocationState | null | undefined): string => {
  const redirectPath = state?.from?.pathname;

  return redirectPath && redirectPath !== '/login' ? redirectPath : '/';
};

const matchesOrganizationSearch = (
  organization: Organization,
  normalizedSearch: string,
): boolean => {
  if (!normalizedSearch) {
    return true;
  }

  return [organization.name, organization.city, organization.address]
    .filter(Boolean)
    .some((value) => value?.toLowerCase().includes(normalizedSearch));
};

const OrganizationCardIcon = (): ReactElement => (
  <span className="organization-card__icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" role="img">
      <path d="M4.5 20.2h15" />
      <path d="M6.3 20.2V5.6a1.8 1.8 0 0 1 1.8-1.8h7.8a1.8 1.8 0 0 1 1.8 1.8v14.6" />
      <path d="M9.2 8h5.6" />
      <path d="M9.2 11.2h5.6" />
      <path d="M12 14.1v4" />
      <path d="M10 16.1h4" />
    </svg>
  </span>
);

const SearchIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
    <path d="M10.8 18.1a7.3 7.3 0 1 0 0-14.6 7.3 7.3 0 0 0 0 14.6Z" />
    <path d="m16.2 16.2 4.3 4.3" />
  </svg>
);

const ChevronIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
    <path d="m9 5 7 7-7 7" />
  </svg>
);

export function LoginPage({ initialStep = 'login' }: LoginPageProps): ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loginMutation = useLoginMutation();
  const selectOrganizationMutation = useSelectOrganizationMutation();
  const organizationsQuery = usePublicOrganizationsQuery();
  const locationState = location.state as LocationState | null;
  const [authStep, setAuthStep] = useState<AuthStep>(initialStep);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [organizationSelection, setOrganizationSelection] =
    useState<LoginOrganizationSelectionRequiredResponseDto | null>(null);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
  const [organizationSearch, setOrganizationSearch] = useState('');
  const [selectedRegistrationOrganization, setSelectedRegistrationOrganization] =
    useState<Organization | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues, unknown, LoginRequestDto>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: {
      identifier: 'admin@zdravstvo-demo.test',
      password: 'Demo1234!',
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    navigate(resolveRedirectPath(locationState), {
      replace: true,
    });
  }, [isAuthenticated, locationState, navigate]);

  const filteredOrganizations = useMemo(() => {
    const normalizedSearch = organizationSearch.trim().toLowerCase();

    return (organizationsQuery.data ?? []).filter((organization) =>
      matchesOrganizationSearch(organization, normalizedSearch),
    );
  }, [organizationSearch, organizationsQuery.data]);

  const onSubmit = async (values: LoginRequestDto): Promise<void> => {
    setOrganizationSelection(null);
    const loginResponse = await loginMutation.mutateAsync(values);

    if (loginResponse.requiresOrganizationSelection) {
      setOrganizationSelection(loginResponse);
      return;
    }

    navigate(resolveRedirectPath(locationState), {
      replace: true,
    });
  };

  const onSelectOrganization = async (organizationId: string): Promise<void> => {
    if (!organizationSelection) {
      return;
    }

    setSelectedOrganizationId(organizationId);

    await selectOrganizationMutation.mutateAsync({
      selectionToken: organizationSelection.selectionToken,
      organizationId,
    });

    navigate(resolveRedirectPath(locationState), {
      replace: true,
    });
  };

  const startRegistration = (): void => {
    setOrganizationSelection(null);
    setSelectedOrganizationId(null);
    setSelectedRegistrationOrganization(null);
    setOrganizationSearch('');
    setAuthStep('organizationSelection');
  };

  const returnToLogin = (): void => {
    setOrganizationSelection(null);
    setSelectedOrganizationId(null);
    setSelectedRegistrationOrganization(null);
    setOrganizationSearch('');
    setAuthStep('login');
  };

  const selectRegistrationOrganization = (organization: Organization): void => {
    setSelectedRegistrationOrganization(organization);
    setAuthStep('register');
  };

  const handleRegistrationSuccess = (registeredEmail: string): void => {
    setAuthStep('login');
    setSelectedRegistrationOrganization(null);
    setOrganizationSearch('');
    navigate('/login', {
      replace: true,
      state: {
        registrationSuccess: true,
        registeredEmail,
      },
    });
  };

  const isPending = loginMutation.isPending || isSubmitting;
  const isSelecting = selectOrganizationMutation.isPending;
  const isRegistrationFlow = !organizationSelection && authStep !== 'login';
  const pageClassName = isRegistrationFlow
    ? `login-page register-page ${authStep === 'register' ? 'patient-register-page' : 'organization-register-page'}`
    : 'login-page';
  const formPanelClassName = isRegistrationFlow
    ? 'login-form-panel register-form-panel'
    : 'login-form-panel';
  const heroClassName = isRegistrationFlow ? 'login-hero register-hero' : 'login-hero';
  const heroContentClassName = isRegistrationFlow
    ? 'login-hero__content register-hero__content'
    : 'login-hero__content';
  const cardClassName =
    authStep === 'login' && !organizationSelection
      ? 'login-card'
      : authStep === 'register'
        ? 'login-card register-card auth-flow-card auth-flow-card--register'
        : 'login-card auth-flow-card';

  return (
    <main className={pageClassName}>
      <section className={heroClassName} aria-label="Informacije o prijavi">
        <div className={heroContentClassName}>
          <AuthBrandLogo />
          <h1>
            {isRegistrationFlow
              ? 'Otvorite pacijentski račun jednostavno i sigurno'
              : 'Siguran pristup vašim zdravstvenim podacima'}
          </h1>
          <p className="login-hero__lead">
            {isRegistrationFlow
              ? 'Registrirajte se kako biste upravljali terminima, pratili obavijesti i imali pregled osnovnih zdravstvenih podataka na jednom mjestu.'
              : 'Prijavite se kako biste brzo pregledali termine, nalaze, obavijesti i podatke o svom računu na jednom mjestu.'}
          </p>

          <div className="login-feature-list" aria-label="Prednosti prijave">
            <div className="login-feature">
              <span className="login-feature__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img">
                  <path d="M12 12.2a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Z" />
                  <path d="M4.8 20.2a7.2 7.2 0 0 1 14.4 0" />
                </svg>
              </span>
              <p>
                {isRegistrationFlow
                  ? 'Jednostavna registracija u nekoliko koraka'
                  : 'Brza prijava za pacijente i osoblje'}
              </p>
            </div>

            <div className="login-feature">
              <span className="login-feature__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img">
                  <path d="M12 3.4 18 6v4.4c0 4.2-2.4 7.9-6 9.6-3.6-1.7-6-5.4-6-9.6V6l6-2.6Z" />
                  <path d="M12 9.2v4.2" />
                  <path d="M10.3 11h3.4" />
                </svg>
              </span>
              <p>
                {isRegistrationFlow
                  ? 'Jasna forma prilagođena svakodnevnoj upotrebi'
                  : 'Zaštićen pristup podacima i terminima'}
              </p>
            </div>

            <div className="login-feature">
              <span className="login-feature__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img">
                  <path d="M7 3.8h8.1L19 7.7v12.5H7V3.8Z" />
                  <path d="M15 3.8v4h4" />
                  <path d="M10 12h6" />
                  <path d="M10 15.4h6" />
                </svg>
              </span>
              <p>
                {isRegistrationFlow
                  ? 'Hitni kontakt odmah povezan s računom'
                  : 'Sve važne informacije na jednom mjestu'}
              </p>
            </div>
          </div>
        </div>

        <div className="medical-illustration" aria-hidden="true">
          <span className="plus plus--large" />
          <span className="plus plus--small" />
          <span className="dot-grid" />
          <span className="orbit orbit--one" />
          <span className="orbit orbit--two" />
          <div className="plant plant--left">
            <span />
            <span />
            <span />
          </div>
          <div className="plant plant--right">
            <span />
            <span />
            <span />
          </div>
          <div className="tablet-card">
            <div className="tablet-card__calendar">
              <svg viewBox="0 0 24 24" role="img">
                <path d="M6 4.8h12a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6.8a2 2 0 0 1 2-2Z" />
                <path d="M4 9h16" />
                <path d="M8 3v4" />
                <path d="M16 3v4" />
                <path d="M8 12h2" />
                <path d="M12 12h2" />
                <path d="M16 12h2" />
                <path d="M8 16h2" />
                <path d="M12 16h2" />
              </svg>
            </div>
            <span className="tablet-card__line tablet-card__line--short" />
            <span className="tablet-card__line tablet-card__line--long" />
            <div className="health-card">
              <span className="health-card__badge">
                <svg viewBox="0 0 24 24" role="img">
                  <path d="M20.5 8.7c0 5.1-8.5 10.2-8.5 10.2S3.5 13.8 3.5 8.7A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 8.5 1.7Z" />
                  <path d="M6.8 12.4h3l1.4-3.1 2.4 5.7 1.3-2.6h2.4" />
                </svg>
              </span>
              <span className="health-card__pulse" />
              <span className="health-card__bar health-card__bar--wide" />
              <span className="health-card__bar" />
            </div>
          </div>
          <div className="profile-card">
            <span className="profile-card__avatar" />
            <span className="profile-card__line profile-card__line--one" />
            <span className="profile-card__line profile-card__line--two" />
            <span className="profile-card__line profile-card__line--three" />
            <span className="profile-card__line profile-card__line--four" />
            <span className="profile-card__pill" />
            <span className="profile-card__pill profile-card__pill--wide" />
          </div>
          <div className="shield-card">
            <svg viewBox="0 0 24 24" role="img">
              <path d="M12 2.8 20 6v5.8c0 4.8-3.2 8.6-8 9.9-4.8-1.3-8-5.1-8-9.9V6l8-3.2Z" />
              <path d="M8.7 12h6.6v5H8.7v-5Z" />
              <path d="M10 12V9.8a2 2 0 1 1 4 0V12" />
            </svg>
          </div>
        </div>
      </section>

      <section className={formPanelClassName} aria-label="Prijava">
        <div className={cardClassName}>
          <div className="auth-step" key={organizationSelection ? 'loginOrganization' : authStep}>
            {organizationSelection ? (
              <>
                <p className="login-card__eyebrow">Odabir ustanove</p>
                <h2>Nastavite prijavu</h2>
                <p className="login-card__subtitle">
                  Vaš račun je povezan s više ustanova. Odaberite onu u kojoj želite nastaviti.
                </p>

                {selectOrganizationMutation.error ? (
                  <div className="form-banner" role="alert" aria-live="assertive">
                    {selectOrganizationMutation.error.message}
                  </div>
                ) : null}

                <div className="organization-list" role="group" aria-label="Odabir organizacije">
                  {organizationSelection.memberships.map((membership) => (
                    <button
                      className="organization-card organization-card--compact"
                      type="button"
                      key={membership.orgUserId}
                      disabled={isSelecting}
                      onClick={() => void onSelectOrganization(membership.organizationId)}
                    >
                      <OrganizationCardIcon />
                      <span className="organization-card__body">
                        <strong>{membership.organizationName}</strong>
                        <span>{membership.role}</span>
                      </span>
                      <span className="organization-card__action">
                        {isSelecting && selectedOrganizationId === membership.organizationId
                          ? 'Odabir...'
                          : 'Odaberi'}
                        <ChevronIcon />
                      </span>
                    </button>
                  ))}
                </div>

                <p className="login-footer register-footer">
                  Pogrešan račun?
                  <button type="button" onClick={returnToLogin}>
                    Natrag na prijavu
                  </button>
                  <span aria-hidden="true">→</span>
                </p>
              </>
            ) : null}

            {authStep === 'login' && !organizationSelection ? (
              <>
                <p className="login-card__eyebrow">Dobro došli natrag</p>
                <h2>Prijava</h2>
                <p className="login-card__subtitle">
                  Unesite svoje podatke za nastavak korištenja sustava.
                </p>

                {locationState?.registrationSuccess ? (
                  <div className="form-success" role="status" aria-live="polite">
                    Račun je uspješno izrađen. Prijavite se podacima za{' '}
                    <strong>{locationState.registeredEmail ?? 'novi račun'}</strong>.
                  </div>
                ) : null}

                {loginMutation.error ? (
                  <div className="form-banner" role="alert" aria-live="assertive">
                    {loginMutation.error.message}
                  </div>
                ) : null}

                <form className="login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                  <div className="login-field">
                    <label htmlFor="identifier">E-mail ili telefon</label>
                    <div className="login-input-shell">
                      <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                        <path d="M4.8 6.5h14.4c.8 0 1.5.7 1.5 1.5v8c0 .8-.7 1.5-1.5 1.5H4.8c-.8 0-1.5-.7-1.5-1.5V8c0-.8.7-1.5 1.5-1.5Z" />
                        <path d="m4 8 8 5.4L20 8" />
                      </svg>
                      <input
                        id="identifier"
                        type="text"
                        autoComplete="username"
                        inputMode="email"
                        aria-invalid={errors.identifier ? 'true' : 'false'}
                        {...register('identifier')}
                      />
                    </div>
                    {errors.identifier ? (
                      <p className="field-error" role="alert">
                        {errors.identifier.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="login-field">
                    <label htmlFor="password">Lozinka</label>
                    <div className="login-input-shell">
                      <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                        <path d="M7 10.5h10a1.6 1.6 0 0 1 1.6 1.6v6.3A1.6 1.6 0 0 1 17 20H7a1.6 1.6 0 0 1-1.6-1.6v-6.3A1.6 1.6 0 0 1 7 10.5Z" />
                        <path d="M8.8 10.5V8.2a3.2 3.2 0 1 1 6.4 0v2.3" />
                      </svg>
                      <input
                        id="password"
                        type={isPasswordVisible ? 'text' : 'password'}
                        autoComplete="current-password"
                        aria-invalid={errors.password ? 'true' : 'false'}
                        {...register('password')}
                      />
                      <button
                        className="password-toggle"
                        type="button"
                        aria-label={isPasswordVisible ? 'Sakrij lozinku' : 'Prikaži lozinku'}
                        onClick={() => setIsPasswordVisible((isVisible) => !isVisible)}
                      >
                        <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                          <path d="M2.8 12s3.3-5.5 9.2-5.5S21.2 12 21.2 12s-3.3 5.5-9.2 5.5S2.8 12 2.8 12Z" />
                          <path d="M12 14.8a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6Z" />
                        </svg>
                      </button>
                    </div>
                    {errors.password ? (
                      <p className="field-error" role="alert">
                        {errors.password.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="login-options">
                    <label className="remember-control" htmlFor="rememberLogin">
                      <input id="rememberLogin" type="checkbox" defaultChecked />
                      <span aria-hidden="true" />
                      Zapamti me
                    </label>
                    <Link to="/forgot-password">Zaboravili ste lozinku?</Link>
                  </div>

                  <button className="login-submit" type="submit" disabled={isPending}>
                    <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                      <path d="M7 10.5h10a1.6 1.6 0 0 1 1.6 1.6v6.3A1.6 1.6 0 0 1 17 20H7a1.6 1.6 0 0 1-1.6-1.6v-6.3A1.6 1.6 0 0 1 7 10.5Z" />
                      <path d="M8.8 10.5V8.2a3.2 3.2 0 1 1 6.4 0v2.3" />
                    </svg>
                    {isPending ? 'Prijava u tijeku...' : 'Prijavi se'}
                  </button>
                </form>

                <p className="login-footer">
                  Nemate račun?
                  <button type="button" onClick={startRegistration}>
                    Registrirajte se
                  </button>
                  <span aria-hidden="true">→</span>
                </p>
              </>
            ) : null}

            {authStep === 'organizationSelection' ? (
              <>
                <p className="login-card__eyebrow">Novi korisnik</p>
                <h2>Odaberite ustanovu</h2>
                <p className="login-card__subtitle">
                  Za nastavak registracije odaberite zdravstvenu ustanovu u kojoj želite otvoriti
                  pacijentski račun.
                </p>

                {(organizationsQuery.data?.length ?? 0) > 1 ? (
                  <div className="organization-search">
                    <SearchIcon />
                    <label className="sr-only" htmlFor="organizationSearch">
                      Pretražite ustanovu
                    </label>
                    <input
                      id="organizationSearch"
                      type="search"
                      placeholder="Pretražite ustanovu"
                      value={organizationSearch}
                      onChange={(event) => setOrganizationSearch(event.target.value)}
                    />
                  </div>
                ) : null}

                {organizationsQuery.isLoading ? (
                  <div className="form-success" role="status">
                    Učitavanje ustanova...
                  </div>
                ) : null}

                {organizationsQuery.error ? (
                  <div className="form-banner" role="alert">
                    {organizationsQuery.error.message}
                  </div>
                ) : null}

                {!organizationsQuery.isLoading && !organizationsQuery.error ? (
                  <div className="organization-list" aria-label="Dostupne ustanove">
                    {filteredOrganizations.map((organization) => (
                      <button
                        className="organization-card"
                        type="button"
                        key={organization.id}
                        onClick={() => selectRegistrationOrganization(organization)}
                      >
                        <OrganizationCardIcon />
                        <span className="organization-card__body">
                          <strong>{organization.name}</strong>
                          {organization.city || organization.address ? (
                            <span>
                              {[organization.city, organization.address]
                                .filter(Boolean)
                                .join(' · ')}
                            </span>
                          ) : null}
                          {organization.phone ? <small>{organization.phone}</small> : null}
                        </span>
                        <span className="organization-card__action">
                          Odaberi
                          <ChevronIcon />
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}

                {!organizationsQuery.isLoading &&
                !organizationsQuery.error &&
                filteredOrganizations.length === 0 ? (
                  <div className="form-banner" role="status">
                    Nema ustanova koje odgovaraju pretrazi.
                  </div>
                ) : null}

                <p className="login-footer register-footer">
                  Već imate račun?
                  <button type="button" onClick={returnToLogin}>
                    Prijavite se
                  </button>
                  <span aria-hidden="true">→</span>
                </p>
              </>
            ) : null}

            {authStep === 'register' && selectedRegistrationOrganization ? (
              <>
                <p className="login-card__eyebrow">Novi korisnik</p>
                <h2>Registracija pacijenta</h2>
                <p className="login-card__subtitle">
                  Ispunite osnovne podatke za izradu korisničkog računa.
                </p>

                <PatientRegistrationForm
                  selectedOrganization={selectedRegistrationOrganization}
                  onChangeOrganization={() => setAuthStep('organizationSelection')}
                  onRegistrationSuccess={handleRegistrationSuccess}
                  showSelectedOrganizationSummary={false}
                  footer={
                    <p className="login-footer register-footer">
                      Već imate račun?
                      <button type="button" onClick={returnToLogin}>
                        Prijavite se
                      </button>
                      <span aria-hidden="true">→</span>
                    </p>
                  }
                />
              </>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
