import { useState, useMemo, useCallback } from "react";
import { Badge, Drawer, Modal, Steps, useToast } from "../../../components/ui";
import { AdminRowActions, AddRecordModal, EditRecordModal, DeleteRecordWizard, LockUnlockModal, DocumentPreviewModal } from "../../../components/AdminControls";

interface DSRRecord { id: string; requestId: string; user: string; type: string; received: string; deadline: string; status: string; assigned: string; notes: string; locked: boolean; lockedBy?: string; lockedAt?: string; lockReason?: string; }
interface ProcessingRecord { id: string; activity: string; legalBasis: string; dataTypes: string; retention: string; thirdParties: string; dpoReview: string; locked: boolean; lockedBy?: string; lockedAt?: string; lockReason?: string; }
interface ConsentRecord { id: string; consentType: string; collectionPoint: string; optInRate: string; optOutRate: string; locked: boolean; lockedBy?: string; lockedAt?: string; lockReason?: string; }
interface DPIARecord { id: string; assessment: string; status: string; riskLevel: string; mitigations: string; completed: string; reviewDate: string; locked: boolean; lockedBy?: string; lockedAt?: string; lockReason?: string; }
interface RetentionRecord { id: string; category: string; period: string; legalBasis: string; deletionMethod: string; locked: boolean; lockedBy?: string; lockedAt?: string; lockReason?: string; }

const initDSRs: DSRRecord[] = [
  { id: "dsr-001", requestId: "DSR-023", user: "PAY-55667", type: "Access", received: "Aug 20", deadline: "Sep 19", status: "In progress", assigned: "Legal", notes: "Compiling data", locked: false },
  { id: "dsr-002", requestId: "DSR-022", user: "PAY-88900", type: "Deletion", received: "Aug 18", deadline: "Sep 17", status: "In progress", assigned: "Legal", notes: "Checking legal holds", locked: false },
  { id: "dsr-003", requestId: "DSR-021", user: "PAY-11234", type: "Rectification", received: "Aug 15", deadline: "Sep 14", status: "In progress", assigned: "Support", notes: "Wrong phone number", locked: false },
  { id: "dsr-004", requestId: "DSR-020", user: "PAY-44556", type: "Access", received: "Aug 10", deadline: "Sep 9", status: "Completed", assigned: "Legal", notes: "Data package sent", locked: false },
  { id: "dsr-005", requestId: "DSR-019", user: "PAY-77889", type: "Objection", received: "Aug 5", deadline: "Sep 4", status: "Completed", assigned: "Legal", notes: "Marketing opt-out processed", locked: false },
  { id: "dsr-006", requestId: "DSR-018", user: "PAY-33445", type: "Portability", received: "Aug 2", deadline: "Sep 1", status: "Completed", assigned: "Tech", notes: "Encrypted export sent", locked: false },
];

const initProcessing: ProcessingRecord[] = [
  { id: "pr-001", activity: "Account management", legalBasis: "Contract", dataTypes: "Name, ID, phone, email", retention: "Lifetime + 7 years", thirdParties: "Onfido, ComplyAdvantage", dpoReview: "Mar 2026", locked: false },
  { id: "pr-002", activity: "Transaction processing", legalBasis: "Contract", dataTypes: "TXN details, amounts, parties", retention: "7 years", thirdParties: "Safaricom, Visa, Banks", dpoReview: "Mar 2026", locked: false },
  { id: "pr-003", activity: "KYC verification", legalBasis: "Legal obligation", dataTypes: "ID, selfie, address", retention: "7 years after closure", thirdParties: "Onfido", dpoReview: "Mar 2026", locked: false },
  { id: "pr-004", activity: "Fraud prevention", legalBasis: "Legitimate interest", dataTypes: "Device, IP, behaviour", retention: "3 years", thirdParties: "ComplyAdvantage", dpoReview: "Mar 2026", locked: false },
  { id: "pr-005", activity: "Marketing", legalBasis: "Consent", dataTypes: "Name, phone, email, usage", retention: "Until opt-out", thirdParties: "Africa's Talking, SendGrid", dpoReview: "Mar 2026", locked: false },
  { id: "pr-006", activity: "AML screening", legalBasis: "Legal obligation", dataTypes: "Name, DOB, nationality", retention: "7 years", thirdParties: "ComplyAdvantage", dpoReview: "Mar 2026", locked: false },
  { id: "pr-007", activity: "Analytics", legalBasis: "Legitimate interest", dataTypes: "Anonymized usage", retention: "2 years", thirdParties: "Datadog", dpoReview: "Mar 2026", locked: false },
  { id: "pr-008", activity: "Loan assessment", legalBasis: "Contract", dataTypes: "Financial and credit history", retention: "Loan + 7 years", thirdParties: "Internal", dpoReview: "Mar 2026", locked: false },
  { id: "pr-009", activity: "Customer support", legalBasis: "Contract", dataTypes: "Conversations, account data", retention: "2 years after closure", thirdParties: "—", dpoReview: "Mar 2026", locked: false },
];

const initConsent: ConsentRecord[] = [
  { id: "cn-001", consentType: "Terms of Service", collectionPoint: "Registration", optInRate: "100%", optOutRate: "0%", locked: false },
  { id: "cn-002", consentType: "Privacy Policy", collectionPoint: "Registration", optInRate: "100%", optOutRate: "0%", locked: false },
  { id: "cn-003", consentType: "Marketing push", collectionPoint: "App settings", optInRate: "65.5%", optOutRate: "34.5%", locked: false },
  { id: "cn-004", consentType: "Marketing email", collectionPoint: "App settings", optInRate: "71.1%", optOutRate: "28.9%", locked: false },
  { id: "cn-005", consentType: "Marketing SMS", collectionPoint: "App settings", optInRate: "0% (off by default)", optOutRate: "N/A", locked: false },
  { id: "cn-006", consentType: "WhatsApp marketing", collectionPoint: "App settings", optInRate: "12.3%", optOutRate: "87.7%", locked: false },
  { id: "cn-007", consentType: "Location tracking", collectionPoint: "App permissions", optInRate: "45.6%", optOutRate: "54.4%", locked: false },
  { id: "cn-008", consentType: "Biometric login", collectionPoint: "App permissions", optInRate: "67.8%", optOutRate: "32.2%", locked: false },
  { id: "cn-009", consentType: "Cookie consent", collectionPoint: "Website", optInRate: "100%", optOutRate: "0%", locked: false },
];

const initDPIAs: DPIARecord[] = [
  { id: "dp-001", assessment: "Fraud scoring engine", status: "Complete", riskLevel: "High", mitigations: "Minimization, transparency, human oversight", completed: "Aug 2026", reviewDate: "Feb 2027", locked: false },
  { id: "dp-002", assessment: "Biometric authentication", status: "Complete", riskLevel: "High", mitigations: "Consent, encryption, no raw storage", completed: "Jul 2026", reviewDate: "Jan 2027", locked: false },
  { id: "dp-003", assessment: "Marketing profiling", status: "Complete", riskLevel: "Medium", mitigations: "Opt-in only, no sensitive data", completed: "Jun 2026", reviewDate: "Dec 2026", locked: false },
  { id: "dp-004", assessment: "API partner data sharing", status: "Complete", riskLevel: "Medium", mitigations: "DPA in place, minimal data", completed: "May 2026", reviewDate: "Nov 2026", locked: false },
  { id: "dp-005", assessment: "AI/ML model training", status: "In progress", riskLevel: "High", mitigations: "Anonymization, consent", completed: "—", reviewDate: "—", locked: false },
  { id: "dp-006", assessment: "Location-based services", status: "In progress", riskLevel: "Medium", mitigations: "Granular consent, auto-disable", completed: "—", reviewDate: "—", locked: false },
];

const initRetention: RetentionRecord[] = [
  { id: "rt-001", category: "Account data", period: "Lifetime + 7 years", legalBasis: "CBK regulations", deletionMethod: "Automated purge", locked: false },
  { id: "rt-002", category: "Transaction data", period: "7 years", legalBasis: "CBK + KRA", deletionMethod: "Automated purge", locked: false },
  { id: "rt-003", category: "KYC documents", period: "7 years after closure", legalBasis: "AML regulations", deletionMethod: "Automated purge", locked: false },
  { id: "rt-004", category: "Support conversations", period: "2 years after closure", legalBasis: "Internal policy", deletionMethod: "Automated purge", locked: false },
  { id: "rt-005", category: "Marketing data", period: "Until opt-out + 30 days", legalBasis: "Consent", deletionMethod: "Automated purge", locked: false },
  { id: "rt-006", category: "System logs", period: "2 years", legalBasis: "Internal policy", deletionMethod: "Automated purge", locked: false },
  { id: "rt-007", category: "Audit logs", period: "7 years", legalBasis: "Compliance", deletionMethod: "Automated purge", locked: false },
  { id: "rt-008", category: "Backup data", period: "90 days", legalBasis: "Disaster recovery", deletionMethod: "Auto-rotation", locked: false },
];

const dsrFields = [
  { key: "requestId", label: "Request ID", placeholder: "e.g. DSR-024" },
  { key: "user", label: "User ID", placeholder: "e.g. PAY-12345" },
  { key: "type", label: "Request Type", options: ["Access", "Deletion", "Rectification", "Objection", "Portability", "Restriction"] },
  { key: "assigned", label: "Assigned To", placeholder: "e.g. Legal", options: ["Legal", "Support", "Tech", "DPO"] },
  { key: "notes", label: "Notes", placeholder: "Describe the request...", type: "textarea" },
];

const processingFields = [
  { key: "activity", label: "Activity Name", placeholder: "e.g. Data analytics" },
  { key: "legalBasis", label: "Legal Basis", options: ["Contract", "Legal obligation", "Legitimate interest", "Consent"] },
  { key: "dataTypes", label: "Data Types", placeholder: "e.g. Name, email, phone" },
  { key: "retention", label: "Retention Period", placeholder: "e.g. 7 years" },
  { key: "thirdParties", label: "Third Parties", placeholder: "e.g. AWS, Onfido" },
];

const dpiaFields = [
  { key: "assessment", label: "Assessment Name", placeholder: "e.g. New payment feature" },
  { key: "riskLevel", label: "Risk Level", options: ["High", "Medium", "Low"] },
  { key: "mitigations", label: "Mitigations", placeholder: "e.g. Encryption, access controls", type: "textarea" },
];

const retentionFields = [
  { key: "category", label: "Data Category", placeholder: "e.g. User analytics" },
  { key: "period", label: "Retention Period", placeholder: "e.g. 2 years" },
  { key: "legalBasis", label: "Legal Basis", placeholder: "e.g. GDPR Art. 6" },
  { key: "deletionMethod", label: "Deletion Method", options: ["Automated purge", "Manual deletion", "Auto-rotation"] },
];

export function PrivacyPolicy({ signal: _signal }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  const { push } = useToast();
  const [tab, setTab] = useState("dashboard");
  const [q, setQ] = useState("");
  const [dsrs, setDSRs] = useState(initDSRs);
  const [processing, setProcessing] = useState(initProcessing);
  const [consent] = useState(initConsent);
  const [dpias, setDPIAs] = useState(initDPIAs);
  const [retention, setRetention] = useState(initRetention);
  const [drawer, setDrawer] = useState(false);
  const [wizard, setWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [action, setAction] = useState<{ title: string; body: React.ReactNode; icon?: string; tone?: "green" | "red" | "amber" | "blue" | "violet" | "ink" } | null>(null);

  const [addDSR, setAddDSR] = useState(false);
  const [editDSR, setEditDSR] = useState<DSRRecord | null>(null);
  const [deleteDSR, setDeleteDSR] = useState<DSRRecord | null>(null);
  const [lockDSR, setLockDSR] = useState<DSRRecord | null>(null);

  const [addProcessing, setAddProcessing] = useState(false);
  const [editProcessing, setEditProcessing] = useState<ProcessingRecord | null>(null);
  const [deleteProcessing, setDeleteProcessing] = useState<ProcessingRecord | null>(null);
  const [lockProcessing, setLockProcessing] = useState<ProcessingRecord | null>(null);

  const [addDPIA, setAddDPIA] = useState(false);
  const [editDPIA, setEditDPIA] = useState<DPIARecord | null>(null);
  const [deleteDPIA, setDeleteDPIA] = useState<DPIARecord | null>(null);
  const [lockDPIA, setLockDPIA] = useState<DPIARecord | null>(null);

  const [addRetention, setAddRetention] = useState(false);
  const [editRetention, setEditRetention] = useState<RetentionRecord | null>(null);
  const [deleteRetention, setDeleteRetention] = useState<RetentionRecord | null>(null);
  const [lockRetention, setLockRetention] = useState<RetentionRecord | null>(null);

  const filtered = useMemo(() => dsrs.filter(r => [r.requestId, r.user, r.type, r.status, r.assigned].join(" ").toLowerCase().includes(q.toLowerCase())), [q, dsrs]);
  const toggleLock = useCallback(<T extends { id: string; locked: boolean }>(items: T[], setItems: (fn: (p: T[]) => T[]) => void, id: string, locked: boolean) => {
    setItems(p => p.map(x => x.id === id ? { ...x, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Manual lock" : undefined } as T : x));
  }, []);

  return (
    <div className="pm-page-content privacy-page">
      <div className="pm-section-head" style={{ marginTop: 0 }}>
        <div>
          <div className="pm-eyebrow">DOCUMENTS & LEGAL / PAGE 39</div>
          <h2 className="mb-1">Privacy Policy</h2>
          <p>Manage data privacy, data subject requests, consent, DPIAs, retention and ODPC compliance.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setDrawer(true)}><i className="bi bi-shield-check me-1" />Privacy controls</button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => setWizard(true)}><i className="bi bi-file-earmark-plus me-1" />Update policy</button>
          <button className="btn btn-primary btn-sm" onClick={() => setAction({ title: "Export privacy register", body: "The processing register, consent ledger and DSR summary were prepared for the DPO.", icon: "bi-download", tone: "blue" })}><i className="bi bi-download me-1" />Export register</button>
        </div>
      </div>

      <div className="pm-hero privacy-hero mb-3">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <div className="pm-eyebrow text-white-50">DATA PROTECTION · ODPC READY</div>
            <div className="pm-hero-value">148,392 <span className="fs-6 fw-normal text-white-50">data subjects protected</span></div>
            <div className="small text-white-50 mt-2">100% active consents · 3 DSRs pending · 0 breaches reported YTD · 94% training complete</div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <div className="pm-hero-chip"><div className="l">DSRs this month</div><div className="v">23</div></div>
            <div className="pm-hero-chip"><div className="l">Avg resolution</div><div className="v text-success">12.3 days</div></div>
            <div className="pm-hero-chip"><div className="l">DPIAs pending</div><div className="v text-warning">2</div></div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-3">
        {[["Active consents", "148,392", "100% of data subjects", "bi-check-circle", "green"], ["DSRs pending", "3", "20 completed in 30d", "bi-inbox", "blue"], ["DPIAs complete", "8", "2 assessments in progress", "bi-file-earmark-check", "violet"], ["Breaches YTD", "0", "Response plan on standby", "bi-shield-check", "amber"]].map(x => (
          <div className="col-6 col-xl-3" key={x[0]}><div className="pm-stat"><div className={`pm-stat-ico bg-${x[4]}-soft text-${x[4]}`}><i className={`bi ${x[3]}`} /></div><div className="pm-stat-label">{x[0]}</div><div className="pm-stat-value">{x[1]}</div><div className="pm-stat-foot">{x[2]}</div></div></div>
        ))}
      </div>

      <div className="pm-card mb-3">
        <div className="pm-tabs">
          {[["dashboard", "Privacy dashboard", "bi-grid"], ["dsr", "DSR management", "bi-inbox"], ["processing", "Processing register", "bi-database"], ["consent", "Consent management", "bi-person-check"], ["dpia", "DPIAs", "bi-file-earmark-check"], ["retention", "Retention schedule", "bi-clock-history"], ["breach", "Breach management", "bi-shield-exclamation"]].map(x => (
            <button className={`pm-tab ${tab === x[0] ? "active" : ""}`} key={x[0]} onClick={() => setTab(x[0])}><i className={`bi ${x[2]}`} />{x[1]}</button>
          ))}
        </div>
      </div>

      {tab === "dashboard" && (
        <section>
          <div className="row g-3">
            {[["Total data subjects", "148,392", "—"], ["Average DSR resolution", "12.3 days", "Target <30 days"], ["Privacy training", "94%", "Target 100%"], ["Marketing opt-ins", "97,234", "65.5% of users"]].map(x => (
              <div className="col-md-6 col-xl-3" key={x[0]}><div className="pm-card pm-card-pad"><div className="pm-stat-label">{x[0]}</div><h4 className="mt-2">{x[1]}</h4><div className="pm-td-sub">{x[2]}</div></div></div>
            ))}
          </div>
        </section>
      )}

      {tab === "dsr" && (
        <section>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div><h3>Data subject request management</h3><p>Access, deletion, rectification, objection and portability requests.</p></div>
            <div className="d-flex gap-2 align-items-center">
              <div className="pm-search"><i className="bi bi-search" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search DSR, user or type" /></div>
              <button className="btn btn-primary btn-sm" onClick={() => setAddDSR(true)}><i className="bi bi-plus-circle me-1" />Add DSR</button>
            </div>
          </div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Request ID</th><th>User</th><th>Type</th><th>Received</th><th>Deadline</th><th>Status</th><th>Assigned</th><th className="text-end">Actions</th></tr></thead>
                <tbody>
                  {filtered.map(d => (
                    <tr key={d.id}>
                      <td className="pm-td-strong">{d.requestId}{d.locked && <i className="bi bi-lock-fill ms-1" style={{ fontSize: ".6rem", color: "var(--pm-amber)" }} />}</td>
                      <td className="mono">{d.user}</td>
                      <td><Badge tone="blue">{d.type}</Badge></td>
                      <td>{d.received}</td>
                      <td>{d.deadline}</td>
                      <td><Badge tone={d.status === "Completed" ? "green" : "amber"} dot>{d.status}</Badge></td>
                      <td className="pm-td-sub">{d.assigned}</td>
                      <td className="text-end text-nowrap"><AdminRowActions onEdit={() => setEditDSR(d)} onLock={() => setLockDSR(d)} onDelete={() => setDeleteDSR(d)} locked={d.locked} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {tab === "processing" && (
        <section>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div><h3>Data processing activities register</h3><p>Legal basis, data types, retention and processors for each privacy activity.</p></div>
            <button className="btn btn-primary btn-sm" onClick={() => setAddProcessing(true)}><i className="bi bi-plus-circle me-1" />Add activity</button>
          </div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Activity</th><th>Legal basis</th><th>Data types</th><th>Retention</th><th>Third parties</th><th className="text-end">Actions</th></tr></thead>
                <tbody>
                  {processing.map(p => (
                    <tr key={p.id}>
                      <td className="pm-td-strong">{p.activity}{p.locked && <i className="bi bi-lock-fill ms-1" style={{ fontSize: ".6rem", color: "var(--pm-amber)" }} />}</td>
                      <td>{p.legalBasis}</td>
                      <td style={{ fontSize: ".82rem" }}>{p.dataTypes}</td>
                      <td className="pm-td-sub">{p.retention}</td>
                      <td className="pm-td-sub">{p.thirdParties}</td>
                      <td className="text-end text-nowrap"><AdminRowActions onEdit={() => setEditProcessing(p)} onLock={() => setLockProcessing(p)} onDelete={() => setDeleteProcessing(p)} locked={p.locked} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {tab === "consent" && (
        <section>
          <div className="pm-section-head"><div><h3>Consent management</h3><p>Collection points, opt-in rates and user-controlled preferences.</p></div></div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Consent type</th><th>Collection point</th><th>Opt-in rate</th><th>Opt-out rate</th></tr></thead>
                <tbody>
                  {consent.map(c => (
                    <tr key={c.id}><td className="pm-td-strong">{c.consentType}</td><td>{c.collectionPoint}</td><td className="pm-num">{c.optInRate}</td><td className="pm-num">{c.optOutRate}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {tab === "dpia" && (
        <section>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div><h3>Data Protection Impact Assessments</h3><p>Risk assessment, mitigation evidence and next review dates.</p></div>
            <button className="btn btn-primary btn-sm" onClick={() => setAddDPIA(true)}><i className="bi bi-plus-circle me-1" />Add DPIA</button>
          </div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Assessment</th><th>Status</th><th>Risk level</th><th>Mitigations</th><th>Completed</th><th className="text-end">Actions</th></tr></thead>
                <tbody>
                  {dpias.map(d => (
                    <tr key={d.id}>
                      <td className="pm-td-strong">{d.assessment}{d.locked && <i className="bi bi-lock-fill ms-1" style={{ fontSize: ".6rem", color: "var(--pm-amber)" }} />}</td>
                      <td><Badge tone={d.status === "Complete" ? "green" : "amber"} dot>{d.status}</Badge></td>
                      <td><Badge tone={d.riskLevel === "High" ? "red" : "amber"}>{d.riskLevel}</Badge></td>
                      <td style={{ fontSize: ".82rem" }}>{d.mitigations}</td>
                      <td className="pm-td-sub">{d.completed}</td>
                      <td className="text-end text-nowrap"><AdminRowActions onEdit={() => setEditDPIA(d)} onLock={() => setLockDPIA(d)} onDelete={() => setDeleteDPIA(d)} locked={d.locked} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {tab === "retention" && (
        <section>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div><h3>Data retention schedule</h3><p>Retention periods, legal bases and automated deletion methods.</p></div>
            <button className="btn btn-primary btn-sm" onClick={() => setAddRetention(true)}><i className="bi bi-plus-circle me-1" />Add retention rule</button>
          </div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Data category</th><th>Retention period</th><th>Legal basis</th><th>Deletion method</th><th className="text-end">Actions</th></tr></thead>
                <tbody>
                  {retention.map(r => (
                    <tr key={r.id}>
                      <td className="pm-td-strong">{r.category}{r.locked && <i className="bi bi-lock-fill ms-1" style={{ fontSize: ".6rem", color: "var(--pm-amber)" }} />}</td>
                      <td>{r.period}</td>
                      <td className="pm-td-sub">{r.legalBasis}</td>
                      <td>{r.deletionMethod}</td>
                      <td className="text-end text-nowrap"><AdminRowActions onEdit={() => setEditRetention(r)} onLock={() => setLockRetention(r)} onDelete={() => setDeleteRetention(r)} locked={r.locked} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {tab === "breach" && (
        <section>
          <div className="pm-section-head"><div><h3>Data breach management</h3><p>No breaches reported YTD. Response plan is ready for immediate activation.</p></div></div>
          <div className="pm-card pm-card-pad border-success">
            <Badge tone="green" dot>No breaches reported YTD</Badge>
            <h5 className="mt-3">Breach response plan</h5>
            <div className="row g-3 mt-2">
              {[["Detection", "Automated monitoring + employee reports"], ["Containment", "Immediate isolation of affected system"], ["Assessment", "DPO + Legal assess severity and scope"], ["ODPC notification", "Within 72 hours where required"], ["User notification", "Without undue delay if high risk"], ["Post-incident", "Root cause and remediation plan"]].map(x => (
                <div className="col-md-6" key={x[0]}><div className="config-row"><span className="pm-td-sub">{x[0]}</span><b>{x[1]}</b></div></div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ALL MODALS */}
      {action && <Modal open onClose={() => setAction(null)} title={action.title} subtitle="Super Admin action · privacy evidence is retained and audited" icon={action.icon} tone={action.tone}><div className="pm-modal-body">{action.body}</div><div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={() => setAction(null)}>Cancel</button><button className="btn btn-primary" onClick={() => { setAction(null); push({ kind: "success", title: "Privacy workspace updated" }); }}>Confirm action</button></div></Modal>}

      {wizard && <Modal open onClose={() => setWizard(false)} title="Update privacy policy" subtitle={`Step ${wizardStep + 1} of 4: ${["Identity", "Content", "DPO review", "Publish"][wizardStep]}`} icon="bi-file-earmark-plus" tone="blue" size="lg">
        <Steps current={wizardStep} steps={[{ label: "Identity", icon: "bi-file-text" }, { label: "Content", icon: "bi-pencil" }, { label: "DPO review", icon: "bi-people" }, { label: "Publish", icon: "bi-cloud-upload" }]} />
        <div className="pm-wizard-progress"><span style={{ width: `${(wizardStep + 1) * 25}%` }} /></div>
        <div className="pm-modal-body"><div className="row g-3"><div className="col-md-7"><label className="form-label">Policy version</label><input className="form-control" defaultValue="Privacy Policy v3.2" /></div><div className="col-md-5"><label className="form-label">Languages</label><select className="form-select"><option>English + Swahili</option><option>English</option></select></div><div className="col-12"><label className="form-label">Change summary</label><textarea className="form-control" rows={4} defaultValue="Update data retention periods and clarify WhatsApp processing. Re-consent required on publish." /></div></div></div>
        <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={() => wizardStep ? setWizardStep(wizardStep - 1) : setWizard(false)}>{wizardStep ? "Back" : "Cancel"}</button>{wizardStep < 3 ? <button className="btn btn-primary" onClick={() => setWizardStep(wizardStep + 1)}>Continue</button> : <button className="btn btn-primary" onClick={() => { setWizard(false); setWizardStep(0); push({ kind: "success", title: "Policy submitted" }); }}>Submit for approval</button>}</div>
      </Modal>}

      <AddRecordModal open={addDSR} onClose={() => setAddDSR(false)} onAdd={(d) => { setDSRs(p => [{ id: `dsr-${Date.now()}`, ...d, received: new Date().toLocaleDateString(), deadline: "TBD", status: "In progress", locked: false } as DSRRecord, ...p]); }} title="Data Subject Request" fields={dsrFields} typeName="DSR" />
      <EditRecordModal record={editDSR} open={!!editDSR} onClose={() => setEditDSR(null)} onSave={(d) => { setDSRs(p => p.map(x => x.id === d.id ? d as DSRRecord : x)); }} typeName="DSR" />
      <DeleteRecordWizard record={deleteDSR} open={!!deleteDSR} onClose={() => setDeleteDSR(null)} onDelete={() => { if (deleteDSR) setDSRs(p => p.filter(x => x.id !== deleteDSR.id)); }} typeName="DSR" relatedItems={["User data package", "Audit trail", "Legal hold check"]} />
      <LockUnlockModal record={lockDSR} open={!!lockDSR} onClose={() => setLockDSR(null)} onToggle={(locked) => { if (lockDSR) toggleLock(dsrs, setDSRs, lockDSR.id, locked); }} typeName="DSR" />

      <AddRecordModal open={addProcessing} onClose={() => setAddProcessing(false)} onAdd={(d) => { setProcessing(p => [{ id: `pr-${Date.now()}`, ...d, dpoReview: "Never", locked: false } as ProcessingRecord, ...p]); }} title="Processing Activity" fields={processingFields} typeName="Processing Activity" />
      <EditRecordModal record={editProcessing} open={!!editProcessing} onClose={() => setEditProcessing(null)} onSave={(d) => { setProcessing(p => p.map(x => x.id === d.id ? d as ProcessingRecord : x)); }} typeName="Processing Activity" />
      <DeleteRecordWizard record={deleteProcessing} open={!!deleteProcessing} onClose={() => setDeleteProcessing(null)} onDelete={() => { if (deleteProcessing) setProcessing(p => p.filter(x => x.id !== deleteProcessing.id)); }} typeName="Processing Activity" relatedItems={["DPIA references", "Consent records", "Third-party DPAs"]} />
      <LockUnlockModal record={lockProcessing} open={!!lockProcessing} onClose={() => setLockProcessing(null)} onToggle={(locked) => { if (lockProcessing) toggleLock(processing, setProcessing, lockProcessing.id, locked); }} typeName="Processing Activity" />

      <AddRecordModal open={addDPIA} onClose={() => setAddDPIA(false)} onAdd={(d) => { setDPIAs(p => [{ id: `dp-${Date.now()}`, ...d, status: "In progress", completed: "—", reviewDate: "—", locked: false } as DPIARecord, ...p]); }} title="DPIA" fields={dpiaFields} typeName="DPIA" />
      <EditRecordModal record={editDPIA} open={!!editDPIA} onClose={() => setEditDPIA(null)} onSave={(d) => { setDPIAs(p => p.map(x => x.id === d.id ? d as DPIARecord : x)); }} typeName="DPIA" />
      <DeleteRecordWizard record={deleteDPIA} open={!!deleteDPIA} onClose={() => setDeleteDPIA(null)} onDelete={() => { if (deleteDPIA) setDPIAs(p => p.filter(x => x.id !== deleteDPIA.id)); }} typeName="DPIA" relatedItems={["Risk assessments", "Mitigation evidence", "Review schedules"]} />
      <LockUnlockModal record={lockDPIA} open={!!lockDPIA} onClose={() => setLockDPIA(null)} onToggle={(locked) => { if (lockDPIA) toggleLock(dpias, setDPIAs, lockDPIA.id, locked); }} typeName="DPIA" />

      <AddRecordModal open={addRetention} onClose={() => setAddRetention(false)} onAdd={(d) => { setRetention(p => [{ id: `rt-${Date.now()}`, ...d, locked: false } as RetentionRecord, ...p]); }} title="Retention Rule" fields={retentionFields} typeName="Retention Rule" />
      <EditRecordModal record={editRetention} open={!!editRetention} onClose={() => setEditRetention(null)} onSave={(d) => { setRetention(p => p.map(x => x.id === d.id ? d as RetentionRecord : x)); }} typeName="Retention Rule" />
      <DeleteRecordWizard record={deleteRetention} open={!!deleteRetention} onClose={() => setDeleteRetention(null)} onDelete={() => { if (deleteRetention) setRetention(p => p.filter(x => x.id !== deleteRetention.id)); }} typeName="Retention Rule" relatedItems={["Purge schedules", "Legal hold exceptions"]} />
      <LockUnlockModal record={lockRetention} open={!!lockRetention} onClose={() => setLockRetention(null)} onToggle={(locked) => { if (lockRetention) toggleLock(retention, setRetention, lockRetention.id, locked); }} typeName="Retention Rule" />

      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Privacy controls" subtitle="Data rights, consent and breach response controls" icon="bi-shield-check" wide>
        <div className="pm-card pm-card-pad mb-3"><Badge tone="green" dot>ODPC ready</Badge><h5 className="mt-3">Privacy governance healthy</h5><p className="small text-muted">DSR response, consent evidence, retention and breach escalation controls are monitored by the DPO.</p></div>
        <div className="pm-card pm-card-pad">
          {[["DSR statutory window", "30 days"], ["DSR average resolution", "12.3 days"], ["Consent record retention", "7 years"], ["Breach notification", "ODPC within 72 hours"], ["Data Protection Officer", "Assigned · Legal"], ["Open legal holds", "2"]].map(x => (<div className="config-row" key={x[0]}><span className="pm-td-sub">{x[0]}</span><b>{x[1]}</b></div>))}
        </div>
      </Drawer>
    </div>
  );
}
