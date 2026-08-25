import { useState } from "react";
import { Modal, Drawer, Badge, Avatar, Steps, useToast } from "../../../components/ui";
import { kes, num } from "../../../lib/format";

/* ============================ 1. Application detail modal ============================ */
export function ApplicationDetailModal({ app, onClose }: { app: { name: string; type: string; received: string; stage: string; assigned: string; priority: string; goLive: string } | null; onClose: () => void }) {
  if (!app) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-inboxes" tone="blue" title="Application detail" subtitle={app.name}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Applicant</span><span className="v">{app.name}</span></div>
        <div className="pm-kv"><span className="k">Type</span><span className="v"><Badge tone="blue">{app.type}</Badge></span></div>
        <div className="pm-kv"><span className="k">Received</span><span className="v">{app.received}</span></div>
        <div className="pm-kv"><span className="k">Stage</span><span className="v"><Badge tone="amber">{app.stage}</Badge></span></div>
        <div className="pm-kv"><span className="k">Assigned to</span><span className="v">{app.assigned}</span></div>
        <div className="pm-kv"><span className="k">Priority</span><span className="v"><Badge tone={app.priority === "High" ? "red" : app.priority === "Medium" ? "amber" : "green"}>{app.priority}</Badge></span></div>
        <div className="pm-kv"><span className="k">Est. go-live</span><span className="v">{app.goLive}</span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 2. Pipeline stage detail modal ============================ */
export function PipelineStageDetailModal({ stage, onClose }: { stage: { name: string; partners: string; avgTime: string; bottleneck: string } | null; onClose: () => void }) {
  if (!stage) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-kanban" tone="blue" title="Pipeline stage" subtitle={stage.name}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Stage</span><span className="v">{stage.name}</span></div>
        <div className="pm-kv"><span className="k">Partners</span><span className="v pm-num">{stage.partners}</span></div>
        <div className="pm-kv"><span className="k">Avg time</span><span className="v">{stage.avgTime}</span></div>
        <div className="pm-kv"><span className="k">Bottleneck</span><span className="v">{stage.bottleneck}</span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 3. Due diligence checklist detail ============================ */
export function DueDiligenceDetailModal({ item, onClose }: { item: { category: string; requirement: string; status: string; responsible: string } | null; onClose: () => void }) {
  if (!item) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-file-earmark-check" tone="blue" title="Checklist detail" subtitle={item.requirement}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Category</span><span className="v"><Badge tone="blue">{item.category}</Badge></span></div>
        <div className="pm-kv"><span className="k">Requirement</span><span className="v">{item.requirement}</span></div>
        <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone={item.status === "Verified" || item.status === "Clear" ? "green" : "amber"} dot>{item.status}</Badge></span></div>
        <div className="pm-kv"><span className="k">Responsible</span><span className="v">{item.responsible}</span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 4. Integration progress modal ============================ */
export function IntegrationProgressModal({ partner, onClose }: { partner: { name: string; apiSpec: string; devEnv: string; sandbox: string; uat: string; production: string } | null; onClose: () => void }) {
  if (!partner) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-plug" tone="blue" title="Integration progress" subtitle={partner.name}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Partner</span><span className="v">{partner.name}</span></div>
        <div className="pm-kv"><span className="k">API spec</span><span className="v"><Badge tone="green">{partner.apiSpec}</Badge></span></div>
        <div className="pm-kv"><span className="k">Dev environment</span><span className="v"><Badge tone="green">{partner.devEnv}</Badge></span></div>
        <div className="pm-kv"><span className="k">Sandbox testing</span><span className="v"><Badge tone={partner.sandbox === "Yes" ? "green" : "amber"}>{partner.sandbox}</Badge></span></div>
        <div className="pm-kv"><span className="k">UAT</span><span className="v"><Badge tone={partner.uat === "Yes" ? "green" : "amber"}>{partner.uat}</Badge></span></div>
        <div className="pm-kv"><span className="k">Production</span><span className="v"><Badge tone={partner.production === "Yes" ? "green" : "grey"}>{partner.production}</Badge></span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 5. Sandbox detail modal ============================ */
export function SandboxDetailModal({ sandbox, onClose }: { sandbox: { partner: string; url: string; keys: string; testData: string; expiry: string } | null; onClose: () => void }) {
  if (!sandbox) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-window" tone="blue" title="Sandbox detail" subtitle={sandbox.partner}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Partner</span><span className="v">{sandbox.partner}</span></div>
        <div className="pm-kv"><span className="k">Sandbox URL</span><span className="v mono">{sandbox.url}</span></div>
        <div className="pm-kv"><span className="k">API keys</span><span className="v">{sandbox.keys}</span></div>
        <div className="pm-kv"><span className="k">Test data</span><span className="v">{sandbox.testData}</span></div>
        <div className="pm-kv"><span className="k">Access expiry</span><span className="v">{sandbox.expiry}</span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 6. Rejection detail modal ============================ */
export function RejectionDetailModal({ rejection, onClose }: { rejection: { applicant: string; date: string; reason: string; stage: string; communication: string } | null; onClose: () => void }) {
  if (!rejection) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-x-circle" tone="red" title="Rejection detail" subtitle={rejection.applicant}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Applicant</span><span className="v">{rejection.applicant}</span></div>
        <div className="pm-kv"><span className="k">Date</span><span className="v">{rejection.date}</span></div>
        <div className="pm-kv"><span className="k">Reason</span><span className="v">{rejection.reason}</span></div>
        <div className="pm-kv"><span className="k">Stage</span><span className="v">{rejection.stage}</span></div>
        <div className="pm-kv"><span className="k">Communication</span><span className="v">{rejection.communication}</span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 7. Onboarding analytics modal ============================ */
export function OnboardingAnalyticsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const stats = [
    { label: "Applications in flight", value: "12", color: "#2e90fa" },
    { label: "Avg time to live", value: "38 days", color: "#12b76a" },
    { label: "Due diligence active", value: "6", color: "#7a5af8" },
    { label: "UAT testing", value: "3", color: "#f79009" },
    { label: "Go-live approvals", value: "2", color: "#ee46bc" },
    { label: "Rejection rate", value: "15%", color: "#f04438" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-graph-up" tone="blue" title="Onboarding analytics" subtitle="Pipeline performance metrics">
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

/* ============================ 8. Onboarding insights modal ============================ */
export function OnboardingInsightsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const insights = [
    { icon: "bi-graph-up", title: "Pipeline velocity up", detail: "15% faster time-to-live vs last quarter", tone: "green" },
    { icon: "bi-exclamation-triangle", title: "Due diligence bottleneck", detail: "6 partners waiting for document review", tone: "amber" },
    { icon: "bi-check-circle", title: "UAT pass rate high", detail: "98% pass rate across active UATs", tone: "green" },
    { icon: "bi-clock-history", title: "Go-live approvals pending", detail: "2 partners awaiting final sign-off", tone: "amber" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-lightbulb" tone="blue" title="Onboarding insights" subtitle="AI-powered analysis">
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

/* ============================ 9. Application comparison modal ============================ */
export function ApplicationCompareModal({ apps, onClose }: { apps: { name: string; stage: string; priority: string; goLive: string }[]; onClose: () => void }) {
  if (apps.length < 2) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-arrow-left-right" tone="blue" title="Compare applications" subtitle="Side-by-side comparison">
      <div className="pm-card pm-table-wrap">
        <table className="pm-table">
          <thead><tr><th>Field</th><th>{apps[0].name}</th><th>{apps[1].name}</th></tr></thead>
          <tbody>
            {["stage", "priority", "goLive"].map((k) => (
              <tr key={k}><td className="pm-td-strong">{k}</td><td>{apps[0][k as keyof typeof apps[0]]}</td><td>{apps[1][k as keyof typeof apps[0]]}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </Drawer>
  );
}

/* ============================ 10. Onboarding forecast modal ============================ */
export function OnboardingForecastModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const forecast = [
    { month: "Sep 2026", goLive: 3, inPipeline: 8, rejected: 1 },
    { month: "Oct 2026", goLive: 4, inPipeline: 6, rejected: 0 },
    { month: "Nov 2026", goLive: 2, inPipeline: 5, rejected: 1 },
    { month: "Dec 2026", goLive: 3, inPipeline: 4, rejected: 0 },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-calendar-range" tone="blue" title="Onboarding forecast" subtitle="Next 4 months projection">
      <div className="d-flex flex-column gap-2">
        {forecast.map((f) => (
          <div key={f.month} className="pm-card pm-card-pad">
            <div style={{ fontWeight: 700, fontSize: ".88rem", marginBottom: 4 }}>{f.month}</div>
            <div className="d-flex gap-2" style={{ fontSize: ".78rem" }}>
              <span style={{ color: "#12b76a" }}>Go-live: {f.goLive}</span>
              <span style={{ color: "#2e90fa" }}>Pipeline: {f.inPipeline}</span>
              <span style={{ color: "#f04438" }}>Rejected: {f.rejected}</span>
            </div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 11. Onboarding audit trail modal ============================ */
export function OnboardingAuditModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const entries = [
    { id: "AUD-ONB-88102", time: "22 Aug 2026", who: "Jeckonia Kwasa", action: "UAT approved", detail: "Kenya Airways passed all test cases" },
    { id: "AUD-ONB-88045", time: "20 Aug 2026", who: "Grace Wanjiru", action: "Due diligence completed", detail: "LipaLater document review finished" },
    { id: "AUD-ONB-87988", time: "18 Aug 2026", who: "System", action: "Sandbox keys issued", detail: "PesaLink sandbox credentials generated" },
    { id: "AUD-ONB-87901", time: "15 Aug 2026", who: "Peter Njoroge", action: "Application received", detail: "HELB application added to queue" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-clock-history" tone="blue" title="Onboarding audit trail" subtitle="Immutable change log">
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

/* ============================ 12. Onboarding export modal ============================ */
export function OnboardingExportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [format, setFormat] = useState("csv");
  return (
    <Modal open={open} onClose={onClose} tone="blue" icon="bi-download" size="md" title="Export onboarding data" subtitle="Choose format and content">
      <div className="pm-modal-body">
        <label className="form-label">Format</label>
        <div className="d-flex gap-2 mb-3">
          {["csv", "json", "xlsx"].map((f) => <button key={f} className={`pm-chip ${format === f ? "active" : ""}`} onClick={() => setFormat(f)}>{f.toUpperCase()}</button>)}
        </div>
        <label className="form-label">Include</label>
        <div className="d-flex flex-column gap-2">
          {["Applications", "Pipeline data", "Due diligence", "Sandbox status"].map((l) => (
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

/* ============================ 13. Onboarding search modal ============================ */
export function OnboardingSearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [query, setQuery] = useState("");
  return (
    <Modal open={open} onClose={onClose} tone="blue" icon="bi-search" size="md" title="Search onboarding" subtitle="Search across all applications">
      <div className="pm-modal-body">
        <label className="form-label">Search criteria</label>
        <input className="form-control mb-3" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Applicant, stage, owner..." />
        <label className="form-label">Filters</label>
        <div className="row g-2 mb-3">
          <div className="col-6"><label className="form-label">Stage</label><select className="form-select"><option>All stages</option>{["Application", "Screening", "Due Diligence", "Integration", "UAT", "Go-live"].map((s) => <option key={s}>{s}</option>)}</select></div>
          <div className="col-6"><label className="form-label">Priority</label><select className="form-select"><option>All priorities</option>{["High", "Medium", "Normal"].map((p) => <option key={p}>{p}</option>)}</select></div>
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

/* ============================ 14. Onboarding health modal ============================ */
export function OnboardingHealthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const health = 82;
  return (
    <Drawer open={open} onClose={onClose} icon="bi-heart-pulse" tone={health > 80 ? "green" : "amber"} title="Onboarding health" subtitle="Overall pipeline health">
      <div className="pm-card pm-card-pad mb-3 text-center">
        <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "2.5rem", color: health > 80 ? "#12b76a" : "#f79009" }}>{health}</div>
        <div style={{ fontSize: ".76rem", color: "var(--pm-muted)" }}>Health score</div>
      </div>
      <div className="d-flex flex-column gap-2">
        {[{ label: "Pipeline velocity", value: "Good" }, { label: "Due diligence", value: "Watch" }, { label: "UAT pass rate", value: "Excellent" }].map((f) => (
          <div key={f.label} className="pm-card pm-card-pad d-flex align-items-center justify-content-between">
            <span style={{ fontWeight: 700, fontSize: ".84rem" }}>{f.label}</span>
            <Badge tone={f.value === "Excellent" ? "green" : f.value === "Good" ? "blue" : "amber"}>{f.value}</Badge>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 15. Onboarding workflow detail modal ============================ */
export function WorkflowDetailModal({ setting, onClose }: { setting: { label: string; value: string; owner: string; status: string } | null; onClose: () => void }) {
  if (!setting) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-gear" tone="blue" title="Workflow setting" subtitle={setting.label}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Setting</span><span className="v">{setting.label}</span></div>
        <div className="pm-kv"><span className="k">Value</span><span className="v">{setting.value}</span></div>
        <div className="pm-kv"><span className="k">Owner</span><span className="v">{setting.owner}</span></div>
        <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone="green" dot>{setting.status}</Badge></span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 16. Go-live checklist modal ============================ */
export function GoLiveChecklistModal({ partner, onClose }: { partner: string | null; onClose: () => void }) {
  if (!partner) return null;
  const checks = [
    { label: "Due diligence complete", status: "Pass" },
    { label: "Technical assessment passed", status: "Pass" },
    { label: "UAT completed (100% critical)", status: "Pass" },
    { label: "Security review approved", status: "Pass" },
    { label: "Contract signed", status: "Pending" },
    { label: "Go-live approval", status: "Pending" },
  ];
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-patch-check" size="md" title="Go-live checklist" subtitle={partner}>
      <div className="pm-modal-body">
        <div className="d-flex flex-column gap-2">
          {checks.map((c) => (
            <div key={c.label} className="pm-card pm-card-pad d-flex align-items-center gap-3">
              <i className={`bi ${c.status === "Pass" ? "bi-check-circle-fill" : "bi-hourglass-split"}`} style={{ color: c.status === "Pass" ? "#12b76a" : "#f79009" }} />
              <div className="flex-grow-1"><div style={{ fontWeight: 700, fontSize: ".84rem" }}>{c.label}</div></div>
              <Badge tone={c.status === "Pass" ? "green" : "amber"}>{c.status}</Badge>
            </div>
          ))}
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-primary btn-sm" onClick={onClose}>Close</button></div>
    </Modal>
  );
}
