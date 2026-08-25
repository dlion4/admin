import { useState } from "react";
import { Badge, Modal, Drawer, Steps, useToast } from "../../../components/ui";

/* ============================ 1. API Key Detail Drawer ============================ */
export function ApiKeyDetailDrawer({ keyName, onClose }: { keyName: string | null; onClose: () => void }) {
  if (!keyName) return null;
  return (
    <Drawer open onClose={onClose} title={`${keyName} — API Key Detail`} subtitle="Credential health, usage and security controls" icon="bi-key" wide>
      <div className="pm-card pm-card-pad mb-3">
        <div className="d-flex justify-content-between"><h5>{keyName}</h5><Badge tone="green" dot>Active</Badge></div>
        <div className="row g-3 mt-2">{[["Key", "pk_live_****...7823"], ["Created", "Jan 2024"], ["Last used", "2 min ago"], ["Rate limit", "10K/min"]].map(x => <div className="col-md-6" key={x[0]}><div className="pm-eyebrow">{x[0]}</div><b className="small mono">{x[1]}</b></div>)}</div>
      </div>
      <div className="pm-card pm-card-pad mb-3"><h6>Usage (24h)</h6>
        {[["Requests", "2,345,678"], ["Error rate", "0.01%"], ["Avg latency", "45ms"], ["p95 latency", "120ms"], ["p99 latency", "340ms"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b>{x[1]}</b></div>)}
      </div>
      <div className="pm-card pm-card-pad"><h6>Quick actions</h6>
        <div className="d-grid gap-2">{[["bi-arrow-repeat", "Rotate credentials", "outline-primary"], ["bi-pencil", "Adjust rate limits", "outline-secondary"], ["bi-trash", "Revoke key", "outline-danger"]].map(x => <button key={x[1]} className={`btn btn-sm btn-${x[2]}`}><i className={`bi ${x[0]} me-1`} />{x[1]}</button>)}</div>
      </div>
    </Drawer>
  );
}

/* ============================ 2. Credential Rotation Modal ============================ */
export function RotateCredentialsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Rotate API Credentials" subtitle="Revoke current key and issue a new one with 24h overlap" icon="bi-arrow-repeat" tone="amber">
      <div className="pm-modal-body">
        <div className="alert alert-warning small"><i className="bi bi-exclamation-triangle me-1" />The old key will remain valid for 24 hours to allow client migration.</div>
        <div className="row g-3">
          <div className="col-12"><label className="form-label">Current key</label><input className="form-control mono" value="pk_live_****...7823" readOnly /></div>
          <div className="col-12"><label className="form-label">Overlap period</label><select className="form-select"><option>24 hours (recommended)</option><option>48 hours</option><option>Immediate (breaking)</option></select></div>
          <div className="col-12"><label className="form-label">Notify consumers</label><div className="form-check"><input className="form-check-input" type="checkbox" id="rot-notify" defaultChecked /><label className="form-check-label small" htmlFor="rot-notify">Send email to key owner</label></div></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-warning" onClick={() => { push({ kind: "success", title: "Rotation initiated" }); onClose(); }}>Rotate with 2FA</button></div>
    </Modal>
  );
}

/* ============================ 3. Webhook Delivery Log Drawer ============================ */
export function WebhookDeliveryDrawer({ webhook, onClose }: { webhook: string | null; onClose: () => void }) {
  if (!webhook) return null;
  const deliveries = [["14:32:01", "loan.disbursed", "200 OK", "142ms", "Success"], ["14:15:23", "loan.repaid", "200 OK", "98ms", "Success"], ["13:45:12", "loan.disbursed", "503 Timeout", "5012ms", "Retry #1"], ["12:30:00", "loan.overdue", "200 OK", "156ms", "Success"]];
  return (
    <Drawer open onClose={onClose} title={`${webhook} — Delivery Log`} subtitle="Webhook delivery history and retry status" icon="bi-broadcast" wide>
      <div className="pm-card pm-card-pad mb-3"><Badge tone="green" dot>Active</Badge>
        <div className="row g-3 mt-2">{[["URL", "api.quicklend.co.ke/webhook"], ["Success rate", "98.5%"], ["Total deliveries", "12,456"], ["Last delivery", "5 min ago"]].map(x => <div className="col-md-6" key={x[0]}><div className="pm-eyebrow">{x[0]}</div><b className="small">{x[1]}</b></div>)}</div>
      </div>
      <div className="pm-card pm-card-pad"><h6>Recent deliveries</h6>
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Time</th><th>Event</th><th>Response</th><th>Latency</th><th>Status</th></tr></thead><tbody>
          {deliveries.map((d, i) => <tr key={i}><td className="mono">{d[0]}</td><td className="pm-td-strong">{d[1]}</td><td>{d[2]}</td><td className="pm-num">{d[3]}</td><td><Badge tone={d[4] === "Success" ? "green" : "amber"} dot>{d[4]}</Badge></td></tr>)}
        </tbody></table></div>
      </div>
    </Drawer>
  );
}

/* ============================ 4. Rate Limit Policy Modal ============================ */
export function RateLimitPolicyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Rate Limit Policy" subtitle="Configure global and per-key rate limiting" icon="bi-speedometer2" tone="amber" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3">
          {[["Default (general)", "1000", "60"], ["Search endpoints", "100", "60"], ["Auth endpoints", "20", "60"], ["Export endpoints", "3", "3600"], ["Webhook callbacks", "500", "60"], ["KYC submissions", "5", "3600"]].map((r, i) => <div className="col-md-4" key={i}><label className="form-label">{r[0]}</label><div className="input-group"><input className="form-control" defaultValue={r[1]} /><span className="input-group-text">/ {r[2]}s</span></div></div>)}
          <div className="col-12"><label className="form-label">Response on limit</label><select className="form-select"><option>429 + Retry-After header</option><option>Queue and delay</option><option>Drop silently</option></select></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Rate limits saved" }); onClose(); }}>Save with 2FA</button></div>
    </Modal>
  );
}

/* ============================ 5. API Error Investigation Modal ============================ */
export function ErrorInvestigationModal({ open, error, onClose }: { open: boolean; error: string; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`Investigate: ${error}`} subtitle="Root-cause analysis and remediation" icon="bi-exclamation-triangle" tone="amber" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Count (24h)", "123"], ["Share", "52.6%"], ["Top endpoint", "/transactions"], ["Root cause", "Invalid amount format"]].map(x => <div className="col-md-3" key={x[0]}><div className="pm-card pm-card-pad text-center"><div className="pm-eyebrow">{x[0]}</div><div className="small fw-bold">{x[1]}</div></div></div>)}</div>
        <h6>Sample errors</h6>
        {[["14:32", "POST /transactions", "amount must be positive", "Client validation failed"], ["14:28", "POST /transactions", "amount exceeds limit", "Limit exceeded"], ["14:15", "POST /transactions", "missing currency field", "Missing parameter"]].map(e => <div className="d-flex align-items-center gap-2 py-1 border-bottom small" key={e[0]}><span className="mono text-muted" style={{ width: 50 }}>{e[0]}</span><span className="pm-td-strong">{e[1]}</span><span className="text-muted ms-auto">{e[2]}</span></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Ticket created" }); onClose(); }}>Create engineering ticket</button></div>
    </Modal>
  );
}

/* ============================ 6. Integration Health Modal ============================ */
export function IntegrationHealthModal({ open, provider, onClose }: { open: boolean; provider: string; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`${provider} — Integration Health`} subtitle="Provider connectivity, uptime and SLA details" icon="bi-plug" tone="green" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Uptime (30d)", "99.98%", "green"], ["Avg latency", "3.2s", "blue"], ["Error rate", "0.08%", "green"], ["Contract end", "Jan 2027", "blue"]].map(x => <div className="col-md-3" key={x[0]}><div className="pm-card pm-card-pad text-center"><Badge tone={x[2] as any}>{x[0]}</Badge><div className="h5 mt-2 mb-0">{x[1]}</div></div></div>)}</div>
        <h6>Endpoint health</h6>
        {[["STK Push", "Up", "green", "3.2s"], ["B2C", "Up", "green", "5.1s"], ["C2B Register", "Up", "green", "0.8s"], ["Transaction Status", "Up", "green", "1.8s"]].map(e => <div className="d-flex justify-content-between py-1 border-bottom small" key={e[0]}><span className="pm-td-strong">{e[0]}</span><div><Badge tone={e[2] as any} dot>{e[1]}</Badge> <span className="mono ms-2">{e[3]}</span></div></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 7. API Version Modal ============================ */
export function ApiVersionModal({ open, version, onClose }: { open: boolean; version: string; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`API ${version} Details`} subtitle="Version lifecycle, endpoints and migration status" icon="bi-book" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Status", version === "v1" ? "Deprecated" : version === "v2" ? "Current" : "Beta"], ["Endpoints", version === "v1" ? "42" : version === "v2" ? "68" : "12"], ["Sunset", version === "v1" ? "Jul 2027" : "N/A"]].map(x => <div className="col-md-4" key={x[0]}><div className="pm-card pm-card-pad text-center"><div className="pm-eyebrow">{x[0]}</div><div className="fw-bold">{x[1]}</div></div></div>)}</div>
        <h6>Migration checklist</h6>
        {[["Update SDK to v2 compatible", version === "v1" ? "Required" : "N/A"], ["Update auth headers", version === "v1" ? "Required" : "Optional"], ["Update response parsing", version === "v1" ? "Required" : "Optional"], ["Run integration tests", "Always"]].map(m => <div className="d-flex justify-content-between py-1 border-bottom small" key={m[0]}><span>{m[0]}</span><Badge tone={m[1] === "Required" ? "amber" : "grey"}>{m[1]}</Badge></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button>{version === "v3" && <button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Access request sent" }); onClose(); }}>Request sandbox access</button>}</div>
    </Modal>
  );
}

/* ============================ 8. Webhook Register Modal ============================ */
export function WebhookRegisterModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Register Webhook" subtitle="Subscribe to platform events with endpoint validation" icon="bi-broadcast" tone="blue">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-12"><label className="form-label">Endpoint URL</label><input className="form-control" placeholder="https://your-app.com/webhook" /></div>
          <div className="col-md-6"><label className="form-label">Events</label><select className="form-select" multiple defaultValue={["transaction.created"]}><option value="transaction.created">transaction.created</option><option value="transaction.completed">transaction.completed</option><option value="user.flagged">user.flagged</option><option value="loan.disbursed">loan.disbursed</option><option value="loan.repaid">loan.repaid</option></select></div>
          <div className="col-md-6"><label className="form-label">Signing secret</label><input className="form-control" value="whsec_****...generated" readOnly /><div className="form-text">Auto-generated HMAC-SHA256 secret</div></div>
          <div className="col-12"><label className="form-label">Retry policy</label><select className="form-select"><option>3 attempts · exponential backoff</option><option>5 attempts · linear backoff</option><option>No retries</option></select></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Webhook registered" }); onClose(); }}>Register and verify</button></div>
    </Modal>
  );
}

/* ============================ 9. API Usage Analytics Modal ============================ */
export function ApiUsageAnalyticsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="API Usage Analytics" subtitle="Traffic patterns and consumer breakdown" icon="bi-graph-up-arrow" tone="violet" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["3.5M", "Requests/24h", "blue"], ["0.01%", "Error rate", "green"], ["45ms", "Avg latency", "blue"], ["120ms", "p95 latency", "amber"]].map(x => <div className="col-md-3" key={x[1]}><div className="pm-card pm-card-pad text-center"><div className="h5 mb-0">{x[0]}</div><div className="small text-muted">{x[1]}</div></div></div>)}</div>
        <h6>Top consumers</h6>
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Consumer</th><th>Requests</th><th>Share</th><th>Avg latency</th><th>Error rate</th></tr></thead><tbody>
          {[["Production — Main", "2,345,678", "67%", "45ms", "0.01%"], ["Production — Partner", "890,123", "25%", "78ms", "0.01%"], ["Internal — Batch", "234,567", "7%", "200ms", "0%"]].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 0 ? "pm-td-strong" : "pm-num"}>{c}</td>)}</tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 10. API Key Scope Editor Modal ============================ */
export function ApiKeyScopeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="API Key Permission Scope" subtitle="Configure granular access permissions for this key" icon="bi-shield-check" tone="blue" size="lg">
      <div className="pm-modal-body">
        <h6>Endpoint categories</h6>
        {[["Users", true], ["Transactions", true], ["Transfers", false], ["Cards", true], ["Loans", false], ["KYC", false], ["Webhooks", true], ["Admin", false]].map(p => <div className="form-check py-1" key={p[0]}><input className="form-check-input" type="checkbox" id={`scope-${p[0]}`} defaultChecked={p[1]} /><label className="form-check-label small" htmlFor={`scope-${p[0]}`}>{p[0]}</label></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Scope updated" }); onClose(); }}>Save scope</button></div>
    </Modal>
  );
}

/* ============================ 11. API Documentation Drawer ============================ */
export function ApiDocsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Drawer open onClose={onClose} title="Developer Documentation" subtitle="API reference, guides and SDKs" icon="bi-book" wide>
      <div className="pm-card pm-card-pad mb-3"><h6>Quick links</h6>
        {[["API Reference v2", "Complete endpoint documentation", "bi-file-text"], ["Authentication Guide", "API keys, OAuth and 2FA", "bi-key"], ["Webhook Guide", "Event types and delivery", "bi-broadcast"], ["SDKs", "Python, Node.js, Java, Go", "bi-code-square"], ["Changelog", "v2 → v3 migration notes", "bi-journal-text"]].map(d => <div className="d-flex align-items-center gap-2 py-2 border-bottom small" key={d[0]}><i className={`bi ${d[2]} text-primary`} /><div><b>{d[0]}</b><div className="pm-td-sub">{d[1]}</div></div><i className="bi bi-box-arrow-up-right ms-auto text-muted" /></div>)}
      </div>
    </Drawer>
  );
}

/* ============================ 12. API Test Console Modal ============================ */
export function ApiTestConsoleModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="API Test Console" subtitle="Execute test requests against sandbox endpoints" icon="bi-terminal" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-md-3"><label className="form-label">Method</label><select className="form-select"><option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option></select></div>
          <div className="col-md-9"><label className="form-label">Endpoint</label><input className="form-control mono" defaultValue="/v2/users" /></div>
          <div className="col-12"><label className="form-label">Headers</label><textarea className="form-control mono" rows={2} defaultValue={"Authorization: Bearer pk_test_****\nContent-Type: application/json"} /></div>
          <div className="col-12"><label className="form-label">Body (JSON)</label><textarea className="form-control mono" rows={3} defaultValue='{"phone": "+254712345678", "amount": 1000}' /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Request sent — 200 OK" }); onClose(); }}>Send request</button></div>
    </Modal>
  );
}

/* ============================ 13. Key Revocation Modal ============================ */
export function KeyRevocationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Revoke API Key" subtitle="Immediately invalidate all requests using this credential" icon="bi-trash" tone="red">
      <div className="pm-modal-body">
        <div className="alert alert-danger small"><i className="bi bi-exclamation-triangle me-1" />All requests using this key will be rejected immediately. This cannot be undone.</div>
        <div className="row g-3">
          <div className="col-12"><label className="form-label">Key</label><input className="form-control mono" value="pk_live_****...9012" readOnly /></div>
          <div className="col-12"><label className="form-label">Reason</label><select className="form-select"><option>Compromised</option><option>No longer needed</option><option>Rotated</option><option>Partner offboarding</option></select></div>
          <div className="col-12"><label className="form-label">Notes</label><textarea className="form-control" rows={2} defaultValue="QuickLend partnership suspended." /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-danger" onClick={() => { push({ kind: "success", title: "Key revoked" }); onClose(); }}>Revoke now</button></div>
    </Modal>
  );
}

/* ============================ 14. Integration Detail Modal ============================ */
export function IntegrationDetailModal({ open, provider, onClose }: { open: boolean; provider: string; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`${provider} — Integration Detail`} subtitle="Connection health, configuration and contract" icon="bi-plug" tone="green" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Status", "Connected", "green"], ["Uptime", "99.98%", "green"], ["SLA", "99.95%", "blue"], ["Contract", "Jan 2027", "blue"]].map(x => <div className="col-md-3" key={x[0]}><div className="pm-card pm-card-pad text-center"><Badge tone={x[2] as any} dot>{x[0]}: {x[1]}</Badge></div></div>)}</div>
        <h6>Connection details</h6>
        {[["Purpose", "Payments (M-Pesa)"], ["Environment", "Production"], ["Auth method", "OAuth 2.0 + certificate"], ["Rate limit", "5,000 req/min"], ["Last health check", "2 min ago"], ["Circuit breaker", "Closed"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b>{x[1]}</b></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 15. API Sandbox Modal ============================ */
export function ApiSandboxModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="API Sandbox Access" subtitle="Request v3 sandbox credentials for testing" icon="bi-beaker" tone="blue">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-12"><label className="form-label">API version</label><select className="form-select"><option>v3 (Beta)</option></select></div>
          <div className="col-md-6"><label className="form-label">Environment</label><select className="form-select"><option>Sandbox</option></select></div>
          <div className="col-md-6"><label className="form-label">Team</label><input className="form-control" placeholder="Your team name" /></div>
          <div className="col-12"><label className="form-label">Use case</label><textarea className="form-control" rows={2} defaultValue="Testing new endpoints before production migration." /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Access request sent to Engineering" }); onClose(); }}>Request access</button></div>
    </Modal>
  );
}
