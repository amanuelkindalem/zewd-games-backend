const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  // If SMTP isn't configured, return null — server still works, just skips email
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("⚠️  SMTP not configured — email notifications are disabled.");
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // true for port 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

/**
 * Sends a notification email when a new contact lead is submitted.
 * Fails silently (logs only) so a broken mail config never blocks the API response.
 */
async function sendContactNotification(lead) {
  const t = getTransporter();
  if (!t) return;

  const to = process.env.NOTIFY_EMAIL || process.env.SMTP_USER;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2 style="color:#7c3aed;">New Contact Form Submission — Zewd Games</h2>
      <table cellpadding="8" style="border-collapse: collapse; width: 100%;">
        <tr><td><strong>Name</strong></td><td>${escapeHtml(lead.name)}</td></tr>
        <tr><td><strong>Company</strong></td><td>${escapeHtml(lead.company || "—")}</td></tr>
        <tr><td><strong>Email</strong></td><td>${escapeHtml(lead.email)}</td></tr>
        <tr><td><strong>Language</strong></td><td>${escapeHtml(lead.language || "en")}</td></tr>
        <tr><td valign="top"><strong>Message</strong></td><td>${escapeHtml(lead.message).replace(/\n/g, "<br/>")}</td></tr>
        <tr><td><strong>Submitted</strong></td><td>${new Date(lead.createdAt).toLocaleString()}</td></tr>
      </table>
    </div>
  `;

  try {
    await t.sendMail({
      from: `"Zewd Games Website" <${process.env.SMTP_USER}>`,
      to,
      replyTo: lead.email,
      subject: `New Lead: ${lead.name}${lead.company ? " — " + lead.company : ""}`,
      html,
    });
    console.log(`📧 Notification email sent for lead ${lead._id}`);
  } catch (err) {
    console.error("❌ Failed to send notification email:", err.message);
  }
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

module.exports = { sendContactNotification };
