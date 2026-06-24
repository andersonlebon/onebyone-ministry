function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const BRAND_GREEN = "#6E9277";
const BRAND_CREAM = "#EFE7DB";

function emailShell(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:${BRAND_CREAM};font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_CREAM};padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e3d9ce;">
        <tr><td style="background:${BRAND_GREEN};padding:20px 28px;">
          <p style="margin:0;color:#ffffff;font-size:18px;font-weight:bold;">One By One Ministries</p>
        </td></tr>
        <tr><td style="padding:28px;color:#474747;font-size:15px;line-height:1.6;">
          ${body}
        </td></tr>
        <tr><td style="padding:16px 28px 24px;border-top:1px solid #e3d9ce;color:#7a7068;font-size:12px;">
          One By One Ministries · onebyoneministries.com
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
