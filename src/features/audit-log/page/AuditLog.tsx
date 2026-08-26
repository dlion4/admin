import { useCallback, useMemo, useState } from "react";
import { Badge, Drawer, Modal, Steps, useToast } from "../../../components/ui";
import { AddRecordModal, EditRecordModal, DeleteRecordWizard, LockUnlockModal } from "../../../components/AdminControls";
import {
  type AuditEntry, type AuditFinding, type LogSource, type AuditIncident, type AuditSession,
  type AuditAlertRule, type SectionExport, type AuditRetentionRule,
  initialLogs, initialFindings, initialSources, initialIncidents, initialSessions,
  initialAlertRules, initialSectionExports, initialRetentionRules
} from "../data/auditData";
import {
  AuditEntryDrawer, IncidentWizard, SessionDetailModal, SectionExportWizard,
  AlertRuleConfigModal, RetentionPolicyWizard, ComplianceChecklistModal,
  AdminActivityTimelineModal, IntegrityReportModal, ForensicInvestigationWizard,
  AuditSearchModal, RealtimeFeedModal, AuditEvidenceExportModal, DataSourceConfigModal,
  FindingDetailModal, DataClassificationModal, BulkActionModal
} from "../modals/AuditModals";

type A = { title: string; body: React.ReactNode; icon?: string; tone?: "green" | "red" | "amber" | "blue" | "violet" | "ink" };

export function AuditLog({ signal: _signal }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  const { push } = useToast();
  const [tab, setTab] = useState("log");
  const [q, setQ] = useState("");
  const [action, setAction] = useState<A | null>(null);
  const [drawer, setDrawer] = useState(false);

  // Data state
  const [logs, setLogs] = useState<AuditEntry[]>(initialLogs);
  const [findings, setFindings] = useState<AuditFinding[]>(initialFindings);
  const [sources, setSources] = useState<LogSource[]>(initialSources);
  const [incidents, setIncidents] = useState<AuditIncident[]>(initialIncidents);
  const [sessions, setSessions] = useState<AuditSession[]>(initialSessions);
  const [alertRules, setAlertRules] = useState<AuditAlertRule[]>(initialAlertRules);
  const [sectionExports] = useState<SectionExport[]>(initialSectionExports);
  const [retentionRules] = useState<AuditRetentionRule[]>(initialRetentionRules);

  // CRUD — Logs
  const [editLog, setEditLog] = useState<AuditEntry | null>(null);
  const [deleteLog, setDeleteLog] = useState<AuditEntry | null>(null);
  const [lockLog, setLockLog] = useState<AuditEntry | null>(null);
  const [addLog, setAddLog] = useState(false);
  const [entryDrawer, setEntryDrawer] = useState<AuditEntry | null>(null);

  // CRUD — Findings
  const [editFinding, setEditFinding] = useState<AuditFinding | null>(null);
  const [deleteFinding, setDeleteFinding] = useState<AuditFinding | null>(null);
  const [lockFinding, setLockFinding] = useState<AuditFinding | null>(null);
  const [addFinding, setAddFinding] = useState(false);
  const [findingDetail, setFindingDetail] = useState<AuditFinding | null>(null);

  // CRUD — Sources
  const [editSource, setEditSource] = useState<LogSource | null>(null);
  const [deleteSource, setDeleteSource] = useState<LogSource | null>(null);
  const [lockSource, setLockSource] = useState<LogSource | null>(null);
  const [addSource, setAddSource] = useState(false);
  const [sourceConfig, setSourceConfig] = useState<LogSource | null>(null);

  // CRUD — Incidents
  const [editIncident, setEditIncident] = useState<AuditIncident | null>(null);
  const [deleteIncident, setDeleteIncident] = useState<AuditIncident | null>(null);

  // CRUD — Sessions
  const [sessionDetail, setSessionDetail] = useState<AuditSession | null>(null);

  // CRUD — Alert Rules
  const [editAlertRule, setEditAlertRule] = useState<AuditAlertRule | null>(null);
  const [deleteAlertRule, setDeleteAlertRule] = useState<AuditAlertRule | null>(null);
  const [addAlertRule, setAddAlertRule] = useState(false);

  // Feature modals
  const [incidentWizard, setIncidentWizard] = useState(false);
  const [sectionExport, setSectionExport] = useState(false);
  const [retentionWizard, setRetentionWizard] = useState(false);
  const [complianceCheck, setComplianceCheck] = useState(false);
  const [adminTimeline, setAdminTimeline] = useState<string | null>(null);
  const [integrityReport, setIntegrityReport] = useState(false);
  const [forensicWizard, setForensicWizard] = useState(false);
  const [evidenceExport, setEvidenceExport] = useState(false);
  const [dataClassification, setDataClassification] = useState(false);
  const [realtimeFeed, setRealtimeFeed] = useState(false);
  const [bulkAction, setBulkAction] = useState<{ title: string; count: number; onConfirm: () => void } | null>(null);
  const [exportAll, setExportAll] = useState(false);

  // Derived
  const filtered = useMemo(() => logs.filter(r => [r.timestamp, r.admin, r.action, r.targetType, r.targetId, r.details, r.session, r.severity, r.source].join(" ").toLowerCase().includes(q.toLowerCase())), [q, logs]);
  const criticalCount = findings.filter(f => f.severity === "High" || f.severity === "Medium").length;
  const openIncidents = incidents.filter(i => i.status !== "Resolved").length;
  const activeSessions = sessions.filter(s => s.status === "Active").length;

  // CRUD handlers — Logs
  const handleAddLog = useCallback((form: Record<string, string>) => {
    setLogs(p => [{ id: `al-${Date.now()}`, timestamp: new Date().toLocaleTimeString(), admin: form.admin || "Super Admin", action: form.action || "View", targetType: form.targetType || "—", targetId: form.targetId || "—", details: form.details || "—", ip: "192.168.1.x", result: "Success", session: `S-${Math.floor(Math.random() * 9999)}` }, ...p]);
  }, []);
  const handleEditLog = useCallback((form: Record<string, any>) => { if (!editLog) return; setLogs(p => p.map(l => l.id === editLog.id ? { ...l, ...form } : l)); }, [editLog]);
  const handleDeleteLog = useCallback(() => { if (!deleteLog) return; setLogs(p => p.filter(l => l.id !== deleteLog.id)); }, [deleteLog]);
  const handleLockLog = useCallback((locked: boolean) => { if (!lockLog) return; setLogs(p => p.map(l => l.id === lockLog.id ? { ...l, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Admin lock" : undefined } : l)); }, [lockLog]);

  // CRUD handlers — Findings
  const handleAddFinding = useCallback((form: Record<string, string>) => {
    setFindings(p => [{ id: `af-${Date.now()}`, finding: form.finding || "New Finding", severity: form.severity || "Low", details: form.details || "—", recommendation: form.recommendation || "—" }, ...p]);
  }, []);
  const handleEditFinding = useCallback((form: Record<string, any>) => { if (!editFinding) return; setFindings(p => p.map(f => f.id === editFinding.id ? { ...f, ...form } : f)); }, [editFinding]);
  const handleDeleteFinding = useCallback(() => { if (!deleteFinding) return; setFindings(p => p.filter(f => f.id !== deleteFinding.id)); }, [deleteFinding]);
  const handleLockFinding = useCallback((locked: boolean) => { if (!lockFinding) return; setFindings(p => p.map(f => f.id === lockFinding.id ? { ...f, locked, lockedBy: locked ? "Super Admin" : undefined } : f)); }, [lockFinding]);

  // CRUD handlers — Sources
  const handleAddSource = useCallback((form: Record<string, string>) => {
    setSources(p => [{ id: `ls-${Date.now()}`, name: form.name || "New Source", count: "0 today", status: "Healthy", icon: form.icon || "bi-plug" }, ...p]);
  }, []);
  const handleEditSource = useCallback((form: Record<string, any>) => { if (!editSource) return; setSources(p => p.map(s => s.id === editSource.id ? { ...s, ...form } : s)); }, [editSource]);
  const handleDeleteSource = useCallback(() => { if (!deleteSource) return; setSources(p => p.filter(s => s.id !== deleteSource.id)); }, [deleteSource]);
  const handleLockSource = useCallback((locked: boolean) => { if (!lockSource) return; setSources(p => p.map(s => s.id === lockSource.id ? { ...s, locked, lockedBy: locked ? "Super Admin" : undefined } : s)); }, [lockSource]);

  // CRUD handlers — Incidents
  const handleEditIncident = useCallback((form: Record<string, any>) => { if (!editIncident) return; setIncidents(p => p.map(i => i.id === editIncident.id ? { ...i, ...form } : i)); }, [editIncident]);
  const handleDeleteIncident = useCallback(() => { if (!deleteIncident) return; setIncidents(p => p.filter(i => i.id !== deleteIncident.id)); }, [deleteIncident]);

  // CRUD handlers — Alert Rules
  const handleAddAlertRule = useCallback((form: Record<string, any>) => {
    setAlertRules(p => [...p, { id: `ar-${Date.now()}`, name: form.name || "New Rule", description: form.description || "—", condition: form.condition || "—", threshold: form.threshold || "—", action: form.action || "Alert immediately", recipients: form.recipients || "—", status: form.status || "Active" }]);
  }, []);
  const handleEditAlertRule = useCallback((form: Record<string, any>) => { if (!editAlertRule) return; setAlertRules(p => p.map(r => r.id === editAlertRule.id ? { ...r, ...form } : r)); }, [editAlertRule]);
  const handleDeleteAlertRule = useCallback(() => { if (!deleteAlertRule) return; setAlertRules(p => p.filter(r => r.id !== deleteAlertRule.id)); }, [deleteAlertRule]);

  const logFields = [{ key: "admin", label: "Admin", placeholder: "Admin name", required: true }, { key: "action", label: "Action", placeholder: "Login, Update, Export...", required: true }, { key: "targetType", label: "Target type", placeholder: "User, Transaction..." }, { key: "targetId", label: "Target ID", placeholder: "PAY-89234" }, { key: "details", label: "Details", placeholder: "Action details" }];
  const findingFields = [{ key: "finding", label: "Finding", placeholder: "Description of the finding", required: true }, { key: "severity", label: "Severity", placeholder: "High / Medium / Low", required: true }, { key: "details", label: "Details", placeholder: "Detailed description" }, { key: "recommendation", label: "Recommendation", placeholder: "Remediation recommendation" }];
  const sourceFields = [{ key: "name", label: "Source name", placeholder: "e.g. Admin UI", required: true }, { key: "icon", label: "Icon class", placeholder: "bi-plug" }];

  const tabs: [string, string, string][] = [
    ["log", "Audit entries", "bi-list-check"], ["search", "Advanced search", "bi-funnel"],
    ["findings", "Findings", "bi-shield-exclamation"], ["sources", "Log sources", "bi-diagram-3"],
    ["incidents", "Incidents", "bi-exclamation-triangle"], ["sessions", "Sessions", "bi-pc-display"],
    ["alerts", "Alert rules", "bi-bell"], ["retention", "Retention", "bi-shield-check"],
    ["exports", "Data export", "bi-cloud-download"]
  ];

  return (
    <div className="pm-page-content audit-page">
      {/* ======== HEADER ======== */}
      <div className="pm-section-head" style={{ marginTop: 0 }}>
        <div>
          <div className="pm-eyebrow">PLATFORM ADMINISTRATION / PAGE 31</div>
          <h2 className="mb-1">Audit Log</h2>
          <p>Immutable system activity for compliance, security investigations and operational accountability.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setRealtimeFeed(true)}><i className="bi bi-broadcast me-1" />Live feed</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setIntegrityReport(true)}><i className="bi bi-shield-check me-1" />Integrity</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setDrawer(true)}><i className="bi bi-shield-check me-1" />Retention</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setComplianceCheck(true)}><i className="bi bi-clipboard-check me-1" />Compliance</button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => setSectionExport(true)}><i className="bi bi-cloud-download me-1" />Export data</button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => setForensicWizard(true)}><i className="bi bi-search me-1" />Forensics</button>
          <button className="btn btn-primary btn-sm" onClick={() => setEvidenceExport(true)}><i className="bi bi-download me-1" />Export evidence</button>
        </div>
      </div>

      {/* ======== HERO ======== */}
      <div className="pm-hero audit-hero mb-3">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <div className="pm-eyebrow text-white-50">AUDIT TRAIL · IMMUTABLE</div>
            <div className="pm-hero-value">2.34M <span className="fs-6 fw-normal text-white-50">entries in 30 days</span></div>
            <div className="small text-white-50 mt-2">{logs.length} shown · 45 GB stored · retention locked at 7 years · {activeSessions} active sessions</div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <div className="pm-hero-chip"><div className="l">Log sources</div><div className="v">{sources.length}</div></div>
            <div className="pm-hero-chip"><div className="l">Open incidents</div><div className="v text-danger">{openIncidents}</div></div>
            <div className="pm-hero-chip"><div className="l">Findings</div><div className="v text-warning">{criticalCount}</div></div>
            <div className="pm-hero-chip"><div className="l">Integrity</div><div className="v text-success">Verified</div></div>
          </div>
        </div>
      </div>

      {/* ======== STATS ======== */}
      <div className="row g-3 mb-3">
        {[
          ["Entries today", "78,234", "Across API and Admin UI", "bi-activity", "green"],
          ["Open incidents", String(openIncidents), "Require resolution", "bi-exclamation-triangle", "red"],
          ["Active sessions", String(activeSessions), "Monitored in real-time", "bi-pc-display", "blue"],
          ["Alert rules", String(alertRules.filter(r => r.status === "Active").length), "All active and monitoring", "bi-bell", "amber"]
        ].map(x => <div className="col-6 col-xl-3" key={x[0]}><div className="pm-stat" style={{ cursor: "pointer" }} onClick={() => { if (x[0] === "Open incidents") setTab("incidents"); else if (x[0] === "Active sessions") setTab("sessions"); else if (x[0] === "Alert rules") setTab("alerts"); else setTab("log"); }}><div className={`pm-stat-ico bg-${x[4]}-soft text-${x[4]}`}><i className={`bi ${x[3]}`} /></div><div className="pm-stat-label">{x[0]}</div><div className="pm-stat-value">{x[1]}</div><div className="pm-stat-foot">{x[2]}</div></div></div>)}
      </div>

      {/* ======== TABS ======== */}
      <div className="pm-card mb-3">
        <div className="pm-tabs">
          {tabs.map(x => <button className={`pm-tab ${tab === x[0] ? "active" : ""}`} key={x[0]} onClick={() => setTab(x[0])}><i className={`bi ${x[2]}`} />{x[1]}</button>)}
        </div>
      </div>

      {/* ======== AUDIT LOG TAB ======== */}
      {tab === "log" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Audit log entries</h3><p>Immutable records by actor, action, target, source or result.</p></div>
          <div className="d-flex gap-2 align-items-center">
            <div className="pm-search"><i className="bi bi-search" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search audit ID, admin or target" /></div>
            <button className="btn btn-primary btn-sm" onClick={() => setAddLog(true)}><i className="bi bi-plus me-1" />Add entry</button>
          </div>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Time</th><th>Admin</th><th>Action</th><th>Target</th><th>Severity</th><th>Source</th><th>Result</th><th className="text-end">Actions</th></tr></thead><tbody>
            {filtered.map(r => <tr key={r.id} style={{ cursor: "pointer" }} onClick={() => setEntryDrawer(r)}>
              <td className="mono">{r.timestamp}</td>
              <td className="pm-td-strong">{r.admin}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td>
              <td className="pm-td-strong">{r.action}</td>
              <td className="mono">{r.targetId}</td>
              <td><Badge tone={r.severity === "Critical" ? "red" : r.severity === "High" ? "amber" : r.severity === "Medium" ? "blue" : "grey"}>{r.severity || "Info"}</Badge></td>
              <td className="pm-td-sub">{r.source || "Admin UI"}</td>
              <td><Badge tone={r.result === "Success" ? "green" : "red"} dot>{r.result}</Badge></td>
              <td className="text-end text-nowrap" onClick={e => e.stopPropagation()}>
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditLog(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setLockLog(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteLog(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* ======== ADVANCED SEARCH TAB ======== */}
      {tab === "search" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Audit log search</h3><p>Combine date, actor, target, severity, IP, result and source filters.</p></div>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setDataClassification(true)}><i className="bi bi-tags me-1" />Classification</button>
        </div>
        <div className="pm-card pm-card-pad">
          <div className="row g-3">
            {[["Date range", "Aug 01 – Aug 27, 2026"], ["Admin", "All administrators"], ["Action type", "Login, Create, Update, Approve, Export, Delete"], ["Target type", "User, Transaction, Partner, Config, SAR"], ["Severity", "Info, Warning, Medium, High, Critical"], ["Result", "Success, Failure, Error"], ["IP address", "Any approved range"], ["Source", "Admin UI, API, Fraud engine, Background jobs"]].map(([label, value]) => <div className="col-md-6" key={label}><label className="form-label">{label}</label><input className="form-control" value={value} readOnly /></div>)}
          </div>
          <div className="d-flex justify-content-end gap-2 mt-3">
            <button className="btn btn-outline-secondary" onClick={() => push({ kind: "info", title: "Filters cleared" })}>Clear filters</button>
            <button className="btn btn-primary" onClick={() => push({ kind: "success", title: "Search completed", body: "1,842 matching entries found." })}><i className="bi bi-search me-1" />Run search</button>
          </div>
        </div>
      </section>}

      {/* ======== FINDINGS TAB ======== */}
      {tab === "findings" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Audit findings</h3><p>Control weaknesses and recommendations detected during review.</p></div>
          <div className="d-flex gap-2">
            <button className="btn btn-primary btn-sm" onClick={() => setAddFinding(true)}><i className="bi bi-plus me-1" />Add finding</button>
          </div>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Finding</th><th>Severity</th><th>Status</th><th>Assigned to</th><th>Due</th><th className="text-end">Actions</th></tr></thead><tbody>
            {findings.map(r => <tr key={r.id} style={{ cursor: "pointer" }} onClick={() => setFindingDetail(r)}>
              <td className="pm-td-strong">{r.finding}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td>
              <td><Badge tone={r.severity === "High" ? "red" : r.severity === "Medium" ? "amber" : "green"} dot>{r.severity}</Badge></td>
              <td><Badge tone={r.status === "Open" ? "red" : r.status === "In progress" ? "amber" : "green"}>{r.status || "Open"}</Badge></td>
              <td className="pm-td-sub">{r.assignedTo || "—"}</td>
              <td className="pm-td-sub">{r.dueDate || "—"}</td>
              <td className="text-end text-nowrap" onClick={e => e.stopPropagation()}>
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditFinding(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setLockFinding(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteFinding(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* ======== SOURCES TAB ======== */}
      {tab === "sources" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Log sources</h3><p>Producers feeding the tamper-evident audit pipeline.</p></div>
          <button className="btn btn-primary btn-sm" onClick={() => setAddSource(true)}><i className="bi bi-plus me-1" />Add source</button>
        </div>
        <div className="row g-3">
          {sources.map(r => <div className="col-md-6 col-xl-4" key={r.id}>
            <div className="pm-card pm-card-pad" style={{ cursor: "pointer" }} onClick={() => setSourceConfig(r)}>
              <div className="d-flex gap-3 align-items-center">
                <div className="pm-stat-ico bg-green-soft text-green"><i className={`bi ${r.icon}`} /></div>
                <div className="flex-grow-1"><b>{r.name}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</b><div className="pm-td-sub">{r.count}</div></div>
                <Badge tone="green" dot>{r.status}</Badge>
              </div>
              <div className="d-flex gap-1 mt-2" onClick={e => e.stopPropagation()}>
                <button className="btn btn-sm btn-outline-primary" onClick={() => setEditSource(r)} title="Edit"><i className="bi bi-pencil" /></button>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setLockSource(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteSource(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </div>
            </div>
          </div>)}
        </div>
      </section>}

      {/* ======== INCIDENTS TAB ======== */}
      {tab === "incidents" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Security incidents</h3><p>Detected security events requiring investigation and resolution.</p></div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setBulkAction({ title: "Acknowledge all incidents", count: incidents.filter(i => i.status === "Under investigation").length, onConfirm: () => { setIncidents(p => p.map(i => i.status === "Under investigation" ? { ...i, status: "Monitoring" } : i)); push({ kind: "success", title: "Incidents acknowledged" }); } })} disabled={incidents.filter(i => i.status === "Under investigation").length === 0}><i className="bi bi-check-all me-1" />Acknowledge all</button>
            <button className="btn btn-primary btn-sm" onClick={() => setIncidentWizard(true)}><i className="bi bi-exclamation-triangle me-1" />Report incident</button>
          </div>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Severity</th><th>Incident</th><th>Detected</th><th>Source</th><th>Target</th><th>Assigned</th><th>Status</th><th className="text-end">Actions</th></tr></thead><tbody>
            {incidents.map(r => <tr key={r.id}>
              <td><Badge tone={r.severity === "Critical" ? "red" : r.severity === "High" ? "amber" : "blue"}>{r.severity}</Badge></td>
              <td className="pm-td-strong">{r.title}</td>
              <td className="pm-td-sub">{r.detectedAt}</td>
              <td>{r.source}</td>
              <td className="mono">{r.target}</td>
              <td className="pm-td-sub">{r.assignedTo || "—"}</td>
              <td><Badge tone={r.status === "Resolved" ? "green" : r.status === "Contained" ? "blue" : r.status === "Under investigation" ? "amber" : "grey"} dot>{r.status}</Badge></td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditIncident(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteIncident(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* ======== SESSIONS TAB ======== */}
      {tab === "sessions" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Active admin sessions</h3><p>Real-time monitoring of all administrator sessions.</p></div>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setBulkAction({ title: "Force logout all idle sessions", count: sessions.filter(s => s.status === "Idle" || s.status === "Expired").length, onConfirm: () => { setSessions(p => p.map(s => s.status !== "Active" ? { ...s, status: "Terminated" } : s)); push({ kind: "success", title: "Idle sessions terminated" }); } })} disabled={sessions.filter(s => s.status !== "Active").length === 0}><i className="bi bi-x-octagon me-1" />Terminate idle</button>
        </div>
        <div className="row g-3">
          {sessions.map(s => <div className="col-md-6 col-xl-4" key={s.id}>
            <div className="pm-card pm-card-pad" style={{ cursor: "pointer", opacity: s.status === "Terminated" ? 0.5 : 1 }} onClick={() => setSessionDetail(s)}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div><b>{s.admin}</b><div className="pm-td-sub">{s.role}</div></div>
                <Badge tone={s.status === "Active" ? "green" : s.status === "Idle" ? "amber" : s.status === "Expired" ? "red" : "grey"} dot>{s.status}</Badge>
              </div>
              <div className="pm-kv"><span className="k">IP</span><span className="v mono">{s.ip}</span></div>
              <div className="pm-kv"><span className="k">Location</span><span className="v">{s.location}</span></div>
              <div className="pm-kv"><span className="k">Last active</span><span className="v">{s.lastActive}</span></div>
              <div className="pm-kv"><span className="k">Actions</span><span className="v">{s.actions}</span></div>
              <div className="pm-kv"><span className="k">MFA</span><span className="v">{s.mfaMethod}</span></div>
            </div>
          </div>)}
        </div>
      </section>}

      {/* ======== ALERTS TAB ======== */}
      {tab === "alerts" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Alert rules</h3><p>Real-time alert configuration for critical audit events.</p></div>
          <button className="btn btn-primary btn-sm" onClick={() => setAddAlertRule(true)}><i className="bi bi-plus me-1" />Add rule</button>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Rule</th><th>Condition</th><th>Threshold</th><th>Action</th><th>Status</th><th>Last triggered</th><th className="text-end">Actions</th></tr></thead><tbody>
            {alertRules.map(r => <tr key={r.id}>
              <td className="pm-td-strong">{r.name}</td>
              <td className="pm-td-sub">{r.condition}</td>
              <td>{r.threshold}</td>
              <td>{r.action}</td>
              <td><Badge tone={r.status === "Active" ? "green" : "amber"} dot>{r.status}</Badge></td>
              <td className="pm-td-sub">{r.lastTriggered || "—"}</td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditAlertRule(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteAlertRule(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* ======== RETENTION TAB ======== */}
      {tab === "retention" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Retention policies</h3><p>How audit data is retained, archived and protected across categories.</p></div>
          <button className="btn btn-primary btn-sm" onClick={() => setRetentionWizard(true)}><i className="bi bi-gear me-1" />Configure retention</button>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Policy</th><th>Scope</th><th>Retention</th><th>Archive</th><th>Delete</th><th>Encryption</th><th>Status</th></tr></thead><tbody>
            {retentionRules.map(r => <tr key={r.id}>
              <td className="pm-td-strong">{r.name}</td>
              <td className="pm-td-sub">{r.scope}</td>
              <td>{r.retention}</td>
              <td>{r.archiveAfter}</td>
              <td>{r.deleteAfter}</td>
              <td><Badge tone="blue">{r.encryption}</Badge></td>
              <td><Badge tone="green" dot>{r.status}</Badge></td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* ======== EXPORTS TAB ======== */}
      {tab === "exports" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Platform data export</h3><p>Export data section by section for external audit and compliance review.</p></div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-primary btn-sm" onClick={() => setExportAll(true)}><i className="bi bi-cloud-download me-1" />Export all sections</button>
            <button className="btn btn-primary btn-sm" onClick={() => setSectionExport(true)}><i className="bi bi-plus me-1" />New export</button>
          </div>
        </div>
        <div className="row g-3">
          {sectionExports.map(se => <div className="col-md-6 col-xl-4" key={se.id}>
            <div className="pm-card pm-card-pad h-100">
              <div className="d-flex gap-3 align-items-center mb-2">
                <div className="pm-stat-ico bg-blue-soft text-blue"><i className={`bi ${se.icon}`} /></div>
                <div className="flex-grow-1"><b>{se.section}</b><div className="pm-td-sub">{se.recordCount} records</div></div>
                {se.encrypted && <i className="bi bi-lock-fill text-success" title="Encrypted" />}
              </div>
              <div className="pm-td-sub small mb-2">{se.description}</div>
              <div className="d-flex justify-content-between align-items-center">
                <div className="small text-muted">Last: {se.lastExported} · {se.format}</div>
                <button className="btn btn-sm btn-outline-primary" onClick={() => { push({ kind: "success", title: `${se.section} export queued`, body: `${se.recordCount} records will be exported.` }); }}><i className="bi bi-download" /></button>
              </div>
            </div>
          </div>)}
        </div>
      </section>}

      {/* ======== GENERIC ACTION MODAL ======== */}
      <Modal open={!!action} onClose={() => setAction(null)} title={action?.title ?? "Audit action"} subtitle="Super Admin action · evidence is permanently logged" icon={action?.icon} tone={action?.tone}>
        <div className="pm-modal-body">{action?.body}</div>
        <div className="pm-modal-foot">
          <button className="btn btn-outline-secondary" onClick={() => setAction(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { setAction(null); push({ kind: "success", title: "Audit operation completed", body: "The action was added to the immutable audit trail." }); }}>Confirm action</button>
        </div>
      </Modal>

      {/* ======== FEATURE MODALS ======== */}
      <AuditEntryDrawer entry={entryDrawer} open={!!entryDrawer} onClose={() => setEntryDrawer(null)} />
      <IncidentWizard open={incidentWizard} onComplete={(inc) => setIncidents(p => [inc, ...p])} onClose={() => setIncidentWizard(false)} />
      <SessionDetailModal session={sessionDetail} open={!!sessionDetail} onClose={() => setSessionDetail(null)} onTerminate={() => { if (sessionDetail) setSessions(p => p.map(s => s.id === sessionDetail.id ? { ...s, status: "Terminated" } : s)); setSessionDetail(null); }} />
      <SectionExportWizard open={sectionExport} onClose={() => setSectionExport(false)} />
      <RetentionPolicyWizard open={retentionWizard} onClose={() => setRetentionWizard(false)} />
      <ComplianceChecklistModal open={complianceCheck} onClose={() => setComplianceCheck(false)} />
      <IntegrityReportModal open={integrityReport} onClose={() => setIntegrityReport(false)} />
      <ForensicInvestigationWizard open={forensicWizard} onClose={() => setForensicWizard(false)} />
      <AuditEvidenceExportModal open={evidenceExport} onClose={() => setEvidenceExport(false)} />
      <DataClassificationModal open={dataClassification} onClose={() => setDataClassification(false)} />
      <RealtimeFeedModal open={realtimeFeed} onClose={() => setRealtimeFeed(false)} />
      <AuditSearchModal open={false} onClose={() => {}} />
      <FindingDetailModal finding={findingDetail} open={!!findingDetail} onClose={() => setFindingDetail(null)} />
      <DataSourceConfigModal source={sourceConfig} open={!!sourceConfig} onClose={() => setSourceConfig(null)} />
      {adminTimeline && <AdminActivityTimelineModal admin={adminTimeline} open={!!adminTimeline} onClose={() => setAdminTimeline(null)} />}
      {bulkAction && <BulkActionModal open={!!bulkAction} title={bulkAction.title} count={bulkAction.count} onClose={() => setBulkAction(null)} onConfirm={bulkAction.onConfirm} />}
      {exportAll && <SectionExportWizard open={exportAll} onClose={() => setExportAll(false)} />}

      {/* ======== CRUD — Logs ======== */}
      <AddRecordModal open={addLog} onClose={() => setAddLog(false)} onAdd={(f) => { handleAddLog(f); setAddLog(false); }} typeName="Audit Entry" fields={logFields} title="" />
      <EditRecordModal open={!!editLog} onClose={() => setEditLog(null)} onSave={(f) => { handleEditLog(f); setEditLog(null); }} record={editLog} typeName="Audit Entry" />
      <DeleteRecordWizard open={!!deleteLog} onClose={() => setDeleteLog(null)} onDelete={handleDeleteLog} record={deleteLog} typeName="Audit Entry" relatedItems={["Hash chain reference", "Search index entries"]} />
      <LockUnlockModal open={!!lockLog} onClose={() => setLockLog(null)} onToggle={handleLockLog} record={lockLog ? { name: lockLog.targetId, locked: !!lockLog.locked, lockedBy: lockLog.lockedBy, lockedAt: lockLog.lockedAt, lockReason: lockLog.lockReason } : null} typeName="Audit Entry" />

      {/* ======== CRUD — Findings ======== */}
      <AddRecordModal open={addFinding} onClose={() => setAddFinding(false)} onAdd={(f) => { handleAddFinding(f); setAddFinding(false); }} typeName="Finding" fields={findingFields} title="" />
      <EditRecordModal open={!!editFinding} onClose={() => setEditFinding(null)} onSave={(f) => { handleEditFinding(f); setEditFinding(null); }} record={editFinding} typeName="Finding" />
      <DeleteRecordWizard open={!!deleteFinding} onClose={() => setDeleteFinding(null)} onDelete={handleDeleteFinding} record={deleteFinding} typeName="Finding" relatedItems={["Remediation tasks", "Compliance checklist items"]} />
      <LockUnlockModal open={!!lockFinding} onClose={() => setLockFinding(null)} onToggle={handleLockFinding} record={lockFinding ? { name: lockFinding.finding, locked: !!lockFinding.locked, lockedBy: lockFinding.lockedBy, lockedAt: lockFinding.lockedAt, lockReason: lockFinding.lockReason } : null} typeName="Finding" />

      {/* ======== CRUD — Sources ======== */}
      <AddRecordModal open={addSource} onClose={() => setAddSource(false)} onAdd={(f) => { handleAddSource(f); setAddSource(false); }} typeName="Log Source" fields={sourceFields} title="" />
      <EditRecordModal open={!!editSource} onClose={() => setEditSource(null)} onSave={(f) => { handleEditSource(f); setEditSource(null); }} record={editSource} typeName="Log Source" />
      <DeleteRecordWizard open={!!deleteSource} onClose={() => setDeleteSource(null)} onDelete={handleDeleteSource} record={deleteSource} typeName="Log Source" relatedItems={["Audit entries from this source", "Index entries", "Storage allocations"]} />
      <LockUnlockModal open={!!lockSource} onClose={() => setLockSource(null)} onToggle={handleLockSource} record={lockSource ? { name: lockSource.name, locked: !!lockSource.locked, lockedBy: lockSource.lockedBy, lockedAt: lockSource.lockedAt, lockReason: lockSource.lockReason } : null} typeName="Log Source" />

      {/* ======== CRUD — Incidents ======== */}
      <EditRecordModal open={!!editIncident} onClose={() => setEditIncident(null)} onSave={(f) => { handleEditIncident(f); setEditIncident(null); }} record={editIncident} typeName="Incident" excludeKeys={["id", "locked", "lockedBy", "lockedAt"]} />
      <DeleteRecordWizard open={!!deleteIncident} onClose={() => setDeleteIncident(null)} onDelete={handleDeleteIncident} record={deleteIncident} typeName="Incident" relatedItems={["Evidence collected", "Investigation notes", "Containment actions", "Audit trail entries"]} />

      {/* ======== CRUD — Alert Rules ======== */}
      <AlertRuleConfigModal open={addAlertRule} rule={null} onClose={() => setAddAlertRule(false)} onSave={(f) => { handleAddAlertRule(f); setAddAlertRule(false); }} />
      <AlertRuleConfigModal open={!!editAlertRule} rule={editAlertRule} onClose={() => setEditAlertRule(null)} onSave={(f) => { handleEditAlertRule(f); setEditAlertRule(null); }} />
      <DeleteRecordWizard open={!!deleteAlertRule} onClose={() => setDeleteAlertRule(null)} onDelete={handleDeleteAlertRule} record={deleteAlertRule} typeName="Alert Rule" relatedItems={["Trigger history", "Recipient notifications"]} />

      {/* ======== RETENTION POLICY DRAWER ======== */}
      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Audit Retention Policy" subtitle="Tamper evidence, retention and export controls" icon="bi-shield-check" wide>
        <div className="pm-card pm-card-pad mb-3"><Badge tone="green" dot>Integrity verified</Badge>
          <h5 className="mt-3">7-year immutable retention</h5>
          <p className="small text-muted">Events are hash-chained, replicated and protected from administrator deletion.</p>
        </div>
        <div className="pm-card pm-card-pad">
          <h6>Policy controls</h6>
          {[["Retention period", "7 years"], ["Oldest entry", "Jan 15, 2024"], ["Storage", "45 GB · encrypted"], ["Deletion policy", "No manual deletion"], ["Export signing", "HSM-backed signature"], ["Replication", "3 of 3 replicas verified"], ["Chain integrity", "Last verified: 2 min ago"]].map(([k, v]) => <div className="d-flex justify-content-between py-2 border-bottom small" key={k}><span className="text-muted">{k}</span><b>{v}</b></div>)}
        </div>
      </Drawer>
    </div>
  );
}
