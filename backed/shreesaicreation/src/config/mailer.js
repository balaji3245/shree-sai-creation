import nodemailer from 'nodemailer';
import logger from '../utilities/logger.js';

let transporter = null;

export function isMailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);
}

export function isMailMock() {
  return (
    String(process.env.MAIL_MOCK || '').toLowerCase() === 'true' ||
    !isMailConfigured()
  );
}

function getTransporter() {
  if (isMailMock()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || 'false') === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

export async function sendMail({ to, subject, html, text }) {
  if (!to) {
    logger.warn({ subject }, 'Email skipped — no recipient');
    return { skipped: true };
  }

  if (isMailMock()) {
    logger.info({ to, subject }, 'Mock email (MAIL_MOCK or SMTP not configured)');
    return { mocked: true, to, subject };
  }

  const from =
    process.env.MAIL_FROM ||
    `"Shree Sai Creation" <${process.env.SMTP_USER}>`;

  const info = await getTransporter().sendMail({
    from,
    to,
    subject,
    html,
    text: text || html?.replace(/<[^>]+>/g, ' '),
  });

  logger.info({ to, subject, messageId: info.messageId }, 'Email sent');
  return info;
}

export default { sendMail, isMailConfigured, isMailMock };
