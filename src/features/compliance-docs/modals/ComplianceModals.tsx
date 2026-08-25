import { useState } from "react";
import { Badge, Modal, Drawer, Steps, useToast } from "../../../components/ui";

/* ============================ 1. Policy Detail Drawer ============================ */
export function PolicyDetailDrawer({ policy, onClose }: { policy: string | null; onClose: () => void }) {
  if (!policy) return null;
  return (
    <Drawer open onClose={onClose} title={`${policy} — Policy Detail`} subtitle="Version history, ownership and compliance status" icon="bi-file-earmark-check" wide>
      <div className="pm-card pm-card-pad mb-3">
        <div className="d-flex justify-content-between"><h5>{policy}</h5><Badge tone="green" dot>Active</Badge></div>
        <div className="row g-3 mt-2">{[["Version", "v4.2"], ["Owner", "MLRO"], ["Last approved", "Jul 2026"], ["Next review", "Jan 2027"]].map(x => <div className="col-md-3" key={x[0]}><div className="pm-eyebrow">{x[0]}</div><b className="small">{x[1]}</b></div>)}</div>
      </div>
      <div className="pm-card pm-card-pad mb-3"><h6>Approval chain</h6>
        {[["1. Draft created", "Jul 1, 2026"], ["2. MLRO review", "Jul 5, 2026"], ["3. Legal Counsel review", "Jul 8, 2026"], ["4. Board approval", "Jul 15, 2026"], ["5. Published", "Jul 16, 2026"]].map(a => <div className="d-flex justify-content-between py-1 border-bottom small" key={a[0]}><span>{a[0]}</span><span className="text-muted">{a[1]}</span></div>)}
      </div>
      <div className="pm-card pm-card-pad"><h6>Staff training</h6>
        {[["Required for", "All staff"], ["Completion", "94% (52/55)"], ["Last training", "Aug 2026"], ["Next training", "Feb 2027"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b>{x[1]}</b></div>)}
      </div>
    </Drawer>
  );
}

/* ============================ 2. Certification Detail Modal ============================ */
export function CertDetailModal({ open, cert, onClose }: { open: boolean; cert: string; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`${cert} — Certification Detail`} subtitle="Issuer, validity, scope and renewal timeline" icon="bi-patch-check" tone="green" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Issuer", "BSI"], ["Valid until", "Mar 2028"], ["Status", "Active"], ["Renewal due", "Feb 2028"]].map(x => <div className="col-md-3" key={x[0]}><label className="form-label">{x[0]}</label><input className="form-control" value={x[1]} readOnly /></div>)}</div>
        <h6>Certification scope</h6>
        {["Information Security Management System", "Risk assessment and treatment", "Access controls and encryption", "Incident management", "Business continuity"].map(s => <div className="d-flex gap-2 align-items-center py-1 border-bottom small" key={s}><i className="bi bi-check-circle-fill text-success" /><span>{s}</span></div>)}
        <h6 className="mt-3">Renewal timeline</h6>
        {[["Feb 2027", "Pre-audit documentation"], ["Mar 2027", "Surveillance audit"], ["Mar 2028", "Recertification audit"]].map(r => <div className="d-flex justify-content-between py-1 border-bottom small" key={r[0]}><span className="mono text-muted">{r[0]}</span><span>{r[1]}</span></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 3. Filing Detail Modal ============================ */
export function FilingDetailModal({ open, filing, onClose }: { open: boolean; filing: string; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`${filing} — Filing Detail`} subtitle="Regulatory filing status, evidence and submission" icon="bi-receipt" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Authority", "KRA"], ["Frequency", "Monthly"], ["Due date", "20th of following month"], ["Filed by", "Tax team"], ["Status", "Filed"]].map(x => <div className="col-md-3" key={x[0]}><label className="form-label">{x[0]}</label><input className="form-control" value={x[1]} readOnly /></div>)}</div>
        <h6>Filing history</h6>
        {[["Aug 2026", "Filed", "green", "Aug 20"], ["Jul 2026", "Filed", "green", "Jul 19"], ["Jun 2026", "Filed", "green", "Jun 18"], ["May 2026", "Filed", "green", "May 20"]].map(f => <div className="d-flex justify-content-between py-1 border-bottom small" key={f[0]}><span>{f[0]}</span><div><Badge tone={f[2] as any}>{f[1]}</Badge> <span className="text-muted">{f[3]}</span></div></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Filing evidence exported" }); onClose(); }}>Export evidence</button></div>
    </Modal>
  );
}

/* ============================ 4. Training Detail Modal ============================ */
export function TrainingDetailModal({ open, course, onClose }: { open: boolean; course: string; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`${course} — Training Detail`} subtitle="Course completion, certification and staff status" icon="bi-mortarboard" tone="violet" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Required for", "All staff"], ["Completion", "94%"], ["Provider", "Internal"], ["Due date", "Aug 2027"]].map(x => <div className="col-md-3" key={x[0]}><label className="form-label">{x[0]}</label><input className="form-control" value={x[1]} readOnly /></div>)}</div>
        <h6>Staff completion</h6>
        {[["Joseph M.", "Completed", "green", "Aug 15"], ["Sarah K.", "Completed", "green", "Aug 10"], ["James O.", "Completed", "green", "Aug 12"], ["David K.", "Incomplete", "amber", "Overdue"], ["Grace M.", "Incomplete", "amber", "Overdue"]].map(s => <div className="d-flex justify-content-between py-1 border-bottom small" key={s[0]}><span>{s[0]}</span><div><Badge tone={s[2] as any}>{s[1]}</Badge> <span className="text-muted">{s[3]}</span></div></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={onClose}>Send reminders</button></div>
    </Modal>
  );
}

/* ============================ 5. Examination Detail Modal ============================ */
export function ExamDetailModal({ open, exam, onClose }: { open: boolean; exam: string; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`${exam} — Examination Detail`} subtitle="Scope, findings, ratings and remediation status" icon="bi-clipboard-check" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Authority", "FRA"], ["Date", "Mar 2026"], ["Scope", "Full AML program"], ["Rating", "Satisfactory"], ["Findings", "2 minor"]].map(x => <div className="col-md-3" key={x[0]}><label className="form-label">{x[0]}</label><input className="form-control" value={x[1]} readOnly /></div>)}</div>
        <h6>Findings</h6>
        {[["F-01", "Minor", "SAR filing documentation incomplete", "Closed"], ["F-02", "Minor", "Training records missing for 2 staff", "Closed"]].map(f => <div className="d-flex justify-content-between py-1 border-bottom small" key={f[0]}><div><b>{f[0]}</b> — <Badge tone="amber">{f[1]}</Badge><div className="pm-td-sub">{f[2]}</div></div><Badge tone="green">{f[3]}</Badge></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={onClose}>Export evidence</button></div>
    </Modal>
  );
}

/* ============================ 6. Compliance Calendar Drawer ============================ */
export function ComplianceCalendarDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Drawer open onClose={onClose} title="Compliance Calendar" subtitle="Upcoming filings, reviews, renewals and obligations" icon="bi-calendar-check" wide>
      <div className="pm-card pm-card-pad mb-3"><Badge tone="amber" dot>3 items need attention</Badge>
        <h6 className="mt-3">September 2026</h6>
        {[["Corporate tax Q2", "Sep 30", "Tax team", "amber"], ["CBK monthly returns", "Sep 30", "Finance", "amber"], ["AML/CFT report Q3", "Sep 30", "MLRO", "amber"], ["Card Terms review", "Aug 2026", "Legal", "red"], ["PCI DSS renewal prep", "Nov 2026", "Security", "blue"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><div><b>{x[0]}</b><div className="pm-td-sub">{x[2]}</div></div><Badge tone={x[3] as any}>{x[1]}</Badge></div>)}
      </div>
    </Drawer>
  );
}

/* ============================ 7. Policy Upload Wizard ============================ */
export function PolicyUploadWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  if (!open) return null;
  return (
    <Modal open onClose={() => { setStep(0); onClose(); }} title="Upload Compliance Evidence" subtitle="Add a versioned document and route through review" icon="bi-file-earmark-arrow-up" tone="blue" size="lg">
      <Steps current={step} steps={[{ label: "Document", icon: "bi-file-text" }, { label: "Metadata", icon: "bi-tags" }, { label: "Review", icon: "bi-people" }, { label: "Publish", icon: "bi-check2" }]} />
      <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 25}%` }} /></div>
      <div className="pm-modal-body">
        {step === 0 && <div className="row g-3"><div className="col-12"><label className="form-label">Document name</label><input className="form-control" placeholder="e.g. AML Policy v5.0" /></div><div className="col-md-6"><label className="form-label">File type</label><select className="form-select"><option>PDF</option><option>Word</option><option>Excel</option></select></div><div className="col-md-6"><label className="form-label">Version</label><input className="form-control" placeholder="e.g. v5.0" /></div></div>}
        {step === 1 && <div className="row g-3"><div className="col-md-6"><label className="form-label">Category</label><select className="form-select"><option>Policy</option><option>Certification</option><option>Filing evidence</option><option>Training record</option></select></div><div className="col-md-6"><label className="form-label">Owner</label><select className="form-select"><option>MLRO</option><option>DPO</option><option>CISO</option><option>Legal</option></select></div><div className="col-12"><label className="form-label">Notes</label><textarea className="form-control" rows={2} placeholder="Describe the document..." /></div></div>}
        {step === 2 && <div><h6>Reviewer assignment</h6>{[["Compliance Lead", "Primary reviewer"], ["Legal Counsel", "Legal review"], ["Super Admin", "Final approval"]].map(r => <div className="d-flex justify-content-between py-1 border-bottom small" key={r[0]}><span>{r[0]}</span><span className="text-muted">{r[1]}</span></div>)}</div>}
        {step === 3 && <div className="text-center py-3"><Badge tone="green" dot>Ready for review</Badge><h6 className="mt-3">Document summary</h6><p className="small text-muted">The document will be routed through Compliance, Legal and Super Admin approval.</p></div>}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={() => step ? setStep(step - 1) : onClose()}>{step ? "Back" : "Cancel"}</button>{step < 3 ? <button className="btn btn-primary" onClick={() => setStep(step + 1)}>Continue</button> : <button className="btn btn-primary" onClick={() => { setStep(0); push({ kind: "success", title: "Evidence submitted" }); onClose(); }}>Submit for review</button>}</div>
    </Modal>
  );
}

/* ============================ 8. Compliance Pack Export Modal ============================ */
export function CompliancePackModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Export Compliance Pack" subtitle="Generate a signed evidence pack for Board and regulators" icon="bi-download" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Format</label><select className="form-select"><option>Signed PDF</option><option>ZIP archive</option><option>JSON (machine-readable)</option></select></div>
          <div className="col-md-6"><label className="form-label">Scope</label><select className="form-select"><option>All policies and certs</option><option>Policies only</option><option>Certifications only</option><option>Filing evidence only</option></select></div>
          <div className="col-12"><label className="form-label">Include</label>
            {["Active policies (12)", "Certifications (7)", "Filing evidence (8)", "Training records (8)", "Examination reports (6)"].map(i => <div className="form-check py-1" key={i}><input className="form-check-input" type="checkbox" id={`cp-${i}`} defaultChecked /><label className="form-check-label small" htmlFor={`cp-${i}`}>{i}</label></div>)}
          </div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Compliance pack queued" }); onClose(); }}>Generate pack</button></div>
    </Modal>
  );
}

/* ============================ 9. Filing Reminder Modal ============================ */
export function FilingReminderModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Send Filing Reminders" subtitle="Notify filing owners of upcoming deadlines" icon="bi-bell" tone="amber">
      <div className="pm-modal-body">
        <h6>Upcoming filings requiring reminders</h6>
        {[["Corporate tax Q2", "Sep 30", "Tax team", "15 days"], ["CBK monthly returns", "Sep 30", "Finance", "15 days"], ["AML/CFT report Q3", "Sep 30", "MLRO", "15 days"]].map(f => <div className="form-check py-1" key={f[0]}><input className="form-check-input" type="checkbox" id={`fr-${f[0]}`} defaultChecked /><label className="form-check-label small" htmlFor={`fr-${f[0]}`}><b>{f[0]}</b> — Due {f[1]} · {f[2]} · {f[3]} remaining</label></div>)}
        <div className="mt-3"><label className="form-label">Reminder channel</label><select className="form-select"><option>Email</option><option>Email + In-app</option></select></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Reminders sent" }); onClose(); }}>Send reminders</button></div>
    </Modal>
  );
}

/* ============================ 10. Compliance Drill Modal ============================ */
export function ComplianceDrillModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Run Compliance Drill" subtitle="Tabletop incident response exercise with Legal and Compliance" icon="bi-fire" tone="amber">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Drill type</label><select className="form-select"><option>Data breach response</option><option>AML escalation</option><option>Regulatory inquiry</option><option>System outage</option></select></div>
          <div className="col-md-6"><label className="form-label">Participants</label><input className="form-control" defaultValue="DPO, MLRO, Legal, Security Lead" /></div>
          <div className="col-md-6"><label className="form-label">Date</label><input className="form-control" type="date" defaultValue="2026-09-15" /></div>
          <div className="col-md-6"><label className="form-label">Duration</label><select className="form-select"><option>2 hours</option><option>4 hours (full day)</option></select></div>
          <div className="col-12"><label className="form-label">Scenario notes</label><textarea className="form-control" rows={2} defaultValue="Simulated breach of 10,000 customer records. Test ODPC notification within 72h." /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Drill scheduled" }); onClose(); }}>Schedule drill</button></div>
    </Modal>
  );
}

/* ============================ 11. Regulatory Impact Modal ============================ */
export function ComplianceRegImpactModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Regulatory Impact Assessment" subtitle="Analyze impact of upcoming regulations on compliance documents" icon="bi-calendar2-week" tone="violet" size="lg">
      <div className="pm-modal-body">
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Regulation</th><th>Impact</th><th>Affected docs</th><th>Deadline</th><th>Status</th></tr></thead><tbody>
          {[["Data Protection Act amendments", "Expanded user rights", "Privacy, Terms", "Oct 2026", "In progress"], ["CBK Digital Lending Guidelines", "Loan disclosure", "Loan Terms", "Sep 2026", "In progress"], ["Finance Act 2026", "Tax changes", "Terms of Service", "Jan 2027", "Planned"], ["ODPC Guidance on AI", "Risk disclosure", "Privacy, Terms", "Nov 2026", "Planned"]].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 0 ? "pm-td-strong" : ""}>{i === 4 ? <Badge tone={c === "In progress" ? "amber" : "blue"}>{c}</Badge> : c}</td>)}</tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Impact report exported" }); onClose(); }}>Export report</button></div>
    </Modal>
  );
}

/* ============================ 12. Incident Register Modal ============================ */
export function IncidentRegisterModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Compliance Incident Register" subtitle="No incidents reported in 2026. Response controls ready." icon="bi-shield-exclamation" tone="green" size="lg">
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3 text-center"><i className="bi bi-shield-check text-success" style={{ fontSize: 48 }} /><h6 className="mt-2">No compliance incidents YTD</h6><p className="small text-muted">Response plan is ready for immediate activation.</p></div>
        <h6>Response readiness</h6>
        {[["Detection", "Continuous monitoring", "green"], ["Escalation", "MLRO + Legal", "green"], ["Notification", "Authority-specific SLA", "green"], ["Evidence", "Immutable audit trail", "green"]].map(r => <div className="d-flex justify-content-between py-1 border-bottom small" key={r[0]}><span>{r[0]}</span><div><b>{r[1]}</b> <Badge tone={r[2] as any} dot>Ready</Badge></div></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 13. Policy Comparison Modal ============================ */
export function PolicyComparisonModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Policy Comparison" subtitle="Side-by-side comparison of two policy versions" icon="bi-arrows-angle-contract" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-2 mb-3"><div className="col"><select className="form-select"><option>AML/CFT Policy v4.1</option><option>AML/CFT Policy v4.2</option></select></div><div className="col"><select className="form-select"><option>AML/CFT Policy v4.2</option><option>AML/CFT Policy v4.0</option></select></div></div>
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Section</th><th>Previous</th><th>Current</th><th>Change</th></tr></thead><tbody>
          {[["1. Scope", "Unchanged", "Unchanged", "None"], ["2. KYC procedures", "Enhanced due diligence", "Enhanced + PEP screening", "Updated"], ["3. SAR filing", "48 hours", "24 hours", "Updated"], ["4. Training", "Annual", "Semi-annual", "Updated"], ["5. Record keeping", "5 years", "7 years", "Updated"]].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 0 ? "pm-td-strong" : ""}>{i === 3 ? <Badge tone={c === "None" ? "grey" : "amber"}>{c}</Badge> : c}</td>)}</tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 14. Staff Compliance Status Modal ============================ */
export function StaffComplianceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Staff Compliance Status" subtitle="Training completion and compliance posture per staff member" icon="bi-people" tone="violet" size="lg">
      <div className="pm-modal-body">
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Staff</th><th>Role</th><th>AML</th><th>Privacy</th><th>Security</th><th>Fraud</th><th>Overall</th></tr></thead><tbody>
          {[["Joseph M.", "Super Admin", "✓", "✓", "✓", "✓", "100%"], ["Sarah K.", "Platform Admin", "✓", "✓", "✓", "✓", "100%"], ["David K.", "Compliance", "✓", "✗", "✓", "✓", "75%"], ["Grace M.", "Support Lead", "✓", "✗", "✓", "✓", "75%"], ["Samuel K.", "Support Agent", "✓", "✗", "✓", "✗", "50%"]].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 0 ? "pm-td-strong" : ""}>{i === 6 ? <Badge tone={c === "100%" ? "green" : c === "75%" ? "amber" : "red"}>{c}</Badge> : c}</td>)}</tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={onClose}>Send reminders</button></div>
    </Modal>
  );
}

/* ============================ 15. Compliance Audit Trail Modal ============================ */
export function ComplianceAuditTrailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Compliance Audit Trail" subtitle="Immutable record of all compliance operations" icon="bi-clock-history" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Date</th><th>Actor</th><th>Operation</th><th>Target</th><th>Result</th></tr></thead><tbody>
          {[["Aug 22", "MLRO", "Policy approved", "AML/CFT Policy v4.2", "Published"], ["Aug 20", "Tax team", "Filing submitted", "VAT Return Aug", "Filed"], ["Aug 18", "DPO", "DPIA completed", "Fraud scoring engine", "Passed"], ["Aug 15", "CISO", "Cert renewed", "ISO 27001", "Active"], ["Aug 10", "MLRO", "AML report filed", "Q3 AML/CFT report", "Filed"], ["Aug 5", "HR", "Training completed", "AML Fundamentals", "94%"]].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 1 || i === 2 ? "pm-td-strong" : ""}>{i === 4 ? <Badge tone="green" dot>{c}</Badge> : c}</td>)}</tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={onClose}>Export</button></div>
    </Modal>
  );
}
