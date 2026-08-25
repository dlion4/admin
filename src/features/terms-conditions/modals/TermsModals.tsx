import { useState } from "react";
import { Badge, Modal, Drawer, Steps, useToast } from "../../../components/ui";

/* ============================ 1. Document Detail Drawer ============================ */
export function DocDetailDrawer({ doc, onClose }: { doc: string | null; onClose: () => void }) {
  if (!doc) return null;
  return (
    <Drawer open onClose={onClose} title={`${doc} — Document Detail`} subtitle="Version history, acceptance and publication status" icon="bi-file-earmark-text" wide>
      <div className="pm-card pm-card-pad mb-3">
        <div className="d-flex justify-content-between"><h5>{doc}</h5><Badge tone="green" dot>Active</Badge></div>
        <div className="row g-3 mt-2">{[["Version", "v4.2"], ["Effective", "Aug 1, 2026"], ["Language", "EN + SW"], ["Review cycle", "Quarterly"]].map(x => <div className="col-md-3" key={x[0]}><div className="pm-eyebrow">{x[0]}</div><b className="small">{x[1]}</b></div>)}</div>
      </div>
      <div className="pm-card pm-card-pad mb-3"><h6>Acceptance stats</h6>
        {[["Total users", "148,392"], ["Accepted", "142,456 (96%)"], ["Pending", "5,936"], ["Not accepted", "0"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span>{x[0]}</span><b>{x[1]}</b></div>)}
      </div>
      <div className="pm-card pm-card-pad"><h6>Recent changes</h6>
        {[["v4.2 · Aug 1", "Fee disclosure update; BNPL terms added"], ["v4.1 · Jun 1", "Minor formatting and clarification"], ["v4.0 · Mar 1", "Major — new product terms section"]].map(v => <div className="d-flex justify-content-between py-1 border-bottom small" key={v[0]}><span className="mono text-muted">{v[0]}</span><span>{v[1]}</span></div>)}
      </div>
    </Drawer>
  );
}

/* ============================ 2. Diff Viewer Modal ============================ */
export function DiffViewerModal({ open, doc, onClose }: { open: boolean; doc: string; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`${doc} — Version Diff`} subtitle="Changed sections highlighted side by side" icon="bi-layout-split" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-2 mb-3"><div className="col"><Badge tone="grey">Previous: v4.1</Badge></div><div className="col"><Badge tone="green">Current: v4.2</Badge></div></div>
        <h6>Section 3 — Fees and Disclosures</h6>
        <div className="pm-card pm-card-pad mb-2" style={{ background: "#fef2f2" }}><div className="small text-danger text-decoration-line-through">3.1 PayMo charges a flat fee of 2.0% on all cashout transactions.</div></div>
        <div className="pm-card pm-card-pad mb-2" style={{ background: "#f0fdf4" }}><div className="small text-success fw-bold">3.1 PayMo charges a tiered fee: 1.75% for amounts below KES 10,000 and 2.0% for amounts above KES 10,000.</div></div>
        <h6 className="mt-3">Section 8 — New: BNPL Terms</h6>
        <div className="pm-card pm-card-pad" style={{ background: "#f0fdf4" }}><div className="small text-success fw-bold">NEW SECTION — 8. Buy Now Pay Later (PayLater). This section governs deferred payment services offered through PayMo.</div></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={onClose}>Export diff</button></div>
    </Modal>
  );
}

/* ============================ 3. Acceptance Detail Modal ============================ */
export function AcceptanceDetailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Acceptance Tracking Detail" subtitle="Per-document acceptance breakdown with consent evidence" icon="bi-person-check" tone="green" size="lg">
      <div className="pm-modal-body">
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Document</th><th>Total</th><th>Accepted</th><th>Pending</th><th>Rate</th><th>Last batch</th></tr></thead><tbody>
          {[["Terms of Service v4.2", "148,392", "142,456", "5,936", "96.0%", "Aug 22"], ["Privacy Policy v3.1", "148,392", "140,234", "8,158", "94.5%", "Aug 22"], ["Loan Terms v3.0", "23,400", "22,890", "510", "97.8%", "Aug 15"], ["Card Terms v2.2", "94,310", "91,234", "3,076", "96.7%", "Aug 10"]].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 0 ? "pm-td-strong" : "pm-num"}>{i === 4 ? <Badge tone={c.startsWith("94") ? "amber" : "green"}>{c}</Badge> : c}</td>)}</tr>)}
        </tbody></table></div>
        <h6 className="mt-3">Consent evidence fields</h6>
        {["Timestamp (ISO 8601)", "IP address", "Device fingerprint", "User agent", "Document version accepted", "Acceptance method (checkbox)"].map(f => <div className="d-flex gap-2 align-items-center py-1 border-bottom small" key={f}><i className="bi bi-check-circle-fill text-success" /><span>{f}</span></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={onClose}>Export ledger</button></div>
    </Modal>
  );
}

/* ============================ 4. Re-consent Wizard ============================ */
export function ReconsentWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  if (!open) return null;
  return (
    <Modal open onClose={() => { setStep(0); onClose(); }} title="Send Re-consent Requests" subtitle="Notify users to accept updated legal documents" icon="bi-send" tone="amber" size="lg">
      <Steps current={step} steps={[{ label: "Document", icon: "bi-file-text" }, { label: "Audience", icon: "bi-people" }, { label: "Channel", icon: "bi-broadcast" }, { label: "Review", icon: "bi-check2" }]} />
      <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 25}%` }} /></div>
      <div className="pm-modal-body">
        {step === 0 && <div className="row g-3"><div className="col-12"><label className="form-label">Select document</label><select className="form-select"><option>Terms of Service v4.2 (5,936 pending)</option><option>Privacy Policy v3.1 (8,158 pending)</option><option>Both documents</option></select></div><div className="col-12"><label className="form-label">Version</label><input className="form-control" value="v4.2 — Effective Aug 1, 2026" readOnly /></div></div>}
        {step === 1 && <div className="row g-3"><div className="col-md-6"><label className="form-label">Audience</label><select className="form-select"><option>Users with pending acceptance</option><option>All users</option><option>New users only</option></select></div><div className="col-md-6"><label className="form-label">Estimated recipients</label><input className="form-control" value="5,936 users" readOnly /></div></div>}
        {step === 2 && <div className="row g-3"><div className="col-md-6"><label className="form-label">Channel</label><select className="form-select"><option>Push notification</option><option>Email</option><option>Push + Email</option></select></div><div className="col-md-6"><label className="form-label">Frequency</label><select className="form-select"><option>Once</option><option>Weekly until accepted</option><option>3 attempts then lock</option></select></div></div>}
        {step === 3 && <div>{[["Document", "Terms of Service v4.2"], ["Recipients", "5,936"], ["Channel", "Push notification"], ["Frequency", "Weekly until accepted"], ["Enforcement", "Read-only until accepted"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b>{x[1]}</b></div>)}</div>}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={() => step ? setStep(step - 1) : onClose()}>{step ? "Back" : "Cancel"}</button>{step < 3 ? <button className="btn btn-primary" onClick={() => setStep(step + 1)}>Continue</button> : <button className="btn btn-primary" onClick={() => { setStep(0); push({ kind: "success", title: "Re-consent requests queued" }); onClose(); }}>Send requests</button>}</div>
    </Modal>
  );
}

/* ============================ 5. Regulatory Impact Modal ============================ */
export function RegulatoryImpactModal({ open, regulation, onClose }: { open: boolean; regulation: string; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`${regulation} — Impact Analysis`} subtitle="Legal impact, affected documents and remediation plan" icon="bi-calendar-check" tone="amber" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Deadline", "Oct 2026"], ["Status", "In progress"], ["Impact", "Expanded user rights"], ["Owner", "Legal Counsel"]].map(x => <div className="col-md-3" key={x[0]}><label className="form-label">{x[0]}</label><input className="form-control" value={x[1]} readOnly /></div>)}</div>
        <h6>Affected documents</h6>
        {[["Privacy Policy", "New user rights sections required", "In progress"], ["Terms of Service", "Updated dispute resolution clause", "Planned"], ["Cookie Policy", "Consent mechanism update", "Pending"]].map(d => <div className="d-flex justify-content-between py-1 border-bottom small" key={d[0]}><div><b>{d[0]}</b><div className="pm-td-sub">{d[1]}</div></div><Badge tone={d[2] === "In progress" ? "amber" : "blue"}>{d[2]}</Badge></div>)}
        <div className="mt-3"><label className="form-label">Remediation plan</label><textarea className="form-control" rows={3} defaultValue="1. Draft updated sections for each affected document. 2. Legal Counsel peer review. 3. DPO sign-off. 4. Publish and re-consent." /></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Impact assessment saved" }); onClose(); }}>Save assessment</button></div>
    </Modal>
  );
}

/* ============================ 6. Publish Workflow Modal ============================ */
export function PublishWorkflowModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Publish Workflow" subtitle="Route document through legal review, approval and controlled publication" icon="bi-cloud-upload" tone="blue" size="lg">
      <div className="pm-modal-body">
        <h6>Workflow steps</h6>
        {[["1", "Legal Counsel review", "Completed", "green"], ["2", "Compliance sign-off", "Completed", "green"], ["3", "Super Admin approval", "In progress", "amber"], ["4", "Controlled publication", "Pending", "grey"], ["5", "Re-consent activation", "Pending", "grey"]].map(s => <div className="d-flex align-items-center gap-2 py-2 border-bottom" key={s[0]}><div className={`rounded-circle bg-${s[3]}`} style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>{s[0]}</div><div className="flex-grow-1"><b>{s[1]}</b></div><Badge tone={s[3] as any}>{s[2]}</Badge></div>)}
        <div className="mt-3"><label className="form-label">Approval note</label><textarea className="form-control" rows={2} defaultValue="Fee disclosure update approved by Legal and Compliance." /></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Publication approved" }); onClose(); }}>Approve publication</button></div>
    </Modal>
  );
}

/* ============================ 7. Version Comparison Modal ============================ */
export function VersionComparisonModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Version Comparison" subtitle="Side-by-side comparison of document versions" icon="bi-git" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-2 mb-3"><div className="col"><select className="form-select"><option>v4.1 — Jun 1, 2026</option></select></div><div className="col"><select className="form-select"><option>v4.2 — Aug 1, 2026</option></select></div></div>
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Section</th><th>v4.1</th><th>v4.2</th><th>Change</th></tr></thead><tbody>
          {[["1. Definitions", "Unchanged", "Unchanged", "None"], ["2. Account", "Unchanged", "Unchanged", "None"], ["3. Fees", "Flat 2.0%", "Tiered 1.75–2.0%", "Updated"], ["4. Privacy", "Unchanged", "Unchanged", "None"], ["5. Dispute", "30 days", "30 days", "None"], ["8. BNPL", "N/A", "New section", "Added"]].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 0 ? "pm-td-strong" : ""}>{i === 3 ? <Badge tone={c === "None" ? "grey" : c === "Added" ? "green" : "amber"}>{c}</Badge> : c}</td>)}</tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={onClose}>Export diff</button></div>
    </Modal>
  );
}

/* ============================ 8. Document Preview Modal ============================ */
export function DocPreviewModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Document Preview" subtitle="Rendered document with sample variables and both language versions" icon="bi-eye" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-2 mb-3"><div className="col"><Badge tone="green" dot>English</Badge></div><div className="col"><Badge tone="blue">Swahili</Badge></div></div>
        <div className="pm-card pm-card-pad" style={{ maxHeight: 300, overflowY: "auto" }}>
          <h6>Terms of Service v4.2</h6>
          <p className="small">Welcome to <b>PayMo Digital Bank Ltd</b>. These Terms of Service govern your use of the PayMo platform.</p>
          <p className="small"><b>1. Definitions</b><br />"PayMo" means PayMo Digital Bank Ltd, registered in Kenya. "User" means any individual or entity using the platform.</p>
          <p className="small"><b>3. Fees and Disclosures</b><br />3.1 PayMo charges a tiered fee: <b>1.75%</b> for amounts below KES 10,000 and <b>2.0%</b> for amounts above KES 10,000.</p>
          <p className="small"><b>8. Buy Now Pay Later (PayLater)</b><br />NEW — This section governs deferred payment services offered through PayMo.</p>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 9. Enforcement Rules Drawer ============================ */
export function EnforcementRulesDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Drawer open onClose={onClose} title="Acceptance Enforcement Rules" subtitle="Rules that protect legal consent and re-consent" icon="bi-shield-check" wide>
      <div className="pm-card pm-card-pad mb-3"><Badge tone="green" dot>Enforced</Badge>
        <h6 className="mt-3">Enforcement rules</h6>
        {[["Accept before first transaction", "Required"], ["Re-accept major version (x.0)", "Required"], ["Re-accept minor version", "Not required"], ["Unaccepted access", "Read-only until accepted"], ["Acceptance method", "Checkbox + I Agree"], ["Record retention", "7 years"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b>{x[1]}</b></div>)}
      </div>
      <div className="pm-card pm-card-pad"><h6>Technical implementation</h6>
        {[["API endpoint", "/api/v2/consent/accept"], ["Webhook", "consent.accepted"], ["Storage", "Encrypted consent ledger"], ["Integrity", "SHA-256 hash chain"], ["Audit", "7-year immutable retention"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b className="mono">{x[1]}</b></div>)}
      </div>
    </Drawer>
  );
}

/* ============================ 10. Review Calendar Modal ============================ */
export function ReviewCalendarModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Legal Review Calendar" subtitle="Upcoming review deadlines and assigned counsel" icon="bi-calendar-check" tone="violet" size="lg">
      <div className="pm-modal-body">
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Document</th><th>Frequency</th><th>Last reviewed</th><th>Next review</th><th>Reviewer</th><th>Status</th></tr></thead><tbody>
          {[["Terms of Service", "Quarterly", "Jul 2026", "Oct 2026", "Legal Counsel", "Scheduled"], ["Privacy Policy", "Quarterly", "Jul 2026", "Oct 2026", "Legal Counsel", "Scheduled"], ["Loan Terms", "Semi-annual", "May 2026", "Nov 2026", "Legal Counsel", "Scheduled"], ["Card Terms", "Semi-annual", "Feb 2026", "Aug 2026", "Legal Counsel", "Due"], ["Business Terms", "Quarterly", "Apr 2026", "Jul 2026", "Legal Counsel", "Overdue"]].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 0 ? "pm-td-strong" : ""}>{i === 5 ? <Badge tone={c === "Overdue" ? "red" : c === "Due" ? "amber" : "green"}>{c}</Badge> : c}</td>)}</tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Calendar exported" }); onClose(); }}>Export calendar</button></div>
    </Modal>
  );
}

/* ============================ 11. Access Map Modal ============================ */
export function AccessMapModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Document Access & Display" subtitle="Where documents appear and acceptance requirements" icon="bi-window" tone="blue" size="lg">
      <div className="pm-modal-body">
        {[["App registration", "Terms + Privacy", "Must accept to register", "amber"], ["App settings", "All active documents", "View only", "grey"], ["Website footer", "Terms + Privacy + Cookie", "View only", "grey"], ["Loan application", "Loan Terms", "Must accept to apply", "amber"], ["Card application", "Card Terms", "Must accept to apply", "amber"], ["Business onboarding", "Business + API Terms", "Must accept", "amber"]].map(x => <div className="d-flex justify-content-between align-items-center py-2 border-bottom" key={x[0]}><div><b>{x[0]}</b><div className="pm-td-sub">{x[1]}</div></div><Badge tone={x[3] as any}>{x[2]}</Badge></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 12. Document Usage Modal ============================ */
export function DocUsageModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Document Usage Analytics" subtitle="Acceptance, view and download metrics" icon="bi-graph-up" tone="violet" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["148,392", "Total users", "blue"], ["142,456", "Accepted ToS", "green"], ["8,158", "Pending Privacy", "amber"], ["12,456", "Views (30d)", "violet"]].map(x => <div className="col-md-3" key={x[1]}><div className="pm-card pm-card-pad text-center"><div className="h5 mb-0">{x[0]}</div><div className="small text-muted">{x[1]}</div></div></div>)}</div>
        <h6>Acceptance trend (last 6 months)</h6>
        {[["Feb 2026", "92.3%", "green"], ["Mar 2026", "93.1%", "green"], ["Apr 2026", "94.0%", "green"], ["May 2026", "94.8%", "green"], ["Jun 2026", "95.2%", "green"], ["Jul 2026", "96.0%", "green"]].map(m => <div className="d-flex justify-content-between py-1 border-bottom small" key={m[0]}><span>{m[0]}</span><Badge tone="green">{m[1]}</Badge></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 13. Document Compliance Check Modal ============================ */
export function DocComplianceCheckModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Document Compliance Check" subtitle="Verify document meets all legal and regulatory requirements" icon="bi-shield-check" tone="green">
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3 text-center"><i className="bi bi-patch-check-fill text-success" style={{ fontSize: 48 }} /><h6 className="mt-2">All checks passing</h6><p className="small text-muted">12 of 12 compliance checks passed for Terms of Service v4.2.</p></div>
        {[["CBK disclosure requirements", "Passed"], ["Data Protection Act alignment", "Passed"], ["Consumer protection clauses", "Passed"], ["Dispute resolution mechanism", "Passed"], ["Fee transparency", "Passed"], ["Bilingual availability (EN + SW)", "Passed"]].map(c => <div className="d-flex justify-content-between py-1 border-bottom small" key={c[0]}><span>{c[0]}</span><Badge tone="green" dot>{c[1]}</Badge></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Compliance report exported" }); onClose(); }}>Export report</button></div>
    </Modal>
  );
}

/* ============================ 14. Translation Status Modal ============================ */
export function TranslationStatusModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Translation Status" subtitle="Language coverage and translation review status" icon="bi-translate" tone="blue">
      <div className="pm-modal-body">
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Document</th><th>English</th><th>Swahili</th><th>Last translated</th><th>Status</th></tr></thead><tbody>
          {[["Terms of Service", "v4.2", "v4.2", "Aug 1", "Current"], ["Privacy Policy", "v3.1", "v3.1", "Aug 1", "Current"], ["Cookie Policy", "v2.0", "—", "N/A", "EN only"], ["Loan Terms", "v3.0", "v3.0", "Jun 1", "Current"], ["Card Terms", "v2.2", "—", "N/A", "EN only"]].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 0 ? "pm-td-strong" : ""}>{i === 4 ? <Badge tone={c === "EN only" ? "amber" : "green"}>{c}</Badge> : c}</td>)}</tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 15. Audit Trail Modal ============================ */
export function LegalAuditTrailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Legal Document Audit Trail" subtitle="Immutable record of all document operations" icon="bi-clock-history" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Date</th><th>Actor</th><th>Document</th><th>Operation</th><th>Result</th></tr></thead><tbody>
          {[["Aug 22", "Joseph M.", "Terms v4.2", "Published", "Success"], ["Aug 20", "Legal Counsel", "Terms v4.2", "Approved", "Success"], ["Aug 18", "Legal Counsel", "Terms v4.2", "Reviewed", "Passed"], ["Aug 15", "Joseph M.", "Terms v4.2", "Drafted", "Created"], ["Aug 10", "DPO", "Privacy v3.1", "Approved", "Success"], ["Aug 5", "Joseph M.", "Privacy v3.1", "Drafted", "Created"]].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 1 || i === 2 ? "pm-td-strong" : ""}>{i === 4 ? <Badge tone="green" dot>{c}</Badge> : c}</td>)}</tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={onClose}>Export</button></div>
    </Modal>
  );
}
