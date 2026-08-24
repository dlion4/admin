import { useState } from "react";
import { Badge, Drawer, Modal, Steps, useToast } from "../../../components/ui";
import { AuthorityPanel } from "../../../components/AuthorityPanel";
import type { Hit } from "../data/amlData";

/* ================================================================
   1. Screening review drawer
   ================================================================ */
export function ScreeningDrawer({ hit, onClose, onAssign, onDecision }: {
  hit: Hit | null; onClose: () => void; onAssign: (h: Hit) => void; onDecision: (h: Hit) => void;
}) {
  const { push } = useToast();
  return (
    <Drawer open={!!hit} onClose={onClose} half
      icon="bi-shield-check" tone="red"
      title={hit ? `${hit.id} · ${hit.type}` : "Screening review"}
      subtitle="Sanctions and AML decision workspace"
      footer={hit && (
        <div className="d-flex gap-2 w-100">
          <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => onAssign(hit)}>
            <i className="bi bi-person-plus me-1" />Assign
          </button>
          <button className="btn btn-outline-danger btn-sm flex-grow-1" onClick={() => onDecision(hit)}>
            <i className="bi bi-shield-exclamation me-1" />Record decision
          </button>
          <button className="btn btn-primary btn-sm flex-grow-1" onClick={onClose}>Close workspace</button>
        </div>
      )}>
      {hit && (
        <div>
          {/* Authority panel */}
          <div className="d-flex justify-content-between align-items-center gap-2 mb-3 flex-wrap">
            <AuthorityPanel area="AML screening decision" auditRef="AUD-AML-62018"
              permissions={["Clear or confirm screening matches", "Freeze and restrict matched accounts",
                "Escalate to MLRO and authorities", "Manage screening lists and rules"]} />
            <Badge tone="ink">Evidence retained</Badge>
          </div>

          {/* Match confidence hero */}
          <div className="pm-card pm-card-pad mb-3" style={{ background: "#fef2f2", borderLeft: "3px solid #f04438" }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="pm-eyebrow mb-1" style={{ fontSize: ".62rem" }}>MATCH CONFIDENCE</span>
                <div className="d-flex align-items-baseline gap-2">
                  <span style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "2rem", color: "#b42318" }}>
                    {hit.score}%
                  </span>
                  <span className="pm-td-sub">{hit.confidence} confidence · {hit.status}</span>
                </div>
              </div>
              <Badge tone={hit.score > 85 ? "red" : "amber"}>{hit.list}</Badge>
            </div>
          </div>

          {/* Customer vs Screening comparison */}
          <div className="pm-eyebrow mb-2">Comparison</div>
          <div className="d-flex gap-2 mb-3">
            <div className="pm-card pm-card-pad flex-grow-1">
              <div className="pm-eyebrow mb-1">Customer profile</div>
              <div style={{ fontWeight: 700, fontSize: ".82rem" }}>{hit.name}</div>
              <div className="pm-td-sub">{hit.user} · {hit.kyc} · {hit.country}</div>
            </div>
            <div className="d-flex align-items-center" style={{ color: "#5925dc" }}>
              <i className="bi bi-arrow-left-right" />
            </div>
            <div className="pm-card pm-card-pad flex-grow-1">
              <div className="pm-eyebrow mb-1">Screening record</div>
              <div style={{ fontWeight: 700, fontSize: ".82rem" }}>{hit.list} candidate</div>
              <div className="pm-td-sub">{hit.type} · score {hit.score}%</div>
            </div>
          </div>

          {/* Decision evidence workspace */}
          <div className="pm-card mb-3" style={{ background: "#fafbfe", border: "1px solid var(--pm-border)" }}>
            <div className="pm-card-pad">
              <div style={{ fontWeight: 700, fontSize: ".82rem", marginBottom: ".5rem" }}>Decision evidence</div>
              <div className="d-flex flex-column gap-2">
                <button className="pm-alert-row text-start" style={{ borderLeftColor: "#5925dc" }} onClick={() => push({ kind: "info", title: "KYC profile opened", body: "Identity, address and document evidence is retained in the controlled case record." })}>
                  <i className="bi bi-person-vcard" style={{ color: "#5925dc", fontSize: ".9rem" }} />
                  <div className="flex-grow-1">
                    <div style={{ fontWeight: 700, fontSize: ".78rem" }}>KYC & identity</div>
                    <div className="pm-td-sub">Point-in-time snapshot</div>
                  </div>
                </button>
                <button className="pm-alert-row text-start" style={{ borderLeftColor: "#5925dc" }} onClick={() => push({ kind: "info", title: "List evidence opened", body: `The ${hit.list} source snapshot and matched fields were sealed for review.` })}>
                  <i className="bi bi-journal-bookmark" style={{ color: "#5925dc", fontSize: ".9rem" }} />
                  <div className="flex-grow-1">
                    <div style={{ fontWeight: 700, fontSize: ".78rem" }}>List evidence</div>
                    <div className="pm-td-sub">Source snapshot & fields</div>
                  </div>
                </button>
                <button className="pm-alert-row text-start" style={{ borderLeftColor: "#5925dc" }} onClick={() => push({ kind: "info", title: "Prior screening history opened", body: "All prior screening decisions and review notes were correlated." })}>
                  <i className="bi bi-clock-history" style={{ color: "#5925dc", fontSize: ".9rem" }} />
                  <div className="flex-grow-1">
                    <div style={{ fontWeight: 700, fontSize: ".78rem" }}>Prior screenings</div>
                    <div className="pm-td-sub">History & decisions</div>
                  </div>
                </button>
                <button className="pm-alert-row text-start" style={{ borderLeftColor: "#5925dc" }} onClick={() => push({ kind: "info", title: "Adverse-media evidence opened", body: "Supporting articles, sources and verification dates are retained." })}>
                  <i className="bi bi-newspaper" style={{ color: "#5925dc", fontSize: ".9rem" }} />
                  <div className="flex-grow-1">
                    <div style={{ fontWeight: 700, fontSize: ".78rem" }}>Media evidence</div>
                    <div className="pm-td-sub">Articles & source checks</div>
                  </div>
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
   2. Decision wizard
   ================================================================ */
export function DecisionWizard({ hit, onClose, onSave }: {
  hit: Hit | null; onClose: () => void; onSave: (d: string) => void;
}) {
  const [s, setS] = useState(0);
  const [d, setD] = useState("True match — freeze + report");
  return (
    <Modal open={!!hit} onClose={onClose} tone="red" icon="bi-shield-lock" size="md"
      title="Record screening decision" subtitle="Privileged compliance determination">
      <div className="pm-modal-body">
        <AuthorityPanel area="AML match disposition" auditRef="AUD-AML-71033"
          permissions={["Confirm or clear matches", "Apply customer freezes",
            "File MLRO escalation", "Create regulatory disclosure"]} />
        <div className="mb-3">
          <Steps current={s} steps={[
            { label: "Assessment", icon: "bi-search" },
            { label: "Rationale", icon: "bi-journal-text" },
            { label: "Confirm", icon: "bi-shield-check" },
          ]} />
        </div>
        {s === 0 && (
          <div>
            <label className="form-label">Disposition</label>
            <select className="form-select" value={d} onChange={e => setD(e.target.value)}>
              <option>True match — freeze + report</option>
              <option>False positive — clear with rationale</option>
              <option>Escalate to MLRO</option>
              <option>Enhanced due diligence required</option>
            </select>
          </div>
        )}
        {s === 1 && (
          <div>
            <label className="form-label">Decision rationale <span style={{ color: "#f04438" }}>*</span></label>
            <textarea className="form-control mb-3" rows={4}
              defaultValue="Reviewed identity, list-source details, account behaviour and supporting evidence." />
            <div className="pm-note" style={{ borderColor: "#f79009", background: "#fff5e6" }}>
              <i className="bi bi-exclamation-triangle me-1" style={{ color: "#f79009" }} />
              True-match outcomes automatically notify the MLRO and preserve all supporting evidence.
            </div>
          </div>
        )}
        {s === 2 && (
          <div className="pm-note" style={{ borderColor: "#f04438", background: "#fef2f2" }}>
            <i className="bi bi-exclamation-triangle me-1" style={{ color: "#f04438" }} />
            <b>Final compliance confirmation</b><br />
            <span style={{ fontSize: ".78rem" }}>This decision is immutable. A correction requires a separately logged Super Admin and compliance action.</span>
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        {s > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setS(s - 1)}>Back</button>}
        <div className="flex-grow-1" />
        <button className="btn btn-primary btn-sm" onClick={() => s < 2 ? setS(s + 1) : onSave(d)}>
          {s === 2 ? "Confirm decision" : "Continue"}
        </button>
      </div>
    </Modal>
  );
}
