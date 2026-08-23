import { useState } from "react";
import { Avatar, Badge, Drawer, Modal, Steps, TwoFactorField, useToast } from "../../../components/ui";
import { csvDownload, jsonDownload, kes, num } from "../../../lib/format";
import type { ConciergePriority, ConciergeRequest, FeeExemptionRule, VipAuditEvent, VipClient, VipTier } from "../data/vipData";
import { RELATIONS_MANAGERS, TIER_PERKS_MATRIX } from "../data/vipData";

const tierTone = (t: VipTier) => t === "Black" ? "ink" : t === "Diamond" ? "violet" : t === "Platinum" ? "blue" : "amber";
const statusTone = (s: string) => s === "Active" ? "green" : s === "Under Review" ? "amber" : s === "Suspended" ? "red" : "blue";
const priorityTone = (p: string) => p === "Urgent" ? "red" : p === "High" ? "amber" : "grey";

/* ============================ 1. VIP Client Detail Drawer ============================ */
export function VipDetailDrawer({ client, onClose, onGrantVip, onAdjustLimits, onAssignRm, onFeeWaiver, onImpersonate }: {
  client: VipClient | null;
  onClose: () => void;
  onGrantVip: (c: VipClient) => void;
  onAdjustLimits: (c: VipClient) => void;
  onAssignRm: (c: VipClient) => void;
  onFeeWaiver: (c: VipClient) => void;
  onImpersonate: (c: VipClient) => void;
}) {
  const { push } = useToast();
  if (!client) return null;

  return (
    <Drawer open onClose={onClose} wide icon="bi-gem" tone={client.tier === "Black" ? "ink" : "violet"}
      title={`${client.name} — VIP ${client.tier}`}
      subtitle={`${client.id} · ${client.company ?? "Private Wealth"} · Joined VIP ${client.joinedVip}`}
      headExtra={<Badge tone={tierTone(client.tier)}>{client.tier} Tier</Badge>}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => { jsonDownload(`${client.id}-vip-profile.json`, client); push({ kind: "success", title: "VIP Dossier Downloaded" }); }}>
          <i className="bi bi-download me-1" />Export JSON
        </button>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => onFeeWaiver(client)}>
          <i className="bi bi-percent me-1" />Fee Waiver
        </button>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => onAdjustLimits(client)}>
          <i className="bi bi-sliders me-1" />Limits
        </button>
        <button className="btn btn-primary btn-sm flex-grow-1" onClick={() => onGrantVip(client)}>
          <i className="bi bi-shield-check me-1" />Manage Tier
        </button>
      </>}>
      <div className="pm-card pm-card-pad mb-3 d-flex align-items-center gap-3">
        <Avatar name={client.name} size="lg" />
        <div className="flex-grow-1">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <h5 style={{ margin: 0, fontWeight: 800 }}>{client.name}</h5>
            <Badge tone={statusTone(client.status)} dot>{client.status}</Badge>
            {client.feeExempt && <Badge tone="green">100% Fee Exempt</Badge>}
          </div>
          <div style={{ fontSize: ".76rem", color: "var(--pm-muted)" }} className="mt-1">
            <i className="bi bi-telephone me-1" />{client.phone} · <i className="bi bi-envelope ms-1 me-1" />{client.email} · <i className="bi bi-geo-alt ms-1 me-1" />{client.county}
          </div>
          <div className="d-flex gap-2 mt-2 flex-wrap">
            <Badge tone="violet"><i className="bi bi-person-badge me-1" />RM: {client.rm}</Badge>
            <Badge tone="blue"><i className="bi bi-cash-stack me-1" />Credit Line: {kes(client.creditLine, { compact: true })}</Badge>
          </div>
        </div>
        <div className="text-end">
          <div className="pm-eyebrow">VIP Balance</div>
          <div style={{ font: "800 1.4rem Sora", color: "var(--pm-green-dark)" }}>{kes(client.balance, { compact: true })}</div>
        </div>
      </div>

      <div className="row g-2 mb-3">
        <div className="col-6 col-lg-3"><div className="pm-stat"><div className="pm-stat-label">Monthly Volume</div><div className="pm-stat-value" style={{ fontSize: "1.1rem" }}>{kes(client.monthlyVolume, { compact: true })}</div></div></div>
        <div className="col-6 col-lg-3"><div className="pm-stat"><div className="pm-stat-label">Monthly Txns</div><div className="pm-stat-value" style={{ fontSize: "1.1rem" }}>{num(client.monthlyTxns)}</div></div></div>
        <div className="col-6 col-lg-3"><div className="pm-stat"><div className="pm-stat-label">Fee Discount</div><div className="pm-stat-value" style={{ fontSize: "1.1rem", color: "var(--pm-green-dark)" }}>{client.feeDiscountPct}%</div></div></div>
        <div className="col-6 col-lg-3"><div className="pm-stat"><div className="pm-stat-label">Risk Score</div><div className="pm-stat-value" style={{ fontSize: "1.1rem" }}>{client.riskScore}/100</div></div></div>
      </div>

      {/* Perks Card */}
      <div className="pm-card mb-3">
        <div className="pm-card-head"><h6 className="pm-card-title"><i className="bi bi-stars text-warning me-2" />Granted VIP Perks</h6></div>
        <div className="p-3 d-flex flex-wrap gap-2">
          {client.perks.map((p) => (
            <span key={p} className="pm-badge green" style={{ padding: ".4rem .7rem", fontSize: ".8rem" }}>
              <i className="bi bi-check-circle-fill me-1" />{p}
            </span>
          ))}
        </div>
      </div>

      {/* Details & Notes */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-6">
          <div className="pm-card pm-card-pad h-100">
            <div className="pm-eyebrow mb-2">Portfolio Metadata</div>
            <div className="pm-kv"><span className="k">Client ID</span><span className="v mono">{client.id}</span></div>
            <div className="pm-kv"><span className="k">Company</span><span className="v">{client.company ?? "Personal Book"}</span></div>
            <div className="pm-kv"><span className="k">Assigned RM</span><span className="v d-flex align-items-center gap-1">{client.rm} <button className="btn btn-sm btn-link p-0 text-primary ms-1" onClick={() => onAssignRm(client)}>Change</button></span></div>
            <div className="pm-kv"><span className="k">Credit Line Limit</span><span className="v">{kes(client.creditLine)}</span></div>
            <div className="pm-kv"><span className="k">Last Concierge Activity</span><span className="v">{client.lastConcierge}</span></div>
          </div>
        </div>
        <div className="col-12 col-lg-6">
          <div className="pm-card pm-card-pad h-100">
            <div className="pm-eyebrow mb-2">RM Confidential Notes</div>
            <p style={{ fontSize: ".84rem", color: "#344054", lineHeight: 1.5 }}>{client.notes}</p>
            <div className="pm-note mt-2"><i className="bi bi-shield-lock me-1" />Restricted to Tier 0 Super Admin & assigned RM.</div>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="pm-card mb-3">
        <div className="pm-card-head"><h6 className="pm-card-title"><i className="bi bi-credit-card-2-front me-2" />Linked Metal / Premium Cards</h6></div>
        <div className="p-3 d-flex flex-wrap gap-2">
          {client.cards.map((c) => (
            <div key={c} className="p-2 border rounded d-flex align-items-center gap-2" style={{ background: "#f8fafc" }}>
              <i className="bi bi-credit-card-fill text-primary" style={{ fontSize: "1.2rem" }} />
              <span className="mono" style={{ fontWeight: 700, fontSize: ".84rem" }}>{c}</span>
              <Badge tone="green">Active</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Super Admin Quick Controls */}
      <div className="pm-card pm-card-pad">
        <div className="pm-eyebrow mb-2">Super Admin Privileged Controls</div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => onImpersonate(client)}>
            <i className="bi bi-incognito me-1 text-danger" />Impersonate VIP Console
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => onAdjustLimits(client)}>
            <i className="bi bi-sliders me-1" />Override Limits
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => onAssignRm(client)}>
            <i className="bi bi-person-badge me-1" />Reassign Relationship Manager
          </button>
        </div>
      </div>
    </Drawer>
  );
}

/* ============================ 2. Grant / Manage VIP Wizard ============================ */
export function GrantVipWizard({ client, open, onClose, onDone }: {
  client: VipClient | null;
  open: boolean;
  onClose: () => void;
  onDone: (tier: VipTier, rm: string, feeExempt: boolean) => void;
}) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [tier, setTier] = useState<VipTier>(client?.tier ?? "Diamond");
  const [rm, setRm] = useState(client?.rm ?? RELATIONS_MANAGERS[0].name);
  const [feeExempt, setFeeExempt] = useState(client?.feeExempt ?? true);
  const [discount, setDiscount] = useState(client?.feeDiscountPct ?? 60);
  const [code, setCode] = useState("");

  const steps = [
    { label: "Select Tier", icon: "bi-gem" },
    { label: "Assign RM", icon: "bi-person-badge" },
    { label: "Fee & Perks", icon: "bi-percent" },
    { label: "Authorise 2FA", icon: "bi-shield-lock" },
  ];

  if (!open) return null;

  return (
    <Modal open onClose={onClose} size="lg" tone="violet" icon="bi-gem-fill"
      title={`VIP Tier Governance — ${client?.name ?? "Client"}`}
      subtitle="Super Admin power: Upgrade/downgrade VIP tier, assign RM and set fee waivers.">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div className="d-flex flex-column gap-2">
            {(["Black", "Diamond", "Platinum", "Gold"] as VipTier[]).map((t) => {
              const info = TIER_PERKS_MATRIX[t];
              return (
                <button key={t} className={`pm-opt ${tier === t ? "active" : ""}`} onClick={() => setTier(t)}>
                  <span className="r" />
                  <span className="flex-grow-1 text-start">
                    <span className="d-block" style={{ fontWeight: 700, fontSize: ".9rem" }}>{t} Tier</span>
                    <span className="d-block" style={{ fontSize: ".75rem", color: "var(--pm-muted)" }}>
                      Min Balance: KES {num(info.minBalance)} · {info.feeWaiver} · {info.rmType}
                    </span>
                  </span>
                  <Badge tone={tierTone(t)}>{t}</Badge>
                </button>
              );
            })}
          </div>
        )}

        {step === 1 && (
          <div>
            <label className="form-label mb-2">Select Relationship Manager</label>
            <div className="d-flex flex-column gap-2">
              {RELATIONS_MANAGERS.map((m) => (
                <button key={m.id} className={`pm-opt ${rm === m.name ? "active" : ""}`} onClick={() => setRm(m.name)}>
                  <Avatar name={m.name} size="sm" />
                  <span className="flex-grow-1 text-start">
                    <span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>{m.name} ({m.title})</span>
                    <span className="d-block" style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>
                      Book Value: KES {kes(m.totalBookValue, { compact: true })} · Clients: {m.clientsCount} · Score: ⭐ {m.satisfactionScore}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="d-flex flex-column gap-3">
            <label className="pm-opt">
              <input type="checkbox" className="form-check-input mt-0" checked={feeExempt} onChange={(e) => setFeeExempt(e.target.checked)} />
              <span className="flex-grow-1 text-start">
                <span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>100% Full Fee Waiver across all rails</span>
                <span className="d-block" style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>Exempts M-Pesa, Card, PesaLink and FX margins completely.</span>
              </span>
            </label>
            {!feeExempt && (
              <div>
                <label className="form-label">Custom Fee Discount Percentage ({discount}%)</label>
                <input type="range" className="form-range" min={10} max={90} step={5} value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
              </div>
            )}
            <div className="pm-note">
              <i className="bi bi-info-circle me-1" />Tier perks for <b>{tier}</b> will be activated automatically.
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-kv"><span className="k">Target Client</span><span className="v">{client?.name}</span></div>
              <div className="pm-kv"><span className="k">New Tier</span><span className="v"><Badge tone={tierTone(tier)}>{tier}</Badge></span></div>
              <div className="pm-kv"><span className="k">Assigned RM</span><span className="v">{rm}</span></div>
              <div className="pm-kv"><span className="k">Fee Status</span><span className="v">{feeExempt ? "100% Exempt" : `${discount}% Discount`}</span></div>
            </div>
            <TwoFactorField value={code} onChange={setCode} />
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={onClose}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}>Back</button>}
        {step < steps.length - 1 && <button className="btn btn-primary btn-sm" onClick={() => setStep(step + 1)}>Next</button>}
        {step === steps.length - 1 && (
          <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => {
            onDone(tier, rm, feeExempt);
            push({ kind: "success", title: `VIP Tier Updated to ${tier}`, body: `${client?.name} assigned to ${rm}.` });
            onClose();
          }}>Confirm VIP Changes</button>
        )}
      </div>
    </Modal>
  );
}

/* ============================ 3. Revoke VIP Modal ============================ */
export function RevokeVipModal({ client, open, onClose, onDone }: {
  client: VipClient | null;
  open: boolean;
  onClose: () => void;
  onDone: (c: VipClient) => void;
}) {
  const { push } = useToast();
  const [code, setCode] = useState("");
  const [reason, setReason] = useState("");

  if (!open || !client) return null;

  return (
    <Modal open onClose={onClose} size="md" tone="red" icon="bi-shield-x"
      title={`Revoke VIP Status — ${client.name}`}
      subtitle="Danger: Downgrades client to Standard tier and removes concierge & fee exemptions.">
      <div className="pm-modal-body">
        <div className="pm-note mb-3" style={{ background: "#fef2f2", borderColor: "#fbd3cf", color: "#b42318" }}>
          <i className="bi bi-exclamation-triangle-fill me-1" />
          Revoking VIP status will instantly restore standard pricing and remove relationship manager assignment.
        </div>
        <label className="form-label">Revocation Rationale (Required for Audit)</label>
        <textarea className="form-control mb-3" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Volume dropped below Gold minimum for 3 consecutive months." />
        <TwoFactorField value={code} onChange={setCode} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger btn-sm" disabled={code !== "482913" || reason.trim().length < 5} onClick={() => {
          onDone(client);
          push({ kind: "warn", title: `VIP Status Revoked`, body: `${client.name} downgraded to Standard.` });
          onClose();
        }}>Confirm Revocation</button>
      </div>
    </Modal>
  );
}

/* ============================ 4. Adjust VIP Limits & Credit Line Wizard ============================ */
export function AdjustVipLimitsWizard({ client, open, onClose, onDone }: {
  client: VipClient | null;
  open: boolean;
  onClose: () => void;
  onDone: (creditLine: number) => void;
}) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [credit, setCredit] = useState(client?.creditLine ?? 50_000_000);
  const [dailyTxn, setDailyTxn] = useState(500_000_000);
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");

  if (!open || !client) return null;

  const steps = [
    { label: "Configure Limits", icon: "bi-sliders" },
    { label: "Audit Reason", icon: "bi-pencil" },
    { label: "Super 2FA", icon: "bi-shield-lock" },
  ];

  return (
    <Modal open onClose={onClose} size="lg" tone="violet" icon="bi-sliders2"
      title={`VIP Limit & Float Override — ${client.name}`}
      subtitle={`Current Tier: ${client.tier} · Super Admin Limit Overrides`}>
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div className="d-flex flex-column gap-3">
            <div>
              <label className="form-label">Float / Credit Line (KES {kes(credit, { compact: true })})</label>
              <input type="range" className="form-range" min={5_000_000} max={200_000_000} step={5_000_000} value={credit} onChange={(e) => setCredit(Number(e.target.value))} />
            </div>
            <div>
              <label className="form-label">Daily Outbound Transfer Ceiling (KES {kes(dailyTxn, { compact: true })})</label>
              <input type="range" className="form-range" min={50_000_000} max={1_000_000_000} step={25_000_000} value={dailyTxn} onChange={(e) => setDailyTxn(Number(e.target.value))} />
            </div>
            <div className="pm-note">
              <i className="bi bi-shield-check me-1" />Bypasses standard CBK retail limit (KES 500K) under PayMo Corporate BaaS License.
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <label className="form-label">Override Justification (Required)</label>
            <textarea className="form-control" rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explain why this VIP requires extended float or transfer limits..." />
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-kv"><span className="k">Client</span><span className="v">{client.name}</span></div>
              <div className="pm-kv"><span className="k">New Credit Line</span><span className="v">{kes(credit)}</span></div>
              <div className="pm-kv"><span className="k">Daily Transfer Ceiling</span><span className="v">{kes(dailyTxn)}</span></div>
            </div>
            <TwoFactorField value={code} onChange={setCode} />
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={onClose}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}>Back</button>}
        {step < steps.length - 1 && <button className="btn btn-primary btn-sm" disabled={step === 1 && reason.trim().length < 5} onClick={() => setStep(step + 1)}>Next</button>}
        {step === steps.length - 1 && (
          <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => {
            onDone(credit);
            push({ kind: "success", title: "VIP Limits Updated", body: `Credit line set to KES ${kes(credit, { compact: true })}.` });
            onClose();
          }}>Apply Override</button>
        )}
      </div>
    </Modal>
  );
}

/* ============================ 5. Assign Relationship Manager Modal ============================ */
export function AssignRmModal({ client, open, onClose, onDone }: {
  client: VipClient | null;
  open: boolean;
  onClose: () => void;
  onDone: (c: VipClient, newRm: string) => void;
}) {
  const { push } = useToast();
  const [selectedRm, setSelectedRm] = useState(client?.rm ?? RELATIONS_MANAGERS[0].name);

  if (!open || !client) return null;

  return (
    <Modal open onClose={onClose} size="md" tone="blue" icon="bi-person-badge"
      title={`Reassign Relationship Manager — ${client.name}`}
      subtitle={`Current RM: ${client.rm} · Assign dedicated portfolio owner`}>
      <div className="pm-modal-body">
        <div className="d-flex flex-column gap-2 mb-3">
          {RELATIONS_MANAGERS.map((m) => (
            <button key={m.id} className={`pm-opt ${selectedRm === m.name ? "active" : ""}`} onClick={() => setSelectedRm(m.name)}>
              <Avatar name={m.name} size="sm" />
              <span className="flex-grow-1 text-start">
                <span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>{m.name}</span>
                <span className="d-block" style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>
                  {m.title} · Book: KES {kes(m.totalBookValue, { compact: true })} ({m.clientsCount} clients)
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => {
          onDone(client, selectedRm);
          push({ kind: "success", title: "Relationship Manager Reassigned", body: `${client.name} assigned to ${selectedRm}.` });
          onClose();
        }}>Confirm Assignment</button>
      </div>
    </Modal>
  );
}

/* ============================ 6. Fee Exemption Rule Wizard ============================ */
export function FeeExemptionWizard({ client, open, onClose, onDone }: {
  client: VipClient | null;
  open: boolean;
  onClose: () => void;
  onDone: (rule: FeeExemptionRule) => void;
}) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [rail, setRail] = useState<FeeExemptionRule["rail"]>("All Rails");
  const [type, setType] = useState<FeeExemptionRule["discountType"]>("Full Waiver");
  const [value, setValue] = useState(100);
  const [code, setCode] = useState("");

  if (!open || !client) return null;

  const steps = [{ label: "Target Rail", icon: "bi-signpost" }, { label: "Discount %", icon: "bi-percent" }, { label: "2FA", icon: "bi-shield-lock" }];

  return (
    <Modal open onClose={onClose} size="md" tone="green" icon="bi-percent"
      title={`Create Fee Exemption Rule — ${client.name}`}
      subtitle="Super Admin Override: Waive or discount fees for VIP client">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div className="d-flex flex-column gap-2">
            {(["All Rails", "M-Pesa", "Card Acquiring", "PesaLink", "FX Margin"] as const).map((r) => (
              <button key={r} className={`pm-opt ${rail === r ? "active" : ""}`} onClick={() => setRail(r)}>
                <span className="r" /><span style={{ fontWeight: 700, fontSize: ".85rem" }}>{r}</span>
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="d-flex flex-column gap-3">
            <div>
              <label className="form-label">Exemption Type</label>
              <select className="form-select" value={type} onChange={(e) => setType(e.target.value as any)}>
                <option value="Full Waiver">Full Waiver (100% Off)</option>
                <option value="Percentage Discount">Percentage Discount</option>
                <option value="Capped Rate">Capped Flat Rate</option>
              </select>
            </div>
            {type !== "Full Waiver" && (
              <div>
                <label className="form-label">Discount Value ({value}%)</label>
                <input type="range" className="form-range" min={10} max={90} step={5} value={value} onChange={(e) => setValue(Number(e.target.value))} />
              </div>
            )}
          </div>
        )}

        {step === 2 && <TwoFactorField value={code} onChange={setCode} />}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={onClose}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}>Back</button>}
        {step < steps.length - 1 && <button className="btn btn-primary btn-sm" onClick={() => setStep(step + 1)}>Next</button>}
        {step === steps.length - 1 && (
          <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => {
            onDone({
              id: `FER-${Math.floor(410 + Math.random() * 80)}`,
              vipId: client.id,
              vipName: client.name,
              rail,
              discountType: type,
              discountValue: type === "Full Waiver" ? 100 : value,
              expiresAt: "31 Dec 2026",
              approvedBy: "Joseph Mwangi (Super Admin)",
              status: "Active",
            });
            push({ kind: "success", title: "Fee Exemption Rule Activated", body: `${rail} discount for ${client.name}.` });
            onClose();
          }}>Publish Rule</button>
        )}
      </div>
    </Modal>
  );
}

/* ============================ 7. Concierge Request Drawer ============================ */
export function ConciergeDrawer({ req, onClose, onResolve }: {
  req: ConciergeRequest | null;
  onClose: () => void;
  onResolve: (id: string, response: string) => void;
}) {
  const { push } = useToast();
  const [response, setResponse] = useState("");

  if (!req) return null;

  return (
    <Drawer open onClose={onClose} wide icon="bi-headset" tone={req.priority === "Urgent" ? "red" : "violet"}
      title={`Concierge Task ${req.id}`}
      subtitle={`${req.vipName} (${req.tier} Tier) · Category: ${req.category}`}
      headExtra={<Badge tone={priorityTone(req.priority)}>{req.priority}</Badge>}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => push({ kind: "info", title: "Paging RM", body: `Paged ${req.rm} for ${req.vipName}.` })}>
          <i className="bi bi-telephone-outbound me-1" />Page RM
        </button>
        <button className="btn btn-primary btn-sm flex-grow-1" disabled={response.trim().length < 5} onClick={() => {
          onResolve(req.id, response);
          push({ kind: "success", title: "Concierge Task Resolved", body: `Response sent to ${req.vipName}.` });
          onClose();
        }}>
          <i className="bi bi-check2-circle me-1" />Resolve Request
        </button>
      </>}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <Badge tone={tierTone(req.tier)}>{req.tier} VIP</Badge>
          <span style={{ fontSize: ".78rem", color: "var(--pm-muted)" }}><i className="bi bi-clock me-1" />Requested {req.requestedAt}</span>
        </div>
        <h5 style={{ fontWeight: 700, fontSize: "1.05rem" }}>{req.subject}</h5>
        <p style={{ fontSize: ".86rem", color: "#344054", marginTop: ".4rem" }}>{req.detail}</p>
      </div>

      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Client Name</span><span className="v">{req.vipName} ({req.vipId})</span></div>
        <div className="pm-kv"><span className="k">Assigned RM</span><span className="v">{req.rm}</span></div>
        <div className="pm-kv"><span className="k">SLA Remaining</span><span className="v">{req.slaHoursLeft > 0 ? `${req.slaHoursLeft} Hours` : "Breached SLA"}</span></div>
        <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone={req.status === "Resolved" ? "green" : "amber"}>{req.status}</Badge></span></div>
      </div>

      <div className="pm-card pm-card-pad">
        <label className="form-label">Super Admin / RM Response</label>
        <textarea className="form-control mb-2" rows={4} value={response} onChange={(e) => setResponse(e.target.value)} placeholder="Type official response or quote provided to VIP client..." />
        <div className="d-flex gap-1 flex-wrap">
          {["Quote approved @ 128.40 USD/KES", "Corporate cards dispatched via courier", "Float limit temporarily raised", "KRA tax certificate verified"].map((q) => (
            <button key={q} className="pm-chip" onClick={() => setResponse(q)}>{q}</button>
          ))}
        </div>
      </div>
    </Drawer>
  );
}

/* ============================ 8. New Concierge Task Modal ============================ */
export function NewConciergeModal({ open, onClose, onCreate }: {
  open: boolean;
  onClose: () => void;
  onCreate: (req: ConciergeRequest) => void;
}) {
  const { push } = useToast();
  const [vipName, setVipName] = useState("Amina Hassan");
  const [cat, setCat] = useState<ConciergeRequest["category"]>("FX Rates");
  const [subject, setSubject] = useState("");
  const [detail, setDetail] = useState("");
  const [priority, setPriority] = useState<ConciergePriority>("High");

  if (!open) return null;

  return (
    <Modal open onClose={onClose} size="md" tone="violet" icon="bi-plus-circle"
      title="Create VIP Concierge Task" subtitle="Log a high-touch task for Relationship Managers">
      <div className="pm-modal-body">
        <label className="form-label">VIP Client</label>
        <select className="form-select mb-3" value={vipName} onChange={(e) => setVipName(e.target.value)}>
          {["Amina Hassan", "James Mutua", "Brian Otieno", "Naomi Chemtai", "Wanjiru Karanja"].map((n) => <option key={n}>{n}</option>)}
        </select>
        <label className="form-label">Category</label>
        <select className="form-select mb-3" value={cat} onChange={(e) => setCat(e.target.value as any)}>
          {["FX Rates", "Custom Payout", "Card Issuance", "Credit Increase", "Tax Exemption", "General"].map((c) => <option key={c}>{c}</option>)}
        </select>
        <label className="form-label">Priority</label>
        <div className="d-flex gap-2 mb-3">
          {(["Urgent", "High", "Normal"] as ConciergePriority[]).map((p) => (
            <button key={p} className={`pm-chip ${priority === p ? "active" : ""}`} onClick={() => setPriority(p)}>{p}</button>
          ))}
        </div>
        <label className="form-label">Subject</label>
        <input className="form-control mb-3" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Spot FX Rate Quote for $250K" />
        <label className="form-label">Task Details</label>
        <textarea className="form-control" rows={3} value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Full context for RM..." />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={subject.trim().length < 4} onClick={() => {
          onCreate({
            id: `CR-${Math.floor(910 + Math.random() * 80)}`,
            vipId: "VIP-1001",
            vipName,
            tier: "Black",
            rm: "Grace Wanjiru",
            category: cat,
            subject,
            detail,
            priority,
            status: "New",
            requestedAt: "Just now",
            slaHoursLeft: priority === "Urgent" ? 1 : 4,
          });
          push({ kind: "success", title: "Concierge Task Logged", body: `Assigned to RM for ${vipName}.` });
          onClose();
        }}>Create Task</button>
      </div>
    </Modal>
  );
}

/* ============================ 9. Tier Perks Matrix Config Modal ============================ */
export function TierMatrixModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} size="lg" tone="violet" icon="bi-grid-3x3"
      title="VIP Tier Perks & Threshold Matrix" subtitle="Global governance rules for Black, Diamond, Platinum, and Gold tiers">
      <div className="pm-modal-body">
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead>
              <tr>
                <th>Tier</th>
                <th>Min Balance</th>
                <th>Min Monthly Vol</th>
                <th>Fee Waiver</th>
                <th>RM Rota</th>
                <th>Credit Ceiling</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(TIER_PERKS_MATRIX).map(([t, info]) => (
                <tr key={t}>
                  <td><Badge tone={tierTone(t as VipTier)}>{t}</Badge></td>
                  <td className="pm-num">KES {kes(info.minBalance, { compact: true })}</td>
                  <td className="pm-num">KES {kes(info.minVolume, { compact: true })}</td>
                  <td>{info.feeWaiver}</td>
                  <td>{info.rmType}</td>
                  <td className="pm-num">{info.creditLimit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-primary btn-sm" onClick={onClose}>Done</button>
      </div>
    </Modal>
  );
}

/* ============================ 10. Dedicated Credit Line Approval Wizard ============================ */
export function CreditLineWizard({ client, open, onClose, onDone }: {
  client: VipClient | null;
  open: boolean;
  onClose: () => void;
  onDone: (amount: number) => void;
}) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [amount, setAmount] = useState(client?.creditLine ?? 50_000_000);
  const [collateral, setCollateral] = useState("Corporate Treasury Guarantee");
  const [code, setCode] = useState("");

  if (!open || !client) return null;

  const steps = [{ label: "Credit Amount", icon: "bi-cash-stack" }, { label: "Collateral", icon: "bi-shield-check" }, { label: "Super 2FA", icon: "bi-shield-lock" }];

  return (
    <Modal open onClose={onClose} size="md" tone="green" icon="bi-cash-coin"
      title={`Approve Corporate Float Line — ${client.name}`}
      subtitle={`Current Credit Line: KES ${kes(client.creditLine, { compact: true })}`}>
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div>
            <label className="form-label">Float Line Amount (KES {kes(amount, { compact: true })})</label>
            <input type="range" className="form-range" min={10_000_000} max={250_000_000} step={10_000_000} value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          </div>
        )}
        {step === 1 && (
          <div>
            <label className="form-label">Collateral / Security Requirement</label>
            <select className="form-select" value={collateral} onChange={(e) => setCollateral(e.target.value)}>
              <option>Corporate Treasury Guarantee</option>
              <option>Bank Standby Letter of Credit (SBLC)</option>
              <option>Fixed Deposit Sweep Lock</option>
              <option>Personal Director Guarantee</option>
            </select>
          </div>
        )}
        {step === 2 && <TwoFactorField value={code} onChange={setCode} />}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={onClose}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}>Back</button>}
        {step < steps.length - 1 && <button className="btn btn-primary btn-sm" onClick={() => setStep(step + 1)}>Next</button>}
        {step === steps.length - 1 && (
          <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => {
            onDone(amount);
            push({ kind: "success", title: "Float Line Approved", body: `KES ${kes(amount, { compact: true })} for ${client.name}.` });
            onClose();
          }}>Approve Credit Line</button>
        )}
      </div>
    </Modal>
  );
}

/* ============================ 11. Impersonate VIP Modal ============================ */
export function ImpersonateVipModal({ client, open, onClose }: {
  client: VipClient | null;
  open: boolean;
  onClose: () => void;
}) {
  const { push } = useToast();
  const [code, setCode] = useState("");
  const [ack, setAck] = useState(false);

  if (!open || !client) return null;

  return (
    <Modal open onClose={onClose} size="sm" tone="red" icon="bi-incognito"
      title={`Impersonate VIP — ${client.name}`}
      subtitle={`Super Admin Only · 15-Minute Audited Session`}>
      <div className="pm-modal-body">
        <div className="pm-note mb-3" style={{ background: "#fef2f2", borderColor: "#fbd3cf", color: "#b42318" }}>
          <i className="bi bi-exclamation-octagon me-1" />
          You will view the exact portal configuration, float balances and cards of {client.name}.
        </div>
        <label className="pm-opt mb-3">
          <input type="checkbox" className="form-check-input mt-0" checked={ack} onChange={(e) => setAck(e.target.checked)} />
          <span style={{ fontWeight: 700, fontSize: ".82rem" }}>I confirm this is for high-priority VIP support</span>
        </label>
        <TwoFactorField value={code} onChange={setCode} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger btn-sm" disabled={code !== "482913" || !ack} onClick={() => {
          push({ kind: "warn", title: `Impersonating ${client.name}`, body: "Audited 15-min VIP session started." });
          onClose();
        }}>Start Session</button>
      </div>
    </Modal>
  );
}

/* ============================ 12. Export VIP Book Modal ============================ */
export function ExportVipBookModal({ open, onClose, rows }: { open: boolean; onClose: () => void; rows: VipClient[] }) {
  const { push } = useToast();
  const [fmt, setFmt] = useState("csv");

  if (!open) return null;

  return (
    <Modal open onClose={onClose} size="sm" tone="blue" icon="bi-download"
      title={`Export VIP Portfolio Book (${rows.length} Clients)`}
      subtitle="Confidential document — watermarked with admin ID">
      <div className="pm-modal-body">
        <label className="form-label">Export Format</label>
        <div className="d-flex gap-2 mb-3">
          {["csv", "json", "pdf"].map((f) => (
            <button key={f} className={`pm-chip ${fmt === f ? "active" : ""}`} onClick={() => setFmt(f)}>{f.toUpperCase()}</button>
          ))}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => {
          if (fmt === "json") jsonDownload("paymo-vip-book.json", rows);
          else csvDownload("paymo-vip-book.csv", rows as unknown as Record<string, unknown>[]);
          push({ kind: "success", title: "VIP Book Exported", body: `${rows.length} VIP client records downloaded.` });
          onClose();
        }}>Download</button>
      </div>
    </Modal>
  );
}

/* ============================ 13. VIP Audit Trail Drawer ============================ */
export function VipAuditDrawer({ open, onClose, auditTrail }: { open: boolean; onClose: () => void; auditTrail: VipAuditEvent[] }) {
  return (
    <Drawer open={open} onClose={onClose} icon="bi-clock-history" tone="blue"
      title="VIP Governance Audit Trail" subtitle="Immutable log of all VIP tier changes, fee waivers and limit overrides">
      <div className="d-flex flex-column gap-2">
        {auditTrail.map((a) => (
          <div key={a.id} className="pm-alert-row info">
            <i className="bi bi-shield-check text-primary" style={{ fontSize: "1.1rem" }} />
            <div className="flex-grow-1">
              <div style={{ fontWeight: 700, fontSize: ".84rem" }}>{a.action} — <span className="text-primary">{a.vipName}</span></div>
              <div style={{ fontSize: ".74rem", color: "var(--pm-muted)" }}>{a.details}</div>
              <div className="d-flex gap-2 mt-1">
                <Badge tone="grey">{a.admin}</Badge>
                <span style={{ fontSize: ".7rem", color: "var(--pm-muted)" }}>{a.time} · {a.id}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 14. Bulk VIP Actions Modal ============================ */
export function BulkVipModal({ open, count, onClose, onDone }: { open: boolean; count: number; onClose: () => void; onDone: (act: string) => void }) {
  const { push } = useToast();
  const [act, setAct] = useState("fee-waiver");

  if (!open) return null;

  return (
    <Modal open onClose={onClose} size="sm" tone="violet" icon="bi-lightning-charge"
      title={`Bulk Action on ${count} VIP Clients`} subtitle="Batch governance operations">
      <div className="pm-modal-body">
        <label className="form-label">Action</label>
        <select className="form-select mb-3" value={act} onChange={(e) => setAct(e.target.value)}>
          <option value="fee-waiver">Apply 100% Fee Waiver</option>
          <option value="assign-rm">Reassign to Grace Wanjiru</option>
          <option value="upgrade-diamond">Upgrade to Diamond Tier</option>
          <option value="lounge-pass">Issue Airport Lounge Pass</option>
        </select>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => {
          onDone(act);
          push({ kind: "success", title: `Bulk Action Applied`, body: `Applied ${act} to ${count} VIP clients.` });
          onClose();
        }}>Apply to {count} Clients</button>
      </div>
    </Modal>
  );
}

/* ============================ 15. Advanced VIP Filter Drawer ============================ */
export interface VipFilters {
  tier: string;
  status: string;
  rm: string;
  county: string;
  feeExemptOnly: boolean;
  minBalance: number;
}
export const EMPTY_VIP_FILTERS: VipFilters = { tier: "all", status: "all", rm: "all", county: "all", feeExemptOnly: false, minBalance: 0 };

export function VipFilterDrawer({ open, filters, onClose, onApply }: {
  open: boolean;
  filters: VipFilters;
  onClose: () => void;
  onApply: (f: VipFilters) => void;
}) {
  const [f, setF] = useState<VipFilters>(filters);

  if (!open) return null;

  return (
    <Drawer open onClose={onClose} icon="bi-funnel" tone="blue" title="Advanced VIP Filters" subtitle="Segment by tier, RM, balance and fee status"
      footer={<>
        <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => { setF(EMPTY_VIP_FILTERS); onApply(EMPTY_VIP_FILTERS); }}>Clear All</button>
        <button className="btn btn-primary btn-sm" onClick={() => { onApply(f); onClose(); }}>Apply Filters</button>
      </>}>
      <div className="d-flex flex-column gap-3">
        <div>
          <label className="form-label">VIP Tier</label>
          <select className="form-select" value={f.tier} onChange={(e) => setF({ ...f, tier: e.target.value })}>
            <option value="all">All Tiers</option>
            <option value="Black">Black Tier</option>
            <option value="Diamond">Diamond Tier</option>
            <option value="Platinum">Platinum Tier</option>
            <option value="Gold">Gold Tier</option>
          </select>
        </div>
        <div>
          <label className="form-label">Status</label>
          <select className="form-select" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Under Review">Under Review</option>
          </select>
        </div>
        <div>
          <label className="form-label">Relationship Manager</label>
          <select className="form-select" value={f.rm} onChange={(e) => setF({ ...f, rm: e.target.value })}>
            <option value="all">All RMs</option>
            {RELATIONS_MANAGERS.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
          </select>
        </div>
        <label className="pm-opt">
          <input type="checkbox" className="form-check-input mt-0" checked={f.feeExemptOnly} onChange={(e) => setF({ ...f, feeExemptOnly: e.target.checked })} />
          <span style={{ fontWeight: 700, fontSize: ".85rem" }}>100% Fee Exempt Clients Only</span>
        </label>
      </div>
    </Drawer>
  );
}
