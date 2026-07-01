import nodemailer from "nodemailer";

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    const user = process.env.SMTP_USER || process.env.SUPER_ADMIN_EMAIL;
    const pass = process.env.SMTP_PASS || process.env.PASS_KEY;
    transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST || "smtp.gmail.com",
      port:   parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: user && pass ? { user, pass } : undefined,
    });
  }
  return transporter;
};

/**
 * sendEmail({ to, subject, html, text })
 * Returns { sent: true, info } or { sent: false, reason }
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  const user = process.env.SMTP_USER || process.env.SUPER_ADMIN_EMAIL;
  const pass = process.env.SMTP_PASS || process.env.PASS_KEY;
  if (!user || !pass) {
    console.warn(`[email] SMTP not configured — skipped email to ${to}`);
    return { sent: false, reason: "SMTP not configured" };
  }

  try {
    const t = getTransporter();
    const info = await t.sendMail({
      from: process.env.EMAIL_FROM || "RestaurantOS <no-reply@restaurantos.com>",
      to,
      subject,
      html,
      text: text || html?.replace(/<[^>]*>/g, ""),
    });
    return { sent: true, info };
  } catch (err) {
    console.warn(`[email] Failed to send to ${to}:`, err.message);
    return { sent: false, reason: err.message };
  }
};
