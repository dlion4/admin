import { useState } from "react";
import { Avatar, Badge, Drawer, EmptyState, Meter, Modal, Steps, TwoFactorField, useToast } from "../../../components/ui";
import { csvDownload, jsonDownload, kes, num } from "../../../lib/format";
import type { ExemptionRequest, FeeOverride, FeeSchedule, PartnerShare, ScheduledChange, TierBand, TierCategory } from "../data/feeData";
import { FEE_AUDIT, FEE_OVERRIDES, FEE_SCHEDULES } from "../data/feeData";

const statusTone = (s: string) =>
  s === "Active" || s === "Approved" || s === "Scheduled" ? "green"
    : s === "Pending approval" || s === "Expiring" || s === "Renegotiating" || s === "Draft" ? "amber"
      : s === "Rejected" || s === "Revoked" || s === "Expired" || s === "Suspended" ? "red"
        : "grey";

const methodTone = (m: string) =>
  m === "Percentage" ? "green" : m === "Tiered" ? "blue" : m === "Flat" ? "violet" : m === "Hybrid" ? "amber" : "grey";

export const rateLabel = (f: Pick<FeeSchedule, "method" | "rate" | "fixed" | "minFee" | "maxFee">) => {
  if (f.method === "Free") return "Free";
  if (f.method === "Flat") return `KES ${num(f.fixed)} flat`;
  if (f.method === "Hybrid") return `${f.rate}% + KES ${num(f.fixed)}`;
  if (f.method === "Tiered") return `${f.rate}%* (min ${num(f.minFee)})`;
  return `${f.rate}%${f.minFee ? ` (min ${num(f.minFee)})` : ""}${f.maxFee ? ` · cap ${num(f.maxFee)}` : ""}`;
};

const feeIconTone = (c: string) =>
  c === "P2P & Wallet" ? "#12b76a" : c === "Cash & Agents" ? "#f79009" : c === "Cards" ? "#2e90fa"
    : c === "FX & Global" ? "#ee46bc" : c === "Bills & Utilities" ? "#0ba5ec" : c === "Lending" ? "#f04438"
      : c === "Banking" ? "#7a5af8" : "#98a2b3";

/* ================================================================
   1. Fee detail drawer
   ================================================================ */
export function FeeDetailDrawer({
  fee, onClose, onChange, onSimulate, onHistory, onDeactivate, onScheduleFor,
}: {
  fee: FeeSchedule | null;
  onClose: () => void;
  onChange: (f: FeeSchedule) => void;
  onSimulate: (f: FeeSchedule) => void;
  onHistory: (f: FeeSchedule) => void;
  onDeactivate: (f: FeeSchedule) => void;
  onScheduleFor: (f: FeeSchedule) => void;
}) {
  if (!fee) return null;
  const related = FEE_OVERRIDES.filter((o) => o.feeId === fee.id || o.feeId === "ALL").slice(0, 4);
  const sharePct = (fee.revenue30d / FEE_SCHEDULES.reduce((s, x) => s + x.revenue30d, 0)) * 100;
  return (
    <Drawer open onClose={onClose} wide icon={fee.icon} tone={fee.status === "Inactive" ? "red" : fee.status === "Draft" ? "amber" : "green"}
      title={fee.name} subtitle={`${fee.id} · ${fee.category} · last changed ${fee.lastChanged} by ${fee.changedBy}`}
      headExtra={<Badge tone={statusTone(fee.status)} dot>{fee.status}</Badge>}
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => onHistory(fee)}>
            <i className="bi bi-clock-history me-1" />History
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => onSimulate(fee)}>
            <i className="bi bi-calculator me-1" />Simulate
          </button>
          {fee.status === "Active" && (
            <button className="btn btn-outline-danger btn-sm" onClick={() => onDeactivate(fee)}>
              <i className="bi bi-slash-circle me-1" />Deactivate
            </button>
          )}
          <button className="btn btn-primary btn-sm flex-grow-1" onClick={() => onChange(fee)}>
            <i className="bi bi-pencil-square me-1" />Change fee
          </button>
        </>
      }>
      <div className="pm-card pm-card-pad mb-3">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <div className="pm-eyebrow">Current pricing</div>
            <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1.55rem" }}>{rateLabel(fee)}</div>
            <div style={{ fontSize: ".75rem", color: "var(--pm-muted)" }}>
              {fee.method} · {fee.taxTreatment}
            </div>
          </div>
          <div className="text-end">
            <Badge tone={methodTone(fee.method)}>{fee.method}</Badge>
            <div className="mt-1"><Badge tone="grey">{fee.channels}</Badge></div>
            {fee.nextChange && <div className="mt-1"><Badge tone="amber" dot>Change pending</Badge></div>}
          </div>
        </div>
      </div>

      <div className="row g-2 mb-3">
        {[
          { l: "Revenue (30d)", v: fee.revenue30d ? kes(fee.revenue30d, { compact: true }) : "KES 0", s: `${sharePct.toFixed(1)}% of fee mix` },
          { l: "Transactions (30d)", v: num(fee.txns30d), s: `avg fee ${fee.revenue30d ? kes(Math.round(fee.revenue30d / Math.max(1, fee.txns30d))) : "KES 0"}` },
          { l: "Volume (30d)", v: fee.volume30d ? kes(fee.volume30d, { compact: true }) : "—", s: fee.method === "Percentage" || fee.method === "Tiered" || fee.method === "Hybrid" ? `effective ${fee.effectiveRate}%` : "flat-rate line" },
          { l: "Overrides", v: String(fee.overrides), s: "custom pricing attached" },
        ].map((x) => (
          <div className="col-6" key={x.l}>
            <div className="pm-stat">
              <div className="pm-stat-label">{x.l}</div>
              <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1.05rem" }}>{x.v}</div>
              <div className="pm-stat-foot">{x.s}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-eyebrow mb-2">Rate structure</div>
        <div className="pm-kv"><span className="k">Percentage component</span><span className="v">{fee.rate}%</span></div>
        <div className="pm-kv"><span className="k">Fixed component</span><span className="v">{fee.fixed ? `KES ${num(fee.fixed)}` : "—"}</span></div>
        <div className="pm-kv"><span className="k">Minimum fee</span><span className="v">{fee.minFee ? `KES ${num(fee.minFee)}` : "none"}</span></div>
        <div className="pm-kv"><span className="k">Maximum cap</span><span className="v">{fee.maxFee ? `KES ${num(fee.maxFee)}` : "uncapped"}</span></div>
        <div className="pm-kv"><span className="k">Applies to</span><span className="v">{fee.appliesTo}</span></div>
        <div className="pm-kv"><span className="k">Tax treatment</span><span className="v">{fee.taxTreatment}</span></div>
        <div className="pm-kv"><span className="k">Competitor benchmark</span><span className="v">{fee.competitor ? `${fee.competitor}%` : "n/a"} {fee.competitor && fee.rate <= fee.competitor ? <Badge tone="green">below market</Badge> : fee.competitor ? <Badge tone="red">above market</Badge> : null}</span></div>
      </div>

      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-eyebrow mb-2">Volume trend (12 weeks, indexed)</div>
        <div className="d-flex align-items-end gap-1" style={{ height: 64 }}>
          {[52, 48, 60, 57, 66, 63, 71, 69, 75, 72, 80, 84].map((h, i) => (
            <div key={i} className="flex-grow-1 rounded-top" title={`Week ${i + 1}: index ${h}`}
              style={{ height: `${h}%`, background: i >= 9 ? "var(--pm-green)" : "#c9e9d8" }} />
          ))}
        </div>
        <div className="d-flex justify-content-between mt-1" style={{ fontSize: ".66rem", color: "var(--pm-muted)" }}>
          <span>W1</span><span>W6</span><span>W12</span>
        </div>
      </div>

      <div className="pm-card pm-card-pad">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="pm-eyebrow mb-0">Attached overrides</div>
          {fee.nextChange && <button className="btn btn-sm btn-outline-primary" onClick={() => onScheduleFor(fee)}>View pending change</button>}
        </div>
        {related.length ? related.map((o) => (
          <div key={o.id} className="pm-kv">
            <span className="k">{o.userName} <span className="mono" style={{ fontSize: ".68rem" }}>{o.id}</span></span>
            <span className="v">{o.override} · <Badge tone={statusTone(o.status)}>{o.status}</Badge></span>
          </div>
        )) : <div className="pm-td-sub">No overrides on this fee line.</div>}
      </div>
    </Drawer>
  );
}

/* ================================================================
   2. Fee change wizard (edit existing or create new) — 5 steps
   ================================================================ */
export function FeeChangeWizard({
  fee, open, onClose, onSubmit, onOpenSchedule,
}: {
  fee: FeeSchedule | null; // null → create new fee
  open: boolean;
  onClose: () => void;
  onSubmit: (c: ScheduledChange, f?: FeeSchedule) => void;
  onOpenSchedule: () => void;
}) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [method, setMethod] = useState<FeeSchedule["method"]>(fee?.method ?? "Percentage");
  const [rate, setRate] = useState(fee?.rate ?? 1.5);
  const [fixed, setFixed] = useState(fee?.fixed ?? 0);
  const [minFee, setMinFee] = useState(fee?.minFee ?? 10);
  const [maxFee, setMaxFee] = useState(fee?.maxFee ?? 0);
  const [appliesTo, setAppliesTo] = useState(fee?.appliesTo ?? "All users");
  const [channels, setChannels] = useState(fee?.channels ?? "App, Web, API");
  const [volumeBand, setVolumeBand] = useState("All bands");
  const [tax, setTax] = useState<FeeSchedule["taxTreatment"]>(fee?.taxTreatment ?? "VAT 16% incl.");
  const [effective, setEffective] = useState("2026-09-01");
  const [autoRevert, setAutoRevert] = useState(false);
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  const steps = [
    { label: "Pricing", icon: "bi-percent" },
    { label: "Scope", icon: "bi-people" },
    { label: "Tax & dating", icon: "bi-receipt-cutoff" },
    { label: "Impact", icon: "bi-calculator" },
    { label: "2FA", icon: "bi-shield-lock" },
  ];
  const close = () => { setStep(0); setCode(""); setReason(""); onClose(); };
  if (!open) return null;

  const volume = fee?.volume30d ?? 500_000_000;
  const oldRev = fee?.revenue30d ?? 0;
  const newRev = Math.round(volume * (rate / 100) + (fee?.txns30d ?? 0) * fixed);
  const delta = newRev - oldRev;
  const users = fee?.txns30d ?? 0;
  const proposed = method === "Free" ? "Free" : method === "Flat" ? `KES ${num(fixed)} flat`
    : method === "Hybrid" ? `${rate}% + KES ${num(fixed)}`
      : `${rate}%${minFee ? ` (min ${num(minFee)})` : ""}${maxFee ? ` · cap ${num(maxFee)}` : ""}`;

  return (
    <Modal open onClose={close} tone={fee ? "green" : "blue"} icon={fee ? "bi-pencil-square" : "bi-plus-circle"} size="lg"
      title={fee ? `Change fee — ${fee.name}` : "Create new fee line"}
      subtitle={fee ? `${fee.id} · change is effective-dated, never instant` : "New schedule enters the registry as Draft"}>
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <>
            <label className="form-label">Calculation method</label>
            <div className="pm-seg mb-3">
              {(["Percentage", "Flat", "Tiered", "Hybrid", "Free"] as FeeSchedule["method"][]).map((m) => (
                <button key={m} className={method === m ? "active" : ""} onClick={() => setMethod(m)}>{m}</button>
              ))}
            </div>
            <div className="row g-2">
              {method !== "Free" && method !== "Flat" && (
                <div className="col-6">
                  <label className="form-label">Rate (%)</label>
                  <input type="number" step="0.01" className="form-control mono" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
                </div>
              )}
              {method !== "Free" && method !== "Percentage" && method !== "Tiered" && (
                <div className="col-6">
                  <label className="form-label">Fixed component (KES)</label>
                  <input type="number" className="form-control mono" value={fixed} onChange={(e) => setFixed(Number(e.target.value))} />
                </div>
              )}
              <div className="col-6">
                <label className="form-label">Minimum fee (KES)</label>
                <input type="number" className="form-control mono" value={minFee} onChange={(e) => setMinFee(Number(e.target.value))} disabled={method === "Free"} />
              </div>
              <div className="col-6">
                <label className="form-label">Maximum cap — 0 = uncapped</label>
                <input type="number" className="form-control mono" value={maxFee} onChange={(e) => setMaxFee(Number(e.target.value))} disabled={method === "Free"} />
              </div>
            </div>
            {fee && (
              <div className="pm-note mt-3">
                <i className="bi bi-info-circle me-1" />
                Current: <b>{rateLabel(fee)}</b> → proposed <b className="mono">{proposed}</b>
              </div>
            )}
          </>
        )}
        {step === 1 && (
          <>
            <label className="form-label">Applies to</label>
            <select className="form-select mb-3" value={appliesTo} onChange={(e) => setAppliesTo(e.target.value)}>
              {["All users", "All users · tiered by volume", "KYC Tier 2+", "Business accounts", "VIP tiers only", "Specific users (via override)", "On request"].map((o) => <option key={o}>{o}</option>)}
            </select>
            <label className="form-label">Channel restriction</label>
            <select className="form-select mb-3" value={channels} onChange={(e) => setChannels(e.target.value)}>
              {["All channels", "App, Web, API", "M-Pesa (Daraja)", "Visa, Mastercard", "PesaLink IPS", "ATM network", "Agent, Branch"].map((o) => <option key={o}>{o}</option>)}
            </select>
            <label className="form-label">Volume band scope</label>
            <div className="d-flex gap-1 flex-wrap">
              {["All bands", "Band 1", "Band 2", "Band 3", "Band 4", "Band 5 (custom)"].map((b) => (
                <button key={b} className={`pm-chip ${volumeBand === b ? "active" : ""}`} onClick={() => setVolumeBand(b)}>{b}</button>
              ))}
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <label className="form-label">Tax treatment</label>
            <select className="form-select mb-3" value={tax} onChange={(e) => setTax(e.target.value as FeeSchedule["taxTreatment"])}>
              {(["VAT 16% incl.", "VAT 16% + Excise 20%", "VAT exempt", "Excise 20% only"] as FeeSchedule["taxTreatment"][]).map((t) => <option key={t}>{t}</option>)}
            </select>
            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label">Effective date</label>
                <input type="date" className="form-control" value={effective} onChange={(e) => setEffective(e.target.value)} />
              </div>
              <div className="col-6 d-flex align-items-end">
                <label className="pm-opt w-100">
                  <input type="checkbox" className="form-check-input mt-0" checked={autoRevert} onChange={(e) => setAutoRevert(e.target.checked)} />
                  <span style={{ fontWeight: 700, fontSize: ".82rem" }}>Auto-revert after 90-day promo</span>
                </label>
              </div>
            </div>
            <label className="form-label">Reason for change <span style={{ color: "#f04438" }}>*</span></label>
            <textarea className="form-control" rows={3} value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="Required for the audit trail — e.g. 'Q4 pricing review, board minute BR-2026-31'" />
            <div className="pm-note mt-3">
              <i className="bi bi-shield-check me-1" />
              Changes never apply instantly. They queue as <b>Pending approval</b> and require a second Tier-0 authorisation with 2FA before the effective date.
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-kv"><span className="k">Fee line</span><span className="v">{fee ? fee.name : "New fee line (draft)"}</span></div>
              <div className="pm-kv"><span className="k">Current</span><span className="v mono">{fee ? rateLabel(fee) : "—"}</span></div>
              <div className="pm-kv"><span className="k">Proposed</span><span className="v mono">{proposed}</span></div>
              <div className="pm-kv"><span className="k">Projected revenue (30d)</span><span className="v mono">{kes(newRev)}</span></div>
              <div className="pm-kv">
                <span className="k">Revenue impact</span>
                <span className="v mono" style={{ color: delta >= 0 ? "#0b8f52" : "#b42318" }}>
                  {delta >= 0 ? "▲" : "▼"} {kes(Math.abs(delta))} / mo
                </span>
              </div>
              <div className="pm-kv"><span className="k">Users affected</span><span className="v">{num(users)} txns / 30d</span></div>
              <div className="pm-kv"><span className="k">Effective</span><span className="v">{effective}{autoRevert ? " · reverts +90d" : ""}</span></div>
            </div>
            <div className="pm-note">
              <i className="bi bi-graph-down-arrow me-1" />
              Elasticity model assumes ±12% volume response per 0.5% price move (calibrated on the Mar–Jun 2026 experiments).
            </div>
          </>
        )}
        {step === 4 && (
          <>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-kv"><span className="k">Submitted by</span><span className="v">Jeckonia Kwasa · Tier 0</span></div>
              <div className="pm-kv"><span className="k">Approval required from</span><span className="v">Super Admin (Tier 0) · dual control</span></div>
              <div className="pm-kv"><span className="k">Audit reason</span><span className="v" style={{ maxWidth: 300 }}>{reason || "—"}</span></div>
            </div>
            <TwoFactorField value={code} onChange={setCode} />
          </>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}><i className="bi bi-arrow-left me-1" />Back</button>}
        {step < 4 && (
          <button className="btn btn-primary btn-sm" disabled={step === 2 && reason.trim().length < 8} onClick={() => setStep(step + 1)}>
            Next<i className="bi bi-arrow-right ms-1" />
          </button>
        )}
        {step === 4 && (
          <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => {
            const change: ScheduledChange = {
              id: `CHG-${1192 + Math.floor(Math.random() * 60)}`,
              feeId: fee?.id ?? "FEE-NEW",
              feeName: fee?.name ?? "New fee line",
              current: fee ? rateLabel(fee) : "—",
              proposed,
              effective: new Date(effective).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" }),
              submittedBy: "Jeckonia Kwasa",
              submittedAt: "Just now",
              status: "Pending approval",
              impact: `${delta >= 0 ? "+" : "−"}${kes(Math.abs(delta), { compact: true })}/mo · ${num(users)} txns affected`,
              approvals: { role: "Super Admin (Tier 0)" },
            };
            onSubmit(change, fee ?? undefined);
            push({ kind: "success", title: `${change.id} submitted`, body: `${change.feeName} → ${proposed} · effective ${change.effective}. Awaiting Tier-0 approval.` });
            close();
          }}>
            <i className="bi bi-send me-1" />Submit for approval
          </button>
        )}
      </div>
      <div className="px-3 pb-2" style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>
        Have a pending change already? <button className="btn btn-link btn-sm p-0" style={{ fontSize: ".72rem" }} onClick={onOpenSchedule}>Open the pipeline</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   3. Fee impact simulator wizard — 4 steps
   ================================================================ */
export function SimulatorWizard({
  fee, open, onClose, onSchedule,
}: {
  fee: FeeSchedule | null;
  open: boolean;
  onClose: () => void;
  onSchedule: (c: ScheduledChange) => void;
}) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [feeId, setFeeId] = useState(fee?.id ?? "FEE-001");
  const [newRate, setNewRate] = useState(fee?.rate ?? 1.5);
  const [newMin, setNewMin] = useState(fee?.minFee ?? 10);
  const [elasticity, setElasticity] = useState(12);
  const [code, setCode] = useState("");
  const [saved, setSaved] = useState(false);
  const target = FEE_SCHEDULES.find((f) => f.id === feeId) ?? FEE_SCHEDULES[0];
  const steps = [
    { label: "Fee line", icon: "bi-list-ul" },
    { label: "Adjust", icon: "bi-sliders" },
    { label: "Impact", icon: "bi-graph-up" },
    { label: "Outcome", icon: "bi-check2" },
  ];
  const close = () => { setStep(0); setCode(""); setSaved(false); onClose(); };
  if (!open) return null;

  const priceMove = newRate - target.rate;
  const volumeResponse = 1 + (priceMove / 0.5) * (elasticity / 100);
  const newTxns = Math.round(target.txns30d * Math.max(0.4, volumeResponse));
  const grossRev = Math.round(target.volume30d * Math.max(0.4, volumeResponse) * (newRate / 100));
  const floorAdd = Math.round(newTxns * (newMin > 0 && target.volume30d / Math.max(1, target.txns30d) * (newRate / 100) < newMin ? newMin : 0));
  const projected = target.method === "Percentage" || target.method === "Tiered" || target.method === "Hybrid" ? grossRev + floorAdd : Math.round(newTxns * newMin);
  const delta = projected - target.revenue30d;
  const avgFee = Math.round(projected / Math.max(1, newTxns));

  return (
    <Modal open onClose={close} tone="violet" icon="bi-calculator" size="lg"
      title="Fee impact simulator" subtitle="Model pricing changes against volume elasticity before touching the schedule">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%`, background: "#7a5af8" }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div className="d-flex flex-column gap-2">
            {FEE_SCHEDULES.filter((f) => f.method !== "Free").slice(0, 10).map((f) => (
              <button key={f.id} className={`pm-opt ${feeId === f.id ? "active" : ""}`} onClick={() => { setFeeId(f.id); setNewRate(f.rate); setNewMin(f.minFee); }}>
                <span className="r" />
                <span className="pm-avatar sm" style={{ background: feeIconTone(f.category) }}><i className={`bi ${f.icon}`} /></span>
                <span className="flex-grow-1">
                  <span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>{f.name}</span>
                  <span className="d-block pm-td-sub mono">{rateLabel(f)} · {kes(f.revenue30d, { compact: true })}/30d</span>
                </span>
              </button>
            ))}
          </div>
        )}
        {step === 1 && (
          <>
            <div className="pm-card pm-card-pad mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span className="pm-eyebrow">New rate for {target.name}</span>
                <span className="mono" style={{ fontWeight: 800, fontSize: "1.1rem", color: "#5925dc" }}>{newRate.toFixed(2)}%</span>
              </div>
              <input type="range" className="form-range" min={0} max={5} step={0.05} value={newRate} onChange={(e) => setNewRate(Number(e.target.value))} />
              <div className="d-flex justify-content-between" style={{ fontSize: ".68rem", color: "var(--pm-muted)" }}>
                <span>0%</span><span>current {target.rate}%</span><span>5%</span>
              </div>
            </div>
            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label">Minimum fee (KES)</label>
                <input type="number" className="form-control mono" value={newMin} onChange={(e) => setNewMin(Number(e.target.value))} />
              </div>
              <div className="col-6">
                <label className="form-label">Volume elasticity — {elasticity}% per 0.5% move</label>
                <input type="range" className="form-range mt-2" min={0} max={30} value={elasticity} onChange={(e) => setElasticity(Number(e.target.value))} />
              </div>
            </div>
            <div className="pm-note">Proposed: <b className="mono">{newRate.toFixed(2)}%{newMin ? ` (min ${num(newMin)})` : ""}</b> vs current <b className="mono">{rateLabel(target)}</b></div>
          </>
        )}
        {step === 2 && (
          <>
            <div className="row g-2 mb-3">
              {[
                { l: "Projected revenue / 30d", v: kes(projected, { compact: true }), c: delta >= 0 ? "#0b8f52" : "#b42318" },
                { l: "Revenue impact", v: `${delta >= 0 ? "+" : "−"}${kes(Math.abs(delta), { compact: true })}`, c: delta >= 0 ? "#0b8f52" : "#b42318" },
                { l: "Projected txns / 30d", v: num(newTxns), c: "var(--pm-ink)" },
                { l: "Avg fee / txn", v: kes(avgFee), c: "var(--pm-ink)" },
              ].map((x) => (
                <div className="col-6" key={x.l}>
                  <div className="pm-stat">
                    <div className="pm-stat-label">{x.l}</div>
                    <div className="pm-stat-value" style={{ color: x.c, fontSize: "1.15rem" }}>{x.v}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="pm-card pm-card-pad">
              <div className="pm-eyebrow mb-2">Current vs projected</div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span style={{ width: 84, fontSize: ".74rem", color: "var(--pm-muted)" }}>Current</span>
                <Meter value={(target.revenue30d / Math.max(projected, target.revenue30d)) * 100} tone="#98a2b3" width={999} />
                <span className="pm-num" style={{ fontWeight: 700, minWidth: 84, textAlign: "right" }}>{kes(target.revenue30d, { compact: true })}</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span style={{ width: 84, fontSize: ".74rem", color: "var(--pm-muted)" }}>Projected</span>
                <Meter value={100} tone={delta >= 0 ? "#12b76a" : "#f04438"} width={999} />
                <span className="pm-num" style={{ fontWeight: 700, minWidth: 84, textAlign: "right" }}>{kes(projected, { compact: true })}</span>
              </div>
            </div>
          </>
        )}
        {step === 3 && (
          <>
            {saved ? (
              <div className="text-center py-4">
                <div className="pm-modal-ico mx-auto mb-2" style={{ background: "#e7f8ef", color: "#0b8f52", width: 52, height: 52, fontSize: "1.4rem" }}>
                  <i className="bi bi-check-lg" />
                </div>
                <div style={{ fontWeight: 800, fontFamily: "Sora" }}>Scenario scheduled for approval</div>
                <div style={{ fontSize: ".8rem", color: "var(--pm-muted)" }}>
                  {target.name}: {rateLabel(target)} → {newRate.toFixed(2)}%{newMin ? ` (min ${num(newMin)})` : ""} · {delta >= 0 ? "+" : "−"}{kes(Math.abs(delta), { compact: true })}/mo
                </div>
              </div>
            ) : (
              <>
                <div className="pm-card pm-card-pad mb-3">
                  <div className="pm-kv"><span className="k">Fee line</span><span className="v">{target.name}</span></div>
                  <div className="pm-kv"><span className="k">Scenario</span><span className="v mono">{rateLabel(target)} → {newRate.toFixed(2)}%{newMin ? ` (min ${num(newMin)})` : ""}</span></div>
                  <div className="pm-kv"><span className="k">Impact</span><span className="v mono" style={{ color: delta >= 0 ? "#0b8f52" : "#b42318" }}>{delta >= 0 ? "+" : "−"}{kes(Math.abs(delta))} / 30d</span></div>
                  <div className="pm-kv"><span className="k">Users affected</span><span className="v">{num(newTxns)} txns</span></div>
                </div>
                <div className="pm-note mb-3">
                  <i className="bi bi-shield-lock me-1" />
                  Pushing this scenario submits a real change request into the approval pipeline — it will not take effect until dual Tier-0 approval with 2FA.
                </div>
                <TwoFactorField value={code} onChange={setCode} />
              </>
            )}
          </>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>{saved ? "Done" : "Cancel"}</button>
        {step > 0 && !saved && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}>Back</button>}
        {step < 3 && <button className="btn btn-primary btn-sm" onClick={() => setStep(step + 1)}>Next</button>}
        {step === 3 && !saved && (
          <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => {
            const change: ScheduledChange = {
              id: `CHG-${1192 + Math.floor(Math.random() * 60)}`,
              feeId: target.id,
              feeName: target.name,
              current: rateLabel(target),
              proposed: `${newRate.toFixed(2)}%${newMin ? ` (min ${num(newMin)})` : ""}`,
              effective: "01 Oct 2026",
              submittedBy: "Jeckonia Kwasa",
              submittedAt: "Just now",
              status: "Pending approval",
              impact: `${delta >= 0 ? "+" : "−"}${kes(Math.abs(delta), { compact: true })}/mo · ${num(newTxns)} txns`,
              approvals: { role: "Super Admin (Tier 0)" },
            };
            onSchedule(change);
            push({ kind: "success", title: "Scenario pushed to pipeline", body: `${change.id} · ${change.feeName} → ${change.proposed}` });
            setSaved(true);
            setStep(3);
          }}>
            <i className="bi bi-send me-1" />Push as scheduled change
          </button>
        )}
      </div>
    </Modal>
  );
}

/* ================================================================
   4. Volume tier matrix modal (with inline cell editor + 2FA)
   ================================================================ */
export function TierMatrixModal({
  open, onClose, bands, onUpdateBand,
}: {
  open: boolean;
  onClose: () => void;
  bands: TierBand[];
  onUpdateBand: (band: string, category: TierCategory, value: string) => void;
}) {
  const { push } = useToast();
  const [cell, setCell] = useState<{ band: TierBand; category: TierCategory } | null>(null);
  const [value, setValue] = useState("");
  const [code, setCode] = useState("");
  const categories: TierCategory[] = ["Internal transfer", "M-Pesa cash-out", "Card payment", "Bill payment"];
  if (!open) return null;
  return (
    <Modal open onClose={() => { setCell(null); onClose(); }} tone="blue" icon="bi-table" size="xl"
      title="Volume tier matrix" subtitle="Monthly volume bands × fee categories — click any cell to re-price it (2FA)">
      <div className="pm-modal-body">
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead>
              <tr>
                <th>Band</th><th>Monthly volume</th><th>Users</th>
                {categories.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {bands.map((b) => (
                <tr key={b.band}>
                  <td><Badge tone="ink">{b.band}</Badge></td>
                  <td className="pm-td-strong">{b.volume}</td>
                  <td className="pm-num">{num(b.users)}</td>
                  {categories.map((c) => (
                    <td key={c}>
                      <button className="pm-chip w-100 text-start"
                        style={cell?.band === b && cell?.category === c ? { background: "#101828", color: "#fff" } : undefined}
                        onClick={() => { setCell({ band: b, category: c }); setValue(b.rates[c]); setCode(""); }}>
                        <span className="mono" style={{ fontSize: ".72rem" }}>{b.rates[c]}</span>
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {cell && (
          <div className="pm-card pm-card-pad mt-3" style={{ borderColor: "#12b76a", boxShadow: "0 0 0 3px rgba(18,183,106,.12)" }}>
            <div className="pm-eyebrow mb-2">Editing — {cell.band.band} · {cell.category}</div>
            <div className="row g-2 align-items-end">
              <div className="col-12 col-md-5">
                <label className="form-label">New rate label</label>
                <input className="form-control mono" value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. 1.10% (min 10)" />
                <div style={{ fontSize: ".7rem", color: "var(--pm-muted)", marginTop: ".3rem" }}>
                  Current: <b className="mono">{cell.band.rates[cell.category]}</b> · {num(cell.band.users)} users in band
                </div>
              </div>
              <div className="col-12 col-md-4">
                <TwoFactorField value={code} onChange={setCode} />
              </div>
              <div className="col-12 col-md-3 d-flex gap-2">
                <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => setCell(null)}>Cancel</button>
                <button className="btn btn-primary btn-sm flex-grow-1" disabled={code !== "482913" || value.trim().length < 3 || value === cell.band.rates[cell.category]}
                  onClick={() => {
                    onUpdateBand(cell.band.band, cell.category, value);
                    push({ kind: "success", title: "Tier re-priced", body: `${cell.band.band} · ${cell.category} → ${value}` });
                    setCell(null);
                  }}>
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="pm-note mt-3">
          <i className="bi bi-info-circle me-1" />
          Band 5 (&gt; KES 10M/mo) is custom-priced per relationship — changes route through the VIP desk (Page 8) and override records.
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => { csvDownload("tier-bands.csv", bands.map((b) => ({ band: b.band, volume: b.volume, users: b.users, ...b.rates }))); push({ kind: "success", title: "Tier matrix exported" }); }}>
          <i className="bi bi-download me-1" />Export matrix
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => { setCell(null); onClose(); }}>Done</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   5. Overrides & waivers drawer
   ================================================================ */
export function OverridesDrawer({
  open, onClose, overrides, onView, onRevoke, onGrant,
}: {
  open: boolean;
  onClose: () => void;
  overrides: FeeOverride[];
  onView: (o: FeeOverride) => void;
  onRevoke: (o: FeeOverride) => void;
  onGrant: () => void;
}) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const list = overrides.filter((o) =>
    (status === "all" || o.status === status) &&
    (o.userName + o.userId + o.feeName + o.segment + o.id).toLowerCase().includes(q.toLowerCase())
  );
  const active = overrides.filter((o) => o.status === "Active" || o.status === "Expiring");
  const waived = active.reduce((s, o) => s + o.monthlyValue, 0);
  return (
    <Drawer open={open} onClose={onClose} wide icon="bi-person-check" tone="blue" title="Waivers & fee overrides"
      subtitle={`${active.length} active · ${kes(waived, { compact: true })} waived per month`}
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => { setQ(""); setStatus("Expiring"); }}>
            <i className="bi bi-alarm me-1" />Expiring soon ({overrides.filter((o) => o.status === "Expiring").length})
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => { csvDownload("fee-overrides.csv", overrides as unknown as Record<string, unknown>[]); }}>
            <i className="bi bi-download me-1" />Export
          </button>
          <button className="btn btn-primary btn-sm flex-grow-1" onClick={onGrant}>
            <i className="bi bi-plus-lg me-1" />Grant override
          </button>
        </>
      }>
      <div className="pm-search mb-2" style={{ background: "#fff" }}>
        <i className="bi bi-search" />
        <input placeholder="User, ID, fee or segment…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="d-flex gap-1 flex-wrap mb-3">
        {["all", "Active", "Expiring", "Expired", "Revoked"].map((s) => (
          <button key={s} className={`pm-chip ${status === s ? "active" : ""}`} onClick={() => setStatus(s)}>{s === "all" ? "All" : s}</button>
        ))}
      </div>
      {list.length === 0 ? (
        <EmptyState icon="bi-person-x" title="No overrides match" body="Try a different filter." />
      ) : list.map((o) => (
        <div key={o.id} className="pm-alert-row mb-2" style={{ borderLeftColor: o.status === "Active" ? "#12b76a" : o.status === "Expiring" ? "#f79009" : o.status === "Revoked" ? "#f04438" : "#98a2b3" }}>
          <Avatar name={o.userName} size="sm" />
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span style={{ fontWeight: 700, fontSize: ".8rem" }}>{o.userName}</span>
              <Badge tone={statusTone(o.status)} dot>{o.status}</Badge>
              {o.discountPct === 100 && <Badge tone="violet">Full waiver</Badge>}
            </div>
            <div className="pm-td-sub">{o.feeName} · {o.override} <span style={{ opacity: .6 }}>(was {o.standard})</span></div>
            <div className="pm-td-sub mono">{o.id} · {o.userId} · expires {o.expires}</div>
          </div>
          <div className="text-end">
            <div className="pm-num" style={{ fontWeight: 700, fontSize: ".76rem" }}>{o.monthlyValue ? kes(o.monthlyValue, { compact: true }) : "—"}</div>
            <div className="btn-group btn-group-sm mt-1">
              <button className="btn btn-outline-secondary" style={{ fontSize: ".68rem" }} onClick={() => onView(o)}>View</button>
              {(o.status === "Active" || o.status === "Expiring") && (
                <button className="btn btn-outline-danger" style={{ fontSize: ".68rem" }} onClick={() => onRevoke(o)}>Revoke</button>
              )}
            </div>
          </div>
        </div>
      ))}
    </Drawer>
  );
}

/* ================================================================
   6. Override detail modal
   ================================================================ */
export function OverrideDetailModal({ ov, onClose, onRevoke }: { ov: FeeOverride | null; onClose: () => void; onRevoke: (o: FeeOverride) => void }) {
  if (!ov) return null;
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-person-check" size="md"
      title={ov.userName} subtitle={`${ov.id} · ${ov.segment} · ${ov.userId}`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Fee line</span><span className="v">{ov.feeName}</span></div>
          <div className="pm-kv"><span className="k">Standard pricing</span><span className="v mono">{ov.standard}</span></div>
          <div className="pm-kv"><span className="k">Override pricing</span><span className="v mono" style={{ color: "#0b8f52" }}>{ov.override}</span></div>
          <div className="pm-kv"><span className="k">Discount</span><span className="v">{ov.discountPct}%</span></div>
          <div className="pm-kv"><span className="k">Value waived</span><span className="v">{kes(ov.monthlyValue)} / mo</span></div>
          <div className="pm-kv"><span className="k">Reason</span><span className="v" style={{ maxWidth: 260 }}>{ov.reason}</span></div>
          <div className="pm-kv"><span className="k">Granted by</span><span className="v">{ov.grantedBy} · {ov.grantedAt}</span></div>
          <div className="pm-kv"><span className="k">Approved by</span><span className="v">{ov.approvedBy}</span></div>
          <div className="pm-kv"><span className="k">Expires</span><span className="v">{ov.expires}</span></div>
          <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone={statusTone(ov.status)} dot>{ov.status}</Badge></span></div>
        </div>
        <div className="pm-note">
          <i className="bi bi-clock-history me-1" />
          Every override is dual-controlled: granted by one admin, approved by a second. Misuse patterns auto-raise a compliance alert.
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => {
          csvDownload(`${ov.id}.json`.replace(".json", ".csv"), [ov as unknown as Record<string, unknown>]);
        }}>
          <i className="bi bi-download me-1" />Export record
        </button>
        {(ov.status === "Active" || ov.status === "Expiring") ? (
          <button className="btn btn-danger btn-sm" onClick={() => onRevoke(ov)}>
            <i className="bi bi-x-octagon me-1" />Revoke override
          </button>
        ) : <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>}
      </div>
    </Modal>
  );
}

/* ================================================================
   7. Revoke override modal (2FA)
   ================================================================ */
export function RevokeOverrideModal({ ov, onClose, onDone }: { ov: FeeOverride | null; onClose: () => void; onDone: (o: FeeOverride) => void }) {
  const { push } = useToast();
  const [reason, setReason] = useState("policy");
  const [note, setNote] = useState("");
  const [code, setCode] = useState("");
  if (!ov) return null;
  return (
    <Modal open onClose={onClose} tone="red" icon="bi-x-octagon" size="sm"
      title={`Revoke ${ov.id}`} subtitle={`${ov.userName} · ${ov.feeName} returns to ${ov.standard}`}>
      <div className="pm-modal-body">
        <label className="form-label">Revocation reason</label>
        <select className="form-select mb-3" value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="policy">Policy change</option>
          <option value="misuse">Override misuse detected</option>
          <option value="expired">Benefit window closed</option>
          <option value="left">Customer churned / account closed</option>
          <option value="manual">Manual — super admin decision</option>
        </select>
        <label className="form-label">Note</label>
        <textarea className="form-control mb-3" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Extra context for the audit trail…" />
        <TwoFactorField value={code} onChange={setCode} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger btn-sm" disabled={code !== "482913"} onClick={() => {
          onDone(ov);
          push({ kind: "warn", title: `${ov.id} revoked`, body: `${ov.userName} reverts to standard pricing at next transaction.` });
          onClose();
        }}>
          <i className="bi bi-x-octagon me-1" />Revoke now
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   8. Grant override wizard — 4 steps
   ================================================================ */
export function OverrideWizard({ open, onClose, onGrant }: { open: boolean; onClose: () => void; onGrant: (o: FeeOverride) => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [q, setQ] = useState("");
  const [user, setUser] = useState<{ name: string; id: string } | null>(null);
  const [feeId, setFeeId] = useState("FEE-001");
  const [discount, setDiscount] = useState(100);
  const [customRate, setCustomRate] = useState("0% (waived)");
  const [segment, setSegment] = useState("VIP · Business");
  const [reason, setReason] = useState("");
  const [expires, setExpires] = useState("6 months");
  const [code, setCode] = useState("");
  const steps = [
    { label: "Customer", icon: "bi-person" },
    { label: "Fees", icon: "bi-percent" },
    { label: "Terms", icon: "bi-calendar2-check" },
    { label: "2FA", icon: "bi-shield-lock" },
  ];
  const close = () => { setStep(0); setCode(""); setUser(null); setQ(""); onClose(); };
  if (!open) return null;
  const directory = [
    { name: "Grace Ochieng", id: "PAY-VIP-001" }, { name: "Apex Capital Ltd", id: "PAY-VIP-004" },
    { name: "Zawadi Enterprises", id: "PAY-VIP-011" }, { name: "Samuel Ndegwa", id: "PAY-VIP-002" },
    { name: "Amina Hassan", id: "PAY-VIP-007" }, { name: "Tulia Events KE", id: "PAY-VIP-009" },
    { name: "Dennis Mwangi", id: "PAY-67890" }, { name: "Naomi Chemtai", id: "PAY-33456" },
    { name: "Baraka Logistics", id: "PAY-VIP-013" }, { name: "Mavuno Farms Ltd", id: "PAY-VIP-016" },
  ];
  const fee = FEE_SCHEDULES.find((f) => f.id === feeId) ?? FEE_SCHEDULES[0];
  return (
    <Modal open onClose={close} tone="green" icon="bi-plus-circle" size="md"
      title="Grant fee override" subtitle="Custom pricing or full waiver — dual-controlled, expiring, audited">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <>
            <div className="pm-search mb-3" style={{ background: "#fff" }}>
              <i className="bi bi-search" />
              <input placeholder="Search name or account…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="d-flex flex-column gap-2">
              {directory.filter((u) => (u.name + u.id).toLowerCase().includes(q.toLowerCase())).slice(0, 6).map((u) => (
                <button key={u.id} className={`pm-opt ${user?.id === u.id ? "active" : ""}`} onClick={() => setUser(u)}>
                  <span className="r" />
                  <Avatar name={u.name} size="sm" />
                  <span className="flex-grow-1">
                    <span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>{u.name}</span>
                    <span className="d-block pm-td-sub mono">{u.id}</span>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <label className="form-label">Fee line</label>
            <select className="form-select mb-3" value={feeId} onChange={(e) => setFeeId(e.target.value)}>
              <option value="ALL">ALL — full waiver on every fee</option>
              {FEE_SCHEDULES.filter((f) => f.method !== "Free").map((f) => <option key={f.id} value={f.id}>{f.id} · {f.name}</option>)}
            </select>
            <label className="form-label">Discount level — {discount}%</label>
            <input type="range" className="form-range mb-3" min={0} max={100} step={5} value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
            <label className="form-label">Resulting pricing label</label>
            <input className="form-control mono mb-2" value={customRate} onChange={(e) => setCustomRate(e.target.value)} placeholder="e.g. 0.6% (min 10) or KES 0" />
            <div className="pm-note">
              Standard for {fee.name}: <b className="mono">{rateLabel(fee)}</b> → <b className="mono">{customRate}</b>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <label className="form-label">Segment</label>
            <select className="form-select mb-3" value={segment} onChange={(e) => setSegment(e.target.value)}>
              {["VIP · Platinum", "VIP · Gold", "VIP · Silver", "VIP · Business", "Goodwill", "Retention", "Hardship", "Staff", "Referral", "Beta tester"].map((s) => <option key={s}>{s}</option>)}
            </select>
            <label className="form-label">Expires</label>
            <div className="d-flex gap-1 flex-wrap mb-3">
              {["One-off", "1 month", "3 months", "6 months", "12 months", "Never (Tier 0 only)"].map((x) => (
                <button key={x} className={`pm-chip ${expires === x ? "active" : ""}`} onClick={() => setExpires(x)}>{x}</button>
              ))}
            </div>
            <label className="form-label">Business reason <span style={{ color: "#f04438" }}>*</span></label>
            <textarea className="form-control" rows={3} value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Payroll corridor commitment — KES 41M/mo volume" />
          </>
        )}
        {step === 3 && (
          <>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-kv"><span className="k">Customer</span><span className="v">{user ? `${user.name} · ${user.id}` : "—"}</span></div>
              <div className="pm-kv"><span className="k">Fee</span><span className="v">{feeId === "ALL" ? "All fees — full waiver" : `${fee.id} · ${fee.name}`}</span></div>
              <div className="pm-kv"><span className="k">Pricing</span><span className="v mono">{customRate}</span></div>
              <div className="pm-kv"><span className="k">Discount</span><span className="v">{discount}%</span></div>
              <div className="pm-kv"><span className="k">Segment / expiry</span><span className="v">{segment} · {expires}</span></div>
              <div className="pm-kv"><span className="k">Reason</span><span className="v" style={{ maxWidth: 280 }}>{reason || "—"}</span></div>
              <div className="pm-kv"><span className="k">Approver</span><span className="v">Jeckonia Kwasa · Tier 0</span></div>
            </div>
            <TwoFactorField value={code} onChange={setCode} />
          </>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}>Back</button>}
        {step < 3 && <button className="btn btn-primary btn-sm" disabled={(step === 0 && !user) || (step === 2 && reason.trim().length < 8)} onClick={() => setStep(step + 1)}>Next</button>}
        {step === 3 && (
          <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => {
            if (!user) return;
            const o: FeeOverride = {
              id: `OVR-${3102 + Math.floor(Math.random() * 80)}`,
              userId: user.id, userName: user.name, segment,
              feeId, feeName: feeId === "ALL" ? "All fees" : fee.name,
              standard: feeId === "ALL" ? "Standard rates" : rateLabel(fee),
              override: customRate, discountPct: discount, reason,
              grantedBy: "Jeckonia Kwasa", approvedBy: "Jeckonia Kwasa (self, Tier 0)",
              grantedAt: "Just now",
              expires: expires === "Never (Tier 0 only)" ? "Never" : expires === "One-off" ? "One-off" : `+${expires}`,
              status: "Active", monthlyValue: Math.round((fee.revenue30d / Math.max(1, fee.txns30d)) * 40),
            };
            onGrant(o);
            push({ kind: "success", title: `${o.id} granted`, body: `${o.userName} → ${o.override} on ${o.feeName}.` });
            close();
          }}>
            <i className="bi bi-check2 me-1" />Grant override
          </button>
        )}
      </div>
    </Modal>
  );
}

/* ================================================================
   9. Exemption request queue drawer
   ================================================================ */
export function ExemptionQueueDrawer({
  open, onClose, requests, onDecide,
}: {
  open: boolean;
  onClose: () => void;
  requests: ExemptionRequest[];
  onDecide: (r: ExemptionRequest, mode: "approve" | "deny") => void;
}) {
  if (!open && requests.length === 0) return null;
  return (
    <Drawer open={open} onClose={onClose} icon="bi-inbox-fill" tone="amber" title="Exemption & waiver requests"
      subtitle={`${requests.length} open · RM-submitted · SLA-tracked`}
      footer={<div className="pm-note w-100 mb-0"><i className="bi bi-stopwatch me-1" />Overdue requests page the Ops Manager after 2 hours and the Platform Admin after 6.</div>}>
      {requests.length === 0 ? (
        <EmptyState icon="bi-check2-circle" title="Queue clear" body="Every exemption request has been decided." />
      ) : requests.map((r) => (
        <div key={r.id} className={`pm-alert-row mb-2 ${r.sla.includes("Overdue") ? "crit" : r.risk === "Medium" ? "warn" : "info"}`}>
          <Avatar name={r.userName} size="sm" />
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span style={{ fontWeight: 700, fontSize: ".8rem" }}>{r.userName}</span>
              <Badge tone="grey">{r.segment}</Badge>
              {r.sla.includes("Overdue") && <Badge tone="red" dot>{r.sla}</Badge>}
            </div>
            <div className="pm-td-sub">{r.feeName} → <b>{r.ask}</b></div>
            <div className="pm-td-sub" style={{ fontStyle: "italic" }}>“{r.justification}”</div>
            <div className="pm-td-sub mono">{r.id} · RM {r.rm} · {r.submittedAt} · SLA {r.sla}</div>
          </div>
          <div className="text-end">
            <div className="pm-num" style={{ fontWeight: 700, fontSize: ".72rem" }}>{r.monthlyValue ? kes(r.monthlyValue, { compact: true }) : "KES 0"}</div>
            <div className="btn-group btn-group-sm mt-1">
              <button className="btn btn-outline-primary" style={{ fontSize: ".68rem" }} onClick={() => onDecide(r, "approve")}>
                <i className="bi bi-check2" />Approve
              </button>
              <button className="btn btn-outline-danger" style={{ fontSize: ".68rem" }} onClick={() => onDecide(r, "deny")}>
                <i className="bi bi-x" />Deny
              </button>
            </div>
          </div>
        </div>
      ))}
    </Drawer>
  );
}

/* ================================================================
   10. Exemption decision modal (approve / deny)
   ================================================================ */
export function ExemptionDecisionModal({
  request, mode, onClose, onConfirm,
}: {
  request: ExemptionRequest | null;
  mode: "approve" | "deny";
  onClose: () => void;
  onConfirm: (r: ExemptionRequest, note: string) => void;
}) {
  const { push } = useToast();
  const [note, setNote] = useState("");
  const [code, setCode] = useState("");
  if (!request) return null;
  return (
    <Modal open onClose={onClose} tone={mode === "approve" ? "green" : "red"} icon={mode === "approve" ? "bi-check2-circle" : "bi-x-octagon"} size="sm"
      title={mode === "approve" ? `Approve ${request.id}` : `Deny ${request.id}`}
      subtitle={`${request.userName} · ${request.feeName} → ${request.ask}`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Customer</span><span className="v">{request.userName} · {request.userId}</span></div>
          <div className="pm-kv"><span className="k">Value</span><span className="v">{kes(request.monthlyValue)} / mo</span></div>
          <div className="pm-kv"><span className="k">RM</span><span className="v">{request.rm}</span></div>
          <div className="pm-kv"><span className="k">Risk</span><span className="v"><Badge tone={request.risk === "Low" ? "green" : request.risk === "Medium" ? "amber" : "red"} dot>{request.risk}</Badge></span></div>
        </div>
        {mode === "approve" ? (
          <>
            <label className="form-label">Decision note</label>
            <textarea className="form-control mb-3" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Terms, expiry, conditions…" />
            <div className="pm-note mb-3">Approving creates an override record with 6-month expiry and notifies {request.rm}.</div>
            <TwoFactorField value={code} onChange={setCode} />
          </>
        ) : (
          <>
            <label className="form-label">Denial reason</label>
            <select className="form-select mb-3" value={note || "policy"} onChange={(e) => setNote(e.target.value)}>
              <option value="policy">Contravenes pricing policy</option>
              <option value="value">Insufficient volume commitment</option>
              <option value="risk">Risk / compliance concerns</option>
              <option value="budget">Revenue impact unacceptable</option>
              <option value="duplicate">Already covered by another override</option>
            </select>
            <div className="pm-note">{request.rm} receives the reason and can escalate to the Platform Admin.</div>
          </>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className={`btn btn-sm ${mode === "approve" ? "btn-primary" : "btn-danger"}`}
          disabled={mode === "approve" && code !== "482913"}
          onClick={() => {
            onConfirm(request, note);
            push({
              kind: mode === "approve" ? "success" : "info",
              title: mode === "approve" ? `${request.id} approved` : `${request.id} denied`,
              body: mode === "approve" ? `${request.userName} override created · ${request.rm} notified.` : `Reason sent to ${request.rm}.`,
            });
            onClose();
          }}>
          {mode === "approve" ? <><i className="bi bi-check2 me-1" />Approve & create override</> : <><i className="bi bi-x me-1" />Deny request</>}
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   11. Scheduled changes pipeline drawer
   ================================================================ */
export function ScheduledDrawer({
  open, onClose, changes, onApprove, onReject, onWithdraw, onViewFee,
}: {
  open: boolean;
  onClose: () => void;
  changes: ScheduledChange[];
  onApprove: (c: ScheduledChange) => void;
  onReject: (c: ScheduledChange) => void;
  onWithdraw: (c: ScheduledChange) => void;
  onViewFee: (feeId: string) => void;
}) {
  const [tab, setTab] = useState("Pending approval");
  const tabs = ["Pending approval", "Approved", "Scheduled", "Draft", "Rejected", "All"];
  const visible = tab === "All" ? changes : changes.filter((c) => c.status === tab);
  return (
    <Drawer open={open} onClose={onClose} wide icon="bi-calendar2-week" tone="amber" title="Scheduled fee changes"
      subtitle="Effective-dated pipeline · dual Tier-0 control · nothing applies instantly"
      footer={
        <button className="btn btn-outline-secondary btn-sm w-100" onClick={() => { csvDownload("scheduled-changes.csv", changes as unknown as Record<string, unknown>[]); }}>
          <i className="bi bi-download me-1" />Export pipeline
        </button>
      }>
      <div className="pm-tabs mb-3" style={{ borderBottom: 0 }}>
        {tabs.map((t) => (
          <button key={t} className={`pm-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t}
            <span className="cnt">{t === "All" ? changes.length : changes.filter((c) => c.status === t).length}</span>
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <EmptyState icon="bi-calendar-x" title={`No ${tab.toLowerCase()} changes`} body="Submit a fee change from any fee line to populate the pipeline." />
      ) : visible.map((c) => (
        <div key={c.id} className="pm-alert-row mb-2"
          style={{ borderLeftColor: c.status === "Pending approval" ? "#f79009" : c.status === "Rejected" ? "#f04438" : c.status === "Approved" || c.status === "Scheduled" ? "#12b76a" : "#98a2b3" }}>
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="mono" style={{ fontWeight: 700, fontSize: ".78rem" }}>{c.id}</span>
              <Badge tone={statusTone(c.status)} dot>{c.status}</Badge>
              <button className="btn btn-link btn-sm p-0" style={{ fontSize: ".74rem", fontWeight: 700 }} onClick={() => onViewFee(c.feeId)}>
                {c.feeName} <i className="bi bi-box-arrow-up-right" style={{ fontSize: ".62rem" }} />
              </button>
            </div>
            <div className="pm-td-sub mono">{c.current} → <b style={{ color: "var(--pm-ink)" }}>{c.proposed}</b></div>
            <div className="pm-td-sub">{c.impact}</div>
            <div className="pm-td-sub mono">Effective {c.effective} · {c.submittedBy} · {c.submittedAt}</div>
            {c.approvals.by && <div className="pm-td-sub" style={{ color: c.status === "Rejected" ? "#b42318" : "#0b8f52" }}>
              <i className="bi bi-person-check me-1" />{c.status === "Rejected" ? "Rejected" : "Approved"} by {c.approvals.by} · {c.approvals.at}
            </div>}
          </div>
          <div className="d-flex flex-column gap-1">
            {c.status === "Pending approval" && (
              <>
                <button className="btn btn-sm btn-primary" style={{ fontSize: ".7rem" }} onClick={() => onApprove(c)}><i className="bi bi-check2 me-1" />Approve</button>
                <button className="btn btn-sm btn-outline-danger" style={{ fontSize: ".7rem" }} onClick={() => onReject(c)}><i className="bi bi-x me-1" />Reject</button>
              </>
            )}
            {c.status === "Draft" && (
              <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".7rem" }} onClick={() => onApprove(c)}>Submit</button>
            )}
            {(c.status === "Approved" || c.status === "Scheduled") && (
              <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".7rem" }} onClick={() => onWithdraw(c)}>Withdraw</button>
            )}
          </div>
        </div>
      ))}
    </Drawer>
  );
}

/* ================================================================
   12. Approve scheduled change modal (2FA)
   ================================================================ */
export function ApproveChangeModal({ change, onClose, onDone }: { change: ScheduledChange | null; onClose: () => void; onDone: (c: ScheduledChange) => void }) {
  const { push } = useToast();
  const [code, setCode] = useState("");
  if (!change) return null;
  return (
    <Modal open onClose={onClose} tone="green" icon="bi-check2-circle" size="md"
      title={`Approve ${change.id}`} subtitle={`${change.feeName} · effective ${change.effective}`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Current</span><span className="v mono">{change.current}</span></div>
          <div className="pm-kv"><span className="k">Proposed</span><span className="v mono" style={{ color: "#0b8f52" }}>{change.proposed}</span></div>
          <div className="pm-kv"><span className="k">Impact</span><span className="v">{change.impact}</span></div>
          <div className="pm-kv"><span className="k">Submitted by</span><span className="v">{change.submittedBy} · {change.submittedAt}</span></div>
        </div>
        <div className="pm-note mb-3">
          <i className="bi bi-shield-fill-check me-1" style={{ color: "#0b8f52" }} />
          On approval this change is locked into the pricing engine with effective-dating. In-app notices are scheduled for affected users 7 days before it lands.
        </div>
        <TwoFactorField value={code} onChange={setCode} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => {
          onDone(change);
          push({ kind: "success", title: `${change.id} approved`, body: `${change.feeName} → ${change.proposed} lands ${change.effective}.` });
          onClose();
        }}>
          <i className="bi bi-check2 me-1" />Approve change
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   13. Reject scheduled change modal
   ================================================================ */
export function RejectChangeModal({ change, onClose, onDone }: { change: ScheduledChange | null; onClose: () => void; onDone: (c: ScheduledChange, reason: string) => void }) {
  const { push } = useToast();
  const [reason, setReason] = useState("revenue");
  const [note, setNote] = useState("");
  if (!change) return null;
  return (
    <Modal open onClose={onClose} tone="red" icon="bi-x-octagon" size="sm"
      title={`Reject ${change.id}`} subtitle={`${change.feeName} · ${change.current} → ${change.proposed}`}>
      <div className="pm-modal-body">
        <label className="form-label">Rejection reason</label>
        <select className="form-select mb-3" value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="revenue">Revenue impact unacceptable</option>
          <option value="competitiveness">Price above market</option>
          <option value="compliance">Regulatory / ODPC concern</option>
          <option value="elasticity">Volume risk too high</option>
          <option value="timing">Wrong effective window</option>
          <option value="other">Other — note below</option>
        </select>
        <label className="form-label">Note to {change.submittedBy}</label>
        <textarea className="form-control" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What would make this change approvable?" />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger btn-sm" onClick={() => {
          onDone(change, reason);
          push({ kind: "info", title: `${change.id} rejected`, body: `${change.submittedBy} notified with reason.` });
          onClose();
        }}>
          <i className="bi bi-x me-1" />Reject change
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   14. Deactivate fee modal (2FA)
   ================================================================ */
export function DeactivateFeeModal({ fee, onClose, onDone }: { fee: FeeSchedule | null; onClose: () => void; onDone: (f: FeeSchedule) => void }) {
  const { push } = useToast();
  const [reason, setReason] = useState("policy");
  const [notify, setNotify] = useState(true);
  const [code, setCode] = useState("");
  if (!fee) return null;
  return (
    <Modal open onClose={onClose} tone="red" icon="bi-slash-circle" size="sm"
      title={`Deactivate ${fee.id}`} subtitle={`${fee.name} · currently ${rateLabel(fee)}`}>
      <div className="pm-modal-body">
        <div className="pm-alert-row crit mb-3">
          <i className="bi bi-exclamation-triangle-fill" style={{ color: "#f04438" }} />
          <div style={{ fontSize: ".78rem" }}>
            This stops all fee accrual immediately. {num(fee.txns30d)} monthly transactions will become free until re-priced. Revenue at risk: <b>{kes(fee.revenue30d, { compact: true })}/mo</b>.
          </div>
        </div>
        <label className="form-label">Reason</label>
        <select className="form-select mb-3" value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="policy">Policy change — service becomes free</option>
          <option value="regulatory">Regulator instruction</option>
          <option value="incident">Pricing incident / misconfiguration</option>
          <option value="sunset">Product sunset</option>
        </select>
        <label className="pm-opt mb-3">
          <input type="checkbox" className="form-check-input mt-0" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
          <span className="flex-grow-1"><b style={{ fontSize: ".84rem" }}>Notify affected users</b>
            <span className="d-block pm-td-sub">In-app + SMS blast to active users of this fee line</span></span>
        </label>
        <TwoFactorField value={code} onChange={setCode} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger btn-sm" disabled={code !== "482913"} onClick={() => {
          onDone(fee);
          push({ kind: "warn", title: `${fee.id} deactivated`, body: notify ? "User notification blast queued." : "Users not notified." });
          onClose();
        }}>
          <i className="bi bi-slash-circle me-1" />Deactivate fee
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   15. Export modal
   ================================================================ */
export function FeeExportModal({ open, onClose, rows }: { open: boolean; onClose: () => void; rows: FeeSchedule[] }) {
  const { push } = useToast();
  const [fmt, setFmt] = useState("csv");
  const [scope, setScope] = useState("filtered");
  if (!open) return null;
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-download" size="sm"
      title="Export fee schedule" subtitle={`${num(rows.length)} fee lines · watermarked · written to audit log`}>
      <div className="pm-modal-body">
        <label className="form-label">Format</label>
        <div className="d-flex gap-1 mb-3">
          {["csv", "json", "xlsx"].map((f) => <button key={f} className={`pm-chip ${fmt === f ? "active" : ""}`} onClick={() => setFmt(f)}>{f.toUpperCase()}</button>)}
        </div>
        <label className="form-label">Scope</label>
        <div className="d-flex gap-1 mb-3">
          {[["filtered", "Current view"], ["all", "All 20 schedules"], ["active", "Active only"]].map(([v, l]) => (
            <button key={v} className={`pm-chip ${scope === v ? "active" : ""}`} onClick={() => setScope(v)}>{l}</button>
          ))}
        </div>
        <div className="pm-note">
          <i className="bi bi-water me-1" />
          Exports carry the requester's ID, timestamp and IP in a header row. Finance-model friendly — includes revenue, volume and effective rate columns.
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => {
          const data = (scope === "active" ? rows.filter((r) => r.status === "Active") : scope === "all" ? FEE_SCHEDULES : rows)
            .map((r) => ({ id: r.id, name: r.name, category: r.category, method: r.method, rate: r.rate, fixed: r.fixed, min: r.minFee, max: r.maxFee, tax: r.taxTreatment, revenue30d: r.revenue30d, txns30d: r.txns30d, effectiveRate: r.effectiveRate, status: r.status, lastChanged: r.lastChanged }));
          if (fmt === "json") jsonDownload("fee-schedule.json", data);
          else csvDownload(`fee-schedule.${fmt === "xlsx" ? "csv" : fmt}`, data as unknown as Record<string, unknown>[]);
          push({ kind: "success", title: "Fee schedule exported", body: `${data.length} lines · ${fmt.toUpperCase()} · audit event AUD-91205.` });
          onClose();
        }}>
          <i className="bi bi-download me-1" />Download
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   16. Advanced filter drawer
   ================================================================ */
export type FeeFilters = {
  q: string; category: string; method: string; status: string; appliesTo: string; minRevenue: number;
};
export const EMPTY_FEE_FILTERS: FeeFilters = { q: "", category: "all", method: "all", status: "all", appliesTo: "all", minRevenue: 0 };

export function FeeFilterDrawer({
  open, filters, onClose, onApply,
}: { open: boolean; filters: FeeFilters; onClose: () => void; onApply: (f: FeeFilters) => void }) {
  const [f, setF] = useState(filters);
  return (
    <Drawer open={open} onClose={onClose} icon="bi-funnel-fill" tone="blue" title="Filter fee schedule"
      subtitle="Category, method, status, scope and revenue floor"
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => { setF(EMPTY_FEE_FILTERS); onApply(EMPTY_FEE_FILTERS); }}>Clear all</button>
          <button className="btn btn-primary btn-sm" onClick={() => { onApply(f); onClose(); }}>Apply</button>
        </>
      }>
      <div className="d-flex flex-column gap-3">
        <div>
          <label className="form-label">Category</label>
          <select className="form-select" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
            <option value="all">All categories</option>
            {["P2P & Wallet", "Cash & Agents", "Cards", "FX & Global", "Bills & Utilities", "Lending", "Banking", "Platform"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Calculation method</label>
          <select className="form-select" value={f.method} onChange={(e) => setF({ ...f, method: e.target.value })}>
            <option value="all">All methods</option>
            {["Percentage", "Flat", "Tiered", "Hybrid", "Free"].map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Status</label>
          <select className="form-select" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
            <option value="all">All statuses</option>
            {["Active", "Scheduled", "Draft", "Inactive"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Applies to</label>
          <select className="form-select" value={f.appliesTo} onChange={(e) => setF({ ...f, appliesTo: e.target.value })}>
            <option value="all">Any scope</option>
            <option value="All users">All users</option>
            <option value="tiered">Tiered by volume</option>
            <option value="business">Business accounts</option>
            <option value="vip">VIP tiers</option>
          </select>
        </div>
        <div>
          <label className="form-label">Minimum revenue (30d) — {f.minRevenue === 0 ? "any" : kes(f.minRevenue, { compact: true })}</label>
          <input type="range" className="form-range" min={0} max={40_000_000} step={500_000} value={f.minRevenue} onChange={(e) => setF({ ...f, minRevenue: Number(e.target.value) })} />
        </div>
      </div>
    </Drawer>
  );
}

/* ================================================================
   17. Partner fee sharing drawer
   ================================================================ */
export function PartnersDrawer({
  open, onClose, partners, onEdit,
}: { open: boolean; onClose: () => void; partners: PartnerShare[]; onEdit: (p: PartnerShare) => void }) {
  const total = partners.reduce((s, p) => s + p.value30d, 0);
  return (
    <Drawer open={open} onClose={onClose} wide icon="bi-handshake" tone="violet" title="Partner fee sharing"
      subtitle={`${partners.length} agreements · ${kes(total, { compact: true })} shared out (30d)`}
      footer={<button className="btn btn-outline-secondary btn-sm w-100" onClick={() => csvDownload("partner-shares.csv", partners as unknown as Record<string, unknown>[])}>
        <i className="bi bi-download me-1" />Export agreements
      </button>}>
      {partners.map((p) => (
        <div key={p.id} className="pm-alert-row mb-2" style={{ borderLeftColor: p.status === "Active" ? "#7a5af8" : p.status === "Renegotiating" ? "#f79009" : "#f04438" }}>
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span style={{ fontWeight: 700, fontSize: ".8rem" }}>{p.partner}</span>
              <Badge tone={statusTone(p.status)} dot>{p.status}</Badge>
            </div>
            <div className="pm-td-sub">{p.feeType} · {p.settlement} settlement · review {p.nextReview}</div>
            <div className="d-flex align-items-center gap-2 mt-1">
              <span className="pm-td-sub">PayMo {p.paymoShare}%</span>
              <Meter value={p.paymoShare} tone="#7a5af8" width={110} />
              <span className="pm-td-sub">{p.partnerShare}% partner</span>
            </div>
          </div>
          <div className="text-end">
            <div className="pm-num" style={{ fontWeight: 700, fontSize: ".76rem" }}>{p.value30d ? kes(p.value30d, { compact: true }) : "—"}</div>
            <button className="btn btn-sm btn-outline-secondary mt-1" style={{ fontSize: ".68rem" }} onClick={() => onEdit(p)}>
              <i className="bi bi-sliders me-1" />Split
            </button>
          </div>
        </div>
      ))}
    </Drawer>
  );
}

/* ================================================================
   18. Partner split editor modal (2FA)
   ================================================================ */
export function PartnerShareModal({ partner, onClose, onDone }: { partner: PartnerShare | null; onClose: () => void; onDone: (p: PartnerShare, split: number) => void }) {
  const { push } = useToast();
  const [split, setSplit] = useState(partner?.paymoShare ?? 60);
  const [code, setCode] = useState("");
  if (!partner) return null;
  return (
    <Modal open onClose={onClose} tone="violet" icon="bi-sliders" size="sm"
      title={`Split — ${partner.partner}`} subtitle={`${partner.feeType} · ${partner.settlement} settlement · currently ${partner.paymoShare}/${partner.partnerShare}`}>
      <div className="pm-modal-body">
        <div className="pm-bar-track mb-2">
          <div style={{ width: `${split}%`, background: "#7a5af8" }} />
          <div style={{ width: `${100 - split}%`, background: "#e6e9f0" }} />
        </div>
        <div className="d-flex justify-content-between mb-3" style={{ fontSize: ".78rem", fontWeight: 700 }}>
          <span style={{ color: "#5925dc" }}>PayMo {split}%</span>
          <span style={{ color: "var(--pm-muted)" }}>{partner.partner.replace(/ \(.*\)/, "")} {100 - split}%</span>
        </div>
        <input type="range" className="form-range mb-3" min={20} max={95} value={split} onChange={(e) => setSplit(Number(e.target.value))} />
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">PayMo share value</span><span className="v mono">{kes(Math.round(partner.value30d * split / Math.max(1, partner.paymoShare)), { compact: true })} / 30d</span></div>
          <div className="pm-kv"><span className="k">Contract review</span><span className="v">{partner.nextReview}</span></div>
        </div>
        <TwoFactorField value={code} onChange={setCode} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => {
          onDone(partner, split);
          push({ kind: "success", title: "Split updated", body: `${partner.partner} → ${split}/${100 - split}. Legal notified for contract addendum.` });
          onClose();
        }}>
          <i className="bi bi-check2 me-1" />Update split
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   19. Bulk fee actions modal
   ================================================================ */
export function BulkFeesModal({
  open, count, onClose, onDone,
}: { open: boolean; count: number; onClose: () => void; onDone: (action: string) => void }) {
  const [action, setAction] = useState("export");
  const [code, setCode] = useState("");
  const needs2fa = action === "deactivate" || action === "clone";
  if (!open) return null;
  return (
    <Modal open onClose={onClose} tone="amber" icon="bi-check2-square" size="md"
      title={`Bulk action on ${count} fee lines`} subtitle="Atomic batch reference · one audit event per line">
      <div className="pm-modal-body">
        <div className="d-flex flex-column gap-2 mb-3">
          {[
            ["export", "Export selection", "bi-download"],
            ["clone", "Clone to draft", "bi-copy"],
            ["schedule", "Queue fee change", "bi-calendar2-plus"],
            ["deactivate", "Deactivate (2FA)", "bi-slash-circle"],
          ].map(([id, l, i]) => (
            <button key={id} className={`pm-opt ${action === id ? "active" : ""}`} onClick={() => setAction(id)}>
              <span className="r" /><i className={`bi ${i}`} style={{ color: "#b54708" }} />
              <span style={{ fontWeight: 700, fontSize: ".85rem" }}>{l}</span>
            </button>
          ))}
        </div>
        {needs2fa && <TwoFactorField value={code} onChange={setCode} />}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={needs2fa && code !== "482913"} onClick={() => { onDone(action); onClose(); }}>
          Apply to {count}
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   20. Fee change history modal (audit timeline)
   ================================================================ */
export function FeeHistoryModal({ fee, onClose }: { fee: FeeSchedule | null; onClose: () => void }) {
  const { push } = useToast();
  if (!fee) return null;
  const events = [
    { t: fee.lastChanged, who: fee.changedBy, what: fee.lastChanged === "—" ? "Live since launch — no changes" : `Set to ${rateLabel(fee)}`, tone: "done" },
    { t: "12 Jun 2026", who: "Sarah Kamau", what: "Reviewed — no change (competitor benchmark attached)", tone: "done" },
    { t: "28 Feb 2026", who: "David Kiplagat", what: `Competitor scan: PayMo ${fee.rate || fee.fixed}% vs market ${fee.competitor || "n/a"}%`, tone: "done" },
    { t: "15 Nov 2025", who: "Jeckonia Kwasa", what: "Excise duty pass-through modelled into tax treatment", tone: "done" },
    { t: "01 Sep 2025", who: "System", what: "Fee line migrated to pricing-engine v3 (effective-dated)", tone: "done" },
    ...FEE_AUDIT.filter((a) => a.target.includes(fee.id) || a.target.includes(fee.name.split(" ")[0])).map((a) => ({
      t: a.time, who: a.admin, what: `${a.action} — ${a.detail}`, tone: "warn",
    })),
  ];
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-clock-history" size="md"
      title={`Change history — ${fee.name}`} subtitle={`${fee.id} · full audit retained 7 years (CBK RP7)`}>
      <div className="pm-modal-body">
        <div className="pm-timeline">
          {events.map((e, i) => (
            <div key={i} className={`pm-tl-item ${e.tone}`}>
              <div style={{ fontWeight: 700, fontSize: ".8rem" }}>{e.what}</div>
              <div className="pm-td-sub">{e.t} · {e.who}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => {
          csvDownload(`${fee.id}-history.csv`, events.map((e) => ({ time: e.t, actor: e.who, event: e.what })));
          push({ kind: "success", title: "History exported" });
        }}>
          <i className="bi bi-download me-1" />Export history
        </button>
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   21. Revenue forecast modal
   ================================================================ */
export function ForecastModal({
  open, onClose, forecasts,
}: { open: boolean; onClose: () => void; forecasts: { feeName: string; current: number; nextMonth: number; threeMonth: number; driver: string }[] }) {
  if (!open) return null;
  const total = (k: "current" | "nextMonth" | "threeMonth") => forecasts.reduce((s, f) => s + f[k], 0);
  return (
    <Modal open onClose={onClose} tone="green" icon="bi-graph-up-arrow" size="lg"
      title="Fee revenue forecast" subtitle="Elasticity-adjusted projection · recalculated nightly by the pricing engine">
      <div className="pm-modal-body">
        <div className="row g-2 mb-3">
          {[
            { l: "Current month", v: kes(total("current"), { compact: true }), c: "var(--pm-ink)" },
            { l: "Next month (proj)", v: kes(total("nextMonth"), { compact: true }), c: "#0b8f52" },
            { l: "+3 months (proj)", v: kes(total("threeMonth"), { compact: true }), c: "#0b8f52" },
            { l: "Growth", v: `+${(((total("threeMonth") - total("current")) / total("current")) * 100).toFixed(1)}%`, c: "#0b8f52" },
          ].map((x) => (
            <div className="col-6 col-lg-3" key={x.l}>
              <div className="pm-stat">
                <div className="pm-stat-label">{x.l}</div>
                <div className="pm-stat-value" style={{ color: x.c, fontSize: "1.1rem" }}>{x.v}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="pm-card pm-table-wrap">
          <table className="pm-table">
            <thead>
              <tr><th>Fee family</th><th className="text-end">Current</th><th className="text-end">Next month</th><th className="text-end">+3 months</th><th>Driver</th></tr>
            </thead>
            <tbody>
              {forecasts.map((f) => (
                <tr key={f.feeName}>
                  <td className="pm-td-strong">{f.feeName}</td>
                  <td className="text-end pm-num">{kes(f.current, { compact: true })}</td>
                  <td className="text-end pm-num">{kes(f.nextMonth, { compact: true })}</td>
                  <td className="text-end pm-num" style={{ color: f.threeMonth >= f.current ? "#0b8f52" : "#b42318", fontWeight: 700 }}>
                    {kes(f.threeMonth, { compact: true })}
                  </td>
                  <td className="pm-td-sub">{f.driver}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => csvDownload("fee-forecast.csv", forecasts)}>
          <i className="bi bi-download me-1" />Export forecast
        </button>
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   22. Simulator scenario library modal (pop-up)
   ================================================================ */
export function ScenarioLibraryModal({
  open, onClose, scenarios, onRun,
}: {
  open: boolean;
  onClose: () => void;
  scenarios: { id: string; name: string; detail: string; currentRevenue: number; projectedRevenue: number; users: number; avgSaving: number; sentiment: string }[];
  onRun: () => void;
}) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} tone="violet" icon="bi-collection" size="lg"
      title="Saved pricing scenarios" subtitle="Board-review library — run any scenario in the simulator">
      <div className="pm-modal-body">
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead>
              <tr><th>Scenario</th><th className="text-end">Current</th><th className="text-end">Projected</th><th className="text-end">Impact</th><th className="text-end">Users</th><th className="text-end">Avg Δ/user</th></tr>
            </thead>
            <tbody>
              {scenarios.map((s) => {
                const delta = s.projectedRevenue - s.currentRevenue;
                return (
                  <tr key={s.id}>
                    <td>
                      <span className="pm-td-strong">{s.name}</span>
                      <div className="pm-td-sub">{s.detail} · {s.id}</div>
                    </td>
                    <td className="text-end pm-num">{kes(s.currentRevenue, { compact: true })}</td>
                    <td className="text-end pm-num">{kes(s.projectedRevenue, { compact: true })}</td>
                    <td className="text-end pm-num" style={{ color: delta >= 0 ? "#0b8f52" : "#b42318", fontWeight: 700 }}>
                      {delta >= 0 ? "+" : "−"}{kes(Math.abs(delta), { compact: true })}
                    </td>
                    <td className="text-end pm-num">{num(s.users)}</td>
                    <td className="text-end pm-num" style={{ color: s.avgSaving >= 0 ? "#0b8f52" : "#b42318" }}>
                      {s.avgSaving >= 0 ? "▲" : "▼"} KES {Math.abs(s.avgSaving).toFixed(1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => csvDownload("pricing-scenarios.csv", scenarios)}>
          <i className="bi bi-download me-1" />Export library
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => { onClose(); onRun(); }}>
          <i className="bi bi-calculator me-1" />Open simulator
        </button>
      </div>
    </Modal>
  );
}

/* ============================ 23. Fee analytics modal ============================ */
export function FeeAnalyticsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const stats = [
    { label: "Total revenue today", value: "KES 24.8M", color: "#12b76a" },
    { label: "Active fee lines", value: "47", color: "#2e90fa" },
    { label: "Pending changes", value: "5", color: "#f79009" },
    { label: "Overrides active", value: "12", color: "#7a5af8" },
    { label: "Avg take rate", value: "0.67%", color: "#12b76a" },
    { label: "Exemptions pending", value: "8", color: "#ee46bc" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-graph-up" tone="blue" title="Fee analytics" subtitle="Revenue and fee performance metrics">
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

/* ============================ 24. Fee comparison modal ============================ */
export function FeeCompareModal({ fees, onClose }: { fees: FeeSchedule[]; onClose: () => void }) {
  if (fees.length < 2) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-arrow-left-right" tone="blue" title="Compare fees" subtitle="Side-by-side comparison">
      <div className="pm-card pm-table-wrap">
        <table className="pm-table">
          <thead><tr><th>Field</th><th>{fees[0].name}</th><th>{fees[1].name}</th></tr></thead>
          <tbody>
            {["category", "rate", "model", "min", "max", "status"].map((k) => (
              <tr key={k}><td className="pm-td-strong">{k}</td><td>{String(fees[0][k as keyof FeeSchedule])}</td><td>{String(fees[1][k as keyof FeeSchedule])}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </Drawer>
  );
}

/* ============================ 25. Fee insights modal ============================ */
export function FeeInsightsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const insights = [
    { icon: "bi-graph-up", title: "Revenue trending up", detail: "8% increase in fee revenue vs last month", tone: "green" },
    { icon: "bi-exclamation-triangle", title: "Override volume elevated", detail: "12 active overrides, 3 above threshold", tone: "amber" },
    { icon: "bi-check-circle", title: "Take rate stable", detail: "0.67% average, within target range", tone: "green" },
    { icon: "bi-clock-history", title: "Change pipeline full", detail: "5 pending changes, 2 awaiting approval", tone: "amber" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-lightbulb" tone="blue" title="Fee insights" subtitle="AI-powered analysis">
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

/* ============================ 26. Fee forecast modal ============================ */
export function FeeForecastModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const forecast = [
    { month: "Sep 2026", revenue: 8900000, growth: "+5.2%" },
    { month: "Oct 2026", revenue: 9200000, growth: "+3.4%" },
    { month: "Nov 2026", revenue: 9500000, growth: "+3.3%" },
    { month: "Dec 2026", revenue: 10100000, growth: "+6.3%" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-calendar-range" tone="blue" title="Revenue forecast" subtitle="Next 4 months projection">
      <div className="d-flex flex-column gap-2">
        {forecast.map((f) => (
          <div key={f.month} className="pm-card pm-card-pad d-flex align-items-center justify-content-between">
            <div><div style={{ fontWeight: 700, fontSize: ".88rem" }}>{f.month}</div></div>
            <div className="text-end"><div style={{ fontWeight: 800, fontSize: ".95rem" }}>{kes(f.revenue, { compact: true })}</div>
              <div style={{ fontSize: ".72rem", color: "#12b76a" }}>{f.growth}</div></div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 27. Override history modal ============================ */
export function OverrideHistoryModal({ fee, onClose }: { fee: FeeSchedule | null; onClose: () => void }) {
  if (!fee) return null;
  const history = [
    { date: "22 Aug 2026", user: "Mary Wanjiku", type: "Exemption", duration: "12 months" },
    { date: "18 Aug 2026", user: "John Kipchoge", type: "Discount", duration: "6 months" },
    { date: "10 Aug 2026", user: "Amina Hassan", type: "Waiver", duration: "3 months" },
  ];
  return (
    <Drawer open onClose={onClose} icon="bi-clock-history" tone="blue" title="Override history" subtitle={fee.name}>
      <div className="d-flex flex-column gap-2">
        {history.map((h, i) => (
          <div key={i} className="pm-card pm-card-pad d-flex align-items-center gap-3">
            <i className="bi bi-person" style={{ color: "#2e90fa" }} />
            <div className="flex-grow-1"><div style={{ fontWeight: 700, fontSize: ".84rem" }}>{h.user}</div><div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{h.type} · {h.duration} · {h.date}</div></div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 28. Partner split detail modal ============================ */
export function PartnerSplitDetailModal({ partner, onClose }: { partner: { partner: string; split: number; revenue: number } | null; onClose: () => void }) {
  if (!partner) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-people" tone="blue" title="Partner split" subtitle={partner.partner}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Partner</span><span className="v">{partner.partner}</span></div>
        <div className="pm-kv"><span className="k">Split</span><span className="v pm-num" style={{ fontWeight: 700 }}>{partner.split}%</span></div>
        <div className="pm-kv"><span className="k">Revenue share</span><span className="v pm-num">{kes(partner.revenue, { compact: true })}</span></div>
        <div className="pm-kv"><span className="k">Last updated</span><span className="v">15 Aug 2026</span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 29. Fee simulation result modal ============================ */
export function SimulationResultModal({ result, onClose }: { result: { fee: string; current: number; proposed: number; impact: number } | null; onClose: () => void }) {
  if (!result) return null;
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-calculator" size="md" title="Simulation result" subtitle={result.fee}>
      <div className="pm-modal-body">
        <div className="row g-2 mb-3">
          <div className="col-4"><div className="pm-stat"><div className="pm-stat-label">Current</div><div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1rem" }}>{result.current}%</div></div></div>
          <div className="col-4"><div className="pm-stat"><div className="pm-stat-label">Proposed</div><div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1rem", color: "#2e90fa" }}>{result.proposed}%</div></div></div>
          <div className="col-4"><div className="pm-stat"><div className="pm-stat-label">Impact</div><div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1rem", color: result.impact > 0 ? "#12b76a" : "#f04438" }}>{result.impact > 0 ? "+" : ""}{result.impact}%</div></div></div>
        </div>
        <div className="pm-note"><i className="bi bi-info-circle me-1" />Projected annual impact: {kes(Math.abs(result.impact) * 124000)}</div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-primary btn-sm" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 30. Fee policy modal ============================ */
export function FeePolicyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const policies = [
    { label: "Max single fee", value: "KES 50,000", icon: "bi-cash-stack" },
    { label: "Monthly cap per user", value: "KES 500,000", icon: "bi-person" },
    { label: "Minimum fee", value: "KES 10", icon: "bi-arrow-down" },
    { label: "Change notice period", value: "30 days", icon: "bi-clock-history" },
    { label: "Override approval tier", value: "Tier 0", icon: "bi-shield-lock" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-gear" tone="blue" title="Fee policy" subtitle="Current configuration">
      <div className="d-flex flex-column gap-2">
        {policies.map((p) => (
          <div key={p.label} className="pm-card pm-card-pad d-flex align-items-center gap-3">
            <i className={`bi ${p.icon}`} style={{ color: "#2e90fa", fontSize: "1.1rem" }} />
            <div className="flex-grow-1"><div style={{ fontWeight: 700, fontSize: ".84rem" }}>{p.label}</div></div>
            <span style={{ fontWeight: 700, fontSize: ".88rem" }}>{p.value}</span>
          </div>
        ))}
      </div>
    </Drawer>
  );
}
