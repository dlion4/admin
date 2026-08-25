import { useState } from "react";
import { Badge, Drawer, EmptyState, Meter, Modal, Steps, TwoFactorField, useToast } from "../../../components/ui";
import { csvDownload, jsonDownload, kes, num } from "../../../lib/format";
import type { ForecastRow, LiquidityAlert, LiquidityPool, PoolTransfer, SweepRule } from "../data/liquidityData";
import { ACTIVITY, CASHFLOW, POOL_ACTIONS, RESERVES } from "../data/liquidityData";

export const healthTone = (h: string) =>
  h === "Healthy" ? "green" : h === "Monitor" ? "amber" : h === "Low" ? "red" : h === "Frozen" ? "red" : "grey";

/* ================================================================
   1. Pool detail drawer
   ================================================================ */
export function PoolDetailDrawer({
  pool, onClose, onTransfer, onTopUp, onWithdraw, onFreeze, onThresholds, onReserve,
}: {
  pool: LiquidityPool | null;
  onClose: () => void;
  onTransfer: (p: LiquidityPool) => void;
  onTopUp: (p: LiquidityPool) => void;
  onWithdraw: (p: LiquidityPool) => void;
  onFreeze: (p: LiquidityPool) => void;
  onThresholds: () => void;
  onReserve: (p: LiquidityPool) => void;
}) {
  if (!pool) return null;
  const avail = pool.balance - pool.reserved;
  const movements = ACTIVITY.filter((a) => a.pool === pool.name).slice(0, 5);
  return (
    <Drawer open onClose={onClose} wide icon={pool.icon} tone={pool.health === "Frozen" ? "red" : pool.health === "Monitor" ? "amber" : pool.health === "Locked" ? "ink" : "green"}
      title={pool.name} subtitle={`${pool.id} · ${pool.purpose}`}
      headExtra={<Badge tone={healthTone(pool.health)} dot>{pool.health}</Badge>}
      footer={
        pool.locked ? (
          <>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => onReserve(pool)}><i className="bi bi-shield-check me-1" />Reserve policy</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={onThresholds}><i className="bi bi-bell me-1" />Thresholds</button>
            <div className="pm-note flex-grow-1 mb-0">
              <i className="bi bi-lock me-1" />Locked pool — release requires dual key + board quorum.
            </div>
          </>
        ) : (
          <>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => onWithdraw(pool)}><i className="bi bi-box-arrow-up me-1" />Withdraw</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => onTopUp(pool)}><i className="bi bi-plus-circle me-1" />Top up</button>
            <button className={`btn btn-sm ${pool.health === "Frozen" ? "btn-outline-secondary" : "btn-outline-danger"}`} onClick={() => onFreeze(pool)}>
              <i className={`bi ${pool.health === "Frozen" ? "bi-unlock" : "bi-snow"} me-1`} />{pool.health === "Frozen" ? "Unfreeze" : "Freeze"}
            </button>
            <button className="btn btn-primary btn-sm flex-grow-1" onClick={() => onTransfer(pool)}>
              <i className="bi bi-arrow-left-right me-1" />Transfer funds
            </button>
          </>
        )
      }>
      <div className="pm-card pm-card-pad mb-3">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <div className="pm-eyebrow">Pool balance</div>
            <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1.6rem" }}>{kes(pool.balance, { compact: true })}</div>
            <div style={{ fontSize: ".75rem", color: "var(--pm-muted)" }}>
              reserved {kes(pool.reserved, { compact: true })} · available <b style={{ color: "#0b8f52" }}>{kes(avail, { compact: true })}</b>
            </div>
          </div>
          <div className="text-end">
            <Badge tone={pool.trend === "up" ? "green" : pool.trend === "down" ? "red" : "grey"}>
              <i className={`bi ${pool.trend === "up" ? "bi-graph-up-arrow" : pool.trend === "down" ? "bi-graph-down-arrow" : "bi-arrow-right"}`} /> {pool.trend}
            </Badge>
            <div className="mt-1" style={{ fontSize: ".7rem", color: "var(--pm-muted)" }}>{num(pool.movements24h)} movements / 24h</div>
          </div>
        </div>
        <div className="mt-3">
          <div className="d-flex justify-content-between mb-1"><span className="pm-eyebrow mb-0">Utilisation</span><span style={{ fontWeight: 800 }}>{pool.utilisation}%</span></div>
          <Meter value={pool.utilisation} tone={pool.utilisation > 85 ? "#f04438" : pool.utilisation > 75 ? "#f79009" : "#12b76a"} width={999} />
          <div className="pm-td-sub mt-1">Reserve floor {pool.reserveRatio}% · low-balance alert at {kes(pool.lowThreshold, { compact: true })}</div>
        </div>
      </div>

      <div className="row g-2 mb-3">
        {[
          { l: "Last top-up", v: pool.lastTopUp },
          { l: "Alert threshold", v: kes(pool.lowThreshold, { compact: true }) },
          { l: "Notifications", v: pool.notify.replace(" + ", " · ") },
          { l: "Movements (24h)", v: num(pool.movements24h) },
        ].map((x) => (
          <div className="col-6" key={x.l}>
            <div className="pm-stat">
              <div className="pm-stat-label">{x.l}</div>
              <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: ".9rem" }}>{x.v}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-eyebrow mb-2">Reserve compliance</div>
        <div className="pm-kv"><span className="k">Minimum reserve ratio</span><span className="v">{pool.reserveRatio}%</span></div>
        <div className="pm-kv"><span className="k">Reserve held</span><span className="v mono">{kes(pool.reserved)}</span></div>
        <div className="pm-kv"><span className="k">Free-to-move</span><span className="v mono" style={{ color: "#0b8f52" }}>{kes(avail)}</span></div>
        <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone={healthTone(pool.health)} dot>{pool.health}</Badge></span></div>
      </div>

      <div className="pm-card pm-card-pad">
        <div className="pm-eyebrow mb-2">Recent movements</div>
        {movements.length ? movements.map((m) => (
          <div className="pm-kv" key={m.id}>
            <span className="k">{m.time} · {m.action}</span>
            <span className="v mono" style={{ color: m.amount === 0 ? "var(--pm-muted)" : m.amount > 0 ? "#0b8f52" : "#b42318" }}>
              {m.amount === 0 ? "—" : `${m.amount > 0 ? "+" : ""}${kes(m.amount, { compact: true })}`}
            </span>
          </div>
        )) : <div className="pm-td-sub">No movements in the current window.</div>}
      </div>
    </Drawer>
  );
}

/* ================================================================
   2. Pool transfer wizard
   ================================================================ */
export function TransferWizard({
  open, pools, source, onClose, onDone,
}: {
  open: boolean;
  pools: LiquidityPool[];
  source: LiquidityPool | null;
  onClose: () => void;
  onDone: (fromId: string, toId: string, amount: number, reason: string) => void;
}) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [fromId, setFromId] = useState(source?.id ?? "POOL-01");
  const [toId, setToId] = useState("POOL-03");
  const [amount, setAmount] = useState(5_000_000);
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  const from = pools.find((p) => p.id === fromId) ?? pools[0];
  const to = pools.find((p) => p.id === toId) ?? pools[1];
  const movable = pools.filter((p) => !p.locked && p.health !== "Frozen");
  const steps = [
    { label: "Source", icon: "bi-box-arrow-right" },
    { label: "Destination", icon: "bi-box-arrow-in-right" },
    { label: "Review", icon: "bi-calculator" },
    { label: "2FA", icon: "bi-shield-lock" },
  ];
  const close = () => { setStep(0); setCode(""); setReason(""); onClose(); };
  if (!open) return null;
  const fromAvail = from.balance - from.reserved;
  const overdraw = amount > fromAvail;
  return (
    <Modal open onClose={close} tone="green" icon="bi-arrow-left-right" size="lg"
      title="Transfer between pools" subtitle="Inter-pool movement · reserve floors enforced · Finance Manager approval">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <>
            <label className="form-label">Source pool</label>
            <div className="d-flex flex-column gap-2">
              {movable.map((p) => (
                <button key={p.id} className={`pm-opt ${fromId === p.id ? "active" : ""}`} onClick={() => setFromId(p.id)}>
                  <span className="r" /><i className={`bi ${p.icon}`} style={{ color: p.color }} />
                  <span className="flex-grow-1">
                    <span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>{p.name}</span>
                    <span className="d-block pm-td-sub mono">free {kes(p.balance - p.reserved, { compact: true })} of {kes(p.balance, { compact: true })}</span>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <label className="form-label">Destination pool</label>
            <div className="d-flex flex-column gap-2 mb-3">
              {movable.filter((p) => p.id !== fromId).map((p) => (
                <button key={p.id} className={`pm-opt ${toId === p.id ? "active" : ""}`} onClick={() => setToId(p.id)}>
                  <span className="r" /><i className={`bi ${p.icon}`} style={{ color: p.color }} />
                  <span className="flex-grow-1">
                    <span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>{p.name}</span>
                    <span className="d-block pm-td-sub mono">balance {kes(p.balance, { compact: true })} · util {p.utilisation}%</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="row g-2">
              <div className="col-6">
                <label className="form-label">Amount (KES)</label>
                <input type="number" className="form-control mono" value={amount} step={500_000} onChange={(e) => setAmount(Number(e.target.value))} />
              </div>
              <div className="col-6">
                <label className="form-label">Quick amounts</label>
                <div className="d-flex gap-1 flex-wrap">
                  {[5, 10, 15, 20].map((m) => (
                    <button key={m} className="pm-chip" onClick={() => setAmount(m * 1_000_000)}>{m}M</button>
                  ))}
                </div>
              </div>
            </div>
            {overdraw && (
              <div className="pm-alert-row crit mt-3">
                <i className="bi bi-exclamation-triangle-fill" style={{ color: "#f04438" }} />
                <div style={{ fontSize: ".78rem" }}>Amount exceeds free-to-move {kes(fromAvail, { compact: true })} — the {from.reserveRatio}% reserve floor cannot be breached.</div>
              </div>
            )}
          </>
        )}
        {step === 2 && (
          <>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-kv"><span className="k">From</span><span className="v">{from.name}</span></div>
              <div className="pm-kv"><span className="k">To</span><span className="v">{to.name}</span></div>
              <div className="pm-kv"><span className="k">Amount</span><span className="v mono">{kes(amount)}</span></div>
              <div className="pm-kv"><span className="k">Source after</span><span className="v mono">{kes(from.balance - amount, { compact: true })} · floor {kes(from.reserved, { compact: true })} intact</span></div>
              <div className="pm-kv"><span className="k">Destination after</span><span className="v mono">{kes(to.balance + amount, { compact: true })}</span></div>
              <div className="pm-kv"><span className="k">Journal</span><span className="v mono">Dr {to.name} / Cr {from.name} · TRF-{7742 + Math.floor(Math.random() * 40)}</span></div>
            </div>
            <label className="form-label">Reason <span style={{ color: "#f04438" }}>*</span></label>
            <textarea className="form-control" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Card pool below guardrail — Visa T+2 funding" />
          </>
        )}
        {step === 3 && (
          <>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-kv"><span className="k">Transfer</span><span className="v mono">{kes(amount)}</span></div>
              <div className="pm-kv"><span className="k">Route</span><span className="v">{from.name} → {to.name}</span></div>
              <div className="pm-kv"><span className="k">Initiated by</span><span className="v">Joseph Mwangi · Tier 0</span></div>
              <div className="pm-kv"><span className="k">Approver</span><span className="v">Sarah Kamau · Finance Manager</span></div>
            </div>
            <TwoFactorField value={code} onChange={setCode} />
          </>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}>Back</button>}
        {step < 3 && (
          <button className="btn btn-primary btn-sm" disabled={step === 1 && (overdraw || amount <= 0) || step === 2 && reason.trim().length < 6} onClick={() => setStep(step + 1)}>Next</button>
        )}
        {step === 3 && (
          <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => {
            onDone(fromId, toId, amount, reason || "Manual rebalance");
            push({ kind: "success", title: "Transfer executed", body: `${kes(amount, { compact: true })} · ${from.name} → ${to.name}.` });
            close();
          }}>
            <i className="bi bi-check2 me-1" />Execute transfer
          </button>
        )}
      </div>
    </Modal>
  );
}

/* ================================================================
   3. External top-up wizard
   ================================================================ */
export function TopUpWizard({
  open, pools, target, onClose, onDone,
}: {
  open: boolean;
  pools: LiquidityPool[];
  target: LiquidityPool | null;
  onClose: () => void;
  onDone: (poolId: string, amount: number, bank: string) => void;
}) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [poolId, setPoolId] = useState(target?.id ?? "POOL-01");
  const [bank, setBank] = useState("I&M Bank •••• 4821");
  const [amount, setAmount] = useState(20_000_000);
  const [code, setCode] = useState("");
  const pool = pools.find((p) => p.id === poolId) ?? pools[0];
  const steps = [
    { label: "Pool", icon: "bi-diagram-3" },
    { label: "Funding", icon: "bi-bank" },
    { label: "2FA", icon: "bi-shield-lock" },
  ];
  const close = () => { setStep(0); setCode(""); onClose(); };
  if (!open) return null;
  return (
    <Modal open onClose={close} tone="green" icon="bi-plus-circle" size="md"
      title="Top up pool (external)" subtitle="Funds in from an external bank account · Super Admin + 2FA">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div className="d-flex flex-column gap-2">
            {pools.filter((p) => !p.locked || p.id === "POOL-05").map((p) => (
              <button key={p.id} className={`pm-opt ${poolId === p.id ? "active" : ""}`} onClick={() => setPoolId(p.id)}>
                <span className="r" /><i className={`bi ${p.icon}`} style={{ color: p.color }} />
                <span className="flex-grow-1">
                  <span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>{p.name}</span>
                  <span className="d-block pm-td-sub mono">{kes(p.balance, { compact: true })} · {p.health}</span>
                </span>
              </button>
            ))}
          </div>
        )}
        {step === 1 && (
          <>
            <label className="form-label">Source account</label>
            <select className="form-select mb-3" value={bank} onChange={(e) => setBank(e.target.value)}>
              {["I&M Bank •••• 4821", "KCB •••• 1177", "Equity Bank •••• 6632", "Co-op Bank •••• 2954"].map((b) => <option key={b}>{b}</option>)}
            </select>
            <label className="form-label">Amount (KES)</label>
            <input type="number" className="form-control mono mb-2" value={amount} step={1_000_000} onChange={(e) => setAmount(Number(e.target.value))} />
            <div className="pm-note">
              <i className="bi bi-info-circle me-1" />
              {pool.name} rises to <b className="mono">{kes(pool.balance + amount, { compact: true })}</b>. Treasury desk is notified for cash management.
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-kv"><span className="k">Pool</span><span className="v">{pool.name}</span></div>
              <div className="pm-kv"><span className="k">Amount</span><span className="v mono">{kes(amount)}</span></div>
              <div className="pm-kv"><span className="k">From</span><span className="v">{bank}</span></div>
            </div>
            <TwoFactorField value={code} onChange={setCode} />
          </>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}>Back</button>}
        {step < 2 && <button className="btn btn-primary btn-sm" disabled={step === 1 && amount <= 0} onClick={() => setStep(step + 1)}>Next</button>}
        {step === 2 && (
          <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => {
            onDone(poolId, amount, bank);
            push({ kind: "success", title: "Top-up booked", body: `${kes(amount, { compact: true })} → ${pool.name} from ${bank.split(" •")[0]}.` });
            close();
          }}>
            <i className="bi bi-check2 me-1" />Confirm top-up
          </button>
        )}
      </div>
    </Modal>
  );
}

/* ================================================================
   4. External withdrawal modal
   ================================================================ */
export function WithdrawModal({
  pool, onClose, onDone,
}: { pool: LiquidityPool | null; onClose: () => void; onDone: (p: LiquidityPool, amount: number) => void }) {
  const { push } = useToast();
  const [amount, setAmount] = useState(10_000_000);
  const [destination, setDestination] = useState("I&M Bank •••• 4821");
  const [purpose, setPurpose] = useState("treasury");
  const [code, setCode] = useState("");
  if (!pool) return null;
  const avail = pool.balance - pool.reserved;
  const overdraw = amount > avail;
  return (
    <Modal open onClose={onClose} tone="red" icon="bi-box-arrow-up" size="md"
      title={`Withdraw from ${pool.name}`} subtitle="External movement · Super Admin + Board resolution BR-2026-__ required">
      <div className="pm-modal-body">
        <div className="pm-alert-row crit mb-3">
          <i className="bi bi-exclamation-triangle-fill" style={{ color: "#f04438" }} />
          <div style={{ fontSize: ".78rem" }}>
            Board-level control: withdrawals above KES 50M need a written board resolution and are co-signed by the Chair. Free-to-move in this pool: <b>{kes(avail, { compact: true })}</b>.
          </div>
        </div>
        <div className="row g-2 mb-3">
          <div className="col-6">
            <label className="form-label">Amount (KES)</label>
            <input type="number" className="form-control mono" value={amount} step={1_000_000} onChange={(e) => setAmount(Number(e.target.value))} />
          </div>
          <div className="col-6">
            <label className="form-label">Destination</label>
            <select className="form-select" value={destination} onChange={(e) => setDestination(e.target.value)}>
              {["I&M Bank •••• 4821", "KCB •••• 1177", "Equity Bank •••• 6632"].map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
        </div>
        <label className="form-label">Purpose</label>
        <select className="form-select mb-3" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
          <option value="treasury">Treasury management (fixed deposit)</option>
          <option value="captable">Investor / dividend distribution</option>
          <option value="operating">Operating expense funding</option>
          <option value="partner">Partner buy-out / settlement</option>
        </select>
        {overdraw && <div className="pm-note mb-3" style={{ borderColor: "#f04438" }}>Amount exceeds free-to-move — reduce to {kes(avail, { compact: true })} or below.</div>}
        <TwoFactorField value={code} onChange={setCode} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger btn-sm" disabled={code !== "482913" || overdraw || amount <= 0} onClick={() => {
          onDone(pool, amount);
          push({ kind: "warn", title: "Withdrawal queued", body: `${kes(amount, { compact: true })} → ${destination.split(" •")[0]} · board resolution pending co-sign.` });
          onClose();
        }}>
          <i className="bi bi-box-arrow-up me-1" />Queue withdrawal
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   5. Reserve ratio modal
   ================================================================ */
export function ReserveRatioModal({ pool, onClose, onDone }: { pool: LiquidityPool | null; onClose: () => void; onDone: (p: LiquidityPool, ratio: number) => void }) {
  const { push } = useToast();
  const [ratio, setRatio] = useState(pool?.reserveRatio ?? 15);
  const [code, setCode] = useState("");
  if (!pool) return null;
  const newReserved = Math.round(pool.balance * ratio / 100);
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-shield-check" size="sm"
      title={`Reserve ratio — ${pool.name}`} subtitle={`Currently ${pool.reserveRatio}% · reserve ${kes(pool.reserved, { compact: true })}`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="d-flex justify-content-between mb-1"><span className="pm-eyebrow mb-0">New ratio</span><span className="mono" style={{ fontWeight: 800 }}>{ratio}%</span></div>
          <input type="range" className="form-range" min={0} max={100} step={1} value={ratio} onChange={(e) => setRatio(Number(e.target.value))} />
          <div className="pm-kv"><span className="k">Reserve after</span><span className="v mono">{kes(newReserved, { compact: true })}</span></div>
          <div className="pm-kv"><span className="k">Free-to-move after</span><span className="v mono">{kes(pool.balance - newReserved, { compact: true })}</span></div>
        </div>
        <div className="pm-note mb-3">
          <i className="bi bi-info-circle me-1" />
          CBK minimum is 10% at group level. Board policy floors apply per pool — lowering below {Math.max(10, pool.reserveRatio - 5)}% triggers a compliance review.
        </div>
        <TwoFactorField value={code} onChange={setCode} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={code !== "482913" || ratio === pool.reserveRatio} onClick={() => {
          onDone(pool, ratio);
          push({ kind: "success", title: "Reserve ratio updated", body: `${pool.name} → ${ratio}% · reserve ${kes(newReserved, { compact: true })}.` });
          onClose();
        }}>
          <i className="bi bi-check2 me-1" />Update ratio
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   6. Freeze / unfreeze pool modal
   ================================================================ */
export function FreezePoolModal({ pool, onClose, onDone }: { pool: LiquidityPool | null; onClose: () => void; onDone: (p: LiquidityPool) => void }) {
  const { push } = useToast();
  const [reason, setReason] = useState("incident");
  const [code, setCode] = useState("");
  if (!pool) return null;
  const freezing = pool.health !== "Frozen";
  return (
    <Modal open onClose={onClose} tone={freezing ? "red" : "green"} icon={freezing ? "bi-snow" : "bi-unlock"} size="sm"
      title={freezing ? `Freeze ${pool.name}` : `Unfreeze ${pool.name}`}
      subtitle={freezing ? `${kes(pool.balance, { compact: true })} · all in/out movement stops instantly` : "Normal pool operations resume"}>
      <div className="pm-modal-body">
        {freezing ? (
          <>
            <div className="pm-alert-row crit mb-3">
              <i className="bi bi-exclamation-triangle-fill" style={{ color: "#f04438" }} />
              <div style={{ fontSize: ".78rem" }}>
                Freezing blocks sweeps, settlements and top-ups on this pool. Rail partners routing here will queue — consider a transfer first.
              </div>
            </div>
            <label className="form-label">Reason</label>
            <select className="form-select mb-3" value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="incident">Suspected incident / anomaly</option>
              <option value="audit">Audit hold</option>
              <option value="regulator">Regulator instruction</option>
              <option value="rebal">Structural rebalance</option>
            </select>
          </>
        ) : (
          <div className="pm-note mb-3">
            <i className="bi bi-check2-circle me-1" style={{ color: "#0b8f52" }} />
            Unfreezing re-enables sweeps and settlements. Queued items from the freeze window execute in order.
          </div>
        )}
        <TwoFactorField value={code} onChange={setCode} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className={`btn btn-sm ${freezing ? "btn-danger" : "btn-primary"}`} disabled={code !== "482913"} onClick={() => {
          onDone(pool);
          push(freezing
            ? { kind: "warn", title: `${pool.name} frozen`, body: "Sweeps & settlements halted · partners notified." }
            : { kind: "success", title: `${pool.name} unfrozen`, body: "Queued movements executing." });
          onClose();
        }}>
          <i className={`bi ${freezing ? "bi-snow" : "bi-unlock"} me-1`} />{freezing ? "Freeze pool" : "Unfreeze pool"}
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   7. Create pool wizard
   ================================================================ */
export function CreatePoolWizard({
  open, onClose, onDone,
}: { open: boolean; onClose: () => void; onDone: (name: string, balance: number, ratio: number, threshold: number) => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [funding, setFunding] = useState(25_000_000);
  const [ratio, setRatio] = useState(20);
  const [threshold, setThreshold] = useState(5_000_000);
  const [code, setCode] = useState("");
  const steps = [
    { label: "Identity", icon: "bi-tag" },
    { label: "Funding", icon: "bi-cash-stack" },
    { label: "Policy", icon: "bi-sliders" },
    { label: "2FA", icon: "bi-shield-lock" },
  ];
  const close = () => { setStep(0); setCode(""); onClose(); };
  if (!open) return null;
  return (
    <Modal open onClose={close} tone="blue" icon="bi-node-plus" size="md"
      title="Create liquidity pool" subtitle="New pool definition · funded from Main Operating · Super Admin + 2FA">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%`, background: "#175cd3" }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <>
            <label className="form-label">Pool name <span style={{ color: "#f04438" }}>*</span></label>
            <input className="form-control mb-3" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Agency Network Float" />
            <label className="form-label">Purpose</label>
            <textarea className="form-control" rows={2} value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="What this pool settles / funds…" />
          </>
        )}
        {step === 1 && (
          <>
            <label className="form-label">Initial funding from Main Operating (KES)</label>
            <input type="number" className="form-control mono mb-2" value={funding} step={1_000_000} onChange={(e) => setFunding(Number(e.target.value))} />
            <div className="pm-note">
              <i className="bi bi-info-circle me-1" />
              Main Operating holds {kes(892_000_000, { compact: true })} with {kes(658_000_000, { compact: true })} free — this leaves it at {kes(892_000_000 - funding, { compact: true })}.
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <div className="pm-card pm-card-pad mb-3">
              <div className="d-flex justify-content-between mb-1"><span className="pm-eyebrow mb-0">Reserve ratio</span><span className="mono" style={{ fontWeight: 800 }}>{ratio}%</span></div>
              <input type="range" className="form-range" min={0} max={50} value={ratio} onChange={(e) => setRatio(Number(e.target.value))} />
            </div>
            <label className="form-label">Low-balance alert threshold (KES)</label>
            <input type="number" className="form-control mono" value={threshold} step={500_000} onChange={(e) => setThreshold(Number(e.target.value))} />
          </>
        )}
        {step === 3 && (
          <>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-kv"><span className="k">Name</span><span className="v">{name || "—"}</span></div>
              <div className="pm-kv"><span className="k">Initial balance</span><span className="v mono">{kes(funding)}</span></div>
              <div className="pm-kv"><span className="k">Reserve / threshold</span><span className="v mono">{ratio}% / {kes(threshold, { compact: true })}</span></div>
            </div>
            <TwoFactorField value={code} onChange={setCode} />
          </>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}>Back</button>}
        {step < 3 && <button className="btn btn-primary btn-sm" disabled={step === 0 && name.trim().length < 4} onClick={() => setStep(step + 1)}>Next</button>}
        {step === 3 && (
          <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => {
            onDone(name || "New Pool", funding, ratio, threshold);
            push({ kind: "success", title: "Pool created", body: `${name} · ${kes(funding, { compact: true })} funded from Main Operating.` });
            close();
          }}>
            <i className="bi bi-check2 me-1" />Create pool
          </button>
        )}
      </div>
    </Modal>
  );
}

/* ================================================================
   8. Transfer history drawer
   ================================================================ */
export function TransfersDrawer({
  open, onClose, transfers, onOpen,
}: { open: boolean; onClose: () => void; transfers: PoolTransfer[]; onOpen: (t: PoolTransfer) => void }) {
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");
  const tabs = ["All", "Complete", "Pending approval", "Scheduled", "Failed"];
  const list = transfers.filter((t) =>
    (tab === "All" || t.status === tab) &&
    (t.id + t.fromPool + t.toPool + t.reason + t.initiatedBy).toLowerCase().includes(q.toLowerCase())
  );
  return (
    <Drawer open={open} onClose={onClose} wide icon="bi-arrow-left-right" tone="green" title="Pool transfer history"
      subtitle={`${transfers.length} movements · every transfer is journal-backed`}
      footer={<button className="btn btn-outline-secondary btn-sm w-100" onClick={() => csvDownload("pool-transfers.csv", transfers as unknown as Record<string, unknown>[])}>
        <i className="bi bi-download me-1" />Export transfers
      </button>}>
      <div className="pm-search mb-2" style={{ background: "#fff" }}>
        <i className="bi bi-search" />
        <input placeholder="Pool, reason, initiator…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="pm-tabs mb-3" style={{ borderBottom: 0 }}>
        {tabs.map((t) => (
          <button key={t} className={`pm-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t}<span className="cnt">{t === "All" ? transfers.length : transfers.filter((x) => x.status === t).length}</span>
          </button>
        ))}
      </div>
      {list.length === 0 ? <EmptyState icon="bi-search" title="No transfers match" body="Try another filter." /> : list.map((t) => (
        <button key={t.id} className="pm-alert-row w-100 text-start mb-2" style={{ border: "1px solid var(--pm-border)", borderLeftColor: t.status === "Complete" ? "#12b76a" : t.status === "Failed" ? "#f04438" : t.status === "Scheduled" ? "#2e90fa" : "#f79009" }} onClick={() => onOpen(t)}>
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="mono" style={{ fontWeight: 700, fontSize: ".76rem" }}>{t.id}</span>
              <Badge tone={t.status === "Complete" ? "green" : t.status === "Failed" ? "red" : t.status === "Scheduled" ? "blue" : "amber"} dot>{t.status}</Badge>
              <span className="pm-td-sub">{t.date} {t.time}</span>
            </div>
            <div style={{ fontSize: ".78rem", fontWeight: 600 }}>{t.fromPool} <i className="bi bi-arrow-right mx-1" style={{ fontSize: ".66rem" }} /> {t.toPool}</div>
            <div className="pm-td-sub">{t.reason}</div>
            <div className="pm-td-sub mono">{t.initiatedBy}{t.approvedBy !== "—" ? ` · appr. ${t.approvedBy}` : ""}</div>
          </div>
          <span className="pm-num" style={{ fontWeight: 700, fontSize: ".78rem" }}>{kes(t.amount, { compact: true })}</span>
        </button>
      ))}
    </Drawer>
  );
}

/* ================================================================
   9. Transfer detail modal (with approve for pending)
   ================================================================ */
export function TransferDetailModal({
  transfer, onClose, onApprove,
}: { transfer: PoolTransfer | null; onClose: () => void; onApprove: (t: PoolTransfer) => void }) {
  if (!transfer) return null;
  return (
    <Modal open onClose={onClose} tone={transfer.status === "Failed" ? "red" : transfer.status === "Complete" ? "green" : "amber"}
      icon="bi-arrow-left-right" size="md"
      title={`${transfer.id} — pool transfer`} subtitle={`${transfer.fromPool} → ${transfer.toPool} · ${transfer.date} ${transfer.time}`}>
      <div className="pm-modal-body">
        <div className="row g-2 mb-3">
          {[
            { l: "Amount", v: kes(transfer.amount, { compact: true }) },
            { l: "Status", v: transfer.status },
            { l: "Initiated by", v: transfer.initiatedBy },
            { l: "Approved by", v: transfer.approvedBy },
          ].map((x) => (
            <div className="col-6" key={x.l}>
              <div className="pm-stat"><div className="pm-stat-label">{x.l}</div>
                <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: ".92rem" }}>{x.v}</div></div>
            </div>
          ))}
        </div>
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Reason</span><span className="v">{transfer.reason}</span></div>
          <div className="pm-kv"><span className="k">Journal</span><span className="v mono">Dr {transfer.toPool} / Cr {transfer.fromPool}</span></div>
          <div className="pm-kv"><span className="k">Dual control</span><span className="v">{transfer.initiatedBy.includes("auto") ? "System sweep — exempt" : "Initiator ≠ approver ✓"}</span></div>
        </div>
        <div className="pm-timeline">
          {[
            { t: "Initiated", d: transfer.initiatedBy, s: "done" },
            { t: "Approved", d: transfer.approvedBy === "—" ? "System sweep — auto-approved" : transfer.approvedBy, s: transfer.approvedBy === "Awaiting Tier-0" ? "" : "done" },
            { t: "Executed", d: transfer.status === "Complete" ? "Journal posted · balances updated" : transfer.status === "Failed" ? "Failed — denied" : "Pending", s: transfer.status === "Complete" ? "done" : transfer.status === "Failed" ? "danger" : "" },
          ].map((x) => (
            <div key={x.t} className={`pm-tl-item ${x.s}`}><div style={{ fontWeight: 700, fontSize: ".8rem" }}>{x.t}</div><div className="pm-td-sub">{x.d}</div></div>
          ))}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => csvDownload(`${transfer.id}.csv`, [transfer as unknown as Record<string, unknown>])}>
          <i className="bi bi-download me-1" />Export
        </button>
        {transfer.status === "Pending approval"
          ? <button className="btn btn-primary btn-sm" onClick={() => onApprove(transfer)}><i className="bi bi-check2 me-1" />Approve & execute</button>
          : <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>}
      </div>
    </Modal>
  );
}

/* ================================================================
   10. Approve pending transfer modal (2FA)
   ================================================================ */
export function ApproveTransferModal({ transfer, onClose, onDone }: { transfer: PoolTransfer | null; onClose: () => void; onDone: (t: PoolTransfer) => void }) {
  const { push } = useToast();
  const [code, setCode] = useState("");
  if (!transfer) return null;
  return (
    <Modal open onClose={onClose} tone="green" icon="bi-check2-circle" size="sm"
      title={`Approve ${transfer.id}`} subtitle={`${kes(transfer.amount, { compact: true })} · ${transfer.fromPool} → ${transfer.toPool}`}>
      <div className="pm-modal-body">
        <div className="pm-note mb-3">
          <i className="bi bi-shield-fill-check me-1" style={{ color: "#0b8f52" }} />
          Approving executes the journal immediately and updates both pool balances. Initiated by {transfer.initiatedBy} — you are the second authoriser.
        </div>
        <TwoFactorField value={code} onChange={setCode} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => {
          onDone(transfer);
          push({ kind: "success", title: `${transfer.id} executed`, body: "Balances updated · journal posted." });
          onClose();
        }}>
          <i className="bi bi-check2 me-1" />Approve & execute
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   11. Sweep rules drawer
   ================================================================ */
export function SweepsDrawer({
  open, onClose, sweeps, onToggle, onEdit, onCreate, onRun,
}: {
  open: boolean;
  onClose: () => void;
  sweeps: SweepRule[];
  onToggle: (s: SweepRule) => void;
  onEdit: (s: SweepRule) => void;
  onCreate: () => void;
  onRun: (s: SweepRule) => void;
}) {
  return (
    <Drawer open={open} onClose={onClose} wide icon="bi-arrow-repeat" tone="violet" title="Automated sweep rules"
      subtitle={`${sweeps.length} rules · ${sweeps.reduce((s, x) => s + x.runs30d, 0)} executions / 30d`}
      footer={<button className="btn btn-primary btn-sm w-100" onClick={onCreate}><i className="bi bi-plus-lg me-1" />New sweep rule</button>}>
      {sweeps.map((s) => (
        <div key={s.id} className="pm-alert-row mb-2" style={{ borderLeftColor: s.enabled ? "#7a5af8" : "#98a2b3", border: "1px solid var(--pm-border)" }}>
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="mono" style={{ fontWeight: 700, fontSize: ".76rem" }}>{s.id}</span>
              <span style={{ fontWeight: 700, fontSize: ".8rem" }}>{s.name}</span>
              <Badge tone={s.enabled ? "green" : "grey"} dot>{s.enabled ? "Enabled" : "Disabled"}</Badge>
            </div>
            <div className="pm-td-sub mono">{s.source} → {s.destination} · {kes(s.amount, { compact: true })}</div>
            <div className="pm-td-sub">Trigger: {s.trigger}</div>
            <div className="pm-td-sub mono">last run {s.lastRun} · {s.runs30d} runs / 30d</div>
          </div>
          <div className="d-flex flex-column gap-1 align-items-end">
            <div className="form-check form-switch mb-0">
              <input className="form-check-input" type="checkbox" checked={s.enabled} onChange={() => onToggle(s)} />
            </div>
            <div className="btn-group btn-group-sm">
              <button className="btn btn-outline-secondary" style={{ fontSize: ".66rem" }} onClick={() => onRun(s)} disabled={!s.enabled}>Run</button>
              <button className="btn btn-outline-secondary" style={{ fontSize: ".66rem" }} onClick={() => onEdit(s)}>Edit</button>
            </div>
          </div>
        </div>
      ))}
    </Drawer>
  );
}

/* ================================================================
   12. Sweep edit modal
   ================================================================ */
export function SweepEditModal({ sweep, onClose, onDone }: { sweep: SweepRule | null; onClose: () => void; onDone: (s: SweepRule, amount: number, trigger: string) => void }) {
  const { push } = useToast();
  const [amount, setAmount] = useState(sweep?.amount ?? 5_000_000);
  const [trigger, setTrigger] = useState(sweep?.trigger ?? "");
  const [code, setCode] = useState("");
  if (!sweep) return null;
  return (
    <Modal open onClose={onClose} tone="violet" icon="bi-sliders" size="sm"
      title={`Edit ${sweep.id} — ${sweep.name}`} subtitle={`${sweep.source} → ${sweep.destination}`}>
      <div className="pm-modal-body">
        <label className="form-label">Sweep amount (KES)</label>
        <input type="number" className="form-control mono mb-3" value={amount} step={500_000} onChange={(e) => setAmount(Number(e.target.value))} />
        <label className="form-label">Trigger condition</label>
        <input className="form-control mb-3" value={trigger} onChange={(e) => setTrigger(e.target.value)} placeholder="e.g. Float < KES 80M at 06:00" />
        <TwoFactorField value={code} onChange={setCode} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={code !== "482913" || trigger.trim().length < 4} onClick={() => {
          onDone(sweep, amount, trigger);
          push({ kind: "success", title: `${sweep.id} updated`, body: `Trigger ${trigger} · ${kes(amount, { compact: true })}.` });
          onClose();
        }}>
          <i className="bi bi-check2 me-1" />Save rule
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   13. Create sweep rule wizard
   ================================================================ */
export function SweepWizard({
  open, pools, onClose, onDone,
}: { open: boolean; pools: LiquidityPool[]; onClose: () => void; onDone: (s: SweepRule) => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [source, setSource] = useState("Main Operating");
  const [destination, setDestination] = useState("M-Pesa Float");
  const [amount, setAmount] = useState(5_000_000);
  const [trigger, setTrigger] = useState("Daily at 06:00");
  const [code, setCode] = useState("");
  const steps = [
    { label: "Route", icon: "bi-arrow-repeat" },
    { label: "Trigger", icon: "bi-alarm" },
    { label: "2FA", icon: "bi-shield-lock" },
  ];
  const close = () => { setStep(0); setCode(""); onClose(); };
  if (!open) return null;
  return (
    <Modal open onClose={close} tone="violet" icon="bi-plus-circle" size="md"
      title="New sweep rule" subtitle="Automated pool-to-pool movement with guardrails">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%`, background: "#7a5af8" }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <>
            <label className="form-label">Rule name</label>
            <input className="form-control mb-3" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. FX buffer nightly check" />
            <div className="row g-2">
              <div className="col-6">
                <label className="form-label">Source</label>
                <select className="form-select" value={source} onChange={(e) => setSource(e.target.value)}>
                  {pools.map((p) => <option key={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="col-6">
                <label className="form-label">Destination</label>
                <select className="form-select" value={destination} onChange={(e) => setDestination(e.target.value)}>
                  {pools.map((p) => <option key={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="col-6">
                <label className="form-label">Amount (KES)</label>
                <input type="number" className="form-control mono" value={amount} step={500_000} onChange={(e) => setAmount(Number(e.target.value))} />
              </div>
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <label className="form-label">Trigger</label>
            <select className="form-select mb-3" value={trigger} onChange={(e) => setTrigger(e.target.value)}>
              {["Daily at 06:00", "Daily at 20:00", "Destination below threshold", "90 min before settlement", "Reserve surplus detected", "Fri 15:00 & Sun 18:00"].map((t) => <option key={t}>{t}</option>)}
            </select>
            <div className="pm-note">
              <i className="bi bi-shield-check me-1" />
              Rules respect reserve floors — a sweep that would breach a floor skips and pages Treasury instead.
            </div>
          </>
        )}
        {step === 2 && <TwoFactorField value={code} onChange={setCode} />}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}>Back</button>}
        {step < 2 && <button className="btn btn-primary btn-sm" disabled={step === 0 && (name.trim().length < 4 || source === destination)} onClick={() => setStep(step + 1)}>Next</button>}
        {step === 2 && (
          <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => {
            const s: SweepRule = {
              id: `SWP-${9 + Math.floor(Math.random() * 40)}`, name: name || "New sweep",
              trigger, source, destination, amount, enabled: true, lastRun: "—", runs30d: 0,
            };
            onDone(s);
            push({ kind: "success", title: `${s.id} created`, body: `${source} → ${destination} · ${kes(amount, { compact: true })}` });
            close();
          }}>
            <i className="bi bi-check2 me-1" />Create rule
          </button>
        )}
      </div>
    </Modal>
  );
}

/* ================================================================
   14. Alerts drawer (thresholds + channels)
   ================================================================ */
export function AlertsDrawer({
  open, onClose, alerts, onEdit,
}: {
  open: boolean;
  onClose: () => void;
  alerts: LiquidityAlert[];
  onEdit: (a: LiquidityAlert, threshold: number, notify: string) => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [threshold, setThreshold] = useState(0);
  const [notify, setNotify] = useState("Email + Slack");
  return (
    <Drawer open={open} onClose={onClose} icon="bi-bell" tone="amber" title="Liquidity alert configuration"
      subtitle={`${alerts.length} rules · ${alerts.filter((a) => !a.ok).length} breaching`}
      footer={<div className="pm-note w-100 mb-0"><i className="bi bi-info-circle me-1" />Threshold changes apply instantly — no 2FA needed, but all edits are audited.</div>}>
      {alerts.map((a) => (
        <div key={a.id} className="pm-alert-row mb-2" style={{ borderLeftColor: a.ok ? "#12b76a" : "#f04438", border: "1px solid var(--pm-border)" }}>
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span style={{ fontWeight: 700, fontSize: ".8rem" }}>{a.label}</span>
              <Badge tone={a.ok ? "green" : "red"} dot>{a.ok ? "OK" : "Breach"}</Badge>
            </div>
            <div className="pm-td-sub mono">pool {a.pool} · notify {a.notify}</div>
            {editing === a.id && (
              <div className="row g-2 mt-2">
                <div className="col-7">
                  <input type="number" className="form-control form-control-sm mono" value={threshold} step={1_000_000} onChange={(e) => setThreshold(Number(e.target.value))} />
                </div>
                <div className="col-5">
                  <select className="form-select form-select-sm" value={notify} onChange={(e) => setNotify(e.target.value)}>
                    {["Email", "Email + Slack", "SMS + Email", "SMS + Email + Slack", "SMS + Email + Slack + Call"].map((n) => <option key={n}>{n}</option>)}
                  </select>
                </div>
                <div className="col-12 d-flex gap-1">
                  <button className="btn btn-sm btn-primary" style={{ fontSize: ".68rem" }} onClick={() => { onEdit(a, threshold, notify); setEditing(null); }}>Save</button>
                  <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".68rem" }} onClick={() => setEditing(null)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
          <div className="text-end">
            <div className="pm-num" style={{ fontSize: ".72rem" }}>
              thr <b>{kes(a.threshold, { compact: true })}</b>
            </div>
            <div className="pm-num" style={{ fontSize: ".72rem" }}>cur <b style={{ color: a.ok ? "#0b8f52" : "#b42318" }}>{kes(a.current, { compact: true })}</b></div>
            <button className="btn btn-sm btn-outline-secondary mt-1" style={{ fontSize: ".66rem" }} onClick={() => { setEditing(a.id); setThreshold(a.threshold); setNotify(a.notify); }}>
              <i className="bi bi-pencil" />
            </button>
          </div>
        </div>
      ))}
    </Drawer>
  );
}

/* ================================================================
   15. Forecast modal
   ================================================================ */
export function ForecastModal({ open, onClose, forecast }: { open: boolean; onClose: () => void; forecast: ForecastRow[] }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} tone="green" icon="bi-graph-up-arrow" size="lg"
      title="Liquidity forecast — Main Operating" subtitle="Projected outflows vs inflows · recalculated nightly">
      <div className="pm-modal-body">
        <div className="pm-card pm-table-wrap mb-3">
          <table className="pm-table">
            <thead><tr><th>Horizon</th><th className="text-end">Outflows</th><th className="text-end">Inflows</th><th className="text-end">Net</th><th className="text-end">Balance</th><th>Action</th></tr></thead>
            <tbody>
              {forecast.map((f) => (
                <tr key={f.horizon}>
                  <td className="pm-td-strong">{f.horizon}</td>
                  <td className="text-end pm-num" style={{ color: "#b42318" }}>−{kes(f.outflows, { compact: true })}</td>
                  <td className="text-end pm-num" style={{ color: "#0b8f52" }}>+{kes(f.inflows, { compact: true })}</td>
                  <td className="text-end pm-num" style={{ color: f.net >= 0 ? "#0b8f52" : "#b42318", fontWeight: 700 }}>
                    {f.net >= 0 ? "+" : ""}{kes(f.net, { compact: true })}
                  </td>
                  <td className="text-end pm-num">{kes(f.balance, { compact: true })}</td>
                  <td>{f.action === "None" ? <Badge tone="green">None</Badge> : <Badge tone="amber" dot>{f.action}</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pm-note">
          <i className="bi bi-info-circle me-1" />
          Model: 30-day rolling settlement pattern + scheduled sweeps + partner windows. Confidence 85% at 7 days, 68% at 30 days.
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => csvDownload("liquidity-forecast.csv", forecast as unknown as Record<string, unknown>[])}>
          <i className="bi bi-download me-1" />Export forecast
        </button>
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   16. Reserves modal
   ================================================================ */
export function ReservesModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-shield-check" size="lg"
      title="Reserve requirements" subtitle="Regulatory & board-mandated buffers — all five compliant">
      <div className="pm-modal-body">
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Requirement</th><th>Basis</th><th>Required</th><th>Current</th><th>Compliance</th><th>Detail</th></tr></thead>
            <tbody>
              {RESERVES.map((r) => (
                <tr key={r.requirement}>
                  <td className="pm-td-strong">{r.requirement}</td>
                  <td className="pm-td-sub">{r.basis}</td>
                  <td className="pm-num">{r.required}</td>
                  <td className="pm-num" style={{ fontWeight: 700, color: "#0b8f52" }}>{r.current}</td>
                  <td><Badge tone={r.compliance ? "green" : "red"} dot>{r.compliance ? "Compliant" : "Breach"}</Badge></td>
                  <td className="pm-td-sub">{r.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => csvDownload("reserve-requirements.csv", RESERVES as unknown as Record<string, unknown>[])}>
          <i className="bi bi-download me-1" />Export
        </button>
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   17. Cash flow modal
   ================================================================ */
export function CashflowModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} tone="green" icon="bi-file-earmark-bar-graph" size="lg"
      title="Cash flow statement (simplified)" subtitle="Operating + financing · trailing windows">
      <div className="pm-modal-body">
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Category</th><th className="text-end">30 days</th><th className="text-end">60 days</th><th className="text-end">90 days</th></tr></thead>
            <tbody>
              {CASHFLOW.map((c) => (
                <tr key={c.category} style={c.kind === "total" ? { background: "#f2fbf6" } : undefined}>
                  <td className={c.kind === "total" || c.kind === "net" ? "pm-td-strong" : ""}>{c.category}</td>
                  {(["d30", "d60", "d90"] as const).map((k) => (
                    <td key={k} className="text-end pm-num" style={{
                      fontWeight: c.kind === "total" ? 800 : c.kind === "outflow" ? 500 : 700,
                      color: c.kind === "outflow" ? "#b42318" : c.kind === "inflow" ? "#0b8f52" : "var(--pm-ink)",
                    }}>
                      {c.kind === "outflow" ? "−" : c.kind === "inflow" ? "+" : ""}{kes(c[k], { compact: true })}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => csvDownload("cashflow.csv", CASHFLOW as unknown as Record<string, unknown>[])}>
          <i className="bi bi-download me-1" />Export statement
        </button>
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   18. Activity drawer
   ================================================================ */
export function ActivityDrawer({
  open, onClose, activity, onPool,
}: { open: boolean; onClose: () => void; activity: { id: string; time: string; pool: string; action: string; amount: number; balanceAfter: number; by: string }[]; onPool: (name: string) => void }) {
  const [pool, setPool] = useState("All pools");
  const list = pool === "All pools" ? activity : activity.filter((a) => a.pool === pool);
  return (
    <Drawer open={open} onClose={onClose} icon="bi-activity" tone="blue" title="Pool activity log"
      subtitle={`${activity.length} movements today · every entry journal-backed`}
      footer={<button className="btn btn-outline-secondary btn-sm w-100" onClick={() => csvDownload("pool-activity.csv", activity as unknown as Record<string, unknown>[])}>
        <i className="bi bi-download me-1" />Export log
      </button>}>
      <div className="d-flex gap-1 flex-wrap mb-3">
        {["All pools", ...Array.from(new Set(activity.map((a) => a.pool)))].slice(0, 7).map((p) => (
          <button key={p} className={`pm-chip ${pool === p ? "active" : ""}`} onClick={() => setPool(p)}>{p}</button>
        ))}
      </div>
      {list.map((a) => (
        <div key={a.id} className="pm-alert-row mb-2" style={{ borderLeftColor: a.amount > 0 ? "#12b76a" : a.amount < 0 ? "#f04438" : "#98a2b3", border: "1px solid var(--pm-border)" }}>
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: ".78rem" }}>{a.action}</div>
            <div className="pm-td-sub">
              <button className="btn btn-link btn-sm p-0" style={{ fontSize: ".72rem", fontWeight: 700 }} onClick={() => { onPool(a.pool); onClose(); }}>{a.pool}</button>
              {" "}· {a.time} · {a.by}
            </div>
          </div>
          <div className="text-end">
            <div className="pm-num" style={{ fontWeight: 700, fontSize: ".74rem", color: a.amount > 0 ? "#0b8f52" : a.amount < 0 ? "#b42318" : "var(--pm-muted)" }}>
              {a.amount === 0 ? "—" : `${a.amount > 0 ? "+" : ""}${kes(a.amount, { compact: true })}`}
            </div>
            <div className="pm-td-sub mono">bal {kes(a.balanceAfter, { compact: true })}</div>
          </div>
        </div>
      ))}
    </Drawer>
  );
}

/* ================================================================
   19. Export modal
   ================================================================ */
export function LiquidityExportModal({
  open, onClose, pools, transfers,
}: { open: boolean; onClose: () => void; pools: LiquidityPool[]; transfers: PoolTransfer[] }) {
  const { push } = useToast();
  const [dataset, setDataset] = useState("pools");
  const [fmt, setFmt] = useState("csv");
  if (!open) return null;
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-download" size="sm"
      title="Export liquidity data" subtitle="Watermarked · written to the audit log">
      <div className="pm-modal-body">
        <label className="form-label">Dataset</label>
        <div className="d-flex flex-column gap-2 mb-3">
          {[
            ["pools", `Pool balances (${pools.length})`],
            ["transfers", `Transfer history (${transfers.length})`],
            ["activity", "Activity log (14)"],
            ["all", "Full pack (3 files)"],
          ].map(([id, l]) => (
            <button key={id} className={`pm-opt ${dataset === id ? "active" : ""}`} onClick={() => setDataset(id)}>
              <span className="r" /><span style={{ fontWeight: 700, fontSize: ".85rem" }}>{l}</span>
            </button>
          ))}
        </div>
        <label className="form-label">Format</label>
        <div className="d-flex gap-1">
          {["csv", "json"].map((f) => <button key={f} className={`pm-chip ${fmt === f ? "active" : ""}`} onClick={() => setFmt(f)}>{f.toUpperCase()}</button>)}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => {
          const dl = (name: string, data: unknown[]) => (fmt === "json" ? jsonDownload(`${name}.json`, data) : csvDownload(`${name}.csv`, data as unknown as Record<string, unknown>[]));
          if (dataset === "pools" || dataset === "all") dl("pool-balances", pools);
          if (dataset === "transfers" || dataset === "all") dl("pool-transfers", transfers);
          if (dataset === "activity" || dataset === "all") dl("pool-activity", ACTIVITY);
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
   20. Stress test modal
   ================================================================ */
export function StressTestModal({
  open, onClose, pools,
}: { open: boolean; onClose: () => void; pools: LiquidityPool[] }) {
  const [shockPct, setShockPct] = useState(25);
  const [days, setDays] = useState(3);
  if (!open) return null;
  const active = pools.filter((p) => !p.locked && p.health !== "Frozen");
  const outflowTotal = active.reduce((s, p) => s + (p.balance * shockPct / 100) * days, 0);
  const main = pools.find((p) => p.name === "Main Operating") ?? pools[0];
  const emergency = pools.find((p) => p.name === "Emergency Reserve");
  const mainAfter = main.balance - Math.max(0, outflowTotal - active.reduce((s, p) => s + p.balance - p.reserved, 0));
  const breached = active.filter((p) => p.balance * (1 - (shockPct / 100) * days) < p.lowThreshold);
  return (
    <Modal open onClose={onClose} tone="red" icon="bi-broadcast" size="lg"
      title="Liquidity stress test" subtitle="Simulate a rapid-deposit-run shock across all open pools">
      <div className="pm-modal-body">
        <div className="row g-2 mb-3">
          <div className="col-12 col-md-6">
            <div className="pm-card pm-card-pad h-100">
              <div className="d-flex justify-content-between mb-1"><span className="pm-eyebrow mb-0">Daily outflow shock</span><span className="mono" style={{ fontWeight: 800, color: "#b42318" }}>{shockPct}%</span></div>
              <input type="range" className="form-range" min={5} max={60} step={5} value={shockPct} onChange={(e) => setShockPct(Number(e.target.value))} />
              <div className="d-flex justify-content-between" style={{ fontSize: ".66rem", color: "var(--pm-muted)" }}><span>5% mild</span><span>25% CBK base case</span><span>60% severe</span></div>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="pm-card pm-card-pad h-100">
              <div className="d-flex justify-content-between mb-1"><span className="pm-eyebrow mb-0">Duration</span><span className="mono" style={{ fontWeight: 800 }}>{days} day{days > 1 ? "s" : ""}</span></div>
              <div className="d-flex gap-1 flex-wrap mt-2">
                {[1, 3, 5, 10].map((d) => (
                  <button key={d} className={`pm-chip ${days === d ? "active" : ""}`} onClick={() => setDays(d)}>{d}d</button>
                ))}
              </div>
              <div className="pm-td-sub mt-2">CBK requires survival ≥ 5 days at the 25% base case.</div>
            </div>
          </div>
        </div>

        <div className="row g-2 mb-3">
          {[
            { l: "Total outflow", v: kes(outflowTotal, { compact: true }), c: "#b42318" },
            { l: "Main Operating after", v: kes(mainAfter, { compact: true }), c: mainAfter > main.lowThreshold ? "#0b8f52" : "#b42318" },
            { l: "Pools breaching floor", v: String(breached.length), c: breached.length ? "#b42318" : "#0b8f52" },
            { l: "Emergency drawdown needed", v: mainAfter < 0 ? kes(Math.abs(mainAfter), { compact: true }) : "None", c: mainAfter < 0 ? "#b54708" : "#0b8f52" },
          ].map((x) => (
            <div className="col-6 col-lg-3" key={x.l}>
              <div className="pm-stat"><div className="pm-stat-label">{x.l}</div>
                <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1rem", color: x.c }}>{x.v}</div></div>
            </div>
          ))}
        </div>

        <div className="pm-card pm-table-wrap mb-3">
          <table className="pm-table">
            <thead><tr><th>Pool</th><th className="text-end">Balance</th><th className="text-end">Shock outflow</th><th className="text-end">After</th><th>Verdict</th></tr></thead>
            <tbody>
              {active.map((p) => {
                const out = p.balance * (shockPct / 100) * days;
                const after = p.balance - out;
                const ok = after >= p.lowThreshold;
                return (
                  <tr key={p.id}>
                    <td className="pm-td-strong">{p.name}</td>
                    <td className="text-end pm-num">{kes(p.balance, { compact: true })}</td>
                    <td className="text-end pm-num" style={{ color: "#b42318" }}>−{kes(out, { compact: true })}</td>
                    <td className="text-end pm-num" style={{ fontWeight: 700 }}>{kes(Math.max(0, after), { compact: true })}</td>
                    <td><Badge tone={ok ? "green" : "red"} dot>{ok ? "Survives" : "Breach"}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {mainAfter < 0 && emergency && (
          <div className="pm-alert-row warn">
            <i className="bi bi-shield-lock-fill" style={{ color: "#b54708" }} />
            <div style={{ fontSize: ".78rem" }}>
              Emergency Reserve covers the gap ({kes(Math.min(emergency.balance, Math.abs(mainAfter)), { compact: true })} of {kes(emergency.balance, { compact: true })} needed) — releasing it needs board quorum, ~4h lead time.
            </div>
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => csvDownload("stress-test.csv", active.map((p) => ({
          pool: p.name, balance: p.balance, outflow: p.balance * (shockPct / 100) * days, after: p.balance - p.balance * (shockPct / 100) * days,
        })))}>
          <i className="bi bi-download me-1" />Export scenario
        </button>
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   21. Pool actions matrix modal
   ================================================================ */
export function PoolActionsModal({
  open, onClose, onAction,
}: { open: boolean; onClose: () => void; onAction: (id: string) => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} tone="ink" icon="bi-lightning-charge" size="lg"
      title="Pool management actions" subtitle="Every pool operation with its control regime">
      <div className="pm-modal-body">
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Action</th><th>Description</th><th>Requires</th><th>Approval</th><th /></tr></thead>
            <tbody>
              {POOL_ACTIONS.map((a) => (
                <tr key={a.id}>
                  <td className="pm-td-strong"><i className={`bi ${a.icon} me-2`} style={{ color: "#0b8f52" }} />{a.label}</td>
                  <td className="pm-td-sub">{a.hint}</td>
                  <td><Badge tone={a.requires === "2FA" ? "amber" : "grey"}>{a.requires}</Badge></td>
                  <td className="pm-td-sub">{a.approval}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => { onClose(); onAction(a.id); }}>Open</button>
                  </td>
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

/* ============================ 22. Pool analytics modal ============================ */
export function PoolAnalyticsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const stats = [
    { label: "Total liquidity", value: "KES 4.2B", color: "#12b76a" },
    { label: "Active pools", value: "8", color: "#2e90fa" },
    { label: "Reserve ratio", value: "32%", color: "#7a5af8" },
    { label: "Daily transfers", value: "KES 890M", color: "#12b76a" },
    { label: "Sweep rules active", value: "12", color: "#f79009" },
    { label: "Alerts pending", value: "3", color: "#f04438" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-graph-up" tone="blue" title="Pool analytics" subtitle="Liquidity performance metrics">
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

/* ============================ 23. Pool comparison modal ============================ */
export function PoolCompareModal({ pools, onClose }: { pools: LiquidityPool[]; onClose: () => void }) {
  if (pools.length < 2) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-arrow-left-right" tone="blue" title="Compare pools" subtitle="Side-by-side comparison">
      <div className="pm-card pm-table-wrap">
        <table className="pm-table">
          <thead><tr><th>Field</th><th>{pools[0].name}</th><th>{pools[1].name}</th></tr></thead>
          <tbody>
            {["balance", "reserved", "reserveRatio", "status"].map((k) => (
              <tr key={k}><td className="pm-td-strong">{k}</td><td>{typeof pools[0][k as keyof LiquidityPool] === "number" ? kes(pools[0][k as keyof LiquidityPool] as number) : String(pools[0][k as keyof LiquidityPool])}</td><td>{typeof pools[1][k as keyof LiquidityPool] === "number" ? kes(pools[1][k as keyof LiquidityPool] as number) : String(pools[1][k as keyof LiquidityPool])}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </Drawer>
  );
}

/* ============================ 24. Pool insights modal ============================ */
export function PoolInsightsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const insights = [
    { icon: "bi-graph-up", title: "Liquidity trending up", detail: "8% increase in total liquidity vs last week", tone: "green" },
    { icon: "bi-exclamation-triangle", title: "Reserve ratio tight", detail: "Main Operating at 28%, below 30% target", tone: "amber" },
    { icon: "bi-check-circle", title: "Transfer volume stable", detail: "KES 890M daily, within normal range", tone: "green" },
    { icon: "bi-clock-history", title: "Sweep rules active", detail: "12 rules triggered today, 2 above threshold", tone: "amber" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-lightbulb" tone="blue" title="Pool insights" subtitle="AI-powered analysis">
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

/* ============================ 25. Transfer detail modal ============================ */
export function TransferDetailInfoModal({ transfer, onClose }: { transfer: PoolTransfer | null; onClose: () => void }) {
  if (!transfer) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-arrow-left-right" tone="blue" title="Transfer detail" subtitle={transfer.id}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Amount</span><span className="v pm-num" style={{ fontWeight: 700 }}>{kes(transfer.amount, { compact: true })}</span></div>
        <div className="pm-kv"><span className="k">From</span><span className="v">{transfer.from}</span></div>
        <div className="pm-kv"><span className="k">To</span><span className="v">{transfer.to}</span></div>
        <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone={transfer.status === "Completed" ? "green" : transfer.status === "Pending" ? "amber" : "red"}>{transfer.status}</Badge></span></div>
        <div className="pm-kv"><span className="k">Initiated</span><span className="v">{transfer.initiated}</span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 26. Sweep rule detail modal ============================ */
export function SweepRuleDetailModal({ sweep, onClose }: { sweep: SweepRule | null; onClose: () => void }) {
  if (!sweep) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-arrow-down-circle" tone="blue" title="Sweep rule" subtitle={sweep.id}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Source pool</span><span className="v">{sweep.source}</span></div>
        <div className="pm-kv"><span className="k">Destination</span><span className="v">{sweep.destination}</span></div>
        <div className="pm-kv"><span className="k">Amount</span><span className="v pm-num" style={{ fontWeight: 700 }}>{kes(sweep.amount, { compact: true })}</span></div>
        <div className="pm-kv"><span className="k">Trigger</span><span className="v"><Badge tone="blue">{sweep.trigger}</Badge></span></div>
        <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone={sweep.status === "Active" ? "green" : "grey"}>{sweep.status}</Badge></span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 27. Alert detail modal ============================ */
export function AlertDetailModal({ alert, onClose }: { alert: { id: string; type: string; message: string; time: string; severity: string } | null; onClose: () => void }) {
  if (!alert) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-exclamation-triangle" tone={alert.severity === "Critical" ? "red" : "amber"} title="Alert detail" subtitle={alert.id}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Type</span><span className="v"><Badge tone="blue">{alert.type}</Badge></span></div>
        <div className="pm-kv"><span className="k">Message</span><span className="v">{alert.message}</span></div>
        <div className="pm-kv"><span className="k">Time</span><span className="v">{alert.time}</span></div>
        <div className="pm-kv"><span className="k">Severity</span><span className="v"><Badge tone={alert.severity === "Critical" ? "red" : "amber"}>{alert.severity}</Badge></span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 28. Cashflow modal ============================ */
export function CashflowDetailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const flows = [
    { label: "Inflows today", value: "KES 1.2B", color: "#12b76a" },
    { label: "Outflows today", value: "KES 890M", color: "#f04438" },
    { label: "Net flow", value: "+KES 310M", color: "#12b76a" },
    { label: "Projected EOD", value: "KES 4.5B", color: "#2e90fa" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-arrow-left-right" tone="blue" title="Cashflow" subtitle="Today's flow summary">
      <div className="d-flex flex-column gap-2">
        {flows.map((f) => (
          <div key={f.label} className="pm-card pm-card-pad d-flex align-items-center justify-content-between">
            <span style={{ fontWeight: 700, fontSize: ".88rem" }}>{f.label}</span>
            <span style={{ fontWeight: 800, fontSize: "1rem", color: f.color }}>{f.value}</span>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 29. Reserve detail modal ============================ */
export function ReserveDetailModal({ pool, onClose }: { pool: LiquidityPool | null; onClose: () => void }) {
  if (!pool) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-shield" tone="blue" title="Reserve detail" subtitle={pool.name}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Total balance</span><span className="v pm-num" style={{ fontWeight: 700 }}>{kes(pool.balance)}</span></div>
        <div className="pm-kv"><span className="k">Reserved</span><span className="v pm-num" style={{ color: "#12b76a" }}>{kes(pool.reserved)}</span></div>
        <div className="pm-kv"><span className="k">Available</span><span className="v pm-num" style={{ color: "#2e90fa" }}>{kes(pool.balance - pool.reserved)}</span></div>
        <div className="pm-kv"><span className="k">Reserve ratio</span><span className="v pm-num">{pool.reserveRatio}%</span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 30. Stress test modal ============================ */
export function StressTestDetailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const scenarios = [
    { name: "10% outflow spike", impact: "Reserve drops to 24%", severity: "amber" },
    { name: "25% outflow spike", impact: "Reserve drops to 18%", severity: "red" },
    { name: "Partner default", impact: "KES 200M gap", severity: "red" },
    { name: "Settlement delay", impact: "4h reserve buffer", severity: "amber" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-lightning" tone="amber" title="Stress test scenarios" subtitle="Impact analysis">
      <div className="d-flex flex-column gap-2">
        {scenarios.map((s) => (
          <div key={s.name} className="pm-card pm-card-pad d-flex align-items-center gap-3">
            <i className="bi bi-exclamation-triangle" style={{ color: s.severity === "red" ? "#f04438" : "#f79009" }} />
            <div className="flex-grow-1"><div style={{ fontWeight: 700, fontSize: ".84rem" }}>{s.name}</div><div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{s.impact}</div></div>
            <Badge tone={s.severity}>{s.severity}</Badge>
          </div>
        ))}
      </div>
    </Drawer>
  );
}
