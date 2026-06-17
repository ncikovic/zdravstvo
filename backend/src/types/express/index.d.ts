import type { AuthenticatedRequestContext } from '../../shared/context/index.js';

declare module 'express-serve-static-core' {
  interface Request {
    auth?: AuthenticatedRequestContext;
  }
}

export {};
