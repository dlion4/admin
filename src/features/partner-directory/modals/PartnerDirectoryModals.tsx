import { useState } from "react";
import { Modal, Drawer, Badge, Avatar, useToast } from "../../../components/ui";
import { kes, num } from "../../../lib/format";

/* ============================ 1. Partner profile modal ============================ */
export function PartnerProfileModal({ partner, onClose }: { partner: { name: string; type: string; status: string; volume: string; revenue: string } | null; onClose: () => void }) {
  if (!partner) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-building" tone="blue" title="Partner profile" subtitle={partner.name}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Partner</span><span className="v">{partner.name}</span></div>
        <div className="pm-kv"><span className="k">Type</span><span className="v"><Badge tone="blue">{partner.type}</Badge></span></div>
        <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone={partner.status === "Active" ? "green" : "red"} dot>{partner.status}</Badge></span></div>
        <div className="pm-kv"><span className="k">30d volume</span><span className="v pm-num">{partner.volume}</span></div>
        <div className="pm-kv"><span className="k">Revenue share</span><span className="v pm-num">{partner.revenue}</span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 2. Settlement detail modal ============================ */
export function SettlementDetailModal({ settlement, onClose }: { settlement: { partner: string; payMoOwes: string; partnerOwes: string; net: string; lastSettlement: string; nextSettlement: string } | null; onClose: () => void }) {
  if (!settlement) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-cash-stack" tone="blue" title="Settlement detail" subtitle={settlement.partner}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Partner</span><span className="v">{settlement.partner}</span></div>
        <div className="pm-kv"><span className="k">PayMo owes</span><span className="v pm-num" style={{ fontWeight: 700, color: "#f04438" }}>{settlement.payMoOwes}</span></div>
        <div className="pm-kv"><span className="k">Partner owes</span><span className="v pm-num" style={{ fontWeight: 700, color: "#12b76a" }}>{settlement.partnerOwes}</span></div>
        <div className="pm-kv"><span className="k">Net position</span><span className="v pm-num" style={{ fontWeight: 700 }}>{settlement.net}</span></div>
        <div className="pm-kv"><span className="k">Last settlement</span><span className="v">{settlement.lastSettlement}</span></div>
        <div className="pm-kv"><span className="k">Next settlement</span><span className="v">{settlement.nextSettlement}</span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 3. SLA detail modal ============================ */
export function SlaDetailModal({ sla, onClose }: { sla: { partner: string; metric: string; target: string; actual: string; breaches: number; penalty: string; status: string } | null; onClose: () => void }) {
  if (!sla) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-stopwatch" tone={sla.status === "Watch" ? "amber" : "green"} title="SLA detail" subtitle={sla.partner}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Partner</span><span className="v">{sla.partner}</span></div>
        <div className="pm-kv"><span className="k">Metric</span><span className="v">{sla.metric}</span></div>
        <div className="pm-kv"><span className="k">Target</span><span className="v">{sla.target}</span></div>
        <div className="pm-kv"><span className="k">Actual (30d)</span><span className="v pm-num" style={{ fontWeight: 700 }}>{sla.actual}</span></div>
        <div className="pm-kv"><span className="k">Breaches</span><span className="v pm-num" style={{ color: sla.breaches > 0 ? "#f04438" : "#12b76a" }}>{sla.breaches}</span></div>
        <div className="pm-kv"><span className="k">Penalty</span><span className="v">{sla.penalty}</span></div>
        <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone={sla.status === "Watch" ? "amber" : "green"} dot>{sla.status}</Badge></span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 4. API health modal ============================ */
export function ApiHealthModal({ api, onClose }: { api: { partner: string; endpoint: string; requests: string; errorRate: string; p95: string; p99: string } | null; onClose: () => void }) {
  if (!api) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-heart-pulse" tone="green" title="API health" subtitle={api.partner}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Partner</span><span className="v">{api.partner}</span></div>
        <div className="pm-kv"><span className="k">Endpoint</span><span className="v mono">{api.endpoint}</span></div>
        <div className="pm-kv"><span className="k">Requests (24h)</span><span className="v pm-num">{api.requests}</span></div>
        <div className="pm-kv"><span className="k">Error rate</span><span className="v pm-num" style={{ color: parseFloat(api.errorRate) > 0.1 ? "#f04438" : "#12b76a" }}>{api.errorRate}</span></div>
        <div className="pm-kv"><span className="k">p95 latency</span><span className="v pm-num">{api.p95}</span></div>
        <div className="pm-kv"><span className="k">p99 latency</span><span className="v pm-num">{api.p99}</span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 5. Communication detail modal ============================ */
export function CommunicationDetailModal({ comm, onClose }: { comm: { date: string; partner: string; direction: string; subject: string; summary: string; nextAction: string } | null; onClose: () => void }) {
  if (!comm) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-chat-left-text" tone="blue" title="Communication detail" subtitle={comm.subject}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Partner</span><span className="v">{comm.partner}</span></div>
        <div className="pm-kv"><span className="k">Direction</span><span className="v"><Badge tone={comm.direction === "Inbound" ? "blue" : "green"}>{comm.direction}</Badge></span></div>
        <div className="pm-kv"><span className="k">Subject</span><span className="v">{comm.subject}</span></div>
        <div className="pm-kv"><span className="k">Summary</span><span className="v">{comm.summary}</span></div>
        <div className="pm-kv"><span className="k">Next action</span><span className="v">{comm.nextAction}</span></div>
        <div className="pm-kv"><span className="k">Date</span><span className="v">{comm.date}</span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 6. Risk assessment modal ============================ */
export function RiskAssessmentModal({ risk, onClose }: { risk: { partner: string; level: string; factors: string; lastAssessment: string; nextAssessment: string } | null; onClose: () => void }) {
  if (!risk) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-shield-check" tone={risk.level === "High" ? "red" : risk.level === "Medium" ? "amber" : "green"} title="Risk assessment" subtitle={risk.partner}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Partner</span><span className="v">{risk.partner}</span></div>
        <div className="pm-kv"><span className="k">Risk level</span><span className="v"><Badge tone={risk.level === "High" ? "red" : risk.level === "Medium" ? "amber" : "green"} dot>{risk.level}</Badge></span></div>
        <div className="pm-kv"><span className="k">Factors</span><span className="v">{risk.factors}</span></div>
        <div className="pm-kv"><span className="k">Last assessment</span><span className="v">{risk.lastAssessment}</span></div>
        <div className="pm-kv"><span className="k">Next assessment</span><span className="v">{risk.nextAssessment}</span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 7. Contract detail modal ============================ */
export function ContractDetailModal({ contract, onClose }: { contract: { partner: string; start: string; end: string; autoRenew: string; noticePeriod: string; value: string } | null; onClose: () => void }) {
  if (!contract) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-file-earmark-text" tone="blue" title="Contract detail" subtitle={contract.partner}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Partner</span><span className="v">{contract.partner}</span></div>
        <div className="pm-kv"><span className="k">Start date</span><span className="v">{contract.start}</span></div>
        <div className="pm-kv"><span className="k">End date</span><span className="v">{contract.end}</span></div>
        <div className="pm-kv"><span className="k">Auto-renew</span><span className="v"><Badge tone={contract.autoRenew === "Yes" ? "green" : "amber"}>{contract.autoRenew}</Badge></span></div>
        <div className="pm-kv"><span className="k">Notice period</span><span className="v">{contract.noticePeriod}</span></div>
        <div className="pm-kv"><span className="k">Value</span><span className="v">{contract.value}</span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 8. Scorecard detail modal ============================ */
export function ScorecardDetailModal({ score, onClose }: { score: { partner: string; integration: string; reliability: string; financial: string; compliance: string; communication: string; overall: string } | null; onClose: () => void }) {
  if (!score) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-bar-chart-line" tone="blue" title="Scorecard detail" subtitle={score.partner}>
      <div className="pm-card pm-card-pad mb-3 text-center">
        <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "2rem", color: parseFloat(score.overall) >= 4 ? "#12b76a" : parseFloat(score.overall) >= 3 ? "#f79009" : "#f04438" }}>{score.overall}</div>
        <div style={{ fontSize: ".76rem", color: "var(--pm-muted)" }}>Overall score</div>
      </div>
      <div className="d-flex flex-column gap-2">
        {[{ label: "Integration", value: score.integration }, { label: "Reliability", value: score.reliability }, { label: "Financial", value: score.financial }, { label: "Compliance", value: score.compliance }, { label: "Communication", value: score.communication }].map((f) => (
          <div key={f.label} className="pm-card pm-card-pad d-flex align-items-center justify-content-between">
            <span style={{ fontWeight: 700, fontSize: ".84rem" }}>{f.label}</span>
            <span className="pm-num" style={{ fontWeight: 700, color: parseFloat(f.value) >= 4 ? "#12b76a" : parseFloat(f.value) >= 3 ? "#f79009" : "#f04438" }}>{f.value}</span>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 9. Partner analytics modal ============================ */
export function PartnerAnalyticsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const stats = [
    { label: "Active partners", value: "42", color: "#12b76a" },
    { label: "Total volume (30d)", value: "KES 196.8M", color: "#2e90fa" },
    { label: "Avg SLA health", value: "98.7%", color: "#12b76a" },
    { label: "Pending reviews", value: "5", color: "#f79009" },
    { label: "Settlement exposure", value: "KES 26.1M", color: "#7a5af8" },
    { label: "Avg partner score", value: "4.3/5", color: "#12b76a" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-graph-up" tone="blue" title="Partner analytics" subtitle="Ecosystem performance metrics">
      <div className="row g-2 mb-3">
        {stats.map((s) => (
          <div className="col-6" key={s.label}><div className="pm-stat" style={{ borderLeft: `3px solid ${s.color}` }}>
            <div className="pm-stat-label">{s.label}</div>
            <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1rem", color: s.color }}>{s.value}</div></div></div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 10. Partner insights modal ============================ */
export function PartnerInsightsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const insights = [
    { icon: "bi-graph-up", title: "Volume trending up", detail: "12% increase in partner volume vs last month", tone: "green" },
    { icon: "bi-exclamation-triangle", title: "SLA breaches elevated", detail: "3 partners with SLA breaches this week", tone: "amber" },
    { icon: "bi-check-circle", title: "New partner live", detail: "Cellulant integration completed successfully", tone: "green" },
    { icon: "bi-clock-history", title: "Contract renewals due", detail: "2 contracts expiring in next 90 days", tone: "amber" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-lightbulb" tone="blue" title="Partner insights" subtitle="AI-powered analysis">
      <div className="d-flex flex-column gap-2">
        {insights.map((ins) => (
          <div key={ins.title} className="pm-alert-row" style={{ borderLeftColor: ins.tone === "green" ? "#12b76a" : "#f79009" }}>
            <i className={`bi ${ins.icon}`} style={{ color: ins.tone === "green" ? "#12b76a" : "#f79009" }} />
            <div className="flex-grow-1"><div style={{ fontWeight: 700, fontSize: ".84rem" }}>{ins.title}</div><div style={{ fontSize: ".74rem", color: "var(--pm-muted)" }}>{ins.detail}</div></div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 11. Partner comparison modal ============================ */
export function PartnerCompareModal({ partners, onClose }: { partners: { name: string; type: string; volume: string; score: string }[]; onClose: () => void }) {
  if (partners.length < 2) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-arrow-left-right" tone="blue" title="Compare partners" subtitle="Side-by-side comparison">
      <div className="pm-card pm-table-wrap">
        <table className="pm-table">
          <thead><tr><th>Field</th><th>{partners[0].name}</th><th>{partners[1].name}</th></tr></thead>
          <tbody>
            {["type", "volume", "score"].map((k) => (
              <tr key={k}><td className="pm-td-strong">{k}</td><td>{partners[0][k as keyof typeof partners[0]]}</td><td>{partners[1][k as keyof typeof partners[0]]}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </Drawer>
  );
}

/* ============================ 12. Partner forecast modal ============================ */
export function PartnerForecastModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const forecast = [
    { partner: "Safaricom", volume: "KES 92M", growth: "+12%" },
    { partner: "Visa", volume: "KES 25M", growth: "+8%" },
    { partner: "KCB Bank", volume: "KES 21M", growth: "+5%" },
    { partner: "Mastercard", volume: "KES 9.5M", growth: "+10%" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-calendar-range" tone="blue" title="Partner forecast" subtitle="Next quarter projection">
      <div className="d-flex flex-column gap-2">
        {forecast.map((f) => (
          <div key={f.partner} className="pm-card pm-card-pad d-flex align-items-center justify-content-between">
            <div><div style={{ fontWeight: 700, fontSize: ".88rem" }}>{f.partner}</div></div>
            <div className="text-end"><div style={{ fontWeight: 800, fontSize: ".95rem" }}>{f.volume}</div>
              <div style={{ fontSize: ".72rem", color: "#12b76a" }}>{f.growth}</div></div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 13. Partner audit trail modal ============================ */
export function PartnerAuditModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const entries = [
    { id: "AUD-PTN-88102", time: "22 Aug 2026", who: "Jeckonia Kwasa", action: "Settlement reconciled", detail: "Safaricom KES 12.4M" },
    { id: "AUD-PTN-88045", time: "20 Aug 2026", who: "Grace Wanjiru", action: "API keys rotated", detail: "Visa Kenya credentials" },
    { id: "AUD-PTN-87988", time: "18 Aug 2026", who: "System", action: "SLA breach logged", detail: "KCB Bank transfer time" },
    { id: "AUD-PTN-87901", time: "15 Aug 2026", who: "Peter Njoroge", action: "Risk review completed", detail: "QuickLend escalated" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-clock-history" tone="blue" title="Partner audit trail" subtitle="Immutable change log">
      <div className="d-flex flex-column gap-2">
        {entries.map((e) => (
          <div key={e.id} className="pm-alert-row info">
            <i className="bi bi-clock-history" style={{ color: "#2e90fa" }} />
            <div className="flex-grow-1"><div style={{ fontWeight: 700, fontSize: ".82rem" }}>{e.action}</div><div style={{ fontSize: ".74rem", color: "var(--pm-muted)" }}>{e.detail}</div>
              <div className="d-flex gap-2 mt-1"><Badge tone="grey">{e.who}</Badge><span style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{e.time} · {e.id}</span></div></div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 14. Partner communication log modal ============================ */
export function CommunicationLogModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const comms = [
    { time: "24 Aug 14:00", partner: "Safaricom", type: "Inbound", subject: "Maintenance notice", status: "Monitoring" },
    { time: "23 Aug 10:30", partner: "Visa", type: "Outbound", subject: "BIN expansion request", status: "Pending" },
    { time: "22 Aug 16:45", partner: "KCB", type: "Inbound", subject: "SLA breach report", status: "Escalated" },
    { time: "21 Aug 09:15", partner: "Onfido", type: "Outbound", subject: "Pricing negotiation", status: "In progress" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-chat-left-text" tone="blue" title="Communication log" subtitle="All partner communications">
      <div className="d-flex flex-column gap-2">
        {comms.map((c, i) => (
          <div key={i} className="pm-card pm-card-pad d-flex align-items-center gap-3">
            <i className={`bi ${c.type === "Inbound" ? "bi-arrow-down-left" : "bi-arrow-up-right"}`} style={{ color: c.type === "Inbound" ? "#2e90fa" : "#12b76a" }} />
            <div className="flex-grow-1"><div style={{ fontWeight: 700, fontSize: ".84rem" }}>{c.subject}</div><div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{c.partner} · {c.type} · {c.time}</div></div>
            <Badge tone={c.status === "Escalated" ? "red" : c.status === "Pending" ? "amber" : "green"}>{c.status}</Badge>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 15. Partner health modal ============================ */
export function PartnerHealthModal({ partner, onClose }: { partner: { name: string; score: number; sla: number; volume: number } | null; onClose: () => void }) {
  if (!partner) return null;
  const health = partner.score > 4 ? 92 : partner.score > 3 ? 74 : 48;
  return (
    <Drawer open onClose={onClose} icon="bi-heart-pulse" tone={health > 80 ? "green" : health > 60 ? "amber" : "red"} title="Partner health" subtitle={partner.name}>
      <div className="pm-card pm-card-pad mb-3 text-center">
        <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "2.5rem", color: health > 80 ? "#12b76a" : health > 60 ? "#f79009" : "#f04438" }}>{health}</div>
        <div style={{ fontSize: ".76rem", color: "var(--pm-muted)" }}>Health score</div>
      </div>
      <div className="d-flex flex-column gap-2">
        {[{ label: "Partner score", value: `${partner.score}/5` }, { label: "SLA health", value: `${partner.sla}%` }, { label: "Volume trend", value: "Stable" }].map((f) => (
          <div key={f.label} className="pm-card pm-card-pad d-flex align-items-center justify-content-between">
            <span style={{ fontWeight: 700, fontSize: ".84rem" }}>{f.label}</span>
            <span style={{ fontWeight: 700, fontSize: ".88rem" }}>{f.value}</span>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 16. Partner export modal ============================ */
export function PartnerExportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [format, setFormat] = useState("csv");
  const [include, setInclude] = useState({ profile: true, financial: true, sla: true, contracts: true });
  return (
    <Modal open={open} onClose={onClose} tone="blue" icon="bi-download" size="md" title="Export partner data" subtitle="Choose format and content">
      <div className="pm-modal-body">
        <label className="form-label">Format</label>
        <div className="d-flex gap-2 mb-3">
          {["csv", "json", "xlsx"].map((f) => <button key={f} className={`pm-chip ${format === f ? "active" : ""}`} onClick={() => setFormat(f)}>{f.toUpperCase()}</button>)}
        </div>
        <label className="form-label">Include</label>
        <div className="d-flex flex-column gap-2">
          {Object.entries({ profile: "Partner profiles", financial: "Financial data", sla: "SLA metrics", contracts: "Contract details" }).map(([k, l]) => (
            <label key={k} className={`pm-opt ${include[k as keyof typeof include] ? "active" : ""}`}>
              <input type="checkbox" className="form-check-input mt-0" checked={include[k as keyof typeof include]} onChange={(e) => setInclude({ ...include, [k]: e.target.checked })} />
              <span style={{ fontSize: ".84rem", fontWeight: 700 }}>{l}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Export ready" }); onClose(); }}>
          <i className="bi bi-download me-1" />Download
        </button>
      </div>
    </Modal>
  );
}

/* ============================ 17. Partner search modal ============================ */
export function PartnerSearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [query, setQuery] = useState("");
  return (
    <Modal open={open} onClose={onClose} tone="blue" icon="bi-search" size="md" title="Partner search" subtitle="Search across all partner data">
      <div className="pm-modal-body">
        <label className="form-label">Search criteria</label>
        <input className="form-control mb-3" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Partner name, type, status..." />
        <label className="form-label">Filters</label>
        <div className="row g-2 mb-3">
          <div className="col-6"><label className="form-label">Type</label><select className="form-select"><option>All types</option>{["Payment", "Banking", "Utility", "KYC Provider", "AML Provider", "Telecom"].map((t) => <option key={t}>{t}</option>)}</select></div>
          <div className="col-6"><label className="form-label">Status</label><select className="form-select"><option>All statuses</option>{["Active", "Suspended"].map((s) => <option key={s}>{s}</option>)}</select></div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Search results ready" }); onClose(); }}>
          <i className="bi bi-search me-1" />Search
        </button>
      </div>
    </Modal>
  );
}
