import { useCallback, useMemo, useState } from "react";
import { Badge, Drawer, Modal, Steps, useToast } from "../../../components/ui";
import { AddRecordModal, EditRecordModal, DeleteRecordWizard, LockUnlockModal } from "../../../components/AdminControls";
import {
  type RoleRecord, type PermChangeRecord, type AuditRecord, type PolicyRecord, type TemplateRecord,
  type AdminAssignment, type SecurityEvent, type RoleDocument,
  initialRoles, initialChanges, initialAudits, initialPolicies, initialTemplates,
  initialAdmins, initialSecurityEvents, initialDocuments, categories
} from "../data/permData";
import {
  RoleDetailDrawer, AdminOnboardingWizard, AdminOffboardingWizard, SecurityReviewModal,
  EmergencyAccessWizard, ComplianceAuditModal, AdminActivityLogModal, DocumentPreviewModal,
  DocumentUploadWizard, DocumentManagementDrawer, PermImpactModal, RoleComparisonModal,
  AccessReviewModal, AccessPolicyDrawer, RoleHistoryModal, PermMatrixExportModal,
  PermCatalogueDrawer, PermissionGrantModal, BulkPermissionWizard, PermChangeDiffModal,
  EmergencyAccessRequestModal, RoleHierarchyModal, DuplicateRoleModal, RetireRoleModal,
  RevokeAllGrantsModal, AssignAdminsModal, TemplateDetailModal
} from "../modals/PermModals";

type A = { title: string; body: React.ReactNode; icon?: string; tone?: "green" | "red" | "amber" | "blue" | "violet" | "ink" };

export function PermissionsRoles({ signal: _signal }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  const { push } = useToast();
  const [tab, setTab] = useState("roles");
  const [q, setQ] = useState("");
  const [action, setAction] = useState<A | null>(null);
  const [drawer, setDrawer] = useState<string | null>(null);

  // Wizard states
  const [wizard, setWizard] = useState(false);
  const [step, setStep] = useState(0);
  const [bulkAssign, setBulkAssign] = useState(false);
  const [bulkStep, setBulkStep] = useState(0);
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
  const [admins, setAdmins] = useState<AdminAssignment[]>(initialAdmins);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>(initialSecurityEvents);
  const [documents, setDocuments] = useState<RoleDocument[]>(initialDocuments);
  const [granted, setGranted] = useState<Record<string, boolean>>({ "View user list": true, "View user detail": true, "View all transactions": true, "View fraud dashboard": true, "View partners": true, "View analytics": true });

  // CRUD — Roles
  const [editRole, setEditRole] = useState<RoleRecord | null>(null);
  const [deleteRole, setDeleteRole] = useState<RoleRecord | null>(null);
  const [lockRole, setLockRole] = useState<RoleRecord | null>(null);
  const [addRole, setAddRole] = useState(false);

  // CRUD — Changes
  const [editChange, setEditChange] = useState<PermChangeRecord | null>(null);
  const [deleteChange, setDeleteChange] = useState<PermChangeRecord | null>(null);

  // CRUD — Audits
  const [editAudit, setEditAudit] = useState<AuditRecord | null>(null);
  const [deleteAudit, setDeleteAudit] = useState<AuditRecord | null>(null);

  // CRUD — Policies
  const [editPolicy, setEditPolicy] = useState<PolicyRecord | null>(null);
  const [deletePolicy, setDeletePolicy] = useState<PolicyRecord | null>(null);
  const [lockPolicy, setLockPolicy] = useState<PolicyRecord | null>(null);
  const [addPolicy, setAddPolicy] = useState(false);

  // CRUD — Templates
  const [editTemplate, setEditTemplate] = useState<TemplateRecord | null>(null);
  const [deleteTemplate, setDeleteTemplate] = useState<TemplateRecord | null>(null);
  const [lockTemplate, setLockTemplate] = useState<TemplateRecord | null>(null);
  const [addTemplate, setAddTemplate] = useState(false);

  // CRUD — Admins
  const [editAdmin, setEditAdmin] = useState<AdminAssignment | null>(null);
  const [deleteAdmin, setDeleteAdmin] = useState<AdminAssignment | null>(null);
  const [lockAdmin, setLockAdmin] = useState<AdminAssignment | null>(null);
  const [addAdmin, setAddAdmin] = useState(false);

  // CRUD — Documents
  const [editDoc, setEditDoc] = useState<RoleDocument | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<RoleDocument | null>(null);
  const [lockDoc, setLockDoc] = useState<RoleDocument | null>(null);
  const [previewDoc, setPreviewDoc] = useState<RoleDocument | null>(null);

  // CRUD — Security Events
  const [editEvent, setEditEvent] = useState<SecurityEvent | null>(null);
  const [deleteEvent, setDeleteEvent] = useState<SecurityEvent | null>(null);

  // Feature modals
  const [roleDetail, setRoleDetail] = useState<RoleRecord | null>(null);
  const [duplicateRole, setDuplicateRole] = useState<RoleRecord | null>(null);
  const [retireRole, setRetireRole] = useState<RoleRecord | null>(null);
  const [templateDetail, setTemplateDetail] = useState<TemplateRecord | null>(null);
  const [docUpload, setDocUpload] = useState(false);
  const [docManager, setDocManager] = useState(false);
  const [adminOnboard, setAdminOnboard] = useState(false);
  const [adminOffboard, setAdminOffboard] = useState<AdminAssignment | null>(null);
  const [securityReview, setSecurityReview] = useState(false);
  const [emergencyAccess, setEmergencyAccess] = useState(false);
  const [emergencyRequests, setEmergencyRequests] = useState(false);
  const [complianceAudit, setComplianceAudit] = useState(false);
  const [activityLog, setActivityLog] = useState(false);
  const [permImpact, setPermImpact] = useState(false);
  const [roleComparison, setRoleComparison] = useState(false);
  const [roleHierarchy, setRoleHierarchy] = useState(false);
  const [permGrant, setPermGrant] = useState(false);
  const [bulkPermOps, setBulkPermOps] = useState(false);
  const [permDiff, setPermDiff] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);
  const [matrixExport, setMatrixExport] = useState(false);
  const [catDrawer, setCatDrawer] = useState(false);
  const [policyDrawer, setPolicyDrawer] = useState(false);
  const [revAllGrants, setRevAllGrants] = useState(false);
  const [assignAdmins, setAssignAdmins] = useState(false);

  // Derived
  const filtered = useMemo(() => roles.filter(r => [r.name, r.tier, r.status, r.description].join(" ").toLowerCase().includes(q.toLowerCase())), [q, roles]);
  const customCount = roles.filter(r => r.status === "Custom").length;
  const grantedCount = Object.values(granted).filter(Boolean).length;

  // CRUD handlers — Roles
  const handleAddRole = useCallback((form: Record<string, string>) => {
    setRoles(p => [...p, { id: `r-${Date.now()}`, name: form.name || "New Role", tier: form.tier || "Tier 6", created: new Date().toLocaleDateString(), admins: "0", lastModified: new Date().toLocaleDateString(), deletionPolicy: "Can delete", status: "Custom", description: form.description || "—" }]);
    push({ kind: "success", title: "Role created", body: "The new role is pending Super Admin approval." });
  }, [push]);
  const handleEditRole = useCallback((form: Record<string, any>) => { if (!editRole) return; setRoles(p => p.map(r => r.id === editRole.id ? { ...r, ...form } : r)); }, [editRole]);
  const handleDeleteRole = useCallback(() => { if (!deleteRole) return; setRoles(p => p.filter(r => r.id !== deleteRole.id)); }, [deleteRole]);
  const handleLockRole = useCallback((locked: boolean) => { if (!lockRole) return; setRoles(p => p.map(r => r.id === lockRole.id ? { ...r, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Admin lock" : undefined } : r)); }, [lockRole]);

  // CRUD handlers — Changes
  const handleEditChange = useCallback((form: Record<string, any>) => { if (!editChange) return; setChanges(p => p.map(c => c.id === editChange.id ? { ...c, ...form } : c)); }, [editChange]);
  const handleDeleteChange = useCallback(() => { if (!deleteChange) return; setChanges(p => p.filter(c => c.id !== deleteChange.id)); }, [deleteChange]);

  // CRUD handlers — Audits
  const handleEditAudit = useCallback((form: Record<string, any>) => { if (!editAudit) return; setAudits(p => p.map(a => a.id === editAudit.id ? { ...a, ...form } : a)); }, [editAudit]);
  const handleDeleteAudit = useCallback(() => { if (!deleteAudit) return; setAudits(p => p.filter(a => a.id !== deleteAudit.id)); }, [deleteAudit]);

  // CRUD handlers — Policies
  const handleAddPolicy = useCallback((form: Record<string, string>) => { setPolicies(p => [...p, { id: `pol-${Date.now()}`, name: form.name || "New Policy", rule: form.rule || "—", scope: form.scope || "All", status: "Active" }]); }, []);
  const handleEditPolicy = useCallback((form: Record<string, any>) => { if (!editPolicy) return; setPolicies(p => p.map(po => po.id === editPolicy.id ? { ...po, ...form } : po)); }, [editPolicy]);
  const handleDeletePolicy = useCallback(() => { if (!deletePolicy) return; setPolicies(p => p.filter(po => po.id !== deletePolicy.id)); }, [deletePolicy]);
  const handleLockPolicy = useCallback((locked: boolean) => { if (!lockPolicy) return; setPolicies(p => p.map(po => po.id === lockPolicy.id ? { ...po, locked, lockedBy: locked ? "Super Admin" : undefined } : po)); }, [lockPolicy]);

  // CRUD handlers — Templates
  const handleAddTemplate = useCallback((form: Record<string, string>) => { setTemplates(p => [...p, { id: `t-${Date.now()}`, name: form.name || "New Template", basedOn: form.basedOn || "—", permissions: form.permissions || "—", usageCount: "0", created: new Date().toLocaleDateString(), status: "Draft" }]); }, []);
  const handleEditTemplate = useCallback((form: Record<string, any>) => { if (!editTemplate) return; setTemplates(p => p.map(t => t.id === editTemplate.id ? { ...t, ...form } : t)); }, [editTemplate]);
  const handleDeleteTemplate = useCallback(() => { if (!deleteTemplate) return; setTemplates(p => p.filter(t => t.id !== deleteTemplate.id)); }, [deleteTemplate]);
  const handleLockTemplate = useCallback((locked: boolean) => { if (!lockTemplate) return; setTemplates(p => p.map(t => t.id === lockTemplate.id ? { ...t, locked, lockedBy: locked ? "Super Admin" : undefined } : t)); }, [lockTemplate]);

  // CRUD handlers — Admins
  const handleEditAdmin = useCallback((form: Record<string, any>) => { if (!editAdmin) return; setAdmins(p => p.map(a => a.id === editAdmin.id ? { ...a, ...form } : a)); }, [editAdmin]);
  const handleDeleteAdmin = useCallback(() => { if (!deleteAdmin) return; setAdmins(p => p.filter(a => a.id !== deleteAdmin.id)); }, [deleteAdmin]);
  const handleLockAdmin = useCallback((locked: boolean) => { if (!lockAdmin) return; setAdmins(p => p.map(a => a.id === lockAdmin.id ? { ...a, locked, lockedBy: locked ? "Super Admin" : undefined } : a)); }, [lockAdmin]);

  // CRUD handlers — Documents
  const handleEditDoc = useCallback((form: Record<string, any>) => { if (!editDoc) return; setDocuments(p => p.map(d => d.id === editDoc.id ? { ...d, ...form } : d)); }, [editDoc]);
  const handleDeleteDoc = useCallback(() => { if (!deleteDoc) return; setDocuments(p => p.filter(d => d.id !== deleteDoc.id)); }, [deleteDoc]);
  const handleLockDoc = useCallback((locked: boolean) => { if (!lockDoc) return; setDocuments(p => p.map(d => d.id === lockDoc.id ? { ...d, locked, lockedBy: locked ? "Super Admin" : undefined } : d)); }, [lockDoc]);

  // CRUD handlers — Security Events
  const handleEditEvent = useCallback((form: Record<string, any>) => { if (!editEvent) return; setSecurityEvents(p => p.map(e => e.id === editEvent.id ? { ...e, ...form } : e)); }, [editEvent]);
  const handleDeleteEvent = useCallback(() => { if (!deleteEvent) return; setSecurityEvents(p => p.filter(e => e.id !== deleteEvent.id)); }, [deleteEvent]);

  // Wizard completions
  const handleCloneComplete = useCallback(() => {
    if (!cloneWizard) return;
    const cloned: RoleRecord = { ...cloneWizard, id: `r-${Date.now()}`, name: `${cloneWizard.name} (Copy)`, status: "Custom", deletionPolicy: "Can delete", created: new Date().toLocaleDateString(), lastModified: new Date().toLocaleDateString(), admins: "0" };
    setRoles(p => [...p, cloned]);
    setCloneWizard(null); setCloneStep(0);
    push({ kind: "success", title: "Role cloned", body: `${cloned.name} created as a custom role.` });
  }, [cloneWizard, push]);

  const handleReviewComplete = useCallback(() => {
    setReviewWizard(false); setReviewStep(0);
    push({ kind: "success", title: "Access review completed", body: "All role assignments have been reviewed and confirmed." });
  }, [push]);

  // Field definitions
  const roleFields = [{ key: "name", label: "Role name", placeholder: "Custom Operations Admin", required: true }, { key: "tier", label: "Tier", placeholder: "Tier 6" }, { key: "description", label: "Description", placeholder: "Role description" }];
  const policyFields = [{ key: "name", label: "Policy name", placeholder: "e.g. Session timeout policy", required: true }, { key: "rule", label: "Rule", placeholder: "Describe the rule...", required: true }, { key: "scope", label: "Scope", placeholder: "All / Tier 0–2 / Finance roles" }];
  const templateFields = [{ key: "name", label: "Template name", placeholder: "e.g. Regional Admin", required: true }, { key: "basedOn", label: "Based on", placeholder: "Base role" }, { key: "permissions", label: "Permissions", placeholder: "Comma-separated permissions" }];

  const tabs: [string, string, string][] = [
    ["roles", "Role management", "bi-diagram-3"],
    ["admins", "Admin assignments", "bi-people"],
    ["matrix", "Permission matrix", "bi-grid-3x3-gap"],
    ["tree", "Permission catalogue", "bi-list-nested"],
    ["changes", "Change history", "bi-clock-history"],
    ["audits", "Access audits", "bi-clipboard-check"],
    ["policies", "Access policies", "bi-shield-lock"],
    ["templates", "Role templates", "bi-file-earmark-richtext"],
    ["documents", "Role documents", "bi-file-earmark-text"],
    ["security", "Security events", "bi-shield-exclamation"]
  ];

  return (
    <div className="pm-page-content roles-page">
      {/* ========== HEADER ========== */}
      <div className="pm-section-head" style={{ marginTop: 0 }}>
        <div>
          <div className="pm-eyebrow">PLATFORM ADMINISTRATION / PAGE 30</div>
          <h2 className="mb-1">Permissions & Roles</h2>
          <p>Configure role hierarchy, permission sets and least-privilege access policies for every administrator.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setPolicyDrawer(true)}><i className="bi bi-shield-lock me-1" />Access policy</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setActivityLog(true)}><i className="bi bi-clock-history me-1" />Activity log</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setComplianceAudit(true)}><i className="bi bi-clipboard-check me-1" />Compliance</button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => setBulkAssign(true)}><i className="bi bi-people me-1" />Bulk assign</button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => { setReviewStep(0); setReviewWizard(true); }}><i className="bi bi-clipboard-check me-1" />Access review</button>
          <button className="btn btn-primary btn-sm" onClick={() => { setStep(0); setWizard(true); }}><i className="bi bi-plus-lg me-1" />Create role</button>
        </div>
      </div>

      {/* ========== HERO ========== */}
      <div className="pm-hero roles-hero mb-3">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <div className="pm-eyebrow text-white-50">ACCESS CONTROL · DUAL APPROVAL</div>
            <div className="pm-hero-value">{roles.length} <span className="fs-6 fw-normal text-white-50">role tiers</span></div>
            <div className="small text-white-50 mt-2">{customCount} custom · {grantedCount} grants active · {admins.length} administrators · all changes require 2FA and audit evidence</div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <div className="pm-hero-chip"><div className="l">Permission nodes</div><div className="v">80+</div></div>
            <div className="pm-hero-chip"><div className="l">Custom roles</div><div className="v">{customCount}</div></div>
            <div className="pm-hero-chip"><div className="l">Active admins</div><div className="v">{admins.filter(a => a.status === "Active").length}</div></div>
            <div className="pm-hero-chip"><div className="l">Documents</div><div className="v">{documents.length}</div></div>
            <div className="pm-hero-chip"><div className="l">Security events</div><div className="v text-warning">{securityEvents.filter(e => e.status !== "Resolved").length}</div></div>
          </div>
        </div>
      </div>

      {/* ========== STATS ========== */}
      <div className="row g-3 mb-3">
        {[
          ["Role tiers", String(roles.length), `${customCount} custom`, "bi-diagram-3", "green"],
          ["Active admins", String(admins.filter(a => a.status === "Active").length), `${admins.length} total`, "bi-people", "blue"],
          ["Documents", String(documents.length), `${documents.filter(d => d.status === "Active").length} active`, "bi-file-earmark-text", "violet"],
          ["Security events", String(securityEvents.length), `${securityEvents.filter(e => e.status !== "Resolved").length} unresolved`, "bi-shield-exclamation", "amber"]
        ].map(x => <div className="col-6 col-xl-3" key={x[0]}><div className="pm-stat" style={{ cursor: "pointer" }} onClick={() => setTab(x[0].includes("doc") ? "documents" : x[0].includes("sec") ? "security" : x[0].includes("admin") ? "admins" : "roles")}><div className={`pm-stat-ico bg-${x[4]}-soft text-${x[4]}`}><i className={`bi ${x[3]}`} /></div><div className="pm-stat-label">{x[0]}</div><div className="pm-stat-value">{x[1]}</div><div className="pm-stat-foot">{x[2]}</div></div></div>)}
      </div>

      {/* ========== TABS ========== */}
      <div className="pm-card mb-3">
        <div className="pm-tabs">
          {tabs.map(x => <button className={`pm-tab ${tab === x[0] ? "active" : ""}`} key={x[0]} onClick={() => setTab(x[0])}><i className={`bi ${x[2]}`} />{x[1]}</button>)}
        </div>
      </div>

      {/* ======== ROLES TAB ======== */}
      {tab === "roles" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Role management</h3><p>System roles are protected; custom roles can be edited or retired through approval.</p></div>
          <div className="d-flex gap-2 align-items-center">
            <div className="pm-search"><i className="bi bi-search" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search role or tier" /></div>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setRoleHierarchy(true)}><i className="bi bi-diagram-3 me-1" />Hierarchy</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setRoleComparison(true)}><i className="bi bi-arrows-angle-contract me-1" />Compare</button>
            <button className="btn btn-primary btn-sm" onClick={() => setAddRole(true)}><i className="bi bi-plus me-1" />Add role</button>
          </div>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Role</th><th>Tier</th><th>Created</th><th>Admins</th><th>Permissions</th><th>Last review</th><th>Status</th><th className="text-end">Actions</th></tr></thead><tbody>
            {filtered.map(r => <tr key={r.id} style={{ cursor: "pointer" }} onClick={() => setRoleDetail(r)}>
              <td className="pm-td-strong">{r.name}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td>
              <td className="pm-num">{r.tier}</td>
              <td>{r.created}</td>
              <td className="pm-num">{r.admins}</td>
              <td className="pm-num">{r.permissionCount ?? "—"}</td>
              <td className="pm-td-sub">{r.lastAccessReview ?? "—"}</td>
              <td><Badge tone={r.status === "System" ? "blue" : "amber"}>{r.status}</Badge></td>
              <td className="text-end text-nowrap" onClick={e => e.stopPropagation()}>
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditRole(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setLockRole(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => { setCloneStep(0); setCloneWizard(r); }} title="Clone"><i className="bi bi-copy" /></button>
                {r.deletionPolicy !== "Protected" && <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteRole(r)} title="Delete"><i className="bi bi-trash3" /></button>}
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* ======== ADMINS TAB ======== */}
      {tab === "admins" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Admin assignments</h3><p>Manage administrator accounts, role assignments and access levels.</p></div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setEmergencyRequests(true)}><i className="bi bi-lightning-charge me-1" />Emergency requests</button>
            <button className="btn btn-outline-primary btn-sm" onClick={() => setPermGrant(true)}><i className="bi bi-key me-1" />Grant/revoke</button>
            <button className="btn btn-primary btn-sm" onClick={() => setAdminOnboard(true)}><i className="bi bi-person-plus me-1" />Onboard admin</button>
          </div>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Administrator</th><th>Role</th><th>Tier</th><th>MFA</th><th>Sessions</th><th>Last active</th><th>Status</th><th className="text-end">Actions</th></tr></thead><tbody>
            {admins.map(a => <tr key={a.id}>
              <td className="pm-td-strong">{a.name}{a.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}<div className="pm-td-sub">{a.email}</div></td>
              <td className="pm-td-strong">{a.role}</td>
              <td className="pm-num">{a.tier}</td>
              <td><Badge tone={a.mfaEnabled ? "green" : "red"}>{a.mfaEnabled ? "✓" : "✗"}</Badge></td>
              <td className="pm-num">{a.sessionsActive}</td>
              <td className="pm-td-sub">{a.lastActive}</td>
              <td><Badge tone={a.status === "Active" ? "green" : a.status === "Suspended" ? "red" : "amber"} dot>{a.status}</Badge></td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditAdmin(a)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setLockAdmin(a)} title={a.locked ? "Unlock" : "Lock"}><i className={`bi ${a.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setAdminOffboard(a)} title="Offboard"><i className="bi bi-person-dash" /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteAdmin(a)} title="Remove"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* ======== MATRIX TAB ======== */}
      {tab === "matrix" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Permission matrix editor</h3><p>Toggle individual grants. Changes are staged until 2FA confirmation.</p></div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setBulkPermOps(true)}><i className="bi bi-gear-wide-connected me-1" />Bulk operations</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setPermDiff(true)}><i className="bi bi-key me-1" />View diff</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setMatrixExport(true)}><i className="bi bi-download me-1" />Export</button>
            <button className="btn btn-outline-danger btn-sm" onClick={() => setRevAllGrants(true)}><i className="bi bi-x-lg me-1" />Revoke all</button>
            <button className="btn btn-primary btn-sm" onClick={() => { const count = Object.values(granted).filter(Boolean).length; setAction({ title: "Save permission matrix", body: <div><p>{count} permissions will be saved. Changes require 2FA confirmation.</p></div>, tone: "amber", icon: "bi-shield-check" }); }}><i className="bi bi-shield-check me-1" />Save ({grantedCount})</button>
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

      {/* ======== TREE TAB ======== */}
      {tab === "tree" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Permission catalogue</h3><p>Full permission tree grouped by product domain and administrative capability.</p></div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setPermGrant(true)}><i className="bi bi-key me-1" />Grant permission</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setPermImpact(true)}><i className="bi bi-graph-up me-1" />Impact analysis</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setAction({ title: "Export permission catalogue", body: <div><p>Complete permission catalogue exported.</p><div className="mt-3">{Object.entries(categories).map(([cat, items]) => <div key={cat} className="d-flex justify-content-between py-1 border-bottom small"><span className="text-muted">{cat}</span><b>{items.length} permissions</b></div>)}</div></div>, tone: "blue", icon: "bi-download" })}><i className="bi bi-download me-1" />Export</button>
          </div>
        </div>
        <div className="row g-3">
          {Object.entries(categories).map(([cat, items]) => <div className="col-md-6 col-xl-4" key={cat}>
            <div className="pm-card pm-card-pad h-100">
              <div className="d-flex justify-content-between align-items-center mb-2"><h6 className="mb-0">{cat}</h6><Badge tone="blue">{items.length} nodes</Badge></div>
              {items.map((p, i) => <div className="permission-row" key={p} style={{ cursor: "pointer" }} onClick={() => setPermGrant()}><i className={`bi ${i < 3 ? "bi-check-circle-fill text-success" : "bi-circle"}`} />{p}</div>)}
            </div>
          </div>)}
        </div>
      </section>}

      {/* ======== CHANGES TAB ======== */}
      {tab === "changes" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Permission change history</h3><p>Immutable record of grants, revocations, reasons and approving admin.</p></div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setHistoryModal(true)}><i className="bi bi-clock-history me-1" />Full history</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setAction({ title: "Export change history", body: <div><p>Permission change history exported with approval metadata.</p></div>, tone: "blue", icon: "bi-download" })}><i className="bi bi-download me-1" />Export</button>
          </div>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Date</th><th>Admin</th><th>Role</th><th>Permission</th><th>Change</th><th>Approved by</th><th>Status</th><th className="text-end">Actions</th></tr></thead><tbody>
            {changes.map(r => <tr key={r.id}>
              <td>{r.date}</td>
              <td className="pm-td-strong">{r.admin}</td>
              <td className="pm-td-strong">{r.role}</td>
              <td>{r.permission}</td>
              <td><Badge tone={r.change === "Granted" ? "green" : "red"} dot>{r.change}</Badge></td>
              <td className="pm-td-sub">{r.approvedBy ?? "—"}</td>
              <td><Badge tone={r.status === "Deployed" ? "green" : "amber"}>{r.status ?? "—"}</Badge></td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditChange(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteChange(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* ======== AUDITS TAB ======== */}
      {tab === "audits" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Access audits</h3><p>Periodic reviews of admin access, privilege creep and compliance status.</p></div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setComplianceAudit(true)}><i className="bi bi-clipboard-check me-1" />Compliance report</button>
            <button className="btn btn-primary btn-sm" onClick={() => { setReviewStep(0); setReviewWizard(true); }}><i className="bi bi-clipboard-check me-1" />Start audit</button>
          </div>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Date</th><th>Reviewer</th><th>Scope</th><th>Findings</th><th>Admins reviewed</th><th>Duration</th><th>Status</th><th className="text-end">Actions</th></tr></thead><tbody>
            {audits.map(r => <tr key={r.id}>
              <td>{r.date}</td>
              <td className="pm-td-strong">{r.reviewer}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td>
              <td>{r.scope}</td>
              <td>{r.findings}</td>
              <td className="pm-num">{r.adminsReviewed ?? "—"}</td>
              <td className="pm-td-sub">{r.duration ?? "—"}</td>
              <td><Badge tone={r.status === "Passed" ? "green" : r.status === "Remediated" ? "blue" : "amber"} dot>{r.status}</Badge></td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditAudit(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteAudit(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* ======== POLICIES TAB ======== */}
      {tab === "policies" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Access policies</h3><p>RBAC guardrails, approval matrices and least-privilege rules.</p></div>
          <button className="btn btn-primary btn-sm" onClick={() => setAddPolicy(true)}><i className="bi bi-plus me-1" />Add policy</button>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Policy</th><th>Rule</th><th>Scope</th><th>Severity</th><th>Status</th><th className="text-end">Actions</th></tr></thead><tbody>
            {policies.map(r => <tr key={r.id}>
              <td className="pm-td-strong">{r.name}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td>
              <td>{r.rule}</td>
              <td>{r.scope}</td>
              <td><Badge tone={r.severity === "Critical" ? "red" : r.severity === "High" ? "amber" : "blue"}>{r.severity ?? "—"}</Badge></td>
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

      {/* ======== TEMPLATES TAB ======== */}
      {tab === "templates" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Role templates</h3><p>Reusable role configurations for quick onboarding and standardization.</p></div>
          <button className="btn btn-primary btn-sm" onClick={() => setAddTemplate(true)}><i className="bi bi-plus me-1" />Add template</button>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Template</th><th>Based on</th><th>Permissions</th><th>Usage</th><th>Created</th><th>Status</th><th className="text-end">Actions</th></tr></thead><tbody>
            {templates.map(r => <tr key={r.id} style={{ cursor: "pointer" }} onClick={() => setTemplateDetail(r)}>
              <td className="pm-td-strong">{r.name}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td>
              <td>{r.basedOn}</td>
              <td style={{ maxWidth: 200 }} className="pm-td-sub">{r.permissions}</td>
              <td className="pm-num">{r.usageCount}</td>
              <td>{r.created}</td>
              <td><Badge tone={r.status === "Active" ? "green" : "amber"}>{r.status}</Badge></td>
              <td className="text-end text-nowrap" onClick={e => e.stopPropagation()}>
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditTemplate(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setLockTemplate(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteTemplate(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* ======== DOCUMENTS TAB ======== */}
      {tab === "documents" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Role documents</h3><p>Policies, protocols, guides and checklists governing admin access.</p></div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setDocManager(true)}><i className="bi bi-folder2-open me-1" />Document library</button>
            <button className="btn btn-primary btn-sm" onClick={() => setDocUpload(true)}><i className="bi bi-cloud-arrow-up me-1" />Upload document</button>
          </div>
        </div>
        <div className="row g-3">
          {documents.map(doc => <div className="col-md-6 col-xl-4" key={doc.id}>
            <div className="pm-card pm-card-pad h-100 doc-card" style={{ cursor: "pointer" }} onClick={() => setPreviewDoc(doc)}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="d-flex align-items-center gap-2">
                  <div className="doc-icon"><i className="bi bi-file-earmark-text" /></div>
                  <div>
                    <div className="pm-td-strong">{doc.name}</div>
                    <div className="pm-td-sub">{doc.type} · {doc.version}</div>
                  </div>
                </div>
                {doc.locked && <i className="bi bi-lock-fill text-warning" style={{ fontSize: ".7rem" }} />}
              </div>
              <div className="d-flex gap-2 mb-2">
                <Badge tone={doc.status === "Active" ? "green" : "blue"}>{doc.status}</Badge>
                <Badge tone={doc.classification === "Secret" ? "red" : doc.classification === "Confidential" ? "amber" : "grey"}>{doc.classification}</Badge>
              </div>
              <div className="pm-td-sub small" style={{ fontSize: ".75rem" }}>Role: {doc.role} · Updated by: {doc.updatedBy}</div>
              <div className="d-flex gap-1 mt-2" onClick={e => e.stopPropagation()}>
                <button className="btn btn-sm btn-outline-primary" onClick={() => setPreviewDoc(doc)} title="Preview"><i className="bi bi-eye" /></button>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditDoc(doc)} title="Edit"><i className="bi bi-pencil" /></button>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setLockDoc(doc)} title={doc.locked ? "Unlock" : "Lock"}><i className={`bi ${doc.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteDoc(doc)} title="Delete"><i className="bi bi-trash3" /></button>
              </div>
            </div>
          </div>)}
        </div>
      </section>}

      {/* ======== SECURITY TAB ======== */}
      {tab === "security" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Security events</h3><p>Real-time monitoring of security events, anomalies and policy violations.</p></div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setSecurityReview(true)}><i className="bi bi-shield-exclamation me-1" />Security review</button>
            <button className="btn btn-outline-primary btn-sm" onClick={() => setEmergencyAccess(true)}><i className="bi bi-lightning-charge me-1" />Emergency access</button>
            <button className="btn btn-outline-primary btn-sm" onClick={() => setEmergencyRequests(true)}><i className="bi bi-lightning-charge me-1" />View requests</button>
          </div>
        </div>
        <div className="row g-3 mb-3">
          {[["Critical", securityEvents.filter(e => e.severity === "Critical").length, "red"], ["High", securityEvents.filter(e => e.severity === "High").length, "amber"], ["Medium", securityEvents.filter(e => e.severity === "Medium").length, "blue"], ["Low", securityEvents.filter(e => e.severity === "Low").length, "grey"]].map(([label, count, color]) => (
            <div className="col-3" key={label as string}><div className="pm-card pm-card-pad text-center"><div className="h4 mb-0">{count}</div><Badge tone={color as string}>{label as string}</Badge></div></div>
          ))}
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Time</th><th>Severity</th><th>Category</th><th>Event</th><th>Admin</th><th>IP</th><th>Status</th><th className="text-end">Actions</th></tr></thead><tbody>
            {securityEvents.map(e => <tr key={e.id}>
              <td className="mono">{e.timestamp}</td>
              <td><Badge tone={e.severity === "Critical" ? "red" : e.severity === "High" ? "amber" : e.severity === "Medium" ? "blue" : "grey"}>{e.severity}</Badge></td>
              <td>{e.category}</td>
              <td className="pm-td-strong">{e.event}{e.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td>
              <td>{e.admin}</td>
              <td className="mono" style={{ fontSize: ".75rem" }}>{e.ip}</td>
              <td><Badge tone={e.status === "Resolved" ? "green" : e.status === "Investigating" || e.status === "Pending approval" ? "red" : "amber"} dot>{e.status}</Badge></td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditEvent(e)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteEvent(e)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* ======== GENERIC ACTION MODAL ======== */}
      <Modal open={!!action} onClose={() => setAction(null)} title={action?.title ?? "Action"} subtitle="Super Admin action · permission changes are immutable" icon={action?.icon} tone={action?.tone}>
        <div className="pm-modal-body">{action?.body}</div>
        <div className="pm-modal-foot">
          <button className="btn btn-outline-secondary" onClick={() => setAction(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { setAction(null); push({ kind: "success", title: "Action completed", body: "The change was recorded in the audit trail." }); }}>Confirm</button>
        </div>
      </Modal>

      {/* ======== CREATE ROLE WIZARD (4-step) ======== */}
      <Modal open={wizard} onClose={() => { setWizard(false); setStep(0); }} title="Create custom role" subtitle={`Step ${step + 1} of 4`} icon="bi-plus-circle" tone="green" size="lg">
        <Steps current={step} steps={[{ label: "Identity", icon: "bi-person-badge" }, { label: "Base role", icon: "bi-copy" }, { label: "Permissions", icon: "bi-key" }, { label: "Review", icon: "bi-check2" }]} />
        <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 25}%` }} /></div>
        <div className="pm-modal-body">
          {step === 0 && <div className="row g-3"><div className="col-md-6"><label className="form-label">Role name</label><input className="form-control" id="cr-name" placeholder="Custom Operations Admin" /></div><div className="col-md-6"><label className="form-label">Description</label><input className="form-control" id="cr-desc" placeholder="Limited operations access" /></div></div>}
          {step === 1 && <div className="row g-3"><div className="col-md-6"><label className="form-label">Base role</label><select className="form-select" id="cr-base"><option>Operations Manager</option><option>Support Lead</option><option>Analyst</option><option>Support Agent</option></select></div><div className="col-md-6"><label className="form-label">Tier level</label><select className="form-select" id="cr-tier"><option>Tier 6</option><option>Tier 7</option><option>Tier 8</option></select></div></div>}
          {step === 2 && <div><p className="small text-muted mb-3">Select permissions for this role.</p>{Object.entries(categories).slice(0, 3).map(([cat, items]) => <div key={cat} className="mb-3"><div className="pm-eyebrow mb-1">{cat}</div>{items.slice(0, 4).map(p => <label key={p} className="d-flex align-items-center gap-2 mb-1" style={{ fontSize: ".85rem" }}><input type="checkbox" className="form-check-input" defaultChecked={p.startsWith("View")} />{p}</label>)}</div>)}</div>}
          {step === 3 && <div className="pm-card pm-card-pad"><Badge tone="green" dot>Ready for approval</Badge><h6 className="mt-3">New custom role</h6><p className="small text-muted">This role will be saved as a reusable template and require Super Admin approval.</p><div className="d-flex gap-2"><Badge tone="blue">Tier 6</Badge><Badge tone="amber">2FA required</Badge></div></div>}
        </div>
        <div className="pm-modal-foot">
          <button className="btn btn-outline-secondary" onClick={() => step ? setStep(step - 1) : setWizard(false)}>{step ? "Back" : "Cancel"}</button>
          {step < 3 ? <button className="btn btn-primary" onClick={() => setStep(step + 1)}>Continue</button> : <button className="btn btn-primary" onClick={() => { const nm = (document.getElementById("cr-name") as HTMLInputElement)?.value || "Custom Role"; const desc = (document.getElementById("cr-desc") as HTMLInputElement)?.value || ""; handleAddRole({ name: nm, description: desc }); setWizard(false); setStep(0); }}>Submit for approval</button>}
        </div>
      </Modal>

      {/* ======== BULK ASSIGN WIZARD (4-step) ======== */}
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

      {/* ======== ACCESS REVIEW WIZARD (4-step) ======== */}
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

      {/* ======== CLONE ROLE WIZARD (4-step) ======== */}
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

      {/* ======== ACCESS POLICY DRAWER ======== */}
      <AccessPolicyDrawer open={policyDrawer} onClose={() => setPolicyDrawer(false)} />

      {/* ======== ROLE DETAIL DRAWER ======== */}
      <RoleDetailDrawer role={roleDetail} admins={admins} onClose={() => setRoleDetail(null)} />

      {/* ======== PERMISSION CATALOGUE DRAWER ======== */}
      <PermCatalogueDrawer open={catDrawer} onClose={() => setCatDrawer(false)} />

      {/* ======== DOCUMENT MANAGEMENT DRAWER ======== */}
      <DocumentManagementDrawer documents={documents} open={docManager} onClose={() => setDocManager(false)}
        onPreview={doc => { setDocManager(false); setPreviewDoc(doc); }}
        onEdit={doc => { setDocManager(false); setEditDoc(doc); }}
        onDelete={doc => { setDocManager(false); setDeleteDoc(doc); }}
      />

      {/* ======== CRUD MODALS — Roles ======== */}
      <AddRecordModal open={addRole} onClose={() => setAddRole(false)} onAdd={(f) => { handleAddRole(f); setAddRole(false); }} typeName="Role" fields={roleFields.map(f => ({ key: f.key, label: f.label, placeholder: f.placeholder }))} title="" />
      <EditRecordModal open={!!editRole} onClose={() => setEditRole(null)} onSave={(f) => { handleEditRole(f); setEditRole(null); }} record={editRole} typeName="Role" />
      <DeleteRecordWizard open={!!deleteRole} onClose={() => setDeleteRole(null)} onDelete={handleDeleteRole} record={deleteRole} typeName="Role" relatedItems={["Assigned administrators", "Permission grants", "Audit trail entries"]} />
      <LockUnlockModal open={!!lockRole} onClose={() => setLockRole(null)} onToggle={handleLockRole} record={lockRole ? { name: lockRole.name, locked: !!lockRole.locked, lockedBy: lockRole.lockedBy, lockedAt: lockRole.lockedAt, lockReason: lockRole.lockReason } : null} typeName="Role" />

      {/* ======== CRUD MODALS — Changes ======== */}
      <EditRecordModal open={!!editChange} onClose={() => setEditChange(null)} onSave={(f) => { handleEditChange(f); setEditChange(null); }} record={editChange} typeName="Permission Change" />
      <DeleteRecordWizard open={!!deleteChange} onClose={() => setDeleteChange(null)} onDelete={handleDeleteChange} record={deleteChange} typeName="Permission Change" relatedItems={["Audit trail entries"]} />

      {/* ======== CRUD MODALS — Audits ======== */}
      <EditRecordModal open={!!editAudit} onClose={() => setEditAudit(null)} onSave={(f) => { handleEditAudit(f); setEditAudit(null); }} record={editAudit} typeName="Access Audit" />
      <DeleteRecordWizard open={!!deleteAudit} onClose={() => setDeleteAudit(null)} onDelete={handleDeleteAudit} record={deleteAudit} typeName="Access Audit" relatedItems={["Audit trail entries", "Compliance records"]} />

      {/* ======== CRUD MODALS — Policies ======== */}
      <AddRecordModal open={addPolicy} onClose={() => setAddPolicy(false)} onAdd={(f) => { handleAddPolicy(f); setAddPolicy(false); }} typeName="Policy" fields={policyFields.map(f => ({ key: f.key, label: f.label, placeholder: f.placeholder }))} title="" />
      <EditRecordModal open={!!editPolicy} onClose={() => setEditPolicy(null)} onSave={(f) => { handleEditPolicy(f); setEditPolicy(null); }} record={editPolicy} typeName="Access Policy" />
      <DeleteRecordWizard open={!!deletePolicy} onClose={() => setDeletePolicy(null)} onDelete={handleDeletePolicy} record={deletePolicy} typeName="Access Policy" relatedItems={["Enforced permissions", "Audit trail entries"]} />
      <LockUnlockModal open={!!lockPolicy} onClose={() => setLockPolicy(null)} onToggle={handleLockPolicy} record={lockPolicy ? { name: lockPolicy.name, locked: !!lockPolicy.locked, lockedBy: lockPolicy.lockedBy, lockedAt: lockPolicy.lockedAt, lockReason: lockPolicy.lockReason } : null} typeName="Policy" />

      {/* ======== CRUD MODALS — Templates ======== */}
      <AddRecordModal open={addTemplate} onClose={() => setAddTemplate(false)} onAdd={(f) => { handleAddTemplate(f); setAddTemplate(false); }} typeName="Template" fields={templateFields.map(f => ({ key: f.key, label: f.label, placeholder: f.placeholder }))} title="" />
      <EditRecordModal open={!!editTemplate} onClose={() => setEditTemplate(null)} onSave={(f) => { handleEditTemplate(f); setEditTemplate(null); }} record={editTemplate} typeName="Role Template" />
      <DeleteRecordWizard open={!!deleteTemplate} onClose={() => setDeleteTemplate(null)} onDelete={handleDeleteTemplate} record={deleteTemplate} typeName="Role Template" relatedItems={["Roles created from template", "Audit trail entries"]} />
      <LockUnlockModal open={!!lockTemplate} onClose={() => setLockTemplate(null)} onToggle={handleLockTemplate} record={lockTemplate ? { name: lockTemplate.name, locked: !!lockTemplate.locked, lockedBy: lockTemplate.lockedBy, lockedAt: lockTemplate.lockedAt, lockReason: lockTemplate.lockReason } : null} typeName="Template" />

      {/* ======== CRUD MODALS — Admins ======== */}
      <EditRecordModal open={!!editAdmin} onClose={() => setEditAdmin(null)} onSave={(f) => { handleEditAdmin(f); setEditAdmin(null); }} record={editAdmin} typeName="Administrator" excludeKeys={["id", "locked", "lockedBy", "lockedAt", "lockReason", "mfaEnabled", "sessionsActive"]} />
      <DeleteRecordWizard open={!!deleteAdmin} onClose={() => setDeleteAdmin(null)} onDelete={handleDeleteAdmin} record={deleteAdmin} typeName="Administrator" relatedItems={["Active sessions", "Role assignments", "API keys", "MFA credentials", "Audit trail entries"]} />
      <LockUnlockModal open={!!lockAdmin} onClose={() => setLockAdmin(null)} onToggle={handleLockAdmin} record={lockAdmin ? { name: lockAdmin.name, locked: !!lockAdmin.locked, lockedBy: lockAdmin.lockedBy, lockedAt: lockAdmin.lockedAt, lockReason: lockAdmin.lockReason } : null} typeName="Administrator" />

      {/* ======== CRUD MODALS — Documents ======== */}
      <EditRecordModal open={!!editDoc} onClose={() => setEditDoc(null)} onSave={(f) => { handleEditDoc(f); setEditDoc(null); }} record={editDoc} typeName="Document" excludeKeys={["id", "locked", "lockedBy", "lockedAt", "content"]} />
      <DeleteRecordWizard open={!!deleteDoc} onClose={() => setDeleteDoc(null)} onDelete={handleDeleteDoc} record={deleteDoc} typeName="Document" relatedItems={["Role references", "Version history", "Audit trail entries"]} />
      <LockUnlockModal open={!!lockDoc} onClose={() => setLockDoc(null)} onToggle={handleLockDoc} record={lockDoc ? { name: lockDoc.name, locked: !!lockDoc.locked, lockedBy: lockDoc.lockedBy, lockedAt: lockDoc.lockedAt, lockReason: lockDoc.lockReason } : null} typeName="Document" />
      <DocumentPreviewModal doc={previewDoc} open={!!previewDoc} onClose={() => setPreviewDoc(null)} />

      {/* ======== CRUD MODALS — Security Events ======== */}
      <EditRecordModal open={!!editEvent} onClose={() => setEditEvent(null)} onSave={(f) => { handleEditEvent(f); setEditEvent(null); }} record={editEvent} typeName="Security Event" excludeKeys={["id", "locked", "lockedBy", "lockedAt"]} />
      <DeleteRecordWizard open={!!deleteEvent} onClose={() => setDeleteEvent(null)} onDelete={handleDeleteEvent} record={deleteEvent} typeName="Security Event" relatedItems={["Incident reports", "Audit trail entries"]} />

      {/* ======== FEATURE MODALS ======== */}
      <AdminOnboardingWizard open={adminOnboard} onClose={() => setAdminOnboard(false)} onComplete={(a) => { setAdmins(p => [...p, a]); setAdminOnboard(false); }} />
      <AdminOffboardingWizard open={!!adminOffboard} onClose={() => setAdminOffboard(null)} admin={adminOffboard} onComplete={() => { if (adminOffboard) setAdmins(p => p.map(a => a.id === adminOffboard.id ? { ...a, status: "Suspended" } : a)); setAdminOffboard(null); }} />
      <SecurityReviewModal open={securityReview} onClose={() => setSecurityReview(false)} />
      <EmergencyAccessWizard open={emergencyAccess} onClose={() => setEmergencyAccess(false)} />
      <EmergencyAccessRequestModal open={emergencyRequests} onClose={() => setEmergencyRequests(false)} />
      <ComplianceAuditModal open={complianceAudit} onClose={() => setComplianceAudit(false)} />
      <AdminActivityLogModal open={activityLog} onClose={() => setActivityLog(false)} />
      <PermImpactModal open={permImpact} onClose={() => setPermImpact(false)} />
      <RoleComparisonModal open={roleComparison} onClose={() => setRoleComparison(false)} />
      <RoleHierarchyModal open={roleHierarchy} onClose={() => setRoleHierarchy(false)} />
      <PermissionGrantModal open={permGrant} onClose={() => setPermGrant(false)} />
      <BulkPermissionWizard open={bulkPermOps} onClose={() => setBulkPermOps(false)} />
      <PermChangeDiffModal open={permDiff} onClose={() => setPermDiff(false)} />
      <RoleHistoryModal open={historyModal} onClose={() => setHistoryModal(false)} />
      <PermMatrixExportModal open={matrixExport} onClose={() => setMatrixExport(false)} />
      <RevokeAllGrantsModal open={revAllGrants} onClose={() => setRevAllGrants(false)} count={grantedCount} />
      <AssignAdminsModal open={assignAdmins} onClose={() => setAssignAdmins(false)} />
      <TemplateDetailModal open={!!templateDetail} onClose={() => setTemplateDetail(null)} template={templateDetail} />
      <DuplicateRoleModal open={!!duplicateRole} onClose={() => setDuplicateRole(null)} role={duplicateRole} />
      <RetireRoleModal open={!!retireRole} onClose={() => setRetireRole(null)} role={retireRole} />
    </div>
  );
}
