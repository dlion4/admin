import { useState } from "react";
import { Modal, Drawer, Badge, Steps, useToast } from "../../../components/ui";

/* ==================== 1. Channel Detail Drawer ==================== */
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
        {[["API key", "AT-****4567"], ["Sender ID", "PayMo"], ["Rate limit", "200/min"], ["Retry policy", "3 attempts"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b className="mono">{x[1]}</b></div>)}
      </div>
    </Drawer>
  );
}

/* ==================== 2. Notification Detail Modal ==================== */
export function NotificationDetailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title="Notification Detail" subtitle="Full delivery trace and provider response" icon="bi-bell" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3">{[["Notification ID", "NTF-88234"], ["Template", "TXN receipt"], ["Channel", "SMS"], ["User", "PAY-12345"], ["Sent", "14:32 EAT"], ["Delivered", "14:32 EAT"], ["Provider", "Africa's Talking"], ["Provider ID", "AT-MSG-99234"]].map(x => <div className="col-md-6" key={x[0]}><label className="form-label">{x[0]}</label><input className="form-control" value={x[1]} readOnly /></div>)}</div>
        <h6 className="mt-3">Delivery timeline</h6>
        {[["14:32:00", "Queued for delivery"], ["14:32:01", "Sent to Africa's Talking"], ["14:32:02", "Accepted by provider"], ["14:32:05", "Delivered to device"]].map(t => <div className="d-flex gap-2 py-1 border-bottom small" key={t[0]}><span className="mono text-muted" style={{ width: 80 }}>{t[0]}</span><span>{t[1]}</span></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button><button className="btn btn-primary btn-sm" onClick={onClose}>Re-send</button></div>
    </Modal>
  );
}

/* ==================== 3. Template Editor Modal ==================== */
export function TemplateEditorModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title="Notification Template Editor" subtitle="Create and configure a notification template" icon="bi-file-earmark-plus" tone="blue" size="lg">
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
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button><button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Template saved" }); onClose(); }}>Save template</button></div>
    </Modal>
  );
}

/* ==================== 4. Delivery Failure Modal ==================== */
export function DeliveryFailureModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title="Delivery Failure Detail" subtitle="Root cause analysis and retry options" icon="bi-exclamation-triangle" tone="red" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Channel", "SMS"], ["User", "PAY-89012"], ["Template", "Security alert"], ["Error", "Device token expired"], ["Retries", "0 / 3"], ["Status", "Permanent fail"]].map(x => <div className="col-md-4" key={x[0]}><label className="form-label">{x[0]}</label><input className="form-control" value={x[1]} readOnly /></div>)}</div>
        <h6>Failure timeline</h6>
        {[["14:28:00", "Queued for delivery"], ["14:28:01", "Sent to FCM"], ["14:28:02", "FCM error: InvalidRegistration"], ["14:28:03", "Marked as permanent failure"]].map(t => <div className="d-flex gap-2 py-1 border-bottom small" key={t[0]}><span className="mono text-muted" style={{ width: 80 }}>{t[0]}</span><span>{t[1]}</span></div>)}
        <div className="mt-3"><label className="form-label">Resolution</label><select className="form-select"><option>Re-register device token</option><option>Fallback to SMS</option><option>Mark as resolved</option></select></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button><button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Resolution queued" }); onClose(); }}>Resolve</button></div>
    </Modal>
  );
}

/* ==================== 5. Channel Config Modal ==================== */
export function ChannelConfigModal({ open, channel, onClose }: { open: boolean; channel: string; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title={`Configure ${channel}`} subtitle="Provider credentials and delivery settings" icon="bi-sliders" tone="blue">
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
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button><button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Channel configured" }); onClose(); }}>Save configuration</button></div>
    </Modal>
  );
}

/* ==================== 6. Quiet Hours Config Modal ==================== */
export function QuietHoursConfigModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title="Quiet Hours Configuration" subtitle="Set notification delivery windows for non-critical messages" icon="bi-moon-stars" tone="blue">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Start time</label><input className="form-control" defaultValue="22:00" type="time" /></div>
          <div className="col-md-6"><label className="form-label">End time</label><input className="form-control" defaultValue="07:00" type="time" /></div>
          <div className="col-md-6"><label className="form-label">Timezone</label><select className="form-select"><option>Per-user timezone</option><option>Africa/Nairobi (EAT)</option></select></div>
          <div className="col-md-6"><label className="form-label">Marketing limit</label><div className="input-group"><input className="form-control" defaultValue="3" /><span className="input-group-text">per week</span></div></div>
          <div className="col-12"><label className="form-label">Exemptions</label>
            {([ ["Transactional messages", true] as [string, boolean], ["Security alerts", true] as [string, boolean], ["KYC reminders", true] as [string, boolean], ["Marketing pushes", false] as [string, boolean], ["Engagement nudges", false] as [string, boolean] ]).map(([label, checked]) => <div className="form-check py-1" key={label}><input className="form-check-input" type="checkbox" id={`qh-${label}`} defaultChecked={checked} /><label className="form-check-label small" htmlFor={`qh-${label}`}>{label}</label></div>)}
          </div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button><button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Quiet hours saved" }); onClose(); }}>Save</button></div>
    </Modal>
  );
}

/* ==================== 7. Cost Optimization Modal ==================== */
export function CostOptimizationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title="Cost Optimization Plan" subtitle="Channel-shift recommendations and savings projections" icon="bi-lightbulb" tone="green" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Current spend", "KES 7.09M/mo", "blue"], ["Projected savings", "KES 1.96M/mo", "green"], ["Savings %", "27.6%", "green"]].map(x => <div className="col-md-4" key={x[1]}><div className="pm-card pm-card-pad text-center"><Badge tone={x[2]}>{x[0]}</Badge><div className="h5 mt-2 mb-0">{x[1]}</div></div></div>)}</div>
        <h6>Recommendations</h6>
        {[["Shift low-priority SMS to Push + In-app", "KES 1.6M savings", "green"], ["Clean bounced email list", "KES 138K savings", "green"], ["Restrict WhatsApp to VIP only", "KES 220K savings", "green"], ["Reduce marketing email frequency", "KES 45K savings", "amber"]].map(r => <div className="d-flex justify-content-between align-items-center py-1 border-bottom small" key={r[0]}><span>{r[0]}</span><div><Badge tone={r[2]}>{r[1]}</Badge></div></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button><button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Optimization plan created" }); onClose(); }}>Apply plan</button></div>
    </Modal>
  );
}

/* ==================== 8. Queue Detail Modal ==================== */
export function QueueDetailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title="Notification Queue Detail" subtitle="Delivery trace, provider response and retry policy" icon="bi-exclamation-triangle" tone="amber" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Queue depth", "4"], ["Retrying", "3"], ["Permanent fail", "1"], ["Avg age", "12 min"]].map(x => <div className="col-md-3" key={x[0]}><div className="pm-card pm-card-pad text-center"><div className="h5 mb-0">{x[1]}</div><div className="small text-muted">{x[0]}</div></div></div>)}</div>
        <h6>Failed notifications</h6>
        {[["NTF-88234", "SMS", "PAY-12345", "Telco timeout", "Retrying", "amber"], ["NTF-88190", "Email", "PAY-67890", "Invalid email", "Bounced", "red"], ["NTF-88156", "Push", "PAY-89012", "Token expired", "Permanent fail", "red"]].map(n => <div className="d-flex justify-content-between align-items-center py-1 border-bottom small" key={n[0]}><div><b>{n[0]}</b> — <span className="text-muted">{n[1]}</span><div className="pm-td-sub">{n[2]} · {n[3]}</div></div><Badge tone={n[5]}>{n[4]}</Badge></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button><button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "3 notifications queued for retry" }); onClose(); }}>Retry all</button></div>
    </Modal>
  );
}

/* ==================== 9. Analytics Detail Modal ==================== */
export function AnalyticsDetailModal({ open, channel, onClose }: { open: boolean; channel: string; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title={`${channel} — Analytics Detail`} subtitle="Detailed delivery, engagement and performance metrics" icon="bi-graph-up" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Delivery", "98.5%", "green"], ["Open rate", "32.4%", "blue"], ["Click rate", "8.7%", "blue"], ["Opt-out", "0.2%", "green"]].map(x => <div className="col-md-3" key={x[0]}><div className="pm-card pm-card-pad text-center"><div className="pm-eyebrow">{x[0]}</div><div className="fw-bold">{x[1]}</div></div></div>)}</div>
        <h6>Daily trend (last 7 days)</h6>
        {[["Aug 18", "89,234", "87,890", "98.5%"], ["Aug 19", "92,100", "90,340", "98.1%"], ["Aug 20", "85,600", "84,200", "98.4%"], ["Aug 21", "91,200", "89,800", "98.5%"], ["Aug 22", "88,900", "87,500", "98.4%"], ["Aug 23", "93,400", "91,900", "98.4%"], ["Aug 24", "89,234", "87,890", "98.5%"]].map(d => <div className="d-flex justify-content-between py-1 border-bottom small" key={d[0]}><span className="mono text-muted">{d[0]}</span><span>Sent: {d[1]}</span><span>Delivered: {d[2]}</span><Badge tone="green">{d[3]}</Badge></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button><button className="btn btn-primary btn-sm" onClick={onClose}>Export</button></div>
    </Modal>
  );
}

/* ==================== 10. Category Templates Modal ==================== */
export function CategoryTemplatesModal({ open, category, onClose }: { open: boolean; category: string; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title={`${category} Templates`} subtitle="Manage templates for this notification category" icon="bi-files" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Template</th><th>Channels</th><th>Last used</th><th>Status</th><th className="text-end">Actions</th></tr></thead><tbody>
          {[["TXN receipt", "Push + In-app + SMS", "Today", "Active"], ["Transfer confirmation", "Push + In-app", "Today", "Active"], ["Payment failed", "Push + SMS", "Yesterday", "Active"]].map(t => <tr key={t[0]}><td className="pm-td-strong">{t[0]}</td><td>{t[1]}</td><td>{t[2]}</td><td><Badge tone="green" dot>{t[3]}</Badge></td><td className="text-end text-nowrap"><button className="btn btn-sm btn-outline-primary me-1" onClick={() => push({ kind: "success", title: "Template editor opened" })}><i className="bi bi-pencil-square" /></button><button className="btn btn-sm btn-outline-danger" onClick={() => push({ kind: "warn", title: "Template deleted" })}><i className="bi bi-trash3" /></button></td></tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button><button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "New template created" }); onClose(); }}>Create template</button></div>
    </Modal>
  );
}

/* ==================== 11. Unsubscribe Detail Modal ==================== */
export function UnsubscribeDetailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title="Unsubscribe Management" subtitle="User opt-out tracking and regulatory compliance" icon="bi-person-dash" tone="amber" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Total users", "148,392"], ["Unsubscribed", "12,456 (8.4%)"], ["Opted out (marketing)", "8,234"], ["DND registered", "4,222"]].map(x => <div className="col-md-3" key={x[0]}><div className="pm-card pm-card-pad text-center"><div className="pm-eyebrow">{x[0]}</div><div className="fw-bold">{x[1]}</div></div></div>)}</div>
        <h6>Recent opt-outs</h6>
        {[["PAY-12345", "Marketing push", "2 hours ago", "Reason: too frequent"], ["PAY-67890", "Marketing email", "5 hours ago", "Reason: not relevant"], ["PAY-89012", "Marketing SMS", "1 day ago", "Reason: cost concerns"]].map(u => <div className="d-flex justify-content-between py-1 border-bottom small" key={u[0]}><div><b>{u[0]}</b> — <span className="text-muted">{u[1]}</span><div className="pm-td-sub">{u[3]}</div></div><span className="text-muted">{u[2]}</span></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button><button className="btn btn-primary btn-sm" onClick={onClose}>Export opt-out data</button></div>
    </Modal>
  );
}

/* ==================== 12. Cost Breakdown Modal ==================== */
export function CostBreakdownModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title="Notification Cost Breakdown" subtitle="Monthly spend by channel with trend analysis" icon="bi-cash-stack" tone="violet" size="lg">
      <div className="pm-modal-body">
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Channel</th><th>Unit cost</th><th>Monthly budget</th><th>Used (MTD)</th><th>Remaining</th><th>Savings</th></tr></thead><tbody>
          {[["SMS", "KES 2.00", "KES 5.5M", "KES 3.8M", "KES 1.7M", "KES 1.6M"], ["Email", "KES 0.50", "KES 800K", "KES 520K", "KES 280K", "KES 138K"], ["WhatsApp", "KES 3.00", "KES 1.2M", "KES 780K", "KES 420K", "KES 220K"], ["Push", "Free", "KES 0", "KES 0", "Unlimited", "KES 0"], ["In-app", "Free", "KES 0", "KES 0", "Unlimited", "KES 0"]].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 0 ? "pm-td-strong" : "pm-num"}>{c}</td>)}</tr>)}
        </tbody></table></div>
        <div className="mt-3"><Badge tone="green">Total potential savings: KES 1.96M/month</Badge></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ==================== 13. Compliance Audit Trail Modal ==================== */
export function ComplianceAuditModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title="Notification Compliance Audit Trail" subtitle="Immutable record of all notification admin actions" icon="bi-clock-history" tone="violet" size="xl">
      <div className="pm-modal-body">
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Timestamp</th><th>Admin</th><th>Action</th><th>Record</th><th>Details</th><th>IP</th></tr></thead>
            <tbody>
              {[
                ["Aug 25, 14:32", "Super Admin", "CREATE", "Channel", "Added WhatsApp Business", "192.168.1.106"],
                ["Aug 25, 11:15", "Super Admin", "EDIT", "Template", "Updated TXN receipt template", "192.168.1.106"],
                ["Aug 24, 16:48", "Super Admin", "LOCK", "Category", "Locked Marketing category", "192.168.1.106"],
                ["Aug 24, 09:20", "Super Admin", "DELETE", "Schedule", "Removed expired schedule", "192.168.1.106"],
                ["Aug 23, 14:55", "Platform Admin", "EXPORT", "Analytics", "Exported channel analytics", "192.168.1.50"],
                ["Aug 22, 15:12", "Super Admin", "CONFIG", "Quiet Hours", "Updated delivery windows", "192.168.1.106"],
              ].map(([ts, admin, action, record, detail, ip], i) => (
                <tr key={i}>
                  <td className="mono pm-td-sub">{ts}</td>
                  <td className="pm-td-strong">{admin}</td>
                  <td><Badge tone={action === "DELETE" ? "red" : action === "LOCK" ? "amber" : action === "CREATE" ? "green" : "blue"}>{action}</Badge></td>
                  <td>{record}</td>
                  <td style={{ fontSize: ".78rem" }}>{detail}</td>
                  <td className="mono pm-td-sub">{ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pm-note mt-3"><i className="bi bi-shield-lock me-1" />Audit trail is immutable. SHA-256 hash verification enabled.</div>
      </div>
    </Modal>
  );
}

/* ==================== 14. Emergency Actions Modal ==================== */
export function EmergencyActionsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title="Emergency Notification Actions" subtitle="Super Admin — Critical notification system controls" icon="bi-exclamation-triangle-fill" tone="red" size="lg">
      <div className="pm-modal-body">
        <div className="pm-note mb-3" style={{ borderLeft: "3px solid var(--pm-danger)", background: "var(--pm-danger-soft)" }}>
          <div className="pm-td-strong" style={{ color: "var(--pm-danger)" }}>⚠️ Emergency actions are irreversible and trigger immediate notifications</div>
        </div>
        {[
          { action: "Pause All Notifications", desc: "Halt all outgoing notifications immediately", icon: "bi-pause-circle" },
          { action: "Purge Failed Queue", desc: "Clear all failed notifications from queue", icon: "bi-trash3" },
          { action: "Disable Marketing Channels", desc: "Shut down all marketing notification channels", icon: "bi-megaphone" },
          { action: "Activate Emergency Bypass", desc: "Allow critical notifications during quiet hours", icon: "bi-shield-exclamation" },
          { action: "Notify All Users", desc: "Send emergency broadcast to all users", icon: "bi-broadcast" },
          { action: "Export Emergency Backup", desc: "Encrypted backup of all notification config", icon: "bi-database-down" },
        ].map((e, i) => (
          <div key={i} className="pm-alert-row mb-2 cursor-pointer" onClick={() => toast.push({ kind: "warn", title: e.action, body: "Emergency action triggered — audit logged" })}>
            <div style={{ width: 36, height: 36, borderRadius: 9, display: "grid", placeItems: "center", background: "var(--pm-danger-soft)", color: "var(--pm-danger)", flex: "none" }}>
              <i className={`bi ${e.icon}`} />
            </div>
            <div className="flex-grow-1">
              <div className="pm-td-strong">{e.action}</div>
              <div className="pm-td-sub">{e.desc}</div>
            </div>
            <i className="bi bi-chevron-right" style={{ color: "var(--pm-muted)" }} />
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* ==================== 15. Admin Permissions Drawer ==================== */
export function AdminPermissionsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  const admins = [
    { name: "Jeckonia Kwasa", role: "Super Admin", perms: ["All Channels", "Template CRUD", "Delete", "Emergency", "Export"] },
    { name: "Dan Delion", role: "Super Admin", perms: ["All Channels", "Template CRUD", "Delete", "Emergency"] },
    { name: "James Ochieng", role: "Platform Admin", perms: ["View All", "Edit (non-locked)", "Create"] },
    { name: "Mary Wanjiku", role: "Marketing Admin", perms: ["Marketing Channels", "Campaign Scheduling", "Template Edit"] },
  ];

  return (
    <Drawer open={open} onClose={onClose} title="Admin Permissions Matrix" subtitle="Access control for notification management" icon="bi-shield-lock" tone="violet" wide>
      {admins.map((a, i) => (
        <div key={i} className="pm-card pm-card-pad mb-2">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <div className="pm-td-strong">{a.name}</div>
            <Badge tone={a.role === "Super Admin" ? "green" : "blue"}>{a.role}</Badge>
          </div>
          <div className="d-flex gap-1 flex-wrap mt-1">
            {a.perms.map(p => <Badge key={p} tone="green" className="me-1">{p}</Badge>)}
          </div>
        </div>
      ))}
      <div className="pm-note"><i className="bi bi-shield-lock me-1" />Permission changes require Super Admin approval and are audit-logged.</div>
    </Drawer>
  );
}

/* ==================== 16. Admin Activity Log Modal ==================== */
export function AdminActivityLogModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title="Notification Admin Activity Log" subtitle="Who did what and when" icon="bi-person-video3" tone="blue" size="lg">
      <div className="pm-modal-body">
        {[
          { name: "Jeckonia Kwasa", role: "Super Admin", actions: 47, last: "2 min ago" },
          { name: "Dan Delion", role: "Super Admin", actions: 23, last: "1 hour ago" },
          { name: "James Ochieng", role: "Platform Admin", actions: 12, last: "3 hours ago" },
          { name: "Mary Wanjiku", role: "Marketing Admin", actions: 8, last: "Yesterday" },
        ].map((a, i) => (
          <div key={i} className="pm-alert-row mb-2">
            <div style={{ width: 36, height: 36, borderRadius: 9, display: "grid", placeItems: "center", background: a.role === "Super Admin" ? "var(--pm-green)" : "var(--pm-blue)", color: "#fff", fontWeight: 700, fontSize: ".8rem", flex: "none" }}>{a.name[0]}</div>
            <div className="flex-grow-1">
              <div className="pm-td-strong">{a.name}</div>
              <div className="pm-td-sub"><Badge tone={a.role === "Super Admin" ? "green" : "blue"}>{a.role}</Badge> · {a.actions} actions · Last: {a.last}</div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* ==================== 17. Data Export Modal ==================== */
export function DataExportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<"export" | "import">("export");
  const { push: toast } = useToast();
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title="Data Export / Import" subtitle="Bulk notification data operations for external audit" icon="bi-arrow-left-right" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="d-flex gap-2 mb-3">
          <button className={`btn btn-sm ${mode === "export" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setMode("export")}>Export Data</button>
          <button className={`btn btn-sm ${mode === "import" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setMode("import")}>Import Data</button>
        </div>
        {mode === "export" ? (
          <div className="d-flex flex-column gap-2">
            <div className="pm-eyebrow mb-1">Select data to export</div>
            {["All Channels & Config", "All Templates & Categories", "Delivery Analytics (30d)", "Queue & Failure Logs", "User Preferences & Consent", "Scheduled Sends", "Notification Documents", "Compliance Audit Trail", "Cost Reports", "Admin Activity Logs"].map(item => (
              <label key={item} className="d-flex align-items-center gap-2 mb-2" style={{ fontSize: ".82rem" }}><input type="checkbox" className="form-check-input" defaultChecked />{item}</label>
            ))}
            <div className="pm-eyebrow mt-2 mb-1">Format</div>
            <div className="d-flex gap-2">
              {["Excel (.xlsx)", "CSV", "PDF Report", "JSON"].map(f => <button key={f} className="btn btn-sm btn-outline-secondary">{f}</button>)}
            </div>
            <div className="pm-note mt-2"><i className="bi bi-shield-lock me-1" />Exports include audit timestamps and admin identifiers for compliance.</div>
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            <div style={{ border: "2px dashed var(--pm-border)", borderRadius: 12, padding: "2rem", textAlign: "center", cursor: "pointer" }}>
              <i className="bi bi-cloud-arrow-up" style={{ fontSize: "2rem", color: "var(--pm-muted)" }} />
              <div style={{ fontSize: ".85rem", margin: ".5rem 0 0", color: "var(--pm-muted)" }}>Drop file here or click to browse</div>
              <div className="pm-td-sub">XLSX, CSV, JSON — Max 100MB</div>
            </div>
            <div className="pm-note"><i className="bi bi-info-circle me-1" />Imported data will be merged. A backup will be created automatically before import.</div>
          </div>
        )}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button><button className="btn btn-primary btn-sm" onClick={() => { toast({ kind: "success", title: mode === "export" ? "Export started" : "Import processing" }); onClose(); }}>{mode === "export" ? "Start Export" : "Start Import"}</button></div>
    </Modal>
  );
}

/* ==================== 18. Bulk Send Wizard (5 Steps) ==================== */
export function BulkSendWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const { push: toast } = useToast();
  const steps = [
    { label: "Template", icon: "bi-file-text" },
    { label: "Audience", icon: "bi-people" },
    { label: "Channels", icon: "bi-broadcast" },
    { label: "Schedule", icon: "bi-calendar" },
    { label: "Review", icon: "bi-check-lg" },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Bulk Notification Send" subtitle={`Step ${step + 1} of 5: ${steps[step].label}`} icon="bi-send" tone="blue" size="lg">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / 5) * 100}%` }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && <div className="d-flex flex-column gap-2">
          <div className="pm-eyebrow mb-1">Select template</div>
          {[["TXN receipt", "Transactional", "Push + In-app + SMS"], ["Monthly statement", "Engagement", "Email"], ["KYC reminder", "Compliance", "Push + SMS"], ["Promotion offer", "Marketing", "Push + Email + WhatsApp"], ["Security alert", "Security", "Push + SMS"]].map(t => (
            <button key={t[0]} className="pm-opt"><div className="r" /><div className="flex-grow-1"><div className="pm-td-strong">{t[0]}</div><div className="pm-td-sub">{t[1]} · {t[2]}</div></div></button>
          ))}
        </div>}
        {step === 1 && <div className="d-flex flex-column gap-2">
          <div className="pm-eyebrow mb-1">Select target audience</div>
          {[["All active users (148,392)", "Entire user base"], ["VIP clients (2,345)", "High-value accounts"], ["Dormant users (30d+) (12,567)", "Re-engagement campaign"], ["Pending KYC (8,923)", "KYC completion nudge"], ["New users (7d) (3,456)", "Onboarding sequence"]].map(a => (
            <button key={a[0]} className="pm-opt"><div className="r" /><div className="flex-grow-1"><div className="pm-td-strong">{a[0]}</div><div className="pm-td-sub">{a[1]}</div></div></button>
          ))}
        </div>}
        {step === 2 && <div className="d-flex flex-column gap-2">
          <div className="pm-eyebrow mb-1">Select delivery channels</div>
          {([ ["Push (iOS + Android)", true], ["SMS", true], ["Email", false], ["In-app", true], ["WhatsApp", false] ] as [string, boolean][]).map(([label, checked]) => (
            <label key={label} className="d-flex align-items-center gap-2 mb-2" style={{ fontSize: ".82rem" }}><input type="checkbox" className="form-check-input" defaultChecked={checked} />{label}</label>
          ))}
          <div className="pm-note"><i className="bi bi-info-circle me-1" />Channel costs will be estimated on the review step.</div>
        </div>}
        {step === 3 && <div className="d-flex flex-column gap-2">
          <div className="pm-eyebrow mb-1">When to send</div>
          <div className="row g-2 mb-3">
            {[["Send now", "Immediately"], ["Schedule", "Pick date and time"], ["Recurring", "Daily/Weekly/Monthly"]].map(s => (
              <div key={s[0]} className="col-4"><button className="pm-opt w-100"><div className="r" /><div className="text-start"><div className="pm-td-strong">{s[0]}</div><div className="pm-td-sub">{s[1]}</div></div></button></div>
            ))}
          </div>
          <label className="form-label">Send time</label>
          <input className="form-control" type="datetime-local" defaultValue="2026-08-28T09:00" />
          <label className="form-label">Respect quiet hours</label>
          <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label small">Defer non-critical messages to 7AM-10PM window</label></div>
        </div>}
        {step === 4 && <div className="pm-card pm-card-pad">
          <div className="pm-eyebrow mb-2">Bulk Send Summary</div>
          <div className="pm-kv"><span className="k">Template</span><span className="v">TXN receipt</span></div>
          <div className="pm-kv"><span className="k">Audience</span><span className="v">All active users</span></div>
          <div className="pm-kv"><span className="k">Channels</span><span className="v">Push + In-app + SMS</span></div>
          <div className="pm-kv"><span className="k">Est. Recipients</span><span className="v">148,392</span></div>
          <div className="pm-kv"><span className="k">Est. SMS Cost</span><span className="v">KES 296,784</span></div>
          <div className="pm-kv"><span className="k">Schedule</span><span className="v">Now</span></div>
          <div className="pm-note mt-3"><i className="bi bi-shield-lock me-1" />This bulk send will be audit-logged. All recipient consent will be verified before delivery.</div>
        </div>}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => step ? setStep(s => s - 1) : onClose()}>{step ? "← Back" : "Cancel"}</button>
        {step < 4 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(s => s + 1)}>Continue →</button>
          : <button className="btn btn-primary btn-sm" onClick={() => { toast({ kind: "success", title: "Bulk send queued" }); onClose(); }}><i className="bi bi-send me-1" />Send Now</button>}
      </div>
    </Modal>
  );
}

/* ==================== 19. ABTestWizard (4 Steps) ==================== */
export function ABTestWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const { push: toast } = useToast();
  const steps = [
    { label: "Template", icon: "bi-file-text" },
    { label: "Variants", icon: "bi-split-canvas" },
    { label: "Split", icon: "bi-bar-chart" },
    { label: "Launch", icon: "bi-rocket" },
  ];

  return (
    <Modal open={open} onClose={onClose} title="A/B Notification Test" subtitle={`Step ${step + 1} of 4: ${steps[step].label}`} icon="bi-split-canvas" tone="violet" size="lg">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && <div className="d-flex flex-column gap-2">
          <div className="pm-eyebrow mb-1">Select template to test</div>
          {["TXN receipt", "Dormancy nudge", "Promotion offer", "Monthly statement"].map(t => (
            <button key={t} className="pm-opt"><div className="r" /><span className="pm-td-strong">{t}</span></button>
          ))}
        </div>}
        {step === 1 && <div className="d-flex flex-column gap-2">
          <div className="pm-eyebrow mb-1">Configure variants</div>
          <div className="pm-card pm-card-pad mb-2">
            <div className="pm-eyebrow mb-1">Variant A (Control)</div>
            <textarea className="form-control" rows={2} defaultValue="Hello {{name}}, your transaction of {{amount}} was completed." />
          </div>
          <div className="pm-card pm-card-pad">
            <div className="pm-eyebrow mb-1">Variant B (Test)</div>
            <textarea className="form-control" rows={2} defaultValue="Hi {{name}}! 🎉 Your {{amount}} payment went through. Tap for details." />
          </div>
        </div>}
        {step === 2 && <div className="d-flex flex-column gap-2">
          <div className="pm-eyebrow mb-1">Traffic split</div>
          <div className="row g-2 mb-3">
            <div className="col-6"><label className="form-label">Variant A</label><div className="input-group"><input className="form-control" defaultValue="50" /><span className="input-group-text">%</span></div></div>
            <div className="col-6"><label className="form-label">Variant B</label><div className="input-group"><input className="form-control" defaultValue="50" /><span className="input-group-text">%</span></div></div>
          </div>
          <label className="form-label">Sample size</label>
          <div className="input-group"><input className="form-control" defaultValue="10000" /><span className="input-group-text">users</span></div>
          <label className="form-label mt-2">Primary metric</label>
          <select className="form-select"><option>Open rate</option><option>Click rate</option><option>Conversion rate</option><option>Opt-out rate (lower is better)</option></select>
          <label className="form-label mt-2">Test duration</label>
          <select className="form-select"><option>24 hours</option><option>48 hours</option><option>7 days</option></select>
        </div>}
        {step === 3 && <div className="pm-card pm-card-pad">
          <div className="pm-eyebrow mb-2">Test Summary</div>
          <div className="pm-kv"><span className="k">Template</span><span className="v">TXN receipt</span></div>
          <div className="pm-kv"><span className="k">Variants</span><span className="v">2 (A/B)</span></div>
          <div className="pm-kv"><span className="k">Sample</span><span className="v">10,000 users</span></div>
          <div className="pm-kv"><span className="k">Duration</span><span className="v">24 hours</span></div>
          <div className="pm-kv"><span className="k">Primary metric</span><span className="v">Open rate</span></div>
          <div className="pm-note mt-3"><i className="bi bi-info-circle me-1" />Results will be available after the test completes. Statistical significance threshold: 95%.</div>
        </div>}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => step ? setStep(s => s - 1) : onClose()}>{step ? "← Back" : "Cancel"}</button>
        {step < 3 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(s => s + 1)}>Continue →</button>
          : <button className="btn btn-primary btn-sm" onClick={() => { toast({ kind: "success", title: "A/B test launched" }); onClose(); }}><i className="bi bi-rocket me-1" />Launch Test</button>}
      </div>
    </Modal>
  );
}

/* ==================== 20. Channel Health Check Modal ==================== */
export function ChannelHealthCheckModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title="Channel Health Check" subtitle="Real-time provider status and connectivity test" icon="bi-heart-pulse" tone="green" size="lg">
      <div className="pm-modal-body">
        <div className="pm-note mb-3"><i className="bi bi-info-circle me-1" />Running automated health check across all configured channels...</div>
        {[
          { name: "Push (iOS)", provider: "APNs", status: "Healthy", latency: "45ms", icon: "bi-check-circle-fill", color: "var(--pm-green)" },
          { name: "Push (Android)", provider: "FCM", status: "Healthy", latency: "38ms", icon: "bi-check-circle-fill", color: "var(--pm-green)" },
          { name: "SMS", provider: "Africa's Talking", status: "Healthy", latency: "120ms", icon: "bi-check-circle-fill", color: "var(--pm-green)" },
          { name: "Email", provider: "SendGrid", status: "Healthy", latency: "210ms", icon: "bi-check-circle-fill", color: "var(--pm-green)" },
          { name: "In-app", provider: "Built-in", status: "Healthy", latency: "12ms", icon: "bi-check-circle-fill", color: "var(--pm-green)" },
          { name: "WhatsApp", provider: "Meta", status: "Degraded", latency: "340ms", icon: "bi-exclamation-triangle-fill", color: "var(--pm-warn)" },
        ].map(ch => (
          <div key={ch.name} className="d-flex align-items-center gap-3 py-2 border-bottom">
            <i className={`bi ${ch.icon}`} style={{ color: ch.color, fontSize: "1.1rem" }} />
            <div className="flex-grow-1"><div className="pm-td-strong">{ch.name}</div><div className="pm-td-sub">{ch.provider}</div></div>
            <Badge tone={ch.status === "Healthy" ? "green" : "amber"}>{ch.status}</Badge>
            <span className="mono pm-td-sub">{ch.latency}</span>
          </div>
        ))}
        <div className="pm-note mt-3"><i className="bi bi-heart-pulse me-1" />5/6 channels healthy. WhatsApp showing elevated latency — monitoring.</div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button><button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Health check completed" }); onClose(); }}>Run Again</button></div>
    </Modal>
  );
}

/* ==================== 21. Compliance Drawer ==================== */
export function ComplianceDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Drawer open={open} onClose={onClose} title="Notification Compliance" subtitle="Consent, sender identity, quiet hours and DND controls" icon="bi-shield-check" wide>
      <div className="pm-card pm-card-pad mb-3"><Badge tone="green" dot>Compliant</Badge>
        <h6 className="mt-3">Compliance controls</h6>
        {[["Opt-out mechanism", "In-app settings + email unsubscribe"], ["Sender identification", "PayMo · noreply@paymo.co.ke"], ["Quiet hours", "10PM–7AM · marketing capped at 3/week"], ["DND compliance", "Telco DND list checked before SMS"], ["Data retention", "2 years, then anonymized"], ["Consent tracking", "Timestamped opt-in/out ledger"]].map(x => <div className="config-row" key={x[0]}><span className="pm-td-sub">{x[0]}</span><b>{x[1]}</b></div>)}
      </div>
      <div className="pm-card pm-card-pad"><h6>Regulatory requirements</h6>
        {[["CBK (Kenya)", "Transaction notifications mandatory"], ["GDPR", "Consent required for marketing"], ["PEPDA", "Data subject rights enforced"], ["IT Act", "2-year log retention"]].map(r => <div className="config-row" key={r[0]}><span className="pm-td-sub">{r[0]}</span><b>{r[1]}</b></div>)}
      </div>
    </Drawer>
  );
}

/* ==================== 22. Template Preview Modal ==================== */
export function TemplatePreviewModal({ open, template, onClose }: { open: boolean; template: string | null; onClose: () => void }) {
  if (!open || !template) return null;
  return (
    <Modal open={open} onClose={onClose} title="Template Preview" subtitle="Notification rendering preview across channels" icon="bi-eye" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">
          {["Push", "SMS", "Email", "WhatsApp"].map(ch => (
            <div key={ch} className="col-md-3">
              <div className="pm-card pm-card-pad text-center cursor-pointer" style={{ border: "2px solid var(--pm-border)" }}>
                <i className={`bi ${ch === "Push" ? "bi-phone" : ch === "SMS" ? "bi-chat-dots" : ch === "Email" ? "bi-envelope" : "bi-whatsapp"}`} style={{ fontSize: "1.5rem", color: "var(--pm-primary)" }} />
                <div className="pm-td-strong mt-1">{ch}</div>
              </div>
            </div>
          ))}
        </div>
        <h6>Push Notification Preview</h6>
        <div style={{ background: "#f8f9fa", borderRadius: 12, padding: "1rem", border: "1px solid var(--pm-border)" }}>
          <div className="d-flex align-items-center gap-2 mb-1"><div style={{ width: 20, height: 20, borderRadius: 4, background: "var(--pm-green)", display: "grid", placeItems: "center", color: "#fff", fontSize: ".6rem", fontWeight: 900 }}>P</div><span style={{ fontWeight: 700, fontSize: ".85rem" }}>PayMo</span><span className="pm-td-sub ms-auto">now</span></div>
          <div style={{ fontSize: ".85rem", fontWeight: 700 }}>Transaction Confirmed ✅</div>
          <div style={{ fontSize: ".8rem", color: "var(--pm-muted)" }}>Hello Jeckonia, your transaction of KES 1,500 was completed. Ref: TXN-99234.</div>
        </div>
        <h6 className="mt-3">SMS Preview</h6>
        <div style={{ background: "#f0f9ff", borderRadius: 12, padding: "1rem", border: "1px solid #bfdbfe" }}>
          <div style={{ fontSize: ".8rem" }}>PayMo: Hello Jeckonia, your KES 1,500 transaction was completed. Ref: TXN-99234. Questions? Call 0800-PA-247</div>
        </div>
        <div className="pm-note mt-3"><i className="bi bi-info-circle me-1" />Variables shown with actual user data for preview purposes.</div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button><button className="btn btn-primary btn-sm" onClick={onClose}>Edit Template</button></div>
    </Modal>
  );
}

/* ==================== 23. Schedule Detail Drawer ==================== */
export function ScheduleDetailDrawer({ open, schedule, onClose }: { open: boolean; schedule: any; onClose: () => void }) {
  if (!open || !schedule) return null;
  return (
    <Drawer open={open} onClose={onClose} title={`${schedule.name}`} subtitle="Schedule details and delivery history" icon="bi-calendar2-week" tone="blue" wide>
      <div className="pm-card pm-card-pad mb-3">
        <div className="d-flex justify-content-between"><Badge tone="green" dot>Active</Badge></div>
        <div className="row g-3 mt-2">
          {[["Template", schedule.template], ["Audience", schedule.audience], ["Channel", schedule.channel], ["Next Send", schedule.nextSend]].map(x => <div className="col-md-3" key={x[0]}><div className="pm-eyebrow">{x[0]}</div><b className="small">{x[1]}</b></div>)}
        </div>
      </div>
      <div className="pm-card pm-card-pad mb-3"><h6>Recent sends</h6>
        {[["Aug 24, 9:00", "45,234 sent", "98.2% delivered", "green"], ["Aug 17, 9:00", "44,890 sent", "97.9% delivered", "green"], ["Aug 10, 9:00", "44,123 sent", "98.1% delivered", "green"]].map(s => <div className="d-flex justify-content-between py-1 border-bottom small" key={s[0]}><span className="mono text-muted">{s[0]}</span><span>{s[1]}</span><Badge tone={s[3]}>{s[2]}</Badge></div>)}
      </div>
      <div className="pm-card pm-card-pad"><h6>Audience criteria</h6>
        {[["Segment", "Active users in last 30 days"], ["Exclusions", "DND registered, opted out"], ["Max recipients", "No limit"], ["Deduplication", "Enabled (24h window)"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b>{x[1]}</b></div>)}
      </div>
    </Drawer>
  );
}

/* ==================== 24. Notification Document Upload Wizard (4 Steps) ==================== */
export function NotificationDocUploadWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [classification, setClassification] = useState("Internal");
  const { push: toast } = useToast();
  const steps = [
    { label: "Type", icon: "bi-folder" },
    { label: "Upload", icon: "bi-cloud-arrow-up" },
    { label: "Permissions", icon: "bi-shield-lock" },
    { label: "Review", icon: "bi-check-lg" },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Upload Notification Document" subtitle={`Step ${step + 1} of 4: ${steps[step].label}`} icon="bi-cloud-arrow-up-fill" tone="blue" size="lg">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && <div className="d-flex flex-column gap-2">
          <div className="pm-eyebrow mb-1">Select document type</div>
          <div className="row g-2">
            {["Template Document", "Compliance Policy", "Provider Agreement", "Brand Guidelines", "Regulatory Filing", "Training Material", "Audit Report", "Rate Card"].map(cat => (
              <div key={cat} className="col-6"><button className="pm-opt w-100"><div className="r" /><span style={{ fontSize: ".82rem" }}>{cat}</span></button></div>
            ))}
          </div>
        </div>}
        {step === 1 && <div className="d-flex flex-column gap-2">
          <label className="form-label">Document Name</label>
          <input className="form-control mb-2" placeholder="e.g. SMS Provider Agreement 2026" />
          <label className="form-label">File</label>
          <div style={{ border: "2px dashed var(--pm-border)", borderRadius: 12, padding: "2rem", textAlign: "center", cursor: "pointer" }}>
            <i className="bi bi-cloud-arrow-up" style={{ fontSize: "2rem", color: "var(--pm-muted)" }} />
            <div style={{ fontSize: ".85rem", margin: ".5rem 0 0", color: "var(--pm-muted)" }}>Click to browse or drag and drop</div>
            <div className="pm-td-sub">PDF, DOC, XLS, PNG, JPG — Max 50MB</div>
          </div>
          <label className="form-label mt-2">Description</label>
          <textarea className="form-control" rows={2} placeholder="Document description..." />
        </div>}
        {step === 2 && <div className="d-flex flex-column gap-2">
          <div className="pm-eyebrow mb-1">Classification</div>
          <div className="row g-2 mb-3">
            {["Public", "Internal", "Confidential", "Restricted"].map(c => (
              <div key={c} className="col"><button className={`pm-opt w-100 ${classification === c ? "active" : ""}`} onClick={() => setClassification(c)}><div className="r" /><span style={{ fontSize: ".78rem" }}>{c}</span></button></div>
            ))}
          </div>
          <div className="pm-eyebrow mb-1">Access permissions</div>
          {["Super Admin Only", "All Admins", "Marketing Team", "Compliance Team"].map(a => (
            <label key={a} className="d-flex align-items-center gap-2 mb-2" style={{ fontSize: ".82rem" }}><input type="checkbox" className="form-check-input" defaultChecked={a === "Super Admin Only"} />{a}</label>
          ))}
        </div>}
        {step === 3 && <div className="pm-card pm-card-pad">
          <div className="pm-eyebrow mb-2">Upload Summary</div>
          <div className="pm-kv"><span className="k">Classification</span><span className="v"><Badge tone={classification === "Restricted" ? "red" : "amber"}>{classification}</Badge></span></div>
          <div className="pm-kv"><span className="k">Access</span><span className="v">Super Admin Only</span></div>
          <div className="pm-kv"><span className="k">Encrypted</span><span className="v">AES-256 at rest</span></div>
          <div className="pm-note mt-3"><i className="bi bi-shield-lock me-1" />Document will be encrypted at rest and access will be audit-logged.</div>
        </div>}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(s => s - 1)}>← Back</button>}
        {step < 3 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(s => s + 1)}>Continue →</button>
          : <button className="btn btn-primary btn-sm" onClick={() => { toast({ kind: "success", title: "Document uploaded" }); onClose(); }}><i className="bi bi-check2 me-1" />Upload Document</button>}
      </div>
    </Modal>
  );
}

/* ==================== 25. Notification Document Preview Modal ==================== */
export function NotificationDocPreviewModal({ open, doc, onClose }: { open: boolean; doc: any; onClose: () => void }) {
  if (!open || !doc) return null;
  return (
    <Modal open={open} onClose={onClose} title={`${doc.name} — Preview`} subtitle={`${doc.category} · Document preview`} icon="bi-eye" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="doc-preview-toolbar">
          <div className="d-flex gap-2 align-items-center">
            <Badge tone={doc.status === "Active" ? "green" : "blue"}>{doc.status || "Active"}</Badge>
            <span className="pm-td-sub">{doc.classification}</span>
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
          <hr className="doc-preview-divider" />
          <div className="doc-preview-body">
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: ".75rem" }}>{doc.name}</h3>
            <p style={{ fontSize: ".85rem", lineHeight: 1.7 }}>
              This document pertains to the <b>{doc.category}</b> operations of PayMo Digital Bank Ltd. 
              Classification: <b>{doc.classification}</b>. Uploaded: <b>{doc.uploadedAt || "Unknown"}</b>.
            </p>
            <p style={{ fontSize: ".85rem", lineHeight: 1.7 }}>
              This is a preview of the document content. In production, the full document rendering 
              would be displayed here with proper formatting, images, and layout.
            </p>
            <div style={{ background: "var(--pm-blue-soft)", borderRadius: 8, padding: "1rem", marginTop: "1rem" }}>
              <div style={{ fontSize: ".8rem", color: "var(--pm-primary)" }}>
                <i className="bi bi-info-circle me-1" />
                Document ID: {doc.id || "DOC-001"} · Version: 1.0 · Status: {doc.status || "Active"}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-primary btn-sm" onClick={onClose}><i className="bi bi-download me-1" />Download PDF</button>
      </div>
    </Modal>
  );
}

/* ==================== 26. Notification Document Replace Wizard (3 Steps) ==================== */
export function NotificationDocReplaceWizard({ open, doc, onClose }: { open: boolean; doc: any; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const { push: toast } = useToast();
  if (!open || !doc) return null;
  const steps = [
    { label: "Confirm", icon: "bi-exclamation-triangle" },
    { label: "Upload", icon: "bi-cloud-arrow-up" },
    { label: "Review", icon: "bi-check-lg" },
  ];

  return (
    <Modal open={open} onClose={onClose} title={`Replace: ${doc.name}`} subtitle={`Step ${step + 1} of 3: ${steps[step].label}`} icon="bi-arrow-repeat" tone="amber" size="lg">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / 3) * 100}%` }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && <div className="d-flex flex-column gap-2">
          <div className="pm-note mb-3" style={{ borderLeft: "3px solid var(--pm-amber)", background: "var(--pm-warn-soft)" }}>
            <div className="pm-td-strong" style={{ color: "var(--pm-amber)" }}><i className="bi bi-exclamation-triangle me-1" />Document Replacement</div>
            <div className="mt-1">The current version will be archived and replaced. All references will be updated.</div>
          </div>
          <div className="pm-card pm-card-pad">
            <div className="pm-eyebrow mb-1">Current Document</div>
            <div className="pm-td-strong">{doc.name}</div>
            <div className="pm-td-sub">{doc.category} · {doc.classification} · {doc.uploadedAt || "Unknown"}</div>
          </div>
          <label className="d-flex align-items-center gap-2 mt-2" style={{ fontSize: ".82rem" }}><input type="checkbox" className="form-check-input" />I understand the current version will be archived</label>
          <label className="d-flex align-items-center gap-2" style={{ fontSize: ".82rem" }}><input type="checkbox" className="form-check-input" />I confirm I have the authority to replace this document</label>
        </div>}
        {step === 1 && <div className="d-flex flex-column gap-2">
          <label className="form-label">New version file</label>
          <div style={{ border: "2px dashed var(--pm-border)", borderRadius: 12, padding: "2rem", textAlign: "center", cursor: "pointer" }}>
            <i className="bi bi-cloud-arrow-up" style={{ fontSize: "2rem", color: "var(--pm-muted)" }} />
            <div style={{ fontSize: ".85rem", margin: ".5rem 0 0", color: "var(--pm-muted)" }}>Drop replacement file here</div>
          </div>
          <label className="form-label mt-2">Version notes</label>
          <textarea className="form-control" rows={2} placeholder="Why is this document being replaced..." />
        </div>}
        {step === 2 && <div className="pm-card pm-card-pad">
          <div className="pm-eyebrow mb-2">Replacement Summary</div>
          <div className="pm-kv"><span className="k">Document</span><span className="v">{doc.name}</span></div>
          <div className="pm-kv"><span className="k">Current version</span><span className="v">Archived</span></div>
          <div className="pm-kv"><span className="k">New version</span><span className="v">Active</span></div>
          <div className="pm-kv"><span className="k">Audit log</span><span className="v">Will be recorded</span></div>
          <div className="pm-note mt-3"><i className="bi bi-shield-lock me-1" />Replacement will be executed immediately upon confirmation.</div>
        </div>}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(s => s - 1)}>← Back</button>}
        {step < 2 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(s => s + 1)}>Continue →</button>
          : <button className="btn btn-primary btn-sm" onClick={() => { toast({ kind: "success", title: "Document replaced" }); onClose(); }}><i className="bi bi-arrow-repeat me-1" />Replace Document</button>}
      </div>
    </Modal>
  );
}

/* ==================== 27. User Preference Detail Modal ==================== */
export function PreferenceDetailModal({ open, pref, onClose }: { open: boolean; pref: any; onClose: () => void }) {
  const { push } = useToast();
  if (!open || !pref) return null;
  return (
    <Modal open={open} onClose={onClose} title={`${pref.name}`} subtitle="Preference detail and user impact analysis" icon="bi-person-check" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">
          {[["Default", pref.defaultValue], ["Opt-out rate", pref.optedOut], ["Can opt out", pref.canOptOut], ["Regulatory", pref.canOptOut === "No" ? "Mandatory" : "Optional"]].map(x => <div className="col-md-3" key={x[0]}><div className="pm-card pm-card-pad text-center"><div className="pm-eyebrow">{x[0]}</div><div className="fw-bold">{x[1]}</div></div></div>)}
        </div>
        <h6>User breakdown</h6>
        {[["Users with this ON", "144,892"], ["Users who opted out", "3,500"], ["Users with custom override", "892"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span>{x[0]}</span><b>{x[1]}</b></div>)}
        <div className="pm-note mt-3"><i className="bi bi-info-circle me-1" />Changes to this preference will affect {pref.canOptOut === "No" ? "all users (mandatory)" : "opted-in users only"}.</div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button><button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Preference detail exported" }); onClose(); }}>Export</button></div>
    </Modal>
  );
}

/* ==================== 28. Analytics Overview Modal ==================== */
export function AnalyticsOverviewModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title="Notification Analytics Overview" subtitle="Cross-channel performance and engagement metrics" icon="bi-graph-up" tone="blue" size="xl">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">
          {[["Total sent (30d)", "42.3M", "blue"], ["Avg delivery rate", "98.1%", "green"], ["Open rate", "31.2%", "blue"], ["Click rate", "8.4%", "blue"], ["Opt-out rate", "0.3%", "green"], ["Revenue attributed", "KES 12.4M", "green"]].map(x => <div className="col-md-2" key={x[0]}><div className="pm-card pm-card-pad text-center"><div className="pm-eyebrow">{x[0]}</div><div className="fw-bold" style={{ fontSize: ".95rem" }}>{x[1]}</div></div></div>)}
        </div>
        <h6>Channel performance</h6>
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Channel</th><th>Sent</th><th>Delivered</th><th>Opened</th><th>Clicked</th><th>Opt-out</th></tr></thead>
            <tbody>
              {[["Push", "23.4M", "22.9M (97.8%)", "7.4M (32.3%)", "2.1M (9.1%)", "0.1%"], ["SMS", "8.9M", "8.8M (98.5%)", "N/A", "N/A", "0.2%"], ["Email", "4.6M", "4.5M (98.3%)", "1.4M (31.4%)", "387K (8.6%)", "0.8%"], ["In-app", "12.3M", "12.3M (100%)", "4.1M (33.1%)", "1.1M (8.7%)", "0.1%"], ["WhatsApp", "1.2M", "1.1M (96.3%)", "345K (30.8%)", "98K (8.6%)", "0.4%"]].map(r => <tr key={r[0]}><td className="pm-td-strong">{r[0]}</td><td className="pm-num">{r[1]}</td><td className="pm-num">{r[2]}</td><td className="pm-num">{r[3]}</td><td className="pm-num">{r[4]}</td><td className="pm-num">{r[5]}</td></tr>)}
            </tbody>
          </table>
        </div>
        <h6 className="mt-3">Top performing templates</h6>
        {[["TXN receipt", "Push", "42.3% open rate", "green"], ["Security alert", "Push + SMS", "38.7% open rate", "green"], ["Monthly statement", "Email", "28.9% open rate", "blue"], ["Dormancy nudge", "Push", "24.1% open rate", "amber"], ["Promotion offer", "Email", "18.2% open rate", "amber"]].map(t => <div className="d-flex justify-content-between py-1 border-bottom small" key={t[0]}><div><b>{t[0]}</b> <span className="text-muted">· {t[1]}</span></div><Badge tone={t[3]}>{t[2]}</Badge></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ==================== 29. Notification Send History Modal ==================== */
export function SendHistoryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title="Send History" subtitle="Complete log of all notification dispatches" icon="bi-clock-history" tone="blue" size="xl">
      <div className="pm-modal-body">
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Time</th><th>Template</th><th>Channel</th><th>Audience</th><th>Sent</th><th>Delivered</th><th>Status</th></tr></thead>
            <tbody>
              {[["Today 14:32", "TXN receipt", "Push + In-app", "Per-user", "1", "1 (100%)", "green"], ["Today 12:00", "Monthly statement", "Email", "All active (148K)", "148,392", "145,789 (98.2%)", "green"], ["Today 09:00", "Dormancy nudge", "Push + SMS", "Dormant 90d (12K)", "12,567", "12,345 (98.2%)", "green"], ["Yesterday 17:00", "KYC reminder", "Push + Email", "Pending KYC (8K)", "8,923", "8,701 (97.5%)", "green"], ["Yesterday 14:30", "Promotion offer", "Push + Email", "Opted-in (45K)", "45,234", "43,567 (96.3%)", "amber"], ["Yesterday 09:00", "Security alert", "Push + SMS", "Per-user", "3", "3 (100%)", "green"]].map((r, i) => <tr key={i}><td className="mono pm-td-sub">{r[0]}</td><td className="pm-td-strong">{r[1]}</td><td>{r[2]}</td><td className="pm-td-sub">{r[3]}</td><td className="pm-num">{r[4]}</td><td className="pm-num">{r[5]}</td><td><Badge tone={r[6]} dot>{r[6] === "green" ? "OK" : "Partial"}</Badge></td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ==================== 30. Channel Add Wizard (4 Steps) ==================== */
export function ChannelAddWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const { push: toast } = useToast();
  const steps = [
    { label: "Provider", icon: "bi-broadcast" },
    { label: "Credentials", icon: "bi-key" },
    { label: "Config", icon: "bi-sliders" },
    { label: "Test", icon: "bi-send-check" },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Add Notification Channel" subtitle={`Step ${step + 1} of 4: ${steps[step].label}`} icon="bi-plus-circle-fill" tone="green" size="lg">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && <div className="d-flex flex-column gap-2">
          <div className="pm-eyebrow mb-1">Select provider</div>
          <div className="row g-2">
            {[["Push (iOS)", "APNs", "bi-phone"], ["Push (Android)", "FCM", "bi-phone"], ["SMS", "Africa's Talking", "bi-chat-dots"], ["Email", "SendGrid / Mailgun", "bi-envelope"], ["WhatsApp", "Meta Business", "bi-whatsapp"], ["Telegram", "Bot API", "bi-telegram"], ["WeChat", "Official Account", "bi-globe"]].map(p => (
              <div key={p[0]} className="col-6"><button className="pm-opt w-100"><div className="r" /><div className="text-start"><div className="pm-td-strong"><i className={`bi ${p[2]} me-1`} />{p[0]}</div><div className="pm-td-sub">{p[1]}</div></div></button></div>
            ))}
          </div>
        </div>}
        {step === 1 && <div className="d-flex flex-column gap-2">
          <div className="pm-eyebrow mb-1">Provider credentials</div>
          <label className="form-label">API Key</label>
          <input className="form-control mono" placeholder="Enter provider API key" type="password" />
          <label className="form-label">Secret / Token</label>
          <input className="form-control mono" placeholder="Enter provider secret" type="password" />
          <label className="form-label">Sender ID</label>
          <input className="form-control" placeholder="e.g. PayMo" />
          <div className="pm-note"><i className="bi bi-shield-lock me-1" />Credentials are encrypted at rest. Never share API keys.</div>
        </div>}
        {step === 2 && <div className="d-flex flex-column gap-2">
          <div className="pm-eyebrow mb-1">Delivery configuration</div>
          <div className="row g-2">
            <div className="col-md-6"><label className="form-label">Rate limit</label><div className="input-group"><input className="form-control" defaultValue="200" /><span className="input-group-text">req/min</span></div></div>
            <div className="col-md-6"><label className="form-label">Retry policy</label><select className="form-select"><option>3 attempts · exponential backoff</option><option>5 attempts · linear backoff</option><option>No retries</option></select></div>
          </div>
          <label className="form-label">Channel status</label>
          <div className="d-flex gap-2">
            {([ ["Active", true], ["Beta", false], ["Disabled", false] ] as [string, boolean][]).map(([label, active]) => <button key={label} className="btn btn-sm btn-outline-secondary"><div className="r" style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: active ? "var(--pm-green)" : "#ccc", marginRight: 6 }} />{label}</button>)}
          </div>
          <label className="form-label mt-2">Quiet hours compliance</label>
          <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label small">Respect user quiet hours settings</label></div>
          <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label small">Check DND list before sending</label></div>
        </div>}
        {step === 3 && <div className="pm-card pm-card-pad">
          <div className="pm-eyebrow mb-2">Channel Summary</div>
          <div className="pm-kv"><span className="k">Provider</span><span className="v">Push (iOS) — APNs</span></div>
          <div className="pm-kv"><span className="k">Sender ID</span><span className="v">PayMo</span></div>
          <div className="pm-kv"><span className="k">Rate limit</span><span className="v">200 req/min</span></div>
          <div className="pm-kv"><span className="k">Retries</span><span className="v">3 · exponential</span></div>
          <div className="pm-kv"><span className="k">Quiet hours</span><span className="v">Enabled</span></div>
          <div className="pm-note mt-3"><i className="bi bi-send me-1" />A test notification will be sent to verify connectivity.</div>
        </div>}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(s => s - 1)}>← Back</button>}
        {step < 3 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(s => s + 1)}>Continue →</button>
          : <button className="btn btn-primary btn-sm" onClick={() => { toast({ kind: "success", title: "Channel added" }); onClose(); }}><i className="bi bi-check2 me-1" />Add Channel & Test</button>}
      </div>
    </Modal>
  );
}

/* ==================== 31. Schedule Add Wizard (4 Steps) ==================== */
export function ScheduleAddWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const { push: toast } = useToast();
  const steps = [
    { label: "Template", icon: "bi-file-text" },
    { label: "Audience", icon: "bi-people" },
    { label: "Timing", icon: "bi-clock" },
    { label: "Review", icon: "bi-check-lg" },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Create Scheduled Notification" subtitle={`Step ${step + 1} of 4: ${steps[step].label}`} icon="bi-calendar-plus" tone="blue" size="lg">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && <div className="d-flex flex-column gap-2">
          <div className="pm-eyebrow mb-1">Select template</div>
          {[["KYC expiring 7d", "Compliance", "Push + Email"], ["Monthly statement", "Engagement", "Email"], ["Dormancy nudge", "Engagement", "Push + SMS"], ["Feature highlight", "Marketing", "Push + Email"], ["Investor update", "VIP", "Email"]].map(t => (
            <button key={t[0]} className="pm-opt"><div className="r" /><div className="flex-grow-1"><div className="pm-td-strong">{t[0]}</div><div className="pm-td-sub">{t[1]} · {t[2]}</div></div></button>
          ))}
        </div>}
        {step === 1 && <div className="d-flex flex-column gap-2">
          <div className="pm-eyebrow mb-1">Target audience</div>
          {[["All active users", "148,392 users"], ["VIP clients", "2,345 users"], ["Dormant 90d+", "12,567 users"], ["Pending KYC", "8,923 users"], ["Custom segment", "Define criteria"]].map(a => (
            <button key={a[0]} className="pm-opt"><div className="r" /><div className="flex-grow-1"><div className="pm-td-strong">{a[0]}</div><div className="pm-td-sub">{a[1]}</div></div></button>
          ))}
        </div>}
        {step === 2 && <div className="d-flex flex-column gap-2">
          <label className="form-label">Frequency</label>
          <div className="row g-2 mb-3">
            {[["Daily", "bi-calendar-day"], ["Weekly", "bi-calendar-week"], ["Monthly", "bi-calendar-month"], ["Quarterly", "bi-calendar3"]].map(f => (
              <div key={f[0]} className="col-3"><button className="pm-opt w-100"><i className={`bi ${f[1]}`} style={{ fontSize: "1.2rem" }} /><span style={{ fontSize: ".82rem" }}>{f[0]}</span></button></div>
            ))}
          </div>
          <label className="form-label">Send time</label>
          <input className="form-control" type="time" defaultValue="09:00" />
          <label className="form-label">Timezone</label>
          <select className="form-select"><option>Per-user timezone</option><option>Africa/Nairobi (EAT)</option><option>UTC</option></select>
          <label className="form-label">Channel</label>
          <select className="form-select"><option>Push + Email</option><option>SMS only</option><option>Multi-channel</option><option>Email only</option></select>
        </div>}
        {step === 3 && <div className="pm-card pm-card-pad">
          <div className="pm-eyebrow mb-2">Schedule Summary</div>
          <div className="pm-kv"><span className="k">Template</span><span className="v">KYC expiring 7d</span></div>
          <div className="pm-kv"><span className="k">Audience</span><span className="v">Pending KYC (8,923)</span></div>
          <div className="pm-kv"><span className="k">Frequency</span><span className="v">Weekly</span></div>
          <div className="pm-kv"><span className="k">Send time</span><span className="v">Monday 9:00 AM EAT</span></div>
          <div className="pm-kv"><span className="k">Channels</span><span className="v">Push + Email</span></div>
          <div className="pm-note mt-3"><i className="bi bi-calendar me-1" />Schedule will be activated immediately after creation.</div>
        </div>}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(s => s - 1)}>← Back</button>}
        {step < 3 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(s => s + 1)}>Continue →</button>
          : <button className="btn btn-primary btn-sm" onClick={() => { toast({ kind: "success", title: "Schedule created" }); onClose(); }}><i className="bi bi-check2 me-1" />Create Schedule</button>}
      </div>
    </Modal>
  );
}

/* ==================== 32. Preference Add Wizard (3 Steps) ==================== */
export function PreferenceAddWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const { push: toast } = useToast();
  const steps = [
    { label: "Details", icon: "bi-info-circle" },
    { label: "Policy", icon: "bi-shield" },
    { label: "Review", icon: "bi-check-lg" },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Add User Preference" subtitle={`Step ${step + 1} of 3: ${steps[step].label}`} icon="bi-person-plus" tone="green" size="lg">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / 3) * 100}%` }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && <div className="d-flex flex-column gap-2">
          <label className="form-label">Preference name</label>
          <input className="form-control mb-2" placeholder="e.g. Payment alerts" />
          <label className="form-label">Category</label>
          <select className="form-select mb-2"><option>Transactional</option><option>Security</option><option>Marketing</option><option>Engagement</option><option>Support</option></select>
          <label className="form-label">Description</label>
          <textarea className="form-control" rows={2} placeholder="What this preference controls..." />
        </div>}
        {step === 1 && <div className="d-flex flex-column gap-2">
          <label className="form-label">Default value</label>
          <div className="d-flex gap-2 mb-3">
            <button className="btn btn-sm btn-primary">On</button>
            <button className="btn btn-sm btn-outline-secondary">Off</button>
          </div>
          <label className="form-label">Can users opt out?</label>
          <div className="d-flex gap-2 mb-3">
            <button className="btn btn-sm btn-outline-secondary">Yes</button>
            <button className="btn btn-sm btn-primary">No (mandatory)</button>
          </div>
          <label className="form-label">Regulatory requirement</label>
          <select className="form-select"><option>None</option><option>CBK (transaction mandatory)</option><option>GDPR (consent required)</option><option>PEPDA (data subject rights)</option></select>
        </div>}
        {step === 2 && <div className="pm-card pm-card-pad">
          <div className="pm-eyebrow mb-2">Preference Summary</div>
          <div className="pm-kv"><span className="k">Name</span><span className="v">Payment alerts</span></div>
          <div className="pm-kv"><span className="k">Category</span><span className="v">Transactional</span></div>
          <div className="pm-kv"><span className="k">Default</span><span className="v">On</span></div>
          <div className="pm-kv"><span className="k">Opt-out</span><span className="v">No (mandatory)</span></div>
          <div className="pm-kv"><span className="k">Regulatory</span><span className="v">CBK (transaction mandatory)</span></div>
          <div className="pm-note mt-3"><i className="bi bi-shield-lock me-1" />This preference will be added to all user accounts with the specified default.</div>
        </div>}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(s => s - 1)}>← Back</button>}
        {step < 2 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(s => s + 1)}>Continue →</button>
          : <button className="btn btn-primary btn-sm" onClick={() => { toast({ kind: "success", title: "Preference created" }); onClose(); }}><i className="bi bi-check2 me-1" />Create Preference</button>}
      </div>
    </Modal>
  );
}

/* ==================== 33. Notification Settings Drawer ==================== */
export function NotificationSettingsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  void useToast();
  if (!open) return null;
  return (
    <Drawer open={open} onClose={onClose} title="Notification Settings" subtitle="Global notification system configuration" icon="bi-gear" wide>
      <div className="pm-card pm-card-pad mb-3"><h6>Delivery settings</h6>
        {[["Max retries per notification", "3 attempts"], ["Retry backoff", "Exponential (1s, 5s, 25s)"], ["Queue timeout", "30 seconds"], ["Batch size", "1000 notifications"], ["Rate limit per channel", "200 req/min"]].map(x => <div className="config-row" key={x[0]}><span className="pm-td-sub">{x[0]}</span><b>{x[1]}</b></div>)}
      </div>
      <div className="pm-card pm-card-pad mb-3"><h6>Storage & retention</h6>
        {[["Log retention", "90 days"], ["Analytics retention", "12 months"], ["Audit trail", "2 years (immutable)"], ["Template versioning", "Last 10 versions"], ["Failed notification log", "30 days"]].map(x => <div className="config-row" key={x[0]}><span className="pm-td-sub">{x[0]}</span><b>{x[1]}</b></div>)}
      </div>
      <div className="pm-card pm-card-pad"><h6>Security</h6>
        {[["Encryption", "AES-256 at rest"], ["API key rotation", "Every 90 days"], ["IP whitelist", "Enabled"], ["2FA for config changes", "Required"], ["Webhook signatures", "HMAC-SHA256"]].map(x => <div className="config-row" key={x[0]}><span className="pm-td-sub">{x[0]}</span><b>{x[1]}</b></div>)}
      </div>
      <div className="pm-note mt-3"><i className="bi bi-info-circle me-1" />Settings changes are logged and require Super Admin privileges.</div>
    </Drawer>
  );
}
