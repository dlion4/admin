import { useEffect, useState } from "react";
import { Badge, Drawer, EmptyState, Meter, Modal, Steps, TwoFactorField, useToast } from "../../../components/ui";
import { csvDownload, jsonDownload, kes, num } from "../../../lib/format";
import type { DependencyChain, PipelineItem, PortfolioAudit, QuickConfig, RetirementPlan, Service } from "../data/serviceData";
import { DEPENDENCY_CHAINS, INCIDENTS, MONTHS, PORTFOLIO_PERMISSIONS, QUICK_CONFIGS, slaMet } from "../data/serviceData";

const CODE = "482913";

export const svcTone = (s: string) =>
  s === "Active" ? "green" : s === "Beta" ? "blue" : s === "Paused" ? "red" : s === "Sunsetting" ? "amber" : "grey";

export const stageTone = (s: string) =>
  s === "Launched" || s === "Approved" ? "green" : s === "Beta" || s === "Development" ? "blue" : s === "Submitted" ? "violet" : s === "Migration" ? "amber" : "grey";

const kesM = (m: number) => kes(m * 1e6, { compact: true });

const marginTone = (m: number | null) => (m === null ? "grey" : m >= 75 ? "green" : m >= 40 ? "amber" : "red");

/* ================================================================
   1. Service detail drawer (heart of the page — 5 tabs)
   ================================================================ */
export function ServiceDetailDrawer({
  service, onClose, onPnL, onConfigure, onFee, onHealth, onDependency, onPause, onResume, audit,
}: {
  service: Service | null;
  onClose: () => void;
  onPnL: (s: Service) => void;
  onConfigure: (s: Service) => void;
  onFee: (s: Service) => void;
  onHealth: (s: Service) => void;
  onDependency: (chainId: string) => void;
  onPause: (s: Service) => void;
  onResume: (s: Service) => void;
  audit: PortfolioAudit[];
}) {
  const [tab, setTab] = useState<"overview" | "pnl" | "health" | "config" | "activity">("overview");
  useEffect(() => { setTab("overview"); }, [service?.id]);
  if (!service) return null;
  const incidents = INCIDENTS.filter((i) => i.serviceId === service.id);
  const chain = DEPENDENCY_CHAINS.find((c) => c.serviceId === service.id);
  const configs = QUICK_CONFIGS.filter((c) => c.serviceId === service.id);
  const adoption = service.users ? Math.round((service.active30d / service.users) * 1000) / 10 : 0;
  const firstWord = service.name.split(" ")[0].toLowerCase();
  const svcAudit = audit.filter((a) => a.change.toLowerCase().includes(firstWord) || a.area.toLowerCase().includes(service.category.toLowerCase()) || a.area === "Service status");
  return (
    <Drawer open onClose={onClose} wide icon={service.icon} tone={service.status === "Active" ? "green" : service.status === "Beta" ? "blue" : service.status === "Paused" ? "red" : "amber"}
      title={service.name} subtitle={`${service.id} · ${service.category} · ${service.tier} · owner ${service.owner} · launched ${service.launched}`}
      headExtra={<Badge tone={svcTone(service.status)} dot>{service.status}</Badge>}
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => onDependency(chain?.id ?? "DEP-08")}><i className="bi bi-diagram-3 me-1" />Dependency map</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => onHealth(service)}><i className="bi bi-heart-pulse me-1" />Health</button>
          {service.status === "Paused" ? (
            <button className="btn btn-primary btn-sm ms-auto" onClick={() => onResume(service)}><i className="bi bi-play-fill me-1" />Resume service</button>
          ) : service.status === "Active" || service.status === "Beta" ? (
            <button className="btn btn-outline-danger btn-sm ms-auto" style={{ borderColor: "#fda29b", color: "#b42318" }} onClick={() => onPause(service)}><i className="bi bi-pause-fill me-1" />Pause</button>
          ) : <span className="ms-auto pm-badge amber" style={{ alignSelf: "center" }}>{service.statusNote ? "Sunset scheduled" : "—"}</span>}
        </>
      }>
      <div className="pm-tabs mb-3">
        {([["overview", "Overview"], ["pnl", "P&L (6M)"], ["health", "Health"], ["config", "Configuration"], ["activity", "Activity"]] as const).map(([k, l]) => (
          <button key={k} className={`pm-tab ${tab === k ? "active" : ""}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          <div className="pm-card pm-card-pad mb-3">
            <div className="pm-eyebrow mb-1">What it does</div>
            <div style={{ fontSize: ".84rem" }}>{service.description}</div>
            {service.statusNote && <div className="pm-note mt-2 mb-0"><i className="bi bi-info-circle me-1" />{service.statusNote}</div>}
          </div>
          <div className="row g-2 mb-3">
            <div className="col-6 col-lg-3"><div className="pm-stat"><span className="pm-stat-label">Users</span><span className="pm-stat-value">{num(service.users)}</span><span className="pm-stat-foot">{num(service.active30d)} active · {adoption}%</span></div></div>
            <div className="col-6 col-lg-3"><div className="pm-stat"><span className="pm-stat-label">Txns (30d)</span><span className="pm-stat-value">{num(service.txns30d)}</span><span className="pm-stat-foot">avg {service.txns30d ? Math.round((service.revenue30d * 1e6) / service.txns30d).toLocaleString("en-KE") : "—"} KES/txn fee</span></div></div>
            <div className="col-6 col-lg-3"><div className="pm-stat"><span className="pm-stat-label">Revenue (30d)</span><span className="pm-stat-value">{kesM(service.revenue30d)}</span><span className="pm-stat-foot">{service.revNote ? service.revNote : `cost ${kesM(service.cost30d)}${service.costNote ? ` (${service.costNote})` : ""}`}</span></div></div>
            <div className="col-6 col-lg-3"><div className="pm-stat"><span className="pm-stat-label">Margin</span><span className="pm-stat-value">{service.margin === null ? "—" : `${service.margin}%`}</span><span className="pm-stat-foot">{service.feeStructure}</span></div></div>
          </div>
          <div className="pm-card pm-card-pad">
            <div className="pm-eyebrow mb-2">Adoption vs target</div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <Meter value={adoption} tone={adoption >= service.adoptionTarget ? "#12b76a" : "#f79009"} width={180} />
              <span className="mono" style={{ fontSize: ".76rem", fontWeight: 700 }}>{adoption}% of {service.adoptionTarget}% target</span>
              <Badge tone={service.growthMom >= 0 ? "green" : "red"}>{service.growthMom >= 0 ? "▲" : "▼"} {Math.abs(service.growthMom)}% MoM</Badge>
            </div>
            <div className="pm-td-sub mt-2 mb-0">Dependencies: {service.dependencies.join(" · ")}</div>
          </div>
        </>
      )}

      {tab === "pnl" && (
        <>
          <div className="pm-card pm-card-pad mb-3">
            <div className="pm-eyebrow mb-2">Six-month revenue vs cost (KES millions)</div>
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Month</th><th className="text-end">Revenue</th><th className="text-end">Cost</th><th className="text-end">Gross</th><th className="text-end">Margin</th></tr></thead>
                <tbody>
                  {MONTHS.map((m, i) => {
                    const gross = service.rev6m[i] - service.cost6m[i];
                    const mg = service.rev6m[i] ? Math.round((gross / service.rev6m[i]) * 1000) / 10 : null;
                    return (
                      <tr key={m}>
                        <td className="pm-td-strong">{m}</td>
                        <td className="text-end pm-num">{service.rev6m[i].toFixed(1)}</td>
                        <td className="text-end pm-num">{service.cost6m[i].toFixed(1)}</td>
                        <td className="text-end pm-num" style={{ fontWeight: 700, color: gross >= 0 ? "#12b76a" : "#f04438" }}>{gross.toFixed(1)}</td>
                        <td className="text-end"><Badge tone={marginTone(mg)}>{mg === null ? "—" : `${mg}%`}</Badge></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <button className="btn btn-outline-primary btn-sm" onClick={() => onPnL(service)}><i className="bi bi-arrows-angle-expand me-1" />Open full P&L explorer</button>
        </>
      )}

      {tab === "health" && (
        <div className="pm-card pm-card-pad">
          <div className="pm-kv"><span className="k">Gateway</span><span className="v">{service.health.gateway}</span></div>
          <div className="pm-kv"><span className="k">Uptime (30d)</span><span className="v mono">{service.health.uptime}%</span></div>
          <div className="pm-kv"><span className="k">Latency (p95)</span><span className="v mono">{service.health.latency}</span></div>
          <div className="pm-kv"><span className="k">Error rate</span><span className="v mono">{service.health.errorRate}%</span></div>
          <div className="pm-kv"><span className="k">SLA target</span><span className="v mono">{service.health.slaTarget}%</span></div>
          <div className="pm-kv"><span className="k">SLA status</span><span className="v"><Badge tone={slaMet(service.health) ? "green" : "red"} dot>{slaMet(service.health) ? "Met" : "Breached"}</Badge></span></div>
          <div className="pm-kv"><span className="k">Last incident</span><span className="v" style={{ fontWeight: 500 }}>{service.health.lastIncident}</span></div>
          {incidents.length > 0 && (
            <>
              <div className="pm-eyebrow mt-3 mb-2">Incidents (90d)</div>
              {incidents.map((i) => (
                <div key={i.id} className="pm-alert-row warn mb-2">
                  <div className="flex-grow-1">
                    <div style={{ fontWeight: 700, fontSize: ".78rem" }}>{i.title}</div>
                    <div className="pm-td-sub">{i.date} · {i.severity} · {i.duration} · {i.impact}</div>
                  </div>
                </div>
              ))}
            </>
          )}
          <button className="btn btn-outline-primary btn-sm mt-2" onClick={() => onHealth(service)}><i className="bi bi-activity me-1" />Open health console</button>
        </div>
      )}

      {tab === "config" && (
        <>
          {configs.length > 0 ? (
            <div className="pm-card pm-card-pad">
              {configs.map((c) => (
                <div className="pm-kv" key={c.id}>
                  <span className="k">{c.key}<div className="pm-td-sub mono">{c.id} · {c.changed} · {c.changedBy}</div></span>
                  <span className="v mono d-flex align-items-center gap-2">
                    {c.value}
                    <button className="btn btn-sm btn-outline-primary" style={{ fontSize: ".64rem" }} disabled={c.kind === "view"} title={c.kind === "view" ? "Locked — managed off-platform" : "Edit"} onClick={() => onConfigure(service)}>{c.kind === "view" ? "View only" : c.kind === "manage" ? "Manage" : "Edit"}</button>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="bi-sliders" title="No quick configs" body={`${service.name} is configured entirely through product config (page 21).`} />
          )}
          <div className="d-flex gap-2 mt-3 flex-wrap">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => onConfigure(service)}><i className="bi bi-gear me-1" />Open configuration console</button>
            <button className="btn btn-outline-primary btn-sm" onClick={() => onFee(service)}><i className="bi bi-percent me-1" />Change fee structure</button>
          </div>
        </>
      )}

      {tab === "activity" && (
        <div className="pm-card pm-card-pad">
          <div className="pm-eyebrow mb-2">Recent changes affecting this service</div>
          {svcAudit.length > 0 ? svcAudit.slice(0, 6).map((a) => (
            <div className="pm-kv" key={a.id}>
              <span className="k">{a.change}<div className="pm-td-sub mono">{a.id} · {a.date} · {a.admin}</div></span>
              <span className="v mono" style={{ fontSize: ".72rem" }}>{a.from} → {a.to}</span>
            </div>
          )) : <div className="pm-td-sub">No configuration changes in the last 90 days.</div>}
        </div>
      )}
    </Drawer>
  );
}

/* ================================================================
   2. P&L explorer modal (full 6-month table + margin chips)
   ================================================================ */
export function ServicePnLModal({ service, onClose }: { service: Service | null; onClose: () => void }) {
  if (!service) return null;
  const totalRev = service.rev6m.reduce((s, x) => s + x, 0);
  const totalCost = service.cost6m.reduce((s, x) => s + x, 0);
  return (
    <Modal open onClose={onClose} tone="violet" icon="bi-graph-up-arrow" size="lg" title={`${service.name} — P&L explorer`}
      subtitle={`6-month revenue, cost and margin · ${service.id}`}
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => csvDownload(`${service.id}-pnl.csv`, MONTHS.map((m, i) => ({ month: m, revenue_kes_m: service.rev6m[i], cost_kes_m: service.cost6m[i], gross_kes_m: +(service.rev6m[i] - service.cost6m[i]).toFixed(2), margin_pct: service.rev6m[i] ? Math.round(((service.rev6m[i] - service.cost6m[i]) / service.rev6m[i]) * 1000) / 10 : null })))}>
            <i className="bi bi-download me-1" />Download CSV
          </button>
          <button className="btn btn-primary btn-sm" onClick={onClose}>Done</button>
        </>
      }>
      <div className="pm-modal-body">
        <div className="row g-2 mb-3">
          <div className="col-4"><div className="pm-stat"><span className="pm-stat-label">6M revenue</span><span className="pm-stat-value">{totalRev.toFixed(1)}M</span><span className="pm-stat-foot">KES millions</span></div></div>
          <div className="col-4"><div className="pm-stat"><span className="pm-stat-label">6M cost</span><span className="pm-stat-value">{totalCost.toFixed(1)}M</span><span className="pm-stat-foot">{service.costNote ?? "direct costs"}</span></div></div>
          <div className="col-4"><div className="pm-stat"><span className="pm-stat-label">6M gross</span><span className="pm-stat-value" style={{ color: totalRev - totalCost >= 0 ? "#0b8f52" : "#d92d20" }}>{(totalRev - totalCost).toFixed(1)}M</span><span className="pm-stat-foot">{totalRev ? Math.round(((totalRev - totalCost) / totalRev) * 100) : 0}% blended margin</span></div></div>
        </div>
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Month</th><th className="text-end">Revenue (M)</th><th className="text-end">Δ MoM</th><th className="text-end">Cost (M)</th><th className="text-end">Gross (M)</th><th className="text-end">Margin</th></tr></thead>
            <tbody>
              {MONTHS.map((m, i) => {
                const prev = i > 0 ? service.rev6m[i - 1] : null;
                const delta = prev !== null && prev > 0 ? ((service.rev6m[i] - prev) / prev) * 100 : null;
                const gross = service.rev6m[i] - service.cost6m[i];
                const mg = service.rev6m[i] ? Math.round((gross / service.rev6m[i]) * 1000) / 10 : null;
                return (
                  <tr key={m}>
                    <td className="pm-td-strong">{m} 2026</td>
                    <td className="text-end pm-num">{service.rev6m[i].toFixed(1)}</td>
                    <td className="text-end">{delta === null ? <span className="pm-td-sub">—</span> : <span className={delta >= 0 ? "pm-trend-up" : "pm-trend-down"}>{delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%</span>}</td>
                    <td className="text-end pm-num">{service.cost6m[i].toFixed(1)}</td>
                    <td className="text-end pm-num" style={{ fontWeight: 700, color: gross >= 0 ? "#12b76a" : "#f04438" }}>{gross.toFixed(1)}</td>
                    <td className="text-end"><Badge tone={marginTone(mg)}>{mg === null ? "—" : `${mg}%`}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="pm-note mt-3 mb-0"><i className="bi bi-info-circle me-1" />
          {service.revNote ? `Note: revenue column for this service is a ${service.revNote} — margin is reported as “—” per finance policy.` : `Fee structure ${service.feeStructure} · ${num(service.txns30d)} transactions in the last 30 days.`}
        </div>
      </div>
    </Modal>
  );
}

/* ================================================================
   3. Pause wizard (single or bulk · 3 steps + 2FA)
   ================================================================ */
export function PauseWizard({
  open, scope, onClose, onDone,
}: {
  open: boolean;
  scope: Service[];
  onClose: () => void;
  onDone: (ids: string[], reason: string, notify: boolean) => void;
}) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [reason, setReason] = useState("");
  const [notify, setNotify] = useState(true);
  const [banner, setBanner] = useState(true);
  const [code, setCode] = useState("");
  useEffect(() => { setStep(0); setReason(""); setCode(""); setNotify(true); setBanner(true); }, [open, scope.length]);
  if (!open) return null;
  const users = scope.reduce((s, x) => s + x.active30d, 0);
  return (
    <Modal open onClose={onClose} tone="red" icon="bi-pause-circle" size="md" title={scope.length > 1 ? `Pause ${scope.length} services` : `Pause — ${scope[0]?.name}`}
      subtitle={`Emergency stop with user notice · ${num(users)} monthly actives affected`}
      footer={
        <>
          {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}><i className="bi bi-arrow-left me-1" />Back</button>}
          {step < 2 ? (
            <button className="btn btn-danger btn-sm" disabled={step === 0 && reason.trim().length < 8} onClick={() => setStep(step + 1)}>Continue<i className="bi bi-arrow-right ms-1" /></button>
          ) : (
            <button className="btn btn-danger btn-sm" disabled={code !== CODE} onClick={() => {
              onDone(scope.map((s) => s.id), reason, notify);
              push({ kind: "warn", title: scope.length > 1 ? `${scope.length} services paused` : `${scope[0]?.name ?? "Service"} paused`, body: notify ? "In-app banner published to affected users." : "Users will discover the pause on next attempt." });
              onClose();
            }}><i className="bi bi-pause-fill me-1" />Confirm pause</button>
          )}
        </>
      }>
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / 3) * 100}%` }} /></div>
      <Steps current={step} steps={[{ label: "Reason", icon: "bi-exclamation-triangle" }, { label: "User notice", icon: "bi-megaphone" }, { label: "Confirm", icon: "bi-shield-lock" }]} />
      <div className="pm-modal-body">
        {step === 0 && (
          <>
            <div className="pm-note mb-3"><i className="bi bi-exclamation-triangle me-1" />Pausing stops new transactions immediately. Pending settlements still complete. This action is board-visible.</div>
            <div className="pm-card pm-card-pad mb-3">
              {scope.map((s) => (
                <div className="pm-kv" key={s.id}>
                  <span className="k"><i className={`bi ${s.icon} me-2`} style={{ color: "#175cd3" }} />{s.name}</span>
                  <span className="v mono" style={{ fontSize: ".74rem" }}>{num(s.active30d)} actives</span>
                </div>
              ))}
            </div>
            <label className="form-label">Reason (min 8 chars) <span style={{ color: "#f04438" }}>*</span></label>
            <textarea className="form-control" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Regulator instruction, partner outage, fraud pattern containment…" />
          </>
        )}
        {step === 1 && (
          <>
            <label className="form-label d-block mb-2">How should affected users be notified?</label>
            <button className={`pm-opt mb-2 ${notify ? "active" : ""}`} onClick={() => setNotify(true)}>
              <span className="r" />
              <span className="flex-grow-1">
                <b style={{ fontSize: ".85rem" }}>Push + SMS + email notice</b>
                <span className="d-block pm-td-sub">Sent on confirm · best for pauses longer than 1 hour</span>
              </span>
              <i className="bi bi-bell" style={{ color: "var(--pm-muted)" }} />
            </button>
            <button className={`pm-opt mb-2 ${!notify ? "active" : ""}`} onClick={() => setNotify(false)}>
              <span className="r" />
              <span className="flex-grow-1">
                <b style={{ fontSize: ".85rem" }}>Silent pause</b>
                <span className="d-block pm-td-sub">No notice — a friendly decline message is shown at transaction time</span>
              </span>
              <i className="bi bi-bell-slash" style={{ color: "var(--pm-muted)" }} />
            </button>
            <div className="form-check form-switch mt-3">
              <input className="form-check-input" type="checkbox" id="pauseBanner" checked={banner} onChange={(e) => setBanner(e.target.checked)} />
              <label className="form-check-label" htmlFor="pauseBanner" style={{ fontSize: ".82rem" }}>Show status banner on app &amp; web (auto-removed on resume)</label>
            </div>
            {notify && (
              <div className="pm-note mt-3">
                <div className="pm-eyebrow mb-1">Preview</div>
                “{scope.length > 1 ? "Some PayMo services are" : `${scope[0].name} is`} temporarily unavailable while we fix an issue. Your money is safe. We’ll be back shortly — sorry for the inconvenience.”
              </div>
            )}
          </>
        )}
        {step === 2 && (
          <>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-kv"><span className="k">Services</span><span className="v">{scope.map((s) => s.name.split(" ")[0]).join(", ")}</span></div>
              <div className="pm-kv"><span className="k">Monthly actives affected</span><span className="v mono">{num(users)}</span></div>
              <div className="pm-kv"><span className="k">Reason</span><span className="v" style={{ maxWidth: 280, whiteSpace: "normal" }}>{reason}</span></div>
              <div className="pm-kv"><span className="k">User notice</span><span className="v">{notify ? "Push + SMS + email" : "Silent"}</span></div>
              <div className="pm-kv"><span className="k">Status banner</span><span className="v">{banner ? "Shown" : "Hidden"}</span></div>
            </div>
            <TwoFactorField value={code} onChange={setCode} />
          </>
        )}
      </div>
    </Modal>
  );
}

/* ================================================================
   4. Resume modal (2FA)
   ================================================================ */
export function ResumeModal({ service, onClose, onDone }: { service: Service | null; onClose: () => void; onDone: (id: string, note: string) => void }) {
  const { push } = useToast();
  const [note, setNote] = useState("");
  const [code, setCode] = useState("");
  if (!service) return null;
  return (
    <Modal open onClose={onClose} tone="green" icon="bi-play-circle" size="sm" title={`Resume — ${service.name}`}
      subtitle={`${num(service.users)} users waiting · restore to Active`}
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm" disabled={code !== CODE || note.trim().length < 8} onClick={() => {
            onDone(service.id, note);
            push({ kind: "success", title: `${service.name} resumed`, body: "Banner removed · traffic ramping at 20%/min." });
            onClose();
          }}><i className="bi bi-play-fill me-1" />Resume service</button>
        </>
      }>
      <div className="pm-modal-body">
        <div className="pm-note mb-3"><i className="bi bi-info-circle me-1" />Traffic ramps gradually (20% → 50% → 100% over 10 minutes) to protect gateways from a thundering herd.</div>
        <label className="form-label">Go-live note (logged to audit) <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control mb-3" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. VASP licence cleared by compliance · reopening with limits" />
        <TwoFactorField value={code} onChange={setCode} />
      </div>
    </Modal>
  );
}

/* ================================================================
   5. Health detail modal
   ================================================================ */
export function HealthDetailModal({
  service, onClose, onSla, onCheck, onIncident,
}: {
  service: Service | null;
  onClose: () => void;
  onSla: (s: Service) => void;
  onCheck: (s: Service) => void;
  onIncident: () => void;
}) {
  if (!service) return null;
  const h = service.health;
  const incidents = INCIDENTS.filter((i) => i.serviceId === service.id);
  const uptimeTone = slaMet(h) ? "green" : "red";
  return (
    <Modal open onClose={onClose} tone={slaMet(h) ? "green" : "red"} icon="bi-heart-pulse" size="lg"
      title={`${h.gateway} — health`} subtitle={`${service.name} · ${service.tier} · SLA target ${h.slaTarget}%`}
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={onIncident}><i className="bi bi-broadcast me-1" />Incident response</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => onSla(service)}><i className="bi bi-bullseye me-1" />Edit SLA target</button>
          <button className="btn btn-primary btn-sm" onClick={() => onCheck(service)}><i className="bi bi-activity me-1" />Run synthetic check</button>
        </>
      }>
      <div className="pm-modal-body">
        <div className="row g-2 mb-3">
          <div className="col-6 col-lg-3"><div className="pm-stat"><span className="pm-stat-label">Uptime 30d</span><span className="pm-stat-value">{h.uptime}%</span><span className="pm-stat-foot">{slaMet(h) ? `${(h.uptime - h.slaTarget).toFixed(2)} pts above target` : `${(h.slaTarget - h.uptime).toFixed(2)} pts below target`}</span></div></div>
          <div className="col-6 col-lg-3"><div className="pm-stat"><span className="pm-stat-label">Latency p95</span><span className="pm-stat-value">{h.latency}</span><span className="pm-stat-foot">authorisation round-trip</span></div></div>
          <div className="col-6 col-lg-3"><div className="pm-stat"><span className="pm-stat-label">Error rate</span><span className="pm-stat-value">{h.errorRate}%</span><span className="pm-stat-foot">5xx + business declines</span></div></div>
          <div className="col-6 col-lg-3"><div className="pm-stat"><span className="pm-stat-label">SLA status</span><span className="pm-stat-value" style={{ fontSize: "1.05rem" }}><Badge tone={uptimeTone} dot>{slaMet(h) ? "Met" : "Breached"}</Badge></span><span className="pm-stat-foot">{h.lastIncident}</span></div></div>
        </div>
        <div className="pm-eyebrow mb-2">Incident history (90 days)</div>
        {incidents.length ? incidents.map((i) => (
          <div className="pm-alert-row mb-2" key={i.id} style={{ borderLeftColor: i.severity === "SEV1" ? "#f04438" : i.severity === "SEV2" ? "#f79009" : "#2e90fa" }}>
            <div className="flex-grow-1">
              <div className="d-flex gap-2 align-items-center flex-wrap">
                <Badge tone={i.severity === "SEV1" ? "red" : i.severity === "SEV2" ? "amber" : "blue"}>{i.severity}</Badge>
                <span style={{ fontWeight: 700, fontSize: ".8rem" }}>{i.title}</span>
              </div>
              <div className="pm-td-sub">{i.id} · {i.date} · {i.duration} · {i.impact}</div>
            </div>
          </div>
        )) : <div className="pm-note">No incidents in the last 90 days 🎉</div>}
      </div>
    </Modal>
  );
}

/* ================================================================
   6. SLA editor modal (2FA)
   ================================================================ */
export function SlaEditorModal({ service, onClose, onDone }: { service: Service | null; onClose: () => void; onDone: (id: string, target: number, reason: string) => void }) {
  const { push } = useToast();
  const [target, setTarget] = useState(service?.health.slaTarget ?? 99.9);
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  useEffect(() => { setTarget(service?.health.slaTarget ?? 99.9); setReason(""); setCode(""); }, [service?.id]);
  if (!service) return null;
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-bullseye" size="sm" title={`SLA target — ${service.health.gateway}`}
      subtitle={`Current ${service.health.slaTarget}% · uptime 30d ${service.health.uptime}%`}
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm" disabled={code !== CODE || reason.trim().length < 8 || target === service.health.slaTarget} onClick={() => {
            onDone(service.id, target, reason);
            push({ kind: "success", title: "SLA target updated", body: `${service.health.gateway}: ${service.health.slaTarget}% → ${target}%.` });
            onClose();
          }}><i className="bi bi-check2 me-1" />Save target</button>
        </>
      }>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="d-flex justify-content-between mb-1"><span className="pm-eyebrow mb-0">Target uptime</span><span className="mono" style={{ fontWeight: 800 }}>{target.toFixed(2)}%</span></div>
          <input type="range" className="form-range" min={98} max={99.99} step={0.01} value={target} onChange={(e) => setTarget(Number(e.target.value))} />
          <div className="pm-td-sub mono">allowed downtime {target >= 99.9 ? `≈ ${Math.round((100 - target) * 4.32)} min/month` : `≈ ${Math.round((100 - target) * 43.2)} min/month`}</div>
        </div>
        <label className="form-label">Reason <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control mb-3" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Enterprise contracts require 99.99% from Jan 2027" />
        <TwoFactorField value={code} onChange={setCode} />
      </div>
    </Modal>
  );
}

/* ================================================================
   7. Synthetic check wizard (3 steps with live progress)
   ================================================================ */
export function SyntheticCheckWizard({
  open, service, onClose, onIncident,
}: {
  open: boolean;
  service: Service | null;
  onClose: () => void;
  onIncident: (serviceId: string, finding: string) => void;
}) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [scope, setScope] = useState<string[]>(["Balance inquiry", "Latency probe"]);
  const [progress, setProgress] = useState(0);
  useEffect(() => { setStep(0); setProgress(0); setScope(["Balance inquiry", "Latency probe"]); }, [open, service?.id]);
  useEffect(() => {
    if (step !== 1) return;
    setProgress(0);
    const t = setInterval(() => setProgress((p) => (p >= 100 ? 100 : p + 7)), 90);
    return () => clearInterval(t);
  }, [step]);
  useEffect(() => { if (progress >= 100 && step === 1) setStep(2); }, [progress, step]);
  if (!open || !service) return null;
  const checks = ["Balance inquiry", "Mini txn push", "Latency probe", "Webhook handshake", "Callback replay"];
  const failed = service.health.errorRate > 0.3;
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-activity" size="md" title="Synthetic service check"
      subtitle={`${service.name} · ${service.health.gateway} · production probes`}
      footer={
        <>
          {step === 2 && failed && <button className="btn btn-outline-danger btn-sm me-auto" style={{ borderColor: "#fda29b", color: "#b42318" }} onClick={() => { onIncident(service.id, `Synthetic check failure on ${service.health.gateway}`); onClose(); }}><i className="bi bi-broadcast me-1" />Raise incident</button>}
          {step === 0 && <button className="btn btn-outline-secondary btn-sm me-auto" onClick={onClose}>Cancel</button>}
          {step === 0 && <button className="btn btn-primary btn-sm" disabled={scope.length === 0} onClick={() => setStep(1)}><i className="bi bi-play-fill me-1" />Run {scope.length} probe{scope.length === 1 ? "" : "s"}</button>}
          {(step === 1 || step === 2) && <button className="btn btn-primary btn-sm" onClick={() => { if (step === 2) push({ kind: failed ? "warn" : "success", title: failed ? "Check finished — attention needed" : "All probes green", body: `${service.health.gateway} · ${scope.length} probes.` }); onClose(); }}>Done</button>}
        </>
      }>
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / 3) * 100}%` }} /></div>
      <Steps current={step} steps={[{ label: "Probes", icon: "bi-list-check" }, { label: "Running", icon: "bi-arrow-repeat" }, { label: "Results", icon: "bi-clipboard-check" }]} />
      <div className="pm-modal-body">
        {step === 0 && (
          <>
            <div className="pm-note mb-3"><i className="bi bi-info-circle me-1" />Probes run a KES 1 test transaction against production and auto-reverse it. Users are never affected.</div>
            {checks.map((c) => (
              <button key={c} className={`pm-opt mb-2 ${scope.includes(c) ? "active" : ""}`} onClick={() => setScope((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]))}>
                <span className="r" />
                <span className="flex-grow-1" style={{ fontWeight: 600, fontSize: ".85rem" }}>{c}</span>
                <i className="bi bi-check2-circle" style={{ color: scope.includes(c) ? "#12b76a" : "transparent" }} />
              </button>
            ))}
          </>
        )}
        {step === 1 && (
          <div className="text-center py-4">
            <div className="pm-modal-ico mx-auto mb-3" style={{ background: "#eff8ff", color: "#175cd3", width: 54, height: 54, fontSize: "1.4rem" }}><i className="bi bi-arrow-repeat" /></div>
            <div style={{ fontWeight: 700 }}>Probing {service.health.gateway}…</div>
            <div className="pm-td-sub mb-3">{scope.join(" · ")}</div>
            <div className="pm-meter mx-auto" style={{ maxWidth: 320 }}><span style={{ width: `${progress}%`, background: "#2e90fa", transition: "width .09s linear" }} /></div>
            <div className="pm-td-sub mono mt-2">{progress}% · {Math.round((progress / 100) * scope.length)}/{scope.length} probes</div>
          </div>
        )}
        {step === 2 && (
          <>
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Probe</th><th className="text-end">Result</th><th className="text-end">Time</th></tr></thead>
                <tbody>
                  {scope.map((c, i) => {
                    const bad = failed && i === scope.length - 1;
                    return (
                      <tr key={c}>
                        <td className="pm-td-strong">{c}</td>
                        <td className="text-end"><Badge tone={bad ? "red" : "green"} dot>{bad ? "Failed" : "Passed"}</Badge></td>
                        <td className="text-end pm-num">{(0.3 + i * 0.42 + (bad ? 9.4 : 0)).toFixed(2)}s</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {failed ? (
              <div className="pm-alert-row crit mt-3 mb-0">
                <i className="bi bi-exclamation-octagon-fill" style={{ color: "#f04438" }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: ".8rem" }}>Webhook handshake timed out at 9.7s</div>
                  <div className="pm-td-sub">Error rate {service.health.errorRate}% exceeds the 0.30% probe threshold. Consider raising an incident for {service.tier} remediation.</div>
                </div>
              </div>
            ) : (
              <div className="pm-note mt-3 mb-0"><i className="bi bi-check-circle me-1" />All probes passed. Gateway latency consistent with the 30d p95 of {service.health.latency}.</div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}

/* ================================================================
   8. Adoption detail modal (funnel + target entry)
   ================================================================ */
export function AdoptionDetailModal({ service, onClose, onTarget }: { service: Service | null; onClose: () => void; onTarget: (s: Service) => void }) {
  if (!service) return null;
  const stages = [
    { label: "Registered users", value: service.users },
    { label: "Activated (ever used)", value: Math.round(service.users * 0.94) },
    { label: "Active 30d", value: service.active30d },
    { label: "Active 7d", value: Math.round(service.active30d * 0.55) },
    { label: "Repeat (3+ txns/wk)", value: Math.round(service.active30d * 0.38) },
  ];
  const adoption = service.users ? Math.round((service.active30d / service.users) * 1000) / 10 : 0;
  return (
    <Modal open onClose={onClose} tone="violet" icon="bi-funnel" size="md" title={`${service.name} — adoption funnel`}
      subtitle={`${adoption}% adoption vs ${service.adoptionTarget}% target · ${service.growthMom >= 0 ? "+" : ""}${service.growthMom}% MoM`}
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => csvDownload(`${service.id}-funnel.csv`, stages)}><i className="bi bi-download me-1" />Export funnel</button>
          <button className="btn btn-primary btn-sm" onClick={() => onTarget(service)}><i className="bi bi-bullseye me-1" />Set adoption target</button>
        </>
      }>
      <div className="pm-modal-body">
        {stages.map((s, i) => {
          const width = stages[0].value ? Math.max(4, (s.value / stages[0].value) * 100) : 0;
          const drop = i > 0 ? Math.round((1 - s.value / stages[i - 1].value) * 100) : 0;
          return (
            <div key={s.label} className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span style={{ fontSize: ".78rem", fontWeight: 600 }}>{s.label}</span>
                <span className="mono" style={{ fontSize: ".76rem", fontWeight: 700 }}>{num(s.value)}{i > 0 && <span className="pm-td-sub" style={{ fontWeight: 500 }}> · −{drop}%</span>}</span>
              </div>
              <div className="pm-bar-track"><span style={{ width: `${width}%`, background: i === 2 ? "#12b76a" : i >= 3 ? "#7a5af8" : "#2e90fa" }} /></div>
            </div>
          );
        })}
        <div className="pm-note">
          <i className="bi bi-lightbulb me-1" />
          {adoption >= service.adoptionTarget
            ? "Target met — growth is now driven by new-user acquisition rather than activation."
            : `${(service.adoptionTarget - adoption).toFixed(1)} pts to target ≈ ${num(Math.round(((service.adoptionTarget / 100) * service.users) - service.active30d))} users to activate.`}
        </div>
      </div>
    </Modal>
  );
}

/* ================================================================
   9. Adoption target modal
   ================================================================ */
export function AdoptionTargetModal({ service, onClose, onDone }: { service: Service | null; onClose: () => void; onDone: (id: string, target: number) => void }) {
  const { push } = useToast();
  const [target, setTarget] = useState(service?.adoptionTarget ?? 50);
  useEffect(() => setTarget(service?.adoptionTarget ?? 50), [service?.id]);
  if (!service) return null;
  const adoption = service.users ? Math.round((service.active30d / service.users) * 1000) / 10 : 0;
  return (
    <Modal open onClose={onClose} tone="violet" icon="bi-bullseye" size="sm" title={`Adoption target — ${service.name}`}
      subtitle={`Current adoption ${adoption}% · growth ${service.growthMom >= 0 ? "+" : ""}${service.growthMom}% MoM`}
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm" disabled={target === service.adoptionTarget} onClick={() => {
            onDone(service.id, target);
            push({ kind: "success", title: "Adoption target set", body: `${service.name}: ${service.adoptionTarget}% → ${target}%. Product OKR updated.` });
            onClose();
          }}><i className="bi bi-check2 me-1" />Save target</button>
        </>
      }>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="d-flex justify-content-between mb-1"><span className="pm-eyebrow mb-0">Target adoption</span><span className="mono" style={{ fontWeight: 800 }}>{target}%</span></div>
          <input type="range" className="form-range" min={10} max={100} step={5} value={target} onChange={(e) => setTarget(Number(e.target.value))} />
          <div className="pm-td-sub">= {num(Math.round((target / 100) * service.users))} monthly actives of {num(service.users)} registered</div>
        </div>
        <div className="pm-note mb-0"><i className="bi bi-info-circle me-1" />Targets sync to the product OKR sheet and appear on the KPI scorecard (page 3) next review cycle.</div>
      </div>
    </Modal>
  );
}

/* ================================================================
   10. Compare modal (side-by-side up to 3 services)
   ================================================================ */
export function CompareModal({ open, services, preselect, onClose }: { open: boolean; services: Service[]; preselect: Service[]; onClose: () => void }) {
  const [picked, setPicked] = useState<string[]>([]);
  const [q, setQ] = useState("");
  useEffect(() => { setPicked(preselect.map((s) => s.id)); setQ(""); }, [open, preselect.length]);
  if (!open) return null;
  const chosen = services.filter((s) => picked.includes(s.id)).slice(0, 3);
  const rows: { label: string; get: (s: Service) => React.ReactNode }[] = [
    { label: "Status", get: (s) => <Badge tone={svcTone(s.status)} dot>{s.status}</Badge> },
    { label: "Category", get: (s) => s.category },
    { label: "Tier", get: (s) => <Badge tone={s.tier === "Tier 1" ? "red" : s.tier === "Tier 2" ? "amber" : "grey"}>{s.tier}</Badge> },
    { label: "Users", get: (s) => <span className="pm-num">{num(s.users)}</span> },
    { label: "Active 30d", get: (s) => <span className="pm-num">{num(s.active30d)}</span> },
    { label: "Txns 30d", get: (s) => <span className="pm-num">{num(s.txns30d)}</span> },
    { label: "Revenue 30d", get: (s) => <span className="pm-num">{kesM(s.revenue30d)}</span> },
    { label: "Cost 30d", get: (s) => <span className="pm-num">{kesM(s.cost30d)}</span> },
    { label: "Margin", get: (s) => <Badge tone={marginTone(s.margin)}>{s.margin === null ? "—" : `${s.margin}%`}</Badge> },
    { label: "Fee structure", get: (s) => s.feeStructure },
    { label: "Growth MoM", get: (s) => <span className={s.growthMom >= 0 ? "pm-trend-up" : "pm-trend-down"}>{s.growthMom >= 0 ? "▲" : "▼"} {Math.abs(s.growthMom)}%</span> },
    { label: "Uptime 30d", get: (s) => <span className="pm-num">{s.health.uptime}%</span> },
    { label: "SLA", get: (s) => <Badge tone={slaMet(s.health) ? "green" : "red"} dot>{slaMet(s.health) ? "Met" : "Breached"}</Badge> },
    { label: "Owner", get: (s) => s.owner },
  ];
  return (
    <Modal open onClose={onClose} tone="ink" icon="bi-git-compare" size="xl" title="Compare services" subtitle="Pick up to 3 services for a side-by-side read"
      footer={<button className="btn btn-primary btn-sm" onClick={onClose}>Done</button>}>
      <div className="pm-modal-body">
        <input className="form-control mb-3" placeholder="Search services to add…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="d-flex flex-wrap gap-2 mb-3">
          {services.filter((s) => s.name.toLowerCase().includes(q.toLowerCase())).slice(0, 8).map((s) => (
            <button key={s.id} className={`pm-chip ${picked.includes(s.id) ? "active" : ""}`} disabled={picked.length >= 3 && !picked.includes(s.id)}
              onClick={() => setPicked((p) => (p.includes(s.id) ? p.filter((x) => x !== s.id) : [...p, s.id]))}>
              <i className={`bi ${s.icon} me-1`} />{s.name}{picked.includes(s.id) && <i className="bi bi-x-lg ms-2" style={{ fontSize: ".6rem" }} />}
            </button>
          ))}
        </div>
        {chosen.length ? (
          <div className="pm-table-wrap">
            <table className="pm-table">
              <thead><tr><th style={{ minWidth: 140 }}>Metric</th>{chosen.map((s) => <th key={s.id} className="text-center"><i className={`bi ${s.icon} me-1`} style={{ color: "#175cd3" }} />{s.name}</th>)}</tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label}>
                    <td className="pm-td-sub" style={{ fontWeight: 700, color: "var(--pm-ink)", textTransform: "uppercase", fontSize: ".64rem", letterSpacing: ".06em" }}>{r.label}</td>
                    {chosen.map((s) => <td key={s.id} className="text-center">{r.get(s)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState icon="bi-git-compare" title="Nothing selected" body="Pick services from the chips above to compare them." />}
      </div>
    </Modal>
  );
}

/* ================================================================
   11. Dependency drawer (visual chains)
   ================================================================ */
export function DependencyDrawer({ open, chains, onClose, onOpen }: { open: boolean; chains: DependencyChain[]; onClose: () => void; onOpen: (id: string) => void }) {
  return (
    <Drawer open={open} onClose={onClose} wide icon="bi-diagram-3" tone="blue" title="Service dependency map"
      subtitle={`${chains.length} critical chains · blast radius & runbooks`}
      footer={<div className="pm-note w-100 mb-0"><i className="bi bi-shield-check me-1" />Tier 1 chains are rehearsed quarterly. The internal ledger (DEP-08) underpins every service — its RTO is 5 minutes.</div>}>
      {chains.map((c) => (
        <button key={c.id} className="pm-card pm-card-pad w-100 text-start mb-3" style={{ borderLeft: `3px solid ${c.tier === "Tier 1" ? "#f04438" : c.tier === "Tier 2" ? "#f79009" : "#98a2b3"}` }} onClick={() => onOpen(c.id)}>
          <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
            <i className={`bi ${c.icon}`} style={{ color: "#175cd3" }} />
            <span style={{ fontWeight: 700, fontSize: ".84rem" }}>{c.service}</span>
            <Badge tone={c.tier === "Tier 1" ? "red" : c.tier === "Tier 2" ? "amber" : "grey"}>{c.tier}</Badge>
            <Badge tone="violet">RTO {c.rto}</Badge>
            <span className="ms-auto pm-td-sub mono">{num(c.blastRadius)} users in blast radius</span>
          </div>
          <div className="d-flex align-items-center flex-wrap gap-1">
            {c.nodes.map((n, i) => (
              <span key={n.name} className="d-flex align-items-center gap-1">
                {i > 0 && <i className="bi bi-arrow-right mx-1" style={{ color: "#98a2b3", fontSize: ".7rem" }} />}
                <span className="pm-chip" style={{ fontSize: ".68rem", padding: ".14rem .5rem", background: n.kind === "internal" ? "#eef8ff" : n.kind === "processor" ? "#f4f1ff" : "#fff5e6", borderColor: n.kind === "internal" ? "#cfe6ff" : n.kind === "processor" ? "#ded4ff" : "#fde3b8" }}>
                  {n.name}
                </span>
              </span>
            ))}
          </div>
        </button>
      ))}
    </Drawer>
  );
}

/* ================================================================
   12. Dependency detail modal
   ================================================================ */
export function DependencyDetailModal({
  chain, onClose, onCheck, onIncident,
}: {
  chain: DependencyChain | null;
  onClose: () => void;
  onCheck: (serviceId: string) => void;
  onIncident: () => void;
}) {
  if (!chain) return null;
  const svc = { id: chain.serviceId } as Service;
  return (
    <Modal open onClose={onClose} tone="blue" icon={chain.icon} size="lg" title={`${chain.service} — dependency chain`}
      subtitle={`${chain.id} · ${chain.tier} · RTO ${chain.rto} · failover: ${chain.failover}`}
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={onIncident}><i className="bi bi-broadcast me-1" />Open incident response</button>
          <button className="btn btn-primary btn-sm" onClick={() => onCheck(svc.id)}><i className="bi bi-activity me-1" />Probe this chain</button>
        </>
      }>
      <div className="pm-modal-body">
        <div className="row g-2 mb-3">
          <div className="col-6 col-lg-4"><div className="pm-stat"><span className="pm-stat-label">Blast radius</span><span className="pm-stat-value">{num(chain.blastRadius)}</span><span className="pm-stat-foot">users affected if chain down</span></div></div>
          <div className="col-6 col-lg-4"><div className="pm-stat"><span className="pm-stat-label">Recovery objective</span><span className="pm-stat-value">{chain.rto}</span><span className="pm-stat-foot">RTO · rehearsed quarterly</span></div></div>
          <div className="col-12 col-lg-4"><div className="pm-stat"><span className="pm-stat-label">Downstream services</span><span className="pm-stat-value" style={{ fontSize: "1.05rem" }}>{chain.downstream.length}</span><span className="pm-stat-foot">{chain.downstream.join(" · ")}</span></div></div>
        </div>
        <div className="pm-eyebrow mb-2">Chain</div>
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-timeline">
            {chain.nodes.map((n) => (
              <div className="pm-tl-item done" key={n.name}>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span style={{ fontWeight: 700, fontSize: ".82rem" }}>{n.name}</span>
                  <Badge tone={n.kind === "internal" ? "blue" : n.kind === "processor" ? "violet" : "amber"}>{n.kind}</Badge>
                </div>
                <div className="pm-td-sub">{n.note}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="pm-eyebrow mb-2">Runbook ({chain.runbook.length} steps)</div>
        <div className="pm-card pm-card-pad">
          {chain.runbook.map((r, i) => (
            <div className="pm-kv" key={r}>
              <span className="k"><span className="pm-avatar sm me-2" style={{ background: "#eef1f6", color: "#475467" }}>{i + 1}</span>{r}</span>
              <span className="v"><Badge tone="grey">on-call</Badge></span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

/* ================================================================
   13. Configuration console drawer
   ================================================================ */
export function ConfigDrawer({
  open, configs, focus, onClose, onEdit,
}: {
  open: boolean;
  configs: QuickConfig[];
  focus?: { name: string; category: string } | null;
  onClose: () => void;
  onEdit: (c: QuickConfig) => void;
}) {
  const byService = configs.reduce<Record<string, QuickConfig[]>>((acc, c) => { (acc[c.service] ??= []).push(c); return acc; }, {});
  const groups = Object.entries(byService);
  if (focus) groups.sort((a, b) => (a[0] === focus.name.split(" ")[0] ? -1 : b[0] === focus.name.split(" ")[0] ? 1 : 0));
  return (
    <Drawer open={open} onClose={onClose} wide icon="bi-sliders" tone="violet" title="Service configuration console"
      subtitle={`${configs.length} quick-access settings · Super Admin + 2FA to change`}
      footer={<div className="pm-note w-100 mb-0"><i className="bi bi-shield-lock me-1" />Every change is versioned with your name, reason and approver, and lands in the audit trail.</div>}>
      {groups.map(([svc, rows]) => (
        <div className="pm-card mb-3" key={svc}>
          <div className="pm-card-head"><h3 className="pm-card-title">{svc}</h3><span className="pm-td-sub mono">{rows.length} settings</span></div>
          <div className="pm-table-wrap">
            <table className="pm-table">
              <thead><tr><th>Key config</th><th>Current value</th><th>Changed</th><th /></tr></thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id} style={{ cursor: c.kind === "edit" ? "pointer" : "default" }} onClick={() => c.kind === "edit" && onEdit(c)}>
                    <td className="pm-td-strong">{c.key}<div className="pm-td-sub mono">{c.id}{c.validation ? ` · ${c.validation}` : ""}</div></td>
                    <td className="mono" style={{ fontWeight: 700 }}>{c.value}</td>
                    <td className="pm-td-sub mono">{c.changed} · {c.changedBy}</td>
                    <td className="text-end">
                      {c.kind === "view" ? <Badge tone="grey">View only</Badge> : c.kind === "manage" ? (
                        <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".66rem" }} onClick={(e) => { e.stopPropagation(); onEdit(c); }}>Manage</button>
                      ) : (
                        <button className="btn btn-sm btn-outline-primary" style={{ fontSize: ".66rem" }} onClick={(e) => { e.stopPropagation(); onEdit(c); }}>Edit</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </Drawer>
  );
}

/* ================================================================
   14. Config edit modal (2FA + reason)
   ================================================================ */
export function ConfigEditModal({ config, onClose, onDone }: { config: QuickConfig | null; onClose: () => void; onDone: (id: string, value: string, reason: string) => void }) {
  const { push } = useToast();
  const [value, setValue] = useState("");
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  useEffect(() => { setValue(config?.value ?? ""); setReason(""); setCode(""); }, [config?.id]);
  if (!config) return null;
  const isManage = config.kind === "manage";
  return (
    <Modal open onClose={onClose} tone="violet" icon={isManage ? "bi-list-check" : "bi-sliders"} size="sm"
      title={isManage ? `Manage — ${config.key}` : `Edit — ${config.key}`}
      subtitle={`${config.service} · last changed ${config.changed} by ${config.changedBy}`}
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm" disabled={(!isManage && (value === config.value || !value.trim())) || reason.trim().length < 8 || code !== CODE} onClick={() => {
            onDone(config.id, isManage ? config.value : value.trim(), reason);
            push({ kind: "success", title: `${config.key} updated`, body: `${config.service}: ${config.value} → ${isManage ? config.value : value.trim()}.` });
            onClose();
          }}><i className="bi bi-check2 me-1" />Save configuration</button>
        </>
      }>
      <div className="pm-modal-body">
        {isManage ? (
          <>
            <div className="pm-note mb-3"><i className="bi bi-info-circle me-1" />{config.key} for {config.service} is a catalog — review the register and confirm the change note.</div>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-kv"><span className="k">M-Pesa / telco billers</span><span className="v mono">104</span></div>
              <div className="pm-kv"><span className="k">County &amp; national gov</span><span className="v mono">58</span></div>
              <div className="pm-kv"><span className="k">TV &amp; internet</span><span className="v mono">27</span></div>
              <div className="pm-kv"><span className="k">Schools &amp; betting</span><span className="v mono">45</span></div>
              <div className="pm-kv"><span className="k">Corridors (international)</span><span className="v mono">45 countries</span></div>
            </div>
          </>
        ) : (
          <>
            <label className="form-label">New value {config.validation && <span className="pm-td-sub">· valid: {config.validation}</span>}</label>
            <input className="form-control mb-3 mono" value={value} onChange={(e) => setValue(e.target.value)} />
            <div className="pm-td-sub mb-3">Current: <b className="mono">{config.value}</b></div>
          </>
        )}
        <label className="form-label">Reason (min 8 chars) <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control mb-3" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. align with CBK notice / ALCO decision / partner contract" />
        <TwoFactorField value={code} onChange={setCode} />
      </div>
    </Modal>
  );
}

/* ================================================================
   15. Retirement drawer
   ================================================================ */
export function RetirementDrawer({
  open, plans, onClose, onOpen, onWizard,
}: {
  open: boolean;
  plans: RetirementPlan[];
  onClose: () => void;
  onOpen: (p: RetirementPlan) => void;
  onWizard: () => void;
}) {
  return (
    <Drawer open={open} onClose={onClose} wide icon="bi-box-arrow-right" tone="amber" title="Service retirement planning"
      subtitle={`${plans.length} sunset programs · every user migrated or notified 4×`}
      footer={<button className="btn btn-primary btn-sm w-100" onClick={onWizard}><i className="bi bi-plus-lg me-1" />Plan a retirement</button>}>
      {plans.map((p) => {
        const migratedPct = p.users ? Math.round((p.migrated / p.users) * 100) : 0;
        return (
          <button key={p.id} className="pm-card pm-card-pad w-100 text-start mb-3" onClick={() => onOpen(p)}>
            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
              <span style={{ fontWeight: 700, fontSize: ".84rem" }}>{p.service}</span>
              <Badge tone={stageTone(p.status)} dot>{p.status}</Badge>
              <span className="ms-auto pm-td-sub mono">{p.deadline}</span>
            </div>
            <div className="pm-td-sub mb-2">{p.reason}</div>
            <div className="d-flex align-items-center gap-2">
              <Meter value={migratedPct} tone={migratedPct >= 75 ? "#12b76a" : "#f79009"} width={160} />
              <span className="pm-td-sub mono">{num(p.migrated)}/{num(p.users)} migrated · {p.commsStage}</span>
            </div>
          </button>
        );
      })}
    </Drawer>
  );
}

/* ================================================================
   16. Retirement detail modal
   ================================================================ */
export function RetirementDetailModal({ plan, onClose, onWizard }: { plan: RetirementPlan | null; onClose: () => void; onWizard: () => void }) {
  if (!plan) return null;
  const migratedPct = plan.users ? Math.round((plan.migrated / plan.users) * 100) : 0;
  return (
    <Modal open onClose={onClose} tone="amber" icon="bi-box-arrow-right" size="md" title={plan.service}
      subtitle={`${plan.id} · ${plan.status} · deadline ${plan.deadline}`}
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
          <button className="btn btn-primary btn-sm" onClick={() => { onClose(); onWizard(); }}><i className="bi bi-calendar-check me-1" />New sunset plan</button>
        </>
      }>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone={stageTone(plan.status)} dot>{plan.status}</Badge></span></div>
          <div className="pm-kv"><span className="k">Reason</span><span className="v" style={{ maxWidth: 300, whiteSpace: "normal" }}>{plan.reason}</span></div>
          <div className="pm-kv"><span className="k">Migration path</span><span className="v">{plan.migration}</span></div>
          <div className="pm-kv"><span className="k">Deadline</span><span className="v mono">{plan.deadline}</span></div>
          <div className="pm-kv"><span className="k">Comms stage</span><span className="v">{plan.commsStage}</span></div>
        </div>
        <div className="pm-eyebrow mb-2">Migration progress</div>
        <div className="pm-bar-track mb-2">
          <span style={{ width: `${migratedPct}%`, background: "#12b76a" }} />
          <span style={{ width: `${100 - migratedPct}%`, background: "#fda29b" }} />
        </div>
        <div className="pm-td-sub mb-3">{num(plan.migrated)} migrated · {num(plan.users - plan.migrated)} to go ({migratedPct}% complete)</div>
        <div className="pm-eyebrow mb-2">Comms schedule</div>
        <div className="pm-timeline">
          {[["T-90 days", "In-app banner + email"], ["T-60 days", "SMS + agent script"], ["T-30 days", "Final push + fee waiver nudge"], ["T-0", "Service disabled · support macros live"]].map(([t, what], i) => (
            <div className={`pm-tl-item ${i < 3 ? "done" : "warn"}`} key={t}>
              <div style={{ fontWeight: 700, fontSize: ".8rem" }}>{t}</div>
              <div className="pm-td-sub">{what}</div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

/* ================================================================
   17. Retirement wizard (4 steps)
   ================================================================ */
export function RetirementWizard({
  open, services, onClose, onDone,
}: {
  open: boolean;
  services: Service[];
  onClose: () => void;
  onDone: (serviceId: string, reason: string, migration: string, deadline: string, banner: boolean) => void;
}) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [svcId, setSvcId] = useState("");
  const [reason, setReason] = useState("");
  const [migration, setMigration] = useState("App + app-lite");
  const [deadline, setDeadline] = useState("2027-03-31");
  const [banner, setBanner] = useState(true);
  const [code, setCode] = useState("");
  useEffect(() => { setStep(0); setSvcId(""); setReason(""); setCode(""); }, [open]);
  if (!open) return null;
  const svc = services.find((s) => s.id === svcId);
  const valid = [svcId, reason.trim().length >= 8, true, true, code === CODE][step];
  return (
    <Modal open onClose={onClose} tone="amber" icon="bi-box-arrow-right" size="md" title="Plan a service retirement"
      subtitle="Announce → migrate → sunset · every user accounted for"
      footer={
        <>
          {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}><i className="bi bi-arrow-left me-1" />Back</button>}
          {step < 3 ? (
            <button className="btn btn-primary btn-sm" disabled={!valid} onClick={() => setStep(step + 1)}>Continue<i className="bi bi-arrow-right ms-1" /></button>
          ) : (
            <button className="btn btn-primary btn-sm" disabled={code !== CODE} onClick={() => {
              onDone(svcId, reason, migration, deadline, banner);
              push({ kind: "success", title: "Sunset plan created", body: `${svc?.name}: announced, deadline ${deadline}. 4 notices scheduled.` });
              onClose();
            }}><i className="bi bi-calendar-check me-1" />Announce retirement</button>
          )}
        </>
      }>
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
      <Steps current={step} steps={[{ label: "Service", icon: "bi-collection" }, { label: "Reason & path", icon: "bi-signpost-split" }, { label: "Comms", icon: "bi-megaphone" }, { label: "Confirm", icon: "bi-shield-lock" }]} />
      <div className="pm-modal-body">
        {step === 0 && (
          <>
            <div className="pm-note mb-3"><i className="bi bi-exclamation-triangle me-1" />Retiring a service sets its status to “Sunsetting”, freezes new signups and starts the 4-notice comms clock.</div>
            {services.filter((s) => s.status !== "Sunsetting").map((s) => (
              <button key={s.id} className={`pm-opt mb-2 ${svcId === s.id ? "active" : ""}`} onClick={() => setSvcId(s.id)}>
                <span className="r" />
                <span className="flex-grow-1">
                  <b style={{ fontSize: ".85rem" }}>{s.name}</b>
                  <span className="d-block pm-td-sub">{s.category} · {num(s.active30d)} monthly actives · margin {s.margin === null ? "—" : `${s.margin}%`}</span>
                </span>
                <i className={`bi ${s.icon}`} style={{ color: "var(--pm-muted)" }} />
              </button>
            ))}
          </>
        )}
        {step === 1 && (
          <>
            <label className="form-label">Why is {svc?.name} being retired? <span style={{ color: "#f04438" }}>*</span></label>
            <textarea className="form-control mb-3" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. usage below 3% of volume, partner EOL, cost to serve exceeds margin" />
            <label className="form-label">Migration path</label>
            <select className="form-select mb-3" value={migration} onChange={(e) => setMigration(e.target.value)}>
              <option>App + app-lite</option>
              <option>Bank transfer</option>
              <option>Agent cash-in</option>
              <option>In-app statements (email PDF)</option>
              <option>Terminal swap programme</option>
            </select>
            <label className="form-label">Sunset deadline</label>
            <input type="date" className="form-control" value={deadline} onChange={(e) => setDeadline(e.target.value)} min="2026-09-01" />
          </>
        )}
        {step === 2 && (
          <>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-eyebrow mb-2">Notice schedule (automatic)</div>
              <div className="pm-timeline">
                <div className="pm-tl-item done"><b style={{ fontSize: ".8rem" }}>T-90 · in-app + email</b><div className="pm-td-sub">explains why, links migration guide</div></div>
                <div className="pm-tl-item"><b style={{ fontSize: ".8rem" }}>T-60 · SMS + agent script</b><div className="pm-td-sub">assisted migration bookings</div></div>
                <div className="pm-tl-item"><b style={{ fontSize: ".8rem" }}>T-30 · final push</b><div className="pm-td-sub">fee-waiver nudge on target channel</div></div>
                <div className="pm-tl-item warn"><b style={{ fontSize: ".8rem" }}>T-0 · service disabled</b><div className="pm-td-sub">support macros + redirect live</div></div>
              </div>
            </div>
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" id="retBanner" checked={banner} onChange={(e) => setBanner(e.target.checked)} />
              <label className="form-check-label" htmlFor="retBanner" style={{ fontSize: ".82rem" }}>Show persistent in-app banner from T-90</label>
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-kv"><span className="k">Service</span><span className="v">{svc?.name}</span></div>
              <div className="pm-kv"><span className="k">Users affected</span><span className="v mono">{num(svc?.users ?? 0)}</span></div>
              <div className="pm-kv"><span className="k">Migration path</span><span className="v">{migration}</span></div>
              <div className="pm-kv"><span className="k">Deadline</span><span className="v mono">{deadline}</span></div>
              <div className="pm-kv"><span className="k">Reason</span><span className="v" style={{ maxWidth: 280, whiteSpace: "normal" }}>{reason}</span></div>
            </div>
            <TwoFactorField value={code} onChange={setCode} />
          </>
        )}
      </div>
    </Modal>
  );
}

/* ================================================================
   18. Pipeline drawer
   ================================================================ */
export function PipelineDrawer({
  open, pipeline, onClose, onOpen, onWizard,
}: {
  open: boolean;
  pipeline: PipelineItem[];
  onClose: () => void;
  onOpen: (p: PipelineItem) => void;
  onWizard: () => void;
}) {
  return (
    <Drawer open={open} onClose={onClose} wide icon="bi-rocket-takeoff" tone="green" title="New service pipeline"
      subtitle={`${pipeline.length} proposals · ${pipeline.filter((p) => p.stage === "Beta").length} in beta · ${pipeline.filter((p) => p.stage === "Development").length} in development`}
      footer={<button className="btn btn-primary btn-sm w-100" onClick={onWizard}><i className="bi bi-plus-lg me-1" />Propose new service</button>}>
      {pipeline.map((p) => (
        <button key={p.id} className="pm-card pm-card-pad w-100 text-start mb-3" onClick={() => onOpen(p)}>
          <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
            <span style={{ fontWeight: 700, fontSize: ".84rem" }}>{p.name}</span>
            <Badge tone={stageTone(p.stage)} dot>{p.stage}</Badge>
            <span className="ms-auto pm-td-sub mono">{p.arr}</span>
          </div>
          <div className="pm-td-sub mb-2">{p.note}</div>
          <div className="d-flex align-items-center gap-2">
            <Meter value={p.progress} tone={p.progress >= 60 ? "#12b76a" : "#f79009"} width={140} />
            <span className="pm-td-sub mono">{p.progress}% · target {p.target} · {p.owner}</span>
          </div>
        </button>
      ))}
    </Drawer>
  );
}

/* ================================================================
   19. Pipeline detail modal
   ================================================================ */
export function PipelineDetailModal({ item, onClose, onApprove }: { item: PipelineItem | null; onClose: () => void; onApprove: (id: string) => void }) {
  const { push } = useToast();
  if (!item) return null;
  const pendingCount = item.approvals.filter((a) => a.state === "Pending").length;
  return (
    <Modal open onClose={onClose} tone={item.stage === "Beta" ? "green" : "blue"} icon="bi-rocket-takeoff" size="md" title={item.name}
      subtitle={`${item.id} · ${item.stage} · target launch ${item.target}`}
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
          <button className="btn btn-primary btn-sm" disabled={pendingCount === 0} onClick={() => { onApprove(item.id); push({ kind: "success", title: "Approval recorded", body: `${item.name}: you approved as Super Admin. ${pendingCount - 1 <= 0 ? "All approvals in — finance notified." : "Waiting on remaining approvers."}` }); onClose(); }}>
            <i className="bi bi-check2-circle me-1" />Approve ({pendingCount} pending)
          </button>
        </>
      }>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Owner</span><span className="v">{item.owner}</span></div>
          <div className="pm-kv"><span className="k">Projected run-rate</span><span className="v mono">{item.arr}</span></div>
          <div className="pm-kv"><span className="k">Dependencies</span><span className="v" style={{ maxWidth: 300, whiteSpace: "normal" }}>{item.dependencies}</span></div>
          <div className="pm-kv"><span className="k">Progress</span><span className="v"><Meter value={item.progress} width={120} /> <span className="mono" style={{ fontSize: ".74rem" }}>{item.progress}%</span></span></div>
        </div>
        <div className="pm-eyebrow mb-2">Approval chain</div>
        <div className="pm-card pm-card-pad">
          {item.approvals.map((a) => (
            <div className="pm-kv" key={a.role}>
              <span className="k">{a.role}<div className="pm-td-sub">{a.who}</div></span>
              <span className="v"><Badge tone={a.state === "Approved" ? "green" : a.state === "Pending" ? "amber" : "grey"} dot>{a.state}</Badge></span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

/* ================================================================
   20. New service proposal wizard (5 steps)
   ================================================================ */
export function NewServiceWizard({
  open, onClose, onDone,
}: {
  open: boolean;
  onClose: () => void;
  onDone: (name: string, owner: string, target: string, feeModel: string, deps: string[]) => void;
}) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Payments");
  const [owner, setOwner] = useState("Product · C. Muthoni");
  const [problem, setProblem] = useState("");
  const [arr, setArr] = useState("25");
  const [users, setUsers] = useState("10,000");
  const [deps, setDeps] = useState<string[]>([]);
  const [compliance, setCompliance] = useState<string[]>([]);
  const [feeModel, setFeeModel] = useState("% per txn");
  const [feeValue, setFeeValue] = useState("1.5");
  useEffect(() => { setStep(0); setName(""); setProblem(""); setDeps([]); setCompliance([]); }, [open]);
  if (!open) return null;
  const depOptions = ["Loan engine v5", "Card processor", "M-Pesa B2C", "KYC/Bureau API", "Ledger (internal)", "Fund administrator", "Sanctions screening", "New partner API"];
  const compOptions = ["CBK licence variation", "CMA approval", "ODPC data impact audit", "AML/KYT screening flow", "Consumer protection review"];
  const validSteps = [name.trim().length >= 4, problem.trim().length >= 12, deps.length > 0 && compliance.length > 0, true, true];
  return (
    <Modal open onClose={onClose} tone="green" icon="bi-rocket-takeoff" size="md" title="Propose a new service"
      subtitle="Concept → case → dependencies → pricing → board pack"
      footer={
        <>
          {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}><i className="bi bi-arrow-left me-1" />Back</button>}
          {step < 4 ? (
            <button className="btn btn-primary btn-sm" disabled={!validSteps[step]} onClick={() => setStep(step + 1)}>Continue<i className="bi bi-arrow-right ms-1" /></button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => {
              onDone(name.trim(), owner, category === "Wealth" ? "Q3 2027" : "Q2 2027", `${feeValue} ${feeModel}`, deps);
              push({ kind: "success", title: "Proposal submitted", body: `${name.trim()} added to the pipeline as “Submitted” · risk & compliance review starts now.` });
              onClose();
            }}><i className="bi bi-send me-1" />Submit proposal</button>
          )}
        </>
      }>
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / 5) * 100}%` }} /></div>
      <Steps current={step} steps={[{ label: "Concept", icon: "bi-lightbulb" }, { label: "Business case", icon: "bi-briefcase" }, { label: "Dependencies", icon: "bi-diagram-3" }, { label: "Pricing", icon: "bi-percent" }, { label: "Review", icon: "bi-clipboard-check" }]} />
      <div className="pm-modal-body">
        {step === 0 && (
          <>
            <label className="form-label">Service name <span style={{ color: "#f04438" }}>*</span></label>
            <input className="form-control mb-3" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. School Fees Installments" />
            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label">Category</label>
                <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {["Payments", "Cards", "Banking", "Utilities", "Remittance", "Savings", "Lending", "Business", "Insurance", "Wealth"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-6">
                <label className="form-label">Owner</label>
                <select className="form-select" value={owner} onChange={(e) => setOwner(e.target.value)}>
                  {["Product · C. Muthoni", "Product · P. Wanjiru", "Lending · C. Muthoni", "Partnerships · L. Cheruiyot", "Wealth · F. Hassan", "Remittance · S. Njoroge"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <label className="form-label">Customer problem (min 12 chars) <span style={{ color: "#f04438" }}>*</span></label>
            <textarea className="form-control mb-3" rows={3} value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="Who hurts, how often, and what do they do today instead?" />
            <div className="row g-2">
              <div className="col-6">
                <label className="form-label">Projected ARR (KES M)</label>
                <input className="form-control mono" value={arr} onChange={(e) => setArr(e.target.value)} />
              </div>
              <div className="col-6">
                <label className="form-label">Year-1 target users</label>
                <input className="form-control mono" value={users} onChange={(e) => setUsers(e.target.value)} />
              </div>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <div className="pm-eyebrow mb-2">Platform dependencies (pick ≥ 1)</div>
            <div className="d-flex flex-wrap gap-2 mb-3">
              {depOptions.map((d) => (
                <button key={d} className={`pm-chip ${deps.includes(d) ? "active" : ""}`} onClick={() => setDeps((s) => (s.includes(d) ? s.filter((x) => x !== d) : [...s, d]))}>{d}</button>
              ))}
            </div>
            <div className="pm-eyebrow mb-2">Compliance gates (pick ≥ 1)</div>
            <div className="d-flex flex-wrap gap-2">
              {compOptions.map((c) => (
                <button key={c} className={`pm-chip ${compliance.includes(c) ? "active" : ""}`} onClick={() => setCompliance((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]))}>{c}</button>
              ))}
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <label className="form-label">Fee model</label>
            <select className="form-select mb-3" value={feeModel} onChange={(e) => setFeeModel(e.target.value)}>
              {["% per txn", "% flat monthly", "KES flat per txn", "subscription KES/month", "commission %", "spread %"].map((f) => <option key={f}>{f}</option>)}
            </select>
            <label className="form-label">Value</label>
            <input className="form-control mono mb-3" value={feeValue} onChange={(e) => setFeeValue(e.target.value)} />
            <div className="pm-note"><i className="bi bi-calculator me-1" />Finance re-prices before GA — this is the proposal estimate used for the ARR model.</div>
          </>
        )}
        {step === 4 && (
          <div className="pm-card pm-card-pad">
            <div className="pm-kv"><span className="k">Service</span><span className="v">{name || "—"}</span></div>
            <div className="pm-kv"><span className="k">Category · owner</span><span className="v">{category} · {owner}</span></div>
            <div className="pm-kv"><span className="k">Problem</span><span className="v" style={{ maxWidth: 280, whiteSpace: "normal" }}>{problem || "—"}</span></div>
            <div className="pm-kv"><span className="k">ARR · users</span><span className="v mono">KES {arr}M · {users}</span></div>
            <div className="pm-kv"><span className="k">Pricing</span><span className="v">{feeValue} {feeModel}</span></div>
            <div className="pm-kv"><span className="k">Dependencies</span><span className="v" style={{ maxWidth: 280, whiteSpace: "normal" }}>{deps.join(" · ") || "—"}</span></div>
            <div className="pm-kv"><span className="k">Compliance</span><span className="v" style={{ maxWidth: 280, whiteSpace: "normal" }}>{compliance.join(" · ") || "—"}</span></div>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ================================================================
   21. Fee structure modal (2FA)
   ================================================================ */
export function FeeStructureModal({ service, onClose, onDone }: { service: Service | null; onClose: () => void; onDone: (id: string, fee: string, reason: string) => void }) {
  const { push } = useToast();
  const [fee, setFee] = useState("");
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  useEffect(() => { setFee(service?.feeStructure ?? ""); setReason(""); setCode(""); }, [service?.id]);
  if (!service) return null;
  return (
    <Modal open onClose={onClose} tone="violet" icon="bi-percent" size="sm" title={`Fee structure — ${service.name}`}
      subtitle={`Current: ${service.feeStructure} · ${num(service.txns30d)} txns/30d`}
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm" disabled={fee === service.feeStructure || !fee.trim() || reason.trim().length < 8 || code !== CODE} onClick={() => {
            onDone(service.id, fee.trim(), reason);
            push({ kind: "success", title: "Fee structure updated", body: `${service.name}: ${service.feeStructure} → ${fee.trim()}. Repricing takes effect at 02:00 EAT.` });
            onClose();
          }}><i className="bi bi-check2 me-1" />Save fee</button>
        </>
      }>
      <div className="pm-modal-body">
        <div className="pm-note mb-3"><i className="bi bi-shield-lock me-1" />Fee changes require Super Admin + 2FA and a documented reason. A 14-day user notice is scheduled automatically per consumer-protection policy.</div>
        <label className="form-label">New fee structure <span style={{ color: "#f04438" }}>*</span></label>
        <input className="form-control mb-3 mono" value={fee} onChange={(e) => setFee(e.target.value)} placeholder="e.g. 1.8% per txn / KES 40 flat" />
        <label className="form-label">Reason (min 8 chars) <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control mb-3" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. scheme interchange increase passed through" />
        <TwoFactorField value={code} onChange={setCode} />
      </div>
    </Modal>
  );
}

/* ================================================================
   22. Export modal
   ================================================================ */
export function PortfolioExportModal({ open, services, onClose }: { open: boolean; services: Service[]; onClose: () => void }) {
  const { push } = useToast();
  const [picked, setPicked] = useState<string[]>(["catalog"]);
  useEffect(() => setPicked(["catalog"]), [open]);
  if (!open) return null;
  const sets: Record<string, () => void> = {
    catalog: () => csvDownload("service-catalog.csv", services.map((s) => ({ id: s.id, name: s.name, category: s.category, status: s.status, users: s.users, active_30d: s.active30d, txns_30d: s.txns30d, revenue_30d_kes_m: s.revenue30d, cost_30d_kes_m: s.cost30d, margin_pct: s.margin, fee: s.feeStructure, tier: s.tier, owner: s.owner }))),
    pnl: () => csvDownload("service-pnl-6m.csv", services.flatMap((s) => MONTHS.map((m, i) => ({ service: s.name, month: m, revenue_kes_m: s.rev6m[i], cost_kes_m: s.cost6m[i] })))),
    health: () => csvDownload("service-health.csv", services.map((s) => ({ service: s.name, gateway: s.health.gateway, uptime_30d: s.health.uptime, latency_p95: s.health.latency, error_rate: s.health.errorRate, sla_target: s.health.slaTarget, sla_met: slaMet(s.health) }))),
    adoption: () => csvDownload("service-adoption.csv", services.map((s) => ({ service: s.name, users: s.users, active_30d: s.active30d, adoption_pct: s.users ? Math.round((s.active30d / s.users) * 1000) / 10 : 0, target_pct: s.adoptionTarget, growth_mom: s.growthMom }))),
    bundle: () => jsonDownload("service-portfolio.json", { exported: new Date().toISOString(), services }),
  };
  const labels: Record<string, string> = { catalog: "Service catalog (CSV)", pnl: "6-month P&L (CSV)", health: "Gateway health (CSV)", adoption: "Adoption funnels (CSV)", bundle: "Full portfolio bundle (JSON)" };
  return (
    <Modal open onClose={onClose} tone="ink" icon="bi-download" size="sm" title="Export portfolio data"
      subtitle={`${services.length} services · generated locally in your browser`}
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm" disabled={picked.length === 0} onClick={() => {
            picked.forEach((k) => sets[k]?.());
            push({ kind: "success", title: `${picked.length} export${picked.length > 1 ? "s" : ""} downloaded`, body: picked.map((k) => labels[k]).join(" · ") });
            onClose();
          }}><i className="bi bi-download me-1" />Download {picked.length}</button>
        </>
      }>
      <div className="pm-modal-body">
        {Object.keys(labels).map((k) => (
          <button key={k} className={`pm-opt mb-2 ${picked.includes(k) ? "active" : ""}`} onClick={() => setPicked((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]))}>
            <span className="r" />
            <span className="flex-grow-1" style={{ fontWeight: 600, fontSize: ".85rem" }}>{labels[k]}</span>
            <i className="bi bi-file-earmark-arrow-down" style={{ color: "var(--pm-muted)" }} />
          </button>
        ))}
      </div>
    </Modal>
  );
}

/* ================================================================
   23. Permissions modal
   ================================================================ */
export function PortfolioPermissionsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const cell = (v: string) => {
    const tone = v.startsWith("Full") ? "green" : v === "Draft" || v === "Escalate" ? "amber" : v === "Approve" ? "blue" : v === "Read" ? "violet" : "grey";
    return <Badge tone={tone}>{v}</Badge>;
  };
  return (
    <Modal open={open} onClose={onClose} tone="blue" icon="bi-person-lock" size="lg" title="Portfolio permissions matrix"
      subtitle="Who can do what across the service portfolio · enforced by the roles engine (page 30)"
      footer={<button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>}>
      <div className="pm-modal-body">
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Action</th><th>Super Admin</th><th>Product Ops</th><th>Finance</th><th>Support</th><th>Read-only</th></tr></thead>
            <tbody>
              {PORTFOLIO_PERMISSIONS.map((p) => (
                <tr key={p.action}>
                  <td className="pm-td-strong">{p.action}</td>
                  <td>{cell(p.superAdmin)}</td>
                  <td>{cell(p.productOps)}</td>
                  <td>{cell(p.finance)}</td>
                  <td>{cell(p.support)}</td>
                  <td>{cell(p.readOnly)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pm-note mt-3 mb-0"><i className="bi bi-shield-lock me-1" />“Full + 2FA” actions require an authenticator code at execution. Escalations route to the on-call Super Admin with a 15-minute SLA.</div>
      </div>
    </Modal>
  );
}

/* ================================================================
   24. Audit drawer
   ================================================================ */
export function PortfolioAuditDrawer({ open, audit, onClose }: { open: boolean; audit: PortfolioAudit[]; onClose: () => void }) {
  return (
    <Drawer open={open} onClose={onClose} wide icon="bi-journal-check" tone="ink" title="Portfolio audit trail"
      subtitle={`${audit.length} entries · configuration, status & fee changes`}
      footer={<div className="pm-note w-100 mb-0"><i className="bi bi-info-circle me-1" />Immutable log — retained 7 years per CBK record-keeping guidance. Exportable to the board pack.</div>}>
      <div className="pm-table-wrap">
        <table className="pm-table">
          <thead><tr><th>When</th><th>Admin</th><th>Change</th><th>From → To</th><th>Reason</th></tr></thead>
          <tbody>
            {audit.map((a) => (
              <tr key={a.id}>
                <td className="pm-td-sub mono text-nowrap">{a.date}<div className="pm-td-sub">{a.id}</div></td>
                <td className="pm-td-strong" style={{ whiteSpace: "nowrap" }}>{a.admin}</td>
                <td><Badge tone={a.area === "Service status" ? "red" : "blue"}>{a.area}</Badge><div className="pm-td-sub">{a.change}</div></td>
                <td className="mono pm-td-sub text-nowrap">{a.from} → <b style={{ color: "var(--pm-ink)" }}>{a.to}</b></td>
                <td className="pm-td-sub" style={{ maxWidth: 260 }}>{a.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Drawer>
  );
}
