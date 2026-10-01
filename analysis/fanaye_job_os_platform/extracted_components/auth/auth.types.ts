export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RegisterRequestDto {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginResponseDto {
  accessToken?: string;
  refreshToken?: string;
  user?: ApiUser;
  requiresTwoFactor?: boolean;
  tempToken?: string;
}

export interface ApiUser {
  id: string;
  email: string;
  fullName: string;
  status: string;
  onboardingStage: string;
  role?: "CANDIDATE" | "ADMIN" | "SUPER_ADMIN" | "ANONYMOUS_VISITOR";
  emailVerified?: boolean;
  emailVerifiedAt?: string | null;
  hasUploadedCv: boolean;
  hasProfileImport?: boolean;
  twoFactorEnabled: boolean;
  hasLocalPassword: boolean;
}

export interface OAuthContinueSessionDto {
  sessionId: string;
  provider: "GOOGLE" | "GITHUB";
  fullName: string;
  email: string;
  expiresAt: string;
}

export interface CompleteOAuthLoginRequestDto {
  sessionId: string;
  token: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  status: string;
  onboardingStage: string;
  role: string;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  hasUploadedCv: boolean;
  hasProfileImport: boolean;
  twoFactorEnabled: boolean;
  hasLocalPassword: boolean;
}

export interface ForgotPasswordRequestDto {
  email: string;
}

export interface ForgotPasswordResponseDto {
  message: string;
}

export interface ResetPasswordRequestDto {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ResetPasswordResponseDto {
  message: string;
}

export interface VerifyEmailRequestDto {
  email: string;
  otp: string;
}

export interface VerifyEmailResponseDto {
  message: string;
  accessToken?: string;
  refreshToken?: string;
  user?: ApiUser;
  requiresTwoFactor?: boolean;
}

export interface ResendVerificationRequestDto {
  email: string;
}

export interface ResendVerificationResponseDto {
  message: string;
}

export interface UpdatePasswordRequestDto {
  currentPassword: string;
  newPassword: string;
}

export interface UpdatePasswordResponseDto {
  message: string;
}
