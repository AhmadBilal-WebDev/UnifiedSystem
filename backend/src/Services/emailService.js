import nodemailer from "nodemailer";

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST || "smtp.gmail.com",
      port:   parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

/**
 * sendEmail({ to, subject, html, text })
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  const t = getTransporter();
  const info = await t.sendMail({
    from: process.env.EMAIL_FROM || "RestaurantOS <no-reply@restaurantos.com>",
    to,
    subject,
    html,
    text: text || html?.replace(/<[^>]*>/g, ""),
  });
  return info;
};
