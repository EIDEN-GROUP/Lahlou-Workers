// Nodemailer transactional notifications. Fire-and-forget from server fns —
// never throws to the caller (logs only) so a mail outage can't break forms.
// If SMTP is not configured (e.g. not yet set in .env), notifications are
// silently skipped — forms keep working.
//
// HTML follows the site design system (README non-negotiables):
// bg #F9F9F9, text #0A0A0A, secondary #8A8A8A, hairlines #D4D4D4,
// dark band #0A0A0A, one accent Lahlou Red #BF1014, sharp corners,
// whitespace + 1px hairlines for structure, no cards/shadows/gradients.

import nodemailer from "nodemailer";
import { SITE } from "@/lib/site";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  const host = process.env["SMTP_HOST"];
  const user = process.env["SMTP_USER"];
  const pass = process.env["SMTP_PASS"];
  if (!host || !user || !pass) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host,
      port: Number(process.env["SMTP_PORT"] ?? "587"),
      secure: process.env["SMTP_SECURE"] === "true",
      auth: { user, pass },
    });
  }
  return transporter;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const SANS = "'Manrope',Arial,Helvetica,sans-serif";
const DISPLAY = "'Archivo','Arial Black',Arial,Helvetica,sans-serif";

function rows(pairs: [string, string][]): string {
  return pairs
    .map(
      ([k, v]) =>
        `<tr>` +
        `<td style="padding:14px 16px 14px 0;vertical-align:top;width:38%;font-family:${SANS};font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#8A8A8A;">${escapeHtml(k)}</td>` +
        `<td style="padding:14px 0;vertical-align:top;font-family:${SANS};font-size:15px;font-weight:600;line-height:1.5;color:#0A0A0A;">${escapeHtml(v || "-")}</td>` +
        `</tr>` +
        `<tr><td colspan="2" style="border-top:1px solid #D4D4D4;font-size:0;line-height:0;">&nbsp;</td></tr>`,
    )
    .join("");
}

function brandedHtml(eyebrow: string, title: string, pairs: [string, string][]): string {
  return (
    `<!doctype html><html lang="fr"><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width,initial-scale=1"></head>` +
    `<body style="margin:0;padding:0;background-color:#F9F9F9;">` +
    `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(title)} - ${escapeHtml(SITE.name)}</div>` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F9F9F9;padding:32px 16px;">` +
    `<tr><td align="center">` +
    `<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">` +
    // Dark header band — wordmark with the single red letter
    `<tr><td style="background-color:#0A0A0A;padding:28px 32px;">` +
    `<div style="font-family:${DISPLAY};font-size:22px;font-weight:900;line-height:1.1;letter-spacing:-0.5px;color:#F9F9F9;">lah<span style="color:#BF1014;">l</span>ou<br>workers</div>` +
    `<div style="margin-top:10px;font-family:${SANS};font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#8A8A8A;">Notification site - ${escapeHtml(SITE.address.city)}</div>` +
    `</td></tr>` +
    // Body
    `<tr><td style="background-color:#F9F9F9;padding:32px;border-left:1px solid #D4D4D4;border-right:1px solid #D4D4D4;border-bottom:1px solid #D4D4D4;">` +
    `<div style="font-family:${SANS};font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#8A8A8A;"><span style="display:inline-block;width:8px;height:8px;background-color:#BF1014;margin-right:8px;"></span>${escapeHtml(eyebrow)}</div>` +
    `<h1 style="margin:14px 0 0;font-family:${DISPLAY};font-size:28px;font-weight:900;line-height:1.05;text-transform:uppercase;color:#0A0A0A;">${escapeHtml(title)}</h1>` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;border-top:1px solid #0A0A0A;">${rows(pairs)}</table>` +
    `</td></tr>` +
    // Footer
    `<tr><td style="padding:20px 4px 0;">` +
    `<div style="font-family:${SANS};font-size:12px;line-height:1.6;color:#8A8A8A;">${escapeHtml(SITE.address.street)}, ${escapeHtml(SITE.address.city)} · ${escapeHtml(SITE.hours)}<br>ICE ${escapeHtml(SITE.ice)} · RC ${escapeHtml(SITE.rc)} · <a href="mailto:${escapeHtml(SITE.email)}" style="color:#0A0A0A;">${escapeHtml(SITE.email)}</a></div>` +
    `</td></tr>` +
    `</table></td></tr></table></body></html>`
  );
}

export async function notifyAdmin(
  subject: string,
  pairs: [string, string][],
  eyebrow = "Nouvelle soumission",
): Promise<void> {
  try {
    const t = getTransporter();
    const to = process.env["MAIL_TO"] ?? process.env["SMTP_USER"];
    const from = process.env["MAIL_FROM"] ?? process.env["SMTP_USER"];
    if (!t || !to || !from) return;
    await t.sendMail({
      from,
      to,
      subject: `[Lahlou Workers] ${subject}`,
      text:
        `${SITE.name} - ${eyebrow}\n${subject}\n\n` +
        pairs.map(([k, v]) => `${k}: ${v || "-"}`).join("\n") +
        `\n\n--\n${SITE.address.street}, ${SITE.address.city}\n${SITE.email}`,
      html: brandedHtml(eyebrow, subject, pairs),
    });
  } catch (e) {
    console.error("[mailer] failed", e);
  }
}
