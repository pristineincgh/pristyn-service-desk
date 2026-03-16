export interface EmailVerificationProps {
  receiverEmail: string;
  htmlProps: {
    verificationURL: string;
    firstName: string;
    credentials: {
      email: string;
      password: string;
    };
  };
}

export interface PasswordChangedEmailProps {
  receiverEmail: string;
  htmlProps: {
    firstName: string;
  };
}

export interface PasswordResetEmailProps {
  receiverEmail: string;
  htmlProps: {
    firstName: string;
    temporaryPassword: string;
  };
}

export interface ForgotPasswordEmailProps {
  receiverEmail: string;
  htmlProps: {
    firstName: string;
    resetUrl: string;
  };
}
