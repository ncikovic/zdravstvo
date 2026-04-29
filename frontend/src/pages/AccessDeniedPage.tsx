import type { ReactElement } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { APP_ROUTES } from '@/app/routes';
import {
  PublicStatusIcon,
  PublicStatusLayout,
  StatusCardIllustration,
  type PublicStatusFeature,
} from '@/components';
import { useAuthStore } from '@/stores';

const accessDeniedFeatures: PublicStatusFeature[] = [
  {
    icon: 'user',
    title: 'Provjerite ulogu',
    text: 'Neke stranice dostupne su samo određenim korisničkim ulogama.',
  },
  {
    icon: 'home',
    title: 'Povratak na sigurno',
    text: 'Vratite se na početnu stranicu ili nadzornu ploču.',
  },
  {
    icon: 'headset',
    title: 'Zatražite pomoć',
    text: 'Ako mislite da je došlo do pogreške, obratite se administratoru ustanove.',
  },
];

export function AccessDeniedPage(): ReactElement {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogout = (): void => {
    clearAuth();
    navigate(APP_ROUTES.login, {
      replace: true,
    });
  };

  return (
    <PublicStatusLayout
      variant="forbidden"
      heroTitle="Nemate dopuštenje za pristup"
      heroLead="Pokušali ste otvoriti sadržaj ili radnju za koju vaš račun nema odgovarajuće ovlasti."
      features={accessDeniedFeatures}
      cardAriaLabel="Greška 403"
    >
      <p className="public-status-card__eyebrow">Greška 403</p>
      <h2>Nemate pristup ovoj stranici</h2>
      <p className="public-status-card__subtitle">
        Nažalost, nemate dopuštenje za pregledavanje zatraženog sadržaja ili izvođenje ove radnje.
      </p>

      <StatusCardIllustration variant="forbidden" />

      <div className="public-status-actions">
        <Link className="public-status-button public-status-button--primary" to={APP_ROUTES.home}>
          <PublicStatusIcon name="home" />
          Povratak na početnu
        </Link>

        <div className="public-status-divider">
          <span>ili</span>
        </div>

        <button
          className="public-status-button public-status-button--secondary"
          type="button"
          onClick={handleLogout}
        >
          <PublicStatusIcon name="logout" />
          Odjava
        </button>
      </div>

      <aside className="public-status-note">
        <PublicStatusIcon name="info" />
        <p>
          Ako mislite da biste trebali imati pristup ovoj stranici, obratite se administratoru
          ustanove.
        </p>
      </aside>
    </PublicStatusLayout>
  );
}
