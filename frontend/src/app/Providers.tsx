import { QueryClientProvider, QueryErrorResetBoundary } from '@tanstack/react-query';
import type { PropsWithChildren, ReactElement } from 'react';

import { AppErrorBoundary } from './AppErrorBoundary';
import { queryClient } from './queryClient';

export function Providers({ children }: PropsWithChildren): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <AppErrorBoundary
            onReset={reset}
            fallbackRender={({ error, reset: resetBoundary }) => (
              <main className="app-shell">
                <section className="hero-card error-card" role="alert" aria-live="assertive">
                  <p className="eyebrow">zdravstvo</p>
                  <h1>Something went wrong.</h1>
                  <p>
                    The app hit an unexpected error. Try reloading the current screen.
                  </p>
                  <p className="error-message">{error.message}</p>
                  <button className="retry-button" type="button" onClick={resetBoundary}>
                    Try again
                  </button>
                </section>
              </main>
            )}
          >
            {children}
          </AppErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </QueryClientProvider>
  );
}
