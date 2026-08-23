import { useMemo, useState } from "react";
import { Avatar, Badge, DDItem, Dropdown, EmptyState, Meter, Pagination, useToast } from "../../../components/ui";
import { csvDownload, num } from "../../../lib/format";
import {
  KYC_CASES, KYC_STATS, QUEUE_HEALTH, REVIEW_ACTIVITY, SAVED_KYC_VIEWS, SLA_BUCKETS,
  type KycCase, type KycDocument, type SavedKycView,
} from "../data/kycData";
import {
  AuditDrawer, BulkDecisionModal, CaseDrawer, DecisionWizard, DocumentModal, DuplicateDrawer,
  EMPTY_KYC_FILTERS, ExportModal, FilterDrawer, LivenessDrawer, NewCaseModal, QueueSettingsModal,
  SaveViewModal, SavedViewsDrawer, ScreeningDrawer, type KycFilters,
} from "../modals/KycModals";

const riskTone = (risk: string) => risk === "Critical" ? "red" : risk === "High" ? "amber" : risk === "Medium" ? "blue" : "green";
const stateTone = (state: string) => state === "Approved" || state === "Verified" || state === "Clear" ? "green" : state === "Rejected" || state.includes("Confirmed") ? "red" : state === "Pending" || state === "Review" || state === "More info" ? "amber" : "blue";
type DecisionKind = "approve" | "reject" | "info" | "escalate" | "rerun" | "assign";

export function KycVerification({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  const { push } = useToast();
  void signal;
  const [cases, setCases] = useState<KycCase[]>(KYC_CASES);
  const [views, setViews] = useState<SavedKycView[]>(SAVED_KYC_VIEWS);
  const [filters, setFilters] = useState<KycFilters>(EMPTY_KYC_FILTERS);
  const [tab, setTab] = useState("All");
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [sort, setSort] = useState<{ key: keyof KycCase; dir: 1 | -1 }>({ key: "ageHours", dir: -1 });

  const [activeCase, setActiveCase] = useState<KycCase | null>(null);
  const [document, setDocument] = useState<KycDocument | null>(null);
  const [decision, setDecision] = useState<{ kind: DecisionKind; item: KycCase } | null>(null);
  const [liveness, setLiveness] = useState<KycCase | null>(null);
  const [screening, setScreening] = useState<KycCase | null>(null);
  const [duplicate, setDuplicate] = useState<KycCase | null>(null);
  const [audit, setAudit] = useState<KycCase | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);

  const filtered = useMemo(() => {
    let rows = cases;
    if (tab !== "All") rows = rows.filter((c) => c.state === tab);
    if (filters.q) rows = rows.filter((c) => (c.name + c.id + c.userId + c.phone + c.email).toLowerCase().includes(filters.q.toLowerCase()));
    if (filters.state !== "all") rows = rows.filter((c) => c.state === filters.state);
    if (filters.risk !== "all") rows = rows.filter((c) => c.risk === filters.risk);
    if (filters.reviewer !== "all") rows = rows.filter((c) => c.reviewer === filters.reviewer);
    if (filters.source !== "all") rows = rows.filter((c) => c.source === filters.source);
    if (filters.tier !== "all") rows = rows.filter((c) => c.tier === filters.tier);
    if (filters.age !== "all") rows = rows.filter((c) => filters.age === "Under 2h" ? c.ageHours < 2 : filters.age === "2h - 24h" ? c.ageHours >= 2 && c.ageHours <= 24 : c.ageHours > 24);
    if (filters.screening !== "all") rows = rows.filter((c) => c.sanctions === filters.screening || c.pep === filters.screening);
    return [...rows].sort((a, b) => {
      const av = a[sort.key], bv = b[sort.key];
      return (typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv))) * sort.dir;
    });
  }, [cases, filters, tab, sort]);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const activeFilters = Object.entries(filters).filter(([k, v]) => k === "q" ? Boolean(v) : v !== "all" && v !== "").length;
  const query = Object.entries(filters).filter(([, v]) => v !== "all" && v !== "").map(([k, v]) => `${k}=${v}`).join(", ");
  const tabs = ["All", "Pending", "In review", "Escalated", "More info", "Approved", "Rejected"];

  const updateCase = (id: string, patch: Partial<KycCase>) => {
    setCases((list) => list.map((c) => c.id === id ? { ...c, ...patch } : c));
    setActiveCase((c) => c?.id === id ? { ...c, ...patch } : c);
  };
  const openAction = (kind: DecisionKind, item: KycCase) => { setActiveCase(null); setDecision({ kind, item }); };
  const completeDecision = (kind: DecisionKind, payload: string) => {
    if (!decision) return;
    const patch: Partial<KycCase> = kind === "approve" ? { state: "Approved" } : kind === "reject" ? { state: "Rejected" }
      : kind === "info" ? { state: "More info" } : kind === "escalate" ? { state: "Escalated" }
      : kind === "assign" ? { reviewer: payload, state: "In review" } : { state: "In review", liveness: Math.min(99, decision.item.liveness + 5), faceMatch: Math.min(99, decision.item.faceMatch + 4) };
    updateCase(decision.item.id, patch);
  };
  const sortBy = (key: keyof KycCase) => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : -1 }));

  return <>
    {/* Header */}
    <div className="pm-section-head" style={{ marginTop: 0 }}>
      <div><div className="d-flex gap-2 align-items-center mb-1"><span className="pm-eyebrow">User management · Page 6</span><span className="pm-live"><span className="pm-dot green pm-pulse" />ONFIDO LIVE</span></div>
        <h2>KYC & Identity Verification</h2><p>Review identity evidence, liveness, sanctions and duplicate signals; approve, reject or escalate with complete super-admin governance.</p></div>
      <div className="d-flex gap-2 flex-wrap">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => setFilterOpen(true)}><i className="bi bi-funnel me-1" />Filters {activeFilters > 0 && <Badge tone="green">{activeFilters}</Badge>}</button>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => setSavedOpen(true)}><i className="bi bi-bookmarks me-1" />Saved queues</button>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => setExportOpen(true)}><i className="bi bi-download me-1" />Export</button>
        <Dropdown width={240} trigger={() => <button className="btn btn-outline-secondary btn-sm"><i className="bi bi-three-dots" /></button>}>
          {(close) => <><DDItem icon="bi-bookmark-plus" label="Save current queue" onClick={() => { close(); setSaveOpen(true); }} /><DDItem icon="bi-sliders" label="Queue policy" hint="Super Admin" onClick={() => { close(); setSettingsOpen(true); }} /><DDItem icon="bi-file-earmark-spreadsheet" label="Export regulator evidence" onClick={() => { close(); setExportOpen(true); }} /><DDItem icon="bi-person-lines-fill" label="Open User Directory" onClick={() => { close(); onNavigate("user-directory"); }} /></>}
        </Dropdown>
        <button className="btn btn-primary btn-sm" onClick={() => setNewOpen(true)}><i className="bi bi-plus-lg me-1" />Manual case</button>
      </div>
    </div>

    {/* KPI summary */}
    <div className="row g-2 mb-3">{KYC_STATS.map((s) => <div className="col-6 col-md-4 col-xl-2" key={s.label}><div className="pm-stat"><div className="d-flex align-items-center gap-2"><span className={`pm-stat-ico`} style={{ background: s.tone === "green" ? "#e7f8ef" : s.tone === "red" ? "#fef2f2" : s.tone === "amber" ? "#fff5e6" : "#eff8ff", color: s.tone === "green" ? "#0b8f52" : s.tone === "red" ? "#d92d20" : s.tone === "amber" ? "#b54708" : "#175cd3" }}><i className={`bi ${s.icon}`} /></span><span className="pm-stat-label">{s.label}</span></div><div className="pm-stat-value">{s.value}</div><div className="pm-stat-foot">{s.note}</div></div></div>)}</div>

    {/* Queue health + SLA */}
    <div className="row g-3 mb-3"><div className="col-xl-8"><div className="pm-card h-100"><div className="pm-card-head"><div><h6 className="pm-card-title">Queue composition</h6><p className="pm-card-sub">Today · 1,614 completed checks and 347 waiting</p></div><Badge tone="green">93.1% auto-clear</Badge></div><div className="pm-card-pad">
      <div className="pm-bar-track mb-3" style={{ height: 34 }}>{QUEUE_HEALTH.map((q) => <div key={q.label} title={`${q.label}: ${q.count}`} style={{ width: `${q.pct}%`, background: q.color }} />)}</div>
      <div className="row g-2">{QUEUE_HEALTH.map((q) => <div className="col-6 col-md" key={q.label}><button className="border-0 bg-transparent text-start w-100" onClick={() => { if (q.label.includes("Sanctions")) setFilters({ ...filters, screening: "Possible match" }); else if (q.label.includes("information")) setTab("More info"); }}><span className="pm-legend-dot me-1" style={{ background: q.color }} /><span style={{ fontWeight: 700, fontSize: ".76rem" }}>{q.label}</span><div className="pm-td-sub">{num(q.count)} · {q.pct}%</div></button></div>)}</div>
    </div></div></div><div className="col-xl-4"><div className="pm-card h-100"><div className="pm-card-head"><div><h6 className="pm-card-title">SLA health</h6><p className="pm-card-sub">Manual review age buckets</p></div><Badge tone="amber">9 breached</Badge></div><div className="pm-card-pad">{SLA_BUCKETS.map((s) => <button key={s.bucket} className="d-flex gap-2 align-items-center border-0 bg-transparent w-100 py-1" onClick={() => { setFilters({ ...filters, age: s.bucket === "Under 15 min" ? "Under 2h" : s.bucket === "Over 24h" ? "Over 24h" : "2h - 24h" }); setPage(1); }}><span style={{ width: 100, fontSize: ".75rem", fontWeight: 600 }}>{s.bucket}</span><Meter value={s.pct} tone={s.tone === "green" ? "#12b76a" : s.tone === "red" ? "#f04438" : s.tone === "amber" ? "#f79009" : "#2e90fa"} width={180} /><span className="pm-num">{s.cases}</span></button>)}</div></div></div></div>

    {/* Review queue */}
    <div className="pm-section-head"><div><h2>Identity review queue</h2><p>36 representative cases with complete evidence, screening, ownership and decision controls.</p></div>{selected.length > 0 && <button className="btn btn-outline-primary btn-sm" onClick={() => setBulkOpen(true)}><i className="bi bi-check2-square me-1" />Bulk action ({selected.length})</button>}</div>
    <div className="pm-card">
      <div className="pm-tabs">{tabs.map((t) => <button key={t} className={`pm-tab ${tab === t ? "active" : ""}`} onClick={() => { setTab(t); setPage(1); }}>{t}<span className="cnt">{t === "All" ? cases.length : cases.filter((c) => c.state === t).length}</span></button>)}</div>
      <div className="pm-card-head"><div className="pm-search flex-grow-1" style={{ maxWidth: 420 }}><i className="bi bi-search" /><input placeholder="Case, user, name, phone or email..." value={filters.q} onChange={(e) => { setFilters({ ...filters, q: e.target.value }); setPage(1); }} /></div><div className="d-flex gap-2"><span style={{ fontSize: ".75rem", color: "var(--pm-muted)", alignSelf: "center" }}>{num(filtered.length)} cases</span><button className="btn btn-sm btn-outline-secondary" onClick={() => setFilterOpen(true)}><i className="bi bi-funnel" /></button></div></div>
      {selected.length > 0 && <div className="pm-bulkbar"><b>{selected.length} selected</b><button className="btn btn-light btn-sm" onClick={() => setBulkOpen(true)}>Bulk decision</button><button className="btn btn-light btn-sm" onClick={() => { csvDownload("selected-kyc.csv", cases.filter((c) => selected.includes(c.id)) as unknown as Record<string, unknown>[]); push({ kind: "success", title: "Selection exported" }); }}>Export</button><button className="btn btn-outline-light btn-sm ms-auto" onClick={() => setSelected([])}>Clear</button></div>}
      <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th><input className="form-check-input" type="checkbox" checked={paged.length > 0 && selected.length === paged.length} onChange={(e) => setSelected(e.target.checked ? paged.map((c) => c.id) : [])} /></th>
        {[{ k: "name", l: "Applicant" }, { k: "submitted", l: "Submitted" }, { k: "tier", l: "Tier" }, { k: "liveness", l: "Liveness" }, { k: "sanctions", l: "Screening" }, { k: "duplicate", l: "Duplicate" }, { k: "riskScore", l: "Risk" }, { k: "reviewer", l: "Reviewer" }, { k: "state", l: "State" }].map((h) => <th key={h.k} className="cursor-pointer" onClick={() => sortBy(h.k as keyof KycCase)}>{h.l} {sort.key === h.k && <i className={`bi bi-caret-${sort.dir === 1 ? "up" : "down"}-fill`} />}</th>)}<th /></tr></thead><tbody>
        {paged.map((c) => <tr key={c.id} className={selected.includes(c.id) ? "selected" : ""} onClick={() => setActiveCase(c)}><td onClick={(e) => e.stopPropagation()}><input className="form-check-input" type="checkbox" checked={selected.includes(c.id)} onChange={(e) => setSelected(e.target.checked ? [...selected, c.id] : selected.filter((x) => x !== c.id))} /></td>
          <td><div className="d-flex align-items-center gap-2"><Avatar name={c.name} size="sm" /><div><div className="pm-td-strong">{c.name}</div><div className="pm-td-sub mono">{c.id} · {c.userId} · {c.county}</div></div></div></td>
          <td><span style={{ fontSize: ".76rem" }}>{c.submitted}</span><div className="pm-td-sub" style={{ color: c.ageHours > 24 ? "#d92d20" : undefined }}>{c.ageHours}h in queue</div></td><td><Badge tone="violet">{c.tier}</Badge><div className="pm-td-sub">{c.source}</div></td>
          <td><button className="border-0 bg-transparent" onClick={(e) => { e.stopPropagation(); setLiveness(c); }}><Meter value={c.liveness} width={60} tone={c.liveness > 85 ? "#12b76a" : "#f79009"} /><span className="pm-num">{c.liveness}%</span></button></td>
          <td><button className="border-0 bg-transparent" onClick={(e) => { e.stopPropagation(); setScreening(c); }}><Badge tone={stateTone(c.sanctions)}>{c.sanctions}</Badge><div className="pm-td-sub">PEP: {c.pep}</div></button></td>
          <td><button className="border-0 bg-transparent" onClick={(e) => { e.stopPropagation(); setDuplicate(c); }}><Meter value={c.duplicate} width={56} tone={c.duplicate > 60 ? "#f04438" : "#12b76a"} /><span className="pm-num">{c.duplicate}%</span></button></td>
          <td><Badge tone={riskTone(c.risk)}>{c.risk} {c.riskScore}</Badge>{c.flags.length > 0 && <div className="pm-td-sub">{c.flags[0]}</div>}</td><td style={{ fontSize: ".75rem" }}>{c.reviewer}</td><td><Badge tone={stateTone(c.state)} dot>{c.state}</Badge></td>
          <td onClick={(e) => e.stopPropagation()}><Dropdown up width={245} trigger={() => <button className="pm-icon-btn" style={{ width: 28, height: 28 }}><i className="bi bi-three-dots-vertical" /></button>}>{(close) => <><DDItem icon="bi-eye" label="Open review cockpit" onClick={() => { close(); setActiveCase(c); }} /><DDItem icon="bi-check2-circle" label="Approve" onClick={() => { close(); openAction("approve", c); }} /><DDItem icon="bi-x-octagon" label="Reject" onClick={() => { close(); openAction("reject", c); }} /><DDItem icon="bi-envelope-paper" label="Request information" onClick={() => { close(); openAction("info", c); }} /><DDItem icon="bi-person-check" label="Assign reviewer" onClick={() => { close(); openAction("assign", c); }} /><DDItem icon="bi-arrow-up-right-circle" label="Escalate" onClick={() => { close(); openAction("escalate", c); }} /><DDItem icon="bi-clock-history" label="Audit trail" onClick={() => { close(); setAudit(c); }} /><DDItem icon="bi-person-badge" label="Open user profile (Page 5)" onClick={() => { close(); onNavigate("user-detail"); }} /></>}</Dropdown></td></tr>)}
        {paged.length === 0 && <tr><td colSpan={11}><EmptyState icon="bi-patch-check" title="No KYC cases match this queue" body="Clear filters or choose a different state." action={<button className="btn btn-outline-secondary btn-sm" onClick={() => { setFilters(EMPTY_KYC_FILTERS); setTab("All"); }}>Clear filters</button>} /></td></tr>}
      </tbody></table></div><Pagination page={page} pageSize={pageSize} total={filtered.length} onPage={setPage} onPageSize={setPageSize} />
    </div>

    {/* Recent activity */}
    <div className="pm-section-head"><div><h2>Compliance activity</h2><p>Recent manual decisions and evidence changes across the KYC operation.</p></div><button className="btn btn-outline-secondary btn-sm" onClick={() => csvDownload("kyc-activity.csv", REVIEW_ACTIVITY as unknown as Record<string, unknown>[])}><i className="bi bi-download me-1" />Export audit</button></div>
    <div className="pm-card mb-4"><div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>When</th><th>Admin</th><th>Action</th><th>Case</th><th>Evidence</th><th /></tr></thead><tbody>{REVIEW_ACTIVITY.map((a) => <tr key={a.id} onClick={() => { const c = cases.find((x) => x.id === a.caseId); if (c) setAudit(c); }}><td>{a.time}<div className="pm-td-sub mono">{a.id}</div></td><td><div className="d-flex gap-2 align-items-center"><Avatar name={a.admin} size="sm" /><span>{a.admin}</span></div></td><td><Badge tone={a.action.includes("Rejected") || a.action.includes("Escalated") ? "amber" : "green"}>{a.action}</Badge></td><td className="mono">{a.caseId}</td><td>{a.detail}</td><td><i className="bi bi-chevron-right" /></td></tr>)}</tbody></table></div></div>

    {/* Interactions */}
    <CaseDrawer item={activeCase} onClose={() => setActiveCase(null)} onAction={(a, c) => openAction(a as DecisionKind, c)} onDocument={setDocument} />
    <DocumentModal doc={document} item={activeCase ?? decision?.item ?? cases.find((c) => c.documents.some((d) => d.id === document?.id)) ?? null} onClose={() => setDocument(null)} onDecision={(state) => { if (document) { setCases((list) => list.map((c) => ({ ...c, documents: c.documents.map((d) => d.id === document.id ? { ...d, state } : d) }))); push({ kind: state === "Rejected" ? "warn" : "success", title: `Document ${state.toLowerCase()}` }); } setDocument(null); }} />
    <DecisionWizard kind={decision?.kind ?? null} item={decision?.item ?? null} onClose={() => setDecision(null)} onDone={completeDecision} />
    <LivenessDrawer item={liveness} onClose={() => setLiveness(null)} onRerun={() => { if (liveness) { setLiveness(null); setDecision({ kind: "rerun", item: liveness }); } }} />
    <ScreeningDrawer item={screening} onClose={() => setScreening(null)} onEscalate={() => { if (screening) { setScreening(null); setDecision({ kind: "escalate", item: screening }); } }} />
    <DuplicateDrawer item={duplicate} onClose={() => setDuplicate(null)} />
    <AuditDrawer item={audit} open={Boolean(audit)} onClose={() => setAudit(null)} />
    <BulkDecisionModal open={bulkOpen} count={selected.length} onClose={() => setBulkOpen(false)} onDone={(action) => { const patch: Partial<KycCase> = action === "approve" ? { state: "Approved" } : action === "reject" ? { state: "Rejected" } : action === "info" ? { state: "More info" } : action === "assign" ? { reviewer: "Joseph Mwangi", state: "In review" } : { state: "In review" }; setCases((list) => list.map((c) => selected.includes(c.id) ? { ...c, ...patch } : c)); push({ kind: "success", title: `${action} applied to ${selected.length} cases` }); setSelected([]); }} />
    <FilterDrawer open={filterOpen} value={filters} onClose={() => setFilterOpen(false)} onApply={(f) => { setFilters(f); setPage(1); }} />
    <SavedViewsDrawer open={savedOpen} views={views} onClose={() => setSavedOpen(false)} onApply={(v) => { if (v.query.includes("Critical")) setFilters({ ...EMPTY_KYC_FILTERS, risk: "Critical" }); else if (v.query.includes("24h")) setFilters({ ...EMPTY_KYC_FILTERS, age: "Over 24h" }); else if (v.query.includes("Business")) setFilters({ ...EMPTY_KYC_FILTERS, tier: "Business" }); }} onDelete={(id) => setViews((list) => list.filter((v) => v.id !== id))} />
    <SaveViewModal open={saveOpen} query={query} onClose={() => setSaveOpen(false)} onSave={(v) => setViews((list) => [v, ...list])} />
    <ExportModal open={exportOpen} count={filtered.length} rows={filtered} onClose={() => setExportOpen(false)} />
    <QueueSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    <NewCaseModal open={newOpen} onClose={() => setNewOpen(false)} onCreate={(c) => setCases((list) => [c, ...list])} />
  </>;
}