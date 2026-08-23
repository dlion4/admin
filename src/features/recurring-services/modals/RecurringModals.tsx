import { useEffect, useState } from "react";
import { Badge, Drawer, EmptyState, Modal, Steps, TwoFactorField, useToast } from "../../../components/ui";
import { csvDownload } from "../../../lib/format";
import type { Campaign, ChangeRequest, ChurnRow, ConfigSetting, FailedPayment, LifecycleStage, Mandate, Offer, Plan, RecurringAudit, Service } from "../data/recurringData";
import { RECUR_PERMISSIONS, ANALYTICS } from "../data/recurringData";

const CODE = "482913";

export const statusTone = (s: string) =>
  s === "Active" || s === "Recovered" || s === "Approved" || s === "Deployed" || s === "Trial" ? "green"
    : s === "Retry pending" || s === "Pending" || s === "Grace" ? "amber"
      : s === "Paused" || s === "Draft" ? s === "Draft" ? "blue" : "violet"
        : s === "Cancelled" || s === "Rejected" || s === "Retired" || s === "Expired" ? "grey" : "grey";

export const svcName = (id: string) => id.replace("svc-", "").replace(/(^|-)(\w)/g, (_, a, b) => (a ? " " : "") + b.toUpperCase());
export const svcMeta = (id: string, services: Service[]) => services.find((s) => s.id === id);
export const planMeta = (id: string, plans: Plan[]) => plans.find((p) => p.id === id);
const fmtK = (n: number) => (n >= 1e6 ? `KES ${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `KES ${(n / 1e3).toFixed(0)}K` : `KES ${n}`);
const reasonOk = (r: string) => r.trim().length >= 8;

/* ================================================================
   1. Service console drawer — the heart of §22.1
   ================================================================ */
export function ServiceDrawer({ service, mandates, plans, failed, audit, onClose, onEdit, onPause, onFreeze, onNewPlan, onOpenMandate, onOpenPlan, onRetryFailed }: {
  service: Service | null; mandates: Mandate[]; plans: Plan[]; failed: FailedPayment[]; audit: RecurringAudit[];
  onClose: () => void; onEdit: (s: Service) => void; onPause: (s: Service) => void; onFreeze: (s: Service) => void;
  onNewPlan: (s: Service) => void; onOpenMandate: (m: Mandate) => void; onOpenPlan: (p: Plan) => void; onRetryFailed: (f: FailedPayment) => void;
}) {
  const [inner, setInner] = useState<"overview" | "mandates" | "plans" | "failed" | "audit">("overview");
  useEffect(() => { setInner("overview"); }, [service?.id]);
  if (!service) return null;
  const rows = mandates.filter((m) => m.serviceId === service.id);
  const svcPlans = plans.filter((p) => p.serviceId === service.id);
  const svcFailed = failed.filter((f) => f.serviceId === service.id);
  const svcAudit = audit.filter((a) => a.area !== "Config" || true).slice(0, 8);
  return (
    <Drawer open wide onClose={onClose} icon={service.icon} tone={service.status === "Active" ? "green" : "violet"} title={service.name}
      subtitle={`${service.id} · ${service.kind} · ${service.subscribers.toLocaleString("en-KE")} subscribers · ${fmtK(service.mrr)}${service.mrrNote ? ` (${service.mrrNote})` : ""}/mo`}
      headExtra={<Badge tone={statusTone(service.status)} dot>{service.status}</Badge>}
      footer={
        <div className="d-flex gap-2 w-100 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => onEdit(service)}><i className="bi bi-pencil-square me-1" />Edit service</button>
          <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => onFreeze(service)}><i className={`bi ${service.signupsFrozen ? "bi-play-fill" : "bi-person-x"} me-1`} />{service.signupsFrozen ? "Unfreeze signups" : "Freeze signups"}</button>
          <button className={`btn btn-sm flex-grow-1 ${service.status === "Active" ? "btn-outline-warning" : "btn-outline-primary"}`} onClick={() => onPause(service)}>
            <i className={`bi ${service.status === "Active" ? "bi-pause-fill" : "bi-play-fill"} me-1`} />{service.status === "Active" ? "Pause service" : "Resume service"}
          </button>
          <button className="btn btn-primary btn-sm flex-grow-1" onClick={() => onNewPlan(service)}><i className="bi bi-plus-lg me-1" />New plan</button>
        </div>
      }>
      <div className="pm-tabs mb-3">
        {([["overview", "Overview", "bi-info-circle"], ["mandates", `Mandates (${rows.length})`, "bi-arrow-repeat"], ["plans", `Plans (${svcPlans.length})`, "bi-collection"], ["failed", `Failed (${svcFailed.length})`, "bi-exclamation-triangle"], ["audit", "Audit", "bi-journal-check"]] as const).map(([id, label, icon]) => (
          <button key={id} className={`pm-tab ${inner === id ? "active" : ""}`} onClick={() => setInner(id)}><i className={`bi ${icon}`} />{label}</button>
        ))}
      </div>

      {inner === "overview" && (
        <>
          <div className="row g-2 mb-3">
            {[
              { l: "Subscribers", v: service.subscribers.toLocaleString("en-KE"), n: service.kind },
              { l: "Monthly value", v: fmtK(service.mrr), n: service.mrrNote ?? "subscription revenue" },
              { l: "Churn", v: service.churn, n: "30-day rolling" },
              { l: "Avg tenure", v: service.tenure, n: "months" },
            ].map((k) => (
              <div className="col-6" key={k.l}><div className="pm-card" style={{ padding: ".6rem .8rem" }}>
                <div className="pm-td-sub">{k.l}</div><div className="pm-td-strong" style={{ fontSize: "1rem" }}>{k.v}</div><div className="pm-td-sub">{k.n}</div>
              </div></div>
            ))}
          </div>
          <div className="pm-note mb-3"><i className="bi bi-info-circle me-1" />{service.note}</div>
          {service.signupsFrozen && (
            <div className="pm-alert-row warn mb-3"><i className="bi bi-person-x-fill" style={{ color: "#f79009" }} />
              <div><b style={{ fontSize: ".8rem" }}>Signups frozen</b><div className="pm-td-sub">New mandates are rejected at the gate. Existing mandates keep charging.</div></div>
            </div>
          )}
          {service.status === "Paused" && (
            <div className="pm-alert-row warn mb-3"><i className="bi bi-pause-circle-fill" style={{ color: "#b54708" }} />
              <div><b style={{ fontSize: ".8rem" }}>Service paused</b><div className="pm-td-sub">No charges fire. {rows.length} mandates held · resume from the footer.</div></div>
            </div>
          )}
          <div className="pm-card" style={{ padding: ".7rem .9rem" }}>
            <div className="pm-td-sub mb-1">Retry exposure</div>
            <div className="pm-td-strong">{svcFailed.filter((f) => f.status === "Retry pending").length} in retry · KES {Math.round(svcFailed.reduce((a, f) => a + (f.status === "Cancelled" || f.status === "Recovered" ? 0 : f.amount), 0) / 1000)}K at stake</div>
            <div className="pm-td-sub">Retry policy comes from Recurring Configuration (RCF-01…05) — service-level overrides land there too.</div>
          </div>
        </>
      )}

      {inner === "mandates" && (rows.length ? (
        <div className="pm-card"><div className="pm-table-wrap"><table className="pm-table">
          <thead><tr><th>Mandate</th><th>Amount</th><th>Next</th><th>Status</th><th /></tr></thead>
          <tbody>{rows.map((m) => (
            <tr key={m.id} style={{ cursor: "pointer" }} onClick={() => onOpenMandate(m)}>
              <td><span className="pm-td-strong">{m.user}</span><div className="pm-td-sub mono">{m.id}</div></td>
              <td className="pm-num mono">{fmtK(m.amount)}</td>
              <td className="pm-td-sub">{m.next}</td>
              <td><Badge tone={statusTone(m.status)} dot>{m.status}</Badge></td>
              <td className="text-end"><i className="bi bi-chevron-right pm-td-sub" /></td>
            </tr>
          ))}</tbody>
        </table></div>
        <div className="pm-table-foot"><span>{rows.length} mandates for this service</span><span className="pm-td-sub">Open a row for the full mandate console</span></div></div>
      ) : <EmptyState icon="bi-arrow-repeat" title="No mandates" body="No live mandates reference this service yet." />)}

      {inner === "plans" && (svcPlans.length ? (
        <div className="pm-card"><div className="pm-table-wrap"><table className="pm-table">
          <thead><tr><th>Plan</th><th>Price</th><th>Subs</th><th>MRR</th><th>Status</th><th /></tr></thead>
          <tbody>{svcPlans.map((p) => (
            <tr key={p.id} style={{ cursor: "pointer" }} onClick={() => onOpenPlan(p)}>
              <td><span className="pm-td-strong">{p.name}</span><div className="pm-td-sub mono">{p.id}</div></td>
              <td className="pm-num mono">{fmtK(p.price)}</td>
              <td className="pm-num">{p.subscribers.toLocaleString("en-KE")}</td>
              <td className="pm-num mono">{fmtK(p.mrr)}</td>
              <td><Badge tone={statusTone(p.status)} dot>{p.status}</Badge></td>
              <td className="text-end"><i className="bi bi-chevron-right pm-td-sub" /></td>
            </tr>
          ))}</tbody>
        </table></div></div>
      ) : <EmptyState icon="bi-collection" title="No plans" body="Create the first plan from the footer." action={<button className="btn btn-primary btn-sm" onClick={() => onNewPlan(service)}><i className="bi bi-plus-lg me-1" />New plan</button>} />)}

      {inner === "failed" && (svcFailed.length ? (
        <div className="pm-card"><div className="pm-table-wrap"><table className="pm-table">
          <thead><tr><th>ID</th><th>User</th><th>Amount</th><th>Retries</th><th>Status</th><th /></tr></thead>
          <tbody>{svcFailed.map((f) => (
            <tr key={f.id}>
              <td className="mono">{f.id}</td>
              <td><span className="pm-td-strong">{f.user}</span><div className="pm-td-sub">{f.reason}</div></td>
              <td className="pm-num mono">{fmtK(f.amount)}</td>
              <td className="pm-num">{f.retries}/{f.maxRetries}</td>
              <td><Badge tone={statusTone(f.status)} dot>{f.status}</Badge></td>
              <td className="text-end">{f.status === "Retry pending" && <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".64rem" }} onClick={() => onRetryFailed(f)}><i className="bi bi-play-fill me-1" />Retry now</button>}</td>
            </tr>
          ))}</tbody>
        </table></div></div>
      ) : <EmptyState icon="bi-check2-circle" title="Queue clean" body="No failed payments for this service right now." />)}

      {inner === "audit" && (
        <div className="pm-card" style={{ padding: ".5rem .8rem" }}>
          {svcAudit.map((a) => (
            <div key={a.id} className="pm-tl-row" style={{ display: "flex", gap: ".6rem", padding: ".45rem 0", borderBottom: "1px solid #eef2f6" }}>
              <i className="bi bi-circle-fill pm-td-sub" style={{ fontSize: ".45rem", marginTop: ".35rem" }} />
              <div><span className="pm-td-strong" style={{ fontSize: ".78rem" }}>{a.change}</span>
                <div className="pm-td-sub">{a.date} · {a.admin} · {a.from} → {a.to}</div></div>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  );
}

/* ================================================================
   2. Plans console drawer
   ================================================================ */
export function PlansDrawer({ plans, services, open, onClose, onNew, onEdit, onPrice, onStatus, onClone, onRetire }: {
  plans: Plan[]; services: Service[]; open: boolean; onClose: () => void; onNew: () => void;
  onEdit: (p: Plan) => void; onPrice: (p: Plan) => void; onStatus: (p: Plan) => void; onClone: (p: Plan) => void; onRetire: (p: Plan) => void;
}) {
  const [svc, setSvc] = useState("All");
  const rows = svc === "All" ? plans : plans.filter((p) => p.serviceId === svc);
  if (!open) return null;
  return (
    <Drawer open wide onClose={onClose} icon="bi-collection" tone="blue" title="Plans console"
      subtitle={`${plans.length} plans across ${services.length} services · pricing changes are CR-gated`}
      footer={<div className="d-flex gap-2 w-100"><button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => csvDownload("recurring-plans.csv", plans.map((p) => ({ id: p.id, name: p.name, price: p.price, billing: p.billing, subscribers: p.subscribers, mrr: p.mrr, status: p.status })))}><i className="bi bi-download me-1" />Export plans</button><button className="btn btn-primary btn-sm flex-grow-1" onClick={onNew}><i className="bi bi-plus-lg me-1" />New plan</button></div>}>
      <div className="d-flex gap-1 flex-wrap mb-3">
        {["All", ...services.filter((s) => plans.some((p) => p.serviceId === s.id)).map((s) => s.id)].map((g) => {
          const label = g === "All" ? `All services (${plans.length})` : `${svcName(g)} (${plans.filter((p) => p.serviceId === g).length})`;
          return (
            <button key={g} className={`pm-chip ${svc === g ? "active" : ""}`} onClick={() => setSvc(g)}>{label}</button>
          );
        })}
      </div>
      <div className="pm-card"><div className="pm-table-wrap"><table className="pm-table">
        <thead><tr><th>Plan</th><th>Service</th><th>Price</th><th>Billing</th><th className="text-end">Subs</th><th className="text-end">MRR</th><th>Status</th><th /></tr></thead>
        <tbody>{rows.map((p) => (
          <tr key={p.id}>
            <td><span className="pm-td-strong">{p.name}</span><div className="pm-td-sub">{p.features.slice(0, 2).join(" · ")}{p.features.length > 2 ? "…" : ""}</div></td>
            <td className="pm-td-sub">{svcName(p.serviceId)}</td>
            <td className="pm-num mono">{fmtK(p.price)}</td>
            <td><Badge tone="grey">{p.billing}</Badge>{p.trialDays > 0 && <Badge tone="blue" className="ms-1">{p.trialDays}d trial</Badge>}</td>
            <td className="text-end pm-num">{p.subscribers.toLocaleString("en-KE")}</td>
            <td className="text-end pm-num mono">{fmtK(p.mrr)}</td>
            <td><Badge tone={statusTone(p.status)} dot>{p.status}</Badge></td>
            <td className="text-end">
              <div className="d-flex gap-1 justify-content-end">
                <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".64rem" }} onClick={() => onEdit(p)}><i className="bi bi-pencil" /></button>
                <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".64rem" }} onClick={() => onPrice(p)} title-text="Change price"><i className="bi bi-cash-coin" /></button>
                <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".64rem" }} onClick={() => onStatus(p)}><i className={`bi ${p.status === "Active" ? "bi-pause-fill" : "bi-play-fill"}`} /></button>
                <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".64rem" }} onClick={() => onClone(p)}><i className="bi bi-copy" /></button>
                <button className="btn btn-sm btn-outline-danger" style={{ fontSize: ".64rem" }} onClick={() => onRetire(p)}><i className="bi bi-archive" /></button>
              </div>
            </td>
          </tr>
        ))}</tbody>
      </table></div>
      <div className="pm-table-foot"><span>{rows.length} plans · KES {Math.round(rows.reduce((a, p) => a + p.mrr, 0) / 1e6).toLocaleString("en-KE")}M combined MRR</span><span className="pm-td-sub">Retire asks where subscribers migrate</span></div></div>
    </Drawer>
  );
}

/* ================================================================
   3. Mandates console drawer (bulk ops)
   ================================================================ */
export function MandatesDrawer({ mandates, open, onClose, onOpen, onNew, onBulk, onExport }: {
  mandates: Mandate[]; open: boolean; onClose: () => void; onOpen: (m: Mandate) => void;
  onNew: () => void; onBulk: (picked: string[], action: "pause" | "resume" | "retry") => void; onExport: () => void;
}) {
  const [chip, setChip] = useState("All");
  const [picked, setPicked] = useState<string[]>([]);
  useEffect(() => { setPicked([]); }, [chip]);
  if (!open) return null;
  const rows = chip === "All" ? mandates : mandates.filter((m) => m.status === chip);
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  return (
    <Drawer open wide onClose={onClose} icon="bi-arrow-repeat" tone="green" title="Mandates console"
      subtitle={`${mandates.length} mandates · ${mandates.filter((m) => m.status === "Retry pending").length} in retry · absolute Super Admin control`}
      headExtra={picked.length > 0 ? <Badge tone="amber" dot>{picked.length} selected</Badge> : undefined}
      footer={<div className="d-flex gap-2 w-100 flex-wrap">
        <button className="btn btn-outline-secondary btn-sm flex-grow-1" disabled={picked.length === 0} onClick={onExport}><i className="bi bi-download me-1" />Export {picked.length || "all"}</button>
        <button className="btn btn-outline-warning btn-sm flex-grow-1" disabled={picked.length === 0} onClick={() => { onBulk(picked, "pause"); setPicked([]); }}><i className="bi bi-pause-fill me-1" />Bulk pause ({picked.length})</button>
        <button className="btn btn-outline-secondary btn-sm flex-grow-1" disabled={picked.length === 0} onClick={() => { onBulk(picked, "resume"); setPicked([]); }}><i className="bi bi-play-fill me-1" />Bulk resume</button>
        <button className="btn btn-primary btn-sm flex-grow-1" onClick={onNew}><i className="bi bi-plus-lg me-1" />New mandate</button>
      </div>}>
      <div className="d-flex gap-1 flex-wrap mb-3">
        {["All", "Active", "Trial", "Retry pending", "Grace", "Paused", "Cancelled"].map((c) => (
          <button key={c} className={`pm-chip ${chip === c ? "active" : ""}`} onClick={() => setChip(c)}>{c === "All" ? `All (${mandates.length})` : `${c} (${mandates.filter((m) => m.status === c).length})`}</button>
        ))}
      </div>
      <div className="pm-card"><div className="pm-table-wrap"><table className="pm-table">
        <thead><tr><th style={{ width: 28 }} /><th>Mandate</th><th>Service / plan</th><th>Amount</th><th>Next</th><th>Status</th><th /></tr></thead>
        <tbody>{rows.map((m) => (
          <tr key={m.id} style={{ cursor: "pointer" }} onClick={() => onOpen(m)} className={picked.includes(m.id) ? "pm-row-picked" : ""}>
            <td onClick={(e) => { e.stopPropagation(); toggle(m.id); }}><input type="checkbox" checked={picked.includes(m.id)} onChange={() => toggle(m.id)} /></td>
            <td><span className="pm-td-strong">{m.user}</span><div className="pm-td-sub mono">{m.id} · {m.phone}</div></td>
            <td className="pm-td-sub">{svcName(m.serviceId)}<div className="pm-td-sub">{planMeta(m.planId, [])?.name ?? m.frequency}</div></td>
            <td className="pm-num mono">{fmtK(m.amount)}<div className="pm-td-sub">{m.frequency}</div></td>
            <td className="pm-td-sub">{m.next}</td>
            <td><Badge tone={statusTone(m.status)} dot>{m.status}</Badge>{m.retries > 0 && m.status === "Retry pending" && <div className="pm-td-sub">{m.retries}/3 retries</div>}</td>
            <td className="text-end"><i className="bi bi-chevron-right pm-td-sub" /></td>
          </tr>
        ))}</tbody>
      </table></div>
      <div className="pm-table-foot"><span>{rows.length} mandates shown</span><span className="pm-td-sub">Row click opens the mandate console</span></div></div>
    </Drawer>
  );
}

/* ================================================================
   4. Mandate console drawer (single mandate — timeline, payments, comms, settings)
   ================================================================ */
export function MandateDrawer({ mandate, plans, onClose, onPause, onCancel, onSkip, onAmount, onBillingDay, onRetry, onGrace }: {
  mandate: Mandate | null; plans: Plan[];
  onClose: () => void; onPause: (m: Mandate) => void; onCancel: (m: Mandate) => void; onSkip: (m: Mandate) => void;
  onAmount: (m: Mandate) => void; onBillingDay: (m: Mandate) => void; onRetry: (m: Mandate) => void; onGrace: (m: Mandate) => void;
}) {
  const [inner, setInner] = useState<"timeline" | "payments" | "comms" | "settings">("timeline");
  useEffect(() => { setInner("timeline"); }, [mandate?.id]);
  if (!mandate) return null;
  const plan = plans.find((p) => p.id === mandate.planId);
  const canPause = mandate.status !== "Cancelled";
  return (
    <Drawer open wide onClose={onClose} icon="bi-arrow-repeat" tone={mandate.status === "Active" ? "green" : mandate.status === "Cancelled" ? "ink" : "amber"} title={`${mandate.user} — mandate console`}
      subtitle={`${mandate.id} · ${svcName(mandate.serviceId)} · ${plan?.name ?? "custom plan"} · started ${mandate.started}`}
      headExtra={<Badge tone={statusTone(mandate.status)} dot>{mandate.status}</Badge>}
      footer={<div className="d-flex gap-2 w-100 flex-wrap">
        {mandate.status === "Retry pending" && <button className="btn btn-outline-primary btn-sm flex-grow-1" onClick={() => onRetry(mandate)}><i className="bi bi-play-fill me-1" />Retry now</button>}
        {mandate.status === "Grace" && <button className="btn btn-outline-primary btn-sm flex-grow-1" onClick={() => onGrace(mandate)}><i className="bi bi-hourglass-split me-1" />Extend grace</button>}
        <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => onSkip(mandate)}><i className="bi bi-skip-forward me-1" />Skip cycle</button>
        <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => onAmount(mandate)}><i className="bi bi-cash-coin me-1" />Amount</button>
        <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => onBillingDay(mandate)}><i className="bi bi-calendar3 me-1" />Billing day</button>
        {canPause && <button className="btn btn-outline-warning btn-sm flex-grow-1" onClick={() => onPause(mandate)}><i className={`bi ${mandate.status === "Paused" ? "bi-play-fill" : "bi-pause-fill"} me-1`} />{mandate.status === "Paused" ? "Resume" : "Pause"}</button>}
        {mandate.status !== "Cancelled" && <button className="btn btn-outline-danger btn-sm flex-grow-1" style={{ borderColor: "#fda29b", color: "#b42318" }} onClick={() => onCancel(mandate)}><i className="bi bi-x-circle me-1" />Cancel</button>}
      </div>}>
      <div className="pm-tabs mb-3">
        {([["timeline", "Timeline", "bi-activity"], ["payments", "Payments", "bi-receipt"], ["comms", "Comms", "bi-chat-dots"], ["settings", "Settings", "bi-sliders"]] as const).map(([id, label, icon]) => (
          <button key={id} className={`pm-tab ${inner === id ? "active" : ""}`} onClick={() => setInner(id)}><i className={`bi ${icon}`} />{label}</button>
        ))}
      </div>

      <div className="row g-2 mb-3">
        {[
          { l: "Amount / cycle", v: `${fmtK(mandate.amount)}`, n: `${mandate.frequency} · ${mandate.channel}` },
          { l: "Billing day", v: mandate.billingDay, n: `Next: ${mandate.next}` },
          { l: "Lifetime value", v: fmtK(mandate.ltv), n: `${mandate.tenureMo} months active` },
          { l: "Retries", v: `${mandate.retries}/3`, n: mandate.failingSince ? `failing since ${mandate.failingSince}` : "healthy" },
        ].map((k) => (
          <div className="col-6 col-md-3" key={k.l}><div className="pm-card" style={{ padding: ".6rem .8rem" }}>
            <div className="pm-td-sub">{k.l}</div><div className="pm-td-strong" style={{ fontSize: ".95rem" }}>{k.v}</div><div className="pm-td-sub">{k.n}</div>
          </div></div>
        ))}
      </div>

      {inner === "timeline" && (
        <div className="pm-card" style={{ padding: ".6rem .9rem" }}>
          <div className="pm-td-sub mb-2">Mandate timeline — newest first</div>
          {mandate.history.map((h, i) => (
            <div key={i} style={{ display: "flex", gap: ".7rem", padding: ".5rem 0", borderBottom: "1px solid #eef2f6" }}>
              <i className={`bi ${h.state === "Paid" || h.state === "Active" ? "bi-check-circle-fill" : h.state === "Failed" || h.state === "Cancelled" ? "bi-x-circle-fill" : "bi-dot"} ${h.state === "Paid" ? "" : "pm-td-sub"}`} style={{ color: h.state === "Paid" ? "#12b76a" : h.state === "Failed" || h.state === "Cancelled" ? "#f04438" : undefined }} />
              <div><span className="pm-td-strong" style={{ fontSize: ".78rem" }}>{h.what}</span><div className="pm-td-sub">{h.when} · {h.state}</div></div>
            </div>
          ))}
          {mandate.autoResume && <div className="pm-note mt-2 mb-0"><i className="bi bi-arrow-clockwise me-1" />Auto-resume scheduled: <b>{mandate.autoResume}</b></div>}
        </div>
      )}

      {inner === "payments" && (
        <div className="pm-card"><div className="pm-table-wrap"><table className="pm-table">
          <thead><tr><th>When</th><th>What</th><th>State</th></tr></thead>
          <tbody>{mandate.history.map((h, i) => (
            <tr key={i}><td className="pm-td-sub mono">{h.when}</td><td>{h.what}</td><td><Badge tone={h.state === "Paid" ? "green" : h.state === "Failed" ? "red" : "grey"} dot>{h.state}</Badge></td></tr>
          ))}</tbody>
        </table></div>
        <div className="pm-table-foot"><span>History retained 7 years (CBK)</span><span className="pm-td-sub">Syncs with ledger page 9</span></div></div>
      )}

      {inner === "comms" && (
        <>
          <div className="pm-note mb-3"><i className="bi bi-chat-dots me-1" />Dunning traffic for this mandate — templates come from the Dunning tab (DUN-01…06).</div>
          <div className="pm-card" style={{ padding: ".6rem .9rem" }}>
            {mandate.history.filter((h) => h.state === "Notified").map((h, i) => (
              <div key={i} style={{ display: "flex", gap: ".6rem", padding: ".45rem 0", borderBottom: "1px solid #eef2f6" }}>
                <i className="bi bi-bell" style={{ color: "#175cd3" }} />
                <div><span className="pm-td-strong" style={{ fontSize: ".78rem" }}>{h.what}</span><div className="pm-td-sub">{h.when} · delivered</div></div>
              </div>
            ))}
            {mandate.history.filter((h) => h.state === "Notified").length === 0 && <EmptyState icon="bi-bell-slash" title="No dunning yet" body="This mandate has never missed a charge." />}
          </div>
        </>
      )}

      {inner === "settings" && (
        <>
          <div className="pm-card mb-3" style={{ padding: ".7rem .9rem" }}>
            <div className="pm-td-sub mb-1">Mandate settings</div>
            <div className="d-flex justify-content-between py-1" style={{ borderBottom: "1px solid #eef2f6" }}><span className="pm-td-sub">Amount</span><span className="mono">{fmtK(mandate.amount)}</span></div>
            <div className="d-flex justify-content-between py-1" style={{ borderBottom: "1px solid #eef2f6" }}><span className="pm-td-sub">Frequency</span><span>{mandate.frequency}</span></div>
            <div className="d-flex justify-content-between py-1" style={{ borderBottom: "1px solid #eef2f6" }}><span className="pm-td-sub">Billing day</span><span>{mandate.billingDay}</span></div>
            <div className="d-flex justify-content-between py-1"><span className="pm-td-sub">Channel</span><span>{mandate.channel}</span></div>
          </div>
          <div className="pm-note"><i className="bi bi-shield-lock me-1" />Amount, billing day, pause, skip and cancel all require reason + 2FA and are audit-logged. Deletes never remove history — mandates are cancelled, not erased.</div>
        </>
      )}
    </Drawer>
  );
}

/* ================================================================
   5. Failed payments queue drawer (§22.3 + bulk)
   ================================================================ */
export function FailedDrawer({ failed, open, onClose, onRetry, onRecovered, onGrace, onOpenMandate, onBulkRetry }: {
  failed: FailedPayment[]; open: boolean; onClose: () => void;
  onRetry: (f: FailedPayment) => void; onRecovered: (f: FailedPayment) => void; onGrace: (f: FailedPayment) => void;
  onOpenMandate: (m: Mandate) => void; onBulkRetry: (picked: string[]) => void;
}) {
  const [chip, setChip] = useState("Open");
  const [picked, setPicked] = useState<string[]>([]);
  useEffect(() => { setPicked([]); }, [chip]);
  if (!open) return null;
  const rows = chip === "All" ? failed : chip === "Open" ? failed.filter((f) => f.status === "Retry pending" || f.status === "Grace") : failed.filter((f) => f.status === chip);
  const atStake = rows.filter((f) => f.status !== "Cancelled" && f.status !== "Recovered").reduce((a, f) => a + f.amount, 0);
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  return (
    <Drawer open wide onClose={onClose} icon="bi-exclamation-triangle" tone="amber" title="Failed payments queue"
      subtitle={`${failed.filter((f) => f.status === "Retry pending").length} awaiting retry · KES ${Math.round(atStake / 1000)}K at stake in view · recovery 72%`}
      headExtra={picked.length > 0 ? <Badge tone="amber" dot>{picked.length} selected</Badge> : undefined}
      footer={<div className="d-flex gap-2 w-100">
        <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => csvDownload("failed-recurring.csv", failed.map((f) => ({ id: f.id, mandate: f.mandateId, user: f.user, amount: f.amount, reason: f.reason, retries: f.retries, status: f.status, nextRetry: f.nextRetry })))}><i className="bi bi-download me-1" />Export queue</button>
        <button className="btn btn-primary btn-sm flex-grow-1" disabled={picked.length === 0} onClick={() => { onBulkRetry(picked); setPicked([]); }}><i className="bi bi-play-fill me-1" />Retry {picked.length || ""} now</button>
      </div>}>
      <div className="d-flex gap-1 flex-wrap mb-3">
        {["Open", "Retry pending", "Grace", "Paused", "Cancelled", "Recovered", "All"].map((c) => (
          <button key={c} className={`pm-chip ${chip === c ? "active" : ""}`} onClick={() => setChip(c)}>{c}</button>
        ))}
      </div>
      <div className="pm-card"><div className="pm-table-wrap"><table className="pm-table">
        <thead><tr><th style={{ width: 28 }} /><th>User / mandate</th><th>Amount</th><th>Reason</th><th>Retries</th><th>Next retry</th><th>Status</th><th /></tr></thead>
        <tbody>{rows.map((f) => (
          <tr key={f.id} className={picked.includes(f.id) ? "pm-row-picked" : ""}>
            <td><input type="checkbox" checked={picked.includes(f.id)} onChange={() => toggle(f.id)} disabled={f.status !== "Retry pending"} /></td>
            <td><span className="pm-td-strong">{f.user}</span><div className="pm-td-sub mono">{f.id} · {f.mandateId} · {f.channel}</div></td>
            <td className="pm-num mono">{fmtK(f.amount)}</td>
            <td className="pm-td-sub">{f.reason}<div className="pm-td-sub">dunning stage {f.dunningStage}/3</div></td>
            <td className="pm-num">{f.retries}/{f.maxRetries}</td>
            <td className="pm-td-sub">{f.nextRetry}</td>
            <td><Badge tone={statusTone(f.status)} dot>{f.status}</Badge></td>
            <td className="text-end">
              <div className="d-flex gap-1 justify-content-end">
                {f.status === "Retry pending" && <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".64rem" }} onClick={() => onRetry(f)}><i className="bi bi-play-fill" />Retry</button>}
                {f.status !== "Recovered" && f.status !== "Cancelled" && <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".64rem" }} onClick={() => onRecovered(f)}><i className="bi bi-check2" />Recovered</button>}
                {f.status === "Grace" && <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".64rem" }} onClick={() => onGrace(f)}><i className="bi bi-hourglass-split" />Grace+</button>}
                <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".64rem" }} onClick={() => { const m = { id: f.mandateId } as Mandate; onOpenMandate(m); }}><i className="bi bi-box-arrow-in-right" /></button>
              </div>
            </td>
          </tr>
        ))}</tbody>
      </table></div>
      <div className="pm-table-foot"><span>{rows.length} rows · KES {Math.round(atStake / 1000)}K at stake</span><span className="pm-td-sub">Manual retries outside the 06:00–20:00 window need Risk</span></div></div>
    </Drawer>
  );
}

/* ================================================================
   6. Dunning console drawer (§22.6)
   ================================================================ */
export function DunningDrawer({ campaigns, open, onClose, onNew, onEdit, onStatus, onAB }: {
  campaigns: Campaign[]; open: boolean; onClose: () => void; onNew: () => void;
  onEdit: (c: Campaign) => void; onStatus: (c: Campaign) => void; onAB: (c: Campaign) => void;
}) {
  if (!open) return null;
  return (
    <Drawer open wide onClose={onClose} icon="bi-megaphone" tone="violet" title="Dunning campaigns"
      subtitle={`${campaigns.length} campaigns · ${campaigns.filter((c) => c.status === "Active").length} live · KES 2.3M recovered in 30d`}
      footer={<div className="d-flex gap-2 w-100">
        <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => csvDownload("dunning-campaigns.csv", campaigns.map((c) => ({ id: c.id, name: c.name, trigger: c.trigger, channels: c.channels.join("+"), conversion: c.conversion, status: c.status, sent30d: c.sent30d })))}><i className="bi bi-download me-1" />Export stats</button>
        <button className="btn btn-primary btn-sm flex-grow-1" onClick={onNew}><i className="bi bi-plus-lg me-1" />New campaign</button>
      </div>}>
      <div className="pm-note mb-3"><i className="bi bi-diagram-3 me-1" />Journey: failure → DUN-01 → DUN-02 → DUN-03 → cancel → DUN-04 (7d) → DUN-05 (30d). Copy changes go through approvals (RRC-3302 pattern).</div>
      <div className="pm-card"><div className="pm-table-wrap"><table className="pm-table">
        <thead><tr><th>Campaign</th><th>Trigger</th><th>Channels</th><th>Timing</th><th className="text-end">Conv.</th><th className="text-end">Sent 30d</th><th>Status</th><th /></tr></thead>
        <tbody>{campaigns.map((c) => (
          <tr key={c.id}>
            <td><span className="pm-td-strong">{c.name}</span><div className="pm-td-sub mono">{c.id} · “{c.message}”</div>{c.variant && <div className="pm-td-sub" style={{ color: "#5925dc" }}><i className="bi bi-bezier2 me-1" />{c.variant}</div>}</td>
            <td className="pm-td-sub">{c.trigger}<div className="pm-td-sub">{c.audience.toLocaleString("en-KE")} audience</div></td>
            <td><div className="d-flex flex-wrap gap-1">{c.channels.map((ch) => <Badge key={ch} tone="grey">{ch}</Badge>)}</div></td>
            <td className="pm-td-sub">{c.timing}</td>
            <td className="text-end pm-num">{c.conversion}%</td>
            <td className="text-end pm-num">{c.sent30d.toLocaleString("en-KE")}</td>
            <td><Badge tone={statusTone(c.status)} dot>{c.status}</Badge></td>
            <td className="text-end">
              <div className="d-flex gap-1 justify-content-end">
                <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".64rem" }} onClick={() => onEdit(c)}><i className="bi bi-pencil" />Copy</button>
                <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".64rem" }} onClick={() => onAB(c)}><i className="bi bi-bezier2" />A/B</button>
                <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".64rem" }} onClick={() => onStatus(c)}><i className={`bi ${c.status === "Active" ? "bi-pause-fill" : "bi-play-fill"}`} /></button>
              </div>
            </td>
          </tr>
        ))}</tbody>
      </table></div>
      <div className="pm-table-foot"><span>Avg conversion {(campaigns.reduce((a, c) => a + c.conversion, 0) / campaigns.length).toFixed(1)}%</span><span className="pm-td-sub">Templates: push/SMS/email — 160-char SMS budget</span></div></div>
    </Drawer>
  );
}

/* ================================================================
   7. Churn & retention drawer (§22.5 + offers)
   ================================================================ */
export function ChurnDrawer({ churn, offers, open, onClose, onAction, onOffer, onNewOffer }: {
  churn: ChurnRow[]; offers: Offer[]; open: boolean; onClose: () => void;
  onAction: (row: ChurnRow) => void; onOffer: (o: Offer) => void; onNewOffer: () => void;
}) {
  const [inner, setInner] = useState<"reasons" | "offers" | "metrics">("reasons");
  if (!open) return null;
  return (
    <Drawer open wide onClose={onClose} icon="bi-person-dash" tone="red" title="Churn & retention"
      subtitle={`${churn.reduce((a, c) => a + c.count, 0)} cancellations in 30 days · 3.8% overall churn · -0.4pp trend`}
      footer={<div className="d-flex gap-2 w-100">
        <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => csvDownload("churn-30d.csv", churn.map((c) => ({ reason: c.reason, count: c.count, pct: `${c.pct}%`, action: c.action, status: c.actionStatus, owner: c.owner })))}><i className="bi bi-download me-1" />Export churn pack</button>
        <button className="btn btn-primary btn-sm flex-grow-1" onClick={onNewOffer}><i className="bi bi-plus-lg me-1" />New win-back offer</button>
      </div>}>
      <div className="pm-tabs mb-3">
        {([["reasons", "Reasons & actions", "bi-clipboard-data"], ["offers", `Win-back offers (${offers.length})`, "bi-gift"], ["metrics", "Analytics", "bi-graph-up"]] as const).map(([id, label, icon]) => (
          <button key={id} className={`pm-tab ${inner === id ? "active" : ""}`} onClick={() => setInner(id)}><i className={`bi ${icon}`} />{label}</button>
        ))}
      </div>

      {inner === "reasons" && (
        <div className="pm-card"><div className="pm-table-wrap"><table className="pm-table">
          <thead><tr><th>Reason</th><th className="text-end">30d</th><th className="text-end">Share</th><th>Action</th><th>Owner</th><th>Status</th><th /></tr></thead>
          <tbody>{churn.map((c) => (
            <tr key={c.reason}>
              <td><span className="pm-td-strong">{c.reason}</span></td>
              <td className="text-end pm-num">{c.count}</td>
              <td className="text-end pm-num">{c.pct}%</td>
              <td className="pm-td-sub">{c.action}</td>
              <td className="pm-td-sub">{c.owner}</td>
              <td><Badge tone={c.actionStatus === "Shipped" ? "green" : c.actionStatus === "Not started" ? "grey" : "amber"} dot>{c.actionStatus}</Badge></td>
              <td className="text-end">{c.action !== "—" && <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".64rem" }} onClick={() => onAction(c)}><i className="bi bi-clipboard-check" />Assign</button>}</td>
            </tr>
          ))}</tbody>
        </table></div>
        <div className="pm-table-foot"><span>Source: exit survey + cancel flow (87% completion)</span><span className="pm-td-sub">Feeds Product OKR review monthly</span></div></div>
      )}

      {inner === "offers" && (
        <>
          <div className="pm-note mb-3"><i className="bi bi-gift me-1" />Offers target the win-back pool (612 users). Redemption is honored only inside the 30-day reactivation window (RCF-10).</div>
          <div className="pm-card"><div className="pm-table-wrap"><table className="pm-table">
            <thead><tr><th>Offer</th><th>Segment</th><th>Discount</th><th className="text-end">Eligible</th><th className="text-end">Redeemed</th><th>Expires</th><th>Status</th><th /></tr></thead>
            <tbody>{offers.map((o) => (
              <tr key={o.id}>
                <td><span className="pm-td-strong">{o.name}</span><div className="pm-td-sub mono">{o.id}</div></td>
                <td className="pm-td-sub">{o.segment}</td>
                <td className="mono">{o.discount}</td>
                <td className="text-end pm-num">{o.eligible.toLocaleString("en-KE")}</td>
                <td className="text-end pm-num">{o.redeemed}{o.eligible > 0 && <div className="pm-td-sub">{((o.redeemed / o.eligible) * 100).toFixed(1)}%</div>}</td>
                <td className="pm-td-sub">{o.expires}</td>
                <td><Badge tone={statusTone(o.status)} dot>{o.status}</Badge></td>
                <td className="text-end"><button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".64rem" }} onClick={() => onOffer(o)}><i className="bi bi-pencil" />Edit</button></td>
              </tr>
            ))}</tbody>
          </table></div></div>
        </>
      )}

      {inner === "metrics" && (
        <div className="pm-card" style={{ padding: ".6rem .9rem" }}>
          <div className="pm-td-sub mb-2">Recurring analytics — 30-day rolling</div>
          {ANALYTICS.map((a) => (
            <div key={a.metric} style={{ display: "flex", alignItems: "center", gap: ".6rem", padding: ".5rem 0", borderBottom: "1px solid #eef2f6" }}>
              <i className={`bi ${a.trend.includes("-") || a.tone === "green" ? "bi-arrow-up-right-circle-fill" : a.tone === "grey" ? "bi-dash-circle" : "bi-arrow-down-right-circle-fill"}`} style={{ color: a.tone === "green" ? "#12b76a" : a.tone === "grey" ? "#98a2b3" : "#f79009" }} />
              <div className="flex-grow-1"><span className="pm-td-strong" style={{ fontSize: ".78rem" }}>{a.metric}</span><div className="pm-td-sub">{a.note}</div></div>
              <span className="mono" style={{ fontWeight: 600 }}>{a.value}</span>
              <Badge tone={a.tone === "green" ? "green" : "grey"}>{a.trend}</Badge>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  );
}

/* ================================================================
   8. Lifecycle map drawer (§22.7)
   ================================================================ */
export function LifecycleDrawer({ stages, open, onClose, onOpenMandates, onOpenConfig }: {
  stages: LifecycleStage[]; open: boolean; onClose: () => void; onOpenMandates: () => void; onOpenConfig: () => void;
}) {
  if (!open) return null;
  return (
    <Drawer open wide onClose={onClose} icon="bi-signpost-split" tone="blue" title="Subscription lifecycle"
      subtitle="Trial → Active → Failed → Retry×3 → Cancelled → Win-back → Reactivated (§22.7)"
      footer={<div className="d-flex gap-2 w-100">
        <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={onOpenConfig}><i className="bi bi-sliders me-1" />Tune lifecycle rules</button>
        <button className="btn btn-primary btn-sm flex-grow-1" onClick={onOpenMandates}><i className="bi bi-arrow-repeat me-1" />Open mandates console</button>
      </div>}>
      <div className="pm-note mb-3"><i className="bi bi-diagram-2 me-1" />Counts are live snapshots. Paused mandates auto-resume on the promised date; cancelled mandates can be reactivated within 30 days with a dunning offer.</div>
      {stages.map((s, i) => (
        <div key={s.id} className="pm-card mb-2" style={{ padding: ".6rem .8rem" }}>
          <div className="d-flex align-items-center gap-2">
            <span className="pm-avatar" style={{ width: 30, height: 30, fontSize: ".8rem", background: s.tone === "green" ? "#e7f8ef" : s.tone === "amber" ? "#fff5e6" : s.tone === "red" ? "#fee4e2" : s.tone === "violet" ? "#f4f1ff" : "#eff8ff", color: s.tone === "green" ? "#0b8f52" : s.tone === "amber" ? "#b54708" : s.tone === "red" ? "#b42318" : s.tone === "violet" ? "#5925dc" : "#175cd3" }}>{i + 1}</span>
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2"><span className="pm-td-strong">{s.name}</span><span className="pm-num mono">{s.count.toLocaleString("en-KE")}</span></div>
              <div className="pm-td-sub">{s.note}</div>
            </div>
            {i < stages.length - 1 && <i className="bi bi-arrow-down pm-td-sub" />}
          </div>
        </div>
      ))}
    </Drawer>
  );
}

/* ================================================================
   9. Configuration drawer (§22.8)
   ================================================================ */
export function ConfigDrawer({ config, open, onClose, onEdit, onNewCR, onProration }: {
  config: ConfigSetting[]; open: boolean; onClose: () => void; onEdit: (c: ConfigSetting) => void; onNewCR: () => void; onProration: () => void;
}) {
  if (!open) return null;
  const groups = [...new Set(config.map((c) => c.group))];
  return (
    <Drawer open wide onClose={onClose} icon="bi-sliders" tone="green" title="Recurring configuration"
      subtitle={`${config.length} settings · changes file a CR and deploy on approval`}
      footer={<div className="d-flex gap-2 w-100">
        <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={onProration}><i className="bi bi-calculator me-1" />Proration calculator</button>
        <button className="btn btn-primary btn-sm flex-grow-1" onClick={onNewCR}><i className="bi bi-plus-circle me-1" />Request a change</button>
      </div>}>
      <div className="pm-note mb-3"><i className="bi bi-shield-lock me-1" />Locked rows (billing-day invariants, currency) are engineering-only. Everything else is Super-Admin editable with 2FA — and every change lands in the approvals queue first.</div>
      {groups.map((g) => (
        <div key={g} className="pm-card mb-3">
          <div className="pm-card-head" style={{ padding: ".55rem .9rem", borderBottom: "1px solid #eef2f6" }}><span className="pm-td-strong">{g}</span></div>
          <div className="pm-table-wrap"><table className="pm-table">
            <thead><tr><th>Setting</th><th>Value</th><th>Changed</th><th /></tr></thead>
            <tbody>{config.filter((c) => c.group === g).map((c) => (
              <tr key={c.id}>
                <td><span className="pm-td-strong">{c.key}</span><div className="pm-td-sub">{c.note}</div></td>
                <td>
                  <span className="mono">{c.value}</span>
                  {c.pendingTo && <Badge tone="amber" className="ms-1" dot>→ {c.pendingTo}</Badge>}
                  {!c.editable && <Badge tone="grey" className="ms-1">locked</Badge>}
                </td>
                <td className="pm-td-sub">{c.changed}<div className="pm-td-sub">{c.changedBy}</div></td>
                <td className="text-end"><button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".64rem" }} disabled={!c.editable} onClick={() => onEdit(c)}><i className="bi bi-pencil" />Edit</button></td>
              </tr>
            ))}</tbody>
          </table></div>
        </div>
      ))}
    </Drawer>
  );
}

/* ================================================================
   10. Audit drawer
   ================================================================ */
export function AuditDrawer({ audit, open, onClose }: { audit: RecurringAudit[]; open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Drawer open wide onClose={onClose} icon="bi-journal-check" tone="green" title="Recurring audit trail"
      subtitle={`${audit.length} entries · 7-year retention · exportable to the governance pack`}
      footer={<div className="pm-note w-100 mb-0"><i className="bi bi-info-circle me-1" />Entries are immutable — actions can only be superseded, never edited or deleted. Board-visible.</div>}>
      <div className="pm-card" style={{ padding: ".6rem .9rem" }}>
        {audit.map((a) => (
          <div key={a.id} style={{ display: "flex", gap: ".7rem", padding: ".55rem 0", borderBottom: "1px solid #eef2f6" }}>
            <span className="pm-badge grey mono" style={{ height: "fit-content" }}>{a.id}</span>
            <div className="flex-grow-1">
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <span className="pm-td-strong" style={{ fontSize: ".78rem" }}>{a.change}</span>
                <Badge tone="grey">{a.area}</Badge>
              </div>
              <div className="pm-td-sub">{a.date} · {a.admin} · {a.from} → {a.to}</div>
              {a.reason && <div className="pm-td-sub" style={{ color: "#475467" }}><i className="bi bi-quote me-1" />{a.reason}</div>}
            </div>
          </div>
        ))}
      </div>
      <button className="btn btn-outline-secondary btn-sm mt-3" onClick={() => csvDownload("recurring-audit.csv", audit.map((a) => ({ id: a.id, date: a.date, admin: a.admin, area: a.area, change: a.change, from: a.from, to: a.to, reason: a.reason })))}><i className="bi bi-download me-1" />Export audit CSV</button>
    </Drawer>
  );
}

/* ================================================================
   11. Approvals drawer
   ================================================================ */
export function RequestsDrawer({ requests, open, onClose, onDetail, onApprove, onReject, onNew }: {
  requests: ChangeRequest[]; open: boolean; onClose: () => void;
  onDetail: (r: ChangeRequest) => void; onApprove: (r: ChangeRequest) => void; onReject: (r: ChangeRequest) => void; onNew: () => void;
}) {
  if (!open) return null;
  const pending = requests.filter((r) => r.status === "Pending");
  return (
    <Drawer open wide onClose={onClose} icon="bi-hourglass-split" tone="amber" title="Approvals queue"
      subtitle={`${pending.length} pending · Risk / Product / Finance co-sign · Super Admin final gate`}
      footer={<button className="btn btn-primary btn-sm w-100" onClick={onNew}><i className="bi bi-plus-circle me-1" />Request a change</button>}>
      {pending.length === 0 && <EmptyState icon="bi-check2-circle" title="Queue clear" body="No pending recurring-ops changes." />}
      {pending.length > 0 && (
        <div className="pm-card"><div className="pm-table-wrap"><table className="pm-table">
          <thead><tr><th>CR</th><th>Change</th><th>Risk</th><th>Sign-offs</th><th>Status</th><th /></tr></thead>
          <tbody>{pending.map((r) => (
            <tr key={r.id} style={{ cursor: "pointer" }} onClick={() => onDetail(r)}>
              <td className="mono">{r.id}<div className="pm-td-sub">{r.requestedAt}</div></td>
              <td><span className="pm-td-strong">{r.subject}</span><div className="pm-td-sub mono">{r.from} → {r.to}</div></td>
              <td><Badge tone={r.risk === "High" ? "red" : r.risk === "Medium" ? "amber" : "green"} dot>{r.risk}</Badge></td>
              <td className="pm-td-sub">{r.approvals.map((a) => `${a.role}: ${a.state}`).join(" · ")}</td>
              <td><Badge tone={statusTone(r.status)} dot>{r.status}</Badge></td>
              <td className="text-end">
                <div className="d-flex gap-1 justify-content-end">
                  <button className="btn btn-outline-danger btn-sm" style={{ fontSize: ".64rem", borderColor: "#fda29b", color: "#b42318" }} onClick={(e) => { e.stopPropagation(); onReject(r); }}><i className="bi bi-x-circle me-1" />Reject</button>
                  <button className="btn btn-primary btn-sm" style={{ fontSize: ".64rem" }} onClick={(e) => { e.stopPropagation(); onApprove(r); }}><i className="bi bi-check2-circle me-1" />Approve</button>
                </div>
              </td>
            </tr>
          ))}</tbody>
        </table></div></div>
      )}
      <div className="pm-card mt-3"><div className="pm-table-wrap"><table className="pm-table">
        <thead><tr><th>CR</th><th>Change</th><th>Requested</th><th>Status</th></tr></thead>
        <tbody>{requests.filter((r) => r.status !== "Pending").map((r) => (
          <tr key={r.id} style={{ cursor: "pointer" }} onClick={() => onDetail(r)}>
            <td className="mono">{r.id}</td>
            <td><span className="pm-td-strong">{r.subject}</span><div className="pm-td-sub mono">{r.from} → {r.to}</div></td>
            <td className="pm-td-sub">{r.requestedAt}<div className="pm-td-sub">{r.requestedBy}</div></td>
            <td><Badge tone={statusTone(r.status)} dot>{r.status}</Badge></td>
          </tr>
        ))}</tbody>
      </table></div>
      <div className="pm-table-foot"><span>Decided CRs stay visible for 90 days</span></div></div>
    </Drawer>
  );
}

/* ================================================================
   12. Permissions matrix drawer
   ================================================================ */
export function PermissionsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  const tone = (v: string) => (v.startsWith("Full + 2FA") ? "green" : v.startsWith("Full") ? "blue" : v === "View" ? "grey" : "red");
  return (
    <Drawer open wide onClose={onClose} icon="bi-person-lock" tone="violet" title="Recurring permissions matrix"
      subtitle="Who can do what across mandates, plans, dunning and config"
      footer={<div className="pm-note w-100 mb-0"><i className="bi bi-shield-check me-1" />“Full + 2FA” = authenticator code at execution. Deletes and pricing are Super-Admin-only with typed confirmation + 2FA. Every action lands in the audit trail (7-year retention).</div>}>
      <div className="pm-card"><div className="pm-table-wrap"><table className="pm-table">
        <thead><tr><th>Area</th><th>Action</th><th>Support</th><th>Finance</th><th>Risk</th><th>Product</th><th>Super Admin</th></tr></thead>
        <tbody>{RECUR_PERMISSIONS.map((p, i) => (
          <tr key={i}>
            <td className="pm-td-sub">{p.area}</td>
            <td><span className="pm-td-strong" style={{ fontSize: ".74rem" }}>{p.actions.join(" · ")}</span></td>
            <td><Badge tone={tone(p.support)}>{p.support}</Badge></td>
            <td><Badge tone={tone(p.finance)}>{p.finance}</Badge></td>
            <td><Badge tone={tone(p.risk)}>{p.risk}</Badge></td>
            <td><Badge tone={tone(p.product)}>{p.product}</Badge></td>
            <td><Badge tone={tone(p.superAdmin)} dot>{p.superAdmin}</Badge></td>
          </tr>
        ))}</tbody>
      </table></div>
      <div className="pm-table-foot"><span>Matrix last reviewed Aug 18 by J. Mwangi</span><span className="pm-td-sub">Edits go through Roles &amp; Permissions (page 29)</span></div></div>
    </Drawer>
  );
}

/* ================================================================
   13. Service pause / resume
   ================================================================ */
export function ServicePauseModal({ service, onClose, onDone }: { service: Service | null; onClose: () => void; onDone: (id: string, pause: boolean, reason: string) => void }) {
  const { push } = useToast();
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  useEffect(() => { setReason(""); setCode(""); }, [service?.id]);
  if (!service) return null;
  const pausing = service.status === "Active";
  return (
    <Modal open onClose={onClose} tone={pausing ? "amber" : "green"} icon={pausing ? "bi-pause-circle" : "bi-play-circle"} size="sm"
      title={`${pausing ? "Pause" : "Resume"} — ${service.name}`}
      subtitle={`${service.subscribers.toLocaleString("en-KE")} subscribers · ${pausing ? "stops every charge today" : "charges resume next cycle"}`}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className={`btn ${pausing ? "btn-warning" : "btn-primary"} btn-sm`} disabled={!reasonOk(reason) || code !== CODE} onClick={() => {
          onDone(service.id, pausing, reason);
          push({ kind: pausing ? "warn" : "success", title: `${service.name} ${pausing ? "paused" : "resumed"}`, body: pausing ? "Charges suspended — mandates keep their next-run dates." : "Charges resume on schedule." });
          onClose();
        }}><i className={`bi ${pausing ? "bi-pause-fill" : "bi-play-fill"} me-1`} />{pausing ? "Pause service" : "Resume service"}</button>
      </>}>
      <div className="pm-modal-body">
        <div className={`pm-alert-row ${pausing ? "warn" : "ok"} mb-3`}>
          <i className={`bi ${pausing ? "bi-exclamation-triangle-fill" : "bi-check-circle-fill"}`} style={{ color: pausing ? "#f79009" : "#12b76a" }} />
          <div><b style={{ fontSize: ".8rem" }}>{pausing ? "Service-wide pause" : "Service-wide resume"}</b>
            <div className="pm-td-sub">{pausing ? "No charges fire while paused. Paused mandates are NOT cancelled and auto-resume when the service resumes. Users are notified per RCF-06/07." : "Billing resumes on each mandate's next scheduled date — no catch-up double-charges."}</div></div>
        </div>
        <label className="form-label">Reason (min 8 chars) <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control mb-3" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. partner dispute · incident · regulator directive" />
        <TwoFactorField value={code} onChange={setCode} />
      </div>
    </Modal>
  );
}

/* ================================================================
   14. Service signups freeze
   ================================================================ */
export function ServiceFreezeModal({ service, onClose, onDone }: { service: Service | null; onClose: () => void; onDone: (id: string, freeze: boolean, reason: string) => void }) {
  const { push } = useToast();
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  useEffect(() => { setReason(""); setCode(""); }, [service?.id]);
  if (!service) return null;
  const freezing = !service.signupsFrozen;
  return (
    <Modal open onClose={onClose} tone={freezing ? "red" : "green"} icon={freezing ? "bi-person-x" : "bi-person-check"} size="sm"
      title={`${freezing ? "Freeze" : "Unfreeze"} signups — ${service.name}`}
      subtitle={freezing ? "New mandates rejected at the gate · existing mandates untouched" : "New mandates accepted again"}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className={`btn ${freezing ? "btn-danger" : "btn-primary"} btn-sm`} disabled={!reasonOk(reason) || code !== CODE} onClick={() => {
          onDone(service.id, freezing, reason);
          push({ kind: freezing ? "warn" : "success", title: `Signups ${freezing ? "frozen" : "reopened"}`, body: `${service.name}: ${freezing ? "gate closed for new mandates." : "gate open for new mandates."}` });
          onClose();
        }}><i className={`bi ${freezing ? "bi-person-x" : "bi-person-check"} me-1`} />{freezing ? "Freeze signups" : "Unfreeze signups"}</button>
      </>}>
      <div className="pm-modal-body">
        <div className="pm-note mb-3"><i className="bi bi-info-circle me-1" />A signup freeze only blocks <b>new</b> mandates. Existing subscribers keep charging — pause the service instead if everything must stop.</div>
        <label className="form-label">Reason (min 8 chars) <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control mb-3" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. underwriting review · capacity · partner contract" />
        <TwoFactorField value={code} onChange={setCode} />
      </div>
    </Modal>
  );
}

/* ================================================================
   15. Service details edit
   ================================================================ */
export function ServiceEditModal({ service, onClose, onDone }: { service: Service | null; onClose: () => void; onDone: (id: string, owner: string, note: string) => void }) {
  const { push } = useToast();
  const [owner, setOwner] = useState("");
  const [note, setNote] = useState("");
  useEffect(() => { setOwner(service?.owner ?? ""); setNote(service?.note ?? ""); }, [service?.id]);
  if (!service) return null;
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-pencil-square" size="sm" title={`Details — ${service.name}`}
      subtitle={`${service.id} · registry record`}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={(owner === service.owner && note === service.note) || owner.trim().length < 3} onClick={() => {
          onDone(service.id, owner.trim(), note.trim());
          push({ kind: "success", title: "Service updated", body: `${service.name}: owner/description saved.` });
          onClose();
        }}><i className="bi bi-check2 me-1" />Save details</button>
      </>}>
      <div className="pm-modal-body">
        <label className="form-label">Owner <span style={{ color: "#f04438" }}>*</span></label>
        <input className="form-control mb-3" value={owner} onChange={(e) => setOwner(e.target.value)} />
        <label className="form-label">Description</label>
        <textarea className="form-control" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
        <div className="pm-note mt-3 mb-0"><i className="bi bi-info-circle me-1" />Owner changes re-route alerts and approvals.</div>
      </div>
    </Modal>
  );
}

/* ================================================================
   16. Plan wizard (3 steps + 2FA)
   ================================================================ */
export function PlanWizard({ open, services, presetService, onClose, onDone }: {
  open: boolean; services: Service[]; presetService: Service | null; onClose: () => void;
  onDone: (name: string, serviceId: string, price: number, billing: string, features: string, trialDays: number, proration: boolean, reason: string) => void;
}) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [price, setPrice] = useState("");
  const [billing, setBilling] = useState("Monthly");
  const [features, setFeatures] = useState("");
  const [trialDays, setTrialDays] = useState(0);
  const [proration, setProration] = useState(true);
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  useEffect(() => { setStep(0); setName(""); setServiceId(presetService?.id ?? ""); setPrice(""); setBilling("Monthly"); setFeatures(""); setTrialDays(0); setProration(true); setReason(""); setCode(""); }, [open, presetService?.id]);
  if (!open) return null;
  const priceNum = Number(price.replace(/[^\d.]/g, ""));
  const valid = [name.trim().length >= 4 && !!serviceId && priceNum > 0, features.trim().length >= 3, reasonOk(reason) && code === CODE][step];
  return (
    <Modal open onClose={onClose} tone="green" icon="bi-plus-circle" size="md" title="New subscription plan"
      subtitle="Created in staging · visible to users only after activation"
      footer={<>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}><i className="bi bi-arrow-left me-1" />Back</button>}
        {step < 2 ? <button className="btn btn-primary btn-sm" disabled={!valid} onClick={() => setStep(step + 1)}>Continue<i className="bi bi-arrow-right ms-1" /></button> : (
          <button className="btn btn-primary btn-sm" disabled={!valid} onClick={() => {
            onDone(name.trim(), serviceId, priceNum, billing, features.trim(), trialDays, proration, reason);
            push({ kind: "success", title: "Plan created", body: `${name.trim()} drafted for ${svcName(serviceId)} — activate when ready.` });
            onClose();
          }}><i className="bi bi-check2 me-1" />Create plan</button>
        )}
      </>}>
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / 3) * 100}%` }} /></div>
      <Steps current={step} steps={[{ label: "Basics", icon: "bi-tag" }, { label: "Features", icon: "bi-stars" }, { label: "Confirm", icon: "bi-shield-lock" }]} />
      <div className="pm-modal-body">
        {step === 0 && (<>
          <label className="form-label">Service <span style={{ color: "#f04438" }}>*</span></label>
          <select className="form-select mb-3" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
            <option value="">Select service…</option>
            {services.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.kind})</option>)}
          </select>
          <label className="form-label">Plan name <span style={{ color: "#f04438" }}>*</span></label>
          <input className="form-control mb-3" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Premium Family" />
          <div className="row g-2">
            <div className="col-7">
              <label className="form-label">Price / cycle (KES) <span style={{ color: "#f04438" }}>*</span></label>
              <input className="form-control mono" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="999" />
            </div>
            <div className="col-5">
              <label className="form-label">Billing</label>
              <select className="form-select" value={billing} onChange={(e) => setBilling(e.target.value)}><option>Monthly</option><option>Annual</option></select>
            </div>
          </div>
        </>)}
        {step === 1 && (<>
          <label className="form-label">Features (comma-separated) <span style={{ color: "#f04438" }}>*</span></label>
          <input className="form-control mb-3" value={features} onChange={(e) => setFeatures(e.target.value)} placeholder="Fee discounts, priority support" />
          <label className="form-label">Free trial (days)</label>
          <div className="d-flex gap-1 mb-3">
            {[0, 7, 14, 30].map((d) => (
              <button key={d} className={`pm-chip ${trialDays === d ? "active" : ""}`} onClick={() => setTrialDays(d)}>{d === 0 ? "No trial" : `${d} days`}</button>
            ))}
          </div>
          <div className="form-check form-switch mb-2">
            <input className="form-check-input" type="checkbox" id="pror" checked={proration} onChange={(e) => setProration(e.target.checked)} />
            <label className="form-check-label pm-td-sub" htmlFor="pror">Prorate mid-month changes (RCF-11)</label>
          </div>
          <div className="pm-note mb-0"><i className="bi bi-calculator me-1" />Proration credits/charges follow the signup-day anchor (RCF-12/13).</div>
        </>)}
        {step === 2 && (<>
          <div className="pm-card mb-3" style={{ padding: ".6rem .8rem" }}>
            <div className="pm-td-sub">Summary</div>
            <div className="pm-td-strong">{name || "—"} · {svcName(serviceId)}</div>
            <div className="pm-td-sub">KES {priceNum.toLocaleString("en-KE")} {billing.toLowerCase()} · {trialDays}d trial · proration {proration ? "on" : "off"}</div>
          </div>
          <label className="form-label">Reason (min 8 chars) <span style={{ color: "#f04438" }}>*</span></label>
          <textarea className="form-control mb-3" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Business case for the new plan" />
          <TwoFactorField value={code} onChange={setCode} />
        </>)}
      </div>
    </Modal>
  );
}

/* ================================================================
   17. Plan edit (features / trial / proration)
   ================================================================ */
export function PlanEditModal({ plan, onClose, onDone }: { plan: Plan | null; onClose: () => void; onDone: (id: string, features: string[], trialDays: number, proration: boolean) => void }) {
  const { push } = useToast();
  const [features, setFeatures] = useState("");
  const [trialDays, setTrialDays] = useState(0);
  const [proration, setProration] = useState(true);
  useEffect(() => { setFeatures(plan?.features.join(", ") ?? ""); setTrialDays(plan?.trialDays ?? 0); setProration(plan?.proration ?? true); }, [plan?.id]);
  if (!plan) return null;
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-pencil-square" size="sm" title={`Edit — ${plan.name}`}
      subtitle={`${plan.id} · ${plan.subscribers.toLocaleString("en-KE")} subscribers`}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={features.trim().length < 3} onClick={() => {
          onDone(plan.id, features.split(",").map((f) => f.trim()).filter(Boolean), trialDays, proration);
          push({ kind: "success", title: "Plan updated", body: `${plan.name}: features/trial saved.` });
          onClose();
        }}><i className="bi bi-check2 me-1" />Save plan</button>
      </>}>
      <div className="pm-modal-body">
        <label className="form-label">Features (comma-separated) <span style={{ color: "#f04438" }}>*</span></label>
        <input className="form-control mb-3" value={features} onChange={(e) => setFeatures(e.target.value)} />
        <label className="form-label">Free trial</label>
        <div className="d-flex gap-1 mb-3">{[0, 7, 14, 30].map((d) => (
          <button key={d} className={`pm-chip ${trialDays === d ? "active" : ""}`} onClick={() => setTrialDays(d)}>{d === 0 ? "No trial" : `${d} days`}</button>
        ))}</div>
        <div className="form-check form-switch">
          <input className="form-check-input" type="checkbox" id="prorE" checked={proration} onChange={(e) => setProration(e.target.checked)} />
          <label className="form-check-label pm-td-sub" htmlFor="prorE">Prorate mid-month changes</label>
        </div>
        <div className="pm-note mt-3 mb-0"><i className="bi bi-info-circle me-1" />Price is changed separately — it files a CR.</div>
      </div>
    </Modal>
  );
}

/* ================================================================
   18. Plan price change (CR-gated)
   ================================================================ */
export function PlanPriceModal({ plan, onClose, onDone }: { plan: Plan | null; onClose: () => void; onDone: (id: string, newPrice: number, effective: string, reason: string) => void }) {
  const { push } = useToast();
  const [price, setPrice] = useState("");
  const [effective, setEffective] = useState("Next cycle");
  const [reason, setReason] = useState("");
  useEffect(() => { setPrice(plan ? String(plan.price) : ""); setEffective("Next cycle"); setReason(""); }, [plan?.id]);
  if (!plan) return null;
  const priceNum = Number(price.replace(/[^\d.]/g, ""));
  const delta = priceNum - plan.price;
  return (
    <Modal open onClose={onClose} tone="amber" icon="bi-cash-coin" size="sm" title={`Price change — ${plan.name}`}
      subtitle={`Current KES ${plan.price.toLocaleString("en-KE")} · ${plan.subscribers.toLocaleString("en-KE")} subscribers`}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={priceNum <= 0 || priceNum === plan.price || !reasonOk(reason)} onClick={() => {
          onDone(plan.id, priceNum, effective, reason);
          push({ kind: "warn", title: "Price CR filed", body: `${plan.name}: KES ${plan.price.toLocaleString("en-KE")} → KES ${priceNum.toLocaleString("en-KE")} awaits approvals.` });
          onClose();
        }}><i className="bi bi-send me-1" />File price CR</button>
      </>}>
      <div className="pm-modal-body">
        <div className={`pm-alert-row ${delta > 0 ? "warn" : "ok"} mb-3`}>
          <i className={`bi ${delta > 0 ? "bi-arrow-up-circle-fill" : "bi-arrow-down-circle-fill"}`} style={{ color: delta > 0 ? "#f79009" : "#12b76a" }} />
          <div><b style={{ fontSize: ".8rem" }}>{delta > 0 ? `+KES ${delta.toLocaleString("en-KE")} per subscriber` : `-KES ${Math.abs(delta).toLocaleString("en-KE")} per subscriber`}</b>
            <div className="pm-td-sub">MRR impact ≈ KES {Math.round((delta * plan.subscribers) / 1e6 * 100) / 100}M/month · existing subscribers get 30 days notice (CBK).</div></div>
        </div>
        <label className="form-label">New price (KES) <span style={{ color: "#f04438" }}>*</span></label>
        <input className="form-control mb-3 mono" value={price} onChange={(e) => setPrice(e.target.value)} />
        <label className="form-label">Effective</label>
        <select className="form-select mb-3" value={effective} onChange={(e) => setEffective(e.target.value)}>
          <option>Next cycle</option><option>Next cycle + 30d notice</option><option>Immediate (new subs only)</option>
        </select>
        <label className="form-label">Reason (min 8 chars · goes to approvals) <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Pricing committee decision · date" />
      </div>
    </Modal>
  );
}

/* ================================================================
   19. Plan status (pause/resume)
   ================================================================ */
export function PlanStatusModal({ plan, onClose, onDone }: { plan: Plan | null; onClose: () => void; onDone: (id: string, activate: boolean, notify: boolean, reason: string) => void }) {
  const { push } = useToast();
  const [notify, setNotify] = useState(true);
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  useEffect(() => { setNotify(true); setReason(""); setCode(""); }, [plan?.id]);
  if (!plan) return null;
  const pausing = plan.status === "Active";
  return (
    <Modal open onClose={onClose} tone={pausing ? "amber" : "green"} icon={pausing ? "bi-pause-circle" : "bi-play-circle"} size="sm"
      title={`${pausing ? "Pause" : "Activate"} — ${plan.name}`}
      subtitle={`${plan.subscribers.toLocaleString("en-KE")} subscribers · ${pausing ? "hidden from signup, charges continue" : "visible for new signups"}`}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className={`btn ${pausing ? "btn-warning" : "btn-primary"} btn-sm`} disabled={!reasonOk(reason) || code !== CODE} onClick={() => {
          onDone(plan.id, !pausing, notify, reason);
          push({ kind: pausing ? "warn" : "success", title: `${plan.name} ${pausing ? "paused" : "active"}`, body: pausing ? "Removed from the signup sheet — existing mandates keep charging." : "Live for new signups." });
          onClose();
        }}><i className={`bi ${pausing ? "bi-pause-fill" : "bi-play-fill"} me-1`} />{pausing ? "Pause plan" : "Activate plan"}</button>
      </>}>
      <div className="pm-modal-body">
        <div className="pm-note mb-3"><i className="bi bi-info-circle me-1" />Pausing a <b>plan</b> hides it from new signups; existing subscribers are unaffected. To stop charges for everyone, pause the <b>service</b>.</div>
        <div className="form-check form-switch mb-3">
          <input className="form-check-input" type="checkbox" id="notifS" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
          <label className="form-check-label pm-td-sub" htmlFor="notifS">Notify affected subscribers (push + email)</label>
        </div>
        <label className="form-label">Reason (min 8 chars) <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control mb-3" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
        <TwoFactorField value={code} onChange={setCode} />
      </div>
    </Modal>
  );
}

/* ================================================================
   20. Plan clone
   ================================================================ */
export function PlanCloneModal({ plan, onClose, onDone }: { plan: Plan | null; onClose: () => void; onDone: (id: string) => void }) {
  const { push } = useToast();
  const [reason, setReason] = useState("");
  useEffect(() => { setReason(""); }, [plan?.id]);
  if (!plan) return null;
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-copy" size="sm" title={`Clone — ${plan.name}`}
      subtitle="Creates a Draft copy · 0 subscribers until activated"
      footer={<>
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={!reasonOk(reason)} onClick={() => {
          onDone(plan.id);
          push({ kind: "success", title: "Plan cloned", body: `${plan.name} (copy) drafted — edit then activate.` });
          onClose();
        }}><i className="bi bi-copy me-1" />Clone plan</button>
      </>}>
      <div className="pm-modal-body">
        <div className="pm-note mb-3"><i className="bi bi-info-circle me-1" />The clone keeps price, features and trial settings with status <b>Draft</b> — subscribers and MRR reset to zero.</div>
        <label className="form-label">Why are you cloning? (min 8 chars) <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. building an annual variant" />
      </div>
    </Modal>
  );
}

/* ================================================================
   21. Plan retire (typed confirm + migration + 2FA)
   ================================================================ */
export function PlanRetireModal({ plan, plans, onClose, onDone }: { plan: Plan | null; plans: Plan[]; onClose: () => void; onDone: (id: string, migrateTo: string, reason: string) => void }) {
  const { push } = useToast();
  const [migrateTo, setMigrateTo] = useState("");
  const [reason, setReason] = useState("");
  const [typed, setTyped] = useState("");
  const [code, setCode] = useState("");
  useEffect(() => { setMigrateTo(""); setReason(""); setTyped(""); setCode(""); }, [plan?.id]);
  if (!plan) return null;
  const others = plans.filter((p) => p.id !== plan.id && p.status === "Active");
  return (
    <Modal open onClose={onClose} tone="red" icon="bi-archive" size="sm" title={`Retire — ${plan.name}`}
      subtitle={`${plan.subscribers.toLocaleString("en-KE")} subscribers must move somewhere`}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger btn-sm" disabled={typed !== plan.id || !reasonOk(reason) || code !== CODE || (!!plan.subscribers && !migrateTo)} onClick={() => {
          onDone(plan.id, migrateTo, reason);
          push({ kind: "warn", title: "Plan retired", body: `${plan.name} retired${migrateTo ? ` · subscribers migrate at next cycle` : ""}.` });
          onClose();
        }}><i className="bi bi-archive me-1" />Retire plan</button>
      </>}>
      <div className="pm-modal-body">
        <div className="pm-alert-row warn mb-3">
          <i className="bi bi-exclamation-triangle-fill" style={{ color: "#f79009" }} />
          <div><b style={{ fontSize: ".8rem" }}>Retiring is reversible for 30 days</b>
            <div className="pm-td-sub">Mandates on this plan migrate at their next billing date. History is preserved.</div></div>
        </div>
        {plan.subscribers > 0 && (<>
          <label className="form-label">Migrate subscribers to <span style={{ color: "#f04438" }}>*</span></label>
          <select className="form-select mb-3" value={migrateTo} onChange={(e) => setMigrateTo(e.target.value)}>
            <option value="">Select a plan…</option>
            {others.map((p) => <option key={p.id} value={p.id}>{p.name} — KES {p.price.toLocaleString("en-KE")}</option>)}
          </select>
        </>)}
        <label className="form-label">Reason (min 8 chars) <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control mb-3" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
        <label className="form-label">Type <b className="mono">{plan.id}</b> to confirm <span style={{ color: "#f04438" }}>*</span></label>
        <input className="form-control mb-3 mono" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={plan.id} />
        <TwoFactorField value={code} onChange={setCode} />
      </div>
    </Modal>
  );
}

/* ================================================================
   22. Mandate wizard (3 steps + 2FA)
   ================================================================ */
export function MandateWizard({ open, services, plans, onClose, onDone }: {
  open: boolean; services: Service[]; plans: Plan[]; onClose: () => void;
  onDone: (user: string, phone: string, serviceId: string, planId: string, amount: number, frequency: string, billingDay: string, channel: string, reason: string) => void;
}) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [user, setUser] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [planId, setPlanId] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("Monthly");
  const [billingDay, setBillingDay] = useState("Signup day");
  const [channel, setChannel] = useState("M-Pesa");
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  useEffect(() => { setStep(0); setUser(""); setPhone(""); setServiceId(""); setPlanId(""); setAmount(""); setFrequency("Monthly"); setBillingDay("Signup day"); setChannel("M-Pesa"); setReason(""); setCode(""); }, [open]);
  if (!open) return null;
  const amountNum = Number(amount.replace(/[^\d.]/g, ""));
  const svcPlans = plans.filter((p) => p.serviceId === serviceId && p.status !== "Retired");
  const valid = [user.trim().length >= 3 && phone.trim().length >= 9 && !!serviceId && !!planId, amountNum >= 10 && amountNum <= 500000, reasonOk(reason) && code === CODE][step];
  return (
    <Modal open onClose={onClose} tone="green" icon="bi-plus-circle" size="md" title="New mandate (admin-created)"
      subtitle="Charges start next cycle · user receives an activation notice"
      footer={<>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}><i className="bi bi-arrow-left me-1" />Back</button>}
        {step < 2 ? <button className="btn btn-primary btn-sm" disabled={!valid} onClick={() => setStep(step + 1)}>Continue<i className="bi bi-arrow-right ms-1" /></button> : (
          <button className="btn btn-primary btn-sm" disabled={!valid} onClick={() => {
            onDone(user.trim(), phone.trim(), serviceId, planId, amountNum, frequency, billingDay, channel, reason);
            push({ kind: "success", title: "Mandate created", body: `${user.trim()} · KES ${amountNum.toLocaleString("en-KE")} ${frequency.toLowerCase()} via ${channel}.` });
            onClose();
          }}><i className="bi bi-check2 me-1" />Create mandate</button>
        )}
      </>}>
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / 3) * 100}%` }} /></div>
      <Steps current={step} steps={[{ label: "Customer", icon: "bi-person" }, { label: "Schedule", icon: "bi-calendar3" }, { label: "Confirm", icon: "bi-shield-lock" }]} />
      <div className="pm-modal-body">
        {step === 0 && (<>
          <div className="row g-2 mb-3">
            <div className="col-7">
              <label className="form-label">Customer name <span style={{ color: "#f04438" }}>*</span></label>
              <input className="form-control" value={user} onChange={(e) => setUser(e.target.value)} placeholder="e.g. Mary Wanjala" />
            </div>
            <div className="col-5">
              <label className="form-label">Phone <span style={{ color: "#f04438" }}>*</span></label>
              <input className="form-control mono" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 7…" />
            </div>
          </div>
          <label className="form-label">Service <span style={{ color: "#f04438" }}>*</span></label>
          <select className="form-select mb-3" value={serviceId} onChange={(e) => { setServiceId(e.target.value); setPlanId(""); }}>
            <option value="">Select service…</option>
            {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <label className="form-label">Plan <span style={{ color: "#f04438" }}>*</span></label>
          <select className="form-select" value={planId} onChange={(e) => { setPlanId(e.target.value); const p = plans.find((x) => x.id === e.target.value); if (p) setAmount(String(p.price)); }}>
            <option value="">Select plan…</option>
            {svcPlans.map((p) => <option key={p.id} value={p.id}>{p.name} — KES {p.price.toLocaleString("en-KE")}</option>)}
          </select>
        </>)}
        {step === 1 && (<>
          <label className="form-label">Amount / cycle (KES) <span style={{ color: "#f04438" }}>*</span></label>
          <input className="form-control mb-3 mono" value={amount} onChange={(e) => setAmount(e.target.value)} />
          {amountNum > 500000 && <div className="pm-alert-row warn mb-3"><i className="bi bi-exclamation-triangle-fill" style={{ color: "#f79009" }} /><div className="pm-td-sub">Above the KES 500,000 guardrail (RCF-14) — Finance co-sign needed.</div></div>}
          <div className="row g-2 mb-3">
            <div className="col-6">
              <label className="form-label">Frequency</label>
              <select className="form-select" value={frequency} onChange={(e) => setFrequency(e.target.value)}><option>Monthly</option><option>Bi-weekly</option><option>Weekly</option></select>
            </div>
            <div className="col-6">
              <label className="form-label">Billing day</label>
              <input className="form-control" value={billingDay} onChange={(e) => setBillingDay(e.target.value)} placeholder="5th / Mon / Statement" />
            </div>
          </div>
          <label className="form-label">Collection channel</label>
          <div className="d-flex gap-1">{["M-Pesa", "Bank", "Card"].map((c) => (
            <button key={c} className={`pm-chip ${channel === c ? "active" : ""}`} onClick={() => setChannel(c)}>{c}</button>
          ))}</div>
          <div className="pm-note mt-3 mb-0"><i className="bi bi-info-circle me-1" />Day 29/30/31 anchors to month-end (RCF-13).</div>
        </>)}
        {step === 2 && (<>
          <div className="pm-card mb-3" style={{ padding: ".6rem .8rem" }}>
            <div className="pm-td-sub">Summary</div>
            <div className="pm-td-strong">{user || "—"} · {phone || "—"}</div>
            <div className="pm-td-sub">{svcName(serviceId)} · KES {amountNum.toLocaleString("en-KE")} {frequency.toLowerCase()} on {billingDay} · {channel}</div>
          </div>
          <label className="form-label">Reason (min 8 chars) <span style={{ color: "#f04438" }}>*</span></label>
          <textarea className="form-control mb-3" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. signed paper mandate · phone order verified" />
          <TwoFactorField value={code} onChange={setCode} />
        </>)}
      </div>
    </Modal>
  );
}

/* ================================================================
   23. Mandate pause / resume (with auto-resume)
   ================================================================ */
export function MandatePauseModal({ mandate, onClose, onDone }: { mandate: Mandate | null; onClose: () => void; onDone: (id: string, pause: boolean, autoResume: string, notify: boolean, reason: string) => void }) {
  const { push } = useToast();
  const [autoResume, setAutoResume] = useState("");
  const [notify, setNotify] = useState(true);
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  useEffect(() => { setAutoResume(mandate?.autoResume ?? ""); setNotify(true); setReason(""); setCode(""); }, [mandate?.id]);
  if (!mandate) return null;
  const pausing = mandate.status !== "Paused";
  return (
    <Modal open onClose={onClose} tone={pausing ? "amber" : "green"} icon={pausing ? "bi-pause-circle" : "bi-play-circle"} size="sm"
      title={`${pausing ? "Pause" : "Resume"} — ${mandate.id}`}
      subtitle={`${mandate.user} · ${svcName(mandate.serviceId)} · KES ${mandate.amount.toLocaleString("en-KE")}`}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className={`btn ${pausing ? "btn-warning" : "btn-primary"} btn-sm`} disabled={!reasonOk(reason) || code !== CODE} onClick={() => {
          onDone(mandate.id, pausing, autoResume.trim(), notify, reason);
          push({ kind: pausing ? "warn" : "success", title: `Mandate ${pausing ? "paused" : "resumed"}`, body: pausing ? `${mandate.user}: charges held${autoResume.trim() ? ` until ${autoResume.trim()}` : ""}.` : `${mandate.user}: next charge ${mandate.next}.` });
          onClose();
        }}><i className={`bi ${pausing ? "bi-pause-fill" : "bi-play-fill"} me-1`} />{pausing ? "Pause mandate" : "Resume mandate"}</button>
      </>}>
      <div className="pm-modal-body">
        {pausing && (<>
          <label className="form-label">Auto-resume date (optional)</label>
          <input className="form-control mb-3" value={autoResume} onChange={(e) => setAutoResume(e.target.value)} placeholder="e.g. Sep 05 — blank = manual resume" />
          <div className="form-check form-switch mb-3">
            <input className="form-check-input" type="checkbox" id="notifM" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
            <label className="form-check-label pm-td-sub" htmlFor="notifM">Tell the customer (push + SMS)</label>
          </div>
        </>)}
        {!pausing && <div className="pm-note mb-3"><i className="bi bi-info-circle me-1" />Resuming schedules the next charge on the mandate's billing day — no catch-up charges for paused cycles.</div>}
        <label className="form-label">Reason (min 8 chars) <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control mb-3" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. hardship plan · user request · dispute" />
        <TwoFactorField value={code} onChange={setCode} />
      </div>
    </Modal>
  );
}

/* ================================================================
   24. Mandate cancel (typed + win-back + 2FA)
   ================================================================ */
export function MandateCancelModal({ mandate, offers, onClose, onDone }: { mandate: Mandate | null; offers: Offer[]; onClose: () => void; onDone: (id: string, offerId: string, reason: string) => void }) {
  const { push } = useToast();
  const [offerId, setOfferId] = useState("");
  const [reason, setReason] = useState("");
  const [typed, setTyped] = useState("");
  const [code, setCode] = useState("");
  useEffect(() => { setOfferId(""); setReason(""); setTyped(""); setCode(""); }, [mandate?.id]);
  if (!mandate) return null;
  return (
    <Modal open onClose={onClose} tone="red" icon="bi-x-circle" size="sm" title={`Cancel — ${mandate.id}`}
      subtitle={`${mandate.user} · LTV KES ${mandate.ltv.toLocaleString("en-KE")} · recoverable 30 days`}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Keep mandate</button>
        <button className="btn btn-danger btn-sm" disabled={typed !== mandate.id || !reasonOk(reason) || code !== CODE} onClick={() => {
          onDone(mandate.id, offerId, reason);
          push({ kind: "warn", title: "Mandate cancelled", body: `${mandate.user}: ${offerId ? "win-back offer queued." : "no win-back offer."}` });
          onClose();
        }}><i className="bi bi-x-circle me-1" />Cancel mandate</button>
      </>}>
      <div className="pm-modal-body">
        <div className="pm-alert-row warn mb-3">
          <i className="bi bi-exclamation-triangle-fill" style={{ color: "#f79009" }} />
          <div><b style={{ fontSize: ".8rem" }}>Cancellation ≠ deletion</b>
            <div className="pm-td-sub">History is kept 7 years. The mandate can be reactivated within 30 days (RCF-10).</div></div>
        </div>
        <label className="form-label">Win-back offer (optional)</label>
        <select className="form-select mb-3" value={offerId} onChange={(e) => setOfferId(e.target.value)}>
          <option value="">No offer</option>
          {offers.filter((o) => o.status === "Active").map((o) => <option key={o.id} value={o.id}>{o.name} — {o.discount}</option>)}
        </select>
        <label className="form-label">Reason (min 8 chars) <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control mb-3" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. user request · max retries reached · fraud" />
        <label className="form-label">Type <b className="mono">{mandate.id}</b> to confirm <span style={{ color: "#f04438" }}>*</span></label>
        <input className="form-control mb-3 mono" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={mandate.id} />
        <TwoFactorField value={code} onChange={setCode} />
      </div>
    </Modal>
  );
}

/* ================================================================
   25. Mandate skip cycle
   ================================================================ */
export function MandateSkipModal({ mandate, onClose, onDone }: { mandate: Mandate | null; onClose: () => void; onDone: (id: string, notify: boolean, reason: string) => void }) {
  const { push } = useToast();
  const [notify, setNotify] = useState(true);
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  useEffect(() => { setNotify(true); setReason(""); setCode(""); }, [mandate?.id]);
  if (!mandate) return null;
  return (
    <Modal open onClose={onClose} tone="amber" icon="bi-skip-forward" size="sm" title={`Skip a cycle — ${mandate.id}`}
      subtitle={`${mandate.user} · next charge ${mandate.next} → moves one cycle out`}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-warning btn-sm" disabled={!reasonOk(reason) || code !== CODE} onClick={() => {
          onDone(mandate.id, notify, reason);
          push({ kind: "warn", title: "Cycle skipped", body: `${mandate.user}: next charge moved one cycle. Tenure untouched.` });
          onClose();
        }}><i className="bi bi-skip-forward me-1" />Skip cycle</button>
      </>}>
      <div className="pm-modal-body">
        <div className="pm-note mb-3"><i className="bi bi-info-circle me-1" />A skipped cycle does not count as a missed payment and never enters dunning. Tenure and loyalty flags keep counting.</div>
        <div className="form-check form-switch mb-3">
          <input className="form-check-input" type="checkbox" id="notifK" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
          <label className="form-check-label pm-td-sub" htmlFor="notifK">Notify the customer about the skipped charge</label>
        </div>
        <label className="form-label">Reason (min 8 chars) <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control mb-3" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. goodwill · service outage · user travel" />
        <TwoFactorField value={code} onChange={setCode} />
      </div>
    </Modal>
  );
}

/* ================================================================
   26. Mandate amount edit
   ================================================================ */
export function MandateAmountModal({ mandate, onClose, onDone }: { mandate: Mandate | null; onClose: () => void; onDone: (id: string, amount: number, reason: string) => void }) {
  const { push } = useToast();
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  useEffect(() => { setAmount(mandate ? String(mandate.amount) : ""); setReason(""); setCode(""); }, [mandate?.id]);
  if (!mandate) return null;
  const amountNum = Number(amount.replace(/[^\d.]/g, ""));
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-cash-coin" size="sm" title={`Amount — ${mandate.id}`}
      subtitle={`${mandate.user} · current KES ${mandate.amount.toLocaleString("en-KE")} / ${mandate.frequency.toLowerCase()}`}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={amountNum < 10 || amountNum === mandate.amount || !reasonOk(reason) || code !== CODE} onClick={() => {
          onDone(mandate.id, amountNum, reason);
          push({ kind: "success", title: "Amount updated", body: `${mandate.user}: KES ${mandate.amount.toLocaleString("en-KE")} → KES ${amountNum.toLocaleString("en-KE")} from next cycle.` });
          onClose();
        }}><i className="bi bi-check2 me-1" />Save amount</button>
      </>}>
      <div className="pm-modal-body">
        <label className="form-label">New amount (KES) <span style={{ color: "#f04438" }}>*</span></label>
        <input className="form-control mb-3 mono" value={amount} onChange={(e) => setAmount(e.target.value)} />
        {amountNum > 500000 && <div className="pm-alert-row warn mb-3"><i className="bi bi-exclamation-triangle-fill" style={{ color: "#f79009" }} /><div className="pm-td-sub">Above RCF-14 guardrail — needs Finance co-sign before it sticks.</div></div>}
        <div className="pm-note mb-3"><i className="bi bi-info-circle me-1" />The customer is notified of any amount change (CBK transparency rule). Takes effect next cycle.</div>
        <label className="form-label">Reason (min 8 chars) <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control mb-3" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
        <TwoFactorField value={code} onChange={setCode} />
      </div>
    </Modal>
  );
}

/* ================================================================
   27. Mandate billing day edit
   ================================================================ */
export function MandateBillingDayModal({ mandate, onClose, onDone }: { mandate: Mandate | null; onClose: () => void; onDone: (id: string, billingDay: string) => void }) {
  const { push } = useToast();
  const [day, setDay] = useState("");
  const [code, setCode] = useState("");
  useEffect(() => { setDay(mandate?.billingDay ?? ""); setCode(""); }, [mandate?.id]);
  if (!mandate) return null;
  const isMonthly = mandate.frequency === "Monthly";
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-calendar3" size="sm" title={`Billing day — ${mandate.id}`}
      subtitle={`${mandate.user} · currently ${mandate.billingDay}`}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={day.trim() === mandate.billingDay || day.trim().length === 0 || code !== CODE} onClick={() => {
          onDone(mandate.id, day.trim());
          push({ kind: "success", title: "Billing day updated", body: `${mandate.user}: next charge now anchors to ${day.trim()}.` });
          onClose();
        }}><i className="bi bi-check2 me-1" />Save billing day</button>
      </>}>
      <div className="pm-modal-body">
        {isMonthly ? (
          <div className="d-flex flex-wrap gap-1 mb-3">
            {[...Array(28)].map((_, i) => (
              <button key={i} className={`pm-chip ${day === `${i + 1}th` ? "active" : ""}`} style={{ width: 46 }} onClick={() => setDay(`${i + 1}th`)}>{i + 1}</button>
            ))}
            <button className={`pm-chip ${day === "Last day" ? "active" : ""}`} onClick={() => setDay("Last day")}>Last</button>
          </div>
        ) : (
          <div className="d-flex gap-1 mb-3">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <button key={d} className={`pm-chip ${day === d ? "active" : ""}`} onClick={() => setDay(d)}>{d}</button>
            ))}
          </div>
        )}
        <div className="pm-note mb-3"><i className="bi bi-info-circle me-1" />Day 29/30/31 anchors to the last day of shorter months (RCF-13). The first charge on the new day is prorated when RCF-11 is on.</div>
        <TwoFactorField value={code} onChange={setCode} />
      </div>
    </Modal>
  );
}

/* ================================================================
   28. Retry now (manual, out-of-band)
   ================================================================ */
export function RetryNowModal({ failure, onClose, onDone }: { failure: FailedPayment | null; onClose: () => void; onDone: (id: string, channel: string, note: string) => void }) {
  const { push } = useToast();
  const [channel, setChannel] = useState("M-Pesa");
  const [note, setNote] = useState("");
  const [code, setCode] = useState("");
  useEffect(() => { setChannel("M-Pesa"); setNote(""); setCode(""); }, [failure?.id]);
  if (!failure) return null;
  return (
    <Modal open onClose={onClose} tone="amber" icon="bi-play-fill" size="sm" title={`Retry now — ${failure.id}`}
      subtitle={`${failure.user} · KES ${failure.amount.toLocaleString("en-KE")} · retry ${failure.retries + 1} of ${failure.maxRetries}`}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={note.trim().length < 4 || code !== CODE} onClick={() => {
          onDone(failure.id, channel, note);
          push({ kind: "success", title: "Retry fired", body: `${failure.user}: KES ${failure.amount.toLocaleString("en-KE")} via ${channel} — result in seconds.` });
          onClose();
        }}><i className="bi bi-play-fill me-1" />Charge now</button>
      </>}>
      <div className="pm-modal-body">
        <div className="pm-alert-row warn mb-3">
          <i className="bi bi-exclamation-triangle-fill" style={{ color: "#f79009" }} />
          <div><b style={{ fontSize: ".8rem" }}>Manual retry</b>
            <div className="pm-td-sub">Fires immediately — outside the 06:00–20:00 retry window this is a Risk-logged action. Reason: {failure.reason}.</div></div>
        </div>
        <label className="form-label">Collection channel</label>
        <div className="d-flex gap-1 mb-3">{["M-Pesa", "Bank", "Card"].map((c) => (
          <button key={c} className={`pm-chip ${channel === c ? "active" : ""}`} onClick={() => setChannel(c)}>{c}</button>
        ))}</div>
        <label className="form-label">Note (min 4 chars) <span style={{ color: "#f04438" }}>*</span></label>
        <input className="form-control mb-3" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. user confirmed funds are in" />
        <TwoFactorField value={code} onChange={setCode} />
      </div>
    </Modal>
  );
}

/* ================================================================
   29. Mark recovered
   ================================================================ */
export function MarkRecoveredModal({ failure, onClose, onDone }: { failure: FailedPayment | null; onClose: () => void; onDone: (id: string, method: string, note: string) => void }) {
  const { push } = useToast();
  const [method, setMethod] = useState("Paid via agent");
  const [note, setNote] = useState("");
  const [code, setCode] = useState("");
  useEffect(() => { setMethod("Paid via agent"); setNote(""); setCode(""); }, [failure?.id]);
  if (!failure) return null;
  return (
    <Modal open onClose={onClose} tone="green" icon="bi-check2-circle" size="sm" title={`Mark recovered — ${failure.id}`}
      subtitle={`${failure.user} · KES ${failure.amount.toLocaleString("en-KE")} · clears the dunning chain`}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={note.trim().length < 4 || code !== CODE} onClick={() => {
          onDone(failure.id, method, note);
          push({ kind: "success", title: "Marked recovered", body: `${failure.user}: ${method.toLowerCase()} — mandate back to healthy.` });
          onClose();
        }}><i className="bi bi-check2 me-1" />Mark recovered</button>
      </>}>
      <div className="pm-modal-body">
        <div className="pm-note mb-3"><i className="bi bi-info-circle me-1" />Use when the customer paid outside PayMo (agent, till, reversal). The mandate returns to Active and future reminders stop.</div>
        <label className="form-label">How was it settled?</label>
        <select className="form-select mb-3" value={method} onChange={(e) => setMethod(e.target.value)}>
          <option>Paid via agent</option><option>Paid at till</option><option>Bank transfer received</option><option>Reversal corrected</option>
        </select>
        <label className="form-label">Reference note (min 4 chars) <span style={{ color: "#f04438" }}>*</span></label>
        <input className="form-control mb-3" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. agent receipt AG-88213" />
        <TwoFactorField value={code} onChange={setCode} />
      </div>
    </Modal>
  );
}

/* ================================================================
   30. Extend grace
   ================================================================ */
export function GraceModal({ failure, onClose, onDone }: { failure: FailedPayment | null; onClose: () => void; onDone: (id: string, days: number, notify: boolean, reason: string) => void }) {
  const { push } = useToast();
  const [days, setDays] = useState(3);
  const [notify, setNotify] = useState(true);
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  useEffect(() => { setDays(3); setNotify(true); setReason(""); setCode(""); }, [failure?.id]);
  if (!failure) return null;
  return (
    <Modal open onClose={onClose} tone="amber" icon="bi-hourglass-split" size="sm" title={`Extend grace — ${failure.id}`}
      subtitle={`${failure.user} · ${failure.reason} · auto-cancel looms`}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-warning btn-sm" disabled={!reasonOk(reason) || code !== CODE} onClick={() => {
          onDone(failure.id, days, notify, reason);
          push({ kind: "warn", title: "Grace extended", body: `${failure.user}: +${days} days before auto-cancel.` });
          onClose();
        }}><i className="bi bi-hourglass-split me-1" />Extend grace</button>
      </>}>
      <div className="pm-modal-body">
        <div className="pm-note mb-3"><i className="bi bi-info-circle me-1" />Grace keeps benefits alive while the customer arranges payment. Standard grace is 3 days (RCF-05); extensions are audit-logged.</div>
        <label className="form-label">Extra days</label>
        <div className="d-flex gap-1 mb-3">{[1, 2, 3, 5, 7].map((d) => (
          <button key={d} className={`pm-chip ${days === d ? "active" : ""}`} onClick={() => setDays(d)}>+{d}d</button>
        ))}</div>
        <div className="form-check form-switch mb-3">
          <input className="form-check-input" type="checkbox" id="notifG" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
          <label className="form-check-label pm-td-sub" htmlFor="notifG">Notify the customer of the new deadline</label>
        </div>
        <label className="form-label">Reason (min 8 chars) <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control mb-3" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. salary delay · verified hardship" />
        <TwoFactorField value={code} onChange={setCode} />
      </div>
    </Modal>
  );
}

/* ================================================================
   31. Bulk retry
   ================================================================ */
export function BulkRetryModal({ count, open, onClose, onDone }: { count: number; open: boolean; onClose: () => void; onDone: (window: string, reason: string) => void }) {
  const { push } = useToast();
  const [win, setWin] = useState("Now (out-of-band)");
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  useEffect(() => { setWin("Now (out-of-band)"); setReason(""); setCode(""); }, [open]);
  if (!open) return null;
  return (
    <Modal open onClose={onClose} tone="amber" icon="bi-play-fill" size="sm" title={`Bulk retry — ${count} mandates`}
      subtitle="Fires collection attempts for every selected mandate"
      footer={<>
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={!reasonOk(reason) || code !== CODE} onClick={() => {
          onDone(win, reason);
          push({ kind: "success", title: `${count} retries fired`, body: `Window: ${win}. Results stream into the queue.` });
          onClose();
        }}><i className="bi bi-play-fill me-1" />Retry {count} now</button>
      </>}>
      <div className="pm-modal-body">
        <div className="pm-alert-row warn mb-3">
          <i className="bi bi-exclamation-triangle-fill" style={{ color: "#f79009" }} />
          <div><b style={{ fontSize: ".8rem" }}>Batch action</b>
            <div className="pm-td-sub">Each attempt respects per-user quiet hours and the retry cap. Dunning stage advances only on failure.</div></div>
        </div>
        <label className="form-label">Window</label>
        <select className="form-select mb-3" value={win} onChange={(e) => setWin(e.target.value)}>
          <option>Now (out-of-band)</option><option>Next scheduled run (06:00)</option><option>Evening run (18:00)</option>
        </select>
        <label className="form-label">Reason (min 8 chars) <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control mb-3" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. end-of-day collections push" />
        <TwoFactorField value={code} onChange={setCode} />
      </div>
    </Modal>
  );
}

/* ================================================================
   32. Campaign wizard (4 steps)
   ================================================================ */
export function CampaignWizard({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: (name: string, trigger: string, channels: string[], message: string, timing: string) => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("1st failure");
  const [channels, setChannels] = useState<string[]>(["Push"]);
  const [message, setMessage] = useState("");
  const [timing, setTiming] = useState("Immediately");
  useEffect(() => { setStep(0); setName(""); setTrigger("1st failure"); setChannels(["Push"]); setMessage(""); setTiming("Immediately"); }, [open]);
  if (!open) return null;
  const toggleCh = (c: string) => setChannels((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));
  const valid = [name.trim().length >= 4, channels.length > 0, message.trim().length >= 8 && message.length <= 160, true][step];
  return (
    <Modal open onClose={onClose} tone="violet" icon="bi-megaphone" size="md" title="New dunning campaign"
      subtitle="Created in Draft · goes live after review"
      footer={<>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}><i className="bi bi-arrow-left me-1" />Back</button>}
        {step < 3 ? <button className="btn btn-primary btn-sm" disabled={!valid} onClick={() => setStep(step + 1)}>Continue<i className="bi bi-arrow-right ms-1" /></button> : (
          <button className="btn btn-primary btn-sm" onClick={() => {
            onDone(name.trim(), trigger, channels, message.trim(), timing);
            push({ kind: "success", title: "Campaign drafted", body: `${name.trim()} is in Draft — review then activate.` });
            onClose();
          }}><i className="bi bi-check2 me-1" />Create campaign</button>
        )}
      </>}>
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
      <Steps current={step} steps={[{ label: "Identity", icon: "bi-tag" }, { label: "Channels", icon: "bi-broadcast" }, { label: "Message", icon: "bi-chat-quote" }, { label: "Timing", icon: "bi-clock" }]} />
      <div className="pm-modal-body">
        {step === 0 && (<>
          <label className="form-label">Campaign name <span style={{ color: "#f04438" }}>*</span></label>
          <input className="form-control mb-3" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Salary-day smart reminder" />
          <label className="form-label">Trigger</label>
          <select className="form-select" value={trigger} onChange={(e) => setTrigger(e.target.value)}>
            <option>1st failure</option><option>2nd failure</option><option>3rd failure</option><option>Post cancellation</option><option>Card expires in 14d</option><option>Grace entered</option>
          </select>
        </>)}
        {step === 1 && (<>
          <label className="form-label">Channels (min 1) <span style={{ color: "#f04438" }}>*</span></label>
          <div className="d-flex gap-1 mb-3">{["Push", "SMS", "Email"].map((c) => (
            <button key={c} className={`pm-chip ${channels.includes(c) ? "active" : ""}`} onClick={() => toggleCh(c)}>{c}</button>
          ))}</div>
          <div className="pm-note mb-0"><i className="bi bi-info-circle me-1" />SMS costs KES 0.8/send — reserve for failures where push has no device.</div>
        </>)}
        {step === 2 && (<>
          <label className="form-label">Message (8–160 chars) <span style={{ color: "#f04438" }}>*</span></label>
          <textarea className="form-control mb-2" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Payment failed, please top up" />
          <div className="pm-td-sub text-end">{message.length}/160 {message.length > 160 && <span style={{ color: "#b42318" }}>— over SMS budget</span>}</div>
        </>)}
        {step === 3 && (<>
          <label className="form-label">Timing</label>
          <select className="form-select mb-3" value={timing} onChange={(e) => setTiming(e.target.value)}>
            <option>Immediately</option><option>24h before retry</option><option>After cancel</option><option>7 days after</option><option>30 days after</option>
          </select>
          <div className="pm-card" style={{ padding: ".6rem .8rem" }}>
            <div className="pm-td-sub">Summary</div>
            <div className="pm-td-strong">{name || "—"} · {trigger}</div>
            <div className="pm-td-sub">{channels.join(" + ") || "—"} · {timing} · “{message || "—"}”</div>
          </div>
        </>)}
      </div>
    </Modal>
  );
}

/* ================================================================
   33. Campaign edit (copy + timing)
   ================================================================ */
export function CampaignEditModal({ campaign, onClose, onDone }: { campaign: Campaign | null; onClose: () => void; onDone: (id: string, message: string, timing: string) => void }) {
  const { push } = useToast();
  const [message, setMessage] = useState("");
  const [timing, setTiming] = useState("Immediately");
  useEffect(() => { setMessage(campaign?.message ?? ""); setTiming(campaign?.timing ?? "Immediately"); }, [campaign?.id]);
  if (!campaign) return null;
  return (
    <Modal open onClose={onClose} tone="violet" icon="bi-pencil-square" size="sm" title={`Edit — ${campaign.name}`}
      subtitle={`${campaign.id} · copy changes deploy on approval (RRC pattern)`}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={message.trim().length < 8 || message.length > 160 || (message === campaign.message && timing === campaign.timing)} onClick={() => {
          onDone(campaign.id, message.trim(), timing);
          push({ kind: "warn", title: "Copy change filed", body: `${campaign.id}: edits queue for approval before traffic.` });
          onClose();
        }}><i className="bi bi-send me-1" />Submit copy change</button>
      </>}>
      <div className="pm-modal-body">
        <label className="form-label">Message (8–160 chars) <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control mb-2" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
        <div className="pm-td-sub text-end mb-3">{message.length}/160</div>
        <label className="form-label">Timing</label>
        <select className="form-select" value={timing} onChange={(e) => setTiming(e.target.value)}>
          <option>Immediately</option><option>24h before retry</option><option>After cancel</option><option>7 days after</option><option>30 days after</option><option>14 days before</option>
        </select>
      </div>
    </Modal>
  );
}

/* ================================================================
   34. Campaign pause/resume
   ================================================================ */
export function CampaignStatusModal({ campaign, onClose, onDone }: { campaign: Campaign | null; onClose: () => void; onDone: (id: string, activate: boolean, reason: string) => void }) {
  const { push } = useToast();
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  useEffect(() => { setReason(""); setCode(""); }, [campaign?.id]);
  if (!campaign) return null;
  const pausing = campaign.status === "Active";
  return (
    <Modal open onClose={onClose} tone={pausing ? "amber" : "green"} icon={pausing ? "bi-pause-circle" : "bi-play-circle"} size="sm"
      title={`${pausing ? "Pause" : "Activate"} — ${campaign.id}`}
      subtitle={`${campaign.name} · ${campaign.sent30d.toLocaleString("en-KE")} sends in 30d`}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className={`btn ${pausing ? "btn-warning" : "btn-primary"} btn-sm`} disabled={!reasonOk(reason) || code !== CODE} onClick={() => {
          onDone(campaign.id, !pausing, reason);
          push({ kind: pausing ? "warn" : "success", title: `${campaign.id} ${pausing ? "paused" : "live"}`, body: pausing ? "Journey skips this step while paused." : "Journey includes this step again." });
          onClose();
        }}><i className={`bi ${pausing ? "bi-pause-fill" : "bi-play-fill"} me-1`} />{pausing ? "Pause campaign" : "Activate campaign"}</button>
      </>}>
      <div className="pm-modal-body">
        <div className="pm-note mb-3"><i className="bi bi-diagram-3 me-1" />{pausing ? "Users at this stage fall through to the next live step — no message is sent." : "Messages resume for users entering the trigger."}</div>
        <label className="form-label">Reason (min 8 chars) <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control mb-3" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
        <TwoFactorField value={code} onChange={setCode} />
      </div>
    </Modal>
  );
}

/* ================================================================
   35. A/B test bench
   ================================================================ */
export function CampaignABModal({ campaign, onClose, onDone }: { campaign: Campaign | null; onClose: () => void; onDone: (id: string, split: number, days: number) => void }) {
  const { push } = useToast();
  const [split, setSplit] = useState(50);
  const [days, setDays] = useState(7);
  const [variantB, setVariantB] = useState("");
  useEffect(() => { setSplit(50); setDays(7); setVariantB(""); }, [campaign?.id]);
  if (!campaign) return null;
  return (
    <Modal open onClose={onClose} tone="violet" icon="bi-bezier2" size="md" title={`A/B bench — ${campaign.id}`}
      subtitle={`${campaign.name} · live traffic split test`}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={variantB.trim().length < 8 || variantB === campaign.message} onClick={() => {
          onDone(campaign.id, split, days);
          push({ kind: "success", title: "A/B test scheduled", body: `${campaign.id}: 50/${split !== 50 ? split : 50} split for ${days} days — winner promotes via CR.` });
          onClose();
        }}><i className="bi bi-play-fill me-1" />Start test</button>
      </>}>
      <div className="pm-modal-body">
        <div className="row g-2 mb-3">
          <div className="col-6">
            <div className="pm-card" style={{ padding: ".6rem .8rem", height: "100%" }}>
              <Badge tone="grey">Variant A (control)</Badge>
              <div className="mt-2" style={{ fontSize: ".8rem" }}>“{campaign.message}”</div>
              <div className="pm-td-sub mt-1">Current live copy</div>
            </div>
          </div>
          <div className="col-6">
            <div className="pm-card" style={{ padding: ".6rem .8rem", height: "100%", border: "1px solid #e4e7ec" }}>
              <Badge tone="violet">Variant B (challenger)</Badge>
              <textarea className="form-control mt-2" rows={2} value={variantB} onChange={(e) => setVariantB(e.target.value)} placeholder="Challenger copy (min 8 chars)" />
            </div>
          </div>
        </div>
        <label className="form-label">Traffic split — B gets {split}%</label>
        <div className="d-flex gap-1 mb-3">{[10, 25, 50].map((s) => (
          <button key={s} className={`pm-chip ${split === s ? "active" : ""}`} onClick={() => setSplit(s)}>B {s}%</button>
        ))}</div>
        <label className="form-label">Run length</label>
        <div className="d-flex gap-1">{[3, 7, 14].map((d) => (
          <button key={d} className={`pm-chip ${days === d ? "active" : ""}`} onClick={() => setDays(d)}>{d} days</button>
        ))}</div>
        <div className="pm-note mt-3 mb-0"><i className="bi bi-shield-check me-1" />Tests never hold back a required notice (DUN-03 final notices are mandatory under RCF-07).</div>
      </div>
    </Modal>
  );
}

/* ================================================================
   36. Churn action assignment
   ================================================================ */
export function ChurnActionModal({ row, onClose, onDone }: { row: ChurnRow | null; onClose: () => void; onDone: (reason: string, owner: string, status: string) => void }) {
  const { push } = useToast();
  const [owner, setOwner] = useState("");
  const [status, setStatus] = useState("Owner assigned");
  useEffect(() => { setOwner(row?.owner && row.owner !== "—" ? row.owner : ""); setStatus("Owner assigned"); }, [row?.reason]);
  if (!row) return null;
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-clipboard-check" size="sm" title={`Action — ${row.reason}`}
      subtitle={`${row.count} cancellations · ${row.pct}% of churn · planned: ${row.action}`}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={owner.trim().length < 3} onClick={() => {
          onDone(row.reason, owner.trim(), status);
          push({ kind: "success", title: "Action updated", body: `${row.action} → ${owner.trim()} (${status.toLowerCase()}).` });
          onClose();
        }}><i className="bi bi-check2 me-1" />Save action</button>
      </>}>
      <div className="pm-modal-body">
        <label className="form-label">Owner <span style={{ color: "#f04438" }}>*</span></label>
        <select className="form-select mb-3" value={owner} onChange={(e) => setOwner(e.target.value)}>
          <option value="">Assign…</option>
          {["P. Wanjiru", "D. Kimani", "A. Njoroge", "S. Achieng", "V. Kiprop", "J. Mwangi"].map((o) => <option key={o}>{o}</option>)}
        </select>
        <label className="form-label">Status</label>
        <div className="d-flex gap-1 mb-3">{["Not started", "Owner assigned", "In progress", "Shipped"].map((s) => (
          <button key={s} className={`pm-chip ${status === s ? "active" : ""}`} onClick={() => setStatus(s)}>{s}</button>
        ))}</div>
        <div className="pm-note mb-0"><i className="bi bi-graph-up me-1" />Actions surface in the monthly Product OKR review with churn deltas.</div>
      </div>
    </Modal>
  );
}

/* ================================================================
   37. Win-back offer create/edit
   ================================================================ */
export function OfferModal({ offer, open, onClose, onDone }: { offer: Offer | null; open: boolean; onClose: () => void; onDone: (id: string | null, name: string, segment: string, discount: string, expires: string, activate: boolean) => void }) {
  const { push } = useToast();
  const [name, setName] = useState("");
  const [segment, setSegment] = useState("Cancelled ≤ 7 days");
  const [discount, setDiscount] = useState("");
  const [expires, setExpires] = useState("Rolling");
  const [activate, setActivate] = useState(false);
  useEffect(() => {
    setName(offer?.name ?? ""); setSegment(offer?.segment ?? "Cancelled ≤ 7 days"); setDiscount(offer?.discount ?? ""); setExpires(offer?.expires ?? "Rolling"); setActivate(offer?.status === "Active");
  }, [offer?.id, open]);
  if (!open) return null;
  const isNew = !offer;
  return (
    <Modal open onClose={onClose} tone="violet" icon="bi-gift" size="sm" title={isNew ? "New win-back offer" : `Edit — ${offer!.name}`}
      subtitle="Targeted at the win-back pool (cancelled ≤ 30 days)"
      footer={<>
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={name.trim().length < 4 || discount.trim().length < 3} onClick={() => {
          onDone(offer?.id ?? null, name.trim(), segment, discount.trim(), expires, activate);
          push({ kind: "success", title: isNew ? "Offer created" : "Offer updated", body: `${name.trim()} — ${activate ? "live" : "draft"}.` });
          onClose();
        }}><i className="bi bi-check2 me-1" />{isNew ? "Create offer" : "Save offer"}</button>
      </>}>
      <div className="pm-modal-body">
        <label className="form-label">Offer name <span style={{ color: "#f04438" }}>*</span></label>
        <input className="form-control mb-3" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Come back — 60% off 2 months" />
        <label className="form-label">Segment</label>
        <select className="form-select mb-3" value={segment} onChange={(e) => setSegment(e.target.value)}>
          <option>Cancelled ≤ 7 days</option><option>Cancelled ≤ 30 days</option><option>Cancelled: insufficient funds</option><option>Tenure &gt; 6 months</option><option>Trial expired, never paid</option>
        </select>
        <div className="row g-2 mb-3">
          <div className="col-7">
            <label className="form-label">Discount <span style={{ color: "#f04438" }}>*</span></label>
            <input className="form-control" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="50% · 1 month" />
          </div>
          <div className="col-5">
            <label className="form-label">Expires</label>
            <input className="form-control" value={expires} onChange={(e) => setExpires(e.target.value)} />
          </div>
        </div>
        <div className="form-check form-switch">
          <input className="form-check-input" type="checkbox" id="actO" checked={activate} onChange={(e) => setActivate(e.target.checked)} />
          <label className="form-check-label pm-td-sub" htmlFor="actO">Active (visible to eligible users immediately)</label>
        </div>
      </div>
    </Modal>
  );
}

/* ================================================================
   38. Config edit (CR-gated)
   ================================================================ */
export function ConfigEditModal({ setting, onClose, onDone }: { setting: ConfigSetting | null; onClose: () => void; onDone: (id: string, value: string, reason: string) => void }) {
  const { push } = useToast();
  const [value, setValue] = useState("");
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  useEffect(() => { setValue(setting?.value ?? ""); setReason(""); setCode(""); }, [setting?.id]);
  if (!setting) return null;
  const freeText = setting.valueKind === "text" || setting.valueKind === "window" || setting.valueKind === "boolean";
  return (
    <Modal open onClose={onClose} tone="amber" icon="bi-sliders" size="sm" title={`Edit — ${setting.key}`}
      subtitle={`${setting.id} · ${setting.group} · current: ${setting.value}`}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={value.trim() === setting.value || !reasonOk(reason) || code !== CODE} onClick={() => {
          onDone(setting.id, value.trim(), reason);
          push({ kind: "warn", title: "Change request filed", body: `${setting.key}: ${setting.value} → ${value.trim()} awaits approvals.` });
          onClose();
        }}><i className="bi bi-send me-1" />File change request</button>
      </>}>
      <div className="pm-modal-body">
        <div className="pm-note mb-3"><i className="bi bi-info-circle me-1" />{setting.note}</div>
        <label className="form-label">New value <span style={{ color: "#f04438" }}>*</span></label>
        {setting.valueKind === "duration" && setting.id === "RCF-01" ? (
          <div className="d-flex gap-1 mb-3">{["12 hours", "24 hours", "48 hours", "72 hours"].map((h) => (
            <button key={h} className={`pm-chip ${value === h ? "active" : ""}`} onClick={() => setValue(h)}>{h}</button>
          ))}</div>
        ) : setting.valueKind === "number" ? (
          <input type="number" className="form-control mb-3 mono" value={value} onChange={(e) => setValue(e.target.value)} />
        ) : freeText ? (
          <input className="form-control mb-3" value={value} onChange={(e) => setValue(e.target.value)} />
        ) : (
          <input className="form-control mb-3 mono" value={value} onChange={(e) => setValue(e.target.value)} />
        )}
        <label className="form-label">Reason (min 8 chars · goes to approvals) <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control mb-3" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Evidence · stakeholder sign-off" />
        <TwoFactorField value={code} onChange={setCode} />
      </div>
    </Modal>
  );
}

/* ================================================================
   39. Proration calculator
   ================================================================ */
export function ProrationModal({ plans, open, onClose }: { plans: Plan[]; open: boolean; onClose: () => void }) {
  const [planId, setPlanId] = useState("");
  const [day, setDay] = useState(15);
  useEffect(() => { setPlanId(""); setDay(15); }, [open]);
  if (!open) return null;
  const plan = plans.find((p) => p.id === planId);
  const daily = plan ? plan.price / 30 : 0;
  const used = Math.round(daily * day);
  const credit = plan ? Math.max(0, plan.price - used) : 0;
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-calculator" size="sm" title="Proration calculator"
      subtitle="What a mid-cycle change costs or credits (RCF-11)"
      footer={<button className="btn btn-outline-secondary btn-sm" onClick={onClose}><i className="bi bi-x-lg me-1" />Close</button>}>
      <div className="pm-modal-body">
        <label className="form-label">Plan</label>
        <select className="form-select mb-3" value={planId} onChange={(e) => setPlanId(e.target.value)}>
          <option value="">Select plan…</option>
          {plans.filter((p) => p.proration).map((p) => <option key={p.id} value={p.id}>{p.name} — KES {p.price.toLocaleString("en-KE")}</option>)}
        </select>
        <label className="form-label">Switching on day <b className="mono">{day}</b> of 30</label>
        <input type="range" className="form-range mb-3" min={1} max={30} value={day} onChange={(e) => setDay(Number(e.target.value))} />
        {plan ? (
          <div className="pm-card" style={{ padding: ".7rem .9rem" }}>
            <div className="d-flex justify-content-between py-1"><span className="pm-td-sub">Daily rate</span><span className="mono">KES {daily.toFixed(2)}</span></div>
            <div className="d-flex justify-content-between py-1"><span className="pm-td-sub">Used (days 1–{day})</span><span className="mono">KES {used.toLocaleString("en-KE")}</span></div>
            <div className="d-flex justify-content-between py-1" style={{ borderTop: "1px solid #eef2f6" }}><span className="pm-td-strong">Credit on downgrade/cancel</span><span className="mono" style={{ color: "#12b76a", fontWeight: 600 }}>KES {credit.toLocaleString("en-KE")}</span></div>
            <div className="d-flex justify-content-between py-1"><span className="pm-td-strong">Charge on upgrade</span><span className="mono" style={{ color: "#b54708", fontWeight: 600 }}>KES {Math.max(0, plan.price - credit).toLocaleString("en-KE")}</span></div>
          </div>
        ) : (
          <div className="pm-note mb-0"><i className="bi bi-info-circle me-1" />Pick a proration-enabled plan ({plans.filter((p) => p.proration).length} of {plans.length}).</div>
        )}
        <div className="pm-note mt-3 mb-0"><i className="bi bi-calendar3 me-1" />Day 29/30/31 mandates anchor to month-end; February uses 28/29.</div>
      </div>
    </Modal>
  );
}

/* ================================================================
   40. Request detail
   ================================================================ */
export function RequestDetailModal({ request, onClose }: { request: ChangeRequest | null; onClose: () => void }) {
  if (!request) return null;
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-file-earmark-text" size="md" title={`Change request — ${request.id}`}
      subtitle={`${request.subject} · ${request.requestedBy} · ${request.requestedAt}`}
      footer={<button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>}>
      <div className="pm-modal-body">
        <div className="pm-card mb-3" style={{ padding: ".7rem .9rem" }}>
          <div className="pm-td-sub">Change</div>
          <div className="pm-td-strong">{request.subject}</div>
          <div className="mono" style={{ fontSize: ".82rem" }}>{request.from} <i className="bi bi-arrow-right mx-1" style={{ color: "#12b76a" }} /> {request.to}</div>
        </div>
        <div className="d-flex gap-2 mb-3 align-items-center">
          <Badge tone={request.risk === "High" ? "red" : request.risk === "Medium" ? "amber" : "green"} dot>{request.risk} risk</Badge>
          <Badge tone={statusTone(request.status)} dot>{request.status}</Badge>
        </div>
        <label className="form-label">Reason</label>
        <div className="pm-note mb-3"><i className="bi bi-quote me-1" />{request.reason}</div>
        <label className="form-label">Sign-offs</label>
        <div className="pm-card" style={{ padding: ".5rem .9rem" }}>
          {request.approvals.map((a) => (
            <div key={a.role} className="d-flex justify-content-between align-items-center py-1" style={{ borderBottom: "1px solid #eef2f6" }}>
              <span className="pm-td-sub">{a.role} — {a.who}</span>
              <Badge tone={a.state === "Approved" ? "green" : a.state === "Rejected" ? "red" : "amber"} dot>{a.state}</Badge>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

/* ================================================================
   41. Approve (Super Admin final gate)
   ================================================================ */
export function ApproveModal({ request, onClose, onDone }: { request: ChangeRequest | null; onClose: () => void; onDone: (id: string) => void }) {
  const { push } = useToast();
  const [code, setCode] = useState("");
  useEffect(() => { setCode(""); }, [request?.id]);
  if (!request) return null;
  return (
    <Modal open onClose={onClose} tone="green" icon="bi-check2-circle" size="sm" title={`Approve — ${request.id}`}
      subtitle={`${request.subject}: ${request.from} → ${request.to}`}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={code !== CODE} onClick={() => {
          onDone(request.id);
          push({ kind: "success", title: "Change approved", body: `${request.subject} joins the next deploy window.` });
          onClose();
        }}><i className="bi bi-check2 me-1" />Approve change</button>
      </>}>
      <div className="pm-modal-body">
        <div className="pm-note mb-3"><i className="bi bi-shield-check me-1" />Your Super Admin approval satisfies the final gate. The change becomes eligible for the next deploy window and is logged with your name.</div>
        <TwoFactorField value={code} onChange={setCode} />
      </div>
    </Modal>
  );
}

/* ================================================================
   42. Reject
   ================================================================ */
export function RejectModal({ request, onClose, onDone }: { request: ChangeRequest | null; onClose: () => void; onDone: (id: string, reason: string) => void }) {
  const { push } = useToast();
  const [reason, setReason] = useState("");
  useEffect(() => { setReason(""); }, [request?.id]);
  if (!request) return null;
  return (
    <Modal open onClose={onClose} tone="red" icon="bi-x-circle" size="sm" title={`Reject — ${request.id}`}
      subtitle={`${request.subject} · requester is notified with your reason`}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger btn-sm" disabled={!reasonOk(reason)} onClick={() => {
          onDone(request.id, reason);
          push({ kind: "warn", title: "Change rejected", body: `${request.subject} rejected — requester notified.` });
          onClose();
        }}><i className="bi bi-x me-1" />Reject change</button>
      </>}>
      <div className="pm-modal-body">
        <label className="form-label">Rejection reason (min 8 chars) <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="What evidence is missing or risky?" />
      </div>
    </Modal>
  );
}

/* ================================================================
   43. New change request (manual)
   ================================================================ */
export function NewRequestModal({ config, open, onClose, onDone }: { config: ConfigSetting[]; open: boolean; onClose: () => void; onDone: (subject: string, from: string, to: string, reason: string, risk: string) => void }) {
  const { push } = useToast();
  const [subject, setSubject] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [risk, setRisk] = useState("Medium");
  const [reason, setReason] = useState("");
  useEffect(() => { setSubject(""); setFrom(""); setTo(""); setRisk("Medium"); setReason(""); }, [open]);
  if (!open) return null;
  return (
    <Modal open onClose={onClose} tone="amber" icon="bi-plus-circle" size="sm" title="Request a recurring change"
      subtitle="Files into the approvals queue · deploy after sign-off"
      footer={<>
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={!subject || to.trim().length < 2 || !reasonOk(reason)} onClick={() => {
          onDone(subject, from, to.trim(), reason, risk);
          push({ kind: "success", title: "CR filed", body: `${subject}: ${from || "—"} → ${to.trim()} queued for approvals.` });
          onClose();
        }}><i className="bi bi-send me-1" />Submit request</button>
      </>}>
      <div className="pm-modal-body">
        <label className="form-label">Setting <span style={{ color: "#f04438" }}>*</span></label>
        <select className="form-select mb-3" value={subject} onChange={(e) => { setSubject(e.target.value); const c = config.find((x) => x.key === e.target.value); if (c) setFrom(c.value); }}>
          <option value="">Select setting…</option>
          {config.filter((c) => c.editable).map((c) => <option key={c.id} value={c.key}>{c.key}</option>)}
        </select>
        <div className="row g-2 mb-3">
          <div className="col-6">
            <label className="form-label">From</label>
            <input className="form-control" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="col-6">
            <label className="form-label">To <span style={{ color: "#f04438" }}>*</span></label>
            <input className="form-control" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        <label className="form-label">Risk</label>
        <div className="d-flex gap-1 mb-3">{["Low", "Medium", "High"].map((r) => (
          <button key={r} className={`pm-chip ${risk === r ? "active" : ""}`} onClick={() => setRisk(r)}>{r}</button>
        ))}</div>
        <label className="form-label">Reason (min 8 chars) <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
      </div>
    </Modal>
  );
}

/* ================================================================
   44. Export picker
   ================================================================ */
export function ExportModal({ open, onClose, onExport }: { open: boolean; onClose: () => void; onExport: (kind: string) => void }) {
  const sets = [
    { id: "services", label: "Services overview", icon: "bi-grid", rows: "10 rows · subscribers/MRR/churn" },
    { id: "plans", label: "Plans & pricing", icon: "bi-collection", rows: "9 rows · price/features/MRR" },
    { id: "mandates", label: "Mandates", icon: "bi-arrow-repeat", rows: "18 rows · amounts/schedule/status" },
    { id: "failed", label: "Failed payments queue", icon: "bi-exclamation-triangle", rows: "16 rows · retries/dunning" },
    { id: "dunning", label: "Dunning campaigns", icon: "bi-megaphone", rows: "6 rows · conversion/sends" },
    { id: "config", label: "Configuration", icon: "bi-sliders", rows: "15 settings · current values" },
    { id: "audit", label: "Audit trail", icon: "bi-journal-check", rows: "full trail · 7-year retention" },
  ];
  if (!open) return null;
  return (
    <Modal open onClose={onClose} tone="green" icon="bi-download" size="md" title="Export recurring data"
      subtitle="CSV downloads · board pack ready"
      footer={<button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>}>
      <div className="pm-modal-body">
        <div className="row g-2">
          {sets.map((s) => (
            <div className="col-6" key={s.id}>
              <button className="pm-opt w-100" onClick={() => onExport(s.id)}>
                <i className={`bi ${s.icon}`} />
                <div className="text-start"><div className="pm-td-strong">{s.label}</div><div className="pm-td-sub">{s.rows}</div></div>
                <i className="bi bi-download ms-auto pm-td-sub" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

/* ================================================================
   45. Generic typed-delete confirm
   ================================================================ */
export function DeleteConfirmModal({ target, onClose, onDone }: { target: { kind: string; id: string; name: string; hint?: string } | null; onClose: () => void; onDone: (id: string, reason: string) => void }) {
  const { push } = useToast();
  const [typed, setTyped] = useState("");
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  useEffect(() => { setTyped(""); setReason(""); setCode(""); }, [target?.id]);
  if (!target) return null;
  return (
    <Modal open onClose={onClose} tone="red" icon="bi-trash3" size="sm" title={`Delete ${target.kind} — ${target.name}`}
      subtitle={target.hint ?? `${target.id} · this cannot be undone`}
      footer={<>
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Keep it</button>
        <button className="btn btn-danger btn-sm" disabled={typed !== target.id || !reasonOk(reason) || code !== CODE} onClick={() => {
          onDone(target.id, reason);
          push({ kind: "warn", title: `${target.kind} deleted`, body: `${target.name} removed — audit entry retained.` });
          onClose();
        }}><i className="bi bi-trash3 me-1" />Delete permanently</button>
      </>}>
      <div className="pm-modal-body">
        <div className="pm-alert-row warn mb-3">
          <i className="bi bi-exclamation-triangle-fill" style={{ color: "#f04438" }} />
          <div><b style={{ fontSize: ".8rem" }}>Permanent deletion</b>
            <div className="pm-td-sub">Audit history survives, the record does not. Prefer retire/pause where possible.</div></div>
        </div>
        <label className="form-label">Type <b className="mono">{target.id}</b> to confirm <span style={{ color: "#f04438" }}>*</span></label>
        <input className="form-control mb-3 mono" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={target.id} />
        <label className="form-label">Reason (min 8 chars) <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control mb-3" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
        <TwoFactorField value={code} onChange={setCode} />
      </div>
    </Modal>
  );
}
