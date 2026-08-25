import { useState } from "react";
import { Badge, Modal, Drawer, Steps, useToast } from "../../../components/ui";

/* ============================ 1. DSR Detail Drawer ============================ */
export function DsrDetailDrawer({ dsr, onClose }: { dsr: string | null; onClose: () => void }) {
  if (!dsr) return null;
  return (
    <Drawer open onClose={onClose} title={`${dsr} — Data Subject Request`} subtitle="Request details, evidence and resolution status" icon="bi-inbox" wide>
      <div className="pm-card pm-card-pad mb-3">
        <div className="d-flex justify-content-between"><h5>{dsr}</h5><Badge tone="amber" dot>In progress</Badge></div>
        <div className="row g-3 mt-2">{[["User", "PAY-55667"], ["Type", "Access"], ["Received", "Aug 20"], ["Deadline", "Sep 19"], ["Assigned", "Legal"]].map(x => <div className="col-md-3" key={x[0]}><div className="pm-eyebrow">{x[0]}</div><b className="small">{x[1]}</b></div>)}</div>
      </div>
      <div className="pm-card pm-card-pad mb-3"><h6>Processing timeline</h6>
        {[["Aug 20", "Request received via in-app form", "done"], ["Aug 20", "Identity verification completed", "done"], ["Aug 21", "Data compilation started", "warn"], ["Sep 19", "Response due (30-day statutory)", "info"]].map(t => <div className={`pm-tl-item ${t[2]}`} key={t[0]}><b>{t[1]}</b><div className="pm-td-sub">{t[0]}</div></div>)}
      </div>
      <div className="pm-card pm-card-pad"><h6>Data categories to compile</h6>
        {["Account profile", "KYC documents", "Transaction history", "Communication logs", "Consent records", "Support tickets"].map(c => <div className="d-flex gap-2 align-items-center py-1 border-bottom small" key={c}><i className="bi bi-database text-primary" /><span>{c}</span></div>)}
      </div>
    </Drawer>
  );
}

/* ============================ 2. DSR Processing Modal ============================ */
export function DsrProcessModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Process Data Subject Request" subtitle="Compile, review and deliver the requested data" icon="bi-inbox" tone="blue" size="lg">
      <Steps current={1} steps={[{ label: "Identity", icon: "bi-person" }, { label: "Compile", icon: "bi-database" }, { label: "Review", icon: "bi-eye" }, { label: "Deliver", icon: "bi-send" }]} />
      <div className="pm-wizard-progress"><span style={{ width: "50%" }} /></div>
      <div className="pm-modal-body">
        <h6>Data compilation status</h6>
        {[["Account profile", "Compiled", "green"], ["KYC documents", "Compiled", "green"], ["Transaction history", "Compiling (2.3M rows)", "amber"], ["Communication logs", "Pending", "grey"], ["Consent records", "Compiled", "green"], ["Support tickets", "Pending", "grey"]].map(d => <div className="d-flex justify-content-between py-1 border-bottom small" key={d[0]}><span>{d[0]}</span><Badge tone={d[2] as any}>{d[1]}</Badge></div>)}
        <div className="mt-3"><label className="form-label">Estimated completion</label><input className="form-control" value="Aug 25, 2026 (5 days before deadline)" readOnly /></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Compilation queued" }); onClose(); }}>Continue compilation</button></div>
    </Modal>
  );
}

/* ============================ 3. Processing Activity Detail Modal ============================ */
export function ProcessingDetailModal({ open, activity, onClose }: { open: boolean; activity: string; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`${activity} — Processing Detail`} subtitle="Legal basis, data types, retention and third-party processors" icon="bi-database" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Legal basis", "Contract"], ["Retention", "Lifetime + 7 years"], ["DPO review", "Mar 2026"]].map(x => <div className="col-md-4" key={x[0]}><label className="form-label">{x[0]}</label><input className="form-control" value={x[1]} readOnly /></div>)}</div>
        <h6>Data types processed</h6>
        {["Name", "ID number", "Phone number", "Email address"].map(d => <div className="d-flex gap-2 align-items-center py-1 border-bottom small" key={d}><i className="bi bi-person text-primary" /><span>{d}</span></div>)}
        <h6 className="mt-3">Third-party processors</h6>
        {[["Onfido", "KYC verification", "DPA in place"], ["ComplyAdvantage", "AML screening", "DPA in place"]].map(p => <div className="d-flex justify-content-between py-1 border-bottom small" key={p[0]}><div><b>{p[0]}</b> — <span className="text-muted">{p[1]}</span></div><Badge tone="green">{p[2]}</Badge></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 4. Consent Ledger Modal ============================ */
export function ConsentLedgerModal({ open, consent, onClose }: { open: boolean; consent: string; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`${consent} — Consent Ledger`} subtitle="Timestamped consent records with collection point evidence" icon="bi-person-check" tone="green" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Opt-in rate", "65.5%"], ["Collection point", "App settings"], ["Can opt out", "Yes"]].map(x => <div className="col-md-4" key={x[0]}><label className="form-label">{x[0]}</label><input className="form-control" value={x[1]} readOnly /></div>)}</div>
        <h6>Recent consent events</h6>
        {[["PAY-12345", "Opted in", "Aug 22, 14:32", "192.168.1.x", "iOS 18"], ["PAY-67890", "Opted out", "Aug 22, 13:15", "192.168.1.x", "Android 14"], ["PAY-89012", "Opted in", "Aug 22, 12:00", "41.x.x.x", "iOS 18"]].map(c => <div className="d-flex justify-content-between py-1 border-bottom small" key={c[0]}><div><b>{c[0]}</b> — <Badge tone={c[1] === "Opted in" ? "green" : "amber"}>{c[1]}</Badge><div className="pm-td-sub">{c[2]} · {c[3]} · {c[4]}</div></div></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={onClose}>Export ledger</button></div>
    </Modal>
  );
}

/* ============================ 5. DPIA Detail Modal ============================ */
export function DpiaDetailModal({ open, dpia, onClose }: { open: boolean; dpia: string; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`${dpia} — DPIA Detail`} subtitle="Risk assessment, mitigations and review schedule" icon="bi-file-earmark-check" tone="violet" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Status", "Complete", "green"], ["Risk level", "High", "red"], ["Completed", "Aug 2026"], ["Next review", "Feb 2027"]].map(x => <div className="col-md-3" key={x[0]}><label className="form-label">{x[0]}</label>{x[2] ? <input className="form-control" value={x[1]} readOnly /> : <Badge tone={x[2] as any} dot>{x[1]}</Badge>}</div>)}</div>
        <h6>Mitigations</h6>
        {["Data minimization", "Transparency to data subjects", "Human oversight on automated decisions", "Regular audit schedule"].map(m => <div className="d-flex gap-2 align-items-center py-1 border-bottom small" key={m}><i className="bi bi-check-circle-fill text-success" /><span>{m}</span></div>)}
        <h6 className="mt-3">Review history</h6>
        {[["Aug 2026", "Initial DPIA completed", "DPO"], ["Feb 2027", "Scheduled review", "DPO + Security"]].map(r => <div className="d-flex justify-content-between py-1 border-bottom small" key={r[0]}><div><b>{r[0]}</b> — <span className="text-muted">{r[1]}</span></div><span>{r[2]}</span></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 6. Breach Response Wizard ============================ */
export function BreachResponseWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  if (!open) return null;
  return (
    <Modal open onClose={() => { setStep(0); onClose(); }} title="Data Breach Response" subtitle="Activate the breach response plan" icon="bi-shield-exclamation" tone="red" size="lg">
      <Steps current={step} steps={[{ label: "Detect", icon: "bi-exclamation-triangle" }, { label: "Contain", icon: "bi-shield-x" }, { label: "Assess", icon: "bi-search" }, { label: "Notify", icon: "bi-send" }]} />
      <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 25}%` }} /></div>
      <div className="pm-modal-body">
        {step === 0 && <div className="row g-3"><div className="col-12"><label className="form-label">Breach description</label><textarea className="form-control" rows={3} placeholder="Describe the incident..." /></div><div className="col-md-6"><label className="form-label">Detection method</label><select className="form-select"><option>Automated monitoring</option><option>Employee report</option><option>External report</option></select></div><div className="col-md-6"><label className="form-label">Severity estimate</label><select className="form-select"><option>High — personal data exposed</option><option>Medium — limited exposure</option><option>Low — no personal data</option></select></div></div>}
        {step === 1 && <div><h6>Containment actions</h6>{["Isolate affected system", "Revoke compromised credentials", "Block attacker access", "Preserve forensic evidence"].map(a => <div className="form-check py-1" key={a}><input className="form-check-input" type="checkbox" id={`bc-${a}`} /><label className="form-check-label small" htmlFor={`bc-${a}`}>{a}</label></div>)}</div>}
        {step === 2 && <div><h6>Impact assessment</h6>{[["Data subjects affected", "Unknown"], ["Data categories", "Unknown"], ["Risk to individuals", "Unknown"], ["Legal obligations", "ODPC notification within 72h"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b>{x[1]}</b></div>)}</div>}
        {step === 3 && <div><h6>Notification checklist</h6>{["ODPC (within 72 hours)", "Affected data subjects (without undue delay)", "Board of Directors", "CBK (if applicable)", "Law enforcement (if criminal)"].map(n => <div className="form-check py-1" key={n}><input className="form-check-input" type="checkbox" id={`bn-${n}`} /><label className="form-check-label small" htmlFor={`bn-${n}`}>{n}</label></div>)}</div>}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={() => step ? setStep(step - 1) : onClose()}>{step ? "Back" : "Cancel"}</button>{step < 3 ? <button className="btn btn-primary" onClick={() => setStep(step + 1)}>Continue</button> : <button className="btn btn-danger" onClick={() => { setStep(0); push({ kind: "success", title: "Breach response activated" }); onClose(); }}>Activate response</button>}</div>
    </Modal>
  );
}

/* ============================ 7. Retention Rule Modal ============================ */
export function RetentionRuleModal({ open, rule, onClose }: { open: boolean; rule: string; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`${rule} — Retention Rule`} subtitle="Automated purge rule and legal hold exceptions" icon="bi-clock-history" tone="blue">
      <div className="pm-modal-body">
        <div className="row g-3">
          {[["Retention period", "7 years"], ["Legal basis", "CBK regulations"], ["Deletion method", "Automated purge"], ["Legal hold exceptions", "2 active"], ["Last purge", "Aug 1, 2026"], ["Next purge", "Sep 1, 2026"]].map(x => <div className="col-md-6" key={x[0]}><label className="form-label">{x[0]}</label><input className="form-control" value={x[1]} readOnly /></div>)}
        </div>
        <h6 className="mt-3">Active legal holds</h6>
        {[["DSR-022 — PAY-88900", "Deletion request under review"], ["CASE-2026-034", "Regulatory investigation"]].map(h => <div className="d-flex justify-content-between py-1 border-bottom small" key={h[0]}><span className="pm-td-strong">{h[0]}</span><span className="text-muted">{h[1]}</span></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Retention rule updated" }); onClose(); }}>Save rule</button></div>
    </Modal>
  );
}

/* ============================ 8. Privacy Controls Drawer ============================ */
export function PrivacyControlsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Drawer open onClose={onClose} title="Privacy Controls" subtitle="DSR, consent and breach response controls" icon="bi-shield-check" wide>
      <div className="pm-card pm-card-pad mb-3"><Badge tone="green" dot>ODPC ready</Badge>
        <h6 className="mt-3">Privacy governance</h6>
        {[["DSR statutory window", "30 days"], ["DSR average resolution", "12.3 days"], ["Consent record retention", "7 years"], ["Breach notification", "ODPC within 72 hours"], ["Data Protection Officer", "Assigned · Legal"], ["Open legal holds", "2"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b>{x[1]}</b></div>)}
      </div>
      <div className="pm-card pm-card-pad"><h6>ODPC compliance</h6>
        {[["Registration", "Active"], ["Annual return", "Filed"], ["DPIA programme", "80% complete"], ["Breach log", "0 incidents YTD"], ["Staff training", "94% complete"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span>{x[0]}</span><Badge tone="green" dot>{x[1]}</Badge></div>)}
      </div>
    </Drawer>
  );
}

/* ============================ 9. Data Mapping Modal ============================ */
export function DataMappingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Data Flow Mapping" subtitle="Where personal data flows across systems and third parties" icon="bi-diagram-3" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>System</th><th>Data types</th><th>Purpose</th><th>Cross-border</th><th>DPA</th></tr></thead><tbody>
          {[["Onfido", "ID, selfie, address", "KYC", "Yes (UK)", "In place"], ["ComplyAdvantage", "Name, DOB, nationality", "AML screening", "Yes (UK)", "In place"], ["Safaricom", "Phone, transaction", "Payments", "No (Kenya)", "In place"], ["SendGrid", "Email, name", "Communications", "Yes (US)", "In place"], ["AWS", "All data types", "Infrastructure", "Yes (Ireland)", "In place"], ["Datadog", "Anonymized usage", "Analytics", "Yes (US)", "In place"]].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 0 ? "pm-td-strong" : ""}>{i === 3 ? <Badge tone={c === "No (Kenya)" ? "green" : "amber"}>{c}</Badge> : i === 4 ? <Badge tone="green">{c}</Badge> : c}</td>)}</tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={onClose}>Export map</button></div>
    </Modal>
  );
}

/* ============================ 10. Consent Change Modal ============================ */
export function ConsentChangeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Update Consent Configuration" subtitle="Change default consent state and opt-out policy" icon="bi-person-check" tone="amber">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Consent type</label><select className="form-select"><option>Marketing push</option><option>Marketing email</option><option>WhatsApp marketing</option><option>Location tracking</option></select></div>
          <div className="col-md-6"><label className="form-label">Default state</label><select className="form-select"><option>On (opt-out allowed)</option><option>Off (opt-in required)</option></select></div>
          <div className="col-12"><label className="form-label">Reason for change</label><textarea className="form-control" rows={2} defaultValue="Align with updated Data Protection Act requirements." /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Consent config updated" }); onClose(); }}>Save change</button></div>
    </Modal>
  );
}

/* ============================ 11. Training Record Modal ============================ */
export function TrainingRecordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Privacy Training Records" subtitle="Staff completion status and certification evidence" icon="bi-mortarboard" tone="violet" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["94%", "Completion", "violet"], ["52 / 55", "Staff trained", "blue"], ["9", "Incomplete", "amber"], ["Aug 2027", "Next deadline", "blue"]].map(x => <div className="col-md-3" key={x[1]}><div className="pm-card pm-card-pad text-center"><div className="h5 mb-0">{x[0]}</div><div className="small text-muted">{x[1]}</div></div></div>)}</div>
        <h6>Incomplete staff</h6>
        {[["David K.", "Compliance Officer", "Overdue 3 days", "red"], ["Grace M.", "Support Lead", "Overdue 1 day", "amber"], ["Samuel K.", "Support Agent", "Enrolled", "blue"]].map(s => <div className="d-flex justify-content-between py-1 border-bottom small" key={s[0]}><div><b>{s[0]}</b> — <span className="text-muted">{s[1]}</span></div><Badge tone={s[3] as any}>{s[2]}</Badge></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={onClose}>Send reminders</button></div>
    </Modal>
  );
}

/* ============================ 12. Privacy Policy Diff Modal ============================ */
export function PrivacyDiffModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Privacy Policy Diff" subtitle="Version comparison with changed sections highlighted" icon="bi-git" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-2 mb-3"><div className="col"><Badge tone="grey">v3.0</Badge></div><div className="col"><Badge tone="green">v3.1</Badge></div></div>
        {[["Section 2.3 — Data retention", "Updated: 2 years → 7 years for transaction data", "amber"], ["Section 4.1 — WhatsApp processing", "Added: WhatsApp Business API data flow", "green"], ["Section 5.2 — User rights", "Clarified: DSR response timeline", "amber"], ["Section 7.1 — Cookies", "Unchanged", "grey"]].map(d => <div className="d-flex justify-content-between py-2 border-bottom" key={d[0]}><div><b className="small">{d[0]}</b><div className="pm-td-sub">{d[1]}</div></div><Badge tone={d[2] as any}>{d[2] === "grey" ? "Unchanged" : "Updated"}</Badge></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={onClose}>Export diff</button></div>
    </Modal>
  );
}

/* ============================ 13. ODPC Filing Modal ============================ */
export function OdpcFilingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="ODPC Annual Return" subtitle="File the annual data protection return with the ODPC" icon="bi-receipt" tone="violet">
      <div className="pm-modal-body">
        <div className="row g-3">
          {[["Filing period", "Jan – Dec 2026"], ["Due date", "Mar 31, 2027"], ["Data subjects", "148,392"], ["DSRs processed", "23 (avg 12.3 days)"], ["Breaches", "0"], ["DPIAs completed", "8"]].map(x => <div className="col-md-6" key={x[0]}><label className="form-label">{x[0]}</label><input className="form-control" value={x[1]} readOnly /></div>)}
          <div className="col-12"><label className="form-label">Filing notes</label><textarea className="form-control" rows={2} defaultValue="Annual return prepared for ODPC submission." /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "ODPC return filed" }); onClose(); }}>File return</button></div>
    </Modal>
  );
}

/* ============================ 14. Third Party Risk Modal ============================ */
export function ThirdPartyRiskModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Third-Party Data Processor Risk" subtitle="DPA status, cross-border transfers and risk assessment" icon="bi-plug" tone="amber" size="lg">
      <div className="pm-modal-body">
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Processor</th><th>Purpose</th><th>DPA</th><th>Cross-border</th><th>Risk</th><th>Last reviewed</th></tr></thead><tbody>
          {[["Onfido", "KYC", "In place", "UK", "Low", "Jul 2026"], ["ComplyAdvantage", "AML", "In place", "UK", "Low", "Jul 2026"], ["SendGrid", "Email", "In place", "US", "Medium", "Jun 2026"], ["AWS", "Infrastructure", "In place", "Ireland", "Low", "Aug 2026"], ["Datadog", "Analytics", "In place", "US", "Medium", "Jun 2026"]].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 0 ? "pm-td-strong" : ""}>{i === 2 ? <Badge tone="green">{c}</Badge> : i === 4 ? <Badge tone={c === "Low" ? "green" : "amber"}>{c}</Badge> : c}</td>)}</tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={onClose}>Export risk report</button></div>
    </Modal>
  );
}

/* ============================ 15. Privacy Audit Trail Modal ============================ */
export function PrivacyAuditTrailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Privacy Audit Trail" subtitle="Immutable record of all privacy operations" icon="bi-clock-history" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Date</th><th>Actor</th><th>Operation</th><th>Target</th><th>Result</th></tr></thead><tbody>
          {[["Aug 22", "DPO", "DPIA completed", "Fraud scoring engine", "Passed"], ["Aug 20", "Legal", "DSR processed", "DSR-020 · PAY-44556", "Completed"], ["Aug 18", "Legal", "DSR received", "DSR-022 · PAY-88900", "In progress"], ["Aug 15", "DPO", "Consent audit", "Marketing push", "Passed"], ["Aug 10", "Tech", "Retention purge", "System logs >2 years", "50K records deleted"], ["Aug 5", "DPO", "DPIA started", "AI/ML model training", "In progress"]].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 1 || i === 2 ? "pm-td-strong" : ""}>{i === 4 ? <Badge tone={c === "Completed" || c === "Passed" ? "green" : c.includes("deleted") ? "blue" : "amber"}>{c}</Badge> : c}</td>)}</tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={onClose}>Export</button></div>
    </Modal>
  );
}
