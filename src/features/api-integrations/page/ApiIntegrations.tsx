import { useCallback, useMemo, useState } from "react";
import { Badge, Modal, useToast } from "../../../components/ui";
import { AddRecordModal, EditRecordModal, DeleteRecordWizard, LockUnlockModal } from "../../../components/AdminControls";
import {
  type ApiKeyRecord, type UsageRecord, type EndpointRecord, type WebhookRecord,
  type IntegrationRecord, type ErrorRecord, type ApiSecurityPolicy, type ApiAuditEntry,
  type ApiDocument,
  initialKeys, initialUsage, initialEndpoints, initialWebhooks, initialIntegrations,
  initialErrors, initialSecurityPolicies, initialApiAudit, initialApiDocuments,
} from "../data/apiData";
import {
  ApiKeyDetailDrawer, RotateCredentialsWizard, WebhookDeliveryDrawer,
  RateLimitPolicyModal, ErrorInvestigationModal, IntegrationHealthModal,
  ApiDocsDrawer, ApiTestConsoleModal, KeyRevocationWizard,
  ApiKeyCreateWizard, ExportCenterWizard, EmergencyRevocationWizard,
  IntegrationOnboardingWizard, ApiSecurityPolicyDetailModal, ApiAuditTrailModal,
  ApiDocumentPreviewModal, ApiBulkOperationsModal, WebhookTestModal,
  ApiPerformanceDrawer,
} from "../modals/ApiModals";

type A = { title: string; body: React.ReactNode; icon?: string; tone?: "green" | "red" | "amber" | "blue" | "violet" | "ink" };

export function ApiIntegrations({ signal: _signal }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  const { push } = useToast();
  const [tab, setTab] = useState("keys");
  const [q, setQ] = useState("");
  const [action, setAction] = useState<A | null>(null);

  // Wizard/drawer states
  const [createKeyWizard, setCreateKeyWizard] = useState(false);
  const [rotateWizard, setRotateWizard] = useState<ApiKeyRecord | null>(null);
  const [revokeWizard, setRevokeWizard] = useState<ApiKeyRecord | null>(null);
  const [emergencyWizard, setEmergencyWizard] = useState(false);
  const [exportWizard, setExportWizard] = useState(false);
  const [integrationWizard, setIntegrationWizard] = useState(false);
  const [rateLimitModal, setRateLimitModal] = useState(false);
  const [testConsole, setTestConsole] = useState(false);
  const [docsDrawer, setDocsDrawer] = useState(false);
  const [perfDrawer, setPerfDrawer] = useState(false);
  const [bulkOps, setBulkOps] = useState(false);
  const [auditTrail, setAuditTrail] = useState(false);

  // Detail/preview modals
  const [keyDetail, setKeyDetail] = useState<ApiKeyRecord | null>(null);
  const [errorDetail, setErrorDetail] = useState<ErrorRecord | null>(null);
  const [integrationHealth, setIntegrationHealth] = useState<IntegrationRecord | null>(null);
  const [webhookDelivery, setWebhookDelivery] = useState<WebhookRecord | null>(null);
  const [webhookTest, setWebhookTest] = useState<WebhookRecord | null>(null);
  const [securityPolicyDetail, setSecurityPolicyDetail] = useState<ApiSecurityPolicy | null>(null);
  const [docPreview, setDocPreview] = useState<ApiDocument | null>(null);

  // Data state
  const [keys, setKeys] = useState<ApiKeyRecord[]>(initialKeys);
  const [usage] = useState<UsageRecord[]>(initialUsage);
  const [endpoints] = useState<EndpointRecord[]>(initialEndpoints);
  const [webhooks, setWebhooks] = useState<WebhookRecord[]>(initialWebhooks);
  const [integrations, setIntegrations] = useState<IntegrationRecord[]>(initialIntegrations);
  const [errors] = useState<ErrorRecord[]>(initialErrors);
  const [securityPolicies] = useState<ApiSecurityPolicy[]>(initialSecurityPolicies);
  const [apiAudit] = useState<ApiAuditEntry[]>(initialApiAudit);
  const [apiDocs] = useState<ApiDocument[]>(initialApiDocuments);

  // CRUD modals — Keys
  const [editKey, setEditKey] = useState<ApiKeyRecord | null>(null);
  const [deleteKey, setDeleteKey] = useState<ApiKeyRecord | null>(null);
  const [lockKey, setLockKey] = useState<ApiKeyRecord | null>(null);
  const [addKey, setAddKey] = useState(false);

  // CRUD modals — Webhooks
  const [editWebhook, setEditWebhook] = useState<WebhookRecord | null>(null);
  const [deleteWebhook, setDeleteWebhook] = useState<WebhookRecord | null>(null);
  const [lockWebhook, setLockWebhook] = useState<WebhookRecord | null>(null);
  const [addWebhook, setAddWebhook] = useState(false);

  // CRUD modals — Integrations
  const [editIntegration, setEditIntegration] = useState<IntegrationRecord | null>(null);
  const [deleteIntegration, setDeleteIntegration] = useState<IntegrationRecord | null>(null);
  const [lockIntegration, setLockIntegration] = useState<IntegrationRecord | null>(null);
  const [addIntegration, setAddIntegration] = useState(false);

  const filtered = useMemo(() => keys.filter(r => [r.name, r.key, r.createdBy, r.permissions, r.status].join(" ").toLowerCase().includes(q.toLowerCase())), [q, keys]);
  const ask = (title: string, body: React.ReactNode, tone: A["tone"] = "green", icon = "bi-check2-circle") => setAction({ title, body, tone, icon });

  // CRUD handlers — Keys
  const handleAddKey = useCallback((form: Record<string, string>) => {
    setKeys(p => [{ id: `k-${Date.now()}`, name: form.name || "New Key", key: `pk_live_****...${Math.floor(Math.random() * 9999)}`, createdBy: "Super Admin", created: new Date().toLocaleDateString(), permissions: form.permissions || "Full access", lastUsed: "never", status: "Active", rateLimit: form.rateLimit || "10K/min" }, ...p]);
  }, []);
  const handleEditKey = useCallback((form: Record<string, any>) => { if (!editKey) return; setKeys(p => p.map(k => k.id === editKey.id ? { ...k, ...form } : k)); }, [editKey]);
  const handleDeleteKey = useCallback(() => { if (!deleteKey) return; setKeys(p => p.filter(k => k.id !== deleteKey.id)); }, [deleteKey]);
  const handleLockKey = useCallback((locked: boolean) => { if (!lockKey) return; setKeys(p => p.map(k => k.id === lockKey.id ? { ...k, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Admin lock" : undefined } : k)); }, [lockKey]);

  // CRUD handlers — Webhooks
  const handleAddWebhook = useCallback((form: Record<string, string>) => {
    setWebhooks(p => [{ id: `w-${Date.now()}`, name: form.name || "New Webhook", url: form.url || "https://", events: form.events || "*", successRate: "100%", lastDelivery: "never", status: "Active" }, ...p]);
  }, []);
  const handleEditWebhook = useCallback((form: Record<string, any>) => { if (!editWebhook) return; setWebhooks(p => p.map(w => w.id === editWebhook.id ? { ...w, ...form } : w)); }, [editWebhook]);
  const handleDeleteWebhook = useCallback(() => { if (!deleteWebhook) return; setWebhooks(p => p.filter(w => w.id !== deleteWebhook.id)); }, [deleteWebhook]);
  const handleLockWebhook = useCallback((locked: boolean) => { if (!lockWebhook) return; setWebhooks(p => p.map(w => w.id === lockWebhook.id ? { ...w, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Admin lock" : undefined } : w)); }, [lockWebhook]);

  // CRUD handlers — Integrations
  const handleAddIntegration = useCallback((form: Record<string, string>) => {
    setIntegrations(p => [{ id: `i-${Date.now()}`, provider: form.provider || "New Provider", purpose: form.purpose || "—", status: "Connected", uptime: "100%", sla: "99.9%", contractEnd: form.contractEnd || "TBD" }, ...p]);
  }, []);
  const handleEditIntegration = useCallback((form: Record<string, any>) => { if (!editIntegration) return; setIntegrations(p => p.map(i => i.id === editIntegration.id ? { ...i, ...form } : i)); }, [editIntegration]);
  const handleDeleteIntegration = useCallback(() => { if (!deleteIntegration) return; setIntegrations(p => p.filter(i => i.id !== deleteIntegration.id)); }, [deleteIntegration]);
  const handleLockIntegration = useCallback((locked: boolean) => { if (!lockIntegration) return; setIntegrations(p => p.map(i => i.id === lockIntegration.id ? { ...i, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Admin lock" : undefined } : i)); }, [lockIntegration]);

  // Field definitions
  const keyFields = [{ key: "name", label: "Key name", placeholder: "e.g. Partner Portal API" }, { key: "permissions", label: "Permissions", placeholder: "Full access / Partner scope" }, { key: "rateLimit", label: "Rate limit", placeholder: "10K/min" }];
  const webhookFields = [{ key: "name", label: "Webhook name", placeholder: "e.g. Transaction alerts" }, { key: "url", label: "URL", placeholder: "https://endpoint.example.com/webhook" }, { key: "events", label: "Events", placeholder: "event.type1, event.type2" }];
  const integrationFields = [{ key: "provider", label: "Provider name", placeholder: "e.g. Stripe" }, { key: "purpose", label: "Purpose", placeholder: "Payments / KYC / SMS" }, { key: "contractEnd", label: "Contract end", placeholder: "Jan 2027" }];

  const activeKeys = keys.filter(k => k.status === "Active").length;
  const totalRequests = "3.5M";
  const totalEndpoints = endpoints.reduce((sum, e) => sum + parseInt(e.count), 0);

  return (
    <div className="pm-page-content api-page">
      {/* ====================== HEADER ====================== */}
      <div className="pm-section-head" style={{ marginTop: 0 }}>
        <div>
          <div className="pm-eyebrow">PLATFORM ADMINISTRATION / PAGE 33</div>
          <h2 className="mb-1">API & Integrations</h2>
          <p>Manage API keys, webhooks, rate limits, third-party connections and developer access.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setAuditTrail(true)}><i className="bi bi-clock-history me-1" />Audit trail</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setBulkOps(true)}><i className="bi bi-layers me-1" />Bulk ops</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setPerfDrawer(true)}><i className="bi bi-activity me-1" />Performance</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setDocsDrawer(true)}><i className="bi bi-book me-1" />Developer docs</button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => setTestConsole(true)}><i className="bi bi-terminal me-1" />Test console</button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => setRateLimitModal(true)}><i className="bi bi-speedometer2 me-1" />Rate limits</button>
          <button className="btn btn-outline-danger btn-sm" onClick={() => setEmergencyWizard(true)} style={{ borderColor: "var(--pm-danger)", color: "var(--pm-danger)" }}><i className="bi bi-exclamation-triangle me-1" />Emergency</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setExportWizard(true)}><i className="bi bi-download me-1" />Export</button>
          <button className="btn btn-primary btn-sm" onClick={() => setCreateKeyWizard(true)}><i className="bi bi-key me-1" />Create API key</button>
        </div>
      </div>

      {/* ====================== HERO ====================== */}
      <div className="pm-hero api-hero mb-3">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <div className="pm-eyebrow text-white-50">DEVELOPER PLATFORM · PRODUCTION</div>
            <div className="pm-hero-value">{totalRequests} <span className="fs-6 fw-normal text-white-50">API requests / 24h</span></div>
            <div className="small text-white-50 mt-2">99.99% connected provider uptime · 0.01% weighted error rate · v2 current</div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <div className="pm-hero-chip"><div className="l">Active keys</div><div className="v">{activeKeys}</div></div>
            <div className="pm-hero-chip"><div className="l">Endpoints</div><div className="v">{totalEndpoints}</div></div>
            <div className="pm-hero-chip"><div className="l">Webhooks</div><div className="v">{webhooks.length}</div></div>
            <div className="pm-hero-chip"><div className="l">Integrations</div><div className="v">{integrations.length}</div></div>
          </div>
        </div>
      </div>

      {/* ====================== STATS STRIP ====================== */}
      <div className="row g-3 mb-3">
        {([
          ["Active API keys", String(activeKeys), `${keys.filter(k => k.status === "Suspended").length} suspended`, "bi-key", "green", () => setTab("keys")],
          ["Requests (24h)", totalRequests, "0.01% weighted errors", "bi-activity", "blue", () => setPerfDrawer(true)],
          ["Webhooks", String(webhooks.length), `${webhooks.filter(w => w.status === "Active").length} active`, "bi-broadcast", "violet", () => setTab("webhooks")],
          ["Integrations", String(integrations.length), "All within SLA", "bi-plug", "amber", () => setTab("integrations")],
          ["Endpoints", String(totalEndpoints), "Across 10 categories", "bi-diagram-3", "blue", () => setTab("endpoints")],
          ["Security", String(securityPolicies.length), `${securityPolicies.filter(s => s.severity === "Critical").length} critical`, "bi-shield-check", "red", () => setTab("security")],
        ] as const).map(x => <div className="col-6 col-xl-2" key={x[0]}><div className="pm-stat" style={{ cursor: "pointer" }} onClick={x[5]}><div className={`pm-stat-ico bg-${x[4]}-soft text-${x[4]}`}><i className={`bi ${x[3]}`} /></div><div className="pm-stat-label">{x[0]}</div><div className="pm-stat-value">{x[1]}</div><div className="pm-stat-foot">{x[2]}</div></div></div>)}
      </div>

      {/* ====================== TABS ====================== */}
      <div className="pm-card mb-3">
        <div className="pm-tabs">
          {([
            ["keys", "API keys", "bi-key"], ["usage", "Usage", "bi-graph-up-arrow"], ["endpoints", "Endpoints", "bi-diagram-3"],
            ["webhooks", "Webhooks", "bi-broadcast"], ["integrations", "Integrations", "bi-plug"],
            ["errors", "Error analysis", "bi-exclamation-triangle"], ["versions", "Versioning", "bi-book"],
            ["security", "Security", "bi-shield-check"], ["docs", "Documentation", "bi-file-earmark-text"],
            ["audit", "Audit trail", "bi-clock-history"],
          ] as const).map(x => <button className={`pm-tab ${tab === x[0] ? "active" : ""}`} key={x[0]} onClick={() => setTab(x[0])}><i className={`bi ${x[2]}`} />{x[1]}</button>)}
        </div>
      </div>

      {/* ====================== KEYS TAB ====================== */}
      {tab === "keys" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>API key management</h3><p>Masked credentials, scope, usage and rate-limit posture.</p></div>
          <div className="d-flex gap-2 align-items-center">
            <div className="pm-search"><i className="bi bi-search" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search key, scope or creator" /></div>
            <button className="btn btn-primary btn-sm" onClick={() => setAddKey(true)}><i className="bi bi-plus me-1" />Create key</button>
          </div>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Key name</th><th>Key</th><th>Created by</th><th>Permissions</th><th>Last used</th><th>Status</th><th>Rate limit</th><th className="text-end">Actions</th></tr></thead><tbody>
            {filtered.map(r => <tr key={r.id} style={{ opacity: r.locked ? 0.7 : 1 }} onClick={() => setKeyDetail(r)}><td className="pm-td-strong">{r.name}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td><td className="api-key-display">{r.key}</td><td>{r.createdBy}</td><td><Badge tone="grey">{r.permissions}</Badge></td><td>{r.lastUsed}</td><td><Badge tone={r.status === "Suspended" ? "red" : "green"} dot>{r.status}</Badge></td><td className="mono">{r.rateLimit}</td><td className="text-end text-nowrap" onClick={e => e.stopPropagation()}>
                <button className="btn btn-sm btn-outline-info me-1" onClick={() => setRotateWizard(r)} title="Rotate"><i className="bi bi-arrow-repeat" /></button>
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditKey(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setLockKey(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setRevokeWizard(r)} title="Revoke"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* ====================== USAGE TAB ====================== */}
      {tab === "usage" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>API usage dashboard</h3><p>Traffic, errors and latency by API credential.</p></div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setPerfDrawer(true)}><i className="bi bi-activity me-1" />Performance</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setExportWizard(true)}><i className="bi bi-download me-1" />Export</button>
          </div>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Key</th><th>Requests (24h)</th><th>Errors</th><th>Avg latency</th><th>p95 latency</th><th>p99 latency</th><th>Trend</th></tr></thead><tbody>
            {usage.map(r => <tr key={r.id}><td className="pm-td-strong">{r.key}</td><td className="pm-num">{r.requests}</td><td className="pm-num">{r.errors}</td><td className="pm-num">{r.avgLatency}</td><td className="pm-num">{r.p95Latency}</td><td className="pm-num">{r.p99Latency}</td><td><Badge tone={r.trend?.startsWith("+") ? "green" : "amber"}>{r.trend}</Badge></td></tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* ====================== ENDPOINTS TAB ====================== */}
      {tab === "endpoints" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>API endpoints overview</h3><p>Endpoint catalog grouped by domain and authentication requirement.</p></div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setDocsDrawer(true)}><i className="bi bi-book me-1" />Reference</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setTestConsole(true)}><i className="bi bi-terminal me-1" />Test console</button>
          </div>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Category</th><th>Endpoints</th><th>Avg latency</th><th>Auth method</th><th>Methods</th></tr></thead><tbody>
            {endpoints.map(r => <tr key={r.id}><td className="pm-td-strong">{r.category}</td><td className="pm-num">{r.count}</td><td className="pm-num">{r.avgLatency}</td><td>{r.authMethod}</td><td><span className="mono small">{r.methods || "GET, POST"}</span></td></tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* ====================== WEBHOOKS TAB ====================== */}
      {tab === "webhooks" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Webhook management</h3><p>Event subscriptions, delivery reliability and endpoint controls.</p></div>
          <button className="btn btn-primary btn-sm" onClick={() => setAddWebhook(true)}><i className="bi bi-plus me-1" />Register webhook</button>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Webhook</th><th>URL</th><th>Events</th><th>Success rate</th><th>Last delivery</th><th>Status</th><th className="text-end">Actions</th></tr></thead><tbody>
            {webhooks.map(r => <tr key={r.id} style={{ opacity: r.locked ? 0.7 : 1 }} onClick={() => setWebhookDelivery(r)}><td className="pm-td-strong">{r.name}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td><td className="mono">{r.url}</td><td>{r.events}</td><td className="pm-num">{r.successRate}</td><td>{r.lastDelivery}</td><td><Badge tone={r.status === "Suspended" ? "amber" : "green"} dot>{r.status}</Badge></td><td className="text-end text-nowrap" onClick={e => e.stopPropagation()}>
                <button className="btn btn-sm btn-outline-info me-1" onClick={() => setWebhookTest(r)} title="Test"><i className="bi bi-play-circle" /></button>
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditWebhook(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setLockWebhook(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteWebhook(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* ====================== INTEGRATIONS TAB ====================== */}
      {tab === "integrations" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Third-party integration status</h3><p>Provider connectivity, uptime, SLA and contract horizon.</p></div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setExportWizard(true)}><i className="bi bi-download me-1" />Export</button>
            <button className="btn btn-primary btn-sm" onClick={() => setAddIntegration(true)}><i className="bi bi-plus me-1" />Add integration</button>
            <button className="btn btn-outline-primary btn-sm" onClick={() => setIntegrationWizard(true)}><i className="bi bi-plug me-1" />Onboard new</button>
          </div>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Provider</th><th>Purpose</th><th>Status</th><th>Uptime (30d)</th><th>SLA</th><th>Contract end</th><th className="text-end">Actions</th></tr></thead><tbody>
            {integrations.map(r => <tr key={r.id} style={{ opacity: r.locked ? 0.7 : 1 }}><td className="pm-td-strong">{r.provider}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td><td>{r.purpose}</td><td><Badge tone="green" dot>{r.status}</Badge></td><td className="pm-num">{r.uptime}</td><td className="pm-num">{r.sla}</td><td>{r.contractEnd}</td><td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-info me-1" onClick={() => setIntegrationHealth(r)} title="Health"><i className="bi bi-heart-pulse" /></button>
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditIntegration(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setLockIntegration(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteIntegration(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* ====================== ERRORS TAB ====================== */}
      {tab === "errors" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>API error analysis</h3><p>Root-cause distribution for the last 24 hours.</p></div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setExportWizard(true)}><i className="bi bi-download me-1" />Export</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => ask("Clear resolved errors", <p>Errors older than 7 days will be archived.</p>, "blue", "bi-trash")}><i className="bi bi-trash me-1" />Clear old</button>
          </div>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Error code</th><th>Count (24h)</th><th>Share</th><th>Top endpoint</th><th>Root cause</th><th className="text-end">Action</th></tr></thead><tbody>
            {errors.map(r => <tr key={r.id}><td className="pm-td-strong">{r.code}</td><td className="pm-num">{r.count}</td><td><Badge tone={r.share.startsWith("52") ? "red" : "amber"}>{r.share}</Badge></td><td className="mono">{r.topEndpoint}</td><td>{r.rootCause}</td><td className="text-end"><button className="btn btn-sm btn-outline-primary" onClick={() => setErrorDetail(r)}><i className="bi bi-search me-1" />Investigate</button></td></tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* ====================== VERSIONS TAB ====================== */}
      {tab === "versions" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>API versioning</h3><p>Current, deprecated and beta contracts.</p></div>
        </div>
        <div className="row g-3">
          {[{ ver: "v1", status: "Deprecated", desc: "All original endpoints", sunset: "Jul 2027", tone: "grey" as const },
            { ver: "v2", status: "Current", desc: "All endpoints + new features", sunset: "N/A", tone: "green" as const },
            { ver: "v3", status: "Beta", desc: "New endpoints only", sunset: "N/A", tone: "amber" as const }].map(v => <div className="col-md-4" key={v.ver}>
            <div className={`pm-card pm-card-pad ${v.ver === "v2" ? "border-success" : ""}`}>
              <Badge tone={v.tone} dot>{v.status}</Badge>
              <h5 className="mt-3">{v.ver}</h5>
              <p className="pm-td-sub mb-2">{v.desc}</p>
              {v.sunset !== "N/A" && <div className="small mb-2">Sunset: {v.sunset}</div>}
              {v.ver === "v2" && <button className="btn btn-sm btn-outline-primary" onClick={() => setDocsDrawer(true)}>Open reference</button>}
              {v.ver === "v3" && <button className="btn btn-sm btn-outline-secondary" onClick={() => ask("Request v3 access", <p>A sandbox v3 access request was sent to Engineering.</p>, "amber", "bi-beaker")}>Request access</button>}
            </div>
          </div>)}
        </div>
      </section>}

      {/* ====================== SECURITY TAB ====================== */}
      {tab === "security" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>API security policies</h3><p>Access control, network security and data integrity rules.</p></div>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setEmergencyWizard(true)} style={{ borderColor: "var(--pm-danger)", color: "var(--pm-danger)" }}><i className="bi bi-exclamation-triangle me-1" />Emergency revoke</button>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Policy</th><th>Category</th><th>Severity</th><th>Status</th><th>Description</th><th className="text-end">Actions</th></tr></thead><tbody>
            {securityPolicies.map(r => <tr key={r.id}><td className="pm-td-strong" style={{ cursor: "pointer" }} onClick={() => setSecurityPolicyDetail(r)}>{r.policy}</td><td><Badge tone="grey">{r.category}</Badge></td><td><span className={`severity-badge ${r.severity.toLowerCase()}`}>{r.severity}</span></td><td><Badge tone={r.status === "Enforced" ? "green" : "amber"} dot>{r.status}</Badge></td><td style={{ maxWidth: 250 }} className="text-truncate">{r.description}</td><td className="text-end"><button className="btn btn-sm btn-outline-primary" onClick={() => setSecurityPolicyDetail(r)}><i className="bi bi-eye" /></button></td></tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* ====================== DOCUMENTATION TAB ====================== */}
      {tab === "docs" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>API documentation</h3><p>Technical guides, authentication references and integration docs.</p></div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setDocsDrawer(true)}><i className="bi bi-book me-1" />All docs</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setExportWizard(true)}><i className="bi bi-download me-1" />Export</button>
          </div>
        </div>
        <div className="row g-3">
          {apiDocs.map(d => <div className="col-md-6 col-xl-4" key={d.id}>
            <div className="pm-card pm-card-pad" style={{ cursor: "pointer" }}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="d-flex align-items-center gap-2">
                  <div className="api-page" style={{ width: 40, height: 40, borderRadius: 10, background: "#eff8ff", display: "grid", placeItems: "center", fontSize: "1.1rem" }}><i className="bi bi-file-earmark-text text-blue" /></div>
                  <div><div className="pm-td-strong">{d.title}</div><div className="pm-td-sub">{d.type} · {d.version}</div></div>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Badge tone="green">{d.status}</Badge>
                <span className="pm-td-sub">{d.lastUpdated}</span>
              </div>
              <div className="d-flex gap-1">
                <button className="btn btn-sm btn-outline-primary flex-grow-1" onClick={() => setDocPreview(d)}><i className="bi bi-eye me-1" />Preview</button>
              </div>
            </div>
          </div>)}
        </div>
      </section>}

      {/* ====================== AUDIT TRAIL TAB ====================== */}
      {tab === "audit" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>API audit trail</h3><p>Immutable record of all API operations, key changes and integration updates.</p></div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setExportWizard(true)}><i className="bi bi-download me-1" />Export</button>
          </div>
        </div>
        <div className="pm-card pm-card-pad">
          {apiAudit.map(r => <div className="audit-row" key={r.id}>
            <div className={`audit-dot ${r.severity.toLowerCase()}`} />
            <div className="audit-content">
              <div className="audit-action">{r.action} {r.resource}</div>
              <div className="audit-detail">{r.details}</div>
            </div>
            <div className="audit-meta"><div>{r.actor}</div><div>{r.timestamp}</div></div>
          </div>)}
        </div>
      </section>}

      {/* ====================== GENERIC ACTION MODAL ====================== */}
      <Modal open={!!action} onClose={() => setAction(null)} title={action?.title ?? "API action"} subtitle="Super Admin action · credentials and integrations are audited" icon={action?.icon} tone={action?.tone}>
        <div className="pm-modal-body">{action?.body}</div>
        <div className="pm-modal-foot">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setAction(null)}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={() => { setAction(null); push({ kind: "success", title: "API workspace updated", body: "The action was added to the integration audit trail." }); }}>Confirm action</button>
        </div>
      </Modal>

      {/* ====================== ALL WIZARDS & SPECIAL MODALS ====================== */}
      <ApiKeyCreateWizard open={createKeyWizard} onClose={() => setCreateKeyWizard(false)} />
      <RotateCredentialsWizard open={!!rotateWizard} keyData={rotateWizard} onClose={() => setRotateWizard(null)} />
      <KeyRevocationWizard open={!!revokeWizard} keyData={revokeWizard} onClose={() => setRevokeWizard(null)} />
      <EmergencyRevocationWizard open={emergencyWizard} onClose={() => setEmergencyWizard(false)} />
      <ExportCenterWizard open={exportWizard} onClose={() => setExportWizard(false)} />
      <IntegrationOnboardingWizard open={integrationWizard} onClose={() => setIntegrationWizard(false)} />
      <RateLimitPolicyModal open={rateLimitModal} onClose={() => setRateLimitModal(false)} />
      <ApiTestConsoleModal open={testConsole} onClose={() => setTestConsole(false)} />
      <ApiDocsDrawer open={docsDrawer} onClose={() => setDocsDrawer(false)} />
      <ApiPerformanceDrawer open={perfDrawer} onClose={() => setPerfDrawer(false)} />
      <ApiBulkOperationsModal open={bulkOps} onClose={() => setBulkOps(false)} />
      <ApiAuditTrailModal open={auditTrail} onClose={() => setAuditTrail(false)} logs={apiAudit} />
      <ApiKeyDetailDrawer keyData={keyDetail} onClose={() => setKeyDetail(null)} />
      <ErrorInvestigationModal open={!!errorDetail} error={errorDetail} onClose={() => setErrorDetail(null)} />
      <IntegrationHealthModal open={!!integrationHealth} integration={integrationHealth} onClose={() => setIntegrationHealth(null)} />
      <WebhookDeliveryDrawer webhook={webhookDelivery} onClose={() => setWebhookDelivery(null)} />
      <WebhookTestModal open={!!webhookTest} webhook={webhookTest} onClose={() => setWebhookTest(null)} />
      <ApiSecurityPolicyDetailModal open={!!securityPolicyDetail} policy={securityPolicyDetail} onClose={() => setSecurityPolicyDetail(null)} />
      <ApiDocumentPreviewModal open={!!docPreview} doc={docPreview} onClose={() => setDocPreview(null)} />

      {/* ====================== CRUD MODALS — Keys ====================== */}
      <AddRecordModal open={addKey} onClose={() => setAddKey(false)} onAdd={handleAddKey} title="Create API Key" fields={keyFields} typeName="API Key" />
      <EditRecordModal open={!!editKey} onClose={() => setEditKey(null)} onSave={handleEditKey} record={editKey} typeName="API Key" />
      <DeleteRecordWizard open={!!deleteKey} onClose={() => setDeleteKey(null)} onDelete={handleDeleteKey} record={deleteKey} typeName="API Key" relatedItems={["Webhook consumers", "Partner integrations", "Batch pipelines"]} />
      <LockUnlockModal open={!!lockKey} onClose={() => setLockKey(null)} onToggle={handleLockKey} record={lockKey ? { name: lockKey.name, locked: !!lockKey.locked, lockedBy: lockKey.lockedBy, lockedAt: lockKey.lockedAt, lockReason: lockKey.lockReason } : null} typeName="API Key" />

      {/* ====================== CRUD MODALS — Webhooks ====================== */}
      <AddRecordModal open={addWebhook} onClose={() => setAddWebhook(false)} onAdd={handleAddWebhook} title="Register Webhook" fields={webhookFields} typeName="Webhook" />
      <EditRecordModal open={!!editWebhook} onClose={() => setEditWebhook(null)} onSave={handleEditWebhook} record={editWebhook} typeName="Webhook" />
      <DeleteRecordWizard open={!!deleteWebhook} onClose={() => setDeleteWebhook(null)} onDelete={handleDeleteWebhook} record={deleteWebhook} typeName="Webhook" relatedItems={["Event subscriptions", "Delivery logs"]} />
      <LockUnlockModal open={!!lockWebhook} onClose={() => setLockWebhook(null)} onToggle={handleLockWebhook} record={lockWebhook ? { name: lockWebhook.name, locked: !!lockWebhook.locked, lockedBy: lockWebhook.lockedBy, lockedAt: lockWebhook.lockedAt, lockReason: lockWebhook.lockReason } : null} typeName="Webhook" />

      {/* ====================== CRUD MODALS — Integrations ====================== */}
      <AddRecordModal open={addIntegration} onClose={() => setAddIntegration(false)} onAdd={handleAddIntegration} title="Add Integration" fields={integrationFields} typeName="Integration" />
      <EditRecordModal open={!!editIntegration} onClose={() => setEditIntegration(null)} onSave={handleEditIntegration} record={editIntegration} typeName="Integration" />
      <DeleteRecordWizard open={!!deleteIntegration} onClose={() => setDeleteIntegration(null)} onDelete={handleDeleteIntegration} record={deleteIntegration} typeName="Integration" relatedItems={["API keys using this provider", "Webhook connections", "Health monitoring", "Contract records"]} />
      <LockUnlockModal open={!!lockIntegration} onClose={() => setLockIntegration(null)} onToggle={handleLockIntegration} record={lockIntegration ? { name: lockIntegration.provider, locked: !!lockIntegration.locked, lockedBy: lockIntegration.lockedBy, lockedAt: lockIntegration.lockedAt, lockReason: lockIntegration.lockReason } : null} typeName="Integration" />
    </div>
  );
}
