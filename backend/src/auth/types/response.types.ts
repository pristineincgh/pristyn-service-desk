import { SafeUser } from './user.types';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  message: string;
  user: SafeUser;
}

export interface RefreshResponse {
  message: string;
  sessionId: string;
}

export interface LogoutResponse {
  message: string;
}

export interface SessionResponse {
  user: SafeUser;
  sessionId: string;
}
