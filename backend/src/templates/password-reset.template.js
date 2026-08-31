/**
 * Password Reset Email Template
 */
const getPasswordResetTemplate = ({ userName, resetUrl }) => {
  const subject = 'Mobile-Adda — Password Reset Request';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header { text-align: center; padding-bottom: 24px; border-bottom: 1px solid #f1f5f9; }
        .title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; }
        .content { padding: 24px 0; font-size: 14px; line-height: 1.6; }
        .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 12px; margin: 20px 0; }
        .warning { background-color: #fffbeb; border: 1px solid #fef3c7; color: #92400e; padding: 12px 16px; border-radius: 10px; font-size: 12px; margin-top: 16px; }
        .footer { font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; pt: 20px; margin-top: 24px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="title">📱 Mobile-Adda</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${userName || 'Customer'}</strong>,</p>
          <p>We received a request to reset the password for your Mobile-Adda account. Click the button below to choose a new password:</p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="btn">Reset Password</a>
          </div>
          <p>If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          <div class="warning">
            ⚠️ This reset link will expire in 1 hour. Never share your password reset link with anyone.
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Mobile-Adda. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `Hello ${userName || 'Customer'},\n\nWe received a request to reset your password for your Mobile-Adda account.\nPlease use the following link to reset your password:\n${resetUrl}\n\nThis link will expire in 1 hour. If you did not request this, please ignore this message.`;

  return { subject, html, text };
};

module.exports = getPasswordResetTemplate;
