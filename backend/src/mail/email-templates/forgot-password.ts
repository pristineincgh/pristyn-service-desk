import { ForgotPasswordEmailProps } from '../mail-types';

export const forgotPasswordHTML = (data: ForgotPasswordEmailProps) => {
  const safeName = data.htmlProps.firstName?.trim() || 'there';
  const { resetUrl } = data.htmlProps;

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset your password</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#172033;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f4f7fb;margin:0;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;background-color:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #d9e2f0;">
            <tr>
              <td style="padding:40px 40px 24px;background:linear-gradient(135deg,#0f172a 0%,#2563eb 100%);color:#ffffff;">
                <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;opacity:0.8;">
                  Pristyn Service Desk
                </p>
                <h1 style="margin:0;font-size:30px;line-height:1.2;font-weight:700;">
                  Reset your password
                </h1>
                <p style="margin:16px 0 0;font-size:16px;line-height:1.6;color:#dbeafe;">
                  Use the secure link below to choose a new password for your account.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 40px 40px;">
                <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#334155;">
                  Hi ${safeName},
                </p>
                <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#334155;">
                  We received a request to reset your password. Use the button below to set a new one.
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                  <tr>
                    <td align="center" bgcolor="#2563eb" style="border-radius:12px;">
                      <a
                        href="${resetUrl}"
                        style="display:inline-block;padding:14px 24px;font-size:16px;font-weight:700;line-height:1;text-decoration:none;color:#ffffff;"
                      >
                        Reset Password
                      </a>
                    </td>
                  </tr>
                </table>
                <div style="margin:0 0 28px;padding:18px 20px;border-radius:14px;background-color:#f8fafc;border:1px solid #e2e8f0;">
                  <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#0f172a;">
                    If the button does not work
                  </p>
                  <p style="margin:0;font-size:14px;line-height:1.7;color:#475569;word-break:break-word;">
                    Copy and paste this link into your browser:<br />
                    <a href="${resetUrl}" style="color:#2563eb;text-decoration:none;">${resetUrl}</a>
                  </p>
                </div>
                <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#475569;">
                  This link is single-use and expires automatically for security.
                </p>
                <p style="margin:0;font-size:14px;line-height:1.7;color:#475569;">
                  If you did not request this change, you can ignore this email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
                <p style="margin:0;font-size:12px;line-height:1.7;color:#64748b;">
                  This is an automated message from Pristyn Service Desk. Please do not reply directly to this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
};
