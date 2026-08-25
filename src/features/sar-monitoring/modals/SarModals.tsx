import { useState } from "react";
import { Badge, Drawer, Meter, Modal, Steps, useToast } from "../../../components/ui";
import { AuthorityPanel } from "../../../components/AuthorityPanel";
import { kes } from "../../../lib/format";
import type { MonitorRule, SarCase } from "../data/sarData";

/* ================================================================
   1. Case evidence drawer
   ================================================================ */
export function CaseDrawer({ item, onClose, onAssign, onFile, onTxnChain, onKycSnapshot, onPriorSars, onEvidenceLocker, onContactSubject, onExtendRestriction, onEscalate }: {
  item: SarCase | null; onClose: () => void; onAssign: (x: SarCase) => void; onFile: (x: SarCase) => void;
  onTxnChain: (x: SarCase) => void; onKycSnapshot: (x: SarCase) => void; onPriorSars: (x: SarCase) => void;
  onEvidenceLocker: (x: SarCase) => void; onContactSubject: (x: SarCase) => void;
  onExtendRestriction: (x: SarCase) => void; onEscalate: (x: SarCase) => void;
}) {
  return (
    <Drawer open={!!item} onClose={onClose} half
      icon="bi-folder2-open" tone="amber"
      title={item ? item.id : "Case evidence"}
      subtitle="SAR investigation workspace"
      footer={item && (
        <div className="d-flex gap-2 w-100">
          <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => onAssign(item)}>
            <i className="bi bi-person-plus me-1" />Assign
          </button>
          <button className="btn btn-outline-danger btn-sm flex-grow-1" onClick={() => onFile(item)}>
            <i className="bi bi-file-earmark-arrow-up me-1" />Prepare SAR
          </button>
        </div>
      )}>
      {item && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap">
            <AuthorityPanel area="SAR investigation" auditRef="AUD-SAR-22048"
              permissions={["Assign and reassign cases", "Apply transaction restrictions",
                "Prepare and submit SARs", "Escalate to FRA or DCI"]} />
            <Badge tone="ink"><i className="bi bi-lock-fill" /> Evidence sealed</Badge>
          </div>

          <div className="pm-card pm-card-pad mb-3" style={{ background: "#fff5e6", borderLeft: "3px solid #f79009" }}>
            <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap">
              <div>
                <span className="pm-eyebrow mb-1" style={{ fontSize: ".62rem" }}>SUBJECT</span>
                <div style={{ fontWeight: 700, fontSize: ".86rem" }}>{item.user}</div>
                <div className="pm-td-sub mono">{item.userId} · {item.period}</div>
              </div>
              <div className="text-end">
                <span className="pm-eyebrow mb-1" style={{ fontSize: ".62rem" }}>EXPOSURE</span>
                <div className="mono" style={{ fontWeight: 800, fontSize: ".86rem" }}>{kes(item.amount)}</div>
                <div className="pm-td-sub">{item.transactions} linked transactions</div>
              </div>
            </div>
            <div className="mt-2">
              <Badge tone={item.priority === "Critical" ? "red" : item.priority === "High" ? "amber" : "blue"}>
                {item.priority} priority
              </Badge>
            </div>
          </div>

          <div className="pm-card pm-card-pad mb-3">
            <div className="pm-kv"><span className="k">Rule triggered</span><span className="v">{item.rule}</span></div>
            <div className="pm-kv"><span className="k">Case owner</span><span className="v">{item.owner}</span></div>
            <div className="pm-kv"><span className="k">Current control</span><span className="v">{item.status}</span></div>
            <div className="pm-kv"><span className="k">Case age</span><span className="v">{item.age}</span></div>
          </div>

          <div className="pm-eyebrow mb-2">Risk indicators</div>
          <div className="d-flex flex-wrap gap-2 mb-3">
            {item.risk.map(x => (
              <Badge key={x} tone="amber"><i className="bi bi-exclamation-triangle me-1" />{x}</Badge>
            ))}
          </div>

          <div className="pm-eyebrow mb-2">Evidence timeline</div>
          <div className="mb-3">
            <div className="pm-alert-row mb-2" style={{ borderLeftColor: "#5925dc" }}>
              <div className="flex-grow-1">
                <div className="mono" style={{ fontWeight: 700, fontSize: ".72rem", color: "#5925dc" }}>Now</div>
                <div className="pm-td-sub">Case routed for {item.stage.toLowerCase()}.</div>
              </div>
            </div>
            <div className="pm-alert-row mb-2" style={{ borderLeftColor: "#175cd3" }}>
              <div className="flex-grow-1">
                <div className="mono" style={{ fontWeight: 700, fontSize: ".72rem", color: "#175cd3" }}>-24m</div>
                <div className="pm-td-sub">Rules engine correlated {item.transactions} linked movements.</div>
              </div>
            </div>
            <div className="pm-alert-row mb-2" style={{ borderLeftColor: "#f79009" }}>
              <div className="flex-grow-1">
                <div className="mono" style={{ fontWeight: 700, fontSize: ".72rem", color: "#f79009" }}>-1h</div>
                <div className="pm-td-sub">Protective control applied: {item.status.toLowerCase()}.</div>
              </div>
            </div>
          </div>

          {/* Investigation workspace — all buttons now open real modals */}
          <div className="pm-card mb-3" style={{ background: "#fafbfe", border: "1px solid var(--pm-border)" }}>
            <div className="pm-card-pad">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <div style={{ fontWeight: 700, fontSize: ".82rem" }}>Case investigation workspace</div>
                  <div className="pm-td-sub">All artifacts are sealed into the filing record.</div>
                </div>
                <Badge tone="violet">Evidence controlled</Badge>
              </div>
              <div className="d-flex flex-column gap-2">
                <button className="pm-alert-row text-start" style={{ borderLeftColor: "#5925dc" }} onClick={() => onTxnChain(item)}>
                  <i className="bi bi-arrow-left-right" style={{ color: "#5925dc", fontSize: ".9rem" }} />
                  <div className="flex-grow-1">
                    <div style={{ fontWeight: 700, fontSize: ".78rem" }}>Transaction chain</div>
                    <div className="pm-td-sub">Counterparties & amounts</div>
                  </div>
                  <i className="bi bi-chevron-right" style={{ color: "#98a2b3", fontSize: ".7rem" }} />
                </button>
                <button className="pm-alert-row text-start" style={{ borderLeftColor: "#5925dc" }} onClick={() => onKycSnapshot(item)}>
                  <i className="bi bi-person-vcard" style={{ color: "#5925dc", fontSize: ".9rem" }} />
                  <div className="flex-grow-1">
                    <div style={{ fontWeight: 700, fontSize: ".78rem" }}>KYC snapshot</div>
                    <div className="pm-td-sub">Identity & account profile</div>
                  </div>
                  <i className="bi bi-chevron-right" style={{ color: "#98a2b3", fontSize: ".7rem" }} />
                </button>
                <button className="pm-alert-row text-start" style={{ borderLeftColor: "#5925dc" }} onClick={() => onPriorSars(item)}>
                  <i className="bi bi-clock-history" style={{ color: "#5925dc", fontSize: ".9rem" }} />
                  <div className="flex-grow-1">
                    <div style={{ fontWeight: 700, fontSize: ".78rem" }}>Prior SARs</div>
                    <div className="pm-td-sub">History & regulator feedback</div>
                  </div>
                  <i className="bi bi-chevron-right" style={{ color: "#98a2b3", fontSize: ".7rem" }} />
                </button>
                <button className="pm-alert-row text-start" style={{ borderLeftColor: "#5925dc" }} onClick={() => onEvidenceLocker(item)}>
                  <i className="bi bi-safe2" style={{ color: "#5925dc", fontSize: ".9rem" }} />
                  <div className="flex-grow-1">
                    <div style={{ fontWeight: 700, fontSize: ".78rem" }}>Evidence locker</div>
                    <div className="pm-td-sub">Logs, documents & hashes</div>
                  </div>
                  <i className="bi bi-chevron-right" style={{ color: "#98a2b3", fontSize: ".7rem" }} />
                </button>
              </div>
              <div className="d-flex gap-2 flex-wrap mt-3">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => onContactSubject(item)}>
                  <i className="bi bi-telephone me-1" />Contact subject
                </button>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => onExtendRestriction(item)}>
                  <i className="bi bi-lock me-1" />Extend restriction
                </button>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => onEscalate(item)}>
                  <i className="bi bi-bank me-1" />Escalate authority
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
   2. Assign case modal
   ================================================================ */
export function AssignCase({ item, onClose, onSave }: {
  item: SarCase | null; onClose: () => void; onSave: (x: string) => void;
}) {
  const [n, setN] = useState("Sarah K.");
  return (
    <Modal open={!!item} onClose={onClose} tone="blue" icon="bi-person-check" size="sm"
      title="Assign investigator" subtitle={item?.id}>
      <div className="pm-modal-body">
        <label className="form-label">Investigator</label>
        <select className="form-select mb-3" value={n} onChange={e => setN(e.target.value)}>
          <option>Sarah K.</option>
          <option>James O.</option>
          <option>David K.</option>
          <option>Grace M.</option>
        </select>
        <div className="pm-note">
          <i className="bi bi-info-circle me-1" />
          The 8-hour investigation SLA and audit record start from assignment.
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => onSave(n)}>Assign case</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   3. SAR filing wizard
   ================================================================ */
export function FilingWizard({ item, onClose, onSave }: {
  item: SarCase | null; onClose: () => void; onSave: () => void;
}) {
  const [s, setS] = useState(0);
  return (
    <Modal open={!!item} onClose={onClose} tone="red" icon="bi-file-earmark-lock" size="lg"
      title="Prepare SAR filing" subtitle={item ? `${item.id} · dual approval required` : ""}>
      <div className="pm-modal-body">
        <AuthorityPanel area="Regulatory SAR submission" auditRef="AUD-FRA-00921"
          permissions={["Create regulator submissions", "Attach sealed evidence",
            "Request dual approval", "Escalate to law enforcement"]} />
        <div className="mb-3">
          <Steps current={s} steps={[
            { label: "Subject", icon: "bi-person-vcard" },
            { label: "Activity", icon: "bi-arrow-left-right" },
            { label: "Evidence", icon: "bi-paperclip" },
            { label: "Attest", icon: "bi-shield-check" },
          ]} />
        </div>
        {s === 0 && (
          <div className="row g-3">
            <div className="col-6">
              <label className="form-label">Subject account</label>
              <input className="form-control" defaultValue={item?.userId} />
            </div>
            <div className="col-6">
              <label className="form-label">Filing reference</label>
              <input className="form-control" defaultValue={`${item?.id}-FRA`} />
            </div>
            <div className="col-12">
              <label className="form-label">Suspicious activity period</label>
              <input className="form-control" defaultValue={item?.period} />
            </div>
          </div>
        )}
        {s === 1 && (
          <div>
            <label className="form-label">Investigator assessment</label>
            <textarea className="form-control mb-3" rows={5}
              defaultValue={`Review of ${item?.transactions} linked transactions indicates activity consistent with ${item?.risk.join(", ").toLowerCase()}.`} />
            <label className="form-label">Risk categories</label>
            <div className="d-flex flex-wrap gap-2">
              {["Structuring", "Layering", "Mule activity", "Account takeover"].map(x => (
                <label className="form-check-label border rounded px-2 py-1 small" key={x}>
                  <input className="form-check-input me-1" type="checkbox" defaultChecked={item?.risk.includes(x)} />
                  {x}
                </label>
              ))}
            </div>
          </div>
        )}
        {s === 2 && (
          <div>
            <div className="pm-note mb-3">
              <i className="bi bi-info-circle me-1" />
              7 linked transaction records, the customer KYC snapshot and device evidence will be sealed with this filing.
            </div>
            <label className="form-label">Customer response</label>
            <textarea className="form-control" rows={3}
              defaultValue="No response received before protective control was applied." />
          </div>
        )}
        {s === 3 && (
          <div className="pm-note" style={{ borderColor: "#f79009", background: "#fff5e6" }}>
            <i className="bi bi-exclamation-triangle me-1" style={{ color: "#f79009" }} />
            <b>Legal attestation</b><br />
            <span style={{ fontSize: ".78rem" }}>You attest the facts are complete to the best of your knowledge. Compliance Officer and Super Admin approval are required before FRA transmission.</span>
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        {s > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setS(s - 1)}>Back</button>}
        <div className="flex-grow-1" />
        <button className="btn btn-primary btn-sm" onClick={() => s < 3 ? setS(s + 1) : onSave()}>
          {s === 3 ? "Submit for approval" : "Continue"}
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   4. Monitoring rule control modal
   ================================================================ */
export function RuleModal({ rule, onClose, onSave }: {
  rule: MonitorRule | null; onClose: () => void; onSave: (on: boolean) => void;
}) {
  const [a, setA] = useState(rule?.active ?? true);
  return (
    <Modal open={!!rule} onClose={onClose} tone="violet" icon="bi-sliders" size="sm"
      title="Monitoring rule control" subtitle={rule?.id}>
      <div className="pm-modal-body">
        <AuthorityPanel area="Monitoring rule administration" auditRef="AUD-MON-88523"
          permissions={["Tune detection thresholds", "Activate and pause scenarios",
            "Approve false-positive calibration", "Override model routing"]} />
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
                  <option>Low</option>
                </select>
              </div>
              <div className="col-6">
                <label className="form-label">Threshold review</label>
                <input className="form-control" defaultValue="Current calibrated threshold" />
              </div>
            </div>
            <div className="form-check form-switch">
              <input className="form-check-input" id="srule" type="checkbox" checked={a}
                onChange={e => setA(e.target.checked)} />
              <label htmlFor="srule" className="form-check-label" style={{ fontSize: ".8rem" }}>
                Active in production
              </label>
            </div>
          </>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => onSave(a)}>Save control</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   5. Transaction chain modal — shows linked movements
   ================================================================ */
export function TransactionChainModal({ item, onClose }: { item: SarCase | null; onClose: () => void }) {
  const txns = item ? Array.from({ length: Math.min(item.transactions, 8) }, (_, i) => ({
    id: `TXN-${String(i + 1).padStart(4, "0")}`,
    type: i % 3 === 0 ? "Cash-in" : i % 3 === 1 ? "Transfer" : "Cash-out",
    amount: Math.round(item.amount / item.transactions * (0.5 + Math.random())),
    counterparty: ["Nexus Imports", "Kiptoo Traders", "Coastline Supplies", "M-Pesa Agent", "Equity Bank", "Safaricom Lipa", "个人钱包", "Crypto Exchange"][i % 8],
    time: `${String(8 + i).padStart(2, "0")}:${String(i * 7 % 60).padStart(2, "0")}`,
    channel: ["USSD", "App", "Agent", "ATM", "POS"][i % 5],
    flagged: i < 3,
  })) : [];
  return (
    <Modal open={!!item} onClose={onClose} tone="violet" icon="bi-arrow-left-right" size="lg"
      title="Transaction chain" subtitle={item ? `${item.id} · ${item.transactions} linked movements` : ""}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3" style={{ background: "#f4f1ff", border: "1px solid #ded4ff" }}>
          <div className="d-flex justify-content-between">
            <div>
              <span className="pm-eyebrow" style={{ fontSize: ".6rem" }}>TOTAL EXPOSURE</span>
              <div style={{ fontWeight: 800, fontSize: ".9rem" }}>{kes(item?.amount ?? 0)}</div>
            </div>
            <div className="text-end">
              <span className="pm-eyebrow" style={{ fontSize: ".6rem" }}>TIME WINDOW</span>
              <div style={{ fontWeight: 700, fontSize: ".82rem" }}>{item?.period}</div>
            </div>
          </div>
        </div>
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead>
              <tr><th>ID</th><th>Type</th><th>Amount</th><th>Counterparty</th><th>Time</th><th>Channel</th><th>Status</th></tr>
            </thead>
            <tbody>
              {txns.map(t => (
                <tr key={t.id}>
                  <td className="mono" style={{ fontSize: ".72rem" }}>{t.id}</td>
                  <td><Badge tone={t.type === "Cash-in" ? "green" : t.type === "Cash-out" ? "red" : "blue"}>{t.type}</Badge></td>
                  <td className="pm-num">{kes(t.amount)}</td>
                  <td>{t.counterparty}</td>
                  <td className="mono" style={{ fontSize: ".72rem" }}>{t.time}</td>
                  <td><Badge tone="grey">{t.channel}</Badge></td>
                  <td>{t.flagged ? <Badge tone="red"><i className="bi bi-flag-fill me-1" />Flagged</Badge> : <Badge tone="green">Normal</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pm-note mt-3">
          <i className="bi bi-info-circle me-1" />
          All transactions are sealed in the evidence record. Export requires Compliance Officer approval.
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   6. KYC snapshot modal
   ================================================================ */
export function KycSnapshotModal({ item, onClose }: { item: SarCase | null; onClose: () => void }) {
  return (
    <Modal open={!!item} onClose={onClose} tone="blue" icon="bi-person-vcard" size="lg"
      title="KYC snapshot" subtitle={item ? `${item.userId} · point-in-time evidence` : ""}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3" style={{ background: "#eff8ff", borderLeft: "3px solid #175cd3" }}>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <div style={{ fontWeight: 700, fontSize: ".86rem" }}>{item?.user}</div>
              <div className="pm-td-sub mono">{item?.userId}</div>
            </div>
            <Badge tone="green"><i className="bi bi-check-circle me-1" />KYC Tier 2 verified</Badge>
          </div>
        </div>
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-eyebrow mb-2">Identity details</div>
          <div className="pm-kv"><span className="k">Full name</span><span className="v">{item?.user}</span></div>
          <div className="pm-kv"><span className="k">ID type</span><span className="v">National ID</span></div>
          <div className="pm-kv"><span className="k">ID number</span><span className="v mono">34XXXXXX78</span></div>
          <div className="pm-kv"><span className="k">Date of birth</span><span className="v">15-Mar-1988</span></div>
          <div className="pm-kv"><span className="k">Phone</span><span className="v mono">+254 7XX XXX 456</span></div>
          <div className="pm-kv"><span className="k">Email</span><span className="v">d***@email.com</span></div>
        </div>
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-eyebrow mb-2">Address & employment</div>
          <div className="pm-kv"><span className="k">Address</span><span className="v">Nairobi, Kenya</span></div>
          <div className="pm-kv"><span className="k">Employer</span><span className="v">Self-employed</span></div>
          <div className="pm-kv"><span className="k">Source of funds</span><span className="v">Business income</span></div>
        </div>
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-eyebrow mb-2">Risk assessment</div>
          <div className="pm-kv"><span className="k">Risk rating</span><span className="v"><Badge tone={item?.priority === "Critical" ? "red" : "amber"}>{item?.priority}</Badge></span></div>
          <div className="pm-kv"><span className="k">PEP status</span><span className="v">Not PEP</span></div>
          <div className="pm-kv"><span className="k">Sanctions</span><span className="v"><Badge tone="green">Clear</Badge></span></div>
          <div className="pm-kv"><span className="k">Adverse media</span><span className="v"><Badge tone="amber">2 findings</Badge></span></div>
          <div className="pm-kv"><span className="k">Last CDD refresh</span><span className="v">Jun 2026</span></div>
        </div>
        <div className="pm-card pm-card-pad">
          <div className="pm-eyebrow mb-2">Account summary</div>
          <div className="pm-kv"><span className="k">Account opened</span><span className="v">Jan 2024</span></div>
          <div className="pm-kv"><span className="k">Monthly volume</span><span className="v">KES 180K avg</span></div>
          <div className="pm-kv"><span className="k">Primary channel</span><span className="v">Mobile app</span></div>
          <div className="pm-kv"><span className="k">Beneficiaries</span><span className="v">4 linked</span></div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   7. Prior SARs modal — historical filings
   ================================================================ */
export function PriorSarsModal({ item, onClose }: { item: SarCase | null; onClose: () => void }) {
  const prior = [
    { id: "SAR-2025-089", filed: "Nov 2025", outcome: "Filed", amount: 450000, feedback: "No further action" },
    { id: "SAR-2025-042", filed: "Jun 2025", outcome: "Filed", amount: 230000, feedback: "Enhanced monitoring" },
    { id: "SAR-2024-112", filed: "Dec 2024", outcome: "Dismissed", amount: 0, feedback: "False positive" },
  ];
  return (
    <Modal open={!!item} onClose={onClose} tone="blue" icon="bi-clock-history" size="lg"
      title="Prior SAR history" subtitle={item ? `${item.user} · ${prior.length} historical filings` : ""}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3" style={{ background: "#eff8ff", borderLeft: "3px solid #175cd3" }}>
          <div className="pm-kv"><span className="k">Subject</span><span className="v">{item?.user} ({item?.userId})</span></div>
          <div className="pm-kv"><span className="k">Current case</span><span className="v">{item?.id}</span></div>
          <div className="pm-kv"><span className="k">Prior filings</span><span className="v">{prior.length}</span></div>
        </div>
        <div className="pm-eyebrow mb-2">Filing history</div>
        {prior.map(p => (
          <div key={p.id} className="pm-alert-row mb-2" style={{ borderLeftColor: p.outcome === "Filed" ? "#12b76a" : "#98a2b3" }}>
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center">
                <div style={{ fontWeight: 700, fontSize: ".78rem" }}>{p.id}</div>
                <Badge tone={p.outcome === "Filed" ? "green" : "grey"}>{p.outcome}</Badge>
              </div>
              <div className="pm-td-sub">Filed {p.filed} · {p.amount > 0 ? kes(p.amount) : "—"}</div>
              <div className="pm-td-sub mt-1"><i className="bi bi-chat-dots me-1" />{p.feedback}</div>
            </div>
          </div>
        ))}
        <div className="pm-note mt-3">
          <i className="bi bi-info-circle me-1" />
          Prior filing history is considered when determining case disposition and escalation thresholds.
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   8. Evidence locker modal — sealed artifacts
   ================================================================ */
export function EvidenceLockerModal({ item, onClose }: { item: SarCase | null; onClose: () => void }) {
  const artifacts = [
    { name: "Transaction ledger export", type: "JSON", size: "2.4 MB", hash: "a3f8c1...d4e2", sealed: "23 Aug 10:14" },
    { name: "KYC identity snapshot", type: "PDF", size: "840 KB", hash: "b7e2a1...9f3c", sealed: "23 Aug 10:14" },
    { name: "Device fingerprint log", type: "JSON", size: "156 KB", hash: "c1d9f4...2a8b", sealed: "23 Aug 10:15" },
    { name: "IP geolocation data", type: "CSV", size: "89 KB", hash: "d4e2b7...6c1a", sealed: "23 Aug 10:15" },
    { name: "Session recordings", type: "MP4", size: "18.2 MB", hash: "e8f3c1...4d7b", sealed: "23 Aug 10:16" },
    { name: "Communication metadata", type: "JSON", size: "340 KB", hash: "f2a8b4...1e9c", sealed: "23 Aug 10:16" },
  ];
  return (
    <Modal open={!!item} onClose={onClose} tone="violet" icon="bi-safe2" size="lg"
      title="Evidence locker" subtitle={item ? `${item.id} · ${artifacts.length} sealed artifacts` : ""}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3" style={{ background: "#f4f1ff", borderLeft: "3px solid #5925dc" }}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <div style={{ fontWeight: 700, fontSize: ".82rem" }}>Sealed evidence package</div>
              <div className="pm-td-sub">All artifacts are SHA-256 hashed and timestamped</div>
            </div>
            <Badge tone="violet"><i className="bi bi-lock-fill me-1" />Integrity verified</Badge>
          </div>
        </div>
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead>
              <tr><th>Artifact</th><th>Type</th><th>Size</th><th>SHA-256</th><th>Sealed</th></tr>
            </thead>
            <tbody>
              {artifacts.map(a => (
                <tr key={a.name}>
                  <td><b>{a.name}</b></td>
                  <td><Badge tone="violet">{a.type}</Badge></td>
                  <td className="pm-num">{a.size}</td>
                  <td className="mono" style={{ fontSize: ".68rem" }}>{a.hash}</td>
                  <td className="pm-td-sub">{a.sealed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pm-note mt-3">
          <i className="bi bi-shield-lock me-1" />
          Evidence exports require Compliance Officer approval and are logged in the audit trail.
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-primary btn-sm"><i className="bi bi-download me-1" />Export package</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   9. Contact subject modal — outreach workflow
   ================================================================ */
export function ContactSubjectModal({ item, onClose }: { item: SarCase | null; onClose: () => void }) {
  const [channel, setChannel] = useState("sms");
  const [template, setTemplate] = useState("identity-verification");
  return (
    <Modal open={!!item} onClose={onClose} tone="amber" icon="bi-telephone" size="sm"
      title="Contact subject" subtitle={item ? `${item.user} · ${item.userId}` : ""}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3" style={{ background: "#fff5e6", borderLeft: "3px solid #f79009" }}>
          <div style={{ fontWeight: 700, fontSize: ".82rem" }}>Restricted outreach</div>
          <div className="pm-td-sub mt-1">Subject is under investigation. All contact must be approved by Compliance Officer.</div>
        </div>
        <label className="form-label">Channel</label>
        <div className="d-flex gap-2 mb-3">
          {[
            { id: "sms", label: "SMS", icon: "bi-chat" },
            { id: "email", label: "Email", icon: "bi-envelope" },
            { id: "call", label: "Phone call", icon: "bi-telephone" },
            { id: "in-app", label: "In-app message", icon: "bi-phone" },
          ].map(c => (
            <button key={c.id} className={`btn btn-sm ${channel === c.id ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => setChannel(c.id)}>
              <i className={`bi ${c.icon} me-1`}></i>{c.label}
            </button>
          ))}
        </div>
        <label className="form-label">Message template</label>
        <select className="form-select mb-3" value={template} onChange={e => setTemplate(e.target.value)}>
          <option value="identity-verification">Identity verification request</option>
          <option value="source-of-funds">Source of funds inquiry</option>
          <option value="account-activity">Account activity clarification</option>
          <option value="document-upload">Document upload request</option>
        </select>
        <label className="form-label">Message preview</label>
        <div className="pm-card pm-card-pad" style={{ background: "#fafbfe", fontSize: ".78rem" }}>
          {template === "identity-verification" && "Dear customer, PayMo requires re-verification of your identity. Please upload a valid ID via the app within 48 hours."}
          {template === "source-of-funds" && "Dear customer, PayMo requires documentation of your source of funds for recent transactions. Please upload supporting documents."}
          {template === "account-activity" && "Dear customer, we've noticed unusual activity on your account. Please contact us to verify recent transactions."}
          {template === "document-upload" && "Dear customer, additional documents are required to maintain your account. Please upload via the secure portal."}
        </div>
        <div className="pm-note mt-3">
          <i className="bi bi-info-circle me-1" />
          Contact attempts are logged in the case timeline. Subject response triggers automatic case review.
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm"><i className="bi bi-send me-1" />Send message</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   10. Extend restriction modal
   ================================================================ */
export function ExtendRestrictionModal({ item, onClose }: { item: SarCase | null; onClose: () => void }) {
  const [duration, setDuration] = useState("7");
  const [reason, setReason] = useState("ongoing-investigation");
  return (
    <Modal open={!!item} onClose={onClose} tone="red" icon="bi-lock" size="sm"
      title="Extend restriction" subtitle={item ? `${item.id} · ${item.status}` : ""}>
      <div className="pm-modal-body">
        <AuthorityPanel area="Account restriction" auditRef="AUD-RES-44120"
          permissions={["Extend hold periods", "Apply account restrictions", "Override auto-release", "Escalate to MLRO"]} />
        <div className="pm-card pm-card-pad mb-3" style={{ background: "#fef2f2", borderLeft: "3px solid #d92d20" }}>
          <div className="pm-kv"><span className="k">Current control</span><span className="v">{item?.status}</span></div>
          <div className="pm-kv"><span className="k">Applied</span><span className="v">{item?.age} ago</span></div>
          <div className="pm-kv"><span className="k">Auto-release</span><span className="v">24 Aug 10:00</span></div>
        </div>
        <label className="form-label">Extension duration</label>
        <select className="form-select mb-3" value={duration} onChange={e => setDuration(e.target.value)}>
          <option value="24">24 hours</option>
          <option value="48">48 hours</option>
          <option value="7">7 days</option>
          <option value="14">14 days</option>
          <option value="30">30 days</option>
        </select>
        <label className="form-label">Reason for extension</label>
        <select className="form-select mb-3" value={reason} onChange={e => setReason(e.target.value)}>
          <option value="ongoing-investigation">Ongoing investigation</option>
          <option value="awaiting-evidence">Awaiting evidence</option>
          <option value="regulator-request">Regulator request</option>
          <option value="subject-unresponsive">Subject unresponsive</option>
        </select>
        <div className="pm-note">
          <i className="bi bi-exclamation-triangle me-1" style={{ color: "#f79009" }} />
          Extension requires Super Admin approval. Subject will be notified of restriction status.
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger btn-sm"><i className="bi bi-lock me-1" />Request extension</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   11. Escalate to authority modal
   ================================================================ */
export function EscalateAuthorityModal({ item, onClose }: { item: SarCase | null; onClose: () => void }) {
  const [agency, setAgency] = useState("fra");
  return (
    <Modal open={!!item} onClose={onClose} tone="red" icon="bi-bank" size="lg"
      title="Escalate to authority" subtitle={item ? `${item.id} · law enforcement referral` : ""}>
      <div className="pm-modal-body">
        <AuthorityPanel area="Law enforcement referral" auditRef="AUD-LEA-77230"
          permissions={["Initiate law enforcement referral", "Share sealed evidence", "Coordinate with FRA/DCI", "Manage classified briefings"]} />
        <label className="form-label">Target agency</label>
        <div className="d-flex gap-2 mb-3 flex-wrap">
          {[
            { id: "fra", label: "FRA", desc: "Financial Reporting Authority" },
            { id: "dci", label: "DCI", desc: "Directorate of Criminal Investigations" },
            { id: "pp", label: "ODPP", desc: "Office of the Director of Public Prosecutions" },
            { id: "cbk", label: "CBK", desc: "Central Bank of Kenya" },
          ].map(a => (
            <button key={a.id} className={`btn btn-sm ${agency === a.id ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => setAgency(a.id)} style={{ minWidth: 120 }}>
              <div style={{ fontWeight: 700, fontSize: ".78rem" }}>{a.label}</div>
              <div style={{ fontSize: ".65rem" }}>{a.desc}</div>
            </button>
          ))}
        </div>
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-eyebrow mb-2">Referral summary</div>
          <div className="pm-kv"><span className="k">Subject</span><span className="v">{item?.user} ({item?.userId})</span></div>
          <div className="pm-kv"><span className="k">Exposure</span><span className="v">{kes(item?.amount ?? 0)}</span></div>
          <div className="pm-kv"><span className="k">Linked transactions</span><span className="v">{item?.transactions}</span></div>
          <div className="pm-kv"><span className="k">Risk indicators</span><span className="v">{item?.risk.join(", ")}</span></div>
        </div>
        <label className="form-label">Referral narrative</label>
        <textarea className="form-control mb-3" rows={4}
          defaultValue={`Based on investigation of ${item?.transactions} linked transactions totalling ${kes(item?.amount ?? 0)}, activity consistent with ${item?.risk.join(", ").toLowerCase()} has been identified. This referral seeks ${agency === "fra" ? "financial intelligence analysis" : agency === "dci" ? "criminal investigation" : "regulatory intervention"}.`} />
        <div className="pm-note" style={{ borderColor: "#d92d20", background: "#fef2f2" }}>
          <i className="bi bi-exclamation-triangle me-1" style={{ color: "#d92d20" }} />
          <b>Confidential referral</b><br />
          <span style={{ fontSize: ".78rem" }}>This referral is classified. Disclosure to the subject or third parties is prohibited under AML/CFT legislation.</span>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger btn-sm"><i className="bi bi-send me-1" />Submit referral</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   12. Training assignment modal
   ================================================================ */
export function TrainingAssignmentModal({ onClose }: { onClose: () => void }) {
  const [course, setCourse] = useState("sar-filing");
  const [due, setDue] = useState("7");
  return (
    <Modal open={true} onClose={onClose} tone="blue" icon="bi-person-plus" size="sm"
      title="Assign training" subtitle="SAR investigation team">
      <div className="pm-modal-body">
        <label className="form-label">Course</label>
        <select className="form-select mb-3" value={course} onChange={e => setCourse(e.target.value)}>
          <option value="sar-filing">SAR Filing Guide</option>
          <option value="red-flags">Red Flags Handbook</option>
          <option value="rule-tuning">Rule Tuning Best Practices</option>
          <option value="regulatory-update">Regulatory Update — July 2026</option>
          <option value="case-studies">Case Study Library</option>
        </select>
        <label className="form-label">Assign to</label>
        <select className="form-select mb-3">
          <option>All investigators</option>
          <option>Compliance team</option>
          <option>Sarah K.</option>
          <option>David K.</option>
          <option>Grace M.</option>
          <option>James O.</option>
        </select>
        <label className="form-label">Due within</label>
        <select className="form-select mb-3" value={due} onChange={e => setDue(e.target.value)}>
          <option value="3">3 days</option>
          <option value="7">7 days</option>
          <option value="14">14 days</option>
          <option value="30">30 days</option>
        </select>
        <div className="pm-note">
          <i className="bi bi-info-circle me-1" />
          Assignees will receive an email notification and in-app reminder. Completion is tracked in the training dashboard.
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm"><i className="bi bi-check me-1" />Assign</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   13. Training resource viewer modal
   ================================================================ */
export function TrainingResourceModal({ resource, onClose }: {
  resource: { name: string; type: string; updated: string; audience: string } | null; onClose: () => void;
}) {
  return (
    <Modal open={!!resource} onClose={onClose} tone="violet" icon="bi-book" size="lg"
      title={resource?.name ?? "Resource"} subtitle={resource ? `${resource.type} · ${resource.audience}` : ""}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3" style={{ background: "#f4f1ff", borderLeft: "3px solid #5925dc" }}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <div style={{ fontWeight: 700, fontSize: ".82rem" }}>{resource?.name}</div>
              <div className="pm-td-sub">Last updated {resource?.updated}</div>
            </div>
            <Badge tone="violet">{resource?.type}</Badge>
          </div>
        </div>
        {resource?.name === "SAR Filing Guide" && (
          <div>
            <div className="pm-eyebrow mb-2">Chapter overview</div>
            {["1. Introduction to SAR filing", "2. When to file a SAR", "3. Gathering evidence", "4. Drafting the narrative", "5. Compliance review process", "6. Filing with FRA", "7. Post-filing obligations"].map((ch, i) => (
              <div key={i} className="pm-alert-row mb-2" style={{ borderLeftColor: "#5925dc" }}>
                <div className="flex-grow-1">
                  <div style={{ fontWeight: 700, fontSize: ".78rem" }}>{ch}</div>
                  <div className="pm-td-sub">{[8, 12, 15, 20, 10, 8, 6][i]} min read</div>
                </div>
                <Badge tone={i < 4 ? "green" : "grey"}>{i < 4 ? "Read" : "New"}</Badge>
              </div>
            ))}
          </div>
        )}
        {resource?.name !== "SAR Filing Guide" && (
          <div className="pm-card pm-card-pad" style={{ background: "#fafbfe" }}>
            <div style={{ fontWeight: 700, fontSize: ".82rem" }}>Resource content</div>
            <div className="pm-td-sub mt-2">
              This {resource?.type?.toLowerCase()} is available in the controlled internal knowledge base.
              Open the resource to view the full content and interactive elements.
            </div>
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-primary btn-sm"><i className="bi bi-box-arrow-up-right me-1" />Open in knowledge base</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   14. Case notes modal — investigator notes
   ================================================================ */
export function CaseNotesModal({ item, onClose }: { item: SarCase | null; onClose: () => void }) {
  const [note, setNote] = useState("");
  const notes = [
    { author: "David K.", time: "Today 09:14", text: "Reviewed transaction chain. 7 linked movements confirmed structuring pattern." },
    { author: "Sarah K.", time: "Today 08:42", text: "KYC snapshot pulled. No adverse media prior to current case." },
    { author: "System", time: "Today 08:30", text: "Case auto-assigned based on rule MON-001. SLA timer started." },
  ];
  return (
    <Modal open={!!item} onClose={onClose} tone="blue" icon="bi-journal-text" size="lg"
      title="Case notes" subtitle={item ? `${item.id} · investigation log` : ""}>
      <div className="pm-modal-body">
        {notes.map((n, i) => (
          <div key={i} className="pm-alert-row mb-2" style={{ borderLeftColor: n.author === "System" ? "#98a2b3" : "#175cd3" }}>
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between">
                <div style={{ fontWeight: 700, fontSize: ".78rem" }}>{n.author}</div>
                <div className="pm-td-sub mono" style={{ fontSize: ".68rem" }}>{n.time}</div>
              </div>
              <div className="pm-td-sub mt-1">{n.text}</div>
            </div>
          </div>
        ))}
        <div className="mt-3">
          <label className="form-label">Add note</label>
          <textarea className="form-control" rows={3} value={note} onChange={e => setNote(e.target.value)}
            placeholder="Enter investigator note..." />
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-primary btn-sm" disabled={!note.trim()}>
          <i className="bi bi-plus-circle me-1" />Add note
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   15. Case closure modal
   ================================================================ */
export function CaseClosureModal({ item, onClose }: { item: SarCase | null; onClose: () => void }) {
  const [outcome, setOutcome] = useState("filed");
  return (
    <Modal open={!!item} onClose={onClose} tone="green" icon="bi-check-circle" size="sm"
      title="Close case" subtitle={item?.id}>
      <div className="pm-modal-body">
        <label className="form-label">Case outcome</label>
        <div className="d-flex flex-column gap-2 mb-3">
          {[
            { id: "filed", label: "Filed as SAR", desc: "Submitted to FRA", tone: "green" },
            { id: "dismissed", label: "Dismissed", desc: "False positive confirmed", tone: "grey" },
            { id: "referred", label: "Law enforcement referral", desc: "Forwarded to DCI/FRA", tone: "red" },
            { id: "merged", label: "Merged into existing case", desc: "Linked to prior filing", tone: "blue" },
          ].map(o => (
            <button key={o.id} className={`pm-alert-row text-start ${outcome === o.id ? "active" : ""}`}
              style={{ borderLeftColor: outcome === o.id ? `var(--pm-${o.tone})` : "transparent" }}
              onClick={() => setOutcome(o.id)}>
              <Badge tone={o.tone}>{o.label}</Badge>
              <div className="pm-td-sub mt-1">{o.desc}</div>
            </button>
          ))}
        </div>
        <label className="form-label">Closure notes</label>
        <textarea className="form-control" rows={3} placeholder="Document closure rationale..." />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm"><i className="bi bi-check me-1" />Close case</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   16. Filing history modal — status tracking
   ================================================================ */
export function FilingHistoryModal({ onClose }: { onClose: () => void }) {
  const filings = [
    { id: "SAR-2026-045", subject: "Coastline Supplies", filed: "22 Aug", status: "Submitted", authority: "FRA" },
    { id: "SAR-2026-030", subject: "James Kamau", filed: "1 Jul", status: "Feedback received", authority: "FRA" },
    { id: "SAR-2026-025", subject: "Grace Muthoni", filed: "15 May", status: "Closed", authority: "FRA" },
    { id: "SAR-2026-018", subject: "Peter Otieno", filed: "1 Mar", status: "Under review", authority: "FRA" },
    { id: "SAR-2026-012", subject: "Nexus Enterprises", filed: "10 Jan", status: "Account frozen", authority: "FRA + DCI" },
  ];
  return (
    <Modal open={true} onClose={onClose} tone="green" icon="bi-file-earmark-check" size="lg"
      title="Filing history" subtitle={`${filings.length} SARs filed year-to-date`}>
      <div className="pm-modal-body">
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead>
              <tr><th>Filing</th><th>Subject</th><th>Filed</th><th>Authority</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filings.map(f => (
                <tr key={f.id}>
                  <td><b>{f.id}</b></td>
                  <td>{f.subject}</td>
                  <td>{f.filed}</td>
                  <td>{f.authority}</td>
                  <td><Badge tone={f.status === "Closed" ? "green" : f.status === "Account frozen" ? "red" : "amber"}>{f.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   17. Regulatory feedback detail modal
   ================================================================ */
export function RegulatoryFeedbackModal({ feedback, onClose }: {
  feedback: { id: string; filed: string; authority: string; date: string; feedback: string; action: string; tone: string } | null; onClose: () => void;
}) {
  return (
    <Modal open={!!feedback} onClose={onClose} tone="amber" icon="bi-chat-square-text" size="lg"
      title="Regulatory feedback" subtitle={feedback ? `${feedback.id} · ${feedback.authority}` : ""}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3" style={{ background: feedback?.tone === "red" ? "#fef2f2" : feedback?.tone === "amber" ? "#fff5e6" : "#eff8ff", borderLeft: `3px solid ${feedback?.tone === "red" ? "#d92d20" : feedback?.tone === "amber" ? "#f79009" : "#175cd3"}` }}>
          <div className="pm-kv"><span className="k">Authority</span><span className="v">{feedback?.authority}</span></div>
          <div className="pm-kv"><span className="k">Feedback date</span><span className="v">{feedback?.date}</span></div>
          <div className="pm-kv"><span className="k">Original filing</span><span className="v">{feedback?.filed}</span></div>
          <div className="pm-kv"><span className="k">Response</span><span className="v">{feedback?.action}</span></div>
        </div>
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-eyebrow mb-2">Authority feedback</div>
          <div style={{ fontSize: ".82rem", lineHeight: 1.6 }}>{feedback?.feedback}</div>
        </div>
        <div className="pm-eyebrow mb-2">Response timeline</div>
        <div className="pm-alert-row mb-2" style={{ borderLeftColor: "#12b76a" }}>
          <div className="flex-grow-1">
            <div className="mono" style={{ fontWeight: 700, fontSize: ".72rem", color: "#12b76a" }}>{feedback?.date}</div>
            <div className="pm-td-sub">Feedback received from {feedback?.authority}</div>
          </div>
        </div>
        <div className="pm-alert-row mb-2" style={{ borderLeftColor: "#175cd3" }}>
          <div className="flex-grow-1">
            <div className="mono" style={{ fontWeight: 700, fontSize: ".72rem", color: "#175cd3" }}>{feedback?.filed}</div>
            <div className="pm-td-sub">SAR submitted to {feedback?.authority}</div>
          </div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-primary btn-sm"><i className="bi bi-reply me-1" />Draft response</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   18. Calibration detail modal
   ================================================================ */
export function CalibrationDetailModal({ rule, onClose }: { rule: MonitorRule | null; onClose: () => void }) {
  return (
    <Modal open={!!rule} onClose={onClose} tone="amber" icon="bi-speedometer" size="lg"
      title="Calibration proposal" subtitle={rule ? `${rule.id} · threshold adjustment` : ""}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3" style={{ background: "#fff5e6", borderLeft: "3px solid #f79009" }}>
          <div style={{ fontWeight: 700, fontSize: ".82rem" }}>{rule?.name}</div>
          <div className="pm-td-sub mt-1">{rule?.trigger}</div>
        </div>
        <div className="row g-3 mb-3">
          <div className="col-6">
            <div className="pm-card pm-card-pad text-center" style={{ background: "#fafbfe" }}>
              <div className="pm-eyebrow mb-1">CURRENT</div>
              <div style={{ fontWeight: 800, fontSize: "1.2rem" }}>{rule?.hits} hits</div>
              <div className="pm-td-sub">{rule?.fp}% false positive</div>
            </div>
          </div>
          <div className="col-6">
            <div className="pm-card pm-card-pad text-center" style={{ background: "#e7f8ef" }}>
              <div className="pm-eyebrow mb-1">PROPOSED</div>
              <div style={{ fontWeight: 800, fontSize: "1.2rem", color: "#0b8f52" }}>{rule ? Math.round(rule.hits * 0.85) : 0} hits</div>
              <div className="pm-td-sub" style={{ color: "#0b8f52" }}>{rule ? Math.round(rule.fp * 0.75) : 0}% false positive</div>
            </div>
          </div>
        </div>
        <div className="pm-eyebrow mb-2">Impact analysis</div>
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Alert reduction</span><span className="v" style={{ color: "#0b8f52" }}>-15%</span></div>
          <div className="pm-kv"><span className="k">FP improvement</span><span className="v" style={{ color: "#0b8f52" }}>-25%</span></div>
          <div className="pm-kv"><span className="k">Coverage impact</span><span className="v"><Badge tone="green">No change</Badge></span></div>
          <div className="pm-kv"><span className="k">Backtest period</span><span className="v">30 days</span></div>
        </div>
        <div className="pm-note">
          <i className="bi bi-info-circle me-1" />
          Calibration proposals require Compliance Officer approval before production deployment.
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Reject</button>
        <button className="btn btn-primary btn-sm"><i className="bi bi-check me-1" />Approve calibration</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   19. Case timeline modal — full event history
   ================================================================ */
export function CaseTimelineModal({ item, onClose }: { item: SarCase | null; onClose: () => void }) {
  const events = [
    { time: "Now", title: "Case routed for compliance decision", desc: "Awaiting Compliance Officer review", color: "#5925dc", icon: "bi-arrow-right-circle" },
    { time: "-24m", title: "Investigation notes added", desc: "David K.: Transaction chain analysis complete", color: "#175cd3", icon: "bi-journal-text" },
    { time: "-1h", title: "Protective control applied", desc: `Hold active on ${item?.userId}`, color: "#f79009", icon: "bi-lock" },
    { time: "-2h", title: "KYC snapshot captured", desc: "Identity and address verified", color: "#175cd3", icon: "bi-person-vcard" },
    { time: "-3h", title: "Evidence sealed", desc: "6 artifacts hashed and timestamped", color: "#5925dc", icon: "bi-safe2" },
    { time: "-4h", title: "Case assigned", desc: `${item?.owner} assigned as investigator`, color: "#12b76a", icon: "bi-person-check" },
    { time: "-5h", title: "Risk indicators flagged", desc: item?.risk.join(", "), color: "#d92d20", icon: "bi-flag" },
    { time: "-6h", title: "Rule triggered", desc: item?.rule, color: "#d92d20", icon: "bi-lightning" },
    { time: "-6h", title: "Case created", desc: "Auto-flagged by rules engine", color: "#98a2b3", icon: "bi-plus-circle" },
  ];
  return (
    <Modal open={!!item} onClose={onClose} tone="blue" icon="bi-diagram-3" size="lg"
      title="Case timeline" subtitle={item ? `${item.id} · full event history` : ""}>
      <div className="pm-modal-body">
        {events.map((e, i) => (
          <div key={i} className="d-flex gap-3 mb-3">
            <div className="d-flex flex-column align-items-center">
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: e.color + "18", color: e.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className={`bi ${e.icon}`} style={{ fontSize: ".72rem" }} />
              </div>
              {i < events.length - 1 && <div style={{ width: 1, flex: 1, background: "#e4e7ec", marginTop: 4 }} />}
            </div>
            <div className="flex-grow-1 pb-2">
              <div className="d-flex justify-content-between align-items-center">
                <div style={{ fontWeight: 700, fontSize: ".78rem" }}>{e.title}</div>
                <div className="mono pm-td-sub" style={{ fontSize: ".65rem" }}>{e.time}</div>
              </div>
              <div className="pm-td-sub mt-1">{e.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}
