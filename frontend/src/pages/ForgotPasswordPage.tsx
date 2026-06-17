import { zodResolver } from '@hookform/resolvers/zod';
import type { ForgotPasswordRequestDto } from '@zdravstvo/contracts';
import { forgotPasswordRequestSchema } from '@zdravstvo/contracts';
import type { ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import type { z } from 'zod';

import { AuthBrandLogo } from '@/components';
import { useForgotPasswordMutation } from '@/hooks';

type ForgotPasswordFormValues = z.input<typeof forgotPasswordRequestSchema>;

const ShieldIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
    <path d="M12 2.8 20 6v5.8c0 4.8-3.2 8.6-8 9.9-4.8-1.3-8-5.1-8-9.9V6l8-3.2Z" />
    <path d="M10 12.2h4" />
    <path d="M12 10.2v4" />
  </svg>
);

const EnvelopeIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
    <path d="M4.8 6.5h14.4c.8 0 1.5.7 1.5 1.5v8c0 .8-.7 1.5-1.5 1.5H4.8c-.8 0-1.5-.7-1.5-1.5V8c0-.8.7-1.5 1.5-1.5Z" />
    <path d="m4 8 8 5.4L20 8" />
  </svg>
);

const UserCheckIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
    <path d="M11 12.2a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Z" />
    <path d="M4.2 20.2a6.8 6.8 0 0 1 10.6-5.6" />
    <path d="m15.8 18.1 1.7 1.7 3.4-4" />
  </svg>
);

const UserIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
    <path d="M12 12.2a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Z" />
    <path d="M4.8 20.2a7.2 7.2 0 0 1 14.4 0" />
  </svg>
);

const SendIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
    <path d="m21 3-9.7 18-2.1-8.2L3 10.6 21 3Z" />
    <path d="m9.2 12.8 4.8-4.8" />
  </svg>
);

const ArrowLeftIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const InfoIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
    <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
    <path d="M12 11.5v5" />
    <path d="M12 7.8h.01" />
  </svg>
);

export function ForgotPasswordPage(): ReactElement {
  const forgotPasswordMutation = useForgotPasswordMutation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues, unknown, ForgotPasswordRequestDto>({
    resolver: zodResolver(forgotPasswordRequestSchema),
    defaultValues: {
      identifier: '',
    },
  });
  const isPending = forgotPasswordMutation.isPending || isSubmitting;

  const onSubmit = async (values: ForgotPasswordRequestDto): Promise<void> => {
    await forgotPasswordMutation.mutateAsync({
      identifier: values.identifier.trim(),
    });
  };

  return (
    <main className="forgot-page">
      <section className="forgot-hero" aria-label="Sigurnost oporavka lozinke">
        <AuthBrandLogo />
        <div className="forgot-hero__content">
          <h1>Vaša sigurnost nam je prioritet</h1>
          <p>
            Pomoći ćemo vam sigurno vratiti pristup vašem korisničkom računu.
          </p>

          <div className="forgot-feature-list" aria-label="Prednosti oporavka lozinke">
            <article className="forgot-feature">
              <span className="forgot-feature__icon forgot-feature__icon--shield">
                <ShieldIcon />
              </span>
              <div>
                <h2>Siguran postupak</h2>
                <p>Reset lozinke provodi se putem sigurnih i provjerenih kanala.</p>
              </div>
            </article>

            <article className="forgot-feature">
              <span className="forgot-feature__icon">
                <EnvelopeIcon />
              </span>
              <div>
                <h2>Brza dostava uputa</h2>
                <p>Upute za postavljanje nove lozinke šaljemo odmah na vaš e-mail ili telefon.</p>
              </div>
            </article>

            <article className="forgot-feature">
              <span className="forgot-feature__icon">
                <UserCheckIcon />
              </span>
              <div>
                <h2>Vi imate kontrolu</h2>
                <p>Samo vi možete postaviti novu lozinku i ponovno preuzeti kontrolu nad računom.</p>
              </div>
            </article>
          </div>
        </div>

        <div className="forgot-hospital" aria-hidden="true">
          <span className="forgot-cloud forgot-cloud--one" />
          <span className="forgot-cloud forgot-cloud--two" />
          <span className="forgot-cloud forgot-cloud--three" />
          <div className="forgot-shield">
            <span />
          </div>
          <div className="forgot-building forgot-building--main">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="forgot-building forgot-building--side">
            <span />
            <span />
            <span />
            <span />
          </div>
          <span className="forgot-tree forgot-tree--one" />
          <span className="forgot-tree forgot-tree--two" />
        </div>
      </section>

      <section className="forgot-form-panel" aria-label="Zaboravljena lozinka">
        <div className="forgot-card">
          <p className="forgot-card__eyebrow">Pomoć pri prijavi</p>
          <h2>Zaboravljena lozinka</h2>
          <p className="forgot-card__subtitle">
            Unesite e-mail adresu ili broj telefona povezan s vašim računom kako bismo vam poslali
            upute za reset lozinke.
          </p>

          {forgotPasswordMutation.isSuccess ? (
            <div className="form-success" role="status" aria-live="polite">
              Ako račun postoji, upute za reset lozinke poslane su na uneseni kontakt.
            </div>
          ) : null}

          {forgotPasswordMutation.error ? (
            <div className="form-banner" role="alert" aria-live="assertive">
              {forgotPasswordMutation.error.message}
            </div>
          ) : null}

          <form className="forgot-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="login-field">
              <label htmlFor="identifier">E-mail ili telefon</label>
              <div className="forgot-input-shell">
                <input
                  id="identifier"
                  type="text"
                  inputMode="email"
                  autoComplete="username"
                  placeholder="npr. ime.prezime@email.hr ili 091 123 4567"
                  aria-invalid={errors.identifier ? 'true' : 'false'}
                  {...register('identifier')}
                />
                <UserIcon />
              </div>
              {errors.identifier ? (
                <p className="field-error" role="alert">
                  {errors.identifier.message}
                </p>
              ) : null}
            </div>

            <button className="login-submit forgot-submit" type="submit" disabled={isPending}>
              <SendIcon />
              {isPending ? 'Slanje uputa...' : 'Pošalji upute'}
            </button>
          </form>

          <div className="forgot-divider" />

          <Link className="forgot-back-link" to="/login">
            <ArrowLeftIcon />
            Natrag na prijavu
          </Link>

          <aside className="forgot-note">
            <InfoIcon />
            <p>
              Ako koristite e-mail, poruka s uputama može se nalaziti u mapi{' '}
              <strong>Neželjena pošta</strong> ili <strong>Promocije</strong>.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
