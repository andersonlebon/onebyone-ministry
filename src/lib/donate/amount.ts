export function parseDonationAmount(raw: string): number | null {
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 1) return null;
  return Math.round(value * 100) / 100;
}

export function formatDonationAmount(amount: number) {
  return amount % 1 === 0 ? String(amount) : amount.toFixed(2);
}
