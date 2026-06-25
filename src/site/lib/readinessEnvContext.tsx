"use client";

import { createContext, useContext } from "react";

import type { PaymentEnvStatus } from "@/lib/donate/payment-env-types";

const DEFAULT_ENV: PaymentEnvStatus = { stripeKeys: false, stripeWebhook: false };

const ReadinessEnvContext = createContext<PaymentEnvStatus>(DEFAULT_ENV);

export function ReadinessEnvProvider({
  value,
  children,
}: {
  value: PaymentEnvStatus;
  children: React.ReactNode;
}) {
  return <ReadinessEnvContext.Provider value={value}>{children}</ReadinessEnvContext.Provider>;
}

export function useReadinessEnv() {
  return useContext(ReadinessEnvContext);
}
