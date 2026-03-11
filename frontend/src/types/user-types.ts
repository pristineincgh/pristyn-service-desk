export enum UserRole {
  AGENT = 'AGENT',
  SUPERVISOR = 'SUPERVISOR',
  MODERATOR = 'MODERATOR',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface UserShort {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface UserSummary extends UserShort {
  phone: string | null;
  status: UserStatus;
  emailVerified: boolean;
  supervisorId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type UserDetail = UserSummary;

export interface UserListResponse {
  total: number;
  users: UserSummary[];
}

export interface CreateUserPayload {
  name: string;
  email: string;
  role: UserRole;
}

export interface CreateUserResponse {
  message: string;
  user: UserShort;
  defaultPassword?: string;
}

export interface AssignSupervisorPayload {
  supervisorId: string;
}

export interface AssignSupervisorResponse {
  message: string;
  user: UserSummary & {
    supervisor?: Pick<UserShort, 'id' | 'name' | 'email'> | null;
  };
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  phone?: string | null;
  role?: UserRole;
  emailVerified?: boolean;
  supervisorId?: string | null;
}

export interface UpdateUserStatusPayload {
  status: UserStatus;
}

export interface UpdateUserResponse {
  message: string;
  user: UserSummary;
}

export interface ResetUserPasswordResponse {
  message: string;
  userId: string;
  defaultPassword: string;
}

export interface AuthUser extends UserSummary {
  sessionId?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: AuthUser;
}

export interface LogoutResponse {
  message: string;
}

export interface AuthUserResponse {
  user: AuthUser;
}
