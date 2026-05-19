import type { AppApiError } from '@/types'

const CODE_MESSAGES: Partial<Record<string, string>> = {
  NETWORK_ERROR: 'Nema veze s poslužiteljem. Provjerite internet vezu i pokušajte ponovo.',
  ERR_NETWORK: 'Nema veze s poslužiteljem. Provjerite internet vezu i pokušajte ponovo.',
  INTERNAL_SERVER_ERROR: 'Došlo je do neočekivane greške. Pokušajte ponovo.',
  UNAUTHORIZED: 'Vaša sesija je istekla. Prijavite se ponovo.',
  FORBIDDEN: 'Nemate ovlasti za ovu akciju.',
  NOT_FOUND: 'Traženi resurs nije pronađen.',
  CONFLICT: 'Zahtjev je u konfliktu s postojećim podacima.',
  VALIDATION_ERROR: 'Uneseni podaci nisu ispravni. Provjerite polja i pokušajte ponovo.',
  BAD_REQUEST: 'Zahtjev nije ispravan. Provjerite unesene podatke.',
  EMAIL_ALREADY_EXISTS: 'Email adresa je već registrirana.',
  PHONE_ALREADY_EXISTS: 'Broj telefona je već registriran.',
  OIB_ALREADY_EXISTS: 'OIB je već registriran.',
  REGISTRATION_CONFLICT: 'Račun s ovim podacima već postoji.',
}

const STATUS_MESSAGES: Partial<Record<number, string>> = {
  0: 'Nema veze s poslužiteljem. Provjerite internet vezu i pokušajte ponovo.',
  400: 'Zahtjev nije ispravan. Provjerite unesene podatke.',
  401: 'Vaša sesija je istekla. Prijavite se ponovo.',
  403: 'Nemate ovlasti za ovu akciju.',
  404: 'Traženi resurs nije pronađen.',
  409: 'Zahtjev je u konfliktu s postojećim podacima.',
  422: 'Uneseni podaci nisu ispravni. Provjerite polja i pokušajte ponovo.',
  500: 'Došlo je do neočekivane greške. Pokušajte ponovo.',
  503: 'Usluga trenutno nije dostupna. Pokušajte ponovo za nekoliko trenutaka.',
}

const isAppApiError = (error: unknown): error is AppApiError =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  'status' in error &&
  'message' in error

export const getApiErrorMessage = (error: unknown): string => {
  if (isAppApiError(error)) {
    return (
      CODE_MESSAGES[error.code] ??
      STATUS_MESSAGES[error.status] ??
      'Došlo je do neočekivane greške. Pokušajte ponovo.'
    )
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Došlo je do neočekivane greške. Pokušajte ponovo.'
}
