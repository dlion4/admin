import { useCallback, useMemo, useState } from "react";
import { Badge, Drawer, Modal, Steps, useToast } from "../../../components/ui";
import { AdminRowActions, AddRecordModal, EditRecordModal, DeleteRecordWizard, LockUnlockModal } from "../../../components/AdminControls";
import {
  type EcosystemRecord, type EndpointRecord, type BankRecord, type IncidentRecord, type CallbackRecord,
  initialEcosystems, initialEndpoints, initialBanks, initialIncidents, initialCallbacks
} from "../data/healthData";

type A = { title: string; body: React.ReactNode; icon?: string; tone?: "green" | "red" | "amber" | "blue" | "violet" | "ink" };

export function ApiHealth({ signal: _signal }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  const { push } = useToast();
  const [tab, setTab] = useState("overview");
  const [action, setAction] = useState<A | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [wizard, setWizard] = useState(false);
  const [step, setStep] = useState(0);

  // Data state
  const [ecosystems, setEcosystems] = useState<EcosystemRecord[]>(initialEcosystems);
  const [endpoints, setEndpoints] = useState<EndpointRecord[]>(initialEndpoints);
  const [banks, setBanks] = useState<BankRecord[]>(initialBanks);
  const [incidents, setIncidents] = useState<IncidentRecord[]>(initialIncidents);
  const [callbacks] = useState<CallbackRecord[]>(initialCallbacks);

  // CRUD modals
  const [editEco, setEditEco] = useState<EcosystemRecord | null>(null);
  const [deleteEco, setDeleteEco] = useState<EcosystemRecord | null>(null);
  const [lockEco, setLockEco] = useState<EcosystemRecord | null>(null);
  const [addEco, setAddEco] = useState(false);

  const [editEndpoint, setEditEndpoint] = useState<EndpointRecord | null>(null);
  const [deleteEndpoint, setDeleteEndpoint] = useState<EndpointRecord | null>(null);
  const [lockEndpoint, setLockEndpoint] = useState<EndpointRecord | null>(null);
  const [addEndpoint, setAddEndpoint] = useState(false);

  const [editBank, setEditBank] = useState<BankRecord | null>(null);
  const [deleteBank, setDeleteBank] = useState<BankRecord | null>(null);
  const [lockBank, setLockBank] = useState<BankRecord | null>(null);
  const [addBank, setAddBank] = useState(false);

  const [editIncident, setEditIncident] = useState<IncidentRecord | null>(null);
  const [deleteIncident, setDeleteIncident] = useState<IncidentRecord | null>(null);
  const [lockIncident, setLockIncident] = useState<IncidentRecord | null>(null);
  const [addIncident, setAddIncident] = useState(false);

  const ask = (title: string, body: React.ReactNode, tone: A["tone"] = "green", icon = "bi-check2-circle") => setAction({ title, body, tone, icon });

  // CRUD handlers
  const handleAddEco = useCallback((form: Record<string, string>) => {
    setEcosystems(p => [{ id: `eco-${Date.now()}`, name: form.name || "New Ecosystem", endpoints: "0", healthy: "0", degraded: "0", down: "0", score: "100%" }, ...p]);
  }, []);
  const handleEditEco = useCallback((form: Record<string, string>) => { if (!editEco) return; setEcosystems(p => p.map(e => e.id === editEco.id ? { ...e, ...form } : e)); }, [editEco]);
  const handleDeleteEco = useCallback(() => { if (!deleteEco) return; setEcosystems(p => p.filter(e => e.id !== deleteEco.id)); }, [deleteEco]);
  const handleLockEco = useCallback((locked: boolean) => { if (!lockEco) return; setEcosystems(p => p.map(e => e.id === lockEco.id ? { ...e, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Admin lock" : undefined } : e)); }, [lockEco]);

  const handleAddEndpoint = useCallback((form: Record<string, string>) => {
    setEndpoints(p => [{ id: `ep-${Date.now()}`, name: form.name || "New Endpoint", purpose: form.purpose || "—", method: form.method || "GET", url: form.url || "—", health: "Up", latency: "0ms", errorRate: "0%", uptime: "100%", circuit: "Closed", ecosystem: form.ecosystem || "Internal" }, ...p]);
  }, []);
  const handleEditEndpoint = useCallback((form: Record<string, string>) => { if (!editEndpoint) return; setEndpoints(p => p.map(e => e.id === editEndpoint.id ? { ...e, ...form } : e)); }, [editEndpoint]);
  const handleDeleteEndpoint = useCallback(() => { if (!deleteEndpoint) return; setEndpoints(p => p.filter(e => e.id !== deleteEndpoint.id)); }, [deleteEndpoint]);
  const handleLockEndpoint = useCallback((locked: boolean) => { if (!lockEndpoint) return; setEndpoints(p => p.map(e => e.id === lockEndpoint.id ? { ...e, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Admin lock" : undefined } : e)); }, [lockEndpoint]);

  const handleAddBank = useCallback((form: Record<string, string>) => {
    setBanks(p => [{ id: `bk-${Date.now()}`, name: form.name || "New Bank", code: form.code || "00", transfer: "Up", validation: "Up", latency: "0s", successRate: "100%", lastTxn: "—" }, ...p]);
  }, []);
  const handleEditBank = useCallback((form: Record<string, string>) => { if (!editBank) return; setBanks(p => p.map(b => b.id === editBank.id ? { ...b, ...form } : b)); }, [editBank]);
  const handleDeleteBank = useCallback(() => { if (!deleteBank) return; setBanks(p => p.filter(b => b.id !== deleteBank.id)); }, [deleteBank]);
  const handleLockBank = useCallback((locked: boolean) => { if (!lockBank) return; setBanks(p => p.map(b => b.id === lockBank.id ? { ...b, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Admin lock" : undefined } : b)); }, [lockBank]);

  const handleAddIncident = useCallback((form: Record<string, string>) => {
    setIncidents(p => [{ id: `inc-${Date.now()}`, incident: `INC-${Math.floor(Math.random() * 900) + 100}`, service: form.service || "Unknown", state: "Degraded", impact: form.impact || "Unknown", owner: form.owner || "Platform Ops", status: "Investigating", openedAt: new Date().toLocaleTimeString() }, ...p]);
  }, []);
  const handleEditIncident = useCallback((form: Record<string, string>) => { if (!editIncident) return; setIncidents(p => p.map(i => i.id === editIncident.id ? { ...i, ...form } : i)); }, [editIncident]);
  const handleDeleteIncident = useCallback(() => { if (!deleteIncident) return; setIncidents(p => p.filter(i => i.id !== deleteIncident.id)); }, [deleteIncident]);
  const handleLockIncident = useCallback((locked: boolean) => { if (!lockIncident) return; setIncidents(p => p.map(i => i.id === lockIncident.id ? { ...i, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Admin lock" : undefined } : i)); }, [lockIncident]);

  const ecoFields = [{ label: "name", placeholder: "Ecosystem name", required: true }];
  const endpointFields = [{ label: "name", placeholder: "Endpoint name", required: true }, { label: "purpose", placeholder: "Purpose" }, { label: "method", placeholder: "GET / POST" }, { label: "url", placeholder: "Endpoint URL" }, { label: "ecosystem", placeholder: "Ecosystem" }];
  const bankFields = [{ label: "name", placeholder: "Bank name", required: true }, { label: "code", placeholder: "Bank code" }];
  const incidentFields = [{ label: "service", placeholder: "Affected service", required: true }, { label: "impact", placeholder: "Impact description" }, { label: "owner", placeholder: "Team owner" }];

  const healthyCount = ecosystems.reduce((s, e) => s + Number(e.healthy), 0);
  const degradedCount = ecosystems.reduce((s, e) => s + Number(e.degraded), 0);

  return (
    <div className="pm-page-content health-page">
      <div className="pm-section-head" style={{ marginTop: 0 }}>
        <div>
          <div className="pm-eyebrow">PLATFORM ADMINISTRATION / PAGE 43</div>
          <h2 className="mb-1">API Health & Interconnection Monitor</h2>
          <p>Real-time observability for APIs, callbacks, banks, card networks, mobile money and platform dependencies.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setAction({ title: "Compliance Audit Trail", body: <div><p>All health checks, incident responses and configuration changes are audit-logged.</p></div>, tone: "blue", icon: "bi-clock-history" })}><i className="bi bi-clock-history me-1" />Audit trail</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setAction({ title: "Admin Permissions", body: <div className="pm-card pm-card-pad"><h6>Role-based access</h6>{[["Super Admin", "Full access: configure, pause, force, kill"], ["Platform Ops", "Monitor, respond to incidents, retry callbacks"], ["Bank API team", "Manage bank integrations, respond to incidents"], ["Card team", "Manage card network integrations"], ["Viewer", "Read-only access"]].map(([role, perm]) => <div className="d-flex justify-content-between py-1 border-bottom small" key={role}><span className="pm-td-strong">{role}</span><span className="text-muted">{perm}</span></div>)}</div>, tone: "blue", icon: "bi-shield-lock" })}><i className="bi bi-shield-lock me-1" />Permissions</button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => setDrawer(true)}><i className="bi bi-diagram-3 me-1" />Dependency map</button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => setWizard(true)}><i className="bi bi-broadcast me-1" />Run ecosystem scan</button>
          <button className="btn btn-primary btn-sm" onClick={() => ask("Export health report", <div><p>A signed ecosystem health report is being generated.</p></div>, "blue", "bi-download")}><i className="bi bi-download me-1" />Export report</button>
        </div>
      </div>

      {/* Hero */}
      <div className="pm-hero health-hero mb-3">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <div className="pm-eyebrow text-white-50">INTERCONNECTION COMMAND CENTER · AUTO REFRESH 15S</div>
            <div className="pm-hero-value">{ecosystems.length > 0 ? `${((healthyCount / (healthyCount + degradedCount || 1)) * 100).toFixed(1)}%` : "0%"} <span className="fs-6 fw-normal text-white-50">overall ecosystem health</span></div>
            <div className="small text-white-50 mt-2">{endpoints.length + banks.length} endpoints · {healthyCount} healthy · {degradedCount} degraded · last full scan {new Date().toLocaleTimeString()} EAT</div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <div className="pm-hero-chip"><div className="l">Healthy</div><div className="v text-success">{healthyCount}</div></div>
            <div className="pm-hero-chip"><div className="l">Degraded</div><div className="v text-warning">{degradedCount}</div></div>
            <div className="pm-hero-chip"><div className="l">Incidents</div><div className="v">{incidents.length}</div></div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-3">
        {[
          ["Total endpoints", String(healthyCount + degradedCount), "Across " + ecosystems.length + " ecosystems", "bi-diagram-3", "green"],
          ["Healthy endpoints", String(healthyCount), `${((healthyCount / (healthyCount + degradedCount || 1)) * 100).toFixed(0)}% of estate`, "bi-heart-pulse", "blue"],
          ["Degraded", String(degradedCount), "Requires monitoring", "bi-exclamation-triangle", "amber"],
          ["Active incidents", String(incidents.length), "Requires response", "bi-fire", "violet"]
        ].map(x => <div className="col-6 col-xl-3" key={x[0]}><div className="pm-stat" style={{ cursor: "pointer" }} onClick={() => ask(x[0], <p>{x[2]}</p>, x[4] as any, x[3])}><div className={`pm-stat-ico bg-${x[4]}-soft text-${x[4]}`}><i className={`bi ${x[3]}`} /></div><div className="pm-stat-label">{x[0]}</div><div className="pm-stat-value">{x[1]}</div><div className="pm-stat-foot">{x[2]}</div></div></div>)}
      </div>

      {/* Tabs */}
      <div className="pm-card mb-3">
        <div className="pm-tabs">
          {[
            ["overview", "Ecosystem overview", "bi-grid"], ["mpesa", "M-Pesa endpoints", "bi-phone"],
            ["banks", "PesaLink banks", "bi-bank"], ["incidents", "Incidents & alerts", "bi-exclamation-octagon"],
            ["callbacks", "Callbacks & DLQ", "bi-arrow-repeat"], ["latency", "Latency heatmap", "bi-speedometer2"]
          ].map(x => <button className={`pm-tab ${tab === x[0] ? "active" : ""}`} key={x[0]} onClick={() => setTab(x[0])}><i className={`bi ${x[2]}`} />{x[1]}</button>)}
        </div>
      </div>

      {/* === OVERVIEW TAB === */}
      {tab === "overview" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>API ecosystem health</h3><p>Health score by interconnected provider family and operational domain.</p></div>
          <div className="d-flex gap-2">
            <button className="btn btn-primary btn-sm" onClick={() => setAddEco(true)}><i className="bi bi-plus me-1" />Add ecosystem</button>
            <Badge tone="green" dot>Live monitoring</Badge>
          </div>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Ecosystem</th><th>Endpoints</th><th>Healthy</th><th>Degraded</th><th>Down</th><th>Health score</th><th className="text-end">Actions</th></tr></thead><tbody>
            {ecosystems.map(r => <tr key={r.id}>
              <td className="pm-td-strong">{r.name}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td>
              <td className="pm-num">{r.endpoints}</td>
              <td className="pm-num">{r.healthy}</td>
              <td className="pm-num">{r.degraded}</td>
              <td className="pm-num">{r.down}</td>
              <td><Badge tone={r.score === "100%" ? "green" : r.score === "75.0%" ? "red" : "amber"}>{r.score}</Badge></td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditEco(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setLockEco(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteEco(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* === M-PESA TAB === */}
      {tab === "mpesa" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>M-Pesa endpoint status grid</h3><p>Safaricom STK, B2C, C2B, reversal and callback connectivity.</p></div>
          <div className="d-flex gap-2">
            <button className="btn btn-primary btn-sm" onClick={() => setAddEndpoint(true)}><i className="bi bi-plus me-1" />Add endpoint</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => ask("M-Pesa scan complete", <p>All M-Pesa endpoints responded successfully.</p>, "green", "bi-check2")}><i className="bi bi-broadcast me-1" />Scan</button>
          </div>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Endpoint</th><th>Purpose</th><th>Method</th><th>URL</th><th>Health</th><th>Latency</th><th>Error rate</th><th>Uptime</th><th className="text-end">Actions</th></tr></thead><tbody>
            {endpoints.filter(e => e.ecosystem === "M-Pesa").map(r => <tr key={r.id}>
              <td className="pm-td-strong">{r.name}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td>
              <td>{r.purpose}</td>
              <td><Badge tone="blue">{r.method}</Badge></td>
              <td className="mono">{r.url}</td>
              <td><Badge tone="green" dot>{r.health}</Badge></td>
              <td className="pm-num">{r.latency}</td>
              <td className="pm-num">{r.errorRate}</td>
              <td className="pm-num">{r.uptime}</td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditEndpoint(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setLockEndpoint(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteEndpoint(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* === BANKS TAB === */}
      {tab === "banks" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>PesaLink connected banks</h3><p>Transfer and validation health across IPS Kenya participants.</p></div>
          <div className="d-flex gap-2">
            <button className="btn btn-primary btn-sm" onClick={() => setAddBank(true)}><i className="bi bi-plus me-1" />Add bank</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => ask("Bank scan complete", <p>Nine connected banks responded; National Bank remains under latency watch.</p>, "blue", "bi-heart-pulse")}><i className="bi bi-heart-pulse me-1" />Scan</button>
          </div>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Bank</th><th>Code</th><th>Transfer</th><th>Validation</th><th>Avg latency</th><th>Success rate</th><th>Last TXN</th><th className="text-end">Actions</th></tr></thead><tbody>
            {banks.map(r => <tr key={r.id}>
              <td className="pm-td-strong">{r.name}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td>
              <td className="mono">{r.code}</td>
              <td><Badge tone={r.transfer === "Slow" ? "amber" : "green"} dot>{r.transfer}</Badge></td>
              <td><Badge tone={r.validation === "Slow" ? "amber" : "green"} dot>{r.validation}</Badge></td>
              <td className="pm-num">{r.latency}</td>
              <td className="pm-num">{r.successRate}</td>
              <td className="mono">{r.lastTxn}</td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditBank(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setLockBank(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteBank(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* === INCIDENTS TAB === */}
      {tab === "incidents" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Interconnection incidents</h3><p>Active degradation, downtime and callback backlogs requiring response.</p></div>
          <div className="d-flex gap-2">
            <button className="btn btn-primary btn-sm" onClick={() => setAddIncident(true)}><i className="bi bi-plus me-1" />Report incident</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => ask("Incident digest exported", <p>The incident digest was exported.</p>, "blue", "bi-download")}><i className="bi bi-download me-1" />Export</button>
          </div>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Incident</th><th>Service</th><th>State</th><th>Impact</th><th>Owner</th><th>Status</th><th>Opened</th><th className="text-end">Actions</th></tr></thead><tbody>
            {incidents.map(r => <tr key={r.id}>
              <td className="pm-td-strong">{r.incident}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td>
              <td>{r.service}</td>
              <td><Badge tone={r.state === "Down" ? "red" : "amber"} dot>{r.state}</Badge></td>
              <td>{r.impact}</td>
              <td>{r.owner}</td>
              <td>{r.status}</td>
              <td className="mono">{r.openedAt}</td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditIncident(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setLockIncident(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteIncident(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* === CALLBACKS TAB === */}
      {tab === "callbacks" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Callback registry & dead-letter queue</h3><p>Callback delivery, retry policy and unprocessed event visibility.</p></div>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => ask("Retry DLQ events", <p>42 retryable events were added to the next callback delivery batch.</p>, "blue", "bi-arrow-repeat")}><i className="bi bi-arrow-repeat me-1" />Retry DLQ</button>
        </div>
        <div className="row g-3">
          {[["Callbacks received (24h)", "456,780", "99.98% success"], ["Pending callbacks", "12", "Threshold: 50"], ["DLQ events", "42", "3 require manual review"], ["Avg response time", "45ms", "Target <100ms"]].map(x => <div className="col-6 col-xl-3" key={x[0]}><div className="pm-stat"><div className="pm-stat-label">{x[0]}</div><div className="pm-stat-value">{x[1]}</div><div className="pm-stat-foot">{x[2]}</div></div></div>)}
        </div>
        <div className="pm-card pm-card-pad mt-3">
          <h6>DLQ events requiring attention</h6>
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Event</th><th>Type</th><th>Error</th><th>Source</th><th>Age</th></tr></thead><tbody>
            {callbacks.map(r => <tr key={r.id}><td className="pm-td-strong">{r.event}</td><td className="mono">{r.type}</td><td>{r.error}</td><td>{r.source}</td><td>{r.age}</td></tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* === LATENCY TAB === */}
      {tab === "latency" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Latency heatmap</h3><p>Operational latency bands by API family.</p></div>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => ask("Latency report exported", <p>The latency heatmap was exported.</p>, "blue", "bi-download")}><i className="bi bi-download me-1" />Export</button>
        </div>
        <div className="row g-3">
          {[["M-Pesa", "3.2s", "Healthy", "green"], ["PesaLink", "8.5s", "Watch", "amber"], ["Visa", "1.8s", "Healthy", "green"], ["KCB Direct", "7.8s", "Healthy", "green"], ["Onfido", "45s", "Healthy", "green"], ["Nairobi Water", "8.2s", "Degraded", "amber"]].map(x => <div className="col-md-6 col-xl-4" key={x[0]}>
            <div className="pm-card pm-card-pad" style={{ cursor: "pointer" }} onClick={() => ask(`${x[0]} Latency`, <div><p>p95: {x[1]}</p><p>Status: {x[2]}</p></div>, x[3] as any, "bi-speedometer2")}>
              <div className="d-flex justify-content-between"><h6>{x[0]}</h6><Badge tone={x[3] as "green" | "amber"}>{x[2]}</Badge></div>
              <div className="h4 mt-3">{x[1]} <span className="fs-6 text-muted">p95</span></div>
              <div className="health-heat"><span style={{ width: x[3] === "green" ? "28%" : "74%", background: x[3] === "green" ? "#12b76a" : "#f79009" }} /></div>
            </div>
          </div>)}
        </div>
      </section>}

      {/* Generic action modal */}
      <Modal open={!!action} onClose={() => setAction(null)} title={action?.title ?? "API health action"} subtitle="Super Admin action · operational changes are audited" icon={action?.icon} tone={action?.tone}>
        <div className="pm-modal-body">{action?.body}</div>
        <div className="pm-modal-foot">
          <button className="btn btn-outline-secondary" onClick={() => setAction(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { setAction(null); push({ kind: "success", title: "Health workspace updated", body: "The action was recorded in the audit trail." }); }}>Confirm action</button>
        </div>
      </Modal>

      {/* Ecosystem scan wizard */}
      <Modal open={wizard} onClose={() => setWizard(false)} title="Run ecosystem scan" subtitle="Check endpoint health, callbacks, circuit breakers and dependencies" icon="bi-broadcast" tone="blue" size="lg">
        <Steps current={step} steps={[{ label: "Scope", icon: "bi-grid" }, { label: "Checks", icon: "bi-heart-pulse" }, { label: "Impact", icon: "bi-diagram-3" }, { label: "Report", icon: "bi-file-earmark-bar-graph" }]} />
        <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 25}%` }} /></div>
        <div className="pm-modal-body">
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label">Scan scope</label><select className="form-select"><option>All endpoints</option><option>Degraded endpoints only</option><option>Bank and mobile money</option></select></div>
            <div className="col-md-6"><label className="form-label">Probe mode</label><select className="form-select"><option>Safe read-only health checks</option><option>Include callback test events</option></select></div>
            <div className="col-12"><label className="form-label">Scan reason</label><textarea className="form-control" rows={3} placeholder="Scheduled ecosystem health scan for platform operations." /></div>
          </div>
        </div>
        <div className="pm-modal-foot">
          <button className="btn btn-outline-secondary" onClick={() => step ? setStep(step - 1) : setWizard(false)}>{step ? "Back" : "Cancel"}</button>
          {step < 3 ? <button className="btn btn-primary" onClick={() => setStep(step + 1)}>Continue</button> : <button className="btn btn-primary" onClick={() => { setWizard(false); push({ kind: "success", title: "Ecosystem scan complete", body: "All endpoints checked." }); }}>Run scan</button>}
        </div>
      </Modal>

      {/* Dependency map drawer */}
      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Dependency map" subtitle="Service relationships, circuit breakers and impact analysis" icon="bi-diagram-3" wide>
        <div className="pm-card pm-card-pad mb-3"><Badge tone="green" dot>Dependency graph healthy</Badge>
          <h5 className="mt-3">{healthyCount + degradedCount} endpoints across {ecosystems.length} ecosystems</h5>
          <p className="small text-muted">A failure in any upstream provider is evaluated against transaction, callback and settlement dependencies.</p>
        </div>
        <div className="pm-card pm-card-pad">
          {ecosystems.map(e => <div className="config-row" key={e.id}>
            <div className="d-flex justify-content-between"><b>{e.name}</b><Badge tone={e.degraded === "0" ? "green" : "amber"} dot>{e.degraded === "0" ? "Healthy" : "Watch"}</Badge></div>
            <span className="pm-td-sub">{e.endpoints} endpoints · {e.healthy} healthy</span>
          </div>)}
        </div>
      </Drawer>

      {/* CRUD Modals */}
      <AddRecordModal open={addEco} onClose={() => setAddEco(false)} onAdd={handleAddEco} fields={ecoFields} title="Add Ecosystem" icon="bi-grid" />
      <EditRecordModal open={!!editEco} onClose={() => setEditEco(null)} onSave={handleEditEco} record={editEco} title={`Edit: ${editEco?.name ?? ""}`} icon="bi-pencil-square" />
      <DeleteRecordWizard open={!!deleteEco} onClose={() => setDeleteEco(null)} onDelete={handleDeleteEco} name={deleteEco?.name ?? ""} relatedCount={5} dependencyCount={3} />
      <LockUnlockModal open={!!lockEco} onClose={() => setLockEco(null)} onToggle={handleLockEco} record={lockEco ? { name: lockEco.name, locked: !!lockEco.locked, lockedBy: lockEco.lockedBy, lockedAt: lockEco.lockedAt, lockReason: lockEco.lockReason } : null} />

      <AddRecordModal open={addEndpoint} onClose={() => setAddEndpoint(false)} onAdd={handleAddEndpoint} fields={endpointFields} title="Add Endpoint" icon="bi-diagram-3" />
      <EditRecordModal open={!!editEndpoint} onClose={() => setEditEndpoint(null)} onSave={handleEditEndpoint} record={editEndpoint} title={`Edit: ${editEndpoint?.name ?? ""}`} icon="bi-pencil-square" />
      <DeleteRecordWizard open={!!deleteEndpoint} onClose={() => setDeleteEndpoint(null)} onDelete={handleDeleteEndpoint} name={deleteEndpoint?.name ?? ""} relatedCount={2} dependencyCount={1} />
      <LockUnlockModal open={!!lockEndpoint} onClose={() => setLockEndpoint(null)} onToggle={handleLockEndpoint} record={lockEndpoint ? { name: lockEndpoint.name, locked: !!lockEndpoint.locked, lockedBy: lockEndpoint.lockedBy, lockedAt: lockEndpoint.lockedAt, lockReason: lockEndpoint.lockReason } : null} />

      <AddRecordModal open={addBank} onClose={() => setAddBank(false)} onAdd={handleAddBank} fields={bankFields} title="Add Bank" icon="bi-bank" />
      <EditRecordModal open={!!editBank} onClose={() => setEditBank(null)} onSave={handleEditBank} record={editBank} title={`Edit: ${editBank?.name ?? ""}`} icon="bi-pencil-square" />
      <DeleteRecordWizard open={!!deleteBank} onClose={() => setDeleteBank(null)} onDelete={handleDeleteBank} name={deleteBank?.name ?? ""} relatedCount={3} dependencyCount={2} />
      <LockUnlockModal open={!!lockBank} onClose={() => setLockBank(null)} onToggle={handleLockBank} record={lockBank ? { name: lockBank.name, locked: !!lockBank.locked, lockedBy: lockBank.lockedBy, lockedAt: lockBank.lockedAt, lockReason: lockBank.lockReason } : null} />

      <AddRecordModal open={addIncident} onClose={() => setAddIncident(false)} onAdd={handleAddIncident} fields={incidentFields} title="Report Incident" icon="bi-exclamation-octagon" />
      <EditRecordModal open={!!editIncident} onClose={() => setEditIncident(null)} onSave={handleEditIncident} record={editIncident} title={`Edit: ${editIncident?.incident ?? ""}`} icon="bi-pencil-square" />
      <DeleteRecordWizard open={!!deleteIncident} onClose={() => setDeleteIncident(null)} onDelete={handleDeleteIncident} name={deleteIncident?.incident ?? ""} relatedCount={1} dependencyCount={1} />
      <LockUnlockModal open={!!lockIncident} onClose={() => setLockIncident(null)} onToggle={handleLockIncident} record={lockIncident ? { name: lockIncident.incident, locked: !!lockIncident.locked, lockedBy: lockIncident.lockedBy, lockedAt: lockIncident.lockedAt, lockReason: lockIncident.lockReason } : null} />
    </div>
  );
}
