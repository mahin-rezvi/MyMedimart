/*
Simple email test script for this project.
Requires SMTP env vars in .env.local or environment:
  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, TEST_EMAIL_TO
Run:
  node scripts/test-email.js
*/

import nodemailer from 'nodemailer';

process.loadEnvFile?.('.env.local');

async function main() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, TEST_EMAIL_TO, STORE_EMAIL } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.error('Missing SMTP env vars. Please add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS to .env.local');
    process.exit(1);
  }
  const to = TEST_EMAIL_TO || STORE_EMAIL;
  if (!to) {
    console.error('Please set TEST_EMAIL_TO or STORE_EMAIL in .env.local to receive the test email.');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: STORE_EMAIL || SMTP_USER,
    to,
    subject: 'Medimart — Test email',
    text: 'This is a test email from Medimart. If you received this, SMTP is configured correctly.',
  });

  console.log('Message sent:', info.messageId || info);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
