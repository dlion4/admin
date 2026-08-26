import { useCallback, useMemo, useState } from "react";
import { Badge, Drawer, Modal, Steps, useToast } from "../../../components/ui";
import { AdminRowActions, AddRecordModal, EditRecordModal, DeleteRecordWizard, LockUnlockModal } from "../../../components/AdminControls";
import {
  type ApiKeyRecord, type UsageRecord, type EndpointRecord, type WebhookRecord, type IntegrationRecord, type ErrorRecord,
  initialKeys, initialUsage, initialEndpoints, initialWebhooks, initialIntegrations, initialErrors
} from "../data/apiData";

type A = { title: string; body: React.ReactNode; icon?: string; tone?: "green" | "red" | "amber" | "blue" | "violet" | "ink" };

export function ApiIntegrations({ signal: _signal }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  const { push } = useToast();
  const [tab, setTab] = useState("keys");
  const [q, setQ] = useState("");
  const [action, setAction] = useState<A | null>(null);
  const [drawer, setDrawer] = useState<string | null>(null);
  const [wizard, setWizard] = useState(false);
  const [step, setStep] = useState(0);

  // Data state
  const [keys, setKeys] = useState<ApiKeyRecord[]>(initialKeys);
  const [usage] = useState<UsageRecord[]>(initialUsage);
  const [endpoints] = useState<EndpointRecord[]>(initialEndpoints);
  const [webhooks, setWebhooks] = useState<WebhookRecord[]>(initialWebhooks);
  const [integrations, setIntegrations] = useState<IntegrationRecord[]>(initialIntegrations);
  const [errors] = useState<ErrorRecord[]>(initialErrors);

  // CRUD modals
  const [editKey, setEditKey] = useState<ApiKeyRecord | null>(null);
  const [deleteKey, setDeleteKey] = useState<ApiKeyRecord | null>(null);
  const [lockKey, setLockKey] = useState<ApiKeyRecord | null>(null);
  const [addKey, setAddKey] = useState(false);

  const [editWebhook, setEditWebhook] = useState<WebhookRecord | null>(null);
  const [deleteWebhook, setDeleteWebhook] = useState<WebhookRecord | null>(null);
  const [lockWebhook, setLockWebhook] = useState<WebhookRecord | null>(null);
  const [addWebhook, setAddWebhook] = useState(false);

  const [editIntegration, setEditIntegration] = useState<IntegrationRecord | null>(null);
  const [deleteIntegration, setDeleteIntegration] = useState<IntegrationRecord | null>(null);
  const [lockIntegration, setLockIntegration] = useState<IntegrationRecord | null>(null);
  const [addIntegration, setAddIntegration] = useState(false);

  const filtered = useMemo(() => keys.filter(r => [r.name, r.key, r.createdBy, r.permissions, r.status].join(" ").toLowerCase().includes(q.toLowerCase())), [q, keys]);

  const ask = (title: string, body: React.ReactNode, tone: A["tone"] = "green", icon = "bi-check2-circle") => setAction({ title, body, tone, icon });

  // CRUD handlers
  const handleAddKey = useCallback((form: Record<string, string>) => {
    setKeys(p => [{ id: `k-${Date.now()}`, name: form.name || "New Key", key: `pk_live_****...${Math.floor(Math.random() * 9999)}`, createdBy: "Super Admin", created: new Date().toLocaleDateString(), permissions: form.permissions || "Full access", lastUsed: "never", status: "Active", rateLimit: form.rateLimit || "10K/min" }, ...p]);
  }, []);
  const handleEditKey = useCallback((form: Record<string, string>) => { if (!editKey) return; setKeys(p => p.map(k => k.id === editKey.id ? { ...k, ...form } : k)); }, [editKey]);
  const handleDeleteKey = useCallback(() => { if (!deleteKey) return; setKeys(p => p.filter(k => k.id !== deleteKey.id)); }, [deleteKey]);
  const handleLockKey = useCallback((locked: boolean) => { if (!lockKey) return; setKeys(p => p.map(k => k.id === lockKey.id ? { ...k, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Admin lock" : undefined } : k)); }, [lockKey]);

  const handleAddWebhook = useCallback((form: Record<string, string>) => {
    setWebhooks(p => [{ id: `w-${Date.now()}`, name: form.name || "New Webhook", url: form.url || "https://", events: form.events || "*", successRate: "100%", lastDelivery: "never", status: "Active" }, ...p]);
  }, []);
  const handleEditWebhook = useCallback((form: Record<string, string>) => { if (!editWebhook) return; setWebhooks(p => p.map(w => w.id === editWebhook.id ? { ...w, ...form } : w)); }, [editWebhook]);
  const handleDeleteWebhook = useCallback(() => { if (!deleteWebhook) return; setWebhooks(p => p.filter(w => w.id !== deleteWebhook.id)); }, [deleteWebhook]);
  const handleLockWebhook = useCallback((locked: boolean) => { if (!lockWebhook) return; setWebhooks(p => p.map(w => w.id === lockWebhook.id ? { ...w, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Admin lock" : undefined } : w)); }, [lockWebhook]);

  const handleAddIntegration = useCallback((form: Record<string, string>) => {
    setIntegrations(p => [{ id: `i-${Date.now()}`, provider: form.provider || "New Provider", purpose: form.purpose || "—", status: "Connected", uptime: "100%", sla: "99.9%", contractEnd: form.contractEnd || "TBD" }, ...p]);
  }, []);
  const handleEditIntegration = useCallback((form: Record<string, string>) => { if (!editIntegration) return; setIntegrations(p => p.map(i => i.id === editIntegration.id ? { ...i, ...form } : i)); }, [editIntegration]);
  const handleDeleteIntegration = useCallback(() => { if (!deleteIntegration) return; setIntegrations(p => p.filter(i => i.id !== deleteIntegration.id)); }, [deleteIntegration]);
  const handleLockIntegration = useCallback((locked: boolean) => { if (!lockIntegration) return; setIntegrations(p => p.map(i => i.id === lockIntegration.id ? { ...i, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Admin lock" : undefined } : i)); }, [lockIntegration]);

  const keyFields = [{ label: "name", placeholder: "API key name", required: true }, { label: "permissions", placeholder: "Full access / Partner scope" }, { label: "rateLimit", placeholder: "10K/min" }];
  const webhookFields = [{ label: "name", placeholder: "Webhook name", required: true }, { label: "url", placeholder: "https://endpoint.example.com/webhook", required: true }, { label: "events", placeholder: "event.type1, event.type2" }];
  const integrationFields = [{ label: "provider", placeholder: "Provider name", required: true }, { label: "purpose", placeholder: "Payments / KYC / SMS" }, { label: "contractEnd", placeholder: "Jan 2027" }];

  const activeKeys = keys.filter(k => k.status === "Active").length;
  const totalRequests = "3.5M";

  return (
    <div className="pm-page-content api-page">
      <div className="pm-section-head" style={{ marginTop: 0 }}>
        <div>
          <div className="pm-eyebrow">PLATFORM ADMINISTRATION / PAGE 33</div>
          <h2 className="mb-1">API & Integrations</h2>
          <p>Manage API keys, webhooks, rate limits, third-party connections and developer access.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setAction({ title: "Compliance Audit Trail", body: <div><p>All API key operations, webhook changes and integration updates are audit-logged.</p></div>, tone: "blue", icon: "bi-clock-history" })}><i className="bi bi-clock-history me-1" />Audit trail</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setAction({ title: "Admin Permissions", body: <div className="pm-card pm-card-pad"><h6>Role-based access</h6>{[["Super Admin", "Full access: create, rotate, revoke keys and integrations"], ["Platform Engineering", "Manage keys, webhooks, rate limits"], ["Partner Manager", "Manage partner API keys and scopes"], ["Security", "View audit trails, revoke access, emergency controls"], ["Viewer", "Read-only access"]].map(([role, perm]) => <div className="d-flex justify-content-between py-1 border-bottom small" key={role}><span className="pm-td-strong">{role}</span><span className="text-muted">{perm}</span></div>)}</div>, tone: "blue", icon: "bi-shield-lock" })}><i className="bi bi-shield-lock me-1" />Permissions</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setDrawer("docs")}><i className="bi bi-book me-1" />Developer docs</button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => setWizard(true)}><i className="bi bi-key me-1" />Create API key</button>
          <button className="btn btn-primary btn-sm" onClick={() => ask("Run integration health check", <p>A signed health check was queued for every provider and webhook endpoint.</p>, "blue", "bi-heart-pulse")}><i className="bi bi-heart-pulse me-1" />Health check</button>
        </div>
      </div>

      {/* Hero */}
      <div className="pm-hero api-hero mb-3">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <div className="pm-eyebrow text-white-50">DEVELOPER PLATFORM · PRODUCTION</div>
            <div className="pm-hero-value">{totalRequests} <span className="fs-6 fw-normal text-white-50">API requests / 24h</span></div>
            <div className="small text-white-50 mt-2">99.99% connected provider uptime · 0.01% weighted error rate · v2 current</div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <div className="pm-hero-chip"><div className="l">Active keys</div><div className="v">{activeKeys}</div></div>
            <div className="pm-hero-chip"><div className="l">Webhooks</div><div className="v">{webhooks.length}</div></div>
            <div className="pm-hero-chip"><div className="l">Integrations</div><div className="v">{integrations.length}</div></div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-3">
        {[
          ["Active API keys", String(activeKeys), `${keys.filter(k => k.status === "Suspended").length} suspended`, "bi-key", "green"],
          ["Requests (24h)", totalRequests, "0.01% weighted errors", "bi-activity", "blue"],
          ["Webhooks", String(webhooks.length), `${webhooks.filter(w => w.status === "Active").length} active`, "bi-broadcast", "violet"],
          ["Connected integrations", String(integrations.length), "All within SLA", "bi-plug", "amber"]
        ].map(x => <div className="col-6 col-xl-3" key={x[0]}><div className="pm-stat" style={{ cursor: "pointer" }} onClick={() => ask(x[0], <p>{x[2]}</p>, x[4] as any, x[3])}><div className={`pm-stat-ico bg-${x[4]}-soft text-${x[4]}`}><i className={`bi ${x[3]}`} /></div><div className="pm-stat-label">{x[0]}</div><div className="pm-stat-value">{x[1]}</div><div className="pm-stat-foot">{x[2]}</div></div></div>)}
      </div>

      {/* Tabs */}
      <div className="pm-card mb-3">
        <div className="pm-tabs">
          {[
            ["keys", "API keys", "bi-key"], ["usage", "Usage", "bi-graph-up-arrow"], ["endpoints", "Endpoints", "bi-diagram-3"],
            ["webhooks", "Webhooks", "bi-broadcast"], ["integrations", "Integrations", "bi-plug"],
            ["errors", "Error analysis", "bi-exclamation-triangle"], ["versions", "Versioning & docs", "bi-book"]
          ].map(x => <button className={`pm-tab ${tab === x[0] ? "active" : ""}`} key={x[0]} onClick={() => setTab(x[0])}><i className={`bi ${x[2]}`} />{x[1]}</button>)}
        </div>
      </div>

      {/* === KEYS TAB === */}
      {tab === "keys" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>API key management</h3><p>Masked credentials, scope, usage and rate-limit posture.</p></div>
          <div className="d-flex gap-2 align-items-center">
            <div className="pm-search"><i className="bi bi-search" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search key, scope or creator" /></div>
            <button className="btn btn-primary btn-sm" onClick={() => setAddKey(true)}><i className="bi bi-plus me-1" />Create key</button>
          </div>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Key name</th><th>Key</th><th>Created by</th><th>Created</th><th>Permissions</th><th>Last used</th><th>Status</th><th>Rate limit</th><th className="text-end">Actions</th></tr></thead><tbody>
            {filtered.map(r => <tr key={r.id}>
              <td className="pm-td-strong">{r.name}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td>
              <td className="mono">{r.key}</td>
              <td>{r.createdBy}</td>
              <td>{r.created}</td>
              <td>{r.permissions}</td>
              <td>{r.lastUsed}</td>
              <td><Badge tone={r.status === "Suspended" ? "red" : "green"} dot>{r.status}</Badge></td>
              <td className="mono">{r.rateLimit}</td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditKey(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setLockKey(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteKey(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* === USAGE TAB === */}
      {tab === "usage" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>API usage dashboard</h3><p>Traffic, errors and latency by API credential.</p></div>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => ask("Usage exported", <p>The API usage report was exported.</p>, "blue", "bi-download")}><i className="bi bi-download me-1" />Export</button>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Key</th><th>Requests (24h)</th><th>Errors</th><th>Avg latency</th><th>p95 latency</th><th>p99 latency</th></tr></thead><tbody>
            {usage.map(r => <tr key={r.id}>
              <td className="pm-td-strong">{r.key}</td>
              <td className="pm-num">{r.requests}</td>
              <td className="pm-num">{r.errors}</td>
              <td className="pm-num">{r.avgLatency}</td>
              <td className="pm-num">{r.p95Latency}</td>
              <td className="pm-num">{r.p99Latency}</td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* === ENDPOINTS TAB === */}
      {tab === "endpoints" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>API endpoints overview</h3><p>Endpoint catalog grouped by domain and authentication requirement.</p></div>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setDrawer("docs")}><i className="bi bi-book me-1" />Reference</button>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Category</th><th>Endpoints</th><th>Avg latency</th><th>Auth method</th></tr></thead><tbody>
            {endpoints.map(r => <tr key={r.id}>
              <td className="pm-td-strong">{r.category}</td>
              <td className="pm-num">{r.count}</td>
              <td className="pm-num">{r.avgLatency}</td>
              <td>{r.authMethod}</td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* === WEBHOOKS TAB === */}
      {tab === "webhooks" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Webhook management</h3><p>Event subscriptions, delivery reliability and endpoint controls.</p></div>
          <button className="btn btn-primary btn-sm" onClick={() => setAddWebhook(true)}><i className="bi bi-plus me-1" />Register webhook</button>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Webhook</th><th>URL</th><th>Events</th><th>Success rate</th><th>Last delivery</th><th>Status</th><th className="text-end">Actions</th></tr></thead><tbody>
            {webhooks.map(r => <tr key={r.id}>
              <td className="pm-td-strong">{r.name}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td>
              <td className="mono">{r.url}</td>
              <td>{r.events}</td>
              <td className="pm-num">{r.successRate}</td>
              <td>{r.lastDelivery}</td>
              <td><Badge tone={r.status === "Suspended" ? "amber" : "green"} dot>{r.status}</Badge></td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditWebhook(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setLockWebhook(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteWebhook(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* === INTEGRATIONS TAB === */}
      {tab === "integrations" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Third-party integration status</h3><p>Provider connectivity, uptime, SLA and contract horizon.</p></div>
          <div className="d-flex gap-2">
            <button className="btn btn-primary btn-sm" onClick={() => setAddIntegration(true)}><i className="bi bi-plus me-1" />Add integration</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => ask("Integration report exported", <p>Provider status and contract dates were exported.</p>, "blue", "bi-download")}><i className="bi bi-download me-1" />Export</button>
          </div>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Provider</th><th>Purpose</th><th>Status</th><th>Uptime (30d)</th><th>SLA</th><th>Contract end</th><th className="text-end">Actions</th></tr></thead><tbody>
            {integrations.map(r => <tr key={r.id}>
              <td className="pm-td-strong">{r.provider}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td>
              <td>{r.purpose}</td>
              <td><Badge tone="green" dot>{r.status}</Badge></td>
              <td className="pm-num">{r.uptime}</td>
              <td className="pm-num">{r.sla}</td>
              <td>{r.contractEnd}</td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditIntegration(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setLockIntegration(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteIntegration(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* === ERRORS TAB === */}
      {tab === "errors" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>API error analysis</h3><p>Root-cause distribution for the last 24 hours.</p></div>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => ask("Error analysis exported", <p>The API error analysis was exported.</p>, "blue", "bi-download")}><i className="bi bi-download me-1" />Export</button>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Error code</th><th>Count (24h)</th><th>Share</th><th>Top endpoint</th><th>Root cause</th><th className="text-end">Action</th></tr></thead><tbody>
            {errors.map(r => <tr key={r.id}>
              <td className="pm-td-strong">{r.code}</td>
              <td className="pm-num">{r.count}</td>
              <td><Badge tone={r.share.startsWith("52") ? "red" : "amber"}>{r.share}</Badge></td>
              <td className="mono">{r.topEndpoint}</td>
              <td>{r.rootCause}</td>
              <td className="text-end"><button className="btn btn-sm btn-outline-primary" onClick={() => ask(`Investigate: ${r.code}`, <div><p>Root cause: {r.rootCause}</p><p>Top endpoint: {r.topEndpoint}</p><p>Count: {r.count}</p></div>, "amber", "bi-search")}><i className="bi bi-search me-1" />Investigate</button></td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* === VERSIONS TAB === */}
      {tab === "versions" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>API versioning & documentation</h3><p>Current, deprecated and beta contracts with developer resources.</p></div>
        </div>
        <div className="row g-3">
          <div className="col-md-4"><div className="pm-card pm-card-pad"><Badge tone="grey">Deprecated</Badge><h5 className="mt-3">v1</h5><p className="pm-td-sub">All original endpoints</p><div className="small">Sunset: Jul 2027</div></div></div>
          <div className="col-md-4"><div className="pm-card pm-card-pad border-success"><Badge tone="green" dot>Current</Badge><h5 className="mt-3">v2</h5><p className="pm-td-sub">All endpoints + new features</p><button className="btn btn-sm btn-outline-primary" onClick={() => setDrawer("docs")}>Open reference</button></div></div>
          <div className="col-md-4"><div className="pm-card pm-card-pad"><Badge tone="amber">Beta</Badge><h5 className="mt-3">v3</h5><p className="pm-td-sub">New endpoints only</p><button className="btn btn-sm btn-outline-secondary" onClick={() => ask("Request v3 access", <p>A sandbox v3 access request was sent to Engineering.</p>, "amber", "bi-beaker")}>Request access</button></div></div>
        </div>
      </section>}

      {/* Generic action modal */}
      <Modal open={!!action} onClose={() => setAction(null)} title={action?.title ?? "API action"} subtitle="Super Admin action · credentials and integrations are audited" icon={action?.icon} tone={action?.tone}>
        <div className="pm-modal-body">{action?.body}</div>
        <div className="pm-modal-foot">
          <button className="btn btn-outline-secondary" onClick={() => setAction(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { setAction(null); push({ kind: "success", title: "API workspace updated", body: "The action was added to the integration audit trail." }); }}>Confirm action</button>
        </div>
      </Modal>

      {/* Create API key wizard */}
      <Modal open={wizard} onClose={() => setWizard(false)} title="Create API key" subtitle="Scope credentials, rate limits and approval before issuing" icon="bi-key" tone="green" size="lg">
        <Steps current={step} steps={[{ label: "Identity", icon: "bi-key" }, { label: "Scope", icon: "bi-shield-check" }, { label: "Limits", icon: "bi-speedometer2" }, { label: "Review", icon: "bi-check2" }]} />
        <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 25}%` }} /></div>
        <div className="pm-modal-body">
          <div className="pm-note mb-3"><i className="bi bi-shield-lock me-1" />Only Super Admins can create production API keys. All actions are audit-logged.</div>
          <div className="row g-3">
            <div className="col-md-7"><label className="form-label">Key name</label><input className="form-control" placeholder="Production integration credential" /></div>
            <div className="col-md-5"><label className="form-label">Environment</label><select className="form-select"><option>Production</option><option>Staging</option><option>Sandbox</option></select></div>
            <div className="col-md-6"><label className="form-label">Owner</label><input className="form-control" placeholder="Platform Engineering" /></div>
            <div className="col-md-6"><label className="form-label">Expiry policy</label><select className="form-select"><option>90 days</option><option>180 days</option><option>No expiry · exception required</option></select></div>
            <div className="col-12"><label className="form-label">Notes</label><textarea className="form-control" rows={3} placeholder="Scope must follow least privilege and production credentials require Super Admin approval." /></div>
          </div>
        </div>
        <div className="pm-modal-foot">
          <button className="btn btn-outline-secondary" onClick={() => step ? setStep(step - 1) : setWizard(false)}>{step ? "Back" : "Cancel"}</button>
          {step < 3 ? <button className="btn btn-primary" onClick={() => setStep(step + 1)}>Continue</button> : <button className="btn btn-primary" onClick={() => { setWizard(false); push({ kind: "success", title: "API key created", body: "The secret was shown once and stored in the secure vault." }); }}>Create key</button>}
        </div>
      </Modal>

      {/* Key detail drawer */}
      <Drawer open={!!drawer} onClose={() => setDrawer(null)} title={drawer ?? "Developer operations"} subtitle="API credential, webhook and documentation controls" icon="bi-plug" wide>
        <div className="pm-card pm-card-pad mb-3">
          <h5>{drawer}</h5><Badge tone="green" dot>Monitored</Badge>
          <div className="row g-3 mt-2">
            <div className="col-4"><div className="pm-eyebrow">Requests</div><b>2.3M / day</b></div>
            <div className="col-4"><div className="pm-eyebrow">Error rate</div><b>0.01%</b></div>
            <div className="col-4"><div className="pm-eyebrow">Auth</div><b>API key</b></div>
          </div>
        </div>
        <div className="pm-card pm-card-pad mb-3"><h6>Quick operations</h6>
          <div className="d-grid gap-2">
            <button className="btn btn-outline-primary" onClick={() => ask("Rotate credentials", <p>The key will be revoked after a 24-hour overlap.</p>, "amber", "bi-arrow-repeat")}><i className="bi bi-arrow-repeat me-1" />Rotate credentials</button>
            <button className="btn btn-outline-secondary" onClick={() => ask("Open delivery log", <p>Webhook delivery history was filtered.</p>, "blue", "bi-list-check")}><i className="bi bi-list-check me-1" />Open delivery log</button>
            <button className="btn btn-outline-warning" onClick={() => ask("Adjust rate limits", <p>Rate limit policy updated.</p>, "amber", "bi-speedometer2")}><i className="bi bi-speedometer2 me-1" />Adjust rate limits</button>
            <button className="btn btn-outline-danger" onClick={() => ask("Revoke access?", <p>All requests using this credential will be rejected immediately.</p>, "red", "bi-trash")}><i className="bi bi-trash me-1" />Revoke access</button>
          </div>
        </div>
        <div className="pm-card pm-card-pad"><h6>Recent events</h6>
          <div className="pm-timeline">
            <div className="pm-tl-item done"><b>Health check passed</b><div className="pm-td-sub">2 minutes ago · 45ms average</div></div>
            <div className="pm-tl-item done"><b>Credential used successfully</b><div className="pm-td-sub">5 minutes ago · production</div></div>
            <div className="pm-tl-item warn"><b>Rotation due in 14 days</b><div className="pm-td-sub">Security policy</div></div>
          </div>
        </div>
      </Drawer>

      {/* CRUD Modals */}
      <AddRecordModal open={addKey} onClose={() => setAddKey(false)} onAdd={handleAddKey} fields={keyFields} title="Create API Key" icon="bi-key" />
      <EditRecordModal open={!!editKey} onClose={() => setEditKey(null)} onSave={handleEditKey} record={editKey} title={`Edit: ${editKey?.name ?? ""}`} icon="bi-pencil-square" />
      <DeleteRecordWizard open={!!deleteKey} onClose={() => setDeleteKey(null)} onDelete={handleDeleteKey} name={deleteKey?.name ?? ""} relatedCount={3} dependencyCount={2} />
      <LockUnlockModal open={!!lockKey} onClose={() => setLockKey(null)} onToggle={handleLockKey} record={lockKey ? { name: lockKey.name, locked: !!lockKey.locked, lockedBy: lockKey.lockedBy, lockedAt: lockKey.lockedAt, lockReason: lockKey.lockReason } : null} />

      <AddRecordModal open={addWebhook} onClose={() => setAddWebhook(false)} onAdd={handleAddWebhook} fields={webhookFields} title="Register Webhook" icon="bi-broadcast" />
      <EditRecordModal open={!!editWebhook} onClose={() => setEditWebhook(null)} onSave={handleEditWebhook} record={editWebhook} title={`Edit: ${editWebhook?.name ?? ""}`} icon="bi-pencil-square" />
      <DeleteRecordWizard open={!!deleteWebhook} onClose={() => setDeleteWebhook(null)} onDelete={handleDeleteWebhook} name={deleteWebhook?.name ?? ""} relatedCount={2} dependencyCount={1} />
      <LockUnlockModal open={!!lockWebhook} onClose={() => setLockWebhook(null)} onToggle={handleLockWebhook} record={lockWebhook ? { name: lockWebhook.name, locked: !!lockWebhook.locked, lockedBy: lockWebhook.lockedBy, lockedAt: lockWebhook.lockedAt, lockReason: lockWebhook.lockReason } : null} />

      <AddRecordModal open={addIntegration} onClose={() => setAddIntegration(false)} onAdd={handleAddIntegration} fields={integrationFields} title="Add Integration" icon="bi-plug" />
      <EditRecordModal open={!!editIntegration} onClose={() => setEditIntegration(null)} onSave={handleEditIntegration} record={editIntegration} title={`Edit: ${editIntegration?.provider ?? ""}`} icon="bi-pencil-square" />
      <DeleteRecordWizard open={!!deleteIntegration} onClose={() => setDeleteIntegration(null)} onDelete={handleDeleteIntegration} name={deleteIntegration?.provider ?? ""} relatedCount={4} dependencyCount={3} />
      <LockUnlockModal open={!!lockIntegration} onClose={() => setLockIntegration(null)} onToggle={handleLockIntegration} record={lockIntegration ? { name: lockIntegration.provider, locked: !!lockIntegration.locked, lockedBy: lockIntegration.lockedBy, lockedAt: lockIntegration.lockedAt, lockReason: lockIntegration.lockReason } : null} />
    </div>
  );
}
