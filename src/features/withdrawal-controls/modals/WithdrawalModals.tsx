import { useState } from "react";
import { Badge, Drawer, EmptyState, Meter, Modal, Steps, TwoFactorField, useToast } from "../../../components/ui";
import { csvDownload, jsonDownload, kes, num } from "../../../lib/format";
import type {
  AuditRow, BlockedRow, FraudControl, GlobalLimit, HighValueItem, PoolRule, UserOverride,
} from "../data/withdrawalData";
import { ANALYTICS, AUDIT, GLOBAL_LIMITS, POOL_RULES, USER_OVERRIDES } from "../data/withdrawalData";

const CODE = "482913";

export const limitTone = (s: string) =>
  s === "Awaiting OTP" || s === "Released" ? "blue" : s === "VP verification" || s === "Under review" || s === "Auto-review" ? "amber"
    : s === "Escalated" || s === "Account frozen" || s === "Blocked" ? "red"
      : s === "Pending review" ? "amber" : s === "Active" ? "green" : s === "Restricted" ? "amber" : "grey";

const fmtVal = (v: number | "Unlimited") => (v === "Unlimited" ? "Unlimited" : kes(v));

/* ================================================================
   1. Global limits drawer
   ================================================================ */
export function GlobalLimitsDrawer({
  open, onClose, limits, onEdit, onHistory,
}: {
  open: boolean;
  onClose: () => void;
  limits: GlobalLimit[];
  onEdit: (l: GlobalLimit) => void;
  onHistory: (l: GlobalLimit) => void;
}) {
  return (
    <Drawer open={open} onClose={onClose} wide icon="bi-sliders" tone="blue" title="Global withdrawal limits"
      subtitle={`${limits.length} platform-wide limits · Super Admin + 2FA to change`}
      footer={<div className="pm-note w-100 mb-0"><i className="bi bi-shield-lock me-1" />Changes are versioned and land in the audit trail with your name, reason and approver.</div>}>
      <div className="pm-table-wrap">
        <table className="pm-table">
          <thead><tr><th>Limit type</th><th>Current</th><th>Max allowed</th><th>Effective</th><th>Last changed</th><th /></tr></thead>
          <tbody>
            {limits.map((l) => (
              <tr key={l.id}>
                <td>
                  <span className="pm-td-strong"><i className={`bi ${l.icon} me-2`} style={{ color: "#175cd3" }} />{l.label}</span>
                  <div className="pm-td-sub">{l.note}</div>
                </td>
                <td className="pm-num" style={{ fontWeight: 800 }}>{kes(l.current)}</td>
                <td className="pm-num pm-td-sub">{kes(l.max)}</td>
                <td className="pm-td-sub mono">{l.effective}</td>
                <td className="pm-td-sub mono">{l.lastChanged}</td>
                <td className="text-end text-nowrap">
                  <button className="btn btn-sm btn-outline-secondary me-1" style={{ fontSize: ".66rem" }} onClick={() => onHistory(l)}>
                    <i className="bi bi-clock-history" />
                  </button>
                  <button className="btn btn-sm btn-outline-primary" style={{ fontSize: ".66rem" }} onClick={() => onEdit(l)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Drawer>
  );
}

/* ================================================================
   2. Limit edit modal
   ================================================================ */
export function LimitEditModal({
  limit, onClose, onDone,
}: { limit: GlobalLimit | null; onClose: () => void; onDone: (l: GlobalLimit, value: number) => void }) {
  const { push } = useToast();
  const [value, setValue] = useState(limit?.current ?? 0);
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  if (!limit) return null;
  const isMin = limit.id === "LIM-04";
  const boundary = isMin ? limit.max : limit.max;
  const outOfRange = isMin ? value < 1 || value > boundary : value < 1 || value > boundary;
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-pencil-square" size="sm"
      title={`Edit — ${limit.label}`} subtitle={`Current ${kes(limit.current)} · ${isMin ? "lowest allowed" : "max allowed"} ${kes(boundary)}`}>
      <div className="pm-modal-body">
        <label className="form-label">New value (KES)</label>
        <input type="number" className="form-control mono mb-2" value={value} step={limit.current >= 100_000 ? 50_000 : 10} onChange={(e) => setValue(Number(e.target.value))} />
        <div className="d-flex gap-1 flex-wrap mb-3">
          {(isMin ? [50, 100, 200] : [0.25, 0.5, 1]).map((f) => (
            <button key={f} className="pm-chip" onClick={() => setValue(Math.round(boundary * f))}>{f === 1 ? "Max" : `${f * 100}% of max`}</button>
          ))}
        </div>
        <label className="form-label">Reason <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control mb-3" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Partner agreement update · quarterly review" />
        <div className="pm-note mb-3">
          <i className="bi bi-info-circle me-1" />
          Applies instantly to all {limit.id === "LIM-08" ? "business sub-accounts" : "users"} unless a specific override exists. Dual sign-off by Finance if change &gt; 100%.
        </div>
        <TwoFactorField value={code} onChange={setCode} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={code !== CODE || outOfRange || reason.trim().length < 6 || value === limit.current} onClick={() => {
          onDone(limit, value);
          push({ kind: "success", title: "Limit updated", body: `${limit.label}: ${kes(limit.current)} → ${kes(value)}.` });
          onClose();
        }}>
          <i className="bi bi-check2 me-1" />Save limit
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   3. Limit change history modal
   ================================================================ */
export function LimitHistoryModal({ limit, onClose }: { limit: GlobalLimit | null; onClose: () => void }) {
  if (!limit) return null;
  const related = AUDIT.filter((a) => a.change.toLowerCase().includes(limit.label.split(" (")[0].split(" per")[0].toLowerCase().slice(0, 8)));
  const history = [
    { d: limit.lastChanged, from: kes(limit.current), to: kes(limit.current), by: "Joseph Mwangi", why: "No change (quarterly review)" },
    { d: "Mar 2025", from: kes(Math.round(limit.current * 0.8)), to: kes(limit.current), by: "Joseph Mwangi", why: "Annual limits review" },
    { d: "Jan 2025", from: "—", to: kes(Math.round(limit.current * 0.8)), by: "Platform launch", why: "Initial calibration" },
    ...related.map((r) => ({ d: r.date, from: r.from, to: r.to, by: r.admin, why: r.reason })),
  ];
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-clock-history" size="md"
      title={`Change history — ${limit.label}`} subtitle={`${limit.id} · effective since ${limit.effective}`}>
      <div className="pm-modal-body">
        <div className="pm-timeline">
          {history.map((h, i) => (
            <div key={i} className={`pm-tl-item ${i === 0 ? "done" : ""}`}>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <span style={{ fontWeight: 700, fontSize: ".8rem" }}>{h.d}</span>
                <span className="mono pm-td-sub">{h.from === h.to ? h.from : `${h.from} → ${h.to}`}</span>
              </div>
              <div className="pm-td-sub">{h.by} · {h.why}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => csvDownload(`limit-history-${limit.id}.csv`, history as unknown as Record<string, unknown>[])}>
          <i className="bi bi-download me-1" />Export history
        </button>
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   4. Pool access rules drawer
   ================================================================ */
export function PoolRulesDrawer({
  open, onClose, rules, onToggle, onOpen,
}: {
  open: boolean;
  onClose: () => void;
  rules: PoolRule[];
  onToggle: (r: PoolRule) => void;
  onOpen: (r: PoolRule) => void;
}) {
  return (
    <Drawer open={open} onClose={onClose} wide icon="bi-diagram-2" tone="violet" title="Pool-based access rules"
      subtitle={`${rules.filter((r) => r.active).length} of ${rules.length} active · checked before every withdrawal`}
      footer={<div className="pm-note w-100 mb-0"><i className="bi bi-shield-check me-1" />Rules execute in order; the first block wins. Flag-level rules continue down the chain.</div>}>
      {rules.map((r) => (
        <div key={r.id} className="pm-alert-row mb-2" style={{ border: "1px solid var(--pm-border)", borderLeftColor: r.active ? "#7a5af8" : "#98a2b3" }}>
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="mono" style={{ fontWeight: 700, fontSize: ".74rem" }}>{r.id}</span>
              <span style={{ fontWeight: 700, fontSize: ".82rem" }}>{r.name}</span>
              <Badge tone={r.active ? "green" : "grey"} dot>{r.active ? "Active" : "Inactive"}</Badge>
            </div>
            <div className="pm-td-sub">{r.description}</div>
            <div className="pm-td-sub mono">trigger: {r.trigger} → {r.action}</div>
          </div>
          <div className="d-flex flex-column gap-1 align-items-end">
            <div className="form-check form-switch mb-0">
              <input className="form-check-input" type="checkbox" checked={r.active} onChange={() => onToggle(r)} />
            </div>
            <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".66rem" }} onClick={() => onOpen(r)}>Detail</button>
          </div>
        </div>
      ))}
    </Drawer>
  );
}

/* ================================================================
   5. Pool rule detail modal
   ================================================================ */
export function PoolRuleDetailModal({ rule, onClose }: { rule: PoolRule | null; onClose: () => void }) {
  if (!rule) return null;
  return (
    <Modal open onClose={onClose} tone="violet" icon="bi-diagram-2" size="sm"
      title={`${rule.id} — ${rule.name}`} subtitle={rule.active ? "Active in the withdrawal chain" : "Inactive — not evaluated"}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Description</span><span className="v">{rule.description}</span></div>
          <div className="pm-kv"><span className="k">Trigger</span><span className="v mono">{rule.trigger}</span></div>
          <div className="pm-kv"><span className="k">Action</span><span className="v"><Badge tone={rule.action.startsWith("Block") ? "red" : "amber"} dot>{rule.action}</Badge></span></div>
          <div className="pm-kv"><span className="k">Change regime</span><span className="v">Super Admin + 2FA · board notified</span></div>
        </div>
        {rule.action.startsWith("Block") && (
          <div className="pm-alert-row crit">
            <i className="bi bi-exclamation-triangle-fill" style={{ color: "#f04438" }} />
            <div style={{ fontSize: ".78rem" }}>This is a hard block — the user sees “withdrawal unavailable”, not a verification prompt.</div>
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   6. Anti-fraud controls drawer (§13.3 + §13.8 config)
   ================================================================ */
export function FraudControlsDrawer({
  open, onClose, controls, onToggle, onOpen,
}: {
  open: boolean;
  onClose: () => void;
  controls: FraudControl[];
  onToggle: (c: FraudControl) => void;
  onOpen: (c: FraudControl) => void;
}) {
  return (
    <Drawer open={open} onClose={onClose} wide icon="bi-shield-fill-check" tone="red" title="Anti-fraud withdrawal controls"
      subtitle={`${controls.filter((c) => c.enabled).length} of ${controls.length} enabled · ${controls.reduce((s, c) => s + c.hits30d, 0)} triggers / 30d`}
      footer={<div className="pm-note w-100 mb-0"><i className="bi bi-lock me-1" />Overrides of Super-admin-only blocks need a second Tier-0 key. Every toggle is audited.</div>}>
      {controls.map((c) => (
        <div key={c.id} className="pm-alert-row mb-2" style={{ border: "1px solid var(--pm-border)", borderLeftColor: c.enabled ? "#f04438" : "#98a2b3" }}>
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="mono" style={{ fontWeight: 700, fontSize: ".74rem" }}>{c.id}</span>
              <span style={{ fontWeight: 700, fontSize: ".82rem" }}>{c.name}</span>
              <Badge tone={c.override === "Super admin only" ? "red" : "blue"}>{c.override}</Badge>
              {!c.enabled && <Badge tone="grey">Disabled</Badge>}
            </div>
            <div className="pm-td-sub">{c.description}</div>
            <div className="pm-td-sub mono">{c.params} · {num(c.hits30d)} hits / 30d · mod {c.lastModified}</div>
          </div>
          <div className="d-flex flex-column gap-1 align-items-end">
            <div className="form-check form-switch mb-0">
              <input className="form-check-input" type="checkbox" checked={c.enabled} onChange={() => onToggle(c)} />
            </div>
            <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".66rem" }} onClick={() => onOpen(c)}>Detail</button>
          </div>
        </div>
      ))}
    </Drawer>
  );
}

/* ================================================================
   7. Fraud control detail modal
   ================================================================ */
export function FraudControlDetailModal({
  control, onClose, onParam,
}: { control: FraudControl | null; onClose: () => void; onParam: (c: FraudControl) => void }) {
  if (!control) return null;
  const examples = [
    { u: "PAY-89012", t: "Aug 22 · 14:32", a: kes(control.hits30d > 50 ? 50_000 : 120_000), out: "auto-blocked" },
    { u: "PAY-45123", t: "Aug 22 · 11:15", a: kes(200_000), out: "released after verification" },
    { u: "PAY-22334", t: "Aug 21 · 23:45", a: kes(80_000), out: "released (user confirmed)" },
  ];
  return (
    <Modal open onClose={onClose} tone="red" icon="bi-shield-fill-exclamation" size="md"
      title={`${control.id} — ${control.name}`} subtitle={`${num(control.hits30d)} triggers in 30 days`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Trigger</span><span className="v mono">{control.trigger}</span></div>
          <div className="pm-kv"><span className="k">Auto-action</span><span className="v"><Badge tone={control.autoAction.startsWith("Block") || control.autoAction.startsWith("Frozen") ? "red" : "amber"} dot>{control.autoAction}</Badge></span></div>
          <div className="pm-kv"><span className="k">Override</span><span className="v">{control.override}</span></div>
          <div className="pm-kv"><span className="k">Parameter</span><span className="v mono">{control.params}</span></div>
        </div>
        <div className="pm-eyebrow mb-2">Recent triggers</div>
        {examples.map((e) => (
          <div className="pm-kv" key={e.u + e.t}>
            <span className="k mono" style={{ fontSize: ".74rem" }}>{e.u} · {e.t}</span>
            <span className="v mono" style={{ fontSize: ".74rem" }}>{e.a} — {e.out}</span>
          </div>
        ))}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={onClose}>Close</button>
        <button className="btn btn-primary btn-sm" onClick={() => onParam(control)}>
          <i className="bi bi-sliders me-1" />Edit parameter
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   8. Rule parameter modal
   ================================================================ */
export function RuleParamModal({
  control, onClose, onDone,
}: { control: FraudControl | null; onClose: () => void; onDone: (c: FraudControl, params: string) => void }) {
  const { push } = useToast();
  const [params, setParams] = useState(control?.params ?? "");
  const [code, setCode] = useState("");
  if (!control) return null;
  return (
    <Modal open onClose={onClose} tone="red" icon="bi-sliders" size="sm"
      title={`Parameter — ${control.name}`} subtitle={`${control.id} · ${control.override}`}>
      <div className="pm-modal-body">
        <label className="form-label">Parameter expression</label>
        <input className="form-control mono mb-3" value={params} onChange={(e) => setParams(e.target.value)} />
        <div className="pm-note mb-3">
          <i className="bi bi-info-circle me-1" />
          Tuning thresholds trades fraud catch-rate against false positives. Current FP rate is 28% — target &lt; 25%.
        </div>
        <TwoFactorField value={code} onChange={setCode} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={code !== CODE || params.trim().length < 3 || params === control.params} onClick={() => {
          onDone(control, params);
          push({ kind: "success", title: `${control.id} retuned`, body: params });
          onClose();
        }}>
          <i className="bi bi-check2 me-1" />Save parameter
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   9. High-value queue drawer
   ================================================================ */
export function HighValueQueueDrawer({
  open, onClose, queue, onOpen,
}: { open: boolean; onClose: () => void; queue: HighValueItem[]; onOpen: (q: HighValueItem) => void }) {
  const [tab, setTab] = useState("All");
  const tabs = ["All", "Awaiting OTP", "VP verification", "Auto-review", "Escalated"];
  const list = queue.filter((q) => tab === "All" || q.status === tab);
  return (
    <Drawer open={open} onClose={onClose} wide icon="bi-hourglass-split" tone="amber" title="High-value withdrawal queue"
      subtitle={`${queue.length} items > KES 100K · SLA 30 min standard / 120 min RTGS`}
      footer={<button className="btn btn-outline-secondary btn-sm w-100" onClick={() => csvDownload("high-value-queue.csv", queue as unknown as Record<string, unknown>[])}>
        <i className="bi bi-download me-1" />Export queue
      </button>}>
      <div className="pm-tabs mb-3" style={{ borderBottom: 0 }}>
        {tabs.map((t) => (
          <button key={t} className={`pm-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t}<span className="cnt">{t === "All" ? queue.length : queue.filter((q) => q.status === t).length}</span>
          </button>
        ))}
      </div>
      {list.length === 0 ? <EmptyState icon="bi-check2-circle" title="Queue clear" body="No withdrawals waiting on this filter." /> : list.map((q) => {
        const overdue = q.ageMin > q.slaMin;
        return (
          <button key={q.id} className="pm-alert-row w-100 text-start mb-2" style={{ border: "1px solid var(--pm-border)", borderLeftColor: overdue ? "#f04438" : q.status === "Escalated" ? "#b54708" : "#f79009" }} onClick={() => onOpen(q)}>
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <span className="mono" style={{ fontWeight: 700, fontSize: ".74rem" }}>{q.id}</span>
                <Badge tone={limitTone(q.status)} dot>{q.status}</Badge>
                {overdue && <Badge tone="red"><i className="bi bi-alarm me-1" />SLA</Badge>}
              </div>
              <div style={{ fontSize: ".8rem", fontWeight: 700 }}>{q.name} <span className="pm-td-sub mono">{q.userId}</span></div>
              <div className="pm-td-sub">{q.channel} · {q.device} · {q.ip}</div>
              <div className="pm-td-sub mono">{q.time} · {q.ageMin}m age / {q.slaMin}m SLA · {q.assigned}</div>
            </div>
            <div className="text-end">
              <div className="pm-num" style={{ fontWeight: 800 }}>{kes(q.amount, { compact: true })}</div>
              <div className="pm-td-sub">{q.flags.length} flag{q.flags.length > 1 ? "s" : ""}</div>
            </div>
          </button>
        );
      })}
    </Drawer>
  );
}

/* ================================================================
   10. Review wizard (4 steps)
   ================================================================ */
export function ReviewWizard({
  item, overrides, onClose, onDone,
}: {
  item: HighValueItem | null;
  overrides: UserOverride[];
  onClose: () => void;
  onDone: (q: HighValueItem, decision: "Approve" | "Block", note: string) => void;
}) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [note, setNote] = useState("");
  const [decision, setDecision] = useState<"Approve" | "Block" | "">("");
  const [code, setCode] = useState("");
  if (!item) return null;
  const ovr = overrides.find((o) => o.userId === item.userId);
  const steps = [
    { label: "Case", icon: "bi-folder2-open" },
    { label: "Checks", icon: "bi-list-check" },
    { label: "Decision", icon: "bi-gavel" },
    { label: "2FA", icon: "bi-shield-lock" },
  ];
  const close = () => { setStep(0); setCode(""); setDecision(""); setNote(""); onClose(); };
  const checks = [
    { n: "Identity & KYC", ok: true, d: "ID verified · selfie match 98.4%" },
    { n: "Device fingerprint", ok: !item.flags.includes("New device"), d: item.flags.includes("New device") ? "Newly registered device — OTP sent" : "Known device 34d" },
    { n: "Geo / network", ok: !item.flags.some((f) => f.startsWith("Geo") || f.includes("VPN")), d: item.ip },
    { n: "Velocity & amount", ok: !item.flags.includes("Velocity spike") && !item.flags.includes("Amount anomaly"), d: `${kes(item.amount)} vs 30d avg` },
    { n: "Override profile", ok: !!ovr && ovr.status !== "Blocked", d: ovr ? `${ovr.tier} · daily ${ovr.customDaily === "Unlimited" ? "unlimited" : kes(Number(ovr.customDaily))}` : "Standard tier" },
    { n: "Balance & reserve", ok: true, d: "Pool floors intact (15.2%)" },
  ];
  return (
    <Modal open onClose={close} tone="amber" icon="bi-gavel" size="lg"
      title={`${item.id} — high-value review`} subtitle={`${item.name} · ${kes(item.amount)} · ${item.channel}`}>
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%`, background: "#b54708" }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div className="pm-card pm-card-pad mb-3">
            <div className="pm-kv"><span className="k">User</span><span className="v mono">{item.userId} · {item.name}</span></div>
            <div className="pm-kv"><span className="k">Amount</span><span className="v mono">{kes(item.amount)}</span></div>
            <div className="pm-kv"><span className="k">Channel / device</span><span className="v">{item.channel} · {item.device}</span></div>
            <div className="pm-kv"><span className="k">IP / location</span><span className="v mono">{item.ip}</span></div>
            <div className="pm-kv"><span className="k">Flags</span><span className="v">{item.flags.map((f) => <Badge key={f} tone="amber">{f}</Badge>)}</span></div>
            <div className="pm-kv"><span className="k">SLA</span><span className="v mono">{item.ageMin}m of {item.slaMin}m {item.ageMin > item.slaMin ? "· OVERDUE" : ""}</span></div>
          </div>
        )}
        {step === 1 && (
          <>
            {checks.map((c) => (
              <div className="pm-alert-row mb-2" key={c.n} style={{ border: "1px solid var(--pm-border)", borderLeftColor: c.ok ? "#12b76a" : "#f79009" }}>
                <i className={`bi ${c.ok ? "bi-check2-circle" : "bi-exclamation-triangle"}`} style={{ color: c.ok ? "#12b76a" : "#f79009" }} />
                <div className="flex-grow-1">
                  <div style={{ fontWeight: 700, fontSize: ".8rem" }}>{c.n}</div>
                  <div className="pm-td-sub mono">{c.d}</div>
                </div>
                <Badge tone={c.ok ? "green" : "amber"}>{c.ok ? "Pass" : "Flagged"}</Badge>
              </div>
            ))}
          </>
        )}
        {step === 2 && (
          <>
            <label className="form-label">Decision</label>
            <div className="d-flex flex-column gap-2 mb-3">
              <button className={`pm-opt ${decision === "Approve" ? "active" : ""}`} onClick={() => setDecision("Approve")}>
                <span className="r" /><i className="bi bi-check2-circle" style={{ color: "#0b8f52" }} />
                <span><span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>Approve & release</span>
                  <span className="pm-td-sub">Payout executes immediately · user notified</span></span>
              </button>
              <button className={`pm-opt ${decision === "Block" ? "active" : ""}`} onClick={() => setDecision("Block")}>
                <span className="r" /><i className="bi bi-slash-circle" style={{ color: "#d92d20" }} />
                <span><span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>Block & hold</span>
                  <span className="pm-td-sub">Funds stay in wallet · case logged to blocked register</span></span>
              </button>
            </div>
            <label className="form-label">Reviewer note <span style={{ color: "#f04438" }}>*</span></label>
            <textarea className="form-control" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. VP verified by phone · merchant invoice #4471 seen" />
          </>
        )}
        {step === 3 && (
          <>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-kv"><span className="k">Decision</span><span className="v"><Badge tone={decision === "Approve" ? "green" : "red"} dot>{decision}</Badge></span></div>
              <div className="pm-kv"><span className="k">Note</span><span className="v">{note || "—"}</span></div>
              <div className="pm-kv"><span className="k">Reviewer</span><span className="v">Joseph Mwangi · Tier 0 Super Admin</span></div>
              <div className="pm-kv"><span className="k">Co-signer</span><span className="v">{kes(item.amount) === kes(2_400_000) ? "Board chair (pending)" : "Auto-logged to audit"}</span></div>
            </div>
            <TwoFactorField value={code} onChange={setCode} />
          </>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}>Back</button>}
        {step < 3 && <button className="btn btn-primary btn-sm" disabled={step === 2 && (decision === "" || note.trim().length < 6)} onClick={() => setStep(step + 1)}>Next</button>}
        {step === 3 && (
          <button className={`btn btn-sm ${decision === "Block" ? "btn-danger" : "btn-primary"}`} disabled={code !== CODE} onClick={() => {
            onDone(item, decision === "Approve" ? "Approve" : "Block", note);
            push(decision === "Approve"
              ? { kind: "success", title: `${item.id} released`, body: `${kes(item.amount, { compact: true })} paid out · audit logged.` }
              : { kind: "warn", title: `${item.id} blocked`, body: "Funds held · case in blocked register." });
            close();
          }}>
            <i className="bi bi-check2 me-1" />Confirm {decision === "Block" ? "block" : "release"}
          </button>
        )}
      </div>
    </Modal>
  );
}

/* ================================================================
   11. User overrides drawer
   ================================================================ */
export function UserOverridesDrawer({
  open, onClose, overrides, onOpen, onCreate,
}: {
  open: boolean;
  onClose: () => void;
  overrides: UserOverride[];
  onOpen: (o: UserOverride) => void;
  onCreate: () => void;
}) {
  const [q, setQ] = useState("");
  const list = overrides.filter((o) => (o.userId + o.name + o.tier + o.reason).toLowerCase().includes(q.toLowerCase()));
  return (
    <Drawer open={open} onClose={onClose} wide icon="bi-person-gear" tone="violet" title="User-specific limit overrides"
      subtitle={`${overrides.length} profiles · ${overrides.filter((o) => o.status === "Blocked").length} blocked · ${overrides.filter((o) => o.status === "Restricted").length} restricted`}
      footer={<button className="btn btn-primary btn-sm w-100" onClick={onCreate}><i className="bi bi-plus-lg me-1" />New override</button>}>
      <div className="pm-search mb-3" style={{ background: "#fff" }}>
        <i className="bi bi-search" />
        <input placeholder="User, tier, reason…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {list.length === 0 ? <EmptyState icon="bi-search" title="No overrides match" body="Try another search." /> : list.map((o) => (
        <button key={o.id} className="pm-alert-row w-100 text-start mb-2" style={{ border: "1px solid var(--pm-border)", borderLeftColor: o.status === "Active" ? "#12b76a" : o.status === "Restricted" ? "#f79009" : "#f04438" }} onClick={() => onOpen(o)}>
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="mono" style={{ fontWeight: 700, fontSize: ".74rem" }}>{o.userId}</span>
              <span style={{ fontWeight: 700, fontSize: ".8rem" }}>{o.name}</span>
              <Badge tone={limitTone(o.status)} dot>{o.status}</Badge>
            </div>
            <div className="pm-td-sub">{o.tier} · {o.reason}</div>
            <div className="pm-td-sub mono">by {o.setBy} · expires {o.expires}</div>
          </div>
          <div className="text-end">
            <div className="pm-num" style={{ fontWeight: 700, fontSize: ".74rem" }}>
              {o.customDaily === "Unlimited" ? "∞ daily" : o.customDaily === 0 ? "0 daily" : `${kes(o.customDaily, { compact: true })}/d`}
            </div>
            <div className="pm-td-sub mono">{o.customMonthly === "Unlimited" ? "∞ monthly" : `${kes(Number(o.customMonthly), { compact: true })}/m`}</div>
          </div>
        </button>
      ))}
    </Drawer>
  );
}

/* ================================================================
   12. Override detail modal
   ================================================================ */
export function OverrideDetailModal({
  override, onClose, onEdit,
}: { override: UserOverride | null; onClose: () => void; onEdit: (o: UserOverride) => void }) {
  if (!override) return null;
  return (
    <Modal open onClose={onClose} tone="violet" icon="bi-person-gear" size="md"
      title={`${override.userId} — ${override.name}`} subtitle={`${override.tier} · ${override.id}`}>
      <div className="pm-modal-body">
        <div className="row g-2 mb-3">
          {[
            { l: "Standard daily", v: fmtVal(override.standardDaily) },
            { l: "Custom daily", v: override.customDaily === "Unlimited" ? "Unlimited" : override.customDaily === 0 ? "Blocked" : kes(override.customDaily, { compact: true }) },
            { l: "Standard monthly", v: fmtVal(override.standardMonthly) },
            { l: "Custom monthly", v: override.customMonthly === "Unlimited" ? "Unlimited" : override.customMonthly === 0 ? "Blocked" : kes(Number(override.customMonthly), { compact: true }) },
          ].map((x) => (
            <div className="col-6" key={x.l}>
              <div className="pm-stat"><div className="pm-stat-label">{x.l}</div>
                <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: ".9rem" }}>{x.v}</div></div>
            </div>
          ))}
        </div>
        <div className="pm-card pm-card-pad">
          <div className="pm-kv"><span className="k">Reason</span><span className="v">{override.reason}</span></div>
          <div className="pm-kv"><span className="k">Set by</span><span className="v">{override.setBy}</span></div>
          <div className="pm-kv"><span className="k">Expires</span><span className="v mono">{override.expires}</span></div>
          <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone={limitTone(override.status)} dot>{override.status}</Badge></span></div>
          <div className="pm-kv"><span className="k">Change regime</span><span className="v">Super Admin + 2FA · Finance Manager co-signs reductions</span></div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={onClose}>Close</button>
        <button className="btn btn-primary btn-sm" onClick={() => onEdit(override)}><i className="bi bi-pencil me-1" />Edit limits</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   13. Override edit wizard
   ================================================================ */
export function OverrideWizard({
  open, target, onClose, onDone,
}: {
  open: boolean;
  target: UserOverride | null;
  onClose: () => void;
  onDone: (o: UserOverride) => void;
}) {
  const { push } = useToast();
  const editing = !!target;
  const [step, setStep] = useState(0);
  const [userId, setUserId] = useState(target?.userId ?? "");
  const [name, setName] = useState(target?.name ?? "");
  const [tier, setTier] = useState(target?.tier ?? "Standard");
  const [daily, setDaily] = useState<number | "Unlimited">(target ? (target.customDaily === "Unlimited" ? "Unlimited" : target.customDaily) : 500_000);
  const [monthly, setMonthly] = useState<number | "Unlimited">(target ? (target.customMonthly === "Unlimited" ? "Unlimited" : Number(target.customMonthly)) : 5_000_000);
  const [reason, setReason] = useState(target?.reason ?? "");
  const [expires, setExpires] = useState(target?.expires ?? "Never");
  const [code, setCode] = useState("");
  const steps = [
    { label: "User", icon: "bi-person-badge" },
    { label: "Limits", icon: "bi-sliders" },
    { label: "Justify", icon: "bi-journal-text" },
    { label: "2FA", icon: "bi-shield-lock" },
  ];
  const close = () => { setStep(0); setCode(""); onClose(); };
  if (!open) return null;
  return (
    <Modal open onClose={close} tone="violet" icon="bi-person-gear" size="md"
      title={editing ? `Edit override — ${target?.userId}` : "New user override"}
      subtitle="Per-user limits override the global schedule · Super Admin + 2FA">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%`, background: "#7a5af8" }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <>
            <div className="row g-2 mb-2">
              <div className="col-6">
                <label className="form-label">User ID</label>
                <input className="form-control mono" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="PAY-XXXXX" disabled={editing} />
              </div>
              <div className="col-6">
                <label className="form-label">Tier</label>
                <select className="form-select" value={tier} onChange={(e) => setTier(e.target.value)}>
                  {["Standard", "Standard (new)", "VIP Platinum", "Business", "Business Premium", "Agent"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <label className="form-label">Display name</label>
            <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Amina Hassan" />
          </>
        )}
        {step === 1 && (
          <>
            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label">Daily limit (KES)</label>
                {daily === "Unlimited" ? (
                  <input className="form-control mono" value="Unlimited" disabled />
                ) : (
                  <input type="number" className="form-control mono" value={daily} step={50_000} onChange={(e) => setDaily(Number(e.target.value))} />
                )}
                <div className="d-flex gap-1 mt-1">
                  <button className="pm-chip" onClick={() => setDaily("Unlimited")}>Unlimited</button>
                  {daily === "Unlimited" && <button className="pm-chip" onClick={() => setDaily(500_000)}>Set value</button>}
                  <button className="pm-chip" onClick={() => setDaily(0)}>Block (0)</button>
                </div>
              </div>
              <div className="col-6">
                <label className="form-label">Monthly limit (KES)</label>
                {monthly === "Unlimited" ? (
                  <input className="form-control mono" value="Unlimited" disabled />
                ) : (
                  <input type="number" className="form-control mono" value={monthly} step={500_000} onChange={(e) => setMonthly(Number(e.target.value))} />
                )}
                <div className="d-flex gap-1 mt-1">
                  <button className="pm-chip" onClick={() => setMonthly("Unlimited")}>Unlimited</button>
                  {monthly === "Unlimited" && <button className="pm-chip" onClick={() => setMonthly(5_000_000)}>Set value</button>}
                  <button className="pm-chip" onClick={() => setMonthly(0)}>Block (0)</button>
                </div>
              </div>
            </div>
            <div className="pm-note">
              <i className="bi bi-info-circle me-1" />
              Standard baseline is {kes(500_000, { compact: true })}/day and {kes(5_000_000, { compact: true })}/month. Zero blocks all withdrawals pending clearance.
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <label className="form-label">Reason <span style={{ color: "#f04438" }}>*</span></label>
            <textarea className="form-control mb-3" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. VIP Platinum standing · business payroll cycle" />
            <label className="form-label">Expires</label>
            <select className="form-select" value={expires} onChange={(e) => setExpires(e.target.value)}>
              {["Never", "Sep 2026", "Oct 2026", "Nov 2026", "Dec 2026", "Until cleared", "Until court lift"].map((x) => <option key={x}>{x}</option>)}
            </select>
          </>
        )}
        {step === 3 && (
          <>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-kv"><span className="k">User</span><span className="v mono">{userId || "—"} · {name || "—"}</span></div>
              <div className="pm-kv"><span className="k">Daily / monthly</span><span className="v mono">{daily === "Unlimited" ? "∞" : kes(daily, { compact: true })} / {monthly === "Unlimited" ? "∞" : kes(monthly, { compact: true })}</span></div>
              <div className="pm-kv"><span className="k">Reason</span><span className="v">{reason || "—"}</span></div>
              <div className="pm-kv"><span className="k">Expires</span><span className="v mono">{expires}</span></div>
            </div>
            <TwoFactorField value={code} onChange={setCode} />
          </>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}>Back</button>}
        {step < 3 && <button className="btn btn-primary btn-sm" disabled={(step === 0 && (userId.trim().length < 5 || name.trim().length < 3)) || (step === 2 && reason.trim().length < 6)} onClick={() => setStep(step + 1)}>Next</button>}
        {step === 3 && (
          <button className="btn btn-primary btn-sm" disabled={code !== CODE} onClick={() => {
            onDone({
              id: target?.id ?? `OVR-${16 + Math.floor(Math.random() * 80)}`,
              userId: userId || "PAY-00000", name: name || "Unnamed", tier,
              standardDaily: 500_000, customDaily: daily, standardMonthly: 5_000_000, customMonthly: monthly,
              reason: reason || "Manual override", setBy: "Joseph Mwangi", expires,
              status: daily === 0 ? "Blocked" : (daily !== "Unlimited" && daily < 500_000) || (monthly !== "Unlimited" && monthly < 5_000_000) ? "Restricted" : "Active",
            });
            push({ kind: "success", title: editing ? "Override updated" : "Override created", body: `${userId} · ${daily === "Unlimited" ? "unlimited" : kes(daily, { compact: true })}/day · audit logged.` });
            close();
          }}>
            <i className="bi bi-check2 me-1" />{editing ? "Save override" : "Create override"}
          </button>
        )}
      </div>
    </Modal>
  );
}

/* ================================================================
   14. Blocked withdrawals log drawer
   ================================================================ */
export function BlockedLogDrawer({
  open, onClose, rows, onOpen,
}: { open: boolean; onClose: () => void; rows: BlockedRow[]; onOpen: (r: BlockedRow) => void }) {
  const [chip, setChip] = useState("All");
  const chips = ["All", "Pending review", "Released", "Under review", "Account frozen"];
  const list = rows.filter((r) => chip === "All" || r.status === chip);
  return (
    <Drawer open={open} onClose={onClose} wide icon="bi-slash-circle" tone="red" title="Blocked withdrawals log"
      subtitle={`${rows.length} events · auto-action + admin outcome per row`}
      footer={<button className="btn btn-outline-secondary btn-sm w-100" onClick={() => csvDownload("blocked-withdrawals.csv", rows as unknown as Record<string, unknown>[])}>
        <i className="bi bi-download me-1" />Export log
      </button>}>
      <div className="d-flex gap-1 flex-wrap mb-3">
        {chips.map((c) => (
          <button key={c} className={`pm-chip ${chip === c ? "active" : ""}`} onClick={() => setChip(c)}>
            {c} <span className="pm-td-sub">({c === "All" ? rows.length : rows.filter((r) => r.status === c).length})</span>
          </button>
        ))}
      </div>
      {list.length === 0 ? <EmptyState icon="bi-check2-circle" title="Nothing here" body="No blocked withdrawals under this filter." /> : list.map((r) => (
        <button key={r.id} className="pm-alert-row w-100 text-start mb-2" style={{ border: "1px solid var(--pm-border)", borderLeftColor: r.status === "Released" ? "#12b76a" : r.status === "Pending review" ? "#f79009" : "#f04438" }} onClick={() => onOpen(r)}>
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="mono" style={{ fontWeight: 700, fontSize: ".74rem" }}>{r.id}</span>
              <span className="mono pm-td-sub">{r.userId}</span>
              <Badge tone={limitTone(r.status)} dot>{r.status}</Badge>
            </div>
            <div className="pm-td-sub">{r.date} {r.time} · {r.reason} · auto: {r.autoAction}</div>
            <div className="pm-td-sub">{r.device} · {r.ip}</div>
          </div>
          <div className="text-end">
            <div className="pm-num" style={{ fontWeight: 700, fontSize: ".76rem" }}>{r.amount === 0 ? "—" : kes(r.amount, { compact: true })}</div>
            <div className="pm-td-sub">{r.adminAction}</div>
          </div>
        </button>
      ))}
    </Drawer>
  );
}

/* ================================================================
   15. Blocked withdrawal detail modal + decision
   ================================================================ */
export function BlockedDetailModal({
  row, onClose, onDecision,
}: { row: BlockedRow | null; onClose: () => void; onDecision: (r: BlockedRow, d: "Release" | "Freeze" | "Escalate") => void }) {
  if (!row) return null;
  return (
    <Modal open onClose={onClose} tone={row.status === "Released" ? "green" : "red"} icon="bi-slash-circle" size="md"
      title={`${row.id} — ${row.reason}`} subtitle={`${row.userId} · ${row.date} ${row.time}`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Amount</span><span className="v mono">{row.amount === 0 ? "—" : kes(row.amount)}</span></div>
          <div className="pm-kv"><span className="k">Device</span><span className="v mono">{row.device}</span></div>
          <div className="pm-kv"><span className="k">IP / network</span><span className="v mono">{row.ip}</span></div>
          <div className="pm-kv"><span className="k">Auto-action</span><span className="v"><Badge tone={row.autoAction === "Frozen" ? "red" : row.autoAction === "Blocked" ? "red" : "amber"} dot>{row.autoAction}</Badge></span></div>
          <div className="pm-kv"><span className="k">Admin outcome</span><span className="v">{row.adminAction}</span></div>
        </div>
        <div className="pm-timeline">
          {[
            { t: "Control fired", d: `${row.reason} · rule engine`, s: "done" },
            { t: "Auto-action", d: row.autoAction, s: "done" },
            { t: "Admin review", d: row.adminAction, s: row.status === "Pending review" ? "" : "done" },
          ].map((x) => (
            <div key={x.t} className={`pm-tl-item ${x.s}`}><div style={{ fontWeight: 700, fontSize: ".8rem" }}>{x.t}</div><div className="pm-td-sub">{x.d}</div></div>
          ))}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => csvDownload(`${row.id}.csv`, [row as unknown as Record<string, unknown>])}>
          <i className="bi bi-download me-1" />Export
        </button>
        {row.status !== "Released" ? (
          <>
            <button className="btn btn-outline-danger btn-sm" onClick={() => onDecision(row, "Freeze")}><i className="bi bi-snow me-1" />Freeze</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => onDecision(row, "Escalate")}><i className="bi bi-arrow-up-right me-1" />Escalate</button>
            <button className="btn btn-primary btn-sm" onClick={() => onDecision(row, "Release")}><i className="bi bi-unlock me-1" />Release</button>
          </>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
        )}
      </div>
    </Modal>
  );
}

export function BlockedDecisionModal({
  row, decision, onClose, onDone,
}: {
  row: BlockedRow | null;
  decision: "Release" | "Freeze" | "Escalate" | null;
  onClose: () => void;
  onDone: (r: BlockedRow, d: "Release" | "Freeze" | "Escalate", note: string) => void;
}) {
  const { push } = useToast();
  const [note, setNote] = useState("");
  const [code, setCode] = useState("");
  if (!row || !decision) return null;
  const isRelease = decision === "Release";
  return (
    <Modal open onClose={onClose} tone={isRelease ? "green" : "red"} icon={isRelease ? "bi-unlock" : decision === "Freeze" ? "bi-snow" : "bi-arrow-up-right"} size="sm"
      title={`${decision} — ${row.id}`} subtitle={`${row.userId} · ${row.reason}`}>
      <div className="pm-modal-body">
        <div className={`pm-alert-row ${isRelease ? "warn" : "crit"} mb-3`}>
          <i className={`bi ${isRelease ? "bi-question-circle-fill" : "bi-exclamation-triangle-fill"}`} style={{ color: isRelease ? "#b54708" : "#f04438" }} />
          <div style={{ fontSize: ".78rem" }}>
            {decision === "Release" && "Releasing pays the original request through. Only release after identity or VP verification — this action is irreversible and board-visible."}
            {decision === "Freeze" && "Freezing locks the wallet and all channels. Requires a fraud case reference before unfreezing."}
            {decision === "Escalate" && "Escalation opens a fraud case and pages the on-call VP. The withdrawal stays blocked meanwhile."}
          </div>
        </div>
        <label className="form-label">Note <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control mb-3" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. VP verified by phone · travel confirmed" />
        <TwoFactorField value={code} onChange={setCode} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className={`btn btn-sm ${isRelease ? "btn-primary" : "btn-danger"}`} disabled={code !== CODE || note.trim().length < 6} onClick={() => {
          onDone(row, decision, note);
          push({ kind: isRelease ? "success" : "warn", title: `${row.id} — ${decision}d`, body: note });
          onClose();
        }}>
          <i className="bi bi-check2 me-1" />Confirm {decision.toLowerCase()}
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   16. Analytics modal
   ================================================================ */
export function AnalyticsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  const channels = [
    { n: "M-Pesa", v: 68, c: "#12b76a" },
    { n: "Bank", v: 20, c: "#175cd3" },
    { n: "ATM", v: 12, c: "#f79009" },
  ];
  return (
    <Modal open onClose={onClose} tone="green" icon="bi-graph-up-arrow" size="lg"
      title="Withdrawal analytics" subtitle="Today · this week · this month vs last month">
      <div className="pm-modal-body">
        <div className="pm-card pm-table-wrap mb-3">
          <table className="pm-table">
            <thead><tr><th>Metric</th><th>Today</th><th>Week</th><th>Month</th><th>vs last month</th></tr></thead>
            <tbody>
              {ANALYTICS.map((a) => (
                <tr key={a.metric}>
                  <td className="pm-td-strong">{a.metric}</td>
                  <td className="pm-num">{a.today}</td>
                  <td className="pm-num">{a.week}</td>
                  <td className="pm-num">{a.month}</td>
                  <td><Badge tone={a.trend === "up" ? "green" : a.trend === "down" ? "blue" : "grey"}>{a.vsLastMonth}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pm-card pm-card-pad">
          <div className="pm-eyebrow mb-2">Channel mix (today)</div>
          {channels.map((c) => (
            <div key={c.n} className="mb-2">
              <div className="d-flex justify-content-between mb-1">
                <span style={{ fontSize: ".78rem", fontWeight: 600 }}>{c.n}</span>
                <span className="pm-num" style={{ fontSize: ".74rem" }}>{c.v}%</span>
              </div>
              <Meter value={c.v} tone={c.c} width={999} />
            </div>
          ))}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => csvDownload("withdrawal-analytics.csv", ANALYTICS as unknown as Record<string, unknown>[])}>
          <i className="bi bi-download me-1" />Export analytics
        </button>
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   17. Audit drawer
   ================================================================ */
export function AuditDrawer({ open, onClose, audit }: { open: boolean; onClose: () => void; audit: AuditRow[] }) {
  return (
    <Drawer open={open} onClose={onClose} wide icon="bi-journal-check" tone="blue" title="Limit change audit"
      subtitle={`${audit.length} entries · who changed what, why and who approved`}
      footer={<button className="btn btn-outline-secondary btn-sm w-100" onClick={() => csvDownload("limit-audit.csv", audit as unknown as Record<string, unknown>[])}>
        <i className="bi bi-download me-1" />Export audit
      </button>}>
      {audit.map((a) => (
        <div key={a.id} className="pm-alert-row mb-2" style={{ border: "1px solid var(--pm-border)", borderLeftColor: a.to === a.from ? "#98a2b3" : "#175cd3" }}>
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="mono" style={{ fontWeight: 700, fontSize: ".74rem" }}>{a.id}</span>
              <span style={{ fontWeight: 700, fontSize: ".8rem" }}>{a.change}</span>
              <span className="mono pm-td-sub">{a.from} → {a.to}</span>
            </div>
            <div className="pm-td-sub">{a.date} · {a.admin} · {a.reason}</div>
            <div className="pm-td-sub mono">{a.approvedBy === "—" ? "self-approved (Tier 0)" : `approved by ${a.approvedBy}`}</div>
          </div>
        </div>
      ))}
    </Drawer>
  );
}

/* ================================================================
   18. Export modal
   ================================================================ */
export function WithdrawalExportModal({
  open, onClose, queue, blocked, overrides,
}: { open: boolean; onClose: () => void; queue: HighValueItem[]; blocked: BlockedRow[]; overrides: UserOverride[] }) {
  const { push } = useToast();
  const [dataset, setDataset] = useState("queue");
  const [fmt, setFmt] = useState("csv");
  if (!open) return null;
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-download" size="sm"
      title="Export withdrawal controls data" subtitle="Watermarked · written to the audit log">
      <div className="pm-modal-body">
        <div className="d-flex flex-column gap-2 mb-3">
          {[
            ["queue", `High-value queue (${queue.length})`],
            ["blocked", `Blocked log (${blocked.length})`],
            ["overrides", `User overrides (${overrides.length})`],
            ["audit", `Audit trail (${AUDIT.length})`],
            ["all", "Full pack (4 files)"],
          ].map(([id, l]) => (
            <button key={id} className={`pm-opt ${dataset === id ? "active" : ""}`} onClick={() => setDataset(id)}>
              <span className="r" /><span style={{ fontWeight: 700, fontSize: ".85rem" }}>{l}</span>
            </button>
          ))}
        </div>
        <div className="d-flex gap-1">
          {["csv", "json"].map((f) => <button key={f} className={`pm-chip ${fmt === f ? "active" : ""}`} onClick={() => setFmt(f)}>{f.toUpperCase()}</button>)}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => {
          const dl = (name: string, data: unknown[]) => (fmt === "json" ? jsonDownload(`${name}.json`, data) : csvDownload(`${name}.csv`, data as unknown as Record<string, unknown>[]));
          if (dataset === "queue" || dataset === "all") dl("high-value-queue", queue);
          if (dataset === "blocked" || dataset === "all") dl("blocked-withdrawals", blocked);
          if (dataset === "overrides" || dataset === "all") dl("user-overrides", overrides);
          if (dataset === "audit" || dataset === "all") dl("limit-audit", AUDIT);
          push({ kind: "success", title: "Export ready" });
          onClose();
        }}>
          <i className="bi bi-download me-1" />Download
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   19. Permissions matrix modal
   ================================================================ */
export function PermissionsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  const rows = [
    { a: "Change global limits", t0: "Yes + 2FA", t1: "Propose only", t2: "No", note: "Finance co-signs changes > 100%" },
    { a: "Approve high-value queue", t0: "Yes", t1: "Yes", t2: "Yes (≤ KES 250K)", note: "> KES 2M needs VP" },
    { a: "Override Super-admin blocks", t0: "Yes + dual key", t1: "No", t2: "No", note: "Dual-device, VPN, SIM swap" },
    { a: "Edit user overrides", t0: "Yes + 2FA", t1: "Reductions only", t2: "No", note: "All changes audited" },
    { a: "Toggle anti-fraud rules", t0: "Yes + 2FA", t1: "No", t2: "No", note: "Board notified on disable" },
    { a: "Release blocked funds", t0: "Yes", t1: "Yes + VP verify", t2: "No", note: "Irreversible · board-visible" },
  ];
  return (
    <Modal open onClose={onClose} tone="ink" icon="bi-person-lock" size="lg"
      title="Withdrawal control permissions" subtitle="Who can do what across the control plane">
      <div className="pm-modal-body">
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Action</th><th>Super Admin</th><th>Platform Admin</th><th>Support</th><th>Notes</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.a}>
                  <td className="pm-td-strong">{r.a}</td>
                  <td><Badge tone={r.t0.startsWith("Yes") ? "green" : "grey"}>{r.t0}</Badge></td>
                  <td><Badge tone={r.t1.startsWith("Yes") || r.t1 === "Reductions only" ? "amber" : "grey"}>{r.t1}</Badge></td>
                  <td><Badge tone={r.t2.startsWith("Yes") ? "amber" : "grey"}>{r.t2}</Badge></td>
                  <td className="pm-td-sub">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   20. Limit simulator modal
   ================================================================ */
export function SimulatorModal({
  open, onClose, limits, rules, controls,
}: { open: boolean; onClose: () => void; limits: GlobalLimit[]; rules: PoolRule[]; controls: FraudControl[] }) {
  const [amount, setAmount] = useState(180_000);
  const [tier, setTier] = useState("Standard");
  const [age, setAge] = useState(90);
  const [hour, setHour] = useState(14);
  const [geo, setGeo] = useState(30);
  const [last30, setLast30] = useState(40_000);
  if (!open) return null;
  const daily = tier === "VIP Platinum" ? 2_000_000 : tier === "Business Premium" ? 5_000_000 : tier === "Business" ? 3_000_000 : 500_000;
  const perTxn = limits.find((l) => l.id === "LIM-03")?.current ?? 150_000;
  const findings: { ok: boolean; rule: string; d: string }[] = [
    { ok: amount <= daily, rule: "Daily limit", d: `${kes(amount, { compact: true })} vs ${kes(daily, { compact: true })} (${tier})` },
    { ok: amount <= perTxn, rule: "Per-transaction max", d: `${kes(amount, { compact: true })} vs ${kes(perTxn, { compact: true })}` },
    { ok: !(rules[3].active && age < 7 && amount > 10_000), rule: "New account restriction", d: age < 7 ? `age ${age}d → cap KES 10K/day` : `age ${age}d — clear` },
    { ok: !(rules[4].active && amount > 100_000), rule: "High-value threshold", d: amount > 100_000 ? "> KES 100K → OTP + push + queue" : "below threshold" },
    { ok: !(controls[0].enabled && geo > 500), rule: "Geo-anomaly", d: `${geo}km from usual location` },
    { ok: !(controls[4].enabled && amount > last30 * 3), rule: "Amount anomaly", d: `${kes(amount, { compact: true })} vs 3× ${kes(last30, { compact: true })} avg` },
    { ok: !(controls[5].enabled && (hour >= 2 && hour <= 5)), rule: "Time anomaly", d: `${String(hour).padStart(2, "0")}:00 (rule ${controls[5].enabled ? "enabled" : "disabled"})` },
  ];
  const blocked = findings.some((f) => !f.ok && (f.rule === "Per-transaction max" || f.rule === "Daily limit"));
  const verify = findings.some((f) => !f.ok) && !blocked;
  return (
    <Modal open onClose={onClose} tone="violet" icon="bi-play-btn" size="lg"
      title="Withdrawal rule simulator" subtitle="Dry-run a withdrawal against every live rule — nothing executes">
      <div className="pm-modal-body">
        <div className="row g-2 mb-3">
          <div className="col-6 col-md-3">
            <label className="form-label">Amount (KES)</label>
            <input type="number" className="form-control form-control-sm mono" value={amount} step={10_000} onChange={(e) => setAmount(Number(e.target.value))} />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label">Tier</label>
            <select className="form-select form-select-sm" value={tier} onChange={(e) => setTier(e.target.value)}>
              {["Standard", "VIP Platinum", "Business", "Business Premium"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="col-4 col-md-2">
            <label className="form-label">Age (days)</label>
            <input type="number" className="form-control form-control-sm mono" value={age} onChange={(e) => setAge(Number(e.target.value))} />
          </div>
          <div className="col-4 col-md-2">
            <label className="form-label">Hour</label>
            <input type="number" className="form-control form-control-sm mono" min={0} max={23} value={hour} onChange={(e) => setHour(Number(e.target.value))} />
          </div>
          <div className="col-4 col-md-2">
            <label className="form-label">Geo Δ (km)</label>
            <input type="number" className="form-control form-control-sm mono" value={geo} step={100} onChange={(e) => setGeo(Number(e.target.value))} />
          </div>
        </div>
        <div className="row g-2 mb-3 align-items-center">
          <div className="col-12 col-md-8">
            <label className="form-label mb-1">User's 30-day average withdrawal: <b className="mono">{kes(last30)}</b></label>
            <input type="range" className="form-range" min={5_000} max={500_000} step={5_000} value={last30} onChange={(e) => setLast30(Number(e.target.value))} />
          </div>
          <div className="col-12 col-md-4">
            {blocked
              ? <Badge tone="red" dot>Outcome: BLOCKED at rail</Badge>
              : verify
                ? <Badge tone="amber" dot>Outcome: verification required</Badge>
                : <Badge tone="green" dot>Outcome: straight-through</Badge>}
          </div>
        </div>
        <div className="pm-card pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Rule</th><th>Evaluation</th><th>Result</th></tr></thead>
            <tbody>
              {findings.map((f) => (
                <tr key={f.rule}>
                  <td className="pm-td-strong">{f.rule}</td>
                  <td className="pm-td-sub mono">{f.d}</td>
                  <td><Badge tone={f.ok ? "green" : "amber"} dot>{f.ok ? "Pass" : "Triggers"}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => csvDownload("rule-simulation.csv", findings as unknown as Record<string, unknown>[])}>
          <i className="bi bi-download me-1" />Export simulation
        </button>
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ============================ 22. Withdrawal analytics modal ============================ */
export function WithdrawalAnalyticsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const stats = [
    { label: "Total withdrawals today", value: "KES 240M", color: "#12b76a" },
    { label: "Blocked transactions", value: "23", color: "#f04438" },
    { label: "High-value queue", value: "8", color: "#f79009" },
    { label: "Override active", value: "12", color: "#7a5af8" },
    { label: "Fraud blocks", value: "5", color: "#f04438" },
    { label: "Avg processing time", value: "1.8s", color: "#2e90fa" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-graph-up" tone="blue" title="Withdrawal analytics" subtitle="Control performance metrics">
      <div className="row g-2 mb-3">
        {stats.map((s) => (
          <div className="col-6" key={s.label}><div className="pm-stat" style={{ borderLeft: `3px solid ${s.color}` }}>
            <div className="pm-stat-label">{s.label}</div>
            <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1rem", color: s.color }}>{s.value}</div></div></div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 23. Rule comparison modal ============================ */
export function RuleCompareModal({ rules, onClose }: { rules: { id: string; name: string; threshold: number; action: string }[]; onClose: () => void }) {
  if (rules.length < 2) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-arrow-left-right" tone="blue" title="Compare rules" subtitle="Side-by-side comparison">
      <div className="pm-card pm-table-wrap">
        <table className="pm-table">
          <thead><tr><th>Field</th><th>{rules[0].name}</th><th>{rules[1].name}</th></tr></thead>
          <tbody>
            {["threshold", "action"].map((k) => (
              <tr key={k}><td className="pm-td-strong">{k}</td><td>{k === "threshold" ? kes(rules[0][k as keyof typeof rules[0]] as number) : rules[0][k as keyof typeof rules[0]]}</td><td>{k === "threshold" ? kes(rules[1][k as keyof typeof rules[0]] as number) : rules[1][k as keyof typeof rules[0]]}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </Drawer>
  );
}

/* ============================ 24. Withdrawal insights modal ============================ */
export function WithdrawalInsightsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const insights = [
    { icon: "bi-graph-up", title: "Withdrawal volume up", detail: "12% increase in daily volume vs last week", tone: "green" },
    { icon: "bi-exclamation-triangle", title: "High-value queue elevated", detail: "8 transactions pending review", tone: "amber" },
    { icon: "bi-check-circle", title: "Fraud rate stable", detail: "0.01% fraud rate, within target", tone: "green" },
    { icon: "bi-clock-history", title: "Processing time improved", detail: "Avg 1.8s, down from 2.4s", tone: "green" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-lightbulb" tone="blue" title="Withdrawal insights" subtitle="AI-powered analysis">
      <div className="d-flex flex-column gap-2">
        {insights.map((ins) => (
          <div key={ins.title} className="pm-alert-row" style={{ borderLeftColor: ins.tone === "green" ? "#12b76a" : "#f79009" }}>
            <i className={`bi ${ins.icon}`} style={{ color: ins.tone === "green" ? "#12b76a" : "#f79009" }} />
            <div className="flex-grow-1"><div style={{ fontWeight: 700, fontSize: ".84rem" }}>{ins.title}</div><div style={{ fontSize: ".74rem", color: "var(--pm-muted)" }}>{ins.detail}</div></div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 25. Limit history modal ============================ */
export function LimitHistoryDetailModal({ limit, onClose }: { limit: { id: string; name: string; current: number; history: { date: string; from: number; to: number; who: string }[] } | null; onClose: () => void }) {
  if (!limit) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-clock-history" tone="blue" title="Limit history" subtitle={limit.name}>
      <div className="d-flex flex-column gap-2">
        {limit.history.map((h, i) => (
          <div key={i} className="pm-card pm-card-pad d-flex align-items-center gap-3">
            <i className="bi bi-pencil-square" style={{ color: "#2e90fa" }} />
            <div className="flex-grow-1"><div style={{ fontWeight: 700, fontSize: ".84rem" }}>{h.who}</div><div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{h.date} · {kes(h.from)} → {kes(h.to)}</div></div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 26. Fraud control detail modal ============================ */
export function FraudControlDetailInfoModal({ rule, onClose }: { rule: { id: string; name: string; status: string; threshold: number; triggers: number } | null; onClose: () => void }) {
  if (!rule) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-shield-exclamation" tone="blue" title="Fraud control" subtitle={rule.name}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone={rule.status === "Active" ? "green" : "grey"}>{rule.status}</Badge></span></div>
        <div className="pm-kv"><span className="k">Threshold</span><span className="v pm-num">{rule.threshold}</span></div>
        <div className="pm-kv"><span className="k">Triggers (30d)</span><span className="v pm-num">{rule.triggers}</span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 27. Blocked user detail modal ============================ */
export function BlockedUserDetailModal({ row, onClose }: { row: { id: string; userId: string; reason: string; since: string; status: string } | null; onClose: () => void }) {
  if (!row) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-person-x" tone="red" title="Blocked user" subtitle={row.userId}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">User ID</span><span className="v mono">{row.userId}</span></div>
        <div className="pm-kv"><span className="k">Reason</span><span className="v">{row.reason}</span></div>
        <div className="pm-kv"><span className="k">Since</span><span className="v">{row.since}</span></div>
        <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone="red">{row.status}</Badge></span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 28. Override history modal ============================ */
export function OverrideHistoryDetailModal({ user, onClose }: { user: { userId: string; overrides: { date: string; limit: number; reason: string }[] } | null; onClose: () => void }) {
  if (!user) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-clock-history" tone="blue" title="Override history" subtitle={user.userId}>
      <div className="d-flex flex-column gap-2">
        {user.overrides.map((o, i) => (
          <div key={i} className="pm-card pm-card-pad d-flex align-items-center gap-3">
            <i className="bi bi-pencil-square" style={{ color: "#7a5af8" }} />
            <div className="flex-grow-1"><div style={{ fontWeight: 700, fontSize: ".84rem" }}>{kes(o.limit)}/day</div><div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{o.reason} · {o.date}</div></div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 29. Simulation result modal ============================ */
export function SimulationResultInfoModal({ result, onClose }: { result: { amount: number; blocked: boolean; verify: boolean; findings: { rule: string; ok: boolean }[] } | null; onClose: () => void }) {
  if (!result) return null;
  return (
    <Modal open onClose={onClose} tone={result.blocked ? "red" : result.verify ? "amber" : "green"} icon="bi-calculator" size="md" title="Simulation result" subtitle={kes(result.amount)}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3 text-center">
          <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1.5rem", color: result.blocked ? "#f04438" : result.verify ? "#f79009" : "#12b76a" }}>
            {result.blocked ? "BLOCKED" : result.verify ? "VERIFY" : "PASS"}
          </div>
        </div>
        <div className="d-flex flex-column gap-1">
          {result.findings.map((f) => (
            <div key={f.rule} className="d-flex align-items-center gap-2">
              <i className={`bi ${f.ok ? "bi-check-circle" : "bi-x-circle"}`} style={{ color: f.ok ? "#12b76a" : "#f79009" }} />
              <span style={{ fontSize: ".82rem" }}>{f.rule}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-primary btn-sm" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 30. Withdrawal forecast modal ============================ */
export function WithdrawalForecastModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const forecast = [
    { hour: "09:00", volume: "KES 28M", risk: "Low" },
    { hour: "12:00", volume: "KES 42M", risk: "Medium" },
    { hour: "15:00", volume: "KES 35M", risk: "Low" },
    { hour: "18:00", volume: "KES 18M", risk: "Low" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-calendar-range" tone="blue" title="Withdrawal forecast" subtitle="Hourly projection">
      <div className="d-flex flex-column gap-2">
        {forecast.map((f) => (
          <div key={f.hour} className="pm-card pm-card-pad d-flex align-items-center justify-content-between">
            <div><div style={{ fontWeight: 700, fontSize: ".88rem" }}>{f.hour}</div></div>
            <div className="text-end"><div style={{ fontWeight: 800, fontSize: ".95rem" }}>{f.volume}</div>
              <Badge tone={f.risk === "Low" ? "green" : "amber"}>{f.risk}</Badge></div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

void GLOBAL_LIMITS;
void POOL_RULES;
void USER_OVERRIDES;
