import { useCallback, useMemo, useState } from "react";
import { Badge, Drawer, Modal, Steps, useToast } from "../../../components/ui";
import { AddRecordModal, EditRecordModal, DeleteRecordWizard, LockUnlockModal } from "../../../components/AdminControls";
import {
  type RoleRecord, type PermChangeRecord, type AuditRecord, type PolicyRecord, type TemplateRecord,
  initialRoles, initialChanges, initialAudits, initialPolicies, initialTemplates, categories
} from "../data/permData";

type A = { title: string; body: React.ReactNode; icon?: string; tone?: "green" | "red" | "amber" | "blue" | "violet" | "ink" };

export function PermissionsRoles({ signal: _signal }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  const { push } = useToast();
  const [tab, setTab] = useState("roles");
  const [q, setQ] = useState("");
  const [action, setAction] = useState<A | null>(null);
  const [drawer, setDrawer] = useState<string | null>(null);
  const [wizard, setWizard] = useState(false);
  const [step, setStep] = useState(0);

  // Multi-step wizards
  const [bulkAssign, setBulkAssign] = useState(false);
  const [bulkStep, setBulkStep] = useState(0);
  const [retireWizard, setRetireWizard] = useState<RoleRecord | null>(null);
  const [retireStep, setRetireStep] = useState(0);
  const [reviewWizard, setReviewWizard] = useState(false);
  const [reviewStep, setReviewStep] = useState(0);
  const [cloneWizard, setCloneWizard] = useState<RoleRecord | null>(null);
  const [cloneStep, setCloneStep] = useState(0);

  // Data state
  const [roles, setRoles] = useState<RoleRecord[]>(initialRoles);
  const [changes, setChanges] = useState<PermChangeRecord[]>(initialChanges);
  const [audits, setAudits] = useState<AuditRecord[]>(initialAudits);
  const [policies, setPolicies] = useState<PolicyRecord[]>(initialPolicies);
  const [templates, setTemplates] = useState<TemplateRecord[]>(initialTemplates);
  const [granted, setGranted] = useState<Record<string, boolean>>({ "View user list": true, "View user detail": true, "View all transactions": true, "View fraud dashboard": true, "View partners": true, "View analytics": true });

  // CRUD modals — Roles
  const [editRole, setEditRole] = useState<RoleRecord | null>(null);
  const [deleteRole, setDeleteRole] = useState<RoleRecord | null>(null);
  const [lockRole, setLockRole] = useState<RoleRecord | null>(null);
  const [addRole, setAddRole] = useState(false);

  // CRUD modals — Changes
  const [editChange, setEditChange] = useState<PermChangeRecord | null>(null);
  const [deleteChange, setDeleteChange] = useState<PermChangeRecord | null>(null);

  // CRUD modals — Audits
  const [editAudit, setEditAudit] = useState<AuditRecord | null>(null);
  const [deleteAudit, setDeleteAudit] = useState<AuditRecord | null>(null);

  // CRUD modals — Policies
  const [editPolicy, setEditPolicy] = useState<PolicyRecord | null>(null);
  const [deletePolicy, setDeletePolicy] = useState<PolicyRecord | null>(null);
  const [lockPolicy, setLockPolicy] = useState<PolicyRecord | null>(null);
  const [addPolicy, setAddPolicy] = useState(false);

  // CRUD modals — Templates
  const [editTemplate, setEditTemplate] = useState<TemplateRecord | null>(null);
  const [deleteTemplate, setDeleteTemplate] = useState<TemplateRecord | null>(null);
  const [lockTemplate, setLockTemplate] = useState<TemplateRecord | null>(null);
  const [addTemplate, setAddTemplate] = useState(false);

  const filtered = useMemo(() => roles.filter(r => [r.name, r.tier, r.status, r.description].join(" ").toLowerCase().includes(q.toLowerCase())), [q, roles]);
  const customCount = roles.filter(r => r.status === "Custom").length;
  const grantedCount = Object.values(granted).filter(Boolean).length;

  // CRUD handlers — Roles
  const handleAddRole = useCallback((form: Record<string, string>) => {
    setRoles(p => [...p, { id: `r-${Date.now()}`, name: form.name || "New Role", tier: form.tier || "Tier 6", created: new Date().toLocaleDateString(), admins: "0", lastModified: new Date().toLocaleDateString(), deletionPolicy: "Can delete", status: "Custom", description: form.description || "—" }]);
    push({ kind: "success", title: "Role created", body: "The new role is pending Super Admin approval." });
  }, [push]);
  const handleEditRole = useCallback((form: Record<string, string>) => { if (!editRole) return; setRoles(p => p.map(r => r.id === editRole.id ? { ...r, ...form } : r)); }, [editRole]);
  const handleDeleteRole = useCallback(() => { if (!deleteRole) return; setRoles(p => p.filter(r => r.id !== deleteRole.id)); }, [deleteRole]);
  const handleLockRole = useCallback((locked: boolean) => { if (!lockRole) return; setRoles(p => p.map(r => r.id === lockRole.id ? { ...r, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Admin lock" : undefined } : r)); }, [lockRole]);

  // CRUD handlers — Changes
  const handleEditChange = useCallback((form: Record<string, string>) => { if (!editChange) return; setChanges(p => p.map(c => c.id === editChange.id ? { ...c, ...form } : c)); }, [editChange]);
  const handleDeleteChange = useCallback(() => { if (!deleteChange) return; setChanges(p => p.filter(c => c.id !== deleteChange.id)); }, [deleteChange]);

  // CRUD handlers — Audits
  const handleEditAudit = useCallback((form: Record<string, string>) => { if (!editAudit) return; setAudits(p => p.map(a => a.id === editAudit.id ? { ...a, ...form } : a)); }, [editAudit]);
  const handleDeleteAudit = useCallback(() => { if (!deleteAudit) return; setAudits(p => p.filter(a => a.id !== deleteAudit.id)); }, [deleteAudit]);

  // CRUD handlers — Policies
  const handleAddPolicy = useCallback((form: Record<string, string>) => { setPolicies(p => [...p, { id: `pol-${Date.now()}`, name: form.name || "New Policy", rule: form.rule || "—", scope: form.scope || "All", status: "Active" }]); }, []);
  const handleEditPolicy = useCallback((form: Record<string, string>) => { if (!editPolicy) return; setPolicies(p => p.map(po => po.id === editPolicy.id ? { ...po, ...form } : po)); }, [editPolicy]);
  const handleDeletePolicy = useCallback(() => { if (!deletePolicy) return; setPolicies(p => p.filter(po => po.id !== deletePolicy.id)); }, [deletePolicy]);
  const handleLockPolicy = useCallback((locked: boolean) => { if (!lockPolicy) return; setPolicies(p => p.map(po => po.id === lockPolicy.id ? { ...po, locked, lockedBy: locked ? "Super Admin" : undefined } : po)); }, [lockPolicy]);

  // CRUD handlers — Templates
  const handleAddTemplate = useCallback((form: Record<string, string>) => { setTemplates(p => [...p, { id: `t-${Date.now()}`, name: form.name || "New Template", basedOn: form.basedOn || "—", permissions: form.permissions || "—", usageCount: "0", created: new Date().toLocaleDateString(), status: "Draft" }]); }, []);
  const handleEditTemplate = useCallback((form: Record<string, string>) => { if (!editTemplate) return; setTemplates(p => p.map(t => t.id === editTemplate.id ? { ...t, ...form } : t)); }, [editTemplate]);
  const handleDeleteTemplate = useCallback(() => { if (!deleteTemplate) return; setTemplates(p => p.filter(t => t.id !== deleteTemplate.id)); }, [deleteTemplate]);
  const handleLockTemplate = useCallback((locked: boolean) => { if (!lockTemplate) return; setTemplates(p => p.map(t => t.id === lockTemplate.id ? { ...t, locked, lockedBy: locked ? "Super Admin" : undefined } : t)); }, [lockTemplate]);

  // Multi-step: Retire role
  const handleRetireComplete = useCallback(() => {
    if (!retireWizard) return;
    setRoles(p => p.filter(r => r.id !== retireWizard.id));
    setRetireWizard(null); setRetireStep(0);
    push({ kind: "success", title: "Role retired", body: `${retireWizard.name} has been retired.` });
  }, [retireWizard, push]);

  // Multi-step: Clone role
  const handleCloneComplete = useCallback(() => {
    if (!cloneWizard) return;
    const cloned: RoleRecord = { ...cloneWizard, id: `r-${Date.now()}`, name: `${cloneWizard.name} (Copy)`, status: "Custom", deletionPolicy: "Can delete", created: new Date().toLocaleDateString(), lastModified: new Date().toLocaleDateString(), admins: "0" };
    setRoles(p => [...p, cloned]);
    setCloneWizard(null); setCloneStep(0);
    push({ kind: "success", title: "Role cloned", body: `${cloned.name} created as a custom role.` });
  }, [cloneWizard, push]);

  // Multi-step: Access review
  const handleReviewComplete = useCallback(() => {
    setReviewWizard(false); setReviewStep(0);
    push({ kind: "success", title: "Access review completed", body: "All role assignments have been reviewed and confirmed." });
  }, [push]);

  const roleFields = [{ label: "name", placeholder: "Role name", required: true }, { label: "tier", placeholder: "Tier level" }, { label: "description", placeholder: "Role description" }];
  const policyFields = [{ label: "name", placeholder: "Policy name", required: true }, { label: "rule", placeholder: "Policy rule", required: true }, { label: "scope", placeholder: "All / Tier 0–2 / Finance roles" }];
  const templateFields = [{ label: "name", placeholder: "Template name", required: true }, { label: "basedOn", placeholder: "Base role" }, { label: "permissions", placeholder: "Permission set" }];

  return (
    <div className="pm-page-content roles-page">
      {/* Header */}
      <div className="pm-section-head" style={{ marginTop: 0 }}>
        <div>
          <div className="pm-eyebrow">PLATFORM ADMINISTRATION / PAGE 30</div>
          <h2 className="mb-1">Permissions & Roles</h2>
          <p>Configure role hierarchy, permission sets and least-privilege access policies for every administrator.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setDrawer("policy")}><i className="bi bi-shield-lock me-1" />Access policy</button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => { setBulkStep(0); setBulkAssign(true); }}><i className="bi bi-people me-1" />Bulk assign</button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => { setReviewStep(0); setReviewWizard(true); }}><i className="bi bi-clipboard-check me-1" />Access review</button>
          <button className="btn btn-primary btn-sm" onClick={() => { setStep(0); setWizard(true); }}><i className="bi bi-plus-lg me-1" />Create role</button>
        </div>
      </div>

      {/* Hero */}
      <div className="pm-hero roles-hero mb-3">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <div className="pm-eyebrow text-white-50">ACCESS CONTROL · DUAL APPROVAL</div>
            <div className="pm-hero-value">{roles.length} <span className="fs-6 fw-normal text-white-50">role tiers</span></div>
            <div className="small text-white-50 mt-2">{customCount} custom · {grantedCount} grants active · all role changes require 2FA and audit evidence</div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <div className="pm-hero-chip"><div className="l">Permission nodes</div><div className="v">80+</div></div>
            <div className="pm-hero-chip"><div className="l">Custom roles</div><div className="v">{customCount}</div></div>
            <div className="pm-hero-chip"><div className="l">Pending changes</div><div className="v text-warning">{changes.filter(c => c.change === "Granted").length}</div></div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-3">
        {[
          ["Role tiers", String(roles.length), `${customCount} custom`, "bi-diagram-3", "green"],
          ["Permission nodes", "80+", "Across 9 categories", "bi-key", "blue"],
          ["Changes this month", String(changes.length), "All audited", "bi-clock-history", "violet"],
          ["Policies active", String(policies.length), "RBAC guardrails", "bi-shield-check", "amber"]
        ].map(x => <div className="col-6 col-xl-3" key={x[0]}><div className="pm-stat"><div className={`pm-stat-ico bg-${x[4]}-soft text-${x[4]}`}><i className={`bi ${x[3]}`} /></div><div className="pm-stat-label">{x[0]}</div><div className="pm-stat-value">{x[1]}</div><div className="pm-stat-foot">{x[2]}</div></div></div>)}
      </div>

      {/* Tabs */}
      <div className="pm-card mb-3">
        <div className="pm-tabs">
          {[
            ["roles", "Role management", "bi-diagram-3"], ["matrix", "Permission matrix", "bi-grid-3x3-gap"],
            ["tree", "Permission catalogue", "bi-list-nested"], ["changes", "Change history", "bi-clock-history"],
            ["audits", "Access audits", "bi-clipboard-check"], ["policies", "Access policies", "bi-shield-lock"],
            ["templates", "Role templates", "bi-file-earmark-richtext"]
          ].map(x => <button className={`pm-tab ${tab === x[0] ? "active" : ""}`} key={x[0]} onClick={() => setTab(x[0])}><i className={`bi ${x[2]}`} />{x[1]}</button>)}
        </div>
      </div>

      {/* === ROLES TAB === */}
      {tab === "roles" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Role management</h3><p>System roles are protected; custom roles can be edited or retired through approval.</p></div>
          <div className="d-flex gap-2 align-items-center">
            <div className="pm-search"><i className="bi bi-search" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search role or tier" /></div>
            <button className="btn btn-primary btn-sm" onClick={() => setAddRole(true)}><i className="bi bi-plus me-1" />Add role</button>
          </div>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Role</th><th>Tier</th><th>Created</th><th>Admins</th><th>Last modified</th><th>Deletion</th><th>Status</th><th className="text-end">Actions</th></tr></thead><tbody>
            {filtered.map(r => <tr key={r.id}>
              <td className="pm-td-strong">{r.name}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td>
              <td className="pm-num">{r.tier}</td>
              <td>{r.created}</td>
              <td className="pm-num">{r.admins}</td>
              <td>{r.lastModified}</td>
              <td><Badge tone={r.deletionPolicy === "Protected" ? "grey" : "green"}>{r.deletionPolicy}</Badge></td>
              <td><Badge tone={r.status === "System" ? "blue" : "amber"}>{r.status}</Badge></td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditRole(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => { setCloneStep(0); setCloneWizard(r); }} title="Clone"><i className="bi bi-copy" /></button>
                {r.deletionPolicy !== "Protected" && <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteRole(r)} title="Delete"><i className="bi bi-trash3" /></button>}
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* === MATRIX TAB === */}
      {tab === "matrix" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Permission matrix editor</h3><p>Toggle individual grants. Changes are staged until 2FA confirmation.</p></div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setGranted({})}><i className="bi bi-x-lg me-1" />Revoke all</button>
            <button className="btn btn-primary btn-sm" onClick={() => { const count = Object.values(granted).filter(Boolean).length; setAction({ title: "Save permission matrix", body: <div><p>{count} permissions will be saved. Changes require 2FA confirmation and a second Super Admin approval.</p><div className="pm-card pm-card-pad mt-3"><h6>Changes summary</h6>{Object.entries(granted).filter(([, v]) => v).slice(0, 5).map(([k]) => <div className="d-flex align-items-center gap-2 py-1 border-bottom small" key={k}><i className="bi bi-check-circle-fill text-success" /><span>{k}</span></div>)}{count > 5 && <div className="small text-muted mt-1">+{count - 5} more permissions</div>}</div></div>, tone: "amber", icon: "bi-shield-check" })}}><i className="bi bi-shield-check me-1" />Save ({grantedCount})</button>
          </div>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Permission</th><th>Super Admin</th><th>Platform Admin</th><th>Operations</th><th>Minor Admin</th><th>Support Agent</th></tr></thead><tbody>
            {Object.entries(categories).slice(0, 5).flatMap(([cat, items]) => items.slice(0, 3).map((p, i) => <tr key={p}>
              <td><span className="pm-eyebrow">{i === 0 ? cat : ""}</span><div className="pm-td-strong">{p}</div></td>
              {["Super Admin", "Platform Admin", "Operations", "Minor Admin", "Support Agent"].map(role => <td key={role}>
                <button className={`permission-cell ${role === "Super Admin" || role === "Platform Admin" || (role === "Minor Admin" && granted[p]) ? "granted" : ""}`} onClick={() => role === "Minor Admin" && setGranted(x => ({ ...x, [p]: !x[p] }))}>{role === "Super Admin" || role === "Platform Admin" || (role === "Minor Admin" && granted[p]) ? <i className="bi bi-check-lg" /> : <i className="bi bi-dash" />}</button>
              </td>)}
            </tr>))}
          </tbody></table></div>
        </div>
      </section>}

      {/* === TREE TAB === */}
      {tab === "tree" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Permission catalogue</h3><p>Full permission tree grouped by product domain and administrative capability.</p></div>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setAction({ title: "Export permission catalogue", body: <div><p>The complete permission catalogue was exported as a policy reference document.</p><div className="mt-3">{Object.entries(categories).map(([cat, items]) => <div key={cat} className="d-flex justify-content-between py-1 border-bottom small"><span className="text-muted">{cat}</span><b>{items.length} permissions</b></div>)}</div><div className="mt-2"><b>Total: {Object.values(categories).flat().length} permissions</b></div></div>, tone: "blue", icon: "bi-download" })}><i className="bi bi-download me-1" />Export</button>
        </div>
        <div className="row g-3">
          {Object.entries(categories).map(([cat, items]) => <div className="col-md-6 col-xl-4" key={cat}>
            <div className="pm-card pm-card-pad h-100">
              <div className="d-flex justify-content-between align-items-center mb-2"><h6 className="mb-0">{cat}</h6><Badge tone="blue">{items.length} nodes</Badge></div>
              {items.map((p, i) => <div className="permission-row" key={p}><i className={`bi ${i < 3 ? "bi-check-circle-fill text-success" : "bi-circle"}`} />{p}</div>)}
            </div>
          </div>)}
        </div>
      </section>}

      {/* === CHANGES TAB === */}
      {tab === "changes" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Permission change history</h3><p>Immutable record of grants, revocations, reasons and approving admin.</p></div>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setAction({ title: "Export change history", body: <div><p>The permission change history was exported with approval metadata and deployment timestamps.</p></div>, tone: "blue", icon: "bi-download" })}><i className="bi bi-download me-1" />Export</button>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Date</th><th>Admin</th><th>Role</th><th>Permission</th><th>Change</th><th>Reason</th><th className="text-end">Actions</th></tr></thead><tbody>
            {changes.map(r => <tr key={r.id}>
              <td>{r.date}</td>
              <td className="pm-td-strong">{r.admin}</td>
              <td className="pm-td-strong">{r.role}</td>
              <td>{r.permission}</td>
              <td><Badge tone={r.change === "Granted" ? "green" : "red"} dot>{r.change}</Badge></td>
              <td>{r.reason}</td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditChange(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteChange(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* === AUDITS TAB === */}
      {tab === "audits" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Access audits</h3><p>Periodic reviews of admin access, privilege creep and compliance status.</p></div>
          <button className="btn btn-primary btn-sm" onClick={() => { setReviewStep(0); setReviewWizard(true); }}><i className="bi bi-clipboard-check me-1" />Start audit</button>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Date</th><th>Reviewer</th><th>Scope</th><th>Findings</th><th>Status</th><th className="text-end">Actions</th></tr></thead><tbody>
            {audits.map(r => <tr key={r.id}>
              <td>{r.date}</td>
              <td className="pm-td-strong">{r.reviewer}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td>
              <td>{r.scope}</td>
              <td>{r.findings}</td>
              <td><Badge tone={r.status === "Passed" ? "green" : r.status === "Remediated" ? "blue" : "amber"} dot>{r.status}</Badge></td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditAudit(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteAudit(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* === POLICIES TAB === */}
      {tab === "policies" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Access policies</h3><p>RBAC guardrails, approval matrices and least-privilege rules.</p></div>
          <button className="btn btn-primary btn-sm" onClick={() => setAddPolicy(true)}><i className="bi bi-plus me-1" />Add policy</button>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Policy</th><th>Rule</th><th>Scope</th><th>Status</th><th className="text-end">Actions</th></tr></thead><tbody>
            {policies.map(r => <tr key={r.id}>
              <td className="pm-td-strong">{r.name}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td>
              <td>{r.rule}</td>
              <td>{r.scope}</td>
              <td><Badge tone="green" dot>{r.status}</Badge></td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditPolicy(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setLockPolicy(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeletePolicy(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* === TEMPLATES TAB === */}
      {tab === "templates" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Role templates</h3><p>Reusable role configurations for quick onboarding and standardization.</p></div>
          <button className="btn btn-primary btn-sm" onClick={() => setAddTemplate(true)}><i className="bi bi-plus me-1" />Add template</button>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Template</th><th>Based on</th><th>Permissions</th><th>Usage</th><th>Created</th><th>Status</th><th className="text-end">Actions</th></tr></thead><tbody>
            {templates.map(r => <tr key={r.id}>
              <td className="pm-td-strong">{r.name}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td>
              <td>{r.basedOn}</td>
              <td>{r.permissions}</td>
              <td className="pm-num">{r.usageCount}</td>
              <td>{r.created}</td>
              <td><Badge tone={r.status === "Active" ? "green" : "amber"}>{r.status}</Badge></td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditTemplate(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setLockTemplate(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteTemplate(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* ====== GENERIC ACTION MODAL ====== */}
      <Modal open={!!action} onClose={() => setAction(null)} title={action?.title ?? "Role action"} subtitle="Super Admin action · permission changes are immutable" icon={action?.icon} tone={action?.tone}>
        <div className="pm-modal-body">{action?.body}</div>
        <div className="pm-modal-foot">
          <button className="btn btn-outline-secondary" onClick={() => setAction(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { setAction(null); push({ kind: "success", title: "Action completed", body: "The change was recorded in the audit trail." }); }}>Confirm</button>
        </div>
      </Modal>

      {/* ====== CREATE ROLE WIZARD (4-step) ====== */}
      <Modal open={wizard} onClose={() => setWizard(false)} title="Create custom role" subtitle={`Step ${step + 1} of 4`} icon="bi-plus-circle" tone="green" size="lg">
        <Steps current={step} steps={[{ label: "Identity", icon: "bi-person-badge" }, { label: "Base role", icon: "bi-copy" }, { label: "Permissions", icon: "bi-key" }, { label: "Review", icon: "bi-check2" }]} />
        <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 25}%` }} /></div>
        <div className="pm-modal-body">
          {step === 0 && <div className="row g-3"><div className="col-md-6"><label className="form-label">Role name</label><input className="form-control" id="cr-name" placeholder="Custom Operations Admin" /></div><div className="col-md-6"><label className="form-label">Description</label><input className="form-control" id="cr-desc" placeholder="Limited operations access" /></div></div>}
          {step === 1 && <div className="row g-3"><div className="col-md-6"><label className="form-label">Base role</label><select className="form-select" id="cr-base"><option>Operations Manager</option><option>Support Lead</option><option>Analyst</option><option>Support Agent</option></select></div><div className="col-md-6"><label className="form-label">Tier level</label><select className="form-select" id="cr-tier"><option>Tier 6</option><option>Tier 7</option><option>Tier 8</option></select></div></div>}
          {step === 2 && <div><p className="small text-muted mb-3">Select permissions for this role from the categories below.</p>{Object.entries(categories).slice(0, 3).map(([cat, items]) => <div key={cat} className="mb-3"><div className="pm-eyebrow mb-1">{cat}</div>{items.slice(0, 4).map(p => <label key={p} className="d-flex align-items-center gap-2 mb-1" style={{ fontSize: ".85rem" }}><input type="checkbox" className="form-check-input" defaultChecked={p.startsWith("View")} />{p}</label>)}</div>)}</div>}
          {step === 3 && <div className="pm-card pm-card-pad"><Badge tone="green" dot>Ready for approval</Badge><h6 className="mt-3">New custom role</h6><p className="small text-muted">This role will be saved as a reusable template and require Super Admin approval before assignment.</p><div className="d-flex gap-2"><Badge tone="blue">Tier 6</Badge><Badge tone="amber">2FA required</Badge></div></div>}
        </div>
        <div className="pm-modal-foot">
          <button className="btn btn-outline-secondary" onClick={() => step ? setStep(step - 1) : setWizard(false)}>{step ? "Back" : "Cancel"}</button>
          {step < 3 ? <button className="btn btn-primary" onClick={() => setStep(step + 1)}>Continue</button> : <button className="btn btn-primary" onClick={() => { const nm = (document.getElementById("cr-name") as HTMLInputElement)?.value || "Custom Role"; const desc = (document.getElementById("cr-desc") as HTMLInputElement)?.value || ""; handleAddRole({ name: nm, description: desc }); setWizard(false); setStep(0); }}>Submit for approval</button>}
        </div>
      </Modal>

      {/* ====== BULK ASSIGN WIZARD (4-step) ====== */}
      <Modal open={bulkAssign} onClose={() => { setBulkAssign(false); setBulkStep(0); }} title="Bulk permission assignment" subtitle={`Step ${bulkStep + 1} of 4`} icon="bi-people" tone="blue" size="lg">
        <Steps current={bulkStep} steps={[{ label: "Select admins", icon: "bi-people" }, { label: "Select role", icon: "bi-diagram-3" }, { label: "Confirm", icon: "bi-shield-lock" }, { label: "Execute", icon: "bi-check2" }]} />
        <div className="pm-wizard-progress"><span style={{ width: `${(bulkStep + 1) * 25}%` }} /></div>
        <div className="pm-modal-body">
          {bulkStep === 0 && <div><p className="small text-muted mb-3">Select administrators to assign a new role to.</p>{["Peter Njoroge · Minor Admin", "Jane Wambui · Analyst", "Samuel Kariuki · Support Agent", "Amina Hassan · Risk Analyst"].map(a => <label key={a} className="d-flex align-items-center gap-2 mb-2"><input type="checkbox" className="form-check-input" defaultChecked={a.includes("Peter")} /><span className="small">{a}</span></label>)}</div>}
          {bulkStep === 1 && <div className="row g-3"><div className="col-md-6"><label className="form-label">Target role</label><select className="form-select"><option>Support Agent</option><option>Analyst</option><option>Minor Admin</option><option>Read-Only Viewer</option></select></div><div className="col-md-6"><label className="form-label">Effective date</label><input className="form-control" type="date" /></div></div>}
          {bulkStep === 2 && <div className="pm-card pm-card-pad"><h6>Assignment summary</h6><p className="small text-muted">3 administrators will be assigned to Support Agent role. Changes require 2FA confirmation.</p></div>}
          {bulkStep === 3 && <div className="pm-card pm-card-pad"><Badge tone="blue" dot>Ready to execute</Badge><p className="small text-muted mt-2">The bulk assignment will be applied immediately after 2FA confirmation.</p></div>}
        </div>
        <div className="pm-modal-foot">
          <button className="btn btn-outline-secondary" onClick={() => bulkStep > 0 ? setBulkStep(bulkStep - 1) : (setBulkAssign(false), setBulkStep(0))}>{bulkStep > 0 ? "Back" : "Cancel"}</button>
          {bulkStep < 3 ? <button className="btn btn-primary" onClick={() => setBulkStep(bulkStep + 1)}>Continue</button> : <button className="btn btn-primary" onClick={() => { setBulkAssign(false); setBulkStep(0); push({ kind: "success", title: "Bulk assignment complete", body: "3 administrators have been reassigned." }); }}>Execute assignment</button>}
        </div>
      </Modal>

      {/* ====== RETIRE ROLE WIZARD (4-step) ====== */}
      <Modal open={!!retireWizard} onClose={() => { setRetireWizard(null); setRetireStep(0); }} title="Retire role" subtitle={`Step ${retireStep + 1} of 4`} icon="bi-trash3-fill" tone="red" size="lg">
        <Steps current={retireStep} steps={[{ label: "Identify", icon: "bi-diagram-3" }, { label: "Reassign", icon: "bi-people" }, { label: "Confirm", icon: "bi-shield-lock" }, { label: "Execute", icon: "bi-check2" }]} />
        <div className="pm-wizard-progress"><span style={{ width: `${(retireStep + 1) * 25}%` }} /></div>
        <div className="pm-modal-body">
          {retireStep === 0 && retireWizard && <div className="pm-card pm-card-pad">{[["Role", retireWizard.name], ["Tier", retireWizard.tier], ["Admins assigned", retireWizard.admins], ["Status", retireWizard.status]].map(([k, v]) => <div className="d-flex justify-content-between py-1 border-bottom small" key={k}><span className="text-muted">{k}</span><b>{v}</b></div>)}</div>}
          {retireStep === 1 && <div><p className="small text-muted mb-3">Reassign administrators before retiring this role.</p><label className="form-label">Reassign to</label><select className="form-select"><option>Support Agent</option><option>Analyst</option><option>Read-Only Viewer</option></select></div>}
          {retireStep === 2 && <div className="alert alert-danger small"><i className="bi bi-exclamation-triangle me-1" />This role will be permanently retired. All assigned administrators must be reassigned first.</div>}
          {retireStep === 3 && retireWizard && <div className="pm-card pm-card-pad"><Badge tone="red" dot>Ready to retire</Badge><h6 className="mt-3">{retireWizard.name}</h6><p className="small text-muted">The role will be removed from the system.</p></div>}
        </div>
        <div className="pm-modal-foot">
          <button className="btn btn-outline-secondary" onClick={() => retireStep > 0 ? setRetireStep(retireStep - 1) : (setRetireWizard(null), setRetireStep(0))}>{retireStep > 0 ? "Back" : "Cancel"}</button>
          {retireStep < 3 ? <button className="btn btn-primary" onClick={() => setRetireStep(retireStep + 1)}>Continue</button> : <button className="btn btn-danger" onClick={handleRetireComplete}><i className="bi bi-trash3 me-1" />Retire role</button>}
        </div>
      </Modal>

      {/* ====== ACCESS REVIEW WIZARD (4-step) ====== */}
      <Modal open={reviewWizard} onClose={() => { setReviewWizard(false); setReviewStep(0); }} title="Access review" subtitle={`Step ${reviewStep + 1} of 4`} icon="bi-clipboard-check" tone="amber" size="lg">
        <Steps current={reviewStep} steps={[{ label: "Scope", icon: "bi-funnel" }, { label: "Review", icon: "bi-eye" }, { label: "Findings", icon: "bi-exclamation-triangle" }, { label: "Complete", icon: "bi-check2" }]} />
        <div className="pm-wizard-progress"><span style={{ width: `${(reviewStep + 1) * 25}%` }} /></div>
        <div className="pm-modal-body">
          {reviewStep === 0 && <div className="row g-3"><div className="col-md-6"><label className="form-label">Review scope</label><select className="form-select"><option>All roles and permissions</option><option>Custom roles only</option><option>Tier 0–3 only</option></select></div><div className="col-md-6"><label className="form-label">Reviewer</label><select className="form-select"><option>Joseph M. · Super Admin</option><option>Sarah K. · Platform Admin</option></select></div></div>}
          {reviewStep === 1 && <div><p className="small text-muted mb-3">Review each role's permission grants against least-privilege requirements.</p>{roles.slice(0, 5).map(r => <div key={r.id} className="d-flex justify-content-between align-items-center py-2 border-bottom"><span className="pm-td-strong">{r.name} ({r.tier})</span><Badge tone="green" dot>{r.admins} admin(s)</Badge></div>)}</div>}
          {reviewStep === 2 && <div><label className="form-label">Findings</label><textarea className="form-control" rows={3} placeholder="Document any findings or recommendations..." /></div>}
          {reviewStep === 3 && <div className="pm-card pm-card-pad"><Badge tone="green" dot>Review complete</Badge><h6 className="mt-3">Access review summary</h6><p className="small text-muted">{roles.length} roles reviewed. Findings will be logged in the audit trail.</p></div>}
        </div>
        <div className="pm-modal-foot">
          <button className="btn btn-outline-secondary" onClick={() => reviewStep > 0 ? setReviewStep(reviewStep - 1) : (setReviewWizard(false), setReviewStep(0))}>{reviewStep > 0 ? "Back" : "Cancel"}</button>
          {reviewStep < 3 ? <button className="btn btn-primary" onClick={() => setReviewStep(reviewStep + 1)}>Continue</button> : <button className="btn btn-primary" onClick={handleReviewComplete}>Complete review</button>}
        </div>
      </Modal>

      {/* ====== CLONE ROLE WIZARD (4-step) ====== */}
      <Modal open={!!cloneWizard} onClose={() => { setCloneWizard(null); setCloneStep(0); }} title="Clone role" subtitle={`Step ${cloneStep + 1} of 4`} icon="bi-copy" tone="blue" size="lg">
        <Steps current={cloneStep} steps={[{ label: "Source", icon: "bi-diagram-3" }, { label: "Customize", icon: "bi-pencil" }, { label: "Review", icon: "bi-eye" }, { label: "Create", icon: "bi-check2" }]} />
        <div className="pm-wizard-progress"><span style={{ width: `${(cloneStep + 1) * 25}%` }} /></div>
        <div className="pm-modal-body">
          {cloneStep === 0 && cloneWizard && <div className="pm-card pm-card-pad">{[["Source role", cloneWizard.name], ["Tier", cloneWizard.tier], ["Permissions", "Will be copied"]].map(([k, v]) => <div className="d-flex justify-content-between py-1 border-bottom small" key={k}><span className="text-muted">{k}</span><b>{v}</b></div>)}</div>}
          {cloneStep === 1 && <div className="row g-3"><div className="col-md-6"><label className="form-label">New role name</label><input className="form-control" placeholder="Cloned role name" /></div><div className="col-md-6"><label className="form-label">Tier level</label><select className="form-select"><option>Tier 6</option><option>Tier 7</option><option>Tier 8</option></select></div></div>}
          {cloneStep === 2 && <div className="pm-card pm-card-pad"><h6>Clone summary</h6><p className="small text-muted">All permissions from the source role will be copied. You can modify permissions after creation.</p></div>}
          {cloneStep === 3 && <div className="pm-card pm-card-pad"><Badge tone="blue" dot>Ready to clone</Badge><p className="small text-muted mt-2">The cloned role will be created as a custom role.</p></div>}
        </div>
        <div className="pm-modal-foot">
          <button className="btn btn-outline-secondary" onClick={() => cloneStep > 0 ? setCloneStep(cloneStep - 1) : (setCloneWizard(null), setCloneStep(0))}>{cloneStep > 0 ? "Back" : "Cancel"}</button>
          {cloneStep < 3 ? <button className="btn btn-primary" onClick={() => setCloneStep(cloneStep + 1)}>Continue</button> : <button className="btn btn-primary" onClick={handleCloneComplete}>Create clone</button>}
        </div>
      </Modal>

      {/* ====== ACCESS POLICY DRAWER ====== */}
      <Drawer open={drawer === "policy"} onClose={() => setDrawer(null)} title="Access Control Policy" subtitle="Platform-wide RBAC and least-privilege guardrails" icon="bi-shield-lock" wide>
        <div className="pm-card pm-card-pad mb-3"><Badge tone="green" dot>Policy active</Badge>
          <h6 className="mt-3">Core principles</h6>
          {["Least-privilege by default", "Dual approval for destructive actions", "48-hour maximum for pending changes", "Annual access review mandatory", "Separation of duties enforced"].map(p => <div className="d-flex gap-2 align-items-center py-1 border-bottom small" key={p}><i className="bi bi-check-circle-fill text-success" /><span>{p}</span></div>)}
        </div>
        <div className="pm-card pm-card-pad"><h6>Approval matrix</h6>
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Action</th><th>Approval</th><th>2FA</th><th>SLA</th></tr></thead><tbody>
            {[["Grant Tier 0–2", "Super Admin + 2FA", "Required", "24h"], ["Grant Tier 3–5", "Dual Super Admin", "Required", "24h"], ["Grant Tier 6–9", "Super Admin", "Required", "48h"], ["Revoke any", "Super Admin", "Required", "Immediate"], ["Custom role create", "Super Admin + 2FA", "Required", "48h"]].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 0 ? "pm-td-strong" : ""}>{c}</td>)}</tr>)}
          </tbody></table></div>
        </div>
      </Drawer>

      {/* ====== CRUD MODALS ====== */}
      <AddRecordModal open={addRole} onClose={() => setAddRole(false)} onAdd={(f) => { handleAddRole(f); setAddRole(false); }} fields={roleFields} title="Add Role" icon="bi-diagram-3" />
      <EditRecordModal open={!!editRole} onClose={() => setEditRole(null)} onSave={(f) => { handleEditRole(f); setEditRole(null); }} record={editRole} title={`Edit: ${editRole?.name ?? ""}`} icon="bi-pencil-square" />
      <DeleteRecordWizard open={!!deleteRole} onClose={() => setDeleteRole(null)} onDelete={handleDeleteRole} name={deleteRole?.name ?? ""} relatedCount={3} dependencyCount={2} />
      <LockUnlockModal open={!!lockRole} onClose={() => setLockRole(null)} onToggle={handleLockRole} record={lockRole ? { name: lockRole.name, locked: !!lockRole.locked, lockedBy: lockRole.lockedBy } : null} />
      <EditRecordModal open={!!editChange} onClose={() => setEditChange(null)} onSave={(f) => { handleEditChange(f); setEditChange(null); }} record={editChange} title={`Edit: ${editChange?.permission ?? ""}`} icon="bi-pencil-square" />
      <DeleteRecordWizard open={!!deleteChange} onClose={() => setDeleteChange(null)} onDelete={handleDeleteChange} name={editChange?.permission ?? ""} relatedCount={0} dependencyCount={0} />
      <EditRecordModal open={!!editAudit} onClose={() => setEditAudit(null)} onSave={(f) => { handleEditAudit(f); setEditAudit(null); }} record={editAudit} title={`Edit audit: ${editAudit?.scope ?? ""}`} icon="bi-pencil-square" />
      <DeleteRecordWizard open={!!deleteAudit} onClose={() => setDeleteAudit(null)} onDelete={handleDeleteAudit} name={editAudit?.scope ?? ""} relatedCount={0} dependencyCount={0} />
      <AddRecordModal open={addPolicy} onClose={() => setAddPolicy(false)} onAdd={(f) => { handleAddPolicy(f); setAddPolicy(false); }} fields={policyFields} title="Add Policy" icon="bi-shield-lock" />
      <EditRecordModal open={!!editPolicy} onClose={() => setEditPolicy(null)} onSave={(f) => { handleEditPolicy(f); setEditPolicy(null); }} record={editPolicy} title={`Edit: ${editPolicy?.name ?? ""}`} icon="bi-pencil-square" />
      <DeleteRecordWizard open={!!deletePolicy} onClose={() => setDeletePolicy(null)} onDelete={handleDeletePolicy} name={editPolicy?.name ?? ""} relatedCount={0} dependencyCount={0} />
      <LockUnlockModal open={!!lockPolicy} onClose={() => setLockPolicy(null)} onToggle={handleLockPolicy} record={lockPolicy ? { name: lockPolicy.name, locked: !!lockPolicy.locked, lockedBy: lockPolicy.lockedBy } : null} />
      <AddRecordModal open={addTemplate} onClose={() => setAddTemplate(false)} onAdd={(f) => { handleAddTemplate(f); setAddTemplate(false); }} fields={templateFields} title="Add Template" icon="bi-file-earmark-richtext" />
      <EditRecordModal open={!!editTemplate} onClose={() => setEditTemplate(null)} onSave={(f) => { handleEditTemplate(f); setEditTemplate(null); }} record={editTemplate} title={`Edit: ${editTemplate?.name ?? ""}`} icon="bi-pencil-square" />
      <DeleteRecordWizard open={!!deleteTemplate} onClose={() => setDeleteTemplate(null)} onDelete={handleDeleteTemplate} name={editTemplate?.name ?? ""} relatedCount={1} dependencyCount={0} />
      <LockUnlockModal open={!!lockTemplate} onClose={() => setLockTemplate(null)} onToggle={handleLockTemplate} record={lockTemplate ? { name: lockTemplate.name, locked: !!lockTemplate.locked, lockedBy: lockTemplate.lockedBy } : null} />
    </div>
  );
}
