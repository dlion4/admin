import { useEffect, useMemo, useState } from "react";
import { Badge, DDItem, Dropdown, EmptyState, Pagination, useToast } from "../../../components/ui";
import { csvDownload } from "../../../lib/format";
import type { ChangeRequest, ConfigVersion, Override, Product, ProductAudit, Rule, Setting } from "../data/productConfigData";
import {
  ENVIRONMENTS, OVERRIDES, PRODUCT_AUDIT, PRODUCTS, REQUESTS, RULES, SETTINGS, VERSIONS, CONFIG_KPI,
} from "../data/productConfigData";
import {
  AddSettingWizard, ApproveModal, BulkFreezeModal, ConfigAuditDrawer, ConfigExportModal, ConfigPermissionsModal,
  DeleteConfirmModal, DriftModal, EnvironmentsDrawer, FreezeSettingModal, NewProductWizard, NewRequestModal,
  OverrideActionModal, OverrideEditModal, OverrideWizard, OverridesDrawer, ProductConfigDrawer, ProductEditModal,
  ProductFreezeModal, ProductsDrawer, PromoteWizard, RejectModal, RequestDetailModal, RequestsDrawer, ResetDefaultModal,
  RuleEditModal, RuleTestModal, RuleToggleModal, RuleWizard, RulesDrawer, RollbackModal, SettingEditModal,
  VersionDiffModal, VersionsDrawer, statusTone,
} from "../modals/ProductConfigModals";

const TABS = [
  { id: "products", label: "Products", icon: "bi-collection" },
  { id: "settings", label: "Settings library", icon: "bi-sliders" },
  { id: "overrides", label: "Overrides", icon: "bi-person-badge" },
  { id: "rules", label: "Rules engine", icon: "bi-lightning-charge" },
  { id: "environments", label: "Environments", icon: "bi-layers" },
  { id: "versions", label: "Versions", icon: "bi-clock-history" },
  { id: "approvals", label: "Approvals", icon: "bi-hourglass-split" },
] as const;

const DEFAULTS: Record<string, string> = {
  "PCF-MP-01": "KES 70,000", "PCF-MP-02": "KES 150,000", "PCF-MP-03": "KES 50,000",
  "PCF-CD-03": "KES 350,000", "PCF-CD-09": "KES 3,000", "PCF-LN-02": "KES 300,000",
  "PCF-SV-01": "8.0%", "PCF-BK-04": "KES 2,000,000", "PCF-FX-04": "3.0%",
};

const groupName = (id: string) => PRODUCTS.find((p) => p.id === id)?.short ?? "Platform";
const groupColor = (id: string) => PRODUCTS.find((p) => p.id === id)?.color ?? "#667085";

export function ProductConfig({
  signal, onNavigate,
}: {
  signal: { action: string; n: number };
  onNavigate: (id: string) => void;
}) {
  const { push } = useToast();

  /* ---------------- live state ---------------- */
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [settings, setSettings] = useState<Setting[]>(SETTINGS);
  const [overrides, setOverrides] = useState<Override[]>(OVERRIDES);
  const [rules, setRules] = useState<Rule[]>(RULES);
  const [requests, setRequests] = useState<ChangeRequest[]>(REQUESTS);
  const [versions, setVersions] = useState<ConfigVersion[]>(VERSIONS);
  const [audit, setAudit] = useState<ProductAudit[]>(PRODUCT_AUDIT);

  const logAudit = (area: string, change: string, from: string, to: string, reason: string) =>
    setAudit((a) => [{ id: `PCA-${2211 + a.length - PRODUCT_AUDIT.length}`, date: "Aug 23 · now", admin: "Joseph Mwangi", area, change, from, to, reason }, ...a]);

  /* ---------------- tab + table state ---------------- */
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("products");
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("All");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selected, setSelected] = useState<string[]>([]);
  useEffect(() => { setPage(1); }, [q, group, tab]);

  /* ---------------- modal state ---------------- */
  const [drawerProduct, setDrawerProduct] = useState<Product | null>(null);
  const [editSetting, setEditSetting] = useState<Setting | null>(null);
  const [addFor, setAddFor] = useState<Product | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteKind, setDeleteKind] = useState<"setting" | "product" | "override" | "rule">("setting");
  const [freezeSetting, setFreezeSetting] = useState<Setting | null>(null);
  const [resetSetting, setResetSetting] = useState<Setting | null>(null);
  const [bulkFreeze, setBulkFreeze] = useState(false);
  const [registryOpen, setRegistryOpen] = useState(false);
  const [newProduct, setNewProduct] = useState(false);
  const [freezeProduct, setFreezeProduct] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [ovrDrawer, setOvrDrawer] = useState(false);
  const [ovrWizard, setOvrWizard] = useState(false);
  const [ovrEdit, setOvrEdit] = useState<Override | null>(null);
  const [ovrAction, setOvrAction] = useState<{ o: Override | null; a: "expire" | "freeze" | "unfreeze" | "duplicate" | null }>({ o: null, a: null });
  const [rulesDrawer, setRulesDrawer] = useState(false);
  const [ruleWizard, setRuleWizard] = useState(false);
  const [ruleEdit, setRuleEdit] = useState<Rule | null>(null);
  const [ruleToggle, setRuleToggle] = useState<Rule | null>(null);
  const [ruleTest, setRuleTest] = useState<Rule | null>(null);
  const [envDrawer, setEnvDrawer] = useState(false);
  const [driftSetting, setDriftSetting] = useState<Setting | null>(null);
  const [promoteWizard, setPromoteWizard] = useState(false);
  const [versionsDrawer, setVersionsDrawer] = useState(false);
  const [versionDiff, setVersionDiff] = useState<ConfigVersion | null>(null);
  const [rollbackVersion, setRollbackVersion] = useState<ConfigVersion | null>(null);
  const [requestsDrawer, setRequestsDrawer] = useState(false);
  const [requestDetail, setRequestDetail] = useState<ChangeRequest | null>(null);
  const [approveReq, setApproveReq] = useState<ChangeRequest | null>(null);
  const [rejectReq, setRejectReq] = useState<ChangeRequest | null>(null);
  const [newRequest, setNewRequest] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [permOpen, setPermOpen] = useState(false);
  const [auditDrawer, setAuditDrawer] = useState(false);

  /* ---------------- shell signal bridge ---------------- */
  useEffect(() => {
    if (!signal.n) return;
    if (signal.action === "export") setExportOpen(true);
  }, [signal]);

  /* ---------------- derived ---------------- */
  const drift = settings.filter((s) => s.drift);
  const kpi = CONFIG_KPI({ settings, overrides, rules, requests, versions });
  const pending = requests.filter((r) => r.status === "Pending");
  const filtered = useMemo(() => settings
    .filter((s) => group === "All" || s.productId === group)
    .filter((s) => s.key.toLowerCase().includes(q.toLowerCase()) || s.id.toLowerCase().includes(q.toLowerCase()) || s.value.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.id.localeCompare(b.id)), [settings, group, q]);
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  /* ---------------- mutations (absolute admin powers) ---------------- */
  const doEditSetting = (id: string, value: string, reason: string) => {
    const s = settings.find((x) => x.id === id);
    setSettings((ss) => ss.map((x) => (x.id === id ? { ...x, value, drift: value !== x.value ? value : x.drift, changed: "Aug 23", changedBy: "Joseph Mwangi" } : x)));
    setRequests((rs) => [{ id: `CR-${2102 + rs.length - REQUESTS.length}`, productId: s!.productId, settingKey: s!.key, from: s!.value, to: value, requestedBy: "Joseph Mwangi", requestedAt: "Aug 23 · now", status: "Pending", risk: "Medium", reason, approvals: [{ role: "Risk", who: "V. Kiprop", state: "Pending" }, { role: "Product", who: "P. Wanjiru", state: "Pending" }, { role: "Super Admin", who: "J. Mwangi", state: "Pending" }] }, ...rs]);
    logAudit(groupName(s!.productId), `${s!.key} edit staged`, s!.value, value, reason);
  };
  const doAddSetting = (productId: string, groupKey: string, key: string, value: string, kind: string, min: string, max: string, reason: string) => {
    const prefix = { "prod-mpesa": "MP", "prod-cards": "CD", "prod-loans": "LN", "prod-savings": "SV", "prod-bank": "BK", "prod-fx": "FX", "prod-bills": "BL", "prod-payroll": "PR" }[productId] ?? "NW";
    const id = `PCF-${prefix}-${String(settings.filter((s) => s.productId === productId).length + 1).padStart(2, "0")}`;
    setSettings((ss) => [...ss, { id, productId, group: groupKey, key, value, valueKind: kind as Setting["valueKind"], min: min || undefined, max: max || undefined, editable: true, changed: "Aug 23", changedBy: "Joseph Mwangi", drift: value }]);
    logAudit(groupName(productId), `${key} created`, "—", value, reason);
  };
  const doDeleteSetting = (id: string) => {
    const s = settings.find((x) => x.id === id);
    setSettings((ss) => ss.filter((x) => x.id !== id));
    setSelected((sel) => sel.filter((x) => x !== id));
    logAudit(groupName(s?.productId ?? ""), `${s?.key ?? id} deleted`, s?.value ?? "—", "removed", "Super Admin deletion — snapshot retained 90 days");
  };
  const doFreezeSetting = (id: string, freeze: boolean, reason: string) => {
    const s = settings.find((x) => x.id === id);
    setSettings((ss) => ss.map((x) => (x.id === id ? { ...x, frozen: freeze || undefined } : x)));
    logAudit(groupName(s?.productId ?? ""), `${s?.key ?? id} ${freeze ? "frozen" : "unfrozen"}`, freeze ? "editable" : "frozen", freeze ? "frozen" : "editable", reason);
  };
  const doBulkFreeze = (reason: string) => {
    const ids = selected;
    setSettings((ss) => ss.map((x) => (ids.includes(x.id) ? { ...x, frozen: true } : x)));
    logAudit("Change freeze", `${ids.length} settings frozen`, "editable", "frozen", reason);
    setSelected([]);
  };
  const doReset = (id: string) => {
    const s = settings.find((x) => x.id === id);
    const def = DEFAULTS[id] ?? s?.min ?? s?.value;
    setSettings((ss) => ss.map((x) => (x.id === id ? { ...x, drift: def } : x)));
    logAudit(groupName(s?.productId ?? ""), `${s?.key ?? id} reset staged`, s?.value ?? "—", def, "Reset to launch default");
  };
  const doNewProduct = (name: string, category: string, owner: string, template: string, env: string) => {
    const id = `prod-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 18)}-${products.length + 1}`;
    const color = ["#12b76a", "#2e90fa", "#7a5af8", "#f79009", "#ee46bc", "#0ba5ec"][products.length % 6];
    setProducts((ps) => [...ps, { id, name, short: name.split(" ")[0], icon: "bi-box", color, category, status: "Draft", owner, group: category, description: `${name} configuration — created from “${template}” template, first published to ${env}.` }]);
    logAudit("Registry", `${name} config set created`, "—", template, `Owner ${owner} · target ${env}`);
  };
  const doFreezeProduct = (id: string, freeze: boolean, reason: string) => {
    const p = products.find((x) => x.id === id);
    setProducts((ps) => ps.map((x) => (x.id === id ? { ...x, status: freeze ? "Frozen" : x.status === "Frozen" ? "Live" : x.status, frozenNote: freeze ? `${reason} (frozen Aug 23)` : undefined } : x)));
    logAudit(p?.short ?? "Registry", `${p?.name ?? id} ${freeze ? "frozen" : "unfrozen"}`, freeze ? "Live" : "Frozen", freeze ? "Frozen" : "Live", reason);
  };
  const doDeleteProduct = (id: string) => {
    const p = products.find((x) => x.id === id);
    const count = settings.filter((s) => s.productId === id).length;
    setProducts((ps) => ps.filter((x) => x.id !== id));
    setSettings((ss) => ss.filter((x) => x.productId !== id));
    setDrawerProduct(null);
    logAudit("Registry", `${p?.name ?? id} deleted`, `${count} settings`, "removed", "Super Admin deletion — snapshot retained 90 days");
  };
  const doEditProduct = (id: string, owner: string, description: string, status: string) => {
    setProducts((ps) => ps.map((x) => (x.id === id ? { ...x, owner, description, status: status as Product["status"] } : x)));
    logAudit("Registry", `${products.find((x) => x.id === id)?.name ?? id} details`, "—", `${owner} · ${status}`, "Registry record updated");
  };
  const doAddOverride = (o: Omit<Override, "id" | "created" | "createdBy" | "status" | "affected">, status: Override["status"]) => {
    setOverrides((os) => [{ ...o, id: `OVR-${String(os.length + 1).padStart(2, "0")}`, created: "Aug 23", createdBy: "Joseph Mwangi", status, affected: o.scope === "User" ? 1 : o.scope === "Merchant" ? 1 : o.scope === "Tier" ? 1240 : 5000 }, ...os]);
    logAudit("Overrides", `override for ${o.target}`, o.baseline, o.value, o.note);
  };
  const doEditOverride = (id: string, value: string, expires: string, note: string) => {
    const o = overrides.find((x) => x.id === id);
    setOverrides((os) => os.map((x) => (x.id === id ? { ...x, value, expires, note } : x)));
    logAudit("Overrides", `${o?.target ?? id} edited`, o?.value ?? "—", value, note || "Value update");
  };
  const doOverrideAction = (id: string, action: "expire" | "freeze" | "unfreeze" | "duplicate") => {
    const o = overrides.find((x) => x.id === id);
    if (action === "duplicate") {
      setOverrides((os) => [{ ...(o as Override), id: `OVR-${String(os.length + 1).padStart(2, "0")}`, status: "Draft", created: "Aug 23", createdBy: "Joseph Mwangi" }, ...os]);
      logAudit("Overrides", `duplicated ${id}`, o?.target ?? "", "new draft", "Duplicated for retargeting");
      return;
    }
    setOverrides((os) => os.map((x) => (x.id === id ? { ...x, status: action === "expire" ? "Expired" : action === "freeze" ? "Frozen" : "Active" } : x)));
    logAudit("Overrides", `${o?.target ?? id} ${action}d`, o?.status ?? "—", action === "expire" ? "Expired" : action === "freeze" ? "Frozen" : "Active", `Super Admin ${action}`);
  };
  const doAddRule = (r: Omit<Rule, "id" | "hits30d" | "lastHit">) => {
    setRules((rs) => [...rs, { ...r, id: `RL-${String(rs.length + 1).padStart(2, "0")}`, hits30d: 0, lastHit: "—" }]);
    logAudit("Rules", `${r.name} created`, "—", r.action, `Super Admin · P${r.priority}`);
  };
  const doEditRule = (id: string, trigger: string, action: string, priority: number) => {
    const r = rules.find((x) => x.id === id);
    setRules((rs) => rs.map((x) => (x.id === id ? { ...x, trigger, action, priority } : x)));
    logAudit("Rules", `${r?.name ?? id} edited`, r?.trigger ?? "—", trigger, "Super Admin edit");
  };
  const doToggleRule = (id: string, enable: boolean, reason: string) => {
    const r = rules.find((x) => x.id === id);
    setRules((rs) => rs.map((x) => (x.id === id ? { ...x, enabled: enable } : x)));
    logAudit("Rules", `${r?.name ?? id} ${enable ? "enabled" : "disabled"}`, enable ? "Disabled" : "Enabled", enable ? "Enabled" : "Disabled", reason);
  };
  const doDeleteRule = (id: string) => {
    const r = rules.find((x) => x.id === id);
    setRules((rs) => rs.filter((x) => x.id !== id));
    logAudit("Rules", `${r?.name ?? id} deleted`, r?.action ?? "—", "removed", "Super Admin deletion");
  };
  const doApprove = (id: string) => {
    const r = requests.find((x) => x.id === id);
    setRequests((rs) => rs.map((x) => (x.id === id ? { ...x, status: "Approved", approvals: x.approvals.map((a) => (a.state === "Pending" ? { ...a, state: "Approved" as const } : a)) } : x)));
    logAudit("Approvals", `${r?.settingKey ?? id} approved`, r?.from ?? "", r?.to ?? "", "Super Admin approval — joins next release train");
  };
  const doReject = (id: string, reason: string) => {
    const r = requests.find((x) => x.id === id);
    setRequests((rs) => rs.map((x) => (x.id === id ? { ...x, status: "Rejected", approvals: x.approvals.map((a) => (a.state === "Pending" ? { ...a, state: "Rejected" as const } : a)) } : x)));
    logAudit("Approvals", `${r?.settingKey ?? id} rejected`, r?.to ?? "", "rejected", reason);
  };
  const doNewRequest = (productId: string, settingKey: string, from: string, to: string, reason: string, risk: string) => {
    setRequests((rs) => [{ id: `CR-${2102 + rs.length - REQUESTS.length}`, productId, settingKey, from, to, requestedBy: "Joseph Mwangi", requestedAt: "Aug 23 · now", status: "Pending", risk: risk as ChangeRequest["risk"], reason, approvals: [{ role: "Risk", who: "V. Kiprop", state: "Pending" }, { role: "Product", who: "P. Wanjiru", state: "Pending" }, { role: "Super Admin", who: "J. Mwangi", state: "Pending" }] }, ...rs]);
    logAudit(groupName(productId), `change requested on ${settingKey}`, from, to, reason);
  };
  const doPromote = (window: string, notifyPartners: boolean) => {
    const vId = `v3.15.${versions.filter((v) => v.id.startsWith("v3.15")).length}.${versions.length}`;
    setSettings((ss) => ss.map((x) => (x.drift ? { ...x, value: x.drift, drift: undefined, changed: "Aug 23", changedBy: "J. Mwangi" } : x)));
    setVersions((vs) => [{ id: vId, date: `Aug 23 · ${window.includes("22:00") ? "22:00" : "now"}`, admin: "J. Mwangi", changes: drift.length, note: `${drift.length} settings promoted from staging`, scope: [...new Set(drift.map((d) => groupName(d.productId)))].join(" · "), current: true }, ...vs.map((v) => ({ ...v, current: undefined }))]);
    setRequests((rs) => rs.map((x) => (x.status === "Approved" ? { ...x, status: "Deployed" } : x)));
    logAudit("Publish", `${vId} scheduled`, "staging", "production", `Release window ${window}${notifyPartners ? " · partners notified" : ""}`);
  };
  const doRollback = (versionId: string, reason: string) => {
    setVersions((vs) => [{ id: `v3.15.${vs.length}.1-r`, date: "Aug 23 · now", admin: "J. Mwangi", changes: 1, note: `Rollback to ${versionId}`, scope: "Revert", current: true }, ...vs.map((v) => ({ ...v, current: undefined }))]);
    logAudit("Publish", `rolled back to ${versionId}`, versions.find((v) => v.current)?.id ?? "—", versionId, reason);
  };
  const doSyncDrift = (id: string) => {
    const s = settings.find((x) => x.id === id);
    setRequests((rs) => [{ id: `CR-${2102 + rs.length - REQUESTS.length}`, productId: s!.productId, settingKey: s!.key, from: s!.value, to: s!.drift!, requestedBy: "Joseph Mwangi", requestedAt: "Aug 23 · now", status: "Pending", risk: "Low", reason: "Environment sync — adopt staging value", approvals: [{ role: "Risk", who: "V. Kiprop", state: "Pending" }, { role: "Super Admin", who: "J. Mwangi", state: "Pending" }] }, ...rs]);
    logAudit(groupName(s!.productId), `${s!.key} sync requested`, s!.value, s!.drift!, "Adopt staging value");
  };

  /* ---------------- shared bits ---------------- */
  const ProductChip = ({ id }: { id: string }) => (
    <span className="pm-badge grey"><span className="pm-legend-dot me-1" style={{ background: groupColor(id) }} />{groupName(id)}</span>
  );

  return (
    <>
      {/* ============================== Header ============================== */}
      <div className="pm-section-head" style={{ marginTop: 0 }}>
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="pm-eyebrow">Products &amp; Services · Page 21</span>
            <span className="pm-live"><span className="pm-dot green pm-pulse" />v{versions.find((v) => v.current)?.id ?? "3.14.2"} on production</span>
          </div>
          <h2>Product Configuration</h2>
          <p>
            Every product parameter in one console — limits, fees, eligibility and behavior across 8 config sets, segment/tier/user
            overrides, the rules engine, environment promotion with drift control, versioned rollback and a fully-gated approvals
            queue. Super Admin has absolute control: add, edit, delete, freeze and reset every record — every action 2FA-verified
            and written to the audit trail.
          </p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setAuditDrawer(true)}>
            <i className="bi bi-journal-check me-1" />Audit
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setVersionsDrawer(true)}>
            <i className="bi bi-clock-history me-1" />Versions
          </button>
          <button className="btn btn-outline-secondary btn-sm position-relative" onClick={() => setRequestsDrawer(true)}>
            <i className="bi bi-hourglass-split me-1" />Approvals
            {pending.length > 0 && <span className="pm-nav-pill" style={{ position: "absolute", top: -6, right: -6 }}>{pending.length}</span>}
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setExportOpen(true)}>
            <i className="bi bi-download me-1" />Export
          </button>
          <Dropdown width={272} trigger={() => <button className="btn btn-outline-secondary btn-sm"><i className="bi bi-three-dots" /></button>}>
            {(close) => (
              <>
                <div className="pm-dd-head">Config desk</div>
                <DDItem icon="bi-person-lock" label="Permissions matrix" hint="Who can change what" onClick={() => { close(); setPermOpen(true); }} />
                <DDItem icon="bi-person-badge" label="Overrides console" hint={`${overrides.filter((o) => o.status === "Active").length} active overrides`} onClick={() => { close(); setOvrDrawer(true); }} />
                <DDItem icon="bi-lightning-charge" label="Rules engine" hint={`${rules.filter((r) => r.enabled).length}/${rules.length} rules enabled`} onClick={() => { close(); setRulesDrawer(true); }} />
                <DDItem icon="bi-layers" label="Environments" hint={`${drift.length} settings drifted`} onClick={() => { close(); setEnvDrawer(true); }} />
                <DDItem icon="bi-collection" label="Product registry" hint={`${products.length} config sets`} onClick={() => { close(); setRegistryOpen(true); }} />
                <DDItem icon="bi-plus-circle" label="Request a change" hint="Files into approvals queue" onClick={() => { close(); setNewRequest(true); }} />
                <div className="pm-dd-sep" />
                <DDItem icon="bi-collection" label="Open Service Portfolio" hint="Page 20 · service P&L" onClick={() => { close(); onNavigate("portfolio"); }} />
                <DDItem icon="bi-arrow-repeat" label="Open Recurring Services" hint="Page 22 · mandates" onClick={() => { close(); onNavigate("recurring"); }} />
                <DDItem icon="bi-credit-card" label="Open Card Programs" hint="Page 23 · card products" onClick={() => { close(); onNavigate("cards"); }} />
                <DDItem icon="bi-percent" label="Open Fee Management" hint="Page 10 · fee schedules" onClick={() => { close(); onNavigate("fees"); }} />
                <DDItem icon="bi-flag" label="Open Feature Flags" hint="Page 34 · rollout toggles" onClick={() => { close(); onNavigate("flags"); }} />
              </>
            )}
          </Dropdown>
          <button className="btn btn-primary btn-sm" onClick={() => { setAddFor(null); setAddOpen(true); }}>
            <i className="bi bi-plus-lg me-1" />Add setting
          </button>
        </div>
      </div>

      {/* ============================== KPI strip ============================== */}
      <div className="row g-2 mb-3">
        {kpi.map((s) => (
          <div className="col-6 col-md-4 col-xxl-2" key={s.label}>
            <div className="pm-stat">
              <div className="d-flex align-items-center gap-2">
                <span className="pm-stat-ico" style={{
                  background: s.tone === "green" ? "#e7f8ef" : s.tone === "amber" ? "#fff5e6" : s.tone === "violet" ? "#f4f1ff" : "#eff8ff",
                  color: s.tone === "green" ? "#0b8f52" : s.tone === "amber" ? "#b54708" : s.tone === "violet" ? "#5925dc" : "#175cd3",
                }}><i className={`bi ${s.icon}`} /></span>
                <span className="pm-stat-label">{s.label}</span>
              </div>
              <div className="pm-stat-value">{s.value}</div>
              <div className="pm-stat-foot">{s.note}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ============================== Tabs ============================== */}
      <div className="pm-tabs mb-3">
        {TABS.map((t) => (
          <button key={t.id} className={`pm-tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
            <i className={`bi ${t.icon}`} />{t.label}
            {t.id === "settings" && <span className="cnt">{settings.length}</span>}
            {t.id === "overrides" && <span className="cnt">{overrides.length}</span>}
            {t.id === "rules" && <span className="cnt">{rules.length}</span>}
            {t.id === "environments" && drift.length > 0 && <span className="cnt" style={{ background: "#fff5e6", color: "#b54708" }}>{drift.length}</span>}
            {t.id === "approvals" && pending.length > 0 && <span className="cnt" style={{ background: "#fff5e6", color: "#b54708" }}>{pending.length}</span>}
          </button>
        ))}
      </div>

      {/* ============================== Tab: products ============================== */}
      {tab === "products" && (
        <>
          <div className="d-flex gap-2 flex-wrap mb-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setRegistryOpen(true)}><i className="bi bi-collection me-1" />Open registry console</button>
            <button className="btn btn-primary btn-sm" onClick={() => setNewProduct(true)}><i className="bi bi-plus-lg me-1" />New product config</button>
            <span className="ms-auto pm-td-sub">Freeze, delete or re-owner any set from the registry or row menus</span>
          </div>
          <div className="pm-card mb-3">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Product</th><th>Category</th><th>Status</th><th className="text-end">Settings</th><th className="text-end">Frozen</th><th className="text-end">Drifted</th><th>Owner</th><th /></tr></thead>
                <tbody>
                  {products.map((p) => {
                    const rows = settings.filter((s) => s.productId === p.id);
                    return (
                      <tr key={p.id} style={{ cursor: "pointer" }} onClick={() => setDrawerProduct(p)}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span className="pm-avatar" style={{ background: `${p.color}1f`, color: p.color }}><i className={`bi ${p.icon}`} /></span>
                            <div>
                              <span className="pm-td-strong">{p.name}</span>
                              <div className="pm-td-sub mono">{p.id}</div>
                            </div>
                          </div>
                        </td>
                        <td><Badge tone="grey">{p.category}</Badge></td>
                        <td><Badge tone={statusTone(p.status)} dot>{p.status}</Badge></td>
                        <td className="text-end pm-num">{rows.length}</td>
                        <td className="text-end pm-num">{rows.filter((r) => r.frozen).length || "—"}</td>
                        <td className="text-end pm-num">{rows.filter((r) => r.drift).length || "—"}</td>
                        <td className="pm-td-sub">{p.owner}</td>
                        <td className="text-end" onClick={(e) => e.stopPropagation()}>
                          <Dropdown trigger={() => <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".64rem" }}><i className="bi bi-three-dots" /></button>}>
                            {(close) => (
                              <>
                                <div className="pm-dd-head">{p.name}</div>
                                <DDItem icon="bi-box-arrow-in-right" label="Open config console" hint={`${rows.length} settings · grouped`} onClick={() => { close(); setDrawerProduct(p); }} />
                                <DDItem icon="bi-plus-lg" label="Add setting" hint="Wizard · 2FA" onClick={() => { close(); setAddFor(p); setAddOpen(true); }} />
                                <DDItem icon="bi-pencil-square" label="Edit details" hint="Owner · status · description" onClick={() => { close(); setEditProduct(p); }} />
                                <DDItem icon="bi-person-badge" label="Add override" hint="Bend one setting for one audience" onClick={() => { close(); setOvrWizard(true); }} />
                                <DDItem icon={p.status === "Frozen" ? "bi-play-fill" : "bi-snow"} label={p.status === "Frozen" ? "Unfreeze config" : "Freeze config"} danger={p.status !== "Frozen"} hint="2FA · locks all settings" onClick={() => { close(); setFreezeProduct(p); }} />
                                <div className="pm-dd-sep" />
                                <DDItem icon="bi-trash3" label="Delete config set" danger hint={`${rows.length} settings · typed confirm`} onClick={() => { close(); setDeleteTarget({ id: p.id, name: p.name }); setDeleteKind("product"); }} />
                              </>
                            )}
                          </Dropdown>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="pm-table-foot">
              <span>{products.length} config sets · {settings.length} settings total</span>
              <span className="pm-td-sub">Templates: Lending · Payments · Savings · Blank</span>
            </div>
          </div>
        </>
      )}

      {/* ============================== Tab: settings library ============================== */}
      {tab === "settings" && (
        <>
          <div className="d-flex gap-2 flex-wrap align-items-center mb-2">
            <div className="pm-search" style={{ maxWidth: 260, minWidth: 200 }}>
              <i className="bi bi-search" />
              <input placeholder="Search key, id or value…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="ms-auto pm-td-sub">{filtered.length} of {settings.length} settings</div>
            <button className="btn btn-primary btn-sm" onClick={() => { setAddFor(null); setAddOpen(true); }}><i className="bi bi-plus-lg me-1" />Add</button>
          </div>
          <div className="d-flex gap-1 flex-wrap mb-2">
            {["All", ...products.map((p) => p.id)].map((g) => (
              <button key={g} className={`pm-chip ${group === g ? "active" : ""}`} onClick={() => setGroup(g)}>
                {g === "All" ? "All products" : <><span className="pm-legend-dot me-1" style={{ background: groupColor(g) }} />{groupName(g)} ({settings.filter((s) => s.productId === g).length})</>}
              </button>
            ))}
          </div>
          <div className="pm-card mb-3">
            {selected.length > 0 && (
              <div className="pm-bulkbar">
                <i className="bi bi-check2-square" />
                <b>{selected.length} selected</b>
                <button className="btn btn-sm btn-outline-light ms-2" style={{ fontSize: ".72rem" }} onClick={() => setBulkFreeze(true)}><i className="bi bi-snow me-1" />Freeze…</button>
                <button className="btn btn-sm btn-outline-light" style={{ fontSize: ".72rem" }} onClick={() => csvDownload("selected-settings.csv", settings.filter((s) => selected.includes(s.id)) as unknown as Record<string, unknown>[])}>
                  <i className="bi bi-download me-1" />Export CSV
                </button>
                <button className="btn btn-sm btn-link ms-auto" style={{ color: "#9db3c8", fontSize: ".72rem" }} onClick={() => setSelected([])}>Clear</button>
              </div>
            )}
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead>
                  <tr>
                    <th style={{ width: 34 }}>
                      <input type="checkbox" className="form-check-input" checked={pageRows.length > 0 && pageRows.every((s) => selected.includes(s.id))}
                        onChange={(e) => setSelected((sel) => e.target.checked ? [...new Set([...sel, ...pageRows.map((s) => s.id)])] : sel.filter((id) => !pageRows.some((s) => s.id === id)))} aria-label="Select page" />
                    </th>
                    <th>Setting</th><th>Product</th><th>Group</th><th>Value</th><th>Range</th><th>Changed</th><th>State</th><th />
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((s) => (
                    <tr key={s.id} className={selected.includes(s.id) ? "selected" : ""} style={{ cursor: "pointer", opacity: s.frozen ? 0.62 : 1 }} onClick={() => setDrawerProduct(products.find((p) => p.id === s.productId) ?? null)}>
                      <td onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="form-check-input" checked={selected.includes(s.id)}
                          onChange={(e) => setSelected((sel) => e.target.checked ? [...sel, s.id] : sel.filter((x) => x !== s.id))} aria-label={`Select ${s.key}`} />
                      </td>
                      <td className="pm-td-strong">{s.key}<div className="pm-td-sub mono">{s.id}</div></td>
                      <td><ProductChip id={s.productId} /></td>
                      <td className="pm-td-sub">{s.group}</td>
                      <td className="mono" style={{ fontWeight: 700 }}>{s.value}{s.drift && <div className="pm-td-sub mono" style={{ color: "#b54708" }}>staging: {s.drift}</div>}</td>
                      <td className="pm-td-sub mono">{s.min || s.max ? `${s.min ?? "—"} → ${s.max ?? "—"}` : "—"}</td>
                      <td className="pm-td-sub mono">{s.changed} · {s.changedBy}</td>
                      <td>
                        {s.frozen ? <Badge tone="red" dot>frozen</Badge>
                          : s.drift ? <Badge tone="amber" dot>drift</Badge>
                            : s.editable ? <Badge tone="green" dot>editable</Badge>
                              : <span title={s.lockedReason}><Badge tone="grey" dot>locked</Badge></span>}
                      </td>
                      <td className="text-end text-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button className="btn btn-sm btn-outline-primary me-1" style={{ fontSize: ".62rem" }} disabled={!s.editable || s.frozen} title={!s.editable ? s.lockedReason ?? "Locked" : ""} onClick={() => setEditSetting(s)}>Edit</button>
                        <button className="btn btn-sm btn-outline-secondary me-1" style={{ fontSize: ".62rem" }} title={s.frozen ? "Unfreeze" : "Freeze"} onClick={() => setFreezeSetting(s)}><i className={`bi ${s.frozen ? "bi-play-fill" : "bi-snow"}`} /></button>
                        <button className="btn btn-sm btn-outline-secondary me-1" style={{ fontSize: ".62rem" }} title="Reset to default" disabled={!s.editable || s.frozen} onClick={() => setResetSetting(s)}><i className="bi bi-arrow-counterclockwise" /></button>
                        <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".62rem", color: "#b42318", borderColor: "#fbd3cf" }} title="Delete" disabled={!s.editable} onClick={() => { setDeleteTarget({ id: s.id, name: s.key }); setDeleteKind("setting"); }}><i className="bi bi-trash3" /></button>
                      </td>
                    </tr>
                  ))}
                  {pageRows.length === 0 && <tr><td colSpan={9}><EmptyState icon="bi-search" title="No settings match" body="Clear the search or product filter." action={<button className="btn btn-sm btn-outline-secondary" onClick={() => { setQ(""); setGroup("All"); }}>Reset filters</button>} /></td></tr>}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={pageSize} total={filtered.length} onPage={setPage} onPageSize={() => setPage(1)} />
          </div>
        </>
      )}

      {/* ============================== Tab: overrides ============================== */}
      {tab === "overrides" && (
        <div className="pm-card mb-3">
          <div className="pm-card-head">
            <div>
              <h3 className="pm-card-title">Segment · tier · user · merchant overrides</h3>
              <p className="pm-card-sub">One setting, one audience, one justification — full CRUD with freeze, expire and duplicate</p>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setOvrDrawer(true)}><i className="bi bi-person-badge me-1" />Console</button>
              <button className="btn btn-sm btn-primary" onClick={() => setOvrWizard(true)}><i className="bi bi-plus-lg me-1" />New override</button>
            </div>
          </div>
          <div className="pm-table-wrap">
            <table className="pm-table">
              <thead><tr><th>Scope / target</th><th>Product · setting</th><th>Override → baseline</th><th className="text-end">Affected</th><th>Expires</th><th>Status</th><th /></tr></thead>
              <tbody>
                {overrides.map((o) => (
                  <tr key={o.id} style={{ opacity: o.status === "Expired" ? 0.55 : 1 }}>
                    <td className="pm-td-strong">{o.target}<div className="pm-td-sub">{o.scope} · {o.id}</div></td>
                    <td className="pm-td-sub">{o.settingKey}<div className="pm-td-sub">{groupName(o.productId)}</div></td>
                    <td className="mono" style={{ fontWeight: 700, color: "#05603a" }}>{o.value}<div className="pm-td-sub mono">base {o.baseline}</div></td>
                    <td className="text-end pm-num">{o.affected.toLocaleString("en-KE")}</td>
                    <td className="pm-td-sub mono">{o.expires}</td>
                    <td><Badge tone={statusTone(o.status)} dot>{o.status}</Badge></td>
                    <td className="text-end text-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button className="btn btn-sm btn-outline-primary me-1" style={{ fontSize: ".62rem" }} disabled={o.status === "Expired"} onClick={() => setOvrEdit(o)}>Edit</button>
                      <button className="btn btn-sm btn-outline-secondary me-1" style={{ fontSize: ".62rem" }} disabled={o.status === "Expired"} onClick={() => setOvrAction({ o, a: o.status === "Frozen" ? "unfreeze" : "freeze" })}>{o.status === "Frozen" ? "Unfreeze" : "Freeze"}</button>
                      <button className="btn btn-sm btn-outline-secondary me-1" style={{ fontSize: ".62rem" }} disabled={o.status === "Expired"} onClick={() => setOvrAction({ o, a: "expire" })}>Expire</button>
                      <button className="btn btn-sm btn-outline-secondary me-1" style={{ fontSize: ".62rem" }} title="Duplicate as draft" onClick={() => setOvrAction({ o, a: "duplicate" })}>⧉</button>
                      <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".62rem", color: "#b42318", borderColor: "#fbd3cf" }} onClick={() => { setDeleteTarget({ id: o.id, name: o.target }); setDeleteKind("override"); }}><i className="bi bi-trash3" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pm-table-foot">
            <span>{overrides.filter((o) => o.status === "Active").length} active · {overrides.filter((o) => o.status === "Frozen").length} frozen · {overrides.filter((o) => o.status === "Draft").length} draft · {overrides.filter((o) => o.status === "Expired").length} expired</span>
            <span className="pm-td-sub">{overrides.filter((o) => o.status === "Active").reduce((a, o) => a + o.affected, 0).toLocaleString("en-KE")} accounts on non-baseline values</span>
          </div>
        </div>
      )}

      {/* ============================== Tab: rules ============================== */}
      {tab === "rules" && (
        <div className="pm-card mb-3">
          <div className="pm-card-head">
            <div>
              <h3 className="pm-card-title">Behaviour rules engine</h3>
              <p className="pm-card-sub">Trigger → action evaluated in priority order · full CRUD, toggle, dry-run test bench</p>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setRulesDrawer(true)}><i className="bi bi-lightning-charge me-1" />Console</button>
              <button className="btn btn-sm btn-primary" onClick={() => setRuleWizard(true)}><i className="bi bi-plus-lg me-1" />New rule</button>
            </div>
          </div>
          <div className="pm-table-wrap">
            <table className="pm-table">
              <thead><tr><th>Rule</th><th>Kind</th><th>Trigger → action</th><th>Scope</th><th className="text-end">Prio</th><th className="text-end">30d hits</th><th>State</th><th /></tr></thead>
              <tbody>
                {rules.map((r) => (
                  <tr key={r.id} style={{ opacity: r.enabled ? 1 : 0.6 }}>
                    <td className="pm-td-strong">{r.name}<div className="pm-td-sub mono">{r.id} · {r.productId === "all" ? "Platform-wide" : groupName(r.productId)}</div></td>
                    <td><Badge tone={r.kind === "Blocklist" ? "red" : r.kind === "Velocity" ? "amber" : r.kind === "Automation" ? "green" : "blue"}>{r.kind}</Badge></td>
                    <td className="pm-td-sub" style={{ maxWidth: 300 }}>{r.trigger}<i className="bi bi-arrow-return-right mx-1" />{r.action}</td>
                    <td className="pm-td-sub">{r.scope}</td>
                    <td className="text-end mono pm-num">{r.priority}</td>
                    <td className="text-end pm-num">{r.hits30d.toLocaleString("en-KE")}</td>
                    <td><Badge tone={r.enabled ? "green" : "grey"} dot>{r.enabled ? "On" : "Off"}</Badge></td>
                    <td className="text-end text-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button className="btn btn-sm btn-outline-primary me-1" style={{ fontSize: ".62rem" }} onClick={() => setRuleEdit(r)}>Edit</button>
                      <button className="btn btn-sm btn-outline-secondary me-1" style={{ fontSize: ".62rem" }} onClick={() => setRuleToggle(r)}>{r.enabled ? "Disable" : "Enable"}</button>
                      <button className="btn btn-sm btn-outline-secondary me-1" style={{ fontSize: ".62rem" }} onClick={() => setRuleTest(r)}><i className="bi bi-play-circle me-1" />Test</button>
                      <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".62rem", color: "#b42318", borderColor: "#fbd3cf" }} onClick={() => { setDeleteTarget({ id: r.id, name: r.name }); setDeleteKind("rule"); }}><i className="bi bi-trash3" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pm-table-foot">
            <span>{rules.filter((r) => r.enabled).length} of {rules.length} enabled · {rules.reduce((a, r) => a + r.hits30d, 0).toLocaleString("en-KE")} triggers in 30d</span>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => onNavigate("risk-scoring")}>Open Risk Scoring engine (page 17)</button>
          </div>
        </div>
      )}

      {/* ============================== Tab: environments ============================== */}
      {tab === "environments" && (
        <div className="row g-2 mb-3">
          {ENVIRONMENTS.map((e) => (
            <div className="col-12 col-xl-4" key={e.id}>
              <div className="pm-card pm-card-pad h-100" style={{ borderLeft: `3px solid ${e.id === "prod" ? "#12b76a" : e.id === "staging" ? "#f79009" : "#2e90fa"}` }}>
                <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                  <span style={{ fontWeight: 700, fontSize: ".88rem" }}>{e.name}</span>
                  {e.locked && <Badge tone="red" dot>locked</Badge>}
                  {e.autoSync && <Badge tone="blue">auto-sync</Badge>}
                </div>
                <div className="pm-td-sub mb-2">{e.note}</div>
                <div className="pm-kv"><span className="k">Last publish</span><span className="v mono" style={{ fontSize: ".72rem" }}>{e.lastPublish}</span></div>
                <div className="pm-kv"><span className="k">Published by</span><span className="v">{e.publishedBy}</span></div>
                <div className="pm-kv"><span className="k">{e.id === "staging" ? "Drift vs prod" : "Settings"}</span><span className="v mono">{e.id === "staging" ? `${drift.length} differ` : settings.length}</span></div>
              </div>
            </div>
          ))}
          <div className="col-12">
            <div className="pm-card">
              <div className="pm-card-head">
                <div>
                  <h3 className="pm-card-title">Drift review — staging vs production</h3>
                  <p className="pm-card-sub">Every difference needs an explicit promote or sync decision before the next release train</p>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setEnvDrawer(true)}><i className="bi bi-layers me-1" />Environment console</button>
                  <button className="btn btn-sm btn-primary" disabled={drift.length === 0} onClick={() => setPromoteWizard(true)}><i className="bi bi-rocket-takeoff me-1" />Promote ({drift.length})</button>
                </div>
              </div>
              {drift.length ? (
                <div className="pm-table-wrap">
                  <table className="pm-table">
                    <thead><tr><th>Setting</th><th>Product</th><th>Production</th><th>Staging</th><th /></tr></thead>
                    <tbody>
                      {drift.map((s) => (
                        <tr key={s.id} style={{ cursor: "pointer" }} onClick={() => setDriftSetting(s)}>
                          <td className="pm-td-strong">{s.key}<div className="pm-td-sub mono">{s.id} · {s.group}</div></td>
                          <td><ProductChip id={s.productId} /></td>
                          <td className="mono" style={{ fontWeight: 700 }}>{s.value}</td>
                          <td className="mono" style={{ fontWeight: 700, color: "#b54708" }}>{s.drift}</td>
                          <td className="text-end text-nowrap" onClick={(e) => e.stopPropagation()}>
                            <button className="btn btn-sm btn-outline-secondary me-1" style={{ fontSize: ".62rem" }} onClick={() => setDriftSetting(s)}>Diff</button>
                            <button className="btn btn-sm btn-outline-primary" style={{ fontSize: ".62rem" }} onClick={() => doSyncDrift(s.id)}>Sync</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <div className="p-3"><EmptyState icon="bi-check2-circle" title="No drift" body="Staging and production are identical." /></div>}
            </div>
          </div>
        </div>
      )}

      {/* ============================== Tab: versions ============================== */}
      {tab === "versions" && (
        <div className="pm-card mb-3">
          <div className="pm-card-head">
            <div>
              <h3 className="pm-card-title">Version history & rollback</h3>
              <p className="pm-card-sub">Every production publish is atomic and reversible · diff any release</p>
            </div>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setVersionsDrawer(true)}><i className="bi bi-clock-history me-1" />Open console</button>
          </div>
          <div className="pm-table-wrap">
            <table className="pm-table">
              <thead><tr><th>Version</th><th>Released</th><th>Admin</th><th className="text-end">Changes</th><th>Scope</th><th>Note</th><th /></tr></thead>
              <tbody>
                {versions.map((v) => (
                  <tr key={v.id}>
                    <td className="pm-td-strong mono">{v.id}{v.current ? <Badge tone="green" className="ms-2">current</Badge> : null}</td>
                    <td className="pm-td-sub mono">{v.date}</td>
                    <td className="pm-td-sub">{v.admin}</td>
                    <td className="text-end pm-num">{v.changes}</td>
                    <td className="pm-td-sub">{v.scope}</td>
                    <td className="pm-td-sub" style={{ maxWidth: 280 }}>{v.note}</td>
                    <td className="text-end text-nowrap">
                      <button className="btn btn-sm btn-outline-secondary me-1" style={{ fontSize: ".62rem" }} onClick={() => setVersionDiff(v)}><i className="bi bi-file-diff me-1" />Diff</button>
                      <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".62rem" }} disabled={v.current} onClick={() => setRollbackVersion(v)}><i className="bi bi-arrow-counterclockwise me-1" />Rollback</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================== Tab: approvals ============================== */}
      {tab === "approvals" && (
        <div className="pm-card mb-3">
          <div className="pm-card-head">
            <div>
              <h3 className="pm-card-title">Change approvals</h3>
              <p className="pm-card-sub">Nothing reaches production without Risk + Product + Super Admin sign-off</p>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setRequestsDrawer(true)}><i className="bi bi-hourglass-split me-1" />Queue console</button>
              <button className="btn btn-sm btn-primary" onClick={() => setNewRequest(true)}><i className="bi bi-plus-lg me-1" />Request change</button>
            </div>
          </div>
          <div className="pm-table-wrap">
            <table className="pm-table">
              <thead><tr><th>Change</th><th>Product</th><th>From → To</th><th>Risk</th><th>Requested</th><th>Approvals</th><th>Status</th><th /></tr></thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} style={{ cursor: "pointer" }} onClick={() => setRequestDetail(r)}>
                    <td className="pm-td-strong">{r.settingKey}<div className="pm-td-sub mono">{r.id}</div></td>
                    <td><ProductChip id={r.productId} /></td>
                    <td className="mono pm-td-sub">{r.from} → <b style={{ color: "#05603a" }}>{r.to}</b></td>
                    <td><Badge tone={r.risk === "High" ? "red" : r.risk === "Medium" ? "amber" : "green"}>{r.risk}</Badge></td>
                    <td className="pm-td-sub mono">{r.requestedAt}<div className="pm-td-sub">{r.requestedBy}</div></td>
                    <td className="text-nowrap">
                      {r.approvals.map((a) => (
                        <span key={a.role} className={`pm-badge ${a.state === "Approved" ? "green" : a.state === "Rejected" ? "red" : a.state === "Pending" ? "amber" : "grey"}`} style={{ marginRight: 3 }}>{a.role.slice(0, 4)} {a.state === "Approved" ? "✓" : a.state === "Rejected" ? "✗" : "…"}</span>
                      ))}
                    </td>
                    <td><Badge tone={statusTone(r.status)} dot>{r.status}</Badge></td>
                    <td className="text-end text-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button className="btn btn-sm btn-outline-primary me-1" style={{ fontSize: ".62rem" }} onClick={() => setRequestDetail(r)}>Review</button>
                      <button className="btn btn-sm btn-primary" style={{ fontSize: ".62rem" }} disabled={r.status !== "Pending"} onClick={() => setApproveReq(r)}>Approve</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pm-table-foot">
            <span>{pending.length} pending · {requests.filter((r) => r.status === "Approved").length} approved · {requests.filter((r) => r.status === "Deployed").length} deployed · {requests.filter((r) => r.status === "Rejected").length} rejected</span>
            <span className="pm-td-sub">Approver SLA 24h · high-risk needs Risk first</span>
          </div>
        </div>
      )}

      {/* ============================== Modals & drawers ============================== */}
      <ProductConfigDrawer
        product={drawerProduct ? products.find((p) => p.id === drawerProduct.id) ?? null : null}
        settings={settings} overrides={overrides} rules={rules} audit={audit}
        onClose={() => setDrawerProduct(null)}
        onEdit={setEditSetting}
        onAdd={(p) => { setDrawerProduct(null); setAddFor(p); setAddOpen(true); }}
        onFreezeSetting={setFreezeSetting}
        onReset={setResetSetting}
        onDelete={(s) => { setDeleteTarget({ id: s.id, name: s.key }); setDeleteKind("setting"); }}
        onEditProduct={setEditProduct}
        onFreezeProduct={setFreezeProduct}
        onAddOverride={() => { setDrawerProduct(null); setOvrWizard(true); }}
      />
      <SettingEditModal setting={editSetting ? settings.find((s) => s.id === editSetting.id) ?? null : null} onClose={() => setEditSetting(null)} onDone={doEditSetting} />
      <AddSettingWizard open={addOpen} product={addFor} products={products} onClose={() => { setAddOpen(false); setAddFor(null); }} onDone={doAddSetting} />
      <DeleteConfirmModal
        target={deleteTarget} kind={deleteKind}
        impact={
          deleteKind === "setting" ? "Live traffic falls back to the last promoted value for this key; history snapshot is kept 90 days."
            : deleteKind === "product" ? `Removes the config set and its ${settings.filter((s) => s.productId === deleteTarget?.id).length} settings from every environment. Overrides and rules referencing it are orphaned into review.`
              : deleteKind === "override" ? "The audience immediately falls back to the baseline value."
                : "The rule stops evaluating instantly; 30-day hit history is archived."}
        onClose={() => setDeleteTarget(null)}
        onDone={(id) => {
          if (deleteKind === "setting") doDeleteSetting(id);
          else if (deleteKind === "product") doDeleteProduct(id);
          else if (deleteKind === "override") { setOverrides((os) => os.filter((x) => x.id !== id)); logAudit("Overrides", `${id} deleted`, "—", "removed", "Super Admin deletion"); }
          else if (deleteKind === "rule") doDeleteRule(id);
        }}
      />
      <FreezeSettingModal setting={freezeSetting ? settings.find((s) => s.id === freezeSetting.id) ?? null : null} onClose={() => setFreezeSetting(null)} onDone={doFreezeSetting} />
      <BulkFreezeModal count={selected.length} open={bulkFreeze} onClose={() => setBulkFreeze(false)} onDone={doBulkFreeze} />
      <ResetDefaultModal setting={resetSetting} onClose={() => setResetSetting(null)} onDone={doReset} />
      <ProductsDrawer
        products={products} settings={settings} open={registryOpen} onClose={() => setRegistryOpen(false)}
        onOpen={(p) => { setRegistryOpen(false); setDrawerProduct(p); }}
        onNew={() => { setRegistryOpen(false); setNewProduct(true); }}
        onFreeze={(p) => { setRegistryOpen(false); setFreezeProduct(p); }}
        onEdit={(p) => { setRegistryOpen(false); setEditProduct(p); }}
        onDelete={(p) => { setRegistryOpen(false); setDeleteTarget({ id: p.id, name: p.name }); setDeleteKind("product"); }}
      />
      <NewProductWizard open={newProduct} onClose={() => setNewProduct(false)} onDone={doNewProduct} />
      <ProductFreezeModal product={freezeProduct ? products.find((p) => p.id === freezeProduct.id) ?? null : null} settingCount={freezeProduct ? settings.filter((s) => s.productId === freezeProduct.id).length : 0} onClose={() => setFreezeProduct(null)} onDone={doFreezeProduct} />
      <ProductEditModal product={editProduct ? products.find((p) => p.id === editProduct.id) ?? null : null} onClose={() => setEditProduct(null)} onDone={doEditProduct} />
      <OverridesDrawer
        overrides={overrides} open={ovrDrawer} onClose={() => setOvrDrawer(false)}
        onNew={() => { setOvrDrawer(false); setOvrWizard(true); }}
        onEdit={(o) => { setOvrDrawer(false); setOvrEdit(o); }}
        onExpire={(o) => setOvrAction({ o, a: "expire" })}
        onFreeze={(o) => setOvrAction({ o, a: o.status === "Frozen" ? "unfreeze" : "freeze" })}
        onDuplicate={(o) => setOvrAction({ o, a: "duplicate" })}
        onDelete={(o) => { setOvrDrawer(false); setDeleteTarget({ id: o.id, name: o.target }); setDeleteKind("override"); }}
      />
      <OverrideWizard open={ovrWizard} products={products} settings={settings} presets={overrides} onClose={() => setOvrWizard(false)} onDone={doAddOverride} />
      <OverrideEditModal override={ovrEdit ? overrides.find((o) => o.id === ovrEdit.id) ?? null : null} onClose={() => setOvrEdit(null)} onDone={doEditOverride} />
      <OverrideActionModal override={ovrAction.o ? overrides.find((o) => o.id === ovrAction.o!.id) ?? null : null} action={ovrAction.a} onClose={() => setOvrAction({ o: null, a: null })} onDone={doOverrideAction} />
      <RulesDrawer
        rules={rules} open={rulesDrawer} onClose={() => setRulesDrawer(false)}
        onNew={() => { setRulesDrawer(false); setRuleWizard(true); }}
        onEdit={(r) => { setRulesDrawer(false); setRuleEdit(r); }}
        onToggle={(r) => setRuleToggle(r)}
        onTest={(r) => setRuleTest(r)}
        onDuplicate={(r) => { doAddRule({ name: `${r.name} (copy)`, kind: r.kind, productId: r.productId, trigger: r.trigger, action: r.action, scope: r.scope, priority: r.priority, enabled: false }); push({ kind: "info", title: "Rule duplicated", body: `${r.name} (copy) created as draft.` }); }}
        onDelete={(r) => { setRulesDrawer(false); setDeleteTarget({ id: r.id, name: r.name }); setDeleteKind("rule"); }}
      />
      <RuleWizard open={ruleWizard} products={products} onClose={() => setRuleWizard(false)} onDone={doAddRule} />
      <RuleEditModal rule={ruleEdit ? rules.find((r) => r.id === ruleEdit.id) ?? null : null} onClose={() => setRuleEdit(null)} onDone={doEditRule} />
      <RuleToggleModal rule={ruleToggle ? rules.find((r) => r.id === ruleToggle.id) ?? null : null} onClose={() => setRuleToggle(null)} onDone={doToggleRule} />
      <RuleTestModal rule={ruleTest ? rules.find((r) => r.id === ruleTest.id) ?? null : null} onClose={() => setRuleTest(null)} />
      <EnvironmentsDrawer
        environments={ENVIRONMENTS} drift={drift} open={envDrawer} onClose={() => setEnvDrawer(false)}
        onDrift={(s) => setDriftSetting(s)}
        onPromote={() => { setEnvDrawer(false); setPromoteWizard(true); }}
      />
      <DriftModal setting={driftSetting ? settings.find((s) => s.id === driftSetting.id) ?? null : null} onClose={() => setDriftSetting(null)} onSync={doSyncDrift} onAllDrift={() => { setDriftSetting(null); setTab("environments"); }} />
      <PromoteWizard open={promoteWizard} drift={settings.filter((s) => s.drift)} onClose={() => setPromoteWizard(false)} onDone={doPromote} />
      <VersionsDrawer
        versions={versions} open={versionsDrawer} onClose={() => setVersionsDrawer(false)}
        onDiff={(v) => { setVersionsDrawer(false); setVersionDiff(v); }}
        onRollback={(v) => { setVersionsDrawer(false); setRollbackVersion(v); }}
      />
      <VersionDiffModal version={versionDiff} onClose={() => setVersionDiff(null)} onRollback={(v) => { setVersionDiff(null); setRollbackVersion(v); }} />
      <RollbackModal version={rollbackVersion} currentId={versions.find((v) => v.current)?.id ?? "—"} onClose={() => setRollbackVersion(null)} onDone={doRollback} />
      <RequestsDrawer
        requests={requests} open={requestsDrawer} onClose={() => setRequestsDrawer(false)}
        onOpen={(r) => { setRequestsDrawer(false); setRequestDetail(r); }}
        onNew={() => { setRequestsDrawer(false); setNewRequest(true); }}
      />
      <RequestDetailModal
        request={requestDetail ? requests.find((r) => r.id === requestDetail.id) ?? null : null}
        onClose={() => setRequestDetail(null)}
        onApprove={(r) => { setRequestDetail(null); setApproveReq(r); }}
        onReject={(r) => { setRequestDetail(null); setRejectReq(r); }}
      />
      <ApproveModal request={approveReq} onClose={() => setApproveReq(null)} onDone={doApprove} />
      <RejectModal request={rejectReq} onClose={() => setRejectReq(null)} onDone={doReject} />
      {newRequest && <NewRequestModal products={products} settings={settings} onClose={() => setNewRequest(false)} onDone={doNewRequest} />}
      <ConfigExportModal open={exportOpen} settings={settings} overrides={overrides} rules={rules} versions={versions} requests={requests} onClose={() => setExportOpen(false)} />
      <ConfigPermissionsModal open={permOpen} onClose={() => setPermOpen(false)} />
      <ConfigAuditDrawer open={auditDrawer} audit={audit} onClose={() => setAuditDrawer(false)} />
    </>
  );
}
