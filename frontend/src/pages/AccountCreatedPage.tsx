import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';

import {
  PublicStatusIcon,
  PublicStatusLayout,
  StatusCardIllustration,
  type PublicStatusFeature,
} from '@/components';
import { APP_ROUTES } from '@/app/routes';

const accountCreatedFeatures: PublicStatusFeature[] = [
  {
    icon: 'user',
    title: 'Brza prijava',
    text: 'Odmah nastavite na prijavu i pristupite svom računu.',
  },
  {
    icon: 'calendar',
    title: 'Pregled termina',
    text: 'Nakon prijave možete pregledavati i rezervirati termine.',
  },
  {
    icon: 'shield',
    title: 'Siguran pristup',
    text: 'Vaši podaci ostaju zaštićeni u sigurnom sustavu.',
  },
];

export function AccountCreatedPage(): ReactElement {
  return (
    <PublicStatusLayout
      variant="success"
      heroTitle="Račun je uspješno izrađen"
      heroLead="Vaš korisnički račun je spreman za prijavu, pregled termina i upravljanje osnovnim zdravstvenim podacima."
      features={accountCreatedFeatures}
      cardAriaLabel="Uspješno kreiran račun"
    >
      <p className="public-status-card__eyebrow">Račun je spreman</p>
      <h2>Uspješno kreiran račun</h2>
      <p className="public-status-card__subtitle">
        Registracija je dovršena. Sada se možete prijaviti i nastaviti s korištenjem sustava.
      </p>

      <StatusCardIllustration variant="success" />

      <div className="public-status-actions">
        <Link className="public-status-button public-status-button--primary" to={APP_ROUTES.login}>
          <PublicStatusIcon name="lock" />
          Prijavite se
        </Link>

        <div className="public-status-divider">
          <span>ili</span>
        </div>

        <Link className="public-status-link" to={APP_ROUTES.home}>
          <PublicStatusIcon name="arrow-left" />
          Povratak na početnu
        </Link>
      </div>

      <aside className="public-status-note">
        <PublicStatusIcon name="info" />
        <p>Ako ne možete pristupiti računu, obratite se administratoru ustanove.</p>
      </aside>
    </PublicStatusLayout>
  );
}
