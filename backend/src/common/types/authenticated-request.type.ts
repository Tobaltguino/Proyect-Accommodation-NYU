import { Request } from 'express';
import { JwtPayload } from '../../modules/auth/types/auth.types';

export type AuthenticatedRequest = Request & {
  user?: JwtPayload;
};
