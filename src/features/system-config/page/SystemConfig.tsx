import { useCallback, useMemo, useState } from "react";
import { Badge, Drawer, Modal, Steps, useToast } from "../../../components/ui";
import { AdminRowActions, AddRecordModal, EditRecordModal, DeleteRecordWizard, LockUnlockModal } from "../../../components/AdminControls";
import {
  type GeneralSetting, type NotificationChannel, type RateLimit, type FeatureToggle, type ChangeRecord, type BrandSetting, type MaintenanceWindow,
  initialGeneral, initialNotifications, initialRates, initialFeatures, initialHistory, initialBrand, initialMaintenance
} from "../data/configData";

type A = { title: string; body: React.ReactNode; icon?: string; tone?: "green" | "red" | "amber" | "blue" | "violet" | "ink" };

export function SystemConfig({ signal: _signal }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  const { push } = useToast();
  const [tab, setTab] = useState("general");
  const [action, setAction] = useState<A | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [wizard, setWizard] = useState(false);
  const [step, setStep] = useState(0);

  // Data state
  const [general, setGeneral] = useState<GeneralSetting[]>(initialGeneral);
  const [notifications, setNotifications] = useState<NotificationChannel[]>(initialNotifications);
  const [rates, setRates] = useState<RateLimit[]>(initialRates);
  const [features, setFeatures] = useState<FeatureToggle[]>(initialFeatures);
  const [history] = useState<ChangeRecord[]>(initialHistory);
  const [brand, setBrand] = useState<BrandSetting[]>(initialBrand);
  const [maintenance] = useState<MaintenanceWindow[]>(initialMaintenance);

  // CRUD modals — General
  const [editGeneral, setEditGeneral] = useState<GeneralSetting | null>(null);
  const [deleteGeneral, setDeleteGeneral] = useState<GeneralSetting | null>(null);
  const [lockGeneral, setLockGeneral] = useState<GeneralSetting | null>(null);
  const [addGeneral, setAddGeneral] = useState(false);

  // CRUD modals — Notifications
  const [editNotification, setEditNotification] = useState<NotificationChannel | null>(null);
  const [deleteNotification, setDeleteNotification] = useState<NotificationChannel | null>(null);
  const [lockNotification, setLockNotification] = useState<NotificationChannel | null>(null);
  const [addNotification, setAddNotification] = useState(false);

  // CRUD modals — Rate limits
  const [editRate, setEditRate] = useState<RateLimit | null>(null);
  const [deleteRate, setDeleteRate] = useState<RateLimit | null>(null);
  const [lockRate, setLockRate] = useState<RateLimit | null>(null);
  const [addRate, setAddRate] = useState(false);

  // CRUD modals — Features
  const [editFeature, setEditFeature] = useState<FeatureToggle | null>(null);
  const [deleteFeature, setDeleteFeature] = useState<FeatureToggle | null>(null);
  const [lockFeature, setLockFeature] = useState<FeatureToggle | null>(null);
  const [addFeature, setAddFeature] = useState(false);

  // CRUD modals — Brand
  const [editBrand, setEditBrand] = useState<BrandSetting | null>(null);
  const [deleteBrand, setDeleteBrand] = useState<BrandSetting | null>(null);
  const [lockBrand, setLockBrand] = useState<BrandSetting | null>(null);
  const [addBrand, setAddBrand] = useState(false);

  const ask = (title: string, body: React.ReactNode, tone: A["tone"] = "green", icon = "bi-check2-circle") => setAction({ title, body, tone, icon });

  // CRUD handlers — General
  const handleAddGeneral = useCallback((form: Record<string, string>) => {
    setGeneral(p => [{ id: `gs-${Date.now()}`, setting: form.setting || "New Setting", value: form.value || "—", editableBy: form.editableBy || "Super admin" }, ...p]);
  }, []);
  const handleEditGeneral = useCallback((form: Record<string, string>) => { if (!editGeneral) return; setGeneral(p => p.map(g => g.id === editGeneral.id ? { ...g, ...form } : g)); }, [editGeneral]);
  const handleDeleteGeneral = useCallback(() => { if (!deleteGeneral) return; setGeneral(p => p.filter(g => g.id !== deleteGeneral.id)); }, [deleteGeneral]);
  const handleLockGeneral = useCallback((locked: boolean) => { if (!lockGeneral) return; setGeneral(p => p.map(g => g.id === lockGeneral.id ? { ...g, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Admin lock" : undefined } : g)); }, [lockGeneral]);

  // CRUD handlers — Notifications
  const handleAddNotification = useCallback((form: Record<string, string>) => {
    setNotifications(p => [{ id: `nc-${Date.now()}`, channel: form.channel || "New Channel", status: "Enabled", provider: form.provider || "—", config: form.config || "—" }, ...p]);
  }, []);
  const handleEditNotification = useCallback((form: Record<string, string>) => { if (!editNotification) return; setNotifications(p => p.map(n => n.id === editNotification.id ? { ...n, ...form } : n)); }, [editNotification]);
  const handleDeleteNotification = useCallback(() => { if (!deleteNotification) return; setNotifications(p => p.filter(n => n.id !== deleteNotification.id)); }, [deleteNotification]);
  const handleLockNotification = useCallback((locked: boolean) => { if (!lockNotification) return; setNotifications(p => p.map(n => n.id === lockNotification.id ? { ...n, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Admin lock" : undefined } : n)); }, [lockNotification]);

  // CRUD handlers — Rates
  const handleAddRate = useCallback((form: Record<string, string>) => {
    setRates(p => [{ id: `rl-${Date.now()}`, endpoint: form.endpoint || "New Endpoint", limit: form.limit || "—", window: form.window || "1 min", appliesTo: form.appliesTo || "All" }, ...p]);
  }, []);
  const handleEditRate = useCallback((form: Record<string, string>) => { if (!editRate) return; setRates(p => p.map(r => r.id === editRate.id ? { ...r, ...form } : r)); }, [editRate]);
  const handleDeleteRate = useCallback(() => { if (!deleteRate) return; setRates(p => p.filter(r => r.id !== deleteRate.id)); }, [deleteRate]);
  const handleLockRate = useCallback((locked: boolean) => { if (!lockRate) return; setRates(p => p.map(r => r.id === lockRate.id ? { ...r, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Admin lock" : undefined } : r)); }, [lockRate]);

  // CRUD handlers — Features
  const handleAddFeature = useCallback((form: Record<string, string>) => {
    setFeatures(p => [{ id: `ft-${Date.now()}`, feature: form.feature || "New Feature", state: "Disabled", rollout: "0%", description: form.description || "—" }, ...p]);
  }, []);
  const handleEditFeature = useCallback((form: Record<string, string>) => { if (!editFeature) return; setFeatures(p => p.map(f => f.id === editFeature.id ? { ...f, ...form } : f)); }, [editFeature]);
  const handleDeleteFeature = useCallback(() => { if (!deleteFeature) return; setFeatures(p => p.filter(f => f.id !== deleteFeature.id)); }, [deleteFeature]);
  const handleLockFeature = useCallback((locked: boolean) => { if (!lockFeature) return; setFeatures(p => p.map(f => f.id === lockFeature.id ? { ...f, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Admin lock" : undefined } : f)); }, [lockFeature]);

  // CRUD handlers — Brand
  const handleAddBrand = useCallback((form: Record<string, string>) => {
    setBrand(p => [{ id: `br-${Date.now()}`, name: form.name || "New Setting", value: form.value || "—", icon: form.icon || "bi-circle" }, ...p]);
  }, []);
  const handleEditBrand = useCallback((form: Record<string, string>) => { if (!editBrand) return; setBrand(p => p.map(b => b.id === editBrand.id ? { ...b, ...form } : b)); }, [editBrand]);
  const handleDeleteBrand = useCallback(() => { if (!deleteBrand) return; setBrand(p => p.filter(b => b.id !== deleteBrand.id)); }, [deleteBrand]);
  const handleLockBrand = useCallback((locked: boolean) => { if (!lockBrand) return; setBrand(p => p.map(b => b.id === lockBrand.id ? { ...b, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Admin lock" : undefined } : b)); }, [lockBrand]);

  const generalFields = [{ label: "setting", placeholder: "Setting name", required: true }, { label: "value", placeholder: "Setting value", required: true }, { label: "editableBy", placeholder: "Super admin / Regulatory" }];
  const notifFields = [{ label: "channel", placeholder: "Channel name", required: true }, { label: "provider", placeholder: "Provider name" }, { label: "config", placeholder: "Configuration details" }];
  const rateFields = [{ label: "endpoint", placeholder: "Endpoint name", required: true }, { label: "limit", placeholder: "5 per IP" }, { label: "window", placeholder: "15 min" }, { label: "appliesTo", placeholder: "All / Admins / API users" }];
  const featureFields = [{ label: "feature", placeholder: "Feature name", required: true }, { label: "description", placeholder: "Feature description" }];
  const brandFields = [{ label: "name", placeholder: "Setting name", required: true }, { label: "value", placeholder: "Setting value", required: true }, { label: "icon", placeholder: "bi-circle" }];

  return (
    <div className="pm-page-content sysconfig-page">
      <div className="pm-section-head" style={{ marginTop: 0 }}>
        <div>
          <div className="pm-eyebrow">PLATFORM ADMINISTRATION / PAGE 32</div>
          <h2 className="mb-1">System Configuration</h2>
          <p>Platform-wide settings for branding, features, limits, integrations, maintenance and security.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setAction({ title: "Compliance Audit Trail", body: <div><p>All configuration changes are versioned, audit-logged and require Super Admin approval.</p></div>, tone: "blue", icon: "bi-clock-history" })}><i className="bi bi-clock-history me-1" />Audit trail</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setAction({ title: "Admin Permissions", body: <div className="pm-card pm-card-pad"><h6>Role-based access</h6>{[["Super Admin", "Full access: edit, approve, deploy all config"], ["Security Lead", "Security settings, TLS, CSP, encryption"], ["Ops Manager", "Maintenance windows, notification channels"], ["Finance Manager", "Fee config, rate limits"], ["Viewer", "Read-only access"]].map(([role, perm]) => <div className="d-flex justify-content-between py-1 border-bottom small" key={role}><span className="pm-td-strong">{role}</span><span className="text-muted">{perm}</span></div>)}</div>, tone: "blue", icon: "bi-shield-lock" })}><i className="bi bi-shield-lock me-1" />Permissions</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setDrawer(true)}><i className="bi bi-shield-lock me-1" />Security posture</button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => setWizard(true)}><i className="bi bi-clock-history me-1" />Maintenance window</button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => setAction({ title: "Export Configuration", body: <div><p>Export all configuration settings, feature flags and change history.</p><div className="d-grid gap-2 mt-3"><button className="btn btn-outline-primary btn-sm" onClick={() => { push({ kind: "success", title: "Export started" }); setAction(null); }}>Export as JSON</button><button className="btn btn-outline-primary btn-sm" onClick={() => { push({ kind: "success", title: "Export started" }); setAction(null); }}>Export as CSV</button></div></div>, tone: "blue", icon: "bi-download" })}><i className="bi bi-download me-1" />Export</button>
          <button className="btn btn-primary btn-sm" onClick={() => ask("Save configuration draft", <p>Configuration changes are staged and require Super Admin approval before production rollout.</p>, "amber", "bi-save")}><i className="bi bi-save me-1" />Save changes</button>
        </div>
      </div>

      {/* Hero */}
      <div className="pm-hero sysconfig-hero mb-3">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <div className="pm-eyebrow text-white-50">PLATFORM CONTROL PLANE · PRODUCTION</div>
            <div className="pm-hero-value">{general.length + notifications.length + rates.length + features.length} <span className="fs-6 fw-normal text-white-50">configuration domains</span></div>
            <div className="small text-white-50 mt-2">All critical changes versioned · encrypted secrets · maintenance controls armed</div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <div className="pm-hero-chip"><div className="l">Feature flags</div><div className="v">{features.length}</div></div>
            <div className="pm-hero-chip"><div className="l">Enabled channels</div><div className="v text-success">{notifications.filter(n => n.status === "Enabled").length} / {notifications.length}</div></div>
            <div className="pm-hero-chip"><div className="l">Locked settings</div><div className="v text-warning">{[...general, ...features, ...brand].filter(x => x.locked).length}</div></div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-3">
        {[
          ["Configuration keys", String(general.length + rates.length), "Across 7 domains", "bi-sliders", "green"],
          ["Feature toggles", String(features.length), `${features.filter(f => f.state === "Beta").length} in beta rollout`, "bi-toggles", "blue"],
          ["Notification channels", String(notifications.length), "All providers healthy", "bi-bell", "violet"],
          ["Security controls", "14", "TLS 1.3 · KMS managed", "bi-shield-check", "amber"]
        ].map(x => <div className="col-6 col-xl-3" key={x[0]}><div className="pm-stat" style={{ cursor: "pointer" }} onClick={() => ask(x[0], <p>{x[2]}</p>, x[4] as any, x[3])}><div className={`pm-stat-ico bg-${x[4]}-soft text-${x[4]}`}><i className={`bi ${x[3]}`} /></div><div className="pm-stat-label">{x[0]}</div><div className="pm-stat-value">{x[1]}</div><div className="pm-stat-foot">{x[2]}</div></div></div>)}
      </div>

      {/* Tabs */}
      <div className="pm-card mb-3">
        <div className="pm-tabs">
          {[
            ["general", "General settings", "bi-gear"], ["branding", "Branding", "bi-palette"], ["maintenance", "Maintenance", "bi-tools"],
            ["notifications", "Notifications", "bi-bell"], ["rates", "Rate limits", "bi-speedometer2"],
            ["features", "Feature toggles", "bi-flag"], ["history", "Change history", "bi-clock-history"]
          ].map(x => <button className={`pm-tab ${tab === x[0] ? "active" : ""}`} key={x[0]} onClick={() => setTab(x[0])}><i className={`bi ${x[2]}`} />{x[1]}</button>)}
        </div>
      </div>

      {/* === GENERAL TAB === */}
      {tab === "general" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>General settings</h3><p>Core platform identity, locale and regulatory values.</p></div>
          <button className="btn btn-primary btn-sm" onClick={() => setAddGeneral(true)}><i className="bi bi-plus me-1" />Add setting</button>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Setting</th><th>Current value</th><th>Editable by</th><th className="text-end">Actions</th></tr></thead><tbody>
            {general.map(r => <tr key={r.id}>
              <td className="pm-td-strong">{r.setting}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td>
              <td>{r.value}</td>
              <td><Badge tone="grey">{r.editableBy}</Badge></td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditGeneral(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setLockGeneral(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteGeneral(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* === BRANDING TAB === */}
      {tab === "branding" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Branding configuration</h3><p>Visual identity used across PayMo admin, email and customer-facing surfaces.</p></div>
          <button className="btn btn-primary btn-sm" onClick={() => setAddBrand(true)}><i className="bi bi-plus me-1" />Add brand setting</button>
        </div>
        <div className="row g-3">
          {brand.map(r => <div className="col-md-6 col-xl-4" key={r.id}>
            <div className="pm-card pm-card-pad">
              <div className="d-flex align-items-center gap-2">
                <i className={`bi ${r.icon} fs-4 text-success`} />
                <div className="flex-grow-1"><div className="pm-stat-label">{r.name}</div><b>{r.value}</b></div>
                <div className="d-flex gap-1">
                  <button className="btn btn-sm btn-outline-primary" onClick={() => setEditBrand(r)} title="Edit"><i className="bi bi-pencil" /></button>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setLockBrand(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteBrand(r)} title="Delete"><i className="bi bi-trash3" /></button>
                </div>
              </div>
              {r.locked && <div className="mt-2"><Badge tone="amber"><i className="bi bi-lock-fill me-1" />Locked by {r.lockedBy}</Badge></div>}
            </div>
          </div>)}
        </div>
      </section>}

      {/* === MAINTENANCE TAB === */}
      {tab === "maintenance" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Maintenance configuration</h3><p>Schedule planned maintenance or arm emergency controls.</p></div>
          <button className="btn btn-primary btn-sm" onClick={() => setWizard(true)}><i className="bi bi-clock-history me-1" />Schedule maintenance</button>
        </div>
        <div className="pm-card pm-card-pad">
          <div className="row g-3">
            {["Scheduled maintenance", "Maintenance message", "Notification", "Kill active sessions", "Admin access during maintenance", "Emergency maintenance"].map((k, i) => {
              const m = maintenance[0];
              const vals = [`${m.day} ${m.time}`, m.message, m.notification, m.killSessions, m.adminAccess, m.emergency];
              return <div className="col-md-6" key={k}><div className="config-row"><span className="pm-td-sub">{k}</span><b>{vals[i]}</b></div></div>;
            })}
          </div>
        </div>
      </section>}

      {/* === NOTIFICATIONS TAB === */}
      {tab === "notifications" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Notification settings</h3><p>Delivery providers and channel configuration.</p></div>
          <div className="d-flex gap-2">
            <button className="btn btn-primary btn-sm" onClick={() => setAddNotification(true)}><i className="bi bi-plus me-1" />Add channel</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => ask("Test all channels", <p>Test notifications were queued to all channels.</p>, "blue", "bi-send")}><i className="bi bi-send me-1" />Test all</button>
          </div>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Channel</th><th>Status</th><th>Provider</th><th>Configuration</th><th className="text-end">Actions</th></tr></thead><tbody>
            {notifications.map(r => <tr key={r.id}>
              <td className="pm-td-strong">{r.channel}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td>
              <td><Badge tone="green" dot>{r.status}</Badge></td>
              <td>{r.provider}</td>
              <td>{r.config}</td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditNotification(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setLockNotification(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteNotification(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* === RATE LIMITS TAB === */}
      {tab === "rates" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Rate limiting configuration</h3><p>Traffic protection rules applied by endpoint, actor and time window.</p></div>
          <div className="d-flex gap-2">
            <button className="btn btn-primary btn-sm" onClick={() => setAddRate(true)}><i className="bi bi-plus me-1" />Add rate limit</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => ask("Simulate rate limits", <p>A rate-limit simulation was run against production thresholds.</p>, "blue", "bi-play-circle")}><i className="bi bi-play-circle me-1" />Simulate</button>
          </div>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Endpoint</th><th>Limit</th><th>Window</th><th>Applies to</th><th>Status</th><th className="text-end">Actions</th></tr></thead><tbody>
            {rates.map(r => <tr key={r.id}>
              <td className="pm-td-strong">{r.endpoint}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td>
              <td>{r.limit}</td>
              <td>{r.window}</td>
              <td>{r.appliesTo}</td>
              <td><Badge tone="green" dot>Active</Badge></td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditRate(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setLockRate(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteRate(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* === FEATURES TAB === */}
      {tab === "features" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Feature toggles</h3><p>Quick-access rollout controls with percentage targeting and kill switches.</p></div>
          <div className="d-flex gap-2">
            <button className="btn btn-primary btn-sm" onClick={() => setAddFeature(true)}><i className="bi bi-plus me-1" />Add feature</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => ask("Export feature flags", <p>The feature flag registry was exported.</p>, "blue", "bi-download")}><i className="bi bi-download me-1" />Export</button>
          </div>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Feature</th><th>State</th><th>Rollout</th><th>Description</th><th className="text-end">Actions</th></tr></thead><tbody>
            {features.map(r => <tr key={r.id}>
              <td className="pm-td-strong">{r.feature}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td>
              <td><Badge tone={r.state === "Enabled" ? "green" : r.state === "Beta" ? "amber" : "grey"}>{r.state}</Badge></td>
              <td>{r.rollout}</td>
              <td>{r.description}</td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditFeature(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setLockFeature(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteFeature(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* === HISTORY TAB === */}
      {tab === "history" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Configuration change history</h3><p>Versioned changes, before and after values, reasons and actors.</p></div>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => ask("Export history", <p>The configuration history was exported with approval metadata.</p>, "blue", "bi-download")}><i className="bi bi-download me-1" />Export</button>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Date</th><th>Admin</th><th>Setting</th><th>Old value</th><th>New value</th><th>Reason</th></tr></thead><tbody>
            {history.map(r => <tr key={r.id}>
              <td>{r.date}</td>
              <td className="pm-td-strong">{r.admin}</td>
              <td className="mono">{r.setting}</td>
              <td>{r.oldValue}</td>
              <td>{r.newValue}</td>
              <td>{r.reason}</td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* Generic action modal */}
      <Modal open={!!action} onClose={() => setAction(null)} title={action?.title ?? "Configuration action"} subtitle="Super Admin action · versioned and audited" icon={action?.icon} tone={action?.tone}>
        <div className="pm-modal-body">{action?.body}</div>
        <div className="pm-modal-foot">
          <button className="btn btn-outline-secondary" onClick={() => setAction(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { setAction(null); push({ kind: "success", title: "Configuration action completed", body: "The change was staged in the approval queue." }); }}>Confirm action</button>
        </div>
      </Modal>

      {/* Maintenance wizard */}
      <Modal open={wizard} onClose={() => setWizard(false)} title="Schedule maintenance change" subtitle="Plan a controlled maintenance window with notifications and rollback" icon="bi-tools" tone="amber" size="lg">
        <Steps current={step} steps={[{ label: "Window", icon: "bi-calendar3" }, { label: "Message", icon: "bi-chat-text" }, { label: "Impact", icon: "bi-people" }, { label: "Review", icon: "bi-check2" }]} />
        <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 25}%` }} /></div>
        <div className="pm-modal-body">
          <div className="pm-note mb-3"><i className="bi bi-shield-lock me-1" />Only Super Admins can schedule maintenance. All changes are audit-logged.</div>
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label">Maintenance window</label><input className="form-control" defaultValue="Sunday · 02:00–04:00 EAT" /></div>
            <div className="col-md-6"><label className="form-label">Mode</label><select className="form-select"><option>Scheduled</option><option>Emergency · 2FA required</option></select></div>
            <div className="col-12"><label className="form-label">User-facing message</label><textarea className="form-control" rows={3} defaultValue="We're performing scheduled upgrades. We'll be back shortly." /></div>
          </div>
        </div>
        <div className="pm-modal-foot">
          <button className="btn btn-outline-secondary" onClick={() => step ? setStep(step - 1) : setWizard(false)}>{step ? "Back" : "Cancel"}</button>
          {step < 3 ? <button className="btn btn-primary" onClick={() => setStep(step + 1)}>Continue</button> : <button className="btn btn-primary" onClick={() => { setWizard(false); push({ kind: "success", title: "Maintenance change queued", body: "The window is awaiting Super Admin confirmation." }); }}>Schedule change</button>}
        </div>
      </Modal>

      {/* Security posture drawer */}
      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Security posture" subtitle="Platform security controls and encrypted configuration" icon="bi-shield-lock" wide>
        <div className="pm-card pm-card-pad mb-3"><Badge tone="green" dot>Hardened</Badge>
          <h5 className="mt-3">Production security baseline</h5>
          <p className="small text-muted">Transport, application and secret-management controls are enforced across all environments.</p>
        </div>
        <div className="pm-card pm-card-pad">
          {[["HTTPS / HSTS", "Enabled · 1 year"], ["TLS minimum", "1.3"], ["CSP headers", "Strict"], ["Session cookie", "HttpOnly · Secure · SameSite=Strict"], ["Encryption at rest", "AES-256"], ["Key management", "AWS KMS · auto-rotation"], ["File uploads", "PDF, JPG, PNG · max 10MB"]].map(x => <div className="config-row" key={x[0]}><span className="pm-td-sub">{x[0]}</span><b>{x[1]}</b></div>)}
        </div>
      </Drawer>

      {/* CRUD Modals — General */}
      <AddRecordModal open={addGeneral} onClose={() => setAddGeneral(false)} onAdd={handleAddGeneral} fields={generalFields} title="Add Setting" icon="bi-gear" />
      <EditRecordModal open={!!editGeneral} onClose={() => setEditGeneral(null)} onSave={handleEditGeneral} record={editGeneral} title={`Edit: ${editGeneral?.setting ?? ""}`} icon="bi-pencil-square" />
      <DeleteRecordWizard open={!!deleteGeneral} onClose={() => setDeleteGeneral(null)} onDelete={handleDeleteGeneral} name={deleteGeneral?.setting ?? ""} relatedCount={2} dependencyCount={1} />
      <LockUnlockModal open={!!lockGeneral} onClose={() => setLockGeneral(null)} onToggle={handleLockGeneral} record={lockGeneral ? { name: lockGeneral.setting, locked: !!lockGeneral.locked, lockedBy: lockGeneral.lockedBy, lockedAt: lockGeneral.lockedAt, lockReason: lockGeneral.lockReason } : null} />

      {/* CRUD Modals — Notifications */}
      <AddRecordModal open={addNotification} onClose={() => setAddNotification(false)} onAdd={handleAddNotification} fields={notifFields} title="Add Notification Channel" icon="bi-bell" />
      <EditRecordModal open={!!editNotification} onClose={() => setEditNotification(null)} onSave={handleEditNotification} record={editNotification} title={`Edit: ${editNotification?.channel ?? ""}`} icon="bi-pencil-square" />
      <DeleteRecordWizard open={!!deleteNotification} onClose={() => setDeleteNotification(null)} onDelete={handleDeleteNotification} name={deleteNotification?.channel ?? ""} relatedCount={1} dependencyCount={1} />
      <LockUnlockModal open={!!lockNotification} onClose={() => setLockNotification(null)} onToggle={handleLockNotification} record={lockNotification ? { name: lockNotification.channel, locked: !!lockNotification.locked, lockedBy: lockNotification.lockedBy, lockedAt: lockNotification.lockedAt, lockReason: lockNotification.lockReason } : null} />

      {/* CRUD Modals — Rates */}
      <AddRecordModal open={addRate} onClose={() => setAddRate(false)} onAdd={handleAddRate} fields={rateFields} title="Add Rate Limit" icon="bi-speedometer2" />
      <EditRecordModal open={!!editRate} onClose={() => setEditRate(null)} onSave={handleEditRate} record={editRate} title={`Edit: ${editRate?.endpoint ?? ""}`} icon="bi-pencil-square" />
      <DeleteRecordWizard open={!!deleteRate} onClose={() => setDeleteRate(null)} onDelete={handleDeleteRate} name={deleteRate?.endpoint ?? ""} relatedCount={1} dependencyCount={0} />
      <LockUnlockModal open={!!lockRate} onClose={() => setLockRate(null)} onToggle={handleLockRate} record={lockRate ? { name: lockRate.endpoint, locked: !!lockRate.locked, lockedBy: lockRate.lockedBy, lockedAt: lockRate.lockedAt, lockReason: lockRate.lockReason } : null} />

      {/* CRUD Modals — Features */}
      <AddRecordModal open={addFeature} onClose={() => setAddFeature(false)} onAdd={handleAddFeature} fields={featureFields} title="Add Feature Toggle" icon="bi-flag" />
      <EditRecordModal open={!!editFeature} onClose={() => setEditFeature(null)} onSave={handleEditFeature} record={editFeature} title={`Edit: ${editFeature?.feature ?? ""}`} icon="bi-pencil-square" />
      <DeleteRecordWizard open={!!deleteFeature} onClose={() => setDeleteFeature(null)} onDelete={handleDeleteFeature} name={deleteFeature?.feature ?? ""} relatedCount={3} dependencyCount={2} />
      <LockUnlockModal open={!!lockFeature} onClose={() => setLockFeature(null)} onToggle={handleLockFeature} record={lockFeature ? { name: lockFeature.feature, locked: !!lockFeature.locked, lockedBy: lockFeature.lockedBy, lockedAt: lockFeature.lockedAt, lockReason: lockFeature.lockReason } : null} />

      {/* CRUD Modals — Brand */}
      <AddRecordModal open={addBrand} onClose={() => setAddBrand(false)} onAdd={handleAddBrand} fields={brandFields} title="Add Brand Setting" icon="bi-palette" />
      <EditRecordModal open={!!editBrand} onClose={() => setEditBrand(null)} onSave={handleEditBrand} record={editBrand} title={`Edit: ${editBrand?.name ?? ""}`} icon="bi-pencil-square" />
      <DeleteRecordWizard open={!!deleteBrand} onClose={() => setDeleteBrand(null)} onDelete={handleDeleteBrand} name={deleteBrand?.name ?? ""} relatedCount={0} dependencyCount={0} />
      <LockUnlockModal open={!!lockBrand} onClose={() => setLockBrand(null)} onToggle={handleLockBrand} record={lockBrand ? { name: lockBrand.name, locked: !!lockBrand.locked, lockedBy: lockBrand.lockedBy, lockedAt: lockBrand.lockedAt, lockReason: lockBrand.lockReason } : null} />
    </div>
  );
}
