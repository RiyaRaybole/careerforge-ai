import nodemailer from "nodemailer";

// Builds a reusable SMTP transporter from env vars.
// Works with any SMTP provider (Gmail App Password, SendGrid, Mailtrap, etc).
const getTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null; // email not configured — caller should skip sending
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Sends an email. Fails silently (logs only) so a broken SMTP config never
// breaks signup or resume upload — email is a nice-to-have, not critical path.
export const sendEmail = async ({ to, subject, html }) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[email skipped — SMTP not configured] Would have sent "${subject}" to ${to}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"CareerForge AI" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("Email send failed:", err.message);
  }
};

export const sendWelcomeEmail = (to, name) =>
  sendEmail({
    to,
    subject: "Welcome to CareerForge AI 🚀",
    html: `<p>Hi ${name},</p><p>Welcome to CareerForge AI! Upload your resume to get started with AI-powered career insights.</p>`,
  });

export const sendResumeUploadedEmail = (to, name) =>
  sendEmail({
    to,
    subject: "Resume uploaded successfully",
    html: `<p>Hi ${name},</p><p>Your resume was uploaded and processed. Head to your dashboard to run AI analysis.</p>`,
  });
