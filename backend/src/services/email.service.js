const nodemailer = require('nodemailer');
const env = require('../config/env');

// Email Templates
const getPasswordResetTemplate = require('../templates/password-reset.template');
const getAccountCreatedTemplate = require('../templates/account-created.template');
const getEnquiryCreatedTemplate = require('../templates/enquiry-created.template');
const getEnquiryResponseTemplate = require('../templates/enquiry-response.template');
const getRequestCreatedTemplate = require('../templates/request-created.template');
const getRequestStatusTemplate = require('../templates/request-status.template');

/**
 * Configure Nodemailer Transport or Development Console Fallback
 */
const createTransporter = () => {
  if (env.EMAIL_HOST && env.EMAIL_USER && env.EMAIL_PASSWORD) {
    return nodemailer.createTransport({
      host: env.EMAIL_HOST,
      port: env.EMAIL_PORT ? parseInt(env.EMAIL_PORT, 10) : 587,
      secure: env.EMAIL_PORT === '465',
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASSWORD,
      },
    });
  }
  return null; // Development fallback
};

const transporter = createTransporter();

/**
 * Primary Core Email Dispatch Function
 * Safe, isolated, and failure-tolerant
 */
const sendEmail = async ({ to, subject, html, text }) => {
  if (!to || !to.includes('@')) {
    return {
      success: false,
      error: 'Invalid recipient email address',
    };
  }

  const from = env.EMAIL_FROM || env.EMAIL_USER || 'no-reply@mobileadda.shop';

  // Real Transporter Dispatch
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `Mobile-Adda <${from}>`,
        to,
        subject,
        html,
        text,
      });
      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (err) {
      // Sanitize error message to prevent secret/credential leakage
      const sanitizedError = (err.message || 'Email delivery failed')
        .replace(/pass(word)?\s*=\s*[^\s]+/gi, 'password=***')
        .replace(/auth\s*:\s*\{[^}]+\}/gi, 'auth:{***}');

      return {
        success: false,
        error: sanitizedError,
      };
    }
  }

  // Development Fallback Dispatch Mode
  console.log(`\n📧 [DEV EMAIL FALLBACK] Email dispatch simulated:`);
  console.log(`   To: ${to}`);
  console.log(`   Subject: ${subject}`);
  console.log(`   Status: Simulated Success (Configure EMAIL_HOST in .env for real SMTP)\n`);

  return {
    success: true,
    messageId: `dev-simulated-${Date.now()}`,
  };
};

/**
 * Password Reset Email Dispatcher
 */
const sendPasswordResetEmail = async ({ to, userName, resetUrl }) => {
  const { subject, html, text } = getPasswordResetTemplate({ userName, resetUrl });
  return sendEmail({ to, subject, html, text });
};

/**
 * Account Created Welcome Email Dispatcher
 */
const sendAccountCreatedEmail = async ({ to, userName }) => {
  const { subject, html, text } = getAccountCreatedTemplate({ userName });
  return sendEmail({ to, subject, html, text });
};

/**
 * Enquiry Created Email Dispatcher
 */
const sendEnquiryCreatedEmail = async ({ to, userName, enquirySubject, message }) => {
  const { subject, html, text } = getEnquiryCreatedTemplate({ userName, enquirySubject, message });
  return sendEmail({ to, subject, html, text });
};

/**
 * Enquiry Response Email Dispatcher
 */
const sendEnquiryResponseEmail = async ({ to, userName, enquirySubject, adminResponse }) => {
  const { subject, html, text } = getEnquiryResponseTemplate({ userName, enquirySubject, adminResponse });
  return sendEmail({ to, subject, html, text });
};

/**
 * Service Request Created Email Dispatcher
 */
const sendRequestCreatedEmail = async ({ to, userName, requestSubject, itemName, quantity, price }) => {
  const { subject, html, text } = getRequestCreatedTemplate({ userName, requestSubject, itemName, quantity, price });
  return sendEmail({ to, subject, html, text });
};

/**
 * Service Request Status Update Email Dispatcher
 */
const sendRequestStatusEmail = async ({ to, userName, requestSubject, itemName, newStatus, adminNotes }) => {
  const { subject, html, text } = getRequestStatusTemplate({ userName, requestSubject, itemName, newStatus, adminNotes });
  return sendEmail({ to, subject, html, text });
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendAccountCreatedEmail,
  sendEnquiryCreatedEmail,
  sendEnquiryResponseEmail,
  sendRequestCreatedEmail,
  sendRequestStatusEmail,
};
