import { useState, useMemo, useCallback } from "react";
import { Badge, Drawer, useToast } from "../../../components/ui";
import { AdminRowActions, AddRecordModal, EditRecordModal, DeleteRecordWizard, LockUnlockModal } from "../../../components/AdminControls";
import {
  BroadcastDetailDrawer, BroadcastAnalyticsModal, BroadcastApprovalModal,
  DryRunModal, BroadcastHistoryDetailModal, CompliancePreCheckModal,
  ChannelComparisonModal, BroadcastWizard, UnsubscribeAnalysisModal,
  BroadcastComparisonModal, BroadcastQuietHoursModal, BroadcastRoiModal, AuditTrailModal,
  ExportDataModal, BroadcastDocumentPreviewModal, CreateDocumentWizard, EmergencyBroadcastWizard,
  ABTestWizard, BroadcastScheduleManagerModal, DeliveryReportModal, ChannelConfigModal,
  ComplianceReportModal, SegmentOverlapModal, BroadcastVersionHistoryModal, BulkOperationsWizard,
  CampaignCloneWizard, CreateSegmentWizard, DataImportWizard, BroadcastArchiveModal,
  BroadcastRetrospectiveModal, UserPreferenceModal, NotificationTemplatePreviewModal,
  BroadcastPerformanceWizard,
} from "../modals/BroadcastModals";

/* ================================================================
   TYPES
   ================================================================ */
interface AudienceRecord { id: string; name: string; count: string; criteria: string; locked: boolean; lockedBy?: string; lockedAt?: string; lockReason?: string; }
interface BroadcastRecord { id: string; date: string; name: string; channel: string; audience: string; sent: string; delivered: string; opened: string; by: string; status: string; locked: boolean; lockedBy?: string; lockedAt?: string; lockReason?: string; }
interface BudgetRecord { id: string; channel: string; monthly: string; used: string; remaining: string; unitCost: string; locked: boolean; lockedBy?: string; lockedAt?: string; lockReason?: string; }
interface TemplateRecord { id: string; name: string; channel: string; purpose: string; lastUsed: string; locked: boolean; lockedBy?: string; lockedAt?: string; lockReason?: string; }
interface BroadcastDocument { id: string; title: string; type: string; author: string; lastUpdated: string; version: string; status: string; content: string; locked: boolean; lockedBy?: string; lockedAt?: string; lockReason?: string; }
interface ScheduledRecord { id: string; date: string; name: string; channel: string; audience: string; status: string; owner: string; locked: boolean; lockedBy?: string; lockedAt?: string; lockReason?: string; }

/* ================================================================
   SEED DATA
   ================================================================ */
const initAudience: AudienceRecord[] = [
  { id: "au-001", name: "All active users", count: "134,210", criteria: "Status = Active, last active < 30d", locked: false },
  { id: "au-002", name: "All users", count: "148,392", criteria: "No filter", locked: false },
  { id: "au-003", name: "New users (7d)", count: "3,200", criteria: "Registered < 7 days ago", locked: false },
  { id: "au-004", name: "Dormant users (30d+)", count: "8,450", criteria: "Last active > 30 days ago", locked: false },
  { id: "au-005", name: "VIP clients", count: "347", criteria: "VIP status ≠ None", locked: false },
  { id: "au-006", name: "Business accounts", count: "8,900", criteria: "Type = Business", locked: false },
  { id: "au-007", name: "Unverified KYC", count: "3,588", criteria: "KYC = Pending or Not started", locked: false },
];

const initBroadcasts: BroadcastRecord[] = [
  { id: "bc-001", date: "Aug 22", name: "Fee reduction notice", channel: "Push + Email", audience: "All active", sent: "134,210", delivered: "131,526 (98%)", opened: "42,123 (32%)", by: "Joseph M.", status: "Sent", locked: false },
  { id: "bc-002", date: "Aug 20", name: "Maintenance window", channel: "Push + SMS", audience: "All users", sent: "148,392", delivered: "146,045 (98.4%)", opened: "—", by: "Ops Manager", status: "Sent", locked: false },
  { id: "bc-003", date: "Aug 18", name: "New feature — Savings Goals", channel: "Push + Email", audience: "Active, not VIP", sent: "125,863", delivered: "123,346 (98%)", opened: "38,901 (31.5%)", by: "Product Lead", status: "Sent", locked: false },
  { id: "bc-004", date: "Aug 15", name: "KYC reminder", channel: "SMS", audience: "Pending KYC", sent: "3,588", delivered: "3,534 (98.5%)", opened: "—", by: "Compliance", status: "Sent", locked: false },
  { id: "bc-005", date: "Aug 10", name: "Promo — fee discount weekend", channel: "Push + WhatsApp", audience: "Dormant 30–90d", sent: "5,230", delivered: "5,089 (97.3%)", opened: "2,345 (46.1%)", by: "Marketing", status: "Sent", locked: false },
];

const initBudget: BudgetRecord[] = [
  { id: "bg-001", channel: "SMS", monthly: "KES 5.5M", used: "KES 3.8M", remaining: "KES 1.7M", unitCost: "KES 2.00", locked: false },
  { id: "bg-002", channel: "Email", monthly: "KES 800K", used: "KES 520K", remaining: "KES 280K", unitCost: "KES 0.50", locked: false },
  { id: "bg-003", channel: "WhatsApp", monthly: "KES 1.2M", used: "KES 780K", remaining: "KES 420K", unitCost: "KES 3.00", locked: false },
  { id: "bg-004", channel: "Push", monthly: "KES 0", used: "KES 0", remaining: "Unlimited", unitCost: "Free", locked: false },
  { id: "bg-005", channel: "In-app", monthly: "KES 0", used: "KES 0", remaining: "Unlimited", unitCost: "Free", locked: false },
];

const initTemplates: TemplateRecord[] = [
  { id: "bt-001", name: "System maintenance", channel: "Push + SMS", purpose: "Planned downtime", lastUsed: "Aug 20", locked: false },
  { id: "bt-002", name: "Fee change announcement", channel: "Push + Email", purpose: "Fee changes", lastUsed: "Aug 22", locked: false },
  { id: "bt-003", name: "New feature launch", channel: "Push + Email", purpose: "Product feature", lastUsed: "Aug 18", locked: false },
  { id: "bt-004", name: "Security advisory", channel: "Push + SMS + Email", purpose: "Security threat", lastUsed: "Aug 5", locked: false },
  { id: "bt-005", name: "Regulatory notice", channel: "Email", purpose: "Legal communications", lastUsed: "Jul 28", locked: false },
  { id: "bt-006", name: "Emergency outage", channel: "Push + SMS", purpose: "Service disruption", lastUsed: "Aug 18", locked: false },
  { id: "bt-007", name: "Promotional offer", channel: "Push + WhatsApp", purpose: "Marketing campaign", lastUsed: "Aug 10", locked: false },
  { id: "bt-008", name: "Re-engagement", channel: "Push + Email", purpose: "Dormant win-back", lastUsed: "Aug 10", locked: false },
];

const initDocuments: BroadcastDocument[] = [
  { id: "doc-001", title: "Broadcast Content Policy", type: "Policy", author: "Compliance", lastUpdated: "Aug 15", version: "v2.1", status: "Active", content: "PayMo Digital Bank Ltd\n\nBROADCAST CONTENT POLICY\n\nThis policy governs all customer-facing communications sent through PayMo's broadcast infrastructure.\n\n1. All broadcasts must pass compliance review before sending.\n2. Customer consent must be verified for each communication channel.\n3. Quiet hours (22:00–07:00 EAT) must be respected for non-critical messages.\n4. Marketing messages must not exceed 3 per week per user.\n5. All transactional messages must be delivered within 60 seconds.\n\nTemplate variables: {{name}}, {{date}}, {{channel}}", locked: false },
  { id: "doc-002", title: "Q3 Broadcast SLA", type: "SLA", author: "Operations", lastUpdated: "Jul 01", version: "v1.0", status: "Active", content: "PayMo Digital Bank Ltd\n\nQUARTERLY BROADCAST SLA — Q3 2026\n\nService Level Agreement for broadcast delivery.\n\nDelivery targets:\n• Push notifications: 99% within 5 seconds\n• SMS: 98% within 30 seconds\n• Email: 95% within 5 minutes\n• WhatsApp: 96% within 10 seconds\n\nUptime: 99.9% availability\nEscalation: {{channel}} team lead within 15 minutes\n\nCompliance: {{date}}", locked: false },
  { id: "doc-003", title: "Emergency Broadcast Protocol", type: "Protocol", author: "Security", lastUpdated: "Aug 05", version: "v3.0", status: "Active", content: "PayMo Digital Bank Ltd\n\nEMERGENCY BROADCAST PROTOCOL\n\nThis document defines the protocol for emergency customer communications.\n\nSeverity levels:\n• CRITICAL: Immediate broadcast to ALL users via ALL channels\n• HIGH: Broadcast to active users within 1 hour\n• MEDIUM: Targeted broadcast within 4 hours\n\nAuthorization required:\n• CRITICAL: CTO or CISO approval\n• HIGH: Security team lead approval\n• MEDIUM: Platform admin approval\n\nCompliance: {{date}}", locked: false },
  { id: "doc-004", title: "GDPR Communication Guidelines", type: "Compliance", author: "Legal", lastUpdated: "Jun 20", version: "v1.3", status: "Active", content: "PayMo Digital Bank Ltd\n\nGDPR COMMUNICATION GUIDELINES\n\nUser data handling for broadcast communications.\n\nConsent requirements:\n• Explicit opt-in required for marketing\n• Transactional: legitimate interest basis\n• Security: legal obligation basis\n\nData retention: Broadcast logs retained for 24 months.\nUser {{name}} rights: access, rectification, erasure.\n\nDPO: dpo@paymo.co.ke\nCompliance: {{date}}", locked: false },
  { id: "doc-005", title: "Channel Provider Contract — Africa's Talking", type: "Contract", author: "Procurement", lastUpdated: "Mar 10", version: "v1.0", status: "Active", content: "PayMo Digital Bank Ltd\n\nSMS PROVIDER SERVICE AGREEMENT\n\nProvider: Africa's Talking\nService: SMS Gateway\n\nTerms:\n• Rate: KES {{amount}} per message\n• SLA: 99.5% uptime\n• Throughput: 100 messages/second\n• Support: 24/7\n\nContract period: {{date}} — Mar 2027", locked: false },
  { id: "doc-006", title: "Broadcast Audit Report — August", type: "Report", author: "Joseph M.", lastUpdated: "Aug 26", version: "v1.0", status: "Draft", content: "PayMo Digital Bank Ltd\n\nBROADCAST AUDIT REPORT — AUGUST 2026\n\nSummary:\n• Total broadcasts: 5\n• Total recipients: 411,483\n• Average delivery rate: 98.1%\n• Average open rate: 32%\n• Budget utilization: 68%\n\nCompliance:\n• All broadcasts passed compliance review\n• Zero regulatory incidents\n• 23 opt-outs (0.02% rate)\n\nRecommendations:\n1. Reduce SMS frequency\n2. Implement A/B testing\n3. Expand WhatsApp channel\n\nPrepared by: {{name}}\nDate: {{date}}", locked: false },
];

const initScheduled: ScheduledRecord[] = [
  { id: "sc-001", date: "Aug 28, 09:00", name: "VIP rewards update", channel: "Push + Email", audience: "VIP clients", status: "Pending approval", owner: "Joseph M.", locked: false },
  { id: "sc-002", date: "Aug 29, 14:00", name: "Security patch notice", channel: "Push + SMS", audience: "All active", status: "Approved", owner: "Compliance", locked: false },
  { id: "sc-003", date: "Sep 1, 10:00", name: "September promo launch", channel: "Push + WhatsApp", audience: "Dormant 30d+", status: "Draft", owner: "Marketing", locked: false },
];

const audienceFields = [
  { key: "name", label: "Segment Name", placeholder: "e.g. High-value users" },
  { key: "count", label: "Est. Count", placeholder: "e.g. 5,000" },
  { key: "criteria", label: "Filter Criteria", placeholder: "e.g. Balance > KES 100K", type: "textarea" as const },
];
const templateFields = [
  { key: "name", label: "Template Name", placeholder: "e.g. Fee change announcement" },
  { key: "channel", label: "Channel", placeholder: "Select channel", options: ["Push", "Push + Email", "Push + SMS", "Push + SMS + Email", "Push + WhatsApp", "Email", "SMS"] },
  { key: "purpose", label: "Purpose", placeholder: "e.g. Fee changes" },
];
const budgetFields = [
  { key: "channel", label: "Channel", placeholder: "Select channel", options: ["SMS", "Email", "WhatsApp", "Push", "In-app"] },
  { key: "monthly", label: "Monthly Budget", placeholder: "e.g. KES 5.5M" },
  { key: "unitCost", label: "Cost Per Unit", placeholder: "e.g. KES 2.00" },
];

/* ================================================================
   MAIN COMPONENT
   ================================================================ */
export function BroadcastMessages({ signal: _signal }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  const { push } = useToast();
  const [tab, setTab] = useState("compose");
  const [q, setQ] = useState("");
  const [audiences, setAudiences] = useState(initAudience);
  const [broadcasts, setBroadcasts] = useState(initBroadcasts);
  const [budget, setBudget] = useState(initBudget);
  const [templates, setTemplates] = useState(initTemplates);
  const [documents, setDocuments] = useState(initDocuments);
  const [scheduled, setScheduled] = useState(initScheduled);
  const [drawer, setDrawer] = useState(false);
  const [wizard, setWizard] = useState(false);

  /* ── Audience modals ── */
  const [addAud, setAddAud] = useState(false);
  const [editAud, setEditAud] = useState<AudienceRecord | null>(null);
  const [deleteAud, setDeleteAud] = useState<AudienceRecord | null>(null);
  const [lockAud, setLockAud] = useState<AudienceRecord | null>(null);

  /* ── Broadcast modals ── */
  const [editBc, setEditBc] = useState<BroadcastRecord | null>(null);
  const [deleteBc, setDeleteBc] = useState<BroadcastRecord | null>(null);
  const [lockBc, setLockBc] = useState<BroadcastRecord | null>(null);
  const [detailBc, setDetailBc] = useState<string | null>(null);
  const [historyDetail, setHistoryDetail] = useState<string | null>(null);
  const [deliveryReport, setDeliveryReport] = useState<string | null>(null);
  const [versionHistory, setVersionHistory] = useState<string | null>(null);
  const [retroBc, setRetroBc] = useState<string | null>(null);

  /* ── Budget modals ── */
  const [addBg, setAddBg] = useState(false);
  const [editBg, setEditBg] = useState<BudgetRecord | null>(null);
  const [deleteBg, setDeleteBg] = useState<BudgetRecord | null>(null);
  const [lockBg, setLockBg] = useState<BudgetRecord | null>(null);

  /* ── Template modals ── */
  const [addTpl, setAddTpl] = useState(false);
  const [editTpl, setEditTpl] = useState<TemplateRecord | null>(null);
  const [deleteTpl, setDeleteTpl] = useState<TemplateRecord | null>(null);
  const [lockTpl, setLockTpl] = useState<TemplateRecord | null>(null);
  const [previewTpl, setPreviewTpl] = useState<TemplateRecord | null>(null);

  /* ── Document modals ── */
  const [addDoc, setAddDoc] = useState(false);
  const [editDoc, setEditDoc] = useState<BroadcastDocument | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<BroadcastDocument | null>(null);
  const [lockDoc, setLockDoc] = useState<BroadcastDocument | null>(null);
  const [previewDoc, setPreviewDoc] = useState<BroadcastDocument | null>(null);

  /* ── Schedule modals ── */
  const [editSc, setEditSc] = useState<ScheduledRecord | null>(null);
  const [deleteSc, setDeleteSc] = useState<ScheduledRecord | null>(null);
  const [lockSc, setLockSc] = useState<ScheduledRecord | null>(null);
  const [approveBc, setApproveBc] = useState(false);

  /* ── Feature modals ── */
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [complianceOpen, setComplianceOpen] = useState(false);
  const [channelCfgOpen, setChannelCfgOpen] = useState(false);
  const [quietHoursOpen, setQuietHoursOpen] = useState(false);
  const [dryRunOpen, setDryRunOpen] = useState(false);
  const [abTestOpen, setABTestOpen] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [scheduleMgrOpen, setScheduleMgrOpen] = useState(false);
  const [segmentOverlapOpen, setSegmentOverlapOpen] = useState(false);
  const [bulkOpsOpen, setBulkOpsOpen] = useState(false);
  const [cloneWizard, setCloneWizard] = useState<string | null>(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [prefOpen, setPrefOpen] = useState(false);
  const [perfReportOpen, setPerfReportOpen] = useState(false);
  const [channelCompareOpen, setChannelCompareOpen] = useState(false);
  const [unsubOpen, setUnsubOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [roiOpen, setRoiOpen] = useState(false);

  /* ── Search & filter ── */
  const filteredAud = useMemo(() => audiences.filter(r => [r.name, r.count, r.criteria].join(" ").toLowerCase().includes(q.toLowerCase())), [q, audiences]);
  const filteredBc = useMemo(() => broadcasts.filter(r => [r.name, r.channel, r.audience, r.by].join(" ").toLowerCase().includes(q.toLowerCase())), [q, broadcasts]);
  const filteredTpl = useMemo(() => templates.filter(r => [r.name, r.channel, r.purpose].join(" ").toLowerCase().includes(q.toLowerCase())), [q, templates]);
  const filteredDoc = useMemo(() => documents.filter(r => [r.title, r.type, r.author].join(" ").toLowerCase().includes(q.toLowerCase())), [q, documents]);
  const filteredBg = useMemo(() => budget.filter(r => [r.channel].join(" ").toLowerCase().includes(q.toLowerCase())), [q, budget]);

  /* ── Lock toggle ── */
  const toggleLock = useCallback(<T extends { id: string; locked: boolean }>(_items: T[], setItems: (fn: (p: T[]) => T[]) => void, id: string, locked: boolean) => {
    setItems(p => p.map(x => x.id === id ? { ...x, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Manual lock" : undefined } as T : x));
  }, []);

  return (
    <div className="pm-page-content broadcast-page">
      {/* ═══════════════ HEADER ═══════════════ */}
      <div className="pm-section-head" style={{ marginTop: 0 }}>
        <div>
          <div className="pm-eyebrow">COMMUNICATIONS / PAGE 36</div>
          <h2 className="mb-1">Broadcast Messages</h2>
          <p>Compose targeted communications, route approvals and monitor delivery across every channel.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setExportOpen(true)}><i className="bi bi-download me-1" />Export data</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setAuditOpen(true)}><i className="bi bi-journal-text me-1" />Audit trail</button>
          <button className="btn btn-outline-danger btn-sm" onClick={() => setEmergencyOpen(true)}><i className="bi bi-exclamation-diamond me-1" />Emergency</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setDrawer(true)}><i className="bi bi-moon-stars me-1" />Quiet hours</button>
          <button className="btn btn-primary btn-sm" onClick={() => setWizard(true)}><i className="bi bi-send me-1" />New broadcast</button>
        </div>
      </div>

      {/* ═══════════════ HERO ═══════════════ */}
      <div className="pm-hero broadcast-hero mb-3">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <div className="pm-eyebrow text-white-50">BROADCAST OPERATIONS · CONSENT AWARE</div>
            <div className="pm-hero-value">{broadcasts.length} <span className="fs-6 fw-normal text-white-50">broadcasts this month</span></div>
            <div className="small text-white-50 mt-2">98.1% weighted delivery · {audiences.find(a => a.name === "All users")?.count} users reachable · approval workflow enforced</div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <div className="pm-hero-chip" onClick={() => setAnalyticsOpen(true)} style={{ cursor: "pointer" }}><div className="l">Recipients reached</div><div className="v">401K</div></div>
            <div className="pm-hero-chip" onClick={() => setChannelCompareOpen(true)} style={{ cursor: "pointer" }}><div className="l">Delivery rate</div><div className="v text-success">98.1%</div></div>
            <div className="pm-hero-chip" onClick={() => setRoiOpen(true)} style={{ cursor: "pointer" }}><div className="l">Budget used</div><div className="v text-warning">KES 5.1M</div></div>
          </div>
        </div>
      </div>

      {/* ═══════════════ STAT CARDS ═══════════════ */}
      <div className="row g-3 mb-3">
        <div className="col-6 col-xl-3"><div className="pm-stat" style={{ cursor: "pointer" }} onClick={() => setAnalyticsOpen(true)}><div className="pm-stat-ico bg-green-soft text-green"><i className="bi bi-send-check" /></div><div className="pm-stat-label">Broadcasts sent</div><div className="pm-stat-value">{String(broadcasts.length)}</div><div className="pm-stat-foot">Last 30 days</div></div></div>
        <div className="col-6 col-xl-3"><div className="pm-stat" style={{ cursor: "pointer" }} onClick={() => setTab("audience")}><div className="pm-stat-ico bg-blue-soft text-blue"><i className="bi bi-people" /></div><div className="pm-stat-label">Users reachable</div><div className="pm-stat-value">148,392</div><div className="pm-stat-foot">Consent filtered</div></div></div>
        <div className="col-6 col-xl-3"><div className="pm-stat" style={{ cursor: "pointer" }} onClick={() => setTab("templates")}><div className="pm-stat-ico bg-violet-soft text-violet"><i className="bi bi-files" /></div><div className="pm-stat-label">Templates</div><div className="pm-stat-value">{String(templates.length)}</div><div className="pm-stat-foot">Approved patterns</div></div></div>
        <div className="col-6 col-xl-3"><div className="pm-stat" style={{ cursor: "pointer" }} onClick={() => setTab("budget")}><div className="pm-stat-ico bg-amber-soft text-amber"><i className="bi bi-wallet2" /></div><div className="pm-stat-label">Budget remaining</div><div className="pm-stat-value">KES 2.4M</div><div className="pm-stat-foot">Of KES 7.5M total</div></div></div>
      </div>

      {/* ═══════════════ TABS ═══════════════ */}
      <div className="pm-card mb-3">
        <div className="pm-tabs">
          {[["compose", "Composer", "bi-pencil-square"], ["audience", "Audience", "bi-people"], ["history", "History", "bi-clock-history"], ["budget", "Budget", "bi-wallet2"], ["templates", "Templates", "bi-files"], ["documents", "Documents", "bi-file-earmark-text"], ["schedules", "Scheduled", "bi-calendar3"], ["settings", "Settings", "bi-gear"]].map(x => (
            <button className={`pm-tab ${tab === x[0] ? "active" : ""}`} key={x[0]} onClick={() => setTab(x[0])}><i className={`bi ${x[2]}`} />{x[1]}</button>
          ))}
        </div>
      </div>

      {/* ═══════════════ TAB: COMPOSE ═══════════════ */}
      {tab === "compose" && (
        <section>
          <div className="pm-section-head"><div><h3>Broadcast composer</h3><p>Draft a channel-aware message with audience, language, schedule and approval controls.</p></div>              <button className="btn btn-primary btn-sm" onClick={() => setWizard(true)}><i className="bi bi-magic me-1" />Guided composer</button></div>
          <div className="pm-card pm-card-pad">
            <div className="row g-3">
              <div className="col-md-7"><label className="form-label">Message name</label><input className="form-control" defaultValue="August product update" /></div>
              <div className="col-md-5"><label className="form-label">Channel</label><select className="form-select"><option>Push + Email</option><option>Push + SMS</option><option>Multi-channel</option></select></div>
              <div className="col-md-6"><label className="form-label">Audience</label><select className="form-select"><option>All active users · 134,210</option><option>VIP clients · 347</option><option>Custom saved filter</option></select></div>
              <div className="col-md-6"><label className="form-label">Language</label><select className="form-select"><option>English</option><option>Swahili</option><option>English + Swahili</option></select></div>
              <div className="col-12"><label className="form-label">Message body</label><textarea className="form-control" rows={4} defaultValue="Hello {{name}}, discover what's new in PayMo this month. Learn more in the app." /></div>
            </div>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <button className="btn btn-outline-secondary" onClick={() => setDryRunOpen(true)}><i className="bi bi-eye me-1" />Dry run</button>
              <button className="btn btn-outline-secondary" onClick={() => { push({ kind: "success", title: "Broadcast saved as draft" }); }}><i className="bi bi-save me-1" />Save draft</button>
              <button className="btn btn-primary" onClick={() => setApproveBc(true)}><i className="bi bi-send-check me-1" />Submit for approval</button>
            </div>
          </div>
          <div className="pm-card pm-card-pad mt-3">
            <h6 className="mb-3">Quick actions</h6>
            <div className="pm-qa-grid">
              <button className="pm-qa" onClick={() => setWizard(true)}><i className="bi bi-magic" /><span className="t">Guided wizard</span></button>
              <button className="pm-qa" onClick={() => setDryRunOpen(true)}><i className="bi bi-eye" /><span className="t">Dry run test</span></button>
              <button className="pm-qa" onClick={() => setComplianceOpen(true)}><i className="bi bi-shield-check" /><span className="t">Compliance check</span></button>
              <button className="pm-qa" onClick={() => setABTestOpen(true)}><i className="bi bi-split-cells" /><span className="t">A/B test</span></button>
              <button className="pm-qa" onClick={() => setEmergencyOpen(true)}><i className="bi bi-exclamation-diamond" /><span className="t">Emergency broadcast</span></button>
              <button className="pm-qa" onClick={() => setScheduleMgrOpen(true)}><i className="bi bi-calendar3" /><span className="t">Schedule manager</span></button>
              <button className="pm-qa" onClick={() => setCloneWizard("Fee reduction notice")}><i className="bi bi-clipboard-plus" /><span className="t">Clone campaign</span></button>
              <button className="pm-qa" onClick={() => setBulkOpsOpen(true)}><i className="bi bi-layers" /><span className="t">Bulk operations</span></button>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ TAB: AUDIENCE ═══════════════ */}
      {tab === "audience" && (
        <section>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div><h3>Audience builder</h3><p>Consent-aware segments available for targeted communication.</p></div>
            <div className="d-flex gap-2 align-items-center">
              <div className="pm-search"><i className="bi bi-search" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search segment" /></div>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setSegmentOverlapOpen(true)}><i className="bi bi-intersect me-1" />Overlap</button>
              <button className="btn btn-primary btn-sm" onClick={() => setAddAud(true)}><i className="bi bi-plus-circle me-1" />Add segment</button>
            </div>
          </div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Segment</th><th>Count</th><th>Criteria</th><th className="text-end">Actions</th></tr></thead>
                <tbody>
                  {filteredAud.map(a => (
                    <tr key={a.id}>
                      <td className="pm-td-strong">{a.name}{a.locked && <i className="bi bi-lock-fill ms-1" style={{ fontSize: ".6rem", color: "var(--pm-amber)" }} />}</td>
                      <td className="pm-num">{a.count}</td>
                      <td className="pm-td-sub">{a.criteria}</td>
                      <td className="text-end text-nowrap"><AdminRowActions onEdit={() => setEditAud(a)} onLock={() => setLockAud(a)} onDelete={() => setDeleteAud(a)} locked={a.locked} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="pm-card pm-card-pad mt-3">
            <h6 className="mb-3">Audience quick actions</h6>
            <div className="pm-qa-grid">
              <button className="pm-qa" onClick={() => setAddAud(true)}><i className="bi bi-plus-circle" /><span className="t">Add segment</span></button>
              <button className="pm-qa" onClick={() => setSegmentOverlapOpen(true)}><i className="bi bi-intersect" /><span className="t">Overlap analysis</span></button>
              <button className="pm-qa" onClick={() => setUnsubOpen(true)}><i className="bi bi-person-dash" /><span className="t">Unsubscribe data</span></button>
              <button className="pm-qa" onClick={() => setPrefOpen(true)}><i className="bi bi-bell" /><span className="t">User preferences</span></button>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ TAB: HISTORY ═══════════════ */}
      {tab === "history" && (
        <section>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div><h3>Recent broadcasts</h3><p>Delivery, open rates, owners and approval status for completed sends.</p></div>
            <div className="d-flex gap-2 align-items-center">
              <div className="pm-search"><i className="bi bi-search" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search broadcasts" /></div>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setAnalyticsOpen(true)}><i className="bi bi-graph-up me-1" />Analytics</button>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setCompareOpen(true)}><i className="bi bi-arrows-angle-contract me-1" />Compare</button>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setRoiOpen(true)}><i className="bi bi-graph-up-arrow me-1" />ROI</button>
            </div>
          </div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Date</th><th>Name</th><th>Channel</th><th>Audience</th><th>Sent</th><th>Delivered</th><th>Opened</th><th>Status</th><th className="text-end">Actions</th></tr></thead>
                <tbody>
                  {filteredBc.map(b => (
                    <tr key={b.id}>
                      <td className="pm-td-sub">{b.date}</td>
                      <td className="pm-td-strong" style={{ cursor: "pointer" }} onClick={() => setDetailBc(b.name)}>{b.name}{b.locked && <i className="bi bi-lock-fill ms-1" style={{ fontSize: ".6rem", color: "var(--pm-amber)" }} />}</td>
                      <td>{b.channel}</td>
                      <td>{b.audience}</td>
                      <td className="pm-num">{b.sent}</td>
                      <td className="pm-num">{b.delivered}</td>
                      <td className="pm-num">{b.opened}</td>
                      <td><Badge tone="green" dot>{b.status}</Badge></td>
                      <td className="text-end text-nowrap">
                        <button className="btn btn-sm btn-outline-info me-1" onClick={() => setDetailBc(b.name)} title="Detail"><i className="bi bi-eye" /></button>
                        <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setDeliveryReport(b.name)} title="Delivery report"><i className="bi bi-truck" /></button>
                        <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setVersionHistory(b.name)} title="Version history"><i className="bi bi-clock-history" /></button>
                        <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setCloneWizard(b.name)} title="Clone"><i className="bi bi-clipboard-plus" /></button>
                        <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setRetroBc(b.name)} title="Retrospective"><i className="bi bi-lightbulb" /></button>
                        <AdminRowActions onEdit={() => setEditBc(b)} onLock={() => setLockBc(b)} onDelete={() => setDeleteBc(b)} locked={b.locked} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ TAB: BUDGET ═══════════════ */}
      {tab === "budget" && (
        <section>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div><h3>Broadcast budget tracker</h3><p>Monthly budget, spend to date, remaining balance and unit cost.</p></div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setRoiOpen(true)}><i className="bi bi-graph-up-arrow me-1" />ROI analysis</button>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => { push({ kind: "success", title: "Budget alerts configured" }); }}><i className="bi bi-bell me-1" />Alerts</button>
              <button className="btn btn-primary btn-sm" onClick={() => setAddBg(true)}><i className="bi bi-plus-circle me-1" />Add budget</button>
            </div>
          </div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Channel</th><th>Monthly budget</th><th>Used (MTD)</th><th>Remaining</th><th>Cost/unit</th><th className="text-end">Actions</th></tr></thead>
                <tbody>
                  {filteredBg.map(b => (
                    <tr key={b.id}>
                      <td className="pm-td-strong">{b.channel}{b.locked && <i className="bi bi-lock-fill ms-1" style={{ fontSize: ".6rem", color: "var(--pm-amber)" }} />}</td>
                      <td className="pm-num">{b.monthly}</td>
                      <td className="pm-num">{b.used}</td>
                      <td className="pm-num">{b.remaining}</td>
                      <td className="pm-num">{b.unitCost}</td>
                      <td className="text-end text-nowrap"><AdminRowActions onEdit={() => setEditBg(b)} onLock={() => setLockBg(b)} onDelete={() => setDeleteBg(b)} locked={b.locked} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ TAB: TEMPLATES ═══════════════ */}
      {tab === "templates" && (
        <section>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div><h3>Broadcast templates</h3><p>Approved message patterns for operational, security, regulatory and marketing sends.</p></div>
            <div className="d-flex gap-2 align-items-center">
              <div className="pm-search"><i className="bi bi-search" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search templates" /></div>
              <button className="btn btn-primary btn-sm" onClick={() => setAddTpl(true)}><i className="bi bi-plus-circle me-1" />Add template</button>
            </div>
          </div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Template</th><th>Channel</th><th>Purpose</th><th>Last used</th><th className="text-end">Actions</th></tr></thead>
                <tbody>
                  {filteredTpl.map(t => (
                    <tr key={t.id}>
                      <td className="pm-td-strong">{t.name}{t.locked && <i className="bi bi-lock-fill ms-1" style={{ fontSize: ".6rem", color: "var(--pm-amber)" }} />}</td>
                      <td>{t.channel}</td>
                      <td className="pm-td-sub">{t.purpose}</td>
                      <td className="pm-td-sub">{t.lastUsed}</td>
                      <td className="text-end text-nowrap">
                        <button className="btn btn-sm btn-outline-info me-1" onClick={() => setPreviewTpl(t)} title="Preview"><i className="bi bi-eye" /></button>
                        <AdminRowActions onEdit={() => setEditTpl(t)} onLock={() => setLockTpl(t)} onDelete={() => setDeleteTpl(t)} locked={t.locked} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ TAB: DOCUMENTS ═══════════════ */}
      {tab === "documents" && (
        <section>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div><h3>Broadcast documents</h3><p>Policies, SLAs, contracts, compliance certificates and operational documents.</p></div>
            <div className="d-flex gap-2 align-items-center">
              <div className="pm-search"><i className="bi bi-search" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search documents" /></div>
              <button className="btn btn-primary btn-sm" onClick={() => setAddDoc(true)}><i className="bi bi-plus-circle me-1" />Create document</button>
            </div>
          </div>
          <div className="pm-doc-grid">
            {filteredDoc.map(d => (
              <div key={d.id} className={`pm-doc-card ${d.locked ? "locked" : ""}`} onClick={() => setPreviewDoc(d)}>
                <div className={`doc-icon bg-${d.type === "Policy" ? "blue" : d.type === "SLA" ? "green" : d.type === "Protocol" ? "red" : d.type === "Compliance" ? "violet" : d.type === "Contract" ? "amber" : "blue"}-soft`}>
                  <i className={`bi ${d.type === "Policy" ? "bi-file-earmark-text" : d.type === "SLA" ? "bi-file-earmark-check" : d.type === "Protocol" ? "bi-file-earmark-lock" : d.type === "Compliance" ? "bi-shield-check" : d.type === "Contract" ? "bi-file-earmark-pdf" : "bi-file-earmark-bar-graph"}`} />
                </div>
                <div className="doc-title">{d.title}</div>
                <div className="doc-meta">
                  <span><i className="bi bi-tag me-1" />{d.type} · {d.version}</span>
                  <span><i className="bi bi-person me-1" />{d.author}</span>
                  <span><i className="bi bi-calendar me-1" />{d.lastUpdated}</span>
                </div>
                <Badge tone={d.status === "Active" ? "green" : "blue"} className="mt-2">{d.status}</Badge>
                <div className="doc-actions" onClick={e => e.stopPropagation()}>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => setPreviewDoc(d)} title="Preview"><i className="bi bi-eye" /></button>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => setEditDoc(d)} title="Edit"><i className="bi bi-pencil-square" /></button>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setLockDoc(d)} title={d.locked ? "Unlock" : "Lock"}><i className={`bi ${d.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteDoc(d)} title="Delete"><i className="bi bi-trash3" /></button>
                </div>
              </div>
            ))}
          </div>
          {filteredDoc.length === 0 && <div className="pm-empty"><i className="bi bi-file-earmark-x" /><h5>No documents found</h5><p>Try adjusting your search or create a new document.</p></div>}
        </section>
      )}

      {/* ═══════════════ TAB: SCHEDULED ═══════════════ */}
      {tab === "schedules" && (
        <section>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div><h3>Scheduled broadcasts</h3><p>Pending and approved broadcasts queued for delivery.</p></div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setScheduleMgrOpen(true)}><i className="bi bi-calendar3 me-1" />Schedule manager</button>
              <button className="btn btn-primary btn-sm" onClick={() => setWizard(true)}><i className="bi bi-plus-circle me-1" />Schedule broadcast</button>
            </div>
          </div>
          {scheduled.map(s => (
            <div key={s.id} className="scheduled-card">
              <div style={{ flex: 1 }}>
                <div className="d-flex gap-2 align-items-center mb-1">
                  <Badge tone={s.status === "Approved" ? "green" : s.status === "Pending approval" ? "amber" : "grey"}>{s.status}</Badge>
                  <span className="small text-muted">{s.date}</span>
                </div>
                <div className="pm-td-strong">{s.name}{s.locked && <i className="bi bi-lock-fill ms-1" style={{ fontSize: ".6rem", color: "var(--pm-amber)" }} />}</div>
                <div className="small text-muted">{s.channel} · {s.audience} · Owner: {s.owner}</div>
              </div>
              <div className="text-end text-nowrap">
                {s.status === "Pending approval" && <button className="btn btn-sm btn-success me-1" onClick={() => { push({ kind: "success", title: `"${s.name}" approved` }); setScheduled(p => p.map(x => x.id === s.id ? { ...x, status: "Approved" } : x)); }}><i className="bi bi-check2 me-1" />Approve</button>}
                <AdminRowActions onEdit={() => setEditSc(s)} onLock={() => setLockSc(s)} onDelete={() => setDeleteSc(s)} locked={s.locked} />
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ═══════════════ TAB: SETTINGS ═══════════════ */}
      {tab === "settings" && (
        <section>
          <div className="pm-section-head mb-3"><div><h3>Broadcast settings</h3><p>Channel configuration, compliance, quiet hours, preferences and data management.</p></div></div>

          <div className="pm-card pm-card-pad mb-3">
            <h6 className="mb-3">Channel & Infrastructure</h6>
            <div className="pm-qa-grid">
              <button className="pm-qa" onClick={() => setChannelCfgOpen(true)}><i className="bi bi-sliders" /><span className="t">Channel config</span></button>
              <button className="pm-qa" onClick={() => setChannelCompareOpen(true)}><i className="bi bi-arrows-angle-contract" /><span className="t">Channel comparison</span></button>
              <button className="pm-qa" onClick={() => setDryRunOpen(true)}><i className="bi bi-eye" /><span className="t">Dry run test</span></button>
              <button className="pm-qa" onClick={() => setComplianceOpen(true)}><i className="bi bi-shield-check" /><span className="t">Compliance</span></button>
            </div>
          </div>

          <div className="pm-card pm-card-pad mb-3">
            <h6 className="mb-3">User & Consent Management</h6>
            <div className="pm-qa-grid">
              <button className="pm-qa" onClick={() => setPrefOpen(true)}><i className="bi bi-bell" /><span className="t">User preferences</span></button>
              <button className="pm-qa" onClick={() => setUnsubOpen(true)}><i className="bi bi-person-dash" /><span className="t">Unsubscribe data</span></button>
              <button className="pm-qa" onClick={() => setQuietHoursOpen(true)}><i className="bi bi-moon-stars" /><span className="t">Quiet hours</span></button>
              <button className="pm-qa" onClick={() => setSegmentOverlapOpen(true)}><i className="bi bi-intersect" /><span className="t">Segment overlap</span></button>
            </div>
          </div>

          <div className="pm-card pm-card-pad mb-3">
            <h6 className="mb-3">Analytics & Reporting</h6>
            <div className="pm-qa-grid">
              <button className="pm-qa" onClick={() => setAnalyticsOpen(true)}><i className="bi bi-graph-up" /><span className="t">Analytics</span></button>
              <button className="pm-qa" onClick={() => setRoiOpen(true)}><i className="bi bi-graph-up-arrow" /><span className="t">ROI analysis</span></button>
              <button className="pm-qa" onClick={() => setCompareOpen(true)}><i className="bi bi-arrows-angle-contract" /><span className="t">Compare campaigns</span></button>
              <button className="pm-qa" onClick={() => setPerfReportOpen(true)}><i className="bi bi-bar-chart-line" /><span className="t">Performance report</span></button>
            </div>
          </div>

          <div className="pm-card pm-card-pad mb-3">
            <h6 className="mb-3">Data Management & Audit</h6>
            <div className="pm-qa-grid">
              <button className="pm-qa" onClick={() => setExportOpen(true)}><i className="bi bi-download" /><span className="t">Export data</span></button>
              <button className="pm-qa" onClick={() => setAuditOpen(true)}><i className="bi bi-journal-text" /><span className="t">Audit trail</span></button>
              <button className="pm-qa" onClick={() => setArchiveOpen(true)}><i className="bi bi-archive" /><span className="t">Archive</span></button>
              <button className="pm-qa" onClick={() => { push({ kind: "success", title: "Import wizard opened" }); }}><i className="bi bi-cloud-upload" /><span className="t">Import data</span></button>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════
          ALL MODALS — WIRING
          ══════════════════════════════════════════════════════════════ */}

      {/* ── Core Admin Modals: Audience ── */}
      <AddRecordModal open={addAud} onClose={() => setAddAud(false)} onAdd={(d) => { setAudiences(p => [{ id: `au-${Date.now()}`, ...d, locked: false } as AudienceRecord, ...p]); }} title="Audience Segment" fields={audienceFields} typeName="Segment" />
      <EditRecordModal record={editAud} open={!!editAud} onClose={() => setEditAud(null)} onSave={(d) => { setAudiences(p => p.map(x => x.id === d.id ? d as AudienceRecord : x)); }} typeName="Segment" />
      <DeleteRecordWizard record={deleteAud} open={!!deleteAud} onClose={() => setDeleteAud(null)} onDelete={() => { if (deleteAud) setAudiences(p => p.filter(x => x.id !== deleteAud.id)); }} typeName="Segment" relatedItems={["Broadcast references", "Scheduled sends", "Template usage analytics"]} />
      <LockUnlockModal record={lockAud} open={!!lockAud} onClose={() => setLockAud(null)} onToggle={(locked) => { if (lockAud) toggleLock(audiences, setAudiences, lockAud.id, locked); }} typeName="Segment" />

      {/* ── Core Admin Modals: Broadcasts ── */}
      <EditRecordModal record={editBc} open={!!editBc} onClose={() => setEditBc(null)} onSave={() => {}} typeName="Broadcast" excludeKeys={["id", "locked", "lockedBy", "lockedAt", "lockReason", "sent", "delivered", "opened", "by", "status"]} />
      <DeleteRecordWizard record={deleteBc} open={!!deleteBc} onClose={() => setDeleteBc(null)} onDelete={() => { if (deleteBc) setBroadcasts(p => p.filter(x => x.id !== deleteBc.id)); }} typeName="Broadcast" relatedItems={["Delivery reports", "Open analytics", "Click tracking", "A/B test results"]} />
      <LockUnlockModal record={lockBc} open={!!lockBc} onClose={() => setLockBc(null)} onToggle={(locked) => { if (lockBc) toggleLock(broadcasts, setBroadcasts, lockBc.id, locked); }} typeName="Broadcast" />
      <BroadcastDetailDrawer broadcast={detailBc} onClose={() => setDetailBc(null)} />
      <BroadcastHistoryDetailModal open={!!historyDetail} broadcast={historyDetail || ""} onClose={() => setHistoryDetail(null)} />
      <DeliveryReportModal open={!!deliveryReport} broadcastName={deliveryReport || ""} onClose={() => setDeliveryReport(null)} />
      <BroadcastVersionHistoryModal open={!!versionHistory} broadcastName={versionHistory || ""} onClose={() => setVersionHistory(null)} />
      <BroadcastRetrospectiveModal open={!!retroBc} broadcastName={retroBc || ""} onClose={() => setRetroBc(null)} />
      <BroadcastApprovalModal open={approveBc} onClose={() => setApproveBc(false)} />

      {/* ── Core Admin Modals: Budget ── */}
      <AddRecordModal open={addBg} onClose={() => setAddBg(false)} onAdd={(d) => { setBudget(p => [{ id: `bg-${Date.now()}`, ...d, used: "KES 0", remaining: d.monthly || "KES 0", locked: false } as BudgetRecord, ...p]); }} title="Budget Allocation" fields={budgetFields} typeName="Budget" />
      <EditRecordModal record={editBg} open={!!editBg} onClose={() => setEditBg(null)} onSave={(d) => { setBudget(p => p.map(x => x.id === d.id ? d as BudgetRecord : x)); }} typeName="Budget" />
      <DeleteRecordWizard record={deleteBg} open={!!deleteBg} onClose={() => setDeleteBg(null)} onDelete={() => { if (deleteBg) setBudget(p => p.filter(x => x.id !== deleteBg.id)); }} typeName="Budget" relatedItems={["Spend history", "Alert rules", "Forecast models"]} />
      <LockUnlockModal record={lockBg} open={!!lockBg} onClose={() => setLockBg(null)} onToggle={(locked) => { if (lockBg) toggleLock(budget, setBudget, lockBg.id, locked); }} typeName="Budget" />

      {/* ── Core Admin Modals: Templates ── */}
      <AddRecordModal open={addTpl} onClose={() => setAddTpl(false)} onAdd={(d) => { setTemplates(p => [{ id: `bt-${Date.now()}`, ...d, lastUsed: "Never", locked: false } as TemplateRecord, ...p]); }} title="Template" fields={templateFields} typeName="Template" />
      <EditRecordModal record={editTpl} open={!!editTpl} onClose={() => setEditTpl(null)} onSave={(d) => { setTemplates(p => p.map(x => x.id === d.id ? d as TemplateRecord : x)); }} typeName="Template" />
      <DeleteRecordWizard record={deleteTpl} open={!!deleteTpl} onClose={() => setDeleteTpl(null)} onDelete={() => { if (deleteTpl) setTemplates(p => p.filter(x => x.id !== deleteTpl.id)); }} typeName="Template" relatedItems={["Broadcast history", "Usage analytics", "Scheduled sends"]} />
      <LockUnlockModal record={lockTpl} open={!!lockTpl} onClose={() => setLockTpl(null)} onToggle={(locked) => { if (lockTpl) toggleLock(templates, setTemplates, lockTpl.id, locked); }} typeName="Template" />
      <NotificationTemplatePreviewModal open={!!previewTpl} template={previewTpl ? { name: previewTpl.name, body: `Hello {{name}},\n\nThis is a ${previewTpl.purpose} notification via ${previewTpl.channel}.\n\nYour account: {{account}}\nAmount: {{amount}}\nDate: {{date}}\n\nThank you,\nPayMo Digital Bank`, channel: previewTpl.channel } : null} onClose={() => setPreviewTpl(null)} />

      {/* ── Core Admin Modals: Documents ── */}
      <CreateDocumentWizard open={addDoc} onClose={() => setAddDoc(false)} onCreated={(doc) => { setDocuments(p => [{ id: `doc-${Date.now()}`, title: doc.title, type: doc.type, author: "Super Admin", lastUpdated: "Just now", version: "v1.0", status: "Draft", content: doc.body || "", locked: false } as BroadcastDocument, ...p]); }} />
      <EditRecordModal record={editDoc} open={!!editDoc} onClose={() => setEditDoc(null)} onSave={(d) => { setDocuments(p => p.map(x => x.id === d.id ? d as BroadcastDocument : x)); }} typeName="Document" excludeKeys={["id", "locked", "lockedBy", "lockedAt", "lockReason", "version"]} />
      <DeleteRecordWizard record={deleteDoc} open={!!deleteDoc} onClose={() => setDeleteDoc(null)} onDelete={() => { if (deleteDoc) setDocuments(p => p.filter(x => x.id !== deleteDoc.id)); }} typeName="Document" relatedItems={["Compliance records", "Version history", "Audit trail entries", "Cross-references in other docs"]} />
      <LockUnlockModal record={lockDoc} open={!!lockDoc} onClose={() => setLockDoc(null)} onToggle={(locked) => { if (lockDoc) toggleLock(documents, setDocuments, lockDoc.id, locked); }} typeName="Document" />
      <BroadcastDocumentPreviewModal doc={previewDoc} open={!!previewDoc} onClose={() => setPreviewDoc(null)} />

      {/* ── Core Admin Modals: Schedules ── */}
      <EditRecordModal record={editSc} open={!!editSc} onClose={() => setEditSc(null)} onSave={(d) => { setScheduled(p => p.map(x => x.id === d.id ? d as ScheduledRecord : x)); }} typeName="Scheduled broadcast" />
      <DeleteRecordWizard record={deleteSc} open={!!deleteSc} onClose={() => setDeleteSc(null)} onDelete={() => { if (deleteSc) setScheduled(p => p.filter(x => x.id !== deleteSc.id)); }} typeName="Scheduled broadcast" relatedItems={["Calendar slot", "Approval queue"]} />
      <LockUnlockModal record={lockSc} open={!!lockSc} onClose={() => setLockSc(null)} onToggle={(locked) => { if (lockSc) toggleLock(scheduled, setScheduled, lockSc.id, locked); }} typeName="Scheduled broadcast" />

      {/* ── Feature Modals ── */}
      <BroadcastWizard open={wizard} onClose={() => setWizard(false)} />
      <EmergencyBroadcastWizard open={emergencyOpen} onClose={() => setEmergencyOpen(false)} />
      <ABTestWizard open={abTestOpen} onClose={() => setABTestOpen(false)} />
      <BroadcastAnalyticsModal open={analyticsOpen} onClose={() => setAnalyticsOpen(false)} />
      <AuditTrailModal open={auditOpen} onClose={() => setAuditOpen(false)} />
      <ExportDataModal open={exportOpen} onClose={() => setExportOpen(false)} />
      <ChannelComparisonModal open={channelCompareOpen} onClose={() => setChannelCompareOpen(false)} />
      <CompliancePreCheckModal open={complianceOpen} onClose={() => setComplianceOpen(false)} />
      <ComplianceReportModal open={false} onClose={() => {}} />
      <ChannelConfigModal open={channelCfgOpen} onClose={() => setChannelCfgOpen(false)} />
      <BroadcastQuietHoursModal open={quietHoursOpen} onClose={() => setQuietHoursOpen(false)} />
      <DryRunModal open={dryRunOpen} onClose={() => setDryRunOpen(false)} />
      <UnsubscribeAnalysisModal open={unsubOpen} onClose={() => setUnsubOpen(false)} />
      <BroadcastComparisonModal open={compareOpen} onClose={() => setCompareOpen(false)} />
      <BroadcastRoiModal open={roiOpen} onClose={() => setRoiOpen(false)} />
      <SegmentOverlapModal open={segmentOverlapOpen} onClose={() => setSegmentOverlapOpen(false)} />
      <BroadcastScheduleManagerModal open={scheduleMgrOpen} onClose={() => setScheduleMgrOpen(false)} />
      <BulkOperationsWizard open={bulkOpsOpen} onClose={() => setBulkOpsOpen(false)} />
      <CampaignCloneWizard open={!!cloneWizard} sourceCampaign={cloneWizard || ""} onClose={() => setCloneWizard(null)} />
      <BroadcastArchiveModal open={archiveOpen} onClose={() => setArchiveOpen(false)} />
      <UserPreferenceModal open={prefOpen} onClose={() => setPrefOpen(false)} />
      <BroadcastPerformanceWizard open={perfReportOpen} onClose={() => setPerfReportOpen(false)} />
      <CreateSegmentWizard open={false} onClose={() => {}} />
      <DataImportWizard open={false} onClose={() => {}} />

      {/* ── Quiet Hours Drawer ── */}
      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Quiet hours configuration" subtitle="Protect customers while allowing critical communications" icon="bi-moon-stars" wide>
        <div className="pm-card pm-card-pad mb-3"><Badge tone="green" dot>Compliance enforced</Badge><h5 className="mt-3">22:00–07:00 EAT</h5><p className="small text-muted">Per-user timezone is respected where a last known location is available.</p></div>
        <div className="pm-card pm-card-pad">
          {[["Emergency override", "Allowed · 2FA required"], ["Transactional during quiet", "Allowed · always"], ["Security during quiet", "Allowed · always"], ["Marketing during quiet", "Blocked"], ["Engagement during quiet", "Blocked"], ["Opt-out filtering", "Automatic before send"], ["DND list", "Checked before SMS"]].map(x => (<div className="config-row" key={x[0]}><span className="pm-td-sub">{x[0]}</span><b>{x[1]}</b></div>))}
        </div>
      </Drawer>
    </div>
  );
}
