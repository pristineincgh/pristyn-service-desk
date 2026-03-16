export enum UserRole {
  AGENT = "AGENT",
  SUPERVISOR = "SUPERVISOR",
  MODERATOR = "MODERATOR",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
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
  mustChangePassword: boolean;
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
    supervisor?: Pick<UserShort, "id" | "name" | "email"> | null;
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

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  phone?: string | null;
}

export interface UpdateProfileResponse {
  message: string;
  user: AuthUser;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface SendEmailVerificationResponse {
  message: string;
  expiresAt: string;
}

export interface VerifyEmailPayload {
  token: string;
}

export interface VerifyEmailResponse {
  message: string;
}

export interface ResendUserVerificationEmailResponse {
  message: string;
  expiresAt: string;
}

export interface RequestPasswordResetPayload {
  email: string;
}

export interface RequestPasswordResetResponse {
  message: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}
