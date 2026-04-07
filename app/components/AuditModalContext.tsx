"use client";

import { createContext, useContext } from "react";

/**
 * Lightweight context so any component on any page can open
 * the Visibility Audit modal without prop-drilling.
 *
 * Usage:
 *   const openAudit = useOpenAudit();
 *   <button onClick={openAudit}>Get your audit</button>
 */

const AuditModalContext = createContext<(() => void) | null>(null);

export const AuditModalProvider = AuditModalContext.Provider;

export function useOpenAudit(): () => void {
  const open = useContext(AuditModalContext);
  if (!open) {
    throw new Error("useOpenAudit must be used within an AuditModalProvider");
  }
  return open;
}
