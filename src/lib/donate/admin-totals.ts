import type { Donation } from "@/lib/site-content/types";

export function isCountedDonation(donation: Donation) {
  return donation.status === "approved" || donation.status === "completed";
}

export function totalRaised(donations: Donation[]) {
  return donations
    .filter(isCountedDonation)
    .reduce((total, donation) => total + donation.amount, 0);
}

/** Count each Stripe subscription once even though every paid renewal is a ledger row. */
export function monthlyRecurringTotal(donations: Donation[]) {
  const subscriptions = new Set<string>();
  return donations
    .filter((donation) => donation.frequency === "monthly" && isCountedDonation(donation))
    .reduce((total, donation) => {
      const key = donation.stripeSubscriptionId;
      if (key) {
        if (subscriptions.has(key)) return total;
        subscriptions.add(key);
      }
      return total + donation.amount;
    }, 0);
}
