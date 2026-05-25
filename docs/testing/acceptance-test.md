# Prihvatni testovi — Zdravstvo (4.3.3)

## Scenarij: Prijava korisnika u sustav

### Preduvjeti

- Sustav je pokrenut (backend na portu 3001, frontend na portu 5173)
- U bazi postoji aktivni korisnik s email `doktor@poliklinika.hr` i lozinkom `Demo1234!`
- Korisnik je dodijeljen organizaciji s ulogom DOCTOR

---

### Korak 1: Korisnik otvara stranicu za prijavu

**Radnja:** Korisnik navigira na `http://localhost:5173/login`

**Očekivani rezultat:**
- Prikazuje se naslov "Prijava"
- Prikazuje se polje "E-mail ili telefon"
- Prikazuje se polje "Lozinka"
- Prikazuje se gumb "Prijavi se" (aktivan)
- Prikazuje se gumb "Registrirajte se"
- Prikazuje se link "Zaboravili ste lozinku?"

**Automatizirani ekvivalent:** `AC-01`, `AC-04` u `login-flow.acceptance.test.tsx`

---

### Korak 2: Korisnik unosi ispravne podatke

**Radnja:**
1. Korisnik klikne na polje "E-mail ili telefon" i unese: `doktor@poliklinika.hr`
2. Korisnik klikne na polje "Lozinka" i unese: `Demo1234!`

**Očekivani rezultat:**
- Polje identifikatora prikazuje unesenu vrijednost
- Polje lozinke prikazuje maskiran unos (`•••••••••`)
- Gumb "Prikaži lozinku" omogućuje prikaz lozinke u čitljivom obliku

**Automatizirani ekvivalent:** `AC-02`, `AC-03` u `login-flow.acceptance.test.tsx`

---

### Korak 3: Korisnik šalje formu

**Radnja:** Korisnik klikne na gumb "Prijavi se"

**Očekivani rezultat:**
- Gumb prelazi u stanje "Prijava u tijeku..." i postaje onemogućen
- Backend API prima POST zahtjev na `/api/auth/login` s tijelom:
  ```json
  { "identifier": "doktor@poliklinika.hr", "password": "Demo1234!" }
  ```

**Automatizirani ekvivalent:** `AC-05`, `AC-07` u `login-flow.acceptance.test.tsx`

---

### Korak 4: Korisnik je autentificiran

**Radnja:** Backend vraća 200 OK s JWT access tokenom

**Očekivani rezultat:**
- Auth store sprema `accessToken`, `user`, `organizationId`, `role = "DOCTOR"`
- `isAuthenticated` postaje `true`
- Korisnik je preusmjeren na `/dashboard` (doctor dashboard)

**Automatizirani ekvivalent:** Provjera auth storea u `auth.store.test.ts` (UT-F02)

---

### Korak 5: Korisnik vidi dashboard prema ulozi

**Radnja:** Sustav renderira odgovarajući dashboard

**Očekivani rezultat:**
- Prikazan je Doctor Dashboard s:
  - Statistikama (današnji termini, pacijenti danas, slobodni blokovi, obavljeni termini)
  - Rasporedom za danas
  - Sljedećim pacijentom (ako postoji)
- Bočna navigacija prikazuje opcije dostupne DOCTOR ulozi

---

### Scenarij: Neuspješna prijava

**Preduvjet:** Korisnik je na stranici za prijavu

**Radnja:** Korisnik unese ispravni email ali krivu lozinku i klikne "Prijavi se"

**Očekivani rezultat:**
- Prikazuje se poruka greške (alert) s tekstom koji opisuje neuspjeh
- Korisnik ostaje na stranici za prijavu
- Forma ostaje popunjena (nije resetirana)

**Automatizirani ekvivalent:** `AC-06` u `login-flow.acceptance.test.tsx`

---

### Scenarij: Korisnik s više organizacija

**Preduvjet:** Korisnik ima aktivno članstvo u više od jedne organizacije

**Radnja:** Korisnik unese ispravne podatke i klikne "Prijavi se"

**Očekivani rezultat:**
- Backend vraća `requiresOrganizationSelection: true` i `selectionToken`
- Prikazuje se korak za odabir organizacije s listom organizacija
- Korisnik odabire organizaciju i autentifikacija se dovršava

---

### Scenarij: Registracija novog korisnika

**Radnja:** Korisnik klikne "Registrirajte se"

**Očekivani rezultat:**
- Prikazuje se korak za odabir ustanove
- Naslov se mijenja u "Odaberite ustanovu"
- Korisnik može pretraživati i odabrati ustanovu
- Nakon odabira ustanove prikazuje se forma za registraciju

**Automatizirani ekvivalent:** `AC-08` u `login-flow.acceptance.test.tsx`

---

## Izvršivi automatski testovi

```bash
# Pokretanje prihvatnih testova
pnpm --filter @zdravstvo/frontend test

# Filtrirano samo acceptance testovi
pnpm --filter @zdravstvo/frontend test -- acceptance
```

Testna datoteka: `frontend/src/__tests__/acceptance/login-flow.acceptance.test.tsx`

---

## Ograničenja automatizacije

| Ograničenje | Razlog | Preporuka |
|------------|--------|----------|
| Nema E2E testa s pravim browserom | Playwright nije instaliran | Dodati `@playwright/test` za E2E |
| Nema stvarnog HTTP poziva | Mock hooks koristi se umjesto pravog API klijenta | Koristiti MSW (Mock Service Worker) za realistični API mock |
| Redirect nakon login nije testiran | `useNavigate` mock nije uveden | Koristiti `createMemoryRouter` iz React Router 7 |
