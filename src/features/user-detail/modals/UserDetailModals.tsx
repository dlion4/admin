import { useState } from "react";
import { Modal, Drawer, Steps, Badge, Avatar, TwoFactorField, useToast } from "../../../components/ui";
import { jsonDownload, kes, num } from "../../../lib/format";
import type { CardRec, DeviceRec, FeaturedUser, LoanRec, LoginRec, TxnRec } from "../data/userDetailData";

/* ============================ 1. Edit profile modal ============================ */
export function EditProfileModal({ user, onClose, onSaved }: { user: FeaturedUser | null; onClose: () => void; onSaved: (u: FeaturedUser) => void }) {
  const { push } = useToast();
  const [draft, setDraft] = useState<FeaturedUser | null>(null);
  if (!user && !draft) return null;
  const u = draft ?? user!;
  const d = draft ?? u;
  return (
    <Modal open onClose={() => { setDraft(null); onClose(); }} tone="blue" icon="bi-pencil-square" size="lg"
      title={`Edit profile — ${u.name}`} subtitle="Changes are written to the audit log with your identity.">
      <div className="pm-modal-body">
        <div className="row g-2">
          <div className="col-md-6"><label className="form-label">Full name</label><input className="form-control" value={d.name} onChange={(e) => setDraft({ ...d, name: e.target.value })} /></div>
          <div className="col-md-6"><label className="form-label">Email</label><input className="form-control" value={d.email} onChange={(e) => setDraft({ ...d, email: e.target.value })} /></div>
          <div className="col-md-6"><label className="form-label">Phone</label><input className="form-control" value={d.phone} onChange={(e) => setDraft({ ...d, phone: e.target.value })} /></div>
          <div className="col-md-6"><label className="form-label">County</label><input className="form-control" value={d.county} onChange={(e) => setDraft({ ...d, county: e.target.value })} /></div>
          <div className="col-md-4"><label className="form-label">Occupation</label><input className="form-control" value={d.occupation} onChange={(e) => setDraft({ ...d, occupation: e.target.value })} /></div>
          <div className="col-md-4"><label className="form-label">Relationship manager</label>
            <select className="form-select" value={d.rm} onChange={(e) => setDraft({ ...d, rm: e.target.value })}>
              {["Grace Wanjiru", "Peter Njoroge", "Faith Chebet", "Dennis Otieno", "Unassigned"].map((r) => <option key={r}>{r}</option>)}
            </select></div>
          <div className="col-md-4"><label className="form-label">Tier</label>
            <select className="form-select" value={d.tier} onChange={(e) => setDraft({ ...d, tier: e.target.value as FeaturedUser["tier"] })}>
              {["Basic", "Verified", "VIP", "Business", "Agent"].map((t) => <option key={t}>{t}</option>)}
            </select></div>
          <div className="col-12"><label className="form-label">Tags (comma-separated)</label>
            <input className="form-control" value={d.tags.join(", ")} onChange={(e) => setDraft({ ...d, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} /></div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => { setDraft(null); onClose(); }}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => { onSaved(d); setDraft(null); push({ kind: "success", title: "Profile updated", body: `${d.id} · AUD-88310 logged.` }); onClose(); }}>
          <i className="bi bi-check2 me-1" />Save changes
        </button>
      </div>
    </Modal>
  );
}

/* ============================ 2. Freeze / unfreeze wizard ============================ */
const FREEZE_REASONS = [
  { id: "fraud", label: "Suspected fraud", icon: "bi-shield-exclamation" },
  { id: "ato", label: "Account takeover", icon: "bi-person-lock" },
  { id: "aml", label: "AML / sanctions hit", icon: "bi-globe-americas" },
  { id: "court", label: "Court / regulator order", icon: "bi-bank" },
  { id: "customer", label: "Customer request", icon: "bi-telephone-x" },
];
export function FreezeWizard({ user, onClose, onDone }: { user: FeaturedUser | null; onClose: () => void; onDone: (u: FeaturedUser, action: "frozen" | "unfrozen") => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [reason, setReason] = useState("fraud");
  const [note, setNote] = useState("");
  const [scope, setScope] = useState({ withdrawals: true, transfers: true, cards: true, logins: false });
  const [code, setCode] = useState("");
  const unfreeze = user?.status === "Frozen";
  const steps = unfreeze
    ? [{ label: "Confirm", icon: "bi-unlock" }, { label: "2FA", icon: "bi-shield-lock" }]
    : [{ label: "Reason", icon: "bi-chat-left-text" }, { label: "Scope", icon: "bi-crosshair" }, { label: "2FA", icon: "bi-shield-lock" }, { label: "Confirm", icon: "bi-check2" }];
  const close = () => { setStep(0); setNote(""); setCode(""); onClose(); };
  if (!user) return null;
  const canNext = unfreeze ? (step === 0 ? true : code === "482913") : (step === 0 ? note.trim().length >= 10 : step === 2 ? code === "482913" : true);
  return (
    <Modal open onClose={close} tone={unfreeze ? "green" : "blue"} icon={unfreeze ? "bi-unlock" : "bi-snow"} size="md"
      title={unfreeze ? `Unfreeze ${user.name}?` : `Freeze ${user.name}`} subtitle={`${user.id} · ${user.phone} · balance ${kes(user.balance)}`}>
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {unfreeze && step === 0 && (
          <div className="pm-note" style={{ borderColor: "#b7e6cf", background: "#e7f8ef", color: "#05603a" }}>
            <i className="bi bi-unlock me-1" />Unfreezing restores all money-movement capability and lifts card suspensions. Make sure the investigation is closed.
          </div>
        )}
        {!unfreeze && step === 0 && (
          <>
            <div className="d-flex flex-column gap-2 mb-3">
              {FREEZE_REASONS.map((x) => (
                <button key={x.id} className={`pm-opt ${reason === x.id ? "active" : ""}`} onClick={() => setReason(x.id)}>
                  <span className="r" /><i className={`bi ${x.icon}`} style={{ color: "var(--pm-blue)" }} /><span style={{ fontWeight: 700, fontSize: ".85rem" }}>{x.label}</span>
                </button>
              ))}
            </div>
            <label className="form-label">Investigator note (min 10 chars)</label>
            <textarea className="form-control" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Evidence, ticket reference, escalation path…" />
          </>
        )}
        {!unfreeze && step === 1 && (
          <div className="d-flex flex-column gap-2">
            {[["withdrawals", "Block withdrawals"], ["transfers", "Block transfers"], ["cards", "Suspend linked cards"], ["logins", "Block new logins"]].map(([k, l]) => (
              <label key={k} className={`pm-opt ${scope[k as keyof typeof scope] ? "active" : ""}`}>
                <input type="checkbox" className="form-check-input mt-0" checked={scope[k as keyof typeof scope]} onChange={(e) => setScope({ ...scope, [k]: e.target.checked })} />
                <span style={{ fontWeight: 700, fontSize: ".85rem" }}>{l}</span>
              </label>
            ))}
          </div>
        )}
        {((unfreeze && step === 1) || (!unfreeze && step === 2)) && <TwoFactorField value={code} onChange={setCode} />}
        {!unfreeze && step === 3 && (
          <div className="pm-card pm-card-pad">
            <div className="pm-kv"><span className="k">Account</span><span className="v">{user.name} · {user.id}</span></div>
            <div className="pm-kv"><span className="k">Balance held</span><span className="v">{kes(user.balance)}</span></div>
            <div className="pm-kv"><span className="k">Reason</span><span className="v">{FREEZE_REASONS.find((x) => x.id === reason)?.label}</span></div>
            <div className="pm-kv"><span className="k">Scope</span><span className="v">{Object.entries(scope).filter(([, v]) => v).map(([k]) => k).join(", ")}</span></div>
            <div className="pm-kv"><span className="k">Customer notified</span><span className="v">Yes — SMS + push</span></div>
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}><i className="bi bi-arrow-left me-1" />Back</button>}
        {step < steps.length - 1 && <button className="btn btn-primary btn-sm" disabled={!canNext} onClick={() => setStep(step + 1)}>Next<i className="bi bi-arrow-right ms-1" /></button>}
        {step === steps.length - 1 && <button className="btn btn-primary btn-sm" disabled={!canNext} onClick={() => {
          onDone(user, unfreeze ? "unfrozen" : "frozen");
          push({ kind: "success", title: `${user.name} ${unfreeze ? "unfrozen" : "frozen"}`, body: `${user.id} · ${unfreeze ? "FRZ-2026-0912 released" : "FRZ-2026-0913 created"}.` });
          close();
        }}><i className={`bi ${unfreeze ? "bi-unlock" : "bi-snow"} me-1`} />{unfreeze ? "Unfreeze account" : "Freeze account"}</button>}
      </div>
    </Modal>
  );
}

/* ============================ 3. Close account wizard ============================ */
export function CloseAccountWizard({ user, onClose, onDone }: { user: FeaturedUser | null; onClose: () => void; onDone: (u: FeaturedUser) => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [reason, setReason] = useState("customer");
  const [sweep, setSweep] = useState(true);
  const [cooling, setCooling] = useState("30");
  const [code, setCode] = useState("");
  const steps = [{ label: "Reason", icon: "bi-chat-left-text" }, { label: "Impact", icon: "bi-exclamation-triangle" }, { label: "Approvals", icon: "bi-person-check" }, { label: "2FA", icon: "bi-shield-lock" }, { label: "Confirm", icon: "bi-check2" }];
  const close = () => { setStep(0); setCode(""); onClose(); };
  if (!user) return null;
  const canNext = step === 3 ? code === "482913" : true;
  return (
    <Modal open onClose={close} tone="red" icon="bi-x-octagon" size="lg"
      title={`Close account — ${user.name}`} subtitle={`${user.id} · Destructive · requires Compliance co-approval`}>
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%`, background: "#f04438" }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div className="d-flex flex-column gap-2">
            {[{ id: "customer", l: "Customer requested closure", d: "Signed closure request or verified phone confirmation" },
              { id: "fraud", l: "Fraud — permanent ban", d: "Confirmed criminal activity; no re-registration" },
              { id: "aml", l: "AML / de-risking", d: "Sanctions or high-risk jurisdiction" },
              { id: "court", l: "Court / regulator order", d: "Legal instruction to close" },
              { id: "inactivity", l: "Long-term inactivity", d: "Dormant 365+ days with residual balance" }].map((x) => (
              <button key={x.id} className={`pm-opt ${reason === x.id ? "active" : ""}`} onClick={() => setReason(x.id)}>
                <span className="r" /><span className="flex-grow-1">
                  <span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>{x.l}</span>
                  <span className="d-block" style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>{x.d}</span></span>
              </button>
            ))}
          </div>
        )}
        {step === 1 && (
          <>
            <div className="pm-note mb-3" style={{ borderColor: "#fbd3cf", background: "#fef2f2", color: "#b42318" }}>
              <i className="bi bi-exclamation-octagon me-1" />Closing permanently deletes login credentials, revokes all cards and terminates active mandates. The audit trail and ledger history are retained for 7 years.
            </div>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-kv"><span className="k">Residual balance to sweep</span><span className="v">{kes(user.balance)}</span></div>
              <div className="pm-kv"><span className="k">Open loans</span><span className="v">{user.risk > 80 ? "KES 214,500 — must settle first" : "None"}</span></div>
              <div className="pm-kv"><span className="k">Active cards</span><span className="v">2 — will be terminated</span></div>
              <div className="pm-kv"><span className="k">Standing orders</span><span className="v">3 — will be cancelled</span></div>
              <div className="pm-kv"><span className="k">Referral credits</span><span className="v">Forfeited on closure</span></div>
            </div>
            <label className="pm-opt mb-2">
              <input type="checkbox" className="form-check-input mt-0" checked={sweep} onChange={(e) => setSweep(e.target.checked)} />
              <span style={{ fontWeight: 700, fontSize: ".85rem" }}>Sweep residual balance back to the registered M-Pesa number</span>
            </label>
            <label className="form-label">Cooling-off period</label>
            <div className="d-flex gap-1">
              {[["7", "7 days"], ["30", "30 days"], ["0", "None (customer confirmed twice)"]].map(([v, l]) => (
                <button key={v} className={`pm-chip ${cooling === v ? "active" : ""}`} onClick={() => setCooling(v)}>{l}</button>
              ))}
            </div>
          </>
        )}
        {step === 2 && (
          <div className="d-flex flex-column gap-2">
            {[["Compliance Officer (David Kiplagat)", "Mandatory co-approval before closure", true],
              ["CFO (Sarah Kamau)", "Required because balance exceeds KES 100,000", user.balance > 100_000],
              ["Fraud team", "Only for fraud/AML reasons", reason === "fraud" || reason === "aml"]].filter(([, , req]) => req).map(([l, d]) => (
              <div key={l as string} className="pm-opt active">
                <i className="bi bi-send" style={{ color: "#7a5af8" }} />
                <span className="flex-grow-1"><span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>{l}</span>
                  <span className="d-block" style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>{d}</span></span>
                <Badge tone="blue">Notification queued</Badge>
              </div>
            ))}
          </div>
        )}
        {step === 3 && <TwoFactorField value={code} onChange={setCode} />}
        {step === 4 && (
          <div className="pm-card pm-card-pad">
            <div className="pm-kv"><span className="k">Account</span><span className="v">{user.name} · {user.id}</span></div>
            <div className="pm-kv"><span className="k">Reason</span><span className="v">{reason}</span></div>
            <div className="pm-kv"><span className="k">Sweep</span><span className="v">{sweep ? `KES ${num(user.balance)} to ${user.phone}` : "None — balance forfeited"}</span></div>
            <div className="pm-kv"><span className="k">Cooling-off</span><span className="v">{cooling === "0" ? "None" : `${cooling} days`}</span></div>
            <div className="pm-kv"><span className="k">Closed by</span><span className="v">Joseph Mwangi (Tier 0) + co-approval</span></div>
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}><i className="bi bi-arrow-left me-1" />Back</button>}
        {step < 4 && <button className="btn btn-danger btn-sm" disabled={!canNext} onClick={() => setStep(step + 1)}>Next<i className="bi bi-arrow-right ms-1" /></button>}
        {step === 4 && <button className="btn btn-danger btn-sm" disabled={code !== "482913"} onClick={() => {
          onDone(user);
          push({ kind: "warn", title: `Closure requested for ${user.name}`, body: `CLS-2026-0044 queued · ${cooling === "0" ? "immediate" : cooling + "-day cooling"} · co-approvals paged.` });
          close();
        }}><i className="bi bi-x-octagon me-1" />Request closure</button>}
      </div>
    </Modal>
  );
}

/* ============================ 4. Adjust limits wizard ============================ */
export function LimitsWizard({ user, limits, onClose, onDone }: {
  user: FeaturedUser | null; limits: { key: string; label: string; current: number; tierDefault: number; cbkCeiling: number }[];
  onClose: () => void; onDone: (v: Record<string, number>, preset: string) => void;
}) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [preset, setPreset] = useState("custom");
  const [vals, setVals] = useState<Record<string, number>>(Object.fromEntries(limits.map((l) => [l.key, l.current])));
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  const steps = [{ label: "Preset", icon: "bi-sliders" }, { label: "Values", icon: "bi-pencil" }, { label: "Reason", icon: "bi-chat-left-text" }, { label: "2FA", icon: "bi-shield-lock" }];
  const close = () => { setStep(0); setCode(""); setReason(""); onClose(); };
  if (!user) return null;
  const applyPreset = (p: string) => {
    setPreset(p);
    const m = p === "vip" ? { dailyWithdraw: 500_000, dailyTransfer: 1_000_000, monthlyVolume: 10_000_000, singleTx: 500_000 }
      : p === "business" ? { dailyWithdraw: 1_000_000, dailyTransfer: 2_000_000, monthlyVolume: 20_000_000, singleTx: 500_000 }
      : p === "tight" ? { dailyWithdraw: 50_000, dailyTransfer: 100_000, monthlyVolume: 500_000, singleTx: 100_000 }
      : { dailyWithdraw: 150_000, dailyTransfer: 300_000, monthlyVolume: 1_500_000, singleTx: 250_000 };
    setVals(m);
  };
  const overCeiling = limits.some((l) => vals[l.key] > l.cbkCeiling);
  return (
    <Modal open onClose={close} tone="violet" icon="bi-sliders2" size="lg"
      title={`Adjust limits — ${user.name}`} subtitle={`${user.id} · tier ${user.tier} · CBK ceilings enforced`}>
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%`, background: "#7a5af8" }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div className="d-flex flex-column gap-2">
            {[{ id: "tier", l: "Tier default", d: `${user.tier} standard ceilings` }, { id: "vip", l: "VIP preset", d: "KES 500K daily · KES 10M monthly" },
              { id: "business", l: "Business preset", d: "KES 1M daily · KES 20M monthly" }, { id: "tight", l: "Risk-reduction preset", d: "KES 50K daily · tight single-tx cap" },
              { id: "custom", l: "Custom", d: "Set each limit manually" }].map((p) => (
              <button key={p.id} className={`pm-opt ${preset === p.id ? "active" : ""}`} onClick={() => { if (p.id !== "custom") applyPreset(p.id); else setPreset(p.id); }}>
                <span className="r" /><span className="flex-grow-1">
                  <span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>{p.l}</span>
                  <span className="d-block" style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>{p.d}</span></span>
              </button>
            ))}
          </div>
        )}
        {step === 1 && (
          <>
            <div className="pm-card pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Limit</th><th style={{ width: 170 }}>New value (KES)</th><th className="text-end">Tier default</th><th className="text-end">CBK ceiling</th></tr></thead>
                <tbody>
                  {limits.map((l) => (
                    <tr key={l.key}>
                      <td className="pm-td-strong">{l.label}</td>
                      <td><input type="number" className={`form-control form-control-sm mono ${vals[l.key] > l.cbkCeiling ? "is-invalid" : ""}`}
                        value={vals[l.key]} onChange={(e) => setVals({ ...vals, [l.key]: Number(e.target.value) })} /></td>
                      <td className="text-end pm-num">{kes(l.tierDefault, { compact: true })}</td>
                      <td className="text-end pm-num">{kes(l.cbkCeiling, { compact: true })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {overCeiling && <div className="pm-note mt-2" style={{ borderColor: "#fbd3cf", background: "#fef2f2", color: "#b42318" }}>
              <i className="bi bi-exclamation-octagon me-1" />A value exceeds the CBK ceiling for a licensed PSP — the change cannot be published.</div>}
          </>
        )}
        {step === 2 && (
          <>
            <label className="form-label">Reason (min 5 chars)</label>
            <textarea className="form-control mb-2" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. VIP merchant onboarding — higher ceilings for payroll." />
            <div className="d-flex gap-1 flex-wrap">
              {["VIP upgrade", "Merchant payroll", "Temporary for event", "Risk reduction", "CBK instruction"].map((x) => (
                <button key={x} className="pm-chip" onClick={() => setReason(x + ".")}>{x}</button>
              ))}
            </div>
          </>
        )}
        {step === 3 && <TwoFactorField value={code} onChange={setCode} />}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}><i className="bi bi-arrow-left me-1" />Back</button>}
        {step < 3 && <button className="btn btn-primary btn-sm"
          disabled={(step === 1 && overCeiling) || (step === 2 && reason.trim().length < 5)} onClick={() => setStep(step + 1)}>Next<i className="bi bi-arrow-right ms-1" /></button>}
        {step === 3 && <button className="btn btn-primary btn-sm" disabled={code !== "482913" || overCeiling} onClick={() => {
          onDone(vals, preset);
          push({ kind: "success", title: "Limits updated", body: `${user.name} · ${preset} preset applied · AUD-88312 logged.` }); close();
        }}><i className="bi bi-check2 me-1" />Apply limits</button>}
      </div>
    </Modal>
  );
}

/* ============================ 5. Tier change wizard ============================ */
export function TierChangeWizard({ user, onClose, onDone }: { user: FeaturedUser | null; onClose: () => void; onDone: (u: FeaturedUser, tier: string) => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [tier, setTier] = useState("Verified");
  const [code, setCode] = useState("");
  const steps = [{ label: "Target tier", icon: "bi-arrow-up-circle" }, { label: "Eligibility", icon: "bi-check2-square" }, { label: "2FA", icon: "bi-shield-lock" }];
  const close = () => { setStep(0); setCode(""); onClose(); };
  if (!user) return null;
  const eligibility = [
    { ok: user.kyc === "Verified", l: "KYC fully verified" },
    { ok: user.status === "Active", l: "Account in good standing" },
    { ok: user.risk < 70, l: "Risk score below 70" },
    { ok: user.balance > 10_000, l: "30-day volume ≥ KES 50K" },
  ];
  const eligible = eligibility.every((e) => e.ok);
  return (
    <Modal open onClose={close} tone="violet" icon="bi-arrow-up-circle" size="md"
      title={`Change tier — ${user.name}`} subtitle={`${user.id} · currently ${user.tier}`}>
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%`, background: "#7a5af8" }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div className="d-flex flex-column gap-2">
            {["Basic", "Verified", "VIP", "Business", "Agent"].map((t) => (
              <button key={t} className={`pm-opt ${tier === t ? "active" : ""} ${t === user.tier ? "opacity-50" : ""}`} disabled={t === user.tier} onClick={() => setTier(t)}>
                <span className="r" />
                <span className="flex-grow-1"><span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>{t}</span>
                  <span className="d-block" style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>
                    {t === "Basic" ? "KYC tier 1 · USSD + app" : t === "Verified" ? "KYC tier 2 · full app + cards" : t === "VIP" ? "Concierge + fee exemptions" : t === "Business" ? "SME tools · API · high ceilings" : "Agent network access"}
                  </span></span>
                {t === user.tier && <Badge tone="grey">Current</Badge>}
              </button>
            ))}
          </div>
        )}
        {step === 1 && (
          <div className="d-flex flex-column gap-2">
            {eligibility.map((e) => (
              <div key={e.l} className="d-flex align-items-center gap-2 p-2" style={{ border: "1px solid var(--pm-border)", borderRadius: 10 }}>
                <i className={`bi ${e.ok ? "bi-check-circle-fill" : "bi-x-circle-fill"}`} style={{ color: e.ok ? "#12b76a" : "#f04438" }} />
                <span style={{ fontSize: ".84rem", fontWeight: 600 }}>{e.l}</span>
                <Badge tone={e.ok ? "green" : "red"} className="ms-auto">{e.ok ? "Pass" : "Fail"}</Badge>
              </div>
            ))}
            {!eligible && <div className="pm-note" style={{ borderColor: "#fbd3cf", background: "#fef2f2", color: "#b42318" }}>
              <i className="bi bi-exclamation-octagon me-1" />Eligibility is not met. You may still override as Super Admin — the override is flagged for the monthly tier audit.</div>}
          </div>
        )}
        {step === 2 && <TwoFactorField value={code} onChange={setCode} />}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}><i className="bi bi-arrow-left me-1" />Back</button>}
        {step < 2 && <button className="btn btn-primary btn-sm" disabled={tier === user.tier} onClick={() => setStep(step + 1)}>Next<i className="bi bi-arrow-right ms-1" /></button>}
        {step === 2 && <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => {
          onDone(user, tier);
          push({ kind: "success", title: `Tier changed to ${tier}`, body: `${user.name} · limits and fee schedule updated immediately.` }); close();
        }}><i className="bi bi-check2 me-1" />Change tier</button>}
      </div>
    </Modal>
  );
}

/* ============================ 6. Grant / revoke VIP ============================ */
export function VipModal({ user, onClose, onDone }: { user: FeaturedUser | null; onClose: () => void; onDone: (u: FeaturedUser, grant: boolean) => void }) {
  const { push } = useToast();
  const [duration, setDuration] = useState("12");
  const [feeExempt, setFeeExempt] = useState(true);
  const revoke = user?.tier === "VIP";
  if (!user) return null;
  return (
    <Modal open onClose={onClose} tone={revoke ? "red" : "violet"} icon="bi-gem" size="sm"
      title={revoke ? `Revoke VIP — ${user.name}` : `Grant VIP — ${user.name}`} subtitle={`${user.id} · current tier ${user.tier}`}>
      <div className="pm-modal-body">
        {!revoke && (
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
        {revoke && <div className="pm-note" style={{ borderColor: "#fbd3cf", background: "#fef2f2", color: "#b42318" }}>
          <i className="bi bi-exclamation-triangle me-1" />Revoking VIP removes concierge access, fee exemptions and the KES 500K daily ceiling. The customer is notified by SMS.</div>}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className={`btn ${revoke ? "btn-danger" : "btn-primary"} btn-sm`} onClick={() => {
          onDone(user, !revoke);
          push({ kind: "success", title: revoke ? "VIP revoked" : `VIP granted for ${duration} months`, body: `${user.name} · fee schedule ${revoke ? "restored" : feeExempt ? "exempted" : "unchanged"}.` });
          onClose();
        }}><i className={`bi ${revoke ? "bi-x-circle" : "bi-gem"} me-1`} />{revoke ? "Revoke VIP" : "Grant VIP"}</button>
      </div>
    </Modal>
  );
}

/* ============================ 7. Impersonate modal ============================ */
export function ImpersonateModal({ user, onClose }: { user: FeaturedUser | null; onClose: () => void }) {
  const { push } = useToast();
  const [code, setCode] = useState("");
  const [ack, setAck] = useState(false);
  if (!user) return null;
  return (
    <Modal open onClose={onClose} tone="red" icon="bi-incognito" size="sm"
      title={`Impersonate ${user.name}?`} subtitle={`${user.id} · Super Admin only · every action watermarked`}>
      <div className="pm-modal-body">
        <div className="pm-note mb-3" style={{ borderColor: "#fbd3cf", background: "#fef2f2", color: "#b42318" }}>
          <i className="bi bi-exclamation-octagon me-1" />You will see the app exactly as the customer does. Impersonation is capped at 15 minutes and streamed to the security channel.
        </div>
        <label className="pm-opt mb-3">
          <input type="checkbox" className="form-check-input mt-0" checked={ack} onChange={(e) => setAck(e.target.checked)} />
          <span style={{ fontWeight: 700, fontSize: ".84rem" }}>I confirm I am troubleshooting a customer issue and accept the data-handling policy</span>
        </label>
        <TwoFactorField value={code} onChange={setCode} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger btn-sm" disabled={code !== "482913" || !ack} onClick={() => {
          push({ kind: "warn", title: `Impersonating ${user.name}`, body: `IMP-2026-0042 · auto-expires in 15 minutes.` }); onClose();
        }}><i className="bi bi-incognito me-1" />Start session</button>
      </div>
    </Modal>
  );
}

/* ============================ 8. Kill sessions modal ============================ */
export function KillSessionsModal({ user, logins, onClose, onDone }: {
  user: FeaturedUser | null; logins: LoginRec[]; onClose: () => void; onDone: (ids: string[]) => void;
}) {
  const { push } = useToast();
  const [sel, setSel] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const active = logins.filter((l) => l.active);
  if (!user) return null;
  return (
    <Modal open onClose={onClose} tone="amber" icon="bi-power" size="md"
      title={`Terminate sessions — ${user.name}`} subtitle={`${active.length} active session${active.length !== 1 ? "s" : ""} will be signed out immediately.`}>
      <div className="pm-modal-body">
        <div className="d-flex flex-column gap-2 mb-3">
          {logins.slice(0, 8).map((l) => (
            <label key={l.id} className={`pm-opt ${sel.includes(l.id) || l.active ? "active" : ""}`}>
              <input type="checkbox" className="form-check-input mt-0" disabled={l.active} checked={l.active || sel.includes(l.id)}
                onChange={(e) => setSel(e.target.checked ? [...sel, l.id] : sel.filter((x) => x !== l.id))} />
              <span className="flex-grow-1">
                <span className="d-block" style={{ fontWeight: 700, fontSize: ".83rem" }}>{l.device} {l.active && <Badge tone="green">Live now</Badge>}</span>
                <span className="d-block" style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{l.time} · {l.ip} · {l.location} · {l.method}</span>
              </span>
              <Badge tone={l.risk === "High" ? "red" : l.risk === "Medium" ? "amber" : "green"}>{l.risk}</Badge>
            </label>
          ))}
        </div>
        <TwoFactorField value={code} onChange={setCode} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger btn-sm" disabled={code !== "482913"} onClick={() => {
          onDone([...active.map((a) => a.id), ...sel]);
          push({ kind: "success", title: `${active.length + sel.length} sessions terminated`, body: `${user.name} must re-authenticate with a passkey.` }); onClose();
        }}><i className="bi bi-power me-1" />Terminate sessions</button>
      </div>
    </Modal>
  );
}

/* ============================ 9. Blacklist device modal ============================ */
export function BlacklistDeviceModal({ device, user, onClose, onDone }: { device: DeviceRec | null; user: FeaturedUser | null; onClose: () => void; onDone: (d: DeviceRec) => void }) {
  const { push } = useToast();
  const [scope, setScope] = useState("device");
  const [duration, setDuration] = useState("permanent");
  const [code, setCode] = useState("");
  if (!device || !user) return null;
  return (
    <Modal open onClose={onClose} tone="red" icon="bi-fingerprint" size="md"
      title="Blacklist device" subtitle={`${device.model} · ${device.fp}`}>
      <div className="pm-modal-body">
        <div className="pm-note mb-3" style={{ borderColor: "#fbd3cf", background: "#fef2f2", color: "#b42318" }}>
          <i className="bi bi-exclamation-octagon me-1" />The device is blocked on this account across all rails. Existing sessions from this device are terminated immediately.
        </div>
        <label className="form-label">Scope</label>
        <div className="d-flex gap-1 flex-wrap mb-3">
          {[["device", "This device fingerprint"], ["ip", "IP + fingerprint"], ["cluster", "Linked cluster (4 devices)"]].map(([v, l]) => (
            <button key={v} className={`pm-chip ${scope === v ? "active" : ""}`} onClick={() => setScope(v)}>{l}</button>
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
          onDone(device);
          push({ kind: "success", title: "Device blacklisted", body: `${device.fp} · ${scope} · ${duration} · BLK-2026-0415.` }); onClose();
        }}><i className="bi bi-fingerprint me-1" />Blacklist device</button>
      </div>
    </Modal>
  );
}

/* ============================ 10. Revoke trust modal ============================ */
export function RevokeTrustModal({ device, user, onClose, onDone }: { device: DeviceRec | null; user: FeaturedUser | null; onClose: () => void; onDone: (d: DeviceRec) => void }) {
  const { push } = useToast();
  const [reason, setReason] = useState("");
  if (!device || !user) return null;
  return (
    <Modal open onClose={onClose} tone="amber" icon="bi-shield-slash" size="sm"
      title="Revoke device trust" subtitle={`${device.model} · trusted since ${device.firstSeen}`}>
      <div className="pm-modal-body">
        <div className="pm-note mb-3">Revoking trust does <b>not</b> blacklist. The device must re-verify with a passkey or biometric at next login.</div>
        <label className="form-label">Reason</label>
        <textarea className="form-control" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Customer reported a lost phone." />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={reason.trim().length < 5} onClick={() => {
          onDone(device);
          push({ kind: "success", title: "Trust revoked", body: `${device.model} will require re-verification.` }); onClose();
        }}><i className="bi bi-shield-slash me-1" />Revoke trust</button>
      </div>
    </Modal>
  );
}

/* ============================ 11. KYC document viewer ============================ */
export function KycDocModal({ doc, user, onClose, onDecision }: {
  doc: { name: string; status: string; uploaded: string; onfido: number } | null; user: FeaturedUser | null;
  onClose: () => void; onDecision: (doc: { name: string; status: string; uploaded: string; onfido: number }, decision: "approved" | "rejected") => void;
}) {
  const { push } = useToast();
  const [note, setNote] = useState("");
  if (!doc || !user) return null;
  return (
    <Modal open onClose={onClose} tone={doc.status === "Verified" ? "green" : doc.status === "Rejected" ? "red" : "amber"}
      icon="bi-file-earmark-image" size="lg" title={doc.name} subtitle={`${user.name} · uploaded ${doc.uploaded}`}>
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <div className="pm-card h-100 d-grid place-items-center" style={{ minHeight: 260, background: "repeating-linear-gradient(45deg,#f7f9fc,#f7f9fc 12px,#eef1f6 12px,#eef1f6 24px)" }}>
              <div className="text-center">
                <i className="bi bi-file-earmark-image" style={{ fontSize: "3rem", color: "#c3cbd9" }} />
                <div style={{ fontWeight: 700, fontSize: ".86rem" }}>{doc.name}</div>
                <div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>Watermarked preview · {user.name} · {user.id}</div>
                <div className="pm-code mt-2 text-center" style={{ background: "#fff", color: "#475467", border: "1px solid var(--pm-border)" }}>DOC-HASH 8f2a…c4b9</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-kv"><span className="k">Onfido match score</span><span className="v"><Badge tone={doc.onfido > 90 ? "green" : doc.onfido > 75 ? "amber" : "red"}>{doc.onfido}%</Badge></span></div>
              <div className="pm-kv"><span className="k">Identity match</span><span className="v">{doc.onfido > 90 ? "Confirmed" : "Review required"}</span></div>
              <div className="pm-kv"><span className="k">Liveness</span><span className="v">Passed · 0 tampering signals</span></div>
              <div className="pm-kv"><span className="k">Sanctions screening</span><span className="v">Clear (World-Check)</span></div>
              <div className="pm-kv"><span className="k">Current status</span><span className="v"><Badge tone={doc.status === "Verified" ? "green" : doc.status === "Rejected" ? "red" : "amber"}>{doc.status}</Badge></span></div>
            </div>
            <label className="form-label">Review note</label>
            <textarea className="form-control mb-3" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Assessor comment (optional)…" />
          </div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => { push({ kind: "info", title: "Original sent to reviewer inbox", body: "High-resolution copy delivered to compliance inbox." }); }}>
          <i className="bi bi-cloud-arrow-down me-1" />Download original
        </button>
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        {doc.status !== "Verified" && (
          <>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => { onDecision(doc, "rejected"); push({ kind: "warn", title: "Document rejected", body: `${doc.name} · customer notified to re-upload.` }); onClose(); }}>
              <i className="bi bi-x-circle me-1" />Reject
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => { onDecision(doc, "approved"); push({ kind: "success", title: "Document approved", body: `${doc.name} · KYC stage advanced.` }); onClose(); }}>
              <i className="bi bi-check2-circle me-1" />Approve
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}

/* ============================ 12. KYC re-verification wizard ============================ */
export function KycReverifyWizard({ user, onClose }: { user: FeaturedUser | null; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [scope, setScope] = useState("full");
  const [channel, setChannel] = useState("in-app");
  const [notify, setNotify] = useState(true);
  const [code, setCode] = useState("");
  const steps = [{ label: "Scope", icon: "bi-patch-check" }, { label: "Channel", icon: "bi-broadcast" }, { label: "2FA", icon: "bi-shield-lock" }];
  const close = () => { setStep(0); setCode(""); onClose(); };
  if (!user) return null;
  return (
    <Modal open onClose={close} tone="blue" icon="bi-arrow-repeat" size="md"
      title={`Re-verify KYC — ${user.name}`} subtitle={`${user.id} · current KYC: ${user.kyc}`}>
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div className="d-flex flex-column gap-2">
            {[{ id: "full", l: "Full re-verification", d: "ID + selfie + address + income — resets all stages" },
              { id: "id", l: "Identity document only", d: "New national ID scan with Onfido check" },
              { id: "address", l: "Address only", d: "New proof of address, 3-month document" },
              { id: "income", l: "Source of income only", d: "Payslip or bank statement, 3-month window" }].map((s) => (
              <button key={s.id} className={`pm-opt ${scope === s.id ? "active" : ""}`} onClick={() => setScope(s.id)}>
                <span className="r" /><span className="flex-grow-1">
                  <span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>{s.l}</span>
                  <span className="d-block" style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>{s.d}</span></span>
              </button>
            ))}
          </div>
        )}
        {step === 1 && (
          <div className="d-flex flex-column gap-2">
            {[{ id: "in-app", l: "In-app prompt", d: "Customer completes the flow in the app" },
              { id: "link", l: "Secure link (SMS + email)", d: "Self-service link, valid 48 hours" },
              { id: "agent", l: "In-person with field agent", d: "For customers without smartphone access" }].map((c) => (
              <button key={c.id} className={`pm-opt ${channel === c.id ? "active" : ""}`} onClick={() => setChannel(c.id)}>
                <span className="r" /><span className="flex-grow-1">
                  <span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>{c.l}</span>
                  <span className="d-block" style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>{c.d}</span></span>
              </button>
            ))}
            <label className="pm-opt mt-2">
              <input type="checkbox" className="form-check-input mt-0" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
              <span style={{ fontWeight: 700, fontSize: ".84rem" }}>Notify {user.name} immediately by SMS and push</span>
            </label>
          </div>
        )}
        {step === 2 && <TwoFactorField value={code} onChange={setCode} />}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}><i className="bi bi-arrow-left me-1" />Back</button>}
        {step < 2 && <button className="btn btn-primary btn-sm" onClick={() => setStep(step + 1)}>Next<i className="bi bi-arrow-right ms-1" /></button>}
        {step === 2 && <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => {
          push({ kind: "success", title: "Re-verification requested", body: `KYC-REQ-2026-0219 · ${scope} via ${channel}.` }); close();
        }}><i className="bi bi-send me-1" />Send request</button>}
      </div>
    </Modal>
  );
}

/* ============================ 13. Card action modal ============================ */
export function CardActionModal({ card, user, onClose, onDone }: {
  card: CardRec | null; user: FeaturedUser | null; onClose: () => void; onDone: (c: CardRec, action: string) => void;
}) {
  const { push } = useToast();
  const [action, setAction] = useState(card?.status === "Frozen" ? "unblock" : "freeze");
  const [code, setCode] = useState("");
  if (!card || !user) return null;
  const actions = card.status === "Frozen"
    ? [["unblock", "Unblock card", "bi-unlock"]]
    : [["freeze", "Freeze card", "bi-snow3"], ["replace", "Replace card", "bi-arrow-repeat"], ["report-lost", "Report lost/stolen", "bi-exclamation-triangle"]];
  return (
    <Modal open onClose={onClose} tone={card.status === "Frozen" ? "green" : "blue"} icon="bi-credit-card-2-front" size="sm"
      title={`${card.brand} •••• ${card.last4}`} subtitle={`${user.name} · ${card.id} · issued ${card.issued}`}>
      <div className="pm-modal-body">
        <div className="d-flex flex-column gap-2 mb-3">
          {actions.map(([id, l, i]) => (
            <button key={id} className={`pm-opt ${action === id ? "active" : ""}`} onClick={() => setAction(id)}>
              <span className="r" /><i className={`bi ${i}`} style={{ color: "var(--pm-blue)" }} />
              <span style={{ fontWeight: 700, fontSize: ".85rem" }}>{l}</span>
            </button>
          ))}
        </div>
        {action === "replace" && <div className="pm-note mb-3">The new card arrives in 3–5 working days (Nairobi) or 5–8 (other counties). The old card is voided on activation.</div>}
        <TwoFactorField value={code} onChange={setCode} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => {
          onDone(card, action);
          push({ kind: "success", title: `Card ${action === "replace" ? "replacement requested" : action === "unblock" ? "unblocked" : "frozen"}`, body: `${card.brand} •••• ${card.last4} · CRD-2214.` }); onClose();
        }}><i className="bi bi-credit-card me-1" />Confirm</button>
      </div>
    </Modal>
  );
}

/* ============================ 14. Loan restructure wizard ============================ */
export function LoanRestructureWizard({ loan, user, onClose, onDone }: {
  loan: LoanRec | null; user: FeaturedUser | null; onClose: () => void; onDone: (l: LoanRec, terms: string) => void;
}) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [strategy, setStrategy] = useState("extend");
  const [months, setMonths] = useState(6);
  const [haircut, setHaircut] = useState(0);
  const [code, setCode] = useState("");
  const steps = [{ label: "Strategy", icon: "bi-signpost" }, { label: "Terms", icon: "bi-calculator" }, { label: "2FA", icon: "bi-shield-lock" }];
  const close = () => { setStep(0); setCode(""); onClose(); };
  if (!loan || !user) return null;
  const monthly = Math.round(loan.balance * (1 - haircut / 100) / months);
  return (
    <Modal open onClose={close} tone="amber" icon="bi-cash-coin" size="md"
      title={`Restructure ${loan.product}`} subtitle={`${loan.id} · ${user.name} · ${kes(loan.balance)} outstanding`}>
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%`, background: "#f79009" }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div className="d-flex flex-column gap-2">
            {[{ id: "extend", l: "Extend tenor", d: "Reset the arrears clock and extend the schedule" },
              { id: "settle", l: "Negotiated settlement", d: "Discounted lump sum to close the loan" },
              { id: "salary", l: "Salary deduction order", d: "Route instalments from employer disbursement" },
              { id: "legal", l: "Escalate to legal", d: "Demand letter through Mwangi & Co Advocates" }].map((s) => (
              <button key={s.id} className={`pm-opt ${strategy === s.id ? "active" : ""}`} onClick={() => setStrategy(s.id)}>
                <span className="r" /><span className="flex-grow-1">
                  <span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>{s.l}</span>
                  <span className="d-block" style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>{s.d}</span></span>
              </button>
            ))}
          </div>
        )}
        {step === 1 && (
          <>
            <label className="form-label">New tenor — {months} months</label>
            <input type="range" className="form-range mb-3" min={1} max={24} value={months} onChange={(e) => setMonths(Number(e.target.value))} />
            <label className="form-label">Principal haircut — {haircut}%</label>
            <input type="range" className="form-range mb-3" min={0} max={40} step={5} value={haircut} onChange={(e) => setHaircut(Number(e.target.value))} />
            <div className="pm-card pm-card-pad">
              <div className="pm-kv"><span className="k">Amount to recover</span><span className="v">{kes(loan.balance * (1 - haircut / 100))}</span></div>
              <div className="pm-kv"><span className="k">New monthly instalment</span><span className="v">{kes(monthly)}</span></div>
              <div className="pm-kv"><span className="k">Value forgone</span><span className="v" style={{ color: "#d92d20" }}>{kes(loan.balance * (haircut / 100))}</span></div>
              <div className="pm-kv"><span className="k">Expected recovery</span><span className="v">{Math.min(96, 60 + haircut)}%</span></div>
            </div>
          </>
        )}
        {step === 2 && <TwoFactorField value={code} onChange={setCode} />}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}><i className="bi bi-arrow-left me-1" />Back</button>}
        {step < 2 && <button className="btn btn-primary btn-sm" onClick={() => setStep(step + 1)}>Next<i className="bi bi-arrow-right ms-1" /></button>}
        {step === 2 && <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => {
          onDone(loan, `${strategy} · ${months}mo · ${haircut}%`);
          push({ kind: "success", title: "Loan restructured", body: `${loan.id} · new instalment ${kes(monthly)} · CRB reporting suspended while performing.` }); close();
        }}><i className="bi bi-check2-circle me-1" />Approve restructure</button>}
      </div>
    </Modal>
  );
}

/* ============================ 15. Admin credit modal ============================ */
export function AdminCreditModal({ user, onClose, onDone }: { user: FeaturedUser | null; onClose: () => void; onDone: (u: FeaturedUser, amount: number) => void }) {
  const { push } = useToast();
  const [amount, setAmount] = useState(5_000);
  const [reason, setReason] = useState("bad-fee");
  const [code, setCode] = useState("");
  if (!user) return null;
  return (
    <Modal open onClose={onClose} tone="green" icon="bi-cash-coin" size="sm"
      title={`Admin credit — ${user.name}`} subtitle="Direct wallet adjustment · appears as 'PayMo adjustment' in the customer statement">
      <div className="pm-modal-body">
        <label className="form-label">Amount (KES)</label>
        <input type="number" className="form-control mono mb-3" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
        <label className="form-label">Reason</label>
        <select className="form-select mb-3" value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="bad-fee">Fee charged in error</option>
          <option value="support-gesture">Support goodwill gesture</option>
          <option value="promotion">Promotional credit</option>
          <option value="settlement-fix">Settlement error correction</option>
        </select>
        <TwoFactorField value={code} onChange={setCode} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={amount <= 0 || code !== "482913"} onClick={() => {
          onDone(user, amount);
          push({ kind: "success", title: `${kes(amount)} credited`, body: `${user.name} · ADJ-2026-1182 · reason: ${reason}.` }); onClose();
        }}><i className="bi bi-plus-circle me-1" />Credit wallet</button>
      </div>
    </Modal>
  );
}

/* ============================ 16. Block user modal ============================ */
export function BlockUserModal({ user, onClose, onDone }: { user: FeaturedUser | null; onClose: () => void; onDone: (u: FeaturedUser) => void }) {
  const { push } = useToast();
  const [reason, setReason] = useState("fraud-ring");
  const [duration, setDuration] = useState("permanent");
  const [code, setCode] = useState("");
  if (!user) return null;
  return (
    <Modal open onClose={onClose} tone="red" icon="bi-person-slash" size="md"
      title={`Block ${user.name}`} subtitle="Prevents re-registration and all access. Stronger than a freeze.">
      <div className="pm-modal-body">
        <div className="pm-note mb-3" style={{ borderColor: "#fbd3cf", background: "#fef2f2", color: "#b42318" }}>
          <i className="bi bi-exclamation-octagon me-1" />Blocked identities cannot open a new account for the duration of the block. Funds are retained for 90 days then reported.
        </div>
        <label className="form-label">Block reason</label>
        <select className="form-select mb-3" value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="fraud-ring">Confirmed fraud ring</option>
          <option value="sanctions">Sanctions match</option>
          <option value="chargeback-abuse">Card chargeback abuse</option>
          <option value="court">Court / regulator order</option>
        </select>
        <label className="form-label">Duration</label>
        <div className="d-flex gap-1 flex-wrap mb-3">
          {[["1y", "1 year"], ["3y", "3 years"], ["permanent", "Permanent"]].map(([v, l]) => (
            <button key={v} className={`pm-chip ${duration === v ? "active" : ""}`} onClick={() => setDuration(v)}>{l}</button>
          ))}
        </div>
        <TwoFactorField value={code} onChange={setCode} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger btn-sm" disabled={code !== "482913"} onClick={() => {
          onDone(user);
          push({ kind: "warn", title: `${user.name} blocked`, body: `${duration} · ${reason} · identity + 6 fingerprints added to the blocklist.` }); onClose();
        }}><i className="bi bi-person-slash me-1" />Block user</button>
      </div>
    </Modal>
  );
}

/* ============================ 17. ODPC data export modal ============================ */
export function DataExportModal({ user, onClose }: { user: FeaturedUser | null; onClose: () => void }) {
  const { push } = useToast();
  const [sections, setSections] = useState({ profile: true, txns: true, logins: true, kyc: false, risk: true, notes: true });
  if (!user) return null;
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-shield-lock" size="md"
      title={`Data subject export — ${user.name}`} subtitle="ODPC-aligned self-contained export with access log.">
      <div className="pm-modal-body">
        <div className="d-flex flex-column gap-2">
          {Object.entries({ profile: "Identity & profile (PII)", txns: "Full transaction history", logins: "Login & device history",
            kyc: "KYC documents (identity-sensitive)", risk: "Risk signals & fraud decisions", notes: "Internal admin notes" }).map(([k, l]) => (
            <label key={k} className={`pm-opt ${(sections as any)[k] ? "active" : ""}`}>
              <input type="checkbox" className="form-check-input mt-0" checked={(sections as any)[k]} onChange={(e) => setSections({ ...sections, [k]: e.target.checked })} />
              <span style={{ fontWeight: 700, fontSize: ".84rem" }}>{l}</span>
              {k === "kyc" && <Badge tone="red">Sensitive</Badge>}
            </label>
          ))}
        </div>
        <div className="pm-note mt-3"><i className="bi bi-info-circle me-1" />The export is watermarked, zipped, AES-256 encrypted and the customer is emailed a 7-day link.</div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => {
          push({ kind: "success", title: "Data subject export queued", body: `DSAR-2026-044 · ${Object.values(sections).filter(Boolean).length} sections · link valid 7 days.` }); onClose();
        }}><i className="bi bi-send me-1" />Generate export</button>
      </div>
    </Modal>
  );
}

/* ============================ 18. Add internal note modal ============================ */
export function AddNoteModal({ user, onClose, onSaved }: { user: FeaturedUser | null; onClose: () => void; onSaved: (u: FeaturedUser, note: string, visible: boolean) => void }) {
  const { push } = useToast();
  const [note, setNote] = useState("");
  const [visible, setVisible] = useState(true);
  if (!user) return null;
  return (
    <Modal open onClose={onClose} tone="ink" icon="bi-chat-square-text" size="sm" title={`Add note — ${user.name}`} subtitle="Internal only · visible to admins with this profile">
      <div className="pm-modal-body">
        <textarea className="form-control mb-3" rows={5} value={note} onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Prefers WhatsApp over phone. Salaried — deductions from M-KOPA pay slip." />
        <label className="pm-opt">
          <input type="checkbox" className="form-check-input mt-0" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
          <span style={{ fontWeight: 700, fontSize: ".84rem" }}>Visible to Relationship Managers as well</span>
        </label>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={note.trim().length < 5} onClick={() => {
          onSaved(user, note, visible);
          push({ kind: "success", title: "Note added", body: visible ? "Visible to admins + RMs." : "Admins only." }); onClose();
        }}><i className="bi bi-plus-lg me-1" />Add note</button>
      </div>
    </Modal>
  );
}

/* ============================ 19. Transaction action (reverse / hold) ============================ */
export function TxnActionModal({ txn, mode, user, onClose, onDone }: {
  txn: TxnRec | null; mode: "reverse" | "hold" | "release"; user: FeaturedUser | null; onClose: () => void; onDone: (t: TxnRec, mode: string) => void;
}) {
  const { push } = useToast();
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  if (!txn || !user) return null;
  const isReverse = mode === "reverse";
  const isHold = mode === "hold";
  return (
    <Modal open onClose={onClose} tone={isReverse ? "amber" : isHold ? "blue" : "green"}
      icon={isReverse ? "bi-arrow-counterclockwise" : isHold ? "bi-pause-circle" : "bi-play-circle"} size="sm"
      title={`${isReverse ? "Reverse" : isHold ? "Hold for review" : "Release hold"} — ${txn.id}`}
      subtitle={`${txn.type} · ${kes(txn.amount)} · ${txn.time}`}>
      <div className="pm-modal-body">
        {isReverse && (
          <div className="pm-kv"><span className="k">Credit back to {user.name}</span><span className="v" style={{ color: "#0b8f52" }}>{kes(txn.amount + txn.fee)}</span></div>
        )}
        <label className="form-label mt-2">Reason</label>
        <select className="form-select mb-3" value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="">Select a reason…</option>
          {isReverse ? ["Duplicate charge", "Operational error", "Confirmed fraud", "Customer dispute upheld"] :
            isHold ? ["Velocity breach", "New high-value beneficiary", "AML review", "Manual investigation"] :
              ["Cleared after review", "Customer verified", "False positive"]}
        </select>
        <TwoFactorField value={code} onChange={setCode} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className={`btn ${isHold ? "btn-primary" : isReverse ? "btn-primary" : "btn-primary"} btn-sm`}
          disabled={code !== "482913" || !reason} onClick={() => {
            onDone(txn, mode);
            push({ kind: "success", title: isReverse ? `${txn.id} reversed` : isHold ? `${txn.id} held` : `${txn.id} released`, body: reason + " · AUD-88318 logged." }); onClose();
          }}><i className="bi bi-check2 me-1" />Confirm</button>
      </div>
    </Modal>
  );
}

/* ============================ 20. User switcher drawer ============================ */
export function UserSwitcherDrawer({ users, current, open, onClose, onSelect }: {
  users: FeaturedUser[]; current: FeaturedUser; open: boolean; onClose: () => void; onSelect: (u: FeaturedUser) => void;
}) {
  const [q, setQ] = useState("");
  const list = users.filter((u) => (u.name + u.id).toLowerCase().includes(q.toLowerCase()));
  return (
    <Drawer open={open} onClose={onClose} icon="bi-people" tone="blue" title="Recently viewed users"
      subtitle="Jump between the 8 most recent 360° profiles."
      footer={<button className="btn btn-primary btn-sm w-100" onClick={() => { onClose(); pushNav(); }}>
        <i className="bi bi-person-lines-fill me-1" />Open full directory (Page 4)
      </button>}>
      <div className="pm-search mb-3" style={{ background: "#fff" }}>
        <i className="bi bi-search" /><input placeholder="Search name or ID…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="d-flex flex-column gap-2">
        {list.map((u) => (
          <button key={u.id} className={`pm-alert-row ${u.id === current.id ? "crit" : "info"} text-start`}
            style={{ borderLeftColor: u.id === current.id ? "var(--pm-green)" : undefined }}
            onClick={() => { onSelect(u); onClose(); }}>
            <Avatar name={u.name} />
            <div className="flex-grow-1">
              <div style={{ fontWeight: 700, fontSize: ".84rem" }}>{u.name} {u.id === current.id && <Badge tone="green">Current</Badge>}</div>
              <div style={{ fontSize: ".73rem", color: "var(--pm-muted)" }} className="mono">{u.id} · {u.county} · {u.phone}</div>
              <div className="d-flex gap-1 mt-1">
                <Badge tone={u.tier === "VIP" ? "violet" : u.tier === "Business" ? "blue" : "grey"}>{u.tier}</Badge>
                <Badge tone={u.status === "Active" ? "green" : u.status === "Frozen" ? "blue" : u.status === "Suspended" ? "amber" : "red"} dot>{u.status}</Badge>
                <Badge tone={u.risk > 70 ? "red" : u.risk > 40 ? "amber" : "green"}>Risk {u.risk}</Badge>
              </div>
            </div>
            <i className="bi bi-chevron-right" style={{ color: "#c3cbd9" }} />
          </button>
        ))}
      </div>
    </Drawer>
  );
}

function pushNav() { window.location.hash = "user-directory"; }
void jsonDownload;
