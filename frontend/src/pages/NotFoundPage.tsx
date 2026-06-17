import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';

import { APP_ROUTES } from '@/app/routes';
import {
  PublicStatusIcon,
  PublicStatusLayout,
  StatusCardIllustration,
  type PublicStatusFeature,
} from '@/components';

const notFoundFeatures: PublicStatusFeature[] = [
  {
    icon: 'home',
    title: 'Povratak na početnu',
    text: 'Najbrže ćete nastaviti ako se vratite na početni zaslon.',
  },
  {
    icon: 'search',
    title: 'Provjerite poveznicu',
    text: 'Provjerite adresu stranice i pokušajte ponovno.',
  },
  {
    icon: 'shield',
    title: 'Nastavite sigurno',
    text: 'Svi ostali dijelovi sustava rade normalno i dostupni su nakon prijave.',
  },
];

export function NotFoundPage(): ReactElement {
  return (
    <PublicStatusLayout
      variant="not-found"
      heroTitle="Stranica nije pronađena"
      heroLead="Poveznica koju ste otvorili možda je zastarjela, premještena ili neispravna."
      features={notFoundFeatures}
      cardAriaLabel="Greška 404"
    >
      <p className="public-status-card__eyebrow">Greška 404</p>
      <h2>Stranica nije pronađena</h2>
      <p className="public-status-card__subtitle">
        Tražena stranica ne postoji ili je premještena na drugu lokaciju.
      </p>

      <StatusCardIllustration variant="not-found" />

      <div className="public-status-actions">
        <Link className="public-status-button public-status-button--primary" to={APP_ROUTES.home}>
          <PublicStatusIcon name="home" />
          Povratak na početnu
        </Link>

        <div className="public-status-divider">
          <span>ili</span>
        </div>

        <Link className="public-status-link" to={APP_ROUTES.login}>
          <PublicStatusIcon name="arrow-left" />
          Natrag na prijavu
        </Link>
      </div>

      <aside className="public-status-note">
        <PublicStatusIcon name="info" />
        <p>Ako ste do ove stranice došli iz sustava, pokušajte ponovno ili se obratite podršci.</p>
      </aside>
    </PublicStatusLayout>
  );
}
