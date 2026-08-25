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
            <div className="pm-kv"><span className="k">Closed by</span><span className="v">Jeckonia Kwasa (Tier 0) + co-approval</span></div>
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

/* ============================ 21. Profile share modal ============================ */
export function ProfileShareModal({ user, onClose }: { user: FeaturedUser | null; onClose: () => void }) {
  const { push } = useToast();
  const [expiry, setExpiry] = useState("24h");
  const [perm, setPerm] = useState<"view" | "comment">("view");
  if (!user) return null;
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-link-45deg" size="md"
      title="Share profile" subtitle="Generate a read-only shareable link">
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Link</span><span className="v mono" style={{ fontSize: ".76rem" }}>https://paymo.co.ke/share/{user.id.toLowerCase()}-{Date.now().toString(36)}</span></div>
          <div className="pm-kv"><span className="k">Created</span><span className="v">{new Date().toLocaleDateString("en-GB")}</span></div>
        </div>
        <label className="form-label">Expiry</label>
        <div className="d-flex gap-1 flex-wrap mb-3">
          {["1h", "24h", "7d", "30d"].map((e) => (
            <button key={e} className={`pm-chip ${expiry === e ? "active" : ""}`} onClick={() => setExpiry(e)}>{e}</button>
          ))}
        </div>
        <label className="form-label">Permission</label>
        <div className="d-flex gap-2 mb-3">
          {[{ v: "view" as const, l: "View only" }, { v: "comment" as const, l: "View + comment" }].map((p) => (
            <button key={p.v} className={`pm-opt flex-grow-1 ${perm === p.v ? "active" : ""}`} onClick={() => setPerm(p.v)}>
              <span style={{ fontSize: ".84rem", fontWeight: 700 }}>{p.l}</span>
            </button>
          ))}
        </div>
        <div className="pm-note"><i className="bi bi-info-circle me-1" />Link is watermarked with your identity and logged in the audit trail.</div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Link copied to clipboard", body: `Expires in ${expiry} · ${perm} access` }); onClose(); }}>
          <i className="bi bi-clipboard me-1" />Copy link
        </button>
      </div>
    </Modal>
  );
}

/* ============================ 22. Wallet detail modal ============================ */
export function WalletDetailModal({ wallet, onClose }: { wallet: { name: string; balance: number; desc: string } | null; onClose: () => void }) {
  if (!wallet) return null;
  const txns = [
    { id: "W-TXN-001", time: "24 Aug 14:28", type: "Credit", amount: 15000, desc: "M-Pesa deposit" },
    { id: "W-TXN-002", time: "23 Aug 09:15", type: "Debit", amount: -4200, desc: "Bill payment" },
    { id: "W-TXN-003", time: "22 Aug 16:05", type: "Credit", amount: 50000, desc: "Bank transfer" },
  ];
  return (
    <Drawer open onClose={onClose} icon="bi-wallet2" tone="blue" title={wallet.name} subtitle={wallet.desc}>
      <div className="pm-card pm-card-pad mb-3 text-center">
        <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1.8rem" }}>{kes(wallet.balance)}</div>
        <div style={{ fontSize: ".76rem", color: "var(--pm-muted)" }}>Available balance</div>
      </div>
      <div className="pm-card">
        <div className="pm-card-head"><h6 className="pm-card-title">Recent activity</h6></div>
        <div className="p-2 d-flex flex-column gap-1">
          {txns.map((t) => (
            <div key={t.id} className="pm-card pm-card-pad d-flex align-items-center gap-3">
              <div style={{ width: 32, height: 32, borderRadius: 8, background: t.amount > 0 ? "#e7f8ef" : "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className={`bi ${t.amount > 0 ? "bi-arrow-down-left" : "bi-arrow-up-right"}`} style={{ color: t.amount > 0 ? "#12b76a" : "#f04438", fontSize: ".85rem" }} />
              </div>
              <div className="flex-grow-1"><div style={{ fontWeight: 700, fontSize: ".82rem" }}>{t.desc}</div><div style={{ fontSize: ".7rem", color: "var(--pm-muted)" }}>{t.id} · {t.time}</div></div>
              <div style={{ fontWeight: 700, fontSize: ".88rem", color: t.amount > 0 ? "#12b76a" : "var(--pm-ink)" }}>{t.amount > 0 ? "+" : ""}{kes(Math.abs(t.amount))}</div>
            </div>
          ))}
        </div>
      </div>
    </Drawer>
  );
}

/* ============================ 23. Risk rule detail modal ============================ */
export function RiskRuleDetailModal({ rule, onClose }: { rule: { id: string; rule: string; score: number; action: string; note: string } | null; onClose: () => void }) {
  if (!rule) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-shield-exclamation" tone={rule.score > 70 ? "red" : rule.score > 40 ? "amber" : "green"}
      title={rule.rule} subtitle={rule.id}>
      <div className="pm-card pm-card-pad mb-3 text-center">
        <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "2rem", color: rule.score > 70 ? "#f04438" : rule.score > 40 ? "#f79009" : "#12b76a" }}>{rule.score}</div>
        <div style={{ fontSize: ".76rem", color: "var(--pm-muted)" }}>Risk score</div>
      </div>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Action</span><span className="v"><Badge tone={rule.action === "Block" ? "red" : rule.action === "Review" ? "amber" : "green"}>{rule.action}</Badge></span></div>
        <div className="pm-kv"><span className="k">Note</span><span className="v">{rule.note}</span></div>
        <div className="pm-kv"><span className="k">Last triggered</span><span className="v">24 Aug 2026 14:32</span></div>
        <div className="pm-kv"><span className="k">Trigger count (30d)</span><span className="v">12</span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 24. Card eligibility modal ============================ */
export function CardEligibilityModal({ user, onClose }: { user: FeaturedUser | null; onClose: () => void }) {
  if (!user) return null;
  const eligible = user.tier === "VIP" || user.tier === "Business";
  const checks = [
    { label: "KYC verified", pass: user.kyc === "Verified", detail: user.kyc },
    { label: "Tier requirement", pass: eligible, detail: `${user.tier} tier` },
    { label: "Risk score", pass: user.risk < 60, detail: `${user.risk}/100` },
    { label: "Account active", pass: user.status === "Active", detail: user.status },
    { label: "Age verified", pass: true, detail: "18+ confirmed" },
  ];
  return (
    <Modal open onClose={onClose} tone={eligible ? "green" : "amber"} icon="bi-credit-card" size="md"
      title="Card eligibility" subtitle={`${user.name} · ${eligible ? "eligible" : "not eligible"}`}>
      <div className="pm-modal-body">
        <div className="d-flex flex-column gap-2">
          {checks.map((c) => (
            <div key={c.label} className="pm-card pm-card-pad d-flex align-items-center gap-3">
              <i className={`bi ${c.pass ? "bi-check-circle-fill" : "bi-x-circle-fill"}`} style={{ color: c.pass ? "#12b76a" : "#f04438" }} />
              <div className="flex-grow-1"><div style={{ fontWeight: 700, fontSize: ".84rem" }}>{c.label}</div><div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{c.detail}</div></div>
              <Badge tone={c.pass ? "green" : "red"}>{c.pass ? "Pass" : "Fail"}</Badge>
            </div>
          ))}
        </div>
        {!eligible && <div className="pm-note mt-3"><i className="bi bi-info-circle me-1" />Upgrade to VIP or Business tier to unlock card issuance.</div>}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-primary btn-sm" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 25. Login detail modal ============================ */
export function LoginDetailModal({ login, onClose }: { login: LoginRec | null; onClose: () => void }) {
  if (!login) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-box-arrow-in-right" tone="blue" title="Session detail" subtitle={login.id}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Device</span><span className="v">{login.device}</span></div>
        <div className="pm-kv"><span className="k">IP address</span><span className="v mono">{login.ip}</span></div>
        <div className="pm-kv"><span className="k">Location</span><span className="v">{login.location}</span></div>
        <div className="pm-kv"><span className="k">Time</span><span className="v">{login.time}</span></div>
        <div className="pm-kv"><span className="k">Duration</span><span className="v">{login.duration}</span></div>
        <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone={login.status === "Active" ? "green" : "grey"}>{login.status}</Badge></span></div>
        <div className="pm-kv"><span className="k">MFA method</span><span className="v">{login.mfa}</span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 26. Transaction detail modal ============================ */
export function TxnDetailModal({ txn, onClose }: { txn: TxnRec | null; onClose: () => void }) {
  if (!txn) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-receipt" tone="blue" title="Transaction detail" subtitle={txn.id}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Type</span><span className="v">{txn.type}</span></div>
        <div className="pm-kv"><span className="k">Amount</span><span className="v pm-num" style={{ fontWeight: 700, color: txn.amount > 0 ? "#12b76a" : "var(--pm-ink)" }}>{txn.amount > 0 ? "+" : ""}{kes(Math.abs(txn.amount))}</span></div>
        <div className="pm-kv"><span className="k">Time</span><span className="v">{txn.time}</span></div>
        <div className="pm-kv"><span className="k">Channel</span><span className="v">{txn.channel}</span></div>
        <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone={txn.status === "Completed" ? "green" : txn.status === "Failed" ? "red" : "amber"}>{txn.status}</Badge></span></div>
        <div className="pm-kv"><span className="k">Counterparty</span><span className="v">{txn.counterparty}</span></div>
        <div className="pm-kv"><span className="k">Reference</span><span className="v mono">{txn.ref}</span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 27. Loan detail modal ============================ */
export function LoanDetailModal({ loan, onClose }: { loan: LoanRec | null; onClose: () => void }) {
  if (!loan) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-cash-stack" tone="blue" title="Loan detail" subtitle={loan.id}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Principal</span><span className="v pm-num">{kes(loan.principal)}</span></div>
        <div className="pm-kv"><span className="k">Outstanding</span><span className="v pm-num" style={{ fontWeight: 700 }}>{kes(loan.outstanding)}</span></div>
        <div className="pm-kv"><span className="k">Rate</span><span className="v">{loan.rate}% p.a.</span></div>
        <div className="pm-kv"><span className="k">Monthly instalment</span><span className="v pm-num">{kes(loan.monthly)}</span></div>
        <div className="pm-kv"><span className="k">Next payment</span><span className="v">{loan.nextPayment}</span></div>
        <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone={loan.status === "Current" ? "green" : loan.status === "Delinquent" ? "red" : "grey"}>{loan.status}</Badge></span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 28. Device detail modal ============================ */
export function DeviceDetailModal({ device, onClose }: { device: DeviceRec | null; onClose: () => void }) {
  if (!device) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-phone" tone="blue" title="Device detail" subtitle={device.model}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Model</span><span className="v">{device.model}</span></div>
        <div className="pm-kv"><span className="k">OS</span><span className="v">{device.os}</span></div>
        <div className="pm-kv"><span className="k">Fingerprint</span><span className="v mono" style={{ fontSize: ".72rem" }}>{device.fp}</span></div>
        <div className="pm-kv"><span className="k">First seen</span><span className="v">{device.firstSeen}</span></div>
        <div className="pm-kv"><span className="k">Last seen</span><span className="v">{device.lastSeen}</span></div>
        <div className="pm-kv"><span className="k">Trust level</span><span className="v"><Badge tone={device.trust === "High" ? "green" : device.trust === "Medium" ? "amber" : "red"}>{device.trust}</Badge></span></div>
        <div className="pm-kv"><span className="k">Sessions (30d)</span><span className="v">{device.sessions}</span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 29. Account health modal ============================ */
export function AccountHealthModal({ user, onClose }: { user: FeaturedUser | null; onClose: () => void }) {
  if (!user) return null;
  const health = user.risk < 40 ? 88 : user.risk < 70 ? 62 : 35;
  const factors = [
    { label: "Account age", score: 75, detail: "Since 15 Aug 2026" },
    { label: "KYC status", score: user.kyc === "Verified" ? 95 : 30, detail: user.kyc },
    { label: "Risk score", score: 100 - user.risk, detail: `${user.risk}/100` },
    { label: "Activity level", score: user.txn30d > 20 ? 85 : 45, detail: `${user.txn30d} txns/30d` },
  ];
  return (
    <Drawer open onClose={onClose} icon="bi-heart-pulse" tone={health > 70 ? "green" : health > 50 ? "amber" : "red"}
      title="Account health" subtitle={`${user.name} · ${health}/100`}>
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

/* ============================ 30. User insights modal ============================ */
export function UserInsightModal({ user, onClose }: { user: FeaturedUser | null; onClose: () => void }) {
  if (!user) return null;
  const insights = [
    { icon: "bi-graph-up", title: "Spending pattern", detail: `Avg ${kes(Math.round(user.volume30d / Math.max(user.txn30d, 1)))} per txn · ${user.txn30d > 20 ? "above" : "below"} average`, tone: user.txn30d > 20 ? "green" : "amber" },
    { icon: "bi-geo-alt", title: "Location", detail: `${user.county} · primarily ${user.channel} channel`, tone: "blue" },
    { icon: "bi-clock-history", title: "Activity", detail: `Last active ${user.lastActive} · Peak 08:00-12:00`, tone: "blue" },
    { icon: "bi-person-check", title: "Engagement", detail: `${user.referrals} referrals · NPS ${user.nps ?? "not rated"}`, tone: user.referrals > 3 ? "green" : "blue" },
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

/* ============================ 31. Compliance check modal ============================ */
export function ComplianceCheckModal({ user, onClose }: { user: FeaturedUser | null; onClose: () => void }) {
  if (!user) return null;
  const checks = [
    { label: "KYC Tier 1", status: user.kyc === "Verified" ? "Pass" : "Pending", date: "15 Aug 2026" },
    { label: "PEP screening", status: "Clear", date: "15 Aug 2026" },
    { label: "Sanctions check", status: "Clear", date: "15 Aug 2026" },
    { label: "Adverse media", status: "No findings", date: "15 Aug 2026" },
  ];
  return (
    <Drawer open onClose={onClose} icon="bi-shield-check" tone="green" title="Compliance status" subtitle={`${user.name} · ${user.id}`}>
      <div className="d-flex flex-column gap-2">
        {checks.map((c) => (
          <div key={c.label} className="pm-card pm-card-pad d-flex align-items-center gap-3">
            <i className={`bi ${["Pass", "Clear", "No findings"].includes(c.status) ? "bi-check-circle-fill" : "bi-hourglass-split"}`}
              style={{ color: ["Pass", "Clear", "No findings"].includes(c.status) ? "#12b76a" : "#f79009" }} />
            <div className="flex-grow-1"><div style={{ fontWeight: 700, fontSize: ".84rem" }}>{c.label}</div><div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{c.date}</div></div>
            <Badge tone={["Pass", "Clear", "No findings"].includes(c.status) ? "green" : "amber"}>{c.status}</Badge>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 32. Session management modal ============================ */
export function SessionMgmtModal({ user, onClose }: { user: FeaturedUser | null; onClose: () => void }) {
  const { push } = useToast();
  if (!user) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-box-arrow-right" tone="amber" title="Session management" subtitle={`${user.name} · active sessions`}>
      <div className="pm-note mb-3" style={{ borderColor: "#fef3cd", background: "#fffbeb", color: "#92400e" }}>
        <i className="bi bi-info-circle me-1" />Revoking a session logs the user out immediately.
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

/* ============================ 33. Account recovery modal ============================ */
export function AccountRecoveryModal({ user, onClose }: { user: FeaturedUser | null; onClose: () => void }) {
  if (!user) return null;
  return (
    <Modal open onClose={onClose} tone="amber" icon="bi-key" size="md" title="Account recovery" subtitle={`${user.name} · ${user.id}`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Recovery email</span><span className="v">{user.email}</span></div>
          <div className="pm-kv"><span className="k">Recovery phone</span><span className="v mono">{user.phone}</span></div>
          <div className="pm-kv"><span className="k">2FA status</span><span className="v"><Badge tone="green">Enabled</Badge></span></div>
        </div>
        <div className="d-flex flex-column gap-2">
          <button className="pm-dd-item"><i className="bi bi-envelope" style={{ color: "#2e90fa" }} /><span className="flex-grow-1">Send password reset</span></button>
          <button className="pm-dd-item"><i className="bi bi-phone" style={{ color: "#12b76a" }} /><span className="flex-grow-1">Send OTP via SMS</span></button>
          <button className="pm-dd-item"><i className="bi bi-shield-lock" style={{ color: "#7a5af8" }} /><span className="flex-grow-1">Reset 2FA</span></button>
          <button className="pm-dd-item danger"><i className="bi bi-x-octagon" style={{ color: "#d92d20" }} /><span className="flex-grow-1">Force logout all sessions</span></button>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-primary btn-sm" onClick={onClose}>Done</button></div>
    </Modal>
  );
}

/* ============================ 34. User activity heatmap ============================ */
export function ActivityHeatmapModal({ user, onClose }: { user: FeaturedUser | null; onClose: () => void }) {
  if (!user) return null;
  const hours = Array.from({ length: 24 }, (_, i) => ({ hour: i, activity: Math.round(10 + Math.random() * 90 * (i >= 8 && i <= 20 ? 1 : 0.2)) }));
  return (
    <Drawer open onClose={onClose} icon="bi-grid-3x3" tone="blue" title="Activity heatmap" subtitle={`${user.name} · hourly pattern`}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="p-3">
          <div className="d-flex gap-1 flex-wrap">
            {hours.map((h) => (
              <div key={h.hour} title={`${h.hour}:00 — ${h.activity}%`} style={{ width: 28, height: 28, borderRadius: 4, background: `rgba(46,144,250,${h.activity / 100})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".6rem", color: h.activity > 50 ? "#fff" : "var(--pm-muted)" }}>
                {h.hour}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="pm-note"><i className="bi bi-info-circle me-1" />Peak: 08:00-12:00 and 18:00-21:00</div>
    </Drawer>
  );
}

/* ============================ 35. Referral network modal ============================ */
export function ReferralNetworkModal({ user, onClose }: { user: FeaturedUser | null; onClose: () => void }) {
  if (!user) return null;
  const refs = user.referrals > 0 ? [
    { name: "Mary Wanjiku", joined: "12 Aug 2026", status: "Active", earned: 500 },
    { name: "John Kipchoge", joined: "05 Aug 2026", status: "Active", earned: 500 },
  ].slice(0, user.referrals) : [];
  return (
    <Drawer open onClose={onClose} icon="bi-diagram-3" tone="green" title="Referral network" subtitle={`${user.name} · ${user.referrals} referral(s)`}>
      {refs.length === 0 ? (
        <div className="pm-empty"><i className="bi bi-people" /><div style={{ fontWeight: 700 }}>No referrals yet</div></div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {refs.map((r, i) => (
            <div key={i} className="pm-card pm-card-pad d-flex align-items-center gap-3">
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#e7f8ef", display: "flex", alignItems: "center", justifyContent: "center" }}><i className="bi bi-person" style={{ color: "#12b76a" }} /></div>
              <div className="flex-grow-1"><div style={{ fontWeight: 700, fontSize: ".84rem" }}>{r.name}</div><div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>Joined {r.joined} · Earned {kes(r.earned)}</div></div>
              <Badge tone="green">{r.status}</Badge>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  );
}

function pushNav() { window.location.hash = "user-directory"; }
void jsonDownload;
