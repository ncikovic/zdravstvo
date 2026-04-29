import { zodResolver } from '@hookform/resolvers/zod'
import type {
  LoginOrganizationSelectionRequiredResponseDto,
  LoginRequestDto,
} from '@zdravstvo/contracts'
import { loginRequestSchema } from '@zdravstvo/contracts'
import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { z } from 'zod'

import { useLoginMutation, useSelectOrganizationMutation } from '@/hooks'
import { useAuthStore } from '@/stores'

interface LocationState {
  registrationSuccess?: boolean
  registeredEmail?: string
  from?: {
    pathname?: string
  }
}

const resolveRedirectPath = (state: LocationState | null | undefined): string => {
  const redirectPath = state?.from?.pathname

  return redirectPath && redirectPath !== '/login' ? redirectPath : '/'
}

type LoginFormValues = z.input<typeof loginRequestSchema>

export function LoginPage(): ReactElement {
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const loginMutation = useLoginMutation()
  const selectOrganizationMutation = useSelectOrganizationMutation()
  const locationState = location.state as LocationState | null
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [organizationSelection, setOrganizationSelection] =
    useState<LoginOrganizationSelectionRequiredResponseDto | null>(null)
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(
    null,
  )
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
  })

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    navigate(resolveRedirectPath(locationState), {
      replace: true,
    })
  }, [isAuthenticated, location.state, navigate])

  const onSubmit = async (values: LoginRequestDto): Promise<void> => {
    setOrganizationSelection(null)
    const loginResponse = await loginMutation.mutateAsync(values)

    if (loginResponse.requiresOrganizationSelection) {
      setOrganizationSelection(loginResponse)
      return
    }

    navigate(resolveRedirectPath(locationState), {
      replace: true,
    })
  }

  const onSelectOrganization = async (organizationId: string): Promise<void> => {
    if (!organizationSelection) {
      return
    }

    setSelectedOrganizationId(organizationId)

    await selectOrganizationMutation.mutateAsync({
      selectionToken: organizationSelection.selectionToken,
      organizationId,
    })

    navigate(resolveRedirectPath(locationState), {
      replace: true,
    })
  }

  const isPending = loginMutation.isPending || isSubmitting
  const isSelecting = selectOrganizationMutation.isPending

  return (
    <main className="login-page">
      <section className="login-hero" aria-label="Informacije o prijavi">
        <div className="login-hero__content">
          <p className="login-brand">ZDRAVSTVO</p>
          <h1>Siguran pristup vašim zdravstvenim podacima</h1>
          <p className="login-hero__lead">
            Prijavite se kako biste brzo pregledali termine, nalaze, obavijesti i podatke o svom
            računu na jednom mjestu.
          </p>

          <div className="login-feature-list" aria-label="Prednosti prijave">
            <div className="login-feature">
              <span className="login-feature__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img">
                  <path d="M12 12.2a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Z" />
                  <path d="M4.8 20.2a7.2 7.2 0 0 1 14.4 0" />
                </svg>
              </span>
              <p>Brza prijava za pacijente i osoblje</p>
            </div>

            <div className="login-feature">
              <span className="login-feature__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img">
                  <path d="M12 3.4 18 6v4.4c0 4.2-2.4 7.9-6 9.6-3.6-1.7-6-5.4-6-9.6V6l6-2.6Z" />
                  <path d="M12 9.2v4.2" />
                  <path d="M10.3 11h3.4" />
                </svg>
              </span>
              <p>Zaštićen pristup podacima i terminima</p>
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
              <p>Sve važne informacije na jednom mjestu</p>
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

      <section className="login-form-panel" aria-label="Prijava">
        <div className="login-card">
          <p className="login-card__eyebrow">Dobro došli natrag</p>
          <h2>Prijava</h2>
          <p className="login-card__subtitle">
            Unesite svoje podatke za nastavak korištenja sustava.
          </p>

          {locationState?.registrationSuccess ? (
            <div className="form-success" role="status" aria-live="polite">
              Racun je uspjesno izraden. Prijavite se podacima za{' '}
              <strong>{locationState.registeredEmail ?? 'novi racun'}</strong>.
            </div>
          ) : null}

          {loginMutation.error ? (
            <div className="form-banner" role="alert" aria-live="assertive">
              {loginMutation.error.message}
            </div>
          ) : null}

          {selectOrganizationMutation.error ? (
            <div className="form-banner" role="alert" aria-live="assertive">
              {selectOrganizationMutation.error.message}
            </div>
          ) : null}

          {organizationSelection ? (
            <div className="login-form" role="group" aria-label="Odabir organizacije">
              <div className="form-success" role="status" aria-live="polite">
                Odaberite organizaciju za nastavak prijave.
              </div>

              {organizationSelection.memberships.map((membership) => (
                <button
                  className="login-submit"
                  type="button"
                  key={membership.orgUserId}
                  disabled={isSelecting}
                  onClick={() => void onSelectOrganization(membership.organizationId)}
                >
                  {isSelecting && selectedOrganizationId === membership.organizationId
                    ? 'Odabir u tijeku...'
                    : `${membership.organizationName} - ${membership.role}`}
                </button>
              ))}
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
              <a href="#forgot-password">Zaboravili ste lozinku?</a>
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
            Nemate račun? <Link to="/register">Registrirajte se</Link>
            <span aria-hidden="true">→</span>
          </p>
        </div>
      </section>
    </main>
  )
}
