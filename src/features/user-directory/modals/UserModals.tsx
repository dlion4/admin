import { useState } from "react";
import { Modal, Drawer, Steps, Badge, TwoFactorField, useToast } from "../../../components/ui";
import { jsonDownload, kes, num, initials, avatarColor } from "../../../lib/format";
import type { User, SavedView, Tier, KycStatus, AccountStatus, ColumnDef } from "../data/userData";
import { COLUMNS } from "../data/userData";

const tierTone = (t: Tier) => t === "VIP" ? "violet" : t === "Business" ? "blue" : t === "Agent" ? "amber" : "grey";
const kycTone = (k: KycStatus) => k === "Verified" ? "green" : k === "Pending" ? "amber" : k === "Rejected" ? "red" : k === "Expired" ? "grey" : "blue";
const statusTone = (s: AccountStatus) => s === "Active" ? "green" : s === "Frozen" ? "blue" : s === "Dormant" ? "grey" : s === "Suspended" ? "amber" : "red";

/* ============================ 1. User detail drawer ============================ */
export function UserDrawer({ user, onClose, onFreeze, onEdit, onAdjustLimits, onGrantVip, onImpersonate }: {
  user: User | null; onClose: () => void; onFreeze: (u: User) => void; onEdit: (u: User) => void;
  onAdjustLimits: (u: User) => void; onGrantVip: (u: User) => void; onImpersonate: (u: User) => void;
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
          <button className="pm-dd-item" onClick={() => push({ kind: "info", title: "Login history", body: `${user.name} has 23 sessions in the last 30 days from 2 devices.` })}><i className="bi bi-clock-history" style={{ color: "#667085" }} /><span className="flex-grow-1">View login history</span></button>
          <button className="pm-dd-item" onClick={() => push({ kind: "info", title: "Transaction history", body: `${user.txn30d} transactions totalling ${kes(user.volume30d, { compact: true })} in the last 30 days.` })}><i className="bi bi-journal-text" style={{ color: "#667085" }} /><span className="flex-grow-1">View transactions</span></button>
          <div style={{ height: 1, background: "var(--pm-border)", margin: ".2rem .3rem" }} />
          <button className="pm-dd-item danger" onClick={() => push({ kind: "warn", title: "Close account flow", body: "Account closure requires Compliance Officer co-approval and a 30-day cooling period." })}><i className="bi bi-x-octagon" style={{ color: "#d92d20" }} /><span className="flex-grow-1">Close account</span><Badge tone="red">2FA + compliance</Badge></button>
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
          const v: SavedView = { id: `sv-${Date.now()}`, name, filters: currentFilters, count: Math.floor(Math.random() * 5000), owner: "Joseph Mwangi", shared };
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
