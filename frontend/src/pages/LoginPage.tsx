import { zodResolver } from '@hookform/resolvers/zod'
import type { LoginRequestDto } from '@zdravstvo/contracts'
import { loginRequestSchema } from '@zdravstvo/contracts'
import type { ReactElement } from 'react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useLoginMutation } from '@/hooks'
import { useAuthStore } from '@/state'

interface LocationState {
  from?: {
    pathname?: string
  }
}

const resolveRedirectPath = (state: LocationState | null | undefined): string => {
  const redirectPath = state?.from?.pathname

  return redirectPath && redirectPath !== '/login' ? redirectPath : '/'
}

export function LoginPage(): ReactElement {
  const navigate = useNavigate()
  const location = useLocation()
  const token = useAuthStore((state) => state.token)
  const loginMutation = useLoginMutation()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequestDto>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: {
      emailOrPhone: '',
      password: '',
    },
  })

  useEffect(() => {
    if (!token) {
      return
    }

    navigate(resolveRedirectPath(location.state as LocationState | null), {
      replace: true,
    })
  }, [location.state, navigate, token])

  const onSubmit = async (values: LoginRequestDto): Promise<void> => {
    await loginMutation.mutateAsync(values)

    navigate(resolveRedirectPath(location.state as LocationState | null), {
      replace: true,
    })
  }

  const isPending = loginMutation.isPending || isSubmitting

  return (
    <main className="auth-layout">
      <section className="auth-panel auth-panel--brand" aria-hidden="true">
        <p className="eyebrow">zdravstvo</p>
        <h1>Prijava za siguran pristup zdravstvu.</h1>
        <p>
          Prijavite se e-mail adresom ili brojem telefona kako biste nastavili
          s pregledom termina i podataka o racunu.
        </p>
        <div className="auth-feature-list">
          <p>Jednostavna prijava za pacijente i osoblje.</p>
          <p>Organizacijski kontekst i uloge preuzimaju se automatski.</p>
          <p>Sesija ostaje sacuvana na ovom uredaju dok se ne odjavite.</p>
        </div>
      </section>

      <section className="auth-panel auth-panel--form">
        <div className="auth-card">
          <p className="eyebrow">Dobrodosli natrag</p>
          <h2>Prijava</h2>
          <p className="auth-subtitle">
            Unesite svoje podatke za prijavu kako biste nastavili.
          </p>

          {loginMutation.error ? (
            <div className="form-banner" role="alert" aria-live="assertive">
              {loginMutation.error.message}
            </div>
          ) : null}

          <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form-field">
              <label htmlFor="emailOrPhone">E-mail ili telefon</label>
              <input
                id="emailOrPhone"
                type="text"
                autoComplete="username"
                inputMode="email"
                aria-invalid={errors.emailOrPhone ? 'true' : 'false'}
                {...register('emailOrPhone')}
              />
              {errors.emailOrPhone ? (
                <p className="field-error" role="alert">
                  {errors.emailOrPhone.message}
                </p>
              ) : null}
            </div>

            <div className="form-field">
              <label htmlFor="password">Lozinka</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={errors.password ? 'true' : 'false'}
                {...register('password')}
              />
              {errors.password ? (
                <p className="field-error" role="alert">
                  {errors.password.message}
                </p>
              ) : null}
            </div>

            <button className="submit-button" type="submit" disabled={isPending}>
              {isPending ? 'Prijava u tijeku...' : 'Prijavi se'}
            </button>
          </form>

          <p className="auth-footer">
            Potrebna vam je pomoc? Obratite se administratoru ustanove ili se
            vratite na <Link to="/">pocetnu stranicu</Link>.
          </p>
        </div>
      </section>
    </main>
  )
}
