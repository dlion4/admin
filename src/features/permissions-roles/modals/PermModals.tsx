import { useState } from "react";
import { Badge, Modal, Drawer, Steps, useToast } from "../../../components/ui";
import type { AdminAssignment, RoleDocument, RoleRecord } from "../data/permData";

/* =================================================================
   1. ROLE DETAIL DRAWER — Full role profile with admin assignments
   ================================================================= */
export function RoleDetailDrawer({ role, admins, onClose }: { role: RoleRecord | null; admins: AdminAssignment[]; onClose: () => void }) {
  if (!role) return null;
  const assigned = admins.filter(a => a.role === role.name);
  return (
    <Drawer open onClose={onClose} title={`${role.name} — Role Profile`} subtitle="Permissions, assignments and access history" icon="bi-diagram-3" wide>
      <div className="pm-card pm-card-pad mb-3">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h5>{role.name}</h5>
            <Badge tone={role.status === "System" ? "blue" : "amber"} dot>{role.tier} · {role.status}</Badge>
            {role.locked && <Badge tone="red" className="ms-2">🔒 LOCKED</Badge>}
          </div>
        </div>
        {role.description && <p className="small text-muted mt-2 mb-0">{role.description}</p>}
        <div className="row g-3 mt-2">
          {[
            ["Admins assigned", role.admins],
            ["Permission nodes", String(role.permissionCount ?? "—")],
            ["Created", role.created],
            ["Last modified", role.lastModified],
            ["Last review", role.lastAccessReview ?? "—"],
            ["Deletion policy", role.deletionPolicy]
          ].map(x => <div className="col-4" key={x[0]}><div className="pm-eyebrow">{x[0]}</div><b style={{ fontSize: ".85rem" }}>{x[1]}</b></div>)}
        </div>
      </div>

      <div className="pm-card pm-card-pad mb-3">
        <h6>Assigned Administrators ({assigned.length})</h6>
        {assigned.length === 0 && <div className="small text-muted py-2">No administrators currently assigned to this role.</div>}
        {assigned.map(a => (
          <div key={a.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
            <div>
              <b>{a.name}</b>
              <div className="pm-td-sub">{a.email}</div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Badge tone={a.mfaEnabled ? "green" : "red"}>{a.mfaEnabled ? "MFA ✓" : "No MFA"}</Badge>
              <span className="pm-td-sub">{a.lastActive}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="pm-card pm-card-pad">
        <h6>Recent permission changes</h6>
        {[
          ["Aug 22", "Export user data granted", "Joseph M."],
          ["Aug 15", "Impersonate user revoked", "Joseph M."],
          ["Aug 1", "View risk scores granted", "Joseph M."]
        ].map(c => (
          <div key={c[0]} className="d-flex justify-content-between py-1 border-bottom small">
            <div><b>{c[1]}</b><div className="pm-td-sub">{c[2]}</div></div>
            <span className="text-muted">{c[0]}</span>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* =================================================================
   2. ADMIN ASSIGNMENT WIZARD — 5-step onboarding wizard
   ================================================================= */
export function AdminOnboardingWizard({ open, onClose, onComplete }: { open: boolean; onClose: () => void; onComplete: (admin: AdminAssignment) => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", role: "Support Agent", tier: "Tier 8", mfaRequired: "true" });
  const [rolePerms, setRolePerms] = useState<Record<string, boolean>>({ "View user list": true, "View transactions": true });

  const reset = () => { setStep(0); setForm({ name: "", email: "", role: "Support Agent", tier: "Tier 8", mfaRequired: "true" }); };

  const steps = [
    { label: "Identity", icon: "bi-person-badge" },
    { label: "Role assignment", icon: "bi-diagram-3" },
    { label: "Permissions", icon: "bi-key" },
    { label: "Security", icon: "bi-shield-lock" },
    { label: "Review & confirm", icon: "bi-check2" }
  ];

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title="Onboard New Administrator" subtitle={`Step ${step + 1} of 5: ${steps[step].label}`} icon="bi-person-plus" tone="green" size="lg">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / 5) * 100}%` }} /></div>
      <Steps current={step} steps={steps} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div className="row g-3">
            <div className="pm-note mb-2"><i className="bi bi-info-circle me-1" />New administrator accounts require Super Admin approval and MFA enrollment.</div>
            <div className="col-md-6"><label className="form-label">Full name <span className="text-danger">*</span></label><input className="form-control" placeholder="e.g. John Doe" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="col-md-6"><label className="form-label">Email address <span className="text-danger">*</span></label><input className="form-control" type="email" placeholder="john@paymo.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
          </div>
        )}
        {step === 1 && (
          <div className="row g-3">
            <div className="pm-note mb-2"><i className="bi bi-shield-lock me-1" />Role assignment determines baseline permissions. Additional grants can be made after onboarding.</div>
            <div className="col-md-6"><label className="form-label">Assign role</label><select className="form-select" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
              <option>Support Agent (Tier 8)</option><option>Analyst (Tier 7)</option><option>Minor Admin (Tier 6)</option><option>Regional Manager (Tier 6)</option><option>Risk Analyst (Tier 7)</option><option>Compliance Officer (Tier 3)</option>
            </select></div>
            <div className="col-md-6"><label className="form-label">Effective date</label><input className="form-control" type="date" /></div>
            <div className="col-12"><label className="form-label">Manager/sponsor</label><select className="form-select"><option>Joseph Mwangi (Super Admin)</option><option>Sarah Kamau (Platform Admin)</option><option>Grace Muthoni (Operations Manager)</option></select></div>
          </div>
        )}
        {step === 2 && (
          <div>
            <p className="small text-muted mb-3">Select the permissions this administrator will receive beyond their role baseline.</p>
            {Object.entries({ "View user list": true, "View user detail": true, "View transactions": true, "View fraud dashboard": false, "Export data": false, "Freeze account": false, "View analytics": false, "Manage notifications": false }).map(([perm, def]) => (
              <label key={perm} className="d-flex align-items-center justify-content-between py-1 border-bottom" style={{ fontSize: ".85rem" }}>
                <span>{perm}</span>
                <input type="checkbox" className="form-check-input" defaultChecked={rolePerms[perm] ?? def} onChange={e => setRolePerms(p => ({ ...p, [perm]: e.target.checked }))} />
              </label>
            ))}
          </div>
        )}
        {step === 3 && (
          <div className="row g-3">
            <div className="pm-note mb-2" style={{ borderLeft: "3px solid var(--pm-danger)", background: "var(--pm-danger-soft)" }}>
              <div className="pm-td-strong" style={{ color: "var(--pm-danger)" }}><i className="bi bi-shield-exclamation me-1" />MFA is mandatory for all administrators</div>
              <div className="mt-1">MFA enrollment must be completed within 24 hours of account creation.</div>
            </div>
            <div className="col-12"><label className="form-label">MFA method</label><select className="form-select"><option>TOTP Authenticator (recommended)</option><option>Hardware Security Key</option></select></div>
            <div className="col-md-6"><label className="form-label">Session timeout</label><select className="form-select"><option>8 hours (default)</option><option>4 hours</option><option>2 hours</option></select></div>
            <div className="col-md-6"><label className="form-label">IP restriction</label><select className="form-select"><option>Office + VPN</option><option>VPN only</option><option>Anywhere</option></select></div>
            <div className="col-12"><label className="form-label">Notification preferences</label>
              <div className="form-check"><input className="form-check-input" type="checkbox" id="notif-login" defaultChecked /><label className="form-check-label small" htmlFor="notif-login">Login notifications</label></div>
              <div className="form-check"><input className="form-check-input" type="checkbox" id="notif-perm" defaultChecked /><label className="form-check-label small" htmlFor="notif-perm">Permission change notifications</label></div>
              <div className="form-check"><input className="form-check-input" type="checkbox" id="notif-security" defaultChecked /><label className="form-check-label small" htmlFor="notif-security">Security event alerts</label></div>
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="pm-card pm-card-pad">
            <Badge tone="green" dot>Ready for onboarding</Badge>
            <h6 className="mt-3">Onboarding summary</h6>
            <div className="pm-kv"><span className="k">Name</span><span className="v">{form.name || "Not specified"}</span></div>
            <div className="pm-kv"><span className="k">Email</span><span className="v">{form.email || "Not specified"}</span></div>
            <div className="pm-kv"><span className="k">Role</span><span className="v">{form.role}</span></div>
            <div className="pm-kv"><span className="k">MFA Required</span><span className="v">{form.mfaRequired === "true" ? "Yes — mandatory" : "No"}</span></div>
            <div className="pm-kv"><span className="k">Extra permissions</span><span className="v">{Object.values(rolePerms).filter(Boolean).length} granted</span></div>
            <div className="pm-note mt-3"><i className="bi bi-shield-lock me-1" />Account will be created pending Super Admin 2FA confirmation. Audit log entry will be generated.</div>
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => step > 0 ? setStep(step - 1) : (reset(), onClose())}>{step > 0 ? "← Back" : "Cancel"}</button>
        {step < 4 ? <button className="btn btn-primary btn-sm" disabled={step === 0 && (!form.name || !form.email)} onClick={() => setStep(step + 1)}>Continue →</button>
          : <button className="btn btn-primary btn-sm" onClick={() => { onComplete({ id: `a-${Date.now()}`, name: form.name || "New Admin", email: form.email || "admin@paymo.com", role: form.role.split(" (")[0], tier: form.tier, status: "Active", lastActive: "Just now", mfaEnabled: form.mfaRequired === "true", sessionsActive: 0, joinedDate: new Date().toLocaleDateString(), permissions: Object.entries(rolePerms).filter(([, v]) => v).map(([k]) => k).join(", ") }); reset(); push({ kind: "success", title: "Administrator onboarded", body: "Account created. MFA enrollment pending." }); onClose(); }}>
            <i className="bi bi-check2 me-1" />Complete onboarding
          </button>}
      </div>
    </Modal>
  );
}

/* =================================================================
   3. ADMIN OFFBOARDING WIZARD — 4-step offboarding
   ================================================================= */
export function AdminOffboardingWizard({ open, onClose, admin, onComplete }: { open: boolean; onClose: () => void; admin: AdminAssignment | null; onComplete: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [confirm, setConfirm] = useState("");

  if (!admin) return null;
  const steps = [{ label: "Identify", icon: "bi-person" }, { label: "Revoke access", icon: "bi-shield-x" }, { label: "Handover", icon: "bi-arrow-left-right" }, { label: "Confirm", icon: "bi-check2" }];

  return (
    <Modal open={open} onClose={() => { setStep(0); setConfirm(""); onClose(); }} title={`Offboard: ${admin.name}`} subtitle={`Step ${step + 1} of 4: ${steps[step].label}`} icon="bi-person-dash" tone="red" size="lg">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
      <Steps current={step} steps={steps} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div className="pm-card pm-card-pad">
            <div className="pm-eyebrow mb-1">Administrator to offboard</div>
            <div className="pm-td-strong">{admin.name}</div>
            <div className="pm-td-sub">{admin.email} · {admin.role}</div>
            <div className="row g-3 mt-2">
              {[["Status", admin.status], ["Last active", admin.lastActive], ["Sessions", String(admin.sessionsActive)], ["Joined", admin.joinedDate]].map(([k, v]) => <div className="col-3" key={k}><div className="pm-eyebrow">{k}</div><b style={{ fontSize: ".85rem" }}>{v}</b></div>)}
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="d-flex flex-column gap-2">
            <div className="pm-note mb-2" style={{ borderLeft: "3px solid var(--pm-danger)", background: "var(--pm-danger-soft)" }}>
              <div className="pm-td-strong" style={{ color: "var(--pm-danger)" }}><i className="bi bi-shield-x me-1" />Access revocation is immediate</div>
            </div>
            {["Active sessions terminated", "MFA credentials revoked", "API keys disabled", "Role assignments removed", "Emergency access cancelled", "VPN access revoked"].map(item => (
              <label key={item} className="d-flex align-items-center gap-2 mb-1" style={{ fontSize: ".85rem" }}><input type="checkbox" className="form-check-input" defaultChecked />{item}</label>
            ))}
          </div>
        )}
        {step === 2 && (
          <div className="row g-3">
            <div className="col-12"><label className="form-label">Reassign pending approvals to</label><select className="form-select"><option>Select administrator...</option><option>Joseph Mwangi</option><option>Sarah Kamau</option><option>Grace Muthoni</option></select></div>
            <div className="col-12"><label className="form-label">Transfer open tickets to</label><select className="form-select"><option>Select administrator...</option><option>Samuel Kariuki</option><option>Jane Wambui</option></select></div>
            <div className="col-12"><label className="form-label">Handover notes</label><textarea className="form-control" rows={3} placeholder="Document any ongoing investigations, pending actions, or special knowledge..." /></div>
          </div>
        )}
        {step === 3 && (
          <div className="pm-card pm-card-pad">
            <Badge tone="red" dot>Ready to offboard</Badge>
            <h6 className="mt-3">Offboarding summary</h6>
            <div className="pm-kv"><span className="k">Administrator</span><span className="v">{admin.name}</span></div>
            <div className="pm-kv"><span className="k">Role</span><span className="v">{admin.role}</span></div>
            <div className="pm-kv"><span className="k">Access revocation</span><span className="v">Immediate</span></div>
            <div className="pm-kv"><span className="k">Audit log</span><span className="v">Will be recorded</span></div>
            <div className="mb-3 mt-3">
              <label className="form-label" style={{ color: "var(--pm-danger)" }}>Type OFFBOARD to confirm</label>
              <input className="form-control" style={{ borderColor: "var(--pm-danger)" }} placeholder="Type OFFBOARD" value={confirm} onChange={e => setConfirm(e.target.value)} />
            </div>
            <div className="pm-note"><i className="bi bi-shield-lock me-1" />This action is irreversible. All access will be permanently revoked.</div>
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => step > 0 ? setStep(step - 1) : (setStep(0), setConfirm(""), onClose())}>{step > 0 ? "← Back" : "Cancel"}</button>
        {step < 3 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(step + 1)}>Continue →</button>
          : <button className="btn btn-danger btn-sm" disabled={confirm !== "OFFBOARD"} onClick={() => { onComplete(); push({ kind: "success", title: "Administrator offboarded", body: `${admin.name} has been removed from all roles.` }); setStep(0); setConfirm(""); onClose(); }}>
            <i className="bi bi-person-dash me-1" />Offboard administrator
          </button>}
      </div>
    </Modal>
  );
}

/* =================================================================
   4. SECURITY REVIEW MODAL — Security event review
   ================================================================= */
export function SecurityReviewModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [action, setAction] = useState("");
  return (
    <Modal open={open} onClose={onClose} title="Security Event Review" subtitle="Super Admin — Investigate and resolve security events" icon="bi-shield-exclamation" tone="amber" size="lg">
      <div className="pm-modal-body">
        <div className="pm-note mb-3" style={{ borderLeft: "3px solid var(--pm-danger)", background: "var(--pm-danger-soft)" }}>
          <div className="pm-td-strong" style={{ color: "var(--pm-danger)" }}><i className="bi bi-exclamation-triangle me-1" />2 events require immediate attention</div>
          <div className="mt-1">Review and resolve security events within SLA.</div>
        </div>
        <div className="row g-3 mb-3">
          {[["1", "Critical", "red"], ["1", "High", "amber"], ["3", "Medium", "blue"], ["3", "Low", "grey"]].map(([count, label, color]) => (
            <div className="col-3" key={label}><div className="pm-card pm-card-pad text-center"><div className="h4 mb-0">{count}</div><Badge tone={color}>{label}</Badge></div></div>
          ))}
        </div>
        <h6>Events requiring review</h6>
        {[
          { sev: "Critical", event: "Emergency access requested by Amina H.", time: "10:12", detail: "Full fraud dashboard access requested for critical fraud investigation" },
          { sev: "High", event: "Multiple failed login attempts — Kevin O.", time: "11:48", detail: "6 failed attempts from IP 203.0.113.42 in 5 minutes" },
          { sev: "High", event: "Export user data granted — PII export capability", time: "14:15", detail: "Minor Admin granted access to export user PII data" }
        ].map((ev, i) => (
          <div key={i} className="pm-card pm-card-pad mb-2" style={{ borderLeft: `3px solid var(--pm-${ev.sev === "Critical" ? "danger" : ev.sev === "High" ? "amber" : "blue"})` }}>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="pm-td-strong">{ev.event}</div>
                <div className="pm-td-sub">{ev.detail}</div>
              </div>
              <Badge tone={ev.sev === "Critical" ? "red" : ev.sev === "High" ? "amber" : "blue"}>{ev.sev}</Badge>
            </div>
          </div>
        ))}
        <div className="mt-3"><label className="form-label">Review action</label><select className="form-select" value={action} onChange={e => setAction(e.target.value)}>
          <option value="">Select action...</option><option value="resolve">Mark as resolved</option><option value="escalate">Escalate to Super Admin</option><option value="suspend">Suspend affected account</option><option value="lockdown">Initiate lockdown</option>
        </select></div>
        <div className="mt-2"><label className="form-label">Review notes</label><textarea className="form-control" rows={2} placeholder="Document findings and actions taken..." /></div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={!action} onClick={() => { push({ kind: "success", title: "Security review completed", body: "Actions applied and audit trail updated." }); onClose(); }}>
          <i className="bi bi-check2 me-1" />Submit review
        </button>
      </div>
    </Modal>
  );
}

/* =================================================================
   5. EMERGENCY ACCESS WIZARD — 4-step emergency protocol
   ================================================================= */
export function EmergencyAccessWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [reason, setReason] = useState("");
  const [scope, setScope] = useState("");
  const [confirm, setConfirm] = useState("");
  const steps = [{ label: "Justify", icon: "bi-exclamation-triangle" }, { label: "Scope", icon: "bi-funnel" }, { label: "Approve", icon: "bi-shield-lock" }, { label: "Execute", icon: "bi-check2" }];

  return (
    <Modal open={open} onClose={() => { setStep(0); setReason(""); setScope(""); setConfirm(""); onClose(); }} title="Emergency Access Protocol" subtitle={`Step ${step + 1} of 4: ${steps[step].label}`} icon="bi-lightning-charge-fill" tone="red" size="lg">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
      <Steps current={step} steps={steps} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div>
            <div className="pm-note mb-3" style={{ borderLeft: "3px solid var(--pm-danger)", background: "var(--pm-danger-soft)" }}>
              <div className="pm-td-strong" style={{ color: "var(--pm-danger)" }}><i className="bi bi-lightning-charge-fill me-1" />EMERGENCY ACCESS PROTOCOL</div>
              <div className="mt-1">This grants temporary elevated access for up to 4 hours. All actions are logged and reviewed within 48 hours.</div>
            </div>
            <label className="form-label">Reason for emergency access <span className="text-danger">*</span></label>
            <textarea className="form-control" rows={3} placeholder="Describe the critical incident requiring emergency access..." value={reason} onChange={e => setReason(e.target.value)} />
            <div className="mt-2"><label className="form-label">Incident severity</label><select className="form-select"><option>Critical — Production down</option><option>High — Security breach</option><option>High — Regulatory deadline</option><option>Medium — System recovery</option></select></div>
          </div>
        )}
        {step === 1 && (
          <div>
            <label className="form-label">Access scope <span className="text-danger">*</span></label>
            <select className="form-select mb-3" value={scope} onChange={e => setScope(e.target.value)}>
              <option value="">Select scope...</option>
              <option value="full">Full platform access (Tier 0 equivalent)</option>
              <option value="fraud">Full fraud dashboard access</option>
              <option value="compliance">Full compliance suite</option>
              <option value="finance">Finance reports and settlements</option>
              <option value="system">System configuration</option>
              <option value="custom">Custom scope (specify below)</option>
            </select>
            {scope === "custom" && <textarea className="form-control" rows={2} placeholder="Specify exact permissions needed..." />}
            <div className="mt-3"><label className="form-label">Duration</label><select className="form-select"><option>4 hours (maximum)</option><option>2 hours</option><option>1 hour</option></select></div>
            <div className="pm-note mt-3"><i className="bi bi-clock me-1" />Access will be automatically revoked after the specified duration.</div>
          </div>
        )}
        {step === 2 && (
          <div>
            <div className="pm-note mb-3" style={{ borderLeft: "3px solid var(--pm-danger)", background: "var(--pm-danger-soft)" }}>
              <div className="pm-td-strong" style={{ color: "var(--pm-danger)" }}><i className="bi bi-shield-lock me-1" />DUAL APPROVAL REQUIRED</div>
              <div className="mt-1">Emergency access requires confirmation from a second Super Admin within 15 minutes.</div>
            </div>
            <div className="pm-card pm-card-pad mb-3">
              <h6>Approval request</h6>
              <div className="pm-kv"><span className="k">Requestor</span><span className="v">Joseph Mwangi (Super Admin)</span></div>
              <div className="pm-kv"><span className="k">2FA required</span><span className="v">Yes</span></div>
              <div className="pm-kv"><span className="k">Auto-expiry</span><span className="v">4 hours</span></div>
            </div>
            <label className="form-label">Type EMERGENCY to approve</label>
            <input className="form-control" style={{ borderColor: "var(--pm-danger)" }} placeholder="Type EMERGENCY" value={confirm} onChange={e => setConfirm(e.target.value)} />
          </div>
        )}
        {step === 3 && (
          <div className="pm-card pm-card-pad">
            <Badge tone="red" dot>Emergency access activating</Badge>
            <h6 className="mt-3">Access granted</h6>
            <div className="pm-kv"><span className="k">Scope</span><span className="v">{scope === "full" ? "Full platform access" : scope || "Not specified"}</span></div>
            <div className="pm-kv"><span className="k">Duration</span><span className="v">4 hours</span></div>
            <div className="pm-kv"><span className="k">Expires at</span><span className="v">18:32 today</span></div>
            <div className="pm-kv"><span className="k">Monitoring</span><span className="v">Real-time logging active</span></div>
            <div className="pm-kv"><span className="k">Post-incident review</span><span className="v">Required within 48 hours</span></div>
            <div className="pm-note mt-3"><i className="bi bi-exclamation-triangle me-1" />All actions during emergency access will be flagged for mandatory review.</div>
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => step > 0 ? setStep(step - 1) : (setStep(0), setReason(""), setScope(""), setConfirm(""), onClose())}>{step > 0 ? "← Back" : "Cancel"}</button>
        {step < 3 ? <button className="btn btn-primary btn-sm" disabled={(step === 0 && !reason) || (step === 1 && !scope) || (step === 2 && confirm !== "EMERGENCY")} onClick={() => setStep(step + 1)}>Continue →</button>
          : <button className="btn btn-danger btn-sm" onClick={() => { push({ kind: "warn", title: "Emergency access active", body: "4-hour window started. All actions logged." }); setStep(0); setReason(""); setScope(""); setConfirm(""); onClose(); }}>
            <i className="bi bi-lightning-charge-fill me-1" />Acknowledge & activate
          </button>}
      </div>
    </Modal>
  );
}

/* =================================================================
   6. COMPLIANCE AUDIT MODAL — Detailed compliance view
   ================================================================= */
export function ComplianceAuditModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  return (
    <Modal open={open} onClose={onClose} title="Compliance Audit Report" subtitle="Platform-wide compliance status and findings" icon="bi-clipboard-check" tone="violet" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">
          {[["12", "Passed", "green"], ["3", "Remediated", "blue"], ["2", "In progress", "amber"], ["0", "Failed", "red"]].map(([count, label, color]) => (
            <div className="col-3" key={label}><div className="pm-card pm-card-pad text-center"><div className="h4 mb-0">{count}</div><Badge tone={color}>{label}</Badge></div></div>
          ))}
        </div>
        <h6>Compliance metrics</h6>
        {[
          ["MFA enrollment rate", "88.9%", "8/9 admins enrolled", "green"],
          ["Average access review age", "32 days", "Target: <30 days", "amber"],
          ["Privileged access ratio", "22.2%", "2/9 admins at Tier 0-2", "green"],
          ["Permission change SLA", "100%", "All within 48h", "green"],
          ["Emergency access incidents", "1", "30-day rolling window", "blue"],
          ["Shared credential incidents", "1", "Under investigation", "red"]
        ].map(([metric, value, detail, color]) => (
          <div key={metric} className="d-flex justify-content-between align-items-center py-2 border-bottom">
            <div><b>{metric}</b><div className="pm-td-sub">{detail}</div></div>
            <Badge tone={color}>{value}</Badge>
          </div>
        ))}
        <div className="pm-card pm-card-pad mt-3">
          <h6>Upcoming compliance deadlines</h6>
          {[
            ["Annual access review", "Nov 1, 2026", "amber"],
            ["Penetration test", "Sep 15, 2026", "blue"],
            ["SOC 2 audit", "Dec 1, 2026", "blue"]
        ].map(([item, date, color]) => (
            <div key={item} className="d-flex justify-content-between py-1 border-bottom small">
              <span>{item}</span><Badge tone={color}>{date}</Badge>
            </div>
          ))}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-outline-primary btn-sm" onClick={() => { push({ kind: "success", title: "Audit report exported" }); onClose(); }}><i className="bi bi-download me-1" />Export report</button>
        <button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Compliance review initiated" }); onClose(); }}><i className="bi bi-clipboard-check me-1" />Start new audit</button>
      </div>
    </Modal>
  );
}

/* =================================================================
   7. ADMIN ACTIVITY LOG MODAL — Detailed activity trail
   ================================================================= */
export function AdminActivityLogModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Admin Activity Log" subtitle="Detailed activity trail for all administrators" icon="bi-clock-history" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Time</th><th>Admin</th><th>Action</th><th>Target</th><th>IP</th><th>Result</th></tr></thead>
            <tbody>
              {[
                ["14:32", "Joseph M.", "Grant permission", "Peter N. → Export data", "192.168.1.10", "Success", "green"],
                ["14:15", "Joseph M.", "Revoke permission", "Peter N. → Impersonate", "192.168.1.10", "Success", "green"],
                ["13:45", "Joseph M.", "Create role", "Regional Manager", "192.168.1.10", "Success", "green"],
                ["12:30", "Joseph M.", "Assign role", "Samuel K. → Support Agent", "10.0.0.15", "Success", "green"],
                ["11:48", "System", "Lockout", "Kevin O. → 6 failed logins", "203.0.113.42", "Locked", "red"],
                ["10:12", "Amina H.", "Emergency request", "Full fraud dashboard", "172.16.0.5", "Pending", "amber"],
                ["09:30", "Brian O.", "MFA enrollment", "Hardware key registered", "192.168.2.20", "Success", "green"],
                ["08:15", "System", "Session timeout", "Jane W. → idle >30min", "10.0.0.22", "Auto-terminated", "blue"]
              ].map(([time, admin, action, target, ip, result, color]) => (
                <tr key={`${time}-${action}`}>
                  <td className="mono">{time}</td>
                  <td className="pm-td-strong">{admin}</td>
                  <td>{action}</td>
                  <td>{target}</td>
                  <td className="mono" style={{ fontSize: ".75rem" }}>{ip}</td>
                  <td><Badge tone={color} dot>{result}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-primary btn-sm" onClick={onClose}><i className="bi bi-download me-1" />Export log</button>
      </div>
    </Modal>
  );
}

/* =================================================================
   8. DOCUMENT PREVIEW MODAL — Letterhead document rendering
   ================================================================= */
export function DocumentPreviewModal({ doc, open, onClose }: { doc: RoleDocument | null; open: boolean; onClose: () => void }) {
  if (!doc || !open) return null;
  const content = doc.content || "No content available for this document.";
  const rendered = content.replace(/\{\{(\w+)\}\}/g, (_, key) => `<span class="doc-var">\{\{${key}\}\}</span>`);

  return (
    <Modal open={open} onClose={onClose} title={`${doc.name}`} subtitle={`${doc.version} · ${doc.classification} · Document preview`} icon="bi-file-earmark-text" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="doc-preview-toolbar">
          <div className="d-flex gap-2 align-items-center">
            <Badge tone={doc.status === "Active" ? "green" : "blue"}>{doc.status}</Badge>
            <span className="pm-td-sub">{doc.version}</span>
            <Badge tone={doc.classification === "Secret" ? "red" : doc.classification === "Confidential" ? "amber" : "grey"}>{doc.classification}</Badge>
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
          <hr className="doc-preview-divider" />
          <div className="doc-preview-body" style={{ whiteSpace: "pre-wrap", fontFamily: "'Inter', system-ui, sans-serif", fontSize: ".82rem", lineHeight: 1.6, color: "#101828" }}>
            {content}
          </div>
          <hr className="doc-preview-divider" />
          <div className="pm-td-sub text-center" style={{ fontSize: ".7rem" }}>
            This document is classified as {doc.classification}. Unauthorized distribution is prohibited.
            <br />Document ID: {doc.id.toUpperCase()} · Version: {doc.version} · Last updated by: {doc.updatedBy}
          </div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-outline-primary btn-sm"><i className="bi bi-pencil me-1" />Edit document</button>
        <button className="btn btn-primary btn-sm"><i className="bi bi-download me-1" />Download PDF</button>
      </div>
    </Modal>
  );
}

/* =================================================================
   9. DOCUMENT UPLOAD WIZARD — 4-step upload workflow
   ================================================================= */
export function DocumentUploadWizard({ open, onClose, onComplete }: { open: boolean; onClose: () => void; onComplete: (doc: RoleDocument) => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", type: "Policy", role: "All roles", classification: "Internal" });
  const steps = [{ label: "Document info", icon: "bi-file-earmark" }, { label: "Classification", icon: "bi-shield-lock" }, { label: "Access control", icon: "bi-key" }, { label: "Review & publish", icon: "bi-check2" }];

  return (
    <Modal open={open} onClose={() => { setStep(0); onClose(); }} title="Upload Role Document" subtitle={`Step ${step + 1} of 4: ${steps[step].label}`} icon="bi-cloud-arrow-up" tone="blue" size="lg">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
      <Steps current={step} steps={steps} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div className="row g-3">
            <div className="col-12"><label className="form-label">Document name <span className="text-danger">*</span></label><input className="form-control" placeholder="e.g. Access Control Policy" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="col-md-6"><label className="form-label">Document type</label><select className="form-select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              <option>Policy</option><option>Protocol</option><option>Guide</option><option>Checklist</option><option>Template</option>
            </select></div>
            <div className="col-md-6"><label className="form-label">Applies to role</label><select className="form-select" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
              <option>All roles</option><option>Super Admin</option><option>Platform Admin</option><option>Operations Manager</option><option>Compliance Officer</option>
            </select></div>
            <div className="col-12"><label className="form-label">Document content</label><textarea className="form-control" rows={6} placeholder="Enter or paste document content..." /></div>
          </div>
        )}
        {step === 1 && (
          <div className="row g-3">
            <div className="pm-note mb-2"><i className="bi bi-shield-lock me-1" />Document classification determines access restrictions and retention policies.</div>
            <div className="col-12"><label className="form-label">Classification level</label>
              {[["Internal", "General internal use", "grey"], ["Confidential", "Restricted — admin access only", "amber"], ["Secret", "Highly restricted — Tier 0-2 only", "red"]].map(([level, desc, color]) => (
                <label key={level} className="d-flex align-items-center gap-2 mb-2 p-2 border rounded" style={{ cursor: "pointer", background: form.classification === level ? "var(--pm-primary-soft, #eff8ff)" : "transparent" }}>
                  <input type="radio" className="form-check-input" name="classification" checked={form.classification === level} onChange={() => setForm(p => ({ ...p, classification: level }))} />
                  <div><b>{level}</b><div className="pm-td-sub">{desc}</div></div>
                </label>
              ))}
            </div>
            <div className="col-md-6"><label className="form-label">Retention period</label><select className="form-select"><option>Indefinite</option><option>5 years</option><option>3 years</option><option>1 year</option></select></div>
            <div className="col-md-6"><label className="form-label">Review frequency</label><select className="form-select"><option>Annual</option><option>Quarterly</option><option>Biannual</option></select></div>
          </div>
        )}
        {step === 2 && (
          <div>
            <p className="small text-muted mb-3">Configure who can view, edit, and publish this document.</p>
            <div className="mb-3">
              <label className="form-label">View access</label>
              {["Super Admin", "Platform Admin", "Operations Manager", "Compliance Officer", "Finance Manager", "All roles"].map(role => (
                <label key={role} className="d-flex align-items-center gap-2 mb-1" style={{ fontSize: ".85rem" }}>
                  <input type="checkbox" className="form-check-input" defaultChecked={role !== "All roles"} />{role}
                </label>
              ))}
            </div>
            <div className="mb-3">
              <label className="form-label">Edit access</label>
              {["Super Admin", "Platform Admin"].map(role => (
                <label key={role} className="d-flex align-items-center gap-2 mb-1" style={{ fontSize: ".85rem" }}>
                  <input type="checkbox" className="form-check-input" defaultChecked />{role}
                </label>
              ))}
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="pm-card pm-card-pad">
            <Badge tone="blue" dot>Ready to publish</Badge>
            <h6 className="mt-3">Document summary</h6>
            <div className="pm-kv"><span className="k">Name</span><span className="v">{form.name || "Untitled"}</span></div>
            <div className="pm-kv"><span className="k">Type</span><span className="v">{form.type}</span></div>
            <div className="pm-kv"><span className="k">Classification</span><span className="v">{form.classification}</span></div>
            <div className="pm-kv"><span className="k">Applies to</span><span className="v">{form.role}</span></div>
            <div className="pm-note mt-3"><i className="bi bi-info-circle me-1" />Document will be versioned and all changes tracked in the audit trail.</div>
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => step > 0 ? setStep(step - 1) : (setStep(0), onClose())}>{step > 0 ? "← Back" : "Cancel"}</button>
        {step < 3 ? <button className="btn btn-primary btn-sm" disabled={step === 0 && !form.name} onClick={() => setStep(step + 1)}>Continue →</button>
          : <button className="btn btn-primary btn-sm" onClick={() => { onComplete({ id: `doc-${Date.now()}`, name: form.name || "Untitled", type: form.type, role: form.role, status: "Active", version: "v1.0", created: new Date().toLocaleDateString(), updatedBy: "Super Admin", classification: form.classification, content: "" }); setStep(0); push({ kind: "success", title: "Document published", body: "Document is now available for assigned roles." }); onClose(); }}>
            <i className="bi bi-check2 me-1" />Publish document
          </button>}
      </div>
    </Modal>
  );
}

/* =================================================================
   10. DOCUMENT MANAGEMENT DRAWER — Full document admin
   ================================================================= */
export function DocumentManagementDrawer({ documents, open, onClose, onPreview, onEdit, onDelete }: {
  documents: RoleDocument[]; open: boolean; onClose: () => void;
  onPreview: (doc: RoleDocument) => void; onEdit: (doc: RoleDocument) => void; onDelete: (doc: RoleDocument) => void;
}) {
  if (!open) return null;
  return (
    <Drawer open onClose={onClose} title="Document Repository" subtitle="Role-based documents, policies and protocols" icon="bi-folder2-open" wide>
      <div className="pm-card pm-card-pad mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0">Document Library</h6>
          <Badge tone="blue">{documents.length} documents</Badge>
        </div>
        {documents.map(doc => (
          <div key={doc.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="pm-td-strong" style={{ fontSize: ".85rem" }}>{doc.name}</div>
              <div className="pm-td-sub">{doc.type} · {doc.version} · {doc.classification}</div>
            </div>
            <div className="d-flex gap-1">
              <button className="btn btn-sm btn-outline-primary" onClick={() => onPreview(doc)} title="Preview"><i className="bi bi-eye" /></button>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => onEdit(doc)} title="Edit"><i className="bi bi-pencil" /></button>
              <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(doc)} title="Delete"><i className="bi bi-trash3" /></button>
            </div>
          </div>
        ))}
      </div>
      <div className="pm-card pm-card-pad">
        <h6>Document statistics</h6>
        <div className="pm-kv"><span className="k">Active documents</span><span className="v">{documents.filter(d => d.status === "Active").length}</span></div>
        <div className="pm-kv"><span className="k">Confidential+</span><span className="v">{documents.filter(d => d.classification === "Confidential" || d.classification === "Secret").length}</span></div>
        <div className="pm-kv"><span className="k">Last updated</span><span className="v">{documents[0]?.created || "—"}</span></div>
      </div>
    </Drawer>
  );
}

/* =================================================================
   11. PERMISSION IMPACT ANALYSIS MODAL
   ================================================================= */
export function PermImpactModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  return (
    <Modal open={open} onClose={onClose} title="Permission Impact Analysis" subtitle="Before granting a new permission, review its downstream effects" icon="bi-graph-up" tone="amber" size="lg">
      <div className="pm-modal-body">
        <div className="row g-2 mb-3"><div className="col"><Badge tone="blue">Permission: Export user data</Badge></div><div className="col"><Badge tone="amber">Target: Peter Njoroge (Minor Admin)</Badge></div></div>
        <h6>Impact assessment</h6>
        {[["Affected users", "1 administrator gains export access"], ["Risk level", "Medium — PII export capability"], ["Compliance", "Requires audit evidence and reason"], ["Data scope", "User profiles, KYC documents, transaction history"], ["Retention", "Export logged with SHA-256 hash"], ["Approval", "Super Admin + 2FA required"]].map(([k, v]) => (
          <div key={k} className="d-flex justify-content-between py-1 border-bottom small"><span className="text-muted">{k}</span><b>{v}</b></div>
        ))}
        <div className="mt-3"><label className="form-label">Business justification</label><textarea className="form-control" rows={2} defaultValue="Need to export user data for quarterly compliance review." /></div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Grant submitted for approval" }); onClose(); }}>Submit for approval</button>
      </div>
    </Modal>
  );
}

/* =================================================================
   12. ROLE COMPARISON MODAL — Side-by-side comparison
   ================================================================= */
export function RoleComparisonModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Role Comparison" subtitle="Side-by-side permission comparison" icon="bi-arrows-angle-contract" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-2 mb-3">
          <div className="col"><label className="form-label">Role A</label><select className="form-select"><option>Minor Admin (Tier 6)</option><option>Operations Manager (Tier 2)</option></select></div>
          <div className="col"><label className="form-label">Role B</label><select className="form-select"><option>Analyst (Tier 7)</option><option>Support Agent (Tier 8)</option></select></div>
        </div>
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Permission</th><th>Minor Admin</th><th>Analyst</th><th>Diff</th></tr></thead>
            <tbody>
              {[["View users", true, true, "Same"], ["Edit user profile", true, false, "Different"], ["View transactions", true, true, "Same"], ["Export data", true, false, "Different"], ["Freeze account", false, false, "Same"], ["View P&L", false, true, "Different"], ["Manage blacklist", false, false, "Same"], ["View risk scores", true, false, "Different"], ["File SAR", false, false, "Same"], ["View analytics", true, true, "Same"]].map(([perm, a, b, diff]) => (
                <tr key={perm}>
                  <td className="pm-td-strong">{perm}</td>
                  <td><i className={`bi ${a ? "bi-check-circle-fill text-success" : "bi-dash-circle text-muted"}`} /></td>
                  <td><i className={`bi ${b ? "bi-check-circle-fill text-success" : "bi-dash-circle text-muted"}`} /></td>
                  <td><Badge tone={diff === "Same" ? "grey" : "blue"}>{diff}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* =================================================================
   13. ANNUAL ACCESS REVIEW MODAL
   ================================================================= */
export function AccessReviewModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  return (
    <Modal open={open} onClose={onClose} title="Annual Access Review" subtitle="Quarterly access review for privileged accounts" icon="bi-calendar-check" tone="violet" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">
          {[["18", "Accounts to review", "blue"], ["3", "Overdue reviews", "red"], ["12", "Completed", "green"], ["3", "Pending", "amber"]].map(([count, label, color]) => (
            <div className="col-3" key={label}><div className="pm-card pm-card-pad text-center"><div className="h4 mb-0">{count}</div><div className="small text-muted">{label}</div></div></div>
          ))}
        </div>
        <h6>Overdue reviews</h6>
        {[["Peter Njoroge", "Minor Admin", "90 days overdue", "red"], ["Jane Wambui", "Analyst", "30 days overdue", "amber"], ["Samuel Kariuki", "Support Agent", "15 days overdue", "amber"]].map(([name, role, status, color]) => (
          <div key={name} className="d-flex justify-content-between align-items-center py-2 border-bottom small">
            <div><b>{name}</b> — <span className="text-muted">{role}</span></div>
            <Badge tone={color}>{status}</Badge>
          </div>
        ))}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Review reminders sent" }); onClose(); }}>Send reminders</button>
      </div>
    </Modal>
  );
}

/* =================================================================
   14. ACCESS POLICY DRAWER — Full policy details
   ================================================================= */
export function AccessPolicyDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Drawer open onClose={onClose} title="Access Control Policy" subtitle="Platform-wide RBAC and least-privilege guardrails" icon="bi-shield-lock" wide>
      <div className="pm-card pm-card-pad mb-3">
        <Badge tone="green" dot>Policy active</Badge>
        <h6 className="mt-3">Core principles</h6>
        {["Least-privilege by default", "Dual approval for destructive actions", "48-hour maximum for pending changes", "Annual access review mandatory", "Separation of duties enforced"].map(p => (
          <div key={p} className="d-flex gap-2 align-items-center py-1 border-bottom small"><i className="bi bi-check-circle-fill text-success" /><span>{p}</span></div>
        ))}
      </div>
      <div className="pm-card pm-card-pad mb-3">
        <h6>Approval matrix</h6>
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Action</th><th>Approval</th><th>2FA</th><th>SLA</th></tr></thead>
            <tbody>
              {[["Grant Tier 0–2", "Super Admin + 2FA", "Required", "24h"], ["Grant Tier 3–5", "Dual Super Admin", "Required", "24h"], ["Grant Tier 6–9", "Super Admin", "Required", "48h"], ["Revoke any", "Super Admin", "Required", "Immediate"], ["Custom role create", "Super Admin + 2FA", "Required", "48h"]].map(r => (
                <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 0 ? "pm-td-strong" : ""}>{c}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="pm-card pm-card-pad">
        <h6>Policy version</h6>
        {[["Version", "3.2"], ["Effective", "Aug 1, 2026"], ["Owner", "Jeckonia Kwasa"], ["Review cadence", "Quarterly"], ["Next review", "Nov 1, 2026"]].map(([k, v]) => (
          <div key={k} className="d-flex justify-content-between py-1 border-bottom small"><span className="text-muted">{k}</span><b>{v}</b></div>
        ))}
      </div>
    </Drawer>
  );
}

/* =================================================================
   15. PERMISSION CHANGE HISTORY MODAL — Full history
   ================================================================= */
export function RoleHistoryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Permission Change History" subtitle="Immutable record of all role and permission changes" icon="bi-clock-history" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Date</th><th>Admin</th><th>Role</th><th>Permission</th><th>Change</th><th>Approved by</th><th>Status</th></tr></thead>
            <tbody>
              {[["Aug 25", "Joseph M.", "Regional Manager", "View regional analytics", "Granted", "Platform Admin", "Pending", "amber"],
                ["Aug 22", "Joseph M.", "Minor Admin", "Impersonate user", "Revoked", "Super Admin", "Deployed", "green"],
                ["Aug 20", "Sarah K.", "Risk Analyst", "Configure fraud rules", "Revoked", "Super Admin", "Pending", "amber"],
                ["Aug 18", "Joseph M.", "Support Lead", "Escalate to compliance", "Granted", "Super Admin", "Deployed", "green"],
                ["Aug 15", "Joseph M.", "Minor Admin", "Export user data", "Granted", "Super Admin", "Deployed", "green"],
                ["Aug 10", "David K.", "Minor Admin", "View settlements", "Granted", "Platform Admin", "Deployed", "green"],
                ["Aug 1", "Joseph M.", "Support Agent", "View risk scores", "Granted", "Platform Admin", "Deployed", "green"]].map(r => (
                <tr key={r[0]}>
                  <td>{r[0]}</td><td className="pm-td-strong">{r[1]}</td><td className="pm-td-strong">{r[2]}</td><td>{r[3]}</td>
                  <td><Badge tone={r[4] === "Granted" ? "green" : "red"} dot>{r[4]}</Badge></td>
                  <td>{r[5]}</td><td><Badge tone={r[7]}>{r[6]}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-primary btn-sm" onClick={onClose}>Export history</button>
      </div>
    </Modal>
  );
}

/* =================================================================
   16. PERMISSION MATRIX EXPORT MODAL
   ================================================================= */
export function PermMatrixExportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  return (
    <Modal open={open} onClose={onClose} title="Export Permission Matrix" subtitle="Generate a signed permission matrix for compliance review" icon="bi-grid-3x3-gap" tone="blue">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Format</label><select className="form-select"><option>PDF (signed)</option><option>Excel (CSV)</option><option>JSON (machine-readable)</option></select></div>
          <div className="col-md-6"><label className="form-label">Scope</label><select className="form-select"><option>All roles</option><option>Custom roles only</option><option>Tier 0–3</option></select></div>
          <div className="col-12"><label className="form-label">Include</label>
            <div className="form-check"><input className="form-check-input" type="checkbox" id="pm1" defaultChecked /><label className="form-check-label small" htmlFor="pm1">Permission grants per role</label></div>
            <div className="form-check"><input className="form-check-input" type="checkbox" id="pm2" defaultChecked /><label className="form-check-label small" htmlFor="pm2">Admin assignments</label></div>
            <div className="form-check"><input className="form-check-input" type="checkbox" id="pm3" defaultChecked /><label className="form-check-label small" htmlFor="pm3">Change history</label></div>
          </div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Matrix exported" }); onClose(); }}>Generate export</button>
      </div>
    </Modal>
  );
}

/* =================================================================
   17. PERMISSION CATALOGUE DRAWER
   ================================================================= */
export function PermCatalogueDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  const cats: Record<string, string[]> = {
    USERS: ["View user list", "View user detail", "Edit user profile", "Freeze account", "Unfreeze account", "Close account", "Impersonate user", "Delete user"],
    TRANSACTIONS: ["View all transactions", "Reverse transaction", "Approve high-value", "Set fee schedule", "Override fee", "Set withdrawal limits"],
    "FRAUD & RISK": ["View fraud dashboard", "Block transaction", "Flag user", "Blacklist user", "Review alerts", "Configure rules"],
    FINANCE: ["View P&L", "View balance sheet", "Approve settlements", "Manage pools", "Set tax rates", "Manage charges"],
    SYSTEM: ["Manage admins", "View audit log", "Configure system", "Manage roles", "API key management", "Database access"]
  };
  return (
    <Drawer open onClose={onClose} title="Permission Catalogue" subtitle="Full permission tree by domain" icon="bi-list-nested" wide>
      {Object.entries(cats).map(([cat, items]) => (
        <div key={cat} className="pm-card pm-card-pad mb-3">
          <h6>{cat}</h6>
          {items.map(p => <div key={p} className="d-flex align-items-center gap-2 py-1 border-bottom small"><i className="bi bi-circle" /><span>{p}</span></div>)}
        </div>
      ))}
    </Drawer>
  );
}

/* =================================================================
   18. PERMISSION GRANT MODAL — Grant/revoke individual permission
   ================================================================= */
export function PermissionGrantModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [perm, setPerm] = useState("");
  const [target, setTarget] = useState("");
  const [action, setAction] = useState("grant");
  return (
    <Modal open={open} onClose={onClose} title="Grant/Revoke Permission" subtitle="Super Admin — Modify individual permission grants" icon="bi-key" tone="amber" size="md">
      <div className="pm-modal-body">
        <div className="pm-note mb-3"><i className="bi bi-shield-lock me-1" />Permission changes require 2FA and are logged in the audit trail.</div>
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Target admin</label><select className="form-select" value={target} onChange={e => setTarget(e.target.value)}>
            <option value="">Select admin...</option>
            <option>Peter Njoroge — Minor Admin</option><option>Jane Wambui — Analyst</option><option>Samuel Kariuki — Support Agent</option><option>Amina Hassan — Risk Analyst</option>
          </select></div>
          <div className="col-md-6"><label className="form-label">Permission</label><select className="form-select" value={perm} onChange={e => setPerm(e.target.value)}>
            <option value="">Select permission...</option>
            <option>View user list</option><option>Edit user profile</option><option>Export data</option><option>Freeze account</option><option>View fraud dashboard</option><option>Manage blacklist</option>
          </select></div>
          <div className="col-12"><label className="form-label">Action</label><div className="d-flex gap-2">
            <button className={`btn btn-sm ${action === "grant" ? "btn-success" : "btn-outline-secondary"}`} onClick={() => setAction("grant")}><i className="bi bi-plus-circle me-1" />Grant</button>
            <button className={`btn btn-sm ${action === "revoke" ? "btn-danger" : "btn-outline-secondary"}`} onClick={() => setAction("revoke")}><i className="bi bi-dash-circle me-1" />Revoke</button>
          </div></div>
          <div className="col-12"><label className="form-label">Business justification</label><textarea className="form-control" rows={2} placeholder="Explain why this permission change is needed..." /></div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={!target || !perm} onClick={() => { push({ kind: "success", title: `Permission ${action === "grant" ? "granted" : "revoked"}`, body: "Change submitted for 2FA confirmation." }); onClose(); }}>
          <i className={`bi ${action === "grant" ? "bi-plus-circle" : "bi-dash-circle"} me-1`} />{action === "grant" ? "Grant permission" : "Revoke permission"}
        </button>
      </div>
    </Modal>
  );
}

/* =================================================================
   19. BULK PERMISSION OPERATIONS WIZARD — 4-step bulk ops
   ================================================================= */
export function BulkPermissionWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [operation, setOperation] = useState("");
  const [confirm, setConfirm] = useState("");
  const steps = [{ label: "Operation", icon: "bi-gear" }, { label: "Select targets", icon: "bi-people" }, { label: "Preview", icon: "bi-eye" }, { label: "Execute", icon: "bi-check2" }];

  return (
    <Modal open={open} onClose={() => { setStep(0); setOperation(""); setConfirm(""); onClose(); }} title="Bulk Permission Operations" subtitle={`Step ${step + 1} of 4: ${steps[step].label}`} icon="bi-gear-wide-connected" tone="blue" size="lg">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
      <Steps current={step} steps={steps} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div>
            <p className="small text-muted mb-3">Select the bulk operation to perform.</p>
            {[["grant", "Bulk grant permission", "Grant a permission to multiple admins", "bi-plus-circle", "green"], ["revoke", "Bulk revoke permission", "Revoke a permission from multiple admins", "bi-dash-circle", "red"], ["reassign", "Bulk role reassignment", "Move multiple admins to a new role", "bi-arrow-left-right", "blue"], ["audit", "Bulk access review", "Review and confirm access for multiple admins", "bi-clipboard-check", "amber"]].map(([val, title, desc, icon, color]) => (
              <button key={val} className={`d-flex align-items-center gap-3 w-100 p-3 mb-2 border rounded ${operation === val ? "border-primary bg-primary bg-opacity-10" : ""}`} onClick={() => setOperation(val)} style={{ cursor: "pointer", textAlign: "left" }}>
                <div className={`pm-stat-ico bg-${color}-soft text-${color}`}><i className={`bi ${icon}`} /></div>
                <div><b>{title}</b><div className="pm-td-sub">{desc}</div></div>
              </button>
            ))}
          </div>
        )}
        {step === 1 && (
          <div>
            <p className="small text-muted mb-3">Select administrators for this operation.</p>
            {["Joseph Mwangi — Super Admin", "Sarah Kamau — Platform Admin", "Peter Njoroge — Minor Admin", "Jane Wambui — Analyst", "Samuel Kariuki — Support Agent"].map(a => (
              <label key={a} className="d-flex align-items-center gap-2 mb-2 p-2 border-bottom"><input type="checkbox" className="form-check-input" defaultChecked={a.includes("Peter") || a.includes("Jane")} /><span className="small">{a}</span></label>
            ))}
          </div>
        )}
        {step === 2 && (
          <div className="pm-card pm-card-pad">
            <h6>Operation preview</h6>
            <div className="pm-kv"><span className="k">Operation</span><span className="v">{operation || "Not selected"}</span></div>
            <div className="pm-kv"><span className="k">Affected admins</span><span className="v">2 administrators</span></div>
            <div className="pm-kv"><span className="k">Approval required</span><span className="v">Super Admin + 2FA</span></div>
            <div className="pm-note mt-3"><i className="bi bi-info-circle me-1" />All changes will be staged until 2FA confirmation. Changes are logged in the audit trail.</div>
          </div>
        )}
        {step === 3 && (
          <div>
            <div className="pm-note mb-3" style={{ borderLeft: "3px solid var(--pm-danger)", background: "var(--pm-danger-soft)" }}>
              <div className="pm-td-strong" style={{ color: "var(--pm-danger)" }}><i className="bi bi-shield-lock me-1" />CONFIRMATION REQUIRED</div>
            </div>
            <label className="form-label" style={{ color: "var(--pm-danger)" }}>Type CONFIRM to execute</label>
            <input className="form-control" style={{ borderColor: "var(--pm-danger)" }} placeholder="Type CONFIRM" value={confirm} onChange={e => setConfirm(e.target.value)} />
            <div className="pm-card pm-card-pad mt-3">
              <div className="pm-kv"><span className="k">Operation</span><span className="v">{operation}</span></div>
              <div className="pm-kv"><span className="k">Audit log</span><span className="v">Will be recorded</span></div>
            </div>
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => step > 0 ? setStep(step - 1) : (setStep(0), setOperation(""), setConfirm(""), onClose())}>{step > 0 ? "← Back" : "Cancel"}</button>
        {step < 3 ? <button className="btn btn-primary btn-sm" disabled={step === 0 && !operation} onClick={() => setStep(step + 1)}>Continue →</button>
          : <button className="btn btn-primary btn-sm" disabled={confirm !== "CONFIRM"} onClick={() => { push({ kind: "success", title: "Bulk operation executed", body: "Changes applied to 2 administrators." }); setStep(0); setOperation(""); setConfirm(""); onClose(); }}>
            <i className="bi bi-check2 me-1" />Execute operation
          </button>}
      </div>
    </Modal>
  );
}

/* =================================================================
   20. PERMISSION DIFF MODAL — Before/after comparison
   ================================================================= */
export function PermChangeDiffModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  return (
    <Modal open={open} onClose={onClose} title="Permission Change Diff" subtitle="Before and after comparison for the proposed change" icon="bi-key" tone="amber" size="lg">
      <div className="pm-modal-body">
        <div className="row g-2 mb-3"><div className="col"><Badge tone="blue">Admin: Peter Njoroge</Badge></div><div className="col"><Badge tone="amber">Role: Minor Admin</Badge></div></div>
        <h6>Changes</h6>
        {[["Export user data", "granted", "green", "bi-plus-circle-fill"], ["Impersonate user", "revoked", "red", "bi-dash-circle-fill"]].map(c => (
          <div key={c[0]} className="d-flex align-items-center gap-2 py-1 border-bottom small"><i className={`bi ${c[3]} text-${c[2]}`} /><span>{c[0]}</span><Badge tone={c[2] as any} className="ms-auto">{c[1]}</Badge></div>
        ))}
        <div className="mt-3"><label className="form-label">Change reason</label><textarea className="form-control" rows={2} defaultValue="Security review — impersonate access too privileged for Minor Admin." /></div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Change staged for approval" }); onClose(); }}>Approve with 2FA</button>
      </div>
    </Modal>
  );
}

/* =================================================================
   21. EMERGENCY ACCESS REQUEST MODAL
   ================================================================= */
export function EmergencyAccessRequestModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  return (
    <Modal open={open} onClose={onClose} title="Emergency Access Requests" subtitle="Review pending emergency access requests" icon="bi-lightning-charge" tone="red" size="lg">
      <div className="pm-modal-body">
        {[["Amina Hassan", "Risk Analyst", "Critical fraud incident — immediate investigation needed", "Pending", "10:12 today", "18:12 today"],
          ["David Kimani", "Compliance Officer", "Regulatory deadline — SAR filing due today", "Approved", "Aug 22 09:00", "Aug 22 18:00"],
          ["Peter Njoroge", "Minor Admin", "System outage — server recovery required", "Expired", "Aug 15 03:00", "Aug 15 09:00"]
        ].map(([name, role, reason, status, start, end], i) => (
          <div key={i} className="pm-card pm-card-pad mb-2" style={{ borderLeft: `3px solid var(--pm-${status === "Pending" ? "danger" : status === "Approved" ? "green" : "grey"})` }}>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="pm-td-strong">{name} — {role}</div>
                <div className="pm-td-sub">{reason}</div>
                <div className="mt-1 small"><span className="text-muted">From:</span> {start} <span className="text-muted ms-2">To:</span> {end}</div>
              </div>
              <Badge tone={status === "Pending" ? "red" : status === "Approved" ? "green" : "grey"}>{status}</Badge>
            </div>
            {status === "Pending" && (
              <div className="d-flex gap-2 mt-2">
                <button className="btn btn-sm btn-success" onClick={() => { push({ kind: "success", title: "Emergency access approved" }); onClose(); }}><i className="bi bi-check-lg me-1" />Approve</button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => { push({ kind: "info", title: "Emergency access denied" }); onClose(); }}><i className="bi bi-x-lg me-1" />Deny</button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* =================================================================
   22. ROLE HIERARCHY MODAL — Visual role hierarchy
   ================================================================= */
export function RoleHierarchyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Role Hierarchy" subtitle="Visual role tier structure and escalation paths" icon="bi-diagram-3" tone="blue" size="lg">
      <div className="pm-modal-body">
        {[
          { tier: "Tier 0", name: "Super Admin", color: "red", count: "2 admins", perms: "80 permissions" },
          { tier: "Tier 1", name: "Platform Admin", color: "amber", count: "1 admin", perms: "72 permissions" },
          { tier: "Tier 2", name: "Operations Manager", color: "blue", count: "1 admin", perms: "58 permissions" },
          { tier: "Tier 3", name: "Compliance Officer", color: "blue", count: "1 admin", perms: "45 permissions" },
          { tier: "Tier 4", name: "Finance Manager", color: "blue", count: "1 admin", perms: "40 permissions" },
          { tier: "Tier 5", name: "Support Lead", color: "blue", count: "1 admin", perms: "32 permissions" },
          { tier: "Tier 6", name: "Custom Admin", color: "violet", count: "3 admins", perms: "18-28 permissions" },
          { tier: "Tier 7", name: "Analyst/Risk Analyst", color: "grey", count: "2 admins", perms: "12-22 permissions" },
          { tier: "Tier 8", name: "Support Agent", color: "grey", count: "2 admins", perms: "10 permissions" },
          { tier: "Tier 9", name: "Read-Only Viewer", color: "grey", count: "0 admins", perms: "5 permissions" }
        ].map((r, i) => (
          <div key={r.tier} className="d-flex align-items-center gap-3 py-2 border-bottom" style={{ paddingLeft: `${i * 12}px` }}>
            {i > 0 && <div style={{ width: 20, textAlign: "center", color: "#cbd5e1" }}>│</div>}
            <Badge tone={r.color}>{r.tier}</Badge>
            <div style={{ flex: 1 }}><b>{r.name}</b><div className="pm-td-sub">{r.count} · {r.perms}</div></div>
            {i < 9 && <i className="bi bi-arrow-down" style={{ color: "#cbd5e1" }} />}
          </div>
        ))}
        <div className="pm-note mt-3"><i className="bi bi-info-circle me-1" />Escalation path: Tier 8 → 5 → 2 → 1 → 0. Each tier inherits permissions from lower tiers.</div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* =================================================================
   23. DUPLICATE ROLE MODAL
   ================================================================= */
export function DuplicateRoleModal({ open, onClose, role }: { open: boolean; onClose: () => void; role: RoleRecord | null }) {
  const { push } = useToast();
  if (!role) return null;
  return (
    <Modal open={open} onClose={onClose} title="Duplicate Role" subtitle={`Create a copy of ${role.name}`} icon="bi-copy" tone="blue">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Source role</label><input className="form-control" value={role.name} readOnly /></div>
          <div className="col-md-6"><label className="form-label">New role name</label><input className="form-control" placeholder="e.g. Regional Admin" /></div>
          <div className="col-md-6"><label className="form-label">Tier level</label><select className="form-select"><option>{role.tier}</option><option>Tier 7</option><option>Tier 8</option></select></div>
          <div className="col-md-6"><label className="form-label">Copy from</label><select className="form-select"><option>Copy all grants</option><option>Copy grants only</option><option>Copy tier only</option></select></div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Role duplicated" }); onClose(); }}>Create draft</button>
      </div>
    </Modal>
  );
}

/* =================================================================
   24. RETIRE ROLE MODAL
   ================================================================= */
export function RetireRoleModal({ open, onClose, role }: { open: boolean; onClose: () => void; role: RoleRecord | null }) {
  const { push } = useToast();
  if (!role) return null;
  return (
    <Modal open={open} onClose={onClose} title="Retire Role" subtitle={`Revoke all grants and archive ${role.name}`} icon="bi-trash" tone="red">
      <div className="pm-modal-body">
        <div className="alert alert-warning small"><i className="bi bi-exclamation-triangle me-1" />This role cannot be deleted while administrators are assigned. Reassignment is required first.</div>
        <div className="row g-3">
          <div className="col-12"><label className="form-label">Reassign administrators to</label><select className="form-select"><option>Analyst (Tier 7)</option><option>Support Agent (Tier 8)</option><option>Read-Only Viewer (Tier 9)</option></select></div>
          <div className="col-12"><label className="form-label">Reason for retirement</label><textarea className="form-control" rows={2} placeholder="Role no longer needed..." /></div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger btn-sm" onClick={() => { push({ kind: "success", title: "Role retirement submitted" }); onClose(); }}>Submit for approval</button>
      </div>
    </Modal>
  );
}

/* =================================================================
   25. REVOKE ALL GRANTS MODAL
   ================================================================= */
export function RevokeAllGrantsModal({ open, onClose, count }: { open: boolean; onClose: () => void; count: number }) {
  const { push } = useToast();
  return (
    <Modal open={open} onClose={onClose} title="Revoke All Permission Grants" subtitle={`Clear all staged grants (${count} permissions)`} icon="bi-key" tone="amber">
      <div className="pm-modal-body">
        <p className="small text-muted">This will revoke {count} permission grants. All changes require Super Admin approval.</p>
        <div className="pm-card pm-card-pad">
          <h6>Grants to be revoked</h6>
          {["View users", "View user detail", "View transactions", "Export data", "View fraud dashboard", "View partners", "View analytics", "Manage notifications"].map(p => (
            <div key={p} className="d-flex align-items-center gap-2 py-1 border-bottom small"><i className="bi bi-dash-circle text-danger" /><span>{p}</span></div>
          ))}
          {count > 8 && <div className="small text-muted mt-2">+ {count - 8} more grants</div>}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger btn-sm" onClick={() => { push({ kind: "success", title: "Grants staged for revocation" }); onClose(); }}>Revoke all</button>
      </div>
    </Modal>
  );
}

/* =================================================================
   26. ASSIGN ADMINS MODAL — Assign/remove admins from role
   ================================================================= */
export function AssignAdminsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  return (
    <Modal open={open} onClose={onClose} title="Assign Administrators to Role" subtitle="Add or remove admin assignments with approval" icon="bi-person-plus" tone="blue">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-12"><label className="form-label">Currently assigned</label>
            {["Peter Njoroge — Minor Admin"].map(a => (
              <div key={a} className="d-flex justify-content-between align-items-center py-2 border-bottom small"><span>{a}</span><button className="btn btn-sm btn-outline-danger"><i className="bi bi-x" /></button></div>
            ))}
          </div>
          <div className="col-12"><label className="form-label">Add administrator</label>
            <select className="form-select"><option>Select administrator...</option><option>Samuel Kariuki — Support Agent</option><option>Jane Wambui — Analyst</option><option>David Kimani — Compliance Officer</option></select>
          </div>
          <div className="col-12"><label className="form-label">Effective date</label><input className="form-control" type="date" /></div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Assignment submitted" }); onClose(); }}>Submit for approval</button>
      </div>
    </Modal>
  );
}

/* =================================================================
   27. ROLE TEMPLATE DETAIL MODAL — View and use template
   ================================================================= */
export function TemplateDetailModal({ open, onClose, template }: { open: boolean; onClose: () => void; template: { name: string; basedOn: string; permissions: string; usageCount: string; status: string } | null }) {
  const { push } = useToast();
  if (!template) return null;
  return (
    <Modal open={open} onClose={onClose} title={`${template.name} — Template Detail`} subtitle="Template configuration and usage" icon="bi-file-earmark-richtext" tone="blue">
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <Badge tone={template.status === "Active" ? "green" : "amber"}>{template.status}</Badge>
          <h6 className="mt-2">{template.name}</h6>
          <p className="small text-muted mb-0">Based on: {template.basedOn}</p>
        </div>
        <div className="pm-card pm-card-pad mb-3">
          <h6>Permission set</h6>
          {template.permissions.split(", ").map(p => (
            <div key={p} className="d-flex align-items-center gap-2 py-1 border-bottom small"><i className="bi bi-check-circle-fill text-success" /><span>{p}</span></div>
          ))}
        </div>
        <div className="pm-card pm-card-pad">
          <div className="pm-kv"><span className="k">Times used</span><span className="v">{template.usageCount}</span></div>
          <div className="pm-kv"><span className="k">Created</span><span className="v">Jan 2024</span></div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Role created from template" }); onClose(); }}>Use template</button>
      </div>
    </Modal>
  );
}
