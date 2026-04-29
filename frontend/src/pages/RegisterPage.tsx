import type { ReactElement } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { APP_ROUTES } from '@/app/routes';
import { AuthBrandLogo, FieldIcon, PatientRegistrationForm } from '@/components';

const MedicalIllustration = (): ReactElement => (
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
        <FieldIcon name="calendar" />
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
);

export function RegisterPage(): ReactElement {
  const navigate = useNavigate();

  const handleRegistrationSuccess = (registeredEmail: string): void => {
    navigate(APP_ROUTES.accountCreated, {
      replace: true,
      state: {
        registeredEmail,
      },
    });
  };

  return (
    <main className="login-page register-page">
      <section className="login-hero register-hero" aria-label="Informacije o registraciji">
        <div className="login-hero__content register-hero__content">
          <AuthBrandLogo />
          <h1>Otvorite pacijentski račun jednostavno i sigurno</h1>
          <p className="login-hero__lead">
            Registrirajte se kako biste upravljali terminima, pratili obavijesti i imali pregled
            osnovnih zdravstvenih podataka na jednom mjestu.
          </p>

          <div
            className="login-feature-list register-feature-list"
            aria-label="Prednosti registracije"
          >
            <div className="login-feature register-feature">
              <span className="login-feature__icon" aria-hidden="true">
                <FieldIcon name="user" />
              </span>
              <p>Jednostavna registracija u nekoliko koraka</p>
            </div>

            <div className="login-feature register-feature">
              <span className="login-feature__icon" aria-hidden="true">
                <FieldIcon name="document" />
              </span>
              <p>Jasna forma prilagođena svakodnevnoj upotrebi</p>
            </div>

            <div className="login-feature register-feature">
              <span className="login-feature__icon" aria-hidden="true">
                <FieldIcon name="phone" />
              </span>
              <p>Hitni kontakt odmah povezan s računom</p>
            </div>
          </div>
        </div>

        <MedicalIllustration />
      </section>

      <section className="login-form-panel register-form-panel" aria-label="Registracija pacijenta">
        <div className="login-card register-card">
          <p className="login-card__eyebrow">Novi korisnik</p>
          <h2>Registracija pacijenta</h2>
          <p className="login-card__subtitle">
            Ispunite osnovne podatke za izradu korisničkog računa.
          </p>

          <PatientRegistrationForm
            onRegistrationSuccess={handleRegistrationSuccess}
            footer={
              <p className="login-footer register-footer">
                Već imate račun? <Link to={APP_ROUTES.login}>Prijavite se</Link>
                <span aria-hidden="true">→</span>
              </p>
            }
          />
        </div>
      </section>
    </main>
  );
}
