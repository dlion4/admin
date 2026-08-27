import { useState, useMemo, useCallback } from "react";
import { Badge, useToast } from "../../../components/ui";
import { AddRecordModal, EditRecordModal, DeleteRecordWizard, LockUnlockModal } from "../../../components/AdminControls";
import {
  ChannelDetailDrawer, NotificationDetailModal, TemplateEditorModal,
  DeliveryFailureModal, ChannelConfigModal, QuietHoursConfigModal,
  CostOptimizationModal, QueueDetailModal, AnalyticsDetailModal,
  CategoryTemplatesModal, UnsubscribeDetailModal, CostBreakdownModal,
  ComplianceAuditModal, EmergencyActionsModal, AdminPermissionsDrawer,
  AdminActivityLogModal, DataExportModal, BulkSendWizard, ABTestWizard,
  ChannelHealthCheckModal, ComplianceDrawer, TemplatePreviewModal,
  ScheduleDetailDrawer, NotificationDocUploadWizard, NotificationDocPreviewModal,
  NotificationDocReplaceWizard, PreferenceDetailModal, AnalyticsOverviewModal,
  SendHistoryModal, ChannelAddWizard, ScheduleAddWizard, PreferenceAddWizard,
  NotificationSettingsDrawer,
} from "../modals/NotificationModals";

/* ---- Interfaces ---- */
interface ChannelRecord { id: string; name: string; provider: string; status: string; sent: string; delivered: string; failed: string; cost24h: string; costMonth: string; locked: boolean; lockedBy?: string; lockedAt?: string; lockReason?: string; }
interface CategoryRecord { id: string; name: string; templates: string; channels: string; frequency: string; optOut: string; locked: boolean; lockedBy?: string; lockedAt?: string; lockReason?: string; }
interface QueueRecord { id: string; time: string; channel: string; user: string; template: string; error: string; retry: string; status: string; locked: boolean; lockedBy?: string; lockedAt?: string; lockReason?: string; }
interface PreferenceRecord { id: string; name: string; defaultValue: string; optedOut: string; canOptOut: string; locked: boolean; lockedBy?: string; lockedAt?: string; lockReason?: string; }
interface ScheduleRecord { id: string; name: string; template: string; audience: string; channel: string; nextSend: string; status: string; locked: boolean; lockedBy?: string; lockedAt?: string; lockReason?: string; }
interface DocumentRecord { id: string; name: string; category: string; classification: string; status: string; uploadedAt: string; locked: boolean; lockedBy?: string; lockedAt?: string; lockReason?: string; }

/* ---- (Admin controls via shared AdminControls component) ---- */

/* ---- Initial data ---- */
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

const initDocuments: DocumentRecord[] = [
  { id: "nd-001", name: "SMS Provider Agreement 2026", category: "Provider Agreement", classification: "Confidential", status: "Active", uploadedAt: "Jan 2024", locked: false },
  { id: "nd-002", name: "Push Notification Policy", category: "Compliance Policy", classification: "Internal", status: "Active", uploadedAt: "Mar 2024", locked: false },
  { id: "nd-003", name: "Email Marketing Guidelines", category: "Brand Guidelines", classification: "Internal", status: "Active", uploadedAt: "Jun 2024", locked: false },
  { id: "nd-004", name: "CBK Notification Compliance", category: "Regulatory Filing", classification: "Restricted", status: "Active", uploadedAt: "Jan 2024", locked: true },
  { id: "nd-005", name: "WhatsApp Business Terms", category: "Provider Agreement", classification: "Confidential", status: "Active", uploadedAt: "Aug 2024", locked: false },
  { id: "nd-006", name: "Notification Audit Report Q2", category: "Audit Report", classification: "Confidential", status: "Active", uploadedAt: "Aug 2026", locked: false },
  { id: "nd-007", name: "Template Style Guide v2", category: "Brand Guidelines", classification: "Internal", status: "Active", uploadedAt: "Jul 2026", locked: false },
  { id: "nd-008", name: "DND Compliance Report", category: "Regulatory Filing", classification: "Restricted", status: "Active", uploadedAt: "Aug 2026", locked: true },
];

const channelFields: { key: string; label: string; placeholder: string; type?: string; options?: string[] }[] = [
  { key: "name", label: "Channel Name", placeholder: "e.g. Push (iOS)" },
  { key: "provider", label: "Provider", placeholder: "e.g. APNs", options: ["APNs", "FCM", "Africa's Talking", "SendGrid", "Built-in", "Meta"] },
  { key: "status", label: "Status", placeholder: "", options: ["Active", "Beta", "Disabled"] },
];
const categoryFields: { key: string; label: string; placeholder: string; type?: string; options?: string[] }[] = [
  { key: "name", label: "Category Name", placeholder: "e.g. Transactional" },
  { key: "templates", label: "Template Types", placeholder: "e.g. Receipt, confirmation" },
  { key: "channels", label: "Channels", placeholder: "e.g. Push + In-app + SMS" },
  { key: "frequency", label: "Frequency", placeholder: "e.g. Per transaction" },
];
const prefFields: { key: string; label: string; placeholder: string; type?: string; options?: string[] }[] = [
  { key: "name", label: "Preference Name", placeholder: "e.g. Marketing SMS" },
  { key: "defaultValue", label: "Default Value", placeholder: "", options: ["On", "Off"] },
  { key: "canOptOut", label: "Can Opt Out", placeholder: "", options: ["Yes", "No"] },
];
const scheduleFields: { key: string; label: string; placeholder: string; type?: string; options?: string[] }[] = [
  { key: "name", label: "Schedule Name", placeholder: "e.g. Daily dormant nudge" },
  { key: "template", label: "Template", placeholder: "e.g. Dormancy nudge" },
  { key: "audience", label: "Audience", placeholder: "e.g. Dormant 90d users" },
  { key: "channel", label: "Channel", placeholder: "e.g. Push + SMS" },
  { key: "nextSend", label: "Next Send", placeholder: "e.g. Tomorrow 9AM" },
];

const TABS = [
  { id: "channels", label: "Channels", icon: "bi-broadcast" },
  { id: "categories", label: "Categories & Templates", icon: "bi-files" },
  { id: "queue", label: "Queue & Failures", icon: "bi-exclamation-triangle" },
  { id: "preferences", label: "User Preferences", icon: "bi-person-check" },
  { id: "schedules", label: "Scheduled Sends", icon: "bi-calendar2-week" },
  { id: "documents", label: "Documents", icon: "bi-folder2-open" },
  { id: "analytics", label: "Analytics & Reports", icon: "bi-graph-up" },
  { id: "compliance", label: "Compliance & Audit", icon: "bi-shield-check" },
];

/* IDs generated via Date.now() */

export function NotificationCenter({ signal: _signal, onNavigate: _onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  const { push: toast } = useToast();
  const [tab, setTab] = useState("channels");
  const [q, setQ] = useState("");

  /* ---- Data state ---- */
  const [channels, setChannels] = useState(initChannels);
  const [categories, setCategories] = useState(initCategories);
  const [queueData] = useState(initQueue);
  const [preferences, setPreferences] = useState(initPreferences);
  const [schedules, setSchedules] = useState(initSchedules);
  const [documents, setDocuments] = useState(initDocuments);

  /* ---- Generic modal state ---- */
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

  /* ---- Document modal state ---- */
  const [docUploadOpen, setDocUploadOpen] = useState(false);
  const [docPreview, setDocPreview] = useState<DocumentRecord | null>(null);
  const [docReplace, setDocReplace] = useState<DocumentRecord | null>(null);
  const [editDoc, setEditDoc] = useState<DocumentRecord | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<DocumentRecord | null>(null);
  const [lockDoc, setLockDoc] = useState<DocumentRecord | null>(null);

  /* ---- Wizard/feature modal state ---- */
  const [bulkSendOpen, setBulkSendOpen] = useState(false);
  const [abTestOpen, setAbTestOpen] = useState(false);
  const [channelHealthOpen, setChannelHealthOpen] = useState(false);
  const [quietHoursOpen, setQuietHoursOpen] = useState(false);
  const [costOptOpen, setCostOptOpen] = useState(false);
  const [costBreakdownOpen, setCostBreakdownOpen] = useState(false);
  const [queueDetailOpen, setQueueDetailOpen] = useState(false);
  const [analyticsOverviewOpen, setAnalyticsOverviewOpen] = useState(false);
  const [sendHistoryOpen, setSendHistoryOpen] = useState(false);
  const [templatePreview, setTemplatePreview] = useState<string | null>(null);
  const [templateEditOpen, setTemplateEditOpen] = useState(false);
  const [channelConfig, setChannelConfig] = useState<string | null>(null);
  const [channelDetail, setChannelDetail] = useState<string | null>(null);
  const [categoryDetail, setCategoryDetail] = useState<string | null>(null);
  const [prefDetail, setPrefDetail] = useState<PreferenceRecord | null>(null);
  const [scheduleDetail, setScheduleDetail] = useState<ScheduleRecord | null>(null);
  const [unsubscribeOpen, setUnsubscribeOpen] = useState(false);
  const [analyticsChannel, setAnalyticsChannel] = useState<string | null>(null);

  /* ---- Admin feature modal state ---- */
  const [auditTrailOpen, setAuditTrailOpen] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [activityLogOpen, setActivityLogOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [complianceDrawerOpen, setComplianceDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  /* ---- Filtered channels ---- */
  const filtered = useMemo(() => channels.filter(r => [r.name, r.provider, r.status].join(" ").toLowerCase().includes(q.toLowerCase())), [q, channels]);

  /* ---- Lock toggle helper ---- */
  const toggleLock = useCallback(<T extends { id: string; locked: boolean }>(_items: T[], setItems: (fn: (p: T[]) => T[]) => void, id: string, locked: boolean) => {
    setItems(p => p.map(x => x.id === id ? { ...x, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Manual lock" : undefined } as T : x));
  }, []);

  return (
    <div className="pm-page-content notification-page" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", overflow: "hidden" }}>

      {/* ================= Header (matches paymo-ltd) ================= */}
      <div className="pm-card pm-card-pad">
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <div className="d-flex align-items-center gap-3">
            <div style={{ width: 44, height: 44, borderRadius: 12, display: "grid", placeItems: "center", background: "linear-gradient(135deg, var(--pm-green), #0b8f52)", color: "#fff", fontWeight: 900, fontSize: "1.2rem", boxShadow: "0 8px 20px -8px var(--pm-green)", flex: "none" }}>
              <i className="bi bi-bell" />
            </div>
            <div>
              <div style={{ fontFamily: "Sora", fontWeight: 700, fontSize: "1.05rem" }}>Notification Center</div>
              <div className="pm-td-sub">Communications / Channels / Analytics / Compliance</div>
            </div>
          </div>
          <div className="ms-auto d-flex gap-2 flex-wrap">
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setAuditTrailOpen(true)}><i className="bi bi-clock-history me-1" />Audit Trail</button>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setPermissionsOpen(true)}><i className="bi bi-shield-lock me-1" />Permissions</button>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setExportOpen(true)}><i className="bi bi-arrow-left-right me-1" />Export / Import</button>
            <button className="btn btn-sm btn-outline-danger" onClick={() => setEmergencyOpen(true)}><i className="bi bi-exclamation-triangle me-1" />Emergency</button>
            <button className="btn btn-sm btn-outline-primary" onClick={() => setSettingsOpen(true)}><i className="bi bi-gear me-1" />Settings</button>
            <button className="btn btn-sm btn-primary" onClick={() => setBulkSendOpen(true)}><i className="bi bi-send me-1" />Bulk Send</button>
          </div>
        </div>
      </div>

      {/* ================= Hero (enhanced) ================= */}
      <div className="pm-hero notification-hero mb-0">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <div className="pm-eyebrow text-white-50">NOTIFICATION OPERATIONS · LIVE</div>
            <div className="pm-hero-value">1.72M <span className="fs-6 fw-normal text-white-50">notifications sent today</span></div>
            <div className="small text-white-50 mt-2">98.1% weighted delivery · {channels.length} channels healthy · quiet hours and consent enforced</div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <div className="pm-hero-chip cursor-pointer" onClick={() => setCostBreakdownOpen(true)}><div className="l">Monthly cost</div><div className="v">KES 7.09M</div></div>
            <div className="pm-hero-chip cursor-pointer" onClick={() => setQueueDetailOpen(true)}><div className="l">Open queue</div><div className="v text-warning">{queueData.length}</div></div>
            <div className="pm-hero-chip cursor-pointer" onClick={() => setCostOptOpen(true)}><div className="l">Savings potential</div><div className="v text-success">KES 1.96M</div></div>
          </div>
        </div>
      </div>

      {/* ================= Key Metrics Strip ================= */}
      <div className="row g-2">
        {[
          { label: "Active channels", value: `${channels.filter(c => c.status === "Active").length} / ${channels.length}`, action: () => setTab("channels"), icon: "bi-broadcast", tone: "green" },
          { label: "Delivered (24h)", value: "1.69M", action: () => setAnalyticsOverviewOpen(true), icon: "bi-check2-circle", tone: "blue" },
          { label: "Categories", value: String(categories.length), action: () => setTab("categories"), icon: "bi-files", tone: "violet" },
          { label: "Templates", value: "23", action: () => setTemplateEditOpen(true), icon: "bi-file-earmark-text", tone: "blue" },
          { label: "Documents", value: String(documents.length), action: () => setTab("documents"), icon: "bi-folder2-open", tone: "amber" },
          { label: "Compliance", value: "9 / 9", action: () => setComplianceDrawerOpen(true), icon: "bi-shield-check", tone: "green" },
        ].map(m => (
          <div key={m.label} className="col-6 col-md-4 col-xl-2">
            <button className="pm-health w-100 text-start" onClick={m.action}>
              <div className="pm-eyebrow mb-1"><i className={`bi ${m.icon} me-1`} />{m.label}</div>
              <div className="pm-stat-value">{m.value}</div>
            </button>
          </div>
        ))}
      </div>

      {/* ================= Tabs ================= */}
      <div className="pm-card">
        <div className="pm-tabs overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} className={`pm-tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
              <i className={`bi ${t.icon}`} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================= TAB: Channels ================= */}
      {tab === "channels" && (
        <section>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div>
              <h3>Notification channel overview</h3>
              <p>Provider health, delivery performance and cost by channel.</p>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <div className="pm-search"><i className="bi bi-search" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search channel" /></div>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setChannelHealthOpen(true)}><i className="bi bi-heart-pulse me-1" />Health Check</button>
              <button className="btn btn-sm btn-outline-primary" onClick={() => setChannelConfig("SMS")}><i className="bi bi-sliders me-1" />Config</button>
              <button className="btn btn-sm btn-primary" onClick={() => setAddChannel(true)}><i className="bi bi-plus-circle me-1" />Add channel</button>
            </div>
          </div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Channel</th><th>Provider</th><th>Status</th><th>Sent (24h)</th><th>Delivered</th><th>Failed</th><th>Cost/mo</th><th className="text-end">Actions</th></tr></thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id} className="cursor-pointer" onClick={() => setChannelDetail(c.name)}>
                      <td className="pm-td-strong">{c.name}{c.locked && <i className="bi bi-lock-fill ms-1" style={{ fontSize: ".6rem", color: "var(--pm-amber)" }} />}</td>
                      <td>{c.provider}</td>
                      <td><Badge tone={c.status === "Beta" ? "amber" : "green"} dot>{c.status}</Badge></td>
                      <td className="pm-num">{c.sent}</td>
                      <td className="pm-num">{c.delivered}</td>
                      <td className="pm-num">{c.failed}</td>
                      <td className="pm-num">{c.costMonth}</td>
                      <td className="text-end text-nowrap">
                        <button className="btn btn-sm btn-outline-primary me-1" style={{ fontSize: ".66rem" }} onClick={e => { e.stopPropagation(); setEditChannel(c); }}><i className="bi bi-pencil-square" /></button>
                        <button className="btn btn-sm btn-outline-secondary me-1" style={{ fontSize: ".66rem" }} onClick={e => { e.stopPropagation(); setLockChannel(c); }}><i className={`bi ${c.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                        <button className="btn btn-sm btn-outline-danger" style={{ fontSize: ".66rem" }} onClick={e => { e.stopPropagation(); setDeleteChannel(c); }}><i className="bi bi-trash3" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="pm-eyebrow mb-2 mt-3">Quick Actions</div>
          <div className="row g-2">
            {[
              { label: "Bulk Send", icon: "bi-send", action: () => setBulkSendOpen(true) },
              { label: "A/B Test", icon: "bi-split-canvas", action: () => setAbTestOpen(true) },
              { label: "Health Check", icon: "bi-heart-pulse", action: () => setChannelHealthOpen(true) },
              { label: "Cost Analysis", icon: "bi-cash-stack", action: () => setCostBreakdownOpen(true) },
              { label: "Send History", icon: "bi-clock-history", action: () => setSendHistoryOpen(true) },
              { label: "Quiet Hours", icon: "bi-moon-stars", action: () => setQuietHoursOpen(true) },
            ].map(a => (
              <div key={a.label} className="col-6 col-md-4 col-lg-2">
                <button className="pm-qa" onClick={a.action}>
                  <i className={`bi ${a.icon}`} style={{ fontSize: "1.1rem" }} />
                  <span className="t">{a.label}</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================= TAB: Categories & Templates ================= */}
      {tab === "categories" && (
        <section>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div><h3>Notification categories & templates</h3><p>Template families, channels, cadence and opt-out policy.</p></div>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setTemplateEditOpen(true)}><i className="bi bi-pencil me-1" />Edit templates</button>
              <button className="btn btn-sm btn-outline-primary" onClick={() => setAbTestOpen(true)}><i className="bi bi-split-canvas me-1" />A/B test</button>
              <button className="btn btn-sm btn-primary" onClick={() => setAddCategory(true)}><i className="bi bi-plus-circle me-1" />Add category</button>
            </div>
          </div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Category</th><th>Templates</th><th>Channels</th><th>Frequency</th><th>Opt-out</th><th className="text-end">Actions</th></tr></thead>
                <tbody>
                  {categories.map(c => (
                    <tr key={c.id} className="cursor-pointer" onClick={() => setCategoryDetail(c.name)}>
                      <td className="pm-td-strong">{c.name}{c.locked && <i className="bi bi-lock-fill ms-1" style={{ fontSize: ".6rem", color: "var(--pm-amber)" }} />}</td>
                      <td style={{ fontSize: ".82rem" }}>{c.templates}</td>
                      <td className="pm-td-sub">{c.channels}</td>
                      <td>{c.frequency}</td>
                      <td><Badge tone={c.optOut === "Yes" ? "green" : "grey"}>{c.optOut}</Badge></td>
                      <td className="text-end text-nowrap">
                        <button className="btn btn-sm btn-outline-primary me-1" style={{ fontSize: ".66rem" }} onClick={e => { e.stopPropagation(); setEditCategory(c); }}><i className="bi bi-pencil-square" /></button>
                        <button className="btn btn-sm btn-outline-secondary me-1" style={{ fontSize: ".66rem" }} onClick={e => { e.stopPropagation(); setLockCategory(c); }}><i className={`bi ${c.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                        <button className="btn btn-sm btn-outline-danger" style={{ fontSize: ".66rem" }} onClick={e => { e.stopPropagation(); setDeleteCategory(c); }}><i className="bi bi-trash3" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="pm-eyebrow mb-2 mt-3">Template Actions</div>
          <div className="row g-2">
            {[
              { label: "Template Editor", icon: "bi-pencil", action: () => setTemplateEditOpen(true) },
              { label: "Preview Template", icon: "bi-eye", action: () => setTemplatePreview("TXN receipt") },
              { label: "A/B Test", icon: "bi-split-canvas", action: () => setAbTestOpen(true) },
              { label: "Bulk Send", icon: "bi-send", action: () => setBulkSendOpen(true) },
            ].map(a => (
              <div key={a.label} className="col-6 col-md-4 col-lg-3">
                <button className="pm-qa" onClick={a.action}>
                  <i className={`bi ${a.icon}`} style={{ fontSize: "1.1rem" }} />
                  <span className="t">{a.label}</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================= TAB: Queue & Failures ================= */}
      {tab === "queue" && (
        <section>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div><h3>Notification queue & failures</h3><p>Retries, permanent failures and provider error details.</p></div>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setQueueDetailOpen(true)}><i className="bi bi-exclamation-triangle me-1" />Queue detail</button>
              <button className="btn btn-sm btn-outline-primary" onClick={() => toast({ kind: "success", title: "3 notifications queued for retry" })}><i className="bi bi-arrow-repeat me-1" />Retry all</button>
            </div>
          </div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Time</th><th>Channel</th><th>User</th><th>Template</th><th>Error</th><th>Retry</th><th>Status</th><th className="text-end">Actions</th></tr></thead>
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
                      <td className="text-end text-nowrap">
                        <button className="btn btn-sm btn-outline-primary me-1" style={{ fontSize: ".66rem" }} onClick={() => toast({ kind: "success", title: `Retrying ${q.id}` })}><i className="bi bi-arrow-repeat" /></button>
                        <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".66rem" }} onClick={() => toast({ kind: "warn", title: `Dismissed ${q.id}` })}><i className="bi bi-x-lg" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ================= TAB: User Preferences ================= */}
      {tab === "preferences" && (
        <section>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div><h3>User preference management</h3><p>Default preferences, opt-out rates and regulatory controls.</p></div>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setUnsubscribeOpen(true)}><i className="bi bi-person-dash me-1" />Unsubscribes</button>
              <button className="btn btn-sm btn-primary" onClick={() => setAddPref(true)}><i className="bi bi-plus-circle me-1" />Add preference</button>
            </div>
          </div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Preference</th><th>Default</th><th>% opted out</th><th>Can opt out</th><th className="text-end">Actions</th></tr></thead>
                <tbody>
                  {preferences.map(p => (
                    <tr key={p.id} className="cursor-pointer" onClick={() => setPrefDetail(p)}>
                      <td className="pm-td-strong">{p.name}{p.locked && <i className="bi bi-lock-fill ms-1" style={{ fontSize: ".6rem", color: "var(--pm-amber)" }} />}</td>
                      <td>{p.defaultValue}</td>
                      <td className="pm-num">{p.optedOut}</td>
                      <td><Badge tone={p.canOptOut === "Yes" ? "green" : "grey"}>{p.canOptOut}</Badge></td>
                      <td className="text-end text-nowrap">
                        <button className="btn btn-sm btn-outline-primary me-1" style={{ fontSize: ".66rem" }} onClick={e => { e.stopPropagation(); setEditPref(p); }}><i className="bi bi-pencil-square" /></button>
                        <button className="btn btn-sm btn-outline-secondary me-1" style={{ fontSize: ".66rem" }} onClick={e => { e.stopPropagation(); setLockPref(p); }}><i className={`bi ${p.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                        <button className="btn btn-sm btn-outline-danger" style={{ fontSize: ".66rem" }} onClick={e => { e.stopPropagation(); setDeletePref(p); }}><i className="bi bi-trash3" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ================= TAB: Scheduled Sends ================= */}
      {tab === "schedules" && (
        <section>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div><h3>Scheduled notifications</h3><p>Recurring sends, audiences, channels and next delivery times.</p></div>
            <button className="btn btn-sm btn-primary" onClick={() => setAddSchedule(true)}><i className="bi bi-plus-circle me-1" />Add schedule</button>
          </div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Schedule</th><th>Template</th><th>Audience</th><th>Channel</th><th>Next send</th><th>Status</th><th className="text-end">Actions</th></tr></thead>
                <tbody>
                  {schedules.map(s => (
                    <tr key={s.id} className="cursor-pointer" onClick={() => setScheduleDetail(s)}>
                      <td className="pm-td-strong">{s.name}{s.locked && <i className="bi bi-lock-fill ms-1" style={{ fontSize: ".6rem", color: "var(--pm-amber)" }} />}</td>
                      <td className="pm-td-strong">{s.template}</td>
                      <td style={{ fontSize: ".82rem" }}>{s.audience}</td>
                      <td>{s.channel}</td>
                      <td className="pm-td-sub">{s.nextSend}</td>
                      <td><Badge tone="green" dot>{s.status}</Badge></td>
                      <td className="text-end text-nowrap">
                        <button className="btn btn-sm btn-outline-primary me-1" style={{ fontSize: ".66rem" }} onClick={e => { e.stopPropagation(); setEditSchedule(s); }}><i className="bi bi-pencil-square" /></button>
                        <button className="btn btn-sm btn-outline-secondary me-1" style={{ fontSize: ".66rem" }} onClick={e => { e.stopPropagation(); setLockSchedule(s); }}><i className={`bi ${s.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                        <button className="btn btn-sm btn-outline-danger" style={{ fontSize: ".66rem" }} onClick={e => { e.stopPropagation(); setDeleteSchedule(s); }}><i className="bi bi-trash3" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ================= TAB: Documents ================= */}
      {tab === "documents" && (
        <section>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div><h3>Notification documents & policies</h3><p>Provider agreements, compliance filings, brand guidelines and audit reports.</p></div>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-primary" onClick={() => setDocUploadOpen(true)}><i className="bi bi-cloud-arrow-up me-1" />Upload document</button>
            </div>
          </div>
          <div className="row g-2 mb-3">
            {[
              { label: "Total Documents", value: String(documents.length), action: () => setTab("documents"), icon: "bi-folder2-open" },
              { label: "Confidential", value: String(documents.filter(d => d.classification === "Confidential").length), action: () => setTab("documents"), icon: "bi-shield-lock" },
              { label: "Restricted", value: String(documents.filter(d => d.classification === "Restricted").length), action: () => setTab("documents"), icon: "bi-shield-exclamation" },
              { label: "Locked", value: String(documents.filter(d => d.locked).length), action: () => setTab("documents"), icon: "bi-lock-fill" },
            ].map(c => (
              <div key={c.label} className="col-6 col-lg-3">
                <button className="pm-health w-100 text-start" onClick={c.action}>
                  <div className="pm-eyebrow mb-1"><i className={`bi ${c.icon} me-1`} />{c.label}</div>
                  <div className="pm-stat-value">{c.value}</div>
                </button>
              </div>
            ))}
          </div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Document</th><th>Category</th><th>Classification</th><th>Status</th><th>Uploaded</th><th className="text-end">Actions</th></tr></thead>
                <tbody>
                  {documents.map(d => (
                    <tr key={d.id}>
                      <td className="pm-td-strong">{d.name}{d.locked && <i className="bi bi-lock-fill ms-1" style={{ fontSize: ".6rem", color: "var(--pm-amber)" }} />}</td>
                      <td><Badge tone="blue">{d.category}</Badge></td>
                      <td><Badge tone={d.classification === "Restricted" ? "red" : d.classification === "Confidential" ? "amber" : "green"}>{d.classification}</Badge></td>
                      <td>{d.locked ? <Badge tone="amber" dot>Locked</Badge> : <Badge tone="green" dot>Active</Badge>}</td>
                      <td className="pm-td-sub">{d.uploadedAt}</td>
                      <td className="text-end text-nowrap">
                        <button className="btn btn-sm btn-outline-success me-1" style={{ fontSize: ".66rem" }} onClick={() => setDocPreview(d)} title="Preview"><i className="bi bi-eye" /></button>
                        <button className="btn btn-sm btn-outline-primary me-1" style={{ fontSize: ".66rem" }} onClick={() => setEditDoc(d)} title="Edit"><i className="bi bi-pencil-square" /></button>
                        <button className="btn btn-sm btn-outline-info me-1" style={{ fontSize: ".66rem" }} onClick={() => setDocReplace(d)} title="Replace"><i className="bi bi-arrow-repeat" /></button>
                        <button className="btn btn-sm btn-outline-secondary me-1" style={{ fontSize: ".66rem" }} onClick={() => setLockDoc(d)} title={d.locked ? "Unlock" : "Lock"}><i className={`bi ${d.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                        <button className="btn btn-sm btn-outline-danger" style={{ fontSize: ".66rem" }} onClick={() => setDeleteDoc(d)} title="Delete"><i className="bi bi-trash3" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="pm-eyebrow mb-2 mt-3">Document Actions</div>
          <div className="row g-2">
            {[
              { label: "Upload Document", icon: "bi-cloud-arrow-up", action: () => setDocUploadOpen(true) },
              { label: "Preview Template", icon: "bi-eye", action: () => setTemplatePreview("TXN receipt") },
              { label: "Export Documents", icon: "bi-download", action: () => setExportOpen(true) },
            ].map(a => (
              <div key={a.label} className="col-6 col-md-4 col-lg-3">
                <button className="pm-qa" onClick={a.action}>
                  <i className={`bi ${a.icon}`} style={{ fontSize: "1.1rem" }} />
                  <span className="t">{a.label}</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================= TAB: Analytics & Reports ================= */}
      {tab === "analytics" && (
        <section>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div><h3>Analytics & delivery reports</h3><p>Cross-channel performance, engagement metrics and cost analysis.</p></div>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setSendHistoryOpen(true)}><i className="bi bi-clock-history me-1" />Send history</button>
              <button className="btn btn-sm btn-outline-primary" onClick={() => setExportOpen(true)}><i className="bi bi-download me-1" />Export</button>
            </div>
          </div>
          <div className="row g-2 mb-3">
            {[
              { label: "Total sent (30d)", value: "42.3M", action: () => setAnalyticsOverviewOpen(true), icon: "bi-send" },
              { label: "Delivery rate", value: "98.1%", action: () => setAnalyticsOverviewOpen(true), icon: "bi-check2-circle" },
              { label: "Open rate", value: "31.2%", action: () => setAnalyticsOverviewOpen(true), icon: "bi-envelope-open" },
              { label: "Click rate", value: "8.4%", action: () => setAnalyticsOverviewOpen(true), icon: "bi-cursor" },
              { label: "Cost (MTD)", value: "KES 4.2M", action: () => setCostBreakdownOpen(true), icon: "bi-cash-stack" },
              { label: "Opt-out rate", value: "0.3%", action: () => setUnsubscribeOpen(true), icon: "bi-person-dash" },
            ].map(c => (
              <div key={c.label} className="col-6 col-md-4 col-xl-2">
                <button className="pm-health w-100 text-start" onClick={c.action}>
                  <div className="pm-eyebrow mb-1"><i className={`bi ${c.icon} me-1`} />{c.label}</div>
                  <div className="pm-stat-value">{c.value}</div>
                </button>
              </div>
            ))}
          </div>
          <div className="pm-card pm-card-pad mb-3">
            <div className="pm-eyebrow mb-2">Channel Performance (7d)</div>
            {channels.map(ch => (
              <div key={ch.id} className="d-flex align-items-center gap-3 mb-2 cursor-pointer" onClick={() => setAnalyticsChannel(ch.name)}>
                <span className="pm-td-strong" style={{ width: 140, fontSize: ".82rem" }}>{ch.name}</span>
                <div className="pm-meter" style={{ flex: 1 }}><span style={{ width: ch.delivered.match(/(\d+\.?\d*)%\)/)?.[1] || "98" }} /></div>
                <span className="pm-num" style={{ fontSize: ".82rem", width: 80 }}>{ch.delivered.match(/\(([^)]+)\)/)?.[1] || "98%"}</span>
              </div>
            ))}
          </div>
          <div className="pm-eyebrow mb-2">Analytics Actions</div>
          <div className="row g-2">
            {[
              { label: "Full Analytics", icon: "bi-graph-up", action: () => setAnalyticsOverviewOpen(true) },
              { label: "Cost Breakdown", icon: "bi-cash-stack", action: () => setCostBreakdownOpen(true) },
              { label: "Cost Optimization", icon: "bi-lightbulb", action: () => setCostOptOpen(true) },
              { label: "Send History", icon: "bi-clock-history", action: () => setSendHistoryOpen(true) },
              { label: "Export Report", icon: "bi-download", action: () => setExportOpen(true) },
              { label: "A/B Test", icon: "bi-split-canvas", action: () => setAbTestOpen(true) },
            ].map(a => (
              <div key={a.label} className="col-6 col-md-4 col-lg-3">
                <button className="pm-qa" onClick={a.action}>
                  <i className={`bi ${a.icon}`} style={{ fontSize: "1.1rem" }} />
                  <span className="t">{a.label}</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================= TAB: Compliance & Audit ================= */}
      {tab === "compliance" && (
        <section>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div><h3>Compliance & audit</h3><p>Regulatory controls, consent management and immutable audit trail.</p></div>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setComplianceDrawerOpen(true)}><i className="bi bi-shield-check me-1" />Compliance status</button>
              <button className="btn btn-sm btn-outline-primary" onClick={() => setAuditTrailOpen(true)}><i className="bi bi-clock-history me-1" />Audit trail</button>
            </div>
          </div>
          <div className="row g-2 mb-3">
            {[
              { label: "Compliance Status", value: "9/9 Healthy", tone: "green", action: () => setComplianceDrawerOpen(true), icon: "bi-shield-check" },
              { label: "Consent Ledger", value: "148,392 users", tone: "blue", action: () => setUnsubscribeOpen(true), icon: "bi-person-check" },
              { label: "Audit Entries", value: "12,456", tone: "violet", action: () => setAuditTrailOpen(true), icon: "bi-clock-history" },
              { label: "DND List", value: "4,222", tone: "amber", action: () => setComplianceDrawerOpen(true), icon: "bi-moon-stars" },
            ].map(c => (
              <div key={c.label} className="col-6 col-lg-3">
                <button className="pm-health w-100 text-start" onClick={c.action}>
                  <Badge tone={c.tone}>{c.value}</Badge>
                  <div className="pm-td-strong mt-1">{c.label}</div>
                </button>
              </div>
            ))}
          </div>
          <div className="pm-card pm-card-pad mb-3">
            <div className="pm-eyebrow mb-2">Compliance Controls</div>
            {[
              ["Opt-out mechanism", "In-app settings + email unsubscribe", "green"],
              ["Sender identification", "PayMo · noreply@paymo.co.ke", "green"],
              ["Quiet hours", "10PM–7AM · marketing capped at 3/week", "green"],
              ["DND compliance", "Telco DND list checked before SMS", "green"],
              ["Data retention", "2 years, then anonymized", "green"],
              ["Consent tracking", "Timestamped opt-in/out ledger", "green"],
            ].map(x => (
              <div key={x[0]} className="d-flex justify-content-between align-items-center py-1 border-bottom small">
                <span className="pm-td-sub">{x[0]}</span>
                <div><b>{x[1]}</b> <Badge tone={x[2]} className="ms-1">✓</Badge></div>
              </div>
            ))}
          </div>
          <div className="pm-eyebrow mb-2">Compliance Actions</div>
          <div className="row g-2">
            {[
              { label: "Audit Trail", icon: "bi-clock-history", action: () => setAuditTrailOpen(true) },
              { label: "Admin Activity", icon: "bi-person-video3", action: () => setActivityLogOpen(true) },
              { label: "Export Audit", icon: "bi-download", action: () => setExportOpen(true) },
              { label: "Quiet Hours", icon: "bi-moon-stars", action: () => setQuietHoursOpen(true) },
              { label: "Unsubscribes", icon: "bi-person-dash", action: () => setUnsubscribeOpen(true) },
              { label: "Permissions", icon: "bi-shield-lock", action: () => setPermissionsOpen(true) },
            ].map(a => (
              <div key={a.label} className="col-6 col-md-4 col-lg-3">
                <button className="pm-qa" onClick={a.action}>
                  <i className={`bi ${a.icon}`} style={{ fontSize: "1.1rem" }} />
                  <span className="t">{a.label}</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================= ALL MODALS ================= */}

      {/* Admin Control Modals */}
      <AddRecordModal open={addChannel} onClose={() => setAddChannel(false)} onAdd={(d) => { setChannels(p => [{ id: `ch-${Date.now()}`, ...d, sent: "0", delivered: "0", failed: "0", cost24h: "KES 0", costMonth: "KES 0", locked: false } as ChannelRecord, ...p]); }} title="Channel" fields={channelFields} typeName="Channel" />
      <EditRecordModal record={editChannel} open={!!editChannel} onClose={() => setEditChannel(null)} onSave={(d) => { setChannels(p => p.map(x => x.id === d.id ? d as ChannelRecord : x)); }} typeName="Channel" />
      <DeleteRecordWizard record={deleteChannel} open={!!deleteChannel} onClose={() => setDeleteChannel(null)} onDelete={() => { if (deleteChannel) setChannels(p => p.filter(x => x.id !== deleteChannel.id)); }} typeName="Channel" relatedItems={["Delivery queue", "Provider config", "Template assignments", "Analytics data"]} />
      <LockUnlockModal record={lockChannel} open={!!lockChannel} onClose={() => setLockChannel(null)} onToggle={(locked) => { if (lockChannel) toggleLock(channels, setChannels, lockChannel.id, locked); }} typeName="Channel" />

      <AddRecordModal open={addCategory} onClose={() => setAddCategory(false)} onAdd={(d) => { setCategories(p => [{ id: `nc-${Date.now()}`, ...d, locked: false } as CategoryRecord, ...p]); }} title="Category" fields={categoryFields} typeName="Category" />
      <EditRecordModal record={editCategory} open={!!editCategory} onClose={() => setEditCategory(null)} onSave={(d) => { setCategories(p => p.map(x => x.id === d.id ? d as CategoryRecord : x)); }} typeName="Category" />
      <DeleteRecordWizard record={deleteCategory} open={!!deleteCategory} onClose={() => setDeleteCategory(null)} onDelete={() => { if (deleteCategory) setCategories(p => p.filter(x => x.id !== deleteCategory.id)); }} typeName="Category" relatedItems={["Templates", "Scheduled sends", "Template analytics"]} />
      <LockUnlockModal record={lockCategory} open={!!lockCategory} onClose={() => setLockCategory(null)} onToggle={(locked) => { if (lockCategory) toggleLock(categories, setCategories, lockCategory.id, locked); }} typeName="Category" />

      <AddRecordModal open={addPref} onClose={() => setAddPref(false)} onAdd={(d) => { setPreferences(p => [{ id: `np-${Date.now()}`, ...d, optedOut: "0%", locked: false } as PreferenceRecord, ...p]); }} title="Preference" fields={prefFields} typeName="Preference" />
      <EditRecordModal record={editPref} open={!!editPref} onClose={() => setEditPref(null)} onSave={(d) => { setPreferences(p => p.map(x => x.id === d.id ? d as PreferenceRecord : x)); }} typeName="Preference" />
      <DeleteRecordWizard record={deletePref} open={!!deletePref} onClose={() => setDeletePref(null)} onDelete={() => { if (deletePref) setPreferences(p => p.filter(x => x.id !== deletePref.id)); }} typeName="Preference" relatedItems={["Consent ledger", "User settings", "Delivery rules"]} />
      <LockUnlockModal record={lockPref} open={!!lockPref} onClose={() => setLockPref(null)} onToggle={(locked) => { if (lockPref) toggleLock(preferences, setPreferences, lockPref.id, locked); }} typeName="Preference" />

      <AddRecordModal open={addSchedule} onClose={() => setAddSchedule(false)} onAdd={(d) => { setSchedules(p => [{ id: `ns-${Date.now()}`, ...d, status: "Active", locked: false } as ScheduleRecord, ...p]); }} title="Schedule" fields={scheduleFields} typeName="Schedule" />
      <EditRecordModal record={editSchedule} open={!!editSchedule} onClose={() => setEditSchedule(null)} onSave={(d) => { setSchedules(p => p.map(x => x.id === d.id ? d as ScheduleRecord : x)); }} typeName="Schedule" />
      <DeleteRecordWizard record={deleteSchedule} open={!!deleteSchedule} onClose={() => setDeleteSchedule(null)} onDelete={() => { if (deleteSchedule) setSchedules(p => p.filter(x => x.id !== deleteSchedule.id)); }} typeName="Schedule" relatedItems={["Delivery history", "Audience filters", "Send logs"]} />
      <LockUnlockModal record={lockSchedule} open={!!lockSchedule} onClose={() => setLockSchedule(null)} onToggle={(locked) => { if (lockSchedule) toggleLock(schedules, setSchedules, lockSchedule.id, locked); }} typeName="Schedule" />

      {/* Document Admin Modals */}
      <AddRecordModal open={editDoc !== null && false} onClose={() => setEditDoc(null)} onAdd={() => {}} title="Document" fields={[]} typeName="Document" />
      <EditRecordModal record={editDoc} open={!!editDoc} onClose={() => setEditDoc(null)} onSave={(d) => { setDocuments(p => p.map(x => x.id === d.id ? d as DocumentRecord : x)); }} typeName="Notification Document" />
      <DeleteRecordWizard record={deleteDoc} open={!!deleteDoc} onClose={() => setDeleteDoc(null)} onDelete={() => { if (deleteDoc) setDocuments(p => p.filter(x => x.id !== deleteDoc.id)); }} typeName="Notification Document" relatedItems={["Compliance records", "Audit trail entries", "Template references"]} />
      <LockUnlockModal record={lockDoc} open={!!lockDoc} onClose={() => setLockDoc(null)} onToggle={(locked) => { if (lockDoc) toggleLock(documents, setDocuments, lockDoc.id, locked); }} typeName="Notification Document" />

      {/* Feature/Modal Modals */}
      <ChannelDetailDrawer channel={channelDetail} onClose={() => setChannelDetail(null)} />
      <NotificationDetailModal open={false} onClose={() => {}} />
      <TemplateEditorModal open={templateEditOpen} onClose={() => setTemplateEditOpen(false)} />
      <DeliveryFailureModal open={false} onClose={() => {}} />
      <ChannelConfigModal open={!!channelConfig} channel={channelConfig || ""} onClose={() => setChannelConfig(null)} />
      <QuietHoursConfigModal open={quietHoursOpen} onClose={() => setQuietHoursOpen(false)} />
      <CostOptimizationModal open={costOptOpen} onClose={() => setCostOptOpen(false)} />
      <QueueDetailModal open={queueDetailOpen} onClose={() => setQueueDetailOpen(false)} />
      <AnalyticsDetailModal open={!!analyticsChannel} channel={analyticsChannel || ""} onClose={() => setAnalyticsChannel(null)} />
      <CategoryTemplatesModal open={!!categoryDetail} category={categoryDetail || ""} onClose={() => setCategoryDetail(null)} />
      <UnsubscribeDetailModal open={unsubscribeOpen} onClose={() => setUnsubscribeOpen(false)} />
      <CostBreakdownModal open={costBreakdownOpen} onClose={() => setCostBreakdownOpen(false)} />
      <ComplianceAuditModal open={auditTrailOpen} onClose={() => setAuditTrailOpen(false)} />
      <EmergencyActionsModal open={emergencyOpen} onClose={() => setEmergencyOpen(false)} />
      <AdminPermissionsDrawer open={permissionsOpen} onClose={() => setPermissionsOpen(false)} />
      <AdminActivityLogModal open={activityLogOpen} onClose={() => setActivityLogOpen(false)} />
      <DataExportModal open={exportOpen} onClose={() => setExportOpen(false)} />
      <BulkSendWizard open={bulkSendOpen} onClose={() => setBulkSendOpen(false)} />
      <ABTestWizard open={abTestOpen} onClose={() => setAbTestOpen(false)} />
      <ChannelHealthCheckModal open={channelHealthOpen} onClose={() => setChannelHealthOpen(false)} />
      <ComplianceDrawer open={complianceDrawerOpen} onClose={() => setComplianceDrawerOpen(false)} />
      <TemplatePreviewModal open={!!templatePreview} template={templatePreview} onClose={() => setTemplatePreview(null)} />
      <ScheduleDetailDrawer open={!!scheduleDetail} schedule={scheduleDetail} onClose={() => setScheduleDetail(null)} />
      <NotificationDocUploadWizard open={docUploadOpen} onClose={() => setDocUploadOpen(false)} />
      <NotificationDocPreviewModal open={!!docPreview} doc={docPreview} onClose={() => setDocPreview(null)} />
      <NotificationDocReplaceWizard open={!!docReplace} doc={docReplace} onClose={() => setDocReplace(null)} />
      <PreferenceDetailModal open={!!prefDetail} pref={prefDetail} onClose={() => setPrefDetail(null)} />
      <AnalyticsOverviewModal open={analyticsOverviewOpen} onClose={() => setAnalyticsOverviewOpen(false)} />
      <SendHistoryModal open={sendHistoryOpen} onClose={() => setSendHistoryOpen(false)} />
      <ChannelAddWizard open={false} onClose={() => {}} />
      <ScheduleAddWizard open={false} onClose={() => {}} />
      <PreferenceAddWizard open={false} onClose={() => {}} />
      <NotificationSettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
