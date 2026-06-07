/**
 * Email templates (P5 / Resend).
 *
 * Pure functions: each returns a fully rendered { subject, html, text }
 * with no I/O, so they are snapshot-testable and provider-agnostic. The
 * sender (lib/email/client.ts) decides how to deliver them.
 *
 * Copy rule: no em-dashes or en-dashes anywhere (hard ban). Warm-earth
 * palette inline because email clients ignore external CSS. System font
 * stack because Geist/Fraunces are not available in mail clients.
 */

export interface EmailMessage {
  subject: string;
  html: string;
  text: string;
}

const COLORS = {
  cream: "#F8F2E3",
  surface: "#FFFFFF",
  ink: "#473C33",
  inkMuted: "#7A6E62",
  sage: "#ABC270",
  sageDeep: "#7F9B45",
  orange: "#FDA769",
  line: "#EADFC8",
};

/** Format an integer rupee amount the Indian way (no decimals). */
export function inr(value: number): string {
  return `Rs.${Math.round(value).toLocaleString("en-IN")}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Shared shell: warm header, white card, muted footer. */
function layout(opts: {
  heading: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaHref?: string;
}): string {
  const cta =
    opts.ctaLabel && opts.ctaHref
      ? `<tr><td style="padding-top:24px;">
           <a href="${opts.ctaHref}" style="display:inline-block;background:${COLORS.orange};color:${COLORS.ink};text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px;">${escapeHtml(opts.ctaLabel)}</a>
         </td></tr>`
      : "";
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:${COLORS.cream};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${COLORS.ink};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.cream};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
        <tr><td style="padding:0 4px 20px;font-size:18px;font-weight:700;letter-spacing:-0.01em;color:${COLORS.ink};">Stuviora</td></tr>
        <tr><td style="background:${COLORS.surface};border:1px solid ${COLORS.line};border-radius:20px;padding:28px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="font-size:22px;font-weight:700;line-height:1.25;color:${COLORS.ink};">${escapeHtml(opts.heading)}</td></tr>
            <tr><td style="padding-top:14px;font-size:15px;line-height:1.6;color:${COLORS.inkMuted};">${opts.bodyHtml}</td></tr>
            ${cta}
          </table>
        </td></tr>
        <tr><td style="padding:18px 4px 0;font-size:12px;color:${COLORS.inkMuted};">
          Hire students. Trust the platform. You are receiving this because you have a Stuviora account.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

const APP = "https://stuviora.com";

// --- The five core transactional templates ---------------------------------

export function welcomeEmail(p: { name: string }): EmailMessage {
  const subject = "Welcome to Stuviora";
  const bodyHtml = `Hi ${escapeHtml(p.name)},<br><br>You are in. Stuviora connects verified college students with real paid work, and every delivery passes our AI quality check before a client sees it. Build your profile, add one work sample, and we will start matching you to jobs that fit.`;
  const text = `Hi ${p.name},\n\nYou are in. Stuviora connects verified college students with real paid work, and every delivery passes our AI quality check before a client sees it. Build your profile, add one work sample, and we will start matching you to jobs that fit.\n\nBuild your profile: ${APP}/student/onboarding`;
  return {
    subject,
    text,
    html: layout({
      heading: "Welcome to Stuviora.",
      bodyHtml,
      ctaLabel: "Build your profile",
      ctaHref: `${APP}/student/onboarding`,
    }),
  };
}

export function collegeVerifyEmail(p: { name: string; code: string }): EmailMessage {
  const subject = `Your Stuviora verification code: ${p.code}`;
  const bodyHtml = `Hi ${escapeHtml(p.name)},<br><br>Use this code to verify your college email. It is valid for 10 minutes.<br><br><span style="font-size:30px;font-weight:700;letter-spacing:0.18em;color:${COLORS.ink};">${escapeHtml(p.code)}</span><br><br>If you did not request this, you can ignore this email.`;
  const text = `Hi ${p.name},\n\nYour Stuviora verification code is ${p.code}. It is valid for 10 minutes.\n\nIf you did not request this, you can ignore this email.`;
  return { subject, text, html: layout({ heading: "Verify your email.", bodyHtml }) };
}

export function orderHiredEmail(p: {
  studentName: string;
  jobTitle: string;
  amount: number;
  orderId: string;
}): EmailMessage {
  const subject = `You are hired: ${p.jobTitle}`;
  const bodyHtml = `Hi ${escapeHtml(p.studentName)},<br><br>A client just hired you for "${escapeHtml(p.jobTitle)}". The payment of ${inr(p.amount)} is held in escrow, so you can start with confidence. You keep 85% on approval.`;
  const text = `Hi ${p.studentName},\n\nA client just hired you for "${p.jobTitle}". The payment of ${inr(p.amount)} is held in escrow, so you can start with confidence. You keep 85% on approval.\n\nOpen the order: ${APP}/student/orders/${p.orderId}`;
  return {
    subject,
    text,
    html: layout({
      heading: "You are hired.",
      bodyHtml,
      ctaLabel: "Open the order",
      ctaHref: `${APP}/student/orders/${p.orderId}`,
    }),
  };
}

export function orderSubmittedEmail(p: {
  clientName: string;
  jobTitle: string;
  orderId: string;
}): EmailMessage {
  const subject = `Delivery ready for review: ${p.jobTitle}`;
  const bodyHtml = `Hi ${escapeHtml(p.clientName)},<br><br>Your freelancer submitted the delivery for "${escapeHtml(p.jobTitle)}". It passed our AI quality check. Review and approve to release payment, or request a revision. If you do not respond within 72 hours, payment auto-releases.`;
  const text = `Hi ${p.clientName},\n\nYour freelancer submitted the delivery for "${p.jobTitle}". It passed our AI quality check. Review and approve to release payment, or request a revision. If you do not respond within 72 hours, payment auto-releases.\n\nReview the delivery: ${APP}/client/orders/${p.orderId}`;
  return {
    subject,
    text,
    html: layout({
      heading: "A delivery is ready.",
      bodyHtml,
      ctaLabel: "Review the delivery",
      ctaHref: `${APP}/client/orders/${p.orderId}`,
    }),
  };
}

export function payoutSettledEmail(p: {
  studentName: string;
  amount: number;
  orderTitle: string;
}): EmailMessage {
  const subject = `Payout settled: ${inr(p.amount)}`;
  const bodyHtml = `Hi ${escapeHtml(p.studentName)},<br><br>Nice work. Your payout of ${inr(p.amount)} for "${escapeHtml(p.orderTitle)}" has settled to your wallet. Withdraw to your bank or UPI any time once the balance clears.`;
  const text = `Hi ${p.studentName},\n\nNice work. Your payout of ${inr(p.amount)} for "${p.orderTitle}" has settled to your wallet. Withdraw to your bank or UPI any time once the balance clears.\n\nView earnings: ${APP}/student/earnings`;
  return {
    subject,
    text,
    html: layout({
      heading: "You got paid.",
      bodyHtml,
      ctaLabel: "View earnings",
      ctaHref: `${APP}/student/earnings`,
    }),
  };
}

// --- Retention templates ---------------------------------------------------

export function weeklyDigestEmail(p: {
  name: string;
  completedCount: number;
  earned: number;
  newMatches: number;
}): EmailMessage {
  const subject = "Your week on Stuviora";
  const bodyHtml = `Hi ${escapeHtml(p.name)},<br><br>Here is your week: ${p.completedCount} order(s) completed, ${inr(p.earned)} earned, and ${p.newMatches} new job match(es) waiting. Keep the momentum going.`;
  const text = `Hi ${p.name},\n\nHere is your week: ${p.completedCount} order(s) completed, ${inr(p.earned)} earned, and ${p.newMatches} new job match(es) waiting. Keep the momentum going.\n\nSee your matches: ${APP}/student/matches`;
  return {
    subject,
    text,
    html: layout({
      heading: "Your week on Stuviora.",
      bodyHtml,
      ctaLabel: "See your matches",
      ctaHref: `${APP}/student/matches`,
    }),
  };
}

export function matchAlertEmail(p: {
  name: string;
  jobTitle: string;
  matchScore: number;
  jobId: string;
}): EmailMessage {
  const subject = `New match: ${p.jobTitle}`;
  const bodyHtml = `Hi ${escapeHtml(p.name)},<br><br>A new job looks like a strong fit for you: "${escapeHtml(p.jobTitle)}" (match score ${Math.round(p.matchScore)}). Early proposals win more often, so take a look while it is fresh.`;
  const text = `Hi ${p.name},\n\nA new job looks like a strong fit for you: "${p.jobTitle}" (match score ${Math.round(p.matchScore)}). Early proposals win more often, so take a look while it is fresh.\n\nView the job: ${APP}/student/jobs/${p.jobId}`;
  return {
    subject,
    text,
    html: layout({
      heading: "A job that fits you.",
      bodyHtml,
      ctaLabel: "View the job",
      ctaHref: `${APP}/student/jobs/${p.jobId}`,
    }),
  };
}
