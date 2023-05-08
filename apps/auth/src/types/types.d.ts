/** Auth provider */
export type Provider = 'apple' | 'facebook' | 'google' | 'twitter';

export interface UserAppMetadata {
  provider?: string;
  [key: string]: any;
}

export interface UserMetadata {
  [key: string]: any;
}

export type SignInWithIdTokenCredentials = {
  /**
   * Only Apple and Google ID tokens are supported for use from within iOS or Android applications.
   */
  provider: 'google' | 'apple';
  /** ID token issued by Apple or Google. */
  token: string;
  /** If the ID token contains a `nonce`, then the hash of this value is compared to the value in the ID token. */
  nonce?: string;
  options?: {
    /** Verification token received when the user completes the captcha on the site. */
    captcha_token?: string;
  };
};

export type MobileOtpType = 'verify' | 'mobile_change';
export type EmailOtpType = 'signup' | 'signin' | 'invite' | 'magiclink' | 'password_reset' | 'email_change';
export type OtpType = MobileOtpType | EmailOtpType;
