import { useState } from "react";
import { Badge, Modal, Drawer, Steps, useToast } from "../../../components/ui";

type U = { name: string; role: string; email: string; status: string; lastLogin: string; sessions: string; twoFA: string; passkey: string };

/* ============================ 1. Admin Detail Drawer ============================ */
export function AdminDetailDrawer({ admin, onClose }: { admin: U | null; onClose: () => void }) {
  const { push } = useToast();
  if (!admin) return null;
  return (
    <Drawer open onClose={onClose} title={`${admin.name} — Admin Profile`} subtitle="Identity, permissions, security and audit trail" icon="bi-person-gear" wide>
      <div className="pm-card pm-card-pad mb-3">
        <div className="d-flex align-items-center gap-3">
          <div className="pm-stat-ico bg-blue-soft text-blue" style={{ width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}><i className="bi bi-person-fill" /></div>
          <div><h5 className="mb-1">{admin.name}</h5><Badge tone={admin.status === "Locked" ? "red" : "green"} dot>{admin.status}</Badge> <Badge tone="blue">{admin.role}</Badge></div>
        </div>
        <div className="row g-3 mt-3">
          <div className="col-md-3"><div className="pm-eyebrow">Email</div><b className="small">{admin.email}</b></div>
          <div className="col-md-3"><div className="pm-eyebrow">Last login</div><b>{admin.lastLogin}</b></div>
          <div className="col-md-3"><div className="pm-eyebrow">2FA</div><Badge tone="green">{admin.twoFA}</Badge></div>
          <div className="col-md-3"><div className="pm-eyebrow">Passkey</div><Badge tone={admin.passkey === "Registered" ? "green" : "amber"}>{admin.passkey}</Badge></div>
        </div>
      </div>
      <div className="pm-card pm-card-pad mb-3"><h6>Security posture</h6>
        <div className="row g-2 mt-1">{[["TOTP", "Enabled", "green"], ["Passkey", admin.passkey, admin.passkey === "Registered" ? "green" : "amber"], ["Session PIN", "Set", "green"], ["Biometric", "Device-dependent", "blue"]].map(x => <div className="col-6" key={x[0]}><div className="d-flex justify-content-between py-1 border-bottom small"><span className="text-muted">{x[0]}</span><Badge tone={x[2] as any}>{x[1]}</Badge></div></div>)}</div>
      </div>
      <div className="pm-card pm-card-pad mb-3"><h6>Login sessions</h6>
        {[["S-8821", "192.168.1.x", "MacBook Pro", "Nairobi", "2 min", "Active"], ["S-8819", "192.168.1.x", "Dell Laptop", "Nairobi", "3h", "Idle"]].map(s => <div className="d-flex justify-content-between align-items-center py-2 border-bottom small" key={s[0]}><div><b className="me-2">{s[0]}</b><span className="text-muted">{s[1]} · {s[2]} · {s[3]}</span></div><div><span className="me-2">{s[4]}</span><Badge tone={s[5] === "Active" ? "green" : "amber"}>{s[5]}</Badge></div></div>)}
      </div>
      <div className="pm-card pm-card-pad"><h6>Quick actions</h6>
        <div className="d-grid gap-2">{[["bi-key", "Edit permissions", "outline-primary"], ["bi-arrow-repeat", "Reset authentication", "outline-warning"], ["bi-lock", "Lock account", "outline-danger"]].map(x => <button key={x[1]} className={`btn btn-sm btn-${x[2]}`} onClick={() => { push({ kind: "success", title: x[1], body: "Action queued for approval." }); onClose(); }}><i className={`bi ${x[0]} me-1`} />{x[1]}</button>)}</div>
      </div>
    </Drawer>
  );
}

/* ============================ 2. Session Detail Modal ============================ */
export function SessionDetailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  const session = { id: "S-8821", admin: "Joseph Mwangi", login: "08:00 EAT", ip: "192.168.1.42", device: "MacBook Pro 16″", os: "macOS 14.5", browser: "Chrome 128", location: "Nairobi, Kenya", mfa: "TOTP + Passkey", duration: "8h 0m", expires: "16:00 EAT", status: "Active" };
  return (
    <Modal open onClose={onClose} title="Session Detail" subtitle={`Session ${session.id} — live monitoring`} icon="bi-laptop" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3">{Object.entries({ "Session ID": session.id, Admin: session.admin, "Login time": session.login, IP: session.ip, Device: session.device, OS: session.os, Browser: session.browser, Location: session.location, "MFA method": session.mfa, Duration: session.duration, Expires: session.expires }).map(([k, v]) => <div className="col-md-6" key={k}><label className="form-label">{k}</label><input className="form-control" value={v} readOnly /></div>)}</div>
        <div className="mt-3"><Badge tone="green" dot>{session.status}</Badge> <span className="small text-muted"> · Session hash: a3f8c2e1b...</span></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-outline-danger" onClick={() => { push({ kind: "success", title: "Session terminated", body: "The session has been killed immediately." }); onClose(); }}>Terminate session</button></div>
    </Modal>
  );
}

/* ============================ 3. Activity Detail Modal ============================ */
export function ActivityDetailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Activity Detail" subtitle="Immutable audit record with full context" icon="bi-list-check" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Timestamp</label><input className="form-control" value="Aug 24, 2026 14:32:01 EAT" readOnly /></div>
          <div className="col-md-6"><label className="form-label">Admin</label><input className="form-control" value="Joseph Mwangi · Super Admin" readOnly /></div>
          <div className="col-md-6"><label className="form-label">Action</label><input className="form-control" value="Freeze account" readOnly /></div>
          <div className="col-md-6"><label className="form-label">Target</label><input className="form-control" value="User #89234 — Grace Muthoni" readOnly /></div>
          <div className="col-md-6"><label className="form-label">IP address</label><input className="form-control" value="192.168.1.42" readOnly /></div>
          <div className="col-md-6"><label className="form-label">Session</label><input className="form-control" value="S-8821" readOnly /></div>
          <div className="col-12"><label className="form-label">Reason / notes</label><textarea className="form-control" rows={3} value="Fraud suspicion — multiple rapid transactions from different IPs detected in last 30 minutes." readOnly /></div>
          <div className="col-12"><label className="form-label">Pre-image hash (SHA-256)</label><input className="form-control mono" value="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" readOnly /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Evidence exported" }); onClose(); }}>Export evidence pack</button></div>
    </Modal>
  );
}

/* ============================ 4. Performance Detail Modal ============================ */
export function PerformanceDetailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Admin Performance Report" subtitle="30-day operational output breakdown" icon="bi-bar-chart-line" tone="violet" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Actions completed", "456"], ["Users managed", "89"], ["Tickets resolved", "23"], ["SARs filed", "2"], ["Avg session", "7.1 hours"], ["Error rate", "0.2%"]].map(x => <div className="col-md-4" key={x[0]}><div className="pm-card pm-card-pad text-center"><div className="pm-eyebrow">{x[0]}</div><div className="h5 mb-0">{x[1]}</div></div></div>)}</div>
        <h6>Weekly breakdown</h6>
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Week</th><th>Actions</th><th>Tickets</th><th>SARs</th><th>Errors</th></tr></thead><tbody>{[["Aug 18–24", "124", "8", "1", "0"], ["Aug 11–17", "112", "7", "0", "1"], ["Aug 4–10", "108", "5", "1", "0"], ["Jul 28–Aug 3", "112", "3", "0", "0"]].map(w => <tr key={w[0]}>{w.map((c, i) => <td key={i} className={i === 0 ? "pm-td-strong" : "pm-num"}>{c}</td>)}</tr>)}</tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 5. Permission Diff Modal ============================ */
export function PermissionDiffModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Permission Change Diff" subtitle="Before and after comparison for the proposed grant" icon="bi-key" tone="amber" size="lg">
      <div className="pm-modal-body">
        <div className="row g-2 mb-3"><div className="col"><Badge tone="blue">Admin: Peter Njoroge</Badge></div><div className="col"><Badge tone="amber">Role: Minor Admin</Badge></div></div>
        <h6>Revoked permissions</h6>
        {["Impersonate user", "Delete user"].map(p => <div key={p} className="d-flex align-items-center gap-2 py-1 border-bottom small"><i className="bi bi-x-circle-fill text-danger" /><span className="text-muted">{p}</span><Badge tone="red" className="ms-auto">Removed</Badge></div>)}
        <h6 className="mt-3">Granted permissions</h6>
        {["Export user data", "View login history"].map(p => <div key={p} className="d-flex align-items-center gap-2 py-1 border-bottom small"><i className="bi bi-check-circle-fill text-success" /><span>{p}</span><Badge tone="green" className="ms-auto">Added</Badge></div>)}
        <div className="mt-3"><label className="form-label">Change reason</label><textarea className="form-control" rows={2} defaultValue="Security review — impersonate access too privileged for Minor Admin tier." /></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Permission diff staged" }); onClose(); }}>Approve with 2FA</button></div>
    </Modal>
  );
}

/* ============================ 6. Offboarding Wizard ============================ */
export function OffboardingWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  if (!open) return null;
  return (
    <Modal open onClose={() => { setStep(0); onClose(); }} title="Offboarding Wizard" subtitle="Revoke access, export evidence, archive profile" icon="bi-person-x" tone="red" size="lg">
      <Steps current={step} steps={[{ label: "Select admin", icon: "bi-person" }, { label: "Revoke access", icon: "bi-shield-lock" }, { label: "Export evidence", icon: "bi-download" }, { label: "Archive", icon: "bi-archive" }]} />
      <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 25}%` }} /></div>
      <div className="pm-modal-body">
        {step === 0 && <div className="row g-3"><div className="col-12"><label className="form-label">Select administrator to offboard</label><select className="form-select"><option>Peter Njoroge — Minor Admin</option><option>Jane Wambui — Analyst</option></select></div><div className="col-12"><label className="form-label">Reason</label><select className="form-select"><option>Resigned</option><option>Terminated</option><option>Role change</option><option>Contract ended</option></select></div><div className="col-12"><label className="form-label">Notes</label><textarea className="form-control" rows={2} defaultValue="Offboarding requires complete access revocation and evidence export." /></div></div>}
        {step === 1 && <div><h6>Access revocation checklist</h6>{["Disable all active sessions", "Revoke API keys", "Remove from shared resources", "Change shared passwords", "Revoke passkey", "Disable TOTP", "Remove from admin groups"].map((item, i) => <div className="form-check py-1" key={item}><input className="form-check-input" type="checkbox" id={`off-${i}`} defaultChecked={i < 4} /><label className="form-check-label small" htmlFor={`off-${i}`}>{item}</label></div>)}</div>}
        {step === 2 && <div><h6>Evidence export</h6><p className="small text-muted">Export all audit trails, session logs, and activity records for the departing administrator.</p>{[["Audit trail", "34,502 entries", true], ["Session logs", "148 sessions", true], ["Action history", "2,881 actions", true], ["Permission changes", "12 changes", true]].map(x => <div className="d-flex justify-content-between py-2 border-bottom small" key={x[0]}><span>{x[0]}</span><div>{x[1]} <Badge tone={x[2] ? "green" : "amber"}>{x[2] ? "Ready" : "Pending"}</Badge></div></div>)}</div>}
        {step === 3 && <div className="text-center py-3"><i className="bi bi-check-circle-fill text-success" style={{ fontSize: 48 }} /><h5 className="mt-3">Ready to archive</h5><p className="small text-muted">All evidence exported. Access fully revoked. Profile archived with 7-year retention.</p></div>}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={() => step ? setStep(step - 1) : onClose()}>{step ? "Back" : "Cancel"}</button>{step < 3 ? <button className="btn btn-primary" onClick={() => setStep(step + 1)}>Continue <i className="bi bi-arrow-right ms-1" /></button> : <button className="btn btn-danger" onClick={() => { setStep(0); push({ kind: "success", title: "Admin offboarded" }); onClose(); }}>Complete offboarding</button>}</div>
    </Modal>
  );
}

/* ============================ 7. Lock Account Modal ============================ */
export function LockAccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Lock Administrator Account" subtitle="Immediate access revocation with Super Admin approval" icon="bi-lock" tone="red">
      <div className="pm-modal-body">
        <p className="small text-muted mb-3">All active sessions will be terminated. The account will require Super Admin review to unlock.</p>
        <div className="row g-3">
          <div className="col-12"><label className="form-label">Reason for lock</label><select className="form-select"><option>Security incident</option><option>Suspicious activity</option><option>Failed authentication attempts</option><option>Policy violation</option></select></div>
          <div className="col-12"><label className="form-label">Additional notes</label><textarea className="form-control" rows={2} defaultValue="Multiple failed PIN attempts detected from non-approved IP range." /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-danger" onClick={() => { push({ kind: "success", title: "Account locked" }); onClose(); }}>Lock account now</button></div>
    </Modal>
  );
}

/* ============================ 8. Passkey Registration Modal ============================ */
export function PasskeyRegistrationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Passkey Registration" subtitle="Register a FIDO2/WebAuthn credential for this administrator" icon="bi-fingerprint" tone="blue">
      <div className="pm-modal-body text-center py-3">
        <i className="bi bi-fingerprint text-primary" style={{ fontSize: 64 }} />
        <h5 className="mt-3">Touch your security key</h5>
        <p className="small text-muted">Or use Windows Hello, Touch ID, or Face ID on the administrator's verified device.</p>
        <div className="pm-card pm-card-pad mt-3 text-start">
          <h6>Registration details</h6>
          { [["Device type", "Platform authenticator"], ["Transport", "Internal"], ["Algorithm", "ES256"], ["Backed up", "Yes"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b>{x[1]}</b></div>)}
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Passkey registered" }); onClose(); }}>Simulate registration</button></div>
    </Modal>
  );
}

/* ============================ 9. Reset Authentication Modal ============================ */
export function ResetAuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Reset Authentication" subtitle="TOTP reset requires identity verification and dual approval" icon="bi-arrow-repeat" tone="amber">
      <div className="pm-modal-body">
        <p className="small text-muted mb-3">Resetting authentication will revoke the current TOTP secret and require the administrator to re-enroll.</p>
        <div className="row g-3">
          <div className="col-12"><label className="form-label">Authentication method to reset</label><select className="form-select"><option>TOTP (Authenticator app)</option><option>Passkey (FIDO2)</option><option>Session PIN</option><option>All methods</option></select></div>
          <div className="col-12"><label className="form-label">Verification method</label><select className="form-select"><option>Corporate email verification</option><option>Super Admin approval</option><option>Identity document upload</option></select></div>
          <div className="col-12"><label className="form-label">Reason</label><textarea className="form-control" rows={2} defaultValue="Administrator lost access to authenticator device." /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-warning" onClick={() => { push({ kind: "success", title: "Reset request submitted" }); onClose(); }}>Request reset</button></div>
    </Modal>
  );
}

/* ============================ 10. Security Policy Modal ============================ */
export function SecurityPolicyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Security Policy Configuration" subtitle="Platform-wide guardrails for privileged access" icon="bi-shield-lock" tone="amber" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3">
          {[["Failed PIN lockout", "5", "attempts"], ["Lockout duration", "30", "minutes"], ["Session duration", "8", "hours"], ["Max concurrent sessions", "3", "per admin"], ["Password expiry", "90", "days"], ["Min password length", "12", "characters"], ["Step-up auth threshold", "2", "destructive actions"], ["Export approval", "Dual", "Super Admin"]].map(x => <div className="col-md-6" key={x[0]}><label className="form-label">{x[0]}</label><div className="input-group"><input className="form-control" defaultValue={x[1]} /><span className="input-group-text">{x[2]}</span></div></div>)}
          <div className="col-12"><label className="form-label">Approved IP ranges</label><textarea className="form-control" rows={2} defaultValue={"192.168.1.0/24 (Nairobi office)\n10.0.0.0/8 (VPN pool)"} /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Security policy updated" }); onClose(); }}>Save with 2FA</button></div>
    </Modal>
  );
}

/* ============================ 11. Audit Trail Modal ============================ */
export function AdminAuditTrailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  const logs = [["14:32:01", "Joseph M.", "Freeze", "User #89234", "Fraud suspicion", "Success"], ["14:15:23", "Joseph M.", "Login", "Admin", "Passkey verified", "Success"], ["13:45:12", "Joseph M.", "Export", "Report", "Transaction ledger", "Success"], ["12:30:00", "Joseph M.", "Approve", "Settlement", "SET-4456", "Success"], ["11:48:22", "Joseph M.", "Update", "Fee Config", "M-Pesa rate", "Success"]];
  return (
    <Modal open onClose={onClose} title="Admin Audit Trail" subtitle="Immutable activity log for this administrator" icon="bi-clock-history" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Time</th><th>Action</th><th>Target</th><th>Details</th><th>Result</th></tr></thead><tbody>{logs.map((l, i) => <tr key={i}><td className="mono">{l[0]}</td><td className="pm-td-strong">{l[2]}</td><td>{l[3]}</td><td>{l[4]}</td><td><Badge tone="green" dot>{l[5]}</Badge></td></tr>)}</tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={onClose}>Export logs</button></div>
    </Modal>
  );
}

/* ============================ 12. Terminate Session Modal ============================ */
export function TerminateSessionModal({ open, sessionName, onClose }: { open: boolean; sessionName: string; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Terminate Session" subtitle={`Kill the active session for ${sessionName}`} icon="bi-power" tone="red">
      <div className="pm-modal-body">
        <p className="small text-muted">The session will be terminated immediately. Any unsaved work in that session will be lost.</p>
        <div className="pm-card pm-card-pad mt-2">
          <div className="d-flex justify-content-between py-1 border-bottom small"><span className="text-muted">Session</span><b>S-8821</b></div>
          <div className="d-flex justify-content-between py-1 border-bottom small"><span className="text-muted">IP</span><b>192.168.1.42</b></div>
          <div className="d-flex justify-content-between py-1 border-bottom small"><span className="text-muted">Duration</span><b>2 min</b></div>
          <div className="d-flex justify-content-between py-1 border-bottom small"><span className="text-muted">Device</span><b>MacBook Pro</b></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-danger" onClick={() => { push({ kind: "success", title: "Session terminated" }); onClose(); }}>Terminate now</button></div>
    </Modal>
  );
}

/* ============================ 13. Role Assignment Modal ============================ */
export function RoleAssignmentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Assign Role to Administrator" subtitle="Change role assignment with approval" icon="bi-person-check" tone="blue">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-12"><label className="form-label">Administrator</label><select className="form-select"><option>Peter Njoroge — Minor Admin</option><option>Jane Wambui — Analyst</option></select></div>
          <div className="col-md-6"><label className="form-label">Current role</label><input className="form-control" value="Minor Admin (Tier 6)" readOnly /></div>
          <div className="col-md-6"><label className="form-label">New role</label><select className="form-select"><option>Operations Manager (Tier 2)</option><option>Support Lead (Tier 5)</option><option>Analyst (Tier 7)</option></select></div>
          <div className="col-12"><label className="form-label">Reason for change</label><textarea className="form-control" rows={2} defaultValue="Promotion to Operations Manager to support expanded responsibilities." /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Role assignment submitted" }); onClose(); }}>Submit for approval</button></div>
    </Modal>
  );
}

/* ============================ 14. Admin Performance Rankings ============================ */
export function AdminRankingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  const rankings = [["1", "Grace M.", "Support Lead", "534", "123", "456", "7.8h", "4.8/5"], ["2", "Samuel K.", "Support Agent", "678", "234", "567", "8.1h", "4.6/5"], ["3", "Sarah K.", "Platform Admin", "456", "89", "23", "7.1h", "4.5/5"], ["4", "James O.", "Operations Mgr", "389", "67", "12", "6.8h", "4.3/5"], ["5", "Joseph M.", "Super Admin", "234", "45", "0", "6.2h", "4.2/5"]];
  return (
    <Modal open onClose={onClose} title="Admin Performance Rankings" subtitle="30-day leaderboard across all administrators" icon="bi-trophy" tone="violet" size="lg">
      <div className="pm-modal-body">
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>#</th><th>Admin</th><th>Role</th><th>Actions</th><th>Users</th><th>Tickets</th><th>Avg session</th><th>Rating</th></tr></thead><tbody>{rankings.map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 0 ? "pm-num" : i === 1 ? "pm-td-strong" : i === 7 ? "" : "pm-num"}>{i === 7 ? <Badge tone="green">{c}</Badge> : c}</td>)}</tr>)}</tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 15. Admin Create Invite ============================ */
export function AdminInviteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Send Admin Invitation" subtitle="Send a controlled invitation with role pre-assignment" icon="bi-envelope" tone="green">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-12"><label className="form-label">Email address</label><input className="form-control" placeholder="admin@company.co.ke" /></div>
          <div className="col-md-6"><label className="form-label">Full name</label><input className="form-control" placeholder="Full name" /></div>
          <div className="col-md-6"><label className="form-label">Assigned role</label><select className="form-select"><option>Platform Admin</option><option>Operations Manager</option><option>Support Lead</option><option>Analyst</option></select></div>
          <div className="col-12"><label className="form-label">Invitation message</label><textarea className="form-control" rows={2} defaultValue="You have been invited to join the PayMo admin platform. Please complete TOTP setup within 48 hours." /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Invitation sent" }); onClose(); }}>Send invitation</button></div>
    </Modal>
  );
}

/* ============================ 16. Admin Security Scan ============================ */
export function AdminSecurityScanModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Admin Security Scan" subtitle="Automated security posture check across all admin accounts" icon="bi-shield-check" tone="green" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["18", "accounts scanned", "green"], ["100%", "2FA coverage", "green"], ["44%", "Passkey coverage", "amber"], ["1", "Locked account", "red"], ["0", "Stale sessions", "green"], ["7", "Security findings", "amber"]].map(x => <div className="col-md-4" key={x[1]}><div className="pm-card pm-card-pad text-center"><div className="h4 mb-0 text-" style={{ color: x[2] === "green" ? "#12b76a" : x[2] === "red" ? "#f04438" : "#f79009" }}>{x[0]}</div><div className="small text-muted">{x[1]}</div></div></div>)}</div>
        <h6>Findings requiring attention</h6>
        {["Passkey not registered for 10 admins", "1 admin has stale session > 24h", "2 admins missing from approved IP range"].map((f, i) => <div className="d-flex align-items-center gap-2 py-2 border-bottom small" key={i}><i className="bi bi-exclamation-triangle text-warning" /><span>{f}</span><Badge tone="amber" className="ms-auto">Review</Badge></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Security scan exported" }); onClose(); }}>Export report</button></div>
    </Modal>
  );
}
