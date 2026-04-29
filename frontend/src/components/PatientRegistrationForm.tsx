import { zodResolver } from '@hookform/resolvers/zod';
import type { RegisterRequestDto } from '@zdravstvo/contracts';
import { registerRequestSchema } from '@zdravstvo/contracts';
import type { ReactElement, ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useRegisterMutation } from '@/hooks';
import type { Organization } from '@/types';

const BASIC_PHONE_PATTERN = /^[+\d\s()./-]{6,}$/;

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
  });

type RegisterFormValues = z.infer<typeof registerFormSchema>;
type IconName = 'user' | 'mail' | 'phone' | 'lock' | 'calendar' | 'pin' | 'document';

interface PatientRegistrationFormProps {
  selectedOrganization?: Organization | null;
  onChangeOrganization?: () => void;
  onRegistrationSuccess: (registeredEmail: string) => void;
  footer?: ReactNode;
}

export const FieldIcon = ({ name }: { name: IconName }): ReactElement => {
  const icons: Record<IconName, ReactElement> = {
    user: (
      <>
        <path d="M12 12.2a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Z" />
        <path d="M4.8 20.2a7.2 7.2 0 0 1 14.4 0" />
      </>
    ),
    mail: (
      <>
        <path d="M4.8 6.5h14.4c.8 0 1.5.7 1.5 1.5v8c0 .8-.7 1.5-1.5 1.5H4.8c-.8 0-1.5-.7-1.5-1.5V8c0-.8.7-1.5 1.5-1.5Z" />
        <path d="m4 8 8 5.4L20 8" />
      </>
    ),
    phone: (
      <>
        <path d="M8.4 4.5 6.2 6.7c-.9.9-.5 3.8 2.7 7s6.1 3.6 7 2.7l2.2-2.2-3.2-3.2-1.7 1.7c-.9-.5-1.7-1.1-2.4-1.8s-1.3-1.5-1.8-2.4l1.7-1.7-3.3-3.3Z" />
      </>
    ),
    lock: (
      <>
        <path d="M7 10.5h10a1.6 1.6 0 0 1 1.6 1.6v6.3A1.6 1.6 0 0 1 17 20H7a1.6 1.6 0 0 1-1.6-1.6v-6.3A1.6 1.6 0 0 1 7 10.5Z" />
        <path d="M8.8 10.5V8.2a3.2 3.2 0 1 1 6.4 0v2.3" />
      </>
    ),
    calendar: (
      <>
        <path d="M6 4.8h12a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6.8a2 2 0 0 1 2-2Z" />
        <path d="M4 9h16" />
        <path d="M8 3v4" />
        <path d="M16 3v4" />
      </>
    ),
    pin: (
      <>
        <path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z" />
        <path d="M12 12.1a2.1 2.1 0 1 0 0-4.2 2.1 2.1 0 0 0 0 4.2Z" />
      </>
    ),
    document: (
      <>
        <path d="M7 3.8h8.1L19 7.7v12.5H7V3.8Z" />
        <path d="M15 3.8v4h4" />
        <path d="M10 12h6" />
        <path d="M10 15.4h6" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
      {icons[name]}
    </svg>
  );
};

const EyeIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
    <path d="M2.8 12s3.3-5.5 9.2-5.5S21.2 12 21.2 12s-3.3 5.5-9.2 5.5S2.8 12 2.8 12Z" />
    <path d="M12 14.8a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6Z" />
  </svg>
);

const toNullable = (value: string | null | undefined): string | null => {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
};

export function PatientRegistrationForm({
  selectedOrganization,
  onChangeOrganization,
  onRegistrationSuccess,
  footer,
}: PatientRegistrationFormProps): ReactElement {
  const registerMutation = useRegisterMutation();
  const [visiblePasswords, setVisiblePasswords] = useState({
    password: false,
    confirmPassword: false,
  });
  const defaultValues = useMemo<RegisterFormValues>(
    () => ({
      organizationId: selectedOrganization?.id,
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
    [selectedOrganization?.id],
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues,
  });

  const onSubmit = async (values: RegisterFormValues): Promise<void> => {
    const payload: RegisterRequestDto = {
      organizationId: selectedOrganization?.id,
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
    };

    await registerMutation.mutateAsync(payload);

    onRegistrationSuccess(payload.email);
  };

  const isPending = registerMutation.isPending || isSubmitting;
  const togglePasswordVisibility = (field: 'password' | 'confirmPassword'): void => {
    setVisiblePasswords((current) => ({
      ...current,
      [field]: !current[field],
    }));
  };

  return (
    <>
      {selectedOrganization ? (
        <section className="selected-organization" aria-label="Odabrana ustanova">
          <div>
            <span>Odabrana ustanova</span>
            <strong>{selectedOrganization.name}</strong>
            {selectedOrganization.city || selectedOrganization.address ? (
              <p>
                {[selectedOrganization.city, selectedOrganization.address]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            ) : null}
          </div>
          {onChangeOrganization ? (
            <button type="button" onClick={onChangeOrganization}>
              Promijeni
            </button>
          ) : null}
        </section>
      ) : null}

      {registerMutation.error ? (
        <div className="form-banner" role="alert" aria-live="assertive">
          {registerMutation.error.message}
        </div>
      ) : null}

      <form className="register-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="register-grid">
          <div className="login-field">
            <label htmlFor="firstName">Ime</label>
            <div className="login-input-shell">
              <FieldIcon name="user" />
              <input
                id="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="Ana"
                aria-invalid={errors.firstName ? 'true' : 'false'}
                {...register('firstName')}
              />
            </div>
            {errors.firstName ? (
              <p className="field-error" role="alert">
                {errors.firstName.message}
              </p>
            ) : null}
          </div>

          <div className="login-field">
            <label htmlFor="lastName">Prezime</label>
            <div className="login-input-shell">
              <FieldIcon name="user" />
              <input
                id="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Marić"
                aria-invalid={errors.lastName ? 'true' : 'false'}
                {...register('lastName')}
              />
            </div>
            {errors.lastName ? (
              <p className="field-error" role="alert">
                {errors.lastName.message}
              </p>
            ) : null}
          </div>

          <div className="login-field">
            <label htmlFor="email">E-mail</label>
            <div className="login-input-shell">
              <FieldIcon name="mail" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="ana.maric@email.hr"
                aria-invalid={errors.email ? 'true' : 'false'}
                {...register('email')}
              />
            </div>
            {errors.email ? (
              <p className="field-error" role="alert">
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="login-field">
            <label htmlFor="phone">Telefon</label>
            <div className="login-input-shell">
              <FieldIcon name="phone" />
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+385 91 234 5678"
                aria-invalid={errors.phone ? 'true' : 'false'}
                {...register('phone')}
              />
            </div>
            {errors.phone ? (
              <p className="field-error" role="alert">
                {errors.phone.message}
              </p>
            ) : null}
          </div>

          <div className="login-field">
            <label htmlFor="password">Lozinka</label>
            <div className="login-input-shell">
              <FieldIcon name="lock" />
              <input
                id="password"
                type={visiblePasswords.password ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••••••••"
                aria-invalid={errors.password ? 'true' : 'false'}
                {...register('password')}
              />
              <button
                className="password-toggle"
                type="button"
                aria-label={visiblePasswords.password ? 'Sakrij lozinku' : 'Prikaži lozinku'}
                onClick={() => togglePasswordVisibility('password')}
              >
                <EyeIcon />
              </button>
            </div>
            {errors.password ? (
              <p className="field-error" role="alert">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          <div className="login-field">
            <label htmlFor="confirmPassword">Potvrdite lozinku</label>
            <div className="login-input-shell">
              <FieldIcon name="lock" />
              <input
                id="confirmPassword"
                type={visiblePasswords.confirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••••••••"
                aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                {...register('confirmPassword')}
              />
              <button
                className="password-toggle"
                type="button"
                aria-label={visiblePasswords.confirmPassword ? 'Sakrij lozinku' : 'Prikaži lozinku'}
                onClick={() => togglePasswordVisibility('confirmPassword')}
              >
                <EyeIcon />
              </button>
            </div>
            {errors.confirmPassword ? (
              <p className="field-error" role="alert">
                {errors.confirmPassword.message}
              </p>
            ) : null}
          </div>

          <div className="login-field">
            <label htmlFor="dateOfBirth">Datum rođenja</label>
            <div className="login-input-shell">
              <FieldIcon name="calendar" />
              <input
                id="dateOfBirth"
                type="date"
                autoComplete="bday"
                aria-invalid={errors.dateOfBirth ? 'true' : 'false'}
                {...register('dateOfBirth')}
              />
            </div>
            {errors.dateOfBirth ? (
              <p className="field-error" role="alert">
                {errors.dateOfBirth.message}
              </p>
            ) : null}
          </div>

          <div className="login-field">
            <label htmlFor="oib">OIB</label>
            <div className="login-input-shell">
              <FieldIcon name="user" />
              <input
                id="oib"
                type="text"
                inputMode="numeric"
                placeholder="12345678901"
                aria-invalid={errors.oib ? 'true' : 'false'}
                {...register('oib')}
              />
            </div>
            {errors.oib ? (
              <p className="field-error" role="alert">
                {errors.oib.message}
              </p>
            ) : null}
          </div>

          <div className="login-field register-grid-span-2">
            <label htmlFor="address">Adresa</label>
            <div className="login-input-shell">
              <FieldIcon name="pin" />
              <input
                id="address"
                type="text"
                autoComplete="street-address"
                placeholder="Ulica grada Vukovara 12, Zagreb"
                aria-invalid={errors.address ? 'true' : 'false'}
                {...register('address')}
              />
            </div>
            {errors.address ? (
              <p className="field-error" role="alert">
                {errors.address.message}
              </p>
            ) : null}
          </div>

          <div className="login-field">
            <label htmlFor="emergencyContactName">Hitni kontakt</label>
            <div className="login-input-shell">
              <FieldIcon name="user" />
              <input
                id="emergencyContactName"
                type="text"
                autoComplete="name"
                placeholder="Ivan Marić"
                aria-invalid={errors.emergencyContactName ? 'true' : 'false'}
                {...register('emergencyContactName')}
              />
            </div>
            {errors.emergencyContactName ? (
              <p className="field-error" role="alert">
                {errors.emergencyContactName.message}
              </p>
            ) : null}
          </div>

          <div className="login-field">
            <label htmlFor="emergencyContactPhone">Telefon hitnog kontakta</label>
            <div className="login-input-shell">
              <FieldIcon name="phone" />
              <input
                id="emergencyContactPhone"
                type="tel"
                autoComplete="tel-national"
                placeholder="+385 98 765 4321"
                aria-invalid={errors.emergencyContactPhone ? 'true' : 'false'}
                {...register('emergencyContactPhone')}
              />
            </div>
            {errors.emergencyContactPhone ? (
              <p className="field-error" role="alert">
                {errors.emergencyContactPhone.message}
              </p>
            ) : null}
          </div>
        </div>

        <label className="register-terms" htmlFor="acceptTerms">
          <input id="acceptTerms" type="checkbox" defaultChecked />
          <span aria-hidden="true" />
          Prihvaćam <a href="#terms">uvjete korištenja</a> i{' '}
          <a href="#privacy">pravila privatnosti</a>
        </label>

        <button className="login-submit register-submit" type="submit" disabled={isPending}>
          <FieldIcon name="lock" />
          {isPending ? 'Izrada računa u tijeku...' : 'Izradi račun'}
        </button>
      </form>

      {footer}
    </>
  );
}
