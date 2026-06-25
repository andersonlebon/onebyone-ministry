/** Turn raw provider errors into actionable messages for admins. */
export function formatEmailSendError(raw: string | undefined) {
  if (!raw) {
    return "The email could not be sent. Check your email provider settings and try again.";
  }

  if (raw.includes("unrecognised IP address") || raw.includes("authorized_ips")) {
    return "Brevo blocked Vercel's rotating IP on the REST API. Add BREVO_SMTP_USER and BREVO_SMTP_KEY in Vercel (recommended), or turn off Brevo Authorized IPs under Security → Authorized IPs.";
  }

  if (raw.includes("Brevo responded 401")) {
    return "Brevo rejected the API request (401). Check BREVO_API_KEY in Vercel and that your sender domain is verified in Brevo.";
  }

  return raw;
}
