import { useState } from "react";
import { Badge, Modal, Drawer, Steps, useToast } from "../../../components/ui";

/* ============================ 1. Ticket Detail Drawer ============================ */
export function TicketDetailDrawer({ ticket, onClose }: { ticket: string | null; onClose: () => void }) {
  if (!ticket) return null;
  return (
    <Drawer open onClose={onClose} title={`${ticket} — Ticket Detail`} subtitle="Full conversation, SLA status and customer context" icon="bi-headset" wide>
      <div className="pm-card pm-card-pad mb-3">
        <div className="d-flex gap-3 align-items-center"><div className="pm-avatar lg" style={{ background: "#2e90fa" }}>TK</div><div><h5 className="mb-1">{ticket}</h5><Badge tone="amber" dot>In Progress</Badge> <Badge tone="red">Urgent</Badge></div></div>
        <div className="row g-3 mt-2">{[["Customer", "PAY-12345"], ["Subject", "Wrong amount debited"], ["Category", "Transaction"], ["Assigned", "Samuel K."], ["SLA", "12 min left"], ["Created", "14:20 EAT"]].map(x => <div className="col-md-4" key={x[0]}><div className="pm-eyebrow">{x[0]}</div><b className="small">{x[1]}</b></div>)}</div>
      </div>
      <div className="pm-card pm-card-pad mb-3"><h6>Conversation</h6>
        {[["14:20", "Customer", "I was debited KES 5,000 but only sent KES 4,500"], ["14:25", "Agent", "I'm looking into this now. Let me check the transaction details."], ["14:28", "System", "Transaction TXN-89234 flagged for review"]].map(m => <div className="d-flex gap-2 py-2 border-bottom small" key={m[0]}><span className="mono text-muted" style={{ width: 50 }}>{m[0]}</span><div><Badge tone={m[1] === "Customer" ? "blue" : m[1] === "Agent" ? "green" : "grey"}>{m[1]}</Badge><div className="mt-1">{m[2]}</div></div></div>)}
      </div>
      <div className="pm-card pm-card-pad"><h6>Quick actions</h6>
        <div className="d-grid gap-2">{[["bi-person-check", "Reassign", "outline-primary"], ["bi-chat-left-text", "Send message", "outline-secondary"], ["bi-arrow-up-right-circle", "Escalate", "outline-warning"], ["bi-check2-circle", "Resolve", "outline-success"]].map(x => <button key={x[1]} className={`btn btn-sm btn-${x[2]}`}><i className={`bi ${x[0]} me-1`} />{x[1]}</button>)}</div>
      </div>
    </Drawer>
  );
}

/* ============================ 2. Agent Detail Modal ============================ */
export function AgentDetailModal({ open, agent, onClose }: { open: boolean; agent: string; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`${agent} — Agent Profile`} subtitle="Workload, performance metrics and recent activity" icon="bi-person-badge" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Active", "2"], ["Resolved today", "67"], ["CSAT", "4.5/5"], ["SLA met", "97%"]].map(x => <div className="col-md-3" key={x[0]}><div className="pm-card pm-card-pad text-center"><div className="pm-eyebrow">{x[0]}</div><div className="fw-bold">{x[1]}</div></div></div>)}</div>
        <h6>Recent tickets</h6>
        {[["T-4523", "Wrong amount debited", "In Progress", "amber"], ["T-4519", "Balance query", "Resolved", "green"], ["T-4517", "Missing receipt", "In Progress", "amber"]].map(t => <div className="d-flex justify-content-between py-1 border-bottom small" key={t[0]}><div><b>{t[0]}</b> — <span className="text-muted">{t[1]}</span></div><Badge tone={t[3] as any}>{t[2]}</Badge></div>)}
        <h6 className="mt-3">Performance trend</h6>
        {[["Avg resolution", "4.2 min", "Target <5 min", "green"], ["First response", "1.8 min", "Target <2 min", "green"], ["Tickets/day", "67", "Avg: 58", "blue"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><div><b>{x[1]}</b> <span className="text-muted">{x[2]}</span></div></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 3. Reassign Ticket Modal ============================ */
export function ReassignTicketModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Reassign Ticket" subtitle="Transfer ticket to another agent or team" icon="bi-person-check" tone="blue">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-12"><label className="form-label">Current assignment</label><input className="form-control" value="Samuel K. — Transaction team" readOnly /></div>
          <div className="col-md-6"><label className="form-label">Reassign to</label><select className="form-select"><option>Agnes W. — Support</option><option>John M. — Support</option><option>Faith O. — Support</option><option>Peter N. — Support</option><option>Transaction team (auto)</option></select></div>
          <div className="col-md-6"><label className="form-label">Priority</label><select className="form-select"><option>Keep current (Urgent)</option><option>High</option><option>Normal</option></select></div>
          <div className="col-12"><label className="form-label">Handover notes</label><textarea className="form-control" rows={2} defaultValue="Customer reported wrong debit amount. Transaction under review." /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Ticket reassigned" }); onClose(); }}>Reassign</button></div>
    </Modal>
  );
}

/* ============================ 4. Escalate Ticket Modal ============================ */
export function EscalateTicketModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Escalate Ticket" subtitle="Escalate to specialist team or management" icon="bi-arrow-up-right-circle" tone="amber">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-12"><label className="form-label">Escalate to</label><select className="form-select"><option>Support Lead</option><option>Compliance team</option><option>Finance team</option><option>Tech Lead</option><option>Platform Admin</option></select></div>
          <div className="col-md-6"><label className="form-label">Reason</label><select className="form-select"><option>SLA breach imminent</option><option>Complex issue</option><option>Customer complaint</option><option>Security concern</option><option>Refund >KES 100K</option></select></div>
          <div className="col-md-6"><label className="form-label">Urgency</label><select className="form-select"><option>Immediate</option><option>Within 1 hour</option><option>Within 4 hours</option></select></div>
          <div className="col-12"><label className="form-label">Context</label><textarea className="form-control" rows={3} defaultValue="Customer debited KES 500 more than intended. Possible system error. Needs finance review." /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-warning" onClick={() => { push({ kind: "success", title: "Ticket escalated" }); onClose(); }}>Escalate</button></div>
    </Modal>
  );
}

/* ============================ 5. Resolve Ticket Modal ============================ */
export function ResolveTicketModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Resolve Ticket" subtitle="Mark ticket as resolved and send customer survey" icon="bi-check2-circle" tone="green">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Resolution type</label><select className="form-select"><option>Issue resolved</option><option>User error explained</option><option>Duplicate ticket</option><option>Won't fix (by design)</option><option>Moved to another ticket</option></select></div>
          <div className="col-md-6"><label className="form-label">Action taken</label><select className="form-select"><option>Refund processed</option><option>Issue corrected</option><option>Information provided</option><option>No action needed</option></select></div>
          <div className="col-12"><label className="form-label">Resolution notes</label><textarea className="form-control" rows={3} defaultValue="Confirmed KES 500 overcharge. Refund of KES 500 processed to customer account." /></div>
          <div className="col-12"><label className="form-label">Post-resolution</label>
            <div className="form-check"><input className="form-check-input" type="checkbox" id="res-csat" defaultChecked /><label className="form-check-label small" htmlFor="res-csat">Send CSAT survey to customer</label></div>
            <div className="form-check"><input className="form-check-input" type="checkbox" id="res-notif" defaultChecked /><label className="form-check-label small" htmlFor="res-notif">Send resolution notification</label></div>
          </div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-success" onClick={() => { push({ kind: "success", title: "Ticket resolved" }); onClose(); }}>Resolve ticket</button></div>
    </Modal>
  );
}

/* ============================ 6. Customer Info Request Modal ============================ */
export function CustomerInfoRequestModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Request Customer Information" subtitle="Send a secure message to the customer for missing details" icon="bi-chat-left-text" tone="blue">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-12"><label className="form-label">Request type</label><select className="form-select"><option>Transaction details</option><option>Identity verification</option><option>Screenshot or receipt</option><option>Device information</option><option>Other</option></select></div>
          <div className="col-12"><label className="form-label">Message to customer</label><textarea className="form-control" rows={4} defaultValue="Hi, we need a bit more information to help resolve your issue. Could you please provide a screenshot of the transaction confirmation?" /></div>
          <div className="col-md-6"><label className="form-label">Delivery channel</label><select className="form-select"><option>In-app message</option><option>Email</option><option>SMS</option></select></div>
          <div className="col-md-6"><label className="form-label">Response deadline</label><select className="form-select"><option>24 hours</option><option>48 hours</option><option>72 hours</option></select></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Request sent" }); onClose(); }}>Send request</button></div>
    </Modal>
  );
}

/* ============================ 7. SLA Configuration Modal ============================ */
export function SlaConfigModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="SLA Configuration" subtitle="Set response and resolution thresholds by priority" icon="bi-stopwatch" tone="amber" size="lg">
      <div className="pm-modal-body">
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Priority</th><th>First response</th><th>Resolution</th><th>Escalation</th><th>Business hours</th></tr></thead><tbody>
          {[["Urgent", "2 min", "15 min", "10 min", "24/7"], ["High", "5 min", "30 min", "20 min", "24/7"], ["Normal", "15 min", "2 hours", "1 hour", "8AM–10PM"], ["Low", "30 min", "4 hours", "2 hours", "8AM–10PM"]].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 0 ? "pm-td-strong" : ""}>{i === 0 ? <Badge tone={c === "Urgent" ? "red" : c === "High" ? "amber" : "green"}>{c}</Badge> : c}</td>)}</tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "SLA config saved" }); onClose(); }}>Save SLA config</button></div>
    </Modal>
  );
}

/* ============================ 8. Macro Editor Modal ============================ */
export function MacroEditorModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Edit Macro" subtitle="Configure trigger, content and variables" icon="bi-lightning" tone="blue">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Macro name</label><input className="form-control" defaultValue="Balance check" /></div>
          <div className="col-md-6"><label className="form-label">Trigger phrase</label><input className="form-control" defaultValue="balance / how much" /></div>
          <div className="col-12"><label className="form-label">Response template</label><textarea className="form-control" rows={3} defaultValue="Your current balance is {{balance}}. Your last transaction was {{last_txn}} on {{last_txn_date}}." /></div>
          <div className="col-md-6"><label className="form-label">Variables</label><input className="form-control" value="{{balance}}, {{last_txn}}, {{last_txn_date}}" readOnly /></div>
          <div className="col-md-6"><label className="form-label">Usage (30d)</label><input className="form-control" value="2,345 times" readOnly /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Macro saved" }); onClose(); }}>Save macro</button></div>
    </Modal>
  );
}

/* ============================ 9. CSAT Survey Modal ============================ */
export function CsatSurveyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="CSAT Survey Results" subtitle="Customer satisfaction scores and feedback" icon="bi-emoji-smile" tone="violet" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Overall CSAT", "4.4 / 5", "violet"], ["Response rate", "45%", "blue"], ["Promoters", "72%", "green"], ["Detractors", "8%", "red"]].map(x => <div className="col-md-3" key={x[1]}><div className="pm-card pm-card-pad text-center"><Badge tone={x[2] as any}>{x[0]}</Badge><div className="h5 mt-2 mb-0">{x[1]}</div></div></div>)}</div>
        <h6>Recent feedback</h6>
        {[["T-4519", "Samuel K.", "5/5", "Fast and helpful. Resolved in minutes."], ["T-4515", "Agnes W.", "4/5", "Good service, slightly slow response."], ["T-4512", "John M.", "3/5", "Took a while to understand my issue."]].map(f => <div className="d-flex justify-content-between py-1 border-bottom small" key={f[0]}><div><b>{f[0]}</b> — <span className="text-muted">{f[1]}</span><div className="pm-td-sub">{f[3]}</div></div><Badge tone="green">{f[2]}</Badge></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={onClose}>Export report</button></div>
    </Modal>
  );
}

/* ============================ 10. Category Routing Modal ============================ */
export function CategoryRoutingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Category Routing Rules" subtitle="Configure automatic ticket routing by category" icon="bi-diagram-3" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Category</th><th>Route to</th><th>Auto-resolve</th><th>Priority</th></tr></thead><tbody>
          {[["Transaction issues", "Transaction team", "25%", "Auto-high"], ["KYC / Verification", "KYC team", "15%", "Auto-normal"], ["Loan queries", "Lending support", "20%", "Auto-normal"], ["Card issues", "Card team", "18%", "Auto-high"], ["General / Balance", "Any available", "45%", "Auto-low"], ["App / Technical", "Tech support", "30%", "Auto-normal"]].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 0 ? "pm-td-strong" : ""}>{c}</td>)}</tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Routing rules saved" }); onClose(); }}>Save routing</button></div>
    </Modal>
  );
}

/* ============================ 11. Ticket Analytics Modal ============================ */
export function TicketAnalyticsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Ticket Analytics" subtitle="Volume, resolution speed and cost analysis" icon="bi-graph-up" tone="violet" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["487", "Today's tickets", "blue"], ["2.1 min", "Avg first response", "green"], ["68%", "First contact resolution", "amber"], ["KES 45", "Cost per ticket", "green"]].map(x => <div className="col-md-3" key={x[1]}><div className="pm-card pm-card-pad text-center"><div className="h5 mb-0">{x[0]}</div><div className="small text-muted">{x[1]}</div></div></div>)}</div>
        <h6>Volume by hour</h6>
        <div className="support-bars mt-3">{[18, 22, 32, 45, 68, 92, 100, 88, 72, 64, 57, 60, 66, 72, 69, 55].map((h, i) => <div className="support-bar" style={{ height: h + "%" }} key={i}><small>{i}</small></div>)}</div>
        <h6 className="mt-3">Cost breakdown</h6>
        {[["Agent time", "KES 32 (71%)"], ["Infrastructure", "KES 8 (18%)"], ["Tools", "KES 3 (7%)"], ["Training", "KES 2 (4%)"]].map(c => <div className="d-flex justify-content-between py-1 border-bottom small" key={c[0]}><span>{c[0]}</span><b>{c[1]}</b></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={onClose}>Export analytics</button></div>
    </Modal>
  );
}

/* ============================ 12. Escalation Detail Modal ============================ */
export function EscalationDetailModal({ open, escalation, onClose }: { open: boolean; escalation: string; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`${escalation} — Escalation Detail`} subtitle="Escalation context, owner and resolution status" icon="bi-arrow-up-right-circle" tone="amber" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Ticket", escalation], ["Escalated to", "Support Lead"], ["Reason", "Card declined repeatedly"], ["Time", "14:05 EAT"], ["SLA", "15 min"], ["Status", "In progress"]].map(x => <div className="col-md-4" key={x[0]}><label className="form-label">{x[0]}</label><input className="form-control" value={x[1]} readOnly /></div>)}</div>
        <h6>Timeline</h6>
        {[["14:00", "Customer reported card declined"], ["14:05", "Agent escalated to Support Lead"], ["14:08", "Support Lead reviewing card status"], ["14:12", "Card team notified"]].map(t => <div className="d-flex gap-2 py-1 border-bottom small" key={t[0]}><span className="mono text-muted" style={{ width: 50 }}>{t[0]}</span><span>{t[1]}</span></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 13. Bulk Ticket Actions Modal ============================ */
export function BulkTicketModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Bulk Ticket Actions" subtitle="Perform actions on multiple tickets at once" icon="bi-list-check" tone="blue">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Select tickets</label><select className="form-select" multiple defaultValue={["T-4522", "T-4516"]}><option value="T-4522">T-4522 — Cannot verify KYC</option><option value="T-4516">T-4516 — Update phone number</option><option value="T-4517">T-4517 — Missing receipt</option></select></div>
          <div className="col-md-6"><label className="form-label">Action</label><select className="form-select"><option>Reassign to agent</option><option>Change priority</option><option>Add internal note</option><option>Close tickets</option><option>Escalate</option></select></div>
          <div className="col-12"><label className="form-label">Note</label><textarea className="form-control" rows={2} defaultValue="Batch action for SLA management." /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Bulk action applied" }); onClose(); }}>Apply action</button></div>
    </Modal>
  );
}

/* ============================ 14. Ticket Merge Modal ============================ */
export function TicketMergeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Merge Tickets" subtitle="Combine duplicate tickets into one" icon="bi-merge" tone="blue">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-12"><label className="form-label">Primary ticket (keep)</label><select className="form-select"><option>T-4523 — Wrong amount debited</option><option>T-4522 — Cannot verify KYC</option></select></div>
          <div className="col-12"><label className="form-label">Merge into primary</label><select className="form-select"><option>T-4517 — Missing receipt</option><option>T-4516 — Update phone number</option></select></div>
          <div className="col-12"><label className="form-label">Merge reason</label><textarea className="form-control" rows={2} defaultValue="Both tickets relate to the same transaction issue." /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Tickets merged" }); onClose(); }}>Merge tickets</button></div>
    </Modal>
  );
}

/* ============================ 15. SLA Breach Alert Modal ============================ */
export function SlaBreachAlertModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="SLA Breach Alert" subtitle="Tickets at risk of or already breaching SLA" icon="bi-exclamation-triangle" tone="red" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["At risk", "3", "amber"], ["Breached", "1", "red"], ["Avg time to breach", "8 min", "blue"]].map(x => <div className="col-md-4" key={x[1]}><div className="pm-card pm-card-pad text-center"><Badge tone={x[2] as any}>{x[0]}: {x[1]}</Badge></div></div>)}</div>
        <h6>Tickets at risk</h6>
        {[["T-4523", "Urgent", "12 min left", "In Progress", "Samuel K."], ["T-4518", "High", "18 min left", "Open", "Unassigned"], ["T-4517", "Normal", "38 min left", "In Progress", "John M."]].map(t => <div className="d-flex justify-content-between align-items-center py-1 border-bottom small" key={t[0]}><div><b>{t[0]}</b> — <Badge tone={t[1] === "Urgent" ? "red" : "amber"}>{t[1]}</Badge><div className="pm-td-sub">{t[4]} · {t[3]}</div></div><Badge tone="amber">{t[2]}</Badge></div>)}
        <h6 className="mt-3">Breached</h6>
        {[["T-4520", "Urgent", "Breached 3 min ago", "In Progress", "Samuel K."]].map(t => <div className="d-flex justify-content-between align-items-center py-1 border-bottom small" key={t[0]}><div><b>{t[0]}</b> — <Badge tone="red">{t[1]}</Badge><div className="pm-td-sub">{t[4]} · {t[3]}</div></div><Badge tone="red">{t[2]}</Badge></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-danger" onClick={onClose}>Escalate all</button></div>
    </Modal>
  );
}
