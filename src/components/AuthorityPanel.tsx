import { useState } from "react";
import { Modal } from "./ui";
import "./authority.css";

/** Visible, auditable permission context for high-impact Super Admin actions. */
export function AuthorityPanel({ area, permissions, auditRef }: { area: string; permissions: string[]; auditRef: string }) {
  const [open, setOpen] = useState(false);
  return <><button type="button" className="authority-chip" onClick={() => setOpen(true)} title="View active Super Admin permissions"><i className="bi bi-shield-lock-fill"/>Tier 0 authority</button><Modal open={open} onClose={() => setOpen(false)} title="Authority & audit scope" subtitle={`${area} · Super Admin session`} icon="bi-shield-lock" tone="violet" footer={<button className="btn btn-primary" onClick={() => setOpen(false)}>Acknowledged</button>}><div className="p-4"><div className="authority-modal-banner"><i className="bi bi-patch-check-fill"/><div><b>Joseph Mwangi · Super Admin</b><span>Session is verified with passkey + TOTP. Privileged actions require a retained reason.</span></div></div><p className="pm-eyebrow mt-4 mb-2">Effective permissions</p><div className="authority-list">{permissions.map(p=><div key={p}><i className="bi bi-check-circle-fill"/>{p}</div>)}</div><div className="alert alert-info small mt-3 mb-0"><i className="bi bi-journal-check me-1"/>Every action is written to immutable audit chain <b>{auditRef}</b>, including source IP, session ID and before/after state.</div></div></Modal></>;
}
