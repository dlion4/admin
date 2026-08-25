import { useEffect, useMemo, useState } from "react";
import { Badge, DDItem, Dropdown, Donut, EmptyState, Meter, Pagination, useToast } from "../../../components/ui";
import { csvDownload, kes, num } from "../../../lib/format";
import type { PipelineItem, PortfolioAudit, QuickConfig, RetirementPlan, Service } from "../data/serviceData";
import {
  CATEGORIES, DEPENDENCY_CHAINS, INCIDENTS, MONTHS, PIPELINE, PORTFOLIO_AUDIT, PORTFOLIO_KPI,
  QUICK_CONFIGS, RETIREMENTS, SERVICES, slaMet,
} from "../data/serviceData";
import {
  AdoptionDetailModal, AdoptionTargetModal, CompareModal, ConfigDrawer, ConfigEditModal, DependencyDetailModal,
  DependencyDrawer, FeeStructureModal, HealthDetailModal, NewServiceWizard, PauseWizard, PipelineDetailModal,
  PipelineDrawer, PortfolioAuditDrawer, PortfolioExportModal, PortfolioPermissionsModal, ResumeModal,
  RetirementDetailModal, RetirementDrawer, RetirementWizard, ServiceDetailDrawer, ServicePnLModal,
  SlaEditorModal, SyntheticCheckWizard, svcTone,
} from "../modals/ServiceModals";

type SortKey = "name" | "users" | "revenue" | "margin" | "growth";
const TABS = [
  { id: "catalog", label: "Service catalog", icon: "bi-collection" },
  { id: "health", label: "Gateway health", icon: "bi-heart-pulse" },
  { id: "adoption", label: "Adoption", icon: "bi-funnel" },
  { id: "revenue", label: "Revenue & P&L", icon: "bi-graph-up-arrow" },
  { id: "dependencies", label: "Dependencies", icon: "bi-diagram-3" },
  { id: "config", label: "Configuration", icon: "bi-sliders" },
  { id: "sunset", label: "Sunset & pipeline", icon: "bi-rocket-takeoff" },
] as const;

const CAT_COLORS: Record<string, string> = {
  Payments: "#12b76a", Cards: "#2e90fa", Banking: "#7a5af8", Utilities: "#f79009",
  Remittance: "#0ba5ec", Savings: "#16b364", Lending: "#ee46bc", Business: "#e04f16",
  Insurance: "#875bf7", Wealth: "#0b8f52",
};

const kesM = (m: number) => kes(m * 1e6, { compact: true });

export function ServicePortfolio({
  signal, onNavigate,
}: {
  signal: { action: string; n: number };
  onNavigate: (id: string) => void;
}) {
  const { push } = useToast();

  /* ---------------- live state ---------------- */
  const [services, setServices] = useState<Service[]>(SERVICES);
  const [configs, setConfigs] = useState<QuickConfig[]>(QUICK_CONFIGS);
  const [pipeline, setPipeline] = useState<PipelineItem[]>(PIPELINE);
  const [retirements, setRetirements] = useState<RetirementPlan[]>(RETIREMENTS);
  const [audit, setAudit] = useState<PortfolioAudit[]>(PORTFOLIO_AUDIT);

  const logAudit = (area: string, change: string, from: string, to: string, reason: string) =>
    setAudit((a) => [{ id: `PA-${1043 + a.length - PORTFOLIO_AUDIT.length}`, date: "Aug 23 · now", admin: "Jeckonia Kwasa", area, change, from, to, reason }, ...a]);

  /* ---------------- catalog table state ---------------- */
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("catalog");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const [statusSeg, setStatusSeg] = useState("All");
  const [sortKey, setSortKey] = useState<SortKey>("revenue");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selected, setSelected] = useState<string[]>([]);
  const [compareSel, setCompareSel] = useState<string[]>([]);

  /* ---------------- modal state ---------------- */
  const [detailSvc, setDetailSvc] = useState<Service | null>(null);
  const [pnlSvc, setPnlSvc] = useState<Service | null>(null);
  const [pauseScope, setPauseScope] = useState<Service[] | null>(null);
  const [resumeSvc, setResumeSvc] = useState<Service | null>(null);
  const [healthSvc, setHealthSvc] = useState<Service | null>(null);
  const [slaSvc, setSlaSvc] = useState<Service | null>(null);
  const [checkSvc, setCheckSvc] = useState<Service | null>(null);
  const [funnelSvc, setFunnelSvc] = useState<Service | null>(null);
  const [targetSvc, setTargetSvc] = useState<Service | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [depDrawer, setDepDrawer] = useState(false);
  const [depDetail, setDepDetail] = useState<string | null>(null);
  const [configDrawer, setConfigDrawer] = useState(false);
  const [editCfg, setEditCfg] = useState<QuickConfig | null>(null);
  const [cfgFocus, setCfgFocus] = useState<Service | null>(null);
  const [retDrawer, setRetDrawer] = useState(false);
  const [retDetail, setRetDetail] = useState<RetirementPlan | null>(null);
  const [retWizard, setRetWizard] = useState(false);
  const [pipeDrawer, setPipeDrawer] = useState(false);
  const [pipeDetail, setPipeDetail] = useState<PipelineItem | null>(null);
  const [newSvcWizard, setNewSvcWizard] = useState(false);
  const [feeSvc, setFeeSvc] = useState<Service | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [permOpen, setPermOpen] = useState(false);
  const [auditDrawer, setAuditDrawer] = useState(false);

  /* ---------------- shell signal bridge ---------------- */
  useEffect(() => {
    if (!signal.n) return;
    if (signal.action === "export") setExportOpen(true);
  }, [signal]);

  /* ---------------- derived ---------------- */
  const filtered = useMemo(() => services
    .filter((s) => (cat === "All" || s.category === cat))
    .filter((s) => statusSeg === "All" || s.status === statusSeg)
    .filter((s) => s.name.toLowerCase().includes(q.toLowerCase()) || s.id.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => {
      const get = (s: Service) => sortKey === "name" ? s.name : sortKey === "users" ? s.users : sortKey === "revenue" ? s.revenue30d : sortKey === "growth" ? s.growthMom : (s.margin ?? -1);
      const av = get(a), bv = get(b);
      return (typeof av === "string" ? String(av).localeCompare(String(bv)) : (av as number) - (bv as number)) * sortDir;
    }), [services, cat, statusSeg, q, sortKey, sortDir]);
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => { setPage(1); }, [cat, statusSeg, q]);

  const breached = services.filter((s) => !slaMet(s.health));
  const kpi = PORTFOLIO_KPI(services, pipeline, retirements);
  const revenueMix = useMemo(() => {
    const byCat = new Map<string, number>();
    services.forEach((s) => byCat.set(s.category, (byCat.get(s.category) ?? 0) + s.revenue30d));
    return [...byCat.entries()].sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value, color: CAT_COLORS[label] ?? "#98a2b3" }));
  }, [services]);
  const monthlyTotals = MONTHS.map((_, i) => services.reduce((s, x) => s + x.rev6m[i], 0));
  const movers = [...services].sort((a, b) => b.growthMom - a.growthMom).slice(0, 5);
  const laggards = [...services].filter((s) => s.adoptionTarget > 0).sort((a, b) => (b.active30d / b.users) - b.adoptionTarget / 100 - ((a.active30d / a.users) - a.adoptionTarget / 100)).slice(0, 5);

  /* ---------------- mutations ---------------- */
  const doPause = (ids: string[], reason: string, notify: boolean) => {
    setServices((ss) => ss.map((s) => (ids.includes(s.id) && s.status !== "Sunsetting" ? { ...s, status: "Paused" as const, statusNote: `Paused 23 Aug — ${reason.slice(0, 70)}${notify ? " · users notified" : " · silent"}` } : s)));
    ids.forEach((id) => {
      const s = services.find((x) => x.id === id);
      logAudit("Service status", `${s?.name ?? id} paused`, s?.status ?? "—", "Paused", reason);
    });
  };
  const doResume = (id: string, note: string) => {
    const s = services.find((x) => x.id === id);
    setServices((ss) => ss.map((x) => (x.id === id ? { ...x, status: "Active" as const, statusNote: undefined, active30d: Math.round(x.users * 0.4) } : x)));
    logAudit("Service status", `${s?.name ?? id} resumed`, "Paused", "Active", note);
  };
  const doSla = (id: string, target: number, reason: string) => {
    const s = services.find((x) => x.id === id);
    setServices((ss) => ss.map((x) => (x.id === id ? { ...x, health: { ...x.health, slaTarget: target } } : x)));
    logAudit("SLA", `${s?.health.gateway ?? id} target`, `${s?.health.slaTarget}%`, `${target}%`, reason);
  };
  const doAdoptionTarget = (id: string, target: number) => {
    const s = services.find((x) => x.id === id);
    setServices((ss) => ss.map((x) => (x.id === id ? { ...x, adoptionTarget: target } : x)));
    logAudit("Adoption", `${s?.name ?? id} target`, `${s?.adoptionTarget}%`, `${target}%`, "Product OKR cycle update");
  };
  const doFee = (id: string, fee: string, reason: string) => {
    const s = services.find((x) => x.id === id);
    setServices((ss) => ss.map((x) => (x.id === id ? { ...x, feeStructure: fee } : x)));
    logAudit("Fees", `${s?.name ?? id} structure`, s?.feeStructure ?? "—", fee, reason);
  };
  const doConfig = (cfgId: string, value: string, reason: string) => {
    const c = configs.find((x) => x.id === cfgId);
    setConfigs((cs) => cs.map((x) => (x.id === cfgId ? { ...x, value, changed: "Aug 23", changedBy: "Jeckonia Kwasa" } : x)));
    logAudit(c?.service ?? "Config", c?.key ?? cfgId, c?.value ?? "—", value, reason);
  };
  const doRetire = (serviceId: string, reason: string, migration: string, deadline: string, banner: boolean) => {
    const s = services.find((x) => x.id === serviceId);
    setServices((ss) => ss.map((x) => (x.id === serviceId ? { ...x, status: "Sunsetting" as const, statusNote: `Sunset scheduled ${deadline} · migration: ${migration}` } : x)));
    setRetirements((rs) => [{
      id: `RET-${rs.length + 1}`, service: s?.name ?? serviceId, serviceId, status: "Announced", reason,
      migration, deadline: new Date(deadline).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" }),
      users: s?.users ?? 0, migrated: 0, commsStage: banner ? "1 of 4 notices sent" : "notices queued",
    }, ...rs]);
    logAudit("Retirement", `${s?.name ?? serviceId} sunset announced`, "Active", `Sunset ${deadline}`, reason);
  };
  const doApprove = (id: string) => {
    setPipeline((ps) => ps.map((p) => (p.id === id ? { ...p, approvals: p.approvals.map((a) => (a.state === "Pending" ? { ...a, state: "Approved" as const } : a)) } : p)));
    const p = pipeline.find((x) => x.id === id);
    logAudit("Pipeline", `${p?.name ?? id} approvals`, "Pending", "Approved", "Super Admin approval recorded");
  };
  const doNewService = (name: string, owner: string, target: string, feeModel: string, deps: string[]) => {
    setPipeline((ps) => [{
      id: `PIPE-${ps.length + 1}`, name, stage: "Submitted", target, owner, progress: 2,
      dependencies: deps.join(" + ") || "TBD", arr: "KES — ARR",
      approvals: [{ role: "Risk", who: "V. Kiprop", state: "Pending" }, { role: "Compliance", who: "N. Wafula", state: "Pending" }, { role: "Finance", who: "B. Salim", state: "Not started" }, { role: "Board", who: "Exco", state: "Not started" }],
      note: `Proposed pricing ${feeModel}. Awaiting triage by product council.`,
    }, ...ps]);
    logAudit("Pipeline", `${name} proposed`, "—", "Submitted", `Owner ${owner} · target ${target}`);
  };
  const doIncident = (serviceId: string, finding: string) => {
    const svc = services.find((x) => x.id === serviceId);
    push({ kind: "warn", title: "Incident drafted", body: `${finding}${svc ? ` · ${svc.name}` : ""} — opening incident response (page 19).` });
    onNavigate("incident");
  };

  const openCheck = (serviceId: string) => {
    const svc = services.find((s) => s.id === serviceId) ?? null;
    setDepDrawer(false);
    setDetailSvc(null);
    setCheckSvc(svc);
  };
  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === 1 ? -1 : 1));
    else { setSortKey(k); setSortDir(k === "name" ? 1 : -1); }
  };
  const Th = ({ k, children, right }: { k?: SortKey; children: React.ReactNode; right?: boolean }) => (
    <th className={right ? "text-end" : ""} style={k ? { cursor: "pointer", userSelect: "none" } : undefined} onClick={k ? () => toggleSort(k) : undefined}>
      {children}{k && <i className={`bi ${sortKey === k ? (sortDir === 1 ? "bi-caret-up-fill" : "bi-caret-down-fill") : "bi-arrow-down-up"} ms-1`} style={{ fontSize: ".55rem", opacity: sortKey === k ? 1 : 0.35 }} />}
    </th>
  );

  /* ---------------- shared render helpers ---------------- */
  const ServiceCell = ({ s }: { s: Service }) => (
    <td>
      <div className="d-flex align-items-center gap-2">
        <span className="pm-avatar" style={{ background: `${CAT_COLORS[s.category]}1f`, color: CAT_COLORS[s.category], fontSize: ".9rem" }}><i className={`bi ${s.icon}`} /></span>
        <div>
          <span className="pm-td-strong">{s.name}</span>
          <div className="pm-td-sub mono">{s.id} · {s.tier} · {s.owner}</div>
        </div>
      </div>
    </td>
  );

  return (
    <>
      {/* ============================== Header ============================== */}
      <div className="pm-section-head" style={{ marginTop: 0 }}>
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="pm-eyebrow">Products &amp; Services · Page 20</span>
            <span className="pm-live"><span className="pm-dot green pm-pulse" />{services.filter((s) => s.status !== "Paused").length} services serving traffic</span>
          </div>
          <h2>Service Portfolio</h2>
          <p>
            All 24 PayMo services in one console — catalogue P&amp;L, gateway health against SLA, adoption vs target, dependency
            chains and blast radius, quick-access configuration, sunset programmes and the new-service pipeline. Every action
            is permission-gated, 2FA-verified and written to the audit trail.
          </p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setAuditDrawer(true)}>
            <i className="bi bi-journal-check me-1" />Audit
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setDepDrawer(true)}>
            <i className="bi bi-diagram-3 me-1" />Dependencies
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setCompareOpen(true)}>
            <i className="bi bi-git-compare me-1" />Compare{compareSel.length ? ` (${compareSel.length})` : ""}
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setExportOpen(true)}>
            <i className="bi bi-download me-1" />Export
          </button>
          <Dropdown width={272} trigger={() => <button className="btn btn-outline-secondary btn-sm"><i className="bi bi-three-dots" /></button>}>
            {(close) => (
              <>
                <div className="pm-dd-head">Portfolio desk</div>
                <DDItem icon="bi-person-lock" label="Permissions matrix" hint="Who can configure & pause" onClick={() => { close(); setPermOpen(true); }} />
                <DDItem icon="bi-sliders" label="Configuration console" hint={`${configs.length} quick-access settings`} onClick={() => { close(); setConfigDrawer(true); }} />
                <DDItem icon="bi-rocket-takeoff" label="New service pipeline" hint={`${pipeline.length} proposals · approvals`} onClick={() => { close(); setPipeDrawer(true); }} />
                <DDItem icon="bi-box-arrow-right" label="Retirement planning" hint={`${retirements.length} sunset programmes`} onClick={() => { close(); setRetDrawer(true); }} />
                <div className="pm-dd-sep" />
                <DDItem icon="bi-gear" label="Open Product Configuration" hint="Page 21 · product rules" onClick={() => { close(); onNavigate("product-config"); }} />
                <DDItem icon="bi-arrow-repeat" label="Open Recurring Services" hint="Page 22 · mandates" onClick={() => { close(); onNavigate("recurring"); }} />
                <DDItem icon="bi-credit-card" label="Open Card Programs" hint="Page 23 · card products" onClick={() => { close(); onNavigate("cards"); }} />
                <DDItem icon="bi-lightning-charge" label="Open Utility Services" hint="Page 24 · billers" onClick={() => { close(); onNavigate("utility"); }} />
                <DDItem icon="bi-flag" label="Open Feature Flags" hint="Page 34 · toggles per service" onClick={() => { close(); onNavigate("flags"); }} />
              </>
            )}
          </Dropdown>
          <button className="btn btn-primary btn-sm" onClick={() => setNewSvcWizard(true)}>
            <i className="bi bi-plus-lg me-1" />Propose service
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
                  background: s.tone === "green" ? "#e7f8ef" : s.tone === "red" ? "#fef2f2" : s.tone === "amber" ? "#fff5e6" : s.tone === "violet" ? "#f4f1ff" : "#eff8ff",
                  color: s.tone === "green" ? "#0b8f52" : s.tone === "red" ? "#d92d20" : s.tone === "amber" ? "#b54708" : s.tone === "violet" ? "#5925dc" : "#175cd3",
                }}>
                  <i className={`bi ${s.icon}`} />
                </span>
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
            {t.id === "catalog" && <span className="cnt">{services.length}</span>}
            {t.id === "health" && breached.length > 0 && <span className="cnt" style={{ background: "#fef2f2", color: "#b42318" }}>{breached.length}</span>}
            {t.id === "config" && <span className="cnt">{configs.length}</span>}
          </button>
        ))}
      </div>

      {/* ============================== Tab: catalog ============================== */}
      {tab === "catalog" && (
        <>
          <div className="d-flex gap-2 flex-wrap align-items-center mb-2">
            <div className="pm-search" style={{ maxWidth: 260, minWidth: 200 }}>
              <i className="bi bi-search" />
              <input placeholder="Search 24 services…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="pm-seg green">
              {["All", "Active", "Beta", "Paused", "Sunsetting"].map((b) => (
                <button key={b} className={statusSeg === b ? "active" : ""} onClick={() => setStatusSeg(b)}>{b}</button>
              ))}
            </div>
            <div className="ms-auto pm-td-sub">{filtered.length} of {services.length} services</div>
          </div>
          <div className="d-flex gap-1 flex-wrap mb-2">
            {CATEGORIES.map((c) => (
              <button key={c} className={`pm-chip ${cat === c ? "active" : ""}`} onClick={() => setCat(c)}>
                {c !== "All" && <span className="pm-legend-dot me-1" style={{ background: CAT_COLORS[c] }} />}{c}
                {c !== "All" && <span className="ms-1 pm-td-sub">({services.filter((s) => s.category === c).length})</span>}
              </button>
            ))}
          </div>
          <div className="pm-card mb-3">
            {selected.length > 0 && (
              <div className="pm-bulkbar">
                <i className="bi bi-check2-square" />
                <b>{selected.length} selected</b>
                <button className="btn btn-sm btn-outline-light ms-2" style={{ fontSize: ".72rem" }} disabled={!services.some((s) => selected.includes(s.id) && s.status !== "Sunsetting")} onClick={() => setPauseScope(services.filter((s) => selected.includes(s.id) && s.status !== "Sunsetting"))}>
                  <i className="bi bi-pause-fill me-1" />Pause…
                </button>
                <button className="btn btn-sm btn-outline-light" style={{ fontSize: ".72rem" }} onClick={() => { setCompareSel(selected.slice(0, 3)); setCompareOpen(true); }}>
                  <i className="bi bi-git-compare me-1" />Compare
                </button>
                <button className="btn btn-sm btn-outline-light" style={{ fontSize: ".72rem" }} onClick={() => csvDownload("selected-services.csv", services.filter((s) => selected.includes(s.id)) as unknown as Record<string, unknown>[])}>
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
                    <Th k="name">Service</Th>
                    <Th>Category</Th>
                    <Th>Status</Th>
                    <Th k="users" right>Users</Th>
                    <Th k="revenue" right>Revenue 30d</Th>
                    <Th right>Cost 30d</Th>
                    <Th k="margin" right>Margin</Th>
                    <Th k="growth" right>Growth</Th>
                    <Th>Fee structure</Th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((s) => {
                    const adoption = s.users ? Math.round((s.active30d / s.users) * 100) : 0;
                    return (
                      <tr key={s.id} className={selected.includes(s.id) ? "selected" : ""} style={{ cursor: "pointer" }} onClick={() => setDetailSvc(s)}>
                        <td onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" className="form-check-input" checked={selected.includes(s.id)}
                            onChange={(e) => setSelected((sel) => e.target.checked ? [...sel, s.id] : sel.filter((x) => x !== s.id))} aria-label={`Select ${s.name}`} />
                        </td>
                        <ServiceCell s={s} />
                        <td><Badge tone="grey">{s.category}</Badge></td>
                        <td><Badge tone={svcTone(s.status)} dot>{s.status}</Badge></td>
                        <td className="text-end pm-num">{num(s.users)}<div className="pm-td-sub">{adoption}% active</div></td>
                        <td className="text-end pm-num" style={{ fontWeight: 700 }}>{kesM(s.revenue30d)}{s.revNote && <div className="pm-td-sub">{s.revNote}</div>}</td>
                        <td className="text-end pm-num">{kesM(s.cost30d)}</td>
                        <td className="text-end">{s.margin === null ? <span className="pm-td-sub">—</span> : (
                          <div style={{ minWidth: 78 }}>
                            <span className="pm-num" style={{ fontWeight: 700, color: s.margin >= 75 ? "#0b8f52" : s.margin >= 40 ? "#b54708" : "#b42318" }}>{s.margin}%</span>
                            <Meter value={s.margin} tone={s.margin >= 75 ? "#12b76a" : s.margin >= 40 ? "#f79009" : "#f04438"} width={78} />
                          </div>
                        )}</td>
                        <td className="text-end"><span className={s.growthMom >= 0 ? "pm-trend-up" : "pm-trend-down"}>{s.growthMom >= 0 ? "▲" : "▼"} {Math.abs(s.growthMom)}%</span></td>
                        <td className="pm-td-sub" style={{ whiteSpace: "nowrap" }}>{s.feeStructure}</td>
                        <td className="text-end" onClick={(e) => e.stopPropagation()}>
                          <Dropdown trigger={() => <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".64rem" }}><i className="bi bi-three-dots" /></button>}>
                            {(close) => (
                              <>
                                <div className="pm-dd-head">{s.name}</div>
                                <DDItem icon="bi-box-arrow-in-right" label="Open detail drawer" hint="P&L · health · config · activity" onClick={() => { close(); setDetailSvc(s); }} />
                                <DDItem icon="bi-graph-up-arrow" label="P&L explorer" hint="6-month revenue & margin" onClick={() => { close(); setPnlSvc(s); }} />
                                <DDItem icon="bi-heart-pulse" label="Health console" hint={`uptime ${s.health.uptime}% · ${slaMet(s.health) ? "SLA met" : "SLA breached"}`} onClick={() => { close(); setHealthSvc(s); }} />
                                <DDItem icon="bi-sliders" label="Configure" hint={QUICK_CONFIGS.filter((c) => c.serviceId === s.id).length + " quick settings"} onClick={() => { close(); setCfgFocus(s); setConfigDrawer(true); }} />
                                <DDItem icon="bi-percent" label="Fee structure" hint={s.feeStructure} onClick={() => { close(); setFeeSvc(s); }} />
                                {s.status === "Paused" ? (
                                  <DDItem icon="bi-play-fill" label="Resume service" hint="2FA + go-live note" onClick={() => { close(); setResumeSvc(s); }} />
                                ) : s.status !== "Sunsetting" ? (
                                  <DDItem icon="bi-pause-fill" label="Pause service" danger hint="Wizard · notice + 2FA" onClick={() => { close(); setPauseScope([s]); }} />
                                ) : null}
                                <DDItem icon="bi-git-compare" label="Add to compare" hint={`${compareSel.length}/3 picked`} disabled={compareSel.length >= 3 && !compareSel.includes(s.id)} onClick={() => { close(); setCompareSel((c) => [...c, s.id].slice(0, 3)); setCompareOpen(true); }} />
                                <div className="pm-dd-sep" />
                                <DDItem icon="bi-journal-text" label="Transaction ledger" hint="Page 9 · service-tagged txns" onClick={() => { close(); onNavigate("ledger"); }} />
                                <DDItem icon="bi-flag" label="Feature flags" hint={`Page 34 · ${s.id} toggles`} onClick={() => { close(); onNavigate("flags"); }} />
                                <DDItem icon="bi-activity" label="API health" hint="Page 43 · gateway probes & DLQ" onClick={() => { close(); onNavigate("api-health"); }} />
                              </>
                            )}
                          </Dropdown>
                        </td>
                      </tr>
                    );
                  })}
                  {pageRows.length === 0 && (
                    <tr><td colSpan={11}><EmptyState icon="bi-search" title="No services match" body="Clear the search or category filter." action={<button className="btn btn-sm btn-outline-secondary" onClick={() => { setQ(""); setCat("All"); setStatusSeg("All"); }}>Reset filters</button>} /></td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={pageSize} total={filtered.length} onPage={setPage} onPageSize={() => setPage(1)} />
          </div>
        </>
      )}

      {/* ============================== Tab: health ============================== */}
      {tab === "health" && (
        <>
          {breached.length > 0 && (
            <div className="row g-2 mb-3">
              {breached.map((s) => (
                <div className="col-12 col-xl-4" key={s.id}>
                  <button className="pm-alert-row crit w-100 text-start" style={{ border: "1px solid var(--pm-border)" }} onClick={() => setHealthSvc(s)}>
                    <i className="bi bi-exclamation-octagon-fill" style={{ color: "#f04438", fontSize: "1.1rem" }} />
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: ".8rem" }}>{s.health.gateway} — SLA breached</div>
                      <div className="pm-td-sub">uptime {s.health.uptime}% vs target {s.health.slaTarget}% · errors {s.health.errorRate}% · {s.health.lastIncident}</div>
                    </div>
                    <Badge tone="red">{s.tier}</Badge>
                  </button>
                </div>
              ))}
              <div className="col-12 col-xl-4">
                <button className="pm-qa" style={{ height: "100%" }} onClick={() => setCheckSvc(services[0])}>
                  <i className="bi bi-activity" style={{ color: "#175cd3" }} />
                  <span className="t">Run a synthetic check</span>
                  <span className="s">Probe any gateway now</span>
                </button>
              </div>
            </div>
          )}
          <div className="pm-card mb-3">
            <div className="pm-card-head">
              <div>
                <h3 className="pm-card-title">Service health dashboard</h3>
                <p className="pm-card-sub">Uptime, latency and error rates per gateway vs contracted SLA · 30-day rolling window</p>
              </div>
              <Badge tone={breached.length ? "red" : "green"} dot>{`${services.length - breached.length}/${services.length} gateways on SLA`}</Badge>
            </div>
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Gateway</th><th className="text-end">Uptime 30d</th><th className="text-end">Latency p95</th><th className="text-end">Error rate</th><th className="text-end">SLA target</th><th>SLA status</th><th>Last incident</th><th /></tr></thead>
                <tbody>
                  {[...services].sort((a, b) => (a.health.uptime - a.health.slaTarget) - (b.health.uptime - b.health.slaTarget)).map((s) => (
                    <tr key={s.id} style={{ cursor: "pointer" }} onClick={() => setHealthSvc(s)}>
                      <ServiceCell s={s} />
                      <td className="text-end pm-num" style={{ fontWeight: 700, color: slaMet(s.health) ? "#0b8f52" : "#b42318" }}>{s.health.uptime}%</td>
                      <td className="text-end pm-num">{s.health.latency}</td>
                      <td className="text-end pm-num">{s.health.errorRate}%</td>
                      <td className="text-end pm-num pm-td-sub">{s.health.slaTarget}%</td>
                      <td><Badge tone={slaMet(s.health) ? "green" : "red"} dot>{slaMet(s.health) ? "✓ Met" : "✗ Breached"}</Badge></td>
                      <td className="pm-td-sub">{s.health.lastIncident}</td>
                      <td className="text-end text-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button className="btn btn-sm btn-outline-secondary me-1" style={{ fontSize: ".64rem" }} onClick={() => setCheckSvc(s)}><i className="bi bi-activity me-1" />Probe</button>
                        <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".64rem" }} onClick={() => setSlaSvc(s)}><i className="bi bi-bullseye me-1" />SLA</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pm-table-foot">
              <span>{INCIDENTS.length} incidents recorded in the last 90 days · SEV1 {INCIDENTS.filter((i) => i.severity === "SEV1").length} · SEV2 {INCIDENTS.filter((i) => i.severity === "SEV2").length}</span>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => onNavigate("incident")}>Open incident response (page 19)</button>
            </div>
          </div>
        </>
      )}

      {/* ============================== Tab: adoption ============================== */}
      {tab === "adoption" && (
        <div className="row g-2 mb-3">
          <div className="col-12 col-xxl-8">
            <div className="pm-card h-100">
              <div className="pm-card-head">
                <div>
                  <h3 className="pm-card-title">Service adoption funnel</h3>
                  <p className="pm-card-sub">Active 30d as a share of registered users · growth vs target · click a row for the full funnel</p>
                </div>
                <Badge tone="violet" dot>{services.filter((s) => s.adoptionTarget > 0 && s.users > 0 && s.active30d / s.users >= s.adoptionTarget / 100).length} at/above target</Badge>
              </div>
              <div className="pm-table-wrap">
                <table className="pm-table">
                  <thead><tr><th>Service</th><th className="text-end">Registered</th><th className="text-end">Active 30d</th><th>Adoption vs target</th><th className="text-end">Growth MoM</th><th /></tr></thead>
                  <tbody>
                    {[...services].filter((s) => s.adoptionTarget > 0).sort((a, b) => (b.active30d / b.users) - (a.active30d / a.users)).map((s) => {
                      const adoption = s.users ? Math.round((s.active30d / s.users) * 1000) / 10 : 0;
                      const hit = adoption >= s.adoptionTarget;
                      return (
                        <tr key={s.id} style={{ cursor: "pointer" }} onClick={() => setFunnelSvc(s)}>
                          <ServiceCell s={s} />
                          <td className="text-end pm-num">{num(s.users)}</td>
                          <td className="text-end pm-num" style={{ fontWeight: 700 }}>{num(s.active30d)}</td>
                          <td style={{ minWidth: 190 }}>
                            <div className="d-flex align-items-center gap-2">
                              <span className="pm-num" style={{ fontWeight: 700, width: 46 }}>{adoption}%</span>
                              <Meter value={adoption} tone={hit ? "#12b76a" : "#f79009"} width={120} />
                              <span className="pm-td-sub mono">/ {s.adoptionTarget}%</span>
                              {hit && <Badge tone="green">target ✓</Badge>}
                            </div>
                          </td>
                          <td className="text-end"><span className={s.growthMom >= 0 ? "pm-trend-up" : "pm-trend-down"}>{s.growthMom >= 0 ? "▲" : "▼"} {Math.abs(s.growthMom)}%</span></td>
                          <td className="text-end text-nowrap" onClick={(e) => e.stopPropagation()}>
                            <button className="btn btn-sm btn-outline-secondary me-1" style={{ fontSize: ".64rem" }} onClick={() => setTargetSvc(s)}><i className="bi bi-bullseye me-1" />Target</button>
                            <button className="btn btn-sm btn-outline-primary" style={{ fontSize: ".64rem" }} onClick={() => setFunnelSvc(s)}>Funnel</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="col-12 col-xxl-4 d-flex flex-column gap-2">
            <div className="pm-card pm-card-pad">
              <div className="pm-eyebrow mb-2">Top movers (MoM)</div>
              {movers.map((s) => (
                <div className="pm-kv" key={s.id}>
                  <span className="k" style={{ cursor: "pointer" }} onClick={() => setFunnelSvc(s)}><i className={`bi ${s.icon} me-2`} style={{ color: CAT_COLORS[s.category] }} />{s.name}</span>
                  <span className="v"><span className="pm-trend-up">▲ {s.growthMom}%</span></span>
                </div>
              ))}
            </div>
            <div className="pm-card pm-card-pad">
              <div className="pm-eyebrow mb-2">Furthest from target</div>
              {laggards.map((s) => {
                const adoption = s.users ? Math.round((s.active30d / s.users) * 1000) / 10 : 0;
                return (
                  <div className="pm-kv" key={s.id}>
                    <span className="k" style={{ cursor: "pointer" }} onClick={() => setFunnelSvc(s)}><i className={`bi ${s.icon} me-2`} style={{ color: CAT_COLORS[s.category] }} />{s.name}</span>
                    <span className="v mono" style={{ fontSize: ".72rem", color: "#b54708" }}>{adoption}% / {s.adoptionTarget}%</span>
                  </div>
                );
              })}
            </div>
            <div className="pm-card pm-card-pad">
              <div className="pm-eyebrow mb-2">Activation playbooks</div>
              <button className="pm-qa mb-2" onClick={() => { setFunnelSvc(services[13]); }}><i className="bi bi-lightning-charge" style={{ color: "#b54708" }} /><span className="t">Airtime win-back</span><span className="s">62.4K users · engagement driver</span></button>
              <button className="pm-qa mb-2" onClick={() => { setFunnelSvc(services[5]); }}><i className="bi bi-globe-americas" style={{ color: "#0ba5ec" }} /><span className="t">Corridor push</span><span className="s">45.7% → 50% target</span></button>
              <button className="pm-qa" onClick={() => { setFunnelSvc(services[3]); }}><i className="bi bi-cash-stack" style={{ color: "#7a5af8" }} /><span className="t">ATM fee-free Fridays</span><span className="s">50.9% → 55% target</span></button>
            </div>
          </div>
        </div>
      )}

      {/* ============================== Tab: revenue ============================== */}
      {tab === "revenue" && (
        <div className="row g-2 mb-3">
          <div className="col-12 col-xxl-8">
            <div className="pm-card h-100">
              <div className="pm-card-head">
                <div>
                  <h3 className="pm-card-title">Service revenue trends — 6 months</h3>
                  <p className="pm-card-sub">KES millions per month · click a row for the full P&amp;L explorer with cost &amp; margin</p>
                </div>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setExportOpen(true)}><i className="bi bi-download me-1" />Export</button>
              </div>
              <div className="pm-table-wrap">
                <table className="pm-table">
                  <thead><tr><th>Service</th>{MONTHS.map((m) => <th key={m} className="text-end">{m}</th>)}<th className="text-end">Δ 6M</th><th className="text-end">30d margin</th></tr></thead>
                  <tbody>
                    {[...services].sort((a, b) => b.rev6m[5] - a.rev6m[5]).map((s) => {
                      const delta = s.rev6m[0] ? ((s.rev6m[5] - s.rev6m[0]) / s.rev6m[0]) * 100 : 0;
                      return (
                        <tr key={s.id} style={{ cursor: "pointer" }} onClick={() => setPnlSvc(s)}>
                          <ServiceCell s={s} />
                          {s.rev6m.map((v, i) => (
                            <td key={i} className="text-end pm-num" style={{ fontWeight: i === 5 ? 700 : 400 }}>{v.toFixed(1)}</td>
                          ))}
                          <td className="text-end"><span className={delta >= 0 ? "pm-trend-up" : "pm-trend-down"}>{delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(0)}%</span></td>
                          <td className="text-end"><Badge tone={s.margin === null ? "grey" : s.margin >= 75 ? "green" : s.margin >= 40 ? "amber" : "red"}>{s.margin === null ? "—" : `${s.margin}%`}</Badge></td>
                        </tr>
                      );
                    })}
                    <tr style={{ background: "#fafbfd" }}>
                      <td className="pm-td-strong"><i className="bi bi-calculator me-2" />Portfolio total</td>
                      {monthlyTotals.map((v, i) => <td key={i} className="text-end pm-num" style={{ fontWeight: 800 }}>{v.toFixed(0)}</td>)}
                      <td className="text-end"><span className="pm-trend-up">▲ {((monthlyTotals[5] - monthlyTotals[0]) / monthlyTotals[0] * 100).toFixed(0)}%</span></td>
                      <td className="text-end pm-td-sub">—</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="col-12 col-xxl-4 d-flex flex-column gap-2">
            <div className="pm-card pm-card-pad text-center">
              <div className="pm-eyebrow mb-2 text-start">Revenue mix (30d) · by category</div>
              <div className="d-flex justify-content-center">
                <Donut data={revenueMix} size={172} center={
                  <div>
                    <div className="pm-stat-value">{kesM(services.reduce((s, x) => s + x.revenue30d, 0))}</div>
                    <div className="pm-td-sub">30d revenue</div>
                  </div>
                } />
              </div>
              <div className="d-flex flex-wrap gap-2 justify-content-center mt-2">
                {revenueMix.slice(0, 6).map((r) => (
                  <span key={r.label} className="pm-td-sub"><span className="pm-legend-dot me-1" style={{ background: r.color }} />{r.label} {kesM(r.value)}</span>
                ))}
              </div>
            </div>
            <div className="pm-card pm-card-pad">
              <div className="pm-eyebrow mb-2">Highest margin services</div>
              {[...services].filter((s) => s.margin !== null).sort((a, b) => (b.margin ?? 0) - (a.margin ?? 0)).slice(0, 5).map((s) => (
                <div className="pm-kv" key={s.id}>
                  <span className="k" style={{ cursor: "pointer" }} onClick={() => setPnlSvc(s)}>{s.name}</span>
                  <span className="v mono" style={{ color: "#0b8f52" }}>{s.margin}%</span>
                </div>
              ))}
            </div>
            <div className="pm-card pm-card-pad">
              <div className="pm-eyebrow mb-2">Margin watchlist</div>
              {[...services].filter((s) => s.margin !== null).sort((a, b) => (a.margin ?? 0) - (b.margin ?? 0)).slice(0, 4).map((s) => (
                <div className="pm-kv" key={s.id}>
                  <span className="k" style={{ cursor: "pointer" }} onClick={() => setPnlSvc(s)}>{s.name}</span>
                  <span className="v mono" style={{ color: (s.margin ?? 0) < 40 ? "#b42318" : "#b54708" }}>{s.margin}%</span>
                </div>
              ))}
              <div className="pm-td-sub mt-2">Airtime margin (10.2%) is intentional — top-of-funnel engagement driver.</div>
            </div>
          </div>
        </div>
      )}

      {/* ============================== Tab: dependencies ============================== */}
      {tab === "dependencies" && (
        <>
          <div className="row g-2 mb-2">
            {DEPENDENCY_CHAINS.slice(0, 4).map((c) => (
              <div className="col-12 col-xl-6" key={c.id}>
                <button className="pm-card pm-card-pad w-100 text-start h-100" style={{ borderLeft: `3px solid ${c.tier === "Tier 1" ? "#f04438" : "#f79009"}` }} onClick={() => setDepDetail(c.id)}>
                  <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                    <i className={`bi ${c.icon}`} style={{ color: "#175cd3" }} />
                    <span style={{ fontWeight: 700, fontSize: ".84rem" }}>{c.service}</span>
                    <Badge tone={c.tier === "Tier 1" ? "red" : "amber"}>{c.tier}</Badge>
                    <Badge tone="blue">RTO {c.rto}</Badge>
                    <span className="ms-auto pm-td-sub mono">{num(c.blastRadius)} users in blast radius</span>
                  </div>
                  <div className="d-flex align-items-center flex-wrap gap-1">
                    {c.nodes.map((n, i) => (
                      <span key={n.name} className="d-flex align-items-center gap-1">
                        {i > 0 && <i className="bi bi-arrow-right mx-1" style={{ color: "#98a2b3", fontSize: ".7rem" }} />}
                        <span className="pm-chip" style={{ fontSize: ".68rem", padding: ".14rem .5rem", background: n.kind === "internal" ? "#eef8ff" : n.kind === "processor" ? "#f4f1ff" : "#fff5e6", borderColor: n.kind === "internal" ? "#cfe6ff" : n.kind === "processor" ? "#ded4ff" : "#fde3b8" }}>{n.name}</span>
                      </span>
                    ))}
                  </div>
                </button>
              </div>
            ))}
          </div>
          <div className="d-flex gap-2 flex-wrap mb-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setDepDrawer(true)}><i className="bi bi-diagram-3 me-1" />Open full dependency map ({DEPENDENCY_CHAINS.length} chains)</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setCheckSvc(services[0])}><i className="bi bi-activity me-1" />Run synthetic probe</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => onNavigate("api-health")}><i className="bi bi-broadcast-pin me-1" />API &amp; interconnect health (page 43)</button>
          </div>
        </>
      )}

      {/* ============================== Tab: configuration ============================== */}
      {tab === "config" && (
        <div className="pm-card mb-3">
          <div className="pm-card-head">
            <div>
              <h3 className="pm-card-title">Service configuration quick-access</h3>
              <p className="pm-card-sub">The settings product &amp; ops reach for most · edits need Super Admin + 2FA and a reason</p>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setPermOpen(true)}><i className="bi bi-person-lock me-1" />Permissions</button>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setAuditDrawer(true)}><i className="bi bi-journal-check me-1" />Change log</button>
              <button className="btn btn-sm btn-primary" onClick={() => setConfigDrawer(true)}><i className="bi bi-sliders me-1" />Open console</button>
            </div>
          </div>
          <div className="pm-table-wrap">
            <table className="pm-table">
              <thead><tr><th>Service</th><th>Key config</th><th>Current value</th><th>Access</th><th>Changed</th><th /></tr></thead>
              <tbody>
                {configs.map((c) => (
                  <tr key={c.id} style={{ cursor: c.kind === "edit" ? "pointer" : "default" }} onClick={() => c.kind !== "view" && setEditCfg(c)}>
                    <td className="pm-td-strong">{c.service}</td>
                    <td>{c.key}<div className="pm-td-sub mono">{c.id}{c.validation ? ` · ${c.validation}` : ""}</div></td>
                    <td className="mono" style={{ fontWeight: 700 }}>{c.value}</td>
                    <td><Badge tone={c.kind === "edit" ? "green" : c.kind === "manage" ? "violet" : "grey"} dot>{c.kind === "edit" ? "Editable" : c.kind === "manage" ? "Managed catalog" : "View only"}</Badge></td>
                    <td className="pm-td-sub mono">{c.changed} · {c.changedBy}</td>
                    <td className="text-end" onClick={(e) => e.stopPropagation()}>
                      {c.kind === "view" ? <Badge tone="grey">locked</Badge> : (
                        <button className="btn btn-sm btn-outline-primary" style={{ fontSize: ".66rem" }} onClick={() => setEditCfg(c)}>{c.kind === "manage" ? "Manage" : "Configure"}</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pm-table-foot">
            <span>{configs.length} settings · {configs.filter((c) => c.kind === "view").length} locked · {configs.filter((c) => c.kind === "manage").length} catalogs</span>
            <span className="pm-td-sub">Full rule engine lives in Product Configuration (page 21)</span>
          </div>
        </div>
      )}

      {/* ============================== Tab: sunset & pipeline ============================== */}
      {tab === "sunset" && (
        <>
          <div className="pm-section-head">
            <div>
              <span className="pm-eyebrow">Retirement planning · every user accounted for</span>
              <h3 className="mb-0">Sunset programmes</h3>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setRetDrawer(true)}><i className="bi bi-box-arrow-right me-1" />Open tracker</button>
              <button className="btn btn-primary btn-sm" onClick={() => setRetWizard(true)}><i className="bi bi-plus-lg me-1" />Plan retirement</button>
            </div>
          </div>
          <div className="pm-card mb-3">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Service</th><th>Status</th><th>Reason</th><th>Migration path</th><th>Deadline</th><th className="text-end">Users</th><th>Migration progress</th><th /></tr></thead>
                <tbody>
                  {retirements.map((r) => (
                    <tr key={r.id} style={{ cursor: "pointer" }} onClick={() => setRetDetail(r)}>
                      <td className="pm-td-strong">{r.service}<div className="pm-td-sub mono">{r.id} · {r.commsStage}</div></td>
                      <td><Badge tone={r.status === "Migration" ? "amber" : r.status === "Announced" ? "blue" : "green"} dot>{r.status}</Badge></td>
                      <td className="pm-td-sub" style={{ maxWidth: 220 }}>{r.reason}</td>
                      <td className="pm-td-sub">{r.migration}</td>
                      <td className="mono pm-td-sub">{r.deadline}</td>
                      <td className="text-end pm-num">{num(r.users)}</td>
                      <td style={{ minWidth: 150 }}>
                        <Meter value={r.users ? (r.migrated / r.users) * 100 : 0} tone={r.migrated / r.users >= 0.75 ? "#12b76a" : "#f79009"} width={120} />
                        <div className="pm-td-sub mono">{num(r.migrated)}/{num(r.users)}</div>
                      </td>
                      <td className="text-end text-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button className="btn btn-sm btn-outline-primary" style={{ fontSize: ".66rem" }} onClick={() => setRetDetail(r)}>Plan</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pm-section-head">
            <div>
              <span className="pm-eyebrow">New service pipeline · discovery → GA</span>
              <h3 className="mb-0">Pipeline</h3>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setPipeDrawer(true)}><i className="bi bi-rocket-take-off me-1" />Open pipeline board</button>
              <button className="btn btn-primary btn-sm" onClick={() => setNewSvcWizard(true)}><i className="bi bi-plus-lg me-1" />Propose service</button>
            </div>
          </div>
          <div className="pm-card mb-3">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Service</th><th>Stage</th><th>Target launch</th><th>Owner</th><th>Progress</th><th>Dependencies</th><th>Approvals</th><th /></tr></thead>
                <tbody>
                  {pipeline.map((p) => (
                    <tr key={p.id} style={{ cursor: "pointer" }} onClick={() => setPipeDetail(p)}>
                      <td className="pm-td-strong">{p.name}<div className="pm-td-sub mono">{p.id} · {p.arr}</div></td>
                      <td><Badge tone={p.stage === "Beta" ? "green" : p.stage === "Development" ? "blue" : p.stage === "Submitted" ? "violet" : "grey"} dot>{p.stage}</Badge></td>
                      <td className="pm-td-sub mono">{p.target}</td>
                      <td className="pm-td-sub">{p.owner}</td>
                      <td style={{ minWidth: 140 }}><Meter value={p.progress} tone={p.progress >= 60 ? "#12b76a" : "#f79009"} width={110} /><div className="pm-td-sub mono">{p.progress}%</div></td>
                      <td className="pm-td-sub" style={{ maxWidth: 190 }}>{p.dependencies}</td>
                      <td>
                        <span className="pm-badge green" style={{ marginBottom: 2 }}>{p.approvals.filter((a) => a.state === "Approved").length} ✓</span>{" "}
                        <span className="pm-badge amber">{p.approvals.filter((a) => a.state === "Pending").length} pending</span>
                      </td>
                      <td className="text-end text-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button className="btn btn-sm btn-outline-primary" style={{ fontSize: ".66rem" }} onClick={() => setPipeDetail(p)}>Review</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ============================== Modals & drawers ============================== */}
      <ServiceDetailDrawer
        service={detailSvc ? services.find((s) => s.id === detailSvc.id) ?? null : null}
        onClose={() => setDetailSvc(null)}
        onPnL={(s) => { setDetailSvc(null); setPnlSvc(s); }}
        onConfigure={(s) => { setDetailSvc(null); setCfgFocus(s); setConfigDrawer(true); }}
        onFee={(s) => { setDetailSvc(null); setFeeSvc(s); }}
        onHealth={(s) => { setDetailSvc(null); setHealthSvc(s); }}
        onDependency={(id) => { setDetailSvc(null); setDepDetail(id); }}
        onPause={(s) => { setDetailSvc(null); setPauseScope([s]); }}
        onResume={(s) => { setDetailSvc(null); setResumeSvc(s); }}
        audit={audit}
      />
      <ServicePnLModal service={pnlSvc ? services.find((s) => s.id === pnlSvc.id) ?? null : null} onClose={() => setPnlSvc(null)} />
      <PauseWizard
        open={!!pauseScope} scope={pauseScope ?? []} onClose={() => setPauseScope(null)}
        onDone={(ids, reason, notify) => { doPause(ids, reason, notify); setSelected([]); }}
      />
      <ResumeModal service={resumeSvc ? services.find((s) => s.id === resumeSvc.id) ?? null : null} onClose={() => setResumeSvc(null)} onDone={doResume} />
      <HealthDetailModal
        service={healthSvc ? services.find((s) => s.id === healthSvc.id) ?? null : null}
        onClose={() => setHealthSvc(null)}
        onSla={(s) => { setHealthSvc(null); setSlaSvc(s); }}
        onCheck={(s) => { setHealthSvc(null); setCheckSvc(s); }}
        onIncident={() => { setHealthSvc(null); doIncident("SVC-000", "SLA breach follow-up"); }}
      />
      <SlaEditorModal service={slaSvc ? services.find((s) => s.id === slaSvc.id) ?? null : null} onClose={() => setSlaSvc(null)} onDone={doSla} />
      <SyntheticCheckWizard
        open={!!checkSvc} service={checkSvc} onClose={() => setCheckSvc(null)}
        onIncident={(serviceId, finding) => doIncident(serviceId, finding)}
      />
      <AdoptionDetailModal
        service={funnelSvc ? services.find((s) => s.id === funnelSvc.id) ?? null : null}
        onClose={() => setFunnelSvc(null)}
        onTarget={(s) => { setFunnelSvc(null); setTargetSvc(s); }}
      />
      <AdoptionTargetModal service={targetSvc ? services.find((s) => s.id === targetSvc.id) ?? null : null} onClose={() => setTargetSvc(null)} onDone={doAdoptionTarget} />
      <CompareModal open={compareOpen} services={services} preselect={services.filter((s) => compareSel.includes(s.id))} onClose={() => setCompareOpen(false)} />
      <DependencyDrawer
        open={depDrawer} chains={DEPENDENCY_CHAINS} onClose={() => setDepDrawer(false)}
        onOpen={(id) => { setDepDrawer(false); setDepDetail(id); }}
      />
      <DependencyDetailModal
        chain={depDetail ? DEPENDENCY_CHAINS.find((c) => c.id === depDetail) ?? null : null}
        onClose={() => setDepDetail(null)}
        onCheck={(serviceId) => openCheck(serviceId)}
        onIncident={() => { setDepDetail(null); doIncident("SVC-000", "Dependency chain failure drill"); }}
      />
      <ConfigDrawer
        open={configDrawer} configs={configs} focus={cfgFocus} onClose={() => { setConfigDrawer(false); setCfgFocus(null); }}
        onEdit={(c) => { setConfigDrawer(false); setEditCfg(c); }}
      />
      <ConfigEditModal config={editCfg ? configs.find((c) => c.id === editCfg.id) ?? null : null} onClose={() => setEditCfg(null)} onDone={doConfig} />
      <RetirementDrawer
        open={retDrawer} plans={retirements} onClose={() => setRetDrawer(false)}
        onOpen={(p) => { setRetDrawer(false); setRetDetail(p); }}
        onWizard={() => { setRetDrawer(false); setRetWizard(true); }}
      />
      <RetirementDetailModal plan={retDetail} onClose={() => setRetDetail(null)} onWizard={() => setRetWizard(true)} />
      <RetirementWizard open={retWizard} services={services} onClose={() => setRetWizard(false)} onDone={doRetire} />
      <PipelineDrawer
        open={pipeDrawer} pipeline={pipeline} onClose={() => setPipeDrawer(false)}
        onOpen={(p) => { setPipeDrawer(false); setPipeDetail(p); }}
        onWizard={() => { setPipeDrawer(false); setNewSvcWizard(true); }}
      />
      <PipelineDetailModal item={pipeDetail ? pipeline.find((p) => p.id === pipeDetail.id) ?? null : null} onClose={() => setPipeDetail(null)} onApprove={doApprove} />
      <NewServiceWizard open={newSvcWizard} onClose={() => setNewSvcWizard(false)} onDone={doNewService} />
      <FeeStructureModal service={feeSvc ? services.find((s) => s.id === feeSvc.id) ?? null : null} onClose={() => setFeeSvc(null)} onDone={doFee} />
      <PortfolioExportModal open={exportOpen} services={services} onClose={() => setExportOpen(false)} />
      <PortfolioPermissionsModal open={permOpen} onClose={() => setPermOpen(false)} />
      <PortfolioAuditDrawer open={auditDrawer} audit={audit} onClose={() => setAuditDrawer(false)} />
    </>
  );
}
