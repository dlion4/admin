import { useState } from "react";
import { Avatar, Badge, Drawer, Meter, Modal, Steps, TwoFactorField, useToast } from "../../../components/ui";
import { csvDownload, jsonDownload, num } from "../../../lib/format";
import { KYC_CASES, SAVED_KYC_VIEWS, type KycCase, type KycDocument, type SavedKycView } from "../data/kycData";

const riskTone = (risk: string) => risk === "Critical" ? "red" : risk === "High" ? "amber" : risk === "Medium" ? "blue" : "green";
const stateTone = (state: string) => state === "Approved" || state === "Verified" || state === "Clear" ? "green" : state === "Rejected" || state.includes("Confirmed") ? "red" : state === "Pending" || state === "Review" || state === "More info" ? "amber" : "blue";

export function CaseDrawer({ item, onClose, onAction, onDocument }: { item: KycCase | null; onClose: () => void; onAction: (action: string, item: KycCase) => void; onDocument: (doc: KycDocument) => void }) {
  if (!item) return null;
  const overall = Math.round((item.liveness + item.faceMatch + item.documents.reduce((s, d) => s + d.score, 0) / item.documents.length) / 3);
  return <Drawer open onClose={onClose} wide icon="bi-person-vcard" tone={item.risk === "Critical" ? "red" : "blue"}
    title={`${item.name} - ${item.id}`} subtitle={`${item.userId} · ${item.tier} · submitted ${item.submitted}`}
    headExtra={<Badge tone={riskTone(item.risk)}>{item.risk} {item.riskScore}</Badge>}
    footer={<>
      <button className="btn btn-outline-secondary btn-sm" onClick={() => onAction("info", item)}><i className="bi bi-envelope me-1" />Request info</button>
      <button className="btn btn-outline-secondary btn-sm" onClick={() => onAction("reject", item)}><i className="bi bi-x-circle me-1" />Reject</button>
      <button className="btn btn-primary btn-sm flex-grow-1" onClick={() => onAction("approve", item)}><i className="bi bi-check2-circle me-1" />Approve KYC</button>
    </>}>
    <div className="pm-card pm-card-pad mb-3 d-flex align-items-center gap-3">
      <Avatar name={item.name} size="lg" />
      <div className="flex-grow-1"><div style={{ fontWeight: 800, fontSize: "1rem" }}>{item.name}</div>
        <div style={{ fontSize: ".75rem", color: "var(--pm-muted)" }}>{item.phone} · {item.email} · {item.county}, {item.nationality}</div>
        <div className="d-flex gap-1 mt-1 flex-wrap"><Badge tone={stateTone(item.state)} dot>{item.state}</Badge><Badge tone="violet">{item.tier}</Badge><Badge tone="grey">{item.source}</Badge>{item.flags.map((f) => <Badge key={f} tone="amber">{f}</Badge>)}</div>
      </div>
      <div className="text-end"><div className="pm-eyebrow">Evidence score</div><div style={{ font: "800 1.5rem Sora" }}>{overall}%</div></div>
    </div>
    <div className="row g-2 mb-3">
      {[{ l: "Liveness", v: item.liveness }, { l: "Face match", v: item.faceMatch }, { l: "Duplicate", v: item.duplicate }, { l: "Risk", v: item.riskScore }].map((x) => <div className="col-6 col-lg-3" key={x.l}><div className="pm-stat"><div className="pm-stat-label">{x.l}</div><div className="pm-stat-value" style={{ fontSize: "1.05rem" }}>{x.v}%</div><Meter value={x.v} tone={x.l === "Duplicate" || x.l === "Risk" ? (x.v > 70 ? "#f04438" : "#f79009") : (x.v > 85 ? "#12b76a" : "#f79009")} width={160} /></div></div>)}
    </div>
    <div className="pm-card mb-3"><div className="pm-card-head"><h6 className="pm-card-title">Evidence package</h6><Badge tone="grey">{item.documents.length} files</Badge></div>
      <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Document</th><th>Number</th><th>Uploaded</th><th>Score</th><th>Status</th><th /></tr></thead><tbody>
        {item.documents.map((d) => <tr key={d.id} onClick={() => onDocument(d)}><td><span className="pm-td-strong">{d.type}</span><div className="pm-td-sub mono">{d.id}</div></td><td className="mono">{d.number}</td><td>{d.uploaded}</td><td><Meter value={d.score} width={70} tone={d.score > 85 ? "#12b76a" : "#f79009"} /></td><td><Badge tone={stateTone(d.state)}>{d.state}</Badge></td><td><i className="bi bi-chevron-right" /></td></tr>)}
      </tbody></table></div>
    </div>
    <div className="row g-3"><div className="col-6"><div className="pm-card pm-card-pad h-100"><div className="pm-eyebrow mb-2">Screening</div>
      <div className="pm-kv"><span className="k">Sanctions</span><span className="v"><Badge tone={stateTone(item.sanctions)}>{item.sanctions}</Badge></span></div>
      <div className="pm-kv"><span className="k">PEP</span><span className="v"><Badge tone={stateTone(item.pep)}>{item.pep}</Badge></span></div>
      <div className="pm-kv"><span className="k">World-Check</span><span className="v">Scanned 12 min ago</span></div>
    </div></div><div className="col-6"><div className="pm-card pm-card-pad h-100"><div className="pm-eyebrow mb-2">Ownership</div>
      <div className="pm-kv"><span className="k">Reviewer</span><span className="v">{item.reviewer}</span></div><div className="pm-kv"><span className="k">Queue age</span><span className="v">{item.ageHours} hours</span></div><div className="pm-kv"><span className="k">SLA</span><span className="v"><Badge tone={item.ageHours > 24 ? "red" : "green"}>{item.ageHours > 24 ? "Breached" : "Within SLA"}</Badge></span></div>
    </div></div></div>
  </Drawer>;
}

export function DocumentModal({ doc, item, onClose, onDecision }: { doc: KycDocument | null; item: KycCase | null; onClose: () => void; onDecision: (state: "Verified" | "Rejected" | "Review") => void }) {
  const { push } = useToast(); const [note, setNote] = useState("");
  if (!doc || !item) return null;
  return <Modal open onClose={onClose} size="xl" tone={doc.state === "Rejected" ? "red" : "blue"} icon="bi-file-earmark-image" title={doc.type} subtitle={`${item.name} · ${doc.id} · uploaded ${doc.uploaded}`}>
    <div className="pm-modal-body"><div className="row g-3"><div className="col-lg-7"><div className="pm-card d-grid text-center" style={{ minHeight: 390, placeItems: "center", background: "repeating-linear-gradient(45deg,#f7f9fc,#f7f9fc 12px,#eef1f6 12px,#eef1f6 24px)" }}><div><i className="bi bi-file-earmark-person" style={{ fontSize: "4rem", color: "#98a2b3" }} /><h5>{doc.type}</h5><p className="pm-card-sub">Secure watermarked evidence preview</p><div className="pm-code">{doc.number}<br />SHA256 8f21…{doc.id.slice(-4)}</div></div></div></div>
      <div className="col-lg-5"><div className="pm-card pm-card-pad mb-3"><div className="pm-kv"><span className="k">Onfido score</span><span className="v">{doc.score}%</span></div><div className="pm-kv"><span className="k">Document number</span><span className="v mono">{doc.number}</span></div><div className="pm-kv"><span className="k">Expires</span><span className="v">{doc.expires}</span></div><div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone={stateTone(doc.state)}>{doc.state}</Badge></span></div></div>
        <div className="pm-card pm-card-pad mb-3"><div className="pm-eyebrow mb-2">Automated checks</div>{doc.checks.map((c) => <div className="d-flex gap-2 py-1" key={c}><i className="bi bi-check-circle-fill" style={{ color: "#12b76a" }} /><span style={{ fontSize: ".8rem" }}>{c}</span></div>)}</div>
        <label className="form-label">Reviewer note</label><textarea className="form-control" rows={3} value={note} onChange={(e) => setNote(e.target.value)} /></div></div></div>
    <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => { jsonDownload(`${doc.id}.json`, doc); push({ kind: "success", title: "Evidence metadata downloaded" }); }}><i className="bi bi-download me-1" />Download original</button><button className="btn btn-outline-secondary btn-sm" onClick={() => onDecision("Review")}>Needs review</button><button className="btn btn-danger btn-sm" onClick={() => onDecision("Rejected")}>Reject</button><button className="btn btn-primary btn-sm" onClick={() => onDecision("Verified")}>Verify document</button></div>
  </Modal>;
}

type DecisionKind = "approve" | "reject" | "info" | "escalate" | "rerun" | "assign";
const decisionConfig: Record<DecisionKind, { title: string; icon: string; tone: "green" | "red" | "amber" | "blue" | "violet"; steps: string[] }> = {
  approve: { title: "Approve KYC case", icon: "bi-check2-circle", tone: "green", steps: ["Evidence", "Tier", "2FA", "Confirm"] },
  reject: { title: "Reject KYC case", icon: "bi-x-octagon", tone: "red", steps: ["Reason", "Customer notice", "2FA", "Confirm"] },
  info: { title: "Request more information", icon: "bi-envelope-paper", tone: "blue", steps: ["Missing evidence", "Message", "Delivery", "Confirm"] },
  escalate: { title: "Escalate compliance case", icon: "bi-arrow-up-right-circle", tone: "amber", steps: ["Escalation", "Owner", "2FA", "Confirm"] },
  rerun: { title: "Re-run identity checks", icon: "bi-arrow-repeat", tone: "violet", steps: ["Checks", "Provider", "2FA", "Run"] },
  assign: { title: "Assign reviewer", icon: "bi-person-check", tone: "blue", steps: ["Reviewer", "Priority", "Confirm"] },
};

export function DecisionWizard({ kind, item, onClose, onDone }: { kind: DecisionKind | null; item: KycCase | null; onClose: () => void; onDone: (kind: DecisionKind, payload: string) => void }) {
  const { push } = useToast(); const [step, setStep] = useState(0); const [choice, setChoice] = useState(""); const [note, setNote] = useState(""); const [code, setCode] = useState("");
  if (!kind || !item) return null; const cfg = decisionConfig[kind]; const needs2fa = ["approve", "reject", "escalate", "rerun"].includes(kind);
  const options: Record<DecisionKind, string[]> = {
    approve: [item.tier, "Tier 2", "Tier 3", "Business"], reject: ["Document tampering", "Identity mismatch", "Sanctions confirmed", "Insufficient evidence"],
    info: ["New proof of address", "Clearer identity document", "Source-of-funds evidence", "Business registration documents"], escalate: ["Sanctions / PEP review", "Fraud investigation", "Senior compliance decision", "Legal opinion"],
    rerun: ["All identity checks", "Liveness + face match", "Sanctions / PEP only", "Duplicate identity graph"], assign: ["David Kiplagat", "Mary Wanjiku", "Cynthia Awuor", "James Odhiambo"],
  };
  const steps = cfg.steps.map((label, i) => ({ label, icon: i === cfg.steps.length - 1 ? "bi-check2" : undefined }));
  const last = step === steps.length - 1; const authStep = needs2fa && step === steps.length - 2;
  const reset = () => { setStep(0); setChoice(""); setNote(""); setCode(""); onClose(); };
  return <Modal open onClose={reset} size="lg" tone={cfg.tone} icon={cfg.icon} title={`${cfg.title} - ${item.name}`} subtitle={`${item.id} · ${item.risk} risk · ${item.ageHours}h in queue`}>
    <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%`, background: cfg.tone === "red" ? "#f04438" : cfg.tone === "amber" ? "#f79009" : undefined }} /></div><Steps steps={steps} current={step} />
    <div className="pm-modal-body">
      {step === 0 && <div className="d-flex flex-column gap-2">{options[kind].map((o) => <button key={o} className={`pm-opt ${choice === o ? "active" : ""}`} onClick={() => setChoice(o)}><span className="r" /><span style={{ fontWeight: 700, fontSize: ".84rem" }}>{o}</span></button>)}</div>}
      {step === 1 && <><label className="form-label">Decision note / customer message</label><textarea className="form-control" rows={5} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Record the evidence and rationale for this action..." /><div className="pm-note mt-2">The note is retained for seven years and included in regulator evidence exports.</div></>}
      {authStep && <TwoFactorField value={code} onChange={setCode} />}
      {last && <div className="pm-card pm-card-pad"><div className="pm-kv"><span className="k">Case</span><span className="v">{item.id} · {item.name}</span></div><div className="pm-kv"><span className="k">Action</span><span className="v">{cfg.title}</span></div><div className="pm-kv"><span className="k">Selection</span><span className="v">{choice || "Default workflow"}</span></div><div className="pm-kv"><span className="k">Actor</span><span className="v">Joseph Mwangi · Tier 0</span></div></div>}
    </div><div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm me-auto" onClick={reset}>Cancel</button>{step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}>Back</button>}{!last && <button className={`btn ${kind === "reject" ? "btn-danger" : "btn-primary"} btn-sm`} disabled={(step === 0 && !choice) || authStep && code !== "482913"} onClick={() => setStep(step + 1)}>Next <i className="bi bi-arrow-right" /></button>}{last && <button className={`btn ${kind === "reject" ? "btn-danger" : "btn-primary"} btn-sm`} onClick={() => { onDone(kind, choice); push({ kind: kind === "reject" ? "warn" : "success", title: `${cfg.title} completed`, body: `${item.id} · ${choice || "workflow complete"} · audit event written.` }); reset(); }}>Confirm action</button>}</div>
  </Modal>;
}

export function LivenessDrawer({ item, onClose, onRerun }: { item: KycCase | null; onClose: () => void; onRerun: () => void }) {
  if (!item) return null;
  return <Drawer open onClose={onClose} icon="bi-person-bounding-box" tone="violet" title="Biometric & liveness result" subtitle={`${item.name} · BIO-${item.id.slice(-4)}`} footer={<><button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => jsonDownload(`${item.id}-biometric.json`, item)}>Export evidence</button><button className="btn btn-primary btn-sm" onClick={onRerun}>Re-run checks</button></>}>
    <div className="pm-card pm-card-pad mb-3 text-center"><div className="d-flex justify-content-around"><div><div className="pm-eyebrow">Liveness</div><div style={{ font: "800 2rem Sora" }}>{item.liveness}%</div></div><div><div className="pm-eyebrow">Face match</div><div style={{ font: "800 2rem Sora" }}>{item.faceMatch}%</div></div></div></div>
    {["Passive liveness model", "Replay-attack detection", "Face embedding similarity", "Lighting & occlusion", "Deepfake classifier"].map((x, i) => <div className="pm-card pm-card-pad mb-2" key={x}><div className="d-flex justify-content-between"><span style={{ fontWeight: 700 }}>{x}</span><Badge tone={i === 3 && item.liveness < 75 ? "amber" : "green"}>{i === 3 && item.liveness < 75 ? "Review" : "Pass"}</Badge></div><Meter value={Math.max(55, item.liveness - i * 2)} width={420} /></div>)}
  </Drawer>;
}

export function ScreeningDrawer({ item, onClose, onEscalate }: { item: KycCase | null; onClose: () => void; onEscalate: () => void }) {
  if (!item) return null;
  const possible = item.sanctions !== "Clear" || item.pep !== "Clear";
  return <Drawer open onClose={onClose} wide icon="bi-globe2" tone={possible ? "red" : "green"} title="Sanctions, PEP & adverse media" subtitle={`${item.name} · screened against 18 global sources`} footer={<><button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => jsonDownload(`${item.id}-screening.json`, item)}>Download report</button>{possible && <button className="btn btn-danger btn-sm" onClick={onEscalate}>Escalate match</button>}</>}>
    <div className="row g-2 mb-3">{[{ l: "Sanctions", v: item.sanctions }, { l: "PEP", v: item.pep }, { l: "Adverse media", v: item.riskScore > 70 ? "2 possible hits" : "Clear" }, { l: "Jurisdiction", v: item.nationality }].map((x) => <div className="col-6" key={x.l}><div className="pm-stat"><div className="pm-stat-label">{x.l}</div><div style={{ fontWeight: 800 }}>{x.v}</div></div></div>)}</div>
    <div className="pm-card pm-table-wrap"><table className="pm-table"><thead><tr><th>Source</th><th>Match</th><th>Confidence</th><th>Disposition</th></tr></thead><tbody>{["OFAC SDN", "UN Consolidated", "UK HMT", "EU Financial Sanctions", "World-Check PEP", "Kenya Gazette", "Adverse media"].map((s, i) => { const hit = possible && i === (item.riskScore % 5); return <tr key={s}><td className="pm-td-strong">{s}</td><td>{hit ? item.name : "No match"}</td><td><Meter value={hit ? 86 : 4 + i} tone={hit ? "#f04438" : "#12b76a"} width={100} /></td><td><Badge tone={hit ? "red" : "green"}>{hit ? "Manual decision" : "Clear"}</Badge></td></tr>; })}</tbody></table></div>
  </Drawer>;
}

export function DuplicateDrawer({ item, onClose }: { item: KycCase | null; onClose: () => void }) {
  if (!item) return null;
  const matches = KYC_CASES.filter((x) => x.id !== item.id).slice(0, item.duplicate > 60 ? 5 : 2);
  return <Drawer open onClose={onClose} icon="bi-diagram-3" tone={item.duplicate > 60 ? "red" : "blue"} title="Duplicate identity graph" subtitle={`${item.duplicate}% duplicate confidence · ${matches.length} linked profiles`}>
    <div className="pm-card pm-card-pad mb-3"><div className="d-flex justify-content-between"><div><div className="pm-eyebrow">Duplicate score</div><div style={{ font: "800 1.5rem Sora" }}>{item.duplicate}%</div></div><i className="bi bi-diagram-3" style={{ fontSize: "2rem", color: "#7a5af8" }} /></div><Meter value={item.duplicate} tone={item.duplicate > 60 ? "#f04438" : "#12b76a"} width={430} /></div>
    {matches.map((x, i) => <div className="pm-alert-row mb-2" key={x.id}><Avatar name={x.name} /><div className="flex-grow-1"><div style={{ fontWeight: 700 }}>{x.name}</div><div className="pm-td-sub mono">{x.userId} · {x.phone}</div><div className="d-flex gap-1 mt-1"><Badge tone="violet">{i % 2 ? "Shared device" : "Face similarity"}</Badge><Badge tone="amber">{78 - i * 7}% confidence</Badge></div></div></div>)}
  </Drawer>;
}

export function BulkDecisionModal({ open, count, onClose, onDone }: { open: boolean; count: number; onClose: () => void; onDone: (action: string) => void }) {
  const [action, setAction] = useState("assign"); const [note, setNote] = useState(""); const [code, setCode] = useState("");
  const destructive = action === "approve" || action === "reject";
  return <Modal open={open} onClose={onClose} tone="amber" icon="bi-check2-square" size="md" title={`Bulk action on ${count} KYC cases`} subtitle="One audit event is written per case."><div className="pm-modal-body"><div className="d-flex flex-column gap-2 mb-3">{[["assign", "Assign reviewer"], ["info", "Request more information"], ["rerun", "Re-run screening"], ["approve", "Approve all clear cases"], ["reject", "Reject selected cases"]].map(([v, l]) => <button className={`pm-opt ${action === v ? "active" : ""}`} key={v} onClick={() => setAction(v)}><span className="r" /><span style={{ fontWeight: 700 }}>{l}</span></button>)}</div><label className="form-label">Batch note</label><textarea className="form-control mb-3" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />{destructive && <TwoFactorField value={code} onChange={setCode} />}</div><div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button><button className={`btn ${action === "reject" ? "btn-danger" : "btn-primary"} btn-sm`} disabled={destructive && code !== "482913"} onClick={() => { onDone(action); onClose(); }}>Apply to {count}</button></div></Modal>;
}

export interface KycFilters { q: string; state: string; risk: string; reviewer: string; source: string; tier: string; age: string; screening: string; }
export const EMPTY_KYC_FILTERS: KycFilters = { q: "", state: "all", risk: "all", reviewer: "all", source: "all", tier: "all", age: "all", screening: "all" };
export function FilterDrawer({ open, value, onClose, onApply }: { open: boolean; value: KycFilters; onClose: () => void; onApply: (f: KycFilters) => void }) {
  const [f, setF] = useState(value); const select = (key: keyof KycFilters, label: string, options: string[]) => <div><label className="form-label">{label}</label><select className="form-select" value={f[key]} onChange={(e) => setF({ ...f, [key]: e.target.value })}><option value="all">All</option>{options.map((x) => <option key={x}>{x}</option>)}</select></div>;
  return <Drawer open={open} onClose={onClose} icon="bi-funnel-fill" tone="blue" title="Advanced KYC filters" subtitle="Build a precise manual-review queue." footer={<><button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => { setF(EMPTY_KYC_FILTERS); onApply(EMPTY_KYC_FILTERS); }}>Clear all</button><button className="btn btn-primary btn-sm" onClick={() => { onApply(f); onClose(); }}>Apply filters</button></>}><div className="d-flex flex-column gap-3">{select("state", "Case state", ["Pending", "In review", "Escalated", "Approved", "Rejected", "More info"])}{select("risk", "Risk band", ["Low", "Medium", "High", "Critical"])}{select("reviewer", "Reviewer", ["Unassigned", "David Kiplagat", "Mary Wanjiku", "Cynthia Awuor", "James Odhiambo"])}{select("source", "Submission source", ["App", "Web", "Agent", "API"])}{select("tier", "Requested tier", ["Tier 1", "Tier 2", "Tier 3", "Business"])}{select("age", "Queue age", ["Under 2h", "2h - 24h", "Over 24h"])}{select("screening", "Screening", ["Clear", "Possible match", "Confirmed match"])}</div></Drawer>;
}

export function SavedViewsDrawer({ open, views, onClose, onApply, onDelete }: { open: boolean; views: SavedKycView[]; onClose: () => void; onApply: (v: SavedKycView) => void; onDelete: (id: string) => void }) {
  return <Drawer open={open} onClose={onClose} icon="bi-bookmarks" tone="blue" title="Saved KYC queues" subtitle={`${views.length} reusable compliance views`}>
    {views.map((v) => <div className="pm-alert-row info mb-2" key={v.id}><button className="border-0 bg-transparent text-start flex-grow-1" onClick={() => { onApply(v); onClose(); }}><div style={{ fontWeight: 700 }}>{v.name}</div><div className="pm-td-sub mono">{v.query} · {num(v.count)} cases</div><div className="d-flex gap-1 mt-1"><Badge tone="grey">{v.owner}</Badge>{v.shared && <Badge tone="blue">Shared</Badge>}</div></button><button className="btn btn-sm btn-outline-secondary" onClick={() => onDelete(v.id)}><i className="bi bi-trash" /></button></div>)}
  </Drawer>;
}

export function SaveViewModal({ open, query, onClose, onSave }: { open: boolean; query: string; onClose: () => void; onSave: (v: SavedKycView) => void }) {
  const [name, setName] = useState(""); const [shared, setShared] = useState(true);
  return <Modal open={open} onClose={onClose} tone="green" icon="bi-bookmark-plus" size="sm" title="Save review queue" subtitle="Preserve filters for future compliance reviews."><div className="pm-modal-body"><label className="form-label">View name</label><input className="form-control mb-3" value={name} onChange={(e) => setName(e.target.value)} /><label className="pm-opt"><input className="form-check-input mt-0" type="checkbox" checked={shared} onChange={(e) => setShared(e.target.checked)} /><span style={{ fontWeight: 700 }}>Share with compliance admins</span></label><div className="pm-note mt-3 mono">{query || "No advanced filters"}</div></div><div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button><button className="btn btn-primary btn-sm" disabled={name.length < 3} onClick={() => { onSave({ id: `KV-${Date.now()}`, name, query, count: Math.floor(Math.random() * 300), owner: "Joseph Mwangi", shared }); onClose(); }}>Save queue</button></div></Modal>;
}

export function ExportModal({ open, count, rows, onClose }: { open: boolean; count: number; rows: KycCase[]; onClose: () => void }) {
  const { push } = useToast(); const [format, setFormat] = useState("csv"); const [pii, setPii] = useState(false);
  return <Modal open={open} onClose={onClose} tone="blue" icon="bi-download" size="sm" title={`Export ${num(count)} KYC cases`} subtitle="Permission-gated regulator evidence export."><div className="pm-modal-body"><label className="form-label">Format</label><div className="d-flex gap-1 mb-3">{["csv", "json", "pdf"].map((f) => <button key={f} className={`pm-chip ${format === f ? "active" : ""}`} onClick={() => setFormat(f)}>{f.toUpperCase()}</button>)}</div><label className="pm-opt"><input type="checkbox" className="form-check-input mt-0" checked={pii} onChange={(e) => setPii(e.target.checked)} /><span className="flex-grow-1"><b>Include PII</b><span className="d-block pm-td-sub">Name, email, phone and document numbers</span></span><Badge tone="red">Sensitive</Badge></label></div><div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button><button className="btn btn-primary btn-sm" onClick={() => { const data = rows.map((r) => pii ? r : { id: r.id, state: r.state, risk: r.risk, reviewer: r.reviewer, ageHours: r.ageHours }); format === "json" ? jsonDownload("kyc-review-export.json", data) : csvDownload("kyc-review-export.csv", data as unknown as Record<string, unknown>[]); push({ kind: "success", title: "KYC export generated", body: `${count} cases · ${pii ? "PII included" : "PII redacted"}.` }); onClose(); }}>Download</button></div></Modal>;
}

export function QueueSettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast(); const [sla, setSla] = useState("24"); const [auto, setAuto] = useState("92"); const [dual, setDual] = useState(true);
  return <Modal open={open} onClose={onClose} tone="violet" icon="bi-sliders" size="md" title="KYC queue policy" subtitle="Super Admin controls for routing and automated decisions."><div className="pm-modal-body"><label className="form-label">Manual review SLA (hours)</label><input type="number" className="form-control mb-3" value={sla} onChange={(e) => setSla(e.target.value)} /><label className="form-label">Auto-clear minimum evidence score</label><input type="number" className="form-control mb-3" value={auto} onChange={(e) => setAuto(e.target.value)} /><label className="pm-opt"><input type="checkbox" className="form-check-input mt-0" checked={dual} onChange={(e) => setDual(e.target.checked)} /><span><b>Dual approval for sanctions hits</b><span className="d-block pm-td-sub">Compliance Officer plus Tier 0/1 admin</span></span></label></div><div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button><button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "KYC policy updated", body: `${sla}h SLA · ${auto}% auto-clear · dual approval ${dual ? "on" : "off"}.` }); onClose(); }}>Publish policy</button></div></Modal>;
}

export function NewCaseModal({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (item: KycCase) => void }) {
  const { push } = useToast(); const [userId, setUserId] = useState(""); const [tier, setTier] = useState("Tier 2"); const [reason, setReason] = useState("");
  return <Modal open={open} onClose={onClose} tone="green" icon="bi-plus-circle" size="sm" title="Open manual KYC case" subtitle="Create a supervised review for an existing user."><div className="pm-modal-body"><label className="form-label">User ID</label><input className="form-control mb-3 mono" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="USR-89234" /><label className="form-label">Requested tier</label><select className="form-select mb-3" value={tier} onChange={(e) => setTier(e.target.value)}>{["Tier 1", "Tier 2", "Tier 3", "Business"].map((x) => <option key={x}>{x}</option>)}</select><label className="form-label">Reason</label><textarea className="form-control" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} /></div><div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button><button className="btn btn-primary btn-sm" disabled={userId.length < 5 || reason.length < 5} onClick={() => { const base = KYC_CASES[0]; onCreate({ ...base, id: `KYC-${Date.now().toString().slice(-7)}`, userId, name: "Manual Review User", tier: tier as KycCase["tier"], state: "Pending", reviewer: "Joseph Mwangi", flags: [reason] }); push({ kind: "success", title: "Manual case opened", body: `${userId} added to your review queue.` }); onClose(); }}>Open case</button></div></Modal>;
}

export function AuditDrawer({ item, open, onClose }: { item: KycCase | null; open: boolean; onClose: () => void }) {
  if (!item) return null;
  return <Drawer open={open} onClose={onClose} icon="bi-clock-history" tone="blue" title="Case audit trail" subtitle={`${item.id} · append-only evidence history`}><div className="pm-timeline">{["Case submitted", "Onfido checks completed", "Sanctions screening completed", "Risk score calculated", "Reviewer assigned", "Case opened by Joseph Mwangi"].map((x, i) => <div className={`pm-tl-item ${i < 4 ? "done" : i === 4 ? "warn" : ""}`} key={x}><div style={{ fontWeight: 700 }}>{x}</div><div className="pm-td-sub">{i * 7 + 2} minutes after submission · service/admin identity retained</div><div className="mono" style={{ fontSize: ".68rem", color: "#98a2b3" }}>AUD-KYC-{item.id.slice(-4)}-{i + 1}</div></div>)}</div></Drawer>;
}

void SAVED_KYC_VIEWS;