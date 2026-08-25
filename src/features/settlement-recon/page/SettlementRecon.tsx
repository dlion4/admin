import { useEffect, useMemo, useState } from "react";
import { Avatar, Badge, DDItem, Dropdown, EmptyState, Meter, Pagination, useToast } from "../../../components/ui";
import { csvDownload, kes, num } from "../../../lib/format";
import type { BankAccount, ReconBreak, ReconChannel, ReconDay, SettlementRun, StatementFile, SuspenseEntry } from "../data/settlementData";
import {
  BANK_ACCOUNTS, BREAKS, EXCEPTIONS, RECON_CHANNELS, RECON_CONFIG, RECON_DAYS,
  SETTLEMENT_KPI, SETTLEMENT_RUNS, STATEMENTS, SUSPENSE,
} from "../data/settlementData";
import {
  AdjustmentModal, AutoMatchModal, BankAccountModal, BankAccountsDrawer, BreakDetailModal, BreaksDrawer,
  BulkBreaksModal, ChannelDetailModal, EscalateModal, ExceptionsModal, ImportStatementWizard, ReconConfigDrawer,
  ReconDayDrawer, ResolveBreakModal, RunDrawer, RunFilterDrawer, RunReconWizard, RunSettlementWizard,
  SettlementExportModal, StatementsDrawer, SuspenseDrawer, SuspenseFromBreakModal, SuspenseResolveModal,
  EMPTY_RUN_FILTERS, type RunFilters,
} from "../modals/SettlementModals";

const statusTone = (s: string) =>
  s === "Completed" || s === "Matched" || s === "Imported" || s === "Resolved" ? "green"
    : s === "Scheduled" || s === "Processing" || s === "In transit" || s === "Pending" || s === "Under review" ? "blue"
      : s === "Overdue" || s === "Failed" || s === "Escalated" || s === "Major" ? "red"
        : s === "On hold" || s === "Minor" || s === "Investigating" || s === "Awaiting" ? "amber" : "grey";

const typeTone = (t: string) =>
  t === "Timing difference" ? "blue" : t === "Amount mismatch" ? "amber"
    : t === "Duplicate posting" ? "violet" : t === "Orphan partner record" ? "grey" : "red";

export function SettlementRecon({
  signal, onNavigate,
}: {
  signal: { action: string; n: number };
  onNavigate: (id: string) => void;
}) {
  const { push } = useToast();

  /* ---------------- live state ---------------- */
  const [runs, setRuns] = useState<SettlementRun[]>(SETTLEMENT_RUNS);
  const [breaks, setBreaks] = useState<ReconBreak[]>(BREAKS);
  const [suspense, setSuspense] = useState<SuspenseEntry[]>(SUSPENSE);
  const [statements, setStatements] = useState<StatementFile[]>(STATEMENTS);
  const [config, setConfig] = useState(RECON_CONFIG);
  const [reconDays, setReconDays] = useState(RECON_DAYS);

  /* ---------------- runs table state ---------------- */
  const [filters, setFilters] = useState<RunFilters>(EMPTY_RUN_FILTERS);
  const [tab, setTab] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [sort, setSort] = useState<{ key: keyof SettlementRun; dir: 1 | -1 }>({ key: "due", dir: -1 });

  /* ---------------- modal state ---------------- */
  const [runDetail, setRunDetail] = useState<SettlementRun | null>(null);
  const [runWizard, setRunWizard] = useState(false);
  const [reconWizard, setReconWizard] = useState(false);
  const [dayDetail, setDayDetail] = useState<ReconDay | null>(null);
  const [channelDetail, setChannelDetail] = useState<ReconChannel | null>(null);
  const [breaksOpen, setBreaksOpen] = useState(false);
  const [breakDetail, setBreakDetail] = useState<ReconBreak | null>(null);
  const [autoMatchB, setAutoMatchB] = useState<ReconBreak | null>(null);
  const [suspenseB, setSuspenseB] = useState<ReconBreak | null>(null);
  const [adjustB, setAdjustB] = useState<ReconBreak | null>(null);
  const [escalateB, setEscalateB] = useState<ReconBreak | null>(null);
  const [resolveB, setResolveB] = useState<ReconBreak | null>(null);
  const [breakSel, setBreakSel] = useState<string[]>([]);
  const [bulkBreaks, setBulkBreaks] = useState(false);
  const [suspenseOpen, setSuspenseOpen] = useState(false);
  const [suspenseResolve, setSuspenseResolve] = useState<SuspenseEntry | null>(null);
  const [statementsOpen, setStatementsOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [accountsOpen, setAccountsOpen] = useState(false);
  const [accountDetail, setAccountDetail] = useState<BankAccount | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [exceptionsOpen, setExceptionsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  /* ---------------- shell signal bridge ---------------- */
  useEffect(() => {
    if (!signal.n) return;
    if (signal.action === "recon") setReconWizard(true);
  }, [signal]);

  /* ---------------- derived ---------------- */
  const filtered = useMemo(() => {
    let rows = runs;
    if (tab !== "All") rows = rows.filter((r) => r.status === tab);
    if (filters.q) {
      const q = filters.q.toLowerCase();
      rows = rows.filter((r) => (r.id + r.partner + r.type + r.method + r.pool + (r.reference ?? "")).toLowerCase().includes(q));
    }
    if (filters.type !== "all") rows = rows.filter((r) => r.type === filters.type);
    if (filters.status !== "all") rows = rows.filter((r) => r.status === filters.status);
    if (filters.auto !== "all") rows = rows.filter((r) => (filters.auto === "auto") === r.auto);
    if (filters.minAmount > 0) rows = rows.filter((r) => r.amount >= filters.minAmount);
    return [...rows].sort((a, b) => {
      const av = a[sort.key]; const bv = b[sort.key];
      return (typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv))) * sort.dir;
    });
  }, [runs, filters, tab, sort]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const activeFilterCount = Object.entries(filters).filter(([k, v]) =>
    k === "q" ? Boolean(v) : typeof v === "number" ? v > 0 : v !== "all"
  ).length;

  const pending = runs.filter((r) => r.status === "Scheduled" || r.status === "Processing");
  const overdue = runs.filter((r) => r.status === "Overdue");
  const openBreaks = breaks.filter((b) => b.status !== "Resolved");
  const suspenseBalance = suspense.filter((s) => s.status !== "Resolved").reduce((s, x) => s + x.amount, 0);
  const kpi = SETTLEMENT_KPI({
    pending: pending.length, pendingValue: pending.reduce((s, r) => s + r.amount, 0),
    breaks: openBreaks.length, suspense: suspenseBalance,
  });

  const tabs = ["All", "Scheduled", "Processing", "Completed", "Overdue", "On hold"];
  const sortBy = (key: keyof SettlementRun) => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : -1 }));
  const updateRun = (id: string, patch: Partial<SettlementRun>) =>
    setRuns((list) => list.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const resolveBreak = (id: string, patch: Partial<ReconBreak>) => {
    setBreaks((list) => list.map((b) => (b.id === id ? { ...b, ...patch } : b)));
    setBreakDetail((b) => (b?.id === id ? { ...b, ...patch } : b));
  };
  const openBreak = (b: ReconBreak) => { setBreaksOpen(false); setBreakDetail(b); };

  /* ---------------- break actions ---------------- */
  const doAutoMatch = (b: ReconBreak) => resolveBreak(b.id, { status: "Resolved", assignedTo: "Engine", suggestion: `Auto-matched ${b.txnRef} ⇄ ${b.partnerRef}` });
  const doSuspenseBreak = (b: ReconBreak) => {
    resolveBreak(b.id, { status: "Resolved", assignedTo: "Auto-recon", suggestion: `Closed into ${"SUS-10" + (13 + Math.floor(Math.random() * 9))}` });
    setSuspense((list) => [{
      id: `SUS-${1013 + Math.floor(Math.random() * 60)}`, date: "23 Aug", amount: b.amount,
      reason: `${b.type} — ${b.id}`, status: "Pending", ageDays: 0,
      resolution: "Awaiting partner callback", createdBy: "Jeckonia Kwasa",
    }, ...list]);
  };
  const doAdjust = (b: ReconBreak) => resolveBreak(b.id, { status: "Resolved", assignedTo: "Sarah Kamau", suggestion: `Adjustment ADJ posted · ${kes(b.amount)}` });
  const doEscalate = (b: ReconBreak, to: string) => resolveBreak(b.id, {
    status: "Escalated", assignedTo: to === "finance" ? "Sarah Kamau" : to === "ops" ? "Mary Wanjiku" : "David Kiplagat",
  });
  const doResolveBreak = (b: ReconBreak, note: string) => resolveBreak(b.id, { status: "Resolved", suggestion: note });
  const bulkBreakAction = (action: string) => {
    if (action === "export") { csvDownload("selected-breaks.csv", breaks.filter((b) => breakSel.includes(b.id)) as unknown as Record<string, unknown>[]); }
    else if (action === "automatch") setBreaks((list) => list.map((b) => breakSel.includes(b.id) ? { ...b, status: "Resolved", assignedTo: "Engine", suggestion: "Batch auto-match pass" } : b));
    else if (action === "retry") setBreaks((list) => list.map((b) => breakSel.includes(b.id) ? { ...b, assignedTo: "Auto-retry 1/3" } : b));
    else if (action === "suspend") setBreaks((list) => list.map((b) => breakSel.includes(b.id) ? { ...b, status: "Resolved", assignedTo: "Auto-recon", suggestion: "Batch suspense entry created" } : b));
    else if (action === "escalate") setBreaks((list) => list.map((b) => breakSel.includes(b.id) ? { ...b, status: "Escalated", assignedTo: "Sarah Kamau" } : b));
    push({ kind: "success", title: `Bulk ${action} applied`, body: `${breakSel.length} breaks updated.` });
    setBreakSel([]);
  };

  /* ---------------- settlement actions ---------------- */
  const settleRun = (r: SettlementRun) => updateRun(r.id, {
    status: "Completed",
    reference: `${r.partner.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`,
    variance: undefined,
  });
  const todayChannels = RECON_CHANNELS;
  const todayExpected = todayChannels.reduce((s, c) => s + c.expected, 0);
  const todayActual = todayChannels.reduce((s, c) => s + c.actual, 0);

  return (
    <>
      {/* ============================== Header ============================== */}
      <div className="pm-section-head" style={{ marginTop: 0 }}>
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="pm-eyebrow">Transactions & finance · Page 11</span>
            <span className="pm-live"><span className="pm-dot green pm-pulse" />MATCH ENGINE v3.2</span>
          </div>
          <h2>Settlement & Reconciliation</h2>
          <p>
            Daily settlement files across every rail, the matching engine, break resolution and the suspense ledger —
            every shilling accounted for with dual-control finance governance.
          </p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setFilterOpen(true)}>
            <i className="bi bi-funnel me-1" />Filters
            {activeFilterCount > 0 && <Badge tone="green">{activeFilterCount}</Badge>}
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setStatementsOpen(true)}>
            <i className="bi bi-file-earmark-ruled me-1" />Statements
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setSuspenseOpen(true)}>
            <i className="bi bi-pause-circle me-1" />Suspense ({suspense.filter((s) => s.status !== "Resolved").length})
          </button>
          <button className="btn btn-outline-secondary btn-sm position-relative" onClick={() => setBreaksOpen(true)}>
            <i className="bi bi-intersect me-1" />Breaks
            {openBreaks.length > 0 && <span className="pm-nav-pill" style={{ position: "absolute", top: -6, right: -6 }}>{openBreaks.length}</span>}
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setExportOpen(true)}>
            <i className="bi bi-download me-1" />Export
          </button>
          <Dropdown width={260} trigger={() => <button className="btn btn-outline-secondary btn-sm"><i className="bi bi-three-dots" /></button>}>
            {(close) => (
              <>
                <div className="pm-dd-head">Reconciliation tools</div>
                <DDItem icon="bi-arrow-repeat" label="Run reconciliation now" hint="Scope → 2FA → run" onClick={() => { close(); setReconWizard(true); }} />
                <DDItem icon="bi-exclamation-diamond" label="Exception playbook" hint={`${EXCEPTIONS.reduce((s, e) => s + e.count, 0)} events in 30d`} onClick={() => { close(); setExceptionsOpen(true); }} />
                <DDItem icon="bi-gear-wide-connected" label="Auto-recon configuration" hint="Thresholds & retries" onClick={() => { close(); setConfigOpen(true); }} />
                <DDItem icon="bi-bank" label="Settlement bank accounts" hint={`${BANK_ACCOUNTS.length} accounts`} onClick={() => { close(); setAccountsOpen(true); }} />
                <div className="pm-dd-sep" />
                <DDItem icon="bi-journal-text" label="Open Transaction Ledger" hint="Page 9 · postings" onClick={() => { close(); onNavigate("ledger"); }} />
                <DDItem icon="bi-percent" label="Open Fee Management" hint="Page 10 · schedules" onClick={() => { close(); onNavigate("fees"); }} />
                <DDItem icon="bi-droplet-half" label="Liquidity & Pools" hint="Page 12" onClick={() => { close(); onNavigate("liquidity"); }} />
              </>
            )}
          </Dropdown>
          <button className="btn btn-primary btn-sm" onClick={() => setRunWizard(true)}>
            <i className="bi bi-play-fill me-1" />Run settlement
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

      {/* ============================== Settlement queue ============================== */}
      <div className="pm-section-head">
        <div>
          <h2>Partner settlement queue</h2>
          <p>{runs.length} runs tracked — auto windows plus manual instructions. Row click opens the full settlement dossier.</p>
        </div>
        {overdue.length > 0 && (
          <Badge tone="red" dot>{overdue.length} overdue · {kes(overdue.reduce((s, r) => s + r.amount, 0), { compact: true })}</Badge>
        )}
      </div>

      <div className="pm-card mb-3">
        <div className="pm-tabs">
          {tabs.map((t) => (
            <button key={t} className={`pm-tab ${tab === t ? "active" : ""}`} onClick={() => { setTab(t); setPage(1); }}>
              {t}
              <span className="cnt">{t === "All" ? runs.length : runs.filter((r) => r.status === t).length}</span>
            </button>
          ))}
        </div>
        <div className="pm-card-head">
          <div className="pm-search flex-grow-1" style={{ maxWidth: 420 }}>
            <i className="bi bi-search" />
            <input placeholder="Run, partner, reference, pool…" value={filters.q}
              onChange={(e) => { setFilters({ ...filters, q: e.target.value }); setPage(1); }} />
          </div>
          <div className="d-flex gap-2 align-items-center">
            <span style={{ fontSize: ".75rem", color: "var(--pm-muted)" }}>{num(filtered.length)} runs</span>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setFilterOpen(true)} title="Advanced filters"><i className="bi bi-funnel" /></button>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setReconWizard(true)} title="Run reconciliation"><i className="bi bi-arrow-repeat" /></button>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="d-flex gap-1 flex-wrap p-2 pb-0">
            {filters.type !== "all" && <button className="pm-chip active" onClick={() => setFilters({ ...filters, type: "all" })}>{filters.type} ✕</button>}
            {filters.status !== "all" && <button className="pm-chip active" onClick={() => setFilters({ ...filters, status: "all" })}>{filters.status} ✕</button>}
            {filters.auto !== "all" && <button className="pm-chip active" onClick={() => setFilters({ ...filters, auto: "all" })}>{filters.auto} ✕</button>}
            {filters.minAmount > 0 && <button className="pm-chip active" onClick={() => setFilters({ ...filters, minAmount: 0 })}>≥ {kes(filters.minAmount, { compact: true })} ✕</button>}
            <button className="pm-chip" onClick={() => { setFilters(EMPTY_RUN_FILTERS); setTab("All"); }}>Clear all</button>
          </div>
        )}

        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead>
              <tr>
                {([
                  ["id", "Run"], ["partner", "Partner"], ["type", "Type"], ["amount", "Amount"],
                  ["txnCount", "Txns"], ["due", "Due"], ["method", "Method"], ["status", "Status"],
                ] as const).map(([k, l]) => (
                  <th key={k} className={`${k === "amount" || k === "txnCount" ? "text-end " : ""}cursor-pointer`} onClick={() => sortBy(k)}>
                    {l} {sort.key === k && <i className={`bi bi-caret-${sort.dir === 1 ? "up" : "down"}-fill`} style={{ fontSize: ".55rem" }} />}
                  </th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {paged.map((r) => (
                <tr key={r.id} onClick={() => setRunDetail(r)}>
                  <td><span className="mono pm-td-strong" style={{ fontSize: ".76rem" }}>{r.id}</span>
                    {r.reference && <div className="pm-td-sub mono">{r.reference}</div>}
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <Avatar name={r.partner} size="sm" />
                      <div>
                        <div className="pm-td-strong" style={{ fontSize: ".78rem" }}>{r.partner}</div>
                        <div className="pm-td-sub">{r.pool}</div>
                      </div>
                    </div>
                  </td>
                  <td><Badge tone={r.type === "Pay-in" || r.type === "Bill commission" ? "green" : r.type === "Card clearing" ? "blue" : r.type === "Loan settlement" ? "violet" : "grey"}>{r.type}</Badge></td>
                  <td className="text-end"><span className="pm-num" style={{ fontWeight: 700 }}>{kes(r.amount, { compact: true })}</span>
                    {r.variance != null && <div className="pm-td-sub" style={{ color: "#b42318" }}>var {kes(r.variance, { compact: true })}</div>}
                  </td>
                  <td className="text-end pm-num">{num(r.txnCount)}</td>
                  <td><span style={{ fontSize: ".76rem" }}>{r.due}</span>
                    <div className="pm-td-sub">{r.auto ? "auto window" : "manual"}</div>
                  </td>
                  <td><Badge tone="grey">{r.method}</Badge></td>
                  <td><Badge tone={statusTone(r.status)} dot>{r.status}</Badge></td>
                  <td className="text-end" onClick={(e) => e.stopPropagation()}>
                    <Dropdown up width={230} trigger={() => (
                      <button className="pm-icon-btn" style={{ width: 28, height: 28 }}><i className="bi bi-three-dots-vertical" /></button>
                    )}>
                      {(close) => (
                        <>
                          <DDItem icon="bi-eye" label="Open settlement dossier" onClick={() => { close(); setRunDetail(r); }} />
                          <DDItem icon="bi-play-fill" label="Run settlement now" hint="2FA" disabled={r.status === "Completed"} onClick={() => { close(); setRunWizard(true); }} />
                          <DDItem icon="bi-arrow-repeat" label="Re-run reconciliation" hint="2FA" onClick={() => { close(); setReconWizard(true); }} />
                          <DDItem icon="bi-pause-circle" label="Hold run" disabled={r.status === "On hold" || r.status === "Completed"} onClick={() => { close(); updateRun(r.id, { status: "On hold" }); push({ kind: "warn", title: `${r.id} on hold`, body: "Awaiting manual release." }); }} />
                          <DDItem icon="bi-intersect" label="View related breaks" onClick={() => { close(); setBreaksOpen(true); }} />
                          <div className="pm-dd-sep" />
                          <DDItem icon="bi-journal-text" label="See postings (Page 9)" onClick={() => { close(); onNavigate("ledger"); }} />
                        </>
                      )}
                    </Dropdown>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={9}>
                  <EmptyState icon="bi-search" title="No settlement runs match" body="Widen the filters or clear the status tab."
                    action={<button className="btn btn-outline-secondary btn-sm" onClick={() => { setFilters(EMPTY_RUN_FILTERS); setTab("All"); }}>Clear filters</button>} />
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pageSize={pageSize} total={filtered.length} onPage={setPage} onPageSize={setPageSize} />
      </div>

      {/* ============================== Today's recon + daily grid + suspense ============================== */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-xl-5">
          <div className="pm-card h-100">
            <div className="pm-card-head">
              <div>
                <h6 className="pm-card-title">Today's clearing — by channel</h6>
                <p className="pm-card-sub">{kes(todayExpected, { compact: true })} expected · {kes(todayActual, { compact: true })} actual</p>
              </div>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setReconWizard(true)}>
                <i className="bi bi-arrow-repeat me-1" />Re-run
              </button>
            </div>
            <div className="pm-card-pad">
              <div className="pm-bar-track mb-3" style={{ height: 26 }}>
                {todayChannels.map((c) => (
                  <div key={c.channel} title={`${c.channel}: ${kes(c.actual, { compact: true })}`}
                    style={{ width: `${(c.actual / todayActual) * 100}%`, background: c.color, minWidth: 4 }} />
                ))}
              </div>
              <div className="d-flex flex-column gap-2">
                {todayChannels.map((c) => (
                  <button key={c.channel} className="border-0 bg-transparent text-start w-100" style={{ borderRadius: 10, padding: ".3rem .4rem" }} onClick={() => setChannelDetail(c)}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span style={{ fontWeight: 700, fontSize: ".78rem" }}>
                        <span className="pm-legend-dot me-1" style={{ background: c.color }} />{c.channel}
                      </span>
                      <span className="pm-num" style={{ fontSize: ".72rem" }}>
                        {kes(c.actual, { compact: true })}
                        <span style={{ color: c.variance === 0 ? "#0b8f52" : "#b42318", fontWeight: 700, marginLeft: 6 }}>
                          {c.variance === 0 ? "✓" : kes(c.variance, { compact: true })}
                        </span>
                      </span>
                    </div>
                    <Meter value={c.matchRate} tone={c.matchRate >= 99.9 ? "#12b76a" : "#f79009"} width={999} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="pm-card h-100">
            <div className="pm-card-head">
              <div>
                <h6 className="pm-card-title">Daily reconciliation</h6>
                <p className="pm-card-sub">14 business days · click a day for the day pack</p>
              </div>
              <Badge tone="green">{reconDays.filter((d) => d.status === "Matched").length} matched</Badge>
            </div>
            <div className="pm-table-wrap" style={{ maxHeight: 342, overflowY: "auto" }}>
              <table className="pm-table">
                <thead><tr><th>Date</th><th className="text-end">Expected</th><th className="text-end">Variance</th><th>Status</th></tr></thead>
                <tbody>
                  {reconDays.map((d) => (
                    <tr key={d.date} onClick={() => setDayDetail(d)}>
                      <td className="pm-td-strong" style={{ fontSize: ".78rem" }}>{d.date}</td>
                      <td className="text-end pm-num">{kes(d.expected, { compact: true })}</td>
                      <td className="text-end pm-num" style={{ color: d.variance === 0 ? "#0b8f52" : "#b42318", fontWeight: 700 }}>
                        {d.variance === 0 ? "0" : kes(d.variance, { compact: true })}
                      </td>
                      <td>
                        <Badge tone={statusTone(d.status)} dot>{d.status}</Badge>
                        {d.breaks > 0 && <div className="pm-td-sub">{d.breaks} breaks</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-3">
          <div className="pm-card h-100">
            <div className="pm-card-head">
              <div>
                <h6 className="pm-card-title">Suspense — 6000</h6>
                <p className="pm-card-sub">{kes(suspenseBalance, { compact: true })} parked</p>
              </div>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setSuspenseOpen(true)}>All</button>
            </div>
            <div className="pm-card-pad d-flex flex-column gap-2">
              {suspense.filter((s) => s.status !== "Resolved").concat(suspense.filter((s) => s.status === "Resolved")).slice(0, 5).map((s) => (
                <button key={s.id} className="pm-alert-row text-start w-100" style={{ border: "1px solid var(--pm-border)", borderLeftColor: s.status === "Resolved" ? "#12b76a" : s.status === "Under review" ? "#f79009" : "#2e90fa", cursor: "pointer" }}
                  onClick={() => s.status !== "Resolved" ? setSuspenseResolve(s) : setSuspenseOpen(true)}>
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="d-flex align-items-center gap-2">
                      <span className="mono" style={{ fontWeight: 700, fontSize: ".72rem" }}>{s.id}</span>
                      <Badge tone={statusTone(s.status)} dot>{s.status}</Badge>
                    </div>
                    <div className="pm-td-sub">{s.reason.length > 42 ? s.reason.slice(0, 42) + "…" : s.reason}</div>
                    <div className="pm-td-sub mono">{s.date} · {s.ageDays}d</div>
                  </div>
                  <span className="pm-num" style={{ fontWeight: 700, fontSize: ".72rem" }}>{kes(s.amount, { compact: true })}</span>
                </button>
              ))}
              <div className="pm-note">
                <i className="bi bi-stopwatch me-1" />
                &gt;48h pages Finance · &gt;7d flags in the CBK monthly return.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================== Breaks + config + history ============================== */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-xl-8">
          <div className="pm-section-head">
            <div>
              <h2>Reconciliation breaks</h2>
              <p>Unmatched internal vs partner legs — the engine suggests a resolution on every row.</p>
            </div>
            <button className="btn btn-sm btn-primary" onClick={() => setBreaksOpen(true)}>
              <i className="bi bi-box-arrow-up-right me-1" />Full board
            </button>
          </div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead>
                  <tr><th>Break</th><th>Channel</th><th>Type</th><th>Internal ⇄ partner</th><th className="text-end">Amount</th><th>Age</th><th>Assignee</th><th>Status</th><th /></tr>
                </thead>
                <tbody>
                  {breaks.slice(0, 10).map((b) => (
                    <tr key={b.id} onClick={() => setBreakDetail(b)}>
                      <td><span className="mono pm-td-strong" style={{ fontSize: ".76rem" }}>{b.id}</span><div className="pm-td-sub">{b.date}</div></td>
                      <td><Badge tone="grey">{b.channel}</Badge></td>
                      <td><Badge tone={typeTone(b.type)}>{b.type}</Badge></td>
                      <td className="mono pm-td-sub">{b.txnRef} ⇄ {b.partnerRef}</td>
                      <td className="text-end pm-num" style={{ fontWeight: 700 }}>{kes(b.amount, { compact: true })}</td>
                      <td className="pm-num">{b.ageDays}d</td>
                      <td style={{ fontSize: ".76rem" }}>{b.assignedTo}</td>
                      <td><Badge tone={statusTone(b.status)} dot>{b.status}</Badge></td>
                      <td className="text-end" onClick={(e) => e.stopPropagation()}>
                        {b.status !== "Resolved" && (
                          <button className="btn btn-sm btn-outline-primary" style={{ fontSize: ".68rem" }} onClick={() => setBreakDetail(b)}>Resolve</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pm-table-foot">
              <span>{openBreaks.length} open of {breaks.length} · {kes(openBreaks.reduce((s, b) => s + b.amount, 0), { compact: true })} exposure</span>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setBreaksOpen(true)}>Open board ({breaks.length})</button>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="pm-section-head">
            <div>
              <h2>Engine & exceptions</h2>
              <p>Auto-recon policy and the 30-day exception playbook.</p>
            </div>
          </div>
          <div className="pm-card mb-3">
            <div className="pm-card-head">
              <h6 className="pm-card-title">Auto-recon configuration</h6>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setConfigOpen(true)}>
                <i className="bi bi-pencil-square" />
              </button>
            </div>
            <div className="pm-card-pad">
              {config.slice(0, 5).map((c) => (
                <div className="pm-kv" key={c.key}>
                  <span className="k">{c.label}</span>
                  <span className="v mono" style={{ fontSize: ".74rem" }}>{c.value} <span style={{ color: "var(--pm-muted)", fontWeight: 500 }}>{c.unit}</span></span>
                </div>
              ))}
            </div>
          </div>
          <div className="pm-card">
            <div className="pm-card-head">
              <h6 className="pm-card-title">Exceptions — 30 days</h6>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setExceptionsOpen(true)}>Playbook</button>
            </div>
            <div className="pm-card-pad">
              {EXCEPTIONS.map((e) => (
                <div className="pm-kv" key={e.type}>
                  <span className="k">{e.type}</span>
                  <span className="v">
                    <Badge tone={e.count === 0 ? "green" : e.count > 3 ? "red" : "amber"}>{e.count}</Badge>
                    <span style={{ fontSize: ".7rem", color: "var(--pm-muted)", marginLeft: 6 }}>{e.avgTime}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============================== Modals & drawers ============================== */}
      <RunDrawer
        run={runDetail}
        onClose={() => setRunDetail(null)}
        onRun={() => { setRunDetail(null); setRunWizard(true); }}
        onHold={(r) => { updateRun(r.id, { status: "On hold" }); push({ kind: "warn", title: `${r.id} on hold`, body: "Manual release required." }); setRunDetail(null); }}
        onMarkPaid={(r) => { updateRun(r.id, { reference: `MAN-${Date.now().toString().slice(-6)}` }); push({ kind: "success", title: `${r.id} marked paid` }); }}
        onResettle={(r) => { updateRun(r.id, { status: "Processing" }); push({ kind: "info", title: `${r.id} resubmitted`, body: "Awaiting partner ACK." }); setRunDetail(null); }}
        onBreaks={() => { setRunDetail(null); setBreaksOpen(true); }}
      />
      {runWizard && (
        <RunSettlementWizard open={runWizard} runs={runs} onClose={() => setRunWizard(false)} onDone={settleRun} />
      )}
      <ReconDayDrawer
        day={dayDetail}
        onClose={() => setDayDetail(null)}
        onChannel={(c) => { setDayDetail(null); setChannelDetail(c); }}
        onBreaks={() => { setDayDetail(null); setBreaksOpen(true); }}
        onRerun={(d) => { setDayDetail(null); setReconWizard(true); void d; }}
      />
      <ChannelDetailModal channel={channelDetail} onClose={() => setChannelDetail(null)} onBreaks={() => { setChannelDetail(null); setBreaksOpen(true); }} />
      <BreaksDrawer
        open={breaksOpen}
        onClose={() => setBreaksOpen(false)}
        breaks={breaks}
        onOpen={openBreak}
        onBulk={() => setBulkBreaks(true)}
        selected={breakSel}
        onToggle={(id) => setBreakSel((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id])}
        onToggleAll={setBreakSel}
      />
      <BreakDetailModal
        brk={breakDetail}
        onClose={() => setBreakDetail(null)}
        onAutoMatch={(b) => { setBreakDetail(null); setAutoMatchB(b); }}
        onSuspense={(b) => { setBreakDetail(null); setSuspenseB(b); }}
        onAdjust={(b) => { setBreakDetail(null); setAdjustB(b); }}
        onEscalate={(b) => { setBreakDetail(null); setEscalateB(b); }}
        onResolve={(b) => { setBreakDetail(null); setResolveB(b); }}
      />
      <AutoMatchModal brk={autoMatchB} onClose={() => setAutoMatchB(null)} onDone={doAutoMatch} />
      <SuspenseFromBreakModal brk={suspenseB} onClose={() => setSuspenseB(null)} onDone={doSuspenseBreak} />
      <AdjustmentModal brk={adjustB} onClose={() => setAdjustB(null)} onDone={doAdjust} />
      <EscalateModal brk={escalateB} onClose={() => setEscalateB(null)} onDone={doEscalate} />
      <ResolveBreakModal brk={resolveB} onClose={() => setResolveB(null)} onDone={doResolveBreak} />
      <BulkBreaksModal open={bulkBreaks} count={breakSel.length}
        value={breaks.filter((b) => breakSel.includes(b.id)).reduce((s, b) => s + b.amount, 0)}
        onClose={() => setBulkBreaks(false)} onDone={bulkBreakAction} />
      <SuspenseDrawer open={suspenseOpen} onClose={() => setSuspenseOpen(false)} entries={suspense} onResolve={(s) => { setSuspenseOpen(false); setSuspenseResolve(s); }} />
      <SuspenseResolveModal entry={suspenseResolve} onClose={() => setSuspenseResolve(null)}
        onDone={(s) => setSuspense((list) => list.map((x) => x.id === s.id ? { ...x, status: "Resolved", resolution: "Resolved via super admin action" } : x))} />
      <StatementsDrawer open={statementsOpen} onClose={() => setStatementsOpen(false)} statements={statements}
        onImport={() => { setStatementsOpen(false); setImportOpen(true); }}
        onAccount={() => { setStatementsOpen(false); setAccountsOpen(true); }} />
      {importOpen && (
        <ImportStatementWizard open={importOpen} onClose={() => setImportOpen(false)}
          onImported={(s) => setStatements((list) => [s, ...list])} />
      )}
      <BankAccountsDrawer open={accountsOpen} onClose={() => setAccountsOpen(false)} accounts={BANK_ACCOUNTS}
        onSelect={(a) => { setAccountsOpen(false); setAccountDetail(a); }} />
      <BankAccountModal account={accountDetail} onClose={() => setAccountDetail(null)}
        onImport={() => { setAccountDetail(null); setImportOpen(true); }} />
      <ReconConfigDrawer open={configOpen} onClose={() => setConfigOpen(false)} config={config}
        onSave={(key, value) => {
          setConfig((list) => list.map((c) => (c.key === key ? { ...c, value } : c)));
          push({ kind: "success", title: "Policy updated", body: `${config.find((c) => c.key === key)?.label} → ${value} · audit event written.` });
        }} />
      <ExceptionsModal open={exceptionsOpen} onClose={() => setExceptionsOpen(false)} onBreaks={() => { setExceptionsOpen(false); setBreaksOpen(true); }} />
      <RunReconWizard open={reconWizard} onClose={() => setReconWizard(false)}
        onDone={(r) => {
          setReconDays((list) => list.map((d, i) => i === 0 ? { ...d, actual: d.expected, variance: 0, status: "Matched", breaks: r.breaks, operator: "Jeckonia Kwasa" } : d));
        }} />
      <SettlementExportModal open={exportOpen} onClose={() => setExportOpen(false)} runs={runs} days={reconDays} breaks={breaks} />
      <RunFilterDrawer open={filterOpen} filters={filters} onClose={() => setFilterOpen(false)}
        onApply={(f) => { setFilters(f); setPage(1); }} />
    </>
  );
}
