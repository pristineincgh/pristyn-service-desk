import { UserRole, UserStatus } from 'src/generated/prisma/enums';

// Safe user type (without sensitive data)
export interface SafeUser {
  id: string;
  email: string;
  name: string;
  passwordUpdatedAt: Date;
  role: UserRole;
  phone: string | null;
  emailVerified: boolean;
  mustChangePassword: boolean;
  status: UserStatus;
  supervisorId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Authenticated user from session
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  sessionId: string;
}

// Session user from token (minimal payload)
export interface SessionUser {
  sub: string;
  email: string;
  role: UserRole;
  sessionId: string;
  iat?: number;
  exp?: number;
}
