import { useEffect, useMemo, useRef, useState } from "react";
import {
  Area, AreaChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Avatar, Badge, DDItem, Dropdown, EmptyState, Meter, Pagination, useToast } from "../../../components/ui";
import { csvDownload, kes, num } from "../../../lib/format";
import {
  CHANNEL_PERF, COUNTY_DATA, FRAUD_FEED, INCIDENTS, LATENCY_SERIES, LIVE_METRICS, LOGIN_STREAM,
  SEED_TX, SYSTEM_EVENTS, THROUGHPUT_SERIES, makeTx,
  type ChannelPerf, type County, type FraudAlert, type Incident, type LiveTx, type LoginEvent, type SystemEvent,
} from "../data/monitorData";
import {
  BlacklistModal, BlockTxModal, BreakerModal, BulkHoldModal, ChannelPerfDrawer, CountyModal, DlqModal,
  EventDrawer, FraudEscalationWizard, IncidentDrawer, IncidentWizard, LoginDrawer, ReverseTxModal,
  SnapshotModal, StreamFilterDrawer, ThresholdModal, TxDrawer, type StreamFilters,
} from "../modals/MonitorModals";

const fraudTone = (s: number) => (s <= 20 ? "green" : s <= 50 ? "amber" : s <= 75 ? "amber" : "red");
const statusTone = (s: string) =>
  s === "Complete" ? "green" : s === "Pending" ? "blue" : s === "Failed" ? "red" : s === "Held" ? "amber" : s === "Blocked" ? "red" : "grey";

export function RealTimeMonitor({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  const { push } = useToast();

  /* -------------------- live stream -------------------- */
  const [stream, setStream] = useState<LiveTx[]>(SEED_TX);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(2000);
  const counter = useRef(40);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      counter.current += 1;
      setStream((prev) => [makeTx(counter.current), ...prev].slice(0, 120));
    }, speed);
    return () => clearInterval(t);
  }, [paused, speed]);

  /* -------------------- live metrics -------------------- */
  const [metrics, setMetrics] = useState(LIVE_METRICS);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setMetrics((m) => m.map((x) => {
        const jitter = (Math.random() - 0.45) * (x.value * 0.06 + 0.4);
        const next = Math.max(0, Number((x.value + jitter).toFixed(x.format === "pct" ? 2 : 0)));
        return { ...x, prev: x.value, value: next };
      }));
    }, 5000);
    return () => clearInterval(t);
  }, [paused]);

  /* -------------------- modal state -------------------- */
  const [tx, setTx] = useState<LiveTx | null>(null);
  const [blockTx, setBlockTx] = useState<LiveTx | null>(null);
  const [reverseTx, setReverseTx] = useState<LiveTx | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [county, setCounty] = useState<County | null>(null);
  const [login, setLogin] = useState<LoginEvent | null>(null);
  const [blacklist, setBlacklist] = useState<LoginEvent | null>(null);
  const [chPerf, setChPerf] = useState<ChannelPerf | null>(null);
  const [breaker, setBreaker] = useState<ChannelPerf | null>(null);
  const [fraudCase, setFraudCase] = useState<FraudAlert | null>(null);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [incidentWizard, setIncidentWizard] = useState<{ open: boolean; prefill?: string }>({ open: false });
  const [thresholdOpen, setThresholdOpen] = useState(false);
  const [dlqOpen, setDlqOpen] = useState(false);
  const [sysEvent, setSysEvent] = useState<SystemEvent | null>(null);
  const [snapshotOpen, setSnapshotOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);

  useEffect(() => {
    if (!signal.n) return;
    if (signal.action === "export") setSnapshotOpen(true);
    if (signal.action === "freeze") setFilterOpen(true);
  }, [signal]);

  /* -------------------- filters -------------------- */
  const [filters, setFilters] = useState<StreamFilters>({ channels: [], types: [], statuses: [], minFraud: 0, minAmount: 0, county: "all" });
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(12);
  const [heatRange, setHeatRange] = useState("1h");
  const [chartView, setChartView] = useState<"throughput" | "latency">("throughput");
  const [loginTab, setLoginTab] = useState<"all" | "Failed" | "High">("all");
  const [eventSeverity, setEventSeverity] = useState<"all" | "info" | "warn" | "error">("all");

  const filtered = useMemo(() => stream.filter((t) => {
    if (filters.channels.length && !filters.channels.includes(t.channel)) return false;
    if (filters.types.length && !filters.types.includes(t.type)) return false;
    if (filters.statuses.length && !filters.statuses.includes(t.status)) return false;
    if (t.fraud < filters.minFraud) return false;
    if (t.amount < filters.minAmount) return false;
    if (filters.county !== "all" && t.geo !== filters.county) return false;
    if (q && !(t.id + t.fromName + t.from + (t.toName ?? "") + t.geo + t.ref).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [stream, filters, q]);

  const paged = filtered.slice((page - 1) * size, page * size);
  const activeFilterCount =
    filters.channels.length + filters.types.length + filters.statuses.length +
    (filters.minFraud > 0 ? 1 : 0) + (filters.minAmount > 0 ? 1 : 0) + (filters.county !== "all" ? 1 : 0);

  const maxCountyTx = Math.max(...COUNTY_DATA.map((c) => c.txns));
  const heatMultiplier = heatRange === "1h" ? 1 : heatRange === "6h" ? 5.4 : heatRange === "12h" ? 10.1 : 19.3;

  const visibleLogins = LOGIN_STREAM.filter((l) =>
    loginTab === "all" ? true : loginTab === "Failed" ? l.status !== "Success" : l.risk === "High"
  );
  const visibleEvents = SYSTEM_EVENTS.filter((e) => (eventSeverity === "all" ? true : e.severity === eventSeverity));

  const streamStats = useMemo(() => {
    const total = stream.length;
    const blocked = stream.filter((t) => t.status === "Blocked").length;
    const held = stream.filter((t) => t.status === "Held").length;
    const value = stream.reduce((s, t) => s + t.amount, 0);
    return { total, blocked, held, value };
  }, [stream]);

  return (
    <>
      {/* ============================ header ============================ */}
      <div className="pm-section-head" style={{ marginTop: 0 }}>
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="pm-eyebrow">Overview · Page 2</span>
            <span className="pm-live"><span className={`pm-dot green ${paused ? "" : "pm-pulse"}`} />{paused ? "PAUSED" : "STREAMING"}</span>
          </div>
          <h2>Real-Time Monitor</h2>
          <p>Every transaction, login, fraud decision and system event as it happens — with the controls to intervene before money leaves the platform.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <div className="pm-seg">
            <button className={speed === 1000 ? "active" : ""} onClick={() => setSpeed(1000)}>1s</button>
            <button className={speed === 2000 ? "active" : ""} onClick={() => setSpeed(2000)}>2s</button>
            <button className={speed === 5000 ? "active" : ""} onClick={() => setSpeed(5000)}>5s</button>
          </div>
          <button className={`btn btn-sm ${paused ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setPaused((p) => !p)}>
            <i className={`bi ${paused ? "bi-play-fill" : "bi-pause-fill"} me-1`} />{paused ? "Resume" : "Pause"}
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setThresholdOpen(true)}><i className="bi bi-sliders me-1" />Thresholds</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setSnapshotOpen(true)}><i className="bi bi-camera me-1" />Snapshot</button>
          <button className="btn btn-danger btn-sm" onClick={() => setIncidentWizard({ open: true })}><i className="bi bi-fire me-1" />Declare incident</button>
        </div>
      </div>

      {/* ============================ live metric rail ============================ */}
      <div className="pm-card mb-3">
        <div className="pm-card-head">
          <div><h6 className="pm-card-title">Live platform metrics</h6><p className="pm-card-sub">Refreshing every 5 seconds · thresholds configurable</p></div>
          <div className="d-flex gap-2 align-items-center">
            <Badge tone="green" dot>{metrics.filter((m) => m.value < m.threshold * 0.7).length} nominal</Badge>
            <Badge tone="amber" dot>{metrics.filter((m) => m.value >= m.threshold * 0.7 && m.value < m.threshold).length} elevated</Badge>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setThresholdOpen(true)}><i className="bi bi-gear" /></button>
          </div>
        </div>
        <div className="pm-card-pad">
          <div className="row g-2">
            {metrics.map((m) => {
              const pctOfThreshold = (m.value / m.threshold) * 100;
              const tone = pctOfThreshold >= 100 ? "#f04438" : pctOfThreshold >= 70 ? "#f79009" : "#12b76a";
              const rising = m.value > m.prev;
              return (
                <div className="col-6 col-md-4 col-lg-3 col-xxl-2" key={m.id}>
                  <div className="pm-stat" style={{ padding: ".6rem .7rem" }}>
                    <div className="pm-stat-label" style={{ fontSize: ".57rem" }}>{m.label}</div>
                    <div className="d-flex align-items-baseline gap-1">
                      <span style={{ fontFamily: "Sora", fontWeight: 700, fontSize: "1.1rem" }}>
                        {m.format === "pct" ? m.value.toFixed(2) : num(Math.round(m.value))}
                      </span>
                      <span style={{ fontSize: ".68rem", color: "var(--pm-muted)" }}>{m.unit}</span>
                      <span className="ms-auto" style={{ fontSize: ".64rem", fontWeight: 700, color: rising ? (m.invert ? "#d92d20" : "#0b8f52") : "#667085" }}>
                        <i className={`bi ${rising ? "bi-caret-up-fill" : "bi-caret-down-fill"}`} />
                      </span>
                    </div>
                    <Meter value={pctOfThreshold} tone={tone} width={200} />
                    <div style={{ fontSize: ".6rem", color: "var(--pm-muted)" }}>limit {m.format === "pct" ? m.threshold : num(m.threshold)}{m.unit}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============================ live transaction stream ============================ */}
      <div className="pm-section-head">
        <div><h2>Live transaction stream</h2><p>New rows arrive every {speed / 1000}s. Click any row for the full processing timeline, or select rows for a bulk hold.</p></div>
        <div className="d-flex gap-2 flex-wrap">
          {sel.length > 0 && <button className="btn btn-outline-primary btn-sm" onClick={() => setBulkOpen(true)}><i className="bi bi-pause-circle me-1" />Bulk action ({sel.length})</button>}
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setFilterOpen(true)}>
            <i className="bi bi-funnel me-1" />Filters{activeFilterCount > 0 && <span className="ms-1 pm-badge green">{activeFilterCount}</span>}
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => { csvDownload("live-stream.csv", filtered as unknown as Record<string, unknown>[]); push({ kind: "success", title: "Stream exported", body: `${filtered.length} rows captured.` }); }}>
            <i className="bi bi-download me-1" />Export
          </button>
        </div>
      </div>
      <div className="pm-card">
        <div className="pm-card-head">
          <div className="d-flex gap-3 flex-wrap">
            {[{ l: "Buffered", v: num(streamStats.total) }, { l: "Buffer value", v: kes(streamStats.value, { compact: true }) },
              { l: "Blocked", v: String(streamStats.blocked) }, { l: "Held", v: String(streamStats.held) }].map((x) => (
              <div key={x.l}><div className="pm-eyebrow">{x.l}</div><div style={{ fontWeight: 700, fontSize: ".84rem" }}>{x.v}</div></div>
            ))}
          </div>
          <div className="pm-search" style={{ minWidth: 200 }}>
            <i className="bi bi-search" /><input placeholder="TXN id, name, ref, county…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          </div>
        </div>
        {activeFilterCount > 0 && (
          <div className="d-flex gap-1 flex-wrap p-2 pb-0">
            {filters.channels.map((c) => <button key={c} className="pm-chip active" onClick={() => setFilters({ ...filters, channels: filters.channels.filter((x) => x !== c) })}>{c} ✕</button>)}
            {filters.types.map((c) => <button key={c} className="pm-chip active" onClick={() => setFilters({ ...filters, types: filters.types.filter((x) => x !== c) })}>{c} ✕</button>)}
            {filters.statuses.map((c) => <button key={c} className="pm-chip active" onClick={() => setFilters({ ...filters, statuses: filters.statuses.filter((x) => x !== c) })}>{c} ✕</button>)}
            {filters.minFraud > 0 && <button className="pm-chip active" onClick={() => setFilters({ ...filters, minFraud: 0 })}>Fraud ≥ {filters.minFraud} ✕</button>}
            {filters.minAmount > 0 && <button className="pm-chip active" onClick={() => setFilters({ ...filters, minAmount: 0 })}>≥ {kes(filters.minAmount)} ✕</button>}
            {filters.county !== "all" && <button className="pm-chip active" onClick={() => setFilters({ ...filters, county: "all" })}>{filters.county} ✕</button>}
            <button className="pm-chip" onClick={() => setFilters({ channels: [], types: [], statuses: [], minFraud: 0, minAmount: 0, county: "all" })}>Clear all</button>
          </div>
        )}
        {sel.length > 0 && (
          <div className="pm-bulkbar">
            <b style={{ fontSize: ".82rem" }}>{sel.length} transactions selected</b>
            <button className="btn btn-sm btn-light" onClick={() => setBulkOpen(true)}><i className="bi bi-pause-circle me-1" />Hold</button>
            <button className="btn btn-sm btn-light" onClick={() => { csvDownload("selected-txns.csv", stream.filter((t) => sel.includes(t.id)) as unknown as Record<string, unknown>[]); push({ kind: "success", title: "Selection exported" }); }}>
              <i className="bi bi-download me-1" />Export
            </button>
            <button className="btn btn-sm btn-outline-light ms-auto" onClick={() => setSel([])}>Clear</button>
          </div>
        )}
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead>
              <tr>
                <th style={{ width: 34 }}><input type="checkbox" className="form-check-input"
                  checked={sel.length === paged.length && paged.length > 0} onChange={(e) => setSel(e.target.checked ? paged.map((t) => t.id) : [])} /></th>
                <th>Time</th><th>Transaction</th><th>Type</th><th>Parties</th><th className="text-end">Amount</th>
                <th>Channel</th><th>Status</th><th>Fraud</th><th>Geo</th><th />
              </tr>
            </thead>
            <tbody>
              {paged.map((t) => (
                <tr key={t.id} className={sel.includes(t.id) ? "selected" : ""} onClick={() => setTx(t)}>
                  <td onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="form-check-input" checked={sel.includes(t.id)}
                      onChange={(e) => setSel(e.target.checked ? [...sel, t.id] : sel.filter((x) => x !== t.id))} />
                  </td>
                  <td className="mono" style={{ fontSize: ".75rem" }}>{t.time}</td>
                  <td><span className="pm-td-strong mono">{t.id}</span><div className="pm-td-sub mono">{t.ref}</div></td>
                  <td><Badge tone="grey">{t.type}</Badge></td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <Avatar name={t.fromName} size="sm" />
                      <div style={{ minWidth: 0 }}>
                        <div className="pm-td-strong" style={{ fontSize: ".77rem" }}>{t.fromName}</div>
                        <div className="pm-td-sub mono">{t.from}{t.toName ? ` → ${t.toName}` : ""}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-end"><span className="pm-num" style={{ fontWeight: 700 }}>{kes(t.amount)}</span>
                    <div className="pm-td-sub">fee {kes(t.fee)}</div></td>
                  <td><Badge tone={t.channel.includes("Card") ? "blue" : t.channel === "M-Pesa" ? "green" : t.channel === "Internal" ? "violet" : "grey"}>{t.channel}</Badge></td>
                  <td><Badge tone={statusTone(t.status)} dot>{t.status}</Badge></td>
                  <td><div className="d-flex align-items-center gap-2">
                    <span className={`pm-dot ${fraudTone(t.fraud) === "red" ? "red" : fraudTone(t.fraud) === "amber" ? "amber" : "green"}`} />
                    <span className="pm-num">{t.fraud}</span></div></td>
                  <td style={{ fontSize: ".77rem" }}>{t.geo}</td>
                  <td className="text-end" onClick={(e) => e.stopPropagation()}>
                    <Dropdown width={230} up trigger={() => <button className="pm-icon-btn" style={{ width: 28, height: 28 }}><i className="bi bi-three-dots-vertical" /></button>}>
                      {(close) => (<>
                        <DDItem icon="bi-eye" label="Open transaction detail" onClick={() => { close(); setTx(t); }} />
                        <DDItem icon="bi-pause-circle" label="Hold for review" onClick={() => { close(); push({ kind: "success", title: `${t.id} held`, body: "Funds reserved pending manual review." }); }} />
                        <DDItem icon="bi-arrow-counterclockwise" label="Reverse transaction" disabled={t.status !== "Complete"} onClick={() => { close(); setReverseTx(t); }} />
                        <DDItem icon="bi-person-lines-fill" label="View customer" onClick={() => { close(); push({ kind: "info", title: t.fromName, body: `${t.from} · ${t.geo} · ${t.device}` }); }} />
                        <div className="pm-dd-sep" />
                        <DDItem icon="bi-slash-circle" label="Block & freeze" danger onClick={() => { close(); setBlockTx(t); }} />
                      </>)}
                    </Dropdown>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={11}><EmptyState icon="bi-funnel" title="No transactions match these filters"
                  body="The stream is still running — widen your filters to see traffic."
                  action={<button className="btn btn-outline-secondary btn-sm" onClick={() => { setFilters({ channels: [], types: [], statuses: [], minFraud: 0, minAmount: 0, county: "all" }); setQ(""); }}>Clear all filters</button>} /></td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pageSize={size} total={filtered.length} onPage={setPage} onPageSize={setSize} />
      </div>

      {/* ============================ heatmap + channel perf ============================ */}
      <div className="row g-3">
        <div className="col-12 col-xl-5">
          <div className="pm-section-head"><div><h2>Geographic activity</h2><p>Transaction density by county — click a county to drill in.</p></div></div>
          <div className="pm-card">
            <div className="pm-card-head">
              <div className="pm-seg">
                {["1h", "6h", "12h", "24h"].map((r) => (
                  <button key={r} className={heatRange === r ? "active" : ""} onClick={() => setHeatRange(r)}>{r}</button>
                ))}
              </div>
              <Badge tone="grey">{COUNTY_DATA.length} counties reporting</Badge>
            </div>
            <div className="pm-card-pad">
              <div className="d-flex flex-column gap-1">
                {COUNTY_DATA.map((c) => {
                  const intensity = c.txns / maxCountyTx;
                  return (
                    <button key={c.name} className="d-flex align-items-center gap-2 border-0 bg-transparent p-1 w-100 text-start"
                      style={{ borderRadius: 8 }} onClick={() => setCounty(c)}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f7f9fc")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <span style={{ width: 92, fontSize: ".77rem", fontWeight: 600 }}>{c.name}</span>
                      <span style={{ flex: 1, height: 20, borderRadius: 6, background: "#f2f4f8", position: "relative", overflow: "hidden" }}>
                        <span style={{
                          position: "absolute", inset: 0, width: `${intensity * 100}%`,
                          background: `linear-gradient(90deg, rgba(18,183,106,${0.35 + intensity * 0.55}), rgba(11,143,82,${0.5 + intensity * 0.5}))`,
                          borderRadius: 6,
                        }} />
                        {intensity > 0.65 && <span className="pm-dot green pm-pulse" style={{ position: "absolute", right: 6, top: 6 }} />}
                      </span>
                      <span className="pm-num" style={{ width: 58, textAlign: "right" }}>{num(Math.round(c.txns * heatMultiplier))}</span>
                      <span style={{ width: 46, textAlign: "right", fontSize: ".68rem", fontWeight: 700, color: c.growth >= 10 ? "#0b8f52" : "#667085" }}>
                        +{c.growth}%
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="pm-note mt-2">
                <i className="bi bi-geo me-1" />Nairobi, Kiambu and Mombasa account for {(((COUNTY_DATA[0].txns + COUNTY_DATA[5].txns + COUNTY_DATA[1].txns) / COUNTY_DATA.reduce((s, c) => s + c.txns, 0)) * 100).toFixed(0)}% of all live traffic.
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-7">
          <div className="pm-section-head"><div><h2>Channel performance</h2><p>Throughput, success and circuit-breaker state per rail.</p></div>
            <div className="pm-seg">
              <button className={chartView === "throughput" ? "active" : ""} onClick={() => setChartView("throughput")}>Throughput</button>
              <button className={chartView === "latency" ? "active" : ""} onClick={() => setChartView("latency")}>Latency</button>
            </div>
          </div>
          <div className="pm-card">
            <div className="pm-card-pad" style={{ height: 218 }}>
              <ResponsiveContainer width="100%" height="100%">
                {chartView === "throughput" ? (
                  <AreaChart data={THROUGHPUT_SERIES} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
                    <defs>
                      {[["gm", "#12b76a"], ["gc", "#2e90fa"], ["gi", "#7a5af8"]].map(([id, col]) => (
                        <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={col} stopOpacity={0.3} /><stop offset="100%" stopColor={col} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef1f6" vertical={false} />
                    <XAxis dataKey="t" tick={{ fontSize: 10, fill: "#667085" }} axisLine={false} tickLine={false} interval={5} />
                    <YAxis tick={{ fontSize: 10, fill: "#667085" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e6e9f0", fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="mpesa" name="M-Pesa" stroke="#12b76a" fill="url(#gm)" strokeWidth={2} />
                    <Area type="monotone" dataKey="cards" name="Cards" stroke="#2e90fa" fill="url(#gc)" strokeWidth={2} />
                    <Area type="monotone" dataKey="internal" name="Internal" stroke="#7a5af8" fill="url(#gi)" strokeWidth={2} />
                  </AreaChart>
                ) : (
                  <LineChart data={LATENCY_SERIES} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef1f6" vertical={false} />
                    <XAxis dataKey="t" tick={{ fontSize: 10, fill: "#667085" }} axisLine={false} tickLine={false} interval={5} />
                    <YAxis tick={{ fontSize: 10, fill: "#667085" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e6e9f0", fontSize: 12 }} formatter={(v) => [`${String(v)} ms`, ""]} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="p50" name="p50" stroke="#12b76a" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="p95" name="p95" stroke="#f79009" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="p99" name="p99" stroke="#f04438" strokeWidth={2} dot={false} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Channel</th><th className="text-end">TXN/min</th><th className="text-end">Value/min</th><th className="text-end">Success</th>
                  <th className="text-end">Latency</th><th className="text-end">Errors</th><th>Breaker</th><th /></tr></thead>
                <tbody>
                  {CHANNEL_PERF.map((c) => (
                    <tr key={c.channel} onClick={() => setChPerf(c)}>
                      <td><span className="pm-legend-dot me-2" style={{ background: c.color }} /><span className="pm-td-strong">{c.channel}</span>
                        <div className="pm-td-sub">{c.provider}</div></td>
                      <td className="text-end pm-num">{c.tpm}</td>
                      <td className="text-end pm-num">{c.volPerMin ? kes(c.volPerMin, { compact: true }) : "—"}</td>
                      <td className="text-end">{c.success ? <Badge tone={c.success >= 99 ? "green" : "amber"}>{c.success}%</Badge> : <Badge tone="red">—</Badge>}</td>
                      <td className="text-end pm-num">{c.latency}</td>
                      <td className="text-end"><span className="pm-num" style={{ color: c.errors > 2 ? "#d92d20" : "#667085" }}>{c.errors}</span></td>
                      <td><Badge tone={c.breaker === "Closed" ? "green" : c.breaker === "Half-open" ? "amber" : "red"} dot>{c.breaker}</Badge></td>
                      <td className="text-end" onClick={(e) => e.stopPropagation()}>
                        <Dropdown width={220} up trigger={() => <button className="pm-icon-btn" style={{ width: 28, height: 28 }}><i className="bi bi-three-dots-vertical" /></button>}>
                          {(close) => (<>
                            <DDItem icon="bi-eye" label="Channel detail" onClick={() => { close(); setChPerf(c); }} />
                            <DDItem icon="bi-activity" label="Ping endpoint" onClick={() => { close(); push({ kind: "success", title: `${c.channel} probe`, body: "Health check returned 200 OK in 284 ms." }); }} />
                            <DDItem icon="bi-inboxes" label="View dead-letter queue" onClick={() => { close(); setDlqOpen(true); }} />
                            <div className="pm-dd-sep" />
                            <DDItem icon="bi-toggles" label={c.breaker === "Open" ? "Force breaker closed" : "Force breaker open"} danger onClick={() => { close(); setBreaker(c); }} />
                          </>)}
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pm-table-foot">
              <span>Aggregate {CHANNEL_PERF.reduce((s, c) => s + c.tpm, 0)} txn/min · {CHANNEL_PERF.filter((c) => c.breaker !== "Closed").length} breaker not closed</span>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setDlqOpen(true)}><i className="bi bi-inboxes me-1" />Dead-letter queue (12)</button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================ fraud feed + login stream ============================ */}
      <div className="row g-3">
        <div className="col-12 col-xl-7">
          <div className="pm-section-head"><div><h2>Fraud decision feed</h2><p>Every rule hit in the last 30 minutes with its score, action and rationale.</p></div>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => { csvDownload("fraud-feed.csv", FRAUD_FEED as unknown as Record<string, unknown>[]); push({ kind: "success", title: "Fraud feed exported" }); }}>
              <i className="bi bi-download me-1" />Export
            </button>
          </div>
          <div className="pm-card">
            <div className="pm-table-wrap" style={{ maxHeight: 430, overflowY: "auto" }}>
              <table className="pm-table">
                <thead><tr><th>Time</th><th>Case</th><th>Customer</th><th>Rule</th><th className="text-end">Amount</th><th>Score</th><th>Action</th><th /></tr></thead>
                <tbody>
                  {FRAUD_FEED.map((f) => (
                    <tr key={f.id} onClick={() => setFraudCase(f)}>
                      <td className="mono" style={{ fontSize: ".75rem" }}>{f.time}</td>
                      <td><span className="pm-td-strong mono">{f.id}</span><div className="pm-td-sub">{f.county}</div></td>
                      <td><div className="d-flex align-items-center gap-2"><Avatar name={f.name} size="sm" />
                        <div><div className="pm-td-strong" style={{ fontSize: ".77rem" }}>{f.name}</div><div className="pm-td-sub mono">{f.user}</div></div></div></td>
                      <td><span className="mono" style={{ fontSize: ".72rem" }}>{f.rule}</span>
                        <div className="pm-td-sub" style={{ maxWidth: 210, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.reason}</div></td>
                      <td className="text-end pm-num" style={{ fontWeight: 700 }}>{kes(f.amount)}</td>
                      <td><div className="d-flex align-items-center gap-2"><Meter value={f.score} tone={f.score > 75 ? "#f04438" : f.score > 50 ? "#f79009" : "#12b76a"} width={40} />
                        <span className="pm-num">{f.score}</span></div></td>
                      <td><Badge tone={f.action === "Auto-blocked" ? "red" : f.action === "Held for review" ? "amber" : f.action === "Cleared" ? "green" : "blue"}>{f.action}</Badge></td>
                      <td className="text-end" onClick={(e) => e.stopPropagation()}>
                        <Dropdown width={230} up trigger={() => <button className="pm-icon-btn" style={{ width: 28, height: 28 }}><i className="bi bi-three-dots-vertical" /></button>}>
                          {(close) => (<>
                            <DDItem icon="bi-shield-exclamation" label="Escalate & file SAR" onClick={() => { close(); setFraudCase(f); }} />
                            <DDItem icon="bi-check-circle" label="Clear as false positive" onClick={() => { close(); push({ kind: "success", title: `${f.id} cleared`, body: "Funds released and rule threshold feedback recorded." }); }} />
                            <DDItem icon="bi-person-lock" label="Freeze this customer" onClick={() => { close(); push({ kind: "warn", title: `${f.user} freeze requested`, body: "Opens the freeze wizard on the Dashboard." }); onNavigate("dashboard"); }} />
                            <DDItem icon="bi-sliders" label="Tune this rule" onClick={() => { close(); push({ kind: "info", title: `${f.rule}`, body: "Rule tuning is handled on Page 17 — Risk Scoring Engine." }); }} />
                          </>)}
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pm-table-foot">
              <span>{FRAUD_FEED.filter((f) => f.action === "Auto-blocked").length} auto-blocked · {FRAUD_FEED.filter((f) => f.action === "Held for review").length} held · {kes(FRAUD_FEED.reduce((s, f) => s + f.amount, 0), { compact: true })} screened</span>
              <button className="btn btn-sm btn-outline-primary" onClick={() => setFraudCase(FRAUD_FEED[0])}><i className="bi bi-shield-exclamation me-1" />Escalate top case</button>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-5">
          <div className="pm-section-head"><div><h2>Login stream</h2><p>Authentication events with device and risk context.</p></div></div>
          <div className="pm-card">
            <div className="pm-tabs">
              {([["all", "All"], ["Failed", "Failed / challenged"], ["High", "High risk"]] as const).map(([k, l]) => (
                <button key={k} className={`pm-tab ${loginTab === k ? "active" : ""}`} onClick={() => setLoginTab(k)}>
                  {l}<span className="cnt">{k === "all" ? LOGIN_STREAM.length : k === "Failed" ? LOGIN_STREAM.filter((x) => x.status !== "Success").length : LOGIN_STREAM.filter((x) => x.risk === "High").length}</span>
                </button>
              ))}
            </div>
            <div className="pm-table-wrap" style={{ maxHeight: 388, overflowY: "auto" }}>
              <table className="pm-table">
                <thead><tr><th>Time</th><th>User</th><th>Device / IP</th><th>Status</th><th>Risk</th></tr></thead>
                <tbody>
                  {visibleLogins.map((l) => (
                    <tr key={l.id} onClick={() => setLogin(l)}>
                      <td className="mono" style={{ fontSize: ".74rem" }}>{l.time}</td>
                      <td><div className="pm-td-strong" style={{ fontSize: ".77rem" }}>{l.name}</div><div className="pm-td-sub mono">{l.user}</div></td>
                      <td><div style={{ fontSize: ".74rem" }}>{l.device}</div><div className="pm-td-sub mono">{l.ip} · {l.location}</div></td>
                      <td><Badge tone={l.status === "Success" ? "green" : l.status === "Failed" ? "red" : "amber"} dot>{l.status}</Badge></td>
                      <td><Badge tone={l.risk === "High" ? "red" : l.risk === "Medium" ? "amber" : "green"}>{l.risk}</Badge></td>
                    </tr>
                  ))}
                  {visibleLogins.length === 0 && <tr><td colSpan={5}><EmptyState icon="bi-person-check" title="No events in this bucket"
                    action={<button className="btn btn-outline-secondary btn-sm" onClick={() => setLoginTab("all")}>Show all</button>} /></td></tr>}
                </tbody>
              </table>
            </div>
            <div className="pm-table-foot">
              <span>{LOGIN_STREAM.filter((l) => l.status === "Failed").length} failed in the last 3 minutes</span>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => { csvDownload("login-stream.csv", LOGIN_STREAM as unknown as Record<string, unknown>[]); push({ kind: "success", title: "Login stream exported" }); }}>
                <i className="bi bi-download" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================ system events + incidents ============================ */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-xl-7">
          <div className="pm-section-head"><div><h2>System event log</h2><p>Platform-level events across every service, newest first.</p></div>
            <div className="pm-seg">
              {(["all", "info", "warn", "error"] as const).map((s) => (
                <button key={s} className={eventSeverity === s ? "active" : ""} onClick={() => setEventSeverity(s)}>{s === "all" ? "All" : s}</button>
              ))}
            </div>
          </div>
          <div className="pm-card">
            <div className="p-2 d-flex flex-column gap-2" style={{ maxHeight: 400, overflowY: "auto" }}>
              {visibleEvents.map((e) => (
                <button key={e.id} className={`pm-alert-row ${e.severity === "error" ? "crit" : e.severity === "warn" ? "warn" : "info"} text-start`}
                  onClick={() => setSysEvent(e)}>
                  <span className={`pm-dot ${e.severity === "error" ? "red pm-pulse" : e.severity === "warn" ? "amber" : "blue"}`} style={{ marginTop: 6 }} />
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span className="mono" style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{e.time}</span>
                      <span style={{ fontWeight: 700, fontSize: ".82rem" }}>{e.message}</span>
                      <Badge tone="ink">{e.service}</Badge>
                    </div>
                    <div style={{ fontSize: ".75rem", color: "var(--pm-muted)" }}>{e.detail}</div>
                  </div>
                  <i className="bi bi-chevron-right" style={{ color: "#c3cbd9" }} />
                </button>
              ))}
              {visibleEvents.length === 0 && <EmptyState icon="bi-terminal" title="No events at this severity"
                action={<button className="btn btn-outline-secondary btn-sm" onClick={() => setEventSeverity("all")}>Show all</button>} />}
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-5">
          <div className="pm-section-head"><div><h2>Open incidents</h2><p>Active incident bridge with live status.</p></div>
            <button className="btn btn-danger btn-sm" onClick={() => setIncidentWizard({ open: true })}><i className="bi bi-plus-lg me-1" />Declare</button>
          </div>
          <div className="pm-card">
            <div className="p-2 d-flex flex-column gap-2">
              {INCIDENTS.map((i) => (
                <button key={i.id} className={`pm-alert-row ${i.severity === "P1" ? "crit" : i.severity === "P2" ? "warn" : "info"} text-start`} onClick={() => setIncident(i)}>
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                      <Badge tone={i.severity === "P1" ? "red" : i.severity === "P2" ? "amber" : "blue"}>{i.severity}</Badge>
                      <span style={{ fontWeight: 700, fontSize: ".84rem" }}>{i.title}</span>
                    </div>
                    <div style={{ fontSize: ".75rem", color: "var(--pm-muted)" }}>{i.impact}</div>
                    <div className="d-flex gap-2 mt-1 flex-wrap">
                      <Badge tone="grey">{i.status}</Badge><Badge tone="violet">{i.owner}</Badge>
                      <span className="mono" style={{ fontSize: ".7rem", color: "var(--pm-muted)" }}>{i.id} · {i.opened}</span>
                    </div>
                  </div>
                  <i className="bi bi-chevron-right" style={{ color: "#c3cbd9" }} />
                </button>
              ))}
            </div>
            <div className="pm-card-pad pt-0">
              <div className="pm-card pm-card-pad" style={{ background: "#f7f9fc" }}>
                <div className="pm-eyebrow mb-2">On-call right now</div>
                {[["Primary", "Mary Wanjiku", "Operations Manager"], ["Secondary", "James Odhiambo", "Platform Admin"], ["Escalation", "Jeckonia Kwasa", "Super Admin"]].map(([r, n, t]) => (
                  <div key={r} className="d-flex align-items-center gap-2 py-1">
                    <Avatar name={n} size="sm" />
                    <div className="flex-grow-1"><div style={{ fontSize: ".8rem", fontWeight: 700 }}>{n}</div>
                      <div style={{ fontSize: ".7rem", color: "var(--pm-muted)" }}>{t}</div></div>
                    <Badge tone="grey">{r}</Badge>
                  </div>
                ))}
                <button className="btn btn-outline-secondary btn-sm w-100 mt-2"
                  onClick={() => push({ kind: "info", title: "On-call paged", body: "Mary Wanjiku acknowledged in 41 seconds." })}>
                  <i className="bi bi-telephone-outbound me-1" />Page primary on-call
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================ modals & drawers ============================ */}
      <TxDrawer tx={tx} onClose={() => setTx(null)} onBlock={(t) => { setTx(null); setBlockTx(t); }} onReverse={(t) => { setTx(null); setReverseTx(t); }} />
      <BlockTxModal tx={blockTx} onClose={() => setBlockTx(null)} onConfirm={(t) => {
        setStream((s) => s.map((x) => x.id === t.id ? { ...x, status: "Blocked" } : x));
        push({ kind: "success", title: `${t.id} blocked`, body: `${kes(t.amount)} stopped · ${t.from} frozen · case FRD-7713 opened.` });
        setBlockTx(null);
      }} />
      <ReverseTxModal tx={reverseTx} onClose={() => setReverseTx(null)} />
      <StreamFilterDrawer open={filterOpen} onClose={() => setFilterOpen(false)} filters={filters} onApply={(f) => { setFilters(f); setPage(1); }} />
      <CountyModal county={county} onClose={() => setCounty(null)} />
      <LoginDrawer event={login} onClose={() => setLogin(null)} onBlacklist={(e) => { setLogin(null); setBlacklist(e); }} />
      <BlacklistModal event={blacklist} onClose={() => setBlacklist(null)} />
      <ChannelPerfDrawer channel={chPerf} onClose={() => setChPerf(null)} onBreaker={(c) => { setChPerf(null); setBreaker(c); }} />
      <BreakerModal channel={breaker} onClose={() => setBreaker(null)} />
      <FraudEscalationWizard alert={fraudCase} onClose={() => setFraudCase(null)} />
      <IncidentDrawer incident={incident} onClose={() => setIncident(null)} />
      <IncidentWizard open={incidentWizard.open} prefill={incidentWizard.prefill} onClose={() => setIncidentWizard({ open: false })} />
      <ThresholdModal open={thresholdOpen} onClose={() => setThresholdOpen(false)} />
      <DlqModal open={dlqOpen} onClose={() => setDlqOpen(false)} />
      <EventDrawer event={sysEvent} onClose={() => setSysEvent(null)} onIncident={(title) => { setSysEvent(null); setIncidentWizard({ open: true, prefill: title }); }} />
      <SnapshotModal open={snapshotOpen} onClose={() => setSnapshotOpen(false)} rows={filtered as unknown as Record<string, unknown>[]} />
      <BulkHoldModal open={bulkOpen} onClose={() => setBulkOpen(false)} count={sel.length}
        onDone={() => { push({ kind: "success", title: `${sel.length} transactions actioned`, body: "Batch reference BTC-2026-0188 written to the audit log." }); setSel([]); }} />
    </>
  );
}
