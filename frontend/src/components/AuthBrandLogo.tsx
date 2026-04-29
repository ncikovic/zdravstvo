import type { ReactElement } from 'react';

export function AuthBrandLogo(): ReactElement {
  return (
    <img
      className="login-brand"
      src="/assets/branding/logo.png"
      alt="Zdravstvo"
      decoding="async"
    />
  );
}
