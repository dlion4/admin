import { useEffect, useState } from "react";
import { Badge, DDItem, Dropdown, Meter, Pagination, useToast } from "../../../components/ui";
import { csvDownload, kes, num } from "../../../lib/format";
import type { AuditRow, BlockedRow, FraudControl, GlobalLimit, HighValueItem, PoolRule, UserOverride } from "../data/withdrawalData";
import {
  ANALYTICS, AUDIT, BLOCKED_LOG, FRAUD_CONTROLS, GLOBAL_LIMITS, HIGH_VALUE_QUEUE,
  POOL_RULES, USER_OVERRIDES, WITHDRAWAL_KPI,
} from "../data/withdrawalData";
import {
  AnalyticsModal, AuditDrawer, BlockedDecisionModal, BlockedDetailModal, BlockedLogDrawer, FraudControlDetailModal,
  FraudControlsDrawer, GlobalLimitsDrawer, HighValueQueueDrawer, LimitEditModal, LimitHistoryModal, OverrideDetailModal,
  OverrideWizard, PermissionsModal, PoolRuleDetailModal, PoolRulesDrawer, ReviewWizard, RuleParamModal, SimulatorModal,
  UserOverridesDrawer, WithdrawalExportModal, limitTone,
} from "../modals/WithdrawalModals";

const statusTone = (s: string) => limitTone(s);

export function WithdrawalControls({
  signal, onNavigate,
}: {
  signal: { action: string; n: number };
  onNavigate: (id: string) => void;
}) {
  const { push } = useToast();

  /* ---------------- live state ---------------- */
  const [limits, setLimits] = useState<GlobalLimit[]>(GLOBAL_LIMITS);
  const [rules, setRules] = useState<PoolRule[]>(POOL_RULES);
  const [controls, setControls] = useState<FraudControl[]>(FRAUD_CONTROLS);
  const [overrides, setOverrides] = useState<UserOverride[]>(USER_OVERRIDES);
  const [queue, setQueue] = useState<HighValueItem[]>(HIGH_VALUE_QUEUE);
  const [blocked, setBlocked] = useState<BlockedRow[]>(BLOCKED_LOG);
  const [audit, setAudit] = useState<AuditRow[]>(AUDIT);

  const nowTime = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };
  const logAudit = (change: string, from: string, to: string, reason: string, approvedBy = "—") =>
    setAudit((a) => [{ id: `AUD-${113 + a.length - AUDIT.length}`, date: "Aug 23", admin: "Jeckonia Kwasa", change, from, to, reason, approvedBy }, ...a]);

  /* ---------------- overrides table state ---------------- */
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const pageRows = overrides.slice((page - 1) * pageSize, page * pageSize);

  /* ---------------- modal state ---------------- */
  const [limitsDrawer, setLimitsDrawer] = useState(false);
  const [editLimit, setEditLimit] = useState<GlobalLimit | null>(null);
  const [historyLimit, setHistoryLimit] = useState<GlobalLimit | null>(null);
  const [poolRulesDrawer, setPoolRulesDrawer] = useState(false);
  const [ruleDetail, setRuleDetail] = useState<PoolRule | null>(null);
  const [fraudDrawer, setFraudDrawer] = useState(false);
  const [controlDetail, setControlDetail] = useState<FraudControl | null>(null);
  const [paramControl, setParamControl] = useState<FraudControl | null>(null);
  const [queueDrawer, setQueueDrawer] = useState(false);
  const [reviewItem, setReviewItem] = useState<HighValueItem | null>(null);
  const [overridesDrawer, setOverridesDrawer] = useState(false);
  const [overrideDetail, setOverrideDetail] = useState<UserOverride | null>(null);
  const [overrideWizard, setOverrideWizard] = useState(false);
  const [overrideTarget, setOverrideTarget] = useState<UserOverride | null>(null);
  const [blockedDrawer, setBlockedDrawer] = useState(false);
  const [blockedDetail, setBlockedDetail] = useState<BlockedRow | null>(null);
  const [blockedDecision, setBlockedDecision] = useState<{ row: BlockedRow | null; d: "Release" | "Freeze" | "Escalate" | null }>({ row: null, d: null });
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);

  /* ---------------- shell signal bridge ---------------- */
  useEffect(() => {
    if (!signal.n) return;
    if (signal.action === "queue") setQueueDrawer(true);
  }, [signal]);

  /* ---------------- mutations ---------------- */
  const doLimitChange = (l: GlobalLimit, value: number) => {
    setLimits((ls) => ls.map((x) => (x.id === l.id ? { ...x, current: value, lastChanged: "Aug 23" } : x)));
    logAudit(l.label, kes(l.current, { compact: true }), kes(value, { compact: true }), "Manual adjustment");
  };

  const doRuleToggle = (r: PoolRule) => {
    setRules((rs) => rs.map((x) => (x.id === r.id ? { ...x, active: !x.active } : x)));
    logAudit(`Pool rule ${r.id} (${r.name})`, r.active ? "Active" : "Inactive", r.active ? "Inactive" : "Active", "Rule toggle");
    push(r.active
      ? { kind: "warn", title: `${r.name} disabled`, body: "Withdrawal chain re-ordered · board notified." }
      : { kind: "success", title: `${r.name} enabled`, body: "Rule evaluated on every withdrawal from now." });
  };

  const doControlToggle = (c: FraudControl) => {
    setControls((cs) => cs.map((x) => (x.id === c.id ? { ...x, enabled: !x.enabled, lastModified: "Aug 23" } : x)));
    logAudit(`Anti-fraud ${c.id} (${c.name})`, c.enabled ? "Enabled" : "Disabled", c.enabled ? "Disabled" : "Enabled", "Control toggle");
    push(c.enabled
      ? { kind: "warn", title: `${c.name} disabled`, body: `Override regime was “${c.override}” — this weakens controls.` }
      : { kind: "success", title: `${c.name} enabled`, body: c.params });
  };

  const doParamChange = (c: FraudControl, params: string) => {
    setControls((cs) => cs.map((x) => (x.id === c.id ? { ...x, params, lastModified: "Aug 23" } : x)));
    logAudit(`Parameter ${c.id}`, c.params, params, "Threshold retune");
  };

  const doReviewDecision = (q: HighValueItem, decision: "Approve" | "Block", note: string) => {
    setQueue((qs) => qs.filter((x) => x.id !== q.id));
    logAudit(`High-value ${q.id} (${q.userId})`, "Queued", decision === "Approve" ? "Released" : "Blocked", note);
    if (decision === "Block") {
      setBlocked((bs) => [{
        id: `BLK-${232 + bs.length - BLOCKED_LOG.length}`, date: "Aug 23", time: nowTime(), userId: q.userId,
        amount: q.amount, device: q.device, ip: q.ip, reason: q.flags.join(", "),
        autoAction: "Held in queue", adminAction: `Blocked — ${note.slice(0, 40)}`, status: "Pending review",
      }, ...bs]);
    }
  };

  const doOverrideUpsert = (o: UserOverride) => {
    setOverrides((os) => (os.some((x) => x.id === o.id) ? os.map((x) => (x.id === o.id ? o : x)) : [o, ...os]));
    logAudit(`User ${o.userId} daily`, "—", o.customDaily === "Unlimited" ? "Unlimited" : kes(o.customDaily, { compact: true }), o.reason);
  };

  const doBlockedDecision = (r: BlockedRow, d: "Release" | "Freeze" | "Escalate", note: string) => {
    const next = d === "Release"
      ? { status: "Released" as const, adminAction: `Released — ${note.slice(0, 40)}` }
      : d === "Freeze"
        ? { status: "Account frozen" as const, adminAction: `Frozen — ${note.slice(0, 40)}` }
        : { status: "Under review" as const, adminAction: `Escalated — ${note.slice(0, 40)}` };
    setBlocked((bs) => bs.map((x) => (x.id === r.id ? { ...x, ...next } : x)));
    logAudit(`Blocked ${r.id} (${r.userId})`, r.status, d === "Release" ? "Released" : d === "Freeze" ? "Frozen" : "Escalated", note, d === "Release" ? "Self (Tier 0)" : "Sarah Kamau");
    setBlockedDetail(null);
  };

  const kpi = WITHDRAWAL_KPI({
    queueCount: queue.length,
    overrides: overrides.length,
    activeControls: controls.filter((c) => c.enabled).length,
    totalControls: controls.length,
  });
  const pendingBlocked = blocked.filter((b) => b.status === "Pending review" || b.status === "Under review").length;

  return (
    <>
      {/* ============================== Header ============================== */}
      <div className="pm-section-head" style={{ marginTop: 0 }}>
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="pm-eyebrow">Risk & controls · Page 13</span>
            <span className="pm-live"><span className="pm-dot green pm-pulse" />RULE ENGINE · {controls.filter((c) => c.enabled).length + rules.filter((r) => r.active).length} RULES LIVE</span>
          </div>
          <h2>Withdrawal Controls</h2>
          <p>
            Global limits, pool-based access rules and the anti-fraud control stack — every withdrawal dry-runs against
            {rules.filter((r) => r.active).length + controls.filter((c) => c.enabled).length} live checks before a shilling moves. Tier-0 powers are 2FA-gated and board-visible.
          </p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setSimulatorOpen(true)}>
            <i className="bi bi-play-btn me-1" />Simulator
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setAnalyticsOpen(true)}>
            <i className="bi bi-graph-up-arrow me-1" />Analytics
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setAuditOpen(true)}>
            <i className="bi bi-journal-check me-1" />Audit ({audit.length})
          </button>
          <button className="btn btn-outline-secondary btn-sm position-relative" onClick={() => setBlockedDrawer(true)}>
            <i className="bi bi-slash-circle me-1" />Blocked
            {pendingBlocked > 0 && <span className="pm-nav-pill" style={{ position: "absolute", top: -6, right: -6 }}>{pendingBlocked}</span>}
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setExportOpen(true)}>
            <i className="bi bi-download me-1" />Export
          </button>
          <Dropdown width={260} trigger={() => <button className="btn btn-outline-secondary btn-sm"><i className="bi bi-three-dots" /></button>}>
            {(close) => (
              <>
                <div className="pm-dd-head">Control plane</div>
                <DDItem icon="bi-person-lock" label="Permissions matrix" hint="Who can change what" onClick={() => { close(); setPermissionsOpen(true); }} />
                <DDItem icon="bi-person-gear" label="User overrides" hint={`${overrides.length} profiles`} onClick={() => { close(); setOverridesDrawer(true); }} />
                <DDItem icon="bi-diagram-2" label="Pool access rules" hint={`${rules.filter((r) => r.active).length}/${rules.length} active`} onClick={() => { close(); setPoolRulesDrawer(true); }} />
                <DDItem icon="bi-shield-fill-check" label="Anti-fraud controls" hint={`${controls.filter((c) => c.enabled).length}/${controls.length} enabled`} onClick={() => { close(); setFraudDrawer(true); }} />
                <div className="pm-dd-sep" />
                <DDItem icon="bi-activity" label="Open Platform Monitor" hint="Page 2 · fraud signals" onClick={() => { close(); onNavigate("monitor"); }} />
                <DDItem icon="bi-droplet-half" label="Open Liquidity & Pools" hint="Page 12 · pool floors" onClick={() => { close(); onNavigate("liquidity"); }} />
                <DDItem icon="bi-shield-check" label="Open KYC Verification" hint="Page 6 · identity" onClick={() => { close(); onNavigate("kyc"); }} />
              </>
            )}
          </Dropdown>
          <button className="btn btn-primary btn-sm position-relative" onClick={() => setQueueDrawer(true)}>
            <i className="bi bi-hourglass-split me-1" />High-value queue
            {queue.length > 0 && <span className="pm-nav-pill" style={{ position: "absolute", top: -6, right: -6 }}>{queue.length}</span>}
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

      {/* ============================== Global limits ============================== */}
      <div className="pm-section-head">
        <div>
          <span className="pm-eyebrow">Platform-wide · Super Admin + 2FA</span>
          <h3 className="mb-0">Global withdrawal limits</h3>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setSimulatorOpen(true)}>
            <i className="bi bi-play-btn me-1" />Test against rules
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setLimitsDrawer(true)}>
            <i className="bi bi-sliders me-1" />Manage all ({limits.length})
          </button>
        </div>
      </div>
      <div className="pm-card mb-3">
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Limit type</th><th className="text-end">Current</th><th className="text-end">Max allowed</th><th>Effective</th><th>Last changed</th><th /></tr></thead>
            <tbody>
              {limits.map((l) => (
                <tr key={l.id}>
                  <td>
                    <span className="pm-td-strong"><i className={`bi ${l.icon} me-2`} style={{ color: "#175cd3" }} />{l.label}</span>
                    <div className="pm-td-sub">{l.note}</div>
                  </td>
                  <td className="text-end pm-num" style={{ fontWeight: 800 }}>{kes(l.current)}</td>
                  <td className="text-end pm-num pm-td-sub">{kes(l.max)}</td>
                  <td className="pm-td-sub mono">{l.effective}</td>
                  <td className="pm-td-sub mono">{l.lastChanged}</td>
                  <td className="text-end text-nowrap">
                    <button className="btn btn-sm btn-outline-secondary me-1" style={{ fontSize: ".66rem" }} onClick={() => setHistoryLimit(l)} title="Change history">
                      <i className="bi bi-clock-history" />
                    </button>
                    <button className="btn btn-sm btn-outline-primary" style={{ fontSize: ".68rem" }} onClick={() => setEditLimit(l)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================== Queue + blocked ============================== */}
      <div className="row g-2 mb-3">
        <div className="col-12 col-xl-7">
          <div className="pm-card h-100 d-flex flex-column">
            <div className="pm-tabs px-3 pt-2">
              <button className="pm-tab active">High-value queue ({queue.length})<span className="cnt">{queue.filter((q) => q.ageMin > q.slaMin).length} SLA</span></button>
            </div>
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Case</th><th>User</th><th className="text-end">Amount</th><th>SLA</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {queue.slice(0, 6).map((q) => {
                    const overdue = q.ageMin > q.slaMin;
                    return (
                      <tr key={q.id} style={{ cursor: "pointer" }} onClick={() => setReviewItem(q)}>
                        <td className="mono pm-td-strong">{q.id}<div className="pm-td-sub mono">{q.time} · {q.channel}</div></td>
                        <td className="pm-td-strong" style={{ fontSize: ".78rem" }}>{q.name}<div className="pm-td-sub mono">{q.userId}</div></td>
                        <td className="text-end pm-num" style={{ fontWeight: 800 }}>{kes(q.amount, { compact: true })}</td>
                        <td style={{ minWidth: 90 }}>
                          <Meter value={Math.min(100, Math.round((q.ageMin / q.slaMin) * 100))} tone={overdue ? "#f04438" : "#f79009"} width={999} />
                          <div className="pm-td-sub mono">{q.ageMin}m / {q.slaMin}m</div>
                        </td>
                        <td><Badge tone={statusTone(q.status)} dot>{q.status}</Badge></td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-primary" style={{ fontSize: ".68rem" }} onClick={(e) => { e.stopPropagation(); setReviewItem(q); }}>Review</button>
                        </td>
                      </tr>
                    );
                  })}
                  {queue.length === 0 && (
                    <tr><td colSpan={6} className="text-center pm-td-sub py-3">Queue clear — no high-value withdrawals waiting.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-2 d-flex justify-content-end">
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setQueueDrawer(true)}>Open full queue ({queue.length})</button>
            </div>
          </div>
        </div>
        <div className="col-12 col-xl-5">
          <div className="pm-card pm-card-pad h-100 d-flex flex-column">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div>
                <span className="pm-eyebrow">Auto-blocked by controls</span>
                <h3 className="h6 mb-0" style={{ fontFamily: "Sora" }}>Blocked withdrawals</h3>
              </div>
              <Badge tone="red" dot>{pendingBlocked} open</Badge>
            </div>
            {blocked.slice(0, 5).map((b) => (
              <button key={b.id} className="pm-alert-row w-100 text-start mb-2" style={{ border: "1px solid var(--pm-border)", borderLeftColor: b.status === "Released" ? "#12b76a" : b.status === "Pending review" ? "#f79009" : "#f04438" }} onClick={() => setBlockedDetail(b)}>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="mono" style={{ fontWeight: 700, fontSize: ".72rem" }}>{b.id}</span>
                    <span className="mono pm-td-sub">{b.userId}</span>
                    <Badge tone={statusTone(b.status)} dot>{b.status}</Badge>
                  </div>
                  <div className="pm-td-sub">{b.reason} · {b.date} {b.time}</div>
                </div>
                <span className="pm-num" style={{ fontWeight: 700, fontSize: ".74rem" }}>{b.amount === 0 ? "—" : kes(b.amount, { compact: true })}</span>
              </button>
            ))}
            <div className="mt-auto pt-2 d-flex gap-2">
              <button className="btn btn-sm btn-outline-secondary flex-grow-1" onClick={() => setBlockedDrawer(true)}>Full log ({blocked.length})</button>
              <button className="btn btn-sm btn-outline-primary flex-grow-1" onClick={() => setFraudDrawer(true)}>Controls</button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================== Rules + controls ============================== */}
      <div className="row g-2 mb-3">
        <div className="col-12 col-xl-6">
          <div className="pm-card pm-card-pad h-100 d-flex flex-column">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div>
                <span className="pm-eyebrow">Checked before every withdrawal</span>
                <h3 className="h6 mb-0" style={{ fontFamily: "Sora" }}>Pool-based access rules</h3>
              </div>
              <div className="d-flex gap-1">
                <Badge tone="green">{rules.filter((r) => r.active).length} active</Badge>
                {rules.some((r) => !r.active) && <Badge tone="grey">{rules.filter((r) => !r.active).length} off</Badge>}
              </div>
            </div>
            {rules.map((r) => (
              <div className="pm-alert-row mb-2" key={r.id} style={{ border: "1px solid var(--pm-border)", borderLeftColor: r.active ? "#7a5af8" : "#98a2b3" }}>
                <div className="flex-grow-1" style={{ minWidth: 0, cursor: "pointer" }} onClick={() => setRuleDetail(r)}>
                  <div style={{ fontWeight: 700, fontSize: ".78rem" }}>{r.name}</div>
                  <div className="pm-td-sub">{r.description}</div>
                </div>
                <div className="form-check form-switch mb-0">
                  <input className="form-check-input" type="checkbox" checked={r.active} onChange={() => doRuleToggle(r)} />
                </div>
              </div>
            ))}
            <div className="mt-auto pt-2">
              <button className="btn btn-sm btn-outline-secondary w-100" onClick={() => setPoolRulesDrawer(true)}>Open rules console</button>
            </div>
          </div>
        </div>
        <div className="col-12 col-xl-6">
          <div className="pm-card pm-card-pad h-100 d-flex flex-column">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div>
                <span className="pm-eyebrow">Real-time · override-gated</span>
                <h3 className="h6 mb-0" style={{ fontFamily: "Sora" }}>Anti-fraud control stack</h3>
              </div>
              <div className="d-flex gap-1">
                <Badge tone="red">{controls.filter((c) => c.enabled).length} armed</Badge>
                {controls.filter((c) => !c.enabled).length > 0 && <Badge tone="grey">{controls.filter((c) => !c.enabled).length} off</Badge>}
              </div>
            </div>
            {controls.slice(0, 6).map((c) => (
              <div className="pm-alert-row mb-2" key={c.id} style={{ border: "1px solid var(--pm-border)", borderLeftColor: c.enabled ? "#f04438" : "#98a2b3" }}>
                <div className="flex-grow-1" style={{ minWidth: 0, cursor: "pointer" }} onClick={() => setControlDetail(c)}>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span style={{ fontWeight: 700, fontSize: ".78rem" }}>{c.name}</span>
                    <Badge tone={c.override === "Super admin only" ? "red" : "blue"}>{c.override}</Badge>
                  </div>
                  <div className="pm-td-sub mono">{c.params} · {num(c.hits30d)} hits/30d</div>
                </div>
                <div className="form-check form-switch mb-0">
                  <input className="form-check-input" type="checkbox" checked={c.enabled} onChange={() => doControlToggle(c)} />
                </div>
              </div>
            ))}
            <div className="pm-td-sub">+ {controls.length - 6} more controls (sequential rapid, SIM swap, account age…)</div>
            <div className="mt-auto pt-2">
              <button className="btn btn-sm btn-outline-secondary w-100" onClick={() => setFraudDrawer(true)}>Open control stack ({controls.length})</button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================== User overrides ============================== */}
      <div className="pm-section-head">
        <div>
          <span className="pm-eyebrow">Per-user schedules · audited</span>
          <h3 className="mb-0">User-specific limit overrides</h3>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => csvDownload("user-overrides.csv", overrides as unknown as Record<string, unknown>[])}>
            <i className="bi bi-download me-1" />Export
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setOverridesDrawer(true)}>
            <i className="bi bi-person-gear me-1" />Open drawer
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => { setOverrideTarget(null); setOverrideWizard(true); }}>
            <i className="bi bi-plus-lg me-1" />New override
          </button>
        </div>
      </div>
      <div className="pm-card mb-3">
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>User</th><th>Tier</th><th className="text-end">Daily</th><th className="text-end">Monthly</th><th>Reason</th><th>Set by</th><th>Expires</th><th>Status</th><th /></tr></thead>
            <tbody>
              {pageRows.map((o) => (
                <tr key={o.id} style={{ cursor: "pointer" }} onClick={() => setOverrideDetail(o)}>
                  <td className="mono pm-td-strong">{o.userId}<div className="pm-td-sub">{o.name}</div></td>
                  <td className="pm-td-sub">{o.tier}</td>
                  <td className="text-end pm-num">{o.customDaily === "Unlimited" ? "∞" : kes(Number(o.customDaily), { compact: true })}</td>
                  <td className="text-end pm-num">{o.customMonthly === "Unlimited" ? "∞" : kes(Number(o.customMonthly), { compact: true })}</td>
                  <td className="pm-td-sub">{o.reason}</td>
                  <td className="pm-td-sub mono">{o.setBy}</td>
                  <td className="pm-td-sub mono">{o.expires}</td>
                  <td><Badge tone={statusTone(o.status)} dot>{o.status}</Badge></td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-primary" style={{ fontSize: ".68rem" }} onClick={(e) => { e.stopPropagation(); setOverrideTarget(o); setOverrideWizard(true); }}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-2 d-flex align-items-center justify-content-between">
          <span className="pm-td-sub">{overrides.length} overrides · page {page} of {Math.max(1, Math.ceil(overrides.length / pageSize))}</span>
          <Pagination page={page} pageSize={pageSize} total={overrides.length} onPage={setPage} onPageSize={() => setPage(1)} />
        </div>
      </div>

      {/* ============================== Insight row ============================== */}
      <div className="row g-2 mb-3">
        <div className="col-12 col-xl-4">
          <div className="pm-card pm-card-pad h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div>
                <span className="pm-eyebrow">Performance</span>
                <h3 className="h6 mb-0" style={{ fontFamily: "Sora" }}>Withdrawal analytics</h3>
              </div>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setAnalyticsOpen(true)}>Full</button>
            </div>
            {ANALYTICS.slice(0, 5).map((a) => (
              <div className="pm-kv" key={a.metric}>
                <span className="k" style={{ fontSize: ".74rem" }}>{a.metric}</span>
                <span className="v mono" style={{ fontSize: ".72rem" }}>
                  <b>{a.today}</b> <span className="pm-td-sub">/ {a.month}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="col-12 col-xl-4">
          <div className="pm-card pm-card-pad h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div>
                <span className="pm-eyebrow">Governance</span>
                <h3 className="h6 mb-0" style={{ fontFamily: "Sora" }}>Latest limit changes</h3>
              </div>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setAuditOpen(true)}>Audit</button>
            </div>
            {audit.slice(0, 5).map((a) => (
              <div className="pm-kv" key={a.id}>
                <span className="k" style={{ fontSize: ".74rem" }}>{a.change}<div className="pm-td-sub mono">{a.date} · {a.admin}</div></span>
                <span className="v mono" style={{ fontSize: ".72rem" }}>{a.from} → {a.to}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="col-12 col-xl-4">
          <div className="pm-card pm-card-pad h-100 d-flex flex-column">
            <div>
              <span className="pm-eyebrow">Dry-run anything</span>
              <h3 className="h6 mb-2" style={{ fontFamily: "Sora" }}>Rule simulator</h3>
              <div className="pm-td-sub mb-3">
                Dry-run any withdrawal against the {rules.filter((r) => r.active).length + controls.filter((c) => c.enabled).length} live rules —
                amount, tier, account age, hour, geo distance and 30-day average. Nothing executes.
              </div>
            </div>
            <div className="d-flex gap-2 mt-auto">
              <button className="btn btn-primary btn-sm flex-grow-1" onClick={() => setSimulatorOpen(true)}>
                <i className="bi bi-play-btn me-1" />Run simulation
              </button>
              <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => setPermissionsOpen(true)}>
                <i className="bi bi-person-lock me-1" />Permissions
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================== Modals & drawers ============================== */}
      <GlobalLimitsDrawer
        open={limitsDrawer} limits={limits} onClose={() => setLimitsDrawer(false)}
        onEdit={(l) => { setLimitsDrawer(false); setEditLimit(l); }}
        onHistory={(l) => setHistoryLimit(l)}
      />
      <LimitEditModal limit={editLimit} onClose={() => setEditLimit(null)} onDone={doLimitChange} />
      <LimitHistoryModal limit={historyLimit} onClose={() => setHistoryLimit(null)} />
      <PoolRulesDrawer
        open={poolRulesDrawer} rules={rules} onClose={() => setPoolRulesDrawer(false)}
        onToggle={doRuleToggle} onOpen={setRuleDetail}
      />
      <PoolRuleDetailModal rule={ruleDetail} onClose={() => setRuleDetail(null)} />
      <FraudControlsDrawer
        open={fraudDrawer} controls={controls} onClose={() => setFraudDrawer(false)}
        onToggle={doControlToggle} onOpen={setControlDetail}
      />
      <FraudControlDetailModal control={controlDetail} onClose={() => setControlDetail(null)} onParam={setParamControl} />
      <RuleParamModal control={paramControl} onClose={() => setParamControl(null)} onDone={doParamChange} />
      <HighValueQueueDrawer
        open={queueDrawer} queue={queue} onClose={() => setQueueDrawer(false)}
        onOpen={(q) => { setQueueDrawer(false); setReviewItem(q); }}
      />
      {reviewItem && (
        <ReviewWizard
          item={queue.find((q) => q.id === reviewItem.id) ?? reviewItem}
          overrides={overrides}
          onClose={() => setReviewItem(null)}
          onDone={doReviewDecision}
        />
      )}
      <UserOverridesDrawer
        open={overridesDrawer} overrides={overrides} onClose={() => setOverridesDrawer(false)}
        onOpen={(o) => { setOverridesDrawer(false); setOverrideDetail(o); }}
        onCreate={() => { setOverridesDrawer(false); setOverrideTarget(null); setOverrideWizard(true); }}
      />
      <OverrideDetailModal
        override={overrideDetail ? overrides.find((o) => o.id === overrideDetail.id) ?? overrideDetail : null}
        onClose={() => setOverrideDetail(null)}
        onEdit={(o) => { setOverrideDetail(null); setOverrideTarget(o); setOverrideWizard(true); }}
      />
      {overrideWizard && (
        <OverrideWizard
          open target={overrideTarget}
          onClose={() => { setOverrideWizard(false); setOverrideTarget(null); }}
          onDone={doOverrideUpsert}
        />
      )}
      <BlockedLogDrawer
        open={blockedDrawer} rows={blocked} onClose={() => setBlockedDrawer(false)}
        onOpen={(r) => { setBlockedDrawer(false); setBlockedDetail(r); }}
      />
      <BlockedDetailModal
        row={blockedDetail ? blocked.find((b) => b.id === blockedDetail.id) ?? blockedDetail : null}
        onClose={() => setBlockedDetail(null)}
        onDecision={(r, d) => { setBlockedDetail(null); setBlockedDecision({ row: r, d }); }}
      />
      <BlockedDecisionModal row={blockedDecision.row} decision={blockedDecision.d} onClose={() => setBlockedDecision({ row: null, d: null })} onDone={doBlockedDecision} />
      <AnalyticsModal open={analyticsOpen} onClose={() => setAnalyticsOpen(false)} />
      <AuditDrawer open={auditOpen} audit={audit} onClose={() => setAuditOpen(false)} />
      <WithdrawalExportModal open={exportOpen} onClose={() => setExportOpen(false)} queue={queue} blocked={blocked} overrides={overrides} />
      <PermissionsModal open={permissionsOpen} onClose={() => setPermissionsOpen(false)} />
      <SimulatorModal open={simulatorOpen} onClose={() => setSimulatorOpen(false)} limits={limits} rules={rules} controls={controls} />
    </>
  );
}
