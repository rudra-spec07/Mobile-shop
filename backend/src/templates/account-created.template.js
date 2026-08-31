/**
 * Account Created Email Template
 */
const getAccountCreatedTemplate = ({ userName }) => {
  const subject = 'Welcome to Mobile-Adda!';
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
        .footer { font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 24px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="title">📱 Mobile-Adda</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${userName || 'Customer'}</strong>,</p>
          <p>Welcome to <strong>Mobile-Adda</strong>! Your account has been successfully created.</p>
          <p>You can now browse mobile smartphones, spare parts, submit repair requests, and track enquiry status directly from your dashboard.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Mobile-Adda. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `Hello ${userName || 'Customer'},\n\nWelcome to Mobile-Adda! Your account has been successfully created. You can now browse devices, spare parts, and submit service requests.`;

  return { subject, html, text };
};

module.exports = getAccountCreatedTemplate;
