import { useState } from "react";
import { Modal, Drawer, Steps, Badge, TwoFactorField, useToast } from "../../../components/ui";
import { jsonDownload, kes, num, initials, avatarColor } from "../../../lib/format";
import type { User, SavedView, Tier, KycStatus, AccountStatus, ColumnDef } from "../data/userData";
import { COLUMNS } from "../data/userData";

const tierTone = (t: Tier) => t === "VIP" ? "violet" : t === "Business" ? "blue" : t === "Agent" ? "amber" : "grey";
const kycTone = (k: KycStatus) => k === "Verified" ? "green" : k === "Pending" ? "amber" : k === "Rejected" ? "red" : k === "Expired" ? "grey" : "blue";
const statusTone = (s: AccountStatus) => s === "Active" ? "green" : s === "Frozen" ? "blue" : s === "Dormant" ? "grey" : s === "Suspended" ? "amber" : "red";

/* ============================ 1. User detail drawer ============================ */
export function UserDrawer({ user, onClose, onFreeze, onEdit, onAdjustLimits, onGrantVip, onImpersonate,
  onLoginHistory, onTransactionHistory, onCloseAccount, onActivity, onRisk, onMessage, onCompliance,
  onInsights, onAudit, onNotifications, onHealth }: {
  user: User | null; onClose: () => void; onFreeze: (u: User) => void; onEdit: (u: User) => void;
  onAdjustLimits: (u: User) => void; onGrantVip: (u: User) => void; onImpersonate: (u: User) => void;
  onLoginHistory: (u: User) => void; onTransactionHistory: (u: User) => void; onCloseAccount: (u: User) => void;
  onActivity: (u: User) => void; onRisk: (u: User) => void; onMessage: (u: User) => void;
  onCompliance: (u: User) => void; onInsights: (u: User) => void; onAudit: (u: User) => void;
  onNotifications: (u: User) => void; onHealth: (u: User) => void;
}) {
  const { push } = useToast();
  if (!user) return null;
  return (
    <Drawer open onClose={onClose} wide icon="bi-person-badge"
      tone={user.status === "Active" ? "green" : user.status === "Frozen" ? "blue" : "amber"}
      title={user.name} subtitle={`${user.id} · ${user.phone} · ${user.county}`}
      headExtra={<Badge tone={statusTone(user.status)} dot>{user.status}</Badge>}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => { jsonDownload(`${user.id}.json`, user); push({ kind: "success", title: "Profile exported" }); }}>
          <i className="bi bi-download me-1" />Export
        </button>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => onEdit(user)}><i className="bi bi-pencil me-1" />Edit</button>
        <button className="btn btn-primary btn-sm flex-grow-1" onClick={() => onFreeze(user)}>
          <i className="bi bi-snow me-1" />{user.status === "Frozen" ? "Unfreeze" : "Freeze"}
        </button>
      </>}>
      <div className="pm-card pm-card-pad mb-3 d-flex align-items-center gap-3">
        <div className="pm-avatar lg" style={{ background: avatarColor(user.name), width: 56, height: 56, fontSize: "1.2rem", borderRadius: 14 }}>{initials(user.name)}</div>
        <div className="flex-grow-1">
          <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>{user.name}</div>
          <div style={{ fontSize: ".76rem", color: "var(--pm-muted)" }}>{user.email}</div>
          <div className="d-flex gap-1 mt-1 flex-wrap">
            <Badge tone={tierTone(user.tier)}>{user.tier}</Badge>
            <Badge tone={kycTone(user.kyc)}>{user.kyc}</Badge>
            <Badge tone={statusTone(user.status)} dot>{user.status}</Badge>
            {user.tags.map((t) => <Badge key={t} tone="grey">{t}</Badge>)}
          </div>
        </div>
      </div>
      <div className="row g-2 mb-3">
        {[{ l: "Balance", v: kes(user.balance) }, { l: "Txns (30d)", v: num(user.txn30d) },
          { l: "Volume (30d)", v: kes(user.volume30d, { compact: true }) }, { l: "Risk score", v: String(user.riskScore) },
          { l: "Cards", v: String(user.cards) }, { l: "Loans", v: String(user.loans) },
          { l: "Referrals", v: String(user.referrals) }, { l: "NPS", v: user.nps !== null ? String(user.nps) : "—" }].map((x) => (
          <div className="col-6 col-lg-3" key={x.l}><div className="pm-stat" style={{ padding: ".55rem .6rem" }}>
            <div className="pm-stat-label" style={{ fontSize: ".56rem" }}>{x.l}</div>
            <div style={{ fontFamily: "Sora", fontWeight: 700, fontSize: ".95rem" }}>{x.v}</div></div></div>
        ))}
      </div>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Phone</span><span className="v mono">{user.phone}</span></div>
        <div className="pm-kv"><span className="k">Email</span><span className="v">{user.email}</span></div>
        <div className="pm-kv"><span className="k">County</span><span className="v">{user.county}</span></div>
        <div className="pm-kv"><span className="k">Gender / Age</span><span className="v">{user.gender === "M" ? "Male" : "Female"} · {user.age} years</span></div>
        <div className="pm-kv"><span className="k">Occupation</span><span className="v">{user.occupation}</span></div>
        <div className="pm-kv"><span className="k">Device</span><span className="v">{user.device}</span></div>
        <div className="pm-kv"><span className="k">Channel</span><span className="v">{user.channel}</span></div>
        <div className="pm-kv"><span className="k">Joined</span><span className="v">{user.joined}</span></div>
        <div className="pm-kv"><span className="k">Last active</span><span className="v">{user.lastActive}</span></div>
        <div className="pm-kv"><span className="k">RM</span><span className="v">{user.rm}</span></div>
      </div>
      <div className="pm-card mb-3">
        <div className="pm-card-head"><h6 className="pm-card-title">Quick actions</h6><span className="pm-eyebrow">Super Admin · Tier 0</span></div>
        <div className="p-2 d-flex flex-column gap-1">
          <button className="pm-dd-item" onClick={() => onFreeze(user)}><i className="bi bi-snow" style={{ color: "#0ba5ec" }} /><span className="flex-grow-1">{user.status === "Frozen" ? "Unfreeze account" : "Freeze account"}</span><Badge tone="amber">2FA</Badge></button>
          <button className="pm-dd-item" onClick={() => onEdit(user)}><i className="bi bi-pencil-square" style={{ color: "#667085" }} /><span className="flex-grow-1">Edit profile</span></button>
          <button className="pm-dd-item" onClick={() => onAdjustLimits(user)}><i className="bi bi-sliders" style={{ color: "#7a5af8" }} /><span className="flex-grow-1">Adjust transaction limits</span><Badge tone="amber">2FA</Badge></button>
          <button className="pm-dd-item" onClick={() => onGrantVip(user)}><i className="bi bi-gem" style={{ color: "#ee46bc" }} /><span className="flex-grow-1">{user.tier === "VIP" ? "Revoke VIP" : "Grant VIP"}</span></button>
          <button className="pm-dd-item" onClick={() => onImpersonate(user)}><i className="bi bi-incognito" style={{ color: "#f79009" }} /><span className="flex-grow-1">Impersonate user</span><Badge tone="red">Super only</Badge></button>
          <button className="pm-dd-item" onClick={() => onLoginHistory(user)}><i className="bi bi-clock-history" style={{ color: "#667085" }} /><span className="flex-grow-1">Login history</span></button>
          <button className="pm-dd-item" onClick={() => onTransactionHistory(user)}><i className="bi bi-journal-text" style={{ color: "#667085" }} /><span className="flex-grow-1">Transaction history</span></button>
          <button className="pm-dd-item" onClick={() => onActivity(user)}><i className="bi bi-activity" style={{ color: "#2e90fa" }} /><span className="flex-grow-1">Activity log</span></button>
          <button className="pm-dd-item" onClick={() => onRisk(user)}><i className="bi bi-shield-exclamation" style={{ color: "#f79009" }} /><span className="flex-grow-1">Risk assessment</span></button>
          <button className="pm-dd-item" onClick={() => onMessage(user)}><i className="bi bi-envelope-paper" style={{ color: "#7a5af8" }} /><span className="flex-grow-1">Send message</span></button>
          <button className="pm-dd-item" onClick={() => onCompliance(user)}><i className="bi bi-shield-check" style={{ color: "#12b76a" }} /><span className="flex-grow-1">Compliance</span></button>
          <button className="pm-dd-item" onClick={() => onInsights(user)}><i className="bi bi-lightbulb" style={{ color: "#f79009" }} /><span className="flex-grow-1">Insights</span></button>
          <button className="pm-dd-item" onClick={() => onAudit(user)}><i className="bi bi-clock-history" style={{ color: "#2e90fa" }} /><span className="flex-grow-1">Audit trail</span></button>
          <button className="pm-dd-item" onClick={() => onNotifications(user)}><i className="bi bi-bell" style={{ color: "#ee46bc" }} /><span className="flex-grow-1">Notifications</span></button>
          <button className="pm-dd-item" onClick={() => onHealth(user)}><i className="bi bi-heart-pulse" style={{ color: "#12b76a" }} /><span className="flex-grow-1">Health score</span></button>
          <div style={{ height: 1, background: "var(--pm-border)", margin: ".2rem .3rem" }} />
          <button className="pm-dd-item danger" onClick={() => onCloseAccount(user)}><i className="bi bi-x-octagon" style={{ color: "#d92d20" }} /><span className="flex-grow-1">Close account</span><Badge tone="red">2FA + compliance</Badge></button>
        </div>
      </div>
      <div className="pm-card">
        <div className="pm-card-head"><h6 className="pm-card-title">Activity timeline</h6></div>
        <div className="p-3"><div className="pm-timeline">
          {[["Last transaction", `${user.lastActive} · ${kes(Math.round(user.volume30d / Math.max(user.txn30d, 1)))} via ${user.channel}`, "done"],
            ["Balance update", `Current ${kes(user.balance)} · ${user.tier} tier`, "done"],
            ["KYC check", `${user.kyc} · Onfido ID ${user.id.slice(-5)}`, user.kyc === "Verified" ? "done" : "warn"],
            ["Account created", user.joined, ""],
          ].map(([t, d, c], i) => (
            <div key={i} className={`pm-tl-item ${c}`}>
              <div style={{ fontWeight: 700, fontSize: ".82rem" }}>{t}</div>
              <div style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>{d}</div>
            </div>
          ))}
        </div></div>
      </div>
    </Drawer>
  );
}

/* ============================ 2. Edit user modal ============================ */
export function EditUserModal({ user, onClose, onSave }: { user: User | null; onClose: () => void; onSave: (u: User) => void }) {
  const { push } = useToast();
  const [draft, setDraft] = useState<User | null>(null);
  if (!user && !draft) return null;
  const u = draft ?? user!;
  if (!draft && user) setTimeout(() => setDraft({ ...user }), 0);
  if (!draft) return null;
  return (
    <Modal open onClose={() => { setDraft(null); onClose(); }} tone="blue" icon="bi-pencil-square" size="lg"
      title={`Edit — ${u.name}`} subtitle={`${u.id} · changes are written to the audit log`}>
      <div className="pm-modal-body">
        <div className="row g-2">
          <div className="col-md-6"><label className="form-label">Full name</label><input className="form-control" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
          <div className="col-md-6"><label className="form-label">Email</label><input className="form-control" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></div>
          <div className="col-md-6"><label className="form-label">Phone</label><input className="form-control" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} /></div>
          <div className="col-md-6"><label className="form-label">County</label>
            <select className="form-select" value={draft.county} onChange={(e) => setDraft({ ...draft, county: e.target.value })}>
              {["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Uasin Gishu", "Machakos", "Nyeri", "Kakamega", "Kiambu", "Kilifi"].map((c) => <option key={c}>{c}</option>)}
            </select></div>
          <div className="col-md-4"><label className="form-label">Tier</label>
            <select className="form-select" value={draft.tier} onChange={(e) => setDraft({ ...draft, tier: e.target.value as Tier })}>
              {["Basic", "Verified", "VIP", "Business", "Agent"].map((t) => <option key={t}>{t}</option>)}
            </select></div>
          <div className="col-md-4"><label className="form-label">Occupation</label><input className="form-control" value={draft.occupation} onChange={(e) => setDraft({ ...draft, occupation: e.target.value })} /></div>
          <div className="col-md-4"><label className="form-label">RM</label>
            <select className="form-select" value={draft.rm} onChange={(e) => setDraft({ ...draft, rm: e.target.value })}>
              {["Grace Wanjiru", "Peter Njoroge", "Faith Chebet", "Dennis Otieno", "Unassigned"].map((r) => <option key={r}>{r}</option>)}
            </select></div>
          <div className="col-12"><label className="form-label">Tags (comma-separated)</label><input className="form-control" value={draft.tags.join(", ")} onChange={(e) => setDraft({ ...draft, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} /></div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => { setDraft(null); onClose(); }}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => { onSave(draft); push({ kind: "success", title: "Profile updated", body: `${draft.name} · AUD-88245 logged.` }); setDraft(null); onClose(); }}>
          <i className="bi bi-check2 me-1" />Save changes
        </button>
      </div>
    </Modal>
  );
}

/* ============================ 3. Freeze / unfreeze wizard ============================ */
const FREEZE_REASONS = [
  { id: "fraud", label: "Suspected fraud", icon: "bi-shield-exclamation" },
  { id: "ato", label: "Account takeover", icon: "bi-person-lock" },
  { id: "aml", label: "AML / sanctions hit", icon: "bi-globe-americas" },
  { id: "court", label: "Court or regulator order", icon: "bi-bank" },
  { id: "customer", label: "Customer request", icon: "bi-telephone-x" },
];
export function FreezeWizard({ user, onClose, onDone }: { user: User | null; onClose: () => void; onDone: (u: User, action: string) => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [reason, setReason] = useState("fraud");
  const [note, setNote] = useState("");
  const [scope, setScope] = useState({ withdrawals: true, transfers: true, cards: true, logins: false });
  const [code, setCode] = useState("");
  const isUnfreeze = user?.status === "Frozen";
  const steps = isUnfreeze
    ? [{ label: "Confirm", icon: "bi-unlock" }, { label: "2FA", icon: "bi-shield-lock" }]
    : [{ label: "Reason", icon: "bi-chat-left-text" }, { label: "Scope", icon: "bi-crosshair" }, { label: "2FA", icon: "bi-shield-lock" }, { label: "Confirm", icon: "bi-check2" }];
  const close = () => { setStep(0); setNote(""); setCode(""); onClose(); };
  if (!user) return null;
  const canNext = isUnfreeze ? (step === 0 ? true : code === "482913") : (step === 0 ? note.trim().length >= 10 : step === 2 ? code === "482913" : true);
  return (
    <Modal open onClose={close} tone={isUnfreeze ? "green" : "blue"} icon={isUnfreeze ? "bi-unlock" : "bi-snow"} size="md"
      title={isUnfreeze ? `Unfreeze ${user.name}?` : `Freeze ${user.name}`}
      subtitle={`${user.id} · ${user.phone} · balance ${kes(user.balance)}`}>
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {isUnfreeze && step === 0 && (
          <div className="pm-note" style={{ borderColor: "#b7e6cf", background: "#e7f8ef", color: "#05603a" }}>
            <i className="bi bi-unlock me-1" />Unfreezing restores full money-movement capability. Ensure the investigation is closed before proceeding.
          </div>
        )}
        {!isUnfreeze && step === 0 && (
          <>
            <div className="d-flex flex-column gap-2 mb-3">
              {FREEZE_REASONS.map((r) => (
                <button key={r.id} className={`pm-opt ${reason === r.id ? "active" : ""}`} onClick={() => setReason(r.id)}>
                  <span className="r" /><i className={`bi ${r.icon}`} style={{ color: "var(--pm-blue)" }} /><span style={{ fontWeight: 700, fontSize: ".85rem" }}>{r.label}</span>
                </button>
              ))}
            </div>
            <label className="form-label">Note (min 10 chars)</label>
            <textarea className="form-control" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
          </>
        )}
        {!isUnfreeze && step === 1 && (
          <div className="d-flex flex-column gap-2">
            {[{ k: "withdrawals", l: "Block withdrawals" }, { k: "transfers", l: "Block transfers" },
              { k: "cards", l: "Suspend cards" }, { k: "logins", l: "Block logins" }].map((x) => (
              <label key={x.k} className={`pm-opt ${scope[x.k as keyof typeof scope] ? "active" : ""}`}>
                <input type="checkbox" className="form-check-input mt-0" checked={scope[x.k as keyof typeof scope]}
                  onChange={(e) => setScope({ ...scope, [x.k]: e.target.checked })} />
                <span style={{ fontWeight: 700, fontSize: ".85rem" }}>{x.l}</span>
              </label>
            ))}
          </div>
        )}
        {((isUnfreeze && step === 1) || (!isUnfreeze && step === 2)) && <TwoFactorField value={code} onChange={setCode} />}
        {!isUnfreeze && step === 3 && (
          <div className="pm-card pm-card-pad">
            <div className="pm-kv"><span className="k">Account</span><span className="v">{user.name} · {user.id}</span></div>
            <div className="pm-kv"><span className="k">Balance held</span><span className="v">{kes(user.balance)}</span></div>
            <div className="pm-kv"><span className="k">Reason</span><span className="v">{FREEZE_REASONS.find((r) => r.id === reason)?.label}</span></div>
            <div className="pm-kv"><span className="k">Scope</span><span className="v">{Object.entries(scope).filter(([, v]) => v).map(([k]) => k).join(", ")}</span></div>
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}><i className="bi bi-arrow-left me-1" />Back</button>}
        {step < steps.length - 1 && <button className="btn btn-primary btn-sm" disabled={!canNext} onClick={() => setStep(step + 1)}>Next<i className="bi bi-arrow-right ms-1" /></button>}
        {step === steps.length - 1 && <button className={`btn ${isUnfreeze ? "btn-primary" : "btn-primary"} btn-sm`} disabled={!canNext} onClick={() => {
          onDone(user, isUnfreeze ? "unfrozen" : "frozen");
          push({ kind: "success", title: `${user.name} ${isUnfreeze ? "unfrozen" : "frozen"}`, body: `${user.id} · audit entry logged.` });
          close();
        }}><i className={`bi ${isUnfreeze ? "bi-unlock" : "bi-snow"} me-1`} />{isUnfreeze ? "Unfreeze" : "Freeze account"}</button>}
      </div>
    </Modal>
  );
}

/* ============================ 4. Adjust limits wizard ============================ */
export function AdjustLimitsWizard({ user, onClose }: { user: User | null; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [limits, setLimits] = useState({ dailyWithdraw: 150_000, dailyTransfer: 300_000, monthlyVolume: 5_000_000, singleTxMax: 500_000 });
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  const steps = [{ label: "Limits", icon: "bi-sliders" }, { label: "Reason", icon: "bi-chat-left-text" }, { label: "2FA", icon: "bi-shield-lock" }];
  const close = () => { setStep(0); setCode(""); onClose(); };
  if (!user) return null;
  return (
    <Modal open onClose={close} tone="violet" icon="bi-sliders2" size="md"
      title={`Adjust limits — ${user.name}`} subtitle={`${user.id} · tier ${user.tier}`}>
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%`, background: "#7a5af8" }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div className="row g-2">
            {Object.entries({ dailyWithdraw: "Daily withdrawal", dailyTransfer: "Daily transfer", monthlyVolume: "Monthly volume", singleTxMax: "Single transaction max" }).map(([k, l]) => (
              <div className="col-6" key={k}>
                <label className="form-label">{l}</label>
                <div className="input-group"><span className="input-group-text">KES</span>
                  <input type="number" className="form-control mono" value={limits[k as keyof typeof limits]}
                    onChange={(e) => setLimits({ ...limits, [k]: Number(e.target.value) })} /></div>
              </div>
            ))}
            <div className="col-12">
              <div className="pm-note mt-1"><i className="bi bi-info-circle me-1" />Default limits for {user.tier} tier: KES 150,000 daily / KES 5,000,000 monthly. CBK ceiling: KES 500,000 single transaction.</div>
            </div>
          </div>
        )}
        {step === 1 && (
          <>
            <label className="form-label">Reason for limit change</label>
            <textarea className="form-control mb-2" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. VIP client requires higher ceilings for payroll disbursement." />
            <div className="d-flex gap-1 flex-wrap">
              {["VIP upgrade", "Merchant payroll", "Temporary for event", "Risk reduction", "CBK instruction"].map((r) => (
                <button key={r} className="pm-chip" onClick={() => setReason(r + ".")}>{r}</button>
              ))}
            </div>
          </>
        )}
        {step === 2 && <TwoFactorField value={code} onChange={setCode} />}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}><i className="bi bi-arrow-left me-1" />Back</button>}
        {step < 2 && <button className="btn btn-primary btn-sm" disabled={step === 1 && reason.trim().length < 5} onClick={() => setStep(step + 1)}>Next<i className="bi bi-arrow-right ms-1" /></button>}
        {step === 2 && <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => {
          push({ kind: "success", title: "Limits updated", body: `${user.name} · daily withdraw ${kes(limits.dailyWithdraw)}.` }); close();
        }}><i className="bi bi-check2 me-1" />Apply limits</button>}
      </div>
    </Modal>
  );
}

/* ============================ 5. Grant / revoke VIP modal ============================ */
export function VipModal({ user, onClose, onDone }: { user: User | null; onClose: () => void; onDone: (u: User) => void }) {
  const { push } = useToast();
  const [duration, setDuration] = useState("12");
  const [feeExempt, setFeeExempt] = useState(true);
  const isRevoke = user?.tier === "VIP";
  if (!user) return null;
  return (
    <Modal open onClose={onClose} tone={isRevoke ? "red" : "violet"} icon="bi-gem" size="sm"
      title={isRevoke ? `Revoke VIP — ${user.name}` : `Grant VIP — ${user.name}`}
      subtitle={`${user.id} · current tier ${user.tier}`}>
      <div className="pm-modal-body">
        {!isRevoke && (
          <>
            <label className="form-label">VIP duration</label>
            <select className="form-select mb-3" value={duration} onChange={(e) => setDuration(e.target.value)}>
              <option value="6">6 months</option><option value="12">12 months</option><option value="24">Permanent</option>
            </select>
            <label className="pm-opt mb-3">
              <input type="checkbox" className="form-check-input mt-0" checked={feeExempt} onChange={(e) => setFeeExempt(e.target.checked)} />
              <span style={{ fontWeight: 700, fontSize: ".85rem" }}>Exempt from transaction fees</span>
            </label>
          </>
        )}
        {isRevoke && <div className="pm-note" style={{ borderColor: "#fbd3cf", background: "#fef2f2", color: "#b42318" }}>
          <i className="bi bi-exclamation-triangle me-1" />Revoking VIP removes concierge access and restores the standard fee schedule. The customer is notified.
        </div>}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className={`btn ${isRevoke ? "btn-danger" : "btn-primary"} btn-sm`} onClick={() => {
          onDone(user);
          push({ kind: "success", title: isRevoke ? "VIP revoked" : "VIP granted", body: `${user.name} · ${isRevoke ? "downgraded to Verified" : `VIP for ${duration} months`}.` });
          onClose();
        }}><i className={`bi ${isRevoke ? "bi-x-circle" : "bi-gem"} me-1`} />{isRevoke ? "Revoke VIP" : "Grant VIP"}</button>
      </div>
    </Modal>
  );
}

/* ============================ 6. Impersonate modal ============================ */
export function ImpersonateModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  const { push } = useToast();
  const [code, setCode] = useState("");
  const [ack, setAck] = useState(false);
  if (!user) return null;
  return (
    <Modal open onClose={onClose} tone="red" icon="bi-incognito" size="sm"
      title={`Impersonate ${user.name}?`} subtitle={`${user.id} · Super Admin only · every action is logged`}>
      <div className="pm-modal-body">
        <div className="pm-note mb-3" style={{ borderColor: "#fbd3cf", background: "#fef2f2", color: "#b42318" }}>
          <i className="bi bi-exclamation-octagon me-1" />You will see exactly what the customer sees. All actions taken during impersonation are watermarked in the audit log. Restricted to 15 minutes.
        </div>
        <label className="pm-opt mb-3">
          <input type="checkbox" className="form-check-input mt-0" checked={ack} onChange={(e) => setAck(e.target.checked)} />
          <span style={{ fontWeight: 700, fontSize: ".84rem" }}>I understand this is a privileged operation and agree to the data-handling policy</span>
        </label>
        <TwoFactorField value={code} onChange={setCode} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger btn-sm" disabled={code !== "482913" || !ack} onClick={() => {
          push({ kind: "warn", title: `Impersonating ${user.name}`, body: `Session IMP-2026-0041 opened · auto-expires in 15 minutes.` }); onClose();
        }}><i className="bi bi-incognito me-1" />Start impersonation</button>
      </div>
    </Modal>
  );
}

/* ============================ 7. Bulk actions modal ============================ */
export function BulkActionsModal({ open, onClose, count, onDone }: { open: boolean; onClose: () => void; count: number; onDone: (action: string) => void }) {
  const [action, setAction] = useState("freeze");
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  return (
    <Modal open={open} onClose={onClose} tone="amber" icon="bi-check2-square" size="md"
      title={`Bulk action on ${count} users`} subtitle="Applied atomically with one audit batch reference.">
      <div className="pm-modal-body">
        <div className="d-flex flex-column gap-2 mb-3">
          {[{ id: "freeze", l: "Freeze accounts", i: "bi-snow" }, { id: "unfreeze", l: "Unfreeze accounts", i: "bi-unlock" },
            { id: "upgrade", l: "Upgrade tier", i: "bi-arrow-up-circle" }, { id: "tag", l: "Apply tag", i: "bi-tag" },
            { id: "assign-rm", l: "Assign RM", i: "bi-person-check" }, { id: "export", l: "Export profiles", i: "bi-download" },
            { id: "broadcast", l: "Send message", i: "bi-envelope" }].map((a) => (
            <button key={a.id} className={`pm-opt ${action === a.id ? "active" : ""}`} onClick={() => setAction(a.id)}>
              <span className="r" /><i className={`bi ${a.i}`} style={{ color: "#b54708" }} />
              <span style={{ fontWeight: 700, fontSize: ".85rem" }}>{a.l}</span>
            </button>
          ))}
        </div>
        {["freeze", "unfreeze"].includes(action) && (
          <>
            <label className="form-label">Reason</label>
            <textarea className="form-control mb-3" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
            <TwoFactorField value={code} onChange={setCode} />
          </>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm"
          disabled={["freeze", "unfreeze"].includes(action) ? code !== "482913" || reason.trim().length < 5 : false}
          onClick={() => { onDone(action); onClose(); }}>Apply to {count}</button>
      </div>
    </Modal>
  );
}

/* ============================ 8. Column configurator modal ============================ */
import type { ColumnDef } from "../data/userData";
export function ColumnConfigModal({ open, onClose, columns, onChange }: {
  open: boolean; onClose: () => void; columns: string[]; onChange: (cols: string[]) => void;
}) {
  const { push } = useToast();
  const allCols = COLUMNS;
  const toggle = (k: string) => onChange(columns.includes(k) ? columns.filter((c) => c !== k) : [...columns, k]);
  return (
    <Modal open={open} onClose={onClose} tone="ink" icon="bi-layout-three-columns" size="sm"
      title="Configure columns" subtitle="Choose which columns appear in the directory table.">
      <div className="pm-modal-body">
        <div className="d-flex flex-column gap-1">
          {allCols.filter((c) => c.key !== "actions").map((c) => (
            <label key={c.key} className={`pm-opt ${columns.includes(c.key) ? "active" : ""}`} style={{ padding: ".4rem .6rem" }}>
              <input type="checkbox" className="form-check-input mt-0" checked={columns.includes(c.key)}
                onChange={() => toggle(c.key)} />
              <span style={{ fontSize: ".84rem", fontWeight: 600 }}>{c.label}</span>
              {c.sortable && <Badge tone="grey">sortable</Badge>}
            </label>
          ))}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => { onChange(allCols.filter((c) => c.default).map((c) => c.key)); push({ kind: "info", title: "Columns reset to defaults" }); }}>Reset defaults</button>
        <button className="btn btn-primary btn-sm" onClick={onClose}>Done</button>
      </div>
    </Modal>
  );
}

/* ============================ 9. Save view modal ============================ */
export function SaveViewModal({ open, onClose, currentFilters, onSave }: {
  open: boolean; onClose: () => void; currentFilters: string; onSave: (v: SavedView) => void;
}) {
  const { push } = useToast();
  const [name, setName] = useState("");
  const [shared, setShared] = useState(true);
  return (
    <Modal open={open} onClose={onClose} tone="green" icon="bi-bookmark-plus" size="sm"
      title="Save this view" subtitle="Filter combination is saved for quick recall.">
      <div className="pm-modal-body">
        <label className="form-label">View name</label>
        <input className="form-control mb-3" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. VIP clients — Nairobi" />
        <label className="pm-opt">
          <input type="checkbox" className="form-check-input mt-0" checked={shared} onChange={(e) => setShared(e.target.checked)} />
          <span style={{ fontWeight: 700, fontSize: ".84rem" }}>Share with all admins</span>
        </label>
        <div className="pm-note mt-3"><i className="bi bi-info-circle me-1" />Current filters: <b className="mono">{currentFilters || "none"}</b></div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={name.trim().length < 3} onClick={() => {
          const v: SavedView = { id: `sv-${Date.now()}`, name, filters: currentFilters, count: Math.floor(Math.random() * 5000), owner: "Jeckonia Kwasa", shared };
          onSave(v); push({ kind: "success", title: "View saved", body: `"${name}" is now available in saved views.` }); onClose();
        }}><i className="bi bi-bookmark-check me-1" />Save view</button>
      </div>
    </Modal>
  );
}

/* ============================ 10. Saved views drawer ============================ */
export function SavedViewsDrawer({ open, onClose, views, onApply, onDelete }: {
  open: boolean; onClose: () => void; views: SavedView[]; onApply: (v: SavedView) => void; onDelete: (id: string) => void;
}) {
  const { push } = useToast();
  return (
    <Drawer open={open} onClose={onClose} icon="bi-bookmarks" tone="blue" title="Saved views"
      subtitle={`${views.length} views saved · click to apply`}>
      <div className="d-flex flex-column gap-2">
        {views.map((v) => (
          <div key={v.id} className="pm-alert-row info d-flex align-items-center gap-2">
            <button className="flex-grow-1 border-0 bg-transparent text-start p-0" onClick={() => { onApply(v); onClose(); push({ kind: "success", title: `View "${v.name}" applied` }); }}>
              <div style={{ fontWeight: 700, fontSize: ".84rem" }}>{v.name}</div>
              <div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{v.filters} · {num(v.count)} users</div>
              <div className="d-flex gap-1 mt-1">
                <Badge tone="grey">{v.owner}</Badge>
                {v.shared && <Badge tone="blue">Shared</Badge>}
              </div>
            </button>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => { onDelete(v.id); push({ kind: "info", title: `"${v.name}" deleted` }); }}><i className="bi bi-trash" /></button>
          </div>
        ))}
        {views.length === 0 && <div className="pm-note text-center">No saved views yet.</div>}
      </div>
    </Drawer>
  );
}

/* ============================ 11. Export modal ============================ */
export function ExportUsersModal({ open, onClose, count }: { open: boolean; onClose: () => void; count: number }) {
  const { push } = useToast();
  const [fmt, setFmt] = useState("csv");
  const [fields, setFields] = useState({ pii: true, balance: true, risk: true, kyc: true });
  return (
    <Modal open={open} onClose={onClose} tone="blue" icon="bi-download" size="sm"
      title={`Export ${num(count)} users`} subtitle="Watermarked with your identity.">
      <div className="pm-modal-body">
        <label className="form-label">Format</label>
        <div className="d-flex gap-2 mb-3">
          {[["csv", "CSV"], ["json", "JSON"], ["xlsx", "Excel"]].map(([v, l]) => (
            <button key={v} className={`pm-chip ${fmt === v ? "active" : ""}`} onClick={() => setFmt(v)}>{l}</button>
          ))}
        </div>
        <label className="form-label">Include fields</label>
        <div className="d-flex flex-column gap-2">
          {[["pii", "PII (name, email, phone)"], ["balance", "Financial (balance, volume)"], ["risk", "Risk score & flags"], ["kyc", "KYC status & documents"]].map(([k, l]) => (
            <label key={k} className={`pm-opt ${(fields as any)[k] ? "active" : ""}`}>
              <input type="checkbox" className="form-check-input mt-0" checked={(fields as any)[k]} onChange={(e) => setFields({ ...fields, [k]: e.target.checked })} />
              <span style={{ fontWeight: 700, fontSize: ".84rem" }}>{l}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => {
          push({ kind: "success", title: `${num(count)} users exported`, body: `${fmt.toUpperCase()} · ${Object.values(fields).filter(Boolean).length} field groups.` }); onClose();
        }}><i className="bi bi-download me-1" />Download</button>
      </div>
    </Modal>
  );
}

/* ============================ 12. Advanced search drawer ============================ */
export type SearchFilters = {
  q: string; tier: string; kyc: string; status: string; county: string; channel: string;
  balanceMin: number; balanceMax: number; riskMin: number; riskMax: number; tags: string[];
};
export const EMPTY_FILTERS: SearchFilters = { q: "", tier: "all", kyc: "all", status: "all", county: "all", channel: "all", balanceMin: 0, balanceMax: 0, riskMin: 0, riskMax: 0, tags: [] };

export function AdvancedSearchDrawer({ open, onClose, filters, onApply }: {
  open: boolean; onClose: () => void; filters: SearchFilters; onApply: (f: SearchFilters) => void;
}) {
  const [f, setF] = useState<SearchFilters>(filters);
  const { push } = useToast();
  return (
    <Drawer open={open} onClose={onClose} icon="bi-funnel-fill" tone="blue" title="Advanced search"
      subtitle="Combine multiple criteria to narrow the directory."
      footer={<>
        <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => { setF(EMPTY_FILTERS); onApply(EMPTY_FILTERS); push({ kind: "info", title: "Filters cleared" }); }}>Clear all</button>
        <button className="btn btn-primary btn-sm" onClick={() => { onApply(f); onClose(); push({ kind: "success", title: "Filters applied" }); }}>Apply</button>
      </>}>
      <div className="d-flex flex-column gap-3">
        <div><label className="form-label">Tier</label>
          <select className="form-select" value={f.tier} onChange={(e) => setF({ ...f, tier: e.target.value })}>
            <option value="all">All tiers</option>{["Basic", "Verified", "VIP", "Business", "Agent"].map((t) => <option key={t}>{t}</option>)}
          </select></div>
        <div><label className="form-label">KYC status</label>
          <select className="form-select" value={f.kyc} onChange={(e) => setF({ ...f, kyc: e.target.value })}>
            <option value="all">All</option>{["Verified", "Pending", "Rejected", "Expired", "Under review"].map((k) => <option key={k}>{k}</option>)}
          </select></div>
        <div><label className="form-label">Account status</label>
          <select className="form-select" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
            <option value="all">All</option>{["Active", "Frozen", "Dormant", "Suspended", "Closed"].map((s) => <option key={s}>{s}</option>)}
          </select></div>
        <div><label className="form-label">County</label>
          <select className="form-select" value={f.county} onChange={(e) => setF({ ...f, county: e.target.value })}>
            <option value="all">All counties</option>{["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Uasin Gishu", "Machakos", "Nyeri", "Kakamega", "Kiambu", "Kilifi"].map((c) => <option key={c}>{c}</option>)}
          </select></div>
        <div><label className="form-label">Channel</label>
          <select className="form-select" value={f.channel} onChange={(e) => setF({ ...f, channel: e.target.value })}>
            <option value="all">All</option>{["App", "USSD", "Web", "API", "POS"].map((c) => <option key={c}>{c}</option>)}
          </select></div>
        <div><label className="form-label">Balance range (KES)</label>
          <div className="d-flex gap-2">
            <input type="number" className="form-control mono" placeholder="Min" value={f.balanceMin || ""} onChange={(e) => setF({ ...f, balanceMin: Number(e.target.value) })} />
            <input type="number" className="form-control mono" placeholder="Max" value={f.balanceMax || ""} onChange={(e) => setF({ ...f, balanceMax: Number(e.target.value) })} />
          </div></div>
        <div><label className="form-label">Risk score range</label>
          <div className="d-flex gap-2">
            <input type="number" className="form-control mono" placeholder="Min" value={f.riskMin || ""} onChange={(e) => setF({ ...f, riskMin: Number(e.target.value) })} />
            <input type="number" className="form-control mono" placeholder="Max (100)" value={f.riskMax || ""} onChange={(e) => setF({ ...f, riskMax: Number(e.target.value) })} />
          </div></div>
        <div><label className="form-label">Tags</label>
          <div className="d-flex gap-1 flex-wrap">
            {["high-value", "early-adopter", "merchant", "loan-default", "card-active", "dormant-risk", "sacco-member", "diaspora"].map((t) => (
              <button key={t} className={`pm-chip ${f.tags.includes(t) ? "active" : ""}`} onClick={() => setF({ ...f, tags: f.tags.includes(t) ? f.tags.filter((x) => x !== t) : [...f.tags, t] })}>{t}</button>
            ))}
          </div></div>
      </div>
    </Drawer>
  );
}

/* ============================ 13. Login history modal ============================ */
export function LoginHistoryModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  if (!user) return null;
  const sessions = [
    { device: "iPhone 15 Pro", ip: "41.89.72.14", loc: "Nairobi, KE", time: "24 Aug 2026 14:32", dur: "18 min", status: "Active" },
    { device: "Chrome / Windows", ip: "41.89.72.14", loc: "Nairobi, KE", time: "23 Aug 2026 09:15", dur: "42 min", status: "Ended" },
    { device: "iPhone 15 Pro", ip: "102.68.94.22", loc: "Mombasa, KE", time: "22 Aug 2026 18:04", dur: "7 min", status: "Ended" },
    { device: "Safari / macOS", ip: "41.89.72.14", loc: "Nairobi, KE", time: "21 Aug 2026 11:20", dur: "25 min", status: "Ended" },
    { device: "Chrome / Android", ip: "197.248.33.56", loc: "Kisumu, KE", time: "20 Aug 2026 08:45", dur: "3 min", status: "Ended" },
    { device: "iPhone 15 Pro", ip: "41.89.72.14", loc: "Nairobi, KE", time: "19 Aug 2026 16:10", dur: "55 min", status: "Ended" },
  ];
  return (
    <Drawer open onClose={onClose} icon="bi-clock-history" tone="blue" title="Login history"
      subtitle={`${user.name} · ${sessions.length} sessions in the last 30 days`}>
      <div className="d-flex flex-column gap-2">
        {sessions.map((s, i) => (
          <div key={i} className="pm-card pm-card-pad d-flex align-items-start gap-3">
            <i className="bi bi-laptop" style={{ fontSize: "1.2rem", color: s.status === "Active" ? "#12b76a" : "#667085", marginTop: 2 }} />
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2">
                <span style={{ fontWeight: 700, fontSize: ".84rem" }}>{s.device}</span>
                {s.status === "Active" && <Badge tone="green" dot>Active</Badge>}
              </div>
              <div style={{ fontSize: ".74rem", color: "var(--pm-muted)" }}>{s.ip} · {s.loc}</div>
              <div className="d-flex gap-2 mt-1">
                <span style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{s.time}</span>
                <span style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>Duration: {s.dur}</span>
              </div>
            </div>
            {i === 0 && <Badge tone="green">Current</Badge>}
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 14. Transaction history modal ============================ */
export function TransactionHistoryModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  if (!user) return null;
  const txns = [
    { id: "TXN-88412", time: "24 Aug 14:28", type: "Transfer", to: "Safaricom M-Pesa", amount: -15000, status: "Completed" },
    { id: "TXN-88398", time: "24 Aug 09:12", type: "Deposit", to: "Bank — KCB", amount: 50000, status: "Completed" },
    { id: "TXN-88376", time: "23 Aug 18:45", type: "Payment", to: "Kenya Power", amount: -4200, status: "Completed" },
    { id: "TXN-88351", time: "23 Aug 11:30", type: "Transfer", to: "Airtel Money", amount: -8500, status: "Completed" },
    { id: "TXN-88322", time: "22 Aug 16:05", type: "Card payment", to: "Carrefour Karen", amount: -3450, status: "Completed" },
    { id: "TXN-88301", time: "22 Aug 08:20", type: "Loan repayment", to: "PayMo Credit", amount: -12000, status: "Completed" },
  ];
  return (
    <Drawer open onClose={onClose} icon="bi-journal-text" tone="blue" title="Transaction history"
      subtitle={`${user.name} · ${user.txn30d} transactions · ${kes(user.volume30d, { compact: true })} volume (30d)`}>
      <div className="d-flex flex-column gap-2">
        {txns.map((t) => (
          <div key={t.id} className="pm-card pm-card-pad d-flex align-items-center gap-3">
            <div style={{ width: 36, height: 36, borderRadius: 10, background: t.amount > 0 ? "#e7f8ef" : "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className={`bi ${t.amount > 0 ? "bi-arrow-down-left" : "bi-arrow-up-right"}`} style={{ color: t.amount > 0 ? "#12b76a" : "#f04438" }} />
            </div>
            <div className="flex-grow-1">
              <div style={{ fontWeight: 700, fontSize: ".84rem" }}>{t.type} → {t.to}</div>
              <div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{t.id} · {t.time}</div>
            </div>
            <div className="text-end">
              <div style={{ fontWeight: 800, fontSize: ".88rem", color: t.amount > 0 ? "#12b76a" : "var(--pm-ink)" }}>{t.amount > 0 ? "+" : ""}{kes(Math.abs(t.amount))}</div>
              <Badge tone="green">{t.status}</Badge>
            </div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 15. Close account wizard ============================ */
export function CloseAccountModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  if (!user) return null;
  const steps = [{ label: "Reason", icon: "bi-chat-left-text" }, { label: "Impact", icon: "bi-exclamation-triangle" }, { label: "2FA", icon: "bi-shield-lock" }];
  return (
    <Modal open onClose={onClose} tone="red" icon="bi-x-octagon" size="md"
      title={`Close account — ${user.name}`} subtitle="Requires Compliance Officer co-approval and 30-day cooling period">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%`, background: "#f04438" }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <>
            <label className="form-label">Reason for closure</label>
            <textarea className="form-control mb-3" rows={3} value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Customer deceased, court order, duplicate account." />
            <div className="d-flex gap-1 flex-wrap">
              {["Customer request", "Duplicate account", "Deceased", "Court order", "AML investigation", "Fraud confirmed"].map((r) => (
                <button key={r} className="pm-chip" onClick={() => setReason(r + ".")}>{r}</button>
              ))}
            </div>
          </>
        )}
        {step === 1 && (
          <div className="d-flex flex-column gap-2">
            <div className="pm-alert-row crit">
              <i className="bi bi-exclamation-triangle" style={{ color: "#f04438" }} />
              <div className="flex-grow-1"><div style={{ fontWeight: 700, fontSize: ".84rem" }}>Balance frozen</div><div style={{ fontSize: ".74rem", color: "var(--pm-muted)" }}>{kes(user.balance)} held pending review</div></div>
            </div>
            <div className="pm-alert-row crit">
              <i className="bi bi-credit-card" style={{ color: "#f04438" }} />
              <div className="flex-grow-1"><div style={{ fontWeight: 700, fontSize: ".84rem" }}>{user.cards} card(s) deactivated</div><div style={{ fontSize: ".74rem", color: "var(--pm-muted)" }}>Pending transactions reversed</div></div>
            </div>
            <div className="pm-alert-row warn">
              <i className="bi bi-clock-history" style={{ color: "#f79009" }} />
              <div className="flex-grow-1"><div style={{ fontWeight: 700, fontSize: ".84rem" }}>30-day cooling period</div><div style={{ fontSize: ".74rem", color: "var(--pm-muted)" }}>Account recoverable within 30 days</div></div>
            </div>
            <div className="pm-alert-row warn">
              <i className="bi bi-person-check" style={{ color: "#f79009" }} />
              <div className="flex-grow-1"><div style={{ fontWeight: 700, fontSize: ".84rem" }}>Compliance co-approval required</div><div style={{ fontSize: ".74rem", color: "var(--pm-muted)" }}>CCO must sign off</div></div>
            </div>
          </div>
        )}
        {step === 2 && (
          <>
            <div className="pm-note mb-3" style={{ borderColor: "#fbd3cf", background: "#fef2f2", color: "#b42318" }}>
              <i className="bi bi-exclamation-octagon me-1" />Irreversible after cooling period. 2FA required.
            </div>
            <TwoFactorField value={code} onChange={setCode} />
          </>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={onClose}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}><i className="bi bi-arrow-left me-1" />Back</button>}
        {step < 2 && <button className="btn btn-primary btn-sm" disabled={step === 0 && reason.trim().length < 5} onClick={() => setStep(step + 1)}>Next<i className="bi bi-arrow-right ms-1" /></button>}
        {step === 2 && <button className="btn btn-danger btn-sm" disabled={code !== "482913"} onClick={() => { push({ kind: "success", title: "Closure submitted", body: `${user.name} · cooling starts today` }); onClose(); }}>
          <i className="bi bi-x-octagon me-1" />Submit
        </button>}
      </div>
    </Modal>
  );
}

/* ============================ 16. Broadcast modal ============================ */
export function BroadcastModal({ open, onClose, count }: { open: boolean; onClose: () => void; count: number }) {
  const { push } = useToast();
  const [channel, setChannel] = useState<"push" | "sms" | "email" | "in-app">("push");
  const [template, setTemplate] = useState("");
  const templates = [
    { label: "Maintenance", body: "Scheduled maintenance on [date]. Services may be unavailable." },
    { label: "Feature launch", body: "We just launched [feature]! Update your app to try it." },
    { label: "Security alert", body: "Unusual activity detected. Please verify your identity." },
    { label: "Promo", body: "Exclusive offer: [details]. Valid until [date]." },
  ];
  return (
    <Modal open={open} onClose={onClose} tone="blue" icon="bi-broadcast" size="md"
      title="Broadcast message" subtitle={`Send to ${count.toLocaleString()} users`}>
      <div className="pm-modal-body">
        <label className="form-label">Channel</label>
        <div className="d-flex gap-2 mb-3">
          {[{ v: "push" as const, l: "Push", i: "bi-phone" }, { v: "sms" as const, l: "SMS", i: "bi-chat-dots" }, { v: "email" as const, l: "Email", i: "bi-envelope" }, { v: "in-app" as const, l: "In-app", i: "bi-window" }].map((c) => (
            <button key={c.v} className={`pm-opt flex-grow-1 ${channel === c.v ? "active" : ""}`} style={{ flexDirection: "column", gap: ".3rem" }} onClick={() => setChannel(c.v)}>
              <i className={`bi ${c.i}`} style={{ fontSize: "1.1rem" }} /><span style={{ fontSize: ".72rem", fontWeight: 700 }}>{c.l}</span>
            </button>
          ))}
        </div>
        <label className="form-label">Message</label>
        <textarea className="form-control mb-2" rows={4} value={template} onChange={(e) => setTemplate(e.target.value)} placeholder="Type your message or select a template." />
        <div className="d-flex gap-1 flex-wrap mb-3">
          {templates.map((t) => (
            <button key={t.label} className="pm-chip" onClick={() => setTemplate(t.body)}>{t.label}</button>
          ))}
        </div>
        <div className="pm-note"><i className="bi bi-info-circle me-1" />Delivered within 5 minutes. Opt-outs handled automatically.</div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={!template.trim()} onClick={() => { push({ kind: "success", title: "Broadcast queued", body: `${count.toLocaleString()} recipients · ${channel}` }); onClose(); }}>
          <i className="bi bi-send me-1" />Send
        </button>
      </div>
    </Modal>
  );
}

/* ============================ 17. Rename view modal ============================ */
export function RenameViewModal({ view, onClose, onRename }: { view: SavedView | null; onClose: () => void; onRename: (id: string, name: string) => void }) {
  const { push } = useToast();
  const [name, setName] = useState(view?.name ?? "");
  if (!view) return null;
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-pencil" size="sm" title="Rename view" subtitle={`Current: ${view.name}`}>
      <div className="pm-modal-body"><label className="form-label">New name</label>
        <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} autoFocus /></div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={!name.trim() || name === view.name}
          onClick={() => { onRename(view.id, name); push({ kind: "success", title: `Renamed to "${name}"` }); onClose(); }}>
          <i className="bi bi-check2 me-1" />Rename</button>
      </div>
    </Modal>
  );
}

/* ============================ 18. User activity timeline ============================ */
export function UserActivityModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  if (!user) return null;
  const acts = [
    { time: "24 Aug 14:32", action: "Transfer sent", detail: `KES 15,000 → M-Pesa`, icon: "bi-arrow-up-right", color: "#f04438" },
    { time: "24 Aug 09:12", action: "Deposit received", detail: `KES 50,000 from KCB`, icon: "bi-arrow-down-left", color: "#12b76a" },
    { time: "23 Aug 18:45", action: "Bill payment", detail: `KES 4,200 → Kenya Power`, icon: "bi-lightning", color: "#f79009" },
    { time: "23 Aug 11:30", action: "Profile updated", detail: `Phone changed`, icon: "bi-pencil-square", color: "#2e90fa" },
    { time: "22 Aug 16:05", action: "Card payment", detail: `KES 3,450 at Carrefour`, icon: "bi-credit-card", color: "#7a5af8" },
    { time: "21 Aug 14:10", action: "KYC verified", detail: `ID check passed`, icon: "bi-shield-check", color: "#12b76a" },
  ];
  return (
    <Drawer open onClose={onClose} icon="bi-activity" tone="blue" title="Activity timeline" subtitle={`${user.name} · full activity log`}>
      <div className="d-flex flex-column gap-2">
        {acts.map((a, i) => (
          <div key={i} className="d-flex align-items-start gap-3">
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${a.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <i className={`bi ${a.icon}`} style={{ color: a.color, fontSize: ".85rem" }} />
            </div>
            <div className="flex-grow-1">
              <div style={{ fontWeight: 700, fontSize: ".82rem" }}>{a.action}</div>
              <div style={{ fontSize: ".74rem", color: "var(--pm-muted)" }}>{a.detail}</div>
              <div style={{ fontSize: ".68rem", color: "var(--pm-muted)", marginTop: 2 }}>{a.time}</div>
            </div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 19. Risk assessment drawer ============================ */
export function RiskAssessmentModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  if (!user) return null;
  const factors = [
    { label: "Transaction velocity", score: user.riskScore > 60 ? 78 : 32, weight: 25, detail: `${user.txn30d} txns in 30d` },
    { label: "Geographic risk", score: ["Nairobi", "Mombasa"].includes(user.county) ? 45 : 28, weight: 15, detail: user.county },
    { label: "Device trust", score: 22, weight: 20, detail: user.device },
    { label: "KYC completeness", score: user.kyc === "Verified" ? 15 : 65, weight: 20, detail: user.kyc },
    { label: "Account age", score: 30, weight: 10, detail: `Joined ${user.joined}` },
    { label: "Peer comparison", score: user.riskScore > 50 ? 58 : 25, weight: 10, detail: "vs county avg" },
  ];
  return (
    <Drawer open onClose={onClose} icon="bi-shield-exclamation" tone={user.riskScore > 70 ? "red" : user.riskScore > 40 ? "amber" : "green"}
      title="Risk assessment" subtitle={`${user.name} · score ${user.riskScore}/100`}>
      <div className="pm-card pm-card-pad mb-3 text-center">
        <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "2rem", color: user.riskScore > 70 ? "#f04438" : user.riskScore > 40 ? "#f79009" : "#12b76a" }}>{user.riskScore}</div>
        <div style={{ fontSize: ".76rem", color: "var(--pm-muted)" }}>Overall risk score</div>
      </div>
      <div className="d-flex flex-column gap-2">
        {factors.map((f) => (
          <div key={f.label} className="pm-card pm-card-pad">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span style={{ fontWeight: 700, fontSize: ".82rem" }}>{f.label}</span>
              <span className="pm-num" style={{ fontWeight: 700, color: f.score > 60 ? "#f04438" : f.score > 40 ? "#f79009" : "#12b76a" }}>{f.score}</span>
            </div>
            <div style={{ height: 6, background: "#eaedf3", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${f.score}%`, height: "100%", background: f.score > 60 ? "#f04438" : f.score > 40 ? "#f79009" : "#12b76a", borderRadius: 3 }} />
            </div>
            <div className="d-flex justify-content-between mt-1" style={{ fontSize: ".7rem", color: "var(--pm-muted)" }}>
              <span>{f.detail}</span><span>Weight: {f.weight}%</span>
            </div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 20. Send message modal ============================ */
export function SendMessageModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  const { push } = useToast();
  const [channel, setChannel] = useState<"push" | "sms" | "email">("push");
  const [msg, setMsg] = useState("");
  if (!user) return null;
  const templates = [
    `Hi ${user.name.split(" ")[0]}, your account is in good standing. Thank you!`,
    `Hi ${user.name.split(" ")[0]}, we noticed unusual activity. Please verify recent transactions.`,
    `Hi ${user.name.split(" ")[0]}, a new feature is available. Update to try it.`,
  ];
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-envelope-paper" size="md" title={`Message ${user.name}`} subtitle={user.id}>
      <div className="pm-modal-body">
        <label className="form-label">Channel</label>
        <div className="d-flex gap-2 mb-3">
          {[{ v: "push" as const, l: "Push", i: "bi-phone" }, { v: "sms" as const, l: "SMS", i: "bi-chat-dots" }, { v: "email" as const, l: "Email", i: "bi-envelope" }].map((c) => (
            <button key={c.v} className={`pm-opt flex-grow-1 ${channel === c.v ? "active" : ""}`} onClick={() => setChannel(c.v)}>
              <i className={`bi ${c.i}`} /><span style={{ fontSize: ".84rem", fontWeight: 700 }}>{c.l}</span>
            </button>
          ))}
        </div>
        <label className="form-label">Message</label>
        <textarea className="form-control mb-2" rows={4} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Type your message or pick a template." />
        <div className="d-flex gap-1 flex-wrap">
          {templates.map((t, i) => (
            <button key={i} className="pm-chip" onClick={() => setMsg(t)} style={{ fontSize: ".72rem" }}>Template {i + 1}</button>
          ))}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={!msg.trim()} onClick={() => { push({ kind: "success", title: `Sent via ${channel}`, body: `Delivered to ${user.name}` }); onClose(); }}>
          <i className="bi bi-send me-1" />Send
        </button>
      </div>
    </Modal>
  );
}

/* ============================ 21. Compliance status modal ============================ */
export function ComplianceModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  if (!user) return null;
  const checks = [
    { label: "KYC Tier 1", status: user.kyc === "Verified" ? "Pass" : user.kyc === "Pending" ? "Pending" : "Fail", date: "15 Aug 2026" },
    { label: "KYC Tier 2", status: user.tier === "VIP" || user.tier === "Business" ? "Pass" : "N/A", date: "—" },
    { label: "PEP screening", status: "Clear", date: "15 Aug 2026" },
    { label: "Sanctions check", status: "Clear", date: "15 Aug 2026" },
    { label: "Adverse media", status: "No findings", date: "15 Aug 2026" },
    { label: "Source of funds", status: user.tier === "Business" ? "Verified" : "N/A", date: "—" },
  ];
  return (
    <Drawer open onClose={onClose} icon="bi-shield-check" tone="green" title="Compliance status" subtitle={`${user.name} · ${user.id}`}>
      <div className="d-flex flex-column gap-2">
        {checks.map((c) => (
          <div key={c.label} className="pm-card pm-card-pad d-flex align-items-center gap-3">
            <i className={`bi ${["Pass", "Clear", "No findings", "Verified"].includes(c.status) ? "bi-check-circle-fill" : c.status === "Pending" ? "bi-hourglass-split" : c.status === "Fail" ? "bi-x-circle-fill" : "bi-dash-circle"}`}
              style={{ color: ["Pass", "Clear", "No findings", "Verified"].includes(c.status) ? "#12b76a" : c.status === "Pending" ? "#f79009" : c.status === "Fail" ? "#f04438" : "#c3cbd9" }} />
            <div className="flex-grow-1">
              <div style={{ fontWeight: 700, fontSize: ".84rem" }}>{c.label}</div>
              <div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{c.date}</div>
            </div>
            <Badge tone={["Pass", "Clear", "No findings", "Verified"].includes(c.status) ? "green" : c.status === "Pending" ? "amber" : c.status === "Fail" ? "red" : "grey"}>{c.status}</Badge>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 22. User insights modal ============================ */
export function UserInsightsModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  if (!user) return null;
  const avgTxn = Math.round(user.volume30d / Math.max(user.txn30d, 1));
  const insights = [
    { icon: "bi-graph-up", title: "Spending pattern", detail: `Avg ${kes(avgTxn)} per txn · ${user.txn30d > 30 ? "above" : "below"} average for ${user.county}`, tone: user.txn30d > 30 ? "green" : "amber" },
    { icon: "bi-geo-alt", title: "Location", detail: `Primarily ${user.county} · ${user.channel} channel`, tone: "blue" },
    { icon: "bi-clock-history", title: "Activity", detail: `${user.lastActive === "Just now" ? "Currently active" : `Last seen ${user.lastActive}`} · Peak 08:00–12:00`, tone: "blue" },
    { icon: "bi-person-check", title: "Engagement", detail: `${user.referrals} referrals · ${user.nps !== null ? `NPS ${user.nps}` : "No NPS rating"}`, tone: user.referrals > 3 ? "green" : "blue" },
  ];
  return (
    <Drawer open onClose={onClose} icon="bi-lightbulb" tone="blue" title="User insights" subtitle={`${user.name} · behavioral analysis`}>
      <div className="d-flex flex-column gap-2">
        {insights.map((ins) => (
          <div key={ins.title} className="pm-alert-row" style={{ borderLeftColor: ins.tone === "green" ? "#12b76a" : ins.tone === "amber" ? "#f79009" : "#2e90fa" }}>
            <i className={`bi ${ins.icon}`} style={{ color: ins.tone === "green" ? "#12b76a" : ins.tone === "amber" ? "#f79009" : "#2e90fa" }} />
            <div className="flex-grow-1"><div style={{ fontWeight: 700, fontSize: ".84rem" }}>{ins.title}</div>
              <div style={{ fontSize: ".74rem", color: "var(--pm-muted)" }}>{ins.detail}</div></div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 23. User audit trail ============================ */
export function UserAuditTrailModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  if (!user) return null;
  const entries = [
    { id: "AUD-88245", time: "24 Aug 14:32", who: "Jeckonia Kwasa", action: "Profile updated", detail: "Phone changed" },
    { id: "AUD-88201", time: "22 Aug 11:15", who: "Grace Wanjiru", action: "Limits adjusted", detail: "Daily withdraw → KES 200K" },
    { id: "AUD-88156", time: "20 Aug 09:30", who: "System", action: "KYC verified", detail: "Onfido ID passed" },
    { id: "AUD-88102", time: "18 Aug 16:20", who: "Peter Njoroge", action: "VIP granted", detail: "12 months" },
    { id: "AUD-88045", time: "15 Aug 08:00", who: "System", action: "Account created", detail: "Via App" },
  ];
  return (
    <Drawer open onClose={onClose} icon="bi-clock-history" tone="blue" title="Audit trail" subtitle={`${user.name} · immutable log`}>
      <div className="d-flex flex-column gap-2">
        {entries.map((e) => (
          <div key={e.id} className="pm-alert-row info">
            <i className="bi bi-clock-history" style={{ color: "#2e90fa" }} />
            <div className="flex-grow-1">
              <div style={{ fontWeight: 700, fontSize: ".82rem" }}>{e.action}</div>
              <div style={{ fontSize: ".74rem", color: "var(--pm-muted)" }}>{e.detail}</div>
              <div className="d-flex gap-2 mt-1"><Badge tone="grey">{e.who}</Badge>
                <span style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{e.time} · {e.id}</span></div>
            </div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 24. Notification preferences ============================ */
export function NotificationConfigModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  if (!user) return null;
  const prefs = [
    { label: "Transaction alerts", on: true, ch: "Push + SMS" },
    { label: "Security alerts", on: true, ch: "Push + Email" },
    { label: "Marketing", on: false, ch: "Push" },
    { label: "Weekly summary", on: true, ch: "Email" },
    { label: "KYC reminders", on: true, ch: "Push" },
    { label: "Bill reminders", on: true, ch: "SMS" },
  ];
  return (
    <Drawer open onClose={onClose} icon="bi-bell" tone="amber" title="Notification prefs" subtitle={`${user.name} · config`}>
      <div className="d-flex flex-column gap-2">
        {prefs.map((p) => (
          <div key={p.label} className="pm-card pm-card-pad d-flex align-items-center justify-content-between">
            <div><div style={{ fontWeight: 700, fontSize: ".84rem" }}>{p.label}</div>
              <div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{p.ch}</div></div>
            <button className={`btn btn-sm ${p.on ? "btn-primary" : "btn-outline-secondary"}`}>{p.on ? "On" : "Off"}</button>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 25. Segment analysis ============================ */
export function SegmentAnalysisModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const segs = [
    { name: "High-value active", count: 12400, growth: "+8.2%", avg: 84500, risk: "Low" },
    { name: "New signups (7d)", count: 3240, growth: "+22.1%", avg: 2100, risk: "Medium" },
    { name: "At-risk dormant", count: 8900, growth: "-3.4%", avg: 150, risk: "High" },
    { name: "VIP / Business", count: 2184, growth: "+5.1%", avg: 520000, risk: "Low" },
    { name: "Loan defaulters", count: 4200, growth: "+1.8%", avg: 0, risk: "High" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-bar-chart" tone="blue" title="Segment analysis" subtitle="Growth and risk by segment">
      <div className="d-flex flex-column gap-2">
        {segs.map((s) => (
          <div key={s.name} className="pm-card pm-card-pad">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div><div style={{ fontWeight: 700, fontSize: ".88rem" }}>{s.name}</div>
                <div style={{ fontSize: ".74rem", color: "var(--pm-muted)" }}>Avg: {kes(s.avg, { compact: true })}</div></div>
              <div className="text-end"><div style={{ fontWeight: 800, fontSize: ".95rem" }}>{s.count.toLocaleString()}</div>
                <div style={{ fontSize: ".72rem", color: s.growth.startsWith("+") ? "#12b76a" : "#f04438" }}>{s.growth}</div></div>
            </div>
            <Badge tone={s.risk === "Low" ? "green" : s.risk === "Medium" ? "amber" : "red"}>{s.risk} risk</Badge>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 26. User health score ============================ */
export function UserHealthModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  if (!user) return null;
  const health = user.riskScore < 40 ? 88 : user.riskScore < 70 ? 62 : 35;
  const factors = [
    { label: "Account age", score: 75, detail: `Since ${user.joined}` },
    { label: "Txn consistency", score: user.txn30d > 20 ? 85 : user.txn30d > 10 ? 65 : 40, detail: `${user.txn30d} txns/30d` },
    { label: "KYC status", score: user.kyc === "Verified" ? 95 : user.kyc === "Pending" ? 50 : 20, detail: user.kyc },
    { label: "Balance health", score: user.balance > 50000 ? 80 : user.balance > 10000 ? 60 : 30, detail: kes(user.balance) },
    { label: "Referrals", score: Math.min(100, user.referrals * 20), detail: `${user.referrals} referrals` },
  ];
  return (
    <Drawer open onClose={onClose} icon="bi-heart-pulse" tone={health > 70 ? "green" : health > 50 ? "amber" : "red"}
      title="User health score" subtitle={`${user.name} · ${health}/100`}>
      <div className="pm-card pm-card-pad mb-3 text-center">
        <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "2.5rem", color: health > 70 ? "#12b76a" : health > 50 ? "#f79009" : "#f04438" }}>{health}</div>
        <div style={{ fontSize: ".76rem", color: "var(--pm-muted)" }}>Overall health</div>
      </div>
      <div className="d-flex flex-column gap-2">
        {factors.map((f) => (
          <div key={f.label} className="pm-card pm-card-pad">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span style={{ fontWeight: 700, fontSize: ".82rem" }}>{f.label}</span>
              <span className="pm-num" style={{ fontWeight: 700, color: f.score > 70 ? "#12b76a" : f.score > 50 ? "#f79009" : "#f04438" }}>{f.score}</span>
            </div>
            <div style={{ height: 6, background: "#eaedf3", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${f.score}%`, height: "100%", background: f.score > 70 ? "#12b76a" : f.score > 50 ? "#f79009" : "#f04438", borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: ".7rem", color: "var(--pm-muted)", marginTop: 4 }}>{f.detail}</div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 27. User devices modal ============================ */
export function UserDevicesModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  if (!user) return null;
  const devices = [
    { name: "iPhone 15 Pro", os: "iOS 18.1", lastUsed: "24 Aug 2026 14:32", trusted: true, sessions: 18 },
    { name: "Chrome / Windows 11", os: "Windows", lastUsed: "23 Aug 2026 09:15", trusted: true, sessions: 42 },
    { name: "Chrome / Android", os: "Android 14", lastUsed: "20 Aug 2026 08:45", trusted: false, sessions: 5 },
  ];
  return (
    <Drawer open onClose={onClose} icon="bi-phone" tone="blue" title="Registered devices" subtitle={`${user.name} · ${devices.length} devices`}>
      <div className="d-flex flex-column gap-2">
        {devices.map((d, i) => (
          <div key={i} className="pm-card pm-card-pad d-flex align-items-center gap-3">
            <i className="bi bi-laptop" style={{ fontSize: "1.3rem", color: d.trusted ? "#12b76a" : "#f79009" }} />
            <div className="flex-grow-1">
              <div style={{ fontWeight: 700, fontSize: ".84rem" }}>{d.name}</div>
              <div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{d.os} · {d.sessions} sessions</div>
              <div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>Last: {d.lastUsed}</div>
            </div>
            <Badge tone={d.trusted ? "green" : "amber"}>{d.trusted ? "Trusted" : "New"}</Badge>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 28. User documents modal ============================ */
export function UserDocumentsModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  if (!user) return null;
  const docs = [
    { name: "National ID", status: "Verified", date: "15 Aug 2026", expiry: "15 Aug 2031" },
    { name: "Proof of address", status: "Verified", date: "15 Aug 2026", expiry: "—" },
    { name: "KRA PIN certificate", status: user.tier === "Business" ? "Verified" : "Not required", date: "—", expiry: "—" },
    { name: "Business registration", status: user.tier === "Business" ? "Pending" : "N/A", date: "—", expiry: "—" },
  ];
  return (
    <Drawer open onClose={onClose} icon="bi-file-earmark-text" tone="blue" title="Documents" subtitle={`${user.name} · ${user.kyc} KYC`}>
      <div className="d-flex flex-column gap-2">
        {docs.map((d) => (
          <div key={d.name} className="pm-card pm-card-pad d-flex align-items-center gap-3">
            <i className="bi bi-file-earmark" style={{ fontSize: "1.2rem", color: ["Verified", "Pending"].includes(d.status) ? "#12b76a" : "#c3cbd9" }} />
            <div className="flex-grow-1">
              <div style={{ fontWeight: 700, fontSize: ".84rem" }}>{d.name}</div>
              <div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>Uploaded: {d.date} · Expires: {d.expiry}</div>
            </div>
            <Badge tone={d.status === "Verified" ? "green" : d.status === "Pending" ? "amber" : "grey"}>{d.status}</Badge>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 29. User preferences modal ============================ */
export function UserPreferencesModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  const { push } = useToast();
  if (!user) return null;
  const prefs = [
    { label: "Language", value: "English", options: ["English", "Swahili"] },
    { label: "Currency display", value: "KES", options: ["KES", "USD"] },
    { label: "Timezone", value: "EAT (UTC+3)", options: ["EAT (UTC+3)", "GMT (UTC+0)", "PST (UTC-8)"] },
    { label: "Theme", value: "Light", options: ["Light", "Dark", "System"] },
  ];
  return (
    <Drawer open onClose={onClose} icon="bi-gear" tone="blue" title="User preferences" subtitle={`${user.name} · display and locale settings`}>
      <div className="d-flex flex-column gap-3">
        {prefs.map((p) => (
          <div key={p.label}>
            <label className="form-label" style={{ fontWeight: 700 }}>{p.label}</label>
            <select className="form-select" defaultValue={p.value}>
              {p.options.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 30. User tags modal ============================ */
export function UserTagsModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  const { push } = useToast();
  if (!user) return null;
  const allTags = ["high-value", "early-adopter", "merchant", "loan-default", "card-active", "dormant-risk", "sacco-member", "diaspora", "referral-star", "power-user"];
  return (
    <Drawer open onClose={onClose} icon="bi-tags" tone="amber" title="User tags" subtitle={`${user.name} · manage tags`}>
      <label className="form-label" style={{ fontWeight: 700 }}>Current tags</label>
      <div className="d-flex gap-1 flex-wrap mb-3">
        {user.tags.map((t) => <Badge key={t} tone="blue">{t} ✕</Badge>)}
        {user.tags.length === 0 && <span style={{ fontSize: ".78rem", color: "var(--pm-muted)" }}>No tags</span>}
      </div>
      <label className="form-label" style={{ fontWeight: 700 }}>Available tags</label>
      <div className="d-flex gap-1 flex-wrap">
        {allTags.filter((t) => !user.tags.includes(t)).map((t) => (
          <button key={t} className="pm-chip" onClick={() => push({ kind: "success", title: `Tag "${t}" added` })}>{t} +</button>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 31. User communication history ============================ */
export function CommunicationHistoryModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  if (!user) return null;
  const comms = [
    { time: "24 Aug 14:00", type: "Push notification", subject: "Transaction alert", status: "Delivered" },
    { time: "23 Aug 10:30", type: "SMS", subject: "OTP for transfer", status: "Delivered" },
    { time: "22 Aug 16:45", type: "Email", subject: "Monthly statement", status: "Opened" },
    { time: "21 Aug 09:15", type: "In-app", subject: "New feature announcement", status: "Viewed" },
    { time: "20 Aug 14:00", type: "Push notification", subject: "Security alert", status: "Delivered" },
  ];
  return (
    <Drawer open onClose={onClose} icon="bi-chat-square-text" tone="blue" title="Communication history" subtitle={`${user.name} · all outbound messages`}>
      <div className="d-flex flex-column gap-2">
        {comms.map((c, i) => (
          <div key={i} className="pm-card pm-card-pad d-flex align-items-center gap-3">
            <i className={`bi ${c.type === "SMS" ? "bi-chat-dots" : c.type === "Email" ? "bi-envelope" : c.type === "Push notification" ? "bi-phone" : "bi-window"}`}
              style={{ fontSize: "1.1rem", color: "#2e90fa" }} />
            <div className="flex-grow-1">
              <div style={{ fontWeight: 700, fontSize: ".84rem" }}>{c.subject}</div>
              <div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{c.type} · {c.time}</div>
            </div>
            <Badge tone="green">{c.status}</Badge>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 32. User session management ============================ */
export function SessionManagementModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  const { push } = useToast();
  if (!user) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-box-arrow-right" tone="amber" title="Session management" subtitle={`${user.name} · active sessions`}>
      <div className="pm-note mb-3" style={{ borderColor: "#fef3cd", background: "#fffbeb", color: "#92400e" }}>
        <i className="bi bi-info-circle me-1" />Revoking a session will log the user out from that device immediately.
      </div>
      <div className="d-flex flex-column gap-2">
        <div className="pm-card pm-card-pad d-flex align-items-center gap-3">
          <i className="bi bi-phone" style={{ color: "#12b76a", fontSize: "1.2rem" }} />
          <div className="flex-grow-1"><div style={{ fontWeight: 700, fontSize: ".84rem" }}>iPhone 15 Pro</div><div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>Active now · Nairobi</div></div>
          <Badge tone="green" dot>Current</Badge>
        </div>
        <div className="pm-card pm-card-pad d-flex align-items-center gap-3">
          <i className="bi bi-laptop" style={{ color: "#667085", fontSize: "1.2rem" }} />
          <div className="flex-grow-1"><div style={{ fontWeight: 700, fontSize: ".84rem" }}>Chrome / Windows</div><div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>Last: 23 Aug 09:15</div></div>
          <button className="btn btn-sm btn-outline-danger" onClick={() => push({ kind: "success", title: "Session revoked" })}>Revoke</button>
        </div>
      </div>
    </Drawer>
  );
}

/* ============================ 33. User account recovery modal ============================ */
export function AccountRecoveryModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  const { push } = useToast();
  if (!user) return null;
  return (
    <Modal open onClose={onClose} tone="amber" icon="bi-key" size="md" title="Account recovery" subtitle={`${user.name} · ${user.id}`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Recovery email</span><span className="v">{user.email}</span></div>
          <div className="pm-kv"><span className="k">Recovery phone</span><span className="v mono">{user.phone}</span></div>
          <div className="pm-kv"><span className="k">Last password change</span><span className="v">15 Aug 2026</span></div>
          <div className="pm-kv"><span className="k">2FA status</span><span className="v"><Badge tone="green">Enabled</Badge></span></div>
        </div>
        <div className="d-flex flex-column gap-2">
          <button className="pm-dd-item"><i className="bi bi-envelope" style={{ color: "#2e90fa" }} /><span className="flex-grow-1">Send password reset email</span></button>
          <button className="pm-dd-item"><i className="bi bi-phone" style={{ color: "#12b76a" }} /><span className="flex-grow-1">Send OTP via SMS</span></button>
          <button className="pm-dd-item"><i className="bi bi-shield-lock" style={{ color: "#7a5af8" }} /><span className="flex-grow-1">Reset 2FA</span></button>
          <button className="pm-dd-item danger"><i className="bi bi-x-octagon" style={{ color: "#d92d20" }} /><span className="flex-grow-1">Force logout all sessions</span></button>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-primary btn-sm" onClick={onClose}>Done</button>
      </div>
    </Modal>
  );
}

/* ============================ 34. User loan details modal ============================ */
export function LoanDetailsModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  if (!user) return null;
  const loans = user.loans > 0 ? [
    { id: "LN-4421", amount: 50000, outstanding: 32000, rate: 14, nextPayment: "01 Sep 2026", status: "Current" },
    { id: "LN-4380", amount: 25000, outstanding: 0, rate: 14, nextPayment: "—", status: "Paid off" },
  ] : [];
  return (
    <Drawer open onClose={onClose} icon="bi-cash-stack" tone="blue" title="Loan details" subtitle={`${user.name} · ${user.loans} loan(s)`}>
      {loans.length === 0 ? (
        <div className="pm-empty"><i className="bi bi-check-circle" /><div style={{ fontWeight: 700 }}>No active loans</div></div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {loans.map((l) => (
            <div key={l.id} className="pm-card pm-card-pad">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span style={{ fontWeight: 700, fontSize: ".84rem" }}>{l.id}</span>
                <Badge tone={l.status === "Current" ? "green" : "grey"}>{l.status}</Badge>
              </div>
              <div className="pm-kv"><span className="k">Principal</span><span className="v pm-num">{kes(l.amount)}</span></div>
              <div className="pm-kv"><span className="k">Outstanding</span><span className="v pm-num" style={{ fontWeight: 700 }}>{kes(l.outstanding)}</span></div>
              <div className="pm-kv"><span className="k">Rate</span><span className="v">{l.rate}% p.a.</span></div>
              <div className="pm-kv"><span className="k">Next payment</span><span className="v">{l.nextPayment}</span></div>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  );
}

/* ============================ 35. User card management modal ============================ */
export function CardManagementModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  const { push } = useToast();
  if (!user) return null;
  const cards = [
    { last4: "4892", type: "Visa", expiry: "09/28", status: "Active", dailyLimit: 150000 },
    { last4: "7234", type: "Mastercard", expiry: "03/27", status: "Frozen", dailyLimit: 0 },
  ];
  return (
    <Drawer open onClose={onClose} icon="bi-credit-card" tone="blue" title="Card management" subtitle={`${user.name} · ${user.cards} card(s)`}>
      <div className="d-flex flex-column gap-2">
        {cards.map((c) => (
          <div key={c.last4} className="pm-card pm-card-pad">
            <div className="d-flex align-items-center gap-3 mb-2">
              <div style={{ width: 48, height: 32, borderRadius: 6, background: c.status === "Active" ? "linear-gradient(135deg, #12b76a, #05603a)" : "linear-gradient(135deg, #667085, #344054)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: ".7rem" }}>{c.type}</div>
              <div className="flex-grow-1"><div style={{ fontWeight: 700, fontSize: ".84rem" }}>•••• {c.last4}</div><div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>Expires {c.expiry}</div></div>
              <Badge tone={c.status === "Active" ? "green" : "blue"}>{c.status}</Badge>
            </div>
            {c.status === "Active" && <div className="pm-kv"><span className="k">Daily limit</span><span className="v pm-num">{kes(c.dailyLimit)}</span></div>}
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 36. User geographic distribution ============================ */
export function GeoDistributionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const counties = [
    { name: "Nairobi", count: 45200, pct: 30.5 },
    { name: "Mombasa", count: 18400, pct: 12.4 },
    { name: "Kisumu", count: 12800, pct: 8.6 },
    { name: "Nakuru", count: 11200, pct: 7.5 },
    { name: "Kiambu", count: 9800, pct: 6.6 },
    { name: "Uasin Gishu", count: 8400, pct: 5.7 },
    { name: "Machakos", count: 7200, pct: 4.9 },
    { name: "Other", count: 35392, pct: 23.8 },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-geo-alt" tone="blue" title="Geographic distribution" subtitle="User distribution by county">
      <div className="d-flex flex-column gap-2">
        {counties.map((c) => (
          <div key={c.name} className="pm-card pm-card-pad d-flex align-items-center gap-3">
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between mb-1">
                <span style={{ fontWeight: 700, fontSize: ".84rem" }}>{c.name}</span>
                <span className="pm-num" style={{ fontWeight: 700 }}>{c.count.toLocaleString()}</span>
              </div>
              <div style={{ height: 6, background: "#eaedf3", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${c.pct}%`, height: "100%", background: "#2e90fa", borderRadius: 3 }} />
              </div>
              <div style={{ fontSize: ".7rem", color: "var(--pm-muted)", marginTop: 2 }}>{c.pct}%</div>
            </div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 37. User referral network modal ============================ */
export function ReferralNetworkModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  if (!user) return null;
  const referrals = user.referrals > 0 ? [
    { name: "Mary Wanjiku", joined: "12 Aug 2026", status: "Active", earned: 500 },
    { name: "John Kipchoge", joined: "05 Aug 2026", status: "Active", earned: 500 },
    { name: "Amina Hassan", joined: "28 Jul 2026", status: "Dormant", earned: 0 },
  ].slice(0, user.referrals) : [];
  return (
    <Drawer open onClose={onClose} icon="bi-diagram-3" tone="green" title="Referral network" subtitle={`${user.name} · ${user.referrals} referral(s)`}>
      {referrals.length === 0 ? (
        <div className="pm-empty"><i className="bi bi-people" /><div style={{ fontWeight: 700 }}>No referrals yet</div></div>
      ) : (
        <>
          <div className="pm-card pm-card-pad mb-3 text-center">
            <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1.5rem" }}>{kes(referrals.reduce((a, r) => a + r.earned, 0))}</div>
            <div style={{ fontSize: ".76rem", color: "var(--pm-muted)" }}>Total earned from referrals</div>
          </div>
          <div className="d-flex flex-column gap-2">
            {referrals.map((r, i) => (
              <div key={i} className="pm-card pm-card-pad d-flex align-items-center gap-3">
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#e7f8ef", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="bi bi-person" style={{ color: "#12b76a" }} />
                </div>
                <div className="flex-grow-1">
                  <div style={{ fontWeight: 700, fontSize: ".84rem" }}>{r.name}</div>
                  <div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>Joined {r.joined} · Earned {kes(r.earned)}</div>
                </div>
                <Badge tone={r.status === "Active" ? "green" : "grey"}>{r.status}</Badge>
              </div>
            ))}
          </div>
        </>
      )}
    </Drawer>
  );
}

/* ============================ 38. User activity heatmap ============================ */
export function ActivityHeatmapModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  if (!user) return null;
  const hours = Array.from({ length: 24 }, (_, i) => ({ hour: i, activity: Math.round(10 + Math.random() * 90 * (i >= 8 && i <= 20 ? 1 : 0.2)) }));
  return (
    <Drawer open onClose={onClose} icon="bi-grid-3x3" tone="blue" title="Activity heatmap" subtitle={`${user.name} · hourly activity pattern`}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-card-head"><h6 className="pm-card-title">Hourly activity (last 30 days)</h6></div>
        <div className="p-3">
          <div className="d-flex gap-1 flex-wrap">
            {hours.map((h) => (
              <div key={h.hour} title={`${h.hour}:00 — ${h.activity}% activity`} style={{ width: 28, height: 28, borderRadius: 4, background: `rgba(46,144,250,${h.activity / 100})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".6rem", color: h.activity > 50 ? "#fff" : "var(--pm-muted)" }}>
                {h.hour}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="pm-note"><i className="bi bi-info-circle me-1" />Peak hours: 08:00–12:00 and 18:00–21:00. Lowest: 02:00–06:00.</div>
    </Drawer>
  );
}
