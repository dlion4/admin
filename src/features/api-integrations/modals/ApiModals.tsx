import { useState } from "react";
import { Badge, Drawer, Modal, Steps, useToast } from "../../../components/ui";
import type { ApiSecurityPolicy, ApiAuditEntry, ApiDocument, ApiKeyRecord, IntegrationRecord, WebhookRecord } from "../data/apiData";

/* ================================================================
   1. API Key Detail Drawer
   ================================================================ */
export function ApiKeyDetailDrawer({ keyData, onClose }: { keyData: ApiKeyRecord | null; onClose: () => void }) {
  if (!keyData) return null;
  return (
    <Drawer open onClose={onClose} title={`${keyData.name} — API Key Detail`} subtitle="Credential health, usage and security controls" icon="bi-key" wide>
      <div className="pm-card pm-card-pad mb-3">
        <div className="d-flex justify-content-between"><h5>{keyData.name}</h5><Badge tone={keyData.status === "Active" ? "green" : "red"} dot>{keyData.status}</Badge></div>
        <div className="row g-3 mt-2">{[["Key", keyData.key], ["Created", keyData.created], ["Last used", keyData.lastUsed], ["Rate limit", keyData.rateLimit], ["Environment", keyData.environment || "Production"], ["Expires", keyData.expiryDate || "N/A"]].map(x => <div className="col-md-6" key={x[0]}><div className="pm-eyebrow">{x[0]}</div><b className="small mono">{x[1]}</b></div>)}</div>
      </div>
      <div className="pm-card pm-card-pad mb-3"><h6>Usage (24h)</h6>
        {[["Requests", "2,345,678"], ["Error rate", "0.01%"], ["Avg latency", "45ms"], ["p95 latency", "120ms"], ["p99 latency", "340ms"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b>{x[1]}</b></div>)}
      </div>
      <div className="pm-card pm-card-pad"><h6>Description</h6><p className="small text-muted mb-0">{keyData.description || "No description provided."}</p></div>
    </Drawer>
  );
}

/* ================================================================
   2. Credential Rotation Wizard (5-step)
   ================================================================ */
export function RotateCredentialsWizard({ open, keyData, onClose }: { open: boolean; keyData: ApiKeyRecord | null; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  if (!open || !keyData) return null;
  const stepsDef = [{ label: "Select", icon: "bi-key" }, { label: "Overlap", icon: "bi-arrow-repeat" }, { label: "Notify", icon: "bi-bell" }, { label: "Verify", icon: "bi-shield-lock" }, { label: "Confirm", icon: "bi-check2" }];
  return (
    <Modal open onClose={() => { setStep(0); onClose(); }} title="Rotate API Credentials" subtitle={`Step ${step + 1} of 5: ${stepsDef[step].label}`} icon="bi-arrow-repeat" tone="amber" size="lg">
      <Steps current={step} steps={stepsDef} />
      <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 20}%` }} /></div>
      <div className="pm-modal-body">
        <div className="pm-note mb-3"><i className="bi bi-shield-lock me-1" />Key rotation requires 2FA. The old key remains valid during the overlap period.</div>
        {step === 0 && <div><div className="pm-eyebrow mb-2">Select key to rotate</div><div className="pm-card pm-card-pad"><div className="pm-td-strong">{keyData.name}</div><div className="mono small text-muted">{keyData.key}</div><div className="mt-1"><Badge tone={keyData.status === "Active" ? "green" : "red"} dot>{keyData.status}</Badge></div></div></div>}
        {step === 1 && <div className="row g-3"><div className="col-12"><label className="form-label">Overlap period</label><select className="form-select"><option>24 hours (recommended)</option><option>48 hours</option><option>72 hours</option><option>Immediate (breaking change)</option></select></div><div className="col-12"><label className="form-label">New key permissions</label><select className="form-select"><option>Same as current</option><option>Custom scope</option></select></div><div className="col-12"><label className="form-label">Rate limit</label><input className="form-control" defaultValue={keyData.rateLimit} /></div></div>}
        {step === 2 && <div><div className="pm-eyebrow mb-2">Notification settings</div><div className="form-check mb-2"><input className="form-check-input" type="checkbox" id="rot-email" defaultChecked /><label className="form-check-label small" htmlFor="rot-email">Send email to key owner ({keyData.createdBy})</label></div><div className="form-check mb-2"><input className="form-check-input" type="checkbox" id="rot-slack" defaultChecked /><label className="form-check-label small" htmlFor="rot-slack">Post to #platform-alerts Slack channel</label></div><div className="form-check mb-2"><input className="form-check-input" type="checkbox" id="rot-audit" defaultChecked /><label className="form-check-label small" htmlFor="rot-audit">Log in audit trail</label></div></div>}
        {step === 3 && <div><div className="alert alert-info small"><i className="bi bi-info-circle me-1" />Enter your 2FA code to authorize this rotation.</div><label className="form-label">Authenticator code (TOTP) <span style={{ color: "#f04438" }}>*</span></label><div className="d-flex gap-2 mb-2">{[0, 1, 2, 3, 4, 5].map(i => <input key={i} className="form-control text-center mono" maxLength={1} inputMode="numeric" style={{ width: 46, fontWeight: 700, fontSize: "1.05rem", padding: ".45rem 0" }} />)}</div><div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}><i className="bi bi-shield-lock me-1" />Demo code: <b className="mono">482913</b></div></div>}
        {step === 4 && <div className="text-center py-3"><Badge tone="green" dot>Ready to rotate</Badge><h6 className="mt-3">Rotation summary</h6><p className="small text-muted">Key: {keyData.name}<br/>Overlap: 24 hours<br/>Old key valid until: Overlap expires<br/>Notifications: Email + Slack + Audit</p></div>}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={() => step ? setStep(s => s - 1) : (setStep(0), onClose())}>{step ? "← Back" : "Cancel"}</button>{step < 4 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(s => s + 1)}>Continue →</button> : <button className="btn btn-warning btn-sm" onClick={() => { setStep(0); push({ kind: "success", title: "Key rotation initiated", body: "New key issued. Old key valid for 24 hours." }); onClose(); }}><i className="bi bi-arrow-repeat me-1" />Rotate key</button>}</div>
    </Modal>
  );
}

/* ================================================================
   3. Webhook Delivery Log Drawer
   ================================================================ */
export function WebhookDeliveryDrawer({ webhook, onClose }: { webhook: WebhookRecord | null; onClose: () => void }) {
  if (!webhook) return null;
  const deliveries = [["14:32:01", "loan.disbursed", "200 OK", "142ms", "Success"], ["14:15:23", "loan.repaid", "200 OK", "98ms", "Success"], ["13:45:12", "loan.disbursed", "503 Timeout", "5012ms", "Retry #1"], ["12:30:00", "loan.overdue", "200 OK", "156ms", "Success"], ["11:15:00", "transaction.completed", "200 OK", "89ms", "Success"], ["09:30:00", "user.registered", "200 OK", "112ms", "Success"]];
  return (
    <Drawer open onClose={onClose} title={`${webhook.name} — Delivery Log`} subtitle="Webhook delivery history and retry status" icon="bi-broadcast" wide>
      <div className="pm-card pm-card-pad mb-3"><Badge tone={webhook.status === "Active" ? "green" : "amber"} dot>{webhook.status}</Badge>
        <div className="row g-3 mt-2">{[["URL", webhook.url], ["Success rate", webhook.successRate], ["Total deliveries", "12,456"], ["Last delivery", webhook.lastDelivery], ["Retry policy", webhook.retryPolicy || "3 attempts · exponential backoff"]].map(x => <div className="col-md-6" key={x[0]}><div className="pm-eyebrow">{x[0]}</div><b className="small">{x[1]}</b></div>)}</div>
      </div>
      <div className="pm-card pm-card-pad"><h6>Recent deliveries</h6>
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Time</th><th>Event</th><th>Response</th><th>Latency</th><th>Status</th></tr></thead><tbody>
          {deliveries.map((d, i) => <tr key={i}><td className="mono">{d[0]}</td><td className="pm-td-strong">{d[1]}</td><td>{d[2]}</td><td className="pm-num">{d[3]}</td><td><Badge tone={d[4] === "Success" ? "green" : "amber"} dot>{d[4]}</Badge></td></tr>)}
        </tbody></table></div>
      </div>
    </Drawer>
  );
}

/* ================================================================
   4. Rate Limit Policy Modal
   ================================================================ */
export function RateLimitPolicyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Rate Limit Policy" subtitle="Configure global and per-key rate limiting" icon="bi-speedometer2" tone="amber" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3">
          {[["Default (general)", "1000", "60"], ["Search endpoints", "100", "60"], ["Auth endpoints", "20", "60"], ["Export endpoints", "3", "3600"], ["Webhook callbacks", "500", "60"], ["KYC submissions", "5", "3600"], ["File upload", "20", "60"], ["OTP verification", "5", "60"]].map((r, i) => <div className="col-md-4" key={i}><label className="form-label">{r[0]}</label><div className="input-group"><input className="form-control" defaultValue={r[1]} /><span className="input-group-text">/ {r[2]}s</span></div></div>)}
          <div className="col-12"><label className="form-label">Response on limit</label><select className="form-select"><option>429 + Retry-After header</option><option>Queue and delay</option><option>Drop silently</option></select></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button><button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Rate limits saved" }); onClose(); }}>Save with 2FA</button></div>
    </Modal>
  );
}

/* ================================================================
   5. API Error Investigation Modal
   ================================================================ */
export function ErrorInvestigationModal({ open, error, onClose }: { open: boolean; error: { code: string; count: string; share: string; topEndpoint: string; rootCause: string } | null; onClose: () => void }) {
  const { push } = useToast();
  if (!open || !error) return null;
  return (
    <Modal open onClose={onClose} title={`Investigate: ${error.code}`} subtitle="Root-cause analysis and remediation" icon="bi-exclamation-triangle" tone="amber" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Count (24h)", error.count], ["Share", error.share], ["Top endpoint", error.topEndpoint], ["Root cause", error.rootCause]].map(x => <div className="col-md-3" key={x[0]}><div className="pm-card pm-card-pad text-center"><div className="pm-eyebrow">{x[0]}</div><div className="small fw-bold">{x[1]}</div></div></div>)}</div>
        <h6>Sample errors</h6>
        {[["14:32", "POST /transactions", "amount must be positive", "Client validation failed"], ["14:28", "POST /transactions", "amount exceeds limit", "Limit exceeded"], ["14:15", "POST /transactions", "missing currency field", "Missing parameter"]].map(e => <div className="d-flex align-items-center gap-2 py-1 border-bottom small" key={e[0]}><span className="mono text-muted" style={{ width: 50 }}>{e[0]}</span><span className="pm-td-strong">{e[1]}</span><span className="text-muted ms-auto">{e[2]}</span></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button><button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Ticket created" }); onClose(); }}>Create engineering ticket</button></div>
    </Modal>
  );
}

/* ================================================================
   6. Integration Health Modal
   ================================================================ */
export function IntegrationHealthModal({ open, integration, onClose }: { open: boolean; integration: IntegrationRecord | null; onClose: () => void }) {
  if (!open || !integration) return null;
  return (
    <Modal open onClose={onClose} title={`${integration.provider} — Integration Health`} subtitle="Provider connectivity, uptime and SLA details" icon="bi-plug" tone="green" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Uptime (30d)", integration.uptime, "green"], ["SLA", integration.sla, "blue"], ["Contract", integration.contractEnd, "blue"], ["Status", integration.status, "green"]].map(x => <div className="col-md-3" key={x[0]}><div className="pm-card pm-card-pad text-center"><Badge tone={x[2] as any} dot>{x[0]}</Badge><div className="h5 mt-2 mb-0">{x[1]}</div></div></div>)}</div>
        <h6>Connection details</h6>
        {[["Purpose", integration.purpose], ["Environment", integration.environment || "Production"], ["Auth method", "OAuth 2.0 + certificate"], ["Rate limit", "5,000 req/min"], ["Last health check", "2 min ago"], ["Circuit breaker", "Closed"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b>{x[1]}</b></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ================================================================
   7. API Documentation Drawer
   ================================================================ */
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

/* ================================================================
   8. API Test Console Modal
   ================================================================ */
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
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button><button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Request sent — 200 OK", body: "Response time: 142ms" }); onClose(); }}><i className="bi bi-play me-1" />Send request</button></div>
    </Modal>
  );
}

/* ================================================================
   9. Key Revocation Wizard (4-step)
   ================================================================ */
export function KeyRevocationWizard({ open, keyData, onClose }: { open: boolean; keyData: ApiKeyRecord | null; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [confirm, setConfirm] = useState("");
  if (!open || !keyData) return null;
  return (
    <Modal open onClose={() => { setStep(0); setConfirm(""); onClose(); }} title="Revoke API Key" subtitle={`Step ${step + 1} of 4: ${["Impact", "Options", "Confirm", "Execute"][step]}`} icon="bi-trash" tone="red" size="lg">
      <Steps current={step} steps={[{ label: "Impact", icon: "bi-exclamation-triangle" }, { label: "Options", icon: "bi-gear" }, { label: "Confirm", icon: "bi-shield-lock" }, { label: "Execute", icon: "bi-trash" }]} />
      <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 25}%` }} /></div>
      <div className="pm-modal-body">
        {step === 0 && <div><div className="alert alert-danger small"><i className="bi bi-exclamation-triangle me-1" />All requests using this key will be rejected immediately.</div><div className="pm-card pm-card-pad mb-3"><div className="pm-eyebrow mb-1">Key to revoke</div><div className="pm-td-strong">{keyData.name}</div><div className="mono small text-muted">{keyData.key}</div></div><div className="pm-card pm-card-pad"><div className="pm-eyebrow mb-2">Affected services</div>{[["Webhook consumers", "3 endpoints"], ["Partner integrations", "2 systems"], ["Batch jobs", "1 pipeline"]].map(([k, v]) => <div className="pm-kv" key={k}><span className="k">{k}</span><span className="v">{v}</span></div>)}</div></div>}
        {step === 1 && <div><div className="pm-eyebrow mb-2">Revocation options</div><div className="mb-3"><label className="form-label">Reason</label><select className="form-select"><option>Compromised</option><option>No longer needed</option><option>Rotated</option><option>Partner offboarding</option></select></div><div className="mb-3"><label className="form-label">Grace period</label><select className="form-select"><option>Immediate (0 hours)</option><option>1 hour</option><option>24 hours</option></select></div><div className="mb-3"><label className="form-label">Notify consumers</label><div className="form-check"><input className="form-check-input" type="checkbox" id="revoke-notify" defaultChecked /><label className="form-check-label small" htmlFor="revoke-notify">Send email to key owner</label></div></div></div>}
        {step === 2 && <div><div className="alert alert-danger small"><i className="bi bi-exclamation-triangle me-1" />This action is IRREVERSIBLE.</div><label className="form-label" style={{ color: "var(--pm-danger)" }}>Type REVOKE to confirm</label><input className="form-control" style={{ borderColor: "var(--pm-danger)" }} placeholder="Type REVOKE" value={confirm} onChange={e => setConfirm(e.target.value)} /><label className="d-flex align-items-center gap-2 mt-3" style={{ fontSize: ".82rem" }}><input type="checkbox" className="form-check-input" />I confirm this revocation is authorized</label></div>}
        {step === 3 && <div className="text-center py-3"><Badge tone="green" dot>Ready to revoke</Badge><h6 className="mt-3">Revocation summary</h6><p className="small text-muted">Key: {keyData.name}<br/>Grace period: Immediate<br/>Consumers notified: Yes</p></div>}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={() => step ? setStep(s => s - 1) : (setStep(0), setConfirm(""), onClose())}>{step ? "← Back" : "Cancel"}</button>{step < 3 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(s => s + 1)}>Continue →</button> : <button className="btn btn-danger btn-sm" disabled={confirm !== "REVOKE"} onClick={() => { setStep(0); setConfirm(""); push({ kind: "success", title: "Key revoked" }); onClose(); }}><i className="bi bi-trash3 me-1" />Permanently revoke</button>}</div>
    </Modal>
  );
}

/* ================================================================
   10. API Key Create Wizard (5-step, real multi-step)
   ================================================================ */
export function ApiKeyCreateWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  if (!open) return null;
  const stepsDef = [{ label: "Details", icon: "bi-info-circle" }, { label: "Scope", icon: "bi-shield-check" }, { label: "Limits", icon: "bi-speedometer2" }, { label: "Security", icon: "bi-lock" }, { label: "Review", icon: "bi-check2" }];
  return (
    <Modal open onClose={() => { setStep(0); onClose(); }} title="Create API Key" subtitle={`Step ${step + 1} of 5: ${stepsDef[step].label}`} icon="bi-key" tone="green" size="lg">
      <Steps current={step} steps={stepsDef} />
      <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 20}%` }} /></div>
      <div className="pm-modal-body">
        <div className="pm-note mb-3"><i className="bi bi-shield-lock me-1" />Only Super Admins can create production API keys. All actions are audit-logged.</div>
        {step === 0 && <div className="row g-3"><div className="col-md-7"><label className="form-label">Key name</label><input className="form-control" placeholder="e.g. Partner Portal API" /></div><div className="col-md-5"><label className="form-label">Environment</label><select className="form-select"><option>Production</option><option>Staging</option><option>Sandbox</option></select></div><div className="col-md-6"><label className="form-label">Owner</label><input className="form-control" placeholder="Platform Engineering" /></div><div className="col-md-6"><label className="form-label">Expiry</label><select className="form-select"><option>90 days</option><option>180 days</option><option>No expiry</option></select></div><div className="col-12"><label className="form-label">Description</label><textarea className="form-control" rows={2} placeholder="Purpose of this API key" /></div></div>}
        {step === 1 && <div><div className="pm-eyebrow mb-2">Endpoint access scope</div>{[["Users", "Read, Create, Update"], ["Transactions", "Read, Create"], ["Transfers", "Create (requires 2FA > 100K)"], ["Cards", "Read, Create"], ["Loans", "Read"], ["KYC", "Read, Submit"], ["Webhooks", "Read, Manage"], ["Admin", "None"]].map(([cat, perm]) => <div className="d-flex justify-content-between align-items-center py-2 border-bottom small" key={cat}><label className="form-check-label d-flex align-items-center gap-2"><input type="checkbox" className="form-check-input" defaultChecked={cat !== "Admin"} />{cat}</label><Badge tone="grey">{perm}</Badge></div>)}</div>}
        {step === 2 && <div className="row g-3"><div className="col-md-6"><label className="form-label">Rate limit</label><select className="form-select"><option>500/min</option><option>1K/min</option><option>5K/min</option><option>10K/min</option></select></div><div className="col-md-6"><label className="form-label">Daily limit</label><input className="form-control" defaultValue="1000000" /></div><div className="col-md-6"><label className="form-label">Monthly limit</label><input className="form-control" defaultValue="50000000" /></div><div className="col-md-6"><label className="form-label">Burst allowance</label><select className="form-select"><option>1x rate limit</option><option>2x rate limit</option><option>5x rate limit</option></select></div></div>}
        {step === 3 && <div className="row g-3"><div className="col-12"><label className="form-label">Allowed IP ranges</label><input className="form-control" placeholder="e.g. 192.168.1.0/24, 10.0.0.0/8" /><div style={{ fontSize: ".72rem", color: "var(--pm-muted)", marginTop: ".35rem" }}>Comma-separated CIDR blocks. Leave empty for unrestricted.</div></div><div className="col-12"><label className="form-label">Webhook URL (optional)</label><input className="form-control" placeholder="https://your-server.com/webhook" /></div><div className="col-12"><label className="form-label">Auto-rotate</label><div className="form-check"><input className="form-check-input" type="checkbox" id="auto-rotate" defaultChecked /><label className="form-check-label small" htmlFor="auto-rotate">Auto-rotate key 7 days before expiry</label></div></div></div>}
        {step === 4 && <div><div className="pm-card pm-card-pad"><div className="pm-eyebrow mb-2">API Key Summary</div>{[["Name", "New API Key"], ["Environment", "Production"], ["Scope", "7 categories"], ["Rate limit", "1K/min"], ["Expiry", "90 days"]].map(([k, v]) => <div className="pm-kv" key={k}><span className="k">{k}</span><span className="v">{v}</span></div>)}</div><div className="pm-note mt-3"><i className="bi bi-exclamation-triangle me-1" />The API key will only be shown once. Copy it immediately.</div></div>}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={() => step ? setStep(s => s - 1) : (setStep(0), onClose())}>{step ? "← Back" : "Cancel"}</button>{step < 4 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(s => s + 1)}>Continue →</button> : <button className="btn btn-primary btn-sm" onClick={() => { setStep(0); push({ kind: "success", title: "API key created", body: "Copy the key — it won't be shown again." }); onClose(); }}><i className="bi bi-key me-1" />Generate key</button>}</div>
    </Modal>
  );
}

/* ================================================================
   11. Export Center Wizard (3-step)
   ================================================================ */
export function ExportCenterWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [format, setFormat] = useState("JSON");
  const [sections, setSections] = useState<string[]>(["API keys", "Webhooks"]);
  const toggle = (s: string) => setSections(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  if (!open) return null;
  return (
    <Modal open onClose={() => { setStep(0); onClose(); }} title="Export API Data" subtitle={`Step ${step + 1} of 3: ${["Select sections", "Choose format", "Confirm & export"][step]}`} icon="bi-download" tone="blue" size="lg">
      <Steps current={step} steps={[{ label: "Sections", icon: "bi-list-check" }, { label: "Format", icon: "bi-file-earmark" }, { label: "Export", icon: "bi-download" }]} />
      <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 33.3}%` }} /></div>
      <div className="pm-modal-body">
        {step === 0 && <div><div className="pm-eyebrow mb-2">Select data sections to export</div>{["API keys", "Webhooks", "Integrations", "Rate limits", "Usage analytics", "Error logs", "Audit trail", "Security policies", "Documentation"].map(s => <label key={s} className="d-flex align-items-center gap-2 mb-2 p-2 rounded" style={{ background: sections.includes(s) ? "var(--pm-primary-soft, #e7f8ef)" : "transparent", border: "1px solid var(--pm-border)", cursor: "pointer" }}><input type="checkbox" className="form-check-input" checked={sections.includes(s)} onChange={() => toggle(s)} /><span style={{ fontSize: ".85rem" }}>{s}</span></label>)}</div>}
        {step === 1 && <div><div className="pm-eyebrow mb-2">Export format</div>{[["JSON", "Structured data for API integration"], ["CSV", "Spreadsheet-compatible for Excel"], ["PDF", "Formatted report for audit and compliance"]].map(([f, desc]) => <button key={f} className={`w-100 text-start p-3 mb-2 rounded ${format === f ? "border-primary" : ""}`} style={{ border: "1px solid var(--pm-border)", background: format === f ? "rgba(18,183,106,.08)" : "#fff" }} onClick={() => setFormat(f)}><div className="pm-td-strong">{f}</div><div className="pm-td-sub">{desc}</div></button>)}</div>}
        {step === 2 && <div><div className="pm-card pm-card-pad mb-3"><div className="pm-eyebrow mb-2">Export summary</div><div className="pm-kv"><span className="k">Sections</span><span className="v">{sections.length} selected</span></div><div className="pm-kv"><span className="k">Format</span><span className="v">{format}</span></div><div className="pm-kv"><span className="k">Generated by</span><span className="v">Super Admin</span></div></div><div className="pm-note"><i className="bi bi-info-circle me-1" />Export includes audit timestamps and admin attribution.</div></div>}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={() => step ? setStep(s => s - 1) : (setStep(0), onClose())}>{step ? "← Back" : "Cancel"}</button>{step < 2 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(s => s + 1)}>Continue →</button> : <button className="btn btn-primary btn-sm" onClick={() => { setStep(0); push({ kind: "success", title: "Export started", body: `Generating ${format} file with ${sections.length} sections...` }); onClose(); }}><i className="bi bi-download me-1" />Generate export</button>}</div>
    </Modal>
  );
}

/* ================================================================
   12. Emergency Revocation Wizard (4-step)
   ================================================================ */
export function EmergencyRevocationWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [confirm, setConfirm] = useState("");
  if (!open) return null;
  return (
    <Modal open onClose={() => { setStep(0); setConfirm(""); onClose(); }} title="Emergency API Revocation" subtitle={`Step ${step + 1} of 4: ${["Assessment", "Select", "Confirm", "Execute"][step]}`} icon="bi-exclamation-triangle" tone="red" size="lg">
      <Steps current={step} steps={[{ label: "Assessment", icon: "bi-exclamation-triangle" }, { label: "Select", icon: "bi-list-check" }, { label: "Confirm", icon: "bi-shield-lock" }, { label: "Execute", icon: "bi-trash" }]} />
      <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 25}%` }} /></div>
      <div className="pm-modal-body">
        {step === 0 && <div><div className="alert alert-danger small"><i className="bi bi-exclamation-triangle me-1" />Emergency revocation affects ALL consumers of the selected keys.</div>{[["Active keys", "5"], ["Affected webhooks", "3"], ["Partner integrations", "2"], ["Batch pipelines", "1"]].map(([k, v]) => <div className="d-flex justify-content-between py-1 border-bottom small" key={k}><span className="text-muted">{k}</span><b>{v}</b></div>)}</div>}
        {step === 1 && <div><div className="pm-eyebrow mb-2">Select keys to revoke</div>{["Production — Main", "Production — Partner API", "Internal — Batch"].map(name => <label key={name} className="d-flex align-items-center gap-2 mb-2 p-2 rounded" style={{ border: "1px solid var(--pm-border)" }}><input type="checkbox" className="form-check-input" /><span className="pm-td-strong" style={{ fontSize: ".85rem" }}>{name}</span></label>)}<label className="d-flex align-items-center gap-2 mt-3 p-2 rounded" style={{ border: "1px solid var(--pm-border)", background: "rgba(240,68,56,.05)" }}><input type="checkbox" className="form-check-input" /><span style={{ fontSize: ".85rem", color: "var(--pm-danger)" }}>Revoke ALL production keys</span></label></div>}
        {step === 2 && <div><div className="alert alert-danger small"><i className="bi bi-exclamation-triangle me-1" />This action is IRREVERSIBLE and affects all API consumers.</div><label className="form-label" style={{ color: "var(--pm-danger)" }}>Type EMERGENCY to confirm</label><input className="form-control" style={{ borderColor: "var(--pm-danger)" }} placeholder="Type EMERGENCY" value={confirm} onChange={e => setConfirm(e.target.value)} /><label className="d-flex align-items-center gap-2 mt-3" style={{ fontSize: ".82rem" }}><input type="checkbox" className="form-check-input" />I confirm this emergency revocation is authorized</label></div>}
        {step === 3 && <div className="text-center py-3"><Badge tone="green" dot>Ready to execute</Badge><h6 className="mt-3">Emergency revocation summary</h6><p className="small text-muted">Keys: Selected production keys<br/>Downtime: Immediate<br/>Recovery: New key creation required</p></div>}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={() => step ? setStep(s => s - 1) : (setStep(0), setConfirm(""), onClose())}>{step ? "← Back" : "Cancel"}</button>{step < 3 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(s => s + 1)}>Continue →</button> : <button className="btn btn-danger btn-sm" disabled={confirm !== "EMERGENCY"} onClick={() => { setStep(0); setConfirm(""); push({ kind: "success", title: "Emergency revocation executed" }); onClose(); }}><i className="bi bi-exclamation-triangle me-1" />Execute revocation</button>}</div>
    </Modal>
  );
}

/* ================================================================
   13. Integration Onboarding Wizard (5-step)
   ================================================================ */
export function IntegrationOnboardingWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  if (!open) return null;
  const stepsDef = [{ label: "Provider", icon: "bi-plug" }, { label: "Credentials", icon: "bi-key" }, { label: "Config", icon: "bi-gear" }, { label: "Test", icon: "bi-play-circle" }, { label: "Activate", icon: "bi-check2" }];
  return (
    <Modal open onClose={() => { setStep(0); onClose(); }} title="Onboard Integration" subtitle={`Step ${step + 1} of 5: ${stepsDef[step].label}`} icon="bi-plug" tone="green" size="lg">
      <Steps current={step} steps={stepsDef} />
      <div className="pm-wizard-progress"><span style={{ width: `${(step + 1) * 20}%` }} /></div>
      <div className="pm-modal-body">
        <div className="pm-note mb-3"><i className="bi bi-shield-lock me-1" />Integration onboarding requires Super Admin approval.</div>
        {step === 0 && <div className="row g-3"><div className="col-md-6"><label className="form-label">Provider name</label><input className="form-control" placeholder="e.g. Stripe" /></div><div className="col-md-6"><label className="form-label">Purpose</label><select className="form-select"><option>Payments</option><option>Card processing</option><option>Banking</option><option>KYC verification</option><option>AML screening</option><option>SMS</option><option>Email</option><option>Infrastructure</option></select></div><div className="col-12"><label className="form-label">Contract end date</label><input className="form-control" type="date" /></div></div>}
        {step === 1 && <div className="row g-3"><div className="col-12"><label className="form-label">API endpoint</label><input className="form-control" placeholder="https://api.provider.com/v1" /></div><div className="col-md-6"><label className="form-label">Auth method</label><select className="form-select"><option>OAuth 2.0</option><option>API key</option><option>API key + secret</option><option>Certificate</option></select></div><div className="col-md-6"><label className="form-label">Environment</label><select className="form-select"><option>Production</option><option>Sandbox</option></select></div><div className="col-12"><label className="form-label">Secrets (stored encrypted)</label><textarea className="form-control mono" rows={3} placeholder='{"client_id": "...", "client_secret": "..."}' /></div></div>}
        {step === 2 && <div className="row g-3"><div className="col-md-6"><label className="form-label">Rate limit</label><input className="form-control" defaultValue="5000" /><div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>requests per minute</div></div><div className="col-md-6"><label className="form-label">Timeout</label><select className="form-select"><option>30 seconds</option><option>60 seconds</option><option>120 seconds</option></select></div><div className="col-md-6"><label className="form-label">Circuit breaker</label><select className="form-select"><option>5 errors → open</option><option>10 errors → open</option><option>Disabled</option></select></div><div className="col-md-6"><label className="form-label">Retry policy</label><select className="form-select"><option>3 attempts · exponential</option><option>5 attempts · linear</option><option>No retries</option></select></div></div>}
        {step === 3 && <div><div className="pm-eyebrow mb-2">Connection test</div><div className="pm-card pm-card-pad mb-2"><div className="d-flex justify-content-between align-items-center"><span className="pm-td-strong">Health check endpoint</span><Badge tone="green">Passed — 200 OK</Badge></div></div><div className="pm-card pm-card-pad mb-2"><div className="d-flex justify-content-between align-items-center"><span className="pm-td-strong">Authentication test</span><Badge tone="green">Passed — token obtained</Badge></div></div><div className="pm-card pm-card-pad"><div className="d-flex justify-content-between align-items-center"><span className="pm-td-strong">Sample transaction</span><Badge tone="green">Passed — test complete</Badge></div></div></div>}
        {step === 4 && <div className="text-center py-3"><Badge tone="green" dot>Ready to activate</Badge><h6 className="mt-3">Integration summary</h6><p className="small text-muted">Provider: New Integration<br/>Environment: Production<br/>All tests passed</p></div>}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={() => step ? setStep(s => s - 1) : (setStep(0), onClose())}>{step ? "← Back" : "Cancel"}</button>{step < 4 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(s => s + 1)}>Continue →</button> : <button className="btn btn-primary btn-sm" onClick={() => { setStep(0); push({ kind: "success", title: "Integration connected" }); onClose(); }}><i className="bi bi-plug me-1" />Activate integration</button>}</div>
    </Modal>
  );
}

/* ================================================================
   14. Security Policy Detail Modal
   ================================================================ */
export function ApiSecurityPolicyDetailModal({ open, policy, onClose }: { open: boolean; policy: ApiSecurityPolicy | null; onClose: () => void }) {
  if (!open || !policy) return null;
  return (
    <Modal open onClose={onClose} title={policy.policy} subtitle={`${policy.category} · ${policy.severity} severity`} icon="bi-shield-check" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Category", policy.category], ["Severity", policy.severity], ["Status", policy.status]].map(([k, v]) => <div className="col-md-4" key={k}><label className="form-label">{k}</label><Badge tone={v === "Critical" ? "red" : v === "High" ? "amber" : v === "Enforced" ? "green" : "blue"}>{v}</Badge></div>)}</div>
        <div className="pm-card pm-card-pad"><div className="pm-eyebrow mb-1">Description</div><p className="mb-0" style={{ fontSize: ".85rem" }}>{policy.description}</p></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ================================================================
   15. API Audit Trail Modal
   ================================================================ */
export function ApiAuditTrailModal({ open, onClose, logs }: { open: boolean; onClose: () => void; logs: ApiAuditEntry[] }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="API Audit Trail" subtitle="Immutable record of all API operations" icon="bi-clock-history" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Timestamp</th><th>Actor</th><th>Action</th><th>Resource</th><th>Details</th><th>Severity</th></tr></thead><tbody>
          {logs.map(r => <tr key={r.id}><td className="mono">{r.timestamp}</td><td className="pm-td-strong">{r.actor}</td><td>{r.action}</td><td>{r.resource}</td><td>{r.details}</td><td><Badge tone={r.severity === "Critical" ? "red" : r.severity === "Warning" ? "amber" : "blue"}>{r.severity}</Badge></td></tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button><button className="btn btn-primary btn-sm" onClick={onClose}><i className="bi bi-download me-1" />Export</button></div>
    </Modal>
  );
}

/* ================================================================
   16. API Document Preview Modal (with letterhead)
   ================================================================ */
export function ApiDocumentPreviewModal({ doc, open, onClose }: { doc: ApiDocument | null; open: boolean; onClose: () => void }) {
  if (!open || !doc) return null;
  const rendered = doc.content.replace(/\{\{(\w+)\}\}/g, (_: string, key: string) => `<span class="doc-var">{{${key}}}</span>`);
  return (
    <Modal open onClose={onClose} title={`${doc.title} — Preview`} subtitle={`${doc.version} · ${doc.type}`} icon="bi-eye" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="doc-preview-toolbar">
          <div className="d-flex gap-2 align-items-center"><Badge tone="green">{doc.status}</Badge><span className="pm-td-sub">{doc.version}</span></div>
          <div className="d-flex gap-1"><button className="btn btn-sm btn-outline-secondary"><i className="bi bi-printer me-1" />Print</button><button className="btn btn-sm btn-outline-primary"><i className="bi bi-download me-1" />Download PDF</button></div>
        </div>
        <div className="doc-preview-page">
          <div className="doc-preview-letterhead"><div className="doc-preview-logo">P</div><div><div className="doc-preview-company">PayMo Digital Bank Ltd</div><div className="doc-preview-address">Westlands, Nairobi · PVT-2024-184732</div></div></div>
          <div className="doc-preview-meta"><span className="doc-preview-meta-item"><i className="bi bi-file-earmark-text me-1" />{doc.type}</span><span className="doc-preview-meta-item"><i className="bi bi-person me-1" />{doc.author}</span><span className="doc-preview-meta-item"><i className="bi bi-calendar me-1" />{doc.lastUpdated}</span></div>
          <hr className="doc-preview-divider" />
          <div className="doc-preview-body" style={{ whiteSpace: "pre-wrap", fontFamily: "'Inter', system-ui, sans-serif", fontSize: ".82rem", lineHeight: 1.6, color: "#101828" }} dangerouslySetInnerHTML={{ __html: rendered.replace(/\n/g, "<br/>") }} />
          <hr className="doc-preview-divider" />
          <div style={{ fontSize: ".72rem", color: "#667085", textAlign: "center" }}>PayMo Digital Bank Ltd · Confidential · {doc.version}</div>
        </div>
        <div className="pm-note mt-3"><i className="bi bi-info-circle me-1" />Variables in <span className="doc-var">green</span> are template placeholders.</div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button><button className="btn btn-primary btn-sm" onClick={onClose}><i className="bi bi-download me-1" />Download PDF</button></div>
    </Modal>
  );
}

/* ================================================================
   17. Bulk Operations Modal
   ================================================================ */
export function ApiBulkOperationsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Bulk Operations" subtitle="Perform actions on multiple records at once" icon="bi-layers" tone="violet">
      <div className="pm-modal-body">
        <div className="pm-eyebrow mb-2">Select operation type</div>
        {[["Bulk rotate keys", "Rotate multiple API keys with coordinated overlap"], ["Bulk revoke", "Revoke multiple keys simultaneously"], ["Bulk webhook test", "Send test events to all webhooks"], ["Bulk export", "Export selected API data sections"]].map(([op, desc]) => <button key={op} className="w-100 text-start p-3 mb-2 rounded" style={{ border: "1px solid var(--pm-border)" }} onClick={() => { push({ kind: "success", title: `Bulk operation "${op}" initiated` }); onClose(); }}><div className="pm-td-strong">{op}</div><div className="pm-td-sub">{desc}</div></button>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button></div>
    </Modal>
  );
}

/* ================================================================
   18. Webhook Test Modal
   ================================================================ */
export function WebhookTestModal({ open, webhook, onClose }: { open: boolean; webhook: WebhookRecord | null; onClose: () => void }) {
  const { push } = useToast();
  if (!open || !webhook) return null;
  return (
    <Modal open onClose={onClose} title={`Test: ${webhook.name}`} subtitle="Send test event and verify delivery" icon="bi-play-circle" tone="blue">
      <div className="pm-modal-body">
        <div className="row g-3"><div className="col-12"><label className="form-label">Event type</label><select className="form-select"><option>transaction.completed</option><option>user.registered</option><option>loan.disbursed</option></select></div><div className="col-12"><label className="form-label">Test payload</label><textarea className="form-control mono" rows={3} defaultValue={`{"event": "transaction.completed", "data": {"amount": 1000, "currency": "KES"}}`} /></div></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button><button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Test event sent", body: "Response: 200 OK in 142ms" }); onClose(); }}><i className="bi bi-play me-1" />Send test event</button></div>
    </Modal>
  );
}

/* ================================================================
   19. API Performance Dashboard Drawer
   ================================================================ */
export function ApiPerformanceDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Drawer open onClose={onClose} title="API Performance Dashboard" subtitle="Real-time traffic and latency metrics" icon="bi-activity" wide>
      <div className="pm-card pm-card-pad mb-3"><h6>Traffic overview (24h)</h6>{[["Total requests", "3,518,178"], ["Successful", "3,517,882 (99.99%)"], ["Errored", "296 (0.01%)"], ["Rate limited", "32 (0.001%)"]].map(([k, v]) => <div className="d-flex justify-content-between py-1 border-bottom small" key={k}><span className="text-muted">{k}</span><b>{v}</b></div>)}</div>
      <div className="pm-card pm-card-pad mb-3"><h6>Latency percentiles</h6>{[["p50", "32ms"], ["p75", "58ms"], ["p90", "89ms"], ["p95", "120ms"], ["p99", "340ms"], ["p99.9", "1.2s"]].map(([k, v]) => <div className="d-flex justify-content-between py-1 border-bottom small" key={k}><span className="mono">{k}</span><b className="mono">{v}</b></div>)}</div>
      <div className="pm-card pm-card-pad"><h6>Error breakdown</h6>{[["400 Bad Request", "123 (52.6%)"], ["401 Unauthorized", "45 (19.2%)"], ["403 Forbidden", "34 (14.5%)"], ["429 Rate Limited", "23 (9.8%)"], ["500 Server Error", "9 (3.8%)"]].map(([k, v]) => <div className="d-flex justify-content-between py-1 border-bottom small" key={k}><span>{k}</span><b>{v}</b></div>)}</div>
    </Drawer>
  );
}
