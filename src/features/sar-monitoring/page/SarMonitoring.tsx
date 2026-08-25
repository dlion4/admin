import { useMemo, useState } from "react";
import { Badge, DDItem, Dropdown, Meter, Pagination, useToast } from "../../../components/ui";
import { csvDownload, kes } from "../../../lib/format";
import { AuthorityPanel } from "../../../components/AuthorityPanel";
import { CASES, FEEDBACK, PIPELINE, RULES, type MonitorRule, type SarCase } from "../data/sarData";
import {
  CaseDrawer, AssignCase, FilingWizard, RuleModal,
  TransactionChainModal, KycSnapshotModal, PriorSarsModal, EvidenceLockerModal,
  ContactSubjectModal, ExtendRestrictionModal, EscalateAuthorityModal,
  TrainingAssignmentModal, TrainingResourceModal, CaseNotesModal, CaseClosureModal,
  FilingHistoryModal, RegulatoryFeedbackModal, CalibrationDetailModal, CaseTimelineModal,
} from "../modals/SarModals";
import "../styles/sar.css";

export function SarMonitoring({ onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  const { push } = useToast();
  const [cases, setCases] = useState(CASES);
  const [rules, setRules] = useState(RULES);
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");
  const [p, setP] = useState(1);

  // Existing modal states
  const [focus, setFocus] = useState<SarCase | null>(null);
  const [assign, setAssign] = useState<SarCase | null>(null);
  const [filing, setFiling] = useState<SarCase | null>(null);
  const [rule, setRule] = useState<MonitorRule | null>(null);

  // New modal states — investigation workspace
  const [txnChain, setTxnChain] = useState<SarCase | null>(null);
  const [kycSnapshot, setKycSnapshot] = useState<SarCase | null>(null);
  const [priorSars, setPriorSars] = useState<SarCase | null>(null);
  const [evidenceLocker, setEvidenceLocker] = useState<SarCase | null>(null);
  const [contactSubject, setContactSubject] = useState<SarCase | null>(null);
  const [extendRestriction, setExtendRestriction] = useState<SarCase | null>(null);
  const [escalate, setEscalate] = useState<SarCase | null>(null);

  // New modal states — training & resources
  const [trainingAssign, setTrainingAssign] = useState(false);
  const [trainingResource, setTrainingResource] = useState<{ name: string; type: string; updated: string; audience: string } | null>(null);

  // New modal states — case management
  const [caseNotes, setCaseNotes] = useState<SarCase | null>(null);
  const [caseClosure, setCaseClosure] = useState<SarCase | null>(null);
  const [filingHistory, setFilingHistory] = useState(false);
  const [feedbackDetail, setFeedbackDetail] = useState<typeof FEEDBACK[0] | null>(null);
  const [calibrationDetail, setCalibrationDetail] = useState<MonitorRule | null>(null);
  const [caseTimeline, setCaseTimeline] = useState<SarCase | null>(null);

  const list = useMemo(() => cases.filter(x => (tab === "All" || x.stage === tab) && `${x.id} ${x.user} ${x.rule}`.toLowerCase().includes(q.toLowerCase())), [cases, tab, q]);
  const page = list.slice((p - 1) * 7, p * 7);
  const tone = (x: string) => x === "Critical" ? "red" : x === "High" ? "amber" : x === "Medium" ? "blue" : "grey";

  const file = () => {
    if (!filing) return;
    setCases(x => x.map(c => c.id === filing.id ? { ...c, stage: "Filed", status: "Submitted" } : c));
    push({ kind: "success", title: "SAR submitted for approval", body: `${filing.id} is awaiting Compliance Officer and Super Admin sign-off.` });
    setFiling(null);
    setFocus(null);
  };

  // Training resource data
  const trainingResources = [
    { name: "SAR Filing Guide", type: "PDF", updated: "Aug 2026", audience: "All investigators" },
    { name: "Red Flags Handbook", type: "Interactive", updated: "Jul 2026", audience: "All staff" },
    { name: "Rule Tuning Best Practices", type: "Wiki", updated: "Aug 2026", audience: "Compliance team" },
    { name: "Regulatory Update — July 2026", type: "Memo", updated: "Jul 2026", audience: "All staff" },
    { name: "Case Study Library", type: "Database", updated: "Ongoing", audience: "Investigators" },
  ];

  return (
    <>
      <div className="pm-section-head sar-top" style={{ marginTop: 0 }}>
        <div>
          <div className="d-flex gap-2 align-items-center mb-1">
            <span className="pm-eyebrow">Fraud & risk · Page 16</span>
            <span className="pm-live"><span className="pm-dot green pm-pulse" />Rules engine online</span>
          </div>
          <h2>Transaction monitoring & SAR</h2>
          <p>Investigate suspicious activity, preserve evidence and submit regulator-ready reports through a dual-controlled workflow.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <AuthorityPanel area="Transaction monitoring" auditRef="AUD-SAR-00016"
            permissions={["Investigate suspicious activity", "Apply holds and restrictions",
              "Submit regulator reports", "Administer monitoring rules"]} />
          <button className="btn btn-outline-secondary btn-sm" onClick={() => csvDownload("paymo-sar-cases.csv", cases)}>
            <i className="bi bi-download me-1" />Export cases
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => onNavigate("fraud")}>
            <i className="bi bi-shield-exclamation me-1" />Fraud dashboard
          </button>
          <Dropdown width={230} trigger={() => <button className="btn btn-outline-secondary btn-sm"><i className="bi bi-three-dots" /></button>}>
            {close => <>
              <div className="pm-dd-head">Compliance operations</div>
              <DDItem icon="bi-shield-check" label="AML & sanctions" hint="Screening controls" onClick={() => { close(); onNavigate("aml"); }} />
              <DDItem icon="bi-diagram-3" label="Risk scoring engine" hint="Risk models and overrides" onClick={() => { close(); onNavigate("risk-scoring"); }} />
              <DDItem icon="bi-life-preserver" label="Incident response" hint="Containment playbooks" onClick={() => { close(); onNavigate("incident"); }} />
            </>}
          </Dropdown>
          <button className="btn btn-primary btn-sm" onClick={() => setFiling(cases.find(x => x.stage === "Compliance decision") ?? cases[0])}>
            <i className="bi bi-file-earmark-arrow-up me-1" />Prepare SAR
          </button>
        </div>
      </div>

      <div className="sar-pipeline">{PIPELINE.map(x => <button key={x.s} onClick={() => { setTab(x.s.includes("review") ? "Review" : x.s.includes("investigation") ? "Investigation" : x.s.includes("Filed") ? "Filed" : "All"); setP(1); }}><span className={`sar-pipe-icon ${x.c}`}><i className="bi bi-arrow-right" /></span><strong>{x.n}</strong><div><b>{x.s}</b><small>{x.t} · SLA {x.sla}{x.b ? ` · ${x.b} breached` : ""}</small></div>{x.b > 0 && <Badge tone="red">{x.b}</Badge>}</button>)}</div>

      <div className="row g-3">
        <div className="col-xl-8">
          <section className="pm-card h-100">
            <div className="pm-card-head">
              <div>
                <h3 className="pm-card-title">Active SAR case queue</h3>
                <p className="pm-card-sub">Stage ownership, case urgency and linked financial exposure.</p>
              </div>
              <div className="sar-search"><i className="bi bi-search" /><input value={q} onChange={e => { setQ(e.target.value); setP(1); }} placeholder="Search case, subject or rule" /></div>
            </div>
            <div className="pm-tabs">{["All", "Review", "Investigation", "Compliance decision", "Filed", "Dismissed"].map(x => <button className={`pm-tab ${x === tab ? "active" : ""}`} onClick={() => { setTab(x); setP(1); }} key={x}>{x}{x !== "All" && <span className="cnt">{cases.filter(c => c.stage === x).length}</span>}</button>)}</div>
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Case / subject</th><th>Rule signal</th><th>Exposure</th><th>Stage</th><th>Owner · age</th><th>Priority</th><th /></tr></thead>
                <tbody>{page.map(c => <tr key={c.id} onClick={() => setFocus(c)}>
                  <td><b>{c.id}</b><div className="pm-td-sub">{c.user} · {c.userId}</div></td>
                  <td><b>{c.rule.split(" ")[0]}</b><div className="pm-td-sub">{c.rule.slice(8)}</div></td>
                  <td className="pm-num">{kes(c.amount)}</td>
                  <td><Badge tone={c.stage === "Compliance decision" ? "violet" : c.stage === "Filed" ? "green" : c.stage === "Dismissed" ? "grey" : "blue"}>{c.stage}</Badge></td>
                  <td><b>{c.owner}</b><div className="pm-td-sub">{c.age} old</div></td>
                  <td><Badge tone={tone(c.priority)}>{c.priority}</Badge></td>
                  <td onClick={e => e.stopPropagation()}>
                    <Dropdown width={180} trigger={() => <button className="btn btn-light btn-sm"><i className="bi bi-three-dots-vertical" /></button>}>
                      {close => <>
                        <DDItem icon="bi-folder2-open" label="Open case" onClick={() => { close(); setFocus(c); }} />
                        <DDItem icon="bi-person-plus" label="Assign case" onClick={() => { close(); setAssign(c); }} />
                        <DDItem icon="bi-file-earmark-arrow-up" label="Prepare SAR" onClick={() => { close(); setFiling(c); }} />
                        <DDItem icon="bi-journal-text" label="Case notes" onClick={() => { close(); setCaseNotes(c); }} />
                        <DDItem icon="bi-diagram-3" label="Case timeline" onClick={() => { close(); setCaseTimeline(c); }} />
                      </>}
                    </Dropdown>
                  </td>
                </tr>)}</tbody>
              </table>
            </div>
            <Pagination page={p} total={list.length} pageSize={7} onPage={setP} />
          </section>
        </div>
        <div className="col-xl-4">
          <section className="pm-card h-100">
            <div className="pm-card-head">
              <div>
                <h3 className="pm-card-title">Filing performance</h3>
                <p className="pm-card-sub">Month-to-date control health</p>
              </div>
              <Badge tone="green">On track</Badge>
            </div>
            <div className="sar-stats">{[["SARs filed", "3", "4 last month", "green"], ["Amount reported", "KES 2.54M", "KES 28.4M YTD", "red"], ["Average time to file", "18h", "target < 24h", "green"], ["False positives", "0", "4 YTD", "green"], ["Regulatory feedback", "1", "5 YTD", "blue"], ["Law enforcement referrals", "1", "8 YTD", "red"]].map(x => <div key={x[0]}><span className={`sar-stat-dot ${x[3]}`} /><div><small>{x[0]}</small><b>{x[1]}</b><em>{x[2]}</em></div></div>)}</div>
            <div className="sar-note"><i className="bi bi-shield-lock" /><span><b>Dual approval enforced</b>Compliance Officer and Super Admin must approve every external submission.</span></div>
          </section>
        </div>
      </div>

      <div className="row g-3 mt-0">
        <div className="col-xl-8">
          <section className="pm-card">
            <div className="pm-card-head">
              <div>
                <h3 className="pm-card-title">Monitoring rules engine</h3>
                <p className="pm-card-sub">Live scenarios calibrated for suspicious transaction behaviour.</p>
              </div>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setRule(rules[0])}>Rule controls</button>
            </div>
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Rule</th><th>Trigger condition</th><th>Severity</th><th>Hits</th><th>FP rate</th><th>Last trigger</th><th /></tr></thead>
                <tbody>{rules.map(r => <tr key={r.id} onClick={() => setRule(r)}>
                  <td><b>{r.id}</b><div className="pm-td-sub">{r.name}</div></td>
                  <td>{r.trigger}</td>
                  <td><Badge tone={tone(r.severity)}>{r.severity}</Badge></td>
                  <td className="pm-num">{r.hits}</td>
                  <td><Meter value={r.fp} tone={r.fp > 40 ? "#f79009" : "#12b76a"} /><small className="ms-1">{r.fp}%</small></td>
                  <td>{r.last}</td>
                  <td><Badge tone={r.active ? "green" : "grey"}>{r.active ? "Active" : "Paused"}</Badge></td>
                </tr>)}</tbody>
              </table>
            </div>
          </section>
        </div>
        <div className="col-xl-4">
          <section className="pm-card h-100">
            <div className="pm-card-head">
              <div>
                <h3 className="pm-card-title">Calibration queue</h3>
                <p className="pm-card-sub">Proposed scenario adjustments</p>
              </div>
              <Badge tone="amber">4 reviews</Badge>
            </div>
            <div className="sar-calibration">{[["MON-001", "3 TXNs → 4 TXNs", "-15% FP", "green"], ["MON-002", "90% in 1h → 85% in 2h", "+10% alerts", "amber"], ["MON-006", "80% cash → 75% cash", "+8% FP", "amber"], ["MON-010", "10 → 15 txns/hour", "-12% FP", "green"]].map(x => <button key={x[0]} onClick={() => setCalibrationDetail(rules.find(r => r.id === x[0]) ?? rules[0])}><Badge tone="violet">{x[0]}</Badge><b>{x[1]}</b><small className={x[3]}>{x[2]}</small><i className="bi bi-chevron-right" /></button>)}</div>
          </section>
        </div>
      </div>

      <div className="row g-3 mt-0">
        <div className="col-xl-7">
          <section className="pm-card">
            <div className="pm-card-head">
              <div>
                <h3 className="pm-card-title">Regulatory feedback tracker</h3>
                <p className="pm-card-sub">Authority requests, received dates and closed-loop action.</p>
              </div>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => onNavigate("compliance-docs")}>Evidence archive</button>
            </div>
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>SAR</th><th>Authority</th><th>Feedback</th><th>Action taken</th><th /></tr></thead>
                <tbody>{FEEDBACK.map(x => <tr key={x.id} onClick={() => setFeedbackDetail(x)}>
                  <td><b>{x.id}</b><div className="pm-td-sub">Filed {x.filed}</div></td>
                  <td>{x.authority}<div className="pm-td-sub">{x.date}</div></td>
                  <td><Badge tone={x.tone}>{x.feedback}</Badge></td>
                  <td>{x.action}</td>
                  <td><i className="bi bi-chevron-right" style={{ color: "#98a2b3" }} /></td>
                </tr>)}</tbody>
              </table>
            </div>
          </section>
        </div>
        <div className="col-xl-5">
          <section className="pm-card h-100">
            <div className="pm-card-head">
              <div>
                <h3 className="pm-card-title">Workflow & retention</h3>
                <p className="pm-card-sub">Policy controls enforced in production.</p>
              </div>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => onNavigate("sysconfig")}>Configure</button>
            </div>
            <div className="sar-workflow">{[["Auto-assignment", "Round-robin"], ["Investigation SLA", "8 hours"], ["Compliance decision SLA", "2 hours"], ["Filing SLA", "24 hours"], ["Breach notification", "Slack + email"], ["Dismissed archive", "90 days"], ["Filed SAR retention", "7 years"]].map(x => <div key={x[0]}><span>{x[0]}</span><b>{x[1]}</b><i className="bi bi-check2-circle" /></div>)}</div>
          </section>
        </div>
      </div>

      <div className="row g-3 mt-0">
        <div className="col-xl-7">
          <section className="pm-card">
            <div className="pm-card-head">
              <div>
                <h3 className="pm-card-title">SAR statistics & filing assurance</h3>
                <p className="pm-card-sub">Current month versus prior month and year-to-date regulator reporting performance.</p>
              </div>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setFilingHistory(true)}>Filing history</button>
            </div>
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Metric</th><th>This month</th><th>Last month</th><th>YTD</th><th>Trend</th></tr></thead>
                <tbody>{[["Total SARs filed", "3", "4", "34", "↓"], ["Amount reported", "KES 2.54M", "KES 3.1M", "KES 28.4M", "↓"], ["Average SAR amount", "KES 847K", "KES 775K", "KES 835K", "↑"], ["False positive SARs", "0", "1", "4", "↓"], ["Time to file · avg", "18 hours", "22 hours", "20 hours", "↓"], ["Regulatory feedback", "1", "0", "5", "→"], ["Law-enforcement referrals", "1", "0", "8", "→"]].map(x => <tr key={x[0]} onClick={() => setFilingHistory(true)}>
                  <td><b>{x[0]}</b></td>
                  <td className="pm-num">{x[1]}</td>
                  <td>{x[2]}</td>
                  <td>{x[3]}</td>
                  <td className={x[4] === "↑" ? "text-danger fw-bold" : "text-success fw-bold"}>{x[4]}</td>
                </tr>)}</tbody>
              </table>
            </div>
          </section>
        </div>
        <div className="col-xl-5">
          <section className="pm-card h-100">
            <div className="pm-card-head">
              <div>
                <h3 className="pm-card-title">Filing readiness checklist</h3>
                <p className="pm-card-sub">Controls verified before external submission.</p>
              </div>
              <AuthorityPanel area="SAR filing readiness" auditRef="AUD-FILE-98231"
                permissions={["Review protected evidence", "Approve regulator filings",
                  "Apply or extend restrictions", "Escalate authority referrals"]} />
            </div>
            <div className="sar-readiness">{[["Subject and KYC snapshot", "Complete", "green"], ["Linked transaction list", "Complete", "green"], ["Risk indicators & rules", "Complete", "green"], ["Investigator assessment", "Required", "amber"], ["Compliance co-signature", "Required", "amber"], ["Evidence integrity hash", "Verified", "green"]].map(x => <button key={x[0]} onClick={() => setFiling(cases[0])}>
              <i className={x[2] === "green" ? "bi bi-check-circle-fill" : "bi bi-exclamation-circle-fill"} />
              <span>{x[0]}</span>
              <Badge tone={x[2]}>{x[1]}</Badge>
              <i className="bi bi-chevron-right" />
            </button>)}</div>
          </section>
        </div>
      </div>

      {/* Training & guidance — now with real modals */}
      <section className="pm-card mt-3">
        <div className="pm-card-head">
          <div>
            <h3 className="pm-card-title">SAR training & operational guidance</h3>
            <p className="pm-card-sub">Versioned reference material for investigators, compliance reviewers and Super Admins.</p>
          </div>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setTrainingAssign(true)}>
            <i className="bi bi-person-plus me-1" />Assign training
          </button>
        </div>
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Resource</th><th>Type</th><th>Last updated</th><th>Audience</th><th /></tr></thead>
            <tbody>{trainingResources.map(x => <tr key={x.name} onClick={() => setTrainingResource(x)}>
              <td><b>{x.name}</b></td>
              <td><Badge tone="violet">{x.type}</Badge></td>
              <td>{x.updated}</td>
              <td>{x.audience}</td>
              <td><i className="bi bi-chevron-right" style={{ color: "#98a2b3" }} /></td>
            </tr>)}</tbody>
          </table>
        </div>
      </section>

      {/* ===== ALL MODALS ===== */}

      {/* Existing modals */}
      <CaseDrawer item={focus} onClose={() => setFocus(null)}
        onAssign={x => { setFocus(null); setAssign(x); }}
        onFile={x => { setFocus(null); setFiling(x); }}
        onTxnChain={x => { setFocus(null); setTxnChain(x); }}
        onKycSnapshot={x => { setFocus(null); setKycSnapshot(x); }}
        onPriorSars={x => { setFocus(null); setPriorSars(x); }}
        onEvidenceLocker={x => { setFocus(null); setEvidenceLocker(x); }}
        onContactSubject={x => { setFocus(null); setContactSubject(x); }}
        onExtendRestriction={x => { setFocus(null); setExtendRestriction(x); }}
        onEscalate={x => { setFocus(null); setEscalate(x); }}
      />
      <AssignCase item={assign} onClose={() => setAssign(null)} onSave={name => {
        if (assign) {
          setCases(x => x.map(c => c.id === assign.id ? { ...c, owner: name, stage: "Investigation" } : c));
          push({ kind: "success", title: "Investigation assigned", body: `${assign.id} is now owned by ${name}.` });
          setAssign(null);
        }
      }} />
      <FilingWizard item={filing} onClose={() => setFiling(null)} onSave={file} />
      <RuleModal rule={rule} onClose={() => setRule(null)} onSave={active => {
        if (rule) {
          setRules(x => x.map(r => r.id === rule.id ? { ...r, active } : r));
          push({ kind: "success", title: "Rule control saved", body: `${rule.id} is ${active ? "active" : "paused"} in production.` });
          setRule(null);
        }
      }} />

      {/* New modals — investigation workspace */}
      <TransactionChainModal item={txnChain} onClose={() => setTxnChain(null)} />
      <KycSnapshotModal item={kycSnapshot} onClose={() => setKycSnapshot(null)} />
      <PriorSarsModal item={priorSars} onClose={() => setPriorSars(null)} />
      <EvidenceLockerModal item={evidenceLocker} onClose={() => setEvidenceLocker(null)} />
      <ContactSubjectModal item={contactSubject} onClose={() => setContactSubject(null)} />
      <ExtendRestrictionModal item={extendRestriction} onClose={() => setExtendRestriction(null)} />
      <EscalateAuthorityModal item={escalate} onClose={() => setEscalate(null)} />

      {/* New modals — training & resources */}
      <TrainingAssignmentModal onClose={() => setTrainingAssign(false)} />
      <TrainingResourceModal resource={trainingResource} onClose={() => setTrainingResource(null)} />

      {/* New modals — case management */}
      <CaseNotesModal item={caseNotes} onClose={() => setCaseNotes(null)} />
      <CaseClosureModal item={caseClosure} onClose={() => setCaseClosure(null)} />
      <FilingHistoryModal onClose={() => setFilingHistory(false)} />
      <RegulatoryFeedbackModal feedback={feedbackDetail} onClose={() => setFeedbackDetail(null)} />
      <CalibrationDetailModal rule={calibrationDetail} onClose={() => setCalibrationDetail(null)} />
      <CaseTimelineModal item={caseTimeline} onClose={() => setCaseTimeline(null)} />
    </>
  );
}
