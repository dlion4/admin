import { useCallback, useMemo, useState } from "react";
import { Badge, Drawer, Modal, Steps, useToast } from "../../../components/ui";
import { AdminRowActions, AddRecordModal, EditRecordModal, DeleteRecordWizard, LockUnlockModal } from "../../../components/AdminControls";
import { type AuditEntry, type AuditFinding, type LogSource, initialLogs, initialFindings, initialSources } from "../data/auditData";

type A = { title: string; body: React.ReactNode; icon?: string; tone?: "green" | "red" | "amber" | "blue" | "violet" | "ink" };

export function AuditLog({ signal: _signal }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  const { push } = useToast();
  const [tab, setTab] = useState("log");
  const [q, setQ] = useState("");
  const [action, setAction] = useState<A | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [wizard, setWizard] = useState(false);
  const [step, setStep] = useState(0);

  // Data state
  const [logs, setLogs] = useState<AuditEntry[]>(initialLogs);
  const [findings, setFindings] = useState<AuditFinding[]>(initialFindings);
  const [sources, setSources] = useState<LogSource[]>(initialSources);

  // CRUD modals — Log entries
  const [editLog, setEditLog] = useState<AuditEntry | null>(null);
  const [deleteLog, setDeleteLog] = useState<AuditEntry | null>(null);
  const [lockLog, setLockLog] = useState<AuditEntry | null>(null);
  const [addLog, setAddLog] = useState(false);

  // CRUD modals — Findings
  const [editFinding, setEditFinding] = useState<AuditFinding | null>(null);
  const [deleteFinding, setDeleteFinding] = useState<AuditFinding | null>(null);
  const [lockFinding, setLockFinding] = useState<AuditFinding | null>(null);
  const [addFinding, setAddFinding] = useState(false);

  // CRUD modals — Sources
  const [editSource, setEditSource] = useState<LogSource | null>(null);
  const [deleteSource, setDeleteSource] = useState<LogSource | null>(null);
  const [lockSource, setLockSource] = useState<LogSource | null>(null);
  const [addSource, setAddSource] = useState(false);

  const filtered = useMemo(() => logs.filter(r => [r.timestamp, r.admin, r.action, r.targetType, r.targetId, r.details, r.session].join(" ").toLowerCase().includes(q.toLowerCase())), [q, logs]);
  const criticalCount = findings.filter(f => f.severity === "Medium" || f.severity === "High").length;

  const ask = (title: string, body: React.ReactNode, tone: A["tone"] = "green", icon = "bi-check2-circle") => setAction({ title, body, tone, icon });

  // CRUD handlers — Logs
  const handleAddLog = useCallback((form: Record<string, string>) => {
    setLogs(p => [{ id: `al-${Date.now()}`, timestamp: new Date().toLocaleTimeString(), admin: form.admin || "Super Admin", action: form.action || "View", targetType: form.targetType || "—", targetId: form.targetId || "—", details: form.details || "—", ip: "192.168.1.x", result: "Success", session: `S-${Math.floor(Math.random() * 9999)}` }, ...p]);
  }, []);
  const handleEditLog = useCallback((form: Record<string, string>) => { if (!editLog) return; setLogs(p => p.map(l => l.id === editLog.id ? { ...l, ...form } : l)); }, [editLog]);
  const handleDeleteLog = useCallback(() => { if (!deleteLog) return; setLogs(p => p.filter(l => l.id !== deleteLog.id)); }, [deleteLog]);
  const handleLockLog = useCallback((locked: boolean) => { if (!lockLog) return; setLogs(p => p.map(l => l.id === lockLog.id ? { ...l, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Admin lock" : undefined } : l)); }, [lockLog]);

  // CRUD handlers — Findings
  const handleAddFinding = useCallback((form: Record<string, string>) => {
    setFindings(p => [{ id: `af-${Date.now()}`, finding: form.finding || "New Finding", severity: form.severity || "Low", details: form.details || "—", recommendation: form.recommendation || "—" }, ...p]);
  }, []);
  const handleEditFinding = useCallback((form: Record<string, string>) => { if (!editFinding) return; setFindings(p => p.map(f => f.id === editFinding.id ? { ...f, ...form } : f)); }, [editFinding]);
  const handleDeleteFinding = useCallback(() => { if (!deleteFinding) return; setFindings(p => p.filter(f => f.id !== deleteFinding.id)); }, [deleteFinding]);
  const handleLockFinding = useCallback((locked: boolean) => { if (!lockFinding) return; setFindings(p => p.map(f => f.id === lockFinding.id ? { ...f, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Admin lock" : undefined } : f)); }, [lockFinding]);

  // CRUD handlers — Sources
  const handleAddSource = useCallback((form: Record<string, string>) => {
    setSources(p => [{ id: `ls-${Date.now()}`, name: form.name || "New Source", count: "0 today", status: "Healthy", icon: form.icon || "bi-plug" }, ...p]);
  }, []);
  const handleEditSource = useCallback((form: Record<string, string>) => { if (!editSource) return; setSources(p => p.map(s => s.id === editSource.id ? { ...s, ...form } : s)); }, [editSource]);
  const handleDeleteSource = useCallback(() => { if (!deleteSource) return; setSources(p => p.filter(s => s.id !== deleteSource.id)); }, [deleteSource]);
  const handleLockSource = useCallback((locked: boolean) => { if (!lockSource) return; setSources(p => p.map(s => s.id === lockSource.id ? { ...s, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Admin lock" : undefined } : s)); }, [lockSource]);

  const logFields = [{ label: "admin", placeholder: "Admin name", required: true }, { label: "action", placeholder: "Action type (Login, Update, Export...)", required: true }, { label: "targetType", placeholder: "Target type (User, Transaction...)" }, { label: "targetId", placeholder: "Target ID" }, { label: "details", placeholder: "Action details" }];
  const findingFields = [{ label: "finding", placeholder: "Finding description", required: true }, { label: "severity", placeholder: "High / Medium / Low", required: true }, { label: "details", placeholder: "Detailed description" }, { label: "recommendation", placeholder: "Remediation recommendation" }];
  const sourceFields = [{ label: "name", placeholder: "Source name", required: true }, { label: "icon", placeholder: "bi-plug" }];

  return (
    <div className="pm-page-content audit-page">
      <div className="pm-section-head" style={{ marginTop: 0 }}>
        <div>
          <div className="pm-eyebrow">PLATFORM ADMINISTRATION / PAGE 31</div>
          <h2 className="mb-1">Audit Log</h2>
          <p>Immutable system activity for compliance, security investigations and operational accountability.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setAction({ title: "Admin Permissions", body: <div className="pm-card pm-card-pad"><h6>Role-based access</h6>{[["Super Admin", "Full access: export, search, remediate findings"], ["Security Lead", "Search, review, remediate findings"], ["Compliance", "Export evidence, review findings"], ["Auditor", "Read-only, search, export"], ["Viewer", "Read-only access"]].map(([role, perm]) => <div className="d-flex justify-content-between py-1 border-bottom small" key={role}><span className="pm-td-strong">{role}</span><span className="text-muted">{perm}</span></div>)}</div>, tone: "blue", icon: "bi-shield-lock" })}><i className="bi bi-shield-lock me-1" />Permissions</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setDrawer(true)}><i className="bi bi-shield-check me-1" />Retention policy</button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => setWizard(true)}><i className="bi bi-file-earmark-bar-graph me-1" />Create audit report</button>
          <button className="btn btn-primary btn-sm" onClick={() => ask("Export audit evidence", <p>A signed, tamper-evident export of the selected audit range will be prepared.</p>, "blue", "bi-download")}><i className="bi bi-download me-1" />Export evidence</button>
        </div>
      </div>

      {/* Hero */}
      <div className="pm-hero audit-hero mb-3">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <div className="pm-eyebrow text-white-50">AUDIT TRAIL · IMMUTABLE</div>
            <div className="pm-hero-value">2.34M <span className="fs-6 fw-normal text-white-50">entries in 30 days</span></div>
            <div className="small text-white-50 mt-2">{logs.length} entries shown · 45 GB stored · retention locked at 7 years</div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <div className="pm-hero-chip"><div className="l">Log sources</div><div className="v">{sources.length}</div></div>
            <div className="pm-hero-chip"><div className="l">Critical events</div><div className="v text-warning">{criticalCount}</div></div>
            <div className="pm-hero-chip"><div className="l">Integrity</div><div className="v text-success">Verified</div></div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-3">
        {[
          ["Entries today", "78,234", "Across API and Admin UI", "bi-activity", "green"],
          ["Storage used", "45 GB", "7-year retention", "bi-database", "blue"],
          ["Log sources", String(sources.length), "Admin, API, system and DB", "bi-diagram-3", "violet"],
          ["Critical events", String(criticalCount), "Requires review", "bi-exclamation-triangle", "amber"]
        ].map(x => <div className="col-6 col-xl-3" key={x[0]}><div className="pm-stat" style={{ cursor: "pointer" }} onClick={() => ask(x[0], <p>{x[2]}</p>, x[4] as any, x[3])}><div className={`pm-stat-ico bg-${x[4]}-soft text-${x[4]}`}><i className={`bi ${x[3]}`} /></div><div className="pm-stat-label">{x[0]}</div><div className="pm-stat-value">{x[1]}</div><div className="pm-stat-foot">{x[2]}</div></div></div>)}
      </div>

      {/* Tabs */}
      <div className="pm-card mb-3">
        <div className="pm-tabs">
          {[
            ["log", "Audit entries", "bi-list-check"], ["search", "Advanced search", "bi-funnel"],
            ["findings", "Audit findings", "bi-shield-exclamation"], ["sources", "Log sources", "bi-diagram-3"]
          ].map(x => <button className={`pm-tab ${tab === x[0] ? "active" : ""}`} key={x[0]} onClick={() => setTab(x[0])}><i className={`bi ${x[2]}`} />{x[1]}</button>)}
        </div>
      </div>

      {/* === AUDIT LOG TAB === */}
      {tab === "log" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Audit log entries</h3><p>Search immutable records by actor, action, target, source or result.</p></div>
          <div className="d-flex gap-2 align-items-center">
            <div className="pm-search"><i className="bi bi-search" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search audit ID, admin or target" /></div>
            <button className="btn btn-primary btn-sm" onClick={() => setAddLog(true)}><i className="bi bi-plus me-1" />Add entry</button>
          </div>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Timestamp</th><th>Admin</th><th>Action</th><th>Target type</th><th>Target ID</th><th>Details</th><th>Result</th><th>Session</th><th className="text-end">Actions</th></tr></thead><tbody>
            {filtered.map(r => <tr key={r.id}>
              <td className="mono">{r.timestamp}</td>
              <td className="pm-td-strong">{r.admin}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td>
              <td className="pm-td-strong">{r.action}</td>
              <td>{r.targetType}</td>
              <td className="mono">{r.targetId}</td>
              <td>{r.details}</td>
              <td><Badge tone={r.result === "Success" ? "green" : "red"} dot>{r.result}</Badge></td>
              <td className="mono">{r.session}</td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditLog(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setLockLog(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteLog(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* === ADVANCED SEARCH TAB === */}
      {tab === "search" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Audit log search</h3><p>Combine date, actor, target, severity, IP, result and source filters.</p></div>
        </div>
        <div className="pm-card pm-card-pad">
          <div className="row g-3">
            {[["Date range", "Aug 01 – Aug 23, 2026"], ["Admin", "All administrators"], ["Action type", "Login, Create, Update, Approve, Export"], ["Target type", "User, Transaction, Partner, Config"], ["Severity", "Info, Warning, Critical"], ["Result", "Success, Failure, Error"], ["IP address", "Any approved range"], ["Source", "Admin UI, API, Background job"]].map(([label, value]) => <div className="col-md-6" key={label}><label className="form-label">{label}</label><input className="form-control" value={value} readOnly /></div>)}
          </div>
          <div className="d-flex justify-content-end mt-3">
            <button className="btn btn-primary" onClick={() => ask("Search completed", <p>1,842 matching entries were found and are ready for review.</p>, "green", "bi-check2")}><i className="bi bi-search me-1" />Run audit search</button>
          </div>
        </div>
      </section>}

      {/* === FINDINGS TAB === */}
      {tab === "findings" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Audit findings</h3><p>Control weaknesses and recommendations detected during the latest review.</p></div>
          <div className="d-flex gap-2">
            <button className="btn btn-primary btn-sm" onClick={() => setAddFinding(true)}><i className="bi bi-plus me-1" />Add finding</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => ask("Assign remediation", <p>Four audit findings were assigned with due dates.</p>, "amber", "bi-person-check")}><i className="bi bi-person-check me-1" />Assign all</button>
          </div>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Finding</th><th>Severity</th><th>Details</th><th>Recommendation</th><th className="text-end">Actions</th></tr></thead><tbody>
            {findings.map(r => <tr key={r.id}>
              <td className="pm-td-strong">{r.finding}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td>
              <td><Badge tone={r.severity === "High" ? "red" : r.severity === "Medium" ? "amber" : "green"} dot>{r.severity}</Badge></td>
              <td>{r.details}</td>
              <td>{r.recommendation}</td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditFinding(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setLockFinding(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteFinding(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* === SOURCES TAB === */}
      {tab === "sources" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Audit log sources</h3><p>Producers feeding the tamper-evident audit pipeline.</p></div>
          <div className="d-flex gap-2">
            <button className="btn btn-primary btn-sm" onClick={() => setAddSource(true)}><i className="bi bi-plus me-1" />Add source</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => ask("Source health report", <p>All log sources reported healthy ingestion in the last 24 hours.</p>, "blue", "bi-heart-pulse")}><i className="bi bi-heart-pulse me-1" />Health check</button>
          </div>
        </div>
        <div className="row g-3">
          {sources.map(r => <div className="col-md-6 col-xl-4" key={r.id}>
            <div className="pm-card pm-card-pad">
              <div className="d-flex gap-3 align-items-center">
                <div className="pm-stat-ico bg-green-soft text-green"><i className={`bi ${r.icon}`} /></div>
                <div className="flex-grow-1"><b>{r.name}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</b><div className="pm-td-sub">{r.count}</div></div>
                <Badge tone="green" dot>{r.status}</Badge>
              </div>
              <div className="d-flex gap-1 mt-2">
                <button className="btn btn-sm btn-outline-primary" onClick={() => setEditSource(r)} title="Edit"><i className="bi bi-pencil" /></button>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setLockSource(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteSource(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </div>
            </div>
          </div>)}
        </div>
      </section>}

      {/* Generic action modal */}
      <Modal open={!!action} onClose={() => setAction(null)} title={action?.title ?? "Audit action"} subtitle="Super Admin action · evidence is permanently logged" icon={action?.icon} tone={action?.tone}>
        <div className="pm-modal-body">{action?.body}</div>
        <div className="pm-modal-foot">
          <button className="btn btn-outline-secondary" onClick={() => setAction(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { setAction(null); push({ kind: "success", title: "Audit operation completed", body: "The action was added to the immutable audit trail." }); }}>Confirm action</button>
        </div>
      </Modal>

      {/* Create audit report wizard */}
      <Modal open={wizard} onClose={() => setWizard(false)} title="Create audit report" subtitle="Build a signed evidence pack for compliance or investigation" icon="bi-file-earmark-bar-graph" tone="blue" size="lg">
        <Steps current={step} steps={[{ label: "Scope", icon: "bi-funnel" }, { label: "Filters", icon: "bi-search" }, { label: "Review", icon: "bi-eye" }, { label: "Export", icon: "bi-download" }]} />
        <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 25}%` }} /></div>
        <div className="pm-modal-body">
          <div className="pm-note mb-3"><i className="bi bi-shield-lock me-1" />Audit reports are signed with HSM-backed certificates and cannot be modified after generation.</div>
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label">Report scope</label><select className="form-select"><option>All admin actions</option><option>Financial only</option><option>Security events</option><option>User management</option></select></div>
            <div className="col-md-6"><label className="form-label">Output format</label><select className="form-select"><option>Signed PDF + CSV</option><option>Signed PDF only</option><option>CSV only</option></select></div>
            <div className="col-12"><label className="form-label">Reason for export</label><textarea className="form-control" rows={3} placeholder="Regulatory evidence pack for quarterly access control review." /></div>
          </div>
        </div>
        <div className="pm-modal-foot">
          <button className="btn btn-outline-secondary" onClick={() => step ? setStep(step - 1) : setWizard(false)}>{step ? "Back" : "Cancel"}</button>
          {step < 3 ? <button className="btn btn-primary" onClick={() => setStep(step + 1)}>Continue</button> : <button className="btn btn-primary" onClick={() => { setWizard(false); push({ kind: "success", title: "Audit report queued", body: "A signed evidence pack is being generated." }); }}>Generate signed report</button>}
        </div>
      </Modal>

      {/* Retention policy drawer */}
      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Audit retention policy" subtitle="Tamper evidence, retention and export controls" icon="bi-shield-check" wide>
        <div className="pm-card pm-card-pad mb-3"><Badge tone="green" dot>Integrity verified</Badge>
          <h5 className="mt-3">7-year immutable retention</h5>
          <p className="small text-muted">Events are hash-chained, replicated and protected from administrator deletion.</p>
        </div>
        <div className="pm-card pm-card-pad">
          <h6>Policy controls</h6>
          {[["Retention period", "7 years"], ["Oldest entry", "Jan 15, 2024"], ["Storage", "45 GB · encrypted"], ["Deletion policy", "No manual deletion"], ["Export signing", "HSM-backed signature"], ["Replication", "3 of 3 replicas verified"], ["Chain integrity", "Last verified: 2 min ago"]].map(x => <div className="d-flex justify-content-between py-2 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b>{x[1]}</b></div>)}
        </div>
      </Drawer>

      {/* CRUD Modals — Logs */}
      <AddRecordModal open={addLog} onClose={() => setAddLog(false)} onAdd={handleAddLog} fields={logFields} title="Add Audit Entry" icon="bi-list-check" />
      <EditRecordModal open={!!editLog} onClose={() => setEditLog(null)} onSave={handleEditLog} record={editLog} title={`Edit: ${editLog?.targetId ?? ""}`} icon="bi-pencil-square" />
      <DeleteRecordWizard open={!!deleteLog} onClose={() => setDeleteLog(null)} onDelete={handleDeleteLog} name={deleteLog?.targetId ?? ""} relatedCount={0} dependencyCount={0} />
      <LockUnlockModal open={!!lockLog} onClose={() => setLockLog(null)} onToggle={handleLockLog} record={lockLog ? { name: lockLog.targetId, locked: !!lockLog.locked, lockedBy: lockLog.lockedBy, lockedAt: lockLog.lockedAt, lockReason: lockLog.lockReason } : null} />

      {/* CRUD Modals — Findings */}
      <AddRecordModal open={addFinding} onClose={() => setAddFinding(false)} onAdd={handleAddFinding} fields={findingFields} title="Add Audit Finding" icon="bi-shield-exclamation" />
      <EditRecordModal open={!!editFinding} onClose={() => setEditFinding(null)} onSave={handleEditFinding} record={editFinding} title={`Edit: ${editFinding?.finding ?? ""}`} icon="bi-pencil-square" />
      <DeleteRecordWizard open={!!deleteFinding} onClose={() => setDeleteFinding(null)} onDelete={handleDeleteFinding} name={editFinding?.finding ?? ""} relatedCount={1} dependencyCount={0} />
      <LockUnlockModal open={!!lockFinding} onClose={() => setLockFinding(null)} onToggle={handleLockFinding} record={lockFinding ? { name: lockFinding.finding, locked: !!lockFinding.locked, lockedBy: lockFinding.lockedBy, lockedAt: lockFinding.lockedAt, lockReason: lockFinding.lockReason } : null} />

      {/* CRUD Modals — Sources */}
      <AddRecordModal open={addSource} onClose={() => setAddSource(false)} onAdd={handleAddSource} fields={sourceFields} title="Add Log Source" icon="bi-diagram-3" />
      <EditRecordModal open={!!editSource} onClose={() => setEditSource(null)} onSave={handleEditSource} record={editSource} title={`Edit: ${editSource?.name ?? ""}`} icon="bi-pencil-square" />
      <DeleteRecordWizard open={!!deleteSource} onClose={() => setDeleteSource(null)} onDelete={handleDeleteSource} name={editSource?.name ?? ""} relatedCount={1} dependencyCount={0} />
      <LockUnlockModal open={!!lockSource} onClose={() => setLockSource(null)} onToggle={handleLockSource} record={lockSource ? { name: lockSource.name, locked: !!lockSource.locked, lockedBy: lockSource.lockedBy, lockedAt: lockSource.lockedAt, lockReason: lockSource.lockReason } : null} />
    </div>
  );
}
