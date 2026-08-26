import { useState, useMemo, useCallback } from "react";
import { Badge, Drawer, Modal, Steps, useToast } from "../../../components/ui";
import { AdminRowActions, AddRecordModal, EditRecordModal, DeleteRecordWizard, LockUnlockModal } from "../../../components/AdminControls";

interface ChannelRecord { id: string; name: string; provider: string; status: string; sent: string; delivered: string; failed: string; cost24h: string; costMonth: string; locked: boolean; lockedBy?: string; lockedAt?: string; lockReason?: string; }
interface CategoryRecord { id: string; name: string; templates: string; channels: string; frequency: string; optOut: string; locked: boolean; lockedBy?: string; lockedAt?: string; lockReason?: string; }
interface QueueRecord { id: string; time: string; channel: string; user: string; template: string; error: string; retry: string; status: string; locked: boolean; lockedBy?: string; lockedAt?: string; lockReason?: string; }
interface PreferenceRecord { id: string; name: string; defaultValue: string; optedOut: string; canOptOut: string; locked: boolean; lockedBy?: string; lockedAt?: string; lockReason?: string; }
interface ScheduleRecord { id: string; name: string; template: string; audience: string; channel: string; nextSend: string; status: string; locked: boolean; lockedBy?: string; lockedAt?: string; lockReason?: string; }

const initChannels: ChannelRecord[] = [
  { id: "ch-001", name: "Push (iOS)", provider: "APNs", status: "Active", sent: "234,567", delivered: "228,456 (97.4%)", failed: "6,111 (2.6%)", cost24h: "KES 0", costMonth: "KES 0", locked: false },
  { id: "ch-002", name: "Push (Android)", provider: "FCM", status: "Active", sent: "345,678", delivered: "338,765 (98.0%)", failed: "6,913 (2.0%)", cost24h: "KES 0", costMonth: "KES 0", locked: false },
  { id: "ch-003", name: "SMS", provider: "Africa's Talking", status: "Active", sent: "89,234", delivered: "87,890 (98.5%)", failed: "1,344 (1.5%)", cost24h: "KES 178K", costMonth: "KES 5.3M", locked: false },
  { id: "ch-004", name: "Email", provider: "SendGrid", status: "Active", sent: "45,678", delivered: "44,915 (98.3%)", failed: "763 (1.7%)", cost24h: "KES 23K", costMonth: "KES 690K", locked: false },
  { id: "ch-005", name: "In-app", provider: "Built-in", status: "Active", sent: "1,234,567", delivered: "1,234,567 (100%)", failed: "0 (0%)", cost24h: "KES 0", costMonth: "KES 0", locked: false },
  { id: "ch-006", name: "WhatsApp (Business)", provider: "Meta", status: "Beta", sent: "12,345", delivered: "11,890 (96.3%)", failed: "455 (3.7%)", cost24h: "KES 37K", costMonth: "KES 1.1M", locked: false },
];

const initCategories: CategoryRecord[] = [
  { id: "nc-001", name: "Transactional", templates: "Receipt, confirmation, status update", channels: "Push + In-app + SMS", frequency: "Per transaction", optOut: "No", locked: false },
  { id: "nc-002", name: "Security", templates: "Login alert, device change, 2FA prompt", channels: "Push + SMS", frequency: "Per event", optOut: "No", locked: false },
  { id: "nc-003", name: "Marketing", templates: "Promotions, features, offers", channels: "Push + Email + WhatsApp", frequency: "2–3/week max", optOut: "Yes", locked: false },
  { id: "nc-004", name: "Engagement", templates: "Dormancy nudge, milestone, tips", channels: "Push + In-app", frequency: "1–2/week", optOut: "Yes", locked: false },
  { id: "nc-005", name: "Support", templates: "Ticket updates, resolution, survey", channels: "In-app + Email", frequency: "Per ticket", optOut: "No", locked: false },
  { id: "nc-006", name: "System", templates: "Maintenance, outage, updates", channels: "Push + Email", frequency: "As needed", optOut: "No", locked: false },
  { id: "nc-007", name: "Compliance", templates: "KYC reminders, T&C updates", channels: "Push + SMS + Email", frequency: "As needed", optOut: "No", locked: false },
  { id: "nc-008", name: "VIP", templates: "Manager messages, exclusive offers", channels: "All channels", frequency: "As needed", optOut: "No", locked: false },
];

const initQueue: QueueRecord[] = [
  { id: "nq-001", time: "14:32", channel: "SMS", user: "PAY-12345", template: "TXN receipt", error: "Telco timeout", retry: "2/3", status: "Retrying", locked: false },
  { id: "nq-002", time: "14:30", channel: "Email", user: "PAY-67890", template: "Welcome", error: "Invalid email", retry: "0/3", status: "Bounced", locked: false },
  { id: "nq-003", time: "14:28", channel: "Push", user: "PAY-89012", template: "Security alert", error: "Device token expired", retry: "0/0", status: "Permanent fail", locked: false },
  { id: "nq-004", time: "14:25", channel: "SMS", user: "PAY-11223", template: "KYC reminder", error: "Insufficient balance", retry: "1/3", status: "Retrying", locked: false },
  { id: "nq-005", time: "14:20", channel: "WhatsApp", user: "PAY-44556", template: "Monthly statement", error: "Provider timeout", retry: "1/3", status: "Retrying", locked: false },
];

const initPreferences: PreferenceRecord[] = [
  { id: "np-001", name: "Transaction receipts", defaultValue: "On", optedOut: "2.3%", canOptOut: "No", locked: false },
  { id: "np-002", name: "Security alerts", defaultValue: "On", optedOut: "0.1%", canOptOut: "No", locked: false },
  { id: "np-003", name: "Marketing push", defaultValue: "On", optedOut: "34.5%", canOptOut: "Yes", locked: false },
  { id: "np-004", name: "Marketing email", defaultValue: "On", optedOut: "28.9%", canOptOut: "Yes", locked: false },
  { id: "np-005", name: "Marketing SMS", defaultValue: "Off", optedOut: "N/A", canOptOut: "Yes", locked: false },
  { id: "np-006", name: "Engagement nudges", defaultValue: "On", optedOut: "18.2%", canOptOut: "Yes", locked: false },
  { id: "np-007", name: "Support updates", defaultValue: "On", optedOut: "0.5%", canOptOut: "No", locked: false },
  { id: "np-008", name: "System notifications", defaultValue: "On", optedOut: "0%", canOptOut: "No", locked: false },
  { id: "np-009", name: "WhatsApp messages", defaultValue: "Off", optedOut: "N/A", canOptOut: "Yes", locked: false },
];

const initSchedules: ScheduleRecord[] = [
  { id: "ns-001", name: "Daily — dormant 90d", template: "Dormancy nudge", audience: "Dormant 90d users", channel: "Push + SMS", nextSend: "Tomorrow 9AM", status: "Active", locked: false },
  { id: "ns-002", name: "Weekly — KYC expiry", template: "KYC expiring 7d", audience: "Docs expiring", channel: "Push + Email", nextSend: "Monday 9AM", status: "Active", locked: false },
  { id: "ns-003", name: "Monthly — statement", template: "Monthly statement", audience: "All active users", channel: "Email", nextSend: "Sep 1", status: "Active", locked: false },
  { id: "ns-004", name: "Monthly — new features", template: "Feature highlight", audience: "Opted-in users", channel: "Push + Email", nextSend: "Sep 5", status: "Active", locked: false },
  { id: "ns-005", name: "Quarterly — investor", template: "Investor update", audience: "Investors", channel: "Email", nextSend: "Oct 15", status: "Active", locked: false },
];

const channelFields = [
  { key: "name", label: "Channel Name", placeholder: "e.g. Push (iOS)" },
  { key: "provider", label: "Provider", placeholder: "e.g. APNs", options: ["APNs", "FCM", "Africa's Talking", "SendGrid", "Built-in", "Meta"] },
  { key: "status", label: "Status", options: ["Active", "Beta", "Disabled"] },
];
const categoryFields = [
  { key: "name", label: "Category Name", placeholder: "e.g. Transactional" },
  { key: "templates", label: "Template Types", placeholder: "e.g. Receipt, confirmation" },
  { key: "channels", label: "Channels", placeholder: "e.g. Push + In-app + SMS" },
  { key: "frequency", label: "Frequency", placeholder: "e.g. Per transaction" },
];
const prefFields = [
  { key: "name", label: "Preference Name", placeholder: "e.g. Marketing SMS" },
  { key: "defaultValue", label: "Default Value", options: ["On", "Off"] },
  { key: "canOptOut", label: "Can Opt Out", options: ["Yes", "No"] },
];
const scheduleFields = [
  { key: "name", label: "Schedule Name", placeholder: "e.g. Daily dormant nudge" },
  { key: "template", label: "Template", placeholder: "e.g. Dormancy nudge" },
  { key: "audience", label: "Audience", placeholder: "e.g. Dormant 90d users" },
  { key: "channel", label: "Channel", placeholder: "e.g. Push + SMS" },
  { key: "nextSend", label: "Next Send", placeholder: "e.g. Tomorrow 9AM" },
];

export function NotificationCenter({ signal: _signal }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  const { push } = useToast();
  const [tab, setTab] = useState("channels");
  const [q, setQ] = useState("");
  const [channels, setChannels] = useState(initChannels);
  const [categories, setCategories] = useState(initCategories);
  const [queueData] = useState(initQueue);
  const [preferences, setPreferences] = useState(initPreferences);
  const [schedules, setSchedules] = useState(initSchedules);
  const [drawer, setDrawer] = useState(false);
  const [wizard, setWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [action, setAction] = useState<{ title: string; body: React.ReactNode; icon?: string; tone?: "green" | "red" | "amber" | "blue" | "violet" | "ink" } | null>(null);

  const [addChannel, setAddChannel] = useState(false);
  const [editChannel, setEditChannel] = useState<ChannelRecord | null>(null);
  const [deleteChannel, setDeleteChannel] = useState<ChannelRecord | null>(null);
  const [lockChannel, setLockChannel] = useState<ChannelRecord | null>(null);

  const [addCategory, setAddCategory] = useState(false);
  const [editCategory, setEditCategory] = useState<CategoryRecord | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<CategoryRecord | null>(null);
  const [lockCategory, setLockCategory] = useState<CategoryRecord | null>(null);

  const [addPref, setAddPref] = useState(false);
  const [editPref, setEditPref] = useState<PreferenceRecord | null>(null);
  const [deletePref, setDeletePref] = useState<PreferenceRecord | null>(null);
  const [lockPref, setLockPref] = useState<PreferenceRecord | null>(null);

  const [addSchedule, setAddSchedule] = useState(false);
  const [editSchedule, setEditSchedule] = useState<ScheduleRecord | null>(null);
  const [deleteSchedule, setDeleteSchedule] = useState<ScheduleRecord | null>(null);
  const [lockSchedule, setLockSchedule] = useState<ScheduleRecord | null>(null);

  const filtered = useMemo(() => channels.filter(r => [r.name, r.provider, r.status].join(" ").toLowerCase().includes(q.toLowerCase())), [q, channels]);
  const toggleLock = useCallback(<T extends { id: string; locked: boolean }>(items: T[], setItems: (fn: (p: T[]) => T[]) => void, id: string, locked: boolean) => {
    setItems(p => p.map(x => x.id === id ? { ...x, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Manual lock" : undefined } as T : x));
  }, []);

  return (
    <div className="pm-page-content notification-page">
      <div className="pm-section-head" style={{ marginTop: 0 }}>
        <div>
          <div className="pm-eyebrow">COMMUNICATIONS / PAGE 35</div>
          <h2 className="mb-1">Notification Center</h2>
          <p>Manage channels, templates, preferences, delivery analytics and notification compliance.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setDrawer(true)}><i className="bi bi-shield-check me-1" />Compliance</button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => { setWizardStep(0); setWizard(true); }}><i className="bi bi-file-earmark-plus me-1" />New template</button>
          <button className="btn btn-primary btn-sm" onClick={() => push({ kind: "success", title: "Test notifications queued" })}><i className="bi bi-send me-1" />Test delivery</button>
        </div>
      </div>

      <div className="pm-hero notification-hero mb-3">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <div className="pm-eyebrow text-white-50">NOTIFICATION OPERATIONS · LIVE</div>
            <div className="pm-hero-value">1.72M <span className="fs-6 fw-normal text-white-50">notifications sent today</span></div>
            <div className="small text-white-50 mt-2">98.1% weighted delivery · {channels.length} channels healthy · quiet hours and consent enforced</div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <div className="pm-hero-chip"><div className="l">Monthly cost</div><div className="v">KES 7.09M</div></div>
            <div className="pm-hero-chip"><div className="l">Open queue</div><div className="v text-warning">{queueData.length}</div></div>
            <div className="pm-hero-chip"><div className="l">Savings potential</div><div className="v text-success">KES 1.96M</div></div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-3">
        {[["Active channels", `${channels.filter(c => c.status === "Active").length} / ${channels.length}`, "All providers configured", "bi-broadcast", "green"], ["Delivered (24h)", "1.69M", "98.1% weighted rate", "bi-check2-circle", "blue"], ["Categories", String(categories.length), "Template families", "bi-files", "violet"], ["Compliance", "9 / 9", "Consent and DND healthy", "bi-shield-check", "amber"]].map(x => (
          <div className="col-6 col-xl-3" key={x[0]}><div className="pm-stat"><div className={`pm-stat-ico bg-${x[4]}-soft text-${x[4]}`}><i className={`bi ${x[3]}`} /></div><div className="pm-stat-label">{x[0]}</div><div className="pm-stat-value">{x[1]}</div><div className="pm-stat-foot">{x[2]}</div></div></div>
        ))}
      </div>

      <div className="pm-card mb-3">
        <div className="pm-tabs">
          {[["channels", "Channels", "bi-broadcast"], ["categories", "Categories", "bi-files"], ["queue", "Queue & failures", "bi-exclamation-triangle"], ["preferences", "User preferences", "bi-person-check"], ["schedules", "Scheduled sends", "bi-calendar2-week"]].map(x => (
            <button className={`pm-tab ${tab === x[0] ? "active" : ""}`} key={x[0]} onClick={() => setTab(x[0])}><i className={`bi ${x[2]}`} />{x[1]}</button>
          ))}
        </div>
      </div>

      {tab === "channels" && (
        <section>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div><h3>Notification channel overview</h3><p>Provider health, delivery performance and cost by channel.</p></div>
            <div className="d-flex gap-2 align-items-center">
              <div className="pm-search"><i className="bi bi-search" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search channel" /></div>
              <button className="btn btn-primary btn-sm" onClick={() => setAddChannel(true)}><i className="bi bi-plus-circle me-1" />Add channel</button>
            </div>
          </div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Channel</th><th>Provider</th><th>Status</th><th>Sent (24h)</th><th>Delivered</th><th>Failed</th><th>Cost/mo</th><th className="text-end">Actions</th></tr></thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id}>
                      <td className="pm-td-strong">{c.name}{c.locked && <i className="bi bi-lock-fill ms-1" style={{ fontSize: ".6rem", color: "var(--pm-amber)" }} />}</td>
                      <td>{c.provider}</td>
                      <td><Badge tone={c.status === "Beta" ? "amber" : "green"} dot>{c.status}</Badge></td>
                      <td className="pm-num">{c.sent}</td>
                      <td className="pm-num">{c.delivered}</td>
                      <td className="pm-num">{c.failed}</td>
                      <td className="pm-num">{c.costMonth}</td>
                      <td className="text-end text-nowrap"><AdminRowActions onEdit={() => setEditChannel(c)} onLock={() => setLockChannel(c)} onDelete={() => setDeleteChannel(c)} locked={c.locked} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {tab === "categories" && (
        <section>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div><h3>Notification categories & templates</h3><p>Template families, channels, cadence and opt-out policy.</p></div>
            <button className="btn btn-primary btn-sm" onClick={() => setAddCategory(true)}><i className="bi bi-plus-circle me-1" />Add category</button>
          </div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Category</th><th>Templates</th><th>Channels</th><th>Frequency</th><th>Opt-out</th><th className="text-end">Actions</th></tr></thead>
                <tbody>
                  {categories.map(c => (
                    <tr key={c.id}>
                      <td className="pm-td-strong">{c.name}{c.locked && <i className="bi bi-lock-fill ms-1" style={{ fontSize: ".6rem", color: "var(--pm-amber)" }} />}</td>
                      <td style={{ fontSize: ".82rem" }}>{c.templates}</td>
                      <td className="pm-td-sub">{c.channels}</td>
                      <td>{c.frequency}</td>
                      <td><Badge tone={c.optOut === "Yes" ? "green" : "grey"}>{c.optOut}</Badge></td>
                      <td className="text-end text-nowrap"><AdminRowActions onEdit={() => setEditCategory(c)} onLock={() => setLockCategory(c)} onDelete={() => setDeleteCategory(c)} locked={c.locked} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {tab === "queue" && (
        <section>
          <div className="pm-section-head"><div><h3>Notification queue & failures</h3><p>Retries, permanent failures and provider error details.</p></div></div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Time</th><th>Channel</th><th>User</th><th>Template</th><th>Error</th><th>Retry</th><th>Status</th></tr></thead>
                <tbody>
                  {queueData.map(q => (
                    <tr key={q.id}>
                      <td className="pm-td-sub">{q.time}</td>
                      <td>{q.channel}</td>
                      <td className="pm-td-strong mono">{q.user}</td>
                      <td className="pm-td-strong">{q.template}</td>
                      <td className="pm-td-sub">{q.error}</td>
                      <td className="pm-num">{q.retry}</td>
                      <td><Badge tone={q.status === "Bounced" || q.status.includes("Permanent") ? "red" : "amber"} dot>{q.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {tab === "preferences" && (
        <section>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div><h3>User preference management</h3><p>Default preferences, opt-out rates and regulatory controls.</p></div>
            <button className="btn btn-primary btn-sm" onClick={() => setAddPref(true)}><i className="bi bi-plus-circle me-1" />Add preference</button>
          </div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Preference</th><th>Default</th><th>% opted out</th><th>Can opt out</th><th className="text-end">Actions</th></tr></thead>
                <tbody>
                  {preferences.map(p => (
                    <tr key={p.id}>
                      <td className="pm-td-strong">{p.name}{p.locked && <i className="bi bi-lock-fill ms-1" style={{ fontSize: ".6rem", color: "var(--pm-amber)" }} />}</td>
                      <td>{p.defaultValue}</td>
                      <td className="pm-num">{p.optedOut}</td>
                      <td><Badge tone={p.canOptOut === "Yes" ? "green" : "grey"}>{p.canOptOut}</Badge></td>
                      <td className="text-end text-nowrap"><AdminRowActions onEdit={() => setEditPref(p)} onLock={() => setLockPref(p)} onDelete={() => setDeletePref(p)} locked={p.locked} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {tab === "schedules" && (
        <section>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div><h3>Scheduled notifications</h3><p>Recurring sends, audiences, channels and next delivery times.</p></div>
            <button className="btn btn-primary btn-sm" onClick={() => setAddSchedule(true)}><i className="bi bi-plus-circle me-1" />Add schedule</button>
          </div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Schedule</th><th>Template</th><th>Audience</th><th>Channel</th><th>Next send</th><th>Status</th><th className="text-end">Actions</th></tr></thead>
                <tbody>
                  {schedules.map(s => (
                    <tr key={s.id}>
                      <td className="pm-td-strong">{s.name}{s.locked && <i className="bi bi-lock-fill ms-1" style={{ fontSize: ".6rem", color: "var(--pm-amber)" }} />}</td>
                      <td className="pm-td-strong">{s.template}</td>
                      <td style={{ fontSize: ".82rem" }}>{s.audience}</td>
                      <td>{s.channel}</td>
                      <td className="pm-td-sub">{s.nextSend}</td>
                      <td><Badge tone="green" dot>{s.status}</Badge></td>
                      <td className="text-end text-nowrap"><AdminRowActions onEdit={() => setEditSchedule(s)} onLock={() => setLockSchedule(s)} onDelete={() => setDeleteSchedule(s)} locked={s.locked} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ALL MODALS */}
      {action && <Modal open onClose={() => setAction(null)} title={action.title} subtitle="Super Admin action · delivery and consent changes are logged" icon={action.icon} tone={action.tone}><div className="pm-modal-body">{action.body}</div><div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={() => setAction(null)}>Cancel</button><button className="btn btn-primary" onClick={() => { setAction(null); push({ kind: "success", title: "Notification workspace updated" }); }}>Confirm action</button></div></Modal>}

      {wizard && <Modal open onClose={() => setWizard(false)} title="Create notification template" subtitle={`Step ${wizardStep + 1} of 4: ${["Identity", "Channels", "Content", "Review"][wizardStep]}`} icon="bi-file-earmark-plus" tone="blue" size="lg">
        <Steps current={wizardStep} steps={[{ label: "Identity", icon: "bi-file-text" }, { label: "Channels", icon: "bi-broadcast" }, { label: "Content", icon: "bi-pencil" }, { label: "Review", icon: "bi-check2" }]} />
        <div className="pm-wizard-progress"><span style={{ width: `${(wizardStep + 1) * 25}%` }} /></div>
        <div className="pm-modal-body">
          <div className="row g-3">
            <div className="col-md-7"><label className="form-label">Template name</label><input className="form-control" placeholder="e.g. Transaction receipt" /></div>
            <div className="col-md-5"><label className="form-label">Category</label><select className="form-select"><option>Transactional</option><option>Security</option><option>Marketing</option><option>Engagement</option></select></div>
            <div className="col-12"><label className="form-label">Message body</label><textarea className="form-control" rows={3} placeholder="Hello {{name}}, your PayMo transaction of {{amount}} was completed." /></div>
          </div>
        </div>
        <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={() => wizardStep ? setWizardStep(wizardStep - 1) : setWizard(false)}>{wizardStep ? "Back" : "Cancel"}</button>{wizardStep < 3 ? <button className="btn btn-primary" onClick={() => setWizardStep(wizardStep + 1)}>Continue</button> : <button className="btn btn-primary" onClick={() => { setWizard(false); setWizardStep(0); push({ kind: "success", title: "Template submitted" }); }}>Submit for approval</button>}</div>
      </Modal>}

      <AddRecordModal open={addChannel} onClose={() => setAddChannel(false)} onAdd={(d) => { setChannels(p => [{ id: `ch-${Date.now()}`, ...d, sent: "0", delivered: "0", failed: "0", cost24h: "KES 0", costMonth: "KES 0", locked: false } as ChannelRecord, ...p]); }} title="Channel" fields={channelFields} typeName="Channel" />
      <EditRecordModal record={editChannel} open={!!editChannel} onClose={() => setEditChannel(null)} onSave={(d) => { setChannels(p => p.map(x => x.id === d.id ? d as ChannelRecord : x)); }} typeName="Channel" />
      <DeleteRecordWizard record={deleteChannel} open={!!deleteChannel} onClose={() => setDeleteChannel(null)} onDelete={() => { if (deleteChannel) setChannels(p => p.filter(x => x.id !== deleteChannel.id)); }} typeName="Channel" relatedItems={["Delivery queue", "Provider config", "Template assignments"]} />
      <LockUnlockModal record={lockChannel} open={!!lockChannel} onClose={() => setLockChannel(null)} onToggle={(locked) => { if (lockChannel) toggleLock(channels, setChannels, lockChannel.id, locked); }} typeName="Channel" />

      <AddRecordModal open={addCategory} onClose={() => setAddCategory(false)} onAdd={(d) => { setCategories(p => [{ id: `nc-${Date.now()}`, ...d, locked: false } as CategoryRecord, ...p]); }} title="Category" fields={categoryFields} typeName="Category" />
      <EditRecordModal record={editCategory} open={!!editCategory} onClose={() => setEditCategory(null)} onSave={(d) => { setCategories(p => p.map(x => x.id === d.id ? d as CategoryRecord : x)); }} typeName="Category" />
      <DeleteRecordWizard record={deleteCategory} open={!!deleteCategory} onClose={() => setDeleteCategory(null)} onDelete={() => { if (deleteCategory) setCategories(p => p.filter(x => x.id !== deleteCategory.id)); }} typeName="Category" relatedItems={["Templates", "Scheduled sends"]} />
      <LockUnlockModal record={lockCategory} open={!!lockCategory} onClose={() => setLockCategory(null)} onToggle={(locked) => { if (lockCategory) toggleLock(categories, setCategories, lockCategory.id, locked); }} typeName="Category" />

      <AddRecordModal open={addPref} onClose={() => setAddPref(false)} onAdd={(d) => { setPreferences(p => [{ id: `np-${Date.now()}`, ...d, optedOut: "0%", locked: false } as PreferenceRecord, ...p]); }} title="Preference" fields={prefFields} typeName="Preference" />
      <EditRecordModal record={editPref} open={!!editPref} onClose={() => setEditPref(null)} onSave={(d) => { setPreferences(p => p.map(x => x.id === d.id ? d as PreferenceRecord : x)); }} typeName="Preference" />
      <DeleteRecordWizard record={deletePref} open={!!deletePref} onClose={() => setDeletePref(null)} onDelete={() => { if (deletePref) setPreferences(p => p.filter(x => x.id !== deletePref.id)); }} typeName="Preference" relatedItems={["Consent ledger", "User settings"]} />
      <LockUnlockModal record={lockPref} open={!!lockPref} onClose={() => setLockPref(null)} onToggle={(locked) => { if (lockPref) toggleLock(preferences, setPreferences, lockPref.id, locked); }} typeName="Preference" />

      <AddRecordModal open={addSchedule} onClose={() => setAddSchedule(false)} onAdd={(d) => { setSchedules(p => [{ id: `ns-${Date.now()}`, ...d, status: "Active", locked: false } as ScheduleRecord, ...p]); }} title="Schedule" fields={scheduleFields} typeName="Schedule" />
      <EditRecordModal record={editSchedule} open={!!editSchedule} onClose={() => setEditSchedule(null)} onSave={(d) => { setSchedules(p => p.map(x => x.id === d.id ? d as ScheduleRecord : x)); }} typeName="Schedule" />
      <DeleteRecordWizard record={deleteSchedule} open={!!deleteSchedule} onClose={() => setDeleteSchedule(null)} onDelete={() => { if (deleteSchedule) setSchedules(p => p.filter(x => x.id !== deleteSchedule.id)); }} typeName="Schedule" relatedItems={["Delivery history", "Audience filters"]} />
      <LockUnlockModal record={lockSchedule} open={!!lockSchedule} onClose={() => setLockSchedule(null)} onToggle={(locked) => { if (lockSchedule) toggleLock(schedules, setSchedules, lockSchedule.id, locked); }} typeName="Schedule" />

      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Notification compliance" subtitle="Consent, sender identity, quiet hours and retention controls" icon="bi-shield-check" wide>
        <div className="pm-card pm-card-pad mb-3"><Badge tone="green" dot>Compliant</Badge><h5 className="mt-3">9 of 9 controls healthy</h5><p className="small text-muted">Opt-out mechanisms, sender identification, DND checks and consent tracking are enforced before delivery.</p></div>
        <div className="pm-card pm-card-pad">
          {[["Opt-out mechanism", "In-app settings + email unsubscribe"], ["Sender identification", "PayMo · noreply@paymo.co.ke"], ["Quiet hours", "10PM–7AM · marketing capped at 3/week"], ["DND compliance", "Telco DND list checked before SMS"], ["Data retention", "2 years, then anonymized"], ["Consent tracking", "Timestamped opt-in and opt-out ledger"]].map(x => (<div className="config-row" key={x[0]}><span className="pm-td-sub">{x[0]}</span><b>{x[1]}</b></div>))}
        </div>
      </Drawer>
    </div>
  );
}
