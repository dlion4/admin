import { useState, useMemo, useCallback } from "react";
import { Badge, Drawer, Modal, Steps, useToast } from "../../../components/ui";
import { AdminRowActions, AddRecordModal, EditRecordModal, DeleteRecordWizard, LockUnlockModal } from "../../../components/AdminControls";
import type { TicketRecord, AgentRecord, CategoryRecord, MacroRecord } from "../data/supportData";
import { initTickets, initAgents, initCategories, initMacros } from "../data/supportData";

const ticketFields = [
  { key: "user", label: "User ID", placeholder: "e.g. PAY-12345" },
  { key: "subject", label: "Subject", placeholder: "e.g. Wrong amount debited" },
  { key: "category", label: "Category", options: ["Transaction", "KYC", "Loans", "Cards", "General", "Security", "Profile"] },
  { key: "priority", label: "Priority", options: ["Urgent", "High", "Normal", "Low"] },
  { key: "assigned", label: "Assigned To", options: ["Samuel K.", "Agnes W.", "John M.", "Faith O.", "Peter N.", "Unassigned"] },
  { key: "notes", label: "Notes", placeholder: "Customer issue details...", type: "textarea" as const },
];

const agentFields = [
  { key: "name", label: "Agent Name", placeholder: "e.g. John M." },
  { key: "csat", label: "CSAT Rating", placeholder: "e.g. 4.5/5" },
];

const categoryFields = [
  { key: "name", label: "Category Name", placeholder: "e.g. Transaction issues" },
  { key: "routeTo", label: "Auto-route to", placeholder: "e.g. Transaction team" },
  { key: "autoResolve", label: "Auto-resolve %", placeholder: "e.g. 25%" },
  { key: "avgHandle", label: "Avg handle time", placeholder: "e.g. 5.2 min" },
];

const macroFields = [
  { key: "name", label: "Macro Name", placeholder: "e.g. Balance check" },
  { key: "trigger", label: "Trigger phrase", placeholder: "e.g. balance / how much" },
  { key: "content", label: "Reply content", placeholder: "Your current balance is {{balance}}...", type: "textarea" as const },
];

export function SupportQueue({ signal: _signal }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  const { push } = useToast();
  const [tab, setTab] = useState("queue");
  const [q, setQ] = useState("");
  const [tickets, setTickets] = useState(initTickets);
  const [agents, setAgents] = useState(initAgents);
  const [categories, setCategories] = useState(initCategories);
  const [macros, setMacros] = useState(initMacros);
  const [drawer, setDrawer] = useState<string | null>(null);
  const [wizard, setWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [action, setAction] = useState<{ title: string; body: React.ReactNode; icon?: string; tone?: "green" | "red" | "amber" | "blue" | "violet" | "ink" } | null>(null);

  // Ticket CRUD
  const [addTicket, setAddTicket] = useState(false);
  const [editTicket, setEditTicket] = useState<TicketRecord | null>(null);
  const [deleteTicket, setDeleteTicket] = useState<TicketRecord | null>(null);
  const [lockTicket, setLockTicket] = useState<TicketRecord | null>(null);

  // Agent CRUD
  const [addAgent, setAddAgent] = useState(false);
  const [editAgent, setEditAgent] = useState<AgentRecord | null>(null);
  const [deleteAgent, setDeleteAgent] = useState<AgentRecord | null>(null);
  const [lockAgent, setLockAgent] = useState<AgentRecord | null>(null);

  // Category CRUD
  const [addCategory, setAddCategory] = useState(false);
  const [editCategory, setEditCategory] = useState<CategoryRecord | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<CategoryRecord | null>(null);
  const [lockCategory, setLockCategory] = useState<CategoryRecord | null>(null);

  // Macro CRUD
  const [addMacro, setAddMacro] = useState(false);
  const [editMacro, setEditMacro] = useState<MacroRecord | null>(null);
  const [deleteMacro, setDeleteMacro] = useState<MacroRecord | null>(null);
  const [lockMacro, setLockMacro] = useState<MacroRecord | null>(null);

  const filtered = useMemo(() => tickets.filter(r => [r.ticketId, r.user, r.subject, r.category, r.priority, r.status, r.assigned].join(" ").toLowerCase().includes(q.toLowerCase())), [q, tickets]);
  const toggleLock = useCallback(<T extends { id: string; locked: boolean }>(items: T[], setItems: (fn: (p: T[]) => T[]) => void, id: string, locked: boolean) => {
    setItems(p => p.map(x => x.id === id ? { ...x, locked, lockedBy: locked ? "Super Admin" : undefined, lockedAt: locked ? new Date().toLocaleDateString() : undefined, lockReason: locked ? "Manual lock" : undefined } as T : x));
  }, []);

  return (
    <div className="pm-page-content support-page">
      <div className="pm-section-head" style={{ marginTop: 0 }}>
        <div>
          <div className="pm-eyebrow">COMMUNICATIONS / PAGE 37</div>
          <h2 className="mb-1">Customer Support Queue</h2>
          <p>Manage support tickets, agent workload, SLAs, escalations and customer satisfaction.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setDrawer("sla")}><i className="bi bi-stopwatch me-1" />SLA settings</button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => setTab("macros")}><i className="bi bi-lightning me-1" />Quick replies</button>
          <button className="btn btn-primary btn-sm" onClick={() => { setWizardStep(0); setWizard(true); }}><i className="bi bi-plus-lg me-1" />Create ticket</button>
        </div>
      </div>

      <div className="pm-hero support-hero mb-3">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <div className="pm-eyebrow text-white-50">SUPPORT OPERATIONS · LIVE</div>
            <div className="pm-hero-value">{tickets.length} <span className="fs-6 fw-normal text-white-50">tickets in queue</span></div>
            <div className="small text-white-50 mt-2">97% SLA compliance · {agents.length} agents active · 3 urgent tickets require immediate attention</div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <div className="pm-hero-chip"><div className="l">Open queue</div><div className="v text-warning">{tickets.filter(t => t.status === "Open").length}</div></div>
            <div className="pm-hero-chip"><div className="l">Avg first response</div><div className="v text-success">2.1 min</div></div>
            <div className="pm-hero-chip"><div className="l">CSAT</div><div className="v">4.4 / 5</div></div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-3">
        {[["Urgent tickets", String(tickets.filter(t => t.priority === "Urgent").length), "Requires immediate attention", "bi-exclamation-octagon", "red"], ["Open tickets", String(tickets.filter(t => t.status === "Open").length), "Avg wait: 8.4 min", "bi-inbox", "amber"], ["In progress", String(tickets.filter(t => t.status === "In Progress").length), "Assigned to agents", "bi-arrow-repeat", "blue"], ["Agents active", String(agents.length), "All agents online", "bi-people-check", "green"]].map(x => (
          <div className="col-6 col-xl-3" key={x[0]}><div className="pm-stat"><div className={`pm-stat-ico bg-${x[4]}-soft text-${x[4]}`}><i className={`bi ${x[3]}`} /></div><div className="pm-stat-label">{x[0]}</div><div className="pm-stat-value">{x[1]}</div><div className="pm-stat-foot">{x[2]}</div></div></div>
        ))}
      </div>

      <div className="pm-card mb-3">
        <div className="pm-tabs">
          {[["queue", "Ticket queue", "bi-inbox"], ["agents", "Agent performance", "bi-people"], ["categories", "Categories", "bi-diagram-3"], ["macros", "Macros & replies", "bi-lightning"], ["escalations", "Escalations", "bi-arrow-up-right-circle"]].map(x => (
            <button className={`pm-tab ${tab === x[0] ? "active" : ""}`} key={x[0]} onClick={() => setTab(x[0])}><i className={`bi ${x[2]}`} />{x[1]}</button>
          ))}
        </div>
      </div>

      {tab === "queue" && (
        <section>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div><h3>Ticket queue</h3><p>Prioritized customer requests with assigned agent and SLA clock.</p></div>
            <div className="d-flex gap-2 align-items-center">
              <div className="pm-search"><i className="bi bi-search" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search ticket, user or subject" /></div>
              <button className="btn btn-primary btn-sm" onClick={() => setAddTicket(true)}><i className="bi bi-plus-circle me-1" />Add ticket</button>
            </div>
          </div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Ticket</th><th>User</th><th>Subject</th><th>Category</th><th>Priority</th><th>Status</th><th>Assigned</th><th>SLA</th><th className="text-end">Actions</th></tr></thead>
                <tbody>
                  {filtered.map(t => (
                    <tr key={t.id}>
                      <td className="pm-td-strong">{t.ticketId}{t.locked && <i className="bi bi-lock-fill ms-1" style={{ fontSize: ".6rem", color: "var(--pm-amber)" }} />}</td>
                      <td className="mono">{t.user}</td>
                      <td className="pm-td-strong">{t.subject}</td>
                      <td>{t.category}</td>
                      <td><Badge tone={t.priority === "Urgent" ? "red" : t.priority === "High" ? "amber" : "green"}>{t.priority}</Badge></td>
                      <td><Badge tone={t.status === "Resolved" ? "green" : t.status === "Open" ? "amber" : "blue"} dot>{t.status}</Badge></td>
                      <td className="pm-td-sub">{t.assigned}</td>
                      <td><Badge tone={t.sla === "Breached" ? "red" : t.sla === "Met" ? "green" : "amber"}>{t.sla}</Badge></td>
                      <td className="text-end text-nowrap">
                        <div className="d-flex gap-1 justify-content-end">
                          <button className="btn btn-sm btn-outline-info" onClick={() => setDrawer(t.ticketId)} title="Open"><i className="bi bi-eye" /></button>
                          <AdminRowActions onEdit={() => setEditTicket(t)} onLock={() => setLockTicket(t)} onDelete={() => setDeleteTicket(t)} locked={t.locked} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {tab === "agents" && (
        <section>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div><h3>Agent performance dashboard</h3><p>Workload, resolution speed, CSAT and SLA delivery by agent.</p></div>
            <button className="btn btn-primary btn-sm" onClick={() => setAddAgent(true)}><i className="bi bi-plus-circle me-1" />Add agent</button>
          </div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Agent</th><th>Active</th><th>Resolved</th><th>Avg resolution</th><th>First response</th><th>CSAT</th><th>Escalations</th><th>SLA met</th><th className="text-end">Actions</th></tr></thead>
                <tbody>
                  {agents.map(a => (
                    <tr key={a.id}>
                      <td className="pm-td-strong">{a.name}{a.locked && <i className="bi bi-lock-fill ms-1" style={{ fontSize: ".6rem", color: "var(--pm-amber)" }} />}</td>
                      <td className="pm-num">{a.active}</td>
                      <td className="pm-num">{a.resolved}</td>
                      <td className="pm-num">{a.avgResolution}</td>
                      <td className="pm-num">{a.firstResponse}</td>
                      <td>{a.csat}</td>
                      <td className="pm-num">{a.escalations}</td>
                      <td><Badge tone={parseInt(a.slaMet) < 95 ? "amber" : "green"}>{a.slaMet}</Badge></td>
                      <td className="text-end text-nowrap"><AdminRowActions onEdit={() => setEditAgent(a)} onLock={() => setLockAgent(a)} onDelete={() => setDeleteAgent(a)} locked={a.locked} /></td>
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
            <div><h3>Support categories & routing</h3><p>Ticket mix, auto-routing team and resolution efficiency.</p></div>
            <button className="btn btn-primary btn-sm" onClick={() => setAddCategory(true)}><i className="bi bi-plus-circle me-1" />Add category</button>
          </div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Category</th><th>% tickets</th><th>Auto-route to</th><th>Auto-resolve</th><th>Avg handle</th><th className="text-end">Actions</th></tr></thead>
                <tbody>
                  {categories.map(c => (
                    <tr key={c.id}>
                      <td className="pm-td-strong">{c.name}{c.locked && <i className="bi bi-lock-fill ms-1" style={{ fontSize: ".6rem", color: "var(--pm-amber)" }} />}</td>
                      <td className="pm-num">{c.percent}</td>
                      <td>{c.routeTo}</td>
                      <td className="pm-num">{c.autoResolve}</td>
                      <td className="pm-num">{c.avgHandle}</td>
                      <td className="text-end text-nowrap"><AdminRowActions onEdit={() => setEditCategory(c)} onLock={() => setLockCategory(c)} onDelete={() => setDeleteCategory(c)} locked={c.locked} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {tab === "macros" && (
        <section>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div><h3>Macro & quick reply management</h3><p>Reusable replies that reduce handling time.</p></div>
            <button className="btn btn-primary btn-sm" onClick={() => setAddMacro(true)}><i className="bi bi-plus-circle me-1" />Add macro</button>
          </div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Macro name</th><th>Trigger</th><th>Content</th><th>Usage (30d)</th><th>Avg save</th><th className="text-end">Actions</th></tr></thead>
                <tbody>
                  {macros.map(m => (
                    <tr key={m.id}>
                      <td className="pm-td-strong">{m.name}{m.locked && <i className="bi bi-lock-fill ms-1" style={{ fontSize: ".6rem", color: "var(--pm-amber)" }} />}</td>
                      <td className="pm-td-sub">{m.trigger}</td>
                      <td style={{ fontSize: ".82rem" }}>{m.content}</td>
                      <td className="pm-num">{m.usage}</td>
                      <td className="pm-num">{m.avgSave}</td>
                      <td className="text-end text-nowrap"><AdminRowActions onEdit={() => setEditMacro(m)} onLock={() => setLockMacro(m)} onDelete={() => setDeleteMacro(m)} locked={m.locked} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {tab === "escalations" && (
        <section>
          <div className="pm-section-head"><div><h3>Escalation management</h3><p>Tickets escalated to specialist teams and current SLA state.</p></div></div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Ticket</th><th>Escalated to</th><th>Reason</th><th>Time</th><th>SLA</th><th>Status</th></tr></thead>
                <tbody>
                  {[["T-4520", "Support Lead", "Card declined repeatedly, possible fraud", "14:05", "15 min", "8 min left"], ["T-4498", "Compliance", "Data deletion request", "12:30", "4 hours", "Resolved"], ["T-4485", "Finance", "Refund request >KES 100K", "11:00", "2 hours", "Resolved"], ["T-4470", "Tech Lead", "App crash on device", "09:30", "4 hours", "Resolved"]].map((r, i) => (
                    <tr key={i}><td className="pm-td-strong">{r[0]}</td><td>{r[1]}</td><td style={{ fontSize: ".82rem" }}>{r[2]}</td><td className="pm-td-sub">{r[3]}</td><td>{r[4]}</td><td><Badge tone={r[5].includes("left") ? "amber" : "green"} dot>{r[5]}</Badge></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ALL MODALS */}
      {action && <Modal open onClose={() => setAction(null)} title={action.title} subtitle="Super Admin action · customer support changes are audited" icon={action.icon} tone={action.tone}><div className="pm-modal-body">{action.body}</div><div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={() => setAction(null)}>Cancel</button><button className="btn btn-primary" onClick={() => { setAction(null); push({ kind: "success", title: "Support workspace updated" }); }}>Confirm action</button></div></Modal>}

      {wizard && <Modal open onClose={() => setWizard(false)} title="Create support ticket" subtitle={`Step ${wizardStep + 1} of 4: ${["Customer", "Issue", "Routing", "Review"][wizardStep]}`} icon="bi-plus-circle" tone="blue" size="lg">
        <Steps current={wizardStep} steps={[{ label: "Customer", icon: "bi-person" }, { label: "Issue", icon: "bi-chat-left-text" }, { label: "Routing", icon: "bi-diagram-3" }, { label: "Review", icon: "bi-check2" }]} />
        <div className="pm-wizard-progress"><span style={{ width: `${(wizardStep + 1) * 25}%` }} /></div>
        <div className="pm-modal-body">
          <div className="row g-3">
            <div className="col-md-7"><label className="form-label">Customer account</label><input className="form-control" placeholder="PAY-XXXXX" /></div>
            <div className="col-md-5"><label className="form-label">Priority</label><select className="form-select"><option>Normal</option><option>High</option><option>Urgent</option><option>Low</option></select></div>
            <div className="col-md-6"><label className="form-label">Category</label><select className="form-select"><option>Transaction</option><option>KYC</option><option>Cards</option><option>Loans</option><option>General</option></select></div>
            <div className="col-md-6"><label className="form-label">Assigned team</label><select className="form-select"><option>Transaction team</option><option>KYC team</option><option>Support Lead</option><option>Tech support</option></select></div>
            <div className="col-12"><label className="form-label">Subject</label><input className="form-control" placeholder="Brief description of the issue" /></div>
            <div className="col-12"><label className="form-label">Notes</label><textarea className="form-control" rows={3} placeholder="Capture the customer issue, context and next action required." /></div>
          </div>
        </div>
        <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={() => wizardStep ? setWizardStep(wizardStep - 1) : setWizard(false)}>{wizardStep ? "Back" : "Cancel"}</button>{wizardStep < 3 ? <button className="btn btn-primary" onClick={() => setWizardStep(wizardStep + 1)}>Continue</button> : <button className="btn btn-primary" onClick={() => { setWizard(false); setWizardStep(0); push({ kind: "success", title: "Ticket created" }); }}>Create ticket</button>}</div>
      </Modal>}

      <AddRecordModal open={addTicket} onClose={() => setAddTicket(false)} onAdd={(d) => { setTickets(p => [{ id: `tk-${Date.now()}`, ticketId: `T-${4524 + p.length}`, ...d, status: "Open", created: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), updated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), sla: "15 min left", locked: false } as TicketRecord, ...p]); }} title="Ticket" fields={ticketFields} typeName="Ticket" />
      <EditRecordModal record={editTicket} open={!!editTicket} onClose={() => setEditTicket(null)} onSave={(d) => { setTickets(p => p.map(x => x.id === d.id ? d as TicketRecord : x)); }} typeName="Ticket" />
      <DeleteRecordWizard record={deleteTicket} open={!!deleteTicket} onClose={() => setDeleteTicket(null)} onDelete={() => { if (deleteTicket) setTickets(p => p.filter(x => x.id !== deleteTicket.id)); }} typeName="Ticket" relatedItems={["Conversation history", "Attachments", "Resolution notes"]} />
      <LockUnlockModal record={lockTicket} open={!!lockTicket} onClose={() => setLockTicket(null)} onToggle={(locked) => { if (lockTicket) toggleLock(tickets, setTickets, lockTicket.id, locked); }} typeName="Ticket" />

      <AddRecordModal open={addAgent} onClose={() => setAddAgent(false)} onAdd={(d) => { setAgents(p => [{ id: `ag-${Date.now()}`, ...d, active: "0", resolved: "0", avgResolution: "0 min", firstResponse: "0 min", escalations: "0 (0%)", slaMet: "100%", locked: false } as AgentRecord, ...p]); }} title="Agent" fields={agentFields} typeName="Agent" />
      <EditRecordModal record={editAgent} open={!!editAgent} onClose={() => setEditAgent(null)} onSave={(d) => { setAgents(p => p.map(x => x.id === d.id ? d as AgentRecord : x)); }} typeName="Agent" />
      <DeleteRecordWizard record={deleteAgent} open={!!deleteAgent} onClose={() => setDeleteAgent(null)} onDelete={() => { if (deleteAgent) setAgents(p => p.filter(x => x.id !== deleteAgent.id)); }} typeName="Agent" relatedItems={["Assigned tickets", "Performance history", "Shift schedule"]} />
      <LockUnlockModal record={lockAgent} open={!!lockAgent} onClose={() => setLockAgent(null)} onToggle={(locked) => { if (lockAgent) toggleLock(agents, setAgents, lockAgent.id, locked); }} typeName="Agent" />

      <AddRecordModal open={addCategory} onClose={() => setAddCategory(false)} onAdd={(d) => { setCategories(p => [{ id: `cat-${Date.now()}`, ...d, locked: false } as CategoryRecord, ...p]); }} title="Category" fields={categoryFields} typeName="Category" />
      <EditRecordModal record={editCategory} open={!!editCategory} onClose={() => setEditCategory(null)} onSave={(d) => { setCategories(p => p.map(x => x.id === d.id ? d as CategoryRecord : x)); }} typeName="Category" />
      <DeleteRecordWizard record={deleteCategory} open={!!deleteCategory} onClose={() => setDeleteCategory(null)} onDelete={() => { if (deleteCategory) setCategories(p => p.filter(x => x.id !== deleteCategory.id)); }} typeName="Category" relatedItems={["Routing rules", "Ticket assignments"]} />
      <LockUnlockModal record={lockCategory} open={!!lockCategory} onClose={() => setLockCategory(null)} onToggle={(locked) => { if (lockCategory) toggleLock(categories, setCategories, lockCategory.id, locked); }} typeName="Category" />

      <AddRecordModal open={addMacro} onClose={() => setAddMacro(false)} onAdd={(d) => { setMacros(p => [{ id: `mc-${Date.now()}`, ...d, usage: "0", avgSave: "0 min", locked: false } as MacroRecord, ...p]); }} title="Macro" fields={macroFields} typeName="Macro" />
      <EditRecordModal record={editMacro} open={!!editMacro} onClose={() => setEditMacro(null)} onSave={(d) => { setMacros(p => p.map(x => x.id === d.id ? d as MacroRecord : x)); }} typeName="Macro" />
      <DeleteRecordWizard record={deleteMacro} open={!!deleteMacro} onClose={() => setDeleteMacro(null)} onDelete={() => { if (deleteMacro) setMacros(p => p.filter(x => x.id !== deleteMacro.id)); }} typeName="Macro" relatedItems={["Usage statistics", "Agent assignments"]} />
      <LockUnlockModal record={lockMacro} open={!!lockMacro} onClose={() => setLockMacro(null)} onToggle={(locked) => { if (lockMacro) toggleLock(macros, setMacros, lockMacro.id, locked); }} typeName="Macro" />

      {/* Ticket Detail Drawer */}
      <Drawer open={!!drawer} onClose={() => setDrawer(null)} title={drawer || "Ticket Detail"} subtitle="Ticket context, SLA controls and customer actions" icon="bi-headset" wide>
        <div className="pm-card pm-card-pad mb-3">
          <div className="d-flex gap-3 align-items-center">
            <div className="pm-avatar lg" style={{ background: "#2e90fa" }}>TK</div>
            <div><h5 className="mb-1">{drawer}</h5><Badge tone="amber" dot>In Progress</Badge></div>
          </div>
          <div className="row g-3 mt-2">
            <div className="col-4"><div className="pm-eyebrow">Customer</div><b>PAY-12345</b></div>
            <div className="col-4"><div className="pm-eyebrow">Priority</div><b>Urgent</b></div>
            <div className="col-4"><div className="pm-eyebrow">SLA</div><b>12 min left</b></div>
          </div>
        </div>
        <div className="pm-card pm-card-pad mb-3">
          <h6>Ticket operations</h6>
          <div className="d-grid gap-2">
            <button className="btn btn-outline-primary" onClick={() => push({ kind: "success", title: "Reassigned" })}>Reassign</button>
            <button className="btn btn-outline-secondary" onClick={() => push({ kind: "success", title: "Info request sent" })}>Request customer info</button>
            <button className="btn btn-outline-warning" onClick={() => push({ kind: "success", title: "Ticket escalated" })}>Escalate</button>
            <button className="btn btn-outline-success" onClick={() => push({ kind: "success", title: "Ticket resolved" })}>Resolve ticket</button>
          </div>
        </div>
        <div className="pm-card pm-card-pad">
          <h6>Conversation activity</h6>
          <div className="pm-timeline">
            <div className="pm-tl-item done"><b>Agent response sent</b><div className="pm-td-sub">14:25 · Samuel K.</div></div>
            <div className="pm-tl-item done"><b>Ticket assigned</b><div className="pm-td-sub">14:21 · Transaction team</div></div>
            <div className="pm-tl-item warn"><b>SLA clock running</b><div className="pm-td-sub">12 minutes remaining</div></div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
