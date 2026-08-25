import { useState } from "react";
import { Badge, Modal, Drawer, Steps, useToast } from "../../../components/ui";

/* ============================ 1. Role Detail Drawer ============================ */
export function RoleDetailDrawer({ role, onClose }: { role: string | null; onClose: () => void }) {
  if (!role) return null;
  return (
    <Drawer open onClose={onClose} title={`${role} — Role Profile`} subtitle="Permissions, assignments and access history" icon="bi-diagram-3" wide>
      <div className="pm-card pm-card-pad mb-3">
        <div className="d-flex justify-content-between"><div><h5>{role}</h5><Badge tone="blue" dot>Tier 6 · Custom</Badge></div></div>
        <div className="row g-3 mt-2">{[["Admins", "1 assigned"], ["Grants", "18 / 80"], ["Last modified", "Aug 22"], ["Approval", "Required"]].map(x => <div className="col-3" key={x[0]}><div className="pm-eyebrow">{x[0]}</div><b>{x[1]}</b></div>)}</div>
      </div>
      <div className="pm-card pm-card-pad mb-3"><h6>Permission grants</h6>
        {[["View users", true], ["Edit user profile", true], ["View transactions", true], ["Export data", true], ["Freeze account", false], ["Impersonate user", false]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span>{x[0]}</span><i className={`bi ${x[1] ? "bi-check-circle-fill text-success" : "bi-dash-circle text-muted"}`} /></div>)}
      </div>
      <div className="pm-card pm-card-pad"><h6>Recent changes</h6>
        {[["Aug 22", "Export user data granted", "Joseph M."], ["Aug 15", "Impersonate user revoked", "Joseph M."], ["Aug 1", "View risk scores granted", "Joseph M."]].map(c => <div className="d-flex justify-content-between py-1 border-bottom small" key={c[0]}><div><b>{c[1]}</b><div className="pm-td-sub">{c[2]}</div></div><span className="text-muted">{c[0]}</span></div>)}
      </div>
    </Drawer>
  );
}

/* ============================ 2. Permission Change Diff Modal ============================ */
export function PermChangeDiffModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Permission Change Diff" subtitle="Before and after comparison for the proposed change" icon="bi-key" tone="amber" size="lg">
      <div className="pm-modal-body">
        <div className="row g-2 mb-3"><div className="col"><Badge tone="blue">Admin: Peter Njoroge</Badge></div><div className="col"><Badge tone="amber">Role: Minor Admin</Badge></div></div>
        <h6>Changes</h6>
        {[["Export user data", "granted", "green", "bi-plus-circle-fill"], ["Impersonate user", "revoked", "red", "bi-dash-circle-fill"]].map(c => <div className="d-flex align-items-center gap-2 py-1 border-bottom small" key={c[0]}><i className={`bi ${c[3]} text-${c[2]}`} /><span>{c[0]}</span><Badge tone={c[2] as any} className="ms-auto">{c[1]}</Badge></div>)}
        <div className="mt-3"><label className="form-label">Change reason</label><textarea className="form-control" rows={2} defaultValue="Security review — impersonate access too privileged for Minor Admin." /></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Change staged for approval" }); onClose(); }}>Approve with 2FA</button></div>
    </Modal>
  );
}

/* ============================ 3. Access Policy Drawer ============================ */
export function AccessPolicyDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Drawer open onClose={onClose} title="Access Control Policy" subtitle="Platform-wide RBAC and least-privilege guardrails" icon="bi-shield-lock" wide>
      <div className="pm-card pm-card-pad mb-3"><Badge tone="green" dot>Policy active</Badge>
        <h6 className="mt-3">Core principles</h6>
        {["Least-privilege by default", "Dual approval for destructive actions", "48-hour maximum for pending changes", "Annual access review mandatory", "Separation of duties enforced"].map(p => <div className="d-flex gap-2 align-items-center py-1 border-bottom small" key={p}><i className="bi bi-check-circle-fill text-success" /><span>{p}</span></div>)}
      </div>
      <div className="pm-card pm-card-pad mb-3"><h6>Approval matrix</h6>
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Action</th><th>Approval</th><th>2FA</th><th>SLA</th></tr></thead><tbody>{[["Grant Tier 0–2", "Super Admin + 2FA", "Required", "24h"], ["Grant Tier 3–5", "Dual Super Admin", "Required", "24h"], ["Grant Tier 6–9", "Super Admin", "Required", "48h"], ["Revoke any", "Super Admin", "Required", "Immediate"], ["Custom role create", "Super Admin + 2FA", "Required", "48h"]].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 0 ? "pm-td-strong" : ""}>{c}</td>)}</tr>)}</tbody></table></div>
      </div>
      <div className="pm-card pm-card-pad"><h6>Policy version</h6>
        {[["Version", "3.2"], ["Effective", "Aug 1, 2026"], ["Owner", "Joseph Mwangi"], ["Review cadence", "Quarterly"], ["Next review", "Nov 1, 2026"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b>{x[1]}</b></div>)}
      </div>
    </Drawer>
  );
}

/* ============================ 4. Role History Modal ============================ */
export function RoleHistoryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Permission Change History" subtitle="Immutable record of all role and permission changes" icon="bi-clock-history" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Date</th><th>Admin</th><th>Role</th><th>Permission</th><th>Change</th><th>Reason</th></tr></thead><tbody>
          {[["Aug 22", "Joseph M.", "Minor Admin", "Impersonate user", "Revoked", "Security review"], ["Aug 15", "Joseph M.", "Minor Admin", "Export user data", "Granted", "Business need"], ["Aug 1", "Joseph M.", "Support Agent", "View risk scores", "Granted", "Better fraud awareness"], ["Jul 15", "Joseph M.", "Analyst", "View P&L", "Revoked", "Least privilege"], ["Jul 1", "Sarah K.", "Platform Admin", "All permissions", "Created", "Initial setup"]].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 1 || i === 2 ? "pm-td-strong" : ""}>{i === 4 ? <Badge tone={c === "Granted" ? "green" : "red"} dot>{c}</Badge> : c}</td>)}</tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={onClose}>Export history</button></div>
    </Modal>
  );
}

/* ============================ 5. Permission Matrix Export Modal ============================ */
export function PermMatrixExportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Export Permission Matrix" subtitle="Generate a signed permission matrix for compliance review" icon="bi-grid-3x3-gap" tone="blue">
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
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Matrix exported" }); onClose(); }}>Generate export</button></div>
    </Modal>
  );
}

/* ============================ 6. Duplicate Role Modal ============================ */
export function DuplicateRoleModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Duplicate Role" subtitle="Create a copy with all current permissions as starting point" icon="bi-copy" tone="blue">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Source role</label><input className="form-control" value="Minor Admin (Custom)" readOnly /></div>
          <div className="col-md-6"><label className="form-label">New role name</label><input className="form-control" placeholder="e.g. Regional Admin" /></div>
          <div className="col-md-6"><label className="form-label">Tier level</label><select className="form-select"><option>Tier 6</option><option>Tier 7</option><option>Tier 8</option></select></div>
          <div className="col-md-6"><label className="form-label">Copy from</label><select className="form-select"><option>Copy all grants</option><option>Copy grants only</option><option>Copy tier only</option></select></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Role duplicated" }); onClose(); }}>Create draft</button></div>
    </Modal>
  );
}

/* ============================ 7. Retire Role Modal ============================ */
export function RetireRoleModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Retire Role" subtitle="Revoke all grants and archive the role" icon="bi-trash" tone="red">
      <div className="pm-modal-body">
        <div className="alert alert-warning small"><i className="bi bi-exclamation-triangle me-1" />This role cannot be deleted while 1 administrator is assigned. Reassignment is required first.</div>
        <div className="row g-3">
          <div className="col-12"><label className="form-label">Reassign administrators to</label><select className="form-select"><option>Analyst (Tier 7)</option><option>Support Agent (Tier 8)</option><option>Read-Only Viewer (Tier 9)</option></select></div>
          <div className="col-12"><label className="form-label">Reason for retirement</label><textarea className="form-control" rows={2} defaultValue="Role no longer needed — permissions consolidated into standard roles." /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-danger" onClick={() => { push({ kind: "success", title: "Role retirement submitted" }); onClose(); }}>Submit for approval</button></div>
    </Modal>
  );
}

/* ============================ 8. Revoke All Grants Modal ============================ */
export function RevokeAllGrantsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Revoke All Permission Grants" subtitle="Clear all staged grants for the current role" icon="bi-key" tone="amber">
      <div className="pm-modal-body">
        <p className="small text-muted">This will revoke 18 permission grants. All changes require Super Admin approval.</p>
        <div className="pm-card pm-card-pad">
          <h6>Grants to be revoked</h6>
          {["View users", "View user detail", "View transactions", "Export data", "View fraud dashboard", "View partners", "View analytics", "Manage notifications"].map(p => <div className="d-flex align-items-center gap-2 py-1 border-bottom small" key={p}><i className="bi bi-dash-circle text-danger" /><span>{p}</span></div>)}
          <div className="small text-muted mt-2">+ 10 more grants</div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-danger" onClick={() => { push({ kind: "success", title: "Grants staged for revocation" }); onClose(); }}>Revoke all</button></div>
    </Modal>
  );
}

/* ============================ 9. Assign Admins Modal ============================ */
export function AssignAdminsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Assign Administrators to Role" subtitle="Add or remove admin assignments with approval" icon="bi-person-plus" tone="blue">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-12"><label className="form-label">Currently assigned</label>
            {["Peter Njoroge — Minor Admin"].map(a => <div className="d-flex justify-content-between align-items-center py-2 border-bottom small" key={a}><span>{a}</span><button className="btn btn-sm btn-outline-danger"><i className="bi bi-x" /></button></div>)}
          </div>
          <div className="col-12"><label className="form-label">Add administrator</label>
            <select className="form-select"><option>Select administrator...</option><option>Samuel Kariuki — Support Agent</option><option>Jane Wambui — Analyst</option><option>David Kimani — Compliance Officer</option></select>
          </div>
          <div className="col-12"><label className="form-label">Effective date</label><input className="form-control" type="date" /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Assignment submitted" }); onClose(); }}>Submit for approval</button></div>
    </Modal>
  );
}

/* ============================ 10. Custom Role Wizard ============================ */
export function CustomRoleWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  if (!open) return null;
  return (
    <Modal open onClose={() => { setStep(0); onClose(); }} title="Custom Role Configuration" subtitle="Define identity, permissions and approval requirements" icon="bi-diagram-3" tone="green" size="lg">
      <Steps current={step} steps={[{ label: "Identity", icon: "bi-person-badge" }, { label: "Base role", icon: "bi-copy" }, { label: "Permissions", icon: "bi-key" }, { label: "Review", icon: "bi-check2" }]} />
      <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 25}%` }} /></div>
      <div className="pm-modal-body">
        {step === 0 && <div className="row g-3"><div className="col-md-6"><label className="form-label">Role name</label><input className="form-control" placeholder="e.g. Regional Admin" /></div><div className="col-md-6"><label className="form-label">Tier</label><select className="form-select"><option>Tier 6</option><option>Tier 7</option></select></div><div className="col-12"><label className="form-label">Description</label><textarea className="form-control" rows={2} placeholder="Describe the role's purpose and scope" /></div></div>}
        {step === 1 && <div className="row g-3"><div className="col-12"><label className="form-label">Copy permissions from existing role</label><select className="form-select"><option>None (start from scratch)</option><option>Operations Manager (Tier 2)</option><option>Minor Admin (Tier 6)</option><option>Analyst (Tier 7)</option></select></div></div>}
        {step === 2 && <div><h6>Toggle permissions</h6><p className="small text-muted">Click to grant or revoke individual permissions.</p>{[["View user list", true], ["Edit user profile", false], ["View transactions", true], ["Freeze account", false], ["Export data", false], ["View fraud dashboard", true]].map(p => <div className="d-flex justify-content-between py-1 border-bottom" key={p[0]}><span className="small">{p[0]}</span><button className={`btn btn-sm ${p[1] ? "btn-outline-success" : "btn-outline-secondary"}`}><i className={`bi ${p[1] ? "bi-check-lg" : "bi-dash"}`} /></button></div>)}</div>}
        {step === 3 && <div className="text-center py-3"><Badge tone="green" dot>Ready for approval</Badge><h6 className="mt-3">Custom role summary</h6><p className="small text-muted">This role will be saved as a reusable template and require Super Admin approval.</p></div>}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={() => step ? setStep(step - 1) : onClose()}>{step ? "Back" : "Cancel"}</button>{step < 3 ? <button className="btn btn-primary" onClick={() => setStep(step + 1)}>Continue</button> : <button className="btn btn-primary" onClick={() => { setStep(0); push({ kind: "success", title: "Role submitted" }); onClose(); }}>Submit for approval</button>}</div>
    </Modal>
  );
}

/* ============================ 11. Audit Trail Modal ============================ */
export function PermAuditTrailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Permissions Audit Trail" subtitle="Immutable log of all permission operations" icon="bi-clock-history" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Timestamp</th><th>Admin</th><th>Operation</th><th>Target</th><th>Result</th></tr></thead><tbody>
          {[["14:32:01", "Joseph M.", "Grant permission", "Peter N. → Export data", "Success"], ["14:15:23", "Joseph M.", "Revoke permission", "Peter N. → Impersonate", "Success"], ["13:45:12", "Sarah K.", "Create role", "Regional Admin", "Pending"], ["12:30:00", "Joseph M.", "Assign role", "Samuel K. → Support Agent", "Success"], ["11:48:22", "Joseph M.", "Revoke role", "Analyst → Peter N.", "Success"]].map(r => <tr key={r[0]}><td className="mono">{r[0]}</td><td className="pm-td-strong">{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td><Badge tone="green" dot>{r[4]}</Badge></td></tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={onClose}>Export</button></div>
    </Modal>
  );
}

/* ============================ 12. Permission Catalogue Drawer ============================ */
export function PermCatalogueDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Drawer open onClose={onClose} title="Permission Catalogue" subtitle="Full permission tree by domain" icon="bi-list-nested" wide>
      <div className="pm-card pm-card-pad mb-3"><h6>USERS</h6>
        {["View user list", "View user detail", "Edit user profile", "Freeze account", "Unfreeze account", "Close account", "Impersonate user", "Delete user"].map(p => <div className="d-flex align-items-center gap-2 py-1 border-bottom small" key={p}><i className="bi bi-circle" /><span>{p}</span></div>)}
      </div>
      <div className="pm-card pm-card-pad mb-3"><h6>TRANSACTIONS</h6>
        {["View all transactions", "Reverse transaction", "Approve high-value", "Set fee schedule", "Override fee", "Set withdrawal limits"].map(p => <div className="d-flex align-items-center gap-2 py-1 border-bottom small" key={p}><i className="bi bi-circle" /><span>{p}</span></div>)}
      </div>
      <div className="pm-card pm-card-pad mb-3"><h6>FRAUD & RISK</h6>
        {["View fraud dashboard", "Block transaction", "Flag user", "Blacklist user", "Review alerts", "Configure rules"].map(p => <div className="d-flex align-items-center gap-2 py-1 border-bottom small" key={p}><i className="bi bi-circle" /><span>{p}</span></div>)}
      </div>
    </Drawer>
  );
}

/* ============================ 13. Annual Access Review Modal ============================ */
export function AccessReviewModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Annual Access Review" subtitle="Quarterly access review for privileged accounts" icon="bi-calendar-check" tone="violet" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["18", "Accounts to review", "blue"], ["3", "Overdue reviews", "red"], ["12", "Completed", "green"], ["3", "Pending", "amber"]].map(x => <div className="col-md-3" key={x[1]}><div className="pm-card pm-card-pad text-center"><div className="h4 mb-0">{x[0]}</div><div className="small text-muted">{x[1]}</div></div></div>)}</div>
        <h6>Overdue reviews</h6>
        {[["Peter Njoroge", "Minor Admin", "90 days overdue", "red"], ["Jane Wambui", "Analyst", "30 days overdue", "amber"], ["Samuel Kariuki", "Support Agent", "15 days overdue", "amber"]].map(a => <div className="d-flex justify-content-between align-items-center py-2 border-bottom small" key={a[0]}><div><b>{a[0]}</b> — <span className="text-muted">{a[1]}</span></div><Badge tone={a[3] as any}>{a[2]}</Badge></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Review reminders sent" }); onClose(); }}>Send reminders</button></div>
    </Modal>
  );
}

/* ============================ 14. Role Comparison Modal ============================ */
export function RoleComparisonModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Role Comparison" subtitle="Side-by-side permission comparison" icon="bi-arrows-angle-contract" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-2 mb-3"><div className="col"><label className="form-label">Role A</label><select className="form-select"><option>Minor Admin (Tier 6)</option><option>Operations Manager (Tier 2)</option></select></div><div className="col"><label className="form-label">Role B</label><select className="form-select"><option>Analyst (Tier 7)</option><option>Support Agent (Tier 8)</option></select></div></div>
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Permission</th><th>Minor Admin</th><th>Analyst</th><th>Diff</th></tr></thead><tbody>
          {[["View users", true, true, "Same"], ["Edit user profile", true, false, "Different"], ["View transactions", true, true, "Same"], ["Export data", true, false, "Different"], ["Freeze account", false, false, "Same"], ["View P&L", false, true, "Different"]].map(p => <tr key={p[0]}><td className="pm-td-strong">{p[0]}</td><td><i className={`bi ${p[1] ? "bi-check-circle-fill text-success" : "bi-dash-circle text-muted"}`} /></td><td><i className={`bi ${p[2] ? "bi-check-circle-fill text-success" : "bi-dash-circle text-muted"}`} /></td><td><Badge tone={p[3] === "Same" ? "grey" : "blue"}>{p[3]}</Badge></td></tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 15. Permission Impact Analysis Modal ============================ */
export function PermImpactModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Permission Impact Analysis" subtitle="Before granting a new permission, review its downstream effects" icon="bi-graph-up" tone="amber" size="lg">
      <div className="pm-modal-body">
        <div className="row g-2 mb-3"><div className="col"><Badge tone="blue">Permission: Export user data</Badge></div><div className="col"><Badge tone="amber">Target: Peter Njoroge (Minor Admin)</Badge></div></div>
        <h6>Impact assessment</h6>
        { [["Affected users", "1 administrator gains export access"], ["Risk level", "Medium — PII export capability"], ["Compliance", "Requires audit evidence and reason"], ["Data scope", "User profiles, KYC documents, transaction history"], ["Retention", "Export logged with SHA-256 hash"], ["Approval", "Super Admin + 2FA required"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b>{x[1]}</b></div>)}
        <div className="mt-3"><label className="form-label">Business justification</label><textarea className="form-control" rows={2} defaultValue="Need to export user data for quarterly compliance review." /></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Grant submitted for approval" }); onClose(); }}>Submit for approval</button></div>
    </Modal>
  );
}
