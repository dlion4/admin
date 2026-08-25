import { useState } from "react";
import { Badge, Drawer, Modal, Steps, Meter, useToast } from "../../../components/ui";
import { AuthorityPanel } from "../../../components/AuthorityPanel";
import { num } from "../../../lib/format";
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

/* ================================================================
   3. KYC Profile Modal
   ================================================================ */
export function KycProfileModal({ hit, onClose }: { hit: Hit | null; onClose: () => void }) {
  if (!hit) return null;
  return (
    <Modal open={!!hit} onClose={onClose} tone="blue" icon="bi-person-vcard" size="md"
      title="KYC & identity profile" subtitle={`${hit.name} · ${hit.user}`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Full name</span><span className="v">{hit.name}</span></div>
          <div className="pm-kv"><span className="k">Account</span><span className="v mono">{hit.user}</span></div>
          <div className="pm-kv"><span className="k">KYC tier</span><span className="v">{hit.kyc}</span></div>
          <div className="pm-kv"><span className="k">Country</span><span className="v">{hit.country}</span></div>
          <div className="pm-kv"><span className="k">Verified on</span><span className="v">14 Aug 2026</span></div>
        </div>
        <div className="pm-eyebrow mb-2">Identity documents</div>
        {[
          { doc: "National ID", status: "Verified", date: "14 Aug 2026", color: "#12b76a" },
          { doc: "Proof of address", status: "Verified", date: "14 Aug 2026", color: "#12b76a" },
          { doc: "Source of funds", status: "Pending", date: "—", color: "#f79009" },
        ].map((d, i) => (
          <div key={i} className="pm-alert-row mb-2" style={{ borderLeftColor: d.color }}>
            <div className="flex-grow-1">
              <div style={{ fontWeight: 700, fontSize: ".78rem" }}>{d.doc}</div>
              <div className="pm-td-sub">{d.date}</div>
            </div>
            <Badge tone={d.status === "Verified" ? "green" : "amber"}>{d.status}</Badge>
          </div>
        ))}
        <div className="pm-eyebrow mb-2 mt-3">Risk indicators</div>
        <div className="pm-card pm-card-pad">
          <div className="pm-kv"><span className="k">PEP status</span><span className="v">Not flagged</span></div>
          <div className="pm-kv"><span className="k">Sanctions</span><span className="v"><Badge tone={hit.score > 85 ? "red" : "amber"}>{hit.score > 85 ? "Match" : "Review"}</Badge></span></div>
          <div className="pm-kv"><span className="k">Adverse media</span><span className="v">None found</span></div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-primary btn-sm"><i className="bi bi-download me-1" />Export profile</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   4. List Evidence Modal
   ================================================================ */
export function ListEvidenceModal({ hit, onClose }: { hit: Hit | null; onClose: () => void }) {
  if (!hit) return null;
  return (
    <Modal open={!!hit} onClose={onClose} tone="red" icon="bi-journal-bookmark" size="md"
      title="List evidence" subtitle={`${hit.list} · ${hit.type}`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3" style={{ background: "#fef2f2", borderLeft: "3px solid #f04438" }}>
          <div className="pm-eyebrow mb-1">MATCH SNAPSHOT</div>
          <div style={{ fontWeight: 700, fontSize: ".9rem" }}>{hit.name}</div>
          <div className="pm-td-sub">Matched against {hit.list} · {hit.confidence} confidence</div>
        </div>
        <div className="pm-eyebrow mb-2">Matched fields</div>
        {[
          { field: "Full name", value: hit.name, score: "98%" },
          { field: "Date of birth", value: "15 Mar 1985", score: "92%" },
          { field: "Nationality", value: hit.country, score: "100%" },
          { field: "Alias", value: "Abdul Rahman", score: "87%" },
        ].map((f, i) => (
          <div key={i} className="pm-alert-row mb-2" style={{ borderLeftColor: parseInt(f.score) > 90 ? "#f04438" : "#f79009" }}>
            <div className="flex-grow-1">
              <div style={{ fontWeight: 700, fontSize: ".78rem" }}>{f.field}</div>
              <div className="pm-td-sub">{f.value}</div>
            </div>
            <Badge tone={parseInt(f.score) > 90 ? "red" : "amber"}>{f.score}</Badge>
          </div>
        ))}
        <div className="pm-eyebrow mb-2 mt-3">Source metadata</div>
        <div className="pm-card pm-card-pad">
          <div className="pm-kv"><span className="k">Source</span><span className="v">{hit.list}</span></div>
          <div className="pm-kv"><span className="k">Last refreshed</span><span className="v">22 Aug 2026</span></div>
          <div className="pm-kv"><span className="k">Algorithm</span><span className="v">Fuzzy + exact match</span></div>
          <div className="pm-kv"><span className="k">Sealed hash</span><span className="v mono" style={{ fontSize: ".7rem" }}>SHA-256:9f86d08...</span></div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-primary btn-sm"><i className="bi bi-download me-1" />Export evidence</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   5. Prior Screenings Modal
   ================================================================ */
export function PriorScreeningsModal({ hit, onClose }: { hit: Hit | null; onClose: () => void }) {
  if (!hit) return null;
  const history = [
    { date: "Aug 22", list: hit.list, result: "New match", decision: "Pending", owner: "Sarah K." },
    { date: "Jul 15", list: "OFAC SDN", result: "Cleared", decision: "False positive", owner: "David K." },
    { date: "May 03", list: "EU Consolidated", result: "No match", decision: "—", owner: "System" },
  ];
  return (
    <Modal open={!!hit} onClose={onClose} tone="blue" icon="bi-clock-history" size="md"
      title="Prior screening history" subtitle={`${hit.name} · ${hit.user}`}>
      <div className="pm-modal-body">
        {history.map((h, i) => (
          <div key={i} className="pm-alert-row mb-2" style={{ borderLeftColor: h.result === "Cleared" ? "#12b76a" : h.result === "New match" ? "#f04438" : "#175cd3" }}>
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2 mb-1">
                <span style={{ fontWeight: 700, fontSize: ".78rem" }}>{h.list}</span>
                <span className="pm-td-sub">{h.date}</span>
              </div>
              <div className="pm-td-sub">{h.result} · {h.decision !== "—" ? h.decision : "Auto-screened"}</div>
            </div>
            <Badge tone={h.result === "Cleared" ? "green" : h.result === "New match" ? "red" : "blue"}>{h.result}</Badge>
          </div>
        ))}
        <div className="pm-note mt-3">
          <i className="bi bi-info-circle me-1" />
          All screening history is immutable and forms part of the regulatory audit trail.
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-primary btn-sm"><i className="bi bi-download me-1" />Export history</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   6. Adverse Media Modal
   ================================================================ */
export function AdverseMediaModal({ hit, onClose }: { hit: Hit | null; onClose: () => void }) {
  if (!hit) return null;
  const articles = [
    { title: "Suspected money laundering ring dismantled", source: "Daily Nation", date: "18 Aug 2026", sentiment: "Negative" },
    { title: "New AML regulations issued by CBK", source: "Business Daily", date: "12 Aug 2026", sentiment: "Neutral" },
    { title: "Financial crime task force report", source: "The Standard", date: "05 Aug 2026", sentiment: "Negative" },
  ];
  return (
    <Modal open={!!hit} onClose={onClose} tone="amber" icon="bi-newspaper" size="md"
      title="Adverse media evidence" subtitle={`${hit.name} · ${articles.length} articles`}>
      <div className="pm-modal-body">
        {articles.map((a, i) => (
          <div key={i} className="pm-alert-row mb-2" style={{ borderLeftColor: a.sentiment === "Negative" ? "#f04438" : "#175cd3" }}>
            <div className="flex-grow-1">
              <div style={{ fontWeight: 700, fontSize: ".78rem" }}>{a.title}</div>
              <div className="pm-td-sub">{a.source} · {a.date}</div>
            </div>
            <Badge tone={a.sentiment === "Negative" ? "red" : "blue"}>{a.sentiment}</Badge>
          </div>
        ))}
        <div className="pm-note mt-3">
          <i className="bi bi-info-circle me-1" />
          Media monitoring runs daily. Negative articles are flagged for immediate review.
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-primary btn-sm"><i className="bi bi-download me-1" />Export articles</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   7. Screening Source Detail Modal
   ================================================================ */
export function ScreeningSourceModal({ source, onClose }: { source: { name: string; source: string; entries: string; updated: string; frequency: string; algorithm: string } | null; onClose: () => void }) {
  if (!source) return null;
  return (
    <Modal open={!!source} onClose={onClose} tone="violet" icon="bi-database" size="md"
      title={`${source.name} control`} subtitle={`${source.source} · Active`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">List name</span><span className="v">{source.name}</span></div>
          <div className="pm-kv"><span className="k">Source</span><span className="v">{source.source}</span></div>
          <div className="pm-kv"><span className="k">Entries</span><span className="v">{source.entries}</span></div>
          <div className="pm-kv"><span className="k">Last updated</span><span className="v">{source.updated}</span></div>
          <div className="pm-kv"><span className="k">Refresh frequency</span><span className="v">{source.frequency}</span></div>
          <div className="pm-kv"><span className="k">Algorithm</span><span className="v">{source.algorithm}</span></div>
        </div>
        <div className="pm-eyebrow mb-2">Refresh history</div>
        {[
          { date: "22 Aug 2026", status: "Success", entries: "1,234,567", duration: "4m 32s" },
          { date: "21 Aug 2026", status: "Success", entries: "1,234,567", duration: "4m 18s" },
          { date: "20 Aug 2026", status: "Partial", entries: "892,341", duration: "12m 05s" },
        ].map((r, i) => (
          <div key={i} className="pm-alert-row mb-2" style={{ borderLeftColor: r.status === "Success" ? "#12b76a" : "#f79009" }}>
            <div className="flex-grow-1">
              <div style={{ fontWeight: 700, fontSize: ".78rem" }}>{r.date}</div>
              <div className="pm-td-sub">{r.entries} entries · {r.duration}</div>
            </div>
            <Badge tone={r.status === "Success" ? "green" : "amber"}>{r.status}</Badge>
          </div>
        ))}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-primary btn-sm"><i className="bi bi-arrow-repeat me-1" />Refresh now</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   8. EDD Case Detail Modal
   ================================================================ */
export function EddCaseModal({ caseData, onClose }: { caseData: { id: string; customer: string; risk: string; status: string; sof: string; nextReview: string } | null; onClose: () => void }) {
  if (!caseData) return null;
  return (
    <Modal open={!!caseData} onClose={onClose} tone="red" icon="bi-person-lock" size="md"
      title={`EDD case ${caseData.id}`} subtitle={caseData.customer}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Case ID</span><span className="v mono">{caseData.id}</span></div>
          <div className="pm-kv"><span className="k">Customer</span><span className="v">{caseData.customer}</span></div>
          <div className="pm-kv"><span className="k">Risk level</span><span className="v"><Badge tone={caseData.risk === "Critical" ? "red" : "amber"}>{caseData.risk}</Badge></span></div>
          <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone={caseData.status === "Complete" ? "green" : caseData.status === "Overdue" ? "red" : "amber"}>{caseData.status}</Badge></span></div>
          <div className="pm-kv"><span className="k">Source of funds</span><span className="v">{caseData.sof}</span></div>
          <div className="pm-kv"><span className="k">Next review</span><span className="v">{caseData.nextReview}</span></div>
        </div>
        <div className="pm-eyebrow mb-2">Required evidence</div>
        {[
          { item: "Source of funds declaration", status: caseData.sof.includes("awaiting") ? "Pending" : "Complete" },
          { item: "Enhanced identity verification", status: "Complete" },
          { item: "Beneficial ownership disclosure", status: "Complete" },
          { item: "Ongoing monitoring plan", status: "Complete" },
        ].map((e, i) => (
          <div key={i} className="pm-alert-row mb-2" style={{ borderLeftColor: e.status === "Complete" ? "#12b76a" : "#f79009" }}>
            <div className="flex-grow-1">
              <div style={{ fontWeight: 700, fontSize: ".78rem" }}>{e.item}</div>
            </div>
            <Badge tone={e.status === "Complete" ? "green" : "amber"}>{e.status}</Badge>
          </div>
        ))}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-primary btn-sm"><i className="bi bi-download me-1" />Export case</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   9. Training Course Modal
   ================================================================ */
export function TrainingCourseModal({ course, onClose }: { course: { name: string; requiredFor: string; completion: number; lastUpdated: string; nextDue: string } | null; onClose: () => void }) {
  if (!course) return null;
  return (
    <Modal open={!!course} onClose={onClose} tone="blue" icon="bi-mortarboard" size="md"
      title="Course administration" subtitle={course.name}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Course</span><span className="v">{course.name}</span></div>
          <div className="pm-kv"><span className="k">Required for</span><span className="v">{course.requiredFor}</span></div>
          <div className="pm-kv"><span className="k">Completion</span><span className="v"><Meter value={course.completion} tone={course.completion === 100 ? "#12b76a" : "#f79009"} width={100} /> {course.completion}%</span></div>
          <div className="pm-kv"><span className="k">Last updated</span><span className="v">{course.lastUpdated}</span></div>
          <div className="pm-kv"><span className="k">Next due</span><span className="v">{course.nextDue}</span></div>
        </div>
        <div className="pm-eyebrow mb-2">Staff roster</div>
        {[
          { name: "Sarah Kamau", status: "Complete", date: "15 Aug 2026" },
          { name: "David Kiprop", status: "Complete", date: "12 Aug 2026" },
          { name: "Grace Muthoni", status: "In progress", date: "—" },
          { name: "James Otieno", status: "Overdue", date: "—" },
        ].map((s, i) => (
          <div key={i} className="pm-alert-row mb-2" style={{ borderLeftColor: s.status === "Complete" ? "#12b76a" : s.status === "Overdue" ? "#f04438" : "#f79009" }}>
            <div className="flex-grow-1">
              <div style={{ fontWeight: 700, fontSize: ".78rem" }}>{s.name}</div>
              <div className="pm-td-sub">{s.date}</div>
            </div>
            <Badge tone={s.status === "Complete" ? "green" : s.status === "Overdue" ? "red" : "amber"}>{s.status}</Badge>
          </div>
        ))}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-primary btn-sm"><i className="bi bi-download me-1" />Export roster</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   10. Regulatory Inquiry Modal
   ================================================================ */
export function RegulatoryInquiryModal({ inquiry, onClose }: { inquiry: { id: string; subject: string; deadline: string; status: string } | null; onClose: () => void }) {
  if (!inquiry) return null;
  return (
    <Modal open={!!inquiry} onClose={onClose} tone={inquiry.status === "red" ? "red" : "amber"} icon="bi-building" size="md"
      title={`${inquiry.id} inquiry`} subtitle={inquiry.subject}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Inquiry ID</span><span className="v mono">{inquiry.id}</span></div>
          <div className="pm-kv"><span className="k">Subject</span><span className="v">{inquiry.subject}</span></div>
          <div className="pm-kv"><span className="k">Deadline</span><span className="v"><Badge tone={inquiry.status}>{inquiry.deadline}</Badge></span></div>
          <div className="pm-kv"><span className="k">Status</span><span className="v">{inquiry.status === "red" ? "Urgent" : inquiry.status === "amber" ? "In progress" : "Submitted"}</span></div>
        </div>
        <div className="pm-eyebrow mb-2">Response timeline</div>
        {[
          { date: "22 Aug 2026", action: "Response drafted", by: "Sarah K." },
          { date: "20 Aug 2026", action: "Evidence gathered", by: "David K." },
          { date: "18 Aug 2026", action: "Inquiry received", by: "System" },
        ].map((t, i) => (
          <div key={i} className="pm-alert-row mb-2" style={{ borderLeftColor: "#175cd3" }}>
            <div className="flex-grow-1">
              <div style={{ fontWeight: 700, fontSize: ".78rem" }}>{t.action}</div>
              <div className="pm-td-sub">By {t.by} · {t.date}</div>
            </div>
          </div>
        ))}
        <div className="pm-note mt-3">
          <i className="bi bi-shield-lock me-1" />
          Responses require Compliance Officer approval; Super Admin retains final release authority.
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-primary btn-sm"><i className="bi bi-send me-1" />Submit response</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   11. AML Policy Document Modal
   ================================================================ */
export function AmlPolicyModal({ policy, onClose }: { policy: { name: string; version: string; lastApproved: string; approvedBy: string; nextReview: string } | null; onClose: () => void }) {
  if (!policy) return null;
  return (
    <Modal open={!!policy} onClose={onClose} tone="violet" icon="bi-file-earmark-text" size="md"
      title={policy.name} subtitle={`Version ${policy.version}`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Document</span><span className="v">{policy.name}</span></div>
          <div className="pm-kv"><span className="k">Version</span><span className="v"><Badge tone="violet">{policy.version}</Badge></span></div>
          <div className="pm-kv"><span className="k">Last approved</span><span className="v">{policy.lastApproved}</span></div>
          <div className="pm-kv"><span className="k">Approved by</span><span className="v">{policy.approvedBy}</span></div>
          <div className="pm-kv"><span className="k">Next review</span><span className="v">{policy.nextReview}</span></div>
        </div>
        <div className="pm-eyebrow mb-2">Version history</div>
        {[
          { version: policy.version, date: policy.lastApproved, by: policy.approvedBy, change: "Current version" },
          { version: "Previous", date: "Jan 2026", by: "Board", change: "Annual review update" },
        ].map((v, i) => (
          <div key={i} className="pm-alert-row mb-2" style={{ borderLeftColor: i === 0 ? "#5925dc" : "#175cd3" }}>
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2 mb-1">
                <span style={{ fontWeight: 700, fontSize: ".78rem" }}>{v.version}</span>
                <span className="pm-td-sub">{v.date}</span>
              </div>
              <div className="pm-td-sub">By {v.by} · {v.change}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-primary btn-sm"><i className="bi bi-download me-1" />Download PDF</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   12. Examination Readiness Modal
   ================================================================ */
export function ExaminationReadinessModal({ item, onClose }: { item: { name: string; completion: number; status: string } | null; onClose: () => void }) {
  if (!item) return null;
  return (
    <Modal open={!!item} onClose={onClose} tone={item.completion === 100 ? "green" : "amber"} icon="bi-clipboard-check" size="md"
      title={`${item.name} readiness`} subtitle={`${item.completion}% complete`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Component</span><span className="v">{item.name}</span></div>
          <div className="pm-kv"><span className="k">Completion</span><span className="v"><Meter value={item.completion} tone={item.completion === 100 ? "#12b76a" : "#f79009"} width={120} /> {item.completion}%</span></div>
          <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone={item.status === "Ready" ? "green" : "amber"}>{item.status}</Badge></span></div>
        </div>
        <div className="pm-eyebrow mb-2">Evidence checklist</div>
        {[
          { item: "Policy documentation", done: true },
          { item: "Training records", done: item.completion > 80 },
          { item: "Audit trail exports", done: item.completion === 100 },
          { item: "Remediation evidence", done: item.completion === 100 },
        ].map((e, i) => (
          <div key={i} className="pm-alert-row mb-2" style={{ borderLeftColor: e.done ? "#12b76a" : "#f79009" }}>
            <i className={`bi ${e.done ? "bi-check-circle-fill" : "bi-circle"}`} style={{ color: e.done ? "#12b76a" : "#f79009" }} />
            <div className="flex-grow-1">
              <div style={{ fontWeight: 700, fontSize: ".78rem" }}>{e.item}</div>
            </div>
            <Badge tone={e.done ? "green" : "amber"}>{e.done ? "Complete" : "Pending"}</Badge>
          </div>
        ))}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-primary btn-sm"><i className="bi bi-download me-1" />Export evidence</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   13. Training Report Modal
   ================================================================ */
export function TrainingReportModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal open={true} onClose={onClose} tone="blue" icon="bi-file-earmark-bar-graph" size="md"
      title="Training compliance report" subtitle="Current AML training completion">
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Report period</span><span className="v">Aug 2026</span></div>
          <div className="pm-kv"><span className="k">Total staff</span><span className="v">156</span></div>
          <div className="pm-kv"><span className="k">Compliant</span><span className="v">147 (94%)</span></div>
          <div className="pm-kv"><span className="k">Non-compliant</span><span className="v">9 (6%)</span></div>
        </div>
        <div className="pm-eyebrow mb-2">Completion by role</div>
        {[
          { role: "Compliance team", completion: 100 },
          { role: "KYC team", completion: 94 },
          { role: "Investigations", completion: 100 },
          { role: "Board members", completion: 100 },
          { role: "All other staff", completion: 88 },
        ].map((r, i) => (
          <div key={i} className="pm-alert-row mb-2" style={{ borderLeftColor: r.completion === 100 ? "#12b76a" : "#f79009" }}>
            <div className="flex-grow-1">
              <div style={{ fontWeight: 700, fontSize: ".78rem" }}>{r.role}</div>
            </div>
            <Meter value={r.completion} tone={r.completion === 100 ? "#12b76a" : "#f79009"} width={100} />
            <span className="ms-2" style={{ fontSize: ".78rem", fontWeight: 700 }}>{r.completion}%</span>
          </div>
        ))}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-primary btn-sm"><i className="bi bi-download me-1" />Export report</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   14. Inquiry Response Workspace Modal
   ================================================================ */
export function InquiryResponseModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  return (
    <Modal open={true} onClose={onClose} tone="blue" icon="bi-pencil-square" size="md"
      title="Inquiry response workspace" subtitle="Protected response folder">
      <div className="pm-modal-body">
        <Steps current={step} steps={[
          { label: "Draft", icon: "bi-pencil" },
          { label: "Evidence", icon: "bi-paperclip" },
          { label: "Approve", icon: "bi-shield-check" },
        ]} />
        {step === 0 && (
          <div className="mt-3">
            <label className="form-label">Response summary</label>
            <textarea className="form-control mb-3" rows={4} placeholder="Draft the regulatory response..." />
            <label className="form-label">Inquiry reference</label>
            <input className="form-control" placeholder="e.g., FRA-2026-020" />
          </div>
        )}
        {step === 1 && (
          <div className="mt-3">
            <div className="pm-eyebrow mb-2">Attached evidence</div>
            {[
              { name: "CDD records.pdf", size: "2.4 MB", date: "22 Aug 2026" },
              { name: "Screening logs.xlsx", size: "892 KB", date: "22 Aug 2026" },
            ].map((f, i) => (
              <div key={i} className="pm-alert-row mb-2" style={{ borderLeftColor: "#175cd3" }}>
                <i className="bi bi-file-earmark" style={{ color: "#175cd3" }} />
                <div className="flex-grow-1">
                  <div style={{ fontWeight: 700, fontSize: ".78rem" }}>{f.name}</div>
                  <div className="pm-td-sub">{f.size} · {f.date}</div>
                </div>
              </div>
            ))}
            <button className="btn btn-outline-primary btn-sm mt-2"><i className="bi bi-plus me-1" />Add evidence</button>
          </div>
        )}
        {step === 2 && (
          <div className="mt-3">
            <div className="pm-note" style={{ borderColor: "#f79009", background: "#fff5e6" }}>
              <i className="bi bi-exclamation-triangle me-1" style={{ color: "#f79009" }} />
              <b>Compliance Officer approval required</b><br />
              <span style={{ fontSize: ".78rem" }}>Super Admin retains final release authority for all regulatory responses.</span>
            </div>
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}>Back</button>}
        <div className="flex-grow-1" />
        <button className="btn btn-primary btn-sm" onClick={() => step < 2 ? setStep(step + 1) : onClose()}>
          {step === 2 ? "Submit for approval" : "Continue"}
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   15. Refresh Sources Modal
   ================================================================ */
export function RefreshSourcesModal({ onClose }: { onClose: () => void }) {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  return (
    <Modal open={true} onClose={running ? () => { } : onClose} tone="violet" icon="bi-arrow-repeat" size="md"
      title="Refresh screening sources" subtitle="Controlled feed refresh">
      <div className="pm-modal-body">
        {!running ? (
          <div>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-kv"><span className="k">Sources</span><span className="v">8 enabled feeds</span></div>
              <div className="pm-kv"><span className="k">Estimated time</span><span className="v">~5 minutes</span></div>
              <div className="pm-kv"><span className="k">Last refresh</span><span className="v">22 Aug 2026 06:00 UTC</span></div>
            </div>
            <div className="pm-eyebrow mb-2">Sources to refresh</div>
            {["OFAC SDN", "EU Consolidated", "UN Security Council", "PEP Database", "Adverse Media", "Local Sanctions"].map((s, i) => (
              <div key={i} className="pm-alert-row mb-2" style={{ borderLeftColor: "#12b76a" }}>
                <i className="bi bi-check-circle-fill" style={{ color: "#12b76a" }} />
                <div className="flex-grow-1">
                  <div style={{ fontWeight: 700, fontSize: ".78rem" }}>{s}</div>
                </div>
                <Badge tone="green">Enabled</Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="mb-2" style={{ fontWeight: 700 }}>Refreshing sources...</div>
            <div className="progress mb-2" style={{ height: 8 }}>
              <div className="progress-bar" style={{ width: `${progress}%`, background: "#7a5af8" }} />
            </div>
            <div style={{ fontSize: ".78rem", color: "var(--pm-muted)" }}>
              {progress < 30 ? "Downloading feeds..." : progress < 70 ? "Matching records..." : "Updating indexes..."}
            </div>
          </div>
        )}
      </div>
      {!running && (
        <div className="pm-modal-foot">
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={() => {
            setRunning(true);
            const t = setInterval(() => setProgress(p => { if (p >= 100) { clearInterval(t); return 100; } return p + 5; }), 80);
            setTimeout(() => { setRunning(false); setProgress(0); onClose(); }, 2200);
          }}>
            <i className="bi bi-arrow-repeat me-1" />Refresh now
          </button>
        </div>
      )}
    </Modal>
  );
}

/* ================================================================
   16. CDD Policy Editor Modal
   ================================================================ */
export function CddPolicyModal({ level, onClose }: { level: { risk: string; name: string; requirements: string; tone: string } | null; onClose: () => void }) {
  if (!level) return null;
  return (
    <Modal open={!!level} onClose={onClose} tone={level.tone as "green" | "amber" | "red"} icon="bi-shield-check" size="md"
      title={`${level.name} policy`} subtitle={`${level.risk} risk level`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Risk level</span><span className="v"><Badge tone={level.tone}>{level.risk}</Badge></span></div>
          <div className="pm-kv"><span className="k">Policy</span><span className="v">{level.name}</span></div>
          <div className="pm-kv"><span className="k">Requirements</span><span className="v">{level.requirements}</span></div>
        </div>
        <div className="pm-eyebrow mb-2">Automated controls</div>
        {[
          { control: "Identity verification", required: true },
          { control: "Address verification", required: level.risk !== "Low" },
          { control: "Source of funds", required: level.risk === "High" || level.risk === "Critical" },
          { control: "Biometric verification", required: level.risk === "Critical" },
          { control: "Ongoing monitoring", required: level.risk === "High" || level.risk === "Critical" },
        ].map((c, i) => (
          <div key={i} className="pm-alert-row mb-2" style={{ borderLeftColor: c.required ? "#12b76a" : "#175cd3" }}>
            <i className={`bi ${c.required ? "bi-check-circle-fill" : "bi-circle"}`} style={{ color: c.required ? "#12b76a" : "#175cd3" }} />
            <div className="flex-grow-1">
              <div style={{ fontWeight: 700, fontSize: ".78rem" }}>{c.control}</div>
            </div>
            <Badge tone={c.required ? "green" : "grey"}>{c.required ? "Required" : "Optional"}</Badge>
          </div>
        ))}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-primary btn-sm">Edit policy</button>
      </div>
    </Modal>
  );
}
