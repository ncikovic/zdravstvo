import jwt, { type SignOptions } from 'jsonwebtoken';

import { env } from '../../config/env.js';

export interface AccessTokenClaims {
  sub: string;
  organizationId: string;
  role: string;
}

export const signAccessToken = (claims: AccessTokenClaims): string => {
  const options: SignOptions = {
    expiresIn: env.jwtAccessTokenExpiresIn as SignOptions['expiresIn'],
  };

  return jwt.sign(claims, env.jwtSecret, options);
};
