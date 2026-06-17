# TEST_PLAN.md — Zdravstvo sustav testiranja

## 4.3 Testiranje sustava

---

## 4.3.1 Unit testovi

### Backend unit testovi

Implementirani korištenjem Node.js built-in test runnera (`node:test`) i pokretaju se s:
```
pnpm --filter @zdravstvo/backend test
```

| File | Sadržaj |
|------|---------|
| `backend/tests/jwt.test.ts` | JWT utility: potpisivanje i verifikacija access tokena i selection tokena |
| `backend/tests/auth.middleware.test.ts` | Auth middleware: odbijanje zahtjeva bez/s nevažećim tokenom |
| `backend/tests/appError.test.ts` | AppError klasa: factory metode, statusni kodovi, isOperational flag |
| `backend/tests/auth.service.test.ts` | AuthService: login, multi-org selekcija, registracija (postojeći) |
| `backend/tests/rbac.middleware.test.ts` | RBAC middleware: permisije uloga, system admin bypass (postojeći) |
| `backend/tests/validateRequest.test.ts` | Validacija Zod shema u request middlewareu (postojeći) |

### Frontend unit testovi

Implementirani korištenjem Vitest + React Testing Library i pokretaju se s:
```
pnpm --filter @zdravstvo/frontend test
```

| File | Sadržaj |
|------|---------|
| `frontend/src/stores/auth/__tests__/auth.store.test.ts` | Zustand auth store: setAuth, clearAuth, setAccessToken, isAuthenticated |
| `frontend/src/pages/dashboard/__tests__/dashboard.mappers.test.ts` | Mapper funkcije: status labeli, statistike, placeholderi za prazne liste |
| `frontend/src/__tests__/pages/LoginPage.test.tsx` | LoginPage komponenta: prikaz forme, error stanje, pending stanje (postojeći) |

---

## 4.3.2 Funkcionalni testovi

Testiraju tokove kroz više slojeva (validacija → servis → odgovor) bez stvarne baze podataka (in-memory mock).

| File | Sadržaj |
|------|---------|
| `backend/tests/auth.functional.test.ts` | Login → JWT generacija → verifikacija tokena; Zod validacija login ulaza; provjera da passwordHash nije u odgovoru |

### Pokriveni scenariji

| Scenarij | Implementacija |
|----------|---------------|
| POST /auth/login — uspješna prijava | `auth.service.test.ts` (postojeći) + `auth.functional.test.ts` |
| POST /auth/login — pogrešne lozinke | `auth.service.test.ts` (postojeći) |
| Zaštićena ruta bez tokena → 401 | `auth.middleware.test.ts` |
| Zaštićena ruta s nevažećim tokenom → 401 | `auth.middleware.test.ts`, `security.test.ts` |
| Multi-org prijava → selection token | `auth.service.test.ts`, `auth.functional.test.ts` |
| Zod validacija praznog identifiera | `auth.functional.test.ts`, `security.test.ts` |
| Login odgovor ne sadrži passwordHash | `auth.functional.test.ts` |

> **Napomena:** Funkcionalni HTTP-razina testovi (npr. stvarni `POST /api/auth/login` request) nisu implementirani jer zahtijevaju pokrenuti MySQL server. Preporuča se uvođenje `supertest` i test baze podataka (Docker) za kompletno E2E testiranje API ruta.

> **Napomena:** Testovi za preklop termina (overlapping appointments) nisu implementirani jer logika preklopa nije potvrđena u `appointments.service.ts`.

> **Napomena:** Pretraga pacijenata (`patients.service.ts`) postoji no nije obuhvaćena funkcionalnim testom jer forma odgovora nije testirana zasebnim stubom u ovom PR-u.

---

## 4.3.3 Prihvatni testovi (Acceptance Tests)

Vitest + React Testing Library, bez Playwright (nije instaliran). Testira se ključni korisnički tok prijave.

| File | Sadržaj |
|------|---------|
| `frontend/src/__tests__/acceptance/login-flow.acceptance.test.tsx` | 8 prihvatnih kriterija pokriva korisnički tok prijave |
| `docs/testing/acceptance-test.md` | Potpuno dokumentirani korisnički scenarij |

### Pokriveni prihvatni kriteriji (AC)

| ID | Kriterij |
|----|---------|
| AC-01 | Login stranica prikazuje naslov, polje za email/telefon i polje za lozinku |
| AC-02 | Korisnik može unijeti identifikator u polje |
| AC-03 | Korisnik može unijeti lozinku u polje |
| AC-04 | Gumb za prijavu je aktivan na početku |
| AC-05 | Slanje forme poziva login mutaciju s točnim podacima |
| AC-06 | Neuspješna autentifikacija prikazuje poruku greške |
| AC-07 | Za vrijeme autentifikacije gumb je onemogućen i prikazuje status |
| AC-08 | Novi korisnik može otvoriti tok registracije |

---

## 4.3.4 Sigurnosni testovi (System Security Tests)

| File | Sadržaj |
|------|---------|
| `backend/tests/security.test.ts` | 9 sigurnosnih testnih slučajeva (SEC-01 do SEC-09) |

### Tablica testnih slučajeva

| ID | Svrha | Ulaz | Očekivani rezultat | Status |
|----|-------|------|-------------------|--------|
| SEC-01 | Neatentificirani zahtjev je odbijen | Zahtjev bez Authorization headera | 401 UNAUTHORIZED | ✅ Prolazi |
| SEC-02 | Nevažeći JWT token je odbijen | `Bearer invalid.jwt.token` | 401 UNAUTHORIZED | ✅ Prolazi |
| SEC-03 | JWT s krivim potpisom ne prolazi verifikaciju | Token potpisan krivim secretom | `JsonWebTokenError` | ✅ Prolazi |
| SEC-04 | Token kodira organizacijski ID koji se ne može promijeniti | Potpisati token s org A, provjeriti | organizationId = org A (ne može biti org B) | ✅ Prolazi |
| SEC-05 | Login validacija odbija prazan identifikator | `{ identifier: '', password: 'x' }` | `safeParse.success = false` | ✅ Prolazi |
| SEC-06 | Login validacija odbija praznu lozinku | `{ identifier: 'x', password: '' }` | `safeParse.success = false` | ✅ Prolazi |
| SEC-07 | Login validacija odbija whitespace-only identifikator | `{ identifier: '   ', password: 'x' }` | `safeParse.success = false` | ✅ Prolazi |
| SEC-08 | Interne greške imaju `isOperational: false` | `AppError.internal()` | `isOperational = false`, `status = 500` | ✅ Prolazi |
| SEC-09 | Istekli JWT je odbijen od strane middlewarea | Bearer token s `expiresIn: -1` | 401 UNAUTHORIZED | ✅ Prolazi |

### Sigurnosna arhitektura (pregled)

| Mehanizam | Implementacija | Testiran |
|-----------|--------------|---------|
| Autentifikacija | JWT Bearer tokeni s istekom | Da (jwt.test.ts, auth.middleware.test.ts) |
| Autorizacija | RBAC middleware uloga | Da (rbac.middleware.test.ts — postojeći) |
| Heširanje lozinki | bcrypt (12 rundi) | Da (auth.functional.test.ts — passwordHash nije u odgovoru) |
| Validacija unosa | Zod sheme na svim endpointima | Da (validateRequest.test.ts, security.test.ts) |
| Sigurnosni headeri | Helmet middleware (konfiguriran u `app.ts`) | Konfiguracija verificirana; HTTP-razina test zahtijeva supertest |
| CORS | cors middleware (konfiguriran u `app.ts`) | Konfiguracija verificirana; HTTP-razina test zahtijeva supertest |
| Rate limiting | express-rate-limit (konfiguriran) | Konfiguracija verificirana; HTTP-razina test zahtijeva supertest |

---

## Kompletna tablica testnih slučajeva

| ID | Svrha | Ulaz | Očekivani rezultat | Paket | Datoteka | Status |
|----|-------|------|-------------------|-------|---------|--------|
| UT-B01 | Sign system admin JWT | `{ sub, isSystemAdmin: true }` | Validan token, claims jednaki | backend | jwt.test.ts | ✅ |
| UT-B02 | Sign org-scoped JWT | `{ sub, organizationId, role }` | Validan token s orgId i role | backend | jwt.test.ts | ✅ |
| UT-B03 | Verify invalid JWT string | `'not-a-jwt'` | `JsonWebTokenError` | backend | jwt.test.ts | ✅ |
| UT-B04 | Verify expired JWT | JWT s `expiresIn: -1` | `TokenExpiredError` | backend | jwt.test.ts | ✅ |
| UT-B05 | Verify wrong-secret JWT | JWT s krivim secretom | `JsonWebTokenError` | backend | jwt.test.ts | ✅ |
| UT-B06 | Sign/verify selection token | `{ sub }` | Token s `purpose: 'organization_selection'` | backend | jwt.test.ts | ✅ |
| UT-B07 | Reject access token as selection | Access token | `JsonWebTokenError` | backend | jwt.test.ts | ✅ |
| UT-B08 | Middleware: no header → 401 | Zahtjev bez Authorization | AppError 401 UNAUTHORIZED | backend | auth.middleware.test.ts | ✅ |
| UT-B09 | Middleware: wrong scheme → 401 | `Basic ...` | AppError 401 | backend | auth.middleware.test.ts | ✅ |
| UT-B10 | Middleware: expired JWT → 401 | Bearer + expired token | AppError 401 | backend | auth.middleware.test.ts | ✅ |
| UT-B11 | AppError.unauthorized → 401 | — | `status=401, code=UNAUTHORIZED` | backend | appError.test.ts | ✅ |
| UT-B12 | AppError.forbidden → 403 | — | `status=403, code=FORBIDDEN` | backend | appError.test.ts | ✅ |
| UT-B13 | AppError.validation → 400 + details | `[{field, message}]` | `code=VALIDATION_ERROR, details` | backend | appError.test.ts | ✅ |
| UT-B14 | AppError.internal → 500 isOperational=false | — | `isOperational=false` | backend | appError.test.ts | ✅ |
| FT-B01 | Login → JWT verifiable | Valid credentials | `verifyAccessToken` uspješan | backend | auth.functional.test.ts | ✅ |
| FT-B02 | Login response bez passwordHash | Valid credentials | `passwordHash` nije u `response.user` | backend | auth.functional.test.ts | ✅ |
| FT-B03 | Zod: empty identifier → error | `{ identifier: '' }` | `success = false` | backend | auth.functional.test.ts | ✅ |
| FT-B04 | Zod: valid login input → success | `{ identifier: 'x@y.com', password: 'p' }` | `success = true` | backend | auth.functional.test.ts | ✅ |
| UT-F01 | Auth store: initial state | — | `isAuthenticated=false` | frontend | auth.store.test.ts | ✅ |
| UT-F02 | Auth store: setAuth org-scoped | `AuthenticatedAuthResponseDto` | `isAuthenticated=true, role, orgId` | frontend | auth.store.test.ts | ✅ |
| UT-F03 | Auth store: setAuth system admin | `isSystemAdmin: true` | `isAuthenticated=true, isSystemAdmin=true` | frontend | auth.store.test.ts | ✅ |
| UT-F04 | Auth store: clearAuth | Nakon setAuth | `isAuthenticated=false, accessToken=null` | frontend | auth.store.test.ts | ✅ |
| UT-F05 | Dashboard mapper: COMPLETED → Obavljeno | Appointment status COMPLETED | `scheduleRow.status = 'Obavljeno'` | frontend | dashboard.mappers.test.ts | ✅ |
| UT-F06 | Dashboard mapper: empty slots → placeholder | `availableSlots: []` | Jedan item s naslovom 'Nema slobodnih termina' | frontend | dashboard.mappers.test.ts | ✅ |
| UT-F07 | Dashboard mapper: patient bez termina | `nextAppointment: null` | `view.nextAppointment = null` | frontend | dashboard.mappers.test.ts | ✅ |
| AC-01–08 | Korisnički tok prijave | UI interakcija | Forma prikazana, login pozvan, error prikazan | frontend | login-flow.acceptance.test.tsx | ✅ |
| SEC-01–09 | Sigurnosni testovi | Vidi tablicu iznad | Vidi tablicu iznad | backend | security.test.ts | ✅ |

---

## Pokretanje testova

```bash
# Backend unit + funkcionalni + sigurnosni testovi
pnpm --filter @zdravstvo/backend test

# Frontend unit + prihvatni testovi
pnpm --filter @zdravstvo/frontend test

# Typecheck svi paketi
pnpm -r typecheck
```
