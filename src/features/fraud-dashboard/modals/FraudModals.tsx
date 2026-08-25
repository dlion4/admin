import { useState } from "react";
import { Badge, Drawer, EmptyState, Modal, Steps, useToast } from "../../../components/ui";
import { AuthorityPanel } from "../../../components/AuthorityPanel";
import { kes, num } from "../../../lib/format";
import type { BlacklistEntry, FraudAlert, FraudRule } from "../data/fraudData";

/* ================================================================
   1. Alert drawer – comprehensive restyle
   ================================================================ */
export function AlertDrawer({ alert, onClose, onAssign, onBlock, onResolve, onTimeline, onDevice, onAccounts, onEvidence, onContact, onEscalate, onSar }: {
  alert: FraudAlert | null; onClose: () => void; onAssign: (a: FraudAlert) => void;
  onBlock: (a: FraudAlert) => void; onResolve: (a: FraudAlert) => void;
  onTimeline: (a: FraudAlert) => void; onDevice: (a: FraudAlert) => void;
  onAccounts: (a: FraudAlert) => void; onEvidence: (a: FraudAlert) => void;
  onContact: (a: FraudAlert) => void; onEscalate: (a: FraudAlert) => void;
  onSar: (a: FraudAlert) => void;
}) {
  return (
    <Drawer open={!!alert} onClose={onClose}
      icon="bi-shield-exclamation" tone="red" half
      title={alert ? `${alert.id} · ${alert.type}` : "Alert"}
      subtitle="Live evidence and decision record"
      footer={alert && (
        <div className="d-flex gap-2 w-100">
          <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => onAssign(alert)}>
            <i className="bi bi-person-plus me-1" />Assign
          </button>
          <button className="btn btn-outline-danger btn-sm flex-grow-1" onClick={() => onBlock(alert)}>
            <i className="bi bi-slash-circle me-1" />Block
          </button>
          <button className="btn btn-primary btn-sm flex-grow-1" onClick={() => onResolve(alert)}>
            <i className="bi bi-check2-circle me-1" />Resolve
          </button>
        </div>
      )}>
      {alert && (
        <div>
          {/* Authority panel */}
          <div className="d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap">
            <AuthorityPanel area="Fraud response" auditRef="AUD-FRD-88232"
              permissions={["Place and release transaction holds", "Freeze or blacklist customers",
                "Reassign investigations", "Export redacted evidence"]} />
            <Badge tone="ink"><i className="bi bi-journal-check" /> Audit retained</Badge>
          </div>

          {/* Risk score card */}
          <div className="pm-card pm-card-pad mb-3" style={{ background: alert.risk >= 80 ? "#fef2f2" : "#fff5e6", borderLeft: `3px solid ${alert.risk >= 80 ? "#f04438" : "#f79009"}` }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="pm-eyebrow mb-1" style={{ fontSize: ".62rem" }}>RISK SCORE</span>
                <div className="d-flex align-items-baseline gap-2">
                  <span style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1.8rem", color: alert.risk >= 80 ? "#b42318" : "#b54708" }}>
                    {alert.risk}
                  </span>
                  <span className="pm-td-sub mono">/ 100</span>
                </div>
              </div>
              <Badge tone={alert.risk >= 80 ? "red" : "amber"}>
                {alert.risk >= 80 ? "Critical review" : "Elevated review"}
              </Badge>
            </div>
          </div>

          {/* Customer & transaction details */}
          <div className="pm-card pm-card-pad mb-3">
            <div className="pm-kv"><span className="k">Customer</span><span className="v">{alert.user}</span></div>
            <div className="pm-kv"><span className="k">User ID</span><span className="v mono">{alert.userId}</span></div>
            <div className="pm-kv"><span className="k">Value at risk</span><span className="v mono" style={{ fontWeight: 700 }}>{kes(alert.amount)}</span></div>
            <div className="pm-kv"><span className="k">Channel</span><span className="v">{alert.channel}</span></div>
            <div className="pm-kv"><span className="k">Device</span><span className="v mono">{alert.device}</span></div>
            <div className="pm-kv"><span className="k">IP Address</span><span className="v mono">{alert.ip}</span></div>
            <div className="pm-kv"><span className="k">Account age</span><span className="v">{alert.ageDays} days</span></div>
            <div className="pm-kv"><span className="k">KYC status</span><span className="v">{alert.kyc}</span></div>
          </div>

          {/* Why this fired */}
          <div className="pm-eyebrow mb-2">Why this fired</div>
          <div className="d-flex flex-wrap gap-2 mb-3">
            {alert.factors.map(x => (
              <Badge key={x} tone="amber"><i className="bi bi-exclamation-circle me-1" />{x}</Badge>
            ))}
          </div>

          {/* Decision trail */}
          <div className="pm-eyebrow mb-2">Decision trail</div>
          <div className="mb-3">
            <div className="pm-alert-row mb-2" style={{ borderLeftColor: "#5925dc" }}>
              <div className="flex-grow-1">
                <div className="mono" style={{ fontWeight: 700, fontSize: ".72rem", color: "#5925dc" }}>{alert.time}</div>
                <div className="pm-td-sub">Rule engine created the alert from {alert.type.toLowerCase()}.</div>
              </div>
            </div>
            <div className="pm-alert-row mb-2" style={{ borderLeftColor: "#175cd3" }}>
              <div className="flex-grow-1">
                <div className="mono" style={{ fontWeight: 700, fontSize: ".72rem", color: "#175cd3" }}>14:33</div>
                <div className="pm-td-sub">Transaction hold is active for 30 minutes while reviewed.</div>
              </div>
            </div>
            <div className="pm-alert-row mb-2" style={{ borderLeftColor: "#f79009" }}>
              <div className="flex-grow-1">
                <div className="mono" style={{ fontWeight: 700, fontSize: ".72rem", color: "#f79009" }}>Now</div>
                <div className="pm-td-sub">Awaiting investigator action · SLA {alert.slaH ? `${alert.slaH}h remaining` : "completed"}.</div>
              </div>
            </div>
          </div>

          {/* Investigation workspace */}
          <div className="pm-card mb-3" style={{ background: "#fafbfe", border: "1px solid var(--pm-border)" }}>
            <div className="pm-card-pad">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <div style={{ fontWeight: 700, fontSize: ".82rem" }}>Investigation workspace</div>
                  <div className="pm-td-sub">Evidence is sealed when a case action is taken.</div>
                </div>
                <Badge tone="violet">Case-ready</Badge>
              </div>
              <div className="d-flex flex-column gap-2">
                <button className="pm-alert-row text-start" style={{ borderLeftColor: "#5925dc" }} onClick={() => onTimeline(alert)}>
                  <i className="bi bi-clock-history" style={{ color: "#5925dc", fontSize: ".9rem" }} />
                  <div className="flex-grow-1">
                    <div style={{ fontWeight: 700, fontSize: ".78rem" }}>User timeline</div>
                    <div className="pm-td-sub">24h activity trail</div>
                  </div>
                </button>
                <button className="pm-alert-row text-start" style={{ borderLeftColor: "#5925dc" }} onClick={() => onDevice(alert)}>
                  <i className="bi bi-pc-display" style={{ color: "#5925dc", fontSize: ".9rem" }} />
                  <div className="flex-grow-1">
                    <div style={{ fontWeight: 700, fontSize: ".78rem" }}>Device fingerprint</div>
                    <div className="pm-td-sub">IP, browser, geo & hash</div>
                  </div>
                </button>
                <button className="pm-alert-row text-start" style={{ borderLeftColor: "#5925dc" }} onClick={() => onAccounts(alert)}>
                  <i className="bi bi-diagram-3" style={{ color: "#5925dc", fontSize: ".9rem" }} />
                  <div className="flex-grow-1">
                    <div style={{ fontWeight: 700, fontSize: ".78rem" }}>Related accounts</div>
                    <div className="pm-td-sub">4 network connections</div>
                  </div>
                </button>
                <button className="pm-alert-row text-start" style={{ borderLeftColor: "#5925dc" }} onClick={() => onEvidence(alert)}>
                  <i className="bi bi-safe2" style={{ color: "#5925dc", fontSize: ".9rem" }} />
                  <div className="flex-grow-1">
                    <div style={{ fontWeight: 700, fontSize: ".78rem" }}>Evidence locker</div>
                    <div className="pm-td-sub">9 retained artifacts</div>
                  </div>
                </button>
              </div>
              <div className="d-flex gap-2 flex-wrap mt-3">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => onContact(alert)}>
                  <i className="bi bi-telephone-outbound me-1" />Contact customer
                </button>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => onEscalate(alert)}>
                  <i className="bi bi-bank me-1" />Escalate
                </button>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => onSar(alert)}>
                  <i className="bi bi-file-earmark-text me-1" />Draft SAR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}

/* ================================================================
   2. Assign modal
   ================================================================ */
export function AssignModal({ alert, onClose, onSubmit }: {
  alert: FraudAlert | null; onClose: () => void; onSubmit: (name: string) => void;
}) {
  const [name, setName] = useState("Sarah K.");
  return (
    <Modal open={!!alert} onClose={onClose} tone="blue" icon="bi-person-plus" size="sm"
      title="Assign investigation" subtitle={alert ? `${alert.id} · ${alert.user}` : ""}>
      <div className="pm-modal-body">
        <label className="form-label">Investigator</label>
        <select className="form-select mb-3" value={name} onChange={e => setName(e.target.value)}>
          <option>Sarah K.</option>
          <option>James O.</option>
          <option>David K.</option>
          <option>Grace M.</option>
        </select>
        <div className="pm-note">
          <i className="bi bi-info-circle me-1" />
          Assignment creates an immutable audit event and starts the 4-hour review SLA.
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => onSubmit(name)}>Assign case</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   3. Block modal
   ================================================================ */
export function BlockModal({ alert, onClose, onConfirm }: {
  alert: FraudAlert | null; onClose: () => void; onConfirm: () => void;
}) {
  return (
    <Modal open={!!alert} onClose={onClose} tone="red" icon="bi-slash-octagon" size="sm"
      title="Block suspicious activity" subtitle="A privileged action with immediate customer impact">
      <div className="pm-modal-body">
        <div className="pm-note mb-3" style={{ borderColor: "#f04438" }}>
          <i className="bi bi-exclamation-triangle me-1" style={{ color: "#f04438" }} />
          <b>What happens next:</b> outgoing transfers and withdrawals are stopped for this customer. Existing authorisations remain preserved as evidence.
        </div>
        <label className="form-label">Reason for block <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control mb-3" rows={3}
          defaultValue={`Fraud control applied for ${alert?.id}; investigator review required before release.`} />
        <div className="form-check">
          <input className="form-check-input" id="notify" type="checkbox" defaultChecked />
          <label className="form-check-label" htmlFor="notify" style={{ fontSize: ".8rem" }}>Notify the fraud response channel</label>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Keep monitoring</button>
        <button className="btn btn-danger btn-sm" onClick={onConfirm}>Block & log action</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   4. Rule control modal
   ================================================================ */
export function RuleModal({ rule, onClose, onSave }: {
  rule: FraudRule | null; onClose: () => void; onSave: (active: boolean) => void;
}) {
  const [active, setActive] = useState(rule?.active ?? true);
  return (
    <Modal open={!!rule} onClose={onClose} tone="violet" icon="bi-sliders" size="sm"
      title="Rule control" subtitle={rule ? `${rule.id} · last tuned ${rule.lastTuned}` : ""}>
      <div className="pm-modal-body">
        <AuthorityPanel area="Fraud rule production control" auditRef="AUD-RULE-75102"
          permissions={["Tune thresholds", "Pause production rules", "Set enforcement severity", "Approve rule overrides"]} />
        {rule && (
          <>
            <div className="pm-card pm-card-pad mb-3" style={{ background: "#f4f1ff", border: "1px solid #ded4ff" }}>
              <div style={{ fontWeight: 700, fontSize: ".82rem" }}>{rule.name}</div>
              <div className="pm-td-sub mt-1">{rule.trigger}</div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="form-label">Severity</label>
                <select className="form-select" defaultValue={rule.severity}>
                  <option>Critical</option>
                  <option>High</option>
                  <option>Medium</option>
                </select>
              </div>
              <div className="col-6">
                <label className="form-label">False positive rate</label>
                <input className="form-control" defaultValue={`${rule.fpRate}%`} />
              </div>
            </div>
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" checked={active}
                onChange={e => setActive(e.target.checked)} id="activeRule" />
              <label className="form-check-label" htmlFor="activeRule" style={{ fontSize: ".8rem" }}>
                Rule is active in production
              </label>
            </div>
          </>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => onSave(active)}>Save control</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   5. Blacklist entry modal
   ================================================================ */
export function BlacklistModal({ onClose, onAdd }: { onClose: () => void; onAdd: (v: string) => void }) {
  const [step, setStep] = useState(0);
  const [value, setValue] = useState("");
  return (
    <Modal open={true} onClose={onClose} tone="red" icon="bi-slash-circle" size="sm"
      title="Add blacklist entry" subtitle="Manual entries require a reason and remain fully auditable">
      <div className="pm-modal-body">
        <AuthorityPanel area="Blacklist management" auditRef="AUD-BL-42019"
          permissions={["Add and remove identifiers", "Block device, IP and payment instruments",
            "Override automated block decisions", "Export watchlist evidence"]} />
        <div className="mb-3">
          <Steps current={step} steps={[
            { label: "Entity", icon: "bi-fingerprint" },
            { label: "Evidence", icon: "bi-paperclip" },
            { label: "Confirm", icon: "bi-check2-circle" },
          ]} />
        </div>
        {step === 0 && (
          <div>
            <label className="form-label">Entity type</label>
            <select className="form-select mb-3">
              <option>Device fingerprint</option>
              <option>IP address</option>
              <option>Phone number</option>
              <option>National ID</option>
            </select>
            <label className="form-label">Value <span style={{ color: "#f04438" }}>*</span></label>
            <input className="form-control" value={value} onChange={e => setValue(e.target.value)} placeholder="Enter the identifier" />
          </div>
        )}
        {step === 1 && (
          <div>
            <label className="form-label">Evidence and reason <span style={{ color: "#f04438" }}>*</span></label>
            <textarea className="form-control mb-3" rows={4}
              defaultValue="Linked to fraud investigation and reviewed by Fraud Operations." />
            <div className="pm-note" style={{ borderColor: "#f79009" }}>
              <i className="bi bi-info-circle me-1" />
              Attach evidence in the case record after saving this entry.
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="pm-note" style={{ borderColor: "#f04438", background: "#fef2f2" }}>
            <i className="bi bi-exclamation-triangle me-1" style={{ color: "#f04438" }} />
            <b>Final confirmation</b><br />
            This entity will be blocked across PayMo channels immediately. A record will be sent to the audit log.
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}>Back</button>}
        <div className="flex-grow-1" />
        <button className="btn btn-primary btn-sm" onClick={() => step < 2 ? setStep(step + 1) : onAdd(value)}>
          {step === 2 ? "Confirm entry" : "Continue"}
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   6. Blacklist entry detail drawer
   ================================================================ */
export function EntryDrawer({ entry, onClose, onRemove }: {
  entry: BlacklistEntry | null; onClose: () => void; onRemove: (e: BlacklistEntry) => void;
}) {
  return (
    <Drawer open={!!entry} onClose={onClose}
      icon="bi-fingerprint" tone="red" half
      title="Blacklist entry" subtitle={entry?.id}
      footer={entry && (
        <div className="d-flex gap-2 w-100">
          <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={onClose}>Close</button>
          <button className="btn btn-outline-danger btn-sm flex-grow-1" onClick={() => onRemove(entry)}>Remove entry</button>
        </div>
      )}>
      {entry && (
        <div>
          <div className="pm-card pm-card-pad mb-3">
            <div className="pm-kv"><span className="k">Entity</span><span className="v mono">{entry.value}</span></div>
            <div className="pm-kv"><span className="k">Type</span><span className="v">{entry.type}</span></div>
            <div className="pm-kv"><span className="k">Detection hits</span><span className="v mono">{entry.hits}</span></div>
            <div className="pm-kv"><span className="k">Added</span><span className="v mono">{entry.added}</span></div>
            <div className="pm-kv"><span className="k">Added by</span><span className="v">{entry.addedBy}</span></div>
            <div className="pm-kv"><span className="k">Reason</span><span className="v">{entry.reason}</span></div>
          </div>
          <div className="pm-note">
            <i className="bi bi-info-circle me-1" />
            Removal restores eligibility but does not erase the retained investigation evidence.
          </div>
        </div>
      )}
    </Drawer>
  );
}

/* ================================================================
   7. User Timeline Modal
   ================================================================ */
export function UserTimelineModal({ alert, onClose }: { alert: FraudAlert | null; onClose: () => void }) {
  if (!alert) return null;
  const timeline = [
    { time: "14:32", event: "Withdrawal attempt KES 120,000 via M-Pesa", type: "transaction", icon: "bi-arrow-up-right", color: "#f04438" },
    { time: "14:30", event: "Login from new device Chrome/Android", type: "login", icon: "bi-box-arrow-in-right", color: "#f79009" },
    { time: "14:28", event: "Profile update — phone number changed", type: "profile", icon: "bi-pencil", color: "#175cd3" },
    { time: "14:25", event: "Deposit KES 50,000 via bank transfer", type: "transaction", icon: "bi-arrow-down-left", color: "#12b76a" },
    { time: "14:20", event: "Login from IP 102.x (Kisumu)", type: "login", icon: "bi-box-arrow-in-right", color: "#175cd3" },
    { time: "14:15", event: "KYC document upload — national ID", type: "kyc", icon: "bi-file-earmark-check", color: "#12b76a" },
    { time: "14:10", event: "Account created via agent channel", type: "account", icon: "bi-person-plus", color: "#5925dc" },
  ];
  return (
    <Modal open={!!alert} onClose={onClose} tone="blue" icon="bi-clock-history" size="md"
      title="24-hour user timeline" subtitle={`${alert.user} · ${alert.userId}`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Total events</span><span className="v">{timeline.length}</span></div>
          <div className="pm-kv"><span className="k">Transactions</span><span className="v">2</span></div>
          <div className="pm-kv"><span className="k">Logins</span><span className="v">2</span></div>
          <div className="pm-kv"><span className="k">Profile changes</span><span className="v">1</span></div>
        </div>
        <div className="pm-eyebrow mb-2">Activity log</div>
        {timeline.map((item, i) => (
          <div key={i} className="pm-alert-row mb-2" style={{ borderLeftColor: item.color }}>
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2 mb-1">
                <i className={`bi ${item.icon}`} style={{ color: item.color, fontSize: ".8rem" }} />
                <span className="mono" style={{ fontWeight: 700, fontSize: ".72rem", color: item.color }}>{item.time}</span>
              </div>
              <div style={{ fontSize: ".78rem" }}>{item.event}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={onClose}>Close</button>
        <button className="btn btn-outline-secondary btn-sm"><i className="bi bi-download me-1" />Export</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   8. Device Fingerprint Modal
   ================================================================ */
export function DeviceFingerprintModal({ alert, onClose }: { alert: FraudAlert | null; onClose: () => void }) {
  if (!alert) return null;
  return (
    <Modal open={!!alert} onClose={onClose} tone="violet" icon="bi-pc-display" size="md"
      title="Device fingerprint evidence" subtitle={`${alert.device} · ${alert.ip}`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Device hash</span><span className="v mono">{alert.device}</span></div>
          <div className="pm-kv"><span className="k">IP address</span><span className="v mono">{alert.ip}</span></div>
          <div className="pm-kv"><span className="k">Location</span><span className="v">Kisumu, Kenya</span></div>
          <div className="pm-kv"><span className="k">ASN</span><span className="v mono">AS33771 - Safaricom</span></div>
          <div className="pm-kv"><span className="k">Browser</span><span className="v">Chrome 120.0 on Android 14</span></div>
          <div className="pm-kv"><span className="k">Screen</span><span className="v">1080 × 2400 (420 dpi)</span></div>
          <div className="pm-kv"><span className="k">First seen</span><span className="v mono">2026-08-22 14:30</span></div>
          <div className="pm-kv"><span className="k">Total sessions</span><span className="v">3</span></div>
        </div>
        <div className="pm-eyebrow mb-2">Associated accounts</div>
        <div className="pm-alert-row mb-2" style={{ borderLeftColor: "#f04438" }}>
          <div className="flex-grow-1">
            <div style={{ fontWeight: 700, fontSize: ".78rem" }}>PAY-55667 · Dennis Mutua</div>
            <div className="pm-td-sub">Primary account · 3 sessions in 24h</div>
          </div>
          <Badge tone="red">Flagged</Badge>
        </div>
        <div className="pm-alert-row mb-2" style={{ borderLeftColor: "#f79009" }}>
          <div className="flex-grow-1">
            <div style={{ fontWeight: 700, fontSize: ".78rem" }}>PAY-67891 · Grace Wanjiku</div>
            <div className="pm-td-sub">Shared device · 1 session</div>
          </div>
          <Badge tone="amber">Review</Badge>
        </div>
        <div className="pm-note">
          <i className="bi bi-info-circle me-1" />
          Device fingerprint is derived from browser fingerprinting, IP geolocation and behavioral biometrics.
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   9. Related Accounts Modal
   ================================================================ */
export function RelatedAccountsModal({ alert, onClose }: { alert: FraudAlert | null; onClose: () => void }) {
  if (!alert) return null;
  const accounts = [
    { id: "PAY-55667", name: "Dennis Mutua", relationship: "Primary", risk: 87, amount: "KES 120,000", status: "Flagged" },
    { id: "PAY-67891", name: "Grace Wanjiku", relationship: "Shared device", risk: 45, amount: "KES 30,000", status: "Monitoring" },
    { id: "PAY-89012", name: "Amina Hassan", relationship: "Beneficiary", risk: 72, amount: "KES 50,000", status: "Under review" },
    { id: "PAY-45123", name: "Collins Kariuki", relationship: "Shared IP", risk: 38, amount: "KES 15,000", status: "Clear" },
  ];
  return (
    <Modal open={!!alert} onClose={onClose} tone="amber" icon="bi-diagram-3" size="md"
      title="Related accounts network" subtitle="4 network connections identified">
      <div className="pm-modal-body">
        <div className="pm-eyebrow mb-2">Network graph</div>
        <div className="pm-card pm-card-pad mb-3" style={{ background: "#fafbfe", textAlign: "center", padding: "2rem" }}>
          <div style={{ fontSize: ".78rem", color: "var(--pm-muted)" }}>
            <i className="bi bi-diagram-3" style={{ fontSize: "2rem", color: "#5925dc" }} /><br />
            Network visualization with shared IP, device and payment relationships
          </div>
        </div>
        <div className="pm-eyebrow mb-2">Connected accounts</div>
        {accounts.map((acc, i) => (
          <div key={i} className="pm-alert-row mb-2" style={{ borderLeftColor: acc.risk >= 70 ? "#f04438" : acc.risk >= 50 ? "#f79009" : "#12b76a" }}>
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2 mb-1">
                <span style={{ fontWeight: 700, fontSize: ".78rem" }}>{acc.name}</span>
                <span className="mono pm-td-sub">{acc.id}</span>
              </div>
              <div className="pm-td-sub">{acc.relationship} · {acc.amount}</div>
            </div>
            <div className="text-end">
              <Badge tone={acc.risk >= 70 ? "red" : acc.risk >= 50 ? "amber" : "green"}>{acc.status}</Badge>
              <div className="pm-td-sub mt-1">Risk: {acc.risk}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-primary btn-sm"><i className="bi bi-download me-1" />Export network</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   10. Evidence Locker Modal
   ================================================================ */
export function EvidenceLockerModal({ alert, onClose }: { alert: FraudAlert | null; onClose: () => void }) {
  if (!alert) return null;
  const artifacts = [
    { id: "EVD-001", type: "Transaction log", name: "withdrawal_attempt.json", size: "24 KB", hash: "a1b2c3d4", status: "Sealed" },
    { id: "EVD-002", type: "KYC snapshot", name: "kyc_profile_55667.pdf", size: "1.2 MB", hash: "e5f6g7h8", status: "Sealed" },
    { id: "EVD-003", type: "Device fingerprint", name: "device_chrome_android.json", size: "8 KB", hash: "i9j0k1l2", status: "Sealed" },
    { id: "EVD-004", type: "API events", name: "api_events_1430.json", size: "45 KB", hash: "m3n4o5p6", status: "Sealed" },
    { id: "EVD-005", type: "Login logs", name: "session_logs.json", size: "12 KB", hash: "q7r8s9t0", status: "Sealed" },
    { id: "EVD-006", type: "IP geolocation", name: "geo_ip_102x.json", size: "3 KB", hash: "u1v2w3x4", status: "Sealed" },
    { id: "EVD-007", type: "Chat logs", name: "support_chat_2208.json", size: "18 KB", hash: "y5z6a7b8", status: "Sealed" },
    { id: "EVD-008", type: "Email logs", name: "notification_events.json", size: "6 KB", hash: "c9d0e1f2", status: "Sealed" },
    { id: "EVD-009", type: "SMS logs", name: "sms_verifications.json", size: "4 KB", hash: "g3h4i5j6", status: "Sealed" },
  ];
  return (
    <Modal open={!!alert} onClose={onClose} tone="violet" icon="bi-safe2" size="lg"
      title="Evidence locker" subtitle={`${artifacts.length} retained artifacts · cryptographically sealed`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Case reference</span><span className="v mono">{alert.id}</span></div>
          <div className="pm-kv"><span className="k">Sealed at</span><span className="v mono">2026-08-22 14:35 UTC</span></div>
          <div className="pm-kv"><span className="k">Integrity</span><span className="v"><Badge tone="green" dot>Verified</Badge></span></div>
        </div>
        <div className="pm-eyebrow mb-2">Artifacts</div>
        {artifacts.map((art, i) => (
          <div key={i} className="pm-alert-row mb-2" style={{ borderLeftColor: "#5925dc" }}>
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2 mb-1">
                <i className="bi bi-file-earmark" style={{ color: "#5925dc" }} />
                <span style={{ fontWeight: 700, fontSize: ".78rem" }}>{art.name}</span>
              </div>
              <div className="pm-td-sub">{art.type} · {art.size}</div>
              <div className="pm-td-sub mono">SHA-256: {art.hash}...</div>
            </div>
            <Badge tone="green">{art.status}</Badge>
          </div>
        ))}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-outline-secondary btn-sm"><i className="bi bi-download me-1" />Export all</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   11. Contact Customer Modal
   ================================================================ */
export function ContactCustomerModal({ alert, onClose, onSend }: {
  alert: FraudAlert | null; onClose: () => void; onSend: () => void;
}) {
  const [channel, setChannel] = useState("sms");
  const [message, setMessage] = useState("");
  if (!alert) return null;
  return (
    <Modal open={!!alert} onClose={onClose} tone="amber" icon="bi-telephone-outbound" size="sm"
      title="Contact customer" subtitle={`${alert.user} · ${alert.userId}`}>
      <div className="pm-modal-body">
        <label className="form-label">Contact channel</label>
        <select className="form-select mb-3" value={channel} onChange={e => setChannel(e.target.value)}>
          <option value="sms">SMS (+254 7XX XXX 448)</option>
          <option value="email">Email (d***@gmail.com)</option>
          <option value="call">Outbound call</option>
          <option value="push">Push notification</option>
        </select>
        <label className="form-label">Message template</label>
        <textarea className="form-control mb-3" rows={4} value={message} onChange={e => setMessage(e.target.value)}
          placeholder="Select a channel to load a template..." />
        <div className="pm-note">
          <i className="bi bi-shield-lock me-1" />
          All customer contact is logged and reviewed by Compliance. Do not disclose investigation details.
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={!message} onClick={onSend}>
          <i className="bi bi-send me-1" />Send contact
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   12. Escalate to Law Enforcement Modal
   ================================================================ */
export function EscalateModal({ alert, onClose, onSubmit }: {
  alert: FraudAlert | null; onClose: () => void; onSubmit: () => void;
}) {
  const [agency, setAgency] = useState("FRA");
  const [reason, setReason] = useState("");
  if (!alert) return null;
  return (
    <Modal open={!!alert} onClose={onClose} tone="red" icon="bi-bank" size="md"
      title="Escalate to law enforcement" subtitle="Regulatory referral requiring Super Admin approval">
      <div className="pm-modal-body">
        <AuthorityPanel area="Law enforcement escalation" auditRef="AUD-ESC-90102"
          permissions={["Draft regulatory referrals", "Request DCI coordination",
            "Submit FRA reports", "Manage evidence packages"]} />
        <label className="form-label">Escalation agency</label>
        <select className="form-select mb-3" value={agency} onChange={e => setAgency(e.target.value)}>
          <option value="FRA">Financial Reporting Authority (FRA)</option>
          <option value="DCI">Directorate of Criminal Investigations (DCI)</option>
          <option value="CBK">Central Bank of Kenya (CBK)</option>
          <option value="ODPC">Office of the Data Protection Commissioner</option>
        </select>
        <label className="form-label">Referral reason <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control mb-3" rows={3} value={reason} onChange={e => setReason(e.target.value)}
          placeholder="Describe the basis for escalation..." />
        <div className="pm-note mb-3">
          <i className="bi bi-info-circle me-1" />
          The referral package includes transaction logs, KYC evidence, device fingerprints and this case record.
        </div>
        <div className="pm-card pm-card-pad">
          <div className="pm-kv"><span className="k">Case</span><span className="v">{alert.id}</span></div>
          <div className="pm-kv"><span className="k">Subject</span><span className="v">{alert.user}</span></div>
          <div className="pm-kv"><span className="k">Amount</span><span className="v mono">{kes(alert.amount)}</span></div>
          <div className="pm-kv"><span className="k">Evidence artifacts</span><span className="v">9 sealed</span></div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger btn-sm" disabled={!reason || reason.length < 10} onClick={onSubmit}>
          <i className="bi bi-send me-1" />Submit referral
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   13. Draft SAR Modal
   ================================================================ */
export function DraftSarModal({ alert, onClose, onSave }: {
  alert: FraudAlert | null; onClose: () => void; onSave: () => void;
}) {
  const [step, setStep] = useState(0);
  const [activity, setActivity] = useState("Structuring");
  if (!alert) return null;
  return (
    <Modal open={!!alert} onClose={onClose} tone="amber" icon="bi-file-earmark-text" size="md"
      title="Draft SAR filing" subtitle="Suspicious Activity Report preparation">
      <div className="pm-modal-body">
        <Steps current={step} steps={[
          { label: "Subject", icon: "bi-person-vcard" },
          { label: "Activity", icon: "bi-arrow-left-right" },
          { label: "Evidence", icon: "bi-paperclip" },
          { label: "Review", icon: "bi-check2-circle" },
        ]} />
        {step === 0 && (
          <div className="mt-3">
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-kv"><span className="k">Subject</span><span className="v">{alert.user}</span></div>
              <div className="pm-kv"><span className="k">Account</span><span className="v mono">{alert.userId}</span></div>
              <div className="pm-kv"><span className="k">Alert</span><span className="v mono">{alert.id}</span></div>
            </div>
            <label className="form-label">Suspicious activity category</label>
            <select className="form-select" value={activity} onChange={e => setActivity(e.target.value)}>
              <option>Structuring</option>
              <option>Layering</option>
              <option>Mule activity</option>
              <option>Account takeover</option>
              <option>Identity fraud</option>
            </select>
          </div>
        )}
        {step === 1 && (
          <div className="mt-3">
            <label className="form-label">Activity description</label>
            <textarea className="form-control mb-3" rows={4}
              defaultValue={`${alert.user} attempted a withdrawal of ${kes(alert.amount)} via ${alert.channel}. The transaction triggered ${alert.factors.join(", ").toLowerCase()} alerts.`} />
            <div className="pm-eyebrow mb-2">Linked transactions</div>
            <div className="pm-alert-row mb-2" style={{ borderLeftColor: "#f04438" }}>
              <div className="flex-grow-1">
                <div style={{ fontWeight: 700, fontSize: ".78rem" }}>TXN-98234 · KES 120,000</div>
                <div className="pm-td-sub">M-Pesa withdrawal · 14:32 · Blocked</div>
              </div>
              <Badge tone="red">Blocked</Badge>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="mt-3">
            <div className="pm-note mb-3">
              <i className="bi bi-info-circle me-1" />
              The following evidence artifacts will be sealed with this SAR filing.
            </div>
            {["Transaction logs", "KYC snapshot", "Device fingerprint", "IP geolocation", "Session logs"].map((e, i) => (
              <div key={i} className="pm-alert-row mb-2" style={{ borderLeftColor: "#12b76a" }}>
                <i className="bi bi-check2-circle" style={{ color: "#12b76a" }} />
                <span style={{ fontSize: ".78rem" }}>{e}</span>
              </div>
            ))}
          </div>
        )}
        {step === 3 && (
          <div className="mt-3">
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-kv"><span className="k">Subject</span><span className="v">{alert.user}</span></div>
              <div className="pm-kv"><span className="k">Activity</span><span className="v">{activity}</span></div>
              <div className="pm-kv"><span className="k">Evidence</span><span className="v">5 artifacts sealed</span></div>
              <div className="pm-kv"><span className="k">Prepared by</span><span className="v">Jeckonia Kwasa · Super Admin</span></div>
            </div>
            <div className="pm-note" style={{ borderColor: "#f79009", background: "#fff5e6" }}>
              <i className="bi bi-exclamation-triangle me-1" style={{ color: "#f79009" }} />
              SAR filing requires Compliance Officer + Super Admin dual approval before FRA submission.
            </div>
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}>Back</button>}
        <div className="flex-grow-1" />
        <button className="btn btn-primary btn-sm" onClick={() => step < 3 ? setStep(step + 1) : onSave()}>
          {step === 3 ? "Submit for approval" : "Continue"}
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   14. Transaction Detail Modal
   ================================================================ */
export function TransactionDetailModal({ alert, onClose }: { alert: FraudAlert | null; onClose: () => void }) {
  if (!alert) return null;
  return (
    <Modal open={!!alert} onClose={onClose} tone="blue" icon="bi-arrow-left-right" size="md"
      title="Transaction detail" subtitle={`${alert.id} · ${alert.channel}`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Amount</span><span className="v mono" style={{ fontWeight: 700 }}>{kes(alert.amount)}</span></div>
          <div className="pm-kv"><span className="k">Channel</span><span className="v">{alert.channel}</span></div>
          <div className="pm-kv"><span className="k">Time</span><span className="v mono">{alert.time}</span></div>
          <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone="red">Blocked</Badge></span></div>
          <div className="pm-kv"><span className="k">Reference</span><span className="v mono">TXN-{Math.floor(Math.random() * 90000) + 10000}</span></div>
        </div>
        <div className="pm-eyebrow mb-2">Timeline</div>
        <div className="pm-alert-row mb-2" style={{ borderLeftColor: "#12b76a" }}>
          <div className="flex-grow-1">
            <div className="mono" style={{ fontWeight: 700, fontSize: ".72rem", color: "#12b76a" }}>{alert.time}</div>
            <div className="pm-td-sub">Transaction initiated via {alert.channel}</div>
          </div>
        </div>
        <div className="pm-alert-row mb-2" style={{ borderLeftColor: "#f79009" }}>
          <div className="flex-grow-1">
            <div className="mono" style={{ fontWeight: 700, fontSize: ".72rem", color: "#f79009" }}>{alert.time}</div>
            <div className="pm-td-sub">Fraud rule {alert.factors[0]} triggered</div>
          </div>
        </div>
        <div className="pm-alert-row mb-2" style={{ borderLeftColor: "#f04438" }}>
          <div className="flex-grow-1">
            <div className="mono" style={{ fontWeight: 700, fontSize: ".72rem", color: "#f04438" }}>{alert.time}</div>
            <div className="pm-td-sub">Transaction blocked · hold applied</div>
          </div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   15. Account History Modal
   ================================================================ */
export function AccountHistoryModal({ alert, onClose }: { alert: FraudAlert | null; onClose: () => void }) {
  if (!alert) return null;
  return (
    <Modal open={!!alert} onClose={onClose} tone="blue" icon="bi-person-lines-fill" size="md"
      title="Account history" subtitle={`${alert.user} · ${alert.userId}`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Account created</span><span className="v mono">2026-03-15</span></div>
          <div className="pm-kv"><span className="k">Account age</span><span className="v">{alert.ageDays} days</span></div>
          <div className="pm-kv"><span className="k">KYC status</span><span className="v"><Badge tone="green" dot>{alert.kyc}</Badge></span></div>
          <div className="pm-kv"><span className="k">Total transactions</span><span className="v mono">1,247</span></div>
          <div className="pm-kv"><span className="k">Total volume</span><span className="v mono">KES 4.2M</span></div>
          <div className="pm-kv"><span className="k">Risk score</span><span className="v"><Badge tone={alert.risk >= 70 ? "red" : "amber"}>{alert.risk}/100</Badge></span></div>
        </div>
        <div className="pm-eyebrow mb-2">Recent activity</div>
        <div className="pm-alert-row mb-2" style={{ borderLeftColor: "#f04438" }}>
          <div className="flex-grow-1">
            <div style={{ fontWeight: 700, fontSize: ".78rem" }}>Withdrawal blocked · KES 120,000</div>
            <div className="pm-td-sub">Today 14:32 · M-Pesa</div>
          </div>
          <Badge tone="red">Blocked</Badge>
        </div>
        <div className="pm-alert-row mb-2" style={{ borderLeftColor: "#12b76a" }}>
          <div className="flex-grow-1">
            <div style={{ fontWeight: 700, fontSize: ".78rem" }}>Deposit · KES 50,000</div>
            <div className="pm-td-sub">Today 14:25 · Bank transfer</div>
          </div>
          <Badge tone="green">Completed</Badge>
        </div>
        <div className="pm-alert-row mb-2" style={{ borderLeftColor: "#12b76a" }}>
          <div className="flex-grow-1">
            <div style={{ fontWeight: 700, fontSize: ".78rem" }}>Transfer · KES 25,000</div>
            <div className="pm-td-sub">Yesterday 16:45 · Internal</div>
          </div>
          <Badge tone="green">Completed</Badge>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-outline-secondary btn-sm"><i className="bi bi-download me-1" />Export</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   16. Geo Location Analysis Modal
   ================================================================ */
export function GeoLocationModal({ alert, onClose }: { alert: FraudAlert | null; onClose: () => void }) {
  if (!alert) return null;
  return (
    <Modal open={!!alert} onClose={onClose} tone="amber" icon="bi-geo-alt" size="md"
      title="Geographic analysis" subtitle={`${alert.ip} · Kisumu, Kenya`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3" style={{ background: "#fafbfe", textAlign: "center", padding: "2rem" }}>
          <i className="bi bi-geo-alt" style={{ fontSize: "2rem", color: "#5925dc" }} />
          <div style={{ fontSize: ".78rem", marginTop: ".5rem" }}>Map visualization of IP geolocation</div>
        </div>
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">IP</span><span className="v mono">{alert.ip}</span></div>
          <div className="pm-kv"><span className="k">City</span><span className="v">Kisumu</span></div>
          <div className="pm-kv"><span className="k">Country</span><span className="v">Kenya</span></div>
          <div className="pm-kv"><span className="k">ASN</span><span className="v mono">AS33771 - Safaricom</span></div>
          <div className="pm-kv"><span className="k">VPN/Proxy</span><span className="v"><Badge tone="green">No</Badge></span></div>
          <div className="pm-kv"><span className="k">Tor exit</span><span className="v"><Badge tone="green">No</Badge></span></div>
        </div>
        <div className="pm-eyebrow mb-2">Location history (24h)</div>
        <div className="pm-alert-row mb-2" style={{ borderLeftColor: "#12b76a" }}>
          <div className="flex-grow-1">
            <div style={{ fontWeight: 700, fontSize: ".78rem" }}>Kisumu, Kenya</div>
            <div className="pm-td-sub">14:30 · Current session</div>
          </div>
          <Badge tone="green">Current</Badge>
        </div>
        <div className="pm-alert-row mb-2" style={{ borderLeftColor: "#98a2b3" }}>
          <div className="flex-grow-1">
            <div style={{ fontWeight: 700, fontSize: ".78rem" }}>Nairobi, Kenya</div>
            <div className="pm-td-sub">Yesterday 09:15</div>
          </div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   17. Recovery Action Modal
   ================================================================ */
export function RecoveryActionModal({ alert, onClose, onSubmit }: {
  alert: FraudAlert | null; onClose: () => void; onSubmit: () => void;
}) {
  const [action, setAction] = useState("hold");
  const [amount, setAmount] = useState(alert?.amount ?? 0);
  if (!alert) return null;
  return (
    <Modal open={!!alert} onClose={onClose} tone="green" icon="bi-arrow-counterclockwise" size="sm"
      title="Recovery action" subtitle={`${alert.id} · ${alert.user}`}>
      <div className="pm-modal-body">
        <label className="form-label">Recovery action</label>
        <select className="form-select mb-3" value={action} onChange={e => setAction(e.target.value)}>
          <option value="hold">Extend transaction hold (30 min)</option>
          <option value="freeze">Freeze account balance</option>
          <option value="reverse">Reverse transaction</option>
          <option value="recover">Initiate recovery process</option>
        </select>
        <label className="form-label">Amount (KES)</label>
        <input type="number" className="form-control mb-3" value={amount} onChange={e => setAmount(+e.target.value)} />
        <div className="pm-note">
          <i className="bi bi-info-circle me-1" />
          Recovery actions are logged and require dual approval for amounts over KES 100,000.
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={onSubmit}>
          <i className="bi bi-check2 me-1" />Execute recovery
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   18. Case Notes Modal
   ================================================================ */
export function CaseNotesModal({ alert, onClose, onSave }: {
  alert: FraudAlert | null; onClose: () => void; onSave: (note: string) => void;
}) {
  const [note, setNote] = useState("");
  if (!alert) return null;
  return (
    <Modal open={!!alert} onClose={onClose} tone="blue" icon="bi-journal-text" size="sm"
      title="Case notes" subtitle={`${alert.id} · Add investigator note`}>
      <div className="pm-modal-body">
        <label className="form-label">Note <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control mb-3" rows={4} value={note} onChange={e => setNote(e.target.value)}
          placeholder="Document investigation findings, decisions or follow-up actions..." />
        <div className="pm-note">
          <i className="bi bi-clock-history me-1" />
          Notes are timestamped and cannot be edited after saving. They form part of the case record.
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={!note} onClick={() => onSave(note)}>
          <i className="bi bi-check2 me-1" />Save note
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   19. Investigation Summary Modal
   ================================================================ */
export function InvestigationSummaryModal({ alert, onClose }: { alert: FraudAlert | null; onClose: () => void }) {
  if (!alert) return null;
  return (
    <Modal open={!!alert} onClose={onClose} tone="violet" icon="bi-clipboard2-data" size="md"
      title="Investigation summary" subtitle={`${alert.id} · Case closure report`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Case</span><span className="v mono">{alert.id}</span></div>
          <div className="pm-kv"><span className="k">Subject</span><span className="v">{alert.user}</span></div>
          <div className="pm-kv"><span className="k">Type</span><span className="v">{alert.type}</span></div>
          <div className="pm-kv"><span className="k">Amount at risk</span><span className="v mono">{kes(alert.amount)}</span></div>
          <div className="pm-kv"><span className="k">Risk score</span><span className="v"><Badge tone={alert.risk >= 70 ? "red" : "amber"}>{alert.risk}/100</Badge></span></div>
          <div className="pm-kv"><span className="k">Resolution</span><span className="v"><Badge tone="green">Resolved</Badge></span></div>
        </div>
        <div className="pm-eyebrow mb-2">Investigation findings</div>
        <div className="pm-alert-row mb-2" style={{ borderLeftColor: "#12b76a" }}>
          <div className="flex-grow-1">
            <div style={{ fontWeight: 700, fontSize: ".78rem" }}>Transaction blocked successfully</div>
            <div className="pm-td-sub">KES {alert.amount} held pending review</div>
          </div>
        </div>
        <div className="pm-alert-row mb-2" style={{ borderLeftColor: "#12b76a" }}>
          <div className="flex-grow-1">
            <div style={{ fontWeight: 700, fontSize: ".78rem" }}>Account controls applied</div>
            <div className="pm-td-sub">Enhanced monitoring active</div>
          </div>
        </div>
        <div className="pm-alert-row mb-2" style={{ borderLeftColor: "#175cd3" }}>
          <div className="flex-grow-1">
            <div style={{ fontWeight: 700, fontSize: ".78rem" }}>Customer contacted</div>
            <div className="pm-td-sub">Response received · identity verified</div>
          </div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-primary btn-sm"><i className="bi bi-download me-1" />Export report</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   20. Fraud Pattern Analysis Modal
   ================================================================ */
export function FraudPatternModal({ alert, onClose }: { alert: FraudAlert | null; onClose: () => void }) {
  if (!alert) return null;
  return (
    <Modal open={!!alert} onClose={onClose} tone="amber" icon="bi-bezier2" size="md"
      title="Fraud pattern analysis" subtitle={`${alert.type} · Detection details`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Pattern</span><span className="v">{alert.type}</span></div>
          <div className="pm-kv"><span className="k">Detection rule</span><span className="v mono">FR-002</span></div>
          <div className="pm-kv"><span className="k">Confidence</span><span className="v"><Badge tone="amber">High</Badge></span></div>
          <div className="pm-kv"><span className="k">False positive rate</span><span className="v">28%</span></div>
        </div>
        <div className="pm-eyebrow mb-2">Pattern characteristics</div>
        {alert.factors.map((f, i) => (
          <div key={i} className="pm-alert-row mb-2" style={{ borderLeftColor: "#f79009" }}>
            <div className="flex-grow-1">
              <div style={{ fontWeight: 700, fontSize: ".78rem" }}>{f}</div>
              <div className="pm-td-sub">Weight: {[35, 28, 22, 15][i]}% · Confidence: High</div>
            </div>
          </div>
        ))}
        <div className="pm-eyebrow mb-2 mt-3">Recent detections</div>
        <div className="pm-card pm-card-pad">
          <div className="pm-kv"><span className="k">Last 24h</span><span className="v">3 detections</span></div>
          <div className="pm-kv"><span className="k">Last 7d</span><span className="v">12 detections</span></div>
          <div className="pm-kv"><span className="k">Last 30d</span><span className="v">47 detections</span></div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   21. Final Resolution Modal
   ================================================================ */
export function FinalResolutionModal({ alert, onClose, onResolve }: {
  alert: FraudAlert | null; onClose: () => void; onResolve: (resolution: string) => void;
}) {
  const [resolution, setResolution] = useState("");
  if (!alert) return null;
  return (
    <Modal open={!!alert} onClose={onClose} tone="green" icon="bi-check2-circle" size="sm"
      title="Final resolution" subtitle={`${alert.id} · Close case`}>
      <div className="pm-modal-body">
        <label className="form-label">Resolution type <span style={{ color: "#f04438" }}>*</span></label>
        <select className="form-select mb-3" value={resolution} onChange={e => setResolution(e.target.value)}>
          <option value="">Select resolution...</option>
          <option value="fraud-confirmed">Fraud confirmed · account restricted</option>
          <option value="false-positive">False positive · alert cleared</option>
          <option value="customer-error">Customer error · no action required</option>
          <option value="escalated">Escalated to law enforcement</option>
          <option value="recovered">Funds recovered · case closed</option>
        </select>
        <div className="pm-note">
          <i className="bi bi-shield-check me-1" />
          Resolution is final and forms part of the immutable case record. The audit trail will reflect this closure.
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={!resolution} onClick={() => onResolve(resolution)}>
          <i className="bi bi-check2-circle me-1" />Resolve case
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   22. Alert History Modal
   ================================================================ */
export function AlertHistoryModal({ alert, onClose }: { alert: FraudAlert | null; onClose: () => void }) {
  if (!alert) return null;
  const history = [
    { date: "2026-08-22", alert: "FRD-2848", type: "Velocity spike", status: "New", risk: 78 },
    { date: "2026-08-15", alert: "FRD-2801", type: "Dual-device", status: "Resolved", risk: 65 },
    { date: "2026-08-01", alert: "FRD-2756", type: "Geo-anomaly", status: "False positive", risk: 52 },
  ];
  return (
    <Modal open={!!alert} onClose={onClose} tone="blue" icon="bi-clock-history" size="md"
      title="Alert history" subtitle={`${alert.user} · ${alert.userId}`}>
      <div className="pm-modal-body">
        <div className="pm-eyebrow mb-2">Previous alerts for this customer</div>
        {history.map((h, i) => (
          <div key={i} className="pm-alert-row mb-2" style={{ borderLeftColor: h.status === "New" ? "#f04438" : h.status === "Resolved" ? "#12b76a" : "#98a2b3" }}>
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="mono" style={{ fontWeight: 700, fontSize: ".72rem" }}>{h.alert}</span>
                <span style={{ fontWeight: 700, fontSize: ".78rem" }}>{h.type}</span>
              </div>
              <div className="pm-td-sub">{h.date} · Risk: {h.risk}</div>
            </div>
            <Badge tone={h.status === "New" ? "red" : h.status === "Resolved" ? "green" : "grey"}>{h.status}</Badge>
          </div>
        ))}
        <div className="pm-note mt-3">
          <i className="bi bi-info-circle me-1" />
          This customer has {history.length} alerts in the last 30 days.
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}
