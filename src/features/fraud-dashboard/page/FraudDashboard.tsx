import { useEffect, useMemo, useState } from "react";
import { Avatar, Badge, DDItem, Donut, Dropdown, Meter, Pagination, useToast } from "../../../components/ui";
import { csvDownload, kes } from "../../../lib/format";
import { AuthorityPanel } from "../../../components/AuthorityPanel";
import { ALERTS, BLACKLIST_ENTRIES, BLACKLIST_TYPES, CHANNEL_HEAT, DEVICE_HEAT, FRAUD_KPI, FRAUD_RULES, HEAT_DAYS, HEATMAP, LOSSES, PATTERNS, SARS, TEAM, type BlacklistEntry, type FraudAlert, type FraudRule } from "../data/fraudData";
import {
  AlertDrawer, AssignModal, BlacklistModal, BlockModal, EntryDrawer, RuleModal,
  UserTimelineModal, DeviceFingerprintModal, RelatedAccountsModal, EvidenceLockerModal,
  ContactCustomerModal, EscalateModal, DraftSarModal, TransactionDetailModal,
  AccountHistoryModal, GeoLocationModal, RecoveryActionModal, CaseNotesModal,
  InvestigationSummaryModal, FraudPatternModal, FinalResolutionModal, AlertHistoryModal
} from "../modals/FraudModals";
import "../styles/fraud.css";

export function FraudDashboard({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
 const { push } = useToast();
 const [alerts, setAlerts] = useState<FraudAlert[]>(ALERTS);
 const [tab, setTab] = useState("All");
 const [query, setQuery] = useState("");
 const [page, setPage] = useState(1);
 const [focus, setFocus] = useState<FraudAlert | null>(null);
 const [assign, setAssign] = useState<FraudAlert | null>(null);
 const [block, setBlock] = useState<FraudAlert | null>(null);
 const [rule, setRule] = useState<FraudRule | null>(null);
 const [rules, setRules] = useState(FRAUD_RULES);
 const [blacklist, setBlacklist] = useState(BLACKLIST_ENTRIES);
 const [newBlock, setNewBlock] = useState(false);
 const [entry, setEntry] = useState<BlacklistEntry | null>(null);

 // New modal states
 const [timelineAlert, setTimelineAlert] = useState<FraudAlert | null>(null);
 const [deviceAlert, setDeviceAlert] = useState<FraudAlert | null>(null);
 const [accountsAlert, setAccountsAlert] = useState<FraudAlert | null>(null);
 const [evidenceAlert, setEvidenceAlert] = useState<FraudAlert | null>(null);
 const [contactAlert, setContactAlert] = useState<FraudAlert | null>(null);
 const [escalateAlert, setEscalateAlert] = useState<FraudAlert | null>(null);
 const [sarAlert, setSarAlert] = useState<FraudAlert | null>(null);
 const [txnAlert, setTxnAlert] = useState<FraudAlert | null>(null);
 const [historyAlert, setHistoryAlert] = useState<FraudAlert | null>(null);
 const [geoAlert, setGeoAlert] = useState<FraudAlert | null>(null);
 const [recoveryAlert, setRecoveryAlert] = useState<FraudAlert | null>(null);
 const [notesAlert, setNotesAlert] = useState<FraudAlert | null>(null);
 const [summaryAlert, setSummaryAlert] = useState<FraudAlert | null>(null);
 const [patternAlert, setPatternAlert] = useState<FraudAlert | null>(null);
 const [resolutionAlert, setResolutionAlert] = useState<FraudAlert | null>(null);
 const [alertHistoryAlert, setAlertHistoryAlert] = useState<FraudAlert | null>(null);

 useEffect(() => { if (signal.n && signal.action === "fraud") setFocus(alerts[0]); }, [signal]);
 const filtered = useMemo(() => alerts.filter(a => (tab === "All" || a.status === tab) && `${a.id} ${a.user} ${a.type}`.toLowerCase().includes(query.toLowerCase())), [alerts, tab, query]);
 const rows = filtered.slice((page - 1) * 6, page * 6);
 const unassigned = alerts.filter(x => x.assigned === "Unassigned" && x.status !== "Resolved").length;
 const update = (id: string, patch: Partial<FraudAlert>) => setAlerts(a => a.map(x => x.id === id ? { ...x, ...patch } : x));
 const doAssign = (name: string) => { if (assign) { update(assign.id, { assigned: name, status: "In review" }); setAssign(null); setFocus(null); push({ kind: "success", title: "Investigation assigned", body: `${assign.id} is now owned by ${name}.` }); } };
 const doBlock = () => { if (block) { update(block.id, { status: "Escalated" }); setBlock(null); setFocus(null); push({ kind: "warning", title: "Activity blocked", body: `Controls applied for ${block.user}; action logged.` }); } };
 const lossTotal = LOSSES.reduce((s, x) => s + x.amount, 0), recovery = LOSSES.reduce((s, x) => s + x.recovery, 0);

 return (
  <>
   <div className="pm-section-head fraud-top" style={{ marginTop: 0 }}>
    <div>
     <div className="d-flex gap-2 align-items-center mb-1">
      <span className="pm-eyebrow">Fraud & risk · Page 15</span>
      <span className="pm-live"><span className="pm-dot red pm-pulse" />Real-time decisioning</span>
     </div>
     <h2>Fraud command center</h2>
     <p>Protect customers and PayMo funds with live alert triage, loss recovery, rule controls and an auditable blacklist.</p>
    </div>
    <div className="d-flex gap-2 flex-wrap">
     <AuthorityPanel area="Fraud command center" auditRef="AUD-FRD-00015" permissions={["Block and release transactions", "Freeze accounts and cards", "Manage blacklist and fraud rules", "Export protected case data"]} />
     <button className="btn btn-outline-secondary btn-sm" onClick={() => csvDownload("paymo-fraud-alerts.csv", alerts)}><i className="bi bi-download me-1" />Export queue</button>
     <button className="btn btn-outline-secondary btn-sm" onClick={() => onNavigate("sar")}><i className="bi bi-file-earmark-text me-1" />SAR monitoring</button>
     <button className="btn btn-primary btn-sm" onClick={() => setNewBlock(true)}><i className="bi bi-plus-lg me-1" />Blacklist entity</button>
    </div>
   </div>

   <div className="row g-2 mb-3">
    {FRAUD_KPI({ newAlerts: alerts.filter(a => a.status === "New").length, unassigned }).map(s => (
     <div className="col-6 col-md-3" key={s.label}>
      <div className="pm-stat">
       <div className="d-flex gap-2 align-items-center">
        <span className="pm-stat-ico" style={{ background: s.tone === "red" ? "#fef2f2" : s.tone === "amber" ? "#fff5e6" : s.tone === "green" ? "#e7f8ef" : "#f4f1ff", color: s.tone === "red" ? "#d92d20" : s.tone === "amber" ? "#b54708" : s.tone === "green" ? "#0b8f52" : "#5925dc" }}>
         <i className={`bi ${s.icon}`} />
        </span>
        <span className="pm-stat-label">{s.label}</span>
       </div>
       <div className="pm-stat-value">{s.value}</div>
       <div className="pm-stat-foot">{s.note}</div>
      </div>
     </div>
    ))}
   </div>

   <div className="row g-3">
    <div className="col-xl-8">
     <section className="pm-card h-100">
      <div className="pm-card-head">
       <div>
        <h3 className="pm-card-title">Active alert queue <Badge tone="red" className="ms-1">{filtered.filter(a => a.status !== "Resolved").length} live</Badge></h3>
        <p className="pm-card-sub">Critical decisions and evidence remain in one reviewable queue.</p>
       </div>
       <div className="fraud-search"><i className="bi bi-search" /><input value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} placeholder="Search ID, person or signal" /></div>
      </div>
      <div className="pm-tabs">
       {["All", "New", "In review", "Escalated", "Resolved"].map(t => (
        <button key={t} className={`pm-tab ${tab === t ? "active" : ""}`} onClick={() => { setTab(t); setPage(1); }}>
         {t}{t !== "All" && <span className="cnt">{alerts.filter(a => a.status === t).length}</span>}
        </button>
       ))}
      </div>
      <div className="pm-table-wrap">
       <table className="pm-table">
        <thead><tr><th>Alert & customer</th><th>Signal</th><th>Value at risk</th><th>Risk</th><th>Owner / SLA</th><th>Status</th><th /></tr></thead>
        <tbody>
         {rows.map(a => (
          <tr key={a.id} onClick={() => setFocus(a)}>
           <td><b className="pm-td-strong">{a.id}</b><div className="pm-td-sub">{a.user} · {a.userId}</div></td>
           <td><b>{a.type}</b><div className="pm-td-sub">{a.time} · {a.channel}</div></td>
           <td className="pm-num">{kes(a.amount)}</td>
           <td><span className={`fraud-risk ${a.risk >= 80 ? "critical" : a.risk >= 70 ? "high" : "medium"}`}>{a.risk}</span></td>
           <td><b>{a.assigned}</b><div className="pm-td-sub">{a.slaH ? `${a.slaH}h SLA remaining` : "Decision recorded"}</div></td>
           <td><Badge tone={a.status === "New" ? "red" : a.status === "In review" ? "amber" : a.status === "Escalated" ? "violet" : "green"}>{a.status}</Badge></td>
           <td onClick={e => e.stopPropagation()}>
            <Dropdown width={190} trigger={() => <button className="btn btn-light btn-sm"><i className="bi bi-three-dots-vertical" /></button>}>
             {close => <><DDItem icon="bi-eye" label="Review evidence" onClick={() => { close(); setFocus(a); }} /><DDItem icon="bi-person-plus" label="Assign case" onClick={() => { close(); setAssign(a); }} /><DDItem icon="bi-slash-circle" label="Block activity" danger onClick={() => { close(); setBlock(a); }} /></>}
            </Dropdown>
           </td>
          </tr>
         ))}
        </tbody>
       </table>
      </div>
      <Pagination page={page} total={filtered.length} pageSize={6} onPage={setPage} />
     </section>
    </div>

    <div className="col-xl-4">
     <section className="pm-card h-100">
      <div className="pm-card-head">
       <div>
        <h3 className="pm-card-title">Loss & recovery</h3>
        <p className="pm-card-sub">Confirmed fraud · trailing 30 days</p>
       </div>
       <Badge tone="green">67% recovered</Badge>
      </div>
      <div className="fraud-loss">
       <Donut size={148} thickness={22} data={[{ label: "Recovered", value: recovery, color: "#12b76a" }, { label: "Net loss", value: lossTotal - recovery, color: "#f04438" }]} center={<div className="text-center"><b className="d-block" style={{ fontSize: ".9rem" }}>{kes(lossTotal, { compact: true })}</b><small>gross loss</small></div>} />
       <div>{LOSSES.map(x => <div className="fraud-loss-row" key={x.category}><span className="fraud-loss-dot" style={{ background: x.trend === "up" ? "#f04438" : x.trend === "down" ? "#12b76a" : "#f79009" }} /><div className="flex-grow-1"><b>{x.category}</b><small>Recovery {kes(x.recovery, { compact: true })}</small></div><strong>{kes(x.amount - x.recovery, { compact: true })}</strong></div>)}</div>
      </div>
      <div className="fraud-callout">
       <i className="bi bi-lightning-charge-fill" />
       <div><b>Priority recovery opportunity</b><span>Account takeover cases represent 37% of gross fraud. Two holds expire within 41 minutes.</span></div>
       <button className="btn btn-sm btn-outline-primary" onClick={() => setFocus(alerts.find(a => a.type.includes("takeover")) ?? alerts[0])}>Review</button>
      </div>
     </section>
    </div>
   </div>

   {/* Modals */}
   <AlertDrawer alert={focus} onClose={() => setFocus(null)} onAssign={a => { setFocus(null); setAssign(a); }} onBlock={a => { setFocus(null); setBlock(a); }} onResolve={a => { update(a.id, { status: "Resolved" }); setFocus(null); push({ kind: "success", title: "Alert resolved", body: `${a.id} has been closed with an audit record.` }); }} onTimeline={a => { setFocus(null); setTimelineAlert(a); }} onDevice={a => { setFocus(null); setDeviceAlert(a); }} onAccounts={a => { setFocus(null); setAccountsAlert(a); }} onEvidence={a => { setFocus(null); setEvidenceAlert(a); }} onContact={a => { setFocus(null); setContactAlert(a); }} onEscalate={a => { setFocus(null); setEscalateAlert(a); }} onSar={a => { setFocus(null); setSarAlert(a); }} />
   <AssignModal alert={assign} onClose={() => setAssign(null)} onSubmit={doAssign} />
   <BlockModal alert={block} onClose={() => setBlock(null)} onConfirm={doBlock} />
   <RuleModal rule={rule} onClose={() => setRule(null)} onSave={(active) => { if (!rule) return; setRules(rs => rs.map(r => r.id === rule.id ? { ...r, active } : r)); push({ kind: "success", title: "Rule control saved", body: `${rule.id} is ${active ? "active" : "paused"} in production.` }); setRule(null); }} />
   {newBlock && <BlacklistModal onClose={() => setNewBlock(false)} onAdd={(value) => { const e: BlacklistEntry = { id: `BLE-${String(502 + blacklist.length).padStart(4, "0")}`, type: "Device fingerprints", value: value || "New manual entity", reason: "Investigator-managed block", added: "Just now", addedBy: "Jeckonia Kwasa", hits: 0 }; setBlacklist(x => [e, ...x]); setNewBlock(false); push({ kind: "success", title: "Blacklist entry created", body: "The entity is now blocked across applicable channels." }); }} />}
   <EntryDrawer entry={entry} onClose={() => setEntry(null)} onRemove={(e) => { setBlacklist(x => x.filter(a => a.id !== e.id)); setEntry(null); push({ kind: "warning", title: "Blacklist entry removed", body: `${e.id} was removed and retained in the audit trail.` }); }} />
   <UserTimelineModal alert={timelineAlert} onClose={() => setTimelineAlert(null)} />
   <DeviceFingerprintModal alert={deviceAlert} onClose={() => setDeviceAlert(null)} />
   <RelatedAccountsModal alert={accountsAlert} onClose={() => setAccountsAlert(null)} />
   <EvidenceLockerModal alert={evidenceAlert} onClose={() => setEvidenceAlert(null)} />
   <ContactCustomerModal alert={contactAlert} onClose={() => setContactAlert(null)} onSend={() => { setContactAlert(null); push({ kind: "success", title: "Contact sent", body: "Message delivered to customer." }); }} />
   <EscalateModal alert={escalateAlert} onClose={() => setEscalateAlert(null)} onSubmit={() => { setEscalateAlert(null); push({ kind: "success", title: "Escalation submitted", body: "Referral draft sent for Super Admin approval." }); }} />
   <DraftSarModal alert={sarAlert} onClose={() => setSarAlert(null)} onSave={() => { setSarAlert(null); push({ kind: "success", title: "SAR draft created", body: "SAR filed for compliance review and approval." }); }} />
   <TransactionDetailModal alert={txnAlert} onClose={() => setTxnAlert(null)} />
   <AccountHistoryModal alert={historyAlert} onClose={() => setHistoryAlert(null)} />
   <GeoLocationModal alert={geoAlert} onClose={() => setGeoAlert(null)} />
   <RecoveryActionModal alert={recoveryAlert} onClose={() => setRecoveryAlert(null)} onSubmit={() => { setRecoveryAlert(null); push({ kind: "success", title: "Recovery action executed", body: "Transaction hold extended and logged." }); }} />
   <CaseNotesModal alert={notesAlert} onClose={() => setNotesAlert(null)} onSave={(note) => { setNotesAlert(null); push({ kind: "success", title: "Note saved", body: "Investigator note added to case record." }); }} />
   <InvestigationSummaryModal alert={summaryAlert} onClose={() => setSummaryAlert(null)} />
   <FraudPatternModal alert={patternAlert} onClose={() => setPatternAlert(null)} />
   <FinalResolutionModal alert={resolutionAlert} onClose={() => setResolutionAlert(null)} onResolve={(r) => { setResolutionAlert(null); push({ kind: "success", title: "Case resolved", body: `Resolution: ${r}. Case closed with audit record.` }); }} />
   <AlertHistoryModal alert={alertHistoryAlert} onClose={() => setAlertHistoryAlert(null)} />
  </>
 );
}
