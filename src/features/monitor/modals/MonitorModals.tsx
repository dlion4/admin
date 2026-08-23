import { useState } from "react";
import { Modal, Drawer, Steps, Badge, Avatar, TwoFactorField, useToast, Meter, Sparkline } from "../../../components/ui";
import { csvDownload, jsonDownload, kes, num } from "../../../lib/format";
import type { ChannelPerf, County, FraudAlert, Incident, LiveTx, LoginEvent, SystemEvent } from "../data/monitorData";
import { DLQ_ROWS } from "../data/monitorData";

const fraudTone = (s: number) => (s <= 20 ? "green" : s <= 50 ? "amber" : s <= 75 ? "amber" : "red");

/* ============================ 1. Transaction detail drawer ============================ */
export function TxDrawer({ tx, onClose, onBlock, onReverse }: {
  tx: LiveTx | null; onClose: () => void; onBlock: (t: LiveTx) => void; onReverse: (t: LiveTx) => void;
}) {
  const { push } = useToast();
  if (!tx) return null;
  return (
    <Drawer open onClose={onClose} wide icon="bi-receipt" tone={tx.fraud > 75 ? "red" : "green"}
      title={tx.id} subtitle={`${tx.time} EAT · ${tx.type} · ${tx.channel} · ${tx.geo}`}
      headExtra={<Badge tone={fraudTone(tx.fraud)}>Fraud {tx.fraud}</Badge>}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => { jsonDownload(`${tx.id}.json`, tx); push({ kind: "success", title: "Transaction exported" }); }}>
          <i className="bi bi-download me-1" />JSON
        </button>
        <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => onReverse(tx)} disabled={tx.status !== "Complete"}
          title={tx.status !== "Complete" ? "Only completed transactions can be reversed" : "Reverse this transaction"}>
          <i className="bi bi-arrow-counterclockwise me-1" />Reverse
        </button>
        <button className="btn btn-danger btn-sm" onClick={() => onBlock(tx)}><i className="bi bi-slash-circle me-1" />Block & freeze</button>
      </>}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <div className="pm-eyebrow">Amount</div>
            <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1.6rem" }}>{kes(tx.amount)}</div>
            <div style={{ fontSize: ".75rem", color: "var(--pm-muted)" }}>Fee {kes(tx.fee)} · net {kes(tx.amount - tx.fee)}</div>
          </div>
          <div className="text-end">
            <Badge tone={tx.status === "Complete" ? "green" : tx.status === "Blocked" ? "red" : tx.status === "Held" ? "amber" : "blue"} dot>{tx.status}</Badge>
            <div style={{ fontSize: ".72rem", color: "var(--pm-muted)", marginTop: ".3rem" }}>Latency {tx.latencyMs} ms</div>
          </div>
        </div>
      </div>

      <div className="row g-2 mb-3">
        <div className="col-6">
          <div className="pm-card pm-card-pad h-100">
            <div className="pm-eyebrow mb-2">From</div>
            <div className="d-flex align-items-center gap-2"><Avatar name={tx.fromName} size="sm" />
              <div><div style={{ fontWeight: 700, fontSize: ".82rem" }}>{tx.fromName}</div><div className="mono" style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{tx.from}</div></div></div>
          </div>
        </div>
        <div className="col-6">
          <div className="pm-card pm-card-pad h-100">
            <div className="pm-eyebrow mb-2">To</div>
            {tx.toName ? (
              <div className="d-flex align-items-center gap-2"><Avatar name={tx.toName} size="sm" />
                <div><div style={{ fontWeight: 700, fontSize: ".82rem" }}>{tx.toName}</div><div className="mono" style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{tx.to ?? "—"}</div></div></div>
            ) : <div style={{ fontSize: ".82rem", color: "var(--pm-muted)" }}>Self ({tx.type.toLowerCase()})</div>}
          </div>
        </div>
      </div>

      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Rail reference</span><span className="v mono">{tx.ref}</span></div>
        <div className="pm-kv"><span className="k">Channel</span><span className="v">{tx.channel}</span></div>
        <div className="pm-kv"><span className="k">Device</span><span className="v">{tx.device}</span></div>
        <div className="pm-kv"><span className="k">Geo</span><span className="v">{tx.geo}, Kenya</span></div>
        {tx.merchant && <div className="pm-kv"><span className="k">Merchant</span><span className="v">{tx.merchant}</span></div>}
        <div className="pm-kv"><span className="k">Fraud score</span><span className="v d-flex align-items-center gap-2 justify-content-end">
          <Meter value={tx.fraud} tone={tx.fraud > 75 ? "#f04438" : tx.fraud > 50 ? "#f79009" : "#12b76a"} width={70} />{tx.fraud}</span></div>
        <div className="pm-kv"><span className="k">Screening</span><span className="v">Sanctions clear · PEP clear</span></div>
      </div>

      <div className="pm-card">
        <div className="pm-card-head"><h6 className="pm-card-title">Processing timeline</h6></div>
        <div className="p-3"><div className="pm-timeline">
          {[["Request received", `${tx.time} · API gateway`, "done"],
            ["Risk scored", `+42 ms · score ${tx.fraud} · rule set v4.2.1`, "done"],
            ["Balance reserved", `+68 ms · ledger hold placed`, "done"],
            [`${tx.channel} dispatched`, `+${Math.round(tx.latencyMs * 0.6)} ms · reference ${tx.ref}`, tx.status === "Failed" ? "danger" : "done"],
            ["Result callback", tx.status === "Pending" ? "Awaiting provider callback" : `+${tx.latencyMs} ms · ${tx.status}`, tx.status === "Pending" ? "warn" : tx.status === "Complete" ? "done" : "danger"],
            ["Ledger posted", tx.status === "Complete" ? "Double entry written · immutable" : "Not posted", tx.status === "Complete" ? "done" : ""],
          ].map(([t, d, c]) => (
            <div key={t as string} className={`pm-tl-item ${c}`}>
              <div style={{ fontWeight: 700, fontSize: ".82rem" }}>{t}</div>
              <div style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>{d}</div>
            </div>
          ))}
        </div></div>
      </div>
    </Drawer>
  );
}

/* ============================ 2. Block transaction confirm ============================ */
export function BlockTxModal({ tx, onClose, onConfirm }: { tx: LiveTx | null; onClose: () => void; onConfirm: (t: LiveTx) => void }) {
  const [reason, setReason] = useState("fraud");
  const [freeze, setFreeze] = useState(true);
  const [code, setCode] = useState("");
  if (!tx) return null;
  return (
    <Modal open onClose={onClose} tone="red" icon="bi-slash-circle-fill" size="md"
      title={`Block ${tx.id}?`} subtitle={`${kes(tx.amount)} · ${tx.fromName} · ${tx.channel}`}>
      <div className="pm-modal-body">
        <div className="pm-note mb-3" style={{ borderColor: "#fbd3cf", background: "#fef2f2", color: "#b42318" }}>
          <i className="bi bi-exclamation-octagon me-1" />Blocking stops settlement and reverses any ledger hold. The customer sees “Transaction declined — contact support”.
        </div>
        <label className="form-label">Reason code</label>
        <select className="form-select mb-3" value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="fraud">Suspected fraud</option><option value="aml">AML — structuring / layering</option>
          <option value="sanctions">Sanctions match</option><option value="mule">Mule account network</option>
          <option value="duplicate">Duplicate / erroneous</option><option value="regulator">Regulator instruction</option>
        </select>
        <label className="pm-opt mb-3">
          <input type="checkbox" className="form-check-input mt-0" checked={freeze} onChange={(e) => setFreeze(e.target.checked)} />
          <span className="flex-grow-1"><span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>Also freeze {tx.from}</span>
            <span className="d-block" style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>Prevents further money movement while the case is investigated</span></span>
        </label>
        <TwoFactorField value={code} onChange={setCode} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger btn-sm" disabled={code !== "482913"} onClick={() => onConfirm(tx)}>
          <i className="bi bi-slash-circle me-1" />Block transaction
        </button>
      </div>
    </Modal>
  );
}

/* ============================ 3. Reverse transaction modal ============================ */
export function ReverseTxModal({ tx, onClose }: { tx: LiveTx | null; onClose: () => void }) {
  const { push } = useToast();
  const [reason, setReason] = useState("duplicate");
  const [notify, setNotify] = useState(true);
  const [code, setCode] = useState("");
  if (!tx) return null;
  return (
    <Modal open onClose={onClose} tone="amber" icon="bi-arrow-counterclockwise" size="md"
      title={`Reverse ${tx.id}?`} subtitle={`${kes(tx.amount)} back to ${tx.fromName} (${tx.from})`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Original amount</span><span className="v">{kes(tx.amount)}</span></div>
          <div className="pm-kv"><span className="k">Fee to refund</span><span className="v">{kes(tx.fee)}</span></div>
          <div className="pm-kv"><span className="k">Total credited back</span><span className="v" style={{ color: "#0b8f52" }}>{kes(tx.amount + tx.fee)}</span></div>
          <div className="pm-kv"><span className="k">Rail</span><span className="v">{tx.channel} · reversal API</span></div>
          <div className="pm-kv"><span className="k">Expected settlement</span><span className="v">{tx.channel.includes("Card") ? "3–5 business days" : "Real time"}</span></div>
        </div>
        <label className="form-label">Reversal reason</label>
        <select className="form-select mb-3" value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="duplicate">Duplicate charge</option><option value="error">Operational error</option>
          <option value="fraud">Confirmed fraud</option><option value="dispute">Customer dispute upheld</option>
          <option value="regulator">Regulator instruction</option>
        </select>
        <label className="pm-opt mb-3">
          <input type="checkbox" className="form-check-input mt-0" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
          <span style={{ fontWeight: 700, fontSize: ".85rem" }}>Notify the customer by SMS and push</span>
        </label>
        <TwoFactorField value={code} onChange={setCode} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => {
          push({ kind: "success", title: `${tx.id} reversed`, body: `${kes(tx.amount + tx.fee)} credited back · REV-2026-0441 created.` }); onClose();
        }}><i className="bi bi-arrow-counterclockwise me-1" />Reverse transaction</button>
      </div>
    </Modal>
  );
}

/* ============================ 4. Stream filter drawer ============================ */
export type StreamFilters = {
  channels: string[]; types: string[]; statuses: string[]; minFraud: number; minAmount: number; county: string;
};
export function StreamFilterDrawer({ open, onClose, filters, onApply }: {
  open: boolean; onClose: () => void; filters: StreamFilters; onApply: (f: StreamFilters) => void;
}) {
  const { push } = useToast();
  const [f, setF] = useState<StreamFilters>(filters);
  const toggle = (key: "channels" | "types" | "statuses", v: string) =>
    setF({ ...f, [key]: f[key].includes(v) ? f[key].filter((x) => x !== v) : [...f[key], v] });
  return (
    <Drawer open={open} onClose={onClose} icon="bi-funnel-fill" tone="blue" title="Filter live stream"
      subtitle="Filters apply instantly and persist while the stream is running."
      footer={<>
        <button className="btn btn-outline-secondary btn-sm flex-grow-1"
          onClick={() => { const cleared = { channels: [], types: [], statuses: [], minFraud: 0, minAmount: 0, county: "all" }; setF(cleared); onApply(cleared); push({ kind: "info", title: "Filters cleared" }); }}>
          Clear all
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => { onApply(f); onClose(); push({ kind: "success", title: "Filters applied" }); }}>Apply filters</button>
      </>}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-eyebrow mb-2">Channel</div>
        <div className="d-flex gap-1 flex-wrap">
          {["M-Pesa", "Card (Visa)", "Card (Mastercard)", "Bank", "Internal", "ATM", "PesaLink", "PayPal"].map((c) => (
            <button key={c} className={`pm-chip ${f.channels.includes(c) ? "active" : ""}`} onClick={() => toggle("channels", c)}>{c}</button>
          ))}
        </div>
      </div>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-eyebrow mb-2">Transaction type</div>
        <div className="d-flex gap-1 flex-wrap">
          {["Transfer", "Withdrawal", "Payment", "Deposit", "Bill pay", "Airtime", "Loan repay", "Card auth"].map((c) => (
            <button key={c} className={`pm-chip ${f.types.includes(c) ? "active" : ""}`} onClick={() => toggle("types", c)}>{c}</button>
          ))}
        </div>
      </div>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-eyebrow mb-2">Status</div>
        <div className="d-flex gap-1 flex-wrap">
          {["Complete", "Pending", "Failed", "Held", "Blocked"].map((c) => (
            <button key={c} className={`pm-chip ${f.statuses.includes(c) ? "active" : ""}`} onClick={() => toggle("statuses", c)}>{c}</button>
          ))}
        </div>
      </div>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-eyebrow mb-2">Minimum fraud score — {f.minFraud}</div>
        <input type="range" className="form-range" min={0} max={100} step={5} value={f.minFraud} onChange={(e) => setF({ ...f, minFraud: Number(e.target.value) })} />
        <div className="d-flex justify-content-between" style={{ fontSize: ".68rem", color: "var(--pm-muted)" }}>
          <span>0 — all</span><span>21–50 low</span><span>51–75 elevated</span><span>76+ critical</span>
        </div>
      </div>
      <div className="pm-card pm-card-pad">
        <div className="pm-eyebrow mb-2">Minimum amount — {kes(f.minAmount)}</div>
        <input type="range" className="form-range mb-3" min={0} max={500000} step={5000} value={f.minAmount} onChange={(e) => setF({ ...f, minAmount: Number(e.target.value) })} />
        <div className="pm-eyebrow mb-2">County</div>
        <select className="form-select" value={f.county} onChange={(e) => setF({ ...f, county: e.target.value })}>
          <option value="all">All counties</option>
          {["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Uasin Gishu", "Machakos", "Nyeri", "Kakamega", "Kiambu", "Kilifi", "Kisii", "Meru", "Bungoma", "Trans Nzoia"].map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
    </Drawer>
  );
}

/* ============================ 5. County drill-down modal ============================ */
export function CountyModal({ county, onClose }: { county: County | null; onClose: () => void }) {
  const { push } = useToast();
  if (!county) return null;
  const rails = [
    { r: "M-Pesa", pct: 0.58 }, { r: "Card", pct: 0.19 }, { r: "Internal", pct: 0.12 }, { r: "Bank / PesaLink", pct: 0.08 }, { r: "ATM", pct: 0.03 },
  ];
  return (
    <Modal open onClose={onClose} tone="green" icon="bi-geo-alt-fill" size="lg"
      title={`${county.name} County`} subtitle={`${num(county.txns)} transactions in the last hour · ${county.agents} active agents`}>
      <div className="pm-modal-body">
        <div className="row g-2 mb-3">
          {[{ l: "Transactions (1h)", v: num(county.txns) }, { l: "Volume (1h)", v: kes(county.volume, { compact: true }) },
            { l: "Growth vs last week", v: `${county.growth > 0 ? "+" : ""}${county.growth}%` }, { l: "Agent network", v: num(county.agents) }].map((x) => (
            <div className="col-6 col-lg-3" key={x.l}><div className="pm-stat"><div className="pm-stat-label">{x.l}</div>
              <div className="pm-stat-value" style={{ fontSize: "1.05rem" }}>{x.v}</div></div></div>
          ))}
        </div>
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-eyebrow mb-2">Rail mix in {county.name}</div>
          <div className="pm-bar-track mb-2">
            {rails.map((r, i) => (
              <div key={r.r} title={`${r.r} ${(r.pct * 100).toFixed(0)}%`} style={{ width: `${r.pct * 100}%`, background: ["#12b76a", "#2e90fa", "#16b364", "#7a5af8", "#98a2b3"][i] }} />
            ))}
          </div>
          <div className="d-flex gap-3 flex-wrap">
            {rails.map((r, i) => (
              <span key={r.r} style={{ fontSize: ".74rem" }}>
                <span className="pm-legend-dot me-1" style={{ background: ["#12b76a", "#2e90fa", "#16b364", "#7a5af8", "#98a2b3"][i] }} />
                {r.r} {(r.pct * 100).toFixed(0)}%
              </span>
            ))}
          </div>
        </div>
        <div className="pm-card pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Top merchant</th><th className="text-end">Transactions</th><th className="text-end">Volume</th><th className="text-end">Avg ticket</th></tr></thead>
            <tbody>
              {[county.topMerchant, "Quickmart", "Total Energies", "KPLC Prepaid", "Safaricom Airtime", "Java House"].map((m, i) => (
                <tr key={m}>
                  <td className="pm-td-strong">{m}</td>
                  <td className="text-end pm-num">{num(Math.round(county.txns * (0.18 - i * 0.025)))}</td>
                  <td className="text-end pm-num">{kes(Math.round(county.volume * (0.2 - i * 0.028)), { compact: true })}</td>
                  <td className="text-end pm-num">{kes(1200 + i * 840)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => { csvDownload(`${county.name}-hourly.csv`, [county as unknown as Record<string, unknown>]); push({ kind: "success", title: `${county.name} data exported` }); }}>
          <i className="bi bi-download me-1" />Export county
        </button>
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ============================ 6. Login detail drawer ============================ */
export function LoginDrawer({ event, onClose, onBlacklist }: { event: LoginEvent | null; onClose: () => void; onBlacklist: (e: LoginEvent) => void }) {
  const { push } = useToast();
  if (!event) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-person-lock" tone={event.risk === "High" ? "red" : event.risk === "Medium" ? "amber" : "green"}
      title={`${event.name}`} subtitle={`${event.id} · ${event.time} EAT · ${event.method}`}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => push({ kind: "success", title: "Step-up challenge sent", body: `${event.name} must re-authenticate with a passkey.` })}>
          <i className="bi bi-shield-lock me-1" />Force step-up
        </button>
        <button className="btn btn-danger btn-sm" onClick={() => onBlacklist(event)}><i className="bi bi-fingerprint me-1" />Blacklist device</button>
      </>}>
      <div className="pm-card pm-card-pad mb-3 d-flex align-items-center gap-3">
        <Avatar name={event.name} size="lg" />
        <div className="flex-grow-1">
          <div style={{ fontWeight: 700 }}>{event.name}</div>
          <div className="mono" style={{ fontSize: ".76rem", color: "var(--pm-muted)" }}>{event.user}</div>
          <div className="d-flex gap-1 mt-1">
            <Badge tone={event.status === "Success" ? "green" : event.status === "Failed" ? "red" : "amber"} dot>{event.status}</Badge>
            <Badge tone={event.risk === "High" ? "red" : event.risk === "Medium" ? "amber" : "green"}>{event.risk} risk</Badge>
          </div>
        </div>
      </div>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Method</span><span className="v">{event.method}</span></div>
        <div className="pm-kv"><span className="k">Device</span><span className="v">{event.device}</span></div>
        <div className="pm-kv"><span className="k">IP address</span><span className="v mono">{event.ip}</span></div>
        <div className="pm-kv"><span className="k">Location</span><span className="v">{event.location}</span></div>
        {event.reason && <div className="pm-kv"><span className="k">Failure reason</span><span className="v" style={{ color: "#d92d20" }}>{event.reason}</span></div>}
        <div className="pm-kv"><span className="k">Device fingerprint</span><span className="v mono" style={{ fontSize: ".72rem" }}>fp_{event.id.slice(-5)}a3c9</span></div>
        <div className="pm-kv"><span className="k">Previous logins (30d)</span><span className="v">{14 + (event.id.length % 20)}</span></div>
      </div>
      <div className="pm-card">
        <div className="pm-card-head"><h6 className="pm-card-title">Risk signals</h6></div>
        <div className="p-3">
          {[["Known device", event.risk === "High" ? "No — first seen today" : "Yes — used 14 times", event.risk === "High"],
            ["Geo-velocity", event.location.includes("Unknown") ? "Impossible travel detected" : "Consistent with history", event.location.includes("Unknown")],
            ["IP reputation", event.risk === "High" ? "Datacentre / VPN range" : "Residential mobile (Safaricom)", event.risk === "High"],
            ["Behaviour match", event.risk === "Low" ? "98% match to profile" : "62% match to profile", event.risk !== "Low"],
            ["SIM swap check", "No change in the last 30 days", false]].map(([l, v, bad]) => (
            <div key={l as string} className="pm-kv"><span className="k">{l}</span>
              <span className="v"><Badge tone={bad ? "red" : "green"}>{v}</Badge></span></div>
          ))}
        </div>
      </div>
    </Drawer>
  );
}

/* ============================ 7. Blacklist device modal ============================ */
export function BlacklistModal({ event, onClose }: { event: LoginEvent | null; onClose: () => void }) {
  const { push } = useToast();
  const [scope, setScope] = useState("device");
  const [duration, setDuration] = useState("permanent");
  const [code, setCode] = useState("");
  if (!event) return null;
  return (
    <Modal open onClose={onClose} tone="red" icon="bi-fingerprint" size="md"
      title="Blacklist device fingerprint" subtitle={`fp_${event.id.slice(-5)}a3c9 · ${event.device}`}>
      <div className="pm-modal-body">
        <label className="form-label">Blacklist scope</label>
        <div className="d-flex flex-column gap-2 mb-3">
          {[{ id: "device", l: "This device fingerprint", d: "Affects 1 device across all accounts" },
            { id: "ip", l: "IP address", d: `${event.ip} — may affect other legitimate users` },
            { id: "asn", l: "Entire ASN", d: "Blocks the whole hosting provider range" },
            { id: "cluster", l: "Linked device cluster", d: "6 fingerprints sharing hardware signals" }].map((s) => (
            <button key={s.id} className={`pm-opt ${scope === s.id ? "active" : ""}`} onClick={() => setScope(s.id)}>
              <span className="r" /><span className="flex-grow-1">
                <span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>{s.l}</span>
                <span className="d-block" style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>{s.d}</span></span>
            </button>
          ))}
        </div>
        <label className="form-label">Duration</label>
        <div className="d-flex gap-1 flex-wrap mb-3">
          {[["24h", "24 hours"], ["7d", "7 days"], ["30d", "30 days"], ["permanent", "Permanent"]].map(([v, l]) => (
            <button key={v} className={`pm-chip ${duration === v ? "active" : ""}`} onClick={() => setDuration(v)}>{l}</button>
          ))}
        </div>
        <TwoFactorField value={code} onChange={setCode} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger btn-sm" disabled={code !== "482913"} onClick={() => {
          push({ kind: "success", title: "Device blacklisted", body: `${scope} · ${duration} · entry BLK-2026-0412 written to the audit log.` }); onClose();
        }}><i className="bi bi-fingerprint me-1" />Add to blacklist</button>
      </div>
    </Modal>
  );
}

/* ============================ 8. Channel performance drawer ============================ */
export function ChannelPerfDrawer({ channel, onClose, onBreaker }: { channel: ChannelPerf | null; onClose: () => void; onBreaker: (c: ChannelPerf) => void }) {
  const { push } = useToast();
  if (!channel) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-diagram-3" tone={channel.breaker === "Open" ? "red" : "green"}
      title={channel.channel} subtitle={`${channel.provider} · breaker ${channel.breaker.toLowerCase()}`}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => push({ kind: "success", title: `${channel.channel} probe sent`, body: "Health check returned 200 OK in 284 ms." })}>
          <i className="bi bi-activity me-1" />Ping endpoint
        </button>
        <button className="btn btn-danger btn-sm" onClick={() => onBreaker(channel)}>
          <i className="bi bi-toggles me-1" />{channel.breaker === "Open" ? "Force close" : "Force open"}
        </button>
      </>}>
      <div className="row g-2 mb-3">
        {[{ l: "Transactions / min", v: num(channel.tpm) }, { l: "Volume / min", v: kes(channel.volPerMin, { compact: true }) },
          { l: "Success rate", v: channel.success ? `${channel.success}%` : "—" }, { l: "Errors (1h)", v: String(channel.errors) }].map((x) => (
          <div className="col-6" key={x.l}><div className="pm-stat"><div className="pm-stat-label">{x.l}</div>
            <div className="pm-stat-value" style={{ fontSize: "1rem" }}>{x.v}</div></div></div>
        ))}
      </div>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-eyebrow mb-2">Throughput — last 16 minutes</div>
        <Sparkline data={channel.trend} color={channel.color} w={420} h={70} />
      </div>
      <div className="pm-card mb-3">
        <div className="pm-card-head"><h6 className="pm-card-title">Circuit breaker</h6>
          <Badge tone={channel.breaker === "Closed" ? "green" : channel.breaker === "Half-open" ? "amber" : "red"} dot>{channel.breaker}</Badge></div>
        <div className="p-3">
          <div className="pm-kv"><span className="k">Failure threshold</span><span className="v">5 failures in 1 minute</span></div>
          <div className="pm-kv"><span className="k">Recovery threshold</span><span className="v">3 successes in 1 minute</span></div>
          <div className="pm-kv"><span className="k">Half-open probes</span><span className="v">5 requests</span></div>
          <div className="pm-kv"><span className="k">Current failures</span><span className="v">{channel.errors}</span></div>
          <div className="pm-kv"><span className="k">Last state change</span><span className="v">{channel.breaker === "Open" ? "14:28:00" : "—"}</span></div>
        </div>
      </div>
      <div className="pm-card">
        <div className="pm-card-head"><h6 className="pm-card-title">Latency distribution (current hour)</h6></div>
        <div className="p-3">
          {[["0–100 ms", channel.channel.includes("Card") ? 95 : 4], ["100–500 ms", channel.channel.includes("Card") ? 5 : 12],
            ["500 ms–1 s", 18], ["1–5 s", channel.channel === "M-Pesa" ? 52 : 30], ["5–10 s", channel.channel === "M-Pesa" ? 12 : 6], ["> 10 s", 3]].map(([l, v]) => (
            <div key={l as string} className="d-flex align-items-center gap-2 py-1">
              <span style={{ fontSize: ".76rem", width: 90 }}>{l}</span>
              <Meter value={v as number} tone={(v as number) > 40 ? "#12b76a" : "#2e90fa"} width={200} />
              <span className="pm-num">{v}%</span>
            </div>
          ))}
        </div>
      </div>
    </Drawer>
  );
}

/* ============================ 9. Circuit breaker override modal ============================ */
export function BreakerModal({ channel, onClose }: { channel: ChannelPerf | null; onClose: () => void }) {
  const { push } = useToast();
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  if (!channel) return null;
  const opening = channel.breaker !== "Open";
  return (
    <Modal open onClose={onClose} tone="red" icon="bi-toggles" size="sm"
      title={opening ? `Force circuit breaker OPEN` : `Force circuit breaker CLOSED`}
      subtitle={`${channel.channel} · ${channel.provider}`}>
      <div className="pm-modal-body">
        <div className="pm-note mb-3" style={{ borderColor: "#fbd3cf", background: "#fef2f2", color: "#b42318" }}>
          {opening
            ? "All requests to this rail will be rejected immediately with a fallback response. No automatic recovery — you must re-enable it manually."
            : "Traffic resumes immediately. If the upstream is still failing the breaker will trip again within a minute."}
        </div>
        <label className="form-label">Reason (retained in the audit log)</label>
        <textarea className="form-control mb-3" rows={3} value={reason} onChange={(e) => setReason(e.target.value)}
          placeholder={opening ? "e.g. Upstream reporting a major incident; shed load to protect the queue." : "e.g. Provider confirmed resolution at 14:45 EAT."} />
        <TwoFactorField value={code} onChange={setCode} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger btn-sm" disabled={code !== "482913" || reason.trim().length < 10} onClick={() => {
          push({ kind: "warn", title: `${channel.channel} breaker forced ${opening ? "OPEN" : "CLOSED"}`, body: "Change applied across all 24 gateway workers." }); onClose();
        }}>{opening ? "Force open" : "Force close"}</button>
      </div>
    </Modal>
  );
}

/* ============================ 10. Fraud case escalation wizard ============================ */
export function FraudEscalationWizard({ alert, onClose }: { alert: FraudAlert | null; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [decision, setDecision] = useState("sar");
  const [actions, setActions] = useState({ freeze: true, blacklist: true, reverse: false, notify: true });
  const [narrative, setNarrative] = useState("");
  const [code, setCode] = useState("");
  const steps = [{ label: "Review", icon: "bi-search" }, { label: "Decision", icon: "bi-signpost-2" }, { label: "Actions", icon: "bi-list-check" }, { label: "Narrative", icon: "bi-pencil" }, { label: "File", icon: "bi-send" }];
  if (!alert) return null;
  const close = () => { setStep(0); setNarrative(""); setCode(""); onClose(); };
  const canNext = step === 3 ? narrative.trim().length >= 25 : step === 4 ? code === "482913" : true;
  return (
    <Modal open onClose={close} tone="red" icon="bi-shield-exclamation" size="lg"
      title={`Escalate ${alert.id}`} subtitle={`${alert.name} · ${kes(alert.amount)} · score ${alert.score} · ${alert.rule}`}>
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%`, background: "#f04438" }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <>
            <div className="row g-2 mb-3">
              {[{ l: "Fraud score", v: String(alert.score) }, { l: "Amount", v: kes(alert.amount) },
                { l: "Channel", v: alert.channel }, { l: "County", v: alert.county }].map((x) => (
                <div className="col-6 col-lg-3" key={x.l}><div className="pm-stat"><div className="pm-stat-label">{x.l}</div>
                  <div className="pm-stat-value" style={{ fontSize: "1rem" }}>{x.v}</div></div></div>
              ))}
            </div>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-eyebrow mb-1">Triggering rule</div>
              <div className="mono" style={{ fontSize: ".84rem", fontWeight: 700 }}>{alert.rule}</div>
              <p style={{ fontSize: ".82rem", marginTop: ".4rem", marginBottom: 0, color: "#344054" }}>{alert.reason}</p>
            </div>
            <div className="pm-card pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Related signal</th><th>Value</th><th>Weight</th></tr></thead>
                <tbody>
                  {[["Device count (24h)", "4 unique", 0.28], ["Geo dispersion", "2 counties in 90 s", 0.24],
                    ["Amount vs profile", "5.2× the 90-day mean", 0.19], ["Beneficiary novelty", "First transfer to this account", 0.16],
                    ["Time of day", "Outside the customer's usual window", 0.08], ["Network graph", "2 hops from a known mule", 0.05]].map(([l, v, w]) => (
                    <tr key={l as string}><td className="pm-td-strong">{l}</td><td>{v}</td>
                      <td><div className="d-flex align-items-center gap-2"><Meter value={(w as number) * 300} tone="#f04438" width={70} /><span className="pm-num">{((w as number) * 100).toFixed(0)}%</span></div></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        {step === 1 && (
          <div className="d-flex flex-column gap-2">
            {[{ id: "sar", l: "File a Suspicious Activity Report", d: "Submit to the Financial Reporting Centre within 7 days", i: "bi-file-earmark-medical" },
              { id: "case", l: "Open an internal fraud case", d: "Investigate for 72 hours before deciding", i: "bi-folder2-open" },
              { id: "clear", l: "Clear as a false positive", d: "Release funds and tune the rule threshold", i: "bi-check-circle" },
              { id: "police", l: "Refer to DCI Cybercrime Unit", d: "For confirmed criminal activity above KES 500,000", i: "bi-shield-fill-exclamation" }].map((d) => (
              <button key={d.id} className={`pm-opt ${decision === d.id ? "active" : ""}`} onClick={() => setDecision(d.id)}>
                <span className="r" /><i className={`bi ${d.i}`} style={{ color: "#d92d20", fontSize: "1.05rem" }} />
                <span className="flex-grow-1"><span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>{d.l}</span>
                  <span className="d-block" style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>{d.d}</span></span>
              </button>
            ))}
          </div>
        )}
        {step === 2 && (
          <div className="d-flex flex-column gap-2">
            {[{ k: "freeze", l: `Freeze ${alert.user}`, d: "Stops all outbound money movement immediately" },
              { k: "blacklist", l: "Blacklist the device fingerprint", d: "Blocks the device across every PayMo account" },
              { k: "reverse", l: "Reverse the transaction", d: `Credit ${kes(alert.amount)} back to the originating wallet` },
              { k: "notify", l: "Notify the customer", d: "SMS + push explaining that the account is under review" }].map((a) => (
              <label key={a.k} className={`pm-opt ${actions[a.k as keyof typeof actions] ? "active" : ""}`}>
                <input type="checkbox" className="form-check-input mt-0" checked={actions[a.k as keyof typeof actions]}
                  onChange={(e) => setActions({ ...actions, [a.k]: e.target.checked })} />
                <span className="flex-grow-1"><span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>{a.l}</span>
                  <span className="d-block" style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>{a.d}</span></span>
              </label>
            ))}
          </div>
        )}
        {step === 3 && (
          <>
            <label className="form-label">SAR narrative (minimum 25 characters)</label>
            <textarea className="form-control" rows={6} value={narrative} onChange={(e) => setNarrative(e.target.value)}
              placeholder="Describe the who, what, when, where and why. This text is submitted verbatim to the FRA." />
            <div className="d-flex gap-1 flex-wrap mt-2">
              {["Structuring below reporting threshold", "Rapid movement through multiple accounts", "Device sharing across unrelated customers", "Inconsistent with declared source of funds"].map((t) => (
                <button key={t} className="pm-chip" onClick={() => setNarrative((n) => (n ? n + " " : "") + t + ".")}>{t}</button>
              ))}
            </div>
            <div className="pm-note mt-3">Narratives are reviewed by the Compliance Officer before submission. Tipping off the customer about a SAR is a criminal offence under POCAMLA.</div>
          </>
        )}
        {step === 4 && (
          <>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-kv"><span className="k">Case</span><span className="v mono">{alert.id}</span></div>
              <div className="pm-kv"><span className="k">Customer</span><span className="v">{alert.name} · {alert.user}</span></div>
              <div className="pm-kv"><span className="k">Decision</span><span className="v">{decision.toUpperCase()}</span></div>
              <div className="pm-kv"><span className="k">Actions</span><span className="v">{Object.entries(actions).filter(([, v]) => v).map(([k]) => k).join(", ") || "None"}</span></div>
              <div className="pm-kv"><span className="k">Filed by</span><span className="v">Joseph Mwangi · Tier 0</span></div>
              <div className="pm-kv"><span className="k">Deadline</span><span className="v">FRA submission within 7 days</span></div>
            </div>
            <TwoFactorField value={code} onChange={setCode} />
          </>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}><i className="bi bi-arrow-left me-1" />Back</button>}
        {step < 4 && <button className="btn btn-danger btn-sm" disabled={!canNext} onClick={() => setStep(step + 1)}>Next<i className="bi bi-arrow-right ms-1" /></button>}
        {step === 4 && <button className="btn btn-danger btn-sm" disabled={!canNext} onClick={() => {
          push({ kind: "success", title: `${alert.id} escalated`, body: `SAR-2026-036 created · ${Object.values(actions).filter(Boolean).length} actions executed.` }); close();
        }}><i className="bi bi-send me-1" />File & execute</button>}
      </div>
    </Modal>
  );
}

/* ============================ 11. Incident drawer + create wizard ============================ */
export function IncidentDrawer({ incident, onClose }: { incident: Incident | null; onClose: () => void }) {
  const { push } = useToast();
  const [update, setUpdate] = useState("");
  if (!incident) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-fire" tone={incident.severity === "P1" ? "red" : incident.severity === "P2" ? "amber" : "blue"}
      title={incident.title} subtitle={`${incident.id} · ${incident.severity} · opened ${incident.opened}`}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => push({ kind: "info", title: "War room opened", body: "Slack channel #inc-2026-0091 created and on-call invited." })}>
          <i className="bi bi-slack me-1" />War room
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => push({ kind: "success", title: `${incident.id} resolved`, body: "Postmortem task assigned to the owning guild." })}>
          <i className="bi bi-check2-circle me-1" />Resolve
        </button>
      </>}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="d-flex gap-2 flex-wrap mb-2">
          <Badge tone={incident.severity === "P1" ? "red" : incident.severity === "P2" ? "amber" : "blue"}>{incident.severity}</Badge>
          <Badge tone="grey">{incident.status}</Badge><Badge tone="violet">{incident.owner}</Badge><Badge tone="ink">{incident.service}</Badge>
        </div>
        <div className="pm-kv"><span className="k">Impact</span><span className="v">{incident.impact}</span></div>
        <div className="pm-kv"><span className="k">Opened</span><span className="v">{incident.opened}</span></div>
        <div className="pm-kv"><span className="k">Time open</span><span className="v">{incident.severity === "P2" ? "8 minutes" : "4 minutes"}</span></div>
      </div>
      <div className="pm-card mb-3">
        <div className="pm-card-head"><h6 className="pm-card-title">Timeline</h6><Badge tone="grey">{incident.updates.length} updates</Badge></div>
        <div className="p-3"><div className="pm-timeline">
          {incident.updates.map((u, i) => (
            <div key={i} className={`pm-tl-item ${i === incident.updates.length - 1 ? "warn" : "done"}`}>
              <div style={{ fontWeight: 700, fontSize: ".82rem" }}>{u.t} · {u.who}</div>
              <div style={{ fontSize: ".76rem", color: "var(--pm-muted)" }}>{u.text}</div>
            </div>
          ))}
        </div></div>
      </div>
      <div className="pm-card">
        <div className="pm-card-head"><h6 className="pm-card-title">Post an update</h6></div>
        <div className="p-3">
          <textarea className="form-control mb-2" rows={3} value={update} onChange={(e) => setUpdate(e.target.value)} placeholder="What changed?" />
          <button className="btn btn-outline-primary btn-sm" disabled={update.trim().length < 5}
            onClick={() => { push({ kind: "success", title: "Update posted", body: `${incident.id} · broadcast to the war room and status page.` }); setUpdate(""); }}>
            <i className="bi bi-send me-1" />Post update
          </button>
        </div>
      </div>
    </Drawer>
  );
}

export function IncidentWizard({ open, onClose, prefill }: { open: boolean; onClose: () => void; prefill?: string }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState(prefill ?? "");
  const [sev, setSev] = useState<"P1" | "P2" | "P3" | "P4">("P2");
  const [service, setService] = useState("mpesa-adapter");
  const [impact, setImpact] = useState("");
  const [comms, setComms] = useState({ statuspage: true, slack: true, cbk: false, customers: false });
  const steps = [{ label: "Basics", icon: "bi-pencil" }, { label: "Severity", icon: "bi-thermometer-half" }, { label: "Impact", icon: "bi-people" }, { label: "Comms", icon: "bi-megaphone" }, { label: "Open", icon: "bi-fire" }];
  const close = () => { setStep(0); onClose(); };
  return (
    <Modal open={open} onClose={close} tone="red" icon="bi-fire" size="lg"
      title="Declare an incident" subtitle="Pages the on-call rota and starts the incident clock.">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%`, background: "#f04438" }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <>
            <label className="form-label">Incident title</label>
            <input className="form-control mb-3" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Card authorisations failing for Visa BIN 489712" />
            <label className="form-label">Affected service</label>
            <select className="form-select" value={service} onChange={(e) => setService(e.target.value)}>
              {["mpesa-adapter", "visa-adapter", "mastercard-adapter", "pesalink-adapter", "ledger", "auth", "risk-engine", "settlement", "notification", "api-gateway"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </>
        )}
        {step === 1 && (
          <div className="d-flex flex-column gap-2">
            {[{ id: "P1", l: "P1 — Critical", d: "Total outage or money at risk. Page everyone, CBK notification within 2 hours." },
              { id: "P2", l: "P2 — Major", d: "Significant degradation on a major rail. Page the owning guild." },
              { id: "P3", l: "P3 — Minor", d: "Partial degradation with a workaround available." },
              { id: "P4", l: "P4 — Low", d: "Cosmetic or future-dated risk. Handle in business hours." }].map((s) => (
              <button key={s.id} className={`pm-opt ${sev === s.id ? "active" : ""}`} onClick={() => setSev(s.id as typeof sev)}>
                <span className="r" /><span className="flex-grow-1">
                  <span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>{s.l}</span>
                  <span className="d-block" style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>{s.d}</span></span>
              </button>
            ))}
          </div>
        )}
        {step === 2 && (
          <>
            <label className="form-label">Customer impact statement</label>
            <textarea className="form-control mb-3" rows={4} value={impact} onChange={(e) => setImpact(e.target.value)}
              placeholder="e.g. Approximately 12,400 customers cannot complete M-Pesa withdrawals. Value at risk KES 486,000." />
            <div className="row g-2">
              {[["Users affected", "12,400"], ["Value at risk", "KES 486,000"], ["Rails impacted", "1 of 8"], ["Workaround", "Card or PesaLink"]].map(([l, v]) => (
                <div className="col-6 col-lg-3" key={l}><div className="pm-stat"><div className="pm-stat-label">{l}</div>
                  <div className="pm-stat-value" style={{ fontSize: ".95rem" }}>{v}</div></div></div>
              ))}
            </div>
          </>
        )}
        {step === 3 && (
          <div className="d-flex flex-column gap-2">
            {[{ k: "statuspage", l: "Publish to status.paymo.co.ke", d: "Public status page entry with live updates" },
              { k: "slack", l: "Open Slack war room", d: "Creates #inc-channel and invites the on-call rota" },
              { k: "cbk", l: "Notify Central Bank of Kenya", d: "Mandatory for P1 within 2 hours" },
              { k: "customers", l: "Push notification to affected customers", d: "12,400 recipients — approved by Comms" }].map((c) => (
              <label key={c.k} className={`pm-opt ${comms[c.k as keyof typeof comms] ? "active" : ""}`}>
                <input type="checkbox" className="form-check-input mt-0" checked={comms[c.k as keyof typeof comms]}
                  onChange={(e) => setComms({ ...comms, [c.k]: e.target.checked })} />
                <span className="flex-grow-1"><span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>{c.l}</span>
                  <span className="d-block" style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>{c.d}</span></span>
              </label>
            ))}
          </div>
        )}
        {step === 4 && (
          <div className="pm-card pm-card-pad">
            <div className="pm-kv"><span className="k">Title</span><span className="v">{title || "—"}</span></div>
            <div className="pm-kv"><span className="k">Severity</span><span className="v">{sev}</span></div>
            <div className="pm-kv"><span className="k">Service</span><span className="v mono">{service}</span></div>
            <div className="pm-kv"><span className="k">Impact</span><span className="v" style={{ maxWidth: 320 }}>{impact || "—"}</span></div>
            <div className="pm-kv"><span className="k">Comms</span><span className="v">{Object.entries(comms).filter(([, v]) => v).map(([k]) => k).join(", ")}</span></div>
            <div className="pm-kv"><span className="k">Incident commander</span><span className="v">Joseph Mwangi</span></div>
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}><i className="bi bi-arrow-left me-1" />Back</button>}
        {step < 4 && <button className="btn btn-danger btn-sm" disabled={step === 0 && title.trim().length < 5} onClick={() => setStep(step + 1)}>Next<i className="bi bi-arrow-right ms-1" /></button>}
        {step === 4 && <button className="btn btn-danger btn-sm" onClick={() => {
          push({ kind: "warn", title: `${sev} incident declared`, body: `INC-2026-0092 · ${title} · on-call paged.` }); close();
        }}><i className="bi bi-fire me-1" />Declare incident</button>}
      </div>
    </Modal>
  );
}

/* ============================ 12. Threshold configuration modal ============================ */
export function ThresholdModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [rows, setRows] = useState([
    { id: "tpm", metric: "Transactions / min", warn: 350, crit: 500, channel: "Slack" },
    { id: "failedlogin", metric: "Failed logins (1h)", warn: 35, crit: 50, channel: "Slack + Email" },
    { id: "fraudalerts", metric: "Fraud alerts (1h)", warn: 10, crit: 15, channel: "PagerDuty" },
    { id: "p95", metric: "API p95 latency (ms)", warn: 300, crit: 500, channel: "Slack" },
    { id: "errorrate", metric: "Error rate (%)", warn: 0.2, crit: 0.5, channel: "PagerDuty" },
    { id: "pending", metric: "Pending transactions", warn: 700, crit: 1000, channel: "Slack" },
    { id: "queue", metric: "Job queue depth", warn: 120, crit: 200, channel: "Slack" },
    { id: "mem", metric: "Memory usage (%)", warn: 75, crit: 85, channel: "Email" },
    { id: "cpu", metric: "CPU usage (%)", warn: 70, crit: 80, channel: "Email" },
    { id: "dlq", metric: "Dead-letter queue", warn: 25, crit: 100, channel: "Slack + Email" },
  ]);
  return (
    <Modal open={open} onClose={onClose} tone="amber" icon="bi-sliders" size="lg"
      title="Alert thresholds" subtitle="Warning and critical trip points for the live metric rail.">
      <div className="pm-modal-body">
        <div className="pm-card pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Metric</th><th style={{ width: 120 }}>Warning</th><th style={{ width: 120 }}>Critical</th><th>Route to</th></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id}>
                  <td className="pm-td-strong">{r.metric}</td>
                  <td><input className="form-control form-control-sm mono" value={r.warn}
                    onChange={(e) => setRows(rows.map((x, j) => j === i ? { ...x, warn: Number(e.target.value) || 0 } : x))} /></td>
                  <td><input className="form-control form-control-sm mono" value={r.crit}
                    onChange={(e) => setRows(rows.map((x, j) => j === i ? { ...x, crit: Number(e.target.value) || 0 } : x))} /></td>
                  <td><select className="form-select form-select-sm" value={r.channel}
                    onChange={(e) => setRows(rows.map((x, j) => j === i ? { ...x, channel: e.target.value } : x))}>
                    {["Slack", "Email", "Slack + Email", "PagerDuty", "None"].map((c) => <option key={c}>{c}</option>)}
                  </select></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pm-note mt-3">Thresholds are evaluated every 10 seconds against a 1-minute rolling window. Two consecutive breaches are required before an alert fires, which suppresses single-sample noise.</div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => csvDownload("alert-thresholds.csv", rows)}><i className="bi bi-download me-1" />Export</button>
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Thresholds saved", body: "10 rules updated · applied to all monitoring workers." }); onClose(); }}>
          <i className="bi bi-check2 me-1" />Save thresholds
        </button>
      </div>
    </Modal>
  );
}

/* ============================ 13. DLQ management modal ============================ */
export function DlqModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [sel, setSel] = useState<string[]>([]);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  return (
    <Modal open={open} onClose={onClose} tone="amber" icon="bi-inboxes-fill" size="xl"
      title="Dead-letter queue" subtitle={`${DLQ_ROWS.length} messages awaiting retry or manual review · oldest 14:10 EAT`}>
      <div className="pm-modal-body">
        {sel.length > 0 && (
          <div className="pm-bulkbar mx-0 mb-2">
            <b style={{ fontSize: ".82rem" }}>{sel.length} selected</b>
            <button className="btn btn-sm btn-light" onClick={() => { push({ kind: "success", title: `${sel.length} messages retried`, body: "Replayed against the live consumers." }); setSel([]); }}>
              <i className="bi bi-arrow-clockwise me-1" />Retry now
            </button>
            <button className="btn btn-sm btn-light" onClick={() => { push({ kind: "info", title: "Moved to manual queue", body: `${sel.length} messages routed to the ops review queue.` }); setSel([]); }}>
              <i className="bi bi-arrow-right-circle me-1" />Move to manual
            </button>
            <button className="btn btn-sm btn-danger ms-auto" onClick={() => setConfirmDiscard(true)}><i className="bi bi-trash me-1" />Discard</button>
          </div>
        )}
        <div className="pm-card pm-table-wrap" style={{ maxHeight: 380, overflowY: "auto" }}>
          <table className="pm-table">
            <thead><tr>
              <th style={{ width: 34 }}><input type="checkbox" className="form-check-input"
                checked={sel.length === DLQ_ROWS.length} onChange={(e) => setSel(e.target.checked ? DLQ_ROWS.map((r) => r.id) : [])} /></th>
              <th>Message</th><th>Queue</th><th>Payload</th><th>Error</th><th>Retries</th><th>Next action</th><th>Expires</th>
            </tr></thead>
            <tbody>
              {DLQ_ROWS.map((r) => (
                <tr key={r.id} className={sel.includes(r.id) ? "selected" : ""}>
                  <td><input type="checkbox" className="form-check-input" checked={sel.includes(r.id)}
                    onChange={(e) => setSel(e.target.checked ? [...sel, r.id] : sel.filter((x) => x !== r.id))} /></td>
                  <td className="mono pm-td-strong">{r.id}</td>
                  <td><Badge tone="grey">{r.queue}</Badge></td>
                  <td className="mono" style={{ fontSize: ".74rem" }}>{r.payload}</td>
                  <td><Badge tone={r.error.includes("Timeout") ? "amber" : "red"}>{r.error}</Badge></td>
                  <td className="pm-num">{r.retries}</td>
                  <td style={{ fontSize: ".76rem" }}>{r.next}</td>
                  <td className="mono" style={{ fontSize: ".74rem" }}>{r.expires}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => { csvDownload("dlq.csv", DLQ_ROWS); push({ kind: "success", title: "DLQ exported" }); }}>
          <i className="bi bi-download me-1" />Export queue
        </button>
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Bulk retry started", body: `${DLQ_ROWS.length} messages queued for immediate replay.` }); onClose(); }}>
          <i className="bi bi-arrow-clockwise me-1" />Retry all
        </button>
      </div>

      <Modal open={confirmDiscard} onClose={() => setConfirmDiscard(false)} tone="red" icon="bi-trash" size="sm"
        title={`Discard ${sel.length} messages?`} subtitle="This permanently removes them from the queue.">
        <div className="pm-modal-body">
          <div className="pm-note" style={{ borderColor: "#fbd3cf", background: "#fef2f2", color: "#b42318" }}>
            Discarded payments are not automatically refunded. Confirm with Finance before discarding anything in a payment queue.
          </div>
        </div>
        <div className="pm-modal-foot">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setConfirmDiscard(false)}>Cancel</button>
          <button className="btn btn-danger btn-sm" onClick={() => { push({ kind: "warn", title: `${sel.length} messages discarded` }); setSel([]); setConfirmDiscard(false); }}>Discard permanently</button>
        </div>
      </Modal>
    </Modal>
  );
}

/* ============================ 14. System event drawer ============================ */
export function EventDrawer({ event, onClose, onIncident }: { event: SystemEvent | null; onClose: () => void; onIncident: (title: string) => void }) {
  const { push } = useToast();
  if (!event) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-terminal" tone={event.severity === "error" ? "red" : event.severity === "warn" ? "amber" : "blue"}
      title={event.message} subtitle={`${event.id} · ${event.time} EAT · ${event.service}`}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => { jsonDownload(`${event.id}.json`, event); push({ kind: "success", title: "Event exported" }); }}>
          <i className="bi bi-download me-1" />Export
        </button>
        <button className="btn btn-danger btn-sm" onClick={() => onIncident(event.message)}><i className="bi bi-fire me-1" />Declare incident</button>
      </>}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="d-flex gap-2 mb-2">
          <Badge tone={event.severity === "error" ? "red" : event.severity === "warn" ? "amber" : "blue"}>{event.severity.toUpperCase()}</Badge>
          <Badge tone="ink">{event.service}</Badge>
        </div>
        <p style={{ fontSize: ".85rem", margin: 0, color: "#344054" }}>{event.detail}</p>
      </div>
      <div className="pm-card mb-3">
        <div className="pm-card-head"><h6 className="pm-card-title">Raw log line</h6></div>
        <div className="p-3"><div className="pm-code">{`{
  "ts": "2026-08-24T${event.time}+03:00",
  "level": "${event.severity}",
  "service": "${event.service}",
  "event": "${event.message}",
  "detail": "${event.detail}",
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "region": "af-south-1"
}`}</div></div>
      </div>
      <div className="pm-card">
        <div className="pm-card-head"><h6 className="pm-card-title">Related events on {event.service}</h6></div>
        <div className="p-3">
          <div className="pm-kv"><span className="k">Events (1h)</span><span className="v">{12 + (event.id.length % 30)}</span></div>
          <div className="pm-kv"><span className="k">Errors (1h)</span><span className="v">{event.severity === "error" ? 5 : 0}</span></div>
          <div className="pm-kv"><span className="k">Deploy version</span><span className="v mono">v2026.8.21-rc3</span></div>
          <div className="pm-kv"><span className="k">Owning guild</span><span className="v">Platform Operations</span></div>
        </div>
      </div>
    </Drawer>
  );
}

/* ============================ 15. Live snapshot export modal ============================ */
export function SnapshotModal({ open, onClose, rows }: { open: boolean; onClose: () => void; rows: Record<string, unknown>[] }) {
  const { push } = useToast();
  const [fmt, setFmt] = useState("csv");
  const [includeMeta, setIncludeMeta] = useState(true);
  return (
    <Modal open={open} onClose={onClose} tone="blue" icon="bi-camera" size="sm"
      title="Export live snapshot" subtitle={`Freezes the current ${rows.length}-row stream buffer.`}>
      <div className="pm-modal-body">
        <label className="form-label">Format</label>
        <div className="d-flex gap-2 mb-3">
          {[["csv", "bi-filetype-csv", "CSV"], ["json", "bi-filetype-json", "JSON"]].map(([v, i, l]) => (
            <button key={v} className={`pm-opt ${fmt === v ? "active" : ""}`} style={{ flexDirection: "column", gap: ".3rem" }} onClick={() => setFmt(v)}>
              <i className={`bi ${i}`} style={{ fontSize: "1.3rem", color: fmt === v ? "var(--pm-green)" : "var(--pm-muted)" }} />
              <span style={{ fontSize: ".76rem", fontWeight: 700 }}>{l}</span>
            </button>
          ))}
        </div>
        <label className="pm-opt">
          <input type="checkbox" className="form-check-input mt-0" checked={includeMeta} onChange={(e) => setIncludeMeta(e.target.checked)} />
          <span style={{ fontSize: ".84rem", fontWeight: 700 }}>Include capture metadata & watermark</span>
        </label>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => {
          const data = includeMeta ? rows.map((r) => ({ ...r, captured_by: "Joseph Mwangi", captured_at: new Date().toISOString() })) : rows;
          if (fmt === "json") jsonDownload("live-stream-snapshot.json", data);
          else csvDownload("live-stream-snapshot.csv", data);
          push({ kind: "success", title: "Snapshot exported", body: `${rows.length} rows written.` }); onClose();
        }}><i className="bi bi-download me-1" />Export snapshot</button>
      </div>
    </Modal>
  );
}

/* ============================ 16. Bulk hold modal ============================ */
export function BulkHoldModal({ open, onClose, count, onDone }: { open: boolean; onClose: () => void; count: number; onDone: () => void }) {
  const [action, setAction] = useState("hold");
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  return (
    <Modal open={open} onClose={onClose} tone="amber" icon="bi-pause-circle" size="sm"
      title={`Bulk action on ${count} transactions`} subtitle="Applied atomically with a single audit batch reference.">
      <div className="pm-modal-body">
        <div className="d-flex flex-column gap-2 mb-3">
          {[{ id: "hold", l: "Hold for review", i: "bi-pause-circle" }, { id: "release", l: "Release hold", i: "bi-play-circle" },
            { id: "block", l: "Block permanently", i: "bi-slash-circle" }, { id: "flag", l: "Flag for the fraud team", i: "bi-flag" }].map((a) => (
            <button key={a.id} className={`pm-opt ${action === a.id ? "active" : ""}`} onClick={() => setAction(a.id)}>
              <span className="r" /><i className={`bi ${a.i}`} style={{ color: "#b54708" }} />
              <span style={{ fontWeight: 700, fontSize: ".85rem" }}>{a.l}</span>
            </button>
          ))}
        </div>
        <label className="form-label">Reason</label>
        <textarea className="form-control mb-3" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
        <TwoFactorField value={code} onChange={setCode} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={code !== "482913" || reason.trim().length < 5} onClick={() => { onDone(); onClose(); }}>
          Apply to {count}
        </button>
      </div>
    </Modal>
  );
}
