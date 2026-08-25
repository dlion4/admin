import { useEffect, useMemo, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { Avatar, Badge, Donut, Dropdown, DDItem, EmptyState, Meter, Pagination, Sparkline, useToast } from "../../../components/ui";
import { csvDownload, kes, num } from "../../../lib/format";
import {
  ACTIVITY, ALERTS, CHANNELS, CREDIT_METRICS, DEFAULTERS, DEFAULTER_TREND, HERO_METRICS,
  QUICK_ACTIONS, REVENUE_12M, REVENUE_SOURCES, SYSTEM_HEALTH, TASKS, TX_24H,
  type Activity, type Alert, type Channel, type Defaulter, type HealthCard, type RevenueSource, type Task, type TxHour,
} from "../data/dashboardData";
import {
  ActivityDrawer, AlertDrawer, BulkAlertModal, ChannelDrawer, DefaulterDrawer, ExportReportModal,
  FeeScheduleWizard, FreezeAccountWizard, HealthDrawer, HourDrilldownModal, NewTaskModal, PortfolioModal,
  QuickActionModal, ReconciliationModal, RecoveryWizard, RevenueDrilldownModal, TaskModal, UserSearchModal,
} from "../modals/DashboardModals";

export type DashboardHandle = { openFreeze: () => void; openFees: () => void; openRecon: () => void; openExport: () => void };

export function Dashboard({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  const { push } = useToast();

  /* ---------------- modal state ---------------- */
  const [freezeOpen, setFreezeOpen] = useState(false);
  const [feesOpen, setFeesOpen] = useState(false);
  const [reconOpen, setReconOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [bulkAlertOpen, setBulkAlertOpen] = useState(false);
  const [alert, setAlert] = useState<Alert | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [health, setHealth] = useState<HealthCard | null>(null);
  const [revSource, setRevSource] = useState<RevenueSource | null>(null);
  const [hour, setHour] = useState<TxHour | null>(null);
  const [defaulter, setDefaulter] = useState<Defaulter | null>(null);
  const [recovery, setRecovery] = useState<Defaulter | null>(null);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [qa, setQa] = useState<typeof QUICK_ACTIONS[0] | null>(null);

  /* ---------------- shell signal bridge ---------------- */
  useEffect(() => {
    if (!signal.n) return;
    if (signal.action === "freeze") setFreezeOpen(true);
    if (signal.action === "fees") setFeesOpen(true);
    if (signal.action === "recon") setReconOpen(true);
    if (signal.action === "export") setExportOpen(true);
  }, [signal]);

  /* ---------------- live-ish state ---------------- */
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const [alertFilter, setAlertFilter] = useState<"all" | "critical" | "warning" | "info">("all");
  const [alertSel, setAlertSel] = useState<string[]>([]);
  const [ackd, setAckd] = useState<string[]>([]);
  const [chartMode, setChartMode] = useState<"count" | "value">("count");
  const [chartCompare, setChartCompare] = useState(true);
  const [revView, setRevView] = useState<"donut" | "trend">("donut");
  const [feedFilter, setFeedFilter] = useState("All");
  const [feedTick, setFeedTick] = useState(0);

  /* defaulter table */
  const [dq, setDq] = useState("");
  const [dBucket, setDBucket] = useState<"all" | "30d" | "60d" | "90d">("all");
  const [dStatus, setDStatus] = useState("all");
  const [dSort, setDSort] = useState<{ k: keyof Defaulter; dir: 1 | -1 }>({ k: "outstanding", dir: -1 });
  const [dPage, setDPage] = useState(1);
  const [dSize, setDSize] = useState(8);
  const [dSel, setDSel] = useState<string[]>([]);

  /* task table */
  const [taskTab, setTaskTab] = useState("All");

  useEffect(() => {
    const t = setInterval(() => setFeedTick((x) => x + 1), 20000);
    return () => clearInterval(t);
  }, []);

  /* ---------------- derived ---------------- */
  const visibleAlerts = useMemo(
    () => ALERTS.filter((a) => (alertFilter === "all" ? true : a.priority === alertFilter)),
    [alertFilter]
  );
  const alertCounts = {
    all: ALERTS.length,
    critical: ALERTS.filter((a) => a.priority === "critical").length,
    warning: ALERTS.filter((a) => a.priority === "warning").length,
    info: ALERTS.filter((a) => a.priority === "info").length,
  };

  const chartData = useMemo(
    () => TX_24H.map((h) => ({
      hour: h.hour,
      today: chartMode === "count" ? h.today : Math.round((h.today * 14_900) / 1_000_000),
      yesterday: chartMode === "count" ? h.yesterday : Math.round((h.yesterday * 14_900) / 1_000_000),
      success: h.success,
    })),
    [chartMode]
  );

  const filteredDefaulters = useMemo(() => {
    let rows = DEFAULTERS.filter((d) =>
      (d.user + d.id + d.account + d.county + d.product).toLowerCase().includes(dq.toLowerCase())
    );
    if (dBucket !== "all") rows = rows.filter((d) => d.bucket === dBucket);
    if (dStatus !== "all") rows = rows.filter((d) => d.status === dStatus);
    return [...rows].sort((a, b) => {
      const av = a[dSort.k], bv = b[dSort.k];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dSort.dir;
      return String(av).localeCompare(String(bv)) * dSort.dir;
    });
  }, [dq, dBucket, dStatus, dSort]);
  const pagedDefaulters = filteredDefaulters.slice((dPage - 1) * dSize, dPage * dSize);

  const feed = useMemo(
    () => (feedFilter === "All" ? ACTIVITY : ACTIVITY.filter((a) => a.category === feedFilter)),
    [feedFilter]
  );
  const feedCategories = ["All", ...Array.from(new Set(ACTIVITY.map((a) => a.category)))];

  const taskTabs = ["All", "High", "In progress", "Blocked", "Done"];
  const visibleTasks = tasks.filter((t) =>
    taskTab === "All" ? true : taskTab === "High" ? t.priority === "High" : t.status === taskTab
  );

  const sortBy = (k: keyof Defaulter) =>
    setDSort((s) => ({ k, dir: s.k === k ? (s.dir === 1 ? -1 : 1) : -1 }));

  const runQuickAction = (a: typeof QUICK_ACTIONS[0]) => {
    switch (a.id) {
      case "search-user": setUserSearchOpen(true); break;
      case "freeze": setFreezeOpen(true); break;
      case "fees": setFeesOpen(true); break;
      case "recon": setReconOpen(true); break;
      case "export": setExportOpen(true); break;
      case "broadcast": push({ kind: "info", title: "Broadcast composer", body: "Opening from the topbar quick-actions menu." }); setQa(a); break;
      case "fraud": onNavigate("monitor"); push({ kind: "info", title: "Fraud feed", body: "Real-Time Monitor opened — fraud alert stream is section 5." }); break;
      case "lockdown": push({ kind: "warn", title: "Emergency lockdown", body: "Use the topbar ⚡ menu (or Shift + L) — it is gated to Tier 0." }); break;
      default: setQa(a);
    }
  };

  const exportDatasets = [
    { id: "alerts", label: "Critical alerts", rows: ALERTS as unknown as Record<string, unknown>[] },
    { id: "defaulters", label: "Defaulters & credit risk", rows: DEFAULTERS as unknown as Record<string, unknown>[] },
    { id: "activity", label: "Admin activity (audit)", rows: ACTIVITY as unknown as Record<string, unknown>[] },
    { id: "channels", label: "Channel distribution", rows: CHANNELS as unknown as Record<string, unknown>[] },
    { id: "revenue", label: "Revenue breakdown", rows: REVENUE_SOURCES as unknown as Record<string, unknown>[] },
    { id: "tasks", label: "Tasks & deadlines", rows: tasks as unknown as Record<string, unknown>[] },
    { id: "hours", label: "24h transaction volume", rows: TX_24H as unknown as Record<string, unknown>[] },
  ];

  const hero = HERO_METRICS[0];
  const totalRevenue = REVENUE_SOURCES.reduce((s, r) => s + r.amount, 0);

  return (
    <>
      {/* ============================ Page header ============================ */}
      <div className="pm-section-head" style={{ marginTop: 0 }}>
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="pm-eyebrow">Overview · Page 1</span>
            <span className="pm-live"><span className="pm-dot green pm-pulse" />LIVE</span>
          </div>
          <h2>Admin Dashboard Home</h2>
          <p>Command centre for the PayMo BaaS platform — portfolio value, system health, critical alerts, credit risk and the admin audit trail, all in one screen.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setUserSearchOpen(true)}><i className="bi bi-search me-1" />Find user</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setExportOpen(true)}><i className="bi bi-download me-1" />Export</button>
          <Dropdown width={250} trigger={() => <button className="btn btn-outline-secondary btn-sm"><i className="bi bi-three-dots me-1" />More</button>}>
            {(close) => (<>
              <div className="pm-dd-head">Dashboard tools</div>
              <DDItem icon="bi-safe2" label="Portfolio composition" onClick={() => { close(); setPortfolioOpen(true); }} />
              <DDItem icon="bi-percent" label="Publish fee schedule" hint="2FA" onClick={() => { close(); setFeesOpen(true); }} />
              <DDItem icon="bi-arrow-repeat" label="Trigger reconciliation" hint="2FA" onClick={() => { close(); setReconOpen(true); }} />
              <DDItem icon="bi-snow" label="Freeze an account" hint="2FA + reason" onClick={() => { close(); setFreezeOpen(true); }} />
              <div className="pm-dd-sep" />
              <DDItem icon="bi-broadcast-pin" label="Open Real-Time Monitor" onClick={() => { close(); onNavigate("monitor"); }} />
            </>)}
          </Dropdown>
          <button className="btn btn-primary btn-sm" onClick={() => setFreezeOpen(true)}><i className="bi bi-snow me-1" />Freeze account</button>
        </div>
      </div>

      {/* ============================ 1.2 Portfolio hero ============================ */}
      <div className="pm-hero mb-3">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-xl-4">
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="pm-eyebrow" style={{ color: "#90a4bd" }}>Total portfolio value</span>
              <span className="pm-badge green" style={{ background: "rgba(18,183,106,.16)", borderColor: "rgba(18,183,106,.4)", color: "#7ee2b0" }}>
                <i className="bi bi-arrow-up-right" />{hero.delta}
              </span>
            </div>
            <div className="pm-hero-value">{hero.value}</div>
            <div style={{ fontSize: ".8rem", color: "#90a4bd" }} className="mt-1">
              Across 148,392 wallets · reconciled to the ledger 4 minutes ago
            </div>
            <div className="d-flex gap-2 mt-3 flex-wrap">
              <button className="btn btn-sm" style={{ background: "#12b76a", color: "#fff" }} onClick={() => setPortfolioOpen(true)}>
                <i className="bi bi-pie-chart me-1" />Composition
              </button>
              <button className="btn btn-sm" style={{ background: "rgba(255,255,255,.1)", color: "#e9f7f0", border: "1px solid rgba(255,255,255,.16)" }}
                onClick={() => setExportOpen(true)}><i className="bi bi-download me-1" />Board pack</button>
            </div>
          </div>
          <div className="col-12 col-xl-8">
            <div className="row g-2">
              {HERO_METRICS.slice(1).map((m) => (
                <div className="col-6 col-md-4 col-xxl-3" key={m.id}>
                  <div className="pm-hero-chip h-100">
                    <div className="d-flex align-items-start justify-content-between gap-1">
                      <span className="l">{m.label}</span>
                      <i className={`bi ${m.icon}`} style={{ color: m.color, fontSize: ".8rem" }} />
                    </div>
                    <div className="v">{m.value}</div>
                    <div className="d-flex align-items-center justify-content-between gap-1">
                      <span style={{ fontSize: ".67rem", fontWeight: 700, color: m.trend === "up" ? "#7ee2b0" : "#ffb4ad" }}>
                        <i className={`bi ${m.trend === "up" ? "bi-arrow-up-right" : "bi-arrow-down-right"}`} /> {m.delta}
                      </span>
                      <Sparkline data={m.spark} color={m.color} w={54} h={18} fill={false} />
                    </div>
                    <div style={{ fontSize: ".6rem", color: "#7b8aa3" }}>{m.period}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============================ 1.3 Revenue + 1.4 Health ============================ */}
      <div className="row g-3">
        <div className="col-12 col-xl-5">
          <div className="pm-card h-100">
            <div className="pm-card-head">
              <div><h6 className="pm-card-title">Revenue breakdown — 30 days</h6>
                <p className="pm-card-sub">{kes(totalRevenue, { compact: true })} total · click a source to drill down</p></div>
              <div className="pm-seg">
                <button className={revView === "donut" ? "active" : ""} onClick={() => setRevView("donut")}>Mix</button>
                <button className={revView === "trend" ? "active" : ""} onClick={() => setRevView("trend")}>12-month</button>
              </div>
            </div>
            <div className="pm-card-pad">
              {revView === "donut" ? (
                <div className="row g-3 align-items-center">
                  <div className="col-12 col-sm-5 d-flex justify-content-center">
                    <Donut size={168} thickness={26}
                      data={REVENUE_SOURCES.map((r) => ({ label: r.source, value: r.amount, color: r.color }))}
                      center={<div><div className="pm-eyebrow">Revenue</div>
                        <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1rem" }}>KES 186M</div>
                        <div style={{ fontSize: ".64rem", color: "var(--pm-green-dark)", fontWeight: 700 }}>+18.4%</div></div>} />
                  </div>
                  <div className="col-12 col-sm-7">
                    {REVENUE_SOURCES.map((r) => (
                      <button key={r.source} className="d-flex align-items-center gap-2 w-100 border-0 bg-transparent py-1 px-0 cursor-pointer"
                        style={{ borderBottom: "1px dashed #eaedf3" }} onClick={() => setRevSource(r)}>
                        <span className="pm-legend-dot" style={{ background: r.color }} />
                        <span className="flex-grow-1 text-start" style={{ fontSize: ".78rem", fontWeight: 600 }}>{r.source}</span>
                        <span className="pm-num" style={{ fontWeight: 700 }}>{kes(r.amount, { compact: true })}</span>
                        <span style={{ fontSize: ".68rem", color: "var(--pm-muted)", width: 38, textAlign: "right" }}>{r.pct}%</span>
                        <i className={`bi ${r.trend === "up" ? "bi-arrow-up-right" : r.trend === "down" ? "bi-arrow-down-right" : "bi-dash"}`}
                          style={{ fontSize: ".7rem", color: r.trend === "up" ? "#12b76a" : r.trend === "down" ? "#f04438" : "#98a2b3" }} />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ height: 236 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={REVENUE_12M} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eef1f6" vertical={false} />
                      <XAxis dataKey="m" tick={{ fontSize: 10, fill: "#667085" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#667085" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e6e9f0", fontSize: 12 }} formatter={(v) => [`KES ${String(v)}M`, ""]} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="rev" name="Revenue" fill="#12b76a" radius={[5, 5, 0, 0]} />
                      <Bar dataKey="cost" name="Cost" fill="#d0d5dd" radius={[5, 5, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-7">
          <div className="pm-card h-100">
            <div className="pm-card-head">
              <div><h6 className="pm-card-title">System health</h6><p className="pm-card-sub">Nine subsystems · probes every 30 seconds · click a tile for detail</p></div>
              <div className="d-flex gap-2 align-items-center">
                <Badge tone="green" dot>8 healthy</Badge><Badge tone="amber" dot>1 attention</Badge>
              </div>
            </div>
            <div className="pm-card-pad">
              <div className="row g-2">
                {SYSTEM_HEALTH.map((h) => (
                  <div className="col-6 col-lg-4" key={h.id}>
                    <button className="pm-health" onClick={() => setHealth(h)}>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className={`pm-dot ${h.status === "ok" ? "green" : h.status === "warn" ? "amber" : "red"} ${h.status !== "ok" ? "pm-pulse" : ""}`} />
                        <span style={{ fontSize: ".72rem", fontWeight: 700, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.name}</span>
                        <i className={`bi ${h.icon}`} style={{ fontSize: ".78rem", color: "var(--pm-muted)" }} />
                      </div>
                      <div style={{ fontFamily: "Sora", fontWeight: 700, fontSize: ".95rem" }}>{h.headline}</div>
                      <div style={{ fontSize: ".67rem", color: "var(--pm-muted)", lineHeight: 1.25, minHeight: 26 }}>{h.detail}</div>
                      <div style={{ fontSize: ".62rem", color: "#98a2b3", marginTop: ".2rem" }}><i className="bi bi-clock me-1" />{h.lastCheck}</div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================ 1.5 Critical alerts ============================ */}
      <div className="pm-section-head">
        <div><h2>Critical alerts</h2><p>Everything that needs a human decision right now — grouped by priority and routed to an owning team.</p></div>
        <div className="d-flex gap-2 flex-wrap">
          {alertSel.length > 0 && (
            <button className="btn btn-outline-primary btn-sm" onClick={() => setBulkAlertOpen(true)}>
              <i className="bi bi-check2-square me-1" />Bulk action ({alertSel.length})
            </button>
          )}
          <button className="btn btn-outline-secondary btn-sm" onClick={() => { csvDownload("critical-alerts.csv", ALERTS as unknown as Record<string, unknown>[]); push({ kind: "success", title: "Alerts exported", body: `${ALERTS.length} rows written to CSV.` }); }}>
            <i className="bi bi-download me-1" />Export
          </button>
        </div>
      </div>
      <div className="pm-card">
        <div className="pm-tabs">
          {([["all", "All"], ["critical", "Critical"], ["warning", "Warning"], ["info", "Info"]] as const).map(([k, l]) => (
            <button key={k} className={`pm-tab ${alertFilter === k ? "active" : ""}`} onClick={() => setAlertFilter(k)}>
              {k !== "all" && <span className={`pm-dot ${k === "critical" ? "red" : k === "warning" ? "amber" : "blue"}`} />}
              {l}<span className="cnt">{alertCounts[k]}</span>
            </button>
          ))}
          <div className="ms-auto d-flex align-items-center pe-2" style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>
            <i className="bi bi-arrow-clockwise me-1" />auto-refresh 30s
          </div>
        </div>
        <div className="p-2 d-flex flex-column gap-2" style={{ maxHeight: 420, overflowY: "auto" }}>
          {visibleAlerts.map((a) => (
            <div key={a.id} className={`pm-alert-row ${a.priority === "critical" ? "crit" : a.priority === "warning" ? "warn" : "info"}`}>
              <input type="checkbox" className="form-check-input mt-1" checked={alertSel.includes(a.id)}
                onChange={(e) => setAlertSel(e.target.checked ? [...alertSel, a.id] : alertSel.filter((x) => x !== a.id))} />
              <span className={`pm-dot ${a.priority === "critical" ? "red pm-pulse" : a.priority === "warning" ? "amber" : "blue"}`} style={{ marginTop: 6 }} />
              <button className="flex-grow-1 border-0 bg-transparent text-start p-0" onClick={() => setAlert(a)} style={{ minWidth: 0 }}>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span style={{ fontWeight: 700, fontSize: ".84rem" }}>{a.title}</span>
                  {ackd.includes(a.id) && <Badge tone="green">Acknowledged</Badge>}
                </div>
                <div style={{ fontSize: ".76rem", color: "var(--pm-muted)" }}>{a.detail}</div>
                <div className="d-flex gap-2 mt-1 flex-wrap align-items-center">
                  <Badge tone="grey">{a.category}</Badge>
                  <Badge tone="violet">{a.owner}</Badge>
                  <span style={{ fontSize: ".7rem", color: "var(--pm-muted)" }} className="mono">{a.id}</span>
                  <span style={{ fontSize: ".7rem", color: "var(--pm-muted)" }}><i className="bi bi-clock me-1" />{a.age}</span>
                  <span style={{ fontSize: ".7rem", fontWeight: 700, color: "#b42318" }}>{a.impact}</span>
                </div>
              </button>
              <div className="d-flex align-items-center gap-1 flex-none">
                <button className="btn btn-sm btn-outline-primary" onClick={() => setAlert(a)}>{a.action} →</button>
                <Dropdown width={220} trigger={() => <button className="pm-icon-btn" style={{ width: 30, height: 30 }}><i className="bi bi-three-dots-vertical" /></button>}>
                  {(close) => (<>
                    <DDItem icon="bi-eye" label="Open detail drawer" onClick={() => { close(); setAlert(a); }} />
                    <DDItem icon="bi-check2" label="Acknowledge" onClick={() => { close(); setAckd((p) => [...p, a.id]); push({ kind: "success", title: `${a.id} acknowledged` }); }} />
                    <DDItem icon="bi-alarm" label="Snooze 30 minutes" onClick={() => { close(); push({ kind: "info", title: `${a.id} snoozed`, body: "It will resurface at 15:05 EAT." }); }} />
                    <DDItem icon="bi-person-check" label="Assign to me" onClick={() => { close(); push({ kind: "success", title: `${a.id} assigned to Jeckonia Kwasa` }); }} />
                    <div className="pm-dd-sep" />
                    <DDItem icon="bi-fire" label="Escalate to incident" danger onClick={() => { close(); push({ kind: "warn", title: "Incident created", body: `INC-2026-0092 opened from ${a.id} · on-call paged.` }); }} />
                  </>)}
                </Dropdown>
              </div>
            </div>
          ))}
          {visibleAlerts.length === 0 && <EmptyState icon="bi-shield-check" title="No alerts in this bucket" body="Everything in this priority is clear."
            action={<button className="btn btn-outline-secondary btn-sm" onClick={() => setAlertFilter("all")}>Show all alerts</button>} />}
        </div>
      </div>

      {/* ============================ 1.6 Transaction volume ============================ */}
      <div className="pm-section-head">
        <div><h2>Transaction volume — last 24 hours</h2><p>Today against yesterday with success-rate overlay. Click any hour to open the drill-down.</p></div>
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <div className="pm-seg">
            <button className={chartMode === "count" ? "active" : ""} onClick={() => setChartMode("count")}>Count</button>
            <button className={chartMode === "value" ? "active" : ""} onClick={() => setChartMode("value")}>Value (KES M)</button>
          </div>
          <div className="form-check form-switch mb-0">
            <input className="form-check-input" type="checkbox" id="cmp" checked={chartCompare} onChange={(e) => setChartCompare(e.target.checked)} />
            <label className="form-check-label" htmlFor="cmp" style={{ fontSize: ".78rem" }}>Compare yesterday</label>
          </div>
        </div>
      </div>
      <div className="pm-card">
        <div className="pm-card-head">
          <div className="d-flex gap-3 flex-wrap">
            {[{ l: "Peak hour", v: "18:00 · 16,890 txns" }, { l: "Today total", v: num(TX_24H.reduce((s, h) => s + h.today, 0)) },
              { l: "Avg success", v: "99.2%" }, { l: "Anomalies", v: "3 flagged" }].map((x) => (
              <div key={x.l}><div className="pm-eyebrow">{x.l}</div><div style={{ fontWeight: 700, fontSize: ".84rem" }}>{x.v}</div></div>
            ))}
          </div>
          <div className="d-flex gap-2">
            <Badge tone="amber" dot>3 anomaly markers</Badge>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setHour(TX_24H[12])}><i className="bi bi-zoom-in me-1" />Open peak hour</button>
          </div>
        </div>
        <div className="pm-card-pad" style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}
              onClick={(e) => { const i = e?.activeTooltipIndex; if (typeof i === "number") setHour(TX_24H[i]); }}>
              <defs>
                <linearGradient id="gToday" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#12b76a" stopOpacity={0.32} /><stop offset="100%" stopColor="#12b76a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef1f6" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#667085" }} axisLine={false} tickLine={false} interval={2} />
              <YAxis yAxisId="l" tick={{ fontSize: 10, fill: "#667085" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="r" orientation="right" domain={[97, 100]} tick={{ fontSize: 10, fill: "#98a2b3" }} axisLine={false} tickLine={false} width={34} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e6e9f0", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {chartCompare && <Area yAxisId="l" type="monotone" dataKey="yesterday" name="Yesterday" stroke="#c3cbd9" fill="#f3f5f9" strokeWidth={1.5} strokeDasharray="4 3" />}
              <Area yAxisId="l" type="monotone" dataKey="today" name="Today" stroke="#12b76a" fill="url(#gToday)" strokeWidth={2.4} />
              <Line yAxisId="r" type="monotone" dataKey="success" name="Success %" stroke="#f79009" strokeWidth={1.6} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="p-2 pt-0 d-flex gap-2 flex-wrap">
          {TX_24H.filter((h) => h.anomaly).map((h) => (
            <button key={h.hour} className="pm-chip" onClick={() => setHour(h)}>
              <i className="bi bi-activity me-1" style={{ color: "#f79009" }} />{h.hour} — {h.anomaly}
            </button>
          ))}
        </div>
      </div>

      {/* ============================ 1.7 Defaulters & credit risk ============================ */}
      <div className="pm-section-head">
        <div><h2>Defaulters & credit risk</h2><p>KES 34.5M at risk across 1,247 defaulting accounts. The 24 largest exposures are listed below with their recovery state.</p></div>
        <div className="d-flex gap-2 flex-wrap">
          {dSel.length > 0 && (
            <button className="btn btn-outline-primary btn-sm" onClick={() => { push({ kind: "success", title: `Recovery campaign queued`, body: `${dSel.length} accounts assigned · SMS + call task created for each.` }); setDSel([]); }}>
              <i className="bi bi-send me-1" />Queue campaign ({dSel.length})
            </button>
          )}
          <button className="btn btn-outline-secondary btn-sm" onClick={() => { csvDownload("defaulters.csv", filteredDefaulters as unknown as Record<string, unknown>[]); push({ kind: "success", title: "Defaulter book exported", body: `${filteredDefaulters.length} rows.` }); }}>
            <i className="bi bi-download me-1" />Export book
          </button>
        </div>
      </div>
      <div className="row g-3">
        <div className="col-12 col-xxl-4">
          <div className="pm-card h-100">
            <div className="pm-card-head"><div><h6 className="pm-card-title">Credit risk summary</h6><p className="pm-card-sub">Month-on-month movement</p></div></div>
            <div className="pm-card-pad">
              <div className="row g-2">
                {CREDIT_METRICS.map((m) => (
                  <div className="col-6" key={m.label}>
                    <div className="pm-stat" style={{ padding: ".6rem .7rem" }}>
                      <div className="pm-stat-label" style={{ fontSize: ".58rem" }}>{m.label}</div>
                      <div style={{ fontFamily: "Sora", fontWeight: 700, fontSize: "1rem" }}>{m.value}</div>
                      <div style={{ fontSize: ".66rem", fontWeight: 700, color: m.tone === "good" ? "#0b8f52" : m.tone === "bad" ? "#d92d20" : "#667085" }}>
                        <i className={`bi ${m.trend === "up" ? "bi-arrow-up-right" : m.trend === "down" ? "bi-arrow-down-right" : "bi-dash"}`} /> {m.mom}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pm-card-pad px-0 pb-0">
                <div className="pm-eyebrow mb-1">Amount at risk vs recovered (KES M)</div>
                <div style={{ height: 120 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={DEFAULTER_TREND} margin={{ top: 4, right: 4, left: -26, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eef1f6" vertical={false} />
                      <XAxis dataKey="m" tick={{ fontSize: 10, fill: "#667085" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#667085" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e6e9f0", fontSize: 12 }} />
                      <Bar dataKey="risk" name="At risk" fill="#f04438" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="recovered" name="Recovered" fill="#12b76a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-xxl-8">
          <div className="pm-card h-100">
            <div className="pm-card-head">
              <div><h6 className="pm-card-title">Defaulting accounts</h6><p className="pm-card-sub">Sortable · filterable · click a row for the full collection history</p></div>
              <div className="d-flex gap-2 flex-wrap">
                <div className="pm-search" style={{ minWidth: 190 }}>
                  <i className="bi bi-search" /><input placeholder="Name, ID, county…" value={dq} onChange={(e) => { setDq(e.target.value); setDPage(1); }} />
                </div>
                <select className="form-select form-select-sm" style={{ width: 132 }} value={dStatus} onChange={(e) => { setDStatus(e.target.value); setDPage(1); }}>
                  <option value="all">All statuses</option>
                  {["Recovering", "Negotiating", "Legal", "Unreachable", "Restructured"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="pm-tabs">
              {([["all", "All", DEFAULTERS.length], ["30d", "30d+", DEFAULTERS.filter((d) => d.bucket === "30d").length],
                ["60d", "60d+", DEFAULTERS.filter((d) => d.bucket === "60d").length], ["90d", "90d+", DEFAULTERS.filter((d) => d.bucket === "90d").length]] as const).map(([k, l, c]) => (
                <button key={k} className={`pm-tab ${dBucket === k ? "active" : ""}`} onClick={() => { setDBucket(k as typeof dBucket); setDPage(1); }}>
                  {l}<span className="cnt">{c}</span>
                </button>
              ))}
            </div>
            {dSel.length > 0 && (
              <div className="pm-bulkbar">
                <b style={{ fontSize: ".82rem" }}>{dSel.length} selected</b>
                <button className="btn btn-sm btn-light" onClick={() => { push({ kind: "success", title: "Reminder SMS queued", body: `${dSel.length} customers · template ARR-03.` }); setDSel([]); }}><i className="bi bi-chat-dots me-1" />Send reminder</button>
                <button className="btn btn-sm btn-light" onClick={() => { push({ kind: "success", title: "Assigned to Grace Wanjiru", body: `${dSel.length} cases moved to her queue.` }); setDSel([]); }}><i className="bi bi-person-check me-1" />Assign agent</button>
                <button className="btn btn-sm btn-light" onClick={() => { setRecovery(DEFAULTERS.find((d) => d.id === dSel[0]) ?? null); }}><i className="bi bi-cash-coin me-1" />Recovery plan</button>
                <button className="btn btn-sm btn-outline-light ms-auto" onClick={() => setDSel([])}>Clear</button>
              </div>
            )}
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead>
                  <tr>
                    <th style={{ width: 34 }}>
                      <input type="checkbox" className="form-check-input" checked={dSel.length === pagedDefaulters.length && pagedDefaulters.length > 0}
                        onChange={(e) => setDSel(e.target.checked ? pagedDefaulters.map((d) => d.id) : [])} />
                    </th>
                    {([["user", "Customer"], ["product", "Product"], ["outstanding", "Outstanding"], ["daysPastDue", "DPD"],
                      ["status", "Status"], ["agent", "Agent"], ["score", "Risk"]] as const).map(([k, l]) => (
                      <th key={k} className="cursor-pointer" onClick={() => sortBy(k as keyof Defaulter)}>
                        {l} {dSort.k === k && <i className={`bi bi-caret-${dSort.dir === 1 ? "up" : "down"}-fill`} style={{ fontSize: ".55rem" }} />}
                      </th>
                    ))}
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {pagedDefaulters.map((d) => (
                    <tr key={d.id} className={dSel.includes(d.id) ? "selected" : ""} onClick={() => setDefaulter(d)}>
                      <td onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="form-check-input" checked={dSel.includes(d.id)}
                          onChange={(e) => setDSel(e.target.checked ? [...dSel, d.id] : dSel.filter((x) => x !== d.id))} />
                      </td>
                      <td><div className="d-flex align-items-center gap-2"><Avatar name={d.user} size="sm" />
                        <div><div className="pm-td-strong">{d.user}</div><div className="pm-td-sub mono">{d.account} · {d.county}</div></div></div></td>
                      <td><Badge tone="grey">{d.product}</Badge></td>
                      <td><span className="pm-num" style={{ fontWeight: 700, color: "#b42318" }}>{kes(d.outstanding)}</span>
                        <div className="pm-td-sub">principal {kes(d.principal, { compact: true })}</div></td>
                      <td><Badge tone={d.daysPastDue >= 90 ? "red" : d.daysPastDue >= 60 ? "amber" : "blue"}>{d.daysPastDue}d</Badge></td>
                      <td><Badge tone={d.status === "Legal" ? "red" : d.status === "Restructured" ? "green" : d.status === "Unreachable" ? "grey" : "amber"}>{d.status}</Badge></td>
                      <td><span style={{ fontSize: ".78rem" }}>{d.agent}</span><div className="pm-td-sub">{d.attempts} attempts</div></td>
                      <td><div className="d-flex align-items-center gap-2"><Meter value={d.score} tone={d.score > 70 ? "#f04438" : d.score > 40 ? "#f79009" : "#12b76a"} width={44} />
                        <span className="pm-num">{d.score}</span></div></td>
                      <td className="text-end" onClick={(e) => e.stopPropagation()}>
                        <Dropdown width={230} trigger={() => <button className="pm-icon-btn" style={{ width: 28, height: 28 }}><i className="bi bi-three-dots-vertical" /></button>}>
                          {(close) => (<>
                            <DDItem icon="bi-eye" label="View collection history" onClick={() => { close(); setDefaulter(d); }} />
                            <DDItem icon="bi-cash-coin" label="Build recovery plan" onClick={() => { close(); setRecovery(d); }} />
                            <DDItem icon="bi-chat-dots" label="Send reminder SMS" onClick={() => { close(); push({ kind: "success", title: "Reminder queued", body: `${d.phone} · template ARR-03.` }); }} />
                            <DDItem icon="bi-telephone" label="Call customer" onClick={() => { close(); push({ kind: "info", title: `Dialling ${d.phone}`, body: "Softphone session opened — call recorded." }); }} />
                            <div className="pm-dd-sep" />
                            <DDItem icon="bi-snow" label="Freeze this account" danger onClick={() => { close(); setFreezeOpen(true); }} />
                          </>)}
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                  {pagedDefaulters.length === 0 && (
                    <tr><td colSpan={9}><EmptyState icon="bi-search" title="No defaulters match your filters"
                      body="Try widening the arrears bucket or clearing the search."
                      action={<button className="btn btn-outline-secondary btn-sm" onClick={() => { setDq(""); setDBucket("all"); setDStatus("all"); }}>Clear all filters</button>} /></td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={dPage} pageSize={dSize} total={filteredDefaulters.length} onPage={setDPage} onPageSize={setDSize} />
          </div>
        </div>
      </div>

      {/* ============================ 1.8 Quick actions ============================ */}
      <div className="pm-section-head">
        <div><h2>Quick actions</h2><p>The twelve highest-frequency admin operations. Anything destructive asks for 2FA and a reason first.</p></div>
        <Badge tone="grey">Tier 0 — all unlocked</Badge>
      </div>
      <div className="pm-card pm-card-pad">
        <div className="row g-2">
          {QUICK_ACTIONS.map((a) => (
            <div className="col-6 col-md-4 col-lg-3 col-xxl-2" key={a.id}>
              <button className="pm-qa" onClick={() => runQuickAction(a)}>
                <i className={`bi ${a.icon}`} style={{ color: a.tone }} />
                <span className="t">{a.label}</span>
                <span className="s">{a.hint}</span>
                {a.confirm !== "None" && <Badge tone={a.confirm.includes("super") ? "red" : "amber"}>{a.confirm}</Badge>}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ============================ 1.9 Activity feed + 1.10 Channels ============================ */}
      <div className="row g-3 mt-0">
        <div className="col-12 col-xxl-7">
          <div className="pm-section-head"><div><h2>Recent admin activity</h2><p>Last 20 privileged actions — every entry is immutable and exportable as legal evidence.</p></div></div>
          <div className="pm-card">
            <div className="pm-card-head">
              <div className="d-flex gap-1 flex-wrap">
                {feedCategories.slice(0, 7).map((c) => (
                  <button key={c} className={`pm-chip ${feedFilter === c ? "active" : ""}`} onClick={() => setFeedFilter(c)}>{c}</button>
                ))}
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="pm-live"><span className="pm-dot green pm-pulse" />auto {feedTick}</span>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => { csvDownload("admin-activity.csv", ACTIVITY as unknown as Record<string, unknown>[]); push({ kind: "success", title: "Audit trail exported", body: "20 entries · watermarked." }); }}>
                  <i className="bi bi-download" />
                </button>
              </div>
            </div>
            <div className="pm-table-wrap" style={{ maxHeight: 470, overflowY: "auto" }}>
              <table className="pm-table">
                <thead><tr><th>When</th><th>Admin</th><th>Action</th><th>Target</th><th>IP</th><th /></tr></thead>
                <tbody>
                  {feed.map((a) => (
                    <tr key={a.id} onClick={() => setActivity(a)}>
                      <td><span className="pm-td-strong" style={{ fontSize: ".76rem" }}>{a.time}</span><div className="pm-td-sub mono">{a.id}</div></td>
                      <td><div className="d-flex align-items-center gap-2"><Avatar name={a.admin} size="sm" />
                        <div><div className="pm-td-strong" style={{ fontSize: ".78rem" }}>{a.admin.split(" ")[0]} {a.admin.split(" ")[1]?.[0]}.</div>
                          <div className="pm-td-sub">{a.role}</div></div></div></td>
                      <td><Badge tone={a.tone}>{a.action}</Badge></td>
                      <td><span className="pm-td-strong mono" style={{ fontSize: ".76rem" }}>{a.target}</span>
                        <div className="pm-td-sub" style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.details}</div></td>
                      <td className="mono" style={{ fontSize: ".72rem" }}>{a.ip}</td>
                      <td className="text-end"><i className="bi bi-chevron-right" style={{ color: "#c3cbd9" }} /></td>
                    </tr>
                  ))}
                  {feed.length === 0 && <tr><td colSpan={6}><EmptyState icon="bi-clock-history" title="No activity in this category"
                    action={<button className="btn btn-outline-secondary btn-sm" onClick={() => setFeedFilter("All")}>Show all</button>} /></td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-12 col-xxl-5">
          <div className="pm-section-head"><div><h2>Channel distribution</h2><p>Where the money moves and what each rail earns.</p></div></div>
          <div className="pm-card">
            <div className="pm-card-pad">
              <div className="row g-3 align-items-center">
                <div className="col-12 col-sm-5 d-flex justify-content-center">
                  <Donut size={158} thickness={24} data={CHANNELS.map((c) => ({ label: c.name, value: c.share, color: c.color }))}
                    center={<div><div className="pm-eyebrow">Volume</div><div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: ".95rem" }}>KES 18.6B</div></div>} />
                </div>
                <div className="col-12 col-sm-7">
                  {CHANNELS.map((c) => (
                    <button key={c.name} className="d-flex align-items-center gap-2 w-100 border-0 bg-transparent py-1 px-0"
                      style={{ borderBottom: "1px dashed #eaedf3" }} onClick={() => setChannel(c)}>
                      <span className="pm-legend-dot" style={{ background: c.color }} />
                      <span className="flex-grow-1 text-start" style={{ fontSize: ".78rem", fontWeight: 600 }}>{c.name}</span>
                      <span style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{c.share}%</span>
                      <span className="pm-num" style={{ fontWeight: 700, width: 66, textAlign: "right" }}>{kes(c.revenue, { compact: true })}</span>
                      <span style={{ fontSize: ".68rem", fontWeight: 700, width: 46, textAlign: "right", color: c.growth >= 0 ? "#0b8f52" : "#d92d20" }}>
                        {c.growth >= 0 ? "+" : ""}{c.growth}%
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Channel</th><th className="text-end">Txns</th><th className="text-end">Avg ticket</th><th className="text-end">Success</th><th /></tr></thead>
                <tbody>
                  {CHANNELS.map((c) => (
                    <tr key={c.name} onClick={() => setChannel(c)}>
                      <td><span className="pm-legend-dot me-2" style={{ background: c.color }} /><span className="pm-td-strong">{c.name}</span></td>
                      <td className="text-end pm-num">{num(c.txns)}</td>
                      <td className="text-end pm-num">{kes(c.avgTicket)}</td>
                      <td className="text-end"><Badge tone={c.successRate >= 99 ? "green" : "amber"}>{c.successRate}%</Badge></td>
                      <td className="text-end"><i className="bi bi-chevron-right" style={{ color: "#c3cbd9" }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ============================ 1.11 Tasks & deadlines ============================ */}
      <div className="pm-section-head">
        <div><h2>Upcoming tasks & deadlines</h2><p>Regulatory filings, partner commitments and platform work with an owner and a due date attached.</p></div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => { csvDownload("tasks.csv", tasks as unknown as Record<string, unknown>[]); push({ kind: "success", title: "Task board exported" }); }}>
            <i className="bi bi-download me-1" />Export
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setNewTaskOpen(true)}><i className="bi bi-plus-lg me-1" />New task</button>
        </div>
      </div>
      <div className="pm-card mb-4">
        <div className="pm-tabs">
          {taskTabs.map((t) => (
            <button key={t} className={`pm-tab ${taskTab === t ? "active" : ""}`} onClick={() => setTaskTab(t)}>
              {t}<span className="cnt">{t === "All" ? tasks.length : t === "High" ? tasks.filter((x) => x.priority === "High").length : tasks.filter((x) => x.status === t).length}</span>
            </button>
          ))}
        </div>
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Task</th><th>Category</th><th>Due</th><th>Owner</th><th>Priority</th><th>Status</th><th style={{ width: 150 }}>Progress</th><th /></tr></thead>
            <tbody>
              {visibleTasks.map((t) => (
                <tr key={t.id} onClick={() => setTask(t)}>
                  <td><span className="pm-td-strong">{t.task}</span><div className="pm-td-sub mono">{t.id}</div></td>
                  <td><Badge tone="grey">{t.category}</Badge></td>
                  <td><span style={{ fontSize: ".78rem", fontWeight: 600 }}>{t.due}</span></td>
                  <td><div className="d-flex align-items-center gap-2"><Avatar name={t.assigned} size="sm" /><span style={{ fontSize: ".78rem" }}>{t.assigned}</span></div></td>
                  <td><Badge tone={t.priority === "High" ? "red" : t.priority === "Medium" ? "amber" : "grey"}>{t.priority}</Badge></td>
                  <td><Badge tone={t.status === "Done" ? "green" : t.status === "Blocked" ? "red" : t.status === "In progress" ? "blue" : "grey"} dot>{t.status}</Badge></td>
                  <td><div className="d-flex align-items-center gap-2">
                    <Meter value={t.progress} tone={t.progress === 100 ? "#12b76a" : t.status === "Blocked" ? "#f04438" : "#2e90fa"} width={80} />
                    <span className="pm-num">{t.progress}%</span></div></td>
                  <td className="text-end" onClick={(e) => e.stopPropagation()}>
                    <Dropdown width={220} up trigger={() => <button className="pm-icon-btn" style={{ width: 28, height: 28 }}><i className="bi bi-three-dots-vertical" /></button>}>
                      {(close) => (<>
                        <DDItem icon="bi-pencil" label="Open & edit task" onClick={() => { close(); setTask(t); }} />
                        <DDItem icon="bi-check2-circle" label="Mark as done" onClick={() => { close(); setTasks((p) => p.map((x) => x.id === t.id ? { ...x, status: "Done", progress: 100 } : x)); push({ kind: "success", title: `${t.id} completed` }); }} />
                        <DDItem icon="bi-bell" label="Remind me in 48h" onClick={() => { close(); push({ kind: "info", title: "Reminder scheduled", body: `${t.id} · 48 hours before ${t.due}.` }); }} />
                        <DDItem icon="bi-person-plus" label="Reassign" onClick={() => { close(); setTask(t); }} />
                      </>)}
                    </Dropdown>
                  </td>
                </tr>
              ))}
              {visibleTasks.length === 0 && <tr><td colSpan={8}><EmptyState icon="bi-list-task" title="Nothing in this bucket"
                action={<button className="btn btn-outline-secondary btn-sm" onClick={() => setTaskTab("All")}>Show all tasks</button>} /></td></tr>}
            </tbody>
          </table>
        </div>
        <div className="pm-table-foot">
          <span>{visibleTasks.length} of {tasks.length} tasks · {tasks.filter((t) => t.priority === "High" && t.status !== "Done").length} high-priority still open</span>
          <button className="btn btn-sm btn-outline-primary" onClick={() => setNewTaskOpen(true)}><i className="bi bi-plus-lg me-1" />Add task</button>
        </div>
      </div>

      {/* ============================ Modals & drawers ============================ */}
      <FreezeAccountWizard open={freezeOpen} onClose={() => setFreezeOpen(false)} />
      <FeeScheduleWizard open={feesOpen} onClose={() => setFeesOpen(false)} />
      <ReconciliationModal open={reconOpen} onClose={() => setReconOpen(false)} />
      <ExportReportModal open={exportOpen} onClose={() => setExportOpen(false)} datasets={exportDatasets} />
      <UserSearchModal open={userSearchOpen} onClose={() => setUserSearchOpen(false)} onFreeze={() => setFreezeOpen(true)} />
      <PortfolioModal open={portfolioOpen} onClose={() => setPortfolioOpen(false)} />
      <NewTaskModal open={newTaskOpen} onClose={() => setNewTaskOpen(false)} onCreate={(t) => setTasks((p) => [t, ...p])} />
      <BulkAlertModal open={bulkAlertOpen} onClose={() => setBulkAlertOpen(false)} count={alertSel.length}
        onDone={(action) => {
          if (action === "acknowledge") setAckd((p) => [...p, ...alertSel]);
          push({ kind: "success", title: `${action} applied to ${alertSel.length} alerts`, body: "One audit entry written per alert." });
          setAlertSel([]);
        }} />
      <AlertDrawer alert={alert} onClose={() => setAlert(null)}
        onAction={(a, al) => {
          if (a === "Block") { setAlert(null); setFreezeOpen(true); return; }
          if (a === "Process") { setAlert(null); push({ kind: "success", title: "KYC batch queued", body: "312 clear results bulk-approved; 24 sent to manual review." }); return; }
          if (a === "Top up") { setAlert(null); push({ kind: "success", title: "Pool top-up initiated", body: "KES 60M sweep requested from i&M operating account." }); return; }
          setAckd((p) => [...p, al.id]);
          setAlert(null);
          push({ kind: "success", title: `${al.action} started on ${al.id}`, body: `Owner ${al.owner} notified · playbook step 1 complete.` });
        }} />
      <ActivityDrawer item={activity} onClose={() => setActivity(null)} />
      <HealthDrawer card={health} onClose={() => setHealth(null)} />
      <RevenueDrilldownModal source={revSource} onClose={() => setRevSource(null)} />
      <HourDrilldownModal hour={hour} onClose={() => setHour(null)} />
      <DefaulterDrawer item={defaulter} onClose={() => setDefaulter(null)} onRecover={(d) => { setDefaulter(null); setRecovery(d); }} />
      <RecoveryWizard item={recovery} onClose={() => setRecovery(null)} />
      <ChannelDrawer channel={channel} onClose={() => setChannel(null)} />
      <TaskModal task={task} onClose={() => setTask(null)} onSave={(t) => setTasks((p) => p.map((x) => x.id === t.id ? t : x))} />
      <QuickActionModal action={qa} onClose={() => setQa(null)} onRoute={onNavigate} />
    </>
  );
}
