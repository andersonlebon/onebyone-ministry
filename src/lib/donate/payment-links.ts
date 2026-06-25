import type { FinanceDetails } from "@/lib/site-content/types";

import { formatDonationAmount, parseDonationAmount } from "./amount";

export function getMobileGivingValue(finance: FinanceDetails, label: string) {
  return finance.mobileGiving.find((row) => row.label === label)?.value.trim() ?? "";
}

export function venmoPayUrl(
  handle: string,
  amount: string,
  note = "Donation to One By One Ministries",
  frequency?: string
) {
  const username = handle.replace(/^@/, "").trim();
  const parsed = parseDonationAmount(amount);
  const memo =
    frequency === "monthly" ? `Monthly ${note.toLowerCase()}` : note;
  const params = new URLSearchParams({ txn: "pay", note: memo });
  if (parsed) params.set("amount", formatDonationAmount(parsed));
  return `https://venmo.com/${encodeURIComponent(username)}?${params.toString()}`;
}

export function cashAppPayUrl(cashtag: string, amount: string) {
  const tag = cashtag.replace(/^\$/, "").trim();
  const parsed = parseDonationAmount(amount);
  if (!parsed) return `https://cash.app/$${encodeURIComponent(tag)}`;
  return `https://cash.app/$${encodeURIComponent(tag)}/${formatDonationAmount(parsed)}`;
}

export function zelleReceiptMailto(financeEmail: string, amount: string) {
  const parsed = parseDonationAmount(amount);
  const subject = encodeURIComponent("Zelle donation receipt request");
  const body = encodeURIComponent(
    parsed
      ? `Hello,\n\nI sent a $${formatDonationAmount(parsed)} Zelle donation to One By One Ministries.\n\nName:\nEmail:\nDate sent:\n\nThank you!`
      : "Hello,\n\nI sent a Zelle donation to One By One Ministries. Please send a tax receipt.\n\nName:\nEmail:\nAmount:\nDate sent:\n\nThank you!"
  );
  return `mailto:${financeEmail}?subject=${subject}&body=${body}`;
}

export function financeReceiptMailto(
  financeEmail: string,
  method: string,
  amount: string,
  extra = ""
) {
  const parsed = parseDonationAmount(amount);
  const subject = encodeURIComponent(`${method} donation receipt request`);
  const body = encodeURIComponent(
    `Hello,\n\nI gave via ${method}${parsed ? ` ($${formatDonationAmount(parsed)})` : ""}.\n\nName:\nEmail:\nTransaction details:\n${extra}\n\nPlease send a tax receipt.\n\nThank you!`
  );
  return `mailto:${financeEmail}?subject=${subject}&body=${body}`;
}

export function bankDetailsText(finance: FinanceDetails) {
  return finance.bankTransfer
    .filter((row) => row.value.trim())
    .map((row) => `${row.label}: ${row.value}`)
    .join("\n");
}

export function hasBankDetails(finance: FinanceDetails) {
  return finance.bankTransfer.some((row) => row.value.trim());
}

export function hasCheckDetails(finance: FinanceDetails) {
  return Boolean(finance.checkByMail.payableTo.trim() || finance.checkByMail.mailingAddress.trim());
}

export function hasCryptoDetails(finance: FinanceDetails) {
  return finance.crypto.some((item) => item.address.trim());
}

export function hasDafDetails(finance: FinanceDetails) {
  return Boolean(finance.donorAdvisedFund.searchName.trim() || finance.donorAdvisedFund.ein.trim());
}

export function hasMobileGivingDetails(finance: FinanceDetails) {
  return finance.mobileGiving.some((row) => row.value.trim());
}

export function hasAlternativeGivingDetails(finance: FinanceDetails) {
  return (
    hasCheckDetails(finance) ||
    hasCryptoDetails(finance) ||
    hasDafDetails(finance) ||
    Boolean(finance.stockAndSecurities.note.trim())
  );
}
