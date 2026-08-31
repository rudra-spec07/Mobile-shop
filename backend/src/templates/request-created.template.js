/**
 * Service Request Created Email Template
 */
const getRequestCreatedTemplate = ({ userName, requestSubject, itemName, quantity, price }) => {
  const subject = `Mobile-Adda — Service Request Created (${itemName || requestSubject || 'Request'})`;
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
        .details-card { background-color: #eff6ff; border: 1px solid #dbeafe; padding: 16px; border-radius: 12px; margin: 16px 0; color: #1e40af; }
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
          <p>Your service request has been submitted successfully!</p>
          <div class="details-card">
            <p style="margin: 4px 0;"><strong>Item / Subject:</strong> ${itemName || requestSubject || 'Service Request'}</p>
            <p style="margin: 4px 0;"><strong>Quantity:</strong> ${quantity || 1}</p>
            ${price ? `<p style="margin: 4px 0;"><strong>Estimated Amount:</strong> ₹${price}</p>` : ''}
            <p style="margin: 4px 0;"><strong>Status:</strong> PENDING (Awaiting Confirmation)</p>
          </div>
          <p>Our administrators are reviewing your request and will confirm stock and pricing shortly.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Mobile-Adda. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `Hello ${userName || 'Customer'},\n\nYour service request "${itemName || requestSubject}" has been submitted successfully (Status: PENDING). We will confirm your request shortly.`;

  return { subject, html, text };
};

module.exports = getRequestCreatedTemplate;
