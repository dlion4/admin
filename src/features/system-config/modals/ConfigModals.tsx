import { useState } from "react";
import { Badge, Modal, Drawer, Steps, useToast } from "../../../components/ui";
import type { AuditLogEntry, DocumentRecord, SecurityPolicy, SystemHealth } from "../data/configData";

/* ================================================================
   1. Config Change Detail Modal
   ================================================================ */
export function ConfigChangeDetailModal({ open, onClose, record }: { open: boolean; onClose: () => void; record?: { date: string; admin: string; setting: string; oldValue: string; newValue: string; reason: string; status?: string } }) {
  if (!open) return null;
  const r = record || { date: "Aug 15, 2026", admin: "Joseph M.", setting: "Primary color", oldValue: "#2E7D32", newValue: "#1B5E20", reason: "Brand refresh", status: "Deployed" };
  return (
    <Modal open onClose={onClose} title="Configuration Change Detail" subtitle="Versioned change with before/after values" icon="bi-sliders" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3">
          {[["Setting", r.setting], ["Admin", r.admin], ["Date", r.date], ["Status", r.status || "Deployed"]].map(x => <div className="col-md-6" key={x[0]}><label className="form-label">{x[0]}</label><input className="form-control" value={x[1]} readOnly /></div>)}
          <div className="col-md-6"><label className="form-label">Old value</label><input className="form-control" value={r.oldValue} readOnly /></div>
          <div className="col-md-6"><label className="form-label">New value</label><input className="form-control" value={r.newValue} readOnly /></div>
          <div className="col-12"><label className="form-label">Reason</label><textarea className="form-control" rows={2} value={r.reason} readOnly /></div>
        </div>
        <h6 className="mt-3">Approval chain</h6>
        {[["1. " + r.admin + " submitted", r.date + ", 10:00", "green"], ["2. Auto-staged in staging", r.date + ", 10:01", "green"], ["3. " + r.admin + " approved", r.date + ", 14:00", "green"], ["4. Deployed to production", r.date + ", 16:00", "green"]].map(a => <div className="d-flex align-items-center gap-2 py-1 border-bottom small" key={a[0]}><i className={`bi bi-check-circle-fill text-${a[2]}`} /><span>{a[0]}</span><span className="text-muted ms-auto">{a[1]}</span></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ================================================================
   2. Brand Preview Modal
   ================================================================ */
export function BrandPreviewModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Brand Preview" subtitle="Live preview of current PayMo brand system" icon="bi-palette" tone="green" size="lg">
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="d-flex align-items-center gap-3 mb-3">
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "#1B5E20", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 18 }}>P</div>
            <div><h5 className="mb-0">PayMo</h5><span className="small text-muted">Digital Bank</span></div>
          </div>
          <div className="row g-3">{[["Primary", "#1B5E20", "#1B5E20"], ["Secondary", "#FFD600", "#FFD600"], ["Success", "#12b76a", "#12b76a"], ["Warning", "#f79009", "#f79009"], ["Error", "#f04438", "#f04438"]].map(c => <div className="col" key={c[0]}><div style={{ width: "100%", height: 32, borderRadius: 8, background: c[2] }} /><div className="small text-muted mt-1">{c[0]}</div><div className="mono small">{c[1]}</div></div>)}</div>
        </div>
        <h6>Surfaces</h6>
        {["Admin dashboard (this)", "Customer mobile app", "Email templates (SendGrid)", "SMS sender: PayMo", "Transaction receipts", "Landing page"].map(s => <div className="d-flex align-items-center gap-2 py-1 border-bottom small" key={s}><i className="bi bi-check-circle-fill text-success" /><span>{s}</span></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ================================================================
   3. Notification Channel Config Modal
   ================================================================ */
export function NotifyChannelConfigModal({ open, channel, onClose }: { open: boolean; channel: string; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`Configure ${channel}`} subtitle="Provider credentials and delivery settings" icon="bi-bell" tone="blue">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Provider</label><input className="form-control" value={channel === "SMS" ? "Africa's Talking" : channel === "Email" ? "SendGrid" : channel === "Push (iOS)" ? "APNs" : channel === "WhatsApp" ? "Twilio" : channel === "USSD" ? "Safaricom" : "FCM"} readOnly /></div>
          <div className="col-md-6"><label className="form-label">Status</label><Badge tone="green" dot>Healthy</Badge></div>
          <div className="col-12"><label className="form-label">Configuration</label><textarea className="form-control" rows={3} value={channel === "SMS" ? "API key: AT-****4567\nSender name: PayMo\nSender ID: PayMo" : channel === "Email" ? "API key: SG-****8901\nTemplates: 12 active\nSender: noreply@paymo.co.ke" : channel === "Push (iOS)" ? "Certificate: uploaded\nBundle ID: co.ke.paymo.app" : channel === "WhatsApp" ? "Account SID: TW-****1234\nTemplate: Approved" : "Short code: *334#"} readOnly /></div>
          <div className="col-md-6"><label className="form-label">Delivered (24h)</label><input className="form-control" value={channel === "SMS" ? "12,456" : channel === "Email" ? "45,678" : "89,012"} readOnly /></div>
          <div className="col-md-6"><label className="form-label">Delivery rate</label><input className="form-control" value="99.7%" readOnly /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button><button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Channel configured" }); onClose(); }}>Save configuration</button></div>
    </Modal>
  );
}

/* ================================================================
   4. Rate Limit Editor Modal
   ================================================================ */
export function RateLimitEditorModal({ open, endpoint, onClose }: { open: boolean; endpoint: string; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`Edit Rate Limit: ${endpoint}`} subtitle="Configure traffic protection rules" icon="bi-speedometer2" tone="amber">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Requests per window</label><input className="form-control" defaultValue="1000" /></div>
          <div className="col-md-6"><label className="form-label">Window (seconds)</label><input className="form-control" defaultValue="60" /></div>
          <div className="col-md-6"><label className="form-label">Applies to</label><select className="form-select"><option>All</option><option>API users</option><option>Admins</option></select></div>
          <div className="col-md-6"><label className="form-label">Response on limit</label><select className="form-select"><option>429 Too Many Requests</option><option>Queue and delay</option><option>Drop silently</option></select></div>
          <div className="col-12"><label className="form-label">Test in staging first</label><div className="form-check"><input className="form-check-input" type="checkbox" id="rl-test" defaultChecked /><label className="form-check-label small" htmlFor="rl-test">Deploy to staging before production</label></div></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button><button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Rate limit updated" }); onClose(); }}>Save and deploy</button></div>
    </Modal>
  );
}

/* ================================================================
   5. Feature Toggle Editor Modal
   ================================================================ */
export function FeatureToggleEditorModal({ open, feature, onClose }: { open: boolean; feature: string; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`Configure: ${feature}`} subtitle="Rollout control and targeting" icon="bi-flag" tone="amber" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">State</label><select className="form-select"><option>Enabled</option><option>Beta</option><option>Disabled</option></select></div>
          <div className="col-md-6"><label className="form-label">Rollout percentage</label><div className="input-group"><input className="form-control" defaultValue="20" /><span className="input-group-text">%</span></div></div>
          <div className="col-md-6"><label className="form-label">Target audience</label><select className="form-select"><option>Random users</option><option>Specific segment</option><option>Whitelist</option></select></div>
          <div className="col-md-6"><label className="form-label">Owner</label><select className="form-select"><option>Product</option><option>Engineering</option><option>ML Team</option></select></div>
          <div className="col-12"><label className="form-label">Fallback behavior</label><textarea className="form-control" rows={2} defaultValue="Fallback to current production behaviour when flag is disabled." /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button><button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Feature toggle updated" }); onClose(); }}>Save with approval</button></div>
    </Modal>
  );
}

/* ================================================================
   6. Maintenance Window Wizard (4-step, fully functional)
   ================================================================ */
export function MaintenanceWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState("Scheduled");
  if (!open) return null;
  return (
    <Modal open onClose={() => { setStep(0); onClose(); }} title="Schedule Maintenance" subtitle={`Step ${step + 1} of 4: ${["Window", "Message", "Impact", "Review"][step]}`} icon="bi-tools" tone="amber" size="lg">
      <Steps current={step} steps={[{ label: "Window", icon: "bi-calendar3" }, { label: "Message", icon: "bi-chat-text" }, { label: "Impact", icon: "bi-people" }, { label: "Review", icon: "bi-check2" }]} />
      <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 25}%` }} /></div>
      <div className="pm-modal-body">
        <div className="pm-note mb-3"><i className="bi bi-shield-lock me-1" />Only Super Admins can schedule maintenance. All changes are audit-logged.</div>
        {step === 0 && <div className="row g-3"><div className="col-md-6"><label className="form-label">Day</label><select className="form-select"><option>Saturday</option><option>Sunday</option></select></div><div className="col-md-6"><label className="form-label">Time window</label><input className="form-control" defaultValue="02:00 – 06:00 EAT" /></div><div className="col-md-6"><label className="form-label">Duration</label><input className="form-control" defaultValue="4 hours" readOnly /></div><div className="col-md-6"><label className="form-label">Mode</label><select className="form-select" value={mode} onChange={e => setMode(e.target.value)}><option>Scheduled</option><option>Emergency · 2FA required</option></select></div></div>}
        {step === 1 && <div className="row g-3"><div className="col-12"><label className="form-label">User-facing message</label><textarea className="form-control" rows={3} defaultValue="PayMo is performing scheduled maintenance. All services will resume shortly." /></div><div className="col-12"><label className="form-label">Notification channels</label><div className="form-check"><input className="form-check-input" type="checkbox" id="mw-push" defaultChecked /><label className="form-check-label small" htmlFor="mw-push">Push notification · 1 hour before</label></div><div className="form-check"><input className="form-check-input" type="checkbox" id="mw-sms" defaultChecked /><label className="form-check-label small" htmlFor="mw-sms">SMS · 1 hour before</label></div><div className="form-check"><input className="form-check-input" type="checkbox" id="mw-email" /><label className="form-check-label small" htmlFor="mw-email">Email · 24 hours before</label></div></div></div>}
        {step === 2 && <div><h6>Impact assessment</h6>{[["Affected users", "All active users (~42,000)"], ["Kill sessions", "Yes"], ["Admin access", "Yes (restricted)"], ["Payment processing", "Briefly interrupted"], ["Scheduled jobs", "Paused"], ["Recovery time", "< 5 minutes after window"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b>{x[1]}</b></div>)}</div>}
        {step === 3 && <div className="text-center py-3"><Badge tone="green" dot>Ready to schedule</Badge><h6 className="mt-3">Maintenance window summary</h6><p className="small text-muted">Sunday 02:00–06:00 EAT · 4h window · {mode} mode · Push + SMS notification</p><div className="pm-card pm-card-pad mt-3 text-start"><div className="pm-eyebrow mb-2">Pre-flight Checklist</div>{["Database backup scheduled", "Failover region warmed up", "Stakeholders notified", "Rollback plan documented"].map(c => <div className="d-flex align-items-center gap-2 py-1 border-bottom small" key={c}><i className="bi bi-check-circle-fill text-success" /><span>{c}</span></div>)}</div></div>}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={() => step ? setStep(step - 1) : (setStep(0), onClose())}>{step ? "← Back" : "Cancel"}</button>{step < 3 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(step + 1)}>Continue →</button> : <button className="btn btn-primary btn-sm" onClick={() => { setStep(0); push({ kind: "success", title: "Maintenance scheduled", body: "Window queued for Super Admin confirmation." }); onClose(); }}><i className="bi bi-check2 me-1" />Schedule window</button>}</div>
    </Modal>
  );
}

/* ================================================================
   7. Security Posture Drawer
   ================================================================ */
export function SecurityPostureDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Drawer open onClose={onClose} title="Security Posture" subtitle="Platform security controls and configuration" icon="bi-shield-lock" wide>
      <div className="pm-card pm-card-pad mb-3"><Badge tone="green" dot>Hardened</Badge>
        <h6 className="mt-3">Transport security</h6>
        {[["HTTPS / HSTS", "Enabled · 1 year"], ["TLS minimum", "1.3"], ["CSP headers", "Strict"], ["Certificate", "Let's Encrypt · auto-renew"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b>{x[1]}</b></div>)}
      </div>
      <div className="pm-card pm-card-pad mb-3"><h6>Application security</h6>
        {[["Session cookie", "HttpOnly · Secure · SameSite=Strict"], ["CSRF protection", "Enabled"], ["XSS filtering", "Strict CSP"], ["Input validation", "Server-side + client-side"], ["File uploads", "PDF, JPG, PNG · max 10MB"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b>{x[1]}</b></div>)}
      </div>
      <div className="pm-card pm-card-pad"><h6>Secret management</h6>
        {[["Encryption at rest", "AES-256"], ["Key management", "AWS KMS · auto-rotation"], ["Secret storage", "Encrypted vault"], ["Rotation policy", "90 days"], ["Last rotation", "Aug 1, 2026"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b>{x[1]}</b></div>)}
      </div>
    </Drawer>
  );
}

/* ================================================================
   8. Config Version Diff Modal
   ================================================================ */
export function ConfigVersionDiffModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Configuration Version Diff" subtitle="Compare two configuration versions" icon="bi-code-slash" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-2 mb-3"><div className="col"><label className="form-label">Version A</label><select className="form-select"><option>v142 — Aug 22, 2026</option></select></div><div className="col"><label className="form-label">Version B</label><select className="form-select"><option>v141 — Aug 15, 2026</option></select></div></div>
        <div className="pm-card pm-card-pad">
          {[["primary_color", "#2E7D32", "#1B5E20", "changed"], ["sms_sender", "PayMo", "PayMo", "unchanged"], ["session_duration", "8h", "8h", "unchanged"], ["tls_min_version", "1.2", "1.3", "changed"]].map(d => <div className={`d-flex justify-content-between py-1 border-bottom small ${d[3] === "changed" ? "bg-warning bg-opacity-10 px-2" : ""}`} key={d[0]}><span className="mono">{d[0]}</span><div><span className="text-muted me-2">{d[1]}</span>→<span className="ms-2 fw-bold">{d[2]}</span></div></div>)}
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ================================================================
   9. Staging Promotion Modal
   ================================================================ */
export function StagingPromotionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Promote to Production" subtitle="Deploy staged configuration changes" icon="bi-cloud-upload" tone="amber">
      <div className="pm-modal-body">
        <div className="alert alert-warning small"><i className="bi bi-exclamation-triangle me-1" />3 configuration changes are staged. Deployment requires Super Admin 2FA.</div>
        <h6>Staged changes</h6>
        {[["primary_color", "#2E7D32 → #1B5E20", "Aug 22"], ["sms_rate_limit", "100 → 200/min", "Aug 20"], ["session_duration", "8h → 12h", "Aug 18"]].map(c => <div className="d-flex justify-content-between py-1 border-bottom small" key={c[0]}><div><b>{c[0]}</b><div className="pm-td-sub">{c[1]}</div></div><span className="text-muted">{c[2]}</span></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button><button className="btn btn-warning btn-sm" onClick={() => { push({ kind: "success", title: "Promotion queued" }); onClose(); }}>Deploy with 2FA</button></div>
    </Modal>
  );
}

/* ================================================================
   10. Emergency Rollback Modal
   ================================================================ */
export function EmergencyRollbackModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Emergency Configuration Rollback" subtitle="Revert to last known-good configuration" icon="bi-arrow-counterclockwise" tone="red">
      <div className="pm-modal-body">
        <div className="alert alert-danger small"><i className="bi bi-exclamation-triangle me-1" />This will revert ALL pending and recent changes to the last verified configuration.</div>
        <div className="row g-3">
          <div className="col-12"><label className="form-label">Rollback target</label><select className="form-select"><option>v140 — Aug 10, 2026 (last verified)</option><option>v138 — Aug 1, 2026</option></select></div>
          <div className="col-12"><label className="form-label">Reason for rollback</label><textarea className="form-control" rows={2} defaultValue="Production issue detected after configuration change." /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button><button className="btn btn-danger btn-sm" onClick={() => { push({ kind: "success", title: "Rollback initiated" }); onClose(); }}>Rollback now</button></div>
    </Modal>
  );
}

/* ================================================================
   11. Config Audit Trail Modal
   ================================================================ */
export function ConfigAuditTrailModal({ open, onClose }: { open: boolean; onClose: () => void; logs?: AuditLogEntry[] }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Configuration Audit Trail" subtitle="Immutable record of all configuration changes" icon="bi-clock-history" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Date</th><th>Admin</th><th>Setting</th><th>Old</th><th>New</th><th>Reason</th></tr></thead><tbody>
          {[["Aug 22", "Joseph M.", "Maintenance window", "Sat 2AM", "Sun 2AM", "Lower traffic day"], ["Aug 20", "Ops Manager", "Push provider", "Firebase", "FCM", "Better delivery"], ["Aug 15", "Joseph M.", "Primary color", "#2E7D32", "#1B5E20", "Brand refresh"], ["Aug 10", "Security Lead", "TLS min version", "1.2", "1.3", "Security hardening"], ["Aug 5", "Security Lead", "Session duration", "12h", "8h", "Security review"]].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 1 || i === 2 ? "pm-td-strong" : ""}>{c}</td>)}</tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button><button className="btn btn-primary btn-sm" onClick={onClose}><i className="bi bi-download me-1" />Export</button></div>
    </Modal>
  );
}

/* ================================================================
   12. Config Rollback Modal
   ================================================================ */
export function ConfigRollbackModal({ open, setting, onClose }: { open: boolean; setting: string; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`Rollback: ${setting}`} subtitle="Revert this setting to its previous value" icon="bi-arrow-counterclockwise" tone="amber">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Current value</label><input className="form-control" value="#1B5E20" readOnly /></div>
          <div className="col-md-6"><label className="form-label">Rollback to</label><input className="form-control" value="#2E7D32" readOnly /></div>
          <div className="col-12"><label className="form-label">Reason</label><textarea className="form-control" rows={2} defaultValue="Reverting due to user feedback on contrast." /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button><button className="btn btn-warning btn-sm" onClick={() => { push({ kind: "success", title: "Rollback queued" }); onClose(); }}>Rollback</button></div>
    </Modal>
  );
}

/* ================================================================
   13. Config Simulation Modal
   ================================================================ */
export function ConfigSimulationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Configuration Simulation" subtitle="Test rate limits and feature flags against production traffic" icon="bi-play-circle" tone="blue">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Simulation target</label><select className="form-select"><option>Rate limits</option><option>Feature flags</option><option>Both</option></select></div>
          <div className="col-md-6"><label className="form-label">Traffic sample</label><select className="form-select"><option>Last 1 hour production</option><option>Last 24 hours</option><option>Simulated load</option></select></div>
          <div className="col-md-6"><label className="form-label">Would block</label><input className="form-control" value="~23 requests (0.001%)" readOnly /></div>
          <div className="col-md-6"><label className="form-label">Would feature-gate</label><input className="form-control" value="~1,200 users (2.8%)" readOnly /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button><button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Simulation complete" }); onClose(); }}>Run simulation</button></div>
    </Modal>
  );
}

/* ================================================================
   14. Rollback History Modal
   ================================================================ */
export function RollbackHistoryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Rollback History" subtitle="Previous configuration rollbacks" icon="bi-arrow-counterclockwise" tone="amber" size="lg">
      <div className="pm-modal-body">
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Date</th><th>Admin</th><th>Setting</th><th>From</th><th>To</th><th>Reason</th></tr></thead><tbody>
          {[["Jul 28", "Joseph M.", "Rate limit (API)", "2000/min", "1000/min", "DDoS mitigation"], ["Jul 15", "Security Lead", "Session cookie", "Lax", "Strict", "Security hardening"], ["Jun 30", "Joseph M.", "Push provider", "FCM", "Firebase", "Rollback — delivery issues"]].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 1 || i === 2 ? "pm-td-strong" : ""}>{c}</td>)}</tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ================================================================
   15. Config Diff Modal (staged changes)
   ================================================================ */
export function ConfigDiffModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Configuration Diff" subtitle="Pending changes before production deployment" icon="bi-code-slash" tone="amber" size="lg">
      <div className="pm-modal-body">
        <h6>Staged changes (3)</h6>
        {[["session_duration", "8h", "12h", "Approved"], ["sms_rate_limit", "100/min", "200/min", "Approved"], ["maintenance_day", "Saturday", "Sunday", "Pending"]].map(d => <div className="pm-card pm-card-pad mb-2" key={d[0]}><div className="d-flex justify-content-between align-items-center"><b className="mono">{d[0]}</b><Badge tone={d[3] === "Approved" ? "green" : "amber"}>{d[3]}</Badge></div><div className="d-flex align-items-center gap-2 mt-1"><span className="text-muted">{d[1]}</span><i className="bi bi-arrow-right" /><span className="fw-bold">{d[2]}</span></div></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button><button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Deployed all changes" }); onClose(); }}><i className="bi bi-cloud-upload me-1" />Deploy all</button></div>
    </Modal>
  );
}

/* ================================================================
   16. Export Center Wizard (3-step)
   ================================================================ */
export function ExportCenterWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [format, setFormat] = useState("JSON");
  const [sections, setSections] = useState<string[]>(["General settings", "Feature toggles"]);
  const toggle = (s: string) => setSections(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  if (!open) return null;
  return (
    <Modal open onClose={() => { setStep(0); onClose(); }} title="Export Platform Data" subtitle={`Step ${step + 1} of 3: ${["Select sections", "Choose format", "Confirm & export"][step]}`} icon="bi-download" tone="blue" size="lg">
      <Steps current={step} steps={[{ label: "Sections", icon: "bi-list-check" }, { label: "Format", icon: "bi-file-earmark" }, { label: "Export", icon: "bi-download" }]} />
      <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 33.3}%` }} /></div>
      <div className="pm-modal-body">
        {step === 0 && <div><div className="pm-eyebrow mb-2">Select data sections to export</div>{["General settings", "Feature toggles", "Notification channels", "Rate limits", "Security policies", "API keys", "System health", "Audit logs", "Change history", "Brand settings", "Notification rules"].map(s => <label key={s} className="d-flex align-items-center gap-2 mb-2 p-2 rounded" style={{ background: sections.includes(s) ? "var(--pm-primary-soft)" : "transparent", border: "1px solid var(--pm-border)", cursor: "pointer" }}><input type="checkbox" className="form-check-input" checked={sections.includes(s)} onChange={() => toggle(s)} /><span style={{ fontSize: ".85rem" }}>{s}</span></label>)}</div>}
        {step === 1 && <div><div className="pm-eyebrow mb-2">Export format</div>{[["JSON", "Structured data format, ideal for API integration"], ["CSV", "Spreadsheet-compatible, ideal for Excel"], ["PDF", "Formatted report, ideal for audit and compliance"]].map(([f, desc]) => <button key={f} className={`w-100 text-start p-3 mb-2 rounded ${format === f ? "border-primary bg-primary bg-opacity-10" : ""}`} style={{ border: "1px solid var(--pm-border)" }} onClick={() => setFormat(f)}><div className="pm-td-strong">{f}</div><div className="pm-td-sub">{desc}</div></button>)}</div>}
        {step === 2 && <div><div className="pm-card pm-card-pad mb-3"><div className="pm-eyebrow mb-2">Export summary</div><div className="pm-kv"><span className="k">Sections</span><span className="v">{sections.length} selected</span></div><div className="pm-kv"><span className="k">Format</span><span className="v">{format}</span></div><div className="pm-kv"><span className="k">Generated by</span><span className="v">Super Admin</span></div></div><div className="pm-note"><i className="bi bi-info-circle me-1" />Exported data includes audit timestamps and admin attribution.</div></div>}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={() => step ? setStep(s => s - 1) : (setStep(0), onClose())}>{step ? "← Back" : "Cancel"}</button>{step < 2 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(s => s + 1)}>Continue →</button> : <button className="btn btn-primary btn-sm" onClick={() => { setStep(0); push({ kind: "success", title: "Export started", body: `Generating ${format} file with ${sections.length} sections...` }); onClose(); }}><i className="bi bi-download me-1" />Generate export</button>}</div>
    </Modal>
  );
}

/* ================================================================
   17. Deployment Pipeline Wizard (5-step)
   ================================================================ */
export function DeploymentPipelineWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  if (!open) return null;
  const stepsDef = [{ label: "Select", icon: "bi-list-check" }, { label: "Validate", icon: "bi-check-circle" }, { label: "Test", icon: "bi-play-circle" }, { label: "Approve", icon: "bi-shield-lock" }, { label: "Deploy", icon: "bi-cloud-upload" }];
  return (
    <Modal open onClose={() => { setStep(0); onClose(); }} title="Deployment Pipeline" subtitle={`Step ${step + 1} of 5: ${stepsDef[step].label}`} icon="bi-rocket" tone="blue" size="lg">
      <Steps current={step} steps={stepsDef} />
      <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 20}%` }} /></div>
      <div className="pm-modal-body">
        <div className="pm-note mb-3"><i className="bi bi-shield-lock me-1" />Config deployment requires 2FA and Super Admin approval.</div>
        {step === 0 && <div><div className="pm-eyebrow mb-2">Select staged changes to deploy</div>{[["session_duration", "8h → 12h", true], ["sms_rate_limit", "100 → 200/min", true], ["maintenance_day", "Saturday → Sunday", false]].map(([k, v, approved]) => <label key={k as string} className="d-flex align-items-center gap-2 mb-2 p-2 rounded" style={{ border: "1px solid var(--pm-border)" }}><input type="checkbox" className="form-check-input" defaultChecked={approved as boolean} /><div><div className="pm-td-strong mono">{k as string}</div><div className="pm-td-sub">{v as string}</div></div><Badge tone={approved ? "green" : "amber"} className="ms-auto">{approved ? "Approved" : "Pending"}</Badge></label>)}</div>}
        {step === 1 && <div><div className="pm-eyebrow mb-2">Validation results</div>{[["Schema validation", "Passed", "green"], ["Dependency check", "Passed", "green"], ["Breaking changes", "None detected", "green"], ["Environment compatibility", "Passed", "green"], ["Rollback plan", "Auto-generated", "green"]].map(([check, result, tone]) => <div className="d-flex justify-content-between align-items-center py-2 border-bottom small" key={check as string}><span>{check as string}</span><Badge tone={tone as string}>{result as string}</Badge></div>)}</div>}
        {step === 2 && <div><div className="pm-eyebrow mb-2">Staging test results</div><div className="pm-card pm-card-pad mb-2"><div className="d-flex justify-content-between align-items-center"><span className="pm-td-strong">Automated tests</span><Badge tone="green">12/12 passed</Badge></div></div><div className="pm-card pm-card-pad mb-2"><div className="d-flex justify-content-between align-items-center"><span className="pm-td-strong">Load test</span><Badge tone="green">Within thresholds</Badge></div></div><div className="pm-card pm-card-pad"><div className="d-flex justify-content-between align-items-center"><span className="pm-td-strong">Integration tests</span><Badge tone="green">All passing</Badge></div></div></div>}
        {step === 3 && <div><div className="pm-eyebrow mb-2">Approval required</div><div className="alert alert-info small"><i className="bi bi-info-circle me-1" />Enter your 2FA code to approve this deployment.</div><label className="form-label">Authenticator code (TOTP) <span style={{ color: "#f04438" }}>*</span></label><div className="d-flex gap-2 mb-2">{[0, 1, 2, 3, 4, 5].map(i => <input key={i} className="form-control text-center mono" maxLength={1} inputMode="numeric" style={{ width: 46, fontWeight: 700, fontSize: "1.05rem", padding: ".45rem 0" }} />)}</div><div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}><i className="bi bi-shield-lock me-1" />Demo code: <b className="mono">482913</b></div></div>}
        {step === 4 && <div className="text-center py-3"><Badge tone="green" dot>Ready to deploy</Badge><h6 className="mt-3">Deployment summary</h6><p className="small text-muted">3 configuration changes → production<br/>Estimated downtime: None (hot reload)<br/>Rollback available: Yes</p></div>}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={() => step ? setStep(s => s - 1) : (setStep(0), onClose())}>{step ? "← Back" : "Cancel"}</button>{step < 4 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(s => s + 1)}>Continue →</button> : <button className="btn btn-primary btn-sm" onClick={() => { setStep(0); push({ kind: "success", title: "Deployment started", body: "Changes are being deployed to production." }); onClose(); }}><i className="bi bi-cloud-upload me-1" />Deploy now</button>}</div>
    </Modal>
  );
}

/* ================================================================
   18. Emergency Rollback Wizard (4-step)
   ================================================================ */
export function EmergencyRollbackWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [confirm, setConfirm] = useState("");
  if (!open) return null;
  return (
    <Modal open onClose={() => { setStep(0); setConfirm(""); onClose(); }} title="Emergency Rollback" subtitle={`Step ${step + 1} of 4: ${["Assessment", "Target", "Confirm", "Execute"][step]}`} icon="bi-arrow-counterclockwise" tone="red" size="lg">
      <Steps current={step} steps={[{ label: "Assessment", icon: "bi-exclamation-triangle" }, { label: "Target", icon: "bi-bullseye" }, { label: "Confirm", icon: "bi-shield-lock" }, { label: "Execute", icon: "bi-play-circle" }]} />
      <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 25}%` }} /></div>
      <div className="pm-modal-body">
        {step === 0 && <div><div className="alert alert-danger small"><i className="bi bi-exclamation-triangle me-1" />Emergency rollback affects ALL active users and services.</div><h6>Current status</h6>{[["Last stable version", "v140 — Aug 10, 2026"], ["Pending changes", "3 staged"], ["Active incidents", "1 (Notification service degraded)"], ["Affected users", "~42,000"]].map(([k, v]) => <div className="d-flex justify-content-between py-1 border-bottom small" key={k}><span className="text-muted">{k}</span><b>{v}</b></div>)}</div>}
        {step === 1 && <div><div className="pm-eyebrow mb-2">Select rollback target</div>{[["v140 — Aug 10, 2026", "Last verified stable", true], ["v138 — Aug 1, 2026", "Pre-RFC change", false], ["v135 — Jul 15, 2026", "Oldest available", false]].map(([ver, desc, recommended]) => <button key={ver as string} className="w-100 text-start p-3 mb-2 rounded" style={{ border: `1px solid ${recommended ? "var(--bs-primary)" : "var(--pm-border)"}` }}><div className="d-flex justify-content-between align-items-center"><div><div className="pm-td-strong">{ver as string}</div><div className="pm-td-sub">{desc as string}</div></div>{recommended && <Badge tone="blue">Recommended</Badge>}</div></button>)}</div>}
        {step === 2 && <div><div className="alert alert-danger small"><i className="bi bi-exclamation-triangle me-1" />This action is IRREVERSIBLE and will affect all users immediately.</div><label className="form-label" style={{ color: "var(--pm-danger)" }}>Type EMERGENCY to confirm</label><input className="form-control" style={{ borderColor: "var(--pm-danger)" }} placeholder="Type EMERGENCY" value={confirm} onChange={e => setConfirm(e.target.value)} /><label className="d-flex align-items-center gap-2 mt-3" style={{ fontSize: ".82rem" }}><input type="checkbox" className="form-check-input" />I confirm this rollback is authorized</label></div>}
        {step === 3 && <div className="text-center py-3"><Badge tone="green" dot>Ready to execute</Badge><h6 className="mt-3">Rollback summary</h6><p className="small text-muted">Target: v140 — Aug 10, 2026<br/>Downtime: ~2 minutes<br/>Data loss: None (config only)</p></div>}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={() => step ? setStep(s => s - 1) : (setStep(0), setConfirm(""), onClose())}>{step ? "← Back" : "Cancel"}</button>{step < 3 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(s => s + 1)}>Continue →</button> : <button className="btn btn-danger btn-sm" disabled={confirm !== "EMERGENCY"} onClick={() => { setStep(0); setConfirm(""); push({ kind: "success", title: "Emergency rollback executed" }); onClose(); }}><i className="bi bi-arrow-counterclockwise me-1" />Execute rollback</button>}</div>
    </Modal>
  );
}

/* ================================================================
   19. Backup Wizard (3-step)
   ================================================================ */
export function BackupWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  if (!open) return null;
  return (
    <Modal open onClose={() => { setStep(0); onClose(); }} title="System Backup" subtitle={`Step ${step + 1} of 3: ${["Select scope", "Options", "Confirm"][step]}`} icon="bi-cloud-download" tone="green" size="lg">
      <Steps current={step} steps={[{ label: "Scope", icon: "bi-folder" }, { label: "Options", icon: "bi-gear" }, { label: "Confirm", icon: "bi-check2" }]} />
      <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 33.3}%` }} /></div>
      <div className="pm-modal-body">
        {step === 0 && <div><div className="pm-eyebrow mb-2">Select data to back up</div>{["All configuration data", "Database snapshot", "Audit logs", "User data", "Transaction records", "File attachments"].map(s => <label key={s} className="d-flex align-items-center gap-2 mb-2 p-2 rounded" style={{ border: "1px solid var(--pm-border)" }}><input type="checkbox" className="form-check-input" defaultChecked={s === "All configuration data" || s === "Audit logs"} /><span style={{ fontSize: ".85rem" }}>{s}</span></label>)}</div>}
        {step === 1 && <div className="row g-3"><div className="col-md-6"><label className="form-label">Encryption</label><select className="form-select"><option>AES-256 (Recommended)</option><option>AES-128</option><option>None</option></select></div><div className="col-md-6"><label className="form-label">Storage</label><select className="form-select"><option>AWS S3 (Primary)</option><option>Azure Blob</option><option>Local archive</option></select></div><div className="col-md-6"><label className="form-label">Retention</label><select className="form-select"><option>90 days</option><option>180 days</option><option>1 year</option><option>Indefinite</option></select></div><div className="col-md-6"><label className="form-label">Compression</label><select className="form-select"><option>Gzip (Recommended)</option><option>Zstandard</option><option>None</option></select></div></div>}
        {step === 2 && <div><div className="pm-card pm-card-pad mb-3"><div className="pm-eyebrow mb-2">Backup summary</div>{[["Scope", "Configuration + Audit logs"], ["Encryption", "AES-256"], ["Storage", "AWS S3"], ["Retention", "90 days"], ["Estimated size", "~12 MB"]].map(([k, v]) => <div className="pm-kv" key={k}><span className="k">{k}</span><span className="v">{v}</span></div>)}</div><div className="pm-note"><i className="bi bi-info-circle me-1" />Backup will begin immediately and typically completes in under 2 minutes.</div></div>}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={() => step ? setStep(s => s - 1) : (setStep(0), onClose())}>{step ? "← Back" : "Cancel"}</button>{step < 2 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(s => s + 1)}>Continue →</button> : <button className="btn btn-primary btn-sm" onClick={() => { setStep(0); push({ kind: "success", title: "Backup started" }); onClose(); }}><i className="bi bi-cloud-download me-1" />Start backup</button>}</div>
    </Modal>
  );
}

/* ================================================================
   20. Document Preview Modal (full letterhead preview)
   ================================================================ */
export function DocumentPreviewModal({ doc, open, onClose }: { doc: DocumentRecord | null; open: boolean; onClose: () => void }) {
  if (!open || !doc) return null;
  const rendered = doc.content.replace(/\{\{(\w+)\}\}/g, (_: string, key: string) => `<span class="doc-var">{{${key}}}</span>`);
  return (
    <Modal open onClose={onClose} title={`${doc.title} — Preview`} subtitle={`${doc.version} · ${doc.type}`} icon="bi-eye" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="doc-preview-toolbar">
          <div className="d-flex gap-2 align-items-center">
            <Badge tone={doc.status === "Active" ? "green" : "blue"}>{doc.status}</Badge>
            <span className="pm-td-sub">{doc.version}</span>
          </div>
          <div className="d-flex gap-1">
            <button className="btn btn-sm btn-outline-secondary"><i className="bi bi-printer me-1" />Print</button>
            <button className="btn btn-sm btn-outline-primary"><i className="bi bi-download me-1" />Download PDF</button>
          </div>
        </div>
        <div className="doc-preview-page">
          <div className="doc-preview-letterhead">
            <div className="doc-preview-logo">P</div>
            <div>
              <div className="doc-preview-company">PayMo Digital Bank Ltd</div>
              <div className="doc-preview-address">Westlands, Nairobi · PVT-2024-184732</div>
            </div>
          </div>
          <div className="doc-preview-meta">
            <span className="doc-preview-meta-item"><i className="bi bi-file-earmark-text me-1" />{doc.type}</span>
            <span className="doc-preview-meta-item"><i className="bi bi-person me-1" />{doc.author}</span>
            <span className="doc-preview-meta-item"><i className="bi bi-calendar me-1" />{doc.lastUpdated}</span>
          </div>
          <hr className="doc-preview-divider" />
          <div className="doc-preview-body" style={{ whiteSpace: "pre-wrap", fontFamily: "'Inter', system-ui, sans-serif", fontSize: ".82rem", lineHeight: 1.6, color: "#101828" }} dangerouslySetInnerHTML={{ __html: rendered.replace(/\n/g, "<br/>") }} />
          <hr className="doc-preview-divider" />
          <div style={{ fontSize: ".72rem", color: "#667085", textAlign: "center" }}>
            PayMo Digital Bank Ltd · Confidential · {doc.version}
          </div>
        </div>
        <div className="pm-note mt-3"><i className="bi bi-info-circle me-1" />Variables highlighted in <span className="doc-var">green</span> are template placeholders that will be replaced with live data.</div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button><button className="btn btn-primary btn-sm" onClick={onClose}><i className="bi bi-download me-1" />Download PDF</button></div>
    </Modal>
  );
}

/* ================================================================
   21. Config Template Manager Modal
   ================================================================ */
export function ConfigTemplateManagerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Configuration Templates" subtitle="Manage and apply reusable configuration presets" icon="bi-collection" tone="violet" size="lg">
      <div className="pm-modal-body">
        <div className="pm-eyebrow mb-2">Available templates</div>
        {[["Production Baseline", "47 settings", "Aug 1, 2026", "12 uses"], ["Staging Default", "42 settings", "Jul 15, 2026", "8 uses"], ["High Security", "38 settings", "Aug 10, 2026", "3 uses"], ["Partner Onboarding", "25 settings", "Jul 20, 2026", "6 uses"], ["GDPR Compliance", "31 settings", "Jun 1, 2026", "2 uses"], ["CBK Regulatory", "44 settings", "May 15, 2026", "4 uses"]].map(([name, count, date, uses]) => <div className="pm-card pm-card-pad mb-2" key={name}><div className="d-flex justify-content-between align-items-center"><div><div className="pm-td-strong">{name}</div><div className="pm-td-sub">{count} · Last applied {date}</div></div><div className="d-flex gap-1"><Badge tone="grey">{uses}</Badge><button className="btn btn-sm btn-outline-primary" onClick={() => { push({ kind: "success", title: `Template "${name}" applied` }); onClose(); }}>Apply</button><button className="btn btn-sm btn-outline-secondary"><i className="bi bi-pencil" /></button></div></div></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button><button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Template creation started" }); onClose(); }}><i className="bi bi-plus me-1" />Create template</button></div>
    </Modal>
  );
}

/* ================================================================
   22. Notification Rule Builder Modal
   ================================================================ */
export function NotificationRuleBuilderModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Notification Rule Builder" subtitle="Create and configure automated notification rules" icon="bi-bell" tone="violet" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Rule name</label><input className="form-control" placeholder="e.g. High-value transaction alert" /></div>
          <div className="col-md-6"><label className="form-label">Severity</label><select className="form-select"><option>Info</option><option>Warning</option><option>Critical</option></select></div>
          <div className="col-12"><label className="form-label">Trigger condition</label><input className="form-control" placeholder="e.g. Transaction amount > 100000" /></div>
          <div className="col-12"><label className="form-label">Channels</label><div className="d-flex gap-3">{["Push", "SMS", "Email", "In-app"].map(ch => <div className="form-check" key={ch}><input className="form-check-input" type="checkbox" id={`rule-${ch}`} defaultChecked={ch === "Push"} /><label className="form-check-label small" htmlFor={`rule-${ch}`}>{ch}</label></div>)}</div></div>
          <div className="col-12"><label className="form-label">Message template</label><textarea className="form-control" rows={3} placeholder="Dear {{user_name}}, your transaction of KES {{amount}} has been {{status}}." /></div>
          <div className="col-12"><label className="form-label">Cooldown period</label><select className="form-select"><option>5 minutes</option><option>15 minutes</option><option>1 hour</option><option>No cooldown</option></select></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button><button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Notification rule created" }); onClose(); }}><i className="bi bi-check2 me-1" />Create rule</button></div>
    </Modal>
  );
}

/* ================================================================
   23. API Key Create Wizard (5-step)
   ================================================================ */
export function ApiKeyCreateWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  if (!open) return null;
  const stepsDef = [{ label: "Details", icon: "bi-info-circle" }, { label: "Permissions", icon: "bi-key" }, { label: "Limits", icon: "bi-speedometer2" }, { label: "Security", icon: "bi-shield-lock" }, { label: "Review", icon: "bi-check2" }];
  return (
    <Modal open onClose={() => { setStep(0); onClose(); }} title="Create API Key" subtitle={`Step ${step + 1} of 5: ${stepsDef[step].label}`} icon="bi-key" tone="green" size="lg">
      <Steps current={step} steps={stepsDef} />
      <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 20}%` }} /></div>
      <div className="pm-modal-body">
        <div className="pm-note mb-3"><i className="bi bi-shield-lock me-1" />API key creation requires 2FA. All keys are audit-logged.</div>
        {step === 0 && <div className="row g-3"><div className="col-md-6"><label className="form-label">Key name</label><input className="form-control" placeholder="e.g. Partner Portal API" /></div><div className="col-md-6"><label className="form-label">Environment</label><select className="form-select"><option>Production</option><option>Staging</option><option>Development</option></select></div><div className="col-12"><label className="form-label">Description</label><textarea className="form-control" rows={2} placeholder="Purpose and owner of this API key" /></div></div>}
        {step === 1 && <div><div className="pm-eyebrow mb-2">Select permissions</div>{[["Read", "Read account data, balances, transactions"], ["Write", "Create and modify transactions"], ["Admin", "Full administrative access"], ["Transactions", "Transaction-specific operations"], ["Reports", "Generate and export reports"]].map(([perm, desc]) => <label key={perm} className="d-flex align-items-center gap-2 mb-2 p-2 rounded" style={{ border: "1px solid var(--pm-border)" }}><input type="checkbox" className="form-check-input" defaultChecked={perm === "Read"} /><div><div className="pm-td-strong">{perm}</div><div className="pm-td-sub">{desc}</div></div></label>)}</div>}
        {step === 2 && <div className="row g-3"><div className="col-md-6"><label className="form-label">Rate limit</label><select className="form-select"><option>100/min</option><option>500/min</option><option>1000/min</option><option>5000/min</option><option>Custom</option></select></div><div className="col-md-6"><label className="form-label">Daily limit</label><input className="form-control" defaultValue="100000" /></div><div className="col-md-6"><label className="form-label">Monthly limit</label><input className="form-control" defaultValue="10000000" /></div><div className="col-md-6"><label className="form-label">Expiration</label><select className="form-select"><option>30 days</option><option>90 days</option><option>180 days</option><option>Never</option></select></div></div>}
        {step === 3 && <div className="row g-3"><div className="col-12"><label className="form-label">Allowed IP ranges</label><input className="form-control" placeholder="e.g. 192.168.1.0/24, 10.0.0.0/8" /><div style={{ fontSize: ".72rem", color: "var(--pm-muted)", marginTop: ".35rem" }}>Comma-separated CIDR blocks. Leave empty for unrestricted.</div></div><div className="col-12"><label className="form-label">Webhook URL</label><input className="form-control" placeholder="https://your-server.com/webhook" /></div><div className="col-12"><label className="form-label">2FA required for key management</label><div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label small">Require 2FA for key rotation and revocation</label></div></div></div>}
        {step === 4 && <div><div className="pm-card pm-card-pad"><div className="pm-eyebrow mb-2">API Key Summary</div>{[["Name", "New API Key"], ["Environment", "Production"], ["Permissions", "Read"], ["Rate limit", "100/min"], ["Expiration", "30 days"]].map(([k, v]) => <div className="pm-kv" key={k}><span className="k">{k}</span><span className="v">{v}</span></div>)}</div><div className="pm-note mt-3"><i className="bi bi-exclamation-triangle me-1" />The API key will only be shown once. Copy it now.</div></div>}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={() => step ? setStep(s => s - 1) : (setStep(0), onClose())}>{step ? "← Back" : "Cancel"}</button>{step < 4 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(s => s + 1)}>Continue →</button> : <button className="btn btn-primary btn-sm" onClick={() => { setStep(0); push({ kind: "success", title: "API key created", body: "Copy the key — it won't be shown again." }); onClose(); }}><i className="bi bi-key me-1" />Generate key</button>}</div>
    </Modal>
  );
}

/* ================================================================
   24. Security Policy Detail Modal
   ================================================================ */
export function SecurityPolicyDetailModal({ open, onClose, policy }: { open: boolean; onClose: () => void; policy: SecurityPolicy | null }) {
  if (!open || !policy) return null;
  return (
    <Modal open onClose={onClose} title={policy.policy} subtitle={`${policy.category} · ${policy.severity} severity`} icon="bi-shield-check" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">
          {[["Category", policy.category], ["Severity", policy.severity], ["Status", policy.status], ["Last enforced", policy.lastEnforced || "—"]].map(([k, v]) => <div className="col-md-6" key={k}><label className="form-label">{k}</label><div><Badge tone={v === "Critical" ? "red" : v === "High" ? "amber" : v === "Enforced" ? "green" : "blue"}>{v}</Badge></div></div>)}
        </div>
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-eyebrow mb-1">Description</div>
          <p className="mb-0" style={{ fontSize: ".85rem" }}>{policy.description}</p>
        </div>
        <div className="pm-card pm-card-pad">
          <div className="pm-eyebrow mb-2">Compliance mapping</div>
          {[["CBK Guideline", "Section 4.2.1 — Access Controls"], ["GDPR Article", "Article 32 — Security of Processing"], ["ISO 27001", "A.9.4.2 — Secure log-on procedures"]].map(([std, ref]) => <div className="d-flex justify-content-between py-1 border-bottom small" key={std}><span className="text-muted">{std}</span><span className="mono">{ref}</span></div>)}
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ================================================================
   25. System Health Detail Drawer
   ================================================================ */
export function SystemHealthDetailDrawer({ open, onClose, service }: { open: boolean; onClose: () => void; service: SystemHealth | null }) {
  if (!open || !service) return null;
  return (
    <Drawer open onClose={onClose} title={service.service} subtitle={`${service.status} · Uptime ${service.uptime}`} icon="bi-heart-pulse" tone={service.status === "Healthy" ? "green" : "amber"} wide>
      <div className="pm-card pm-card-pad mb-3">
        <Badge tone={service.status === "Healthy" ? "green" : service.status === "Degraded" ? "amber" : "red"} dot>{service.status}</Badge>
        <div className="row g-3 mt-3">
          {["Uptime", "Latency", "Last check", "Incidents (30d)", "Owner"].map(k => {
            const v = k === "Uptime" ? service.uptime : k === "Latency" ? service.latency : k === "Last check" ? service.lastCheck : k === "Incidents (30d)" ? service.incidents30d : service.owner;
            return <div className="col-6" key={k}><div className="pm-eyebrow">{k}</div><div className="pm-td-strong">{v}</div></div>;
          })}
        </div>
      </div>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-eyebrow mb-2">Recent events</div>
        {[["Aug 27, 14:30", "Health check passed", "green"], ["Aug 27, 12:15", "Latency spike: 850ms", "amber"], ["Aug 27, 10:00", "Auto-scaled to 3 instances", "green"], ["Aug 26, 22:00", "Deployment v2.4.1 completed", "green"]].map(([time, event, tone]) => <div className="d-flex align-items-center gap-2 py-1 border-bottom small" key={time + event}><i className={`bi bi-circle-fill text-${tone}`} style={{ fontSize: ".5rem" }} /><span className="flex-grow-1">{event}</span><span className="text-muted">{time}</span></div>)}
      </div>
      <div className="pm-card pm-card-pad">
        <div className="pm-eyebrow mb-2">SLA metrics</div>
        {[["Response time SLA", "< 200ms"], ["Availability SLA", "99.95%"], ["Error rate SLA", "< 0.1%"], ["Recovery time SLA", "< 5 min"]].map(([k, v]) => <div className="d-flex justify-content-between py-1 border-bottom small" key={k}><span className="text-muted">{k}</span><b>{v}</b></div>)}
      </div>
    </Drawer>
  );
}

/* ================================================================
   26. Audit Log Filter & Export Modal
   ================================================================ */
export function AuditLogFilterModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Filter Audit Logs" subtitle="Search and filter audit trail entries" icon="bi-funnel" tone="blue">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Actor</label><select className="form-select"><option>All admins</option><option>Joseph M.</option><option>Security Lead</option><option>Ops Manager</option><option>System</option></select></div>
          <div className="col-md-6"><label className="form-label">Action</label><select className="form-select"><option>All actions</option><option>Updated</option><option>Created</option><option>Deleted</option><option>Locked</option><option>Enforced</option></select></div>
          <div className="col-md-6"><label className="form-label">Severity</label><select className="form-select"><option>All</option><option>Info</option><option>Warning</option><option>Critical</option></select></div>
          <div className="col-md-6"><label className="form-label">Date range</label><input className="form-control" type="date" /></div>
          <div className="col-12"><label className="form-label">Search</label><input className="form-control" placeholder="Search resource names or details..." /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button><button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Filters applied" }); onClose(); }}>Apply filters</button></div>
    </Modal>
  );
}

/* ================================================================
   27. Bulk Operations Modal
   ================================================================ */
export function BulkOperationsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Bulk Operations" subtitle="Perform actions on multiple records at once" icon="bi-layers" tone="violet">
      <div className="pm-modal-body">
        <div className="pm-eyebrow mb-2">Select operation type</div>
        {[["Bulk toggle features", "Enable or disable multiple feature flags at once"], ["Bulk update rate limits", "Modify rate limits across multiple endpoints"], ["Bulk lock/unlock", "Lock or unlock multiple settings simultaneously"], ["Bulk export", "Export selected configuration domains"]].map(([op, desc]) => <button key={op} className="w-100 text-start p-3 mb-2 rounded" style={{ border: "1px solid var(--pm-border)" }} onClick={() => { push({ kind: "success", title: `Bulk operation "${op}" initiated` }); onClose(); }}><div className="pm-td-strong">{op}</div><div className="pm-td-sub">{desc}</div></button>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button></div>
    </Modal>
  );
}

/* ================================================================
   28. Import Configuration Modal
   ================================================================ */
export function ImportConfigModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Import Configuration" subtitle="Upload configuration from external source" icon="bi-upload" tone="blue">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-12"><label className="form-label">Import source</label><select className="form-select"><option>JSON file</option><option>CSV file</option><option>Paste JSON</option><option>Another environment</option></select></div>
          <div className="col-12"><label className="form-label">Upload file</label><div className="p-4 text-center rounded" style={{ border: "2px dashed var(--pm-border)" }}><i className="bi bi-cloud-upload fs-1 text-muted" /><div className="mt-2 small text-muted">Click to browse or drag and drop</div><div className="small text-muted">JSON, CSV up to 10MB</div></div></div>
          <div className="col-12"><label className="form-label">Conflict resolution</label><select className="form-select"><option>Overwrite existing values</option><option>Skip conflicting settings</option><option>Merge (import takes priority)</option></select></div>
          <div className="col-12"><div className="form-check"><input className="form-check-input" type="checkbox" id="import-preview" defaultChecked /><label className="form-check-label small" htmlFor="import-preview">Preview changes before applying</label></div></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button><button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Import started" }); onClose(); }}><i className="bi bi-upload me-1" />Import</button></div>
    </Modal>
  );
}

/* ================================================================
   29. Config Health Dashboard Drawer
   ================================================================ */
export function ConfigHealthDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Drawer open onClose={onClose} title="Configuration Health" subtitle="Real-time status of all configuration services" icon="bi-activity" wide>
      {[["Core Banking API", "Healthy", "99.99%", "green"], ["Payment Gateway", "Healthy", "99.97%", "green"], ["Auth Service", "Healthy", "99.99%", "green"], ["Notification Service", "Degraded", "99.5%", "amber"], ["CDN", "Healthy", "100%", "green"], ["Database", "Healthy", "99.99%", "green"]].map(([svc, status, uptime, tone]) => <div className="pm-card pm-card-pad mb-2" key={svc}><div className="d-flex justify-content-between align-items-center"><div className="pm-td-strong">{svc}</div><Badge tone={tone} dot>{status}</Badge></div><div className="small text-muted mt-1">Uptime: {uptime}</div></div>)}
    </Drawer>
  );
}
