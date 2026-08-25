import { useEffect, useMemo, useState } from "react";
import { Badge, DDItem, Dropdown, Meter, Pagination, useToast } from "../../../components/ui";
import { kes, num } from "../../../lib/format";
import type { ActivityRow, LiquidityAlert, LiquidityPool, PoolTransfer, SweepRule } from "../data/liquidityData";
import {
  ACTIVITY, CASHFLOW, FORECAST, LIQUIDITY_KPI, POOLS, RESERVES, SWEEPS, TRANSFERS,
} from "../data/liquidityData";
import {
  ActivityDrawer, AlertsDrawer, ApproveTransferModal, CashflowModal, CreatePoolWizard, ForecastModal,
  FreezePoolModal, LiquidityExportModal, PoolActionsModal, PoolDetailDrawer, ReserveRatioModal,
  ReservesModal, StressTestModal, SweepEditModal, SweepWizard, SweepsDrawer, TopUpWizard,
  TransferDetailModal, TransferWizard, TransfersDrawer, WithdrawModal, healthTone,
} from "../modals/LiquidityModals";

const nowTime = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const recompute = (p: LiquidityPool): LiquidityPool => {
  if (p.locked) return p;
  const utilisation = p.balance > 0 ? Math.round((p.reserved / p.balance) * 1000) / 10 : 0;
  const health = p.health === "Frozen" ? "Frozen" : p.balance < p.lowThreshold ? "Low" : utilisation > 85 ? "Monitor" : "Healthy";
  return { ...p, utilisation, health };
};

export function LiquidityPools({
  signal, onNavigate,
}: {
  signal: { action: string; n: number };
  onNavigate: (id: string) => void;
}) {
  const { push } = useToast();

  /* ---------------- live state ---------------- */
  const [pools, setPools] = useState<LiquidityPool[]>(POOLS);
  const [transfers, setTransfers] = useState<PoolTransfer[]>(TRANSFERS);
  const [sweeps, setSweeps] = useState<SweepRule[]>(SWEEPS);
  const [alerts, setAlerts] = useState<LiquidityAlert[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>(ACTIVITY);
  const nextAct = (pool: string, action: string, amount: number, balanceAfter: number, by = "Jeckonia Kwasa") =>
    setActivity((a) => [{ id: `ACT-${4413 + a.length - ACTIVITY.length}`, time: nowTime(), pool, action, amount, balanceAfter, by }, ...a]);

  /* ---------------- derived alert state from pools ---------------- */
  useMemo(() => {
    setAlerts(POOLS.filter((p) => p.id !== "POOL-09").map((p, i) => ({
      id: `ALR-${String(i + 1).padStart(2, "0")}`,
      pool: p.name,
      label: `${p.name} low balance`,
      threshold: p.lowThreshold,
      current: p.balance,
      notify: p.notify,
      ok: p.balance >= p.lowThreshold,
    })));
  }, []);

  /* ---------------- transfers table state ---------------- */
  const [tab, setTab] = useState("All");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const tabs = ["All", "Complete", "Pending approval", "Scheduled", "Failed"];
  const filtered = transfers.filter((t) => tab === "All" || t.status === tab);
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const breaches = alerts.filter((a) => !a.ok).length;
  const avgUtil = pools.filter((p) => !p.locked).reduce((s, p) => s + p.utilisation, 0) / pools.filter((p) => !p.locked).length;
  const kpi = LIQUIDITY_KPI({ breaches, utilisation: Math.round(avgUtil * 10) / 10, pools: pools.length });

  /* ---------------- modal state ---------------- */
  const [detailPool, setDetailPool] = useState<LiquidityPool | null>(null);
  const [transferWizard, setTransferWizard] = useState(false);
  const [transferSource, setTransferSource] = useState<LiquidityPool | null>(null);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpTarget, setTopUpTarget] = useState<LiquidityPool | null>(null);
  const [withdrawPool, setWithdrawPool] = useState<LiquidityPool | null>(null);
  const [reservePool, setReservePool] = useState<LiquidityPool | null>(null);
  const [freezePool, setFreezePool] = useState<LiquidityPool | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [transfersDrawer, setTransfersDrawer] = useState(false);
  const [transferDetail, setTransferDetail] = useState<PoolTransfer | null>(null);
  const [approveTarget, setApproveTarget] = useState<PoolTransfer | null>(null);
  const [sweepsOpen, setSweepsOpen] = useState(false);
  const [sweepEdit, setSweepEdit] = useState<SweepRule | null>(null);
  const [sweepWizard, setSweepWizard] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [forecastOpen, setForecastOpen] = useState(false);
  const [reservesOpen, setReservesOpen] = useState(false);
  const [cashflowOpen, setCashflowOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [stressOpen, setStressOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);

  /* ---------------- shell signal bridge ---------------- */
  useEffect(() => {
    if (!signal.n) return;
    if (signal.action === "transfer") setTransferWizard(true);
  }, [signal]);

  /* ---------------- mutations ---------------- */
  const patchPool = (id: string, patch: Partial<LiquidityPool>) =>
    setPools((ps) => ps.map((p) => (p.id === id ? recompute({ ...p, ...patch }) : p)));

  const logTransfer = (t: PoolTransfer) => setTransfers((ts) => [t, ...ts]);

  const applyBalances = (fromName: string, toName: string, amount: number) => {
    setPools((ps) => ps.map((p) => {
      if (p.name === fromName) return recompute({ ...p, balance: p.balance - amount, trend: "down" });
      if (p.name === toName) return recompute({ ...p, balance: p.balance + amount, trend: "up" });
      return p;
    }));
  };

  const doTransfer = (fromId: string, toId: string, amount: number, reason: string) => {
    const from = pools.find((p) => p.id === fromId);
    const to = pools.find((p) => p.id === toId);
    if (!from || !to) return;
    applyBalances(from.name, to.name, amount);
    logTransfer({
      id: `TRF-${7742 + Math.floor(Math.random() * 50)}`,
      date: "2026-08-23", time: nowTime(),
      fromPool: from.name, toPool: to.name, amount, reason,
      initiatedBy: "Jeckonia Kwasa", approvedBy: "Sarah Kamau", status: "Complete",
    });
    nextAct(from.name, `Transfer out to ${to.name}`, -amount, from.balance - amount);
    nextAct(to.name, `Transfer in from ${from.name}`, amount, to.balance + amount);
  };

  const doApprove = (t: PoolTransfer) => {
    setTransfers((ts) => ts.map((x) => (x.id === t.id ? { ...x, status: "Complete", approvedBy: "Jeckonia Kwasa" } : x)));
    applyBalances(t.fromPool, t.toPool, t.amount);
    nextAct(t.toPool, `${t.id} approved & executed`, t.amount, t.amount);
    setTransferDetail(null);
  };

  const doTopUp = (poolId: string, amount: number, bank: string) => {
    const p = pools.find((x) => x.id === poolId);
    if (!p) return;
    patchPool(poolId, { balance: p.balance + amount, trend: "up", lastTopUp: "Today" });
    logTransfer({
      id: `TRF-${7742 + Math.floor(Math.random() * 50)}`,
      date: "2026-08-23", time: nowTime(),
      fromPool: bank, toPool: p.name, amount, reason: "External top-up (bank transfer in)",
      initiatedBy: "Jeckonia Kwasa", approvedBy: "Sarah Kamau", status: "Complete",
    });
    nextAct(p.name, `Top-up from ${bank.split(" •")[0]}`, amount, p.balance + amount);
  };

  const doWithdraw = (p: LiquidityPool, amount: number) => {
    patchPool(p.id, { balance: p.balance - amount, trend: "down" });
    logTransfer({
      id: `TRF-${7742 + Math.floor(Math.random() * 50)}`,
      date: "2026-08-23", time: nowTime(),
      fromPool: p.name, toPool: "External bank account", amount, reason: "External withdrawal — board resolution pending",
      initiatedBy: "Jeckonia Kwasa", approvedBy: "Board co-sign pending", status: "Pending approval",
    });
    nextAct(p.name, "Withdrawal queued (board review)", -amount, p.balance - amount);
  };

  const doReserve = (p: LiquidityPool, ratio: number) => {
    patchPool(p.id, { reserveRatio: ratio, reserved: Math.round((p.balance * ratio) / 100) });
    nextAct(p.name, `Reserve ratio set to ${ratio}%`, 0, p.balance);
  };

  const doFreeze = (p: LiquidityPool) => {
    const frozen = p.health === "Frozen";
    patchPool(p.id, { health: frozen ? "Healthy" : "Frozen" });
    nextAct(p.name, frozen ? "Pool unfrozen — queues executing" : "Pool frozen — sweeps halted", 0, p.balance, frozen ? "Sarah Kamau" : "Jeckonia Kwasa");
  };

  const doCreatePool = (name: string, funding: number, ratio: number, threshold: number) => {
    const id = `POOL-${10 + pools.length - POOLS.length}`;
    setPools((ps) => {
      const next = [...ps];
      const mainIdx = next.findIndex((x) => x.name === "Main Operating");
      if (mainIdx >= 0) next[mainIdx] = recompute({ ...next[mainIdx], balance: next[mainIdx].balance - funding });
      next.push(recompute({
        id, name, icon: "bi-circle-half", purpose: "Newly created pool", balance: funding,
        reserved: Math.round((funding * ratio) / 100), utilisation: ratio, health: "Healthy", trend: "flat",
        reserveRatio: ratio, lastTopUp: "Today", movements24h: 0, lowThreshold: threshold,
        notify: "Email + Slack", color: "#2e90fa",
      }));
      return next;
    });
    nextAct("Main Operating", `Initial funding for ${name}`, -funding, 892_000_000 - funding);
  };

  const doSweepToggle = (s: SweepRule) => {
    setSweeps((ss) => ss.map((x) => (x.id === s.id ? { ...x, enabled: !x.enabled } : x)));
    push(s.enabled
      ? { kind: "warn", title: `${s.id} disabled`, body: "Future runs skipped until re-enabled." }
      : { kind: "success", title: `${s.id} enabled`, body: `${s.trigger} active again.` });
  };

  const doSweepRun = (s: SweepRule) => {
    applyBalances(s.source, s.destination, s.amount);
    logTransfer({
      id: `TRF-${7742 + Math.floor(Math.random() * 50)}`,
      date: "2026-08-23", time: nowTime(),
      fromPool: s.source, toPool: s.destination, amount: s.amount, reason: `Manual run — ${s.name}`,
      initiatedBy: `${s.id} auto-sweep`, approvedBy: "—", status: "Complete",
    });
    setSweeps((ss) => ss.map((x) => (x.id === s.id ? { ...x, lastRun: "Just now", runs30d: x.runs30d + 1 } : x)));
    push({ kind: "success", title: `${s.id} executed`, body: `${kes(s.amount, { compact: true })} · ${s.source} → ${s.destination}.` });
  };

  const doAlertEdit = (a: LiquidityAlert, threshold: number, notify: string) => {
    setAlerts((as) => as.map((x) => (x.id === a.id ? { ...x, threshold, notify, ok: x.current >= threshold } : x)));
    nextAct(a.pool, `Alert threshold → ${kes(threshold, { compact: true })}`, 0, 0, "Jeckonia Kwasa");
  };

  const openTransfer = (p: LiquidityPool | null) => { setTransferSource(p); setTransferWizard(true); };
  const openTopUp = (p: LiquidityPool | null) => { setTopUpTarget(p); setTopUpOpen(true); };

  const onAction = (id: string) => {
    if (id === "transfer") setTransferWizard(true);
    else if (id === "topup") setTopUpOpen(true);
    else if (id === "withdraw") setWithdrawPool(pools.find((p) => !p.locked && p.health !== "Frozen") ?? null);
    else if (id === "reserve") setReservePool(pools[0]);
    else if (id === "thresholds") setAlertsOpen(true);
    else if (id === "create") setCreateOpen(true);
    else if (id === "freeze") setFreezePool(pools.find((p) => !p.locked && p.health !== "Frozen") ?? null);
  };

  const totals = pools.reduce(
    (acc, p) => ({ balance: acc.balance + p.balance, reserved: acc.reserved + p.reserved, avail: acc.avail + (p.balance - p.reserved) }),
    { balance: 0, reserved: 0, avail: 0 },
  );

  return (
    <>
      {/* ============================== Header ============================== */}
      <div className="pm-section-head" style={{ marginTop: 0 }}>
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="pm-eyebrow">Treasury & liquidity · Page 12</span>
            <span className="pm-live"><span className="pm-dot green pm-pulse" />{pools.length} POOLS · LIVE</span>
          </div>
          <h2>Liquidity & Pool Management</h2>
          <p>
            Every shilling bucketed, swept and stress-tested — inter-pool transfers with dual approval, board dual-key on the
            Emergency Reserve, automated sweeps and live reserve compliance against CBK floors.
          </p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setForecastOpen(true)}>
            <i className="bi bi-graph-up-arrow me-1" />Forecast
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setCashflowOpen(true)}>
            <i className="bi bi-file-earmark-bar-graph me-1" />Cash flow
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setActivityOpen(true)}>
            <i className="bi bi-activity me-1" />Activity
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setSweepsOpen(true)}>
            <i className="bi bi-arrow-repeat me-1" />Sweeps ({sweeps.filter((s) => s.enabled).length})
          </button>
          <button className="btn btn-outline-secondary btn-sm position-relative" onClick={() => setAlertsOpen(true)}>
            <i className="bi bi-bell me-1" />Alerts
            {breaches > 0 && <span className="pm-nav-pill" style={{ position: "absolute", top: -6, right: -6 }}>{breaches}</span>}
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setExportOpen(true)}>
            <i className="bi bi-download me-1" />Export
          </button>
          <Dropdown width={260} trigger={() => <button className="btn btn-outline-secondary btn-sm"><i className="bi bi-three-dots" /></button>}>
            {(close) => (
              <>
                <div className="pm-dd-head">Treasury tools</div>
                <DDItem icon="bi-broadcast" label="Run stress test" hint="Deposit-run shock simulator" onClick={() => { close(); setStressOpen(true); }} />
                <DDItem icon="bi-lightning-charge" label="Pool actions matrix" hint="Controls per operation" onClick={() => { close(); setActionsOpen(true); }} />
                <DDItem icon="bi-node-plus" label="Create new pool" hint="Wizard → 2FA" onClick={() => { close(); setCreateOpen(true); }} />
                <DDItem icon="bi-clock-history" label="Full transfer history" hint={`${transfers.length} movements`} onClick={() => { close(); setTransfersDrawer(true); }} />
                <div className="pm-dd-sep" />
                <DDItem icon="bi-pause-circle" label="Open Settlement & Recon" hint="Page 11" onClick={() => { close(); onNavigate("settlement"); }} />
                <DDItem icon="bi-journal-text" label="Open Transaction Ledger" hint="Page 9" onClick={() => { close(); onNavigate("ledger"); }} />
                <DDItem icon="bi-percent" label="Open Fee Management" hint="Page 10" onClick={() => { close(); onNavigate("fees"); }} />
              </>
            )}
          </Dropdown>
          <button className="btn btn-primary btn-sm" onClick={() => openTransfer(null)}>
            <i className="bi bi-arrow-left-right me-1" />Transfer funds
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

      {/* ============================== Pools grid ============================== */}
      <div className="pm-section-head">
        <div>
          <span className="pm-eyebrow">Pool architecture</span>
          <h3 className="mb-0">Liquidity pools</h3>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <span className="pm-note mb-0">
            <i className="bi bi-shield-check me-1" style={{ color: "#0b8f52" }} />
            {kes(totals.balance, { compact: true })} total · {kes(totals.avail, { compact: true })} free-to-move
          </span>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setReservesOpen(true)}>
            <i className="bi bi-shield-check me-1" />Reserve compliance
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setCreateOpen(true)}>
            <i className="bi bi-node-plus me-1" />New pool
          </button>
        </div>
      </div>
      <div className="row g-2 mb-3">
        {pools.map((p) => {
          const avail = p.balance - p.reserved;
          return (
            <div className="col-12 col-md-6 col-xl-4" key={p.id}>
              <div className="pm-card pm-card-pad h-100 d-flex flex-column" style={{ borderTop: `3px solid ${p.color}` }}>
                <div className="d-flex align-items-start gap-2 mb-2">
                  <span className="pm-stat-ico" style={{ background: "#f8f9fc", color: p.color }}><i className={`bi ${p.icon}`} /></span>
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ fontWeight: 800, fontFamily: "Sora", fontSize: ".82rem" }}>{p.name}</span>
                      {p.locked && <i className="bi bi-lock-fill" style={{ color: "#98a2b3", fontSize: ".7rem" }} title="Dual-key + board quorum required" />}
                    </div>
                    <div className="pm-td-sub mono">{p.id}</div>
                  </div>
                  <Badge tone={healthTone(p.health)} dot>{p.health}</Badge>
                  <Dropdown width={230} trigger={() => <button className="btn btn-outline-secondary btn-sm"><i className="bi bi-three-dots" /></button>}>
                    {(close) => (
                      <>
                        <div className="pm-dd-head">{p.id}</div>
                        <DDItem icon="bi-eye" label="Open pool detail" hint={`${p.purpose}`} onClick={() => { close(); setDetailPool(p); }} />
                        {!p.locked && p.health !== "Frozen" && (
                          <>
                            <DDItem icon="bi-arrow-left-right" label="Transfer funds" hint={kes(avail, { compact: true }) + " free"} onClick={() => { close(); openTransfer(p); }} />
                            <DDItem icon="bi-plus-circle" label="Top up (external)" hint="Bank → pool" onClick={() => { close(); openTopUp(p); }} />
                            <DDItem icon="bi-box-arrow-up" label="Withdraw (external)" hint="Board resolution" onClick={() => { close(); setWithdrawPool(p); }} />
                          </>
                        )}
                        <DDItem icon="bi-shield-check" label="Reserve ratio" hint={`floor ${p.reserveRatio}%`} onClick={() => { close(); setReservePool(p); }} />
                        {!p.locked && (
                          <DDItem icon={p.health === "Frozen" ? "bi-unlock" : "bi-snow"} label={p.health === "Frozen" ? "Unfreeze pool" : "Freeze pool"} hint="2FA + audit" onClick={() => { close(); setFreezePool(p); }} />
                        )}
                      </>
                    )}
                  </Dropdown>
                </div>
                <div className="d-flex align-items-baseline justify-content-between">
                  <span style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1.15rem" }}>{kes(p.balance, { compact: true })}</span>
                  <span className="pm-td-sub mono">free {kes(avail, { compact: true })}</span>
                </div>
                <div className="mt-2">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="pm-eyebrow mb-0">Utilisation</span>
                    <span style={{ fontWeight: 700, fontSize: ".72rem" }}>{p.utilisation}%</span>
                  </div>
                  <Meter value={p.utilisation} tone={p.utilisation > 85 ? "#f04438" : p.utilisation > 75 ? "#f79009" : "#12b76a"} width={999} />
                </div>
                <div className="d-flex align-items-center justify-content-between mt-2 pt-2" style={{ borderTop: "1px dashed var(--pm-border)" }}>
                  <span className="pm-td-sub">
                    <i className={`bi ${p.trend === "up" ? "bi-graph-up-arrow" : p.trend === "down" ? "bi-graph-down-arrow" : "bi-arrow-right"} me-1`} />
                    {num(p.movements24h)} mv · floor {kes(p.lowThreshold, { compact: true })}
                  </span>
                  <button className="btn btn-sm btn-outline-primary" style={{ fontSize: ".68rem" }} onClick={() => setDetailPool(p)}>Detail</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================== Transfers table ============================== */}
      <div className="pm-section-head">
        <div>
          <span className="pm-eyebrow">Inter-pool movements · dual control</span>
          <h3 className="mb-0">Recent transfers</h3>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setTransfersDrawer(true)}>
            <i className="bi bi-clock-history me-1" />Full history ({transfers.length})
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => openTransfer(null)}>
            <i className="bi bi-arrow-left-right me-1" />New transfer
          </button>
        </div>
      </div>
      <div className="pm-card mb-3">
        <div className="pm-tabs px-3 pt-2">
          {tabs.map((t) => (
            <button key={t} className={`pm-tab ${tab === t ? "active" : ""}`} onClick={() => { setTab(t); setPage(1); }}>
              {t}<span className="cnt">{t === "All" ? transfers.length : transfers.filter((x) => x.status === t).length}</span>
            </button>
          ))}
        </div>
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead>
              <tr><th>Ref</th><th>Route</th><th className="text-end">Amount</th><th>Initiated → approved</th><th>When</th><th>Status</th><th /></tr>
            </thead>
            <tbody>
              {pageRows.map((t) => (
                <tr key={t.id} style={{ cursor: "pointer" }} onClick={() => setTransferDetail(t)}>
                  <td className="mono pm-td-strong">{t.id}</td>
                  <td>
                    <span style={{ fontSize: ".78rem", fontWeight: 600 }}>{t.fromPool}</span>
                    <i className="bi bi-arrow-right mx-1" style={{ fontSize: ".64rem", color: "#98a2b3" }} />
                    <span style={{ fontSize: ".78rem", fontWeight: 600 }}>{t.toPool}</span>
                    <div className="pm-td-sub">{t.reason}</div>
                  </td>
                  <td className="text-end pm-num" style={{ fontWeight: 700 }}>{kes(t.amount, { compact: true })}</td>
                  <td className="pm-td-sub mono">{t.initiatedBy}<br />{t.approvedBy}</td>
                  <td className="pm-td-sub mono">{t.date}<br />{t.time}</td>
                  <td>
                    <Badge tone={t.status === "Complete" ? "green" : t.status === "Failed" ? "red" : t.status === "Scheduled" ? "blue" : "amber"} dot>{t.status}</Badge>
                  </td>
                  <td className="text-end">
                    {t.status === "Pending approval" ? (
                      <button className="btn btn-sm btn-outline-primary" style={{ fontSize: ".68rem" }} onClick={(e) => { e.stopPropagation(); setApproveTarget(t); }}>Approve</button>
                    ) : (
                      <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".68rem" }} onClick={(e) => { e.stopPropagation(); setTransferDetail(t); }}>Detail</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-2 d-flex align-items-center justify-content-between">
          <span className="pm-td-sub">{filtered.length} transfers · page {page} of {Math.max(1, Math.ceil(filtered.length / pageSize))}</span>
          <Pagination page={page} pageSize={pageSize} total={filtered.length} onPage={setPage} onPageSize={() => setPage(1)} />
        </div>
      </div>

      {/* ============================== Automation & alerts ============================== */}
      <div className="row g-2 mb-3">
        <div className="col-12 col-xl-4">
          <div className="pm-card pm-card-pad h-100 d-flex flex-column">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div>
                <span className="pm-eyebrow">Guardrail automation</span>
                <h3 className="h6 mb-0" style={{ fontFamily: "Sora" }}>Sweep rules</h3>
              </div>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setSweepsOpen(true)}>Manage</button>
            </div>
            {sweeps.slice(0, 4).map((s) => (
              <div className="pm-kv" key={s.id}>
                <span className="k">
                  <Badge tone={s.enabled ? "green" : "grey"} dot>{s.id}</Badge>
                  <span className="ms-2" style={{ fontSize: ".74rem" }}>{s.source} → {s.destination}</span>
                </span>
                <span className="v mono" style={{ fontSize: ".72rem" }}>{kes(s.amount, { compact: true })}</span>
              </div>
            ))}
            <div className="pm-td-sub mt-auto pt-2">
              {sweeps.filter((s) => s.enabled).length} of {sweeps.length} enabled · {sweeps.reduce((s, x) => s + x.runs30d, 0)} runs / 30d
            </div>
          </div>
        </div>
        <div className="col-12 col-xl-4">
          <div className="pm-card pm-card-pad h-100 d-flex flex-column">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div>
                <span className="pm-eyebrow">Guardrails</span>
                <h3 className="h6 mb-0" style={{ fontFamily: "Sora" }}>Low-balance alerts</h3>
              </div>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setAlertsOpen(true)}>Configure</button>
            </div>
            {alerts.slice(0, 5).map((a) => (
              <div className="pm-kv" key={a.id}>
                <span className="k" style={{ fontSize: ".74rem" }}>{a.label}</span>
                <span className="v mono" style={{ fontSize: ".72rem" }}>
                  <i className="bi bi-circle-fill me-1" style={{ fontSize: ".5rem", color: a.ok ? "#12b76a" : "#f04438" }} />
                  {kes(a.current, { compact: true })} / {kes(a.threshold, { compact: true })}
                </span>
              </div>
            ))}
            <div className="pm-td-sub mt-auto pt-2">
              {breaches === 0 ? "All pools above their floors." : `${breaches} pool(s) below floor — Treasury paged.`}
            </div>
          </div>
        </div>
        <div className="col-12 col-xl-4">
          <div className="pm-card pm-card-pad h-100 d-flex flex-column">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div>
                <span className="pm-eyebrow">Regulatory</span>
                <h3 className="h6 mb-0" style={{ fontFamily: "Sora" }}>Reserve compliance</h3>
              </div>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setReservesOpen(true)}>Detail</button>
            </div>
            {RESERVES.slice(0, 4).map((r) => (
              <div className="pm-kv" key={r.requirement}>
                <span className="k" style={{ fontSize: ".74rem" }}>{r.requirement}</span>
                <span className="v mono" style={{ fontSize: ".72rem" }}>
                  <i className="bi bi-check2-circle me-1" style={{ fontSize: ".7rem", color: "#12b76a" }} />
                  {r.required} → <b>{r.current}</b>
                </span>
              </div>
            ))}
            <div className="pm-td-sub mt-auto pt-2">
              All five requirements compliant · CBK return filed 2026-08-20.
            </div>
          </div>
        </div>
      </div>

      {/* ============================== Insight row ============================== */}
      <div className="row g-2 mb-3">
        <div className="col-12 col-xl-6">
          <div className="pm-card pm-card-pad h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div>
                <span className="pm-eyebrow">Treasury foresight</span>
                <h3 className="h6 mb-0" style={{ fontFamily: "Sora" }}>Liquidity forecast — Main Operating</h3>
              </div>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setForecastOpen(true)}>Full forecast</button>
            </div>
            {FORECAST.map((f) => (
              <div className="pm-kv" key={f.horizon}>
                <span className="k" style={{ fontSize: ".76rem" }}>
                  {f.horizon}
                  {f.action !== "None" && <Badge tone="amber" >{f.action}</Badge>}
                </span>
                <span className="v mono" style={{ fontSize: ".74rem" }}>
                  <span style={{ color: f.net >= 0 ? "#0b8f52" : "#b42318" }}>{f.net >= 0 ? "+" : ""}{kes(f.net, { compact: true })}</span>
                  {" → "}{kes(f.balance, { compact: true })}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="col-12 col-xl-6">
          <div className="pm-card pm-card-pad h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div>
                <span className="pm-eyebrow">Trailing windows</span>
                <h3 className="h6 mb-0" style={{ fontFamily: "Sora" }}>Cash flow (30d)</h3>
              </div>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setCashflowOpen(true)}>Full statement</button>
            </div>
            {CASHFLOW.slice(0, 4).map((c) => (
              <div className="pm-kv" key={c.category}>
                <span className="k" style={{ fontSize: ".76rem" }}>{c.category}</span>
                <span className="v mono" style={{ fontSize: ".74rem", color: c.kind === "outflow" ? "#b42318" : c.kind === "inflow" ? "#0b8f52" : "var(--pm-ink)", fontWeight: c.kind === "total" ? 800 : 500 }}>
                  {c.kind === "outflow" ? "−" : c.kind === "inflow" ? "+" : ""}{kes(c.d30, { compact: true })}
                </span>
              </div>
            ))}
            <div className="d-flex gap-2 pt-2 mt-auto" style={{ borderTop: "1px dashed var(--pm-border)" }}>
              <button className="btn btn-outline-danger btn-sm flex-grow-1" onClick={() => setStressOpen(true)}>
                <i className="bi bi-broadcast me-1" />Stress test
              </button>
              <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => setActivityOpen(true)}>
                <i className="bi bi-activity me-1" />Activity log
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================== Modals & drawers ============================== */}
      <PoolDetailDrawer
        pool={detailPool ? pools.find((p) => p.id === detailPool.id) ?? detailPool : null}
        onClose={() => setDetailPool(null)}
        onTransfer={(p) => { setDetailPool(null); openTransfer(p); }}
        onTopUp={(p) => { setDetailPool(null); openTopUp(p); }}
        onWithdraw={(p) => { setDetailPool(null); setWithdrawPool(p); }}
        onFreeze={(p) => { setDetailPool(null); setFreezePool(p); }}
        onThresholds={() => setAlertsOpen(true)}
        onReserve={(p) => { setDetailPool(null); setReservePool(p); }}
      />
      {transferWizard && (
        <TransferWizard
          open pools={pools} source={transferSource}
          onClose={() => { setTransferWizard(false); setTransferSource(null); }}
          onDone={doTransfer}
        />
      )}
      {topUpOpen && (
        <TopUpWizard
          open pools={pools} target={topUpTarget}
          onClose={() => { setTopUpOpen(false); setTopUpTarget(null); }}
          onDone={doTopUp}
        />
      )}
      <WithdrawModal pool={withdrawPool ? pools.find((p) => p.id === withdrawPool.id) ?? withdrawPool : null} onClose={() => setWithdrawPool(null)} onDone={doWithdraw} />
      <ReserveRatioModal pool={reservePool ? pools.find((p) => p.id === reservePool.id) ?? reservePool : null} onClose={() => setReservePool(null)} onDone={doReserve} />
      <FreezePoolModal pool={freezePool ? pools.find((p) => p.id === freezePool.id) ?? freezePool : null} onClose={() => setFreezePool(null)} onDone={doFreeze} />
      {createOpen && <CreatePoolWizard open onClose={() => setCreateOpen(false)} onDone={doCreatePool} />}
      <TransfersDrawer open={transfersDrawer} onClose={() => setTransfersDrawer(false)} transfers={transfers} onOpen={setTransferDetail} />
      <TransferDetailModal
        transfer={transferDetail ? transfers.find((t) => t.id === transferDetail.id) ?? transferDetail : null}
        onClose={() => setTransferDetail(null)}
        onApprove={(t) => { setTransferDetail(null); setApproveTarget(t); }}
      />
      <ApproveTransferModal transfer={approveTarget} onClose={() => setApproveTarget(null)} onDone={doApprove} />
      <SweepsDrawer
        open={sweepsOpen} sweeps={sweeps} onClose={() => setSweepsOpen(false)}
        onToggle={doSweepToggle}
        onEdit={(s) => { setSweepsOpen(false); setSweepEdit(s); }}
        onCreate={() => { setSweepsOpen(false); setSweepWizard(true); }}
        onRun={(s) => doSweepRun(s)}
      />
      <SweepEditModal sweep={sweepEdit} onClose={() => setSweepEdit(null)} onDone={(s, amount, trigger) => { setSweeps((ss) => ss.map((x) => (x.id === s.id ? { ...x, amount, trigger } : x))); nextAct(s.destination, `${s.id} rule updated`, 0, 0); }} />
      {sweepWizard && (
        <SweepWizard open pools={pools} onClose={() => setSweepWizard(false)} onDone={(s) => setSweeps((ss) => [...ss, s])} />
      )}
      <AlertsDrawer open={alertsOpen} alerts={alerts} onClose={() => setAlertsOpen(false)} onEdit={doAlertEdit} />
      <ForecastModal open={forecastOpen} onClose={() => setForecastOpen(false)} forecast={FORECAST} />
      <ReservesModal open={reservesOpen} onClose={() => setReservesOpen(false)} />
      <CashflowModal open={cashflowOpen} onClose={() => setCashflowOpen(false)} />
      <ActivityDrawer
        open={activityOpen} activity={activity} onClose={() => setActivityOpen(false)}
        onPool={(name) => setDetailPool(pools.find((p) => p.name === name) ?? null)}
      />
      <LiquidityExportModal open={exportOpen} onClose={() => setExportOpen(false)} pools={pools} transfers={transfers} />
      <StressTestModal open={stressOpen} onClose={() => setStressOpen(false)} pools={pools} />
      <PoolActionsModal open={actionsOpen} onClose={() => setActionsOpen(false)} onAction={onAction} />
    </>
  );
}
