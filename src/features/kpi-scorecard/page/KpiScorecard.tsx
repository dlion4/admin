import { useMemo, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Avatar, Badge, DDItem, Dropdown, Meter, Pagination, Sparkline, useToast } from "../../../components/ui";
import { csvDownload, kes } from "../../../lib/format";
import {
  BOARD_PACKS, DEPARTMENTS, KPI_LIST, OKRS, QUARTER_HISTORY, RAG_COUNTS, TARGET_HISTORY,
  type Department, type KPI, type OKR,
  fmt as fmtKpi,
} from "../data/kpiData";
import {
  BoardPackModal, CohortModal, CommentaryDrawer, CompareModal, DepartmentDrawer, EditTargetWizard,
  KpiDrawer, NewKpiModal, NewOkrlWizard, OkrDrawer, RagDetailModal, SignOffWizard, SnapshotModal,
  SubscribeModal, TargetHistoryDrawer,
  NudgeOwnerModal, BudgetReportModal, ScheduleOneOnOneModal, ShareLinkModal, DownloadPackModal,
  KpiAnomalyModal, OkrDetailDrawer, DepartmentBudgetDetailModal, QuarterReviewModal, AuditTrailModal,
  ScheduledReportModal, BoardMeetingPrepModal, TeamCapacityModal, CohortDeepDiveModal, KpiAlertConfigModal,
  OwnerPerformanceModal, MetricInsightModal, RagActionModal, BulkKpiActionModal, KpiTrendAnalysisModal,
} from "../modals/KpiModals";
import { COHORT } from "../data/kpiData";

export function KpiScorecard({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  const { push } = useToast();
  void signal; void onNavigate;

  const [period, setPeriod] = useState<"Q3-2026" | "Q2-2026" | "Q1-2026" | "FY2026">("Q3-2026");
  const [cat, setCat] = useState<"All" | KPI["category"]>("All");
  const [rag, setRag] = useState<"all" | "green" | "amber" | "red">("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(12);
  const [sort, setSort] = useState<{ k: "value" | "name" | "progress"; dir: 1 | -1 }>({ k: "progress", dir: -1 });

  const [kpi, setKpi] = useState<KPI | null>(null);
  const [editTarget, setEditTarget] = useState<KPI | null>(null);
  const [okr, setOkr] = useState<OKR | null>(null);
  const [newOkr, setNewOkr] = useState(false);
  const [dept, setDept] = useState<Department | null>(null);
  const [cohort, setCohort] = useState<string | null>(null);
  const [pack, setPack] = useState<(typeof BOARD_PACKS)[number] | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [snapshotOpen, setSnapshotOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [commentaryOpen, setCommentaryOpen] = useState(false);
  const [signoffOpen, setSignoffOpen] = useState(false);
  const [ragDetail, setRagDetail] = useState<"green" | "amber" | "red" | null>(null);
  const [newKpiOpen, setNewKpiOpen] = useState(false);
  const [okrs, setOkrs] = useState<OKR[]>(OKRS);
  const [kpis, setKpis] = useState<KPI[]>(KPI_LIST);
  const [okrFilter, setOkrFilter] = useState<"All" | OKR["status"]>("All");

  // New modal states
  const [nudgeTarget, setNudgeTarget] = useState<{ owner: string; kpi?: string } | null>(null);
  const [budgetDept, setBudgetDept] = useState<Department | null>(null);
  const [oneOnOne, setOneOnOne] = useState<{ lead: string; dept: string } | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [downloadPack, setDownloadPack] = useState<(typeof BOARD_PACKS)[number] | null>(null);
  const [anomalyKpi, setAnomalyKpi] = useState<KPI | null>(null);
  const [okrDetail, setOkrDetail] = useState<OKR | null>(null);
  const [budgetDetail, setBudgetDetail] = useState<Department | null>(null);
  const [quarterReview, setQuarterReview] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [scheduledOpen, setScheduledOpen] = useState(false);
  const [boardPrepOpen, setBoardPrepOpen] = useState(false);
  const [capacityDept, setCapacityDept] = useState<Department | null>(null);
  const [cohortDetail, setCohortDetail] = useState<(typeof COHORT)[number] | null>(null);
  const [alertKpi, setAlertKpi] = useState<KPI | null>(null);
  const [ownerPerf, setOwnerPerf] = useState<string | null>(null);
  const [insightKpi, setInsightKpi] = useState<KPI | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [trendKpi, setTrendKpi] = useState<KPI | null>(null);

  const overall = useMemo(() => {
    const onTrack = kpis.filter((k) => (k.value / k.target) * 100 >= (k.direction === "up" ? 90 : 110)).length;
    return Math.round((onTrack / kpis.length) * 100);
  }, [kpis]);

  const totalRag = RAG_COUNTS;

  const filtered = useMemo(() => {
    let list = kpis;
    if (cat !== "All") list = list.filter((k) => k.category === cat);
    if (rag !== "all") list = list.filter((k) => k.rag === rag);
    if (q) list = list.filter((k) => (k.name + k.owner + k.id).toLowerCase().includes(q.toLowerCase()));
    list = [...list].sort((a, b) => {
      if (sort.k === "name") return a.name.localeCompare(b.name) * sort.dir;
      if (sort.k === "value") return (a.value - b.value) * sort.dir;
      const pa = a.value / a.target, pb = b.value / b.target;
      return (pa - pb) * sort.dir;
    });
    return list;
  }, [kpis, cat, rag, q, sort]);

  const paged = filtered.slice((page - 1) * size, page * size);
  const visibleOkrs = okrFilter === "All" ? okrs : okrs.filter((o) => o.status === okrFilter);
  const onTrackOkrs = okrs.filter((o) => o.status === "On track" || o.status === "Done").length;

  const topKpis = [...kpis].sort((a, b) => b.value / b.target - a.value / a.target).slice(0, 4);
  const watchKpis = kpis.filter((k) => k.rag !== "green").slice(0, 6);

  const handleSaveTarget = (v: number, _reason: string) => {
    if (!editTarget) return;
    setKpis((list) => list.map((k) => k.id === editTarget.id ? { ...k, target: v } : k));
  };

  const handleAddOk = (o: OKR) => setOkrs((list) => [o, ...list]);
  const handleAdvanceOkr = (id: string) => setOkrs((list) => list.map((o) => o.id === id ? {
    ...o,
    progress: Math.min(100, o.progress + 10),
    status: o.progress + 10 >= 100 ? "Done" : o.progress + 10 >= 70 ? "On track" : o.status,
  } : o));

  const cats = ["All", "Growth", "Revenue", "Unit economics", "Risk", "Operations", "Product", "People"] as const;

  return (
    <>
      {/* ===================== page header ===================== */}
      <div className="pm-section-head" style={{ marginTop: 0 }}>
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="pm-eyebrow">Overview · Page 3</span>
            <Badge tone="violet">{period}</Badge>
          </div>
          <h2>KPI Scorecard</h2>
          <p>Board-level KPIs against quarterly targets, departmental OKRs and cohort retention — with full governance, target history and super-admin overrides.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <div className="pm-seg">
            {(["Q3-2026", "Q2-2026", "Q1-2026", "FY2026"] as const).map((p) => (
              <button key={p} className={period === p ? "active" : ""} onClick={() => setPeriod(p)}>{p.replace("-20", " “").slice(0, 4)}</button>
            ))}
          </div>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setHistoryOpen(true)}><i className="bi bi-clock-history me-1" />History</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setCompareOpen(true)}><i className="bi bi-arrow-left-right me-1" />Compare</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setSnapshotOpen(true)}><i className="bi bi-download me-1" />Export</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setAuditOpen(true)}><i className="bi bi-clock-history me-1" />Audit</button>
          <Dropdown width={220} trigger={() => <button className="btn btn-outline-secondary btn-sm"><i className="bi bi-three-dots" /></button>}>
            {(close) => (<>
              <div className="pm-dd-head">Scorecard actions</div>
              <DDItem icon="bi-bell" label="Subscribe to updates" onClick={() => { close(); setSubscribeOpen(true); }} />
              <DDItem icon="bi-pencil-square" label="Write exec commentary" onClick={() => { close(); setCommentaryOpen(true); }} />
              <DDItem icon="bi-plus-circle" label="Add custom KPI" onClick={() => { close(); setNewKpiOpen(true); }} />
              <DDItem icon="bi-flag" label="Create new OKR" onClick={() => { close(); setNewOkr(true); }} />
              <DDItem icon="bi-check2-square" label="Bulk actions" onClick={() => { close(); setBulkOpen(true); }} />
              <DDItem icon="bi-journal-text" label="Quarter review" onClick={() => { close(); setQuarterReview(true); }} />
              <DDItem icon="bi-calendar-check" label="Scheduled reports" onClick={() => { close(); setScheduledOpen(true); }} />
              <DDItem icon="bi-clipboard-check" label="Board meeting prep" onClick={() => { close(); setBoardPrepOpen(true); }} />
              <div className="pm-dd-sep" />
              <DDItem icon="bi-pen-fill" label="Sign board pack" onClick={() => { close(); setSignoffOpen(true); }} />
            </>)}
          </Dropdown>
          <button className="btn btn-primary btn-sm" onClick={() => setSignoffOpen(true)}><i className="bi bi-pen-fill me-1" />Sign pack</button>
        </div>
      </div>

      {/* ===================== RAG overview hero ===================== */}
      <div className="pm-hero mb-3">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-xl-4">
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="pm-eyebrow" style={{ color: "#90a4bd" }}>Scorecard delivery</span>
              <Badge tone={overall >= 85 ? "green" : overall >= 70 ? "amber" : "red"}>{overall}% on track</Badge>
            </div>
            <div className="pm-hero-value">{overall}%</div>
            <div style={{ fontSize: ".8rem", color: "#90a4bd" }} className="mt-1">
              {totalRag.green} green · {totalRag.amber} amber · {totalRag.red} red · {kpis.length} KPIs tracked
            </div>
            <div className="d-flex gap-2 mt-3">
              <button className="btn btn-sm" style={{ background: "#12b76a", color: "#fff" }} onClick={() => setRagDetail("green")}>
                <i className="bi bi-check-circle me-1" />{totalRag.green} on track
              </button>
              <button className="btn btn-sm" style={{ background: "rgba(247,144,9,.2)", color: "#f79009", border: "1px solid rgba(247,144,9,.4)" }} onClick={() => setRagDetail("amber")}>
                <i className="bi bi-exclamation-triangle me-1" />{totalRag.amber} watch
              </button>
              <button className="btn btn-sm" style={{ background: "rgba(240,68,56,.2)", color: "#ff9c94", border: "1px solid rgba(240,68,56,.4)" }} onClick={() => setRagDetail("red")}>
                <i className="bi bi-x-octagon me-1" />{totalRag.red} at risk
              </button>
            </div>
          </div>
          <div className="col-12 col-xl-8">
            <div className="d-flex flex-column gap-2">
              {["Growth", "Revenue", "Unit economics", "Risk", "Operations", "Product", "People"].map((c) => {
                const ck = kpis.filter((k) => k.category === c);
                const green = ck.filter((k) => k.rag === "green").length;
                const pct = Math.round((green / ck.length) * 100);
                return (
                  <div key={c} className="d-flex align-items-center gap-2">
                    <span style={{ width: 118, fontSize: ".72rem", fontWeight: 700, color: "#c9d3e7" }}>{c}</span>
                    <div style={{ flex: 1, height: 14, background: "rgba(255,255,255,.08)", borderRadius: 8, overflow: "hidden", position: "relative" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#12b76a,#84e1b4)" }} />
                      {ck.filter((k) => k.rag === "amber").map((k, i) => (
                        <div key={k.id} style={{ position: "absolute", top: 0, bottom: 0, width: 4, background: "#f79009", left: `${pct + i * 4}%` }} />
                      ))}
                      {ck.filter((k) => k.rag === "red").map((k, i) => (
                        <div key={k.id} style={{ position: "absolute", top: 0, bottom: 0, width: 4, background: "#f04438", left: `${Math.min(98, pct + (ck.filter((x) => x.rag === "amber").length * 4) + i * 4)}%` }} />
                      ))}
                    </div>
                    <span style={{ fontSize: ".72rem", fontWeight: 800, color: "#7ee2b0", width: 44, textAlign: "right" }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ===================== top performer cards + quarter trend ===================== */}
      <div className="row g-3">
        <div className="col-12 col-xl-8">
          <div className="pm-card">
            <div className="pm-card-head">
              <div><h6 className="pm-card-title">Top performing KPIs</h6><p className="pm-card-sub">Click any card to open the full detail drawer.</p></div>
              <Badge tone="green">{topKpis.length} leaders</Badge>
            </div>
            <div className="pm-card-pad">
              <div className="row g-2">
                {topKpis.map((k) => {
                  const pct = Math.round((k.value / k.target) * 100);
                  return (
                    <div className="col-12 col-md-6" key={k.id}>
                      <button className="pm-stat w-100 text-start" style={{ cursor: "pointer" }} onClick={() => setKpi(k)}>
                        <div className="d-flex align-items-center justify-content-between">
                          <span className="pm-stat-label">{k.category}</span>
                          <Badge tone={k.rag} dot>{k.rag}</Badge>
                        </div>
                        <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1.1rem" }}>{fmtKpi(k)}</div>
                        <div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{k.name}</div>
                        <div className="d-flex align-items-center gap-2 mt-1">
                          <Meter value={Math.min(pct, 120)} tone={pct >= 100 ? "#12b76a" : pct >= 85 ? "#f79009" : "#f04438"} width={150} />
                          <span style={{ fontSize: ".72rem", fontWeight: 700 }}>{pct}%</span>
                          <span className="ms-auto"><Sparkline data={k.trend} color="#12b76a" w={60} h={22} fill={false} /></span>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-xl-4">
          <div className="pm-card h-100">
            <div className="pm-card-head">
              <div><h6 className="pm-card-title">Quarterly trend</h6><p className="pm-card-sub">On-track % by quarter</p></div>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setCompareOpen(true)}><i className="bi bi-arrows-expand" /></button>
            </div>
            <div className="pm-card-pad" style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={QUARTER_HISTORY} margin={{ top: 10, right: 8, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef1f6" vertical={false} />
                  <XAxis dataKey="q" tick={{ fontSize: 11, fill: "#667085" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#667085" }} domain={[0, 100]} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e6e9f0", fontSize: 12 }} />
                  <Bar dataKey="actual" name="Actual %" radius={[6, 6, 0, 0]}>
                    {QUARTER_HISTORY.map((q, i) => (
                      <Cell key={i} fill={q.actual >= q.target ? "#12b76a" : q.actual >= q.target - 5 ? "#f79009" : "#f04438"} />
                    ))}
                  </Bar>
                  <Bar dataKey="target" name="Target" fill="#d0d5dd" radius={[6, 6, 0, 0]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== Watch-list / at-risk KPIs ===================== */}
      <div className="pm-section-head">
        <div><h2>Watch list & at-risk</h2><p>KPIs that are amber or red with their owner and the most recent value vs target.</p></div>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => setRag("amber")}><i className="bi bi-funnel me-1" />All amber</button>
      </div>
      <div className="pm-card mb-3">
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead>
              <tr>
                <th>KPI</th><th>Owner</th><th className="text-end">Current</th>
                <th className="text-end">Target</th><th className="text-end" style={{ width: 220 }}>Progress</th>
                <th>RAG</th><th />
              </tr>
            </thead>
            <tbody>
              {watchKpis.map((k) => {
                const pct = Math.round((k.value / k.target) * 100);
                return (
                  <tr key={k.id} onClick={() => setKpi(k)}>
                    <td>
                      <div className="pm-td-strong">{k.name}</div>
                      <div className="pm-td-sub">{k.category} · {k.frequency}</div>
                    </td>
                    <td><div className="d-flex align-items-center gap-2"><Avatar name={k.owner} size="sm" /><span style={{ fontSize: ".78rem" }}>{k.owner}</span></div></td>
                    <td className="text-end pm-num" style={{ fontWeight: 700 }}>{fmtKpi(k)}</td>
                    <td className="text-end pm-num">{fmtKpi({ ...k, value: k.target })}</td>
                    <td><div className="d-flex align-items-center gap-2"><Meter value={Math.min(pct, 120)} tone={pct >= 100 ? "#12b76a" : pct >= 85 ? "#f79009" : "#f04438"} width={160} /><span className="pm-num">{pct}%</span></div></td>
                    <td><Badge tone={k.rag} dot>{k.rag}</Badge></td>
                    <td className="text-end" onClick={(e) => e.stopPropagation()}>
                      <Dropdown up width={200} trigger={() => <button className="pm-icon-btn" style={{ width: 28, height: 28 }}><i className="bi bi-three-dots-vertical" /></button>}>
                        {(close) => (<>
                          <DDItem icon="bi-eye" label="Open detail drawer" onClick={() => { close(); setKpi(k); }} />
                          <DDItem icon="bi-pencil" label="Edit target" hint={k.tier === 1 ? "Board approval" : "Super admin"} onClick={() => { close(); setEditTarget(k); }} />
                          <DDItem icon="bi-envelope" label="Nudge owner" onClick={() => { close(); setNudgeTarget({ owner: k.owner, kpi: k.name }); }} />
                          <DDItem icon="bi-lightning" label="View insights" onClick={() => { close(); setInsightKpi(k); }} />
                          <DDItem icon="bi-bell" label="Alert config" onClick={() => { close(); setAlertKpi(k); }} />
                          <div className="pm-dd-sep" />
                          <DDItem icon="bi-file-earmark-spreadsheet" label="Export series" onClick={() => { close(); csvDownload(`${k.id}.csv`, [{ kpi: k.name, current: k.value, target: k.target }]); }} />
                        </>)}
                      </Dropdown>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================== Full KPI table ===================== */}
      <div className="pm-section-head">
        <div><h2>All KPIs</h2><p>Sortable, filterable list of every board KPI with trends and governance.</p></div>
      </div>
      <div className="pm-card">
        <div className="pm-card-head">
          <div className="d-flex gap-1 flex-wrap">
            {cats.map((c) => (
              <button key={c} className={`pm-chip ${cat === c ? "active" : ""}`} onClick={() => { setCat(c); setPage(1); }}>{c}</button>
            ))}
          </div>
          <div className="d-flex gap-2 align-items-center flex-wrap">
            <div className="pm-seg">
              {(["all", "green", "amber", "red"] as const).map((r) => (
                <button key={r} className={rag === r ? "active" : ""} onClick={() => setRag(r)}>{r === "all" ? "RAG" : r}</button>
              ))}
            </div>
            <div className="pm-search" style={{ minWidth: 200 }}>
              <i className="bi bi-search" /><input placeholder="Search KPIs, owners…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
            </div>
          </div>
        </div>
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead>
              <tr>
                <th className="cursor-pointer" onClick={() => setSort((s) => ({ k: "name", dir: s.k === "name" ? (s.dir === 1 ? -1 : 1) : 1 }))}>
                  KPI {sort.k === "name" && <i className={`bi bi-caret-${sort.dir === 1 ? "up" : "down"}-fill`} />}
                </th>
                <th>Category</th><th>Owner</th><th>Freq</th>
                <th className="text-end cursor-pointer" onClick={() => setSort((s) => ({ k: "value", dir: s.k === "value" ? (s.dir === 1 ? -1 : 1) : -1 }))}>
                  Current {sort.k === "value" && <i className={`bi bi-caret-${sort.dir === 1 ? "up" : "down"}-fill`} />}
                </th>
                <th className="text-end">Target</th>
                <th className="text-end cursor-pointer" onClick={() => setSort((s) => ({ k: "progress", dir: s.k === "progress" ? (s.dir === 1 ? -1 : 1) : -1 }))}>
                  Progress {sort.k === "progress" && <i className={`bi bi-caret-${sort.dir === 1 ? "up" : "down"}-fill`} />}
                </th>
                <th style={{ width: 90 }}>Trend</th>
                <th>RAG</th><th />
              </tr>
            </thead>
            <tbody>
              {paged.map((k) => {
                const pct = Math.round((k.value / k.target) * 100);
                return (
                  <tr key={k.id} onClick={() => setKpi(k)}>
                    <td><div className="pm-td-strong">{k.name}</div><div className="pm-td-sub mono">{k.id}</div></td>
                    <td><Badge tone="grey">{k.category}</Badge></td>
                    <td><div className="d-flex align-items-center gap-2"><Avatar name={k.owner} size="sm" /><span style={{ fontSize: ".76rem" }}>{k.owner}</span></div></td>
                    <td style={{ fontSize: ".76rem", color: "var(--pm-muted)" }}>{k.frequency}</td>
                    <td className="text-end pm-num" style={{ fontWeight: 700 }}>{fmtKpi(k)}</td>
                    <td className="text-end pm-num">{fmtKpi({ ...k, value: k.target })}</td>
                    <td className="text-end"><div className="d-flex align-items-center gap-2 justify-content-end">
                      <Meter value={Math.min(pct, 120)} tone={pct >= 100 ? "#12b76a" : pct >= 85 ? "#f79009" : "#f04438"} width={120} />
                      <span className="pm-num">{pct}%</span></div></td>
                    <td className="text-end"><Sparkline data={k.trend} color={k.rag === "green" ? "#12b76a" : k.rag === "amber" ? "#f79009" : "#f04438"} w={90} h={26} fill={false} /></td>
                    <td><Badge tone={k.rag} dot>{k.rag}</Badge></td>
                    <td className="text-end" onClick={(e) => e.stopPropagation()}>
                      <Dropdown up width={220} trigger={() => <button className="pm-icon-btn" style={{ width: 28, height: 28 }}><i className="bi bi-three-dots-vertical" /></button>}>
                        {(close) => (<>
                          <DDItem icon="bi-eye" label="Open KPI detail" onClick={() => { close(); setKpi(k); }} />
                          <DDItem icon="bi-pencil-square" label="Edit target" hint={k.tier === 1 ? "Board approval" : "Super admin"} onClick={() => { close(); setEditTarget(k); }} />
                          <DDItem icon="bi-clock-history" label="View target history" onClick={() => { close(); setHistoryOpen(true); }} />
                          <DDItem icon="bi-envelope" label="Nudge owner" onClick={() => { close(); setNudgeTarget({ owner: k.owner, kpi: k.name }); }} />
                          <DDItem icon="bi-graph-up" label="Trend analysis" onClick={() => { close(); setTrendKpi(k); }} />
                          <DDItem icon="bi-lightning" label="View insights" onClick={() => { close(); setInsightKpi(k); }} />
                          <DDItem icon="bi-clock-history" label="View target history" onClick={() => { close(); setHistoryOpen(true); }} />
                          <DDItem icon="bi-bell" label="Alert config" onClick={() => { close(); setAlertKpi(k); }} />
                          <div className="pm-dd-sep" />
                          <DDItem icon="bi-download" label="Export series" onClick={() => { close(); csvDownload(`${k.id}.csv`, [{ kpi: k.name, current: k.value, target: k.target }]); }} />
                        </>)}
                      </Dropdown>
                    </td>
                  </tr>
                );
              })}
              {paged.length === 0 && <tr><td colSpan={10}><div className="pm-empty"><i className="bi bi-clipboard-x" />
                <div style={{ fontWeight: 700, color: "var(--pm-ink)", marginTop: ".4rem" }}>No KPIs match these filters</div>
                <button className="btn btn-outline-secondary btn-sm mt-2" onClick={() => { setCat("All"); setRag("all"); setQ(""); }}>Clear filters</button>
              </div></td></tr>}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pageSize={size} total={filtered.length} onPage={setPage} onPageSize={setSize} />
      </div>

      {/* ===================== OKRs + Departments + Cohorts + Board packs ===================== */}
      <div className="row g-3">
        <div className="col-12 col-xl-7">
          <div className="pm-section-head"><div><h2>OKRs this quarter</h2><p>{onTrackOkrs} of {okrs.length} OKRs on track or done.</p></div>
            <div className="d-flex gap-2">
              <div className="pm-seg">
                {(["All", "On track", "At risk", "Off track", "Done"] as const).map((t) => (
                  <button key={t} className={okrFilter === t ? "active" : ""} onClick={() => setOkrFilter(t)}>{t}</button>
                ))}
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setNewOkr(true)}><i className="bi bi-plus-lg me-1" />New OKR</button>
            </div>
          </div>
          <div className="pm-card">
            <div className="p-2 d-flex flex-column gap-2" style={{ maxHeight: 700, overflowY: "auto" }}>
              {visibleOkrs.map((o) => (
                <button key={o.id} className={`pm-alert-row text-start ${o.status === "Off track" ? "crit" : o.status === "At risk" ? "warn" : "info"}`}
                  onClick={() => setOkr(o)} style={{ width: "100%", cursor: "pointer" }}>
                  <span className={`pm-dot ${o.status === "Done" ? "green" : o.status === "On track" ? "blue" : o.status === "At risk" ? "amber" : "red"}`} style={{ marginTop: 6 }} />
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span className="mono" style={{ fontSize: ".7rem", color: "var(--pm-muted)" }}>{o.id}</span>
                      <span style={{ fontWeight: 700, fontSize: ".84rem" }}>{o.title}</span>
                      <Badge tone={o.priority === "High" ? "red" : o.priority === "Medium" ? "amber" : "grey"}>{o.priority}</Badge>
                    </div>
                    <div style={{ fontSize: ".74rem", color: "var(--pm-muted)" }}>{o.dept} · {o.owner} · due {o.due}</div>
                    <div className="d-flex align-items-center gap-2 mt-1">
                      <Meter value={o.progress} tone={o.progress >= 70 ? "#12b76a" : o.progress >= 40 ? "#f79009" : "#f04438"} width={260} />
                      <span className="pm-num" style={{ fontWeight: 700 }}>{o.progress}%</span>
                      <Badge tone={o.status === "Done" ? "green" : o.status === "On track" ? "blue" : o.status === "At risk" ? "amber" : "red"}>{o.status}</Badge>
                    </div>
                  </div>
                  <i className="bi bi-chevron-right" style={{ color: "#c3cbd9" }} />
                </button>
              ))}
              {visibleOkrs.length === 0 && <div className="pm-empty"><i className="bi bi-flag" /><div style={{ fontWeight: 700, color: "var(--pm-ink)" }}>No OKRs in this bucket</div></div>}
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-5">
          <div className="pm-section-head"><div><h2>Departments</h2><p>OKR health by function.</p></div></div>
          <div className="pm-card mb-3">
            <div className="p-2 d-flex flex-column gap-2">
              {DEPARTMENTS.map((d) => (
                <button key={d.id} className="pm-alert-row info text-start w-100" onClick={() => setBudgetDetail(d)} style={{ cursor: "pointer" }}>
                  <span className="pm-dot" style={{ background: d.color, boxShadow: `0 0 0 3px ${d.color}26`, marginTop: 6 }} />
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span style={{ fontWeight: 700, fontSize: ".84rem" }}>{d.name}</span>
                      <Badge tone={d.health} dot>{d.health}</Badge>
                    </div>
                    <div style={{ fontSize: ".74rem", color: "var(--pm-muted)" }}>{d.lead} · {d.headcount} people · {kes(d.budget, { compact: true })} budget</div>
                    <div className="d-flex align-items-center gap-2 mt-1">
                      <Meter value={(d.onTrack / d.okrs) * 100} tone={d.color} width={220} />
                      <span className="pm-num" style={{ fontWeight: 700 }}>{d.onTrack}/{d.okrs}</span>
                    </div>
                  </div>
                  <i className="bi bi-chevron-right" style={{ color: "#c3cbd9" }} />
                </button>
              ))}
            </div>
          </div>

          <div className="pm-section-head"><div><h2>Cohort retention</h2><p>Day-30 retention by signup month.</p></div></div>
          <div className="pm-card">
            <div className="pm-card-pad" style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={COHORT} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef1f6" vertical={false} />
                  <XAxis dataKey="cohort" tick={{ fontSize: 10, fill: "#667085" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#667085" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e6e9f0", fontSize: 12 }} formatter={(v) => [`${v}%`, ""]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="d1" name="Day 1" stroke="#12b76a" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="d7" name="Day 7" stroke="#2e90fa" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="d30" name="Day 30" stroke="#7a5af8" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="p-2 d-flex gap-1 flex-wrap">
              {COHORT.map((c) => (
                <button key={c.cohort} className="pm-chip" onClick={() => setCohortDetail(c)}>{c.cohort}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===================== Board packs ===================== */}
      <div className="pm-section-head"><div><h2>Board packs</h2><p>Recent and upcoming board deliverables.</p></div>
        <button className="btn btn-primary btn-sm" onClick={() => setSignoffOpen(true)}><i className="bi bi-pen-fill me-1" />Sign current pack</button>
      </div>
      <div className="pm-card mb-4">
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Pack</th><th>Owner</th><th>Due</th><th>Pages</th><th>Status</th><th className="text-end">Progress</th><th /></tr></thead>
            <tbody>
              {BOARD_PACKS.map((b) => (
                <tr key={b.period} onClick={() => setPack(b)}>
                  <td className="pm-td-strong">{b.period}</td>
                  <td><div className="d-flex align-items-center gap-2"><Avatar name={b.owner} size="sm" /><span style={{ fontSize: ".78rem" }}>{b.owner}</span></div></td>
                  <td style={{ fontSize: ".78rem" }}>{b.due}</td>
                  <td className="pm-num">{b.pages}</td>
                  <td><Badge tone={b.status === "Presented" ? "green" : b.status === "Published" ? "blue" : b.status === "In review" ? "amber" : "grey"}>{b.status}</Badge></td>
                  <td className="text-end">
                    <div className="d-flex align-items-center gap-2 justify-content-end">
                      <Meter value={b.status === "Presented" ? 100 : b.status === "Published" ? 85 : b.status === "In review" ? 60 : 25} tone="#7a5af8" width={140} />
                    </div>
                  </td>
                  <td className="text-end" onClick={(e) => e.stopPropagation()}>
                    <Dropdown up width={200} trigger={() => <button className="pm-icon-btn" style={{ width: 28, height: 28 }}><i className="bi bi-three-dots-vertical" /></button>}>
                      {(close) => (<>
                        <DDItem icon="bi-eye" label="Open pack" onClick={() => { close(); setPack(b); }} />
                        <DDItem icon="bi-download" label="Download" onClick={() => { close(); setDownloadPack(b); }} />
                        <DDItem icon="bi-link-45deg" label="Share read-only" onClick={() => { close(); setShareOpen(true); }} />
                        <DDItem icon="bi-pen-fill" label="Sign this pack" onClick={() => { close(); setSignoffOpen(true); }} />
                      </>)}
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================== Modals & drawers ===================== */}
      <KpiDrawer kpi={kpi} onClose={() => setKpi(null)} onEditTarget={(k) => { setKpi(null); setEditTarget(k); }} />
      <EditTargetWizard kpi={editTarget} onClose={() => setEditTarget(null)} onSave={handleSaveTarget} />
      <OkrDrawer okr={okr} onClose={() => setOkr(null)} onAdvance={handleAdvanceOkr} />
      <NewOkrlWizard open={newOkr} onClose={() => setNewOkr(false)} onCreate={(o) => { handleAddOk(o); setNewOkr(false); }} />
      <DepartmentDrawer dept={dept} onClose={() => setDept(null)} />
      <CohortModal cohort={cohort} onClose={() => setCohort(null)} />
      <BoardPackModal pack={pack} onClose={() => setPack(null)} />
      <TargetHistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} history={TARGET_HISTORY} />
      <SubscribeModal open={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
      <SnapshotModal open={snapshotOpen} onClose={() => setSnapshotOpen(false)} />
      <CompareModal open={compareOpen} onClose={() => setCompareOpen(false)} />
      <CommentaryDrawer open={commentaryOpen} onClose={() => setCommentaryOpen(false)} />
      <SignOffWizard open={signoffOpen} onClose={() => setSignoffOpen(false)} />
      <RagDetailModal rag={ragDetail} onClose={() => setRagDetail(null)} />
      <NewKpiModal open={newKpiOpen} onClose={() => setNewKpiOpen(false)} onCreate={(k) => { setKpis((list) => [k, ...list]); push({ kind: "success", title: "Custom KPI added", body: k.name }); }} />
      {nudgeTarget && <NudgeOwnerModal owner={nudgeTarget.owner} kpiName={nudgeTarget.kpi} onClose={() => setNudgeTarget(null)} />}
      {budgetDept && <BudgetReportModal dept={budgetDept} onClose={() => setBudgetDept(null)} />}
      {oneOnOne && <ScheduleOneOnOneModal lead={oneOnOne.lead} deptName={oneOnOne.dept} onClose={() => setOneOnOne(null)} />}
      <ShareLinkModal open={shareOpen} onClose={() => setShareOpen(false)} title="Share scorecard" />
      {downloadPack && <DownloadPackModal pack={downloadPack} onClose={() => setDownloadPack(null)} />}
      {anomalyKpi && <KpiAnomalyModal kpi={anomalyKpi} onClose={() => setAnomalyKpi(null)} />}
      {okrDetail && <OkrDetailDrawer okr={okrDetail} onClose={() => setOkrDetail(null)} />}
      {budgetDetail && <DepartmentBudgetDetailModal dept={budgetDetail} onClose={() => setBudgetDetail(null)} />}
      <QuarterReviewModal open={quarterReview} onClose={() => setQuarterReview(false)} period={period} />
      <AuditTrailModal open={auditOpen} onClose={() => setAuditOpen(false)} />
      <ScheduledReportModal open={scheduledOpen} onClose={() => setScheduledOpen(false)} />
      <BoardMeetingPrepModal open={boardPrepOpen} onClose={() => setBoardPrepOpen(false)} />
      {capacityDept && <TeamCapacityModal dept={capacityDept} onClose={() => setCapacityDept(null)} />}
      {cohortDetail && <CohortDeepDiveModal cohort={cohortDetail} onClose={() => setCohortDetail(null)} />}
      {alertKpi && <KpiAlertConfigModal kpi={alertKpi} onClose={() => setAlertKpi(null)} />}
      {ownerPerf && <OwnerPerformanceModal owner={ownerPerf} kpis={kpis} onClose={() => setOwnerPerf(null)} />}
      {insightKpi && <MetricInsightModal kpi={insightKpi} onClose={() => setInsightKpi(null)} />}
      <BulkKpiActionModal kpis={kpis} onClose={() => setBulkOpen(false)} />
      {trendKpi && <KpiTrendAnalysisModal kpi={trendKpi} onClose={() => setTrendKpi(null)} />}
      <RagActionModal rag={ragDetail} onClose={() => setRagDetail(null)} />
    </>
  );
}
