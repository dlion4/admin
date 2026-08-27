import { useState } from "react";
import { Badge, Modal, Drawer, Steps, useToast } from "../../../components/ui";

/* ================================================================
   TYPE HELPERS
   ================================================================ */
type Tone = "green" | "red" | "amber" | "blue" | "violet" | "ink";

/* ================================================================
   1. BROADCAST DETAIL DRAWER
   ================================================================ */
export function BroadcastDetailDrawer({ broadcast, onClose }: { broadcast: string | null; onClose: () => void }) {
  if (!broadcast) return null;
  return (
    <Drawer open onClose={onClose} title={`${broadcast} — Broadcast Detail`} subtitle="Delivery trace, channel-level costs and engagement" icon="bi-send" wide>
      <div className="pm-card pm-card-pad mb-3">
        <div className="d-flex justify-content-between"><h5>{broadcast}</h5><Badge tone="green" dot>Sent</Badge></div>
        <div className="row g-3 mt-2">{[["Sent", "Aug 22"], ["Audience", "All active"], ["Channels", "Push + Email"], ["Owner", "Joseph M."]].map(x => <div className="col-md-3" key={x[0]}><div className="pm-eyebrow">{x[0]}</div><b className="small">{x[1]}</b></div>)}</div>
      </div>
      <div className="pm-card pm-card-pad mb-3"><h6>Delivery breakdown</h6>
        {[["Sent", "134,210"], ["Delivered", "131,526 (98%)"], ["Opened", "42,123 (32%)"], ["Clicked", "12,456 (9.3%)"], ["Unsubscribed", "23 (0.02%)"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span>{x[0]}</span><b>{x[1]}</b></div>)}
      </div>
      <div className="pm-card pm-card-pad"><h6>Channel performance</h6>
        {[["Push", "134,210", "98.2%", "18.5%"], ["Email", "134,210", "98.0%", "32.4%"]].map(c => <div className="d-flex justify-content-between py-1 border-bottom small" key={c[0]}><span className="pm-td-strong">{c[0]}</span><span>{c[1]}</span><span>Delivery: {c[2]}</span><span>Open: {c[3]}</span></div>)}
      </div>
    </Drawer>
  );
}

/* ================================================================
   2. BROADCAST ANALYTICS MODAL
   ================================================================ */
export function BroadcastAnalyticsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Broadcast Analytics" subtitle="Delivery, engagement and ROI across all recent campaigns" icon="bi-graph-up" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Total sent", "401K", "blue"], ["Delivery rate", "98.1%", "green"], ["Avg open rate", "32%", "blue"], ["Avg click rate", "9%", "violet"]].map(x => <div className="col-md-3" key={x[1]}><div className="pm-card pm-card-pad text-center"><div className="h5 mb-0">{x[1]}</div><div className="small text-muted">{x[0]}</div></div></div>)}</div>
        <h6>Campaign performance</h6>
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Campaign</th><th>Sent</th><th>Delivery</th><th>Open rate</th><th>Cost</th></tr></thead><tbody>
          {[["Fee reduction", "134,210", "98%", "32%", "KES 268K"], ["Maintenance", "148,392", "98.4%", "N/A", "KES 297K"], ["Savings Goals", "125,863", "98%", "31.5%", "KES 252K"], ["KYC reminder", "3,588", "98.5%", "N/A", "KES 7K"], ["Promo discount", "5,230", "97.3%", "46.1%", "KES 16K"]].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 0 ? "pm-td-strong" : "pm-num"}>{c}</td>)}</tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button><button className="btn btn-primary btn-sm" onClick={onClose}><i className="bi bi-download me-1" />Export report</button></div>
    </Modal>
  );
}

/* ================================================================
   3. AUDIENCE BUILDER MODAL
   ================================================================ */
export function AudienceBuilderModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Audience Builder" subtitle="Create custom segments with consent-aware filtering" icon="bi-people" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Segment name</label><input className="form-control" placeholder="e.g. High-value dormant users" /></div>
          <div className="col-md-6"><label className="form-label">Base segment</label><select className="form-select"><option>All active users · 134,210</option><option>New users · 3,200</option><option>VIP clients · 347</option><option>Business accounts · 8,900</option></select></div>
          <div className="col-md-4"><label className="form-label">Filter: Balance</label><select className="form-select"><option>Any</option><option>Greater than KES 100K</option><option>Greater than KES 1M</option></select></div>
          <div className="col-md-4"><label className="form-label">Filter: Last active</label><select className="form-select"><option>Within 30 days</option><option>30–90 days ago</option><option>90+ days ago</option></select></div>
          <div className="col-md-4"><label className="form-label">Filter: County</label><select className="form-select"><option>Any</option><option>Nairobi</option><option>Mombasa</option><option>Kisumu</option></select></div>
          <div className="col-12"><label className="form-label">Consent filter</label><div className="form-check"><input className="form-check-input" type="checkbox" id="consent-push" defaultChecked /><label className="form-check-label small" htmlFor="consent-push">Push notifications opted-in</label></div><div className="form-check"><input className="form-check-input" type="checkbox" id="consent-email" defaultChecked /><label className="form-check-label small" htmlFor="consent-email">Email opted-in</label></div><div className="form-check"><input className="form-check-input" type="checkbox" id="consent-sms" defaultChecked /><label className="form-check-label small" htmlFor="consent-sms">SMS opted-in (not on DND)</label></div></div>
        </div>
        <div className="pm-card pm-card-pad mt-3"><div className="d-flex justify-content-between"><span>Estimated audience size</span><b>45,230 users</b></div></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button><button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Audience segment saved" }); onClose(); }}>Save segment</button></div>
    </Modal>
  );
}

/* ================================================================
   4. BROADCAST APPROVAL MODAL
   ================================================================ */
export function BroadcastApprovalModal({ open, broadcastName, onClose }: { open: boolean; broadcastName?: string; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  const name = broadcastName || "Fee reduction notice";
  return (
    <Modal open onClose={onClose} title="Broadcast Approval" subtitle="Review and approve before customer delivery" icon="bi-check2-circle" tone="green">
      <div className="pm-modal-body">
        <div className="alert alert-success small"><i className="bi bi-check-circle me-1" />This broadcast has passed all compliance and audience checks.</div>
        <div className="row g-3">
          {[["Name", name], ["Channel", "Push + Email"], ["Audience", "All active users (134,210)"], ["Scheduled", "Tomorrow 09:00 EAT"], ["Compliance", "All checks passing"], ["Quiet hours", "Respected"]].map(x => <div className="col-md-6" key={x[0]}><label className="form-label">{x[0]}</label><input className="form-control" value={x[1]} readOnly /></div>)}
          <div className="col-12"><label className="form-label">Message preview</label><div className="pm-card pm-card-pad"><p className="mb-0">"Hello {'{{name}}'}, discover what's new in PayMo this month. Learn more in the app."</p></div></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Reject</button><button className="btn btn-success btn-sm" onClick={() => { push({ kind: "success", title: "Broadcast approved" }); onClose(); }}><i className="bi bi-check2 me-1" />Approve and send</button></div>
    </Modal>
  );
}

/* ================================================================
   5. BUDGET ALERT MODAL
   ================================================================ */
export function BudgetAlertModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Budget Alert Configuration" subtitle="Set alerts when channel spend reaches threshold" icon="bi-bell" tone="amber">
      <div className="pm-modal-body">
        <div className="row g-3">
          {[["SMS", "80%"], ["Email", "80%"], ["WhatsApp", "80%"]].map(x => <div className="col-md-6" key={x[0]}><label className="form-label">{x[0]} alert threshold</label><div className="input-group"><input className="form-control" defaultValue={x[1]} /><span className="input-group-text">% of budget</span></div></div>)}
          <div className="col-12"><label className="form-label">Alert recipients</label><input className="form-control" defaultValue="joseph@paymo.co.ke, comms@paymo.co.ke" /></div>
          <div className="col-12"><label className="form-label">Alert channel</label><select className="form-select"><option>Email + In-app</option><option>SMS only</option><option>Email only</option></select></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button><button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Budget alerts configured" }); onClose(); }}>Save alerts</button></div>
    </Modal>
  );
}

/* ================================================================
   6. DRY RUN MODAL
   ================================================================ */
export function DryRunModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Dry Run Preview" subtitle="Test broadcast delivery to admin preview group" icon="bi-eye" tone="blue">
      <div className="pm-modal-body">
        <div className="alert alert-info small"><i className="bi bi-info-circle me-1" />No customers will be contacted. Test messages are sent to the admin preview group only.</div>
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Preview recipients</label><input className="form-control" value="3 admins" readOnly /></div>
          <div className="col-md-6"><label className="form-label">Channels tested</label><input className="form-control" value="Push + Email" readOnly /></div>
          <div className="col-12"><label className="form-label">Message preview</label><div className="pm-card pm-card-pad"><p className="mb-0">"Hello Joseph, discover what's new in PayMo this month. Learn more in the app."</p></div></div>
        </div>
        <h6 className="mt-3">Compliance checks</h6>
        {[["Audience consent", "Passed", "green"], ["Quiet hours", "Passed", "green"], ["DND list", "Passed", "green"], ["Sender ID", "Passed", "green"], ["Message length", "Passed", "green"]].map(c => <div className="d-flex justify-content-between py-1 border-bottom small" key={c[0]}><span>{c[0]}</span><Badge tone={c[2] as any} dot>{c[1]}</Badge></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button><button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Dry run sent" }); onClose(); }}>Send dry run</button></div>
    </Modal>
  );
}

/* ================================================================
   7. BROADCAST HISTORY DETAIL MODAL
   ================================================================ */
export function BroadcastHistoryDetailModal({ open, broadcast, onClose }: { open: boolean; broadcast: string; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`${broadcast} — Detail`} subtitle="Full delivery trace and engagement metrics" icon="bi-clock-history" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Sent", "134,210"], ["Delivered", "131,526 (98%)"], ["Opened", "42,123 (32%)"], ["Clicked", "12,456 (9.3%)"]].map(x => <div className="col-md-3" key={x[0]}><div className="pm-card pm-card-pad text-center"><div className="pm-eyebrow">{x[0]}</div><div className="fw-bold">{x[1]}</div></div></div>)}</div>
        <h6>Channel breakdown</h6>
        {[["Push", "134,210 sent", "131,788 delivered (98.2%)", "24,829 opened (18.5%)"], ["Email", "134,210 sent", "131,526 delivered (98%)", "42,123 opened (32%)"]].map(c => <div className="pm-card pm-card-pad mb-2" key={c[0]}><b>{c[0]}</b><div className="small text-muted mt-1">{c[1]} · {c[2]} · {c[3]}</div></div>)}
        <h6 className="mt-3">Approval chain</h6>
        <div className="broadcast-timeline">
          {[["Aug 22, 10:00", "Joseph M. drafted"], ["Aug 22, 10:01", "Compliance check passed"], ["Aug 22, 14:00", "Platform Admin approved"], ["Aug 22, 14:05", "Sent to audience"]].map(a => <div key={a[0]}><span>{a[0]}</span><b>{a[1]}</b></div>)}
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button><button className="btn btn-primary btn-sm" onClick={onClose}><i className="bi bi-download me-1" />Export report</button></div>
    </Modal>
  );
}

/* ================================================================
   8. COMPLIANCE PRE-CHECK MODAL
   ================================================================ */
export function CompliancePreCheckModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Compliance Pre-check" subtitle="Verify broadcast meets all regulatory requirements before sending" icon="bi-shield-check" tone="green">
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3 text-center"><i className="bi bi-patch-check-fill text-success" style={{ fontSize: 48 }} /><h6 className="mt-2">All checks passing</h6><p className="small text-muted">8 of 8 compliance checks passed.</p></div>
        {[["Consent filtering", "Passed", "green"], ["Quiet hours", "Passed", "green"], ["DND list", "Passed", "green"], ["Sender identification", "Passed", "green"], ["Unsubscribe mechanism", "Passed", "green"], ["Message content", "Passed", "green"], ["Marketing frequency", "Passed", "green"], ["Data retention", "Passed", "green"]].map(c => <div className="d-flex justify-content-between py-1 border-bottom small" key={c[0]}><span>{c[0]}</span><Badge tone={c[2] as any} dot>{c[1]}</Badge></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ================================================================
   9. CHANNEL COMPARISON MODAL
   ================================================================ */
export function ChannelComparisonModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Channel Comparison" subtitle="Side-by-side delivery performance across channels" icon="bi-arrows-angle-contract" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Metric</th><th>Push</th><th>Email</th><th>SMS</th><th>WhatsApp</th></tr></thead><tbody>
          {[["Delivery rate", "98.2%", "98.0%", "98.5%", "96.3%"], ["Open rate", "18.5%", "32.4%", "N/A", "78.5%"], ["Click rate", "4.2%", "8.7%", "N/A", "23.4%"], ["Opt-out rate", "N/A", "0.8%", "0.2%", "0.5%"], ["Cost per msg", "Free", "KES 0.50", "KES 2.00", "KES 3.00"], ["Best for", "Urgent", "Rich content", "Reach", "VIP"]].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 0 ? "pm-td-strong" : ""}>{c}</td>)}</tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ================================================================
   10. BROADCAST WIZARD (4-STEP)
   ================================================================ */
export function BroadcastWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [channel, setChannel] = useState("Push + Email");
  const [audience, setAudience] = useState("All active users · 134,210");
  const [schedule, setSchedule] = useState("Immediately after approval");
  const [message, setMessage] = useState("");
  if (!open) return null;
  return (
    <Modal open onClose={() => { setStep(0); onClose(); }} title="New Broadcast" subtitle={`Step ${step + 1} of 4: ${["Message", "Audience", "Schedule", "Review"][step]}`} icon="bi-send" tone="blue" size="lg">
      <Steps current={step} steps={[{ label: "Message", icon: "bi-pencil" }, { label: "Audience", icon: "bi-people" }, { label: "Schedule", icon: "bi-calendar3" }, { label: "Review", icon: "bi-check2" }]} />
      <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 25}%` }} /></div>
      <div className="pm-modal-body">
        {step === 0 && <div className="row g-3">
          <div className="col-md-7"><label className="form-label">Broadcast name</label><input className="form-control" placeholder="e.g. August product update" value={name} onChange={e => setName(e.target.value)} /></div>
          <div className="col-md-5"><label className="form-label">Channel</label><select className="form-select" value={channel} onChange={e => setChannel(e.target.value)}><option>Push + Email</option><option>Push + SMS</option><option>Multi-channel</option><option>WhatsApp</option><option>SMS only</option></select></div>
          <div className="col-12"><label className="form-label">Message body</label><textarea className="form-control" rows={4} placeholder="Hello {{name}}, discover what's new in PayMo this month." value={message} onChange={e => setMessage(e.target.value)} /></div>
          <div className="col-12"><div className="pm-note"><i className="bi bi-info-circle me-1" />Use {'{{name}}'} for personalization. Message length: {message.length}/500 characters.</div></div>
        </div>}
        {step === 1 && <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Audience segment</label><select className="form-select" value={audience} onChange={e => setAudience(e.target.value)}><option>All active users · 134,210</option><option>New users · 3,200</option><option>VIP clients · 347</option><option>Dormant 30d+ · 8,450</option><option>Business accounts · 8,900</option><option>Unverified KYC · 3,588</option></select></div>
          <div className="col-md-6"><label className="form-label">Consent filter</label><input className="form-control" value="Automatic — only opted-in users" readOnly /></div>
          <div className="col-12"><label className="form-label">Consent channels</label><div className="d-flex gap-3"><div className="form-check"><input className="form-check-input" type="checkbox" id="w-push" defaultChecked /><label className="form-check-label small" htmlFor="w-push">Push</label></div><div className="form-check"><input className="form-check-input" type="checkbox" id="w-email" defaultChecked /><label className="form-check-label small" htmlFor="w-email">Email</label></div><div className="form-check"><input className="form-check-input" type="checkbox" id="w-sms" defaultChecked /><label className="form-check-label small" htmlFor="w-sms">SMS</label></div></div></div>
        </div>}
        {step === 2 && <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Send time</label><select className="form-select" value={schedule} onChange={e => setSchedule(e.target.value)}><option>Immediately after approval</option><option>Tomorrow 09:00 EAT</option><option>Custom schedule</option></select></div>
          <div className="col-md-6"><label className="form-label">Quiet hours</label><input className="form-control" value="Respected — 22:00–07:00 EAT" readOnly /></div>
          <div className="col-12"><label className="form-label">Timezone</label><select className="form-select"><option>Per-user timezone</option><option>EAT (UTC+3) only</option><option>UTC</option></select></div>
        </div>}
        {step === 3 && <div><div className="pm-card pm-card-pad mb-3">
          <div className="pm-eyebrow mb-2">Broadcast Summary</div>
          {[["Name", name || "August product update"], ["Channel", channel], ["Audience", audience], ["Schedule", schedule], ["Compliance", "All checks passing"], ["Quiet hours", "Respected"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b>{x[1]}</b></div>)}
        </div>
        <div className="pm-note"><i className="bi bi-shield-lock me-1" />This broadcast will be queued for approval. Only Platform Admins can approve and send.</div></div>}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={() => step ? setStep(step - 1) : onClose()}>{step ? "← Back" : "Cancel"}</button>{step < 3 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(step + 1)}>Continue →</button> : <button className="btn btn-primary btn-sm" onClick={() => { setStep(0); push({ kind: "success", title: "Broadcast queued for approval" }); onClose(); }}><i className="bi bi-send-check me-1" />Submit for approval</button>}</div>
    </Modal>
  );
}

/* ================================================================
   11. TEMPLATE MANAGER MODAL
   ================================================================ */
export function TemplateManagerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Template Manager" subtitle="Browse, edit and create broadcast templates" icon="bi-files" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Template</th><th>Channel</th><th>Purpose</th><th>Last used</th><th>Status</th></tr></thead><tbody>
          {[["System maintenance", "Push + SMS", "Planned downtime", "Aug 20", "Active"], ["Fee change announcement", "Push + Email", "Fee changes", "Aug 22", "Active"], ["New feature launch", "Push + Email", "Product feature", "Aug 18", "Active"], ["Security advisory", "Push + SMS + Email", "Security threat", "Aug 5", "Active"], ["Emergency outage", "Push + SMS", "Service disruption", "Aug 18", "Active"]].map(t => <tr key={t[0]}>{t.map((c, i) => <td key={i} className={i === 0 ? "pm-td-strong" : ""}>{i === 4 ? <Badge tone="green" dot>{c}</Badge> : c}</td>)}</tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button><button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Template created" }); onClose(); }}><i className="bi bi-plus-circle me-1" />Create template</button></div>
    </Modal>
  );
}

/* ================================================================
   12. UNSUBSCRIBE ANALYSIS MODAL
   ================================================================ */
export function UnsubscribeAnalysisModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Unsubscribe Analysis" subtitle="Opt-out trends and reasons across campaigns" icon="bi-person-dash" tone="amber" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Total opt-outs", "23", "amber"], ["Opt-out rate", "0.02%", "green"], ["Top reason", "Too frequent", "blue"], ["Most affected", "Marketing SMS", "amber"]].map(x => <div className="col-md-3" key={x[1]}><div className="pm-card pm-card-pad text-center"><Badge tone={x[2] as Tone}>{x[0]}</Badge><div className="fw-bold mt-1">{x[1]}</div></div></div>)}</div>
        <h6>Opt-out reasons</h6>
        {[["Too frequent", "42%"], ["Not relevant", "28%"], ["Cost concerns", "18%"], ["Switched provider", "8%"], ["Other", "4%"]].map(r => <div className="d-flex justify-content-between py-1 border-bottom small" key={r[0]}><span>{r[0]}</span><b>{r[1]}</b></div>)}
        <h6 className="mt-3">Recommendations</h6>
        {[["Reduce marketing SMS frequency from 3/week to 1/week", "High"], ["Segment offers by user interest", "Medium"], ["Add preference center in app", "Low"]].map(r => <div className="d-flex justify-content-between py-1 border-bottom small" key={r[0]}><span>{r[0]}</span><Badge tone={r[1] === "High" ? "red" : r[1] === "Medium" ? "amber" : "grey"}>{r[1]}</Badge></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ================================================================
   13. BROADCAST COMPARISON MODAL
   ================================================================ */
export function BroadcastComparisonModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Compare Broadcasts" subtitle="Side-by-side performance of two campaigns" icon="bi-arrows-angle-contract" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-2 mb-3"><div className="col"><select className="form-select"><option>Fee reduction notice</option><option>Maintenance window</option></select></div><div className="col"><select className="form-select"><option>New feature — Savings Goals</option><option>KYC reminder</option></select></div></div>
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Metric</th><th>Campaign A</th><th>Campaign B</th></tr></thead><tbody>
          {[["Channel", "Push + Email", "Push + Email"], ["Audience size", "134,210", "125,863"], ["Delivery rate", "98%", "98%"], ["Open rate", "32%", "31.5%"], ["Click rate", "9.3%", "8.1%"], ["Cost", "KES 268K", "KES 252K"], ["Unsubscribes", "23", "18"]].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 0 ? "pm-td-strong" : ""}>{c}</td>)}</tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ================================================================
   14. QUIET HOURS MODAL
   ================================================================ */
export function BroadcastQuietHoursModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Quiet Hours Rules" subtitle="Global delivery restrictions for non-critical messages" icon="bi-moon-stars" tone="blue">
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3"><Badge tone="green" dot>Active</Badge>
          <h6 className="mt-3">Current rules</h6>
          {[["Window", "22:00 – 07:00 EAT"], ["Emergency override", "Allowed · 2FA required"], ["Transactional", "Allowed · always"], ["Security", "Allowed · always"], ["Marketing", "Blocked"], ["Engagement", "Blocked"], ["Per-user timezone", "Respected where available"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b>{x[1]}</b></div>)}
        </div>
        <label className="form-label">Override start window</label><select className="form-select mb-2"><option>22:00 EAT</option><option>21:00 EAT</option><option>23:00 EAT</option></select>
        <label className="form-label">Override end window</label><select className="form-select"><option>07:00 EAT</option><option>06:00 EAT</option><option>08:00 EAT</option></select>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button><button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Quiet hours updated" }); onClose(); }}>Save changes</button></div>
    </Modal>
  );
}

/* ================================================================
   15. BROADCAST ROI MODAL
   ================================================================ */
export function BroadcastRoiModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Broadcast ROI Analysis" subtitle="Return on investment across all communication channels" icon="bi-graph-up-arrow" tone="violet" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Total spend", "KES 5.1M", "blue"], ["Users reached", "401K", "green"], ["Cost per reach", "KES 12.72", "blue"], ["Engagement rate", "32%", "green"]].map(x => <div className="col-md-3" key={x[1]}><div className="pm-card pm-card-pad text-center"><Badge tone={x[2] as Tone}>{x[0]}</Badge><div className="h5 mt-2 mb-0">{x[1]}</div></div></div>)}</div>
        <h6>Campaign ROI</h6>
        {[["Fee reduction notice", "KES 268K", "134,210", "KES 2.00/reach"], ["Maintenance window", "KES 297K", "148,392", "KES 2.00/reach"], ["Savings Goals", "KES 252K", "125,863", "KES 2.00/reach"], ["KYC reminder", "KES 7K", "3,588", "KES 1.95/reach"], ["Promo discount", "KES 16K", "5,230", "KES 3.06/reach"]].map(r => <div className="d-flex justify-content-between py-1 border-bottom small" key={r[0]}><span className="pm-td-strong">{r[0]}</span><div><span className="text-muted me-2">{r[2]} users</span><b>{r[3]}</b></div></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button><button className="btn btn-primary btn-sm" onClick={onClose}><i className="bi bi-download me-1" />Export ROI report</button></div>
    </Modal>
  );
}

/* ================================================================
   16. AUDIT TRAIL MODAL (NEW)
   ================================================================ */
export function AuditTrailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Broadcast Audit Trail" subtitle="All admin actions on broadcasts, segments and templates" icon="bi-journal-text" tone="ink" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Total actions", "247", "blue"], ["Today", "12", "green"], ["Admins active", "4", "violet"], ["Modifications", "89", "amber"]].map(x => <div className="col-md-3" key={x[1]}><div className="pm-card pm-card-pad text-center"><div className="h5 mb-0">{x[1]}</div><div className="small text-muted">{x[0]}</div></div></div>)}</div>
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Timestamp</th><th>Admin</th><th>Action</th><th>Record</th><th>Details</th></tr></thead><tbody>
          {[["Aug 27, 14:32", "Joseph M.", "Created segment", "High-value dormant", "New filter criteria"], ["Aug 27, 14:28", "Super Admin", "Locked template", "Emergency outage", "Pending legal review"], ["Aug 27, 13:55", "Ops Manager", "Approved broadcast", "Fee reduction notice", "Compliance passed"], ["Aug 27, 13:40", "Compliance", "Modified budget", "SMS channel", "Increased to KES 6M"], ["Aug 27, 12:15", "Joseph M.", "Deleted segment", "Test segment", "Cleanup after testing"], ["Aug 27, 11:00", "Super Admin", "Updated quiet hours", "Global config", "Window: 22:00–07:00"]].map(r => <tr key={r[2]+r[4]}><td className="pm-td-sub">{r[0]}</td><td>{r[1]}</td><td><Badge tone={r[2].includes("Deleted") ? "red" : r[2].includes("Locked") ? "amber" : "green"}>{r[2]}</Badge></td><td className="pm-td-strong">{r[3]}</td><td className="pm-td-sub">{r[4]}</td></tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button><button className="btn btn-primary btn-sm" onClick={onClose}><i className="bi bi-download me-1" />Export audit log</button></div>
    </Modal>
  );
}

/* ================================================================
   17. EXPORT DATA MODAL (NEW — section-by-section)
   ================================================================ */
export function ExportDataModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [selected, setSelected] = useState<string[]>([]);
  const sections = [
    { key: "broadcasts", label: "All Broadcasts", icon: "bi-send", count: "5 records", size: "24 KB" },
    { key: "audiences", label: "All Audience Segments", icon: "bi-people", count: "7 records", size: "18 KB" },
    { key: "templates", label: "All Templates", icon: "bi-files", count: "8 records", size: "12 KB" },
    { key: "budget", label: "Budget Allocations", icon: "bi-wallet2", count: "5 records", size: "8 KB" },
    { key: "history", label: "Delivery History", icon: "bi-clock-history", count: "5 records", size: "32 KB" },
    { key: "analytics", label: "Analytics & ROI Data", icon: "bi-graph-up", count: "Aggregate", size: "45 KB" },
    { key: "audit", label: "Audit Trail Log", icon: "bi-journal-text", count: "247 entries", size: "156 KB" },
    { key: "compliance", label: "Compliance Reports", icon: "bi-shield-check", count: "8 checks", size: "22 KB" },
    { key: "unsubscribe", label: "Unsubscribe Records", icon: "bi-person-dash", count: "23 records", size: "6 KB" },
    { key: "documents", label: "Broadcast Documents", icon: "bi-file-earmark-text", count: "12 files", size: "2.4 MB" },
  ];
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Export Platform Data" subtitle="Download data sections for external audit and compliance" icon="bi-download" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="pm-note mb-3"><i className="bi bi-shield-lock me-1" />Exports include timestamp, admin identity and are audit-logged. Data is encrypted at rest.</div>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <label className="form-label mb-0"><input type="checkbox" className="form-check-input me-2" checked={selected.length === sections.length} onChange={e => setSelected(e.target.checked ? sections.map(s => s.key) : [])} />Select all</label>
          <span className="small text-muted">{selected.length} of {sections.length} selected</span>
        </div>
        <div className="export-panel">
          {sections.map(s => (
            <div key={s.key} className="export-item" onClick={() => setSelected(p => p.includes(s.key) ? p.filter(x => x !== s.key) : [...p, s.key])} style={{ cursor: "pointer" }}>
              <div className="d-flex align-items-center gap-2">
                <input type="checkbox" className="form-check-input" checked={selected.includes(s.key)} readOnly />
                <i className={`bi ${s.icon} text-primary`} />
                <div><div className="pm-td-strong">{s.label}</div><div className="small text-muted">{s.count}</div></div>
              </div>
              <div className="d-flex align-items-center gap-2"><span className="small text-muted">{s.size}</span><Badge tone="grey">CSV</Badge></div>
            </div>
          ))}
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button><button className="btn btn-primary btn-sm" disabled={selected.length === 0} onClick={() => { push({ kind: "success", title: `Exporting ${selected.length} sections...` }); onClose(); }}><i className="bi bi-download me-1" />Download selected ({selected.length})</button></div>
    </Modal>
  );
}

/* ================================================================
   18. DOCUMENT PREVIEW MODAL (NEW)
   ================================================================ */
export function BroadcastDocumentPreviewModal({ doc, open, onClose }: { doc: { title: string; content: string; type: string; author: string; lastUpdated: string; version?: string; status?: string } | null; open: boolean; onClose: () => void }) {
  if (!open || !doc) return null;
  const rendered = doc.content.replace(/\{\{(\w+)\}\}/g, (_: string, key: string) => `<span class="doc-var">{{${key}}}</span>`);
  return (
    <Modal open onClose={onClose} title={`${doc.title} — Preview`} subtitle={`${doc.version || "v1.0"} · Document preview`} icon="bi-eye" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="doc-preview-toolbar">
          <div className="d-flex gap-2 align-items-center">
            <Badge tone={doc.status === "Active" ? "green" : "blue"}>{doc.status || "Active"}</Badge>
            {doc.version && <span className="pm-td-sub">{doc.version}</span>}
          </div>
          <div className="d-flex gap-1">
            <button className="btn btn-sm btn-outline-secondary"><i className="bi bi-printer me-1" />Print</button>
            <button className="btn btn-sm btn-outline-primary"><i className="bi bi-download me-1" />Download</button>
          </div>
        </div>
        <div className="doc-preview-page">
          <div className="doc-preview-letterhead">
            <div className="doc-preview-logo">P</div>
            <div>
              <div className="doc-preview-company">PayMo Digital Bank Ltd</div>
              <div className="doc-preview-address">Westlands, Nairobi · PVT-2024-184732</div>
            </div>
          </div>
          <div className="doc-preview-meta">
            <span className="doc-preview-meta-item"><i className="bi bi-file-earmark-text me-1" />{doc.type}</span>
            <span className="doc-preview-meta-item"><i className="bi bi-person me-1" />{doc.author}</span>
            <span className="doc-preview-meta-item"><i className="bi bi-calendar me-1" />{doc.lastUpdated}</span>
          </div>
          <hr className="doc-preview-divider" />
          <div className="doc-preview-body" style={{ whiteSpace: "pre-wrap", fontFamily: "'Inter', system-ui, sans-serif", fontSize: ".82rem", lineHeight: 1.6, color: "#101828" }} dangerouslySetInnerHTML={{ __html: rendered.replace(/\n/g, "<br/>") }} />
        </div>
        <div className="pm-note mt-3"><i className="bi bi-info-circle me-1" />Variables in <span className="doc-var">green</span> are template placeholders replaced with live data.</div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button><button className="btn btn-primary btn-sm" onClick={onClose}><i className="bi bi-download me-1" />Download PDF</button></div>
    </Modal>
  );
}

/* ================================================================
   19. CREATE DOCUMENT WIZARD (NEW — 5-step)
   ================================================================ */
export function CreateDocumentWizard({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (doc: any) => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [docType, setDocType] = useState("broadcast-agreement");
  const [title, setTitle] = useState("");
  const [recipient, setRecipient] = useState("");
  const [body, setBody] = useState("");
  if (!open) return null;
  return (
    <Modal open onClose={() => { setStep(0); onClose(); }} title="Create Broadcast Document" subtitle={`Step ${step + 1} of 5: ${["Type", "Details", "Content", "Review", "Confirm"][step]}`} icon="bi-file-earmark-plus" tone="green" size="lg">
      <Steps current={step} steps={[{ label: "Type", icon: "bi-tag" }, { label: "Details", icon: "bi-person" }, { label: "Content", icon: "bi-pencil" }, { label: "Review", icon: "bi-eye" }, { label: "Confirm", icon: "bi-check2" }]} />
      <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 20}%` }} /></div>
      <div className="pm-modal-body">
        {step === 0 && <div className="d-flex flex-column gap-2">
          <div className="pm-eyebrow mb-1">Select document type</div>
          {[["broadcast-agreement", "Broadcast Content Agreement", "bi-file-earmark-text", "blue"], ["delivery-sla", "Delivery SLA Document", "bi-file-earmark-check", "green"], ["compliance-cert", "Compliance Certificate", "bi-shield-check", "violet"], ["channel-contract", "Channel Provider Contract", "bi-file-earmark-pdf", "red"], ["approval-policy", "Approval Policy Document", "bi-file-earmark-ruled", "amber"]].map(([k, l, ic, tn]) => (
            <button key={k} className={`pm-opt d-flex align-items-center gap-2 ${docType === k ? "active" : ""}`} onClick={() => setDocType(k)} style={{ padding: ".75rem 1rem", border: "1px solid var(--pm-border)", borderRadius: 12, background: docType === k ? "var(--bs-primary-bg-subtle)" : "#fff", cursor: "pointer", textAlign: "left", borderColor: docType === k ? "var(--bs-primary)" : undefined }}>
              <i className={`bi ${ic} text-${tn}`} /><div><div className="pm-td-strong">{l}</div></div>
            </button>
          ))}
        </div>}
        {step === 1 && <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Document title</label><input className="form-control" placeholder="e.g. Q3 Broadcast SLA" value={title} onChange={e => setTitle(e.target.value)} /></div>
          <div className="col-md-6"><label className="form-label">Recipient / Owner</label><input className="form-control" placeholder="e.g. Operations Team" value={recipient} onChange={e => setRecipient(e.target.value)} /></div>
          <div className="col-md-6"><label className="form-label">Version</label><input className="form-control" defaultValue="v1.0" /></div>
          <div className="col-md-6"><label className="form-label">Classification</label><select className="form-select"><option>Internal</option><option>Confidential</option><option>Public</option></select></div>
        </div>}
        {step === 2 && <div className="row g-3">
          <div className="col-12"><label className="form-label">Document body</label><textarea className="form-control" rows={8} placeholder="Enter document content. Use {{name}}, {{date}}, {{channel}} for template variables." value={body} onChange={e => setBody(e.target.value)} style={{ fontFamily: "'Inter', system-ui, sans-serif" }} /></div>
          <div className="col-12"><div className="pm-note"><i className="bi bi-info-circle me-1" />Supports template variables: {'{{name}}'}, {'{{date}}'}, {'{{channel}}'}, {'{{audience}}'}, {'{{amount}}'}</div></div>
        </div>}
        {step === 3 && <div>
          <div className="pm-card pm-card-pad mb-3"><div className="pm-eyebrow mb-2">Document Preview</div>
            {[["Title", title || "Untitled"], ["Type", docType], ["Recipient", recipient || "—"], ["Version", "v1.0"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b>{x[1]}</b></div>)}
          </div>
          <div className="doc-preview-page" style={{ maxHeight: 250 }}>
            <div className="doc-preview-letterhead"><div className="doc-preview-logo">P</div><div><div className="doc-preview-company">PayMo Digital Bank Ltd</div><div className="doc-preview-address">Westlands, Nairobi</div></div></div>
            <hr className="doc-preview-divider" />
            <div className="doc-preview-body" style={{ whiteSpace: "pre-wrap", fontSize: ".82rem" }}>{body || "No content yet..."}</div>
          </div>
        </div>}
        {step === 4 && <div className="pm-card pm-card-pad">
          <div className="pm-eyebrow mb-2">Final Review</div>
          {[["Document", title || "Untitled"], ["Type", docType], ["Recipient", recipient || "—"], ["Classification", "Internal"], ["Status", "Pending approval"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b>{x[1]}</b></div>)}
          <div className="pm-note mt-3"><i className="bi bi-shield-lock me-1" />Document will be created and logged in the audit trail.</div>
        </div>}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={() => step ? setStep(step - 1) : onClose()}>{step ? "← Back" : "Cancel"}</button>{step < 4 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(step + 1)}>Continue →</button> : <button className="btn btn-success btn-sm" onClick={() => { onCreated({ title, type: docType, recipient, body }); setStep(0); push({ kind: "success", title: "Document created" }); onClose(); }}><i className="bi bi-check2 me-1" />Create document</button>}</div>
    </Modal>
  );
}

/* ================================================================
   20. EMERGENCY BROADCAST WIZARD (NEW — 4-step)
   ================================================================ */
export function EmergencyBroadcastWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [severity, setSeverity] = useState("critical");
  const [channel, setChannel] = useState("All channels");
  const [confirmed, setConfirmed] = useState(false);
  if (!open) return null;
  return (
    <Modal open onClose={() => { setStep(0); onClose(); }} title="Emergency Broadcast" subtitle={`Step ${step + 1} of 4: ${["Severity", "Channel & Audience", "Message", "Confirm"][step]}`} icon="bi-exclamation-diamond-fill" tone="red" size="lg">
      <Steps current={step} steps={[{ label: "Severity", icon: "bi-exclamation-triangle" }, { label: "Channel", icon: "bi-broadcast" }, { label: "Message", icon: "bi-pencil" }, { label: "Confirm", icon: "bi-shield-lock" }]} />
      <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 25}%` }} /></div>
      <div className="pm-modal-body">
        {step === 0 && <div>
          <div className="pm-note mb-3" style={{ borderLeft: "3px solid var(--pm-danger)", background: "var(--pm-danger-soft)" }}>
            <div className="pm-td-strong" style={{ color: "var(--pm-danger)" }}><i className="bi bi-exclamation-triangle me-1" />Emergency broadcasts bypass quiet hours and consent filters</div>
          </div>
          <div className="pm-eyebrow mb-1">Severity level</div>
          {[["critical", "Critical — All users immediately", "bi-exclamation-octagon-fill", "red"], ["high", "High — All active users", "bi-exclamation-triangle-fill", "amber"], ["medium", "Medium — Affected segment only", "bi-info-circle-fill", "blue"]].map(([k, l, ic, tn]) => (
            <button key={k} className={`d-flex align-items-center gap-2 w-100 mb-2`} style={{ padding: ".75rem 1rem", border: `1px solid ${severity === k ? `var(--bs-${tn})` : "var(--pm-border)"}`, borderRadius: 12, background: severity === k ? `var(--bs-${tn}-bg-subtle, #fff)` : "#fff", cursor: "pointer", textAlign: "left" }} onClick={() => setSeverity(k)}>
              <i className={`bi ${ic} text-${tn}`} /><div className="pm-td-strong">{l}</div>
            </button>
          ))}
        </div>}
        {step === 1 && <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Delivery channel</label><select className="form-select" value={channel} onChange={e => setChannel(e.target.value)}><option>All channels</option><option>Push only</option><option>SMS only</option><option>Push + SMS</option></select></div>
          <div className="col-md-6"><label className="form-label">Audience</label><select className="form-select"><option>All users (148,392)</option><option>All active (134,210)</option></select></div>
          <div className="col-12"><div className="pm-note"><i className="bi bi-exclamation-triangle me-1" />Emergency broadcasts override DND, quiet hours and consent restrictions.</div></div>
        </div>}
        {step === 2 && <div className="row g-3">
          <div className="col-12"><label className="form-label">Emergency message</label><textarea className="form-control" rows={4} placeholder="URGENT: Describe the emergency situation and required actions..." style={{ borderColor: "var(--pm-danger)" }} /></div>
          <div className="col-12"><label className="form-label">Internal notes</label><textarea className="form-control" rows={2} placeholder="Internal context for audit trail..." /></div>
        </div>}
        {step === 3 && <div>
          <div className="pm-note mb-3" style={{ borderLeft: "3px solid var(--pm-danger)", background: "var(--pm-danger-soft)" }}>
            <div className="pm-td-strong" style={{ color: "var(--pm-danger)" }}><i className="bi bi-shield-lock me-1" />This action requires explicit confirmation</div>
          </div>
          {[["Severity", severity.toUpperCase()], ["Channel", channel], ["Audience", "All users (148,392)"], ["Quiet hours", "OVERRIDDEN"], ["Consent", "OVERRIDDEN"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b style={{ color: x[1] === "OVERRIDDEN" ? "var(--pm-danger)" : undefined }}>{x[1]}</b></div>)}
          <div className="form-check mt-3"><input className="form-check-input" type="checkbox" id="emerg-confirm" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} /><label className="form-check-label small" htmlFor="emerg-confirm">I confirm this emergency broadcast is authorized and necessary</label></div>
        </div>}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={() => step ? setStep(step - 1) : onClose()}>{step ? "← Back" : "Cancel"}</button>{step < 3 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(step + 1)}>Continue →</button> : <button className="btn btn-danger btn-sm" disabled={!confirmed} onClick={() => { setStep(0); setConfirmed(false); push({ kind: "success", title: "Emergency broadcast sent" }); onClose(); }}><i className="bi bi-send-exclamation me-1" />Send emergency broadcast</button>}</div>
    </Modal>
  );
}

/* ================================================================
   21. A/B TEST WIZARD (NEW — 5-step)
   ================================================================ */
export function ABTestWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  if (!open) return null;
  return (
    <Modal open onClose={() => { setStep(0); onClose(); }} title="A/B Test Campaign" subtitle={`Step ${step + 1} of 5: ${["Setup", "Variant A", "Variant B", "Split", "Review"][step]}`} icon="bi-split-cells" tone="violet" size="lg">
      <Steps current={step} steps={[{ label: "Setup", icon: "bi-gear" }, { label: "Variant A", icon: "bi-a-circle" }, { label: "Variant B", icon: "bi-b-circle" }, { label: "Split", icon: "bi-bar-chart" }, { label: "Review", icon: "bi-check2" }]} />
      <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 20}%` }} /></div>
      <div className="pm-modal-body">
        {step === 0 && <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Test name</label><input className="form-control" placeholder="e.g. Subject line test Q3" /></div>
          <div className="col-md-6"><label className="form-label">Channel</label><select className="form-select"><option>Push + Email</option><option>SMS</option><option>Push only</option></select></div>
          <div className="col-md-6"><label className="form-label">Audience segment</label><select className="form-select"><option>All active users · 134,210</option><option>VIP clients · 347</option></select></div>
          <div className="col-md-6"><label className="form-label">Primary metric</label><select className="form-select"><option>Open rate</option><option>Click rate</option><option>Conversion rate</option></select></div>
        </div>}
        {step === 1 && <div className="ab-variant variant-a">
          <div className="pm-eyebrow mb-1">Variant A — Control</div>
          <label className="form-label">Subject line / message</label><input className="form-control mb-2" placeholder="e.g. Discover what's new in PayMo" />
          <label className="form-label">CTA text</label><input className="form-control" placeholder="e.g. Learn more" />
        </div>}
        {step === 2 && <div className="ab-variant variant-b">
          <div className="pm-eyebrow mb-1">Variant B — Challenger</div>
          <label className="form-label">Subject line / message</label><input className="form-control mb-2" placeholder="e.g. Your PayMo update is here" />
          <label className="form-label">CTA text</label><input className="form-control" placeholder="e.g. See what's new" />
        </div>}
        {step === 3 && <div className="row g-3">
          <div className="col-12"><label className="form-label">Traffic split</label><div className="d-flex gap-3 align-items-center"><span className="small">A: 50%</span><div className="flex-grow-1"><input className="form-range" type="range" min={10} max={90} defaultValue={50} /></div><span className="small">B: 50%</span></div></div>
          <div className="col-md-6"><label className="form-label">Test duration</label><select className="form-select"><option>24 hours</option><option>48 hours</option><option>72 hours</option><option>1 week</option></select></div>
          <div className="col-md-6"><label className="form-label">Min. sample size</label><input className="form-control" defaultValue="10,000" /></div>
          <div className="col-12"><div className="pm-note"><i className="bi bi-info-circle me-1" />Test will auto-stop when statistical significance (p &lt; 0.05) is reached or duration expires.</div></div>
        </div>}
        {step === 4 && <div className="pm-card pm-card-pad">
          <div className="pm-eyebrow mb-2">A/B Test Summary</div>
          {[["Channel", "Push + Email"], ["Audience", "All active users"], ["Split", "50/50"], ["Duration", "24 hours"], ["Primary metric", "Open rate"], ["Auto-select winner", "Yes"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b>{x[1]}</b></div>)}
        </div>}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={() => step ? setStep(step - 1) : onClose()}>{step ? "← Back" : "Cancel"}</button>{step < 4 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(step + 1)}>Continue →</button> : <button className="btn btn-violet btn-sm" style={{ background: "#5925dc", color: "#fff" }} onClick={() => { setStep(0); push({ kind: "success", title: "A/B test created" }); onClose(); }}><i className="bi bi-split-cells me-1" />Launch test</button>}</div>
    </Modal>
  );
}

/* ================================================================
   22. BROADCAST SCHEDULE MANAGER (NEW)
   ================================================================ */
export function BroadcastScheduleManagerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Schedule Manager" subtitle="View and manage all pending scheduled broadcasts" icon="bi-calendar3" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Upcoming", "3", "blue"], ["This week", "5", "green"], ["This month", "12", "violet"], ["Cancelled", "1", "red"]].map(x => <div className="col-md-3" key={x[1]}><div className="pm-card pm-card-pad text-center"><div className="h5 mb-0">{x[1]}</div><div className="small text-muted">{x[0]}</div></div></div>)}</div>
        <div className="pm-eyebrow mb-2">Upcoming broadcasts</div>
        {[["Aug 28, 09:00", "VIP rewards update", "Push + Email", "VIP clients", "Pending approval", "amber"], ["Aug 29, 14:00", "Security patch notice", "Push + SMS", "All active", "Approved", "green"], ["Sep 1, 10:00", "September promo", "Push + WhatsApp", "Dormant 30d+", "Draft", "grey"]].map(r => (
          <div key={r[1]} className="scheduled-card">
            <div><div className="d-flex gap-2 align-items-center mb-1"><Badge tone={r[5] as Tone}>{r[4]}</Badge><span className="small text-muted">{r[0]}</span></div><div className="pm-td-strong">{r[1]}</div><div className="small text-muted">{r[2]} · {r[3]}</div></div>
            <div className="d-flex gap-1"><button className="btn btn-sm btn-outline-primary" onClick={() => push({ kind: "success", title: "Broadcast edited" })}><i className="bi bi-pencil-square" /></button><button className="btn btn-sm btn-outline-danger" onClick={() => push({ kind: "success", title: "Broadcast cancelled" })}><i className="bi bi-x-circle" /></button></div>
          </div>
        ))}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button><button className="btn btn-primary btn-sm" onClick={onClose}><i className="bi bi-plus-circle me-1" />Schedule broadcast</button></div>
    </Modal>
  );
}

/* ================================================================
   23. DELIVERY REPORT MODAL (NEW)
   ================================================================ */
export function DeliveryReportModal({ open, broadcastName, onClose }: { open: boolean; broadcastName: string; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`${broadcastName} — Delivery Report`} subtitle="Channel-by-channel delivery breakdown" icon="bi-truck" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Total sent", "134,210", "blue"], ["Delivered", "131,526", "green"], ["Failed", "2,684", "red"], ["Bounced", "891", "amber"]].map(x => <div className="col-md-3" key={x[1]}><div className="pm-card pm-card-pad text-center"><div className="h5 mb-0">{x[1]}</div><div className="small text-muted">{x[0]}</div></div></div>)}</div>
        <h6>Channel breakdown</h6>
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Channel</th><th>Sent</th><th>Delivered</th><th>Failed</th><th>Rate</th></tr></thead><tbody>
          {[["Push", "134,210", "131,788", "422", "98.2%"], ["Email", "134,210", "131,526", "684", "98.0%"], ["SMS", "45,200", "44,522", "678", "98.5%"]].map(r => <tr key={r[0]}><td className="pm-td-strong">{r[0]}</td><td className="pm-num">{r[1]}</td><td className="pm-num">{r[2]}</td><td className="pm-num text-danger">{r[3]}</td><td><Badge tone="green">{r[4]}</Badge></td></tr>)}
        </tbody></table></div>
        <h6 className="mt-3">Failure reasons</h6>
        {[["Invalid token", "1,200 (44.7%)"], ["User unsubscribed", "891 (33.2%)"], ["Server timeout", "345 (12.8%)"], ["Rate limited", "248 (9.2%)"]].map(r => <div className="d-flex justify-content-between py-1 border-bottom small" key={r[0]}><span>{r[0]}</span><b>{r[1]}</b></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button><button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Report exported" }); onClose(); }}><i className="bi bi-download me-1" />Export report</button></div>
    </Modal>
  );
}

/* ================================================================
   24. CHANNEL CONFIGURATION MODAL (NEW)
   ================================================================ */
export function ChannelConfigModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Channel Configuration" subtitle="Manage provider settings, sender IDs and rate limits per channel" icon="bi-sliders" tone="blue" size="lg">
      <div className="pm-modal-body">          {([ ["SMS", "Africa's Talking", "PAYMO", "100 msg/s", "green", true], ["Email", "SendGrid", "noreply@paymo.co.ke", "500/min", "green", true], ["WhatsApp", "Meta Business API", "PayMo Official", "80 msg/s", "green", true], ["Push", "Firebase FCM", "—", "Unlimited", "green", true], ["In-app", "Internal", "—", "Unlimited", "amber", false] ] as [string, string, string, string, string, boolean][]).map(ch => (
          <div key={ch[0]} className="pm-card pm-card-pad mb-2">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div><div className="pm-td-strong">{ch[0]}</div><div className="small text-muted">Provider: {ch[1]}</div></div>
              <Badge tone={ch[4] as Tone}>{ch[5] ? "Active" : "Disabled"}</Badge>
            </div>
            <div className="row g-2">
              <div className="col-md-4"><div className="pm-eyebrow">Sender ID</div><div className="small">{ch[2]}</div></div>
              <div className="col-md-4"><div className="pm-eyebrow">Rate limit</div><div className="small">{ch[3]}</div></div>
              <div className="col-md-4"><div className="pm-eyebrow">Actions</div><button className="btn btn-sm btn-outline-primary" onClick={() => push({ kind: "success", title: `${ch[0]} config opened` })}><i className="bi bi-pencil-square me-1" />Configure</button></div>
            </div>
          </div>
        ))}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button><button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Channel settings saved" }); onClose(); }}>Save changes</button></div>
    </Modal>
  );
}

/* ================================================================
   25. COMPLIANCE REPORT MODAL (NEW)
   ================================================================ */
export function ComplianceReportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Compliance Report" subtitle="Regulatory compliance status for all broadcast activities" icon="bi-shield-check" tone="green" size="lg">
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3 text-center"><i className="bi bi-patch-check-fill text-success" style={{ fontSize: 48 }} /><h6 className="mt-2">Compliant</h6><p className="small text-muted">All 12 compliance checks passed. Last audit: Aug 26, 2026.</p></div>
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Check</th><th>Status</th><th>Last verified</th><th>Next audit</th></tr></thead><tbody>
          {[["GDPR consent filtering", "Passed", "Aug 26", "Sep 26"], ["Kenya Data Protection Act", "Passed", "Aug 26", "Sep 26"], ["CBK financial comm. rules", "Passed", "Aug 25", "Nov 25"], ["Opt-out mechanism", "Passed", "Aug 26", "Sep 26"], ["Sender identification", "Passed", "Aug 26", "Sep 26"], ["Quiet hours compliance", "Passed", "Aug 26", "Sep 26"], ["Marketing frequency cap", "Passed", "Aug 24", "Sep 24"], ["Data retention policy", "Passed", "Aug 26", "Oct 26"], ["Emergency broadcast auth", "Passed", "Aug 20", "Sep 20"], ["Cross-border transfer", "Passed", "Aug 18", "Nov 18"], ["Children data protection", "Passed", "Aug 15", "Feb 17"], ["Record keeping", "Passed", "Aug 26", "Sep 26"]].map(r => <tr key={r[0]}><td className="pm-td-strong">{r[0]}</td><td><Badge tone="green" dot>{r[1]}</Badge></td><td className="pm-td-sub">{r[2]}</td><td className="pm-td-sub">{r[3]}</td></tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button><button className="btn btn-primary btn-sm" onClick={onClose}><i className="bi bi-download me-1" />Export compliance report</button></div>
    </Modal>
  );
}

/* ================================================================
   26. SEGMENT OVERLAP MODAL (NEW)
   ================================================================ */
export function SegmentOverlapModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Segment Overlap Analysis" subtitle="Identify audience overlap between segments" icon="bi-intersect" tone="violet" size="lg">
      <div className="pm-modal-body">
        <div className="pm-eyebrow mb-2">Overlap matrix</div>
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th></th><th>All active</th><th>VIP</th><th>New 7d</th><th>Dormant</th><th>Business</th></tr></thead><tbody>
          {[["All active", "134,210", "347", "3,200", "0", "8,900"], ["VIP", "347", "347", "0", "0", "89"], ["New 7d", "3,200", "0", "3,200", "0", "120"], ["Dormant", "0", "0", "0", "8,450", "340"], ["Business", "8,900", "89", "120", "340", "8,900"]].map(r => <tr key={r[0]}><td className="pm-td-strong">{r[0]}</td>{r.slice(1).map((c, i) => <td key={i} className="pm-num" style={{ background: i > 0 && r[0] !== ["All active", "VIP", "New 7d", "Dormant", "Business"][i] && parseInt(c.replace(/,/g, "")) > 0 ? "#f4f1ff" : undefined }}>{c}</td>)}</tr>)}
        </tbody></table></div>
        <div className="pm-note mt-2"><i className="bi bi-info-circle me-1" />Purple cells indicate cross-segment overlap. Users in overlapping segments will only receive one message per campaign.</div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ================================================================
   27. BROADCAST VERSION HISTORY (NEW)
   ================================================================ */
export function BroadcastVersionHistoryModal({ open, broadcastName, onClose }: { open: boolean; broadcastName: string; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`${broadcastName} — Version History`} subtitle="All changes tracked with admin attribution" icon="bi-clock-history" tone="ink" size="lg">
      <div className="pm-modal-body">
        <div className="broadcast-timeline">
          {[["Aug 22, 14:05", "Sent to audience — Final version"], ["Aug 22, 14:00", "Platform Admin approved — v3"], ["Aug 22, 13:50", "Joseph M. — Updated message body, fixed {{name}} tag"], ["Aug 22, 13:30", "Compliance — Minor wording adjustment for regulatory compliance"], ["Aug 22, 12:00", "Joseph M. — Draft created with Push + Email channel"], ["Aug 22, 11:00", "Product Lead — Initial request submitted"]].map(a => <div key={a[0]}><span>{a[0]}</span><b>{a[1]}</b></div>)}
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ================================================================
   28. BULK OPERATIONS MODAL (NEW — 4-step)
   ================================================================ */
export function BulkOperationsWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [op, setOp] = useState("clone");
  const [selected, setSelected] = useState<string[]>([]);
  if (!open) return null;
  return (
    <Modal open onClose={() => { setStep(0); onClose(); }} title="Bulk Operations" subtitle={`Step ${step + 1} of 4: ${["Select operation", "Select records", "Configure", "Confirm"][step]}`} icon="bi-layers" tone="blue" size="lg">
      <Steps current={step} steps={[{ label: "Operation", icon: "bi-gear" }, { label: "Records", icon: "bi-list-check" }, { label: "Configure", icon: "bi-sliders" }, { label: "Confirm", icon: "bi-check2" }]} />
      <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 25}%` }} /></div>
      <div className="pm-modal-body">
        {step === 0 && <div className="d-flex flex-column gap-2">
          {[["clone", "Clone broadcasts", "bi-clipboard-plus", "blue"], ["archive", "Archive old broadcasts", "bi-archive", "amber"], ["export", "Bulk export selected", "bi-download", "green"], ["delete", "Bulk delete drafts", "bi-trash3", "red"]].map(([k, l, ic, tn]) => (
            <button key={k} className="d-flex align-items-center gap-2 w-100 mb-2" style={{ padding: ".75rem 1rem", border: `1px solid ${op === k ? `var(--bs-${tn})` : "var(--pm-border)"}`, borderRadius: 12, background: op === k ? "var(--bs-primary-bg-subtle)" : "#fff", cursor: "pointer", textAlign: "left", borderColor: op === k ? `var(--bs-${tn})` : undefined }} onClick={() => setOp(k)}>
              <i className={`bi ${ic} text-${tn}`} /><div className="pm-td-strong">{l}</div>
            </button>
          ))}
        </div>}
        {step === 1 && <div>
          <div className="pm-eyebrow mb-2">Select records</div>
          {[["bc-001", "Fee reduction notice", "Sent"], ["bc-002", "Maintenance window", "Sent"], ["bc-003", "New feature — Savings Goals", "Sent"], ["bc-004", "KYC reminder", "Sent"], ["bc-005", "Promo — fee discount weekend", "Sent"]].map(b => (
            <div key={b[0]} className="d-flex align-items-center gap-2 mb-2" style={{ padding: ".6rem .75rem", border: "1px solid var(--pm-border)", borderRadius: 10, background: "#fff", cursor: "pointer" }} onClick={() => setSelected(p => p.includes(b[0]) ? p.filter(x => x !== b[0]) : [...p, b[0]])}>
              <input type="checkbox" className="form-check-input" checked={selected.includes(b[0])} readOnly />
              <div className="pm-td-strong">{b[1]}</div><Badge tone="green">{b[2]}</Badge>
            </div>
          ))}
        </div>}
        {step === 2 && <div className="row g-3">
          {op === "clone" && <><div className="col-12"><label className="form-label">Clone suffix</label><input className="form-control" placeholder="e.g. - copy" /></div><div className="col-12"><label className="form-label">Clone status</label><select className="form-select"><option>Draft</option><option>Pending approval</option></select></div></>}
          {op === "archive" && <div className="col-12"><label className="form-label">Archive reason</label><textarea className="form-control" rows={2} placeholder="e.g. Campaign completed, end of quarter..." /></div>}
          {op === "export" && <div className="col-12"><label className="form-label">Export format</label><select className="form-select"><option>CSV</option><option>Excel (XLSX)</option><option>JSON</option></select></div>}
          {op === "delete" && <div className="col-12"><div className="pm-note" style={{ borderLeft: "3px solid var(--pm-danger)", background: "var(--pm-danger-soft)" }}><i className="bi bi-exclamation-triangle me-1" />This will permanently delete {selected.length} records. This action cannot be undone.</div></div>}
        </div>}
        {step === 3 && <div className="pm-card pm-card-pad">
          <div className="pm-eyebrow mb-2">Operation Summary</div>
          {[["Operation", op.charAt(0).toUpperCase() + op.slice(1)], ["Records", `${selected.length} selected`], ["Admin", "Super Admin"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b>{x[1]}</b></div>)}
        </div>}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={() => step ? setStep(step - 1) : onClose()}>{step ? "← Back" : "Cancel"}</button>{step < 3 ? <button className="btn btn-primary btn-sm" disabled={step === 1 && selected.length === 0} onClick={() => setStep(step + 1)}>Continue →</button> : <button className="btn btn-primary btn-sm" onClick={() => { setStep(0); setSelected([]); push({ kind: "success", title: "Bulk operation completed" }); onClose(); }}><i className="bi bi-check2 me-1" />Execute</button>}</div>
    </Modal>
  );
}

/* ================================================================
   29. CAMPAIGN CLONE WIZARD (NEW — 4-step)
   ================================================================ */
export function CampaignCloneWizard({ open, sourceCampaign, onClose }: { open: boolean; sourceCampaign: string; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  if (!open) return null;
  return (
    <Modal open onClose={() => { setStep(0); onClose(); }} title="Clone Campaign" subtitle={`Step ${step + 1} of 4: ${["Source", "Modifications", "Schedule", "Review"][step]}`} icon="bi-clipboard-plus" tone="blue" size="lg">
      <Steps current={step} steps={[{ label: "Source", icon: "bi-file-earmark" }, { label: "Modify", icon: "bi-pencil" }, { label: "Schedule", icon: "bi-calendar3" }, { label: "Review", icon: "bi-check2" }]} />
      <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 25}%` }} /></div>
      <div className="pm-modal-body">
        {step === 0 && <div className="pm-card pm-card-pad"><div className="pm-eyebrow mb-1">Source campaign</div><div className="pm-td-strong">{sourceCampaign}</div><div className="small text-muted mt-1">Channel: Push + Email · Audience: All active (134,210)</div></div>}
        {step === 1 && <div className="row g-3">
          <div className="col-md-6"><label className="form-label">New name</label><input className="form-control" defaultValue={`${sourceCampaign} — Copy`} /></div>
          <div className="col-md-6"><label className="form-label">Channel</label><select className="form-select"><option>Push + Email (same)</option><option>Push + SMS</option><option>Multi-channel</option></select></div>
          <div className="col-md-6"><label className="form-label">Audience</label><select className="form-select"><option>Same as source</option><option>All active users</option><option>VIP clients</option></select></div>
          <div className="col-12"><label className="form-label">Message body</label><textarea className="form-control" rows={3} defaultValue="Hello {{name}}, discover what's new in PayMo this month. Learn more in the app." /></div>
        </div>}
        {step === 2 && <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Send time</label><select className="form-select"><option>Immediately after approval</option><option>Tomorrow 09:00 EAT</option><option>Custom schedule</option></select></div>
          <div className="col-md-6"><label className="form-label">Status</label><select className="form-select"><option>Draft</option><option>Submit for approval</option></select></div>
        </div>}
        {step === 3 && <div className="pm-card pm-card-pad">
          <div className="pm-eyebrow mb-2">Clone Summary</div>
          {[["Source", sourceCampaign], ["New name", `${sourceCampaign} — Copy`], ["Channel", "Push + Email"], ["Status", "Draft"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b>{x[1]}</b></div>)}
        </div>}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={() => step ? setStep(step - 1) : onClose()}>{step ? "← Back" : "Cancel"}</button>{step < 3 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(step + 1)}>Continue →</button> : <button className="btn btn-primary btn-sm" onClick={() => { setStep(0); push({ kind: "success", title: "Campaign cloned" }); onClose(); }}><i className="bi bi-clipboard-plus me-1" />Create clone</button>}</div>
    </Modal>
  );
}

/* ================================================================
   30. CREATE SEGMENT WIZARD (NEW — 4-step)
   ================================================================ */
export function CreateSegmentWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  if (!open) return null;
  return (
    <Modal open onClose={() => { setStep(0); onClose(); }} title="Create Audience Segment" subtitle={`Step ${step + 1} of 4: ${["Base", "Filters", "Consent", "Review"][step]}`} icon="bi-people" tone="blue" size="lg">
      <Steps current={step} steps={[{ label: "Base", icon: "bi-people" }, { label: "Filters", icon: "bi-funnel" }, { label: "Consent", icon: "bi-shield-check" }, { label: "Review", icon: "bi-check2" }]} />
      <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 25}%` }} /></div>
      <div className="pm-modal-body">
        {step === 0 && <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Segment name</label><input className="form-control" placeholder="e.g. High-value Nairobi users" /></div>
          <div className="col-md-6"><label className="form-label">Base population</label><select className="form-select"><option>All users · 148,392</option><option>All active · 134,210</option><option>Business accounts · 8,900</option></select></div>
        </div>}
        {step === 1 && <div className="row g-3">
          <div className="col-md-4"><label className="form-label">Balance</label><select className="form-select"><option>Any</option><option>{'>'} KES 10K</option><option>{'>'} KES 100K</option><option>{'>'} KES 1M</option></select></div>
          <div className="col-md-4"><label className="form-label">Last active</label><select className="form-select"><option>Any</option><option>{'<'} 7 days</option><option>{'<'} 30 days</option><option>{'>'} 30 days</option></select></div>
          <div className="col-md-4"><label className="form-label">County</label><select className="form-select"><option>Any</option><option>Nairobi</option><option>Mombasa</option><option>Kisumu</option><option>Nakuru</option></select></div>
          <div className="col-md-4"><label className="form-label">Account type</label><select className="form-select"><option>Any</option><option>Individual</option><option>Business</option></select></div>
          <div className="col-md-4"><label className="form-label">KYC status</label><select className="form-select"><option>Any</option><option>Verified</option><option>Pending</option><option>Not started</option></select></div>
          <div className="col-md-4"><label className="form-label">Registration date</label><select className="form-select"><option>Any</option><option>Last 7 days</option><option>Last 30 days</option><option>90+ days ago</option></select></div>
        </div>}
        {step === 2 && <div>
          <div className="pm-eyebrow mb-2">Consent requirements</div>
          {([ ["push", "Push notifications opted-in", true], ["email", "Email opted-in", true], ["sms", "SMS opted-in (not on DND)", true], ["whatsapp", "WhatsApp opted-in", false] ] as [string, string, boolean][]).map(([k, l, def]) => (
            <div key={k} className="form-check mb-2"><input className="form-check-input" type="checkbox" id={`seg-${k}`} defaultChecked={def as boolean} /><label className="form-check-label small" htmlFor={`seg-${k}`}>{l}</label></div>
          ))}
          <div className="pm-note mt-3"><i className="bi bi-info-circle me-1" />Only users who have consented to the selected channels will be included in this segment.</div>
        </div>}
        {step === 3 && <div><div className="pm-card pm-card-pad mb-2"><div className="d-flex justify-content-between"><span>Estimated size</span><b>12,450 users</b></div></div><div className="pm-card pm-card-pad"><div className="pm-eyebrow mb-2">Segment rules summary</div>{[["Base", "All active users"], ["Balance", "Any"], ["Last active", "Any"], ["County", "Any"], ["KYC", "Any"], ["Push consent", "Required"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b>{x[1]}</b></div>)}</div></div>}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={() => step ? setStep(step - 1) : onClose()}>{step ? "← Back" : "Cancel"}</button>{step < 3 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(step + 1)}>Continue →</button> : <button className="btn btn-primary btn-sm" onClick={() => { setStep(0); push({ kind: "success", title: "Segment created" }); onClose(); }}><i className="bi bi-check2 me-1" />Create segment</button>}</div>
    </Modal>
  );
}

/* ================================================================
   31. DATA IMPORT WIZARD (NEW — 4-step)
   ================================================================ */
export function DataImportWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  if (!open) return null;
  return (
    <Modal open onClose={() => { setStep(0); onClose(); }} title="Import Data" subtitle={`Step ${step + 1} of 4: ${["Select type", "Upload", "Map fields", "Confirm"][step]}`} icon="bi-cloud-upload" tone="green" size="lg">
      <Steps current={step} steps={[{ label: "Type", icon: "bi-tag" }, { label: "Upload", icon: "bi-upload" }, { label: "Map", icon: "bi-diagram-3" }, { label: "Confirm", icon: "bi-check2" }]} />
      <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 25}%` }} /></div>
      <div className="pm-modal-body">
        {step === 0 && <div className="d-flex flex-column gap-2">
          {[["segments", "Import audience segments", "bi-people", "blue"], ["templates", "Import templates", "bi-files", "green"], ["budget", "Import budget data", "bi-wallet2", "amber"], ["contacts", "Import contact lists", "bi-person-lines-fill", "violet"]].map(([k, l, ic, tn]) => (
            <button key={k} className="d-flex align-items-center gap-2 w-100" style={{ padding: ".75rem 1rem", border: "1px solid var(--pm-border)", borderRadius: 12, background: "#fff", cursor: "pointer", textAlign: "left" }}>
              <i className={`bi ${ic} text-${tn}`} /><div className="pm-td-strong">{l}</div>
            </button>
          ))}
        </div>}
        {step === 1 && <div className="pm-card pm-card-pad text-center" style={{ border: "2px dashed var(--pm-border)", padding: "3rem" }}>
          <i className="bi bi-cloud-arrow-up text-primary" style={{ fontSize: 48 }} /><h6 className="mt-2">Drop file here or click to browse</h6><p className="small text-muted">Supports CSV, XLSX, JSON. Max 10MB.</p>
          <button className="btn btn-outline-primary btn-sm mt-2"><i className="bi bi-folder2-open me-1" />Browse files</button>
        </div>}
        {step === 2 && <div>
          <div className="pm-eyebrow mb-2">Map import fields to system fields</div>
          {[["name", "Segment Name", "name"], ["count", "User Count", "count"], ["criteria", "Filter Rules", "criteria"]].map(([sys, imp, _]) => (
            <div key={sys} className="d-flex align-items-center gap-2 mb-2" style={{ padding: ".6rem .75rem", border: "1px solid var(--pm-border)", borderRadius: 10 }}>
              <span className="small flex-grow-1"><b>Import:</b> {imp}</span><i className="bi bi-arrow-right text-muted" /><span className="small flex-grow-1"><b>System:</b> {sys}</span>
            </div>
          ))}
        </div>}
        {step === 3 && <div className="pm-card pm-card-pad"><div className="pm-eyebrow mb-2">Import Summary</div>{[["Type", "Audience segments"], ["File", "segments_import.csv"], ["Rows", "3"], ["Valid", "3"], ["Errors", "0"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b>{x[1]}</b></div>)}</div>}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={() => step ? setStep(step - 1) : onClose()}>{step ? "← Back" : "Cancel"}</button>{step < 3 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(step + 1)}>Continue →</button> : <button className="btn btn-success btn-sm" onClick={() => { setStep(0); push({ kind: "success", title: "Data imported successfully" }); onClose(); }}><i className="bi bi-check2 me-1" />Import data</button>}</div>
    </Modal>
  );
}

/* ================================================================
   32. BROADCAST ARCHIVE MODAL (NEW)
   ================================================================ */
export function BroadcastArchiveModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Broadcast Archive" subtitle="View and restore archived broadcasts" icon="bi-archive" tone="ink" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Archived", "23", "ink"], ["Restored this month", "2", "green"], ["Permanent deletion", "5", "red"], ["Retention remaining", "67 days", "blue"]].map(x => <div className="col-md-3" key={x[1]}><div className="pm-card pm-card-pad text-center"><div className="h5 mb-0">{x[1]}</div><div className="small text-muted">{x[0]}</div></div></div>)}</div>
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Broadcast</th><th>Archived</th><th>Archived by</th><th>Retention</th><th className="text-end">Actions</th></tr></thead><tbody>
          {[["Holiday promo Dec 2025", "Jan 5", "Super Admin", "42 days left"], ["Year-end summary", "Jan 2", "Joseph M.", "39 days left"], ["New Year greeting", "Jan 1", "Marketing", "38 days left"], ["Q4 newsletter", "Dec 28", "Ops Manager", "Expired"], ["Security patch notice", "Dec 20", "Compliance", "Expired"]].map(r => <tr key={r[0]}><td className="pm-td-strong">{r[0]}</td><td className="pm-td-sub">{r[1]}</td><td>{r[2]}</td><td><Badge tone={r[3].includes("Expired") ? "red" : "blue"}>{r[3]}</Badge></td><td className="text-end text-nowrap"><button className="btn btn-sm btn-outline-primary me-1" onClick={() => push({ kind: "success", title: "Broadcast restored" })}><i className="bi bi-arrow-counterclockwise" /></button><button className="btn btn-sm btn-outline-danger" onClick={() => push({ kind: "success", title: "Permanently deleted" })}><i className="bi bi-trash3" /></button></td></tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ================================================================
   33. BROADCAST RETROSPECTIVE MODAL (NEW)
   ================================================================ */
export function BroadcastRetrospectiveModal({ open, broadcastName, onClose }: { open: boolean; broadcastName: string; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`${broadcastName} — Retrospective`} subtitle="Performance insights, lessons learned and recommendations" icon="bi-lightbulb" tone="amber" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Performance", "Exceeded target", "green"], ["ROI", "KES 2.00/reach", "blue"], ["Engagement", "32% open rate", "green"], ["Satisfaction", "4.2/5 admin rating", "amber"]].map(x => <div className="col-md-3" key={x[1]}><div className="pm-card pm-card-pad text-center"><Badge tone={x[2] as Tone}>{x[0]}</Badge><div className="fw-bold mt-1">{x[1]}</div></div></div>)}</div>
        <h6>What went well</h6>
        {["High open rate (32%) exceeded 25% target", "Low opt-out rate (0.02%)", "Fast approval turnaround (4 hours)"].map((s, i) => <div className="d-flex align-items-center gap-2 mb-1 small" key={i}><i className="bi bi-check-circle-fill text-success" />{s}</div>)}
        <h6 className="mt-3">Areas for improvement</h6>
        {["Email click rate (9.3%) below 12% target", "23 unsubscribed — consider frequency cap", "Push notification had 18.5% open rate vs email 32%"].map((s, i) => <div className="d-flex align-items-center gap-2 mb-1 small" key={i}><i className="bi bi-exclamation-circle-fill text-amber" />{s}</div>)}
        <h6 className="mt-3">Action items</h6>
        {["A/B test subject lines for next campaign", "Reduce to 2 SMS per week maximum", "Add deep links to push notifications", "Schedule next campaign for Tuesday 10 AM"].map((s, i) => <div className="d-flex align-items-center gap-2 mb-1 small" key={i}><i className="bi bi-arrow-right-circle text-blue" />{s}</div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button><button className="btn btn-primary btn-sm" onClick={onClose}><i className="bi bi-download me-1" />Export retrospective</button></div>
    </Modal>
  );
}

/* ================================================================
   34. USER NOTIFICATION PREFERENCES (NEW)
   ================================================================ */
export function UserPreferenceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="User Notification Preferences" subtitle="Global notification settings for broadcast recipients" icon="bi-bell" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="pm-eyebrow mb-2">Default channel preferences</div>
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Category</th><th>Push</th><th>Email</th><th>SMS</th><th>WhatsApp</th></tr></thead><tbody>
          {[["Transactional", "On", "On", "On", "On"], ["Security", "On", "On", "On", "Off"], ["Marketing", "On", "On", "Off", "Off"], ["Engagement", "On", "On", "Off", "Off"], ["Regulatory", "On", "On", "On", "Off"]].map(r => <tr key={r[0]}><td className="pm-td-strong">{r[0]}</td>{r.slice(1).map((c, i) => <td key={i}><Badge tone={c === "On" ? "green" : "grey"}>{c}</Badge></td>)}</tr>)}
        </tbody></table></div>
        <div className="pm-eyebrow mb-2 mt-3">Frequency limits</div>
        {[["Max marketing messages per week", "3"], ["Max SMS per day", "2"], ["Max push per day", "5"], ["Cool-down between campaigns", "2 hours"]].map(r => <div className="d-flex justify-content-between py-1 border-bottom small" key={r[0]}><span className="text-muted">{r[0]}</span><b>{r[1]}</b></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button><button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Preferences updated" }); onClose(); }}>Save preferences</button></div>
    </Modal>
  );
}

/* ================================================================
   35. NOTIFICATION TEMPLATE PREVIEW (NEW — with live variable substitution)
   ================================================================ */
export function NotificationTemplatePreviewModal({ open, template, onClose }: { open: boolean; template: { name: string; body: string; channel: string } | null; onClose: () => void }) {
  const { push } = useToast();
  if (!open || !template) return null;
  const sampleData: Record<string, string> = { name: "Joseph", channel: "Push + Email", amount: "KES 500", date: "Aug 27, 2026", account: "****4521" };
  const rendered = template.body.replace(/\{\{(\w+)\}\}/g, (_, key) => `<span class="doc-var">${sampleData[key] || `{{${key}}}`}</span>`);
  return (
    <Modal open onClose={onClose} title={`${template.name} — Preview`} subtitle="Live preview with sample data substitution" icon="bi-eye" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">
          <div className="col-md-6"><label className="form-label">Channel</label><input className="form-control" value={template.channel} readOnly /></div>
          <div className="col-md-6"><label className="form-label">Template</label><input className="form-control" value={template.name} readOnly /></div>
        </div>
        <label className="form-label">Message preview (with sample data)</label>
        <div className="doc-preview-page" style={{ minHeight: 180 }}>
          <div className="doc-preview-body" style={{ whiteSpace: "pre-wrap", fontSize: ".85rem" }} dangerouslySetInnerHTML={{ __html: rendered }} />
        </div>
        <div className="pm-note mt-3"><i className="bi bi-info-circle me-1" />Sample data is used for preview. Variables in <span className="doc-var">green</span> are replaced with live user data.</div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button><button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Template sent as dry run" }); onClose(); }}><i className="bi bi-send me-1" />Send test</button></div>
    </Modal>
  );
}

/* ================================================================
   36. BROADCAST PERFORMANCE REPORT WIZARD (NEW — 4-step)
   ================================================================ */
export function BroadcastPerformanceWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  if (!open) return null;
  return (
    <Modal open onClose={() => { setStep(0); onClose(); }} title="Performance Report" subtitle={`Step ${step + 1} of 4: ${["Period", "Metrics", "Channels", "Export"][step]}`} icon="bi-bar-chart-line" tone="violet" size="lg">
      <Steps current={step} steps={[{ label: "Period", icon: "bi-calendar3" }, { label: "Metrics", icon: "bi-graph-up" }, { label: "Channels", icon: "bi-broadcast" }, { label: "Export", icon: "bi-download" }]} />
      <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 25}%` }} /></div>
      <div className="pm-modal-body">
        {step === 0 && <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Start date</label><input className="form-control" type="date" defaultValue="2026-08-01" /></div>
          <div className="col-md-6"><label className="form-label">End date</label><input className="form-control" type="date" defaultValue="2026-08-27" /></div>
          <div className="col-12"><label className="form-label">Quick select</label><div className="d-flex gap-2"><button className="btn btn-sm btn-outline-primary">Last 7 days</button><button className="btn btn-sm btn-outline-primary">Last 30 days</button><button className="btn btn-sm btn-outline-primary">This quarter</button><button className="btn btn-sm btn-outline-primary">YTD</button></div></div>
        </div>}
        {step === 1 && <div>
          <div className="pm-eyebrow mb-2">Select metrics to include</div>
          {([ ["delivery-rate", "Delivery rate", true], ["open-rate", "Open rate", true], ["click-rate", "Click rate", true], ["opt-out-rate", "Opt-out rate", true], ["cost-per-reach", "Cost per reach", true], ["roi", "Return on investment", false], ["ab-test-results", "A/B test results", false], ["segment-performance", "Segment performance", false] ] as [string, string, boolean][]).map(([k, l, def]) => (
            <div key={k} className="form-check mb-2"><input className="form-check-input" type="checkbox" id={`metric-${k}`} defaultChecked={def} /><label className="form-check-label small" htmlFor={`metric-${k}`}>{l}</label></div>
          ))}
        </div>}
        {step === 2 && <div>
          <div className="pm-eyebrow mb-2">Select channels</div>
          {([ ["push", "Push notifications", true], ["email", "Email", true], ["sms", "SMS", true], ["whatsapp", "WhatsApp", true], ["in-app", "In-app messages", false] ] as [string, string, boolean][]).map(([k, l, def]) => (
            <div key={k} className="form-check mb-2"><input className="form-check-input" type="checkbox" id={`ch-${k}`} defaultChecked={def} /><label className="form-check-label small" htmlFor={`ch-${k}`}>{l}</label></div>
          ))}
        </div>}
        {step === 3 && <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Export format</label><select className="form-select"><option>PDF Report</option><option>Excel (XLSX)</option><option>CSV</option><option>JSON</option></select></div>
          <div className="col-md-6"><label className="form-label">Recipients</label><input className="form-control" defaultValue="joseph@paymo.co.ke" /></div>
          <div className="col-12"><div className="pm-card pm-card-pad"><div className="pm-eyebrow mb-1">Report preview</div><div className="small text-muted">Performance report for Aug 1–27, 2026 covering Push, Email, SMS, WhatsApp channels.</div></div></div>
        </div>}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={() => step ? setStep(step - 1) : onClose()}>{step ? "← Back" : "Cancel"}</button>{step < 3 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(step + 1)}>Continue →</button> : <button className="btn btn-primary btn-sm" onClick={() => { setStep(0); push({ kind: "success", title: "Report generated and sent" }); onClose(); }}><i className="bi bi-download me-1" />Generate report</button>}</div>
    </Modal>
  );
}
