import { useState } from "react";
import { Badge, Modal, Drawer, Steps, useToast } from "../../../components/ui";

/* ============================ 1. Broadcast Detail Drawer ============================ */
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

/* ============================ 2. Broadcast Analytics Modal ============================ */
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
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={onClose}>Export report</button></div>
    </Modal>
  );
}

/* ============================ 3. Audience Builder Modal ============================ */
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
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Audience segment saved" }); onClose(); }}>Save segment</button></div>
    </Modal>
  );
}

/* ============================ 4. Broadcast Approval Modal ============================ */
export function BroadcastApprovalModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Broadcast Approval" subtitle="Review and approve before customer delivery" icon="bi-check2-circle" tone="green">
      <div className="pm-modal-body">
        <div className="alert alert-success small"><i className="bi bi-check-circle me-1" />This broadcast has passed all compliance and audience checks.</div>
        <div className="row g-3">
          {[["Name", "Fee reduction notice"], ["Channel", "Push + Email"], ["Audience", "All active users (134,210)"], ["Scheduled", "Tomorrow 09:00 EAT"], ["Compliance", "All checks passing"], ["Quiet hours", "Respected"]].map(x => <div className="col-md-6" key={x[0]}><label className="form-label">{x[0]}</label><input className="form-control" value={x[1]} readOnly /></div>)}
          <div className="col-12"><label className="form-label">Message preview</label><div className="pm-card pm-card-pad"><p className="mb-0">"Hello {{name}}, discover what's new in PayMo this month. Learn more in the app."</p></div></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Reject</button><button className="btn btn-success" onClick={() => { push({ kind: "success", title: "Broadcast approved" }); onClose(); }}>Approve and send</button></div>
    </Modal>
  );
}

/* ============================ 5. Budget Alert Modal ============================ */
export function BudgetAlertModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Budget Alert Configuration" subtitle="Set alerts when channel spend reaches threshold" icon="bi-bell" tone="amber">
      <div className="pm-modal-body">
        <div className="row g-3">
          { [["SMS", "80%"], ["Email", "80%"], ["WhatsApp", "80%"]].map(x => <div className="col-md-6" key={x[0]}><label className="form-label">{x[0]} alert threshold</label><div className="input-group"><input className="form-control" defaultValue={x[1]} /><span className="input-group-text">% of budget</span></div></div>)}
          <div className="col-12"><label className="form-label">Alert recipients</label><input className="form-control" defaultValue="joseph@paymo.co.ke, comms@paymo.co.ke" /></div>
          <div className="col-12"><label className="form-label">Alert channel</label><select className="form-select"><option>Email + In-app</option><option>SMS only</option><option>Email only</option></select></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Budget alerts configured" }); onClose(); }}>Save alerts</button></div>
    </Modal>
  );
}

/* ============================ 6. Dry Run Modal ============================ */
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
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Dry run sent" }); onClose(); }}>Send dry run</button></div>
    </Modal>
  );
}

/* ============================ 7. Broadcast History Detail Modal ============================ */
export function BroadcastHistoryDetailModal({ open, broadcast, onClose }: { open: boolean; broadcast: string; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`${broadcast} — History`} subtitle="Full delivery trace and engagement metrics" icon="bi-clock-history" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Sent", "134,210"], ["Delivered", "131,526 (98%)"], ["Opened", "42,123 (32%)"], ["Clicked", "12,456 (9.3%)"]].map(x => <div className="col-md-3" key={x[0]}><div className="pm-card pm-card-pad text-center"><div className="pm-eyebrow">{x[0]}</div><div className="fw-bold">{x[1]}</div></div></div>)}</div>
        <h6>Channel breakdown</h6>
        {[["Push", "134,210 sent", "131,788 delivered (98.2%)", "24,829 opened (18.5%)"], ["Email", "134,210 sent", "131,526 delivered (98%)", "42,123 opened (32%)"]].map(c => <div className="pm-card pm-card-pad mb-2" key={c[0]}><b>{c[0]}</b><div className="small text-muted mt-1">{c[1]} · {c[2]} · {c[3]}</div></div>)}
        <h6 className="mt-3">Approval chain</h6>
        {[["1. Joseph M. drafted", "Aug 22, 10:00"], ["2. Compliance check passed", "Aug 22, 10:01"], ["3. Platform Admin approved", "Aug 22, 14:00"], ["4. Sent to audience", "Aug 22, 14:05"]].map(a => <div className="d-flex justify-content-between py-1 border-bottom small" key={a[0]}><span>{a[0]}</span><span className="text-muted">{a[1]}</span></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={onClose}>Export report</button></div>
    </Modal>
  );
}

/* ============================ 8. Compliance Pre-check Modal ============================ */
export function CompliancePreCheckModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Compliance Pre-check" subtitle="Verify broadcast meets all regulatory requirements before sending" icon="bi-shield-check" tone="green">
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3 text-center"><i className="bi bi-patch-check-fill text-success" style={{ fontSize: 48 }} /><h6 className="mt-2">All checks passing</h6><p className="small text-muted">8 of 8 compliance checks passed.</p></div>
        {[["Consent filtering", "Passed", "green"], ["Quiet hours", "Passed", "green"], ["DND list", "Passed", "green"], ["Sender identification", "Passed", "green"], ["Unsubscribe mechanism", "Passed", "green"], ["Message content", "Passed", "green"], ["Marketing frequency", "Passed", "green"], ["Data retention", "Passed", "green"]].map(c => <div className="d-flex justify-content-between py-1 border-bottom small" key={c[0]}><span>{c[0]}</span><Badge tone={c[2] as any} dot>{c[1]}</Badge></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 9. Channel Comparison Modal ============================ */
export function ChannelComparisonModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Channel Comparison" subtitle="Side-by-side delivery performance across channels" icon="bi-arrows-angle-contract" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Metric</th><th>Push</th><th>Email</th><th>SMS</th><th>WhatsApp</th></tr></thead><tbody>
          {[["Delivery rate", "98.2%", "98.0%", "98.5%", "96.3%"], ["Open rate", "18.5%", "32.4%", "N/A", "78.5%"], ["Click rate", "4.2%", "8.7%", "N/A", "23.4%"], ["Opt-out rate", "N/A", "0.8%", "0.2%", "0.5%"], ["Cost per msg", "Free", "KES 0.50", "KES 2.00", "KES 3.00"], ["Best for", "Urgent", "Rich content", "Reach", "VIP"]].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 0 ? "pm-td-strong" : ""}>{c}</td>)}</tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 10. Broadcast Wizard ============================ */
export function BroadcastWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  if (!open) return null;
  return (
    <Modal open onClose={() => { setStep(0); onClose(); }} title="New Broadcast" subtitle="Compose, target, schedule and approve" icon="bi-send" tone="blue" size="lg">
      <Steps current={step} steps={[{ label: "Message", icon: "bi-pencil" }, { label: "Audience", icon: "bi-people" }, { label: "Schedule", icon: "bi-calendar3" }, { label: "Review", icon: "bi-check2" }]} />
      <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 25}%` }} /></div>
      <div className="pm-modal-body">
        {step === 0 && <div className="row g-3"><div className="col-md-7"><label className="form-label">Broadcast name</label><input className="form-control" placeholder="e.g. August product update" /></div><div className="col-md-5"><label className="form-label">Channel</label><select className="form-select"><option>Push + Email</option><option>Push + SMS</option><option>Multi-channel</option></select></div><div className="col-12"><label className="form-label">Message body</label><textarea className="form-control" rows={4} defaultValue="Hello {{name}}, discover what's new in PayMo this month." /></div></div>}
        {step === 1 && <div className="row g-3"><div className="col-md-6"><label className="form-label">Audience segment</label><select className="form-select"><option>All active users · 134,210</option><option>New users · 3,200</option><option>VIP clients · 347</option><option>Dormant 30d+ · 8,450</option></select></div><div className="col-md-6"><label className="form-label">Consent filter</label><input className="form-control" value="Automatic — only opted-in users" readOnly /></div></div>}
        {step === 2 && <div className="row g-3"><div className="col-md-6"><label className="form-label">Send time</label><select className="form-select"><option>Immediately after approval</option><option>Tomorrow 09:00 EAT</option><option>Custom schedule</option></select></div><div className="col-md-6"><label className="form-label">Quiet hours</label><input className="form-control" value="Respected — 22:00–07:00 EAT" readOnly /></div></div>}
        {step === 3 && <div className="pm-card pm-card-pad">{[["Name", "August product update"], ["Channel", "Push + Email"], ["Audience", "All active users · 134,210"], ["Schedule", "After approval"], ["Compliance", "All checks passing"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b>{x[1]}</b></div>)}</div>}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={() => step ? setStep(step - 1) : onClose()}>{step ? "Back" : "Cancel"}</button>{step < 3 ? <button className="btn btn-primary" onClick={() => setStep(step + 1)}>Continue</button> : <button className="btn btn-primary" onClick={() => { setStep(0); push({ kind: "success", title: "Broadcast queued" }); onClose(); }}>Submit for approval</button>}</div>
    </Modal>
  );
}

/* ============================ 11. Template Manager Modal ============================ */
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
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Template created" }); onClose(); }}>Create template</button></div>
    </Modal>
  );
}

/* ============================ 12. Unsubscribe Analysis Modal ============================ */
export function UnsubscribeAnalysisModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Unsubscribe Analysis" subtitle="Opt-out trends and reasons across campaigns" icon="bi-person-dash" tone="amber" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Total opt-outs", "23", "amber"], ["Opt-out rate", "0.02%", "green"], ["Top reason", "Too frequent", "blue"], ["Most affected", "Marketing SMS", "amber"]].map(x => <div className="col-md-3" key={x[1]}><div className="pm-card pm-card-pad text-center"><Badge tone={x[2] as any}>{x[0]}</Badge><div className="fw-bold mt-1">{x[1]}</div></div></div>)}</div>
        <h6>Opt-out reasons</h6>
        {[["Too frequent", "42%"], ["Not relevant", "28%"], ["Cost concerns", "18%"], ["Switched provider", "8%"], ["Other", "4%"]].map(r => <div className="d-flex justify-content-between py-1 border-bottom small" key={r[0]}><span>{r[0]}</span><b>{r[1]}</b></div>)}
        <h6 className="mt-3">Recommendations</h6>
        {[["Reduce marketing SMS frequency from 3/week to 1/week", "High"], ["Segment offers by user interest", "Medium"], ["Add preference center in app", "Low"]].map(r => <div className="d-flex justify-content-between py-1 border-bottom small" key={r[0]}><span>{r[0]}</span><Badge tone={r[1] === "High" ? "red" : r[1] === "Medium" ? "amber" : "grey"}>{r[1]}</Badge></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 13. Broadcast Comparison Modal ============================ */
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
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 14. Quiet Hours Modal ============================ */
export function BroadcastQuietHoursModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Quiet Hours Rules" subtitle="Global delivery restrictions for non-critical messages" icon="bi-moon-stars" tone="blue">
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3"><Badge tone="green" dot>Active</Badge>
          <h6 className="mt-3">Current rules</h6>
          {[["Window", "22:00 – 07:00 EAT"], ["Emergency override", "Allowed · 2FA required"], ["Transactional", "Allowed · always"], ["Security", "Allowed · always"], ["Marketing", "Blocked"], ["Engagement", "Blocked"], ["Per-user timezone", "Respected where available"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b>{x[1]}</b></div>)}
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 15. Broadcast ROI Modal ============================ */
export function BroadcastRoiModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Broadcast ROI Analysis" subtitle="Return on investment across all communication channels" icon="bi-graph-up-arrow" tone="violet" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Total spend", "KES 5.1M", "blue"], ["Users reached", "401K", "green"], ["Cost per reach", "KES 12.72", "blue"], ["Engagement rate", "32%", "green"]].map(x => <div className="col-md-3" key={x[1]}><div className="pm-card pm-card-pad text-center"><Badge tone={x[2] as any}>{x[0]}</Badge><div className="h5 mt-2 mb-0">{x[1]}</div></div></div>)}</div>
        <h6>Campaign ROI</h6>
        {[["Fee reduction notice", "KES 268K", "134,210", "KES 2.00/reach"], ["Maintenance window", "KES 297K", "148,392", "KES 2.00/reach"], ["Savings Goals", "KES 252K", "125,863", "KES 2.00/reach"], ["KYC reminder", "KES 7K", "3,588", "KES 1.95/reach"], ["Promo discount", "KES 16K", "5,230", "KES 3.06/reach"]].map(r => <div className="d-flex justify-content-between py-1 border-bottom small" key={r[0]}><span className="pm-td-strong">{r[0]}</span><div><span className="text-muted me-2">{r[2]} users</span><b>{r[3]}</b></div></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={onClose}>Export ROI report</button></div>
    </Modal>
  );
}
