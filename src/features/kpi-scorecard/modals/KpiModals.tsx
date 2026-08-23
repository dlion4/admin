import { useState } from "react";
import {
  Modal, Drawer, Steps, Badge, Avatar, TwoFactorField, useToast, Meter, Sparkline, DDItem,
} from "../../../components/ui";
import { csvDownload, kes, num } from "../../../lib/format";
import type { KPI, OKR, Department, BoardPack, TargetChange } from "../data/kpiData";
import { fmt as fmtKpi, COHORT } from "../data/kpiData";

/* ============================ 1. KPI detail drawer ============================ */
export function KpiDrawer({ kpi, onClose, onEditTarget }: {
  kpi: KPI | null; onClose: () => void; onEditTarget: (k: KPI) => void;
}) {
  const { push } = useToast();
  if (!kpi) return null;
  const targetPct = Math.min(120, Math.round((kpi.value / kpi.target) * 100));
  const prevPct = Math.round((kpi.value / kpi.prev) * 100 - 100);
  return (
    <Drawer open onClose={onClose} wide icon="bi-graph-up-arrow"
      tone={kpi.rag === "green" ? "green" : kpi.rag === "amber" ? "amber" : "red"}
      title={kpi.name} subtitle={`${kpi.category} · owned by ${kpi.owner}`}
      headExtra={<Badge tone={kpi.rag}>{kpi.rag.toUpperCase()}</Badge>}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm flex-grow-1"
          onClick={() => { csvDownload(`${kpi.id}.csv`, [{ ...kpi, history: kpi.trend.join("|") }]); push({ kind: "success", title: "KPI exported" }); }}>
          <i className="bi bi-download me-1" />Export series
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => onEditTarget(kpi)}>
          <i className="bi bi-pencil-square me-1" />Edit target
        </button>
      </>}>
      <div className="row g-2 mb-3">
        <div className="col-6">
          <div className="pm-stat"><div className="pm-stat-label">Current</div>
            <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1.4rem" }}>{fmtKpi(kpi)}</div>
            <div style={{ fontSize: ".7rem", color: prevPct >= 0 ? "#0b8f52" : "#d92d20", fontWeight: 700 }}>
              <i className={`bi ${prevPct >= 0 ? "bi-arrow-up-right" : "bi-arrow-down-right"}`} /> {prevPct > 0 ? "+" : ""}{prevPct}% vs prior period
            </div>
          </div>
        </div>
        <div className="col-6">
          <div className="pm-stat"><div className="pm-stat-label">Target</div>
            <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1.4rem" }}>{fmtKpi({ ...kpi, value: kpi.target })}</div>
            <div style={{ fontSize: ".7rem", color: "var(--pm-muted)" }}>{kpi.frequency} · {kpi.direction === "up" ? "higher is better" : "lower is better"}</div>
          </div>
        </div>
      </div>

      <div className="pm-card pm-card-pad mb-3">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div><div className="pm-eyebrow">Progress to target</div>
            <div style={{ fontWeight: 800 }}>{targetPct}%</div></div>
          <Sparkline data={kpi.trend} color={kpi.rag === "green" ? "#12b76a" : kpi.rag === "amber" ? "#f79009" : "#f04438"} w={200} h={56} />
        </div>
        <Meter value={targetPct} tone={targetPct >= 100 ? "#12b76a" : targetPct >= 85 ? "#f79009" : "#f04438"} width={500} />
        <div className="pm-note mt-2"><i className="bi bi-info-circle me-1" />{kpi.definition}</div>
      </div>

      <div className="pm-card mb-3">
        <div className="pm-card-head"><h6 className="pm-card-title">14-period trend</h6><Badge tone="grey">{kpi.frequency}</Badge></div>
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Period</th><th className="text-end">Value</th><th className="text-end">vs previous</th></tr></thead>
            <tbody>{kpi.trend.map((v, i) => {
              const delta = i === 0 ? null : Math.round((v / kpi.trend[i - 1]) * 100 - 100);
              return (<tr key={i}><td>T-{kpi.trend.length - 1 - i}</td>
                <td className="text-end pm-num">{kpi.unit === "KES" ? kes(v, { compact: true }) : num(v)}</td>
                <td className="text-end pm-num" style={{ color: delta && delta >= 0 ? "#0b8f52" : "#d92d20" }}>
                  {delta === null ? "—" : `${delta > 0 ? "+" : ""}${delta}%`}</td></tr>);
            })}</tbody>
          </table>
        </div>
      </div>

      <div className="pm-card">
        <div className="pm-card-head"><h6 className="pm-card-title">Target governance</h6></div>
        <div className="p-3">
          <div className="pm-kv"><span className="k">Edit tier</span><span className="v"><Badge tone={kpi.tier === 0 ? "red" : "amber"}>{kpi.tier === 0 ? "Super Admin" : "Board approval"}</Badge></span></div>
          <div className="pm-kv"><span className="k">Last changed</span><span className="v">03 Aug 2026 · Joseph Mwangi</span></div>
          <div className="pm-kv"><span className="k">Data source</span><span className="v mono">warehouse.rt_kpi_{kpi.id}</span></div>
          <div className="pm-kv"><span className="k">Refresh</span><span className="v">{kpi.frequency} at 06:00 EAT</span></div>
        </div>
      </div>
    </Drawer>
  );
}

/* ============================ 2. Edit target wizard ============================ */
const WIZ_STEPS = [{ label: "Value", icon: "bi-pencil" }, { label: "Justification", icon: "bi-chat-left-text" }, { label: "Approvals", icon: "bi-shield-lock" }, { label: "Confirm", icon: "bi-check2" }];
export function EditTargetWizard({ kpi, onClose, onSave }: { kpi: KPI | null; onClose: () => void; onSave: (v: number, reason: string) => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [target, setTarget] = useState(kpi?.target ?? 0);
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  const approvers = kpi?.tier === 1 ? ["Board", "CFO"] : ["CFO"];
  const boardLock = kpi?.tier === 1;
  const close = () => { setStep(0); setCode(""); setReason(""); onClose(); };
  if (!kpi) return null;
  const canNext = step === 0 ? target > 0 : step === 1 ? reason.trim().length > 15 : step === 2 ? (code === "482913") : true;
  return (
    <Modal open onClose={close} tone={boardLock ? "red" : "green"} icon="bi-bullseye" size="md"
      title={`Edit target — ${kpi.name}`} subtitle={boardLock ? "This KPI requires board approval. Changes are logged for audit." : "Super admin can publish immediately."}>
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / WIZ_STEPS.length) * 100}%`, background: boardLock ? "#f04438" : "var(--pm-green)" }} /></div>
      <Steps steps={WIZ_STEPS} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <>
            <label className="form-label">Current target</label>
            <div className="pm-card pm-card-pad mb-3 text-center">
              <div style={{ fontSize: "1.6rem", fontWeight: 800, fontFamily: "Sora" }}>{fmtKpi(kpi)}</div>
              <div style={{ color: "var(--pm-muted)", fontSize: ".76rem" }}>progress {Math.round((kpi.value / kpi.target) * 100)}%</div>
            </div>
            <label className="form-label">New target</label>
            <div className="d-flex gap-2 mb-3">
              <input type="number" className="form-control mono" value={target} onChange={(e) => setTarget(Number(e.target.value))} />
              <select className="form-select" style={{ width: 120 }} value={kpi.unit} disabled>
                <option>{kpi.unit}</option>
              </select>
            </div>
            <div className="d-flex gap-1 flex-wrap">
              {[
                ["Reset to plan", kpi.prev],
                ["+5% stretch", Math.round(kpi.target * 1.05)],
                ["-10% conservative", Math.round(kpi.target * 0.9)],
              ].map(([l, v]) => (
                <button key={l as string} className="pm-chip" onClick={() => setTarget(v as number)}>{l}</button>
              ))}
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <label className="form-label">Reason for change (minimum 15 characters)</label>
            <textarea className="form-control mb-3" rows={4} value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. H1 actual beat plan by 18.4%; forecast upgrade after Visa BIN go-live." />
            <div className="d-flex gap-1 flex-wrap">
              {["Strong H1 performance", "New product launch", "Cost optimisation", "Market contraction", "Regulatory change"].map((r) => (
                <button key={r} className="pm-chip" onClick={() => setReason((p) => (p ? p + " " : "") + r + ".")}>{r}</button>
              ))}
            </div>
            <div className="pm-note mt-3"><i className="bi bi-info-circle me-1" />Changes are appended to the audit trail and visible in the Target history tab.</div>
          </>
        )}
        {step === 2 && (
          <>
            <label className="form-label">Required approvers</label>
            <div className="d-flex flex-column gap-2 mb-3">
              {approvers.map((a) => (
                <label key={a} className="pm-opt active">
                  <input type="checkbox" className="form-check-input mt-0" defaultChecked />
                  <span style={{ fontWeight: 700, fontSize: ".84rem" }}>{a} <span style={{ color: "var(--pm-muted)", fontWeight: 500, fontSize: ".74rem" }}>notification will be sent on publish</span></span>
                </label>
              ))}
            </div>
            <TwoFactorField value={code} onChange={setCode} />
          </>
        )}
        {step === 3 && (
          <>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-kv"><span className="k">KPI</span><span className="v">{kpi.name}</span></div>
              <div className="pm-kv"><span className="k">Old target</span><span className="v">{fmtKpi({ ...kpi, value: kpi.target })}</span></div>
              <div className="pm-kv"><span className="k">New target</span><span className="v">{fmtKpi({ ...kpi, value: target })}</span></div>
              <div className="pm-kv"><span className="k">Change</span><span className="v" style={{ color: target >= kpi.target ? "#0b8f52" : "#d92d20" }}>{target >= kpi.target ? "+" : ""}{Math.round((target / kpi.target) * 100 - 100)}%</span></div>
              <div className="pm-kv"><span className="k">Approvers</span><span className="v">{approvers.join(", ")}</span></div>
              <div className="pm-kv"><span className="k">Effective from</span><span className="v">01 Sep 2026</span></div>
            </div>
            <div className="pm-note" style={{ borderColor: boardLock ? "#fbd3cf" : "#cfe6ff", background: boardLock ? "#fef2f2" : "#eff8ff", color: boardLock ? "#b42318" : "#175cd3" }}>
              {boardLock ? <><i className="bi bi-exclamation-octagon me-1" />Board sign-off is required. You will be notified once each approver responds.</> :
                <><i className="bi bi-shield-check me-1" />Your 2FA is complete; publishing will update the scorecard for every admin.</>}
            </div>
          </>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}><i className="bi bi-arrow-left me-1" />Back</button>}
        {step < 3 && <button className="btn btn-primary btn-sm" disabled={!canNext} onClick={() => setStep(step + 1)}>Next<i className="bi bi-arrow-right ms-1" /></button>}
        {step === 3 && <button className={`btn ${boardLock ? "btn-danger" : "btn-primary"} btn-sm`} disabled={code !== "482913"} onClick={() => {
          onSave(target, reason);
          push({ kind: "success", title: `${boardLock ? "Change submitted for board approval" : "Target updated"}`, body: `${kpi.name} → ${fmtKpi({ ...kpi, value: target })}` });
          close();
        }}><i className={`bi ${boardLock ? "bi-send" : "bi-check-circle"} me-1`} />{boardLock ? "Submit for approval" : "Publish target"}</button>}
      </div>
    </Modal>
  );
}

/* ============================ 3. OKR drawer ============================ */
export function OkrDrawer({ okr, onClose, onAdvance }: { okr: OKR | null; onClose: () => void; onAdvance: (id: string) => void }) {
  const { push } = useToast();
  if (!okr) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-flag"
      tone={okr.status === "Off track" ? "red" : okr.status === "At risk" ? "amber" : "green"}
      title={okr.title} subtitle={`${okr.id} · owned by ${okr.owner} · due ${okr.due}`}
      headExtra={<Badge tone={okr.priority === "High" ? "red" : okr.priority === "Medium" ? "amber" : "grey"}>{okr.priority}</Badge>}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm flex-grow-1"
          onClick={() => { push({ kind: "info", title: "Stakeholders notified", body: `${okr.owner}, COO, and exec list pinged.` }); }}>
          <i className="bi bi-at me-1" />Nudge owner
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => onAdvance(okr.id)}><i className="bi bi-play-fill me-1" />Advance 10%</button>
      </>}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-eyebrow">Objective</div>
        <div style={{ fontSize: ".88rem", fontWeight: 600 }}>{okr.objective}</div>
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div><Badge tone={okr.status === "Off track" ? "red" : okr.status === "At risk" ? "amber" : okr.status === "Done" ? "green" : "blue"}>{okr.status}</Badge></div>
          <div style={{ fontWeight: 800, fontFamily: "Sora", fontSize: "1.3rem" }}>{okr.progress}%</div>
        </div>
        <Meter value={okr.progress} tone={okr.progress >= 70 ? "#12b76a" : okr.progress >= 40 ? "#f79009" : "#f04438"} width={500} />
      </div>
      <div className="pm-card mb-3">
        <div className="pm-card-head"><h6 className="pm-card-title">Key results</h6></div>
        <div className="p-2">
          {okr.kr.map((k, i) => {
            const pct = Math.round((k.current / k.target) * 100);
            return (
              <div key={i} className="p-2" style={{ borderBottom: "1px dashed #eaedf3" }}>
                <div style={{ fontWeight: 600, fontSize: ".84rem" }}>{k.text}</div>
                <div className="d-flex align-items-center gap-2 my-2">
                  <Meter value={Math.min(pct, 120)} tone={pct >= 90 ? "#12b76a" : pct >= 60 ? "#f79009" : "#f04438"} width={280} />
                  <span className="pm-num" style={{ fontWeight: 700, fontSize: ".78rem" }}>{pct}%</span>
                </div>
                <div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{k.current.toLocaleString("en-KE")} / {k.target.toLocaleString("en-KE")} {k.unit}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="pm-card">
        <div className="pm-card-head"><h6 className="pm-card-title">Recent check-ins</h6></div>
        <div className="p-3"><div className="pm-timeline">
          {[
            ["Weekly review", `${okr.owner} commented: "On track to hit the target; Visa certification slightly ahead of schedule."`, "done"],
            ["Raised risk", "CTO flagged delay in sandbox UAT for partner #3.", "warn"],
            ["Progress update", `${okr.owner} moved progress from ${Math.max(0, okr.progress - 12)}% → ${okr.progress}%`, "done"],
            ["KR created", "Objective approved by exec committee.", ""],
          ].map(([t, d, c], i) => (
            <div key={i} className={`pm-tl-item ${c}`}>
              <div style={{ fontWeight: 700, fontSize: ".82rem" }}>{t}</div>
              <div style={{ fontSize: ".74rem", color: "var(--pm-muted)" }}>{d}</div>
            </div>
          ))}
        </div></div>
      </div>
    </Drawer>
  );
}

/* ============================ 4. New OKR wizard ============================ */
export function NewOkrlWizard({ open, onClose, onCreate }: {
  open: boolean; onClose: () => void; onCreate: (o: OKR) => void;
}) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState("");
  const [owner, setOwner] = useState("Head of Growth");
  const [dept, setDept] = useState("Growth");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("High");
  const [due, setDue] = useState("2026-09-30");
  const [krs, setKrs] = useState<{ text: string; target: number; unit: string }[]>([{ text: "", target: 0, unit: "%" }]);
  const steps = [{ label: "Objective", icon: "bi-flag" }, { label: "Key results", icon: "bi-list-check" }, { label: "Owner & due", icon: "bi-person-check" }, { label: "Review", icon: "bi-eye" }];
  const close = () => { setStep(0); setTitle(""); setObjective(""); setKrs([{ text: "", target: 0, unit: "%" }]); onClose(); };
  const canNext = step === 0 ? title.length > 6 && objective.length > 15
    : step === 1 ? krs.every((k) => k.text.length > 5 && k.target > 0)
    : step === 2 ? !!owner && !!due : true;
  return (
    <Modal open={open} onClose={close} tone="green" icon="bi-plus-circle" size="lg"
      title="Create a new OKR" subtitle="Tracked against this quarter's KPI scorecard.">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <>
            <label className="form-label">Title (short headline)</label>
            <input className="form-control mb-3" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Ship instant credit disbursement" />
            <label className="form-label">Objective</label>
            <textarea className="form-control mb-3" rows={3} value={objective} onChange={(e) => setObjective(e.target.value)}
              placeholder="Describe the qualitative outcome you want this quarter." />
            <div className="d-flex gap-1 flex-wrap">
              {["Reach 100K MAU", "Four-nines uptime", "Launch Visa commercial cards", "Cut fraud to <4bps"].map((x) => (
                <button key={x} className="pm-chip" onClick={() => setTitle(x)}>{x}</button>
              ))}
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <div className="d-flex flex-column gap-2 mb-2">
              {krs.map((kr, i) => (
                <div key={i} className="pm-card pm-card-pad d-flex gap-2 align-items-center">
                  <div className="flex-grow-1">
                    <input className="form-control form-control-sm mb-1" placeholder={`Key result ${i + 1} (e.g. Activate 2,500 cards)`}
                      value={kr.text} onChange={(e) => setKrs(krs.map((x, j) => j === i ? { ...x, text: e.target.value } : x))} />
                    <div className="d-flex gap-1">
                      <input type="number" className="form-control form-control-sm mono" placeholder="Target" value={kr.target || ""}
                        onChange={(e) => setKrs(krs.map((x, j) => j === i ? { ...x, target: Number(e.target.value) } : x))} />
                      <select className="form-select form-select-sm" value={kr.unit} onChange={(e) => setKrs(krs.map((x, j) => j === i ? { ...x, unit: e.target.value } : x))}>
                        {["%", "users", "KES", "cards", "bps", "min", "tickets"].map((u) => <option key={u}>{u}</option>)}
                      </select>
                    </div>
                  </div>
                  {krs.length > 1 && <button className="btn btn-sm btn-outline-secondary" onClick={() => setKrs(krs.filter((_, j) => j !== i))}><i className="bi bi-trash" /></button>}
                </div>
              ))}
            </div>
            <button className="btn btn-outline-primary btn-sm" onClick={() => setKrs([...krs, { text: "", target: 0, unit: "%" }])}>
              <i className="bi bi-plus-lg me-1" />Add key result
            </button>
          </>
        )}
        {step === 2 && (
          <div className="row g-2">
            <div className="col-md-6"><label className="form-label">Owner</label>
              <select className="form-select mb-3" value={owner} onChange={(e) => setOwner(e.target.value)}>
                {["Head of Growth", "CTO", "VP Product", "CFO", "CRO", "VP Cards", "COO", "CPO"].map((o) => <option key={o}>{o}</option>)}
              </select></div>
            <div className="col-md-6"><label className="form-label">Department</label>
              <select className="form-select mb-3" value={dept} onChange={(e) => setDept(e.target.value)}>
                {["Growth", "Product & Engineering", "Risk & Compliance", "Finance & Treasury", "Operations & Support", "People"].map((d) => <option key={d}>{d}</option>)}
              </select></div>
            <div className="col-md-6"><label className="form-label">Priority</label>
              <div className="d-flex gap-1 mb-3">
                {(["High", "Medium", "Low"] as const).map((p) => <button key={p} className={`pm-chip ${priority === p ? "active" : ""}`} onClick={() => setPriority(p)}>{p}</button>)}
              </div></div>
            <div className="col-md-6"><label className="form-label">Due date</label>
              <input type="date" className="form-control" value={due} onChange={(e) => setDue(e.target.value)} /></div>
          </div>
        )}
        {step === 3 && (
          <div className="pm-card pm-card-pad">
            <div className="pm-kv"><span className="k">Title</span><span className="v">{title}</span></div>
            <div className="pm-kv"><span className="k">Objective</span><span className="v">{objective}</span></div>
            <div className="pm-kv"><span className="k">Owner</span><span className="v">{owner}</span></div>
            <div className="pm-kv"><span className="k">Department</span><span className="v">{dept}</span></div>
            <div className="pm-kv"><span className="k">Priority</span><span className="v"><Badge tone={priority === "High" ? "red" : priority === "Medium" ? "amber" : "grey"}>{priority}</Badge></span></div>
            <div className="pm-kv"><span className="k">Due</span><span className="v">{new Date(due).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span></div>
            {krs.map((k, i) => (
              <div className="pm-kv" key={i}><span className="k">KR{i + 1}</span><span className="v">{k.text} — <b>{k.target.toLocaleString()} {k.unit}</b></span></div>
            ))}
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}><i className="bi bi-arrow-left me-1" />Back</button>}
        {step < 3 && <button className="btn btn-primary btn-sm" disabled={!canNext} onClick={() => setStep(step + 1)}>Next<i className="bi bi-arrow-right ms-1" /></button>}
        {step === 3 && <button className="btn btn-primary btn-sm" onClick={() => {
          const o: OKR = {
            id: `OKR-${Math.floor(20 + Math.random() * 80)}`, title, owner, dept, objective, kr: krs.map((k) => ({ ...k, current: 0 })),
            status: "On track", priority, due: new Date(due).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }), progress: 0,
          };
          onCreate(o); push({ kind: "success", title: "OKR created", body: `${o.id} added to the scorecard.` }); close();
        }}><i className="bi bi-plus-lg me-1" />Create OKR</button>}
      </div>
    </Modal>
  );
}

/* ============================ 5. Department drawer ============================ */
export function DepartmentDrawer({ dept, onClose }: { dept: Department | null; onClose: () => void }) {
  const { push } = useToast();
  if (!dept) return null;
  const spendPct = Math.round((dept.spend / dept.budget) * 100);
  return (
    <Drawer open onClose={onClose} icon="bi-buildings" tone="violet" title={dept.name}
      subtitle={`Led by ${dept.lead} · ${dept.headcount} people`}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => push({ kind: "info", title: `${dept.name} budget report`, body: "Excel sent to finance. 12 line items attached." })}>
          <i className="bi bi-file-earmark-spreadsheet me-1" />Budget report
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => push({ kind: "success", title: "1:1 requested", body: `Meeting with ${dept.lead} booked for tomorrow.` })}>
          <i className="bi bi-calendar-event me-1" />Schedule 1:1
        </button>
      </>}>
      <div className="row g-2 mb-3">
        {[{ l: "OKRs", v: String(dept.okrs) }, { l: "On track", v: `${dept.onTrack}/${dept.okrs}` }, { l: "Headcount", v: String(dept.headcount) },
          { l: "Budget", v: kes(dept.budget, { compact: true }) }].map((x) => (
          <div className="col-6" key={x.l}><div className="pm-stat"><div className="pm-stat-label">{x.l}</div>
            <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1rem" }}>{x.v}</div></div></div>
        ))}
      </div>
      <div className="pm-card pm-card-pad mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div><div className="pm-eyebrow">Budget burn</div>
            <div style={{ fontWeight: 800 }}>{kes(dept.spend, { compact: true })} of {kes(dept.budget, { compact: true })}</div></div>
          <Badge tone={spendPct > 80 ? "amber" : "green"}>{spendPct}%</Badge>
        </div>
        <Meter value={spendPct} tone={spendPct > 80 ? "#f79009" : "#12b76a"} width={420} />
      </div>
      <div className="pm-card mb-3">
        <div className="pm-card-head"><h6 className="pm-card-title">OKR health</h6><Badge tone={dept.health} dot>{dept.health}</Badge></div>
        <div className="p-3">
          <div className="pm-timeline">
            <div className="pm-tl-item done"><div style={{ fontWeight: 700, fontSize: ".82rem" }}>{dept.onTrack} of {dept.okrs} on track</div>
              <div style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>Review last Monday — no blockers raised.</div></div>
            <div className="pm-tl-item warn"><div style={{ fontWeight: 700, fontSize: ".82rem" }}>{dept.okrs - dept.onTrack} at risk</div>
              <div style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>Slip on external dependency; mitigation owner named.</div></div>
            <div className="pm-tl-item"><div style={{ fontWeight: 700, fontSize: ".82rem" }}>0 off track</div>
              <div style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>No OKRs are red this quarter.</div></div>
          </div>
        </div>
      </div>
      <div className="pm-card">
        <div className="pm-card-head"><h6 className="pm-card-title">Team roster</h6></div>
        <div className="p-2 d-flex flex-wrap gap-2">
          {Array.from({ length: Math.min(dept.headcount, 18) }, (_, i) => (
            <div key={i} title={`Member ${i + 1}`}><Avatar name={`${dept.name.split(" ")[0]} Member ${i + 1}`} size="sm" /></div>
          ))}
          {dept.headcount > 18 && <div className="d-flex align-items-center" style={{ fontSize: ".76rem", color: "var(--pm-muted)", paddingLeft: 4 }}>+{dept.headcount - 18} more</div>}
        </div>
      </div>
    </Drawer>
  );
}

/* ============================ 6. Cohort detail modal ============================ */
export function CohortModal({ cohort, onClose }: { cohort: string | null; onClose: () => void }) {
  const { push } = useToast();
  const r = COHORT.find((c) => c.cohort === cohort);
  if (!cohort || !r) return null;
  const ret: [string, number, number][] = [
    ["Day 1 activation", r.d1, 70], ["Day 7", r.d7, 55], ["Day 14", r.d14, 50],
    ["Day 30", r.d30, 46], ["Day 60", r.d60, 42], ["Day 90", r.d90, 36],
  ];
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-people" size="md" title={`Cohort ${cohort}`} subtitle={`${num(r.signups)} signups · rolling retention`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          {ret.map(([l, v, _tgt]) => (
            <div key={l} className="d-flex align-items-center gap-2 py-1">
              <span style={{ width: 90, fontSize: ".78rem", fontWeight: 600 }}>{l}</span>
              <Meter value={v || 0} tone={v >= 55 ? "#12b76a" : v >= 40 ? "#f79009" : "#f04438"} width={240} />
              <span className="pm-num" style={{ fontWeight: 700, width: 48, textAlign: "right" }}>{v ? v.toFixed(1) + "%" : "—"}</span>
            </div>
          ))}
        </div>
        <div className="pm-note">
          <i className="bi bi-info-circle me-1" />Day-30 retention improved from 44.0% in March to 48.0% in July, driven by the onboarding flow refresh (OKR-07).
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => { csvDownload(`cohort-${cohort}.csv`, [r as unknown as Record<string, unknown>]); push({ kind: "success", title: "Cohort exported" }); }}>
          <i className="bi bi-download me-1" />Export
        </button>
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ============================ 7. Target history drawer ============================ */
export function TargetHistoryDrawer({ open, onClose, history }: { open: boolean; onClose: () => void; history: TargetChange[] }) {
  return (
    <Drawer open={open} onClose={onClose} icon="bi-clock-history" tone="blue" title="Target change history"
      subtitle="Immutable audit trail of every target edit.">
      <div className="d-flex flex-column gap-2">
        {history.map((h) => (
          <div key={h.id} className="pm-alert-row info">
            <i className="bi bi-pencil-square" style={{ color: "#2e90fa" }} />
            <div className="flex-grow-1">
              <div style={{ fontWeight: 700, fontSize: ".82rem" }}>{h.field}</div>
              <div style={{ fontSize: ".74rem", color: "var(--pm-muted)" }}>{h.reason}</div>
              <div className="d-flex gap-2 mt-1 flex-wrap">
                <Badge tone="grey">{h.who}</Badge>
                <span style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{h.when} · {h.id}</span>
              </div>
            </div>
            <div className="text-end">
              <div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{h.from} <i className="bi bi-arrow-right" /> {h.to}</div>
            </div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 8. Board pack modal ============================ */
export function BoardPackModal({ pack, onClose }: { pack: BoardPack | null; onClose: () => void }) {
  const { push } = useToast();
  if (!pack) return null;
  return (
    <Modal open onClose={onClose} tone="violet" icon="bi-folder2-open" size="md"
      title={pack.period} subtitle={`${pack.pages} pages · owned by ${pack.owner} · due ${pack.due}`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div><div className="pm-eyebrow">Status</div>
              <Badge tone={pack.status === "Presented" ? "green" : pack.status === "Published" ? "blue" : pack.status === "In review" ? "amber" : "grey"}>{pack.status}</Badge></div>
            <div><div className="pm-eyebrow">Pages</div><div style={{ fontWeight: 800 }}>{pack.pages}</div></div>
          </div>
          <Meter value={
            pack.status === "Presented" ? 100 : pack.status === "Published" ? 85 : pack.status === "In review" ? 60 : 25
          } tone="#7a5af8" width={500} />
        </div>
        <div className="pm-card">
          <div className="pm-card-head"><h6 className="pm-card-title">Included sections</h6></div>
          <div className="p-3 d-flex flex-column gap-2">
            {["Executive summary", "Portfolio value & hero KPIs", "Quarterly revenue & P&L", "Risk & fraud dashboard", "OKR progress", "Customer growth & cohorts", "Product roadmap", "Liquidity & treasury", "Compliance & regulatory", "Q&A"].map((s, i) => (
              <div key={s} className="d-flex align-items-center gap-2">
                <i className={`bi ${i < (pack.status === "Presented" ? 10 : pack.status === "Published" ? 8 : pack.status === "In review" ? 6 : 2) ? "bi-check-circle-fill" : "bi-circle"}`}
                  style={{ color: i < (pack.status === "Presented" ? 10 : pack.status === "Published" ? 8 : pack.status === "In review" ? 6 : 2) ? "var(--pm-green)" : "#c3cbd9" }} />
                <span style={{ fontSize: ".82rem" }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => { push({ kind: "info", title: "Shared link copied", body: "Read-only link valid for 30 days." }); }}>
          <i className="bi bi-link-45deg me-1" />Share read-only
        </button>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => push({ kind: "success", title: "Board pack downloaded", body: "PDF watermarked with your identity." })}>
          <i className="bi bi-download me-1" />Download
        </button>
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ============================ 9. Share / subscribe modal ============================ */
export function SubscribeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [freq, setFreq] = useState("Monday 08:00");
  const [channels, setChannels] = useState({ email: true, slack: true, push: false });
  const [subs, setSubs] = useState(["Scorecard summary", "RAG deltas (red only)", "OKR progress", "Weekly board pack"]);
  return (
    <Modal open={open} onClose={onClose} tone="green" icon="bi-bell-fill" size="md" title="Subscribe to the scorecard" subtitle="Choose frequency and what gets delivered.">
      <div className="pm-modal-body">
        <label className="form-label">Delivery frequency</label>
        <div className="d-flex gap-1 flex-wrap mb-3">
          {["Daily 08:00", "Monday 08:00", "End of week", "1st of month", "After board meeting"].map((f) => (
            <button key={f} className={`pm-chip ${freq === f ? "active" : ""}`} onClick={() => setFreq(f)}>{f}</button>
          ))}
        </div>
        <label className="form-label">Channels</label>
        <div className="d-flex flex-column gap-2 mb-3">
          {[{ k: "email", l: "Email (joseph.mwangi@paymo.co.ke)" }, { k: "slack", l: "Slack #exec-scorecard" }, { k: "push", l: "Push on mobile" }].map((c) => (
            <label key={c.k} className={`pm-opt ${(channels as any)[c.k] ? "active" : ""}`}>
              <input type="checkbox" className="form-check-input mt-0" checked={(channels as any)[c.k]}
                onChange={(e) => setChannels({ ...channels, [c.k]: e.target.checked })} />
              <span style={{ fontWeight: 700, fontSize: ".84rem" }}>{c.l}</span>
            </label>
          ))}
        </div>
        <label className="form-label">Included sections</label>
        <div className="d-flex flex-column gap-2">
          {["Scorecard summary", "RAG deltas (red only)", "OKR progress", "Weekly board pack", "Department breakdown", "Cohort retention", "Risk metrics"].map((s) => (
            <label key={s} className={`pm-opt ${subs.includes(s) ? "active" : ""}`}>
              <input type="checkbox" className="form-check-input mt-0" checked={subs.includes(s)}
                onChange={(e) => setSubs(e.target.checked ? [...subs, s] : subs.filter((x) => x !== s))} />
              <span style={{ fontSize: ".84rem", fontWeight: 700 }}>{s}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Subscription updated", body: `You'll receive ${freq} via ${Object.entries(channels).filter(([, v]) => v).map(([k]) => k).join(", ")}.` }); onClose(); }}>
          <i className="bi bi-check2 me-1" />Save subscription
        </button>
      </div>
    </Modal>
  );
}

/* ============================ 10. Export / snapshot modal ============================ */
export function SnapshotModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [fmt, setFmt] = useState("pdf");
  const [period, setPeriod] = useState("Q3-2026 (YTD)");
  const [include, setInclude] = useState({ kpis: true, okrs: true, depts: true, cohorts: true, narrative: true, raw: false });
  return (
    <Modal open={open} onClose={onClose} tone="blue" icon="bi-download" size="md" title="Export scorecard snapshot" subtitle="Watermarked with your identity and timestamp.">
      <div className="pm-modal-body">
        <label className="form-label">Format</label>
        <div className="d-flex gap-2 mb-3">
          {[["pdf", "bi-file-earmark-pdf", "PDF · board pack"], ["pptx", "bi-file-earmark-slides", "PowerPoint"], ["xlsx", "bi-file-earmark-spreadsheet", "Excel data pack"], ["png", "bi-file-earmark-image", "Image (hero only)"]].map(([v, i, l]) => (
            <button key={v} className={`pm-opt ${fmt === v ? "active" : ""}`} style={{ flexDirection: "column", gap: ".3rem", padding: ".7rem .4rem" }} onClick={() => setFmt(v)}>
              <i className={`bi ${i}`} style={{ fontSize: "1.3rem", color: fmt === v ? "var(--pm-green)" : "var(--pm-muted)" }} />
              <span style={{ fontSize: ".72rem", fontWeight: 700 }}>{l}</span>
            </button>
          ))}
        </div>
        <label className="form-label">Period</label>
        <select className="form-select mb-3" value={period} onChange={(e) => setPeriod(e.target.value)}>
          {["Q3-2026 (YTD)", "August 2026 MTD", "Last quarter (Q2-2026)", "Full FY2026 plan", "TTM — last 12 months"].map((p) => <option key={p}>{p}</option>)}
        </select>
        <label className="form-label">Include</label>
        <div className="d-flex flex-column gap-2">
          {Object.entries({ kpis: "All KPI cards with trend sparklines", okrs: "OKR list with KR progress", depts: "Department breakdown", cohorts: "Cohort retention matrix", narrative: "Auto-written exec narrative", raw: "Raw data CSV" }).map(([k, l]) => (
            <label key={k} className={`pm-opt ${(include as any)[k] ? "active" : ""}`}>
              <input type="checkbox" className="form-check-input mt-0" checked={(include as any)[k]} onChange={(e) => setInclude({ ...include, [k]: e.target.checked })} />
              <span style={{ fontSize: ".84rem", fontWeight: 700 }}>{l}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => {
          push({ kind: "success", title: "Snapshot generated", body: `${period} · ${fmt.toUpperCase()} · ${Object.values(include).filter(Boolean).length} sections.` });
          onClose();
        }}><i className="bi bi-download me-1" />Generate export</button>
      </div>
    </Modal>
  );
}

/* ============================ 11. RAG commentary drawer ============================ */
export function CommentaryDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [note, setNote] = useState("");
  const { push } = useToast();
  return (
    <Drawer open={open} onClose={onClose} icon="bi-pencil-square" tone="amber" title="Exec commentary"
      subtitle="Appears on the front page of the board pack.">
      <label className="form-label">Commentary for this quarter</label>
      <textarea className="form-control mb-2" rows={6} value={note} onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. We enter Q3 with 81% overall scorecard delivery. Headline beat is TPV at 103% of target driven by early Visa BIN traction; main watch-out is CAC at 108% of ceiling, see Growth plan." />
      <div className="d-flex gap-1 flex-wrap mb-3">
        {["TPV strong beat", "CAC watch item", "Fraud loss best-ever", "Day-30 retention improving", "Visa certification on track", "Support SLA missed"].map((s) => (
          <button key={s} className="pm-chip" onClick={() => setNote((n) => (n ? n + " " : "") + s + ".")}>{s}</button>
        ))}
      </div>
      <div className="pm-card">
        <div className="pm-card-head"><h6 className="pm-card-title">Previous commentary</h6></div>
        <div className="p-3">
          <div className="pm-timeline">
            <div className="pm-tl-item done"><div style={{ fontWeight: 700, fontSize: ".82rem" }}>Q2-2026 — Sarah Kamau</div>
              <div style={{ fontSize: ".74rem", color: "var(--pm-muted)" }}>Closed Q2 at 76% scorecard. Net revenue 108% of target. Main miss was card activation.</div></div>
            <div className="pm-tl-item done"><div style={{ fontWeight: 700, fontSize: ".82rem" }}>Q1-2026 — Joseph Mwangi</div>
              <div style={{ fontSize: ".74rem", color: "var(--pm-muted)" }}>Fraud loss rate stepped down to 5.1 bps after v4.2.1 model rollout.</div></div>
          </div>
        </div>
      </div>
      <div className="d-flex gap-2 mt-3">
        <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Commentary saved", body: "Attached to Q3 board pack." }); onClose(); }}><i className="bi bi-save me-1" />Save & attach</button>
      </div>
    </Drawer>
  );
}

/* ============================ 12. Compare periods modal ============================ */
export function CompareModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const rows = [
    { label: "MAU", cur: 89214, prev: 84720, unit: "num" },
    { label: "Net revenue", cur: 124_000_000, prev: 108_500_000, unit: "KES" },
    { label: "TPV", cur: 18_600_000_000, prev: 15_230_000_000, unit: "KES" },
    { label: "Take rate", cur: 0.67, prev: 0.71, unit: "pct" },
    { label: "CAC", cur: 412, prev: 426, unit: "KES" },
    { label: "Fraud loss", cur: 4.2, prev: 5.1, unit: "bps" },
    { label: "SLA %", cur: 96.4, prev: 95.1, unit: "pct" },
    { label: "Uptime", cur: 99.97, prev: 99.94, unit: "pct" },
    { label: "Day-30 retention", cur: 54.0, prev: 51.4, unit: "pct" },
    { label: "NPS", cur: 48, prev: 44, unit: "num" },
  ];
  return (
    <Modal open={open} onClose={onClose} tone="ink" icon="bi-arrow-left-right" size="lg" title="Period comparison" subtitle="Q3-2026 vs Q2-2026 · current versus prior quarter">
      <div className="pm-modal-body">
        <div className="pm-card pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>KPI</th><th className="text-end">Q3 (current)</th><th className="text-end">Q2</th><th className="text-end">Δ</th><th>Trend</th></tr></thead>
            <tbody>{rows.map((r) => {
              const delta = r.unit === "KES" || r.unit === "num" || r.unit === "bps" ? (r.cur / r.prev - 1) * 100 : (r.cur - r.prev);
              const better = (r.label === "Take rate" || r.label === "CAC" || r.label === "Fraud loss") ? delta < 0 : delta > 0;
              const fmtV = (v: number) =>
                r.unit === "KES" ? kes(v, { compact: true })
                : r.unit === "num" ? num(Math.round(v))
                : r.unit === "bps" ? `${v.toFixed(1)} bps`
                : `${v.toFixed(r.unit === "pct" ? 2 : 0)}${r.unit === "pct" ? "%" : ""}`;
              const spark = [r.prev, r.prev * 0.98, r.prev * 1.01, r.prev * 0.99, r.cur].map((x) => Math.round(x));
              return (<tr key={r.label}>
                <td className="pm-td-strong">{r.label}</td>
                <td className="text-end pm-num" style={{ fontWeight: 700 }}>{fmtV(r.cur)}</td>
                <td className="text-end pm-num">{fmtV(r.prev)}</td>
                <td className="text-end pm-num" style={{ color: better ? "#0b8f52" : "#d92d20", fontWeight: 700 }}>
                  {delta > 0 ? "+" : ""}{delta.toFixed(1)}{r.unit === "bps" ? " bps" : "%"}
                </td>
                <td><Sparkline data={spark} color={better ? "#12b76a" : "#f04438"} w={90} h={22} fill={false} /></td>
              </tr>);
            })}</tbody>
          </table>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => { csvDownload("kpi-comparison.csv", rows); push({ kind: "success", title: "Comparison exported" }); }}>
          <i className="bi bi-download me-1" />Export
        </button>
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ============================ 13. RAG filter summary modal ============================ */
export function RagDetailModal({ rag, onClose }: { rag: "green" | "amber" | "red" | null; onClose: () => void }) {
  const { KPI_LIST } = require("../data/kpiData");
  const list = KPI_LIST.filter((k: KPI) => k.rag === rag);
  if (!rag) return null;
  return (
    <Modal open onClose={onClose} tone={rag} icon="bi-flag-fill" size="md" title={`${rag.toUpperCase()} KPIs`}
      subtitle={`${list.length} KPIs in this RAG bucket for Q3-2026`}>
      <div className="pm-modal-body">
        <div className="d-flex flex-column gap-2">
          {list.map((k: KPI) => (
            <div key={k.id} className="pm-alert-row" style={{ borderLeftColor: rag === "green" ? "#12b76a" : rag === "amber" ? "#f79009" : "#f04438" }}>
              <span className={`pm-dot ${rag}`} style={{ marginTop: 6 }} />
              <div className="flex-grow-1">
                <div style={{ fontWeight: 700, fontSize: ".84rem" }}>{k.name}</div>
                <div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{k.owner} · {k.category}</div>
              </div>
              <div className="text-end">
                <div style={{ fontWeight: 800, fontSize: ".82rem" }}>{fmtKpi(k)}</div>
                <div style={{ fontSize: ".68rem", color: "var(--pm-muted)" }}>target {fmtKpi({ ...k, value: k.target })}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ============================ 14. New KPI modal (simple) ============================ */
export function NewKpiModal({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (k: KPI) => void }) {
  const { push } = useToast();
  const [name, setName] = useState("");
  const [cat, setCat] = useState<KPI["category"]>("Growth");
  const [owner, setOwner] = useState("Head of Growth");
  const [unit, setUnit] = useState<KPI["unit"]>("num");
  const [target, setTarget] = useState(0);
  const [dir, setDir] = useState<KPI["direction"]>("up");
  return (
    <Modal open={open} onClose={onClose} tone="green" icon="bi-plus-circle" size="md" title="Add custom KPI" subtitle="Appears in the scorecard and starts tracking next refresh.">
      <div className="pm-modal-body">
        <div className="row g-2">
          <div className="col-12"><label className="form-label">Name</label>
            <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. SME monthly transacting merchants" /></div>
          <div className="col-6"><label className="form-label">Category</label>
            <select className="form-select" value={cat} onChange={(e) => setCat(e.target.value as KPI["category"])}>
              {["Growth", "Revenue", "Unit economics", "Risk", "Operations", "Product", "People"].map((c) => <option key={c}>{c}</option>)}
            </select></div>
          <div className="col-6"><label className="form-label">Owner</label>
            <select className="form-select" value={owner} onChange={(e) => setOwner(e.target.value)}>
              {["Head of Growth", "CTO", "VP Product", "CFO", "CRO", "COO", "CPO", "VP Cards"].map((o) => <option key={o}>{o}</option>)}
            </select></div>
          <div className="col-6"><label className="form-label">Unit</label>
            <select className="form-select" value={unit} onChange={(e) => setUnit(e.target.value as KPI["unit"])}>
              {["num", "KES", "pct", "bps", "ratio", "days", "minutes"].map((u) => <option key={u}>{u}</option>)}
            </select></div>
          <div className="col-6"><label className="form-label">Good direction</label>
            <div className="d-flex gap-1">
              <button className={`pm-chip ${dir === "up" ? "active" : ""}`} onClick={() => setDir("up")}>Higher ↑</button>
              <button className={`pm-chip ${dir === "down" ? "active" : ""}`} onClick={() => setDir("down")}>Lower ↓</button>
            </div></div>
          <div className="col-12"><label className="form-label">Target value</label>
            <input type="number" className="form-control mono" value={target} onChange={(e) => setTarget(Number(e.target.value))} /></div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={name.length < 5 || target === 0} onClick={() => {
          const k: KPI = {
            id: `kpi-usr-${Date.now()}`, category: cat, name, owner, definition: "User-defined KPI added from the scorecard UI.",
            value: Math.round(target * 0.85), target, prev: Math.round(target * 0.8), unit, frequency: "Weekly",
            rag: "amber", direction: dir, tier: 0,
            trend: Array.from({ length: 12 }, (_, i) => Math.round(target * (0.65 + i * 0.015))),
          };
          onCreate(k); push({ kind: "success", title: "Custom KPI added", body: `${k.name} will appear after the next refresh.` }); onClose();
        }}><i className="bi bi-plus-lg me-1" />Add KPI</button>
      </div>
    </Modal>
  );
}

/* ============================ 15. Sign-off wizard (board pack) ============================ */
export function SignOffWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [code, setCode] = useState("");
  const [ack, setAck] = useState({ numbers: false, narrative: false, risk: false });
  const steps = [{ label: "Review", icon: "bi-journal-text" }, { label: "Attestations", icon: "bi-shield-check" }, { label: "Sign", icon: "bi-pen" }];
  const close = () => { setStep(0); setCode(""); setAck({ numbers: false, narrative: false, risk: false }); onClose(); };
  return (
    <Modal open={open} onClose={close} tone="green" icon="bi-pen-fill" size="md" title="Sign off the Q3 board pack" subtitle="Your signature goes on the front page.">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div className="pm-card pm-card-pad">
            <div className="pm-kv"><span className="k">Period</span><span className="v">Q3-2026 (YTD)</span></div>
            <div className="pm-kv"><span className="k">Pages</span><span className="v">54</span></div>
            <div className="pm-kv"><span className="k">KPIs tracked</span><span className="v">21 · 12 green · 7 amber · 2 red</span></div>
            <div className="pm-kv"><span className="k">Net revenue</span><span className="v">KES 124M · +14.2%</span></div>
            <div className="pm-kv"><span className="k">Material risks disclosed</span><span className="v">3</span></div>
          </div>
        )}
        {step === 1 && (
          <div className="d-flex flex-column gap-2">
            {[["numbers", "I attest that the numbers above reconcile to the ledger."],
              ["narrative", "I reviewed the executive commentary and it is accurate."],
              ["risk", "Risk disclosures are complete to the best of my knowledge."]].map(([k, l]) => (
              <label key={k} className={`pm-opt ${(ack as any)[k] ? "active" : ""}`}>
                <input type="checkbox" className="form-check-input mt-0" checked={(ack as any)[k]}
                  onChange={(e) => setAck({ ...ack, [k]: e.target.checked })} />
                <span style={{ fontSize: ".84rem", fontWeight: 700 }}>{l}</span>
              </label>
            ))}
          </div>
        )}
        {step === 2 && (
          <>
            <div className="pm-note mb-3" style={{ borderColor: "#cfe6ff", background: "#eff8ff", color: "#175cd3" }}>
              <i className="bi bi-info-circle me-1" />Your 2FA-signed attestation is written to the audit log and cannot be deleted.
            </div>
            <TwoFactorField value={code} onChange={setCode} label="Signing 2FA (TOTP)" />
          </>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}><i className="bi bi-arrow-left me-1" />Back</button>}
        {step < 2 && <button className="btn btn-primary btn-sm" disabled={step === 1 && !Object.values(ack).every(Boolean)} onClick={() => setStep(step + 1)}>Next<i className="bi bi-arrow-right ms-1" /></button>}
        {step === 2 && <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => { push({ kind: "success", title: "Board pack signed", body: "Joseph Mwangi · 24 Aug 2026 · signature recorded in AUD-88240." }); close(); }}>
          <i className="bi bi-pen-fill me-1" />Sign & publish
        </button>}
      </div>
    </Modal>
  );
}

// Used to avoid the Avatar unused import in this file when stripping
void Avatar; void DDItem;
