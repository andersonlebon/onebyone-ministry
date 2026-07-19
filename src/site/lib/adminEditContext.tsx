"use client";

import React, { createContext, useContext } from "react";

type AdminEditCtx = {
  canEdit: boolean;
};

const Ctx = createContext<AdminEditCtx>({ canEdit: false });

export function AdminEditProvider({
  canEdit,
  children,
}: {
  canEdit: boolean;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={{ canEdit }}>{children}</Ctx.Provider>;
}

export function useCanInlineEdit() {
  return useContext(Ctx).canEdit;
}
