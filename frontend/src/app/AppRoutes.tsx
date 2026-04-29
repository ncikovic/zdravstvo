import type { ReactElement } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import {
  AccessDeniedPage,
  AccountCreatedPage,
  ConfirmEmailPage,
  ForgotPasswordPage,
  HomePage,
  LoginPage,
  NotFoundPage,
} from '@/pages';

import { ProtectedRoute, PublicOnlyRoute } from './AuthRoutes';
import { APP_ROUTES } from './routes';

export function AppRoutes(): ReactElement {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={APP_ROUTES.accountCreated} element={<AccountCreatedPage />} />
        <Route path={APP_ROUTES.confirmEmail} element={<ConfirmEmailPage />} />
        <Route path={APP_ROUTES.forbidden} element={<AccessDeniedPage />} />
        <Route path={APP_ROUTES.notFound} element={<NotFoundPage />} />
        <Route element={<PublicOnlyRoute />}>
          <Route path={APP_ROUTES.login} element={<LoginPage />} />
          <Route
            path={APP_ROUTES.register}
            element={<LoginPage initialStep="organizationSelection" />}
          />
          <Route path={APP_ROUTES.forgotPassword} element={<ForgotPasswordPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path={APP_ROUTES.home} element={<HomePage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
