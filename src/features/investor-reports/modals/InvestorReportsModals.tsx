import { useState } from "react";
import { Modal, Drawer, Badge, useToast } from "../../../components/ui";
import { kes, num } from "../../../lib/format";

/* 1. Report detail modal */
export function ReportDetailModal({ report, onClose }: { report: { title: string; period: string; generated: string; status: string; pages: number } | null; onClose: () => void }) {
  if (!report) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-file-earmark-bar-graph" tone="violet" title="Report detail" subtitle={report.title}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Report</span><span className="v">{report.title}</span></div>
        <div className="pm-kv"><span className="k">Period</span><span className="v">{report.period}</span></div>
        <div className="pm-kv"><span className="k">Generated</span><span className="v">{report.generated}</span></div>
        <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone={report.status === "Published" ? "green" : "amber"}>{report.status}</Badge></span></div>
        <div className="pm-kv"><span className="k">Pages</span><span className="v pm-num">{report.pages}</span></div>
      </div>
    </Drawer>
  );
}

/* 2. Financial summary modal */
export function FinancialSummaryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const metrics = [
    { label: "Revenue", value: "KES 1.4B", change: "+18%", good: true },
    { label: "EBITDA", value: "KES 420M", change: "+12%", good: true },
    { label: "Net income", value: "KES 180M", change: "+8%", good: true },
    { label: "Cash balance", value: "KES 2.1B", change: "+25%", good: true },
    { label: "Burn rate", value: "KES 180M/mo", change: "-5%", good: true },
    { label: "Runway", value: "14 months", change: "+2 months", good: true },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-cash-stack" tone="violet" title="Financial summary" subtitle="Key financial metrics">
      <div className="d-flex flex-column gap-2">
        {metrics.map((m) => (
          <div key={m.label} className="pm-card pm-card-pad d-flex align-items-center justify-content-between">
            <span style={{ fontWeight: 700, fontSize: ".84rem" }}>{m.label}</span>
            <div className="text-end"><div style={{ fontWeight: 800, fontSize: ".95rem" }}>{m.value}</div>
              <div style={{ fontSize: ".72rem", color: m.good ? "#12b76a" : "#f04438" }}>{m.change}</div></div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* 3. KPI summary modal */
export function KpiSummaryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const kpis = [
    { name: "MAU", value: "89,214", target: "90,000", progress: 99 },
    { name: "Net revenue", value: "KES 124M", target: "KES 118M", progress: 105 },
    { name: "Fraud loss", value: "4.2 bps", target: "5.0 bps", progress: 119 },
    { name: "Uptime", value: "99.97%", target: "99.95%", progress: 100 },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-graph-up-arrow" tone="violet" title="KPI summary" subtitle="Board-level KPIs">
      <div className="d-flex flex-column gap-2">
        {kpis.map((k) => (
          <div key={k.name} className="pm-card pm-card-pad">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontWeight: 700, fontSize: ".88rem" }}>{k.name}</span>
              <Badge tone={k.progress >= 100 ? "green" : k.progress >= 90 ? "amber" : "red"}>{k.progress}%</Badge>
            </div>
            <div className="d-flex justify-content-between" style={{ fontSize: ".74rem", color: "var(--pm-muted)" }}>
              <span>Value: {k.value}</span>
              <span>Target: {k.target}</span>
            </div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* 4. Report analytics modal */
export function ReportAnalyticsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const stats = [
    { label: "Reports generated (YTD)", value: "48", color: "#7a5af8" },
    { label: "Avg report size", value: "54 pages", color: "#2e90fa" },
    { label: "On-time delivery", value: "96%", color: "#12b76a" },
    { label: "Board meetings", value: "12", color: "#ee46bc" },
    { label: "Investor updates", value: "24", color: "#f79009" },
    { label: "Regulatory filings", value: "8", color: "#0ba5ec" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-graph-up" tone="violet" title="Report analytics" subtitle="Reporting performance metrics">
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

/* 5. Report insights modal */
export function ReportInsightsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const insights = [
    { icon: "bi-graph-up", title: "Revenue beat forecast", detail: "18% growth vs 15% target", tone: "green" },
    { icon: "bi-exclamation-triangle", title: "CAC above ceiling", detail: "KES 412 vs KES 380 target", tone: "amber" },
    { icon: "bi-check-circle", title: "Fraud loss best-ever", detail: "4.2 bps vs 5.0 bps target", tone: "green" },
    { icon: "bi-clock-history", title: "Board meeting scheduled", detail: "27 Aug 2026, all directors invited", tone: "amber" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-lightbulb" tone="violet" title="Report insights" subtitle="AI-powered analysis">
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

/* 6. Report comparison modal */
export function ReportCompareModal({ reports, onClose }: { reports: { title: string; period: string; pages: number; status: string }[]; onClose: () => void }) {
  if (reports.length < 2) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-arrow-left-right" tone="violet" title="Compare reports" subtitle="Side-by-side comparison">
      <div className="pm-card pm-table-wrap">
        <table className="pm-table">
          <thead><tr><th>Field</th><th>{reports[0].title}</th><th>{reports[1].title}</th></tr></thead>
          <tbody>
            {["period", "pages", "status"].map((k) => (
              <tr key={k}><td className="pm-td-strong">{k}</td><td>{String(reports[0][k as keyof typeof reports[0]])}</td><td>{String(reports[1][k as keyof typeof reports[0]])}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </Drawer>
  );
}

/* 7. Report forecast modal */
export function ReportForecastModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const forecast = [
    { month: "Sep 2026", reports: 4, board: 1, investor: 2 },
    { month: "Oct 2026", reports: 5, board: 0, investor: 2 },
    { month: "Nov 2026", reports: 4, board: 1, investor: 2 },
    { month: "Dec 2026", reports: 6, board: 1, investor: 2 },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-calendar-range" tone="violet" title="Report forecast" subtitle="Next 4 months">
      <div className="d-flex flex-column gap-2">
        {forecast.map((f) => (
          <div key={f.month} className="pm-card pm-card-pad">
            <div style={{ fontWeight: 700, fontSize: ".88rem", marginBottom: 4 }}>{f.month}</div>
            <div className="d-flex gap-2" style={{ fontSize: ".78rem" }}>
              <span style={{ color: "#7a5af8" }}>Reports: {f.reports}</span>
              <span style={{ color: "#2e90fa" }}>Board: {f.board}</span>
              <span style={{ color: "#12b76a" }}>Investor: {f.investor}</span>
            </div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* 8. Report audit trail modal */
export function ReportAuditModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const entries = [
    { id: "AUD-RPT-88102", time: "22 Aug 2026", who: "CFO", action: "Board pack published", detail: "Q2-2026 results, 86 pages" },
    { id: "AUD-RPT-88045", time: "18 Aug 2026", who: "Sarah Kamau", action: "Investor report sent", detail: "Monthly update, 54 pages" },
    { id: "AUD-RPT-87988", time: "15 Aug 2026", who: "Jeckonia Kwasa", action: "Regulatory filing", detail: "CBK quarterly, 38 pages" },
    { id: "AUD-RPT-87901", time: "10 Aug 2026", who: "System", action: "Report generated", detail: "KPI scorecard, 54 pages" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-clock-history" tone="violet" title="Report audit trail" subtitle="Immutable change log">
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

/* 9. Report export modal */
export function ReportExportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [format, setFormat] = useState("pdf");
  return (
    <Modal open={open} onClose={onClose} tone="violet" icon="bi-download" size="md" title="Export reports" subtitle="Choose format and content">
      <div className="pm-modal-body">
        <label className="form-label">Format</label>
        <div className="d-flex gap-2 mb-3">
          {["pdf", "xlsx", "csv"].map((f) => <button key={f} className={`pm-chip ${format === f ? "active" : ""}`} onClick={() => setFormat(f)}>{f.toUpperCase()}</button>)}
        </div>
        <label className="form-label">Include</label>
        <div className="d-flex flex-column gap-2">
          {["Financial statements", "KPI scorecards", "Board minutes", "Investor updates"].map((l) => (
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

/* 10. Report search modal */
export function ReportSearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [query, setQuery] = useState("");
  return (
    <Modal open={open} onClose={onClose} tone="violet" icon="bi-search" size="md" title="Search reports" subtitle="Search across all reports">
      <div className="pm-modal-body">
        <label className="form-label">Search criteria</label>
        <input className="form-control mb-3" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Report title, period, author..." />
        <label className="form-label">Filters</label>
        <div className="row g-2 mb-3">
          <div className="col-6"><label className="form-label">Type</label><select className="form-select"><option>All types</option>{["Board pack", "Investor report", "KPI scorecard", "Regulatory filing"].map((t) => <option key={t}>{t}</option>)}</select></div>
          <div className="col-6"><label className="form-label">Period</label><select className="form-select"><option>All periods</option>{["Q3-2026", "Q2-2026", "Q1-2026"].map((p) => <option key={p}>{p}</option>)}</select></div>
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

/* 11. Report health modal */
export function ReportHealthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const health = 94;
  return (
    <Drawer open={open} onClose={onClose} icon="bi-heart-pulse" tone="violet" title="Report health" subtitle="Reporting quality score">
      <div className="pm-card pm-card-pad mb-3 text-center">
        <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "2.5rem", color: health > 80 ? "#12b76a" : "#f79009" }}>{health}</div>
        <div style={{ fontSize: ".76rem", color: "var(--pm-muted)" }}>Health score</div>
      </div>
      <div className="d-flex flex-column gap-2">
        {[{ label: "On-time delivery", value: "96%" }, { label: "Accuracy", value: "99.2%" }, { label: "Completeness", value: "98%" }].map((f) => (
          <div key={f.label} className="pm-card pm-card-pad d-flex align-items-center justify-content-between">
            <span style={{ fontWeight: 700, fontSize: ".84rem" }}>{f.label}</span>
            <Badge tone="green">{f.value}</Badge>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* 12. Report schedule modal */
export function ReportScheduleModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [freq, setFreq] = useState("monthly");
  return (
    <Modal open={open} onClose={onClose} tone="violet" icon="bi-calendar-check" size="md" title="Report schedule" subtitle="Configure automated report delivery">
      <div className="pm-modal-body">
        <label className="form-label">Frequency</label>
        <div className="d-flex gap-1 flex-wrap mb-3">
          {["daily", "weekly", "monthly", "quarterly"].map((f) => <button key={f} className={`pm-chip ${freq === f ? "active" : ""}`} onClick={() => setFreq(f)}>{f}</button>)}
        </div>
        <label className="form-label">Recipients</label>
        <div className="d-flex flex-column gap-2">
          {["Board of Directors", "Investor Relations", "Finance Team", "Compliance"].map((r) => (
            <label key={r} className="pm-opt active">
              <input type="checkbox" className="form-check-input mt-0" defaultChecked />
              <span style={{ fontSize: ".84rem", fontWeight: 700 }}>{r}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Schedule updated" }); onClose(); }}>
          <i className="bi bi-check2 me-1" />Save
        </button>
      </div>
    </Modal>
  );
}

/* 13. Report template modal */
export function ReportTemplateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const templates = [
    { name: "Board pack template", sections: 10, pages: 54, lastUsed: "Aug 2026" },
    { name: "Investor update template", sections: 8, pages: 32, lastUsed: "Aug 2026" },
    { name: "KPI scorecard template", sections: 7, pages: 24, lastUsed: "Jul 2026" },
    { name: "Regulatory filing template", sections: 12, pages: 48, lastUsed: "Jun 2026" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-file-earmark-richtext" tone="violet" title="Report templates" subtitle="Standardized report formats">
      <div className="d-flex flex-column gap-2">
        {templates.map((t) => (
          <div key={t.name} className="pm-card pm-card-pad d-flex align-items-center gap-3">
            <i className="bi bi-file-earmark-richtext" style={{ color: "#7a5af8" }} />
            <div className="flex-grow-1"><div style={{ fontWeight: 700, fontSize: ".84rem" }}>{t.name}</div><div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{t.sections} sections · {t.pages} pages · Last: {t.lastUsed}</div></div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* 14. Report approval modal */
export function ReportApprovalModal({ report, onClose }: { report: { title: string; author: string; status: string } | null; onClose: () => void }) {
  const { push } = useToast();
  if (!report) return null;
  return (
    <Modal open onClose={onClose} tone="violet" icon="bi-check-circle" size="md" title="Approve report" subtitle={report.title}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Report</span><span className="v">{report.title}</span></div>
          <div className="pm-kv"><span className="k">Author</span><span className="v">{report.author}</span></div>
          <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone="amber">{report.status}</Badge></span></div>
        </div>
        <div className="pm-note" style={{ borderColor: "#b7e6cf", background: "#e7f8ef", color: "#05603a" }}>
          <i className="bi bi-shield-check me-1" />Approval will publish the report and notify all recipients.
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Report approved" }); onClose(); }}>
          <i className="bi bi-check-circle me-1" />Approve
        </button>
      </div>
    </Modal>
  );
}

/* 15. Report feedback modal */
export function ReportFeedbackModal({ report, onClose }: { report: { title: string } | null; onClose: () => void }) {
  const { push } = useToast();
  const [feedback, setFeedback] = useState("");
  if (!report) return null;
  return (
    <Modal open onClose={onClose} tone="violet" icon="bi-chat-left-text" size="md" title="Report feedback" subtitle={report.title}>
      <div className="pm-modal-body">
        <label className="form-label">Feedback</label>
        <textarea className="form-control mb-2" rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Provide feedback on the report." />
        <div className="d-flex gap-1 flex-wrap">
          {["Looks good", "Needs revision", "Missing data", "Excellent work"].map((t) => <button key={t} className="pm-chip" onClick={() => setFeedback(t)}>{t}</button>)}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={!feedback.trim()} onClick={() => { push({ kind: "success", title: "Feedback submitted" }); onClose(); }}>
          <i className="bi bi-send me-1" />Submit
        </button>
      </div>
    </Modal>
  );
}

/* 16. Report version modal */
export function ReportVersionModal({ report, onClose }: { report: { title: string; versions: { date: string; author: string; changes: string }[] } | null; onClose: () => void }) {
  if (!report) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-clock-history" tone="violet" title="Report versions" subtitle={report.title}>
      <div className="d-flex flex-column gap-2">
        {report.versions.map((v, i) => (
          <div key={i} className="pm-card pm-card-pad d-flex align-items-center gap-3">
            <i className="bi bi-file-earmark" style={{ color: "#7a5af8" }} />
            <div className="flex-grow-1"><div style={{ fontWeight: 700, fontSize: ".84rem" }}>Version {report.versions.length - i}</div><div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{v.author} · {v.date} · {v.changes}</div></div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}
