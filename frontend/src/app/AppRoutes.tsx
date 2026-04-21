import type { ReactElement } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { HomePage, LoginPage, RegisterPage } from '@/pages'

import { ProtectedRoute, PublicOnlyRoute } from './AuthRoutes'

export function AppRoutes(): ReactElement {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
