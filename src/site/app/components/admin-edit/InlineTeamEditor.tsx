"use client";

import type { ReactNode } from "react";
import { InlinePeopleEditor } from "./InlinePeopleEditor";

/** @deprecated Prefer InlinePeopleEditor with list="team" */
export function InlineTeamEditor({ children }: { children: ReactNode }) {
  return <InlinePeopleEditor list="team">{children}</InlinePeopleEditor>;
}

