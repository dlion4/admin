import { useState } from "react";
import { Modal, Drawer, Badge, useToast } from "../../../components/ui";
import { kes, num } from "../../../lib/format";

/* 1. Investor profile modal */
export function InvestorProfileModal({ investor, onClose }: { investor: { name: string; type: string; invested: string; equity: string; since: string } | null; onClose: () => void }) {
  if (!investor) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-person-badge" tone="violet" title="Investor profile" subtitle={investor.name}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Investor</span><span className="v">{investor.name}</span></div>
        <div className="pm-kv"><span className="k">Type</span><span className="v"><Badge tone="violet">{investor.type}</Badge></span></div>
        <div className="pm-kv"><span className="k">Total invested</span><span className="v pm-num" style={{ fontWeight: 700 }}>{investor.invested}</span></div>
        <div className="pm-kv"><span className="k">Equity stake</span><span className="v pm-num">{investor.equity}</span></div>
        <div className="pm-kv"><span className="k">Since</span><span className="v">{investor.since}</span></div>
      </div>
    </Drawer>
  );
}

/* 2. Funding round detail modal */
export function FundingRoundDetailModal({ round, onClose }: { round: { name: string; date: string; amount: string; valuation: string; lead: string; status: string } | null; onClose: () => void }) {
  if (!round) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-cash-stack" tone="blue" title="Funding round" subtitle={round.name}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Round</span><span className="v">{round.name}</span></div>
        <div className="pm-kv"><span className="k">Date</span><span className="v">{round.date}</span></div>
        <div className="pm-kv"><span className="k">Amount raised</span><span className="v pm-num" style={{ fontWeight: 700 }}>{round.amount}</span></div>
        <div className="pm-kv"><span className="k">Valuation</span><span className="v pm-num">{round.valuation}</span></div>
        <div className="pm-kv"><span className="k">Lead investor</span><span className="v">{round.lead}</span></div>
        <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone={round.status === "Closed" ? "green" : "amber"}>{round.status}</Badge></span></div>
      </div>
    </Drawer>
  );
}

/* 3. Capitalization table modal */
export function CapTableModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const holders = [
    { name: "Founders", equity: "35%", shares: "35M", value: "KES 2.45B" },
    { name: "Seed investors", equity: "12%", shares: "12M", value: "KES 840M" },
    { name: "Series A", equity: "18%", shares: "18M", value: "KES 1.26B" },
    { name: "Employee pool", equity: "10%", shares: "10M", value: "KES 700M" },
    { name: "Other", equity: "25%", shares: "25M", value: "KES 1.75B" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-pie-chart" tone="violet" title="Cap table" subtitle="Capitalization breakdown">
      <div className="pm-card pm-table-wrap">
        <table className="pm-table">
          <thead><tr><th>Holder</th><th className="text-end">Equity</th><th className="text-end">Shares</th><th className="text-end">Value</th></tr></thead>
          <tbody>{holders.map((h) => (
            <tr key={h.name}><td className="pm-td-strong">{h.name}</td><td className="text-end pm-num">{h.equity}</td><td className="text-end pm-num">{h.shares}</td><td className="text-end pm-num" style={{ fontWeight: 700 }}>{h.value}</td></tr>
          ))}</tbody>
        </table>
      </div>
    </Drawer>
  );
}

/* 4. Investor analytics modal */
export function InvestorAnalyticsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const stats = [
    { label: "Total raised (YTD)", value: "KES 1.4B", color: "#12b76a" },
    { label: "Active investors", value: "8", color: "#7a5af8" },
    { label: "Latest valuation", value: "KES 7B", color: "#2e90fa" },
    { label: "Burn rate", value: "KES 180M/mo", color: "#f79009" },
    { label: "Runway", value: "14 months", color: "#12b76a" },
    { label: "Next round", value: "Q4 2026", color: "#ee46bc" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-graph-up" tone="violet" title="Investor analytics" subtitle="Funding performance metrics">
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

/* 5. Investor insights modal */
export function InvestorInsightsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const insights = [
    { icon: "bi-graph-up", title: "Valuation trending up", detail: "25% increase in valuation vs last round", tone: "green" },
    { icon: "bi-exclamation-triangle", title: "Burn rate elevated", detail: "KES 180M/mo, 10% above forecast", tone: "amber" },
    { icon: "bi-check-circle", title: "Runway healthy", detail: "14 months of runway at current burn", tone: "green" },
    { icon: "bi-clock-history", title: "Series C timeline", detail: "Target Q4 2026, data room 92% ready", tone: "amber" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-lightbulb" tone="violet" title="Investor insights" subtitle="AI-powered analysis">
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

/* 6. Board meeting detail modal */
export function BoardMeetingDetailModal({ meeting, onClose }: { meeting: { date: string; attendees: string; agenda: string; status: string } | null; onClose: () => void }) {
  if (!meeting) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-calendar-event" tone="blue" title="Board meeting" subtitle={meeting.date}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Date</span><span className="v">{meeting.date}</span></div>
        <div className="pm-kv"><span className="k">Attendees</span><span className="v">{meeting.attendees}</span></div>
        <div className="pm-kv"><span className="k">Agenda</span><span className="v">{meeting.agenda}</span></div>
        <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone={meeting.status === "Completed" ? "green" : "amber"}>{meeting.status}</Badge></span></div>
      </div>
    </Drawer>
  );
}

/* 7. Investor comparison modal */
export function InvestorCompareModal({ investors, onClose }: { investors: { name: string; invested: string; equity: string; type: string }[]; onClose: () => void }) {
  if (investors.length < 2) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-arrow-left-right" tone="violet" title="Compare investors" subtitle="Side-by-side comparison">
      <div className="pm-card pm-table-wrap">
        <table className="pm-table">
          <thead><tr><th>Field</th><th>{investors[0].name}</th><th>{investors[1].name}</th></tr></thead>
          <tbody>
            {["type", "invested", "equity"].map((k) => (
              <tr key={k}><td className="pm-td-strong">{k}</td><td>{investors[0][k as keyof typeof investors[0]]}</td><td>{investors[1][k as keyof typeof investors[0]]}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </Drawer>
  );
}

/* 8. Investor forecast modal */
export function InvestorForecastModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const forecast = [
    { quarter: "Q4 2026", target: "KES 500M", status: "In progress" },
    { quarter: "Q1 2027", target: "KES 800M", status: "Planned" },
    { quarter: "Q2 2027", target: "KES 1.2B", status: "Planned" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-calendar-range" tone="violet" title="Funding forecast" subtitle="Next 3 quarters">
      <div className="d-flex flex-column gap-2">
        {forecast.map((f) => (
          <div key={f.quarter} className="pm-card pm-card-pad d-flex align-items-center justify-content-between">
            <div><div style={{ fontWeight: 700, fontSize: ".88rem" }}>{f.quarter}</div></div>
            <div className="text-end"><div style={{ fontWeight: 800, fontSize: ".95rem" }}>{f.target}</div>
              <Badge tone={f.status === "In progress" ? "blue" : "grey"}>{f.status}</Badge></div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* 9. Investor audit trail modal */
export function InvestorAuditModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const entries = [
    { id: "AUD-INV-88102", time: "22 Aug 2026", who: "CFO", action: "Board pack published", detail: "Q2-2026 results presented" },
    { id: "AUD-INV-88045", time: "18 Aug 2026", who: "CEO", action: "Term sheet received", detail: "Series C lead investor" },
    { id: "AUD-INV-87988", time: "15 Aug 2026", who: "CFO", action: "Valuation updated", detail: "KES 6.5B -> KES 7B" },
    { id: "AUD-INV-87901", time: "10 Aug 2026", who: "System", action: "Investor report sent", detail: "Monthly update to all investors" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-clock-history" tone="violet" title="Investor audit trail" subtitle="Immutable change log">
      <div className="d-flex flex-column gap-2">
        {entries.map((e) => (
          <div key={e.id} className="pm-alert-row info">
            <i className="bi bi-clock-history" style={{ color: "#7a5af8" }} />
            <div className="flex-grow-1"><div style={{ fontWeight: 700, fontSize: ".82rem" }}>{e.action}</div><div style={{ fontSize: ".74rem", color: "var(--pm-muted)" }}>{e.detail}</div>
              <div className="d-flex gap-2 mt-1"><Badge tone="grey">{e.who}</Badge><span style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{e.time} · {e.id}</span></div></div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* 10. Investor communication modal */
export function InvestorCommunicationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [channel, setChannel] = useState<"email" | "call" | "meeting">("email");
  const [msg, setMsg] = useState("");
  return (
    <Modal open={open} onClose={onClose} tone="violet" icon="bi-envelope-paper" size="md" title="Investor communication" subtitle="Send update to investors">
      <div className="pm-modal-body">
        <label className="form-label">Channel</label>
        <div className="d-flex gap-2 mb-3">
          {[{ v: "email" as const, l: "Email", i: "bi-envelope" }, { v: "call" as const, l: "Call", i: "bi-telephone" }, { v: "meeting" as const, l: "Meeting", i: "bi-calendar-event" }].map((c) => (
            <button key={c.v} className={`pm-opt flex-grow-1 ${channel === c.v ? "active" : ""}`} onClick={() => setChannel(c.v)}>
              <i className={`bi ${c.i}`} /><span style={{ fontSize: ".84rem", fontWeight: 700 }}>{c.l}</span>
            </button>
          ))}
        </div>
        <label className="form-label">Message</label>
        <textarea className="form-control mb-2" rows={4} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Type your message or pick a template." />
        <div className="d-flex gap-1 flex-wrap">
          {["Monthly update", "Board meeting invite", "Funding announcement", "Performance report"].map((t) => <button key={t} className="pm-chip" onClick={() => setMsg(t)} style={{ fontSize: ".72rem" }}>{t}</button>)}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={!msg.trim()} onClick={() => { push({ kind: "success", title: `Message sent via ${channel}` }); onClose(); }}>
          <i className="bi bi-send me-1" />Send
        </button>
      </div>
    </Modal>
  );
}

/* 11. Investor health modal */
export function InvestorHealthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const health = 88;
  return (
    <Drawer open={open} onClose={onClose} icon="bi-heart-pulse" tone="violet" title="Investor health" subtitle="Relationship health score">
      <div className="pm-card pm-card-pad mb-3 text-center">
        <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "2.5rem", color: health > 80 ? "#12b76a" : "#f79009" }}>{health}</div>
        <div style={{ fontSize: ".76rem", color: "var(--pm-muted)" }}>Health score</div>
      </div>
      <div className="d-flex flex-column gap-2">
        {[{ label: "Communication", value: "Excellent" }, { label: "Returns", value: "On track" }, { label: "Engagement", value: "High" }].map((f) => (
          <div key={f.label} className="pm-card pm-card-pad d-flex align-items-center justify-content-between">
            <span style={{ fontWeight: 700, fontSize: ".84rem" }}>{f.label}</span>
            <Badge tone="green">{f.value}</Badge>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* 12. Investor export modal */
export function InvestorExportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [format, setFormat] = useState("pdf");
  return (
    <Modal open={open} onClose={onClose} tone="violet" icon="bi-download" size="md" title="Export investor data" subtitle="Choose format and content">
      <div className="pm-modal-body">
        <label className="form-label">Format</label>
        <div className="d-flex gap-2 mb-3">
          {["pdf", "xlsx", "csv"].map((f) => <button key={f} className={`pm-chip ${format === f ? "active" : ""}`} onClick={() => setFormat(f)}>{f.toUpperCase()}</button>)}
        </div>
        <label className="form-label">Include</label>
        <div className="d-flex flex-column gap-2">
          {["Investor profiles", "Funding history", "Cap table", "Board minutes"].map((l) => (
            <label key={l} className="pm-opt active">
              <input type="checkbox" className="form-check-input mt-0" defaultChecked />
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

/* 13. Investor search modal */
export function InvestorSearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [query, setQuery] = useState("");
  return (
    <Modal open={open} onClose={onClose} tone="violet" icon="bi-search" size="md" title="Search investors" subtitle="Search across all investor data">
      <div className="pm-modal-body">
        <label className="form-label">Search criteria</label>
        <input className="form-control mb-3" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Investor name, type, status..." />
        <label className="form-label">Filters</label>
        <div className="row g-2 mb-3">
          <div className="col-6"><label className="form-label">Type</label><select className="form-select"><option>All types</option>{["VC", "Angel", "Corporate", "PE"].map((t) => <option key={t}>{t}</option>)}</select></div>
          <div className="col-6"><label className="form-label">Status</label><select className="form-select"><option>All statuses</option>{["Active", "Inactive"].map((s) => <option key={s}>{s}</option>)}</select></div>
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

/* 14. Investor preference modal */
export function InvestorPreferenceModal({ investor, onClose }: { investor: { name: string; preferences: string[] } | null; onClose: () => void }) {
  if (!investor) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-gear" tone="violet" title="Investor preferences" subtitle={investor.name}>
      <div className="d-flex flex-column gap-2">
        {investor.preferences.map((p) => (
          <div key={p} className="pm-card pm-card-pad d-flex align-items-center gap-3">
            <i className="bi bi-check-circle-fill" style={{ color: "#12b76a" }} />
            <span style={{ fontWeight: 700, fontSize: ".84rem" }}>{p}</span>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* 15. Investor document modal */
export function InvestorDocumentModal({ investor, onClose }: { investor: { name: string; documents: string[] } | null; onClose: () => void }) {
  if (!investor) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-file-earmark-text" tone="violet" title="Investor documents" subtitle={investor.name}>
      <div className="d-flex flex-column gap-2">
        {investor.documents.map((d) => (
          <div key={d} className="pm-card pm-card-pad d-flex align-items-center gap-3">
            <i className="bi bi-file-earmark" style={{ color: "#7a5af8" }} />
            <span style={{ fontWeight: 700, fontSize: ".84rem" }}>{d}</span>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* 16. Investor network modal */
export function InvestorNetworkModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const connections = [
    { investor: "Founders Fund", introduced: "Series A lead", strength: "Strong" },
    { investor: "Sequoia", introduced: "Board connection", strength: "Medium" },
    { investor: "a16z", introduced: "Portfolio referral", strength: "Weak" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-diagram-3" tone="violet" title="Investor network" subtitle="Key connections">
      <div className="d-flex flex-column gap-2">
        {connections.map((c) => (
          <div key={c.investor} className="pm-card pm-card-pad d-flex align-items-center gap-3">
            <i className="bi bi-people" style={{ color: "#7a5af8" }} />
            <div className="flex-grow-1"><div style={{ fontWeight: 700, fontSize: ".84rem" }}>{c.investor}</div><div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{c.introduced}</div></div>
            <Badge tone={c.strength === "Strong" ? "green" : c.strength === "Medium" ? "amber" : "grey"}>{c.strength}</Badge>
          </div>
        ))}
      </div>
    </Drawer>
  );
}
