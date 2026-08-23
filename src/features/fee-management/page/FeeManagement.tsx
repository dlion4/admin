import { useEffect, useMemo, useState } from "react";
import { Avatar, Badge, DDItem, Donut, Dropdown, EmptyState, Meter, Pagination, useToast } from "../../../components/ui";
import { csvDownload, kes, num } from "../../../lib/format";
import type { ExemptionRequest, FeeOverride, FeeSchedule, PartnerShare, ScheduledChange, TierBand, TierCategory } from "../data/feeData";
import {
  EXEMPTION_REQUESTS, FEE_AUDIT, FEE_FORECASTS, FEE_KPI, FEE_OVERRIDES, FEE_REVENUE_MIX,
  FEE_SCHEDULES, PARTNER_SHARES, SCHEDULED_CHANGES, SIM_SCENARIOS, TIER_BANDS,
} from "../data/feeData";
import {
  ApproveChangeModal, BulkFeesModal, DeactivateFeeModal, ExemptionDecisionModal, ExemptionQueueDrawer,
  FeeChangeWizard, FeeDetailDrawer, FeeExportModal, FeeFilterDrawer, FeeHistoryModal, ForecastModal,
  OverrideDetailModal, OverrideWizard, OverridesDrawer, PartnerShareModal, PartnersDrawer,
  RevokeOverrideModal, RejectChangeModal, ScenarioLibraryModal, ScheduledDrawer, SimulatorWizard,
  TierMatrixModal, rateLabel, EMPTY_FEE_FILTERS, type FeeFilters,
} from "../modals/FeeModals";

const statusTone = (s: string) =>
  s === "Active" || s === "Approved" || s === "Scheduled" ? "green"
    : s === "Pending approval" || s === "Expiring" || s === "Renegotiating" || s === "Draft" ? "amber"
      : s === "Rejected" || s === "Revoked" || s === "Expired" || s === "Suspended" ? "red"
        : "grey";

const methodTone = (m: string) =>
  m === "Percentage" ? "green" : m === "Tiered" ? "blue" : m === "Flat" ? "violet" : m === "Hybrid" ? "amber" : "grey";

const catToneBg = (c: string) =>
  c === "P2P & Wallet" ? "#e7f8ef" : c === "Cash & Agents" ? "#fff5e6" : c === "Cards" ? "#eff8ff"
    : c === "FX & Global" ? "#fdf2fa" : c === "Bills & Utilities" ? "#eff8ff" : c === "Lending" ? "#fef2f2"
      : c === "Banking" ? "#f4f1ff" : "#f2f4f8";
const catToneFg = (c: string) =>
  c === "P2P & Wallet" ? "#0b8f52" : c === "Cash & Agents" ? "#b54708" : c === "Cards" ? "#175cd3"
    : c === "FX & Global" ? "#c11574" : c === "Bills & Utilities" ? "#0b8f52" : c === "Lending" ? "#b42318"
      : c === "Banking" ? "#5925dc" : "#475467";

export function FeeManagement({
  signal, onNavigate,
}: {
  signal: { action: string; n: number };
  onNavigate: (id: string) => void;
}) {
  const { push } = useToast();

  /* ---------------- live state ---------------- */
  const [schedules, setSchedules] = useState<FeeSchedule[]>(FEE_SCHEDULES);
  const [overrides, setOverrides] = useState<FeeOverride[]>(FEE_OVERRIDES);
  const [changes, setChanges] = useState<ScheduledChange[]>(SCHEDULED_CHANGES);
  const [tiers, setTiers] = useState<TierBand[]>(TIER_BANDS);
  const [partners, setPartners] = useState<PartnerShare[]>(PARTNER_SHARES);
  const [requests, setRequests] = useState<ExemptionRequest[]>(EXEMPTION_REQUESTS);

  /* ---------------- table state ---------------- */
  const [filters, setFilters] = useState<FeeFilters>(EMPTY_FEE_FILTERS);
  const [tab, setTab] = useState("All");
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [sort, setSort] = useState<{ key: keyof FeeSchedule; dir: 1 | -1 }>({ key: "revenue30d", dir: -1 });

  /* ---------------- modal state ---------------- */
  const [detailFee, setDetailFee] = useState<FeeSchedule | null>(null);
  const [editFee, setEditFee] = useState<FeeSchedule | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [simFee, setSimFee] = useState<FeeSchedule | null>(null);
  const [simOpen, setSimOpen] = useState(false);
  const [tiersOpen, setTiersOpen] = useState(false);
  const [overridesOpen, setOverridesOpen] = useState(false);
  const [ovDetail, setOvDetail] = useState<FeeOverride | null>(null);
  const [ovRevoke, setOvRevoke] = useState<FeeOverride | null>(null);
  const [ovWizard, setOvWizard] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [decision, setDecision] = useState<{ r: ExemptionRequest; mode: "approve" | "deny" } | null>(null);
  const [schedOpen, setSchedOpen] = useState(false);
  const [approveC, setApproveC] = useState<ScheduledChange | null>(null);
  const [rejectC, setRejectC] = useState<ScheduledChange | null>(null);
  const [deactFee, setDeactFee] = useState<FeeSchedule | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [partnersOpen, setPartnersOpen] = useState(false);
  const [partnerEdit, setPartnerEdit] = useState<PartnerShare | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [historyFee, setHistoryFee] = useState<FeeSchedule | null>(null);
  const [forecastOpen, setForecastOpen] = useState(false);
  const [scenariosOpen, setScenariosOpen] = useState(false);

  /* ---------------- shell signal bridge ---------------- */
  useEffect(() => {
    if (!signal.n) return;
    if (signal.action === "fees") { setEditFee(null); setWizardOpen(true); }
  }, [signal]);

  /* ---------------- derived ---------------- */
  const filtered = useMemo(() => {
    let rows = schedules;
    if (tab !== "All") rows = rows.filter((f) => f.status === tab);
    if (filters.q) {
      const q = filters.q.toLowerCase();
      rows = rows.filter((f) => (f.id + f.name + f.category + f.appliesTo + f.channels).toLowerCase().includes(q));
    }
    if (filters.category !== "all") rows = rows.filter((f) => f.category === filters.category);
    if (filters.method !== "all") rows = rows.filter((f) => f.method === filters.method);
    if (filters.status !== "all") rows = rows.filter((f) => f.status === filters.status);
    if (filters.appliesTo !== "all") {
      if (filters.appliesTo === "tiered") rows = rows.filter((f) => f.appliesTo.includes("tiered"));
      else if (filters.appliesTo === "business") rows = rows.filter((f) => f.appliesTo.includes("Business"));
      else if (filters.appliesTo === "vip") rows = rows.filter((f) => f.appliesTo.includes("VIP") || f.appliesTo.includes("request"));
      else rows = rows.filter((f) => f.appliesTo === filters.appliesTo);
    }
    if (filters.minRevenue > 0) rows = rows.filter((f) => f.revenue30d >= filters.minRevenue);
    return [...rows].sort((a, b) => {
      const av = a[sort.key]; const bv = b[sort.key];
      return (typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv))) * sort.dir;
    });
  }, [schedules, filters, tab, sort]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const activeFilterCount = Object.entries(filters).filter(([k, v]) =>
    k === "q" ? Boolean(v) : typeof v === "number" ? v > 0 : v !== "all"
  ).length;

  const pending = changes.filter((c) => c.status === "Pending approval");
  const activeOverrides = overrides.filter((o) => o.status === "Active" || o.status === "Expiring");
  const waivedMonthly = activeOverrides.reduce((s, o) => s + o.monthlyValue, 0);
  const totalRevenue = FEE_REVENUE_MIX.reduce((s, r) => s + r.value, 0);
  const kpi = FEE_KPI({
    revenue: totalRevenue, active: schedules.filter((f) => f.status === "Active").length,
    pending: pending.length, overrides: activeOverrides.length,
    waived: waivedMonthly, requests: requests.length,
  });

  const tabs = ["All", "Active", "Scheduled", "Draft", "Inactive"];
  const sortBy = (key: keyof FeeSchedule) => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : -1 }));
  const updateFee = (id: string, patch: Partial<FeeSchedule>) =>
    setSchedules((list) => list.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  /* ---------------- handlers ---------------- */
  const submitChange = (c: ScheduledChange, fee?: FeeSchedule) => {
    setChanges((list) => [c, ...list]);
    if (fee) updateFee(fee.id, { nextChange: c.id });
  };
  const approveChange = (c: ScheduledChange) => {
    setChanges((list) => list.map((x) => x.id === c.id
      ? { ...x, status: "Scheduled", approvals: { role: x.approvals.role, by: "Joseph Mwangi", at: "Just now" } } : x));
  };
  const rejectChange = (c: ScheduledChange, reason: string) => {
    setChanges((list) => list.map((x) => x.id === c.id
      ? { ...x, status: "Rejected", impact: `Rejected (${reason}) · ${x.impact}`, approvals: { role: x.approvals.role, by: "Joseph Mwangi", at: "Just now" } } : x));
    updateFee(c.feeId, { nextChange: undefined });
  };
  const withdrawChange = (c: ScheduledChange) => {
    setChanges((list) => list.map((x) => (x.id === c.id ? { ...x, status: "Withdrawn" } : x)));
    updateFee(c.feeId, { nextChange: undefined });
    push({ kind: "info", title: `${c.id} withdrawn`, body: "Change pulled before effective date — no user impact." });
  };
  const decideExemption = (r: ExemptionRequest, note: string) => {
    setRequests((list) => list.filter((x) => x.id !== r.id));
    if (decision?.mode === "approve") {
      setOverrides((list) => [{
        id: `OVR-${3200 + Math.floor(Math.random() * 90)}`,
        userId: r.userId, userName: r.userName, segment: r.segment,
        feeId: "FEE-001", feeName: r.feeName, standard: "Standard rate", override: r.ask,
        discountPct: 50, reason: `${r.justification} — ${note || "approved via queue"}`,
        grantedBy: "Joseph Mwangi", approvedBy: "Joseph Mwangi (self, Tier 0)",
        grantedAt: "Just now", expires: "+6 months", status: "Active", monthlyValue: r.monthlyValue,
      }, ...list]);
    }
  };
  const cloneAsDraft = (f: FeeSchedule) => {
    const id = `FEE-${String(100 + schedules.length + 1).padStart(3, "0")}`;
    setSchedules((list) => [{ ...f, id, name: `${f.name} (draft copy)`, status: "Draft", revenue30d: 0, txns30d: 0, lastChanged: "Draft · just now", changedBy: "Joseph Mwangi", nextChange: undefined }, ...list]);
    push({ kind: "info", title: `${id} drafted`, body: `Clone of ${f.id} — edit and submit when ready.` });
    setTab("Draft");
  };
  const bulkAction = (action: string) => {
    if (action === "export") {
      csvDownload("selected-fees.csv", schedules.filter((f) => selected.includes(f.id)) as unknown as Record<string, unknown>[]);
      push({ kind: "success", title: "Selection exported" });
    } else if (action === "clone") {
      const drafts = schedules.filter((f) => selected.includes(f.id)).map((f, i) => ({
        ...f, id: `FEE-${String(100 + schedules.length + i + 1).padStart(3, "0")}`,
        name: `${f.name} (draft copy)`, status: "Draft" as const, revenue30d: 0, txns30d: 0,
        lastChanged: "Draft · just now", changedBy: "Joseph Mwangi", nextChange: undefined,
      }));
      setSchedules((list) => [...drafts, ...list]);
      push({ kind: "info", title: `${drafts.length} drafts created`, body: "Cloned into the registry with zeroed revenue." });
      setTab("Draft");
    } else if (action === "deactivate") {
      setSchedules((list) => list.map((f) => selected.includes(f.id) ? { ...f, status: "Inactive", nextChange: undefined } : f));
      push({ kind: "warn", title: `${selected.length} fee lines deactivated` });
    } else if (action === "schedule") {
      setEditFee(schedules.find((f) => selected.includes(f.id)) ?? null);
      setWizardOpen(true);
    }
    setSelected([]);
  };
  const openDecide = (r: ExemptionRequest, mode: "approve" | "deny") => setDecision({ r, mode });

  return (
    <>
      {/* ============================== Header ============================== */}
      <div className="pm-section-head" style={{ marginTop: 0 }}>
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="pm-eyebrow">Transactions & finance · Page 10</span>
            <span className="pm-live"><span className="pm-dot green pm-pulse" />PRICING ENGINE v3.2</span>
          </div>
          <h2>Fee & Charge Management</h2>
          <p>
            Every price on the platform — fee schedules, volume tiers, waivers, overrides, partner splits and the
            effective-dated approval pipeline. Nothing changes price without dual Tier-0 control and 2FA.
          </p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setFilterOpen(true)}>
            <i className="bi bi-funnel me-1" />Filters
            {activeFilterCount > 0 && <Badge tone="green">{activeFilterCount}</Badge>}
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setTiersOpen(true)}>
            <i className="bi bi-table me-1" />Tier matrix
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setOverridesOpen(true)}>
            <i className="bi bi-person-check me-1" />Overrides ({activeOverrides.length})
          </button>
          <button className="btn btn-outline-secondary btn-sm position-relative" onClick={() => setSchedOpen(true)}>
            <i className="bi bi-calendar2-week me-1" />Pipeline
            {pending.length > 0 && <span className="pm-nav-pill" style={{ position: "absolute", top: -6, right: -6 }}>{pending.length}</span>}
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setExportOpen(true)}>
            <i className="bi bi-download me-1" />Export
          </button>
          <Dropdown width={250} trigger={() => <button className="btn btn-outline-secondary btn-sm"><i className="bi bi-three-dots" /></button>}>
            {(close) => (
              <>
                <div className="pm-dd-head">Pricing tools</div>
                <DDItem icon="bi-calculator" label="Fee impact simulator" hint="Elasticity model" onClick={() => { close(); setSimFee(null); setSimOpen(true); }} />
                <DDItem icon="bi-collection" label="Saved scenarios" hint="Board review library" onClick={() => { close(); setScenariosOpen(true); }} />
                <DDItem icon="bi-graph-up-arrow" label="Revenue forecast" onClick={() => { close(); setForecastOpen(true); }} />
                <DDItem icon="bi-inbox-fill" label="Exemption queue" hint={`${requests.length} open · ${requests.filter((r) => r.sla.includes("Overdue")).length} overdue`} onClick={() => { close(); setQueueOpen(true); }} />
                <div className="pm-dd-sep" />
                <DDItem icon="bi-handshake" label="Partner fee sharing" onClick={() => { close(); setPartnersOpen(true); }} />
                <DDItem icon="bi-journal-text" label="Open Transaction Ledger" hint="Page 9 · fee postings" onClick={() => { close(); onNavigate("ledger"); }} />
                <DDItem icon="bi-gem" label="Open VIP Clients" hint="Page 8 · tier pricing" onClick={() => { close(); onNavigate("vip"); }} />
                <DDItem icon="bi-arrow-left-right" label="Settlement & reconciliation" hint="Page 11" onClick={() => { close(); onNavigate("settlement"); }} />
              </>
            )}
          </Dropdown>
          <button className="btn btn-primary btn-sm" onClick={() => { setEditFee(null); setWizardOpen(true); }}>
            <i className="bi bi-plus-lg me-1" />New fee change
          </button>
        </div>
      </div>

      {/* ============================== KPI strip ============================== */}
      <div className="row g-2 mb-3">
        {kpi.map((s) => (
          <div className="col-6 col-md-3 col-xxl-3" key={s.label}>
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

      {/* ============================== Mix + benchmark + tiers ============================== */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-xl-4">
          <div className="pm-card h-100">
            <div className="pm-card-head">
              <div>
                <h6 className="pm-card-title">Fee revenue mix — 30 days</h6>
                <p className="pm-card-sub">Click a slice legend to filter the schedule</p>
              </div>
              <Badge tone="green">{kes(totalRevenue, { compact: true })}</Badge>
            </div>
            <div className="pm-card-pad">
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <Donut data={FEE_REVENUE_MIX} size={150} thickness={22} center={
                  <div>
                    <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1.05rem" }}>{kes(totalRevenue / 1_000_000, { decimals: 0 })}M</div>
                    <div style={{ fontSize: ".62rem", color: "var(--pm-muted)", fontWeight: 700 }}>TOTAL FEES</div>
                  </div>
                } />
                <div className="flex-grow-1 d-flex flex-column gap-1" style={{ minWidth: 190 }}>
                  {FEE_REVENUE_MIX.map((r) => (
                    <button key={r.label} className="pm-dd-item p-1" onClick={() => { setFilters({ ...filters, category: r.label === "PesaLink & banking" ? "Banking" : r.label === "FX & international" ? "FX & Global" : r.label === "Platform & other" ? "Platform" : r.label === "Card payments" ? "Cards" : r.label === "Internal transfer" ? "P2P & Wallet" : r.label === "M-Pesa cash-out" ? "Cash & Agents" : "Bills & Utilities" }); setPage(1); }}>
                      <span className="pm-legend-dot me-1" style={{ background: r.color }} />
                      <span className="flex-grow-1" style={{ fontSize: ".76rem", fontWeight: 600 }}>{r.label}</span>
                      <span className="pm-num" style={{ fontSize: ".72rem" }}>{kes(r.value, { compact: true })}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="pm-card h-100">
            <div className="pm-card-head">
              <div>
                <h6 className="pm-card-title">Competitive benchmark</h6>
                <p className="pm-card-sub">PayMo headline rate vs market · click to inspect the fee</p>
              </div>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setScenariosOpen(true)}>Scenarios</button>
            </div>
            <div className="pm-card-pad d-flex flex-column gap-2">
              {FEE_SCHEDULES.filter((f) => f.competitor > 0 && (f.method === "Percentage" || f.method === "Tiered" || f.method === "Hybrid")).slice(0, 6).map((f) => {
                const below = f.rate <= f.competitor;
                return (
                  <button key={f.id} className="border-0 bg-transparent text-start w-100" style={{ borderRadius: 10, padding: ".35rem .4rem" }} onClick={() => setDetailFee(f)}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span style={{ fontWeight: 700, fontSize: ".76rem" }}>{f.name.split(" (")[0]}</span>
                      <span className="pm-num" style={{ fontSize: ".72rem", fontWeight: 700 }}>
                        {f.rate}% <i className="bi bi-arrow-right-short" style={{ opacity: .5 }} /> {f.competitor}%
                        <Badge tone={below ? "green" : "red"} className="ms-1">{below ? "below" : "above"}</Badge>
                      </span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <Meter value={(f.rate / Math.max(f.rate, f.competitor)) * 100} tone="#12b76a" width={90} />
                      <Meter value={(f.competitor / Math.max(f.rate, f.competitor)) * 100} tone="#98a2b3" width={90} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="pm-card h-100">
            <div className="pm-card-head">
              <div>
                <h6 className="pm-card-title">Volume tier bands</h6>
                <p className="pm-card-sub">Monthly volume pricing · {num(tiers.reduce((s, t) => s + t.users, 0))} users banded</p>
              </div>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setTiersOpen(true)}>
                <i className="bi bi-pencil-square me-1" />Edit
              </button>
            </div>
            <div className="pm-card-pad">
              <div className="d-flex flex-column gap-1">
                {tiers.map((t, i) => (
                  <button key={t.band} className="pm-dd-item" onClick={() => setTiersOpen(true)}>
                    <span className="pm-avatar sm" style={{ background: ["#12b76a", "#0b8f52", "#2e90fa", "#7a5af8", "#101828"][i] }}>{i + 1}</span>
                    <span className="flex-grow-1">
                      <span className="d-block" style={{ fontWeight: 700, fontSize: ".78rem" }}>{t.volume}</span>
                      <span className="d-block pm-td-sub">{num(t.users)} users · transfers from {t.rates["Internal transfer"]}</span>
                    </span>
                    <i className="bi bi-chevron-right" style={{ fontSize: ".7rem", color: "#c3cbd9" }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================== Fee schedule table ============================== */}
      <div className="pm-section-head">
        <div>
          <h2>Fee schedule registry</h2>
          <p>Every chargeable line on the platform — {schedules.length} schedules. Row click opens the full pricing dossier; the ⋮ menu carries every super-admin action.</p>
        </div>
        {selected.length > 0 && (
          <button className="btn btn-outline-primary btn-sm" onClick={() => setBulkOpen(true)}>
            <i className="bi bi-check2-square me-1" />Bulk action ({selected.length})
          </button>
        )}
      </div>

      <div className="pm-card mb-3">
        <div className="pm-tabs">
          {tabs.map((t) => (
            <button key={t} className={`pm-tab ${tab === t ? "active" : ""}`} onClick={() => { setTab(t); setPage(1); }}>
              {t}
              <span className="cnt">{t === "All" ? schedules.length : schedules.filter((f) => f.status === t).length}</span>
            </button>
          ))}
        </div>
        <div className="pm-card-head">
          <div className="pm-search flex-grow-1" style={{ maxWidth: 420 }}>
            <i className="bi bi-search" />
            <input placeholder="Fee name, ID, category, channel…" value={filters.q}
              onChange={(e) => { setFilters({ ...filters, q: e.target.value }); setPage(1); }} />
          </div>
          <div className="d-flex gap-2 align-items-center">
            <span style={{ fontSize: ".75rem", color: "var(--pm-muted)" }}>{num(filtered.length)} lines</span>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setFilterOpen(true)} title="Advanced filters"><i className="bi bi-funnel" /></button>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => { setSimFee(null); setSimOpen(true); }} title="Simulator"><i className="bi bi-calculator" /></button>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="d-flex gap-1 flex-wrap p-2 pb-0">
            {filters.category !== "all" && <button className="pm-chip active" onClick={() => setFilters({ ...filters, category: "all" })}>{filters.category} ✕</button>}
            {filters.method !== "all" && <button className="pm-chip active" onClick={() => setFilters({ ...filters, method: "all" })}>{filters.method} ✕</button>}
            {filters.status !== "all" && <button className="pm-chip active" onClick={() => setFilters({ ...filters, status: "all" })}>{filters.status} ✕</button>}
            {filters.minRevenue > 0 && <button className="pm-chip active" onClick={() => setFilters({ ...filters, minRevenue: 0 })}>Revenue ≥ {kes(filters.minRevenue, { compact: true })} ✕</button>}
            <button className="pm-chip" onClick={() => { setFilters(EMPTY_FEE_FILTERS); setTab("All"); }}>Clear all</button>
          </div>
        )}

        {selected.length > 0 && (
          <div className="pm-bulkbar">
            <b style={{ fontSize: ".82rem" }}>{selected.length} selected</b>
            <button className="btn btn-sm btn-light" onClick={() => setBulkOpen(true)}><i className="bi bi-lightning-charge me-1" />Bulk action</button>
            <button className="btn btn-sm btn-light" onClick={() => {
              csvDownload("selected-fees.csv", schedules.filter((f) => selected.includes(f.id)) as unknown as Record<string, unknown>[]);
              push({ kind: "success", title: "Selection exported" });
            }}>
              <i className="bi bi-download me-1" />Export
            </button>
            <button className="btn btn-sm btn-outline-light ms-auto" onClick={() => setSelected([])}>Clear</button>
          </div>
        )}

        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead>
              <tr>
                <th style={{ width: 34 }}>
                  <input type="checkbox" className="form-check-input" checked={paged.length > 0 && selected.length === paged.length}
                    onChange={(e) => setSelected(e.target.checked ? paged.map((x) => x.id) : [])} />
                </th>
                {([
                  ["name", "Fee line"], ["method", "Method / rate"], ["minFee", "Floor / cap"],
                  ["revenue30d", "Revenue 30d"], ["txns30d", "Txns 30d"], ["effectiveRate", "Eff. rate"],
                  ["appliesTo", "Applies to"], ["status", "Status"], ["lastChanged", "Changed"],
                ] as const).map(([k, l]) => (
                  <th key={k} className={`${k === "revenue30d" || k === "txns30d" || k === "effectiveRate" || k === "minFee" ? "text-end " : ""}cursor-pointer`} onClick={() => sortBy(k)}>
                    {l} {sort.key === k && <i className={`bi bi-caret-${sort.dir === 1 ? "up" : "down"}-fill`} style={{ fontSize: ".55rem" }} />}
                  </th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {paged.map((f) => (
                <tr key={f.id} className={selected.includes(f.id) ? "selected" : ""} onClick={() => setDetailFee(f)}>
                  <td onClick={(ev) => ev.stopPropagation()}>
                    <input type="checkbox" className="form-check-input" checked={selected.includes(f.id)}
                      onChange={(ev) => setSelected(ev.target.checked ? [...selected, f.id] : selected.filter((x) => x !== f.id))} />
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span className="pm-avatar sm" style={{ background: catToneBg(f.category), color: catToneFg(f.category) }}><i className={`bi ${f.icon}`} /></span>
                      <div>
                        <div className="pm-td-strong" style={{ fontSize: ".78rem" }}>{f.name}</div>
                        <div className="pm-td-sub mono">{f.id} · {f.category} · {f.channels}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge tone={methodTone(f.method)}>{f.method}</Badge>
                    <div className="pm-td-sub mono">{rateLabel(f)}</div>
                  </td>
                  <td className="text-end">
                    <span className="pm-num">{f.minFee ? kes(f.minFee) : "—"}</span>
                    <div className="pm-td-sub">{f.maxFee ? `cap ${kes(f.maxFee)}` : "no cap"}</div>
                  </td>
                  <td className="text-end">
                    <span className="pm-num" style={{ fontWeight: 700 }}>{f.revenue30d ? kes(f.revenue30d, { compact: true }) : <span style={{ color: "var(--pm-muted)" }}>—</span>}</span>
                    {f.revenue30d > 0 && <div className="pm-td-sub">avg {kes(Math.round(f.revenue30d / Math.max(1, f.txns30d)))}</div>}
                  </td>
                  <td className="text-end pm-num">{num(f.txns30d)}</td>
                  <td className="text-end">
                    {f.method === "Percentage" || f.method === "Tiered" || f.method === "Hybrid" ? (
                      <div className="d-flex align-items-center gap-2 justify-content-end">
                        <Meter value={Math.min(100, f.effectiveRate * 30)} tone={f.effectiveRate <= f.competitor ? "#12b76a" : "#f04438"} width={40} />
                        <span className="pm-num">{f.effectiveRate}%</span>
                      </div>
                    ) : <span style={{ color: "var(--pm-muted)", fontSize: ".74rem" }}>n/a</span>}
                  </td>
                  <td><span style={{ fontSize: ".76rem", fontWeight: 600 }}>{f.appliesTo}</span>
                    {f.overrides > 0 && <div className="pm-td-sub">{f.overrides} overrides</div>}
                  </td>
                  <td>
                    <Badge tone={statusTone(f.status)} dot>{f.status}</Badge>
                    {f.nextChange && <div className="pm-td-sub" style={{ color: "#b54708" }}>change pending</div>}
                  </td>
                  <td><span style={{ fontSize: ".74rem" }}>{f.lastChanged}</span></td>
                  <td className="text-end" onClick={(ev) => ev.stopPropagation()}>
                    <Dropdown up width={250} trigger={() => (
                      <button className="pm-icon-btn" style={{ width: 28, height: 28 }}><i className="bi bi-three-dots-vertical" /></button>
                    )}>
                      {(close) => (
                        <>
                          <DDItem icon="bi-eye" label="Open pricing dossier" onClick={() => { close(); setDetailFee(f); }} />
                          <DDItem icon="bi-calculator" label="Simulate change" onClick={() => { close(); setSimFee(f); setSimOpen(true); }} />
                          <DDItem icon="bi-pencil-square" label="Change fee" hint="5-step · 2FA" onClick={() => { close(); setEditFee(f); setWizardOpen(true); }} />
                          <DDItem icon="bi-clock-history" label="Change history" onClick={() => { close(); setHistoryFee(f); }} />
                          <DDItem icon="bi-copy" label="Clone as draft" onClick={() => { close(); cloneAsDraft(f); }} />
                          <DDItem icon="bi-person-check" label="Grant override on this fee" onClick={() => { close(); setOvWizard(true); }} />
                          <div className="pm-dd-sep" />
                          <DDItem icon="bi-slash-circle" label="Deactivate" hint="2FA · stops accrual" danger disabled={f.status !== "Active"} onClick={() => { close(); setDeactFee(f); }} />
                          <div className="pm-dd-sep" />
                          <DDItem icon="bi-journal-text" label="See postings (Page 9)" onClick={() => { close(); onNavigate("ledger"); }} />
                        </>
                      )}
                    </Dropdown>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={11}>
                    <EmptyState icon="bi-search" title="No fee lines match" body="Widen the filters or clear the status tab."
                      action={<button className="btn btn-outline-secondary btn-sm" onClick={() => { setFilters(EMPTY_FEE_FILTERS); setTab("All"); }}>Clear filters</button>} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pageSize={pageSize} total={filtered.length} onPage={setPage} onPageSize={setPageSize} />
      </div>

      {/* ============================== Pipeline + queue + forecast ============================== */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-xl-5">
          <div className="pm-card h-100">
            <div className="pm-card-head">
              <div>
                <h6 className="pm-card-title">Approval pipeline</h6>
                <p className="pm-card-sub">{pending.length} changes awaiting Tier-0 · {changes.filter((c) => c.status === "Scheduled").length} scheduled</p>
              </div>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setSchedOpen(true)}>Open pipeline</button>
            </div>
            <div className="pm-card-pad d-flex flex-column gap-2">
              {pending.slice(0, 4).map((c) => (
                <div key={c.id} className="pm-alert-row warn">
                  <i className="bi bi-calendar2-week" style={{ color: "#b54708", marginTop: 2 }} />
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span className="mono" style={{ fontWeight: 700, fontSize: ".76rem" }}>{c.id}</span>
                      <span style={{ fontWeight: 700, fontSize: ".78rem" }}>{c.feeName}</span>
                    </div>
                    <div className="pm-td-sub mono">{c.current} → {c.proposed}</div>
                    <div className="pm-td-sub">{c.impact}</div>
                  </div>
                  <div className="d-flex flex-column gap-1">
                    <button className="btn btn-sm btn-primary" style={{ fontSize: ".68rem" }} onClick={() => setApproveC(c)}>Approve</button>
                    <button className="btn btn-sm btn-outline-danger" style={{ fontSize: ".68rem" }} onClick={() => setRejectC(c)}>Reject</button>
                  </div>
                </div>
              ))}
              {pending.length === 0 && <EmptyState icon="bi-check2-circle" title="Pipeline clear" body="No fee changes awaiting approval." />}
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-3">
          <div className="pm-card h-100">
            <div className="pm-card-head">
              <div>
                <h6 className="pm-card-title">Exemption queue</h6>
                <p className="pm-card-sub">{requests.filter((r) => r.sla.includes("Overdue")).length} overdue · SLA-tracked</p>
              </div>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setQueueOpen(true)}>All</button>
            </div>
            <div className="pm-card-pad d-flex flex-column gap-2">
              {requests.slice(0, 3).map((r) => (
                <button key={r.id} className={`pm-alert-row text-start w-100 ${r.sla.includes("Overdue") ? "crit" : "info"}`} style={{ cursor: "pointer" }} onClick={() => openDecide(r, "approve")}>
                  <Avatar name={r.userName} size="sm" />
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: ".76rem" }}>{r.userName}</div>
                    <div className="pm-td-sub">{r.feeName} → {r.ask}</div>
                    <div className="pm-td-sub mono">{r.sla} · {r.rm}</div>
                  </div>
                </button>
              ))}
              {requests.length === 0 && <EmptyState icon="bi-check2-circle" title="Queue clear" body="All exemptions decided." />}
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="pm-card h-100">
            <div className="pm-card-head">
              <div>
                <h6 className="pm-card-title">Revenue forecast</h6>
                <p className="pm-card-sub">Elasticity-adjusted · nightly recalc</p>
              </div>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setForecastOpen(true)}>Detail</button>
            </div>
            <div className="pm-card-pad">
              <div className="d-flex align-items-end gap-2 mb-2" style={{ height: 84 }}>
                {[62, 66, 70, 74, 78, 82, 86, 91].map((h, i) => (
                  <div key={i} className="flex-grow-1 rounded-top" title={`Month ${i + 1}`}
                    style={{ height: `${h}%`, background: i < 3 ? "#c9e9d8" : "var(--pm-green)" }} />
                ))}
              </div>
              <div className="pm-kv">
                <span className="k">Current month</span>
                <span className="v mono">{kes(FEE_FORECASTS.reduce((s, f) => s + f.current, 0), { compact: true })}</span>
              </div>
              <div className="pm-kv">
                <span className="k">+3 months (proj)</span>
                <span className="v mono" style={{ color: "#0b8f52" }}>{kes(FEE_FORECASTS.reduce((s, f) => s + f.threeMonth, 0), { compact: true })}</span>
              </div>
              <div className="pm-kv">
                <span className="k">Growth</span>
                <span className="v mono" style={{ color: "#0b8f52" }}>
                  +{(((FEE_FORECASTS.reduce((s, f) => s + f.threeMonth, 0) - FEE_FORECASTS.reduce((s, f) => s + f.current, 0)) / FEE_FORECASTS.reduce((s, f) => s + f.current, 0)) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================== Partner table + audit ============================== */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-xl-7">
          <div className="pm-section-head">
            <div>
              <h2>Partner fee sharing</h2>
              <p>Revenue-split agreements with rails and billers — {kes(partners.reduce((s, p) => s + p.value30d, 0), { compact: true })} shared in 30 days.</p>
            </div>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setPartnersOpen(true)}>
              <i className="bi bi-box-arrow-up-right me-1" />Registry
            </button>
          </div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead>
                  <tr><th>Partner</th><th>Fee stream</th><th>Split (PayMo)</th><th className="text-end">Value 30d</th><th>Settlement</th><th>Status</th><th /></tr>
                </thead>
                <tbody>
                  {partners.slice(0, 6).map((p) => (
                    <tr key={p.id} onClick={() => setPartnerEdit(p)}>
                      <td className="pm-td-strong">{p.partner}</td>
                      <td className="pm-td-sub">{p.feeType}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <Meter value={p.paymoShare} tone="#7a5af8" width={56} />
                          <span className="pm-num" style={{ fontWeight: 700 }}>{p.paymoShare}%</span>
                        </div>
                      </td>
                      <td className="text-end pm-num">{p.value30d ? kes(p.value30d, { compact: true }) : "—"}</td>
                      <td><Badge tone="grey">{p.settlement}</Badge></td>
                      <td><Badge tone={statusTone(p.status)} dot>{p.status}</Badge></td>
                      <td className="text-end" onClick={(e) => e.stopPropagation()}>
                        <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".68rem" }} onClick={() => setPartnerEdit(p)}>
                          <i className="bi bi-sliders" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pm-table-foot">
              <span>{partners.length} agreements · next review {partners.find((p) => p.status === "Renegotiating")?.nextReview ?? "Oct 2026"}</span>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setPartnersOpen(true)}>Manage all</button>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-5">
          <div className="pm-section-head">
            <div>
              <h2>Pricing audit trail</h2>
              <p>Dual-controlled, immutable, retained 7 years.</p>
            </div>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => {
              csvDownload("fee-audit.csv", FEE_AUDIT as unknown as Record<string, unknown>[]);
              push({ kind: "success", title: "Audit exported" });
            }}>
              <i className="bi bi-download" />
            </button>
          </div>
          <div className="pm-card">
            <div className="p-2 d-flex flex-column gap-2" style={{ maxHeight: 380, overflowY: "auto" }}>
              {FEE_AUDIT.map((a) => (
                <div key={a.id} className="pm-alert-row info">
                  <Avatar name={a.admin} size="sm" />
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: ".78rem" }}>{a.action}</div>
                    <div className="pm-td-sub">{a.detail}</div>
                    <div className="d-flex gap-2 mt-1 flex-wrap">
                      <span className="mono" style={{ fontSize: ".66rem", color: "var(--pm-muted)" }}>{a.target}</span>
                      <span style={{ fontSize: ".66rem", color: "var(--pm-muted)" }}>{a.time} · {a.admin} · {a.ip}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============================== Modals & drawers ============================== */}
      <FeeDetailDrawer
        fee={detailFee}
        onClose={() => setDetailFee(null)}
        onChange={(f) => { setDetailFee(null); setEditFee(f); setWizardOpen(true); }}
        onSimulate={(f) => { setDetailFee(null); setSimFee(f); setSimOpen(true); }}
        onHistory={(f) => { setDetailFee(null); setHistoryFee(f); }}
        onDeactivate={(f) => { setDetailFee(null); setDeactFee(f); }}
        onScheduleFor={(f) => {
          setDetailFee(null);
          const c = changes.find((x) => x.id === f.nextChange) ?? null;
          if (c) setApproveC(c); else setSchedOpen(true);
        }}
      />
      {wizardOpen && (
        <FeeChangeWizard
          fee={editFee}
          open={wizardOpen}
          onClose={() => setWizardOpen(false)}
          onSubmit={submitChange}
          onOpenSchedule={() => { setWizardOpen(false); setSchedOpen(true); }}
        />
      )}
      {simOpen && (
        <SimulatorWizard
          fee={simFee}
          open={simOpen}
          onClose={() => setSimOpen(false)}
          onSchedule={(c) => setChanges((list) => [c, ...list])}
        />
      )}
      <TierMatrixModal
        open={tiersOpen}
        onClose={() => setTiersOpen(false)}
        bands={tiers}
        onUpdateBand={(band, category: TierCategory, value) =>
          setTiers((list) => list.map((t) => t.band === band ? { ...t, rates: { ...t.rates, [category]: value } } : t))}
      />
      <OverridesDrawer
        open={overridesOpen}
        onClose={() => setOverridesOpen(false)}
        overrides={overrides}
        onView={(o) => setOvDetail(o)}
        onRevoke={(o) => setOvRevoke(o)}
        onGrant={() => { setOverridesOpen(false); setOvWizard(true); }}
      />
      <OverrideDetailModal ov={ovDetail} onClose={() => setOvDetail(null)} onRevoke={(o) => { setOvDetail(null); setOvRevoke(o); }} />
      <RevokeOverrideModal ov={ovRevoke} onClose={() => setOvRevoke(null)}
        onDone={(o) => setOverrides((list) => list.map((x) => x.id === o.id ? { ...x, status: "Revoked", expires: "Revoked now", monthlyValue: 0 } : x))} />
      <OverrideWizard open={ovWizard} onClose={() => setOvWizard(false)} onGrant={(o) => setOverrides((list) => [o, ...list])} />
      <ExemptionQueueDrawer open={queueOpen} onClose={() => setQueueOpen(false)} requests={requests} onDecide={openDecide} />
      <ExemptionDecisionModal request={decision?.r ?? null} mode={decision?.mode ?? "approve"}
        onClose={() => setDecision(null)} onConfirm={decideExemption} />
      <ScheduledDrawer
        open={schedOpen}
        onClose={() => setSchedOpen(false)}
        changes={changes}
        onApprove={(c) => setApproveC(c)}
        onReject={(c) => setRejectC(c)}
        onWithdraw={withdrawChange}
        onViewFee={(feeId) => { setSchedOpen(false); const f = schedules.find((x) => x.id === feeId); if (f) setDetailFee(f); }}
      />
      <ApproveChangeModal change={approveC} onClose={() => setApproveC(null)} onDone={approveChange} />
      <RejectChangeModal change={rejectC} onClose={() => setRejectC(null)} onDone={rejectChange} />
      <DeactivateFeeModal fee={deactFee} onClose={() => setDeactFee(null)}
        onDone={(f) => updateFee(f.id, { status: "Inactive", nextChange: undefined })} />
      <FeeExportModal open={exportOpen} onClose={() => setExportOpen(false)} rows={filtered} />
      <FeeFilterDrawer open={filterOpen} filters={filters} onClose={() => setFilterOpen(false)}
        onApply={(f) => { setFilters(f); setPage(1); }} />
      <PartnersDrawer open={partnersOpen} onClose={() => setPartnersOpen(false)} partners={partners} onEdit={(p) => { setPartnersOpen(false); setPartnerEdit(p); }} />
      {partnerEdit && (
        <PartnerShareModal partner={partnerEdit} onClose={() => setPartnerEdit(null)}
          onDone={(p, split) => setPartners((list) => list.map((x) => x.id === p.id ? { ...x, paymoShare: split, partnerShare: 100 - split } : x))} />
      )}
      <BulkFeesModal open={bulkOpen} count={selected.length} onClose={() => setBulkOpen(false)} onDone={bulkAction} />
      <FeeHistoryModal fee={historyFee} onClose={() => setHistoryFee(null)} />
      <ForecastModal open={forecastOpen} onClose={() => setForecastOpen(false)} forecasts={FEE_FORECASTS} />
      <ScenarioLibraryModal open={scenariosOpen} onClose={() => setScenariosOpen(false)} scenarios={SIM_SCENARIOS}
        onRun={() => { setSimFee(null); setSimOpen(true); }} />
    </>
  );
}
