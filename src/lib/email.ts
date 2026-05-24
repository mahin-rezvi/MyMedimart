import nodemailer from "nodemailer";
import type { SendMailOptions } from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT ?? 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const defaultInvoiceCopyEmail = "mahindra.x01@gmail.com";

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
});

export function getStoreContact() {
  return {
    name: process.env.NEXT_PUBLIC_STORE_NAME || "MediMart",
    email: process.env.STORE_EMAIL || process.env.NEXT_PUBLIC_STORE_EMAIL || smtpUser || "info@medimart.com",
    phone: process.env.STORE_PHONE || "01781452943",
    address: process.env.STORE_ADDRESS || "Dhaka, Bangladesh",
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  };
}

export function getInvoiceCopyEmail() {
  return process.env.INVOICE_COPY_EMAIL || defaultInvoiceCopyEmail;
}

export async function sendMail(options: SendMailOptions) {
  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error("Missing SMTP configuration. Set SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS.");
  }

  return transporter.sendMail({
    from: `${getStoreContact().name} <${getStoreContact().email}>`,
    ...options,
  });
}
