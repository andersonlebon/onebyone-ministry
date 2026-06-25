function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const BRAND_GREEN = "#6E9277";
const BRAND_GOLD = "#EAC79A";
const BRAND_CREAM = "#EFE7DB";
const BRAND_CHARCOAL = "#474747";
const BRAND_MUTED = "#7a7068";
const BRAND_BORDER = "#e3d9ce";

function getPublicSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.onebyoneministries.org";
}

function getPublicSiteHost() {
  try {
    return new URL(getPublicSiteUrl()).host;
  } catch {
    return "www.onebyoneministries.org";
  }
}

function ctaButton(href: string, label: string) {
  const safeHref = escapeHtml(href);
  const safeLabel = escapeHtml(label);
  return `<table cellpadding="0" cellspacing="0" style="margin:28px 0 8px;">
    <tr>
      <td align="center" style="border-radius:12px;background:${BRAND_GOLD};">
        <a href="${safeHref}" target="_blank" rel="noopener noreferrer"
           style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:${BRAND_CHARCOAL};text-decoration:none;border-radius:12px;">
          ${safeLabel}
        </a>
      </td>
    </tr>
  </table>`;
}

function emailShell(title: string, body: string) {
  const siteUrl = getPublicSiteUrl();
  const siteHost = getPublicSiteHost();
  const logoUrl = `${siteUrl}/assets/brand-transparent/8-web.png`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND_CREAM};font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${BRAND_CREAM};padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid ${BRAND_BORDER};">
        <tr>
          <td style="background:${BRAND_GREEN};padding:24px 28px;text-align:center;">
            <img src="${escapeHtml(logoUrl)}" alt="One By One Ministries" width="160" style="display:block;margin:0 auto 12px;height:auto;max-width:160px;border:0;" />
            <p style="margin:0;color:#ffffff;font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:bold;letter-spacing:0.02em;">One By One Ministries</p>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.82);font-size:12px;letter-spacing:0.08em;text-transform:uppercase;">Admin Portal</p>
          </td>
        </tr>
        <tr><td style="padding:28px;color:${BRAND_CHARCOAL};font-size:15px;line-height:1.65;">
          ${body}
        </td></tr>
        <tr><td style="padding:16px 28px 24px;border-top:1px solid ${BRAND_BORDER};color:${BRAND_MUTED};font-size:12px;line-height:1.5;">
          One By One Ministries · <a href="${escapeHtml(siteUrl)}" style="color:${BRAND_GREEN};text-decoration:none;">${escapeHtml(siteHost)}</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function contactConfirmationEmail(name: string) {
  const safeName = escapeHtml(name);
  const html = emailShell(
    "Message received",
    `<p>Hi ${safeName},</p>
     <p>Thank you for contacting One By One Ministries. We received your message and a member of our team will review it soon.</p>
     <p>We typically respond within 2 to 3 business days.</p>
     <p style="margin-top:24px;color:#7a7068;font-size:13px;">This is an automated confirmation. Please do not reply to this email.</p>`
  );

  const text = `Hi ${name},\n\nThank you for contacting One By One Ministries. We received your message and a member of our team will review it soon.\n\nWe typically respond within 2 to 3 business days.\n\nThis is an automated confirmation. Please do not reply to this email.`;

  return {
    subject: "We received your message — One By One Ministries",
    html,
    text,
  };
}

export function contactStaffNotificationEmail(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
  messageId?: string;
}) {
  const { name, email, subject, message, messageId } = input;
  const html = emailShell(
    "New website contact",
    `<p><strong>New contact form submission</strong></p>
     <p><strong>Name:</strong> ${escapeHtml(name)}</p>
     <p><strong>Email:</strong> ${escapeHtml(email)}</p>
     <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
     <p><strong>Message:</strong></p>
     <p style="white-space:pre-wrap;background:#FAF7F2;padding:16px;border-radius:8px;border:1px solid #e3d9ce;">${escapeHtml(message)}</p>
     ${messageId ? `<p style="font-size:12px;color:#7a7068;">Thread ID: ${escapeHtml(messageId)}</p>` : ""}
     <p style="font-size:13px;color:#7a7068;">Reply directly to this email to reach the visitor.</p>`
  );

  const text = `New contact form submission\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}${messageId ? `\n\nThread ID: ${messageId}` : ""}`;

  return {
    subject: `[Website Contact] ${subject}`,
    html,
    text,
  };
}

export function threadReplyEmail(input: {
  visitorName: string;
  subject: string;
  body: string;
}) {
  const { visitorName, subject, body } = input;
  const safeName = escapeHtml(visitorName);
  const safeBody = escapeHtml(body);

  const html = emailShell(
    "Reply from One By One Ministries",
    `<p>Hi ${safeName},</p>
     <p>A member of the One By One Ministries team has replied to your message regarding <strong>${escapeHtml(subject)}</strong>:</p>
     <p style="white-space:pre-wrap;background:#FAF7F2;padding:16px;border-radius:8px;border:1px solid #e3d9ce;">${safeBody}</p>
     <p style="margin-top:24px;font-size:13px;color:#7a7068;">You can reply to this email and your message will reach our team at ${escapeHtml(CONTACT_INBOX_PLACEHOLDER)}.</p>`
  );

  const text = `Hi ${visitorName},\n\nA member of the One By One Ministries team has replied to your message regarding "${subject}":\n\n${body}\n\nYou can reply to this email and your message will reach our team.`;

  return {
    subject: `Reply from One By One Ministries — Re: ${subject}`,
    html,
    text,
  };
}

const CONTACT_INBOX_PLACEHOLDER = "contact@onebyoneministries.org";

const ADMIN_ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  viewer: "Viewer (read-only)",
};

export function adminInviteEmail(input: {
  name: string;
  email: string;
  role: string;
  inviteUrl: string;
}) {
  const { name, email, role, inviteUrl } = input;
  const safeName = escapeHtml(name.trim() || email.split("@")[0] || "there");
  const roleLabel = ADMIN_ROLE_LABELS[role] ?? "Staff";
  const siteUrl = getPublicSiteUrl();

  const html = emailShell(
    "Admin invitation",
    `<p style="margin-top:0;">Hello ${safeName},</p>
     <p>You have been invited to join the <strong>One By One Ministries</strong> admin portal as a <strong>${escapeHtml(roleLabel)}</strong>.</p>
     <p>Use the button below to accept your invitation, set your password, and sign in. This link is single-use and expires after a short time.</p>
     ${ctaButton(inviteUrl, "Accept invitation & set password")}
     <p style="margin:0 0 12px;font-size:13px;color:${BRAND_MUTED};">If the button does not work, copy and paste this link into your browser:</p>
     <p style="margin:0 0 24px;font-size:12px;line-height:1.5;word-break:break-all;color:${BRAND_GREEN};">${escapeHtml(inviteUrl)}</p>
     <p style="margin:0;font-size:13px;color:${BRAND_MUTED};">After you sign in, you can manage website content, view the inbox, and help serve visitors at <a href="${escapeHtml(siteUrl)}" style="color:${BRAND_GREEN};">${escapeHtml(getPublicSiteHost())}</a>.</p>
     <p style="margin:18px 0 0;font-size:13px;color:${BRAND_MUTED};">If you were not expecting this invitation, you can safely ignore this email.</p>`
  );

  const text = `Hello ${name.trim() || email.split("@")[0] || "there"},

You have been invited to join the One By One Ministries admin portal as a ${roleLabel}.

Accept your invitation and set your password:
${inviteUrl}

This link is single-use and expires after a short time.

If you were not expecting this invitation, you can safely ignore this email.

One By One Ministries
${siteUrl}`;

  return {
    subject: "You're invited to the One By One Ministries admin portal",
    html,
    text,
  };
}
