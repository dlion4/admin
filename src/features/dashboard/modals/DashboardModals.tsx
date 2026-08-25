import { useMemo, useState } from "react";
import {
  Modal, Drawer, Steps, Badge, Avatar, TwoFactorField, useToast, Sparkline, Meter, Donut, DDItem,
} from "../../../components/ui";
import { csvDownload, jsonDownload, kes, num } from "../../../lib/format";
import type { Activity, Alert, Channel, Defaulter, HealthCard, RevenueSource, Task, TxHour } from "../data/dashboardData";
import { DEFAULTERS, REVENUE_12M, REVENUE_SOURCES } from "../data/dashboardData";

/* ============================ 1. Freeze account wizard ============================ */
const FREEZE_CANDIDATES = [
  { id: "#89234", name: "Amina Hassan", phone: "+254 722 445 118", balance: 412_800, risk: 88, county: "Nairobi" },
  { id: "#45120", name: "Brian Otieno", phone: "+254 733 812 990", balance: 128_400, risk: 74, county: "Kisumu" },
  { id: "#77812", name: "Lucy Muthoni", phone: "+254 798 441 226", balance: 964_100, risk: 91, county: "Nyeri" },
  { id: "#11223", name: "David Kimani", phone: "+254 726 663 441", balance: 312_000, risk: 96, county: "Nakuru" },
  { id: "#33456", name: "Fatuma Abdalla", phone: "+254 739 204 885", balance: 88_200, risk: 42, county: "Malindi" },
  { id: "#4512", name: "James Mutua", phone: "+254 701 864 532", balance: 2_140_000, risk: 21, county: "Nairobi" },
];
const FREEZE_REASONS = [
  { id: "fraud", label: "Suspected fraud", desc: "Account activity matches a known fraud pattern", icon: "bi-shield-exclamation" },
  { id: "ato", label: "Account takeover", desc: "Credentials or device believed compromised", icon: "bi-person-lock" },
  { id: "aml", label: "AML / sanctions hit", desc: "Screening produced a true-positive match", icon: "bi-globe-americas" },
  { id: "court", label: "Court or regulator order", desc: "Freeze instructed by CBK, FRA or a court", icon: "bi-bank" },
  { id: "customer", label: "Customer request", desc: "Customer reported loss of phone or SIM swap", icon: "bi-telephone-x" },
];

export function FreezeAccountWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<typeof FREEZE_CANDIDATES[0] | null>(null);
  const [reason, setReason] = useState("fraud");
  const [note, setNote] = useState("");
  const [scope, setScope] = useState({ withdrawals: true, transfers: true, cards: true, logins: false });
  const [notify, setNotify] = useState(true);
  const [code, setCode] = useState("");
  const steps = [{ label: "Account", icon: "bi-search" }, { label: "Reason", icon: "bi-chat-left-text" }, { label: "Scope", icon: "bi-crosshair" }, { label: "2FA", icon: "bi-shield-lock" }, { label: "Confirm", icon: "bi-check2" }];
  const list = FREEZE_CANDIDATES.filter((c) => (c.name + c.id + c.phone).toLowerCase().includes(q.toLowerCase()));
  const canNext = step === 0 ? !!sel : step === 1 ? note.trim().length >= 10 : step === 3 ? code === "482913" : true;
  const close = () => { setStep(0); setSel(null); setNote(""); setCode(""); setQ(""); onClose(); };

  return (
    <Modal open={open} onClose={close} tone="blue" icon="bi-snow" size="lg"
      title="Freeze customer account" subtitle="Blocks money movement immediately. Requires 2FA and a retained reason.">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <>
            <div className="pm-search mb-2" style={{ maxWidth: "none", background: "#fff" }}>
              <i className="bi bi-search" />
              <input autoFocus placeholder="Search by name, account number or phone…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="pm-card pm-table-wrap" style={{ maxHeight: 300, overflowY: "auto" }}>
              <table className="pm-table">
                <thead><tr><th></th><th>Customer</th><th>Account</th><th className="text-end">Balance</th><th className="text-center">Risk</th></tr></thead>
                <tbody>
                  {list.map((c) => (
                    <tr key={c.id} className={sel?.id === c.id ? "selected" : ""} onClick={() => setSel(c)}>
                      <td><input type="radio" className="form-check-input" checked={sel?.id === c.id} onChange={() => setSel(c)} /></td>
                      <td><div className="d-flex align-items-center gap-2"><Avatar name={c.name} size="sm" />
                        <div><div className="pm-td-strong">{c.name}</div><div className="pm-td-sub">{c.phone} · {c.county}</div></div></div></td>
                      <td className="mono">{c.id}</td>
                      <td className="text-end pm-num">{kes(c.balance)}</td>
                      <td className="text-center"><Badge tone={c.risk > 75 ? "red" : c.risk > 50 ? "amber" : "green"}>{c.risk}</Badge></td>
                    </tr>
                  ))}
                  {list.length === 0 && <tr><td colSpan={5} className="text-center py-4" style={{ color: "var(--pm-muted)" }}>No account matches “{q}”.</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <div className="d-flex flex-column gap-2 mb-3">
              {FREEZE_REASONS.map((r) => (
                <button key={r.id} className={`pm-opt ${reason === r.id ? "active" : ""}`} onClick={() => setReason(r.id)}>
                  <span className="r" /><i className={`bi ${r.icon}`} style={{ color: "var(--pm-blue)", fontSize: "1.05rem" }} />
                  <span className="flex-grow-1"><span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>{r.label}</span>
                    <span className="d-block" style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>{r.desc}</span></span>
                </button>
              ))}
            </div>
            <label className="form-label">Investigator note (min 10 characters · retained 7 years)</label>
            <textarea className="form-control" rows={3} value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Evidence, ticket reference, escalation path…" />
          </>
        )}
        {step === 2 && (
          <div className="d-flex flex-column gap-2">
            {[
              { k: "withdrawals", l: "Block withdrawals", d: "M-Pesa B2C, ATM and card cash-out" },
              { k: "transfers", l: "Block outbound transfers", d: "PesaLink, internal wallet and bill pay" },
              { k: "cards", l: "Suspend linked cards", d: "2 active cards will decline at authorisation" },
              { k: "logins", l: "Block new logins", d: "Customer cannot access the app at all" },
            ].map((x) => (
              <label key={x.k} className={`pm-opt ${scope[x.k as keyof typeof scope] ? "active" : ""}`}>
                <input type="checkbox" className="form-check-input mt-0" checked={scope[x.k as keyof typeof scope]}
                  onChange={(e) => setScope({ ...scope, [x.k]: e.target.checked })} />
                <span className="flex-grow-1"><span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>{x.l}</span>
                  <span className="d-block" style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>{x.d}</span></span>
              </label>
            ))}
            <label className="pm-opt mt-2" style={{ borderStyle: "dashed" }}>
              <input type="checkbox" className="form-check-input mt-0" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
              <span className="flex-grow-1"><span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>Notify the customer</span>
                <span className="d-block" style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>SMS + push: “Your account is under review. Contact support on 0709 000 000.”</span></span>
            </label>
          </div>
        )}
        {step === 3 && <TwoFactorField value={code} onChange={setCode} />}
        {step === 4 && sel && (
          <>
            <div className="pm-card pm-card-pad mb-3">
              <div className="d-flex align-items-center gap-2 mb-2"><Avatar name={sel.name} /><div>
                <div style={{ fontWeight: 700 }}>{sel.name}</div><div className="pm-td-sub mono">{sel.id} · {sel.phone}</div></div></div>
              <div className="pm-kv"><span className="k">Balance held</span><span className="v">{kes(sel.balance)}</span></div>
              <div className="pm-kv"><span className="k">Reason</span><span className="v">{FREEZE_REASONS.find((r) => r.id === reason)?.label}</span></div>
              <div className="pm-kv"><span className="k">Scope</span><span className="v">{Object.entries(scope).filter(([, v]) => v).map(([k]) => k).join(", ")}</span></div>
              <div className="pm-kv"><span className="k">Customer notified</span><span className="v">{notify ? "Yes — SMS + push" : "No"}</span></div>
              <div className="pm-kv"><span className="k">Authorised by</span><span className="v">Jeckonia Kwasa · Tier 0</span></div>
            </div>
            <div className="pm-note" style={{ borderColor: "#cfe6ff", background: "#eff8ff", color: "#175cd3" }}>
              <i className="bi bi-info-circle me-1" />An unfreeze requires Super Admin or Compliance Officer approval and is logged separately.
            </div>
          </>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}><i className="bi bi-arrow-left me-1" />Back</button>}
        {step < 4 && <button className="btn btn-primary btn-sm" disabled={!canNext} onClick={() => setStep(step + 1)}>Next<i className="bi bi-arrow-right ms-1" /></button>}
        {step === 4 && <button className="btn btn-primary btn-sm" onClick={() => {
          push({ kind: "success", title: `Account ${sel?.id} frozen`, body: `Ref FRZ-2026-0912 · ${sel?.name} · audit entry AUD-88232 created.` }); close();
        }}><i className="bi bi-snow me-1" />Freeze account</button>}
      </div>
    </Modal>
  );
}

/* ============================ 2. Alert detail drawer ============================ */
export function AlertDrawer({ alert, onClose, onAction }: { alert: Alert | null; onClose: () => void; onAction: (a: string, alert: Alert) => void }) {
  const { push } = useToast();
  const [assignee, setAssignee] = useState("Jeckonia Kwasa");
  const [comment, setComment] = useState("");
  if (!alert) return null;
  const tone = alert.priority === "critical" ? "red" : alert.priority === "warning" ? "amber" : "blue";
  return (
    <Drawer open onClose={onClose} wide tone={tone as "red"} icon="bi-exclamation-diamond-fill"
      title={alert.title} subtitle={`${alert.id} · ${alert.category} · raised ${alert.age} ago`}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => { push({ kind: "info", title: `${alert.id} snoozed 30 min` }); onClose(); }}>
          <i className="bi bi-alarm me-1" />Snooze
        </button>
        <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => { push({ kind: "success", title: `${alert.id} assigned to ${assignee}` }); }}>
          <i className="bi bi-person-check me-1" />Assign
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => onAction(alert.action, alert)}>
          <i className="bi bi-lightning-charge me-1" />{alert.action}
        </button>
      </>}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="d-flex gap-2 flex-wrap mb-2">
          <Badge tone={tone}>{alert.priority.toUpperCase()}</Badge>
          <Badge tone="grey">{alert.category}</Badge>
          <Badge tone="violet">{alert.owner}</Badge>
          <Badge tone="ink">{alert.impact}</Badge>
        </div>
        <p style={{ fontSize: ".85rem", margin: 0, color: "#344054" }}>{alert.detail}</p>
      </div>
      <div className="pm-card mb-3">
        <div className="pm-card-head"><h6 className="pm-card-title">Response playbook</h6><Badge tone="grey">{alert.playbook.length} steps</Badge></div>
        <div className="p-3">
          <div className="pm-timeline">
            {alert.playbook.map((p, i) => (
              <div key={p} className={`pm-tl-item ${i === 0 ? "done" : ""}`}>
                <div style={{ fontWeight: 700, fontSize: ".82rem" }}>{p}</div>
                <div style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>{i === 0 ? "Completed automatically by the alerting service" : "Pending — action from the assigned owner"}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="pm-card mb-3">
        <div className="pm-card-head"><h6 className="pm-card-title">Assign & annotate</h6></div>
        <div className="p-3">
          <label className="form-label">Owner</label>
          <select className="form-select mb-3" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
            {["Jeckonia Kwasa", "Sarah Kamau", "James Odhiambo", "Mary Wanjiku", "David Kiplagat", "Faith Chebet"].map((a) => <option key={a}>{a}</option>)}
          </select>
          <label className="form-label">Investigation note</label>
          <textarea className="form-control" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What did you find?" />
          <button className="btn btn-outline-primary btn-sm mt-2" disabled={comment.trim().length < 3}
            onClick={() => { push({ kind: "success", title: "Note added to alert", body: `${alert.id} · visible to ${alert.owner}` }); setComment(""); }}>
            <i className="bi bi-chat-left-text me-1" />Add note
          </button>
        </div>
      </div>
      <div className="pm-card">
        <div className="pm-card-head"><h6 className="pm-card-title">Related signals</h6></div>
        <div className="p-3">
          <div className="pm-kv"><span className="k">Correlated alerts</span><span className="v">3 in the last hour</span></div>
          <div className="pm-kv"><span className="k">Similar incidents</span><span className="v">INC-2026-0088 (resolved 14 Aug)</span></div>
          <div className="pm-kv"><span className="k">Detection rule</span><span className="v mono">rule.velocity.multi_device_v3</span></div>
          <div className="pm-kv"><span className="k">First seen</span><span className="v">{alert.age} ago</span></div>
        </div>
      </div>
    </Drawer>
  );
}

/* ============================ 3. Activity detail drawer ============================ */
export function ActivityDrawer({ item, onClose }: { item: Activity | null; onClose: () => void }) {
  const { push } = useToast();
  const [reverting, setReverting] = useState(false);
  if (!item) return null;
  return (
    <Drawer open onClose={onClose} tone={item.tone === "red" ? "red" : item.tone === "amber" ? "amber" : "green"}
      icon="bi-clock-history" title={item.action} subtitle={`${item.id} · ${item.time} · ${item.category}`}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm flex-grow-1"
          onClick={() => { jsonDownload(`${item.id}.json`, item); push({ kind: "success", title: "Audit entry exported", body: `${item.id}.json downloaded — watermarked.` }); }}>
          <i className="bi bi-download me-1" />Export entry
        </button>
        <button className="btn btn-danger btn-sm" disabled={!item.reversible} onClick={() => setReverting(true)}
          title={item.reversible ? "Reverse this admin action" : "This action cannot be reversed"}>
          <i className="bi bi-arrow-counterclockwise me-1" />Reverse action
        </button>
      </>}>
      <div className="pm-card pm-card-pad mb-3 d-flex align-items-center gap-3">
        <Avatar name={item.admin} size="lg" />
        <div><div style={{ fontWeight: 700 }}>{item.admin}</div>
          <div style={{ fontSize: ".76rem", color: "var(--pm-muted)" }}>{item.role}</div>
          <Badge tone={item.reversible ? "green" : "grey"}>{item.reversible ? "Reversible" : "Irreversible"}</Badge></div>
      </div>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Action</span><span className="v">{item.action}</span></div>
        <div className="pm-kv"><span className="k">Target</span><span className="v mono">{item.target}</span></div>
        <div className="pm-kv"><span className="k">Details</span><span className="v" style={{ maxWidth: 260 }}>{item.details}</span></div>
        <div className="pm-kv"><span className="k">Source IP</span><span className="v mono">{item.ip}</span></div>
        <div className="pm-kv"><span className="k">Session</span><span className="v mono">SES-9921</span></div>
        <div className="pm-kv"><span className="k">Gates satisfied</span><span className="v">PIN · Passkey · TOTP · Session PIN</span></div>
        <div className="pm-kv"><span className="k">Hash</span><span className="v mono" style={{ fontSize: ".7rem" }}>0x8f21…c4b9</span></div>
      </div>
      <div className="pm-card">
        <div className="pm-card-head"><h6 className="pm-card-title">Raw audit payload</h6></div>
        <div className="p-3"><div className="pm-code">{JSON.stringify({ id: item.id, actor: item.admin, role: item.role, action: item.action, target: item.target, ip: item.ip, ts: "2026-08-24T14:32:01+03:00", reversible: item.reversible }, null, 2)}</div></div>
      </div>

      <Modal open={reverting} onClose={() => setReverting(false)} tone="red" icon="bi-arrow-counterclockwise" size="sm"
        title="Reverse admin action?" subtitle={`${item.id} — ${item.action} on ${item.target}`}>
        <div className="pm-modal-body">
          <div className="pm-note mb-3" style={{ borderColor: "#fbd3cf", background: "#fef2f2", color: "#b42318" }}>
            Reversal creates a compensating entry. The original record is never deleted.
          </div>
          <div className="pm-kv"><span className="k">Original actor</span><span className="v">{item.admin}</span></div>
          <div className="pm-kv"><span className="k">Reversed by</span><span className="v">Jeckonia Kwasa</span></div>
        </div>
        <div className="pm-modal-foot">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setReverting(false)}>Cancel</button>
          <button className="btn btn-danger btn-sm" onClick={() => {
            push({ kind: "success", title: "Action reversed", body: `Compensating entry AUD-88233 created for ${item.id}.` });
            setReverting(false); onClose();
          }}>Reverse now</button>
        </div>
      </Modal>
    </Drawer>
  );
}

/* ============================ 4. Task detail modal ============================ */
export function TaskModal({ task, onClose, onSave }: { task: Task | null; onClose: () => void; onSave: (t: Task) => void }) {
  const { push } = useToast();
  const [draft, setDraft] = useState<Task | null>(task);
  useMemo(() => setDraft(task), [task]);
  if (!task || !draft) return null;
  return (
    <Modal open onClose={onClose} tone="violet" icon="bi-list-task" size="md"
      title={task.task} subtitle={`${task.id} · ${task.category} · due ${task.due}`}>
      <div className="pm-modal-body">
        <div className="row g-2 mb-3">
          <div className="col-6"><label className="form-label">Owner</label>
            <select className="form-select" value={draft.assigned} onChange={(e) => setDraft({ ...draft, assigned: e.target.value })}>
              {["Jeckonia Kwasa", "Sarah Kamau", "James Odhiambo", "Mary Wanjiku", "David Kiplagat", "Faith Chebet", "Platform Team", "Risk Team", "Legal", "Comms", "Grace Wanjiru"].map((a) => <option key={a}>{a}</option>)}
            </select></div>
          <div className="col-6"><label className="form-label">Priority</label>
            <select className="form-select" value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value as Task["priority"] })}>
              <option>High</option><option>Medium</option><option>Normal</option>
            </select></div>
          <div className="col-6"><label className="form-label">Status</label>
            <select className="form-select" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as Task["status"] })}>
              <option>Pending</option><option>In progress</option><option>Blocked</option><option>Done</option>
            </select></div>
          <div className="col-6"><label className="form-label">Progress — {draft.progress}%</label>
            <input type="range" className="form-range mt-2" min={0} max={100} step={5} value={draft.progress}
              onChange={(e) => setDraft({ ...draft, progress: Number(e.target.value) })} /></div>
        </div>
        <label className="form-label">Notes</label>
        <textarea className="form-control mb-3" rows={3} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
        <div className="pm-card pm-card-pad">
          <div className="pm-eyebrow mb-2">Activity</div>
          <div className="pm-timeline">
            <div className="pm-tl-item done"><div style={{ fontWeight: 700, fontSize: ".8rem" }}>Task created</div><div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>12 Aug 2026 · Jeckonia Kwasa</div></div>
            <div className="pm-tl-item done"><div style={{ fontWeight: 700, fontSize: ".8rem" }}>Assigned to {task.assigned}</div><div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>13 Aug 2026</div></div>
            <div className={`pm-tl-item ${task.progress > 0 ? "warn" : ""}`}><div style={{ fontWeight: 700, fontSize: ".8rem" }}>Progress {task.progress}%</div><div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>Last update 2 days ago</div></div>
            <div className="pm-tl-item"><div style={{ fontWeight: 700, fontSize: ".8rem" }}>Due {task.due}</div><div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{task.priority} priority</div></div>
          </div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => { push({ kind: "info", title: "Reminder set", body: `${task.id} · you will be notified 48h before the due date.` }); onClose(); }}>
          <i className="bi bi-bell me-1" />Remind me
        </button>
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => { onSave(draft); push({ kind: "success", title: "Task updated", body: `${task.id} saved · owner ${draft.assigned}.` }); onClose(); }}>
          <i className="bi bi-check2 me-1" />Save changes
        </button>
      </div>
    </Modal>
  );
}

/* ============================ 5. New task modal ============================ */
export function NewTaskModal({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (t: Task) => void }) {
  const { push } = useToast();
  const [f, setF] = useState({ task: "", due: "2026-09-15", assigned: "Jeckonia Kwasa", priority: "Medium" as Task["priority"], category: "Compliance", notes: "" });
  return (
    <Modal open={open} onClose={onClose} tone="green" icon="bi-plus-square" size="md"
      title="Create task" subtitle="Appears in the deadline board and the owner's queue.">
      <div className="pm-modal-body">
        <label className="form-label">Task title</label>
        <input className="form-control mb-3" value={f.task} onChange={(e) => setF({ ...f, task: e.target.value })} placeholder="e.g. Prepare CBK quarterly liquidity return" />
        <div className="row g-2 mb-3">
          <div className="col-6"><label className="form-label">Due date</label><input type="date" className="form-control" value={f.due} onChange={(e) => setF({ ...f, due: e.target.value })} /></div>
          <div className="col-6"><label className="form-label">Owner</label>
            <select className="form-select" value={f.assigned} onChange={(e) => setF({ ...f, assigned: e.target.value })}>
              {["Jeckonia Kwasa", "Sarah Kamau", "James Odhiambo", "Mary Wanjiku", "David Kiplagat", "Faith Chebet", "Platform Team", "Risk Team", "Legal"].map((a) => <option key={a}>{a}</option>)}
            </select></div>
          <div className="col-6"><label className="form-label">Priority</label>
            <select className="form-select" value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value as Task["priority"] })}>
              <option>High</option><option>Medium</option><option>Normal</option></select></div>
          <div className="col-6"><label className="form-label">Category</label>
            <select className="form-select" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
              {["Compliance", "Finance", "Platform", "Risk", "Partners", "Cards", "Credit", "Legal", "People", "Comms", "Tax", "Security", "Investors"].map((c) => <option key={c}>{c}</option>)}
            </select></div>
        </div>
        <label className="form-label">Notes</label>
        <textarea className="form-control" rows={3} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder="Context, dependencies, links…" />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={f.task.trim().length < 4} onClick={() => {
          const t: Task = {
            id: `TSK-${300 + Math.floor(Math.random() * 90)}`, task: f.task,
            due: new Date(f.due).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            assigned: f.assigned, priority: f.priority, status: "Pending", progress: 0, category: f.category, notes: f.notes || "No notes yet.",
          };
          onCreate(t); push({ kind: "success", title: "Task created", body: `${t.id} assigned to ${t.assigned}.` }); onClose();
          setF({ ...f, task: "", notes: "" });
        }}><i className="bi bi-plus-lg me-1" />Create task</button>
      </div>
    </Modal>
  );
}

/* ============================ 6. Fee schedule wizard ============================ */
const FEE_RAILS = [
  { id: "mpesa", label: "Mobile money (M-Pesa)", current: "0.50%", volume: "653,896 txns / 30d" },
  { id: "card", label: "Card acquiring (Visa / MC)", current: "1.85% + KES 5", volume: "287,850 txns / 30d" },
  { id: "pesalink", label: "PesaLink bank transfer", current: "KES 55 flat", volume: "51,204 txns / 30d" },
  { id: "internal", label: "Internal wallet transfer", current: "Free", volume: "224,620 txns / 30d" },
  { id: "utility", label: "Utility bill payment", current: "KES 20 flat", volume: "142,300 txns / 30d" },
];
export function FeeScheduleWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [rail, setRail] = useState("mpesa");
  const [model, setModel] = useState("percent");
  const [rate, setRate] = useState("0.45");
  const [cap, setCap] = useState("300");
  const [effective, setEffective] = useState("2026-09-01");
  const [tiers, setTiers] = useState([
    { from: 0, to: 1000, fee: 0 }, { from: 1001, to: 5000, fee: 15 },
    { from: 5001, to: 25000, fee: 40 }, { from: 25001, to: 150000, fee: 90 }, { from: 150001, to: 500000, fee: 180 },
  ]);
  const [code, setCode] = useState("");
  const steps = [{ label: "Rail", icon: "bi-signpost-split" }, { label: "Model", icon: "bi-percent" }, { label: "Tiers", icon: "bi-bar-chart-steps" }, { label: "Impact", icon: "bi-graph-up" }, { label: "Authorise", icon: "bi-shield-lock" }];
  const chosen = FEE_RAILS.find((r) => r.id === rail)!;
  const revenueDelta = model === "percent" ? (0.5 - Number(rate)) / 0.5 * -142_000_000 * 0.62 : -4_200_000;
  const close = () => { setStep(0); setCode(""); onClose(); };
  return (
    <Modal open={open} onClose={close} tone="green" icon="bi-percent" size="lg"
      title="Publish fee schedule" subtitle="Effective-dated pricing change across a payment rail. Requires 2FA.">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div className="d-flex flex-column gap-2">
            {FEE_RAILS.map((r) => (
              <button key={r.id} className={`pm-opt ${rail === r.id ? "active" : ""}`} onClick={() => setRail(r.id)}>
                <span className="r" />
                <span className="flex-grow-1"><span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>{r.label}</span>
                  <span className="d-block" style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>{r.volume}</span></span>
                <Badge tone="grey">Now {r.current}</Badge>
              </button>
            ))}
          </div>
        )}
        {step === 1 && (
          <>
            <div className="d-flex flex-column gap-2 mb-3">
              {[{ id: "percent", l: "Percentage of value", d: "e.g. 0.45% of the transaction amount" },
                { id: "flat", l: "Flat fee", d: "e.g. KES 55 regardless of amount" },
                { id: "tiered", l: "Tiered bands", d: "Fee steps by amount band (Kenyan market standard)" },
                { id: "hybrid", l: "Hybrid", d: "Percentage + fixed component with a cap" }].map((m) => (
                <button key={m.id} className={`pm-opt ${model === m.id ? "active" : ""}`} onClick={() => setModel(m.id)}>
                  <span className="r" /><span className="flex-grow-1">
                    <span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>{m.l}</span>
                    <span className="d-block" style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>{m.d}</span></span>
                </button>
              ))}
            </div>
            <div className="row g-2">
              <div className="col-6"><label className="form-label">{model === "flat" ? "Flat fee (KES)" : "Rate (%)"}</label>
                <input className="form-control mono" value={rate} onChange={(e) => setRate(e.target.value)} /></div>
              <div className="col-6"><label className="form-label">Fee cap (KES)</label>
                <input className="form-control mono" value={cap} onChange={(e) => setCap(e.target.value)} /></div>
              <div className="col-12"><label className="form-label">Effective from</label>
                <input type="date" className="form-control" value={effective} onChange={(e) => setEffective(e.target.value)} /></div>
            </div>
          </>
        )}
        {step === 2 && (
          <div className="pm-card pm-table-wrap">
            <table className="pm-table">
              <thead><tr><th>Band</th><th>From (KES)</th><th>To (KES)</th><th>Fee (KES)</th><th></th></tr></thead>
              <tbody>
                {tiers.map((t, i) => (
                  <tr key={i}>
                    <td className="pm-td-strong">Tier {i + 1}</td>
                    <td className="mono">{num(t.from)}</td>
                    <td><input className="form-control form-control-sm mono" value={t.to}
                      onChange={(e) => setTiers(tiers.map((x, j) => j === i ? { ...x, to: Number(e.target.value) || 0 } : x))} /></td>
                    <td><input className="form-control form-control-sm mono" value={t.fee}
                      onChange={(e) => setTiers(tiers.map((x, j) => j === i ? { ...x, fee: Number(e.target.value) || 0 } : x))} /></td>
                    <td className="text-end"><button className="btn btn-sm btn-outline-secondary" onClick={() => setTiers(tiers.filter((_, j) => j !== i))}><i className="bi bi-trash" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-2 border-top">
              <button className="btn btn-outline-primary btn-sm" onClick={() => setTiers([...tiers, { from: (tiers.at(-1)?.to ?? 0) + 1, to: (tiers.at(-1)?.to ?? 0) + 250_000, fee: 240 }])}>
                <i className="bi bi-plus-lg me-1" />Add tier
              </button>
            </div>
          </div>
        )}
        {step === 3 && (
          <>
            <div className="row g-2 mb-3">
              {[{ l: "Revenue impact (30d)", v: kes(revenueDelta, { compact: true }), t: revenueDelta < 0 ? "red" : "green" },
                { l: "Customers affected", v: "89,214", t: "blue" },
                { l: "Transactions repriced", v: chosen.volume.split(" ")[0], t: "violet" },
                { l: "Competitor midpoint", v: "0.48%", t: "grey" }].map((x) => (
                <div className="col-6 col-lg-3" key={x.l}><div className="pm-stat">
                  <div className="pm-stat-label">{x.l}</div>
                  <div className="pm-stat-value" style={{ fontSize: "1.05rem" }}>{x.v}</div>
                  <Badge tone={x.t}>{x.t === "red" ? "Reduces revenue" : "Modelled"}</Badge>
                </div></div>
              ))}
            </div>
            <div className="pm-card pm-card-pad">
              <div className="pm-eyebrow mb-2">Elasticity model — 12-month revenue at the new rate</div>
              <div className="d-flex align-items-end gap-1" style={{ height: 110 }}>
                {REVENUE_12M.map((m) => (
                  <div key={m.m} className="flex-grow-1 d-flex flex-column align-items-center gap-1">
                    <div style={{ width: "100%", height: `${(m.rev / 200) * 90}px`, background: "linear-gradient(180deg,#12b76a,#a6e9c7)", borderRadius: "6px 6px 0 0" }} />
                    <span style={{ fontSize: ".62rem", color: "var(--pm-muted)" }}>{m.m}</span>
                  </div>
                ))}
              </div>
              <div className="pm-note mt-2">Volume is forecast to rise 6.4% as the rate falls, recovering roughly 41% of the headline revenue reduction within two months.</div>
            </div>
          </>
        )}
        {step === 4 && (
          <>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-kv"><span className="k">Rail</span><span className="v">{chosen.label}</span></div>
              <div className="pm-kv"><span className="k">Model</span><span className="v">{model}</span></div>
              <div className="pm-kv"><span className="k">New rate</span><span className="v">{model === "flat" ? `KES ${rate}` : `${rate}%`} (cap KES {cap})</span></div>
              <div className="pm-kv"><span className="k">Tiers</span><span className="v">{tiers.length} bands</span></div>
              <div className="pm-kv"><span className="k">Effective</span><span className="v">{new Date(effective).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</span></div>
              <div className="pm-kv"><span className="k">Customer notice</span><span className="v">30 days (CBK requirement)</span></div>
            </div>
            <TwoFactorField value={code} onChange={setCode} />
          </>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}><i className="bi bi-arrow-left me-1" />Back</button>}
        {step < 4 && <button className="btn btn-primary btn-sm" onClick={() => setStep(step + 1)}>Next<i className="bi bi-arrow-right ms-1" /></button>}
        {step === 4 && <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => {
          push({ kind: "success", title: "Fee schedule published", body: `${chosen.label} → ${rate}${model === "flat" ? " KES" : "%"} effective ${effective}. 30-day notice queued.` }); close();
        }}><i className="bi bi-check2-circle me-1" />Publish schedule</button>}
      </div>
    </Modal>
  );
}

/* ============================ 7. Reconciliation modal ============================ */
export function ReconciliationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [scope, setScope] = useState("today");
  const [rails, setRails] = useState({ mpesa: true, cards: true, banks: true, partners: false });
  const [code, setCode] = useState("");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const run = () => {
    setRunning(true); setProgress(0);
    const t = setInterval(() => setProgress((p) => {
      if (p >= 100) { clearInterval(t); return 100; }
      return p + 4;
    }), 90);
    setTimeout(() => {
      push({ kind: "success", title: "Reconciliation complete", body: "REC-2026-0824 · 1,247,893 records matched · 14 breaks raised." });
      setRunning(false); setProgress(0); onClose();
    }, 2600);
  };
  return (
    <Modal open={open} onClose={running ? () => {} : onClose} tone="green" icon="bi-arrow-repeat" size="md"
      title="Trigger reconciliation run" subtitle="Matches internal ledger against partner settlement files.">
      <div className="pm-modal-body">
        {!running ? (
          <>
            <label className="form-label">Period</label>
            <div className="d-flex gap-1 flex-wrap mb-3">
              {[["today", "Today"], ["yesterday", "Yesterday"], ["week", "This week"], ["month", "August 2026"]].map(([v, l]) => (
                <button key={v} className={`pm-chip ${scope === v ? "active" : ""}`} onClick={() => setScope(v)}>{l}</button>
              ))}
            </div>
            <label className="form-label">Rails to reconcile</label>
            <div className="d-flex flex-column gap-2 mb-3">
              {[["mpesa", "M-Pesa (Safaricom Daraja)", "653,896 records"], ["cards", "Cards (Visa + Mastercard)", "287,850 records"],
                ["banks", "Bank direct (i&M, KCB, Equity)", "51,204 records"], ["partners", "Partner disbursements", "18,442 records"]].map(([k, l, d]) => (
                <label key={k} className={`pm-opt ${rails[k as keyof typeof rails] ? "active" : ""}`}>
                  <input type="checkbox" className="form-check-input mt-0" checked={rails[k as keyof typeof rails]}
                    onChange={(e) => setRails({ ...rails, [k]: e.target.checked })} />
                  <span className="flex-grow-1"><span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>{l}</span>
                    <span className="d-block" style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>{d}</span></span>
                </label>
              ))}
            </div>
            <TwoFactorField value={code} onChange={setCode} />
          </>
        ) : (
          <div className="text-center py-4">
            <div className="mb-3" style={{ fontWeight: 700 }}>Reconciling {Object.values(rails).filter(Boolean).length} rails…</div>
            <div className="progress mb-2" style={{ height: 8 }}><div className="progress-bar" style={{ width: `${progress}%` }} /></div>
            <div style={{ fontSize: ".78rem", color: "var(--pm-muted)" }}>
              {progress < 30 ? "Fetching settlement files…" : progress < 60 ? "Matching ledger entries…" : progress < 90 ? "Detecting breaks…" : "Writing report…"}
            </div>
          </div>
        )}
      </div>
      {!running && (
        <div className="pm-modal-foot">
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={run}><i className="bi bi-play-fill me-1" />Run reconciliation</button>
        </div>
      )}
    </Modal>
  );
}

/* ============================ 8. Export report modal ============================ */
export function ExportReportModal({ open, onClose, datasets }: {
  open: boolean; onClose: () => void; datasets: { id: string; label: string; rows: Record<string, unknown>[] }[];
}) {
  const { push } = useToast();
  const [ds, setDs] = useState(datasets[0]?.id ?? "");
  const [fmt, setFmt] = useState("csv");
  const [range, setRange] = useState("30d");
  const [watermark, setWatermark] = useState(true);
  const set = datasets.find((d) => d.id === ds);
  return (
    <Modal open={open} onClose={onClose} tone="blue" icon="bi-download" size="md"
      title="Export platform report" subtitle="All exports are watermarked and written to the audit log.">
      <div className="pm-modal-body">
        <label className="form-label">Dataset</label>
        <select className="form-select mb-3" value={ds} onChange={(e) => setDs(e.target.value)}>
          {datasets.map((d) => <option key={d.id} value={d.id}>{d.label} ({d.rows.length} rows)</option>)}
        </select>
        <label className="form-label">Format</label>
        <div className="d-flex gap-2 mb-3">
          {[["csv", "bi-filetype-csv", "CSV"], ["json", "bi-filetype-json", "JSON"], ["xlsx", "bi-file-earmark-excel", "Excel"], ["pdf", "bi-file-earmark-pdf", "PDF"]].map(([v, i, l]) => (
            <button key={v} className={`pm-opt ${fmt === v ? "active" : ""}`} style={{ flexDirection: "column", gap: ".3rem", padding: ".7rem .4rem" }} onClick={() => setFmt(v)}>
              <i className={`bi ${i}`} style={{ fontSize: "1.3rem", color: fmt === v ? "var(--pm-green)" : "var(--pm-muted)" }} />
              <span style={{ fontSize: ".76rem", fontWeight: 700 }}>{l}</span>
            </button>
          ))}
        </div>
        <label className="form-label">Date range</label>
        <div className="d-flex gap-1 flex-wrap mb-3">
          {[["24h", "Last 24 hours"], ["7d", "Last 7 days"], ["30d", "Last 30 days"], ["90d", "Last quarter"], ["ytd", "Year to date"]].map(([v, l]) => (
            <button key={v} className={`pm-chip ${range === v ? "active" : ""}`} onClick={() => setRange(v)}>{l}</button>
          ))}
        </div>
        <label className="pm-opt">
          <input type="checkbox" className="form-check-input mt-0" checked={watermark} onChange={(e) => setWatermark(e.target.checked)} />
          <span className="flex-grow-1"><span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>Watermark with my identity</span>
            <span className="d-block" style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>Embeds “Jeckonia Kwasa · {new Date().toLocaleDateString("en-GB")}” in every page/row</span></span>
        </label>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => {
          if (!set) return;
          const rows = watermark ? set.rows.map((r) => ({ ...r, exported_by: "Jeckonia Kwasa", exported_at: new Date().toISOString(), range })) : set.rows;
          if (fmt === "json") jsonDownload(`paymo-${set.id}-${range}.json`, rows);
          else csvDownload(`paymo-${set.id}-${range}.${fmt === "csv" ? "csv" : "csv"}`, rows);
          push({ kind: "success", title: "Export ready", body: `${set.label} · ${rows.length} rows · ${fmt.toUpperCase()} downloaded.` });
          onClose();
        }}><i className="bi bi-download me-1" />Download export</button>
      </div>
    </Modal>
  );
}

/* ============================ 9. System health drawer ============================ */
export function HealthDrawer({ card, onClose }: { card: HealthCard | null; onClose: () => void }) {
  const { push } = useToast();
  if (!card) return null;
  const tone = card.status === "ok" ? "green" : card.status === "warn" ? "amber" : "red";
  return (
    <Drawer open onClose={onClose} tone={tone as "green"} icon={card.icon} title={card.name}
      subtitle={`${card.headline} · last checked ${card.lastCheck}`}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => push({ kind: "success", title: `${card.name} health check triggered`, body: "Fresh probe completed in 412 ms — all green." })}>
          <i className="bi bi-arrow-clockwise me-1" />Run health check
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => { csvDownload(`${card.id}-metrics.csv`, card.metrics); push({ kind: "success", title: "Metrics exported" }); }}>
          <i className="bi bi-download me-1" />Export
        </button>
      </>}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="d-flex align-items-center justify-content-between">
          <div><div className="pm-eyebrow">Current</div><div style={{ fontSize: "1.4rem", fontWeight: 800, fontFamily: "Sora" }}>{card.headline}</div>
            <div style={{ fontSize: ".78rem", color: "var(--pm-muted)" }}>{card.detail}</div></div>
          <Sparkline data={card.history} color={tone === "green" ? "#12b76a" : "#f79009"} w={140} h={48} />
        </div>
      </div>
      <div className="pm-card mb-3">
        <div className="pm-card-head"><h6 className="pm-card-title">Detailed metrics</h6><Badge tone={tone}>{card.status === "ok" ? "Healthy" : "Attention"}</Badge></div>
        <div className="p-3">{card.metrics.map((m) => <div key={m.k} className="pm-kv"><span className="k">{m.k}</span><span className="v mono">{m.v}</span></div>)}</div>
      </div>
      <div className="pm-card">
        <div className="pm-card-head"><h6 className="pm-card-title">Last 7 checks</h6></div>
        <div className="pm-table-wrap"><table className="pm-table">
          <thead><tr><th>Time</th><th>Result</th><th className="text-end">Value</th></tr></thead>
          <tbody>{card.history.map((h, i) => (
            <tr key={i}><td className="mono">{`${13 - i}:${String(30 - i * 4).padStart(2, "0")}`}</td>
              <td><Badge tone={tone} dot>Pass</Badge></td><td className="text-end mono">{h}</td></tr>
          ))}</tbody>
        </table></div>
      </div>
    </Drawer>
  );
}

/* ============================ 10. Revenue drill-down modal ============================ */
export function RevenueDrilldownModal({ source, onClose }: { source: RevenueSource | null; onClose: () => void }) {
  const { push } = useToast();
  if (!source) return null;
  const months = REVENUE_12M.map((m) => ({ ...m, val: Math.round((m.rev * source.pct) / 100 * 10) / 10 }));
  return (
    <Modal open onClose={onClose} tone="green" icon="bi-pie-chart-fill" size="lg"
      title={source.source} subtitle={`${source.pct}% of platform revenue · owned by ${source.owner}`}>
      <div className="pm-modal-body">
        <div className="row g-2 mb-3">
          {[{ l: "Revenue (30d)", v: kes(source.amount, { compact: true }) }, { l: "MoM change", v: source.mom },
            { l: "Gross margin", v: `${source.margin}%` }, { l: "Share of total", v: `${source.pct}%` }].map((x) => (
            <div className="col-6 col-lg-3" key={x.l}><div className="pm-stat"><div className="pm-stat-label">{x.l}</div>
              <div className="pm-stat-value" style={{ fontSize: "1.05rem" }}>{x.v}</div></div></div>
          ))}
        </div>
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-eyebrow mb-2">12-month contribution (KES millions)</div>
          <div className="d-flex align-items-end gap-1" style={{ height: 120 }}>
            {months.map((m) => (
              <div key={m.m} className="flex-grow-1 d-flex flex-column align-items-center gap-1">
                <span style={{ fontSize: ".6rem", color: "var(--pm-muted)", fontWeight: 700 }}>{m.val}</span>
                <div style={{ width: "100%", height: `${(m.val / (months.at(-1)!.val || 1)) * 80}px`, background: source.color, borderRadius: "6px 6px 0 0", opacity: .85 }} />
                <span style={{ fontSize: ".62rem", color: "var(--pm-muted)" }}>{m.m}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="pm-card pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Sub-line</th><th className="text-end">Revenue</th><th className="text-end">Volume</th><th className="text-end">Take rate</th><th>Trend</th></tr></thead>
            <tbody>
              {[["Peer-to-peer", 0.42], ["Merchant collections", 0.28], ["Bill payments", 0.16], ["Payouts & disbursement", 0.09], ["Cross-border", 0.05]].map(([l, w]) => (
                <tr key={l as string}>
                  <td className="pm-td-strong">{l}</td>
                  <td className="text-end pm-num">{kes(source.amount * (w as number))}</td>
                  <td className="text-end pm-num">{num(Math.round(1_247_893 * (w as number) * (source.pct / 100)))}</td>
                  <td className="text-end pm-num">{(0.31 + (w as number)).toFixed(2)}%</td>
                  <td><Meter value={(w as number) * 240} tone={source.color} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => { csvDownload(`${source.source}-breakdown.csv`, REVENUE_SOURCES as unknown as Record<string, unknown>[]); push({ kind: "success", title: "Breakdown exported" }); }}>
          <i className="bi bi-download me-1" />Export breakdown
        </button>
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ============================ 11. Hour drill-down modal ============================ */
export function HourDrilldownModal({ hour, onClose }: { hour: TxHour | null; onClose: () => void }) {
  const { push } = useToast();
  if (!hour) return null;
  const delta = ((hour.today - hour.yesterday) / hour.yesterday) * 100;
  const rows = [
    { ch: "M-Pesa", pct: 0.524, lat: "3.2s" }, { ch: "Card (Visa)", pct: 0.168, lat: "1.8s" },
    { ch: "Bank transfer", pct: 0.121, lat: "45s" }, { ch: "Internal", pct: 0.104, lat: "0.3s" },
    { ch: "Card (Mastercard)", pct: 0.056, lat: "1.9s" }, { ch: "ATM", pct: 0.027, lat: "12s" },
  ];
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-clock-history" size="lg"
      title={`Hour ${hour.hour} — transaction drill-down`} subtitle={`${num(hour.today)} transactions · ${hour.success}% success · ${delta > 0 ? "+" : ""}${delta.toFixed(1)}% vs yesterday`}>
      <div className="pm-modal-body">
        {hour.anomaly && (
          <div className="pm-note mb-3" style={{ borderColor: "#fde3b8", background: "#fff5e6", color: "#b54708" }}>
            <i className="bi bi-activity me-1" /><b>Anomaly detected:</b> {hour.anomaly}
          </div>
        )}
        <div className="row g-2 mb-3">
          {[{ l: "Transactions", v: num(hour.today) }, { l: "Yesterday", v: num(hour.yesterday) },
            { l: "Success rate", v: `${hour.success}%` }, { l: "Est. value", v: kes(hour.today * 14_900, { compact: true }) }].map((x) => (
            <div className="col-6 col-lg-3" key={x.l}><div className="pm-stat"><div className="pm-stat-label">{x.l}</div>
              <div className="pm-stat-value" style={{ fontSize: "1.05rem" }}>{x.v}</div></div></div>
          ))}
        </div>
        <div className="pm-card pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Channel</th><th className="text-end">Transactions</th><th className="text-end">Value</th><th className="text-end">Avg latency</th><th>Share</th></tr></thead>
            <tbody>{rows.map((r) => (
              <tr key={r.ch}>
                <td className="pm-td-strong">{r.ch}</td>
                <td className="text-end pm-num">{num(Math.round(hour.today * r.pct))}</td>
                <td className="text-end pm-num">{kes(Math.round(hour.today * r.pct * 14_900), { compact: true })}</td>
                <td className="text-end pm-num">{r.lat}</td>
                <td><Meter value={r.pct * 190} /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => { csvDownload(`hour-${hour.hour.replace(":", "")}.csv`, rows); push({ kind: "success", title: "Hour export downloaded" }); }}>
          <i className="bi bi-download me-1" />Export hour
        </button>
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ============================ 12. Defaulter drawer + recovery wizard ============================ */
export function DefaulterDrawer({ item, onClose, onRecover }: { item: Defaulter | null; onClose: () => void; onRecover: (d: Defaulter) => void }) {
  const { push } = useToast();
  if (!item) return null;
  return (
    <Drawer open onClose={onClose} tone={item.daysPastDue >= 90 ? "red" : "amber"} icon="bi-exclamation-circle"
      title={item.user} subtitle={`${item.id} · ${item.product} · ${item.daysPastDue} days past due`}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => push({ kind: "info", title: `Calling ${item.phone}`, body: "Softphone session opened · call is recorded for compliance." })}>
          <i className="bi bi-telephone me-1" />Call
        </button>
        <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => push({ kind: "success", title: "Reminder SMS queued", body: `${item.phone} · template ARR-03 · delivery in ~4s.` })}>
          <i className="bi bi-chat-dots me-1" />Send reminder
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => onRecover(item)}><i className="bi bi-cash-coin me-1" />Recovery plan</button>
      </>}>
      <div className="pm-card pm-card-pad mb-3 d-flex align-items-center gap-3">
        <Avatar name={item.user} size="lg" />
        <div className="flex-grow-1">
          <div style={{ fontWeight: 700 }}>{item.user}</div>
          <div style={{ fontSize: ".76rem", color: "var(--pm-muted)" }}>{item.account} · {item.phone} · {item.county}</div>
          <div className="d-flex gap-1 mt-1"><Badge tone={item.daysPastDue >= 90 ? "red" : item.daysPastDue >= 60 ? "amber" : "blue"}>{item.bucket} bucket</Badge><Badge tone="grey">{item.status}</Badge></div>
        </div>
      </div>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Principal</span><span className="v">{kes(item.principal)}</span></div>
        <div className="pm-kv"><span className="k">Outstanding</span><span className="v" style={{ color: "#d92d20" }}>{kes(item.outstanding)}</span></div>
        <div className="pm-kv"><span className="k">Accrued interest</span><span className="v">{kes(item.outstanding - item.principal)}</span></div>
        <div className="pm-kv"><span className="k">Days past due</span><span className="v">{item.daysPastDue}</span></div>
        <div className="pm-kv"><span className="k">Last payment</span><span className="v">{item.lastPayment}</span></div>
        <div className="pm-kv"><span className="k">Recovery agent</span><span className="v">{item.agent}</span></div>
        <div className="pm-kv"><span className="k">Contact attempts</span><span className="v">{item.attempts}</span></div>
        <div className="pm-kv"><span className="k">Credit score</span><span className="v"><Badge tone={item.score > 70 ? "red" : item.score > 40 ? "amber" : "green"}>{item.score}</Badge></span></div>
      </div>
      <div className="pm-card">
        <div className="pm-card-head"><h6 className="pm-card-title">Collection history</h6></div>
        <div className="p-3"><div className="pm-timeline">
          {[["Loan disbursed", `${kes(item.principal)} · ${item.product}`, "done"],
            ["First missed instalment", `${item.daysPastDue} days ago`, "warn"],
            ["Reminder SMS sent", `${item.attempts} attempts by ${item.agent}`, "warn"],
            [item.status === "Legal" ? "Demand letter issued" : "Negotiation opened", item.status === "Legal" ? "Advocate: Mwangi & Co" : "Awaiting customer response", item.status === "Legal" ? "danger" : ""],
          ].map(([t, d, c]) => (
            <div key={t as string} className={`pm-tl-item ${c}`}>
              <div style={{ fontWeight: 700, fontSize: ".82rem" }}>{t}</div>
              <div style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>{d}</div>
            </div>
          ))}
        </div></div>
      </div>
    </Drawer>
  );
}

export function RecoveryWizard({ item, onClose }: { item: Defaulter | null; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState("restructure");
  const [months, setMonths] = useState(6);
  const [haircut, setHaircut] = useState(0);
  const [agent, setAgent] = useState("Grace Wanjiru");
  const steps = [{ label: "Strategy", icon: "bi-signpost" }, { label: "Terms", icon: "bi-calculator" }, { label: "Owner", icon: "bi-person-check" }, { label: "Confirm", icon: "bi-check2" }];
  if (!item) return null;
  const monthly = Math.round((item.outstanding * (1 - haircut / 100)) / months);
  const close = () => { setStep(0); onClose(); };
  return (
    <Modal open onClose={close} tone="amber" icon="bi-cash-coin" size="md"
      title={`Recovery plan — ${item.user}`} subtitle={`${item.id} · ${kes(item.outstanding)} outstanding · ${item.daysPastDue} DPD`}>
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%`, background: "#f79009" }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div className="d-flex flex-column gap-2">
            {[{ id: "restructure", l: "Restructure the loan", d: "Extend the tenor and reset the arrears clock", i: "bi-arrow-repeat" },
              { id: "settlement", l: "Negotiated settlement", d: "Accept a discounted lump sum to close the account", i: "bi-hand-thumbs-up" },
              { id: "salary", l: "Salary deduction order", d: "Route repayments from the employer disbursement", i: "bi-briefcase" },
              { id: "legal", l: "Escalate to legal", d: "Issue a demand letter through Mwangi & Co Advocates", i: "bi-bank" },
              { id: "writeoff", l: "Write off", d: "Move to the write-off pool and report to CRB", i: "bi-x-octagon" }].map((p) => (
              <button key={p.id} className={`pm-opt ${plan === p.id ? "active" : ""}`} onClick={() => setPlan(p.id)}>
                <span className="r" /><i className={`bi ${p.i}`} style={{ color: "#b54708", fontSize: "1.05rem" }} />
                <span className="flex-grow-1"><span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>{p.l}</span>
                  <span className="d-block" style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>{p.d}</span></span>
              </button>
            ))}
          </div>
        )}
        {step === 1 && (
          <>
            <label className="form-label">Repayment period — {months} months</label>
            <input type="range" className="form-range mb-3" min={1} max={24} value={months} onChange={(e) => setMonths(Number(e.target.value))} />
            <label className="form-label">Principal haircut — {haircut}%</label>
            <input type="range" className="form-range mb-3" min={0} max={40} step={5} value={haircut} onChange={(e) => setHaircut(Number(e.target.value))} />
            <div className="pm-card pm-card-pad">
              <div className="pm-kv"><span className="k">Amount to recover</span><span className="v">{kes(item.outstanding * (1 - haircut / 100))}</span></div>
              <div className="pm-kv"><span className="k">Monthly instalment</span><span className="v">{kes(monthly)}</span></div>
              <div className="pm-kv"><span className="k">Value forgone</span><span className="v" style={{ color: "#d92d20" }}>{kes(item.outstanding * (haircut / 100))}</span></div>
              <div className="pm-kv"><span className="k">Expected recovery rate</span><span className="v">{Math.min(96, 58 + haircut)}%</span></div>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <label className="form-label">Assign recovery agent</label>
            <div className="d-flex flex-column gap-2">
              {["Grace Wanjiru", "Peter Njoroge", "Faith Chebet", "Dennis Otieno"].map((a) => (
                <button key={a} className={`pm-opt ${agent === a ? "active" : ""}`} onClick={() => setAgent(a)}>
                  <span className="r" /><Avatar name={a} size="sm" />
                  <span className="flex-grow-1"><span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>{a}</span>
                    <span className="d-block" style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>
                      {DEFAULTERS.filter((d) => d.agent === a).length} cases · {58 + a.length % 20}% recovery rate</span></span>
                </button>
              ))}
            </div>
          </>
        )}
        {step === 3 && (
          <div className="pm-card pm-card-pad">
            <div className="pm-kv"><span className="k">Customer</span><span className="v">{item.user} · {item.account}</span></div>
            <div className="pm-kv"><span className="k">Strategy</span><span className="v">{plan}</span></div>
            <div className="pm-kv"><span className="k">Terms</span><span className="v">{months} months · {haircut}% haircut</span></div>
            <div className="pm-kv"><span className="k">Monthly instalment</span><span className="v">{kes(monthly)}</span></div>
            <div className="pm-kv"><span className="k">Agent</span><span className="v">{agent}</span></div>
            <div className="pm-kv"><span className="k">CRB reporting</span><span className="v">{plan === "writeoff" ? "Yes — adverse listing" : "Suspended while performing"}</span></div>
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}><i className="bi bi-arrow-left me-1" />Back</button>}
        {step < 3 && <button className="btn btn-primary btn-sm" onClick={() => setStep(step + 1)}>Next<i className="bi bi-arrow-right ms-1" /></button>}
        {step === 3 && <button className="btn btn-primary btn-sm" onClick={() => {
          push({ kind: "success", title: "Recovery plan activated", body: `${item.id} · ${plan} · ${agent} notified · first instalment due in 30 days.` }); close();
        }}><i className="bi bi-check2-circle me-1" />Activate plan</button>}
      </div>
    </Modal>
  );
}

/* ============================ 13. Channel detail drawer ============================ */
export function ChannelDrawer({ channel, onClose }: { channel: Channel | null; onClose: () => void }) {
  const { push } = useToast();
  if (!channel) return null;
  return (
    <Drawer open onClose={onClose} tone="green" icon="bi-diagram-2" title={channel.name}
      subtitle={`${channel.share}% of platform volume · ${num(channel.txns)} transactions`}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => push({ kind: "info", title: `${channel.name} runbook opened`, body: "Escalation path: Payments guild → partner NOC → CBK notification." })}>
          <i className="bi bi-journal-text me-1" />Runbook
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => { csvDownload(`${channel.name}-metrics.csv`, [channel as unknown as Record<string, unknown>]); push({ kind: "success", title: "Channel metrics exported" }); }}>
          <i className="bi bi-download me-1" />Export
        </button>
      </>}>
      <div className="row g-2 mb-3">
        {[{ l: "Volume (30d)", v: kes(channel.volume, { compact: true }) }, { l: "Revenue", v: kes(channel.revenue, { compact: true }) },
          { l: "Avg ticket", v: kes(channel.avgTicket) }, { l: "Success rate", v: `${channel.successRate}%` }].map((x) => (
          <div className="col-6" key={x.l}><div className="pm-stat"><div className="pm-stat-label">{x.l}</div>
            <div className="pm-stat-value" style={{ fontSize: "1rem" }}>{x.v}</div></div></div>
        ))}
      </div>
      <div className="pm-card pm-card-pad mb-3">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <span className="pm-eyebrow">Growth vs last month</span>
          <span className={channel.growth >= 0 ? "pm-trend-up" : "pm-trend-down"}>
            <i className={`bi ${channel.growth >= 0 ? "bi-arrow-up-right" : "bi-arrow-down-right"}`} /> {Math.abs(channel.growth)}%
          </span>
        </div>
        <Sparkline data={[62, 66, 64, 71, 75, 73, 82, 88, 91, 96, 100].map((v) => v * (1 + channel.growth / 100))} color={channel.color} w={420} h={70} />
      </div>
      <div className="pm-card">
        <div className="pm-card-head"><h6 className="pm-card-title">Operational profile</h6></div>
        <div className="p-3">
          <div className="pm-kv"><span className="k">Rail provider</span><span className="v">{channel.name.includes("M-Pesa") ? "Safaricom Daraja" : channel.name.includes("Visa") ? "Visa Direct" : channel.name.includes("Master") ? "Mastercard Send" : channel.name.includes("Bank") ? "PesaLink / IPS Kenya" : channel.name === "ATM" ? "Kenswitch" : "PayMo core ledger"}</span></div>
          <div className="pm-kv"><span className="k">Settlement cycle</span><span className="v">{channel.name.includes("Card") ? "T+2" : channel.name.includes("Bank") ? "T+1" : "Real time"}</span></div>
          <div className="pm-kv"><span className="k">Take rate</span><span className="v">{((channel.revenue / channel.volume) * 100).toFixed(2)}%</span></div>
          <div className="pm-kv"><span className="k">Chargeback rate</span><span className="v">{channel.name.includes("Card") ? "0.04%" : "n/a"}</span></div>
          <div className="pm-kv"><span className="k">Circuit breaker</span><span className="v"><Badge tone="green">Closed</Badge></span></div>
        </div>
      </div>
    </Drawer>
  );
}

/* ============================ 14. User search modal ============================ */
export function UserSearchModal({ open, onClose, onFreeze }: { open: boolean; onClose: () => void; onFreeze: () => void }) {
  const { push } = useToast();
  const [q, setQ] = useState("");
  const [tier, setTier] = useState("all");
  const users = DEFAULTERS.slice(0, 20).map((d, i) => ({
    id: d.account, name: d.user, phone: d.phone, county: d.county,
    tier: (["Basic", "Verified", "VIP", "Business"] as const)[i % 4],
    balance: 4_000 + ((i * 91_337) % 1_800_000), status: (["Active", "Active", "Active", "Frozen", "Dormant"] as const)[i % 5],
    kyc: (["Verified", "Verified", "Pending", "Verified"] as const)[i % 4],
  }));
  const list = users.filter((u) => (u.name + u.id + u.phone + u.county).toLowerCase().includes(q.toLowerCase()) && (tier === "all" || u.tier === tier));
  return (
    <Modal open={open} onClose={onClose} tone="blue" icon="bi-search" size="xl"
      title="Search users" subtitle="Directory snapshot — 148,392 registered users. Full directory lives on Page 4.">
      <div className="pm-modal-body">
        <div className="d-flex gap-2 flex-wrap mb-3">
          <div className="pm-search flex-grow-1" style={{ maxWidth: "none", background: "#fff" }}>
            <i className="bi bi-search" /><input autoFocus placeholder="Name, account, phone or county…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className="form-select" style={{ width: 160 }} value={tier} onChange={(e) => setTier(e.target.value)}>
            <option value="all">All tiers</option><option>Basic</option><option>Verified</option><option>VIP</option><option>Business</option>
          </select>
        </div>
        <div className="pm-card pm-table-wrap" style={{ maxHeight: 380, overflowY: "auto" }}>
          <table className="pm-table">
            <thead><tr><th>Customer</th><th>Account</th><th>Tier</th><th>KYC</th><th className="text-end">Balance</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.id}>
                  <td><div className="d-flex align-items-center gap-2"><Avatar name={u.name} size="sm" />
                    <div><div className="pm-td-strong">{u.name}</div><div className="pm-td-sub">{u.phone} · {u.county}</div></div></div></td>
                  <td className="mono">{u.id}</td>
                  <td><Badge tone={u.tier === "VIP" ? "violet" : u.tier === "Business" ? "blue" : "grey"}>{u.tier}</Badge></td>
                  <td><Badge tone={u.kyc === "Verified" ? "green" : "amber"}>{u.kyc}</Badge></td>
                  <td className="text-end pm-num">{kes(u.balance)}</td>
                  <td><Badge tone={u.status === "Active" ? "green" : u.status === "Frozen" ? "red" : "grey"} dot>{u.status}</Badge></td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => push({ kind: "info", title: `${u.name} profile`, body: `${u.id} · ${u.tier} · balance ${kes(u.balance)} · KYC ${u.kyc}` })}>View</button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan={7}><div className="pm-empty"><i className="bi bi-person-x" /><div style={{ fontWeight: 700, color: "var(--pm-ink)" }}>No users found</div>
                <button className="btn btn-outline-secondary btn-sm mt-2" onClick={() => { setQ(""); setTier("all"); }}>Clear filters</button></div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <div className="pm-modal-foot">
        <span className="me-auto" style={{ fontSize: ".78rem", color: "var(--pm-muted)" }}>Showing {list.length} of {users.length} sampled users</span>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => { csvDownload("user-sample.csv", list); push({ kind: "success", title: "User sample exported" }); }}>
          <i className="bi bi-download me-1" />Export
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => { onClose(); onFreeze(); }}><i className="bi bi-snow me-1" />Freeze an account</button>
      </div>
    </Modal>
  );
}

/* ============================ 15. Portfolio composition modal ============================ */
export function PortfolioModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const composition = [
    { label: "Customer wallet balances", value: 1_284_000_000, color: "#12b76a" },
    { label: "Merchant float", value: 512_000_000, color: "#2e90fa" },
    { label: "Loan book (net)", value: 342_000_000, color: "#7a5af8" },
    { label: "Card prefunding pools", value: 186_000_000, color: "#f79009" },
    { label: "Partner escrow", value: 98_000_000, color: "#16b364" },
    { label: "Treasury & reserves", value: 48_000_000, color: "#98a2b3" },
  ];
  const total = composition.reduce((s, c) => s + c.value, 0);
  return (
    <Modal open={open} onClose={onClose} tone="green" icon="bi-safe2-fill" size="lg"
      title="Portfolio composition" subtitle={`${kes(total, { compact: true })} under management · reconciled to the ledger 4 minutes ago`}>
      <div className="pm-modal-body">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-5 d-flex justify-content-center">
            <Donut data={composition.map((c) => ({ label: c.label, value: c.value, color: c.color }))} size={200} thickness={30}
              center={<div><div className="pm-eyebrow">Total</div><div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1.05rem" }}>{kes(total, { compact: true })}</div></div>} />
          </div>
          <div className="col-12 col-md-7">
            {composition.map((c) => (
              <div key={c.label} className="d-flex align-items-center gap-2 py-2" style={{ borderBottom: "1px dashed #eaedf3" }}>
                <span className="pm-legend-dot" style={{ background: c.color }} />
                <span className="flex-grow-1" style={{ fontSize: ".84rem", fontWeight: 600 }}>{c.label}</span>
                <span className="pm-num" style={{ fontWeight: 700 }}>{kes(c.value, { compact: true })}</span>
                <Badge tone="grey">{((c.value / total) * 100).toFixed(1)}%</Badge>
              </div>
            ))}
          </div>
        </div>
        <div className="pm-note mt-3">Customer balances are held in segregated trust accounts at i&M Bank and KCB, in line with CBK Payment Service Provider regulations. Reserves cover 4.2% of customer liabilities against a 3% requirement.</div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => csvDownload("portfolio-composition.csv", composition)}><i className="bi bi-download me-1" />Export</button>
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ============================ 16. Bulk alert action modal ============================ */
export function BulkAlertModal({ open, onClose, count, onDone }: { open: boolean; onClose: () => void; count: number; onDone: (action: string) => void }) {
  const [action, setAction] = useState("acknowledge");
  const [note, setNote] = useState("");
  return (
    <Modal open={open} onClose={onClose} tone="amber" icon="bi-check2-square" size="sm"
      title={`Bulk action on ${count} alerts`} subtitle="Applied atomically — one audit entry per alert.">
      <div className="pm-modal-body">
        <div className="d-flex flex-column gap-2 mb-3">
          {[{ id: "acknowledge", l: "Acknowledge", i: "bi-check2" }, { id: "assign", l: "Assign to me", i: "bi-person-check" },
            { id: "snooze", l: "Snooze 1 hour", i: "bi-alarm" }, { id: "escalate", l: "Escalate to incident", i: "bi-fire" }].map((a) => (
            <button key={a.id} className={`pm-opt ${action === a.id ? "active" : ""}`} onClick={() => setAction(a.id)}>
              <span className="r" /><i className={`bi ${a.i}`} style={{ color: "#b54708" }} />
              <span style={{ fontWeight: 700, fontSize: ".85rem" }}>{a.l}</span>
            </button>
          ))}
        </div>
        <label className="form-label">Note (optional)</label>
        <textarea className="form-control" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => { onDone(action); onClose(); }}>Apply to {count}</button>
      </div>
    </Modal>
  );
}

/* ============================ 17. Quick action router modal ============================ */
export function QuickActionModal({ action, onClose, onRoute }: {
  action: { id: string; label: string; hint: string; confirm: string; icon: string } | null;
  onClose: () => void; onRoute: (id: string) => void;
}) {
  const { push } = useToast();
  if (!action) return null;
  return (
    <Modal open onClose={onClose} tone="ink" icon={action.icon} size="sm" title={action.label} subtitle={action.hint}>
      <div className="pm-modal-body">
        <div className="pm-kv"><span className="k">Destination</span><span className="v">{action.hint}</span></div>
        <div className="pm-kv"><span className="k">Confirmation required</span><span className="v">{action.confirm}</span></div>
        <div className="pm-kv"><span className="k">Your permission</span><span className="v"><Badge tone="green">Granted (Tier 0)</Badge></span></div>
        <div className="pm-note mt-3">This module is specified in the blueprint. Choose an action below — nothing here is a dead end.</div>
        <div className="mt-3">
          <DDItem icon="bi-box-arrow-up-right" label="Open the live Real-Time Monitor" onClick={() => { onRoute("monitor"); onClose(); }} />
          <DDItem icon="bi-pin-angle" label="Pin this module to my roadmap" onClick={() => { push({ kind: "success", title: `${action.label} pinned` }); onClose(); }} />
          <DDItem icon="bi-download" label="Download the module specification" onClick={() => { jsonDownload(`${action.id}-spec.json`, action); push({ kind: "success", title: "Specification downloaded" }); onClose(); }} />
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-primary btn-sm" onClick={onClose}>Close</button></div>
    </Modal>
  );
}
