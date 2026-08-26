import { useCallback, useState } from "react";
import { Badge, Modal, useToast } from "../../../components/ui";
import { AddRecordModal, EditRecordModal, DeleteRecordWizard, LockUnlockModal } from "../../../components/AdminControls";
import {
  type GeneralSetting, type NotificationChannel, type RateLimit, type FeatureToggle,
  type ChangeRecord, type BrandSetting, type MaintenanceWindow,
  type SecurityPolicy, type ApiKey, type SystemHealth, type AuditLogEntry,
  type DocumentRecord, type ConfigTemplate, type NotificationRule,
  initialGeneral, initialNotifications, initialRates, initialFeatures, initialHistory,
  initialBrand, initialMaintenance, initialSecurityPolicies, initialApiKeys,
  initialSystemHealth, initialAuditLogs, initialDocuments, initialConfigTemplates,
  initialNotificationRules,
} from "../data/configData";
import {
  ConfigChangeDetailModal, NotifyChannelConfigModal,
  RateLimitEditorModal, FeatureToggleEditorModal, MaintenanceWizard,
  SecurityPostureDrawer, ConfigVersionDiffModal, StagingPromotionModal,
  ConfigSimulationModal, RollbackHistoryModal,
  ExportCenterWizard, DeploymentPipelineWizard, EmergencyRollbackWizard,
  BackupWizard, DocumentPreviewModal, ConfigTemplateManagerModal,
  NotificationRuleBuilderModal, ApiKeyCreateWizard, SecurityPolicyDetailModal,
  SystemHealthDetailDrawer, AuditLogFilterModal, BulkOperationsModal,
  ImportConfigModal, ConfigHealthDrawer,
} from "../modals/ConfigModals";

type A = { title: string; body: React.ReactNode; icon?: string; tone?: "green" | "red" | "amber" | "blue" | "violet" | "ink" };

export function SystemConfig({ signal: _signal }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  const { push } = useToast();
  const [tab, setTab] = useState("general");
  const [action, setAction] = useState<A | null>(null);

  // Wizard/drawer states
  const [maintenanceWizard, setMaintenanceWizard] = useState(false);
  const [exportWizard, setExportWizard] = useState(false);
  const [deployWizard, setDeployWizard] = useState(false);
  const [emergencyWizard, setEmergencyWizard] = useState(false);
  const [backupWizard, setBackupWizard] = useState(false);
  const [apiKeyWizard, setApiKeyWizard] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [configDiff, setConfigDiff] = useState(false);
  const [stagingPromo, setStagingPromo] = useState(false);
  const [configSim, setConfigSim] = useState(false);
  const [rollbackHist, setRollbackHist] = useState(false);
  const [templateMgr, setTemplateMgr] = useState(false);
  const [ruleBuilder, setRuleBuilder] = useState(false);
  const [bulkOps, setBulkOps] = useState(false);
  const [importConfig, setImportConfig] = useState(false);
  const [healthDrawer, setHealthDrawer] = useState(false);
  const [auditFilter, setAuditFilter] = useState(false);

  // Data state
  const [general, setGeneral] = useState<GeneralSetting[]>(initialGeneral);
  const [notifications, setNotifications] = useState<NotificationChannel[]>(initialNotifications);
  const [rates, setRates] = useState<RateLimit[]>(initialRates);
  const [features, setFeatures] = useState<FeatureToggle[]>(initialFeatures);
  const [history] = useState<ChangeRecord[]>(initialHistory);
  const [brand, setBrand] = useState<BrandSetting[]>(initialBrand);
  const [maintenance] = useState<MaintenanceWindow[]>(initialMaintenance);
  const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>(initialSecurityPolicies);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialApiKeys);
  const [systemHealth] = useState<SystemHealth[]>(initialSystemHealth);
  useState<AuditLogEntry[]>(initialAuditLogs);
  const [documents, setDocuments] = useState<DocumentRecord[]>(initialDocuments);
  const [configTemplates] = useState<ConfigTemplate[]>(initialConfigTemplates);
  const [notificationRules, setNotificationRules] = useState<NotificationRule[]>(initialNotificationRules);

  // CRUD modal states — General
  const [editGeneral, setEditGeneral] = useState<GeneralSetting | null>(null);
  const [deleteGeneral, setDeleteGeneral] = useState<GeneralSetting | null>(null);
  const [lockGeneral, setLockGeneral] = useState<GeneralSetting | null>(null);
  const [addGeneral, setAddGeneral] = useState(false);

  // CRUD modal states — Notifications
  const [editNotification, setEditNotification] = useState<NotificationChannel | null>(null);
  const [deleteNotification, setDeleteNotification] = useState<NotificationChannel | null>(null);
  const [lockNotification, setLockNotification] = useState<NotificationChannel | null>(null);
  const [addNotification, setAddNotification] = useState(false);
  const [configChannel, setConfigChannel] = useState<string | null>(null);

  // CRUD modal states — Rates
  const [editRate, setEditRate] = useState<RateLimit | null>(null);
  const [deleteRate, setDeleteRate] = useState<RateLimit | null>(null);
  const [lockRate, setLockRate] = useState<RateLimit | null>(null);
  const [addRate, setAddRate] = useState(false);
  const [editRateDetail, setEditRateDetail] = useState<string | null>(null);

  // CRUD modal states — Features
  const [editFeature, setEditFeature] = useState<FeatureToggle | null>(null);
  const [deleteFeature, setDeleteFeature] = useState<FeatureToggle | null>(null);
  const [lockFeature, setLockFeature] = useState<FeatureToggle | null>(null);
  const [addFeature, setAddFeature] = useState(false);
  const [editFeatureDetail, setEditFeatureDetail] = useState<string | null>(null);

  // CRUD modal states — Brand
  const [editBrand, setEditBrand] = useState<BrandSetting | null>(null);
  const [deleteBrand, setDeleteBrand] = useState<BrandSetting | null>(null);
  const [lockBrand, setLockBrand] = useState<BrandSetting | null>(null);
  const [addBrand, setAddBrand] = useState(false);

  // CRUD modal states — Security Policies
  const [editSecurityPolicy, setEditSecurityPolicy] = useState<SecurityPolicy | null>(null);
  const [deleteSecurityPolicy, setDeleteSecurityPolicy] = useState<SecurityPolicy | null>(null);
  const [lockSecurityPolicy, setLockSecurityPolicy] = useState<SecurityPolicy | null>(null);
  const [addSecurityPolicy, setAddSecurityPolicy] = useState(false);
  const [viewSecurityPolicy, setViewSecurityPolicy] = useState<SecurityPolicy | null>(null);

  // CRUD modal states — API Keys
  const [deleteApiKey, setDeleteApiKey] = useState<ApiKey | null>(null);
  const [lockApiKey, setLockApiKey] = useState<ApiKey | null>(null);

  // CRUD modal states — Documents
  const [editDocument, setEditDocument] = useState<DocumentRecord | null>(null);
  const [deleteDocument, setDeleteDocument] = useState<DocumentRecord | null>(null);
  const [lockDocument, setLockDocument] = useState<DocumentRecord | null>(null);
  const [previewDocument, setPreviewDocument] = useState<DocumentRecord | null>(null);

  // CRUD modal states — Notification Rules
  const [editRule, setEditRule] = useState<NotificationRule | null>(null);
  const [deleteRule, setDeleteRule] = useState<NotificationRule | null>(null);
  const [lockRule, setLockRule] = useState<NotificationRule | null>(null);

  // CRUD modal states — Health
  const [viewHealthService, setViewHealthService] = useState<SystemHealth | null>(null);

  // CRUD modal states — History
  const [viewChangeDetail, setViewChangeDetail] = useState<ChangeRecord | null>(null);

  const ask = (title: string, body: React.ReactNode, tone: A["tone"] = "green", icon = "bi-check2-circle") => setAction({ title, body, tone, icon });

  // ====================== CRUD HANDLERS ======================

  // General
  const handleAddGeneral = useCallback((form: Record<string, string>) => {
    setGeneral(p => [{ id: `gs-${Date.now()}`, setting: form.setting || "New Setting", value: form.value || "—", editableBy: form.editableBy || "Super admin", category: form.category || "General", lastModified: new Date().toLocaleDateString(), lastModifiedBy: "Super Admin" }, ...p]);
  }, []);
  const handleEditGeneral = useCallback((form: Record<string, any>) => { if (!editGeneral) return; setGeneral(p => p.map(g => g.id === editGeneral.id ? { ...g, ...form } : g)); }, [editGeneral]);
  const handleDeleteGeneral = useCallback(() => { if (!deleteGeneral) return; setGeneral(p => p.filter(g => g.id !== deleteGeneral.id)); }, [deleteGeneral]);
  const handleLockGeneral = useCallback((locked: boolean) => { if (!lockGeneral) return; setGeneral(p => p.map(g => g.id === lockGeneral.id ? { ...g, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Admin lock" : undefined } : g)); }, [lockGeneral]);

  // Notifications
  const handleAddNotification = useCallback((form: Record<string, string>) => {
    setNotifications(p => [{ id: `nc-${Date.now()}`, channel: form.channel || "New Channel", status: "Enabled", provider: form.provider || "—", config: form.config || "—" }, ...p]);
  }, []);
  const handleEditNotification = useCallback((form: Record<string, any>) => { if (!editNotification) return; setNotifications(p => p.map(n => n.id === editNotification.id ? { ...n, ...form } : n)); }, [editNotification]);
  const handleDeleteNotification = useCallback(() => { if (!deleteNotification) return; setNotifications(p => p.filter(n => n.id !== deleteNotification.id)); }, [deleteNotification]);
  const handleLockNotification = useCallback((locked: boolean) => { if (!lockNotification) return; setNotifications(p => p.map(n => n.id === lockNotification.id ? { ...n, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Admin lock" : undefined } : n)); }, [lockNotification]);

  // Rates
  const handleAddRate = useCallback((form: Record<string, string>) => {
    setRates(p => [{ id: `rl-${Date.now()}`, endpoint: form.endpoint || "New Endpoint", limit: form.limit || "—", window: form.window || "1 min", appliesTo: form.appliesTo || "All", status: "Active" }, ...p]);
  }, []);
  const handleEditRate = useCallback((form: Record<string, any>) => { if (!editRate) return; setRates(p => p.map(r => r.id === editRate.id ? { ...r, ...form } : r)); }, [editRate]);
  const handleDeleteRate = useCallback(() => { if (!deleteRate) return; setRates(p => p.filter(r => r.id !== deleteRate.id)); }, [deleteRate]);
  const handleLockRate = useCallback((locked: boolean) => { if (!lockRate) return; setRates(p => p.map(r => r.id === lockRate.id ? { ...r, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Admin lock" : undefined } : r)); }, [lockRate]);

  // Features
  const handleAddFeature = useCallback((form: Record<string, string>) => {
    setFeatures(p => [{ id: `ft-${Date.now()}`, feature: form.feature || "New Feature", state: "Disabled", rollout: "0%", description: form.description || "—" }, ...p]);
  }, []);
  const handleEditFeature = useCallback((form: Record<string, any>) => { if (!editFeature) return; setFeatures(p => p.map(f => f.id === editFeature.id ? { ...f, ...form } : f)); }, [editFeature]);
  const handleDeleteFeature = useCallback(() => { if (!deleteFeature) return; setFeatures(p => p.filter(f => f.id !== deleteFeature.id)); }, [deleteFeature]);
  const handleLockFeature = useCallback((locked: boolean) => { if (!lockFeature) return; setFeatures(p => p.map(f => f.id === lockFeature.id ? { ...f, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Admin lock" : undefined } : f)); }, [lockFeature]);

  // Brand
  const handleAddBrand = useCallback((form: Record<string, string>) => {
    setBrand(p => [{ id: `br-${Date.now()}`, name: form.name || "New Setting", value: form.value || "—", icon: form.icon || "bi-circle" }, ...p]);
  }, []);
  const handleEditBrand = useCallback((form: Record<string, any>) => { if (!editBrand) return; setBrand(p => p.map(b => b.id === editBrand.id ? { ...b, ...form } : b)); }, [editBrand]);
  const handleDeleteBrand = useCallback(() => { if (!deleteBrand) return; setBrand(p => p.filter(b => b.id !== deleteBrand.id)); }, [deleteBrand]);
  const handleLockBrand = useCallback((locked: boolean) => { if (!lockBrand) return; setBrand(p => p.map(b => b.id === lockBrand.id ? { ...b, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Admin lock" : undefined } : b)); }, [lockBrand]);

  // Security Policies
  const handleAddSecurityPolicy = useCallback((form: Record<string, string>) => {
    setSecurityPolicies(p => [{ id: `sp-${Date.now()}`, policy: form.policy || "New Policy", category: form.category || "General", severity: form.severity || "Medium", status: "Enforced", description: form.description || "—" }, ...p]);
  }, []);
  const handleEditSecurityPolicy = useCallback((form: Record<string, any>) => { if (!editSecurityPolicy) return; setSecurityPolicies(p => p.map(s => s.id === editSecurityPolicy.id ? { ...s, ...form } : s)); }, [editSecurityPolicy]);
  const handleDeleteSecurityPolicy = useCallback(() => { if (!deleteSecurityPolicy) return; setSecurityPolicies(p => p.filter(s => s.id !== deleteSecurityPolicy.id)); }, [deleteSecurityPolicy]);
  const handleLockSecurityPolicy = useCallback((locked: boolean) => { if (!lockSecurityPolicy) return; setSecurityPolicies(p => p.map(s => s.id === lockSecurityPolicy.id ? { ...s, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Admin lock" : undefined } : s)); }, [lockSecurityPolicy]);

  // API Keys
  const handleDeleteApiKey = useCallback(() => { if (!deleteApiKey) return; setApiKeys(p => p.filter(k => k.id !== deleteApiKey.id)); }, [deleteApiKey]);
  const handleLockApiKey = useCallback((locked: boolean) => { if (!lockApiKey) return; setApiKeys(p => p.map(k => k.id === lockApiKey.id ? { ...k, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Admin lock" : undefined } : k)); }, [lockApiKey]);

  // Documents
  const handleEditDocument = useCallback((form: Record<string, any>) => { if (!editDocument) return; setDocuments(p => p.map(d => d.id === editDocument.id ? { ...d, ...form } : d)); }, [editDocument]);
  const handleDeleteDocument = useCallback(() => { if (!deleteDocument) return; setDocuments(p => p.filter(d => d.id !== deleteDocument.id)); }, [deleteDocument]);
  const handleLockDocument = useCallback((locked: boolean) => { if (!lockDocument) return; setDocuments(p => p.map(d => d.id === lockDocument.id ? { ...d, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Admin lock" : undefined } : d)); }, [lockDocument]);

  // Notification Rules
  const handleEditRule = useCallback((form: Record<string, any>) => { if (!editRule) return; setNotificationRules(p => p.map(r => r.id === editRule.id ? { ...r, ...form } : r)); }, [editRule]);
  const handleDeleteRule = useCallback(() => { if (!deleteRule) return; setNotificationRules(p => p.filter(r => r.id !== deleteRule.id)); }, [deleteRule]);
  const handleLockRule = useCallback((locked: boolean) => { if (!lockRule) return; setNotificationRules(p => p.map(r => r.id === lockRule.id ? { ...r, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Admin lock" : undefined } : r)); }, [lockRule]);

  // Field definitions
  const generalFields = [{ key: "setting", label: "Setting name", placeholder: "e.g. Session timeout" }, { key: "value", label: "Value", placeholder: "e.g. 8 hours" }, { key: "editableBy", label: "Editable by", placeholder: "Super admin / Regulatory" }, { key: "category", label: "Category", placeholder: "Select category", options: ["Identity", "Locale", "Security", "Finance", "General"] }];
  const notifFields = [{ key: "channel", label: "Channel name", placeholder: "e.g. WhatsApp" }, { key: "provider", label: "Provider", placeholder: "e.g. Twilio" }, { key: "config", label: "Configuration", placeholder: "API key, sender details" }];
  const rateFields = [{ key: "endpoint", label: "Endpoint name", placeholder: "e.g. File upload" }, { key: "limit", label: "Limit", placeholder: "e.g. 20 per user" }, { key: "window", label: "Window", placeholder: "e.g. 1 hour" }, { key: "appliesTo", label: "Applies to", placeholder: "Select scope", options: ["All", "API users", "Admins"] }];
  const featureFields = [{ key: "feature", label: "Feature name", placeholder: "e.g. Bill splitting" }, { key: "description", label: "Description", placeholder: "Brief description" }, { key: "owner", label: "Owner", placeholder: "Select owner", options: ["Product", "Engineering", "ML Team", "Security", "Card Team", "Payments"] }];
  const brandFields = [{ key: "name", label: "Setting name", placeholder: "e.g. Font family" }, { key: "value", label: "Value", placeholder: "e.g. Inter, sans-serif" }, { key: "icon", label: "Icon class", placeholder: "bi-circle" }];
  const securityPolicyFields = [{ key: "policy", label: "Policy name", placeholder: "e.g. MFA enforcement" }, { key: "category", label: "Category", placeholder: "Select category", options: ["Authentication", "Access Control", "Network", "Data Protection", "Compliance"] }, { key: "severity", label: "Severity", placeholder: "Select severity", options: ["Critical", "High", "Medium", "Low"] }, { key: "description", label: "Description", placeholder: "Describe the policy" }];

  const totalItems = general.length + notifications.length + rates.length + features.length + securityPolicies.length + apiKeys.length + documents.length;
  const lockedCount = [...general, ...features, ...brand, ...securityPolicies, ...apiKeys, ...documents].filter(x => x.locked).length;
  const healthyServices = systemHealth.filter(s => s.status === "Healthy").length;

  return (
    <div className="pm-page-content sysconfig-page">
      {/* ====================== HEADER ====================== */}
      <div className="pm-section-head" style={{ marginTop: 0 }}>
        <div>
          <div className="pm-eyebrow">PLATFORM ADMINISTRATION / PAGE 32</div>
          <h2 className="mb-1">System Configuration</h2>
          <p>Platform-wide settings for branding, features, limits, integrations, maintenance and security.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setConfigDiff(true)}><i className="bi bi-code-slash me-1" />Staged changes</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setConfigSim(true)}><i className="bi bi-play-circle me-1" />Simulate</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setDrawer(true)}><i className="bi bi-shield-lock me-1" />Security posture</button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => setDeployWizard(true)}><i className="bi bi-rocket me-1" />Deploy pipeline</button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => setEmergencyWizard(true)} style={{ borderColor: "var(--pm-danger)", color: "var(--pm-danger)" }}><i className="bi bi-arrow-counterclockwise me-1" />Emergency rollback</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setExportWizard(true)}><i className="bi bi-download me-1" />Export data</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setImportConfig(true)}><i className="bi bi-upload me-1" />Import</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setBackupWizard(true)}><i className="bi bi-cloud-download me-1" />Backup</button>
          <button className="btn btn-primary btn-sm" onClick={() => ask("Save configuration draft", <p>Configuration changes are staged and require Super Admin approval before production rollout.</p>, "amber", "bi-save")}><i className="bi bi-save me-1" />Save changes</button>
        </div>
      </div>

      {/* ====================== HERO ====================== */}
      <div className="pm-hero sysconfig-hero mb-3">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <div className="pm-eyebrow text-white-50">PLATFORM CONTROL PLANE · PRODUCTION</div>
            <div className="pm-hero-value">{totalItems} <span className="fs-6 fw-normal text-white-50">configuration items</span></div>
            <div className="small text-white-50 mt-2">All critical changes versioned · encrypted secrets · maintenance controls armed</div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <div className="pm-hero-chip"><div className="l">Feature flags</div><div className="v">{features.length}</div></div>
            <div className="pm-hero-chip"><div className="l">Enabled channels</div><div className="v text-success">{notifications.filter(n => n.status === "Enabled").length} / {notifications.length}</div></div>
            <div className="pm-hero-chip"><div className="l">Locked items</div><div className="v text-warning">{lockedCount}</div></div>
            <div className="pm-hero-chip"><div className="l">Services healthy</div><div className="v text-success">{healthyServices} / {systemHealth.length}</div></div>
          </div>
        </div>
      </div>

      {/* ====================== STATS STRIP ====================== */}
      <div className="row g-3 mb-3">
        {([
          ["Configuration keys", String(general.length + rates.length), "Across 7 domains", "bi-sliders", "green", () => setTab("general")],
          ["Feature toggles", String(features.length), `${features.filter(f => f.state === "Beta").length} in beta rollout`, "bi-toggles", "blue", () => setTab("features")],
          ["Security policies", String(securityPolicies.length), `${securityPolicies.filter(s => s.severity === "Critical").length} critical enforced`, "bi-shield-check", "red", () => setTab("security")],
          ["API keys", String(apiKeys.length), `${apiKeys.filter(k => k.status === "Active").length} active keys`, "bi-key", "amber", () => setTab("apikeys")],
          ["System health", `${healthyServices}/${systemHealth.length}`, healthyServices === systemHealth.length ? "All healthy" : "Degraded", "bi-heart-pulse", "green", () => setHealthDrawer(true)],
          ["Documents", String(documents.length), `${documents.filter(d => d.status === "Active").length} active policies`, "bi-file-earmark-text", "violet", () => setTab("docs")],
        ] as const).map(x => <div className="col-6 col-xl-2" key={x[0]}><div className="pm-stat" style={{ cursor: "pointer" }} onClick={x[5]}><div className={`pm-stat-ico bg-${x[4]}-soft text-${x[4]}`}><i className={`bi ${x[3]}`} /></div><div className="pm-stat-label">{x[0]}</div><div className="pm-stat-value">{x[1]}</div><div className="pm-stat-foot">{x[2]}</div></div></div>)}
      </div>

      {/* ====================== TABS ====================== */}
      <div className="pm-card mb-3">
        <div className="pm-tabs">
          {[
            ["general", "General", "bi-gear"], ["branding", "Branding", "bi-palette"],
            ["maintenance", "Maintenance", "bi-tools"], ["notifications", "Notifications", "bi-bell"],
            ["rates", "Rate limits", "bi-speedometer2"], ["features", "Feature toggles", "bi-flag"],
            ["security", "Security", "bi-shield-lock"], ["apikeys", "API keys", "bi-key"],
            ["health", "System health", "bi-heart-pulse"], ["docs", "Documentation", "bi-file-earmark-text"],
            ["templates", "Templates", "bi-collection"], ["rules", "Notification rules", "bi-bell"],
            ["history", "Change history", "bi-clock-history"],
          ].map(x => <button className={`pm-tab ${tab === x[0] ? "active" : ""}`} key={x[0]} onClick={() => setTab(x[0])}><i className={`bi ${x[2]}`} />{x[1]}</button>)}
        </div>
      </div>

      {/* ====================== GENERAL TAB ====================== */}
      {tab === "general" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>General settings</h3><p>Core platform identity, locale and regulatory values.</p></div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setBulkOps(true)}><i className="bi bi-layers me-1" />Bulk ops</button>
            <button className="btn btn-primary btn-sm" onClick={() => setAddGeneral(true)}><i className="bi bi-plus me-1" />Add setting</button>
          </div>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Setting</th><th>Value</th><th>Category</th><th>Editable by</th><th>Last modified</th><th className="text-end">Actions</th></tr></thead><tbody>
            {general.map(r => <tr key={r.id} style={{ opacity: r.locked ? 0.7 : 1 }}>
              <td className="pm-td-strong">{r.setting}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td>
              <td className="mono">{r.value}</td>
              <td><Badge tone="grey">{r.category || "General"}</Badge></td>
              <td><Badge tone="grey">{r.editableBy}</Badge></td>
              <td className="pm-td-sub">{r.lastModified || "—"}</td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditGeneral(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setLockGeneral(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteGeneral(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* ====================== BRANDING TAB ====================== */}
      {tab === "branding" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Branding configuration</h3><p>Visual identity used across PayMo admin, email and customer-facing surfaces.</p></div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setAction({ title: "Brand Preview", body: <p>Click the Brand Preview button to see the full brand system.</p>, tone: "green", icon: "bi-palette" })}><i className="bi bi-eye me-1" />Preview brand</button>
            <button className="btn btn-primary btn-sm" onClick={() => setAddBrand(true)}><i className="bi bi-plus me-1" />Add brand setting</button>
          </div>
        </div>
        <div className="row g-3">
          {brand.map(r => <div className="col-md-6 col-xl-4" key={r.id}>
            <div className="pm-card pm-card-pad">
              <div className="d-flex align-items-center gap-2">
                <i className={`bi ${r.icon} fs-4 text-success`} />
                <div className="flex-grow-1"><div className="pm-stat-label">{r.name}</div><b className="mono" style={{ fontSize: ".86rem" }}>{r.value}</b></div>
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

      {/* ====================== MAINTENANCE TAB ====================== */}
      {tab === "maintenance" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Maintenance configuration</h3><p>Schedule planned maintenance or arm emergency controls.</p></div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setAction({ title: "View Schedule", body: <div>{maintenance.map(m => <div className="pm-card pm-card-pad mb-2" key={m.id}><div className="pm-eyebrow mb-1">Current Schedule</div>{[["Day", m.day], ["Time", m.time], ["Mode", m.emergency], ["Kill sessions", m.killSessions], ["Admin access", m.adminAccess]].map(([k, v]) => <div className="d-flex justify-content-between py-1 border-bottom small" key={k}><span className="text-muted">{k}</span><b>{v}</b></div>)}</div>)}</div>, tone: "amber", icon: "bi-calendar3" })}><i className="bi bi-calendar3 me-1" />View schedule</button>
            <button className="btn btn-primary btn-sm" onClick={() => setMaintenanceWizard(true)}><i className="bi bi-tools me-1" />Schedule maintenance</button>
          </div>
        </div>
        <div className="pm-card pm-card-pad mb-3">
          <div className="row g-3">
            {maintenance[0] && [["Scheduled maintenance", `${maintenance[0].day} ${maintenance[0].time}`], ["User message", maintenance[0].message], ["Notification", maintenance[0].notification], ["Kill sessions", maintenance[0].killSessions], ["Admin access", maintenance[0].adminAccess], ["Emergency mode", maintenance[0].emergency]].map(([k, v]) => <div className="col-md-6" key={k}><div className="config-row"><span className="pm-td-sub">{k}</span><b style={{ fontSize: ".86rem" }}>{v}</b></div></div>)}
          </div>
        </div>
        <div className="pm-card pm-card-pad">
          <h6>Quick actions</h6>
          <div className="d-flex gap-2 flex-wrap mt-2">
            <button className="pm-qa" onClick={() => setMaintenanceWizard(true)}><i className="bi bi-tools" /><span className="t">Schedule window</span></button>
            <button className="pm-qa" onClick={() => setEmergencyWizard(true)}><i className="bi bi-arrow-counterclockwise" /><span className="t">Emergency rollback</span></button>
            <button className="pm-qa" onClick={() => setHealthDrawer(true)}><i className="bi bi-heart-pulse" /><span className="t">System health</span></button>
            <button className="pm-qa" onClick={() => setBackupWizard(true)}><i className="bi bi-cloud-download" /><span className="t">System backup</span></button>
          </div>
        </div>
      </section>}

      {/* ====================== NOTIFICATIONS TAB ====================== */}
      {tab === "notifications" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Notification settings</h3><p>Delivery providers and channel configuration.</p></div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setRuleBuilder(true)}><i className="bi bi-bell me-1" />Rule builder</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => ask("Test all channels", <p>Test notifications were queued to all active channels. Delivery will be monitored for the next 5 minutes.</p>, "blue", "bi-send")}><i className="bi bi-send me-1" />Test all</button>
            <button className="btn btn-primary btn-sm" onClick={() => setAddNotification(true)}><i className="bi bi-plus me-1" />Add channel</button>
          </div>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Channel</th><th>Status</th><th>Provider</th><th>Config</th><th>Delivery rate</th><th>Last fired</th><th className="text-end">Actions</th></tr></thead><tbody>
            {notifications.map(r => <tr key={r.id} style={{ opacity: r.locked ? 0.7 : 1 }}>
              <td className="pm-td-strong">{r.channel}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td>
              <td><Badge tone={r.status === "Enabled" ? "green" : "grey"} dot>{r.status}</Badge></td>
              <td>{r.provider}</td>
              <td>{r.config}</td>
              <td>{r.deliveryRate || "—"}</td>
              <td className="pm-td-sub">{r.lastFired || "—"}</td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-info me-1" onClick={() => setConfigChannel(r.channel)} title="Configure"><i className="bi bi-gear" /></button>
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditNotification(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setLockNotification(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteNotification(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* ====================== RATE LIMITS TAB ====================== */}
      {tab === "rates" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Rate limiting configuration</h3><p>Traffic protection rules applied by endpoint, actor and time window.</p></div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setConfigSim(true)}><i className="bi bi-play-circle me-1" />Simulate</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setBulkOps(true)}><i className="bi bi-layers me-1" />Bulk update</button>
            <button className="btn btn-primary btn-sm" onClick={() => setAddRate(true)}><i className="bi bi-plus me-1" />Add rate limit</button>
          </div>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Endpoint</th><th>Limit</th><th>Window</th><th>Applies to</th><th>Status</th><th>Blocked (24h)</th><th className="text-end">Actions</th></tr></thead><tbody>
            {rates.map(r => <tr key={r.id} style={{ opacity: r.locked ? 0.7 : 1 }}>
              <td className="pm-td-strong">{r.endpoint}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td>
              <td className="mono">{r.limit}</td>
              <td>{r.window}</td>
              <td>{r.appliesTo}</td>
              <td><Badge tone="green" dot>{r.status || "Active"}</Badge></td>
              <td className="mono">{r.blocked24h || "—"}</td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-info me-1" onClick={() => setEditRateDetail(r.endpoint)} title="Edit limit"><i className="bi bi-speedometer2" /></button>
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditRate(r)} title="Edit record"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setLockRate(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteRate(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* ====================== FEATURES TAB ====================== */}
      {tab === "features" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Feature toggles</h3><p>Quick-access rollout controls with percentage targeting and kill switches.</p></div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setStagingPromo(true)}><i className="bi bi-cloud-upload me-1" />Promote to prod</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setBulkOps(true)}><i className="bi bi-layers me-1" />Bulk toggle</button>
            <button className="btn btn-primary btn-sm" onClick={() => setAddFeature(true)}><i className="bi bi-plus me-1" />Add feature</button>
          </div>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Feature</th><th>State</th><th>Rollout</th><th>Owner</th><th>Description</th><th className="text-end">Actions</th></tr></thead><tbody>
            {features.map(r => <tr key={r.id} style={{ opacity: r.locked ? 0.7 : 1 }}>
              <td className="pm-td-strong">{r.feature}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td>
              <td><Badge tone={r.state === "Enabled" ? "green" : r.state === "Beta" ? "amber" : "grey"}>{r.state}</Badge></td>
              <td className="mono">{r.rollout}</td>
              <td><Badge tone="blue">{r.owner || "—"}</Badge></td>
              <td>{r.description}</td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-info me-1" onClick={() => setEditFeatureDetail(r.feature)} title="Configure"><i className="bi bi-toggles" /></button>
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditFeature(r)} title="Edit record"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setLockFeature(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteFeature(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* ====================== SECURITY TAB ====================== */}
      {tab === "security" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Security policies</h3><p>Platform security controls, compliance and enforcement rules.</p></div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setDrawer(true)}><i className="bi bi-shield-lock me-1" />Security posture</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setRollbackHist(true)}><i className="bi bi-arrow-counterclockwise me-1" />Rollback history</button>
            <button className="btn btn-primary btn-sm" onClick={() => setAddSecurityPolicy(true)}><i className="bi bi-plus me-1" />Add policy</button>
          </div>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Policy</th><th>Category</th><th>Severity</th><th>Status</th><th>Description</th><th>Last enforced</th><th className="text-end">Actions</th></tr></thead><tbody>
            {securityPolicies.map(r => <tr key={r.id} style={{ opacity: r.locked ? 0.7 : 1 }}>
              <td className="pm-td-strong" style={{ cursor: "pointer" }} onClick={() => setViewSecurityPolicy(r)}>{r.policy}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td>
              <td><Badge tone="grey">{r.category}</Badge></td>
              <td><span className={`severity-badge ${r.severity.toLowerCase()}`}>{r.severity}</span></td>
              <td><Badge tone={r.status === "Enforced" ? "green" : "amber"} dot>{r.status}</Badge></td>
              <td style={{ maxWidth: 200 }} className="text-truncate">{r.description}</td>
              <td className="pm-td-sub">{r.lastEnforced || "—"}</td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditSecurityPolicy(r)} title="Edit"><i className="bi bi-pencil-square" /></button>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setLockSecurityPolicy(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteSecurityPolicy(r)} title="Delete"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* ====================== API KEYS TAB ====================== */}
      {tab === "apikeys" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>API key management</h3><p>Create, rotate and manage API keys for partners and integrations.</p></div>
          <button className="btn btn-primary btn-sm" onClick={() => setApiKeyWizard(true)}><i className="bi bi-plus me-1" />Create API key</button>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Name</th><th>Key</th><th>Type</th><th>Status</th><th>Permissions</th><th>Rate limit</th><th>Last used</th><th className="text-end">Actions</th></tr></thead><tbody>
            {apiKeys.map(r => <tr key={r.id} style={{ opacity: r.locked ? 0.7 : 1 }}>
              <td className="pm-td-strong">{r.name}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</td>
              <td className="api-key-display">{r.key}</td>
              <td><Badge tone={r.type === "Live" ? "green" : "blue"}>{r.type}</Badge></td>
              <td><Badge tone={r.status === "Active" ? "green" : r.status === "Revoked" ? "red" : "amber"} dot>{r.status}</Badge></td>
              <td><Badge tone="grey">{r.permissions}</Badge></td>
              <td className="mono">{r.rateLimit}</td>
              <td className="pm-td-sub">{r.lastUsed || "—"}</td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setLockApiKey(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteApiKey(r)} title="Revoke"><i className="bi bi-trash3" /></button>
              </td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* ====================== SYSTEM HEALTH TAB ====================== */}
      {tab === "health" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>System health</h3><p>Real-time status and uptime monitoring for all platform services.</p></div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setHealthDrawer(true)}><i className="bi bi-activity me-1" />Health dashboard</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => ask("Run health check", <p>Health check initiated for all services. Results will appear in 30 seconds.</p>, "blue", "bi-arrow-clockwise")}><i className="bi bi-arrow-clockwise me-1" />Refresh all</button>
          </div>
        </div>
        <div className="row g-3">
          {systemHealth.map(s => <div className="col-md-6 col-xl-4" key={s.id}>
            <div className="pm-card pm-card-pad" style={{ cursor: "pointer" }} onClick={() => setViewHealthService(s)}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="pm-td-strong">{s.service}</div>
                <Badge tone={s.status === "Healthy" ? "green" : s.status === "Degraded" ? "amber" : "red"} dot>{s.status}</Badge>
              </div>
              <div className="row g-2">
                {["Uptime", "Latency", "Incidents"].map(k => {
                  const v = k === "Uptime" ? s.uptime : k === "Latency" ? s.latency : s.incidents30d;
                  return <div className="col-4" key={k}><div style={{ fontSize: ".68rem", color: "var(--pm-muted)" }}>{k}</div><div className="mono" style={{ fontSize: ".82rem", fontWeight: 600 }}>{v}</div></div>;
                })}
              </div>
              <div className="small text-muted mt-2"><i className="bi bi-clock me-1" />{s.lastCheck}</div>
            </div>
          </div>)}
        </div>
      </section>}

      {/* ====================== DOCUMENTATION TAB ====================== */}
      {tab === "docs" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>System documentation</h3><p>Runbooks, policies, SOPs and technical documentation with full preview.</p></div>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setExportWizard(true)}><i className="bi bi-download me-1" />Export docs</button>
        </div>
        <div className="row g-3">
          {documents.map(d => <div className="col-md-6 col-xl-4" key={d.id}>
            <div className="pm-card pm-card-pad" style={{ cursor: "pointer" }}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="d-flex align-items-center gap-2">
                  <div className="template-icon bg-violet-soft text-violet"><i className="bi bi-file-earmark-text" /></div>
                  <div>
                    <div className="template-name">{d.title}</div>
                    <div className="template-desc">{d.type} · {d.version}</div>
                  </div>
                </div>
                {d.locked && <i className="bi bi-lock-fill text-warning" style={{ fontSize: ".7rem" }} />}
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Badge tone={d.status === "Active" ? "green" : "blue"}>{d.status}</Badge>
                <span className="pm-td-sub">{d.lastUpdated}</span>
              </div>
              <div className="d-flex gap-1">
                <button className="btn btn-sm btn-outline-primary flex-grow-1" onClick={(e) => { e.stopPropagation(); setPreviewDocument(d); }}><i className="bi bi-eye me-1" />Preview</button>
                <button className="btn btn-sm btn-outline-secondary" onClick={(e) => { e.stopPropagation(); setEditDocument(d); }} title="Edit"><i className="bi bi-pencil" /></button>
                <button className="btn btn-sm btn-outline-secondary" onClick={(e) => { e.stopPropagation(); setLockDocument(d); }} title={d.locked ? "Unlock" : "Lock"}><i className={`bi ${d.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={(e) => { e.stopPropagation(); setDeleteDocument(d); }} title="Delete"><i className="bi bi-trash3" /></button>
              </div>
            </div>
          </div>)}
        </div>
      </section>}

      {/* ====================== TEMPLATES TAB ====================== */}
      {tab === "templates" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Configuration templates</h3><p>Reusable configuration presets for environments and compliance.</p></div>
          <button className="btn btn-primary btn-sm" onClick={() => setTemplateMgr(true)}><i className="bi bi-collection me-1" />Manage templates</button>
        </div>
        <div className="row g-3">
          {configTemplates.map(t => <div className="col-md-6 col-xl-4" key={t.id}>
            <div className="template-card" onClick={() => setTemplateMgr(true)}>
              <div className="d-flex align-items-start gap-2">
                <div className="template-icon bg-blue-soft text-blue"><i className="bi bi-collection" /></div>
                <div className="flex-grow-1">
                  <div className="template-name">{t.name}</div>
                  <div className="template-desc">{t.description}</div>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center mt-3">
                <Badge tone="grey">{t.category}</Badge>
                <span className="pm-td-sub">{t.settingsCount} settings · {t.usageCount}</span>
              </div>
            </div>
          </div>)}
        </div>
      </section>}

      {/* ====================== NOTIFICATION RULES TAB ====================== */}
      {tab === "rules" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Notification rules</h3><p>Automated notification triggers for user events and system alerts.</p></div>
          <button className="btn btn-primary btn-sm" onClick={() => setRuleBuilder(true)}><i className="bi bi-plus me-1" />Create rule</button>
        </div>
        <div className="d-flex flex-column gap-2">
          {notificationRules.map(r => <div className="rule-row" key={r.id} style={{ opacity: r.locked ? 0.7 : 1 }}>
            <div className="rule-icon bg-violet-soft text-violet"><i className="bi bi-bell" /></div>
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
              <div className="pm-td-strong" style={{ fontSize: ".86rem" }}>{r.rule}{r.locked && <i className="bi bi-lock-fill ms-1 text-warning" style={{ fontSize: ".7rem" }} />}</div>
              <div className="pm-td-sub">{r.trigger}</div>
            </div>
            <Badge tone="grey">{r.channel}</Badge>
            <Badge tone={r.severity === "Critical" ? "red" : r.severity === "Warning" ? "amber" : "blue"}>{r.severity}</Badge>
            <Badge tone={r.status === "Active" ? "green" : "grey"} dot>{r.status}</Badge>
            <div className="d-flex gap-1">
              <button className="btn btn-sm btn-outline-primary" onClick={() => setEditRule(r)} title="Edit"><i className="bi bi-pencil" /></button>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setLockRule(r)} title={r.locked ? "Unlock" : "Lock"}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
              <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteRule(r)} title="Delete"><i className="bi bi-trash3" /></button>
            </div>
          </div>)}
        </div>
      </section>}

      {/* ====================== HISTORY TAB ====================== */}
      {tab === "history" && <section>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div><h3>Configuration change history</h3><p>Versioned changes, before and after values, reasons and actors.</p></div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setAuditFilter(true)}><i className="bi bi-funnel me-1" />Filter</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setExportWizard(true)}><i className="bi bi-download me-1" />Export</button>
          </div>
        </div>
        <div className="pm-card">
          <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Date</th><th>Admin</th><th>Setting</th><th>Old value</th><th>New value</th><th>Reason</th><th>Status</th><th className="text-end">Actions</th></tr></thead><tbody>
            {history.map(r => <tr key={r.id}>
              <td>{r.date}</td>
              <td className="pm-td-strong">{r.admin}</td>
              <td className="mono">{r.setting}</td>
              <td>{r.oldValue}</td>
              <td>{r.newValue}</td>
              <td>{r.reason}</td>
              <td><Badge tone="green">{r.status || "Deployed"}</Badge></td>
              <td className="text-end"><button className="btn btn-sm btn-outline-primary" onClick={() => setViewChangeDetail(r)} title="View detail"><i className="bi bi-eye" /></button></td>
            </tr>)}
          </tbody></table></div>
        </div>
      </section>}

      {/* ====================== GENERIC ACTION MODAL ====================== */}
      <Modal open={!!action} onClose={() => setAction(null)} title={action?.title ?? "Configuration action"} subtitle="Super Admin action · versioned and audited" icon={action?.icon} tone={action?.tone}>
        <div className="pm-modal-body">{action?.body}</div>
        <div className="pm-modal-foot">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setAction(null)}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={() => { setAction(null); push({ kind: "success", title: "Configuration action completed", body: "The change was staged in the approval queue." }); }}>Confirm action</button>
        </div>
      </Modal>

      {/* ====================== ALL WIZARDS & SPECIAL MODALS ====================== */}
      <MaintenanceWizard open={maintenanceWizard} onClose={() => setMaintenanceWizard(false)} />
      <ExportCenterWizard open={exportWizard} onClose={() => setExportWizard(false)} />
      <DeploymentPipelineWizard open={deployWizard} onClose={() => setDeployWizard(false)} />
      <EmergencyRollbackWizard open={emergencyWizard} onClose={() => setEmergencyWizard(false)} />
      <BackupWizard open={backupWizard} onClose={() => setBackupWizard(false)} />
      <ApiKeyCreateWizard open={apiKeyWizard} onClose={() => setApiKeyWizard(false)} />
      <SecurityPostureDrawer open={drawer} onClose={() => setDrawer(false)} />
      <ConfigVersionDiffModal open={configDiff} onClose={() => setConfigDiff(false)} />
      <StagingPromotionModal open={stagingPromo} onClose={() => setStagingPromo(false)} />
      <ConfigSimulationModal open={configSim} onClose={() => setConfigSim(false)} />
      <RollbackHistoryModal open={rollbackHist} onClose={() => setRollbackHist(false)} />
      <ConfigTemplateManagerModal open={templateMgr} onClose={() => setTemplateMgr(false)} />
      <NotificationRuleBuilderModal open={ruleBuilder} onClose={() => setRuleBuilder(false)} />
      <BulkOperationsModal open={bulkOps} onClose={() => setBulkOps(false)} />
      <ImportConfigModal open={importConfig} onClose={() => setImportConfig(false)} />
      <ConfigHealthDrawer open={healthDrawer} onClose={() => setHealthDrawer(false)} />
      <AuditLogFilterModal open={auditFilter} onClose={() => setAuditFilter(false)} />
      <NotifyChannelConfigModal open={!!configChannel} channel={configChannel || ""} onClose={() => setConfigChannel(null)} />
      <RateLimitEditorModal open={!!editRateDetail} endpoint={editRateDetail || ""} onClose={() => setEditRateDetail(null)} />
      <FeatureToggleEditorModal open={!!editFeatureDetail} feature={editFeatureDetail || ""} onClose={() => setEditFeatureDetail(null)} />
      <SecurityPolicyDetailModal open={!!viewSecurityPolicy} policy={viewSecurityPolicy} onClose={() => setViewSecurityPolicy(null)} />
      <SystemHealthDetailDrawer open={!!viewHealthService} service={viewHealthService} onClose={() => setViewHealthService(null)} />
      <DocumentPreviewModal open={!!previewDocument} doc={previewDocument} onClose={() => setPreviewDocument(null)} />
      <ConfigChangeDetailModal open={!!viewChangeDetail} record={viewChangeDetail ? { date: viewChangeDetail.date, admin: viewChangeDetail.admin, setting: viewChangeDetail.setting, oldValue: viewChangeDetail.oldValue, newValue: viewChangeDetail.newValue, reason: viewChangeDetail.reason, status: viewChangeDetail.status } : undefined} onClose={() => setViewChangeDetail(null)} />

      {/* ====================== CRUD MODALS — General ====================== */}
      <AddRecordModal open={addGeneral} onClose={() => setAddGeneral(false)} onAdd={handleAddGeneral} title="Add Setting" fields={generalFields} typeName="Setting" />
      <EditRecordModal open={!!editGeneral} onClose={() => setEditGeneral(null)} onSave={handleEditGeneral} record={editGeneral} typeName="Setting" />
      <DeleteRecordWizard open={!!deleteGeneral} onClose={() => setDeleteGeneral(null)} onDelete={handleDeleteGeneral} record={deleteGeneral} typeName="Setting" relatedItems={["Audit trail entries", "Dependent configurations"]} />
      <LockUnlockModal open={!!lockGeneral} onClose={() => setLockGeneral(null)} onToggle={handleLockGeneral} record={lockGeneral ? { name: lockGeneral.setting, locked: !!lockGeneral.locked, lockedBy: lockGeneral.lockedBy, lockedAt: lockGeneral.lockedAt, lockReason: lockGeneral.lockReason } : null} typeName="Setting" />

      {/* ====================== CRUD MODALS — Notifications ====================== */}
      <AddRecordModal open={addNotification} onClose={() => setAddNotification(false)} onAdd={handleAddNotification} title="Add Notification Channel" fields={notifFields} typeName="Notification Channel" />
      <EditRecordModal open={!!editNotification} onClose={() => setEditNotification(null)} onSave={handleEditNotification} record={editNotification} typeName="Notification Channel" />
      <DeleteRecordWizard open={!!deleteNotification} onClose={() => setDeleteNotification(null)} onDelete={handleDeleteNotification} record={deleteNotification} typeName="Notification Channel" relatedItems={["Notification rules", "Delivery logs"]} />
      <LockUnlockModal open={!!lockNotification} onClose={() => setLockNotification(null)} onToggle={handleLockNotification} record={lockNotification ? { name: lockNotification.channel, locked: !!lockNotification.locked, lockedBy: lockNotification.lockedBy, lockedAt: lockNotification.lockedAt, lockReason: lockNotification.lockReason } : null} typeName="Notification Channel" />

      {/* ====================== CRUD MODALS — Rates ====================== */}
      <AddRecordModal open={addRate} onClose={() => setAddRate(false)} onAdd={handleAddRate} title="Add Rate Limit" fields={rateFields} typeName="Rate Limit" />
      <EditRecordModal open={!!editRate} onClose={() => setEditRate(null)} onSave={handleEditRate} record={editRate} typeName="Rate Limit" />
      <DeleteRecordWizard open={!!deleteRate} onClose={() => setDeleteRate(null)} onDelete={handleDeleteRate} record={deleteRate} typeName="Rate Limit" relatedItems={["Traffic logs", "API consumers"]} />
      <LockUnlockModal open={!!lockRate} onClose={() => setLockRate(null)} onToggle={handleLockRate} record={lockRate ? { name: lockRate.endpoint, locked: !!lockRate.locked, lockedBy: lockRate.lockedBy, lockedAt: lockRate.lockedAt, lockReason: lockRate.lockReason } : null} typeName="Rate Limit" />

      {/* ====================== CRUD MODALS — Features ====================== */}
      <AddRecordModal open={addFeature} onClose={() => setAddFeature(false)} onAdd={handleAddFeature} title="Add Feature Toggle" fields={featureFields} typeName="Feature Toggle" />
      <EditRecordModal open={!!editFeature} onClose={() => setEditFeature(null)} onSave={handleEditFeature} record={editFeature} typeName="Feature Toggle" />
      <DeleteRecordWizard open={!!deleteFeature} onClose={() => setDeleteFeature(null)} onDelete={handleDeleteFeature} record={editFeature} typeName="Feature Toggle" relatedItems={["User segments", "A/B test configurations", "Rollout history"]} />
      <LockUnlockModal open={!!lockFeature} onClose={() => setLockFeature(null)} onToggle={handleLockFeature} record={lockFeature ? { name: lockFeature.feature, locked: !!lockFeature.locked, lockedBy: lockFeature.lockedBy, lockedAt: lockFeature.lockedAt, lockReason: lockFeature.lockReason } : null} typeName="Feature Toggle" />

      {/* ====================== CRUD MODALS — Brand ====================== */}
      <AddRecordModal open={addBrand} onClose={() => setAddBrand(false)} onAdd={handleAddBrand} title="Add Brand Setting" fields={brandFields} typeName="Brand Setting" />
      <EditRecordModal open={!!editBrand} onClose={() => setEditBrand(null)} onSave={handleEditBrand} record={editBrand} typeName="Brand Setting" />
      <DeleteRecordWizard open={!!deleteBrand} onClose={() => setDeleteBrand(null)} onDelete={handleDeleteBrand} record={deleteBrand} typeName="Brand Setting" relatedItems={[]} />
      <LockUnlockModal open={!!lockBrand} onClose={() => setLockBrand(null)} onToggle={handleLockBrand} record={lockBrand ? { name: lockBrand.name, locked: !!lockBrand.locked, lockedBy: lockBrand.lockedBy, lockedAt: lockBrand.lockedAt, lockReason: lockBrand.lockReason } : null} typeName="Brand Setting" />

      {/* ====================== CRUD MODALS — Security Policies ====================== */}
      <AddRecordModal open={addSecurityPolicy} onClose={() => setAddSecurityPolicy(false)} onAdd={handleAddSecurityPolicy} title="Add Security Policy" fields={securityPolicyFields} typeName="Security Policy" />
      <EditRecordModal open={!!editSecurityPolicy} onClose={() => setEditSecurityPolicy(null)} onSave={handleEditSecurityPolicy} record={editSecurityPolicy} typeName="Security Policy" />
      <DeleteRecordWizard open={!!deleteSecurityPolicy} onClose={() => setDeleteSecurityPolicy(null)} onDelete={handleDeleteSecurityPolicy} record={deleteSecurityPolicy} typeName="Security Policy" relatedItems={["Compliance mappings", "Audit trail entries", "User access rules"]} />
      <LockUnlockModal open={!!lockSecurityPolicy} onClose={() => setLockSecurityPolicy(null)} onToggle={handleLockSecurityPolicy} record={lockSecurityPolicy ? { name: lockSecurityPolicy.policy, locked: !!lockSecurityPolicy.locked, lockedBy: lockSecurityPolicy.lockedBy, lockedAt: lockSecurityPolicy.lockedAt, lockReason: lockSecurityPolicy.lockReason } : null} typeName="Security Policy" />

      {/* ====================== CRUD MODALS — API Keys ====================== */}
      <DeleteRecordWizard open={!!deleteApiKey} onClose={() => setDeleteApiKey(null)} onDelete={handleDeleteApiKey} record={deleteApiKey} typeName="API Key" relatedItems={["Partner integrations", "API usage logs", "Webhook configurations"]} />
      <LockUnlockModal open={!!lockApiKey} onClose={() => setLockApiKey(null)} onToggle={handleLockApiKey} record={lockApiKey ? { name: lockApiKey.name, locked: !!lockApiKey.locked, lockedBy: lockApiKey.lockedBy, lockedAt: lockApiKey.lockedAt, lockReason: lockApiKey.lockReason } : null} typeName="API Key" />

      {/* ====================== CRUD MODALS — Documents ====================== */}
      <EditRecordModal open={!!editDocument} onClose={() => setEditDocument(null)} onSave={handleEditDocument} record={editDocument} typeName="Document" />
      <DeleteRecordWizard open={!!deleteDocument} onClose={() => setDeleteDocument(null)} onDelete={handleDeleteDocument} record={deleteDocument} typeName="Document" relatedItems={["Version history", "Audit trail entries", "Linked policies"]} />
      <LockUnlockModal open={!!lockDocument} onClose={() => setLockDocument(null)} onToggle={handleLockDocument} record={lockDocument ? { name: lockDocument.title, locked: !!lockDocument.locked, lockedBy: lockDocument.lockedBy, lockedAt: lockDocument.lockedAt, lockReason: lockDocument.lockReason } : null} typeName="Document" />

      {/* ====================== CRUD MODALS — Notification Rules ====================== */}
      <EditRecordModal open={!!editRule} onClose={() => setEditRule(null)} onSave={handleEditRule} record={editRule} typeName="Notification Rule" />
      <DeleteRecordWizard open={!!deleteRule} onClose={() => setDeleteRule(null)} onDelete={handleDeleteRule} record={deleteRule} typeName="Notification Rule" relatedItems={["User notification preferences", "Delivery logs"]} />
      <LockUnlockModal open={!!lockRule} onClose={() => setLockRule(null)} onToggle={handleLockRule} record={lockRule ? { name: lockRule.rule, locked: !!lockRule.locked, lockedBy: lockRule.lockedBy, lockedAt: lockRule.lockedAt, lockReason: lockRule.lockReason } : null} typeName="Notification Rule" />
    </div>
  );
}
