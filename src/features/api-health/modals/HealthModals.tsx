import { useState } from "react";
import { Badge, Modal, Drawer, Steps, useToast } from "../../../components/ui";

/* ============================ 1. Incident Detail Drawer ============================ */
export function IncidentDetailDrawer({ incident, onClose }: { incident: string | null; onClose: () => void }) {
  if (!incident) return null;
  return (
    <Drawer open onClose={onClose} title={`${incident} — Incident Detail`} subtitle="Timeline, impact analysis and runbook" icon="bi-exclamation-octagon" wide>
      <div className="pm-card pm-card-pad mb-3">
        <div className="d-flex justify-content-between"><h5>{incident}</h5><Badge tone="amber" dot>Investigating</Badge></div>
        <div className="row g-3 mt-2">{[["Service", "National Bank validation"], ["Impact", "15.2s latency"], ["Owner", "Bank API team"], ["Opened", "14:30 EAT"]].map(x => <div className="col-md-3" key={x[0]}><div className="pm-eyebrow">{x[0]}</div><b className="small">{x[1]}</b></div>)}</div>
      </div>
      <div className="pm-card pm-card-pad mb-3"><h6>Incident timeline</h6>
        {[["14:30", "Elevated latency detected (>10s)", "warn"], ["14:31", "Alert escalated to Bank API team", "info"], ["14:32", "National Bank notified of degradation", "info"], ["14:35", "Workaround: reroute to Cooperative Bank", "done"]].map(t => <div className={`d-flex gap-2 py-1 border-bottom small`} key={t[0]}><span className="mono text-muted" style={{ width: 50 }}>{t[0]}</span><span>{t[1]}</span></div>)}
      </div>
      <div className="pm-card pm-card-pad"><h6>Affected services</h6>
        {[["PesaLink transfers (National Bank)", "Degraded"], ["Account validation (National Bank)", "Degraded"], ["Other bank transfers", "Healthy"]].map(s => <div className="d-flex justify-content-between py-1 border-bottom small" key={s[0]}><span>{s[0]}</span><Badge tone={s[1] === "Degraded" ? "amber" : "green"} dot>{s[1]}</Badge></div>)}
      </div>
    </Drawer>
  );
}

/* ============================ 2. Ecosystem Health Modal ============================ */
export function EcosystemHealthModal({ open, ecosystem, onClose }: { open: boolean; ecosystem: string; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`${ecosystem} — Health Detail`} subtitle="Endpoint-level health and latency analysis" icon="bi-grid" tone="green" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Endpoints", "12"], ["Healthy", "12"], ["Degraded", "0"], ["Health", "100%"]].map(x => <div className="col-md-3" key={x[0]}><div className="pm-card pm-card-pad text-center"><div className="pm-eyebrow">{x[0]}</div><div className="fw-bold">{x[1]}</div></div></div>)}</div>
        <h6>Endpoint status</h6>
        {[["STK Push", "3.2s", "0.08%", "99.98%", "Healthy"], ["STK Query", "1.1s", "0.02%", "99.99%", "Healthy"], ["B2C", "5.1s", "0.12%", "99.97%", "Healthy"], ["C2B Register", "0.8s", "0.00%", "100%", "Healthy"], ["Transaction Status", "1.8s", "0.03%", "99.99%", "Healthy"], ["Reversal", "4.2s", "0.15%", "99.96%", "Healthy"]].map(e => <div className="d-flex align-items-center gap-2 py-1 border-bottom small" key={e[0]}><span className="pm-td-strong" style={{ width: 130 }}>{e[0]}</span><span className="mono" style={{ width: 50 }}>{e[1]}</span><span style={{ width: 50 }}>{e[2]}</span><span style={{ width: 60 }}>{e[3]}</span><Badge tone="green" dot>{e[4]}</Badge></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 3. Bank Detail Modal ============================ */
export function BankDetailModal({ open, bank, onClose }: { open: boolean; bank: string; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`${bank} — Bank Integration Detail`} subtitle="PesaLink connectivity, latency and SLA" icon="bi-bank" tone="green" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Status", "Up", "green"], ["Transfer", "Healthy", "green"], ["Validation", "Healthy", "green"], ["Latency", "6.2s", "blue"]].map(x => <div className="col-md-3" key={x[0]}><div className="pm-card pm-card-pad text-center"><Badge tone={x[2] as any} dot>{x[0]}: {x[1]}</Badge></div></div>)}</div>
        <h6>Connection details</h6>
        {[["Bank code", "01"], ["PesaLink participant", "Yes"], ["API version", "v2.1"], ["Auth method", "Mutual TLS"], ["Circuit breaker", "Closed"], ["Last TXN", "14:31:50 EAT"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b>{x[1]}</b></div>)}
        <h6 className="mt-3">Recent transactions</h6>
        {[["14:31", "Transfer", "KES 45,000", "Success", "6.1s"], ["14:28", "Validation", "User #45678", "Success", "2.3s"], ["14:15", "Transfer", "KES 120,000", "Success", "7.8s"]].map(t => <div className="d-flex justify-content-between py-1 border-bottom small" key={t[0]}><span className="mono text-muted">{t[0]}</span><span className="pm-td-strong">{t[1]}</span><span>{t[2]}</span><Badge tone="green">{t[3]}</Badge><span className="mono">{t[4]}</span></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Health check queued" }); onClose(); }}>Run health check</button></div>
    </Modal>
  );
}

/* ============================ 4. Callback DLQ Detail Modal ============================ */
export function CallbackDlqModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Dead-Letter Queue Detail" subtitle="Unprocessed callback events requiring attention" icon="bi-arrow-repeat" tone="amber" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["DLQ events", "42"], ["Manual review", "3"], ["Auto-retryable", "39"], ["Avg age", "12 min"]].map(x => <div className="col-md-3" key={x[0]}><div className="pm-card pm-card-pad text-center"><div className="h5 mb-0">{x[1]}</div><div className="small text-muted">{x[0]}</div></div></div>)}</div>
        <h6>Events requiring manual review</h6>
        {[["EVT-88234", "loan.disbursed", "Invalid payload", "QuickLend", "30 min"], ["EVT-88190", "transaction.created", "Signature mismatch", "Corporate", "45 min"], ["EVT-88156", "user.flagged", "Endpoint unreachable", "ComplyAdvantage", "1h"]].map(e => <div className="d-flex justify-content-between align-items-center py-1 border-bottom small" key={e[0]}><div><b>{e[0]}</b> — <span className="text-muted">{e[1]}</span><div className="pm-td-sub">{e[2]} · {e[3]}</div></div><span className="text-muted">{e[4]}</span></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "39 events queued for retry" }); onClose(); }}>Retry auto-retryable</button></div>
    </Modal>
  );
}

/* ============================ 5. Circuit Breaker Status Modal ============================ */
export function CircuitBreakerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Circuit Breaker Status" subtitle="All 187 circuit breakers across the ecosystem" icon="bi-shield-check" tone="green" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["187", "Total", "blue"], ["187", "Closed (healthy)", "green"], ["0", "Open (tripped)", "green"], ["0", "Half-open", "green"]].map(x => <div className="col-md-3" key={x[1]}><div className="pm-card pm-card-pad text-center"><div className="h4 mb-0">{x[0]}</div><div className="small text-muted">{x[1]}</div></div></div>)}</div>
        <h6>Recent circuit breaker activity</h6>
        {[["14:32", "National Bank validation", "Closed", "green", "Recovered from half-open"], ["13:45", "UnionPay authorization", "Closed", "green", "Recovered from open"], ["12:00", "Webhook retry", "Closed", "green", "DLQ cleared"]].map(c => <div className="d-flex justify-content-between py-1 border-bottom small" key={c[0]}><div><span className="mono text-muted me-2">{c[0]}</span><b>{c[1]}</b><div className="pm-td-sub">{c[4]}</div></div><Badge tone={c[3] as any}>{c[2]}</Badge></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 6. Latency Analysis Modal ============================ */
export function LatencyAnalysisModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Latency Analysis" subtitle="Detailed percentile breakdown by API family" icon="bi-speedometer2" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>API Family</th><th>p50</th><th>p95</th><th>p99</th><th>Status</th></tr></thead><tbody>
          {[["M-Pesa", "1.2s", "3.2s", "8.5s", "Healthy"], ["PesaLink", "4.1s", "8.5s", "15.2s", "Watch"], ["Visa", "0.8s", "1.8s", "3.2s", "Healthy"], ["KCB Direct", "3.4s", "7.8s", "12.1s", "Healthy"], ["Onfido", "22s", "45s", "90s", "Healthy"], ["Nairobi Water", "3.8s", "8.2s", "18.4s", "Degraded"]].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 0 ? "pm-td-strong" : i < 3 ? "pm-num" : ""}>{i === 3 ? <Badge tone={c === "Healthy" ? "green" : "amber"} dot>{c}</Badge> : c}</td>)}</tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 7. Dependency Impact Modal ============================ */
export function DependencyImpactModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Dependency Impact Analysis" subtitle="What happens when an upstream provider fails" icon="bi-diagram-3" tone="amber" size="lg">
      <div className="pm-modal-body">
        <h6>Failure scenarios</h6>
        {[["M-Pesa down", "Payments halted · fallback to card rails", "High", "red"], ["PesaLink down", "Bank transfers paused · retry queue", "High", "red"], ["Visa down", "Card payments halted · fallback to M-Pesa", "High", "red"], ["Onfido down", "KYC verification paused · manual review", "Medium", "amber"], ["SendGrid down", "Email delivery paused · fallback to SMS", "Low", "green"], ["AWS degraded", "Multiple services affected · auto-failover", "Critical", "red"]].map(f => <div className="d-flex justify-content-between align-items-center py-2 border-bottom" key={f[0]}><div><b>{f[0]}</b><div className="pm-td-sub">{f[1]}</div></div><Badge tone={f[3] as any}>{f[2]}</Badge></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 8. Ecosystem Scan Wizard ============================ */
export function EcosystemScanWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  if (!open) return null;
  return (
    <Modal open onClose={() => { setStep(0); onClose(); }} title="Ecosystem Health Scan" subtitle="Check endpoint health, callbacks, circuit breakers and dependencies" icon="bi-broadcast" tone="blue" size="lg">
      <Steps current={step} steps={[{ label: "Scope", icon: "bi-grid" }, { label: "Checks", icon: "bi-heart-pulse" }, { label: "Impact", icon: "bi-diagram-3" }, { label: "Report", icon: "bi-file-earmark-bar-graph" }]} />
      <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 25}%` }} /></div>
      <div className="pm-modal-body">
        {step === 0 && <div className="row g-3"><div className="col-md-6"><label className="form-label">Scan scope</label><select className="form-select"><option>All 187 endpoints</option><option>Degraded only</option><option>Bank & mobile money</option></select></div><div className="col-md-6"><label className="form-label">Probe mode</label><select className="form-select"><option>Safe read-only health checks</option><option>Include callback tests</option></select></div></div>}
        {step === 1 && <div><h6>Checks to perform</h6>{["Endpoint reachability", "Response time measurement", "Error rate analysis", "Circuit breaker status", "Callback delivery health", "SSL certificate validity"].map(c => <div className="d-flex align-items-center gap-2 py-1 border-bottom small" key={c}><i className="bi bi-check-circle-fill text-success" /><span>{c}</span></div>)}</div>}
        {step === 2 && <div><h6>Scan preview</h6>{[["Endpoints", "187"], ["Ecosystems", "14"], ["Est. duration", "~45 seconds"], ["Est. failures", "0"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b>{x[1]}</b></div>)}</div>}
        {step === 3 && <div className="text-center py-3"><i className="bi bi-check-circle-fill text-success" style={{ fontSize: 48 }} /><h5 className="mt-3">Scan complete</h5><p className="small text-muted">187 endpoints checked · 172 healthy · 8 degraded · 0 down</p></div>}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={() => step ? setStep(step - 1) : onClose()}>{step ? "Back" : "Cancel"}</button>{step < 3 ? <button className="btn btn-primary" onClick={() => setStep(step + 1)}>Continue</button> : <button className="btn btn-primary" onClick={() => { setStep(0); push({ kind: "success", title: "Scan complete" }); onClose(); }}>Download report</button>}</div>
    </Modal>
  );
}

/* ============================ 9. Health Report Export Modal ============================ */
export function HealthReportExportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Export Health Report" subtitle="Generate a signed ecosystem health report" icon="bi-download" tone="blue">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Format</label><select className="form-select"><option>Signed PDF</option><option>JSON (machine-readable)</option><option>HTML report</option></select></div>
          <div className="col-md-6"><label className="form-label">Time range</label><select className="form-select"><option>Last 24 hours</option><option>Last 7 days</option><option>Last 30 days</option></select></div>
          <div className="col-12"><label className="form-label">Include</label>
            {["Endpoint latency data", "Error analysis", "Incident history", "Circuit breaker events", "Callback health"].map(i => <div className="form-check py-1" key={i}><input className="form-check-input" type="checkbox" id={`hr-${i}`} defaultChecked /><label className="form-check-label small" htmlFor={`hr-${i}`}>{i}</label></div>)}
          </div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Report generation started" }); onClose(); }}>Generate report</button></div>
    </Modal>
  );
}

/* ============================ 10. Endpoint Detail Modal ============================ */
export function EndpointDetailModal({ open, endpoint, onClose }: { open: boolean; endpoint: string; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`${endpoint} — Endpoint Detail`} subtitle="Real-time health, latency and error profile" icon="bi-diagram-3" tone="green" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Health", "Up", "green"], ["p95", "3.2s", "blue"], ["Error rate", "0.08%", "green"], ["Uptime", "99.98%", "green"]].map(x => <div className="col-md-3" key={x[0]}><div className="pm-card pm-card-pad text-center"><Badge tone={x[2] as any} dot>{x[0]}: {x[1]}</Badge></div></div>)}</div>
        <h6>Last 10 requests</h6>
        {[["14:32:01", "200 OK", "3.1s", "Success"], ["14:31:58", "200 OK", "3.4s", "Success"], ["14:31:55", "200 OK", "2.9s", "Success"], ["14:31:50", "503 Timeout", "12.0s", "Retry"], ["14:31:45", "200 OK", "3.2s", "Success"]].map(r => <div className="d-flex justify-content-between py-1 border-bottom small" key={r[0]}><span className="mono text-muted">{r[0]}</span><span>{r[1]}</span><span className="mono">{r[2]}</span><Badge tone={r[3] === "Success" ? "green" : "amber"}>{r[3]}</Badge></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 11. Latency Heatmap Detail Modal ============================ */
export function LatencyHeatmapDetailModal({ open, provider, onClose }: { open: boolean; provider: string; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`${provider} — Latency Heatmap`} subtitle="Detailed latency distribution over time" icon="bi-speedometer2" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["p50", "1.2s"], ["p95", "3.2s"], ["p99", "8.5s"], ["Max", "12.3s"]].map(x => <div className="col-md-3" key={x[0]}><div className="pm-card pm-card-pad text-center"><div className="pm-eyebrow">{x[0]}</div><div className="fw-bold">{x[1]}</div></div></div>)}</div>
        <h6>Hourly breakdown</h6>
        {[["00:00", "0.8s", "Healthy"], ["04:00", "0.6s", "Healthy"], ["08:00", "2.1s", "Healthy"], ["12:00", "3.8s", "Watch"], ["14:00", "4.2s", "Watch"], ["16:00", "3.1s", "Healthy"], ["20:00", "1.5s", "Healthy"]].map(h => <div className="d-flex justify-content-between py-1 border-bottom small" key={h[0]}><span className="mono">{h[0]}</span><span>{h[1]}</span><Badge tone={h[2] === "Healthy" ? "green" : "amber"}>{h[2]}</Badge></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 12. Callback Detail Modal ============================ */
export function CallbackDetailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Callback Registry Detail" subtitle="Callback delivery, retry and validation" icon="bi-arrow-repeat" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["24h callbacks", "456,780"], ["Success rate", "99.98%"], ["Avg response", "45ms"], ["DLQ events", "42"]].map(x => <div className="col-md-3" key={x[0]}><div className="pm-card pm-card-pad text-center"><div className="pm-eyebrow">{x[0]}</div><div className="fw-bold">{x[1]}</div></div></div>)}</div>
        <h6>Safeguards</h6>
        {[["Signature verification", "HMAC + timestamp window"], ["Retry policy", "3 attempts · exponential backoff"], ["DLQ retention", "14 days encrypted"], ["Replay protection", "Event ID deduplication"], ["Max payload", "256 KB"], ["Timeout", "30 seconds"]].map(s => <div className="d-flex justify-content-between py-1 border-bottom small" key={s[0]}><span className="text-muted">{s[0]}</span><b>{s[1]}</b></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 13. Mobile Money Detail Modal ============================ */
export function MpesaDetailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="M-Pesa Integration Detail" subtitle="Safaricom mobile money endpoint health and configuration" icon="bi-phone" tone="green" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["12", "Endpoints", "green"], ["12", "Healthy", "green"], ["0", "Degraded", "green"], ["100%", "Health", "green"]].map(x => <div className="col-md-3" key={x[1]}><div className="pm-card pm-card-pad text-center"><div className="h5 mb-0">{x[0]}</div><div className="small text-muted">{x[1]}</div></div></div>)}</div>
        <h6>Configuration</h6>
        {[["Consumer key", "****...7823"], ["Short code", "174379"], ["Passkey", "****...encrypted"], ["Callback URL", "api.paymo.co.ke/callback/mpesa"], ["Environment", "Production"], ["Certificate", "Valid until Jan 2027"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b className="mono">{x[1]}</b></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 14. Alert History Modal ============================ */
export function AlertHistoryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Interconnection Alert History" subtitle="Recent alerts and their resolution status" icon="bi-bell" tone="amber" size="lg">
      <div className="pm-modal-body">
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Time</th><th>Service</th><th>Alert</th><th>Severity</th><th>Status</th></tr></thead><tbody>
          {[["14:30", "National Bank", "High latency (>10s)", "Warning", "Investigating"], ["13:45", "UnionPay", "Endpoint unavailable", "Critical", "Mitigating"], ["12:00", "Webhooks", "DLQ backlog (>40)", "Warning", "Monitoring"], ["10:30", "Nairobi Water", "Validation timeout", "Warning", "Resolved"], ["08:15", "PesaLink", "Transfer delay", "Info", "Resolved"]].map(r => <tr key={r[0]}><td className="mono">{r[0]}</td><td className="pm-td-strong">{r[1]}</td><td>{r[2]}</td><td><Badge tone={r[3] === "Critical" ? "red" : r[3] === "Warning" ? "amber" : "blue"}>{r[3]}</Badge></td><td><Badge tone={r[4] === "Resolved" ? "green" : "amber"}>{r[4]}</Badge></td></tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={onClose}>Export digest</button></div>
    </Modal>
  );
}

/* ============================ 15. Ecosystem Comparison Modal ============================ */
export function EcosystemComparisonModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Ecosystem Comparison" subtitle="Side-by-side health comparison across provider families" icon="bi-arrows-angle-contract" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-2 mb-3"><div className="col"><select className="form-select"><option>Mobile Money · M-Pesa</option><option>Bank APIs · PesaLink</option><option>Card Networks · Visa</option></select></div><div className="col"><select className="form-select"><option>Bank APIs · PesaLink</option><option>Card Networks · Visa</option><option>Internal Microservices</option></select></div></div>
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Metric</th><th>M-Pesa</th><th>PesaLink</th></tr></thead><tbody>
          {[["Endpoints", "12", "8"], ["Healthy", "12", "7"], ["Degraded", "0", "1"], ["Health score", "100%", "95.2%"], ["Avg latency", "3.2s", "8.5s"], ["Error rate", "0.08%", "0.15%"], ["Uptime (30d)", "99.98%", "99.95%"], ["Circuit breakers", "All closed", "All closed"]].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 0 ? "pm-td-strong" : ""}>{c}</td>)}</tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}
