import { useCallback, useMemo, useState } from "react";
import { Badge, Drawer, Modal, Steps, useToast } from "../../../components/ui";
import { AdminRowActions, AddRecordModal, EditRecordModal, DeleteRecordWizard, LockUnlockModal, DocumentPreviewModal } from "../../../components/AdminControls";
import {
  type FlagRecord, type AbTestRecord, type MetricRecord, type AuditRecord, type ArchivedRecord, type SchedulerRecord,
  initialFlags, initialTests, initialMetrics, initialAudit, initialArchived, initialScheduler
} from "../data/flagData";

type A = { title: string; body: React.ReactNode; icon?: string; tone?: "green" | "red" | "amber" | "blue" | "violet" | "ink" };

export function FeatureFlags({ signal: _signal }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  const { push } = useToast();
  const [tab, setTab] = useState("flags");
  const [q, setQ] = useState("");
  const [action, setAction] = useState<A | null>(null);
  const [drawer, setDrawer] = useState<string | null>(null);
  const [wizard, setWizard] = useState(false);
  const [step, setStep] = useState(0);

  // Data state
  const [flags, setFlags] = useState<FlagRecord[]>(initialFlags);
  const [tests, setTests] = useState<AbTestRecord[]>(initialTests);
  const [metrics] = useState<MetricRecord[]>(initialMetrics);
  const [audit, setAudit] = useState<AuditRecord[]>(initialAudit);
  const [archived, setArchived] = useState<ArchivedRecord[]>(initialArchived);
  const [scheduler] = useState<SchedulerRecord[]>(initialScheduler);

  // CRUD modals state
  const [editFlag, setEditFlag] = useState<FlagRecord | null>(null);
  const [deleteFlag, setDeleteFlag] = useState<FlagRecord | null>(null);
  const [lockFlag, setLockFlag] = useState<FlagRecord | null>(null);
  const [addFlag, setAddFlag] = useState(false);
  const [previewFlag, setPreviewFlag] = useState<FlagRecord | null>(null);

  const [editTest, setEditTest] = useState<AbTestRecord | null>(null);
  const [deleteTest, setDeleteTest] = useState<AbTestRecord | null>(null);
  const [lockTest, setLockTest] = useState<AbTestRecord | null>(null);

  const [editArchived, setEditArchived] = useState<ArchivedRecord | null>(null);
  const [deleteArchived, setDeleteArchived] = useState<ArchivedRecord | null>(null);
  const [lockArchived, setLockArchived] = useState<ArchivedRecord | null>(null);

  const filtered = useMemo(() => flags.filter(r => [r.name, r.key, r.owner, r.state, r.target].join(" ").toLowerCase().includes(q.toLowerCase())), [q, flags]);

  const ask = (title: string, body: React.ReactNode, tone: A["tone"] = "green", icon = "bi-check2-circle") => setAction({ title, body, tone, icon });

  // CRUD handlers - Flags
  const handleAddFlag = useCallback((form: Record<string, string>) => {
    const newFlag: FlagRecord = { id: `fl-${Date.now()}`, name: form.name || "New Flag", key: form.key || "feat.new_flag", state: "Disabled", rollout: "0%", target: "—", created: new Date().toLocaleDateString(), owner: form.owner || "Product", description: form.description, strategy: form.strategy || "Gradual percentage" };
    setFlags(p => [newFlag, ...p]);
    setAudit(p => [{ id: `a-${Date.now()}`, date: new Date().toLocaleDateString(), admin: "Super Admin", flag: newFlag.key, change: "Created", reason: "New flag" }, ...p]);
  }, []);

  const handleEditFlag = useCallback((form: Record<string, string>) => {
    if (!editFlag) return;
    setFlags(p => p.map(f => f.id === editFlag.id ? { ...f, ...form } : f));
    setAudit(p => [{ id: `a-${Date.now()}`, date: new Date().toLocaleDateString(), admin: "Super Admin", flag: editFlag.key, change: "Updated", reason: "Admin edit" }, ...p]);
  }, [editFlag]);

  const handleDeleteFlag = useCallback(() => {
    if (!deleteFlag) return;
    setFlags(p => p.filter(f => f.id !== deleteFlag.id));
    setAudit(p => [{ id: `a-${Date.now()}`, date: new Date().toLocaleDateString(), admin: "Super Admin", flag: deleteFlag.key, change: "Deleted", reason: "Admin deletion" }, ...p]);
  }, [deleteFlag]);

  const handleLockFlag = useCallback((locked: boolean) => {
    if (!lockFlag) return;
    setFlags(p => p.map(f => f.id === lockFlag.id ? { ...f, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Admin lock" : undefined } : f));
  }, [lockFlag]);

  // CRUD handlers - Tests
  const handleEditTest = useCallback((form: Record<string, string>) => {
    if (!editTest) return;
    setTests(p => p.map(t => t.id === editTest.id ? { ...t, ...form } : t));
  }, [editTest]);

  const handleDeleteTest = useCallback(() => {
    if (!deleteTest) return;
    setTests(p => p.filter(t => t.id !== deleteTest.id));
  }, [deleteTest]);

  const handleLockTest = useCallback((locked: boolean) => {
    if (!lockTest) return;
    setTests(p => p.map(t => t.id === lockTest.id ? { ...t, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Admin lock" : undefined } : t));
  }, [lockTest]);

  // CRUD handlers - Archived
  const handleEditArchived = useCallback((form: Record<string, string>) => {
    if (!editArchived) return;
    setArchived(p => p.map(a => a.id === editArchived.id ? { ...a, ...form } : a));
  }, [editArchived]);

  const handleDeleteArchived = useCallback(() => {
    if (!deleteArchived) return;
    setArchived(p => p.filter(a => a.id !== deleteArchived.id));
  }, [deleteArchived]);

  const handleLockArchived = useCallback((locked: boolean) => {
    if (!lockArchived) return;
    setArchived(p => p.map(a => a.id === lockArchived.id ? { ...a, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Admin lock" : undefined } : a));
  }, [lockArchived]);

  const addFlagFields = [
    { label: "name", placeholder: "Feature flag name", required: true },
    { label: "key", placeholder: "feat.feature_name", required: true },
    { label: "owner", placeholder: "Product / Engineering / ML Team" },
    { label: "strategy", placeholder: "Gradual percentage / User segment / Whitelist" },
    { label: "description", placeholder: "Flag description" },
  ];

  const testFlagFields = [
    { label: "name", placeholder: "A/B test name", required: true },
    { label: "flag", placeholder: "feat.feature_name", required: true },
    { label: "metric", placeholder: "Primary metric" },
    { label: "variantA", placeholder: "Control variant description" },
    { label: "variantB", placeholder: "Test variant description" },
  ];

  return (
    <div className="pm-page-content flags-page">
      <div className="pm-section-head" style={{ marginTop: 0 }}>
        <div>
          <div className="pm-eyebrow">PLATFORM ADMINISTRATION / PAGE 34</div>
          <h2 className="mb-1">Feature Flags</h2>
          <p>Manage progressive rollouts, experiments, kill switches and feature release governance.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setAction({ title: "Compliance Audit Trail", body: <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Date</th><th>Admin</th><th>Flag</th><th>Change</th><th>Reason</th></tr></thead><tbody>{audit.map(a => <tr key={a.id}><td>{a.date}</td><td className="pm-td-strong">{a.admin}</td><td className="mono">{a.flag}</td><td>{a.change}</td><td>{a.reason}</td></tr>)}</tbody></table></div>, tone: "blue", icon: "bi-clock-history" })}><i className="bi bi-clock-history me-1" />Audit trail</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setAction({ title: "Admin Permissions", body: <div><div className="pm-card pm-card-pad mb-3"><h6>Role-based access</h6>{[["Super Admin", "Full access: create, edit, delete, lock, rollback, kill switch"], ["Product Lead", "Edit rollouts, advance schedule, view metrics"], ["ML Lead", "Edit ML flags, view metrics, pause"], ["Engineering", "Edit infra flags, view metrics"], ["Viewer", "Read-only access to flag state"]].map(([role, perm]) => <div className="d-flex justify-content-between py-1 border-bottom small" key={role}><span className="pm-td-strong">{role}</span><span className="text-muted">{perm}</span></div>)}</div></div>, tone: "blue", icon: "bi-shield-lock" })}><i className="bi bi-shield-lock me-1" />Permissions</button>
          <button className="btn btn-outline-danger btn-sm" onClick={() => ask("Emergency kill switch", <div><div className="alert alert-danger small"><i className="bi bi-exclamation-triangle me-1" />This will immediately disable ALL feature flags not at 100% rollout.</div><h6>Flags affected:</h6>{flags.filter(f => f.rollout !== "100%").map(f => <div className="d-flex justify-content-between py-1 border-bottom small" key={f.id}><span>{f.name}</span><Badge tone="amber">{f.rollout}</Badge></div>)}</div>, "red", "bi-lightning-charge")}>Kill switches</button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => setDrawer("scheduler")}><i className="bi bi-calendar2-week me-1" />Rollout scheduler</button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => setAction({ title: "Data Export", body: <div><p>All feature flag data, metrics, A/B test results and audit logs can be exported.</p><div className="d-grid gap-2 mt-3"><button className="btn btn-outline-primary btn-sm" onClick={() => { push({ kind: "success", title: "Export started" }); setAction(null); }}>Export as CSV</button><button className="btn btn-outline-primary btn-sm" onClick={() => { push({ kind: "success", title: "Export started" }); setAction(null); }}>Export as JSON</button></div></div>, tone: "blue", icon: "bi-download" })}><i className="bi bi-download me-1" />Export</button>
          <button className="btn btn-primary btn-sm" onClick={() => { setStep(0); setWizard(true); }}><i className="bi bi-flag me-1" />Create flag</button>
        </div>
      </div>

      {/* Hero */}
      <div className="pm-hero flags-hero mb-3">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <div className="pm-eyebrow text-white-50">RELEASE CONTROL · PROGRESSIVE DELIVERY</div>
            <div className="pm-hero-value">{flags.filter(f => f.state !== "Disabled").length} <span className="fs-6 fw-normal text-white-50">active feature flags</span></div>
            <div className="small text-white-50 mt-2">{tests.filter(t => t.result === "Running").length} active experiments · {flags.filter(f => f.state === "Beta").length} beta rollouts · every change requires owner and audit evidence</div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <div className="pm-hero-chip"><div className="l">Flags at 100%</div><div className="v text-success">{flags.filter(f => f.rollout === "100%").length}</div></div>
            <div className="pm-hero-chip"><div className="l">Experiments running</div><div className="v">{tests.filter(t => t.result === "Running").length}</div></div>
            <div className="pm-hero-chip"><div className="l">Locked flags</div><div className="v text-warning">{flags.filter(f => f.locked).length}</div></div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-3">
        {[
          ["Active flags", String(flags.filter(f => f.state !== "Disabled").length), "Across product and risk", "bi-flag", "green"],
          ["Experiment tests", String(tests.length), `${tests.filter(t => t.result === "Running").length} currently running`, "bi-beaker", "blue"],
          ["Average rollout", "42%", "Weighted by active users", "bi-percent", "violet"],
          ["Safety controls", "7", "Kill switches armed", "bi-shield-check", "amber"]
        ].map(x => <div className="col-6 col-xl-3" key={x[0]}><div className="pm-stat" style={{ cursor: "pointer" }} onClick={() => ask(x[0], <div><p>{x[2]}</p><div className="pm-card pm-card-pad mt-2"><div className="pm-eyebrow mb-1">Details</div><div className="pm-td-strong">{x[1]} {x[0]}</div></div></div>, x[4] as any, x[3])}><div className={`pm-stat-ico bg-${x[4]}-soft text-${x[4]}`}><i className={`bi ${x[3]}`} /></div><div className="pm-stat-label">{x[0]}</div><div className="pm-stat-value">{x[1]}</div><div className="pm-stat-foot">{x[2]}</div></div></div>)}
      </div>

      {/* Tabs */}
      <div className="pm-card mb-3">
        <div className="pm-tabs">
          {[
            ["flags", "Active flags", "bi-flag"], ["tests", "A/B tests", "bi-beaker"], ["metrics", "Performance metrics", "bi-graph-up-arrow"],
            ["scheduler", "Rollout scheduler", "bi-calendar2-week"], ["audit", "Audit trail", "bi-clock-history"], ["archived", "Archived flags", "bi-archive"]
          ].map(x => <button className={`pm-tab ${tab === x[0] ? "active" : ""}`} key={x[0]} onClick={() => setTab(x[0])}><i className={`bi ${x[2]}`} />{x[1]}</button>)}
        </div>
      </div>

      {/* === FLAGS TAB === */}
      {tab === "flags" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Active feature flags</h3><p>Current flag state, rollout percentage, targeting and accountable owner.</p></div>
          <div className="d-flex gap-2 align-items-center">
            <div className="pm-search"><i className="bi bi-search" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search flag, key or owner" /></div>
            <button className="btn btn-primary btn-sm" onClick={() => setAddFlag(true)}><i className="bi bi-plus me-1" />Add flag</button>
          </div>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Flag</th><th>Key</th><th>State</th><th>Rollout</th><th>Target</th><th>Created</th><th>Owner</th><th className="text-end">Actions</th></tr></thead><tbody>
            {filtered.map(r => <tr key={r.id}>
              <td className="pm-td-strong">{r.name}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td>
              <td className="mono">{r.key}</td>
              <td><Badge tone={r.state === "Enabled" ? "green" : r.state === "Beta" ? "amber" : "grey"}>{r.state}</Badge></td>
              <td><b>{r.rollout}</b><div className="mt-1"><div className="pm-meter" style={{ width: 70 }}><span style={{ width: r.rollout, background: "#12b76a" }} /></div></div></td>
              <td>{r.target}</td>
              <td>{r.created}</td>
              <td>{r.owner}</td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-info me-1" onClick={() => setPreviewFlag(r)} title="Preview"><i className="bi bi-eye" /></button>
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditFlag(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setLockFlag(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteFlag(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* === TESTS TAB === */}
      {tab === "tests" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>A/B test management</h3><p>Experiment variants, sample sizes, duration and outcome.</p></div>
          <button className="btn btn-primary btn-sm" onClick={() => setWizard(true)}><i className="bi bi-plus me-1" />New test</button>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Test</th><th>Flag</th><th>Variant A</th><th>Variant B</th><th>Metric</th><th>Sample</th><th>Duration</th><th>Result</th><th className="text-end">Actions</th></tr></thead><tbody>
            {tests.map(r => <tr key={r.id}>
              <td className="pm-td-strong">{r.name}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td>
              <td className="mono">{r.flag}</td>
              <td>{r.variantA}</td>
              <td>{r.variantB}</td>
              <td>{r.metric}</td>
              <td>{r.sample}</td>
              <td>{r.duration}</td>
              <td><Badge tone={r.result.includes("won") ? "green" : "blue"} dot>{r.result}</Badge></td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditTest(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setLockTest(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteTest(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* === METRICS TAB === */}
      {tab === "metrics" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Flag performance metrics</h3><p>Control versus variant outcomes and statistical significance.</p></div>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => ask("Metrics exported", "Feature performance metrics were exported.", "blue", "bi-download")}><i className="bi bi-download me-1" />Export metrics</button>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Flag</th><th>Metric</th><th>Control</th><th>Variant</th><th>Delta</th><th>Significance</th></tr></thead><tbody>
            {metrics.map(r => <tr key={r.id}>
              <td className="pm-td-strong">{r.flag}</td>
              <td>{r.metric}</td>
              <td className="pm-num">{r.control}</td>
              <td className="pm-num">{r.variant}</td>
              <td className="pm-num">{r.delta}</td>
              <td><Badge tone={r.significance.includes("0.10") ? "amber" : "green"}>{r.significance}</Badge></td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* === SCHEDULER TAB === */}
      {tab === "scheduler" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Gradual rollout scheduler</h3><p>Advance, pause or rollback rollout percentages against measurable criteria.</p></div>
        </div>
        <div className="row g-3">
          {scheduler.map(r => <div className="col-lg-4" key={r.id}>
            <div className="pm-card pm-card-pad">
              <div className="d-flex justify-content-between"><h6>{r.flag}</h6><Badge tone="blue">{r.current}</Badge></div>
              <div className="small text-muted mt-2">Schedule: {r.schedule}</div>
              <div className="small mt-2"><b>Advance when:</b> {r.criteria}</div>
              <div className="small text-muted mt-2">Owner: {r.owner} · Next advance in {r.nextAdvance}</div>
              <div className="d-flex gap-2 mt-3">
                <button className="btn btn-sm btn-outline-warning" onClick={() => ask("Rollout paused", `${r.flag} will stop advancing until resumed.`, "amber", "bi-pause-circle")}><i className="bi bi-pause-circle me-1" />Pause</button>
                <button className="btn btn-sm btn-outline-primary" onClick={() => ask("Rollout advanced", `${r.flag} moved to the next percentage.`, "green", "bi-arrow-up-circle")}><i className="bi bi-arrow-up-circle me-1" />Advance</button>
              </div>
            </div>
          </div>)}
        </div>
      </section>}

      {/* === AUDIT TAB === */}
      {tab === "audit" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Flag audit trail</h3><p>Every flag creation, rollout and emergency action with reason.</p></div>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => ask("Audit exported", "The audit trail was exported.", "blue", "bi-download")}><i className="bi bi-download me-1" />Export</button>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Date</th><th>Admin</th><th>Flag</th><th>Change</th><th>Reason</th></tr></thead><tbody>
            {audit.map(r => <tr key={r.id}>
              <td>{r.date}</td>
              <td className="pm-td-strong">{r.admin}</td>
              <td className="mono">{r.flag}</td>
              <td>{r.change}</td>
              <td>{r.reason}</td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* === ARCHIVED TAB === */}
      {tab === "archived" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Archived flags</h3><p>Completed, replaced and cancelled feature releases.</p></div>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => ask("Archive report ready", "Archived feature flag outcomes were exported.", "blue", "bi-download")}><i className="bi bi-download me-1" />Export</button>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Flag</th><th>Enabled period</th><th>Final rollout</th><th>Outcome</th><th>Archived date</th><th className="text-end">Actions</th></tr></thead><tbody>
            {archived.map(r => <tr key={r.id}>
              <td className="pm-td-strong">{r.flag}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td>
              <td>{r.period}</td>
              <td>{r.rollout}</td>
              <td><Badge tone={r.outcome.includes("Success") ? "green" : "grey"}>{r.outcome}</Badge></td>
              <td>{r.date}</td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditArchived(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setLockArchived(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteArchived(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* Generic action modal */}
      <Modal open={!!action} onClose={() => setAction(null)} title={action?.title ?? "Flag action"} subtitle="Super Admin action · rollout changes are versioned and audited" icon={action?.icon} tone={action?.tone}>
        <div className="pm-modal-body">{action?.body}</div>
        <div className="pm-modal-foot">
          <button className="btn btn-outline-secondary" onClick={() => setAction(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { setAction(null); push({ kind: "success", title: "Flag workspace updated", body: "The rollout action was added to the audit trail." }); }}>Confirm action</button>
        </div>
      </Modal>

      {/* Create flag wizard */}
      <Modal open={wizard} onClose={() => setWizard(false)} title="Create feature flag" subtitle="Define targeting, rollout safety and ownership before release" icon="bi-flag" tone="green" size="lg">
        <Steps current={step} steps={[{ label: "Identity", icon: "bi-flag" }, { label: "Targeting", icon: "bi-people" }, { label: "Metrics", icon: "bi-graph-up" }, { label: "Review", icon: "bi-check2" }]} />
        <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 25}%` }} /></div>
        <div className="pm-modal-body">
          <div className="pm-note mb-3"><i className="bi bi-shield-lock me-1" />Only Super Admins can create flags. All actions are audit-logged.</div>
          <div className="row g-3">
            <div className="col-md-7"><label className="form-label">Flag name</label><input className="form-control" placeholder="New product experiment" /></div>
            <div className="col-md-5"><label className="form-label">Owner</label><select className="form-select"><option>Product</option><option>Engineering</option><option>ML Team</option><option>Growth</option></select></div>
            <div className="col-md-6"><label className="form-label">Rollout strategy</label><select className="form-select"><option>Gradual percentage</option><option>User segment</option><option>Whitelist</option></select></div>
            <div className="col-md-6"><label className="form-label">Initial rollout</label><input className="form-control" defaultValue="10%" /></div>
            <div className="col-12"><label className="form-label">Fallback and success criteria</label><textarea className="form-control" rows={3} placeholder="Fallback to current production behaviour. Advance only when no critical metric regresses." /></div>
          </div>
        </div>
        <div className="pm-modal-foot">
          <button className="btn btn-outline-secondary" onClick={() => step ? setStep(step - 1) : setWizard(false)}>{step ? "Back" : "Cancel"}</button>
          {step < 3 ? <button className="btn btn-primary" onClick={() => setStep(step + 1)}>Continue</button> : <button className="btn btn-primary" onClick={() => { setWizard(false); push({ kind: "success", title: "Feature flag submitted", body: "The flag is pending owner and Super Admin approval." }); }}>Submit for approval</button>}
        </div>
      </Modal>

      {/* Scheduler drawer */}
      <Drawer open={drawer === "scheduler"} onClose={() => setDrawer(null)} title="Rollout Scheduler" subtitle="Advance, pause or rollback flag rollouts" icon="bi-calendar2-week" wide>
        <div className="pm-card pm-card-pad mb-3"><h6>Active rollout schedules</h6>
          {scheduler.map(r => <div className="pm-card pm-card-pad mb-2" key={r.id}>
            <div className="d-flex justify-content-between"><b>{r.flag}</b><Badge tone="blue">{r.current}</Badge></div>
            <div className="small text-muted mt-1">Schedule: {r.schedule} · Owner: {r.owner}</div>
            <div className="d-flex gap-2 mt-2">
              <button className="btn btn-sm btn-outline-warning" onClick={() => { push({ kind: "success", title: "Rollout paused" }); }}><i className="bi bi-pause-circle me-1" />Pause</button>
              <button className="btn btn-sm btn-outline-primary" onClick={() => { push({ kind: "success", title: "Rollout advanced" }); }}><i className="bi bi-arrow-up-circle me-1" />Advance</button>
            </div>
          </div>)}
        </div>
      </Drawer>

      {/* CRUD Modals */}
      <AddRecordModal open={addFlag} onClose={() => setAddFlag(false)} onAdd={handleAddFlag} fields={addFlagFields} title="Add New Feature Flag" icon="bi-flag" />
      <EditRecordModal open={!!editFlag} onClose={() => setEditFlag(null)} onSave={handleEditFlag} record={editFlag} title={`Edit: ${editFlag?.name ?? ""}`} icon="bi-pencil-square" />
      <DeleteRecordWizard open={!!deleteFlag} onClose={() => setDeleteFlag(null)} onDelete={handleDeleteFlag} name={deleteFlag?.name ?? ""} relatedCount={3} dependencyCount={2} />
      <LockUnlockModal open={!!lockFlag} onClose={() => setLockFlag(null)} onToggle={handleLockFlag} record={lockFlag ? { name: lockFlag.name, locked: !!lockFlag.locked, lockedBy: lockFlag.lockedBy, lockedAt: lockFlag.lockedAt, lockReason: lockFlag.lockReason } : null} />
      <DocumentPreviewModal open={!!previewFlag} onClose={() => setPreviewFlag(null)} title={previewFlag?.name ?? ""} body={previewFlag ? <div><div className="mb-2"><b>Key:</b> {previewFlag.key}</div><div className="mb-2"><b>State:</b> {previewFlag.state}</div><div className="mb-2"><b>Rollout:</b> {previewFlag.rollout}</div><div className="mb-2"><b>Target:</b> {previewFlag.target}</div><div className="mb-2"><b>Strategy:</b> {previewFlag.strategy}</div><div className="mb-2"><b>Owner:</b> {previewFlag.owner}</div><div className="mb-2"><b>Description:</b> {previewFlag.description || "—"}</div></div> : <div />} />

      <EditRecordModal open={!!editTest} onClose={() => setEditTest(null)} onSave={handleEditTest} record={editTest} title={`Edit: ${editTest?.name ?? ""}`} icon="bi-pencil-square" />
      <DeleteRecordWizard open={!!deleteTest} onClose={() => setDeleteTest(null)} onDelete={handleDeleteTest} name={deleteTest?.name ?? ""} relatedCount={2} dependencyCount={1} />
      <LockUnlockModal open={!!lockTest} onClose={() => setLockTest(null)} onToggle={handleLockTest} record={lockTest ? { name: lockTest.name, locked: !!lockTest.locked, lockedBy: lockTest.lockedBy, lockedAt: lockTest.lockedAt, lockReason: lockTest.lockReason } : null} />

      <EditRecordModal open={!!editArchived} onClose={() => setEditArchived(null)} onSave={handleEditArchived} record={editArchived} title={`Edit: ${editArchived?.flag ?? ""}`} icon="bi-pencil-square" />
      <DeleteRecordWizard open={!!deleteArchived} onClose={() => setDeleteArchived(null)} onDelete={handleDeleteArchived} name={deleteArchived?.flag ?? ""} relatedCount={0} dependencyCount={0} />
      <LockUnlockModal open={!!lockArchived} onClose={() => setLockArchived(null)} onToggle={handleLockArchived} record={lockArchived ? { name: lockArchived.flag, locked: !!lockArchived.locked, lockedBy: lockArchived.lockedBy, lockedAt: lockArchived.lockedAt, lockReason: lockArchived.lockReason } : null} />
    </div>
  );
}
