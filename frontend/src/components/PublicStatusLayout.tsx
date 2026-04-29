import type { ReactElement, ReactNode } from 'react';

import { AuthBrandLogo } from './AuthBrandLogo';

export type PublicStatusVariant = 'success' | 'email' | 'forbidden' | 'not-found';

export type PublicStatusIconName =
  | 'arrow-left'
  | 'calendar'
  | 'check'
  | 'headset'
  | 'home'
  | 'info'
  | 'lock'
  | 'logout'
  | 'mail'
  | 'refresh'
  | 'search'
  | 'shield'
  | 'user';

export interface PublicStatusFeature {
  icon: PublicStatusIconName;
  title: string;
  text: string;
}

interface PublicStatusLayoutProps {
  variant: PublicStatusVariant;
  heroTitle: string;
  heroLead: string;
  features: PublicStatusFeature[];
  cardAriaLabel: string;
  children: ReactNode;
}

interface PublicStatusIconProps {
  name: PublicStatusIconName;
  className?: string;
}

interface StatusCardIllustrationProps {
  variant: PublicStatusVariant;
}

const iconPaths: Record<PublicStatusIconName, ReactNode> = {
  'arrow-left': <path d="m15 18-6-6 6-6" />,
  calendar: (
    <>
      <path d="M6 4.8h12a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6.8a2 2 0 0 1 2-2Z" />
      <path d="M4 9h16" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <path d="M8 12h2" />
      <path d="M12 12h2" />
      <path d="M16 12h2" />
      <path d="M8 16h2" />
      <path d="M12 16h2" />
    </>
  ),
  check: <path d="m5.2 12.7 4.2 4.2 9.4-10.1" />,
  headset: (
    <>
      <path d="M4.5 13.2v-1.1a7.5 7.5 0 0 1 15 0v1.1" />
      <path d="M6.8 12.3H5.5a1.8 1.8 0 0 0-1.8 1.8v2.1A1.8 1.8 0 0 0 5.5 18h1.3v-5.7Z" />
      <path d="M17.2 12.3h1.3a1.8 1.8 0 0 1 1.8 1.8v2.1a1.8 1.8 0 0 1-1.8 1.8h-1.3v-5.7Z" />
      <path d="M15.7 20.2h-2.6" />
    </>
  ),
  home: (
    <>
      <path d="m3.7 11.2 8.3-7.1 8.3 7.1" />
      <path d="M6 10.4v9.2h12v-9.2" />
      <path d="M10 19.6v-5.2h4v5.2" />
    </>
  ),
  info: (
    <>
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
      <path d="M12 11.5v5" />
      <path d="M12 7.8h.01" />
    </>
  ),
  lock: (
    <>
      <path d="M7 10.5h10a1.6 1.6 0 0 1 1.6 1.6v6.3A1.6 1.6 0 0 1 17 20H7a1.6 1.6 0 0 1-1.6-1.6v-6.3A1.6 1.6 0 0 1 7 10.5Z" />
      <path d="M8.8 10.5V8.2a3.2 3.2 0 1 1 6.4 0v2.3" />
      <path d="M12 14.2v2.1" />
    </>
  ),
  logout: (
    <>
      <path d="M9.5 5H6.7A1.7 1.7 0 0 0 5 6.7v10.6A1.7 1.7 0 0 0 6.7 19h2.8" />
      <path d="M14 8.2 17.8 12 14 15.8" />
      <path d="M17.8 12H9.3" />
    </>
  ),
  mail: (
    <>
      <path d="M4.8 6.5h14.4c.8 0 1.5.7 1.5 1.5v8c0 .8-.7 1.5-1.5 1.5H4.8c-.8 0-1.5-.7-1.5-1.5V8c0-.8.7-1.5 1.5-1.5Z" />
      <path d="m4 8 8 5.4L20 8" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 12a8 8 0 0 1-13.7 5.6" />
      <path d="M4 12A8 8 0 0 1 17.7 6.4" />
      <path d="M17.8 3.7v3h-3" />
      <path d="M6.2 20.3v-3h3" />
    </>
  ),
  search: (
    <>
      <path d="M10.8 18.1a7.3 7.3 0 1 0 0-14.6 7.3 7.3 0 0 0 0 14.6Z" />
      <path d="m16.2 16.2 4.3 4.3" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.4 18 6v4.4c0 4.2-2.4 7.9-6 9.6-3.6-1.7-6-5.4-6-9.6V6l6-2.6Z" />
      <path d="M12 9.2v4.2" />
      <path d="M10.3 11h3.4" />
    </>
  ),
  user: (
    <>
      <path d="M12 12.2a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Z" />
      <path d="M4.8 20.2a7.2 7.2 0 0 1 14.4 0" />
    </>
  ),
};

export function PublicStatusIcon({ name, className }: PublicStatusIconProps): ReactElement {
  return (
    <svg
      className={className ? `public-status-icon ${className}` : 'public-status-icon'}
      viewBox="0 0 24 24"
      role="img"
      aria-hidden="true"
    >
      {iconPaths[name]}
    </svg>
  );
}

const PublicStatusHeroArt = ({ variant }: { variant: PublicStatusVariant }): ReactElement => (
  <div className={`public-hero-art public-hero-art--${variant}`} aria-hidden="true">
    <span className="public-hero-art__plus public-hero-art__plus--large" />
    <span className="public-hero-art__plus public-hero-art__plus--small" />
    <span className="public-hero-art__dots" />
    <span className="public-hero-art__orbit public-hero-art__orbit--one" />
    <span className="public-hero-art__orbit public-hero-art__orbit--two" />
    <div className="public-hero-art__leaves public-hero-art__leaves--left">
      <span />
      <span />
      <span />
    </div>
    <div className="public-hero-art__leaves public-hero-art__leaves--right">
      <span />
      <span />
      <span />
    </div>
    <div className="public-hero-art__scene">
      {variant === 'email' ? (
        <div className="public-hero-mail">
          <span className="public-hero-mail__flap" />
          <span className="public-hero-mail__paper" />
          <span className="public-hero-mail__check" />
        </div>
      ) : null}
      {variant === 'forbidden' ? (
        <div className="public-hero-shield">
          <PublicStatusIcon name="lock" />
        </div>
      ) : null}
      {variant === 'not-found' ? (
        <div className="public-hero-browser">
          <span className="public-hero-browser__bar" />
          <span className="public-hero-browser__file" />
          <span className="public-hero-browser__face" />
          <span className="public-hero-browser__search" />
        </div>
      ) : null}
      {variant === 'success' ? (
        <div className="public-hero-tablet">
          <span className="public-hero-tablet__avatar" />
          <span className="public-hero-tablet__line public-hero-tablet__line--short" />
          <span className="public-hero-tablet__line" />
          <span className="public-hero-tablet__card" />
          <span className="public-hero-tablet__check" />
        </div>
      ) : null}
    </div>
    <div className="public-hero-hospital">
      <span className="public-hero-hospital__sign">H</span>
      <span />
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
  </div>
);

export function StatusCardIllustration({ variant }: StatusCardIllustrationProps): ReactElement {
  if (variant === 'forbidden') {
    return (
      <div className="public-card-visual public-card-visual--forbidden" aria-hidden="true">
        <span className="public-card-visual__number">403</span>
        <span className="public-card-visual__shield">
          <PublicStatusIcon name="lock" />
        </span>
        <span className="public-card-visual__sparkle public-card-visual__sparkle--one" />
        <span className="public-card-visual__sparkle public-card-visual__sparkle--two" />
      </div>
    );
  }

  if (variant === 'not-found') {
    return (
      <div className="public-card-visual public-card-visual--not-found" aria-hidden="true">
        <span className="public-card-visual__number">404</span>
        <span className="public-card-visual__document" />
        <span className="public-card-visual__plus-badge">+</span>
        <span className="public-card-visual__sparkle public-card-visual__sparkle--one" />
        <span className="public-card-visual__sparkle public-card-visual__sparkle--two" />
      </div>
    );
  }

  if (variant === 'email') {
    return (
      <div className="public-card-visual public-card-visual--email" aria-hidden="true">
        <span className="public-card-visual__paper" />
        <span className="public-card-visual__envelope" />
        <span className="public-card-visual__check-badge">
          <PublicStatusIcon name="check" />
        </span>
        <span className="public-card-visual__sparkle public-card-visual__sparkle--one" />
        <span className="public-card-visual__sparkle public-card-visual__sparkle--two" />
      </div>
    );
  }

  return (
    <div className="public-card-visual public-card-visual--success" aria-hidden="true">
      <span className="public-card-visual__success-ring">
        <PublicStatusIcon name="check" />
      </span>
      <span className="public-card-visual__sparkle public-card-visual__sparkle--one" />
      <span className="public-card-visual__sparkle public-card-visual__sparkle--two" />
      <span className="public-card-visual__grass public-card-visual__grass--left" />
      <span className="public-card-visual__grass public-card-visual__grass--right" />
    </div>
  );
}

export function PublicStatusLayout({
  variant,
  heroTitle,
  heroLead,
  features,
  cardAriaLabel,
  children,
}: PublicStatusLayoutProps): ReactElement {
  return (
    <main className={`public-status-page public-status-page--${variant}`}>
      <section className="public-status-hero" aria-label="Informacije">
        <div className="public-status-hero__content">
          <AuthBrandLogo />
          <h1>{heroTitle}</h1>
          <p className="public-status-hero__lead">{heroLead}</p>

          <div className="public-status-feature-list" aria-label="Ključne informacije">
            {features.map((feature) => (
              <article className="public-status-feature" key={feature.title}>
                <span className="public-status-feature__icon">
                  <PublicStatusIcon name={feature.icon} />
                </span>
                <div>
                  <h2>{feature.title}</h2>
                  <p>{feature.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <PublicStatusHeroArt variant={variant} />
      </section>

      <section className="public-status-panel" aria-label={cardAriaLabel}>
        <div className="public-status-card">{children}</div>
      </section>
    </main>
  );
}
