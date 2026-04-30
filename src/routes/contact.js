const express = require('express');
const nodemailer = require('nodemailer');

const router = express.Router();

const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'dropiqofficial@gmail.com';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'DropIQ';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function createTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('EMAIL_USER and EMAIL_PASS must be configured in .env');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

router.post('/', async (req, res) => {
  const name = String(req.body.name || '').replace(/[\r\n]+/g, ' ').trim();
  const email = String(req.body.email || '').replace(/[\r\n]+/g, '').trim().toLowerCase();
  const message = String(req.body.message || '').trim();

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Name, email, and message are required.' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
  }

  if (message.length > 5000) {
    return res.status(400).json({ success: false, error: 'Message is too long. Please keep it under 5000 characters.' });
  }

  try {
    const transporter = createTransporter();
    const from = `"${EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`;
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message);

    await transporter.sendMail({
      from,
      to: CONTACT_TO_EMAIL,
      replyTo: `"${name}" <${email}>`,
      subject: `New DropIQ contact message from ${name}`,
      text: [
        'New contact form submission',
        '',
        `Name: ${name}`,
        `Email: ${email}`,
        '',
        'Message:',
        message,
      ].join('\n'),
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1e293b">
          <h2 style="margin:0 0 16px">New DropIQ contact message</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space:pre-wrap">${safeMessage}</p>
        </div>
      `,
    });

    await transporter.sendMail({
      from,
      to: email,
      subject: 'Thank you for contacting DropIQ',
      text: [
        `Hi ${name},`,
        '',
        'Thank you for reaching out to DropIQ. We have received your message and our team will review it shortly.',
        '',
        'We will get back to you within 2 working days.',
        '',
        'Best regards,',
        'Team DropIQ',
      ].join('\n'),
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1e293b">
          <h2 style="margin:0 0 16px;color:#10b981">Thank you for contacting DropIQ</h2>
          <p>Hi ${safeName},</p>
          <p>Thank you for reaching out to DropIQ. We have received your message and our team will review it shortly.</p>
          <p>We will get back to you within <strong>2 working days</strong>.</p>
          <p style="margin-top:24px">Best regards,<br/>Team DropIQ</p>
        </div>
      `,
    });

    res.json({ success: true, message: 'Message sent successfully.' });
  } catch (error) {
    console.error('Contact email error:', error);
    res.status(500).json({ success: false, error: 'Failed to send message. Please try again later.' });
  }
});

module.exports = router;
