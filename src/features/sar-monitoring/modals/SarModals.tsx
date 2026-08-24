import { useState } from "react";
import { Badge, Drawer, Modal, Steps, useToast } from "../../../components/ui";
import { AuthorityPanel } from "../../../components/AuthorityPanel";
import { kes } from "../../../lib/format";
import type { MonitorRule, SarCase } from "../data/sarData";

/* ================================================================
   1. Case evidence drawer
   ================================================================ */
export function CaseDrawer({ item, onClose, onAssign, onFile }: {
  item: SarCase | null; onClose: () => void; onAssign: (x: SarCase) => void; onFile: (x: SarCase) => void;
}) {
  const { push } = useToast();
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
          {/* Authority panel */}
          <div className="d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap">
            <AuthorityPanel area="SAR investigation" auditRef="AUD-SAR-22048"
              permissions={["Assign and reassign cases", "Apply transaction restrictions",
                "Prepare and submit SARs", "Escalate to FRA or DCI"]} />
            <Badge tone="ink"><i className="bi bi-lock-fill" /> Evidence sealed</Badge>
          </div>

          {/* Subject & exposure card */}
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

          {/* Case details */}
          <div className="pm-card pm-card-pad mb-3">
            <div className="pm-kv"><span className="k">Rule triggered</span><span className="v">{item.rule}</span></div>
            <div className="pm-kv"><span className="k">Case owner</span><span className="v">{item.owner}</span></div>
            <div className="pm-kv"><span className="k">Current control</span><span className="v">{item.status}</span></div>
            <div className="pm-kv"><span className="k">Case age</span><span className="v">{item.age}</span></div>
          </div>

          {/* Risk indicators */}
          <div className="pm-eyebrow mb-2">Risk indicators</div>
          <div className="d-flex flex-wrap gap-2 mb-3">
            {item.risk.map(x => (
              <Badge key={x} tone="amber"><i className="bi bi-exclamation-triangle me-1" />{x}</Badge>
            ))}
          </div>

          {/* Evidence timeline */}
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

          {/* Case investigation workspace */}
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
                <button className="pm-alert-row text-start" style={{ borderLeftColor: "#5925dc" }} onClick={() => push({ kind: "info", title: "Transaction chain opened", body: `${item.transactions} linked movements are available for investigator review.` })}>
                  <i className="bi bi-arrow-left-right" style={{ color: "#5925dc", fontSize: ".9rem" }} />
                  <div className="flex-grow-1">
                    <div style={{ fontWeight: 700, fontSize: ".78rem" }}>Transaction chain</div>
                    <div className="pm-td-sub">Counterparties & amounts</div>
                  </div>
                </button>
                <button className="pm-alert-row text-start" style={{ borderLeftColor: "#5925dc" }} onClick={() => push({ kind: "info", title: "KYC snapshot loaded", body: `Point-in-time KYC and profile evidence for ${item.userId} has been retained.` })}>
                  <i className="bi bi-person-vcard" style={{ color: "#5925dc", fontSize: ".9rem" }} />
                  <div className="flex-grow-1">
                    <div style={{ fontWeight: 700, fontSize: ".78rem" }}>KYC snapshot</div>
                    <div className="pm-td-sub">Identity & account profile</div>
                  </div>
                </button>
                <button className="pm-alert-row text-start" style={{ borderLeftColor: "#5925dc" }} onClick={() => push({ kind: "info", title: "Prior SAR history searched", body: "Historical regulator submissions and related cases were correlated." })}>
                  <i className="bi bi-clock-history" style={{ color: "#5925dc", fontSize: ".9rem" }} />
                  <div className="flex-grow-1">
                    <div style={{ fontWeight: 700, fontSize: ".78rem" }}>Prior SARs</div>
                    <div className="pm-td-sub">History & regulator feedback</div>
                  </div>
                </button>
                <button className="pm-alert-row text-start" style={{ borderLeftColor: "#5925dc" }} onClick={() => push({ kind: "info", title: "Evidence export staged", body: "Redacted logs and supporting records are staged for authorised filing." })}>
                  <i className="bi bi-safe2" style={{ color: "#5925dc", fontSize: ".9rem" }} />
                  <div className="flex-grow-1">
                    <div style={{ fontWeight: 700, fontSize: ".78rem" }}>Evidence locker</div>
                    <div className="pm-td-sub">Logs, documents & hashes</div>
                  </div>
                </button>
              </div>
              <div className="d-flex gap-2 flex-wrap mt-3">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => push({ kind: "info", title: "Customer outreach task created", body: `Contact record attached to ${item.id}.` })}>
                  <i className="bi bi-telephone me-1" />Contact subject
                </button>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => push({ kind: "warning", title: "Restriction approval requested", body: `A request to extend ${item.status.toLowerCase()} was sent for Super Admin approval.` })}>
                  <i className="bi bi-lock me-1" />Extend restriction
                </button>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => push({ kind: "info", title: "Regulator information request drafted", body: `FRA information request draft linked to ${item.id}.` })}>
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
