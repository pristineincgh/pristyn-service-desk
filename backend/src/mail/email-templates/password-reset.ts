import { PasswordResetEmailProps } from '../mail-types';

export const passwordResetHTML = (data: PasswordResetEmailProps) => {
  const safeName = data.htmlProps.firstName?.trim() || 'there';
  const { temporaryPassword } = data.htmlProps;

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your password has been reset</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#172033;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f4f7fb;margin:0;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;background-color:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #d9e2f0;">
            <tr>
              <td style="padding:40px 40px 24px;background:linear-gradient(135deg,#7c2d12 0%,#ea580c 100%);color:#ffffff;">
                <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;opacity:0.8;">
                  Pristyn Service Desk
                </p>
                <h1 style="margin:0;font-size:30px;line-height:1.2;font-weight:700;">
                  Your password was reset
                </h1>
                <p style="margin:16px 0 0;font-size:16px;line-height:1.6;color:#ffedd5;">
                  A moderator reset your account password. Use the temporary password below to sign in.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:32px 40px 40px;">
                <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#334155;">
                  Hi ${safeName},
                </p>
                <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#334155;">
                  Your account password has been reset by a moderator. Sign in with the temporary password below and change it immediately.
                </p>

                <div style="margin:0 0 28px;padding:18px 20px;border-radius:14px;background-color:#fff7ed;border:1px solid #fed7aa;">
                  <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#9a3412;">
                    Temporary password
                  </p>
                  <p style="margin:0;font-size:18px;line-height:1.7;color:#7c2d12;font-weight:700;letter-spacing:0.03em;">
                    ${temporaryPassword}
                  </p>
                </div>

                <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#475569;">
                  For security, you will be required to change this password after signing in.
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
