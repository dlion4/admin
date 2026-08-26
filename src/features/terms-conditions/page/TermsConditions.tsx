import { useState, useMemo, useCallback } from "react";
import { Badge, Drawer, Modal, Steps, useToast } from "../../../components/ui";
import { AdminRowActions, AddRecordModal, EditRecordModal, DeleteRecordWizard, LockUnlockModal, DocumentPreviewModal } from "../../../components/AdminControls";

interface LegalDoc { id: string; name: string; version: string; effectiveDate: string; status: string; language: string; lastReviewed: string; locked: boolean; lockedBy?: string; lockedAt?: string; lockReason?: string; description: string; body: string; }

const initDocs: LegalDoc[] = [
  { id: "ld-001", name: "Terms of Service", version: "v4.2", effectiveDate: "Aug 1, 2026", status: "Active", language: "EN + SW", lastReviewed: "Jul 2026", locked: false, description: "Platform terms governing user access and services", body: "Terms of Service v4.2\n\nWelcome to PayMo Digital Bank Ltd. These Terms of Service govern your use of the PayMo platform.\n\n1. Definitions\n\"PayMo\" means PayMo Digital Bank Ltd, registered in Kenya.\n\"User\" means any individual or entity using the platform.\n\n2. Account Responsibilities\nUsers are responsible for maintaining the confidentiality of their account credentials.\n\n3. Fees and Disclosures\n3.1 PayMo charges a tiered fee: 1.75% for amounts below KES 10,000 and 2.0% for amounts above KES 10,000.\n\n4. Privacy and Data Processing\nUser data is processed in accordance with our Privacy Policy.\n\n5. Dispute Resolution\nDisputes must be raised within 30 days of the transaction.\n\nEffective: {{date}}\n{{company_name}}" },
  { id: "ld-002", name: "Privacy Policy", version: "v3.1", effectiveDate: "Aug 1, 2026", status: "Active", language: "EN + SW", lastReviewed: "Jul 2026", locked: false, description: "Data privacy and processing notice", body: "Privacy Policy v3.1\n\n1. Data Controller\nPayMo Digital Bank Ltd is the data controller for all personal data.\n\n2. Data We Collect\nWe collect name, identification, contact details, transaction data and device information.\n\n3. Legal Basis\nProcessing is based on contract, legal obligation, legitimate interest or consent.\n\n4. Data Retention\nAccount data: Lifetime + 7 years. Transaction data: 7 years.\n\n5. Your Rights\nAccess, rectification, erasure, portability and objection rights under the Data Protection Act.\n\n{{company_name}}" },
  { id: "ld-003", name: "Cookie Policy", version: "v2.0", effectiveDate: "Aug 1, 2026", status: "Active", language: "EN", lastReviewed: "Jul 2026", locked: false, description: "Website cookie usage and consent", body: "Cookie Policy v2.0\n\n1. What Are Cookies\nCookies are small text files stored on your device.\n\n2. Essential Cookies\nRequired for platform functionality and security.\n\n3. Analytics Cookies\nHelp us understand how users interact with the platform.\n\n4. Marketing Cookies\nUsed for targeted advertising with your consent.\n\n5. Managing Cookies\nYou can manage cookie preferences in your browser settings." },
  { id: "ld-004", name: "Electronic Banking Terms", version: "v2.5", effectiveDate: "Jun 1, 2026", status: "Active", language: "EN", lastReviewed: "May 2026", locked: false, description: "Electronic banking service terms", body: "Electronic Banking Terms v2.5\n\n1. Service Description\nElectronic banking includes mobile app, web and USSD channels.\n\n2. Transaction Limits\nDaily limits apply per tier as disclosed in the fee schedule.\n\n3. Security\nUsers must not share OTPs or PINs with anyone." },
  { id: "ld-005", name: "Loan Terms & Conditions", version: "v3.0", effectiveDate: "Jun 1, 2026", status: "Active", language: "EN + SW", lastReviewed: "May 2026", locked: false, description: "Consumer lending terms and conditions", body: "Loan Terms & Conditions v3.0\n\n1. Eligibility\nMinimum age 18, valid ID, active PayMo account.\n\n2. Interest Calculation\nSimple interest calculated daily on reducing balance.\n\n3. Default Penalties\nLate payment fee of 5% after 7-day grace period.\n\n4. Repayment\nAuto-deduction from PayMo balance on due date." },
  { id: "ld-006", name: "Savings Account Terms", version: "v2.0", effectiveDate: "Jan 1, 2026", status: "Active", language: "EN + SW", lastReviewed: "Dec 2025", locked: false, description: "Savings account terms and interest", body: "Savings Account Terms v2.0\n\n1. Account Type\nRegular savings with competitive interest rates.\n\n2. Interest\nInterest calculated daily, credited monthly.\n\n3. Withdrawals\nMinimum KES 100. No limit on frequency." },
  { id: "ld-007", name: "Card Terms", version: "v2.2", effectiveDate: "Mar 1, 2026", status: "Active", language: "EN", lastReviewed: "Feb 2026", locked: false, description: "Virtual and physical card terms", body: "Card Terms v2.2\n\n1. Card Types\nVirtual card (free) and physical card (KES 500).\n\n2. Transaction Fees\nDomestic: 1.5%. International: 2.5% + forex.\n\n3. Security\nCard can be frozen instantly via app." },
  { id: "ld-008", name: "Business Account Terms", version: "v1.5", effectiveDate: "May 1, 2026", status: "Active", language: "EN", lastReviewed: "Apr 2026", locked: false, description: "Business account terms and conditions", body: "Business Account Terms v1.5\n\n1. Eligibility\nRegistered business with CR12.\n\n2. Features\nMulti-user access, bulk payments, API integration.\n\n3. Fees\nCustom fee schedule based on volume." },
  { id: "ld-009", name: "Partner Agreement Template", version: "v1.3", effectiveDate: "Jul 1, 2026", status: "Active", language: "EN", lastReviewed: "Jun 2026", locked: false, description: "Standard partner agreement template", body: "PARTNER AGREEMENT\n\nBetween PayMo Digital Bank Ltd and {{partner_name}}\n\n1. Scope\n2. Revenue Share\n3. Data Processing\n4. Term and Termination\n\n{{signatory_name}}" },
  { id: "ld-010", name: "API Terms of Service", version: "v1.2", effectiveDate: "Apr 1, 2026", status: "Active", language: "EN", lastReviewed: "Mar 2026", locked: false, description: "API integration terms", body: "API Terms of Service v1.2\n\n1. API Access\nRate limited to 1000 requests per minute.\n\n2. Data Usage\nAPI data may not be stored beyond 24 hours.\n\n3. Liability\nPayMo not liable for integration failures." },
];

const docFields = [
  { key: "name", label: "Document Name", placeholder: "e.g. Terms of Service v4.3" },
  { key: "version", label: "Version", placeholder: "e.g. v4.3" },
  { key: "language", label: "Language", options: ["EN", "EN + SW", "Swahili"] },
  { key: "effectiveDate", label: "Effective Date", placeholder: "e.g. Sep 1, 2026" },
  { key: "description", label: "Description", placeholder: "Brief description", type: "textarea" },
  { key: "body", label: "Document Content", placeholder: "Full document content...", type: "textarea" },
];

export function TermsConditions({ signal: _signal }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  const { push } = useToast();
  const [tab, setTab] = useState("library");
  const [q, setQ] = useState("");
  const [docs, setDocs] = useState(initDocs);
  const [drawer, setDrawer] = useState(false);
  const [wizard, setWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [action, setAction] = useState<{ title: string; body: React.ReactNode; icon?: string; tone?: "green" | "red" | "amber" | "blue" | "violet" | "ink" } | null>(null);

  const [addDoc, setAddDoc] = useState(false);
  const [editDoc, setEditDoc] = useState<LegalDoc | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<LegalDoc | null>(null);
  const [lockDoc, setLockDoc] = useState<LegalDoc | null>(null);
  const [previewDoc, setPreviewDoc] = useState<LegalDoc | null>(null);

  const filtered = useMemo(() => docs.filter(r => [r.name, r.language, r.version, r.status].join(" ").toLowerCase().includes(q.toLowerCase())), [q, docs]);
  const toggleLock = useCallback((id: string, locked: boolean) => { setDocs(p => p.map(x => x.id === id ? { ...x, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Manual lock" : undefined } : x)); }, []);

  return (
    <div className="pm-page-content legal-page">
      <div className="pm-section-head" style={{ marginTop: 0 }}>
        <div>
          <div className="pm-eyebrow">DOCUMENTS & LEGAL / PAGE 38</div>
          <h2 className="mb-1">Terms & Conditions</h2>
          <p>Manage legal documents, versions, approvals, publishing and user acceptance across PayMo.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setDrawer(true)}><i className="bi bi-shield-check me-1" />Enforcement rules</button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => setWizard(true)}><i className="bi bi-file-earmark-plus me-1" />New document</button>
          <button className="btn btn-primary btn-sm" onClick={() => setAddDoc(true)}><i className="bi bi-plus-circle me-1" />Add document</button>
        </div>
      </div>

      <div className="pm-hero legal-hero mb-3">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <div className="pm-eyebrow text-white-50">LEGAL DOCUMENTS · CONTROLLED PUBLISHING</div>
            <div className="pm-hero-value">{docs.length} <span className="fs-6 fw-normal text-white-50">active documents</span></div>
            <div className="small text-white-50 mt-2">96.0% acceptance on current Terms · English + Swahili coverage · 4 regulatory updates tracked</div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <div className="pm-hero-chip"><div className="l">Users tracked</div><div className="v">148K</div></div>
            <div className="pm-hero-chip"><div className="l">Pending acceptance</div><div className="v text-warning">5,936</div></div>
            <div className="pm-hero-chip"><div className="l">Reviews due</div><div className="v">6</div></div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-3">
        {[["Active documents", String(docs.length), "Version-controlled", "bi-files", "green"], ["Acceptance rate", "96.0%", "Terms of Service v4.2", "bi-check2-circle", "blue"], ["Pending re-consent", "8,158", "Privacy Policy v3.1", "bi-person-check", "violet"], ["Regulatory updates", "4", "2 in progress", "bi-calendar-check", "amber"]].map(x => (
          <div className="col-6 col-xl-3" key={x[0]}><div className="pm-stat"><div className={`pm-stat-ico bg-${x[4]}-soft text-${x[4]}`}><i className={`bi ${x[3]}`} /></div><div className="pm-stat-label">{x[0]}</div><div className="pm-stat-value">{x[1]}</div><div className="pm-stat-foot">{x[2]}</div></div></div>
        ))}
      </div>

      <div className="pm-card mb-3">
        <div className="pm-tabs">
          {[["library", "Document library", "bi-files"], ["editor", "Document editor", "bi-pencil-square"], ["acceptance", "User acceptance", "bi-person-check"], ["regulatory", "Regulatory tracker", "bi-calendar2-week"], ["calendar", "Review calendar", "bi-calendar-check"]].map(x => (
            <button className={`pm-tab ${tab === x[0] ? "active" : ""}`} key={x[0]} onClick={() => setTab(x[0])}><i className={`bi ${x[2]}`} />{x[1]}</button>
          ))}
        </div>
      </div>

      {tab === "library" && (
        <section>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div><h3>Document library</h3><p>Active legal documents with language, version and review status.</p></div>
            <div className="pm-search"><i className="bi bi-search" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search document or language" /></div>
          </div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Document</th><th>Version</th><th>Effective</th><th>Status</th><th>Language</th><th>Reviewed</th><th className="text-end">Actions</th></tr></thead>
                <tbody>
                  {filtered.map(d => (
                    <tr key={d.id}>
                      <td className="pm-td-strong">{d.name}{d.locked && <i className="bi bi-lock-fill ms-1" style={{ fontSize: ".6rem", color: "var(--pm-amber)" }} />}</td>
                      <td className="mono">{d.version}</td>
                      <td>{d.effectiveDate}</td>
                      <td><Badge tone={d.locked ? "amber" : "green"} dot>{d.locked ? "Locked" : d.status}</Badge></td>
                      <td>{d.language}</td>
                      <td className="pm-td-sub">{d.lastReviewed}</td>
                      <td className="text-end text-nowrap">
                        <div className="d-flex gap-1 justify-content-end">
                          <button className="btn btn-sm btn-outline-info" onClick={() => setPreviewDoc(d)} title="Preview"><i className="bi bi-eye" /></button>
                          <AdminRowActions onEdit={() => setEditDoc(d)} onLock={() => setLockDoc(d)} onDelete={() => setDeleteDoc(d)} locked={d.locked} />
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

      {tab === "editor" && (
        <section>
          <div className="pm-section-head"><div><h3>Document editor</h3><p>Create a legal draft with variables, bilingual content and review gates.</p></div><button className="btn btn-outline-secondary btn-sm" onClick={() => setWizard(true)}><i className="bi bi-file-earmark-plus me-1" />New draft</button></div>
          <div className="pm-card pm-card-pad">
            <div className="row g-3">
              <div className="col-md-7"><label className="form-label">Document title</label><input className="form-control" defaultValue="Terms of Service" /></div>
              <div className="col-md-5"><label className="form-label">Language version</label><select className="form-select"><option>English + Swahili</option><option>English</option><option>Swahili</option></select></div>
              <div className="col-12"><label className="form-label">Draft content</label><textarea className="form-control legal-editor" rows={10} defaultValue={"Welcome to PayMo. These Terms of Service govern your use of the PayMo platform.\n\n1. Definitions\n2. Account responsibilities\n3. Fees and disclosures\n4. Privacy and data processing\n5. Dispute resolution\n\nVariables: {{company_name}}, {{date}}, {{app_name}}"} /></div>
            </div>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <button className="btn btn-outline-secondary" onClick={() => setPreviewDoc(docs[0])}><i className="bi bi-eye me-1" />Preview</button>
              <button className="btn btn-primary" onClick={() => push({ kind: "success", title: "Draft saved" })}><i className="bi bi-check2 me-1" />Save draft</button>
              <button className="btn btn-outline-primary" onClick={() => push({ kind: "success", title: "Submitted for review" })}><i className="bi bi-send me-1" />Submit for review</button>
            </div>
          </div>
        </section>
      )}

      {tab === "acceptance" && (
        <section>
          <div className="pm-section-head"><div><h3>User acceptance tracking</h3><p>Acceptance, pending re-consent and enforcement posture by document.</p></div><button className="btn btn-outline-secondary btn-sm" onClick={() => push({ kind: "success", title: "Re-consent reminders sent" })}><i className="bi bi-send me-1" />Send reminders</button></div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Document</th><th>Total users</th><th>Accepted</th><th>Pending</th><th>Rate</th></tr></thead>
                <tbody>
                  {[["Terms of Service v4.2", "148,392", "142,456", "5,936", "96.0%"], ["Privacy Policy v3.1", "148,392", "140,234", "8,158", "94.5%"], ["Loan Terms v3.0", "23,400", "22,890", "510", "97.8%"], ["Card Terms v2.2", "94,310", "91,234", "3,076", "96.7%"]].map(r => (
                    <tr key={r[0]}><td className="pm-td-strong">{r[0]}</td><td className="pm-num">{r[1]}</td><td className="pm-num">{r[2]}</td><td className="pm-num">{r[3]}</td><td><Badge tone={r[4].startsWith("94") ? "amber" : "green"}>{r[4]}</Badge></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {tab === "regulatory" && (
        <section>
          <div className="pm-section-head"><div><h3>Regulatory update tracker</h3><p>Legal impact, affected documents, deadlines and progress.</p></div></div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Regulation</th><th>Impact</th><th>Affected documents</th><th>Deadline</th><th>Status</th></tr></thead>
                <tbody>
                  {[["Data Protection Act amendments", "Expanded user rights", "Privacy Policy, Terms", "Oct 2026", "In progress"], ["CBK Digital Lending Guidelines", "Loan disclosure", "Loan Terms", "Sep 2026", "In progress"], ["Finance Act 2026", "Tax changes", "Terms of Service", "Jan 2027", "Planned"], ["ODPC Guidance on AI", "Risk disclosure", "Privacy Policy, Terms", "Nov 2026", "Planned"]].map(r => (
                    <tr key={r[0]}><td className="pm-td-strong">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td><Badge tone={r[4] === "In progress" ? "amber" : "blue"}>{r[4]}</Badge></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {tab === "calendar" && (
        <section>
          <div className="pm-section-head"><div><h3>Legal review calendar</h3><p>Review frequency, last review, next deadline and assigned counsel.</p></div></div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Document</th><th>Frequency</th><th>Last reviewed</th><th>Next review</th><th>Reviewer</th></tr></thead>
                <tbody>
                  {[["Terms of Service", "Quarterly", "Jul 2026", "Oct 2026", "Legal Counsel"], ["Privacy Policy", "Quarterly", "Jul 2026", "Oct 2026", "Legal Counsel"], ["Loan Terms", "Semi-annual", "May 2026", "Nov 2026", "Legal Counsel"], ["Card Terms", "Semi-annual", "Feb 2026", "Aug 2026", "Legal Counsel"], ["Business Terms", "Quarterly", "Apr 2026", "Jul 2026", "Legal Counsel"], ["API Terms", "Quarterly", "Mar 2026", "Jun 2026", "Legal Counsel"]].map(r => (
                    <tr key={r[0]}><td className="pm-td-strong">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td>{r[4]}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ALL MODALS */}
      {action && <Modal open onClose={() => setAction(null)} title={action.title} subtitle="Super Admin action · legal changes are versioned and audited" icon={action.icon} tone={action.tone}><div className="pm-modal-body">{action.body}</div><div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={() => setAction(null)}>Cancel</button><button className="btn btn-primary" onClick={() => { setAction(null); push({ kind: "success", title: "Legal workspace updated" }); }}>Confirm action</button></div></Modal>}

      {wizard && <Modal open onClose={() => setWizard(false)} title="Create legal document" subtitle={`Step ${wizardStep + 1} of 4: ${["Identity", "Content", "Review", "Publish"][wizardStep]}`} icon="bi-file-earmark-plus" tone="blue" size="lg">
        <Steps current={wizardStep} steps={[{ label: "Identity", icon: "bi-file-text" }, { label: "Content", icon: "bi-pencil" }, { label: "Review", icon: "bi-people" }, { label: "Publish", icon: "bi-cloud-upload" }]} />
        <div className="pm-wizard-progress"><span style={{ width: `${(wizardStep + 1) * 25}%` }} /></div>
        <div className="pm-modal-body"><div className="row g-3"><div className="col-md-7"><label className="form-label">Document name</label><input className="form-control" defaultValue="Terms of Service" /></div><div className="col-md-5"><label className="form-label">Version</label><input className="form-control" defaultValue="v4.3" /></div><div className="col-12"><label className="form-label">Change summary</label><textarea className="form-control" rows={3} defaultValue="Updated fee disclosure and added new product terms." /></div></div></div>
        <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={() => wizardStep ? setWizardStep(wizardStep - 1) : setWizard(false)}>{wizardStep ? "Back" : "Cancel"}</button>{wizardStep < 3 ? <button className="btn btn-primary" onClick={() => setWizardStep(wizardStep + 1)}>Continue</button> : <button className="btn btn-primary" onClick={() => { setWizard(false); setWizardStep(0); push({ kind: "success", title: "Document submitted" }); }}>Submit for approval</button>}</div>
      </Modal>}

      <AddRecordModal open={addDoc} onClose={() => setAddDoc(false)} onAdd={(d) => { setDocs(p => [{ id: `ld-${Date.now()}`, ...d, status: "Draft", lastReviewed: "Never", locked: false } as LegalDoc, ...p]); }} title="Legal Document" fields={docFields} typeName="Document" />
      <EditRecordModal record={editDoc} open={!!editDoc} onClose={() => setEditDoc(null)} onSave={(d) => { setDocs(p => p.map(x => x.id === d.id ? d as LegalDoc : x)); }} typeName="Document" />
      <DeleteRecordWizard record={deleteDoc} open={!!deleteDoc} onClose={() => setDeleteDoc(null)} onDelete={() => { if (deleteDoc) setDocs(p => p.filter(x => x.id !== deleteDoc.id)); }} typeName="Document" relatedItems={["Version history", "Acceptance records", "Re-consent queues"]} />
      <LockUnlockModal record={lockDoc} open={!!lockDoc} onClose={() => setLockDoc(null)} onToggle={(locked) => { if (lockDoc) toggleLock(lockDoc.id, locked); }} typeName="Document" />
      <DocumentPreviewModal title={previewDoc?.name || ""} content={previewDoc?.body || ""} open={!!previewDoc} onClose={() => setPreviewDoc(null)} version={previewDoc?.version} status={previewDoc?.status} />

      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Acceptance enforcement" subtitle="Rules that protect legal consent and re-consent" icon="bi-shield-check" wide>
        <div className="pm-card pm-card-pad mb-3"><Badge tone="green" dot>Enforced</Badge><h5 className="mt-3">Acceptance controls active</h5><p className="small text-muted">Acceptance records are retained for 7 years with timestamp, IP, device and accepted version.</p></div>
        <div className="pm-card pm-card-pad">
          {[["Accept before first transaction", "Required"], ["Re-accept major version", "Required · x.0"], ["Re-accept minor version", "Not required"], ["Unaccepted access", "Read-only until accepted"], ["Acceptance method", "Checkbox + I Agree"], ["Record retention", "7 years"]].map(x => (<div className="config-row" key={x[0]}><span className="pm-td-sub">{x[0]}</span><b>{x[1]}</b></div>))}
        </div>
      </Drawer>
    </div>
  );
}
