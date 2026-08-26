import { useState, useMemo, useCallback } from "react";
import { Badge, Drawer, Modal, Steps, useToast } from "../../../components/ui";
import { AdminRowActions, AddRecordModal, EditRecordModal, DeleteRecordWizard, LockUnlockModal, DocumentPreviewModal } from "../../../components/AdminControls";

/* ---- typed data ---- */
interface PolicyRecord { id: string; name: string; version: string; owner: string; lastApproved: string; nextReview: string; status: string; locked: boolean; lockedBy?: string; lockedAt?: string; lockReason?: string; description: string; body: string; }
interface LicenseRecord { id: string; name: string; issuer: string; validUntil: string; status: string; renewal: string; locked: boolean; lockedBy?: string; lockedAt?: string; lockReason?: string; }
interface FilingRecord { id: string; name: string; authority: string; frequency: string; dueDate: string; status: string; filedBy: string; locked: boolean; lockedBy?: string; lockedAt?: string; lockReason?: string; }
interface TrainingRecord { id: string; course: string; requiredFor: string; completion: string; dueDate: string; provider: string; locked: boolean; lockedBy?: string; lockedAt?: string; lockReason?: string; }
interface ExamRecord { id: string; name: string; authority: string; date: string; scope: string; findings: string; rating: string; locked: boolean; lockedBy?: string; lockedAt?: string; lockReason?: string; }

const initPolicies: PolicyRecord[] = [
  { id: "p-001", name: "AML/CFT Policy", version: "v4.2", owner: "MLRO", lastApproved: "Jul 2026", nextReview: "Jan 2027", status: "Active", locked: false, description: "Anti-money laundering and counter-terrorism financing", body: "AML/CFT Policy\n\n1. Customer Due Diligence\nAll customers must be identified and verified before account activation.\n\n2. Enhanced Due Diligence\nPEPs and high-risk customers require enhanced verification.\n\n3. Suspicious Activity Reporting\nAll suspicious transactions must be reported to the FRA within 24 hours.\n\n4. Record Keeping\nTransaction records must be retained for 7 years.\n\nApproved by:\n{{signatory_name}}" },
  { id: "p-002", name: "KYC/CDD Policy", version: "v3.1", owner: "MLRO", lastApproved: "Aug 2026", nextReview: "Feb 2027", status: "Active", locked: false, description: "Know your customer and customer due diligence", body: "KYC/CDD Policy\n\n1. Identity Verification\nAll customers must provide valid government-issued ID.\n\n2. Address Verification\nProof of address required for Tier 2 and above.\n\n3. Ongoing Monitoring\nCustomer risk profiles reviewed annually." },
  { id: "p-003", name: "Fraud Prevention Policy", version: "v2.8", owner: "Compliance Lead", lastApproved: "Jun 2026", nextReview: "Dec 2026", status: "Active", locked: false, description: "Fraud detection, prevention and response", body: "Fraud Prevention Policy\n\n1. Transaction Monitoring\nReal-time monitoring of all transactions for suspicious patterns.\n\n2. Alert Investigation\nAll alerts investigated within 48 hours.\n\n3. Loss Reporting\nFraud losses reported to management weekly." },
  { id: "p-004", name: "Sanctions Screening Policy", version: "v3.1", owner: "MLRO", lastApproved: "Aug 2026", nextReview: "Feb 2027", status: "Active", locked: false, description: "OFAC, UN and EU sanctions screening", body: "Sanctions Screening Policy\n\n1. Screening Scope\nAll customers and counterparties screened against sanctions lists.\n\n2. Match Handling\nPotential matches escalated to MLRO within 1 hour." },
  { id: "p-005", name: "SAR Procedures", version: "v3.0", owner: "MLRO", lastApproved: "May 2026", nextReview: "Nov 2026", status: "Active", locked: false, description: "Suspicious activity reporting procedures", body: "SAR Procedures\n\n1. Internal Reporting\nStaff must report suspicious activity to MLRO immediately.\n\n2. External Filing\nMLRO files SAR with FRA within 24 hours.\n\n3. Tipping Off\nTipping off is a criminal offense." },
  { id: "p-006", name: "Data Protection Policy", version: "v3.1", owner: "DPO", lastApproved: "Jul 2026", nextReview: "Oct 2026", status: "Active", locked: false, description: "Personal data protection per ODPC requirements", body: "Data Protection Policy\n\n1. Lawful Processing\nAll data processing must have a valid legal basis.\n\n2. Data Minimization\nOnly data necessary for the stated purpose is collected.\n\n3. Data Subject Rights\nAccess, rectification, erasure and portability requests handled within 30 days." },
  { id: "p-007", name: "Information Security Policy", version: "v4.0", owner: "CISO", lastApproved: "Aug 2026", nextReview: "Feb 2027", status: "Active", locked: false, description: "Information security management system", body: "Information Security Policy\n\n1. Access Control\nLeast privilege principle enforced across all systems.\n\n2. Encryption\nData encrypted at rest (AES-256) and in transit (TLS 1.3).\n\n3. Incident Response\nSecurity incidents reported to CISO within 1 hour." },
  { id: "p-008", name: "Business Continuity Plan", version: "v2.5", owner: "COO", lastApproved: "Jul 2026", nextReview: "Jan 2027", status: "Active", locked: false, description: "Business continuity and disaster recovery", body: "Business Continuity Plan\n\n1. RTO Targets\nCritical systems: 4 hours. Non-critical: 24 hours.\n\n2. Testing\nAnnual tabletop and technical testing." },
  { id: "p-009", name: "Disaster Recovery Plan", version: "v2.3", owner: "CTO", lastApproved: "Jun 2026", nextReview: "Dec 2026", status: "Active", locked: false, description: "Technical disaster recovery procedures", body: "Disaster Recovery Plan\n\n1. Backup Strategy\nDaily encrypted backups with 90-day retention.\n\n2. Failover\nAutomated failover to secondary region within 15 minutes." },
  { id: "p-010", name: "Whistleblower Policy", version: "v1.5", owner: "Legal", lastApproved: "Mar 2026", nextReview: "Sep 2026", status: "Active", locked: false, description: "Confidential reporting of misconduct", body: "Whistleblower Policy\n\n1. Reporting Channels\nAnonymous reporting via hotline and email.\n\n2. Protection\nWhistleblowers protected from retaliation." },
  { id: "p-011", name: "Conflict of Interest Policy", version: "v1.3", owner: "Legal", lastApproved: "Mar 2026", nextReview: "Sep 2026", status: "Active", locked: false, description: "Managing conflicts of interest", body: "Conflict of Interest Policy\n\n1. Disclosure\nAll conflicts must be disclosed annually.\n\n2. Management\nConflicts managed through recusal or mitigation." },
  { id: "p-012", name: "Third-Party Risk Management", version: "v2.0", owner: "Compliance", lastApproved: "May 2026", nextReview: "Nov 2026", status: "Active", locked: false, description: "Vendor and third-party risk assessment", body: "Third-Party Risk Management\n\n1. Due Diligence\nAll vendors assessed before engagement.\n\n2. Ongoing Monitoring\nAnnual vendor risk assessments." },
];

const initLicenses: LicenseRecord[] = [
  { id: "l-001", name: "CBK Digital Credit Provider License", issuer: "Central Bank of Kenya", validUntil: "Dec 2027", status: "Active", renewal: "Nov 2027", locked: false },
  { id: "l-002", name: "CBK Payment Service Provider License", issuer: "Central Bank of Kenya", validUntil: "Dec 2027", status: "Active", renewal: "Nov 2027", locked: false },
  { id: "l-003", name: "DPA Registration", issuer: "ODPC", validUntil: "Permanent", status: "Active", renewal: "—", locked: false },
  { id: "l-004", name: "PCI DSS Level 1", issuer: "PCI Security Council", validUntil: "Dec 2026", status: "Active", renewal: "Nov 2026", locked: false },
  { id: "l-005", name: "ISO 27001", issuer: "BSI", validUntil: "Mar 2028", status: "Active", renewal: "Feb 2028", locked: false },
  { id: "l-006", name: "ISO 27701", issuer: "BSI", validUntil: "Mar 2028", status: "Active", renewal: "Feb 2028", locked: false },
  { id: "l-007", name: "SOC 2 Type II", issuer: "Deloitte", validUntil: "Sep 2027", status: "Active", renewal: "Aug 2027", locked: false },
];

const initFilings: FilingRecord[] = [
  { id: "f-001", name: "VAT Return", authority: "KRA", frequency: "Monthly", dueDate: "20th of following month", status: "Aug filed", filedBy: "Tax team", locked: false },
  { id: "f-002", name: "Excise Duty Return", authority: "KRA", frequency: "Monthly", dueDate: "20th of following month", status: "Aug filed", filedBy: "Tax team", locked: false },
  { id: "f-003", name: "DST Return", authority: "KRA", frequency: "Monthly", dueDate: "20th of following month", status: "Aug filed", filedBy: "Tax team", locked: false },
  { id: "f-004", name: "PAYE Return", authority: "KRA", frequency: "Monthly", dueDate: "9th of following month", status: "Sep filed", filedBy: "HR", locked: false },
  { id: "f-005", name: "Corporate Tax", authority: "KRA", frequency: "Quarterly", dueDate: "Last day of 4th month", status: "Q2 pending", filedBy: "Tax team", locked: false },
  { id: "f-006", name: "CBK Prudential Returns", authority: "CBK", frequency: "Monthly", dueDate: "Last day of following month", status: "Jul pending", filedBy: "Finance", locked: false },
  { id: "f-007", name: "AML/CFT Report", authority: "FRA", frequency: "Quarterly", dueDate: "Last day of following quarter", status: "Q3 pending", filedBy: "MLRO", locked: false },
  { id: "f-008", name: "Data Protection Audit", authority: "ODPC", frequency: "Annual", dueDate: "Mar 31", status: "Filed", filedBy: "DPO", locked: false },
];

const initTraining: TrainingRecord[] = [
  { id: "t-001", course: "AML Fundamentals", requiredFor: "All staff", completion: "94% (52/55)", dueDate: "Aug 2027", provider: "Internal", locked: false },
  { id: "t-002", course: "Data Protection", requiredFor: "All staff", completion: "91% (50/55)", dueDate: "Aug 2027", provider: "External", locked: false },
  { id: "t-003", course: "Information Security", requiredFor: "All staff", completion: "96% (53/55)", dueDate: "Aug 2027", provider: "External", locked: false },
  { id: "t-004", course: "Fraud Awareness", requiredFor: "All staff", completion: "89% (49/55)", dueDate: "Aug 2027", provider: "Internal", locked: false },
  { id: "t-005", course: "SAR Filing", requiredFor: "Investigators", completion: "100% (6/6)", dueDate: "Aug 2027", provider: "Internal", locked: false },
  { id: "t-006", course: "KYC Procedures", requiredFor: "KYC team", completion: "100% (8/8)", dueDate: "Aug 2027", provider: "Internal", locked: false },
  { id: "t-007", course: "Board Governance", requiredFor: "Board", completion: "100% (5/5)", dueDate: "Aug 2027", provider: "External", locked: false },
  { id: "t-008", course: "Code of Conduct", requiredFor: "All staff", completion: "98% (54/55)", dueDate: "Aug 2027", provider: "Internal", locked: false },
];

const initExams: ExamRecord[] = [
  { id: "e-001", name: "AML/CFT On-site", authority: "FRA", date: "Mar 2026", scope: "Full AML program", findings: "2 minor findings", rating: "Satisfactory", locked: false },
  { id: "e-002", name: "Prudential Review", authority: "CBK", date: "Mar 2026", scope: "Capital, liquidity, risk", findings: "1 minor finding", rating: "Satisfactory", locked: false },
  { id: "e-003", name: "Data Protection Audit", authority: "ODPC", date: "Mar 2026", scope: "DPA compliance", findings: "0 findings", rating: "Compliant", locked: false },
  { id: "e-004", name: "PCI DSS Assessment", authority: "QSA", date: "Dec 2025", scope: "Card data security", findings: "0 findings", rating: "Compliant", locked: false },
  { id: "e-005", name: "SOC 2 Audit", authority: "Deloitte", date: "Jun 2026", scope: "Security, availability", findings: "0 findings", rating: "Type II certified", locked: false },
  { id: "e-006", name: "ISO 27001 Surveillance", authority: "BSI", date: "Jun 2026", scope: "ISMS", findings: "1 minor NCR", rating: "Maintained", locked: false },
];

/* ---- field configs ---- */
const policyFields = [
  { key: "name", label: "Policy Name", placeholder: "e.g. AML/CFT Policy v5.0" },
  { key: "version", label: "Version", placeholder: "e.g. v5.0" },
  { key: "owner", label: "Owner", placeholder: "e.g. MLRO", options: ["MLRO", "DPO", "CISO", "Legal", "Compliance Lead", "COO", "CTO"] },
  { key: "nextReview", label: "Next Review", placeholder: "e.g. Jan 2027" },
  { key: "description", label: "Description", placeholder: "Brief description of this policy", type: "textarea" },
  { key: "body", label: "Policy Content", placeholder: "Full policy content...", type: "textarea" },
];

const licenseFields = [
  { key: "name", label: "Certification Name", placeholder: "e.g. ISO 27001" },
  { key: "issuer", label: "Issuer", placeholder: "e.g. BSI" },
  { key: "validUntil", label: "Valid Until", placeholder: "e.g. Mar 2028" },
  { key: "renewal", label: "Renewal Date", placeholder: "e.g. Feb 2028" },
];

const filingFields = [
  { key: "name", label: "Filing Name", placeholder: "e.g. VAT Return" },
  { key: "authority", label: "Authority", placeholder: "e.g. KRA", options: ["KRA", "CBK", "FRA", "ODPC", "BRS"] },
  { key: "frequency", label: "Frequency", options: ["Monthly", "Quarterly", "Annual"] },
  { key: "dueDate", label: "Due Date", placeholder: "e.g. 20th of following month" },
  { key: "filedBy", label: "Filed By", placeholder: "e.g. Tax team" },
];

const trainingFields = [
  { key: "course", label: "Course Name", placeholder: "e.g. AML Fundamentals" },
  { key: "requiredFor", label: "Required For", placeholder: "e.g. All staff" },
  { key: "dueDate", label: "Due Date", placeholder: "e.g. Aug 2027" },
  { key: "provider", label: "Provider", options: ["Internal", "External"] },
];

const examFields = [
  { key: "name", label: "Exam Name", placeholder: "e.g. AML/CFT On-site" },
  { key: "authority", label: "Authority", placeholder: "e.g. FRA" },
  { key: "date", label: "Date", placeholder: "e.g. Mar 2026" },
  { key: "scope", label: "Scope", placeholder: "e.g. Full AML program" },
  { key: "findings", label: "Findings", placeholder: "e.g. 2 minor findings" },
  { key: "rating", label: "Rating", placeholder: "e.g. Satisfactory" },
];

/* ---- component ---- */
export function ComplianceDocs({ signal: _signal }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  const { push } = useToast();
  const [tab, setTab] = useState("policies");

  const [policies, setPolicies] = useState(initPolicies);
  const [licenses, setLicenses] = useState(initLicenses);
  const [filings, setFilings] = useState(initFilings);
  const [training, setTraining] = useState(initTraining);
  const [exams, setExams] = useState(initExams);

  const [drawer, setDrawer] = useState(false);
  const [wizard, setWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);

  // Policy CRUD
  const [addPolicy, setAddPolicy] = useState(false);
  const [editPolicy, setEditPolicy] = useState<PolicyRecord | null>(null);
  const [deletePolicy, setDeletePolicy] = useState<PolicyRecord | null>(null);
  const [lockPolicy, setLockPolicy] = useState<PolicyRecord | null>(null);
  const [previewPolicy, setPreviewPolicy] = useState<PolicyRecord | null>(null);

  // License CRUD
  const [addLicense, setAddLicense] = useState(false);
  const [editLicense, setEditLicense] = useState<LicenseRecord | null>(null);
  const [deleteLicense, setDeleteLicense] = useState<LicenseRecord | null>(null);
  const [lockLicense, setLockLicense] = useState<LicenseRecord | null>(null);

  // Filing CRUD
  const [addFiling, setAddFiling] = useState(false);
  const [editFiling, setEditFiling] = useState<FilingRecord | null>(null);
  const [deleteFiling, setDeleteFiling] = useState<FilingRecord | null>(null);
  const [lockFiling, setLockFiling] = useState<FilingRecord | null>(null);

  // Training CRUD
  const [addTraining, setAddTraining] = useState(false);
  const [editTraining, setEditTraining] = useState<TrainingRecord | null>(null);
  const [deleteTraining, setDeleteTraining] = useState<TrainingRecord | null>(null);
  const [lockTraining, setLockTraining] = useState<TrainingRecord | null>(null);

  // Exam CRUD
  const [addExam, setAddExam] = useState(false);
  const [editExam, setEditExam] = useState<ExamRecord | null>(null);
  const [deleteExam, setDeleteExam] = useState<ExamRecord | null>(null);
  const [lockExam, setLockExam] = useState<ExamRecord | null>(null);

  // Generic
  const [action, setAction] = useState<{ title: string; body: React.ReactNode; icon?: string; tone?: "green" | "red" | "amber" | "blue" | "violet" | "ink" } | null>(null);

  const toggleLock = useCallback(<T extends { id: string; locked: boolean }>(items: T[], setItems: (fn: (p: T[]) => T[]) => void, id: string, locked: boolean) => {
    setItems(p => p.map(x => x.id === id ? { ...x, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Manual lock" : undefined } as T : x));
  }, []);

  return (
    <div className="pm-page-content compliance-page">
      <div className="pm-section-head" style={{ marginTop: 0 }}>
        <div>
          <div className="pm-eyebrow">DOCUMENTS & LEGAL / PAGE 40</div>
          <h2 className="mb-1">Compliance Documents</h2>
          <p>Central repository for policies, licences, regulatory filings, training and examination evidence.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setDrawer(true)}><i className="bi bi-clock-history me-1" />Audit trail</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setWizard(true)}><i className="bi bi-file-earmark-arrow-up me-1" />Upload evidence</button>
          <button className="btn btn-primary btn-sm" onClick={() => setAction({ title: "Compliance pack exported", body: "The current policy, licence and filing evidence pack was prepared for the Board and regulators.", icon: "bi-download", tone: "blue" })}><i className="bi bi-download me-1" />Export compliance pack</button>
        </div>
      </div>

      <div className="pm-hero compliance-hero mb-3">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <div className="pm-eyebrow text-white-50">COMPLIANCE CONTROL PLANE · 2026</div>
            <div className="pm-hero-value">{policies.length} <span className="fs-6 fw-normal text-white-50">active policies</span></div>
            <div className="small text-white-50 mt-2">{licenses.length} certifications active · {filings.length} regulatory filings tracked · 94% training completion</div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <div className="pm-hero-chip"><div className="l">Open filings</div><div className="v text-warning">3</div></div>
            <div className="pm-hero-chip"><div className="l">Certifications</div><div className="v text-success">{licenses.length} / {licenses.length}</div></div>
            <div className="pm-hero-chip"><div className="l">Open incidents</div><div className="v">0</div></div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-3">
        {[["Active policies", String(policies.length), "All version controlled", "bi-file-earmark-check", "green"], ["Certifications & licences", String(licenses.length), "No expired credentials", "bi-patch-check", "blue"], ["Training completion", "94%", "52 of 55 staff", "bi-mortarboard", "violet"], ["Regulatory filings", String(filings.length), "3 require action", "bi-receipt", "amber"]].map(x => (
          <div className="col-6 col-xl-3" key={x[0]}><div className="pm-stat"><div className={`pm-stat-ico bg-${x[4]}-soft text-${x[4]}`}><i className={`bi ${x[3]}`} /></div><div className="pm-stat-label">{x[0]}</div><div className="pm-stat-value">{x[1]}</div><div className="pm-stat-foot">{x[2]}</div></div></div>
        ))}
      </div>

      <div className="pm-card mb-3">
        <div className="pm-tabs">
          {[["policies", "Policy library", "bi-files"], ["licenses", "Certifications", "bi-patch-check"], ["filings", "Regulatory filings", "bi-receipt"], ["training", "Training records", "bi-mortarboard"], ["exams", "Examination history", "bi-clipboard-check"]].map(x => (
            <button className={`pm-tab ${tab === x[0] ? "active" : ""}`} key={x[0]} onClick={() => setTab(x[0])}><i className={`bi ${x[2]}`} />{x[1]}</button>
          ))}
        </div>
      </div>

      {/* ---- POLICIES TAB ---- */}
      {tab === "policies" && (
        <section>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div><h3>Policy library</h3><p>Approved compliance policies, owners and upcoming review dates.</p></div>
            <button className="btn btn-primary btn-sm" onClick={() => setAddPolicy(true)}><i className="bi bi-plus-circle me-1" />Add policy</button>
          </div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Policy</th><th>Version</th><th>Owner</th><th>Last approved</th><th>Next review</th><th>Status</th><th className="text-end">Actions</th></tr></thead>
                <tbody>
                  {policies.map(p => (
                    <tr key={p.id}>
                      <td className="pm-td-strong">{p.name}{p.locked && <i className="bi bi-lock-fill ms-1" style={{ fontSize: ".6rem", color: "var(--pm-amber)" }} />}</td>
                      <td className="mono">{p.version}</td>
                      <td>{p.owner}</td>
                      <td>{p.lastApproved}</td>
                      <td>{p.nextReview}</td>
                      <td><Badge tone={p.locked ? "amber" : "green"} dot>{p.locked ? "Locked" : p.status}</Badge></td>
                      <td className="text-end text-nowrap">
                        <div className="d-flex gap-1 justify-content-end">
                          <button className="btn btn-sm btn-outline-info" onClick={() => setPreviewPolicy(p)} title="Preview"><i className="bi bi-eye" /></button>
                          <AdminRowActions onEdit={() => setEditPolicy(p)} onLock={() => setLockPolicy(p)} onDelete={() => setDeletePolicy(p)} locked={p.locked} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ---- LICENSES TAB ---- */}
      {tab === "licenses" && (
        <section>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div><h3>Certifications & licences</h3><p>Regulatory authorisations and external assurance evidence.</p></div>
            <button className="btn btn-primary btn-sm" onClick={() => setAddLicense(true)}><i className="bi bi-plus-circle me-1" />Add certification</button>
          </div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Certification</th><th>Issuer</th><th>Valid until</th><th>Status</th><th>Renewal</th><th className="text-end">Actions</th></tr></thead>
                <tbody>
                  {licenses.map(l => (
                    <tr key={l.id}>
                      <td className="pm-td-strong">{l.name}{l.locked && <i className="bi bi-lock-fill ms-1" style={{ fontSize: ".6rem", color: "var(--pm-amber)" }} />}</td>
                      <td>{l.issuer}</td>
                      <td>{l.validUntil}</td>
                      <td><Badge tone={l.locked ? "amber" : "green"} dot>{l.locked ? "Locked" : l.status}</Badge></td>
                      <td>{l.renewal}</td>
                      <td className="text-end text-nowrap"><AdminRowActions onEdit={() => setEditLicense(l)} onLock={() => setLockLicense(l)} onDelete={() => setDeleteLicense(l)} locked={l.locked} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ---- FILINGS TAB ---- */}
      {tab === "filings" && (
        <section>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div><h3>Regulatory filing tracker</h3><p>Tax, CBK, FRA, BRS and ODPC obligations with owner and status.</p></div>
            <button className="btn btn-primary btn-sm" onClick={() => setAddFiling(true)}><i className="bi bi-plus-circle me-1" />Add filing</button>
          </div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Filing</th><th>Authority</th><th>Frequency</th><th>Due date</th><th>Status</th><th>Filed by</th><th className="text-end">Actions</th></tr></thead>
                <tbody>
                  {filings.map(f => (
                    <tr key={f.id}>
                      <td className="pm-td-strong">{f.name}{f.locked && <i className="bi bi-lock-fill ms-1" style={{ fontSize: ".6rem", color: "var(--pm-amber)" }} />}</td>
                      <td>{f.authority}</td>
                      <td>{f.frequency}</td>
                      <td>{f.dueDate}</td>
                      <td><Badge tone={f.status.includes("pending") ? "amber" : "green"} dot>{f.status}</Badge></td>
                      <td className="pm-td-sub">{f.filedBy}</td>
                      <td className="text-end text-nowrap"><AdminRowActions onEdit={() => setEditFiling(f)} onLock={() => setLockFiling(f)} onDelete={() => setDeleteFiling(f)} locked={f.locked} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ---- TRAINING TAB ---- */}
      {tab === "training" && (
        <section>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div><h3>Compliance training records</h3><p>Mandatory course completion and certification evidence.</p></div>
            <button className="btn btn-primary btn-sm" onClick={() => setAddTraining(true)}><i className="bi bi-plus-circle me-1" />Add course</button>
          </div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Course</th><th>Required for</th><th>Completion</th><th>Due date</th><th>Provider</th><th className="text-end">Actions</th></tr></thead>
                <tbody>
                  {training.map(t => (
                    <tr key={t.id}>
                      <td className="pm-td-strong">{t.course}{t.locked && <i className="bi bi-lock-fill ms-1" style={{ fontSize: ".6rem", color: "var(--pm-amber)" }} />}</td>
                      <td>{t.requiredFor}</td>
                      <td><Badge tone={t.completion.startsWith("89") ? "amber" : "green"}>{t.completion}</Badge></td>
                      <td>{t.dueDate}</td>
                      <td>{t.provider}</td>
                      <td className="text-end text-nowrap"><AdminRowActions onEdit={() => setEditTraining(t)} onLock={() => setLockTraining(t)} onDelete={() => setDeleteTraining(t)} locked={t.locked} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ---- EXAMS TAB ---- */}
      {tab === "exams" && (
        <section>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div><h3>Regulatory examination history</h3><p>External examinations, findings, ratings and remediation closure.</p></div>
            <button className="btn btn-primary btn-sm" onClick={() => setAddExam(true)}><i className="bi bi-plus-circle me-1" />Add examination</button>
          </div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Exam</th><th>Authority</th><th>Date</th><th>Scope</th><th>Findings</th><th>Rating</th><th className="text-end">Actions</th></tr></thead>
                <tbody>
                  {exams.map(e => (
                    <tr key={e.id}>
                      <td className="pm-td-strong">{e.name}{e.locked && <i className="bi bi-lock-fill ms-1" style={{ fontSize: ".6rem", color: "var(--pm-amber)" }} />}</td>
                      <td>{e.authority}</td>
                      <td>{e.date}</td>
                      <td style={{ fontSize: ".82rem" }}>{e.scope}</td>
                      <td className="pm-td-sub">{e.findings}</td>
                      <td><Badge tone={e.rating.includes("Satisfactory") ? "blue" : "green"}>{e.rating}</Badge></td>
                      <td className="text-end text-nowrap"><AdminRowActions onEdit={() => setEditExam(e)} onLock={() => setLockExam(e)} onDelete={() => setDeleteExam(e)} locked={e.locked} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ---- ALL MODALS ---- */}
      {action && (
        <Modal open={!!action} onClose={() => setAction(null)} title={action.title} subtitle="Super Admin action · evidence and approvals are audited" icon={action.icon} tone={action.tone}>
          <div className="pm-modal-body">{action.body}</div>
          <div className="pm-modal-foot">
            <button className="btn btn-outline-secondary" onClick={() => setAction(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={() => { setAction(null); push({ kind: "success", title: "Compliance workspace updated", body: "The action was added to the compliance audit trail." }); }}>Confirm action</button>
          </div>
        </Modal>
      )}

      {wizard && (
        <Modal open={wizard} onClose={() => setWizard(false)} title="Upload compliance evidence" subtitle={`Step ${wizardStep + 1} of 4: ${["Document", "Metadata", "Review", "Publish"][wizardStep]}`} icon="bi-file-earmark-arrow-up" tone="blue" size="lg">
          <Steps current={wizardStep} steps={[{ label: "Document", icon: "bi-file-text" }, { label: "Metadata", icon: "bi-tags" }, { label: "Review", icon: "bi-people" }, { label: "Publish", icon: "bi-check2" }]} />
          <div className="pm-wizard-progress"><span style={{ width: `${(wizardStep + 1) * 25}%` }} /></div>
          <div className="pm-modal-body">
            <div className="row g-3">
              <div className="col-12"><label className="form-label">Document name</label><input className="form-control" placeholder="e.g. AML Policy v5.0" /></div>
              <div className="col-md-6"><label className="form-label">Category</label><select className="form-select"><option>Policy</option><option>Certification</option><option>Filing evidence</option><option>Training record</option></select></div>
              <div className="col-md-6"><label className="form-label">Owner</label><select className="form-select"><option>MLRO</option><option>DPO</option><option>CISO</option><option>Legal</option></select></div>
            </div>
          </div>
          <div className="pm-modal-foot">
            <button className="btn btn-outline-secondary" onClick={() => wizardStep ? setWizardStep(wizardStep - 1) : setWizard(false)}>{wizardStep ? "Back" : "Cancel"}</button>
            {wizardStep < 3 ? <button className="btn btn-primary" onClick={() => setWizardStep(wizardStep + 1)}>Continue</button> : <button className="btn btn-primary" onClick={() => { setWizard(false); setWizardStep(0); push({ kind: "success", title: "Evidence submitted" }); }}>Submit for review</button>}
          </div>
        </Modal>
      )}

      {/* Policy CRUD */}
      <AddRecordModal open={addPolicy} onClose={() => setAddPolicy(false)} onAdd={(d) => { setPolicies(p => [{ id: `p-${Date.now()}`, ...d, lastApproved: "Never", status: "Draft", locked: false } as PolicyRecord, ...p]); }} title="Policy" fields={policyFields} typeName="Policy" />
      <EditRecordModal record={editPolicy} open={!!editPolicy} onClose={() => setEditPolicy(null)} onSave={(d) => { setPolicies(p => p.map(x => x.id === d.id ? d as PolicyRecord : x)); }} typeName="Policy" />
      <DeleteRecordWizard record={deletePolicy} open={!!deletePolicy} onClose={() => setDeletePolicy(null)} onDelete={() => { if (deletePolicy) setPolicies(p => p.filter(x => x.id !== deletePolicy.id)); }} typeName="Policy" relatedItems={["Training records", "Audit trail entries", "Filing dependencies"]} />
      <LockUnlockModal record={lockPolicy} open={!!lockPolicy} onClose={() => setLockPolicy(null)} onToggle={(locked) => { if (lockPolicy) toggleLock(policies, setPolicies, lockPolicy.id, locked); }} typeName="Policy" />
      <DocumentPreviewModal title={previewPolicy?.name || ""} content={previewPolicy?.body || ""} open={!!previewPolicy} onClose={() => setPreviewPolicy(null)} version={previewPolicy?.version} status={previewPolicy?.status} />

      {/* License CRUD */}
      <AddRecordModal open={addLicense} onClose={() => setAddLicense(false)} onAdd={(d) => { setLicenses(p => [{ id: `l-${Date.now()}`, ...d, status: "Active", locked: false } as LicenseRecord, ...p]); }} title="Certification" fields={licenseFields} typeName="Certification" />
      <EditRecordModal record={editLicense} open={!!editLicense} onClose={() => setEditLicense(null)} onSave={(d) => { setLicenses(p => p.map(x => x.id === d.id ? d as LicenseRecord : x)); }} typeName="Certification" />
      <DeleteRecordWizard record={deleteLicense} open={!!deleteLicense} onClose={() => setDeleteLicense(null)} onDelete={() => { if (deleteLicense) setLicenses(p => p.filter(x => x.id !== deleteLicense.id)); }} typeName="Certification" relatedItems={["Renewal tasks", "Audit evidence"]} />
      <LockUnlockModal record={lockLicense} open={!!lockLicense} onClose={() => setLockLicense(null)} onToggle={(locked) => { if (lockLicense) toggleLock(licenses, setLicenses, lockLicense.id, locked); }} typeName="Certification" />

      {/* Filing CRUD */}
      <AddRecordModal open={addFiling} onClose={() => setAddFiling(false)} onAdd={(d) => { setFilings(p => [{ id: `f-${Date.now()}`, ...d, status: "Pending", locked: false } as FilingRecord, ...p]); }} title="Filing" fields={filingFields} typeName="Filing" />
      <EditRecordModal record={editFiling} open={!!editFiling} onClose={() => setEditFiling(null)} onSave={(d) => { setFilings(p => p.map(x => x.id === d.id ? d as FilingRecord : x)); }} typeName="Filing" />
      <DeleteRecordWizard record={deleteFiling} open={!!deleteFiling} onClose={() => setDeleteFiling(null)} onDelete={() => { if (deleteFiling) setFilings(p => p.filter(x => x.id !== deleteFiling.id)); }} typeName="Filing" relatedItems={["Filing history", "Authority submissions"]} />
      <LockUnlockModal record={lockFiling} open={!!lockFiling} onClose={() => setLockFiling(null)} onToggle={(locked) => { if (lockFiling) toggleLock(filings, setFilings, lockFiling.id, locked); }} typeName="Filing" />

      {/* Training CRUD */}
      <AddRecordModal open={addTraining} onClose={() => setAddTraining(false)} onAdd={(d) => { setTraining(p => [{ id: `t-${Date.now()}`, ...d, completion: "0%", locked: false } as TrainingRecord, ...p]); }} title="Course" fields={trainingFields} typeName="Training Course" />
      <EditRecordModal record={editTraining} open={!!editTraining} onClose={() => setEditTraining(null)} onSave={(d) => { setTraining(p => p.map(x => x.id === d.id ? d as TrainingRecord : x)); }} typeName="Training Course" />
      <DeleteRecordWizard record={deleteTraining} open={!!deleteTraining} onClose={() => setDeleteTraining(null)} onDelete={() => { if (deleteTraining) setTraining(p => p.filter(x => x.id !== deleteTraining.id)); }} typeName="Training Course" relatedItems={["Staff completion records", "Certificate evidence"]} />
      <LockUnlockModal record={lockTraining} open={!!lockTraining} onClose={() => setLockTraining(null)} onToggle={(locked) => { if (lockTraining) toggleLock(training, setTraining, lockTraining.id, locked); }} typeName="Training Course" />

      {/* Exam CRUD */}
      <AddRecordModal open={addExam} onClose={() => setAddExam(false)} onAdd={(d) => { setExams(p => [{ id: `e-${Date.now()}`, ...d, locked: false } as ExamRecord, ...p]); }} title="Examination" fields={examFields} typeName="Examination" />
      <EditRecordModal record={editExam} open={!!editExam} onClose={() => setEditExam(null)} onSave={(d) => { setExams(p => p.map(x => x.id === d.id ? d as ExamRecord : x)); }} typeName="Examination" />
      <DeleteRecordWizard record={deleteExam} open={!!deleteExam} onClose={() => setDeleteExam(null)} onDelete={() => { if (deleteExam) setExams(p => p.filter(x => x.id !== deleteExam.id)); }} typeName="Examination" relatedItems={["Findings", "Remediation evidence"]} />
      <LockUnlockModal record={lockExam} open={!!lockExam} onClose={() => setLockExam(null)} onToggle={(locked) => { if (lockExam) toggleLock(exams, setExams, lockExam.id, locked); }} typeName="Examination" />

      {/* Calendar Drawer */}
      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Compliance calendar" subtitle="Upcoming filings, reviews, renewals and committee obligations" icon="bi-calendar-check" wide>
        <div className="pm-card pm-card-pad mb-3"><Badge tone="amber" dot>3 items need attention</Badge><h5 className="mt-3">September 2026</h5><p className="small text-muted">Corporate tax, CBK monthly returns, AML/CFT report and Card Terms review.</p></div>
        <div className="pm-card pm-card-pad">
          {[["Corporate tax Q2", "Sep 30", "Tax team"], ["CBK monthly returns", "Sep 30", "Finance"], ["AML/CFT report Q3", "Sep 30", "MLRO"], ["Card Terms review", "Aug 2026", "Legal"], ["PCI DSS renewal prep", "Nov 2026", "Security"]].map(x => (
            <div className="config-row" key={x[0]}><span className="pm-td-sub">{x[0]}</span><b>{x[1]} · {x[2]}</b></div>
          ))}
        </div>
      </Drawer>
    </div>
  );
}
