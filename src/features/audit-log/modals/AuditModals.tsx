import { useState } from "react";
import { Badge, Modal, Drawer, Steps, useToast } from "../../../components/ui";
import type { AuditIncident, AuditSession, AuditAlertRule, SectionExport, AuditRetentionRule } from "../data/auditData";

/* =================================================================
   1. AUDIT ENTRY DETAIL DRAWER — Full immutable record detail
   ================================================================= */
export function AuditEntryDrawer({ entry, open, onClose }: { entry: any; open: boolean; onClose: () => void }) {
  if (!open || !entry) return null;
  return (
    <Drawer open onClose={onClose} title="Audit Entry Detail" subtitle={`Immutable record · ${entry.targetId}`} icon="bi-list-check" wide>
      <div className="pm-card pm-card-pad mb-3">
        <Badge tone="green" dot>Integrity verified</Badge>
        <div className="row g-3 mt-2">
          {[["Timestamp", `${entry.timestamp} EAT`], ["Admin", entry.admin], ["Action", entry.action], ["Target", `${entry.targetType} ${entry.targetId}`], ["IP", entry.ip], ["Session", entry.session], ["Result", entry.result], ["Severity", entry.severity || "Info"], ["Source", entry.source || "Admin UI"]].map(([k, v]) => <div className="col-md-6" key={k}><div className="pm-eyebrow">{k}</div><b className="small">{v}</b></div>)}
        </div>
      </div>
      <div className="pm-card pm-card-pad mb-3"><h6>Integrity proof</h6>
        {[["Pre-image hash", "a3f8c2e1b4d7..."], ["Chain position", "#1,842,341"], ["Replicated", "3 of 3 replicas"], ["Previous hash", "f7e9d1c2a8b5..."], ["Merkle root", "b5c3a2f1e9d4..."]].map(([k, v]) => <div className="d-flex justify-content-between py-1 border-bottom small" key={k}><span className="text-muted">{k}</span><b className="mono">{v}</b></div>)}
      </div>
      <div className="pm-card pm-card-pad"><h6>Downstream effects</h6>
        {["Action logged in immutable chain", "Replicated to 3 storage nodes", "SHA-256 hash computed", "Index updated for search"].map(e => <div className="d-flex gap-2 align-items-center py-1 border-bottom small" key={e}><i className="bi bi-check-circle-fill text-success" /><span>{e}</span></div>)}
      </div>
    </Drawer>
  );
}

/* =================================================================
   2. INCIDENT MANAGEMENT WIZARD (4-step)
   ================================================================= */
export function IncidentWizard({ open, onClose, onComplete }: { open: boolean; onClose: () => void; onComplete: (inc: AuditIncident) => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ title: "", severity: "Medium", source: "Admin UI", sourceIp: "", target: "", description: "" });
  const [confirm, setConfirm] = useState("");
  const steps = [{ label: "Identify", icon: "bi-exclamation-triangle" }, { label: "Assess", icon: "bi-graph-up" }, { label: "Contain", icon: "bi-shield-x" }, { label: "Resolve", icon: "bi-check2" }];

  return (
    <Modal open={open} onClose={() => { setStep(0); setConfirm(""); onClose(); }} title="Report Security Incident" subtitle={`Step ${step + 1} of 4: ${steps[step].label}`} icon="bi-exclamation-triangle-fill" tone="red" size="lg">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
      <Steps current={step} steps={steps} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div className="row g-3">
            <div className="pm-note mb-2" style={{ borderLeft: "3px solid var(--pm-danger)", background: "var(--pm-danger-soft)" }}>
              <div className="pm-td-strong" style={{ color: "var(--pm-danger)" }}><i className="bi bi-exclamation-triangle me-1" />Security incident reporting</div>
              <div className="mt-1">All incidents are logged in the immutable audit trail and require Super Admin review.</div>
            </div>
            <div className="col-12"><label className="form-label">Incident title <span className="text-danger">*</span></label><input className="form-control" placeholder="Brief description of the incident" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div className="col-md-6"><label className="form-label">Severity</label><select className="form-select" value={form.severity} onChange={e => setForm(p => ({ ...p, severity: e.target.value }))}><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select></div>
            <div className="col-md-6"><label className="form-label">Source</label><select className="form-select" value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))}><option>Admin UI</option><option>Public API</option><option>Fraud engine</option><option>Background jobs</option></select></div>
          </div>
        )}
        {step === 1 && (
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label">Source IP</label><input className="form-control" placeholder="e.g. 192.168.1.42" value={form.sourceIp} onChange={e => setForm(p => ({ ...p, sourceIp: e.target.value }))} /></div>
            <div className="col-md-6"><label className="form-label">Target</label><input className="form-control" placeholder="e.g. User PAY-89234" value={form.target} onChange={e => setForm(p => ({ ...p, target: e.target.value }))} /></div>
            <div className="col-12"><label className="form-label">Description <span className="text-danger">*</span></label><textarea className="form-control" rows={4} placeholder="Detailed description of the incident, including timeline and evidence..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div className="col-12"><label className="form-label">Assign to</label><select className="form-select"><option>Joseph Mwangi (Security Lead)</option><option>Sarah Kamau (Platform Admin)</option><option>David Kimani (Compliance)</option></select></div>
          </div>
        )}
        {step === 2 && (
          <div>
            <p className="small text-muted mb-3">Select containment actions to take immediately.</p>
            {["Block source IP address", "Terminate active sessions for affected accounts", "Revoke compromised API keys", "Notify security team via PagerDuty", "Enable enhanced logging on affected systems", "Freeze related financial accounts"].map(item => (
              <label key={item} className="d-flex align-items-center gap-2 mb-2 p-2 border-bottom" style={{ fontSize: ".85rem" }}><input type="checkbox" className="form-check-input" defaultChecked={item.includes("Block") || item.includes("Notify")} />{item}</label>
            ))}
            <div className="pm-note mt-3"><i className="bi bi-info-circle me-1" />Containment actions will be executed immediately and logged in the audit trail.</div>
          </div>
        )}
        {step === 3 && (
          <div className="pm-card pm-card-pad">
            <Badge tone={form.severity === "Critical" ? "red" : form.severity === "High" ? "amber" : "blue"} dot>Incident {form.severity === "Critical" ? "critical" : "reported"}</Badge>
            <h6 className="mt-3">Incident summary</h6>
            <div className="pm-kv"><span className="k">Title</span><span className="v">{form.title || "Not specified"}</span></div>
            <div className="pm-kv"><span className="k">Severity</span><span className="v">{form.severity}</span></div>
            <div className="pm-kv"><span className="k">Source</span><span className="v">{form.source}</span></div>
            <div className="pm-kv"><span className="k">Actions taken</span><span className="v">2 containment actions</span></div>
            <div className="pm-kv"><span className="k">Audit log</span><span className="v">Will be recorded</span></div>
            <div className="mb-3 mt-3">
              <label className="form-label" style={{ color: "var(--pm-danger)" }}>Type CONFIRM to file incident</label>
              <input className="form-control" style={{ borderColor: "var(--pm-danger)" }} placeholder="Type CONFIRM" value={confirm} onChange={e => setConfirm(e.target.value)} />
            </div>
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => step > 0 ? setStep(step - 1) : (setStep(0), setConfirm(""), onClose())}>{step > 0 ? "← Back" : "Cancel"}</button>
        {step < 3 ? <button className="btn btn-primary btn-sm" disabled={step === 0 && !form.title} onClick={() => setStep(step + 1)}>Continue →</button>
          : <button className="btn btn-danger btn-sm" disabled={confirm !== "CONFIRM"} onClick={() => {
            onComplete({ id: `inc-${Date.now()}`, title: form.title, severity: form.severity, status: "Open", detectedAt: new Date().toLocaleString(), source: form.source, sourceIp: form.sourceIp || "Unknown", target: form.target || "Unknown", description: form.description });
            setStep(0); setConfirm(""); push({ kind: "warn", title: "Incident filed", body: "Security team notified. Incident logged in audit trail." }); onClose();
          }}><i className="bi bi-exclamation-triangle me-1" />File incident</button>}
      </div>
    </Modal>
  );
}

/* =================================================================
   3. SESSION DETAIL MODAL — Admin session monitoring
   ================================================================= */
export function SessionDetailModal({ open, session, onClose, onTerminate }: { open: boolean; session: AuditSession | null; onClose: () => void; onTerminate: () => void }) {
  const { push } = useToast();
  if (!session) return null;
  return (
    <Modal open={open} onClose={onClose} title={`Session: ${session.admin}`} subtitle={`${session.role} · ${session.ip}`} icon="bi-pc-display" tone={session.status === "Active" ? "green" : session.status === "Idle" ? "amber" : "red"} size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">
          <div className="col-md-4"><div className="pm-card pm-card-pad text-center"><Badge tone={session.status === "Active" ? "green" : session.status === "Idle" ? "amber" : "red"} dot>{session.status}</Badge><div className="small text-muted mt-1">Session status</div></div></div>
          <div className="col-md-4"><div className="pm-card pm-card-pad text-center"><div className="h5 mb-0">{session.actions}</div><div className="small text-muted">Actions taken</div></div></div>
          <div className="col-md-4"><div className="pm-card pm-card-pad text-center"><Badge tone="blue">{session.mfaMethod}</Badge><div className="small text-muted mt-1">MFA method</div></div></div>
        </div>
        <div className="pm-card pm-card-pad mb-3">
          <h6>Session details</h6>
          {[["Administrator", session.admin], ["Role", session.role], ["IP address", session.ip], ["Location", session.location], ["Started", session.startedAt], ["Last active", session.lastActive], ["User agent", session.userAgent || "—"], ["MFA", session.mfaMethod]].map(([k, v]) => <div className="d-flex justify-content-between py-1 border-bottom small" key={k}><span className="text-muted">{k}</span><b>{v}</b></div>)}
        </div>
        <div className="pm-card pm-card-pad">
          <h6>Security checks</h6>
          {["MFA verified on login", "IP from approved range", "No concurrent sessions detected", "Session within time limits"].map(check => <div className="d-flex gap-2 align-items-center py-1 border-bottom small" key={check}><i className="bi bi-check-circle-fill text-success" /><span>{check}</span></div>)}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        {session.status === "Active" && <button className="btn btn-danger btn-sm" onClick={() => { onTerminate(); push({ kind: "success", title: "Session terminated", body: `${session.admin}'s session has been forcefully ended.` }); onClose(); }}><i className="bi bi-x-octagon me-1" />Force logout</button>}
      </div>
    </Modal>
  );
}

/* =================================================================
   4. SECTION EXPORT WIZARD (5-step) — Export platform data by section
   ================================================================= */
export function SectionExportWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>(["Users", "Transactions"]);
  const [format, setFormat] = useState("CSV + JSON");
  const [encrypt, setEncrypt] = useState(true);
  const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState("");

  const sections = [
    { name: "Users", count: "245,832", icon: "bi-people" },
    { name: "Transactions", count: "12,450,891", icon: "bi-arrow-left-right" },
    { name: "Settlements", count: "89,234", icon: "bi-bank" },
    { name: "KYC Records", count: "198,445", icon: "bi-person-check" },
    { name: "Partners", count: "156", icon: "bi-handshake" },
    { name: "Fee Configuration", count: "89", icon: "bi-percent" },
    { name: "SARs", count: "35", icon: "bi-flag" },
    { name: "Support Tickets", count: "45,891", icon: "bi-headset" },
    { name: "Audit Trail", count: "2,340,000", icon: "bi-list-check" },
    { name: "Fraud Alerts", count: "1,234", icon: "bi-shield-exclamation" },
    { name: "Admin Activity", count: "78,234", icon: "bi-person-gear" },
    { name: "System Config", count: "234", icon: "bi-gear" }
  ];

  const toggleSection = (name: string) => setSelected(p => p.includes(name) ? p.filter(s => s !== name) : [...p, name]);
  const steps = [{ label: "Select sections", icon: "bi-folder2-open" }, { label: "Format & encryption", icon: "bi-lock" }, { label: "Date range", icon: "bi-calendar" }, { label: "Review", icon: "bi-eye" }, { label: "Export", icon: "bi-download" }];

  return (
    <Modal open={open} onClose={() => { setStep(0); setSelected(["Users", "Transactions"]); setConfirm(""); onClose(); }} title="Export Platform Data" subtitle={`Step ${step + 1} of 5: ${steps[step].label}`} icon="bi-cloud-download" tone="blue" size="lg">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / 5) * 100}%` }} /></div>
      <Steps current={step} steps={steps} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div>
            <p className="small text-muted mb-3">Select data sections to export for external audit. Each section is exported independently.</p>
            <div className="d-flex justify-content-between mb-2"><span className="small text-muted">{selected.length} of {sections.length} selected</span><button className="btn btn-sm btn-outline-secondary" onClick={() => setSelected(selected.length === sections.length ? [] : sections.map(s => s.name))}>{selected.length === sections.length ? "Deselect all" : "Select all"}</button></div>
            <div className="row g-2">
              {sections.map(s => (
                <div className="col-md-6" key={s.name}>
                  <button className={`d-flex align-items-center gap-2 w-100 p-2 border rounded ${selected.includes(s.name) ? "border-primary bg-primary bg-opacity-10" : ""}`} onClick={() => toggleSection(s.name)} style={{ cursor: "pointer", textAlign: "left" }}>
                    <input type="checkbox" className="form-check-input" checked={selected.includes(s.name)} readOnly />
                    <i className={`bi ${s.icon}`} style={{ color: selected.includes(s.name) ? "#175cd3" : "#98a2b3" }} />
                    <div><div className="small fw-bold">{s.name}</div><div className="text-muted" style={{ fontSize: ".7rem" }}>{s.count} records</div></div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label">Export format</label>
              {[["CSV + JSON", "Most compatible for auditors"], ["Signed PDF + CSV", "HSM-backed tamper-evident"], ["JSON (machine-readable)", "SIEM-compatible format"], ["Excel (XLSX)", "Spreadsheet format"]].map(([fmt, desc]) => (
                <label key={fmt} className="d-flex align-items-center gap-2 mb-2 p-2 border rounded" style={{ cursor: "pointer", background: format === fmt ? "var(--pm-primary-soft, #eff8ff)" : "transparent" }}>
                  <input type="radio" className="form-check-input" checked={format === fmt} onChange={() => setFormat(fmt)} />
                  <div><b style={{ fontSize: ".85rem" }}>{fmt}</b><div className="pm-td-sub">{desc}</div></div>
                </label>
              ))}
            </div>
            <div className="col-md-6">
              <div className="pm-card pm-card-pad mb-3"><h6>Encryption options</h6>
                <label className="d-flex align-items-center gap-2 mb-2"><input type="checkbox" className="form-check-input" checked={encrypt} onChange={e => setEncrypt(e.target.checked)} /><span className="small">AES-256 encrypt export files</span></label>
                <label className="d-flex align-items-center gap-2 mb-2"><input type="checkbox" className="form-check-input" defaultChecked /><span className="small">Include SHA-256 integrity hashes</span></label>
                <label className="d-flex align-items-center gap-2 mb-2"><input type="checkbox" className="form-check-input" defaultChecked /><span className="small">HSM-backed digital signature</span></label>
              </div>
              <div className="pm-note"><i className="bi bi-shield-lock me-1" />Encrypted exports require Super Admin credentials to decrypt.</div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label">Start date</label><input className="form-control" type="date" defaultValue="2026-08-01" /></div>
            <div className="col-md-6"><label className="form-label">End date</label><input className="form-control" type="date" defaultValue="2026-08-27" /></div>
            <div className="col-12"><label className="form-label">Reason for export <span className="text-danger">*</span></label><textarea className="form-control" rows={3} placeholder="Regulatory compliance audit, internal review, etc." value={reason} onChange={e => setReason(e.target.value)} /></div>
            <div className="pm-note"><i className="bi bi-info-circle me-1" />All exports are logged in the immutable audit trail with the reason and administrator identity.</div>
          </div>
        )}
        {step === 3 && (
          <div className="pm-card pm-card-pad">
            <h6>Export summary</h6>
            <div className="pm-kv"><span className="k">Sections</span><span className="v">{selected.length} selected</span></div>
            <div className="pm-kv"><span className="k">Sections</span><span className="v">{selected.join(", ")}</span></div>
            <div className="pm-kv"><span className="k">Format</span><span className="v">{format}</span></div>
            <div className="pm-kv"><span className="k">Encryption</span><span className="v">{encrypt ? "AES-256" : "None"}</span></div>
            <div className="pm-kv"><span className="k">Reason</span><span className="v">{reason || "Not specified"}</span></div>
            <div className="pm-kv"><span className="k">Estimated size</span><span className="v">~{(selected.length * 2.4).toFixed(1)} GB</span></div>
            <div className="pm-note mt-3"><i className="bi bi-shield-lock me-1" />Export will be generated as a signed, tamper-evident package. All access logged.</div>
          </div>
        )}
        {step === 4 && (
          <div>
            <div className="pm-note mb-3" style={{ borderLeft: "3px solid var(--pm-danger)", background: "var(--pm-danger-soft)" }}>
              <div className="pm-td-strong" style={{ color: "var(--pm-danger)" }}><i className="bi bi-shield-lock me-1" />FINAL CONFIRMATION REQUIRED</div>
              <div className="mt-1">This export contains sensitive platform data. Ensure proper handling.</div>
            </div>
            <div className="mb-3">
              <label className="form-label" style={{ color: "var(--pm-danger)" }}>Type EXPORT to confirm</label>
              <input className="form-control" style={{ borderColor: "var(--pm-danger)" }} placeholder="Type EXPORT" value={confirm} onChange={e => setConfirm(e.target.value)} />
            </div>
            <div className="pm-card pm-card-pad">
              <div className="pm-kv"><span className="k">Audit log</span><span className="v">Will be recorded</span></div>
              <div className="pm-kv"><span className="k">Notification</span><span className="v">Security team notified</span></div>
            </div>
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => step > 0 ? setStep(step - 1) : (setStep(0), setSelected(["Users", "Transactions"]), setConfirm(""), onClose())}>{step > 0 ? "← Back" : "Cancel"}</button>
        {step < 4 ? <button className="btn btn-primary btn-sm" disabled={step === 0 && selected.length === 0} onClick={() => setStep(step + 1)}>Continue →</button>
          : <button className="btn btn-primary btn-sm" disabled={confirm !== "EXPORT"} onClick={() => { setStep(0); setSelected(["Users", "Transactions"]); setConfirm(""); push({ kind: "success", title: "Export queued", body: `${selected.length} sections will be exported. Download link will be emailed.` }); onClose(); }}>
            <i className="bi bi-cloud-download me-1" />Generate export package
          </button>}
      </div>
    </Modal>
  );
}

/* =================================================================
   5. ALERT RULE CONFIG MODAL — Create/edit alert rules
   ================================================================= */
export function AlertRuleConfigModal({ open, rule, onClose, onSave }: { open: boolean; rule: AuditAlertRule | null; onClose: () => void; onSave: (data: any) => void }) {
  const { push } = useToast();
  const [form, setForm] = useState(rule || { name: "", description: "", condition: "", threshold: "", action: "Alert immediately", recipients: "", status: "Active" });

  return (
    <Modal open={open} onClose={onClose} title={rule ? `Edit: ${rule.name}` : "Create Alert Rule"} subtitle="Super Admin — Configure audit alert rules" icon="bi-bell" tone="amber" size="lg">
      <div className="pm-modal-body">
        <div className="pm-note mb-3"><i className="bi bi-info-circle me-1" />Alert rules are evaluated in real-time against incoming audit events.</div>
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Rule name <span className="text-danger">*</span></label><input className="form-control" placeholder="e.g. Failed login threshold" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
          <div className="col-md-6"><label className="form-label">Status</label><select className="form-select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}><option>Active</option><option>Paused</option><option>Draft</option></select></div>
          <div className="col-12"><label className="form-label">Description</label><textarea className="form-control" rows={2} placeholder="Describe what this rule detects..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
          <div className="col-md-6"><label className="form-label">Condition</label><input className="form-control" placeholder="e.g. Failed logins > threshold" value={form.condition} onChange={e => setForm(p => ({ ...p, condition: e.target.value }))} /></div>
          <div className="col-md-6"><label className="form-label">Threshold</label><input className="form-control" placeholder="e.g. 5 attempts in 10 min" value={form.threshold} onChange={e => setForm(p => ({ ...p, threshold: e.target.value }))} /></div>
          <div className="col-md-6"><label className="form-label">Response action</label><select className="form-select" value={form.action} onChange={e => setForm(p => ({ ...p, action: e.target.value }))}><option>Alert immediately</option><option>Alert (15 min delay)</option><option>Lock account + alert</option><option>Block + alert immediately</option><option>Alert + force logout</option></select></div>
          <div className="col-md-6"><label className="form-label">Recipients</label><input className="form-control" placeholder="email1@paymo.co.ke, email2@..." value={form.recipients} onChange={e => setForm(p => ({ ...p, recipients: e.target.value }))} /></div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={!form.name || !form.condition} onClick={() => { onSave(form); push({ kind: "success", title: rule ? "Rule updated" : "Rule created", body: "Alert rule is now active." }); onClose(); }}><i className="bi bi-check2 me-1" />{rule ? "Save changes" : "Create rule"}</button>
      </div>
    </Modal>
  );
}

/* =================================================================
   6. RETENTION POLICY WIZARD (3-step)
   ================================================================= */
export function RetentionPolicyWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const steps = [{ label: "Current policy", icon: "bi-shield-check" }, { label: "Configuration", icon: "bi-gear" }, { label: "Confirm changes", icon: "bi-check2" }];

  return (
    <Modal open={open} onClose={() => { setStep(0); onClose(); }} title="Retention Policy Configuration" subtitle={`Step ${step + 1} of 3: ${steps[step].label}`} icon="bi-shield-check" tone="green" size="lg">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / 3) * 100}%` }} /></div>
      <Steps current={step} steps={steps} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div>
            <div className="pm-card pm-card-pad mb-3"><Badge tone="green" dot>Policy active</Badge>
              <h6 className="mt-3">Current retention controls</h6>
              {[["Retention period", "7 years"], ["Oldest entry", "Jan 15, 2024"], ["Total storage", "45 GB"], ["Deletion policy", "No manual deletion"], ["Archive after", "1 year"], ["Compression", "Zstandard (zstd)"], ["Encryption", "AES-256 at rest"], ["Export signing", "HSM-backed RSA-4096"]].map(([k, v]) => <div className="d-flex justify-content-between py-1 border-bottom small" key={k}><span className="text-muted">{k}</span><b>{v}</b></div>)}
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label">Default retention</label><select className="form-select"><option>7 years</option><option>10 years</option><option>5 years</option><option>3 years</option></select></div>
            <div className="col-md-6"><label className="form-label">Archive after</label><select className="form-select"><option>1 year</option><option>6 months</option><option>2 years</option></select></div>
            <div className="col-md-6"><label className="form-label">Compression</label><select className="form-select"><option>Zstandard (zstd)</option><option>Gzip</option><option>None</option></select></div>
            <div className="col-md-6"><label className="form-label">Replication</label><select className="form-select"><option>3 replicas</option><option>5 replicas</option></select></div>
            <div className="col-12"><label className="form-label">Deletion policy</label><select className="form-select"><option>No manual deletion (immutable)</option><option>Soft delete after retention</option><option>Hard delete after retention</option></select></div>
          </div>
        )}
        {step === 2 && (
          <div className="pm-card pm-card-pad">
            <Badge tone="blue" dot>Changes pending review</Badge>
            <h6 className="mt-3">Summary</h6>
            <div className="pm-note"><i className="bi bi-info-circle me-1" />Retention policy changes require Super Admin approval and are logged in the audit trail.</div>
            <div className="pm-kv"><span className="k">Status</span><span className="v">Pending approval</span></div>
            <div className="pm-kv"><span className="k">Audit log</span><span className="v">Will be recorded</span></div>
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => step > 0 ? setStep(step - 1) : (setStep(0), onClose())}>{step > 0 ? "← Back" : "Cancel"}</button>
        {step < 2 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(step + 1)}>Continue →</button>
          : <button className="btn btn-primary btn-sm" onClick={() => { setStep(0); push({ kind: "success", title: "Retention policy updated", body: "Changes submitted for Super Admin approval." }); onClose(); }}>
            <i className="bi bi-check2 me-1" />Submit for approval
          </button>}
      </div>
    </Modal>
  );
}

/* =================================================================
   7. COMPLIANCE CHECKLIST MODAL
   ================================================================= */
export function ComplianceChecklistModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [checks, setChecks] = useState<Record<string, boolean>>({
    "Access control review completed": true, "Privileged access log exported": true, "Change management evidence gathered": true,
    "Incident response records reviewed": false, "Data classification audit done": false, "Network security review completed": false,
    "MFA compliance verified": true, "Session timeout policy confirmed": true, "IP restriction rules validated": true,
    "Separation of duties verified": true, "Backup integrity confirmed": false, "Penetration test results attached": false
  });
  const completed = Object.values(checks).filter(Boolean).length;
  const total = Object.keys(checks).length;

  return (
    <Modal open={open} onClose={onClose} title="Compliance Checklist" subtitle={`${completed}/${total} items completed`} icon="bi-clipboard-check" tone="violet" size="lg">
      <div className="pm-modal-body">
        <div className="mb-3">
          <div className="d-flex justify-content-between mb-1"><span className="small fw-bold">Progress</span><span className="small text-muted">{Math.round(completed / total * 100)}%</span></div>
          <div style={{ height: 8, background: "#e5e7eb", borderRadius: 4 }}><div style={{ height: "100%", width: `${completed / total * 100}%`, background: completed === total ? "#12b76a" : "#2e90fa", borderRadius: 4, transition: "width 0.3s" }} /></div>
        </div>
        {Object.entries(checks).map(([item, done]) => (
          <label key={item} className="d-flex align-items-center gap-3 py-2 border-bottom" style={{ cursor: "pointer" }}>
            <input type="checkbox" className="form-check-input" checked={done} onChange={e => setChecks(p => ({ ...p, [item]: e.target.checked }))} />
            <span className="small" style={{ textDecoration: done ? "line-through" : "none", opacity: done ? 0.6 : 1 }}>{item}</span>
            {done && <i className="bi bi-check-circle-fill text-success ms-auto" />}
          </label>
        ))}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-primary btn-sm" disabled={completed < total} onClick={() => { push({ kind: "success", title: "Compliance checklist completed", body: "All items verified. Evidence package ready." }); onClose(); }}>
          <i className="bi bi-check2 me-1" />Complete checklist
        </button>
      </div>
    </Modal>
  );
}

/* =================================================================
   8. ADMIN ACTIVITY TIMELINE MODAL
   ================================================================= */
export function AdminActivityTimelineModal({ open, admin, onClose }: { open: boolean; admin: string; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title={`${admin} — Activity Timeline`} subtitle="Chronological admin activity trail" icon="bi-clock-history" tone="blue" size="lg">
      <div className="pm-modal-body">
        {[
          { time: "14:32", action: "Froze user PAY-89234", type: "Critical", detail: "Fraud suspicion" },
          { time: "13:15", action: "Approved settlement SET-4456", type: "Info", detail: "KES 4.2M" },
          { time: "12:00", action: "Updated fee config FEE-MP-CO", type: "Medium", detail: "Rate change 2.0% → 1.75%" },
          { time: "10:30", action: "Exported report RPT-TXN-AUG", type: "Medium", detail: "1.2M rows" },
          { time: "09:15", action: "Created SAR SAR-2026-035", type: "High", detail: "User PAY-55667" },
          { time: "08:15", action: "Logged in from 192.168.1.42", type: "Info", detail: "MFA verified" }
        ].map((event, i) => (
          <div key={i} className="d-flex gap-3 py-2 border-bottom">
            <div className="d-flex flex-column align-items-center" style={{ width: 20 }}>
              <div className="rounded-circle" style={{ width: 10, height: 10, background: event.type === "Critical" ? "#d92d20" : event.type === "High" ? "#f79009" : event.type === "Medium" ? "#2e90fa" : "#12b76a" }} />
              {i < 5 && <div style={{ width: 1, flex: 1, background: "#e5e7eb", marginTop: 4 }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div className="d-flex justify-content-between"><b className="small">{event.action}</b><Badge tone={event.type === "Critical" ? "red" : event.type === "High" ? "amber" : event.type === "Medium" ? "blue" : "green"}>{event.type}</Badge></div>
              <div className="pm-td-sub">{event.detail}</div>
              <div className="mono text-muted" style={{ fontSize: ".7rem" }}>{event.time} EAT</div>
            </div>
          </div>
        ))}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-primary btn-sm" onClick={onClose}><i className="bi bi-download me-1" />Export timeline</button>
      </div>
    </Modal>
  );
}

/* =================================================================
   9. INTEGRITY REPORT MODAL
   ================================================================= */
export function IntegrityReportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  return (
    <Modal open={open} onClose={onClose} title="Audit Integrity Report" subtitle="Hash chain validation and tamper detection results" icon="bi-shield-check" tone="green" size="lg">
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3 text-center">
          <i className="bi bi-patch-check-fill text-success" style={{ fontSize: 48 }} />
          <h6 className="mt-2">All integrity checks passed</h6>
          <p className="small text-muted">2,340,000 entries validated across 3 replicas</p>
        </div>
        <div className="row g-3 mb-3">
          {[["2,340,000", "Total entries", "green"], ["3/3", "Replicas in sync", "green"], ["0", "Tampering detected", "green"], ["100%", "Chain validity", "green"]].map(([val, label, color]) => (
            <div className="col-3" key={label}><div className="pm-card pm-card-pad text-center"><div className="h5 mb-0">{val}</div><Badge tone={color}>{label}</Badge></div></div>
          ))}
        </div>
        <div className="pm-card pm-card-pad">
          <h6>Verification details</h6>
          {[["Chain status", "Valid — no breaks"], ["Oldest entry", "Jan 15, 2024 08:00 EAT"], ["Newest entry", "Aug 27, 2026 14:32:01 EAT"], ["Last full check", "Today 14:32:05 EAT"], ["Hash algorithm", "SHA-256"], ["Signature", "HSM-backed RSA-4096"]].map(([k, v]) => <div className="d-flex justify-content-between py-1 border-bottom small" key={k}><span className="text-muted">{k}</span><b>{v}</b></div>)}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Integrity report exported" }); onClose(); }}><i className="bi bi-download me-1" />Export report</button>
      </div>
    </Modal>
  );
}

/* =================================================================
   10. FORENSIC INVESTIGATION WIZARD (4-step)
   ================================================================= */
export function ForensicInvestigationWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const steps = [{ label: "Scope", icon: "bi-funnel" }, { label: "Evidence", icon: "bi-search" }, { label: "Analysis", icon: "bi-graph-up" }, { label: "Report", icon: "bi-file-earmark" }];

  return (
    <Modal open={open} onClose={() => { setStep(0); onClose(); }} title="Forensic Investigation" subtitle={`Step ${step + 1} of 4: ${steps[step].label}`} icon="bi-search" tone="amber" size="lg">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
      <Steps current={step} steps={steps} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div className="row g-3">
            <div className="col-12"><label className="form-label">Investigation title</label><input className="form-control" placeholder="e.g. Unauthorized data export investigation" /></div>
            <div className="col-md-6"><label className="form-label">Date range start</label><input className="form-control" type="date" defaultValue="2026-08-20" /></div>
            <div className="col-md-6"><label className="form-label">Date range end</label><input className="form-control" type="date" defaultValue="2026-08-27" /></div>
            <div className="col-12"><label className="form-label">Focus areas</label>
              {["Admin actions", "API calls", "Data exports", "Login attempts", "Financial transactions", "Permission changes"].map(area => (
                <label key={area} className="d-flex align-items-center gap-2 mb-1" style={{ fontSize: ".85rem" }}><input type="checkbox" className="form-check-input" defaultChecked={area !== "API calls"} />{area}</label>
              ))}
            </div>
          </div>
        )}
        {step === 1 && (
          <div>
            <p className="small text-muted mb-3">Select evidence sources for the investigation.</p>
            {["Audit trail (immutable)", "Admin session logs", "API access logs", "Fraud engine alerts", "Database change logs", "Support ticket history"].map(src => (
              <label key={src} className="d-flex align-items-center gap-2 mb-2 p-2 border-bottom" style={{ fontSize: ".85rem" }}><input type="checkbox" className="form-check-input" defaultChecked />{src}</label>
            ))}
            <div className="pm-note mt-3"><i className="bi bi-shield-lock me-1" />Evidence collection is logged and cannot be modified after collection.</div>
          </div>
        )}
        {step === 2 && (
          <div className="pm-card pm-card-pad">
            <h6>Analysis summary</h6>
            <div className="pm-kv"><span className="k">Events analyzed</span><span className="v">4,523</span></div>
            <div className="pm-kv"><span className="k">Anomalies detected</span><span className="v">3</span></div>
            <div className="pm-kv"><span className="k">Affected admins</span><span className="v">1</span></div>
            <div className="pm-kv"><span className="k">Time span</span><span className="v">7 days</span></div>
            <div className="pm-kv"><span className="k">Evidence sources</span><span className="v">6</span></div>
          </div>
        )}
        {step === 3 && (
          <div className="pm-card pm-card-pad">
            <Badge tone="green" dot>Investigation complete</Badge>
            <h6 className="mt-3">Report summary</h6>
            <p className="small text-muted">A signed forensic report has been generated with all evidence collected during the investigation.</p>
            <div className="pm-kv"><span className="k">Report format</span><span className="v">Signed PDF</span></div>
            <div className="pm-kv"><span className="k">Evidence included</span><span className="v">6 sources</span></div>
            <div className="pm-kv"><span className="k">Digital signature</span><span className="v">HSM-backed</span></div>
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => step > 0 ? setStep(step - 1) : (setStep(0), onClose())}>{step > 0 ? "← Back" : "Cancel"}</button>
        {step < 3 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(step + 1)}>Continue →</button>
          : <button className="btn btn-primary btn-sm" onClick={() => { setStep(0); push({ kind: "success", title: "Forensic report generated", body: "Signed report available for download." }); onClose(); }}><i className="bi bi-download me-1" />Download report</button>}
      </div>
    </Modal>
  );
}

/* =================================================================
   11. SEARCH RESULTS MODAL — Advanced search with results
   ================================================================= */
export function AuditSearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Audit Search Results" subtitle="1,842 matching entries across immutable logs" icon="bi-funnel" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["1,842", "entries found", "blue"], ["23", "critical", "red"], ["156", "warnings", "amber"], ["1,663", "info", "green"]].map(x => <div className="col-md-3" key={x[1]}><div className="pm-card pm-card-pad text-center"><div className="h5 mb-0">{x[0]}</div><div className="small text-muted">{x[1]}</div></div></div>)}</div>
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Time</th><th>Admin</th><th>Action</th><th>Target</th><th>Result</th></tr></thead><tbody>
          {[["14:32:01", "Joseph M.", "Freeze", "User #89234", "Success"], ["14:15:23", "Sarah K.", "Approve", "SET-4456", "Success"], ["13:45:12", "James O.", "Update", "FEE-MP-CO", "Success"], ["12:30:00", "David K.", "Create", "SAR-2026-035", "Success"]].map(r => <tr key={r[0]}><td className="mono">{r[0]}</td><td className="pm-td-strong">{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td><Badge tone="green" dot>{r[4]}</Badge></td></tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Results exported" }); onClose(); }}>Export results</button></div>
    </Modal>
  );
}

/* =================================================================
   12. REAL-TIME FEED MODAL
   ================================================================= */
export function RealtimeFeedModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Real-time Audit Feed" subtitle="Live streaming of audit events" icon="bi-broadcast" tone="green" size="lg">
      <div className="pm-modal-body">
        <div className="d-flex align-items-center gap-2 mb-3"><div className="rounded-circle bg-success" style={{ width: 8, height: 8, animation: "statusPulse 2s ease-in-out infinite" }} /><span className="small text-success fw-bold">LIVE</span><span className="small text-muted ms-2">Auto-refresh every 2 seconds</span></div>
        {[["14:32:05", "System", "Ingest", "Admin UI", "78,234 events today"], ["14:32:01", "Joseph M.", "Freeze", "User #89234", "Fraud suspicion"], ["14:15:23", "Sarah K.", "Approve", "SET-4456", "KES 4.2M"], ["13:45:12", "James O.", "Update", "FEE-MP-CO", "Rate change"], ["13:00:45", "Mary W.", "Export", "RPT-TXN-AUG", "1.2M rows"]].map((e, i) => <div className="d-flex align-items-center gap-2 py-2 border-bottom small" key={i} style={{ opacity: 1 - i * 0.12 }}><span className="mono text-muted" style={{ width: 80 }}>{e[0]}</span><b className="pm-td-strong" style={{ width: 80 }}>{e[1]}</b><Badge tone="blue" style={{ width: 70 }}>{e[2]}</Badge><span className="pm-td-strong">{e[3]}</span><span className="text-muted ms-auto">{e[4]}</span></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* =================================================================
   13. EVIDENCE EXPORT WIZARD (3-step)
   ================================================================= */
export function AuditEvidenceExportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const steps = [{ label: "Scope", icon: "bi-funnel" }, { label: "Filters", icon: "bi-search" }, { label: "Export", icon: "bi-download" }];

  return (
    <Modal open={open} onClose={() => { setStep(0); onClose(); }} title="Export Audit Evidence" subtitle={`Step ${step + 1} of 3: ${steps[step].label}`} icon="bi-download" tone="blue" size="lg">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / 3) * 100}%` }} /></div>
      <Steps current={step} steps={steps} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label">Date range</label><select className="form-select"><option>Last 7 days</option><option>Last 30 days</option><option>Last quarter</option><option>Custom range</option></select></div>
            <div className="col-md-6"><label className="form-label">Format</label><select className="form-select"><option>Signed PDF + CSV</option><option>JSON (machine-readable)</option><option>SIEM-compatible</option></select></div>
          </div>
        )}
        {step === 1 && (
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label">Action types</label><input className="form-control" value="Login, Create, Update, Approve, Export, Delete" readOnly /></div>
            <div className="col-md-6"><label className="form-label">Admins</label><input className="form-control" value="All administrators" readOnly /></div>
            <div className="col-12"><label className="form-label">Reason for export</label><textarea className="form-control" rows={2} defaultValue="Regulatory evidence pack for quarterly access control review." /></div>
          </div>
        )}
        {step === 2 && (
          <div className="pm-card pm-card-pad">
            <h6>Export summary</h6>
            <div className="pm-kv"><span className="k">Entries</span><span className="v">~2,842</span></div>
            <div className="pm-kv"><span className="k">Format</span><span className="v">Signed PDF + CSV</span></div>
            <div className="pm-kv"><span className="k">Signature</span><span className="v">HSM-backed RSA-4096</span></div>
            <div className="pm-kv"><span className="k">Integrity</span><span className="v">SHA-256 chain included</span></div>
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => step > 0 ? setStep(step - 1) : (setStep(0), onClose())}>{step > 0 ? "← Back" : "Cancel"}</button>
        {step < 2 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(step + 1)}>Continue →</button>
          : <button className="btn btn-primary btn-sm" onClick={() => { setStep(0); push({ kind: "success", title: "Evidence export queued" }); onClose(); }}><i className="bi bi-download me-1" />Generate signed export</button>}
      </div>
    </Modal>
  );
}

/* =================================================================
   14. DATA SOURCE CONFIG MODAL
   ================================================================= */
export function DataSourceConfigModal({ open, source, onClose }: { open: boolean; source: any; onClose: () => void }) {
  if (!open || !source) return null;
  return (
    <Modal open onClose={onClose} title={`Source: ${source.name}`} subtitle="Health, configuration and ingestion details" icon="bi-diagram-3" tone="green">
      <div className="pm-modal-body">
        <div className="row g-3">
          {[["Events today", source.count], ["Ingestion rate", source.ingestionRate || "14.2 events/sec"], ["Avg event size", source.avgEventSize || "1.2 KB"], ["Latency", source.latency || "< 50ms"], ["Integrity", "Hash-chained"], ["Encryption", source.encryption || "AES-256"], ["Retention", source.retention || "7 years"], ["Status", source.status]].map(([k, v]) => <div className="col-md-6" key={k}><label className="form-label">{k}</label><input className="form-control" value={v} readOnly /></div>)}
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* =================================================================
   15. FINDING DETAIL MODAL (enhanced)
   ================================================================= */
export function FindingDetailModal({ open, finding, onClose }: { open: boolean; finding: any; onClose: () => void }) {
  const { push } = useToast();
  if (!open || !finding) return null;
  return (
    <Modal open onClose={onClose} title={`Finding: ${finding.finding}`} subtitle="Control weakness detail with remediation plan" icon="bi-shield-exclamation" tone="amber" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">
          <div className="col-md-6"><label className="form-label">Severity</label><Badge tone={finding.severity === "High" ? "red" : finding.severity === "Medium" ? "amber" : "green"}>{finding.severity}</Badge></div>
          <div className="col-md-6"><label className="form-label">Status</label><Badge tone={finding.status === "Open" ? "red" : finding.status === "In progress" ? "amber" : "green"}>{finding.status || "Open"}</Badge></div>
          <div className="col-md-6"><label className="form-label">Assigned to</label><input className="form-control" value={finding.assignedTo || "Unassigned"} readOnly /></div>
          <div className="col-md-6"><label className="form-label">Due date</label><input className="form-control" value={finding.dueDate || "—" } readOnly /></div>
          <div className="col-12"><label className="form-label">Description</label><textarea className="form-control" rows={2} value={finding.details} readOnly /></div>
          <div className="col-12"><label className="form-label">Recommendation</label><textarea className="form-control" rows={2} value={finding.recommendation} readOnly /></div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Remediation task created" }); onClose(); }}>Assign remediation</button>
      </div>
    </Modal>
  );
}

/* =================================================================
   16. DATA CLASSIFICATION MODAL
   ================================================================= */
export function DataClassificationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Audit Data Classification" subtitle="How audit data is classified and protected" icon="bi-tags" tone="blue">
      <div className="pm-modal-body">
        {[["Critical", "Admin actions on financial data, SAR filings, account closures", "red", "Encrypted + HSM signed"],
          ["Confidential", "Admin login, permission changes, session data", "amber", "Encrypted at rest"],
          ["Internal", "System events, API health, performance metrics", "blue", "Standard encryption"],
          ["Public", "Platform status, uptime metrics", "green", "No special handling"]
        ].map(([level, desc, color, protection]) => (
          <div className="pm-card pm-card-pad mb-2" key={level}>
            <div className="d-flex justify-content-between align-items-center">
              <div><Badge tone={color}>{level}</Badge><div className="small mt-1">{desc}</div></div>
              <div className="small text-muted">{protection}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* =================================================================
   17. BULK ACTION CONFIRMATION MODAL
   ================================================================= */
export function BulkActionModal({ open, title, count, onClose, onConfirm }: { open: boolean; title: string; count: number; onClose: () => void; onConfirm: () => void }) {
  const [confirm, setConfirm] = useState("");
  if (!open) return null;
  return (
    <Modal open onClose={() => { setConfirm(""); onClose(); }} title={title} subtitle="Bulk action requires confirmation" icon="bi-lightning" tone="amber">
      <div className="pm-modal-body">
        <div className="pm-note mb-3" style={{ borderLeft: "3px solid var(--pm-danger)", background: "var(--pm-danger-soft)" }}>
          <div className="pm-td-strong" style={{ color: "var(--pm-danger)" }}><i className="bi bi-exclamation-triangle me-1" />This action affects {count} records</div>
        </div>
        <label className="form-label" style={{ color: "var(--pm-danger)" }}>Type CONFIRM to proceed</label>
        <input className="form-control" style={{ borderColor: "var(--pm-danger)" }} placeholder="Type CONFIRM" value={confirm} onChange={e => setConfirm(e.target.value)} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => { setConfirm(""); onClose(); }}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={confirm !== "CONFIRM"} onClick={() => { setConfirm(""); onConfirm(); onClose(); }}><i className="bi bi-check2 me-1" />Confirm action</button>
      </div>
    </Modal>
  );
}
