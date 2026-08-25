import { useState } from "react";
import { Badge, Modal, Drawer, Steps, useToast } from "../../../components/ui";

/* ============================ 1. Audit Entry Detail Drawer ============================ */
export function AuditEntryDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Drawer open onClose={onClose} title="Audit Entry Detail" subtitle="Immutable record with full context and integrity proof" icon="bi-list-check" wide>
      <div className="pm-card pm-card-pad mb-3"><Badge tone="green" dot>Integrity verified</Badge>
        <div className="row g-3 mt-2">{[["Timestamp", "Aug 24, 2026 14:32:01 EAT"], ["Admin", "Joseph Mwangi"], ["Action", "Freeze account"], ["Target", "User #89234"], ["IP", "192.168.1.42"], ["Session", "S-8821"], ["Result", "Success"]].map(x => <div className="col-md-6" key={x[0]}><div className="pm-eyebrow">{x[0]}</div><b className="small">{x[1]}</b></div>)}</div>
      </div>
      <div className="pm-card pm-card-pad mb-3"><h6>Integrity proof</h6>
        {[["Pre-image hash", "a3f8c2e1b..."], ["Chain position", "#1,842,341"], ["Replicated", "3 of 3 replicas"], ["Previous hash", "f7e9d1c2a..."], ["Merkle root", "b5c3a2f1e..."]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b className="mono">{x[1]}</b></div>)}
      </div>
      <div className="pm-card pm-card-pad"><h6>Downstream effects</h6>
        {["User account frozen within 100ms", "All active sessions terminated", "Push notification sent to user", "Fraud alert escalated to Tier 2"].map(e => <div className="d-flex gap-2 align-items-center py-1 border-bottom small" key={e}><i className="bi bi-check-circle-fill text-success" /><span>{e}</span></div>)}
      </div>
    </Drawer>
  );
}

/* ============================ 2. Audit Search Results Modal ============================ */
export function AuditSearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Audit Search Results" subtitle="1,842 matching entries across immutable logs" icon="bi-funnel" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["1,842", "entries found", "blue"], ["23", "critical", "red"], ["156", "warnings", "amber"], ["1,663", "info", "green"]].map(x => <div className="col-md-3" key={x[1]}><div className="pm-card pm-card-pad text-center"><div className="h5 mb-0">{x[0]}</div><div className="small text-muted">{x[1]}</div></div></div>)}</div>
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Time</th><th>Admin</th><th>Action</th><th>Target</th><th>Result</th></tr></thead><tbody>
          {[["14:32:01", "Joseph M.", "Freeze", "User #89234", "Success"], ["14:15:23", "Sarah K.", "Approve", "Settlement SET-4456", "Success"], ["13:45:12", "James O.", "Update", "Fee Config FEE-MP-CO", "Success"], ["12:30:00", "David K.", "Create", "SAR SAR-2026-035", "Success"]].map(r => <tr key={r[0]}><td className="mono">{r[0]}</td><td className="pm-td-strong">{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td><Badge tone="green" dot>{r[4]}</Badge></td></tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Results exported" }); onClose(); }}>Export results</button></div>
    </Modal>
  );
}

/* ============================ 3. Finding Detail Modal ============================ */
export function FindingDetailModal({ open, finding, onClose }: { open: boolean; finding: string; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`Finding: ${finding}`} subtitle="Control weakness detail with remediation plan" icon="bi-shield-exclamation" tone="amber" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">
          <div className="col-md-6"><label className="form-label">Severity</label><Badge tone="amber">Medium</Badge></div>
          <div className="col-md-6"><label className="form-label">Status</label><Badge tone="blue">Open</Badge></div>
          <div className="col-md-6"><label className="form-label">Identified</label><input className="form-control" value="Aug 20, 2026" readOnly /></div>
          <div className="col-md-6"><label className="form-label">Due date</label><input className="form-control" value="Sep 20, 2026" readOnly /></div>
          <div className="col-12"><label className="form-label">Description</label><textarea className="form-control" rows={2} value="Peter N. has export + view permissions but no impersonate access, creating an inconsistent permission profile for the Minor Admin tier." readOnly /></div>
          <div className="col-12"><label className="form-label">Recommendation</label><textarea className="form-control" rows={2} value="Review quarterly — align Minor Admin permissions with standard tier matrix." readOnly /></div>
        </div>
        <h6>Remediation plan</h6>
        {[["Assign to", "Platform Security team"], ["Priority", "Medium"], ["Review cycle", "Quarterly"], ["Approval required", "Super Admin"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b>{x[1]}</b></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Remediation task created" }); onClose(); }}>Assign remediation</button></div>
    </Modal>
  );
}

/* ============================ 4. Log Source Detail Modal ============================ */
export function LogSourceDetailModal({ open, source, onClose }: { open: boolean; source: string; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`Log Source: ${source}`} subtitle="Source health, ingestion rate and configuration" icon="bi-diagram-3" tone="green">
      <div className="pm-modal-body">
        <div className="row g-3">
          { [["Events today", "34,502"], ["Ingestion rate", "14.2 events/sec"], ["Avg event size", "1.2 KB"], ["Latency", "< 50ms"], ["Integrity", "Hash-chained"], ["Encryption", "AES-256 at rest"]].map(x => <div className="col-md-6" key={x[0]}><label className="form-label">{x[0]}</label><input className="form-control" value={x[1]} readOnly /></div>)}
          <div className="col-12"><label className="form-label">Retention</label><input className="form-control" value="7 years — immutable" readOnly /></div>
        </div>
        <h6 className="mt-3">Recent health checks</h6>
        {[["14:32", "Healthy", "green"], ["14:15", "Healthy", "green"], ["13:45", "Healthy", "green"], ["12:00", "Degraded — recovered", "amber"]].map(h => <div className="d-flex justify-content-between py-1 border-bottom small" key={h[0]}><span className="mono">{h[0]}</span><Badge tone={h[2] as any} dot>{h[1]}</Badge></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 5. Evidence Export Modal ============================ */
export function AuditEvidenceExportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Export Audit Evidence" subtitle="Generate a signed, tamper-evident evidence pack" icon="bi-download" tone="blue" size="lg">
      <Steps current={2} steps={[{ label: "Scope", icon: "bi-funnel" }, { label: "Filters", icon: "bi-search" }, { label: "Export", icon: "bi-download" }]} />
      <div className="pm-wizard-progress"><span style={{ width: "100%" }} /></div>
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Date range</label><input className="form-control" value="Aug 01 – Aug 24, 2026" readOnly /></div>
          <div className="col-md-6"><label className="form-label">Format</label><select className="form-select"><option>Signed PDF + CSV</option><option>JSON (machine-readable)</option><option>SIEM-compatible</option></select></div>
          <div className="col-md-6"><label className="form-label">Signature</label><input className="form-control" value="HSM-backed (RSA-4096)" readOnly /></div>
          <div className="col-md-6"><label className="form-label">Integrity</label><input className="form-control" value="SHA-256 chain included" readOnly /></div>
          <div className="col-12"><label className="form-label">Reason for export</label><textarea className="form-control" rows={2} defaultValue="Regulatory evidence pack for quarterly access control review." /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Evidence export queued" }); onClose(); }}>Generate signed export</button></div>
    </Modal>
  );
}

/* ============================ 6. Audit Report Wizard ============================ */
export function AuditReportWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  if (!open) return null;
  return (
    <Modal open onClose={() => { setStep(0); onClose(); }} title="Create Audit Report" subtitle="Build a compliance evidence pack from immutable logs" icon="bi-file-earmark-bar-graph" tone="blue" size="lg">
      <Steps current={step} steps={[{ label: "Scope", icon: "bi-funnel" }, { label: "Filters", icon: "bi-search" }, { label: "Review", icon: "bi-eye" }, { label: "Export", icon: "bi-download" }]} />
      <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 25}%` }} /></div>
      <div className="pm-modal-body">
        {step === 0 && <div className="row g-3"><div className="col-md-6"><label className="form-label">Report scope</label><select className="form-select"><option>Admin actions</option><option>API activity</option><option>System events</option><option>All sources</option></select></div><div className="col-md-6"><label className="form-label">Time range</label><select className="form-select"><option>Last 7 days</option><option>Last 30 days</option><option>Last quarter</option><option>Custom range</option></select></div></div>}
        {step === 1 && <div className="row g-3"><div className="col-md-6"><label className="form-label">Action types</label><input className="form-control" value="Login, Create, Update, Approve, Export" readOnly /></div><div className="col-md-6"><label className="form-label">Target types</label><input className="form-control" value="User, Transaction, Partner, Config" readOnly /></div><div className="col-md-6"><label className="form-label">Result</label><input className="form-control" value="Success + Failure" readOnly /></div><div className="col-md-6"><label className="form-label">Admins</label><input className="form-control" value="All administrators" readOnly /></div></div>}
        {step === 2 && <div><h6>Report preview</h6><div className="pm-card pm-card-pad">{[["Entries", "2,842"], ["Admins", "10 unique"], ["Date range", "Aug 1–24, 2026"], ["File size (est.)", "~4.2 MB"], ["Format", "Signed PDF + CSV"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b>{x[1]}</b></div>)}</div></div>}
        {step === 3 && <div className="text-center py-3"><i className="bi bi-file-earmark-check text-success" style={{ fontSize: 48 }} /><h5 className="mt-3">Report ready</h5><p className="small text-muted">Signed evidence pack generated with HSM-backed signature.</p></div>}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={() => step ? setStep(step - 1) : onClose()}>{step ? "Back" : "Cancel"}</button>{step < 3 ? <button className="btn btn-primary" onClick={() => setStep(step + 1)}>Continue</button> : <button className="btn btn-primary" onClick={() => { setStep(0); push({ kind: "success", title: "Report generated" }); onClose(); }}>Download report</button>}</div>
    </Modal>
  );
}

/* ============================ 7. Remediation Task Modal ============================ */
export function RemediationTaskModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Create Remediation Task" subtitle="Assign a finding to a team for resolution" icon="bi-check2-square" tone="amber">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-12"><label className="form-label">Finding</label><select className="form-select"><option>Over-privileged Minor Admin</option><option>No SoD for fee changes</option><option>Stale permissions</option><option>Shared credentials risk</option></select></div>
          <div className="col-md-6"><label className="form-label">Assign to</label><select className="form-select"><option>Platform Security</option><option>Compliance</option><option>Engineering</option></select></div>
          <div className="col-md-6"><label className="form-label">Due date</label><input className="form-control" type="date" defaultValue="2026-09-20" /></div>
          <div className="col-12"><label className="form-label">Priority</label><select className="form-select"><option>Medium</option><option>High</option><option>Low</option></select></div>
          <div className="col-12"><label className="form-label">Notes</label><textarea className="form-control" rows={2} defaultValue="Align Minor Admin permissions with standard tier matrix per quarterly review." /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Task assigned" }); onClose(); }}>Create task</button></div>
    </Modal>
  );
}

/* ============================ 8. Retention Policy Modal ============================ */
export function RetentionPolicyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Audit Retention Policy" subtitle="Configure log retention, archival and deletion rules" icon="bi-shield-check" tone="green" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3">
          {[["Retention period", "7 years"], ["Oldest entry", "Jan 15, 2024"], ["Total storage", "45 GB"], ["Deletion policy", "No manual deletion"], ["Archive after", "1 year"], ["Compression", "Zstandard (zstd)"], ["Encryption", "AES-256 at rest"], ["Export signing", "HSM-backed RSA-4096"]].map(x => <div className="col-md-6" key={x[0]}><label className="form-label">{x[0]}</label><input className="form-control" value={x[1]} readOnly /></div>)}
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 9. Incident Detail Modal ============================ */
export function AuditIncidentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Critical Event Detail" subtitle="Security event requiring investigation" icon="bi-exclamation-triangle" tone="red" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Severity", "Critical", "red"], ["Status", "Under investigation", "amber"], ["Detected", "Aug 24, 14:15 EAT", "blue"]].map(x => <div className="col-md-4" key={x[0]}><Badge tone={x[2] as any}>{x[0]}: {x[1]}</Badge></div>)}</div>
        <div className="row g-3">
          <div className="col-12"><label className="form-label">Event</label><input className="form-control" value="Unauthorized API access attempt from non-approved IP range" readOnly /></div>
          <div className="col-md-6"><label className="form-label">Source IP</label><input className="form-control" value="41.90.123.45 (external)" readOnly /></div>
          <div className="col-md-6"><label className="form-label">Target</label><input className="form-control" value="API key pk_live_****...7823" readOnly /></div>
          <div className="col-12"><label className="form-label">Evidence</label><textarea className="form-control" rows={2} value="Failed authentication from non-approved IP. API key blocked by WAF rule." readOnly /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-danger" onClick={() => { push({ kind: "success", title: "Incident escalated" }); onClose(); }}>Escalate to Security</button></div>
    </Modal>
  );
}

/* ============================ 10. Bulk Export Modal ============================ */
export function BulkAuditExportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Bulk Audit Export" subtitle="Export multiple audit sources in one package" icon="bi-cloud-download" tone="blue">
      <div className="pm-modal-body">
        <h6>Select log sources</h6>
        {[["Admin UI", "34,502 events", true], ["Public API", "18,442 events", true], ["Background jobs", "14,890 events", true], ["Fraud engine", "6,320 events", false], ["Finance ledger", "3,880 events", false], ["Database changes", "200 events", false]].map(s => <div className="form-check py-1" key={s[0]}><input className="form-check-input" type="checkbox" id={`src-${s[0]}`} defaultChecked={s[2] as boolean} /><label className="form-check-label small" htmlFor={`src-${s[0]}`}>{s[0]} — {s[1]}</label></div>)}
        <div className="row g-3 mt-3"><div className="col-md-6"><label className="form-label">Format</label><select className="form-select"><option>JSON (with hashes)</option><option>CSV</option><option>SIEM (CEF)</option></select></div><div className="col-md-6"><label className="form-label">Signature</label><select className="form-select"><option>HSM-signed (recommended)</option><option>Unsigned (testing)</option></select></div></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Bulk export queued" }); onClose(); }}>Generate export</button></div>
    </Modal>
  );
}

/* ============================ 11. Hash Verification Modal ============================ */
export function HashVerificationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Verify Audit Integrity" subtitle="Validate hash chain and detect tampering" icon="bi-shield-check" tone="green">
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3 text-center"><i className="bi bi-patch-check-fill text-success" style={{ fontSize: 48 }} /><h6 className="mt-2">Integrity verified</h6><p className="small text-muted">All 2,340,000 entries pass hash chain validation.</p></div>
        <div className="row g-3">
          { [["Chain status", "Valid — no breaks"], ["Oldest entry", "Jan 15, 2024"], ["Newest entry", "Aug 24, 2026 14:32:01"], ["Total entries", "2,340,000"], ["Replicas", "3 of 3 in sync"], ["Last full check", "14:32:05 EAT today"]].map(x => <div className="col-md-6" key={x[0]}><label className="form-label">{x[0]}</label><input className="form-control" value={x[1]} readOnly /></div>)}
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Verification report exported" }); onClose(); }}>Export report</button></div>
    </Modal>
  );
}

/* ============================ 12. Real-time Feed Modal ============================ */
export function RealtimeFeedModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Real-time Audit Feed" subtitle="Live streaming of audit events" icon="bi-broadcast" tone="green" size="lg">
      <div className="pm-modal-body">
        <div className="d-flex align-items-center gap-2 mb-3"><div className="rounded-circle bg-success" style={{ width: 8, height: 8 }} /><span className="small text-success fw-bold">LIVE</span><span className="small text-muted ms-2">Auto-refresh every 2 seconds</span></div>
        {[["14:32:05", "System", "Ingest", "Admin UI", "78,234 events today"], ["14:32:01", "Joseph M.", "Freeze", "User #89234", "Fraud suspicion"], ["14:15:23", "Sarah K.", "Approve", "SET-4456", "KES 4.2M"], ["13:45:12", "James O.", "Update", "FEE-MP-CO", "Rate change"], ["13:00:45", "Mary W.", "Export", "RPT-TXN-AUG", "1.2M rows"]].map((e, i) => <div className="d-flex align-items-center gap-2 py-2 border-bottom small" key={i} style={{ opacity: i === 0 ? 1 : 1 - i * 0.15 }}><span className="mono text-muted" style={{ width: 80 }}>{e[0]}</span><b className="pm-td-strong" style={{ width: 80 }}>{e[1]}</b><Badge tone="blue" style={{ width: 70 }}>{e[2]}</Badge><span className="pm-td-strong">{e[3]}</span><span className="text-muted ms-auto">{e[4]}</span></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 13. Compliance Audit Modal ============================ */
export function ComplianceAuditModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Compliance Audit Package" subtitle="Pre-built evidence package for regulatory review" icon="bi-clipboard-check" tone="violet" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["14", "Evidence items", "violet"], ["7", "Completed", "green"], ["3", "In progress", "amber"], ["4", "Pending", "grey"]].map(x => <div className="col-md-3" key={x[1]}><div className="pm-card pm-card-pad text-center"><div className="h5 mb-0">{x[0]}</div><div className="small text-muted">{x[1]}</div></div></div>)}</div>
        <h6>Evidence checklist</h6>
        {[["Access control review", "Completed", "green"], ["Privileged access log", "Completed", "green"], ["Change management evidence", "Completed", "green"], ["Incident response records", "In progress", "amber"], ["Data classification audit", "Pending", "grey"], ["Network security review", "Pending", "grey"]].map(e => <div className="d-flex justify-content-between py-1 border-bottom small" key={e[0]}><span>{e[0]}</span><Badge tone={e[2] as any}>{e[1]}</Badge></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Compliance package exported" }); onClose(); }}>Export package</button></div>
    </Modal>
  );
}

/* ============================ 14. Alert Configuration Modal ============================ */
export function AuditAlertConfigModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Audit Alert Configuration" subtitle="Configure real-time alerts for critical audit events" icon="bi-bell" tone="amber">
      <div className="pm-modal-body">
        <div className="row g-3">
          {[["Failed login threshold", "5"], ["Lockout duration", "30 min"], ["Privilege escalation alert", "Instant"], ["Bulk export alert", "Instant"], ["Off-hours activity alert", "15 min delay"], ["SIEM integration", "Enabled"]].map(x => <div className="col-md-6" key={x[0]}><label className="form-label">{x[0]}</label><input className="form-control" defaultValue={x[1]} /></div>)}
          <div className="col-12"><label className="form-label">Alert recipients</label><input className="form-control" value="security@paymo.co.ke, joseph@paymo.co.ke" readOnly /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Alert config saved" }); onClose(); }}>Save configuration</button></div>
    </Modal>
  );
}

/* ============================ 15. Data Classification Modal ============================ */
export function DataClassificationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Audit Data Classification" subtitle="How audit data is classified and protected" icon="bi-tags" tone="blue">
      <div className="pm-modal-body">
        {[["Critical", "Admin actions on financial data, SAR filings, account closures", "red", "Encrypted + HSM signed"], ["Confidential", "Admin login, permission changes, session data", "amber", "Encrypted at rest"], ["Internal", "System events, API health, performance metrics", "blue", "Standard encryption"], ["Public", "Platform status, uptime metrics", "green", "No special handling"]].map(c => <div className="pm-card pm-card-pad mb-2" key={c[0]}><div className="d-flex justify-content-between align-items-center"><div><Badge tone={c[2] as any}>{c[0]}</Badge><div className="small mt-1">{c[1]}</div></div><div className="small text-muted">{c[3]}</div></div></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}
