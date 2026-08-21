import "server-only";

import { getSiteContentValue } from "@/lib/db/site-content";
import { getCanonicalSiteUrl, adminDashboardPath } from "@/lib/site-url";
import { SITE_CONTENT_KEYS } from "@/lib/site-content/keys";
import type { FinanceDetails } from "@/lib/site-content/types";
import type { Donation } from "@/lib/site-content/types";
import { CONTACT_INBOX, getEmailProvider } from "@/services/email";
import {
  donationStaffNotificationEmail,
  donationThankYouEmail,
} from "@/services/email/templates";

function uniqueEmails(values: Array<string | undefined | null>) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const email = value?.trim().toLowerCase();
    if (!email || seen.has(email)) continue;
    seen.add(email);
    out.push(email);
  }
  return out;
}

async function adminRecipients(): Promise<string[]> {
  const configured = process.env.DONATION_ADMIN_INBOX?.trim();
  if (configured) {
    return uniqueEmails(configured.split(",").map((entry) => entry.trim()));
  }

  let financeEmail: string | undefined;
  try {
    const finance = await getSiteContentValue<FinanceDetails>(SITE_CONTENT_KEYS.finance);
    financeEmail = finance?.financeEmail;
  } catch (error) {
    console.warn("[donation-email] Could not load finance email:", error);
  }

  return uniqueEmails([CONTACT_INBOX, financeEmail]);
}

/** Send donor thank-you and staff alert after a newly recorded card gift. */
export async function sendDonationNotifications(donation: Donation) {
  const provider = getEmailProvider();
  const siteUrl = getCanonicalSiteUrl();
  const adminUrl = `${siteUrl}${adminDashboardPath()}`;

  const thankYou = donationThankYouEmail({
    name: donation.name,
    amount: donation.amount,
    frequency: donation.frequency,
    siteUrl,
  });

  const donorResult = await provider.send({
    to: donation.email,
    subject: thankYou.subject,
    html: thankYou.html,
    text: thankYou.text,
  });

  if (!donorResult.ok) {
    console.error("[donation-email] Donor thank-you failed:", donorResult.error);
  }

  const staffTemplate = donationStaffNotificationEmail({
    donation,
    adminUrl,
  });
  const recipients = await adminRecipients();

  for (const to of recipients) {
    const staffResult = await provider.send({
      to,
      replyTo: donation.email,
      subject: staffTemplate.subject,
      html: staffTemplate.html,
      text: staffTemplate.text,
    });

    if (!staffResult.ok) {
      console.error("[donation-email] Staff alert failed:", { to, error: staffResult.error });
    }
  }
}
