import type { ReactElement } from 'react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { APP_ROUTES } from '@/app/routes';
import {
  PublicStatusIcon,
  PublicStatusLayout,
  StatusCardIllustration,
  type PublicStatusFeature,
} from '@/components';

interface ConfirmEmailLocationState {
  email?: string;
  registeredEmail?: string;
}

const confirmEmailFeatures: PublicStatusFeature[] = [
  {
    icon: 'mail',
    title: 'Brza aktivacija',
    text: 'Otvorite poruku i kliknite poveznicu za potvrdu računa.',
  },
  {
    icon: 'shield',
    title: 'Siguran račun',
    text: 'Potvrda e-mail adrese pomaže zaštititi vaš korisnički profil.',
  },
  {
    icon: 'calendar',
    title: 'Pristup terminima',
    text: 'Nakon potvrde možete upravljati terminima i podacima.',
  },
];

const fallbackEmail = 'ana.maric@email.hr';

const resolveEmail = (search: string, state: ConfirmEmailLocationState | null): string => {
  const emailFromQuery = new URLSearchParams(search).get('email');

  return state?.registeredEmail ?? state?.email ?? emailFromQuery ?? fallbackEmail;
};

export function ConfirmEmailPage(): ReactElement {
  const location = useLocation();
  const [hasResentEmail, setHasResentEmail] = useState(false);
  const locationState = location.state as ConfirmEmailLocationState | null;
  const email = resolveEmail(location.search, locationState);

  return (
    <PublicStatusLayout
      variant="email"
      heroTitle="Potvrdite svoju e-mail adresu"
      heroLead="Poslali smo vam poruku za aktivaciju računa. Nakon potvrde moći ćete dovršiti prijavu i pristupiti svom računu."
      features={confirmEmailFeatures}
      cardAriaLabel="Potvrda računa"
    >
      <p className="public-status-card__eyebrow">Potvrda računa</p>
      <h2>Provjerite svoju e-mail adresu</h2>
      <p className="public-status-card__subtitle">
        Poslali smo poveznicu za potvrdu računa. Otvorite e-mail i kliknite na poveznicu kako biste
        aktivirali svoj račun.
      </p>

      <StatusCardIllustration variant="email" />

      <div className="public-status-email-box">
        <PublicStatusIcon name="mail" />
        <span>E-mail poslan na:</span>
        <strong>{email}</strong>
      </div>

      {hasResentEmail ? (
        <p className="public-status-inline-success" role="status" aria-live="polite">
          E-mail za potvrdu je ponovno označen za slanje.
        </p>
      ) : null}

      <div className="public-status-actions public-status-actions--compact">
        <button
          className="public-status-button public-status-button--primary"
          type="button"
          onClick={() => setHasResentEmail(true)}
        >
          <PublicStatusIcon name="refresh" />
          Ponovno pošalji e-mail
        </button>

        <Link className="public-status-text-link" to={APP_ROUTES.register}>
          Promijeni e-mail adresu
        </Link>

        <div className="public-status-divider">
          <span>ili</span>
        </div>

        <Link className="public-status-link" to={APP_ROUTES.login}>
          <PublicStatusIcon name="arrow-left" />
          Natrag na prijavu
        </Link>
      </div>
    </PublicStatusLayout>
  );
}
