import { useState } from "react";
import { Badge, Modal, Drawer, Steps, useToast } from "../../../components/ui";

/* ============================ 1. Channel Detail Drawer ============================ */
export function ChannelDetailDrawer({ channel, onClose }: { channel: string | null; onClose: () => void }) {
  if (!channel) return null;
  return (
    <Drawer open onClose={onClose} title={`${channel} — Channel Detail`} subtitle="Provider health, delivery performance and configuration" icon="bi-broadcast" wide>
      <div className="pm-card pm-card-pad mb-3">
        <div className="d-flex justify-content-between"><h5>{channel}</h5><Badge tone="green" dot>Active</Badge></div>
        <div className="row g-3 mt-2">{[["Provider", "Africa's Talking"], ["Sent (24h)", "89,234"], ["Delivered", "98.5%"], ["Cost (24h)", "KES 178K"]].map(x => <div className="col-md-3" key={x[0]}><div className="pm-eyebrow">{x[0]}</div><b className="small">{x[1]}</b></div>)}</div>
      </div>
      <div className="pm-card pm-card-pad mb-3"><h6>Delivery breakdown</h6>
        {[["Delivered", "87,890", "green"], ["Failed", "1,344", "red"], ["Pending", "0", "blue"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span>{x[0]}</span><Badge tone={x[2] as any}>{x[1]}</Badge></div>)}
      </div>
      <div className="pm-card pm-card-pad"><h6>Provider config</h6>
        {[["API key", "AT-****4567"], ["Sender ID", "PayMo"], ["Sender name", "PayMo"], ["Rate limit", "200/min"], ["Retry policy", "3 attempts"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b className="mono">{x[1]}</b></div>)}
      </div>
    </Drawer>
  );
}

/* ============================ 2. Notification Detail Modal ============================ */
export function NotificationDetailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Notification Detail" subtitle="Full delivery trace and provider response" icon="bi-bell" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3">{[["Notification ID", "NTF-88234"], ["Template", "TXN receipt"], ["Channel", "SMS"], ["User", "PAY-12345"], ["Sent", "14:32 EAT"], ["Delivered", "14:32 EAT"], ["Provider", "Africa's Talking"], ["Provider ID", "AT-MSG-99234"]].map(x => <div className="col-md-6" key={x[0]}><label className="form-label">{x[0]}</label><input className="form-control" value={x[1]} readOnly /></div>)}</div>
        <h6 className="mt-3">Delivery timeline</h6>
        {[["14:32:00", "Queued for delivery"], ["14:32:01", "Sent to Africa's Talking"], ["14:32:02", "Accepted by provider"], ["14:32:05", "Delivered to device"]].map(t => <div className="d-flex gap-2 py-1 border-bottom small" key={t[0]}><span className="mono text-muted" style={{ width: 80 }}>{t[0]}</span><span>{t[1]}</span></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 3. Template Editor Modal ============================ */
export function TemplateEditorModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Notification Template Editor" subtitle="Create and configure a notification template" icon="bi-file-earmark-plus" tone="blue" size="lg">
      <Steps current={2} steps={[{ label: "Identity", icon: "bi-file-text" }, { label: "Channels", icon: "bi-broadcast" }, { label: "Content", icon: "bi-pencil" }]} />
      <div className="pm-wizard-progress"><span style={{ width: "100%" }} /></div>
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Template name</label><input className="form-control" defaultValue="Transaction receipt" /></div>
          <div className="col-md-6"><label className="form-label">Category</label><select className="form-select"><option>Transactional</option><option>Security</option><option>Marketing</option><option>Engagement</option></select></div>
          <div className="col-12"><label className="form-label">Message body</label><textarea className="form-control" rows={4} defaultValue="Hello {{name}}, your transaction of {{amount}} was completed on {{date}}. Reference: {{txn_id}}." /></div>
          <div className="col-md-6"><label className="form-label">Variables</label><input className="form-control" value="{{name}}, {{amount}}, {{date}}, {{txn_id}}" readOnly /></div>
          <div className="col-md-6"><label className="form-label">Channels</label><input className="form-control" value="Push + In-app + SMS" readOnly /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Template saved" }); onClose(); }}>Save template</button></div>
    </Modal>
  );
}

/* ============================ 4. Delivery Failure Modal ============================ */
export function DeliveryFailureModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Delivery Failure Detail" subtitle="Root cause analysis and retry options" icon="bi-exclamation-triangle" tone="red" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Channel", "SMS"], ["User", "PAY-89012"], ["Template", "Security alert"], ["Error", "Device token expired"], ["Retries", "0 / 3"], ["Status", "Permanent fail"]].map(x => <div className="col-md-4" key={x[0]}><label className="form-label">{x[0]}</label><input className="form-control" value={x[1]} readOnly /></div>)}</div>
        <h6>Failure timeline</h6>
        {[["14:28:00", "Queued for delivery"], ["14:28:01", "Sent to FCM"], ["14:28:02", "FCM error: InvalidRegistration", ["14:28:03", "Marked as permanent failure"]].map(t => <div className="d-flex gap-2 py-1 border-bottom small" key={t[0]}><span className="mono text-muted" style={{ width: 80 }}>{t[0]}</span><span>{t[1]}</span></div>)}
        <div className="mt-3"><label className="form-label">Resolution</label><select className="form-select"><option>Re-register device token</option><option>Fallback to SMS</option><option>Mark as resolved</option></select></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Resolution queued" }); onClose(); }}>Resolve</button></div>
    </Modal>
  );
}

/* ============================ 5. Channel Config Modal ============================ */
export function ChannelConfigModal({ open, channel, onClose }: { open: boolean; channel: string; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`Configure ${channel}`} subtitle="Provider credentials and delivery settings" icon="bi-sliders" tone="blue">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Provider</label><input className="form-control" value="Africa's Talking" readOnly /></div>
          <div className="col-md-6"><label className="form-label">Status</label><Badge tone="green" dot>Healthy</Badge></div>
          <div className="col-md-6"><label className="form-label">API key</label><input className="form-control mono" value="AT-****4567" readOnly /></div>
          <div className="col-md-6"><label className="form-label">Sender ID</label><input className="form-control" defaultValue="PayMo" /></div>
          <div className="col-md-6"><label className="form-label">Rate limit</label><div className="input-group"><input className="form-control" defaultValue="200" /><span className="input-group-text">req/min</span></div></div>
          <div className="col-md-6"><label className="form-label">Retry policy</label><select className="form-select"><option>3 attempts · exponential backoff</option><option>5 attempts · linear backoff</option></select></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Channel configured" }); onClose(); }}>Save configuration</button></div>
    </Modal>
  );
}

/* ============================ 6. Preference Editor Modal ============================ */
export function PreferenceEditorModal({ open, pref, onClose }: { open: boolean; pref: string; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`Edit: ${pref}`} subtitle="Configure default preference and opt-out policy" icon="bi-person-check" tone="amber">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Default state</label><select className="form-select"><option>On (opt-out allowed)</option><option>On (no opt-out)</option><option>Off (opt-in required)</option></select></div>
          <div className="col-md-6"><label className="form-label">Can opt out</label><select className="form-select"><option>Yes</option><option>No (regulatory)</option></select></div>
          <div className="col-12"><label className="form-label">Regulatory note</label><textarea className="form-control" rows={2} defaultValue="Security and transactional notifications cannot be opted out per regulatory requirements." /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Preference updated" }); onClose(); }}>Save</button></div>
    </Modal>
  );
}

/* ============================ 7. Schedule Editor Modal ============================ */
export function ScheduleEditorModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Create Scheduled Notification" subtitle="Configure recurring send with audience and channel" icon="bi-calendar-plus" tone="blue">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Schedule name</label><input className="form-control" placeholder="e.g. Weekly KYC reminder" /></div>
          <div className="col-md-6"><label className="form-label">Template</label><select className="form-select"><option>Transaction receipt</option><option>KYC reminder</option><option>Monthly statement</option><option>Dormancy nudge</option></select></div>
          <div className="col-md-6"><label className="form-label">Audience</label><select className="form-select"><option>All active users</option><option>Dormant 30d+</option><option>VIP clients</option><option>Pending KYC</option></select></div>
          <div className="col-md-6"><label className="form-label">Channel</label><select className="form-select"><option>Push + Email</option><option>SMS only</option><option>Multi-channel</option></select></div>
          <div className="col-md-6"><label className="form-label">Frequency</label><select className="form-select"><option>Daily</option><option>Weekly</option><option>Monthly</option><option>Quarterly</option></select></div>
          <div className="col-md-6"><label className="form-label">Send time</label><input className="form-control" defaultValue="09:00 EAT" /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Schedule created" }); onClose(); }}>Create schedule</button></div>
    </Modal>
  );
}

/* ============================ 8. Compliance Drawer ============================ */
export function ComplianceDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Drawer open onClose={onClose} title="Notification Compliance" subtitle="Consent, sender identity, quiet hours and DND controls" icon="bi-shield-check" wide>
      <div className="pm-card pm-card-pad mb-3"><Badge tone="green" dot>Compliant</Badge>
        <h6 className="mt-3">Compliance controls</h6>
        {[["Opt-out mechanism", "In-app settings + email unsubscribe"], ["Sender identification", "PayMo · noreply@paymo.co.ke"], ["Quiet hours", "10PM–7AM · marketing capped at 3/week"], ["DND compliance", "Telco DND list checked before SMS"], ["Data retention", "2 years, then anonymized"], ["Consent tracking", "Timestamped opt-in/out ledger"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b>{x[1]}</b></div>)}
      </div>
      <div className="pm-card pm-card-pad"><h6>Regulatory requirements</h6>
        {[["CBK (Kenya)", "Transaction notifications mandatory"], ["GDPR", "Consent required for marketing"], ["PEPDA", "Data subject rights enforced"], ["IT Act", "2-year log retention"]].map(r => <div className="d-flex justify-content-between py-1 border-bottom small" key={r[0]}><span>{r[0]}</span><span className="small text-muted">{r[1]}</span></div>)}
      </div>
    </Drawer>
  );
}

/* ============================ 9. Cost Optimization Modal ============================ */
export function CostOptimizationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Cost Optimization Plan" subtitle="Channel-shift recommendations and savings projections" icon="bi-lightbulb" tone="green" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Current spend", "KES 7.09M/mo", "blue"], ["Projected savings", "KES 1.96M/mo", "green"], ["Savings %", "27.6%", "green"]].map(x => <div className="col-md-4" key={x[1]}><div className="pm-card pm-card-pad text-center"><Badge tone={x[2] as any}>{x[0]}</Badge><div className="h5 mt-2 mb-0">{x[1]}</div></div></div>)}</div>
        <h6>Recommendations</h6>
        {[["Shift low-priority SMS to Push + In-app", "KES 1.6M savings", "green"], ["Clean bounced email list", "KES 138K savings", "green"], ["Restrict WhatsApp to VIP only", "KES 220K savings", "green"], ["Reduce marketing email frequency", "KES 45K savings", "amber"]].map(r => <div className="d-flex justify-content-between align-items-center py-1 border-bottom small" key={r[0]}><span>{r[0]}</span><div><Badge tone={r[2] as any}>{r[1]}</Badge></div></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Optimization plan created" }); onClose(); }}>Apply plan</button></div>
    </Modal>
  );
}

/* ============================ 10. Queue Detail Modal ============================ */
export function QueueDetailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Notification Queue Detail" subtitle="Delivery trace, provider response and retry policy" icon="bi-exclamation-triangle" tone="amber" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Queue depth", "4"], ["Retrying", "3"], ["Permanent fail", "1"], ["Avg age", "12 min"]].map(x => <div className="col-md-3" key={x[0]}><div className="pm-card pm-card-pad text-center"><div className="h5 mb-0">{x[1]}</div><div className="small text-muted">{x[0]}</div></div></div>)}</div>
        <h6>Failed notifications</h6>
        {[["NTF-88234", "SMS", "PAY-12345", "Telco timeout", "Retrying", "amber"], ["NTF-88190", "Email", "PAY-67890", "Invalid email", "Bounced", "red"], ["NTF-88156", "Push", "PAY-89012", "Token expired", "Permanent fail", "red"]].map(n => <div className="d-flex justify-content-between align-items-center py-1 border-bottom small" key={n[0]}><div><b>{n[0]}</b> — <span className="text-muted">{n[1]}</span><div className="pm-td-sub">{n[2]} · {n[3]}</div></div><Badge tone={n[5] as any}>{n[4]}</Badge></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "3 notifications queued for retry" }); onClose(); }}>Retry all</button></div>
    </Modal>
  );
}

/* ============================ 11. Analytics Detail Modal ============================ */
export function AnalyticsDetailModal({ open, channel, onClose }: { open: boolean; channel: string; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`${channel} — Analytics Detail`} subtitle="Detailed delivery, engagement and performance metrics" icon="bi-graph-up" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Delivery", "98.5%", "green"], ["Open rate", "32.4%", "blue"], ["Click rate", "8.7%", "blue"], ["Opt-out", "0.2%", "green"]].map(x => <div className="col-md-3" key={x[0]}><div className="pm-card pm-card-pad text-center"><div className="pm-eyebrow">{x[0]}</div><div className="fw-bold">{x[1]}</div></div></div>)}</div>
        <h6>Daily trend (last 7 days)</h6>
        {[["Aug 18", "89,234", "87,890", "98.5%"], ["Aug 19", "92,100", "90,340", "98.1%"], ["Aug 20", "85,600", "84,200", "98.4%"], ["Aug 21", "91,200", "89,800", "98.5%"], ["Aug 22", "88,900", "87,500", "98.4%"], ["Aug 23", "93,400", "91,900", "98.4%"], ["Aug 24", "89,234", "87,890", "98.5%"]].map(d => <div className="d-flex justify-content-between py-1 border-bottom small" key={d[0]}><span className="mono text-muted">{d[0]}</span><span>Sent: {d[1]}</span><span>Delivered: {d[2]}</span><Badge tone="green">{d[3]}</Badge></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={onClose}>Export</button></div>
    </Modal>
  );
}

/* ============================ 12. Category Templates Modal ============================ */
export function CategoryTemplatesModal({ open, category, onClose }: { open: boolean; category: string; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`${category} Templates`} subtitle="Manage templates for this notification category" icon="bi-files" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Template</th><th>Channels</th><th>Last used</th><th>Status</th></tr></thead><tbody>
          {[["TXN receipt", "Push + In-app + SMS", "Today", "Active"], ["Transfer confirmation", "Push + In-app", "Today", "Active"], ["Payment failed", "Push + SMS", "Yesterday", "Active"]].map(t => <tr key={t[0]}><td className="pm-td-strong">{t[0]}</td><td>{t[1]}</td><td>{t[2]}</td><td><Badge tone="green" dot>{t[3]}</Badge></td></tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Template updated" }); onClose(); }}>Create template</button></div>
    </Modal>
  );
}

/* ============================ 13. Quiet Hours Config Modal ============================ */
export function QuietHoursConfigModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Quiet Hours Configuration" subtitle="Set notification delivery windows for non-critical messages" icon="bi-moon-stars" tone="blue">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Start time</label><input className="form-control" defaultValue="22:00" type="time" /></div>
          <div className="col-md-6"><label className="form-label">End time</label><input className="form-control" defaultValue="07:00" type="time" /></div>
          <div className="col-md-6"><label className="form-label">Timezone</label><select className="form-select"><option>Per-user timezone</option><option>Africa/Nairobi (EAT)</option></select></div>
          <div className="col-md-6"><label className="form-label">Marketing limit</label><div className="input-group"><input className="form-control" defaultValue="3" /><span className="input-group-text">per week</span></div></div>
          <div className="col-12"><label className="form-label">Exemptions</label>
            {[["Transactional messages", true], ["Security alerts", true], ["KYC reminders", true], ["Marketing pushes", false], ["Engagement nudges", false]].map(e => <div className="form-check py-1" key={e[0]}><input className="form-check-input" type="checkbox" id={`qh-${e[0]}`} defaultChecked={e[1]} /><label className="form-check-label small" htmlFor={`qh-${e[0]}`}>{e[0]}</label></div>)}
          </div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Quiet hours saved" }); onClose(); }}>Save</button></div>
    </Modal>
  );
}

/* ============================ 14. Unsubscribe Detail Modal ============================ */
export function UnsubscribeDetailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Unsubscribe Management" subtitle="User opt-out tracking and regulatory compliance" icon="bi-person-dash" tone="amber" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Total users", "148,392"], ["Unsubscribed", "12,456 (8.4%)"], ["Opted out (marketing)", "8,234"], ["DND registered", "4,222"]].map(x => <div className="col-md-3" key={x[0]}><div className="pm-card pm-card-pad text-center"><div className="pm-eyebrow">{x[0]}</div><div className="fw-bold">{x[1]}</div></div></div>)}</div>
        <h6>Recent opt-outs</h6>
        {[["PAY-12345", "Marketing push", "2 hours ago", "Reason: too frequent"], ["PAY-67890", "Marketing email", "5 hours ago", "Reason: not relevant"], ["PAY-89012", "Marketing SMS", "1 day ago", "Reason: cost concerns"]].map(u => <div className="d-flex justify-content-between py-1 border-bottom small" key={u[0]}><div><b>{u[0]}</b> — <span className="text-muted">{u[1]}</span><div className="pm-td-sub">{u[3]}</div></div><span className="text-muted">{u[2]}</span></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={onClose}>Export opt-out data</button></div>
    </Modal>
  );
}

/* ============================ 15. Cost Breakdown Modal ============================ */
export function CostBreakdownModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Notification Cost Breakdown" subtitle="Monthly spend by channel with trend analysis" icon="bi-cash-stack" tone="violet" size="lg">
      <div className="pm-modal-body">
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Channel</th><th>Unit cost</th><th>Monthly budget</th><th>Used (MTD)</th><th>Remaining</th><th>Savings</th></tr></thead><tbody>
          {[["SMS", "KES 2.00", "KES 5.5M", "KES 3.8M", "KES 1.7M", "KES 1.6M"], ["Email", "KES 0.50", "KES 800K", "KES 520K", "KES 280K", "KES 138K"], ["WhatsApp", "KES 3.00", "KES 1.2M", "KES 780K", "KES 420K", "KES 220K"], ["Push", "Free", "KES 0", "KES 0", "Unlimited", "KES 0"], ["In-app", "Free", "KES 0", "KES 0", "Unlimited", "KES 0"]].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 0 ? "pm-td-strong" : "pm-num"}>{c}</td>)}</tr>)}
        </tbody></table></div>
        <div className="mt-3"><Badge tone="green">Total potential savings: KES 1.96M/month</Badge></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}
