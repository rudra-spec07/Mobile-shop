/**
 * Service Request Status Update Email Template
 */
const getRequestStatusTemplate = ({ userName, requestSubject, itemName, newStatus, adminNotes }) => {
  const statusColors = {
    CONFIRMED: { bg: '#ecfdf5', border: '#a7f3d0', text: '#047857', label: 'CONFIRMED' },
    PROCESSING: { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', label: 'IN PROCESSING' },
    COMPLETED: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', label: 'COMPLETED' },
    CANCELLED: { bg: '#fef2f2', border: '#fecaca', text: '#b91c1c', label: 'CANCELLED' },
  };

  const style = statusColors[newStatus] || { bg: '#f8fafc', border: '#e2e8f0', text: '#334155', label: newStatus };

  const subject = `Mobile-Adda — Request Status Updated: ${style.label} (${itemName || requestSubject || 'Request'})`;

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
        .status-badge { display: inline-block; background-color: ${style.bg}; border: 1px solid ${style.border}; color: ${style.text}; font-weight: 700; padding: 8px 16px; border-radius: 9999px; font-size: 12px; margin: 12px 0; }
        .notes-box { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 10px; font-style: italic; margin-top: 12px; color: #475569; }
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
          <p>The status of your service request regarding <strong>"${itemName || requestSubject || 'Service Request'}"</strong> has been updated:</p>
          <div style="text-align: center;">
            <span class="status-badge">${style.label}</span>
          </div>
          ${adminNotes ? `<div class="notes-box"><strong>Note from Admin:</strong> "${adminNotes}"</div>` : ''}
          <p style="margin-top: 16px;">Log in to your Mobile-Adda dashboard to view progress and details.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Mobile-Adda. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `Hello ${userName || 'Customer'},\n\nYour service request "${itemName || requestSubject}" status has been updated to: ${style.label}.\n${adminNotes ? `Admin Note: ${adminNotes}\n` : ''}\nLog in to your account for full details.`;

  return { subject, html, text };
};

module.exports = getRequestStatusTemplate;
