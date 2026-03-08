import { UserRole } from 'src/generated/prisma/enums';

declare global {
  namespace Express {
    interface AuthTokens {
      sessionId: string;
    }

    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: UserRole;
        sessionId: string;
      };
      authTokens?: AuthTokens;
    }
  }
}
