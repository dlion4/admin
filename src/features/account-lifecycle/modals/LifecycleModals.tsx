import { useState } from "react";
import { Modal, Drawer, Steps, Badge, Avatar, TwoFactorField, useToast, Meter } from "../../../components/ui";
import { csvDownload, jsonDownload, kes, num } from "../../../lib/format";
import {
  CAMPAIGNS, COHORT_RETENTION, DORMANT_USERS, MONTHLY_FLOW,
  type Campaign, type ClosureRequest, type DormantUser, type FunnelStage,
} from "../data/lifecycleData";

const tierTone = (t: string) => t === "VIP" ? "violet" : t === "Business" ? "blue" : t === "Agent" ? "amber" : "grey";
const bucketTone = (b: string) => b === "365d" ? "red" : b === "180d" ? "amber" : b === "90d" ? "blue" : "grey";

/* ============================ 1. Dormant user drawer ============================ */
export function DormantDrawer({ user, onClose, onWinback, onSweep, onDetail }: {
  user: DormantUser | null; onClose: () => void; onWinback: (u: DormantUser) => void; onSweep: (u: DormantUser) => void; onDetail: (u: DormantUser) => void;
}) {
  if (!user) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-moon" tone={user.bucket === "365d" ? "red" : "amber"}
      title={user.name} subtitle={`${user.userId} · dormant ${user.dormantDays} days · ${user.bucket} bucket`}
      headExtra={<Badge tone={tierTone(user.tier)}>{user.tier}</Badge>}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => onDetail(user)}><i className="bi bi-person-badge me-1" />360° profile</button>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => onSweep(user)}><i className="bi bi-box-arrow-up me-1" />Balance sweep</button>
        <button className="btn btn-primary btn-sm flex-grow-1" onClick={() => onWinback(user)}><i className="bi bi-arrow-counterclockwise me-1" />Win-back</button>
      </>}>
      <div className="row g-2 mb-3">
        {[{ l: "Dormant", v: `${user.dormantDays} days` }, { l: "Balance", v: kes(user.balance) },
          { l: "Lifetime volume", v: kes(user.lifetimeVolume, { compact: true }) }, { l: "Lifetime txns", v: num(user.lifetimeTxns) }].map((x) => (
          <div className="col-6" key={x.l}><div className="pm-stat"><div className="pm-stat-label">{x.l}</div>
            <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1rem" }}>{x.v}</div></div></div>
        ))}
      </div>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Phone</span><span className="v mono">{user.phone}</span></div>
        <div className="pm-kv"><span className="k">County</span><span className="v">{user.county}</span></div>
        <div className="pm-kv"><span className="k">Primary channel</span><span className="v">{user.channel}</span></div>
        <div className="pm-kv"><span className="k">Last transaction</span><span className="v">{user.lastTxn}</span></div>
        <div className="pm-kv"><span className="k">Last login</span><span className="v">{user.lastLogin}</span></div>
        <div className="pm-kv"><span className="k">Win-back attempted</span><span className="v">{user.winback ? "Yes — CMP-2210" : "Not yet"}</span></div>
        <div className="pm-kv"><span className="k">Inferred reason</span><span className="v" style={{ maxWidth: 240 }}>{user.reason}</span></div>
      </div>
      <div className="pm-card">
        <div className="pm-card-head"><h6 className="pm-card-title">Dormancy timeline</h6></div>
        <div className="p-3"><div className="pm-timeline">
          {[["Last active transaction", user.lastTxn, "done"], ["Crossed 30 days idle", "First dormancy nudge sent (push)", "warn"],
            ["Crossed 90 days idle", "SMS win-back sent · not opened", "warn"],
            [user.bucket === "365d" ? "Crossed 365 days" : "Closure policy", user.bucket === "365d" ? "Balance sweep notice sent" : "Auto-closure scheduled at 395 days idle", user.bucket === "365d" ? "danger" : "warn"],
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

/* ============================ 2. Win-back wizard (single user) ============================ */
export function WinbackWizard({ user, onClose, onDone }: { user: DormantUser | null; onClose: () => void; onDone: (u: DormantUser, offer: string) => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [offer, setOffer] = useState("fee-credit");
  const [channels, setChannels] = useState({ push: user?.channel !== "USSD", sms: true, email: false, call: false });
  const [message, setMessage] = useState("Hi {{first_name}}, we saved your PayMo account. Get KES 50 off fees for 30 days when you transact this week.");
  const [code, setCode] = useState("");
  const steps = [{ label: "Offer", icon: "bi-gift" }, { label: "Message", icon: "bi-chat-dots" }, { label: "Channel", icon: "bi-broadcast" }, { label: "Confirm", icon: "bi-check2" }];
  const offers = [
    { id: "fee-credit", l: "KES 50 fee credit (30 days)", d: "Best conversion for 90d+ sleepers · KES 50 cost", c: "KES 50" },
    { id: "transfer-fee", l: "Free transfer this week", d: "One KES 0 transfer fee · high pull for remitters", c: "KES 45" },
    { id: "savings-boost", l: "2% savings boost (14 days)", d: "Only if they ever used savings lock", c: "KES 12" },
    { id: "no-offer", l: "No incentive", d: "Pure reminder · zero cost", c: "KES 0" },
  ];
  const close = () => { setStep(0); setCode(""); onClose(); };
  if (!user) return null;
  const cost = (offers.find((o) => o.id === offer)?.c ?? "KES 0").replace("KES ", "") as unknown as number;
  const chCount = Object.values(channels).filter(Boolean).length;
  return (
    <Modal open onClose={close} tone="green" icon="bi-arrow-counterclockwise" size="lg"
      title={`Win back — ${user.name}`} subtitle={`${user.userId} · dormant ${user.dormantDays} days · balance ${kes(user.balance)}`}>
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div className="d-flex flex-column gap-2">
            {offers.map((o) => (
              <button key={o.id} className={`pm-opt ${offer === o.id ? "active" : ""}`} onClick={() => setOffer(o.id)}>
                <span className="r" /><span className="flex-grow-1">
                  <span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>{o.l}</span>
                  <span className="d-block" style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>{o.d}</span></span>
                <Badge tone="grey">{o.c}</Badge>
              </button>
            ))}
          </div>
        )}
        {step === 1 && (
          <>
            <label className="form-label">Message</label>
            <textarea className="form-control mb-2" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
            <div className="d-flex gap-1 flex-wrap">
              {["{{first_name}}", "{{balance}}", "{{dormant_days}}"].map((f) => (
                <button key={f} className="pm-chip mono" onClick={() => setMessage((m) => m + " " + f)}>{f}</button>
              ))}
            </div>
            <div className="pm-card pm-card-pad mt-3" style={{ background: "#f7f9fc" }}>
              <div className="pm-eyebrow mb-2">Push preview</div>
              <div className="d-flex gap-2 p-2" style={{ background: "#fff", border: "1px solid var(--pm-border)", borderRadius: 12 }}>
                <div className="pm-avatar sm" style={{ background: "#12b76a" }}>P</div>
                <div><div style={{ fontWeight: 700, fontSize: ".8rem" }}>Your PayMo account is saved</div>
                  <div style={{ fontSize: ".74rem", color: "var(--pm-muted)" }}>{message.replace("{{first_name}}", user.name.split(" ")[0])}</div></div>
              </div>
            </div>
          </>
        )}
        {step === 2 && (
          <div className="d-flex flex-column gap-2">
            {[{ k: "push", l: "Push notification", d: "Free · only if opted in and app installed" },
              { k: "sms", l: "SMS", d: "KES 0.80 · 99.4% delivery" },
              { k: "email", l: "Email", d: "Free · low reach for mobile-first users" },
              { k: "call", l: "Agent callback", d: "KES 35 · only for VIP / Business", i: user.tier === "VIP" || user.tier === "Business" }].map((c) => (
              <label key={c.k} className={`pm-opt ${channels[c.k as keyof typeof channels] ? "active" : ""}`}>
                <input type="checkbox" className="form-check-input mt-0" checked={channels[c.k as keyof typeof channels]}
                  onChange={(e) => setChannels({ ...channels, [c.k]: e.target.checked })} />
                <span className="flex-grow-1"><span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>{c.l}</span>
                  <span className="d-block" style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>{c.d}</span></span>
              </label>
            ))}
          </div>
        )}
        {step === 3 && (
          <>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-kv"><span className="k">Customer</span><span className="v">{user.name} · {user.userId}</span></div>
              <div className="pm-kv"><span className="k">Offer</span><span className="v">{offers.find((o) => o.id === offer)?.l}</span></div>
              <div className="pm-kv"><span className="k">Channels</span><span className="v">{Object.entries(channels).filter(([, v]) => v).map(([k]) => k).join(", ") || "None"}</span></div>
              <div className="pm-kv"><span className="k">Estimated cost</span><span className="v">{Number(cost || 0) * chCount > 0 ? `KES ${Math.ceil(Number(cost || 0) + chCount * 0.8)}` : "KES 0"}</span></div>
              <div className="pm-kv"><span className="k">Attribution</span><span className="v">WIN-2026-0284 · tracked 30 days</span></div>
            </div>
            <TwoFactorField value={code} onChange={setCode} />
          </>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}><i className="bi bi-arrow-left me-1" />Back</button>}
        {step < 3 && <button className="btn btn-primary btn-sm" onClick={() => setStep(step + 1)}>Next<i className="bi bi-arrow-right ms-1" /></button>}
        {step === 3 && <button className="btn btn-primary btn-sm" disabled={code !== "482913" || chCount === 0} onClick={() => {
          onDone(user, offers.find((o) => o.id === offer)?.l ?? "Reminder");
          push({ kind: "success", title: "Win-back dispatched", body: `${user.name} · ${chCount} channels · WIN-2026-0284.` }); close();
        }}><i className="bi bi-send me-1" />Send win-back</button>}
      </div>
    </Modal>
  );
}

/* ============================ 3. Bulk win-back modal ============================ */
export function BulkWinbackModal({ open, count, onClose, onDone }: { open: boolean; count: number; onClose: () => void; onDone: (action: string) => void }) {
  const { push } = useToast();
  const [mode, setMode] = useState("offer");
  const [offer, setOffer] = useState("KES 50 fee credit (30 days)");
  const [code, setCode] = useState("");
  const smsCost = mode === "offer" ? count * 0.8 : 0;
  return (
    <Modal open={open} onClose={onClose} tone="green" icon="bi-broadcast" size="md"
      title={`Win back ${count} dormant accounts`} subtitle="One campaign task per user, attributed to bulk run BWM-2026-0092.">
      <div className="pm-modal-body">
        <div className="d-flex flex-column gap-2 mb-3">
          {[{ id: "offer", l: "Incentive win-back", d: "Offer + SMS, tracked conversion for 30 days" },
            { id: "reminder", l: "Gentle reminder", d: "No incentive, push/SMS only, zero cost" },
            { id: "sweep-notice", l: "Balance sweep notice", d: "365d accounts: claim your balance or it closes" }].map((m) => (
            <button key={m.id} className={`pm-opt ${mode === m.id ? "active" : ""}`} onClick={() => setMode(m.id)}>
              <span className="r" /><span className="flex-grow-1">
                <span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>{m.l}</span>
                <span className="d-block" style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>{m.d}</span></span>
            </button>
          ))}
        </div>
        {mode === "offer" && (
          <>
            <label className="form-label">Offer</label>
            <select className="form-select mb-3" value={offer} onChange={(e) => setOffer(e.target.value)}>
              {["KES 50 fee credit (30 days)", "Free transfer this week", "2% savings boost (14 days)", "0% merchant fees (60 days)"].map((o) => <option key={o}>{o}</option>)}
            </select>
          </>
        )}
        {mode === "offer" && <div className="pm-note mb-3">Estimated SMS spend: <b>KES {num(smsCost)}</b> · budget code GROWTH/WINBACK/AUG is charged.</div>}
        <TwoFactorField value={code} onChange={setCode} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => {
          onDone(mode);
          push({ kind: "success", title: `Win-back queued for ${count} users`, body: "Deliveries start in 2 minutes · attribution BWM-2026-0092." }); onClose();
        }}><i className="bi bi-send me-1" />Queue win-back</button>
      </div>
    </Modal>
  );
}

/* ============================ 4. Balance sweep modal ============================ */
export function SweepModal({ user, onClose, onDone }: { user: DormantUser | null; onClose: () => void; onDone: (u: DormantUser) => void }) {
  const { push } = useToast();
  const [notify, setNotify] = useState(true);
  const [code, setCode] = useState("");
  if (!user) return null;
  return (
    <Modal open onClose={onClose} tone="amber" icon="bi-box-arrow-up" size="sm"
      title={`Sweep balance — ${user.name}`} subtitle={`KES ${num(user.balance)} back to ${user.phone}`}>
      <div className="pm-modal-body">
        <div className="pm-note mb-3" style={{ borderColor: "#fde3b8", background: "#fff5e6", color: "#b54708" }}>
          <i className="bi bi-info-circle me-1" />The sweep uses the registered M-Pesa number from KYC. The wallet zeroes out but the account stays open for re-activation.
        </div>
        <label className="pm-opt">
          <input type="checkbox" className="form-check-input mt-0" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
          <span style={{ fontWeight: 700, fontSize: ".84rem" }}>SMS the customer with the sweep receipt</span>
        </label>
        <div className="mt-3"><TwoFactorField value={code} onChange={setCode} /></div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => {
          onDone(user);
          push({ kind: "success", title: `KES ${num(user.balance)} swept`, body: `${user.name} · receipt ${notify ? "sent" : "logged"} · SWP-2026-0447.` }); onClose();
        }}><i className="bi bi-box-arrow-up me-1" />Sweep balance</button>
      </div>
    </Modal>
  );
}

/* ============================ 5. Closure review wizard ============================ */
export function ClosureWizard({ req, onClose, onDone }: { req: ClosureRequest | null; onClose: () => void; onDone: (r: ClosureRequest, decision: "Approved" | "Denied") => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [decision, setDecision] = useState<"Approved" | "Denied">("Approved");
  const [sweep, setSweep] = useState(true);
  const [retain, setRetain] = useState(req?.reason === "Fraud / ban" ? "90 days" : "7 years");
  const [note, setNote] = useState("");
  const [code, setCode] = useState("");
  const needsCo = req ? req.vip || req.balance > 100_000 || req.reason !== "Customer request" : false;
  const steps = [{ label: "Review", icon: "bi-search" }, { label: decision === "Approved" ? "Disposition" : "Denial", icon: "bi-signpost-2" }, { label: "Approvals", icon: "bi-person-check" }, { label: "2FA", icon: "bi-shield-lock" }];
  const close = () => { setStep(0); setCode(""); setNote(""); onClose(); };
  if (!req) return null;
  return (
    <Modal open onClose={close} tone={decision === "Approved" ? "amber" : "red"} icon="bi-box-x" size="lg"
      title={`Closure review — ${req.name}`} subtitle={`${req.id} · ${req.reason} · requested ${req.requested}`}>
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%`, background: decision === "Approved" ? "#f79009" : "#f04438" }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-kv"><span className="k">Account</span><span className="v">{req.name} · <span className="mono">{req.userId}</span></span></div>
              <div className="pm-kv"><span className="k">Reason</span><span className="v"><Badge tone={req.reason.includes("Fraud") || req.reason.includes("AML") ? "red" : "grey"}>{req.reason}</Badge></span></div>
              <div className="pm-kv"><span className="k">Residual balance</span><span className="v">{kes(req.balance)}</span></div>
              <div className="pm-kv"><span className="k">Open loans</span><span className="v">{req.loans ? `${req.loans} (must settle or restructure first)` : "None"}</span></div>
              <div className="pm-kv"><span className="k">Standing orders</span><span className="v">{req.standingOrders} to cancel</span></div>
              <div className="pm-kv"><span className="k">Active cards</span><span className="v">{req.cards} to terminate</span></div>
              {req.vip && <div className="pm-kv"><span className="k">VIP</span><span className="v"><Badge tone="violet">Concierge sign-off required</Badge></span></div>}
            </div>
            <div className="pm-note"><i className="bi bi-chat-left-text me-1" />Customer note: <b>{req.note}</b></div>
          </>
        )}
        {step === 1 && (
          <>
            <label className="form-label mb-2">Decision</label>
            <div className="d-flex flex-column gap-2 mb-3">
              <button className={`pm-opt ${decision === "Approved" ? "active" : ""}`} onClick={() => setDecision("Approved")}>
                <span className="r" /><i className="bi bi-check-circle" style={{ color: "#b54708" }} />
                <span className="flex-grow-1"><b style={{ fontSize: ".85rem" }}>Approve closure</b><span className="d-block" style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>Cooling-off, then permanent closure</span></span>
              </button>
              <button className={`pm-opt ${decision === "Denied" ? "active" : ""}`} onClick={() => setDecision("Denied")}>
                <span className="r" /><i className="bi bi-x-circle" style={{ color: "#d92d20" }} />
                <span className="flex-grow-1"><b style={{ fontSize: ".85rem" }}>Deny request</b><span className="d-block" style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>Account stays open, customer notified</span></span>
              </button>
            </div>
            {decision === "Approved" ? (
              <>
                <label className="pm-opt mb-2">
                  <input type="checkbox" className="form-check-input mt-0" checked={sweep} onChange={(e) => setSweep(e.target.checked)} />
                  <span style={{ fontWeight: 700, fontSize: ".85rem" }}>Sweep {kes(req.balance)} to registered number at closure</span>
                </label>
                <label className="form-label">Identity & data retention</label>
                <select className="form-select" value={retain} onChange={(e) => setRetain(e.target.value)}>
                  <option value="7 years">7 years (default statutory)</option>
                  <option value="90 days">90 days (fraud / de-risking)</option>
                  <option value="Legal hold">Legal hold (court order)</option>
                </select>
              </>
            ) : (
              <>
                <label className="form-label">Denial reason (sent to the customer)</label>
                <textarea className="form-control" rows={3} value={note} onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Open loan must be settled or restructured before closure can proceed." />
              </>
            )}
          </>
        )}
        {step === 2 && (
          <div className="d-flex flex-column gap-2">
            <div className="pm-opt active"><i className="bi bi-shield-check" style={{ color: "#12b76a" }} />
              <span className="flex-grow-1"><b style={{ fontSize: ".85rem" }}>You — Jeckonia Kwasa (Tier 0)</b><span className="d-block" style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>Decision maker · always required</span></span><Badge tone="green">You</Badge></div>
            {needsCo && <div className="pm-opt active"><i className="bi bi-send" style={{ color: "#7a5af8" }} />
              <span className="flex-grow-1"><b style={{ fontSize: ".85rem" }}>{req.vip ? "Grace Wanjiru — Relationship Manager" : req.balance > 100_000 ? "Sarah Kamau — Finance Manager" : "David Kiplagat — Compliance Officer"}</b>
              <span className="d-block" style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>{req.vip ? "VIP closures need RM sign-off" : req.balance > 100_000 ? "Balances over KES 100K need Finance co-approval" : "Fraud / AML / duplicate closures need Compliance"}</span></span><Badge tone="blue">Notification queued</Badge></div>}
            <div className="pm-opt active"><i className="bi bi-clock" style={{ color: "#2e90fa" }} />
              <span className="flex-grow-1"><b style={{ fontSize: ".85rem" }}>30-day cooling-off clock starts on publish</b><span className="d-block" style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>Customer can cancel closure any time before it elapses</span></span></div>
          </div>
        )}
        {step === 3 && <TwoFactorField value={code} onChange={setCode} />}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}><i className="bi bi-arrow-left me-1" />Back</button>}
        {step < 3 && <button className="btn btn-primary btn-sm" disabled={decision === "Denied" && note.trim().length < 10} onClick={() => setStep(step + 1)}>Next<i className="bi bi-arrow-right ms-1" /></button>}
        {step === 3 && <button className={`btn ${decision === "Approved" ? "btn-primary" : "btn-danger"} btn-sm`} disabled={code !== "482913"} onClick={() => {
          onDone(req, decision);
          push({ kind: decision === "Approved" ? "warn" : "info", title: decision === "Approved" ? `Closure approved for ${req.name}` : `Closure denied — ${req.name}`, body: `${req.id} · ${decision === "Approved" ? "cooling-off started · co-approvals notified" : "customer notified of the denial"}.` }); close();
        }}><i className={`bi ${decision === "Approved" ? "bi-check2" : "bi-x-octagon"} me-1`} />{decision === "Approved" ? "Approve closure" : "Deny request"}</button>}
      </div>
    </Modal>
  );
}

/* ============================ 6. Campaign detail drawer ============================ */
export function CampaignDrawer({ campaign, onClose, onPause, onExtend, onExport }: {
  campaign: Campaign | null; onClose: () => void; onPause: (c: Campaign, pause: boolean) => void; onExtend: (c: Campaign) => void; onExport: (c: Campaign) => void;
}) {
  if (!campaign) return null;
  const reach = campaign.sent ? Math.round((campaign.delivered / campaign.sent) * 100) : 0;
  const openRate = campaign.delivered ? Math.round((campaign.opened / campaign.delivered) * 100) : 0;
  const conv = campaign.opened ? ((campaign.converted / campaign.opened) * 100).toFixed(1) : "0";
  const revenue = campaign.converted * 2_140;
  return (
    <Drawer open onClose={onClose} icon="bi-megaphone" tone={campaign.status === "Live" ? "green" : campaign.status === "Paused" ? "amber" : campaign.status === "Scheduled" ? "blue" : "ink"}
      title={campaign.name} subtitle={`${campaign.id} · ${campaign.audience}`}
      headExtra={<Badge tone={campaign.status === "Live" ? "green" : campaign.status === "Paused" ? "amber" : campaign.status === "Scheduled" ? "blue" : "grey"} dot>{campaign.status}</Badge>}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => onExport(campaign)}><i className="bi bi-download me-1" />Full report</button>
        {campaign.status === "Live" && <button className="btn btn-outline-secondary btn-sm" onClick={() => onPause(campaign, true)}><i className="bi bi-pause me-1" />Pause</button>}
        {campaign.status === "Paused" && <button className="btn btn-outline-secondary btn-sm" onClick={() => onPause(campaign, false)}><i className="bi bi-play me-1" />Resume</button>}
        <button className="btn btn-primary btn-sm flex-grow-1" onClick={() => onExtend(campaign)}><i className="bi bi-calendar-plus me-1" />Extend +14 days</button>
      </>}>
      <div className="row g-2 mb-3">
        {[{ l: "Recipients", v: num(campaign.recipients) }, { l: "Delivered", v: `${num(campaign.delivered)} · ${reach}%` },
          { l: "Open rate", v: `${openRate}%` }, { l: "Converted", v: num(campaign.converted) }].map((x) => (
          <div className="col-6" key={x.l}><div className="pm-stat"><div className="pm-stat-label">{x.l}</div>
            <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1rem" }}>{x.v}</div></div></div>
        ))}
      </div>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Offer</span><span className="v">{campaign.offer}</span></div>
        <div className="pm-kv"><span className="k">Channels</span><span className="v">{campaign.channels.join(" + ")}</span></div>
        <div className="pm-kv"><span className="k">Window</span><span className="v">{campaign.started} → {campaign.ends}</span></div>
        <div className="pm-kv"><span className="k">Owner</span><span className="v">{campaign.owner}</span></div>
        <div className="pm-kv"><span className="k">Spend</span><span className="v">{kes(campaign.spend, { compact: true })}</span></div>
        <div className="pm-kv"><span className="k">Open → convert</span><span className="v">{conv}%</span></div>
        <div className="pm-kv"><span className="k">Attributed revenue</span><span className="v" style={{ color: "#0b8f52" }}>{kes(revenue, { compact: true })}</span></div>
        <div className="pm-kv"><span className="k">ROAS</span><span className="v" style={{ color: campaign.spend > 0 && revenue > campaign.spend ? "#0b8f52" : "#d92d20" }}>{campaign.spend ? (revenue / campaign.spend).toFixed(1) + "x" : "—"}</span></div>
      </div>
      <div className="pm-card">
        <div className="pm-card-head"><h6 className="pm-card-title">Funnel</h6></div>
        <div className="p-3">
          {[["Recipients", campaign.recipients, "#667085"], ["Delivered", campaign.delivered, "#2e90fa"], ["Opened", campaign.opened, "#7a5af8"], ["Converted", campaign.converted, "#12b76a"]].map(([l, v, c], i) => (
            <div key={l as string} className="d-flex align-items-center gap-2 py-1">
              <span style={{ width: 84, fontSize: ".76rem", fontWeight: 600 }}>{l}</span>
              <Meter value={((v as number) / campaign.recipients) * 100} tone={c as string} width={220} />
              <span className="pm-num" style={{ fontWeight: 700 }}>{num(v as number)}</span>
              {i > 0 && <span className="pm-td-sub ms-auto">{((v as number) / ([campaign.recipients, campaign.delivered, campaign.opened, campaign.converted][i - 1] || 1) * 100).toFixed(0)}% of prev</span>}
            </div>
          ))}
        </div>
      </div>
    </Drawer>
  );
}

/* ============================ 7. New campaign wizard ============================ */
export function NewCampaignWizard({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (c: Campaign) => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [bucket, setBucket] = useState("90d");
  const [tier, setTier] = useState("all");
  const [offer, setOffer] = useState("KES 50 fee credit (30 days)");
  const [channels, setChannels] = useState({ push: true, sms: false, email: false });
  const [start, setStart] = useState("2026-08-25");
  const [end, setEnd] = useState("2026-09-08");
  const [budget, setBudget] = useState(100_000);
  const [code, setCode] = useState("");
  const steps = [{ label: "Audience", icon: "bi-people" }, { label: "Offer", icon: "bi-gift" }, { label: "Schedule", icon: "bi-calendar" }, { label: "Launch", icon: "bi-rocket" }];
  const audienceSize = bucket === "365d" ? 4_200 : bucket === "180d" ? 9_800 : bucket === "90d" ? 9_412 : 6_204;
  const finalAudience = tier === "all" ? audienceSize : Math.round(audienceSize * (tier === "VIP" ? 0.02 : tier === "Business" ? 0.08 : 0.5));
  const close = () => { setStep(0); setCode(""); onClose(); };
  return (
    <Modal open={open} onClose={close} tone="green" icon="bi-rocket-takeoff" size="lg" title="New reactivation campaign" subtitle="Targeted win-back with attribution and budget guardrails.">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <>
            <label className="form-label">Campaign name</label>
            <input className="form-control mb-3" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. September returners — 90d sleepers" />
            <div className="row g-2">
              <div className="col-6"><label className="form-label">Dormancy bucket</label>
                <select className="form-select" value={bucket} onChange={(e) => setBucket(e.target.value)}>
                  {[["60d", "60 days"], ["90d", "90 days"], ["180d", "180 days"], ["365d", "365 days"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select></div>
              <div className="col-6"><label className="form-label">Tier</label>
                <select className="form-select" value={tier} onChange={(e) => setTier(e.target.value)}>
                  {[["all", "All tiers"], ["Basic", "Basic"], ["Verified", "Verified"], ["VIP", "VIP"], ["Business", "Business"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select></div>
            </div>
            <div className="pm-note mt-3"><i className="bi bi-people me-1" />Estimated audience: <b>{num(finalAudience)} accounts</b> · {num(audienceSize)} in the {bucket} bucket, {tier === "all" ? "all tiers" : tier + " only"}.</div>
          </>
        )}
        {step === 1 && (
          <>
            <label className="form-label">Offer</label>
            <select className="form-select mb-3" value={offer} onChange={(e) => setOffer(e.target.value)}>
              {["KES 50 fee credit (30 days)", "Free transfer this week", "2% savings boost (14 days)", "0% merchant fees (60 days)", "No incentive — reminder only"].map((o) => <option key={o}>{o}</option>)}
            </select>
            <label className="form-label">Channels</label>
            <div className="d-flex gap-2">
              {[["push", "Push"], ["sms", "SMS"], ["email", "Email"]].map(([k, l]) => (
                <button key={k} className={`pm-chip ${channels[k as keyof typeof channels] ? "active" : ""}`}
                  onClick={() => setChannels({ ...channels, [k]: !channels[k as keyof typeof channels] })}>{l}</button>
              ))}
            </div>
            <div className="pm-note mt-3"><i className="bi bi-cash-coin me-1" />SMS cost ≈ KES 0.80/message · {channels.sms ? num(Math.round(finalAudience * 0.8)) + " estimated" : "no SMS cost"}. Push and email are free.</div>
          </>
        )}
        {step === 2 && (
          <div className="row g-2">
            <div className="col-6"><label className="form-label">Starts</label><input type="date" className="form-control" value={start} onChange={(e) => setStart(e.target.value)} /></div>
            <div className="col-6"><label className="form-label">Ends</label><input type="date" className="form-control" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
            <div className="col-12"><label className="form-label">Budget cap — {kes(budget, { compact: true })}</label>
              <input type="range" className="form-range" min={10_000} max={500_000} step={10_000} value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
              <div className="pm-td-sub">Campaign auto-pauses when spend hits the cap.</div></div>
          </div>
        )}
        {step === 3 && (
          <>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-kv"><span className="k">Campaign</span><span className="v">{name || "Untitled"}</span></div>
              <div className="pm-kv"><span className="k">Audience</span><span className="v">{num(finalAudience)} · {bucket} · {tier}</span></div>
              <div className="pm-kv"><span className="k">Offer</span><span className="v">{offer}</span></div>
              <div className="pm-kv"><span className="k">Channels</span><span className="v">{Object.entries(channels).filter(([, v]) => v).map(([k]) => k).join(", ") || "None"}</span></div>
              <div className="pm-kv"><span className="k">Window</span><span className="v">{new Date(start).toLocaleDateString("en-GB")} → {new Date(end).toLocaleDateString("en-GB")}</span></div>
              <div className="pm-kv"><span className="k">Budget cap</span><span className="v">{kes(budget, { compact: true })}</span></div>
            </div>
            <TwoFactorField value={code} onChange={setCode} />
          </>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}><i className="bi bi-arrow-left me-1" />Back</button>}
        {step < 3 && <button className="btn btn-primary btn-sm" disabled={(step === 0 && name.trim().length < 5) || (step === 1 && Object.values(channels).every((v) => !v))} onClick={() => setStep(step + 1)}>Next<i className="bi bi-arrow-right ms-1" /></button>}
        {step === 3 && <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => {
          const c: Campaign = { id: `CMP-${2211 + Math.floor(Math.random() * 50)}`, name: name || "Untitled campaign", audience: `${bucket} dormant · ${tier}`, recipients: finalAudience, status: start > "2026-08-24" ? "Scheduled" : "Live", sent: 0, delivered: 0, opened: 0, converted: 0, spend: 0, offer, channels: Object.entries(channels).filter(([, v]) => v).map(([k]) => k), started: new Date(start).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }), ends: new Date(end).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }), owner: "Jeckonia Kwasa" };
          onCreate(c); push({ kind: "success", title: "Campaign created", body: `${c.id} · ${num(c.recipients)} recipients · starts ${c.started}.` }); close();
        }}><i className="bi bi-rocket-takeoff me-1" />Launch campaign</button>}
      </div>
    </Modal>
  );
}

/* ============================ 8. Funnel stage drill-down modal ============================ */
export function StageModal({ stage, onClose }: { stage: FunnelStage | null; onClose: () => void }) {
  const { push } = useToast();
  if (!stage) return null;
  const sample = DORMANT_USERS.slice(0, 6);
  return (
    <Modal open onClose={onClose} tone="blue" icon={stage.icon} size="lg" title={`${stage.label} — ${num(stage.count)} accounts`}
      subtitle={stage.desc}>
      <div className="pm-modal-body">
        <div className="row g-2 mb-3">
          {[{ l: "Accounts in stage", v: num(stage.count) }, { l: "Conversion from previous", v: stage.rateFromPrev ? stage.rateFromPrev + "%" : "—" },
            { l: "Drop-off at this step", v: stage.rateFromPrev ? (100 - stage.rateFromPrev).toFixed(1) + "%" : "—" }, { l: "Share of all accounts", v: ((stage.count / 148_392) * 100).toFixed(1) + "%" }].map((x) => (
            <div className="col-6 col-lg-3" key={x.l}><div className="pm-stat"><div className="pm-stat-label">{x.l}</div>
              <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1.05rem" }}>{x.v}</div></div></div>
          ))}
        </div>
        <div className="pm-eyebrow mb-2">Accounts stuck at this stage (sample)</div>
        <div className="pm-card pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Account</th><th>County</th><th>Tier</th><th>Last seen</th><th className="text-end">Days stuck</th><th /></tr></thead>
            <tbody>
              {sample.map((u) => (
                <tr key={u.id}>
                  <td><div className="d-flex align-items-center gap-2"><Avatar name={u.name} size="sm" /><div><span className="pm-td-strong">{u.name}</span><div className="pm-td-sub mono">{u.userId}</div></div></div></td>
                  <td>{u.county}</td><td><Badge tone={tierTone(u.tier)}>{u.tier}</Badge></td>
                  <td style={{ fontSize: ".76rem" }}>{u.lastLogin}</td>
                  <td className="text-end pm-num">{Math.max(4, u.dormantDays - 20)}</td>
                  <td className="text-end"><button className="btn btn-sm btn-outline-secondary" onClick={() => { push({ kind: "info", title: "Nudge queued", body: `${u.name} receives a "get started" sequence over 5 days.` }); }}>Nudge</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => { csvDownload(`${stage.id}-stuck.csv`, sample as unknown as Record<string, unknown>[]); push({ kind: "success", title: "Stuck accounts exported" }); }}>
          <i className="bi bi-download me-1" />Export stuck list
        </button>
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ============================ 9. Cohort modal ============================ */
export function CohortModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const rows = COHORT_RETENTION;
  return (
    <Modal open={open} onClose={onClose} tone="violet" icon="bi-grid-3x3" size="lg" title="Cohort retention heatmap" subtitle="Monthly signup cohorts · % still active at each checkpoint">
      <div className="pm-modal-body">
        <div className="pm-card pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Cohort</th><th className="text-end">Signups</th><th>D1</th><th>D7</th><th>D30</th><th>D60</th><th>D90</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.cohort}>
                  <td className="pm-td-strong">{r.cohort}</td>
                  <td className="text-end pm-num">{num(r.size)}</td>
                  {([["d1", r.d1], ["d7", r.d7], ["d30", r.d30], ["d60", r.d60], ["d90", r.d90]] as const).map(([k, v]) => (
                    <td key={k}>{v ? <span style={{ display: "inline-block", width: 116, textAlign: "center", borderRadius: 6, fontSize: ".74rem", fontWeight: 700, padding: ".22rem 0", background: `rgba(18,183,106,${0.12 + (v / 100) * 0.75})`, color: v > 45 ? "#0b4d2e" : "#0b8f52" }}>{v}%</span> : <span className="pm-td-sub">—</span>}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pm-note mt-3"><i className="bi bi-info-circle me-1" />Retention improved from 44% (D30, March cohort) to 47% (D30, June cohort) after the onboarding refresh shipped in May.</div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => { csvDownload("cohort-retention.csv", rows as unknown as Record<string, unknown>[]); push({ kind: "success", title: "Cohort matrix exported" }); }}>
          <i className="bi bi-download me-1" />Export
        </button>
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ============================ 10. Dormancy policy modal ============================ */
export function PolicyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [dormantDays, setDormantDays] = useState(90);
  const [closureDays, setClosureDays] = useState(395);
  const [sweep, setSweep] = useState(100);
  const [notify1, setNotify1] = useState(true);
  const [notify2, setNotify2] = useState(true);
  const [code, setCode] = useState("");
  return (
    <Modal open={open} onClose={onClose} tone="amber" icon="bi-sliders" size="md" title="Dormancy & closure policy" subtitle="Super Admin controls · changes affect all 148,392 accounts.">
      <div className="pm-modal-body">
        <label className="form-label">Dormant after (no transaction) — {dormantDays} days</label>
        <input type="range" className="form-range mb-3" min={30} max={180} step={15} value={dormantDays} onChange={(e) => setDormantDays(Number(e.target.value))} />
        <label className="form-label">Auto-closure after — {closureDays} days</label>
        <input type="range" className="form-range mb-3" min={270} max={540} step={5} value={closureDays} onChange={(e) => setClosureDays(Number(e.target.value))} />
        <label className="form-label">Sweep balances above KES {num(sweep)}</label>
        <input type="range" className="form-range mb-3" min={100} max={10_000} step={100} value={sweep} onChange={(e) => setSweep(Number(e.target.value))} />
        <div className="d-flex flex-column gap-2 mb-3">
          <label className={`pm-opt ${notify1 ? "active" : ""}`}><input type="checkbox" className="form-check-input mt-0" checked={notify1} onChange={(e) => setNotify1(e.target.checked)} />
            <span style={{ fontWeight: 700, fontSize: ".84rem" }}>Notify at dormancy entry (SMS + push)</span></label>
          <label className={`pm-opt ${notify2 ? "active" : ""}`}><input type="checkbox" className="form-check-input mt-0" checked={notify2} onChange={(e) => setNotify2(e.target.checked)} />
            <span style={{ fontWeight: 700, fontSize: ".84rem" }}>30-day pre-closure notice (legal requirement)</span></label>
        </div>
        <TwoFactorField value={code} onChange={setCode} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => {
          push({ kind: "success", title: "Lifecycle policy published", body: `Dormant ${dormantDays}d · closure ${closureDays}d · sweep > ${kes(sweep)}.` }); onClose();
        }}><i className="bi bi-check2 me-1" />Publish policy</button>
      </div>
    </Modal>
  );
}

/* ============================ 11. Export modal ============================ */
export function ExportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [dataset, setDataset] = useState("dormant");
  const [format, setFormat] = useState("csv");
  const [include, setInclude] = useState({ dormant: true, closures: true, campaigns: true, events: false });
  const counts = { dormant: 24, closures: 14, campaigns: 8, events: 24 };
  return (
    <Modal open={open} onClose={onClose} tone="blue" icon="bi-download" size="sm" title="Export lifecycle report" subtitle="Watermarked with your identity.">
      <div className="pm-modal-body">
        <label className="form-label">Dataset</label>
        <select className="form-select mb-3" value={dataset} onChange={(e) => setDataset(e.target.value)}>
          <option value="dormant">Dormant accounts ({counts.dormant})</option>
          <option value="closures">Closure requests ({counts.closures})</option>
          <option value="campaigns">Campaign performance ({counts.campaigns})</option>
          <option value="events">Lifecycle events ({counts.events})</option>
        </select>
        <label className="form-label">Format</label>
        <div className="d-flex gap-1 mb-3">{["csv", "json", "xlsx"].map((f) => <button key={f} className={`pm-chip ${format === f ? "active" : ""}`} onClick={() => setFormat(f)}>{f.toUpperCase()}</button>)}</div>
        <div className="pm-eyebrow mb-2">Also include</div>
        <div className="d-flex flex-column gap-1">
          {Object.keys(include).map((k) => (
            <label key={k} className={`pm-opt ${include[k as keyof typeof include] ? "active" : ""}`} style={{ padding: ".35rem .6rem" }}>
              <input type="checkbox" className="form-check-input mt-0" checked={include[k as keyof typeof include]}
                onChange={(e) => setInclude({ ...include, [k]: e.target.checked })} />
              <span style={{ fontSize: ".8rem", fontWeight: 600, textTransform: "capitalize" }}>{k}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => {
          const rows = dataset === "dormant" ? DORMANT_USERS : dataset === "closures" ? [] : dataset === "campaigns" ? CAMPAIGNS : [];
          (format === "json" ? jsonDownload(`lifecycle-${dataset}.${format}`, rows as unknown as unknown[]) : csvDownload(`lifecycle-${dataset}.${format}`, (rows.length ? rows : [{ note: "See dashboard" }] as unknown as Record<string, unknown>[]) as unknown as Record<string, unknown>[]));
          push({ kind: "success", title: "Lifecycle report exported", body: `${dataset} · ${format.toUpperCase()} · ${Object.values(include).filter(Boolean).length} appendix sections.` }); onClose();
        }}><i className="bi bi-download me-1" />Download</button>
      </div>
    </Modal>
  );
}

/* ============================ 12. Monthly flow drawer ============================ */
export function FlowDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  return (
    <Drawer open={open} onClose={onClose} icon="bi-bar-chart" tone="green" title="Monthly account flow" subtitle="New, activated, churned, reactivated and closed — trailing 12 months">
      <div className="pm-card pm-table-wrap mb-3">
        <table className="pm-table">
          <thead><tr><th>Month</th><th className="text-end">New</th><th className="text-end">Activated</th><th className="text-end">Churned</th><th className="text-end">Win back</th><th className="text-end">Closed</th></tr></thead>
          <tbody>
            {MONTHLY_FLOW.map((m) => (
              <tr key={m.month}>
                <td className="pm-td-strong">{m.month} 2026</td>
                <td className="text-end pm-num" style={{ color: "#0b8f52" }}>+{num(m.newSignups)}</td>
                <td className="text-end pm-num">{num(m.activated)}</td>
                <td className="text-end pm-num" style={{ color: "#d92d20" }}>−{num(m.churned)}</td>
                <td className="text-end pm-num" style={{ color: "#175cd3" }}>+{num(m.reactivated)}</td>
                <td className="text-end pm-num">{num(m.closed)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pm-card pm-card-pad">
        <div className="pm-eyebrow mb-2">Net new accounts (3-month trend)</div>
        {[["Jul", 28_600 - 5_100 - 1_004 + 1_790], ["Aug MTD", 15_612 - 2_700 - 517 + 962]].map(([l, v]) => (
          <div key={l as string} className="pm-kv"><span className="k">{l}</span><span className="v" style={{ color: "#0b8f52" }}>+{num(v as number)}</span></div>
        ))}
      </div>
      <div className="mt-3">
        <button className="btn btn-primary btn-sm w-100" onClick={() => { csvDownload("monthly-flow.csv", MONTHLY_FLOW as unknown as Record<string, unknown>[]); push({ kind: "success", title: "Monthly flow exported" }); onClose(); }}>
          <i className="bi bi-download me-1" />Export 12-month flow
        </button>
      </div>
    </Drawer>
  );
}

/* ============================ 13. Win-back status check modal ============================ */
export function WinbackStatusModal({ user, onClose }: { user: DormantUser | null; onClose: () => void }) {
  const { push } = useToast();
  if (!user) return null;
  const attempts = [
    { t: "12 Aug 09:14", ch: "SMS", result: "Delivered", opened: false, note: "No app open detected." },
    { t: "19 Aug 09:02", ch: "Push", result: user.winback ? "Delivered · opened" : "Not opted in", opened: user.winback, note: user.winback ? "Opened offer page, no transaction." : "Suppressed by push opt-out." },
    { t: "24 Aug 08:47", ch: "In-app", result: "Queued", opened: false, note: "Fires on next app launch." },
  ];
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-hourglass-split" size="md" title={`Win-back status — ${user.name}`} subtitle={`${user.userId} · ${user.dormantDays} days dormant`}>
      <div className="pm-modal-body">
        <div className="pm-timeline">
          {attempts.map((a, i) => (
            <div key={i} className={`pm-tl-item ${a.opened ? "done" : i === attempts.length - 1 ? "warn" : ""}`}>
              <div className="d-flex align-items-center gap-2">
                <span style={{ fontWeight: 700, fontSize: ".82rem" }}>{a.ch} · {a.result}</span>
                <span className="ms-auto" style={{ fontSize: ".68rem", color: "var(--pm-muted)" }}>{a.t}</span>
              </div>
              <div style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>{a.note}</div>
            </div>
          ))}
        </div>
        <div className="pm-card pm-card-pad mt-3">
          <div className="pm-kv"><span className="k">Best-converting channel for this profile</span><span className="v">SMS (bill-pay users)</span></div>
          <div className="pm-kv"><span className="k">Suggested next touch</span><span className="v">SMS + KES 50 fee credit in 6 days</span></div>
          <div className="pm-kv"><span className="k">Fatigue guard</span><span className="v"><Badge tone="green">2 of 4 monthly touches used</Badge></span></div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => { push({ kind: "info", title: "Frequency increased", body: "Next touch moved up by 3 days (fatigue guard allows 1 extra)." }); onClose(); }}>
          <i className="bi bi-lightning me-1" />Touch sooner
        </button>
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ============================ 14. Saved view modal ============================ */
export function SaveViewModal({ open, query, onClose, onSave }: { open: boolean; query: string; onClose: () => void; onSave: (name: string, shared: boolean) => void }) {
  const [name, setName] = useState("");
  const [shared, setShared] = useState(true);
  return (
    <Modal open={open} onClose={onClose} tone="green" icon="bi-bookmark-plus" size="sm" title="Save lifecycle view" subtitle="Persist the current dormancy filters for the team.">
      <div className="pm-modal-body">
        <label className="form-label">View name</label>
        <input className="form-control mb-3" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. 180d+ VIP sleepers" />
        <label className="pm-opt"><input type="checkbox" className="form-check-input mt-0" checked={shared} onChange={(e) => setShared(e.target.checked)} />
          <span style={{ fontWeight: 700, fontSize: ".84rem" }}>Share with growth + compliance teams</span></label>
        <div className="pm-note mt-3 mono">{query || "No active filters"}</div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={name.trim().length < 3} onClick={() => { onSave(name, shared); onClose(); }}>Save view</button>
      </div>
    </Modal>
  );
}

/* ============================ 15. User 360 link modal (navigates to Page 5) ============================ */
export function OpenProfileModal({ user, onClose, onNavigate }: { user: DormantUser | null; onClose: () => void; onNavigate: (id: string) => void }) {
  if (!user) return null;
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-person-badge" size="sm" title={`Open ${user.name} in User Detail`} subtitle={`${user.userId} · full 360° profile with balances, devices and admin actions`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad">
          <div className="pm-kv"><span className="k">Account</span><span className="v">{user.name} · <span className="mono">{user.userId}</span></span></div>
          <div className="pm-kv"><span className="k">County / phone</span><span className="v">{user.county} · {user.phone}</span></div>
          <div className="pm-kv"><span className="k">State</span><span className="v"><Badge tone={bucketTone(user.bucket)}>Dormant · {user.bucket}</Badge></span></div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Stay here</button>
        <button className="btn btn-primary btn-sm" onClick={() => { onNavigate("user-detail"); }}><i className="bi bi-box-arrow-up-right me-1" />Open Page 5 — User Detail</button>
      </div>
    </Modal>
  );
}

/* ============================ 16. Bulk sweep modal ============================ */
export function BulkSweepModal({ open, count, onClose, onDone }: { open: boolean; count: number; onClose: () => void; onDone: () => void }) {
  const { push } = useToast();
  const [notify, setNotify] = useState(true);
  const [code, setCode] = useState("");
  return (
    <Modal open={open} onClose={onClose} tone="amber" icon="bi-box-arrow-up" size="sm" title={`Sweep balances for ${count} accounts`} subtitle="Only balances above the policy threshold (KES 100) are swept.">
      <div className="pm-modal-body">
        <div className="pm-note mb-3" style={{ borderColor: "#fde3b8", background: "#fff5e6", color: "#b54708" }}>
          <i className="bi bi-info-circle me-1" />Each sweep is a live M-Pesa B2C payout. The run is split into batches of 100 to stay under the partner rate limit.
        </div>
        <label className="pm-opt"><input type="checkbox" className="form-check-input mt-0" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
          <span style={{ fontWeight: 700, fontSize: ".84rem" }}>SMS each customer with a payout receipt</span></label>
        <div className="mt-3"><TwoFactorField value={code} onChange={setCode} /></div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => {
          onDone();
          push({ kind: "success", title: `Sweep run started for ${count} accounts`, body: `${notify ? "Receipts enabled" : "Receipts off"} · SWP-BATCH-2026-0088.` }); onClose();
        }}><i className="bi bi-play-fill me-1" />Start sweep run</button>
      </div>
    </Modal>
  );
}

/* ============================ 17. User lifecycle detail ============================ */
export function LifecycleDetailModal({ user, onClose }: { user: DormantUser | null; onClose: () => void }) {
  if (!user) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-person-badge" tone="blue" title="Lifecycle detail" subtitle={user.name}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">User ID</span><span className="v mono">{user.userId}</span></div>
        <div className="pm-kv"><span className="k">Current stage</span><span className="v"><Badge tone={user.stage === "Active" ? "green" : user.stage === "Dormant" ? "amber" : "red"}>{user.stage}</Badge></span></div>
        <div className="pm-kv"><span className="k">Last active</span><span className="v">{user.lastActive}</span></div>
        <div className="pm-kv"><span className="k">Balance</span><span className="v pm-num">{kes(user.balance)}</span></div>
        <div className="pm-kv"><span className="k">Days dormant</span><span className="v pm-num">{user.daysDormant}</span></div>
        <div className="pm-kv"><span className="k">Win-back attempts</span><span className="v">{user.winbackCount}</span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 18. Campaign analytics modal ============================ */
export function CampaignAnalyticsModal({ campaign, onClose }: { campaign: Campaign | null; onClose: () => void }) {
  if (!campaign) return null;
  const metrics = [
    { label: "Open rate", value: "42.3%", change: "+5.2%", good: true },
    { label: "Click rate", value: "18.7%", change: "+2.1%", good: true },
    { label: "Conversion rate", value: "8.4%", change: "-1.2%", good: false },
    { label: "Cost per reactivation", value: "KES 340", change: "-KES 25", good: true },
    { label: "ROI", value: "3.2x", change: "+0.4x", good: true },
  ];
  return (
    <Drawer open onClose={onClose} icon="bi-graph-up" tone="blue" title="Campaign analytics" subtitle={campaign.name}>
      <div className="d-flex flex-column gap-2">
        {metrics.map((m) => (
          <div key={m.label} className="pm-card pm-card-pad d-flex align-items-center justify-content-between">
            <div><div style={{ fontWeight: 700, fontSize: ".84rem" }}>{m.label}</div></div>
            <div className="text-end"><div style={{ fontWeight: 800, fontSize: ".95rem" }}>{m.value}</div>
              <div style={{ fontSize: ".72rem", color: m.good ? "#12b76a" : "#f04438" }}>{m.change}</div></div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 19. Stage detail modal ============================ */
export function StageDetailModal({ stage, onClose }: { stage: FunnelStage | null; onClose: () => void }) {
  if (!stage) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-funnel" tone="blue" title="Stage detail" subtitle={stage.name}>
      <div className="row g-2 mb-3">
        {[{ l: "Users", v: String(stage.users) }, { l: "Conversion", v: stage.conversion }, { l: "Avg time", v: stage.avgTime }, { l: "Revenue", v: kes(stage.revenue, { compact: true }) }].map((x) => (
          <div className="col-6" key={x.l}><div className="pm-stat"><div className="pm-stat-label">{x.l}</div>
            <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1rem" }}>{x.v}</div></div></div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 20. Closure detail modal ============================ */
export function ClosureDetailModal({ req, onClose }: { req: ClosureRequest | null; onClose: () => void }) {
  if (!req) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-x-octagon" tone="red" title="Closure request" subtitle={req.id}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">User</span><span className="v">{req.name}</span></div>
        <div className="pm-kv"><span className="k">User ID</span><span className="v mono">{req.userId}</span></div>
        <div className="pm-kv"><span className="k">Reason</span><span className="v">{req.reason}</span></div>
        <div className="pm-kv"><span className="k">Requested</span><span className="v">{req.requested}</span></div>
        <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone={req.status === "Pending" ? "amber" : req.status === "Approved" ? "green" : "red"}>{req.status}</Badge></span></div>
        <div className="pm-kv"><span className="k">Balance</span><span className="v pm-num">{kes(req.balance)}</span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 21. Win-back status detail ============================ */
export function WinbackStatusDetailModal({ user, onClose }: { user: DormantUser | null; onClose: () => void }) {
  if (!user) return null;
  const attempts = [
    { time: "20 Aug 2026", channel: "SMS", template: "We miss you!", status: "Delivered" },
    { time: "10 Aug 2026", channel: "Email", template: "Special offer inside", status: "Opened" },
    { time: "01 Aug 2026", channel: "Push", template: "Come back for bonus", status: "Ignored" },
  ];
  return (
    <Drawer open onClose={onClose} icon="bi-arrow-return-left" tone="blue" title="Win-back history" subtitle={user.name}>
      <div className="pm-card pm-card-pad mb-3 text-center">
        <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1.5rem" }}>{user.winbackCount}</div>
        <div style={{ fontSize: ".76rem", color: "var(--pm-muted)" }}>Total attempts</div>
      </div>
      <div className="d-flex flex-column gap-2">
        {attempts.map((a, i) => (
          <div key={i} className="pm-card pm-card-pad d-flex align-items-center gap-3">
            <i className="bi bi-send" style={{ color: "#2e90fa", fontSize: "1rem" }} />
            <div className="flex-grow-1"><div style={{ fontWeight: 700, fontSize: ".84rem" }}>{a.template}</div><div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{a.channel} · {a.time}</div></div>
            <Badge tone={a.status === "Opened" ? "green" : a.status === "Delivered" ? "blue" : "grey"}>{a.status}</Badge>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 22. Account activity modal ============================ */
export function AccountActivityModal({ user, onClose }: { user: DormantUser | null; onClose: () => void }) {
  if (!user) return null;
  const acts = [
    { time: "24 Aug 14:32", action: "Last transaction", detail: `KES ${Math.round(user.balance * 0.1).toLocaleString()}`, icon: "bi-arrow-left-right", color: "#2e90fa" },
    { time: "23 Aug 09:15", action: "Login", detail: "From App / Nairobi", icon: "bi-box-arrow-in-right", color: "#667085" },
    { time: "22 Aug 16:05", action: "Profile update", detail: "Phone number changed", icon: "bi-pencil-square", color: "#2e90fa" },
    { time: "21 Aug 11:20", action: "KYC verified", detail: "ID check passed", icon: "bi-shield-check", color: "#12b76a" },
  ];
  return (
    <Drawer open onClose={onClose} icon="bi-activity" tone="blue" title="Account activity" subtitle={user.name}>
      <div className="d-flex flex-column gap-2">
        {acts.map((a, i) => (
          <div key={i} className="d-flex align-items-start gap-3">
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${a.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <i className={`bi ${a.icon}`} style={{ color: a.color, fontSize: ".85rem" }} />
            </div>
            <div className="flex-grow-1"><div style={{ fontWeight: 700, fontSize: ".82rem" }}>{a.action}</div><div style={{ fontSize: ".74rem", color: "var(--pm-muted)" }}>{a.detail}</div><div style={{ fontSize: ".68rem", color: "var(--pm-muted)", marginTop: 2 }}>{a.time}</div></div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 23. Sweep detail modal ============================ */
export function SweepDetailModal({ user, onClose }: { user: DormantUser | null; onClose: () => void }) {
  if (!user) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-cash-stack" tone="blue" title="Sweep detail" subtitle={user.name}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Balance</span><span className="v pm-num" style={{ fontWeight: 700 }}>{kes(user.balance)}</span></div>
        <div className="pm-kv"><span className="k">Sweep threshold</span><span className="v">KES 100</span></div>
        <div className="pm-kv"><span className="k">Dormancy</span><span className="v">{user.daysDormant} days</span></div>
        <div className="pm-kv"><span className="k">Last sweep</span><span className="v">Never</span></div>
      </div>
      <div className="pm-note"><i className="bi bi-info-circle me-1" />Sweep will transfer the full balance to the dormant account pool.</div>
    </Drawer>
  );
}

/* ============================ 24. Lifecycle policy detail ============================ */
export function PolicyDetailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const policies = [
    { label: "Dormancy threshold", value: "90 days", icon: "bi-clock-history" },
    { label: "Closure threshold", value: "365 days", icon: "bi-x-octagon" },
    { label: "Sweep threshold", value: "> KES 100", icon: "bi-cash-stack" },
    { label: "Win-back max attempts", value: "5", icon: "bi-arrow-return-left" },
    { label: "Cooling period", value: "30 days", icon: "bi-hourglass-split" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-gear" tone="blue" title="Lifecycle policy" subtitle="Current configuration">
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

/* ============================ 25. Campaign list modal ============================ */
export function CampaignListModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const campaigns = [
    { name: "August win-back", status: "Active", recipients: 2400, conversions: 180 },
    { name: "Dormant sweep notice", status: "Draft", recipients: 0, conversions: 0 },
    { name: "July re-engagement", status: "Completed", recipients: 3100, conversions: 248 },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-megaphone" tone="blue" title="All campaigns" subtitle="Win-back and re-engagement">
      <div className="d-flex flex-column gap-2">
        {campaigns.map((c) => (
          <div key={c.name} className="pm-card pm-card-pad d-flex align-items-center gap-3">
            <div className="flex-grow-1"><div style={{ fontWeight: 700, fontSize: ".84rem" }}>{c.name}</div><div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{c.recipients} recipients · {c.conversions} conversions</div></div>
            <Badge tone={c.status === "Active" ? "green" : c.status === "Draft" ? "grey" : "blue"}>{c.status}</Badge>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 26. Monthly flow detail ============================ */
export function MonthlyFlowDetailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const months = [
    { month: "Aug 2026", newUsers: 8412, dormant: 1200, reactivated: 340, closed: 85 },
    { month: "Jul 2026", newUsers: 9200, dormant: 1450, reactivated: 290, closed: 72 },
    { month: "Jun 2026", newUsers: 8800, dormant: 1100, reactivated: 310, closed: 68 },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-arrow-left-right" tone="blue" title="Monthly flow" subtitle="Account lifecycle transitions">
      <div className="pm-card pm-table-wrap">
        <table className="pm-table">
          <thead><tr><th>Month</th><th className="text-end">New</th><th className="text-end">Dormant</th><th className="text-end">Reactivated</th><th className="text-end">Closed</th></tr></thead>
          <tbody>{months.map((m) => (
            <tr key={m.month}><td className="pm-td-strong">{m.month}</td><td className="text-end pm-num" style={{ color: "#12b76a" }}>+{num(m.newUsers)}</td><td className="text-end pm-num" style={{ color: "#f79009" }}>{num(m.dormant)}</td><td className="text-end pm-num" style={{ color: "#2e90fa" }}>+{num(m.reactivated)}</td><td className="text-end pm-num" style={{ color: "#f04438" }}>-{num(m.closed)}</td></tr>
          ))}</tbody>
        </table>
      </div>
    </Drawer>
  );
}

/* ============================ 27. Nudge modal ============================ */
export function NudgeModal({ user, onClose }: { user: DormantUser | null; onClose: () => void }) {
  const { push } = useToast();
  const [channel, setChannel] = useState<"sms" | "email" | "push" | "all">("all");
  const [template, setTemplate] = useState("");
  if (!user) return null;
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-bell" size="md" title={`Nudge ${user.name}`} subtitle="Send a re-engagement nudge">
      <div className="pm-modal-body">
        <label className="form-label">Channel</label>
        <div className="d-flex gap-1 flex-wrap mb-3">
          {["sms", "email", "push", "all"].map((c) => <button key={c} className={`pm-chip ${channel === c ? "active" : ""}`} onClick={() => setChannel(c as any)}>{c.toUpperCase()}</button>)}
        </div>
        <label className="form-label">Message</label>
        <textarea className="form-control mb-2" rows={3} value={template} onChange={(e) => setTemplate(e.target.value)} placeholder="Type your nudge message." />
        <div className="d-flex gap-1 flex-wrap">
          {["We miss you!", "Special offer inside", "Come back for a bonus"].map((t) => <button key={t} className="pm-chip" onClick={() => setTemplate(t)}>{t}</button>)}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={!template.trim()} onClick={() => { push({ kind: "success", title: "Nudge sent" }); onClose(); }}>
          <i className="bi bi-send me-1" />Send
        </button>
      </div>
    </Modal>
  );
}

/* ============================ 28. Cohort detail modal ============================ */
export function CohortDetailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const cohorts = [
    { cohort: "Aug 2026", signups: 8412, retained: 72, dormant: 12 },
    { cohort: "Jul 2026", signups: 9200, retained: 68, dormant: 18 },
    { cohort: "Jun 2026", signups: 8800, retained: 65, dormant: 22 },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-people" tone="blue" title="Cohort analysis" subtitle="Retention by signup month">
      <div className="d-flex flex-column gap-2">
        {cohorts.map((c) => (
          <div key={c.cohort} className="pm-card pm-card-pad">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontWeight: 700, fontSize: ".88rem" }}>{c.cohort}</span>
              <span className="pm-num" style={{ fontWeight: 700 }}>{num(c.signups)} signups</span>
            </div>
            <div className="d-flex gap-2">
              <div className="flex-grow-1"><div style={{ fontSize: ".7rem", color: "var(--pm-muted)" }}>Retained</div>
                <div style={{ height: 6, background: "#eaedf3", borderRadius: 3, overflow: "hidden" }}><div style={{ width: `${c.retained}%`, height: "100%", background: "#12b76a", borderRadius: 3 }} /></div>
                <div style={{ fontSize: ".72rem", fontWeight: 700 }}>{c.retained}%</div></div>
              <div className="flex-grow-1"><div style={{ fontSize: ".7rem", color: "var(--pm-muted)" }}>Dormant</div>
                <div style={{ height: 6, background: "#eaedf3", borderRadius: 3, overflow: "hidden" }}><div style={{ width: `${c.dormant}%`, height: "100%", background: "#f79009", borderRadius: 3 }} /></div>
                <div style={{ fontSize: ".72rem", fontWeight: 700 }}>{c.dormant}%</div></div>
            </div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 29. Re-engagement report modal ============================ */
export function ReengagementReportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  return (
    <Modal open={open} onClose={onClose} tone="blue" icon="bi-file-earmark-bar-graph" size="md" title="Re-engagement report" subtitle="Generate lifecycle report">
      <div className="pm-modal-body">
        <label className="form-label">Report type</label>
        <div className="d-flex flex-column gap-2 mb-3">
          {["Dormancy overview", "Win-back effectiveness", "Sweep impact", "Cohort retention"].map((r) => (
            <button key={r} className="pm-card pm-card-pad text-start" style={{ cursor: "pointer" }}>
              <div style={{ fontWeight: 700, fontSize: ".84rem" }}>{r}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Report generated" }); onClose(); }}>
          <i className="bi bi-download me-1" />Generate
        </button>
      </div>
    </Modal>
  );
}

/* ============================ 30. Lifecycle insights modal ============================ */
export function LifecycleInsightsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const insights = [
    { icon: "bi-graph-up", title: "Dormancy trending down", detail: "12% fewer dormant accounts vs last month", tone: "green" },
    { icon: "bi-arrow-return-left", title: "Win-back rate improving", detail: "8.4% conversion vs 7.2% last month", tone: "green" },
    { icon: "bi-cash-stack", title: "Sweep pool growing", detail: "KES 2.4M in sweep pool, up 15% MoM", tone: "amber" },
    { icon: "bi-exclamation-triangle", title: "Closure backlog", detail: "24 requests pending review, avg 5 days wait", tone: "red" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-lightbulb" tone="blue" title="Lifecycle insights" subtitle="AI-powered analysis">
      <div className="d-flex flex-column gap-2">
        {insights.map((ins) => (
          <div key={ins.title} className="pm-alert-row" style={{ borderLeftColor: ins.tone === "green" ? "#12b76a" : ins.tone === "amber" ? "#f79009" : "#f04438" }}>
            <i className={`bi ${ins.icon}`} style={{ color: ins.tone === "green" ? "#12b76a" : ins.tone === "amber" ? "#f79009" : "#f04438" }} />
            <div className="flex-grow-1"><div style={{ fontWeight: 700, fontSize: ".84rem" }}>{ins.title}</div><div style={{ fontSize: ".74rem", color: "var(--pm-muted)" }}>{ins.detail}</div></div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}
