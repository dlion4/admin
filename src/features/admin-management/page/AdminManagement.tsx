import { useCallback, useMemo, useState } from "react";
import { Avatar, Badge, Drawer, Modal, Steps, useToast } from "../../../components/ui";
import { AddRecordModal, EditRecordModal, DeleteRecordWizard, LockUnlockModal } from "../../../components/AdminControls";
import {
  type AdminRecord, type SessionRecord, type ActivityRecord, type PermissionRecord, type PerformanceRecord, type OffboardRecord, type SecuritySetting, type RoleRecord, type InvitationRecord, type AccessLogRecord,
  initialAdmins, initialSessions, initialActivity, initialPermissions, initialPerformance, initialOffboarding, initialSecurity, initialRoles, initialInvitations, initialAccessLogs
} from "../data/adminData";

type A = { title: string; body: React.ReactNode; icon?: string; tone?: "green" | "red" | "amber" | "blue" | "violet" | "ink" };

export function AdminManagement({ signal: _signal }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  const { push } = useToast();
  const [tab, setTab] = useState("directory");
  const [q, setQ] = useState("");
  const [action, setAction] = useState<A | null>(null);
  const [drawer, setDrawer] = useState<string | null>(null);
  const [wizard, setWizard] = useState(false);
  const [step, setStep] = useState(0);

  // Multi-step wizards
  const [termWizard, setTermWizard] = useState<SessionRecord | null>(null);
  const [termStep, setTermStep] = useState(0);
  const [offboardWizard, setOffboardWizard] = useState<AdminRecord | null>(null);
  const [offboardStep, setOffboardStep] = useState(0);
  const [resetAuthWizard, setResetAuthWizard] = useState<AdminRecord | null>(null);
  const [resetStep, setResetStep] = useState(0);
  const [invWizard, setInvWizard] = useState(false);
  const [invStep, setInvStep] = useState(0);

  // Data state
  const [admins, setAdmins] = useState<AdminRecord[]>(initialAdmins);
  const [sessions, setSessions] = useState<SessionRecord[]>(initialSessions);
  const [activity, setActivity] = useState<ActivityRecord[]>(initialActivity);
  const [permissions, setPermissions] = useState<PermissionRecord[]>(initialPermissions);
  const [performance] = useState<PerformanceRecord[]>(initialPerformance);
  const [offboarding, setOffboarding] = useState<OffboardRecord[]>(initialOffboarding);
  const [security, setSecurity] = useState<SecuritySetting[]>(initialSecurity);
  const [roles, setRoles] = useState<RoleRecord[]>(initialRoles);
  const [invitations, setInvitations] = useState<InvitationRecord[]>(initialInvitations);
  const [accessLogs, setAccessLogs] = useState<AccessLogRecord[]>(initialAccessLogs);

  // CRUD modals — Admins
  const [editAdmin, setEditAdmin] = useState<AdminRecord | null>(null);
  const [deleteAdmin, setDeleteAdmin] = useState<AdminRecord | null>(null);
  const [lockAdmin, setLockAdmin] = useState<AdminRecord | null>(null);
  const [addAdmin, setAddAdmin] = useState(false);

  // CRUD modals — Sessions
  const [deleteSession, setDeleteSession] = useState<SessionRecord | null>(null);

  // CRUD modals — Activity
  const [editActivity, setEditActivity] = useState<ActivityRecord | null>(null);
  const [deleteActivity, setDeleteActivity] = useState<ActivityRecord | null>(null);

  // CRUD modals — Permissions
  const [editPermission, setEditPermission] = useState<PermissionRecord | null>(null);
  const [deletePermission, setDeletePermission] = useState<PermissionRecord | null>(null);
  const [lockPermission, setLockPermission] = useState<PermissionRecord | null>(null);
  const [addPermission, setAddPermission] = useState(false);

  // CRUD modals — Offboarding
  const [editOffboard, setEditOffboard] = useState<OffboardRecord | null>(null);
  const [deleteOffboard, setDeleteOffboard] = useState<OffboardRecord | null>(null);

  // CRUD modals — Security
  const [editSecurity, setEditSecurity] = useState<SecuritySetting | null>(null);
  const [lockSecurity, setLockSecurity] = useState<SecuritySetting | null>(null);

  // CRUD modals — Roles
  const [editRole, setEditRole] = useState<RoleRecord | null>(null);
  const [deleteRole, setDeleteRole] = useState<RoleRecord | null>(null);
  const [lockRole, setLockRole] = useState<RoleRecord | null>(null);
  const [addRole, setAddRole] = useState(false);

  // CRUD modals — Invitations
  const [editInv, setEditInv] = useState<InvitationRecord | null>(null);
  const [deleteInv, setDeleteInv] = useState<InvitationRecord | null>(null);
  const [lockInv, setLockInv] = useState<InvitationRecord | null>(null);

  // CRUD modals — Access Logs
  const [deleteAccessLog, setDeleteAccessLog] = useState<AccessLogRecord | null>(null);

  const filtered = useMemo(() => admins.filter(r => [r.name, r.role, r.email, r.status, r.department].join(" ").toLowerCase().includes(q.toLowerCase())), [q, admins]);
  const activeCount = admins.filter(a => a.status === "Active").length;
  const lockedCount = admins.filter(a => a.status === "Locked").length;

  // CRUD handlers — Admins
  const handleAddAdmin = useCallback((form: Record<string, string>) => {
    setAdmins(p => [{ id: `adm-${Date.now()}`, name: form.name || "New Admin", role: form.role || "Support Agent", email: form.email || "admin@paymo.co.ke", status: "Active", lastLogin: "Never", sessions: "0", twoFA: "Pending", passkey: "Not registered", department: form.department || "—", phone: form.phone || "—", joinDate: new Date().toLocaleDateString() }, ...p]);
    push({ kind: "success", title: "Admin created", body: "Invitation sent to the new administrator." });
  }, [push]);
  const handleEditAdmin = useCallback((form: Record<string, string>) => { if (!editAdmin) return; setAdmins(p => p.map(a => a.id === editAdmin.id ? { ...a, ...form } : a)); }, [editAdmin]);
  const handleDeleteAdmin = useCallback(() => { if (!deleteAdmin) return; setAdmins(p => p.filter(a => a.id !== deleteAdmin.id)); }, [deleteAdmin]);
  const handleLockAdmin = useCallback((locked: boolean) => { if (!lockAdmin) return; setAdmins(p => p.map(a => a.id === lockAdmin.id ? { ...a, status: locked ? "Locked" : "Active", locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Admin lock" : undefined } : a)); }, [lockAdmin]);

  // CRUD handlers — Sessions
  const handleTerminateSession = useCallback(() => { if (!deleteSession) return; setSessions(p => p.filter(s => s.id !== deleteSession.id)); push({ kind: "success", title: "Session terminated", body: `${deleteSession.sessionId} has been killed.` }); }, [deleteSession, push]);

  // CRUD handlers — Activity
  const handleEditActivity = useCallback((form: Record<string, string>) => { if (!editActivity) return; setActivity(p => p.map(a => a.id === editActivity.id ? { ...a, ...form } : a)); }, [editActivity]);
  const handleDeleteActivity = useCallback(() => { if (!deleteActivity) return; setActivity(p => p.filter(a => a.id !== deleteActivity.id)); }, [deleteActivity]);

  // CRUD handlers — Permissions
  const handleAddPermission = useCallback((form: Record<string, string>) => { setPermissions(p => [{ id: `pm-${Date.now()}`, admin: form.admin || "New Admin", role: form.role || "Support Agent", permissions: form.permissions || "Read-only", lastModified: new Date().toLocaleDateString(), modifiedBy: "Super Admin" }, ...p]); }, []);
  const handleEditPermission = useCallback((form: Record<string, string>) => { if (!editPermission) return; setPermissions(p => p.map(pm => pm.id === editPermission.id ? { ...pm, ...form } : pm)); }, [editPermission]);
  const handleDeletePermission = useCallback(() => { if (!deletePermission) return; setPermissions(p => p.filter(pm => pm.id !== deletePermission.id)); }, [deletePermission]);
  const handleLockPermission = useCallback((locked: boolean) => { if (!lockPermission) return; setPermissions(p => p.map(pm => pm.id === lockPermission.id ? { ...pm, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Admin lock" : undefined } : pm)); }, [lockPermission]);

  // CRUD handlers — Offboarding
  const handleEditOffboard = useCallback((form: Record<string, string>) => { if (!editOffboard) return; setOffboarding(p => p.map(o => o.id === editOffboard.id ? { ...o, ...form } : o)); }, [editOffboard]);
  const handleDeleteOffboard = useCallback(() => { if (!deleteOffboard) return; setOffboarding(p => p.filter(o => o.id !== deleteOffboard.id)); }, [deleteOffboard]);

  // CRUD handlers — Security
  const handleEditSecurity = useCallback((form: Record<string, string>) => { if (!editSecurity) return; setSecurity(p => p.map(s => s.id === editSecurity.id ? { ...s, ...form } : s)); }, [editSecurity]);
  const handleLockSecurity = useCallback((locked: boolean) => { if (!lockSecurity) return; setSecurity(p => p.map(s => s.id === lockSecurity.id ? { ...s, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Admin lock" : undefined } : s)); }, [lockSecurity]);

  // CRUD handlers — Roles
  const handleAddRole = useCallback((form: Record<string, string>) => { setRoles(p => [{ id: `rl-${Date.now()}`, name: form.name || "New Role", tier: form.tier || "Tier 6", admins: "0", permissions: form.permissions || "Read-only", created: new Date().toLocaleDateString(), status: "Active" }, ...p]); }, []);
  const handleEditRole = useCallback((form: Record<string, string>) => { if (!editRole) return; setRoles(p => p.map(r => r.id === editRole.id ? { ...r, ...form } : r)); }, [editRole]);
  const handleDeleteRole = useCallback(() => { if (!deleteRole) return; setRoles(p => p.filter(r => r.id !== deleteRole.id)); }, [deleteRole]);
  const handleLockRole = useCallback((locked: boolean) => { if (!lockRole) return; setRoles(p => p.map(r => r.id === lockRole.id ? { ...r, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Admin lock" : undefined } : r)); }, [lockRole]);

  // CRUD handlers — Invitations
  const handleEditInv = useCallback((form: Record<string, string>) => { if (!editInv) return; setInvitations(p => p.map(i => i.id === editInv.id ? { ...i, ...form } : i)); }, [editInv]);
  const handleDeleteInv = useCallback(() => { if (!deleteInv) return; setInvitations(p => p.filter(i => i.id !== deleteInv.id)); }, [deleteInv]);
  const handleLockInv = useCallback((locked: boolean) => { if (!lockInv) return; setInvitations(p => p.map(i => i.id === lockInv.id ? { ...i, locked, lockedBy: locked ? "Super Admin" : undefined } : i)); }, [lockInv]);

  // CRUD handlers — Access Logs
  const handleDeleteAccessLog = useCallback(() => { if (!deleteAccessLog) return; setAccessLogs(p => p.filter(l => l.id !== deleteAccessLog.id)); }, [deleteAccessLog]);

  // Multi-step: Terminate session
  const handleTerminateMultiStep = useCallback(() => {
    if (!termWizard) return;
    setSessions(p => p.filter(s => s.id !== termWizard.id));
    setTermWizard(null);
    setTermStep(0);
    push({ kind: "success", title: "Session terminated", body: `Session ${termWizard.sessionId} for ${termWizard.admin} has been killed and logged.` });
  }, [termWizard, push]);

  // Multi-step: Offboarding
  const handleOffboardComplete = useCallback(() => {
    if (!offboardWizard) return;
    const newOff: OffboardRecord = { id: `of-${Date.now()}`, admin: offboardWizard.name, deactivationDate: new Date().toLocaleDateString(), reason: "Offboarded", accessRevoked: "All", dataExported: "Yes", exitInterview: "Pending" };
    setOffboarding(p => [newOff, ...p]);
    setAdmins(p => p.filter(a => a.id !== offboardWizard.id));
    setOffboardWizard(null);
    setOffboardStep(0);
    push({ kind: "success", title: "Offboarding complete", body: `${offboardWizard.name} has been fully offboarded.` });
  }, [offboardWizard, push]);

  // Multi-step: Reset auth
  const handleResetAuthComplete = useCallback(() => {
    if (!resetAuthWizard) return;
    setResetAuthWizard(null);
    setResetStep(0);
    push({ kind: "success", title: "Authentication reset", body: `TOTP for ${resetAuthWizard.name} has been reset. They must re-enroll.` });
  }, [resetAuthWizard, push]);

  const adminFields = [{ label: "name", placeholder: "Full name", required: true }, { label: "email", placeholder: "Corporate email", required: true }, { label: "role", placeholder: "Role tier" }, { label: "department", placeholder: "Department" }, { label: "phone", placeholder: "Phone number" }];
  const permissionFields = [{ label: "admin", placeholder: "Admin name", required: true }, { label: "role", placeholder: "Role tier" }, { label: "permissions", placeholder: "Permission set" }];
  const roleFields = [{ label: "name", placeholder: "Role name", required: true }, { label: "tier", placeholder: "Tier 1–6" }, { label: "permissions", placeholder: "Permission description" }];

  return (
    <div className="pm-page-content admin-page">
      {/* Header */}
      <div className="pm-section-head" style={{ marginTop: 0 }}>
        <div>
          <div className="pm-eyebrow">PLATFORM ADMINISTRATION / PAGE 29</div>
          <h2 className="mb-1">Admin Management</h2>
          <p>Manage privileged administrator accounts, sessions, roles, security controls and offboarding.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setAction({ title: "Compliance Audit Trail", body: <div><p>All admin account changes, session events and permission modifications are audit-logged with immutable timestamps.</p><div className="mt-3 pm-card pm-card-pad">{[["Account changes", "847 in 30d"], ["Session events", "12,345 in 30d"], ["Permission changes", "23 in 30d"], ["Security events", "5 in 30d"]].map(([k, v]) => <div className="d-flex justify-content-between py-1 border-bottom small" key={k}><span className="text-muted">{k}</span><b>{v}</b></div>)}</div></div>, tone: "blue", icon: "bi-clock-history" })}><i className="bi bi-clock-history me-1" />Audit trail</button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => setDrawer("sessions")}><i className="bi bi-laptop me-1" />Active sessions ({sessions.length})</button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => { setInvStep(0); setInvWizard(true); }}><i className="bi bi-envelope-plus me-1" />Invite admin</button>
          <button className="btn btn-primary btn-sm" onClick={() => { setStep(0); setWizard(true); }}><i className="bi bi-person-plus me-1" />Create admin</button>
        </div>
      </div>

      {/* Hero */}
      <div className="pm-hero admin-hero mb-3">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <div className="pm-eyebrow text-white-50">PRIVILEGED ACCESS · MONITORED</div>
            <div className="pm-hero-value">{admins.length} <span className="fs-6 fw-normal text-white-50">admin accounts</span></div>
            <div className="small text-white-50 mt-2">{activeCount} active · {lockedCount} locked · {admins.filter(a => a.passkey === "Registered").length} passkeys · all privileged actions audited</div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <div className="pm-hero-chip"><div className="l">Active sessions</div><div className="v">{sessions.length}</div></div>
            <div className="pm-hero-chip"><div className="l">2FA coverage</div><div className="v text-success">100%</div></div>
            <div className="pm-hero-chip"><div className="l">Pending invites</div><div className="v text-warning">{invitations.filter(i => i.status === "Pending").length}</div></div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-3">
        {[
          ["Admin accounts", String(admins.length), `${roles.length} role tiers`, "bi-people", "green"],
          ["Active sessions", String(sessions.length), "All from approved locations", "bi-laptop", "blue"],
          ["Roles defined", String(roles.length), "Hierarchical permission model", "bi-diagram-3", "violet"],
          ["Security alerts", String(lockedCount), "Locked accounts", "bi-shield-exclamation", "amber"]
        ].map(x => <div className="col-6 col-xl-3" key={x[0]}><div className="pm-stat"><div className={`pm-stat-ico bg-${x[4]}-soft text-${x[4]}`}><i className={`bi ${x[3]}`} /></div><div className="pm-stat-label">{x[0]}</div><div className="pm-stat-value">{x[1]}</div><div className="pm-stat-foot">{x[2]}</div></div></div>)}
      </div>

      {/* Tabs */}
      <div className="pm-card mb-3">
        <div className="pm-tabs">
          {[
            ["directory", "Admin directory", "bi-people"], ["roles", "Role management", "bi-diagram-3"],
            ["sessions", "Sessions", "bi-laptop"], ["activity", "Activity feed", "bi-list-check"],
            ["permissions", "Permission editor", "bi-key"], ["invitations", "Invitations", "bi-envelope"],
            ["performance", "Performance", "bi-bar-chart-line"], ["access-logs", "Access logs", "bi-shield-lock"],
            ["offboarding", "Offboarding", "bi-person-x"], ["security", "Security settings", "bi-gear"]
          ].map(x => <button className={`pm-tab ${tab === x[0] ? "active" : ""}`} key={x[0]} onClick={() => setTab(x[0])}><i className={`bi ${x[2]}`} />{x[1]}</button>)}
        </div>
      </div>

      {/* === DIRECTORY TAB === */}
      {tab === "directory" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Admin directory</h3><p>Privileged access inventory with authentication posture and current sessions.</p></div>
          <div className="d-flex gap-2 align-items-center">
            <div className="pm-search"><i className="bi bi-search" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search admin, role or email" /></div>
            <button className="btn btn-primary btn-sm" onClick={() => setAddAdmin(true)}><i className="bi bi-plus me-1" />Add admin</button>
          </div>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Admin</th><th>Role</th><th>Email</th><th>Status</th><th>Last login</th><th>2FA</th><th>Passkey</th><th className="text-end">Actions</th></tr></thead><tbody>
            {filtered.map(r => <tr key={r.id}>
              <td className="pm-td-strong"><div className="d-flex align-items-center gap-2"><Avatar name={r.name} size="sm" />{r.name}{r.locked && <i className="bi bi-lock-fill text-warning" style={{ fontSize: ".7rem" }} />}</div></td>
              <td>{r.role}</td>
              <td>{r.email}</td>
              <td><Badge tone={r.status === "Locked" ? "red" : "green"} dot>{r.status}</Badge></td>
              <td>{r.lastLogin}</td>
              <td><Badge tone="green">{r.twoFA}</Badge></td>
              <td><Badge tone={r.passkey === "Registered" ? "green" : "amber"}>{r.passkey}</Badge></td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditAdmin(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setLockAdmin(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteAdmin(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* === ROLES TAB === */}
      {tab === "roles" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Role management</h3><p>Define role tiers, permission sets and admin-to-role assignments.</p></div>
          <button className="btn btn-primary btn-sm" onClick={() => setAddRole(true)}><i className="bi bi-plus me-1" />Add role</button>
        </div>
        <div className="row g-3 mb-3">
          {roles.slice(0, 4).map(r => <div className="col-md-6 col-xl-3" key={r.id}>
            <div className="pm-card pm-card-pad">
              <div className="d-flex justify-content-between"><Badge tone={r.tier === "Tier 1" ? "red" : r.tier === "Tier 2" ? "amber" : "blue"}>{r.tier}</Badge>
                <div className="d-flex gap-1">
                  <button className="btn btn-sm btn-outline-primary" onClick={() => setEditRole(r)}><i className="bi bi-pencil" /></button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteRole(r)}><i className="bi bi-trash3" /></button>
                </div>
              </div>
              <h6 className="mt-2 mb-1">{r.name}</h6>
              <div className="small text-muted mb-2">{r.permissions}</div>
              <div className="d-flex justify-content-between"><span className="small text-muted">{r.admins} admin(s)</span><Badge tone="green" dot>{r.status}</Badge></div>
            </div>
          </div>)}
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Role</th><th>Tier</th><th>Admins</th><th>Permissions</th><th>Created</th><th className="text-end">Actions</th></tr></thead><tbody>
            {roles.map(r => <tr key={r.id}>
              <td className="pm-td-strong">{r.name}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td>
              <td><Badge tone={r.tier === "Tier 1" ? "red" : r.tier === "Tier 2" ? "amber" : "blue"}>{r.tier}</Badge></td>
              <td className="pm-num">{r.admins}</td>
              <td>{r.permissions}</td>
              <td>{r.created}</td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditRole(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setLockRole(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteRole(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* === SESSIONS TAB === */}
      {tab === "sessions" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Admin session management</h3><p>Active sessions, location posture and expiry controls.</p></div>
          <button className="btn btn-outline-danger btn-sm" onClick={() => { setTermStep(0); setTermWizard(sessions[0] || null); }} disabled={sessions.length === 0}><i className="bi bi-power me-1" />Terminate idle</button>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Admin</th><th>Session</th><th>Login</th><th>IP</th><th>Device</th><th>Location</th><th>Idle</th><th>Expires</th><th className="text-end">Action</th></tr></thead><tbody>
            {sessions.map(r => <tr key={r.id}>
              <td className="pm-td-strong">{r.admin}</td>
              <td className="mono">{r.sessionId}</td>
              <td>{r.loginTime}</td>
              <td className="mono">{r.ip}</td>
              <td>{r.device}</td>
              <td>{r.location}</td>
              <td>{r.idle}</td>
              <td>{r.expires}</td>
              <td className="text-end"><button className="btn btn-sm btn-outline-danger" onClick={() => { setTermStep(0); setTermWizard(r); }} title="Terminate"><i className="bi bi-power" /></button></td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* === ACTIVITY TAB === */}
      {tab === "activity" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Admin activity feed</h3><p>Immutable activity across all administrator accounts.</p></div>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setAction({ title: "Export admin activity", body: <div><p>The last 30 days of admin activity will be exported with IP and target details.</p><div className="mt-2"><label className="form-label">Date range</label><select className="form-select"><option>Last 30 days</option><option>Last 7 days</option><option>Last 90 days</option></select></div></div>, tone: "blue", icon: "bi-download" })}><i className="bi bi-download me-1" />Export</button>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Time</th><th>Admin</th><th>Action</th><th>Target</th><th>Details</th><th>IP</th><th className="text-end">Actions</th></tr></thead><tbody>
            {activity.map(r => <tr key={r.id}>
              <td className="mono">{r.time}</td>
              <td className="pm-td-strong">{r.admin}</td>
              <td className="pm-td-strong">{r.action}</td>
              <td>{r.target}</td>
              <td>{r.details}</td>
              <td className="mono">{r.ip}</td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditActivity(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteActivity(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* === PERMISSIONS TAB === */}
      {tab === "permissions" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Admin permission editor</h3><p>Custom permission sets for non-standard role access.</p></div>
          <button className="btn btn-primary btn-sm" onClick={() => setAddPermission(true)}><i className="bi bi-plus me-1" />Add permission</button>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Admin</th><th>Role</th><th>Custom permissions</th><th>Last modified</th><th>Modified by</th><th className="text-end">Actions</th></tr></thead><tbody>
            {permissions.map(r => <tr key={r.id}>
              <td className="pm-td-strong">{r.admin}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td>
              <td>{r.role}</td>
              <td>{r.permissions}</td>
              <td>{r.lastModified}</td>
              <td>{r.modifiedBy}</td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditPermission(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setLockPermission(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeletePermission(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* === INVITATIONS TAB === */}
      {tab === "invitations" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Admin invitations</h3><p>Pending, active and expired privileged account invitations.</p></div>
          <button className="btn btn-primary btn-sm" onClick={() => { setInvStep(0); setInvWizard(true); }}><i className="bi bi-envelope-plus me-1" />Send invitation</button>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Email</th><th>Role</th><th>Invited by</th><th>Sent</th><th>Expires</th><th>Status</th><th className="text-end">Actions</th></tr></thead><tbody>
            {invitations.map(r => <tr key={r.id}>
              <td className="pm-td-strong">{r.email}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td>
              <td>{r.role}</td>
              <td>{r.invitedBy}</td>
              <td>{r.sentDate}</td>
              <td>{r.expiry}</td>
              <td><Badge tone={r.status === "Active" ? "green" : r.status === "Pending" ? "amber" : "grey"} dot>{r.status}</Badge></td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditInv(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setLockInv(r)} title="Revoke"><i className="bi bi-x-circle" /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteInv(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* === PERFORMANCE TAB === */}
      {tab === "performance" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Admin performance metrics</h3><p>Workload and operational output over the last 30 days.</p></div>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setAction({ title: "Performance report", body: <div><p>The administrator performance report covers actions, ticket resolution, SAR filings and session patterns.</p><div className="mt-3">{[["Top performer", "Samuel K. — 678 actions"], ["Most tickets", "Grace M. — 456 resolved"], ["Most SARs", "David K. — 8 filed"], ["Lowest activity", "Joseph M. — 234 actions (focused on settlements)"]].map(([k, v]) => <div className="d-flex justify-content-between py-1 border-bottom small" key={k}><span className="text-muted">{k}</span><b>{v}</b></div>)}</div></div>, tone: "blue", icon: "bi-bar-chart-line" })}><i className="bi bi-download me-1" />Export</button>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Admin</th><th>Actions (30d)</th><th>Users managed</th><th>Tickets resolved</th><th>SARs filed</th><th>Avg session</th></tr></thead><tbody>
            {performance.map(r => <tr key={r.id}>
              <td className="pm-td-strong">{r.admin}</td>
              <td className="pm-num">{r.actions}</td>
              <td className="pm-num">{r.usersManaged}</td>
              <td className="pm-num">{r.ticketsResolved}</td>
              <td className="pm-num">{r.sarsFiled}</td>
              <td>{r.avgSession}</td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* === ACCESS LOGS TAB === */}
      {tab === "access-logs" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Access logs</h3><p>Granular resource-level access events for all admin accounts.</p></div>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setAction({ title: "Export access logs", body: <div><p>Export granular access logs with resource, action and result details.</p></div>, tone: "blue", icon: "bi-download" })}><i className="bi bi-download me-1" />Export</button>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Timestamp</th><th>Admin</th><th>Action</th><th>Resource</th><th>Result</th><th>IP</th><th>Device</th><th className="text-end">Actions</th></tr></thead><tbody>
            {accessLogs.map(r => <tr key={r.id}>
              <td className="mono">{r.timestamp}</td>
              <td className="pm-td-strong">{r.admin}</td>
              <td>{r.action}</td>
              <td>{r.resource}</td>
              <td><Badge tone={r.result === "Success" ? "green" : r.result === "Failure" ? "red" : "amber"} dot>{r.result}</Badge></td>
              <td className="mono">{r.ip}</td>
              <td>{r.device}</td>
              <td className="text-end"><button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteAccessLog(r)} title="Delete"><i className="bi bi-trash3" /></button></td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* === OFFBOARDING TAB === */}
      {tab === "offboarding" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Admin deactivation & offboarding</h3><p>Revoke access, export evidence and archive departing administrators.</p></div>
          <button className="btn btn-outline-danger btn-sm" onClick={() => { setOffboardStep(0); setOffboardWizard(admins[0] || null); }} disabled={admins.length === 0}><i className="bi bi-person-x me-1" />Start offboarding</button>
        </div>
        <div className="row g-3">
          <div className="col-lg-7">
            <div className="pm-card">
              <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Admin</th><th>Date</th><th>Reason</th><th>Revoked</th><th>Exported</th><th>Interview</th><th className="text-end">Actions</th></tr></thead><tbody>
                {offboarding.map(r => <tr key={r.id}>
                  <td className="pm-td-strong">{r.admin}</td>
                  <td>{r.deactivationDate}</td>
                  <td>{r.reason}</td>
                  <td><Badge tone="green" dot>{r.accessRevoked}</Badge></td>
                  <td><Badge tone="green" dot>{r.dataExported}</Badge></td>
                  <td><Badge tone={r.exitInterview === "Completed" ? "green" : "amber"} dot>{r.exitInterview}</Badge></td>
                  <td className="text-end text-nowrap">
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditOffboard(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteOffboard(r)} title="Delete"><i className="bi bi-trash3" /></button>
                  </td>
                </tr>)}
              </tbody></table></div>
            </div>
          </div>
          <div className="col-lg-5">
            <div className="pm-card pm-card-pad"><h6>Offboarding checklist</h6>
              {["Disable all sessions", "Revoke API keys", "Remove shared resources", "Change shared passwords", "Revoke passkey", "Disable TOTP", "Export audit trail", "Notify all teams", "Archive profile"].map(x => <div className="d-flex gap-2 align-items-center py-2 border-bottom" key={x}><i className="bi bi-check-circle-fill text-success" /><span className="small">{x}</span><Badge tone="green" className="ms-auto">Done</Badge></div>)}
            </div>
          </div>
        </div>
      </section>}

      {/* === SECURITY TAB === */}
      {tab === "security" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Admin security settings</h3><p>Global guardrails for privileged access and session protection.</p></div>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Setting</th><th>Value</th><th>Scope</th><th>Status</th><th className="text-end">Actions</th></tr></thead><tbody>
            {security.map(r => <tr key={r.id}>
              <td className="pm-td-strong">{r.setting}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td>
              <td>{r.value}</td>
              <td>{r.scope}</td>
              <td><Badge tone="green" dot>{r.status}</Badge></td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditSecurity(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setLockSecurity(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* ====== GENERIC ACTION MODAL ====== */}
      <Modal open={!!action} onClose={() => setAction(null)} title={action?.title ?? "Admin action"} subtitle="Super Admin action · all privileged changes are logged" icon={action?.icon} tone={action?.tone}>
        <div className="pm-modal-body">{action?.body}</div>
        <div className="pm-modal-foot">
          <button className="btn btn-outline-secondary" onClick={() => setAction(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { setAction(null); push({ kind: "success", title: "Action completed", body: "The change was recorded in the audit trail." }); }}>Confirm</button>
        </div>
      </Modal>

      {/* ====== CREATE ADMIN WIZARD (4-step) ====== */}
      <Modal open={wizard} onClose={() => setWizard(false)} title="Create administrator" subtitle={`Step ${step + 1} of 4`} icon="bi-person-plus" tone="green" size="lg">
        <Steps current={step} steps={[{ label: "Identity", icon: "bi-person" }, { label: "Role", icon: "bi-diagram-3" }, { label: "Security", icon: "bi-shield-lock" }, { label: "Review", icon: "bi-check2" }]} />
        <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 25}%` }} /></div>
        <div className="pm-modal-body">
          {step === 0 && <div className="row g-3"><div className="col-md-6"><label className="form-label">Full name</label><input className="form-control" id="c-name" placeholder="Administrator name" /></div><div className="col-md-6"><label className="form-label">Corporate email</label><input className="form-control" id="c-email" placeholder="admin@paymo.co.ke" /></div><div className="col-md-6"><label className="form-label">Phone</label><input className="form-control" id="c-phone" placeholder="+254 700 XXX XXX" /></div><div className="col-md-6"><label className="form-label">Department</label><select className="form-select" id="c-dept"><option>Platform</option><option>Operations</option><option>Finance</option><option>Compliance</option><option>Support</option><option>Risk</option><option>Analytics</option></select></div></div>}
          {step === 1 && <div className="row g-3"><div className="col-md-6"><label className="form-label">Role tier</label><select className="form-select" id="c-role"><option>Platform Admin</option><option>Operations Manager</option><option>Finance Manager</option><option>Compliance Officer</option><option>Support Lead</option><option>Minor Admin</option><option>Analyst</option><option>Support Agent</option></select></div><div className="col-md-6"><label className="form-label">Reports to</label><select className="form-select"><option>Jeckonia Kwasa · Super Admin</option><option>Sarah Kiptoo · Platform Admin</option></select></div><div className="col-12"><label className="form-label">Custom permissions</label><textarea className="form-control" rows={3} placeholder="Leave blank for role defaults" /></div></div>}
          {step === 2 && <div className="row g-3"><div className="col-md-6"><label className="form-label">2FA requirement</label><select className="form-select"><option>Required (default)</option><option>Optional</option></select></div><div className="col-md-6"><label className="form-label">Passkey requirement</label><select className="form-select"><option>Required for Super Admin + Platform Admin</option><option>Optional for all</option><option>Disabled</option></select></div><div className="col-md-6"><label className="form-label">Session duration</label><select className="form-select"><option>8 hours (default)</option><option>4 hours</option><option>2 hours</option></select></div><div className="col-md-6"><label className="form-label">IP restriction</label><select className="form-select"><option>Office + VPN (default)</option><option>VPN only</option><option>Unrestricted</option></select></div></div>}
          {step === 3 && <div className="pm-card pm-card-pad"><Badge tone="green" dot>Ready to create</Badge><h6 className="mt-3">New privileged administrator</h6><p className="small text-muted">The invitation will require TOTP setup, corporate email verification and a separate session PIN issuance.</p><ul className="small text-muted"><li>Role hierarchy validation enabled</li><li>Passkey registration available</li><li>All actions recorded for 7 years</li></ul></div>}
        </div>
        <div className="pm-modal-foot">
          <button className="btn btn-outline-secondary" onClick={() => step ? setStep(step - 1) : setWizard(false)}>{step ? "Back" : "Cancel"}</button>
          {step < 3 ? <button className="btn btn-primary" onClick={() => setStep(step + 1)}>Continue <i className="bi bi-arrow-right ms-1" /></button> : <button className="btn btn-primary" onClick={() => { const nm = (document.getElementById("c-name") as HTMLInputElement)?.value || "New Admin"; const em = (document.getElementById("c-email") as HTMLInputElement)?.value || "admin@paymo.co.ke"; const rl = (document.getElementById("c-role") as HTMLSelectElement)?.value || "Support Agent"; handleAddAdmin({ name: nm, email: em, role: rl }); setWizard(false); setStep(0); }}>Create administrator</button>}
        </div>
      </Modal>

      {/* ====== TERMINATE SESSION WIZARD (4-step) ====== */}
      <Modal open={!!termWizard} onClose={() => { setTermWizard(null); setTermStep(0); }} title="Terminate session" subtitle={`Step ${termStep + 1} of 4`} icon="bi-power" tone="red" size="lg">
        <Steps current={termStep} steps={[{ label: "Identify", icon: "bi-laptop" }, { label: "Impact", icon: "bi-exclamation-triangle" }, { label: "Confirm", icon: "bi-shield-lock" }, { label: "Execute", icon: "bi-check2" }]} />
        <div className="pm-wizard-progress"><span style={{ width: `${(termStep + 1) * 25}%` }} /></div>
        <div className="pm-modal-body">
          {termStep === 0 && termWizard && <div><div className="pm-card pm-card-pad mb-3"><h6>Session details</h6>{[["Admin", termWizard.admin], ["Session", termWizard.sessionId], ["Device", termWizard.device], ["IP", termWizard.ip], ["Location", termWizard.location], ["Login time", termWizard.loginTime], ["Idle", termWizard.idle]].map(([k, v]) => <div className="d-flex justify-content-between py-1 border-bottom small" key={String(k)}><span className="text-muted">{String(k)}</span><b>{String(v)}</b></div>)}</div></div>}
          {termStep === 1 && <div><div className="alert alert-warning small"><i className="bi bi-exclamation-triangle me-1" />Terminating this session will immediately invalidate all active tokens for this session.</div><div className="pm-card pm-card-pad"><h6>Impact assessment</h6>{[["Active requests", "May be interrupted"], ["Unsaved changes", "Could be lost"], ["User notification", "Will be sent"], ["Audit log", "Will be recorded"]].map(([k, v]) => <div className="d-flex justify-content-between py-1 border-bottom small" key={k}><span className="text-muted">{k}</span><b>{v}</b></div>)}</div></div>}
          {termStep === 2 && <div><div className="mb-3"><label className="form-label" style={{ color: "var(--pm-danger)" }}>Type TERMINATE to confirm</label><input className="form-control" id="term-confirm" style={{ borderColor: "var(--pm-danger)" }} placeholder="Type TERMINATE" /></div><label className="d-flex align-items-center gap-2"><input type="checkbox" className="form-check-input" id="term-ack" />I understand this action is immediate and irreversible</label></div>}
          {termStep === 3 && termWizard && <div className="pm-card pm-card-pad"><Badge tone="green" dot>Ready to terminate</Badge><h6 className="mt-3">Session {termWizard.sessionId}</h6><p className="small text-muted">The session will be terminated immediately. The admin will need to re-authenticate.</p><div className="mt-2">{[["Session", termWizard.sessionId], ["Admin", termWizard.admin], ["Action", "Immediate termination"], ["Audit", "Will be recorded"]].map(([k, v]) => <div className="d-flex justify-content-between py-1 border-bottom small" key={k}><span className="text-muted">{k}</span><b>{v}</b></div>)}</div></div>}
        </div>
        <div className="pm-modal-foot">
          <button className="btn btn-outline-secondary" onClick={() => termStep > 0 ? setTermStep(termStep - 1) : (setTermWizard(null), setTermStep(0))}>{termStep > 0 ? "Back" : "Cancel"}</button>
          {termStep < 3 ? <button className="btn btn-primary" onClick={() => setTermStep(termStep + 1)}>Continue</button> : <button className="btn btn-danger" onClick={handleTerminateMultiStep}><i className="bi bi-power me-1" />Terminate session</button>}
        </div>
      </Modal>

      {/* ====== OFFBOARDING WIZARD (4-step) ====== */}
      <Modal open={!!offboardWizard} onClose={() => { setOffboardWizard(null); setOffboardStep(0); }} title="Offboard administrator" subtitle={`Step ${offboardStep + 1} of 4`} icon="bi-person-x" tone="red" size="lg">
        <Steps current={offboardStep} steps={[{ label: "Select", icon: "bi-person" }, { label: "Revoke", icon: "bi-key" }, { label: "Export", icon: "bi-download" }, { label: "Confirm", icon: "bi-check2" }]} />
        <div className="pm-wizard-progress"><span style={{ width: `${(offboardStep + 1) * 25}%` }} /></div>
        <div className="pm-modal-body">
          {offboardStep === 0 && offboardWizard && <div><div className="pm-card pm-card-pad mb-3"><h6>Administrator to offboard</h6>{[["Name", offboardWizard.name], ["Role", offboardWizard.role], ["Email", offboardWizard.email], ["Sessions", offboardWizard.sessions], ["Join date", offboardWizard.joinDate]].map(([k, v]) => <div className="d-flex justify-content-between py-1 border-bottom small" key={k}><span className="text-muted">{k}</span><b>{v}</b></div>)}</div><div className="alert alert-danger small"><i className="bi bi-exclamation-triangle me-1" />This will permanently revoke all access for this administrator.</div></div>}
          {offboardStep === 1 && <div><h6>Access revocation checklist</h6>{["Disable all active sessions", "Revoke API keys and tokens", "Remove from shared resources", "Change shared passwords", "Revoke passkey registration", "Disable TOTP authenticator"].map(x => <label key={x} className="d-flex align-items-center gap-2 mb-2" style={{ fontSize: ".85rem" }}><input type="checkbox" className="form-check-input" defaultChecked />{x}</label>)}</div>}
          {offboardStep === 2 && <div><h6>Data export</h6><p className="small text-muted">Export all data associated with this administrator account.</p>{["Export audit trail (7 years)", "Export user activity logs", "Export file access history", "Export email communications"].map(x => <label key={x} className="d-flex align-items-center gap-2 mb-2" style={{ fontSize: ".85rem" }}><input type="checkbox" className="form-check-input" defaultChecked />{x}</label>)}</div>}
          {offboardStep === 3 && offboardWizard && <div className="pm-card pm-card-pad"><Badge tone="red" dot>Final confirmation</Badge><h6 className="mt-3">Offboard {offboardWizard.name}?</h6><p className="small text-muted">This action will:</p><ul className="small text-muted"><li>Immediately revoke all access</li><li>Terminate all active sessions</li><li>Export and archive all data</li><li>Record in the immutable audit trail</li></ul></div>}
        </div>
        <div className="pm-modal-foot">
          <button className="btn btn-outline-secondary" onClick={() => offboardStep > 0 ? setOffboardStep(offboardStep - 1) : (setOffboardWizard(null), setOffboardStep(0))}>{offboardStep > 0 ? "Back" : "Cancel"}</button>
          {offboardStep < 3 ? <button className="btn btn-primary" onClick={() => setOffboardStep(offboardStep + 1)}>Continue</button> : <button className="btn btn-danger" onClick={handleOffboardComplete}><i className="bi bi-person-x me-1" />Complete offboarding</button>}
        </div>
      </Modal>

      {/* ====== RESET AUTH WIZARD (4-step) ====== */}
      <Modal open={!!resetAuthWizard} onClose={() => { setResetAuthWizard(null); setResetStep(0); }} title="Reset authentication" subtitle={`Step ${resetStep + 1} of 4`} icon="bi-arrow-repeat" tone="amber" size="lg">
        <Steps current={resetStep} steps={[{ label: "Identify", icon: "bi-person" }, { label: "Reason", icon: "bi-chat-text" }, { label: "Approve", icon: "bi-shield-lock" }, { label: "Execute", icon: "bi-check2" }]} />
        <div className="pm-wizard-progress"><span style={{ width: `${(resetStep + 1) * 25}%` }} /></div>
        <div className="pm-modal-body">
          {resetStep === 0 && resetAuthWizard && <div className="pm-card pm-card-pad">{[["Admin", resetAuthWizard.name], ["Email", resetAuthWizard.email], ["Current 2FA", resetAuthWizard.twoFA], ["Passkey", resetAuthWizard.passkey]].map(([k, v]) => <div className="d-flex justify-content-between py-1 border-bottom small" key={k}><span className="text-muted">{k}</span><b>{v}</b></div>)}</div>}
          {resetStep === 1 && <div><label className="form-label">Reason for reset</label><select className="form-select mb-3"><option>Device lost or compromised</option><option>Employee left company</option><option>Security incident</option><option>Account recovery</option></select><label className="form-label">Additional notes</label><textarea className="form-control" rows={3} placeholder="Provide context for the reset..." /></div>}
          {resetStep === 2 && <div className="alert alert-warning small"><i className="bi bi-shield-lock me-1" />TOTP reset requires a second Super Admin to approve. An approval request has been sent.</div>}
          {resetStep === 3 && resetAuthWizard && <div className="pm-card pm-card-pad"><Badge tone="amber" dot>Ready to reset</Badge><h6 className="mt-3">Reset TOTP for {resetAuthWizard.name}</h6><p className="small text-muted">The admin will need to re-enroll their authenticator app on next login.</p></div>}
        </div>
        <div className="pm-modal-foot">
          <button className="btn btn-outline-secondary" onClick={() => resetStep > 0 ? setResetStep(resetStep - 1) : (setResetAuthWizard(null), setResetStep(0))}>{resetStep > 0 ? "Back" : "Cancel"}</button>
          {resetStep < 3 ? <button className="btn btn-primary" onClick={() => setResetStep(resetStep + 1)}>Continue</button> : <button className="btn btn-warning" onClick={handleResetAuthComplete}><i className="bi bi-arrow-repeat me-1" />Reset authentication</button>}
        </div>
      </Modal>

      {/* ====== INVITE ADMIN WIZARD (4-step) ====== */}
      <Modal open={invWizard} onClose={() => { setInvWizard(false); setInvStep(0); }} title="Invite administrator" subtitle={`Step ${invStep + 1} of 4`} icon="bi-envelope-plus" tone="blue" size="lg">
        <Steps current={invStep} steps={[{ label: "Details", icon: "bi-envelope" }, { label: "Role", icon: "bi-diagram-3" }, { label: "Security", icon: "bi-shield-lock" }, { label: "Send", icon: "bi-send" }]} />
        <div className="pm-wizard-progress"><span style={{ width: `${(invStep + 1) * 25}%` }} /></div>
        <div className="pm-modal-body">
          {invStep === 0 && <div className="row g-3"><div className="col-md-6"><label className="form-label">Email address</label><input className="form-control" id="inv-email" placeholder="admin@paymo.co.ke" /></div><div className="col-md-6"><label className="form-label">Full name</label><input className="form-control" id="inv-name" placeholder="Administrator name" /></div><div className="col-12"><label className="form-label">Welcome message</label><textarea className="form-control" rows={2} placeholder="Optional message for the invitation email" /></div></div>}
          {invStep === 1 && <div className="row g-3"><div className="col-md-6"><label className="form-label">Role tier</label><select className="form-select" id="inv-role"><option>Support Agent</option><option>Analyst</option><option>Minor Admin</option><option>Support Lead</option><option>Compliance Officer</option><option>Finance Manager</option><option>Operations Manager</option></select></div><div className="col-md-6"><label className="form-label">Department</label><select className="form-select"><option>Support</option><option>Analytics</option><option>Operations</option><option>Finance</option><option>Compliance</option><option>Risk</option></select></div></div>}
          {invStep === 2 && <div className="row g-3"><div className="col-md-6"><label className="form-label">2FA requirement</label><select className="form-select"><option>Required</option><option>Optional</option></select></div><div className="col-md-6"><label className="form-label">Invitation expiry</label><select className="form-select"><option>7 days</option><option>14 days</option><option>30 days</option></select></div></div>}
          {invStep === 3 && <div className="pm-card pm-card-pad"><Badge tone="blue" dot>Ready to send</Badge><h6 className="mt-3">Invitation summary</h6><p className="small text-muted">The administrator will receive an email with a link to set up their account and authenticate.</p><ul className="small text-muted"><li>Email verification required</li><li>TOTP setup required on first login</li><li>Passkey registration available</li><li>All actions audit-logged</li></ul></div>}
        </div>
        <div className="pm-modal-foot">
          <button className="btn btn-outline-secondary" onClick={() => invStep > 0 ? setInvStep(invStep - 1) : (setInvWizard(false), setInvStep(0))}>{invStep > 0 ? "Back" : "Cancel"}</button>
          {invStep < 3 ? <button className="btn btn-primary" onClick={() => setInvStep(invStep + 1)}>Continue</button> : <button className="btn btn-primary" onClick={() => { const em = (document.getElementById("inv-email") as HTMLInputElement)?.value || "newadmin@paymo.co.ke"; const rl = (document.getElementById("inv-role") as HTMLSelectElement)?.value || "Support Agent"; setInvitations(p => [{ id: `inv-${Date.now()}`, email: em, role: rl, invitedBy: "Super Admin", sentDate: new Date().toLocaleDateString(), expiry: "In 7 days", status: "Pending" }, ...p]); setInvWizard(false); setInvStep(0); push({ kind: "success", title: "Invitation sent", body: `Invitation sent to ${em}` }); }}><i className="bi bi-send me-1" />Send invitation</button>}
        </div>
      </Modal>

      {/* ====== ADMIN DETAIL DRAWER ====== */}
      <Drawer open={!!drawer} onClose={() => setDrawer(null)} title={drawer ?? "Admin operations"} subtitle="Identity, sessions, permissions and security actions" icon="bi-person-gear" wide>
        {(() => { const admin = admins.find(a => a.name.includes(drawer?.split(" ")[0] ?? "")); return <><div className="pm-card pm-card-pad mb-3"><div className="d-flex align-items-center gap-3"><Avatar name={drawer ?? "Admin"} size="lg" /><div><h5 className="mb-1">{drawer}</h5><Badge tone={admin?.status === "Locked" ? "red" : "green"} dot>{admin?.status ?? "Active"}</Badge> <Badge tone="blue">{admin?.role ?? "—"}</Badge></div></div><div className="row g-3 mt-2"><div className="col-3"><div className="pm-eyebrow">Email</div><b className="small">{admin?.email ?? "—"}</b></div><div className="col-3"><div className="pm-eyebrow">Department</div><b>{admin?.department ?? "—"}</b></div><div className="col-3"><div className="pm-eyebrow">Sessions</div><b>{admin?.sessions ?? "0"}</b></div><div className="col-3"><div className="pm-eyebrow">2FA</div><b>{admin?.twoFA ?? "Enabled"}</b></div></div></div>
        <div className="pm-card pm-card-pad mb-3"><h6>Quick operations</h6><div className="d-grid gap-2">
          <button className="btn btn-outline-primary" onClick={() => { setDrawer(null); if (admin) setEditAdmin(admin); }}>Edit admin profile</button>
          <button className="btn btn-outline-secondary" onClick={() => { setDrawer(null); if (admin) setLockAdmin(admin); }}>Lock / unlock account</button>
          <button className="btn btn-outline-warning" onClick={() => { setDrawer(null); if (admin) { setResetStep(0); setResetAuthWizard(admin); } }}>Reset authentication</button>
          <button className="btn btn-outline-danger" onClick={() => { setDrawer(null); if (admin) setDeleteAdmin(admin); }}>Remove admin</button>
        </div></div>
        <div className="pm-card pm-card-pad"><h6>Recent activity</h6><div className="pm-timeline">
          {activity.filter(a => drawer && a.admin.includes(drawer.split(" ")[0])).slice(0, 3).map(a => <div className="pm-tl-item done" key={a.id}><b>{a.action} — {a.target}</b><div className="pm-td-sub">{a.time} · {a.details}</div></div>)}
          {activity.filter(a => drawer && a.admin.includes(drawer.split(" ")[0])).length === 0 && <div className="pm-tl-item done"><b>No recent activity</b><div className="pm-td-sub">—</div></div>}
        </div></div></>; })()}
      </Drawer>

      {/* ====== CRUD MODALS ====== */}
      <AddRecordModal open={addAdmin} onClose={() => setAddAdmin(false)} onAdd={(f) => { handleAddAdmin(f); setAddAdmin(false); }} fields={adminFields} title="Create Administrator" icon="bi-person-plus" />
      <EditRecordModal open={!!editAdmin} onClose={() => setEditAdmin(null)} onSave={(f) => { handleEditAdmin(f); setEditAdmin(null); }} record={editAdmin} title={`Edit: ${editAdmin?.name ?? ""}`} icon="bi-pencil-square" />
      <DeleteRecordWizard open={!!deleteAdmin} onClose={() => setDeleteAdmin(null)} onDelete={handleDeleteAdmin} name={deleteAdmin?.name ?? ""} relatedCount={5} dependencyCount={3} />
      <LockUnlockModal open={!!lockAdmin} onClose={() => setLockAdmin(null)} onToggle={handleLockAdmin} record={lockAdmin ? { name: lockAdmin.name, locked: !!lockAdmin.locked, lockedBy: lockAdmin.lockedBy, lockedAt: lockAdmin.lockedAt, lockReason: lockAdmin.lockReason } : null} />
      <DeleteRecordWizard open={!!deleteSession} onClose={() => setDeleteSession(null)} onDelete={handleTerminateSession} name={`Session ${deleteSession?.sessionId ?? ""}`} relatedCount={0} dependencyCount={0} />
      <EditRecordModal open={!!editActivity} onClose={() => setEditActivity(null)} onSave={(f) => { handleEditActivity(f); setEditActivity(null); }} record={editActivity} title={`Edit: ${editActivity?.action ?? ""}`} icon="bi-pencil-square" />
      <DeleteRecordWizard open={!!deleteActivity} onClose={() => setDeleteActivity(null)} onDelete={handleDeleteActivity} name={deleteActivity?.action ?? ""} relatedCount={0} dependencyCount={0} />
      <AddRecordModal open={addPermission} onClose={() => setAddPermission(false)} onAdd={(f) => { handleAddPermission(f); setAddPermission(false); }} fields={permissionFields} title="Add Permission Set" icon="bi-key" />
      <EditRecordModal open={!!editPermission} onClose={() => setEditPermission(null)} onSave={(f) => { handleEditPermission(f); setEditPermission(null); }} record={editPermission} title={`Edit: ${editPermission?.admin ?? ""}`} icon="bi-pencil-square" />
      <DeleteRecordWizard open={!!deletePermission} onClose={() => setDeletePermission(null)} onDelete={handleDeletePermission} name={editPermission?.admin ?? ""} relatedCount={1} dependencyCount={0} />
      <LockUnlockModal open={!!lockPermission} onClose={() => setLockPermission(null)} onToggle={handleLockPermission} record={lockPermission ? { name: lockPermission.admin, locked: !!lockPermission.locked, lockedBy: lockPermission.lockedBy, lockedAt: lockPermission.lockedAt, lockReason: lockPermission.lockReason } : null} />
      <EditRecordModal open={!!editOffboard} onClose={() => setEditOffboard(null)} onSave={(f) => { handleEditOffboard(f); setEditOffboard(null); }} record={editOffboard} title={`Edit: ${editOffboard?.admin ?? ""}`} icon="bi-pencil-square" />
      <DeleteRecordWizard open={!!deleteOffboard} onClose={() => setDeleteOffboard(null)} onDelete={handleDeleteOffboard} name={editOffboard?.admin ?? ""} relatedCount={0} dependencyCount={0} />
      <EditRecordModal open={!!editSecurity} onClose={() => setEditSecurity(null)} onSave={(f) => { handleEditSecurity(f); setEditSecurity(null); }} record={editSecurity} title={`Edit: ${editSecurity?.setting ?? ""}`} icon="bi-pencil-square" />
      <LockUnlockModal open={!!lockSecurity} onClose={() => setLockSecurity(null)} onToggle={handleLockSecurity} record={lockSecurity ? { name: lockSecurity.setting, locked: !!lockSecurity.locked, lockedBy: lockSecurity.lockedBy, lockedAt: lockSecurity.lockedAt, lockReason: lockSecurity.lockReason } : null} />
      <AddRecordModal open={addRole} onClose={() => setAddRole(false)} onAdd={(f) => { handleAddRole(f); setAddRole(false); }} fields={roleFields} title="Add Role" icon="bi-diagram-3" />
      <EditRecordModal open={!!editRole} onClose={() => setEditRole(null)} onSave={(f) => { handleEditRole(f); setEditRole(null); }} record={editRole} title={`Edit: ${editRole?.name ?? ""}`} icon="bi-pencil-square" />
      <DeleteRecordWizard open={!!deleteRole} onClose={() => setDeleteRole(null)} onDelete={handleDeleteRole} name={deleteRole?.name ?? ""} relatedCount={3} dependencyCount={2} />
      <LockUnlockModal open={!!lockRole} onClose={() => setLockRole(null)} onToggle={handleLockRole} record={lockRole ? { name: lockRole.name, locked: !!lockRole.locked, lockedBy: lockRole.lockedBy, lockedAt: lockRole.lockedAt, lockReason: lockRole.lockReason } : null} />
      <EditRecordModal open={!!editInv} onClose={() => setEditInv(null)} onSave={(f) => { handleEditInv(f); setEditInv(null); }} record={editInv} title={`Edit: ${editInv?.email ?? ""}`} icon="bi-pencil-square" />
      <DeleteRecordWizard open={!!deleteInv} onClose={() => setDeleteInv(null)} onDelete={handleDeleteInv} name={editInv?.email ?? ""} relatedCount={0} dependencyCount={0} />
      <LockUnlockModal open={!!lockInv} onClose={() => setLockInv(null)} onToggle={handleLockInv} record={lockInv ? { name: lockInv.email, locked: !!lockInv.locked, lockedBy: lockInv.lockedBy } : null} />
      <DeleteRecordWizard open={!!deleteAccessLog} onClose={() => setDeleteAccessLog(null)} onDelete={handleDeleteAccessLog} name={deleteAccessLog?.action ?? ""} relatedCount={0} dependencyCount={0} />
    </div>
  );
}
