import { useState } from "react";
import { Badge, Modal, Drawer, Steps, useToast } from "../../../components/ui";

/* ============================ 1. Config Change Detail Modal ============================ */
export function ConfigChangeDetailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Configuration Change Detail" subtitle="Versioned change with before/after values" icon="bi-sliders" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3">
          { [["Setting", "Primary color"], ["Admin", "Joseph Mwangi"], ["Date", "Aug 15, 2026"], ["Status", "Deployed"]].map(x => <div className="col-md-6" key={x[0]}><label className="form-label">{x[0]}</label><input className="form-control" value={x[1]} readOnly /></div>)}
          <div className="col-md-6"><label className="form-label">Old value</label><input className="form-control" value="#2E7D32" readOnly /></div>
          <div className="col-md-6"><label className="form-label">New value</label><input className="form-control" value="#1B5E20" readOnly /></div>
          <div className="col-12"><label className="form-label">Reason</label><textarea className="form-control" rows={2} value="Brand refresh — updated primary green to darker shade for better accessibility." readOnly /></div>
        </div>
        <h6 className="mt-3">Approval chain</h6>
        {[["1. Joseph M. submitted", "Aug 15, 10:00", "green"], ["2. Auto-staged in staging", "Aug 15, 10:01", "green"], ["3. Joseph M. approved", "Aug 15, 14:00", "green"], ["4. Deployed to production", "Aug 15, 16:00", "green"]].map(a => <div className="d-flex align-items-center gap-2 py-1 border-bottom small" key={a[0]}><i className={`bi bi-check-circle-fill text-${a[3]}`} /><span>{a[0]}</span><span className="text-muted ms-auto">{a[1]}</span></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 2. Brand Preview Modal ============================ */
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
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 3. Notification Channel Config Modal ============================ */
export function NotifyChannelConfigModal({ open, channel, onClose }: { open: boolean; channel: string; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`Configure ${channel}`} subtitle="Provider credentials and delivery settings" icon="bi-bell" tone="blue">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Provider</label><input className="form-control" value={channel === "SMS" ? "Africa's Talking" : channel === "Email" ? "SendGrid" : channel === "Push (iOS)" ? "APNs" : "FCM"} readOnly /></div>
          <div className="col-md-6"><label className="form-label">Status</label><Badge tone="green" dot>Healthy</Badge></div>
          <div className="col-12"><label className="form-label">Configuration</label><textarea className="form-control" rows={3} value={channel === "SMS" ? "API key: AT-****4567\nSender name: PayMo\nSender ID: PayMo" : channel === "Email" ? "API key: SG-****8901\nTemplates: 12 active\nSender: noreply@paymo.co.ke" : "Certificate: uploaded\nBundle ID: co.ke.paymo.app"} readOnly /></div>
          <div className="col-md-6"><label className="form-label">Delivered (24h)</label><input className="form-control" value={channel === "SMS" ? "12,456" : channel === "Email" ? "45,678" : "89,012"} readOnly /></div>
          <div className="col-md-6"><label className="form-label">Delivery rate</label><input className="form-control" value="99.7%" readOnly /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Channel configured" }); onClose(); }}>Save configuration</button></div>
    </Modal>
  );
}

/* ============================ 4. Rate Limit Editor Modal ============================ */
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
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Rate limit updated" }); onClose(); }}>Save and deploy</button></div>
    </Modal>
  );
}

/* ============================ 5. Feature Toggle Editor Modal ============================ */
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
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Feature toggle updated" }); onClose(); }}>Save with approval</button></div>
    </Modal>
  );
}

/* ============================ 6. Maintenance Window Wizard ============================ */
export function MaintenanceWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  if (!open) return null;
  return (
    <Modal open onClose={() => { setStep(0); onClose(); }} title="Schedule Maintenance" subtitle="Plan a controlled maintenance window" icon="bi-tools" tone="amber" size="lg">
      <Steps current={step} steps={[{ label: "Window", icon: "bi-calendar3" }, { label: "Message", icon: "bi-chat-text" }, { label: "Impact", icon: "bi-people" }, { label: "Review", icon: "bi-check2" }]} />
      <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 25}%` }} /></div>
      <div className="pm-modal-body">
        {step === 0 && <div className="row g-3"><div className="col-md-6"><label className="form-label">Day</label><select className="form-select"><option>Saturday</option><option>Sunday</option></select></div><div className="col-md-6"><label className="form-label">Time window</label><input className="form-control" defaultValue="02:00 – 06:00 EAT" /></div><div className="col-md-6"><label className="form-label">Duration</label><input className="form-control" defaultValue="4 hours" readOnly /></div><div className="col-md-6"><label className="form-label">Mode</label><select className="form-select"><option>Scheduled</option><option>Emergency · 2FA required</option></select></div></div>}
        {step === 1 && <div className="row g-3"><div className="col-12"><label className="form-label">User-facing message</label><textarea className="form-control" rows={3} defaultValue="PayMo is performing scheduled maintenance. All services will resume shortly." /></div><div className="col-12"><label className="form-label">Notification channels</label><div className="form-check"><input className="form-check-input" type="checkbox" id="mw-push" defaultChecked /><label className="form-check-label small" htmlFor="mw-push">Push notification · 1 hour before</label></div><div className="form-check"><input className="form-check-input" type="checkbox" id="mw-sms" defaultChecked /><label className="form-check-label small" htmlFor="mw-sms">SMS · 1 hour before</label></div><div className="form-check"><input className="form-check-input" type="checkbox" id="mw-email" /><label className="form-check-label small" htmlFor="mw-email">Email · 24 hours before</label></div></div></div>}
        {step === 2 && <div><h6>Impact assessment</h6>{[["Affected users", "All active users (~42,000)"], ["Kill sessions", "Yes"], ["Admin access", "Yes (restricted)"], ["Payment processing", "Briefly interrupted"], ["Scheduled jobs", "Paused"], ["Recovery time", "< 5 minutes after window"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b>{x[1]}</b></div>)}</div>}
        {step === 3 && <div className="text-center py-3"><Badge tone="green" dot>Ready to schedule</Badge><h6 className="mt-3">Maintenance window summary</h6><p className="small text-muted">Sunday 02:00–06:00 EAT · 4h window · Push + SMS notification</p></div>}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={() => step ? setStep(step - 1) : onClose()}>{step ? "Back" : "Cancel"}</button>{step < 3 ? <button className="btn btn-primary" onClick={() => setStep(step + 1)}>Continue</button> : <button className="btn btn-primary" onClick={() => { setStep(0); push({ kind: "success", title: "Maintenance scheduled" }); onClose(); }}>Schedule window</button>}</div>
    </Modal>
  );
}

/* ============================ 7. Security Posture Drawer ============================ */
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

/* ============================ 8. Config Version Diff Modal ============================ */
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
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 9. Staging Promotion Modal ============================ */
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
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-warning" onClick={() => { push({ kind: "success", title: "Promotion queued" }); onClose(); }}>Deploy with 2FA</button></div>
    </Modal>
  );
}

/* ============================ 10. Emergency Rollback Modal ============================ */
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
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-danger" onClick={() => { push({ kind: "success", title: "Rollback initiated" }); onClose(); }}>Rollback now</button></div>
    </Modal>
  );
}

/* ============================ 11. Config Audit Trail Modal ============================ */
export function ConfigAuditTrailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Configuration Audit Trail" subtitle="Immutable record of all configuration changes" icon="bi-clock-history" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Date</th><th>Admin</th><th>Setting</th><th>Old</th><th>New</th><th>Reason</th></tr></thead><tbody>
          {[["Aug 22", "Joseph M.", "Maintenance window", "Sat 2AM", "Sun 2AM", "Lower traffic day"], ["Aug 20", "Ops Manager", "Push provider", "Firebase", "FCM", "Better delivery"], ["Aug 15", "Joseph M.", "Primary color", "#2E7D32", "#1B5E20", "Brand refresh"], ["Aug 10", "Security Lead", "TLS min version", "1.2", "1.3", "Security hardening"], ["Aug 5", "Joseph M.", "Session duration", "12h", "8h", "Security review"]].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 1 || i === 2 ? "pm-td-strong" : ""}>{c}</td>)}</tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={onClose}>Export</button></div>
    </Modal>
  );
}

/* ============================ 12. Config Rollback Modal ============================ */
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
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-warning" onClick={() => { push({ kind: "success", title: "Rollback queued" }); onClose(); }}>Rollback</button></div>
    </Modal>
  );
}

/* ============================ 13. Config Simulation Modal ============================ */
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
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Simulation complete" }); onClose(); }}>Run simulation</button></div>
    </Modal>
  );
}

/* ============================ 14. Config Rollback History Modal ============================ */
export function RollbackHistoryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Rollback History" subtitle="Previous configuration rollbacks" icon="bi-arrow-counterclockwise" tone="amber" size="lg">
      <div className="pm-modal-body">
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Date</th><th>Admin</th><th>Setting</th><th>From</th><th>To</th><th>Reason</th></tr></thead><tbody>
          {[["Jul 28", "Joseph M.", "Rate limit (API)", "2000/min", "1000/min", "DDoS mitigation"], ["Jul 15", "Security Lead", "Session cookie", "Lax", "Strict", "Security hardening"], ["Jun 30", "Joseph M.", "Push provider", "FCM", "Firebase", "Rollback — delivery issues"]].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 1 || i === 2 ? "pm-td-strong" : ""}>{c}</td>)}</tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 15. Config Diff Modal ============================ */
export function ConfigDiffModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Configuration Diff" subtitle="Pending changes before production deployment" icon="bi-code-slash" tone="amber" size="lg">
      <div className="pm-modal-body">
        <h6>Staged changes (3)</h6>
        {[["session_duration", "8h", "12h", "Approved"], ["sms_rate_limit", "100/min", "200/min", "Approved"], ["maintenance_day", "Saturday", "Sunday", "Pending"]].map(d => <div className="pm-card pm-card-pad mb-2" key={d[0]}><div className="d-flex justify-content-between align-items-center"><b className="mono">{d[0]}</b><Badge tone={d[3] === "Approved" ? "green" : "amber"}>{d[3]}</Badge></div><div className="d-flex align-items-center gap-2 mt-1"><span className="text-muted">{d[1]}</span><i className="bi bi-arrow-right" /><span className="fw-bold">{d[2]}</span></div></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={onClose}>Deploy all</button></div>
    </Modal>
  );
}
