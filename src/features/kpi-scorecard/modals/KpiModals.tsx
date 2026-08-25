import { useState } from "react";
import {
  Modal, Drawer, Steps, Badge, Avatar, TwoFactorField, useToast, Meter, Sparkline, DDItem,
} from "../../../components/ui";
import { csvDownload, kes, num } from "../../../lib/format";
import type { KPI, OKR, Department, BoardPack, TargetChange } from "../data/kpiData";
import { fmt as fmtKpi, COHORT, KPI_LIST } from "../data/kpiData";

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

/* ============================ 16. Nudge owner modal ============================ */
export function NudgeOwnerModal({ owner, kpiName, onClose }: { owner: string; kpiName?: string; onClose: () => void }) {
  const { push } = useToast();
  const [channel, setChannel] = useState<"slack" | "email" | "sms">("slack");
  const [msg, setMsg] = useState("");
  const templates = [
    `Hi ${owner.split(" ")[0]}, friendly nudge on ${kpiName || "your KPI"} — we're tracking slightly behind target. Can we sync this week?`,
    `${owner.split(" ")[0]}, just flagging that ${kpiName || "the KPI"} is amber this week. Would appreciate an update by Friday.`,
    `Quick reminder: ${kpiName || "KPI"} review is due. Please update progress when you get a chance.`,
  ];
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-envelope-paper" size="md"
      title={`Nudge ${owner}`} subtitle={kpiName ? `About: ${kpiName}` : "Send a nudge via the chosen channel"}>
      <div className="pm-modal-body">
        <label className="form-label">Channel</label>
        <div className="d-flex gap-2 mb-3">
          {[{ v: "slack" as const, i: "bi-slack", l: "Slack" }, { v: "email" as const, i: "bi-envelope", l: "Email" }, { v: "sms" as const, i: "bi-phone", l: "SMS" }].map((c) => (
            <button key={c.v} className={`pm-opt ${channel === c.v ? "active" : ""}`} style={{ flex: 1, flexDirection: "column", gap: ".3rem" }} onClick={() => setChannel(c.v)}>
              <i className={`bi ${c.i}`} style={{ fontSize: "1.1rem" }} /><span style={{ fontSize: ".78rem", fontWeight: 700 }}>{c.l}</span>
            </button>
          ))}
        </div>
        <label className="form-label">Message</label>
        <textarea className="form-control mb-2" rows={4} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Type a message or pick a template below." />
        <div className="d-flex gap-1 flex-wrap mb-3">
          {templates.map((t, i) => (
            <button key={i} className="pm-chip" onClick={() => setMsg(t)} style={{ fontSize: ".72rem" }}>Template {i + 1}</button>
          ))}
        </div>
        <div className="pm-note"><i className="bi bi-info-circle me-1" />This nudge is logged in the audit trail and visible in the owner's notification history.</div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={!msg.trim()} onClick={() => { push({ kind: "success", title: `Nudge sent via ${channel}`, body: `Message delivered to ${owner}.` }); onClose(); }}>
          <i className="bi bi-send me-1" />Send nudge
        </button>
      </div>
    </Modal>
  );
}

/* ============================ 17. Budget report modal ============================ */
export function BudgetReportModal({ dept, onClose }: { dept: Department; onClose: () => void }) {
  const { push } = useToast();
  const items = [
    { cat: "Headcount & payroll", budget: Math.round(dept.budget * 0.52), spend: Math.round(dept.spend * 0.54) },
    { cat: "Software & tools", budget: Math.round(dept.budget * 0.18), spend: Math.round(dept.spend * 0.16) },
    { cat: "Cloud infrastructure", budget: Math.round(dept.budget * 0.14), spend: Math.round(dept.spend * 0.15) },
    { cat: "Training & events", budget: Math.round(dept.budget * 0.08), spend: Math.round(dept.spend * 0.07) },
    { cat: "Travel & office", budget: Math.round(dept.budget * 0.05), spend: Math.round(dept.spend * 0.05) },
    { cat: "Miscellaneous", budget: Math.round(dept.budget * 0.03), spend: Math.round(dept.spend * 0.03) },
  ];
  return (
    <Modal open onClose={onClose} tone="violet" icon="bi-file-earmark-spreadsheet" size="lg"
      title={`${dept.name} — Budget Report`} subtitle={`Led by ${dept.lead} · FY2026`}>
      <div className="pm-modal-body">
        <div className="row g-2 mb-3">
          {[{ l: "Total budget", v: kes(dept.budget) }, { l: "Spent YTD", v: kes(dept.spend) },
            { l: "Remaining", v: kes(dept.budget - dept.spend) }, { l: "Burn rate", v: `${Math.round((dept.spend / dept.budget) * 100)}%` }].map((x) => (
            <div className="col-6" key={x.l}><div className="pm-stat"><div className="pm-stat-label">{x.l}</div>
              <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: ".95rem" }}>{x.v}</div></div></div>
          ))}
        </div>
        <div className="pm-card">
          <div className="pm-card-head"><h6 className="pm-card-title">Line items</h6></div>
          <div className="pm-table-wrap">
            <table className="pm-table">
              <thead><tr><th>Category</th><th className="text-end">Budget</th><th className="text-end">Spent</th><th className="text-end">% Used</th><th style={{ width: 140 }}>Progress</th></tr></thead>
              <tbody>{items.map((it) => {
                const pct = Math.round((it.spend / it.budget) * 100);
                return (<tr key={it.cat}>
                  <td className="pm-td-strong">{it.cat}</td>
                  <td className="text-end pm-num">{kes(it.budget, { compact: true })}</td>
                  <td className="text-end pm-num" style={{ fontWeight: 700 }}>{kes(it.spend, { compact: true })}</td>
                  <td className="text-end pm-num" style={{ color: pct > 90 ? "#d92d20" : pct > 75 ? "#f79009" : "#0b8f52" }}>{pct}%</td>
                  <td><Meter value={pct} tone={pct > 90 ? "#f04438" : pct > 75 ? "#f79009" : "#12b76a"} width={120} /></td>
                </tr>);
              })}</tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => { csvDownload(`${dept.id}-budget.csv`, items); push({ kind: "success", title: "Budget exported" }); }}>
          <i className="bi bi-download me-1" />Export CSV
        </button>
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ============================ 18. Schedule 1:1 modal ============================ */
export function ScheduleOneOnOneModal({ lead, deptName, onClose }: { lead: string; deptName: string; onClose: () => void }) {
  const { push } = useToast();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [dur, setDur] = useState("30");
  const [agenda, setAgenda] = useState("");
  const quickTopics = ["KPI review & blockers", "Team capacity planning", "Budget reallocation", "OKR check-in", "Career development", "Process improvements"];
  return (
    <Modal open onClose={onClose} tone="green" icon="bi-calendar-event" size="md"
      title={`1:1 with ${lead}`} subtitle={`${deptName} department`}>
      <div className="pm-modal-body">
        <div className="row g-2 mb-3">
          <div className="col-6"><label className="form-label">Date</label>
            <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div className="col-3"><label className="form-label">Time</label>
            <select className="form-select" value={time} onChange={(e) => setTime(e.target.value)}>
              {["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00"].map((t) => <option key={t}>{t}</option>)}</select></div>
          <div className="col-3"><label className="form-label">Duration</label>
            <select className="form-select" value={dur} onChange={(e) => setDur(e.target.value)}>
              {["15", "30", "45", "60"].map((d) => <option key={d}>{d} min</option>)}</select></div>
        </div>
        <label className="form-label">Agenda</label>
        <textarea className="form-control mb-2" rows={3} value={agenda} onChange={(e) => setAgenda(e.target.value)}
          placeholder="What topics should we cover?" />
        <div className="d-flex gap-1 flex-wrap">
          {quickTopics.map((t) => (
            <button key={t} className="pm-chip" onClick={() => setAgenda((a) => (a ? a + "\n• " : "• ") + t)} style={{ fontSize: ".72rem" }}>{t}</button>
          ))}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={!date} onClick={() => { push({ kind: "success", title: "1:1 scheduled", body: `${lead} · ${date} at ${time} · ${dur} min` }); onClose(); }}>
          <i className="bi bi-check-circle me-1" />Schedule meeting
        </button>
      </div>
    </Modal>
  );
}

/* ============================ 19. Share link modal ============================ */
export function ShareLinkModal({ open, title: t, onClose }: { open: boolean; title?: string; onClose: () => void }) {
  const { push } = useToast();
  const [expiry, setExpiry] = useState("30d");
  const [perm, setPerm] = useState<"view" | "comment">("view");
  const [pass, setPass] = useState(false);
  const link = `https://paymo.co.ke/share/kpi-${Date.now().toString(36)}`;
  return (
    <Modal open={open} onClose={onClose} tone="blue" icon="bi-link-45deg" size="md"
      title={t || "Share read-only link"} subtitle="Generate a secure shareable link">
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Link</span><span className="v mono" style={{ fontSize: ".76rem", wordBreak: "break-all" }}>{link}</span></div>
          <div className="pm-kv"><span className="k">Created</span><span className="v">{new Date().toLocaleDateString("en-GB")}</span></div>
        </div>
        <label className="form-label">Expiry</label>
        <div className="d-flex gap-1 flex-wrap mb-3">
          {["24h", "7d", "30d", "90d", "Never"].map((e) => (
            <button key={e} className={`pm-chip ${expiry === e ? "active" : ""}`} onClick={() => setExpiry(e)}>{e}</button>
          ))}
        </div>
        <label className="form-label">Permission</label>
        <div className="d-flex gap-2 mb-3">
          {[{ v: "view" as const, l: "View only" }, { v: "comment" as const, l: "View + comment" }].map((p) => (
            <button key={p.v} className={`pm-opt flex-grow-1 ${perm === p.v ? "active" : ""}`} onClick={() => setPerm(p.v)}>
              <span style={{ fontSize: ".84rem", fontWeight: 700 }}>{p.l}</span>
            </button>
          ))}
        </div>
        <label className="pm-opt mb-0">
          <input type="checkbox" className="form-check-input mt-0" checked={pass} onChange={(e) => setPass(e.target.checked)} />
          <span style={{ fontSize: ".84rem", fontWeight: 700 }}>Require password</span>
        </label>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Link copied to clipboard", body: `Expires in ${expiry} · ${perm} access` }); onClose(); }}>
          <i className="bi bi-clipboard me-1" />Copy link
        </button>
      </div>
    </Modal>
  );
}

/* ============================ 20. Download pack modal ============================ */
export function DownloadPackModal({ pack, onClose }: { pack: BoardPack | null; onClose: () => void }) {
  const { push } = useToast();
  const [fmt, setFmt] = useState("pdf");
  const [watermark, setWatermark] = useState(true);
  if (!pack) return null;
  return (
    <Modal open onClose={onClose} tone="violet" icon="bi-download" size="md"
      title={`Download ${pack.period}`} subtitle="Choose format and options">
      <div className="pm-modal-body">
        <label className="form-label">Format</label>
        <div className="d-flex gap-2 mb-3">
          {[{ v: "pdf", i: "bi-file-earmark-pdf", l: "PDF" }, { v: "pptx", i: "bi-file-earmark-slides", l: "PowerPoint" }, { v: "xlsx", i: "bi-file-earmark-spreadsheet", l: "Excel" }].map((f) => (
            <button key={f.v} className={`pm-opt flex-grow-1 ${fmt === f.v ? "active" : ""}`} style={{ flexDirection: "column", gap: ".3rem" }} onClick={() => setFmt(f.v)}>
              <i className={`bi ${f.i}`} style={{ fontSize: "1.3rem", color: fmt === f.v ? "var(--pm-green)" : "var(--pm-muted)" }} />
              <span style={{ fontSize: ".72rem", fontWeight: 700 }}>{f.l}</span>
            </button>
          ))}
        </div>
        <label className="pm-opt mb-2">
          <input type="checkbox" className="form-check-input mt-0" checked={watermark} onChange={(e) => setWatermark(e.target.checked)} />
          <span style={{ fontSize: ".84rem", fontWeight: 700 }}>Watermark with my identity</span>
        </label>
        <div className="pm-note"><i className="bi bi-info-circle me-1" />{pack.pages} pages · {pack.status} · Owner: {pack.owner}</div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Download started", body: `${pack.period} · ${fmt.toUpperCase()} · ${pack.pages} pages` }); onClose(); }}>
          <i className="bi bi-download me-1" />Download
        </button>
      </div>
    </Modal>
  );
}

/* ============================ 21. KPI Anomaly modal ============================ */
export function KpiAnomalyModal({ kpi, onClose }: { kpi: KPI | null; onClose: () => void }) {
  if (!kpi) return null;
  const anomalies = kpi.trend.map((v, i) => {
    const avg = kpi.trend.reduce((a, b) => a + b, 0) / kpi.trend.length;
    const std = Math.sqrt(kpi.trend.reduce((a, b) => a + (b - avg) ** 2, 0) / kpi.trend.length);
    const z = std > 0 ? Math.abs(v - avg) / std : 0;
    return { period: `T-${kpi.trend.length - 1 - i}`, value: v, zScore: z, isAnomaly: z > 1.5 };
  }).filter((a) => a.isAnomaly);
  return (
    <Modal open onClose={onClose} tone="red" icon="bi-lightning" size="md"
      title={`Anomalies — ${kpi.name}`} subtitle={`${anomalies.length} statistical outliers detected`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Mean</span><span className="v pm-num">{fmtKpi({ ...kpi, value: kpi.trend.reduce((a, b) => a + b, 0) / kpi.trend.length })}</span></div>
          <div className="pm-kv"><span className="k">Std dev</span><span className="v pm-num">{Math.sqrt(kpi.trend.reduce((a, b) => a + (b - kpi.trend.reduce((x, y) => x + y, 0) / kpi.trend.length) ** 2, 0) / kpi.trend.length).toFixed(2)}</span></div>
          <div className="pm-kv"><span className="k">Threshold</span><span className="v">z-score &gt; 1.5</span></div>
        </div>
        {anomalies.length === 0 ? (
          <div className="pm-empty"><i className="bi bi-check-circle" /><div style={{ fontWeight: 700 }}>No anomalies detected</div></div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {anomalies.map((a) => (
              <div key={a.period} className="pm-alert-row crit">
                <i className="bi bi-exclamation-triangle" style={{ color: "#f04438" }} />
                <div className="flex-grow-1">
                  <div style={{ fontWeight: 700, fontSize: ".84rem" }}>{a.period} — {fmtKpi({ ...kpi, value: a.value })}</div>
                  <div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>z-score {a.zScore.toFixed(2)} · deviation from mean</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => { csvDownload(`${kpi.id}-anomalies.csv`, anomalies); push({ kind: "success", title: "Anomalies exported" }); }}>
          <i className="bi bi-download me-1" />Export
        </button>
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ============================ 22. OKR detail drawer ============================ */
export function OkrDetailDrawer({ okr, onClose }: { okr: OKR | null; onClose: () => void }) {
  const { push } = useToast();
  if (!okr) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-flag" tone={okr.status === "Off track" ? "red" : okr.status === "At risk" ? "amber" : "green"}
      title={`${okr.id} — ${okr.title}`} subtitle={`${okr.dept} · ${okr.owner} · due ${okr.due}`}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => push({ kind: "info", title: "Check-in reminder sent" })}>
          <i className="bi bi-bell me-1" />Request check-in
        </button>
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </>}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-eyebrow">Objective</div>
        <div style={{ fontSize: ".88rem", fontWeight: 600 }}>{okr.objective}</div>
        <div className="d-flex justify-content-between align-items-center mt-3">
          <Badge tone={okr.status === "Done" ? "green" : okr.status === "On track" ? "blue" : okr.status === "At risk" ? "amber" : "red"}>{okr.status}</Badge>
          <div style={{ fontWeight: 800, fontFamily: "Sora", fontSize: "1.3rem" }}>{okr.progress}%</div>
        </div>
        <Meter value={okr.progress} tone={okr.progress >= 70 ? "#12b76a" : okr.progress >= 40 ? "#f79009" : "#f04438"} width={500} />
      </div>
      <div className="pm-card mb-3">
        <div className="pm-card-head"><h6 className="pm-card-title">Key results breakdown</h6></div>
        <div className="p-2">
          {okr.kr.map((k, i) => {
            const pct = Math.round((k.current / k.target) * 100);
            return (
              <div key={i} className="p-3" style={{ borderBottom: i < okr.kr.length - 1 ? "1px dashed #eaedf3" : "none" }}>
                <div style={{ fontWeight: 700, fontSize: ".84rem", marginBottom: 6 }}>{k.text}</div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Meter value={Math.min(pct, 120)} tone={pct >= 90 ? "#12b76a" : pct >= 60 ? "#f79009" : "#f04438"} width={320} />
                  <span className="pm-num" style={{ fontWeight: 800, fontSize: ".88rem" }}>{pct}%</span>
                </div>
                <div className="d-flex justify-content-between" style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>
                  <span>Current: {k.current.toLocaleString("en-KE")} {k.unit}</span>
                  <span>Target: {k.target.toLocaleString("en-KE")} {k.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="pm-card">
        <div className="pm-card-head"><h6 className="pm-card-title">Check-in history</h6></div>
        <div className="p-3"><div className="pm-timeline">
          {["Weekly progress review", "Risk flagged by CTO", "KR created", "Objective approved"].map((t, i) => (
            <div key={i} className={`pm-tl-item ${i === 0 ? "done" : i === 1 ? "warn" : ""}`}>
              <div style={{ fontWeight: 700, fontSize: ".82rem" }}>{t}</div>
              <div style={{ fontSize: ".74rem", color: "var(--pm-muted)" }}>{i === 0 ? "22 Aug 2026" : i === 1 ? "15 Aug 2026" : i === 2 ? "01 Jul 2026" : "15 Jun 2026"}</div>
            </div>
          ))}
        </div></div>
      </div>
    </Drawer>
  );
}

/* ============================ 23. Department budget detail modal ============================ */
export function DepartmentBudgetDetailModal({ dept, onClose }: { dept: Department | null; onClose: () => void }) {
  if (!dept) return null;
  const monthly = Array.from({ length: 8 }, (_, i) => ({
    month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"][i],
    budget: Math.round(dept.budget / 12),
    actual: Math.round(dept.spend * (0.08 + Math.random() * 0.05)),
  }));
  return (
    <Modal open onClose={onClose} tone="violet" icon="bi-cash-stack" size="lg"
      title={`${dept.name} — Budget Detail`} subtitle="Monthly breakdown FY2026">
      <div className="pm-modal-body">
        <div className="pm-card pm-table-wrap mb-3">
          <table className="pm-table">
            <thead><tr><th>Month</th><th className="text-end">Budget</th><th className="text-end">Actual</th><th className="text-end">Variance</th><th style={{ width: 120 }}>Status</th></tr></thead>
            <tbody>{monthly.map((m) => {
              const v = m.actual - m.budget;
              return (<tr key={m.month}>
                <td className="pm-td-strong">{m.month}</td>
                <td className="text-end pm-num">{kes(m.budget, { compact: true })}</td>
                <td className="text-end pm-num" style={{ fontWeight: 700 }}>{kes(m.actual, { compact: true })}</td>
                <td className="text-end pm-num" style={{ color: v > 0 ? "#d92d20" : "#0b8f52" }}>{v > 0 ? "+" : ""}{kes(v, { compact: true })}</td>
                <td><Badge tone={v > 0 ? "red" : "green"}>{v > 0 ? "Over" : "Under"}</Badge></td>
              </tr>);
            })}</tbody>
          </table>
        </div>
        <div className="pm-note"><i className="bi bi-info-circle me-1" />Next budget review: 15 Sep 2026 with CFO.</div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => { csvDownload(`${dept.id}-monthly-budget.csv`, monthly); push({ kind: "success", title: "Exported" }); }}>
          <i className="bi bi-download me-1" />Export
        </button>
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ============================ 24. Quarter review modal ============================ */
export function QuarterReviewModal({ open, period, onClose }: { open: boolean; period: string; onClose: () => void }) {
  const { push } = useToast();
  const highlights = [
    { label: "TPV beat", detail: "103% of target driven by Visa BIN traction", icon: "bi-graph-up-arrow", color: "#12b76a" },
    { label: "CAC above ceiling", detail: "KES 412 vs KES 380 target — paid acquisition cost rising", icon: "bi-exclamation-triangle", color: "#f79009" },
    { label: "Fraud loss best-ever", detail: "4.2 bps vs 5.0 bps target after v4.2.1 model", icon: "bi-shield-check", color: "#12b76a" },
    { label: "Day-30 retention improving", detail: "54.0% vs 51.4% prior quarter, onboarding refresh working", icon: "bi-arrow-up-right", color: "#12b76a" },
    { label: "Visa certification", detail: "85% complete — final scheme review pending", icon: "bi-hourglass-split", color: "#f79009" },
  ];
  return (
    <Modal open={open} onClose={onClose} tone="green" icon="bi-journal-text" size="lg"
      title={`${period} Review`} subtitle="Executive summary with key highlights and watch items">
      <div className="pm-modal-body">
        <div className="d-flex flex-column gap-2">
          {highlights.map((h) => (
            <div key={h.label} className="pm-alert-row" style={{ borderLeftColor: h.color }}>
              <i className={`bi ${h.icon}`} style={{ color: h.color }} />
              <div className="flex-grow-1">
                <div style={{ fontWeight: 700, fontSize: ".84rem" }}>{h.label}</div>
                <div style={{ fontSize: ".74rem", color: "var(--pm-muted)" }}>{h.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => { push({ kind: "success", title: "Review exported" }); }}>
          <i className="bi bi-download me-1" />Export summary
        </button>
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ============================ 25. Audit trail modal ============================ */
export function AuditTrailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const entries = [
    { id: "AUD-88240", time: "24 Aug 2026 14:32", user: "Joseph Mwangi", action: "Board pack signed", detail: "Q3-2026 forecast · 2FA verified", tone: "green" as const },
    { id: "AUD-88199", time: "22 Aug 2026 09:15", user: "Sarah Kamau", action: "Target changed", detail: "Platform uptime 99.9% → 99.95% · Board approval", tone: "blue" as const },
    { id: "AUD-88156", time: "18 Aug 2026 11:44", user: "CFO", action: "Revenue target revised", detail: "Q3 net revenue KES 112M → KES 118M", tone: "blue" as const },
    { id: "AUD-88102", time: "14 Aug 2026 16:20", user: "CRO", action: "Fraud ceiling tightened", detail: "6 bps → 5 bps after model v4.2.1 shadow run", tone: "amber" as const },
    { id: "AUD-88045", time: "10 Aug 2026 08:00", user: "System", action: "KPI refresh completed", detail: "21 KPIs updated · 12 green, 7 amber, 2 red", tone: "" as const },
    { id: "AUD-87988", time: "05 Aug 2026 14:10", user: "David Kiplagat", action: "OKR advanced", detail: "OKR-04 fraud losses 82% → 88%", tone: "green" as const },
    { id: "AUD-87901", time: "01 Aug 2026 09:00", user: "System", action: "Quarter rolled", detail: "Q2-2026 → Q3-2026 · 21 KPIs carried forward", tone: "" as const },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-clock-history" tone="blue" title="Audit trail"
      subtitle="Immutable log of all scorecard changes">
      <div className="d-flex flex-column gap-2">
        {entries.map((e) => (
          <div key={e.id} className="pm-alert-row" style={{ borderLeftColor: e.tone === "green" ? "#12b76a" : e.tone === "amber" ? "#f79009" : e.tone === "blue" ? "#2e90fa" : "#c3cbd9" }}>
            <i className="bi bi-clock-history" style={{ color: e.tone === "green" ? "#12b76a" : e.tone === "amber" ? "#f79009" : "#2e90fa" }} />
            <div className="flex-grow-1">
              <div style={{ fontWeight: 700, fontSize: ".82rem" }}>{e.action}</div>
              <div style={{ fontSize: ".74rem", color: "var(--pm-muted)" }}>{e.detail}</div>
              <div className="d-flex gap-2 mt-1 flex-wrap">
                <Badge tone="grey">{e.user}</Badge>
                <span style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{e.time} · {e.id}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 26. Scheduled report modal ============================ */
export function ScheduledReportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [reports, setReports] = useState([
    { name: "Weekly KPI digest", freq: "Monday 08:00", active: true },
    { name: "Monthly board summary", freq: "1st of month", active: true },
    { name: "RAG change alerts", freq: "Immediate", active: true },
    { name: "Quarterly deep-dive", freq: "End of quarter", active: false },
  ]);
  return (
    <Drawer open={open} onClose={onClose} icon="bi-calendar-check" tone="green" title="Scheduled reports"
      subtitle="Configure automated report delivery">
      <div className="d-flex flex-column gap-2 mb-3">
        {reports.map((r, i) => (
          <div key={r.name} className="pm-card pm-card-pad d-flex align-items-center justify-content-between">
            <div>
              <div style={{ fontWeight: 700, fontSize: ".84rem" }}>{r.name}</div>
              <div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{r.freq}</div>
            </div>
            <button className={`btn btn-sm ${r.active ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => setReports(reports.map((x, j) => j === i ? { ...x, active: !x.active } : x))}>
              {r.active ? "Active" : "Enable"}
            </button>
          </div>
        ))}
      </div>
      <button className="btn btn-outline-primary btn-sm w-100" onClick={() => push({ kind: "info", title: "New report wizard" })}>
        <i className="bi bi-plus-lg me-1" />Add new scheduled report
      </button>
    </Drawer>
  );
}

/* ============================ 27. Board meeting prep modal ============================ */
export function BoardMeetingPrepModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const checklist = [
    { item: "Board pack published", done: true },
    { item: "Executive commentary written", done: true },
    { item: "Financial reconciliation verified", done: true },
    { item: "Risk disclosures complete", done: false },
    { item: "Legal review of slide deck", done: false },
    { item: "CEO presentation rehearsed", done: false },
  ];
  return (
    <Modal open={open} onClose={onClose} tone="violet" icon="bi-clipboard-check" size="md"
      title="Board Meeting Prep" subtitle="27 Aug 2026 · Boardroom A · 10:00 EAT">
      <div className="pm-modal-body">
        <div className="d-flex flex-column gap-2">
          {checklist.map((c) => (
            <label key={c.item} className={`pm-opt ${c.done ? "active" : ""}`}>
              <input type="checkbox" className="form-check-input mt-0" defaultChecked={c.done} />
              <span style={{ fontSize: ".84rem", fontWeight: 700 }}>{c.item}</span>
            </label>
          ))}
        </div>
        <div className="pm-note mt-3"><i className="bi bi-info-circle me-1" />All items must be checked before the board pack is finalised.</div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Checklist saved" }); onClose(); }}>
          <i className="bi bi-save me-1" />Save
        </button>
      </div>
    </Modal>
  );
}

/* ============================ 28. Team capacity modal ============================ */
export function TeamCapacityModal({ dept, onClose }: { dept: Department | null; onClose: () => void }) {
  if (!dept) return null;
  const members = Array.from({ length: Math.min(dept.headcount, 8) }, (_, i) => ({
    name: `${dept.name.split(" ")[0]} Member ${i + 1}`,
    load: Math.round(60 + Math.random() * 40),
    okrs: Math.floor(1 + Math.random() * 3),
  }));
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-people" size="md"
      title={`${dept.name} — Team Capacity`} subtitle={`${dept.headcount} members · ${dept.okrs} OKRs`}>
      <div className="pm-modal-body">
        <div className="d-flex flex-column gap-2">
          {members.map((m) => (
            <div key={m.name} className="pm-card pm-card-pad d-flex align-items-center gap-3">
              <Avatar name={m.name} size="sm" />
              <div className="flex-grow-1">
                <div style={{ fontWeight: 700, fontSize: ".82rem" }}>{m.name}</div>
                <div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{m.okrs} OKRs assigned</div>
              </div>
              <div className="text-end">
                <div style={{ fontWeight: 800, fontSize: ".88rem", color: m.load > 90 ? "#d92d20" : m.load > 75 ? "#f79009" : "#0b8f52" }}>{m.load}%</div>
                <Meter value={m.load} tone={m.load > 90 ? "#f04438" : m.load > 75 ? "#f79009" : "#12b76a"} width={100} />
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

/* ============================ 29. Cohort deep-dive modal ============================ */
export function CohortDeepDiveModal({ cohort: c, onClose }: { cohort: CohortRow | null; onClose: () => void }) {
  if (!c) return null;
  const stages = [
    { label: "Signups", value: c.signups, pct: 100 },
    { label: "Day 1 active", value: Math.round(c.signups * c.d1 / 100), pct: c.d1 },
    { label: "Day 7", value: Math.round(c.signups * c.d7 / 100), pct: c.d7 },
    { label: "Day 14", value: Math.round(c.signups * c.d14 / 100), pct: c.d14 || 0 },
    { label: "Day 30", value: Math.round(c.signups * c.d30 / 100), pct: c.d30 || 0 },
    { label: "Day 60", value: Math.round(c.signups * c.d60 / 100), pct: c.d60 || 0 },
    { label: "Day 90", value: Math.round(c.signups * c.d90 / 100), pct: c.d90 || 0 },
  ].filter((s) => s.pct > 0 || s.label === "Signups");
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-funnel" size="md"
      title={`Cohort Deep-Dive — ${c.cohort}`} subtitle={`${num(c.signups)} signups · funnel analysis`}>
      <div className="pm-modal-body">
        <div className="d-flex flex-column gap-2">
          {stages.map((s, i) => (
            <div key={s.label} className="d-flex align-items-center gap-3">
              <span style={{ width: 100, fontSize: ".78rem", fontWeight: 600 }}>{s.label}</span>
              <div style={{ flex: 1 }}>
                <Meter value={s.pct} tone={s.pct >= 60 ? "#12b76a" : s.pct >= 40 ? "#f79009" : "#f04438"} width={300} />
              </div>
              <span className="pm-num" style={{ fontWeight: 700, width: 50, textAlign: "right" }}>{s.pct ? s.pct.toFixed(1) + "%" : "—"}</span>
              <span className="pm-num" style={{ fontSize: ".72rem", color: "var(--pm-muted)", width: 60, textAlign: "right" }}>{s.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="pm-note mt-3"><i className="bi bi-info-circle me-1" />Drop-off from Day 1 to Day 7 is {(c.d1 - c.d7).toFixed(1)}pp. Focus on the onboarding week for retention gains.</div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => { csvDownload(`cohort-${c.cohort}-deep.csv`, stages); push({ kind: "success", title: "Exported" }); }}>
          <i className="bi bi-download me-1" />Export
        </button>
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ============================ 30. KPI alert config modal ============================ */
export function KpiAlertConfigModal({ kpi, onClose }: { kpi: KPI | null; onClose: () => void }) {
  const { push } = useToast();
  if (!kpi) return null;
  return (
    <Modal open onClose={onClose} tone="amber" icon="bi-bell" size="md"
      title={`Alert Config — ${kpi.name}`} subtitle="Configure when alerts are triggered">
      <div className="pm-modal-body">
        <label className="form-label">Alert thresholds</label>
        <div className="d-flex flex-column gap-2 mb-3">
          {[{ label: "Red alert", value: kpi.direction === "up" ? "Below 80% of target" : "Above 120% of target", color: "#f04438" },
            { label: "Amber alert", value: kpi.direction === "up" ? "Below 90% of target" : "Above 110% of target", color: "#f79009" },
            { label: "Green restored", value: kpi.direction === "up" ? "At or above target" : "At or below target", color: "#12b76a" },
          ].map((a) => (
            <div key={a.label} className="pm-card pm-card-pad d-flex align-items-center gap-3">
              <span className="pm-dot" style={{ background: a.color, width: 10, height: 10 }} />
              <div className="flex-grow-1">
                <div style={{ fontWeight: 700, fontSize: ".82rem" }}>{a.label}</div>
                <div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{a.value}</div>
              </div>
              <Badge tone={a.color === "#12b76a" ? "green" : a.color === "#f79009" ? "amber" : "red"}>Enabled</Badge>
            </div>
          ))}
        </div>
        <label className="form-label">Notification channels</label>
        <div className="d-flex gap-2 mb-3">
          {[{ l: "Slack", active: true }, { l: "Email", active: true }, { l: "Push", active: false }].map((ch) => (
            <button key={ch.l} className={`pm-chip ${ch.active ? "active" : ""}`}>{ch.l}</button>
          ))}
        </div>
        <div className="pm-note"><i className="bi bi-info-circle me-1" />Alerts are evaluated every {kpi.frequency.toLowerCase()} and compared against the current target.</div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Alert config saved" }); onClose(); }}>
          <i className="bi bi-check2 me-1" />Save config
        </button>
      </div>
    </Modal>
  );
}

/* ============================ 31. Owner performance modal ============================ */
export function OwnerPerformanceModal({ owner, kpis, onClose }: { owner: string; kpis: KPI[]; onClose: () => void }) {
  const ownerKpis = kpis.filter((k) => k.owner === owner);
  const onTrack = ownerKpis.filter((k) => (k.value / k.target) * 100 >= (k.direction === "up" ? 90 : 110)).length;
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-person-badge" size="lg"
      title={`${owner} — KPI Portfolio`} subtitle={`${ownerKpis.length} KPIs · ${onTrack} on track`}>
      <div className="pm-modal-body">
        <div className="row g-2 mb-3">
          <div className="col-4"><div className="pm-stat"><div className="pm-stat-label">Total KPIs</div><div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1.1rem" }}>{ownerKpis.length}</div></div></div>
          <div className="col-4"><div className="pm-stat"><div className="pm-stat-label">On track</div><div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1.1rem", color: "#12b76a" }}>{onTrack}</div></div></div>
          <div className="col-4"><div className="pm-stat"><div className="pm-stat-label">At risk</div><div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1.1rem", color: "#f79009" }}>{ownerKpis.length - onTrack}</div></div></div>
        </div>
        <div className="d-flex flex-column gap-2">
          {ownerKpis.map((k) => {
            const pct = Math.round((k.value / k.target) * 100);
            return (
              <div key={k.id} className="pm-card pm-card-pad d-flex align-items-center gap-3">
                <Badge tone={k.rag} dot>{k.rag}</Badge>
                <div className="flex-grow-1">
                  <div style={{ fontWeight: 700, fontSize: ".84rem" }}>{k.name}</div>
                  <div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{k.category} · {k.frequency}</div>
                </div>
                <div className="text-end">
                  <div style={{ fontWeight: 800, fontSize: ".88rem" }}>{fmtKpi(k)}</div>
                  <div style={{ fontSize: ".68rem", color: "var(--pm-muted)" }}>{pct}% of target</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => { csvDownload(`${owner.replace(/\s/g, "-")}-kpis.csv`, ownerKpis); push({ kind: "success", title: "Exported" }); }}>
          <i className="bi bi-download me-1" />Export
        </button>
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ============================ 32. Metric insight modal ============================ */
export function MetricInsightModal({ kpi, onClose }: { kpi: KPI | null; onClose: () => void }) {
  if (!kpi) return null;
  const avg = kpi.trend.reduce((a, b) => a + b, 0) / kpi.trend.length;
  const latest = kpi.trend[kpi.trend.length - 1];
  const momentum = latest - kpi.trend[Math.max(0, kpi.trend.length - 3)];
  const insights = [
    { icon: "bi-graph-up", title: "Trend direction", detail: momentum > 0 ? "Positive momentum — value increasing over last 3 periods" : "Negative momentum — value declining over last 3 periods", tone: momentum > 0 ? "green" : "red" },
    { icon: "bi-bullseye", title: "Target alignment", detail: `${Math.round((kpi.value / kpi.target) * 100)}% of target achieved. ${kpi.value >= kpi.target ? "Target met." : `${fmtKpi({ ...kpi, value: kpi.target - kpi.value })} gap remaining.`}`, tone: kpi.value >= kpi.target ? "green" : "amber" },
    { icon: "bi-arrow-up-right", title: "Period-over-period", detail: `${momentum >= 0 ? "+" : ""}${momentum.toFixed(kpi.unit === "pct" || kpi.unit === "bps" ? 1 : 0)} change in last 3 periods. ${Math.abs(momentum) > avg * 0.05 ? "Significant movement." : "Stable range."}`, tone: "blue" },
    { icon: "bi-speedometer2", title: "Volatility", detail: `Standard deviation: ${Math.sqrt(kpi.trend.reduce((a, b) => a + (b - avg) ** 2, 0) / kpi.trend.length).toFixed(2)}. ${kpi.trend.length > 3 ? (Math.max(...kpi.trend) - Math.min(...kpi.trend)) / avg * 100 < 10 ? "Low volatility — consistent performance." : "Moderate volatility — watch for spikes." : "Insufficient data."}`, tone: "blue" },
  ];
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-lightbulb" size="md"
      title={`Insights — ${kpi.name}`} subtitle="AI-powered metric analysis">
      <div className="pm-modal-body">
        <div className="d-flex flex-column gap-2">
          {insights.map((ins) => (
            <div key={ins.title} className="pm-alert-row" style={{ borderLeftColor: ins.tone === "green" ? "#12b76a" : ins.tone === "amber" ? "#f79009" : ins.tone === "red" ? "#f04438" : "#2e90fa" }}>
              <i className={`bi ${ins.icon}`} style={{ color: ins.tone === "green" ? "#12b76a" : ins.tone === "amber" ? "#f79009" : ins.tone === "red" ? "#f04438" : "#2e90fa" }} />
              <div className="flex-grow-1">
                <div style={{ fontWeight: 700, fontSize: ".84rem" }}>{ins.title}</div>
                <div style={{ fontSize: ".74rem", color: "var(--pm-muted)" }}>{ins.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ============================ 33. RAG action modal ============================ */
export function RagActionModal({ rag, onClose }: { rag: "green" | "amber" | "red" | null; onClose: () => void }) {
  const { push } = useToast();
  if (!rag) return null;
  const actions = {
    green: [
      { icon: "bi-trophy", label: "Recognise owners", desc: "Send kudos to KPI owners performing well" },
      { icon: "bi-arrow-up-right", label: "Stretch targets", desc: "Propose 5-10% target increases for next quarter" },
      { icon: "bi-download", label: "Export green KPIs", desc: "Download detailed data for all green KPIs" },
    ],
    amber: [
      { icon: "bi-envelope", label: "Nudge all owners", desc: "Send batch nudge to owners of amber KPIs" },
      { icon: "bi-pencil-square", label: "Review targets", desc: "Check if targets need adjustment" },
      { icon: "bi-calendar-event", label: "Schedule review", desc: "Book a review meeting for amber KPIs" },
    ],
    red: [
      { icon: "bi-exclamation-octagon", label: "Escalate to board", desc: "Flag red KPIs for board attention" },
      { icon: "bi-telephone", label: "Emergency sync", desc: "Call owners of red KPIs immediately" },
      { icon: "bi-lightning", label: "Trigger intervention", desc: "Start a corrective action plan" },
    ],
  };
  return (
    <Modal open onClose={onClose} tone={rag} icon="bi-flag-fill" size="md"
      title={`${rag.toUpperCase()} KPI Actions`} subtitle="Available actions for this RAG bucket">
      <div className="pm-modal-body">
        <div className="d-flex flex-column gap-2">
          {actions[rag].map((a) => (
            <button key={a.label} className="pm-card pm-card-pad text-start d-flex align-items-center gap-3 w-100" style={{ cursor: "pointer", border: "1px solid #eaedf3" }}
              onClick={() => { push({ kind: "success", title: a.label, body: a.desc }); onClose(); }}>
              <i className={`bi ${a.icon}`} style={{ fontSize: "1.2rem", color: rag === "green" ? "#12b76a" : rag === "amber" ? "#f79009" : "#f04438" }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: ".84rem" }}>{a.label}</div>
                <div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{a.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ============================ 34. Bulk KPI action modal ============================ */
export function BulkKpiActionModal({ open, kpis, onClose }: { open: boolean; kpis: KPI[]; onClose: () => void }) {
  const { push } = useToast();
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (id: string) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  return (
    <Modal open={open} onClose={onClose} tone="ink" icon="bi-check2-square" size="lg"
      title="Bulk KPI Actions" subtitle="Select KPIs and choose an action">
      <div className="pm-modal-body">
        <div className="d-flex flex-column gap-1 mb-3" style={{ maxHeight: 280, overflowY: "auto" }}>
          {kpis.map((k) => (
            <label key={k.id} className={`pm-opt ${selected.includes(k.id) ? "active" : ""}`}>
              <input type="checkbox" className="form-check-input mt-0" checked={selected.includes(k.id)} onChange={() => toggle(k.id)} />
              <div className="flex-grow-1">
                <span style={{ fontSize: ".84rem", fontWeight: 700 }}>{k.name}</span>
                <span className="ms-2" style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{k.owner}</span>
              </div>
              <Badge tone={k.rag} dot>{k.rag}</Badge>
            </label>
          ))}
        </div>
        <div className="pm-note"><i className="bi bi-info-circle me-1" />{selected.length} KPI{selected.length !== 1 ? "s" : ""} selected</div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-outline-secondary btn-sm" disabled={selected.length === 0}
          onClick={() => { push({ kind: "success", title: "Exported", body: `${selected.length} KPIs exported` }); }}>
          <i className="bi bi-download me-1" />Export
        </button>
        <button className="btn btn-primary btn-sm" disabled={selected.length === 0}
          onClick={() => { push({ kind: "info", title: "Nudge sent", body: `Nudged owners of ${selected.length} KPIs` }); onClose(); }}>
          <i className="bi bi-envelope me-1" />Nudge owners
        </button>
      </div>
    </Modal>
  );
}

/* ============================ 35. KPI trend analysis modal ============================ */
export function KpiTrendAnalysisModal({ kpi, onClose }: { kpi: KPI | null; onClose: () => void }) {
  if (!kpi) return null;
  const avg = kpi.trend.reduce((a, b) => a + b, 0) / kpi.trend.length;
  const max = Math.max(...kpi.trend);
  const min = Math.min(...kpi.trend);
  const recentAvg = kpi.trend.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const earlyAvg = kpi.trend.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  const forecast = kpi.trend.map((v, i) => ({ period: `T-${kpi.trend.length - 1 - i}`, actual: v, forecast: null as number | null }));
  // Simple linear forecast for next 3 periods
  const slope = (kpi.trend[kpi.trend.length - 1] - kpi.trend[0]) / (kpi.trend.length - 1);
  for (let i = 1; i <= 3; i++) {
    forecast.push({ period: `T+${i}`, actual: null, forecast: Math.round(kpi.trend[kpi.trend.length - 1] + slope * i) });
  }
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-graph-up" size="lg"
      title={`Trend Analysis — ${kpi.name}`} subtitle="Historical trend and linear forecast">
      <div className="pm-modal-body">
        <div className="row g-2 mb-3">
          <div className="col-3"><div className="pm-stat"><div className="pm-stat-label">Mean</div><div style={{ fontWeight: 800, fontSize: ".9rem" }}>{fmtKpi({ ...kpi, value: avg })}</div></div></div>
          <div className="col-3"><div className="pm-stat"><div className="pm-stat-label">Max</div><div style={{ fontWeight: 800, fontSize: ".9rem" }}>{fmtKpi({ ...kpi, value: max })}</div></div></div>
          <div className="col-3"><div className="pm-stat"><div className="pm-stat-label">Min</div><div style={{ fontWeight: 800, fontSize: ".9rem" }}>{fmtKpi({ ...kpi, value: min })}</div></div></div>
          <div className="col-3"><div className="pm-stat"><div className="pm-stat-label">Slope</div><div style={{ fontWeight: 800, fontSize: ".9rem", color: slope > 0 ? "#12b76a" : "#f04438" }}>{slope > 0 ? "+" : ""}{slope.toFixed(2)}/period</div></div></div>
        </div>
        <div className="pm-card mb-3">
          <div className="pm-card-head"><h6 className="pm-card-title">Period data</h6></div>
          <div className="pm-table-wrap">
            <table className="pm-table">
              <thead><tr><th>Period</th><th className="text-end">Value</th><th className="text-end">vs Mean</th></tr></thead>
              <tbody>{forecast.slice(0, kpi.trend.length).map((f) => (
                <tr key={f.period}>
                  <td className="pm-td-strong">{f.period}</td>
                  <td className="text-end pm-num" style={{ fontWeight: 700 }}>{fmtKpi({ ...kpi, value: f.actual! })}</td>
                  <td className="text-end pm-num" style={{ color: f.actual! >= avg ? "#0b8f52" : "#d92d20" }}>{f.actual! >= avg ? "+" : ""}{((f.actual! / avg - 1) * 100).toFixed(1)}%</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
        <div className="pm-card">
          <div className="pm-card-head"><h6 className="pm-card-title">Forecast</h6></div>
          <div className="p-3 d-flex flex-column gap-2">
            {forecast.slice(kpi.trend.length).map((f) => (
              <div key={f.period} className="pm-alert-row info">
                <i className="bi bi-arrow-right-circle" style={{ color: "#2e90fa" }} />
                <div className="flex-grow-1">
                  <div style={{ fontWeight: 700, fontSize: ".82rem" }}>{f.period}</div>
                  <div style={{ fontSize: ".74rem", color: "var(--pm-muted)" }}>Projected: {fmtKpi({ ...kpi, value: f.forecast! })}</div>
                </div>
                <Badge tone={f.forecast! >= kpi.target ? "green" : "amber"}>{f.forecast! >= kpi.target ? "On track" : "Watch"}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => { csvDownload(`${kpi.id}-trend.csv`, forecast.map((f) => ({ period: f.period, actual: f.actual, forecast: f.forecast }))); push({ kind: "success", title: "Trend exported" }); }}>
          <i className="bi bi-download me-1" />Export
        </button>
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

// Used to avoid the Avatar unused import in this file when stripping
void Avatar; void DDItem;
