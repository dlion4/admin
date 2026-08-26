import { useState, useMemo, useCallback } from "react";
import { Badge, Drawer, Modal, Steps, useToast } from "../../../components/ui";
import { AdminRowActions, AddRecordModal, EditRecordModal, DeleteRecordWizard, LockUnlockModal } from "../../../components/AdminControls";

interface AudienceRecord { id: string; name: string; count: string; criteria: string; locked: boolean; lockedBy?: string; lockedAt?: string; lockReason?: string; }
interface BroadcastRecord { id: string; date: string; name: string; channel: string; audience: string; sent: string; delivered: string; opened: string; by: string; status: string; locked: boolean; lockedBy?: string; lockedAt?: string; lockReason?: string; }
interface BudgetRecord { id: string; channel: string; monthly: string; used: string; remaining: string; unitCost: string; locked: boolean; lockedBy?: string; lockedAt?: string; lockReason?: string; }
interface TemplateRecord { id: string; name: string; channel: string; purpose: string; lastUsed: string; locked: boolean; lockedBy?: string; lockedAt?: string; lockReason?: string; }

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

const audienceFields = [
  { key: "name", label: "Segment Name", placeholder: "e.g. High-value users" },
  { key: "count", label: "Est. Count", placeholder: "e.g. 5,000" },
  { key: "criteria", label: "Filter Criteria", placeholder: "e.g. Balance > KES 100K", type: "textarea" as const },
];
const templateFields = [
  { key: "name", label: "Template Name", placeholder: "e.g. Fee change announcement" },
  { key: "channel", label: "Channel", options: ["Push", "Push + Email", "Push + SMS", "Push + SMS + Email", "Push + WhatsApp", "Email", "SMS"] },
  { key: "purpose", label: "Purpose", placeholder: "e.g. Fee changes" },
];
const budgetFields = [
  { key: "channel", label: "Channel", options: ["SMS", "Email", "WhatsApp", "Push", "In-app"] },
  { key: "monthly", label: "Monthly Budget", placeholder: "e.g. KES 5.5M" },
  { key: "unitCost", label: "Cost Per Unit", placeholder: "e.g. KES 2.00" },
];

export function BroadcastMessages({ signal: _signal }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  const { push } = useToast();
  const [tab, setTab] = useState("compose");
  const [q, setQ] = useState("");
  const [audiences, setAudiences] = useState(initAudience);
  const [broadcasts] = useState(initBroadcasts);
  const [budget, setBudget] = useState(initBudget);
  const [templates, setTemplates] = useState(initTemplates);
  const [drawer, setDrawer] = useState(false);
  const [wizard, setWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [action, setAction] = useState<{ title: string; body: React.ReactNode; icon?: string; tone?: "green" | "red" | "amber" | "blue" | "violet" | "ink" } | null>(null);

  const [addAud, setAddAud] = useState(false);
  const [editAud, setEditAud] = useState<AudienceRecord | null>(null);
  const [deleteAud, setDeleteAud] = useState<AudienceRecord | null>(null);
  const [lockAud, setLockAud] = useState<AudienceRecord | null>(null);

  const [addBc, setAddBc] = useState(false);
  const [editBc, setEditBc] = useState<BroadcastRecord | null>(null);
  const [deleteBc, setDeleteBc] = useState<BroadcastRecord | null>(null);
  const [lockBc, setLockBc] = useState<BroadcastRecord | null>(null);

  const [addBg, setAddBg] = useState(false);
  const [editBg, setEditBg] = useState<BudgetRecord | null>(null);
  const [deleteBg, setDeleteBg] = useState<BudgetRecord | null>(null);
  const [lockBg, setLockBg] = useState<BudgetRecord | null>(null);

  const [addTpl, setAddTpl] = useState(false);
  const [editTpl, setEditTpl] = useState<TemplateRecord | null>(null);
  const [deleteTpl, setDeleteTpl] = useState<TemplateRecord | null>(null);
  const [lockTpl, setLockTpl] = useState<TemplateRecord | null>(null);

  const filtered = useMemo(() => audiences.filter(r => [r.name, r.count, r.criteria].join(" ").toLowerCase().includes(q.toLowerCase())), [q, audiences]);
  const toggleLock = useCallback(<T extends { id: string; locked: boolean }>(items: T[], setItems: (fn: (p: T[]) => T[]) => void, id: string, locked: boolean) => {
    setItems(p => p.map(x => x.id === id ? { ...x, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Manual lock" : undefined } as T : x));
  }, []);

  return (
    <div className="pm-page-content broadcast-page">
      <div className="pm-section-head" style={{ marginTop: 0 }}>
        <div>
          <div className="pm-eyebrow">COMMUNICATIONS / PAGE 36</div>
          <h2 className="mb-1">Broadcast Messages</h2>
          <p>Compose targeted communications, route approvals and monitor delivery across every channel.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setDrawer(true)}><i className="bi bi-moon-stars me-1" />Quiet hours</button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => setTab("budget")}><i className="bi bi-wallet2 me-1" />Budget</button>
          <button className="btn btn-primary btn-sm" onClick={() => { setWizardStep(0); setWizard(true); }}><i className="bi bi-send me-1" />New broadcast</button>
        </div>
      </div>

      <div className="pm-hero broadcast-hero mb-3">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <div className="pm-eyebrow text-white-50">BROADCAST OPERATIONS · CONSENT AWARE</div>
            <div className="pm-hero-value">{broadcasts.length} <span className="fs-6 fw-normal text-white-50">broadcasts this month</span></div>
            <div className="small text-white-50 mt-2">98.1% weighted delivery · {audiences.find(a => a.name === "All users")?.count} users reachable · approval workflow enforced</div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <div className="pm-hero-chip"><div className="l">Recipients reached</div><div className="v">401K</div></div>
            <div className="pm-hero-chip"><div className="l">Delivery rate</div><div className="v text-success">98.1%</div></div>
            <div className="pm-hero-chip"><div className="l">Budget used</div><div className="v text-warning">KES 5.1M</div></div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-3">
        {[["Broadcasts sent", String(broadcasts.length), "Last 30 days", "bi-send-check", "green"], ["Users reachable", "148,392", "Consent filtered", "bi-people", "blue"], ["Templates", String(templates.length), "Approved patterns", "bi-files", "violet"], ["Budget remaining", "KES 2.4M", "Of KES 7.5M total", "bi-wallet2", "amber"]].map(x => (
          <div className="col-6 col-xl-3" key={x[0]}><div className="pm-stat"><div className={`pm-stat-ico bg-${x[4]}-soft text-${x[4]}`}><i className={`bi ${x[3]}`} /></div><div className="pm-stat-label">{x[0]}</div><div className="pm-stat-value">{x[1]}</div><div className="pm-stat-foot">{x[2]}</div></div></div>
        ))}
      </div>

      <div className="pm-card mb-3">
        <div className="pm-tabs">
          {[["compose", "Composer", "bi-pencil-square"], ["audience", "Audience builder", "bi-people"], ["history", "Recent broadcasts", "bi-clock-history"], ["budget", "Budget tracker", "bi-wallet2"], ["templates", "Templates", "bi-files"]].map(x => (
            <button className={`pm-tab ${tab === x[0] ? "active" : ""}`} key={x[0]} onClick={() => setTab(x[0])}><i className={`bi ${x[2]}`} />{x[1]}</button>
          ))}
        </div>
      </div>

      {tab === "compose" && (
        <section>
          <div className="pm-section-head"><div><h3>Broadcast composer</h3><p>Draft a channel-aware message with audience, language, schedule and approval controls.</p></div><button className="btn btn-primary btn-sm" onClick={() => { setWizardStep(0); setWizard(true); }}><i className="bi bi-magic me-1" />Guided composer</button></div>
          <div className="pm-card pm-card-pad">
            <div className="row g-3">
              <div className="col-md-7"><label className="form-label">Message name</label><input className="form-control" defaultValue="August product update" /></div>
              <div className="col-md-5"><label className="form-label">Channel</label><select className="form-select"><option>Push + Email</option><option>Push + SMS</option><option>Multi-channel</option></select></div>
              <div className="col-md-6"><label className="form-label">Audience</label><select className="form-select"><option>All active users · 134,210</option><option>VIP clients · 347</option><option>Custom saved filter</option></select></div>
              <div className="col-md-6"><label className="form-label">Language</label><select className="form-select"><option>English</option><option>Swahili</option><option>English + Swahili</option></select></div>
              <div className="col-12"><label className="form-label">Message body</label><textarea className="form-control" rows={4} defaultValue="Hello {{name}}, discover what's new in PayMo this month. Learn more in the app." /></div>
            </div>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <button className="btn btn-outline-secondary" onClick={() => push({ kind: "success", title: "Dry run sent" })}><i className="bi bi-eye me-1" />Dry run</button>
              <button className="btn btn-primary" onClick={() => push({ kind: "success", title: "Broadcast submitted" })}><i className="bi bi-send-check me-1" />Submit for approval</button>
            </div>
          </div>
        </section>
      )}

      {tab === "audience" && (
        <section>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div><h3>Audience builder</h3><p>Consent-aware segments available for targeted communication.</p></div>
            <div className="d-flex gap-2 align-items-center">
              <div className="pm-search"><i className="bi bi-search" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search segment" /></div>
              <button className="btn btn-primary btn-sm" onClick={() => setAddAud(true)}><i className="bi bi-plus-circle me-1" />Add segment</button>
            </div>
          </div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Segment</th><th>Count</th><th>Criteria</th><th className="text-end">Actions</th></tr></thead>
                <tbody>
                  {filtered.map(a => (
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
        </section>
      )}

      {tab === "history" && (
        <section>
          <div className="pm-section-head"><div><h3>Recent broadcasts</h3><p>Delivery, open rates, owners and approval status for completed sends.</p></div></div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Date</th><th>Name</th><th>Channel</th><th>Audience</th><th>Sent</th><th>Delivered</th><th>Opened</th><th>Status</th></tr></thead>
                <tbody>
                  {broadcasts.map(b => (
                    <tr key={b.id}>
                      <td className="pm-td-sub">{b.date}</td>
                      <td className="pm-td-strong">{b.name}</td>
                      <td>{b.channel}</td>
                      <td>{b.audience}</td>
                      <td className="pm-num">{b.sent}</td>
                      <td className="pm-num">{b.delivered}</td>
                      <td className="pm-num">{b.opened}</td>
                      <td><Badge tone="green" dot>{b.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {tab === "budget" && (
        <section>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div><h3>Broadcast budget tracker</h3><p>Monthly budget, spend to date, remaining balance and unit cost.</p></div>
            <button className="btn btn-primary btn-sm" onClick={() => setAddBg(true)}><i className="bi bi-plus-circle me-1" />Add budget</button>
          </div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Channel</th><th>Monthly budget</th><th>Used (MTD)</th><th>Remaining</th><th>Cost/unit</th><th className="text-end">Actions</th></tr></thead>
                <tbody>
                  {budget.map(b => (
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

      {tab === "templates" && (
        <section>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div><h3>Broadcast templates</h3><p>Approved message patterns for operational, security, regulatory and marketing sends.</p></div>
            <button className="btn btn-primary btn-sm" onClick={() => setAddTpl(true)}><i className="bi bi-plus-circle me-1" />Add template</button>
          </div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Template</th><th>Channel</th><th>Purpose</th><th>Last used</th><th className="text-end">Actions</th></tr></thead>
                <tbody>
                  {templates.map(t => (
                    <tr key={t.id}>
                      <td className="pm-td-strong">{t.name}{t.locked && <i className="bi bi-lock-fill ms-1" style={{ fontSize: ".6rem", color: "var(--pm-amber)" }} />}</td>
                      <td>{t.channel}</td>
                      <td className="pm-td-sub">{t.purpose}</td>
                      <td className="pm-td-sub">{t.lastUsed}</td>
                      <td className="text-end text-nowrap"><AdminRowActions onEdit={() => setEditTpl(t)} onLock={() => setLockTpl(t)} onDelete={() => setDeleteTpl(t)} locked={t.locked} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ALL MODALS */}
      {action && <Modal open onClose={() => setAction(null)} title={action.title} subtitle="Super Admin action · consent and delivery are audited" icon={action.icon} tone={action.tone}><div className="pm-modal-body">{action.body}</div><div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={() => setAction(null)}>Cancel</button><button className="btn btn-primary" onClick={() => { setAction(null); push({ kind: "success", title: "Broadcast workspace updated" }); }}>Confirm action</button></div></Modal>}

      {wizard && <Modal open onClose={() => setWizard(false)} title="Create broadcast" subtitle={`Step ${wizardStep + 1} of 4: ${["Message", "Audience", "Schedule", "Review"][wizardStep]}`} icon="bi-send" tone="blue" size="lg">
        <Steps current={wizardStep} steps={[{ label: "Message", icon: "bi-pencil" }, { label: "Audience", icon: "bi-people" }, { label: "Schedule", icon: "bi-calendar3" }, { label: "Review", icon: "bi-check2" }]} />
        <div className="pm-wizard-progress"><span style={{ width: `${(wizardStep + 1) * 25}%` }} /></div>
        <div className="pm-modal-body">
          <div className="row g-3">
            <div className="col-md-7"><label className="form-label">Broadcast name</label><input className="form-control" placeholder="e.g. August product update" /></div>
            <div className="col-md-5"><label className="form-label">Channel</label><select className="form-select"><option>Push + Email</option><option>Push + SMS</option><option>WhatsApp</option></select></div>
            <div className="col-md-6"><label className="form-label">Audience</label><select className="form-select"><option>All active users · 134,210</option><option>New users · 3,200</option><option>VIP clients · 347</option></select></div>
            <div className="col-md-6"><label className="form-label">Send time</label><input className="form-control" defaultValue="Tomorrow · 09:00 EAT" /></div>
            <div className="col-12"><label className="form-label">Message</label><textarea className="form-control" rows={3} placeholder="Hello {{name}}, discover what's new in PayMo this month." /></div>
          </div>
        </div>
        <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={() => wizardStep ? setWizardStep(wizardStep - 1) : setWizard(false)}>{wizardStep ? "Back" : "Cancel"}</button>{wizardStep < 3 ? <button className="btn btn-primary" onClick={() => setWizardStep(wizardStep + 1)}>Continue</button> : <button className="btn btn-primary" onClick={() => { setWizard(false); setWizardStep(0); push({ kind: "success", title: "Broadcast queued for approval" }); }}>Submit for approval</button>}</div>
      </Modal>}

      <AddRecordModal open={addAud} onClose={() => setAddAud(false)} onAdd={(d) => { setAudiences(p => [{ id: `au-${Date.now()}`, ...d, locked: false } as AudienceRecord, ...p]); }} title="Audience Segment" fields={audienceFields} typeName="Segment" />
      <EditRecordModal record={editAud} open={!!editAud} onClose={() => setEditAud(null)} onSave={(d) => { setAudiences(p => p.map(x => x.id === d.id ? d as AudienceRecord : x)); }} typeName="Segment" />
      <DeleteRecordWizard record={deleteAud} open={!!deleteAud} onClose={() => setDeleteAud(null)} onDelete={() => { if (deleteAud) setAudiences(p => p.filter(x => x.id !== deleteAud.id)); }} typeName="Segment" relatedItems={["Broadcast references", "Scheduled sends"]} />
      <LockUnlockModal record={lockAud} open={!!lockAud} onClose={() => setLockAud(null)} onToggle={(locked) => { if (lockAud) toggleLock(audiences, setAudiences, lockAud.id, locked); }} typeName="Segment" />

      <AddRecordModal open={addBc} onClose={() => setAddBc(false)} onAdd={(d) => { /* broadcast records are read-only from history */ }} title="Broadcast" fields={[{ key: "name", label: "Broadcast Name", placeholder: "e.g. Fee notice" }, { key: "channel", label: "Channel", options: ["Push", "Push + Email", "Push + SMS", "SMS"] }, { key: "audience", label: "Audience", placeholder: "e.g. All active" }]} typeName="Broadcast" />
      <EditRecordModal record={editBc} open={!!editBc} onClose={() => setEditBc(null)} onSave={() => {}} typeName="Broadcast" />
      <DeleteRecordWizard record={deleteBc} open={!!deleteBc} onClose={() => setDeleteBc(null)} onDelete={() => {}} typeName="Broadcast" relatedItems={["Delivery reports", "Open analytics"]} />
      <LockUnlockModal record={lockBc} open={!!lockBc} onClose={() => setLockBc(null)} onToggle={() => {}} typeName="Broadcast" />

      <AddRecordModal open={addBg} onClose={() => setAddBg(false)} onAdd={(d) => { setBudget(p => [{ id: `bg-${Date.now()}`, ...d, used: "KES 0", remaining: d.monthly || "KES 0", locked: false } as BudgetRecord, ...p]); }} title="Budget Allocation" fields={budgetFields} typeName="Budget" />
      <EditRecordModal record={editBg} open={!!editBg} onClose={() => setEditBg(null)} onSave={(d) => { setBudget(p => p.map(x => x.id === d.id ? d as BudgetRecord : x)); }} typeName="Budget" />
      <DeleteRecordWizard record={deleteBg} open={!!deleteBg} onClose={() => setDeleteBg(null)} onDelete={() => { if (deleteBg) setBudget(p => p.filter(x => x.id !== deleteBg.id)); }} typeName="Budget" relatedItems={["Spend history", "Alert rules"]} />
      <LockUnlockModal record={lockBg} open={!!lockBg} onClose={() => setLockBg(null)} onToggle={(locked) => { if (lockBg) toggleLock(budget, setBudget, lockBg.id, locked); }} typeName="Budget" />

      <AddRecordModal open={addTpl} onClose={() => setAddTpl(false)} onAdd={(d) => { setTemplates(p => [{ id: `bt-${Date.now()}`, ...d, lastUsed: "Never", locked: false } as TemplateRecord, ...p]); }} title="Template" fields={templateFields} typeName="Template" />
      <EditRecordModal record={editTpl} open={!!editTpl} onClose={() => setEditTpl(null)} onSave={(d) => { setTemplates(p => p.map(x => x.id === d.id ? d as TemplateRecord : x)); }} typeName="Template" />
      <DeleteRecordWizard record={deleteTpl} open={!!deleteTpl} onClose={() => setDeleteTpl(null)} onDelete={() => { if (deleteTpl) setTemplates(p => p.filter(x => x.id !== deleteTpl.id)); }} typeName="Template" relatedItems={["Broadcast history", "Usage analytics"]} />
      <LockUnlockModal record={lockTpl} open={!!lockTpl} onClose={() => setLockTpl(null)} onToggle={(locked) => { if (lockTpl) toggleLock(templates, setTemplates, lockTpl.id, locked); }} typeName="Template" />

      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Quiet hours configuration" subtitle="Protect customers while allowing critical communications" icon="bi-moon-stars" wide>
        <div className="pm-card pm-card-pad mb-3"><Badge tone="green" dot>Compliance enforced</Badge><h5 className="mt-3">22:00–07:00 EAT</h5><p className="small text-muted">Per-user timezone is respected where a last known location is available.</p></div>
        <div className="pm-card pm-card-pad">
          {[["Emergency override", "Allowed · 2FA required"], ["Transactional during quiet", "Allowed · always"], ["Security during quiet", "Allowed · always"], ["Marketing during quiet", "Blocked"], ["Engagement during quiet", "Blocked"], ["Opt-out filtering", "Automatic before send"], ["DND list", "Checked before SMS"]].map(x => (<div className="config-row" key={x[0]}><span className="pm-td-sub">{x[0]}</span><b>{x[1]}</b></div>))}
        </div>
      </Drawer>
    </div>
  );
}
