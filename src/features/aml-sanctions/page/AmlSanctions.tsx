import { useMemo, useState } from "react";
import { Badge, DDItem, Dropdown, Meter, Pagination, useToast } from "../../../components/ui";
import { AuthorityPanel } from "../../../components/AuthorityPanel";
import { csvDownload } from "../../../lib/format";
import { HITS, LISTS, type Hit } from "../data/amlData";
import {
  ScreeningDrawer,
  DecisionWizard,
  KycProfileModal,
  ListEvidenceModal,
  PriorScreeningsModal,
  AdverseMediaModal,
  ScreeningSourceModal,
  EddCaseModal,
  TrainingCourseModal,
  RegulatoryInquiryModal,
  AmlPolicyModal,
  ExaminationReadinessModal,
  TrainingReportModal,
  InquiryResponseModal,
  RefreshSourcesModal,
  CddPolicyModal,
} from "../modals/AmlModals";
import "../styles/aml.css";

export function AmlSanctions({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  const { push } = useToast();
  const [hits, setHits] = useState(HITS);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [focus, setFocus] = useState<Hit | null>(null);
  const [assign, setAssign] = useState<Hit | null>(null);
  const [decision, setDecision] = useState<Hit | null>(null);

  // New modal states
  const [kycProfile, setKycProfile] = useState<Hit | null>(null);
  const [listEvidence, setListEvidence] = useState<Hit | null>(null);
  const [priorScreenings, setPriorScreenings] = useState<Hit | null>(null);
  const [adverseMedia, setAdverseMedia] = useState<Hit | null>(null);
  const [screeningSource, setScreeningSource] = useState<{ name: string; source: string; entries: string; updated: string; frequency: string; algorithm: string } | null>(null);
  const [edcCase, setEddCase] = useState<{ id: string; customer: string; risk: string; status: string; sof: string; nextReview: string } | null>(null);
  const [trainingCourse, setTrainingCourse] = useState<{ name: string; requiredFor: string; completion: number; lastUpdated: string; nextDue: string } | null>(null);
  const [regInquiry, setRegInquiry] = useState<{ id: string; subject: string; deadline: string; status: string } | null>(null);
  const [amlPolicy, setAmlPolicy] = useState<{ name: string; version: string; lastApproved: string; approvedBy: string; nextReview: string } | null>(null);
  const [examReadiness, setExamReadiness] = useState<{ name: string; completion: number; status: string } | null>(null);
  const [trainingReport, setTrainingReport] = useState(false);
  const [inquiryResponse, setInquiryResponse] = useState(false);
  const [refreshSources, setRefreshSources] = useState(false);
  const [cddPolicy, setCddPolicy] = useState<{ risk: string; name: string; requirements: string; tone: string } | null>(null);

  const rows = useMemo(
    () => hits.filter((h) => `${h.id} ${h.user} ${h.name} ${h.list}`.toLowerCase().includes(q.toLowerCase())).slice((page - 1) * 6, page * 6),
    [hits, q, page]
  );
  const tone = (s: string) => (s === "New" || s === "Escalated" ? "red" : s === "Review" ? "amber" : "green");

  // EDD case data
  const eddCases = [
    { id: "EDD-001", customer: "PAY-55667", risk: "High", status: "In progress", sof: "Business income · awaiting docs", nextReview: "—" },
    { id: "EDD-002", customer: "PAY-88900", risk: "Critical", status: "Complete", sof: "Employment + investments", nextReview: "Feb 2027" },
    { id: "EDD-003", customer: "PAY-11234", risk: "High", status: "Complete", sof: "Salary + side business", nextReview: "Jan 2027" },
    { id: "EDD-004", customer: "PAY-77889", risk: "High", status: "Overdue", sof: "Missing bank statements", nextReview: "Overdue" },
  ];

  // Training courses
  const courses = [
    { name: "AML Fundamentals", requiredFor: "All staff", completion: 98, lastUpdated: "Aug 2026", nextDue: "Aug 2027" },
    { name: "SAR Filing Workshop", requiredFor: "Investigators, Compliance", completion: 100, lastUpdated: "Jul 2026", nextDue: "Jul 2027" },
    { name: "PEP & Sanctions Screening", requiredFor: "KYC team, Compliance", completion: 94, lastUpdated: "Jun 2026", nextDue: "Jun 2027" },
    { name: "CDD/EDD Procedures", requiredFor: "KYC team, Compliance", completion: 92, lastUpdated: "May 2026", nextDue: "May 2027" },
    { name: "Board AML Awareness", requiredFor: "Board members", completion: 100, lastUpdated: "Apr 2026", nextDue: "Apr 2027" },
  ];

  // Regulatory inquiries
  const inquiries = [
    { id: "FRA-2026-019", subject: "Additional source-of-funds evidence", deadline: "Due today", status: "red" },
    { id: "CBK-2026-007", subject: "CDD remediation evidence", deadline: "Due Aug 29", status: "amber" },
    { id: "ODPC-2026-003", subject: "Screening-record retention", deadline: "Submitted", status: "green" },
  ];

  // AML policies
  const policies = [
    { name: "AML/CFT Policy", version: "v4.2", lastApproved: "Jul 2026", approvedBy: "Board", nextReview: "Jan 2027" },
    { name: "Sanctions Screening Policy", version: "v3.1", lastApproved: "Aug 2026", approvedBy: "MLRO", nextReview: "Feb 2027" },
    { name: "CDD/EDD Procedures", version: "v2.8", lastApproved: "Jun 2026", approvedBy: "MLRO", nextReview: "Dec 2026" },
    { name: "SAR Procedures", version: "v3.0", lastApproved: "May 2026", approvedBy: "MLRO", nextReview: "Nov 2026" },
    { name: "Record Retention Policy", version: "v2.1", lastApproved: "Mar 2026", approvedBy: "Board", nextReview: "Sep 2026" },
    { name: "Risk Assessment", version: "v3.5", lastApproved: "Jul 2026", approvedBy: "Board", nextReview: "Jan 2027" },
  ];

  // CDD policy levels
  const cddLevels = [
    { risk: "Low", name: "Simplified CDD", requirements: "Phone + name + DOB", tone: "green" },
    { risk: "Medium", name: "Standard CDD", requirements: "ID + address + screening", tone: "amber" },
    { risk: "High", name: "Enhanced CDD", requirements: "Source of funds + biometrics", tone: "red" },
    { risk: "Critical", name: "Ongoing EDD", requirements: "Management approval + media", tone: "red" },
  ];

  // Examination readiness
  const readinessItems = [
    { name: "AML/CFT program", completion: 100, status: "Ready" },
    { name: "Sanctions screening", completion: 100, status: "Ready" },
    { name: "Customer due diligence", completion: 80, status: "Near" },
    { name: "Transaction monitoring", completion: 70, status: "Near" },
    { name: "Record keeping", completion: 100, status: "Ready" },
    { name: "Staff training", completion: 94, status: "Ready" },
  ];

  return (
    <>
      <div className="pm-section-head aml-top" style={{ marginTop: 0 }}>
        <div>
          <div className="d-flex gap-2 align-items-center mb-1">
            <span className="pm-eyebrow">Fraud & risk · Page 18</span>
            <span className="pm-live">
              <span className="pm-dot green pm-pulse" />8 screening sources current
            </span>
          </div>
          <h2>AML & sanctions control center</h2>
          <p>Screen, investigate and document financial-crime decisions with CDD, EDD, regulator and governance controls in one protected workspace.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <AuthorityPanel
            area="AML & sanctions program"
            auditRef="AUD-AML-00018"
            permissions={["Administer screening lists", "Clear, confirm or escalate matches", "Freeze and restrict accounts", "Approve AML policies and evidence exports"]}
          />
          <button className="btn btn-outline-secondary btn-sm" onClick={() => csvDownload("paymo-aml-screening-queue.csv", hits)}>
            <i className="bi bi-download me-1" />
            Export queue
          </button>
          <Dropdown
            width={220}
            trigger={() => (
              <button className="btn btn-outline-secondary btn-sm">
                <i className="bi bi-three-dots" />
              </button>
            )}
          >
            {(close) => (
              <>
                <div className="pm-dd-head">Financial crime desk</div>
                <DDItem icon="bi-binoculars" label="SAR monitoring" hint="Investigations & filing" onClick={() => { close(); onNavigate("sar"); }} />
                <DDItem icon="bi-shield-exclamation" label="Fraud dashboard" hint="Alert command center" onClick={() => { close(); onNavigate("fraud"); }} />
                <DDItem icon="bi-diagram-3" label="Risk scoring" hint="Model controls" onClick={() => { close(); onNavigate("risk-scoring"); }} />
              </>
            )}
          </Dropdown>
          <button className="btn btn-primary btn-sm" onClick={() => setDecision(hits[0])}>
            <i className="bi bi-shield-check me-1" />
            Review match
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="row g-2 mb-3">
        {[
          ["Users screened", "148,392", "100% onboarding + ongoing", "green", "bi-people"],
          ["PEP matches", "23", "all screening required", "amber", "bi-person-badge"],
          ["Sanctions matches", "2", "zero-tolerance workflow", "red", "bi-shield-x"],
          ["Adverse media", "12", "↑ new findings", "amber", "bi-newspaper"],
          ["SARs filed YTD", "34", "within 24h decision SLA", "violet", "bi-file-earmark-text"],
          ["CDD completed", "34,120", "Tier 2 verified", "green", "bi-person-check"],
          ["EDD completed", "2,340", "Tier 3 ongoing review", "green", "bi-person-lock"],
          ["Training complete", "94%", "target 100%", "amber", "bi-mortarboard"],
        ].map((x) => (
          <div className="col-6 col-md-3" key={x[0]}>
            <div className="pm-stat">
              <div className="d-flex gap-2 align-items-center">
                <span
                  className="pm-stat-ico"
                  style={{
                    background: x[3] === "red" ? "#fef2f2" : x[3] === "amber" ? "#fff5e6" : x[3] === "violet" ? "#f4f1ff" : "#e7f8ef",
                    color: x[3] === "red" ? "#d92d20" : x[3] === "amber" ? "#b54708" : x[3] === "violet" ? "#5925dc" : "#0b8f52",
                  }}
                >
                  <i className={`bi ${x[4]}`} />
                </span>
                <span className="pm-stat-label">{x[0]}</span>
              </div>
              <div className="pm-stat-value">{x[1]}</div>
              <div className="pm-stat-foot">{x[2]}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Screening Queue & CDD Policy */}
      <div className="row g-3">
        <div className="col-xl-8">
          <section className="pm-card">
            <div className="pm-card-head">
              <div>
                <h3 className="pm-card-title">Screening results queue</h3>
                <p className="pm-card-sub">Name, PEP, sanctions, jurisdiction and adverse-media matches requiring controlled disposition.</p>
              </div>
              <div className="aml-search">
                <i className="bi bi-search" />
                <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search user, list or case" />
              </div>
            </div>
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Match / source</th>
                    <th>Score</th>
                    <th>Confidence</th>
                    <th>Status</th>
                    <th>Owner</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((h) => (
                    <tr key={h.id} onClick={() => setFocus(h)}>
                      <td>
                        <b>{h.name}</b>
                        <div className="pm-td-sub">{h.id} · {h.user}</div>
                      </td>
                      <td>
                        <b>{h.type}</b>
                        <div className="pm-td-sub">{h.list}</div>
                      </td>
                      <td>
                        <span className={`aml-score ${h.score > 85 ? "red" : "amber"}`}>{h.score}%</span>
                      </td>
                      <td>
                        <Badge tone={h.confidence === "High" || h.confidence === "Certain" ? "red" : "amber"}>{h.confidence}</Badge>
                      </td>
                      <td>
                        <Badge tone={tone(h.status)}>{h.status}</Badge>
                      </td>
                      <td>{h.owner}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <Dropdown
                          width={200}
                          trigger={() => (
                            <button className="btn btn-light btn-sm">
                              <i className="bi bi-three-dots-vertical" />
                            </button>
                          )}
                        >
                          {(close) => (
                            <>
                              <DDItem icon="bi-eye" label="Review evidence" onClick={() => { close(); setFocus(h); }} />
                              <DDItem icon="bi-person-vcard" label="KYC profile" onClick={() => { close(); setKycProfile(h); }} />
                              <DDItem icon="bi-journal-bookmark" label="List evidence" onClick={() => { close(); setListEvidence(h); }} />
                              <DDItem icon="bi-clock-history" label="Prior screenings" onClick={() => { close(); setPriorScreenings(h); }} />
                              <DDItem icon="bi-newspaper" label="Adverse media" onClick={() => { close(); setAdverseMedia(h); }} />
                              <DDItem icon="bi-person-plus" label="Assign reviewer" onClick={() => { close(); setAssign(h); }} />
                              <DDItem icon="bi-shield-check" label="Record decision" onClick={() => { close(); setDecision(h); }} />
                            </>
                          )}
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} total={hits.length} pageSize={6} onPage={setPage} />
          </section>
        </div>
        <div className="col-xl-4">
          <section className="pm-card h-100">
            <div className="pm-card-head">
              <div>
                <h3 className="pm-card-title">CDD / EDD policy</h3>
                <p className="pm-card-sub">Risk-based due-diligence obligations.</p>
              </div>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setCddPolicy(cddLevels[1])}>Edit policy</button>
            </div>
            <div className="aml-cdd">
              {cddLevels.map((x) => (
                <button key={x.risk} onClick={() => setCddPolicy(x)}>
                  <Badge tone={x.tone}>{x.risk}</Badge>
                  <div>
                    <b>{x.name}</b>
                    <small>{x.requirements}</small>
                  </div>
                  <i className="bi bi-chevron-right" />
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Sanctions Source Registry */}
      <section className="pm-card mt-3">
        <div className="pm-card-head">
          <div>
            <h3 className="pm-card-title">Sanctions screening source registry</h3>
            <p className="pm-card-sub">Source provenance, refresh interval, algorithm and production state.</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setRefreshSources(true)}>
            <i className="bi bi-arrow-repeat me-1" />
            Refresh sources
          </button>
        </div>
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead>
              <tr>
                <th>List</th>
                <th>Source</th>
                <th>Entries</th>
                <th>Updated</th>
                <th>Frequency</th>
                <th>Algorithm</th>
                <th>State</th>
              </tr>
            </thead>
            <tbody>
              {LISTS.map((x) => (
                <tr key={x[0]} onClick={() => setScreeningSource({ name: x[0], source: x[1], entries: x[2], updated: x[3], frequency: x[4], algorithm: x[5] })}>
                  <td><b>{x[0]}</b></td>
                  <td>{x[1]}</td>
                  <td className="pm-num">{x[2]}</td>
                  <td>{x[3]}</td>
                  <td>{x[4]}</td>
                  <td>{x[5]}</td>
                  <td><Badge tone="green">Active</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* EDD Cases & Examination Readiness */}
      <div className="row g-3 mt-3">
        <div className="col-xl-7">
          <section className="pm-card">
            <div className="pm-card-head">
              <div>
                <h3 className="pm-card-title">Enhanced due diligence cases</h3>
                <p className="pm-card-sub">Source-of-funds, PEP and ongoing review controls.</p>
              </div>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setEddCase(eddCases[0])}>Manage cases</button>
            </div>
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead>
                  <tr>
                    <th>Case</th>
                    <th>Customer</th>
                    <th>Risk</th>
                    <th>EDD status</th>
                    <th>Source of funds</th>
                    <th>Next review</th>
                  </tr>
                </thead>
                <tbody>
                  {eddCases.map((c) => (
                    <tr key={c.id} onClick={() => setEddCase(c)}>
                      <td><b>{c.id}</b></td>
                      <td>{c.customer}</td>
                      <td><Badge tone={c.risk === "Critical" ? "red" : "amber"}>{c.risk}</Badge></td>
                      <td><Badge tone={c.status === "Complete" ? "green" : c.status === "Overdue" ? "red" : "amber"}>{c.status}</Badge></td>
                      <td>{c.sof}</td>
                      <td>{c.nextReview}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
        <div className="col-xl-5">
          <section className="pm-card h-100">
            <div className="pm-card-head">
              <div>
                <h3 className="pm-card-title">Examination readiness</h3>
                <p className="pm-card-sub">Evidence, remediation and program governance.</p>
              </div>
              <Badge tone="amber">2 near ready</Badge>
            </div>
            <div className="aml-ready">
              {readinessItems.map((x) => (
                <button key={x.name} onClick={() => setExamReadiness(x)}>
                  <span>{x.name}</span>
                  <Meter value={x.completion} tone={x.completion === 100 ? "#12b76a" : "#f79009"} width={110} />
                  <Badge tone={x.status === "Ready" ? "green" : "amber"}>{x.status}</Badge>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Training & Inquiries */}
      <div className="row g-3 mt-3">
        <div className="col-xl-7">
          <section className="pm-card">
            <div className="pm-card-head">
              <div>
                <h3 className="pm-card-title">AML training tracker</h3>
                <p className="pm-card-sub">Mandatory course coverage by role, next recertification and controlled assignments.</p>
              </div>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setTrainingReport(true)}>Training report</button>
            </div>
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Required for</th>
                    <th>Completion</th>
                    <th>Last updated</th>
                    <th>Next due</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c) => (
                    <tr key={c.name} onClick={() => setTrainingCourse(c)}>
                      <td><b>{c.name}</b></td>
                      <td>{c.requiredFor}</td>
                      <td>
                        <Meter value={c.completion} tone={c.completion === 100 ? "#12b76a" : "#f79009"} />
                        <small className="ms-1">{c.completion}%</small>
                      </td>
                      <td>{c.lastUpdated}</td>
                      <td>{c.nextDue}</td>
                      <td>
                        <button className="btn btn-outline-primary btn-sm" onClick={(e) => { e.stopPropagation(); setTrainingCourse(c); }}>Roster</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
        <div className="col-xl-5">
          <section className="pm-card h-100">
            <div className="pm-card-head">
              <div>
                <h3 className="pm-card-title">Regulatory inquiry desk</h3>
                <p className="pm-card-sub">Three YTD requests tracked to statutory response deadlines.</p>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setInquiryResponse(true)}>New response</button>
            </div>
            <div className="aml-inquiries">
              {inquiries.map((x) => (
                <button key={x.id} onClick={() => setRegInquiry(x)}>
                  <Badge tone={x.status}>{x.id}</Badge>
                  <div>
                    <b>{x.subject}</b>
                    <small>{x.deadline}</small>
                  </div>
                  <i className="bi bi-chevron-right" />
                </button>
              ))}
            </div>
            <div className="aml-inquiry-note">
              <i className="bi bi-shield-lock" />Responses require Compliance Officer approval; Super Admin retains final release authority.
            </div>
          </section>
        </div>
      </div>

      {/* AML Program Governance */}
      <section className="pm-card mt-3">
        <div className="pm-card-head">
          <div>
            <h3 className="pm-card-title">AML program governance</h3>
            <p className="pm-card-sub">Board and MLRO-approved policy documents, review windows and controlled access.</p>
          </div>
          <AuthorityPanel
            area="AML program governance"
            auditRef="AUD-GOV-AML-44120"
            permissions={["Approve AML policy revisions", "Publish controlled procedures", "Set retention periods", "Export examination evidence"]}
          />
        </div>
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Version</th>
                <th>Last approved</th>
                <th>Approved by</th>
                <th>Next review</th>
                <th>Control</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((p) => (
                <tr key={p.name} onClick={() => setAmlPolicy(p)}>
                  <td><b>{p.name}</b></td>
                  <td><Badge tone="violet">{p.version}</Badge></td>
                  <td>{p.lastApproved}</td>
                  <td>{p.approvedBy}</td>
                  <td>{p.nextReview}</td>
                  <td>
                    <button className="btn btn-outline-primary btn-sm" onClick={(e) => { e.stopPropagation(); setAmlPolicy(p); }}>View policy</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* All Modals */}
      <ScreeningDrawer
        hit={focus}
        onClose={() => setFocus(null)}
        onAssign={(h) => { setFocus(null); setAssign(h); }}
        onDecision={(h) => { setFocus(null); setDecision(h); }}
      />
      {assign && (
        <Assign
          hit={assign}
          close={() => setAssign(null)}
          save={(name) => {
            setHits((x) => x.map((h) => (h.id === assign.id ? { ...h, owner: name, status: "Review" } : h)));
            setAssign(null);
            push({ kind: "success", title: "Review assigned", body: `${assign.id} has a new AML reviewer.` });
          }}
        />
      )}
      <DecisionWizard
        hit={decision}
        onClose={() => setDecision(null)}
        onSave={(d) => {
          if (decision) {
            setHits((x) => x.map((h) => (h.id === decision.id ? { ...h, status: d.includes("clear") ? "Cleared" : d.includes("Escalate") ? "Escalated" : "Review" } : h)));
            push({ kind: "success", title: "AML decision recorded", body: `${decision.id}: ${d}.` });
            setDecision(null);
          }
        }}
      />

      {/* New Modals */}
      {kycProfile && <KycProfileModal hit={kycProfile} onClose={() => setKycProfile(null)} />}
      {listEvidence && <ListEvidenceModal hit={listEvidence} onClose={() => setListEvidence(null)} />}
      {priorScreenings && <PriorScreeningsModal hit={priorScreenings} onClose={() => setPriorScreenings(null)} />}
      {adverseMedia && <AdverseMediaModal hit={adverseMedia} onClose={() => setAdverseMedia(null)} />}
      {screeningSource && <ScreeningSourceModal source={screeningSource} onClose={() => setScreeningSource(null)} />}
      {edcCase && <EddCaseModal caseData={edcCase} onClose={() => setEddCase(null)} />}
      {trainingCourse && <TrainingCourseModal course={trainingCourse} onClose={() => setTrainingCourse(null)} />}
      {regInquiry && <RegulatoryInquiryModal inquiry={regInquiry} onClose={() => setRegInquiry(null)} />}
      {amlPolicy && <AmlPolicyModal policy={amlPolicy} onClose={() => setAmlPolicy(null)} />}
      {examReadiness && <ExaminationReadinessModal item={examReadiness} onClose={() => setExamReadiness(null)} />}
      {trainingReport && <TrainingReportModal onClose={() => setTrainingReport(false)} />}
      {inquiryResponse && <InquiryResponseModal onClose={() => setInquiryResponse(false)} />}
      {refreshSources && <RefreshSourcesModal onClose={() => setRefreshSources(false)} />}
      {cddPolicy && <CddPolicyModal level={cddPolicy} onClose={() => setCddPolicy(null)} />}
    </>
  );
}

function Assign({ hit, close, save }: { hit: Hit; close: () => void; save: (x: string) => void }) {
  const [n, setN] = useState("Sarah K.");
  return (
    <div className="pm-overlay">
      <div className="pm-modal sm">
        <div className="pm-modal-head">
          <div className="pm-modal-ico" style={{ background: "#eff8ff", color: "#175cd3" }}>
            <i className="bi bi-person-plus" />
          </div>
          <div>
            <h5 className="pm-modal-title">Assign AML review</h5>
            <p className="pm-modal-sub">{hit.id} · SLA starts immediately</p>
          </div>
        </div>
        <div className="p-4">
          <AuthorityPanel
            area="AML case assignment"
            auditRef="AUD-AML-70018"
            permissions={["Assign compliance reviewers", "Reprioritise screening cases", "View protected identity evidence", "Escalate to MLRO"]}
          />
          <label className="form-label mt-3">Reviewer</label>
          <select className="form-select" value={n} onChange={(e) => setN(e.target.value)}>
            <option>Sarah K.</option>
            <option>David K.</option>
            <option>Grace M.</option>
            <option>James O.</option>
          </select>
        </div>
        <div className="pm-modal-foot">
          <button className="btn btn-outline-secondary" onClick={close}>Cancel</button>
          <button className="btn btn-primary" onClick={() => save(n)}>Assign review</button>
        </div>
      </div>
    </div>
  );
}
