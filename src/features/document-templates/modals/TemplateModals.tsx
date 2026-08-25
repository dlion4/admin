import { useState } from "react";
import { Badge, Modal, Drawer, Steps, useToast } from "../../../components/ui";

/* ============================ 1. Template Detail Drawer ============================ */
export function TemplateDetailDrawer({ template, onClose }: { template: string | null; onClose: () => void }) {
  if (!template) return null;
  return (
    <Drawer open onClose={onClose} title={`${template} — Template Detail`} subtitle="Variables, usage history and generation stats" icon="bi-file-earmark-text" wide>
      <div className="pm-card pm-card-pad mb-3">
        <div className="d-flex justify-content-between"><h5>{template}</h5><Badge tone="green" dot>Active</Badge></div>
        <div className="row g-3 mt-2">{[["Category", "User Communication"], ["Format", "PDF"], ["Last updated", "Aug 2026"], ["Uses (30d)", "23"]].map(x => <div className="col-md-3" key={x[0]}><div className="pm-eyebrow">{x[0]}</div><b className="small">{x[1]}</b></div>)}</div>
      </div>
      <div className="pm-card pm-card-pad mb-3"><h6>Variables used</h6>
        {[["{{user_name}}", "User", "Joseph Kamau Mwangi"], ["{{user_account}}", "User", "PAY-12345-6789"], ["{{date}}", "System", "August 22, 2026"], ["{{reference_number}}", "System", "REF-2026-0822-001"]].map(v => <div className="d-flex justify-content-between py-1 border-bottom small" key={v[0]}><div><code>{v[0]}</code> <Badge tone="blue">{v[1]}</Badge></div><span className="text-muted">{v[2]}</span></div>)}
      </div>
      <div className="pm-card pm-card-pad"><h6>Recent generations</h6>
        {[["Aug 22, 14:30", "PAY-55667", "Warning letter", "PDF generated"], ["Aug 22, 11:15", "PAY-33445", "Warning letter", "PDF generated"], ["Aug 21, 16:45", "PAY-11234", "Warning letter", "PDF generated"]].map(g => <div className="d-flex justify-content-between py-1 border-bottom small" key={g[0]}><div><b>{g[1]}</b> — <span className="text-muted">{g[2]}</span><div className="pm-td-sub">{g[0]}</div></div><Badge tone="green">{g[3]}</Badge></div>)}
      </div>
    </Drawer>
  );
}

/* ============================ 2. Variable Editor Modal ============================ */
export function VariableEditorModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Variable Editor" subtitle="Manage template variables and default values" icon="bi-braces" tone="violet" size="lg">
      <div className="pm-modal-body">
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Variable</th><th>Source</th><th>Scope</th><th>Default value</th><th>Status</th></tr></thead><tbody>
          {[["{{company_name}}", "System", "All", "PayMo Digital Bank Ltd", "Active"], ["{{company_address}}", "System", "All", "Westlands, Nairobi", "Active"], ["{{user_name}}", "User", "User templates", "—", "Active"], ["{{user_account}}", "User", "User templates", "—", "Active"], ["{{balance}}", "Financial", "Financial", "—", "Active"], ["{{amount}}", "Financial", "Financial", "—", "Active"], ["{{date}}", "System", "All", "Current date", "Active"], ["{{reference_number}}", "System", "All", "Auto-generated", "Active"]].map(v => <tr key={v[0]}>{v.map((c, i) => <td key={i} className={i === 0 ? "mono" : i === 1 ? "" : ""}>{i === 0 ? <code>{c}</code> : i === 4 ? <Badge tone="green" dot>{c}</Badge> : c}</td>)}</tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Variables updated" }); onClose(); }}>Save variables</button></div>
    </Modal>
  );
}

/* ============================ 3. Template Preview Modal ============================ */
export function TemplatePreviewModal({ open, template, onClose }: { open: boolean; template: string; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`${template} — Preview`} subtitle="Rendered document with sample data" icon="bi-eye" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad" style={{ maxHeight: 350, overflowY: "auto" }}>
          <div className="d-flex justify-content-between mb-3"><h6>PayMo Digital Bank Ltd</h6><span className="small text-muted">Westlands, Nairobi</span></div>
          <p className="small"><b>Date:</b> August 22, 2026</p>
          <p className="small"><b>Ref:</b> REF-2026-0822-001</p>
          <hr />
          <p className="small"><b>Dear Joseph Kamau Mwangi,</b></p>
          <p className="small">This letter is to inform you that your account (PAY-12345-6789) has been flagged for review due to unusual transaction patterns.</p>
          <p className="small">Please contact our support team within 7 days to resolve this matter.</p>
          <p className="small mt-3">Kind regards,<br /><b>Jeckonia Kwasa</b><br />Compliance Officer<br />PayMo Digital Bank Ltd</p>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={onClose}>Download PDF</button></div>
    </Modal>
  );
}

/* ============================ 4. Generation History Modal ============================ */
export function GenerationHistoryModal({ open, template, onClose }: { open: boolean; template: string; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`${template} — Generation History`} subtitle="Recent document generations with status and timing" icon="bi-clock-history" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Date</th><th>User</th><th>Generated</th><th>Sent</th><th>Time</th></tr></thead><tbody>
          {[["Aug 22, 14:30", "PAY-55667", "PDF", "Yes", "2.1s"], ["Aug 22, 11:15", "PAY-33445", "PDF", "Yes", "1.8s"], ["Aug 21, 16:45", "PAY-11234", "PDF", "Yes", "2.3s"], ["Aug 20, 09:00", "PAY-77889", "PDF", "Yes", "1.9s"], ["Aug 19, 14:20", "PAY-44556", "PDF", "No", "2.0s"]].map(g => <tr key={g[0]}>{g.map((c, i) => <td key={i} className={i === 1 ? "mono" : i === 0 ? "" : ""}>{i === 3 ? <Badge tone={c === "Yes" ? "green" : "amber"}>{c}</Badge> : c}</td>)}</tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={onClose}>Export history</button></div>
    </Modal>
  );
}

/* ============================ 5. Template Version Diff Modal ============================ */
export function TemplateDiffModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Template Version Diff" subtitle="Compare changes between template versions" icon="bi-git" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-2 mb-3"><div className="col"><Badge tone="grey">Previous version</Badge></div><div className="col"><Badge tone="green">Current version</Badge></div></div>
        <div className="pm-card pm-card-pad mb-2" style={{ background: "#fef2f2" }}><div className="small text-danger text-decoration-line-through">"Your current balance is {{balance}}."</div></div>
        <div className="pm-card pm-card-pad" style={{ background: "#f0fdf4" }}><div className="small text-success fw-bold">"Your current balance is {{balance}} as of {{date}}. Reference: {{reference_number}}."</div></div>
        <div className="mt-3"><Badge tone="amber">Changes: Added date and reference variables</Badge></div>
      </div>
      <div className="pm-modal_foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 6. Bulk Generate Modal ============================ */
export function BulkGenerateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Bulk Generate Documents" subtitle="Generate multiple documents from a template at once" icon="bi-files" tone="blue">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Template</label><select className="form-select"><option>User warning letter</option><option>Account closure notice</option><option>Loan default notice</option></select></div>
          <div className="col-md-6"><label className="form-label">Source</label><select className="form-select"><option>Upload CSV of user IDs</option><option>Select from user segment</option></select></div>
          <div className="col-md-6"><label className="form-label">Output format</label><select className="form-select"><option>PDF</option><option>PDF + Email</option></select></div>
          <div className="col-md-6"><label className="form-label">Batch size</label><div className="input-group"><input className="form-control" defaultValue="100" /><span className="input-group-text">per batch</span></div></div>
          <div className="col-12"><label className="form-label">Custom variables (JSON)</label><textarea className="form-control mono" rows={3} defaultValue='{"date": "August 22, 2026", "reason": "Unusual transaction pattern"}' /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Bulk generation started" }); onClose(); }}>Generate batch</button></div>
    </Modal>
  );
}

/* ============================ 7. Template Usage Analytics Modal ============================ */
export function TemplateUsageModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Template Usage Analytics" subtitle="Generation, delivery and performance metrics" icon="bi-graph-up" tone="violet" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["125K", "Generated (30d)", "blue"], ["99.8%", "Success rate", "green"], ["2.1s", "Avg generation", "blue"], ["42", "Active templates", "violet"]].map(x => <div className="col-md-3" key={x[1]}><div className="pm-card pm-card-pad text-center"><div className="h5 mb-0">{x[0]}</div><div className="small text-muted">{x[1]}</div></div></div>)}</div>
        <h6>Top templates (30d)</h6>
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Template</th><th>Generated</th><th>Sent</th><th>Avg time</th></tr></thead><tbody>
          {[["Loan default notice", "45", "45", "3.2s"], ["Refund confirmation", "34", "34", "1.8s"], ["User warning letter", "23", "23", "2.1s"], ["Account closure notice", "18", "18", "2.5s"], ["Fee change notification", "1", "148,392", "45s bulk"]].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 0 ? "pm-td-strong" : "pm-num"}>{c}</td>)}</tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal_foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 8. Access Policy Drawer ============================ */
export function TemplateAccessDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Drawer open onClose={onClose} title="Template Access Policy" subtitle="Role-based access and approval requirements" icon="bi-shield-lock" wide>
      <div className="pm-card pm-card-pad mb-3"><Badge tone="green" dot>Enforced</Badge>
        <h6 className="mt-3">Access matrix</h6>
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Role</th><th>View</th><th>Edit</th><th>Generate</th><th>Publish</th></tr></thead><tbody>
          {[["Super Admin", "✓", "✓", "✓", "✓"], ["Platform Admin", "✓", "✓", "✓", "✗"], ["Operations Mgr", "✓", "✓", "✓", "✗"], ["Compliance", "✓", "✗", "✓", "✗"], ["Support Lead", "✓", "✗", "✓", "✗"], ["Support Agent", "✓", "✗", "✓", "✗"]].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 0 ? "pm-td-strong" : ""}>{c}</td>)}</tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-card pm-card-pad"><h6>Approval requirements</h6>
        {[["Template creation", "Manager + Legal"], ["Template edit", "Manager approval"], ["Bulk generation", "Manager approval"], ["Variable change", "Legal approval"], ["Template deprecation", "Super Admin"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span>{x[0]}</span><b>{x[1]}</b></div>)}
      </div>
    </Drawer>
  );
}

/* ============================ 9. Template Approval Modal ============================ */
export function TemplateApprovalModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Template Approval" subtitle="Review and approve template before publication" icon="bi-check2-circle" tone="green">
      <div className="pm-modal-body">
        <div className="alert alert-success small"><i className="bi bi-check-circle me-1" />This template has passed all compliance and legal checks.</div>
        <div className="row g-3">
          {[["Template", "User warning letter"], ["Version", "v3.1"], ["Category", "User Communication"], ["Channels", "PDF"], ["Compliance", "Passed"], ["Legal", "Passed"]].map(x => <div className="col-md-6" key={x[0]}><label className="form-label">{x[0]}</label><input className="form-control" value={x[1]} readOnly /></div>)}
          <div className="col-12"><label className="form-label">Message preview</label><div className="pm-card pm-card-pad"><p className="small mb-0">"Dear {{user_name}}, this letter is to inform you that your account ({{user_account}}) has been flagged for review."</p></div></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Reject</button><button className="btn btn-success" onClick={() => { push({ kind: "success", title: "Template approved" }); onClose(); }}>Approve template</button></div>
    </Modal>
  );
}

/* ============================ 10. Template Create Wizard ============================ */
export function TemplateCreateWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  if (!open) return null;
  return (
    <Modal open onClose={() => { setStep(0); onClose(); }} title="Create Document Template" subtitle="Design, configure, test and publish a new template" icon="bi-file-earmark-plus" tone="blue" size="lg">
      <Steps current={step} steps={[{ label: "Identity", icon: "bi-file-text" }, { label: "Content", icon: "bi-pencil" }, { label: "Test", icon: "bi-play-circle" }, { label: "Publish", icon: "bi-cloud-upload" }]} />
      <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 25}%` }} /></div>
      <div className="pm-modal-body">
        {step === 0 && <div className="row g-3"><div className="col-md-7"><label className="form-label">Template name</label><input className="form-control" placeholder="e.g. Loan demand letter" /></div><div className="col-md-5"><label className="form-label">Category</label><select className="form-select"><option>User Communication</option><option>Lending</option><option>Partnerships</option><option>Legal</option><option>HR</option></select></div><div className="col-md-6"><label className="form-label">Output format</label><select className="form-select"><option>PDF</option><option>Word + PDF</option><option>Email HTML</option></select></div><div className="col-md-6"><label className="form-label">Approval route</label><select className="form-select"><option>Manager + Legal</option><option>Manager only</option><option>Super Admin</option></select></div></div>}
        {step === 1 && <div className="row g-3"><div className="col-12"><label className="form-label">Template content</label><textarea className="form-control" rows={8} defaultValue={"Dear {{user_name}},\n\nThis letter is regarding your account {{user_account}}.\n\n[Enter template body here]\n\nKind regards,\n{{signatory_name}}"} /></div><div className="col-12"><label className="form-label">Available variables</label><input className="form-control" value="{{user_name}}, {{user_account}}, {{date}}, {{reference_number}}, {{signatory_name}}" readOnly /></div></div>}
        {step === 2 && <div><h6>Test generation</h6><p className="small text-muted">Generate a sample document with test data to verify layout and variable substitution.</p><div className="pm-card pm-card-pad">{[["Variable", "Test value"], ["{{user_name}}", "Test User"], ["{{user_account}}", "PAY-TEST-001"], ["{{date}}", "August 22, 2026"], ["{{reference_number}}", "REF-TEST-001"]].map(v => <div className="d-flex justify-content-between py-1 border-bottom small" key={v[0]}><span className="mono">{v[0]}</span><span>{v[1]}</span></div>)}</div></div>}
        {step === 3 && <div className="text-center py-3"><Badge tone="green" dot>Ready for approval</Badge><h6 className="mt-3">Template ready</h6><p className="small text-muted">The template will be routed through Manager and Legal approval before publication.</p></div>}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={() => step ? setStep(step - 1) : onClose()}>{step ? "Back" : "Cancel"}</button>{step < 3 ? <button className="btn btn-primary" onClick={() => setStep(step + 1)}>Continue</button> : <button className="btn btn-primary" onClick={() => { setStep(0); push({ kind: "success", title: "Template submitted" }); onClose(); }}>Submit for approval</button>}</div>
    </Modal>
  );
}

/* ============================ 11. Template Deprecate Modal ============================ */
export function TemplateDeprecateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Deprecate Template" subtitle="Retire a template and archive its generation history" icon="bi-archive" tone="amber">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-12"><label className="form-label">Template to deprecate</label><select className="form-select"><option>User warning letter</option><option>Account closure notice</option><option>Loan demand letter</option></select></div>
          <div className="col-md-6"><label className="form-label">Reason</label><select className="form-select"><option>Replaced by new version</option><option>No longer needed</option><option>Regulatory change</option></select></div>
          <div className="col-md-6"><label className="form-label">Replacement template</label><select className="form-select"><option>None</option><option>User warning letter v2</option></select></div>
          <div className="col-12"><label className="form-label">Notes</label><textarea className="form-control" rows={2} defaultValue="Template replaced by updated version with new compliance language." /></div>
        </div>
      </div>
      <div className="pm-modal_foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-warning" onClick={() => { push({ kind: "success", title: "Template deprecated" }); onClose(); }}>Deprecate template</button></div>
    </Modal>
  );
}

/* ============================ 12. Template Category Modal ============================ */
export function TemplateCategoryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Template Categories" subtitle="Organize templates by category and usage" icon="bi-folder" tone="blue" size="lg">
      <div className="pm-modal-body">
        {[["User Communication", "4 templates", "78 uses (30d)", "PDF, Email"], ["Lending", "2 templates", "57 uses (30d)", "PDF"], ["Partnerships", "1 template", "2 uses (30d)", "Word + PDF"], ["Legal", "1 template", "5 uses (30d)", "Word + PDF"], ["HR", "1 template", "3 uses (30d)", "Word + PDF"], ["Governance", "1 template", "1 use (30d)", "Word + PDF"], ["Compliance", "1 template", "3 uses (30d)", "PDF"], ["Privacy", "1 template", "0 uses (30d)", "PDF + Email"]].map(c => <div className="d-flex justify-content-between align-items-center py-2 border-bottom" key={c[0]}><div><b>{c[0]}</b><div className="pm-td-sub">{c[1]} · {c[3]}</div></div><div className="text-end"><div className="small fw-bold">{c[2]}</div></div></div>)}
      </div>
      <div className="pm-modal_foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 13. Template Audit Trail Modal ============================ */
export function TemplateAuditTrailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Template Audit Trail" subtitle="Immutable record of all template operations" icon="bi-clock-history" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Date</th><th>Actor</th><th>Operation</th><th>Template</th><th>Result</th></tr></thead><tbody>
          {[["Aug 22", "Joseph M.", "Generated", "User warning letter", "Success"], ["Aug 22", "Joseph M.", "Generated", "User warning letter", "Success"], ["Aug 21", "Legal", "Approved", "Fee change notification", "Published"], ["Aug 20", "Joseph M.", "Created", "Fee change notification", "Draft"], ["Aug 18", "Joseph M.", "Generated", "Loan default notice", "Success"], ["Aug 15", "Legal", "Approved", "Account closure notice", "Published"]].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 1 || i === 2 ? "pm-td-strong" : ""}>{i === 4 ? <Badge tone="green" dot>{c}</Badge> : c}</td>)}</tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal_foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={onClose}>Export</button></div>
    </Modal>
  );
}

/* ============================ 14. Template Performance Modal ============================ */
export function TemplatePerformanceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Template Performance" subtitle="Generation speed, error rates and delivery metrics" icon="bi-speedometer2" tone="green" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["99.8%", "Success rate", "green"], ["2.1s", "Avg generation", "blue"], ["125K", "Total generated", "blue"], ["0", "Errors (30d)", "green"]].map(x => <div className="col-md-3" key={x[1]}><div className="pm-card pm-card-pad text-center"><Badge tone={x[2] as any}>{x[0]}</Badge><div className="small mt-1">{x[1]}</div></div></div>)}</div>
        <h6>Performance by category</h6>
        {[["User Communication", "2.1s", "99.9%", "green"], ["Lending", "3.2s", "100%", "green"], ["Partnerships", "2.5s", "100%", "green"], ["Legal", "1.8s", "100%", "green"], ["HR", "2.0s", "100%", "green"]].map(c => <div className="d-flex justify-content-between py-1 border-bottom small" key={c[0]}><span className="pm-td-strong">{c[0]}</span><div><span className="me-2">{c[1]}</span><Badge tone={c[3] as any}>{c[2]}</Badge></div></div>)}
      </div>
      <div className="pm-modal_foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 15. Template Export Modal ============================ */
export function TemplateExportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Export Templates" subtitle="Download templates and their configurations" icon="bi-download" tone="blue">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Format</label><select className="form-select"><option>ZIP archive (all templates)</option><option>JSON (machine-readable)</option><option>Individual PDFs</option></select></div>
          <div className="col-md-6"><label className="form-label">Scope</label><select className="form-select"><option>All active templates</option><option>Selected templates</option><option>Category filter</option></select></div>
          <div className="col-12"><label className="form-label">Include</label>
            {["Template content", "Variable definitions", "Generation history", "Access policy"].map(i => <div className="form-check py-1" key={i}><input className="form-check-input" type="checkbox" id={`te-${i}`} defaultChecked /><label className="form-check-label small" htmlFor={`te-${i}`}>{i}</label></div>)}
          </div>
        </div>
      </div>
      <div className="pm-modal_foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Export started" }); onClose(); }}>Generate export</button></div>
    </Modal>
  );
}
