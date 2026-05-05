const nodemailer = require('nodemailer');

const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'DropIQ';

function hasEmailConfig() {
  return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
}

function createTransporter() {
  if (!hasEmailConfig()) {
    throw new Error('EMAIL_USER and EMAIL_PASS must be configured in .env');
  }

  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function sendMail(options) {
  const transporter = createTransporter();
  const from = `"${EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`;
  await transporter.sendMail({ from, ...options });
}

async function sendVerificationOtp({ to, fullName, otp, expiresInMinutes }) {
  if (!hasEmailConfig()) {
    return { sent: false, reason: 'EMAIL_USER and EMAIL_PASS are not configured' };
  }

  const safeName = escapeHtml(fullName || 'there');
  const safeOtp = escapeHtml(otp);

  await sendMail({
    to,
    subject: 'Your DropIQ verification code',
    text: [
      `Hi ${fullName || 'there'},`,
      '',
      `Your DropIQ verification code is ${otp}.`,
      `It expires in ${expiresInMinutes} minutes.`,
      '',
      'If you did not request this, you can ignore this email.',
      '',
      'Team DropIQ',
    ].join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1e293b">
        <h2 style="margin:0 0 16px;color:#10b981">Verify your DropIQ account</h2>
        <p>Hi ${safeName},</p>
        <p>Use this code to finish creating your DropIQ account:</p>
        <div style="font-size:28px;letter-spacing:8px;font-weight:700;margin:24px 0;color:#0f172a">${safeOtp}</div>
        <p>This code expires in <strong>${expiresInMinutes} minutes</strong>.</p>
        <p style="color:#64748b;font-size:13px">If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });

  return { sent: true };
}

module.exports = {
  hasEmailConfig,
  sendMail,
  sendVerificationOtp,
};
