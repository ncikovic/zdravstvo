import { zodResolver } from '@hookform/resolvers/zod'
import type { RegisterRequestDto } from '@zdravstvo/contracts'
import { registerRequestSchema } from '@zdravstvo/contracts'
import type { ReactElement } from 'react'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { useRegisterMutation } from '@/hooks'

const BASIC_PHONE_PATTERN = /^[+\d\s()./-]{6,}$/

const registerFormSchema = registerRequestSchema
  .extend({
    phone: z
      .string()
      .trim()
      .min(6, 'Unesite broj telefona.')
      .regex(BASIC_PHONE_PATTERN, 'Unesite ispravan broj telefona.'),
    confirmPassword: z.string().min(8, 'Potvrdite lozinku.'),
    oib: z
      .string()
      .trim()
      .regex(/^\d{11}$/, 'OIB mora imati 11 znamenki.')
      .nullable()
      .optional()
      .or(z.literal('')),
    emergencyContactPhone: z
      .string()
      .trim()
      .regex(BASIC_PHONE_PATTERN, 'Unesite ispravan broj kontakta.')
      .nullable()
      .optional()
      .or(z.literal('')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Lozinke se moraju podudarati.',
  })

type RegisterFormValues = z.infer<typeof registerFormSchema>

const toNullable = (value: string | null | undefined): string | null => {
  if (!value) {
    return null
  }

  const trimmedValue = value.trim()

  return trimmedValue.length > 0 ? trimmedValue : null
}

export function RegisterPage(): ReactElement {
  const navigate = useNavigate()
  const registerMutation = useRegisterMutation()
  const defaultValues = useMemo<RegisterFormValues>(
    () => ({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      dateOfBirth: null,
      oib: '',
      address: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
    }),
    [],
  )
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues,
  })

  const onSubmit = async (values: RegisterFormValues): Promise<void> => {
    const payload: RegisterRequestDto = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim().toLowerCase(),
      phone: values.phone.trim(),
      password: values.password,
      dateOfBirth: toNullable(values.dateOfBirth),
      oib: toNullable(values.oib),
      address: toNullable(values.address),
      emergencyContactName: toNullable(values.emergencyContactName),
      emergencyContactPhone: toNullable(values.emergencyContactPhone),
    }

    await registerMutation.mutateAsync(payload)

    navigate('/login', {
      replace: true,
      state: {
        registrationSuccess: true,
        registeredEmail: payload.email,
      },
    })
  }

  const isPending = registerMutation.isPending || isSubmitting

  return (
    <main className="auth-layout">
      <section className="auth-panel auth-panel--brand" aria-hidden="true">
        <p className="eyebrow">zdravstvo</p>
        <h1>Otvorite pacijentski racun u nekoliko koraka.</h1>
        <p>
          Izradite vlastiti pristup za termine, obavijesti i pregled osnovnih
          zdravstvenih podataka u sigurnom okruzenju klinike.
        </p>
        <div className="auth-feature-list">
          <p>Jednostavna samoregistracija za nove pacijente.</p>
          <p>Jasna i pregledna forma prilagodena svakodnevnoj upotrebi.</p>
          <p>Podaci za hitni kontakt ostaju odmah povezani s racunom.</p>
        </div>
      </section>

      <section className="auth-panel auth-panel--form auth-panel--form-wide">
        <div className="auth-card auth-card--wide">
          <p className="eyebrow">Novi korisnik</p>
          <h2>Registracija pacijenta</h2>
          <p className="auth-subtitle">
            Ispunite osnovne podatke kako biste izradili svoj korisnicki racun.
          </p>

          {registerMutation.error ? (
            <div className="form-banner" role="alert" aria-live="assertive">
              {registerMutation.error.message}
            </div>
          ) : null}

          <form className="auth-form auth-form--wide" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="auth-grid">
              <div className="form-field">
                <label htmlFor="firstName">Ime</label>
                <input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  aria-invalid={errors.firstName ? 'true' : 'false'}
                  {...register('firstName')}
                />
                {errors.firstName ? (
                  <p className="field-error" role="alert">
                    {errors.firstName.message}
                  </p>
                ) : null}
              </div>

              <div className="form-field">
                <label htmlFor="lastName">Prezime</label>
                <input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  aria-invalid={errors.lastName ? 'true' : 'false'}
                  {...register('lastName')}
                />
                {errors.lastName ? (
                  <p className="field-error" role="alert">
                    {errors.lastName.message}
                  </p>
                ) : null}
              </div>

              <div className="form-field">
                <label htmlFor="email">E-mail</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={errors.email ? 'true' : 'false'}
                  {...register('email')}
                />
                {errors.email ? (
                  <p className="field-error" role="alert">
                    {errors.email.message}
                  </p>
                ) : null}
              </div>

              <div className="form-field">
                <label htmlFor="phone">Telefon</label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  aria-invalid={errors.phone ? 'true' : 'false'}
                  {...register('phone')}
                />
                {errors.phone ? (
                  <p className="field-error" role="alert">
                    {errors.phone.message}
                  </p>
                ) : null}
              </div>

              <div className="form-field">
                <label htmlFor="password">Lozinka</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={errors.password ? 'true' : 'false'}
                  {...register('password')}
                />
                {errors.password ? (
                  <p className="field-error" role="alert">
                    {errors.password.message}
                  </p>
                ) : null}
              </div>

              <div className="form-field">
                <label htmlFor="confirmPassword">Potvrdite lozinku</label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword ? (
                  <p className="field-error" role="alert">
                    {errors.confirmPassword.message}
                  </p>
                ) : null}
              </div>

              <div className="form-field">
                <label htmlFor="dateOfBirth">Datum rodenja</label>
                <input
                  id="dateOfBirth"
                  type="date"
                  autoComplete="bday"
                  aria-invalid={errors.dateOfBirth ? 'true' : 'false'}
                  {...register('dateOfBirth')}
                />
                {errors.dateOfBirth ? (
                  <p className="field-error" role="alert">
                    {errors.dateOfBirth.message}
                  </p>
                ) : null}
              </div>

              <div className="form-field">
                <label htmlFor="oib">OIB</label>
                <input
                  id="oib"
                  type="text"
                  inputMode="numeric"
                  aria-invalid={errors.oib ? 'true' : 'false'}
                  {...register('oib')}
                />
                {errors.oib ? (
                  <p className="field-error" role="alert">
                    {errors.oib.message}
                  </p>
                ) : null}
              </div>

              <div className="form-field auth-grid-span-2">
                <label htmlFor="address">Adresa</label>
                <input
                  id="address"
                  type="text"
                  autoComplete="street-address"
                  aria-invalid={errors.address ? 'true' : 'false'}
                  {...register('address')}
                />
                {errors.address ? (
                  <p className="field-error" role="alert">
                    {errors.address.message}
                  </p>
                ) : null}
              </div>

              <div className="form-field">
                <label htmlFor="emergencyContactName">Hitni kontakt</label>
                <input
                  id="emergencyContactName"
                  type="text"
                  autoComplete="name"
                  aria-invalid={errors.emergencyContactName ? 'true' : 'false'}
                  {...register('emergencyContactName')}
                />
                {errors.emergencyContactName ? (
                  <p className="field-error" role="alert">
                    {errors.emergencyContactName.message}
                  </p>
                ) : null}
              </div>

              <div className="form-field">
                <label htmlFor="emergencyContactPhone">Telefon hitnog kontakta</label>
                <input
                  id="emergencyContactPhone"
                  type="tel"
                  autoComplete="tel-national"
                  aria-invalid={errors.emergencyContactPhone ? 'true' : 'false'}
                  {...register('emergencyContactPhone')}
                />
                {errors.emergencyContactPhone ? (
                  <p className="field-error" role="alert">
                    {errors.emergencyContactPhone.message}
                  </p>
                ) : null}
              </div>
            </div>

            <button className="submit-button" type="submit" disabled={isPending}>
              {isPending ? 'Izrada racuna u tijeku...' : 'Izradi racun'}
            </button>
          </form>

          <p className="auth-footer">
            Vec imate korisnicki racun? <Link to="/login">Vratite se na prijavu</Link>.
          </p>
        </div>
      </section>
    </main>
  )
}
