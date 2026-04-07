"use client";

import { useState } from "react";
import TopNav from "./TopNav";
import VisibilityAuditModal from "./VisibilityAuditModal";
import { AuditModalProvider } from "./AuditModalContext";

/**
 * Client-side shell that owns the audit modal state.
 * Provides AuditModalContext so any descendant can open the modal.
 * Wraps TopNav + modal + page children so the root layout stays a Server Component.
 */
export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [auditOpen, setAuditOpen] = useState(false);
  const openAudit = () => setAuditOpen(true);

  return (
    <AuditModalProvider value={openAudit}>
      <TopNav onAuditClick={openAudit} />
      <VisibilityAuditModal open={auditOpen} onClose={() => setAuditOpen(false)} />
      {children}
    </AuditModalProvider>
  );
}
