export class TokenResponseDto {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;

  requiresTwoFactor?: boolean;
  twoFactorChallengeId?: string;
  message?: string;
}