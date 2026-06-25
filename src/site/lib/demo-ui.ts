import { isDemoContentEnabled } from "@/lib/runtime-env";

/** Shown on admin screens that still use sample / local-only data. */
export function demoModeLabel() {
  return isDemoContentEnabled() ? "Development demo data" : null;
}
